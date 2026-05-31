import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer,
} from 'recharts'
import {
  Search, ChevronDown, ChevronUp, Home, FileText, Calculator,
  TrendingUp, Users, Receipt, Building2, MapPin, BarChart2,
  Check, AlertTriangle, Info, ArrowRight, Star, Clock,
} from 'lucide-react'

// ─── Data ────────────────────────────────────────────────────────────────

const TAX_ITEMS = [
  {
    id: 'acquisition', name: '不動産取得税', timing: '購入後', rate: '評価額 × 3%',
    note: '軽減特例あり', color: '#3b82f6', Icon: Home,
    desc: '不動産を取得した際に一度だけ課税される地方税。住宅の場合は軽減措置が適用されます。',
  },
  {
    id: 'registration', name: '登録免許税', timing: '登記時', rate: '評価額 × 0.3〜2%',
    note: '登記の種類で変動', color: '#8b5cf6', Icon: FileText,
    desc: '所有権移転・抵当権設定など不動産登記を行う際に課税される国税です。',
  },
  {
    id: 'stamp', name: '印紙税', timing: '契約時', rate: '1,000〜60,000円',
    note: '軽減税率期間中', color: '#f59e0b', Icon: Receipt,
    desc: '売買契約書や金銭消費貸借契約書など取引書面に課税される国税です。',
  },
  {
    id: 'consumption', name: '消費税', timing: '購入時', rate: '建物価格 × 10%',
    note: '土地は非課税', color: '#ef4444', Icon: Calculator,
    desc: '建物（新築・中古問わず）の購入時に課税される税金。土地部分は非課税です。',
  },
  {
    id: 'property', name: '固定資産税', timing: '毎年課税', rate: '評価額 × 1.4%',
    note: '住宅用地は軽減', color: '#10b981', Icon: Building2,
    desc: '毎年1月1日時点の所有者に課税される市町村税。住宅用地は1/6〜1/3の特例があります。',
  },
  {
    id: 'city', name: '都市計画税', timing: '毎年課税', rate: '評価額 × 最高0.3%',
    note: '市街化区域のみ', color: '#06b6d4', Icon: MapPin,
    desc: '市街化区域内の不動産に課税される市町村税。固定資産税と合わせて納付します。',
  },
  {
    id: 'transfer', name: '譲渡所得税', timing: '売却後', rate: '短期20.3% / 長期15.3%',
    note: '3,000万特別控除あり', color: '#f97316', Icon: TrendingUp,
    desc: '不動産を売却して利益が出た場合に課税される国税。居住用財産の特例で大幅節税が可能です。',
  },
  {
    id: 'inheritance', name: '相続税・贈与税', timing: '相続・贈与時', rate: '累進税率（10〜55%）',
    note: '路線価評価が鍵', color: '#ec4899', Icon: Users,
    desc: '不動産を相続・贈与で取得した場合に課税される国税。評価額の算定方法が節税のポイントです。',
  },
  {
    id: 'income', name: '賃貸所得税', timing: '毎年確定申告', rate: '総合課税（5〜45%）',
    note: '必要経費計上が重要', color: '#84cc16', Icon: BarChart2,
    desc: '不動産賃貸による収入は不動産所得として確定申告が必要。減価償却・修繕費などが経費になります。',
  },
]

const LIFECYCLE_STAGES = [
  { id: 'prepare', name: '購入準備', taxes: ['印紙税', '登録免許税'], color: '#3b82f6' },
  { id: 'purchase', name: '購入・取得', taxes: ['不動産取得税', '消費税', '登録免許税'], color: '#8b5cf6' },
  { id: 'hold', name: '保有期間', taxes: ['固定資産税', '都市計画税', '賃貸所得税'], color: '#10b981' },
  { id: 'sell', name: '売却・譲渡', taxes: ['譲渡所得税', '印紙税'], color: '#f97316' },
  { id: 'inherit', name: '相続・贈与', taxes: ['相続税', '贈与税', '登録免許税'], color: '#ec4899' },
]

const RADAR_DATA = [
  { subject: '節税余地', value: 85, fullMark: 100 },
  { subject: '金額影響', value: 72, fullMark: 100 },
  { subject: '複雑度', value: 78, fullMark: 100 },
  { subject: '時間制約', value: 65, fullMark: 100 },
  { subject: '専門知識', value: 90, fullMark: 100 },
]

const FAQ_ITEMS = [
  {
    q: '不動産取得税の軽減措置はどのような場合に適用されますか？',
    a: '新築・中古の住宅用不動産を取得した場合、一定の要件を満たすと軽減措置が適用されます。新築住宅は床面積50〜240㎡で1,200万円（長期優良住宅は1,300万円）が課税標準から控除されます。中古住宅は築年数に応じた控除額があります。軽減後の税額がゼロになるケースも多いため、必ず都道府県税事務所へ申請しましょう。',
  },
  {
    q: '固定資産税の計算方法と節税のポイントを教えてください',
    a: '固定資産税 = 固定資産税評価額 × 1.4%（標準税率）で計算されます。住宅用地の場合、小規模住宅用地（200㎡以下）は評価額の1/6、一般住宅用地は1/3に軽減されます。新築住宅は3〜5年間、税額が1/2に減額されます（長期優良住宅は5〜7年）。評価額に異議がある場合は審査申出制度を利用できます。',
  },
  {
    q: '居住用財産の3,000万円特別控除とはどのような制度ですか？',
    a: 'マイホームを売却して譲渡所得が生じた場合、最大3,000万円を課税所得から控除できる制度です。所有期間に関わらず適用でき、夫婦共有の場合は各自3,000万円ずつ（最大6,000万円）控除可能です。売った年の2年前まで同様の控除を受けていないこと、売買双方が親族でないことなどの要件があります。確定申告が必要です。',
  },
  {
    q: '住宅ローン控除を受けるには確定申告が必要ですか？',
    a: '初年度は必ず確定申告が必要です。2年目以降は、給与所得者の場合は年末調整で手続きができます。控除額は住宅ローン年末残高の0.7%（2022年以降の入居）が所得税から控除されます。控除期間は新築・長期優良住宅が13年間、中古住宅が10年間です。合計所得金額2,000万円超の年は適用されません。',
  },
  {
    q: '相続した不動産を売却した場合の税金はどうなりますか？',
    a: '相続した不動産の譲渡所得は、被相続人が取得した時の価格（取得費）と取得時期を引き継ぎます。長期保有（5年超）の場合は税率が15.315%（住民税・復興特別所得税含む）と低くなります。相続税申告期限から3年以内の売却であれば、支払った相続税の一部を取得費に加算できる「相続税の取得費加算特例」の活用も検討しましょう。',
  },
]

const SIMILAR_CASES = [
  {
    title: '新築マンション購入（5,000万円）',
    summary: '建物3,500万円 + 土地1,500万円の新築マンション購入時の税金整理',
    taxes: [
      { name: '消費税', amount: '350万円', note: '建物部分に課税' },
      { name: '不動産取得税', amount: '約0円', note: '軽減措置適用後' },
      { name: '登録免許税', amount: '約15万円', note: '軽減税率適用' },
      { name: '住宅ローン控除', amount: '△最大455万円', note: '13年間の総額' },
    ],
    tag: '購入', tagColor: '#3b82f6',
  },
  {
    title: '築15年一戸建て売却（4,500万円）',
    summary: '5,000万円で購入した一戸建てを15年後に売却する場合の税金整理',
    taxes: [
      { name: '譲渡所得', amount: 'マイナス（損失）', note: '取得費・譲渡費用考慮後' },
      { name: '譲渡所得税', amount: '約0円', note: '特別控除適用で非課税' },
      { name: '印紙税', amount: '1万円', note: '売買契約書に貼付' },
    ],
    tag: '売却', tagColor: '#f97316',
  },
  {
    title: '相続アパート活用（評価額3,000万円）',
    summary: '1棟アパートを相続し、そのまま賃貸経営を継続する場合の税金整理',
    taxes: [
      { name: '相続税', amount: '要計算', note: '他の相続財産と合算' },
      { name: '固定資産税', amount: '約24万円/年', note: '評価額3,000万円の場合' },
      { name: '賃貸所得税', amount: '実効税率次第', note: '青色申告特別控除可' },
    ],
    tag: '相続', tagColor: '#ec4899',
  },
]

// ─── 1. HeroSection ──────────────────────────────────────────────────────

function HeroSection({ onSearch }) {
  const [query, setQuery] = useState('')

  const quickLabels = [
    '不動産取得税', '固定資産税', '譲渡所得税', '消費税', '相続税', '登録免許税',
  ]

  return (
    <div style={{
      background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #1e40af 100%)',
      padding: '60px 20px 80px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: '-100px', right: '-100px',
        width: '400px', height: '400px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(59,130,246,0.2), transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '-80px', left: '-80px',
        width: '300px', height: '300px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(139,92,246,0.15), transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', maxWidth: '760px', margin: '0 auto', textAlign: 'center' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'rgba(59,130,246,0.2)', border: '1px solid rgba(59,130,246,0.4)',
            borderRadius: '999px', padding: '6px 16px', marginBottom: '24px',
          }}>
            <Star size={14} color="#60a5fa" />
            <span style={{ color: '#60a5fa', fontSize: '13px', fontWeight: 500 }}>AI対応・登録不要</span>
          </div>

          <h1 style={{
            fontSize: 'clamp(28px, 5vw, 52px)', fontWeight: 500,
            color: '#ffffff', lineHeight: 1.2, marginBottom: '16px',
          }}>
            不動産税金を<br />AIが整理します
          </h1>
          <p style={{
            color: '#94a3b8', fontSize: 'clamp(14px, 2vw, 18px)',
            marginBottom: '40px', lineHeight: 1.7,
          }}>
            購入・保有・売却・相続まで、複雑な税金を<br />
            わかりやすく整理してアドバイスします
          </p>

          <div style={{ display: 'flex', gap: '12px', maxWidth: '560px', margin: '0 auto 32px' }}>
            <input
              type="text"
              placeholder="例：マンション購入時の税金を知りたい"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' ? onSearch(query) : null}
              style={{
                flex: 1, padding: '14px 20px', borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.2)',
                background: 'rgba(255,255,255,0.1)', color: '#ffffff',
                fontSize: '16px', outline: 'none',
              }}
            />
            <button
              onClick={() => onSearch(query)}
              style={{
                padding: '14px 24px', background: '#2563eb', color: '#fff',
                border: 'none', borderRadius: '12px', cursor: 'pointer',
                fontSize: '15px', fontWeight: 500,
                display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap',
              }}
            >
              <Search size={18} />
              整理する
            </button>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
            {quickLabels.map(label => (
              <button
                key={label}
                onClick={() => onSearch(label)}
                style={{
                  padding: '6px 16px',
                  background: 'rgba(255,255,255,0.1)', color: '#cbd5e1',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '999px', cursor: 'pointer',
                  fontSize: '13px', fontWeight: 400, transition: 'all 0.2s',
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

// ─── 2. TaxPanels ────────────────────────────────────────────────────────

function TaxPanels() {
  const [selected, setSelected] = useState(null)

  return (
    <div style={{ background: '#f8fafc', padding: '60px 20px' }}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ textAlign: 'center', marginBottom: '40px' }}
        >
          <h2 style={{ fontSize: 'clamp(22px, 3vw, 36px)', fontWeight: 500, color: '#0f172a', marginBottom: '12px' }}>
            9種類の不動産税金
          </h2>
          <p style={{ color: '#64748b', fontSize: '15px' }}>タップして詳細を確認できます</p>
        </motion.div>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px',
        }}>
          {TAX_ITEMS.map((tax, idx) => {
            const TaxIcon = tax.Icon
            const isOpen = selected === tax.id
            return (
              <motion.div
                key={tax.id}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: idx * 0.05 }}
                onClick={() => setSelected(isOpen ? null : tax.id)}
                style={{
                  background: 'white', borderRadius: '16px', padding: '20px',
                  border: isOpen ? `2px solid ${tax.color}` : '1px solid #e2e8f0',
                  cursor: 'pointer', transition: 'all 0.2s',
                  boxShadow: isOpen ? `0 4px 20px ${tax.color}30` : '0 1px 4px rgba(0,0,0,0.04)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '12px',
                    background: `${tax.color}18`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <TaxIcon size={22} color={tax.color} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '15px', fontWeight: 500, color: '#0f172a', marginBottom: '4px' }}>
                      {tax.name}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Clock size={12} color="#94a3b8" />
                      <span style={{ fontSize: '12px', color: '#94a3b8' }}>{tax.timing}</span>
                    </div>
                  </div>
                </div>
                <div style={{ marginTop: '12px', padding: '8px 12px', background: `${tax.color}12`, borderRadius: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 500, color: tax.color }}>{tax.rate}</span>
                  <span style={{ fontSize: '12px', color: '#94a3b8', marginLeft: '8px' }}>{tax.note}</span>
                </div>
                {isOpen ? (
                  <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.7, marginTop: '12px', marginBottom: 0 }}>
                    {tax.desc}
                  </p>
                ) : null}
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── 3. LifecycleMap ─────────────────────────────────────────────────────

function LifecycleMap() {
  const [activeStage, setActiveStage] = useState(null)

  const active = LIFECYCLE_STAGES.find(s => s.id === activeStage) || null

  return (
    <div style={{ background: 'white', padding: '60px 20px' }}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ textAlign: 'center', marginBottom: '40px' }}
        >
          <h2 style={{ fontSize: 'clamp(22px, 3vw, 36px)', fontWeight: 500, color: '#0f172a', marginBottom: '12px' }}>
            ライフサイクル別 税金マップ
          </h2>
          <p style={{ color: '#64748b', fontSize: '15px' }}>どの段階でどの税金が発生するかを整理</p>
        </motion.div>

        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px' }}>
          {LIFECYCLE_STAGES.map((stage, idx) => {
            const isActive = activeStage === stage.id
            return (
              <div key={stage.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                <motion.button
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: idx * 0.1 }}
                  onClick={() => setActiveStage(isActive ? null : stage.id)}
                  style={{
                    minWidth: '140px', background: isActive ? stage.color : 'white',
                    border: `2px solid ${stage.color}`, borderRadius: '16px',
                    padding: '20px 16px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s',
                  }}
                >
                  <div style={{ fontSize: '14px', fontWeight: 500, color: isActive ? 'white' : stage.color, marginBottom: '8px' }}>
                    {stage.name}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {stage.taxes.map(tax => (
                      <span key={tax} style={{
                        fontSize: '11px', borderRadius: '999px', padding: '2px 8px',
                        color: isActive ? 'rgba(255,255,255,0.85)' : '#64748b',
                        background: isActive ? 'rgba(255,255,255,0.15)' : '#f1f5f9',
                      }}>
                        {tax}
                      </span>
                    ))}
                  </div>
                </motion.button>
                {idx < LIFECYCLE_STAGES.length - 1 ? (
                  <ArrowRight size={18} color="#94a3b8" />
                ) : null}
              </div>
            )
          })}
        </div>

        {active ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            style={{
              marginTop: '24px', background: '#f8fafc', borderRadius: '16px',
              padding: '20px', border: '1px solid #e2e8f0',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Info size={16} color="#2563eb" />
              <span style={{ fontWeight: 500, color: '#0f172a', fontSize: '14px' }}>
                {active.name}の税金ポイント
              </span>
            </div>
            <p style={{ color: '#475569', fontSize: '14px', lineHeight: 1.7, margin: 0 }}>
              この段階では<span style={{ fontWeight: 500, color: '#0f172a' }}>{active.taxes.join('・')}</span>が関係します。
              それぞれの税金の特例や軽減措置を活用することで、大幅な節税が可能です。
              詳細はAIに相談するか、専門家に相談することをお勧めします。
            </p>
          </motion.div>
        ) : null}
      </div>
    </div>
  )
}

// ─── 4. AIRadar ──────────────────────────────────────────────────────────

function AIRadar() {
  return (
    <div style={{ background: '#0f172a', padding: '60px 20px' }}>
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ textAlign: 'center', marginBottom: '40px' }}
        >
          <h2 style={{ fontSize: 'clamp(22px, 3vw, 36px)', fontWeight: 500, color: '#ffffff', marginBottom: '12px' }}>
            不動産税金 AI分析レーダー
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '15px' }}>5軸で不動産税金の特性を可視化</p>
        </motion.div>

        <div style={{
          background: 'rgba(255,255,255,0.05)', borderRadius: '24px', padding: '32px',
          border: '1px solid rgba(255,255,255,0.1)',
        }}>
          <ResponsiveContainer width="100%" height={320}>
            <RadarChart data={RADAR_DATA}>
              <PolarGrid stroke="rgba(255,255,255,0.15)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 13 }} />
              <Radar
                name="不動産税金" dataKey="value"
                stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px', marginTop: '24px' }}>
            {RADAR_DATA.map(item => (
              <div key={item.subject} style={{
                background: 'rgba(255,255,255,0.06)', borderRadius: '12px', padding: '12px 16px',
              }}>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>{item.subject}</div>
                <div style={{ fontSize: '20px', fontWeight: 500, color: '#3b82f6' }}>
                  {item.value}<span style={{ fontSize: '12px', color: '#64748b' }}>/100</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── 5. SEOAccordion ─────────────────────────────────────────────────────

function SEOAccordion() {
  const [openIndex, setOpenIndex] = useState(null)

  return (
    <div style={{ background: '#f8fafc', padding: '60px 20px' }}>
      <div style={{ maxWidth: '760px', margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ textAlign: 'center', marginBottom: '40px' }}
        >
          <h2 style={{ fontSize: 'clamp(22px, 3vw, 36px)', fontWeight: 500, color: '#0f172a', marginBottom: '12px' }}>
            税金ガイド よくある質問
          </h2>
          <p style={{ color: '#64748b', fontSize: '15px' }}>不動産税金についてよくある疑問を整理します</p>
        </motion.div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {FAQ_ITEMS.map((item, idx) => {
            const isOpen = openIndex === idx
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: idx * 0.05 }}
                style={{
                  background: 'white', borderRadius: '16px',
                  border: isOpen ? '1px solid #3b82f6' : '1px solid #e2e8f0',
                  overflow: 'hidden', transition: 'border-color 0.2s',
                }}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  style={{
                    width: '100%', padding: '20px 24px', background: 'none',
                    border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px',
                    textAlign: 'left',
                  }}
                >
                  <span style={{ fontSize: '15px', fontWeight: 500, color: '#0f172a', lineHeight: 1.6 }}>
                    Q. {item.q}
                  </span>
                  {isOpen ? (
                    <ChevronUp size={18} color="#3b82f6" style={{ flexShrink: 0 }} />
                  ) : (
                    <ChevronDown size={18} color="#94a3b8" style={{ flexShrink: 0 }} />
                  )}
                </button>
                {isOpen ? (
                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    style={{ padding: '0 24px 20px' }}
                  >
                    <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                      <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.8, margin: 0 }}>
                        {item.a}
                      </p>
                    </div>
                  </motion.div>
                ) : null}
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── 6. PropertyCalculator ───────────────────────────────────────────────

function PropertyCalculator({ onNavigateToChat }) {
  const [form, setForm] = useState({ propertyType: '', price: '', isNew: '', purpose: '' })
  const [result, setResult] = useState(null)

  const handleChange = (key, value) => setForm(f => ({ ...f, [key]: value }))

  const handleCalculate = () => {
    if (!form.price || !form.propertyType) return
    const price = parseInt(form.price, 10) * 10000
    const buildingRatio = form.propertyType === '土地' ? 0 : 0.6
    const buildingPrice = price * buildingRatio
    const consumptionTax = form.isNew === 'new' ? buildingPrice * 0.1 : 0
    const regTax = price * 0.002
    const acquisitionTax = form.isNew === 'new' ? 0 : Math.max(0, price * 0.015 - 1200000)
    const stampTax = price >= 500000000 ? 60000 : price >= 100000000 ? 30000 : price >= 50000000 ? 20000 : price >= 10000000 ? 5000 : 1000
    const annualPropertyTax = price * 0.014 / 6
    setResult({ consumptionTax, regTax, acquisitionTax, stampTax, annualPropertyTax })
  }

  const fmt = v => v >= 10000 ? `約${Math.round(v / 10000)}万円` : `約${Math.round(v).toLocaleString()}円`

  const canCalc = form.price && form.propertyType

  return (
    <div style={{ background: 'white', padding: '60px 20px' }}>
      <div style={{ maxWidth: '760px', margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ textAlign: 'center', marginBottom: '40px' }}
        >
          <h2 style={{ fontSize: 'clamp(22px, 3vw, 36px)', fontWeight: 500, color: '#0f172a', marginBottom: '12px' }}>
            AI購入予定物件 税金整理
          </h2>
          <p style={{ color: '#64748b', fontSize: '15px' }}>物件情報を入力して税金の概算を整理します</p>
        </motion.div>

        <div style={{ background: '#f8fafc', borderRadius: '24px', padding: '32px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            {[
              { key: 'propertyType', label: '物件種別', opts: ['マンション', '一戸建て', '土地'] },
              { key: 'isNew', label: '新築・中古', opts: [{ v: 'new', l: '新築' }, { v: 'used', l: '中古' }] },
              { key: 'purpose', label: '購入目的', opts: [{ v: 'resident', l: '居住用' }, { v: 'investment', l: '投資用' }] },
            ].map(({ key, label, opts }) => (
              <div key={key}>
                <label style={{ fontSize: '13px', fontWeight: 500, color: '#475569', display: 'block', marginBottom: '8px' }}>
                  {label}
                </label>
                <select
                  value={form[key]}
                  onChange={e => handleChange(key, e.target.value)}
                  style={{
                    width: '100%', padding: '12px 16px', borderRadius: '10px',
                    border: '1px solid #e2e8f0', background: 'white',
                    fontSize: '16px', color: '#0f172a', outline: 'none',
                  }}
                >
                  <option value="">選択してください</option>
                  {opts.map(o => typeof o === 'string' ? (
                    <option key={o} value={o}>{o}</option>
                  ) : (
                    <option key={o.v} value={o.v}>{o.l}</option>
                  ))}
                </select>
              </div>
            ))}

            <div>
              <label style={{ fontSize: '13px', fontWeight: 500, color: '#475569', display: 'block', marginBottom: '8px' }}>
                物件価格（万円）
              </label>
              <input
                type="number"
                placeholder="例：4500"
                value={form.price}
                onChange={e => handleChange('price', e.target.value)}
                style={{
                  width: '100%', padding: '12px 16px', borderRadius: '10px',
                  border: '1px solid #e2e8f0', background: 'white',
                  fontSize: '16px', color: '#0f172a', outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          <button
            onClick={handleCalculate}
            disabled={!canCalc}
            style={{
              width: '100%', padding: '16px', border: 'none', borderRadius: '12px',
              cursor: canCalc ? 'pointer' : 'not-allowed', fontSize: '16px', fontWeight: 500,
              background: canCalc ? '#2563eb' : '#e2e8f0',
              color: canCalc ? 'white' : '#94a3b8', transition: 'all 0.2s',
            }}
          >
            概算を整理する
          </button>

          {result ? (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <Check size={16} color="#10b981" />
                <span style={{ fontSize: '14px', fontWeight: 500, color: '#0f172a' }}>税金概算結果</span>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>（目安・実際は異なります）</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px' }}>
                {[
                  { label: '消費税', value: result.consumptionTax, note: '建物部分' },
                  { label: '不動産取得税', value: result.acquisitionTax, note: '軽減後概算' },
                  { label: '登録免許税', value: result.regTax, note: '所有権移転' },
                  { label: '印紙税', value: result.stampTax, note: '売買契約書' },
                  { label: '固定資産税/年', value: result.annualPropertyTax, note: '概算' },
                ].map(item => (
                  <div key={item.label} style={{
                    background: 'white', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0',
                  }}>
                    <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>{item.label}</div>
                    <div style={{ fontSize: '18px', fontWeight: 500, color: '#0f172a' }}>{fmt(item.value)}</div>
                    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>{item.note}</div>
                  </div>
                ))}
              </div>
              <button
                onClick={onNavigateToChat}
                style={{
                  width: '100%', marginTop: '16px', padding: '14px',
                  background: 'linear-gradient(135deg, #1e3a5f, #2563eb)',
                  color: 'white', border: 'none', borderRadius: '12px',
                  cursor: 'pointer', fontSize: '15px', fontWeight: 500,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                }}
              >
                <Star size={16} />
                AIで詳しく整理する
              </button>
            </motion.div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

// ─── 7. CheckpointStatus ─────────────────────────────────────────────────

const CHECKPOINTS = [
  { status: 'ok', label: '住宅ローン控除の適用要件', detail: '所得2,000万円以下・床面積50㎡以上・自己居住用' },
  { status: 'warn', label: '居住用財産の3,000万円特別控除', detail: '売却前に専門家への相談を推奨します' },
  { status: 'info', label: '不動産取得税の申請手続き', detail: '取得後60日以内に都道府県税事務所へ申請が必要' },
  { status: 'ok', label: '固定資産税の住宅用地特例', detail: '住宅が建っていれば自動的に適用されます' },
  { status: 'warn', label: '相続税・贈与税の申告期限', detail: '相続開始から10ヶ月以内・専門家確認を推奨' },
  { status: 'info', label: '確定申告の要否確認', detail: '給与所得者でも不動産所得がある場合は申告必須' },
]

const STATUS_CONFIG = {
  ok:   { color: '#10b981', bg: '#ecfdf5', Icon: Check,         label: '確認済み' },
  warn: { color: '#f59e0b', bg: '#fffbeb', Icon: AlertTriangle, label: '要確認' },
  info: { color: '#3b82f6', bg: '#eff6ff', Icon: Info,          label: '情報' },
}

function CheckpointStatus({ onNavigateToExpert }) {
  return (
    <div style={{ background: '#f8fafc', padding: '60px 20px' }}>
      <div style={{ maxWidth: '760px', margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ textAlign: 'center', marginBottom: '40px' }}
        >
          <h2 style={{ fontSize: 'clamp(22px, 3vw, 36px)', fontWeight: 500, color: '#0f172a', marginBottom: '12px' }}>
            AI確認ポイント
          </h2>
          <p style={{ color: '#64748b', fontSize: '15px' }}>見落としやすいポイントをAIが整理</p>
        </motion.div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {CHECKPOINTS.map((cp, idx) => {
            const cfg = STATUS_CONFIG[cp.status]
            const CpIcon = cfg.Icon
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }} transition={{ delay: idx * 0.05 }}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: '16px',
                  background: 'white', borderRadius: '14px', padding: '16px 20px',
                  border: `1px solid ${cfg.color}30`,
                }}
              >
                <div style={{
                  width: '36px', height: '36px', borderRadius: '10px', background: cfg.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <CpIcon size={18} color={cfg.color} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 500, color: '#0f172a' }}>{cp.label}</span>
                    <span style={{
                      fontSize: '11px', padding: '2px 8px', borderRadius: '999px',
                      background: cfg.bg, color: cfg.color, fontWeight: 500,
                    }}>
                      {cfg.label}
                    </span>
                  </div>
                  <p style={{ fontSize: '13px', color: '#64748b', margin: 0, lineHeight: 1.6 }}>{cp.detail}</p>
                </div>
              </motion.div>
            )
          })}
        </div>

        <motion.button
          initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          onClick={onNavigateToExpert}
          style={{
            width: '100%', marginTop: '24px', padding: '16px',
            background: 'white', border: '1.5px solid #f59e0b', borderRadius: '14px',
            cursor: 'pointer', fontSize: '15px', fontWeight: 500, color: '#92400e',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          }}
        >
          <AlertTriangle size={18} color="#f59e0b" />
          要確認ポイントを専門家に相談する
        </motion.button>
      </div>
    </div>
  )
}

// ─── 8. SimilarCases ─────────────────────────────────────────────────────

function SimilarCases({ onNavigateToExpert }) {
  return (
    <div style={{ background: 'white', padding: '60px 20px' }}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ textAlign: 'center', marginBottom: '40px' }}
        >
          <h2 style={{ fontSize: 'clamp(22px, 3vw, 36px)', fontWeight: 500, color: '#0f172a', marginBottom: '12px' }}>
            類似事例 3件
          </h2>
          <p style={{ color: '#64748b', fontSize: '15px' }}>実際のケースから学ぶ税金整理の実例</p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {SIMILAR_CASES.map((c, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: idx * 0.1 }}
              style={{ background: '#f8fafc', borderRadius: '20px', padding: '24px', border: '1px solid #e2e8f0' }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 500, color: '#0f172a', lineHeight: 1.5, margin: 0 }}>
                  {c.title}
                </h3>
                <span style={{
                  fontSize: '12px', fontWeight: 500, whiteSpace: 'nowrap', flexShrink: 0,
                  background: `${c.tagColor}18`, color: c.tagColor, padding: '4px 10px', borderRadius: '999px',
                }}>
                  {c.tag}
                </span>
              </div>
              <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px', lineHeight: 1.6 }}>{c.summary}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {c.taxes.map((tax, tIdx) => (
                  <div key={tIdx} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    background: 'white', borderRadius: '10px', padding: '10px 14px', border: '1px solid #f1f5f9',
                  }}>
                    <span style={{ fontSize: '13px', color: '#475569' }}>{tax.name}</span>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '13px', fontWeight: 500, color: '#0f172a' }}>{tax.amount}</div>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>{tax.note}</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{
            marginTop: '32px', padding: '20px 24px', background: '#eff6ff',
            borderRadius: '16px', border: '1px solid #bfdbfe',
            display: 'flex', alignItems: 'center', gap: '16px',
          }}
        >
          <Info size={20} color="#2563eb" style={{ flexShrink: 0 }} />
          <p style={{ fontSize: '14px', color: '#1e40af', lineHeight: 1.7, margin: 0, flex: 1 }}>
            実際の税額は物件の詳細条件・適用される特例・その他の事情によって大きく異なります。
            正確な情報は税理士への相談をお勧めします。
          </p>
          <button
            onClick={onNavigateToExpert}
            style={{
              padding: '10px 20px', background: '#2563eb', color: 'white',
              border: 'none', borderRadius: '10px', cursor: 'pointer',
              fontSize: '14px', fontWeight: 500, whiteSpace: 'nowrap',
            }}
          >
            税理士を探す
          </button>
        </motion.div>
      </div>
    </div>
  )
}

// ─── 9. FinalCTA ─────────────────────────────────────────────────────────

const CTA_ITEMS = [
  { label: 'AI整理する',      desc: '複雑な税金をAIが無料で整理',   bg: 'linear-gradient(135deg, #1e3a5f, #2563eb)', action: 'chat' },
  { label: '税理士を探す',    desc: '確定申告・節税対策のプロ',       bg: 'linear-gradient(135deg, #4c1d95, #7c3aed)', action: 'expert-matching' },
  { label: '司法書士を探す',  desc: '登記・不動産の法律実務のプロ',   bg: 'linear-gradient(135deg, #134e4a, #0d9488)', action: 'expert-matching' },
  { label: '不動産会社を探す',desc: '地元エリアの取引のプロ',         bg: 'linear-gradient(135deg, #78350f, #d97706)', action: 'expert-matching' },
]

function FinalCTA({ onNavigate }) {
  return (
    <div style={{ background: '#0f172a', padding: '60px 20px 100px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ textAlign: 'center', marginBottom: '48px' }}
        >
          <h2 style={{ fontSize: 'clamp(24px, 3vw, 40px)', fontWeight: 500, color: '#ffffff', marginBottom: '12px' }}>
            次の一歩を踏み出しましょう
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '16px' }}>AIまたは専門家があなたの税金を整理します</p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
          {CTA_ITEMS.map((cta, idx) => (
            <motion.button
              key={idx}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: idx * 0.08 }}
              onClick={() => onNavigate(cta.action)}
              whileHover={{ y: -4 }}
              style={{
                background: cta.bg, border: 'none', borderRadius: '20px',
                padding: '28px 20px', cursor: 'pointer', textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '18px', fontWeight: 500, color: 'white', marginBottom: '8px' }}>{cta.label}</div>
              <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>{cta.desc}</div>
            </motion.button>
          ))}
        </div>

        <motion.button
          initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          onClick={() => onNavigate('expert-matching')}
          style={{
            width: '100%', marginTop: '24px', padding: '18px',
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '16px', cursor: 'pointer',
            fontSize: '16px', fontWeight: 500, color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          }}
        >
          <Users size={20} />
          専門家に相談する
        </motion.button>
      </div>
    </div>
  )
}

// ─── 10. LegalNotice ─────────────────────────────────────────────────────

function LegalNotice() {
  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      background: 'rgba(15,23,42,0.96)',
      borderTop: '1px solid rgba(255,255,255,0.1)',
      padding: '8px 20px',
      zIndex: 9000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <p style={{
        fontSize: '11px', color: 'rgba(255,255,255,0.45)',
        margin: 0, textAlign: 'center', lineHeight: 1.6,
      }}>
        本ページの情報は一般的な参考情報であり、法的・税務的アドバイスを提供するものではありません。
        実際の税務判断は必ず税理士等の専門家にご相談ください。
      </p>
    </div>
  )
}

// ─── Main Export ─────────────────────────────────────────────────────────

export default function RealEstateTaxPage({ onNavigate }) {
  const navigate = view => {
    window.dispatchEvent(new CustomEvent('navigate-tab', { detail: view }))
    if (onNavigate) onNavigate(view)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <HeroSection onSearch={() => navigate('chat')} />
      <TaxPanels />
      <LifecycleMap />
      <AIRadar />
      <SEOAccordion />
      <PropertyCalculator onNavigateToChat={() => navigate('chat')} />
      <CheckpointStatus onNavigateToExpert={() => navigate('expert-matching')} />
      <SimilarCases onNavigateToExpert={() => navigate('expert-matching')} />
      <FinalCTA onNavigate={navigate} />
      <LegalNotice />
    </div>
  )
}
