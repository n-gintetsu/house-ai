import { supabaseAdmin, requireAdmin, writeAuditLog } from '../_adminAuth.js'

// テーブル名・列はクライアントから受け取らず、action ごとにこのファイル内の定数で固定する。
// partner_user_id / show_inquiry_form は現在の画面が使わないため扱わない。
const ACTIONS = [
  'listRates', 'saveRates', 'upsertRates',
  'listTicker', 'createTicker', 'deleteTicker',
  'listAds', 'createAd', 'deleteAd',
]

const RATE_COLUMNS = 'id, bank_name, variable_rate, fixed10_rate, fixed35_rate, tag, bank_url, is_active, last_updated, created_at'
const TICKER_COLUMNS = 'id, label, text, url, active, sort_order, created_at'
const AD_COLUMNS = 'id, label, title, description, url, color, active, sort_order, created_at'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const COLOR_RE = /^#[0-9a-f]{6}$/i
const TICKER_LABELS = ['PR', '広告', '提携', 'お知らせ']
const AD_LABELS = ['広告', 'PR', '提携']
const MAX_TEXT = 500
const MAX_BANK_NAME = 100
const MAX_ROWS = 200

function isBigintId(v) {
  const n = Number(v)
  return Number.isInteger(n) && n > 0 && n <= 9007199254740991
}

function isRate(v) {
  return v === null || (Number.isFinite(Number(v)) && Number(v) >= 0 && Number(v) <= 100)
}

function trimStr(v, max) {
  if (typeof v !== 'string') return null
  const t = v.trim()
  if (t === '') return null
  if (t.length > max) return null
  return t
}

/**
 * 金利の行を検証して正規化する。requireId が true なら id（UUID）必須。
 * 問題があれば { error } を、問題なければ { rows } を返す。
 */
function validateRateRows(rows, requireId) {
  if (!Array.isArray(rows) || rows.length === 0 || rows.length > MAX_ROWS) {
    return { error: 'invalid_rows' }
  }

  const normalized = []
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i] || {}

    if (requireId) {
      if (typeof row.id !== 'string' || !UUID_RE.test(row.id)) {
        return { error: 'invalid_id' }
      }
    }

    const bankName = trimStr(row.bank_name, MAX_BANK_NAME)
    if (bankName === null) {
      return { error: 'invalid_bank_name' }
    }

    if (!isRate(row.variable_rate) || !isRate(row.fixed10_rate) || !isRate(row.fixed35_rate)) {
      return { error: 'invalid_rate' }
    }

    normalized.push({
      id: row.id,
      bank_name: bankName,
      variable_rate: row.variable_rate === null ? null : Number(row.variable_rate),
      fixed10_rate: row.fixed10_rate === null ? null : Number(row.fixed10_rate),
      fixed35_rate: row.fixed35_rate === null ? null : Number(row.fixed35_rate),
      tag: trimStr(row.tag, 50),
    })
  }

  return { rows: normalized }
}

/**
 * Vercel Serverless Function: POST /api/admin/content
 * 住宅ローン金利・ティッカー・広告バナーの取得と編集。管理者のみ。
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

  // ===== 住宅ローン金利 =====

  if (action === 'listRates') {
    const { data, error } = await supabaseAdmin
      .from('mortgage_rates')
      .select(RATE_COLUMNS)
      .order('bank_name')
    if (error) {
      console.error('[admin/content] listRates error:', JSON.stringify(error))
      return res.status(500).json({ error: 'db_error' })
    }
    return res.status(200).json({ items: data || [] })
  }

  if (action === 'saveRates') {
    // 4. 入力値の検証（全行を先に通す）
    const checked = validateRateRows(body.rows, true)
    if (checked.error) {
      return res.status(400).json({ error: checked.error })
    }

    // 5. DB 操作
    for (let i = 0; i < checked.rows.length; i++) {
      const row = checked.rows[i]
      const { error } = await supabaseAdmin
        .from('mortgage_rates')
        .update({
          bank_name: row.bank_name,
          variable_rate: row.variable_rate,
          fixed10_rate: row.fixed10_rate,
          fixed35_rate: row.fixed35_rate,
          tag: row.tag,
        })
        .eq('id', row.id)
      if (error) {
        console.error('[admin/content] saveRates error:', JSON.stringify(error))
        return res.status(500).json({ error: 'db_error', failedAt: i })
      }
    }

    await writeAuditLog({
      adminUserId: admin.userId,
      adminEmail: admin.email,
      action: 'saveRates',
      targetType: 'mortgage_rates',
      targetId: null,
      detail: {
        updatedCount: checked.rows.length,
        bankNames: checked.rows.map(function (row) { return row.bank_name }),
      },
    })
    return res.status(200).json({ ok: true, updated: checked.rows.length })
  }

  if (action === 'upsertRates') {
    // 4. 入力値の検証（id は不要。含まれていても使わない）
    const checked = validateRateRows(body.rows, false)
    if (checked.error) {
      return res.status(400).json({ error: checked.error })
    }

    // 5. DB 操作
    const now = new Date().toISOString()
    for (let i = 0; i < checked.rows.length; i++) {
      const row = checked.rows[i]
      const { error } = await supabaseAdmin
        .from('mortgage_rates')
        .upsert({
          bank_name: row.bank_name,
          variable_rate: row.variable_rate,
          fixed10_rate: row.fixed10_rate,
          fixed35_rate: row.fixed35_rate,
          last_updated: now,
          is_active: true,
        }, { onConflict: 'bank_name' })
      if (error) {
        console.error('[admin/content] upsertRates error:', JSON.stringify(error))
        return res.status(500).json({ error: 'db_error', failedAt: i })
      }
    }

    await writeAuditLog({
      adminUserId: admin.userId,
      adminEmail: admin.email,
      action: 'upsertRates',
      targetType: 'mortgage_rates',
      targetId: null,
      detail: {
        upsertedCount: checked.rows.length,
        bankNames: checked.rows.map(function (row) { return row.bank_name }),
      },
    })
    return res.status(200).json({ ok: true, upserted: checked.rows.length })
  }

  // ===== ティッカー =====

  if (action === 'listTicker') {
    const { data, error } = await supabaseAdmin
      .from('ticker_items')
      .select(TICKER_COLUMNS)
      .order('sort_order')
    if (error) {
      console.error('[admin/content] listTicker error:', JSON.stringify(error))
      return res.status(500).json({ error: 'db_error' })
    }
    return res.status(200).json({ items: data || [] })
  }

  if (action === 'createTicker') {
    // 4. 入力値の検証
    const label = body.label
    if (TICKER_LABELS.indexOf(label) === -1) {
      return res.status(400).json({ error: 'invalid_label' })
    }

    const text = trimStr(body.text, MAX_TEXT)
    if (text === null) {
      return res.status(400).json({ error: 'invalid_text' })
    }

    const url = trimStr(body.url, 500)

    let sortOrder = Number(body.sort_order)
    if (!Number.isInteger(sortOrder)) sortOrder = 0
    if (sortOrder < 0) sortOrder = 0
    if (sortOrder > 9999) sortOrder = 9999

    // 5. DB 操作（id は自動採番。RLS 有効テーブルのため .select() で読み戻さない）
    const { error } = await supabaseAdmin
      .from('ticker_items')
      .insert({ label, text, url, active: true, sort_order: sortOrder })
    if (error) {
      console.error('[admin/content] createTicker error:', JSON.stringify(error))
      return res.status(500).json({ error: 'db_error' })
    }

    await writeAuditLog({
      adminUserId: admin.userId,
      adminEmail: admin.email,
      action: 'createTicker',
      targetType: 'ticker_item',
      targetId: null,
      detail: { label, textLength: text.length },
    })
    return res.status(200).json({ ok: true })
  }

  // ===== 広告バナー =====

  if (action === 'listAds') {
    const { data, error } = await supabaseAdmin
      .from('ad_items')
      .select(AD_COLUMNS)
      .order('sort_order')
    if (error) {
      console.error('[admin/content] listAds error:', JSON.stringify(error))
      return res.status(500).json({ error: 'db_error' })
    }
    return res.status(200).json({ items: data || [] })
  }

  if (action === 'createAd') {
    // 4. 入力値の検証
    const label = body.label
    if (AD_LABELS.indexOf(label) === -1) {
      return res.status(400).json({ error: 'invalid_label' })
    }

    const title = trimStr(body.title, 200)
    if (title === null) {
      return res.status(400).json({ error: 'invalid_title' })
    }

    const description = trimStr(body.description, 500)
    const url = trimStr(body.url, 500)

    const rawColor = typeof body.color === 'string' ? body.color.trim() : ''
    const color = COLOR_RE.test(rawColor) ? rawColor : '#1a3a5c'

    // 5. DB 操作
    const { error } = await supabaseAdmin
      .from('ad_items')
      .insert({ label, title, description, url, color, active: true })
    if (error) {
      console.error('[admin/content] createAd error:', JSON.stringify(error))
      return res.status(500).json({ error: 'db_error' })
    }

    await writeAuditLog({
      adminUserId: admin.userId,
      adminEmail: admin.email,
      action: 'createAd',
      targetType: 'ad_item',
      targetId: null,
      detail: { label, title },
    })
    return res.status(200).json({ ok: true })
  }

  // ===== 削除（ticker / ad は同じ構造。テーブルと列だけ切り替える） =====

  const isTicker = action === 'deleteTicker'
  const table = isTicker ? 'ticker_items' : 'ad_items'
  const columns = isTicker ? TICKER_COLUMNS : AD_COLUMNS

  // 4. 入力値の検証
  const id = body.id
  if (!isBigintId(id)) {
    return res.status(400).json({ error: 'invalid_id' })
  }

  // 5. DB 操作（削除前のレコードを監査ログ用に取得）
  const { data: record, error: recErr } = await supabaseAdmin
    .from(table)
    .select(columns)
    .eq('id', id)
    .maybeSingle()
  if (recErr) {
    console.error('[admin/content] delete select error:', JSON.stringify(recErr))
    return res.status(500).json({ error: 'db_error' })
  }
  if (!record) {
    return res.status(404).json({ error: 'not_found' })
  }

  const { error: delErr } = await supabaseAdmin
    .from(table)
    .delete()
    .eq('id', id)
  if (delErr) {
    console.error('[admin/content] delete error:', JSON.stringify(delErr))
    return res.status(500).json({ error: 'db_error' })
  }

  await writeAuditLog({
    adminUserId: admin.userId,
    adminEmail: admin.email,
    action: isTicker ? 'deleteTicker' : 'deleteAd',
    targetType: isTicker ? 'ticker_item' : 'ad_item',
    targetId: String(id),
    detail: { before: record },
  })
  return res.status(200).json({ ok: true })
}
