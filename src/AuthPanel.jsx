import { useState } from 'react'
import { supabase } from './lib/supabase'
import MemberDashboard from './MemberDashboard'

export default function AuthPanel({ onLoginSuccess }) {
  const [mode, setMode] = useState('login')
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [form, setForm] = useState({
    email: '',
    password: '',
    name: '',
    userType: 'general',
  })

  async function handleLogin() {
    if (!form.email || !form.password) {
      setError('メールアドレスとパスワードを入力してください')
      return
    }
    setLoading(true)
    setError('')
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      })
      if (error) throw error
      setUser(data.user)
      setMode('loggedIn')
      onLoginSuccess?.()
    } catch (err) {
      setError('ログインに失敗しました。メールアドレスとパスワードを確認してください。')
    } finally {
      setLoading(false)
    }
  }

  async function handleRegister() {
    if (!form.email || !form.password || !form.name) {
      setError('すべての項目を入力してください')
      return
    }
    if (form.password.length < 6) {
      setError('パスワードは6文字以上で入力してください')
      return
    }
    setLoading(true)
    setError('')
    try {
      const { data, error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            name: form.name,
            user_type: form.userType,
          }
        }
      })
      if (error) throw error
      setSuccess('確認メールを送信しました。メールのリンクをクリックして登録を完了してください。')
      setMode('login')
    } catch (err) {
      if (err.message && err.message.includes('already registered')) {
        setError('このメールアドレスはすでに登録されています')
      } else {
        setError('登録に失敗しました。もう一度お試しください。')
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    setUser(null)
    setMode('login')
    setForm({ email: '', password: '', name: '', userType: 'general' })
  }

  async function handleGoogleLogin() {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin }
      })
      if (error) throw error
    } catch (err) {
      setError('Googleログインに失敗しました')
    }
  }

  const fieldStyle = {
    width: '100%',
    boxSizing: 'border-box',
    padding: '12px 14px',
    borderRadius: 10,
    border: '1.5px solid #e2e8f0',
    background: '#ffffff',
    color: '#1e293b',
    fontSize: 16,
    outline: 'none',
    fontFamily: 'inherit',
  }

  const labelStyle = {
    display: 'block',
    fontSize: 13,
    fontWeight: 600,
    color: '#374151',
    marginBottom: 6,
  }

  if (mode === 'loggedIn' && user) {
    return (
      <MemberDashboard
        user={user}
        onNavigate={(tab) => {
          window.dispatchEvent(new CustomEvent('navigate', { detail: { tab } }))
        }}
        onLogout={handleLogout}
      />
    )
  }

  return (
    <div style={{ width: '100%', maxWidth: 480, margin: '0 auto', background: '#f8fafc', padding: '24px 20px', boxSizing: 'border-box' }}>
      <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1e293b', marginBottom: 4, marginTop: 0 }}>
        {mode === 'login' ? 'ログイン' : '新規会員登録'}
      </h2>
      <p style={{ fontSize: 13, color: '#475569', marginBottom: 20, marginTop: 0 }}>
        {mode === 'login'
          ? '会員の方はメールアドレスとパスワードでログインしてください'
          : '新規会員登録をして、すべての機能をご利用ください'}
      </p>

      {/* タブ */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 20, background: '#f1f5f9', borderRadius: 10, padding: 4 }}>
        <button
          style={{
            flex: 1, padding: '9px 0', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 15,
            borderRadius: 8, transition: 'all 0.15s',
            background: mode === 'login' ? '#1a3a5c' : 'transparent',
            color: mode === 'login' ? '#fff' : '#64748b',
          }}
          onClick={() => { setMode('login'); setError(''); setSuccess('') }}
        >
          ログイン
        </button>
        <button
          style={{
            flex: 1, padding: '9px 0', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 15,
            borderRadius: 8, transition: 'all 0.15s',
            background: mode === 'register' ? '#1a3a5c' : 'transparent',
            color: mode === 'register' ? '#fff' : '#64748b',
          }}
          onClick={() => { setMode('register'); setError(''); setSuccess('') }}
        >
          新規登録
        </button>
      </div>

      {success && (
        <div style={{ padding: '12px 14px', borderRadius: 10, background: '#ecfdf5', border: '1px solid #6ee7b7', color: '#065f46', fontSize: 13, marginBottom: 16 }}>
          {success}
        </div>
      )}

      {error && (
        <div style={{ padding: '12px 14px', borderRadius: 10, background: '#fef2f2', border: '1px solid #fca5a5', color: '#dc2626', fontSize: 13, marginBottom: 16 }}>
          {error}
        </div>
      )}

      {mode === 'register' && (
        <>
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>お名前</label>
            <input
              style={fieldStyle}
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="例：山田 太郎"
            />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>会員種別</label>
            <select
              style={fieldStyle}
              value={form.userType}
              onChange={e => setForm(f => ({ ...f, userType: e.target.value }))}
            >
              <option value="general">一般会員</option>
              <option value="agency">業者・企業会員</option>
            </select>
          </div>
        </>
      )}

      <div style={{ marginBottom: 14 }}>
        <label style={labelStyle}>メールアドレス</label>
        <input
          style={fieldStyle}
          type="email"
          value={form.email}
          onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
          placeholder="example@email.com"
          autoComplete="email"
        />
      </div>

      <div style={{ marginBottom: 22 }}>
        <label style={labelStyle}>
          パスワード{mode === 'register' && <span style={{ color: '#94a3b8', fontWeight: 400 }}>（6文字以上）</span>}
        </label>
        <input
          style={fieldStyle}
          type="password"
          value={form.password}
          onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
          placeholder="••••••••"
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
        />
      </div>

      <button
        style={{
          width: '100%', height: 52, border: 'none', borderRadius: 12,
          background: '#1a3a5c', color: '#fff',
          fontSize: 16, fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.7 : 1,
        }}
        disabled={loading}
        onClick={mode === 'login' ? handleLogin : handleRegister}
      >
        {loading ? '処理中...' : mode === 'login' ? 'ログイン' : '会員登録する'}
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '16px 0' }}>
        <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
        <span style={{ fontSize: 12, color: '#94a3b8' }}>または</span>
        <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
      </div>

      <button
        style={{
          width: '100%', height: 48, border: '1.5px solid #e2e8f0', borderRadius: 12,
          background: '#fff', color: '#374151',
          fontSize: 15, fontWeight: 600, cursor: 'not-allowed',
          opacity: 0.5,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}
        disabled
      >
        <span style={{ fontSize: 18, fontWeight: 800, color: '#4285F4' }}>G</span>
        Googleでログイン（準備中）
      </button>

      <p style={{ fontSize: 13, color: '#64748b', textAlign: 'center', marginTop: 20 }}>
        {mode === 'login' ? 'アカウントをお持ちでない方は' : 'すでにアカウントをお持ちの方は'}
        <button
          style={{ background: 'none', border: 'none', color: '#1a3a5c', cursor: 'pointer', fontSize: 13, fontWeight: 700, textDecoration: 'underline', padding: '0 2px' }}
          onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); setSuccess('') }}
        >
          {mode === 'login' ? '新規登録' : 'ログイン'}
        </button>
        へ
      </p>
    </div>
  )
}
