import { useState, useEffect, useRef } from 'react'
import { X, HelpCircle, LogIn, UserPlus, Briefcase } from 'lucide-react'

export default function LoginHelpModal({ onClose }) {
  const [phase, setPhase] = useState('entering') // 'entering' | 'visible' | 'closing'
  const mobile = window.innerWidth < 640

  const triggerCloseRef = useRef(null)
  triggerCloseRef.current = () => {
    if (phase === 'closing') return
    setPhase('closing')
    setTimeout(() => onClose(), 480)
  }

  useEffect(() => {
    const raf = requestAnimationFrame(() => setPhase('visible'))
    return () => cancelAnimationFrame(raf)
  }, [])

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') triggerCloseRef.current() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  const overlayOpacity  = phase === 'visible' ? 1 : 0
  const overlayTrans    = phase === 'closing'
    ? 'opacity 480ms ease'
    : 'opacity 240ms cubic-bezier(0.22,1,0.36,1)'

  const cardOpacity   = phase === 'visible' ? 1 : 0
  const cardTransform = phase === 'closing'
    ? 'translateY(200px) scale(0.86) rotate(20deg)'
    : (phase === 'entering' ? 'translateY(18px) scale(0.98)' : 'translateY(0) scale(1)')
  const cardTrans     = phase === 'closing'
    ? 'opacity 480ms cubic-bezier(0.4,0,1,1), transform 480ms cubic-bezier(0.4,0,1,1)'
    : 'opacity 240ms cubic-bezier(0.22,1,0.36,1), transform 240ms cubic-bezier(0.22,1,0.36,1)'

  return (
    <div
      onClick={() => triggerCloseRef.current()}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,.6)',
        zIndex: 1000,
        display: 'flex',
        alignItems: mobile ? 'flex-end' : 'center',
        justifyContent: 'center',
        padding: mobile ? 0 : 20,
        opacity: overlayOpacity,
        transition: overlayTrans,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: mobile ? '92vw' : 520,
          maxHeight: mobile ? '82vh' : '80vh',
          overflowY: 'auto',
          background: 'rgba(15,23,42,.98)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,.08)',
          borderRadius: mobile ? '16px 16px 0 0' : 16,
          boxShadow: '0 20px 60px rgba(0,0,0,.6)',
          padding: 28,
          paddingBottom: mobile ? 'calc(28px + env(safe-area-inset-bottom, 0px))' : 28,
          position: 'relative',
          opacity: cardOpacity,
          transform: cardTransform,
          transition: cardTrans,
          boxSizing: 'border-box',
        }}
      >
        <div
          onClick={() => triggerCloseRef.current()}
          style={{ position: 'absolute', top: 16, right: 16, cursor: 'pointer', color: '#94A3B8', display: 'flex', alignItems: 'center' }}
        >
          <X size={20} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <HelpCircle size={20} color="#c9a84c" />
          <div style={{ fontSize: 17, fontWeight: 500, color: '#fff' }}>はじめての方へ</div>
        </div>
        <div style={{ fontSize: 12, color: '#64748B', marginBottom: 28, lineHeight: 1.6 }}>
          ログイン方法とWorkspaceの基本的な使い方をご案内します。
        </div>

        <HelpSection title="ログイン方法" Icon={LogIn}>
          <StepList steps={[
            '登録したメールアドレスを入力',
            'パスワードを入力',
            'ログインをクリック',
          ]} />
          <HelpNote>パスワードを忘れた場合は、ログインフォーム内の「パスワードをお忘れですか？」から再設定できます。</HelpNote>
          <HelpNote>Googleアカウントをお持ちの方は「Googleでログイン」からワンタップでログインできます。</HelpNote>
        </HelpSection>

        <HelpDivider />

        <HelpSection title="新規登録方法" Icon={UserPlus}>
          <StepList steps={[
            '「新規登録（会社アカウント作成）」をクリック',
            'メールアドレス・パスワードを入力',
            '利用規約・プライバシーポリシーに同意して「登録」',
          ]} />
          <HelpNote>Googleログインも利用できます。</HelpNote>
          <div style={{ marginTop: 10, fontSize: 12, color: '#94A3B8', lineHeight: 1.7, padding: '10px 12px', background: 'rgba(255,255,255,.04)', borderRadius: 8, borderLeft: '2px solid rgba(201,168,76,.4)' }}>
            <span style={{ color: '#c9a84c', fontWeight: 500 }}>招待された方へ：</span>
            メールのリンクには有効期限があります。切れていたら、送り主にもう一度送ってもらってください。
          </div>
        </HelpSection>

        <HelpDivider />

        <HelpSection title="Workspaceでできること" Icon={Briefcase}>
          {[
            '案件を作成する',
            '顧客・関係者を招待する',
            'チャットでやり取りする',
            '写真や契約書などの資料を共有する',
            '進捗ロードマップで状況を確認する',
            'AI秘書に使い方や案件相談をする',
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
              <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#c9a84c', marginTop: 7, flexShrink: 0 }} />
              <div style={{ fontSize: 13, color: '#CBD5E1', lineHeight: 1.6 }}>{item}</div>
            </div>
          ))}
        </HelpSection>
      </div>
    </div>
  )
}

function HelpSection({ title, Icon, children }) {
  return (
    <div style={{ marginBottom: 4 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
        <Icon size={14} color="#c9a84c" />
        <div style={{ fontSize: 13, fontWeight: 500, color: '#E2E8F0' }}>{title}</div>
      </div>
      {children}
    </div>
  )
}

function StepList({ steps }) {
  return (
    <div style={{ marginBottom: 10 }}>
      {steps.map((s, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
          <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(201,168,76,.15)', border: '1px solid rgba(201,168,76,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: 11, color: '#c9a84c', fontWeight: 500 }}>{i + 1}</span>
          </div>
          <div style={{ fontSize: 13, color: '#CBD5E1', lineHeight: 1.6, paddingTop: 2 }}>{s}</div>
        </div>
      ))}
    </div>
  )
}

function HelpNote({ children }) {
  return (
    <div style={{ fontSize: 12, color: '#64748B', lineHeight: 1.7, padding: '8px 10px', background: 'rgba(255,255,255,.03)', borderRadius: 6, marginBottom: 4 }}>
      {children}
    </div>
  )
}

function HelpDivider() {
  return <div style={{ borderTop: '1px solid rgba(255,255,255,.06)', margin: '20px 0' }} />
}
