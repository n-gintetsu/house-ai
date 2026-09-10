import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export default async function handler(req, res) {
  // [Phase S0] 一時停止：クライアント由来の userId / priceId を検証せず Stripe に渡す
  // 実装のため、権限昇格の経路になっていた。Phase 2 で organization 単位の
  // 契約として再設計するまで新規 Checkout Session の作成を停止する。
  // 再開する場合は、Bearer 認証で本人 ID をサーバー側で取得し、
  // priceId を allowlist で検証したうえで有効化すること。
  return res.status(503).json({ error: 'checkout_disabled' })

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { userId, email, priceId } = req.body

  if (!userId || !email || !priceId) {
    return res.status(400).json({ error: 'userId, email and priceId are required' })
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      customer_email: email,
      metadata: { userId },
      success_url: `${process.env.VITE_SITE_URL || 'https://www.gintetsu-fudosan.com'}?payment=success`,
      cancel_url: `${process.env.VITE_SITE_URL || 'https://www.gintetsu-fudosan.com'}?payment=cancel`,
    })

    res.status(200).json({ url: session.url })
  } catch (err) {
    console.error('Stripe error:', err)
    res.status(500).json({ error: err.message })
  }
}
