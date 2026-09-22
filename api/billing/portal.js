import Stripe from 'stripe'
import { supabaseAdmin } from '../_adminAuth.js'
import { requireOrgOwner } from '../_userAuth.js'

// 判定に必要な列のみ。Stripe の識別子はここでの判定に使うだけでクライアントには返さない。
const COLUMNS = 'status, billing_exempt, stripe_customer_id'
// 戻り先は固定。Origin を信用しないため、リクエストのヘッダーからは組み立てない。
const RETURN_URL = 'https://www.house-ai.co.jp/settings?tab=billing'
// Customer Portal を開ける契約状態。支払い方法の更新が意味を持つのはこの2つだけ。
const PORTAL_STATUSES = ['active', 'past_due']

/**
 * Vercel Serverless Function: POST /api/billing/portal
 * 自分がオーナーの組織の Customer Portal Session を作る。
 * org_id / customer / return_url はリクエストから一切受け取らない。
 * このエンドポイントは DB を書き換えない（読み取りのみ）。
 */
export default async function handler(req, res) {
  // 1. メソッド確認
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // 2. env の存在確認
  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) {
    console.error('[billing/portal] stripe env is not configured')
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
    console.error('[billing/portal] select error:', JSON.stringify(rowErr))
    return res.status(500).json({ error: 'db_error' })
  }
  if (!row) {
    // Workspace 未開設。開く対象の契約が無い
    return res.status(409).json({ error: 'no_subscription_record' })
  }

  // 5. Portal を開ける条件（この順に判定する）
  if (row.billing_exempt === true) {
    return res.status(403).json({ error: 'billing_exempt' })
  }
  if (PORTAL_STATUSES.indexOf(row.status) === -1) {
    // trialing / trial_expired / canceled は Portal ではなく Checkout の導線
    return res.status(409).json({ error: 'portal_not_available' })
  }
  if (!row.stripe_customer_id) {
    // Stripe 側の顧客が未作成。Portal は開けない
    return res.status(409).json({ error: 'no_customer' })
  }

  const stripe = new Stripe(secretKey)

  // 6. Customer Portal Session の作成（configuration は渡さず Stripe の既定設定を使う）
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: row.stripe_customer_id,
      return_url: RETURN_URL,
    })

    // 7. 成功
    return res.status(200).json({ url: session.url })
  } catch (e) {
    console.error('[billing/portal] billingPortal.sessions.create error:', e)
    return res.status(500).json({ error: 'stripe_error' })
  }
}
