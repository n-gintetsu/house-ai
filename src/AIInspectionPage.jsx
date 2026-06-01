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

const SCREEN_MESSAGES = [
  '写真を受信しました。',
  '間取りを分析しています...',
  '湿気・カビのリスクを確認中...',
  '周辺施設を検索しています...',
  '類似物件と比較しています...',
  'リスク評価を作成しています...',
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
  const [inputText, setInputText] = useState('')
  const [images, setImages] = useState([])
  const [expandedCard, setExpandedCard] = useState(null)
  const [logoExpanded, setLogoExpanded] = useState(false)
  const [msgIndex, setMsgIndex] = useState(0)
  const [msgOpacity, setMsgOpacity] = useState(1)
  const fileInputRef = useRef(null)
  const textareaRef = useRef(null)

  useEffect(() => {
    if (step !== 'analyzing') return
    setLogoExpanded(false)
    setMsgIndex(0)
    setMsgOpacity(1)

    const logoInterval = setInterval(() => {
      setLogoExpanded(prev => !prev)
    }, 500)

    let mIdx = 0
    const msgInterval = setInterval(() => {
      setMsgOpacity(0)
      setTimeout(() => {
        mIdx = (mIdx + 1) % SCREEN_MESSAGES.length
        setMsgIndex(mIdx)
        setMsgOpacity(1)
      }, 200)
    }, 1000)

    const reportTimeout = setTimeout(() => {
      setStep('report')
    }, 6000)

    return () => {
      clearInterval(logoInterval)
      clearInterval(msgInterval)
      clearTimeout(reportTimeout)
    }
  }, [step])

  const addImages = (rawFiles) => {
    setImages(prev => {
      const remaining = 10 - prev.length
      if (remaining <= 0) return prev
      const toAdd = Array.from(rawFiles)
        .filter(f => f.type.startsWith('image/'))
        .slice(0, remaining)
      return [...prev, ...toAdd.map(file => ({ file, url: URL.createObjectURL(file) }))]
    })
  }

  const handleFileChange = (e) => {
    addImages(e.target.files || [])
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleRemoveImage = (idx) => {
    setImages(prev => {
      const next = [...prev]
      URL.revokeObjectURL(next[idx].url)
      next.splice(idx, 1)
      return next
    })
  }

  const handlePaste = (e) => {
    const items = Array.from((e.clipboardData || {}).items || [])
    const imageFiles = items
      .filter(item => item.kind === 'file' && item.type.startsWith('image/'))
      .map(item => item.getAsFile())
      .filter(Boolean)
    if (imageFiles.length > 0) {
      e.preventDefault()
      addImages(imageFiles)
    }
  }

  const autoResize = () => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 160) + 'px'
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
    .ai-concern:hover { border-color: rgba(201,168,76,0.3) !important; }
    .ai-clip-btn:hover { background: #f5f5f5 !important; }
    .ai-remove-btn:hover { background: rgba(0,0,0,0.7) !important; }
  `

  /* ============================================================
   * SECTION 1: INPUT
   * ============================================================ */
  if (step === 'input') {
    const canSend = inputText.trim().length > 0 || images.length > 0
    return (
      <div
        onPaste={handlePaste}
        style={{
          minHeight: '100vh',
          background: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px 20px 80px',
        }}
      >
        <style>{GLOBAL_STYLE}</style>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontSize: 40, fontWeight: 500, lineHeight: 1.15, marginBottom: 10 }}>
            <span style={{ color: '#1a3a5c' }}>House</span>
            <span style={{ color: '#c9a84c' }}>AI</span>
          </div>
          <div style={{ color: '#666666', fontSize: 15, fontWeight: 400 }}>
            不動産AI内見チェック
          </div>
        </div>

        {/* Integrated input box */}
        <div style={{
          width: '100%',
          maxWidth: 680,
          border: '1.5px solid #e0e0e0',
          borderRadius: 16,
          background: '#ffffff',
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          overflow: 'hidden',
        }}>

          {/* Image thumbnails (shown only when images exist) */}
          {images.length > 0 ? (
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 8,
              padding: '12px 16px 0',
            }}>
              {images.map((img, idx) => (
                <div key={idx} style={{ position: 'relative', flexShrink: 0 }}>
                  <img
                    src={img.url}
                    alt=""
                    style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8, display: 'block', border: '1px solid #e0e0e0' }}
                  />
                  <button
                    className="ai-remove-btn"
                    onClick={() => handleRemoveImage(idx)}
                    style={{
                      position: 'absolute', top: 3, right: 3,
                      width: 20, height: 20, borderRadius: '50%',
                      background: 'rgba(0,0,0,0.55)',
                      border: 'none', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      padding: 0, transition: 'background 0.15s',
                    }}
                  >
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2 2L8 8M8 2L2 8" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          ) : null}

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={inputText}
            onChange={e => { setInputText(e.target.value); autoResize() }}
            onInput={autoResize}
            placeholder="気になる点を入力してください（例：湿気、騒音、日当たり）"
            style={{
              width: '100%',
              boxSizing: 'border-box',
              minHeight: 60,
              maxHeight: 160,
              padding: '14px 16px',
              fontSize: 16,
              fontWeight: 400,
              color: '#222222',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              resize: 'none',
              fontFamily: 'inherit',
              lineHeight: 1.6,
              overflowY: 'auto',
            }}
          />

          {/* Toolbar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 12px 10px',
            borderTop: '1px solid #f0f0f0',
          }}>
            {/* Left: clip button + count */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
              <button
                className="ai-clip-btn"
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
                style={{
                  width: 34, height: 34, borderRadius: 8,
                  background: 'transparent',
                  border: '1px solid #e0e0e0',
                  cursor: 'pointer', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  transition: 'background 0.15s',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M15.5 8.5L8.5 15.5C7.1 16.9 4.9 16.9 3.5 15.5C2.1 14.1 2.1 11.9 3.5 10.5L10.5 3.5C11.4 2.6 12.9 2.6 13.8 3.5C14.7 4.4 14.7 5.9 13.8 6.8L7.1 13.5C6.7 13.9 6 13.9 5.6 13.5C5.2 13.1 5.2 12.4 5.6 12L11.5 6" stroke="#666666" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <span style={{ color: '#aaaaaa', fontSize: 12, fontWeight: 400 }}>
                {images.length}/10
              </span>
            </div>

            {/* Right: send button */}
            <button
              onClick={() => canSend ? setStep('analyzing') : null}
              style={{
                width: 36, height: 36, borderRadius: '50%',
                background: '#1a3a5c',
                border: 'none', cursor: canSend ? 'pointer' : 'default',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                opacity: canSend ? 1 : 0.3,
                transition: 'opacity 0.15s',
                flexShrink: 0,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 13V3M8 3L4 7M8 3L12 7" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    )
  }

  /* ============================================================
   * SECTION 2: ANALYZING
   * ============================================================ */
  if (step === 'analyzing') {
    const logoScale = logoExpanded ? 1.12 : 1.0
    const logoShadow = logoExpanded
      ? '0 0 32px rgba(201,168,76,0.6)'
      : '0 0 0px rgba(201,168,76,0)'

    return (
      <div style={{
        minHeight: '100vh',
        background: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <style>{GLOBAL_STYLE}</style>

        <div style={{ color: '#999999', fontSize: 14, fontWeight: 400, marginBottom: 48 }}>
          AIが内見をチェック中です...
        </div>

        <img
          src="/favicon.png"
          alt="House-AI"
          style={{
            width: 72,
            height: 72,
            transform: 'scale(' + logoScale + ')',
            boxShadow: logoShadow,
            borderRadius: '50%',
            transition: 'transform 0.5s ease-in-out, box-shadow 0.5s ease-in-out',
          }}
        />

        <div style={{
          marginTop: 32,
          fontSize: 14,
          fontWeight: 500,
          color: '#1a3a5c',
          opacity: msgOpacity,
          transition: 'opacity 0.3s',
        }}>
          {SCREEN_MESSAGES[msgIndex] || SCREEN_MESSAGES[0]}
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
