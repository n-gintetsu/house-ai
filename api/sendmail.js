export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { type, data } = req.body;

  const subjects = {
    valuation: '【売主査定依頼】新しい査定依頼が届きました',
    owner: '【オーナー依頼】新しい依頼が届きました',
    expert: '【専門家紹介依頼】新しい依頼が届きました',
    agency: '【業者登録申請】新規業者様からの登録申請があります',
  };

  const subject = subjects[type] || '【お問い合わせ】新しい依頼が届きました';

  const body = Object.entries(data)
    .map(([key, value]) => `${key}：${value}`)
    .join('\n');

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: 'House AI <onboarding@resend.dev>',
      to: ['info@gintetsu-fudosan.co.jp'],
      subject: subject,
      text: `新しい依頼が届きました。\n\n${body}\n\n--\nHouse AI プラットフォーム`,
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    return res.status(500).json({ error: result });
  }

  return res.status(200).json({ success: true });
}