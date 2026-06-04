import { useState, useEffect } from 'react'
import { ChevronLeft } from 'lucide-react'
import { supabase } from './supabaseClient'

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

function formatEventDate(dateStr) {
  if (!dateStr) return ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const parts = dateStr.split('-')
    return `${parseInt(parts[1])}/${parseInt(parts[2])}`
  }
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

export default function HouseRecordPage() {
  const houseId = window.location.pathname.split('/')[2]
  const [record, setRecord] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!houseId) { setNotFound(true); setLoading(false); return }
    supabase.from('house_records').select('*').eq('id', houseId).single()
      .then(({ data, error }) => {
        if (error || !data) { setNotFound(true) } else { setRecord(data) }
        setLoading(false)
      })
  }, [houseId])

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0A0F1E 0%, #0F172A 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#E2E8F0', fontFamily: "'Noto Sans JP', sans-serif" }}>
        <span style={{ fontSize: 14, color: '#64748B', fontWeight: 400 }}>読み込み中...</span>
      </div>
    )
  }

  if (notFound || !record) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0A0F1E 0%, #0F172A 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, color: '#E2E8F0', fontFamily: "'Noto Sans JP', sans-serif" }}>
        <div style={{ fontSize: 15, color: '#94A3B8', fontWeight: 400 }}>家カルテが見つかりません。</div>
        <button onClick={() => { window.location.href = '/workspace' }} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#E2E8F0', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 400, cursor: 'pointer' }}>
          <ChevronLeft size={14} />一覧に戻る
        </button>
      </div>
    )
  }

  const snap = record.snapshot || {}
  const property = snap.property || {}
  const meta = snap.meta || {}
  const roadmap = snap.roadmap || []
  const timeline = snap.timeline || []
  const members = snap.members || []
  const transactions = record.transactions || []

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0A0F1E 0%, #0F172A 100%)', color: '#E2E8F0', fontFamily: "'Noto Sans JP', sans-serif" }}>

      {/* ヘッダー（疑似ガラス。backdrop-filterは使わない） */}
      <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, height: 64, background: 'rgba(10,15,30,0.95)', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: 12, padding: '0 24px', boxSizing: 'border-box' }}>
        <img src="/logo.png" alt="HOUSE-AI" style={{ height: 34, objectFit: 'contain', flexShrink: 0, filter: 'drop-shadow(0 0 8px rgba(201,168,76,0.6))' }} />
        <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.15)', flexShrink: 0 }} />
        <button onClick={() => { window.history.back() }} style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px 6px', flexShrink: 0 }}>
          <ChevronLeft size={14} color="#64748B" />
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: '#E2E8F0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {property.property_name || record.address_key || '家カルテ'}
          </div>
          <div style={{ fontSize: 10, color: '#c9a84c', fontWeight: 400, letterSpacing: 1 }}>HOUSE RECORD</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.35)', borderRadius: 20, padding: '3px 12px' }}>
            <span style={{ fontSize: 11, color: '#c9a84c', fontWeight: 500 }}>取引{record.transaction_count || 0}回</span>
          </div>
        </div>
      </header>

      <main style={{ paddingTop: 80, paddingBottom: 60, paddingLeft: 24, paddingRight: 24, maxWidth: 1000, margin: '0 auto', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* 物件基本情報 */}
        <div style={{ ...glass, borderRadius: 14, padding: 24 }}>
          <div style={{ fontSize: 10, color: '#c9a84c', fontWeight: 500, letterSpacing: 3, marginBottom: 10 }}>PROPERTY</div>
          <div style={{ fontSize: 18, fontWeight: 500, color: '#E2E8F0', marginBottom: 4 }}>
            {property.property_name || record.property_name || '-'}
          </div>
          <div style={{ fontSize: 13, color: '#94A3B8', fontWeight: 400, marginBottom: 18 }}>
            {property.address_raw || record.address_raw || record.address_key || '-'}
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {[
              { label: '契約種別',  value: property.contract_type || record.contract_type },
              { label: '取引回数',  value: `${record.transaction_count || 0}回`,         gold: true },
              { label: '初回完了',  value: formatDate(record.first_completed_at) },
              { label: '最終完了',  value: formatDate(record.last_completed_at) },
              { label: '最終更新',  value: formatDate(record.updated_at) },
            ].map(item => (
              <div key={item.label} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 8, padding: '10px 16px', textAlign: 'center' }}>
                <div style={{ fontSize: 9, color: '#64748B', fontWeight: 400, marginBottom: 4 }}>{item.label}</div>
                <div style={{ fontSize: 14, color: item.gold ? '#c9a84c' : '#E2E8F0', fontWeight: 500 }}>{item.value || '-'}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ロードマップ最終状態 */}
        {roadmap.length > 0 ? (
          <div style={{ ...glass, borderRadius: 14, padding: 24 }}>
            <div style={{ fontSize: 10, color: '#c9a84c', fontWeight: 500, letterSpacing: 3, marginBottom: 16 }}>ROADMAP（最終状態）</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {roadmap.map((s, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 6, background: s.state === '完了' ? 'rgba(201,168,76,0.12)' : 'rgba(255,255,255,0.04)', border: s.state === '完了' ? '1px solid rgba(201,168,76,0.4)' : '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '4px 12px' }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: s.state === '完了' ? '#c9a84c' : s.state === '進行中' ? '#60A5FA' : '#475569', flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: s.state === '完了' ? '#c9a84c' : '#94A3B8', fontWeight: s.state === '完了' ? 500 : 400 }}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* タイムライン */}
        {timeline.length > 0 ? (
          <div style={{ ...glass, borderRadius: 14, padding: 24 }}>
            <div style={{ fontSize: 10, color: '#c9a84c', fontWeight: 500, letterSpacing: 3, marginBottom: 16 }}>TIMELINE</div>
            {timeline.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#c9a84c', marginTop: 4 }} />
                  {idx < timeline.length - 1 ? <div style={{ width: 1, height: 28, background: 'rgba(201,168,76,0.25)', marginTop: 4 }} /> : null}
                </div>
                <div style={{ paddingBottom: idx < timeline.length - 1 ? 6 : 0 }}>
                  <span style={{ fontSize: 12, color: '#c9a84c', fontWeight: 500, marginRight: 10 }}>{formatEventDate(item.event_date)}</span>
                  <span style={{ fontSize: 13, color: '#94A3B8', fontWeight: 400 }}>{item.label || ''}</span>
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {/* 関係者 */}
        {members.length > 0 ? (
          <div style={{ ...glass, borderRadius: 14, padding: 24 }}>
            <div style={{ fontSize: 10, color: '#c9a84c', fontWeight: 500, letterSpacing: 3, marginBottom: 16 }}>MEMBERS</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {members.map((m, idx) => (
                <div key={idx} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 8, padding: '10px 14px' }}>
                  <div style={{ fontSize: 13, color: '#E2E8F0', fontWeight: 500 }}>{m.name || ''}</div>
                  <div style={{ fontSize: 10, color: '#64748B', fontWeight: 400, marginTop: 2 }}>{m.role_label || ''} / {m.permission || ''}</div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* 取引履歴 */}
        <div style={{ ...glass, borderRadius: 14, padding: 24 }}>
          <div style={{ fontSize: 10, color: '#c9a84c', fontWeight: 500, letterSpacing: 3, marginBottom: 8 }}>TRANSACTIONS</div>
          <div style={{ fontSize: 14, color: '#E2E8F0', fontWeight: 500, marginBottom: 16 }}>取引履歴</div>
          {transactions.length === 0 ? (
            <div style={{ fontSize: 12, color: '#475569', fontWeight: 400 }}>取引履歴がありません。</div>
          ) : (
            transactions.map((tx, idx) => (
              <div key={idx} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '12px 0', borderBottom: idx < transactions.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: 11, color: '#c9a84c', fontWeight: 500 }}>{idx + 1}</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 2 }}>
                    <span style={{ fontSize: 12, color: '#c9a84c', fontWeight: 500 }}>{tx.ws_code || ''}</span>
                    <span style={{ fontSize: 12, color: '#CBD5E1', fontWeight: 400 }}>{tx.contract_type || ''}</span>
                    <span style={{ fontSize: 12, color: '#94A3B8', fontWeight: 400 }}>{tx.customer_name || ''}</span>
                    <span style={{ fontSize: 12, color: '#64748B', fontWeight: 400 }}>{tx.agent_name || ''}</span>
                  </div>
                  <div style={{ fontSize: 10, color: '#475569', fontWeight: 400 }}>
                    完了: {formatDate(tx.completed_at)} / 昇格: {formatDate(tx.promoted_at)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

      </main>
    </div>
  )
}
