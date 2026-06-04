import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import WorkspaceNav from './WorkspaceNav'

const glass = {
  background: 'rgba(15,23,42,0.85)',
  border: '1px solid rgba(255,255,255,0.08)',
  boxShadow: '0 0 30px rgba(201,168,76,0.15)',
}

function formatDate(iso) {
  if (!iso) return '-'
  const d = new Date(iso)
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`
}

export default function HousesListPage() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')

  useEffect(() => {
    supabase.from('house_records').select('*').order('updated_at', { ascending: false })
      .then(({ data }) => { setRecords(data || []); setLoading(false) })
  }, [])

  // クライアント側フィルタ: property_name / address_raw / contract_type を NFKC正規化して部分一致
  const filtered = query.trim() ? records.filter(r => {
    const q = query.normalize('NFKC').toLowerCase()
    const check = (str) => (str || '').normalize('NFKC').toLowerCase().includes(q)
    return check(r.property_name) || check(r.address_raw) || check(r.contract_type)
  }) : records

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0A0F1E 0%, #0F172A 100%)', color: '#E2E8F0', fontFamily: "'Noto Sans JP', sans-serif" }}>

      <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, height: 64, background: 'rgba(10,15,30,0.95)', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: 12, padding: '0 24px', boxSizing: 'border-box' }}>
        <img src="/logo.png" alt="HOUSE-AI" style={{ height: 34, objectFit: 'contain', flexShrink: 0, filter: 'drop-shadow(0 0 8px rgba(201,168,76,0.6))' }} />
        <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.15)', flexShrink: 0 }} />
        <div style={{ fontSize: 14, fontWeight: 500, color: '#E2E8F0' }}>家カルテ一覧</div>
        <WorkspaceNav current="/houses" />
      </header>

      <main style={{ paddingTop: 80, paddingBottom: 40, paddingLeft: 24, paddingRight: 24, maxWidth: 1200, margin: '0 auto', boxSizing: 'border-box' }}>

        {/* 検索 */}
        <div style={{ paddingTop: 16, paddingBottom: 20 }}>
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="物件名・住所・契約種別で検索..."
            style={{ fontSize: 16, fontWeight: 400, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#E2E8F0', padding: '10px 16px', borderRadius: 10, width: '100%', boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit' }}
          />
        </div>

        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 60, gap: 10 }}>
            <span style={{ color: '#64748B', fontSize: 14, fontWeight: 400 }}>読み込み中...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', paddingTop: 60 }}>
            <div style={{ fontSize: 14, color: '#64748B', fontWeight: 400 }}>
              {query ? '検索結果がありません。' : '家カルテがありません。'}
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {filtered.map(r => (
              <div
                key={r.id}
                onClick={() => { window.location.href = `/house/${r.id}` }}
                style={{ ...glass, borderRadius: 14, padding: 20, cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, color: '#E2E8F0', marginBottom: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {r.property_name || r.address_key || '-'}
                    </div>
                    <div style={{ fontSize: 11, color: '#64748B', fontWeight: 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {r.address_raw || r.address_key || '-'}
                    </div>
                  </div>
                  <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, fontWeight: 500, background: 'rgba(201,168,76,0.12)', color: '#c9a84c', border: '1px solid rgba(201,168,76,0.3)', whiteSpace: 'nowrap', marginLeft: 8, flexShrink: 0 }}>
                    {r.transaction_count || 0}回
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 10 }}>
                  {[
                    { label: '契約種別', value: r.contract_type },
                    { label: '最終完了', value: formatDate(r.last_completed_at) },
                  ].map(item => (
                    <div key={item.label}>
                      <div style={{ fontSize: 9, color: '#64748B', fontWeight: 400, marginBottom: 2 }}>{item.label}</div>
                      <div style={{ fontSize: 12, color: '#CBD5E1', fontWeight: 400 }}>{item.value || '-'}</div>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: 10, color: '#475569', fontWeight: 400 }}>最終更新: {formatDate(r.updated_at)}</div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
