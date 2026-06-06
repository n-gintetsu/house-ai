import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import { Loader } from 'lucide-react'

export default function WorkspaceAuthGuard({ children }) {
  // null=ローディング, true=認証済み, false=未認証
  const [authed, setAuthed] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setAuthed(!!data.session)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthed(!!session)
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
