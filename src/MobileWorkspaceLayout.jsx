import { useState, useEffect } from 'react'
import { Home, FolderOpen, MessageSquare, Calendar, Sparkles, Loader } from 'lucide-react'
import { supabase } from './supabaseClient'

const NAV_TABS = [
  { label: '案件',   icon: Home },
  { label: '資料',   icon: FolderOpen },
  { label: 'チャット', icon: MessageSquare },
  { label: '予定',   icon: Calendar },
  { label: 'AI',    icon: Sparkles },
]

function formatDate(dateStr) {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return '-'
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}/${m}/${day}`
}

export default function MobileWorkspaceLayout() {
  const id = new URLSearchParams(window.location.search).get('id')
  const [workspace, setWorkspace] = useState(null)
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (!id) { setLoading(false); setFailed(true); return }
    async function fetchWorkspace() {
      const { data, error } = await supabase
        .from('workspaces')
        .select('*')
        .eq('id', id)
        .is('deleted_at', null)
        .maybeSingle()
      if (error || !data) { setFailed(true); setLoading(false); return }
      setWorkspace(data)
      setLoading(false)
    }
    fetchWorkspace()
  }, [id])

  const progress = (workspace && workspace.progress) ? workspace.progress : 0
  const statusColor = (workspace && workspace.status === '完了') ? '#D4AF37' : '#38bdf8'
  const statusBg = (workspace && workspace.status === '完了') ? 'rgba(212,175,55,0.15)' : 'rgba(56,189,248,0.15)'
  const statusBorder = (workspace && workspace.status === '完了') ? 'rgba(212,175,55,0.4)' : 'rgba(56,189,248,0.4)'

  return (
    <div style={{ minHeight: '100vh', background: '#0A0F1E', color: '#E2E8F0', fontFamily: "'Noto Sans JP', sans-serif", display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>

      <div style={{ flex: 1, padding: '24px 16px 80px', boxSizing: 'border-box' }}>

        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: 10 }}>
            <Loader size={18} color="#c9a84c" />
            <span style={{ fontSize: 14, fontWeight: 400, color: '#64748B' }}>読み込み中...</span>
          </div>
        ) : failed || !workspace ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 80 }}>
            <span style={{ fontSize: 13, fontWeight: 400, color: '#c9a84c' }}>案件が見つかりません</span>
          </div>
        ) : (
          <div style={{ background: 'rgba(15,23,42,0.85)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 0 30px rgba(201,168,76,0.15)', borderRadius: 16, padding: 16 }}>

            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 20, fontWeight: 500, color: '#c9a84c', lineHeight: 1.3 }}>
                  {workspace.customer_name || '-'}様
                </div>
                {workspace.ws_code ? (
                  <div style={{ fontSize: 10, fontWeight: 400, color: '#475569', marginTop: 3, letterSpacing: 1 }}>{workspace.ws_code}</div>
                ) : null}
              </div>
              <span style={{ fontSize: 11, fontWeight: 400, padding: '3px 10px', borderRadius: 20, color: statusColor, background: statusBg, border: `1px solid ${statusBorder}`, whiteSpace: 'nowrap', flexShrink: 0, marginLeft: 8 }}>
                {workspace.status || '-'}
              </span>
            </div>

            {workspace.title ? (
              <div style={{ fontSize: 14, fontWeight: 500, color: '#E2E8F0', marginBottom: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {workspace.title}
              </div>
            ) : null}

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
              {workspace.contract_type ? (
                <span style={{ fontSize: 11, fontWeight: 400, padding: '3px 10px', borderRadius: 20, color: '#c9a84c', background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.35)' }}>
                  {workspace.contract_type}
                </span>
              ) : null}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 400, color: '#64748B', minWidth: 40 }}>担当</span>
                <span style={{ fontSize: 13, fontWeight: 400, color: '#E2E8F0' }}>{workspace.agent_name || '-'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 400, color: '#64748B', minWidth: 40 }}>更新日</span>
                <span style={{ fontSize: 13, fontWeight: 400, color: '#E2E8F0' }}>{formatDate(workspace.updated_at)}</span>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 400, color: '#64748B' }}>進捗</span>
                <span style={{ fontSize: 12, fontWeight: 500, color: '#c9a84c' }}>{progress}%</span>
              </div>
              <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg, #c9a84c, #D4AF37)', borderRadius: 3, transition: 'width 0.4s ease' }} />
              </div>
            </div>

          </div>
        )}

      </div>

      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: 64, background: 'rgba(10,15,30,0.97)', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-around', zIndex: 200, boxSizing: 'border-box' }}>
        {NAV_TABS.map((tab, i) => {
          const Icon = tab.icon
          const active = i === 0
          return (
            <div key={tab.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flex: 1 }}>
              <Icon size={20} color={active ? '#c9a84c' : '#475569'} />
              <span style={{ fontSize: 10, fontWeight: 400, color: active ? '#c9a84c' : '#475569' }}>{tab.label}</span>
            </div>
          )
        })}
      </div>

    </div>
  )
}
