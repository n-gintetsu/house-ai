import { useState } from 'react'
import { supabase } from './supabaseClient'

// ロールの表示は必ず正規化を通す（保存値が小文字のことがある）
const ROLE_CANON = { owner: 'Owner', manager: 'Manager', staff: 'Staff', customer: 'Customer', broker: 'Broker', judicialscrivener: 'JudicialScrivener', bank: 'Bank', reformcompany: 'ReformCompany', guest: 'Guest', member: 'Member' }
const normRole = (r) => ROLE_CANON[String(r || '').toLowerCase()] || r
const PERMISSION_LABEL = {
  Owner: 'Owner', Manager: 'Manager', Staff: 'スタッフ', Customer: 'お客様',
  Broker: '仲介業者', JudicialScrivener: '司法書士', Bank: '金融機関', ReformCompany: 'リフォーム会社', Guest: 'Guest',
  Member: 'Member',
}

const NOTIFY_ERROR_LABEL = {
  too_many_requests: '先ほど同じ内容でお知らせ済みです。しばらく経ってからお試しください。',
  insufficient_permission: 'この操作の権限がありません。',
  recipient_not_found: '宛先が見つかりませんでした。',
  recipient_not_linked: 'この方はまだアカウントが有効化されていません。',
  target_not_found: '対象が見つかりませんでした。',
  billing_required: 'ご契約が必要です。',
  notify_failed: 'お知らせを送れませんでした。時間をおいてお試しください。',
  duplicate_cooldown: '先ほど同じ内容でお知らせ済みです。',
  recipient_rate_limit: '確認依頼の送信上限に達しています。時間をおいてお試しください。',
}

// body には宛先メンバーIDと対象だけを渡す。送信者・メール・LINEのIDはサーバーが決める。
async function postNotify(payload) {
  const { data: sess } = await supabase.auth.getSession()
  const token = (sess && sess.session && sess.session.access_token) || ''
  if (!token) return { ok: false, status: 0, data: {} }
  try {
    const res = await fetch('/api/workspace/notify-line', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
      body: JSON.stringify(payload),
    })
    const data = await res.json().catch(() => ({}))
    return { ok: res.ok, status: res.status, data: data || {} }
  } catch (e) {
    console.error(e)
    return { ok: false, status: 0, data: {} }
  }
}

export default function ConfirmRequestButton({ workspaceId, targetType, targetId, members, currentUserId }) {
  const [open, setOpen] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  // 送れる相手は「この案件の active メンバーで、アカウントが有効で、自分以外」
  const candidates = (members || []).filter(m => {
    if (!m) return false
    if (m.status !== 'active') return false
    if (!m.user_id) return false
    if (m.user_id === currentUserId) return false
    return true
  })

  const handleOpen = () => {
    setError('')
    setDone(false)
    setOpen(prev => !prev)
  }

  const handleClose = () => {
    setOpen(false)
    setError('')
    setDone(false)
  }

  const handleSend = async (memberId) => {
    if (sending) return
    setSending(true)
    setError('')
    const r = await postNotify({
      workspaceId: workspaceId,
      recipientMemberId: memberId,
      targetType: targetType,
      targetId: targetId,
    })
    setSending(false)
    if (r.ok) {
      setDone(true)
      setTimeout(() => {
        setOpen(false)
        setDone(false)
      }, 2000)
      return
    }
    setError(NOTIFY_ERROR_LABEL[r.data && r.data.error] || 'お知らせを送れませんでした。時間をおいてお試しください。')
  }

  return (
    <div style={{ position: 'relative', display: 'inline-block', flexShrink: 0 }}>
      <button
        onClick={handleOpen}
        title="確認を依頼"
        style={{ background: 'transparent', color: '#c9a84c', border: '1px solid rgba(201,168,76,0.4)', borderRadius: 4, padding: '4px 8px', fontSize: 11, fontWeight: 400, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}
      >確認を依頼</button>
      {open ? (
        <>
          <div onClick={handleClose} style={{ position: 'fixed', inset: 0, zIndex: 40 }} />
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ position: 'absolute', top: 28, right: 0, width: 220, background: 'rgba(15,23,42,.97)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 10, boxShadow: '0 8px 30px rgba(0,0,0,.5)', zIndex: 50, padding: 8, textAlign: 'left' }}
          >
            <div style={{ fontSize: 10, color: '#c9a84c', fontWeight: 500, letterSpacing: 1, marginBottom: 6 }}>確認を依頼する相手</div>
            {done ? (
              <div style={{ fontSize: 11, color: '#c9a84c', fontWeight: 400, padding: '6px 0' }}>お知らせしました</div>
            ) : sending ? (
              <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 400, padding: '6px 0' }}>送信中...</div>
            ) : candidates.length === 0 ? (
              <div style={{ fontSize: 11, color: '#475569', fontWeight: 400, padding: '6px 0' }}>送信できる相手がいません</div>
            ) : (
              candidates.map(m => {
                const label = m.display_name ? m.display_name : '（名前未設定）'
                const roleLabel = PERMISSION_LABEL[normRole(m.role)] || normRole(m.role) || ''
                return (
                  <div
                    key={m.id}
                    onClick={() => handleSend(m.id)}
                    style={{ padding: '7px 8px', borderRadius: 6, cursor: 'pointer', borderTop: '1px solid rgba(255,255,255,0.05)' }}
                  >
                    <div style={{ fontSize: 11, color: '#CBD5E1', fontWeight: 400, wordBreak: 'break-all' }}>{label}</div>
                    <div style={{ fontSize: 9, color: '#64748B', fontWeight: 400 }}>{roleLabel}</div>
                  </div>
                )
              })
            )}
            {error !== '' ? (
              <div style={{ fontSize: 10, color: '#F87171', fontWeight: 400, marginTop: 6, lineHeight: 1.6 }}>{error}</div>
            ) : null}
          </div>
        </>
      ) : null}
    </div>
  )
}
