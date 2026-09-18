import { useState, useEffect, useRef } from 'react'
import { supabase } from './supabaseClient'
import { Loader } from 'lucide-react'

// 招待の受諾はサーバー側で行う（対象は必ずセッションのメールアドレスから決まる）
async function claimPendingInvitations(session) {
  const { data: sess } = await supabase.auth.getSession()
  const token = (sess && sess.session && sess.session.access_token) || ''
  if (!token) return []
  try {
    const res = await fetch('/api/workspace/claim-invite', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + token },
    })
    if (!res.ok) return []
    const data = await res.json().catch(() => ({}))
    const ids = (data && data.workspaceIds) || []
    // 呼び出し側は claimed[0].workspace_id を読むため、その形に揃えて返す
    return ids.map(wid => ({ workspace_id: wid }))
  } catch (e) {
    console.error(e)
    return []
  }
}

export default function WorkspaceAuthGuard({ children }) {
  // null=ローディング, true=認証済み, false=未認証
  const [authed, setAuthed] = useState(null)
  const claimedRef = useRef(false)

  async function runClaim(session) {
    if (!session || claimedRef.current) return
    claimedRef.current = true
    const claimed = await claimPendingInvitations(session)
    if (claimed.length > 0 && !window.location.search.includes('id=')) {
      window.location.href = `/workspace?id=${claimed[0].workspace_id}`
    }
  }

  useEffect(() => {
    let mounted = true

    // 速い経路：すでにセッションがキャッシュにあれば即表示（true のみセット・false は出さない）
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return
      if (data.session) { setAuthed(true) }
      runClaim(data.session)
    })

    // 確定判定：INITIAL_SESSION（クライアントがセッション復元＋必要ならリフレッシュした後に1回発火）を正とする。
    // キャッシュミスやリフレッシュ中は false にせず、ここで確定させる。
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return
      if (event === 'INITIAL_SESSION') {
        setAuthed(!!session)
      } else if (session) {
        setAuthed(true)
      } else if (event === 'SIGNED_OUT') {
        setAuthed(false)
      }
      runClaim(session)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (authed === false) {
      window.location.replace('/login')
    }
  }, [authed])

  if (authed !== true) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0A0F1E 0%, #0F172A 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, fontFamily: "'Noto Sans JP', sans-serif" }}>
        <Loader size={18} color="#c9a84c" />
        <span style={{ fontSize: 13, color: '#475569', fontWeight: 400 }}>確認中...</span>
      </div>
    )
  }

  return children
}
