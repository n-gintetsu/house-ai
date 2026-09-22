import Stripe from 'stripe'
import { supabaseAdmin } from '../_adminAuth.js'
import { requireOrgOwner } from '../_userAuth.js'

// 契約に必要な列のみ。Stripe の識別子はここでの判定に使うだけでクライアントには返さない。
const COLUMNS = 'status, billing_exempt, stripe_customer_id, stripe_subscription_id'
const DEFAULT_ORIGIN = 'https://house-ai.co.jp'

/**
 * Vercel Serverless Function: POST /api/billing/checkout
 * 自分がオーナーの組織の Checkout Session を作る。
 * org_id / price / customer / metadata はリクエストから一切受け取らない。
 */
export default async function handler(req, res) {
  // 1. メソッド確認
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // 2. env の存在確認（価格・税率はサーバー側の固定値のみを使う）
  const secretKey = process.env.STRIPE_SECRET_KEY
  const priceId = process.env.STRIPE_WORKSPACE_PRICE_ID
  const taxRateId = process.env.STRIPE_WORKSPACE_TAX_RATE_ID
  if (!secretKey || !priceId || !taxRateId) {
    console.error('[billing/checkout] stripe env is not configured')
    return res.status(500).json({ error: 'stripe_not_configured' })
  }

  // 3. 本人確認＋組織の特定（失敗時はレスポンス送信済み）
  const ctx = await requireOrgOwner(req, res)
  if (!ctx) return
  if (!ctx.org) {
    return res.status(403).json({ error: 'not_owner' })
  }

  // 4. 契約行の取得
  const { data: row, error: rowErr } = await supabaseAdmin
    .from('organization_subscriptions')
    .select(COLUMNS)
    .eq('org_id', ctx.org.id)
    .limit(1)
    .maybeSingle()
  if (rowErr) {
    console.error('[billing/checkout] select error:', JSON.stringify(rowErr))
    return res.status(500).json({ error: 'db_error' })
  }
  if (!row) {
    // Workspace 未開設。トライアル開始の導線は別フェーズ
    return res.status(409).json({ error: 'no_subscription_record' })
  }

  // 5. 契約の二重作成を防ぐ（この順に判定する）
  if (row.billing_exempt === true) {
    return res.status(403).json({ error: 'billing_exempt' })
  }
  if (row.status === 'active') {
    return res.status(409).json({ error: 'already_active' })
  }
  if (row.stripe_subscription_id !== null) {
    return res.status(409).json({ error: 'subscription_exists' })
  }

  const stripe = new Stripe(secretKey)

  // 6. Stripe Customer の用意（既存があれば再利用し、新規作成しない）
  let customerId = row.stripe_customer_id
  if (!customerId) {
    let created
    try {
      created = await stripe.customers.create({
        email: ctx.email,
        metadata: { workspace_org_id: ctx.org.id, product: 'workspace' },
      })
    } catch (e) {
      console.error('[billing/checkout] customers.create error:', e)
      return res.status(500).json({ error: 'stripe_error' })
    }

    // DB に保存できたことを確認してから先へ進む。
    // 未保存のまま Session を作ると、Webhook で org を特定できなくなる。
    const { data: linked, error: linkErr } = await supabaseAdmin
      .from('organization_subscriptions')
      .update({ stripe_customer_id: created.id, updated_at: new Date().toISOString() })
      .eq('org_id', ctx.org.id)
      .select('org_id')
    if (linkErr) {
      console.error('[billing/checkout] customer link error:', JSON.stringify(linkErr))
      return res.status(500).json({ error: 'customer_link_failed' })
    }
    if (!linked || linked.length === 0) {
      console.error('[billing/checkout] customer link updated 0 rows for org:', ctx.org.id)
      return res.status(500).json({ error: 'customer_link_failed' })
    }

    customerId = created.id
  }

  // 7. Checkout Session の作成
  const origin = req.headers.origin || DEFAULT_ORIGIN
  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      client_reference_id: ctx.org.id,
      metadata: { workspace_org_id: ctx.org.id, product: 'workspace' },
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: {
        default_tax_rates: [taxRateId],
        metadata: { workspace_org_id: ctx.org.id, product: 'workspace' },
      },
      success_url: origin + '/settings?tab=billing&checkout=success',
      cancel_url: origin + '/settings?tab=billing&checkout=cancel',
    })

    // 8. 成功
    return res.status(200).json({ url: session.url })
  } catch (e) {
    console.error('[billing/checkout] checkout.sessions.create error:', e)
    return res.status(500).json({ error: 'stripe_error' })
  }
}
