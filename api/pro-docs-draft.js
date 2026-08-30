import { createClient } from '@supabase/supabase-js'
import { buildGroupSchema, COMMON_SYSTEM_PROMPT } from '../lib/juusetsu-schema.js'

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

// 後から1行で変更できるようにここへ集約する
const MODEL = 'claude-sonnet-4-5'
const MAX_TOKENS = 3000
const MAX_TOKENS_GROUP = 4000
const MAX_FILES = 5
const MAX_TOTAL_BASE64_CHARS = 3400000

// PDF解析は30〜60秒かかるため既定タイムアウトを延長する
export const config = { maxDuration: 60 }

/**
 * 重説ドラフト生成用のシステムプロンプト。
 * 汎用利用させないため文言はサーバー側に固定する（/api/claude のような自由入力は受け付けない）。
 */
function buildSystemPrompt(address, propertyType, ageYears, pdfCount) {
  return `あなたは不動産取引の重要事項説明書作成を支援するAIアシスタントです。
プロの宅建士・不動産業者向けに重要事項説明書のドラフトを生成してください。
以下の情報を元に分析し、必ず以下のJSON形式のみで返答してください。前後に説明文は不要です。

物件所在地: ${address}
物件種別: ${propertyType}
築年数: ${ageYears || '不明'}
アップロード書類数: ${pdfCount}件

重要：
- 確認できた項目はstatusを"ai_filled"に設定
- 推定・参考値の項目はstatusを"requires_check"に設定
- AIで判断不可の項目はstatusを"attorney_required"に設定
- cautionがある場合のみ文字列、ない場合はnull

JSON形式:
{
  "meta": { "confidence": 数値0-100, "warnings": [文字列配列] },
  "property_info": { "address": "文字列", "structure": "文字列", "floor_area": "文字列", "built_year": "文字列", "status": "ai_filled|requires_check", "caution": null或いは文字列 },
  "rights": { "owner": "文字列", "mortgage": "文字列", "status": "requires_check|attorney_required", "caution": null或いは文字列 },
  "zoning": { "use_district": "文字列", "building_coverage": "文字列", "floor_area_ratio": "文字列", "status": "ai_filled|requires_check", "caution": null或いは文字列 },
  "hazard": { "flood": "文字列", "landslide": "文字列", "tsunami": "文字列", "status": "requires_check", "caution": null或いは文字列 },
  "road_access": { "frontage": "文字列", "road_type": "文字列", "setback": "文字列", "status": "requires_check", "caution": null或いは文字列 },
  "management": { "fee": "文字列", "repair_fund": "文字列", "arrears": "文字列", "manager": "文字列", "status": "requires_check|attorney_required", "caution": null或いは文字列 },
  "restrictions": { "pet": "文字列", "renovation": "文字列", "other": "文字列", "status": "requires_check", "caution": null或いは文字列 },
  "transaction": { "price": "文字列", "deposit": "文字列", "payment": "文字列", "status": "attorney_required", "caution": "取引当事者間で決定してください。AIは入力できません。" },
  "attorney_note": "宅建士による最終確認・署名・押印が必ず必要です。本ドラフトは参考資料であり、法的効力はありません。"
}

添付されたPDFの内容から読み取れた項目は必ずstatusを"ai_filled"にし、実際に読み取った値を記載してください。PDFに記載がない項目を推測で埋めないでください。`
}

/**
 * Vercel Serverless Function: POST /api/pro-docs-draft
 * AI重説ドラフト生成の専用エンドポイント。PDFを document ブロックとして Claude へ渡す。
 * ANTHROPIC_API_KEY はサーバー環境変数のみで参照（クライアントに露出しない）
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return res.status(500).json({
      error: 'Server misconfiguration: ANTHROPIC_API_KEY is not set',
    })
  }

  let body = req.body
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body)
    } catch {
      return res.status(400).json({ error: 'Invalid JSON body' })
    }
  }
  if (!body || typeof body !== 'object') {
    return res.status(400).json({ error: 'Request body is required' })
  }

  const { address, propertyType, ageYears, pdfs, group } = body

  if (typeof address !== 'string' || address.trim() === '') {
    return res.status(400).json({ error: '物件所在地は必須です' })
  }

  const rawPdfs = Array.isArray(pdfs) ? pdfs : []

  if (rawPdfs.length > MAX_FILES) {
    return res.status(400).json({ error: 'アップロードできるPDFは最大5件です' })
  }

  // data が文字列でない要素は無視する
  const validPdfs = rawPdfs.filter(
    (f) => f && typeof f.data === 'string' && f.data.length > 0
  )

  let totalChars = 0
  for (const f of validPdfs) {
    totalChars = totalChars + f.data.length
  }
  if (totalChars > MAX_TOTAL_BASE64_CHARS) {
    return res.status(400).json({ error: 'PDFの合計サイズが上限を超えています' })
  }

  const safePropertyType =
    typeof propertyType === 'string' && propertyType !== ''
      ? propertyType
      : '不明'
  const safeAgeYears =
    typeof ageYears === 'string' || typeof ageYears === 'number'
      ? ageYears
      : ''

  // group 指定時はグループ単位の生成。未指定なら従来どおり全体を1回で生成する。
  const isGroupMode = typeof group === 'string' && group !== ''
  let groupSchema = null
  if (isGroupMode) {
    groupSchema = buildGroupSchema(group, safePropertyType)
    if (!groupSchema) {
      // その物件種別に該当カテゴリが無いグループはAIを呼ばずにスキップする
      return res.status(200).json({ text: null, skipped: true })
    }
  }

  // 公式ドキュメントの推奨どおり、PDFブロックをテキストより前に置く
  const content = []
  for (const f of validPdfs) {
    content.push({
      type: 'document',
      source: {
        type: 'base64',
        media_type: 'application/pdf',
        data: f.data,
      },
    })
  }
  // グループ生成時は最後のPDFにキャッシュの区切りを置き、2回目以降の解析コストを下げる
  if (isGroupMode && content.length > 0) {
    content[content.length - 1].cache_control = { type: 'ephemeral' }
  }

  const fileNames = validPdfs
    .map((f) => (typeof f.name === 'string' && f.name !== '' ? f.name : '名称不明'))
    .join('、')

  const propertyLines = `物件所在地: ${address}
物件種別: ${safePropertyType}
築年数: ${safeAgeYears || '不明'}
添付書類: ${validPdfs.length}件${fileNames ? `（${fileNames}）` : ''}`

  content.push({
    type: 'text',
    text: isGroupMode
      ? `${propertyLines}

添付のPDFを読み取り、以下のカテゴリについて重要事項説明書のドラフトをJSON形式で生成してください。

${groupSchema}`
      : `${propertyLines}

添付のPDFを読み取り、重要事項説明書のドラフトをJSON形式で生成してください。`,
  })

  const anthropicBody = {
    model: MODEL,
    max_tokens: isGroupMode ? MAX_TOKENS_GROUP : MAX_TOKENS,
    temperature: 0.2,
    // グループ生成時はキャッシュを効かせるため可変情報を含まない共通プロンプトを使う
    system: isGroupMode
      ? COMMON_SYSTEM_PROMPT
      : buildSystemPrompt(
          address,
          safePropertyType,
          safeAgeYears,
          validPdfs.length
        ),
    messages: [{ role: 'user', content }],
  }

  const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(anthropicBody),
  })

  const data = await anthropicRes.json().catch(() => ({}))

  if (!anthropicRes.ok) {
    const msg =
      data?.error?.message != null
        ? String(data.error.message)
        : 'Claude API request failed'
    return res.status(anthropicRes.status).json({ error: msg })
  }

  const contentOut = Array.isArray(data?.content) ? data.content : []
  const text = contentOut
    .filter((c) => c?.type === 'text' && typeof c?.text === 'string')
    .map((c) => c.text)
    .join('')

  const usage = (data && data.usage) || {}
  const inputTokens = 'input_tokens' in usage ? usage.input_tokens : null
  const outputTokens = 'output_tokens' in usage ? usage.output_tokens : null
  const cacheCreationInputTokens = 'cache_creation_input_tokens' in usage ? usage.cache_creation_input_tokens : null
  const cacheReadInputTokens = 'cache_read_input_tokens' in usage ? usage.cache_read_input_tokens : null

  try {
    await supabaseAdmin.from('ai_usage_events').insert({
      source_tool: 'main',
      feature: isGroupMode ? 'pro_docs_draft_' + group : 'pro_docs_draft',
      model: MODEL,
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      cache_creation_input_tokens: cacheCreationInputTokens,
      cache_read_input_tokens: cacheReadInputTokens,
    })
  } catch (e) {
    console.error('[ai_usage_events] insert failed:', e)
  }

  return res.status(200).json({
    text,
    usage: {
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      cache_creation_input_tokens: cacheCreationInputTokens,
      cache_read_input_tokens: cacheReadInputTokens,
    },
  })
}
