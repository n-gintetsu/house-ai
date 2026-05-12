import { useEffect, useRef, useState } from 'react'
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'

/* ─────────────────────────────────────────────
   定数
───────────────────────────────────────────── */
const C = {
  navy: '#1a3a5c',
  navyDark: '#0f2540',
  navySoft: '#EEF3F9',
  gold: '#c9a84c',
  goldLight: '#f0d88a',
  bg: '#F4F7FB',
  card: '#ffffff',
  title: '#102A43',
  desc: '#5C677D',
  border: '#E2E8F0',
}

const PORTALS = ['SUUMO', "HOME'S", 'アットホーム']
const AVG_INQUIRY = 3   // House-AI 平均問い合わせ数（参考値）
const AVG_VIEW    = 50  // House-AI 平均閲覧数（参考値）

/* ─────────────────────────────────────────────
   グローバルスタイル注入
───────────────────────────────────────────── */
const GLOBAL_CSS = `
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(18px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes gaugeGrow {
  from { width: 0%; }
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.55; }
}
.sp-fade { animation: fadeInUp 0.55s ease both; }
.sp-fade-1  { animation-delay: 0.05s; }
.sp-fade-2  { animation-delay: 0.12s; }
.sp-fade-3  { animation-delay: 0.19s; }
.sp-fade-4  { animation-delay: 0.26s; }
.sp-fade-5  { animation-delay: 0.33s; }
.sp-fade-6  { animation-delay: 0.40s; }
.sp-fade-7  { animation-delay: 0.47s; }
.sp-fade-8  { animation-delay: 0.54s; }
`

/* ─────────────────────────────────────────────
   データ変換
───────────────────────────────────────────── */
function buildPortalData(activities) {
  const map = {}
  PORTALS.forEach(p => { map[p] = { portal: p, inquiry_count: 0, view_count: 0 } })
  activities.forEach(a => {
    const key = PORTALS.find(p => (a.portal || a.activity_type || '').includes(p))
    if (key) {
      map[key].inquiry_count += Number(a.inquiry_count ?? 0)
      map[key].view_count    += Number(a.view_count    ?? 0)
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

function calcGauge(inquiryCount, viewCount) {
  const score = Math.min(inquiryCount * 12 + viewCount * 0.8, 100)
  return Math.round(score)
}

/* ─────────────────────────────────────────────
   汎用コンポーネント
───────────────────────────────────────────── */
function Spinner() {
  return (
    <span style={{
      display: 'inline-block', width: 18, height: 18, borderRadius: '50%',
      border: '2.5px solid rgba(255,255,255,0.3)', borderTopColor: '#fff',
      animation: 'spin 0.7s linear infinite',
    }} />
  )
}

function SectionLabel({ children, delay = '' }) {
  return (
    <h2 className={`sp-fade ${delay}`} style={{
      margin: '0 0 10px', fontSize: 12, fontWeight: 800, color: C.navy,
      letterSpacing: 1, textTransform: 'uppercase',
      display: 'flex', alignItems: 'center', gap: 7,
    }}>
      <span style={{ display: 'inline-block', width: 3, height: 13, background: C.gold, borderRadius: 2 }} />
      {children}
    </h2>
  )
}

function Card({ children, style, className = '' }) {
  return (
    <div className={`sp-fade ${className}`} style={{
      background: C.card, borderRadius: 20, border: `1px solid ${C.border}`,
      overflow: 'hidden', ...style,
    }}>
      {children}
    </div>
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

/* ─ CountUp ─ */
function CountUp({ target, duration = 900 }) {
  const [val, setVal] = useState(0)
  const start = useRef(null)

  useEffect(() => {
    if (target === 0) return
    const step = (ts) => {
      if (!start.current) start.current = ts
      const progress = Math.min((ts - start.current) / duration, 1)
      setVal(Math.round(progress * target))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [target, duration])

  return <>{val}</>
}

/* ─────────────────────────────────────────────
   ① AI分析コメント
───────────────────────────────────────────── */
function AiComment({ activities, inquiryCount, viewCount }) {
  const hasData = activities.length > 0

  let comment
  if (!hasData) {
    comment = '現在、主要ポータルへの掲載準備中です。通常、掲載開始後3〜7日で閲覧数が増加します。現在の価格設定は周辺相場の範囲内です。'
  } else if (inquiryCount === 0) {
    comment = '掲載を開始しました。閲覧数が積み上がっています。問い合わせが入り始めるまでしばらくお待ちください。写真の充実で反響率が向上します。'
  } else {
    comment = `現在 ${inquiryCount} 件の問い合わせがあります。閲覧数（${viewCount}）に対する反響率は良好な水準です。この調子で内見誘導を進めましょう。`
  }

  return (
    <div className="sp-fade sp-fade-2" style={{
      background: `linear-gradient(135deg, ${C.navySoft} 0%, #E8F0F8 100%)`,
      borderRadius: 20, padding: '20px 20px', marginBottom: 20,
      border: `1px solid ${C.border}`,
      display: 'flex', gap: 14, alignItems: 'flex-start',
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
        background: `linear-gradient(135deg, ${C.navy} 0%, ${C.navyDark} 100%)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
      }}>🤖</div>
      <div>
        <p style={{ margin: '0 0 4px', fontSize: 12, fontWeight: 800, color: C.navy, letterSpacing: 0.5 }}>
          AI分析コメント
        </p>
        <p style={{ margin: 0, fontSize: 13.5, color: C.title, lineHeight: 1.8 }}>{comment}</p>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   ② 販売ステータスタイムライン
───────────────────────────────────────────── */
function StatusTimeline({ activities, inquiryCount }) {
  const hasActivity = activities.length > 0
  const hasInquiry  = inquiryCount > 0

  const steps = [
    { label: '掲載準備完了',  sub: '物件情報・写真登録済み', done: true },
    { label: 'ポータル掲載中', sub: 'SUUMO・HOME\'S・アットホーム', done: hasActivity, active: !hasActivity },
    { label: '初回反響',      sub: '問い合わせ・閲覧数増加中',    done: hasInquiry, active: hasActivity && !hasInquiry },
    { label: '内見・商談',    sub: '価格交渉・条件調整',           done: false,        active: hasInquiry },
  ]

  return (
    <Card className="sp-fade-3" style={{ marginBottom: 20, padding: '20px 18px' }}>
      <p style={{ margin: '0 0 16px', fontSize: 12, fontWeight: 800, color: C.navy, letterSpacing: 1 }}>
        📍 現在の販売ステータス
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {steps.map((s, i) => (
          <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            {/* アイコン＋縦線 */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 28, flexShrink: 0 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%', fontSize: 13,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: s.done ? C.navy : s.active ? C.gold : C.border,
                color: (s.done || s.active) ? '#fff' : C.desc,
                fontWeight: 700, flexShrink: 0,
                animation: s.active ? 'pulse 1.8s ease-in-out infinite' : 'none',
              }}>
                {s.done ? '✓' : s.active ? '…' : i + 1}
              </div>
              {i < steps.length - 1 && (
                <div style={{ width: 2, flex: 1, minHeight: 20, background: s.done ? C.navy : C.border, margin: '4px 0' }} />
              )}
            </div>
            {/* テキスト */}
            <div style={{ paddingBottom: i < steps.length - 1 ? 16 : 0 }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: s.done ? C.navy : s.active ? C.gold : C.desc }}>
                {s.label}
              </p>
              <p style={{ margin: '2px 0 0', fontSize: 11, color: C.desc }}>{s.sub}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

/* ─────────────────────────────────────────────
   ③ おすすめアクション
───────────────────────────────────────────── */
function ActionCards({ inquiryCount, viewCount }) {
  const actions = []
  if (viewCount < 30)  actions.push({ icon: '📸', text: '写真を充実させると閲覧数が増加しやすくなります', tag: '効果大' })
  if (viewCount >= 30 && inquiryCount === 0)
                        actions.push({ icon: '💰', text: '価格を見直すことで問い合わせ件数が改善される可能性があります', tag: '要検討' })
  if (inquiryCount > 0) actions.push({ icon: '📅', text: '問い合わせが入っています。内見日程を早めに調整しましょう', tag: '優先対応' })
  actions.push({ icon: '📊', text: '毎週のレポートをAIが自動分析します。定期的にページをご確認ください', tag: 'AI推奨' })

  return (
    <div className="sp-fade sp-fade-4" style={{ marginBottom: 20 }}>
      <SectionLabel>🤖 AIからのおすすめアクション</SectionLabel>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {actions.slice(0, 3).map((a, i) => (
          <div key={i} style={{
            background: C.card, border: `1px solid ${C.border}`, borderRadius: 14,
            padding: '14px 16px', display: 'flex', gap: 12, alignItems: 'flex-start',
          }}>
            <span style={{ fontSize: 22, flexShrink: 0 }}>{a.icon}</span>
            <div style={{ flex: 1 }}>
              <span style={{
                fontSize: 10, fontWeight: 800, background: `${C.navy}12`, color: C.navy,
                borderRadius: 4, padding: '2px 7px', marginBottom: 5, display: 'inline-block',
              }}>{a.tag}</span>
              <p style={{ margin: 0, fontSize: 13, color: C.title, lineHeight: 1.7 }}>{a.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   ④ AI売却期待度ゲージ
───────────────────────────────────────────── */
function SalesGauge({ inquiryCount, viewCount }) {
  const [animated, setAnimated] = useState(false)
  const gauge = calcGauge(inquiryCount, viewCount)

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 300)
    return () => clearTimeout(t)
  }, [])

  const comment = gauge >= 60
    ? '反響が順調です。このままの状態を維持しましょう！'
    : gauge >= 30
    ? '現在の価格帯は閲覧されやすい水準です。引き続き注目されています。'
    : 'データを収集中です。掲載後しばらくで数値が上がっていきます。'

  return (
    <Card className="sp-fade-4" style={{ marginBottom: 20, padding: '20px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <p style={{ margin: 0, fontSize: 12, fontWeight: 800, color: C.navy, letterSpacing: 0.5 }}>⚡ AI売却期待度</p>
        <p style={{ margin: 0, fontSize: 26, fontWeight: 900, color: C.gold }}>{gauge}<span style={{ fontSize: 14 }}>%</span></p>
      </div>
      {/* バー */}
      <div style={{ background: C.border, borderRadius: 99, height: 12, overflow: 'hidden', marginBottom: 12 }}>
        <div style={{
          height: '100%', borderRadius: 99,
          background: `linear-gradient(90deg, ${C.navy} 0%, ${C.gold} 100%)`,
          width: animated ? `${gauge}%` : '0%',
          transition: 'width 1.2s cubic-bezier(0.22, 1, 0.36, 1)',
        }} />
      </div>
      <p style={{ margin: 0, fontSize: 12, color: C.desc, lineHeight: 1.7 }}>{comment}</p>
    </Card>
  )
}

/* ─────────────────────────────────────────────
   ⑤ House-AI平均比較
───────────────────────────────────────────── */
function AverageComparison({ inquiryCount, viewCount }) {
  const inquiryAbove = inquiryCount >= AVG_INQUIRY
  const viewAbove    = viewCount    >= AVG_VIEW

  function Bar2({ label, yours, avg, above }) {
    const maxVal = Math.max(yours, avg, 1)
    return (
      <div style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
          <span style={{ fontSize: 12, color: C.desc }}>{label}</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: above ? C.gold : C.desc }}>
            {above ? `↑ 平均より高い` : `平均 ${avg} に対して ${yours}`}
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {[{ label: 'あなた', value: yours, color: C.navy }, { label: 'House-AI平均', value: avg, color: C.border }].map(r => (
            <div key={r.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 10, color: C.desc, width: 80, flexShrink: 0 }}>{r.label}</span>
              <div style={{ flex: 1, background: '#EEF3F9', borderRadius: 99, height: 8, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: 99, background: r.color,
                  width: `${(r.value / maxVal) * 100}%`,
                  transition: 'width 1s ease',
                }} />
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: C.title, width: 24, textAlign: 'right' }}>{r.value}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <Card className="sp-fade-5" style={{ marginBottom: 20, padding: '20px 20px' }}>
      <p style={{ margin: '0 0 16px', fontSize: 12, fontWeight: 800, color: C.navy, letterSpacing: 0.5 }}>
        📊 House-AI 掲載物件との比較
      </p>
      <Bar2 label="問い合わせ数" yours={inquiryCount} avg={AVG_INQUIRY} above={inquiryAbove} />
      <Bar2 label="閲覧数"       yours={viewCount}    avg={AVG_VIEW}    above={viewAbove}    />
      <p style={{
        margin: '4px 0 0', fontSize: 12, fontWeight: 700,
        color: (inquiryAbove || viewAbove) ? C.gold : C.desc,
        textAlign: 'center',
      }}>
        {(inquiryAbove || viewAbove) ? '↑ 平均より高い反響です' : '改善のアドバイスをご確認ください'}
      </p>
    </Card>
  )
}

/* ─────────────────────────────────────────────
   グラフ用ツールチップ
───────────────────────────────────────────── */
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: C.navyDark, borderRadius: 10, padding: '10px 14px',
      fontSize: 12, color: '#fff', boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
    }}>
      <p style={{ margin: '0 0 6px', fontWeight: 700, color: C.gold }}>{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ margin: '2px 0', color: p.color }}>{p.name}：{p.value}</p>
      ))}
    </div>
  )
}

/* ─────────────────────────────────────────────
   ⑥ 活動履歴タイムライン
───────────────────────────────────────────── */
function ActivityTimeline({ activities }) {
  if (activities.length === 0) {
    return (
      <div style={{
        background: C.navySoft, borderRadius: 14, padding: '24px 20px',
        display: 'flex', gap: 14, alignItems: 'flex-start',
      }}>
        <span style={{ fontSize: 28 }}>🤖</span>
        <p style={{ margin: 0, fontSize: 13, color: C.title, lineHeight: 1.8 }}>
          現在AIがデータを収集中です。反響が入り次第、自動反映されます。
        </p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {activities.map((a, i) => {
        const dateStr = new Date(a.created_at).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' })
        const portal  = a.portal || a.activity_type || '活動記録'
        const count   = a.inquiry_count != null ? `${a.inquiry_count}件` : null
        return (
          <div key={a.id ?? i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, width: 20 }}>
              <div style={{
                width: 10, height: 10, borderRadius: '50%',
                background: i === 0 ? C.gold : C.navy, marginTop: 4, flexShrink: 0,
              }} />
              {i < activities.length - 1 && (
                <div style={{ width: 2, flex: 1, minHeight: 24, background: C.border, margin: '4px 0' }} />
              )}
            </div>
            <div style={{ paddingBottom: i < activities.length - 1 ? 16 : 0, flex: 1 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 3 }}>
                <span style={{
                  fontSize: 10, fontWeight: 800, background: `${C.navy}12`, color: C.navy,
                  borderRadius: 5, padding: '2px 8px',
                }}>{portal}</span>
                {count && (
                  <span style={{
                    fontSize: 10, fontWeight: 800, background: `${C.gold}22`, color: '#8B6914',
                    borderRadius: 5, padding: '2px 8px',
                  }}>問い合わせ {count}</span>
                )}
                <span style={{ fontSize: 11, color: C.desc, marginLeft: 'auto' }}>{dateStr}</span>
              </div>
              {a.description && (
                <p style={{ margin: 0, fontSize: 13, color: C.title, lineHeight: 1.7 }}>{a.description}</p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ─────────────────────────────────────────────
   メインコンポーネント
───────────────────────────────────────────── */
export default function SellerMyPage() {
  const token = new URLSearchParams(window.location.search).get('token')
  const [seller,        setSeller]        = useState(null)
  const [activities,    setActivities]    = useState([])
  const [loading,       setLoading]       = useState(true)
  const [error,         setError]         = useState('')
  const [report,        setReport]        = useState('')
  const [reportLoading, setReportLoading] = useState(false)
  const [reportError,   setReportError]   = useState('')

  /* スタイル注入 */
  useEffect(() => {
    const el = document.createElement('style')
    el.textContent = GLOBAL_CSS
    document.head.appendChild(el)
    return () => document.head.removeChild(el)
  }, [])

  /* データ取得 */
  useEffect(() => {
    if (!token) {
      setError('URLが正しくありません。担当者から送付されたURLをご確認ください。')
      setLoading(false)
      return
    }
    async function load() {
      try {
        const res = await fetch(`/api/seller?token=${encodeURIComponent(token)}`)
        if (res.status === 404) { setError('情報を取得できませんでした。URLが正しいかご確認ください。'); setLoading(false); return }
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

  async function generateReport() {
    setReportLoading(true)
    setReportError('')
    setReport('')
    try {
      const res = await fetch(`/api/seller-report?token=${encodeURIComponent(token)}`)
      if (!res.ok) throw new Error('Server error')
      const json = await res.json()
      setReport(json.report || '')
    } catch {
      setReportError('報告書の生成に失敗しました。時間をおいて再度お試しください。')
    }
    setReportLoading(false)
  }

  /* ─── ローディング ─── */
  if (loading) return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', color: C.desc }}>
        <div style={{ fontSize: 40, marginBottom: 12, animation: 'pulse 1.5s ease-in-out infinite' }}>🤖</div>
        <p style={{ fontSize: 14, color: C.navy, fontWeight: 700 }}>House-AI が情報を取得中です...</p>
      </div>
    </div>
  )

  /* ─── エラー ─── */
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
  const viewCount    = seller.view_count    ?? 0
  const portalData   = buildPortalData(activities)
  const weeklyData   = buildWeeklyData(activities)
  const phone        = seller.agent_phone || seller.phone

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: "'Noto Sans JP', 'Hiragino Sans', sans-serif" }}>

      {/* ━━━ ヘッダー ━━━ */}
      <div style={{ background: `linear-gradient(160deg, ${C.navyDark} 0%, ${C.navy} 100%)`, padding: '28px 20px 36px' }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <span style={{ fontSize: 22 }}>🤖</span>
            <p style={{ margin: 0, fontSize: 11, color: C.gold, fontWeight: 800, letterSpacing: 2.5, textTransform: 'uppercase' }}>
              House-AI 売主コンシェルジュ
            </p>
          </div>
          <h1 style={{ margin: '0 0 6px', fontSize: 24, fontWeight: 900, color: '#fff', lineHeight: 1.3 }}>
            {seller.name || seller.seller_name || 'お客様'} 様の<br />販売活動レポート
          </h1>
          <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6 }}>
            📍 {seller.property_address || '物件情報'}
          </p>
        </div>
      </div>

      {/* ━━━ コンテンツ ━━━ */}
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '24px 16px 100px' }}>

        {/* ① AI分析コメント */}
        <AiComment activities={activities} inquiryCount={inquiryCount} viewCount={viewCount} />

        {/* ② 販売ステータスタイムライン */}
        <div className="sp-fade sp-fade-2" style={{ marginBottom: 20 }}>
          <SectionLabel delay="sp-fade-2">販売ステータス</SectionLabel>
          <StatusTimeline activities={activities} inquiryCount={inquiryCount} />
        </div>

        {/* ③ おすすめアクション */}
        <ActionCards inquiryCount={inquiryCount} viewCount={viewCount} />

        {/* ④ AI売却期待度ゲージ */}
        <SalesGauge inquiryCount={inquiryCount} viewCount={viewCount} />

        {/* ─ サマリー数値（⑨ カウントアップ） ─ */}
        <div className="sp-fade sp-fade-5" style={{ marginBottom: 20 }}>
          <SectionLabel delay="sp-fade-5">販売状況サマリー</SectionLabel>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {[
              { icon: '📩', label: '問い合わせ数', value: inquiryCount },
              { icon: '👁️', label: '閲覧数',       value: viewCount },
              { icon: '📊', label: '合計アクション', value: inquiryCount + viewCount },
            ].map(s => (
              <div key={s.label} style={{
                background: C.card, border: `1px solid ${C.border}`, borderRadius: 16,
                padding: '18px 10px', textAlign: 'center',
              }}>
                <div style={{ fontSize: 26, marginBottom: 6 }}>{s.icon}</div>
                <div style={{ fontSize: 26, fontWeight: 900, color: C.navy, lineHeight: 1 }}>
                  <CountUp target={s.value} />
                </div>
                <div style={{ fontSize: 11, color: C.desc, marginTop: 5 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ⑤ House-AI平均比較 */}
        <AverageComparison inquiryCount={inquiryCount} viewCount={viewCount} />

        {/* ─ ポータル別グラフ ─ */}
        <div className="sp-fade sp-fade-6" style={{ marginBottom: 20 }}>
          <SectionLabel delay="sp-fade-6">ポータル別 反響数</SectionLabel>
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 20, overflow: 'hidden' }}>
            <div style={{ background: `linear-gradient(135deg, ${C.navy} 0%, ${C.navyDark} 100%)`, padding: '12px 18px' }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>📣 ポータル別 問い合わせ数・閲覧数</span>
            </div>
            <div style={{ padding: '16px 8px 12px' }}>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={portalData} margin={{ top: 4, right: 16, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                  <XAxis dataKey="portal" tick={{ fontSize: 11, fill: C.desc }} />
                  <YAxis tick={{ fontSize: 11, fill: C.desc }} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                  <Bar dataKey="inquiry_count" name="問い合わせ数" fill={C.navy} radius={[5, 5, 0, 0]} />
                  <Bar dataKey="view_count"    name="閲覧数"       fill={C.gold} radius={[5, 5, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* ─ 週別推移グラフ ─ */}
        {weeklyData.length > 0 && (
          <div className="sp-fade sp-fade-6" style={{ marginBottom: 20 }}>
            <SectionLabel delay="sp-fade-6">週別推移</SectionLabel>
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 20, overflow: 'hidden' }}>
              <div style={{ background: `linear-gradient(135deg, ${C.navy} 0%, ${C.navyDark} 100%)`, padding: '12px 18px' }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>📈 週別 問い合わせ数の推移</span>
              </div>
              <div style={{ padding: '16px 8px 12px' }}>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={weeklyData} margin={{ top: 4, right: 16, left: -16, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                    <XAxis dataKey="week" tick={{ fontSize: 10, fill: C.desc }} />
                    <YAxis tick={{ fontSize: 11, fill: C.desc }} allowDecimals={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="inquiry_count" name="問い合わせ数"
                      stroke={C.navy} strokeWidth={2.5}
                      dot={{ fill: C.gold, strokeWidth: 0, r: 5 }}
                      activeDot={{ r: 7, fill: C.gold }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* ⑥ 活動履歴タイムライン */}
        <div className="sp-fade sp-fade-7" style={{ marginBottom: 24 }}>
          <SectionLabel delay="sp-fade-7">活動履歴</SectionLabel>
          <Card>
            <div style={{ padding: '20px 18px' }}>
              <ActivityTimeline activities={activities} />
            </div>
          </Card>
        </div>

        {/* ⑦ AI販売状況レポートボタン */}
        <div className="sp-fade sp-fade-7" style={{ marginBottom: 20 }}>
          <button
            onClick={generateReport}
            disabled={reportLoading}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              background: reportLoading ? '#6b7fa3' : `linear-gradient(135deg, ${C.navy} 0%, ${C.navyDark} 100%)`,
              color: '#fff', border: 'none', borderRadius: 16,
              padding: '17px 24px', fontSize: 15, fontWeight: 800,
              cursor: reportLoading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 20px rgba(26,58,92,0.28)', marginBottom: 14,
              transition: 'background 0.2s',
            }}
          >
            {reportLoading ? <><Spinner /> AIが分析中...</> : <><span style={{ fontSize: 20 }}>✨</span>AI販売状況を確認する</>}
          </button>

          {reportError && (
            <p style={{ fontSize: 12, color: '#c0392b', textAlign: 'center', margin: '0 0 12px' }}>{reportError}</p>
          )}

          {report && (
            <div style={{
              background: C.navyDark, borderRadius: 18,
              padding: '22px 20px', boxShadow: '0 4px 24px rgba(15,37,64,0.2)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                  background: `linear-gradient(135deg, ${C.gold} 0%, ${C.goldLight} 100%)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
                }}>🤖</div>
                <div>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: C.gold }}>AI販売活動報告書</p>
                  <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>House-AI コンシェルジュ 自動生成</p>
                </div>
              </div>
              <p style={{
                margin: 0, fontSize: 14, color: '#fff', lineHeight: 1.9,
                whiteSpace: 'pre-wrap', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 16,
              }}>{report}</p>
            </div>
          )}
        </div>

        {/* 物件情報カード */}
        <div className="sp-fade sp-fade-8" style={{ marginBottom: 20 }}>
          <SectionLabel delay="sp-fade-8">担当者・物件情報</SectionLabel>
          <Card>
            <div style={{ padding: '16px 18px' }}>
              <InfoRow label="担当者"    value={seller.agent_name || '—'} />
              <InfoRow label="担当メール" value={seller.agent_email || '—'} />
              <InfoRow label="電話番号"   value={phone || '—'} last />
            </div>
          </Card>
        </div>

        {/* ⑧ 担当者へ連絡ボタン */}
        {phone && (
          <a
            href={`tel:${phone.replace(/[^0-9+]/g, '')}`}
            className="sp-fade sp-fade-8"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              background: `linear-gradient(135deg, ${C.gold} 0%, ${C.goldLight} 100%)`,
              color: C.navyDark, borderRadius: 16, padding: '18px 24px',
              fontSize: 16, fontWeight: 900, textDecoration: 'none',
              boxShadow: '0 4px 20px rgba(201,168,76,0.38)',
            }}
          >
            <span style={{ fontSize: 22 }}>📞</span>
            担当者へ連絡する
          </a>
        )}
      </div>
    </div>
  )
}
