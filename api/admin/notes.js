import { supabaseAdmin, requireAdmin, writeAuditLog } from '../_adminAuth.js'

// 対象種別・action はクライアントから任意値を受け取らず、この allowlist で検証する。
const TARGET_TYPES = ['member', 'agency', 'partner']
const ACTIONS = ['list', 'create']
const MAX_CONTENT_LENGTH = 2000
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * Vercel Serverless Function: POST /api/admin/notes
 * 管理者メモ（admin_notes）の一覧・追加。管理者のみ。
 */
export default async function handler(req, res) {
  // 1. メソッド確認
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // 2. 管理者認証（失敗時はレスポンス送信済み）
  const admin = await requireAdmin(req, res)
  if (!admin) return

  let body = req.body
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body)
    } catch {
      body = null
    }
  }
  body = body || {}

  // 3. action の検証
  const action = body.action
  if (ACTIONS.indexOf(action) === -1) {
    return res.status(400).json({ error: 'invalid_action' })
  }

  // 4. 入力値の検証
  const targetType = body.targetType
  if (TARGET_TYPES.indexOf(targetType) === -1) {
    return res.status(400).json({ error: 'invalid_target_type' })
  }

  const targetId = body.targetId
  if (typeof targetId !== 'string' || !UUID_RE.test(targetId)) {
    return res.status(400).json({ error: 'invalid_target_id' })
  }

  if (action === 'list') {
    let limit = Number(body.limit)
    if (!Number.isFinite(limit)) limit = 50
    limit = Math.floor(limit)
    if (limit < 1) limit = 50
    if (limit > 100) limit = 100

    let offset = Number(body.offset)
    if (!Number.isFinite(offset)) offset = 0
    offset = Math.floor(offset)
    if (offset < 0) offset = 0

    // 5. DB 操作（admin_id は UI で使わないため返さない）
    const { data, error, count } = await supabaseAdmin
      .from('admin_notes')
      .select('id, target_type, target_id, admin_name, content, created_at', { count: 'exact' })
      .eq('target_type', targetType)
      .eq('target_id', targetId)
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1)
    if (error) {
      console.error('[admin/notes] list error:', JSON.stringify(error))
      return res.status(500).json({ error: 'db_error' })
    }
    return res.status(200).json({ items: data || [], total: count || 0, limit, offset })
  }

  // action === 'create'
  const content = body.content
  if (typeof content !== 'string' || content.trim() === '') {
    return res.status(400).json({ error: 'invalid_content' })
  }
  if (content.length > MAX_CONTENT_LENGTH) {
    return res.status(400).json({ error: 'content_too_long' })
  }
  const trimmed = content.trim()

  // 5. DB 操作（admin_id / admin_name は getUser 由来。RLS 有効テーブルのため .select() で読み戻さない）
  const { error: insErr } = await supabaseAdmin
    .from('admin_notes')
    .insert({
      target_type: targetType,
      target_id: targetId,
      admin_id: admin.userId,
      admin_name: admin.email,
      content: trimmed,
    })
  if (insErr) {
    console.error('[admin/notes] create error:', JSON.stringify(insErr))
    return res.status(500).json({ error: 'db_error' })
  }

  // メモ本文は監査ログに入れない（重複保存を避ける）
  await writeAuditLog({
    adminUserId: admin.userId,
    adminEmail: admin.email,
    action: 'createNote',
    targetType: targetType,
    targetId: targetId,
    detail: { contentLength: trimmed.length },
  })
  return res.status(200).json({ ok: true })
}
