const fs = require('fs')
const path = require('path')

const filePath = path.join(__dirname, 'src', 'AdminDashboard.jsx')
let content = fs.readFileSync(filePath, 'utf8')

// 1) TABSにメニュー追加
if (content.includes("'ads'")) {
  console.log('ℹ️  広告管理メニューは既にあります')
} else {
  content = content.replace(
    "{ id: 'owners', label: '🔑 オーナー依頼' },",
    "{ id: 'owners', label: '🔑 オーナー依頼' },\n  { id: 'ads', label: '📢 広告管理' },"
  )
  console.log('✅ 広告管理メニューを追加しました')
}

// 2) 広告管理画面のJSXを追加（owners セクションの後）
if (content.includes('広告管理画面')) {
  console.log('ℹ️  広告管理画面は既にあります')
} else {
  content = content.replace(
    '{/* オーナー依頼 */}',
    `{/* オーナー依頼 */}`
  )

  // ファイル末尾のreturn閉じ前に追加
  const adSection = `
              {/* 広告管理 */}
              {activeTab === 'ads' && (
                <div>
                  <h2 style={{ margin: '0 0 20px', color: '#1a3a5c', fontSize: 20 }}>📢 広告管理</h2>
                  <AdManagement supabaseAdmin={supabaseAdmin} />
                </div>
              )}`

  // 最後のタブセクションの後に挿入
  content = content.replace(
    "activeTab === 'owners'",
    "activeTab === 'owners'"
  )

  // owners セクションの閉じ括弧の後に追加
  const ownersEnd = `{activeTab === 'owners' &&`
  const idx = content.lastIndexOf(ownersEnd)
  if (idx !== -1) {
    // owners ブロックの終わりを見つける
    let depth = 0
    let i = idx
    let inBlock = false
    for (; i < content.length; i++) {
      if (content[i] === '(') { depth++; inBlock = true }
      if (content[i] === ')') { depth-- }
      if (inBlock && depth === 0) { i++; break }
    }
    content = content.slice(0, i) + adSection + content.slice(i)
    console.log('✅ 広告管理セクションを追加しました')
  }
}

// 3) AdManagement コンポーネントを追加（ファイル末尾）
if (content.includes('function AdManagement')) {
  console.log('ℹ️  AdManagement は既にあります')
} else {
  content += `

function AdManagement({ supabaseAdmin }) {
  const [tickerItems, setTickerItems] = useState([])
  const [adItems, setAdItems] = useState([])
  const [activeSection, setActiveSection] = useState('ticker')
  const [form, setForm] = useState({ label: 'PR', text: '', url: '', active: true, sort_order: 0 })
  const [adForm, setAdForm] = useState({ label: '広告', title: '', desc: '', url: '', active: true, color: '#1a3a5c' })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    fetchTicker()
    fetchAds()
  }, [])

  const fetchTicker = async () => {
    const { data } = await supabaseAdmin.from('ticker_items').select('*').order('sort_order')
    if (data) setTickerItems(data)
  }

  const fetchAds = async () => {
    const { data } = await supabaseAdmin.from('ad_items').select('*').order('sort_order')
    if (data) setAdItems(data)
  }

  const saveTicker = async () => {
    setSaving(true)
    const { error } = await supabaseAdmin.from('ticker_items').insert([{ ...form, sort_order: Number(form.sort_order) }])
    if (!error) { setMsg('✅ 追加しました'); fetchTicker(); setForm({ label: 'PR', text: '', url: '', active: true, sort_order: 0 }) }
    else setMsg('❌ エラー: ' + error.message)
    setSaving(false)
  }

  const deleteTicker = async (id) => {
    await supabaseAdmin.from('ticker_items').delete().eq('id', id)
    fetchTicker()
  }

  const saveAd = async () => {
    setSaving(true)
    const { error } = await supabaseAdmin.from('ad_items').insert([{ ...adForm }])
    if (!error) { setMsg('✅ 追加しました'); fetchAds(); setAdForm({ label: '広告', title: '', desc: '', url: '', active: true, color: '#1a3a5c' }) }
    else setMsg('❌ エラー: ' + error.message)
    setSaving(false)
  }

  const deleteAd = async (id) => {
    await supabaseAdmin.from('ad_items').delete().eq('id', id)
    fetchAds()
  }

  const btnStyle = (active) => ({
    padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13,
    background: active ? '#1a3a5c' : '#f0f0f0', color: active ? '#fff' : '#333', marginRight: 8
  })

  const inputStyle = { width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 13, marginBottom: 8, boxSizing: 'border-box' }

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <button style={btnStyle(activeSection==='ticker')} onClick={() => setActiveSection('ticker')}>📡 ティッカーバナー</button>
        <button style={btnStyle(activeSection==='ads')} onClick={() => setActiveSection('ads')}>🖼️ 広告バナー</button>
      </div>

      {msg && <div style={{ padding: '10px 14px', borderRadius: 8, background: '#f0f7ff', marginBottom: 16, fontSize: 13 }}>{msg}</div>}

      {activeSection === 'ticker' && (
        <div>
          <div style={{ background: '#fff', borderRadius: 12, padding: 20, border: '1px solid #eee', marginBottom: 20 }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 15, color: '#1a3a5c' }}>＋ 新規追加</h3>
            <select value={form.label} onChange={e => setForm({...form, label: e.target.value})} style={inputStyle}>
              <option>PR</option><option>広告</option><option>提携</option><option>お知らせ</option>
            </select>
            <input placeholder="テキスト（例：リフォームのご相談はこちら）" value={form.text} onChange={e => setForm({...form, text: e.target.value})} style={inputStyle} />
            <input placeholder="URL（例：https://example.com）" value={form.url} onChange={e => setForm({...form, url: e.target.value})} style={inputStyle} />
            <input placeholder="表示順（数字）" type="number" value={form.sort_order} onChange={e => setForm({...form, sort_order: e.target.value})} style={inputStyle} />
            <button onClick={saveTicker} disabled={saving || !form.text} style={{ background: '#1a3a5c', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              {saving ? '保存中...' : '追加する'}
            </button>
          </div>
          <div style={{ background: '#fff', borderRadius: 12, padding: 20, border: '1px solid #eee' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 15, color: '#1a3a5c' }}>現在の表示一覧（{tickerItems.length}件）</h3>
            {tickerItems.map(item => (
              <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
                <span style={{ background: '#1a3a5c', color: '#fff', fontSize: 10, padding: '2px 8px', borderRadius: 4 }}>{item.label}</span>
                <span style={{ flex: 1, fontSize: 13 }}>{item.text}</span>
                <span style={{ fontSize: 11, color: '#999' }}>順:{item.sort_order}</span>
                <button onClick={() => deleteTicker(item.id)} style={{ background: '#fee', color: '#c00', border: '1px solid #fcc', borderRadius: 6, padding: '4px 10px', fontSize: 12, cursor: 'pointer' }}>削除</button>
              </div>
            ))}
            {tickerItems.length === 0 && <p style={{ color: '#999', fontSize: 13 }}>データがありません</p>}
          </div>
        </div>
      )}

      {activeSection === 'ads' && (
        <div>
          <div style={{ background: '#fff', borderRadius: 12, padding: 20, border: '1px solid #eee', marginBottom: 20 }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 15, color: '#1a3a5c' }}>＋ 新規追加</h3>
            <select value={adForm.label} onChange={e => setAdForm({...adForm, label: e.target.value})} style={inputStyle}>
              <option>広告</option><option>PR</option><option>提携</option>
            </select>
            <input placeholder="タイトル（例：リフォームのご相談）" value={adForm.title} onChange={e => setAdForm({...adForm, title: e.target.value})} style={inputStyle} />
            <input placeholder="説明文（例：外壁・内装・水回りの工事）" value={adForm.desc} onChange={e => setAdForm({...adForm, desc: e.target.value})} style={inputStyle} />
            <input placeholder="URL" value={adForm.url} onChange={e => setAdForm({...adForm, url: e.target.value})} style={inputStyle} />
            <input placeholder="カラー（例：#1a3a5c）" value={adForm.color} onChange={e => setAdForm({...adForm, color: e.target.value})} style={inputStyle} />
            <button onClick={saveAd} disabled={saving || !adForm.title} style={{ background: '#1a3a5c', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              {saving ? '保存中...' : '追加する'}
            </button>
          </div>
          <div style={{ background: '#fff', borderRadius: 12, padding: 20, border: '1px solid #eee' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 15, color: '#1a3a5c' }}>現在の広告一覧（{adItems.length}件）</h3>
            {adItems.map(item => (
              <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
                <div style={{ width: 12, height: 12, borderRadius: 3, background: item.color || '#1a3a5c' }} />
                <span style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>{item.title}</span>
                <span style={{ fontSize: 11, color: '#999', flex: 1 }}>{item.desc}</span>
                <button onClick={() => deleteAd(item.id)} style={{ background: '#fee', color: '#c00', border: '1px solid #fcc', borderRadius: 6, padding: '4px 10px', fontSize: 12, cursor: 'pointer' }}>削除</button>
              </div>
            ))}
            {adItems.length === 0 && <p style={{ color: '#999', fontSize: 13 }}>データがありません</p>}
          </div>
        </div>
      )}
    </div>
  )
}
`
  console.log('✅ AdManagement コンポーネントを追加しました')
}

fs.writeFileSync(filePath, content, 'utf8')
console.log('\n✅ SUCCESS!')
