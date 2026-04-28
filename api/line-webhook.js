import crypto from 'crypto';

const CHANNEL_SECRET = process.env.LINE_HOUSEAI_CHANNEL_SECRET;
const ACCESS_TOKEN = process.env.LINE_HOUSEAI_CHANNEL_ACCESS_TOKEN;

// 署名検証
function validateSignature(body, signature) {
  const hash = crypto
    .createHmac('SHA256', CHANNEL_SECRET)
    .update(body)
    .digest('base64');
  return hash === signature;
}

// LINEにメッセージ返信
async function replyMessage(replyToken, messages) {
  await fetch('https://api.line.me/v2/bot/message/reply', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${ACCESS_TOKEN}`,
    },
    body: JSON.stringify({ replyToken, messages }),
  });
}

// メッセージ内容に応じた返信を生成
function buildReply(text) {
  const t = text.trim();

  if (t.includes('住む') || t.includes('賃貸') || t.includes('購入')) {
    return [
      {
        type: 'text',
        text: '🏠 住まい探しのご相談ですね！\nエリア・予算・間取りを教えていただければ、AIが最適な物件をご提案します。',
      },
      {
        type: 'text',
        text: '👉 こちらから詳しく相談できます\nhttps://gintetsu-fudosan.com',
      },
    ];
  }

  if (t.includes('投資') || t.includes('収益')) {
    return [
      {
        type: 'text',
        text: '📈 不動産投資のご相談ですね！\n投資経験・予算・エリアをお聞かせください。',
      },
    ];
  }

  if (t.includes('査定') || t.includes('売却') || t.includes('売りたい')) {
    return [
      {
        type: 'text',
        text: '🏡 売却査定のご相談ですね！\n物件の住所・種別・築年数を教えていただければ概算をお伝えできます。',
      },
    ];
  }

  // デフォルト返信
  return [
    {
      type: 'text',
      text: `不動産AIコンシェルジュです！👋\n「住む」「投資」「売却」など、お気軽にご相談ください。\n\n▶ AIチャット\nhttps://gintetsu-fudosan.com`,
    },
  ];
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(200).send('LINE Webhook OK');
  }

  // 生のbodyを取得（署名検証用）
  const rawBody = JSON.stringify(req.body);
  const signature = req.headers['x-line-signature'];

  if (!validateSignature(rawBody, signature)) {
    console.error('Invalid signature');
    return res.status(401).send('Unauthorized');
  }

  const events = req.body.events || [];

  for (const event of events) {
    if (event.type === 'message' && event.message.type === 'text') {
      const text = event.message.text;
      const replyToken = event.replyToken;
      const messages = buildReply(text);
      await replyMessage(replyToken, messages);
    }

    // フォロー時のあいさつ
    if (event.type === 'follow') {
      await replyMessage(event.replyToken, [
        {
          type: 'text',
          text: '友だち追加ありがとうございます！🎉\n不動産AIコンシェルジュです。\n\n住まい探し・投資・売却査定など、何でもお気軽にご相談ください👇\nhttps://gintetsu-fudosan.com',
        },
      ]);
    }
  }

  return res.status(200).send('OK');
}
