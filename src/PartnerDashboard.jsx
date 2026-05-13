import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'

const navy = '#1a3a5c'
const gold = '#c9a84c'

const BUSINESS_TYPES = ['リフォーム', '外構', '司法書士', '税理士', '金融機関', 'その他']

function getInitialMode() {
  const params = new URLSearchParams(window.location.search)
  return params.get('mode') === 'register' ? 'register' : 'login'
}

function SectionBoost({ setTab }) {
  return (
    <div>
      {/* ① ヘッダー */}
      <div style={{ background: 'linear-gradient(135deg, #0d2744, #1a3a5c)', color: 'white', padding: 32, borderRadius: 16, marginBottom: 24 }}>
        <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>✨ AI集客ブースト</div>
        <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', lineHeight: 1.6 }}>
          House-AIが、あなたの集客・反響・信頼性をさらに最適化します。
        </div>
      </div>

      {/* ② AI診断カード */}
      <div style={{ background: 'white', border: '2px solid #c9a84c', borderRadius: 16, padding: 24, marginBottom: 24 }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: '#1a3a5c', marginBottom: 16 }}>🤖 現在のAI分析</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
          <div style={{ textAlign: 'center', background: '#f8fafc', borderRadius: 10, padding: 12 }}>
            <div style={{ fontSize: 11, color: '#64748b', marginBottom: 8 }}>プロフィール完成度</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#1a3a5c', marginBottom: 8 }}>78%</div>
            <div style={{ height: 6, background: '#e2e8f0', borderRadius: 3 }}>
              <div style={{ width: '78%', height: '100%', background: '#c9a84c', borderRadius: 3 }} />
            </div>
          </div>
          <div style={{ textAlign: 'center', background: '#f8fafc', borderRadius: 10, padding: 12 }}>
            <div style={{ fontSize: 11, color: '#64748b', marginBottom: 8 }}>現在の反響率</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#1a3a5c' }}>3.2%</div>
          </div>
          <div style={{ textAlign: 'center', background: '#f8fafc', borderRadius: 10, padding: 12 }}>
            <div style={{ fontSize: 11, color: '#64748b', marginBottom: 8 }}>AIマッチ数</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#1a3a5c' }}>12件/月</div>
          </div>
        </div>
        {['✅ 施工事例追加でAIマッチ率+23%予測', '✅ 口コミ追加で信頼スコア+8pt'].map(t => (
          <div key={t} style={{ fontSize: 13, color: '#1a3a5c', fontWeight: 600, marginBottom: 6 }}>{t}</div>
        ))}
      </div>

      {/* ③ 現在との差セクション */}
      <div style={{ background: '#fff8e7', border: '1px solid #c9a84c', borderRadius: 12, padding: 20, marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>現在</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#1a3a5c' }}>月3件</div>
            <div style={{ fontSize: 12, color: '#64748b' }}>問い合わせ</div>
          </div>
          <div style={{ fontSize: 28, color: '#c9a84c', fontWeight: 800 }}>→</div>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>AI BOOST導入後予測</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: '#c9a84c' }}>月8〜14件</div>
            <div style={{ fontSize: 12, color: '#64748b' }}>問い合わせ</div>
          </div>
        </div>
        <div style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center', marginTop: 12 }}>※過去データからAI予測</div>
      </div>

      {/* ④ 3プランカード */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
        {/* STANDARD */}
        <div style={{ flex: '1 1 200px', border: '2px solid #e0e0e0', borderRadius: 20, padding: 28 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#64748b', marginBottom: 8, letterSpacing: 1 }}>STANDARD</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: '#1a3a5c', marginBottom: 16 }}>無料</div>
          {['通常掲載', '基本マッチング', 'ダッシュボード閲覧', '顧客管理機能'].map(f => (
            <div key={f} style={{ fontSize: 13, color: '#64748b', marginBottom: 6 }}>・ {f}</div>
          ))}
          <button disabled style={{ marginTop: 16, width: '100%', padding: 10, background: '#e0e0e0', color: '#999', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'default' }}>
            現在のプラン
          </button>
        </div>

        {/* AI BOOST */}
        <div style={{ flex: '1 1 200px', border: '3px solid #c9a84c', borderRadius: 20, padding: 32, transform: 'scale(1.03)', boxShadow: '0 12px 40px rgba(201,168,76,0.3)', position: 'relative' }}>
          <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: '#c9a84c', color: '#1a3a5c', fontSize: 12, fontWeight: 800, padding: '4px 16px', borderRadius: 20, whiteSpace: 'nowrap' }}>
            🔥 人気
          </div>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#c9a84c', marginBottom: 8, letterSpacing: 1 }}>AI BOOST</div>
          <div style={{ fontSize: 14, color: '#64748b', marginBottom: 4 }}>月額</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: '#1a3a5c', marginBottom: 16 }}>9,800円</div>
          {['AI優先紹介', '閲覧数ブースト', '反響率分析レポート', 'AI自動マッチング', '信頼スコア向上支援', '専任サポート'].map(f => (
            <div key={f} style={{ fontSize: 13, color: '#1a3a5c', marginBottom: 6, fontWeight: 600 }}>✅ {f}</div>
          ))}
          <button style={{
            marginTop: 16, width: '100%', padding: 12,
            background: 'linear-gradient(135deg, #c9a84c, #f5e08a, #c9a84c)',
            backgroundSize: '200% auto',
            color: '#1a3a5c', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 800, cursor: 'pointer',
            animation: 'btnShimmer 3s linear infinite',
          }}>
            ✨ AI集客を開始する
          </button>
        </div>

        {/* AI PRO */}
        <div style={{ flex: '1 1 200px', border: '2px solid #1a3a5c', borderRadius: 20, padding: 28, position: 'relative' }}>
          <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: '#1a3a5c', color: '#c9a84c', fontSize: 12, fontWeight: 800, padding: '4px 16px', borderRadius: 20, whiteSpace: 'nowrap' }}>
            👑 PRO
          </div>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#1a3a5c', marginBottom: 8, letterSpacing: 1 }}>AI PRO PARTNER</div>
          <div style={{ fontSize: 14, color: '#64748b', marginBottom: 4 }}>月額</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: '#1a3a5c', marginBottom: 16 }}>29,800円</div>
          {['AI最優先表示', '特集掲載', '専任AIアドバイザー', 'コンバージョン最適化', '月次詳細レポート', 'VIPサポート'].map(f => (
            <div key={f} style={{ fontSize: 13, color: '#1a3a5c', marginBottom: 6 }}>✅ {f}</div>
          ))}
          <button style={{ marginTop: 16, width: '100%', padding: 10, background: '#1a3a5c', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
            🚀 AI最適化を有効化
          </button>
        </div>
      </div>

      {/* ⑤ AIランクセクション */}
      <div style={{ background: 'linear-gradient(135deg, #1a3a5c, #0d2744)', color: 'white', borderRadius: 16, padding: 24, marginBottom: 24 }}>
        <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 16 }}>🏆 AIランク</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>現在のランク</div>
          <div style={{ background: '#c9a84c', color: '#1a3a5c', fontSize: 13, fontWeight: 800, padding: '4px 16px', borderRadius: 20 }}>🥈 Silver Partner</div>
        </div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 12 }}>次のランク（Gold）の条件：</div>
        {[
          { done: true, text: '広告掲載を開始する' },
          { done: false, text: '施工事例を3件以上登録する' },
          { done: false, text: '口コミ評価を5件以上取得する' },
        ].map((c, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <div style={{ width: 20, height: 20, borderRadius: 4, border: c.done ? 'none' : '2px solid rgba(255,255,255,0.4)', background: c.done ? '#c9a84c' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#1a3a5c', fontWeight: 800, flexShrink: 0 }}>
              {c.done ? '✓' : ''}
            </div>
            <div style={{ fontSize: 13, color: c.done ? '#c9a84c' : 'rgba(255,255,255,0.8)', textDecoration: c.done ? 'line-through' : 'none' }}>{c.text}</div>
          </div>
        ))}
      </div>

      {/* ⑥ AIフロー図 */}
      <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(26,58,92,0.09)' }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: '#1a3a5c', textAlign: 'center', marginBottom: 20 }}>AIがあなたの集客を自動最適化</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
          {[
            { icon: '👤', label: 'ユーザー相談' },
            { icon: '🤖', label: 'AI分析' },
            { icon: '🏢', label: '最適な業者へ推薦' },
            { icon: '📈', label: '反響増加' },
          ].map((step, i, arr) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ background: '#1a3a5c', borderRadius: 12, padding: '16px 20px', textAlign: 'center', minWidth: 80 }}>
                <div style={{ fontSize: 24, color: '#c9a84c', marginBottom: 4 }}>{step.icon}</div>
                <div style={{ fontSize: 11, color: '#fff', fontWeight: 700, lineHeight: 1.3 }}>{step.label}</div>
              </div>
              {i < arr.length - 1 && <div style={{ fontSize: 18, color: '#c9a84c', fontWeight: 800 }}>→</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function PartnerDashboard() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('dashboard')
  const [mode, setMode] = useState(getInitialMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [businessType, setBusinessType] = useState(BUSINESS_TYPES[0])
  const [loginError, setLoginError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [editData, setEditData] = useState({})
  const [saveMsg, setSaveMsg] = useState('')
  const [inquiry, setInquiry] = useState('')
  const [inquirySent, setInquirySent] = useState(false)
  const [inquiries, setInquiries] = useState([])
  const [selectedInquiry, setSelectedInquiry] = useState(null)
  const [kpiCounts, setKpiCounts] = useState([0, 0, 0, 0])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
        fetchInquiries(session.user.id)
      } else setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
        fetchInquiries(session.user.id)
      } else { setProfile(null); setLoading(false) }
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    const KPI_VALUES = [12, 1245, 34, 82]
    const steps = 60
    const interval = 1500 / steps
    let step = 0
    const timer = setInterval(() => {
      step++
      const p = Math.min(step / steps, 1)
      setKpiCounts(KPI_VALUES.map(v => Math.round(v * p)))
      if (step >= steps) clearInterval(timer)
    }, interval)
    return () => clearInterval(timer)
  }, [])

  const fetchProfile = async (userId) => {
    const { data } = await supabase.from('partner_profiles').select('*').eq('user_id', userId).single()
    setProfile(data)
    setEditData(data || {})
    setLoading(false)
  }

  const fetchInquiries = async (userId) => {
    const { data } = await supabase.from('partner_inquiries').select('*').eq('partner_user_id', userId).order('created_at', { ascending: false })
    setInquiries(data || [])
  }

  const handleLogin = async () => {
    setLoginLoading(true)
    setLoginError('')
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setLoginError('メールアドレスまたはパスワードが正しくありません')
    } else if (data.user && data.user.user_metadata?.user_type !== 'partner') {
      await supabase.auth.updateUser({ data: { user_type: 'partner' } })
    }
    setLoginLoading(false)
  }

  const handleRegister = async () => {
    if (!companyName.trim()) { setLoginError('会社名を入力してください'); return }
    setLoginLoading(true)
    setLoginError('')
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { user_type: 'partner', company_name: companyName, business_type: businessType } }
    })
    if (error) setLoginError('登録に失敗しました。メールアドレスを確認してください')
    setLoginLoading(false)
  }

  const switchMode = (newMode) => {
    setMode(newMode)
    setLoginError('')
    const url = new URL(window.location.href)
    url.searchParams.set('mode', newMode)
    window.history.replaceState(null, '', url.toString())
  }

  const handleLogout = async () => { await supabase.auth.signOut() }

  const handleSaveProfile = async () => {
    const { error } = await supabase.from('partner_profiles').upsert({ ...editData, user_id: user.id })
    if (!error) {
      setSaveMsg('保存しました！')
      setEditMode(false)
      fetchProfile(user.id)
      setTimeout(() => setSaveMsg(''), 3000)
    }
  }

  const handleInquiry = async () => {
    if (!inquiry.trim()) return
    await supabase.from('owner_requests').insert({
      name: profile?.company_name || user.email,
      email: user.email,
      message: `【パートナー業者からのお問い合わせ】\n${inquiry}`,
      request_type: 'partner_inquiry'
    })
    setInquiry('')
    setInquirySent(true)
    setTimeout(() => setInquirySent(false), 3000)
  }

  const handleStatusChange = async (id, status) => {
    await supabase.from('partner_inquiries').update({ status }).eq('id', id)
    fetchInquiries(user.id)
    if (selectedInquiry?.id === id) setSelectedInquiry({ ...selectedInquiry, status })
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#eef2f7' }}>
      <div style={{ color: navy, fontSize: 16 }}>読み込み中...</div>
    </div>
  )

  if (!user) return (
    <div style={{ minHeight: '100vh', background: '#eef2f7', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: '40px 32px', width: '100%', maxWidth: 420, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🏢</div>
          <div style={{ color: navy, fontSize: 20, fontWeight: 700 }}>パートナー業者様専用</div>
          <div style={{ color: '#888', fontSize: 13, marginTop: 4 }}>
            {mode === 'register' ? '新規会員登録' : 'ダッシュボードにログイン'}
          </div>
        </div>

        {mode === 'register' && (
          <>
            <div style={{ marginBottom: 14 }}>
              <label style={{ color: navy, fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>会社名</label>
              <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="株式会社〇〇"
                style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #ddd', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' }} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ color: navy, fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>業種</label>
              <select value={businessType} onChange={e => setBusinessType(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #ddd', borderRadius: 8, fontSize: 14, boxSizing: 'border-box', background: '#fff' }}>
                {BUSINESS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </>
        )}

        <div style={{ marginBottom: 14 }}>
          <label style={{ color: navy, fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>メールアドレス</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="info@example.com"
            style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #ddd', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' }} />
        </div>
        <div style={{ marginBottom: 24 }}>
          <label style={{ color: navy, fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>パスワード</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
            style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #ddd', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' }}
            onKeyDown={e => e.key === 'Enter' && (mode === 'register' ? handleRegister() : handleLogin())} />
        </div>

        {loginError && <div style={{ color: '#e74c3c', fontSize: 13, marginBottom: 16, textAlign: 'center' }}>{loginError}</div>}

        {mode === 'register' ? (
          <button onClick={handleRegister} disabled={loginLoading}
            style={{ width: '100%', padding: '12px', background: gold, color: navy, border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
            {loginLoading ? '登録中...' : '無料で会員登録する'}
          </button>
        ) : (
          <button onClick={handleLogin} disabled={loginLoading}
            style={{ width: '100%', padding: '12px', background: navy, color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
            {loginLoading ? 'ログイン中...' : 'ログイン'}
          </button>
        )}

        <div style={{ textAlign: 'center', marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {mode === 'register' ? (
            <button onClick={() => switchMode('login')}
              style={{ background: 'none', border: 'none', color: navy, fontSize: 13, cursor: 'pointer', textDecoration: 'underline' }}>
              すでに登録済みの方はログインはこちら
            </button>
          ) : (
            <button onClick={() => switchMode('register')}
              style={{ background: 'none', border: 'none', color: navy, fontSize: 13, cursor: 'pointer', textDecoration: 'underline' }}>
              アカウントをお持ちでない方は登録はこちら
            </button>
          )}
          <a href="/" style={{ color: '#aaa', fontSize: 12 }}>← トップページに戻る</a>
        </div>
      </div>
    </div>
  )

  const tabs = [
    { id: 'dashboard', label: '📊 ダッシュボード' },
    { id: 'boost', label: '✨ AI集客強化' },
    { id: 'ads', label: '📢 広告掲載状況' },
    { id: 'customers', label: `👥 顧客管理${inquiries.length > 0 ? ` (${inquiries.length})` : ''}` },
    { id: 'profile', label: '🏢 会社情報' },
    { id: 'invoice', label: '💰 請求・支払い' },
    { id: 'inquiry', label: '📩 お問い合わせ' },
  ]

  const statusColors = { '未対応': '#e74c3c', '対応中': '#f39c12', '対応済み': '#27ae60' }

  return (
    <div style={{ minHeight: '100vh', background: '#eef2f7' }}>
      <div style={{ background: navy, padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ color: gold, fontSize: 11, fontWeight: 700 }}>パートナー業者様専用</div>
          <div style={{ color: '#fff', fontSize: 18, fontWeight: 700 }}>🏢 ダッシュボード</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>{profile?.company_name || user.email}</div>
          <button onClick={handleLogout} style={{ padding: '6px 14px', background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 8, fontSize: 12, cursor: 'pointer' }}>
            ログアウト
          </button>
        </div>
      </div>

      <div style={{ background: '#fff', borderBottom: '1px solid #e0e0e0', padding: '0 16px', display: 'flex', gap: 4, overflowX: 'auto' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ padding: '14px 16px', background: 'none', border: 'none', borderBottom: tab === t.id ? `3px solid ${navy}` : '3px solid transparent', color: tab === t.id ? navy : '#888', fontWeight: tab === t.id ? 700 : 400, fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap' }}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ padding: 16, maxWidth: 760, margin: '0 auto' }}>

        {/* ダッシュボード */}
        {tab === 'dashboard' && (
          <div>
            {/* ① KPI 4枚カード */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 24 }}>
              {[
                { icon: '📩', label: 'AI紹介件数', value: kpiCounts[0], unit: '件', sub: '前月比+3件', borderColor: gold },
                { icon: '👀', label: '広告閲覧数', value: kpiCounts[1].toLocaleString(), unit: '', sub: '前月比+18%', borderColor: navy },
                { icon: '💬', label: '問い合わせ数', value: kpiCounts[2], unit: '', sub: '前月比+5件', borderColor: gold },
                { icon: '⭐', label: 'マッチング率', value: kpiCounts[3], unit: '%', sub: '', borderColor: navy },
              ].map((k, i) => (
                <div key={k.label} className="kpi-card" style={{
                  background: 'white', borderRadius: 16, padding: '20px 24px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  borderTop: `3px solid ${k.borderColor}`,
                }}>
                  <div style={{ fontSize: 22, marginBottom: 6 }}>{k.icon}</div>
                  <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>{k.label}</div>
                  <div style={{ fontSize: 30, fontWeight: 800, color: navy, lineHeight: 1 }}>
                    {k.value}<span style={{ fontSize: 14, fontWeight: 600 }}>{k.unit}</span>
                  </div>
                  {k.sub && <div style={{ fontSize: 11, color: '#16a34a', marginTop: 6 }}>↑ {k.sub}</div>}
                </div>
              ))}
            </div>

            {/* ② AIおすすめ案件 */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: navy }}>🤖 AIおすすめ案件</div>
                <span style={{ background: gold, color: navy, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>AIが自動選定</span>
              </div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {[
                  { badge: '空き家相談', area: '埼玉県さいたま市', type: '解体', price: '50〜120万円', btnLabel: '詳細を見る →', btnBg: navy, btnColor: '#fff' },
                  { badge: '中古住宅購入相談', area: '火災保険', type: '見積依頼中', price: '', btnLabel: '提案する →', btnBg: gold, btnColor: navy },
                ].map((c, i) => (
                  <div key={i} className="ai-case-card" style={{
                    flex: '1 1 calc(50% - 6px)', minWidth: 200,
                    background: '#fff', borderRadius: 14, padding: 16,
                    boxShadow: '0 2px 12px rgba(26,58,92,0.09)',
                    border: '1.5px solid #e2e8f0',
                    position: 'relative',
                  }}>
                    <span style={{ position: 'absolute', top: 12, right: 12, background: gold, color: navy, fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 20 }}>AI PICK</span>
                    <span style={{ background: navy, color: '#fff', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, display: 'inline-block', marginBottom: 8 }}>{c.badge}</span>
                    <div style={{ fontSize: 13, color: '#1e293b', marginBottom: 4, lineHeight: 1.5 }}>📍 {c.area}</div>
                    <div style={{ fontSize: 12, color: '#64748b', marginBottom: c.price ? 4 : 12 }}>{c.type}</div>
                    {c.price && <div style={{ fontSize: 13, fontWeight: 700, color: navy, marginBottom: 12 }}>{c.price}</div>}
                    <button style={{ background: c.btnBg, color: c.btnColor, border: 'none', borderRadius: 8, padding: '7px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                      {c.btnLabel}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* ③ AI反響ログ */}
            <div style={{ background: '#fff', borderRadius: 14, padding: 20, marginBottom: 24, boxShadow: '0 2px 12px rgba(26,58,92,0.09)' }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: navy, marginBottom: 14 }}>📈 AI反響ログ</div>
              {[
                { time: '10分前', text: 'さいたま市の空き家相談ユーザーがあなたの広告を閲覧しました' },
                { time: '1時間前', text: 'AIがあなたのプロフィールを中古住宅購入相談3件にマッチングしました' },
                { time: '3時間前', text: '火災保険の見積依頼が新たに1件届きました' },
                { time: '昨日', text: '東京都の解体工事相談ユーザーへのおすすめ通知が送信されました' },
                { time: '2日前', text: 'プロフィール完成度が上がりマッチング精度が向上しました' },
              ].map((log, i, arr) => (
                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: i < arr.length - 1 ? 12 : 0 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: gold, marginTop: 5, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 2 }}>{log.time}</div>
                    <div style={{ fontSize: 13, color: '#1e293b', lineHeight: 1.5 }}>{log.text}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* ④ プロフィール完成度 + AI信頼スコア */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
              <div style={{ flex: '2 1 200px', background: '#fff', borderRadius: 14, padding: 20, boxShadow: '0 2px 12px rgba(26,58,92,0.09)' }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: navy, marginBottom: 12 }}>プロフィール完成度</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <div style={{ flex: 1, height: 8, background: '#e2e8f0', borderRadius: 4 }}>
                    <div style={{ width: '78%', height: '100%', background: gold, borderRadius: 4 }} />
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 800, color: navy }}>78%</span>
                </div>
                {['実績・施工事例 未入力', '担当者写真 未設定', '対応エリア 未設定'].map(item => (
                  <div key={item} style={{ fontSize: 12, color: '#ef4444', marginBottom: 4 }}>・{item}</div>
                ))}
                <button onClick={() => setTab('profile')} style={{ marginTop: 12, background: '#fff', color: navy, border: `1.5px solid ${navy}`, borderRadius: 8, padding: '8px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                  プロフィールを充実させる
                </button>
              </div>
              <div style={{ flex: '1 1 130px', background: `linear-gradient(135deg, ${navy} 0%, #0f2540 100%)`, borderRadius: 14, padding: 20, boxShadow: '0 2px 12px rgba(26,58,92,0.09)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 4 }}>🏆 信頼スコア</div>
                <div style={{ fontSize: 48, fontWeight: 900, color: gold, lineHeight: 1 }}>92</div>
                <div style={{ width: '100%', marginTop: 12 }}>
                  {[
                    { label: '返信速度', pct: 90 },
                    { label: '対応品質', pct: 85 },
                    { label: '実績数', pct: 70 },
                    { label: '口コミ評価', pct: 95 },
                  ].map(b => (
                    <div key={b.label} style={{ marginBottom: 6 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'rgba(255,255,255,0.6)', marginBottom: 2 }}>
                        <span>{b.label}</span><span>{b.pct}%</span>
                      </div>
                      <div style={{ height: 4, background: 'rgba(255,255,255,0.2)', borderRadius: 2 }}>
                        <div style={{ width: `${b.pct}%`, height: '100%', background: gold, borderRadius: 2 }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ⑤ CTA */}
            <button onClick={() => setTab('boost')} style={{
              width: '100%', padding: 18,
              background: 'linear-gradient(135deg, #1a3a5c, #2a5a8c)',
              border: 'none', borderRadius: 32,
              color: '#fff', fontSize: 16, fontWeight: 800, cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(26,58,92,0.3)',
            }}>
              ✨ AI集客をさらに強化する →
            </button>
          </div>
        )}

        {/* AI集客強化 */}
        {tab === 'boost' && <SectionBoost setTab={setTab} />}

        {/* 広告掲載状況 */}
        {tab === 'ads' && (
          <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h2 style={{ color: navy, fontSize: 18, fontWeight: 700, marginBottom: 20 }}>📢 広告掲載状況</h2>
            {profile?.ad_title ? (
              <div>
                <div style={{ background: '#f8f9fa', borderRadius: 10, padding: 20, marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <span style={{ padding: '4px 12px', background: profile.ad_status === '掲載中' ? '#27ae60' : '#f39c12', color: '#fff', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
                      {profile.ad_status || '審査中'}
                    </span>
                  </div>
                  <div style={{ color: navy, fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{profile.ad_title}</div>
                  <div style={{ color: '#666', fontSize: 13, lineHeight: 1.7 }}>{profile.ad_description}</div>
                </div>
                <div style={{ color: '#888', fontSize: 12 }}>※ 掲載内容の変更はお問い合わせタブよりご連絡ください</div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#aaa' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
                <div style={{ fontSize: 14 }}>現在、広告掲載情報はありません</div>
                <div style={{ fontSize: 12, marginTop: 8 }}>担当者より順次ご連絡いたします</div>
              </div>
            )}
          </div>
        )}

        {/* 顧客管理 */}
        {tab === 'customers' && (
          <div>
            {selectedInquiry ? (
              <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <button onClick={() => setSelectedInquiry(null)}
                  style={{ background: 'none', border: 'none', color: navy, fontSize: 13, cursor: 'pointer', textDecoration: 'underline', marginBottom: 20, display: 'block' }}>
                  ← 一覧に戻る
                </button>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                  <h2 style={{ color: navy, fontSize: 18, fontWeight: 700 }}>問い合わせ詳細</h2>
                  <select value={selectedInquiry.status} onChange={e => handleStatusChange(selectedInquiry.id, e.target.value)}
                    style={{ padding: '6px 12px', border: `2px solid ${statusColors[selectedInquiry.status]}`, borderRadius: 8, fontSize: 13, fontWeight: 700, color: statusColors[selectedInquiry.status], cursor: 'pointer' }}>
                    <option value="未対応">未対応</option>
                    <option value="対応中">対応中</option>
                    <option value="対応済み">対応済み</option>
                  </select>
                </div>
                {[
                  { label: 'お名前', value: selectedInquiry.customer_name },
                  { label: '電話番号', value: selectedInquiry.customer_phone },
                  { label: 'メールアドレス', value: selectedInquiry.customer_email },
                ].map(f => (
                  <div key={f.label} style={{ marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid #f0f0f0' }}>
                    <div style={{ color: '#888', fontSize: 12, marginBottom: 4 }}>{f.label}</div>
                    <div style={{ color: navy, fontSize: 15, fontWeight: 600 }}>{f.value || '未入力'}</div>
                  </div>
                ))}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ color: '#888', fontSize: 12, marginBottom: 4 }}>お問い合わせ内容</div>
                  <div style={{ background: '#f8f9fa', borderRadius: 8, padding: 16, color: '#333', fontSize: 14, lineHeight: 1.8 }}>
                    {selectedInquiry.message || '内容なし'}
                  </div>
                </div>
                <div style={{ color: '#aaa', fontSize: 12 }}>
                  受信日時：{new Date(selectedInquiry.created_at).toLocaleString('ja-JP')}
                </div>
                {selectedInquiry.customer_phone && (
                  <a href={`tel:${selectedInquiry.customer_phone}`}
                    style={{ display: 'inline-block', marginTop: 20, padding: '12px 24px', background: '#27ae60', color: '#fff', borderRadius: 10, fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
                    📞 折り返し電話をかける
                  </a>
                )}
                {selectedInquiry.customer_email && (
                  <a href={`mailto:${selectedInquiry.customer_email}`}
                    style={{ display: 'inline-block', marginTop: 20, marginLeft: 10, padding: '12px 24px', background: navy, color: '#fff', borderRadius: 10, fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
                    ✉️ メールを送る
                  </a>
                )}
              </div>
            ) : (
              <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <h2 style={{ color: navy, fontSize: 18, fontWeight: 700 }}>👥 顧客からの問い合わせ一覧</h2>
                  <button onClick={() => fetchInquiries(user.id)}
                    style={{ padding: '6px 14px', background: '#f0f0f0', border: 'none', borderRadius: 8, fontSize: 12, cursor: 'pointer' }}>
                    🔄 更新
                  </button>
                </div>
                {inquiries.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: '#aaa' }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
                    <div style={{ fontSize: 14 }}>まだ問い合わせはありません</div>
                    <div style={{ fontSize: 12, marginTop: 8 }}>広告からのお問い合わせがここに表示されます</div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {inquiries.map(inq => (
                      <div key={inq.id} onClick={() => setSelectedInquiry(inq)}
                        style={{ border: '1.5px solid #e0e0e0', borderRadius: 10, padding: '16px', cursor: 'pointer', transition: 'box-shadow 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.1)'}
                        onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                          <div style={{ color: navy, fontWeight: 700, fontSize: 15 }}>{inq.customer_name || '名前未入力'}</div>
                          <span style={{ padding: '3px 10px', background: statusColors[inq.status] || '#aaa', color: '#fff', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                            {inq.status}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: 16, marginBottom: 6 }}>
                          {inq.customer_phone && <div style={{ color: '#555', fontSize: 12 }}>📞 {inq.customer_phone}</div>}
                          {inq.customer_email && <div style={{ color: '#555', fontSize: 12 }}>✉️ {inq.customer_email}</div>}
                        </div>
                        <div style={{ color: '#888', fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {inq.message || '内容なし'}
                        </div>
                        <div style={{ color: '#bbb', fontSize: 11, marginTop: 6 }}>
                          {new Date(inq.created_at).toLocaleString('ja-JP')}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 会社情報 */}
        {tab === 'profile' && (
          <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ color: navy, fontSize: 18, fontWeight: 700 }}>🏢 会社情報</h2>
              {!editMode && (
                <button onClick={() => setEditMode(true)}
                  style={{ padding: '8px 16px', background: navy, color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, cursor: 'pointer' }}>
                  編集する
                </button>
              )}
            </div>
            {saveMsg && <div style={{ color: '#27ae60', fontSize: 13, marginBottom: 16 }}>✅ {saveMsg}</div>}
            {[
              { key: 'company_name', label: '会社名' },
              { key: 'contact_name', label: '担当者名' },
              { key: 'email', label: 'メールアドレス' },
              { key: 'phone', label: '電話番号' },
            ].map(field => (
              <div key={field.key} style={{ marginBottom: 16 }}>
                <label style={{ color: '#888', fontSize: 12, display: 'block', marginBottom: 4 }}>{field.label}</label>
                {editMode ? (
                  <input value={editData[field.key] || ''} onChange={e => setEditData({ ...editData, [field.key]: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #ddd', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' }} />
                ) : (
                  <div style={{ color: navy, fontSize: 15, fontWeight: 500, padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
                    {profile?.[field.key] || '未登録'}
                  </div>
                )}
              </div>
            ))}
            {editMode && (
              <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                <button onClick={handleSaveProfile}
                  style={{ padding: '10px 24px', background: navy, color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                  保存する
                </button>
                <button onClick={() => { setEditMode(false); setEditData(profile || {}) }}
                  style={{ padding: '10px 24px', background: '#f0f0f0', color: '#666', border: 'none', borderRadius: 8, fontSize: 14, cursor: 'pointer' }}>
                  キャンセル
                </button>
              </div>
            )}
          </div>
        )}

        {/* 請求・支払い */}
        {tab === 'invoice' && (
          <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h2 style={{ color: navy, fontSize: 18, fontWeight: 700, marginBottom: 20 }}>💰 請求・支払い状況</h2>
            <div style={{ background: '#f8f9fa', borderRadius: 10, padding: 20, textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>💳</div>
              <div style={{ color: navy, fontSize: 15, fontWeight: 700, marginBottom: 8 }}>
                支払い状況：{profile?.invoice_status || '未払い'}
              </div>
              <div style={{ color: '#888', fontSize: 13 }}>
                請求書はメールにてお送りします。<br />
                ご不明な点はお問い合わせタブよりご連絡ください。
              </div>
            </div>
          </div>
        )}

        {/* お問い合わせ */}
        {tab === 'inquiry' && (
          <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h2 style={{ color: navy, fontSize: 18, fontWeight: 700, marginBottom: 8 }}>📩 GINTETSUへのお問い合わせ</h2>
            <p style={{ color: '#888', fontSize: 13, marginBottom: 20 }}>広告内容の変更・ご要望・ご質問などをお気軽にどうぞ</p>
            {inquirySent && <div style={{ color: '#27ae60', fontSize: 13, marginBottom: 16 }}>✅ 送信しました！担当者よりご連絡いたします。</div>}
            <textarea value={inquiry} onChange={e => setInquiry(e.target.value)}
              placeholder="お問い合わせ内容を入力してください..." rows={6}
              style={{ width: '100%', padding: '12px', border: '1.5px solid #ddd', borderRadius: 8, fontSize: 14, boxSizing: 'border-box', resize: 'vertical' }} />
            <button onClick={handleInquiry}
              style={{ marginTop: 12, padding: '12px 28px', background: navy, color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
              送信する
            </button>
          </div>
        )}

      </div>
    </div>
  )
}
