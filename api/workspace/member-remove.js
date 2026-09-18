import { supabaseAdmin } from '../_adminAuth.js'
import { requireUser } from '../_userAuth.js'

// RPC の戻り値と HTTP ステータスの対応。ここに無い値は想定外として 500 にする。
const RESULT_STATUS = {
  not_a_member: 403,
  insufficient_permission: 403,
  manager_cannot_remove_admin: 403,
  cannot_remove_self: 403,
  last_owner: 409,
  member_not_found: 404,
  workspace_not_found: 404,
  workspace_mismatch: 400,
  invalid_input: 400,
}

/**
 * Vercel Serverless Function: POST /api/workspace/member-remove
 * 案件メンバーを削除する。操作者は必ずセッションから特定し、
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
  if (typeof workspaceId !== 'string' || workspaceId === '' ||
      typeof memberId !== 'string' || memberId === '') {
    return res.status(400).json({ error: 'invalid_input' })
  }

  // 4. 権限判定と削除は DB 関数に任せる。操作者はセッション由来の値のみ渡す。
  const { data, error } = await supabaseAdmin.rpc('remove_member', {
    p_workspace_id: workspaceId,
    p_member_id: memberId,
    p_actor_user_id: ctx.userId,
  })

  // 5. RPC 自体の失敗
  if (error) {
    console.error('[workspace/member-remove] rpc error:', JSON.stringify(error))
    return res.status(500).json({ error: 'db_error' })
  }

  // 6. 戻り値で分岐
  if (data === 'ok') {
    return res.status(200).json({ ok: true })
  }

  const status = RESULT_STATUS[data]
  if (status) {
    return res.status(status).json({ error: data })
  }

  console.error('[workspace/member-remove] unknown rpc result:', String(data))
  return res.status(500).json({ error: 'unknown_result' })
}
