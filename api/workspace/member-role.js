import { supabaseAdmin } from '../_adminAuth.js'
import { requireUser } from '../_userAuth.js'

// 大小文字を区別して照合する。クライアントから来た値はこの一覧に無ければ受け付けない。
const ALLOWED_ROLES = [
  'Owner',
  'Manager',
  'Staff',
  'Customer',
  'Broker',
  'JudicialScrivener',
  'Bank',
  'ReformCompany',
  'Guest',
]

// RPC の戻り値と HTTP ステータスの対応。ここに無い値は想定外として 500 にする。
const RESULT_STATUS = {
  not_a_member: 403,
  insufficient_permission: 403,
  manager_cannot_change_admin: 403,
  manager_cannot_grant_admin: 403,
  cannot_change_self: 403,
  last_owner: 409,
  member_not_found: 404,
  workspace_not_found: 404,
  workspace_mismatch: 400,
  invalid_input: 400,
}

/**
 * Vercel Serverless Function: POST /api/workspace/member-role
 * 案件メンバーの権限を変更する。操作者は必ずセッションから特定し、
 * リクエストの自己申告値は使わない。判定そのものは DB 関数側で行う。
 */
export default async function handler(req, res) {
  // 1. メソッド確認
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // 2. 本人確認（失敗時はレスポンス送信済み）
  const ctx = await requireUser(req, res)
  if (!ctx) return

  let body = req.body
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body)
    } catch {
      body = null
    }
  }
  body = body || {}

  // 3. 入力検証
  const workspaceId = body.workspaceId
  const memberId = body.memberId
  const newRole = body.newRole
  if (typeof workspaceId !== 'string' || workspaceId === '' ||
      typeof memberId !== 'string' || memberId === '' ||
      typeof newRole !== 'string' || newRole === '') {
    return res.status(400).json({ error: 'invalid_input' })
  }
  if (ALLOWED_ROLES.indexOf(newRole) === -1) {
    return res.status(400).json({ error: 'invalid_role' })
  }

  // 4. 呼び出し者がこの案件の active メンバーかを先に確認する。
  //    課金判定をこの後に置くことで、無関係な案件の契約状態を探れないようにする。
  //    返すエラーは新設せず、既存の not_a_member（RESULT_STATUS と同じ 403）を再利用する。
  const { data: actor, error: actorErr } = await supabaseAdmin
    .from('workspace_members')
    .select('id')
    .eq('workspace_id', workspaceId)
    .eq('user_id', ctx.userId)
    .eq('status', 'active')
    .limit(1)
    .maybeSingle()
  if (actorErr) {
    console.error('[workspace/member-role] actor lookup error:', JSON.stringify(actorErr))
    return res.status(500).json({ error: 'db_error' })
  }
  if (!actor) {
    return res.status(403).json({ error: 'not_a_member' })
  }

  // 5. 課金判定。判定するのは案件を所有する組織（host org）で、
  //    操作者の profiles.org_id では判定しない。RPC より前に置く。
  const { data: billable, error: billErr } =
    await supabaseAdmin.rpc('workspace_org_is_billable', { p_workspace_id: workspaceId })
  if (billErr) {
    console.error('[workspace/member-role] billing check error:', JSON.stringify(billErr))
    return res.status(500).json({ error: 'billing_check_failed' })
  }
  if (billable !== true) {
    return res.status(402).json({ error: 'billing_required' })
  }

  // 6. 権限判定と更新は DB 関数に任せる。操作者はセッション由来の値のみ渡す。
  const { data, error } = await supabaseAdmin.rpc('change_member_role', {
    p_workspace_id: workspaceId,
    p_member_id: memberId,
    p_new_role: newRole,
    p_actor_user_id: ctx.userId,
  })

  // 7. RPC 自体の失敗
  if (error) {
    console.error('[workspace/member-role] rpc error:', JSON.stringify(error))
    return res.status(500).json({ error: 'db_error' })
  }

  // 8. 戻り値で分岐
  if (data === 'ok') {
    return res.status(200).json({ ok: true })
  }

  const status = RESULT_STATUS[data]
  if (status) {
    return res.status(status).json({ error: data })
  }

  console.error('[workspace/member-role] unknown rpc result:', String(data))
  return res.status(500).json({ error: 'unknown_result' })
}
