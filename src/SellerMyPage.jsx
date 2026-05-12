import { useEffect, useState } from 'react'
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'

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

const PORTALS = ['SUUMO', "HOME'S", 'アットホーム']

function buildPortalData(activities) {
  const map = {}
  PORTALS.forEach(p => { map[p] = { portal: p, inquiry_count: 0, view_count: 0 } })
  activities.forEach(a => {
    const key = PORTALS.find(p => (a.portal || a.activity_type || '').includes(p))
    if (key) {
      map[key].inquiry_count += Number(a.inquiry_count ?? 0)
      map[key].view_count += Number(a.view_count ?? 0)
    }
  })
  return Object.values(map)
}

function buildWeeklyData(activities) {
  const map = {}
  activities.forEach(a => {
    const d = new Date(a.created_at)
    const mon = new Date(d)
    mon.setDate(d.getDate() - d.getDay() + (d.getDay() === 0 ? -6 : 1))
    const key = mon.toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' }) + '週'
    if (!map[key]) map[key] = { week: key, inquiry_count: 0 }
    map[key].inquiry_count += Number(a.inquiry_count ?? 1)
  })
  return Object.values(map).slice(-8)
}

function StatCard({ icon, label, value }) {
  return (
    <div style={{
      background: C.card, border: `1px solid ${C.border}`,
      borderRadius: 16, padding: '20px 16px', flex: 1, textAlign: 'center',
    }}>
      <div style={{ fontSize: 28, marginBottom: 6 }}>{icon}</div>
      <div style={{ fontSize: 28, fontWeight: 800, color: C.navy, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 12, color: C.desc, marginTop: 6 }}>{label}</div>
    </div>
  )
}

function SectionTitle({ children }) {
  return (
    <h2 style={{
      margin: '0 0 10px', fontSize: 13, fontWeight: 700, color: C.navy,
      letterSpacing: 0.5, display: 'flex', alignItems: 'center', gap: 6,
    }}>
      <span style={{ display: 'inline-block', width: 3, height: 14, background: C.gold, borderRadius: 2 }} />
      {children}
    </h2>
  )
}

function InfoRow({ label, value, last }) {
  return (
    <div style={{
      display: 'flex', gap: 12,
      paddingBottom: last ? 0 : 12, marginBottom: last ? 0 : 12,
      borderBottom: last ? 'none' : `1px solid ${C.border}`,
    }}>
      <span style={{ fontSize: 12, color: C.desc, width: 72, flexShrink: 0, paddingTop: 2 }}>{label}</span>
      <span style={{ fontSize: 13, color: C.title, fontWeight: 600, lineHeight: 1.5, wordBreak: 'break-all' }}>{value}</span>
    </div>
  )
}

function ChartCard({ title, children }) {
  return (
    <div style={{
      background: C.card, border: `1px solid ${C.border}`,
      borderRadius: 16, marginBottom: 16, overflow: 'hidden',
    }}>
      <div style={{
        background: `linear-gradient(135deg, ${C.navy} 0%, ${C.navyDark} 100%)`,
        padding: '12px 18px',
      }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{title}</span>
      </div>
      <div style={{ padding: '16px 8px 12px' }}>{children}</div>
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: C.navyDark, borderRadius: 10, padding: '10px 14px',
      fontSize: 12, color: '#fff', boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
    }}>
      <p style={{ margin: '0 0 6px', fontWeight: 700, color: C.gold }}>{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ margin: '2px 0', color: p.color }}>
          {p.name}：{p.value}
        </p>
      ))}
    </div>
  )
}

function ActivityTable({ activities }) {
  if (activities.length === 0) {
    return (
      <div style={{ padding: '32px 0', textAlign: 'center', color: C.desc, fontSize: 13 }}>
        まだ活動ログはありません
      </div>
    )
  }
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
        <thead>
          <tr style={{ background: C.bg }}>
            {['日付', 'ポータル', '問い合わせ', 'コメント'].map(h => (
              <th key={h} style={{
                padding: '10px 10px', textAlign: 'left', color: C.desc,
                fontWeight: 700, borderBottom: `1px solid ${C.border}`, whiteSpace: 'nowrap',
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {activities.map((a, i) => {
            const dateStr = new Date(a.created_at).toLocaleDateString('ja-JP', {
              month: 'numeric', day: 'numeric',
            })
            const portal = a.portal || a.activity_type || '—'
            const count = a.inquiry_count != null ? a.inquiry_count : '—'
            return (
              <tr key={a.id ?? i} style={{ borderBottom: `1px solid ${C.border}` }}>
                <td style={{ padding: '10px 10px', color: C.desc, whiteSpace: 'nowrap' }}>{dateStr}</td>
                <td style={{ padding: '10px 10px' }}>
                  <span style={{
                    background: `${C.navy}18`, color: C.navy,
                    borderRadius: 6, padding: '2px 8px', fontWeight: 700, fontSize: 11,
                  }}>{portal}</span>
                </td>
                <td style={{ padding: '10px 10px', color: C.title, fontWeight: 700, textAlign: 'center' }}>{count}</td>
                <td style={{ padding: '10px 10px', color: C.desc, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {a.description || '—'}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
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
  const portalData = buildPortalData(activities)
  const weeklyData = buildWeeklyData(activities)

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

        {/* ポータル別反響グラフ */}
        <div style={{ marginBottom: 16 }}>
          <SectionTitle>ポータル別反響</SectionTitle>
          <ChartCard title="📣 ポータル別 問い合わせ数・閲覧数">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={portalData} margin={{ top: 4, right: 16, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                <XAxis dataKey="portal" tick={{ fontSize: 11, fill: C.desc }} />
                <YAxis tick={{ fontSize: 11, fill: C.desc }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                <Bar dataKey="inquiry_count" name="問い合わせ数" fill={C.navy} radius={[4, 4, 0, 0]} />
                <Bar dataKey="view_count" name="閲覧数" fill={C.gold} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* 週別推移グラフ */}
        <div style={{ marginBottom: 16 }}>
          <SectionTitle>週別推移</SectionTitle>
          <ChartCard title="📈 週別 問い合わせ数の推移">
            {weeklyData.length === 0 ? (
              <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.desc, fontSize: 13 }}>
                データがありません
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={weeklyData} margin={{ top: 4, right: 16, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                  <XAxis dataKey="week" tick={{ fontSize: 10, fill: C.desc }} />
                  <YAxis tick={{ fontSize: 11, fill: C.desc }} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="inquiry_count"
                    name="問い合わせ数"
                    stroke={C.navy}
                    strokeWidth={2.5}
                    dot={{ fill: C.gold, strokeWidth: 0, r: 5 }}
                    activeDot={{ r: 7, fill: C.gold }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </div>

        {/* 活動ログ */}
        <div style={{ marginBottom: 24 }}>
          <SectionTitle>活動ログ</SectionTitle>
          <div style={{ background: C.card, borderRadius: 16, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
            <ActivityTable activities={activities} />
          </div>
        </div>

        {/* 担当者へ連絡ボタン */}
        {seller.agent_phone && (
          <a
            href={`tel:${seller.agent_phone.replace(/[^0-9+]/g, '')}`}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              background: `linear-gradient(135deg, ${C.gold} 0%, ${C.goldLight} 100%)`,
              color: C.navyDark, borderRadius: 14, padding: '18px 24px',
              fontSize: 16, fontWeight: 800, textDecoration: 'none',
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
