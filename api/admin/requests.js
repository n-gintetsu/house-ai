import { supabaseAdmin, requireAdmin, writeAuditLog } from '../_adminAuth.js'

// 現在の画面が使う列のみを返す（size / age / layout / timing は返さない）。
// owner_requests は扱わない。expert_requests には status 列が無いため状態変更も行わない。
const ACTIONS = ['list', 'updateStatus']
const VALUATION_COLUMNS = 'id, name, email, phone, property_type, address, wishes, status, created_at'
const EXPERT_COLUMNS = 'id, name, email, phone, expert_type, situation, created_at'
const VALUATION_STATUSES = ['done']
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * Vercel Serverless Function: POST /api/admin/requests
 * 査定依頼（valuations）と専門家依頼（expert_requests）の一覧、および査定依頼の状態変更。管理者のみ。
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

  if (action === 'list') {
    // 4. 入力値の検証
    let limit = Number(body.limit)
    if (!Number.isFinite(limit)) limit = 100
    limit = Math.floor(limit)
    if (limit < 1) limit = 100
    if (limit > 200) limit = 200

    let offset = Number(body.offset)
    if (!Number.isFinite(offset)) offset = 0
    offset = Math.floor(offset)
    if (offset < 0) offset = 0

    // 5. DB 操作
    const [valuationsRes, expertsRes] = await Promise.all([
      supabaseAdmin
        .from('valuations')
        .select(VALUATION_COLUMNS, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1),
      supabaseAdmin
        .from('expert_requests')
        .select(EXPERT_COLUMNS, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1),
    ])

    if (valuationsRes.error) {
      console.error('[admin/requests] list error (valuations):', JSON.stringify(valuationsRes.error))
      return res.status(500).json({ error: 'db_error' })
    }
    if (expertsRes.error) {
      console.error('[admin/requests] list error (expert_requests):', JSON.stringify(expertsRes.error))
      return res.status(500).json({ error: 'db_error' })
    }

    return res.status(200).json({
      valuations: valuationsRes.data || [],
      expertRequests: expertsRes.data || [],
      totals: {
        valuations: valuationsRes.count || 0,
        expertRequests: expertsRes.count || 0,
      },
      limit,
      offset,
    })
  }

  // action === 'updateStatus'（valuations のみ）
  // 4. 入力値の検証
  const id = body.id
  if (typeof id !== 'string' || !UUID_RE.test(id)) {
    return res.status(400).json({ error: 'invalid_id' })
  }

  const status = body.status
  if (VALUATION_STATUSES.indexOf(status) === -1) {
    return res.status(400).json({ error: 'invalid_status' })
  }

  // 5. DB 操作
  const { data: before, error: beforeErr } = await supabaseAdmin
    .from('valuations')
    .select('id, status')
    .eq('id', id)
    .maybeSingle()
  if (beforeErr) {
    console.error('[admin/requests] updateStatus select error:', JSON.stringify(beforeErr))
    return res.status(500).json({ error: 'db_error' })
  }
  if (!before) {
    return res.status(404).json({ error: 'not_found' })
  }

  const { error: updErr } = await supabaseAdmin
    .from('valuations')
    .update({ status })
    .eq('id', id)
  if (updErr) {
    console.error('[admin/requests] updateStatus update error:', JSON.stringify(updErr))
    return res.status(500).json({ error: 'db_error' })
  }

  await writeAuditLog({
    adminUserId: admin.userId,
    adminEmail: admin.email,
    action: 'updateStatus',
    targetType: 'valuation',
    targetId: id,
    detail: { before: { status: before.status }, after: { status } },
  })
  return res.status(200).json({ ok: true })
}
