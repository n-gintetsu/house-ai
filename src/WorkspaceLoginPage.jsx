import { useState } from 'react'
import { supabase } from './supabaseClient'
import { Mail, Loader } from 'lucide-react'

export default function WorkspaceLoginPage() {
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSend = async () => {
    const trimmed = (email || '').trim()
    if (!trimmed) { setError('メールアドレスを入力してください'); return }
    setSending(true)
    setError('')
    try {
      const { error: otpErr } = await supabase.auth.signInWithOtp({
        email: trimmed,
        options: {
          emailRedirectTo: 'https://house-ai.co.jp/workspace',
        },
      })
      if (otpErr) throw otpErr
      setSent(true)
    } catch (e) {
      setError('送信に失敗しました。' + (e.message || ''))
    } finally {
      setSending(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0A0F1E 0%, #0F172A 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, fontFamily: "'Noto Sans JP', sans-serif", boxSizing: 'border-box' }}>
      <div style={{ width: '100%', maxWidth: 400 }}>

        {/* ロゴ */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <img src="/logo.png" alt="HOUSE-AI" style={{ height: 38, objectFit: 'contain', filter: 'drop-shadow(0 0 10px rgba(201,168,76,0.6))' }} />
          <div style={{ fontSize: 10, color: '#475569', fontWeight: 400, marginTop: 8, letterSpacing: 3 }}>WORKSPACE</div>
        </div>

        {/* カード */}
        <div style={{ background: 'rgba(15,23,42,0.85)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 0 40px rgba(201,168,76,0.12)', borderRadius: 16, padding: 32 }}>
          {sent ? (
            <div>
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
                  <Mail size={22} color="#c9a84c" />
                </div>
                <div style={{ fontSize: 14, color: '#E2E8F0', fontWeight: 500, marginBottom: 12 }}>メールを送信しました</div>
                <div style={{ fontSize: 12, color: '#94A3B8', fontWeight: 400, lineHeight: 1.8 }}>
                  <span style={{ color: '#c9a84c', fontWeight: 500 }}>{email}</span><br />
                  に送信したリンクを開いてログインしてください。
                </div>
              </div>
              <button
                onClick={() => { setSent(false); setEmail('') }}
                style={{ width: '100%', background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', color: '#64748B', borderRadius: 8, padding: '10px', fontSize: 13, fontWeight: 400, cursor: 'pointer', boxSizing: 'border-box' }}
              >別のアドレスで試す</button>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: 10, color: '#c9a84c', fontWeight: 500, letterSpacing: 3, marginBottom: 6 }}>STAFF LOGIN</div>
              <div style={{ fontSize: 15, color: '#E2E8F0', fontWeight: 500, marginBottom: 24 }}>スタッフログイン</div>

              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 400, marginBottom: 8 }}>メールアドレス</div>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleSend() }}
                  placeholder="staff@example.com"
                  autoFocus
                  style={{ fontSize: 16, fontWeight: 400, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: '#E2E8F0', padding: '11px 14px', borderRadius: 8, width: '100%', boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit' }}
                />
              </div>

              {error ? <div style={{ fontSize: 12, color: '#F87171', fontWeight: 400, marginBottom: 12 }}>{error}</div> : null}

              <button
                onClick={handleSend}
                style={{ width: '100%', background: sending ? 'rgba(201,168,76,0.5)' : '#c9a84c', color: '#0A0F1E', border: 'none', borderRadius: 8, padding: '11px', fontSize: 14, fontWeight: 500, cursor: sending ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, boxSizing: 'border-box' }}
              >
                {sending ? <Loader size={14} /> : <Mail size={14} />}
                ログインリンクを送る
              </button>
            </div>
          )}
        </div>

        <div style={{ fontSize: 11, color: '#1E293B', fontWeight: 400, textAlign: 'center', marginTop: 24 }}>
          House-AI Workspace はスタッフ専用です
        </div>
      </div>
    </div>
  )
}
