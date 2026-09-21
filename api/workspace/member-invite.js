import { randomUUID } from 'node:crypto'
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

const MAX_DISPLAY_NAME = 255

/**
 * Vercel Serverless Function: POST /api/workspace/member-invite
 * 案件へメンバーを招待する。操作者はセッションから特定し、Owner / Manager のみ許可する。
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
  const email = body.email
  const role = body.role
  if (typeof workspaceId !== 'string' || workspaceId === '' ||
      typeof email !== 'string' || email === '' ||
      typeof role !== 'string' || role === '') {
    return res.status(400).json({ error: 'invalid_input' })
  }
  if (ALLOWED_ROLES.indexOf(role) === -1) {
    return res.status(400).json({ error: 'invalid_role' })
  }
  const trimmedEmail = email.trim()
  if (trimmedEmail.indexOf('@') === -1 || trimmedEmail.length < 5 || trimmedEmail.length > 255) {
    return res.status(400).json({ error: 'invalid_email' })
  }
  let displayName = typeof body.displayName === 'string' ? body.displayName : ''
  if (displayName.length > MAX_DISPLAY_NAME) {
    displayName = displayName.slice(0, MAX_DISPLAY_NAME)
  }

  // 4. 操作者の権限確認
  const { data: actor, error: actorErr } = await supabaseAdmin
    .from('workspace_members')
    .select('id, role')
    .eq('workspace_id', workspaceId)
    .eq('user_id', ctx.userId)
    .eq('status', 'active')
    .limit(1)
    .maybeSingle()
  if (actorErr) {
    console.error('[workspace/member-invite] actor lookup error:', JSON.stringify(actorErr))
    return res.status(500).json({ error: 'db_error' })
  }
  if (!actor) {
    return res.status(403).json({ error: 'not_a_member' })
  }

  // 5. 課金判定。判定するのは案件を所有する組織（host org）で、
  //    操作者の profiles.org_id では判定しない。
  //    メンバーでない相手には直前の not_a_member で既に返しているため、
  //    ここに到達するのはこの案件の active メンバーだけ（他組織の契約状態を推測できない）。
  const { data: billable, error: billErr } =
    await supabaseAdmin.rpc('workspace_org_is_billable', { p_workspace_id: workspaceId })
  if (billErr) {
    console.error('[workspace/member-invite] billing check error:', JSON.stringify(billErr))
    return res.status(500).json({ error: 'billing_check_failed' })
  }
  if (billable !== true) {
    return res.status(402).json({ error: 'billing_required' })
  }

  const actorRole = String(actor.role || '').toLowerCase()
  if (actorRole !== 'owner' && actorRole !== 'manager') {
    return res.status(403).json({ error: 'insufficient_permission' })
  }

  // 6. Manager は Owner / Manager を付与できない
  const targetRole = role.toLowerCase()
  if (actorRole === 'manager' && (targetRole === 'owner' || targetRole === 'manager')) {
    return res.status(403).json({ error: 'manager_cannot_grant_admin' })
  }

  // 7. 既存行の確認（DB 側の ilike に頼らず、取得後に JS で小文字比較する）
  const { data: rows, error: rowsErr } = await supabaseAdmin
    .from('workspace_members')
    .select('id, email, status')
    .eq('workspace_id', workspaceId)
  if (rowsErr) {
    console.error('[workspace/member-invite] member lookup error:', JSON.stringify(rowsErr))
    return res.status(500).json({ error: 'db_error' })
  }

  const wanted = trimmedEmail.toLowerCase()
  const matched = (rows || []).filter(r => String(r.email || '').toLowerCase() === wanted)
  const activeRow = matched.filter(r => r.status === 'active')[0] || null
  if (activeRow) {
    return res.status(409).json({ error: 'already_member' })
  }

  const pendingRow = matched.filter(r => r.status === 'pending')[0] || null
  if (pendingRow) {
    const { data: reused, error: reuseErr } = await supabaseAdmin
      .from('workspace_members')
      .update({ role: role, display_name: displayName })
      .eq('id', pendingRow.id)
      .select('id')
    if (reuseErr) {
      console.error('[workspace/member-invite] reuse update error:', JSON.stringify(reuseErr))
      return res.status(500).json({ error: 'invite_failed' })
    }
    if (!reused || reused.length === 0) {
      console.error('[workspace/member-invite] reuse updated 0 rows for member:', pendingRow.id)
      return res.status(500).json({ error: 'invite_failed' })
    }
    return res.status(200).json({ ok: true, memberId: pendingRow.id, reused: true })
  }

  // 8. 新規招待
  const newId = randomUUID()
  const { data: inserted, error: insErr } = await supabaseAdmin
    .from('workspace_members')
    .insert({
      id: newId,
      workspace_id: workspaceId,
      email: trimmedEmail,
      role: role,
      status: 'pending',
      invited_by: ctx.userId,
      display_name: displayName,
      created_at: new Date().toISOString(),
    })
    .select('id')
  if (insErr) {
    console.error('[workspace/member-invite] insert error:', JSON.stringify(insErr))
    return res.status(500).json({ error: 'invite_failed' })
  }
  if (!inserted || inserted.length === 0) {
    console.error('[workspace/member-invite] insert returned 0 rows for workspace:', workspaceId)
    return res.status(500).json({ error: 'invite_failed' })
  }

  return res.status(200).json({ ok: true, memberId: newId, reused: false })
}
