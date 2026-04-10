import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

const navy = '#1a3a5c'
const gold = '#c9a84c'
const orange = '#f5a623'

export default function PropertiesPage({ user }) {
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    fetchProperties()
  }, [user])

  const fetchProperties = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('properties')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false })
    setProperties(data || [])
    setLoading(false)
  }

  const filtered = filter === 'all' ? properties
    : properties.filter(p => p.property_type === filter || p.building_type === filter)

  const typeLabel = (p) => {
    if (p.property_type === 'sale') return { label: '売買', color: '#e74c3c' }
    if (p.property_type === 'rent') return { label: '賃貸', color: '#27ae60' }
    return { label: p.property_type || '物件', color: navy }
  }

  return (
    <div style={{ padding: '0 0 24px' }}>
      {/* ヘッダー */}
      <div style={{ background: navy, padding: '20px 20px 16px', marginBottom: 16 }}>
        <h2 style={{ color: '#fff', fontSize: 18, fontWeight: 700, margin: 0 }}>🏠 物件情報</h2>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, margin: '4px 0 0' }}>
          公開中の物件一覧です
        </p>
      </div>

      {/* フィルター */}
      <div style={{ padding: '0 16px 12px', display: 'flex', gap: 8, overflowX: 'auto' }}>
        {[
          { key: 'all', label: 'すべて' },
          { key: 'sale', label: '売買' },
          { key: 'rent', label: '賃貸' },
        ].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            style={{ padding: '6px 16px', background: filter === f.key ? navy : '#f0f0f0', color: filter === f.key ? '#fff' : '#555', border: 'none', borderRadius: 20, fontSize: 13, fontWeight: filter === f.key ? 700 : 400, cursor: 'pointer', whiteSpace: 'nowrap' }}>
            {f.label}
          </button>
        ))}
      </div>

      {/* 物件一覧 */}
      <div style={{ padding: '0 16px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#aaa' }}>読み込み中...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#aaa' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🏠</div>
            <div style={{ fontSize: 14 }}>現在公開中の物件はありません</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map(p => {
              const type = typeLabel(p)
              const images = p.images || p.image_urls || []
              const imgSrc = Array.isArray(images) ? images[0] : null
              const isPrivate = p.is_private || false

              if (isPrivate && !user) {
                return (
                  <div key={p.id} style={{ border: '1.5px solid #e0e0e0', borderRadius: 12, overflow: 'hidden', background: '#f8f8f8', opacity: 0.7 }}>
                    <div style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ fontSize: 32 }}>🔒</div>
                      <div>
                        <div style={{ color: '#888', fontSize: 14, fontWeight: 700 }}>会員限定物件</div>
                        <div style={{ color: '#aaa', fontSize: 12, marginTop: 4 }}>会員登録すると詳細を確認できます</div>
                      </div>
                    </div>
                  </div>
                )
              }

              return (
                <div key={p.id} onClick={() => setSelected(p)}
                  style={{ border: `1.5px solid ${orange}`, borderRadius: 12, overflow: 'hidden', background: '#fff', cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)'}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
                  {imgSrc && (
                    <img src={imgSrc} alt={p.title || p.name} style={{ width: '100%', height: 180, objectFit: 'cover' }} />
                  )}
                  <div style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <span style={{ background: type.color, color: '#fff', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 4 }}>{type.label}</span>
                      {p.building_type && <span style={{ background: '#f0f0f0', color: '#555', fontSize: 11, padding: '2px 8px', borderRadius: 4 }}>{p.building_type}</span>}
                    </div>
                    <div style={{ color: navy, fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{p.title || p.name}</div>
                    {p.price && <div style={{ color: '#e74c3c', fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{Number(p.price).toLocaleString()}万円</div>}
                    {p.nearest_station && <div style={{ color: '#666', fontSize: 12 }}>🚃 {p.nearest_station}{p.walk_minutes ? `　徒歩${p.walk_minutes}分` : ''}</div>}
                    {p.address && <div style={{ color: '#888', fontSize: 12, marginTop: 2 }}>📍 {p.address}</div>}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* 詳細モーダル */}
      {selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
          onClick={() => setSelected(null)}>
          <div style={{ background: '#fff', borderRadius: '16px 16px 0 0', width: '100%', maxWidth: 600, maxHeight: '85vh', overflowY: 'auto', padding: 24 }}
            onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ color: navy, fontSize: 18, fontWeight: 700 }}>{selected.title || selected.name}</div>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#aaa' }}>✕</button>
            </div>
            {(selected.images || selected.image_urls || []).length > 0 && (
              <img src={(selected.images || selected.image_urls)[0]} alt="" style={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 8, marginBottom: 16 }} />
            )}
            {selected.price && <div style={{ color: '#e74c3c', fontSize: 20, fontWeight: 700, marginBottom: 12 }}>{Number(selected.price).toLocaleString()}万円</div>}
            {[
              { label: '所在地', value: selected.address },
              { label: '最寄り駅', value: selected.nearest_station && `${selected.nearest_station}${selected.walk_minutes ? `　徒歩${selected.walk_minutes}分` : ''}` },
              { label: '建物種別', value: selected.building_type },
              { label: '階数', value: selected.floor && `${selected.floor}階${selected.total_floors ? `／${selected.total_floors}階建` : ''}` },
              { label: '管理費', value: selected.management_fee && `${Number(selected.management_fee).toLocaleString()}円/月` },
            ].filter(f => f.value).map(f => (
              <div key={f.label} style={{ display: 'flex', padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
                <div style={{ color: '#888', fontSize: 13, width: 90 }}>{f.label}</div>
                <div style={{ color: navy, fontSize: 13, fontWeight: 600 }}>{f.value}</div>
              </div>
            ))}
            {selected.description && (
              <div style={{ marginTop: 16 }}>
                <div style={{ color: '#888', fontSize: 12, marginBottom: 6 }}>物件説明</div>
                <div style={{ color: '#333', fontSize: 13, lineHeight: 1.8 }}>{selected.description}</div>
              </div>
            )}
            <button
              onClick={() => { setSelected(null) }}
              style={{ width: '100%', marginTop: 20, padding: '14px', background: navy, color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
              GINTETSUに問い合わせる
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
