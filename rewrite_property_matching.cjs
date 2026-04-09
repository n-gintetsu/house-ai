const fs = require('fs')
const path = require('path')

const filePath = path.join(__dirname, 'src', 'PropertyMatching.jsx')

const newContent = `import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'

const LAYOUTS = ['1R/1K', '1LDK', '2LDK', '3LDK', '4LDK以上', 'こだわらない']
const PROPERTY_TYPES = ['マンション', '一戸建て', 'アパート', '土地', 'こだわらない']

export default function PropertyMatching({ user }) {
  const [properties, setProperties] = useState([])
  const [favorites, setFavorites] = useState([])
  const [activeTab, setActiveTab] = useState('matching')

  const [conditions, setConditions] = useState({
    area: '',
    dealType: '',
    maxRent: '',
    maxPrice: '',
    layout: '',
    propertyType: '',
    other: '',
  })
  const [aiResult, setAiResult] = useState('')
  const [matched, setMatched] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  useEffect(() => {
    loadProperties()
    loadFavorites()
  }, [user])

  async function loadProperties() {
    // 管理画面登録物件を取得
    const { data: adminProps } = await supabase
      .from('properties')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    // 業者登録物件を取得
    // 公開物件は全員、非公開はログイン済み会員のみ
    let agencyQuery = supabase
      .from('agency_properties')
      .select('*')
      .eq('status', 'active')
      .eq('is_public', true)

    const { data: agencyProps } = await agencyQuery.order('created_at', { ascending: false })

    // 業者物件をPropertyCardで表示できる形式に変換
    const normalizedAgency = (agencyProps || []).map(p => {
      let details = {}
      try {
        details = p.details ? (typeof p.details === 'string' ? JSON.parse(p.details) : p.details) : {}
      } catch(e) {}
      return {
        id: 'agency_' + p.id,
        title: p.title,
        address: details.address || '',
        property_type: p.property_type_detail || '',
        deal_type: p.deal_category === 'sale' ? 'sale' : 'rent',
        price: p.price || null,
        rent: p.rent || null,
        image_url: p.image_url || null,
        description: p.catchcopy || '',
        layout: details.layout || '',
        area: details.building_area || details.land_area || null,
        status: 'active',
        is_agency: true,
        is_public: p.is_public,
      }
    })

    setProperties([...(adminProps || []), ...normalizedAgency])
  }

  async function loadFavorites() {
    if (!user) return
    const { data } = await supabase.from('favorites').select('*').eq('user_id', user.id)
    setFavorites((data || []).map(f => f.property_id))
  }

  async function toggleFavorite(propertyId) {
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
    setLoading(true)
    setSearched(true)
    setAiResult('')
    setMatched([])

    try {
      let query = supabase.from('properties').select('*').eq('status', 'active')
      if (conditions.dealType) query = query.eq('deal_type', conditions.dealType)
      if (conditions.layout && conditions.layout !== 'こだわらない') query = query.eq('layout', conditions.layout)
      if (conditions.propertyType && conditions.propertyType !== 'こだわらない') query = query.eq('property_type', conditions.propertyType)
      if (conditions.maxRent) query = query.lte('rent', parseInt(conditions.maxRent) * 10000)
      if (conditions.maxPrice) query = query.lte('price', parseInt(conditions.maxPrice) * 10000)

      const { data: matchedProps } = await query.limit(5)
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

上記の条件と物件情報をもとに、200字程度でお客様へのアドバイスと次のステップを提案してください。\`

      const res = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-5',
          system: 'あなたはGINTETSUのプロフェッショナルなAIコンシェルジュです。お客様の希望に寄り添い、具体的で親切なアドバイスをしてください。',
          messages: [{ role: 'user', content: [{ type: 'text', text: prompt }] }],
          max_tokens: 600,
        }),
      })
      const data = await res.json()
      setAiResult(data.text || '')
    } catch (err) {
      console.error(err)
      setAiResult('AI提案の生成に失敗しました。もう一度お試しください。')
    } finally {
      setLoading(false)
    }
  }

  const fieldStyle = {
    width: '100%', boxSizing: 'border-box', padding: '10px 12px',
    borderRadius: 10, border: '1px solid rgba(26,58,92,0.12)',
    background: '#fff', color: '#222', fontSize: 14, outline: 'none', fontFamily: 'inherit',
  }
  const labelStyle = { display: 'block', fontSize: 12, color: '#777', marginBottom: 5 }

  const favProps = properties.filter(p => favorites.includes(p.id))

  return (
    <div style={{ padding: 20 }}>
      <h2 style={{ fontSize: 18, fontWeight: 750, color: '#1a3a5c', margin: '0 0 4px' }}>🏠 物件マッチングAI</h2>
      <p style={{ fontSize: 13, color: '#777', margin: '0 0 20px' }}>希望条件を入力するとAIが最適な物件を提案します</p>

      <div style={{ display: 'flex', gap: 0, marginBottom: 20, borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(26,58,92,0.12)', width: 'fit-content' }}>
        {[{ id: 'matching', label: '🔍 物件を探す' }, { id: 'favorites', label: \`❤️ お気に入り(\${favorites.length})\` }].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
            padding: '9px 18px', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700,
            background: activeTab === t.id ? '#1a3a5c' : '#f8fafc',
            color: activeTab === t.id ? '#fff' : '#777',
          }}>{t.label}</button>
        ))}
      </div>

      {activeTab === 'matching' && (
        <>
          <div style={{ background: '#f8fafc', borderRadius: 14, padding: 16, marginBottom: 20, border: '1px solid rgba(26,58,92,0.08)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={labelStyle}>エリア・地域 <span style={{ color: '#e53e3e' }}>*</span></label>
                <input style={fieldStyle} value={conditions.area} onChange={e => setConditions(c => ({ ...c, area: e.target.value }))} placeholder="例：さいたま市大宮区" />
              </div>
              <div>
                <label style={labelStyle}>取引種別</label>
                <select style={fieldStyle} value={conditions.dealType} onChange={e => setConditions(c => ({ ...c, dealType: e.target.value }))}>
                  <option value="">すべて（賃貸・売買）</option>
                  <option value="rent">賃貸</option>
                  <option value="sale">売買</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>物件種別</label>
                <select style={fieldStyle} value={conditions.propertyType} onChange={e => setConditions(c => ({ ...c, propertyType: e.target.value }))}>
                  <option value="">選択してください</option>
                  {PROPERTY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>賃料上限（万円/月）</label>
                <input style={fieldStyle} value={conditions.maxRent} onChange={e => setConditions(c => ({ ...c, maxRent: e.target.value }))} placeholder="例：8" inputMode="numeric" />
              </div>
              <div>
                <label style={labelStyle}>購入予算（万円）</label>
                <input style={fieldStyle} value={conditions.maxPrice} onChange={e => setConditions(c => ({ ...c, maxPrice: e.target.value }))} placeholder="例：3000" inputMode="numeric" />
              </div>
              <div>
                <label style={labelStyle}>間取り</label>
                <select style={fieldStyle} value={conditions.layout} onChange={e => setConditions(c => ({ ...c, layout: e.target.value }))}>
                  <option value="">選択してください</option>
                  {LAYOUTS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>その他の希望</label>
                <input style={fieldStyle} value={conditions.other} onChange={e => setConditions(c => ({ ...c, other: e.target.value }))} placeholder="例：駅徒歩10分以内" />
              </div>
            </div>
            <button
              onClick={handleSearch}
              disabled={loading}
              style={{ background: '#1a3a5c', color: '#fff', border: 'none', borderRadius: 10, padding: '11px 28px', fontWeight: 700, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'AI検索中...' : '🔍 AIマッチング検索'}
            </button>
          </div>

          {searched && (
            <>
              {aiResult && (
                <div style={{ background: 'rgba(26,58,92,0.05)', border: '1px dashed rgba(26,58,92,0.25)', borderRadius: 14, padding: 16, marginBottom: 20 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#1a3a5c', marginBottom: 8 }}>💬 AIからの提案</div>
                  <div style={{ fontSize: 14, lineHeight: 1.7, color: '#333', whiteSpace: 'pre-wrap' }}>{aiResult}</div>
                </div>
              )}
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1a3a5c', margin: '0 0 12px' }}>
                マッチした物件（{matched.length}件）
              </h3>
              {matched.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px 16px', color: '#777', fontSize: 14 }}>
                  条件に合う物件が見つかりませんでした。<br />条件を変えて再検索してください。
                </div>
              ) : matched.map(p => (
                <PropertyCard key={p.id} property={p} isFavorite={favorites.includes(p.id)} onToggleFavorite={toggleFavorite} />
              ))}
            </>
          )}

          {!searched && properties.length > 0 && (
            <>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1a3a5c', margin: '0 0 12px' }}>📋 掲載中の物件（{properties.length}件）</h3>
              {properties.map(p => (
                <PropertyCard key={p.id} property={p} isFavorite={favorites.includes(p.id)} onToggleFavorite={toggleFavorite} />
              ))}
            </>
          )}

          {!searched && properties.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 16px', color: '#777', fontSize: 14 }}>
              現在掲載中の物件はありません。<br />希望条件を入力してAI提案を受けることができます。
            </div>
          )}
        </>
      )}

      {activeTab === 'favorites' && (
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1a3a5c', margin: '0 0 12px' }}>❤️ お気に入り物件（{favProps.length}件）</h3>
          {favProps.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 16px', color: '#777', fontSize: 14 }}>
              お気に入りに登録した物件はありません。
            </div>
          ) : favProps.map(p => (
            <PropertyCard key={p.id} property={p} isFavorite={true} onToggleFavorite={toggleFavorite} />
          ))}
        </div>
      )}
    </div>
  )
}

function PropertyCard({ property: p, isFavorite, onToggleFavorite }) {
  const [showMap, setShowMap] = useState(false)
  const searchUrl = p.address ? \`https://www.google.com/maps/search/?api=1&query=\${encodeURIComponent(p.address)}\` : ''

  return (
    <div style={{ background: '#fff', borderRadius: 14, marginBottom: 12, border: '1px solid rgba(26,58,92,0.1)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
      {p.image_url && <img src={p.image_url} alt={p.title} style={{ width: '100%', height: 200, objectFit: 'cover' }} />}
      <div style={{ padding: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: '#1a3a5c' }}>{p.title}</div>
              {p.is_agency && <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: '#fef3c7', color: '#92400e', fontWeight: 700 }}>業者掲載</span>}
              {p.deal_type && <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 999, background: p.deal_type === 'sale' ? '#fef3c7' : p.deal_type === 'both' ? '#ede9fe' : '#dbeafe', color: p.deal_type === 'sale' ? '#92400e' : p.deal_type === 'both' ? '#5b21b6' : '#1e40af', fontWeight: 700 }}>
                {p.deal_type === 'sale' ? '売買' : p.deal_type === 'both' ? '賃貸・売買' : '賃貸'}
              </span>}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
              {p.property_type && <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 999, background: '#eef2f7', color: '#1a3a5c' }}>{p.property_type}</span>}
              {p.layout && <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 999, background: '#eef2f7', color: '#1a3a5c' }}>{p.layout}</span>}
              {p.area && <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 999, background: '#eef2f7', color: '#1a3a5c' }}>{p.area}㎡</span>}
            </div>
            {p.address && <div style={{ fontSize: 13, color: '#555', marginBottom: 4 }}>📍 {p.address}</div>}
            <div style={{ fontSize: 14, fontWeight: 700, color: '#1a3a5c' }}>
              {p.rent ? \`賃料 \${Math.round(p.rent / 10000)}万円/月\` : ''}
              {p.price ? \`価格 \${(p.price / 10000).toLocaleString()}万円\` : ''}
            </div>
            {p.description && <div style={{ fontSize: 12, color: '#777', marginTop: 6, lineHeight: 1.5 }}>{p.description}</div>}
            <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
              {p.address && (
                <button onClick={() => setShowMap(!showMap)} style={{ fontSize: 12, padding: '5px 12px', borderRadius: 8, border: '1px solid rgba(26,58,92,0.2)', background: showMap ? '#1a3a5c' : '#f8fafc', color: showMap ? '#fff' : '#555', cursor: 'pointer' }}>
                  🗺️ {showMap ? '地図を閉じる' : '地図を見る'}
                </button>
              )}
              {p.address && (
                <a href={searchUrl} target="_blank" rel="noreferrer" style={{ fontSize: 12, padding: '5px 12px', borderRadius: 8, border: '1px solid rgba(26,58,92,0.2)', background: '#f8fafc', color: '#555', textDecoration: 'none' }}>
                  📍 Google Mapsで開く
                </a>
              )}
            </div>
          </div>
          <button
            onClick={() => onToggleFavorite(p.id)}
            style={{ marginLeft: 12, fontSize: 22, background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0 }}
          >
            {isFavorite ? '❤️' : '🤍'}
          </button>
        </div>
        {showMap && p.address && (
          <div style={{ marginTop: 12, borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(26,58,92,0.1)' }}>
            <iframe
              title={p.title}
              width="100%"
              height="250"
              frameBorder="0"
              scrolling="no"
              src={\`https://maps.google.com/maps?q=\${encodeURIComponent(p.address)}&t=m&z=15&output=embed&iwloc=near\`}
              style={{ display: 'block' }}
            />
          </div>
        )}
      </div>
    </div>
  )
}
`

fs.writeFileSync(filePath, newContent, 'utf8')
console.log('SUCCESS: PropertyMatching.jsx を書き換えました！')
