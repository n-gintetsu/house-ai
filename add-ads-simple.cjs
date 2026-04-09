const fs = require('fs')
const path = require('path')

const filePath = path.join(__dirname, 'src', 'AdminDashboard.jsx')
let content = fs.readFileSync(filePath, 'utf8')
// \r を除去して統一
content = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n')

// 1) TABSに追加
if (content.includes("id: 'ads'")) {
  console.log('ℹ️  ads tab already exists')
} else {
  content = content.replace(
    "{ id: 'owners', label: '🔑 オーナー依頼' },",
    "{ id: 'owners', label: '🔑 オーナー依頼' },\n  { id: 'ads', label: '📢 広告管理' },"
  )
  console.log('✅ TABSに広告管理を追加')
}

// 2) owners コメントの直後に ads セクションを追加
if (content.includes("activeTab === 'ads'")) {
  console.log('ℹ️  ads section already exists')
} else {
  // {/* オーナー依頼 */} の後に追加
  content = content.replace(
    '{/* オーナー依頼 */}',
    `{/* オーナー依頼 */}
              {/* 広告管理 */}
              {activeTab === 'ads' && (
                <div>
                  <h2 style={{ margin: '0 0 20px', color: '#1a3a5c', fontSize: 20 }}>📢 広告管理</h2>
                  <AdManagement supabaseAdmin={supabaseAdmin} />
                </div>
              )}`
  )
  console.log('✅ 広告管理セクションを追加')
}

// 3) AdManagement コンポーネントをファイル末尾に追加
if (content.includes('function AdManagement(')) {
  console.log('ℹ️  AdManagement already exists')
} else {
  content = content.trimEnd() + `

function AdManagement({ supabaseAdmin }) {
  const [tickerItems, setTickerItems] = useState([])
  const [activeSection, setActiveSection] = useState('ticker')
  const [form, setForm] = useState({ label: 'PR', text: '', url: '', sort_order: 0 })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => { fetchTicker() }, [])

  const fetchTicker = async () => {
    const { data } = await supabaseAdmin.from('ticker_items').select('*').order('sort_order')
    if (data) setTickerItems(data)
  }

  const saveTicker = async () => {
    setSaving(true)
    setMsg('')
    const { error } = await supabaseAdmin.from('ticker_items').insert([{ ...form, sort_order: Number(form.sort_order) }])
    if (!error) { setMsg('✅ 追加しました'); fetchTicker(); setForm({ label: 'PR', text: '', url: '', sort_order: 0 }) }
    else setMsg('❌ ' + error.message)
    setSaving(false)
  }

  const deleteTicker = async (id) => {
    await supabaseAdmin.from('ticker_items').delete().eq('id', id)
    fetchTicker()
  }

  const s = { input: { width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 13, marginBottom: 8, boxSizing: 'border-box' } }

  return (
    <div>
      {msg && <div style={{ padding: '10px 14px', background: '#f0f7ff', borderRadius: 8, marginBottom: 16, fontSize: 13 }}>{msg}</div>}
      <div style={{ background: '#fff', borderRadius: 12, padding: 20, border: '1px solid #eee', marginBottom: 20 }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 15, color: '#1a3a5c' }}>＋ ティッカーバナーを追加</h3>
        <select value={form.label} onChange={e => setForm({...form, label: e.target.value})} style={s.input}>
          <option>PR</option><option>広告</option><option>提携</option><option>お知らせ</option>
        </select>
        <input placeholder="テキスト（例：リフォームのご相談はこちら）" value={form.text} onChange={e => setForm({...form, text: e.target.value})} style={s.input} />
        <input placeholder="URL（例：https://example.com）" value={form.url} onChange={e => setForm({...form, url: e.target.value})} style={s.input} />
        <input placeholder="表示順（数字）" type="number" value={form.sort_order} onChange={e => setForm({...form, sort_order: e.target.value})} style={s.input} />
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
  )
}
`
  console.log('✅ AdManagement コンポーネントを追加')
}

fs.writeFileSync(filePath, content, 'utf8')
console.log('\n✅ SUCCESS!')
