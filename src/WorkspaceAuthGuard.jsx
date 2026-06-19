import { useState, useEffect, useRef } from 'react'
import { supabase } from './supabaseClient'
import { Loader } from 'lucide-react'

const CLAIM_ROLE_LABEL = {
  owner: 'Owner', manager: 'Manager', staff: '担当', customer: 'お客様',
  broker: '仲介業者', judicialscrivener: '司法書士', bank: '銀行',
  reformcompany: 'リフォーム', guest: 'Guest',
}

async function claimPendingInvitations(session) {
  try {
    const userId = session.user.id
    const email = (session.user.email || '').toLowerCase()
    if (!email) return []

    const { data: pending } = await supabase
      .from('workspace_members')
      .select('id, workspace_id, role, display_name')
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
        if (!error) {
          claimed.push(row)
          // claim 成功行に通知 + 関係者を追加（失敗してもログインを止めない）
          try {
            const joinName = row.display_name || ''
            const noticeMessage = joinName ? (joinName + '様が参加されました。') : '新しいメンバーが参加されました。'
            await supabase.from('ws_notices').insert({
              workspace_id: row.workspace_id,
              level: 'info',
              message: noticeMessage,
            })
            const { data: existingMember } = await supabase
              .from('ws_members')
              .select('id')
              .eq('workspace_id', row.workspace_id)
              .eq('name', joinName)
              .maybeSingle()
            if (!existingMember) {
              const roleKey = String(row.role || '').toLowerCase()
              const roleLabel = CLAIM_ROLE_LABEL[roleKey] || row.role || ''
              await supabase.from('ws_members').insert({
                workspace_id: row.workspace_id,
                name: joinName,
                role_label: roleLabel,
                permission: row.role,
              })
            }
          } catch (notifyErr) {
            console.error('claimPendingInvitations notify error', notifyErr)
          }
        }
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
