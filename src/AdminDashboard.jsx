import { useState, useEffect } from 'react'
import ReactDOM from 'react-dom'
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
  { id: 'vendors', label: '🏢 業者管理' },
  { id: 'properties', label: '🏠 物件管理' },
  { id: 'cases', label: '💬 相談・案件管理' },
  { id: 'reports', label: '🚨 通報・トラブル管理' },
  { id: 'billing', label: '💳 課金・プラン管理' },
  { id: 'community', label: '🏘️ コミュニティ管理' },
  { id: 'ads', label: '📢 広告・PR管理' },
  { id: 'growth', label: '📈 KPI/分析' },
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
const DEAL_LABEL = { rent: '賃貸', sale: '売買', investment: '投資用', both: '賃貸・売買' }
const PREFECTURES = ['北海道','青森県','岩手県','宮城県','秋田県','山形県','福島県','茨城県','栃木県','群馬県','埼玉県','千葉県','東京都','神奈川県','新潟県','富山県','石川県','福井県','山梨県','長野県','岐阜県','静岡県','愛知県','三重県','滋賀県','京都府','大阪府','兵庫県','奈良県','和歌山県','鳥取県','島根県','岡山県','広島県','山口県','徳島県','香川県','愛媛県','高知県','福岡県','佐賀県','長崎県','熊本県','大分県','宮崎県','鹿児島県','沖縄県']

function PropertiesPanel({ supabase }) {
  const EMPTY_FORM = {
    deal_type: 'rent', status: 'active', title: '', property_type: '',
    catchcopy: '', prefecture: '', city: '', street_address: '',
    nearest_station_line: '', nearest_station_name: '', nearest_station_walk: '',
    layout: '', area: '', built_year: '', structure: '',
    total_floors: '', floor_number: '', direction: '', parking: '',
    description: '', features: '', image_url: '',
    rent: '', management_fee: '', security_deposit: '', key_money: '',
    available_date: '', contract_type: '', pet: '',
    price: '', monthly_fee: '', repair_fund: '', land_area: '',
    land_right: '', delivery_date: '', current_status: '',
    gross_yield: '', rental_income: '', total_rooms: '',
    occupancy_status: '', management_company: '',
  }
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isFeatured, setIsFeatured] = useState({})
  const [form, setForm] = useState(EMPTY_FORM)
  useEffect(() => { loadProperties() }, [])

  async function loadProperties() {
    setLoading(true)
    const { data } = await supabase.from('properties').select('*').order('created_at', { ascending: false })
    const list = data || []
    setProperties(list)
    const featuredMap = {}
    list.forEach(p => { featuredMap[p.id] = p.is_featured || false })
    setIsFeatured(featuredMap)
    setLoading(false)
  }

  async function handleSubmit() {
    if (!form.title.trim()) { alert('物件名は必須です'); return }
    setSubmitting(true)
    const address = [form.prefecture, form.city, form.street_address].filter(Boolean).join(' ')
    const payload = {
      title: form.title, deal_type: form.deal_type, status: form.status,
      property_type: form.property_type || null,
      catchcopy: form.catchcopy || null,
      address: address || null,
      prefecture: form.prefecture || null,
      city: form.city || null,
      street_address: form.street_address || null,
      nearest_station_line: form.nearest_station_line || null,
      nearest_station_name: form.nearest_station_name || null,
      nearest_station_walk: form.nearest_station_walk ? parseInt(form.nearest_station_walk) : null,
      layout: form.layout || null,
      area: form.area ? parseFloat(form.area) : null,
      built_year: form.built_year ? parseInt(form.built_year) : null,
      structure: form.structure || null,
      total_floors: form.total_floors ? parseInt(form.total_floors) : null,
      floor_number: form.floor_number ? parseInt(form.floor_number) : null,
      direction: form.direction || null,
      parking: form.parking || null,
      description: form.description || null,
      features: form.features || null,
      image_url: form.image_url || null,
      rent: form.rent ? parseFloat(form.rent) * 10000 : null,
      management_fee: form.management_fee ? parseInt(form.management_fee) : null,
      security_deposit: form.security_deposit ? parseFloat(form.security_deposit) : null,
      key_money: form.key_money ? parseFloat(form.key_money) : null,
      available_date: form.available_date || null,
      contract_type: form.contract_type || null,
      pet: form.pet || null,
      price: form.price ? parseInt(form.price) * 10000 : null,
      monthly_fee: form.monthly_fee ? parseInt(form.monthly_fee) : null,
      repair_fund: form.repair_fund ? parseInt(form.repair_fund) : null,
      land_area: form.land_area ? parseFloat(form.land_area) : null,
      land_right: form.land_right || null,
      delivery_date: form.delivery_date || null,
      current_status: form.current_status || null,
      gross_yield: form.gross_yield ? parseFloat(form.gross_yield) : null,
      rental_income: form.rental_income ? parseInt(form.rental_income) : null,
      total_rooms: form.total_rooms ? parseInt(form.total_rooms) : null,
      occupancy_status: form.occupancy_status || null,
      management_company: form.management_company || null,
    }
    const { error } = await supabase.from('properties').insert(payload)
    if (error) { alert('登録に失敗しました: ' + error.message); setSubmitting(false); return }
    setForm(EMPTY_FORM)
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

  async function toggleFeatured(id) {
    const current = isFeatured[id] || false
    const { error } = await supabase.from('properties').update({ is_featured: !current }).eq('id', id)
    if (error) { alert('おすすめ設定に失敗しました: ' + error.message); return }
    setIsFeatured(prev => ({ ...prev, [id]: !current }))
  }

  const F = { width: '100%', boxSizing: 'border-box', padding: '9px 12px', borderRadius: 10, border: '1px solid rgba(26,58,92,0.15)', background: '#fff', color: '#222', fontSize: 16, outline: 'none', fontFamily: 'inherit' }
  const L = { display: 'block', fontSize: 11, color: '#777', marginBottom: 4 }
  const Sep = ({ label }) => (
    <div style={{ gridColumn: '1 / -1', borderTop: '1px solid #e8edf2', paddingTop: 12, marginTop: 4 }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: '#1a3a5c', letterSpacing: 1 }}>{label}</span>
    </div>
  )
  const isRent = form.deal_type === 'rent'
  const isSale = form.deal_type === 'sale'
  const isInv  = form.deal_type === 'investment'
  const sf = v => e => setForm(p => ({ ...p, [v]: e.target.value }))

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

            <Sep label="基本情報" />
            <div><label style={L}>取引種別 *</label>
              <select style={F} value={form.deal_type} onChange={sf('deal_type')}>
                <option value="rent">賃貸</option><option value="sale">売買</option><option value="investment">投資用</option>
              </select></div>
            <div><label style={L}>公開ステータス</label>
              <select style={F} value={form.status} onChange={sf('status')}>
                <option value="active">公開中</option><option value="inactive">非公開</option>
              </select></div>
            <div style={{ gridColumn: '1 / -1' }}><label style={L}>物件名 *</label>
              <input style={F} value={form.title} onChange={sf('title')} placeholder="例：大宮駅徒歩5分 2LDKマンション" /></div>
            <div><label style={L}>物件種別</label>
              <select style={F} value={form.property_type} onChange={sf('property_type')}>
                <option value="">選択</option>
                {['マンション','アパート','一戸建て','土地','店舗・事務所','その他'].map(t => <option key={t} value={t}>{t}</option>)}
              </select></div>
            <div><label style={L}>キャッチコピー</label>
              <input style={F} value={form.catchcopy} onChange={sf('catchcopy')} placeholder="例：駅徒歩3分！リノベ済み物件" /></div>

            <Sep label="所在地" />
            <div><label style={L}>都道府県</label>
              <select style={F} value={form.prefecture} onChange={sf('prefecture')}>
                <option value="">選択</option>
                {PREFECTURES.map(p => <option key={p} value={p}>{p}</option>)}
              </select></div>
            <div><label style={L}>市区町村</label>
              <input style={F} value={form.city} onChange={sf('city')} placeholder="例：さいたま市大宮区" /></div>
            <div style={{ gridColumn: '1 / -1' }}><label style={L}>番地以降</label>
              <input style={F} value={form.street_address} onChange={sf('street_address')} placeholder="例：桜木町1-1-1" /></div>

            <Sep label="交通" />
            <div><label style={L}>最寄駅①路線名</label>
              <input style={F} value={form.nearest_station_line} onChange={sf('nearest_station_line')} placeholder="例：JR京浜東北線" /></div>
            <div><label style={L}>最寄駅①駅名</label>
              <input style={F} value={form.nearest_station_name} onChange={sf('nearest_station_name')} placeholder="例：大宮駅" /></div>
            <div><label style={L}>最寄駅①徒歩（分）</label>
              <input style={F} value={form.nearest_station_walk} onChange={sf('nearest_station_walk')} placeholder="例：5" inputMode="numeric" /></div>

            <Sep label="物件詳細" />
            <div><label style={L}>間取り</label>
              <select style={F} value={form.layout} onChange={sf('layout')}>
                <option value="">選択</option>
                {['ワンルーム','1K','1DK','1LDK','2K','2DK','2LDK','3K','3DK','3LDK','4LDK以上'].map(l => <option key={l} value={l}>{l}</option>)}
              </select></div>
            <div><label style={L}>専有面積（㎡）</label>
              <input style={F} value={form.area} onChange={sf('area')} placeholder="例：65.5" inputMode="decimal" /></div>
            <div><label style={L}>築年数（年）</label>
              <input style={F} value={form.built_year} onChange={sf('built_year')} placeholder="例：10" inputMode="numeric" /></div>
            <div><label style={L}>建物構造</label>
              <select style={F} value={form.structure} onChange={sf('structure')}>
                <option value="">選択</option>
                {['RC造','SRC造','鉄骨造','木造','軽量鉄骨造'].map(s => <option key={s} value={s}>{s}</option>)}
              </select></div>
            <div><label style={L}>総階数</label>
              <input style={F} value={form.total_floors} onChange={sf('total_floors')} placeholder="例：10" inputMode="numeric" /></div>
            <div><label style={L}>所在階</label>
              <input style={F} value={form.floor_number} onChange={sf('floor_number')} placeholder="例：3" inputMode="numeric" /></div>
            <div><label style={L}>方角</label>
              <select style={F} value={form.direction} onChange={sf('direction')}>
                <option value="">選択</option>
                {['南','南東','東','南西','西','北西','北','北東'].map(d => <option key={d} value={d}>{d}</option>)}
              </select></div>
            <div><label style={L}>駐車場</label>
              <select style={F} value={form.parking} onChange={sf('parking')}>
                <option value="">選択</option>
                {['あり','なし','近隣あり'].map(p => <option key={p} value={p}>{p}</option>)}
              </select></div>

            {isRent && <Sep label="賃貸条件" />}
            {isRent && <div><label style={L}>賃料（万円/月）*</label>
              <input style={F} value={form.rent} onChange={sf('rent')} placeholder="例：8" inputMode="decimal" /></div>}
            {isRent && <div><label style={L}>管理費・共益費（円/月）</label>
              <input style={F} value={form.management_fee} onChange={sf('management_fee')} placeholder="例：5000" inputMode="numeric" /></div>}
            {isRent && <div><label style={L}>敷金（ヶ月）</label>
              <input style={F} value={form.security_deposit} onChange={sf('security_deposit')} placeholder="例：1" inputMode="decimal" /></div>}
            {isRent && <div><label style={L}>礼金（ヶ月）</label>
              <input style={F} value={form.key_money} onChange={sf('key_money')} placeholder="例：1" inputMode="decimal" /></div>}
            {isRent && <div><label style={L}>入居可能日</label>
              <input style={F} type="date" value={form.available_date} onChange={sf('available_date')} /></div>}
            {isRent && <div><label style={L}>契約種別</label>
              <select style={F} value={form.contract_type} onChange={sf('contract_type')}>
                <option value="">選択</option><option value="普通借家">普通借家</option><option value="定期借家">定期借家</option>
              </select></div>}
            {isRent && <div><label style={L}>ペット</label>
              <select style={F} value={form.pet} onChange={sf('pet')}>
                <option value="">選択</option><option value="可">可</option><option value="不可">不可</option><option value="相談">相談</option>
              </select></div>}

            {isSale && <Sep label="売買条件" />}
            {isSale && <div><label style={L}>販売価格（万円）*</label>
              <input style={F} value={form.price} onChange={sf('price')} placeholder="例：3000" inputMode="numeric" /></div>}
            {isSale && <div><label style={L}>管理費（円/月）</label>
              <input style={F} value={form.monthly_fee} onChange={sf('monthly_fee')} placeholder="例：10000" inputMode="numeric" /></div>}
            {isSale && <div><label style={L}>修繕積立金（円/月）</label>
              <input style={F} value={form.repair_fund} onChange={sf('repair_fund')} placeholder="例：8000" inputMode="numeric" /></div>}
            {isSale && <div><label style={L}>土地面積（㎡）</label>
              <input style={F} value={form.land_area} onChange={sf('land_area')} placeholder="例：100.5" inputMode="decimal" /></div>}
            {isSale && <div><label style={L}>土地権利</label>
              <select style={F} value={form.land_right} onChange={sf('land_right')}>
                <option value="">選択</option><option value="所有権">所有権</option><option value="借地権">借地権</option>
              </select></div>}
            {isSale && <div><label style={L}>引渡し時期</label>
              <input style={F} value={form.delivery_date} onChange={sf('delivery_date')} placeholder="例：2025年4月" /></div>}
            {isSale && <div><label style={L}>現況</label>
              <select style={F} value={form.current_status} onChange={sf('current_status')}>
                <option value="">選択</option><option value="居住中">居住中</option><option value="空室">空室</option><option value="賃貸中">賃貸中</option>
              </select></div>}

            {isInv && <Sep label="投資用条件" />}
            {isInv && <div><label style={L}>販売価格（万円）*</label>
              <input style={F} value={form.price} onChange={sf('price')} placeholder="例：5000" inputMode="numeric" /></div>}
            {isInv && <div><label style={L}>表面利回り（%）</label>
              <input style={F} value={form.gross_yield} onChange={sf('gross_yield')} placeholder="例：7.5" inputMode="decimal" /></div>}
            {isInv && <div><label style={L}>現在の賃料収入（円/月）</label>
              <input style={F} value={form.rental_income} onChange={sf('rental_income')} placeholder="例：300000" inputMode="numeric" /></div>}
            {isInv && <div><label style={L}>総収益室数</label>
              <input style={F} value={form.total_rooms} onChange={sf('total_rooms')} placeholder="例：8" inputMode="numeric" /></div>}
            {isInv && <div><label style={L}>入居状況</label>
              <select style={F} value={form.occupancy_status} onChange={sf('occupancy_status')}>
                <option value="">選択</option><option value="満室">満室</option><option value="一部空室">一部空室</option><option value="空室">空室</option>
              </select></div>}
            {isInv && <div><label style={L}>管理会社名</label>
              <input style={F} value={form.management_company} onChange={sf('management_company')} placeholder="例：○○管理株式会社" /></div>}

            <Sep label="物件説明・写真" />
            <div style={{ gridColumn: '1 / -1' }}><label style={L}>物件説明文</label>
              <textarea style={{ ...F, minHeight: 80, resize: 'vertical' }} value={form.description} onChange={sf('description')} placeholder="物件の特徴や魅力を記入してください" /></div>
            <div style={{ gridColumn: '1 / -1' }}><label style={L}>設備・特徴（カンマ区切り）</label>
              <input style={F} value={form.features} onChange={sf('features')} placeholder="例：オートロック,宅配ボックス,エレベーター" /></div>
            <div style={{ gridColumn: '1 / -1' }}><label style={L}>物件写真</label>
              <ImageUploader supabase={supabase} onUploaded={url => setForm(p => ({ ...p, image_url: url }))} currentUrl={form.image_url} /></div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <button onClick={handleSubmit} disabled={submitting} style={{ padding: '10px 24px', background: '#1a3a5c', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1 }}>
              {submitting ? '登録中...' : '登録する'}
            </button>
            <button onClick={() => setShowForm(false)} style={{ padding: '10px 20px', background: 'transparent', color: '#777', border: '1px solid #ddd', borderRadius: 10, fontSize: 13, cursor: 'pointer' }}>キャンセル</button>
          </div>
        </div>
      )}

      {/* フィルターバー */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
        {[{ id: 'all', label: '全て' }, { id: 'active', label: '公開中' }, { id: 'inactive', label: '非公開' }].map(ft => (
          <button key={ft.id} onClick={() => setStatusFilter(ft.id)}
            style={{ padding: '7px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700,
              background: statusFilter === ft.id ? '#1a3a5c' : '#f0f0f0',
              color: statusFilter === ft.id ? '#fff' : '#555' }}>
            {ft.label}
          </button>
        ))}
        <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="タイトル・住所で検索"
          style={{ padding: '7px 12px', borderRadius: 8, border: '1px solid rgba(26,58,92,0.15)', fontSize: 16, outline: 'none', minWidth: 200, flex: 1 }} />
        <span style={{ fontSize: 13, color: '#777', flexShrink: 0 }}>
          {properties.filter(p => statusFilter === 'all' || p.status === statusFilter).filter(p => !searchQuery || p.title?.includes(searchQuery) || p.address?.includes(searchQuery)).length}件
        </span>
      </div>

      {(() => {
        const filtered = properties
          .filter(p => statusFilter === 'all' || p.status === statusFilter)
          .filter(p => !searchQuery || p.title?.includes(searchQuery) || p.address?.includes(searchQuery))
        if (filtered.length === 0) return <p style={{ color: '#777' }}>物件はありません。「物件を登録」ボタンから追加してください。</p>
        return filtered.map(p => (
          <div key={p.id} style={{ background: '#fff', borderRadius: 14, padding: 16, marginBottom: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            {p.image_url && <img src={p.image_url} alt={p.title} style={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 10, marginBottom: 12 }} />}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: '#1a3a5c' }}>{p.title}</div>
                  <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 999, fontWeight: 700,
                    background: p.deal_type === 'sale' ? '#fef3c7' : p.deal_type === 'investment' ? '#f3e8ff' : '#dbeafe',
                    color: p.deal_type === 'sale' ? '#92400e' : p.deal_type === 'investment' ? '#6b21a8' : '#1e40af' }}>
                    {DEAL_LABEL[p.deal_type] || '賃貸'}
                  </span>
                </div>
                <div style={{ fontSize: 13, color: '#555', marginTop: 4 }}>
                  <span style={{ marginRight: 8 }}>{DEAL_LABEL[p.deal_type] || '賃貸'}</span>
                  {p.layout && <span style={{ marginRight: 8 }}>{p.layout}</span>}
                  {p.area && <span style={{ marginRight: 8 }}>{p.area}㎡</span>}
                </div>
                <div style={{ fontSize: 13, color: '#555' }}>📍 {p.address}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#1a3a5c', marginTop: 4 }}>
                  {p.rent ? `賃料 ${Math.round(p.rent/10000)}万円/月` : ''}
                  {p.price ? `価格 ${(p.price/10000).toLocaleString()}万円` : ''}
                </div>
                <div style={{ fontSize: 11, color: '#aaa', marginTop: 4 }}>{p.created_at ? (() => { try { return new Date(p.created_at).toLocaleString('ja-JP') } catch(e) { return '' } })() : ''}</div>
              </div>
              <div style={{ display: 'flex', gap: 8, flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                <span style={{ padding: '4px 10px', borderRadius: 999, fontSize: 12, fontWeight: 700, background: p.status === 'active' ? '#dcfce7' : '#f1f5f9', color: p.status === 'active' ? '#16a34a' : '#94a3b8' }}>
                  {p.status === 'active' ? '✅ 公開中' : '⏸ 非公開'}
                </span>
                <button onClick={() => toggleStatus(p.id, p.status)} style={{ padding: '4px 12px', background: '#1a3a5c', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, cursor: 'pointer' }}>
                  {p.status === 'active' ? '非公開に' : '公開する'}
                </button>
                <button onClick={() => toggleFeatured(p.id)}
                  style={{ padding: '4px 12px', border: 'none', borderRadius: 8, fontSize: 12, cursor: 'pointer',
                    background: isFeatured[p.id] ? '#f59e0b' : '#e5e7eb',
                    color: isFeatured[p.id] ? '#fff' : '#555' }}>
                  {isFeatured[p.id] ? '⭐ おすすめ中' : '☆ おすすめ'}
                </button>
                <button onClick={() => deleteProperty(p.id)} style={{ padding: '4px 12px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, cursor: 'pointer' }}>削除</button>
              </div>
            </div>
          </div>
        ))
      })()}
    </div>
  )
}


function MembersPanel({ supabaseAdmin }) {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedMember, setSelectedMember] = useState(null)
  const [profile, setProfile] = useState(null)
  const [notes, setNotes] = useState([])
  const [noteInput, setNoteInput] = useState('')

  useEffect(() => {
    if (selectedMember) { fetchNotes(selectedMember.id); setNoteInput('') }
    else setNotes([])
  }, [selectedMember])

  async function fetchNotes(targetId) {
    const { data } = await supabase.from('admin_notes').select('*').eq('target_id', targetId).order('created_at', { ascending: true })
    setNotes(data || [])
  }

  async function addNote(targetId) {
    if (!noteInput.trim()) return
    await supabase.from('admin_notes').insert({ target_type: 'member', target_id: targetId, content: noteInput, admin_name: '管理者' })
    setNoteInput('')
    fetchNotes(targetId)
  }

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

  async function handleSelectMember(m) {
    setSelectedMember(m)
    setProfile(null)
    const { data } = await supabase.from('profiles').select('*').eq('id', m.id).single()
    setProfile(data || {})
  }

  const [deleteModal, setDeleteModal] = useState(null)
  // deleteModal: { member, checking, hasAgency, agencyName, hasPartner, partnerName }

  async function handleDeleteUser(member) {
    setDeleteModal({ member, checking: true })
    const res = await fetch(`/api/delete-user?userId=${member.id}`)
    const data = await res.json()
    setDeleteModal({ member, checking: false, ...data })
  }

  async function executeSoftDelete() {
    const { member } = deleteModal
    setDeleteModal(prev => ({ ...prev, checking: true }))
    const res = await fetch('/api/delete-user', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ userId: member.id, action: 'soft' }),
    })
    if (!res.ok) { alert('削除に失敗しました'); setDeleteModal(null); return }
    setMembers(list => list.map(m => m.id === member.id ? { ...m, deleted_at: new Date().toISOString(), account_status: 'suspended' } : m))
    setDeleteModal(null)
    setSelectedMember(null)
  }

  async function executeHardDelete() {
    const { member } = deleteModal
    setDeleteModal(prev => ({ ...prev, checking: true }))
    const res = await fetch('/api/delete-user', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ userId: member.id, action: 'hard' }),
    })
    if (!res.ok) { alert('削除に失敗しました'); setDeleteModal(null); return }
    setMembers(list => list.filter(m => m.id !== member.id))
    setDeleteModal(null)
    setSelectedMember(null)
  }

  async function executeRestore(member) {
    const res = await fetch('/api/delete-user', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ userId: member.id, action: 'restore' }),
    })
    if (!res.ok) { alert('復活に失敗しました'); return }
    setMembers(list => list.map(m => m.id === member.id ? { ...m, deleted_at: null, account_status: 'active' } : m))
    setSelectedMember(prev => prev?.id === member.id ? { ...prev, deleted_at: null, account_status: 'active' } : prev)
  }

  async function updateMemberStatus(userId, status, reason) {
    await supabaseAdmin.from('profiles').update({
      account_status: status,
      status_reason: reason,
      status_updated_at: new Date().toISOString()
    }).eq('id', userId)
    setMembers(list => list.map(m => m.id === userId ? { ...m, account_status: status } : m))
    setSelectedMember(prev => prev?.id === userId ? { ...prev, account_status: status } : prev)
  }

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#777' }}>読み込み中...</div>

  {/* 削除確認モーダル */}
  const deleteModalUI = deleteModal && (() => {
    const { member, checking, hasAgency, agencyName, hasPartner, partnerName } = deleteModal
    const daysLeft = member?.deleted_at ? Math.max(0, 30 - Math.floor((Date.now() - new Date(member.deleted_at)) / 86400000)) : null
    return ReactDOM.createPortal(
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <div style={{ background: '#fff', borderRadius: 16, padding: 32, maxWidth: 480, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
          {checking ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#666' }}>確認中...</div>
          ) : member?.deleted_at ? (
            <>
              <div style={{ fontSize: 32, textAlign: 'center', marginBottom: 12 }}>♻️</div>
              <h3 style={{ textAlign: 'center', margin: '0 0 8px', fontSize: 18 }}>削除予約中の会員</h3>
              <p style={{ textAlign: 'center', color: '#666', fontSize: 14, margin: '0 0 24px' }}>
                残り <strong style={{ color: '#e53e3e' }}>{daysLeft}日</strong> で完全削除されます
              </p>
              <div style={{ display: 'flex', gap: 10, flexDirection: 'column' }}>
                <button onClick={() => executeRestore(member)} style={{ padding: '12px', background: '#38a169', color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, cursor: 'pointer', fontWeight: 600 }}>✅ アカウントを復活させる</button>
                <button onClick={executeHardDelete} style={{ padding: '12px', background: '#e53e3e', color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, cursor: 'pointer', fontWeight: 600 }}>🗑️ 今すぐ完全削除する</button>
                <button onClick={() => setDeleteModal(null)} style={{ padding: '12px', background: '#f0f0f0', color: '#333', border: 'none', borderRadius: 8, fontSize: 15, cursor: 'pointer' }}>キャンセル</button>
              </div>
            </>
          ) : (
            <>
              <div style={{ fontSize: 32, textAlign: 'center', marginBottom: 12 }}>⚠️</div>
              <h3 style={{ textAlign: 'center', margin: '0 0 8px', fontSize: 18 }}>{member?.email} を削除しますか？</h3>
              {(hasAgency || hasPartner) && (
                <div style={{ background: '#fff8e1', border: '1px solid #f6c342', borderRadius: 10, padding: '14px 16px', margin: '16px 0', fontSize: 14 }}>
                  <div style={{ fontWeight: 700, color: '#b45309', marginBottom: 6 }}>⚠️ 注意：他の登録も存在します</div>
                  {hasAgency && <div style={{ color: '#555', marginBottom: 4 }}>🏢 不動産業者：{agencyName || '登録あり'}</div>}
                  {hasPartner && <div style={{ color: '#555' }}>🤝 広告パートナー：{partnerName || '登録あり'}</div>}
                  <div style={{ marginTop: 8, color: '#b45309', fontSize: 13 }}>一般会員を削除してもこれらのデータは保持されます。</div>
                </div>
              )}
              <div style={{ background: '#f7f7f7', borderRadius: 10, padding: '14px 16px', margin: '16px 0', fontSize: 13, color: '#555' }}>
                <div style={{ fontWeight: 600, marginBottom: 6 }}>🕐 論理削除（推奨）</div>
                <div>30日間は復活可能。期間経過後に自動で完全削除されます。</div>
              </div>
              <div style={{ display: 'flex', gap: 10, flexDirection: 'column' }}>
                <button onClick={executeSoftDelete} style={{ padding: '12px', background: '#dd6b20', color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, cursor: 'pointer', fontWeight: 600 }}>🕐 削除予約（30日後に完全削除）</button>
                <button onClick={executeHardDelete} style={{ padding: '12px', background: '#e53e3e', color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, cursor: 'pointer', fontWeight: 600 }}>🗑️ 今すぐ完全削除（取り消し不可）</button>
                <button onClick={() => setDeleteModal(null)} style={{ padding: '12px', background: '#f0f0f0', color: '#333', border: 'none', borderRadius: 8, fontSize: 15, cursor: 'pointer' }}>キャンセル</button>
              </div>
            </>
          )}
        </div>
      </div>,
      document.body
    )
  })()

  return (
    <div>
      {deleteModalUI}
      <h2 style={{ margin: '0 0 20px', color: '#1a3a5c', fontSize: 20 }}>👤 会員管理（{members.filter(m => m.user_metadata?.user_type !== 'agency' && m.user_metadata?.user_type !== 'partner').length}件）</h2>
      {error && <div style={{ padding: '12px 16px', borderRadius: 12, background: '#fee2e2', color: '#dc2626', fontSize: 13, marginBottom: 16 }}>{error}</div>}
      {members.filter(m => m.user_metadata?.user_type !== 'agency' && m.user_metadata?.user_type !== 'partner').length === 0 ? <p style={{ color: '#777' }}>会員はいません</p> : members.filter(m => m.user_metadata?.user_type !== 'agency' && m.user_metadata?.user_type !== 'partner').map(m => (
        <div key={m.id} onClick={() => handleSelectMember(m)} style={{ background: '#fff', borderRadius: 14, padding: 16, marginBottom: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', cursor: 'pointer', border: '2px solid transparent', transition: 'border-color 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.borderColor = '#1a3a5c'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: '#1a3a5c' }}>{m.user_metadata?.name || '（名前未設定）'}</div>
              <div style={{ fontSize: 13, color: '#555', marginTop: 4 }}>✉️ {m.email}</div>
              <div style={{ fontSize: 13, color: '#555' }}>
                種別：{m.user_metadata?.user_type === 'partner' ? 'パートナー業者' : m.user_metadata?.user_type === 'agency' ? '不動産業者' : '一般会員'}
                {m.user_metadata?.user_type === 'partner' && (m.user_metadata?.company_name || m.user_metadata?.business_type) && (
                  <span style={{ marginLeft: 8, background: '#fef3c7', color: '#92400e', borderRadius: 4, padding: '1px 6px', fontSize: 11 }}>
                    {[m.user_metadata?.company_name, m.user_metadata?.business_type].filter(Boolean).join(' / ')}
                  </span>
                )}
              </div>
              <div style={{ fontSize: 11, color: '#aaa', marginTop: 4, display: 'flex', gap: 12 }}>
                <span>登録：{m.created_at ? new Date(m.created_at).toLocaleString('ja-JP') : ''}</span>
                <span>最終ログイン：{m.last_sign_in_at ? new Date(m.last_sign_in_at).toLocaleString('ja-JP') : '未ログイン'}</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              <span style={{ padding: '4px 10px', borderRadius: 999, fontSize: 12, fontWeight: 700,
                background: m.email_confirmed_at ? '#dcfce7' : '#fef9c3',
                color: m.email_confirmed_at ? '#16a34a' : '#92400e'
              }}>
                {m.email_confirmed_at ? '✅ 認証済' : '⏳ 未認証'}
              </span>
              {m.account_status === 'suspended' && (
                <span style={{ padding: '4px 10px', borderRadius: 999, fontSize: 12, fontWeight: 700, background: '#fff7ed', color: '#c2410c' }}>⏸ 停止中</span>
              )}
              {m.account_status === 'banned' && (
                <span style={{ padding: '4px 10px', borderRadius: 999, fontSize: 12, fontWeight: 700, background: '#fee2e2', color: '#dc2626' }}>🚫 BAN</span>
              )}
              <button onClick={e => { e.stopPropagation(); handleDeleteUser(m) }} style={{ padding: '4px 12px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, cursor: 'pointer' }}>
                削除
              </button>
            </div>
          </div>
        </div>
      ))}

      {selectedMember && ReactDOM.createPortal(
        <div onClick={() => setSelectedMember(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 16, padding: 28, width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto', position: 'relative', boxShadow: '0 8px 40px rgba(0,0,0,0.18)' }}>
            <button onClick={() => setSelectedMember(null)} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#999', lineHeight: 1 }}>×</button>
            <h3 style={{ margin: '0 0 20px', color: '#1a3a5c', fontSize: 18, fontWeight: 800, paddingRight: 32 }}>
              {selectedMember.user_metadata?.name || '（名前未設定）'}
            </h3>
            {[
              { label: 'メール', value: selectedMember.email },
              { label: '種別', value: selectedMember.user_metadata?.user_type === 'partner' ? 'パートナー業者' : selectedMember.user_metadata?.user_type === 'agency' ? '不動産業者' : '一般会員' },
              ...(selectedMember.user_metadata?.user_type === 'partner' ? [
                { label: '会社名', value: selectedMember.user_metadata?.company_name || '—' },
                { label: '業種', value: selectedMember.user_metadata?.business_type || '—' },
              ] : []),
              { label: '電話番号', value: profile?.phone || selectedMember.user_metadata?.phone || '—' },
              { label: '登録日', value: selectedMember.created_at ? new Date(selectedMember.created_at).toLocaleString('ja-JP') : '—' },
              { label: '最終ログイン', value: selectedMember.last_sign_in_at ? new Date(selectedMember.last_sign_in_at).toLocaleString('ja-JP') : '未ログイン' },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: '1px solid #f0f0f0', fontSize: 14 }}>
                <span style={{ color: '#888', minWidth: 110, flexShrink: 0 }}>{label}</span>
                <span style={{ color: '#1a3a5c', fontWeight: 500, wordBreak: 'break-all' }}>{value}</span>
              </div>
            ))}
            <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ padding: '6px 14px', borderRadius: 999, fontSize: 13, fontWeight: 700,
                background: selectedMember.email_confirmed_at ? '#dcfce7' : '#fef9c3',
                color: selectedMember.email_confirmed_at ? '#16a34a' : '#92400e'
              }}>
                {selectedMember.email_confirmed_at ? '✅ メール認証済' : '⏳ メール未認証'}
              </span>
              {selectedMember.account_status === 'suspended' && (
                <span style={{ padding: '6px 14px', borderRadius: 999, fontSize: 13, fontWeight: 700, background: '#fff7ed', color: '#c2410c' }}>⏸ 停止中</span>
              )}
              {selectedMember.account_status === 'banned' && (
                <span style={{ padding: '6px 14px', borderRadius: 999, fontSize: 13, fontWeight: 700, background: '#fee2e2', color: '#dc2626' }}>🚫 BAN</span>
              )}
              {selectedMember.account_status === 'active' && (
                <span style={{ padding: '6px 14px', borderRadius: 999, fontSize: 13, fontWeight: 700, background: '#dcfce7', color: '#16a34a' }}>✅ 有効</span>
              )}
            </div>
            <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {(!selectedMember.account_status || selectedMember.account_status === 'active') && (
                <button onClick={() => {
                  const reason = window.prompt('停止理由を入力してください')
                  if (reason === null) return
                  updateMemberStatus(selectedMember.id, 'suspended', reason)
                }} style={{ padding: '8px 16px', background: '#f59e0b', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>⏸ 一時停止</button>
              )}
              {selectedMember.account_status !== 'banned' && (
                <button onClick={() => {
                  if (!window.confirm('このユーザーをBANしますか？')) return
                  const reason = window.prompt('BAN理由を入力してください')
                  if (reason === null) return
                  updateMemberStatus(selectedMember.id, 'banned', reason)
                }} style={{ padding: '8px 16px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>🚫 BAN</button>
              )}
              {selectedMember.account_status && selectedMember.account_status !== 'active' && (
                <button onClick={() => updateMemberStatus(selectedMember.id, 'active', null)}
                  style={{ padding: '8px 16px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>✅ 有効に戻す</button>
              )}
              <button onClick={() => handleDeleteUser(selectedMember)}
                style={{ padding: '8px 16px', background: '#fff', color: '#dc2626', border: '1.5px solid #dc2626', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>🗑️ 削除</button>
            </div>
            <div style={{ borderTop: '1px solid #f0f0f0', marginTop: 20, paddingTop: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1a3a5c', marginBottom: 10 }}>📝 管理者メモ</div>
              <div style={{ marginBottom: 12, maxHeight: 180, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {notes.length === 0 && <p style={{ color: '#aaa', fontSize: 12, margin: 0 }}>メモはありません</p>}
                {notes.map(n => (
                  <div key={n.id} style={{ background: '#f8f9fa', borderRadius: 8, padding: '8px 12px' }}>
                    <div style={{ fontSize: 11, color: '#aaa', marginBottom: 2 }}>{n.admin_name} • {n.created_at ? new Date(n.created_at).toLocaleString('ja-JP') : ''}</div>
                    <div style={{ fontSize: 13, color: '#333' }}>{n.content}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <textarea value={noteInput} onChange={e => setNoteInput(e.target.value)}
                  placeholder="メモを入力..." rows={2}
                  style={{ flex: 1, padding: '8px 10px', border: '1px solid #ddd', borderRadius: 8, fontSize: 16, resize: 'vertical', fontFamily: 'inherit' }} />
                <button onClick={() => addNote(selectedMember.id)}
                  style={{ padding: '8px 16px', background: '#1a3a5c', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', alignSelf: 'flex-end' }}>
                  メモを追加
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}

export default function AdminDashboard() {
  const [authed, setAuthed] = useState(() => localStorage.getItem('admin_authed') === 'true')
  const [pw, setPw] = useState('')
  const [pwError, setPwError] = useState('')
  const [tab, setTab] = useState('summary')

  // データ
  const [members, setMembers] = useState([])
  const [agencies, setAgencies] = useState([])
  const [selectedAgency, setSelectedAgency] = useState(null)
  const [valuations, setValuations] = useState([])
  const [experts, setExperts] = useState([])
  const [community, setCommunity] = useState([])
  const [owners, setOwners] = useState([])
  const [loading, setLoading] = useState(false)
  const [growthData, setGrowthData] = useState(null)
  const [partners, setPartners] = useState([])
  const [partnerLoading, setPartnerLoading] = useState(false)
  const [selectedPartner, setSelectedPartner] = useState(null)
  const [vendorSubTab, setVendorSubTab] = useState('agency')
  const [reports, setReports] = useState([])
  const [reportLoading, setReportLoading] = useState(false)
  const [casesSubTab, setCasesSubTab] = useState('valuations')
  const [billingSubTab, setBillingSubTab] = useState('agency')
  const [expertRegs, setExpertRegs] = useState([])
  const [agencyNotes, setAgencyNotes] = useState([])
  const [agencyNoteInput, setAgencyNoteInput] = useState('')
  const [allMembers, setAllMembers] = useState([])
  const [communityFilter, setCommunityFilter] = useState('all')
  const [communitySearch, setCommunitySearch] = useState('')

  async function fetchGrowthData() {
    const since7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const since1d = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { data: events } = await supabase.from('analytics_events').select('*').gte('created_at', since7d);
    const { data: experts } = await supabase.from('expert_registrations').select('*');

    if (!events) return;

    const pageViews = events.filter(e => e.event_type === 'page_view' && e.metadata?.page === 'home');
    const registerClicks = events.filter(e => e.event_type === 'expert_register_click');
    const registerCompletes = events.filter(e => e.event_type === 'expert_register_complete');
    const pageViews1d = events.filter(e => e.event_type === 'page_view' && e.metadata?.page === 'home' && e.created_at >= since1d);

    const uniqueSessions = new Set(pageViews.map(e => e.session_id)).size;
    const clickRate = uniqueSessions > 0 ? Math.round((registerClicks.length / uniqueSessions) * 100) : 0;
    const registerRate = registerClicks.length > 0 ? Math.round((registerCompletes.length / registerClicks.length) * 100) : 0;
    const totalExperts = experts?.length || 0;

    setGrowthData({
      uniqueSessions,
      pageViews1d: new Set(pageViews1d.map(e => e.session_id)).size,
      registerClicks: registerClicks.length,
      registerCompletes: registerCompletes.length,
      clickRate,
      registerRate,
      totalExperts,
      recentEvents: events.slice(-20).reverse(),
    });
  }

  async function loadAll() {
    setLoading(true)
    try {
      const [m, a, v, e, c, o] = await Promise.all([
        { data: [] },
        supabaseAdmin.from('agency_registrations').select('*').order('created_at', { ascending: false }),
        supabaseAdmin.from('valuations').select('*').order('created_at', { ascending: false }),
        supabaseAdmin.from('expert_requests').select('*').order('created_at', { ascending: false }),
        supabaseAdmin.from('community_posts').select('*').order('created_at', { ascending: false }),
        supabaseAdmin.from('owner_requests').select('*').order('created_at', { ascending: false }),
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
    if (authed) { loadAll(); fetchGrowthData(); fetchAllMembers(); fetchReports(); }
  }, [authed])

  useEffect(() => {
    if (tab === 'vendors' && vendorSubTab === 'partner' && partners.length === 0) fetchPartners()
  }, [tab, vendorSubTab])

  useEffect(() => {
    if (tab === 'reports') fetchReports()
    if (tab === 'billing' && billingSubTab === 'expert') fetchExpertRegs()
  }, [tab, billingSubTab])

  useEffect(() => {
    if (selectedAgency) { fetchAgencyNotes(selectedAgency.id); setAgencyNoteInput('') }
    else setAgencyNotes([])
  }, [selectedAgency])

  async function deletePost(id) {
    if (!window.confirm('この投稿を削除しますか？')) return
    const { error } = await supabaseAdmin.from('community_posts').delete().eq('id', id)
    if (error) { alert('削除失敗: ' + error.message); return }
    setCommunity(list => list.filter(p => p.id !== id))
  }

  async function hidePost(id) {
    const { error } = await supabase.from('community_posts').update({ is_public: false }).eq('id', id)
    if (error) { alert('このカラムはまだ設定されていません'); return }
    setCommunity(list => list.map(p => p.id === id ? { ...p, is_public: false } : p))
  }

  async function updateAgencyStatus(id, status) {
    await supabase.from('agency_registrations').update({ status }).eq('id', id)
    setAgencies(list => list.map(a => a.id === id ? { ...a, status } : a))
  }

  async function deleteAgency(id) {
    const target = agencies.find(a => a.id === id)
    if (!window.confirm(`「${target?.company_name || ''}」を削除しますか？この操作は取り消せません。`)) return
    if (target?.agency_user_id) {
      await fetch('/api/delete-user', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ userId: target.agency_user_id, action: 'hard' }),
      })
    }
    await supabaseAdmin.from('agency_registrations').delete().eq('id', id)
    setAgencies(list => list.filter(a => a.id !== id))
    setSelectedAgency(null)
  }

  async function updateValuationStatus(id, status) {
    await supabase.from('valuations').update({ status }).eq('id', id)
    setValuations(list => list.map(v => v.id === id ? { ...v, status } : v))
  }

  async function fetchPartners() {
    setPartnerLoading(true)
    try {
      const { data: authData, error } = await supabaseAdmin.auth.admin.listUsers()
      if (error) throw error
      const partnerUsers = (authData.users || []).filter(u => u.user_metadata?.user_type === 'partner')
      const { data: profiles } = await supabase.from('partner_profiles').select('*')
      const profileMap = {}
      if (profiles) profiles.forEach(p => { profileMap[p.user_id] = p })
      setPartners(partnerUsers.map(u => ({ ...u, profile: profileMap[u.id] || null })))
    } catch (e) {
      console.error(e)
    } finally {
      setPartnerLoading(false)
    }
  }

  async function updatePartnerStatus(userId, status) {
    await supabase.from('partner_profiles').upsert({ user_id: userId, ad_status: status }, { onConflict: 'user_id' })
    setPartners(list => list.map(p => p.id === userId ? { ...p, profile: { ...(p.profile || {}), ad_status: status } } : p))
    setSelectedPartner(prev => prev?.id === userId ? { ...prev, profile: { ...(prev.profile || {}), ad_status: status } } : prev)
  }

  async function deletePartner(userId, companyName) {
    if (!window.confirm(`「${companyName || 'このユーザー'}」を削除しますか？この操作は取り消せません。`)) return
    const res = await fetch('/api/delete-partner', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      alert('削除に失敗しました: ' + (data.error || res.status))
      return
    }
    setPartners(list => list.filter(p => p.id !== userId))
    setSelectedPartner(null)
  }

  async function fetchReports() {
    setReportLoading(true)
    const { data } = await supabaseAdmin.from('reports').select('*').order('created_at', { ascending: false })
    setReports(data || [])
    setReportLoading(false)
  }

  async function updateReportStatus(id, status) {
    await supabaseAdmin.from('reports').update({ status }).eq('id', id)
    setReports(list => list.map(r => r.id === id ? { ...r, status } : r))
  }

  async function fetchExpertRegs() {
    const { data } = await supabase.from('expert_registrations').select('*').order('created_at', { ascending: false })
    setExpertRegs(data || [])
  }

  async function fetchAllMembers() {
    try {
      const { data } = await supabaseAdmin.auth.admin.listUsers()
      setAllMembers(data?.users || [])
    } catch(e) { console.error(e) }
  }

  async function fetchAgencyNotes(targetId) {
    const { data } = await supabase.from('admin_notes').select('*').eq('target_id', targetId).order('created_at', { ascending: true })
    setAgencyNotes(data || [])
  }

  async function addAgencyNote(targetId, targetType) {
    if (!agencyNoteInput.trim()) return
    await supabase.from('admin_notes').insert({ target_type: targetType, target_id: targetId, content: agencyNoteInput, admin_name: '管理者' })
    setAgencyNoteInput('')
    fetchAgencyNotes(targetId)
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
            onKeyDown={e => e.key === 'Enter' && (pw === ADMIN_PASSWORD ? (setAuthed(true), localStorage.setItem('admin_authed', 'true'), setPwError('')) : setPwError('パスワードが違います'))}
            style={{ width: '100%', boxSizing: 'border-box', padding: '11px 12px', borderRadius: 12, border: '1px solid rgba(26,58,92,0.15)', fontSize: 14, outline: 'none', marginBottom: 12 }}
            placeholder="パスワードを入力"
          />
          {pwError && <p style={{ color: '#dc2626', fontSize: 13, marginBottom: 8 }}>{pwError}</p>}
          <button
            onClick={() => pw === ADMIN_PASSWORD ? (setAuthed(true), localStorage.setItem('admin_authed', 'true'), setPwError('')) : setPwError('パスワードが違います')}
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
          <button onClick={() => { setAuthed(false); localStorage.removeItem('admin_authed'); }} style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontSize: 13 }}>
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
          {tab === 'summary' && (() => {
            const pendingValuations = valuations.filter(v => !v.is_handled)
            const kpiCards = [
              { label: '総会員数', value: allMembers.length, color: '#3b82f6', icon: '👤', tabTo: 'members' },
              { label: '不動産業者数', value: agencies.length, color: '#1a3a5c', icon: '🏠', tabTo: 'vendors' },
              { label: '広告パートナー数', value: partners.length, color: '#7c3aed', icon: '📢', tabTo: 'vendors' },
              { label: '未対応査定依頼', value: pendingValuations.length, color: '#f59e0b', icon: '📋', tabTo: 'cases' },
              { label: 'コミュニティ投稿数', value: community.length, color: '#10b981', icon: '🏘️', tabTo: 'community' },
              { label: '通報件数', value: reports.length, color: '#ef4444', icon: '🚨', tabTo: 'reports' },
            ]
            return (
              <div>
                <h2 style={{ margin: '0 0 20px', color: '#1a3a5c', fontSize: 20 }}>📊 ダッシュボード サマリー</h2>

                {/* KPIカード */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 24 }}>
                  {kpiCards.map(c => (
                    <div key={c.label} onClick={() => setTab(c.tabTo)}
                      style={{ background: '#fff', borderRadius: 14, padding: '20px 16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderTop: `3px solid ${c.color}`, cursor: 'pointer', transition: 'transform 0.1s' }}
                      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                      onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                      <div style={{ fontSize: 22, marginBottom: 4 }}>{c.icon}</div>
                      <div style={{ fontSize: 30, fontWeight: 800, color: c.color }}>{c.value}</div>
                      <div style={{ fontSize: 12, color: '#777', marginTop: 4 }}>{c.label}</div>
                    </div>
                  ))}
                </div>

                {/* アラートバナー */}
                {reports.length > 0 && (
                  <div onClick={() => setTab('reports')}
                    style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 10, padding: '12px 16px', marginBottom: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 18 }}>🚨</span>
                    <span style={{ fontSize: 14, color: '#dc2626', fontWeight: 700 }}>未対応の通報が{reports.length}件あります。確認してください。</span>
                  </div>
                )}
                {pendingValuations.length > 0 && (
                  <div onClick={() => setTab('cases')}
                    style={{ background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: 10, padding: '12px 16px', marginBottom: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 18 }}>⚠️</span>
                    <span style={{ fontSize: 14, color: '#92400e', fontWeight: 700 }}>未対応の査定依頼が{pendingValuations.length}件あります。</span>
                  </div>
                )}

                {/* 最新アクティビティ 2カラム */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div style={{ background: '#fff', borderRadius: 14, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                    <h3 style={{ margin: '0 0 14px', color: '#1a3a5c', fontSize: 15 }}>📋 最新の査定依頼</h3>
                    {valuations.length === 0 && <p style={{ color: '#aaa', fontSize: 13 }}>データなし</p>}
                    {valuations.slice(0, 5).map(v => (
                      <div key={v.id} style={{ padding: '8px 0', borderBottom: '1px solid #f0f4f8', fontSize: 13 }}>
                        <div style={{ fontWeight: 600, color: '#222' }}>{v.name}</div>
                        <div style={{ color: '#777', fontSize: 12 }}>{v.property_type} / {v.address}</div>
                        <div style={{ color: '#aaa', fontSize: 11 }}>{v.created_at ? new Date(v.created_at).toLocaleDateString('ja-JP') : ''}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ background: '#fff', borderRadius: 14, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                    <h3 style={{ margin: '0 0 14px', color: '#1a3a5c', fontSize: 15 }}>👤 最新の会員登録</h3>
                    {allMembers.length === 0 && <p style={{ color: '#aaa', fontSize: 13 }}>データなし</p>}
                    {allMembers.slice(0, 5).map(u => (
                      <div key={u.id} style={{ padding: '8px 0', borderBottom: '1px solid #f0f4f8', fontSize: 13 }}>
                        <div style={{ fontWeight: 600, color: '#222' }}>{u.email}</div>
                        <div style={{ color: '#777', fontSize: 12 }}>{u.user_metadata?.user_type || '一般'}{u.user_metadata?.company_name ? ` / ${u.user_metadata.company_name}` : ''}</div>
                        <div style={{ color: '#aaa', fontSize: 11 }}>{u.created_at ? new Date(u.created_at).toLocaleDateString('ja-JP') : ''}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
          })()}

          {/* 企業管理 */}
          {tab === 'agencies' && (
            <div>
              <h2 style={{ margin: '0 0 20px', color: '#1a3a5c', fontSize: 20 }}>🏢 企業様管理（{agencies.length}件）</h2>
              {agencies.length === 0 ? <p style={{ color: '#777' }}>登録はありません</p> : agencies.map(a => (
                <div key={a.id} onClick={() => setSelectedAgency(a)} style={{ background: '#fff', borderRadius: 14, padding: 16, marginBottom: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', cursor: 'pointer', border: '2px solid transparent', transition: 'border-color 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = '#1a3a5c'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15, color: '#1a3a5c' }}>{a.company_name}</div>
                      <div style={{ fontSize: 13, color: '#555', marginTop: 4 }}>担当：{a.contact_name} / {a.phone} / {a.email}</div>
                      <div style={{ fontSize: 13, color: '#555' }}>業種：{a.business_type} / エリア：{a.area}</div>
                      {a.service_description && <div style={{ fontSize: 12, color: '#777', marginTop: 4 }}>{a.service_description}</div>}
                      <div style={{ fontSize: 11, color: '#aaa', marginTop: 4 }}>{a.created_at ? new Date(a.created_at).toLocaleString('ja-JP') : ''}</div>
                    </div>
                    <span style={{ padding: '4px 10px', borderRadius: 999, fontSize: 12, fontWeight: 700, flexShrink: 0,
                      background: a.status === 'approved' ? '#dcfce7' : a.status === 'rejected' ? '#fee2e2' : '#fef9c3',
                      color: a.status === 'approved' ? '#16a34a' : a.status === 'rejected' ? '#dc2626' : '#92400e'
                    }}>
                      {a.status === 'approved' ? '✅ 承認済' : a.status === 'rejected' ? '❌ 却下' : '⏳ 審査中'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 業者管理 */}
          {tab === 'vendors' && (
            <div>
              <h2 style={{ margin: '0 0 16px', color: '#1a3a5c', fontSize: 20 }}>🏢 業者管理</h2>
              <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                {[{ id: 'agency', label: '🏠 不動産業者' }, { id: 'partner', label: '📢 広告パートナー' }].map(t => (
                  <button key={t.id} onClick={() => setVendorSubTab(t.id)}
                    style={{ padding: '8px 18px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700,
                      background: vendorSubTab === t.id ? '#1a3a5c' : '#f0f0f0',
                      color: vendorSubTab === t.id ? '#fff' : '#555' }}>
                    {t.label}
                  </button>
                ))}
              </div>

              {vendorSubTab === 'agency' && (
                <div>
                  <div style={{ color: '#777', fontSize: 13, marginBottom: 12 }}>{agencies.length}件</div>
                  {agencies.length === 0 ? <p style={{ color: '#777' }}>登録はありません</p> : agencies.map(a => (
                    <div key={a.id} onClick={() => setSelectedAgency(a)}
                      style={{ background: '#fff', borderRadius: 14, padding: 16, marginBottom: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', cursor: 'pointer', border: '2px solid transparent', transition: 'border-color 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = '#1a3a5c'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 15, color: '#1a3a5c' }}>{a.company_name}</div>
                          <div style={{ fontSize: 13, color: '#555', marginTop: 4 }}>担当：{a.contact_name} / {a.phone} / {a.email}</div>
                          <div style={{ fontSize: 13, color: '#555' }}>業種：{a.business_type} / エリア：{a.area}</div>
                          {a.service_description && <div style={{ fontSize: 12, color: '#777', marginTop: 4 }}>{a.service_description}</div>}
                          <div style={{ fontSize: 11, color: '#aaa', marginTop: 4 }}>{a.created_at ? new Date(a.created_at).toLocaleString('ja-JP') : ''}</div>
                        </div>
                        <span style={{ padding: '4px 10px', borderRadius: 999, fontSize: 12, fontWeight: 700, flexShrink: 0,
                          background: a.status === 'approved' ? '#dcfce7' : a.status === 'rejected' ? '#fee2e2' : '#fef9c3',
                          color: a.status === 'approved' ? '#16a34a' : a.status === 'rejected' ? '#dc2626' : '#92400e' }}>
                          {a.status === 'approved' ? '✅ 承認済' : a.status === 'rejected' ? '❌ 却下' : '⏳ 審査中'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {vendorSubTab === 'partner' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div style={{ color: '#777', fontSize: 13 }}>{partners.length}件</div>
                    <button onClick={fetchPartners} style={{ background: '#f0f0f0', border: 'none', borderRadius: 8, padding: '6px 14px', fontSize: 12, cursor: 'pointer' }}>🔄 更新</button>
                  </div>
                  {partnerLoading && <p style={{ color: '#777', fontSize: 13 }}>読み込み中...</p>}
                  {!partnerLoading && partners.length === 0 && <p style={{ color: '#999', fontSize: 13 }}>パートナー業者の登録はありません</p>}
                  {partners.map(p => {
                    const status = p.profile?.ad_status || '審査中'
                    const statusColor = status === '掲載中' ? '#16a34a' : status === '却下' ? '#dc2626' : '#92400e'
                    const statusBg = status === '掲載中' ? '#dcfce7' : status === '却下' ? '#fee2e2' : '#fef9c3'
                    return (
                      <div key={p.id} onClick={() => setSelectedPartner(p)}
                        style={{ background: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, border: '2px solid transparent', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', cursor: 'pointer', transition: 'border-color 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = '#1a3a5c'}
                        onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, fontSize: 15, color: '#1a3a5c' }}>{p.user_metadata?.company_name || '(会社名未設定)'}</div>
                            <div style={{ fontSize: 13, color: '#555', marginTop: 4 }}>業種：{p.user_metadata?.business_type || '—'}</div>
                            <div style={{ fontSize: 13, color: '#555' }}>✉️ {p.email}</div>
                            <div style={{ fontSize: 11, color: '#aaa', marginTop: 4 }}>登録：{p.created_at ? new Date(p.created_at).toLocaleString('ja-JP') : ''}</div>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
                            <span style={{ padding: '4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 700, background: statusBg, color: statusColor }}>
                              {status === '掲載中' ? '✅ 承認済' : status === '却下' ? '❌ 却下' : '⏳ 審査中'}
                            </span>
                            <div style={{ display: 'flex', gap: 6 }}>
                              {status !== '掲載中' && <button onClick={e => { e.stopPropagation(); updatePartnerStatus(p.id, '掲載中') }} style={{ padding: '5px 14px', background: '#1a3a5c', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>承認</button>}
                              {status !== '却下' && <button onClick={e => { e.stopPropagation(); updatePartnerStatus(p.id, '却下') }} style={{ padding: '5px 14px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>却下</button>}
                              {status !== '審査中' && <button onClick={e => { e.stopPropagation(); updatePartnerStatus(p.id, '審査中') }} style={{ padding: '5px 14px', background: '#f0f0f0', color: '#555', border: 'none', borderRadius: 8, fontSize: 12, cursor: 'pointer' }}>審査中に戻す</button>}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
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

          {/* 相談・案件管理 */}
          {tab === 'cases' && (
            <div>
              <h2 style={{ margin: '0 0 16px', color: '#1a3a5c', fontSize: 20 }}>💬 相談・案件管理</h2>
              <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                {[{ id: 'valuations', label: '🏠 査定依頼' }, { id: 'experts', label: '👔 専門家依頼' }].map(t => (
                  <button key={t.id} onClick={() => setCasesSubTab(t.id)}
                    style={{ padding: '8px 18px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700,
                      background: casesSubTab === t.id ? '#1a3a5c' : '#f0f0f0',
                      color: casesSubTab === t.id ? '#fff' : '#555' }}>
                    {t.label}
                  </button>
                ))}
              </div>
              {casesSubTab === 'valuations' && (
                <div>
                  <div style={{ color: '#777', fontSize: 13, marginBottom: 12 }}>{valuations.length}件</div>
                  {valuations.length === 0 ? <p style={{ color: '#777' }}>依頼はありません</p> : valuations.map(v => (
                    <div key={v.id} style={{ background: '#fff', borderRadius: 14, padding: 16, marginBottom: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 15, color: '#1a3a5c' }}>{v.name}</div>
                          <div style={{ fontSize: 13, color: '#555', marginTop: 4 }}>✉️ {v.email} / {v.property_type}</div>
                          <div style={{ fontSize: 13, color: '#555' }}>📍 {v.address}</div>
                          <div style={{ fontSize: 11, color: '#aaa', marginTop: 4 }}>{v.created_at ? new Date(v.created_at).toLocaleString('ja-JP') : ''}</div>
                        </div>
                        <div>
                          <span style={{ padding: '4px 10px', borderRadius: 999, fontSize: 12, fontWeight: 700,
                            background: v.status === 'done' ? '#dcfce7' : '#fef9c3',
                            color: v.status === 'done' ? '#16a34a' : '#92400e' }}>
                            {v.status === 'done' ? '✅ 対応済' : '⏳ 未対応'}
                          </span>
                          {v.status !== 'done' && <button onClick={() => updateValuationStatus(v.id, 'done')} style={{ marginLeft: 8, padding: '4px 12px', background: '#1a3a5c', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, cursor: 'pointer' }}>対応済にする</button>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {casesSubTab === 'experts' && (
                <div>
                  <div style={{ color: '#777', fontSize: 13, marginBottom: 12 }}>{experts.length}件</div>
                  {experts.length === 0 ? <p style={{ color: '#777' }}>依頼はありません</p> : experts.map(e => (
                    <div key={e.id} style={{ background: '#fff', borderRadius: 14, padding: 16, marginBottom: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                      <div style={{ fontWeight: 700, fontSize: 15, color: '#1a3a5c' }}>{e.name}</div>
                      <div style={{ fontSize: 13, color: '#555', marginTop: 4 }}>カテゴリ：{e.expert_type}</div>
                      <div style={{ fontSize: 13, color: '#555' }}>✉️ {e.email}</div>
                      {e.situation && <div style={{ fontSize: 12, color: '#777', marginTop: 4 }}>{e.situation}</div>}
                      <div style={{ fontSize: 11, color: '#aaa', marginTop: 4 }}>{e.created_at ? new Date(e.created_at).toLocaleString('ja-JP') : ''}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 通報・トラブル管理 */}
          {tab === 'reports' && (
            <div>
              <h2 style={{ margin: '0 0 20px', color: '#1a3a5c', fontSize: 20 }}>🚨 通報・トラブル管理</h2>
              {reportLoading && <p style={{ color: '#777' }}>読み込み中...</p>}
              {!reportLoading && reports.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#16a34a', fontSize: 15, fontWeight: 700 }}>現在通報はありません ✅</div>
              )}
              {reports.map(r => {
                const statusMap = { 未確認: { bg: '#fef9c3', color: '#92400e', label: '⏳ 未確認' }, 調査中: { bg: '#fff7ed', color: '#c2410c', label: '🔍 調査中' }, 対応済み: { bg: '#dcfce7', color: '#16a34a', label: '✅ 対応済み' }, 却下: { bg: '#f1f5f9', color: '#94a3b8', label: '— 却下' } }
                const s = statusMap[r.status] || statusMap['未確認']
                return (
                  <div key={r.id} style={{ background: '#fff', borderRadius: 14, padding: 16, marginBottom: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 15, color: '#1a3a5c' }}>{r.reason || r.report_reason || '（理由未記入）'}</div>
                        {r.target_type && <div style={{ fontSize: 13, color: '#555', marginTop: 4 }}>対象種別：{r.target_type}</div>}
                        <div style={{ fontSize: 11, color: '#aaa', marginTop: 4 }}>{r.created_at ? new Date(r.created_at).toLocaleString('ja-JP') : ''}</div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
                        <span style={{ padding: '4px 10px', borderRadius: 999, fontSize: 12, fontWeight: 700, background: s.bg, color: s.color }}>{s.label}</span>
                        <div style={{ display: 'flex', gap: 6 }}>
                          {r.status !== '調査中' && <button onClick={() => updateReportStatus(r.id, '調査中')} style={{ padding: '4px 10px', background: '#f0f0f0', color: '#555', border: 'none', borderRadius: 6, fontSize: 11, cursor: 'pointer' }}>調査中にする</button>}
                          {r.status !== '対応済み' && <button onClick={() => updateReportStatus(r.id, '対応済み')} style={{ padding: '4px 10px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 6, fontSize: 11, cursor: 'pointer' }}>対応済み</button>}
                          {r.status !== '却下' && <button onClick={() => updateReportStatus(r.id, '却下')} style={{ padding: '4px 10px', background: '#94a3b8', color: '#fff', border: 'none', borderRadius: 6, fontSize: 11, cursor: 'pointer' }}>却下</button>}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* 課金・プラン管理 */}
          {tab === 'billing' && (
            <div>
              <h2 style={{ margin: '0 0 16px', color: '#1a3a5c', fontSize: 20 }}>💳 課金・プラン管理</h2>
              <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                {[{ id: 'agency', label: '🏠 不動産業者' }, { id: 'expert', label: '👔 専門家' }].map(t => (
                  <button key={t.id} onClick={() => setBillingSubTab(t.id)}
                    style={{ padding: '8px 18px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700,
                      background: billingSubTab === t.id ? '#1a3a5c' : '#f0f0f0',
                      color: billingSubTab === t.id ? '#fff' : '#555' }}>
                    {t.label}
                  </button>
                ))}
              </div>
              {(() => {
                const planBadge = (plan) => {
                  const p = plan || 'free'
                  const styles = { free: { bg: '#f1f5f9', color: '#555' }, standard: { bg: '#1a3a5c', color: '#fff' }, premium: { bg: '#c9a84c', color: '#fff' } }
                  const s = styles[p] || styles.free
                  return <span style={{ padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700, background: s.bg, color: s.color }}>{p.toUpperCase()}</span>
                }
                const list = billingSubTab === 'agency' ? agencies : expertRegs
                if (billingSubTab === 'expert' && expertRegs.length === 0) return <p style={{ color: '#777', fontSize: 13 }}>読み込み中... または登録なし</p>
                return list.length === 0 ? <p style={{ color: '#777' }}>登録はありません</p> : list.map(item => (
                  <div key={item.id} style={{ background: '#fff', borderRadius: 12, padding: '14px 16px', marginBottom: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: '#1a3a5c' }}>{item.company_name || item.name || '—'}</div>
                      <div style={{ fontSize: 13, color: '#555', marginTop: 2 }}>✉️ {item.email}</div>
                      <div style={{ fontSize: 11, color: '#aaa', marginTop: 2 }}>{item.created_at ? new Date(item.created_at).toLocaleString('ja-JP') : ''}</div>
                    </div>
                    {planBadge(item.plan)}
                  </div>
                ))
              })()}
            </div>
          )}

          {/* コミュニティ管理 */}
          {tab === 'community' && (() => {
            const hasReported = p => p.is_reported || (p.report_count != null && p.report_count > 0)
            const filtered = community.filter(p => {
              if (communityFilter === 'reported' && !hasReported(p)) return false
              if (communityFilter === 'hidden' && p.is_public !== false) return false
              const q = communitySearch.toLowerCase()
              if (q && !(p.title?.toLowerCase().includes(q) || p.author_name?.toLowerCase().includes(q))) return false
              return true
            })
            return (
              <div>
                <h2 style={{ margin: '0 0 16px', color: '#1a3a5c', fontSize: 20 }}>🏘️ コミュニティ管理（{community.length}件）</h2>

                {/* フィルターバー */}
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
                  {[{ id: 'all', label: '全て' }, { id: 'reported', label: '⚠️ 通報あり' }, { id: 'hidden', label: '🚫 非公開' }].map(f => (
                    <button key={f.id} onClick={() => setCommunityFilter(f.id)}
                      style={{ padding: '7px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700,
                        background: communityFilter === f.id ? '#1a3a5c' : '#f0f0f0',
                        color: communityFilter === f.id ? '#fff' : '#555' }}>
                      {f.label}
                    </button>
                  ))}
                  <input
                    value={communitySearch}
                    onChange={e => setCommunitySearch(e.target.value)}
                    placeholder="タイトル・投稿者名で検索"
                    style={{ padding: '7px 12px', borderRadius: 8, border: '1px solid rgba(26,58,92,0.15)', fontSize: 13, outline: 'none', minWidth: 200, flex: 1 }}
                  />
                  <span style={{ fontSize: 13, color: '#777' }}>{filtered.length}件</span>
                </div>

                {/* 投稿カード */}
                {filtered.length === 0 && <p style={{ color: '#777' }}>投稿はありません</p>}
                {filtered.map(p => (
                  <div key={p.id} style={{ background: '#fff', borderRadius: 14, padding: 16, marginBottom: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: hasReported(p) ? '1px solid #fca5a5' : '1px solid transparent' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                          <span style={{ fontWeight: 700, fontSize: 15, color: '#1a3a5c' }}>{p.title}</span>
                          {p.is_public === false && <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: '#e5e7eb', color: '#6b7280' }}>非公開</span>}
                          {hasReported(p) && <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: '#fee2e2', color: '#dc2626' }}>⚠️ 通報あり</span>}
                          {p.category && <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 999, background: '#eff6ff', color: '#2563eb' }}>{p.category}</span>}
                        </div>
                        <div style={{ fontSize: 13, color: '#555', lineHeight: 1.5 }}>{p.body?.slice(0, 100)}{p.body?.length > 100 ? '...' : ''}</div>
                        <div style={{ fontSize: 12, color: '#aaa', marginTop: 6, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                          <span>投稿者：{p.author_name || '匿名'}</span>
                          {p.likes_count != null && <span>❤️ {p.likes_count}</span>}
                          <span>{p.created_at ? (() => { try { return new Date(p.created_at).toLocaleString('ja-JP') } catch(e) { return '' } })() : ''}</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
                        {p.is_public !== false && (
                          <button onClick={() => hidePost(p.id)} style={{ padding: '6px 12px', background: '#f59e0b', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                            🚫 非公開
                          </button>
                        )}
                        <button onClick={() => deletePost(p.id)} style={{ padding: '6px 12px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, cursor: 'pointer' }}>
                          🗑️ 削除
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          })()}

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

          {/* 広告管理 */}
          {tab === 'ads' && (
            <div>
              <h2 style={{ margin: '0 0 20px', color: '#1a3a5c', fontSize: 20 }}>📢 広告管理</h2>
              <AdManagement supabaseAdmin={supabaseAdmin} />
            </div>
          )}

          {tab === 'growth' && (
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1a3a5c', marginBottom: 24 }}>📊 グロース分析（過去7日間）</h2>
              {!growthData ? (
                <p style={{ color: '#64748b' }}>データ読み込み中...</p>
              ) : (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 24 }}>
                    {[
                      { label: 'ユニーク訪問数', value: growthData.uniqueSessions, unit: '人', color: '#3b82f6' },
                      { label: '登録ボタンクリック', value: growthData.registerClicks, unit: '回', color: '#8b5cf6' },
                      { label: '登録完了数', value: growthData.registerCompletes, unit: '件', color: '#10b981' },
                      { label: 'クリック率', value: growthData.clickRate, unit: '%', color: '#f59e0b' },
                      { label: '登録完了率', value: growthData.registerRate, unit: '%', color: '#ef4444' },
                      { label: '専門家総数', value: growthData.totalExperts, unit: '人', color: '#1a3a5c' },
                    ].map(item => (
                      <div key={item.label} style={{ background: 'white', borderRadius: 12, padding: '16px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderTop: `4px solid ${item.color}` }}>
                        <p style={{ margin: '0 0 8px', fontSize: 12, color: '#64748b' }}>{item.label}</p>
                        <p style={{ margin: 0, fontSize: 28, fontWeight: 800, color: item.color }}>{item.value}<span style={{ fontSize: 14, fontWeight: 400 }}>{item.unit}</span></p>
                      </div>
                    ))}
                  </div>

                  <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: 24 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 800, color: '#1a3a5c', marginBottom: 16 }}>🤖 AI改善提案</h3>
                    {growthData.clickRate < 5 && (
                      <div style={{ background: '#fff8f0', border: '1px solid #f59e0b', borderRadius: 8, padding: '12px 16px', marginBottom: 8 }}>
                        <p style={{ margin: 0, fontSize: 13, color: '#92400e' }}>⚠️ <strong>クリック率が低い（{growthData.clickRate}%）</strong>：トップページのCTAボタンの文言・色・位置を改善してください</p>
                      </div>
                    )}
                    {growthData.registerRate < 30 && growthData.registerClicks > 0 && (
                      <div style={{ background: '#fff0f0', border: '1px solid #ef4444', borderRadius: 8, padding: '12px 16px', marginBottom: 8 }}>
                        <p style={{ margin: 0, fontSize: 13, color: '#991b1b' }}>⚠️ <strong>登録完了率が低い（{growthData.registerRate}%）</strong>：登録フォームの項目数・文言を見直してください</p>
                      </div>
                    )}
                    {growthData.clickRate >= 5 && growthData.registerRate >= 30 && (
                      <div style={{ background: '#f0fff4', border: '1px solid #10b981', borderRadius: 8, padding: '12px 16px' }}>
                        <p style={{ margin: 0, fontSize: 13, color: '#065f46' }}>✅ <strong>KPIは良好です！</strong>このまま流入数を増やすことに注力してください</p>
                      </div>
                    )}
                    {growthData.uniqueSessions === 0 && (
                      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '12px 16px' }}>
                        <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>📊 まだデータが蓄積中です。訪問者が増えると分析が表示されます</p>
                      </div>
                    )}
                  </div>

                  <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                    <h3 style={{ fontSize: 16, fontWeight: 800, color: '#1a3a5c', marginBottom: 16 }}>📋 最近のイベントログ</h3>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                        <thead>
                          <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                            <th style={{ padding: '8px 12px', textAlign: 'left', color: '#64748b', fontWeight: 600 }}>イベント</th>
                            <th style={{ padding: '8px 12px', textAlign: 'left', color: '#64748b', fontWeight: 600 }}>セッションID</th>
                            <th style={{ padding: '8px 12px', textAlign: 'left', color: '#64748b', fontWeight: 600 }}>日時</th>
                          </tr>
                        </thead>
                        <tbody>
                          {growthData.recentEvents.map((e, i) => (
                            <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                              <td style={{ padding: '8px 12px' }}>
                                <span style={{ background: '#f0f4ff', color: '#1a3a5c', borderRadius: 4, padding: '2px 8px', fontSize: 12, fontWeight: 600 }}>{e.event_type}</span>
                              </td>
                              <td style={{ padding: '8px 12px', color: '#94a3b8', fontFamily: 'monospace', fontSize: 11 }}>{e.session_id?.slice(0, 8)}...</td>
                              <td style={{ padding: '8px 12px', color: '#64748b' }}>{new Date(e.created_at).toLocaleString('ja-JP')}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {selectedPartner && ReactDOM.createPortal(
        <div onClick={() => setSelectedPartner(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 16, padding: 28, width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto', position: 'relative', boxShadow: '0 8px 40px rgba(0,0,0,0.18)' }}>
            <button onClick={() => setSelectedPartner(null)} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#999', lineHeight: 1 }}>×</button>
            <h3 style={{ margin: '0 0 20px', color: '#1a3a5c', fontSize: 18, fontWeight: 800, paddingRight: 32 }}>
              {selectedPartner.user_metadata?.company_name || '(会社名未設定)'}
            </h3>
            {(() => {
              const status = selectedPartner.profile?.ad_status || '審査中'
              const statusColor = status === '掲載中' ? '#16a34a' : status === '却下' ? '#dc2626' : '#92400e'
              const statusBg = status === '掲載中' ? '#dcfce7' : status === '却下' ? '#fee2e2' : '#fef9c3'
              return (
                <>
                  {[
                    { label: '会社名', value: selectedPartner.user_metadata?.company_name || '—' },
                    { label: '業種', value: selectedPartner.user_metadata?.business_type || '—' },
                    { label: 'メール', value: selectedPartner.email },
                    { label: '登録日', value: selectedPartner.created_at ? new Date(selectedPartner.created_at).toLocaleString('ja-JP') : '—' },
                    { label: '最終ログイン', value: selectedPartner.last_sign_in_at ? new Date(selectedPartner.last_sign_in_at).toLocaleString('ja-JP') : '未ログイン' },
                  ].map(({ label, value }) => (
                    <div key={label} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: '1px solid #f0f0f0', fontSize: 14 }}>
                      <span style={{ color: '#888', minWidth: 110, flexShrink: 0 }}>{label}</span>
                      <span style={{ color: '#1a3a5c', fontWeight: 500, wordBreak: 'break-all' }}>{value}</span>
                    </div>
                  ))}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 16, marginTop: 4, flexWrap: 'wrap' }}>
                    <span style={{ padding: '6px 14px', borderRadius: 999, fontSize: 13, fontWeight: 700, background: statusBg, color: statusColor }}>
                      {status === '掲載中' ? '✅ 承認済' : status === '却下' ? '❌ 却下' : '⏳ 審査中'}
                    </span>
                    <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
                      {status !== '掲載中' && <button onClick={() => updatePartnerStatus(selectedPartner.id, '掲載中')} style={{ padding: '8px 18px', background: '#1a3a5c', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>承認</button>}
                      {status !== '却下' && <button onClick={() => updatePartnerStatus(selectedPartner.id, '却下')} style={{ padding: '8px 18px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>却下</button>}
                      {status !== '審査中' && <button onClick={() => updatePartnerStatus(selectedPartner.id, '審査中')} style={{ padding: '8px 18px', background: '#f0f0f0', color: '#555', border: 'none', borderRadius: 8, fontSize: 13, cursor: 'pointer' }}>審査中に戻す</button>}
                    </div>
                  </div>
                  <div style={{ borderTop: '1px solid #f0f0f0', marginTop: 16, paddingTop: 16 }}>
                    <button onClick={() => deletePartner(selectedPartner.id, selectedPartner.user_metadata?.company_name)} style={{ background: '#fff', color: '#dc2626', border: '1px solid #dc2626', borderRadius: 8, padding: '8px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                      🗑️ このユーザーを削除
                    </button>
                  </div>
                </>
              )
            })()}
          </div>
        </div>,
        document.body
      )}

      {selectedAgency && ReactDOM.createPortal(
        <div onClick={() => setSelectedAgency(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 16, padding: 28, width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto', position: 'relative', boxShadow: '0 8px 40px rgba(0,0,0,0.18)' }}>
            <button onClick={() => setSelectedAgency(null)} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#999', lineHeight: 1 }}>×</button>
            <h3 style={{ margin: '0 0 20px', color: '#1a3a5c', fontSize: 18, fontWeight: 800, paddingRight: 32 }}>{selectedAgency.company_name}</h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 20px', marginBottom: 20 }}>
              {[
                { label: '担当者名', value: selectedAgency.contact_name },
                { label: 'メール', value: selectedAgency.email },
                { label: '電話', value: selectedAgency.phone },
                { label: '業種', value: selectedAgency.business_type },
                { label: 'エリア', value: selectedAgency.area },
                { label: '宅建業免許番号', value: selectedAgency.license_number || '—' },
                { label: '会社URL', value: selectedAgency.url || '—' },
                { label: '登録日', value: selectedAgency.created_at ? new Date(selectedAgency.created_at).toLocaleString('ja-JP') : '—' },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div style={{ fontSize: 11, color: '#999', marginBottom: 2 }}>{label}</div>
                  <div style={{ fontSize: 13, color: '#1e293b', fontWeight: 600, wordBreak: 'break-all' }}>{value}</div>
                </div>
              ))}
            </div>

            {selectedAgency.deal_types?.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, color: '#999', marginBottom: 6 }}>取扱種別</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {selectedAgency.deal_types.map(t => (
                    <span key={t} style={{ background: '#f0f4ff', color: '#1a3a5c', borderRadius: 6, padding: '3px 10px', fontSize: 12, fontWeight: 600 }}>{t}</span>
                  ))}
                </div>
              </div>
            )}

            {selectedAgency.service_description && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 11, color: '#999', marginBottom: 4 }}>サービス説明</div>
                <div style={{ fontSize: 13, color: '#555', lineHeight: 1.6 }}>{selectedAgency.service_description}</div>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 16, borderTop: '1px solid #f0f0f0' }}>
              <span style={{ padding: '4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 700,
                background: selectedAgency.status === 'approved' ? '#dcfce7' : selectedAgency.status === 'rejected' ? '#fee2e2' : '#fef9c3',
                color: selectedAgency.status === 'approved' ? '#16a34a' : selectedAgency.status === 'rejected' ? '#dc2626' : '#92400e'
              }}>
                {selectedAgency.status === 'approved' ? '✅ 承認済' : selectedAgency.status === 'rejected' ? '❌ 却下' : '⏳ 審査中'}
              </span>
              <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
                {selectedAgency.status !== 'approved' && (
                  <button onClick={() => { updateAgencyStatus(selectedAgency.id, 'approved'); setSelectedAgency(prev => ({ ...prev, status: 'approved' })); }} style={{ padding: '8px 18px', background: '#1a3a5c', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>承認</button>
                )}
                {selectedAgency.status !== 'rejected' && (
                  <button onClick={() => { updateAgencyStatus(selectedAgency.id, 'rejected'); setSelectedAgency(prev => ({ ...prev, status: 'rejected' })); }} style={{ padding: '8px 18px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>却下</button>
                )}
                <button onClick={() => deleteAgency(selectedAgency.id)} style={{ padding: '8px 18px', background: '#7f1d1d', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>削除</button>
              </div>
            </div>
            <div style={{ borderTop: '1px solid #f0f0f0', marginTop: 20, paddingTop: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1a3a5c', marginBottom: 10 }}>📝 管理者メモ</div>
              <div style={{ marginBottom: 12, maxHeight: 180, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {agencyNotes.length === 0 && <p style={{ color: '#aaa', fontSize: 12, margin: 0 }}>メモはありません</p>}
                {agencyNotes.map(n => (
                  <div key={n.id} style={{ background: '#f8f9fa', borderRadius: 8, padding: '8px 12px' }}>
                    <div style={{ fontSize: 11, color: '#aaa', marginBottom: 2 }}>{n.admin_name} • {n.created_at ? new Date(n.created_at).toLocaleString('ja-JP') : ''}</div>
                    <div style={{ fontSize: 13, color: '#333' }}>{n.content}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <textarea value={agencyNoteInput} onChange={e => setAgencyNoteInput(e.target.value)}
                  placeholder="メモを入力..." rows={2}
                  style={{ flex: 1, padding: '8px 10px', border: '1px solid #ddd', borderRadius: 8, fontSize: 16, resize: 'vertical', fontFamily: 'inherit' }} />
                <button onClick={() => addAgencyNote(selectedAgency.id, 'agency')}
                  style={{ padding: '8px 16px', background: '#1a3a5c', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', alignSelf: 'flex-end' }}>
                  メモを追加
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}


function AdManagement({ supabaseAdmin }) {
  const [tickerItems, setTickerItems] = useState([])
  const [adItems, setAdItems] = useState([])
  const [partners, setPartners] = useState([])
  const [partnerLoading, setPartnerLoading] = useState(false)
  const [selectedPartner, setSelectedPartner] = useState(null)
  const [activeSection, setActiveSection] = useState('ticker')
  const [form, setForm] = useState({ label: 'PR', text: '', url: '', active: true, sort_order: 0 })
  const [adForm, setAdForm] = useState({ label: '広告', title: '', description: '', url: '', active: true, color: '#1a3a5c' })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    fetchTicker()
    fetchAds()
  }, [])

  useEffect(() => {
    if (activeSection === 'パートナー' && partners.length === 0) fetchPartners()
  }, [activeSection])

  const fetchPartners = async () => {
    setPartnerLoading(true)
    try {
      const { data: authData, error } = await supabaseAdmin.auth.admin.listUsers()
      if (error) throw error
      const partnerUsers = (authData.users || []).filter(u => u.user_metadata?.user_type === 'partner')
      const { data: profiles } = await supabaseAdmin.from('partner_profiles').select('*')
      const profileMap = {}
      if (profiles) profiles.forEach(p => { profileMap[p.user_id] = p })
      setPartners(partnerUsers.map(u => ({ ...u, profile: profileMap[u.id] || null })))
    } catch (e) {
      console.error(e)
    } finally {
      setPartnerLoading(false)
    }
  }

  const updatePartnerStatus = async (userId, status) => {
    await supabaseAdmin.from('partner_profiles').upsert({ user_id: userId, ad_status: status }, { onConflict: 'user_id' })
    setPartners(list => list.map(p => p.id === userId ? { ...p, profile: { ...(p.profile || {}), ad_status: status } } : p))
    setSelectedPartner(prev => prev?.id === userId ? { ...prev, profile: { ...(prev.profile || {}), ad_status: status } } : prev)
  }

  const deletePartner = async (userId, companyName) => {
    if (!window.confirm(`「${companyName || 'このユーザー'}」を削除しますか？この操作は取り消せません。`)) return
    const res = await fetch('/api/delete-partner', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      alert('削除に失敗しました: ' + (data.error || res.status))
      return
    }
    setPartners(list => list.filter(p => p.id !== userId))
    setSelectedPartner(null)
  }

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
    if (!error) { setMsg('✅ 追加しました'); fetchAds(); setAdForm({ label: '広告', title: '', description: '', url: '', active: true, color: '#1a3a5c' }) }
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
        <button style={btnStyle(activeSection==='パートナー')} onClick={() => setActiveSection('パートナー')}>👥パートナー業者</button>
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
            <input placeholder="説明文（例：外壁・内装・水回りの工事）" value={adForm.description} onChange={e => setAdForm({...adForm, description: e.target.value})} style={inputStyle} />
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
                <span style={{ fontSize: 11, color: '#999', flex: 1 }}>{item.description}</span>
                <button onClick={() => deleteAd(item.id)} style={{ background: '#fee', color: '#c00', border: '1px solid #fcc', borderRadius: 6, padding: '4px 10px', fontSize: 12, cursor: 'pointer' }}>削除</button>
              </div>
            ))}
            {adItems.length === 0 && <p style={{ color: '#999', fontSize: 13 }}>データがありません</p>}
          </div>
        </div>
      )}

      {activeSection === 'パートナー' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 15, color: '#1a3a5c' }}>👥 パートナー業者一覧（{partners.length}件）</h3>
            <button onClick={fetchPartners} style={{ background: '#f0f0f0', border: 'none', borderRadius: 8, padding: '6px 14px', fontSize: 12, cursor: 'pointer' }}>🔄 更新</button>
          </div>
          {partnerLoading && <p style={{ color: '#777', fontSize: 13 }}>読み込み中...</p>}
          {!partnerLoading && partners.length === 0 && <p style={{ color: '#999', fontSize: 13 }}>パートナー業者の登録はありません</p>}
          {partners.map(p => {
            const status = p.profile?.ad_status || '審査中'
            const statusColor = status === '掲載中' ? '#16a34a' : status === '却下' ? '#dc2626' : '#92400e'
            const statusBg = status === '掲載中' ? '#dcfce7' : status === '却下' ? '#fee2e2' : '#fef9c3'
            return (
              <div key={p.id} onClick={() => setSelectedPartner(p)}
                style={{ background: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, border: '2px solid transparent', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', cursor: 'pointer', transition: 'border-color 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#1a3a5c'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, color: '#1a3a5c' }}>{p.user_metadata?.company_name || '(会社名未設定)'}</div>
                    <div style={{ fontSize: 13, color: '#555', marginTop: 4 }}>業種：{p.user_metadata?.business_type || '—'}</div>
                    <div style={{ fontSize: 13, color: '#555' }}>✉️ {p.email}</div>
                    <div style={{ fontSize: 11, color: '#aaa', marginTop: 4 }}>登録：{p.created_at ? new Date(p.created_at).toLocaleString('ja-JP') : ''}</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
                    <span style={{ padding: '4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 700, background: statusBg, color: statusColor }}>
                      {status === '掲載中' ? '✅ 承認済' : status === '却下' ? '❌ 却下' : '⏳ 審査中'}
                    </span>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {status !== '掲載中' && (
                        <button onClick={e => { e.stopPropagation(); updatePartnerStatus(p.id, '掲載中') }} style={{ padding: '5px 14px', background: '#1a3a5c', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>承認</button>
                      )}
                      {status !== '却下' && (
                        <button onClick={e => { e.stopPropagation(); updatePartnerStatus(p.id, '却下') }} style={{ padding: '5px 14px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>却下</button>
                      )}
                      {status !== '審査中' && (
                        <button onClick={e => { e.stopPropagation(); updatePartnerStatus(p.id, '審査中') }} style={{ padding: '5px 14px', background: '#f0f0f0', color: '#555', border: 'none', borderRadius: 8, fontSize: 12, cursor: 'pointer' }}>審査中に戻す</button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {selectedPartner && ReactDOM.createPortal(
        <div onClick={() => setSelectedPartner(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 16, padding: 28, width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto', position: 'relative', boxShadow: '0 8px 40px rgba(0,0,0,0.18)' }}>
            <button onClick={() => setSelectedPartner(null)} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#999', lineHeight: 1 }}>×</button>
            <h3 style={{ margin: '0 0 20px', color: '#1a3a5c', fontSize: 18, fontWeight: 800, paddingRight: 32 }}>
              {selectedPartner.user_metadata?.company_name || '(会社名未設定)'}
            </h3>
            {(() => {
              const status = selectedPartner.profile?.ad_status || '審査中'
              const statusColor = status === '掲載中' ? '#16a34a' : status === '却下' ? '#dc2626' : '#92400e'
              const statusBg = status === '掲載中' ? '#dcfce7' : status === '却下' ? '#fee2e2' : '#fef9c3'
              return (
                <>
                  {[
                    { label: '会社名', value: selectedPartner.user_metadata?.company_name || '—' },
                    { label: '業種', value: selectedPartner.user_metadata?.business_type || '—' },
                    { label: 'メール', value: selectedPartner.email },
                    { label: '登録日', value: selectedPartner.created_at ? new Date(selectedPartner.created_at).toLocaleString('ja-JP') : '—' },
                    { label: '最終ログイン', value: selectedPartner.last_sign_in_at ? new Date(selectedPartner.last_sign_in_at).toLocaleString('ja-JP') : '未ログイン' },
                  ].map(({ label, value }) => (
                    <div key={label} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: '1px solid #f0f0f0', fontSize: 14 }}>
                      <span style={{ color: '#888', minWidth: 110, flexShrink: 0 }}>{label}</span>
                      <span style={{ color: '#1a3a5c', fontWeight: 500, wordBreak: 'break-all' }}>{value}</span>
                    </div>
                  ))}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 16, marginTop: 4, flexWrap: 'wrap' }}>
                    <span style={{ padding: '6px 14px', borderRadius: 999, fontSize: 13, fontWeight: 700, background: statusBg, color: statusColor }}>
                      {status === '掲載中' ? '✅ 承認済' : status === '却下' ? '❌ 却下' : '⏳ 審査中'}
                    </span>
                    <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
                      {status !== '掲載中' && (
                        <button onClick={() => updatePartnerStatus(selectedPartner.id, '掲載中')} style={{ padding: '8px 18px', background: '#1a3a5c', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>承認</button>
                      )}
                      {status !== '却下' && (
                        <button onClick={() => updatePartnerStatus(selectedPartner.id, '却下')} style={{ padding: '8px 18px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>却下</button>
                      )}
                      {status !== '審査中' && (
                        <button onClick={() => updatePartnerStatus(selectedPartner.id, '審査中')} style={{ padding: '8px 18px', background: '#f0f0f0', color: '#555', border: 'none', borderRadius: 8, fontSize: 13, cursor: 'pointer' }}>審査中に戻す</button>
                      )}
                    </div>
                  </div>
                  <div style={{ borderTop: '1px solid #f0f0f0', marginTop: 16, paddingTop: 16 }}>
                    <button onClick={() => deletePartner(selectedPartner.id, selectedPartner.user_metadata?.company_name)} style={{ background: '#fff', color: '#dc2626', border: '1px solid #dc2626', borderRadius: 8, padding: '8px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                      🗑️ このユーザーを削除
                    </button>
                  </div>
                </>
              )
            })()}
          </div>
        </div>,
        document.body
      )}

    </div>
  )
}
