import { useState, useEffect, useMemo } from 'react'

const LOG_STEPS = [
  { text: '提携業者へ通知中...', done: false },
  { text: 'AIが条件を整理中...', done: false },
  { text: '27社へ送信しました ✓', done: true },
]

function randomBetween(min, max) {
  return min + Math.random() * (max - min)
}

export default function CommunitySuccessPage() {
  const [visibleCount, setVisibleCount] = useState(0)

  const particles = useMemo(
    () =>
      Array.from({ length: 24 }, (_, i) => ({
        id: i,
        x: randomBetween(5, 95),
        y: randomBetween(5, 95),
        size: randomBetween(1, 2.5),
        opacity: randomBetween(0.15, 0.45),
        duration: randomBetween(4, 9),
        delay: randomBetween(0, 4),
      })),
    []
  )

  useEffect(() => {
    if (visibleCount >= LOG_STEPS.length) return
    const delay = visibleCount === 0 ? 600 : 1200
    const t = setTimeout(() => setVisibleCount(v => v + 1), delay)
    return () => clearTimeout(t)
  }, [visibleCount])

  return (
    <>
      <style>{`
        @keyframes csFloat {
          0%, 100% { transform: translateY(0); opacity: var(--op); }
          50% { transform: translateY(-8px); opacity: calc(var(--op) * 0.5); }
        }
        @keyframes csLogIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes csPulseRing {
          0%, 100% { box-shadow: 0 0 0 0 rgba(201,168,76,0.25); }
          50% { box-shadow: 0 0 0 16px rgba(201,168,76,0); }
        }
        @keyframes csCheck {
          from { stroke-dashoffset: 40; }
          to { stroke-dashoffset: 0; }
        }
        .cs-wrap {
          min-height: 100svh;
          background: #050816;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 32px 20px 60px;
          text-align: center;
          position: relative;
          overflow: hidden;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        .cs-grid {
          position: fixed;
          inset: 0;
          background-image:
            linear-gradient(rgba(100,140,255,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(100,140,255,0.04) 1px, transparent 1px);
          background-size: 48px 48px;
          pointer-events: none;
          z-index: 0;
        }
        .cs-content {
          position: relative;
          z-index: 1;
          max-width: 400px;
          width: 100%;
        }
        .cs-icon {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          border: 2px solid #c9a84c;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 28px;
          animation: csPulseRing 2.5s ease-in-out infinite;
        }
        .cs-check-path {
          stroke-dasharray: 40;
          stroke-dashoffset: 40;
          animation: csCheck 0.6s ease-out 0.4s forwards;
        }
        .cs-badge {
          display: inline-block;
          font-size: 11px;
          color: #c9a84c;
          border: 1px solid rgba(201,168,76,0.4);
          padding: 4px 14px;
          border-radius: 999px;
          letter-spacing: 2px;
          margin-bottom: 16px;
        }
        .cs-title {
          font-size: clamp(22px, 5vw, 28px);
          font-weight: 800;
          color: #fff;
          margin: 0 0 8px;
          line-height: 1.3;
        }
        .cs-subtitle {
          font-size: 13px;
          color: rgba(180,200,255,0.5);
          margin: 0 0 36px;
          line-height: 1.6;
        }
        .cs-logs {
          width: 100%;
          margin-bottom: 40px;
          text-align: left;
        }
        .cs-log {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 11px 14px;
          border-radius: 10px;
          margin-bottom: 8px;
          font-size: 13px;
          animation: csLogIn 0.4s ease both;
        }
        .cs-log.pending {
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(100,140,255,0.1);
          color: rgba(180,200,255,0.7);
        }
        .cs-log.done {
          background: rgba(201,168,76,0.06);
          border: 1px solid rgba(201,168,76,0.2);
          color: #c9a84c;
          font-weight: 600;
        }
        .cs-log-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: currentColor;
          flex-shrink: 0;
        }
        .cs-main-btn {
          display: block;
          width: 100%;
          padding: 15px;
          background: linear-gradient(135deg, #c9a84c, #e8c96a);
          color: #050816;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 800;
          cursor: pointer;
          font-family: inherit;
          margin-bottom: 14px;
          transition: opacity 0.15s, transform 0.1s;
          letter-spacing: 0.3px;
        }
        .cs-main-btn:hover {
          opacity: 0.9;
        }
        .cs-main-btn:active {
          transform: scale(0.98);
        }
        .cs-sub-link {
          display: block;
          text-align: center;
          color: rgba(180,200,255,0.4);
          font-size: 13px;
          background: none;
          border: none;
          cursor: pointer;
          font-family: inherit;
          padding: 0;
          text-decoration: underline;
        }
        .cs-sub-link:hover {
          color: rgba(180,200,255,0.7);
        }
      `}</style>

      <div className="cs-wrap">
        <div className="cs-grid" />

        {/* Particles */}
        {particles.map(p => (
          <div
            key={p.id}
            style={{
              position: 'fixed',
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
              borderRadius: '50%',
              background: '#c9a84c',
              '--op': p.opacity,
              opacity: p.opacity,
              animation: `csFloat ${p.duration}s ${p.delay}s ease-in-out infinite`,
              pointerEvents: 'none',
              zIndex: 0,
            }}
          />
        ))}

        <div className="cs-content">
          {/* Check icon */}
          <div className="cs-icon">
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <path
                className="cs-check-path"
                d="M10 18L15 23L26 13"
                stroke="#c9a84c"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div className="cs-badge">POSTED</div>
          <h1 className="cs-title">投稿が完了しました</h1>
          <p className="cs-subtitle">
            条件に合う業者からの提案をお待ちください。<br />
            通常24時間以内に提案が届きます。
          </p>

          {/* Log animation */}
          <div className="cs-logs">
            {LOG_STEPS.slice(0, visibleCount).map((step, i) => (
              <div
                key={i}
                className={`cs-log${step.done ? ' done' : ' pending'}`}
              >
                <span className="cs-log-dot" />
                {step.text}
              </div>
            ))}
          </div>

          {/* Buttons */}
          <button
            type="button"
            className="cs-main-btn"
            onClick={() => { window.location.href = '/community' }}
          >
            投稿一覧を見る
          </button>
          <button
            type="button"
            className="cs-sub-link"
            onClick={() => { window.location.href = '/' }}
          >
            トップに戻る
          </button>
        </div>
      </div>
    </>
  )
}
