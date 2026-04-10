import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

const navy = '#1a3a5c'
const gold = '#c9a84c'

export default function PartnerDashboard() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('ads')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [editData, setEditData] = useState({})
  const [saveMsg, setSaveMsg] = useState('')
  const [inquiry, setInquiry] = useState('')
  const [inquirySent, setInquirySent] = useState(false)
  const [inquiries, setInquiries] = useState([])
  const [selectedInquiry, setSelectedInquiry] = useState(null)

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
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setLoginError('メールアドレスまたはパスワードが正しくありません')
    setLoginLoading(false)
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
      <div style={{ background: '#fff', borderRadius: 16, padding: '40px 32px', width: '100%', maxWidth: 400, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🏢</div>
          <div style={{ color: navy, fontSize: 20, fontWeight: 700 }}>パートナー業者様専用</div>
          <div style={{ color: '#888', fontSize: 13, marginTop: 4 }}>ダッシュボードにログイン</div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ color: navy, fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>メールアドレス</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="info@example.com"
            style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #ddd', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' }} />
        </div>
        <div style={{ marginBottom: 24 }}>
          <label style={{ color: navy, fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>パスワード</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
            style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #ddd', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' }}
            onKeyDown={e => e.key === 'Enter' && handleLogin()} />
        </div>
        {loginError && <div style={{ color: '#e74c3c', fontSize: 13, marginBottom: 16, textAlign: 'center' }}>{loginError}</div>}
        <button onClick={handleLogin} disabled={loginLoading}
          style={{ width: '100%', padding: '12px', background: navy, color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
          {loginLoading ? 'ログイン中...' : 'ログイン'}
        </button>
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <a href="/" style={{ color: '#888', fontSize: 12 }}>← トップページに戻る</a>
        </div>
      </div>
    </div>
  )

  const tabs = [
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
