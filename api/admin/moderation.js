import { supabaseAdmin, requireAdmin, writeAuditLog } from '../_adminAuth.js'

// 取得・監査に使う列はこの固定リストのみ（実在する列。select('*') 禁止）。
// 非公開化・通報の機能は現状扱わない（対応する列が存在しないため）。
const ACTIONS = ['list', 'delete']
const COLUMNS = 'id, category, title, body, anon, author_name, likes, empathy, created_at'
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * Vercel Serverless Function: POST /api/admin/moderation
 * コミュニティ投稿の一覧・物理削除。管理者のみ。
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
    if (!Number.isFinite(limit)) limit = 50
    limit = Math.floor(limit)
    if (limit < 1) limit = 50
    if (limit > 100) limit = 100

    let offset = Number(body.offset)
    if (!Number.isFinite(offset)) offset = 0
    offset = Math.floor(offset)
    if (offset < 0) offset = 0

    // 5. DB 操作
    const { data, error, count } = await supabaseAdmin
      .from('community_posts')
      .select(COLUMNS, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    if (error) {
      console.error('[admin/moderation] list error:', JSON.stringify(error))
      return res.status(500).json({ error: 'db_error' })
    }

    // DB 列名（likes）と UI 表示モデル（likes_count）を分離する
    const items = (data || []).map(function (row) {
      return {
        id: row.id,
        category: row.category,
        title: row.title,
        body: row.body,
        anon: row.anon,
        author_name: row.author_name,
        likes_count: row.likes,
        empathy: row.empathy,
        created_at: row.created_at,
      }
    })
    return res.status(200).json({ items, total: count || 0, limit, offset })
  }

  // action === 'delete'（物理削除）
  // 4. 入力値の検証
  const id = body.id
  if (typeof id !== 'string' || !UUID_RE.test(id)) {
    return res.status(400).json({ error: 'invalid_id' })
  }

  // 5. DB 操作（削除前のレコードを監査ログ用に取得）
  const { data: record, error: recErr } = await supabaseAdmin
    .from('community_posts')
    .select(COLUMNS)
    .eq('id', id)
    .maybeSingle()
  if (recErr) {
    console.error('[admin/moderation] delete select error:', JSON.stringify(recErr))
    return res.status(500).json({ error: 'db_error' })
  }
  if (!record) {
    return res.status(404).json({ error: 'not_found' })
  }

  const { error: delErr } = await supabaseAdmin
    .from('community_posts')
    .delete()
    .eq('id', id)
  if (delErr) {
    console.error('[admin/moderation] delete error:', JSON.stringify(delErr))
    return res.status(500).json({ error: 'db_error' })
  }

  await writeAuditLog({
    adminUserId: admin.userId,
    adminEmail: admin.email,
    action: 'delete',
    targetType: 'community_post',
    targetId: id,
    detail: { before: record },
  })
  return res.status(200).json({ ok: true })
}
