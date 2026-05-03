import { useState } from 'react'
import { supabase } from './lib/supabase'

const NAVY = '#1a3a5c'
const GOLD = '#c9a84c'

export default function ExpertAuthPanel({ onLoginSuccess, onBack }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!email || !password) {
      setError('メールアドレスとパスワードを入力してください')
      return
    }
    setLoading(true)
    setError('')
    try {
      if (isLogin) {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password })
        if (err) throw err
      } else {
        const { error: err } = await supabase.auth.signUp({ email, password })
        if (err) throw err
      }
      onLoginSuccess?.()
    } catch (err) {
      setError(err.message || 'エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  const fieldStyle = {
    width: '100%',
    boxSizing: 'border-box',
    padding: '12px 14px',
    borderRadius: 10,
    border: '1.5px solid rgba(255,255,255,0.2)',
    background: 'rgba(255,255,255,0.08)',
    color: '#fff',
    fontSize: 16,
    fontFamily: 'inherit',
    outline: 'none',
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: NAVY, padding: '24px 16px',
    }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        {/* ヘッダー */}
        <h2 style={{ fontSize: 20, fontWeight: 800, color: '#fff', textAlign: 'center', marginBottom: 24 }}>
          🏛️ 専門家ログイン
        </h2>

        {/* タブ */}
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.08)', borderRadius: 10, padding: 4, marginBottom: 24 }}>
          <button
            onClick={() => { setIsLogin(true); setError('') }}
            style={{
              flex: 1, padding: '9px 0', border: 'none', borderRadius: 8, cursor: 'pointer',
              fontWeight: 700, fontSize: 14,
              background: isLogin ? GOLD : 'transparent',
              color: isLogin ? '#fff' : 'rgba(255,255,255,0.6)',
            }}
          >
            ログイン
          </button>
          <button
            onClick={() => { setIsLogin(false); setError('') }}
            style={{
              flex: 1, padding: '9px 0', border: 'none', borderRadius: 8, cursor: 'pointer',
              fontWeight: 700, fontSize: 14,
              background: !isLogin ? GOLD : 'transparent',
              color: !isLogin ? '#fff' : 'rgba(255,255,255,0.6)',
            }}
          >
            新規登録
          </button>
        </div>

        {/* エラー */}
        {error && (
          <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(255,80,80,0.15)', border: '1px solid rgba(255,80,80,0.4)', color: '#fca5a5', fontSize: 13, marginBottom: 16 }}>
            {error}
          </div>
        )}

        {/* フォーム */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: 6 }}>
            メールアドレス
          </label>
          <input
            style={fieldStyle}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@office.jp"
            autoComplete="email"
          />
        </div>
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: 6 }}>
            パスワード{!isLogin && <span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 400 }}>（6文字以上）</span>}
          </label>
          <input
            style={fieldStyle}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete={isLogin ? 'current-password' : 'new-password'}
          />
        </div>

        {/* 送信ボタン */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: '100%', height: 52, border: 'none', borderRadius: 12,
            background: GOLD, color: '#fff',
            fontSize: 16, fontWeight: 800,
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
            marginBottom: 16,
          }}
        >
          {loading ? '処理中...' : isLogin ? 'ログインする' : '新規登録する'}
        </button>

        {/* 戻るボタン */}
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={onBack}
            style={{
              background: 'none', border: 'none', color: 'rgba(255,255,255,0.55)',
              fontSize: 13, cursor: 'pointer', textDecoration: 'underline',
            }}
          >
            ← 戻る
          </button>
        </div>
      </div>
    </div>
  )
}
