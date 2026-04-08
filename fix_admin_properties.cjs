const fs = require('fs');

let content = fs.readFileSync('src/AdminDashboard.jsx', 'utf8');

// TABSに物件管理を追加
content = content.replace(
  `const TABS = [
  { id: 'summary', label: '📊 サマリー' },
  { id: 'members', label: '👤 会員管理' },
  { id: 'agencies', label: '🏢 企業管理' },
  { id: 'valuations', label: '🏷️ 査定依頼' },
  { id: 'experts', label: '👔 専門家依頼' },
  { id: 'community', label: '🏘️ コミュニティ' },
  { id: 'owners', label: '🔑 オーナー依頼' },
]`,
  `const TABS = [
  { id: 'summary', label: '📊 サマリー' },
  { id: 'members', label: '👤 会員管理' },
  { id: 'agencies', label: '🏢 企業管理' },
  { id: 'properties', label: '🏠 物件管理' },
  { id: 'valuations', label: '🏷️ 査定依頼' },
  { id: 'experts', label: '👔 専門家依頼' },
  { id: 'community', label: '🏘️ コミュニティ' },
  { id: 'owners', label: '🔑 オーナー依頼' },
]`
);

// オーナー依頼タブの後に物件管理タブを追加
const insertBefore = `          {/* 会員管理 */}
          {tab === 'members' && (`;

const propertiesTab = `          {/* 物件管理 */}
          {tab === 'properties' && (
            <PropertiesPanel supabase={supabase} />
          )}

`;

content = content.replace(insertBefore, propertiesTab + insertBefore);

// PropertiesPanelコンポーネントをMembersPanelの前に追加
const insertBeforeMembers = `\nfunction MembersPanel`;

const propertiesPanel = `
const PROPERTY_TYPES_ADMIN = ['マンション', '一戸建て', 'アパート', '土地', 'その他']
const LAYOUTS_ADMIN = ['1R/1K', '1LDK', '2LDK', '3LDK', '4LDK以上']

function PropertiesPanel({ supabase }) {
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    title: '', property_type: '', price: '', rent: '',
    address: '', area: '', layout: '', built_year: '',
    description: '', features: '', status: 'active'
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
      status: form.status,
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: '#1a3a5c' }}>{p.title}</div>
              <div style={{ fontSize: 13, color: '#555', marginTop: 4 }}>
                {p.property_type && <span style={{ marginRight: 8 }}>{p.property_type}</span>}
                {p.layout && <span style={{ marginRight: 8 }}>{p.layout}</span>}
                {p.area && <span style={{ marginRight: 8 }}>{p.area}㎡</span>}
              </div>
              <div style={{ fontSize: 13, color: '#555' }}>📍 {p.address}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1a3a5c', marginTop: 4 }}>
                {p.rent ? \`賃料 \${Math.round(p.rent/10000)}万円/月\` : ''}
                {p.price ? \`価格 \${(p.price/10000).toLocaleString()}万円\` : ''}
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

`;

content = content.replace(insertBeforeMembers, propertiesPanel + insertBeforeMembers);

fs.writeFileSync('src/AdminDashboard.jsx', content, 'utf8');
console.log('SUCCESS: AdminDashboard.jsx に物件管理タブを追加しました');
