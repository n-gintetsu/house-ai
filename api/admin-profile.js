import { createClient } from '@supabase/supabase-js'

const ADMIN_EMAILS = ['gintetsu.fudosan@gmail.com']

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export default async function handler(req, res) {
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

  if (req.method === 'GET') {
    const userId = req.query.userId || ''
    if (!userId) return res.status(400).json({ error: 'no_user_id' })
    const { data, error } = await supabaseAdmin.from('profiles').select('*').eq('id', userId).maybeSingle()
    if (error) return res.status(500).json({ error: 'db_error' })
    return res.status(200).json({ profile: data })
  }

  if (req.method === 'POST') {
    const body = req.body || {}
    const userId = body.userId || ''
    if (!userId) return res.status(400).json({ error: 'no_user_id' })
    const { error } = await supabaseAdmin.from('profiles').update({ account_status: body.account_status, status_reason: body.status_reason, status_updated_at: new Date().toISOString() }).eq('id', userId)
    if (error) return res.status(500).json({ error: 'db_error' })
    return res.status(200).json({ ok: true })
  }

  return res.status(405).json({ error: 'method_not_allowed' })
}
