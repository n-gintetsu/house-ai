import Stripe from 'stripe'
import { supabaseAdmin } from '../_adminAuth.js'

// Stripe の生 status をアプリの status に変換する。
// trialing / trial_expired は Stripe に存在しないアプリ固有の状態なので、ここには現れない。
const STRIPE_STATUS_MAP = {
  active: 'active',
  trialing: 'active',
  past_due: 'past_due',
  unpaid: 'past_due',
  incomplete: 'past_due',
  paused: 'past_due',
  canceled: 'canceled',
  incomplete_expired: 'canceled',
}

const STALE_MINUTES = 5

// Vercel の自動パースを無効化し、署名検証用の生バイト列を保つ
export const config = { api: { bodyParser: false } }

async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', chunk => chunks.push(chunk))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

function nowIso() {
  return new Date().toISOString()
}

async function markEventDone(eventId) {
  const { error } = await supabaseAdmin
    .from('stripe_webhook_events')
    .update({ status: 'done', updated_at: nowIso() })
    .eq('stripe_event_id', eventId)
  if (error) {
    console.error('[billing/webhook] failed to mark done:', eventId, JSON.stringify(error))
  }
}

async function markEventFailed(eventId, reason) {
  const { error } = await supabaseAdmin
    .from('stripe_webhook_events')
    .update({
      status: 'failed',
      last_error: String(reason || '').slice(0, 500),
      updated_at: nowIso(),
    })
    .eq('stripe_event_id', eventId)
  if (error) {
    console.error('[billing/webhook] failed to mark failed:', eventId, JSON.stringify(error))
  }
}

// customer は subscription / invoice / checkout.session いずれも obj.customer に入る。
// 展開されている場合はオブジェクトなので id を取り出す。
function extractCustomerId(obj) {
  if (!obj || !obj.customer) return null
  if (typeof obj.customer === 'string') return obj.customer
  return obj.customer.id || null
}

// 紐付けが見つからないとき、それが Workspace のイベントかどうかを判定する。
// Stripe はイベント順序を保証しないため、紐付け完成前に届くことがある。
// client_reference_id は Workspace 固有ではない（同一Stripeアカウントの他プロダクトも使い得る）ため判定に使わない。
function looksLikeWorkspaceEvent(event, obj, priceId) {
  if (obj && obj.metadata && obj.metadata.product === 'workspace') return true
  if (obj && obj.items && obj.items.data) {
    for (let i = 0; i < obj.items.data.length; i++) {
      const item = obj.items.data[i]
      if (item && item.price && item.price.id === priceId) return true
    }
  }
  return false
}

// subscription ID の位置はオブジェクトの種類によって違う
function extractSubscriptionId(obj) {
  if (!obj) return null
  if (obj.object === 'subscription') return obj.id || null
  if (typeof obj.subscription === 'string') return obj.subscription
  if (obj.subscription && obj.subscription.id) return obj.subscription.id
  // invoice の新しい形。parent.subscription_details.subscription に入る
  if (obj.parent && obj.parent.subscription_details) {
    const s = obj.parent.subscription_details.subscription
    if (typeof s === 'string') return s
    if (s && s.id) return s.id
  }
  return null
}

/**
 * Vercel Serverless Function: POST /api/billing/webhook
 * 署名を検証し、冪等に organization_subscriptions を Stripe の最新状態へ同期する。
 * billing_exempt / trial_started_at / trial_ends_at は書き換えない。
 */
export default async function handler(req, res) {
  // 1. メソッド確認
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // 2. env 確認
  const secretKey = process.env.STRIPE_SECRET_KEY
  const webhookSecret = process.env.STRIPE_WORKSPACE_WEBHOOK_SECRET
  const priceId = process.env.STRIPE_WORKSPACE_PRICE_ID
  if (!secretKey || !webhookSecret || !priceId) {
    console.error('[billing/webhook] stripe env is not configured')
    return res.status(500).json({ error: 'stripe_not_configured' })
  }

  const stripe = new Stripe(secretKey)

  // 3. 署名検証
  const rawBody = await getRawBody(req)
  const sig = req.headers['stripe-signature']

  let event
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret)
  } catch (err) {
    console.error('[billing/webhook] signature verification failed:', err.message)
    return res.status(400).json({ error: 'invalid_signature' })
  }

  // 4. 冪等性の判定
  const { data: existing, error: existErr } = await supabaseAdmin
    .from('stripe_webhook_events')
    .select('status, updated_at, attempt_count')
    .eq('stripe_event_id', event.id)
    .limit(1)
    .maybeSingle()
  if (existErr) {
    console.error('[billing/webhook] event select error:', JSON.stringify(existErr))
    return res.status(500).json({ error: 'db_error' })
  }

  if (!existing) {
    const { error: insErr } = await supabaseAdmin
      .from('stripe_webhook_events')
      .insert({
        stripe_event_id: event.id,
        event_type: event.type,
        status: 'processing',
        attempt_count: 1,
        received_at: nowIso(),
        updated_at: nowIso(),
      })
    if (insErr) {
      // 別プロセスが同時に処理を開始した
      if (insErr.code === '23505') {
        return res.status(200).json({ received: true })
      }
      console.error('[billing/webhook] event insert error:', JSON.stringify(insErr))
      return res.status(500).json({ error: 'db_error' })
    }
  } else if (existing.status === 'done') {
    return res.status(200).json({ received: true })
  } else {
    if (existing.status === 'processing') {
      const t = existing.updated_at ? new Date(existing.updated_at).getTime() : NaN
      const isStale = isNaN(t) ? true : (Date.now() - t > STALE_MINUTES * 60 * 1000)
      if (!isStale) {
        // 別プロセスが処理中
        return res.status(200).json({ received: true })
      }
    }
    // failed、または stale な processing は再処理する
    const { error: reErr } = await supabaseAdmin
      .from('stripe_webhook_events')
      .update({
        status: 'processing',
        attempt_count: (existing.attempt_count || 0) + 1,
        updated_at: nowIso(),
      })
      .eq('stripe_event_id', event.id)
    if (reErr) {
      console.error('[billing/webhook] event reprocess update error:', JSON.stringify(reErr))
      return res.status(500).json({ error: 'db_error' })
    }
  }

  try {
    const obj = event.data && event.data.object ? event.data.object : null

    // 5. org の特定（DB の紐付けを主とする）
    const customerId = extractCustomerId(obj)

    let orgRow = null
    if (customerId) {
      const { data: found, error: findErr } = await supabaseAdmin
        .from('organization_subscriptions')
        .select('org_id')
        .eq('stripe_customer_id', customerId)
        .limit(1)
        .maybeSingle()
      if (findErr) {
        console.error('[billing/webhook] org lookup error:', JSON.stringify(findErr))
        await markEventFailed(event.id, 'org lookup error: ' + (findErr.message || 'db_error'))
        return res.status(500).json({ error: 'db_error' })
      }
      orgRow = found || null
    }

    if (!orgRow) {
      if (looksLikeWorkspaceEvent(event, obj, priceId)) {
        // Workspace のイベントのはずなのに紐付けが無い。順序の入れ替わりの可能性があるため再送させる
        console.error(
          '[billing/webhook] workspace event without org link:',
          'id=' + event.id,
          'type=' + event.type,
          'customer=' + (customerId || 'none')
        )
        await markEventFailed(event.id, 'workspace event without org link (customer=' + (customerId || 'none') + ')')
        return res.status(500).json({ error: 'unlinked_workspace_event' })
      }
      // 他プロダクト（Area 等）のイベント。対象外
      console.log(
        '[billing/webhook] skipped non-workspace event:',
        'id=' + event.id,
        'type=' + event.type,
        'customer=' + (customerId || 'none')
      )
      await markEventDone(event.id)
      return res.status(200).json({ received: true })
    }

    // 6. Stripe から最新状態を再取得して同期
    const subId = extractSubscriptionId(obj)
    if (!subId) {
      // 単発 invoice など。同期する対象が無い
      console.log(
        '[billing/webhook] no subscription to sync:',
        'id=' + event.id,
        'type=' + event.type
      )
      await markEventDone(event.id)
      return res.status(200).json({ received: true })
    }

    const sub = await stripe.subscriptions.retrieve(subId)

    // current_period_end は subscription 直下ではなく items.data[0] にある（確認済み）
    let currentPeriodEnd = null
    if (sub.items && sub.items.data && sub.items.data[0] && sub.items.data[0].current_period_end) {
      currentPeriodEnd = new Date(sub.items.data[0].current_period_end * 1000).toISOString()
    }

    // billing_exempt / trial_started_at / trial_ends_at は更新しない
    const payload = {
      status: STRIPE_STATUS_MAP[sub.status] || 'past_due',
      stripe_status: sub.status,
      stripe_subscription_id: sub.id,
      current_period_end: currentPeriodEnd,
      cancel_at_period_end: sub.cancel_at_period_end === true,
      updated_at: nowIso(),
    }

    const { data: updated, error: syncErr } = await supabaseAdmin
      .from('organization_subscriptions')
      .update(payload)
      .eq('org_id', orgRow.org_id)
      .select('org_id')
    if (syncErr) {
      console.error('[billing/webhook] sync update error:', JSON.stringify(syncErr))
      await markEventFailed(event.id, 'sync update error: ' + (syncErr.message || 'db_error'))
      return res.status(500).json({ error: 'db_error' })
    }
    if (!updated || updated.length === 0) {
      console.error('[billing/webhook] sync updated 0 rows for org:', orgRow.org_id, 'event=' + event.id)
      await markEventFailed(event.id, 'sync updated 0 rows for org ' + orgRow.org_id)
      return res.status(500).json({ error: 'sync_failed' })
    }

    // 7. 成功
    await markEventDone(event.id)
    return res.status(200).json({ received: true })
  } catch (e) {
    // 8. 失敗は 200 で握りつぶさず、Stripe に再送させる
    console.error('[billing/webhook] processing error:', 'id=' + event.id, 'type=' + event.type, (e && e.message) || String(e))
    await markEventFailed(event.id, (e && e.message) || String(e))
    return res.status(500).json({ error: 'processing_error' })
  }
}
