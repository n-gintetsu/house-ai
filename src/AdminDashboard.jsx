import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY
)

const ADMIN_PASSWORD = 'gintetsu2024admin'

const TABS = [
  { id: 'summary', label: '📊 サマリー' },
  { id: 'members', label: '👤 会員管理' },
  { id: 'agencies', label: '🏢 企業管理' },
  { id: 'properties', label: '🏠 物件管理' },
  { id: 'valuations', label: '🏷️ 査定依頼' },
  { id: 'experts', label: '👔 専門家依頼' },
  { id: 'community', label: '🏘️ コミュニティ' },
  { id: 'owners', label: '🔑 オーナー依頼' },
]


function ImageUploader({ supabase, onUploaded, currentUrl }) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(currentUrl || '')

  async function handleFile(e) {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    try {
      const ext = file.name.split('.').pop()
      const fileName = `property_${Date.now()}.${ext}`
      const { error } = await supabase.storage.from('property-images').upload(fileName, file, { upsert: true })
      if (error) throw error
      const { data } = supabase.storage.from('property-images').getPublicUrl(fileName)
      setPreview(data.publicUrl)
      onUploaded(data.publicUrl)
    } catch (err) {
      alert('アップロードに失敗しました: ' + err.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      {preview && <img src={preview} alt="プレビュー" style={{ width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 10, marginBottom: 8 }} />}
      <label style={{ display: 'inline-block', padding: '8px 16px', background: uploading ? '#94a3b8' : '#1a3a5c', color: '#fff', borderRadius: 8, cursor: uploading ? 'not-allowed' : 'pointer', fontSize: 13 }}>
        {uploading ? 'アップロード中...' : '📷 写真を選択'}
        <input type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} disabled={uploading} />
      </label>
    </div>
  )
}

const PROPERTY_TYPES_ADMIN = ['マンション', '一戸建て', 'アパート', '土地', 'その他']
const LAYOUTS_ADMIN = ['1R/1K', '1LDK', '2LDK', '3LDK', '4LDK以上']

function PropertiesPanel({ supabase }) {
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    title: '', property_type: '', deal_type: 'rent', price: '', rent: '',
    address: '', area: '', layout: '', built_year: '',
    description: '', features: '', status: 'active', image_url: ''
  })

  useEffect(() => { loadProperties() }, [])

  async function loadProperties() {
    setLoading(true)
    const { data } = await supabase.from('properties').select('*').order('created_at', { ascending: false })
    setProperties(data || [])
    setLoading(false)
  }

  async function handleSubmit() {
    if (!form.title.trim() || !form.address.trim()) {
      alert('物件名と住所は必須です')
      return
    }
    setSubmitting(true)
    const payload = {
      title: form.title,
      property_type: form.property_type || null,
      price: form.price ? parseInt(form.price) * 10000 : null,
      rent: form.rent ? parseInt(form.rent) * 10000 : null,
      address: form.address,
      area: form.area ? parseFloat(form.area) : null,
      layout: form.layout || null,
      built_year: form.built_year ? parseInt(form.built_year) : null,
      description: form.description || null,
      features: form.features || null,
      deal_type: form.deal_type || 'rent',
      status: form.status,
      image_url: form.image_url || null,
    }
    const { error } = await supabase.from('properties').insert(payload)
    if (error) { alert('登録に失敗しました: ' + error.message); setSubmitting(false); return }
    setForm({ title: '', property_type: '', price: '', rent: '', address: '', area: '', layout: '', built_year: '', description: '', features: '', status: 'active' })
    setShowForm(false)
    setSubmitting(false)
    loadProperties()
  }

  async function toggleStatus(id, currentStatus) {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
    await supabase.from('properties').update({ status: newStatus }).eq('id', id)
    setProperties(list => list.map(p => p.id === id ? { ...p, status: newStatus } : p))
  }

  async function deleteProperty(id) {
    if (!window.confirm('この物件を削除しますか？')) return
    await supabase.from('properties').delete().eq('id', id)
    setProperties(list => list.filter(p => p.id !== id))
  }

  const fieldStyle = { width: '100%', boxSizing: 'border-box', padding: '9px 12px', borderRadius: 10, border: '1px solid rgba(26,58,92,0.15)', background: '#fff', color: '#222', fontSize: 13, outline: 'none', fontFamily: 'inherit' }
  const labelStyle = { display: 'block', fontSize: 11, color: '#777', marginBottom: 4 }

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#777' }}>読み込み中...</div>

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ margin: 0, color: '#1a3a5c', fontSize: 20 }}>🏠 物件管理（{properties.length}件）</h2>
        <button onClick={() => setShowForm(!showForm)} style={{ padding: '9px 20px', background: '#1a3a5c', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
          {showForm ? '✕ 閉じる' : '＋ 物件を登録'}
        </button>
      </div>

      {showForm && (
        <div style={{ background: '#f8fafc', borderRadius: 14, padding: 20, marginBottom: 24, border: '1px solid rgba(26,58,92,0.1)' }}>
          <h3 style={{ margin: '0 0 16px', color: '#1a3a5c', fontSize: 16 }}>新規物件登録</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>取引種別 *</label>
              <select style={fieldStyle} value={form.deal_type} onChange={e => setForm(f => ({ ...f, deal_type: e.target.value }))}>
                <option value="rent">賃貸</option>
                <option value="sale">売買</option>
                <option value="both">賃貸・売買両方</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>ステータス</label>
              <select style={fieldStyle} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                <option value="active">公開中</option>
                <option value="inactive">非公開</option>
              </select>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>物件名 *</label>
              <input style={fieldStyle} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="例：大宮駅徒歩5分 2LDKマンション" />
            </div>
            <div>
              <label style={labelStyle}>物件種別</label>
              <select style={fieldStyle} value={form.property_type} onChange={e => setForm(f => ({ ...f, property_type: e.target.value }))}>
                <option value="">選択</option>
                {PROPERTY_TYPES_ADMIN.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>間取り</label>
              <select style={fieldStyle} value={form.layout} onChange={e => setForm(f => ({ ...f, layout: e.target.value }))}>
                <option value="">選択</option>
                {LAYOUTS_ADMIN.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>賃料（万円/月）</label>
              <input style={fieldStyle} value={form.rent} onChange={e => setForm(f => ({ ...f, rent: e.target.value }))} placeholder="例：8" inputMode="numeric" />
            </div>
            <div>
              <label style={labelStyle}>売却価格（万円）</label>
              <input style={fieldStyle} value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="例：3000" inputMode="numeric" />
            </div>
            <div>
              <label style={labelStyle}>専有面積（㎡）</label>
              <input style={fieldStyle} value={form.area} onChange={e => setForm(f => ({ ...f, area: e.target.value }))} placeholder="例：65.5" inputMode="decimal" />
            </div>
            <div>
              <label style={labelStyle}>築年数（年）</label>
              <input style={fieldStyle} value={form.built_year} onChange={e => setForm(f => ({ ...f, built_year: e.target.value }))} placeholder="例：10" inputMode="numeric" />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>住所 *</label>
              <input style={fieldStyle} value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="例：埼玉県さいたま市大宮区桜木町1-1" />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>物件写真</label>
              <ImageUploader
                supabase={supabase}
                onUploaded={url => setForm(f => ({ ...f, image_url: url }))}
                currentUrl={form.image_url}
              />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>物件説明</label>
              <textarea style={{ ...fieldStyle, minHeight: 80, resize: 'vertical' }} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="物件の特徴や魅力を記入してください" />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>特徴・設備（カンマ区切り）</label>
              <input style={fieldStyle} value={form.features} onChange={e => setForm(f => ({ ...f, features: e.target.value }))} placeholder="例：駅徒歩5分,オートロック,宅配ボックス" />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <button onClick={handleSubmit} disabled={submitting} style={{ padding: '10px 24px', background: '#1a3a5c', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1 }}>
              {submitting ? '登録中...' : '登録する'}
            </button>
            <button onClick={() => setShowForm(false)} style={{ padding: '10px 20px', background: 'transparent', color: '#777', border: '1px solid #ddd', borderRadius: 10, fontSize: 13, cursor: 'pointer' }}>キャンセル</button>
          </div>
        </div>
      )}

      {properties.length === 0 ? <p style={{ color: '#777' }}>物件はありません。「物件を登録」ボタンから追加してください。</p> : properties.map(p => (
        <div key={p.id} style={{ background: '#fff', borderRadius: 14, padding: 16, marginBottom: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          {p.image_url && <img src={p.image_url} alt={p.title} style={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 10, marginBottom: 12 }} />}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: '#1a3a5c' }}>{p.title}</div>
                <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 999, background: p.deal_type === 'sale' ? '#fef3c7' : p.deal_type === 'both' ? '#ede9fe' : '#dbeafe', color: p.deal_type === 'sale' ? '#92400e' : p.deal_type === 'both' ? '#5b21b6' : '#1e40af', fontWeight: 700 }}>
                  {p.deal_type === 'sale' ? '売買' : p.deal_type === 'both' ? '賃貸・売買' : '賃貸'}
                </span>
              </div>
              <div style={{ fontSize: 13, color: '#555', marginTop: 4 }}>
                {p.property_type && <span style={{ marginRight: 8 }}>{p.property_type}</span>}
                {p.layout && <span style={{ marginRight: 8 }}>{p.layout}</span>}
                {p.area && <span style={{ marginRight: 8 }}>{p.area}㎡</span>}
              </div>
              <div style={{ fontSize: 13, color: '#555' }}>📍 {p.address}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1a3a5c', marginTop: 4 }}>
                {p.rent ? `賃料 ${Math.round(p.rent/10000)}万円/月` : ''}
                {p.price ? `価格 ${(p.price/10000).toLocaleString()}万円` : ''}
              </div>
              <div style={{ fontSize: 11, color: '#aaa', marginTop: 4 }}>{p.created_at ? new Date(p.created_at).toLocaleString('ja-JP') : ''}</div>
            </div>
            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
              <span style={{ padding: '4px 10px', borderRadius: 999, fontSize: 12, fontWeight: 700, background: p.status === 'active' ? '#dcfce7' : '#f1f5f9', color: p.status === 'active' ? '#16a34a' : '#94a3b8' }}>
                {p.status === 'active' ? '✅ 公開中' : '⏸ 非公開'}
              </span>
              <button onClick={() => toggleStatus(p.id, p.status)} style={{ padding: '4px 12px', background: '#1a3a5c', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, cursor: 'pointer' }}>
                {p.status === 'active' ? '非公開に' : '公開する'}
              </button>
              <button onClick={() => deleteProperty(p.id)} style={{ padding: '4px 12px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, cursor: 'pointer' }}>削除</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}


function MembersPanel({ supabaseAdmin }) {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const { data, error } = await supabaseAdmin.auth.admin.listUsers()
        if (error) throw error
        setMembers(data.users || [])
      } catch (err) {
        setError('会員一覧の取得に失敗しました: ' + err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  async function handleDeleteUser(id, email) {
    if (!window.confirm(`${email} を削除しますか？この操作は取り消せません。`)) return
    const { error } = await supabaseAdmin.auth.admin.deleteUser(id)
    if (error) { alert('削除に失敗しました: ' + error.message); return }
    setMembers(list => list.filter(m => m.id !== id))
  }

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#777' }}>読み込み中...</div>

  return (
    <div>
      <h2 style={{ margin: '0 0 20px', color: '#1a3a5c', fontSize: 20 }}>👤 会員管理（{members.length}件）</h2>
      {error && <div style={{ padding: '12px 16px', borderRadius: 12, background: '#fee2e2', color: '#dc2626', fontSize: 13, marginBottom: 16 }}>{error}</div>}
      {members.length === 0 ? <p style={{ color: '#777' }}>会員はいません</p> : members.map(m => (
        <div key={m.id} style={{ background: '#fff', borderRadius: 14, padding: 16, marginBottom: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: '#1a3a5c' }}>{m.user_metadata?.name || '（名前未設定）'}</div>
              <div style={{ fontSize: 13, color: '#555', marginTop: 4 }}>✉️ {m.email}</div>
              <div style={{ fontSize: 13, color: '#555' }}>種別：{m.user_metadata?.user_type === 'agency' ? '業者・企業会員' : '一般会員'}</div>
              <div style={{ fontSize: 11, color: '#aaa', marginTop: 4, display: 'flex', gap: 12 }}>
                <span>登録：{m.created_at ? new Date(m.created_at).toLocaleString('ja-JP') : ''}</span>
                <span>最終ログイン：{m.last_sign_in_at ? new Date(m.last_sign_in_at).toLocaleString('ja-JP') : '未ログイン'}</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ padding: '4px 10px', borderRadius: 999, fontSize: 12, fontWeight: 700,
                background: m.email_confirmed_at ? '#dcfce7' : '#fef9c3',
                color: m.email_confirmed_at ? '#16a34a' : '#92400e'
              }}>
                {m.email_confirmed_at ? '✅ 認証済' : '⏳ 未認証'}
              </span>
              <button onClick={() => handleDeleteUser(m.id, m.email)} style={{ padding: '4px 12px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, cursor: 'pointer' }}>
                削除
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

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
                  <div key={c.label} style={{ background: '#fff', borderRadius: 14, padding: '20px 16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderTop: `3px solid ${c.color}` }}>
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

          {/* 物件管理 */}
          {tab === 'properties' && (
            <PropertiesPanel supabase={supabase} />
          )}

          {/* 会員管理 */}
          {tab === 'members' && (
            <MembersPanel supabaseAdmin={supabaseAdmin} />
          )}
        </div>
      </div>
    </div>
  )
}
