import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import { Mail, Loader, Lock, KeyRound, HelpCircle } from 'lucide-react'
import LoginHelpModal from './LoginHelpModal'

export default function WorkspaceLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(null) // 'password' | 'otp' | 'google' | 'forgot' | 'reset' | null
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [mode, setMode] = useState('login') // 'login' | 'forgot' | 'forgot_sent' | 'reset'
  const [newPassword, setNewPassword] = useState('')
  const [newPassword2, setNewPassword2] = useState('')
  const [showHelp, setShowHelp] = useState(false)
  const [helpHover, setHelpHover] = useState(false)

  useEffect(() => {
    if (window.location.hash.includes('type=recovery')) {
      setMode('reset')
    }
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setMode('reset')
    })
    return () => subscription.unsubscribe()
  }, [])

  // ── 既存ハンドラ（変更なし）────────────────────────────────
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

  // ── 新規ハンドラ ────────────────────────────────────────────
  const handleForgot = async () => {
    const trimmed = (email || '').trim()
    if (!trimmed) { setError('メールアドレスを入力してください'); return }
    setLoading('forgot')
    setError('')
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(trimmed, {
        redirectTo: window.location.origin + '/login',
      })
      if (error) throw error
      setMode('forgot_sent')
    } catch (e) {
      setError('送信に失敗しました。' + (e.message || ''))
    } finally {
      setLoading(null)
    }
  }

  const handleResetPassword = async () => {
    if (newPassword.length < 8) { setError('パスワードは8文字以上で入力してください'); return }
    if (newPassword !== newPassword2) { setError('パスワードが一致しません'); return }
    setLoading('reset')
    setError('')
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error
      window.location.href = window.location.origin + '/workspace'
    } catch (e) {
      setError('パスワードの設定に失敗しました。' + (e.message || ''))
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

          {mode === 'reset' ? (
            /* ── 新パスワード設定 ── */
            <div>
              <div style={{ fontSize: 10, color: '#c9a84c', fontWeight: 500, letterSpacing: 3, marginBottom: 6 }}>PASSWORD RESET</div>
              <div style={{ fontSize: 15, color: '#E2E8F0', fontWeight: 500, marginBottom: 24 }}>新しいパスワードを設定</div>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 400, marginBottom: 8 }}>新しいパスワード</div>
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="••••••••（8文字以上）"
                  autoFocus
                  style={{ fontSize: 16, fontWeight: 400, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: '#E2E8F0', padding: '11px 14px', borderRadius: 8, width: '100%', boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit' }}
                />
              </div>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 400, marginBottom: 8 }}>新しいパスワード（確認）</div>
                <input
                  type="password"
                  value={newPassword2}
                  onChange={e => setNewPassword2(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleResetPassword() }}
                  placeholder="••••••••"
                  style={{ fontSize: 16, fontWeight: 400, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: '#E2E8F0', padding: '11px 14px', borderRadius: 8, width: '100%', boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit' }}
                />
              </div>
              {error ? <div style={{ fontSize: 12, color: '#F87171', fontWeight: 400, marginBottom: 12 }}>{error}</div> : null}
              <button
                onClick={handleResetPassword}
                disabled={loading !== null}
                style={{ width: '100%', background: loading === 'reset' ? 'rgba(201,168,76,0.5)' : '#c9a84c', color: '#0A0F1E', border: 'none', borderRadius: 8, padding: '11px', fontSize: 14, fontWeight: 500, cursor: loading !== null ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, boxSizing: 'border-box' }}
              >
                {loading === 'reset' ? <Loader size={14} /> : <KeyRound size={14} />}
                パスワードを設定
              </button>
            </div>

          ) : mode === 'forgot' ? (
            /* ── 再設定リクエスト ── */
            <div>
              <div style={{ fontSize: 10, color: '#c9a84c', fontWeight: 500, letterSpacing: 3, marginBottom: 6 }}>PASSWORD RESET</div>
              <div style={{ fontSize: 15, color: '#E2E8F0', fontWeight: 500, marginBottom: 8 }}>パスワード再設定</div>
              <div style={{ fontSize: 12, color: '#94A3B8', fontWeight: 400, lineHeight: 1.8, marginBottom: 20 }}>登録済みのメールアドレスを入力してください。再設定リンクをお送りします。</div>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 400, marginBottom: 8 }}>メールアドレス</div>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleForgot() }}
                  placeholder="例：yamada@example.com"
                  autoFocus
                  style={{ fontSize: 16, fontWeight: 400, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: '#E2E8F0', padding: '11px 14px', borderRadius: 8, width: '100%', boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit' }}
                />
              </div>
              {error ? <div style={{ fontSize: 12, color: '#F87171', fontWeight: 400, marginBottom: 12 }}>{error}</div> : null}
              <button
                onClick={handleForgot}
                disabled={loading !== null}
                style={{ width: '100%', background: loading === 'forgot' ? 'rgba(201,168,76,0.5)' : '#c9a84c', color: '#0A0F1E', border: 'none', borderRadius: 8, padding: '11px', fontSize: 14, fontWeight: 500, cursor: loading !== null ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, boxSizing: 'border-box', marginBottom: 14 }}
              >
                {loading === 'forgot' ? <Loader size={14} /> : <Mail size={14} />}
                再設定リンクを送る
              </button>
              <div style={{ textAlign: 'center' }}>
                <button onClick={() => { setMode('login'); setError('') }} style={{ background: 'none', border: 'none', color: '#64748B', fontSize: 12, fontWeight: 400, cursor: 'pointer', padding: 0, fontFamily: 'inherit', textDecoration: 'underline' }}>
                  ログインに戻る
                </button>
              </div>
            </div>

          ) : mode === 'forgot_sent' ? (
            /* ── 再設定メール送信済み ── */
            <div>
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
                  <Mail size={22} color="#c9a84c" />
                </div>
                <div style={{ fontSize: 14, color: '#E2E8F0', fontWeight: 500, marginBottom: 12 }}>再設定メールを送信しました</div>
                <div style={{ fontSize: 12, color: '#94A3B8', fontWeight: 400, lineHeight: 1.8 }}>
                  <span style={{ color: '#c9a84c', fontWeight: 500 }}>{email}</span><br />
                  メールのリンクから新しいパスワードを設定してください。
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <button onClick={() => { setMode('login'); setError('') }} style={{ background: 'none', border: 'none', color: '#64748B', fontSize: 12, fontWeight: 400, cursor: 'pointer', padding: 0, fontFamily: 'inherit', textDecoration: 'underline' }}>
                  ログインに戻る
                </button>
              </div>
            </div>

          ) : sent ? (
            /* ── magic link 送信済み（既存）── */
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
            /* ── ログイン（既存）── */
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
                  placeholder="例：yamada@example.com"
                  autoFocus
                  style={{ fontSize: 16, fontWeight: 400, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: '#E2E8F0', padding: '11px 14px', borderRadius: 8, width: '100%', boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit' }}
                />
              </div>

              {/* パスワード */}
              <div style={{ marginBottom: 4 }}>
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

              {/* パスワードをお忘れですか？ */}
              <div style={{ textAlign: 'right', marginBottom: 16 }}>
                <button
                  onClick={() => { setMode('forgot'); setError('') }}
                  style={{ background: 'none', border: 'none', color: '#64748B', fontSize: 12, fontWeight: 400, cursor: 'pointer', padding: 0, fontFamily: 'inherit', textDecoration: 'underline' }}
                >
                  パスワードをお忘れですか？
                </button>
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
                style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: '#E2E8F0', borderRadius: 8, padding: '11px', fontSize: 14, fontWeight: 400, cursor: loading !== null ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxSizing: 'border-box', marginBottom: 12 }}
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

              {/* 新規登録ボタン（金枠・従） */}
              <button
                onClick={() => { window.location.href = '/signup' }}
                style={{ width: '100%', background: 'transparent', border: '1px solid #c9a84c', color: '#c9a84c', borderRadius: 8, padding: '11px', fontSize: 14, fontWeight: 400, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box' }}
              >
                新規登録（会社アカウント作成）
              </button>
            </div>
          )}
        </div>

        <div style={{ fontSize: 11, color: '#64748B', fontWeight: 400, textAlign: 'center', marginTop: 24 }}>
          House-AI Workspace
        </div>
      </div>

      {/* 初めての方へ 固定ボタン */}
      <button
        onClick={() => setShowHelp(true)}
        onMouseEnter={() => setHelpHover(true)}
        onMouseLeave={() => setHelpHover(false)}
        style={{
          position: 'fixed',
          right: 20,
          bottom: 'max(24px, env(safe-area-inset-bottom, 0px))',
          zIndex: 200,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '10px 16px',
          background: 'rgba(15,23,42,0.92)',
          border: '1px solid #c9a84c',
          borderRadius: 12,
          cursor: 'pointer',
          boxShadow: helpHover
            ? '0 8px 28px rgba(201,168,76,0.35), 0 0 0 1px rgba(201,168,76,0.2)'
            : '0 4px 16px rgba(201,168,76,0.18), 0 0 0 1px rgba(201,168,76,0.08)',
          transform: helpHover ? 'translateY(-2px)' : 'translateY(0)',
          transition: 'transform 0.15s ease, box-shadow 0.15s ease',
          fontFamily: 'inherit',
        }}
      >
        <HelpCircle size={16} color="#c9a84c" />
        <div style={{ textAlign: 'left' }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: '#E2E8F0', lineHeight: 1.2 }}>初めての方へ</div>
          <div style={{ fontSize: 10, fontWeight: 400, color: '#64748B', marginTop: 2 }}>ログイン・使い方ガイド</div>
        </div>
      </button>

      {showHelp ? (
        <LoginHelpModal onClose={() => setShowHelp(false)} />
      ) : null}
    </div>
  )
}
