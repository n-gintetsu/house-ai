import { useState, useEffect, useMemo } from 'react'
import { supabase } from './lib/supabase'

const AREAS = ['東京都渋谷区', '新宿区', '港区', '目黒区', '世田谷区', '横浜市']
const LAYOUTS = ['1R', '1K', '1LDK', '2LDK', '3LDK']
const TAGS = ['在宅ワーク', '静か', '眺望', '駅近', 'ペット', 'デザイナーズ', '新築', '高級感']
const PROPERTY_TYPES = ['賃貸', '売買', '投資']
const LOG_MESSAGES = ['提携業者へ通知中...', 'AIが条件を整理中...', '27社へ送信しました']

function buildSummary({ areas, budgetMin, budgetMax, tags, freeText }) {
  const areaText = areas.length > 0 ? areas.join('・') : '未設定'
  const budgetText =
    budgetMin || budgetMax
      ? `${budgetMin || '下限なし'}万円〜${budgetMax || '上限なし'}万円`
      : '未設定'
  const features = [...tags]
  const trimmed = (freeText || '').trim()
  if (trimmed) features.push(trimmed.slice(0, 20))
  return { areaText, budgetText, features }
}

export default function CommunityCreatePage() {
  const [propertyType, setPropertyType] = useState('賃貸')
  const [areas, setAreas] = useState([])
  const [budgetMin, setBudgetMin] = useState('')
  const [budgetMax, setBudgetMax] = useState('')
  const [layouts, setLayouts] = useState([])
  const [tags, setTags] = useState([])
  const [freeText, setFreeText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [phase, setPhase] = useState('form')
  const [visibleLogs, setVisibleLogs] = useState(0)

  const hasInput = areas.length > 0 || tags.length > 0 || freeText.trim().length > 0

  const summary = useMemo(
    () => buildSummary({ areas, budgetMin, budgetMax, tags, freeText }),
    [areas, budgetMin, budgetMax, tags, freeText]
  )

  function toggleArea(area) {
    setAreas(prev =>
      prev.includes(area) ? prev.filter(a => a !== area) : [...prev, area]
    )
  }
  function toggleLayout(layout) {
    setLayouts(prev =>
      prev.includes(layout) ? prev.filter(l => l !== layout) : [...prev, layout]
    )
  }
  function toggleTag(tag) {
    setTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  async function handleSubmit() {
    if (submitting) return
    setSubmitError('')
    setSubmitting(true)
    try {
      const aiSummary =
        `${propertyType}｜${summary.areaText}｜予算${summary.budgetText}｜${summary.features.join('/')}`
      const { error } = await supabase.from('community_posts').insert({
        property_type: propertyType,
        areas,
        budget_min: budgetMin ? parseInt(budgetMin, 10) : null,
        budget_max: budgetMax ? parseInt(budgetMax, 10) : null,
        layouts,
        tags,
        free_text: freeText.trim() || null,
        ai_summary: aiSummary,
        status: '募集中',
        proposal_count: 0,
      })
      if (error) throw error
      setPhase('success')
      setVisibleLogs(0)
    } catch {
      setSubmitError('送信に失敗しました。もう一度お試しください。')
    } finally {
      setSubmitting(false)
    }
  }

  useEffect(() => {
    if (phase !== 'success') return
    if (visibleLogs >= LOG_MESSAGES.length) return
    const delay = visibleLogs === 0 ? 500 : 1200
    const t = setTimeout(() => setVisibleLogs(v => v + 1), delay)
    return () => clearTimeout(t)
  }, [phase, visibleLogs])

  return (
    <>
      <style>{`
        .cc-wrap {
          min-height: 100svh;
          background: #050816;
          padding: 0 0 60px;
          position: relative;
          overflow: hidden;
        }
        .cc-grid {
          position: fixed;
          inset: 0;
          background-image:
            linear-gradient(rgba(100,140,255,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(100,140,255,0.04) 1px, transparent 1px);
          background-size: 48px 48px;
          pointer-events: none;
          z-index: 0;
        }
        .cc-inner {
          position: relative;
          z-index: 1;
          max-width: 560px;
          margin: 0 auto;
          padding: 0 16px;
        }
        .cc-header {
          padding: 32px 0 28px;
          text-align: center;
        }
        .cc-back {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: rgba(180,200,255,0.55);
          font-size: 13px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          margin-bottom: 20px;
          font-family: inherit;
        }
        .cc-badge {
          display: inline-block;
          font-size: 11px;
          color: #c9a84c;
          border: 1px solid rgba(201,168,76,0.4);
          padding: 4px 12px;
          border-radius: 999px;
          letter-spacing: 2px;
          margin-bottom: 14px;
        }
        .cc-title {
          font-size: clamp(20px, 5vw, 26px);
          font-weight: 800;
          color: #fff;
          margin: 0 0 10px;
          line-height: 1.35;
        }
        .cc-subtitle {
          font-size: 13px;
          color: rgba(180,200,255,0.65);
          margin: 0;
          line-height: 1.6;
        }
        .cc-section {
          margin-bottom: 24px;
        }
        .cc-label {
          display: block;
          font-size: 12px;
          color: rgba(180,200,255,0.55);
          letter-spacing: 1.5px;
          margin-bottom: 10px;
          text-transform: uppercase;
        }
        .cc-radio-group {
          display: flex;
          gap: 10px;
        }
        .cc-radio {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 12px 10px;
          border-radius: 10px;
          border: 1.5px solid rgba(100,140,255,0.18);
          color: rgba(180,200,255,0.6);
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          background: rgba(255,255,255,0.02);
          transition: border-color 0.15s, color 0.15s, background 0.15s;
          user-select: none;
        }
        .cc-radio.active {
          border-color: #c9a84c;
          color: #c9a84c;
          background: rgba(201,168,76,0.1);
        }
        .cc-chip-group {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .cc-chip {
          padding: 9px 14px;
          border-radius: 999px;
          border: 1.5px solid rgba(100,140,255,0.18);
          color: rgba(180,200,255,0.6);
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          background: rgba(255,255,255,0.02);
          transition: border-color 0.15s, color 0.15s, background 0.15s;
          user-select: none;
        }
        .cc-chip.active {
          border-color: #c9a84c;
          color: #c9a84c;
          background: rgba(201,168,76,0.1);
        }
        .cc-budget-row {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .cc-budget-input {
          flex: 1;
          background: rgba(255,255,255,0.04);
          border: 1.5px solid rgba(100,140,255,0.18);
          border-radius: 10px;
          padding: 12px 12px;
          color: #fff;
          font-size: 16px;
          font-family: inherit;
          outline: none;
          min-width: 0;
          box-sizing: border-box;
        }
        .cc-budget-input:focus {
          border-color: rgba(201,168,76,0.5);
        }
        .cc-budget-input::placeholder {
          color: rgba(180,200,255,0.3);
        }
        .cc-budget-sep {
          color: rgba(180,200,255,0.4);
          font-size: 14px;
          white-space: nowrap;
        }
        .cc-budget-unit {
          color: rgba(180,200,255,0.4);
          font-size: 13px;
          white-space: nowrap;
        }
        .cc-textarea {
          width: 100%;
          box-sizing: border-box;
          background: rgba(255,255,255,0.04);
          border: 1.5px solid rgba(100,140,255,0.18);
          border-radius: 12px;
          padding: 14px 14px;
          color: #fff;
          font-size: 16px;
          font-family: inherit;
          outline: none;
          resize: vertical;
          min-height: 100px;
          line-height: 1.6;
        }
        .cc-textarea:focus {
          border-color: rgba(201,168,76,0.5);
        }
        .cc-textarea::placeholder {
          color: rgba(180,200,255,0.3);
        }
        .cc-preview {
          border: 1px solid rgba(201,168,76,0.25);
          border-radius: 14px;
          padding: 16px 18px;
          background: rgba(201,168,76,0.05);
          margin-bottom: 24px;
        }
        .cc-preview-title {
          font-size: 11px;
          color: #c9a84c;
          letter-spacing: 2px;
          margin: 0 0 12px;
        }
        .cc-preview-row {
          display: flex;
          gap: 8px;
          margin-bottom: 6px;
          font-size: 13px;
          line-height: 1.5;
        }
        .cc-preview-key {
          color: rgba(180,200,255,0.5);
          white-space: nowrap;
          flex-shrink: 0;
          min-width: 52px;
        }
        .cc-preview-val {
          color: rgba(255,255,255,0.85);
        }
        .cc-submit-btn {
          width: 100%;
          padding: 16px;
          background: linear-gradient(135deg, #c9a84c, #e8c96a);
          color: #050816;
          border: none;
          border-radius: 14px;
          font-size: 16px;
          font-weight: 800;
          cursor: pointer;
          font-family: inherit;
          transition: opacity 0.15s, transform 0.1s;
          letter-spacing: 0.5px;
        }
        .cc-submit-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .cc-submit-btn:not(:disabled):hover {
          opacity: 0.92;
        }
        .cc-submit-btn:not(:disabled):active {
          transform: scale(0.98);
        }
        .cc-error {
          margin-top: 10px;
          padding: 12px 14px;
          border-radius: 10px;
          border: 1px solid rgba(255,100,100,0.4);
          background: rgba(255,60,60,0.08);
          color: #ffa0a0;
          font-size: 13px;
        }

        /* Success overlay */
        .cc-success {
          position: fixed;
          inset: 0;
          background: #050816;
          z-index: 100;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 32px 20px;
          text-align: center;
        }
        .cc-success-icon {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          border: 2px solid #c9a84c;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 24px;
          animation: ccPulse 2s ease-in-out infinite;
        }
        @keyframes ccPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(201,168,76,0.3); }
          50% { box-shadow: 0 0 0 12px rgba(201,168,76,0); }
        }
        .cc-success-title {
          font-size: 22px;
          font-weight: 800;
          color: #fff;
          margin: 0 0 28px;
        }
        .cc-success-logs {
          width: 100%;
          max-width: 340px;
          margin-bottom: 36px;
        }
        .cc-success-log {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          border-radius: 8px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(100,140,255,0.1);
          margin-bottom: 8px;
          font-size: 13px;
          color: rgba(180,200,255,0.8);
          animation: ccFadeIn 0.4s ease;
        }
        .cc-success-log.done {
          color: #c9a84c;
          border-color: rgba(201,168,76,0.25);
          background: rgba(201,168,76,0.05);
        }
        @keyframes ccFadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .cc-log-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: currentColor;
          flex-shrink: 0;
        }
        .cc-success-go-btn {
          padding: 14px 32px;
          background: transparent;
          border: 1.5px solid #c9a84c;
          border-radius: 12px;
          color: #c9a84c;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          font-family: inherit;
          transition: background 0.15s;
        }
        .cc-success-go-btn:hover {
          background: rgba(201,168,76,0.1);
        }
        .cc-divider {
          height: 1px;
          background: rgba(100,140,255,0.1);
          margin: 28px 0;
        }
      `}</style>

      {phase === 'success' ? (
        <div className="cc-success">
          <div className="cc-grid" />
          <div className="cc-success-icon">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path d="M8 16L13 21L24 11" stroke="#c9a84c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <p className="cc-success-title">投稿が完了しました</p>
          <div className="cc-success-logs">
            {LOG_MESSAGES.slice(0, visibleLogs).map((msg, i) => (
              <div key={i} className={`cc-success-log${i === visibleLogs - 1 && visibleLogs < LOG_MESSAGES.length ? '' : ' done'}`}>
                <span className="cc-log-dot" />
                {msg}
              </div>
            ))}
          </div>
          <button
            type="button"
            className="cc-success-go-btn"
            onClick={() => { window.location.href = '/community' }}
          >
            投稿一覧を見る
          </button>
        </div>
      ) : (
        <div className="cc-wrap">
          <div className="cc-grid" />
          <div className="cc-inner">
            <div className="cc-header">
              <button type="button" className="cc-back" onClick={() => window.history.back()}>
                ← 戻る
              </button>
              <div className="cc-badge">COMMUNITY</div>
              <h1 className="cc-title">理想の住まいを<br />教えてください</h1>
              <p className="cc-subtitle">
                AIが条件を整理し、条件に合う業者から提案を受けられます。
              </p>
            </div>

            <div className="cc-section">
              <span className="cc-label">希望種別</span>
              <div className="cc-radio-group">
                {PROPERTY_TYPES.map(type => (
                  <div
                    key={type}
                    className={`cc-radio${propertyType === type ? ' active' : ''}`}
                    onClick={() => setPropertyType(type)}
                    role="radio"
                    aria-checked={propertyType === type}
                  >
                    {type}
                  </div>
                ))}
              </div>
            </div>

            <div className="cc-section">
              <span className="cc-label">希望エリア（複数可）</span>
              <div className="cc-chip-group">
                {AREAS.map(area => (
                  <div
                    key={area}
                    className={`cc-chip${areas.includes(area) ? ' active' : ''}`}
                    onClick={() => toggleArea(area)}
                    role="checkbox"
                    aria-checked={areas.includes(area)}
                  >
                    {area}
                  </div>
                ))}
              </div>
            </div>

            <div className="cc-section">
              <span className="cc-label">予算</span>
              <div className="cc-budget-row">
                <input
                  className="cc-budget-input"
                  type="number"
                  inputMode="numeric"
                  placeholder="最低"
                  value={budgetMin}
                  onChange={e => setBudgetMin(e.target.value)}
                  style={{ fontSize: 16 }}
                />
                <span className="cc-budget-unit">万円</span>
                <span className="cc-budget-sep">〜</span>
                <input
                  className="cc-budget-input"
                  type="number"
                  inputMode="numeric"
                  placeholder="最高"
                  value={budgetMax}
                  onChange={e => setBudgetMax(e.target.value)}
                  style={{ fontSize: 16 }}
                />
                <span className="cc-budget-unit">万円</span>
              </div>
            </div>

            <div className="cc-section">
              <span className="cc-label">間取り（複数可）</span>
              <div className="cc-chip-group">
                {LAYOUTS.map(layout => (
                  <div
                    key={layout}
                    className={`cc-chip${layouts.includes(layout) ? ' active' : ''}`}
                    onClick={() => toggleLayout(layout)}
                    role="checkbox"
                    aria-checked={layouts.includes(layout)}
                  >
                    {layout}
                  </div>
                ))}
              </div>
            </div>

            <div className="cc-section">
              <span className="cc-label">重視ポイント（複数可）</span>
              <div className="cc-chip-group">
                {TAGS.map(tag => (
                  <div
                    key={tag}
                    className={`cc-chip${tags.includes(tag) ? ' active' : ''}`}
                    onClick={() => toggleTag(tag)}
                    role="checkbox"
                    aria-checked={tags.includes(tag)}
                  >
                    {tag}
                  </div>
                ))}
              </div>
            </div>

            <div className="cc-section">
              <span className="cc-label">自由入力（こだわり・詳細条件など）</span>
              <textarea
                className="cc-textarea"
                placeholder="例: ペット可で、駅から徒歩5分以内の静かな環境を希望します。できれば築10年以内..."
                value={freeText}
                onChange={e => setFreeText(e.target.value)}
                rows={4}
              />
            </div>

            {hasInput ? (
              <div className="cc-preview">
                <p className="cc-preview-title">AI整理結果</p>
                <div className="cc-preview-row">
                  <span className="cc-preview-key">希望エリア</span>
                  <span className="cc-preview-val">{summary.areaText}</span>
                </div>
                <div className="cc-preview-row">
                  <span className="cc-preview-key">予算</span>
                  <span className="cc-preview-val">{summary.budgetText}</span>
                </div>
                <div className="cc-preview-row">
                  <span className="cc-preview-key">特徴</span>
                  <span className="cc-preview-val">
                    {summary.features.length > 0 ? summary.features.join(' / ') : '—'}
                  </span>
                </div>
              </div>
            ) : null}

            <button
              type="button"
              className="cc-submit-btn"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? '送信中...' : 'この内容で投稿する'}
            </button>

            {submitError ? (
              <div className="cc-error">{submitError}</div>
            ) : null}

            <div className="cc-divider" />
          </div>
        </div>
      )}
    </>
  )
}
