import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

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

  const max_tokens =
    maxTokensBody ?? maxTokensAlt ?? 900

  const anthropicBody = {
    model: model || 'claude-sonnet-4-5',
    max_tokens,
    temperature,
    system: typeof system === 'string' ? system : '',
    messages,
  }
  if (Array.isArray(tools) && tools.length > 0) {
    anthropicBody.tools = tools
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
