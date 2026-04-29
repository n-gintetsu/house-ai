import { useState, useEffect, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

const C = {
  navy: '#1a3a5c',
  gold: '#c9a84c',
  blue: '#2F6BFF',
  green: '#06C755',
  red: '#c0392b',
  bg: '#0a0a0a',
  card: '#1a1a1a',
  text: '#ffffff',
  muted: 'rgba(255,255,255,0.6)',
}

// AI評価バッジ
function AIBadge({ property }) {
  const price = property.price || 0

  const walk = property.walk_minutes ?? 10
  let grade, label, color
  if (walk <= 5 && price < 5000) { grade = 'S'; label = '掘り出し物'; color = '#06C755' }
  else if (walk <= 10) { grade = 'A'; label = '人気'; color = C.gold }
  else if (walk <= 15) { grade = 'B'; label = '標準'; color = C.blue }
  else { grade = 'C'; label = '要確認'; color = '#888' }

  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      <span style={{ background: color, color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6 }}>
        AI {grade} {label}
      </span>
      {walk <= 5 && (
        <span style={{ background: 'rgba(6,199,85,0.2)', color: '#06C755', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6, border: '1px solid #06C755' }}>
          駅近
        </span>
      )}
    </div>
  )
}

// AI評価パネル
function AIPanel({ property, onClose, onChat }) {
  const price = property.price || 0

  const priceScore = price < 3000 ? 5 : price < 5000 ? 4 : price < 8000 ? 3 : price < 12000 ? 2 : 1
  const walkScore = 3
  const overallScore = Math.round((priceScore + walkScore) / 2)

  const stars = (n) => '★'.repeat(n) + '☆'.repeat(5 - n)

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'flex-end' }}
      onClick={onClose}>
      <div style={{ background: '#1a1a1a', borderRadius: '20px 20px 0 0', padding: '24px 20px 32px', width: '100%', maxWidth: 480, margin: '0 auto' }}
        onClick={e => e.stopPropagation()}>
        <div style={{ width: 40, height: 4, background: '#444', borderRadius: 2, margin: '0 auto 20px' }} />
        <p style={{ color: C.gold, fontSize: 13, fontWeight: 700, margin: '0 0 4px' }}>🤖 AI評価レポート</p>
        <p style={{ color: '#fff', fontSize: 16, fontWeight: 700, margin: '0 0 20px' }}>{property.title || property.property_name || '物件名未設定'}</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
          {[
            { label: '総合評価', score: overallScore, comment: overallScore >= 4 ? 'おすすめ物件です' : '標準的な物件です' },
            { label: '価格評価', score: priceScore, comment: priceScore >= 4 ? '相場より割安' : '相場並み' },
            { label: '立地評価', score: walkScore, comment: `駅徒歩${walk}分` },
          ].map((item) => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ color: C.muted, fontSize: 12, width: 70, flexShrink: 0 }}>{item.label}</span>
              <span style={{ color: C.gold, fontSize: 14, letterSpacing: 2 }}>{stars(item.score)}</span>
              <span style={{ color: '#aaa', fontSize: 11 }}>{item.comment}</span>
            </div>
          ))}
        </div>

        <div style={{ background: 'rgba(47,107,255,0.15)', border: '1px solid rgba(47,107,255,0.3)', borderRadius: 10, padding: '10px 14px', marginBottom: 16 }}>
          <p style={{ color: C.blue, fontSize: 12, fontWeight: 600, margin: 0 }}>
            🎯 推奨アクション：{overallScore >= 4 ? 'すぐに内見予約を！人気物件は早い者勝ちです。' : 'AIに詳細を確認してから判断しましょう。'}
          </p>
        </div>

        <button onClick={onChat} style={{ width: '100%', background: C.navy, color: '#fff', border: 'none', borderRadius: 12, padding: '14px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
          💬 この物件をAIに相談する
        </button>
      </div>
    </div>
  )
}

// 物件カード（1画面1物件）
function PropertyCard({ property, onChat, onSave, saved, isActive }) {
  const [showAI, setShowAI] = useState(false)
  const typeLabel = property.property_type === 'sale' ? '売買' : property.property_type === 'rent' ? '賃貸' : '物件'
  const typeColor = property.property_type === 'sale' ? '#e74c3c' : '#27ae60'

  const imageUrl = property.images?.[0] ||
    property.image_url ||
    `https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80`

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh', background: C.bg, flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
      {/* 物件画像 */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <img src={imageUrl} alt={property.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80' }}
        />
        {/* グラデーションオーバーレイ */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0.7) 70%, rgba(0,0,0,0.95) 100%)' }} />

        {/* 上部：種別バッジ */}
        <div style={{ position: 'absolute', top: 16, left: 16, display: 'flex', gap: 8 }}>
          <span style={{ background: typeColor, color: '#fff', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20 }}>{typeLabel}</span>
        </div>

        {/* 右側：アクションボタン */}
        <div style={{ position: 'absolute', right: 16, bottom: 120, display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
          {/* 保存 */}
          <button onClick={() => onSave(property.id)}
            style={{ background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', width: 48, height: 48, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
            <span style={{ fontSize: 22 }}>{saved ? '❤️' : '🤍'}</span>
            <span style={{ color: '#fff', fontSize: 9 }}>保存</span>
          </button>

          {/* AI評価 */}
          <button onClick={() => setShowAI(true)}
            style={{ background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', width: 48, height: 48, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
            <span style={{ fontSize: 20 }}>🤖</span>
            <span style={{ color: '#fff', fontSize: 9 }}>AI評価</span>
          </button>

          {/* シェア */}
          <button onClick={() => navigator.share?.({ title: property.title, url: window.location.href })}
            style={{ background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', width: 48, height: 48, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
            <span style={{ fontSize: 20 }}>↗️</span>
            <span style={{ color: '#fff', fontSize: 9 }}>シェア</span>
          </button>
        </div>

        {/* 下部：物件情報 */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '16px 16px 8px' }}>
          <AIBadge property={property} />
          <h2 style={{ color: '#fff', fontSize: 18, fontWeight: 700, margin: '8px 0 4px', lineHeight: 1.3 }}>
            {property.title || property.property_name || '物件名未設定'}
          </h2>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
            <span style={{ color: C.gold, fontSize: 24, fontWeight: 700 }}>
              {property.price ? `${property.price.toLocaleString()}万円` : property.rent ? `¥${property.rent.toLocaleString()}/月` : '価格未定'}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {property.address && <span style={{ color: C.muted, fontSize: 12 }}>📍 {property.address}</span>}
            {property.layout && <span style={{ color: C.muted, fontSize: 12 }}>🏠 {property.layout}</span>}
            {property.area && <span style={{ color: C.muted, fontSize: 12 }}>📐 {property.area}㎡</span>}
          </div>
        </div>
      </div>

      {/* 下部CTA */}
      <div style={{ background: '#0a0a0a', padding: '12px 16px 20px', display: 'flex', gap: 10 }}>
        <button onClick={() => onChat(property)}
          style={{ flex: 2, background: C.navy, color: '#fff', border: 'none', borderRadius: 12, padding: '14px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
          💬 この物件をAIに相談
        </button>
        <button onClick={() => setShowAI(true)}
          style={{ flex: 1, background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 12, padding: '14px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          🤖 AI評価
        </button>
      </div>

      {showAI && <AIPanel property={property} onClose={() => setShowAI(false)} onChat={() => { setShowAI(false); onChat(property); }} />}
    </div>
  )
}

// メイン
export default function PropertiesPage({ user, onNavigate }) {
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [saved, setSaved] = useState(new Set())
  const [filter, setFilter] = useState('all')
  const [viewMode, setViewMode] = useState('swipe') // swipe or list
  const containerRef = useRef(null)
  const touchStartY = useRef(null)

  useEffect(() => { fetchProperties() }, [filter])

  const fetchProperties = async () => {
    setLoading(true)
    let query = supabase.from('properties').select('*').eq('status', 'published').order('created_at', { ascending: false })
    if (filter !== 'all') query = query.eq('property_type', filter)
    const { data } = await query
    setProperties(data || [])
    setCurrentIndex(0)
    setLoading(false)
  }

  const handleSave = (id) => {
    setSaved(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const handleChat = (property) => {
    onNavigate && onNavigate('chat')
  }

  // タッチスワイプ
  const handleTouchStart = (e) => { touchStartY.current = e.touches[0].clientY }
  const handleTouchEnd = (e) => {
    if (!touchStartY.current) return
    const diff = touchStartY.current - e.changedTouches[0].clientY
    if (diff > 50 && currentIndex < properties.length - 1) setCurrentIndex(i => i + 1)
    if (diff < -50 && currentIndex > 0) setCurrentIndex(i => i - 1)
    touchStartY.current = null
  }

  // キーボード操作
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowDown' && currentIndex < properties.length - 1) setCurrentIndex(i => i + 1)
      if (e.key === 'ArrowUp' && currentIndex > 0) setCurrentIndex(i => i - 1)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [currentIndex, properties.length])

  if (loading) return (
    <div style={{ background: C.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#fff', fontSize: 14 }}>読み込み中...</p>
    </div>
  )

  return (
    <div style={{ background: C.bg, minHeight: '100vh', position: 'relative' }}>
      {/* ヘッダー */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(to bottom, rgba(0,0,0,0.7), transparent)' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {[
            { key: 'back', label: '← 戻る' },
              { key: 'all', label: 'すべて' },
            { key: 'sale', label: '売買' },
            { key: 'rent', label: '賃貸' },
          ].map(f => (
            <button key={f.key} onClick={() => f.key === 'back' ? onNavigate && onNavigate('home') : setFilter(f.key)}
              style={{ padding: '5px 12px', background: filter === f.key ? '#fff' : 'rgba(255,255,255,0.85)', color: filter === f.key ? C.navy : C.navy, border: 'none', borderRadius: 20, fontSize: 12, fontWeight: filter === f.key ? 700 : 400, cursor: 'pointer' }}>
              {f.label}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>{currentIndex + 1} / {properties.length}</span>
          <button onClick={() => setViewMode(v => v === 'swipe' ? 'list' : 'swipe')} style={{ padding: '5px 12px', background: '#fff', color: '#1a3a5c', border: 'none', borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
            {viewMode === 'swipe' ? '一覧' : 'スワイプ'}
          </button>
        </div>
      </div>

      {properties.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', color: '#fff', gap: 12 }}>
          <div style={{ fontSize: 48 }}>🏠</div>
          <p style={{ fontSize: 16, fontWeight: 700 }}>掲載中の物件はありません</p>
          <p style={{ fontSize: 13, color: C.muted }}>フィルターを変えて探してみましょう</p>
        </div>
      ) : viewMode === 'swipe' ? (
        /* スワイプUI */
        <div ref={containerRef} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}
          style={{ overflow: 'hidden', height: '100vh' }}>
          <div style={{ transform: `translateY(-${currentIndex * 100}vh)`, transition: 'transform 0.35s cubic-bezier(0.4,0,0.2,1)' }}>
            {properties.map((p, i) => (
              <PropertyCard key={p.id} property={p} onChat={handleChat} onSave={handleSave} saved={saved.has(p.id)} isActive={i === currentIndex} />
            ))}
          </div>
          {/* スワイプヒント */}
          {currentIndex === 0 && properties.length > 1 && (
            <div style={{ position: 'fixed', bottom: 90, left: '50%', transform: 'translateX(-50%)', color: 'rgba(255,255,255,0.5)', fontSize: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, pointerEvents: 'none' }}>
              <span style={{ fontSize: 20, animation: 'bounce 1s infinite' }}>↕</span>
              <span>スワイプして次の物件へ</span>
              <style>{`@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}`}</style>
            </div>
          )}
        </div>
      ) : (
        /* 一覧UI */
        <div style={{ paddingTop: 60, paddingBottom: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12, padding: '0 12px' }}>
            {properties.map((p) => (
              <div key={p.id} style={{ background: '#1a1a1a', borderRadius: 14, overflow: 'hidden', cursor: 'pointer' }}
                onClick={() => { setCurrentIndex(properties.indexOf(p)); setViewMode('swipe'); }}>
                <img src={p.images?.[0] || p.image_url || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&q=80'}
                  style={{ width: '100%', height: 160, objectFit: 'cover' }}
                  onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&q=80' }}
                  alt={p.title} />
                <div style={{ padding: '12px' }}>
                  <p style={{ color: '#fff', fontSize: 14, fontWeight: 700, margin: '0 0 4px' }}>{p.title || '物件名未設定'}</p>
                  <p style={{ color: C.gold, fontSize: 16, fontWeight: 700, margin: '0 0 6px' }}>
                    {p.price ? `${p.price.toLocaleString()}万円` : p.rent ? `¥${p.rent.toLocaleString()}/月` : '価格未定'}
                  </p>
                  <AIBadge property={p} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
