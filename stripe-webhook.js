import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
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
    const session = event.data.object
    const userId = session.metadata?.userId
    if (userId) {
      await supabase
        .from('profiles')
        .upsert({ id: userId, is_premium: true, stripe_customer_id: session.customer })
    }
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
