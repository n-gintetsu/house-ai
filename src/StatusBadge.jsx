import { CheckCircle } from 'lucide-react';

export default function StatusBadge({ status }) {
  const styles = {
    '募集中': { background: 'rgba(59,130,246,0.2)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.3)' },
    '提案あり': { background: 'rgba(34,197,94,0.2)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.3)' },
    '成約済み': { background: 'rgba(168,85,247,0.2)', color: '#c084fc', border: '1px solid rgba(168,85,247,0.3)' },
    '終了': { background: 'rgba(107,114,128,0.2)', color: '#9ca3af', border: '1px solid rgba(107,114,128,0.3)' },
  };
  const s = styles[status] || styles['終了'];
  return (
    <span style={{ ...s, padding: '4px 12px', borderRadius: 9999, fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      {status === '成約済み' ? <CheckCircle size={12} /> : null}
      {status}
    </span>
  );
}
