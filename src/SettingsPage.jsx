import { useState, useEffect, useRef } from 'react'
import { supabase } from './supabaseClient'
import WorkspaceNav from './WorkspaceNav'
import MobileHeader from './MobileHeader'
import FeedbackModal from './FeedbackModal'
import { User, Building2, Bell, FileText, LogOut } from 'lucide-react'

const glass = {
  background: 'rgba(15,23,42,0.85)',
  border: '1px solid rgba(255,255,255,0.08)',
  boxShadow: '0 0 30px rgba(201,168,76,0.15)',
}

const TABS = [
  { key: 'account',       label: 'アカウント',     Icon: User },
  { key: 'org',           label: '組織',           Icon: Building2 },
  { key: 'notifications', label: '通知',           Icon: Bell },
  { key: 'legal',         label: '法務・サポート', Icon: FileText },
]

function readTabFromUrl() {
  const t = new URLSearchParams(window.location.search).get('tab')
  return TABS.some(x => x.key === t) ? t : 'account'
}

/* 準備中の項目。操作できないことが分かるよう、ボタンは置かずラベルのみ表示する */
function PendingRow({ label, note, isLast = false }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, padding: '14px 0', borderBottom: isLast ? 'none' : '1px solid rgba(255,255,255,0.06)' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 400, color: '#94A3B8', wordBreak: 'break-all', overflowWrap: 'anywhere' }}>{label}</div>
        {note ? (
          <div style={{ fontSize: 12, fontWeight: 400, color: '#64748B', marginTop: 4 }}>{note}</div>
        ) : null}
      </div>
      <span style={{ flexShrink: 0, fontSize: 11, fontWeight: 400, color: '#64748B', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, padding: '4px 8px' }}>準備中</span>
    </div>
  )
}

function SectionCard({ title, description, children }) {
  return (
    <div style={{ ...glass, borderRadius: 14, padding: 20, marginBottom: 16, boxSizing: 'border-box' }}>
      <div style={{ fontSize: 15, fontWeight: 500, color: '#E2E8F0' }}>{title}</div>
      {description ? (
        <div style={{ fontSize: 12, fontWeight: 400, color: '#64748B', marginTop: 6 }}>{description}</div>
      ) : null}
      <div style={{ marginTop: 12 }}>{children}</div>
    </div>
  )
}

export default function SettingsPage() {
  const [tab, setTab] = useState(typeof window !== 'undefined' ? readTabFromUrl() : 'account')
  const [isNarrow, setIsNarrow] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false)
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState(null)
  const [email, setEmail] = useState('')
  const [org, setOrg] = useState(null)
  const [isOrgOwner, setIsOrgOwner] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const headerRef = useRef(null)
  const [headerHeight, setHeaderHeight] = useState(110)

  useEffect(() => {
    const onResize = () => setIsNarrow(window.innerWidth < 768)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // モバイル時のみ、MobileHeader の実高さを測って main の paddingTop に反映する
  useEffect(() => {
    if (!isNarrow) return
    const wrap = headerRef.current
    if (!wrap) return
    // MobileHeader のルートは position: fixed のため、包んだ div 自体の高さは 0 になる。
    // 実際の高さは中の固定ヘッダー要素から測る。
    const target = wrap.firstElementChild || wrap
    const measure = () => {
      const h = target.offsetHeight
      if (h > 0) setHeaderHeight(h)
    }
    measure()
    let observer = null
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(measure)
      observer.observe(target)
    }
    window.addEventListener('resize', measure)
    return () => {
      if (observer) observer.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [isNarrow])

  useEffect(() => {
    let mounted = true
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!mounted) return
      const uid = user ? user.id : null
      setCurrentUserId(uid)
      setEmail(user ? (user.email || '') : '')
      // WorkspacePage と同じ読み取り（新規のDBアクセスではない）
      const { data: orgData } = await supabase.from('organizations').select('id, name, owner_id').maybeSingle()
      if (!mounted) return
      setOrg(orgData || null)
      setIsOrgOwner(orgData ? (uid ? orgData.owner_id === uid : false) : false)
      setLoading(false)
    }
    load()
    return () => { mounted = false }
  }, [])

  const selectTab = (key) => {
    setTab(key)
    window.history.replaceState(null, '', '/settings?tab=' + key)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.replace('/login')
  }

  const linkRowStyle = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, width: '100%', background: 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '14px 0', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0A0F1E 0%, #0F172A 100%)', color: '#E2E8F0', fontFamily: "'Noto Sans JP', sans-serif" }}>

      {isNarrow ? (
        <div ref={headerRef}>
          <MobileHeader current="/settings" pageTitle="設定" />
        </div>
      ) : (
        <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, height: 64, background: 'rgba(10,15,30,0.95)', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: 12, padding: '0 24px', boxSizing: 'border-box', overflowX: 'auto' }}>
          <img src="/logo.png" alt="HOUSE-AI" style={{ height: 34, objectFit: 'contain', flexShrink: 0, filter: 'drop-shadow(0 0 8px rgba(201,168,76,0.6))' }} />
          <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.15)', flexShrink: 0 }} />
          <div style={{ fontSize: 14, fontWeight: 500, color: '#E2E8F0', whiteSpace: 'nowrap', flexShrink: 0 }}>設定</div>
          <WorkspaceNav current="/settings" />
        </header>
      )}

      <main style={{ paddingTop: isNarrow ? headerHeight + 8 : 80, paddingBottom: 40, paddingLeft: 24, paddingRight: 24, maxWidth: 1000, margin: '0 auto', boxSizing: 'border-box' }}>

        {isNarrow ? (
          /* モバイル: 上部に横並びタブ */
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', whiteSpace: 'nowrap', padding: '16px 0 12px', WebkitOverflowScrolling: 'touch' }}>
            {TABS.map(({ key, label, Icon }) => (
              <button
                key={key}
                onClick={() => selectTab(key)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  flexShrink: 0,
                  background: tab === key ? 'rgba(201,168,76,0.12)' : 'rgba(255,255,255,0.04)',
                  border: tab === key ? '1px solid rgba(201,168,76,0.4)' : '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 8,
                  padding: '8px 12px',
                  fontSize: 13,
                  fontWeight: tab === key ? 500 : 400,
                  color: tab === key ? '#c9a84c' : '#94A3B8',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                <Icon size={14} />
                {label}
              </button>
            ))}
          </div>
        ) : null}

        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', paddingTop: isNarrow ? 0 : 16 }}>

          {isNarrow ? null : (
            /* PC: 左サイドにタブ一覧 */
            <div style={{ width: 200, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
              {TABS.map(({ key, label, Icon }) => (
                <button
                  key={key}
                  onClick={() => selectTab(key)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    width: '100%',
                    background: tab === key ? 'rgba(201,168,76,0.12)' : 'transparent',
                    border: tab === key ? '1px solid rgba(201,168,76,0.35)' : '1px solid transparent',
                    borderRadius: 10,
                    padding: '10px 12px',
                    fontSize: 13,
                    fontWeight: tab === key ? 500 : 400,
                    color: tab === key ? '#c9a84c' : '#94A3B8',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontFamily: 'inherit',
                  }}
                >
                  <Icon size={15} />
                  {label}
                </button>
              ))}
            </div>
          )}

          <div style={{ flex: 1, minWidth: 0 }}>

            {/* ===== アカウント ===== */}
            {tab === 'account' ? (
              <div>
                <SectionCard title="プロフィール" description="表示名とアイコンの変更は次のリリースで対応します。">
                  <PendingRow label="プロフィール画像" />
                  <PendingRow label="表示名" isLast={true} />
                </SectionCard>

                <SectionCard title="ログイン情報">
                  <PendingRow
                    label={loading ? 'メールアドレス' : (email || 'メールアドレス')}
                    note="※変更機能は準備中"
                  />
                  <PendingRow label="パスワード変更" isLast={true} />
                </SectionCard>

                <SectionCard title="セッション">
                  <button
                    onClick={handleLogout}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, padding: '10px 16px', fontSize: 13, fontWeight: 400, color: '#E2E8F0', cursor: 'pointer', fontFamily: 'inherit' }}
                  >
                    <LogOut size={14} />
                    ログアウト
                  </button>
                </SectionCard>

                <SectionCard title="退会" description="退会の手続きは、引き継ぎと保存義務の確認を含めて設計中です。">
                  <PendingRow label="退会手続き" isLast={true} />
                </SectionCard>
              </div>
            ) : null}

            {/* ===== 組織 ===== */}
            {tab === 'org' ? (
              <div>
                {loading ? (
                  <SectionCard title="組織設定">
                    <div style={{ fontSize: 13, fontWeight: 400, color: '#64748B' }}>読み込み中...</div>
                  </SectionCard>
                ) : !isOrgOwner ? (
                  <SectionCard title="組織設定">
                    <div style={{ fontSize: 13, fontWeight: 400, color: '#64748B' }}>組織のオーナーのみ利用できます。</div>
                  </SectionCard>
                ) : (
                  <SectionCard title="会社情報" description="会社名の保存は次のリリースで対応します。">
                    <div style={{ fontSize: 12, fontWeight: 400, color: '#94A3B8', marginBottom: 8 }}>会社名</div>
                    <input
                      type="text"
                      value={org ? (org.name || '') : ''}
                      readOnly
                      disabled
                      style={{ width: '100%', boxSizing: 'border-box', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, color: '#64748B', fontSize: 16, fontWeight: 400, padding: '10px 12px', outline: 'none', fontFamily: 'inherit', cursor: 'not-allowed' }}
                    />
                    <div style={{ fontSize: 12, fontWeight: 400, color: '#64748B', marginTop: 8 }}>準備中</div>
                  </SectionCard>
                )}
              </div>
            ) : null}

            {/* ===== 通知 ===== */}
            {tab === 'notifications' ? (
              <SectionCard title="通知設定">
                <PendingRow label="未読メッセージのリマインドメール" isLast={true} />
                <div style={{ fontSize: 12, fontWeight: 400, color: '#64748B', marginTop: 12 }}>
                  案件の重要なお知らせ・招待・本人確認のメールは停止できません。
                </div>
              </SectionCard>
            ) : null}

            {/* ===== 法務・サポート ===== */}
            {tab === 'legal' ? (
              <SectionCard title="法務・サポート">
                <button
                  onClick={() => { window.open('/ws-legal', '_blank') }}
                  style={linkRowStyle}
                >
                  <span style={{ fontSize: 14, fontWeight: 400, color: '#E2E8F0' }}>利用規約</span>
                </button>
                <button
                  onClick={() => { window.open('/ws-legal?tab=privacy', '_blank') }}
                  style={linkRowStyle}
                >
                  <span style={{ fontSize: 14, fontWeight: 400, color: '#E2E8F0' }}>プライバシーポリシー</span>
                </button>
                <button
                  onClick={() => setShowFeedback(true)}
                  style={{ ...linkRowStyle, borderBottom: 'none' }}
                >
                  <span style={{ fontSize: 14, fontWeight: 400, color: '#E2E8F0' }}>ご意見・不具合報告</span>
                </button>
              </SectionCard>
            ) : null}

          </div>
        </div>
      </main>

      {showFeedback ? (
        <FeedbackModal
          onClose={() => setShowFeedback(false)}
          currentUserId={currentUserId}
          orgId={org ? org.id : null}
        />
      ) : null}
    </div>
  )
}
