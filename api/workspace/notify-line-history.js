import { supabaseAdmin } from '../_adminAuth.js'
import { requireUser } from '../_userAuth.js'
import { normRole, canSendNotification } from '../_roles.js'

// 返すのは「いつ・どの対象について・誰に・どの経路で送れたか」の4点だけ。
// error_code / line_user_id / sender_user_id は select もせず、レスポンスにも含めない。
const LOG_COLUMNS = 'target_type, target_id, recipient_user_id, delivered_channel, created_at'
const NOTIFICATION_TYPE = 'confirm_request'
const HISTORY_DAYS = 7
const HISTORY_LIMIT = 200

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function sinceIso() {
  return new Date(Date.now() - HISTORY_DAYS * 24 * 60 * 60 * 1000).toISOString()
}

/**
 * Vercel Serverless Function: GET /api/workspace/notify-line-history
 * 案件の「確認のご依頼」の送信履歴（直近7日・送信成功分）を返す。
 * workspace_line_notification_log は service_role 専用のため、取得はこの API 経由のみ。
 * 送信者はセッションから決まり、リクエストからは案件IDしか受け取らない。
 */
export default async function handler(req, res) {
  // 1. メソッド確認
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'method_not_allowed' })
  }

  // 2. 本人確認（失敗時はレスポンス送信済み）
  const ctx = await requireUser(req, res)
  if (!ctx) return
  if (!ctx.userId) {
    return res.status(401).json({ error: 'no_user' })
  }

  // 3. 入力検証（受け取るのは案件IDだけ。ユーザーIDは自己申告させない）
  const workspaceId = req.query.workspaceId || ''
  if (typeof workspaceId !== 'string' || !UUID_RE.test(workspaceId)) {
    return res.status(400).json({ error: 'invalid_input' })
  }

  // 4. 閲覧者がこの案件の active メンバーか
  const { data: actor, error: actorErr } = await supabaseAdmin
    .from('workspace_members')
    .select('id, role')
    .eq('workspace_id', workspaceId)
    .eq('user_id', ctx.userId)
    .eq('status', 'active')
    .limit(1)
    .maybeSingle()
  if (actorErr) {
    console.error('[workspace/notify-line-history] actor lookup error:', JSON.stringify(actorErr))
    return res.status(500).json({ error: 'db_error' })
  }
  if (!actor) {
    return res.status(403).json({ error: 'not_a_member' })
  }

  // 5. 閲覧者の role（allowlist。判定は normRole 経由）
  //    履歴＝誰に通知したかは業務側の情報なので、顧客（Customer）等には見せない。
  if (!canSendNotification(normRole(actor.role))) {
    return res.status(403).json({ error: 'insufficient_permission' })
  }

  // 課金判定（workspace_org_is_billable）は入れない。
  // 読み取りだけで副作用が無く、契約切れでも過去の履歴が見えなくなる必要はないため。

  // 6. 履歴取得（送信成功分のみ・直近7日・新しい順）
  const { data: rows, error: rowsErr } = await supabaseAdmin
    .from('workspace_line_notification_log')
    .select(LOG_COLUMNS)
    .eq('workspace_id', workspaceId)
    .eq('notification_type', NOTIFICATION_TYPE)
    .eq('status', 'sent')
    .gt('created_at', sinceIso())
    .order('created_at', { ascending: false })
    .limit(HISTORY_LIMIT)
  if (rowsErr) {
    console.error('[workspace/notify-line-history] log select error:', JSON.stringify(rowsErr))
    return res.status(500).json({ error: 'db_error' })
  }

  // 7. 成功
  return res.status(200).json({ items: rows || [] })
}
