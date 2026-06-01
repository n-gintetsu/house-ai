import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts'

const TAGS = ['日当たり', '収納', '騒音', '湿気', '事故物件', '周辺環境', '価格妥当性', '防犯', '駐車場']

const ANALYZING_MESSAGES = [
  '画像を受信しました。',
  '写真8枚を解析中...',
  '間取りを分析しています...',
  '周辺施設を検索しています...',
  '全国の体験談を検索しています...',
  '類似物件と比較しています...',
  'リスク評価を作成しています...',
  '分析が完了しました。',
]

const RADAR_DATA = [
  { subject: '日当たり', value: 62 },
  { subject: '収納', value: 45 },
  { subject: '防犯', value: 80 },
  { subject: '騒音', value: 75 },
  { subject: '資産性', value: 70 },
  { subject: '周辺環境', value: 85 },
]

const CONCERN_CARDS = [
  {
    id: 'storage',
    title: '収納不足',
    summary: '写真から判断すると、収納スペースが限られています。',
    detail: '間取り図を分析した結果、リビング・ダイニング周辺の収納が少なく、季節用品や日用品の収納場所が不足する可能性があります。内見時にはウォークインクローゼットの有無、廊下収納、洗面台下の収納スペースを実際に計測することをお勧めします。',
  },
  {
    id: 'sunlight',
    title: '日当たり',
    summary: '南向きですが、近隣建物の影響が確認できません。',
    detail: '物件は南向きですが、周辺の建物配置によっては日照時間が制限される可能性があります。内見は午前10時から午後2時の間に行い、実際の日差しの入り方を確認してください。また、冬至の時期のシミュレーションをGoogle Mapsなどで事前確認することをお勧めします。',
  },
  {
    id: 'humidity',
    title: '湿気',
    summary: '築年数から湿気リスクを確認する必要があります。',
    detail: '築15年以上の物件では、浴室・洗面所・キッチンなどの水回りに湿気やカビのリスクが高まります。内見時には壁紙の変色、窓枠のカビ、押し入れの湿気臭を確認してください。換気システムの状態も重要なチェックポイントです。',
  },
]

function CircularScore({ score }) {
  const r = 54
  const circ = 2 * Math.PI * r
  const dash = (score / 100) * circ
  return (
    <div style={{ position: 'relative', width: 140, height: 140, margin: '0 auto' }}>
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="10" />
        <circle
          cx="70" cy="70" r={r}
          fill="none"
          stroke="#c9a84c"
          strokeWidth="10"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          transform="rotate(-90 70 70)"
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: '#c9a84c', fontSize: 32, fontWeight: 500, lineHeight: 1 }}>{score}</span>
        <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: 400 }}>点</span>
      </div>
    </div>
  )
}

function AIAvatar({ size }) {
  const s = size || 36
  return (
    <div style={{
      width: s, height: s, borderRadius: '50%',
      background: '#1a3a5c',
      border: '2px solid #c9a84c',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      <svg width={Math.round(s * 0.55)} height={Math.round(s * 0.55)} viewBox="0 0 18 18" fill="none">
        <path d="M2 8L9 2L16 8V16H12V11H6V16H2V8Z" stroke="#c9a84c" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    </div>
  )
}

function PulseDots() {
  return (
    <span style={{ display: 'inline-flex', gap: 4, alignItems: 'center' }}>
      {[0, 1, 2].map(i => (
        <span key={i} style={{
          display: 'inline-block', width: 7, height: 7, borderRadius: '50%',
          background: '#c9a84c',
          animation: 'aiDotPulse 1.1s infinite ease-in-out',
          animationDelay: `${i * 0.18}s`,
        }} />
      ))}
    </span>
  )
}

export default function AIInspectionPage({ onNavigate }) {
  const [step, setStep] = useState('input')
  const [searchText, setSearchText] = useState('')
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [shownMessages, setShownMessages] = useState([])
  const [isTyping, setIsTyping] = useState(false)
  const [expandedCard, setExpandedCard] = useState(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (step !== 'analyzing') return
    setShownMessages([])
    setIsTyping(false)
    const timeouts = []
    let delay = 400

    ANALYZING_MESSAGES.forEach((msg) => {
      const t1 = setTimeout(() => setIsTyping(true), delay)
      timeouts.push(t1)
      delay += 950
      const t2 = setTimeout(() => {
        setIsTyping(false)
        setShownMessages(prev => [...prev, msg])
      }, delay)
      timeouts.push(t2)
      delay += 280
    })

    const t3 = setTimeout(() => setStep('report'), delay + 3000)
    timeouts.push(t3)
    return () => timeouts.forEach(t => clearTimeout(t))
  }, [step])

  const handleTagClick = (tag) => {
    setSearchText(prev => prev ? prev + ' ' + tag : tag)
  }

  const handleFileChange = (e) => {
    setUploadedFiles(Array.from(e.target.files || []))
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragOver(false)
    const files = Array.from(e.dataTransfer.files || []).filter(f => f.type.startsWith('image/'))
    setUploadedFiles(files)
  }

  const GLOBAL_STYLE = `
    @keyframes aiDotPulse {
      0%, 80%, 100% { opacity: 0.3; transform: translateY(0); }
      40% { opacity: 1; transform: translateY(-3px); }
    }
    @keyframes aiMsgIn {
      from { opacity: 0; transform: translateY(10px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .ai-tag:hover { background: rgba(201,168,76,0.2) !important; border-color: rgba(201,168,76,0.5) !important; color: #c9a84c !important; }
    .ai-upload:hover { border-color: rgba(201,168,76,0.5) !important; }
    .ai-concern:hover { border-color: rgba(201,168,76,0.3) !important; }
  `

  /* ============================================================
   * SECTION 1: INPUT
   * ============================================================ */
  if (step === 'input') {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#08162b',
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
        padding: '52px 20px 100px',
      }}>
        <style>{GLOBAL_STYLE}</style>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>

          {/* Heading */}
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ fontSize: 11, fontWeight: 500, color: '#c9a84c', letterSpacing: '0.18em', marginBottom: 18, textTransform: 'uppercase' }}>
              AI内見チェック
            </div>
            <h1 style={{ color: '#fff', fontSize: 34, fontWeight: 500, lineHeight: 1.35, margin: '0 0 18px' }}>
              契約後の後悔は、<br />契約前には見えません
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.58)', fontSize: 15, fontWeight: 400, lineHeight: 1.75, margin: 0 }}>
              写真と気になる点を送るだけ。AIが内見前に確認すべきポイントを整理します。
            </p>
          </div>

          {/* Search bar */}
          <div style={{ marginBottom: 20 }}>
            <input
              type="text"
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              placeholder="気になることを入力してください"
              style={{
                width: '100%', boxSizing: 'border-box',
                padding: '18px 22px',
                fontSize: 17, fontWeight: 400,
                background: '#fff',
                border: '2px solid rgba(201,168,76,0.25)',
                borderRadius: 16, outline: 'none',
                color: '#1a3a5c', fontFamily: 'inherit',
              }}
            />
          </div>

          {/* Tags */}
          <div style={{ overflowX: 'auto', marginBottom: 28, paddingBottom: 6 }}>
            <div style={{ display: 'flex', gap: 8, width: 'max-content' }}>
              {TAGS.map(tag => (
                <button
                  key={tag}
                  className="ai-tag"
                  onClick={() => handleTagClick(tag)}
                  style={{
                    padding: '7px 16px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.14)',
                    borderRadius: 999,
                    color: 'rgba(255,255,255,0.75)',
                    fontSize: 13, fontWeight: 400,
                    cursor: 'pointer', whiteSpace: 'nowrap',
                    fontFamily: 'inherit', transition: 'all 0.15s',
                  }}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Upload area */}
          <div
            className="ai-upload"
            onDragOver={e => { e.preventDefault(); setIsDragOver(true) }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
            style={{
              border: `2px dashed ${isDragOver ? '#c9a84c' : 'rgba(255,255,255,0.18)'}`,
              borderRadius: 16,
              padding: '44px 24px',
              textAlign: 'center',
              cursor: 'pointer',
              marginBottom: 36,
              background: isDragOver ? 'rgba(201,168,76,0.05)' : 'rgba(255,255,255,0.02)',
              transition: 'all 0.2s',
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            <svg width="44" height="44" viewBox="0 0 44 44" fill="none" style={{ margin: '0 auto 14px', display: 'block' }}>
              <rect x="4" y="9" width="36" height="26" rx="3.5" stroke="rgba(201,168,76,0.55)" strokeWidth="1.6" />
              <circle cx="16" cy="19" r="3.5" stroke="rgba(201,168,76,0.55)" strokeWidth="1.4" />
              <path d="M4 28L14 22L20 27L28 19L40 28" stroke="rgba(201,168,76,0.55)" strokeWidth="1.4" strokeLinejoin="round" />
              <path d="M30 15V21M27 18H33" stroke="rgba(255,255,255,0.45)" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            {uploadedFiles.length > 0 ? (
              <p style={{ color: '#c9a84c', fontSize: 15, fontWeight: 500, margin: 0 }}>
                {uploadedFiles.length}枚の写真が選択されました
              </p>
            ) : (
              <div>
                <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: 15, fontWeight: 500, margin: '0 0 6px' }}>
                  写真をここにドロップ または クリックしてアップロード
                </p>
                <p style={{ color: 'rgba(255,255,255,0.32)', fontSize: 12, fontWeight: 400, margin: 0 }}>
                  複数枚対応 / JPG・PNG・HEIC
                </p>
              </div>
            )}
          </div>

          {/* CTA */}
          <button
            onClick={() => setStep('analyzing')}
            style={{
              width: '100%', padding: '18px 24px',
              background: 'linear-gradient(to right, #12375d, #f0c94b)',
              border: 'none', borderRadius: 32,
              color: '#fff', fontSize: 17, fontWeight: 500,
              cursor: 'pointer', fontFamily: 'inherit',
              letterSpacing: '0.03em',
            }}
          >
            AIに調査してもらう
          </button>
        </div>
      </div>
    )
  }

  /* ============================================================
   * SECTION 2: ANALYZING
   * ============================================================ */
  if (step === 'analyzing') {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#08162b',
        display: 'flex', flexDirection: 'column',
        justifyContent: 'center',
        padding: '48px 20px',
      }}>
        <style>{GLOBAL_STYLE}</style>
        <div style={{ maxWidth: 560, margin: '0 auto', width: '100%' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={{ fontSize: 11, fontWeight: 500, color: '#c9a84c', letterSpacing: '0.18em', marginBottom: 10, textTransform: 'uppercase' }}>
              AI ANALYZING
            </div>
            <h2 style={{ color: '#fff', fontSize: 20, fontWeight: 500, margin: 0 }}>
              AIが分析中です
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {shownMessages.map((msg, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, animation: 'aiMsgIn 0.4s ease' }}>
                <AIAvatar size={36} />
                <div style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '4px 16px 16px 16px',
                  padding: '12px 16px',
                  color: 'rgba(255,255,255,0.88)',
                  fontSize: 14, fontWeight: 400, lineHeight: 1.5,
                }}>
                  {msg}
                </div>
              </div>
            ))}

            {isTyping ? (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <AIAvatar size={36} />
                <div style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '4px 16px 16px 16px',
                  padding: '14px 18px',
                  display: 'flex', alignItems: 'center',
                }}>
                  <PulseDots />
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    )
  }

  /* ============================================================
   * SECTION 3 – FINAL: REPORT
   * ============================================================ */
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      style={{ background: '#08162b', minHeight: '100vh' }}
    >
      <style>{GLOBAL_STYLE}</style>

      {/* ---- SECTION 3: Report header ---- */}
      <div style={{ padding: '52px 20px 0' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <div style={{ fontSize: 11, fontWeight: 500, color: '#c9a84c', letterSpacing: '0.18em', marginBottom: 12, textTransform: 'uppercase' }}>
              AI INSPECTION REPORT
            </div>
            <h2 style={{ color: '#fff', fontSize: 26, fontWeight: 500, margin: 0 }}>
              あなた専用のAIレポート
            </h2>
          </div>

          {/* 3 columns */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>

            {/* Score */}
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 16, padding: '28px 16px', textAlign: 'center' }}>
              <div style={{ fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.55)', marginBottom: 20 }}>AI総合スコア</div>
              <CircularScore score={78} />
              <div style={{ fontSize: 11, fontWeight: 400, color: 'rgba(255,255,255,0.35)', marginTop: 14 }}>100点満点</div>
            </div>

            {/* Radar */}
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 16, padding: '24px 12px' }}>
              <div style={{ fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.55)', marginBottom: 8, textAlign: 'center' }}>総合評価レーダー</div>
              <ResponsiveContainer width="100%" height={185}>
                <RadarChart data={RADAR_DATA} margin={{ top: 4, right: 22, bottom: 4, left: 22 }}>
                  <PolarGrid stroke="rgba(255,255,255,0.12)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.55)', fontSize: 10, fontWeight: 400 }} />
                  <Radar dataKey="value" stroke="#c9a84c" fill="#c9a84c" fillOpacity={0.22} dot={false} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Risk heatmap */}
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 16, padding: '24px 16px' }}>
              <div style={{ fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.55)', marginBottom: 18, textAlign: 'center' }}>リスクヒートマップ</div>
              {[
                { label: '収納',    risk: '中リスク', color: '#c9a84c', bg: 'rgba(201,168,76,0.13)' },
                { label: '湿気',    risk: '低リスク', color: '#4ade80', bg: 'rgba(74,222,128,0.09)' },
                { label: '騒音',    risk: '低リスク', color: '#4ade80', bg: 'rgba(74,222,128,0.09)' },
                { label: '日当たり', risk: '要確認',   color: '#f87171', bg: 'rgba(248,113,113,0.13)' },
              ].map(item => (
                <div key={item.label} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '9px 13px', borderRadius: 9,
                  background: item.bg, marginBottom: 8,
                }}>
                  <span style={{ color: 'rgba(255,255,255,0.78)', fontSize: 13, fontWeight: 400 }}>{item.label}</span>
                  <span style={{ color: item.color, fontSize: 12, fontWeight: 500 }}>{item.risk}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Status 4 items */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 52 }}>
            {[
              { num: '8枚',    label: '写真' },
              { num: '2,431件', label: '体験談' },
              { num: '128件',  label: '類似物件' },
              { num: '42件',   label: '周辺施設' },
            ].map(item => (
              <div key={item.label} style={{
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 12, padding: '16px 6px', textAlign: 'center',
              }}>
                <div style={{ color: '#c9a84c', fontSize: 17, fontWeight: 500, marginBottom: 5 }}>{item.num}</div>
                <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11, fontWeight: 400 }}>{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ---- SECTION 4: Concern points ---- */}
      <div style={{ background: 'rgba(255,255,255,0.025)', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '48px 20px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 28 }}>
            <AIAvatar size={42} />
            <div style={{
              background: 'rgba(26,58,92,0.85)',
              border: '1px solid rgba(201,168,76,0.28)',
              borderRadius: '4px 16px 16px 16px',
              padding: '14px 20px',
              color: '#fff', fontSize: 15, fontWeight: 500,
            }}>
              気になる点が3件見つかりました。
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {CONCERN_CARDS.map(card => (
              <div
                key={card.id}
                className="ai-concern"
                onClick={() => setExpandedCard(expandedCard === card.id ? null : card.id)}
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.09)',
                  borderRadius: 14, padding: '18px 20px', cursor: 'pointer',
                  transition: 'border-color 0.15s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: '#c9a84c', fontSize: 13, fontWeight: 500, marginBottom: 5 }}>{card.title}</div>
                    <div style={{ color: 'rgba(255,255,255,0.68)', fontSize: 14, fontWeight: 400 }}>{card.summary}</div>
                  </div>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{
                    flexShrink: 0, marginLeft: 12,
                    transform: expandedCard === card.id ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s',
                  }}>
                    <path d="M5 8L10 13L15 8" stroke="rgba(255,255,255,0.38)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                {expandedCard === card.id ? (
                  <div style={{
                    marginTop: 16, paddingTop: 14,
                    borderTop: '1px solid rgba(255,255,255,0.07)',
                    color: 'rgba(255,255,255,0.72)',
                    fontSize: 13, fontWeight: 400, lineHeight: 1.75,
                  }}>
                    {card.detail}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ---- SECTION 5: Deep dive proposals ---- */}
      <div style={{ padding: '48px 20px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.42)', letterSpacing: '0.06em', marginBottom: 24 }}>
            さらに深掘りしますか？
          </div>
          {[
            { text: 'この物件の周辺環境について詳しく調べました。スーパー・病院・学校は徒歩圏内に揃っています。ただし、夜間の人通りが少ないエリアが一部あります。', btn: '詳しく調べる' },
            { text: 'このエリアの騒音マップと交通量データを分析しました。幹線道路から100m以内のため、窓を閉めた状態での防音性を内見時に確認することをお勧めします。', btn: '周辺環境も分析する' },
            { text: '類似物件128件と比較した結果、この物件の価格は相場より約3%高めです。交渉余地がある可能性があります。', btn: '相場と比較する' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 22 }}>
              <AIAvatar size={36} />
              <div style={{ flex: 1 }}>
                <div style={{
                  background: 'rgba(26,58,92,0.55)',
                  border: '1px solid rgba(201,168,76,0.18)',
                  borderRadius: '4px 14px 14px 14px',
                  padding: '12px 16px',
                  color: 'rgba(255,255,255,0.78)',
                  fontSize: 13, fontWeight: 400, lineHeight: 1.65, marginBottom: 10,
                }}>
                  {item.text}
                </div>
                <button style={{
                  padding: '8px 18px',
                  background: 'rgba(201,168,76,0.1)',
                  border: '1px solid rgba(201,168,76,0.32)',
                  borderRadius: 20, color: '#c9a84c',
                  fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
                }}>
                  {item.btn}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ---- SECTION 6: Similar stories ---- */}
      <div style={{ background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '48px 20px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <h3 style={{ color: '#fff', fontSize: 18, fontWeight: 500, margin: '0 0 24px' }}>
            同じ悩みを抱えた人の体験談
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
            {[
              { title: '収納不足で後悔', body: '3LDKなのに収納が全然足りなかった。内見時に実際の棚のサイズを計るべきだった。', area: '東京都世田谷区', type: '購入' },
              { title: '日当たりの落とし穴', body: '南向きでも隣のマンションの影で冬は日が入らなかった。季節ごとに確認が必要だと学んだ。', area: '神奈川県横浜市', type: '賃貸' },
              { title: '駐車場の問題', body: '駐車場が抽選制で入れず、月極を別で借りることになった。事前に確認していればよかった。', area: '大阪府大阪市', type: '購入' },
            ].map((story, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '18px 16px' }}>
                <div style={{ marginBottom: 10 }}>
                  <span style={{ padding: '3px 10px', background: 'rgba(201,168,76,0.14)', border: '1px solid rgba(201,168,76,0.28)', borderRadius: 20, color: '#c9a84c', fontSize: 11, fontWeight: 500 }}>
                    {story.type}
                  </span>
                </div>
                <div style={{ color: '#fff', fontSize: 14, fontWeight: 500, marginBottom: 8 }}>{story.title}</div>
                <div style={{ color: 'rgba(255,255,255,0.58)', fontSize: 12, fontWeight: 400, lineHeight: 1.65, marginBottom: 10 }}>{story.body}</div>
                <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, fontWeight: 400 }}>{story.area}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ---- SECTION 7: Share ---- */}
      <div style={{ background: '#0c1d36', borderTop: '1px solid rgba(255,255,255,0.07)', padding: '56px 20px', textAlign: 'center' }}>
        <div style={{ maxWidth: 520, margin: '0 auto' }}>
          <div style={{ fontSize: 11, fontWeight: 500, color: '#c9a84c', letterSpacing: '0.14em', marginBottom: 14, textTransform: 'uppercase' }}>COMMUNITY</div>
          <h3 style={{ color: '#fff', fontSize: 20, fontWeight: 500, margin: '0 0 10px' }}>同じ悩みの方と共有しませんか？</h3>
          <p style={{ color: 'rgba(255,255,255,0.48)', fontSize: 13, fontWeight: 400, margin: '0 0 28px' }}>現在43人が同じ悩みを共有しています</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => onNavigate('experiences')}
              style={{ padding: '12px 28px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.18)', borderRadius: 28, color: '#fff', fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}
            >
              体験談を見る
            </button>
            <button
              onClick={() => onNavigate('experiences')}
              style={{ padding: '12px 28px', background: 'linear-gradient(to right, #1a3a5c, #c9a84c)', border: 'none', borderRadius: 28, color: '#fff', fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}
            >
              体験談を投稿する
            </button>
          </div>
        </div>
      </div>

      {/* ---- SECTION 8: AI proposals ---- */}
      <div style={{ padding: '48px 20px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.42)', marginBottom: 24 }}>House-AIからの提案</div>
          {[
            { text: 'この物件に詳しい登録専門家がいます。内見前に気になるポイントをプロに確認しておきませんか？', btn: '専門家を見る', action: () => onNavigate('expert-matching') },
            { text: 'このエリアに強い不動産会社を3社見つけました。物件の詳細情報を直接確認することができます。', btn: '不動産会社を見る', action: () => {} },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 22 }}>
              <AIAvatar size={36} />
              <div style={{ flex: 1 }}>
                <div style={{
                  background: 'rgba(26,58,92,0.55)',
                  border: '1px solid rgba(201,168,76,0.18)',
                  borderRadius: '4px 14px 14px 14px',
                  padding: '12px 16px',
                  color: 'rgba(255,255,255,0.78)',
                  fontSize: 13, fontWeight: 400, lineHeight: 1.65, marginBottom: 10,
                }}>
                  {item.text}
                </div>
                <button
                  onClick={item.action}
                  style={{ padding: '8px 18px', background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.32)', borderRadius: 20, color: '#c9a84c', fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}
                >
                  {item.btn}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ---- SECTION 9: Expert list ---- */}
      <div style={{ background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '48px 20px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <h3 style={{ color: '#fff', fontSize: 18, fontWeight: 500, margin: '0 0 24px' }}>登録専門家</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
            {[
              { name: '田中 誠一',   cert: '宅地建物取引士 / ファイナンシャルプランナー' },
              { name: '山田 佐知子', cert: '一級建築士 / 住宅診断士' },
              { name: '鈴木 雄介',   cert: '宅地建物取引士 / 不動産鑑定士補' },
            ].map((expert, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '20px 16px' }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(26,58,92,0.8)', border: '2px solid rgba(201,168,76,0.38)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="8" r="4" stroke="rgba(201,168,76,0.75)" strokeWidth="1.5" />
                    <path d="M4 20C4 16.7 7.6 14 12 14C16.4 14 20 16.7 20 20" stroke="rgba(201,168,76,0.75)" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
                <div style={{ color: '#fff', fontSize: 15, fontWeight: 500, marginBottom: 6 }}>{expert.name}</div>
                <div style={{ color: 'rgba(255,255,255,0.48)', fontSize: 11, fontWeight: 400, lineHeight: 1.55, marginBottom: 16 }}>{expert.cert}</div>
                <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                  <button
                    onClick={() => onNavigate('expert-matching')}
                    style={{ flex: 1, minWidth: 60, padding: '8px 10px', background: 'linear-gradient(to right, #1a3a5c, #c9a84c)', border: 'none', borderRadius: 20, color: '#fff', fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}
                  >
                    相談する
                  </button>
                  <button style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 20, color: 'rgba(255,255,255,0.68)', fontSize: 12, fontWeight: 400, cursor: 'pointer', fontFamily: 'inherit' }}>
                    DM
                  </button>
                  <button style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 20, color: 'rgba(255,255,255,0.68)', fontSize: 12, fontWeight: 400, cursor: 'pointer', fontFamily: 'inherit' }}>
                    会社HP
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ---- SECTION 10: Area companies ---- */}
      <div style={{ padding: '48px 20px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <h3 style={{ color: '#fff', fontSize: 18, fontWeight: 500, margin: '0 0 24px' }}>エリアに強い不動産会社</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
            {[
              { name: '株式会社センチュリー不動産', area: '世田谷区・目黒区専門' },
              { name: 'アーバンホーム株式会社',     area: '港区・渋谷区専門' },
              { name: '東京ライフ不動産',           area: '新宿区・中野区専門' },
            ].map((co, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '20px 16px' }}>
                <div style={{ width: 42, height: 42, borderRadius: 10, background: 'rgba(26,58,92,0.8)', border: '1px solid rgba(201,168,76,0.28)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                    <path d="M2 10L11 2L20 10V20H14V14H8V20H2V10Z" stroke="rgba(201,168,76,0.75)" strokeWidth="1.4" strokeLinejoin="round" />
                  </svg>
                </div>
                <div style={{ color: '#fff', fontSize: 14, fontWeight: 500, marginBottom: 5 }}>{co.name}</div>
                <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11, fontWeight: 400, marginBottom: 16 }}>{co.area}</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button style={{ flex: 1, padding: '8px 10px', background: 'rgba(26,58,92,0.8)', border: '1px solid rgba(201,168,76,0.28)', borderRadius: 20, color: '#c9a84c', fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>
                    問い合わせ
                  </button>
                  <button style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 20, color: 'rgba(255,255,255,0.68)', fontSize: 12, fontWeight: 400, cursor: 'pointer', fontFamily: 'inherit' }}>
                    会社HP
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ---- FINAL CTA ---- */}
      <div style={{ background: '#0b1c35', borderTop: '1px solid rgba(255,255,255,0.07)', padding: '72px 20px', textAlign: 'center' }}>
        <div style={{ maxWidth: 540, margin: '0 auto' }}>
          <div style={{ fontSize: 11, fontWeight: 500, color: '#c9a84c', letterSpacing: '0.16em', marginBottom: 16, textTransform: 'uppercase' }}>FINAL CHECK</div>
          <h2 style={{ color: '#fff', fontSize: 24, fontWeight: 500, margin: '0 0 12px', lineHeight: 1.4 }}>
            契約後では遅いかもしれません
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.52)', fontSize: 14, fontWeight: 400, margin: '0 0 40px', lineHeight: 1.75 }}>
            まずはAIで整理してから判断しましょう
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => setStep('input')}
              style={{ padding: '14px 28px', background: 'linear-gradient(to right, #12375d, #f0c94b)', border: 'none', borderRadius: 32, color: '#fff', fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}
            >
              AI内見チェック
            </button>
            <button
              onClick={() => onNavigate('expert-matching')}
              style={{ padding: '14px 28px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.18)', borderRadius: 32, color: '#fff', fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}
            >
              専門家に相談
            </button>
            <button
              onClick={() => onNavigate('experiences')}
              style={{ padding: '14px 28px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.18)', borderRadius: 32, color: '#fff', fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}
            >
              体験談を見る
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
