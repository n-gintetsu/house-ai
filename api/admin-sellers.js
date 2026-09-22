import { createClient } from '@supabase/supabase-js'
import { randomUUID } from 'crypto'

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
    // access_token は返さない。一覧表示に不要で、ブラウザに渡すと
    // 画面・拡張機能・スクリーンショット経由で漏れる面が増えるため。
    // 売主ポータル（api/seller.js）は Phase S0 で 503 停止中であり、
    // トークンを配る用途も今は無い。
    const { data, error } = await supabaseAdmin
      .from('sellers')
      .select('id, name, seller_name, email, phone, property_address, agent_name, agent_email, inquiry_count, view_count, created_at')
      .order('created_at', { ascending: false })
    if (error) return res.status(500).json({ error: error.message })
    return res.json({ sellers: data })
  }

  if (req.method === 'POST') {
    const { seller_name, email, phone, property_address, agent_name, agent_email } = req.body
    if (!seller_name) return res.status(400).json({ error: 'seller_name is required' })

    const access_token = randomUUID()
    const payload = {
      name: seller_name,
      seller_name,
      email,
      phone,
      property_address,
      agent_name,
      agent_email,
      access_token,
    }

    const { data, error } = await supabaseAdmin
      .from('sellers')
      .insert(payload)
      .select()
      .single()

    if (error) {
      console.error('[admin-sellers] insert error:', JSON.stringify({
        message: error.message, details: error.details, hint: error.hint, code: error.code,
      }))
      return res.status(500).json({ error: error.message, details: error.details, hint: error.hint, code: error.code })
    }
    return res.status(201).json({ seller: data })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
