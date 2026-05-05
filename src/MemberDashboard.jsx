import { useState, useEffect } from 'react'
import ReactDOM from 'react-dom'
import { supabase } from './lib/supabase'

const C = {
  navy: '#1a3a5c',
  gold: '#c9a84c',
  bg: '#F4F7FB',
  card: '#ffffff',
  title: '#102A43',
  desc: '#5C677D',
  border: '#E2E8F0',
  green: '#06C755',
  red: '#c0392b',
  blue: '#2F6BFF',
}

// ============================================================
// 空状態コンポーネント
// ============================================================
function EmptyState({ icon, text, sub, btnLabel, onBtn }) {
  return (
    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>{icon}</div>
      <p style={{ fontSize: 14, fontWeight: 700, color: C.title, marginBottom: 6 }}>{text}</p>
      <p style={{ fontSize: 12, color: C.desc, marginBottom: 20, lineHeight: 1.6 }}>{sub}</p>
      {btnLabel && (
        <button onClick={onBtn} style={{ background: C.navy, color: '#fff', border: 'none', borderRadius: 20, padding: '10px 24px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
          {btnLabel}
        </button>
      )}
    </div>
  )
}

// ============================================================
// お気に入りタブ
// ============================================================
function FavoritesTab({ user, onNavigate }) {
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { setLoading(false); return }
    async function load() {
      const { data: favs } = await supabase
        .from('favorites').select('property_id').eq('user_id', user.id)
      if (!favs || favs.length === 0) { setLoading(false); return }
      const ids = favs.map(f => f.property_id)
      const { data: props } = await supabase
        .from('properties').select('id, title, price, rent, image_url, deal_type, address').in('id', ids)
      setProperties(props || [])
      setLoading(false)
    }
    load()
  }, [user])

  if (loading) return <div style={{ textAlign: 'center', padding: 40, color: C.desc, fontSize: 13 }}>読み込み中...</div>

  if (properties.length === 0) return (
    <EmptyState
      icon="🏠"
      text="まだお気に入り物件がありません"
      sub="気になる物件を保存するとここに表示されます。"
      btnLabel="物件を探す"
      onBtn={() => onNavigate('properties')}
    />
  )

  return (
    <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      {properties.map(p => {
        const displayPrice = p.deal_type === 'rent'
          ? (p.rent ? `${(p.rent / 10000).toFixed(1)}万円/月` : '価格未定')
          : (p.price ? `${(p.price / 10000).toFixed(0)}万円` : '価格未定')
        return (
          <div key={p.id} style={{ display: 'flex', gap: 12, background: C.bg, borderRadius: 12, overflow: 'hidden', border: `1px solid ${C.border}` }}>
            {p.image_url
              ? <img src={p.image_url} alt={p.title} style={{ width: 96, height: 80, objectFit: 'cover', flexShrink: 0 }} />
              : <div style={{ width: 96, height: 80, background: '#dde4ee', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0 }}>🏠</div>
            }
            <div style={{ padding: '10px 12px 10px 0', flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: C.title, margin: '0 0 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</p>
              {p.address && <p style={{ fontSize: 11, color: C.desc, margin: '0 0 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.address}</p>}
              <p style={{ fontSize: 14, fontWeight: 800, color: C.navy, margin: 0 }}>{displayPrice}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ============================================================
// フォロー業者タブ
// ============================================================
function FollowsTab({ onNavigate }) {
  return (
    <EmptyState
      icon="👷"
      text="まだフォロー中の業者がありません"
      sub={"信頼できる業者を見つけてフォローしましょう。"}
      btnLabel="業者を探す"
      onBtn={() => onNavigate('vendors')}
    />
  )
}

// ============================================================
// 保存ページタブ
// ============================================================
function SavedTab({ onNavigate }) {
  return (
    <EmptyState
      icon="📑"
      text="保存したページはまだありません"
      sub={"体験談や診断結果を保存するとここに表示されます。"}
      btnLabel="体験談を見る"
      onBtn={() => onNavigate('community')}
    />
  )
}

// ============================================================
// AI相談タブ
// ============================================================
function ChatHistoryTab({ onNavigate }) {
  return (
    <div style={{ padding: '0 0 20px' }}>
      <EmptyState
        icon="💬"
        text="まだAI相談履歴がありません"
        sub={"AIコンシェルジュに相談してみましょう。"}
        btnLabel={null}
        onBtn={null}
      />
      <div style={{ padding: '0 16px' }}>
        <button onClick={() => onNavigate('chat')} style={{ width: '100%', background: C.navy, color: '#fff', border: 'none', borderRadius: 12, padding: '14px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
          💬 新しくAI相談する
        </button>
      </div>
    </div>
  )
}

// ============================================================
// DMタブ
// ============================================================
function DMTab({ onNavigate }) {
  return (
    <EmptyState
      icon="✉️"
      text="まだメッセージはありません"
      sub={"気になる業者に相談してみましょう。"}
      btnLabel="業者を探す"
      onBtn={() => onNavigate('vendors')}
    />
  )
}

// ============================================================
// 次にやることカード
// ============================================================
function NextActionCard({ onNavigate }) {
  const actions = [
    { icon: '🏠', text: '気になる物件をAIに相談する', tab: 'chat' },
    { icon: '👷', text: '信頼できる業者を探す', tab: 'vendors' },
    { icon: '📊', text: '無料査定を受ける', tab: 'sell' },
  ]
  return (
    <div style={{ background: C.card, borderRadius: 16, padding: '16px', border: `1px solid ${C.border}` }}>
      <p style={{ fontSize: 13, fontWeight: 700, color: C.navy, margin: '0 0 12px' }}>🎯 あなたへのおすすめアクション</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {actions.map((a, i) => (
          <button key={i} onClick={() => onNavigate(a.tab)}
            style={{ display: 'flex', alignItems: 'center', gap: 10, background: C.bg, border: 'none', borderRadius: 10, padding: '10px 12px', cursor: 'pointer', textAlign: 'left' }}>
            <span style={{ fontSize: 18 }}>{a.icon}</span>
            <span style={{ fontSize: 13, color: C.title, fontWeight: 600 }}>{a.text}</span>
            <span style={{ marginLeft: 'auto', color: C.desc, fontSize: 12 }}>→</span>
          </button>
        ))}
      </div>
    </div>
  )
}

// ============================================================
// オーバーレイ共通
// ============================================================
const overlayStyle = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
  zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center',
  padding: '16px',
}
const sheetStyle = {
  background: '#fff', borderRadius: 16, width: '100%', maxWidth: 480,
  maxHeight: '85dvh', overflowY: 'auto', padding: '28px 24px',
  position: 'relative', boxSizing: 'border-box',
}

// ============================================================
// 会員情報編集モーダル
// ============================================================
function EditProfileModal({ user, onClose }) {
  const [name, setName] = useState(user?.user_metadata?.name || '')
  const [phone, setPhone] = useState(user?.user_metadata?.phone || '')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  const save = async () => {
    setSaving(true)
    const { error } = await supabase
      .from('profiles')
      .upsert({ id: user.id, name, phone, updated_at: new Date().toISOString() })
    if (error) { setMsg('保存に失敗しました'); setSaving(false); return }
    await supabase.auth.updateUser({ data: { name, phone } })
    setMsg('保存しました')
    setSaving(false)
  }

  return ReactDOM.createPortal(
    <div style={overlayStyle} onClick={onClose}>
      <div style={sheetStyle} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#666' }}>×</button>
        <p style={{ fontSize: 16, fontWeight: 800, color: C.navy, margin: '0 0 20px' }}>✏️ 会員情報編集</p>
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, color: C.desc, display: 'block', marginBottom: 4 }}>お名前</label>
          <input value={name} onChange={e => setName(e.target.value)}
            style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 16, outline: 'none' }} />
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, color: C.desc, display: 'block', marginBottom: 4 }}>メールアドレス</label>
          <input value={user?.email || ''} disabled
            style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 16, background: '#f8fafc', color: C.desc }} />
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 12, color: C.desc, display: 'block', marginBottom: 4 }}>電話番号</label>
          <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="例：090-1234-5678"
            style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 16, outline: 'none' }} />
        </div>
        {msg && <p style={{ fontSize: 13, color: msg.includes('失敗') ? C.red : C.green, marginBottom: 12 }}>{msg}</p>}
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, background: '#f1f5f9', color: C.title, border: 'none', borderRadius: 10, padding: '12px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>キャンセル</button>
          <button onClick={save} disabled={saving} style={{ flex: 1, background: C.navy, color: '#fff', border: 'none', borderRadius: 10, padding: '12px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
            {saving ? '保存中...' : '保存する'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

// ============================================================
// 通知設定モーダル
// ============================================================
function NotificationModal({ onClose }) {
  const load = (key, def) => {
    try { const v = localStorage.getItem(key); return v === null ? def : v === 'true' } catch { return def }
  }
  const [newProp, setNewProp] = useState(() => load('notif_new_property', true))
  const [favUpdate, setFavUpdate] = useState(() => load('notif_fav_update', false))

  const toggle = (key, val, setter) => {
    setter(val)
    try { localStorage.setItem(key, String(val)) } catch {}
  }

  const Toggle = ({ value, onChange }) => (
    <div onClick={() => onChange(!value)} style={{
      width: 48, height: 26, borderRadius: 13, background: value ? C.navy : '#cbd5e1',
      position: 'relative', cursor: 'pointer', flexShrink: 0, transition: 'background 0.2s',
    }}>
      <div style={{
        position: 'absolute', top: 3, left: value ? 24 : 3,
        width: 20, height: 20, borderRadius: '50%', background: '#fff',
        transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
      }} />
    </div>
  )

  return ReactDOM.createPortal(
    <div style={overlayStyle} onClick={onClose}>
      <div style={sheetStyle} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#666' }}>×</button>
        <p style={{ fontSize: 16, fontWeight: 800, color: C.navy, margin: '0 0 20px' }}>🔔 通知設定</p>
        {[
          { label: '新着物件通知', sub: '条件に合う物件が追加されたときに通知', value: newProp, onChange: v => toggle('notif_new_property', v, setNewProp) },
          { label: 'お気に入り更新通知', sub: 'お気に入り物件の情報が変更されたときに通知', value: favUpdate, onChange: v => toggle('notif_fav_update', v, setFavUpdate) },
        ].map(item => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: `1px solid ${C.border}` }}>
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: C.title, margin: '0 0 2px' }}>{item.label}</p>
              <p style={{ fontSize: 11, color: C.desc, margin: 0 }}>{item.sub}</p>
            </div>
            <Toggle value={item.value} onChange={item.onChange} />
          </div>
        ))}
        <button onClick={onClose} style={{ width: '100%', marginTop: 20, background: C.navy, color: '#fff', border: 'none', borderRadius: 10, padding: '12px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>閉じる</button>
      </div>
    </div>,
    document.body
  )
}

// ============================================================
// 利用ガイドモーダル
// ============================================================
function GuideModal({ onClose }) {
  const guides = [
    { icon: '🤖', title: 'AI相談', desc: 'トップページのAI相談チャットで、物件選びの悩みを相談できます。3ターン無料でご利用いただけます。' },
    { icon: '🏢', title: '物件フィード', desc: 'TikTok風の縦スクロールで物件を閲覧できます。ハートボタンでお気に入り保存、左右スワイプでカテゴリ切り替えができます。' },
    { icon: '❤️', title: 'お気に入り', desc: 'マイページのお気に入りタブに保存した物件が表示されます。ログイン後に利用できます。' },
    { icon: '💬', title: '体験談コミュニティ', desc: '実際の不動産取引の体験談を読んだり、匿名で投稿したりできます。' },
    { icon: '🤝', title: '専門家相談', desc: '司法書士・税理士・FP・リフォーム業者への相談依頼ができます。紹介料は一切かかりません。' },
  ]
  return ReactDOM.createPortal(
    <div style={overlayStyle} onClick={onClose}>
      <div style={sheetStyle} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#666' }}>×</button>
        <p style={{ fontSize: 16, fontWeight: 800, color: C.navy, margin: '0 0 20px' }}>📖 house-ai 利用ガイド</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {guides.map(g => (
            <div key={g.title} style={{ display: 'flex', gap: 12, padding: '12px', background: C.bg, borderRadius: 10 }}>
              <span style={{ fontSize: 24, flexShrink: 0 }}>{g.icon}</span>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: C.title, margin: '0 0 4px' }}>{g.title}</p>
                <p style={{ fontSize: 12, color: C.desc, margin: 0, lineHeight: 1.6 }}>{g.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <button onClick={onClose} style={{ width: '100%', marginTop: 20, background: C.navy, color: '#fff', border: 'none', borderRadius: 10, padding: '12px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>閉じる</button>
      </div>
    </div>,
    document.body
  )
}

// ============================================================
// メインダッシュボード
// ============================================================
export default function MemberDashboard({ user, onNavigate, onLogout }) {
  const [activeTab, setActiveTab] = useState('favorites')
  const [isMobile, setIsMobile] = useState(false)
  const [showEditProfile, setShowEditProfile] = useState(false)
  const [showNotification, setShowNotification] = useState(false)
  const [showGuide, setShowGuide] = useState(false)

  const menuItems = [
    { label: '会員情報編集', icon: '✏️', onClick: () => setShowEditProfile(true) },
    { label: '通知設定', icon: '🔔', onClick: () => setShowNotification(true) },
    { label: '利用ガイド', icon: '📖', onClick: () => setShowGuide(true) },
  ]

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    const handler = (e) => setActiveTab(e.detail.tab)
    window.addEventListener('member-tab', handler)
    return () => window.removeEventListener('member-tab', handler)
  }, [])

  const name = user?.user_metadata?.name || user?.email?.split('@')[0] || 'ゲスト'
  const memberType = user?.user_metadata?.user_type === 'agency' ? '業者・企業会員' : '一般会員'
  const joinDate = user?.created_at ? new Date(user.created_at).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long' }) : ''

  const tabs = [
    { id: 'favorites', label: 'お気に入り', icon: '❤️' },
    { id: 'follows', label: 'フォロー', icon: '👷' },
    { id: 'saved', label: '保存', icon: '📑' },
    { id: 'chat', label: 'AI相談', icon: '💬' },
    { id: 'dm', label: 'DM', icon: '✉️' },
  ]

  const stats = [
    { label: 'お気に入り', value: 0, tab: 'favorites' },
    { label: 'フォロー', value: 0, tab: 'follows' },
    { label: '保存', value: 0, tab: 'saved' },
    { label: '相談', value: 0, tab: 'chat' },
  ]

  const renderTab = () => {
    switch (activeTab) {
      case 'favorites': return <FavoritesTab user={user} onNavigate={onNavigate} />
      case 'follows': return <FollowsTab onNavigate={onNavigate} />
      case 'saved': return <SavedTab onNavigate={onNavigate} />
      case 'chat': return <ChatHistoryTab onNavigate={onNavigate} />
      case 'dm': return <DMTab onNavigate={onNavigate} />
      default: return null
    }
  }

  return (
    <div style={{ background: C.bg, minHeight: '100vh', fontFamily: "'Noto Sans JP', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;600;700&display=swap" rel="stylesheet" />

      {/* ========== プロフィールヘッダー ========== */}
      <div style={{ background: C.navy, padding: '24px 20px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          {/* アバター */}
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: C.gold, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0, border: '3px solid rgba(255,255,255,0.3)' }}>
            👤
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ color: '#fff', fontSize: 17, fontWeight: 700, margin: '0 0 2px' }}>{name} さん</p>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <span style={{ background: C.gold, color: C.navy, fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 10, whiteSpace: 'nowrap' }}>{memberType}</span>
              {joinDate && <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11 }}>登録 {joinDate}</span>}
            </div>
          </div>
          <button onClick={onLogout}
            style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: 'none', borderRadius: 8, padding: '7px 14px', fontSize: 12, cursor: 'pointer', flexShrink: 0 }}>
            ログアウト
          </button>
        </div>

        {/* AIステータス */}
        <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: '10px 14px', marginBottom: 16 }}>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, margin: '0 0 2px' }}>AI診断ステータス</p>
          <p style={{ color: '#fff', fontSize: 13, fontWeight: 600, margin: 0 }}>🏠 物件検討中</p>
        </div>

        {/* 数値カウンター（TikTok風） */}
        <div style={{ display: 'flex', gap: 0 }}>
          {stats.map((s, i) => (
            <button key={s.tab} onClick={() => setActiveTab(s.tab)}
              style={{ flex: 1, background: 'none', border: 'none', borderRight: i < stats.length - 1 ? '1px solid rgba(255,255,255,0.15)' : 'none', cursor: 'pointer', padding: '8px 0', textAlign: 'center' }}>
              <p style={{ color: '#fff', fontSize: 18, fontWeight: 700, margin: '0 0 2px' }}>{s.value}</p>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 10, margin: 0 }}>{s.label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* ========== タブ ========== */}
      <div style={{ background: C.card, borderBottom: `1px solid ${C.border}`, overflowX: 'auto', whiteSpace: 'nowrap' }}>
        <div style={{ display: 'inline-flex', minWidth: '100%' }}>
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{ flex: '1 0 auto', minWidth: 80, background: 'none', border: 'none', borderBottom: activeTab === tab.id ? `2px solid ${C.navy}` : '2px solid transparent', color: activeTab === tab.id ? C.navy : C.desc, fontSize: 12, fontWeight: activeTab === tab.id ? 700 : 400, padding: '12px 8px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, transition: 'all 0.2s' }}>
              <span style={{ fontSize: 16 }}>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ========== コンテンツ ========== */}
      {isMobile ? (
        // スマホ：1カラム
        <div style={{ paddingBottom: 80 }}>
          {renderTab()}
        </div>
      ) : (
        // PC：2カラム
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20, padding: '20px', maxWidth: 900, margin: '0 auto' }}>
          <div style={{ background: C.card, borderRadius: 16, overflow: 'hidden', border: `1px solid ${C.border}` }}>
            {renderTab()}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <NextActionCard onNavigate={onNavigate} />
            {/* 会員情報編集 */}
            <div style={{ background: C.card, borderRadius: 16, padding: '16px', border: `1px solid ${C.border}` }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: C.navy, margin: '0 0 12px' }}>⚙️ メニュー</p>
              {menuItems.map((item) => (
                <button key={item.label} onClick={item.onClick}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', background: 'none', border: 'none', borderBottom: `1px solid ${C.border}`, padding: '10px 0', cursor: 'pointer', color: C.title, fontSize: 13 }}>
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                  <span style={{ marginLeft: 'auto', color: C.desc }}>→</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========== スマホ下部ナビ ========== */}
      {isMobile && (
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#fff', borderTop: `1px solid ${C.border}`, display: 'flex', zIndex: 100 }}>
          {[
            { icon: '🏠', label: 'ホーム', tab: 'home' },
            { icon: '🏡', label: '物件', tab: 'properties' },
            { icon: '💬', label: 'AI相談', tab: 'chat', highlight: true },
            { icon: '🏘️', label: 'コミュニティ', tab: 'community' },
            { icon: '👤', label: 'マイページ', tab: 'member' },
          ].map((item) => (
            <button key={item.tab} onClick={() => item.tab === 'member' ? null : onNavigate(item.tab)}
              style={{ flex: 1, background: item.highlight ? C.navy : 'none', border: 'none', padding: item.highlight ? '10px 0' : '10px 0', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <span style={{ fontSize: item.highlight ? 22 : 18 }}>{item.icon}</span>
              <span style={{ fontSize: 9, color: item.highlight ? '#fff' : item.tab === 'member' ? C.navy : C.desc, fontWeight: item.tab === 'member' ? 700 : 400 }}>{item.label}</span>
            </button>
          ))}
        </div>
      )}

      {showEditProfile && <EditProfileModal user={user} onClose={() => setShowEditProfile(false)} />}
      {showNotification && <NotificationModal onClose={() => setShowNotification(false)} />}
      {showGuide && <GuideModal onClose={() => setShowGuide(false)} />}
    </div>
  )
}
