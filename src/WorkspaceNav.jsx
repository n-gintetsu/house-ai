import { supabase } from './supabaseClient'
import { LogOut } from 'lucide-react'

const NAV_ITEMS = [
  { label: '案件',      href: '/workspace' },
  { label: '家カルテ',  href: '/houses' },
  { label: '顧客カルテ', href: '/clients' },
]

export default function WorkspaceNav({ current }) {
  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.replace('/login')
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
      {NAV_ITEMS.map((item, idx) => (
        <div key={item.href} style={{ display: 'flex', alignItems: 'center' }}>
          <button
            onClick={() => { window.location.href = item.href }}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '4px 10px',
              borderRadius: 6,
              fontSize: 12,
              fontWeight: current === item.href ? 500 : 400,
              color: current === item.href ? '#c9a84c' : '#64748B',
              borderBottom: current === item.href ? '1px solid rgba(201,168,76,0.5)' : '1px solid transparent',
            }}
          >{item.label}</button>
          {idx < NAV_ITEMS.length - 1 ? (
            <span style={{ color: 'rgba(255,255,255,0.12)', fontSize: 11, userSelect: 'none' }}>|</span>
          ) : null}
        </div>
      ))}
      <div style={{ width: 1, height: 14, background: 'rgba(255,255,255,0.1)', margin: '0 6px', flexShrink: 0 }} />
      <button
        onClick={handleLogout}
        title="ログアウト"
        style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px 8px', borderRadius: 6, color: '#475569' }}
      >
        <LogOut size={12} />
        <span style={{ fontSize: 11, fontWeight: 400, color: '#475569' }}>ログアウト</span>
      </button>
    </div>
  )
}
