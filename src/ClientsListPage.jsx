import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import WorkspaceNav from './WorkspaceNav'
import MobileHeader from './MobileHeader'

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

export default function ClientsListPage() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [currentUserId, setCurrentUserId] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isNarrow, setIsNarrow] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false)

  useEffect(() => {
    const onResize = () => setIsNarrow(window.innerWidth < 768)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      const uid = session ? session.user.id : null
      setCurrentUserId(uid)
      if (uid) {
        const { data: org } = await supabase.from('organizations').select('owner_id').maybeSingle()
        if (!org) {
          window.location.replace('/workspace')
          return
        }
        setIsAdmin(org.owner_id === uid)
      }
      const { data } = await supabase
        .from('client_records')
        .select('*')
        .is('deleted_at', null)
        .order('updated_at', { ascending: false })
      setClients(data || [])
      setLoading(false)
    }
    load()
  }, [])

  // クライアント側フィルタ: name を NFKC正規化して部分一致
  const filtered = query.trim() ? clients.filter(c => {
    const q = query.normalize('NFKC').toLowerCase()
    return (c.name || '').normalize('NFKC').toLowerCase().includes(q)
  }) : clients

  const handleCardClick = (c) => {
    if (c.last_workspace_id) {
      window.location.href = `/workspace?id=${c.last_workspace_id}`
    } else if (c.last_house_record_id) {
      window.location.href = `/house/${c.last_house_record_id}`
    }
    // 両方なければ遷移しない
  }

  const canDelete = (c) => isAdmin || (c.created_by ? c.created_by === currentUserId : false)

  async function handleDelete(e, c) {
    e.stopPropagation()
    const ok = window.confirm('「' + (c.name || '無題') + '」を削除しますか？\n削除すると一覧から消えます（管理者は後で復元できます）。')
    if (!ok) { return }
    const { error } = await supabase.from('client_records').update({ deleted_at: new Date().toISOString() }).eq('id', c.id)
    if (error) { window.alert('削除できませんでした：' + error.message); return }
    setClients(prev => prev.filter(x => x.id !== c.id))
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0A0F1E 0%, #0F172A 100%)', color: '#E2E8F0', fontFamily: "'Noto Sans JP', sans-serif" }}>

      {isNarrow ? (
        <MobileHeader current="/clients" pageTitle="顧客カルテ一覧" />
      ) : (
        <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, height: 64, background: 'rgba(10,15,30,0.95)', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: 12, padding: '0 24px', boxSizing: 'border-box', overflowX: 'auto' }}>
          <img src="/logo.png" alt="HOUSE-AI" style={{ height: 34, objectFit: 'contain', flexShrink: 0, filter: 'drop-shadow(0 0 8px rgba(201,168,76,0.6))' }} />
          <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.15)', flexShrink: 0 }} />
          <div style={{ fontSize: 14, fontWeight: 500, color: '#E2E8F0', whiteSpace: 'nowrap', flexShrink: 0 }}>顧客カルテ一覧</div>
          <WorkspaceNav current="/clients" />
        </header>
      )}

      <main style={{ paddingTop: isNarrow ? 110 : 80, paddingBottom: 40, paddingLeft: 24, paddingRight: 24, maxWidth: 1200, margin: '0 auto', boxSizing: 'border-box' }}>

        {/* 検索 */}
        <div style={{ paddingTop: 16, paddingBottom: 20 }}>
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="顧客名で検索..."
            style={{ fontSize: 16, fontWeight: 400, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#E2E8F0', padding: '10px 16px', borderRadius: 10, width: '100%', boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit' }}
          />
        </div>

        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 60 }}>
            <span style={{ color: '#64748B', fontSize: 14, fontWeight: 400 }}>読み込み中...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', paddingTop: 60 }}>
            <div style={{ fontSize: 14, color: '#64748B', fontWeight: 400 }}>
              {query ? '検索結果がありません。' : '顧客カルテがありません。'}
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {filtered.map(c => {
              const canNav = !!(c.last_workspace_id || c.last_house_record_id)
              return (
                <div
                  key={c.id}
                  onClick={() => handleCardClick(c)}
                  style={{ ...glass, borderRadius: 14, padding: 20, cursor: canNav ? 'pointer' : 'default', border: '1px solid rgba(168,85,247,0.5)', boxShadow: '0 0 30px rgba(168,85,247,0.25)' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div style={{ fontSize: 15, fontWeight: 500, color: '#E2E8F0' }}>{c.name || '-'}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 8, flexShrink: 0 }}>
                      <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, fontWeight: 500, background: 'rgba(201,168,76,0.12)', color: '#c9a84c', border: '1px solid rgba(201,168,76,0.3)', whiteSpace: 'nowrap' }}>
                        {c.deal_count || 0}件
                      </span>
                      {canDelete(c) ? (
                        <button onClick={(e) => handleDelete(e, c)} title="削除" style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center', color: '#64748B', borderRadius: 6 }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                            <path d="M10 11v6M14 11v6" />
                            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                          </svg>
                        </button>
                      ) : null}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                    {c.last_workspace_id ? (
                      <span style={{ fontSize: 10, background: 'rgba(99,102,241,0.12)', color: '#818CF8', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 4, padding: '2px 7px', fontWeight: 400 }}>案件あり</span>
                    ) : null}
                    {c.last_house_record_id ? (
                      <span style={{ fontSize: 10, background: 'rgba(201,168,76,0.1)', color: '#c9a84c', border: '1px solid rgba(201,168,76,0.25)', borderRadius: 4, padding: '2px 7px', fontWeight: 400 }}>家カルテあり</span>
                    ) : null}
                  </div>
                  <div style={{ fontSize: 10, color: '#475569', fontWeight: 400 }}>最終更新: {formatDate(c.updated_at)}</div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
