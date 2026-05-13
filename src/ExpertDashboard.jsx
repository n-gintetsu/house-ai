import { useState, useEffect } from 'react'
import ReactDOM from 'react-dom'
import AuthPanel from './AuthPanel'

const NAVY = '#1a3a5c'
const GOLD = '#c9a84c'
const GRAY = '#f5f5f5'
const TEXT = '#1e293b'

const MOCK_STATS = { views: 128, consultations: 5, replyRate: 80, closed: 2 }

const MOCK_TRIGGERS = {
  firstConsultation: true,
  missedConsultations: 3,
  displayRank: 47,
  freeQuotaUsed: 5,
  freeQuotaMax: 5,
};

const MOCK_CONSULTATIONS = [
  { id: 1, category: '相続', summary: '親の不動産をどうすればいいか分からない', area: 'さいたま市', urgency: '高', time: '10分前' },
  { id: 2, category: '税金', summary: '売却時の譲渡所得税の計算方法が知りたい', area: '東京都', urgency: '中', time: '1時間前' },
  { id: 3, category: '契約トラブル', summary: '契約解除の違約金について相談したい', area: '横浜市', urgency: '高', time: '3時間前' },
  { id: 4, category: '投資', summary: '区分マンション投資のリスクを教えてほしい', area: '大阪市', urgency: '低', time: '昨日' },
  { id: 5, category: '空き家', summary: '実家の空き家をどう処分すればいいか', area: '埼玉県', urgency: '中', time: '昨日' },
  { id: 6, category: '登記', summary: '相続登記の義務化について詳しく知りたい', area: '千葉市', urgency: '低', time: '2日前' },
]

const URGENCY_COLORS = { 高: '#ef4444', 中: '#f97316', 低: '#94a3b8' }

const SIDEBAR_ITEMS = [
  { id: 'dashboard', label: 'ダッシュボード', icon: '📊' },
  { id: 'consultations', label: '相談一覧', icon: '📩' },
  { id: 'messages', label: 'メッセージ', icon: '💬' },
  { id: 'profile', label: 'プロフィール', icon: '👤' },
  { id: 'plan', label: 'プラン管理', icon: '💰' },
]

function ConsultationCard({ item, style }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 8, padding: 16,
      boxShadow: '0 1px 6px rgba(26,58,92,0.08)', margin: '8px 0',
      ...style,
    }}>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 8, flexWrap: 'wrap' }}>
        <span style={{ background: NAVY, color: '#fff', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>
          {item.category}
        </span>
        <span style={{ background: URGENCY_COLORS[item.urgency], color: '#fff', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>
          緊急度：{item.urgency}
        </span>
        <span style={{ fontSize: 11, color: '#94a3b8', marginLeft: 'auto' }}>{item.time}</span>
      </div>
      <p style={{ fontSize: 14, color: TEXT, margin: '0 0 6px', lineHeight: 1.5 }}>{item.summary}</p>
      <p style={{ fontSize: 12, color: '#64748b', margin: '0 0 10px' }}>📍 {item.area}</p>
      <button style={{
        padding: '7px 16px', background: '#fff', color: NAVY,
        border: `1.5px solid ${NAVY}`, borderRadius: 8,
        fontSize: 12, fontWeight: 700, cursor: 'pointer',
      }}>
        詳細を見る
      </button>
    </div>
  )
}

function SectionDashboard({ isPremium, setActiveSection }) {
  const KPI_TARGETS = [
    { icon: '👁️', label: 'プロフィール閲覧数', value: 128, unit: '回', color: NAVY },
    { icon: '📩', label: '今月の相談数', value: 5, unit: '件', color: '#2563eb' },
    { icon: '💬', label: '返信率', value: 80, unit: '%', color: '#16a34a' },
    { icon: '✅', label: '対応完了', value: 2, unit: '件', color: GOLD },
  ]
  const [counts, setCounts] = useState(KPI_TARGETS.map(() => 0))

  useEffect(() => {
    const steps = 60
    const interval = 1500 / steps
    let step = 0
    const timer = setInterval(() => {
      step++
      const p = step / steps
      setCounts(KPI_TARGETS.map(k => Math.round(k.value * Math.min(p, 1))))
      if (step >= steps) clearInterval(timer)
    }, interval)
    return () => clearInterval(timer)
  }, [])

  const AI_CASES = [
    { badge: '相続', urgency: '高', title: '親の不動産相続について相談したい', area: 'さいたま市', time: '10分前' },
    { badge: '税金', urgency: '中', title: '売却時の譲渡所得税の計算方法が知りたい', area: '東京都', time: '1時間前' },
  ]

  const AD_STATUS = { plan: 'フリー', rank: 47, views: 128, ctr: '3.2%' }

  const AI_LOGS = [
    { time: '10分前', text: 'さいたま市の相続相談ユーザーがあなたのプロフィールを閲覧しました' },
    { time: '1時間前', text: '東京都の税金相談ユーザーへのおすすめ通知が送信されました' },
    { time: '3時間前', text: 'AIがあなたのプロフィールを3件の相談にマッチングしました' },
    { time: '昨日', text: '横浜市のユーザーが契約トラブル相談を投稿、AIが候補に追加しました' },
    { time: '2日前', text: 'プロフィール完成度が上がりマッチング精度が向上しました' },
  ]

  return (
    <div>
      {/* ① KPI 4枚カード */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 24 }}>
        {KPI_TARGETS.map((k, i) => (
          <div key={k.label} className="kpi-card" style={{
            background: '#fff', borderRadius: 14, padding: '20px 16px',
            boxShadow: '0 2px 12px rgba(26,58,92,0.09)', textAlign: 'center',
          }}>
            <div style={{ fontSize: 26, marginBottom: 6 }}>{k.icon}</div>
            <div style={{ fontSize: 11, color: '#64748b', marginBottom: 6 }}>{k.label}</div>
            <div style={{ fontSize: 34, fontWeight: 800, color: k.color, lineHeight: 1 }}>
              {counts[i]}<span style={{ fontSize: 16, fontWeight: 600 }}>{k.unit}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ② AIおすすめ案件 */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: NAVY, marginBottom: 12 }}>🤖 AIおすすめ案件</div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {AI_CASES.map((c, i) => (
            <div key={i} className="ai-case-card" style={{
              flex: '1 1 calc(50% - 6px)', minWidth: 220,
              background: '#fff', borderRadius: 14, padding: 16,
              boxShadow: '0 2px 12px rgba(26,58,92,0.09)',
              border: `1.5px solid ${NAVY}`,
            }}>
              <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
                <span style={{ background: NAVY, color: '#fff', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>{c.badge}</span>
                <span style={{ background: URGENCY_COLORS[c.urgency], color: '#fff', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>緊急度：{c.urgency}</span>
              </div>
              <p style={{ fontSize: 13, color: TEXT, margin: '0 0 6px', lineHeight: 1.5 }}>{c.title}</p>
              <p style={{ fontSize: 12, color: '#64748b', margin: '0 0 10px' }}>📍 {c.area} · {c.time}</p>
              <button style={{ padding: '7px 14px', background: NAVY, color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                案件を確認する →
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ③ 広告掲載状況 */}
      <div style={{ background: '#fff', borderRadius: 14, padding: 20, marginBottom: 24, boxShadow: '0 2px 12px rgba(26,58,92,0.09)' }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: NAVY, marginBottom: 14 }}>📢 広告掲載状況</div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {[
            { label: '掲載プラン', value: AD_STATUS.plan },
            { label: '表示順位', value: `${AD_STATUS.rank}位` },
            { label: '閲覧数', value: `${AD_STATUS.views}回` },
            { label: 'CTR', value: AD_STATUS.ctr },
          ].map(item => (
            <div key={item.label} style={{ flex: '1 1 70px', textAlign: 'center', background: '#f8fafc', borderRadius: 10, padding: '12px 8px' }}>
              <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>{item.label}</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: NAVY }}>{item.value}</div>
            </div>
          ))}
        </div>
        <button onClick={() => setActiveSection('plan')} style={{ marginTop: 14, padding: '8px 18px', background: '#f0f4ff', border: `1.5px solid ${NAVY}`, borderRadius: 8, color: NAVY, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
          掲載プランを変更する →
        </button>
      </div>

      {/* ④ AI反響ログ */}
      <div style={{ background: '#fff', borderRadius: 14, padding: 20, marginBottom: 24, boxShadow: '0 2px 12px rgba(26,58,92,0.09)' }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: NAVY, marginBottom: 14 }}>📋 AI反響ログ</div>
        {AI_LOGS.map((log, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: i < AI_LOGS.length - 1 ? 12 : 0 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: GOLD, marginTop: 5, flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 2 }}>{log.time}</div>
              <div style={{ fontSize: 13, color: TEXT, lineHeight: 1.5 }}>{log.text}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ⑤ プロフィール完成度 + AI信頼スコア */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <div style={{ flex: '2 1 200px', background: '#fff', borderRadius: 14, padding: 20, boxShadow: '0 2px 12px rgba(26,58,92,0.09)' }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: NAVY, marginBottom: 12 }}>プロフィール完成度</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{ flex: 1, height: 8, background: '#e2e8f0', borderRadius: 4 }}>
              <div style={{ width: '78%', height: '100%', background: GOLD, borderRadius: 4 }} />
            </div>
            <span style={{ fontSize: 14, fontWeight: 800, color: NAVY }}>78%</span>
          </div>
          {['実績未入力', '写真未設定'].map(item => (
            <div key={item} style={{ fontSize: 12, color: '#ef4444', marginBottom: 4 }}>・{item}</div>
          ))}
          <button onClick={() => setActiveSection('profile')} style={{ marginTop: 12, background: '#fff', color: NAVY, border: `1.5px solid ${NAVY}`, borderRadius: 8, padding: '8px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
            プロフィールを充実させる
          </button>
        </div>
        <div style={{ flex: '1 1 130px', background: `linear-gradient(135deg, ${NAVY} 0%, #0f2540 100%)`, borderRadius: 14, padding: 20, boxShadow: '0 2px 12px rgba(26,58,92,0.09)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginBottom: 8 }}>AI信頼スコア</div>
          <div style={{ fontSize: 52, fontWeight: 900, color: GOLD, lineHeight: 1 }}>92</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 6 }}>上位 8% のスコア</div>
        </div>
      </div>

      {/* ⑥ CTA */}
      <button onClick={() => setActiveSection('plan')} style={{
        width: '100%', padding: 16,
        background: `linear-gradient(135deg, ${GOLD} 0%, #f5e08a 50%, ${GOLD} 100%)`,
        backgroundSize: '200% auto', border: 'none', borderRadius: 14,
        color: NAVY, fontSize: 16, fontWeight: 800, cursor: 'pointer',
        boxShadow: '0 4px 20px rgba(201,168,76,0.4)',
        animation: 'btnShimmer 3s linear infinite',
      }}>
        ✨ AI集客をさらに強化する →
      </button>
    </div>
  )
}

function SectionConsultations() {
  return (
    <div>
      <div style={{ fontSize: 15, fontWeight: 800, color: NAVY, marginBottom: 12 }}>📩 相談一覧</div>
      {MOCK_CONSULTATIONS.map((item) => (
        <ConsultationCard key={item.id} item={item} />
      ))}
    </div>
  )
}

function SectionMessages({ setActiveSection }) {
  return (
    <div style={{ background: 'white', borderRadius: 16, padding: '40px 24px', textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
      <span style={{ fontSize: 48 }}>💬</span>
      <h3 style={{ color: '#1a3a5c', fontSize: 18, fontWeight: 800, margin: '12px 0 8px' }}>DM機能</h3>
      <div style={{ background: '#fff8f0', border: '1.5px solid #f59e0b', borderRadius: 10, padding: '16px', margin: '16px auto', maxWidth: 320 }}>
        <p style={{ margin: 0, fontSize: 13, color: '#92400e', fontWeight: 700 }}>🔒 DM送信はスタンダード以上で解放</p>
        <p style={{ margin: '8px 0 0', fontSize: 12, color: '#b45309' }}>ユーザーから直接連絡が届くようになります</p>
      </div>
      <div style={{ background: '#f8fafc', borderRadius: 10, padding: '16px', margin: '0 auto 20px', maxWidth: 320, textAlign: 'left' }}>
        <p style={{ margin: '0 0 8px', fontSize: 12, fontWeight: 700, color: '#1a3a5c' }}>スタンダードで解放される機能：</p>
        <p style={{ margin: '4px 0', fontSize: 12, color: '#64748b' }}>✅ ユーザーへのDM送信</p>
        <p style={{ margin: '4px 0', fontSize: 12, color: '#64748b' }}>✅ 既読確認</p>
        <p style={{ margin: '4px 0', fontSize: 12, color: '#64748b' }}>✅ 月15件まで相談受付</p>
        <p style={{ margin: '4px 0', fontSize: 12, color: '#64748b' }}>✅ AI優先表示</p>
      </div>
      <button onClick={() => setActiveSection('plan')} style={{ background: '#c9a84c', border: 'none', borderRadius: 10, padding: '14px 32px', color: '#1a3a5c', fontSize: 15, fontWeight: 800, cursor: 'pointer' }}>
        アップグレードしてDMを使う →
      </button>
    </div>
  )
}

function SectionPlan({ isPremium, setActiveSection, handleUpgrade, isUpgrading }) {
  const plans = [
    {
      name: 'フリープラン', price: '0円', badge: 'まずはこちら',
      badgeBg: GRAY, badgeColor: '#64748b',
      bg: '#fff', border: '1.5px solid #e2e8f0', textColor: TEXT,
      features: ['プロフィール掲載', '対応分野登録', '対応エリア登録', '一部案件閲覧', '問い合わせ制限あり'],
      btnLabel: '現在のプラン', btnBg: GRAY, btnColor: '#64748b', isCurrent: !isPremium,
    },
    {
      name: 'スタンダード', price: '9,800円/月', badge: '相談機会を増やしたい方向け',
      badgeBg: '#fff8e6', badgeColor: '#92650a',
      bg: '#fff', border: `2px solid ${GOLD}`, textColor: TEXT,
      features: ['プロフィール掲載', '案件通知', 'DM機能', '月15件まで相談受付', '検索/AI推薦対象'],
      btnLabel: 'アップグレードする', btnBg: NAVY, btnColor: '#fff', isCurrent: false,
      priceId: 'price_1TJwQTJTXophddHtrVM8QERl',
    },
    {
      name: 'プレミアム', price: '29,800円/月', badge: '本格的に集客したい方向け',
      badgeBg: GOLD, badgeColor: '#fff',
      bg: NAVY, border: 'none', textColor: '#fff',
      features: ['AI優先推薦', '特集掲載', '案件優先通知', '相談件数上限アップ', 'レビュー掲載', '専門家ページ強化'],
      btnLabel: 'プレミアムを見る', btnBg: GOLD, btnColor: '#fff', isCurrent: false,
      priceId: 'price_1TJwQTJTXophddHtrVM8QERl',
    },
  ]
  return (
    <div>
      <div style={{ fontSize: 15, fontWeight: 800, color: NAVY, marginBottom: 20 }}>💰 プラン管理</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {plans.map((p) => (
          <div key={p.name} style={{ background: p.bg, border: p.border, borderRadius: 16, padding: '24px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
              <span style={{ background: p.badgeBg, color: p.badgeColor, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>{p.badge}</span>
              {p.isCurrent && <span style={{ background: '#ecfdf5', color: '#065f46', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>現在のプラン</span>}
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: p.textColor === TEXT ? NAVY : 'rgba(255,255,255,0.7)', marginBottom: 4 }}>{p.name}</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: p.textColor, marginBottom: 16 }}>{p.price}</div>
            {p.features.map((f) => (
              <div key={f} style={{ fontSize: 13, color: p.textColor === TEXT ? '#475569' : 'rgba(255,255,255,0.75)', padding: '6px 0', borderBottom: `1px solid ${p.textColor === TEXT ? '#f1f5f9' : 'rgba(255,255,255,0.1)'}` }}>・ {f}</div>
            ))}
            <button
              onClick={() => !p.isCurrent && handleUpgrade && handleUpgrade(p.priceId)}
              disabled={p.isCurrent || isUpgrading}
              style={{ marginTop: 18, width: '100%', background: p.btnBg, color: p.btnColor, border: 'none', borderRadius: 10, padding: '12px 0', fontSize: 14, fontWeight: 800, cursor: (p.isCurrent || isUpgrading) ? 'not-allowed' : 'pointer', opacity: (p.isCurrent || isUpgrading) ? 0.6 : 1 }}
            >
              {isUpgrading && !p.isCurrent ? '処理中...' : p.btnLabel}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

function SectionProfile() {
  const [form, setForm] = useState({ name: '山田 太郎', office: '山田法律事務所', field: '相続・税金・登記', area: '東京都・神奈川県', profile: '不動産相続・税務申告を中心に10年以上の実績があります。' })
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))
  const fieldStyle = { width: '100%', boxSizing: 'border-box', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #e2e8f0', background: '#fff', color: TEXT, fontSize: 16, fontFamily: 'inherit', outline: 'none' }
  const labelStyle = { display: 'block', fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 6 }
  return (
    <div>
      <div style={{ fontSize: 15, fontWeight: 800, color: NAVY, marginBottom: 20 }}>👤 プロフィール</div>
      <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 1px 8px rgba(26,58,92,0.08)', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {[
          { label: '氏名', key: 'name', type: 'text' },
          { label: '事務所名', key: 'office', type: 'text' },
          { label: '対応分野', key: 'field', type: 'text' },
          { label: '対応エリア', key: 'area', type: 'text' },
        ].map(({ label, key, type }) => (
          <div key={key}>
            <label style={labelStyle}>{label}</label>
            <input style={fieldStyle} type={type} value={form[key]} onChange={set(key)} />
          </div>
        ))}
        <div>
          <label style={labelStyle}>プロフィール文</label>
          <textarea style={{ ...fieldStyle, resize: 'vertical' }} value={form.profile} onChange={set('profile')} rows={4} />
        </div>
        <button style={{ background: GOLD, color: '#fff', border: 'none', borderRadius: 10, padding: '12px 0', fontSize: 15, fontWeight: 800, cursor: 'pointer' }}>
          保存する
        </button>
      </div>
    </div>
  )
}

export default function ExpertDashboard({ onNavigate, onUpgrade }) {
  const [activeSection, setActiveSection] = useState('dashboard')
  const [isPremium] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [isUpgrading, setIsUpgrading] = useState(false)
  const [user, setUser] = useState(window.__houseAiUser || null)
  const [showLogin, setShowLogin] = useState(false)

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  useEffect(() => {
    const id = setInterval(() => {
      const u = window.__houseAiUser || null
      setUser(prev => prev?.id !== u?.id ? u : prev)
    }, 500)
    return () => clearInterval(id)
  }, [])

  const handleUpgrade = async (priceId) => {
    const user = window.__houseAiUser
    if (!user) return
    setIsUpgrading(true)
    try {
      const res = await fetch('/api/stripe-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, email: user.email, priceId }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else alert('決済ページの読み込みに失敗しました')
    } catch {
      alert('決済ページの読み込みに失敗しました')
    } finally {
      setIsUpgrading(false)
    }
  }

  if (!user) {
    return (
      <>
        <div style={{ minHeight: '100vh', background: '#eef2f7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 40, width: 360, boxShadow: '0 4px 24px rgba(0,0,0,0.1)', textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>👔</div>
            <h2 style={{ color: '#1a3a5c', marginBottom: 4, fontSize: 20 }}>専門家ダッシュボード</h2>
            <p style={{ color: '#777', fontSize: 13, marginBottom: 24 }}>ログインしてご利用ください</p>
            <p style={{ color: '#555', fontSize: 12, background: '#f8fafc', borderRadius: 8, padding: 12 }}>
              ※ 審査済みの専門家アカウントのみログイン可能です。<br />
              登録をご希望の方は「専門家紹介」ページよりお申込みください。
            </p>
            <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                onClick={(e) => { e.stopPropagation(); e.preventDefault(); setShowLogin(true); }}
                style={{ padding: '10px 24px', background: '#1a3a5c', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, cursor: 'pointer', fontWeight: 700 }}
              >
                ログインする
              </button>
              <button
                onClick={() => window.location.href = '/'}
                style={{ padding: '10px 24px', background: 'transparent', color: '#1a3a5c', border: '1px solid #1a3a5c', borderRadius: 8, fontSize: 13, cursor: 'pointer', fontWeight: 700 }}
              >
                サイトトップに戻る
              </button>
            </div>
          </div>
        </div>
        {showLogin && ReactDOM.createPortal(
          <>
            <div onClick={() => setShowLogin(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999 }} />
            <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#fff', borderRadius: '24px 24px 0 0', padding: '32px 24px 48px', zIndex: 10000, maxHeight: '90dvh', overflowY: 'auto' }}>
              <button onClick={() => setShowLogin(false)} style={{ position: 'absolute', top: 16, right: 16, fontSize: 24, background: 'none', border: 'none', cursor: 'pointer', color: '#666', lineHeight: 1 }}>×</button>
              <AuthPanel onLoginSuccess={() => setShowLogin(false)} />
            </div>
          </>,
          document.body
        )}
      </>
    )
  }

  const renderMain = () => {
    if (activeSection === 'dashboard') return <SectionDashboard isPremium={isPremium} setActiveSection={setActiveSection} />
    if (activeSection === 'consultations') return <SectionConsultations />
    if (activeSection === 'messages') return <SectionMessages setActiveSection={setActiveSection} />
    if (activeSection === 'plan') return <SectionPlan isPremium={isPremium} setActiveSection={setActiveSection} handleUpgrade={handleUpgrade} isUpgrading={isUpgrading} />
    if (activeSection === 'profile') return <SectionProfile />
    return null
  }

  return (
    <div style={{ color: TEXT, fontFamily: 'inherit', minHeight: '100vh', background: GRAY }}>

      {/* ヘッダー */}
      <div style={{ background: NAVY, padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>🏛️ 専門家ダッシュボード</div>
        <button
          onClick={() => onNavigate?.('expertlp')}
          style={{ background: GOLD, color: '#fff', border: 'none', borderRadius: 8, padding: '8px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
        >
          📋 LPに戻る
        </button>
      </div>

      {/* コンテンツエリア */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '16px', display: isMobile ? 'block' : 'flex', gap: 20, alignItems: 'flex-start' }}>

        {/* サイドバー */}
        <div style={{ width: isMobile ? '100%' : 240, flexShrink: 0, background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 1px 8px rgba(26,58,92,0.08)', marginBottom: isMobile ? 16 : 0 }}>
          {isMobile ? (
            <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
              {SIDEBAR_ITEMS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  style={{
                    padding: '7px 12px', border: 'none', borderRadius: 8, cursor: 'pointer', whiteSpace: 'nowrap',
                    fontSize: 12, fontWeight: 700,
                    background: activeSection === item.id ? NAVY : GRAY,
                    color: activeSection === item.id ? '#fff' : '#475569',
                  }}
                >
                  {item.icon} {item.label}
                </button>
              ))}
            </div>
          ) : (
            <>
              {SIDEBAR_ITEMS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  style={{
                    width: '100%', textAlign: 'left', border: 'none', borderRadius: 8, cursor: 'pointer',
                    padding: '10px 12px', marginBottom: 4,
                    fontSize: 14, fontWeight: 700,
                    background: activeSection === item.id ? NAVY : 'transparent',
                    color: activeSection === item.id ? '#fff' : '#475569',
                  }}
                >
                  {item.icon} {item.label}
                </button>
              ))}
              <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid #f1f5f9' }}>
                <span style={{ background: GRAY, color: '#64748b', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20 }}>
                  フリープラン
                </span>
              </div>
            </>
          )}
        </div>

        {/* メインコンテンツ */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {renderMain()}
        </div>
      </div>
    </div>
  )
}
