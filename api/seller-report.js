import { createClient } from '@supabase/supabase-js'

const PORTALS = ['SUUMO', "HOME'S", 'アットホーム']

function aggregatePortals(activities) {
  const map = {}
  PORTALS.forEach(p => { map[p] = 0 })
  activities.forEach(a => {
    const key = PORTALS.find(p => (a.portal || a.activity_type || '').includes(p))
    if (key) map[key] += Number(a.inquiry_count ?? 0)
  })
  return map
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const { token } = req.query
  if (!token) return res.status(400).json({ error: 'token required' })

  const supabaseAdmin = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data: seller, error } = await supabaseAdmin
    .from('sellers')
    .select('*')
    .eq('access_token', token)
    .maybeSingle()

  if (error || !seller) return res.status(404).json({ error: 'Not found' })

  const { data: activities } = await supabaseAdmin
    .from('seller_activities')
    .select('*')
    .eq('seller_id', seller.id)
    .order('created_at', { ascending: false })

  const acts = activities || []
  const portalMap = aggregatePortals(acts)
  const portalLines = PORTALS.map(p => `  ${p}：${portalMap[p]}件`).join('\n')
  const totalInquiry = seller.inquiry_count ?? 0
  const totalView = seller.view_count ?? 0

  const prompt = `あなたは不動産営業の専門家です。
以下の販売活動データをもとに、売主向けのわかりやすい販売活動報告書コメントを300文字以内で生成してください。
・物件住所：${seller.address || '（未設定）'}
・期間：直近の活動ログ
・ポータル別問い合わせ数：
${portalLines}
・総問い合わせ数：${totalInquiry}件
・総閲覧数：${totalView}件
売主が安心できる、前向きなトーンで記述してください。`

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return res.status(500).json({ error: 'ANTHROPIC_API_KEY not set' })

  const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      temperature: 0.7,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  const data = await anthropicRes.json().catch(() => ({}))
  if (!anthropicRes.ok) {
    return res.status(anthropicRes.status).json({ error: data?.error?.message || 'Claude API error' })
  }

  const rawText = (data?.content ?? [])
    .filter(c => c?.type === 'text')
    .map(c => c.text)
    .join('')

  const cleanText = rawText
    .replace(/#{1,6}\s/g, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .trim()

  res.json({ report: cleanText })
}
