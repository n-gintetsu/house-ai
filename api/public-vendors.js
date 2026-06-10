import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { data, error } = await supabaseAdmin
    .from('partner_profiles')
    .select('id, company_name, ad_title, ad_description, created_at')
    .eq('ad_status', '掲載中')
    .order('created_at', { ascending: false })

  if (error) {
    return res.status(500).json({ error: error.message || 'select failed' })
  }

  return res.status(200).json({ vendors: data || [] })
}
