import { supabaseAdmin, requireAdmin, writeAuditLog } from '../_adminAuth.js'

// テーブル名・列はクライアントから受け取らず、type をキーにこの固定マップから引く。
// agency_registrations の password_hash は columns に含めないこと（select('*') 禁止）。
const TYPE_MAP = {
  agency: {
    table: 'agency_registrations',
    columns: 'id, company_name, contact_name, phone, email, business_type, area, service_description, address, created_at, status, plan, deal_types, license_number, license_type, url',
    statuses: ['pending', 'approved', 'rejected'],
  },
  expert: {
    table: 'expert_registrations',
    columns: 'id, name, email, area, field, status, created_at',
    statuses: ['pending', 'approved', 'rejected'],
  },
}

const ACTIONS = ['list', 'updateStatus', 'delete']
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * Vercel Serverless Function: POST /api/admin/registrations
 * 業者（agency）・専門家（expert）登録の一覧・状態変更・削除。管理者のみ。
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
  const type = body.type
  if (typeof type !== 'string' || !Object.prototype.hasOwnProperty.call(TYPE_MAP, type)) {
    return res.status(400).json({ error: 'invalid_type' })
  }
  const def = TYPE_MAP[type]

  if (action === 'list') {
    let limit = Number(body.limit)
    if (!Number.isFinite(limit)) limit = 20
    limit = Math.floor(limit)
    if (limit < 1) limit = 20
    if (limit > 100) limit = 100

    let offset = Number(body.offset)
    if (!Number.isFinite(offset)) offset = 0
    offset = Math.floor(offset)
    if (offset < 0) offset = 0

    // 5. DB 操作
    const { data, error, count } = await supabaseAdmin
      .from(def.table)
      .select(def.columns, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    if (error) {
      console.error('[admin/registrations] list error:', JSON.stringify(error))
      return res.status(500).json({ error: 'db_error' })
    }
    return res.status(200).json({ items: data || [], total: count || 0, limit, offset })
  }

  const id = body.id
  if (typeof id !== 'string' || !UUID_RE.test(id)) {
    return res.status(400).json({ error: 'invalid_id' })
  }

  if (action === 'updateStatus') {
    const status = body.status
    if (def.statuses.indexOf(status) === -1) {
      return res.status(400).json({ error: 'invalid_status' })
    }

    // 5. DB 操作
    const { data: before, error: beforeErr } = await supabaseAdmin
      .from(def.table)
      .select('id, status')
      .eq('id', id)
      .maybeSingle()
    if (beforeErr) {
      console.error('[admin/registrations] updateStatus select error:', JSON.stringify(beforeErr))
      return res.status(500).json({ error: 'db_error' })
    }
    if (!before) {
      return res.status(404).json({ error: 'not_found' })
    }

    const { error: updErr } = await supabaseAdmin
      .from(def.table)
      .update({ status })
      .eq('id', id)
    if (updErr) {
      console.error('[admin/registrations] updateStatus update error:', JSON.stringify(updErr))
      return res.status(500).json({ error: 'db_error' })
    }

    await writeAuditLog({
      adminUserId: admin.userId,
      adminEmail: admin.email,
      action: 'updateStatus',
      targetType: type,
      targetId: id,
      detail: { before: { status: before.status }, after: { status } },
    })
    return res.status(200).json({ ok: true })
  }

  // action === 'delete'
  // 5. DB 操作（削除前のレコードを監査ログ用に取得。columns に password_hash は含まれない）
  const { data: record, error: recErr } = await supabaseAdmin
    .from(def.table)
    .select(def.columns)
    .eq('id', id)
    .maybeSingle()
  if (recErr) {
    console.error('[admin/registrations] delete select error:', JSON.stringify(recErr))
    return res.status(500).json({ error: 'db_error' })
  }
  if (!record) {
    return res.status(404).json({ error: 'not_found' })
  }

  const { error: delErr } = await supabaseAdmin
    .from(def.table)
    .delete()
    .eq('id', id)
  if (delErr) {
    console.error('[admin/registrations] delete error:', JSON.stringify(delErr))
    return res.status(500).json({ error: 'db_error' })
  }

  await writeAuditLog({
    adminUserId: admin.userId,
    adminEmail: admin.email,
    action: 'delete',
    targetType: type,
    targetId: id,
    detail: { before: record },
  })
  return res.status(200).json({ ok: true })
}
