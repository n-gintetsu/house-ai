import { useState, useEffect, useRef } from 'react'
import { supabase } from './supabaseClient'
import { Loader } from 'lucide-react'

async function claimPendingInvitations(session) {
  try {
    const userId = session.user.id
    const email = (session.user.email || '').toLowerCase()
    if (!email) return []

    const { data: pending } = await supabase
      .from('workspace_members')
      .select('id, workspace_id')
      .is('user_id', null)
      .eq('email', email)

    if (!pending || pending.length === 0) return []

    const claimed = []
    for (const row of pending) {
      const { data: existing } = await supabase
        .from('workspace_members')
        .select('id')
        .eq('workspace_id', row.workspace_id)
        .eq('user_id', userId)
        .eq('status', 'active')
        .maybeSingle()

      if (!existing) {
        const { error } = await supabase
          .from('workspace_members')
          .update({ user_id: userId, status: 'active' })
          .eq('id', row.id)
        if (!error) claimed.push(row)
      }
    }
    return claimed
  } catch (e) {
    console.error('claimPendingInvitations error', e)
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
    supabase.auth.getSession().then(({ data }) => {
      setAuthed(!!data.session)
      runClaim(data.session)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthed(!!session)
      runClaim(session)
    })
    return () => subscription.unsubscribe()
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
