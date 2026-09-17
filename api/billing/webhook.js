import Stripe from 'stripe'

// [probe] 一時的な調査用。実 payload の形を確認するためのもので、DB には一切書き込まない。
// 本実装（stripe_webhook_events への記録と organization_subscriptions の更新）は、
// 実際のイベントを確認したうえで差し替える。
// payload 全体はログに出さない（PII が混ざるため、必要な項目だけを出す）。

// Vercel の自動パースを無効化し、署名検証用の生バイト列を保つ
export const config = { api: { bodyParser: false } }

async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', chunk => chunks.push(chunk))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

/**
 * Vercel Serverless Function: POST /api/billing/webhook
 * 署名を検証し、イベントの形だけをログに出す。状態は何も変更しない。
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const secretKey = process.env.STRIPE_SECRET_KEY
  const webhookSecret = process.env.STRIPE_WORKSPACE_WEBHOOK_SECRET
  if (!secretKey || !webhookSecret) {
    console.error('[billing/webhook] stripe env is not configured')
    return res.status(500).json({ error: 'stripe_not_configured' })
  }

  const stripe = new Stripe(secretKey)

  const rawBody = await getRawBody(req)
  const sig = req.headers['stripe-signature']

  let event
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret)
  } catch (err) {
    console.error('[billing/webhook] signature verification failed:', err.message)
    return res.status(400).json({ error: 'invalid_signature' })
  }

  console.log(
    '[billing/webhook][probe]',
    'id=' + event.id,
    'type=' + event.type,
    'api_version=' + (event.api_version || 'none'),
    'object=' + (event.data && event.data.object ? event.data.object.object : 'none')
  )

  // Subscription 系のみ、期間情報がどの階層にあるかを特定するために出力する
  if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
    const obj = event.data.object
    console.log(
      '[billing/webhook][probe][subscription]',
      'sub_level_current_period_end=' + (obj.current_period_end || 'undefined'),
      'item_level_current_period_end=' +
        (obj.items && obj.items.data && obj.items.data[0]
          ? (obj.items.data[0].current_period_end || 'undefined')
          : 'no_items'),
      'status=' + obj.status,
      'customer=' + obj.customer,
      'metadata_org=' + (obj.metadata ? obj.metadata.workspace_org_id : 'none')
    )
  }

  return res.status(200).json({ received: true })
}
