import { createClient } from '@supabase/supabase-js'

const ADMIN_EMAILS = ['gintetsu.fudosan@gmail.com']

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' })

  try {
    const authHeader = req.headers['authorization'] || ''
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''
    if (!token) return res.status(401).json({ error: 'no_token' })

    const supabaseAdmin = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { persistSession: false, autoRefreshToken: false } }
    )

    const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token)
    if (userErr || !userData || !userData.user) {
      return res.status(401).json({ error: 'invalid_token' })
    }
    if (!ADMIN_EMAILS.includes(userData.user.email)) {
      return res.status(403).json({ error: 'not_admin' })
    }

    const action = req.body && req.body.action ? req.body.action : 'list'

    if (action === 'list') {
      const [reportsRes, areaReportsRes, areaFeedbackRes] = await Promise.all([
        supabaseAdmin.from('reports').select('*').order('created_at', { ascending: false }),
        supabaseAdmin.from('area_reports').select('*').is('deleted_at', null).order('created_at', { ascending: false }),
        supabaseAdmin.from('area_feedback').select('*').is('deleted_at', null).order('created_at', { ascending: false }),
      ])

      if (reportsRes.error) throw reportsRes.error
      if (areaReportsRes.error) throw areaReportsRes.error
      if (areaFeedbackRes.error) throw areaFeedbackRes.error

      return res.status(200).json({
        reports: reportsRes.data || [],
        areaReports: areaReportsRes.data || [],
        areaFeedback: areaFeedbackRes.data || [],
      })
    }

    if (action === 'update') {
      const table = req.body.table
      const id = req.body.id
      const status = req.body.status
      const allowedTables = ['reports', 'area_reports', 'area_feedback']
      const allowedStatus = ['new', 'investigating', 'resolved', 'rejected']

      if (!allowedTables.includes(table)) return res.status(400).json({ error: 'invalid_table' })
      if (!allowedStatus.includes(status)) return res.status(400).json({ error: 'invalid_status' })
      if (!id) return res.status(400).json({ error: 'invalid_id' })

      const { error } = await supabaseAdmin.from(table).update({ status }).eq('id', id)
      if (error) throw error

      return res.status(200).json({ ok: true })
    }

    return res.status(400).json({ error: 'invalid_action' })
  } catch (err) {
    console.error('[admin-area-reports] error:', err)
    return res.status(500).json({ error: '内部エラー' })
  }
}
