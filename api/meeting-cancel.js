import { createClient } from '@supabase/supabase-js'

const ROLE_CANON = {
  owner: 'Owner', manager: 'Manager', staff: 'Staff', customer: 'Customer',
  broker: 'Broker', judicialscrivener: 'JudicialScrivener', bank: 'Bank',
  reformcompany: 'ReformCompany', guest: 'Guest', member: 'Member',
}
const normRole = (r) => ROLE_CANON[String(r || '').toLowerCase()] || r

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const authHeader = req.headers['authorization'] || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''
  if (!token) return res.status(401).json({ error: 'no_token' })

  const { meetingId } = req.body || {}

  const supabaseAdmin = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  // ユーザー特定
  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
  if (authError || !user) {
    console.error('meeting-cancel: getUser failed', authError)
    return res.status(401).json({ error: 'invalid_token', detail: (authError && authError.message) || null })
  }

  // 入力バリデーション
  if (!meetingId) return res.status(400).json({ error: 'meetingId required' })

  // 会議取得
  const { data: meeting, error: meetingErr } = await supabaseAdmin
    .from('workspace_meetings')
    .select('id, workspace_id, status, provider_room_name')
    .eq('id', meetingId)
    .maybeSingle()
  if (meetingErr || !meeting) return res.status(404).json({ error: 'meeting_not_found' })

  // ワークスペースメンバーシップ確認
  const { data: member, error: memberErr } = await supabaseAdmin
    .from('workspace_members')
    .select('id, role')
    .eq('workspace_id', meeting.workspace_id)
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle()
  if (memberErr || !member) return res.status(403).json({ error: 'Not a member' })

  // 権限チェック（会議を中止できるのは Owner / Manager のみ）
  const role = normRole(member.role)
  if (role !== 'Owner' && role !== 'Manager') return res.status(403).json({ error: 'Forbidden' })

  // すでに中止済みなら何もしない（冪等）
  if (meeting.status === 'cancelled') return res.status(200).json({ meeting })

  // 履歴を残すため DELETE はせず status を cancelled に更新する
  const { data: updated, error: updErr } = await supabaseAdmin
    .from('workspace_meetings')
    .update({ status: 'cancelled', updated_at: new Date().toISOString() })
    .eq('id', meetingId)
    .select()
    .single()

  if (updErr || !updated) {
    console.error('meeting-cancel: db update failed', updErr)
    return res.status(500).json({ error: 'db_update_failed' })
  }

  // Daily のルームを削除してルーム枠を解放する（失敗してもログのみ。status は既に cancelled）
  if (meeting.provider_room_name) {
    try {
      const delRes = await fetch(`https://api.daily.co/v1/rooms/${meeting.provider_room_name}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${process.env.DAILY_API_KEY}` },
      })
      if (!delRes.ok) console.error('meeting-cancel: daily room delete failed', delRes.status)
    } catch (e) {
      console.error('meeting-cancel: daily room delete error', e)
    }
  }

  return res.status(200).json({ meeting: updated })
}
