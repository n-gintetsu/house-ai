const fs = require('fs');
const path = require('path');

// ① AdminDashboard.jsx を作成
const adminDashboard = `import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'

const ADMIN_PASSWORD = 'gintetsu2024admin'

const TABS = [
  { id: 'summary', label: '📊 サマリー' },
  { id: 'members', label: '👤 会員管理' },
  { id: 'agencies', label: '🏢 企業管理' },
  { id: 'valuations', label: '🏷️ 査定依頼' },
  { id: 'experts', label: '👔 専門家依頼' },
  { id: 'community', label: '🏘️ コミュニティ' },
  { id: 'owners', label: '🔑 オーナー依頼' },
]

export default function AdminDashboard() {
  const [authed, setAuthed] = useState(false)
  const [pw, setPw] = useState('')
  const [pwError, setPwError] = useState('')
  const [tab, setTab] = useState('summary')

  // データ
  const [members, setMembers] = useState([])
  const [agencies, setAgencies] = useState([])
  const [valuations, setValuations] = useState([])
  const [experts, setExperts] = useState([])
  const [community, setCommunity] = useState([])
  const [owners, setOwners] = useState([])
  const [loading, setLoading] = useState(false)

  async function loadAll() {
    setLoading(true)
    try {
      const [m, a, v, e, c, o] = await Promise.all([
        supabase.auth.admin ? supabase.from('profiles').select('*').order('created_at', { ascending: false }) : { data: [] },
        supabase.from('agency_registrations').select('*').order('created_at', { ascending: false }),
        supabase.from('valuations').select('*').order('created_at', { ascending: false }),
        supabase.from('expert_requests').select('*').order('created_at', { ascending: false }),
        supabase.from('community_posts').select('*').order('created_at', { ascending: false }),
        supabase.from('owner_requests').select('*').order('created_at', { ascending: false }),
      ])
      setAgencies(a.data || [])
      setValuations(v.data || [])
      setExperts(e.data || [])
      setCommunity(c.data || [])
      setOwners(o.data || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (authed) loadAll()
  }, [authed])

  async function deletePost(id) {
    if (!window.confirm('この投稿を削除しますか？')) return
    await supabase.from('community_posts').delete().eq('id', id)
    setCommunity(list => list.filter(p => p.id !== id))
  }

  async function updateAgencyStatus(id, status) {
    await supabase.from('agency_registrations').update({ status }).eq('id', id)
    setAgencies(list => list.map(a => a.id === id ? { ...a, status } : a))
  }

  async function updateValuationStatus(id, status) {
    await supabase.from('valuations').update({ status }).eq('id', id)
    setValuations(list => list.map(v => v.id === id ? { ...v, status } : v))
  }

  // ログイン画面
  if (!authed) {
    return (
      <div style={{ minHeight: '100vh', background: '#eef2f7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: '#fff', borderRadius: 18, padding: 40, width: 360, boxShadow: '0 4px 24px rgba(26,58,92,0.1)' }}>
          <h2 style={{ textAlign: 'center', color: '#1a3a5c', marginBottom: 8, fontSize: 20 }}>🔐 管理者ログイン</h2>
          <p style={{ textAlign: 'center', color: '#777', fontSize: 13, marginBottom: 24 }}>House AI 管理ダッシュボード</p>
          <label style={{ fontSize: 12, color: '#777', display: 'block', marginBottom: 6 }}>管理者パスワード</label>
          <input
            type="password"
            value={pw}
            onChange={e => setPw(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (pw === ADMIN_PASSWORD ? (setAuthed(true), setPwError('')) : setPwError('パスワードが違います'))}
            style={{ width: '100%', boxSizing: 'border-box', padding: '11px 12px', borderRadius: 12, border: '1px solid rgba(26,58,92,0.15)', fontSize: 14, outline: 'none', marginBottom: 12 }}
            placeholder="パスワードを入力"
          />
          {pwError && <p style={{ color: '#dc2626', fontSize: 13, marginBottom: 8 }}>{pwError}</p>}
          <button
            onClick={() => pw === ADMIN_PASSWORD ? (setAuthed(true), setPwError('')) : setPwError('パスワードが違います')}
            style={{ width: '100%', padding: '11px', background: '#1a3a5c', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
          >
            ログイン
          </button>
        </div>
      </div>
    )
  }

  const statCards = [
    { label: '業者登録', value: agencies.length, color: '#3b82f6' },
    { label: '査定依頼', value: valuations.length, color: '#f59e0b' },
    { label: '専門家依頼', value: experts.length, color: '#8b5cf6' },
    { label: 'コミュニティ投稿', value: community.length, color: '#10b981' },
    { label: 'オーナー依頼', value: owners.length, color: '#ef4444' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#eef2f7', fontFamily: 'sans-serif' }}>
      {/* ヘッダー */}
      <div style={{ background: '#1a3a5c', color: '#fff', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 18 }}>🏠 House AI 管理ダッシュボード</div>
          <div style={{ fontSize: 12, opacity: 0.7, marginTop: 2 }}>GINTETSU不動産株式会社</div>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button onClick={loadAll} style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontSize: 13 }}>
            🔄 更新
          </button>
          <button onClick={() => setAuthed(false)} style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontSize: 13 }}>
            ログアウト
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', minHeight: 'calc(100vh - 64px)' }}>
        {/* サイドバー */}
        <div style={{ width: 200, background: '#fff', borderRight: '1px solid rgba(26,58,92,0.1)', padding: '16px 0', flexShrink: 0 }}>
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                display: 'block', width: '100%', textAlign: 'left', padding: '12px 20px',
                border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: tab === t.id ? 700 : 400,
                background: tab === t.id ? 'rgba(26,58,92,0.08)' : 'transparent',
                color: tab === t.id ? '#1a3a5c' : '#555',
                borderLeft: tab === t.id ? '3px solid #1a3a5c' : '3px solid transparent',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* メインコンテンツ */}
        <div style={{ flex: 1, padding: 24, overflow: 'auto' }}>
          {loading && <div style={{ textAlign: 'center', padding: 40, color: '#777' }}>読み込み中...</div>}

          {/* サマリー */}
          {tab === 'summary' && (
            <div>
              <h2 style={{ margin: '0 0 20px', color: '#1a3a5c', fontSize: 20 }}>📊 ダッシュボード サマリー</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 32 }}>
                {statCards.map(c => (
                  <div key={c.label} style={{ background: '#fff', borderRadius: 14, padding: '20px 16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderTop: \`3px solid \${c.color}\` }}>
                    <div style={{ fontSize: 28, fontWeight: 800, color: c.color }}>{c.value}</div>
                    <div style={{ fontSize: 13, color: '#777', marginTop: 4 }}>{c.label}</div>
                  </div>
                ))}
              </div>
              <div style={{ background: '#fff', borderRadius: 14, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <h3 style={{ margin: '0 0 16px', color: '#1a3a5c', fontSize: 16 }}>📋 最新の査定依頼（5件）</h3>
                {valuations.slice(0, 5).map(v => (
                  <div key={v.id} style={{ padding: '10px 0', borderBottom: '1px solid #f0f4f8', fontSize: 13, display: 'flex', justifyContent: 'space-between' }}>
                    <span><strong>{v.name}</strong> — {v.property_type} / {v.address}</span>
                    <span style={{ color: '#777' }}>{v.created_at ? new Date(v.created_at).toLocaleDateString('ja-JP') : ''}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 企業管理 */}
          {tab === 'agencies' && (
            <div>
              <h2 style={{ margin: '0 0 20px', color: '#1a3a5c', fontSize: 20 }}>🏢 企業様管理（{agencies.length}件）</h2>
              {agencies.length === 0 ? <p style={{ color: '#777' }}>登録はありません</p> : agencies.map(a => (
                <div key={a.id} style={{ background: '#fff', borderRadius: 14, padding: 16, marginBottom: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15, color: '#1a3a5c' }}>{a.company_name}</div>
                      <div style={{ fontSize: 13, color: '#555', marginTop: 4 }}>担当：{a.contact_name} / {a.phone} / {a.email}</div>
                      <div style={{ fontSize: 13, color: '#555' }}>業種：{a.business_type} / エリア：{a.area}</div>
                      {a.service_description && <div style={{ fontSize: 12, color: '#777', marginTop: 4 }}>{a.service_description}</div>}
                      <div style={{ fontSize: 11, color: '#aaa', marginTop: 4 }}>{a.created_at ? new Date(a.created_at).toLocaleString('ja-JP') : ''}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                      <span style={{ padding: '4px 10px', borderRadius: 999, fontSize: 12, fontWeight: 700,
                        background: a.status === 'approved' ? '#dcfce7' : a.status === 'rejected' ? '#fee2e2' : '#fef9c3',
                        color: a.status === 'approved' ? '#16a34a' : a.status === 'rejected' ? '#dc2626' : '#92400e'
                      }}>
                        {a.status === 'approved' ? '✅ 承認済' : a.status === 'rejected' ? '❌ 却下' : '⏳ 審査中'}
                      </span>
                      {a.status !== 'approved' && <button onClick={() => updateAgencyStatus(a.id, 'approved')} style={{ padding: '4px 12px', background: '#1a3a5c', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, cursor: 'pointer' }}>承認</button>}
                      {a.status !== 'rejected' && <button onClick={() => updateAgencyStatus(a.id, 'rejected')} style={{ padding: '4px 12px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, cursor: 'pointer' }}>却下</button>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 査定依頼 */}
          {tab === 'valuations' && (
            <div>
              <h2 style={{ margin: '0 0 20px', color: '#1a3a5c', fontSize: 20 }}>🏷️ 査定依頼管理（{valuations.length}件）</h2>
              {valuations.length === 0 ? <p style={{ color: '#777' }}>依頼はありません</p> : valuations.map(v => (
                <div key={v.id} style={{ background: '#fff', borderRadius: 14, padding: 16, marginBottom: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15, color: '#1a3a5c' }}>{v.name}</div>
                      <div style={{ fontSize: 13, color: '#555', marginTop: 4 }}>{v.property_type} / {v.address}</div>
                      <div style={{ fontSize: 13, color: '#555' }}>📞 {v.phone} / ✉️ {v.email}</div>
                      {v.wishes && <div style={{ fontSize: 12, color: '#777', marginTop: 4 }}>備考：{v.wishes}</div>}
                      <div style={{ fontSize: 11, color: '#aaa', marginTop: 4 }}>{v.created_at ? new Date(v.created_at).toLocaleString('ja-JP') : ''}</div>
                    </div>
                    <div>
                      <span style={{ padding: '4px 10px', borderRadius: 999, fontSize: 12, fontWeight: 700,
                        background: v.status === 'done' ? '#dcfce7' : '#fef9c3',
                        color: v.status === 'done' ? '#16a34a' : '#92400e'
                      }}>
                        {v.status === 'done' ? '✅ 対応済' : '⏳ 未対応'}
                      </span>
                      {v.status !== 'done' && <button onClick={() => updateValuationStatus(v.id, 'done')} style={{ marginLeft: 8, padding: '4px 12px', background: '#1a3a5c', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, cursor: 'pointer' }}>対応済にする</button>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 専門家依頼 */}
          {tab === 'experts' && (
            <div>
              <h2 style={{ margin: '0 0 20px', color: '#1a3a5c', fontSize: 20 }}>👔 専門家依頼管理（{experts.length}件）</h2>
              {experts.length === 0 ? <p style={{ color: '#777' }}>依頼はありません</p> : experts.map(e => (
                <div key={e.id} style={{ background: '#fff', borderRadius: 14, padding: 16, marginBottom: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: '#1a3a5c' }}>{e.name}</div>
                  <div style={{ fontSize: 13, color: '#555', marginTop: 4 }}>種別：{e.expert_type}</div>
                  <div style={{ fontSize: 13, color: '#555' }}>📞 {e.phone} / ✉️ {e.email}</div>
                  {e.situation && <div style={{ fontSize: 12, color: '#777', marginTop: 4 }}>{e.situation}</div>}
                  <div style={{ fontSize: 11, color: '#aaa', marginTop: 4 }}>{e.created_at ? new Date(e.created_at).toLocaleString('ja-JP') : ''}</div>
                </div>
              ))}
            </div>
          )}

          {/* コミュニティ管理 */}
          {tab === 'community' && (
            <div>
              <h2 style={{ margin: '0 0 20px', color: '#1a3a5c', fontSize: 20 }}>🏘️ コミュニティ管理（{community.length}件）</h2>
              {community.length === 0 ? <p style={{ color: '#777' }}>投稿はありません</p> : community.map(p => (
                <div key={p.id} style={{ background: '#fff', borderRadius: 14, padding: 16, marginBottom: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 15, color: '#1a3a5c' }}>{p.title}</div>
                      <div style={{ fontSize: 13, color: '#555', marginTop: 4, lineHeight: 1.5 }}>{p.body?.slice(0, 100)}{p.body?.length > 100 ? '...' : ''}</div>
                      <div style={{ fontSize: 12, color: '#aaa', marginTop: 6 }}>
                        投稿者：{p.author_name || '匿名'} / {p.created_at ? new Date(p.created_at).toLocaleString('ja-JP') : ''}
                      </div>
                    </div>
                    <button onClick={() => deletePost(p.id)} style={{ marginLeft: 12, padding: '6px 14px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, cursor: 'pointer', flexShrink: 0 }}>
                      🗑️ 削除
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* オーナー依頼 */}
          {tab === 'owners' && (
            <div>
              <h2 style={{ margin: '0 0 20px', color: '#1a3a5c', fontSize: 20 }}>🔑 オーナー依頼管理（{owners.length}件）</h2>
              {owners.length === 0 ? <p style={{ color: '#777' }}>依頼はありません</p> : owners.map(o => (
                <div key={o.id} style={{ background: '#fff', borderRadius: 14, padding: 16, marginBottom: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: '#1a3a5c' }}>{o.name}</div>
                  <div style={{ fontSize: 13, color: '#555', marginTop: 4 }}>サービス：{o.service_type} / {o.property_type}</div>
                  <div style={{ fontSize: 13, color: '#555' }}>住所：{o.address}</div>
                  <div style={{ fontSize: 13, color: '#555' }}>📞 {o.phone} / ✉️ {o.email}</div>
                  <div style={{ fontSize: 11, color: '#aaa', marginTop: 4 }}>{o.created_at ? new Date(o.created_at).toLocaleString('ja-JP') : ''}</div>
                </div>
              ))}
            </div>
          )}

          {/* 会員管理（将来対応） */}
          {tab === 'members' && (
            <div>
              <h2 style={{ margin: '0 0 20px', color: '#1a3a5c', fontSize: 20 }}>👤 会員管理</h2>
              <div style={{ background: '#fff', borderRadius: 14, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', textAlign: 'center' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🔧</div>
                <p style={{ color: '#777', fontSize: 14 }}>会員一覧はSupabase Authと連携して表示されます。<br />現在登録されている会員はSupabaseの「Authentication → Users」からご確認ください。</p>
                <a href="https://supabase.com/dashboard/project/bbkjnetmdfdrzcedmbdn/auth/users" target="_blank" rel="noreferrer"
                  style={{ display: 'inline-block', marginTop: 16, padding: '10px 24px', background: '#1a3a5c', color: '#fff', borderRadius: 12, textDecoration: 'none', fontSize: 14, fontWeight: 700 }}>
                  Supabaseで会員を確認 →
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
`;

fs.writeFileSync(path.join('src', 'AdminDashboard.jsx'), adminDashboard, 'utf8');
console.log('SUCCESS: src/AdminDashboard.jsx を作成しました');

// ② main.jsx を更新してルーティングを追加
let main = fs.readFileSync('src/main.jsx', 'utf8');
console.log('main.jsx の内容:', main.substring(0, 200));

// /admin のルーティングを追加
const newMain = `import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import AdminDashboard from './AdminDashboard.jsx'

const isAdmin = window.location.pathname === '/admin' || window.location.pathname === '/admin/'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {isAdmin ? <AdminDashboard /> : <App />}
  </StrictMode>,
)
`;

fs.writeFileSync('src/main.jsx', newMain, 'utf8');
console.log('SUCCESS: src/main.jsx を更新しました（/admin ルーティング追加）');
console.log('SUCCESS: 完了！');
