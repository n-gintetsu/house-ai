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
    const { seller_name, email, phone, address, agent_name, agent_phone } = req.body
    if (!seller_name || !email) return res.status(400).json({ error: 'seller_name and email are required' })

    const access_token = randomUUID()
    const { data, error } = await supabaseAdmin
      .from('sellers')
      .insert({ seller_name, email, phone, address, agent_name, agent_phone, access_token })
      .select()
      .single()
    if (error) return res.status(500).json({ error: error.message })
    return res.status(201).json({ seller: data })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
