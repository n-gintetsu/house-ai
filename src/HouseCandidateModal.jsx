import { PROPERTY_TYPES } from './workspaceConstants'
import { House, Plus, X } from 'lucide-react'

// 同じ住所の家カルテが見つかったときに、どこへ保存するかを人が選ぶ画面。
// 候補が1件でも自動では合流しない。PC とモバイルで共用する。
const glass = {
  background: 'rgba(15,23,42,0.85)',
  border: '1px solid rgba(255,255,255,0.08)',
  boxShadow: '0 0 30px rgba(201,168,76,0.15)',
}

function formatDay(iso) {
  if (!iso) return '-'
  const d = new Date(iso)
  if (isNaN(d.getTime())) return '-'
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`
}

function typeLabel(value) {
  const def = PROPERTY_TYPES.filter(pt => pt.value === value)[0]
  if (def) return def.label
  return value ? value : '未入力'
}

export default function HouseCandidateModal({ candidates, address, busy, onSelect, onCreateNew, onCancel }) {
  const list = candidates || []
  const labelStyle = { fontSize: 11, color: '#94A3B8', marginBottom: 6, fontWeight: 400 }
  const footBtnBase = { flex: 1, minWidth: 0, borderRadius: 8, padding: '10px', fontSize: 14, fontWeight: 500, cursor: busy ? 'not-allowed' : 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.72)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ ...glass, borderRadius: 16, padding: 24, width: '100%', maxWidth: 520, maxHeight: 'calc(100vh - 40px)', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 12, flexShrink: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 500, color: '#E2E8F0' }}>同じ住所の家カルテがあります</div>
          <button onClick={onCancel} disabled={busy} style={{ background: 'transparent', border: 'none', cursor: busy ? 'not-allowed' : 'pointer', padding: 4, flexShrink: 0 }}>
            <X size={18} color="#64748B" />
          </button>
        </div>

        <div style={{ fontSize: 12, color: '#94A3B8', fontWeight: 400, lineHeight: 1.7, marginBottom: 14, flexShrink: 0 }}>
          同じ物件であれば既存の家カルテに追加してください。同じ住所でも別の部屋・別の棟・別の物件であれば、新規作成を選んでください。
        </div>

        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px 14px', marginBottom: 14, flexShrink: 0 }}>
          <div style={labelStyle}>今回の住所</div>
          <div style={{ fontSize: 13, color: '#CBD5E1', fontWeight: 400, wordBreak: 'break-all', lineHeight: 1.6 }}>{address ? address : '-'}</div>
        </div>

        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
          {list.length === 0 ? (
            <div style={{ fontSize: 12, color: '#475569', fontWeight: 400 }}>候補はありません。</div>
          ) : (
            list.map(c => (
              <div key={c.id} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '12px 14px' }}>
                <div style={{ fontSize: 13, color: '#E2E8F0', fontWeight: 500, wordBreak: 'break-all', lineHeight: 1.6, marginBottom: 6 }}>
                  {c.address_raw ? c.address_raw : '-'}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 10 }}>
                  <span style={{ fontSize: 11, color: '#94A3B8', fontWeight: 400 }}>{typeLabel(c.property_type)}</span>
                  {c.building_name ? (
                    <span style={{ fontSize: 11, color: '#94A3B8', fontWeight: 400 }}>{c.building_name}</span>
                  ) : null}
                  {c.unit_no ? (
                    <span style={{ fontSize: 11, color: '#94A3B8', fontWeight: 400 }}>{c.unit_no}</span>
                  ) : null}
                  <span style={{ fontSize: 11, color: '#64748B', fontWeight: 400 }}>取引{c.transaction_count || 0}回</span>
                  <span style={{ fontSize: 11, color: '#64748B', fontWeight: 400 }}>最終完了 {formatDay(c.last_completed_at)}</span>
                </div>
                <button
                  onClick={() => onSelect(c.id)}
                  disabled={busy}
                  style={{ display: 'flex', alignItems: 'center', gap: 5, background: busy ? 'rgba(201,168,76,0.5)' : '#c9a84c', color: '#0A0F1E', border: 'none', borderRadius: 7, padding: '7px 14px', fontSize: 12, fontWeight: 500, cursor: busy ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}
                >
                  <House size={13} />この家カルテに追加
                </button>
              </div>
            ))
          )}
        </div>

        <div style={{ display: 'flex', gap: 10, flexShrink: 0, flexWrap: 'wrap' }}>
          <button
            onClick={onCreateNew}
            disabled={busy}
            style={{ ...footBtnBase, background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.35)', color: '#c9a84c' }}
          >
            <Plus size={14} />別の物件として新規作成
          </button>
          <button
            onClick={onCancel}
            disabled={busy}
            style={{ ...footBtnBase, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#94A3B8', fontWeight: 400 }}
          >
            今は保存しない
          </button>
        </div>

      </div>
    </div>
  )
}
