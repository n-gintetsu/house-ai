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
  } = body

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages must be a non-empty array' })
  }

  const max_tokens =
    maxTokensBody ?? maxTokensAlt ?? 900

  const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: model || 'claude-3-5-sonnet-latest',
      max_tokens,
      temperature,
      system: typeof system === 'string' ? system : '',
      messages,
    }),
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

  return res.status(200).json({ text })
}
