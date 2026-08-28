import { createClient } from '@supabase/supabase-js'
import { randomBytes, createHash, randomUUID } from 'node:crypto'

const ROLE_CANON = {
  owner: 'Owner', manager: 'Manager', staff: 'Staff', customer: 'Customer',
  broker: 'Broker', judicialscrivener: 'JudicialScrivener', bank: 'Bank',
  reformcompany: 'ReformCompany', guest: 'Guest', member: 'Member',
}
const normRole = (r) => ROLE_CANON[String(r || '').toLowerCase()] || r

const MEETING_TYPES = ['internal_meeting', 'customer_meeting', 'online_viewing']
const ROOM_TTL_MS = 24 * 60 * 60 * 1000

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const authHeader = req.headers['authorization'] || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''
  if (!token) return res.status(401).json({ error: 'no_token' })

  const { workspaceId, title, meetingType, scheduledAt, guestEnabled } = req.body || {}

  const supabaseAdmin = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  // ユーザー特定
  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
  if (authError || !user) {
    console.error('meeting-create: getUser failed', authError)
    return res.status(401).json({ error: 'invalid_token', detail: (authError && authError.message) || null })
  }

  // 入力バリデーション
  if (!workspaceId) return res.status(400).json({ error: 'workspaceId required' })
  if (!title) return res.status(400).json({ error: 'title required' })
  if (!meetingType) return res.status(400).json({ error: 'meetingType required' })
  if (!MEETING_TYPES.includes(meetingType)) return res.status(400).json({ error: 'invalid meetingType' })

  // scheduledAt は任意。省略/null なら「今すぐ開始」
  let baseTimeMs = Date.now()
  if (scheduledAt !== undefined && scheduledAt !== null && scheduledAt !== '') {
    const parsed = new Date(scheduledAt)
    if (isNaN(parsed.getTime())) return res.status(400).json({ error: 'invalid scheduledAt' })
    baseTimeMs = parsed.getTime()
  }

  // ワークスペースメンバーシップ確認
  const { data: member, error: memberErr } = await supabaseAdmin
    .from('workspace_members')
    .select('id, role')
    .eq('workspace_id', workspaceId)
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle()
  if (memberErr || !member) return res.status(403).json({ error: 'Not a member' })

  // 権限チェック（会議を作れるのは Owner / Manager のみ）
  const role = normRole(member.role)
  if (role !== 'Owner' && role !== 'Manager') return res.status(403).json({ error: 'Forbidden' })

  // ルーム名（ASCIIセーフなランダム文字列）
  const roomName = 'ws-' + randomUUID().replace(/-/g, '')

  // ルーム有効期限（基準時刻 + 24時間）
  const exp = Math.floor((baseTimeMs + ROOM_TTL_MS) / 1000)

  // Daily ルーム作成
  const dailyRes = await fetch('https://api.daily.co/v1/rooms', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.DAILY_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: roomName,
      privacy: 'private',
      properties: {
        exp,
        enable_chat: true,
        enable_screenshare: true,
        start_video_off: false,
        start_audio_off: false,
      },
    }),
  })
  if (!dailyRes.ok) {
    // Daily のレスポンス本文はログのみ。クライアントには返さない
    const detail = await dailyRes.text().catch(() => '')
    console.error('meeting-create: daily room create failed', dailyRes.status, detail)
    return res.status(502).json({ error: 'daily_room_create_failed' })
  }

  // ゲストトークン（guestEnabled が true のときのみ発行）
  let guestToken = null
  let guestTokenHash = null
  let guestExpiresAt = null
  if (guestEnabled === true) {
    guestToken = randomBytes(32).toString('base64url')
    guestTokenHash = createHash('sha256').update(guestToken).digest('hex')
    guestExpiresAt = new Date(baseTimeMs + ROOM_TTL_MS).toISOString()
  }

  // workspace_meetings へ INSERT（保存するのはハッシュのみ。平文トークンは保存しない）
  const { data: meeting, error: insErr } = await supabaseAdmin
    .from('workspace_meetings')
    .insert({
      workspace_id: workspaceId,
      created_by: user.id,
      title,
      meeting_type: meetingType,
      provider: 'daily',
      provider_room_name: roomName,
      room_url: `https://${process.env.DAILY_DOMAIN}.daily.co/${roomName}`,
      scheduled_at: scheduledAt || null,
      status: 'scheduled',
      guest_enabled: guestEnabled === true,
      guest_token_hash: guestTokenHash,
      guest_expires_at: guestExpiresAt,
    })
    .select()
    .single()

  if (insErr || !meeting) {
    console.error('meeting-create: db insert failed', insErr)
    // DB に残らないので、作成済みの Daily ルームを後始末する（失敗してもログのみ）
    try {
      const delRes = await fetch(`https://api.daily.co/v1/rooms/${roomName}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${process.env.DAILY_API_KEY}` },
      })
      if (!delRes.ok) console.error('meeting-create: daily room rollback failed', delRes.status)
    } catch (e) {
      console.error('meeting-create: daily room rollback error', e)
    }
    return res.status(500).json({ error: 'db_insert_failed' })
  }

  // guestToken はこのレスポンスでしか返らない。
  // DB には guest_token_hash（sha256）のみ保存しており平文は保存されていないため、後から再取得はできない。
  return res.status(200).json({ meeting, guestToken })
}
