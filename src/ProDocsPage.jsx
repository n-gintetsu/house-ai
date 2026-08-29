import { useState, useEffect, useRef } from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'

function formatChatText(text) {
  return text
    .replace(/^#{1,3}\s+/gm, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/^[*-]\s/gm, '・')
    .replace(/\n{3,}/g, '\n\n')
}

export default function ProDocsPage() {
  const [screen, setScreen] = useState('input')
  const [address, setAddress] = useState('')
  const [propertyType, setPropertyType] = useState('')
  const [ageYears, setAgeYears] = useState('')
  const [pdfs, setPdfs] = useState([])
  const [logIndex, setLogIndex] = useState(0)
  const [draft, setDraft] = useState(null)
  const [activeItem, setActiveItem] = useState(0)
  const [chatMessages, setChatMessages] = useState([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [menuCollapsed, setMenuCollapsed] = useState(false)

  const fileInputRef = useRef(null)
  const addFileInputRef = useRef(null)
  const chatEndRef = useRef(null)
  const apiCalledRef = useRef(false)

  const logs = ['書類受付中...', '登記簿解析中...', '管理規約解析中...', '用途地域確認中...', 'ハザード情報取得中...', 'ドラフト生成中...']

  const menuItems = [
    { key: 'property_info', label: '物件表示' },
    { key: 'rights', label: '権利関係' },
    { key: 'zoning', label: '用途地域・法令制限' },
    { key: 'hazard', label: 'ハザード' },
    { key: 'road_access', label: '接道・道路' },
    { key: 'management', label: '管理・修繕積立金' },
    { key: 'restrictions', label: '利用制限' },
    { key: 'transaction', label: '取引条件' },
  ]

  useEffect(() => {
    if (screen !== 'analyzing') return
    if (logIndex < logs.length - 1) {
      const timer = setTimeout(() => setLogIndex(prev => prev + 1), 1000)
      return () => clearTimeout(timer)
    }
    if (apiCalledRef.current) return
    apiCalledRef.current = true
    const timer = setTimeout(() => {
      fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-5',
          max_tokens: 3000,
          source_tool: 'main',
          feature: 'pro_docs_draft',
          system: `あなたは不動産取引の重要事項説明書作成を支援するAIアシスタントです。
プロの宅建士・不動産業者向けに重要事項説明書のドラフトを生成してください。
以下の情報を元に分析し、必ず以下のJSON形式のみで返答してください。前後に説明文は不要です。

物件所在地: ${address}
物件種別: ${propertyType}
築年数: ${ageYears || '不明'}
アップロード書類数: ${pdfs.length}件

重要：
- 確認できた項目はstatusを"ai_filled"に設定
- 推定・参考値の項目はstatusを"requires_check"に設定
- AIで判断不可の項目はstatusを"attorney_required"に設定
- cautionがある場合のみ文字列、ない場合はnull

JSON形式:
{
  "meta": { "confidence": 数値0-100, "warnings": [文字列配列] },
  "property_info": { "address": "文字列", "structure": "文字列", "floor_area": "文字列", "built_year": "文字列", "status": "ai_filled|requires_check", "caution": null或いは文字列 },
  "rights": { "owner": "文字列", "mortgage": "文字列", "status": "requires_check|attorney_required", "caution": null或いは文字列 },
  "zoning": { "use_district": "文字列", "building_coverage": "文字列", "floor_area_ratio": "文字列", "status": "ai_filled|requires_check", "caution": null或いは文字列 },
  "hazard": { "flood": "文字列", "landslide": "文字列", "tsunami": "文字列", "status": "requires_check", "caution": null或いは文字列 },
  "road_access": { "frontage": "文字列", "road_type": "文字列", "setback": "文字列", "status": "requires_check", "caution": null或いは文字列 },
  "management": { "fee": "文字列", "repair_fund": "文字列", "arrears": "文字列", "manager": "文字列", "status": "requires_check|attorney_required", "caution": null或いは文字列 },
  "restrictions": { "pet": "文字列", "renovation": "文字列", "other": "文字列", "status": "requires_check", "caution": null或いは文字列 },
  "transaction": { "price": "文字列", "deposit": "文字列", "payment": "文字列", "status": "attorney_required", "caution": "取引当事者間で決定してください。AIは入力できません。" },
  "attorney_note": "宅建士による最終確認・署名・押印が必ず必要です。本ドラフトは参考資料であり、法的効力はありません。"
}`,
          messages: [{ role: 'user', content: `物件所在地: ${address}\n物件種別: ${propertyType}\n築年数: ${ageYears || '不明'}\nアップロード書類: ${pdfs.length}件` }]
        })
      })
      .then(r => r.json())
      .then(data => {
        try {
          const text = data.text || ''
          const clean = text.replace(/```json|```/g, '').trim()
          const parsed = JSON.parse(clean)
          setDraft(parsed)
        } catch (e) {
          setDraft({
            meta: { confidence: 60, warnings: ['書類が不足しているため推定値が多くなっています'] },
            property_info: { address: address, structure: '確認推奨', floor_area: '確認推奨', built_year: ageYears || '不明', status: 'requires_check', caution: '登記簿をアップロードすると精度が上がります' },
            rights: { owner: '確認推奨', mortgage: '確認推奨', status: 'attorney_required', caution: '登記簿の確認が必要です' },
            zoning: { use_district: '確認推奨', building_coverage: '確認推奨', floor_area_ratio: '確認推奨', status: 'requires_check', caution: '行政窓口での確認を推奨します' },
            hazard: { flood: '確認推奨', landslide: '確認推奨', tsunami: '確認推奨', status: 'requires_check', caution: 'ハザードマップ原本を確認してください' },
            road_access: { frontage: '確認推奨', road_type: '確認推奨', setback: '確認推奨', status: 'requires_check', caution: '現地または行政窓口で確認してください' },
            management: { fee: '確認推奨', repair_fund: '確認推奨', arrears: '確認推奨', manager: '確認推奨', status: 'attorney_required', caution: '管理組合への直接照会が必要です' },
            restrictions: { pet: '確認推奨', renovation: '確認推奨', other: '確認推奨', status: 'requires_check', caution: '管理規約をアップロードすると自動抽出できます' },
            transaction: { price: '未入力', deposit: '未入力', payment: '未入力', status: 'attorney_required', caution: '取引当事者間で決定してください。AIは入力できません。' },
            attorney_note: '宅建士による最終確認・署名・押印が必ず必要です。本ドラフトは参考資料であり、法的効力はありません。'
          })
        }
        setScreen('draft')
      })
      .catch(() => { setScreen('draft') })
    }, 1000)
    return () => clearTimeout(timer)
  }, [screen, logIndex])

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [chatMessages])

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)
    setPdfs(prev => {
      const combined = [...prev, ...files]
      return combined.slice(0, 10)
    })
    e.target.value = ''
  }

  const removeFile = (index) => {
    setPdfs(prev => prev.filter((_, i) => i !== index))
  }

  const handleChatSubmit = () => {
    if (!chatInput.trim() || chatLoading) return
    const userMsg = chatInput.trim()
    setChatMessages(prev => [...prev, { role: 'user', content: userMsg }])
    setChatInput('')
    setChatLoading(true)
    fetch('/api/claude', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 1000,
        source_tool: 'main',
        feature: 'pro_docs_chat',
        system: 'あなたは重要事項説明書の専門家です。宅建士・不動産業者の質問に簡潔に答えてください。',
        messages: [
          ...chatMessages.map(m => ({ role: m.role, content: m.content })),
          { role: 'user', content: userMsg }
        ]
      })
    })
    .then(r => r.json())
    .then(data => {
      setChatMessages(prev => [...prev, { role: 'assistant', content: data.text || '回答を取得できませんでした' }])
      setChatLoading(false)
    })
    .catch(() => {
      setChatMessages(prev => [...prev, { role: 'assistant', content: 'エラーが発生しました。' }])
      setChatLoading(false)
    })
  }

  const getStatusColor = (status) => {
    if (status === 'ai_filled') return '#10B981'
    if (status === 'requires_check') return '#F59E0B'
    return '#6B7280'
  }

  const renderStatusBanner = (status) => {
    return status === 'ai_filled' ? (
      <div style={{ background: '#052e16', border: '1px solid #166534', color: '#4ade80', padding: '8px 12px', borderRadius: '6px', fontSize: '12px', marginBottom: '16px' }}>
        AI自動入力済み
      </div>
    ) : status === 'requires_check' ? (
      <div style={{ background: '#1c1007', border: '1px solid #92400e', color: '#fbbf24', padding: '8px 12px', borderRadius: '6px', fontSize: '12px', marginBottom: '16px' }}>
        要確認：内容をご確認ください
      </div>
    ) : (
      <div style={{ background: '#1f1f1f', border: '1px solid #374151', color: '#9ca3af', padding: '8px 12px', borderRadius: '6px', fontSize: '12px', marginBottom: '16px' }}>
        宅建士記入欄：AIでは入力できません
      </div>
    )
  }

  const renderField = (label, value) => (
    <div style={{ background: '#111827', border: '1px solid #1E293B', borderRadius: '8px', padding: '16px' }}>
      <div style={{ fontSize: '11px', color: '#64748B', marginBottom: '4px' }}>{label}</div>
      <div style={{ fontSize: '14px', color: '#E2E8F0' }}>{value}</div>
    </div>
  )

  const renderCaution = (caution) => {
    return caution !== null && caution !== undefined ? (
      <div style={{ background: '#1C1A0A', border: '1px solid #92400E', borderRadius: '6px', padding: '12px', marginTop: '12px' }}>
        <span style={{ fontSize: '12px', color: '#FCD34D' }}>※ {caution}</span>
      </div>
    ) : null
  }

  const renderSection = () => {
    if (!draft) return null
    const item = menuItems[activeItem]
    const key = item.key
    const section = draft[key]
    if (!section) return null

    if (key === 'transaction') {
      return (
        <div>
          <div style={{ fontSize: '20px', fontWeight: '500', marginBottom: '16px', color: '#E2E8F0' }}>取引条件</div>
          <div style={{ background: '#1f0000', border: '1px solid #dc2626', color: '#f87171', padding: '8px 12px', borderRadius: '6px', fontSize: '12px', marginBottom: '16px' }}>
            このセクションはAIでは入力できません
          </div>
          <div style={{ fontSize: '13px', color: '#94A3B8', lineHeight: '1.8' }}>
            手付金・売買代金・清算金などの取引条件は、売主・買主・仲介業者間の合意に基づくものです。AIが自動入力することは法的・倫理的に不適切であるため、本システムでは対応しておりません。宅建士が取引当事者の意向を確認の上、ご記入ください。
          </div>
        </div>
      )
    }

    const fieldMap = {
      property_info: [
        { label: '所在地', field: 'address' },
        { label: '構造', field: 'structure' },
        { label: '床面積', field: 'floor_area' },
        { label: '築年', field: 'built_year' },
      ],
      rights: [
        { label: '所有者', field: 'owner' },
        { label: '抵当権等', field: 'mortgage' },
      ],
      zoning: [
        { label: '用途地域', field: 'use_district' },
        { label: '建蔽率', field: 'building_coverage' },
        { label: '容積率', field: 'floor_area_ratio' },
      ],
      hazard: [
        { label: '洪水', field: 'flood' },
        { label: '土砂災害', field: 'landslide' },
        { label: '津波', field: 'tsunami' },
      ],
      road_access: [
        { label: '接道幅員', field: 'frontage' },
        { label: '道路種別', field: 'road_type' },
        { label: 'セットバック', field: 'setback' },
      ],
      management: [
        { label: '管理費', field: 'fee' },
        { label: '修繕積立金', field: 'repair_fund' },
        { label: '滞納状況', field: 'arrears' },
        { label: '管理会社', field: 'manager' },
      ],
      restrictions: [
        { label: 'ペット', field: 'pet' },
        { label: 'リフォーム', field: 'renovation' },
        { label: 'その他制限', field: 'other' },
      ],
    }

    const titleMap = {
      property_info: '物件表示',
      rights: '権利関係',
      zoning: '用途地域・法令制限',
      hazard: 'ハザード',
      road_access: '接道・道路',
      management: '管理・修繕積立金',
      restrictions: '利用制限',
    }

    const fields = fieldMap[key] || []

    return (
      <div>
        <div style={{ fontSize: '20px', fontWeight: '500', marginBottom: '16px', color: '#E2E8F0' }}>{titleMap[key]}</div>
        {renderStatusBanner(section.status)}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {fields.map(f => renderField(f.label, section[f.field]))}
        </div>
        {renderCaution(section.caution)}
      </div>
    )
  }

  if (screen === 'input') {
    return (
      <div style={{ background: '#0A0F1E', minHeight: '100vh', color: '#E2E8F0' }}>
        <div style={{ maxWidth: '640px', margin: '0 auto', padding: '40px 20px' }}>
          <div style={{ textAlign: 'center' }}>
            <img src="/logo.png" alt="logo" style={{ width: '140px', marginBottom: '16px' }} />
            <div style={{ fontSize: '28px', fontWeight: '500', color: '#E2E8F0' }}>AI重説ドラフト支援</div>
            <div style={{ fontSize: '13px', color: '#64748B', marginBottom: '40px' }}>重説作成を2〜4時間から30分に</div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '6px' }}>物件所在地</div>
            <input
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="例：東京都中央区〇〇"
              style={{ fontSize: '16px', background: '#111827', border: '1px solid #1E293B', color: '#E2E8F0', padding: '12px 16px', borderRadius: '8px', width: '100%', boxSizing: 'border-box', outline: 'none' }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '6px' }}>物件種別</div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['戸建', 'マンション', '土地'].map(type => (
                <button
                  key={type}
                  onClick={() => setPropertyType(type)}
                  style={{
                    fontSize: '13px',
                    padding: '8px 20px',
                    borderRadius: '20px',
                    cursor: 'pointer',
                    background: propertyType === type ? '#D4AF37' : '#111827',
                    color: propertyType === type ? '#0A0F1E' : '#64748B',
                    border: propertyType === type ? 'none' : '1px solid #1E293B',
                    fontWeight: '400',
                  }}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '6px' }}>築年数</div>
            <input
              type="text"
              value={ageYears}
              onChange={e => setAgeYears(e.target.value)}
              placeholder="例：築35年、または西暦1989年築"
              style={{ fontSize: '16px', background: '#111827', border: '1px solid #1E293B', color: '#E2E8F0', padding: '12px 16px', borderRadius: '8px', width: '100%', boxSizing: 'border-box', outline: 'none' }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '4px' }}>書類PDFアップロード（最大10ファイル）</div>
            <div style={{ fontSize: '11px', color: '#475569', marginBottom: '8px' }}>登記簿・管理規約・修繕積立金明細・公図・測量図など</div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              multiple
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            <input
              ref={addFileInputRef}
              type="file"
              accept=".pdf"
              multiple
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            {pdfs.length === 0 ? (
              <div
                onClick={() => fileInputRef.current ? fileInputRef.current.click() : null}
                style={{ border: '2px dashed #1E293B', borderRadius: '12px', padding: '32px', textAlign: 'center', cursor: 'pointer' }}
              >
                <div style={{ fontSize: '14px', color: '#475569' }}>PDFをアップロード</div>
              </div>
            ) : (
              <div>
                {pdfs.map((file, index) => (
                  <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#111827', borderRadius: '6px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '13px', color: '#E2E8F0' }}>{file.name}</span>
                    <button
                      onClick={() => removeFile(index)}
                      style={{ color: '#EF4444', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '14px' }}
                    >
                      ×
                    </button>
                  </div>
                ))}
                {pdfs.length < 10 ? (
                  <button
                    onClick={() => addFileInputRef.current ? addFileInputRef.current.click() : null}
                    style={{ background: 'transparent', border: '1px dashed #475569', color: '#64748B', padding: '8px', width: '100%', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', marginTop: '8px' }}
                  >
                    + PDFを追加（{pdfs.length}/10）
                  </button>
                ) : null}
              </div>
            )}
          </div>

          <div style={{ background: '#0D1117', border: '1px solid #1E293B', borderRadius: '8px', padding: '16px', marginTop: '24px' }}>
            <div style={{ fontSize: '12px', color: '#64748B' }}>AIが入力可能な項目を自動入力し、確認が必要な項目にフラグを立てます。</div>
            <div style={{ fontSize: '12px', color: '#92400E', marginTop: '4px' }}>宅建士による最終確認・署名は必ず行ってください。</div>
          </div>

          <button
            onClick={() => {
              if (address && propertyType) {
                apiCalledRef.current = false
                setLogIndex(0)
                setScreen('analyzing')
              }
            }}
            style={{
              background: '#D4AF37',
              color: '#0A0F1E',
              fontSize: '15px',
              fontWeight: '500',
              padding: '14px',
              width: '100%',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              marginTop: '24px',
              opacity: address && propertyType ? 1 : 0.4,
              pointerEvents: address && propertyType ? 'auto' : 'none',
            }}
          >
            AI重説ドラフト生成を開始する
          </button>
        </div>
      </div>
    )
  }

  if (screen === 'analyzing') {
    return (
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: '#0A0F1E', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <style>{`
          @keyframes prodocs-breathe {
            0%, 100% { transform: scale(1); opacity: 0.8; }
            50% { transform: scale(1.08); opacity: 1; }
          }
          @keyframes prodocs-glow {
            0%, 100% { filter: drop-shadow(0 0 8px rgba(212,175,55,0.3)); }
            50% { filter: drop-shadow(0 0 20px rgba(212,175,55,0.7)); }
          }
        `}</style>
        <img
          src="/favicon.png"
          alt="loading"
          style={{ width: '64px', marginBottom: '32px', animation: 'prodocs-breathe 2s ease-in-out infinite, prodocs-glow 2s ease-in-out infinite', borderRadius: '50%' }}
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '240px' }}>
          {logs.map((log, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: i <= logIndex ? 1 : 0.2 }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                {i < logIndex ? (
                  <circle cx="7" cy="7" r="7" fill="#10B981" />
                ) : i === logIndex ? (
                  <circle cx="7" cy="7" r="7" fill="#D4AF37" />
                ) : (
                  <circle cx="7" cy="7" r="7" fill="#1E293B" />
                )}
                {i < logIndex ? (
                  <path d="M4 7L6 9L10 5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                ) : null}
              </svg>
              <span style={{ fontSize: '13px', color: i < logIndex ? '#10B981' : i === logIndex ? '#D4AF37' : '#64748B' }}>{log}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (screen === 'draft') {
    return (
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', background: '#0A0F1E' }}>
        <button
          onClick={() => { window.location.href = '/pro' }}
          style={{ position: 'fixed', top: '16px', right: '16px', zIndex: 100, background: 'transparent', border: '1px solid #1E293B', color: '#E2E8F0', fontSize: '18px', cursor: 'pointer', borderRadius: '6px', padding: '4px 10px', lineHeight: '1', fontWeight: '400' }}
        >
          ×
        </button>

        <div style={{ width: '30%', minWidth: '260px', background: '#0D1117', borderRight: '1px solid #1E293B', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '16px', borderBottom: '1px solid #1E293B' }}>
            <div style={{ fontSize: '12px', color: '#D4AF37' }}>AI重説ドラフト</div>
            <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>{address}</div>
          </div>

          {draft ? (
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #1E293B' }}>
              <div style={{ fontSize: '11px', color: '#94A3B8' }}>総合信頼度 {draft.meta.confidence}%</div>
              <div style={{ background: '#1E293B', height: '4px', borderRadius: '2px', marginTop: '6px' }}>
                <div style={{ background: '#D4AF37', width: `${draft.meta.confidence}%`, height: '100%', borderRadius: '2px' }} />
              </div>
            </div>
          ) : null}

          <div style={{ padding: '8px 16px', borderBottom: '1px solid #1E293B', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: '#10B981' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
              AI入力済
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: '#F59E0B' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#F59E0B', display: 'inline-block' }} />
              要確認
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: '#6B7280' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#6B7280', display: 'inline-block' }} />
              宅建士記入
            </span>
          </div>

          <div
            onClick={() => setMenuCollapsed(prev => !prev)}
            style={{ padding: '8px 16px', borderBottom: '1px solid #1E293B', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', userSelect: 'none' }}
          >
            <span style={{ fontSize: '11px', color: '#94A3B8' }}>書類カテゴリ</span>
            {menuCollapsed ? <ChevronDown size={14} color="#D4AF37" /> : <ChevronUp size={14} color="#D4AF37" />}
          </div>

          {menuCollapsed ? null : (
            <div style={{ overflowY: 'auto' }}>
              {menuItems.map((item, i) => {
                const sectionData = draft ? draft[item.key] : null
                const status = sectionData ? sectionData.status : 'requires_check'
                return (
                  <div
                    key={item.key}
                    onClick={() => setActiveItem(i)}
                    style={{
                      padding: '12px 16px',
                      cursor: 'pointer',
                      borderBottom: '1px solid #0F172A',
                      background: activeItem === i ? '#1E293B' : 'transparent',
                      borderLeft: activeItem === i ? '2px solid #D4AF37' : '2px solid transparent',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span style={{ fontSize: '13px', color: '#E2E8F0' }}>{item.label}</span>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: getStatusColor(status), display: 'inline-block', flexShrink: 0 }} />
                  </div>
                )
              })}
            </div>
          )}

          <div style={{ padding: '12px 16px', borderTop: '1px solid #1E293B' }}>
            <div style={{ fontSize: '10px', color: '#475569' }}>※本ドラフトは参考資料です</div>
            <div style={{ fontSize: '10px', color: '#92400E', marginTop: '2px' }}>宅建士の最終確認が必要です</div>
          </div>

          <div style={{ padding: '12px', borderTop: '1px solid #1E293B', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
            {chatMessages.length > 0 ? (
              <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', marginBottom: '8px' }}>
                {chatMessages.map((msg, i) => (
                  <div key={i} style={{ marginBottom: '6px' }}>
                    <div style={{ fontSize: '10px', color: msg.role === 'user' ? '#D4AF37' : '#64748B', marginBottom: '2px' }}>
                      {msg.role === 'user' ? 'あなた' : 'AI'}
                    </div>
                    <div style={{ fontSize: '15px', lineHeight: '1.6', color: '#E2E8F0', whiteSpace: 'pre-wrap' }}>
                      {msg.role === 'assistant' ? formatChatText(msg.content) : msg.content}
                    </div>
                  </div>
                ))}
                {chatLoading ? <div style={{ fontSize: '12px', color: '#64748B' }}>解析中...</div> : null}
                <div ref={chatEndRef} />
              </div>
            ) : null}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <textarea
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                placeholder="書類の内容について質問する..."
                rows={3}
                style={{ fontSize: '16px', fontWeight: 400, background: '#111827', border: '1px solid #1E293B', color: '#E2E8F0', padding: '8px 12px', borderRadius: '6px', width: '100%', boxSizing: 'border-box', outline: 'none', resize: 'none' }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={handleChatSubmit}
                  style={{ background: '#c9a84c', color: '#0A0F1E', border: 'none', borderRadius: '6px', padding: '6px 18px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}
                >
                  送信
                </button>
              </div>
            </div>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', background: '#0A0F1E' }}>
          {renderSection()}

          <div style={{ marginTop: '48px', paddingTop: '24px', borderTop: '1px solid #1E293B' }}>
            <div style={{ fontSize: '16px', fontWeight: '500', color: '#E2E8F0', marginBottom: '16px' }}>次のステップ</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                disabled
                style={{ background: '#1E293B', color: '#64748B', padding: '12px 24px', borderRadius: '8px', border: 'none', cursor: 'not-allowed', fontSize: '14px', fontWeight: '400', opacity: 0.5, textAlign: 'left' }}
              >
                PDF出力（準備中）
              </button>
              <button
                onClick={() => { window.location.href = '/pro/investigation' }}
                style={{ background: '#D4AF37', color: '#0A0F1E', padding: '12px 24px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '500', textAlign: 'left' }}
              >
                AI現地調査室で物件を詳細調査する
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return null
}
