import { useState, useEffect, useRef } from 'react'
import { motion } from 'motion/react'
import { Heart, MessageCircle, Share2, MapPin, TrendingUp, Building2, Bot, SkipBack, SkipForward, Play, Pause } from 'lucide-react'
import { supabase } from './lib/supabase'

const dummyProperties = [
  { id:1, image:'/properties/sample1.jpg', location:'さいたま市大宮区', title:'大宮駅3分 新築3LDK', aiInsight:'駅近で資産価値が高く、ファミリー層に人気のエリアです。', likes:24, comments:8, agentName:'GINTETSU', trend:'人気急上昇' },
  { id:2, image:'/properties/sample2.jpg', location:'さいたま市浦和区', title:'浦和駅5分 リノベ2LDK', aiInsight:'リノベ済みで即入居可能。周辺の成約価格も安定しています。', likes:18, comments:5, agentName:'GINTETSU', trend:'価格下落中' },
  { id:3, image:'/properties/sample3.jpg', location:'川口市', title:'収益マンション 利回り6.2%', aiInsight:'満室稼働中。キャッシュフロー安定型の投資物件です。', likes:31, comments:12, agentName:'GINTETSU', trend:'投資向け' },
  { id:4, image:'/properties/sample4.jpg', location:'さいたま市中央区', title:'与野本町駅8分 戸建4LDK', aiInsight:'広い庭付きで子育て環境が抜群。近隣小学校の評判も高いです。', likes:15, comments:3, agentName:'GINTETSU', trend:'ファミリー向け' },
  { id:5, image:'/properties/sample5.jpg', location:'蕨市', title:'蕨駅4分 築浅1LDK', aiInsight:'単身者・投資両用。東京都心へのアクセスも良好です。', likes:9, comments:2, agentName:'GINTETSU', trend:'単身向け' },
]

const CARD_W = 300

export default function PropertyFeedCarousel({ properties: propsProp, user, onNavigate }) {
  const [properties, setProperties] = useState(propsProp && propsProp.length > 0 ? propsProp : dummyProperties)
  const [cur, setCur] = useState(1)
  const [likedIds, setLikedIds] = useState([])
  const [playing, setPlaying] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => {
    supabase
      .from('properties')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data && data.length > 0) setProperties(data)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (playing) {
      timerRef.current = setInterval(() => {
        setCur(prev => (prev + 1) % properties.length)
      }, 2500)
    } else {
      clearInterval(timerRef.current)
    }
    return () => clearInterval(timerRef.current)
  }, [playing, properties.length])

  const toggleLike = (id) => {
    setLikedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }

  const goPrev = () => setCur(p => (p - 1 + properties.length) % properties.length)
  const goNext = () => setCur(p => (p + 1) % properties.length)

  return (
    <div style={{ minHeight: '100dvh', background: '#f9fafb', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 24, paddingBottom: 80 }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 24, textAlign: 'center' }}>物件フィード</h2>

      <div style={{ width: '100%', overflow: 'hidden', paddingBottom: 16 }}>
        <div style={{
          display: 'flex',
          transform: `translateX(calc(50vw - 150px - ${cur * CARD_W}px))`,
          transition: 'transform 0.4s cubic-bezier(.25,.46,.45,.94)',
          willChange: 'transform',
        }}>
          {properties.map((property, i) => {
            const isCenter = i === cur
            return (
              <motion.div
                key={property.id}
                className="bg-white rounded-3xl overflow-hidden shadow-sm"
                style={{
                  minWidth: 280,
                  margin: '0 10px',
                  transform: isCenter ? 'scale(1)' : 'scale(0.85)',
                  opacity: isCenter ? 1 : 0.6,
                  transition: 'all 0.4s cubic-bezier(.25,.46,.45,.94)',
                  flexShrink: 0,
                }}
              >
                <div style={{ position: 'relative', aspectRatio: '4/5', overflow: 'hidden' }}>
                  <img src={property.image} alt={property.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.6))' }} />
                  <div style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(139,92,246,0.9)', color: '#fff', padding: '6px 14px', borderRadius: 999, fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <TrendingUp size={14} /> {property.trend}
                  </div>
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '24px 20px 20px', color: '#fff' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, fontSize: 13 }}>
                      <MapPin size={14} /> {property.location}
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 600 }}>{property.title}</div>
                  </div>
                </div>

                <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#8b5cf6,#ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 600, flexShrink: 0 }}>AI</div>
                    <p style={{ fontSize: 13, color: '#4b5563', lineHeight: 1.6, margin: 0 }}>{property.aiInsight}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #f3f4f6', paddingTop: 12 }}>
                    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                      <button onClick={() => toggleLike(property.id)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer' }}>
                        <Heart size={18} style={{ color: likedIds.includes(property.id) ? '#ef4444' : '#9ca3af', fill: likedIds.includes(property.id) ? '#ef4444' : 'none' }} />
                        <span style={{ fontSize: 13, color: '#6b7280' }}>{property.likes + (likedIds.includes(property.id) ? 1 : 0)}</span>
                      </button>
                      <button style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer' }}>
                        <MessageCircle size={18} style={{ color: '#9ca3af' }} />
                        <span style={{ fontSize: 13, color: '#6b7280' }}>{property.comments}</span>
                      </button>
                      <button style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                        <Share2 size={18} style={{ color: '#9ca3af' }} />
                      </button>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#6b7280' }}>
                        {property.agentName[0]}
                      </div>
                      <span style={{ fontSize: 12, color: '#6b7280' }}>{property.agentName}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginTop: 4 }}>
        <button onClick={goPrev} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
          <SkipBack size={22} />
        </button>
        <button onClick={() => setPlaying(p => !p)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
          {playing ? <Pause size={22} /> : <Play size={22} />}
        </button>
        <button onClick={goNext} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
          <SkipForward size={22} />
        </button>
      </div>

      <div style={{ display: 'flex', gap: 28, marginTop: 20, justifyContent: 'center' }}>
        {[
          { icon: <Heart size={20} />, label: '保存' },
          { icon: <MessageCircle size={20} />, label: '質問' },
          { icon: <Building2 size={20} />, label: '業者' },
          { icon: <Bot size={20} />, label: 'AI相談' },
          { icon: <Share2 size={20} />, label: 'シェア' },
        ].map(({ icon, label }) => (
          <button key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
            {icon}
            <span style={{ fontSize: 11 }}>{label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
