import { createClient } from '@supabase/supabase-js'

// 管理者メール。将来 DB の admin ロールへ移行する場合は requireAdmin 内の判定1箇所だけを差し替える
const ADMIN_EMAILS = ['gintetsu.fudosan@gmail.com']

export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

/**
 * Bearer トークンから本人を特定し、管理者かどうかを判定する。
 * 失敗時はレスポンスを送信したうえで null を返す（呼び出し側は null なら即 return すること）。
 * email は必ず getUser の結果から取る。req.body / req.headers の自己申告値は使わない。
 */
export async function requireAdmin(req, res) {
  const authHeader = req.headers.authorization || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''
  if (!token) {
    res.status(401).json({ error: 'no_token' })
    return null
  }

  const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token)
  if (userErr || !userData || !userData.user) {
    res.status(401).json({ error: 'invalid_token' })
    return null
  }

  const user = userData.user

  // 管理者判定（この1箇所のみ）
  if (!ADMIN_EMAILS.includes(user.email || '')) {
    res.status(403).json({ error: 'not_admin' })
    return null
  }

  return { userId: user.id, email: user.email }
}

/**
 * 管理操作を admin_audit_log に記録する。
 * 監査ログの失敗で本処理を止めないため、エラーは throw せずログ出力のみ。
 */
export async function writeAuditLog({ adminUserId, adminEmail, action, targetType, targetId, detail }) {
  try {
    const { error } = await supabaseAdmin.from('admin_audit_log').insert({
      admin_user_id: adminUserId,
      admin_email: adminEmail,
      action,
      target_type: targetType,
      target_id: targetId,
      detail,
    })
    if (error) {
      console.error('[admin_audit_log] insert failed:', JSON.stringify(error))
    }
  } catch (e) {
    console.error('[admin_audit_log] insert error:', e)
  }
}
