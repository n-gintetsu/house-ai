import { useEffect, useState } from 'react'

const C = {
  navy: '#1a3a5c',
  navyDark: '#0f2540',
  navyMid: '#244d76',
  gold: '#c9a84c',
  goldLight: '#f0d88a',
  bg: '#F4F7FB',
  card: '#ffffff',
  title: '#102A43',
  desc: '#5C677D',
  border: '#E2E8F0',
}

const GLOBAL_CSS = `
@keyframes plpFadeUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes plpPulse {
  0%,100% { box-shadow: 0 0 0 0 rgba(201,168,76,0.45); }
  50%      { box-shadow: 0 0 0 10px rgba(201,168,76,0); }
}
.plp-fade   { animation: plpFadeUp 0.6s ease both; }
.plp-fade-1 { animation-delay: 0.05s; }
.plp-fade-2 { animation-delay: 0.12s; }
.plp-fade-3 { animation-delay: 0.19s; }
.plp-fade-4 { animation-delay: 0.26s; }
.plp-fade-5 { animation-delay: 0.33s; }
.plp-cta-btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  background: linear-gradient(135deg, #c9a84c 0%, #f0d88a 50%, #c9a84c 100%);
  background-size: 200%;
  color: #0f2540;
  border: none; border-radius: 999px;
  font-weight: 900; font-size: 17px;
  cursor: pointer; text-decoration: none;
  transition: background-position 0.4s ease, transform 0.15s ease, box-shadow 0.15s ease;
  animation: plpPulse 2.2s ease-in-out infinite;
}
.plp-cta-btn:hover {
  background-position: right;
  transform: translateY(-2px);
  box-shadow: 0 8px 28px rgba(201,168,76,0.55);
}
.plp-cta-btn:active { transform: translateY(0); }
.plp-feature-card {
  background: #fff;
  border: 1.5px solid #E2E8F0;
  border-radius: 18px;
  padding: 24px 20px;
  transition: box-shadow 0.2s, transform 0.2s;
}
.plp-feature-card:hover {
  box-shadow: 0 8px 32px rgba(26,58,92,0.10);
  transform: translateY(-3px);
}
.plp-review-card {
  background: #fff;
  border: 1px solid #E2E8F0;
  border-radius: 18px;
  padding: 22px 20px;
}
`

function CtaButton({ label = '無料でパートナー登録する', size = 'lg', block = false }) {
  const pad = size === 'lg' ? '18px 36px' : '13px 28px'
  const fs  = size === 'lg' ? 17 : 14
  return (
    <a
      href="/partner?mode=register"
      className="plp-cta-btn"
      style={{ padding: pad, fontSize: fs, width: block ? '100%' : undefined }}
    >
      <span>🚀</span>
      {label}
    </a>
  )
}

function Section({ children, style, id }) {
  return (
    <section id={id} style={{ padding: '64px 20px', maxWidth: 680, margin: '0 auto', ...style }}>
      {children}
    </section>
  )
}

function Badge({ children }) {
  return (
    <span style={{
      display: 'inline-block',
      background: `${C.gold}22`, color: '#8B6914',
      border: `1px solid ${C.gold}55`,
      borderRadius: 999, padding: '4px 14px',
      fontSize: 12, fontWeight: 800, letterSpacing: 0.5,
      marginBottom: 14,
    }}>
      {children}
    </span>
  )
}

function Divider() {
  return <div style={{ borderTop: `1px solid ${C.border}`, maxWidth: 680, margin: '0 auto' }} />
}

export default function PartnerLP() {
  const [scrolled, setScrolled] = useState(false)

  /* CSS 注入 */
  useEffect(() => {
    const el = document.createElement('style')
    el.textContent = GLOBAL_CSS
    document.head.appendChild(el)
    document.title = 'パートナー登録 | House-AI'
    return () => document.head.removeChild(el)
  }, [])

  /* 固定CTAの表示制御 */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 300)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const stats = [
    { num: '1,200+', label: '登録パートナー企業' },
    { num: '月3,000+', label: 'AI案件マッチング数' },
    { num: '4.8', label: '平均満足度評価' },
  ]


  return (
    <div style={{ fontFamily: "'Noto Sans JP', 'Hiragino Sans', sans-serif", background: C.bg, minHeight: '100vh' }}>

      {/* ━━━ 固定ヘッダー ━━━ */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        background: `${C.navyDark}F2`, backdropFilter: 'blur(10px)',
        borderBottom: `1px solid rgba(255,255,255,0.1)`,
        padding: '12px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <a href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: `linear-gradient(135deg, ${C.gold} 0%, ${C.goldLight} 100%)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, fontWeight: 900, color: C.navyDark,
          }}>H</div>
          <span style={{ color: '#fff', fontWeight: 800, fontSize: 14 }}>House-AI</span>
        </a>
        <a
          href="/partner?mode=register"
          style={{
            background: `linear-gradient(135deg, ${C.gold} 0%, ${C.goldLight} 100%)`,
            color: C.navyDark, border: 'none', borderRadius: 999,
            padding: '8px 20px', fontSize: 13, fontWeight: 800,
            textDecoration: 'none', whiteSpace: 'nowrap',
          }}
        >
          無料で登録
        </a>
      </div>

      {/* ━━━ 1. ヒーロー ━━━ */}
      <div style={{
        background: `linear-gradient(160deg, ${C.navyDark} 0%, ${C.navyMid} 60%, ${C.navy} 100%)`,
        paddingTop: 100,
        paddingBottom: 72,
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* 背景装飾 */}
        <div style={{
          position: 'absolute', top: -60, right: -60, width: 300, height: 300,
          borderRadius: '50%', background: `${C.gold}12`,
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: -80, left: -80, width: 360, height: 360,
          borderRadius: '50%', background: `${C.navy}50`,
          pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: 600, margin: '0 auto', padding: '0 20px', position: 'relative' }}>
          <p className="plp-fade plp-fade-1" style={{
            margin: '0 0 16px', fontSize: 11, fontWeight: 800, color: C.gold,
            letterSpacing: 3, textTransform: 'uppercase',
          }}>
            PARTNER PROGRAM
          </p>
          <h1 className="plp-fade plp-fade-2" style={{
            margin: '0 0 16px', color: '#fff', fontSize: 'clamp(26px, 6vw, 40px)',
            fontWeight: 900, lineHeight: 1.25,
          }}>
            GINTETSU不動産 パートナープログラム
          </h1>
          <p className="plp-fade plp-fade-3" style={{
            margin: '0 0 28px', fontSize: 15, color: 'rgba(255,255,255,0.85)', lineHeight: 1.8,
          }}>
            GINTETSU不動産ではお客様のお悩みを一緒に解決・パートナーとして最高のサービス提供できるパートナー企業様を募集しています。
          </p>
          <div className="plp-fade plp-fade-3" style={{ marginBottom: 28 }}>
            <p style={{ margin: '0 0 10px', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.6)', letterSpacing: 1 }}>現在募集している企業様</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
              {['リフォーム','外構工事','解体','司法書士','行政書士','税理士','不用品回収','遺品整理','保険','金融','清掃','害虫駆除','空き家管理'].map(tag => (
                <span key={tag} style={{
                  display: 'inline-block',
                  border: `1px solid ${C.gold}99`,
                  background: `${C.gold}22`,
                  color: C.goldLight,
                  borderRadius: 999,
                  padding: '4px 14px',
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: 0.3,
                }}>{tag}</span>
              ))}
            </div>
          </div>
          <div className="plp-fade plp-fade-4" style={{ marginBottom: 16 }}>
            <CtaButton />
          </div>
          <p className="plp-fade plp-fade-5" style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>
            クレジットカード不要・審査なし・すぐ始められる
          </p>
        </div>
      </div>

      {/* ━━━ 2. 実績数字 ━━━ */}
      <div style={{ background: C.card, borderBottom: `1px solid ${C.border}` }}>
        <div style={{
          maxWidth: 680, margin: '0 auto', padding: '40px 20px',
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8,
          textAlign: 'center',
        }}>
          {stats.map((s, i) => (
            <div key={i} className={`plp-fade plp-fade-${i + 2}`}>
              <p style={{ margin: '0 0 4px', fontSize: 'clamp(22px, 5vw, 32px)', fontWeight: 900, color: C.navy }}>{s.num}</p>
              <p style={{ margin: 0, fontSize: 11, color: C.desc, fontWeight: 600 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ━━━ 5. 底部CTA ━━━ */}
      <div style={{
        background: `linear-gradient(160deg, ${C.navyDark} 0%, ${C.navy} 100%)`,
        padding: '72px 20px',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: 520, margin: '0 auto' }}>
          <p className="plp-fade plp-fade-1" style={{
            margin: '0 0 12px', fontSize: 11, fontWeight: 800, color: C.gold, letterSpacing: 3, textTransform: 'uppercase',
          }}>
            今すぐ始めよう
          </p>
          <h2 className="plp-fade plp-fade-2" style={{
            margin: '0 0 10px', color: '#fff', fontSize: 'clamp(22px, 4.5vw, 30px)', fontWeight: 900, lineHeight: 1.3,
          }}>
            AIと一緒に、次の案件を<br />獲得しよう
          </h2>
          <p className="plp-fade plp-fade-3" style={{ margin: '0 0 36px', color: 'rgba(255,255,255,0.65)', fontSize: 14 }}>
            登録費用も月額費用も、一切かかりません
          </p>
          <div className="plp-fade plp-fade-4" style={{ marginBottom: 14 }}>
            <CtaButton label="無料パートナー登録" />
          </div>
          <p className="plp-fade plp-fade-5" style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>
            クレジットカード不要・1分で完了
          </p>
        </div>
      </div>

      {/* ━━━ フッター ━━━ */}
      <div style={{
        background: C.navyDark, borderTop: '1px solid rgba(255,255,255,0.08)',
        padding: '24px 20px', textAlign: 'center',
      }}>
        <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>
          © 2025 House-AI. All rights reserved.
          {' '}
          <a href="/" style={{ color: 'rgba(255,255,255,0.45)', textDecoration: 'none' }}>トップへ戻る</a>
        </p>
      </div>

      {/* ━━━ 固定底部CTA（スクロール後表示） ━━━ */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 999,
        background: `${C.navyDark}F5`, backdropFilter: 'blur(8px)',
        borderTop: `1px solid rgba(255,255,255,0.1)`,
        padding: '12px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14,
        transform: scrolled ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 0.35s ease',
      }}>
        <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.7)', whiteSpace: 'nowrap' }}>
          登録費用・月額 無料
        </p>
        <CtaButton label="無料で登録する" size="sm" />
      </div>
    </div>
  )
}
