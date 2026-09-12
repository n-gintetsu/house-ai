import { supabaseAdmin, requireAdmin } from '../_adminAuth.js'

// 読み取り専用。insert / update / delete は作らない。
// id と user_id は画面が使わないため返さない。
const ACTIONS = ['list']
const COLUMNS = 'event_type, session_id, metadata, created_at'
const MAX_DAYS = 90
const MAX_ROWS = 5000

/**
 * Vercel Serverless Function: POST /api/admin/analytics
 * 計測イベント（analytics_events）の読み取り。管理者のみ。
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

  // action === 'list'
  // 4. 入力値の検証
  let days = Number(body.days)
  if (!Number.isFinite(days)) days = 7
  days = Math.floor(days)
  if (days < 1) days = 7
  if (days > MAX_DAYS) days = MAX_DAYS

  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

  // 5. DB 操作（件数が多くなりうるので上限を設ける）
  const { data, error } = await supabaseAdmin
    .from('analytics_events')
    .select(COLUMNS)
    .gte('created_at', since)
    .order('created_at', { ascending: true })
    .limit(MAX_ROWS)
  if (error) {
    console.error('[admin/analytics] list error:', JSON.stringify(error))
    return res.status(500).json({ error: 'db_error' })
  }

  return res.status(200).json({ items: data || [], days: days, since: since })
}
