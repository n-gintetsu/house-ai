import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { message, property, history = [] } = req.body;

  const propertyInfo = property ? `
物件名: ${property.title || '不明'}
価格: ${property.price ? property.price + '万円' : property.rent ? '¥' + Number(property.rent).toLocaleString() + '/月' : '価格応相談'}
住所: ${property.address || '不明'}
種別: ${property.deal_type === 'rent' ? '賃貸' : '売買'}
` : '物件情報なし';

  const systemPrompt = `あなたは不動産AIアドバイザーです。ユーザーの意思決定を支援し、具体的な行動に繋げることが目的です。

以下のフォーマットで必ず回答してください：

【結論】
この物件は「◯◯な人にはアリ / ナシ」です。

【理由】
・◯◯
・◯◯

【注意点（重要）】
・◯◯
・◯◯

【対策】
・◯◯を確認
・◯◯と比較

【次にやるべきこと】
👉 AIにさらに聞く
👉 他の物件と比較する
👉 問い合わせする

【評価】
おすすめ度：★★★★☆
危険度：★★☆☆☆

ルール：
- 結論ファースト
- 曖昧禁止・具体的に
- 必ず行動に繋げる
- 中立的な立場で回答
- 日本語で簡潔に（各項目2〜3行以内）
`;

  const messages = [
    ...history,
    { role: 'user', content: `物件情報:\n${propertyInfo}\n\n質問: ${message}` }
  ];

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 600,
        system: systemPrompt,
        messages,
      }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || 'API error');
    const usage = (data && data.usage) || {}
    try {
      await supabaseAdmin.from('ai_usage_events').insert({
        source_tool: 'main',
        feature: 'property_chat',
        model: 'claude-haiku-4-5-20251001',
        input_tokens: 'input_tokens' in usage ? usage.input_tokens : null,
        output_tokens: 'output_tokens' in usage ? usage.output_tokens : null,
        cache_creation_input_tokens: 'cache_creation_input_tokens' in usage ? usage.cache_creation_input_tokens : null,
        cache_read_input_tokens: 'cache_read_input_tokens' in usage ? usage.cache_read_input_tokens : null,
      })
    } catch (e) {
      console.error('[ai_usage_events] insert failed:', e)
    }
    res.json({ reply: data.content[0].text });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
