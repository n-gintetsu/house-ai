import { useEffect, useState } from 'react'

const C = {
  navy: '#1a3a5c',
  navyDark: '#0f2540',
  gold: '#c9a84c',
  goldLight: '#f0d88a',
  bg: '#F4F7FB',
  card: '#ffffff',
  title: '#102A43',
  desc: '#5C677D',
  border: '#E2E8F0',
}

function StatCard({ icon, label, value }) {
  return (
    <div style={{
      background: C.card,
      border: `1px solid ${C.border}`,
      borderRadius: 16,
      padding: '20px 16px',
      flex: 1,
      textAlign: 'center',
    }}>
      <div style={{ fontSize: 28, marginBottom: 6 }}>{icon}</div>
      <div style={{ fontSize: 28, fontWeight: 800, color: C.navy, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 12, color: C.desc, marginTop: 6 }}>{label}</div>
    </div>
  )
}

function ActivityRow({ activity }) {
  const dateStr = new Date(activity.created_at).toLocaleDateString('ja-JP', {
    year: 'numeric', month: 'numeric', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
  return (
    <div style={{
      padding: '14px 0',
      borderBottom: `1px solid ${C.border}`,
      display: 'flex',
      gap: 12,
      alignItems: 'flex-start',
    }}>
      <div style={{
        width: 8, height: 8, borderRadius: '50%',
        background: C.gold, marginTop: 6, flexShrink: 0,
      }} />
      <div style={{ flex: 1 }}>
        <p style={{ margin: 0, fontSize: 13, color: C.title, fontWeight: 600 }}>
          {activity.description || activity.activity_type}
        </p>
        <p style={{ margin: '4px 0 0', fontSize: 11, color: C.desc }}>{dateStr}</p>
      </div>
    </div>
  )
}

export default function SellerMyPage() {
  const token = new URLSearchParams(window.location.search).get('token')
  const [seller, setSeller] = useState(null)
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!token) {
      setError('URLが正しくありません。担当者から送付されたURLをご確認ください。')
      setLoading(false)
      return
    }
    async function load() {
      try {
        const res = await fetch(`/api/seller?token=${encodeURIComponent(token)}`)
        if (res.status === 404) {
          setError('情報を取得できませんでした。URLが正しいかご確認ください。')
          setLoading(false)
          return
        }
        if (!res.ok) throw new Error('Server error')
        const json = await res.json()
        setSeller(json.seller)
        setActivities(json.activities)
      } catch {
        setError('情報を取得できませんでした。URLが正しいかご確認ください。')
      }
      setLoading(false)
    }
    load()
  }, [token])

  if (loading) return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', color: C.desc }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>⏳</div>
        <p style={{ fontSize: 14 }}>読み込み中...</p>
      </div>
    </div>
  )

  if (error) return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ textAlign: 'center', color: C.desc, maxWidth: 320 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
        <p style={{ fontSize: 14, color: C.title, fontWeight: 600, marginBottom: 8 }}>アクセスエラー</p>
        <p style={{ fontSize: 13, lineHeight: 1.7 }}>{error}</p>
      </div>
    </div>
  )

  const inquiryCount = seller.inquiry_count ?? 0
  const viewCount = seller.view_count ?? 0

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: "'Noto Sans JP', sans-serif" }}>
      {/* ヘッダー */}
      <div style={{ background: C.navyDark, padding: '20px 20px 28px' }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <p style={{ margin: 0, fontSize: 11, color: C.gold, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 }}>
            House-AI
          </p>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#fff', lineHeight: 1.3 }}>
            売主マイページ
          </h1>
          <p style={{ margin: '8px 0 0', fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>
            {seller.address || '物件情報'}
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 640, margin: '0 auto', padding: '20px 16px 80px' }}>

        {/* 物件情報カード */}
        <div style={{ background: C.card, borderRadius: 16, border: `1px solid ${C.border}`, marginBottom: 16, overflow: 'hidden' }}>
          <div style={{ background: `linear-gradient(135deg, ${C.navy} 0%, ${C.navyDark} 100%)`, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 16 }}>🏠</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>物件情報</span>
          </div>
          <div style={{ padding: '16px 18px' }}>
            <InfoRow label="住所" value={seller.address || '—'} />
            <InfoRow label="担当者" value={seller.agent_name || '—'} />
            <InfoRow label="電話番号" value={seller.agent_phone || '—'} last />
          </div>
        </div>

        {/* 販売状況サマリー */}
        <div style={{ marginBottom: 16 }}>
          <SectionTitle>販売状況サマリー</SectionTitle>
          <div style={{ display: 'flex', gap: 12 }}>
            <StatCard icon="📩" label="問い合わせ数" value={inquiryCount} />
            <StatCard icon="👁️" label="閲覧数" value={viewCount} />
            <StatCard icon="📊" label="合計アクション" value={inquiryCount + viewCount} />
          </div>
        </div>

        {/* 活動ログ */}
        <div style={{ marginBottom: 24 }}>
          <SectionTitle>活動ログ</SectionTitle>
          <div style={{ background: C.card, borderRadius: 16, border: `1px solid ${C.border}`, padding: '4px 18px' }}>
            {activities.length === 0 ? (
              <div style={{ padding: '32px 0', textAlign: 'center', color: C.desc, fontSize: 13 }}>
                まだ活動ログはありません
              </div>
            ) : (
              activities.map((a, i) => <ActivityRow key={a.id ?? i} activity={a} />)
            )}
          </div>
        </div>

        {/* 担当者へ連絡ボタン */}
        {seller.agent_phone && (
          <a
            href={`tel:${seller.agent_phone.replace(/[^0-9+]/g, '')}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              background: `linear-gradient(135deg, ${C.gold} 0%, ${C.goldLight} 100%)`,
              color: C.navyDark,
              borderRadius: 14,
              padding: '18px 24px',
              fontSize: 16,
              fontWeight: 800,
              textDecoration: 'none',
              boxShadow: '0 4px 16px rgba(201,168,76,0.35)',
            }}
          >
            <span style={{ fontSize: 20 }}>📞</span>
            担当者へ電話する
          </a>
        )}
      </div>
    </div>
  )
}

function SectionTitle({ children }) {
  return (
    <h2 style={{
      margin: '0 0 10px',
      fontSize: 13,
      fontWeight: 700,
      color: C.navy,
      letterSpacing: 0.5,
      display: 'flex',
      alignItems: 'center',
      gap: 6,
    }}>
      <span style={{ display: 'inline-block', width: 3, height: 14, background: C.gold, borderRadius: 2 }} />
      {children}
    </h2>
  )
}

function InfoRow({ label, value, last }) {
  return (
    <div style={{
      display: 'flex',
      gap: 12,
      paddingBottom: last ? 0 : 12,
      marginBottom: last ? 0 : 12,
      borderBottom: last ? 'none' : `1px solid ${C.border}`,
    }}>
      <span style={{ fontSize: 12, color: C.desc, width: 72, flexShrink: 0, paddingTop: 2 }}>{label}</span>
      <span style={{ fontSize: 13, color: C.title, fontWeight: 600, lineHeight: 1.5, wordBreak: 'break-all' }}>{value}</span>
    </div>
  )
}
