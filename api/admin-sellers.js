import { createClient } from '@supabase/supabase-js'
import { randomUUID } from 'crypto'

export default async function handler(req, res) {
  const supabaseAdmin = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  if (req.method === 'GET') {
    const { data, error } = await supabaseAdmin
      .from('sellers')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) return res.status(500).json({ error: error.message })
    return res.json({ sellers: data })
  }

  if (req.method === 'POST') {
    const { seller_name, email, phone, property_address, agent_name, agent_phone } = req.body
    if (!seller_name) return res.status(400).json({ error: 'seller_name is required' })

    const access_token = randomUUID()
    const payload = {
      name: seller_name,       // NOT NULL カラム name に seller_name をマップ
      email,
      phone,
      property_address,
      agent_name,
      agent_phone,
      access_token,
    }
    console.log('[admin-sellers] inserting payload:', JSON.stringify(payload))

    const { data, error } = await supabaseAdmin
      .from('sellers')
      .insert(payload)
      .select()
      .single()

    if (error) {
      console.error('[admin-sellers] insert error:', JSON.stringify({
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      }))
      return res.status(500).json({
        error: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      })
    }
    return res.status(201).json({ seller: data })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
