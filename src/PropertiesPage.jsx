import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { AffiliateCard } from './AffiliateCard'
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

function calcAIScore(property) {
  const price = property.price || 0
  const rent = property.rent || 0
  const walk = property.walk_minutes ?? 12
  const address = property.address || ''

  let priceScore = 3
  if (property.property_type === 'sale') {
    if (price < 2000) priceScore = 5
    else if (price < 4000) priceScore = 4
    else if (price < 7000) priceScore = 3
    else if (price < 10000) priceScore = 2
    else priceScore = 1
  } else {
    const rentMan = rent / 10000
    if (rentMan < 5) priceScore = 5
    else if (rentMan < 8) priceScore = 4
    else if (rentMan < 12) priceScore = 3
    else if (rentMan < 18) priceScore = 2
    else priceScore = 1
  }

  let walkScore = 3
  if (walk <= 5) walkScore = 5
  else if (walk <= 10) walkScore = 4
  else if (walk <= 15) walkScore = 3
  else if (walk <= 20) walkScore = 2
  else walkScore = 1

  let futureScore = 3
  const highGrowth = ['大宮', '浦和', '川口', '武蔵浦和', '与野', 'さいたま']
  const midGrowth = ['蕨', '戸田', '草加', '越谷', '春日部', '所沢']
  if (highGrowth.some(k => address.includes(k))) futureScore = 5
  else if (midGrowth.some(k => address.includes(k))) futureScore = 4

  const overall = Math.round((priceScore * 0.4 + walkScore * 0.4 + futureScore * 0.2))

  let grade, gradeColor
  if (overall >= 5) { grade = 'S'; gradeColor = '#06C755' }
  else if (overall >= 4) { grade = 'A'; gradeColor = C.gold }
  else if (overall >= 3) { grade = 'B'; gradeColor = C.blue }
  else { grade = 'C'; gradeColor = '#888' }

  const badges = []
  if (overall >= 5 && walkScore >= 4) badges.push({ label: '掘り出し物', color: '#06C755' })
  if (overall >= 4) badges.push({ label: '人気', color: C.gold })
  if (walkScore >= 5) badges.push({ label: '駅近', color: '#06C755' })
  if (property.property_type === 'sale' && price >= 10000) badges.push({ label: '投資向け', color: C.blue })
  if (overall <= 2) badges.push({ label: '要確認', color: '#888' })
  if (priceScore >= 5) badges.push({ label: '初心者向け', color: '#9b59b6' })

  let action = 'AIに詳細を確認してから判断しましょう。'
  if (overall >= 5) action = 'すぐに内見予約を！人気物件は早い者勝ちです。'
  else if (overall >= 4) action = '条件が良い物件です。早めの検討をおすすめします。'
  else if (overall >= 3) action = '標準的な物件です。他の物件と比較してみましょう。'

  const comments = {
    price: priceScore >= 4 ? '相場より割安でお得です' : priceScore === 3 ? '相場並みの価格帯です' : '相場より割高な傾向です',
    walk: walkScore >= 5 ? '駅徒歩5分以内！利便性抜群' : walkScore === 4 ? '駅10分以内で便利な立地' : walkScore === 3 ? '駅徒歩15分以内' : '駅から少し距離があります',
    future: futureScore >= 5 ? '再開発・発展エリアで将来性高い' : futureScore === 4 ? '安定した人気エリア' : '将来性は標準的なエリア',
  }

  return { priceScore, walkScore, futureScore, overall, grade, gradeColor, badges, action, comments, walk }
}

function AIBadge({ property }) {
  const { grade, gradeColor, badges } = calcAIScore(property)
  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      <span style={{ background: gradeColor, color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6 }}>
        AI {grade}
      </span>
      {badges.slice(0, 2).map((b, i) => (
        <span key={i} style={{ background: 'rgba(255,255,255,0.15)', color: b.color, fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6, border: `1px solid ${b.color}` }}>
          {b.label}
        </span>
      ))}
    </div>
  )
}

function AIPanel({ property, onClose, onChat }) {
  const { priceScore, walkScore, futureScore, overall, grade, gradeColor, badges, action, comments } = calcAIScore(property)
  const stars = (n) => '★'.repeat(n) + '☆'.repeat(5 - n)

  return createPortal(
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 99999, display: 'flex', alignItems: 'flex-end' }}
      onClick={onClose}>
      <div style={{ background: '#1a1a1a', borderRadius: '20px 20px 0 0', padding: '24px 20px 32px', width: '100%', boxSizing: 'border-box' }}
        onClick={e => e.stopPropagation()}>
        <div style={{ width: 40, height: 4, background: '#444', borderRadius: 2, margin: '0 auto 20px' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{ background: gradeColor, borderRadius: 12, width: 52, height: 52, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ color: '#fff', fontSize: 22, fontWeight: 900 }}>{grade}</span>
          </div>
          <div>
            <p style={{ color: C.gold, fontSize: 12, fontWeight: 700, margin: '0 0 2px' }}>AI評価レポート</p>
            <p style={{ color: '#fff', fontSize: 15, fontWeight: 700, margin: 0, lineHeight: 1.3 }}>{property.title || '物件名未設定'}</p>
          </div>
        </div>
        {badges.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
            {badges.map((b, i) => (
              <span key={i} style={{ background: 'rgba(255,255,255,0.1)', color: b.color, fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20, border: `1px solid ${b.color}` }}>
                {b.label}
              </span>
            ))}
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
          {[
            { label: '総合評価', score: overall, comment: overall >= 4 ? 'おすすめ物件' : overall === 3 ? '標準的な物件' : '慎重に検討を' },
            { label: '価格評価', score: priceScore, comment: comments.price },
            { label: '立地評価', score: walkScore, comment: comments.walk },
            { label: '将来性', score: futureScore, comment: comments.future },
          ].map((item) => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ color: C.muted, fontSize: 12, width: 68, flexShrink: 0 }}>{item.label}</span>
              <span style={{ color: C.gold, fontSize: 13, letterSpacing: 1, flexShrink: 0 }}>{stars(item.score)}</span>
              <span style={{ color: '#aaa', fontSize: 11, lineHeight: 1.4 }}>{item.comment}</span>
            </div>
          ))}
        </div>
        <div style={{ background: '#ffffff', border: '1px solid #c9a84c', borderRadius: 10, padding: '10px 14px', marginBottom: 16 }}>
          <p style={{ color: C.blue, fontSize: 12, fontWeight: 600, margin: 0 }}>
            推奨アクション：{action}
          </p>
        </div>
        <button onClick={onChat} style={{ width: '100%', background: C.navy, color: '#fff', border: 'none', borderRadius: 12, padding: '14px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
          この物件をAIに相談する
        </button>
      </div>
    </div>,
    document.body
  )
}

function CompareBar({ compareList, onOpen, onRemove }) {
  if (compareList.length === 0) return null
  return (
    <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 200, background: '#1a3a5c', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', overflow: 'hidden' }}>
        <span style={{ color: '#c9a84c', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{compareList.length}件比較中</span>
        <div style={{ display: 'flex', gap: 6 }}>
          {compareList.map((p) => (
            <div key={p.id} style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 6, padding: '3px 8px', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ color: '#fff', fontSize: 11, maxWidth: 70, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {p.title || '物件'}
              </span>
              <button onClick={() => onRemove(p.id)}
                style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', fontSize: 12, cursor: 'pointer', padding: 0, lineHeight: 1 }}>✕</button>
            </div>
          ))}
        </div>
      </div>
      <button onClick={onOpen}
        style={{ background: '#c9a84c', color: '#1a3a5c', border: 'none', borderRadius: 20, padding: '8px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>
        比較する →
      </button>
    </div>
  )
}

function CompareModal({ compareList, onClose, onChat }) {
  const stars = (n) => '★'.repeat(n) + '☆'.repeat(5 - n)
  const scores = compareList.map(p => calcAIScore(p))
  const bestIdx = scores.reduce((best, s, i) => s.overall > scores[best].overall ? i : best, 0)

  const rows = [
    { label: 'AI評価', render: (p, s) => (
      <span style={{ background: s.gradeColor, color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6 }}>{s.grade}</span>
    )},
    { label: '価格', render: (p, s) => (
      <div>
        <div style={{ color: '#c9a84c', fontSize: 11 }}>{stars(s.priceScore)}</div>
        <div style={{ color: '#ddd', fontSize: 10 }}>{p.price ? `${p.price.toLocaleString()}万円` : p.rent ? `¥${p.rent.toLocaleString()}/月` : '未定'}</div>
      </div>
    )},
    { label: '立地', render: (p, s) => (
      <div>
        <div style={{ color: '#c9a84c', fontSize: 11 }}>{stars(s.walkScore)}</div>
        <div style={{ color: '#ddd', fontSize: 10 }}>{s.comments.walk.slice(0, 10)}</div>
      </div>
    )},
    { label: '将来性', render: (p, s) => (
      <div>
        <div style={{ color: '#c9a84c', fontSize: 11 }}>{stars(s.futureScore)}</div>
        <div style={{ color: '#ddd', fontSize: 10 }}>{s.comments.future.slice(0, 10)}</div>
      </div>
    )},
    { label: '間取り', render: (p) => <span style={{ color: '#fff', fontSize: 12, fontWeight: 600 }}>{p.layout || '-'}</span> },
    { label: '面積', render: (p) => <span style={{ color: '#fff', fontSize: 12, fontWeight: 600 }}>{p.area ? `${p.area}m2` : '-'}</span> },
    { label: 'エリア', render: (p) => <span style={{ color: '#ddd', fontSize: 10, lineHeight: 1.4 }}>{p.address ? p.address.slice(0, 12) : '-'}</span> },
  ]

  return createPortal(
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 99999, display: 'flex', alignItems: 'flex-end' }}
      onClick={onClose}>
      <div style={{ background: '#111', borderRadius: '20px 20px 0 0', width: '100%', maxWidth: 600, margin: '0 auto', maxHeight: '85vh', overflowY: 'auto' }}
        onClick={e => e.stopPropagation()}>
        <div style={{ width: 40, height: 4, background: '#444', borderRadius: 2, margin: '12px auto 0' }} />
        <div style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '0.5px solid #333' }}>
          <p style={{ color: '#fff', fontSize: 15, fontWeight: 700, margin: 0 }}>物件比較</p>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#888', fontSize: 20, cursor: 'pointer' }}>✕</button>
        </div>
        <div style={{ padding: '12px 12px 24px' }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <div style={{ width: 44 }} />
            {compareList.map((p, i) => (
              <div key={p.id} style={{ flex: 1, background: i === bestIdx ? 'rgba(201,168,76,0.15)' : '#1a1a1a', border: i === bestIdx ? '1.5px solid #c9a84c' : '1px solid #333', borderRadius: 10, padding: '18px 6px 8px', textAlign: 'center', position: 'relative', marginTop: i === bestIdx ? 12 : 0 }}>
                {i === bestIdx && (
                  <div style={{ position: 'absolute', top: -20, left: '50%', transform: 'translateX(-50%)', background: '#c9a84c', color: '#1a3a5c', fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 10, whiteSpace: 'nowrap', zIndex: 1 }}>
                    AIおすすめ
                  </div>
                )}
                <p style={{ color: '#fff', fontSize: 10, fontWeight: 700, margin: '0 0 2px', lineHeight: 1.3 }}>
                  {(p.title || '物件').slice(0, 12)}
                </p>
                <p style={{ color: '#c9a84c', fontSize: 11, fontWeight: 700, margin: 0 }}>
                  {p.price ? `${p.price.toLocaleString()}万` : p.rent ? `${(p.rent / 10000).toFixed(1)}万/月` : '未定'}
                </p>
              </div>
            ))}
          </div>
          {rows.map((row) => (
            <div key={row.label} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', borderBottom: '0.5px solid #333' }}>
              <span style={{ color: '#ccc', fontSize: 11, width: 44, flexShrink: 0 }}>{row.label}</span>
              {compareList.map((p, i) => (
                <div key={p.id} style={{ flex: 1, textAlign: 'center', background: i === bestIdx ? 'rgba(201,168,76,0.05)' : 'transparent', borderRadius: 6, padding: '4px 2px' }}>
                  {row.render(p, scores[i])}
                </div>
              ))}
            </div>
          ))}
          <div style={{ background: 'rgba(47,107,255,0.12)', border: '1px solid rgba(47,107,255,0.3)', borderRadius: 10, padding: '10px 12px', margin: '12px 0' }}>
            <p style={{ color: '#2F6BFF', fontSize: 12, fontWeight: 700, margin: '0 0 4px' }}>AI総評</p>
            <p style={{ color: '#ddd', fontSize: 12, margin: 0, lineHeight: 1.6 }}>
              {compareList[bestIdx] ? compareList[bestIdx].title || '物件' : ''}が総合スコア{scores[bestIdx] ? scores[bestIdx].overall : ''}点でトップです。{scores[bestIdx] ? scores[bestIdx].action : ''}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {compareList.map((p, i) => (
              <button key={p.id} onClick={() => { onClose(); onChat(p) }}
                style={{ flex: 1, background: i === bestIdx ? '#1a3a5c' : 'rgba(255,255,255,0.08)', color: '#fff', border: 'none', borderRadius: 10, padding: '12px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                {i === bestIdx ? '👑 ' : ''}{(p.title || '物件').slice(0, 8)}をAI相談
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}

function PropertyCard({ property, onChat, onSave, saved, isActive, onCompare, inCompare }) {
  const [showAI, setShowAI] = useState(false)
  const typeLabel = property.property_type === 'sale' ? '売買' : property.property_type === 'rent' ? '賃貸' : '物件'
  const typeColor = property.property_type === 'sale' ? '#e74c3c' : '#27ae60'
  const imageUrl = property.images?.[0] || property.image_url || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80'

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh', background: C.bg, flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <img src={imageUrl} alt={property.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0.7) 70%, rgba(0,0,0,0.95) 100%)' }} />
        <div style={{ position: 'absolute', top: 16, left: 16, display: 'flex', gap: 8 }}>
          <span style={{ background: typeColor, color: '#fff', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20 }}>{typeLabel}</span>
        </div>
        <div style={{ position: 'absolute', right: 16, bottom: 120, display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center' }}>
          <button onClick={() => onSave(property.id)}
            style={{ background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', width: 48, height: 48, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
            <span style={{ fontSize: 22 }}>{saved ? '❤️' : '🤍'}</span>
            <span style={{ color: '#fff', fontSize: 9 }}>保存</span>
          </button>
          <button onClick={() => setShowAI(true)}
            style={{ background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', width: 48, height: 48, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
            <span style={{ fontSize: 20 }}>🤖</span>
            <span style={{ color: '#fff', fontSize: 9 }}>AI評価</span>
          </button>
          <button onClick={() => onCompare && onCompare(property)}
            style={{ background: inCompare ? 'rgba(201,168,76,0.9)' : 'rgba(0,0,0,0.5)', border: inCompare ? '1.5px solid #c9a84c' : 'none', borderRadius: '50%', width: 48, height: 48, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
            <span style={{ color: '#fff', fontSize: 18 }}>{inCompare ? '✓' : '⊕'}</span>
            <span style={{ color: '#fff', fontSize: 9 }}>比較</span>
          </button>
          <button onClick={() => navigator.share?.({ title: property.title, url: window.location.href })}
            style={{ background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', width: 48, height: 48, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
            <span style={{ fontSize: 20 }}>↗️</span>
            <span style={{ color: '#fff', fontSize: 9 }}>シェア</span>
          </button>
        </div>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '16px 16px 8px' }}>
          <AIBadge property={property} />
          <h2 style={{ color: '#fff', fontSize: 18, fontWeight: 700, margin: '8px 0 4px', lineHeight: 1.3 }}>
            {property.title || '物件名未設定'}
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
      <div style={{ background: '#0a0a0a', padding: '12px 16px 20px', display: 'flex', gap: 10 }}>
        <button onClick={() => onChat(property)}
          style={{ flex: 2, background: C.navy, color: '#fff', border: 'none', borderRadius: 12, padding: '14px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
          💬 この物件をAIに相談
        </button>
        <button onClick={() => setShowAI(true)}
          style={{ flex: 1, background: 'rgba(255,255,255,0.18)', color: '#fff', border: '1px solid rgba(255,255,255,0.5)', borderRadius: 12, padding: '14px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          🤖 AI評価
        </button>
      </div>
      {showAI && <AIPanel property={property} onClose={() => setShowAI(false)} onChat={() => { setShowAI(false); onChat(property) }} />}
    </div>
  )
}

export default function PropertiesPage({ user, onNavigate }) {
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [saved, setSaved] = useState(new Set())
  const [filter, setFilter] = useState('all')
  const [viewMode, setViewMode] = useState('swipe')
  const [compareList, setCompareList] = useState([])
  const [showCompare, setShowCompare] = useState(false)
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 768)
  const containerRef = useRef(null)
  const touchStartY = useRef(null)
  const mouseStartY = useRef(null)
  const isDragging = useRef(false)

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

  const handleCompare = (property) => {
    setCompareList(prev => {
      if (prev.find(p => p.id === property.id)) return prev.filter(p => p.id !== property.id)
      if (prev.length >= 3) return prev
      return [...prev, property]
    })
  }

  const handleRemoveCompare = (id) => {
    setCompareList(prev => prev.filter(p => p.id !== id))
  }

  const handleChat = () => { onNavigate && onNavigate('chat') }

  const handleMouseDown = (e) => { mouseStartY.current = e.clientY; isDragging.current = true }
  const handleMouseUp = (e) => {
    if (!isDragging.current || mouseStartY.current === null) return
    const diff = mouseStartY.current - e.clientY
    if (diff < -50 && currentIndex < properties.length - 1) setCurrentIndex(i => i + 1)
    if (diff > 50 && currentIndex > 0) setCurrentIndex(i => i - 1)
    mouseStartY.current = null
    isDragging.current = false
  }

  const handleTouchStart = (e) => { touchStartY.current = e.touches[0].clientY }
  const handleTouchEnd = (e) => {
    if (!touchStartY.current) return
    const diff = touchStartY.current - e.changedTouches[0].clientY
    if (diff > 50 && currentIndex < properties.length - 1) setCurrentIndex(i => i + 1)
    if (diff < -50 && currentIndex > 0) setCurrentIndex(i => i - 1)
    touchStartY.current = null
  }

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowDown' && currentIndex < properties.length - 1) setCurrentIndex(i => i + 1)
      if (e.key === 'ArrowUp' && currentIndex > 0) setCurrentIndex(i => i - 1)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [currentIndex, properties.length])

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  if (loading) return (
    <div style={{ background: C.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#fff', fontSize: 14 }}>読み込み中...</p>
    </div>
  )

  if (isMobile) {
    if (properties.length === 0) return (
      <div style={{ background: '#eef3f8', minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#14395b', gap: 12 }}>
        <div style={{ fontSize: 48 }}>🏠</div>
        <p style={{ fontSize: 16, fontWeight: 700 }}>掲載中の物件はありません</p>
        <p style={{ fontSize: 13, color: '#64748b' }}>フィルターを変えて探してみましょう</p>
      </div>
    )
    return (
      <>
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, padding: '12px 16px', display: 'flex', gap: 8, background: 'linear-gradient(to bottom, rgba(0,0,0,0.55), transparent)' }}>
          <button onClick={() => onNavigate?.('home')} style={{ padding: '5px 12px', background: 'rgba(255,255,255,0.85)', color: '#1a3a5c', border: 'none', borderRadius: 20, fontSize: 12, cursor: 'pointer' }}>← 戻る</button>
          {['all', 'sale', 'rent'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ padding: '5px 12px', background: filter === f ? '#fff' : 'rgba(255,255,255,0.85)', color: '#1a3a5c', border: 'none', borderRadius: 20, fontSize: 12, fontWeight: filter === f ? 700 : 400, cursor: 'pointer' }}>
              {f === 'all' ? 'すべて' : f === 'sale' ? '売買' : '賃貸'}
            </button>
          ))}
        </div>
        <div className="property-feed">
          {properties.map(p => {
            const imageUrl = p.images?.[0] || p.image_url || null
            const typeLabel = p.property_type === 'sale' ? '売買' : p.property_type === 'rent' ? '賃貸' : '物件'
            const { grade, gradeColor } = calcAIScore(p)
            const inCompare = !!compareList.find(c => c.id === p.id)
            return (
              <div key={p.id} className="property-slide">
                <div className="property-image-wrap">
                  {imageUrl ? (
                    <img className="property-image" src={imageUrl} alt={p.title}
                      onError={e => { e.target.src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80' }} />
                  ) : (
                    <div className="property-no-image"><div>🏠<br />画像なし</div></div>
                  )}
                  <div className="property-actions">
                    <button onClick={() => handleSave(p.id)}>{saved.has(p.id) ? '❤️' : '🤍'}</button>
                    <button onClick={() => handleCompare(p)}>{inCompare ? '✓' : '⊕'}</button>
                    <button onClick={() => navigator.share?.({ title: p.title, url: window.location.href })}>↗️</button>
                  </div>
                  <div className="property-info">
                    <div className="property-tags">
                      <span>{typeLabel}</span>
                      <span style={{ background: gradeColor, color: '#fff' }}>AI {grade}</span>
                    </div>
                    <h3>{p.title || '物件名未設定'}</h3>
                    <div style={{ color: '#c9a84c', fontSize: 20, fontWeight: 700 }}>
                      {p.price ? `${p.price.toLocaleString()}万円` : p.rent ? `¥${p.rent.toLocaleString()}/月` : '価格未定'}
                    </div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>
                      {[p.address && `📍 ${p.address}`, p.layout && `🏠 ${p.layout}`, p.area && `📐 ${p.area}㎡`].filter(Boolean).join('  ')}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        <button className="property-fixed-cta" onClick={handleChat}>💬 AIに相談する</button>
        <CompareBar compareList={compareList} onOpen={() => setShowCompare(true)} onRemove={handleRemoveCompare} />
        {showCompare && <CompareModal compareList={compareList} onClose={() => setShowCompare(false)} onChat={handleChat} />}
      </>
    )
  }

  return (
    <div style={{ background: C.bg, minHeight: '100vh', position: 'relative' }}>
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(to bottom, rgba(0,0,0,0.7), transparent)' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {[
            { key: 'back', label: '← 戻る' },
            { key: 'all', label: 'すべて' },
            { key: 'sale', label: '売買' },
            { key: 'rent', label: '賃貸' },
          ].map(f => (
            <button key={f.key} onClick={() => f.key === 'back' ? onNavigate && onNavigate('home') : setFilter(f.key)}
              style={{ padding: '5px 12px', background: filter === f.key ? '#fff' : 'rgba(255,255,255,0.85)', color: C.navy, border: 'none', borderRadius: 20, fontSize: 12, fontWeight: filter === f.key ? 700 : 400, cursor: 'pointer' }}>
              {f.label}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>{currentIndex + 1} / {properties.length}</span>
          <button onClick={() => setViewMode(v => v === 'swipe' ? 'list' : 'swipe')}
            style={{ padding: '5px 12px', background: '#fff', color: C.navy, border: 'none', borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
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
        <div ref={containerRef} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd} onMouseDown={handleMouseDown} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}
          style={{ overflow: 'hidden', height: '100vh', paddingTop: 0 }}>
          <div style={{ transform: `translateY(-${currentIndex * 100}vh)`, transition: 'transform 0.35s cubic-bezier(0.4,0,0.2,1)' }}>
            {properties.map((p, i) => (
              <PropertyCard key={p.id} property={p} onChat={handleChat} onSave={handleSave} saved={saved.has(p.id)} isActive={i === currentIndex}
                onCompare={handleCompare} inCompare={!!compareList.find(c => c.id === p.id)} />
            ))}
          </div>
          {currentIndex === 0 && properties.length > 1 && (
            <div style={{ position: 'fixed', bottom: 90, left: '50%', transform: 'translateX(-50%)', color: 'rgba(255,255,255,0.5)', fontSize: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, pointerEvents: 'none' }}>
              <span style={{ fontSize: 20, animation: 'bounce 1s infinite' }}>↕</span>
              <span>スワイプして次の物件へ</span>
              <style>{`@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}`}</style>
            </div>
          )}
        </div>
      ) : (
        <div style={{ paddingTop: 60, paddingBottom: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12, padding: '0 12px' }}>
            {properties.map((p) => (
              <div key={p.id} style={{ background: '#1a1a1a', borderRadius: 14, overflow: 'hidden', cursor: 'pointer' }}
                onClick={() => { setCurrentIndex(properties.indexOf(p)); setViewMode('swipe') }}>
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
                  {properties.indexOf(p) === 1 && (
                    <div style={{ marginTop: 8 }}>
                      <AffiliateCard type="insurance" reason="物件購入時に確認を" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <CompareBar compareList={compareList} onOpen={() => setShowCompare(true)} onRemove={handleRemoveCompare} />
      {showCompare && <CompareModal compareList={compareList} onClose={() => setShowCompare(false)} onChat={handleChat} />}
    </div>
  )
}
