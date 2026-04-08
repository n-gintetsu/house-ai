import { useState } from 'react'
import { supabase } from './lib/supabase'

export default function AuthPanel() {
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
    padding: '11px 12px',
    borderRadius: 12,
    border: '1px solid rgba(26, 58, 92, 0.1)',
    background: '#ffffff',
    color: '#222222',
    fontSize: 14,
    outline: 'none',
    fontFamily: 'inherit',
  }

  const btnStyle = {
    appearance: 'none',
    border: '1px solid rgba(26, 58, 92, 0.25)',
    background: 'rgba(26, 58, 92, 0.08)',
    color: '#1a3a5c',
    padding: '10px 16px',
    borderRadius: 12,
    fontWeight: 750,
    cursor: loading ? 'not-allowed' : 'pointer',
    fontSize: 14,
    opacity: loading ? 0.6 : 1,
    width: '100%',
    marginTop: 8,
  }

  const primaryBtnStyle = {
    ...btnStyle,
    background: '#1a3a5c',
    color: '#fff',
    border: 'none',
  }

  if (mode === 'loggedIn' && user) {
    return (
      <div style={{ padding: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 750, color: '#1a3a5c', marginBottom: 6 }}>
          👤 会員専用ページ
        </h2>
        <p style={{ fontSize: 13, color: '#777', marginBottom: 20 }}>
          ようこそ、{user.user_metadata?.name || user.email} さん
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 24 }}>
          <div style={{ border: '1px solid rgba(26,58,92,0.1)', borderRadius: 14, padding: 16, background: '#fff' }}>
            <h4 style={{ margin: '0 0 8px', fontSize: 15, color: '#1a3a5c' }}>🗒 相談履歴</h4>
            <p style={{ margin: 0, fontSize: 13, color: '#777', lineHeight: 1.45 }}>過去のAI相談履歴を保存・閲覧できます。</p>
          </div>
          <div style={{ border: '1px solid rgba(26,58,92,0.1)', borderRadius: 14, padding: 16, background: '#fff' }}>
            <h4 style={{ margin: '0 0 8px', fontSize: 15, color: '#1a3a5c' }}>🔔 物件アラート</h4>
            <p style={{ margin: 0, fontSize: 13, color: '#777', lineHeight: 1.45 }}>希望条件に合った物件が出たらメールでお知らせします。</p>
          </div>
          <div style={{ border: '1px solid rgba(26,58,92,0.1)', borderRadius: 14, padding: 16, background: '#fff' }}>
            <h4 style={{ margin: '0 0 8px', fontSize: 15, color: '#1a3a5c' }}>🏠 お気に入り</h4>
            <p style={{ margin: 0, fontSize: 13, color: '#777', lineHeight: 1.45 }}>気になる物件や専門家を登録できます。</p>
          </div>
        </div>

        <div style={{ padding: '12px 16px', borderRadius: 12, background: '#f0f4f8', marginBottom: 20, fontSize: 13, color: '#555' }}>
          <strong>登録情報</strong><br />
          メール：{user.email}<br />
          種別：{user.user_metadata?.user_type === 'agency' ? '業者・企業会員' : '一般会員'}
        </div>

        <button style={{ ...btnStyle, width: 'auto', padding: '10px 24px' }} onClick={handleLogout}>
          ログアウト
        </button>
      </div>
    )
  }

  return (
    <div style={{ padding: 24, maxWidth: 440, margin: '0 auto' }}>
      <h2 style={{ fontSize: 18, fontWeight: 750, color: '#1a3a5c', marginBottom: 6 }}>
        👤 {mode === 'login' ? 'ログイン' : '会員登録'}
      </h2>
      <p style={{ fontSize: 13, color: '#777', marginBottom: 20 }}>
        {mode === 'login'
          ? '会員の方はメールアドレスとパスワードでログインしてください'
          : '新規会員登録をして、すべての機能をご利用ください'}
      </p>

      <div style={{ display: 'flex', gap: 0, marginBottom: 20, borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(26,58,92,0.15)' }}>
        <button
          style={{ flex: 1, padding: '10px 0', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 14,
            background: mode === 'login' ? '#1a3a5c' : '#f8fafc', color: mode === 'login' ? '#fff' : '#777' }}
          onClick={() => { setMode('login'); setError(''); setSuccess('') }}
        >
          ログイン
        </button>
        <button
          style={{ flex: 1, padding: '10px 0', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 14,
            background: mode === 'register' ? '#1a3a5c' : '#f8fafc', color: mode === 'register' ? '#fff' : '#777' }}
          onClick={() => { setMode('register'); setError(''); setSuccess('') }}
        >
          新規登録
        </button>
      </div>

      {success && (
        <div style={{ padding: '12px 14px', borderRadius: 12, background: '#ecfdf5', border: '1px solid #6ee7b7', color: '#065f46', fontSize: 13, marginBottom: 16 }}>
          {success}
        </div>
      )}

      {error && (
        <div style={{ padding: '12px 14px', borderRadius: 12, background: 'rgba(255,60,60,0.08)', border: '1px solid rgba(255,100,100,0.45)', color: '#dc2626', fontSize: 13, marginBottom: 16 }}>
          {error}
        </div>
      )}

      {mode === 'register' && (
        <>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 12, color: '#777', marginBottom: 6 }}>お名前</label>
            <input
              style={fieldStyle}
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="例：山田 太郎"
            />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 12, color: '#777', marginBottom: 6 }}>会員種別</label>
            <select
              style={fieldStyle}
              value={form.userType}
              onChange={e => setForm(f => ({ ...f, userType: e.target.value }))}
            >
              <option value="general">一般会員（物件を探している方）</option>
              <option value="agency">業者・企業会員</option>
            </select>
          </div>
        </>
      )}

      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', fontSize: 12, color: '#777', marginBottom: 6 }}>メールアドレス</label>
        <input
          style={fieldStyle}
          type="email"
          value={form.email}
          onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
          placeholder="example@email.com"
          autoComplete="email"
        />
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={{ display: 'block', fontSize: 12, color: '#777', marginBottom: 6 }}>
          パスワード{mode === 'register' && <span style={{ color: '#aaa' }}>（6文字以上）</span>}
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
        style={primaryBtnStyle}
        disabled={loading}
        onClick={mode === 'login' ? handleLogin : handleRegister}
      >
        {loading ? '処理中...' : mode === 'login' ? 'ログイン' : '会員登録する'}
      </button>

      <div style={{ marginTop: 16, textAlign: 'center' }}>
        <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', marginBottom: 16 }} />
        <button
          style={{ ...btnStyle, background: '#fff', border: '1px solid #e5e7eb', color: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          <span style={{ fontSize: 18 }}>G</span> Googleでログイン（準備中）
        </button>
      </div>

      <p style={{ fontSize: 12, color: '#aaa', textAlign: 'center', marginTop: 16 }}>
        {mode === 'login' ? 'アカウントをお持ちでない方は' : 'すでにアカウントをお持ちの方は'}
        <button
          style={{ background: 'none', border: 'none', color: '#1a3a5c', cursor: 'pointer', fontSize: 12, fontWeight: 700, textDecoration: 'underline' }}
          onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); setSuccess('') }}
        >
          {mode === 'login' ? '新規登録' : 'ログイン'}
        </button>
        へ
      </p>
    </div>
  )
}
