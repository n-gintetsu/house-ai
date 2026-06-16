import WorkspaceNav from './WorkspaceNav'

export default function MobileHeader({ current, pageTitle, actions }) {
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, display: 'flex', flexDirection: 'column', background: 'rgba(10,15,30,0.95)', borderBottom: '1px solid rgba(255,255,255,0.08)', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 48, padding: '0 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <img src="/logo.png" alt="HOUSE-AI" style={{ height: 28, objectFit: 'contain', filter: 'drop-shadow(0 0 8px rgba(201,168,76,0.6))' }} />
          <span style={{ fontSize: 13, fontWeight: 500, color: '#E2E8F0', whiteSpace: 'nowrap' }}>House-AI Workspace</span>
        </div>
        {actions ? actions : null}
      </div>
      <div style={{ padding: '2px 16px 4px', fontSize: 15, fontWeight: 500, color: '#E2E8F0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{pageTitle}</div>
      <div style={{ display: 'flex', gap: 12, overflowX: 'auto', whiteSpace: 'nowrap', padding: '0 16px 8px', WebkitOverflowScrolling: 'touch' }}>
        <WorkspaceNav current={current} />
      </div>
    </div>
  )
}
