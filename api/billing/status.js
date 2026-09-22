import { supabaseAdmin } from '../_adminAuth.js'
import { requireOrgOwner } from '../_userAuth.js'

// 読み取り専用。契約の作成・変更はここでは行わない。
// stripe_customer_id は canOpenPortal の判定にのみ使い、値はレスポンスに含めない。
// stripe_subscription_id / stripe_status は select しない。
// billing_exempt も effectiveStatus と canOpenPortal の計算にのみ使い、レスポンスには含めない。
const COLUMNS = 'status, billing_exempt, stripe_customer_id, trial_started_at, trial_ends_at, current_period_end, cancel_at_period_end'

// Customer Portal を開けるか。api/billing/portal.js の許可条件と同じものを使う。
// （billing_exempt でない / status が active または past_due / Stripe の顧客がある）
function computeCanOpenPortal(row) {
  if (!row) return false
  if (row.billing_exempt === true) return false
  if (row.status !== 'active' && row.status !== 'past_due') return false
  if (!row.stripe_customer_id) return false
  return true
}

// DB の status 文字列をそのまま信じると、期限切れの trialing を「Trial中」と
// 表示しながら RLS には拒否される、という食い違いが起きる。実効値はここで確定させる。
function computeEffectiveStatus(row) {
  if (!row) return null
  if (row.billing_exempt === true) return 'active'
  if (row.status === 'trialing') {
    const ends = row.trial_ends_at ? new Date(row.trial_ends_at).getTime() : NaN
    if (isNaN(ends) || ends <= Date.now()) return 'trial_expired'
    return 'trialing'
  }
  return row.status
}

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
    return res.status(200).json({
      isOwner: false,
      canManageBilling: false,
      hasOrganization: false,
      effectiveStatus: null,
      canCreateWorkspace: false,
      canOpenPortal: false,
      needsTrialStart: true,
    })
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
      hasOrganization: true,
      effectiveStatus: null,
      canCreateWorkspace: false,
      canOpenPortal: false,
      needsTrialStart: true,
    })
  }

  // 6. DB 行をそのまま返さず、返す項目だけを明示的に組み立てる
  const effectiveStatus = computeEffectiveStatus(row)
  return res.status(200).json({
    isOwner: true,
    hasSubscriptionRecord: true,
    status: row.status,
    trialStartedAt: row.trial_started_at,
    trialEndsAt: row.trial_ends_at,
    currentPeriodEnd: row.current_period_end,
    cancelAtPeriodEnd: row.cancel_at_period_end,
    canManageBilling: true,
    hasOrganization: true,
    effectiveStatus: effectiveStatus,
    canCreateWorkspace: effectiveStatus === 'active' || effectiveStatus === 'trialing',
    canOpenPortal: computeCanOpenPortal(row),
    needsTrialStart: false,
  })
}
