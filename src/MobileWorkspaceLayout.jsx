import { Home, FolderOpen, MessageSquare, Calendar, Sparkles } from 'lucide-react'

const NAV_TABS = [
  { label: '案件',   icon: Home },
  { label: '資料',   icon: FolderOpen },
  { label: 'チャット', icon: MessageSquare },
  { label: '予定',   icon: Calendar },
  { label: 'AI',    icon: Sparkles },
]

export default function MobileWorkspaceLayout() {
  return (
    <div style={{ minHeight: '100vh', background: '#0A0F1E', color: '#E2E8F0', fontFamily: "'Noto Sans JP', sans-serif", display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', paddingBottom: 64 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 15, fontWeight: 500, color: '#c9a84c', marginBottom: 8 }}>スマホ版 案件アプリ</div>
          <div style={{ fontSize: 12, fontWeight: 400, color: '#475569' }}>開発中</div>
        </div>
      </div>

      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: 64, background: 'rgba(10,15,30,0.97)', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-around', zIndex: 200, boxSizing: 'border-box' }}>
        {NAV_TABS.map(tab => {
          const Icon = tab.icon
          return (
            <div key={tab.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flex: 1 }}>
              <Icon size={20} color="#475569" />
              <span style={{ fontSize: 10, fontWeight: 400, color: '#475569' }}>{tab.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
