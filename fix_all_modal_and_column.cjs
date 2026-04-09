const fs = require('fs')
const path = require('path')

// ===== 1. PropertyMatching.jsx を完全書き直し =====
const pmPath = path.join(__dirname, 'src', 'PropertyMatching.jsx')

const pmContent = `import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'

const LAYOUTS = ['1R/1K', '1LDK', '2LDK', '3LDK', '4LDK以上', 'こだわらない']
const PROPERTY_TYPES = ['マンション', '一戸建て', 'アパート', '土地', 'こだわらない']

export default function PropertyMatching({ user }) {
  const [properties, setProperties] = useState([])
  const [favorites, setFavorites] = useState([])
  const [activeTab, setActiveTab] = useState('matching')
  const [selectedProperty, setSelectedProperty] = useState(null)
  const [conditions, setConditions] = useState({
    area: '', dealType: '', maxRent: '', maxPrice: '', layout: '', propertyType: '', other: '',
  })
  const [aiResult, setAiResult] = useState('')
  const [matched, setMatched] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  useEffect(() => { loadProperties(); loadFavorites() }, [user])

  useEffect(() => {
    if (selectedProperty) { document.body.style.overflow = 'hidden' }
    else { document.body.style.overflow = '' }
    return () => { document.body.style.overflow = '' }
  }, [selectedProperty])

  async function loadProperties() {
    const { data: adminProps } = await supabase
      .from('properties').select('*').eq('status', 'active').order('created_at', { ascending: false })
    const { data: agencyProps } = await supabase
      .from('agency_properties').select('*').eq('status', 'active').eq('is_public', true)
      .order('created_at', { ascending: false })
    const normalizedAgency = (agencyProps || []).map(p => {
      let details = {}
      try { details = p.details ? (typeof p.details === 'string' ? JSON.parse(p.details) : p.details) : {} } catch(e) {}
      return {
        id: 'agency_' + p.id, title: p.title, address: details.address || '',
        access: details.access || '', property_type: p.property_type_detail || '',
        deal_type: p.deal_category === 'sale' ? 'sale' : 'rent',
        price: p.price || null, rent: p.rent || null, image_url: p.image_url || null,
        description: p.catchcopy || '', layout: details.layout || '',
        area: details.building_area || details.land_area || null,
        built_date: details.built_date || null, structure: details.structure || null,
        floor_info: details.floor_info || null, management_fee: details.management_fee || null,
        repair_fund: details.repair_fund || null, parking: details.parking || null,
        delivery: details.delivery || null, transaction_type: details.transaction_type || null,
        land_rights: details.land_rights || null, use_zone: details.use_zone || null,
        remarks: details.remarks || null, current_status: details.current_status || null,
        deposit: details.deposit || null, key_money: details.key_money || null,
        contract_period: details.contract_period || null,
        status: 'active', is_agency: true, is_public: p.is_public,
      }
    })
    setProperties([...(adminProps || []), ...normalizedAgency])
  }

  async function loadFavorites() {
    if (!user) return
    const { data } = await supabase.from('favorites').select('*').eq('user_id', user.id)
    setFavorites((data || []).map(f => f.property_id))
  }

  async function toggleFavorite(propertyId, e) {
    if (e) e.stopPropagation()
    if (!user) { alert('お気に入り登録にはログインが必要です'); return }
    if (favorites.includes(propertyId)) {
      await supabase.from('favorites').delete().eq('user_id', user.id).eq('property_id', propertyId)
      setFavorites(f => f.filter(id => id !== propertyId))
    } else {
      await supabase.from('favorites').insert({ user_id: user.id, property_id: propertyId })
      setFavorites(f => [...f, propertyId])
    }
  }

  async function handleSearch() {
    if (!conditions.area.trim()) { alert('エリアを入力してください'); return }
    setLoading(true); setSearched(true); setAiResult(''); setMatched([])
    try {
      let query = supabase.from('properties').select('*').eq('status', 'active')
      if (conditions.dealType) query = query.eq('deal_type', conditions.dealType)
      if (conditions.layout && conditions.layout !== 'こだわらない') query = query.eq('layout', conditions.layout)
      if (conditions.propertyType && conditions.propertyType !== 'こだわらない') query = query.eq('property_type', conditions.propertyType)
      if (conditions.maxRent) query = query.lte('rent', parseInt(conditions.maxRent) * 10000)
      if (conditions.maxPrice) query = query.lte('price', parseInt(conditions.maxPrice) * 10000)
      const { data: matchedProps } = await query.limit(6)
      setMatched(matchedProps || [])
      const propertyList = (matchedProps || []).length > 0
        ? (matchedProps || []).map((p, i) => \`物件\${i+1}: \${p.title} / \${p.address} / \${p.layout} / \${p.property_type} / \${p.rent ? '賃料'+Math.round(p.rent/10000)+'万円/月' : ''}\${p.price ? '価格'+Math.round(p.price/10000)+'万円' : ''}\`).join('\\n')
        : '現在条件に合う物件はありません'
      const prompt = \`以下のお客様の希望条件と物件情報をもとに、親切で具体的なアドバイスをしてください。
お客様の希望条件: エリア: \${conditions.area}
\${conditions.maxRent ? '賃料上限: ' + conditions.maxRent + '万円' : ''}
\${conditions.maxPrice ? '購入予算: ' + conditions.maxPrice + '万円' : ''}
\${conditions.layout && conditions.layout !== 'こだわらない' ? '間取り: ' + conditions.layout : ''}
\${conditions.propertyType && conditions.propertyType !== 'こだわらない' ? '物件種別: ' + conditions.propertyType : ''}
\${conditions.other ? 'その他希望: ' + conditions.other : ''}
マッチした物件: \${propertyList}
200字程度でアドバイスと次のステップを提案してください。\`
      const res = await fetch('/api/claude', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-5',
          system: 'あなたはGINTETSUのプロフェッショナルなAIコンシェルジュです。',
          messages: [{ role: 'user', content: [{ type: 'text', text: prompt }] }],
          max_tokens: 600,
        }),
      })
      const data = await res.json()
      setAiResult(data.text || '')
    } catch (err) {
      setAiResult('AI提案の生成に失敗しました。もう一度お試しください。')
    } finally { setLoading(false) }
  }

  const fieldStyle = { width: '100%', boxSizing: 'border-box', padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(26,58,92,0.12)', background: '#fff', color: '#222', fontSize: 14, outline: 'none', fontFamily: 'inherit' }
  const labelStyle = { display: 'block', fontSize: 12, color: '#777', marginBottom: 5 }
  const favProps = properties.filter(p => favorites.includes(p.id))

  return (
    <div style={{ padding: 20 }}>
      <h2 style={{ fontSize: 18, fontWeight: 750, color: '#1a3a5c', margin: '0 0 4px' }}>🏠 物件マッチングAI</h2>
      <p style={{ fontSize: 13, color: '#777', margin: '0 0 20px' }}>希望条件を入力するとAIが最適な物件を提案します</p>
      <div style={{ display: 'flex', gap: 0, marginBottom: 20, borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(26,58,92,0.12)', width: 'fit-content' }}>
        {[{ id: 'matching', label: '🔍 物件を探す' }, { id: 'favorites', label: \`❤️ お気に入り(\${favorites.length})\` }].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ padding: '9px 18px', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, background: activeTab === t.id ? '#1a3a5c' : '#f8fafc', color: activeTab === t.id ? '#fff' : '#777' }}>{t.label}</button>
        ))}
      </div>

      {activeTab === 'matching' && (
        <>
          <div style={{ background: '#f8fafc', borderRadius: 14, padding: 16, marginBottom: 20, border: '1px solid rgba(26,58,92,0.08)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div><label style={labelStyle}>エリア・地域 <span style={{ color: '#e53e3e' }}>*</span></label><input style={fieldStyle} value={conditions.area} onChange={e => setConditions(c => ({ ...c, area: e.target.value }))} placeholder="例：さいたま市大宮区" /></div>
              <div><label style={labelStyle}>取引種別</label><select style={fieldStyle} value={conditions.dealType} onChange={e => setConditions(c => ({ ...c, dealType: e.target.value }))}><option value="">すべて</option><option value="rent">賃貸</option><option value="sale">売買</option></select></div>
              <div><label style={labelStyle}>物件種別</label><select style={fieldStyle} value={conditions.propertyType} onChange={e => setConditions(c => ({ ...c, propertyType: e.target.value }))}><option value="">選択してください</option>{PROPERTY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
              <div><label style={labelStyle}>賃料上限（万円/月）</label><input style={fieldStyle} value={conditions.maxRent} onChange={e => setConditions(c => ({ ...c, maxRent: e.target.value }))} placeholder="例：8" inputMode="numeric" /></div>
              <div><label style={labelStyle}>購入予算（万円）</label><input style={fieldStyle} value={conditions.maxPrice} onChange={e => setConditions(c => ({ ...c, maxPrice: e.target.value }))} placeholder="例：3000" inputMode="numeric" /></div>
              <div><label style={labelStyle}>間取り</label><select style={fieldStyle} value={conditions.layout} onChange={e => setConditions(c => ({ ...c, layout: e.target.value }))}><option value="">選択してください</option>{LAYOUTS.map(l => <option key={l} value={l}>{l}</option>)}</select></div>
              <div><label style={labelStyle}>その他の希望</label><input style={fieldStyle} value={conditions.other} onChange={e => setConditions(c => ({ ...c, other: e.target.value }))} placeholder="例：駅徒歩10分以内" /></div>
            </div>
            <button onClick={handleSearch} disabled={loading} style={{ background: '#1a3a5c', color: '#fff', border: 'none', borderRadius: 10, padding: '11px 28px', fontWeight: 700, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'AI検索中...' : '🔍 AIマッチング検索'}
            </button>
          </div>
          {searched && (
            <>
              {aiResult && <div style={{ background: 'rgba(26,58,92,0.05)', border: '1px dashed rgba(26,58,92,0.25)', borderRadius: 14, padding: 16, marginBottom: 20 }}><div style={{ fontSize: 13, fontWeight: 700, color: '#1a3a5c', marginBottom: 8 }}>💬 AIからの提案</div><div style={{ fontSize: 14, lineHeight: 1.7, color: '#333', whiteSpace: 'pre-wrap' }}>{aiResult}</div></div>}
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1a3a5c', margin: '0 0 12px' }}>マッチした物件（{matched.length}件）</h3>
              {matched.length === 0 ? <div style={{ textAlign: 'center', padding: '32px 16px', color: '#777', fontSize: 14 }}>条件に合う物件が見つかりませんでした。</div> : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>{matched.map(p => <PropertyCard key={p.id} property={p} isFavorite={favorites.includes(p.id)} onToggleFavorite={toggleFavorite} onClick={() => setSelectedProperty(p)} />)}</div>}
            </>
          )}
          {!searched && properties.length > 0 && (<><h3 style={{ fontSize: 15, fontWeight: 700, color: '#1a3a5c', margin: '0 0 12px' }}>📋 掲載中の物件（{properties.length}件）</h3><div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>{properties.map(p => <PropertyCard key={p.id} property={p} isFavorite={favorites.includes(p.id)} onToggleFavorite={toggleFavorite} onClick={() => setSelectedProperty(p)} />)}</div></>)}
          {!searched && properties.length === 0 && <div style={{ textAlign: 'center', padding: '40px 16px', color: '#777', fontSize: 14 }}>現在掲載中の物件はありません。</div>}
        </>
      )}

      {activeTab === 'favorites' && (
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1a3a5c', margin: '0 0 12px' }}>❤️ お気に入り物件（{favProps.length}件）</h3>
          {favProps.length === 0 ? <div style={{ textAlign: 'center', padding: '40px 16px', color: '#777', fontSize: 14 }}>お気に入りに登録した物件はありません。</div> : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>{favProps.map(p => <PropertyCard key={p.id} property={p} isFavorite={true} onToggleFavorite={toggleFavorite} onClick={() => setSelectedProperty(p)} />)}</div>}
        </div>
      )}

      {selectedProperty && <PropertyModal property={selectedProperty} isFavorite={favorites.includes(selectedProperty.id)} onToggleFavorite={toggleFavorite} onClose={() => setSelectedProperty(null)} />}
    </div>
  )
}

function PropertyCard({ property: p, isFavorite, onToggleFavorite, onClick }) {
  return (
    <div onClick={onClick} style={{ background: '#fff', borderRadius: 12, border: '1.5px solid #f5a623', overflow: 'hidden', display: 'flex', flexDirection: 'column', cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(245,166,35,0.25)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}>
      <div style={{ width: '100%', aspectRatio: '4/3', background: '#f0f4f8', overflow: 'hidden', position: 'relative' }}>
        {p.image_url ? <img src={p.image_url} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36 }}>🏠</div>}
        <button onClick={e => onToggleFavorite(p.id, e)} style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{isFavorite ? '❤️' : '🤍'}</button>
        <div style={{ position: 'absolute', bottom: 8, right: 8, background: 'rgba(26,58,92,0.7)', color: '#fff', fontSize: 10, padding: '3px 7px', borderRadius: 4 }}>詳細を見る →</div>
      </div>
      <div style={{ padding: '10px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {p.is_agency && <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: '#fef3c7', color: '#92400e', fontWeight: 700 }}>業者掲載</span>}
          {p.deal_type && <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: p.deal_type === 'sale' ? '#fef3c7' : '#dbeafe', color: p.deal_type === 'sale' ? '#92400e' : '#1e40af', fontWeight: 700 }}>{p.deal_type === 'sale' ? '売買' : p.deal_type === 'both' ? '売買・賃貸' : '賃貸'}</span>}
          {p.property_type && <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: '#eef2f7', color: '#1a3a5c' }}>{p.property_type}</span>}
        </div>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#1a3a5c', lineHeight: 1.4 }}>{p.title}</div>
        {p.address && <div style={{ fontSize: 11, color: '#666' }}>📍 {p.address}</div>}
        {p.access && <div style={{ fontSize: 11, color: '#666' }}>🚃 {p.access}</div>}
        <div style={{ fontSize: 14, fontWeight: 700, color: '#1a3a5c', marginTop: 2 }}>
          {p.rent ? \`賃料 \${Math.round(p.rent / 10000)}万円/月\` : ''}
          {p.price ? \`価格 \${(p.price / 10000).toLocaleString()}万円\` : ''}
        </div>
        <div style={{ fontSize: 11, color: '#888', display: 'flex', gap: 8 }}>
          {p.layout && <span>{p.layout}</span>}
          {p.area && <span>{p.area}㎡</span>}
        </div>
      </div>
    </div>
  )
}

function PropertyModal({ property: p, isFavorite, onToggleFavorite, onClose }) {
  const searchUrl = p.address ? \`https://www.google.com/maps/search/?api=1&query=\${encodeURIComponent(p.address)}\` : ''
  const defaultPrice = p.price ? Math.round(p.price / 10000) : ''
  const [loanPrice, setLoanPrice] = useState(defaultPrice)
  const [downPayment, setDownPayment] = useState('')
  const [rate, setRate] = useState('1.5')
  const [years, setYears] = useState('35')
  const [showLoan, setShowLoan] = useState(false)

  function calcLoan() {
    const price = parseFloat(loanPrice) || 0
    const down = parseFloat(downPayment) || 0
    const principal = (price - down) * 10000
    const monthlyRate = parseFloat(rate) / 100 / 12
    const n = parseInt(years) * 12
    if (principal <= 0 || monthlyRate <= 0 || n <= 0) return 0
    return Math.round(principal * monthlyRate * Math.pow(1 + monthlyRate, n) / (Math.pow(1 + monthlyRate, n) - 1))
  }

  const monthlyPayment = calcLoan()
  const totalPayment = monthlyPayment * parseInt(years || 0) * 12
  const totalInterest = totalPayment - ((parseFloat(loanPrice || 0) - parseFloat(downPayment || 0)) * 10000)

  const rows = [
    { label: '所在地', value: p.address }, { label: '交通・アクセス', value: p.access },
    { label: '賃料', value: p.rent ? \`\${Math.round(p.rent/10000)}万円/月\` : null },
    { label: '価格', value: p.price ? \`\${(p.price/10000).toLocaleString()}万円\` : null },
    { label: '間取り', value: p.layout }, { label: '面積', value: p.area ? \`\${p.area}㎡\` : null },
    { label: '物件種別', value: p.property_type }, { label: '築年月', value: p.built_date },
    { label: '構造', value: p.structure }, { label: '階数/所在階', value: p.floor_info },
    { label: '管理費', value: p.management_fee }, { label: '修繕積立金', value: p.repair_fund },
    { label: '敷金', value: p.deposit }, { label: '礼金', value: p.key_money },
    { label: '契約期間', value: p.contract_period }, { label: '駐車場', value: p.parking },
    { label: '引渡', value: p.delivery }, { label: '取引態様', value: p.transaction_type },
    { label: '土地権利', value: p.land_rights }, { label: '用途地域', value: p.use_zone },
    { label: '現況', value: p.current_status }, { label: '備考', value: p.remarks },
    { label: '説明', value: p.description },
  ].filter(r => r.value)

  const isRent = p.deal_type === 'rent' || p.rent
  const isSale = p.deal_type === 'sale' || p.price

  return (
    <div onClick={onClose} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', overflowY: 'auto', padding: '20px 16px' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 600, position: 'relative', marginTop: 20, marginBottom: 20 }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none', borderRadius: '50%', width: 36, height: 36, fontSize: 18, cursor: 'pointer', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
        <div style={{ width: '100%', aspectRatio: '16/9', background: '#f0f4f8', borderRadius: '16px 16px 0 0', overflow: 'hidden' }}>
          {p.image_url ? <img src={p.image_url} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 60 }}>🏠</div>}
        </div>
        <div style={{ padding: '20px 24px 24px' }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
            {p.is_agency && <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 4, background: '#fef3c7', color: '#92400e', fontWeight: 700 }}>業者掲載</span>}
            {p.deal_type && <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 4, background: p.deal_type === 'sale' ? '#fef3c7' : '#dbeafe', color: p.deal_type === 'sale' ? '#92400e' : '#1e40af', fontWeight: 700 }}>{p.deal_type === 'sale' ? '売買' : p.deal_type === 'both' ? '売買・賃貸' : '賃貸'}</span>}
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1a3a5c', margin: '0 0 8px' }}>{p.title}</h2>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#1a3a5c', marginBottom: 16 }}>
            {p.rent ? \`賃料 \${Math.round(p.rent/10000)}万円/月\` : ''}
            {p.price ? \`価格 \${(p.price/10000).toLocaleString()}万円\` : ''}
          </div>
          <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
            <button onClick={e => onToggleFavorite(p.id, e)} style={{ flex: 1, padding: '10px', border: '1.5px solid #f5a623', borderRadius: 10, background: isFavorite ? '#fff8e7' : '#fff', color: '#1a3a5c', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
              {isFavorite ? '❤️ お気に入り済み' : '🤍 お気に入りに追加'}
            </button>
            {p.address && <a href={searchUrl} target="_blank" rel="noreferrer" style={{ flex: 1, padding: '10px', border: '1.5px solid #1a3a5c', borderRadius: 10, background: '#1a3a5c', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer', textDecoration: 'none', textAlign: 'center' }}>📍 Google Mapsで開く</a>}
          </div>

          {/* 詳細情報テーブル */}
          <div style={{ border: '1px solid #eef2f7', borderRadius: 10, overflow: 'hidden', marginBottom: 16 }}>
            <div style={{ background: '#1a3a5c', color: '#fff', fontSize: 13, fontWeight: 700, padding: '10px 16px' }}>■ 物件詳細情報</div>
            {rows.map((row, i) => (
              <div key={row.label} style={{ display: 'flex', borderBottom: i < rows.length - 1 ? '1px solid #f0f4f8' : 'none', fontSize: 13 }}>
                <div style={{ width: 120, flexShrink: 0, padding: '10px 16px', background: '#f8fafc', color: '#555', fontWeight: 600, borderRight: '1px solid #eef2f7' }}>{row.label}</div>
                <div style={{ flex: 1, padding: '10px 16px', color: '#222', wordBreak: 'break-word' }}>{row.value}</div>
              </div>
            ))}
          </div>

          {/* 住宅ローンシミュレーター（売買物件のみ）*/}
          {isSale && (
            <div style={{ marginBottom: 12, border: '1.5px solid #f5a623', borderRadius: 12, overflow: 'hidden' }}>
              <button onClick={() => setShowLoan(!showLoan)} style={{ width: '100%', padding: '12px 16px', background: showLoan ? '#f5a623' : '#fff8e7', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 700, fontSize: 14, color: '#1a3a5c' }}>
                <span>🏦 住宅ローンシミュレーター</span>
                <span>{showLoan ? '▲' : '▼'}</span>
              </button>
              {showLoan && (
                <div style={{ padding: 16, background: '#fffdf5' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                    <div><label style={{ display: 'block', fontSize: 11, color: '#777', marginBottom: 3 }}>物件価格（万円）</label><input type="number" value={loanPrice} onChange={e => setLoanPrice(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '8px 10px', borderRadius: 8, border: '1px solid #ddd', fontSize: 13 }} placeholder="例：3000" /></div>
                    <div><label style={{ display: 'block', fontSize: 11, color: '#777', marginBottom: 3 }}>頭金（万円）</label><input type="number" value={downPayment} onChange={e => setDownPayment(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '8px 10px', borderRadius: 8, border: '1px solid #ddd', fontSize: 13 }} placeholder="例：300" /></div>
                    <div><label style={{ display: 'block', fontSize: 11, color: '#777', marginBottom: 3 }}>金利（年率%）</label><input type="number" value={rate} onChange={e => setRate(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '8px 10px', borderRadius: 8, border: '1px solid #ddd', fontSize: 13 }} step="0.1" /></div>
                    <div><label style={{ display: 'block', fontSize: 11, color: '#777', marginBottom: 3 }}>返済期間（年）</label><select value={years} onChange={e => setYears(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '8px 10px', borderRadius: 8, border: '1px solid #ddd', fontSize: 13 }}>{[10,15,20,25,30,35].map(y => <option key={y} value={y}>{y}年</option>)}</select></div>
                  </div>
                  {monthlyPayment > 0 && (
                    <div style={{ background: '#1a3a5c', borderRadius: 10, padding: '14px 16px', marginBottom: 12, color: '#fff' }}>
                      <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 4 }}>毎月の返済額（概算）</div>
                      <div style={{ fontSize: 28, fontWeight: 800 }}>{monthlyPayment.toLocaleString()}<span style={{ fontSize: 14, fontWeight: 400 }}>円/月</span></div>
                      <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: 12, opacity: 0.8 }}>
                        <span>借入額：{((parseFloat(loanPrice||0) - parseFloat(downPayment||0))).toLocaleString()}万円</span>
                        <span>総返済額：{Math.round(totalPayment/10000).toLocaleString()}万円</span>
                        <span>利息総額：{Math.round(totalInterest/10000).toLocaleString()}万円</span>
                      </div>
                    </div>
                  )}
                  <div style={{ fontSize: 11, color: '#999', marginBottom: 10 }}>※ 元利均等返済の概算です。実際の返済額は金融機関にご確認ください。</div>
                  <a href="https://h.accesstrade.net/sp/cc?rk=0100p7qk00ib4b" target="_blank" rel="noopener noreferrer sponsored" style={{ display: 'block', width: '100%', boxSizing: 'border-box', padding: '12px', background: 'linear-gradient(135deg, #f5a623, #e8920f)', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: 'pointer', textDecoration: 'none', textAlign: 'center' }}>
                    🏦 住宅ローンを無料で比較・相談する →
                  </a>
                  <div style={{ fontSize: 10, color: '#bbb', textAlign: 'center', marginTop: 4 }}>※ 提携金融機関のサービスページへ移動します</div>
                </div>
              )}
            </div>
          )}

          {/* 問い合わせボタン */}
          <button onClick={() => { onClose(); window.scrollTo(0,0) }} style={{ width: '100%', marginBottom: 12, padding: '14px', background: '#f5a623', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
            📞 この物件について相談する
          </button>

          {/* 引越し見積もりボタン（賃貸物件のみ）*/}
          {isRent && (
            <div style={{ marginBottom: 12, border: '1.5px solid #2d6a4f', borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ background: '#f0faf5', padding: '12px 16px', borderBottom: '1px solid #d1fae5' }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: '#2d6a4f', marginBottom: 4 }}>🚚 引越し費用を節約しませんか？</div>
                <div style={{ fontSize: 12, color: '#555', lineHeight: 1.6 }}>複数の引越し業者に一括見積もりを依頼できます。平均で<strong>3〜5万円</strong>お得になるケースも！</div>
              </div>
              <div style={{ padding: '12px 16px', background: '#fff' }}>
                <a href="https://px.a8.net/svt/ejp?a8mat=引越し案件リンク" target="_blank" rel="noopener noreferrer sponsored" style={{ display: 'block', width: '100%', boxSizing: 'border-box', padding: '12px', background: '#2d6a4f', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 14, textDecoration: 'none', textAlign: 'center' }}>
                  🚚 引越し費用を無料一括見積もり →
                </a>
                <div style={{ fontSize: 10, color: '#bbb', textAlign: 'center', marginTop: 4 }}>※ 引越し比較サービスのページへ移動します</div>
              </div>
            </div>
          )}

          {/* 火災保険ボタン（全物件）*/}
          <div style={{ border: '1.5px solid #1e40af', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ background: '#eff6ff', padding: '12px 16px', borderBottom: '1px solid #bfdbfe' }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#1e40af', marginBottom: 4 }}>🔥 火災保険の加入はお済みですか？</div>
              <div style={{ fontSize: 12, color: '#555', lineHeight: 1.6 }}>{isRent ? '賃貸でも火災保険は必須です。' : '住宅購入時の火災保険を比較できます。'}一括比較で<strong>最安値</strong>を見つけましょう。</div>
            </div>
            <div style={{ padding: '12px 16px', background: '#fff' }}>
              <a href="https://px.a8.net/svt/ejp?a8mat=火災保険案件リンク" target="_blank" rel="noopener noreferrer sponsored" style={{ display: 'block', width: '100%', boxSizing: 'border-box', padding: '12px', background: '#1e40af', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 14, textDecoration: 'none', textAlign: 'center' }}>
                🔥 火災保険を無料一括比較する →
              </a>
              <div style={{ fontSize: 10, color: '#bbb', textAlign: 'center', marginTop: 4 }}>※ 保険比較サービスのページへ移動します</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
`

fs.writeFileSync(pmPath, pmContent, 'utf8')
console.log('✅ PropertyMatching.jsx を完全書き直しました（重複解消・ローン・引越し・保険ボタン整理済み）')

// ===== 2. App.jsx に「💰 お得情報」タブ追加 =====
const appPath = path.join(__dirname, 'src', 'App.jsx')
let appContent = fs.readFileSync(appPath, 'utf8')

// ColumnPage import追加
if (!appContent.includes('ColumnPage')) {
  const lines = appContent.split('\n')
  let lastImportIdx = 0
  lines.forEach((l, i) => { if (l.startsWith('import ')) lastImportIdx = i })
  lines.splice(lastImportIdx + 1, 0, "import ColumnPage from './ColumnPage'")
  appContent = lines.join('\n')
  console.log('✅ ColumnPage import追加')
}

// タブ定義に「💰 お得情報」を追加
const tabAddPatterns = [
  "{ id: 'agency', label: '🏗️ 業者様向け' },\n  { id: 'column', label: '📰 コラム' },",
  "{ id: 'agency', label: '🏗️ 業者様向け' },\n  { id: 'column', label: '💰 お得情報' },",
]
const hasOldColumn = tabAddPatterns.some(p => appContent.includes(p))

if (!hasOldColumn && appContent.includes("{ id: 'agency'")) {
  // agencyタブの後に追加
  appContent = appContent.replace(
    "{ id: 'agency', label: '🏗️ 業者様向け' },",
    "{ id: 'agency', label: '🏗️ 業者様向け' },\n  { id: 'column', label: '💰 お得情報' },"
  )
  console.log('✅ お得情報タブをタブ定義に追加')
} else if (appContent.includes("{ id: 'column', label: '📰 コラム' },")) {
  appContent = appContent.replace(
    "{ id: 'column', label: '📰 コラム' },",
    "{ id: 'column', label: '💰 お得情報' },"
  )
  console.log('✅ コラム→お得情報に名前変更')
} else {
  console.log('INFO: タブ定義はすでに設定済みです')
}

// コラムタブの表示を追加（まだない場合）
if (!appContent.includes("tab === 'column'")) {
  // 会員専用タブの表示を探して後に追加
  const memberPatterns = [
    "tab === 'member'",
    "tab === 'auth'",
    "activeTab === 'member'",
  ]
  let inserted = false
  for (const pat of memberPatterns) {
    if (appContent.includes(pat)) {
      // そのif文全体の後に追加するため、AuthPanelの閉じタグを探す
      const idx = appContent.indexOf(pat)
      // タブコンテンツの最後のパターンを探す
      const afterIdx = appContent.indexOf('</div>', idx + 200)
      if (afterIdx > 0) {
        const insertStr = `\n          {tab === 'column' && <ColumnPage />}`
        appContent = appContent.slice(0, afterIdx + 6) + insertStr + appContent.slice(afterIdx + 6)
        console.log('✅ コラムタブの表示を追加')
        inserted = true
        break
      }
    }
  }
  if (!inserted) console.log('INFO: コラムタブ表示の自動挿入をスキップ（手動確認が必要かもしれません）')
}

fs.writeFileSync(appPath, appContent, 'utf8')
console.log('\nSUCCESS: すべての修正が完了しました！npm run build を実行してください')
