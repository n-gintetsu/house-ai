import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export const config = { api: { bodyParser: false } }

async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', chunk => chunks.push(chunk))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

export default async function handler(req, res) {
  // [Phase S0] 一時停止：旧課金フロー（api/stripe-checkout.js も 503 停止中）の受け口。
  // 現行の課金 Webhook は api/billing/webhook.js。Stripe 側にこのエンドポイントの登録は無い（Test/Live とも確認済み）。
  return res.status(503).json({ error: 'legacy_webhook_disabled' })

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const rawBody = await getRawBody(req)
  const sig = req.headers['stripe-signature']
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  let event
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret)
  } catch (err) {
    console.error('Webhook signature error:', err.message)
    return res.status(400).json({ error: `Webhook Error: ${err.message}` })
  }

  if (event.type === 'checkout.session.completed') {
    // [Phase S0] 一時停止：metadata.userId はクライアントが自由に設定できる値であり、
    // これを信用した権限付与は他人アカウントの有料化を許してしまう。
    // Phase 2 で organization_subscriptions（組織単位の契約テーブル）を導入し、
    // サーバー側の対応表から契約先を特定する方式に置き換えるまで書き込みを停止する。
    console.warn('[stripe-webhook] checkout.session.completed received but skipped (Phase S0):', event.id)
  }

  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object
    const customerId = subscription.customer
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id')
      .eq('stripe_customer_id', customerId)
    if (profiles?.length > 0) {
      await supabase
        .from('profiles')
        .update({ is_premium: false })
        .eq('stripe_customer_id', customerId)
    }
  }

  res.status(200).json({ received: true })
}
