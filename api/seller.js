import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const { token } = req.query
  if (!token) return res.status(400).json({ error: 'token required' })

  const supabaseAdmin = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data: seller, error } = await supabaseAdmin
    .from('sellers')
    .select('*')
    .eq('access_token', token)
    .maybeSingle()

  if (error) return res.status(500).json({ error: 'Database error' })
  if (!seller) return res.status(404).json({ error: 'Not found' })

  const { data: activities } = await supabaseAdmin
    .from('seller_activities')
    .select('*')
    .eq('seller_id', seller.id)
    .order('created_at', { ascending: false })

  res.json({ seller, activities: activities || [] })
}
