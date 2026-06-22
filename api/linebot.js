import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(200).json({ status: 'LINE Bot is running' });
  }

  const channelSecret = process.env.LINE_CHANNEL_SECRET;
  const accessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;

  const signature = req.headers['x-line-signature'];
  const body = JSON.stringify(req.body);
  const hash = crypto
    .createHmac('sha256', channelSecret)
    .update(body)
    .digest('base64');

  if (hash !== signature) {
    return res.status(403).json({ error: 'Invalid signature' });
  }

  const events = req.body.events;
  if (!events || events.length === 0) {
    return res.status(200).json({ status: 'no events' });
  }

  for (const event of events) {
    if (event.type === 'message' && event.message.type === 'text') {
      const userMessage = event.message.text;
      const replyToken = event.replyToken;

      const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 500,
          system: 'あなたはGINTETSU不動産の不動産AIコンシェルジュです。不動産に関する質問に丁寧に答えてください。回答は200文字以内でお願いします。',
          messages: [{ role: 'user', content: userMessage }],
        }),
      });

      const claudeData = await claudeResponse.json();
      const replyText = claudeData.content[0].text;

      const usage = (claudeData && claudeData.usage) || {}
      try {
        await supabaseAdmin.from('ai_usage_events').insert({
          source_tool: 'main',
          feature: 'linebot',
          model: 'claude-sonnet-4-20250514',
          input_tokens: 'input_tokens' in usage ? usage.input_tokens : null,
          output_tokens: 'output_tokens' in usage ? usage.output_tokens : null,
          cache_creation_input_tokens: 'cache_creation_input_tokens' in usage ? usage.cache_creation_input_tokens : null,
          cache_read_input_tokens: 'cache_read_input_tokens' in usage ? usage.cache_read_input_tokens : null,
        })
      } catch (e) {
        console.error('[ai_usage_events] insert failed:', e)
      }

      await fetch('https://api.line.me/v2/bot/message/reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          replyToken,
          messages: [{ type: 'text', text: replyText }],
        }),
      });
    }
  }

  return res.status(200).json({ status: 'ok' });
}