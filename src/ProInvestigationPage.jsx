import { useState, useEffect, useRef } from 'react'

function formatChatText(text) {
  return text
    .replace(/#{1,3}\s/g, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`(.*?)`/g, '$1')
    .replace(/^[-•]\s/gm, '')
    .replace(/^\d+\.\s/gm, '')
}

const FALLBACK_REPORT = {
  meta: { confidence: 70, warnings: [], plan_limit_reached: false },
  summary: { overall_risk: '中', recommend_action: '現地調査推奨', ai_comment: '解析完了。詳細は各項目をご確認ください。' },
  remnants: { volume: '中', estimated_min: 100000, estimated_max: 300000, items_detected: ['家具', '家電'], confidence: 60, caution: null },
  reform: { light_min: 800000, light_max: 1500000, standard_min: 2000000, standard_max: 3500000, full_min: 5000000, full_max: 8000000, items: [], confidence: 60, caution: '詳細は現地確認を推奨します。' },
  building: { exterior: '確認推奨', interior: '確認推奨', equipment: '確認推奨', confidence: 50, caution: '現地目視を推奨します。' },
  land: { setback_required: false, height_difference: '確認推奨', retaining_wall: '確認推奨', encroachment: '確認推奨', road_access: '確認推奨', confidence: 40, caution: '専門家確認を推奨します。' },
  hazard: { flood: '確認推奨', landslide: '確認推奨', tsunami: '確認推奨', confidence: 40, caution: 'ハザードマップ原本を確認してください。' },
  zoning: { use_district: '確認推奨', building_coverage: '確認推奨', floor_area_ratio: '確認推奨', confidence: 40, caution: '行政窓口での確認を推奨します。' },
  risks: [{ level: 'mid', item: '詳細調査が必要です' }],
  recommended_experts: ['建築士', '土地家屋調査士'],
  checklist: ['現地目視確認', '境界確認', '水回り確認'],
}

const LOGS = ['写真解析中...', 'PDF図面解析中...', '接道・ハザード確認中...', '用途地域確認中...', 'リフォーム費用試算中...', 'レポート生成中...']

const PURPOSE_OPTIONS = ['買取検討', '仕入検討', '投資判断', 'リフォーム計画', 'その他']

const QUESTIONS = [
  { key: 'propertyType', text: '物件の種別を教えてください。', options: ['戸建', 'マンション', '土地', 'その他'] },
  { key: 'age', text: '築年数を教えてください。', type: 'text', placeholder: '例：築25年' },
  { key: 'price', text: '取得希望価格帯を教えてください。', type: 'text', placeholder: '例：3000万円' },
]

const MENU_ITEMS = [
  { key: 'summary', label: '総合評価' },
  { key: 'remnants', label: '残置物' },
  { key: 'reform', label: 'リフォーム費用' },
  { key: 'building', label: '建物状態' },
  { key: 'land', label: '土地・接道' },
  { key: 'hazard', label: 'ハザード' },
  { key: 'zoning', label: '用途地域' },
  { key: 'risks', label: 'リスクまとめ' },
]

export default function ProInvestigationPage() {
  const [screen, setScreen] = useState('input')
  const [photos, setPhotos] = useState([])
  const [pdfs, setPdfs] = useState([])
  const [address, setAddress] = useState('')
  const [purpose, setPurpose] = useState('')
  const [interviewStep, setInterviewStep] = useState(0)
  const [interviewAnswers, setInterviewAnswers] = useState({})
  const [interviewInput, setInterviewInput] = useState('')
  const [logMessages, setLogMessages] = useState([])
  const [logIndex, setLogIndex] = useState(0)
  const [report, setReport] = useState(null)
  const [activeItem, setActiveItem] = useState(0)
  const [chatMessages, setChatMessages] = useState([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)

  const photoInputRef = useRef(null)
  const pdfInputRef = useRef(null)
  const apiCalledRef = useRef(false)
  const addressRef = useRef(address)
  const purposeRef = useRef(purpose)
  const photosRef = useRef(photos)
  const pdfsRef = useRef(pdfs)
  const answersRef = useRef(interviewAnswers)

  useEffect(() => { addressRef.current = address }, [address])
  useEffect(() => { purposeRef.current = purpose }, [purpose])
  useEffect(() => { photosRef.current = photos }, [photos])
  useEffect(() => { pdfsRef.current = pdfs }, [pdfs])
  useEffect(() => { answersRef.current = interviewAnswers }, [interviewAnswers])

  useEffect(() => {
    if (screen !== 'analyzing') return
    if (logIndex >= LOGS.length) return
    const timer = setTimeout(() => {
      setLogMessages(prev => [...prev, LOGS[logIndex]])
      setLogIndex(prev => prev + 1)
    }, 1000)
    return () => clearTimeout(timer)
  }, [screen, logIndex])

  useEffect(() => {
    if (screen !== 'analyzing') return
    if (logIndex < LOGS.length) return
    if (apiCalledRef.current) return
    apiCalledRef.current = true
    const addr = addressRef.current
    const purp = purposeRef.current
    const ph = photosRef.current
    const pd = pdfsRef.current
    const ans = answersRef.current
    fetch('/api/claude', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemPrompt: `あなたは不動産の現地調査AIアシスタントです。
プロの不動産業者・買取業者・投資家向けに物件の現地調査レポートを生成してください。
以下の情報を元に分析し、必ず以下のJSON形式のみで返答してください。前後に説明文は不要です。

物件所在地: ${addr}
調査目的: ${purp}
物件種別: ${ans.propertyType || '不明'}
築年数: ${ans.age || '不明'}
取得希望価格: ${ans.price || '不明'}

JSON形式:
{
  "meta": { "confidence": 数値0-100, "warnings": [文字列配列], "plan_limit_reached": false },
  "summary": { "overall_risk": "低|中|高", "recommend_action": "文字列", "ai_comment": "文字列" },
  "remnants": { "volume": "少|中|多", "estimated_min": 数値, "estimated_max": 数値, "items_detected": [文字列配列], "confidence": 数値, "caution": null或いは文字列 },
  "reform": { "light_min": 数値, "light_max": 数値, "standard_min": 数値, "standard_max": 数値, "full_min": 数値, "full_max": 数値, "items": [{"part":"文字列","min":数値,"max":数値}], "confidence": 数値, "caution": null或いは文字列 },
  "building": { "exterior": "文字列", "interior": "文字列", "equipment": "文字列", "confidence": 数値, "caution": null或いは文字列 },
  "land": { "setback_required": true或いはfalse, "height_difference": "文字列", "retaining_wall": "文字列", "encroachment": "文字列", "road_access": "文字列", "confidence": 数値, "caution": null或いは文字列 },
  "hazard": { "flood": "文字列", "landslide": "文字列", "tsunami": "文字列", "confidence": 数値, "caution": null或いは文字列 },
  "zoning": { "use_district": "文字列", "building_coverage": "文字列", "floor_area_ratio": "文字列", "confidence": 数値, "caution": null或いは文字列 },
  "risks": [{"level":"high|mid|low","item":"文字列"}],
  "recommended_experts": [文字列配列],
  "checklist": [文字列配列]
}`,
        messages: [{ role: 'user', content: `物件所在地: ${addr}\n調査目的: ${purp}\n写真枚数: ${ph.length}枚\nPDF数: ${pd.length}件\n築年数: ${ans.age || '不明'}\n取得希望価格: ${ans.price || '不明'}` }]
      })
    })
    .then(r => r.json())
    .then(data => {
      try {
        const text = data.text || ''
        const clean = text.replace(/```json|```/g, '').trim()
        const parsed = JSON.parse(clean)
        setReport(parsed)
      } catch(e) {
        setReport(FALLBACK_REPORT)
      }
      setScreen('report')
    })
    .catch(() => {
      setReport(FALLBACK_REPORT)
      setScreen('report')
    })
  }, [screen, logIndex])

  useEffect(() => {
    if (interviewStep === 3) {
      apiCalledRef.current = false
      setLogMessages([])
      setLogIndex(0)
      setScreen('analyzing')
    }
  }, [interviewStep])

  const handleAnswerSelect = (key, value) => {
    setInterviewAnswers(prev => ({ ...prev, [key]: value }))
    setInterviewStep(prev => prev + 1)
  }

  const handleAnswerText = () => {
    if (!interviewInput.trim()) return
    const q = QUESTIONS[interviewStep]
    setInterviewAnswers(prev => ({ ...prev, [q.key]: interviewInput }))
    setInterviewInput('')
    setInterviewStep(prev => prev + 1)
  }

  const getConfidence = (key) => {
    if (!report) return null
    if (key === 'summary') return report.meta ? report.meta.confidence : null
    if (report[key] && report[key].confidence !== undefined) return report[key].confidence
    return null
  }

  const renderCaution = (caution) => {
    return (caution !== null && caution !== undefined) ? (
      <div style={{ background: '#1C1A0A', border: '1px solid #92400E', borderRadius: 6, padding: 12, marginTop: 12 }}>
        <span style={{ fontSize: 12, color: '#FCD34D' }}>※ {caution}</span>
      </div>
    ) : null
  }

  const handleChatSend = () => {
    if (!chatInput.trim() || chatLoading) return
    const userMsg = chatInput
    setChatMessages(prev => [...prev, { role: 'user', content: userMsg }])
    setChatInput('')
    setChatLoading(true)
    fetch('/api/claude', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemPrompt: `あなたは不動産現地調査AIです。以下のレポートデータを参考に質問に答えてください。\n物件所在地: ${address}\n調査目的: ${purpose}`,
        messages: [
          ...chatMessages.map(m => ({ role: m.role, content: m.content })),
          { role: 'user', content: userMsg }
        ]
      })
    })
    .then(r => r.json())
    .then(data => {
      setChatMessages(prev => [...prev, { role: 'assistant', content: data.text || '回答を取得できませんでした。' }])
      setChatLoading(false)
    })
    .catch(() => {
      setChatMessages(prev => [...prev, { role: 'assistant', content: 'エラーが発生しました。' }])
      setChatLoading(false)
    })
  }

  const renderReportSection = (r) => {
    const key = MENU_ITEMS[activeItem].key

    if (key === 'summary') {
      const s = r.summary || {}
      const riskColor = s.overall_risk === '低' ? '#22C55E' : s.overall_risk === '高' ? '#EF4444' : '#F97316'
      return (
        <div>
          <div style={{ fontSize: 18, fontWeight: 500, color: '#E2E8F0', marginBottom: 20 }}>総合評価</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <span style={{ background: riskColor, color: '#fff', fontSize: 12, padding: '4px 12px', borderRadius: 20, fontWeight: 500 }}>リスク: {s.overall_risk || '不明'}</span>
            <span style={{ fontSize: 14, color: '#CBD5E1' }}>{s.recommend_action || ''}</span>
          </div>
          <div style={{ fontSize: 14, lineHeight: 1.8, color: '#CBD5E1', background: '#111827', padding: 16, borderRadius: 8 }}>
            {s.ai_comment || ''}
          </div>
          {(r.meta && r.meta.warnings && r.meta.warnings.length > 0) ? (
            <div style={{ background: '#1C1A0A', border: '1px solid #92400E', borderRadius: 6, padding: 12, marginTop: 12 }}>
              {r.meta.warnings.map((w, i) => (
                <div key={i} style={{ fontSize: 12, color: '#FCD34D', marginBottom: i < r.meta.warnings.length - 1 ? 4 : 0 }}>※ {w}</div>
              ))}
            </div>
          ) : null}
        </div>
      )
    }

    if (key === 'remnants') {
      const rm = r.remnants || {}
      return (
        <div>
          <div style={{ fontSize: 18, fontWeight: 500, color: '#E2E8F0', marginBottom: 20 }}>残置物</div>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 8 }}>撤去費用概算</div>
            <div style={{ fontSize: 24, fontWeight: 500, color: '#D4AF37' }}>
              {rm.estimated_min ? rm.estimated_min.toLocaleString() : '-'}円 〜 {rm.estimated_max ? rm.estimated_max.toLocaleString() : '-'}円
            </div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <span style={{ fontSize: 12, color: '#94A3B8' }}>量：</span>
            <span style={{ fontSize: 14, color: '#E2E8F0' }}>{rm.volume || '-'}</span>
          </div>
          {(rm.items_detected && rm.items_detected.length > 0) ? (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 6 }}>検出アイテム</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {rm.items_detected.map((item, i) => (
                  <span key={i} style={{ background: '#1E293B', color: '#CBD5E1', fontSize: 12, padding: '4px 10px', borderRadius: 12 }}>{item}</span>
                ))}
              </div>
            </div>
          ) : null}
          <div style={{ fontSize: 12, color: '#475569' }}>信頼度: {rm.confidence || '-'}%</div>
          {renderCaution(rm.caution)}
        </div>
      )
    }

    if (key === 'reform') {
      const rf = r.reform || {}
      const reformCards = [
        { label: '軽微リフォーム', min: rf.light_min, max: rf.light_max },
        { label: '標準リフォーム', min: rf.standard_min, max: rf.standard_max },
        { label: 'フルリフォーム', min: rf.full_min, max: rf.full_max },
      ]
      return (
        <div>
          <div style={{ fontSize: 18, fontWeight: 500, color: '#E2E8F0', marginBottom: 20 }}>リフォーム費用</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
            {reformCards.map((c) => (
              <div key={c.label} style={{ background: '#111827', border: '1px solid #1E293B', padding: 16, borderRadius: 8 }}>
                <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 8 }}>{c.label}</div>
                <div style={{ fontSize: 13, color: '#D4AF37', fontWeight: 500 }}>
                  {c.min ? c.min.toLocaleString() : '-'}円<br />〜 {c.max ? c.max.toLocaleString() : '-'}円
                </div>
              </div>
            ))}
          </div>
          {(rf.items && rf.items.length > 0) ? (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 8 }}>内訳</div>
              {rf.items.map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #1E293B', fontSize: 13, color: '#CBD5E1' }}>
                  <span>{item.part}</span>
                  <span>{item.min ? item.min.toLocaleString() : '-'}円〜{item.max ? item.max.toLocaleString() : '-'}円</span>
                </div>
              ))}
            </div>
          ) : null}
          <div style={{ fontSize: 12, color: '#475569' }}>信頼度: {rf.confidence || '-'}%</div>
          {renderCaution(rf.caution)}
        </div>
      )
    }

    if (key === 'building') {
      const b = r.building || {}
      const rows = [
        { label: '外観', value: b.exterior },
        { label: '内装', value: b.interior },
        { label: '設備', value: b.equipment },
      ]
      return (
        <div>
          <div style={{ fontSize: 18, fontWeight: 500, color: '#E2E8F0', marginBottom: 20 }}>建物状態</div>
          {rows.map((row) => (
            <div key={row.label} style={{ display: 'flex', padding: '12px 0', borderBottom: '1px solid #1E293B' }}>
              <span style={{ fontSize: 13, color: '#94A3B8', width: 80, flexShrink: 0 }}>{row.label}</span>
              <span style={{ fontSize: 13, color: '#CBD5E1' }}>{row.value || '-'}</span>
            </div>
          ))}
          <div style={{ fontSize: 12, color: '#475569', marginTop: 12 }}>信頼度: {b.confidence || '-'}%</div>
          {renderCaution(b.caution)}
        </div>
      )
    }

    if (key === 'land') {
      const l = r.land || {}
      const rows = [
        { label: 'セットバック', value: l.setback_required ? '必要' : '不要' },
        { label: '高低差', value: l.height_difference },
        { label: '擁壁', value: l.retaining_wall },
        { label: '越境', value: l.encroachment },
        { label: '接道', value: l.road_access },
      ]
      return (
        <div>
          <div style={{ fontSize: 18, fontWeight: 500, color: '#E2E8F0', marginBottom: 20 }}>土地・接道</div>
          {rows.map((row) => (
            <div key={row.label} style={{ display: 'flex', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #1E293B' }}>
              <span style={{ fontSize: 13, color: '#94A3B8', width: 96, flexShrink: 0 }}>{row.label}</span>
              <span style={{ fontSize: 13, color: '#CBD5E1' }}>{row.value || '-'}</span>
              {row.value === '確認推奨' ? (
                <span style={{ marginLeft: 8, background: '#7C2D12', color: '#FED7AA', fontSize: 11, padding: '2px 8px', borderRadius: 10 }}>確認推奨</span>
              ) : null}
            </div>
          ))}
          <div style={{ fontSize: 12, color: '#475569', marginTop: 12 }}>信頼度: {l.confidence || '-'}%</div>
          {renderCaution(l.caution)}
        </div>
      )
    }

    if (key === 'hazard') {
      const h = r.hazard || {}
      const rows = [
        { label: '洪水', value: h.flood },
        { label: '土砂崩れ', value: h.landslide },
        { label: '津波', value: h.tsunami },
      ]
      return (
        <div>
          <div style={{ fontSize: 18, fontWeight: 500, color: '#E2E8F0', marginBottom: 20 }}>ハザード</div>
          {rows.map((row) => (
            <div key={row.label} style={{ display: 'flex', padding: '12px 0', borderBottom: '1px solid #1E293B' }}>
              <span style={{ fontSize: 13, color: '#94A3B8', width: 96, flexShrink: 0 }}>{row.label}</span>
              <span style={{ fontSize: 13, color: '#CBD5E1' }}>{row.value || '-'}</span>
            </div>
          ))}
          <div style={{ fontSize: 12, color: '#475569', marginTop: 12 }}>信頼度: {h.confidence || '-'}%</div>
          {renderCaution(h.caution)}
        </div>
      )
    }

    if (key === 'zoning') {
      const z = r.zoning || {}
      const rows = [
        { label: '用途地域', value: z.use_district },
        { label: '建蔽率', value: z.building_coverage },
        { label: '容積率', value: z.floor_area_ratio },
      ]
      return (
        <div>
          <div style={{ fontSize: 18, fontWeight: 500, color: '#E2E8F0', marginBottom: 20 }}>用途地域</div>
          {rows.map((row) => (
            <div key={row.label} style={{ display: 'flex', padding: '12px 0', borderBottom: '1px solid #1E293B' }}>
              <span style={{ fontSize: 13, color: '#94A3B8', width: 96, flexShrink: 0 }}>{row.label}</span>
              <span style={{ fontSize: 13, color: '#CBD5E1' }}>{row.value || '-'}</span>
            </div>
          ))}
          <div style={{ fontSize: 12, color: '#475569', marginTop: 12 }}>信頼度: {z.confidence || '-'}%</div>
          {renderCaution(z.caution)}
        </div>
      )
    }

    if (key === 'risks') {
      const riskBadge = (level) => {
        const map = {
          high: { bg: '#7F1D1D', color: '#FCA5A5', label: '高' },
          mid: { bg: '#7C2D12', color: '#FED7AA', label: '中' },
          low: { bg: '#1E293B', color: '#94A3B8', label: '低' },
        }
        const st = map[level] || map.low
        return <span style={{ background: st.bg, color: st.color, fontSize: 11, padding: '2px 8px', borderRadius: 10, marginRight: 8 }}>{st.label}</span>
      }
      return (
        <div>
          <div style={{ fontSize: 18, fontWeight: 500, color: '#E2E8F0', marginBottom: 20 }}>リスクまとめ</div>
          {(r.risks && r.risks.length > 0) ? (
            <div style={{ marginBottom: 20 }}>
              {r.risks.map((risk, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #1E293B' }}>
                  {riskBadge(risk.level)}
                  <span style={{ fontSize: 13, color: '#CBD5E1' }}>{risk.item}</span>
                </div>
              ))}
            </div>
          ) : null}
          {(r.recommended_experts && r.recommended_experts.length > 0) ? (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 8 }}>推奨専門家</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {r.recommended_experts.map((e, i) => (
                  <span key={i} style={{ background: '#1E3A5F', color: '#93C5FD', fontSize: 12, padding: '4px 12px', borderRadius: 12 }}>{e}</span>
                ))}
              </div>
            </div>
          ) : null}
          {(r.checklist && r.checklist.length > 0) ? (
            <div>
              <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 8 }}>チェックリスト</div>
              {r.checklist.map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', padding: '6px 0', fontSize: 13, color: '#CBD5E1' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 8, flexShrink: 0 }}><polyline points="20 6 9 17 4 12" /></svg>
                  {item}
                </div>
              ))}
            </div>
          ) : null}
        </div>
      )
    }

    return null
  }

  if (screen === 'input') {
    return (
      <div style={{ minHeight: '100vh', background: '#0A0F1E', color: '#E2E8F0', fontFamily: "'Noto Sans JP', sans-serif" }}>
        <div style={{ maxWidth: 640, margin: '0 auto', padding: '40px 20px' }}>
          <div style={{ fontSize: 12, color: '#D4AF37', letterSpacing: 3, marginBottom: 8 }}>House-AI Pro</div>
          <div style={{ fontSize: 28, fontWeight: 500, marginBottom: 4 }}>AI現地調査室</div>
          <div style={{ fontSize: 13, color: '#64748B', marginBottom: 40 }}>現地へ行く前に80%判断する</div>

          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 6 }}>物件所在地</div>
            <input
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="例：埼玉県さいたま市大宮区〇〇"
              style={{ fontSize: 16, background: '#111827', border: '1px solid #1E293B', color: '#E2E8F0', padding: '12px 16px', borderRadius: 8, width: '100%', boxSizing: 'border-box', outline: 'none' }}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 6 }}>調査目的</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {PURPOSE_OPTIONS.map(opt => (
                <button
                  key={opt}
                  onClick={() => setPurpose(opt)}
                  style={{ fontSize: 13, padding: '8px 16px', borderRadius: 20, cursor: 'pointer', border: purpose === opt ? 'none' : '1px solid #1E293B', background: purpose === opt ? '#D4AF37' : '#111827', color: purpose === opt ? '#0A0F1E' : '#64748B' }}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 6 }}>現地写真（最大10枚）</div>
            <div
              onClick={() => photoInputRef.current ? photoInputRef.current.click() : null}
              style={{ border: '2px dashed #1E293B', borderRadius: 12, padding: 32, textAlign: 'center', cursor: 'pointer' }}
            >
              <input
                ref={photoInputRef}
                type="file"
                multiple
                accept="image/*"
                style={{ display: 'none' }}
                onChange={e => setPhotos(Array.from(e.target.files || []))}
              />
              {photos.length > 0 ? (
                <div style={{ fontSize: 14, color: '#D4AF37' }}>{photos.length}枚選択済み</div>
              ) : (
                <div style={{ fontSize: 14, color: '#475569' }}>写真をアップロード</div>
              )}
            </div>
          </div>

          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 6 }}>図面・資料PDF（最大3ファイル）</div>
            <div
              onClick={() => pdfInputRef.current ? pdfInputRef.current.click() : null}
              style={{ border: '2px dashed #1E293B', borderRadius: 12, padding: 32, textAlign: 'center', cursor: 'pointer' }}
            >
              <input
                ref={pdfInputRef}
                type="file"
                multiple
                accept=".pdf"
                style={{ display: 'none' }}
                onChange={e => setPdfs(Array.from(e.target.files || []))}
              />
              {pdfs.length > 0 ? (
                <div>
                  {pdfs.map((f, i) => (
                    <div key={i} style={{ fontSize: 13, color: '#D4AF37', marginBottom: 4 }}>{f.name}</div>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: 14, color: '#475569' }}>PDFをアップロード</div>
              )}
            </div>
          </div>

          <button
            onClick={() => (address && purpose) ? setScreen('interview') : null}
            style={{ background: '#D4AF37', color: '#0A0F1E', fontSize: 15, fontWeight: 500, padding: 14, width: '100%', borderRadius: 8, border: 'none', cursor: 'pointer', opacity: (address && purpose) ? 1 : 0.4, pointerEvents: (address && purpose) ? 'auto' : 'none' }}
          >
            AI現地調査を開始する
          </button>
        </div>
      </div>
    )
  }

  if (screen === 'interview') {
    const currentQ = QUESTIONS[interviewStep]
    return (
      <div style={{ minHeight: '100vh', background: '#0A0F1E', color: '#E2E8F0', fontFamily: "'Noto Sans JP', sans-serif", padding: '40px 20px' }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <div style={{ fontSize: 12, color: '#D4AF37', letterSpacing: 3, marginBottom: 24 }}>House-AI Pro</div>

          {QUESTIONS.slice(0, interviewStep).map((q) => (
            <div key={q.key} style={{ marginBottom: 16 }}>
              <div style={{ background: '#111827', borderRadius: 12, padding: 16, maxWidth: 480, marginBottom: 8 }}>
                <div style={{ fontSize: 14, color: '#CBD5E1' }}>{q.text}</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <div style={{ background: '#1E3A5F', borderRadius: 12, padding: '12px 16px', fontSize: 14, color: '#E2E8F0', maxWidth: 320 }}>
                  {interviewAnswers[q.key]}
                </div>
              </div>
            </div>
          ))}

          {(interviewStep < QUESTIONS.length) ? (
            <div>
              <div style={{ background: '#111827', borderRadius: 12, padding: 16, maxWidth: 480, marginBottom: 16 }}>
                <div style={{ fontSize: 14, color: '#CBD5E1' }}>{currentQ.text}</div>
              </div>
              {currentQ.options ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {currentQ.options.map(opt => (
                    <button
                      key={opt}
                      onClick={() => handleAnswerSelect(currentQ.key, opt)}
                      style={{ fontSize: 13, padding: '10px 20px', borderRadius: 20, cursor: 'pointer', background: '#111827', border: '1px solid #1E293B', color: '#E2E8F0' }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              ) : (
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="text"
                    value={interviewInput}
                    onChange={e => setInterviewInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' ? handleAnswerText() : null}
                    placeholder={currentQ.placeholder || ''}
                    style={{ flex: 1, fontSize: 16, background: '#111827', border: '1px solid #1E293B', color: '#E2E8F0', padding: '12px 16px', borderRadius: 8, outline: 'none' }}
                  />
                  <button
                    onClick={handleAnswerText}
                    style={{ background: '#D4AF37', color: '#0A0F1E', border: 'none', borderRadius: 8, padding: '0 20px', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}
                  >
                    送信
                  </button>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    )
  }

  if (screen === 'analyzing') {
    return (
      <div style={{ minHeight: '100vh', background: '#0A0F1E', color: '#E2E8F0', fontFamily: "'Noto Sans JP', sans-serif", display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
        <style>{`
          @keyframes breathe {
            0%, 100% { transform: scale(1); filter: drop-shadow(0 0 8px rgba(212,175,55,0.4)); }
            50% { transform: scale(1.08); filter: drop-shadow(0 0 20px rgba(212,175,55,0.8)); }
          }
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
        <img src="/favicon.png" alt="" width={64} style={{ marginBottom: 32, animation: 'breathe 2s ease-in-out infinite' }} />
        <div style={{ maxWidth: 320, width: '100%' }}>
          {logMessages.map((msg, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
              <span style={{ fontSize: 13, color: '#94A3B8' }}>{msg}</span>
            </div>
          ))}
          {logMessages.length < LOGS.length ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid #D4AF37', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
              <span style={{ fontSize: 13, color: '#64748B' }}>{LOGS[logMessages.length]}</span>
            </div>
          ) : null}
        </div>
      </div>
    )
  }

  if (screen === 'report') {
    const r = report || FALLBACK_REPORT
    return (
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', fontFamily: "'Noto Sans JP', sans-serif" }}>
        <button
          onClick={() => { window.location.href = '/pro' }}
          style={{ position: 'fixed', top: 16, right: 16, zIndex: 100, background: 'transparent', border: '1px solid #1E293B', color: '#64748B', borderRadius: 6, padding: '4px 10px', fontSize: 16, cursor: 'pointer' }}
        >
          ×
        </button>

        {/* 左パネル */}
        <div style={{ width: '30%', minWidth: 280, background: '#0D1117', borderRight: '1px solid #1E293B', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: 16, borderBottom: '1px solid #1E293B' }}>
            <div style={{ fontSize: 12, color: '#D4AF37' }}>AI現地調査レポート</div>
            <div style={{ fontSize: 11, color: '#64748B', marginTop: 4 }}>{address}</div>
          </div>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #1E293B' }}>
            <div style={{ fontSize: 11, color: '#94A3B8' }}>総合信頼度 {r.meta ? r.meta.confidence : '-'}%</div>
            <div style={{ background: '#1E293B', height: 4, borderRadius: 2, marginTop: 6 }}>
              <div style={{ background: '#D4AF37', height: 4, width: `${r.meta ? r.meta.confidence : 0}%`, borderRadius: 2 }} />
            </div>
          </div>
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {MENU_ITEMS.map((item, i) => {
              const conf = getConfidence(item.key)
              return (
                <div
                  key={item.key}
                  onClick={() => setActiveItem(i)}
                  style={{ padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid #0F172A', borderLeft: activeItem === i ? '2px solid #D4AF37' : '2px solid transparent', background: activeItem === i ? '#1E293B' : 'transparent', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <span style={{ fontSize: 13, color: '#E2E8F0' }}>{item.label}</span>
                  {conf !== null ? <span style={{ fontSize: 11, color: '#475569' }}>{conf}%</span> : null}
                </div>
              )
            })}
          </div>
          <div style={{ padding: 12, borderTop: '1px solid #1E293B' }}>
            {chatMessages.length > 0 ? (
              <div style={{ maxHeight: 200, overflowY: 'auto', marginBottom: 8 }}>
                {chatMessages.map((msg, i) => (
                  <div key={i} style={{ marginBottom: 6, textAlign: msg.role === 'user' ? 'right' : 'left' }}>
                    <span style={{ display: 'inline-block', fontSize: 11, color: msg.role === 'user' ? '#CBD5E1' : '#94A3B8', background: msg.role === 'user' ? '#1E3A5F' : '#111827', borderRadius: 8, padding: '6px 10px', maxWidth: '90%', wordBreak: 'break-word' }}>{formatChatText(msg.content)}</span>
                  </div>
                ))}
                {chatLoading ? <div style={{ fontSize: 11, color: '#475569' }}>分析中...</div> : null}
              </div>
            ) : null}
            <input
              type="text"
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' ? handleChatSend() : null}
              placeholder="追加で質問する..."
              style={{ fontSize: 16, background: '#111827', border: '1px solid #1E293B', color: '#E2E8F0', padding: '8px 12px', borderRadius: 6, width: '100%', boxSizing: 'border-box', outline: 'none' }}
            />
          </div>
        </div>

        {/* 右パネル */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 24, background: '#0A0F1E', color: '#E2E8F0' }}>
          {renderReportSection(r)}
        </div>
      </div>
    )
  }

  return null
}
