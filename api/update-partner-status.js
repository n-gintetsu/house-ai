import { createClient } from '@supabase/supabase-js'

const ADMIN_EMAILS = ['gintetsu.fudosan@gmail.com']

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const authHeader = req.headers.authorization || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''
  if (!token) return res.status(401).json({ error: 'no_token' })

  const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token)
  if (userErr || !userData || !userData.user) {
    return res.status(401).json({ error: 'invalid_token' })
  }

  const email = userData.user.email || ''
  if (!ADMIN_EMAILS.includes(email)) {
    return res.status(403).json({ error: 'not_admin' })
  }

  const { user_id, ad_status } = req.body || {}
  if (!user_id || !ad_status) {
    return res.status(400).json({ error: 'user_id and ad_status are required' })
  }

  const { error } = await supabaseAdmin
    .from('partner_profiles')
    .upsert({ user_id, ad_status }, { onConflict: 'user_id' })
  if (error) {
    return res.status(500).json({ error: error.message || 'upsert failed' })
  }

  return res.status(200).json({ ok: true })
}
