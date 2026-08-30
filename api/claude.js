import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

// 無認証の公開エンドポイントのため、リクエスト値は拒否せずサーバー側で安全な値に矯正する
const ALLOWED_MODELS = [
  'claude-sonnet-4-6',
  'claude-sonnet-4-5',
  'claude-sonnet-4-20250514',
  'claude-haiku-4-5-20251001',
  'claude-haiku-4-5',
]
const DEFAULT_MODEL = 'claude-sonnet-4-5'
const MAX_TOKENS_CAP = 4000
const DEFAULT_MAX_TOKENS = 900
const ALLOWED_TOOL_TYPES = ['web_search_20250305']

/**
 * Vercel Serverless Function: POST /api/claude
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

  const {
    model,
    system,
    messages,
    temperature = 0.4,
    max_tokens: maxTokensBody,
    maxTokens: maxTokensAlt,
    tools,
    source_tool,
    feature,
  } = body

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages must be a non-empty array' })
  }

  const safeModel =
    typeof model === 'string' && ALLOWED_MODELS.indexOf(model) !== -1
      ? model
      : DEFAULT_MODEL

  const rawMaxTokens = maxTokensBody != null ? maxTokensBody : maxTokensAlt
  const numMaxTokens = Number(rawMaxTokens)
  let max_tokens = Number.isFinite(numMaxTokens)
    ? Math.round(numMaxTokens)
    : DEFAULT_MAX_TOKENS
  if (max_tokens < 1) max_tokens = 1
  if (max_tokens > MAX_TOKENS_CAP) max_tokens = MAX_TOKENS_CAP

  const numTemperature = Number(temperature)
  let safeTemperature = Number.isFinite(numTemperature) ? numTemperature : 0.4
  if (safeTemperature < 0) safeTemperature = 0
  if (safeTemperature > 1) safeTemperature = 1

  const anthropicBody = {
    model: safeModel,
    max_tokens,
    temperature: safeTemperature,
    system: typeof system === 'string' ? system : '',
    messages,
  }
  const safeTools = Array.isArray(tools)
    ? tools.filter((t) => t && ALLOWED_TOOL_TYPES.indexOf(t.type) !== -1)
    : []
  if (safeTools.length > 0) {
    anthropicBody.tools = safeTools
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

  const content = Array.isArray(data?.content) ? data.content : []
  const text = content
    .filter((c) => c?.type === 'text' && typeof c?.text === 'string')
    .map((c) => c.text)
    .join('')

  const usage = (data && data.usage) || {}
  try {
    await supabaseAdmin.from('ai_usage_events').insert({
      source_tool: source_tool || 'main',
      feature: feature || 'unknown',
      model: anthropicBody.model,
      input_tokens: 'input_tokens' in usage ? usage.input_tokens : null,
      output_tokens: 'output_tokens' in usage ? usage.output_tokens : null,
      cache_creation_input_tokens: 'cache_creation_input_tokens' in usage ? usage.cache_creation_input_tokens : null,
      cache_read_input_tokens: 'cache_read_input_tokens' in usage ? usage.cache_read_input_tokens : null,
    })
  } catch (e) {
    console.error('[ai_usage_events] insert failed:', e)
  }

  return res.status(200).json({ text })
}
