import { useState, useEffect } from 'react'

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
  return (
    <div>
      {/* 成功体験演出カード */}
      <div style={{ background: 'linear-gradient(135deg, #1a3a5c 0%, #2a4a7c 100%)', borderRadius: 16, padding: '20px 24px', marginBottom: 16, color: 'white' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <span style={{ fontSize: 20 }}>🎉</span>
          <span style={{ fontSize: 15, fontWeight: 800 }}>初めての相談が届きました！</span>
        </div>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', margin: '0 0 12px', lineHeight: 1.6 }}>
          あなたのプロフィール閲覧数：<strong style={{ color: '#c9a84c' }}>12回</strong>、相談：<strong style={{ color: '#c9a84c' }}>1件</strong><br />
          スタンダードプランなら<strong style={{ color: '#c9a84c', fontSize: 16 }}>3倍</strong>届く可能性があります
        </p>
        <button onClick={() => setActiveSection('plan')} style={{ background: '#c9a84c', border: 'none', borderRadius: 8, padding: '10px 20px', color: '#1a3a5c', fontSize: 13, fontWeight: 800, cursor: 'pointer' }}>
          優先表示で相談数アップ →
        </button>
      </div>

      {/* ① サマリーカード */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { icon: '👁️', label: 'プロフィール閲覧数', value: MOCK_STATS.views, unit: '' },
          { icon: '📩', label: '今月の相談数', value: MOCK_STATS.consultations, unit: '件' },
          { icon: '💬', label: '返信率', value: MOCK_STATS.replyRate, unit: '%' },
          { icon: '✅', label: '対応完了', value: MOCK_STATS.closed, unit: '件' },
        ].map((s) => (
          <div key={s.label} style={{
            background: '#fff', borderRadius: 12, padding: 20,
            boxShadow: '0 1px 8px rgba(26,58,92,0.08)', textAlign: 'center',
          }}>
            <div style={{ fontSize: 24, marginBottom: 4 }}>{s.icon}</div>
            <div style={{ fontSize: 11, color: '#64748b', marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: 32, fontWeight: 800, color: NAVY }}>{s.value}<span style={{ fontSize: 16 }}>{s.unit}</span></div>
          </div>
        ))}
      </div>

      {/* 表示順位トリガー */}
      <div style={{ background: 'white', borderRadius: 12, padding: '16px 20px', marginBottom: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>現在の表示順位</p>
          <p style={{ margin: '4px 0 0', fontSize: 24, fontWeight: 800, color: '#1a3a5c' }}>
            {MOCK_TRIGGERS.displayRank}<span style={{ fontSize: 14, fontWeight: 400 }}>位</span>
          </p>
          <p style={{ margin: '4px 0 0', fontSize: 12, color: '#94a3b8' }}>スタンダードで<strong style={{ color: '#c9a84c' }}>優先表示</strong>されます</p>
        </div>
        <button onClick={() => setActiveSection('plan')} style={{ background: '#f0f4ff', border: '1.5px solid #1a3a5c', borderRadius: 8, padding: '8px 16px', color: '#1a3a5c', fontSize: 12, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
          順位を上げる →
        </button>
      </div>

      {/* ② AI評価カード */}
      <div style={{
        background: `linear-gradient(135deg, ${NAVY} 0%, #0f2540 100%)`,
        borderRadius: 12, padding: 24, marginBottom: 20, color: '#fff',
      }}>
        <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 16 }}>🤖 AI評価</div>
        <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
          {[
            { label: '表示順位', value: '中' },
            { label: '返信速度', value: 'やや遅い' },
            { label: 'おすすめ度', value: 'B+' },
          ].map((item) => (
            <div key={item.label} style={{
              background: 'rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 14px', flex: '1 1 auto', textAlign: 'center',
            }}>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginBottom: 4 }}>{item.label}</div>
              <div style={{ fontSize: 16, fontWeight: 800 }}>{item.value}</div>
            </div>
          ))}
        </div>
        <div style={{ marginBottom: 16 }}>
          {['返信を早めると表示順位が上がります', 'プロフィールを充実させると相談が増えます'].map((tip) => (
            <div key={tip} style={{ fontSize: 12, color: GOLD, marginBottom: 4 }}>・{tip}</div>
          ))}
        </div>
        <button
          onClick={() => setActiveSection('plan')}
          style={{ background: GOLD, color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 13, fontWeight: 800, cursor: 'pointer' }}
        >
          もっと相談を増やす →
        </button>
      </div>

      {/* ③④ 新着相談 + ぼかし */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: NAVY }}>📩 新着相談</div>
          <button
            onClick={() => setActiveSection('consultations')}
            style={{ background: 'none', border: 'none', color: NAVY, fontSize: 13, fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
          >
            すべて見る
          </button>
        </div>
        {MOCK_CONSULTATIONS.slice(0, 3).map((item) => (
          <ConsultationCard key={item.id} item={item} />
        ))}

        {!isPremium && (
          <div style={{ position: 'relative' }}>
            <div style={{ filter: 'blur(4px)', pointerEvents: 'none' }}>
              {MOCK_CONSULTATIONS.slice(3).map((item) => (
                <ConsultationCard key={item.id} item={item} />
              ))}
            </div>
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(255,255,255,0.7)', borderRadius: 8,
              gap: 12,
            }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>さらに3件の相談があります</div>
              <button
                onClick={() => setActiveSection('plan')}
                style={{ background: GOLD, color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 13, fontWeight: 800, cursor: 'pointer' }}
              >
                スタンダードで全て閲覧 →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 取り逃しトリガー */}
      <div style={{ background: '#fff8f0', border: '1.5px solid #f59e0b', borderRadius: 12, padding: '16px 20px', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#92400e' }}>
            😢 他の専門家に<strong style={{ fontSize: 16, color: '#d97706' }}>{MOCK_TRIGGERS.missedConsultations}件</strong>の相談が送信されました
          </p>
          <p style={{ margin: '4px 0 0', fontSize: 12, color: '#b45309' }}>優先表示で取り逃しを減らせます</p>
        </div>
        <button onClick={() => setActiveSection('plan')} style={{ background: '#f59e0b', border: 'none', borderRadius: 8, padding: '8px 16px', color: 'white', fontSize: 12, fontWeight: 800, cursor: 'pointer', whiteSpace: 'nowrap' }}>
          優先表示にする →
        </button>
      </div>

      {/* ⑤ アップグレード誘導カード */}
      <div style={{
        background: `linear-gradient(135deg, ${GOLD} 0%, #a87c2a 100%)`,
        borderRadius: 12, padding: 24, marginBottom: 20,
      }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: NAVY, marginBottom: 12 }}>もっと相談を増やしませんか？</div>
        {['案件通知', 'DM制限解除', 'AI優先表示', '相談数上限UP'].map((item) => (
          <div key={item} style={{ fontSize: 13, color: NAVY, marginBottom: 6 }}>✅ {item}</div>
        ))}
        <button
          onClick={() => setActiveSection('plan')}
          style={{ marginTop: 12, background: NAVY, color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 13, fontWeight: 800, cursor: 'pointer' }}
        >
          スタンダードにアップグレード
        </button>
      </div>

      {/* ⑥ プロフィール完成度 */}
      <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 8px rgba(26,58,92,0.08)' }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: NAVY, marginBottom: 12 }}>プロフィール完成度</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <div style={{ flex: 1, height: 8, background: '#e2e8f0', borderRadius: 4 }}>
            <div style={{ width: '70%', height: '100%', background: GOLD, borderRadius: 4 }} />
          </div>
          <span style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>70%</span>
        </div>
        <div style={{ marginBottom: 12 }}>
          {['実績未入力', '写真未設定'].map((item) => (
            <div key={item} style={{ fontSize: 12, color: '#ef4444', marginBottom: 4 }}>・{item}</div>
          ))}
        </div>
        <button
          onClick={() => setActiveSection('profile')}
          style={{ background: '#fff', color: NAVY, border: `1.5px solid ${NAVY}`, borderRadius: 8, padding: '8px 16px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
        >
          プロフィールを充実させる
        </button>
      </div>
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
              onClick={() => window.dispatchEvent(new CustomEvent('show-auth-sheet'))}
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
