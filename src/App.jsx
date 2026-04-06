import { useEffect, useMemo, useRef, useState } from 'react'

const DEFAULT_SYSTEM_PROMPT =
  'あなたは「不動産AIコンシェルジュ」です。ユーザーの希望（エリア、予算、間取り、通勤時間、家賃/購入、希望条件、優先順位、物件種別）を丁寧に整理し、次に取るべき行動（内見で確認するポイント、比較観点、ローン/税金/諸費用の一般的注意、情報収集の手順）を具体的に提案してください。ユーザーの情報が不足している場合は、短い質問を1〜3個だけしてから提案を進めてください。'

async function callClaudeApi({
  model,
  system,
  messages,
  temperature = 0.4,
  maxTokens = 900,
}) {
  const res = await fetch('/api/claude', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      model,
      system,
      messages,
      temperature,
      max_tokens: maxTokens,
    }),
  })

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    const detail =
      data?.error != null ? String(data.error) : ''
    throw new Error(
      `Claude API request failed (${res.status}).${detail ? ` ${detail}` : ''}`,
    )
  }

  return typeof data?.text === 'string' ? data.text : ''
}

function App() {
  const model = useMemo(
    () => import.meta.env.VITE_CLAUDE_MODEL || 'claude-sonnet-4-5',
    [],
  )

  const [chat, setChat] = useState(() => [
    {
      role: 'assistant',
      text:
        'こんにちは。不動産のご相談から内見のコツまで一緒に整理します。まずは「エリア」「予算」「入居/購入の希望時期」を教えてください。',
    },
  ])
  const [input, setInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const endRef = useRef(null)
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chat, isSending])

  const toAnthropicMessages = (nextChat) => {
    // APIの入力は通常「userから始まる会話」を想定するため、
    // 初期のアシスタント挨拶など（userより前の履歴）を除外します。
    const valid = nextChat.filter((m) => m.role === 'user' || m.role === 'assistant')
    const firstUserIndex = valid.findIndex((m) => m.role === 'user')
    const trimmed = firstUserIndex === -1 ? [] : valid.slice(firstUserIndex)

    return trimmed.map((m) => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: [{ type: 'text', text: m.text }],
    }))
  }

  async function handleSend() {
    const text = input.trim()
    if (!text || isSending) return

    setErrorMessage('')
    setIsSending(true)

    const nextChat = [...chat, { role: 'user', text }]
    setChat(nextChat)
    setInput('')

    try {
      const assistantText = await callClaudeApi({
        model,
        system: DEFAULT_SYSTEM_PROMPT,
        messages: toAnthropicMessages(nextChat),
      })

      setChat((prev) => [...prev, { role: 'assistant', text: assistantText }])
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      setErrorMessage(message)
      setChat((prev) => [
        ...prev,
        {
          role: 'assistant',
          text:
            'すみません、Claudeへの接続に失敗しました。エラー内容を確認して再度お試しください。',
        },
      ])
    } finally {
      setIsSending(false)
    }
  }

  function handleReset() {
    if (isSending) return
    setErrorMessage('')
    setInput('')
    setChat([
      {
        role: 'assistant',
        text:
          'こんにちは。不動産のご相談から内見のコツまで一緒に整理します。まずは「エリア」「予算」「入居/購入の希望時期」を教えてください。',
      },
    ])
  }

  return (
    <>
      <style>{`
        :root {
          --gold: #d4af37;
          --gold-2: #f5c542;
          --bg: #07070a;
          --panel: rgba(255, 255, 255, 0.04);
          --panel-2: rgba(255, 255, 255, 0.06);
          --border: rgba(212, 175, 55, 0.25);
          --border-2: rgba(212, 175, 55, 0.14);
          --text: rgba(255, 255, 255, 0.88);
          --muted: rgba(255, 255, 255, 0.62);
          --shadow: 0 10px 30px rgba(0, 0, 0, 0.45);
        }

        #root {
          background: var(--bg);
          border-inline: none;
          text-align: left;
          align-items: stretch;
        }

        .house-ai-shell {
          width: 100%;
          max-width: 1040px;
          margin: 0 auto;
          min-height: 100svh;
          display: flex;
          flex-direction: column;
          color: var(--text);
        }

        .topbar {
          padding: 18px 18px 12px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 260px;
        }

        .logoMark {
          width: 38px;
          height: 38px;
          border-radius: 12px;
          background: radial-gradient(circle at 30% 30%, rgba(245, 197, 66, 0.35), transparent 55%),
            linear-gradient(180deg, rgba(212, 175, 55, 0.35), rgba(212, 175, 55, 0.12));
          border: 1px solid var(--border);
          box-shadow: var(--shadow);
          display: grid;
          place-items: center;
          color: var(--gold-2);
          font-weight: 800;
          letter-spacing: -0.5px;
          font-family: var(--sans, system-ui);
        }

        .brandTitle {
          display: flex;
          flex-direction: column;
          line-height: 1.1;
        }

        .brandTitle strong {
          font-size: 15px;
          color: rgba(255, 255, 255, 0.92);
          font-weight: 750;
        }

        .brandTitle span {
          font-size: 12px;
          color: var(--muted);
        }

        .topbarActions {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .pill {
          padding: 8px 10px;
          border-radius: 999px;
          border: 1px solid var(--border-2);
          background: rgba(255, 255, 255, 0.02);
          color: var(--muted);
          font-size: 12px;
          max-width: 340px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .btn {
          appearance: none;
          border: 1px solid var(--border);
          background: rgba(212, 175, 55, 0.08);
          color: var(--gold-2);
          padding: 9px 12px;
          border-radius: 10px;
          font-weight: 700;
          cursor: pointer;
          transition: transform 0.08s ease, background 0.2s ease;
        }

        .btn:hover {
          background: rgba(212, 175, 55, 0.14);
        }
        .btn:active {
          transform: translateY(1px);
        }
        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .panel {
          margin: 0 18px 18px;
          border: 1px solid var(--border-2);
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.015));
          border-radius: 18px;
          box-shadow: var(--shadow);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          min-height: 520px;
          flex: 1;
        }

        .messages {
          padding: 16px 14px 10px;
          overflow: auto;
          flex: 1;
          scrollbar-width: thin;
          scrollbar-color: rgba(212, 175, 55, 0.35) transparent;
        }

        .msgRow {
          display: flex;
          margin: 10px 0;
        }

        .msgRow.assistant {
          justify-content: flex-start;
        }
        .msgRow.user {
          justify-content: flex-end;
        }

        .bubble {
          max-width: 760px;
          border-radius: 16px;
          padding: 12px 13px;
          border: 1px solid var(--border-2);
          background: rgba(255, 255, 255, 0.02);
        }

        .msgRow.assistant .bubble {
          border-color: rgba(212, 175, 55, 0.28);
          background: rgba(212, 175, 55, 0.06);
        }

        .msgRow.user .bubble {
          background: rgba(255, 255, 255, 0.035);
          border-color: rgba(212, 175, 55, 0.18);
        }

        .bubbleMeta {
          font-size: 12px;
          color: var(--muted);
          margin-bottom: 6px;
        }

        .bubbleText {
          white-space: pre-wrap;
          word-break: break-word;
          line-height: 1.55;
          font-size: 14px;
        }

        .composer {
          padding: 12px 12px 12px;
          border-top: 1px solid var(--border-2);
          background: rgba(0, 0, 0, 0.12);
        }

        .composerInner {
          display: flex;
          gap: 10px;
          align-items: flex-end;
        }

        textarea {
          width: 100%;
          min-height: 46px;
          max-height: 160px;
          resize: none;
          padding: 12px 12px;
          border-radius: 14px;
          border: 1px solid var(--border-2);
          background: rgba(255, 255, 255, 0.02);
          color: var(--text);
          outline: none;
          font-size: 14px;
          line-height: 1.45;
          font-family: inherit;
        }

        textarea:focus {
          border-color: rgba(245, 197, 66, 0.55);
          box-shadow: 0 0 0 4px rgba(212, 175, 55, 0.12);
        }

        .composerActions {
          display: flex;
          flex-direction: column;
          gap: 8px;
          align-items: stretch;
          min-width: 124px;
        }

        .sendBtn {
          width: 100%;
        }

        .hintRow {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          margin-top: 10px;
          color: var(--muted);
          font-size: 12px;
        }

        .errorBox {
          margin: 10px 14px 0;
          border: 1px solid rgba(255, 80, 80, 0.4);
          background: rgba(255, 80, 80, 0.08);
          color: rgba(255, 210, 210, 0.95);
          padding: 10px 12px;
          border-radius: 14px;
          font-size: 13px;
        }

        .spinnerDot {
          display: inline-block;
          width: 7px;
          height: 7px;
          margin: 0 2px;
          border-radius: 50%;
          background: rgba(245, 197, 66, 0.9);
          animation: dotPulse 1.2s infinite ease-in-out;
        }
        .spinnerDot:nth-child(2) {
          animation-delay: 0.15s;
          opacity: 0.8;
        }
        .spinnerDot:nth-child(3) {
          animation-delay: 0.3s;
          opacity: 0.65;
        }
        @keyframes dotPulse {
          0%,
          80%,
          100% {
            transform: translateY(0);
            opacity: 0.55;
          }
          40% {
            transform: translateY(-3px);
            opacity: 1;
          }
        }

        @media (max-width: 720px) {
          .topbar {
            padding: 14px 14px 10px;
          }
          .panel {
            margin: 0 12px 12px;
            border-radius: 16px;
            min-height: 520px;
          }
          .messages {
            padding: 14px 10px 10px;
          }
          .bubbleText {
            font-size: 13.5px;
          }
          .composerActions {
            min-width: 110px;
          }
          .pill {
            display: none;
          }
        }
      `}</style>

      <div className="house-ai-shell">
        <div className="topbar">
          <div className="brand" aria-label="不動産AIコンシェルジュ">
            <div className="logoMark" aria-hidden="true">
              H
            </div>
            <div className="brandTitle">
              <strong>不動産AIコンシェルジュ</strong>
              <span>Claudeに相談して、条件整理から提案まで</span>
            </div>
          </div>

          <div className="topbarActions">
            <div className="pill" title="モデル（サーバー経由でClaudeを呼び出します）">
              Claude: {model}
            </div>
            <button className="btn" onClick={handleReset} disabled={isSending}>
              新規チャット
            </button>
          </div>
        </div>

        <div className="panel">
          <div className="messages" role="log" aria-live="polite">
            {chat.map((m, idx) => (
              <div
                key={`${m.role}-${idx}`}
                className={`msgRow ${m.role === 'user' ? 'user' : 'assistant'}`}
              >
                <div className="bubble">
                  <div className="bubbleMeta">
                    {m.role === 'user' ? 'あなた' : 'コンシェルジュ'}
                  </div>
                  <div className="bubbleText">{m.text}</div>
                </div>
              </div>
            ))}
            {isSending ? (
              <div className="msgRow assistant">
                <div className="bubble">
                  <div className="bubbleMeta">コンシェルジュ</div>
                  <div className="bubbleText">
                    返信を生成中
                    <span aria-hidden="true" style={{ marginLeft: 8 }}>
                      <span className="spinnerDot" />
                      <span className="spinnerDot" />
                      <span className="spinnerDot" />
                    </span>
                  </div>
                </div>
              </div>
            ) : null}
            <div ref={endRef} />
          </div>

          {errorMessage ? <div className="errorBox">{errorMessage}</div> : null}

          <form
            className="composer"
            onSubmit={(e) => {
              e.preventDefault()
              handleSend()
            }}
          >
            <div className="composerInner">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="エリア、予算、希望条件、通勤時間などを入力してください（Enterで送信 / Shift+Enter改行）"
                disabled={isSending}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSend()
                  }
                }}
              />
              <div className="composerActions">
                <button className="btn sendBtn" type="submit" disabled={isSending}>
                  送信
                </button>
                <button
                  className="btn"
                  type="button"
                  onClick={() =>
                    setInput(
                      '東京23区内で、30〜50㎡、家賃は月25万円以内。通勤は30分以内が理想です。',
                    )
                  }
                  disabled={isSending}
                  title="例文を入力"
                >
                  例文
                </button>
              </div>
            </div>
            <div className="hintRow">
              <span>内見時のチェック項目や比較軸も一緒に作れます。</span>
              <span>※APIキーはVercelの環境変数 ANTHROPIC_API_KEY でサーバー管理</span>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}

export default App
