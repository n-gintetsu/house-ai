import { supabaseAdmin, requireAdmin, writeAuditLog } from '../_adminAuth.js'

// 実在する15列のみを扱う。存在しない列（is_featured / catchcopy / prefecture 等）は payload に含めない。
// クライアントから届いた未知のキーは使わず、下のホワイトリストから明示的に取り出す。
const ACTIONS = ['list', 'create', 'update', 'delete']
const COLUMNS = 'id, title, property_type, price, rent, address, area, layout, built_year, description, features, status, deal_type, image_url, created_at'
const DEAL_TYPES = ['rent', 'sale', 'investment']
const STATUSES = ['active', 'inactive']
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const MAX_TEXT = 2000

function trimStr(v, max) {
  if (typeof v !== 'string') return null
  const t = v.trim()
  if (t === '') return null
  if (t.length > max) return null
  return t
}

function toInt(v) {
  if (v === null || v === undefined || v === '') return null
  const n = Number(v)
  if (!Number.isFinite(n)) return null
  const i = Math.trunc(n)
  if (i < 0) return null
  return i
}

function toNum(v) {
  if (v === null || v === undefined || v === '') return null
  const n = Number(v)
  if (!Number.isFinite(n)) return null
  if (n < 0) return null
  return n
}

/**
 * ホワイトリストの値だけで payload を組み立てる。
 * 問題があれば { error } を、問題なければ { payload } を返す。
 */
function buildPayload(body) {
  const title = trimStr(body.title, 200)
  if (title === null) {
    return { error: 'invalid_title' }
  }
  if (DEAL_TYPES.indexOf(body.deal_type) === -1) {
    return { error: 'invalid_deal_type' }
  }
  const status = STATUSES.indexOf(body.status) === -1 ? 'active' : body.status

  return {
    payload: {
      title: title,
      deal_type: body.deal_type,
      status: status,
      property_type: trimStr(body.property_type, 100),
      layout: trimStr(body.layout, 100),
      address: trimStr(body.address, 500),
      description: trimStr(body.description, MAX_TEXT),
      features: trimStr(body.features, MAX_TEXT),
      image_url: trimStr(body.image_url, 1000),
      price: toInt(body.price),
      rent: toInt(body.rent),
      built_year: toInt(body.built_year),
      area: toNum(body.area),
    },
  }
}

/**
 * Vercel Serverless Function: POST /api/admin/properties
 * 物件（properties）の一覧・登録・更新・削除。管理者のみ。
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
    const { data, error, count } = await supabaseAdmin
      .from('properties')
      .select(COLUMNS, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    if (error) {
      console.error('[admin/properties] list error:', JSON.stringify(error))
      return res.status(500).json({ error: 'db_error' })
    }
    return res.status(200).json({ items: data || [], total: count || 0, limit, offset })
  }

  if (action === 'create') {
    // 4. 入力値の検証
    const built = buildPayload(body)
    if (built.error) {
      return res.status(400).json({ error: built.error })
    }

    // 5. DB 操作（RLS 有効テーブルのため .select() で読み戻さない）
    const { error } = await supabaseAdmin
      .from('properties')
      .insert(built.payload)
    if (error) {
      console.error('[admin/properties] create error:', JSON.stringify(error))
      return res.status(500).json({ error: 'db_error' })
    }

    await writeAuditLog({
      adminUserId: admin.userId,
      adminEmail: admin.email,
      action: 'create',
      targetType: 'property',
      targetId: null,
      detail: { title: built.payload.title, deal_type: built.payload.deal_type },
    })
    return res.status(200).json({ ok: true })
  }

  // update / delete は id が必要
  const id = body.id
  if (typeof id !== 'string' || !UUID_RE.test(id)) {
    return res.status(400).json({ error: 'invalid_id' })
  }

  if (action === 'update') {
    // 4. 入力値の検証
    const built = buildPayload(body)
    if (built.error) {
      return res.status(400).json({ error: built.error })
    }

    // 5. DB 操作
    const { data: before, error: beforeErr } = await supabaseAdmin
      .from('properties')
      .select(COLUMNS)
      .eq('id', id)
      .maybeSingle()
    if (beforeErr) {
      console.error('[admin/properties] update select error:', JSON.stringify(beforeErr))
      return res.status(500).json({ error: 'db_error' })
    }
    if (!before) {
      return res.status(404).json({ error: 'not_found' })
    }

    const { error: updErr } = await supabaseAdmin
      .from('properties')
      .update(built.payload)
      .eq('id', id)
    if (updErr) {
      console.error('[admin/properties] update error:', JSON.stringify(updErr))
      return res.status(500).json({ error: 'db_error' })
    }

    await writeAuditLog({
      adminUserId: admin.userId,
      adminEmail: admin.email,
      action: 'update',
      targetType: 'property',
      targetId: id,
      detail: { before: before, after: built.payload },
    })
    return res.status(200).json({ ok: true })
  }

  // action === 'delete'
  // 5. DB 操作（削除前のレコードと、道連れになる favorites の件数を取得）
  const { data: record, error: recErr } = await supabaseAdmin
    .from('properties')
    .select(COLUMNS)
    .eq('id', id)
    .maybeSingle()
  if (recErr) {
    console.error('[admin/properties] delete select error:', JSON.stringify(recErr))
    return res.status(500).json({ error: 'db_error' })
  }
  if (!record) {
    return res.status(404).json({ error: 'not_found' })
  }

  const { count: favCount, error: favErr } = await supabaseAdmin
    .from('favorites')
    .select('id', { count: 'exact', head: true })
    .eq('property_id', id)
  if (favErr) {
    console.error('[admin/properties] delete favorites count error:', JSON.stringify(favErr))
    return res.status(500).json({ error: 'db_error' })
  }
  const cascadedFavorites = favCount || 0

  // favorites.property_id は ON DELETE CASCADE のため、ここでの削除で一緒に消える
  const { error: delErr } = await supabaseAdmin
    .from('properties')
    .delete()
    .eq('id', id)
  if (delErr) {
    console.error('[admin/properties] delete error:', JSON.stringify(delErr))
    return res.status(500).json({ error: 'db_error' })
  }

  await writeAuditLog({
    adminUserId: admin.userId,
    adminEmail: admin.email,
    action: 'delete',
    targetType: 'property',
    targetId: id,
    detail: { before: record, cascadedFavorites: cascadedFavorites },
  })
  return res.status(200).json({ ok: true, cascadedFavorites: cascadedFavorites })
}
