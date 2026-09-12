import { supabaseAdmin, requireAdmin, writeAuditLog } from '../_adminAuth.js'

// テーブル名・列はクライアントから受け取らず、type をキーにこの固定マップから引く。
// 通報者（reporter_id / user_id）は画面が使わないため columns に含めない。
const TYPE_MAP = {
  report: {
    table: 'reports',
    columns: 'id, reason, target_type, target_id, detail, status, admin_note, handled_by, handled_at, created_at',
    softDelete: false,
  },
  area_report: {
    table: 'area_reports',
    columns: 'id, reason, body, target_type, target_id, contact_email, page_url, status, created_at',
    softDelete: true,
  },
  feedback: {
    table: 'area_feedback',
    columns: 'id, category, body, contact_email, page_url, status, created_at',
    softDelete: true,
  },
}

// list の応答キーと type の対応（既存の呼び出し側が読むキー名を維持する）
const LIST_ENTRIES = [
  { key: 'reports', type: 'report' },
  { key: 'areaReports', type: 'area_report' },
  { key: 'areaFeedback', type: 'feedback' },
]

const ACTIONS = ['list', 'updateStatus']
const STATUSES = ['new', 'investigating', 'resolved', 'rejected']
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * Vercel Serverless Function: POST /api/admin/reports
 * 通報（本体・Area）とご意見・不具合の一覧・状態変更。管理者のみ。
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

    // 5. DB 操作（3種をまとめて取得する既存の挙動を維持）
    const results = await Promise.all(LIST_ENTRIES.map(function (entry) {
      const def = TYPE_MAP[entry.type]
      let query = supabaseAdmin.from(def.table).select(def.columns, { count: 'exact' })
      if (def.softDelete) {
        query = query.is('deleted_at', null)
      }
      return query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)
    }))

    for (let i = 0; i < results.length; i++) {
      if (results[i].error) {
        console.error(
          '[admin/reports] list error (' + TYPE_MAP[LIST_ENTRIES[i].type].table + '):',
          JSON.stringify(results[i].error)
        )
        return res.status(500).json({ error: 'db_error' })
      }
    }

    return res.status(200).json({
      reports: results[0].data || [],
      areaReports: results[1].data || [],
      areaFeedback: results[2].data || [],
      totals: {
        reports: results[0].count || 0,
        areaReports: results[1].count || 0,
        areaFeedback: results[2].count || 0,
      },
      limit,
      offset,
    })
  }

  // action === 'updateStatus'
  // 4. 入力値の検証
  const type = body.type
  if (typeof type !== 'string' || !Object.prototype.hasOwnProperty.call(TYPE_MAP, type)) {
    return res.status(400).json({ error: 'invalid_type' })
  }
  const def = TYPE_MAP[type]

  const id = body.id
  if (typeof id !== 'string' || !UUID_RE.test(id)) {
    return res.status(400).json({ error: 'invalid_id' })
  }

  const status = body.status
  if (STATUSES.indexOf(status) === -1) {
    return res.status(400).json({ error: 'invalid_status' })
  }

  // 5. DB 操作
  const { data: before, error: beforeErr } = await supabaseAdmin
    .from(def.table)
    .select('id, status')
    .eq('id', id)
    .maybeSingle()
  if (beforeErr) {
    console.error('[admin/reports] updateStatus select error:', JSON.stringify(beforeErr))
    return res.status(500).json({ error: 'db_error' })
  }
  if (!before) {
    return res.status(404).json({ error: 'not_found' })
  }

  // handled_by / handled_at は reports にのみ存在する列
  const patch = type === 'report'
    ? { status, handled_by: admin.userId, handled_at: new Date().toISOString() }
    : { status }

  const { error: updErr } = await supabaseAdmin
    .from(def.table)
    .update(patch)
    .eq('id', id)
  if (updErr) {
    console.error('[admin/reports] updateStatus update error:', JSON.stringify(updErr))
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
