import { createClient } from '@supabase/supabase-js'
import { createHash, timingSafeEqual } from 'node:crypto'

const ROLE_CANON = {
  owner: 'Owner', manager: 'Manager', staff: 'Staff', customer: 'Customer',
  broker: 'Broker', judicialscrivener: 'JudicialScrivener', bank: 'Bank',
  reformcompany: 'ReformCompany', guest: 'Guest', member: 'Member',
}
const normRole = (r) => ROLE_CANON[String(r || '').toLowerCase()] || r

const TOKEN_TTL_MS = 2 * 60 * 60 * 1000
const CLOSED_STATUSES = ['cancelled', 'ended']

// 16進ハッシュ同士を定数時間で比較する。
// timingSafeEqual は長さが違うと例外を投げるため、必ず先に長さを比較する
function hashEquals(hexA, hexB) {
  if (!hexA || !hexB) return false
  let bufA
  let bufB
  try {
    bufA = Buffer.from(hexA, 'hex')
    bufB = Buffer.from(hexB, 'hex')
  } catch (e) {
    return false
  }
  if (bufA.length === 0 || bufA.length !== bufB.length) return false
  return timingSafeEqual(bufA, bufB)
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { meetingId, guestToken, guestName } = req.body || {}
  if (!meetingId) return res.status(400).json({ error: 'meetingId required' })

  const supabaseAdmin = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  // 会議取得
  const { data: meeting, error: meetingErr } = await supabaseAdmin
    .from('workspace_meetings')
    .select('*')
    .eq('id', meetingId)
    .maybeSingle()
  if (meetingErr || !meeting) return res.status(404).json({ error: 'meeting_not_found' })

  // 会議の状態チェック
  if (CLOSED_STATUSES.includes(meeting.status)) return res.status(403).json({ error: 'meeting_closed' })

  const authHeader = req.headers['authorization'] || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''

  let isOwner = false
  let userName = ''

  if (token) {
    // A) ログイン済みメンバー
    // Bearer がある場合はメンバーとして扱う。失敗してもゲストにはフォールバックしない
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    if (authError || !user) {
      console.error('meeting-join: getUser failed', authError)
      return res.status(401).json({ error: 'invalid_token', detail: (authError && authError.message) || null })
    }

    // ワークスペースメンバーシップ確認
    const { data: member, error: memberErr } = await supabaseAdmin
      .from('workspace_members')
      .select('id, role, display_name, email')
      .eq('workspace_id', meeting.workspace_id)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle()
    if (memberErr || !member) return res.status(403).json({ error: 'Not a member' })

    const role = normRole(member.role)
    isOwner = role === 'Owner' || role === 'Manager'

    // 表示名（取得に失敗しても参加は妨げない。値そのものはログに出さない）
    let profile = null
    try {
      const { data: profileData, error: profileErr } = await supabaseAdmin
        .from('profiles')
        .select('display_name')
        .eq('id', user.id)
        .maybeSingle()
      if (profileErr) console.error('meeting-join: profile fetch failed', profileErr.message || '')
      profile = profileData || null
    } catch (e) {
      console.error('meeting-join: profile fetch error')
    }

    // 優先順は WorkspacePage の既存実装に合わせる
    const profileName = (profile && profile.display_name) || ''
    const memberName = member.display_name || ''
    const emailName = (member.email || '').split('@')[0] || ''
    userName = profileName || memberName || emailName || 'メンバー'
  } else {
    // B) ゲスト
    if (!guestToken) return res.status(401).json({ error: 'no_token' })
    if (meeting.guest_enabled !== true) return res.status(403).json({ error: 'guest_disabled' })
    if (!meeting.guest_token_hash) return res.status(403).json({ error: 'guest_disabled' })

    if (!meeting.guest_expires_at) return res.status(403).json({ error: 'guest_expired' })
    const guestExpiresMs = new Date(meeting.guest_expires_at).getTime()
    if (isNaN(guestExpiresMs) || guestExpiresMs <= Date.now()) return res.status(403).json({ error: 'guest_expired' })

    // 受け取った平文トークンをハッシュ化して比較（平文はログに出さない）
    const incomingHash = createHash('sha256').update(guestToken).digest('hex')
    if (!hashEquals(incomingHash, meeting.guest_token_hash)) {
      console.error('meeting-join: guest token mismatch', meetingId)
      return res.status(403).json({ error: 'invalid_guest_token' })
    }

    isOwner = false
    userName = guestName || 'ゲスト'
  }

  // Daily meeting token 発行（room_name を必ず指定してこのルームのみに限定する）
  const exp = Math.floor((Date.now() + TOKEN_TTL_MS) / 1000)
  const dailyRes = await fetch('https://api.daily.co/v1/meeting-tokens', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.DAILY_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        room_name: meeting.provider_room_name,
        exp,
        is_owner: isOwner,
        user_name: userName,
        eject_at_token_exp: true,
      },
    }),
  })
  if (!dailyRes.ok) {
    // Daily のレスポンス本文はログのみ。クライアントには返さない
    const detail = await dailyRes.text().catch(() => '')
    console.error('meeting-join: daily token create failed', dailyRes.status, detail)
    return res.status(502).json({ error: 'daily_token_create_failed' })
  }

  const dailyData = await dailyRes.json()

  return res.status(200).json({
    roomUrl: meeting.room_url,
    token: dailyData.token,
    meetingTitle: meeting.title,
    isOwner,
  })
}
