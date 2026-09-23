import { supabaseAdmin } from '../../_adminAuth.js'
import { requireUser } from '../../_userAuth.js'

// 画面に返すのは「連携しているか」「いつ連携したか」「通知がONか」の3点だけ。
// LINE 側の識別子や照合用のハッシュ、期限は select もせず、レスポンスにも含めない。
const CONNECTION_COLUMNS = 'connected_at'
const SETTINGS_COLUMNS = 'line_confirm_request'

/**
 * Vercel Serverless Function: GET /api/notifications/line/status
 * ログイン済みユーザー自身の LINE 連携状態を返す。
 * 対象ユーザーはセッションから決まり、リクエストの body / query は読まない。
 */
export default async function handler(req, res) {
  // 1. メソッド確認
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // 2. 本人確認（失敗時はレスポンス送信済み）
  const ctx = await requireUser(req, res)
  if (!ctx) return
  if (!ctx.userId) {
    return res.status(401).json({ error: 'no_user' })
  }

  // 3. 連携状態（active の行があれば連携済み）
  const { data: connection, error: connErr } = await supabaseAdmin
    .from('workspace_line_connections')
    .select(CONNECTION_COLUMNS)
    .eq('user_id', ctx.userId)
    .eq('status', 'active')
    .limit(1)
    .maybeSingle()
  if (connErr) {
    console.error('[line/status] connection select error:', JSON.stringify(connErr))
    return res.status(500).json({ error: 'db_error' })
  }

  // 4. 通知設定（行が無いユーザーは既定でON。null も未設定としてON扱い）
  const { data: settings, error: settingsErr } = await supabaseAdmin
    .from('workspace_notification_settings')
    .select(SETTINGS_COLUMNS)
    .eq('user_id', ctx.userId)
    .limit(1)
    .maybeSingle()
  if (settingsErr) {
    console.error('[line/status] settings select error:', JSON.stringify(settingsErr))
    return res.status(500).json({ error: 'db_error' })
  }

  let enabled = true
  if (settings && settings.line_confirm_request === false) {
    enabled = false
  }

  // 5. 成功
  return res.status(200).json({
    linked: connection ? true : false,
    connectedAt: connection ? connection.connected_at : null,
    enabled: enabled,
  })
}
