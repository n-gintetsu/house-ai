import { supabaseAdmin } from '../_adminAuth.js'
import { requireOrgOwner } from '../_userAuth.js'

// 読み取り専用。契約の作成・変更はここでは行わない。
// Stripe の識別子（stripe_customer_id / stripe_subscription_id / stripe_status）と
// billing_exempt はクライアントに渡さない。select する列自体もここに絞る。
const COLUMNS = 'status, trial_started_at, trial_ends_at, current_period_end, cancel_at_period_end'

/**
 * Vercel Serverless Function: GET /api/billing/status
 * 自分がオーナーの組織の契約状態を返す。org_id はクライアントから受け取らない。
 */
export default async function handler(req, res) {
  // 1. メソッド確認
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // 2. 本人確認＋組織の特定（失敗時はレスポンス送信済み）
  const ctx = await requireOrgOwner(req, res)
  if (!ctx) return

  // 3. オーナーの組織が無い場合はここで終了（これ以上 DB を引かない）
  if (!ctx.org) {
    return res.status(200).json({ isOwner: false, canManageBilling: false })
  }

  // 4. DB 操作（必要な列のみ）
  const { data: row, error } = await supabaseAdmin
    .from('organization_subscriptions')
    .select(COLUMNS)
    .eq('org_id', ctx.org.id)
    .limit(1)
    .maybeSingle()
  if (error) {
    console.error('[billing/status] select error:', JSON.stringify(error))
    return res.status(500).json({ error: 'db_error' })
  }

  // 5. 行が無いのは未開設＝正常系。404 や trial_expired にはしない
  if (!row) {
    return res.status(200).json({
      isOwner: true,
      hasSubscriptionRecord: false,
      canManageBilling: true,
    })
  }

  // 6. DB 行をそのまま返さず、返す項目だけを明示的に組み立てる
  return res.status(200).json({
    isOwner: true,
    hasSubscriptionRecord: true,
    status: row.status,
    trialStartedAt: row.trial_started_at,
    trialEndsAt: row.trial_ends_at,
    currentPeriodEnd: row.current_period_end,
    cancelAtPeriodEnd: row.cancel_at_period_end,
    canManageBilling: true,
  })
}
