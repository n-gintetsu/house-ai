import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'

// 物件種別ごとの入力フィールド定義
const PROPERTY_FIELDS = {
  '売土地': [
    { key: 'address', label: '所在地', required: true },
    { key: 'access', label: '交通・アクセス', required: true },
    { key: 'land_area', label: '土地面積（㎡）', type: 'number' },
    { key: 'land_category', label: '地目' },
    { key: 'use_zone', label: '用途地域' },
    { key: 'building_coverage', label: '建ぺい率（%）' },
    { key: 'floor_area_ratio', label: '容積率（%）' },
    { key: 'road_access', label: '接道状況' },
    { key: 'city_plan', label: '都市計画' },
    { key: 'delivery', label: '引渡' },
    { key: 'transaction_type', label: '取引態様' },
    { key: 'land_rights', label: '土地権利' },
    { key: 'topography', label: '地勢' },
    { key: 'land_share', label: '土地持分' },
    { key: 'private_road', label: '私道負担' },
    { key: 'national_land_law', label: '国土法' },
    { key: 'agricultural_law', label: '農地法' },
    { key: 'buried_cultural', label: '埋蔵文化財' },
    { key: 'soil_contamination', label: '土壌汚染' },
  ],
  '売一戸建': [
    { key: 'address', label: '所在地', required: true },
    { key: 'access', label: '交通・アクセス', required: true },
    { key: 'building_area', label: '建物面積（㎡）', type: 'number' },
    { key: 'land_area', label: '土地面積（㎡）', type: 'number' },
    { key: 'layout', label: '間取り' },
    { key: 'built_date', label: '築年月' },
    { key: 'structure', label: '構造' },
    { key: 'use_zone', label: '用途地域' },
    { key: 'building_coverage', label: '建ぺい率（%）' },
    { key: 'floor_area_ratio', label: '容積率（%）' },
    { key: 'delivery', label: '引渡' },
    { key: 'land_rights', label: '土地権利' },
    { key: 'road_access', label: '接道状況' },
    { key: 'parking', label: '駐車場' },
    { key: 'repair_fund', label: '修繕積立金' },
    { key: 'reform', label: 'リフォーム' },
    { key: 'current_status', label: '現況' },
    { key: 'transaction_type', label: '取引態様' },
  ],
  '売マンション': [
    { key: 'address', label: '所在地', required: true },
    { key: 'access', label: '交通・アクセス', required: true },
    { key: 'building_area', label: '専有面積（㎡）', type: 'number' },
    { key: 'balcony_area', label: 'バルコニー面積（㎡）', type: 'number' },
    { key: 'layout', label: '間取り' },
    { key: 'built_date', label: '築年月' },
    { key: 'structure', label: '構造' },
    { key: 'floor_info', label: '階数／所在階' },
    { key: 'repair_fund', label: '修繕積立金' },
    { key: 'delivery', label: '引渡' },
    { key: 'land_rights', label: '土地権利' },
    { key: 'total_units', label: '総戸数' },
    { key: 'management_type', label: '管理形態' },
    { key: 'management_company', label: '管理会社' },
    { key: 'parking', label: '駐車場' },
    { key: 'pet', label: 'ペット飼育' },
    { key: 'reform', label: 'リフォーム' },
    { key: 'current_status', label: '現況' },
    { key: 'transaction_type', label: '取引態様' },
  ],
  '売外全': [
    { key: 'address', label: '所在地', required: true },
    { key: 'access', label: '交通・アクセス', required: true },
    { key: 'building_area', label: '建物面積（㎡）', type: 'number' },
    { key: 'land_area', label: '土地面積（㎡）', type: 'number' },
    { key: 'use_zone', label: '用途地域' },
    { key: 'building_coverage', label: '建ぺい率（%）' },
    { key: 'floor_area_ratio', label: '容積率（%）' },
    { key: 'built_date', label: '築年月' },
    { key: 'structure', label: '構造' },
    { key: 'floors', label: '階数' },
    { key: 'delivery', label: '引渡' },
    { key: 'land_rights', label: '土地権利' },
    { key: 'road_access', label: '接道状況' },
    { key: 'parking', label: '駐車場' },
    { key: 'current_status', label: '現況' },
    { key: 'facilities', label: '設備' },
    { key: 'electric_capacity', label: '電気容量' },
    { key: 'gas', label: 'ガス' },
    { key: 'transaction_type', label: '取引態様' },
  ],
  '売外一': [
    { key: 'address', label: '所在地', required: true },
    { key: 'access', label: '交通・アクセス', required: true },
    { key: 'occupied_area', label: '占有面積（㎡）', type: 'number' },
    { key: 'floor_info', label: '所在階' },
    { key: 'use_zone', label: '用途地域' },
    { key: 'building_coverage', label: '建ぺい率（%）' },
    { key: 'floor_area_ratio', label: '容積率（%）' },
    { key: 'built_date', label: '築年月' },
    { key: 'structure', label: '構造' },
    { key: 'total_floors', label: '総階数' },
    { key: 'delivery', label: '引渡' },
    { key: 'land_rights', label: '土地権利' },
    { key: 'repair_fund', label: '修繕積立金' },
    { key: 'parking', label: '駐車場' },
    { key: 'current_status', label: '現況' },
    { key: 'facilities', label: '設備' },
    { key: 'electric_capacity', label: '電気容量' },
    { key: 'transaction_type', label: '取引態様' },
  ],
  '賃貸居住用': [
    { key: 'address', label: '所在地', required: true },
    { key: 'access', label: '交通・アクセス', required: true },
    { key: 'rent', label: '賃料（万円/月）', type: 'number', required: true },
    { key: 'deposit', label: '敷金' },
    { key: 'key_money', label: '礼金' },
    { key: 'layout', label: '間取り' },
    { key: 'building_area', label: '専有面積（㎡）', type: 'number' },
    { key: 'built_date', label: '築年月' },
    { key: 'structure', label: '構造' },
    { key: 'floor_info', label: '階数／所在階' },
    { key: 'contract_period', label: '契約期間' },
    { key: 'delivery', label: '引渡' },
    { key: 'parking', label: '駐車場' },
    { key: 'pet', label: 'ペット飼育' },
    { key: 'instrument', label: '楽器演奏' },
    { key: 'guarantor', label: '保証人' },
    { key: 'current_status', label: '現況' },
    { key: 'transaction_type', label: '取引態様' },
  ],
  '賃貸事業用': [
    { key: 'address', label: '所在地', required: true },
    { key: 'access', label: '交通・アクセス', required: true },
    { key: 'rent', label: '賃料（万円/月）', type: 'number', required: true },
    { key: 'deposit', label: '敷金' },
    { key: 'key_money', label: '礼金' },
    { key: 'occupied_area', label: '占有面積（㎡）', type: 'number' },
    { key: 'contract_type', label: '契約形態' },
    { key: 'built_date', label: '築年月' },
    { key: 'structure', label: '構造' },
    { key: 'floor_info', label: '階数／所在階' },
    { key: 'contract_period', label: '契約期間' },
    { key: 'delivery', label: '引渡' },
    { key: 'use_zone', label: '用途地域' },
    { key: 'parking', label: '駐車場' },
    { key: 'facilities', label: '設備' },
    { key: 'electric_capacity', label: '電気容量' },
    { key: 'current_status', label: '現況' },
    { key: 'transaction_type', label: '取引態様' },
  ],
  '賃貸土地': [
    { key: 'address', label: '所在地', required: true },
    { key: 'access', label: '交通・アクセス', required: true },
    { key: 'rent', label: '賃料（万円/月）', type: 'number', required: true },
    { key: 'land_area', label: '土地面積（㎡）', type: 'number' },
    { key: 'land_category', label: '地目' },
    { key: 'use_zone', label: '用途地域' },
    { key: 'building_coverage', label: '建ぺい率（%）' },
    { key: 'floor_area_ratio', label: '容積率（%）' },
    { key: 'contract_period', label: '契約期間' },
    { key: 'delivery', label: '引渡' },
    { key: 'transaction_type', label: '取引態様' },
  ],
  '賃貸一戸建': [
    { key: 'address', label: '所在地', required: true },
    { key: 'access', label: '交通・アクセス', required: true },
    { key: 'rent', label: '賃料（万円/月）', type: 'number', required: true },
    { key: 'deposit', label: '敷金' },
    { key: 'key_money', label: '礼金' },
    { key: 'layout', label: '間取り' },
    { key: 'building_area', label: '建物面積（㎡）', type: 'number' },
    { key: 'land_area', label: '土地面積（㎡）', type: 'number' },
    { key: 'built_date', label: '築年月' },
    { key: 'structure', label: '構造' },
    { key: 'contract_period', label: '契約期間' },
    { key: 'delivery', label: '引渡' },
    { key: 'parking', label: '駐車場' },
    { key: 'pet', label: 'ペット飼育' },
    { key: 'current_status', label: '現況' },
    { key: 'transaction_type', label: '取引態様' },
  ],
  '賃貸マンション': [
    { key: 'address', label: '所在地', required: true },
    { key: 'access', label: '交通・アクセス', required: true },
    { key: 'rent', label: '賃料（万円/月）', type: 'number', required: true },
    { key: 'deposit', label: '敷金' },
    { key: 'key_money', label: '礼金' },
    { key: 'layout', label: '間取り' },
    { key: 'building_area', label: '専有面積（㎡）', type: 'number' },
    { key: 'built_date', label: '築年月' },
    { key: 'structure', label: '構造' },
    { key: 'floor_info', label: '階数／所在階' },
    { key: 'contract_period', label: '契約期間' },
    { key: 'delivery', label: '引渡' },
    { key: 'parking', label: '駐車場' },
    { key: 'pet', label: 'ペット飼育' },
    { key: 'instrument', label: '楽器演奏' },
    { key: 'total_units', label: '総戸数' },
    { key: 'management_company', label: '管理会社' },
    { key: 'current_status', label: '現況' },
    { key: 'transaction_type', label: '取引態様' },
  ],
}

const SALE_TYPES = ['売土地', '売一戸建', '売マンション', '売外全', '売外一']
const RENT_TYPES = ['賃貸居住用', '賃貸事業用', '賃貸土地', '賃貸一戸建', '賃貸マンション']


function MultiImageUploader({ onUploaded, currentUrls = [] }) {
  const [uploading, setUploading] = useState(false)
  const [previews, setPreviews] = useState(currentUrls)
  const MAX = 20

  async function handleFiles(e) {
    const files = Array.from(e.target.files)
    if (!files.length) return
    if (previews.length + files.length > MAX) {
      alert('写真は最大' + MAX + '枚までです')
      return
    }
    setUploading(true)
    try {
      const newUrls = []
      for (const file of files) {
        const ext = file.name.split('.').pop()
        const fileName = 'agency_' + Date.now() + '_' + Math.random().toString(36).slice(2) + '.' + ext
        const { error } = await supabase.storage.from('property-images').upload(fileName, file, { upsert: true })
        if (error) throw error
        const { data } = supabase.storage.from('property-images').getPublicUrl(fileName)
        newUrls.push(data.publicUrl)
      }
      const updated = [...previews, ...newUrls]
      setPreviews(updated)
      onUploaded(updated)
    } catch (err) {
      alert('アップロードに失敗しました: ' + err.message)
    } finally {
      setUploading(false)
    }
  }

  function removeImage(idx) {
    const updated = previews.filter((_, i) => i !== idx)
    setPreviews(updated)
    onUploaded(updated)
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
        {previews.map((url, i) => (
          <div key={i} style={{ position: 'relative', width: 72, height: 54 }}>
            <img src={url} alt={'写真' + (i+1)} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 6 }} />
            <button onClick={() => removeImage(i)} style={{ position: 'absolute', top: -6, right: -6, background: '#dc2626', color: '#fff', border: 'none', borderRadius: '50%', width: 18, height: 18, fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>x</button>
            {i === 0 && <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(26,58,92,0.7)', color: '#fff', fontSize: 9, textAlign: 'center', borderRadius: '0 0 6px 6px' }}>メイン</div>}
          </div>
        ))}
        {previews.length < MAX && (
          <label style={{ width: 72, height: 54, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: uploading ? '#f1f5f9' : '#eef2f7', borderRadius: 6, border: '2px dashed #cbd5e1', cursor: uploading ? 'not-allowed' : 'pointer', fontSize: 10, color: '#64748b', gap: 2 }}>
            {uploading ? '...' : '+'}
            <span style={{ fontSize: 9 }}>{uploading ? 'UP中' : '追加'}</span>
            <input type="file" accept="image/*" multiple onChange={handleFiles} style={{ display: 'none' }} disabled={uploading} />
          </label>
        )}
      </div>
      <div style={{ fontSize: 11, color: '#999' }}>最大{MAX}枚・1枚目がメイン写真になります</div>
    </div>
  )
}

function ImageUploader({ onUploaded, currentUrl }) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(currentUrl || '')

  async function handleFile(e) {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    try {
      const ext = file.name.split('.').pop()
      const fileName = `agency_${Date.now()}.${ext}`
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
      {preview && <img src={preview} alt="プレビュー" style={{ width: '100%', maxHeight: 180, objectFit: 'contain', borderRadius: 8, marginBottom: 8, background: '#f0f4f8' }} />}
      <label style={{ display: 'inline-block', padding: '8px 16px', background: uploading ? '#94a3b8' : '#1a3a5c', color: '#fff', borderRadius: 8, cursor: uploading ? 'not-allowed' : 'pointer', fontSize: 13 }}>
        {uploading ? 'アップロード中...' : '📷 写真を選択'}
        <input type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} disabled={uploading} />
      </label>
      {preview && <span style={{ marginLeft: 8, fontSize: 12, color: '#16a34a' }}>✅ アップロード済み</span>}
    </div>
  )
}

export default function AgencyDashboard() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [screen, setScreen] = useState('menu') // menu | sale | rent | form | list | edit
  const [selectedType, setSelectedType] = useState('')
  const [dealCategory, setDealCategory] = useState('') // sale | rent
  const [myProperties, setMyProperties] = useState([])
  const [listLoading, setListLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitMsg, setSubmitMsg] = useState('')
  const [editingProperty, setEditingProperty] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [editMsg, setEditMsg] = useState('')
  const [cases, setCases] = useState([])
  const [casesLoading, setCasesLoading] = useState(false)
  const [currentPlan, setCurrentPlan] = useState(null)
  const [replyRate, setReplyRate] = useState(null)

  const initForm = () => ({
    title: '', catchcopy: '', price: '', image_url: '', image_urls: [], is_public: true,
    address: '', access: '', land_area: '', building_area: '', occupied_area: '',
    balcony_area: '', layout: '', built_date: '', structure: '', floor_info: '',
    floors: '', total_floors: '', total_units: '', use_zone: '', building_coverage: '',
    floor_area_ratio: '', land_category: '', road_access: '', city_plan: '',
    land_rights: '', topography: '', land_share: '', private_road: '',
    national_land_law: '', agricultural_law: '', buried_cultural: '', soil_contamination: '',
    management_fee: '', repair_fund: '', management_type: '', management_company: '',
    parking: '', pet: '', instrument: '', guarantor: '', rent: '', deposit: '',
    key_money: '', contract_period: '', contract_type: '', delivery: '',
    transaction_type: '', current_status: '', reform: '', facilities: '',
    electric_capacity: '', gas: '', remarks: '', deal_type: '', property_type_detail: '',
  })

  const [form, setForm] = useState(initForm())

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user || null)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function loadMyProperties() {
    if (!user) return
    setListLoading(true)
    const { data } = await supabase
      .from('agency_properties')
      .select('*')
      .eq('agency_user_id', user.id)
      .order('created_at', { ascending: false })
    setMyProperties(data || [])
    setListLoading(false)
  }

  async function fetchCases() {
    setCasesLoading(true)
    const { data } = await supabase
      .from('case_distributions')
      .select('*')
      .eq('agency_email', user?.email)
      .order('created_at', { ascending: false })
      .limit(20)
    setCases(data || [])
    setCasesLoading(false)
  }

  async function fetchCurrentPlan() {
    if (!user?.email) return
    const { data } = await supabase
      .from('agency_registrations')
      .select('plan')
      .eq('email', user.email)
      .single()
    setCurrentPlan(data?.plan || 'free')
  }

  async function fetchReplyRate() {
    if (!user?.email) return
    const { data } = await supabase
      .from('case_distributions')
      .select('status')
      .eq('agency_email', user.email)
    if (!data || data.length === 0) { setReplyRate(0); return }
    const total = data.length
    const read = data.filter(r => r.status === 'read').length
    setReplyRate(Math.round(read / total * 100))
  }

  useEffect(() => {
    if (user) { fetchCurrentPlan(); fetchReplyRate() }
  }, [user])

  useEffect(() => {
    if (screen === 'inquiries') fetchCases()
  }, [screen])

  async function handleSubmit() {
    if (!form.title.trim() || !form.address.trim()) {
      alert('物件名と所在地は必須です')
      return
    }
    setSubmitting(true)
    setSubmitMsg('')
    const payload = {
      agency_user_id: user.id,
      agency_email: user.email,
      property_type_detail: selectedType,
      deal_category: dealCategory,
      title: form.title,
      catchcopy: form.catchcopy || null,
      price: form.price ? parseFloat(form.price) * 10000 : null,
      rent: form.rent ? parseFloat(form.rent) * 10000 : null,
      image_url: form.image_url || null,
      image_urls: form.image_urls || (form.image_url ? [form.image_url] : []),
      is_public: form.is_public,
      status: 'active',
      details: JSON.stringify(
        Object.fromEntries(
          Object.keys(form).filter(k => !['title','catchcopy','price','rent','image_url','is_public','deal_type','property_type_detail'].includes(k))
            .map(k => [k, form[k]])
        )
      ),
    }
    const { error } = await supabase.from('agency_properties').insert(payload)
    if (error) {
      setSubmitMsg('❌ エラー: ' + error.message)
    } else {
      setSubmitMsg('✅ 物件を登録しました！')
      setForm(initForm())
      setTimeout(() => { setScreen('list'); loadMyProperties() }, 1500)
    }
    setSubmitting(false)
  }

  async function togglePublic(id, current) {
    await supabase.from('agency_properties').update({ is_public: !current }).eq('id', id)
    setMyProperties(list => list.map(p => p.id === id ? { ...p, is_public: !current } : p))
  }

  async function deleteProperty(id) {
    if (!window.confirm('この物件を削除しますか？')) return
    await supabase.from('agency_properties').delete().eq('id', id)
    setMyProperties(list => list.filter(p => p.id !== id))
  }

  const fieldStyle = { width: '100%', boxSizing: 'border-box', padding: '9px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 13, outline: 'none', fontFamily: 'inherit', background: '#fff' }
  const labelStyle = { display: 'block', fontSize: 11, color: '#666', marginBottom: 3, fontWeight: 600 }

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#777' }}>読み込み中...</div>

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', background: '#eef2f7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
        <div style={{ background: '#fff', borderRadius: 16, padding: 40, width: 360, boxShadow: '0 4px 24px rgba(0,0,0,0.1)', textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🏢</div>
          <h2 style={{ color: '#1a3a5c', marginBottom: 4, fontSize: 20 }}>業者様専用ダッシュボード</h2>
          <p style={{ color: '#777', fontSize: 13, marginBottom: 24 }}>ログインしてご利用ください</p>
          <p style={{ color: '#555', fontSize: 12, background: '#f8fafc', borderRadius: 8, padding: 12 }}>
            ※ 管理画面で承認されたアカウントのみログイン可能です。<br />
            アカウントをお持ちでない方は「業者様向け」タブよりお申込みください。
          </p>
          <button
            onClick={() => window.location.href = '/'}
            style={{ marginTop: 20, padding: '10px 24px', background: '#1a3a5c', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, cursor: 'pointer', fontWeight: 700 }}
          >
            サイトトップに戻る
          </button>
        </div>
      </div>
    )
  }

  const fields = selectedType ? (PROPERTY_FIELDS[selectedType] || []) : []

  return (
    <div style={{ minHeight: '100vh', background: '#eef2f7', fontFamily: 'sans-serif' }}>
      {/* ヘッダー */}
      <div style={{ background: '#1a3a5c', color: '#fff', padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 16 }}>🏢 業者様専用ダッシュボード</div>
          <div style={{ fontSize: 11, opacity: 0.7, marginTop: 2 }}>{user.email}</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => { setScreen('list'); loadMyProperties() }} style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: 'none', borderRadius: 8, padding: '7px 14px', cursor: 'pointer', fontSize: 12 }}>
            📋 自社物件一覧
          </button>
          <button onClick={() => setScreen('menu')} style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: 'none', borderRadius: 8, padding: '7px 14px', cursor: 'pointer', fontSize: 12 }}>
            🏠 メニュー
          </button>
          <button onClick={() => supabase.auth.signOut()} style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 8, padding: '7px 14px', cursor: 'pointer', fontSize: 12 }}>
            ログアウト
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>

        {/* メインメニュー */}
        {screen === 'menu' && (
          <div>
            <h2 style={{ color: '#1a3a5c', marginBottom: 16, fontSize: 20 }}>物件管理メニュー</h2>
            {/* AI評価カード */}
            <div style={{ background: 'linear-gradient(135deg, #1a3a5c 0%, #0f2540 100%)', borderRadius: 12, padding: 24, marginBottom: 24, color: '#fff' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <div style={{ fontSize: 15, fontWeight: 800 }}>🤖 AI評価</div>
                {replyRate >= 80 && (
                  <span style={{ background: '#1a3a5c', color: '#c9a84c', border: '1.5px solid #c9a84c', borderRadius: 20, padding: '2px 12px', fontSize: 11, fontWeight: 800 }}>🤖 AI推薦中</span>
                )}
              </div>
              <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
                {[
                  { label: '表示順位', value: replyRate === null ? '—' : replyRate >= 60 ? '高' : replyRate >= 30 ? '中' : '低' },
                  { label: '返信速度', value: 'やや遅い' },
                  { label: '返信率', value: replyRate !== null ? `${replyRate}%` : '—' },
                ].map(item => (
                  <div key={item.label} style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 14px', flex: '1 1 auto', textAlign: 'center' }}>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginBottom: 4 }}>{item.label}</div>
                    <div style={{ fontSize: 16, fontWeight: 800 }}>{item.value}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginBottom: 16 }}>
                {[
                  (replyRate === null || replyRate < 80) ? '返信率を上げるとAI推薦対象になります' : null,
                  'プロフィールを充実させると相談が増えます',
                ].filter(Boolean).map(tip => (
                  <div key={tip} style={{ fontSize: 12, color: '#c9a84c', marginBottom: 4 }}>・{tip}</div>
                ))}
              </div>
              <button onClick={() => setScreen('plan')} style={{ background: '#c9a84c', color: '#1a3a5c', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 13, fontWeight: 800, cursor: 'pointer' }}>
                もっと案件を増やす →
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
              {[
                { icon: '🏷️', label: '売買物件管理', sub: '登録・変更・成約・削除', action: () => { setDealCategory('sale'); setScreen('sale') } },
                { icon: '🏠', label: '賃貸物件管理', sub: '登録・変更・成約・削除', action: () => { setDealCategory('rent'); setScreen('rent') } },
                { icon: '📋', label: '自社登録物件一覧', sub: '登録済み物件を確認', action: () => { setScreen('list'); loadMyProperties() } },
                { icon: '📬', label: '反響管理', sub: '問い合わせ・AI相談・お気に入り状況を確認', action: () => setScreen('inquiries') },
                { icon: '💰', label: 'プラン管理', sub: '掲載数や表示順位を強化', action: () => setScreen('plan') },
              ].map(item => (
                <div key={item.label} onClick={item.action} style={{ background: '#fff', borderRadius: 14, padding: 24, textAlign: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', transition: 'transform 0.1s', border: '2px solid transparent' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = '#1a3a5c'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}
                >
                  <div style={{ fontSize: 36, marginBottom: 12 }}>{item.icon}</div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: '#1a3a5c', marginBottom: 4 }}>{item.label}</div>
                  <div style={{ fontSize: 12, color: '#777' }}>{item.sub}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 売買物件種別選択 */}
        {screen === 'sale' && (
          <div>
            <button onClick={() => setScreen('menu')} style={{ marginBottom: 16, background: 'none', border: 'none', color: '#1a3a5c', cursor: 'pointer', fontSize: 13 }}>← メニューに戻る</button>
            <h2 style={{ color: '#1a3a5c', marginBottom: 6, fontSize: 20 }}>売買物件管理</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 20 }}>
              {[
                { label: '物件登録', icon: '➕', desc: '新規に売買物件を登録します', action: 'register' },
                { label: '自社物件一覧', icon: '📋', desc: '登録済みの売買物件を確認', action: 'list' },
              ].map(item => (
                <div key={item.label} onClick={() => {
                  if (item.action === 'register') setScreen('type_select_sale')
                  else { setScreen('list'); loadMyProperties() }
                }} style={{ background: '#fff', borderRadius: 12, padding: 20, cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: 16, border: '2px solid transparent' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = '#1a3a5c'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}
                >
                  <div style={{ fontSize: 28 }}>{item.icon}</div>
                  <div>
                    <div style={{ fontWeight: 700, color: '#1a3a5c', fontSize: 15 }}>{item.label}</div>
                    <div style={{ fontSize: 12, color: '#777', marginTop: 2 }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 賃貸物件種別選択 */}
        {screen === 'rent' && (
          <div>
            <button onClick={() => setScreen('menu')} style={{ marginBottom: 16, background: 'none', border: 'none', color: '#1a3a5c', cursor: 'pointer', fontSize: 13 }}>← メニューに戻る</button>
            <h2 style={{ color: '#1a3a5c', marginBottom: 6, fontSize: 20 }}>賃貸物件管理</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 20 }}>
              {[
                { label: '物件登録', icon: '➕', desc: '新規に賃貸物件を登録します', action: 'register' },
                { label: '自社物件一覧', icon: '📋', desc: '登録済みの賃貸物件を確認', action: 'list' },
              ].map(item => (
                <div key={item.label} onClick={() => {
                  if (item.action === 'register') setScreen('type_select_rent')
                  else { setScreen('list'); loadMyProperties() }
                }} style={{ background: '#fff', borderRadius: 12, padding: 20, cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: 16, border: '2px solid transparent' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = '#1a3a5c'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}
                >
                  <div style={{ fontSize: 28 }}>{item.icon}</div>
                  <div>
                    <div style={{ fontWeight: 700, color: '#1a3a5c', fontSize: 15 }}>{item.label}</div>
                    <div style={{ fontSize: 12, color: '#777', marginTop: 2 }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 売買物件種別選択 */}
        {screen === 'type_select_sale' && (
          <div>
            <button onClick={() => setScreen('sale')} style={{ marginBottom: 16, background: 'none', border: 'none', color: '#1a3a5c', cursor: 'pointer', fontSize: 13 }}>← 売買管理に戻る</button>
            <h2 style={{ color: '#1a3a5c', marginBottom: 20, fontSize: 18 }}>物件種別を選択してください</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {SALE_TYPES.map(type => (
                <div key={type} onClick={() => { setSelectedType(type); setDealCategory('sale'); setForm(initForm()); setScreen('form'); setSubmitMsg('') }}
                  style={{ background: '#fff', borderRadius: 12, padding: '18px 20px', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', fontWeight: 700, color: '#1a3a5c', fontSize: 15, border: '2px solid transparent', display: 'flex', alignItems: 'center', gap: 10 }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = '#1a3a5c'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}
                >
                  <span style={{ fontSize: 24 }}>🏷️</span> {type}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 賃貸物件種別選択 */}
        {screen === 'type_select_rent' && (
          <div>
            <button onClick={() => setScreen('rent')} style={{ marginBottom: 16, background: 'none', border: 'none', color: '#1a3a5c', cursor: 'pointer', fontSize: 13 }}>← 賃貸管理に戻る</button>
            <h2 style={{ color: '#1a3a5c', marginBottom: 20, fontSize: 18 }}>物件種別を選択してください</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {RENT_TYPES.map(type => (
                <div key={type} onClick={() => { setSelectedType(type); setDealCategory('rent'); setForm(initForm()); setScreen('form'); setSubmitMsg('') }}
                  style={{ background: '#fff', borderRadius: 12, padding: '18px 20px', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', fontWeight: 700, color: '#1a3a5c', fontSize: 15, border: '2px solid transparent', display: 'flex', alignItems: 'center', gap: 10 }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = '#1a3a5c'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}
                >
                  <span style={{ fontSize: 24 }}>🏠</span> {type}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 物件登録フォーム */}
        {screen === 'form' && (
          <div>
            <button onClick={() => setScreen(dealCategory === 'sale' ? 'type_select_sale' : 'type_select_rent')} style={{ marginBottom: 16, background: 'none', border: 'none', color: '#1a3a5c', cursor: 'pointer', fontSize: 13 }}>← 種別選択に戻る</button>
            <h2 style={{ color: '#1a3a5c', marginBottom: 4, fontSize: 20 }}>物件登録（{selectedType}）</h2>
            <p style={{ color: '#777', fontSize: 12, marginBottom: 20 }}>※ 必須項目（*）は必ず入力してください</p>

            <div style={{ background: '#fff', borderRadius: 14, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: 16 }}>
              <h3 style={{ color: '#1a3a5c', fontSize: 15, marginBottom: 16, borderBottom: '2px solid #eef2f7', paddingBottom: 8 }}>■ 基本情報</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>物件名 *</label>
                  <input style={fieldStyle} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="例：さいたま市大宮区 売土地 100㎡" />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>キャッチコピー</label>
                  <input style={fieldStyle} value={form.catchcopy} onChange={e => setForm(f => ({ ...f, catchcopy: e.target.value }))} placeholder="例：駅徒歩5分！整形地です" />
                </div>
                {dealCategory === 'sale' ? (
                  <div>
                    <label style={labelStyle}>価格（万円）</label>
                    <input style={fieldStyle} type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="例：3000" />
                  </div>
                ) : (
                  <div>
                    <label style={labelStyle}>賃料（万円/月） *</label>
                    <input style={fieldStyle} type="number" value={form.rent} onChange={e => setForm(f => ({ ...f, rent: e.target.value }))} placeholder="例：8" />
                  </div>
                )}
                <div>
                  <label style={labelStyle}>公開設定</label>
                  <select style={fieldStyle} value={form.is_public ? 'true' : 'false'} onChange={e => setForm(f => ({ ...f, is_public: e.target.value === 'true' }))}>
                    <option value="true">🌐 公開（サイトに表示）</option>
                    <option value="false">🔒 非公開（自社のみ）</option>
                  </select>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>物件写真</label>
                  <MultiImageUploader
                    onUploaded={urls => setForm(f => ({ ...f, image_url: urls[0] || '', image_urls: urls }))}
                    currentUrls={form.image_urls || (form.image_url ? [form.image_url] : [])}
                  />
                </div>
              </div>
            </div>

            <div style={{ background: '#fff', borderRadius: 14, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: 16 }}>
              <h3 style={{ color: '#1a3a5c', fontSize: 15, marginBottom: 16, borderBottom: '2px solid #eef2f7', paddingBottom: 8 }}>■ 物件詳細</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {fields.map(f => (
                  <div key={f.key} style={{ gridColumn: f.type === 'textarea' ? '1 / -1' : undefined }}>
                    <label style={labelStyle}>{f.label}{f.required ? ' *' : ''}</label>
                    {f.type === 'textarea' ? (
                      <textarea style={{ ...fieldStyle, minHeight: 80, resize: 'vertical' }} value={form[f.key] || ''} onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))} />
                    ) : (
                      <input style={fieldStyle} type={f.type || 'text'} value={form[f.key] || ''} onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {submitMsg && (
              <div style={{ padding: '12px 16px', borderRadius: 10, background: submitMsg.includes('✅') ? '#dcfce7' : '#fee2e2', color: submitMsg.includes('✅') ? '#16a34a' : '#dc2626', fontSize: 13, marginBottom: 16 }}>
                {submitMsg}
              </div>
            )}

            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={handleSubmit} disabled={submitting} style={{ padding: '12px 32px', background: '#1a3a5c', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1 }}>
                {submitting ? '登録中...' : '✅ 登録する'}
              </button>
              <button onClick={() => setForm(initForm())} style={{ padding: '12px 20px', background: 'transparent', color: '#777', border: '1px solid #ddd', borderRadius: 10, fontSize: 13, cursor: 'pointer' }}>
                リセット
              </button>
            </div>
          </div>
        )}

        {screen === 'inquiries' && (
          <div style={{ padding: '0 0 40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <button onClick={() => setScreen('menu')} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' }}>←</button>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1a3a5c', margin: 0 }}>📬 反響管理</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 24 }}>
              {[
                { label: '問い合わせ', value: 3, unit: '件', color: '#3b82f6' },
                { label: 'AI相談', value: 7, unit: '件', color: '#8b5cf6' },
                { label: 'お気に入り', value: 12, unit: '件', color: '#ec4899' },
                { label: '閲覧数', value: 89, unit: 'PV', color: '#10b981' },
              ].map(item => (
                <div key={item.label} style={{ background: 'white', borderRadius: 12, padding: '16px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderTop: `4px solid ${item.color}`, textAlign: 'center' }}>
                  <p style={{ margin: '0 0 8px', fontSize: 12, color: '#64748b' }}>{item.label}</p>
                  <p style={{ margin: 0, fontSize: 28, fontWeight: 800, color: item.color }}>{item.value}<span style={{ fontSize: 14, fontWeight: 400 }}>{item.unit}</span></p>
                </div>
              ))}
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: '#1a3a5c', margin: '24px 0 12px' }}>📬 新着案件</h3>
            {casesLoading ? (
              <p style={{ color: '#64748b' }}>読み込み中...</p>
            ) : cases.length === 0 ? (
              <div style={{ background: 'white', borderRadius: 12, padding: 24, textAlign: 'center', color: '#64748b', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <p style={{ fontSize: 32, margin: '0 0 8px' }}>📭</p>
                <p style={{ fontSize: 14, fontWeight: 700 }}>まだ案件はありません</p>
                <p style={{ fontSize: 12 }}>ユーザーがAI相談をすると自動で届きます</p>
              </div>
            ) : (
              cases.map((c, i) => (
                <div key={c.id} style={{ background: i < 3 ? 'white' : undefined, filter: i >= 3 ? 'blur(3px)' : 'none', pointerEvents: i >= 3 ? 'none' : 'auto', borderRadius: 12, padding: '16px 20px', marginBottom: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', position: 'relative' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                    <div>
                      <div style={{ display: 'flex', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                        <span style={{ background: '#1a3a5c', color: 'white', borderRadius: 4, padding: '2px 8px', fontSize: 11, fontWeight: 700 }}>{c.category}</span>
                        {c.is_boosted && <span style={{ background: '#10b981', color: 'white', borderRadius: 4, padding: '2px 8px', fontSize: 11, fontWeight: 700 }}>🚀 優先</span>}
                        {c.competitor_count > 0 && <span style={{ background: '#fff8f0', color: '#92400e', border: '1px solid #f59e0b', borderRadius: 4, padding: '2px 8px', fontSize: 11, fontWeight: 700 }}>他{c.competitor_count}社にも送信</span>}
                      </div>
                      <p style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 600, color: '#1e293b' }}>{c.summary || '相談内容あり'}</p>
                      <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>📍 {c.area || '未指定'} · {new Date(c.created_at).toLocaleString('ja-JP')}</p>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <span style={{ background: c.status === 'new' ? '#fee2e2' : '#f1f5f9', color: c.status === 'new' ? '#991b1b' : '#64748b', borderRadius: 4, padding: '4px 10px', fontSize: 11, fontWeight: 700 }}>{c.status === 'new' ? '新着' : '確認済'}</span>
                      <button style={{ background: '#1a3a5c', color: 'white', border: 'none', borderRadius: 8, padding: '6px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>対応する</button>
                    </div>
                  </div>
                </div>
              ))
            )}
            {cases.length >= 3 && (
              <div style={{ background: 'white', borderRadius: 12, padding: '16px 24px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginTop: 8 }}>
                <p style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 700, color: '#1a3a5c' }}>さらに{cases.length - 3}件の案件があります</p>
                <button onClick={() => setScreen('plan')} style={{ background: '#c9a84c', border: 'none', borderRadius: 8, padding: '10px 24px', color: '#1a3a5c', fontSize: 13, fontWeight: 800, cursor: 'pointer' }}>スタンダードで全て閲覧 →</button>
              </div>
            )}
          </div>
        )}

        {screen === 'plan' && (
          <div style={{ padding: '0 0 40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <button onClick={() => setScreen('menu')} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' }}>←</button>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1a3a5c', margin: 0 }}>💰 プラン管理</h2>
            </div>
            {(() => {
              const planLabel = currentPlan === 'premium' ? 'プレミアムプラン' : currentPlan === 'standard' ? 'スタンダードプラン' : 'フリープラン'
              const planSub = currentPlan === 'premium' ? '優先表示・特集掲載・詳細分析' : currentPlan === 'standard' ? '物件掲載20件・反響通知・DM機能' : '物件掲載3件まで・基本機能のみ'
              const planBadge = currentPlan === 'premium' ? '29,800円/月' : currentPlan === 'standard' ? '9,800円/月' : '無料'
              const badgeBg = currentPlan === 'premium' ? '#1a3a5c' : currentPlan === 'standard' ? '#e8f0fe' : '#f1f5f9'
              const badgeColor = currentPlan === 'premium' ? '#c9a84c' : currentPlan === 'standard' ? '#1a3a5c' : '#64748b'
              return (
                <div style={{ background: 'white', borderRadius: 12, padding: '16px 20px', marginBottom: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>現在のプラン</p>
                    <p style={{ margin: '4px 0 0', fontSize: 20, fontWeight: 800, color: '#1a3a5c' }}>{planLabel}</p>
                    <p style={{ margin: '4px 0 0', fontSize: 12, color: '#94a3b8' }}>{planSub}</p>
                  </div>
                  <span style={{ background: badgeBg, color: badgeColor, borderRadius: 20, padding: '4px 12px', fontSize: 12, fontWeight: 700 }}>{planBadge}</span>
                </div>
              )
            })()}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
              {[
                { name: 'スタンダード', price: '9,800円/月', color: '#1a3a5c', bg: 'white', border: '2px solid #c9a84c', features: ['掲載数増加（20件）', '反響通知', 'DM機能', 'AI推薦対象', '検索優先表示'], cta: 'アップグレードする', ctaBg: '#1a3a5c', ctaColor: 'white' },
                { name: 'プレミアム', price: '29,800円/月', color: 'white', bg: '#1a3a5c', border: 'none', features: ['優先表示', '特集掲載', 'トップ掲載', '詳細分析', '一括査定案件優先参加'], cta: 'プレミアムを見る', ctaBg: '#c9a84c', ctaColor: '#1a3a5c' },
              ].map(plan => (
                <div key={plan.name} style={{ background: plan.bg, border: plan.border, borderRadius: 16, padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
                  <p style={{ margin: '0 0 4px', fontSize: 18, fontWeight: 800, color: plan.color === 'white' ? 'white' : '#1a3a5c' }}>{plan.name}</p>
                  <p style={{ margin: '0 0 16px', fontSize: 24, fontWeight: 800, color: '#c9a84c' }}>{plan.price}</p>
                  {plan.features.map(f => (
                    <p key={f} style={{ margin: '4px 0', fontSize: 13, color: plan.color === 'white' ? 'rgba(255,255,255,0.8)' : '#64748b' }}>✅ {f}</p>
                  ))}
                  <button style={{ width: '100%', marginTop: 16, background: plan.ctaBg, color: plan.ctaColor, border: 'none', borderRadius: 10, padding: '12px', fontSize: 14, fontWeight: 800, cursor: 'pointer' }}>{plan.cta}</button>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 16, background: '#fff8f0', border: '1px solid #f59e0b', borderRadius: 10, padding: '12px 16px' }}>
              <p style={{ margin: 0, fontSize: 12, color: '#92400e' }}>💡 詳細情報（宅建業免許・対応エリア・取扱種別）を入力するとAI推薦・優先表示が強化されます</p>
            </div>
          </div>
        )}

        {/* 自社物件一覧 */}
        {screen === 'list' && (
          <div>
            <button onClick={() => setScreen('menu')} style={{ marginBottom: 16, background: 'none', border: 'none', color: '#1a3a5c', cursor: 'pointer', fontSize: 13 }}>← メニューに戻る</button>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ color: '#1a3a5c', fontSize: 20, margin: 0 }}>📋 自社登録物件一覧（{myProperties.length}件）</h2>
              <button onClick={loadMyProperties} style={{ background: '#1a3a5c', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 12, cursor: 'pointer' }}>🔄 更新</button>
            </div>

            {listLoading ? (
              <div style={{ textAlign: 'center', padding: 40, color: '#777' }}>読み込み中...</div>
            ) : myProperties.length === 0 ? (
              <div style={{ background: '#fff', borderRadius: 14, padding: 40, textAlign: 'center', color: '#777' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
                <p>登録済みの物件はありません</p>
                <button onClick={() => setScreen('menu')} style={{ marginTop: 12, padding: '10px 24px', background: '#1a3a5c', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, cursor: 'pointer', fontWeight: 700 }}>
                  物件を登録する
                </button>
              </div>
            ) : (
              myProperties.map(p => (
                <div key={p.id} style={{ background: '#fff', borderRadius: 14, padding: 16, marginBottom: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                  <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                    {p.image_url && <img src={p.image_url} alt={p.title} style={{ width: 100, height: 70, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }} />}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                        <span style={{ fontWeight: 700, fontSize: 15, color: '#1a3a5c' }}>{p.title}</span>
                        <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 999, background: '#dbeafe', color: '#1e40af', fontWeight: 700 }}>{p.property_type_detail}</span>
                        <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 999, background: p.is_public ? '#dcfce7' : '#f1f5f9', color: p.is_public ? '#16a34a' : '#94a3b8', fontWeight: 700 }}>
                          {p.is_public ? '🌐 公開中' : '🔒 非公開'}
                        </span>
                      </div>
                      {p.price && <div style={{ fontSize: 13, fontWeight: 700, color: '#1a3a5c' }}>売買価格 {(p.price / 10000).toLocaleString()}万円</div>}
                      {p.rent && <div style={{ fontSize: 13, fontWeight: 700, color: '#1a3a5c' }}>賃料 {(p.rent / 10000).toLocaleString()}万円/月</div>}
                      <div style={{ fontSize: 11, color: '#aaa', marginTop: 4 }}>{p.created_at ? new Date(p.created_at).toLocaleString('ja-JP') : ''}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexShrink: 0, flexDirection: 'column', alignItems: 'flex-end' }}>
                      <button onClick={() => togglePublic(p.id, p.is_public)} style={{ padding: '5px 12px', background: p.is_public ? '#f59e0b' : '#1a3a5c', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, cursor: 'pointer' }}>
                        {p.is_public ? '非公開にする' : '公開する'}
                      </button>
                      <button onClick={() => { setEditingProperty(p); setEditForm(Object.assign({}, p)); setScreen('edit'); setEditMsg('') }} style={{ padding: '5px 12px', background: '#0ea5e9', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, cursor: 'pointer' }}>✏️ 編集</button>
                      <button onClick={() => deleteProperty(p.id)} style={{ padding: '5px 12px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, cursor: 'pointer' }}>削除</button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

        {/* 物件編集フォーム */}
        {screen === 'edit' && editingProperty && (
          <div>
            <button onClick={() => setScreen('list')} style={{ marginBottom: 16, background: 'none', border: 'none', color: '#1a3a5c', cursor: 'pointer', fontSize: 13 }}>← 物件一覧に戻る</button>
            <h2 style={{ color: '#1a3a5c', fontSize: 20, marginBottom: 20 }}>✏️ 物件編集：{editingProperty.title}</h2>
            <div style={{ background: '#fff', borderRadius: 14, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              {[
                { key: 'title', label: '物件名 *', type: 'text' },
                { key: 'catchcopy', label: 'キャッチコピー', type: 'text' },
                { key: 'price', label: '売買価格（円）', type: 'number' },
                { key: 'rent', label: '賃料（円/月）', type: 'number' },
                    ].map(function(field) {
                return (
                  <div key={field.key} style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#1a3a5c', marginBottom: 4 }}>{field.label}</label>
                    {field.type === 'textarea' ? (
                      <textarea value={editForm[field.key] || ''} onChange={function(e) { var v = e.target.value; setEditForm(function(f) { return Object.assign({}, f, { [field.key]: v }) }) }} rows={3} style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13, boxSizing: 'border-box', resize: 'vertical' }} />
                    ) : (
                      <input type={field.type} value={editForm[field.key] || ''} onChange={function(e) { var v = e.target.value; setEditForm(function(f) { return Object.assign({}, f, { [field.key]: v }) }) }} style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13, boxSizing: 'border-box' }} />
                    )}
                  </div>
                )
              })}
              {editMsg && (
                <div style={{ padding: '10px 16px', borderRadius: 8, background: editMsg.startsWith('✅') ? '#dcfce7' : '#fee2e2', color: editMsg.startsWith('✅') ? '#16a34a' : '#dc2626', marginBottom: 16, fontSize: 13 }}>{editMsg}</div>
              )}
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button onClick={function() { setScreen('list') }} style={{ padding: '10px 24px', background: '#f1f5f9', color: '#555', border: 'none', borderRadius: 8, fontSize: 13, cursor: 'pointer' }}>キャンセル</button>
                <button onClick={async function() {
                  if (!editForm.title) { setEditMsg('❌ 物件名は必須です'); return }
                  var result = await supabase.from('agency_properties').update({ title: editForm.title, catchcopy: editForm.catchcopy || '', price: editForm.price ? Number(editForm.price) : null, rent: editForm.rent ? Number(editForm.rent) : null }).eq('id', editingProperty.id)
                  if (result.error) { setEditMsg('❌ 更新失敗: ' + result.error.message); return }
                  setEditMsg('✅ 更新しました！')
                  await loadMyProperties()
                }} style={{ padding: '10px 24px', background: '#1a3a5c', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, cursor: 'pointer', fontWeight: 700 }}>💾 保存する</button>
              </div>
            </div>
          </div>
        )}
    </div>
  )
}
