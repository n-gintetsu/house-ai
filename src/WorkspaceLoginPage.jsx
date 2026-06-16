import { useState } from 'react'
import { supabase } from './supabaseClient'
import { Mail, Loader, Lock } from 'lucide-react'

export default function WorkspaceLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(null) // 'password' | 'otp' | 'google' | null
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async () => {
    const trimmed = (email || '').trim()
    if (!trimmed) { setError('メールアドレスを入力してください'); return }
    if (!password) { setError('パスワードを入力してください'); return }
    setLoading('password')
    setError('')
    try {
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email: trimmed,
        password,
      })
      if (signInErr) throw signInErr
      window.location.href = window.location.origin + '/workspace'
    } catch (e) {
      setError('ログインに失敗しました。' + (e.message || ''))
      setLoading(null)
    }
  }

  const handleOtp = async () => {
    const trimmed = (email || '').trim()
    if (!trimmed) { setError('メールアドレスを入力してください'); return }
    setLoading('otp')
    setError('')
    try {
      const { error: otpErr } = await supabase.auth.signInWithOtp({
        email: trimmed,
        options: {
          emailRedirectTo: window.location.origin + '/workspace',
        },
      })
      if (otpErr) throw otpErr
      setSent(true)
    } catch (e) {
      setError('送信に失敗しました。' + (e.message || ''))
    } finally {
      setLoading(null)
    }
  }

  const handleGoogle = async () => {
    setLoading('google')
    setError('')
    try {
      const { error: oauthErr } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/workspace',
        },
      })
      if (oauthErr) throw oauthErr
    } catch (e) {
      setError('Googleログインに失敗しました。' + (e.message || ''))
      setLoading(null)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0A0F1E 0%, #0F172A 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, fontFamily: "'Noto Sans JP', sans-serif", boxSizing: 'border-box' }}>
      <div style={{ width: '100%', maxWidth: 400 }}>

        {/* ロゴ */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <img src="/logo.png" alt="HOUSE-AI" style={{ height: 64, display: 'block', margin: '0 auto', objectFit: 'contain', filter: 'drop-shadow(0 0 14px rgba(201,168,76,0.7))' }} />
          <div style={{ fontSize: 10, color: '#475569', fontWeight: 400, marginTop: 8, letterSpacing: 3 }}>WORKSPACE</div>
        </div>

        {/* カード */}
        <div style={{ background: 'rgba(15,23,42,0.85)', border: '1px solid rgba(201,168,76,0.45)', boxShadow: '0 0 60px rgba(201,168,76,0.28)', borderRadius: 16, padding: 32 }}>
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
              <div style={{ fontSize: 10, color: '#c9a84c', fontWeight: 500, letterSpacing: 3, marginBottom: 6 }}>WORKSPACE LOGIN</div>
              <div style={{ fontSize: 15, color: '#E2E8F0', fontWeight: 500, marginBottom: 24 }}>Workspaceにログイン</div>

              {/* メール */}
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 400, marginBottom: 8 }}>メールアドレス</div>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="staff@example.com"
                  autoFocus
                  style={{ fontSize: 16, fontWeight: 400, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: '#E2E8F0', padding: '11px 14px', borderRadius: 8, width: '100%', boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit' }}
                />
              </div>

              {/* パスワード */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 400, marginBottom: 8 }}>パスワード</div>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleLogin() }}
                  placeholder="••••••••"
                  style={{ fontSize: 16, fontWeight: 400, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: '#E2E8F0', padding: '11px 14px', borderRadius: 8, width: '100%', boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit' }}
                />
              </div>

              {error ? <div style={{ fontSize: 12, color: '#F87171', fontWeight: 400, marginBottom: 12 }}>{error}</div> : null}

              {/* ログインボタン */}
              <button
                onClick={handleLogin}
                disabled={loading !== null}
                style={{ width: '100%', background: loading === 'password' ? 'rgba(201,168,76,0.5)' : '#c9a84c', color: '#0A0F1E', border: 'none', borderRadius: 8, padding: '11px', fontSize: 14, fontWeight: 500, cursor: loading !== null ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, boxSizing: 'border-box', marginBottom: 12 }}
              >
                {loading === 'password' ? <Loader size={14} /> : <Lock size={14} />}
                ログイン
              </button>

              {/* マジックリンク */}
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <button
                  onClick={handleOtp}
                  disabled={loading !== null}
                  style={{ background: 'none', border: 'none', color: '#64748B', fontSize: 12, fontWeight: 400, cursor: loading !== null ? 'not-allowed' : 'pointer', padding: 0, fontFamily: 'inherit', textDecoration: 'underline', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                >
                  {loading === 'otp' ? <Loader size={11} color="#64748B" /> : null}
                  パスワードなしでログインリンクを受け取る
                </button>
              </div>

              {/* OR 区切り */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
                <div style={{ fontSize: 11, color: '#475569', fontWeight: 400 }}>または</div>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
              </div>

              {/* Googleログイン */}
              <button
                onClick={handleGoogle}
                disabled={loading !== null}
                style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: '#E2E8F0', borderRadius: 8, padding: '11px', fontSize: 14, fontWeight: 400, cursor: loading !== null ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxSizing: 'border-box' }}
              >
                {loading === 'google' ? (
                  <Loader size={14} color="#94A3B8" />
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                )}
                Googleでログイン
              </button>
            </div>
          )}
        </div>

        <div style={{ fontSize: 11, color: '#64748B', fontWeight: 400, textAlign: 'center', marginTop: 24 }}>
          House-AI Workspace
        </div>
      </div>
    </div>
  )
}
