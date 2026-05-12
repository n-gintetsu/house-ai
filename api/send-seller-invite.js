export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { seller_name, email, access_token } = req.body
  if (!email || !access_token) return res.status(400).json({ error: 'email and access_token are required' })

  const myPageUrl = `https://www.house-ai.co.jp/seller?token=${access_token}`
  const name = seller_name || 'お客様'

  const text = `${name}様\n\nこの度は弊社にご依頼いただきありがとうございます。\n以下のURLより、販売活動の状況をいつでもご確認いただけます。\n\n▼ 売主マイページ\n${myPageUrl}\n\nご不明な点はお気軽にお問い合わせください。\n\nHouse-AI サポートチーム`

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'House-AI <info@gintetsu-fudosan.co.jp>',
        to: [email],
        subject: '【House-AI】売主マイページのご案内',
        text,
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      console.error('[send-seller-invite] Resend error:', JSON.stringify(result))
      // メール失敗でも200を返す（売主登録済みのため）
      return res.json({ success: false, emailError: result })
    }

    return res.json({ success: true, id: result.id })
  } catch (err) {
    console.error('[send-seller-invite] unexpected error:', err.message)
    return res.json({ success: false, emailError: err.message })
  }
}
