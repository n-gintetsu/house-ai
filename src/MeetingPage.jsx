import { useState, useEffect, useRef } from 'react'
import DailyIframe from '@daily-co/daily-js'
import { supabase } from './supabaseClient'
import { Loader } from 'lucide-react'

const JOIN_ERROR_LABEL = {
  meeting_not_found: '会議が見つかりません',
  meeting_closed: 'この会議は終了しています',
  guest_disabled: 'この会議はゲスト参加を受け付けていません',
  guest_expired: '招待リンクの有効期限が切れています',
  invalid_guest_token: '招待リンクが正しくありません',
  'Not a member': 'この会議に参加する権限がありません',
  no_token: '招待リンクが必要です',
  invalid_token: 'ログインの有効期限が切れています。再度ログインしてください',
}

// /meeting/<id> の <id> を取り出す（末尾スラッシュは除去）
function readMeetingId() {
  const path = window.location.pathname
  const raw = path.startsWith('/meeting/') ? path.slice('/meeting/'.length) : ''
  return raw.replace(/\/+$/, '')
}

export default function MeetingPage() {
  const [phase, setPhase] = useState('loading')
  const [errorMsg, setErrorMsg] = useState('')
  const [meetingTitle, setMeetingTitle] = useState('')
  const containerRef = useRef(null)
  const callRef = useRef(null)

  useEffect(() => {
    let mounted = true
    let destroyed = false

    async function start() {
      const meetingId = readMeetingId()
      const guestToken = new URLSearchParams(window.location.search).get('g') || ''

      if (!meetingId) {
        setErrorMsg('会議が見つかりません')
        setPhase('error')
        return
      }

      // ログイン済みなら Bearer を付ける。ゲストは付けない
      const { data } = await supabase.auth.getSession()
      const token = (data && data.session && data.session.access_token) || ''
      const headers = { 'Content-Type': 'application/json' }
      if (token) headers['Authorization'] = 'Bearer ' + token

      const res = await fetch('/api/meeting-join', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ meetingId: meetingId, guestToken: guestToken, guestName: '' }),
      })

      if (!res.ok) {
        const json = await res.clone().json().catch(() => null)
        const code = (json && json.error) || ''
        if (!mounted) return
        setErrorMsg(JOIN_ERROR_LABEL[code] || '会議に参加できませんでした')
        setPhase('error')
        return
      }

      const json = await res.json()
      if (!mounted) return
      setMeetingTitle(json.meetingTitle || '')
      setPhase('joining')

      if (!containerRef.current) return
      // 二重生成を防ぐ（StrictMode の再実行対策）
      if (callRef.current) return

      const call = DailyIframe.createFrame(containerRef.current, {
        showLeaveButton: true,
        lang: 'jp',
        iframeStyle: { width: '100%', height: '100%', border: '0' },
      })
      callRef.current = call

      call.on('joined-meeting', () => { if (destroyed) return; setPhase('joined') })
      call.on('left-meeting', () => { if (destroyed) return; setPhase('left') })
      call.on('error', (e) => {
        if (destroyed) return
        console.error('daily error', e)
        setErrorMsg('接続エラーが発生しました')
        setPhase('error')
      })

      try {
        await call.join({ url: json.roomUrl, token: json.token })
        if (!mounted) return
        setPhase('joined')
      } catch (e) {
        console.error('daily join error', e)
        if (!mounted) return
        setErrorMsg('会議への接続に失敗しました')
        setPhase('error')
      }
    }

    start()

    return () => {
      mounted = false
      destroyed = true
      if (callRef.current) {
        try {
          callRef.current.destroy()
        } catch (e) {
          console.error('daily destroy error', e)
        }
        callRef.current = null
      }
    }
  }, [])

  const page = {
    minHeight: '100vh',
    background: '#0A0F1E',
    color: '#E2E8F0',
    fontFamily: "'Noto Sans JP', sans-serif",
    position: 'relative',
    overflow: 'hidden',
  }
  const center = {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  }
  const backBtn = {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    color: '#E2E8F0',
    borderRadius: 8,
    padding: '8px 16px',
    fontSize: 13,
    fontWeight: 400,
    cursor: 'pointer',
  }

  return (
    <div style={page}>
      {phase === 'loading' ? (
        <div style={{ ...center, flexDirection: 'row', gap: 12 }}>
          <Loader size={22} color="#c9a84c" />
          <span style={{ fontSize: 14, color: '#64748B', fontWeight: 400 }}>接続しています...</span>
        </div>
      ) : null}

      {phase === 'error' ? (
        <div style={center}>
          <div style={{ fontSize: 15, color: '#94A3B8', fontWeight: 400 }}>{errorMsg || '会議に参加できませんでした'}</div>
          <button onClick={() => { window.location.href = '/workspace' }} style={backBtn}>Workspaceに戻る</button>
        </div>
      ) : null}

      {phase === 'left' ? (
        <div style={center}>
          <div style={{ fontSize: 15, color: '#94A3B8', fontWeight: 400 }}>会議を終了しました</div>
          <button onClick={() => { window.location.href = '/workspace' }} style={backBtn}>Workspaceに戻る</button>
        </div>
      ) : null}

      {phase === 'joined' && meetingTitle ? (
        <div style={{ padding: '8px 16px', fontSize: 12, color: '#64748B', fontWeight: 400, position: 'absolute', top: 0, left: 0, zIndex: 2, pointerEvents: 'none' }}>{meetingTitle}</div>
      ) : null}

      {/* 通話コンテナは createFrame の時点で DOM が必要なので常に描画し、未参加時は非表示にする */}
      <div
        ref={containerRef}
        style={{
          display: (phase === 'joined' || phase === 'joining') ? 'block' : 'none',
          width: '100%',
          height: '100vh',
        }}
      />
    </div>
  )
}
