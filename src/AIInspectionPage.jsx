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
  const chatBottomRef = useRef(null)
  const rightContentPanelRef = useRef(null)
  const [chatStep, setChatStep] = useState('ask_show')
  const [chatLog, setChatLog] = useState([{ role: 'ai', text: '気になる点が3件見つかりました。表示しますか？' }])
  const [rightContent, setRightContent] = useState('dashboard')
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [patternMsg, setPatternMsg] = useState('')
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false)

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

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    if (step === 'report') {
      setChatStep('ask_show')
      setChatLog([{ role: 'ai', text: '気になる点が3件見つかりました。表示しますか？' }])
      setRightContent('dashboard')
      setIsTransitioning(false)
      setPatternMsg('')
      if (rightContentPanelRef.current) {
        rightContentPanelRef.current.style.opacity = '1'
        rightContentPanelRef.current.style.transition = ''
      }
    }
  }, [step])

  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [chatLog])

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

  const triggerDissolve = (nextContent) => {
    if (isTransitioning) return
    setIsTransitioning(true)
    const panel = rightContentPanelRef.current
    const particles = []
    if (panel) {
      for (let i = 0; i < 30; i++) {
        const p = document.createElement('div')
        const x = Math.random() * (panel.offsetWidth || 300)
        const y = Math.random() * (panel.offsetHeight || 400)
        p.style.position = 'absolute'
        p.style.width = '4px'
        p.style.height = '4px'
        p.style.borderRadius = '50%'
        p.style.background = 'rgba(201,168,76,0.8)'
        p.style.left = x + 'px'
        p.style.top = y + 'px'
        p.style.opacity = '1'
        p.style.pointerEvents = 'none'
        p.style.transition = 'opacity 0.5s, transform 0.5s'
        p.style.zIndex = '10'
        panel.appendChild(p)
        particles.push(p)
      }
      requestAnimationFrame(() => {
        particles.forEach(p => {
          const dx = (Math.random() - 0.5) * 30
          const dy = (Math.random() - 0.5) * 30
          p.style.opacity = '0'
          p.style.transform = 'translate(' + dx + 'px, ' + dy + 'px)'
        })
        panel.style.transition = 'opacity 0.6s'
        panel.style.opacity = '0'
      })
    }
    setTimeout(() => {
      setRightContent(nextContent)
      if (panel) panel.style.opacity = '0'
      setTimeout(() => {
        if (panel) {
          panel.style.transition = 'opacity 0.5s'
          panel.style.opacity = '1'
        }
      }, 50)
    }, 600)
    setTimeout(() => {
      particles.forEach(p => { if (p.parentNode) p.parentNode.removeChild(p) })
      if (panel) panel.style.transition = ''
      setIsTransitioning(false)
    }, 1100)
  }

  const handleAskShow = (answer) => {
    if (answer === 'yes') {
      setChatLog(prev => [
        ...prev,
        { role: 'user', text: 'Yes' },
        { role: 'ai', text: '【収納不足】収納スペースが限られています。\n\n【日当たり】近隣建物の影響が確認できません。\n\n【湿気】築年数から湿気リスクを確認する必要があります。' },
        { role: 'ai', text: 'さらに深掘りしますか？' },
      ])
      triggerDissolve('points')
      setChatStep('ask_deepen')
    } else {
      setChatLog(prev => [
        ...prev,
        { role: 'user', text: 'No' },
        { role: 'ai', text: 'トップ画面に戻りますか？' },
      ])
      setChatStep('ask_back')
    }
  }

  const handleAskDeepen = (answer) => {
    if (answer === 'yes') {
      const msg = Math.random() < 0.5
        ? 'この写真だけでは詳しく分析するのは限界がございます。実際に内見しながら細かくチェックすることをおすすめします。'
        : '分析した結果、類似物件とはさほど差分は見つかりませんでした。実際に内見しながら細かくチェックすることをおすすめします。'
      setPatternMsg(msg)
      setChatLog(prev => [
        ...prev,
        { role: 'user', text: 'Yes' },
        { role: 'ai', text: msg },
        { role: 'ai', text: 'このエリアに強い不動産業者を検索しますか？' },
      ])
      triggerDissolve('pattern')
      setChatStep('ask_agent_after_deepen')
    } else {
      setChatLog(prev => [
        ...prev,
        { role: 'user', text: 'No' },
        { role: 'ai', text: 'トップ画面に戻りますか？' },
      ])
      setChatStep('ask_back')
    }
  }

  const handleAskBack = (answer) => {
    if (answer === 'yes') {
      onNavigate('home')
    } else {
      setChatLog(prev => [
        ...prev,
        { role: 'user', text: 'No' },
        { role: 'ai', text: 'このエリアに強い不動産業者を検索しますか？' },
      ])
      setChatStep('ask_agent_from_no')
    }
  }

  const handleAskAgent = () => {
    setChatLog(prev => [
      ...prev,
      { role: 'user', text: 'Yes' },
      { role: 'ai', text: 'このエリアに強い不動産会社を見つけました。' },
    ])
    triggerDissolve('agents')
    setChatStep('show_agents')
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
  const chatBtnStyle = {
    background: 'transparent',
    border: '1px solid #c9a84c',
    color: '#c9a84c',
    borderRadius: 20,
    padding: '7px 18px',
    fontSize: 13,
    fontWeight: 400,
    cursor: 'pointer',
    fontFamily: 'inherit',
  }

  return (
    <div style={{ background: '#0d1b2e', height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <style>{GLOBAL_STYLE}</style>

      {/* Top-right buttons */}
      <div style={{ position: 'absolute', top: 16, right: 16, display: 'flex', gap: 8, zIndex: 20 }}>
        <button
          onClick={() => triggerDissolve('all')}
          style={{
            background: 'transparent',
            border: '1px solid #c9a84c',
            color: '#c9a84c',
            borderRadius: 20,
            padding: '6px 14px',
            fontSize: 12,
            fontWeight: 400,
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          全表示
        </button>
        <button
          onClick={() => setStep('input')}
          style={{
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.3)',
            color: '#fff',
            borderRadius: '50%',
            width: 32,
            height: 32,
            fontSize: 16,
            fontWeight: 400,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'inherit',
          }}
        >
          ×
        </button>
      </div>

      {/* Main layout */}
      <div style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: 'flex-start',
        flex: 1,
        overflow: 'hidden',
        minHeight: 0,
      }}>

        {/* ---- LEFT: Chat panel ---- */}
        <div style={{
          order: isMobile ? 2 : 1,
          width: isMobile ? '100%' : '30%',
          minWidth: isMobile ? 'auto' : '260px',
          background: '#0a1628',
          padding: '16px',
          boxSizing: 'border-box',
          height: isMobile ? '40vh' : '100%',
          overflowY: 'auto',
          flexShrink: 0,
        }}>
          <div style={{ paddingTop: 44 }}>

            {/* Chat log */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
              {chatLog.map((msg, i) => (
                msg.role === 'ai' ? (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <img src="/favicon.png" alt="" style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0 }} />
                    <div style={{
                      background: '#1a3a5c',
                      borderRadius: '0 12px 12px 12px',
                      padding: '10px 14px',
                      color: '#fff',
                      fontSize: 13,
                      fontWeight: 400,
                      lineHeight: 1.6,
                      whiteSpace: 'pre-wrap',
                      maxWidth: '85%',
                    }}>
                      {msg.text}
                    </div>
                  </div>
                ) : (
                  <div key={i} style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <div style={{
                      background: 'rgba(201,168,76,0.15)',
                      border: '1px solid #c9a84c',
                      color: '#c9a84c',
                      borderRadius: '12px 0 12px 12px',
                      padding: '8px 12px',
                      fontSize: 13,
                      fontWeight: 400,
                      display: 'inline-block',
                    }}>
                      {msg.text}
                    </div>
                  </div>
                )
              ))}
              <div ref={chatBottomRef} />
            </div>

            {/* Step buttons */}
            {chatStep === 'ask_show' ? (
              <div style={{ display: 'flex', flexDirection: 'row', gap: 8, justifyContent: 'flex-end' }}>
                <button onClick={() => handleAskShow('yes')} style={chatBtnStyle}>Yes</button>
                <button onClick={() => handleAskShow('no')} style={chatBtnStyle}>No</button>
              </div>
            ) : null}
            {chatStep === 'ask_deepen' ? (
              <div style={{ display: 'flex', flexDirection: 'row', gap: 8, justifyContent: 'flex-end' }}>
                <button onClick={() => handleAskDeepen('yes')} style={chatBtnStyle}>Yes</button>
                <button onClick={() => handleAskDeepen('no')} style={chatBtnStyle}>No</button>
              </div>
            ) : null}
            {chatStep === 'ask_back' ? (
              <div style={{ display: 'flex', flexDirection: 'row', gap: 8, justifyContent: 'flex-end' }}>
                <button onClick={() => handleAskBack('yes')} style={chatBtnStyle}>Yes</button>
                <button onClick={() => handleAskBack('no')} style={chatBtnStyle}>No</button>
              </div>
            ) : null}
            {chatStep === 'ask_agent_after_deepen' ? (
              <div style={{ display: 'flex', flexDirection: 'row', gap: 8, justifyContent: 'flex-end' }}>
                <button onClick={handleAskAgent} style={chatBtnStyle}>Yes</button>
              </div>
            ) : null}
            {chatStep === 'ask_agent_from_no' ? (
              <div style={{ display: 'flex', flexDirection: 'row', gap: 8, justifyContent: 'flex-end' }}>
                <button onClick={handleAskAgent} style={chatBtnStyle}>Yes</button>
              </div>
            ) : null}
          </div>
        </div>

        {/* ---- RIGHT: Content panel ---- */}
        <div
          ref={rightContentPanelRef}
          style={{
            order: isMobile ? 1 : 2,
            flex: 1,
            minWidth: 0,
            position: 'relative',
            overflow: 'hidden',
            height: '100%',
            overflowY: 'auto',
            minHeight: isMobile ? 0 : undefined,
            padding: '64px 24px 48px',
            boxSizing: 'border-box',
          }}
        >

          {/* dashboard */}
          {rightContent === 'dashboard' ? (
            <div>
              <div style={{ fontSize: 11, fontWeight: 500, color: '#c9a84c', letterSpacing: '0.18em', marginBottom: 10, textTransform: 'uppercase' }}>
                AI INSPECTION REPORT
              </div>
              <h2 style={{ color: '#fff', fontSize: 22, fontWeight: 500, margin: '0 0 24px' }}>
                あなた専用のAIレポート
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 16 }}>
                <div style={{ background: 'rgba(255,255,255,0.04)', border: '1.5px solid #c9a84c', borderRadius: 14, padding: '24px 14px', textAlign: 'center' }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.55)', marginBottom: 16 }}>AI総合スコア</div>
                  <CircularScore score={78} />
                  <div style={{ fontSize: 11, fontWeight: 400, color: 'rgba(255,255,255,0.35)', marginTop: 12 }}>100点満点</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.04)', border: '1.5px solid #c9a84c', borderRadius: 14, padding: '20px 10px' }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.55)', marginBottom: 8, textAlign: 'center' }}>総合評価レーダー</div>
                  <ResponsiveContainer width="100%" height={170}>
                    <RadarChart data={RADAR_DATA} margin={{ top: 4, right: 20, bottom: 4, left: 20 }}>
                      <PolarGrid stroke="rgba(255,255,255,0.12)" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.55)', fontSize: 10, fontWeight: 400 }} />
                      <Radar dataKey="value" stroke="#c9a84c" fill="#c9a84c" fillOpacity={0.22} dot={false} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.04)', border: '1.5px solid #c9a84c', borderRadius: 14, padding: '20px 14px' }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.55)', marginBottom: 14, textAlign: 'center' }}>リスクヒートマップ</div>
                  {[
                    { label: '収納',    risk: '中リスク', color: '#c9a84c', bg: 'rgba(201,168,76,0.13)' },
                    { label: '湿気',    risk: '低リスク', color: '#4ade80', bg: 'rgba(74,222,128,0.09)' },
                    { label: '騒音',    risk: '低リスク', color: '#4ade80', bg: 'rgba(74,222,128,0.09)' },
                    { label: '日当たり', risk: '要確認',   color: '#f87171', bg: 'rgba(248,113,113,0.13)' },
                  ].map(item => (
                    <div key={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderRadius: 8, background: item.bg, marginBottom: 6 }}>
                      <span style={{ color: 'rgba(255,255,255,0.78)', fontSize: 13, fontWeight: 400 }}>{item.label}</span>
                      <span style={{ color: item.color, fontSize: 12, fontWeight: 500 }}>{item.risk}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                {[
                  { num: '8枚',    label: '写真' },
                  { num: '2,431件', label: '体験談' },
                  { num: '128件',  label: '類似物件' },
                  { num: '42件',   label: '周辺施設' },
                ].map(item => (
                  <div key={item.label} style={{ background: 'rgba(255,255,255,0.04)', border: '1.5px solid #c9a84c', borderRadius: 12, padding: '14px 6px', textAlign: 'center' }}>
                    <div style={{ color: '#c9a84c', fontSize: 16, fontWeight: 500, marginBottom: 4 }}>{item.num}</div>
                    <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11, fontWeight: 400 }}>{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {/* points */}
          {rightContent === 'points' ? (
            <div>
              <div style={{ color: '#c9a84c', fontSize: 18, fontWeight: 500, marginBottom: 20 }}>AIが見つけた気になる点</div>
              {[
                { title: '収納不足', body: '写真から判断すると、収納スペースが限られています。' },
                { title: '日当たり', body: '南向きですが、近隣建物の影響が確認できません。' },
                { title: '湿気',    body: '築年数から湿気リスクを確認する必要があります。' },
              ].map((c, i) => (
                <div key={i} style={{ background: '#1a3a5c', border: '1px solid #c9a84c', borderRadius: 12, padding: '16px 20px', marginBottom: 12 }}>
                  <div style={{ color: '#c9a84c', fontSize: 15, fontWeight: 500 }}>{c.title}</div>
                  <div style={{ color: '#cccccc', fontSize: 14, fontWeight: 400, marginTop: 8 }}>{c.body}</div>
                </div>
              ))}
            </div>
          ) : null}

          {/* pattern */}
          {rightContent === 'pattern' ? (
            <div>
              <div style={{ color: '#c9a84c', fontSize: 18, fontWeight: 500, marginBottom: 20 }}>AI分析コメント</div>
              <div style={{ background: '#1a3a5c', border: '1px solid #c9a84c', borderRadius: 12, padding: '20px 24px', color: '#fff', fontSize: 15, fontWeight: 400, lineHeight: '1.8' }}>
                {patternMsg || 'この写真だけでは詳しく分析するのは限界がございます。実際に内見しながら細かくチェックすることをおすすめします。'}
              </div>
            </div>
          ) : null}

          {/* agents */}
          {rightContent === 'agents' ? (
            <div>
              <div style={{ color: '#c9a84c', fontSize: 18, fontWeight: 500, marginBottom: 20 }}>このエリアに強い不動産会社</div>
              {[
                { name: '株式会社センチュリー不動産', area: '世田谷区・目黒区専門' },
                { name: 'アーバンホーム株式会社',     area: '港区・渋谷区専門' },
                { name: '東京ライフ不動産',           area: '新宿区・中野区専門' },
              ].map((co, i) => (
                <div key={i} style={{ background: '#1a3a5c', border: '1px solid #c9a84c', borderRadius: 12, padding: 16, marginBottom: 12 }}>
                  <div style={{ color: '#c9a84c', fontSize: 14, fontWeight: 500 }}>{co.name}</div>
                  <div style={{ color: '#aaaaaa', fontSize: 13, fontWeight: 400, marginTop: 4 }}>{co.area}</div>
                  <button
                    onClick={() => onNavigate('expert-matching')}
                    style={{ background: '#c9a84c', color: '#0d1b2e', border: 'none', borderRadius: 12, padding: '6px 16px', fontSize: 12, fontWeight: 500, marginTop: 10, cursor: 'pointer', fontFamily: 'inherit' }}
                  >
                    相談する
                  </button>
                </div>
              ))}
            </div>
          ) : null}

          {/* all */}
          {rightContent === 'all' ? (
            <div>
              {/* Dashboard part */}
              <div style={{ marginBottom: 40 }}>
                <div style={{ fontSize: 11, fontWeight: 500, color: '#c9a84c', letterSpacing: '0.18em', marginBottom: 10, textTransform: 'uppercase' }}>
                  AI INSPECTION REPORT
                </div>
                <h2 style={{ color: '#fff', fontSize: 22, fontWeight: 500, margin: '0 0 24px' }}>
                  あなた専用のAIレポート
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 16 }}>
                  <div style={{ background: 'rgba(255,255,255,0.04)', border: '1.5px solid #c9a84c', borderRadius: 14, padding: '24px 14px', textAlign: 'center' }}>
                    <div style={{ fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.55)', marginBottom: 16 }}>AI総合スコア</div>
                    <CircularScore score={78} />
                    <div style={{ fontSize: 11, fontWeight: 400, color: 'rgba(255,255,255,0.35)', marginTop: 12 }}>100点満点</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.04)', border: '1.5px solid #c9a84c', borderRadius: 14, padding: '20px 10px' }}>
                    <div style={{ fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.55)', marginBottom: 8, textAlign: 'center' }}>総合評価レーダー</div>
                    <ResponsiveContainer width="100%" height={170}>
                      <RadarChart data={RADAR_DATA} margin={{ top: 4, right: 20, bottom: 4, left: 20 }}>
                        <PolarGrid stroke="rgba(255,255,255,0.12)" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.55)', fontSize: 10, fontWeight: 400 }} />
                        <Radar dataKey="value" stroke="#c9a84c" fill="#c9a84c" fillOpacity={0.22} dot={false} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.04)', border: '1.5px solid #c9a84c', borderRadius: 14, padding: '20px 14px' }}>
                    <div style={{ fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.55)', marginBottom: 14, textAlign: 'center' }}>リスクヒートマップ</div>
                    {[
                      { label: '収納',    risk: '中リスク', color: '#c9a84c', bg: 'rgba(201,168,76,0.13)' },
                      { label: '湿気',    risk: '低リスク', color: '#4ade80', bg: 'rgba(74,222,128,0.09)' },
                      { label: '騒音',    risk: '低リスク', color: '#4ade80', bg: 'rgba(74,222,128,0.09)' },
                      { label: '日当たり', risk: '要確認',   color: '#f87171', bg: 'rgba(248,113,113,0.13)' },
                    ].map(item => (
                      <div key={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderRadius: 8, background: item.bg, marginBottom: 6 }}>
                        <span style={{ color: 'rgba(255,255,255,0.78)', fontSize: 13, fontWeight: 400 }}>{item.label}</span>
                        <span style={{ color: item.color, fontSize: 12, fontWeight: 500 }}>{item.risk}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                  {[
                    { num: '8枚',    label: '写真' },
                    { num: '2,431件', label: '体験談' },
                    { num: '128件',  label: '類似物件' },
                    { num: '42件',   label: '周辺施設' },
                  ].map(item => (
                    <div key={item.label} style={{ background: 'rgba(255,255,255,0.04)', border: '1.5px solid #c9a84c', borderRadius: 12, padding: '14px 6px', textAlign: 'center' }}>
                      <div style={{ color: '#c9a84c', fontSize: 16, fontWeight: 500, marginBottom: 4 }}>{item.num}</div>
                      <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11, fontWeight: 400 }}>{item.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Points part */}
              <div>
                <div style={{ color: '#c9a84c', fontSize: 18, fontWeight: 500, marginBottom: 20 }}>AIが見つけた気になる点</div>
                {[
                  { title: '収納不足', body: '写真から判断すると、収納スペースが限られています。' },
                  { title: '日当たり', body: '南向きですが、近隣建物の影響が確認できません。' },
                  { title: '湿気',    body: '築年数から湿気リスクを確認する必要があります。' },
                ].map((c, i) => (
                  <div key={i} style={{ background: '#1a3a5c', border: '1px solid #c9a84c', borderRadius: 12, padding: '16px 20px', marginBottom: 12 }}>
                    <div style={{ color: '#c9a84c', fontSize: 15, fontWeight: 500 }}>{c.title}</div>
                    <div style={{ color: '#cccccc', fontSize: 14, fontWeight: 400, marginTop: 8 }}>{c.body}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

        </div>
      </div>
    </div>
  )
}
