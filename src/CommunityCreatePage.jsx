import { useState } from 'react'
import { supabase } from './lib/supabase'

const PROPERTY_TYPES = ['賃貸', '売買', '投資']
const POPULAR_AREAS = ['東京都渋谷区', '東京都新宿区', '横浜市中区', '名古屋市中区']
const LAYOUTS = ['1R', '1K', '1DK', '1LDK', '2DK', '2LDK', '3LDK', '4LDK+']
const TAGS = ['在宅ワーク', '静か', '眺望', '駅近', 'ペット', 'デザイナーズ', '新築', '高級感', '日当たり', 'セキュリティ']

async function callClaudeForSummary(formData) {
  const { propertyType, areaInput, minBudget, maxBudget, selectedLayouts, selectedTags, freeText } = formData
  const userText = [
    `希望種別: ${propertyType}`,
    `希望エリア: ${areaInput || '未指定'}`,
    `予算: ${minBudget ? minBudget + '万円' : '下限なし'}〜${maxBudget ? maxBudget + '万円' : '上限なし'}`,
    selectedLayouts.length > 0 ? `間取り: ${selectedLayouts.join('/')}` : '',
    selectedTags.length > 0 ? `重視ポイント: ${selectedTags.join('/')}` : '',
    freeText ? `詳細: ${freeText}` : '',
  ].filter(Boolean).join('\n')

  const res = await fetch('/api/claude', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-5',
      system: 'あなたは不動産検索アシスタントです。ユーザーの住宅希望条件を、業者が理解しやすいよう簡潔に整理してください。200文字以内で、箇条書きを使わず自然な文体でまとめてください。',
      messages: [{ role: 'user', content: [{ type: 'text', text: userText }] }],
      temperature: 0.3,
      max_tokens: 300,
    }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error('AI整理に失敗しました')
  return typeof data.text === 'string' ? data.text : ''
}

export default function CommunityCreatePage() {
  const [propertyType, setPropertyType] = useState('賃貸')
  const [areaInput, setAreaInput] = useState('')
  const [minBudget, setMinBudget] = useState('')
  const [maxBudget, setMaxBudget] = useState('')
  const [selectedLayouts, setSelectedLayouts] = useState([])
  const [selectedTags, setSelectedTags] = useState([])
  const [freeText, setFreeText] = useState('')

  const [aiSummary, setAiSummary] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  function toggleLayout(layout) {
    setSelectedLayouts(prev =>
      prev.includes(layout) ? prev.filter(l => l !== layout) : [...prev, layout]
    )
  }

  function toggleTag(tag) {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  function addArea(area) {
    if (!areaInput) {
      setAreaInput(area)
    } else if (!areaInput.includes(area)) {
      setAreaInput(prev => prev + '・' + area)
    }
  }

  async function handleGenerateSummary() {
    if (aiLoading) return
    setAiError('')
    setAiLoading(true)
    try {
      const text = await callClaudeForSummary({
        propertyType, areaInput, minBudget, maxBudget, selectedLayouts, selectedTags, freeText,
      })
      setAiSummary(text)
    } catch {
      setAiError('AIの整理に失敗しました。そのまま投稿することもできます。')
      setAiSummary('')
    } finally {
      setAiLoading(false)
    }
  }

  async function handleSubmit() {
    if (submitting) return
    setSubmitError('')
    setSubmitting(true)
    try {
      const areas = areaInput
        ? areaInput.split(/[・,、，\s]+/).map(s => s.trim()).filter(Boolean)
        : []
      const { error } = await supabase.from('community_posts').insert({
        property_type: propertyType,
        areas,
        budget_min: minBudget ? parseInt(minBudget, 10) * 10000 : null,
        budget_max: maxBudget ? parseInt(maxBudget, 10) * 10000 : null,
        layouts: selectedLayouts,
        tags: selectedTags,
        free_text: freeText.trim() || null,
        ai_summary: aiSummary || null,
        status: '募集中',
        proposal_count: 0,
      })
      if (error) throw error
      window.location.href = '/community/success'
    } catch {
      setSubmitError('送信に失敗しました。もう一度お試しください。')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <style>{`
        .cp-wrap {
          min-height: 100svh;
          background: #0a0a0f;
          padding-bottom: 60px;
          position: relative;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        .cp-grid {
          position: fixed;
          inset: 0;
          background-image:
            linear-gradient(rgba(100,140,255,0.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(100,140,255,0.035) 1px, transparent 1px);
          background-size: 56px 56px;
          pointer-events: none;
          z-index: 0;
        }
        .cp-header {
          position: sticky;
          top: 0;
          z-index: 50;
          background: rgba(10,10,15,0.92);
          border-bottom: 1px solid rgba(100,140,255,0.1);
          padding: 14px 20px;
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .cp-back-btn {
          background: none;
          border: 1px solid rgba(100,140,255,0.2);
          border-radius: 8px;
          color: rgba(180,200,255,0.6);
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          padding: 7px 12px;
          font-family: inherit;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .cp-header-title {
          font-size: clamp(14px,4vw,17px);
          font-weight: 800;
          color: #fff;
          margin: 0;
        }
        .cp-inner {
          position: relative;
          z-index: 1;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px 16px 0;
        }
        .cp-card {
          background: #1a1a24;
          border: 1px solid rgba(100,140,255,0.12);
          border-radius: 16px;
          padding: 20px;
          margin-bottom: 16px;
        }
        .cp-section-title {
          font-size: 12px;
          color: rgba(180,200,255,0.45);
          letter-spacing: 2px;
          text-transform: uppercase;
          margin: 0 0 12px;
        }
        .cp-radio-group {
          display: flex;
          gap: 10px;
        }
        .cp-radio {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 12px 8px;
          border-radius: 10px;
          border: 1.5px solid rgba(100,140,255,0.18);
          color: rgba(180,200,255,0.55);
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          background: rgba(255,255,255,0.02);
          transition: border-color 0.15s, color 0.15s, background 0.15s;
          user-select: none;
          font-family: inherit;
        }
        .cp-radio.active {
          border-color: #c9a84c;
          color: #c9a84c;
          background: rgba(201,168,76,0.1);
        }
        .cp-area-input {
          width: 100%;
          box-sizing: border-box;
          background: rgba(255,255,255,0.04);
          border: 1.5px solid rgba(100,140,255,0.18);
          border-radius: 10px;
          padding: 12px 14px;
          color: #fff;
          font-size: 16px;
          font-family: inherit;
          outline: none;
          margin-bottom: 10px;
        }
        .cp-area-input:focus {
          border-color: rgba(201,168,76,0.5);
        }
        .cp-area-input::placeholder {
          color: rgba(180,200,255,0.3);
        }
        .cp-chip-group {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .cp-chip {
          padding: 8px 14px;
          border-radius: 999px;
          border: 1.5px solid rgba(100,140,255,0.18);
          color: rgba(180,200,255,0.55);
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          background: rgba(255,255,255,0.02);
          transition: border-color 0.15s, color 0.15s, background 0.15s;
          user-select: none;
          font-family: inherit;
        }
        .cp-chip.active {
          border-color: #c9a84c;
          color: #c9a84c;
          background: rgba(201,168,76,0.1);
        }
        .cp-quick-chip {
          padding: 6px 12px;
          border-radius: 8px;
          border: 1px solid rgba(100,140,255,0.18);
          color: rgba(180,200,255,0.55);
          font-size: 12px;
          cursor: pointer;
          background: rgba(255,255,255,0.02);
          font-family: inherit;
        }
        .cp-quick-chip:hover {
          border-color: rgba(201,168,76,0.4);
          color: rgba(201,168,76,0.8);
        }
        .cp-budget-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .cp-budget-input {
          flex: 1;
          min-width: 0;
          background: rgba(255,255,255,0.04);
          border: 1.5px solid rgba(100,140,255,0.18);
          border-radius: 10px;
          padding: 12px 12px;
          color: #fff;
          font-size: 16px;
          font-family: inherit;
          outline: none;
          box-sizing: border-box;
        }
        .cp-budget-input:focus {
          border-color: rgba(201,168,76,0.5);
        }
        .cp-budget-input::placeholder {
          color: rgba(180,200,255,0.3);
        }
        .cp-budget-label {
          color: rgba(180,200,255,0.4);
          font-size: 13px;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .cp-textarea {
          width: 100%;
          box-sizing: border-box;
          background: rgba(255,255,255,0.04);
          border: 1.5px solid rgba(100,140,255,0.18);
          border-radius: 10px;
          padding: 14px;
          color: #fff;
          font-size: 16px;
          font-family: inherit;
          outline: none;
          resize: vertical;
          min-height: 100px;
          line-height: 1.6;
        }
        .cp-textarea:focus {
          border-color: rgba(201,168,76,0.5);
        }
        .cp-textarea::placeholder {
          color: rgba(180,200,255,0.3);
        }
        .cp-ai-btn {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, #6d28d9, #7c3aed, #8b5cf6);
          color: #fff;
          border: none;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          font-family: inherit;
          transition: opacity 0.15s, transform 0.1s;
          margin-bottom: 16px;
          letter-spacing: 0.3px;
        }
        .cp-ai-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .cp-ai-btn:not(:disabled):hover {
          opacity: 0.9;
        }
        .cp-ai-btn:not(:disabled):active {
          transform: scale(0.98);
        }
        .cp-ai-result {
          border: 1px solid rgba(139,92,246,0.3);
          border-radius: 12px;
          padding: 14px 16px;
          background: rgba(109,40,217,0.08);
          margin-bottom: 16px;
        }
        .cp-ai-result-label {
          font-size: 11px;
          color: #8b5cf6;
          letter-spacing: 1.5px;
          margin: 0 0 8px;
        }
        .cp-ai-result-text {
          font-size: 14px;
          color: rgba(255,255,255,0.85);
          line-height: 1.65;
          margin: 0;
          white-space: pre-wrap;
        }
        .cp-submit-btn {
          width: 100%;
          padding: 16px;
          background: linear-gradient(135deg, #c9a84c, #e8c96a);
          color: #050816;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 800;
          cursor: pointer;
          font-family: inherit;
          transition: opacity 0.15s, transform 0.1s;
          letter-spacing: 0.3px;
          margin-bottom: 16px;
        }
        .cp-submit-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .cp-submit-btn:not(:disabled):hover {
          opacity: 0.9;
        }
        .cp-submit-btn:not(:disabled):active {
          transform: scale(0.98);
        }
        .cp-error {
          padding: 12px 14px;
          border-radius: 10px;
          border: 1px solid rgba(255,100,100,0.35);
          background: rgba(255,60,60,0.07);
          color: #ffa0a0;
          font-size: 13px;
          margin-bottom: 12px;
        }
        .cp-ai-error {
          padding: 10px 14px;
          border-radius: 8px;
          background: rgba(255,100,50,0.07);
          border: 1px solid rgba(255,100,50,0.25);
          color: rgba(255,160,120,0.9);
          font-size: 13px;
          margin-bottom: 12px;
        }
        .cp-skip-link {
          text-align: center;
          margin-top: 8px;
        }
        .cp-skip-link button {
          background: none;
          border: none;
          color: rgba(180,200,255,0.4);
          font-size: 13px;
          cursor: pointer;
          font-family: inherit;
          text-decoration: underline;
          padding: 0;
        }
        .cp-skip-link button:hover {
          color: rgba(180,200,255,0.7);
        }
      `}</style>

      <div className="cp-wrap">
        <div className="cp-grid" />

        {/* Sticky header */}
        <div className="cp-header">
          <button
            type="button"
            className="cp-back-btn"
            onClick={() => window.history.length > 1 ? window.history.back() : (window.location.href = '/community')}
          >
            ← 戻る
          </button>
          <h1 className="cp-header-title">理想の住まいを教えてください</h1>
        </div>

        <div className="cp-inner">

          {/* 希望種別 */}
          <div className="cp-card">
            <p className="cp-section-title">希望種別</p>
            <div className="cp-radio-group">
              {PROPERTY_TYPES.map(type => (
                <div
                  key={type}
                  className={`cp-radio${propertyType === type ? ' active' : ''}`}
                  onClick={() => setPropertyType(type)}
                  role="radio"
                  aria-checked={propertyType === type}
                >
                  {type}
                </div>
              ))}
            </div>
          </div>

          {/* エリア */}
          <div className="cp-card">
            <p className="cp-section-title">希望エリア</p>
            <input
              className="cp-area-input"
              type="text"
              placeholder="例：東京都渋谷区・新宿区"
              value={areaInput}
              onChange={e => setAreaInput(e.target.value)}
              style={{ fontSize: 16 }}
            />
            <p style={{ fontSize: 12, color: 'rgba(180,200,255,0.4)', margin: '0 0 8px' }}>人気エリア</p>
            <div className="cp-chip-group">
              {POPULAR_AREAS.map(area => (
                <button
                  key={area}
                  type="button"
                  className="cp-quick-chip"
                  onClick={() => addArea(area)}
                >
                  {area}
                </button>
              ))}
            </div>
          </div>

          {/* 予算 */}
          <div className="cp-card">
            <p className="cp-section-title">予算</p>
            <div className="cp-budget-row">
              <input
                className="cp-budget-input"
                type="number"
                inputMode="numeric"
                placeholder="最低"
                value={minBudget}
                onChange={e => setMinBudget(e.target.value)}
                style={{ fontSize: 16 }}
              />
              <span className="cp-budget-label">万円</span>
              <span className="cp-budget-label">〜</span>
              <input
                className="cp-budget-input"
                type="number"
                inputMode="numeric"
                placeholder="最高"
                value={maxBudget}
                onChange={e => setMaxBudget(e.target.value)}
                style={{ fontSize: 16 }}
              />
              <span className="cp-budget-label">万円</span>
            </div>
          </div>

          {/* 間取り */}
          <div className="cp-card">
            <p className="cp-section-title">間取り（複数可）</p>
            <div className="cp-chip-group">
              {LAYOUTS.map(layout => (
                <div
                  key={layout}
                  className={`cp-chip${selectedLayouts.includes(layout) ? ' active' : ''}`}
                  onClick={() => toggleLayout(layout)}
                  role="checkbox"
                  aria-checked={selectedLayouts.includes(layout)}
                >
                  {layout}
                </div>
              ))}
            </div>
          </div>

          {/* 重視ポイント */}
          <div className="cp-card">
            <p className="cp-section-title">重視ポイント（複数可）</p>
            <div className="cp-chip-group">
              {TAGS.map(tag => (
                <div
                  key={tag}
                  className={`cp-chip${selectedTags.includes(tag) ? ' active' : ''}`}
                  onClick={() => toggleTag(tag)}
                  role="checkbox"
                  aria-checked={selectedTags.includes(tag)}
                >
                  {tag}
                </div>
              ))}
            </div>
          </div>

          {/* 自由入力 */}
          <div className="cp-card">
            <p className="cp-section-title">詳細・こだわり条件</p>
            <textarea
              className="cp-textarea"
              placeholder="例: ペット可で駅から徒歩5分以内、静かな環境を希望します。できれば築10年以内で..."
              value={freeText}
              onChange={e => setFreeText(e.target.value)}
              rows={4}
            />
          </div>

          {/* AIで整理 */}
          <div className="cp-card">
            <p className="cp-section-title">AIサマリー</p>
            <p style={{ fontSize: 13, color: 'rgba(180,200,255,0.5)', margin: '0 0 14px', lineHeight: 1.5 }}>
              入力内容をAIが業者向けに整理します。投稿前に確認できます。
            </p>

            <button
              type="button"
              className="cp-ai-btn"
              onClick={handleGenerateSummary}
              disabled={aiLoading}
            >
              {aiLoading ? 'AIが整理中...' : 'AIで整理する ✦'}
            </button>

            {aiError ? (
              <div className="cp-ai-error">{aiError}</div>
            ) : null}

            {aiSummary ? (
              <div className="cp-ai-result">
                <p className="cp-ai-result-label">AI整理結果</p>
                <p className="cp-ai-result-text">{aiSummary}</p>
              </div>
            ) : null}

            {submitError ? (
              <div className="cp-error">{submitError}</div>
            ) : null}

            {aiSummary ? (
              <button
                type="button"
                className="cp-submit-btn"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? '送信中...' : 'この内容で投稿する'}
              </button>
            ) : null}

            {!aiSummary ? (
              <div className="cp-skip-link">
                <button type="button" onClick={handleSubmit} disabled={submitting}>
                  {submitting ? '送信中...' : 'AIを使わずにそのまま投稿する'}
                </button>
              </div>
            ) : null}
          </div>

          <div style={{ height: 32 }} />
        </div>
      </div>
    </>
  )
}
