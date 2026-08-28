import { useState, useEffect, useRef } from 'react'
import { heicTo } from 'heic-to'
import JSZip from 'jszip'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell, FileText,
  Check, Users, Calendar, Send, AlertCircle, X, MessageSquare, MessageCircle,
  Plus, ChevronLeft, ChevronRight, Loader, Trash2, Eye, Download, Share2, History, Image, Sparkles, Settings, Video
} from 'lucide-react'
import { supabase } from './supabaseClient'
import WorkspaceNav from './WorkspaceNav'
import { TERMS_OF_SERVICE, PRIVACY_POLICY } from './legalContent'
import MobileWorkspaceLayout from './MobileWorkspaceLayout'
import MobileHeader from './MobileHeader'
import FeedbackModal from './FeedbackModal'

function normalizeLabel(s) {
  return (s || '').trim().replace(/\s+/g, ' ')
}

const Avatar = ({ url, name, size }) => {
  const s = size || 28
  return (
    <div style={{ width: s, height: s, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {url ? (
        <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <span style={{ color: '#94A3B8', fontSize: Math.round(s * 0.45), fontWeight: 500 }}>{name ? name.charAt(0).toUpperCase() : '?'}</span>
      )}
    </div>
  )
}

const glass = {
  background: 'rgba(15,23,42,0.85)',
  border: '1px solid rgba(255,255,255,0.08)',
  boxShadow: '0 0 30px rgba(201,168,76,0.15)',
}

const ALLOWED_EXTS = ['pdf', 'png', 'jpg', 'jpeg', 'webp']
const DOC_TYPE_CANDIDATES = ['申込書', '本人確認書類', '重要事項説明書', '契約書', 'ローン事前審査', '見積書', '請求書', '領収書', '物件図面', '現場写真', 'その他']

// storage_path 用: 元ファイル名は一切使わず、ASCII安全なランダムキーを生成する
// 元ファイル名（日本語可）は ws_files.file_name にのみ保存して表示用に使う
function makeSafeStoragePath(workspaceId, ext) {
  const rand = crypto.randomUUID().replace(/-/g, '')
  return `${workspaceId}/${Date.now()}_${rand}.${ext}`
}

function extFromMime(mime) {
  const map = { 'application/pdf': 'pdf', 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp' }
  return map[mime] || 'bin'
}

function formatFileSize(bytes) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
}

const CONTRACT_TYPES = ['賃貸', '売買', '買取', '注文住宅', 'リフォーム', '外構工事', '相続', '登記', '住宅ローン', '不動産担保ローン', 'アジェンダ']
const ROLE_OPTIONS = ['お客様', '担当', '仲介業者', '司法書士', '銀行', '火災保険', 'リフォーム', '管理会社', '売主', '買主']
const PERMISSION_OPTIONS = ['Owner', 'Manager', 'Staff', 'Customer', 'Broker', 'JudicialScrivener', 'Bank', 'ReformCompany', 'Guest']
const PERMISSION_LABEL = {
  Owner: 'Owner', Manager: 'Manager', Staff: 'スタッフ', Customer: 'お客様',
  Broker: '仲介業者', JudicialScrivener: '司法書士', Bank: '金融機関', ReformCompany: 'リフォーム会社', Guest: 'Guest',
  Member: 'Member',
}
const ROLE_CANON = { owner: 'Owner', manager: 'Manager', staff: 'Staff', customer: 'Customer', broker: 'Broker', judicialscrivener: 'JudicialScrivener', bank: 'Bank', reformcompany: 'ReformCompany', guest: 'Guest', member: 'Member' }
const normRole = (r) => ROLE_CANON[String(r || '').toLowerCase()] || r
const STEP_STATES = ['未着手', '進行中', '承認待ち', '差戻し', '完了']
const MEETING_TYPE_LABEL = { internal_meeting: '社内MTG', customer_meeting: '顧客面談', online_viewing: 'オンライン内見' }
const MEETING_STATUS_LABEL = { scheduled: '予定', live: '進行中', ended: '終了', cancelled: '中止' }
const MEETING_CLOSED_STATUSES = ['cancelled', 'ended']

function formatMeetingAt(iso) {
  if (!iso) return '日時未定'
  const d = new Date(iso)
  if (isNaN(d.getTime())) return '日時未定'
  const hh = String(d.getHours()).padStart(2, '0')
  const mi = String(d.getMinutes()).padStart(2, '0')
  return `${d.getMonth() + 1}/${d.getDate()} ${hh}:${mi}`
}

const ROADMAP_TEMPLATES = {
  '賃貸':     ['問い合わせ', '内見', '申込', '保証会社審査', '契約', '入金', '鍵渡し', '完了'],
  '売買':     ['問い合わせ', '内見', '購入申込', 'ローン事前審査', 'ローン本審査', '契約', '決済', '登記', '引渡し', '完了'],
  'リフォーム': ['現地調査', '見積', '契約', '着工', '中間確認', '完工', '引渡し', '完了'],
}
const ROADMAP_DEFAULT = ['問い合わせ', '契約', '完了']

function getRoadmapLabels(contractType) {
  return ROADMAP_TEMPLATES[contractType] || ROADMAP_DEFAULT
}

function formatDate(iso) {
  if (!iso) return '-'
  const d = new Date(iso)
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`
}

function formatEventDate(dateStr) {
  if (!dateStr) return ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const parts = dateStr.split('-')
    return `${parseInt(parts[1])}/${parseInt(parts[2])}`
  }
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

function stepDotType(state) {
  if (state === '完了')    return 'done'
  if (state === '進行中')  return 'active'
  if (state === '承認待ち') return 'waiting'
  if (state === '差戻し')  return 'rejected'
  return 'pending'
}

function stepLabelColor(state) {
  if (state === '完了')    return '#c9a84c'
  if (state === '進行中')  return '#60A5FA'
  if (state === '承認待ち') return '#FCD34D'
  if (state === '差戻し')  return '#F87171'
  return '#475569'
}

function noticeStyle(level) {
  if (level === 'danger' || level === 'urgent' || level === 'high')
    return { bg: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.22)', iconColor: '#F87171', textColor: '#FCA5A5' }
  if (level === 'warning')
    return { bg: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.22)', iconColor: '#FCD34D', textColor: '#FDE68A' }
  return { bg: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', iconColor: '#64748B', textColor: '#94A3B8' }
}

function permissionStyle(p) {
  const n = normRole(p)
  if (n === 'Owner')             return { bg: 'rgba(201,168,76,0.14)',  color: '#c9a84c',  border: '1px solid rgba(201,168,76,0.25)' }
  if (n === 'Manager')           return { bg: 'rgba(59,130,246,0.14)',  color: '#60A5FA',  border: '1px solid rgba(59,130,246,0.25)' }
  if (n === 'Staff')             return { bg: 'rgba(100,116,139,0.14)', color: '#94A3B8',  border: '1px solid rgba(100,116,139,0.25)' }
  if (n === 'Customer')          return { bg: 'rgba(45,212,191,0.12)',  color: '#2dd4bf',  border: '1px solid rgba(45,212,191,0.25)' }
  if (n === 'Broker')            return { bg: 'rgba(251,146,60,0.12)',  color: '#fb923c',  border: '1px solid rgba(251,146,60,0.25)' }
  if (n === 'JudicialScrivener') return { bg: 'rgba(139,92,246,0.12)',  color: '#a78bfa',  border: '1px solid rgba(139,92,246,0.25)' }
  if (n === 'Bank')              return { bg: 'rgba(56,189,248,0.12)',  color: '#38bdf8',  border: '1px solid rgba(56,189,248,0.25)' }
  if (n === 'ReformCompany')     return { bg: 'rgba(52,211,153,0.12)',  color: '#34d399',  border: '1px solid rgba(52,211,153,0.25)' }
  if (n === 'Guest')             return { bg: 'rgba(99,102,241,0.14)',  color: '#818CF8',  border: '1px solid rgba(99,102,241,0.25)' }
  return { bg: 'rgba(255,255,255,0.07)', color: '#94A3B8', border: '1px solid rgba(255,255,255,0.1)' }
}

// ===================== メインエントリ =====================

export default function WorkspacePage() {
  const workspaceId = new URLSearchParams(window.location.search).get('id')
  const previewMobile = new URLSearchParams(window.location.search).get('preview_mobile') === '1'
  const [isMobile, setIsMobile] = useState(() => window.matchMedia('(max-width: 768px)').matches)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)')
    const handler = (e) => setIsMobile(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  return (isMobile && workspaceId) ? <MobileWorkspaceLayout /> : (workspaceId ? <DashboardView id={workspaceId} /> : <ListView />)
}

// ===================== 案件一覧 =====================

function ListView() {
  const [workspaces, setWorkspaces] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [currentUserId, setCurrentUserId] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [ownedOrgId, setOwnedOrgId] = useState(null)
  const [org, setOrg] = useState(null)
  const [showOrgSettings, setShowOrgSettings] = useState(false)
  const [orgOnboardingDismissed, setOrgOnboardingDismissed] = useState(false)
  const [isNarrow, setIsNarrow] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false)
  const [unreadMap, setUnreadMap] = useState({})

  useEffect(() => {
    const onResize = () => setIsNarrow(window.innerWidth < 768)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    async function fetchFiltered() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { setWorkspaces([]); setLoading(false); return }
      const userId = session.user.id
      setCurrentUserId(userId)
      const { data: orgData } = await supabase.from('organizations').select('id, name, owner_id').maybeSingle()
      const owned = (orgData && orgData.owner_id === userId) ? orgData.id : null
      setOwnedOrgId(owned)
      setIsAdmin(!!owned)
      setOrg(orgData && orgData.owner_id === userId ? { id: orgData.id, name: orgData.name } : null)
      const { data: memberships } = await supabase
        .from('workspace_members')
        .select('workspace_id')
        .eq('user_id', userId)
        .eq('status', 'active')
      const ids = (memberships || []).map(m => m.workspace_id)
      if (ids.length === 0) { setWorkspaces([]); setLoading(false); return }
      const { data: wsData } = await supabase
        .from('workspaces')
        .select('*')
        .in('id', ids)
        .is('deleted_at', null)
        .order('updated_at', { ascending: false })
      setWorkspaces(wsData || [])
      setLoading(false)
    }
    fetchFiltered()
  }, [])

  useEffect(() => {
    async function fetchUnread() {
      try {
        const { data } = await supabase.rpc('get_workspace_unread_counts')
        if (data) {
          const map = {}
          data.forEach(row => { map[row.workspace_id] = row.unread })
          setUnreadMap(map)
        }
      } catch (e) {}
    }
    fetchUnread()
  }, [])

  const isOrgOwnerOf = (row) => Boolean(ownedOrgId) && row.org_id === ownedOrgId
  const canDelete = (ws) => isOrgOwnerOf(ws) || (ws.created_by ? (ws.created_by === currentUserId && ws.status !== '完了') : false)

  async function handleDelete(e, ws) {
    e.stopPropagation()
    const ok = window.confirm('「' + (ws.title || '無題') + '」を削除しますか？\n削除すると一覧から消えます（管理者は後で復元できます）。')
    if (!ok) { return }
    const { error } = await supabase.from('workspaces').update({ deleted_at: new Date().toISOString() }).eq('id', ws.id)
    if (error) {
      window.alert('削除できませんでした。権限がない可能性があります。')
      return
    }
    setWorkspaces(prev => prev.filter(x => x.id !== ws.id))
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0A0F1E 0%, #0F172A 100%)', color: '#E2E8F0', fontFamily: "'Noto Sans JP', sans-serif" }}>
      {isNarrow ? (
        <MobileHeader
          current="/workspace"
          pageTitle="案件一覧"
          actions={(
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {org !== null ? (
                <button onClick={() => setShowOrgSettings(true)} title="組織設定" style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, padding: '6px 10px', fontSize: 11, fontWeight: 400, cursor: 'pointer', color: '#94A3B8' }}>
                  <Settings size={12} />
                </button>
              ) : null}
              <button onClick={() => setShowCreate(true)} style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#c9a84c', color: '#0A0F1E', border: 'none', borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>
                <Plus size={13} />
                新規
              </button>
            </div>
          )}
        />
      ) : (
        <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, height: 64, background: 'rgba(10,15,30,0.78)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: 12, padding: '0 24px', boxSizing: 'border-box', overflowX: 'auto' }}>
          <img src="/logo.png" alt="HOUSE-AI" style={{ height: 34, objectFit: 'contain', flexShrink: 0, filter: 'drop-shadow(0 0 8px rgba(201,168,76,0.6))' }} />
          <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.15)', flexShrink: 0 }} />
          <div style={{ fontSize: 14, fontWeight: 500, color: '#E2E8F0', whiteSpace: 'nowrap', flexShrink: 0 }}>House-AI Workspace</div>
          <WorkspaceNav current="/workspace" />
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
            {org !== null ? (
              <button onClick={() => setShowOrgSettings(true)} title="組織設定" style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, padding: '7px 12px', fontSize: 12, fontWeight: 400, cursor: 'pointer', color: '#94A3B8' }}>
                <Settings size={13} />
                組織設定
              </button>
            ) : null}
            <button onClick={() => setShowCreate(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#c9a84c', color: '#0A0F1E', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
              <Plus size={15} />
              新規案件作成
            </button>
          </div>
        </header>
      )}
      <main style={{ paddingTop: isNarrow ? 110 : 80, paddingBottom: 40, paddingLeft: 24, paddingRight: 24, maxWidth: 1200, margin: '0 auto', boxSizing: 'border-box' }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: 12 }}>
            <Loader size={20} color="#c9a84c" />
            <span style={{ color: '#64748B', fontSize: 14, fontWeight: 400 }}>読み込み中...</span>
          </div>
        ) : workspaces.length === 0 ? (
          <div style={{ textAlign: 'center', paddingTop: 80 }}>
            <div style={{ fontSize: 14, color: '#64748B', fontWeight: 400, marginBottom: 24 }}>表示できる案件がありません。</div>
            <button onClick={() => setShowCreate(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#c9a84c', color: '#0A0F1E', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
              <Plus size={16} />新規案件作成
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16, paddingTop: 8 }}>
            {workspaces.map(ws => {
              const unread = unreadMap[ws.id] || 0
              return (
              <div key={ws.id} onClick={() => { window.location.href = `/workspace?id=${ws.id}` }} style={{ ...glass, position: 'relative', borderRadius: 14, padding: 20, cursor: 'pointer', border: ws.status === '完了' ? '1px solid rgba(212,175,55,0.5)' : ws.status === '進行中' ? '1px solid rgba(56,189,248,0.5)' : glass.border, boxShadow: ws.status === '完了' ? '0 0 30px rgba(212,175,55,0.25)' : ws.status === '進行中' ? '0 0 30px rgba(56,189,248,0.25)' : glass.boxShadow }}>
                {unread > 0 ? (
                  <div style={{ position: 'absolute', top: -6, right: -6, minWidth: 18, height: 18, background: '#EF4444', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px', boxSizing: 'border-box' }}>
                    <span style={{ fontSize: 9, color: '#fff', fontWeight: 500 }}>{unread > 9 ? '9+' : unread}</span>
                  </div>
                ) : null}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, color: '#E2E8F0', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ws.title || '-'}</div>
                    <div style={{ fontSize: 10, color: '#c9a84c', fontWeight: 400, letterSpacing: 1 }}>{ws.ws_code || '-'}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 8, flexShrink: 0 }}>
                    <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, fontWeight: 400, background: 'rgba(201,168,76,0.12)', color: '#c9a84c', border: '1px solid rgba(201,168,76,0.3)', whiteSpace: 'nowrap' }}>{ws.status || '-'}</span>
                    {canDelete(ws) ? (
                      <button onClick={(e) => handleDelete(e, ws)} title="削除" style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center', color: '#64748B', borderRadius: 6 }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                          <path d="M10 11v6M14 11v6" />
                          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                        </svg>
                      </button>
                    ) : null}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 16, marginBottom: 14, flexWrap: 'wrap' }}>
                  {[{ label: '顧客', value: ws.customer_name }, { label: '担当', value: ws.agent_name }, { label: '契約種別', value: ws.contract_type }].map(item => (
                    <div key={item.label}>
                      <div style={{ fontSize: 9, color: '#64748B', fontWeight: 400, marginBottom: 2 }}>{item.label}</div>
                      <div style={{ fontSize: 12, color: '#CBD5E1', fontWeight: 400 }}>{item.value || '-'}</div>
                    </div>
                  ))}
                </div>
                <div style={{ marginBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 10, color: '#64748B', fontWeight: 400 }}>進捗</span>
                    <span style={{ fontSize: 10, color: '#c9a84c', fontWeight: 500 }}>{ws.progress || 0}%</span>
                  </div>
                  <div style={{ height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${ws.progress || 0}%`, background: 'linear-gradient(90deg, #c9a84c, #D4AF37)', borderRadius: 2 }} />
                  </div>
                </div>
                <div style={{ fontSize: 10, color: '#475569', fontWeight: 400 }}>最終更新: {formatDate(ws.updated_at)}</div>
              </div>
            )
            })}
          </div>
        )}
      </main>
      {showCreate ? <CreateModal onClose={() => setShowCreate(false)} onCreated={(id) => { window.location.href = `/workspace?id=${id}` }} /> : null}
      {showOrgSettings && org ? <OrgSettingsModal org={org} onClose={() => setShowOrgSettings(false)} onSaved={(newName) => { setOrg(prev => ({ ...prev, name: newName })); setShowOrgSettings(false) }} /> : null}
      {org && org.name === '個人ワークスペース' && !orgOnboardingDismissed ? (
        <OrgOnboardingModal
          org={org}
          onClose={() => setOrgOnboardingDismissed(true)}
          onSaved={(newName) => { setOrg(prev => ({ ...prev, name: newName })) }}
        />
      ) : null}
    </div>
  )
}

// ===================== 新規作成モーダル =====================

function CreateModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ title: '', customer_name: '', agent_name: '', contract_type: '売買', property_address: '', customer_email: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [inviteFailed, setInviteFailed] = useState(false)
  const [createdWsId, setCreatedWsId] = useState(null)

  const handleChange = (key, value) => setForm(prev => ({ ...prev, [key]: value }))

  const handleSubmit = async () => {
    if (!form.title || !form.customer_name || !form.contract_type) { setError('案件名・顧客名・契約種別は必須です。'); return }
    const custEmail = (form.customer_email || '').trim().toLowerCase()
    if (custEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(custEmail)) { setError('お客様メールアドレスの形式が正しくありません。'); return }
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { setError('ログインの有効期限が切れています。ログアウトして入り直してください。'); setSubmitting(false); return }
    setSubmitting(true); setError('')
    try {
      // org を持たないユーザーは、案件作成の前に自分専用の org を発行（workspaces の INSERT RLS が current_org_id() IS NOT NULL を要求するため）
      const { error: ensureOrgError } = await supabase.rpc('ensure_org_for_current_user')
      if (ensureOrgError) { setError('組織の準備に失敗しました。' + (ensureOrgError.message || '')); setSubmitting(false); return }
      const newId = crypto.randomUUID()
      const codeRes = await supabase.rpc('next_workspace_code')
      if (codeRes.error) { setError('案件番号の採番に失敗しました。' + (codeRes.error.message || '')); setSubmitting(false); return }
      const wsCode = codeRes.data
      const { error: wsErr } = await supabase.from('workspaces').insert({
        id: newId, ws_code: wsCode, title: form.title, customer_name: form.customer_name,
        agent_name: form.agent_name, contract_type: form.contract_type,
        property_address: form.property_address, status: '進行中', progress: 0,
      })
      if (wsErr) throw wsErr
      const labels = getRoadmapLabels(form.contract_type)
      await supabase.from('roadmap_steps').insert(labels.map((label, i) => ({ workspace_id: newId, step_order: i + 1, label, state: i === 0 ? '進行中' : '未着手' })))
      await supabase.from('ws_file_folders').insert([
        { workspace_id: newId, role_label: '自社（不動産）', is_fixed: true, sort_order: 0 },
        { workspace_id: newId, role_label: '顧客', is_fixed: true, sort_order: 1 },
      ])
      await supabase.from('workspace_members').insert({
        workspace_id: newId,
        user_id: session.user.id,
        email: session.user.email || '',
        role: 'Owner',
        status: 'active',
        invited_by: session.user.id,
      })
      if (custEmail) {
        try {
          await supabase.from('workspace_members').insert({
            id: crypto.randomUUID(),
            workspace_id: newId,
            email: custEmail,
            role: 'Customer',
            status: 'pending',
            invited_by: session.user.id,
            display_name: form.customer_name || '',
          })
          await supabase.auth.signInWithOtp({ email: custEmail, options: { emailRedirectTo: 'https://house-ai.co.jp/workspace', shouldCreateUser: true } })
          onCreated(newId)
        } catch (_inviteErr) {
          setCreatedWsId(newId)
          setInviteFailed(true)
          setSubmitting(false)
        }
      } else {
        onCreated(newId)
      }
    } catch (e) { setError('作成に失敗しました。' + (e.message || '')); setSubmitting(false) }
  }

  const inputStyle = { fontSize: 16, fontWeight: 400, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#E2E8F0', padding: '10px 14px', borderRadius: 8, width: '100%', boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit' }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.72)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ ...glass, borderRadius: 16, padding: 28, width: '100%', maxWidth: 480, maxHeight: 'calc(100vh - 40px)', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div style={{ fontSize: 15, fontWeight: 500, color: '#E2E8F0' }}>新規案件作成</div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4 }}><X size={18} color="#64748B" /></button>
        </div>
        {inviteFailed ? (
          <div>
            <div style={{ fontSize: 13, color: '#E2E8F0', fontWeight: 400, lineHeight: 1.7, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '16px 18px', marginBottom: 20 }}>
              案件は作成されました。ただしお客様への招待メール送信に失敗しました（通信状況や送信回数制限の可能性があります）。案件を開いて「メンバー招待」から再送できます。
            </div>
            <button onClick={() => onCreated(createdWsId)} style={{ width: '100%', background: '#c9a84c', color: '#0A0F1E', border: 'none', borderRadius: 8, padding: '11px', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>案件を開く</button>
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div><div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 6, fontWeight: 400 }}>案件名 *</div><input type="text" value={form.title} onChange={e => handleChange('title', e.target.value)} placeholder="例：山田様 さいたま市〇〇マンション購入" style={inputStyle} /></div>
              <div><div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 6, fontWeight: 400 }}>顧客名 *</div><input type="text" value={form.customer_name} onChange={e => handleChange('customer_name', e.target.value)} placeholder="例：山田太郎" style={inputStyle} /></div>
              <div><div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 6, fontWeight: 400 }}>担当</div><input type="text" value={form.agent_name} onChange={e => handleChange('agent_name', e.target.value)} placeholder="例：自社スタッフ" style={inputStyle} /></div>
              <div><div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 6, fontWeight: 400 }}>契約種別 *</div>
                <select value={form.contract_type} onChange={e => handleChange('contract_type', e.target.value)} style={{ ...inputStyle, appearance: 'none', WebkitAppearance: 'none' }}>
                  {CONTRACT_TYPES.map(t => <option key={t} value={t} style={{ background: '#0F172A' }}>{t}</option>)}
                </select>
              </div>
              <div><div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 6, fontWeight: 400 }}>物件住所</div><input type="text" value={form.property_address} onChange={e => handleChange('property_address', e.target.value)} placeholder="例：さいたま市大宮区〇〇" style={inputStyle} /></div>
              <div>
                <div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 6, fontWeight: 400 }}>お客様メールアドレス（任意）</div>
                <input type="text" value={form.customer_email} onChange={e => handleChange('customer_email', e.target.value)} placeholder="例：yamada@example.com" style={inputStyle} />
                <div style={{ fontSize: 11, color: '#475569', fontWeight: 400, marginTop: 6, lineHeight: 1.6 }}>入力すると、案件作成と同時にお客様へ招待メール（マジックリンク）を送ります。空欄なら送りません。</div>
              </div>
            </div>
            {error ? <div style={{ marginTop: 12, fontSize: 12, color: '#F87171', fontWeight: 400 }}>{error}</div> : null}
            <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
              <button onClick={onClose} style={{ flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#94A3B8', borderRadius: 8, padding: '10px', fontSize: 14, fontWeight: 400, cursor: 'pointer' }}>キャンセル</button>
              <button onClick={handleSubmit} style={{ flex: 1, background: submitting ? 'rgba(201,168,76,0.5)' : '#c9a84c', color: '#0A0F1E', border: 'none', borderRadius: 8, padding: '10px', fontSize: 14, fontWeight: 500, cursor: submitting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                {submitting ? <Loader size={14} /> : null}作成
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ===================== 組織設定モーダル =====================

function OrgSettingsModal({ org, onClose, onSaved }) {
  const [name, setName] = useState(org.name || '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSave = async () => {
    const trimmed = name.trim()
    if (!trimmed) { setError('会社名を入力してください。'); return }
    setSaving(true); setError('')
    const { error: updErr } = await supabase.from('organizations').update({ name: trimmed }).eq('id', org.id)
    if (updErr) { setError('保存に失敗しました。' + (updErr.message || '')); setSaving(false); return }
    onSaved(trimmed)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.72)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: 'rgba(15,23,42,0.85)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 0 30px rgba(201,168,76,0.15)', borderRadius: 16, padding: 28, width: '100%', maxWidth: 440 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div style={{ fontSize: 15, fontWeight: 500, color: '#E2E8F0' }}>組織設定</div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4 }}><X size={18} color="#64748B" /></button>
        </div>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 6, fontWeight: 400 }}>会社名</div>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="例：〇〇不動産株式会社"
            style={{ fontSize: 16, fontWeight: 400, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#E2E8F0', padding: '10px 14px', borderRadius: 8, width: '100%', boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit' }}
          />
        </div>
        {error ? <div style={{ marginBottom: 12, fontSize: 12, color: '#F87171', fontWeight: 400 }}>{error}</div> : null}
        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
          <button onClick={onClose} style={{ flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#94A3B8', borderRadius: 8, padding: '10px', fontSize: 14, fontWeight: 400, cursor: 'pointer' }}>キャンセル</button>
          <button onClick={handleSave} style={{ flex: 1, background: saving ? 'rgba(201,168,76,0.5)' : '#c9a84c', color: '#0A0F1E', border: 'none', borderRadius: 8, padding: '10px', fontSize: 14, fontWeight: 500, cursor: saving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            {saving ? <Loader size={14} /> : null}保存
          </button>
        </div>
      </div>
    </div>
  )
}

// ===================== 会社名オンボーディングモーダル =====================

function OrgOnboardingModal({ org, onClose, onSaved }) {
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSave = async () => {
    const trimmed = name.trim()
    if (!trimmed) { setError('会社名を入力してください。'); return }
    setSaving(true); setError('')
    const { error: updErr } = await supabase.from('organizations').update({ name: trimmed }).eq('id', org.id)
    if (updErr) { setError('保存に失敗しました。' + (updErr.message || '')); setSaving(false); return }
    onSaved(trimmed)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.72)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: 'rgba(15,23,42,0.85)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 0 30px rgba(201,168,76,0.15)', borderRadius: 16, padding: 28, width: '100%', maxWidth: 440 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ fontSize: 15, fontWeight: 500, color: '#E2E8F0' }}>会社名を登録してください</div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4 }}><X size={18} color="#64748B" /></button>
        </div>
        <div style={{ fontSize: 12, color: '#94A3B8', fontWeight: 400, lineHeight: 1.7, marginBottom: 20 }}>
          会社名を登録すると、チーム招待や案件共有がスムーズになります。
        </div>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 6, fontWeight: 400 }}>会社名</div>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="例：〇〇不動産株式会社"
            autoFocus
            style={{ fontSize: 16, fontWeight: 400, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#E2E8F0', padding: '10px 14px', borderRadius: 8, width: '100%', boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit' }}
          />
        </div>
        {error ? <div style={{ marginBottom: 12, fontSize: 12, color: '#F87171', fontWeight: 400 }}>{error}</div> : null}
        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
          <button onClick={onClose} style={{ flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#94A3B8', borderRadius: 8, padding: '10px', fontSize: 14, fontWeight: 400, cursor: 'pointer' }}>後で登録する</button>
          <button
            onClick={handleSave}
            disabled={!name.trim() || saving}
            style={{ flex: 1, background: saving ? 'rgba(201,168,76,0.5)' : '#c9a84c', color: '#0A0F1E', border: 'none', borderRadius: 8, padding: '10px', fontSize: 14, fontWeight: 500, cursor: (!name.trim() || saving) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, opacity: !name.trim() ? 0.45 : 1 }}
          >
            {saving ? <Loader size={14} /> : null}保存
          </button>
        </div>
      </div>
    </div>
  )
}

// ===================== 個別ダッシュボード =====================

function DashboardView({ id }) {
  const [workspace, setWorkspace] = useState(null)
  const [steps, setSteps] = useState([])
  const [members, setMembers] = useState([])
  const [timeline, setTimeline] = useState([])
  const [schedule, setSchedule] = useState([])
  const [notices, setNotices] = useState([])
  const [wsFiles, setWsFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [chatInput, setChatInput] = useState('')
  const [secretaryOpen, setSecretaryOpen] = useState(true)
  const [chatMessages, setChatMessages] = useState([])
  const [isSending, setIsSending] = useState(false)
  const [activeChatTab, setActiveChatTab] = useState('ai')
  const [memberMessages, setMemberMessages] = useState([])
  const [memberInput, setMemberInput] = useState('')
  const [isMemberSending, setIsMemberSending] = useState(false)
  const [chatReads, setChatReads] = useState([])
  const [bellChatMessages, setBellChatMessages] = useState([])
  const [bellChatReads, setBellChatReads] = useState([])
  const [bellNoticeReads, setBellNoticeReads] = useState([])

  // 編集UI用 state
  const [activeStepPopover, setActiveStepPopover] = useState(null)
  const [showMemberForm, setShowMemberForm] = useState(false)
  const [memberForm, setMemberForm] = useState({ name: '', role_label: 'お客様', permission: 'Staff' })
  const [showTimelineForm, setShowTimelineForm] = useState(false)
  const [timelineForm, setTimelineForm] = useState({ event_date: '', label: '' })
  const [showScheduleForm, setShowScheduleForm] = useState(false)
  const [scheduleForm, setScheduleForm] = useState({ scheduled_date: '', label: '' })
  const [meetings, setMeetings] = useState([])
  const [showMeetingForm, setShowMeetingForm] = useState(false)
  const [meetingTitle, setMeetingTitle] = useState('')
  const [meetingType, setMeetingType] = useState('internal_meeting')
  const [meetingDate, setMeetingDate] = useState('')
  const [meetingTime, setMeetingTime] = useState('')
  const [meetingGuest, setMeetingGuest] = useState(false)
  const [meetingBusy, setMeetingBusy] = useState(false)
  const [meetingError, setMeetingError] = useState('')
  const [guestUrl, setGuestUrl] = useState('')
  const [showNoticeForm, setShowNoticeForm] = useState(false)
  const [noticeForm, setNoticeForm] = useState({ level: 'info', message: '' })
  const [showLogoMenu, setShowLogoMenu] = useState(false)
  const [legalModal, setLegalModal] = useState(null)
  const [showAvatarModal, setShowAvatarModal] = useState(false)
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const [myAvatarUrl, setMyAvatarUrl] = useState(null)
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [avatarError, setAvatarError] = useState('')
  const [avatarMap, setAvatarMap] = useState({})
  const [showNotices, setShowNotices] = useState(false)
  const [readNoticeIds, setReadNoticeIds] = useState(() => {
    try {
      const raw = localStorage.getItem('houseai_notices_read_' + currentUserId + '_' + id)
      return raw ? JSON.parse(raw) : []
    } catch (e) { return [] }
  })
  // insert失敗時にフォーム内に表示するエラー文言
  const [memberError, setMemberError] = useState('')
  const [timelineError, setTimelineError] = useState('')
  const [scheduleError, setScheduleError] = useState('')
  const [noticeError, setNoticeError] = useState('')
  // 家カルテ昇格用
  const [promoting, setPromoting] = useState(false)
  const [promoteMessage, setPromoteMessage] = useState('')
  // ログイン中ユーザーのこの案件でのロール
  const [currentRole, setCurrentRole] = useState(null)
  const [currentUserId, setCurrentUserId] = useState(null)
  const [orgName, setOrgName] = useState(null)
  // ロードマップ編集モード
  const [editingRoadmap, setEditingRoadmap] = useState(false)
  const [renamingStepId, setRenamingStepId] = useState(null)
  const [renameVal, setRenameVal] = useState('')
  const [insertingAfterIdx, setInsertingAfterIdx] = useState(null)
  const [insertLabel, setInsertLabel] = useState('')
  const [draggingIdx, setDraggingIdx] = useState(null)
  const [dragOverIdx, setDragOverIdx] = useState(null)
  const [glowingSteps, setGlowingSteps] = useState(false)

  const [celebration, setCelebration] = useState(null)
  const [confettiPieces, setConfettiPieces] = useState([])
  const celebrationCheckedRef = useRef(null)
  const chatBottomRef = useRef(null)
  const chatComposingRef = useRef(false)
  const memberBottomRef = useRef(null)
  const memberComposingRef = useRef(false)

  const CELEBRATIONS = {
    contract: {
      title: 'ご契約、おめでとうございます',
      body: 'ここまで本当にお疲れさまでした。\n新しい暮らしへの、大切な一歩です。',
    },
    settlement: {
      title: 'お取引が完了しました',
      body: 'いよいよ新生活のスタートですね。\nあなたの毎日が、素敵なものになりますように。',
    },
  }

  const fireCelebration = (type) => {
    setCelebration(type)
    const pieces = Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: (i * 7.3 + 3) % 100,
      color: ['#c9a84c', '#FFFFFF', '#93C5FD', '#E2E8F0'][i % 4],
      delay: (i % 6) * 0.08,
      dur: 2.4 + (i % 4) * 0.3,
      rotation: (i * 41) % 360,
      size: 7 + (i % 3) * 3,
    }))
    setConfettiPieces(pieces)
    setTimeout(() => setConfettiPieces([]), 4200)
    setTimeout(() => setCelebration(null), 8000)
  }

  const fireStepGlow = (stepCount) => {
    setGlowingSteps(true)
    setTimeout(() => setGlowingSteps(false), stepCount * 120 + 1500)
  }

  // ログインメンバー（workspace_members）
  const [workspaceMembers, setWorkspaceMembers] = useState([])
  const [showInviteForm, setShowInviteForm] = useState(false)
  const [inviteForm, setInviteForm] = useState({ email: '', role: 'Staff', displayName: '', companyName: '' })
  const [inviteStatus, setInviteStatus] = useState('')
  const [inviteError, setInviteError] = useState('')
  const [inviteLoading, setInviteLoading] = useState(false)

  useEffect(() => {
    async function fetchAll() {
      const { data: ws, error: wsErr } = await supabase.from('workspaces').select('*').eq('id', id).single()
      if (wsErr || !ws) { setNotFound(true); setLoading(false); return }
      setWorkspace(ws)
      const { data: orgNameData } = await supabase.rpc('workspace_org_name', { p_workspace_id: id })
      setOrgName(orgNameData || null)
      // ログイン中ユーザーのこの案件でのロールを取得
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        setCurrentUserId(session.user.id)
        const { data: wmData } = await supabase.from('workspace_members')
          .select('role')
          .eq('workspace_id', id)
          .eq('user_id', session.user.id)
          .eq('status', 'active')
          .maybeSingle()
        setCurrentRole(wmData ? wmData.role : null)
      }
      const [{ data: stepsData }, { data: membersData }, { data: timelineData }, { data: noticesData }, { data: scheduleData }, { data: wsFilesData }, { data: meetingsData }] = await Promise.all([
        supabase.from('roadmap_steps').select('*').eq('workspace_id', id).order('step_order', { ascending: true }),
        supabase.from('ws_members').select('*').eq('workspace_id', id),
        supabase.from('timeline_events').select('*').eq('workspace_id', id).order('event_date', { ascending: true }),
        supabase.from('ws_notices').select('*').eq('workspace_id', id),
        supabase.from('ws_schedule').select('*').eq('workspace_id', id).order('scheduled_date', { ascending: true }),
        supabase.from('ws_files').select('file_name, doc_type, created_at').eq('workspace_id', id).order('created_at', { ascending: false }),
        supabase.from('workspace_meetings').select('*').eq('workspace_id', id).order('created_at', { ascending: false }),
      ])
      setSteps(stepsData || [])
      setMembers(membersData || [])
      setTimeline(timelineData || [])
      setNotices(noticesData || [])
      setSchedule(scheduleData || [])
      setWsFiles(wsFilesData || [])
      setMeetings(meetingsData || [])
      const { data: wsMembersRaw } = await supabase
        .from('workspace_members')
        .select('*')
        .eq('workspace_id', id)
      setWorkspaceMembers(wsMembersRaw || [])
      setLoading(false)
    }
    fetchAll()
  }, [id])

  useEffect(() => {
    if (!id) return
    const channel = supabase
      .channel(`ws-realtime-${id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'workspace_members', filter: `workspace_id=eq.${id}` }, async () => {
        const { data } = await supabase.from('workspace_members').select('*').eq('workspace_id', id)
        setWorkspaceMembers(data || [])
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ws_notices', filter: `workspace_id=eq.${id}` }, async () => {
        const { data } = await supabase.from('ws_notices').select('*').eq('workspace_id', id)
        setNotices(data || [])
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [id])

  useEffect(() => {
    if (!id) return
    let active = true
    async function fetchBellChat() {
      const [{ data: msgs }, { data: reads }, { data: nreads }] = await Promise.all([
        supabase.from('workspace_messages').select('*').eq('workspace_id', id).order('created_at', { ascending: false }).limit(50),
        supabase.from('workspace_chat_reads').select('*').eq('workspace_id', id),
        supabase.from('ws_notice_reads').select('*').eq('workspace_id', id),
      ])
      if (!active) return
      if (msgs) setBellChatMessages(msgs)
      if (reads) setBellChatReads(reads)
      if (nreads) setBellNoticeReads(nreads)
    }
    fetchBellChat()
    const bellChannel = supabase
      .channel(`ws-bell-${id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'workspace_messages', filter: `workspace_id=eq.${id}` }, () => { fetchBellChat() })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'workspace_chat_reads', filter: `workspace_id=eq.${id}` }, () => { fetchBellChat() })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ws_notice_reads', filter: `workspace_id=eq.${id}` }, () => { fetchBellChat() })
      .subscribe()
    const timer = setInterval(fetchBellChat, 120000)
    return () => { active = false; clearInterval(timer); supabase.removeChannel(bellChannel) }
  }, [id, currentUserId])

  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [chatMessages])

  useEffect(() => {
    if (memberBottomRef.current) {
      memberBottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [memberMessages])

  useEffect(() => {
    if (!secretaryOpen || activeChatTab !== 'member') return
    const fetchMemberMessages = async () => {
      const [{ data: msgs }, { data: reads }] = await Promise.all([
        supabase.from('workspace_messages').select('*').eq('workspace_id', id).order('created_at', { ascending: true }),
        supabase.from('workspace_chat_reads').select('*').eq('workspace_id', id),
      ])
      if (msgs) setMemberMessages(msgs)
      if (reads) setChatReads(reads)
      if (currentUserId) {
        await supabase.from('workspace_chat_reads').upsert(
          { workspace_id: id, user_id: currentUserId, last_read_at: new Date().toISOString() },
          { onConflict: 'workspace_id,user_id' }
        )
      }
    }
    fetchMemberMessages()
    const timer = setInterval(fetchMemberMessages, 5000)
    return () => clearInterval(timer)
  }, [secretaryOpen, activeChatTab, id, currentUserId])

  useEffect(() => {
    if (!currentUserId) return
    supabase.from('user_avatars').select('avatar_url').eq('user_id', currentUserId).maybeSingle()
      .then(({ data }) => { if (data ? data.avatar_url : null) setMyAvatarUrl(data.avatar_url) })
  }, [currentUserId])

  useEffect(() => {
    const ids = (workspaceMembers || []).map(m => m.user_id).filter(Boolean)
    if (ids.length === 0) return
    supabase.from('user_avatars').select('user_id, avatar_url').in('user_id', ids)
      .then(({ data }) => {
        if (!data) return
        const map = {}
        data.forEach(r => { map[r.user_id] = r.avatar_url })
        setAvatarMap(map)
      })
  }, [workspaceMembers])

  const onPickAvatar = (e) => {
    const f = e.target.files ? e.target.files[0] : null
    if (!f) return
    setAvatarError('')
    if (f.type.indexOf('image/') !== 0) { setAvatarError('画像ファイルを選んでください'); return }
    if (f.size > 2 * 1024 * 1024) { setAvatarError('2MB以下の画像にしてください'); return }
    setAvatarFile(f)
    setAvatarPreview(URL.createObjectURL(f))
  }

  const saveAvatar = async () => {
    if (!avatarFile || !currentUserId) return
    setAvatarUploading(true); setAvatarError('')
    try {
      const ext = (avatarFile.name.split('.').pop() || 'png').toLowerCase()
      const path = currentUserId + '/' + Date.now() + '.' + ext
      const up = await supabase.storage.from('avatars').upload(path, avatarFile, { contentType: avatarFile.type, upsert: false })
      if (up.error) { setAvatarError('アップロードに失敗しました'); setAvatarUploading(false); return }
      const publicUrl = supabase.storage.from('avatars').getPublicUrl(path).data.publicUrl
      const db = await supabase.from('user_avatars').upsert({ user_id: currentUserId, avatar_url: publicUrl, updated_at: new Date().toISOString() })
      if (db.error) { setAvatarError('保存に失敗しました'); setAvatarUploading(false); return }
      setMyAvatarUrl(publicUrl); setAvatarFile(null); setAvatarPreview(null); setShowAvatarModal(false)
      setAvatarMap(prev => ({ ...prev, [currentUserId]: publicUrl }))
    } catch (err) { setAvatarError('エラーが発生しました') }
    setAvatarUploading(false)
  }

  const removeAvatar = async () => {
    if (!currentUserId) return
    setAvatarUploading(true)
    const db = await supabase.from('user_avatars').delete().eq('user_id', currentUserId)
    if (!db.error) {
      setMyAvatarUrl(null); setAvatarFile(null); setAvatarPreview(null)
      setAvatarMap(prev => { const next = { ...prev }; delete next[currentUserId]; return next })
    }
    setAvatarUploading(false)
  }

  // --- ROADMAP 状態変更 ---
  const handleStepStateChange = async (stepId, newState) => {
    setActiveStepPopover(null)
    const newSteps = steps.map(s => s.id === stepId ? { ...s, state: newState } : s)
    setSteps(newSteps)
    await supabase.from('roadmap_steps').update({ state: newState }).eq('id', stepId)
    const doneCount = newSteps.filter(s => s.state === '完了').length
    const newProgress = newSteps.length > 0 ? Math.round(doneCount / newSteps.length * 100) : 0
    const allDone = newSteps.length > 0 && doneCount === newSteps.length
    const now = new Date().toISOString()
    const wsUpdate = { progress: newProgress, updated_at: now, status: allDone ? '完了' : '進行中', completed_at: allDone ? now : null }
    await supabase.from('workspaces').update(wsUpdate).eq('id', id)
    setWorkspace(prev => ({ ...prev, ...wsUpdate }))
    // 全ステップ完了アニメ（編集モード中は発火しない・一度だけ）
    if (allDone && !editingRoadmap) {
      const kAllDone = 'houseai_celebrated_alldone_' + currentUserId + '_' + id
      let seenAllDone = false
      try { seenAllDone = localStorage.getItem(kAllDone) === '1' } catch (e) {}
      if (!seenAllDone) {
        try { localStorage.setItem(kAllDone, '1') } catch (e) {}
        fireStepGlow(newSteps.length)
      }
    }
    // 全工程完了で自動昇格（address_keyが作れる場合のみ）
    if (allDone) {
      const mergedWs = { ...workspace, ...wsUpdate }
      const addrKey = (mergedWs.property_address || mergedWs.title || '').normalize('NFKC').replace(/[\s　]/g, '')
      if (addrKey) {
        await promoteToHouseRecord({ currentWs: mergedWs, currentSteps: newSteps, currentTimeline: timeline, currentMembers: members, currentNotices: notices, currentSchedule: schedule })
      } else {
        setPromoteMessage('住所未入力のため家カルテ未保存')
        setTimeout(() => setPromoteMessage(''), 5000)
      }
    }
  }

  // --- ROADMAP 編集 ---
  async function recalcAndSaveProgress(stepsArr) {
    const doneCount = stepsArr.filter(s => s.state === '完了').length
    const newProgress = stepsArr.length > 0 ? Math.round(doneCount / stepsArr.length * 100) : 0
    const now = new Date().toISOString()
    await supabase.from('workspaces').update({ progress: newProgress, updated_at: now }).eq('id', id)
    setWorkspace(prev => ({ ...prev, progress: newProgress, updated_at: now }))
  }

  function handleToggleRoadmapEdit() {
    setEditingRoadmap(prev => !prev)
    setActiveStepPopover(null)
    setRenamingStepId(null)
    setRenameVal('')
    setInsertingAfterIdx(null)
    setInsertLabel('')
    setDraggingIdx(null)
    setDragOverIdx(null)
    setGlowingSteps(false)
  }

  async function handleRenameStep(stepId, label) {
    const trimmed = (label || '').trim()
    if (!trimmed) { setRenamingStepId(null); return }
    setSteps(prev => prev.map(s => s.id === stepId ? { ...s, label: trimmed } : s))
    setRenamingStepId(null)
    await supabase.from('roadmap_steps').update({ label: trimmed }).eq('id', stepId)
  }

  async function handleDeleteStep(stepId) {
    const newSteps = steps.filter(s => s.id !== stepId).map((s, i) => ({ ...s, step_order: i + 1 }))
    setSteps(newSteps)
    await supabase.from('roadmap_steps').delete().eq('id', stepId)
    if (newSteps.length > 0) {
      await Promise.all(newSteps.map(s =>
        supabase.from('roadmap_steps').update({ step_order: s.step_order }).eq('id', s.id)
      ))
    }
    await recalcAndSaveProgress(newSteps)
  }

  async function handleInsertStep(afterIdx, label) {
    const trimmed = (label || '').trim()
    if (!trimmed) return
    const newId = crypto.randomUUID()
    const before = steps.slice(0, afterIdx + 1)
    const after = steps.slice(afterIdx + 1)
    const newStepObj = { id: newId, workspace_id: id, label: trimmed, state: '未着手', step_order: 0 }
    const combined = [...before, newStepObj, ...after].map((s, i) => ({ ...s, step_order: i + 1 }))
    setSteps(combined)
    setInsertingAfterIdx(null)
    setInsertLabel('')
    await supabase.from('roadmap_steps').insert({ id: newId, workspace_id: id, label: trimmed, state: '未着手', step_order: 0 })
    await Promise.all(combined.map(s =>
      supabase.from('roadmap_steps').update({ step_order: s.step_order }).eq('id', s.id)
    ))
    await recalcAndSaveProgress(combined)
  }

  async function handleDropReorder(fromIdx, toIdx) {
    if (fromIdx === toIdx) return
    const reordered = [...steps]
    const [moved] = reordered.splice(fromIdx, 1)
    reordered.splice(toIdx, 0, moved)
    const renumbered = reordered.map((s, i) => ({ ...s, step_order: i + 1 }))
    setSteps(renumbered)
    await Promise.all(renumbered.map(s =>
      supabase.from('roadmap_steps').update({ step_order: s.step_order }).eq('id', s.id)
    ))
    await recalcAndSaveProgress(renumbered)
  }

  useEffect(() => {
    if (!currentUserId || !id || steps.length === 0) return
    if (celebrationCheckedRef.current === id) return
    celebrationCheckedRef.current = id

    const contractStep = steps.find(s => s.label === '契約')
    const settlementStep = steps.find(s => s.label === '決済')
    const contractDone = contractStep ? contractStep.state === '完了' : false
    const settlementDone = settlementStep ? settlementStep.state === '完了' : false

    const kSettle = 'houseai_celebrated_settlement_' + currentUserId + '_' + id
    const kContract = 'houseai_celebrated_contract_' + currentUserId + '_' + id

    let seenSettle = false
    let seenContract = false
    try {
      seenSettle = localStorage.getItem(kSettle) === '1'
      seenContract = localStorage.getItem(kContract) === '1'
    } catch (e) {}

    if (settlementDone ? !seenSettle : false) {
      fireCelebration('settlement')
      try { localStorage.setItem(kSettle, '1'); localStorage.setItem(kContract, '1') } catch (e) {}
      return
    }
    if (contractDone ? !seenContract : false) {
      fireCelebration('contract')
      try { localStorage.setItem(kContract, '1') } catch (e) {}
    }
  }, [steps, currentUserId, id])

  // --- MEMBERS ---
  // 修正: roleカラム名 → role_label（実テーブルのカラム名）+ try/catch追加
  const handleAddMember = async () => {
    if (!memberForm.name) { setMemberError('氏名は必須です'); return }
    setMemberError('')
    try {
      const { data, error } = await supabase.from('ws_members').insert({
        workspace_id: id, name: memberForm.name, role_label: memberForm.role_label, permission: memberForm.permission
      }).select().single()
      if (error) throw error
      setMembers(prev => [...prev, data])
      setMemberForm({ name: '', role_label: 'お客様', permission: 'Member' })
      setShowMemberForm(false)
    } catch (e) { console.error('ws_members insert error', e); setMemberError('追加に失敗しました: ' + (e.message || '')) }
  }
  const handleDeleteMember = async (memberId) => {
    await supabase.from('ws_members').delete().eq('id', memberId)
    setMembers(prev => prev.filter(m => m.id !== memberId))
  }

  // --- WORKSPACE MEMBERS（招待・ログインメンバー）---
  const handleInvite = async () => {
    const email = inviteForm.email.trim().toLowerCase()
    if (!email) { setInviteError('メールアドレスを入力してください'); return }
    if ((inviteForm.companyName || '').trim() === '') { setInviteError('名称（表示名）を入力してください'); return }
    setInviteLoading(true); setInviteError(''); setInviteStatus('')
    try {
      let newMemberId = null

      const { data: existingPending } = await supabase
        .from('workspace_members')
        .select('id')
        .eq('workspace_id', id)
        .eq('email', email)
        .eq('status', 'pending')
        .maybeSingle()

      if (existingPending) {
        await supabase
          .from('workspace_members')
          .update({ role: inviteForm.role, display_name: (inviteForm.companyName || '').trim() })
          .eq('id', existingPending.id)
        newMemberId = existingPending.id
      } else {
        const { data: { session } } = await supabase.auth.getSession()
        const invitedBy = session ? session.user.id : null
        const newId = crypto.randomUUID()
        const { error: insErr } = await supabase.from('workspace_members').insert({
          id: newId,
          workspace_id: id,
          email,
          role: inviteForm.role,
          status: 'pending',
          invited_by: invitedBy,
          display_name: (inviteForm.companyName || '').trim(),
        })
        if (insErr) throw insErr
        newMemberId = newId
      }

      // 業者ロール（社内・顧客以外）の場合、専用フォルダを自動作成
      const isVendorRole = !FULL_ACCESS_ROLES.includes(normRole(inviteForm.role))
      if (isVendorRole && newMemberId) {
        // 同じ owner_member_id のフォルダが未作成のときだけ作る（二重作成防止）
        const { data: existingFolder } = await supabase
          .from('ws_file_folders')
          .select('id')
          .eq('workspace_id', id)
          .eq('owner_member_id', newMemberId)
          .maybeSingle()
        if (!existingFolder) {
          const { data: folderRows } = await supabase
            .from('ws_file_folders')
            .select('sort_order')
            .eq('workspace_id', id)
          const maxOrder = folderRows && folderRows.length > 0
            ? Math.max(...folderRows.map(f => f.sort_order || 0))
            : 1
          const folderLabel = (inviteForm.displayName || '').trim()
            || PERMISSION_LABEL[normRole(inviteForm.role)]
            || inviteForm.role
          await supabase.from('ws_file_folders').insert({
            workspace_id: id,
            role_label: folderLabel,
            is_fixed: false,
            sort_order: maxOrder + 1,
            owner_member_id: newMemberId,
          })
        }
      }

      await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: 'https://house-ai.co.jp/workspace',
          shouldCreateUser: true,
        },
      })

      setInviteStatus('招待メールを送信しました')
      setInviteForm({ email: '', role: 'Staff', displayName: '', companyName: '' })
      setShowInviteForm(false)
      const { data: wsMembersRaw } = await supabase
        .from('workspace_members')
        .select('*')
        .eq('workspace_id', id)
      setWorkspaceMembers(wsMembersRaw || [])
    } catch (e) {
      console.error('handleInvite error', e)
      setInviteError('招待に失敗しました: ' + (e.message || ''))
    } finally {
      setInviteLoading(false)
    }
  }

  const handleUpdateMemberRole = async (memberId, newRole) => {
    await supabase.from('workspace_members').update({ role: newRole }).eq('id', memberId)
    setWorkspaceMembers(prev => prev.map(m => m.id === memberId ? { ...m, role: newRole } : m))
  }

  const handleDeleteWorkspaceMember = async (memberId) => {
    await supabase.from('workspace_members').delete().eq('id', memberId)
    setWorkspaceMembers(prev => prev.filter(m => m.id !== memberId))
  }

  // --- TIMELINE ---
  // 修正: event_textカラム名 → label（実テーブルのカラム名）+ try/catch追加
  const handleAddTimeline = async () => {
    if (!timelineForm.event_date || !timelineForm.label) { setTimelineError('日付と内容は必須です'); return }
    setTimelineError('')
    try {
      const newId = crypto.randomUUID()
      const newItem = { id: newId, workspace_id: id, event_date: timelineForm.event_date, label: timelineForm.label }
      const { error } = await supabase.from('timeline_events').insert(newItem)
      if (error) throw error
      setTimeline(prev => [...prev, newItem].sort((a, b) => a.event_date > b.event_date ? 1 : -1))
      setTimelineForm({ event_date: '', label: '' })
      setShowTimelineForm(false)
    } catch (e) { console.error('timeline_events insert error', e); setTimelineError('追加に失敗しました: ' + (e.message || '')) }
  }
  const handleDeleteTimeline = async (itemId) => {
    await supabase.from('timeline_events').delete().eq('id', itemId)
    setTimeline(prev => prev.filter(t => t.id !== itemId))
  }

  // --- SCHEDULE ---
  // 修正: try/catch追加、失敗時はscheduleErrorで表示
  const handleAddSchedule = async () => {
    if (!scheduleForm.scheduled_date || !scheduleForm.label) { setScheduleError('日付と内容は必須です'); return }
    setScheduleError('')
    try {
      const newId = crypto.randomUUID()
      const newItem = { id: newId, workspace_id: id, scheduled_date: scheduleForm.scheduled_date, label: scheduleForm.label }
      const { error } = await supabase.from('ws_schedule').insert(newItem)
      if (error) throw error
      setSchedule(prev => [...prev, newItem].sort((a, b) => a.scheduled_date > b.scheduled_date ? 1 : -1))
      setScheduleForm({ scheduled_date: '', label: '' })
      setShowScheduleForm(false)
    } catch (e) { console.error('ws_schedule insert error', e); setScheduleError('追加に失敗しました: ' + (e.message || '')) }
  }
  const handleDeleteSchedule = async (itemId) => {
    await supabase.from('ws_schedule').delete().eq('id', itemId)
    setSchedule(prev => prev.filter(s => s.id !== itemId))
  }

  // --- MEETING ---
  const handleCreateMeeting = async () => {
    setMeetingBusy(true)
    setMeetingError('')
    setGuestUrl('')
    try {
      if (!meetingTitle) { setMeetingError('タイトルを入力してください'); return }
      let scheduledAt = null
      if (meetingDate && meetingTime) scheduledAt = new Date(`${meetingDate}T${meetingTime}`).toISOString()
      else if (meetingDate) scheduledAt = new Date(`${meetingDate}T00:00`).toISOString()
      const { data } = await supabase.auth.getSession()
      const token = (data && data.session && data.session.access_token) || ''
      const res = await fetch('/api/meeting-create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body: JSON.stringify({ workspaceId: id, title: meetingTitle, meetingType: meetingType, scheduledAt: scheduledAt, guestEnabled: meetingGuest }),
      })
      if (!res.ok) {
        console.log(res.status, await res.clone().json().catch(() => null))
        setMeetingError('会議の作成に失敗しました')
        return
      }
      const json = await res.json()
      setMeetings(prev => [json.meeting, ...prev])
      // 招待URLはこのレスポンスでしか受け取れない（サーバはハッシュのみ保存）
      if (json.guestToken) setGuestUrl(`${window.location.origin}/meeting/${json.meeting.id}?g=${json.guestToken}`)
      setMeetingTitle('')
      setMeetingDate('')
      setMeetingTime('')
      setMeetingType('internal_meeting')
      setMeetingGuest(false)
      setShowMeetingForm(false)
    } finally {
      setMeetingBusy(false)
    }
  }

  // --- NOTICE ---
  // 修正: textカラム名 → message（実テーブルのカラム名）+ try/catch追加
  const handleAddNotice = async () => {
    if (!noticeForm.message) { setNoticeError('通知内容は必須です'); return }
    setNoticeError('')
    try {
      const newId = crypto.randomUUID()
      const newItem = { id: newId, workspace_id: id, level: noticeForm.level, message: noticeForm.message }
      const { error } = await supabase.from('ws_notices').insert(newItem)
      if (error) throw error
      setNotices(prev => [...prev, newItem])
      setNoticeForm({ level: 'info', message: '' })
      setShowNoticeForm(false)
    } catch (e) { console.error('ws_notices insert error', e); setNoticeError('追加に失敗しました: ' + (e.message || '')) }
  }
  const handleDeleteNotice = async (noticeId) => {
    await supabase.from('ws_notices').delete().eq('id', noticeId)
    setNotices(prev => prev.filter(n => n.id !== noticeId))
  }

  // --- 家カルテ昇格 ---
  // address_key: property_address || title を NFKC正規化して空白除去
  // 二重カウント防止: house_record_id が null のとき初回昇格、あれば上書き保存のみ
  const promoteToHouseRecord = async ({ currentWs, currentSteps, currentTimeline, currentMembers, currentNotices, currentSchedule }) => {
    const rawAddr = (currentWs.property_address || currentWs.title || '').normalize('NFKC').replace(/[\s　]/g, '')
    if (!rawAddr) return { skipped: true }
    setPromoting(true)
    setPromoteMessage('')
    try {
      const now = new Date().toISOString()
      const snapshot = {
        property: { address_raw: currentWs.property_address, property_name: currentWs.title, contract_type: currentWs.contract_type },
        meta: { ws_code: currentWs.ws_code, customer_name: currentWs.customer_name, agent_name: currentWs.agent_name, progress: currentWs.progress, completed_at: currentWs.completed_at },
        roadmap: (currentSteps || []).map(s => ({ step_order: s.step_order, label: s.label, state: s.state })),
        timeline: (currentTimeline || []).map(t => ({ event_date: t.event_date, label: t.label })),
        members: (currentMembers || []).map(m => ({ name: m.name, role_label: m.role_label, permission: m.permission })),
        notices: (currentNotices || []).map(n => ({ level: n.level, message: n.message, created_at: n.created_at })),
        schedule: (currentSchedule || []).map(s => ({ scheduled_date: s.scheduled_date, label: s.label })),
        outputs: []
      }
      const txRecord = {
        workspace_id: currentWs.id, ws_code: currentWs.ws_code, contract_type: currentWs.contract_type,
        customer_name: currentWs.customer_name, agent_name: currentWs.agent_name,
        completed_at: currentWs.completed_at || now, promoted_at: now
      }
      let houseRecordId = currentWs.house_record_id || null
      let clientRecordId = currentWs.client_record_id || null

      if (!houseRecordId) {
        // 初回昇格: address_key で既存を検索
        const { data: existing } = await supabase.from('house_records').select('*').eq('address_key', rawAddr).maybeSingle()
        if (existing) {
          // 既存あり: snapshot更新 + transactions追記 + count+1
          await supabase.from('house_records').update({
            snapshot, latest_workspace_id: currentWs.id, last_completed_at: now,
            transactions: [...(existing.transactions || []), txRecord],
            transaction_count: (existing.transaction_count || 0) + 1, updated_at: now
          }).eq('id', existing.id)
          houseRecordId = existing.id
        } else {
          // 新規insert
          const { data: inserted, error: insErr } = await supabase.from('house_records').insert({
            address_key: rawAddr, property_name: currentWs.title, address_raw: currentWs.property_address,
            contract_type: currentWs.contract_type, snapshot, latest_workspace_id: currentWs.id,
            first_completed_at: now, last_completed_at: now, transaction_count: 1, transactions: [txRecord]
          }).select().single()
          if (insErr) throw insErr
          houseRecordId = inserted.id
        }
        // 顧客カルテ（名寄せは次フェーズ）
        const { data: clientIns } = await supabase.from('client_records').insert({
          name: currentWs.customer_name, last_workspace_id: currentWs.id,
          last_house_record_id: houseRecordId, deal_count: 1
        }).select().single()
        if (clientIns) clientRecordId = clientIns.id
      } else {
        // 上書き保存: snapshotのみ更新、transactions追記・count増加なし
        await supabase.from('house_records').update({ snapshot, last_completed_at: now, updated_at: now }).eq('id', houseRecordId)
        if (clientRecordId) {
          await supabase.from('client_records').update({
            last_workspace_id: currentWs.id, last_house_record_id: houseRecordId, updated_at: now
          }).eq('id', clientRecordId)
        }
      }

      // workspaceを完了・昇格済みとして更新
      const wsFinish = {
        house_record_id: houseRecordId, client_record_id: clientRecordId,
        status: '完了', completed_at: currentWs.completed_at || now, promoted_at: now
      }
      await supabase.from('workspaces').update(wsFinish).eq('id', currentWs.id)
      setWorkspace(prev => ({ ...prev, ...wsFinish }))
      setPromoteMessage('家カルテに保存しました')
      setTimeout(() => setPromoteMessage(''), 4000)
      return { skipped: false, houseRecordId }
    } catch (e) {
      console.error('promoteToHouseRecord error', e)
      setPromoteMessage('保存に失敗しました: ' + (e.message || ''))
      return { skipped: false, error: e }
    } finally {
      setPromoting(false)
    }
  }

  const handleManualPromote = async () => {
    await promoteToHouseRecord({ currentWs: workspace, currentSteps: steps, currentTimeline: timeline, currentMembers: members, currentNotices: notices, currentSchedule: schedule })
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0A0F1E 0%, #0F172A 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, color: '#E2E8F0', fontFamily: "'Noto Sans JP', sans-serif" }}>
        <Loader size={22} color="#c9a84c" />
        <span style={{ fontSize: 14, color: '#64748B', fontWeight: 400 }}>読み込み中...</span>
      </div>
    )
  }
  if (notFound) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0A0F1E 0%, #0F172A 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, color: '#E2E8F0', fontFamily: "'Noto Sans JP', sans-serif" }}>
        <div style={{ fontSize: 15, color: '#94A3B8', fontWeight: 400 }}>案件が見つかりません。</div>
        <button onClick={() => { window.location.href = '/workspace' }} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#E2E8F0', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 400, cursor: 'pointer' }}>
          <ChevronLeft size={14} />一覧に戻る
        </button>
      </div>
    )
  }

  // ローディング完了後: ログイン済みだがこの案件のメンバーでない → アクセス拒否
  // currentUserId !== null はセッション解決済みを意味する（WorkspaceAuthGuardで未ログインは弾かれている）
  if (currentUserId !== null && currentRole === null) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0A0F1E 0%, #0F172A 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, color: '#E2E8F0', fontFamily: "'Noto Sans JP', sans-serif" }}>
        <div style={{ fontSize: 15, color: '#94A3B8', fontWeight: 400 }}>この案件へのアクセス権がありません。</div>
        <button onClick={() => { window.location.href = '/workspace' }} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#E2E8F0', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 400, cursor: 'pointer' }}>
          <ChevronLeft size={14} />案件一覧へ戻る
        </button>
      </div>
    )
  }

  const ws = workspace
  const lastDoneIdx = steps.reduce((acc, s, i) => s.state === '完了' ? i : acc, -1)

  // UXガード変数（DBの大文字小文字揺れを正規化してから判定）
  const role = normRole(currentRole)
  const canDel    = role === 'Owner' || role === 'Manager'
  const canAdd    = currentRole !== null && currentRole !== undefined && currentRole !== ''
  const canManage = canDel
  const isInternal = ['Owner', 'Manager', 'Staff'].includes(role)

  // ステータスに応じたアクセント色（チップ色分け用）
  const statusAccent = ws.status === '完了' ? '#D4AF37' : ws.status === '進行中' ? '#38bdf8' : '#f87171'
  const statusBorderRgba = ws.status === '完了' ? 'rgba(212,175,55,0.3)' : ws.status === '進行中' ? 'rgba(56,189,248,0.3)' : 'rgba(248,113,113,0.3)'
  const statusShadowRgba = ws.status === '完了' ? 'rgba(212,175,55,0.25)' : ws.status === '進行中' ? 'rgba(56,189,248,0.25)' : 'rgba(248,113,113,0.25)'

  // インラインフォーム共通スタイル
  const fi = { fontSize: 16, fontWeight: 400, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: '#E2E8F0', padding: '6px 10px', borderRadius: 6, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }
  const fiSel = { ...fi, appearance: 'none', WebkitAppearance: 'none' }
  const addBtn = { display: 'flex', alignItems: 'center', gap: 4, background: 'transparent', border: '1px dashed rgba(201,168,76,0.4)', color: '#c9a84c', borderRadius: 6, padding: '5px 10px', fontSize: 12, fontWeight: 400, cursor: 'pointer', width: '100%', justifyContent: 'center', marginTop: 10 }
  const saveBtn = { background: '#c9a84c', color: '#0A0F1E', border: 'none', borderRadius: 6, padding: '6px 14px', fontSize: 13, fontWeight: 500, cursor: 'pointer' }
  const cancelBtn = { background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', color: '#64748B', borderRadius: 6, padding: '6px 12px', fontSize: 13, fontWeight: 400, cursor: 'pointer' }

  const buildSystemPrompt = () => {
    const stepsText = steps.length > 0
      ? steps.map(s => `  - ${s.label}（${s.state || '未着手'}）`).join('\n')
      : '  （未設定）'
    const membersText = members.length > 0
      ? members.map(m => `  - ${m.role_label || '-'}：${m.name || '-'}`).join('\n')
      : '  （未設定）'
    const scheduleText = schedule.slice(0, 5).length > 0
      ? schedule.slice(0, 5).map(s => `  - ${s.scheduled_date}：${s.label}`).join('\n')
      : '  （なし）'
    const noticesText = notices.length > 0
      ? notices.map(n => `  - [${n.level || 'info'}] ${n.message}`).join('\n')
      : '  （なし）'
    const timelineText = timeline.slice(-5).length > 0
      ? timeline.slice(-5).map(t => `  - ${t.event_date}：${t.label}`).join('\n')
      : '  （なし）'
    const wsFilesText = wsFiles.length > 0
      ? wsFiles.map(f => {
          const date = f.created_at ? new Date(f.created_at).toLocaleDateString('ja-JP') : ''
          return `  - ${f.file_name || '(不明)'}${f.doc_type ? '（' + f.doc_type + '）' : ''}${date ? ' ' + date + 'アップ' : ''}`
        }).join('\n')
      : '  （アップロード済みファイルなし）'

    return `あなたはHouse-AIの案件秘書です。以下の案件情報を踏まえて丁寧に回答してください。

【案件情報】
案件名：${ws.title || '-'}
顧客名：${ws.customer_name || '-'}
担当者：${ws.agent_name || '-'}
契約種別：${ws.contract_type || '-'}
物件住所：${ws.property_address || '-'}
ステータス：${ws.status || '-'}
進捗率：${ws.progress || 0}%
自社：${orgName || '-'}

【ロードマップ】
${stepsText}

【関係者】
${membersText}

【今後の予定（直近5件）】
${scheduleText}

【通知・メモ】
${noticesText}

【直近のタイムライン（最新5件）】
${timelineText}

【アップロード済みファイル】
${wsFilesText}

丁寧かつ簡潔に、案件の担当者・顧客の立場に寄り添って回答してください。案件情報に書かれていない内容（Workspaceの使い方、火災保険・リフォーム・住宅ローンなど不動産一般の話題）でも、「案件情報の範囲外です」「サポート窓口へ」などと断らず、知っている範囲でわかりやすく前向き・具体的に答えてください。確実でない点は可能性として軽く補足する程度にとどめ、回答自体は前向きに行ってください。回答はマークダウン記法（#見出し・**強調**・---区切り線・>引用など）を使わず、プレーンな日本語の文章で答えてください。箇条書きが必要なときは行頭に「・」を使い、簡潔に。

【補足情報：利用料金について】
House-AIは現在、無料でご利用いただけます。より多くの方に使っていただきたいという思いから、今のところ有料プランは設けていません。将来、運営の都合で有料プランを設ける可能性はありますが、その場合も必ず事前にご案内し、ご了承いただいてから変更します。勝手に課金されることはありません。
料金について質問されたときは、この内容をわかりやすく簡潔に、優しく不安にさせない表現で伝えてください。`
  }

  const handleSendMessage = async (text) => {
    const content = (text !== undefined ? text : chatInput).trim()
    if (!content || isSending) return
    setChatInput('')
    const userMsg = { id: Date.now() + '-u', role: 'user', content }
    setChatMessages(prev => [...prev, userMsg])
    setIsSending(true)
    try {
      const history = [...chatMessages, userMsg].map(m => ({ role: m.role, content: m.content }))
      const res = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          system: buildSystemPrompt(),
          messages: history,
          max_tokens: 900,
          source_tool: 'workspace',
          feature: 'workspace_chat',
        }),
      })
      const data = await res.json()
      const replyText = (data.text && data.text.trim()) ? data.text : 'エラーが発生しました'
      setChatMessages(prev => [...prev, { id: Date.now() + '-a', role: 'assistant', content: replyText }])
    } catch (e) {
      setChatMessages(prev => [...prev, { id: Date.now() + '-e', role: 'assistant', content: 'エラーが発生しました' }])
    }
    setIsSending(false)
  }

  const chatAccent = activeChatTab === 'ai' ? '#c9a84c' : '#3b82f6'
  const chatAccentRgb = activeChatTab === 'ai' ? '201,168,76' : '59,130,246'

  const handleMemberSend = async () => {
    const body = memberInput.trim()
    if (!body || isMemberSending) return
    const myWm = workspaceMembers.find(m => m.user_id === currentUserId)
    const senderName = myWm
      ? ((myWm.profiles && myWm.profiles.display_name) || myWm.display_name || myWm.email || '')
      : ''
    const newId = crypto.randomUUID()
    const now = new Date().toISOString()
    const newMsg = { id: newId, workspace_id: id, user_id: currentUserId, sender_name: senderName, body, created_at: now }
    setMemberInput('')
    setMemberMessages(prev => [...prev, newMsg])
    setIsMemberSending(true)
    try {
      await supabase.from('workspace_messages').insert({
        id: newId,
        workspace_id: id,
        user_id: currentUserId,
        sender_name: senderName,
        body,
      })
    } catch (e) {
      // 楽観更新済み
    }
    setIsMemberSending(false)
  }

  const bellMyRead = bellChatReads.find(r => r.user_id === currentUserId)
  const bellMyLastRead = bellMyRead ? bellMyRead.last_read_at : null
  const unreadChatItems = bellChatMessages.filter(m =>
    m.user_id !== currentUserId &&
    (!bellMyLastRead || new Date(m.created_at) > new Date(bellMyLastRead))
  )

  const bellMyNoticeRead = bellNoticeReads.find(r => r.user_id === currentUserId)
  const bellMyNoticeLastRead = bellMyNoticeRead ? bellMyNoticeRead.last_read_at : null
  const unreadNoticeItems = notices.filter(n =>
    !bellMyNoticeLastRead || new Date(n.created_at) > new Date(bellMyNoticeLastRead)
  )

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0A0F1E 0%, #0F172A 100%)', color: '#E2E8F0', fontFamily: "'Noto Sans JP', sans-serif" }}>
      <style>{`
        .ws-grid { display: grid; grid-template-columns: 260px 1fr 280px; gap: 16px; }
        @media (max-width: 960px) { .ws-grid { grid-template-columns: 1fr !important; } }
        @keyframes statusDotBlink { 0%, 100% { opacity: 1; } 50% { opacity: 0.2; } }
        @keyframes stepGlow { 0% { box-shadow: none; } 50% { box-shadow: 0 0 12px 4px rgba(201,168,76,0.7); } 100% { box-shadow: none; } }
        @keyframes stepBlink { 0%, 100% { opacity: 1; } 50% { opacity: 0.25; } }
      `}</style>

      {/* ポップオーバー用バックドロップ */}
      {activeStepPopover ? (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 49 }} onClick={() => setActiveStepPopover(null)} />
      ) : null}

      {/* ヘッダー - 本物ガラス */}
      <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, height: 64, background: 'rgba(10,15,30,0.78)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: 12, padding: '0 20px', boxSizing: 'border-box' }}>
        <div style={{ position: 'relative', flexShrink: 0, cursor: 'pointer' }} onClick={() => setShowLogoMenu(prev => !prev)}>
          <img src="/logo.png" alt="HOUSE-AI" style={{ height: 42, objectFit: 'contain', display: 'block', filter: 'drop-shadow(0 0 8px rgba(201,168,76,0.6))' }} />
          {showLogoMenu ? (
            <>
              <div onClick={(e) => { e.stopPropagation(); setShowLogoMenu(false) }} style={{ position: 'fixed', inset: 0, zIndex: 40 }} />
              <div onClick={(e) => e.stopPropagation()} style={{ position: 'absolute', top: 48, left: 0, width: 210, background: 'rgba(15,23,42,.97)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 12, boxShadow: '0 8px 30px rgba(0,0,0,.5)', zIndex: 50, padding: 6 }}>
                <div onClick={() => { setShowAvatarModal(true); setShowLogoMenu(false) }} style={{ padding: '10px 12px', fontSize: 13, color: '#CBD5E1', cursor: 'pointer', borderRadius: 8 }}>アイコン編集</div>
                <div onClick={() => { window.open('/ws-legal', '_blank'); setShowLogoMenu(false) }} style={{ padding: '10px 12px', fontSize: 13, color: '#CBD5E1', cursor: 'pointer', borderRadius: 8 }}>利用規約</div>
                <div onClick={() => { window.open('/ws-legal?tab=privacy', '_blank'); setShowLogoMenu(false) }} style={{ padding: '10px 12px', fontSize: 13, color: '#CBD5E1', cursor: 'pointer', borderRadius: 8 }}>プライバシーポリシー</div>
                <div onClick={() => { setShowFeedbackModal(true); setShowLogoMenu(false) }} style={{ padding: '10px 12px', fontSize: 13, color: '#CBD5E1', cursor: 'pointer', borderRadius: 8 }}>ご意見・不具合報告</div>
              </div>
            </>
          ) : null}
        </div>
        <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.15)', flexShrink: 0 }} />
        <button onClick={() => { window.location.href = '/workspace' }} style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px 6px', flexShrink: 0 }}>
          <ChevronLeft size={14} color="#64748B" />
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: '#E2E8F0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ws.customer_name || ''}｜{ws.title || ''}</div>
          <div style={{ fontSize: 10, color: '#c9a84c', fontWeight: 400, letterSpacing: 1 }}>{ws.ws_code || ''}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
          {[
            { label: '顧客',    value: ws.customer_name,        accent: '#2dd4bf', borderRgba: 'rgba(45,212,191,0.28)',  shadowRgba: 'rgba(45,212,191,0.22)',  hasDot: false },
            { label: '担当',    value: ws.agent_name,           accent: '#8b5cf6', borderRgba: 'rgba(139,92,246,0.28)', shadowRgba: 'rgba(139,92,246,0.22)', hasDot: false },
            { label: '契約種別', value: ws.contract_type,        accent: '#D4AF37', borderRgba: 'rgba(212,175,55,0.28)', shadowRgba: 'rgba(212,175,55,0.22)', hasDot: false },
            { label: 'ステータス', value: ws.status,             accent: statusAccent, borderRgba: statusBorderRgba, shadowRgba: statusShadowRgba, hasDot: true },
            { label: '最終更新', value: formatDate(ws.updated_at), accent: '#64748b', borderRgba: 'rgba(100,116,139,0.28)', shadowRgba: 'rgba(100,116,139,0.18)', hasDot: false },
          ].map(chip => (
            <div key={chip.label} style={{
              background: 'rgba(15,23,42,0.7)',
              border: `1px solid ${chip.borderRgba}`,
              borderTop: `2px solid ${chip.accent}`,
              borderRadius: 6,
              padding: '3px 9px',
              textAlign: 'center',
              boxShadow: `0 0 12px ${chip.shadowRgba}`,
            }}>
              <div style={{ fontSize: 9, color: chip.accent, fontWeight: 400, marginBottom: 2 }}>{chip.label}</div>
              <div style={{ fontSize: 11, color: '#ffffff', fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                {chip.hasDot ? (
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: statusAccent, display: 'inline-block', flexShrink: 0, animation: ws.status === '進行中' ? 'statusDotBlink 1.8s ease-in-out infinite' : 'none' }} />
                ) : null}
                {chip.value || '-'}
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          <div style={{ width: 100, height: 5, background: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${ws.progress || 0}%`, background: 'linear-gradient(90deg, #c9a84c, #D4AF37)', borderRadius: 3 }} />
          </div>
          <span style={{ fontSize: 11, color: '#c9a84c', fontWeight: 500 }}>{ws.progress || 0}%</span>
        </div>
        {/* currentRole バッジ */}
        {currentRole ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.18)', borderRadius: 4, padding: '2px 8px', flexShrink: 0 }}>
            <Avatar url={myAvatarUrl} name={(workspaceMembers.find(m => m.user_id === currentUserId) ? (workspaceMembers.find(m => m.user_id === currentUserId).display_name || workspaceMembers.find(m => m.user_id === currentUserId).email || '') : '')} size={18} />
            <span style={{ fontSize: 9, color: '#64748B', fontWeight: 400 }}>あなた: </span>
            <span style={{ fontSize: 9, color: '#c9a84c', fontWeight: 500 }}>{PERMISSION_LABEL[normRole(currentRole)] || normRole(currentRole)}</span>
          </div>
        ) : null}
        {/* 家カルテ保存ボタン（Owner/Manager のみ） */}
        {canManage ? (
          ws.promoted_at ? (
            <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
              <button onClick={handleManualPromote} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.5)', color: '#c9a84c', borderRadius: 6, padding: '4px 10px', fontSize: 11, fontWeight: 500, cursor: promoting ? 'not-allowed' : 'pointer' }}>
                {promoting ? <Loader size={11} /> : null}
                家カルテに上書き保存
              </button>
              <button onClick={() => { window.location.href = `/house/${ws.house_record_id}` }} style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#c9a84c', color: '#0A0F1E', border: 'none', borderRadius: 6, padding: '4px 10px', fontSize: 11, fontWeight: 500, cursor: 'pointer' }}>
                家カルテを開く
              </button>
            </div>
          ) : (
            <button onClick={handleManualPromote} style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#c9a84c', color: '#0A0F1E', border: 'none', borderRadius: 6, padding: '4px 10px', fontSize: 11, fontWeight: 500, cursor: promoting ? 'not-allowed' : 'pointer', flexShrink: 0 }}>
              {promoting ? <Loader size={11} /> : null}
              家カルテに保存して完了
            </button>
          )
        ) : null}
        {(() => {
          const noticeUnread = unreadNoticeItems.length
          const totalUnread = noticeUnread + unreadChatItems.length
          const toggleNotices = () => {
            const willOpen = !showNotices
            setShowNotices(willOpen)
            if (willOpen && currentUserId) {
              const nowIso = new Date().toISOString()
              supabase.from('ws_notice_reads').upsert(
                { workspace_id: id, user_id: currentUserId, last_read_at: nowIso },
                { onConflict: 'workspace_id,user_id' }
              ).then(() => {
                setBellNoticeReads(prev => {
                  const others = prev.filter(r => r.user_id !== currentUserId)
                  return [...others, { workspace_id: id, user_id: currentUserId, last_read_at: nowIso }]
                })
              }).catch(e => {})
            }
          }
          const noticeItems = unreadNoticeItems.map(n => ({ _type: 'notice', _at: n.created_at || '', ...n }))
          const chatItems = unreadChatItems.map(m => ({ _type: 'chat', _at: m.created_at || '', ...m }))
          const merged = [...noticeItems, ...chatItems].sort((a, b) => (a._at < b._at ? 1 : a._at > b._at ? -1 : 0))
          return (
            <div style={{ position: 'relative', cursor: 'pointer', flexShrink: 0 }} onClick={toggleNotices}>
              <Bell size={18} color="#94A3B8" />
              {totalUnread > 0 ? (
                <div style={{ position: 'absolute', top: -5, right: -5, width: 15, height: 15, background: '#EF4444', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 9, color: '#fff', fontWeight: 500 }}>{totalUnread > 9 ? '9+' : totalUnread}</span>
                </div>
              ) : null}
              {showNotices ? (
                <>
                  <div onClick={(e) => { e.stopPropagation(); setShowNotices(false) }} style={{ position: 'fixed', inset: 0, zIndex: 40 }} />
                  <div onClick={(e) => e.stopPropagation()} style={{ position: 'absolute', top: 28, right: 0, width: 300, maxHeight: 360, overflowY: 'auto', background: 'rgba(15,23,42,.97)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 12, boxShadow: '0 8px 30px rgba(0,0,0,.5)', zIndex: 50, padding: 12 }}>
                    <div style={{ fontSize: 12, color: '#94A3B8', fontWeight: 500, padding: '4px 6px 10px' }}>通知</div>
                    {merged.length > 0 ? (
                      merged.map((item, idx) => {
                        if (item._type === 'notice') {
                          const ns = noticeStyle(item.level)
                          return (
                            <div key={'n_' + (item.id || idx)} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '9px 10px', borderRadius: 8, background: ns.bg, border: ns.border, marginBottom: idx < merged.length - 1 ? 8 : 0 }}>
                              <div style={{ flexShrink: 0, marginTop: 1 }}><AlertCircle size={13} color={ns.iconColor} /></div>
                              <span style={{ fontSize: 12, color: ns.textColor, fontWeight: 400, lineHeight: 1.5, flex: 1 }}>{item.message || ''}</span>
                            </div>
                          )
                        }
                        const senderLabel = ((workspaceMembers.find(w => w.user_id === item.user_id) || {}).display_name) || 'メンバー'
                        return (
                          <div key={'c_' + (item.id || idx)} onClick={(e) => { e.stopPropagation(); setShowNotices(false); setSecretaryOpen(true); setActiveChatTab('member') }} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '9px 10px', borderRadius: 8, background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.22)', marginBottom: idx < merged.length - 1 ? 8 : 0, cursor: 'pointer' }}>
                            <div style={{ flexShrink: 0, marginTop: 1 }}><MessageCircle size={13} color="#60A5FA" /></div>
                            <span style={{ fontSize: 12, color: '#CBD5E1', fontWeight: 400, lineHeight: 1.5, flex: 1 }}>{senderLabel}: {item.body || ''}</span>
                          </div>
                        )
                      })
                    ) : (
                      <div style={{ padding: 12, fontSize: 13, color: '#64748B' }}>通知はありません</div>
                    )}
                  </div>
                </>
              ) : null}
            </div>
          )
        })()}
      </header>
      {/* 家カルテ保存メッセージ（固定トースト） */}
      {promoteMessage ? (
        <div style={{ position: 'fixed', top: 72, right: 20, zIndex: 150, background: 'rgba(15,23,42,0.97)', border: '1px solid rgba(201,168,76,0.45)', borderRadius: 8, padding: '8px 16px', fontSize: 12, color: '#c9a84c', fontWeight: 400, boxShadow: '0 4px 16px rgba(0,0,0,0.4)' }}>
          {promoteMessage}
        </div>
      ) : null}

      <main style={{ paddingTop: 80, paddingBottom: 140, paddingLeft: 20, paddingRight: 20, maxWidth: 1440, margin: '0 auto', boxSizing: 'border-box' }}>
        <div className="ws-grid">

          {/* 左カラム：役割フォルダ */}
          <FileFolderPanel workspaceId={id} currentRole={currentRole} workspaceMembers={workspaceMembers} currentUserId={currentUserId} customerName={workspace ? workspace.customer_name : null} orgName={orgName} />

          {/* 中央カラム */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>

            {/* ROADMAP */}
            <div style={{ ...glass, borderRadius: 14, padding: 24, overflow: 'visible' }}>
              <div style={{ fontSize: 10, color: '#c9a84c', fontWeight: 500, letterSpacing: 3, marginBottom: 6 }}>ROADMAP</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ fontSize: 14, color: '#E2E8F0', fontWeight: 500 }}>進捗ロードマップ（{ws.contract_type || ''}）</div>
                {canManage ? (
                  <button
                    onClick={handleToggleRoadmapEdit}
                    style={{ fontSize: 11, fontWeight: 400, background: editingRoadmap ? 'rgba(201,168,76,0.15)' : 'rgba(255,255,255,0.06)', border: editingRoadmap ? '1px solid rgba(201,168,76,0.45)' : '1px solid rgba(255,255,255,0.12)', color: editingRoadmap ? '#c9a84c' : '#94A3B8', borderRadius: 6, padding: '4px 10px', cursor: 'pointer' }}
                  >{editingRoadmap ? '完了' : '編集'}</button>
                ) : null}
              </div>
              {isInternal ? (
                <div style={{ fontSize: 11, color: '#475569', fontWeight: 400, marginBottom: 20 }}>
                  {editingRoadmap ? 'クリックで名前変更 / ＋で挿入 / ✕で削除' : '各ステップをクリックして状態を変更できます'}
                </div>
              ) : null}
              {steps.length === 0 ? (
                <div style={{ fontSize: 12, color: '#475569', fontWeight: 400 }}>ロードマップがありません。</div>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                  {/* 先頭 ＋ (編集モードのみ) */}
                  {editingRoadmap ? (
                    <div style={{ display: 'flex', alignItems: 'flex-start', paddingTop: 7, marginRight: 4, position: 'relative' }}>
                      {insertingAfterIdx === -1 ? (
                        <div style={{ position: 'absolute', top: 24, left: 0, zIndex: 50, background: '#0F172A', border: '1px solid rgba(201,168,76,0.4)', borderRadius: 8, padding: '6px 8px', boxShadow: '0 8px 24px rgba(0,0,0,0.6)', display: 'flex', gap: 6, alignItems: 'center', whiteSpace: 'nowrap' }}>
                          <input
                            type="text"
                            value={insertLabel}
                            onChange={e => setInsertLabel(e.target.value)}
                            onKeyDown={e => {
                              if (e.nativeEvent.isComposing || e.keyCode === 229) return
                              if (e.key === 'Enter') handleInsertStep(-1, insertLabel)
                              if (e.key === 'Escape') { setInsertingAfterIdx(null); setInsertLabel('') }
                            }}
                            autoFocus
                            placeholder="ステップ名"
                            style={{ fontSize: 16, fontWeight: 400, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: '#E2E8F0', padding: '4px 8px', borderRadius: 6, outline: 'none', fontFamily: 'inherit', width: 96, boxSizing: 'border-box' }}
                          />
                          <button onClick={() => handleInsertStep(-1, insertLabel)} style={{ background: '#c9a84c', color: '#0A0F1E', border: 'none', borderRadius: 4, padding: '4px 8px', fontSize: 12, fontWeight: 500, cursor: 'pointer', flexShrink: 0 }}>追加</button>
                          <button onMouseDown={e => { e.preventDefault(); e.stopPropagation(); setInsertingAfterIdx(null); setInsertLabel('') }} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', color: '#64748B', borderRadius: 4, padding: '4px 6px', fontSize: 11, fontWeight: 400, cursor: 'pointer', flexShrink: 0 }}>✕</button>
                        </div>
                      ) : (
                        <button
                          onClick={() => { setInsertingAfterIdx(-1); setInsertLabel('') }}
                          style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.4)', color: '#c9a84c', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, fontSize: 14, fontWeight: 400, lineHeight: 1 }}
                          title="先頭に追加"
                        >＋</button>
                      )}
                    </div>
                  ) : null}
                  {steps.map((step, idx) => {
                    const dotType = stepDotType(step.state)
                    return (
                      <div
                        key={step.id || idx}
                        draggable={editingRoadmap}
                        onDragStart={editingRoadmap ? () => setDraggingIdx(idx) : undefined}
                        onDragEnd={editingRoadmap ? () => { setDraggingIdx(null); setDragOverIdx(null) } : undefined}
                        onDragOver={editingRoadmap ? e => { e.preventDefault(); setDragOverIdx(idx) } : undefined}
                        onDrop={editingRoadmap ? e => { e.preventDefault(); if (draggingIdx !== null && draggingIdx !== idx) handleDropReorder(draggingIdx, idx); setDraggingIdx(null); setDragOverIdx(null) } : undefined}
                        style={{ display: 'flex', alignItems: 'center', position: 'relative', opacity: editingRoadmap && draggingIdx === idx ? 0.4 : 1, outline: editingRoadmap && dragOverIdx === idx && draggingIdx !== idx ? '2px dashed #c9a84c' : 'none', borderRadius: 8, transition: 'opacity 0.15s', cursor: editingRoadmap ? 'grab' : 'default' }}
                      >
                        {/* ステップ本体 */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                          {/* ドット（削除ボタンオーバーレイ付き） */}
                          <div style={{ position: 'relative' }}>
                            <div
                              style={{ cursor: isInternal && !editingRoadmap ? 'pointer' : 'default' }}
                              onClick={isInternal && !editingRoadmap ? () => setActiveStepPopover(activeStepPopover === step.id ? null : step.id) : null}
                            >
                              {dotType === 'done' ? (
                                <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(201,168,76,0.12)', border: '2px solid #c9a84c', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: glowingSteps ? (idx === steps.length - 1 ? ('stepGlow 0.5s ease-out ' + (idx * 0.12).toFixed(2) + 's 1 both, stepBlink 0.28s ease-in-out ' + (idx * 0.12 + 0.55).toFixed(2) + 's 3 both') : ('stepGlow 0.5s ease-out ' + (idx * 0.12).toFixed(2) + 's 1 both')) : 'none' }}>
                                  <Check size={14} color="#c9a84c" />
                                </div>
                              ) : dotType === 'active' ? (
                                <motion.div
                                  animate={{ boxShadow: ['0 0 0px rgba(59,130,246,0)', '0 0 20px 4px rgba(59,130,246,0.75)', '0 0 0px rgba(59,130,246,0)'] }}
                                  transition={{ duration: 1.6, repeat: Infinity }}
                                  style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(59,130,246,0.15)', border: '2px solid #3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                >
                                  <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.2, repeat: Infinity }} style={{ width: 10, height: 10, borderRadius: '50%', background: '#60A5FA' }} />
                                </motion.div>
                              ) : dotType === 'waiting' ? (
                                <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(245,158,11,0.15)', border: '2px solid #F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#FCD34D' }} />
                                </div>
                              ) : dotType === 'rejected' ? (
                                <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(239,68,68,0.15)', border: '2px solid #EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <X size={14} color="#F87171" />
                                </div>
                              ) : (
                                <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,255,255,0.03)', border: '2px solid rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'rgba(255,255,255,0.18)' }} />
                                </div>
                              )}
                            </div>
                            {/* 削除ボタン（編集モードのみ） */}
                            {editingRoadmap ? (
                              <button
                                onMouseDown={e => { e.preventDefault(); e.stopPropagation(); handleDeleteStep(step.id) }}
                                onDragStart={e => e.stopPropagation()}
                                style={{ position: 'absolute', top: -5, right: -5, width: 16, height: 16, borderRadius: '50%', background: 'rgba(239,68,68,0.85)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, zIndex: 2 }}
                                title="削除"
                              >
                                <X size={8} color="#fff" />
                              </button>
                            ) : null}
                          </div>
                          {/* ラベル / リネーム入力 */}
                          {editingRoadmap && renamingStepId === step.id ? (
                            <input
                              type="text"
                              draggable={false}
                              value={renameVal}
                              onChange={e => setRenameVal(e.target.value)}
                              onBlur={() => handleRenameStep(step.id, renameVal)}
                              onKeyDown={e => {
                                if (e.nativeEvent.isComposing || e.keyCode === 229) return
                                if (e.key === 'Enter') handleRenameStep(step.id, renameVal)
                                if (e.key === 'Escape') setRenamingStepId(null)
                              }}
                              autoFocus
                              style={{ fontSize: 16, fontWeight: 400, width: 60, textAlign: 'center', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(201,168,76,0.45)', color: '#c9a84c', padding: '2px 4px', borderRadius: 4, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
                            />
                          ) : (
                            <span
                              style={{ fontSize: 10, fontWeight: step.state === '進行中' ? 500 : 400, color: stepLabelColor(step.state), whiteSpace: 'nowrap', textAlign: 'center', maxWidth: 58, lineHeight: 1.3, cursor: editingRoadmap ? 'pointer' : 'inherit' }}
                              onClick={editingRoadmap ? () => { setRenamingStepId(step.id); setRenameVal(step.label) } : undefined}
                              title={editingRoadmap ? 'クリックで名前変更' : undefined}
                            >{step.label}</span>
                          )}
                        </div>
                        {/* 状態選択ポップオーバー（通常モードのみ） */}
                        {!editingRoadmap && activeStepPopover === step.id ? (
                          <div style={{ position: 'absolute', top: 38, left: '50%', transform: 'translateX(-50%)', zIndex: 50, background: '#0F172A', border: '1px solid rgba(201,168,76,0.4)', borderRadius: 8, padding: '4px 0', minWidth: 96, boxShadow: '0 8px 24px rgba(0,0,0,0.6)' }}>
                            {STEP_STATES.map(s => (
                              <div
                                key={s}
                                onClick={() => handleStepStateChange(step.id, s)}
                                style={{ padding: '7px 14px', fontSize: 12, color: s === step.state ? '#c9a84c' : '#CBD5E1', cursor: 'pointer', fontWeight: s === step.state ? 500 : 400, background: s === step.state ? 'rgba(201,168,76,0.08)' : 'transparent' }}
                              >{s}</div>
                            ))}
                          </div>
                        ) : null}
                        {/* 連結線（通常）/ ＋ボタン（編集） */}
                        {editingRoadmap ? (
                          idx < steps.length - 1 ? (
                            <div onDragStart={e => e.stopPropagation()} style={{ width: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 26, flexShrink: 0, position: 'relative' }}>
                              {insertingAfterIdx === idx ? (
                                <div style={{ position: 'absolute', top: 14, left: '50%', transform: 'translateX(-50%)', zIndex: 50, background: '#0F172A', border: '1px solid rgba(201,168,76,0.4)', borderRadius: 8, padding: '6px 8px', boxShadow: '0 8px 24px rgba(0,0,0,0.6)', display: 'flex', gap: 6, alignItems: 'center', whiteSpace: 'nowrap' }}>
                                  <input
                                    type="text"
                                    value={insertLabel}
                                    onChange={e => setInsertLabel(e.target.value)}
                                    onKeyDown={e => {
                                      if (e.nativeEvent.isComposing || e.keyCode === 229) return
                                      if (e.key === 'Enter') handleInsertStep(idx, insertLabel)
                                      if (e.key === 'Escape') { setInsertingAfterIdx(null); setInsertLabel('') }
                                    }}
                                    autoFocus
                                    placeholder="ステップ名"
                                    style={{ fontSize: 16, fontWeight: 400, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: '#E2E8F0', padding: '4px 8px', borderRadius: 6, outline: 'none', fontFamily: 'inherit', width: 96, boxSizing: 'border-box' }}
                                  />
                                  <button onClick={() => handleInsertStep(idx, insertLabel)} style={{ background: '#c9a84c', color: '#0A0F1E', border: 'none', borderRadius: 4, padding: '4px 8px', fontSize: 12, fontWeight: 500, cursor: 'pointer', flexShrink: 0 }}>追加</button>
                                  <button onMouseDown={e => { e.preventDefault(); e.stopPropagation(); setInsertingAfterIdx(null); setInsertLabel('') }} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', color: '#64748B', borderRadius: 4, padding: '4px 6px', fontSize: 11, fontWeight: 400, cursor: 'pointer', flexShrink: 0 }}>✕</button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => { setInsertingAfterIdx(idx); setInsertLabel('') }}
                                  style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.4)', color: '#c9a84c', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, fontSize: 14, fontWeight: 400, lineHeight: 1 }}
                                  title="ここに挿入"
                                >＋</button>
                              )}
                            </div>
                          ) : null
                        ) : (
                          idx < steps.length - 1 ? (
                            <div style={{ width: 20, height: 2, background: idx <= lastDoneIdx ? 'rgba(201,168,76,0.55)' : 'rgba(255,255,255,0.1)', marginBottom: 26, flexShrink: 0 }} />
                          ) : null
                        )}
                      </div>
                    )
                  })}
                  {/* 末尾 ＋ (編集モードのみ) */}
                  {editingRoadmap ? (
                    <div style={{ display: 'flex', alignItems: 'flex-start', paddingTop: 7, marginLeft: 4, position: 'relative' }}>
                      {insertingAfterIdx === steps.length - 1 ? (
                        <div style={{ position: 'absolute', top: 24, left: 0, zIndex: 50, background: '#0F172A', border: '1px solid rgba(201,168,76,0.4)', borderRadius: 8, padding: '6px 8px', boxShadow: '0 8px 24px rgba(0,0,0,0.6)', display: 'flex', gap: 6, alignItems: 'center', whiteSpace: 'nowrap' }}>
                          <input
                            type="text"
                            value={insertLabel}
                            onChange={e => setInsertLabel(e.target.value)}
                            onKeyDown={e => {
                              if (e.nativeEvent.isComposing || e.keyCode === 229) return
                              if (e.key === 'Enter') handleInsertStep(steps.length - 1, insertLabel)
                              if (e.key === 'Escape') { setInsertingAfterIdx(null); setInsertLabel('') }
                            }}
                            autoFocus
                            placeholder="ステップ名"
                            style={{ fontSize: 16, fontWeight: 400, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: '#E2E8F0', padding: '4px 8px', borderRadius: 6, outline: 'none', fontFamily: 'inherit', width: 96, boxSizing: 'border-box' }}
                          />
                          <button onClick={() => handleInsertStep(steps.length - 1, insertLabel)} style={{ background: '#c9a84c', color: '#0A0F1E', border: 'none', borderRadius: 4, padding: '4px 8px', fontSize: 12, fontWeight: 500, cursor: 'pointer', flexShrink: 0 }}>追加</button>
                          <button onMouseDown={e => { e.preventDefault(); e.stopPropagation(); setInsertingAfterIdx(null); setInsertLabel('') }} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', color: '#64748B', borderRadius: 4, padding: '4px 6px', fontSize: 11, fontWeight: 400, cursor: 'pointer', flexShrink: 0 }}>✕</button>
                        </div>
                      ) : (
                        <button
                          onClick={() => { setInsertingAfterIdx(steps.length - 1); setInsertLabel('') }}
                          style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.4)', color: '#c9a84c', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, fontSize: 14, fontWeight: 400, lineHeight: 1 }}
                          title="末尾に追加"
                        >＋</button>
                      )}
                    </div>
                  ) : null}
                </div>
              )}
            </div>

            {/* MEETING */}
            <div style={{ ...glass, borderRadius: 14, padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <Video size={12} color="#c9a84c" />
                <span style={{ fontSize: 10, color: '#c9a84c', fontWeight: 500, letterSpacing: 3 }}>MEETING</span>
              </div>
              <div style={{ fontSize: 14, color: '#E2E8F0', fontWeight: 500, marginBottom: 14 }}>オンライン会議</div>
              {meetings.length === 0 ? (
                <div style={{ fontSize: 12, color: '#475569', fontWeight: 400 }}>会議はまだありません</div>
              ) : (
                meetings.map((m, idx) => (
                  <div key={m.id || idx} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 0', borderBottom: idx < meetings.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                    <span style={{ fontSize: 13, color: '#E2E8F0', fontWeight: 400, flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.title || ''}</span>
                    <span style={{ fontSize: 11, color: '#c9a84c', fontWeight: 400, width: 110, flexShrink: 0, whiteSpace: 'nowrap' }}>{MEETING_TYPE_LABEL[m.meeting_type] || m.meeting_type || ''}</span>
                    <span style={{ fontSize: 12, color: '#64748B', fontWeight: 400, width: 150, flexShrink: 0, whiteSpace: 'nowrap' }}>{formatMeetingAt(m.scheduled_at)}</span>
                    <span style={{ fontSize: 12, color: '#94A3B8', fontWeight: 400, width: 70, flexShrink: 0, whiteSpace: 'nowrap' }}>{MEETING_STATUS_LABEL[m.status] || m.status || ''}</span>
                    {MEETING_CLOSED_STATUSES.includes(m.status) ? null : (
                      <button onClick={() => { window.location.href = `/meeting/${m.id}` }} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.5)', color: '#c9a84c', borderRadius: 6, padding: '5px 12px', fontSize: 12, fontWeight: 400, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>
                        <Video size={12} />参加する
                      </button>
                    )}
                  </div>
                ))
              )}
              {showMeetingForm ? (
                <div style={{ marginTop: 12, padding: '12px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <input
                    type="text"
                    value={meetingTitle}
                    onChange={e => setMeetingTitle(e.target.value)}
                    placeholder="会議のタイトル"
                    style={{ ...fi, width: '100%', boxSizing: 'border-box' }}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                    <select value={meetingType} onChange={e => setMeetingType(e.target.value)} style={{ ...fiSel, flex: '1 1 0', minWidth: 0 }}>
                      <option value="internal_meeting" style={{ background: '#0F172A' }}>社内MTG</option>
                      <option value="customer_meeting" style={{ background: '#0F172A' }}>顧客面談</option>
                      <option value="online_viewing" style={{ background: '#0F172A' }}>オンライン内見</option>
                    </select>
                    <input type="date" value={meetingDate} onChange={e => setMeetingDate(e.target.value)} style={{ ...fi, flex: '1 1 0', minWidth: 0 }} />
                    <input type="time" value={meetingTime} onChange={e => setMeetingTime(e.target.value)} style={{ ...fi, flex: '0 1 120px', minWidth: 0 }} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#94A3B8', fontWeight: 400, cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap' }}>
                      <input type="checkbox" checked={meetingGuest} onChange={e => setMeetingGuest(e.target.checked)} style={{ width: 14, height: 14, accentColor: '#c9a84c', cursor: 'pointer' }} />
                      ゲスト招待
                    </label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        onClick={() => { setShowMeetingForm(false); setMeetingTitle(''); setMeetingDate(''); setMeetingTime(''); setMeetingType('internal_meeting'); setMeetingGuest(false); setMeetingError('') }}
                        style={{ ...cancelBtn, flexShrink: 0, whiteSpace: 'nowrap' }}
                      >キャンセル</button>
                      <button
                        onClick={handleCreateMeeting}
                        disabled={meetingBusy}
                        style={{ ...saveBtn, opacity: meetingBusy ? 0.5 : 1, cursor: meetingBusy ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0, whiteSpace: 'nowrap' }}
                      >
                        {meetingBusy ? <Loader size={11} /> : null}作成
                      </button>
                    </div>
                  </div>
                  {meetingError ? <div style={{ fontSize: 11, color: '#F87171', fontWeight: 400 }}>{meetingError}</div> : null}
                </div>
              ) : (
                canManage ? <button onClick={() => setShowMeetingForm(true)} style={addBtn}><Plus size={12} />会議を作成</button> : null
              )}
              {guestUrl ? (
                <div style={{ marginTop: 12, padding: '12px 14px', background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ fontSize: 11, color: '#c9a84c', fontWeight: 500 }}>ゲスト招待URL</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 12, color: '#CBD5E1', fontWeight: 400, flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{guestUrl}</span>
                    <button onClick={() => { navigator.clipboard.writeText(guestUrl) }} style={{ ...cancelBtn, color: '#c9a84c', border: '1px solid rgba(201,168,76,0.4)', whiteSpace: 'nowrap', flexShrink: 0 }}>コピー</button>
                  </div>
                  <div style={{ fontSize: 11, color: '#64748B', fontWeight: 400 }}>このURLは一度しか表示されません。閉じる前にコピーしてください。</div>
                </div>
              ) : null}
            </div>

            {/* TIMELINE */}
            <div style={{ ...glass, borderRadius: 14, padding: 24 }}>
              <div style={{ fontSize: 10, color: '#c9a84c', fontWeight: 500, letterSpacing: 3, marginBottom: 6 }}>TIMELINE</div>
              <div style={{ fontSize: 14, color: '#E2E8F0', fontWeight: 500, marginBottom: 20 }}>タイムライン</div>
              {timeline.length === 0 ? (
                <div style={{ fontSize: 12, color: '#475569', fontWeight: 400 }}>履歴がありません。</div>
              ) : (
                timeline.map((item, idx) => (
                  <div key={item.id || idx} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#c9a84c', marginTop: 3 }} />
                      {idx < timeline.length - 1 ? <div style={{ width: 1, height: 32, background: 'rgba(201,168,76,0.25)', marginTop: 4 }} /> : null}
                    </div>
                    <div style={{ flex: 1, paddingBottom: idx < timeline.length - 1 ? 8 : 0 }}>
                      <span style={{ fontSize: 12, color: '#c9a84c', fontWeight: 500, marginRight: 10 }}>{formatEventDate(item.event_date)}</span>
                      <span style={{ fontSize: 13, color: '#94A3B8', fontWeight: 400 }}>{item.label || ''}</span>
                    </div>
                    {canDel ? (
                      <button onClick={() => handleDeleteTimeline(item.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4, flexShrink: 0, marginTop: 1 }}>
                        <Trash2 size={12} color="#475569" />
                      </button>
                    ) : null}
                  </div>
                ))
              )}
              {/* 記録追加フォーム */}
              {showTimelineForm ? (
                <div style={{ marginTop: 14, padding: '12px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input type="date" value={timelineForm.event_date} onChange={e => setTimelineForm(prev => ({ ...prev, event_date: e.target.value }))} style={{ ...fi, minWidth: 160, flexShrink: 0 }} />
                    <input type="text" value={timelineForm.label} onChange={e => setTimelineForm(prev => ({ ...prev, label: e.target.value }))} placeholder="内容" style={{ ...fi, flex: 1 }} />
                  </div>
                  {timelineError ? <div style={{ fontSize: 11, color: '#F87171', fontWeight: 400 }}>{timelineError}</div> : null}
                  <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                    <button onClick={() => { setShowTimelineForm(false); setTimelineForm({ event_date: '', label: '' }); setTimelineError('') }} style={cancelBtn}>キャンセル</button>
                    <button onClick={handleAddTimeline} style={saveBtn}>追加</button>
                  </div>
                </div>
              ) : (
                isInternal ? <button onClick={() => setShowTimelineForm(true)} style={addBtn}><Plus size={12} />記録を追加</button> : null
              )}
            </div>

          </div>

          {/* 右カラム */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* NOTICE */}
            <div style={{ ...glass, borderRadius: 14, padding: 18 }}>
              <div style={{ fontSize: 10, color: '#c9a84c', fontWeight: 500, letterSpacing: 3, marginBottom: 6 }}>NOTICE</div>
              <div style={{ fontSize: 14, color: '#E2E8F0', fontWeight: 500, marginBottom: 14 }}>通知</div>
              {notices.length === 0 ? (
                <div style={{ fontSize: 12, color: '#475569', fontWeight: 400 }}>通知はありません。</div>
              ) : (
                notices.map((n, idx) => {
                  const ns = noticeStyle(n.level)
                  return (
                    <div key={n.id || idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '9px 10px', borderRadius: 8, background: ns.bg, border: ns.border, marginBottom: idx < notices.length - 1 ? 8 : 0 }}>
                      <div style={{ flexShrink: 0, marginTop: 1 }}><AlertCircle size={13} color={ns.iconColor} /></div>
                      <span style={{ fontSize: 12, color: ns.textColor, fontWeight: 400, lineHeight: 1.5, flex: 1 }}>{n.message || ''}</span>
                      {canDel ? (
                        <button onClick={() => handleDeleteNotice(n.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 2, flexShrink: 0 }}>
                          <Trash2 size={11} color="#475569" />
                        </button>
                      ) : null}
                    </div>
                  )
                })
              )}
              {showNoticeForm ? (
                <div style={{ marginTop: 12, padding: '12px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <select value={noticeForm.level} onChange={e => setNoticeForm(prev => ({ ...prev, level: e.target.value }))} style={fiSel}>
                    <option value="info" style={{ background: '#0F172A' }}>info（通常）</option>
                    <option value="warning" style={{ background: '#0F172A' }}>warning（注意）</option>
                    <option value="danger" style={{ background: '#0F172A' }}>danger（重要）</option>
                  </select>
                  <input type="text" value={noticeForm.message} onChange={e => setNoticeForm(prev => ({ ...prev, message: e.target.value }))} placeholder="通知内容" style={{ ...fi, width: '100%' }} />
                  {noticeError ? <div style={{ fontSize: 11, color: '#F87171', fontWeight: 400 }}>{noticeError}</div> : null}
                  <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                    <button onClick={() => { setShowNoticeForm(false); setNoticeForm({ level: 'info', message: '' }); setNoticeError('') }} style={cancelBtn}>キャンセル</button>
                    <button onClick={handleAddNotice} style={saveBtn}>追加</button>
                  </div>
                </div>
              ) : (
                isInternal ? <button onClick={() => setShowNoticeForm(true)} style={addBtn}><Plus size={12} />通知を追加</button> : null
              )}
            </div>

            {/* MEMBERS */}
            <div style={{ ...glass, borderRadius: 14, padding: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <Users size={12} color="#c9a84c" />
                <span style={{ fontSize: 10, color: '#c9a84c', fontWeight: 500, letterSpacing: 3 }}>MEMBERS</span>
              </div>
              <div style={{ fontSize: 14, color: '#E2E8F0', fontWeight: 500, marginBottom: 14 }}>関係者</div>
              {members.length === 0 ? (
                <div style={{ fontSize: 12, color: '#475569', fontWeight: 400 }}>関係者が登録されていません。</div>
              ) : (
                members.map((m, idx) => {
                  const ps = permissionStyle(m.permission)
                  return (
                    <div key={m.id || idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: idx < members.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                      <div>
                        <div style={{ fontSize: 12, color: '#E2E8F0', fontWeight: 400 }}>{m.name || ''}</div>
                        <div style={{ fontSize: 10, color: '#64748B', fontWeight: 400 }}>{m.role_label || ''}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 4, fontWeight: 400, background: ps.bg, color: ps.color, border: ps.border }}>{PERMISSION_LABEL[normRole(m.permission)] || normRole(m.permission) || 'Member'}</span>
                        {canDel ? (
                          <button onClick={() => handleDeleteMember(m.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 2 }}>
                            <Trash2 size={11} color="#475569" />
                          </button>
                        ) : null}
                      </div>
                    </div>
                  )
                })
              )}
              {showMemberForm ? (
                <div style={{ marginTop: 12, padding: '12px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <input type="text" value={memberForm.name} onChange={e => setMemberForm(prev => ({ ...prev, name: e.target.value }))} placeholder="氏名" style={{ ...fi, width: '100%' }} />
                  <select value={memberForm.role_label} onChange={e => setMemberForm(prev => ({ ...prev, role_label: e.target.value }))} style={{ ...fiSel, width: '100%' }}>
                    {ROLE_OPTIONS.map(r => <option key={r} value={r} style={{ background: '#0F172A' }}>{r}</option>)}
                  </select>
                  <select value={memberForm.permission} onChange={e => setMemberForm(prev => ({ ...prev, permission: e.target.value }))} style={{ ...fiSel, width: '100%' }}>
                    {PERMISSION_OPTIONS.map(p => <option key={p} value={p} style={{ background: '#0F172A' }}>{PERMISSION_LABEL[p] || p}</option>)}
                  </select>
                  {memberError ? <div style={{ fontSize: 11, color: '#F87171', fontWeight: 400 }}>{memberError}</div> : null}
                  <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                    <button onClick={() => { setShowMemberForm(false); setMemberForm({ name: '', role_label: 'お客様', permission: 'Staff' }); setMemberError('') }} style={cancelBtn}>キャンセル</button>
                    <button onClick={handleAddMember} style={saveBtn}>追加</button>
                  </div>
                </div>
              ) : (
                isInternal ? <button onClick={() => setShowMemberForm(true)} style={addBtn}><Plus size={12} />関係者を追加</button> : null
              )}
            </div>

            {/* LOGIN MEMBERS */}
            <div style={{ ...glass, borderRadius: 14, padding: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <Users size={12} color="#60A5FA" />
                <span style={{ fontSize: 10, color: '#60A5FA', fontWeight: 500, letterSpacing: 3 }}>LOGIN MEMBERS</span>
              </div>
              <div style={{ fontSize: 14, color: '#E2E8F0', fontWeight: 500, marginBottom: 14 }}>ログインメンバー</div>
              {inviteStatus ? (
                <div style={{ fontSize: 11, color: '#22C55E', fontWeight: 400, marginBottom: 10, padding: '6px 10px', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 6 }}>{inviteStatus}</div>
              ) : null}
              {workspaceMembers.length === 0 ? (
                <div style={{ fontSize: 12, color: '#475569', fontWeight: 400 }}>招待済みメンバーがいません。</div>
              ) : (
                workspaceMembers.map((m, idx) => {
                  const ps = permissionStyle(m.role)
                  const displayName = m.display_name || (m.user_id === currentUserId ? 'あなた' : 'メンバー')
                  const statusBadge = m.status === 'active'
                    ? { bg: 'rgba(34,197,94,0.1)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.25)', label: '参加中' }
                    : { bg: 'rgba(245,158,11,0.1)', color: '#FCD34D', border: '1px solid rgba(245,158,11,0.25)', label: '招待中' }
                  return (
                    <div key={m.id || idx} style={{ padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      {/* 上段: アバター + 名前 + 削除ボタン */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Avatar url={avatarMap[m.user_id] || null} name={displayName} size={28} />
                        <div style={{ flex: 1, minWidth: 0, fontSize: 13, color: '#E2E8F0', fontWeight: 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {displayName}
                        </div>
                        {canManage && m.user_id !== currentUserId ? (
                          <button onClick={() => handleDeleteWorkspaceMember(m.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 2, flexShrink: 0 }}>
                            <Trash2 size={13} color="#475569" />
                          </button>
                        ) : null}
                      </div>
                      {/* 中段: 役割バッジ + 状態バッジ */}
                      <div style={{ display: 'flex', gap: 6, marginTop: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 5, fontWeight: 400, whiteSpace: 'nowrap', flexShrink: 0, background: ps.bg, color: ps.color, border: ps.border }}>
                          {PERMISSION_LABEL[normRole(m.role)] || normRole(m.role)}
                        </span>
                        <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 5, fontWeight: 400, whiteSpace: 'nowrap', flexShrink: 0, background: statusBadge.bg, color: statusBadge.color, border: statusBadge.border }}>
                          {statusBadge.label}
                        </span>
                      </div>
                      {/* 下段: 役割select（管理者のみ・1行・幅100%） */}
                      {canManage && m.user_id !== currentUserId ? (
                        <select
                          value={m.role || ''}
                          onChange={e => handleUpdateMemberRole(m.id, e.target.value)}
                          style={{ marginTop: 8, width: '100%', boxSizing: 'border-box', fontSize: 16, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#94A3B8', borderRadius: 6, padding: '8px 10px', outline: 'none', appearance: 'none', WebkitAppearance: 'none' }}
                        >
                          {PERMISSION_OPTIONS.map(p => {
                            const jaLabel = PERMISSION_LABEL[p] || p
                            const optLabel = jaLabel === p ? p : `${p} / ${jaLabel}`
                            return <option key={p} value={p} style={{ background: '#0F172A' }}>{optLabel}</option>
                          })}
                        </select>
                      ) : null}
                    </div>
                  )
                })
              )}
              {canManage ? (
                showInviteForm ? (
                  <div style={{ marginTop: 14, padding: '12px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <input
                      type="email"
                      value={inviteForm.email}
                      onChange={e => setInviteForm(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="招待するメールアドレス"
                      style={{ ...fi, width: '100%' }}
                    />
                    <select
                      value={inviteForm.role}
                      onChange={e => setInviteForm(prev => ({ ...prev, role: e.target.value }))}
                      style={{ ...fiSel, width: '100%' }}
                    >
                      {PERMISSION_OPTIONS.map(p => {
                        const jaLabel = PERMISSION_LABEL[p] || p
                        const optLabel = jaLabel === p ? p : `${p} / ${jaLabel}`
                        return <option key={p} value={p} style={{ background: '#0F172A' }}>{optLabel}</option>
                      })}
                    </select>
                    <input
                      type="text"
                      value={inviteForm.displayName}
                      onChange={e => setInviteForm(prev => ({ ...prev, displayName: e.target.value }))}
                      onKeyDown={e => {
                        if (e.nativeEvent.isComposing || e.keyCode === 229) return
                      }}
                      placeholder="フォルダ名（例：司法書士法人〇〇 移転登記）"
                      style={{ ...fi, width: '100%' }}
                    />
                    <input
                      type="text"
                      value={inviteForm.companyName}
                      onChange={e => setInviteForm(prev => ({ ...prev, companyName: e.target.value }))}
                      onKeyDown={e => {
                        if (e.nativeEvent.isComposing || e.keyCode === 229) return
                      }}
                      placeholder="名称（例：リーガル司法書士法人）"
                      style={{ ...fi, width: '100%' }}
                    />
                    <span style={{ fontSize: 11, color: '#64748B', fontWeight: 400, marginTop: 2 }}>表示名として使われます（お客様名・会社名など）。未入力では招待できません。</span>
                    {inviteError ? <div style={{ fontSize: 11, color: '#F87171', fontWeight: 400 }}>{inviteError}</div> : null}
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => { setShowInviteForm(false); setInviteForm({ email: '', role: 'Staff', displayName: '', companyName: '' }); setInviteError('') }}
                        style={cancelBtn}
                      >キャンセル</button>
                      <button
                        onClick={handleInvite}
                        style={{ ...saveBtn, opacity: inviteLoading ? 0.5 : 1, cursor: inviteLoading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                      >
                        {inviteLoading ? <Loader size={11} /> : null}招待を送る
                      </button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => { setShowInviteForm(true); setInviteStatus('') }} style={addBtn}><Plus size={12} />メンバーを招待</button>
                )
              ) : null}
            </div>

            {/* SCHEDULE */}
            <div style={{ ...glass, borderRadius: 14, padding: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <Calendar size={12} color="#c9a84c" />
                <span style={{ fontSize: 10, color: '#c9a84c', fontWeight: 500, letterSpacing: 3 }}>SCHEDULE</span>
              </div>
              <div style={{ fontSize: 14, color: '#E2E8F0', fontWeight: 500, marginBottom: 14 }}>次回予定</div>
              {schedule.length === 0 ? (
                <div style={{ fontSize: 12, color: '#475569', fontWeight: 400 }}>予定がありません。</div>
              ) : (
                schedule.map((s, idx) => (
                  <div key={s.id || idx} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: idx < schedule.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                    <div style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.28)', borderRadius: 7, padding: '5px 9px', textAlign: 'center', flexShrink: 0 }}>
                      <div style={{ fontSize: 13, color: '#c9a84c', fontWeight: 500 }}>{formatEventDate(s.scheduled_date)}</div>
                    </div>
                    <span style={{ fontSize: 12, color: '#CBD5E1', fontWeight: 400, flex: 1 }}>{s.label || ''}</span>
                    {canDel ? (
                      <button onClick={() => handleDeleteSchedule(s.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 2, flexShrink: 0 }}>
                        <Trash2 size={11} color="#475569" />
                      </button>
                    ) : null}
                  </div>
                ))
              )}
              {showScheduleForm ? (
                <div style={{ marginTop: 12, padding: '12px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <input type="date" value={scheduleForm.scheduled_date} onChange={e => setScheduleForm(prev => ({ ...prev, scheduled_date: e.target.value }))} style={{ ...fi, width: '100%' }} />
                  <input type="text" value={scheduleForm.label} onChange={e => setScheduleForm(prev => ({ ...prev, label: e.target.value }))} placeholder="内容" style={{ ...fi, width: '100%' }} />
                  {scheduleError ? <div style={{ fontSize: 11, color: '#F87171', fontWeight: 400 }}>{scheduleError}</div> : null}
                  <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                    <button onClick={() => { setShowScheduleForm(false); setScheduleForm({ scheduled_date: '', label: '' }); setScheduleError('') }} style={cancelBtn}>キャンセル</button>
                    <button onClick={handleAddSchedule} style={saveBtn}>追加</button>
                  </div>
                </div>
              ) : (
                isInternal ? <button onClick={() => setShowScheduleForm(true)} style={addBtn}><Plus size={12} />予定を追加</button> : null
              )}
            </div>

          </div>
        </div>
      </main>

      {/* AI案件秘書 + メンバーチャット - 本物ガラス・固定右下 */}
      {secretaryOpen ? (
        <div style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 200, width: 340, background: 'rgba(10,15,30,0.84)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', border: `1px solid rgba(${chatAccentRgb},0.38)`, borderRadius: 14, boxShadow: `0 8px 40px rgba(0,0,0,0.55), 0 0 20px rgba(${chatAccentRgb},0.12)`, display: 'flex', flexDirection: 'column', maxHeight: '80vh' }}>

          {/* ヘッダー：アイコン + タブ + 閉じるボタン */}
          <div style={{ padding: '10px 14px', borderBottom: `1px solid rgba(${chatAccentRgb},0.18)`, display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <img src="/logo.png" alt="AI" style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'contain', background: '#000', border: `2px solid ${chatAccent}`, flexShrink: 0 }} />
            <div style={{ display: 'flex', gap: 3, flex: 1 }}>
              <button
                onClick={() => setActiveChatTab('ai')}
                style={{ fontSize: 12, fontWeight: activeChatTab === 'ai' ? 500 : 400, padding: '4px 9px', borderRadius: 6, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, background: activeChatTab === 'ai' ? 'rgba(201,168,76,0.18)' : 'transparent', color: activeChatTab === 'ai' ? '#c9a84c' : 'rgba(148,163,184,0.45)' }}
              ><Sparkles size={11} />AI秘書</button>
              <button
                onClick={() => setActiveChatTab('member')}
                style={{ fontSize: 12, fontWeight: activeChatTab === 'member' ? 500 : 400, padding: '4px 9px', borderRadius: 6, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, background: activeChatTab === 'member' ? 'rgba(59,130,246,0.18)' : 'transparent', color: activeChatTab === 'member' ? '#3b82f6' : 'rgba(148,163,184,0.45)' }}
              ><Users size={11} />メンバー</button>
            </div>
            <button onClick={() => setSecretaryOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 4, flexShrink: 0 }}>
              <X size={14} color="#64748B" />
            </button>
          </div>

          {/* AI秘書タブ */}
          {activeChatTab === 'ai' ? (
            <div style={{ padding: '14px 14px 12px', display: 'flex', flexDirection: 'column', gap: 0, overflow: 'hidden', flex: 1, minHeight: 0 }}>
              <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '9px 11px', marginBottom: 10, flexShrink: 0 }}>
                <span style={{ fontSize: 13, color: '#CBD5E1', fontWeight: 400, lineHeight: 1.6 }}>{ws.title || '案件'}のAI秘書です。質問はお気軽にどうぞ。</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10, flexShrink: 0 }}>
                {['Workspaceの使い方', '利用料金について'].map(chip => (
                  <button key={chip} onClick={() => handleSendMessage(chip)} disabled={isSending} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 20, background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.3)', color: isSending ? '#64748B' : '#c9a84c', cursor: isSending ? 'not-allowed' : 'pointer', fontWeight: 400 }}>{chip}</button>
                ))}
              </div>
              {chatMessages.length > 0 ? (
                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 10, paddingRight: 2 }}>
                  {chatMessages.map(msg => (
                    <div key={msg.id} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                      <div style={{ maxWidth: '82%', padding: '8px 11px', borderRadius: msg.role === 'user' ? '12px 12px 3px 12px' : '12px 12px 12px 3px', background: msg.role === 'user' ? 'rgba(201,168,76,0.18)' : 'rgba(255,255,255,0.07)', border: msg.role === 'user' ? '1px solid rgba(201,168,76,0.35)' : '1px solid rgba(255,255,255,0.1)', fontSize: 13, color: '#E2E8F0', fontWeight: 400, lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  {isSending ? (
                    <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                      <div style={{ padding: '8px 14px', borderRadius: '12px 12px 12px 3px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', fontSize: 13, color: '#64748B', fontWeight: 400 }}>考え中...</div>
                    </div>
                  ) : null}
                  <div ref={chatBottomRef} />
                </div>
              ) : null}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
                <textarea
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onCompositionStart={() => { chatComposingRef.current = true }}
                  onCompositionEnd={() => { chatComposingRef.current = false }}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey && !chatComposingRef.current) {
                      e.preventDefault()
                      handleSendMessage()
                    }
                  }}
                  placeholder="AIに質問する...（Shift+Enterで改行）"
                  rows={2}
                  style={{ fontSize: 16, fontWeight: 400, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(201,168,76,0.22)', color: '#E2E8F0', padding: '7px 10px', borderRadius: 7, width: '100%', boxSizing: 'border-box', outline: 'none', resize: 'none', fontFamily: 'inherit' }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => handleSendMessage()}
                    disabled={isSending || !chatInput.trim()}
                    style={{ background: (isSending || !chatInput.trim()) ? 'rgba(201,168,76,0.3)' : '#c9a84c', color: '#0A0F1E', border: 'none', borderRadius: 7, padding: '6px 12px', fontSize: 12, fontWeight: 500, cursor: (isSending || !chatInput.trim()) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                  ><Send size={11} />AIに送信</button>
                </div>
              </div>
            </div>
          ) : (
            /* メンバーチャットタブ */
            <div style={{ padding: '14px 14px 12px', display: 'flex', flexDirection: 'column', gap: 0, overflow: 'hidden', flex: 1, minHeight: 0 }}>
              {memberMessages.length > 0 ? (
                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 10, paddingRight: 2 }}>
                  {memberMessages.map(msg => {
                    const isMe = msg.user_id === currentUserId
                    const wm = workspaceMembers.find(m => m.user_id === msg.user_id)
                    const senderLabel = (wm && wm.display_name) || 'メンバー'
                    const timeStr = msg.created_at ? new Date(msg.created_at).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }) : ''
                    const readCount = isMe
                      ? chatReads.filter(r => r.user_id !== currentUserId && new Date(r.last_read_at) >= new Date(msg.created_at)).length
                      : 0
                    return (
                      <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                        {isMe ? null : (
                          <span style={{ fontSize: 11, color: '#64748B', fontWeight: 400, marginBottom: 2, paddingLeft: 2 }}>{senderLabel}</span>
                        )}
                        <div style={{ maxWidth: '82%', padding: '8px 11px', borderRadius: isMe ? '12px 12px 3px 12px' : '12px 12px 12px 3px', background: isMe ? 'rgba(59,130,246,0.18)' : 'rgba(255,255,255,0.07)', border: isMe ? '1px solid rgba(59,130,246,0.38)' : '1px solid rgba(255,255,255,0.1)', fontSize: 13, color: '#E2E8F0', fontWeight: 400, lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                          {msg.body}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2, paddingLeft: 2, paddingRight: 2 }}>
                          {isMe && readCount > 0 ? (
                            <span style={{ fontSize: 10, color: '#64748B', fontWeight: 400 }}>{readCount === 1 ? '既読' : '既読 ' + readCount}</span>
                          ) : null}
                          <span style={{ fontSize: 10, color: '#475569' }}>{timeStr}</span>
                        </div>
                      </div>
                    )
                  })}
                  <div ref={memberBottomRef} />
                </div>
              ) : (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 13, color: '#475569', fontWeight: 400 }}>まだメッセージはありません</span>
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
                <textarea
                  value={memberInput}
                  onChange={e => setMemberInput(e.target.value)}
                  onCompositionStart={() => { memberComposingRef.current = true }}
                  onCompositionEnd={() => { memberComposingRef.current = false }}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey && !memberComposingRef.current) {
                      e.preventDefault()
                      handleMemberSend()
                    }
                  }}
                  placeholder="関係者にメッセージ...（Shift+Enterで改行）"
                  rows={2}
                  style={{ fontSize: 16, fontWeight: 400, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(59,130,246,0.28)', color: '#E2E8F0', padding: '7px 10px', borderRadius: 7, width: '100%', boxSizing: 'border-box', outline: 'none', resize: 'none', fontFamily: 'inherit' }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => handleMemberSend()}
                    disabled={isMemberSending || !memberInput.trim()}
                    style={{ background: (isMemberSending || !memberInput.trim()) ? 'rgba(59,130,246,0.3)' : '#3b82f6', color: '#ffffff', border: 'none', borderRadius: 7, padding: '6px 12px', fontSize: 12, fontWeight: 500, cursor: (isMemberSending || !memberInput.trim()) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                  ><Send size={11} />関係者に送信</button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <button onClick={() => setSecretaryOpen(true)} style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 200, width: 56, height: 56, borderRadius: '50%', background: 'rgba(10,15,30,0.9)', border: `1px solid rgba(${chatAccentRgb},0.6)`, boxShadow: `0 0 16px rgba(${chatAccentRgb},0.4)`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
          <MessageSquare size={22} color={chatAccent} />
        </button>
      )}

      {/* お祝い: 紙吹雪 */}
      {confettiPieces.map(p => (
        <motion.div
          key={'ws-confetti-' + p.id}
          initial={{ y: '-5%', opacity: 1, rotate: p.rotation }}
          animate={{ y: '110vh', opacity: 0.9, rotate: p.rotation + 360 }}
          transition={{ duration: p.dur, delay: p.delay, ease: 'easeIn' }}
          style={{
            position: 'fixed', top: 0, left: p.x + '%',
            width: p.size + 'px', height: (p.size * 1.6) + 'px',
            background: p.color, borderRadius: 2,
            zIndex: 100002, pointerEvents: 'none',
          }}
        />
      ))}

      {/* お祝い: 中央カード */}
      <AnimatePresence>
        {celebration !== null ? (
          <motion.div
            key="ws-celebration"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            onClick={() => setCelebration(null)}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(3,7,18,0.72)',
              backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 100001, padding: 20,
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'rgba(15,23,42,0.96)',
                border: '1px solid rgba(201,168,76,0.5)',
                boxShadow: '0 0 80px rgba(201,168,76,0.35)',
                borderRadius: 20, padding: '40px 32px',
                maxWidth: 440, width: '100%', textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 13, letterSpacing: 4, color: '#c9a84c', fontWeight: 500, marginBottom: 16 }}>CONGRATULATIONS</div>
              <div style={{ fontSize: 22, color: '#F8FAFC', fontWeight: 500, lineHeight: 1.5, marginBottom: 16 }}>
                {CELEBRATIONS[celebration].title}
              </div>
              <div style={{ fontSize: 15, color: '#CBD5E1', fontWeight: 400, lineHeight: 1.9, whiteSpace: 'pre-line', marginBottom: 28 }}>
                {CELEBRATIONS[celebration].body}
              </div>
              <button
                onClick={() => setCelebration(null)}
                style={{
                  background: 'linear-gradient(135deg, #c9a84c, #b8973f)',
                  color: '#0A0F1E', border: 'none', borderRadius: 10,
                  padding: '12px 32px', fontSize: 16, fontWeight: 500, cursor: 'pointer',
                }}
              >
                ありがとう
              </button>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {showAvatarModal ? (
        <div onClick={() => { setShowAvatarModal(false); setAvatarError(''); setAvatarFile(null); setAvatarPreview(null) }}
             style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div onClick={(e) => e.stopPropagation()}
               style={{ width: '100%', maxWidth: 420, background: 'rgba(15,23,42,.98)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 16, boxShadow: '0 20px 60px rgba(0,0,0,.6)', padding: 28, position: 'relative' }}>
            <div onClick={() => setShowAvatarModal(false)} style={{ position: 'absolute', top: 16, right: 16, cursor: 'pointer', color: '#94A3B8', fontSize: 20, lineHeight: 1 }}>×</div>
            <div style={{ fontSize: 18, fontWeight: 500, color: '#fff', marginBottom: 20 }}>アイコン編集</div>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
              <div style={{ width: 96, height: 96, borderRadius: '50%', overflow: 'hidden', background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {(avatarPreview || myAvatarUrl) ? (
                  <img src={avatarPreview || myAvatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ color: '#64748B', fontSize: 32 }}>👤</span>
                )}
              </div>
            </div>
            <label style={{ display: 'block', textAlign: 'center', marginBottom: 12 }}>
              <span style={{ display: 'inline-block', padding: '8px 16px', borderRadius: 10, border: '1px solid #c9a84c', color: '#c9a84c', cursor: 'pointer', fontSize: 14 }}>画像を選択</span>
              <input type="file" accept="image/*" onChange={onPickAvatar} style={{ display: 'none' }} />
            </label>
            {avatarError !== '' ? (
              <div style={{ color: '#EF4444', fontSize: 13, textAlign: 'center', marginBottom: 12 }}>{avatarError}</div>
            ) : null}
            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button onClick={saveAvatar} disabled={!avatarFile || avatarUploading}
                      style={{ flex: 1, padding: '10px 0', borderRadius: 10, border: 'none', background: (!avatarFile || avatarUploading) ? 'rgba(201,168,76,.4)' : '#c9a84c', color: '#1a1a1a', fontWeight: 500, fontSize: 14, cursor: (!avatarFile || avatarUploading) ? 'default' : 'pointer' }}>
                {avatarUploading ? '保存中…' : '保存'}
              </button>
              {myAvatarUrl ? (
                <button onClick={removeAvatar} disabled={avatarUploading}
                        style={{ padding: '10px 16px', borderRadius: 10, border: '1px solid rgba(255,255,255,.15)', background: 'transparent', color: '#94A3B8', fontSize: 14, cursor: 'pointer' }}>削除</button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      {showFeedbackModal ? (
        <FeedbackModal
          onClose={() => setShowFeedbackModal(false)}
          currentUserId={currentUserId}
          orgId={workspace ? workspace.org_id : null}
        />
      ) : null}

      {legalModal !== null ? (
        <div onClick={() => setLegalModal(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: 640, maxHeight: '80vh', overflowY: 'auto', background: 'rgba(15,23,42,.98)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 16, boxShadow: '0 20px 60px rgba(0,0,0,.6)', padding: 28, position: 'relative' }}>
            <div onClick={() => setLegalModal(null)} style={{ position: 'absolute', top: 16, right: 16, cursor: 'pointer', color: '#94A3B8', fontSize: 20, lineHeight: 1 }}>×</div>
            {(legalModal === 'terms' ? TERMS_OF_SERVICE : PRIVACY_POLICY).split('\n').map((line, i) => {
              const t = line.trim()
              if (t === '') return <div key={i} style={{ height: 10 }} />
              if (t === '---') return <div key={i} style={{ borderTop: '1px solid rgba(255,255,255,.08)', margin: '14px 0' }} />
              if (t.indexOf('### ') === 0) return <div key={i} style={{ fontSize: 14, fontWeight: 500, color: '#c9a84c', margin: '12px 0 4px' }}>{t.slice(4)}</div>
              if (t.indexOf('## ') === 0) return <div key={i} style={{ fontSize: 16, fontWeight: 500, color: '#E2E8F0', margin: '18px 0 6px' }}>{t.slice(3)}</div>
              if (t.indexOf('# ') === 0) return <div key={i} style={{ fontSize: 20, fontWeight: 500, color: '#fff', margin: '4px 0 12px' }}>{t.slice(2)}</div>
              if (t.indexOf('* ') === 0 || t.indexOf('- ') === 0) return <div key={i} style={{ display: 'flex', gap: 8, padding: '2px 0 2px 8px', fontSize: 13, color: '#CBD5E1', lineHeight: 1.7 }}><span style={{ color: '#c9a84c' }}>・</span><span>{t.slice(2)}</span></div>
              return <div key={i} style={{ fontSize: 13, color: '#CBD5E1', lineHeight: 1.8, margin: '2px 0' }}>{t}</div>
            })}
          </div>
        </div>
      ) : null}

    </div>
  )
}

// ===================== 役割フォルダパネル =====================

// 社内・顧客は全ファイル閲覧可。それ以外（業者系）はgrantされたファイルのみ。
const FULL_ACCESS_ROLES = ['Owner', 'Manager', 'Staff', 'Customer']

function FileFolderPanel({ workspaceId, currentRole, workspaceMembers, currentUserId, customerName, orgName }) {
  const fpCanDel = normRole(currentRole) === 'Owner' || normRole(currentRole) === 'Manager'
  const fpCanAdd = currentRole !== null && currentRole !== undefined && currentRole !== ''
  const fpIsInternal = ['Owner', 'Manager', 'Staff'].includes(normRole(currentRole))
  const isFullAccess = FULL_ACCESS_ROLES.includes(normRole(currentRole))
  // ログイン中ユーザー自身の workspace_members.id（業者絞り込みに使う）
  const myMemberId = (workspaceMembers || []).find(m => m.user_id === currentUserId) ? (workspaceMembers || []).find(m => m.user_id === currentUserId).id : null
  // 業者ロールのメンバー一覧（共有UI用）
  const vendorMembers = (workspaceMembers || []).filter(m => !FULL_ACCESS_ROLES.includes(normRole(m.role)))

  const [folders, setFolders] = useState([])
  const [files, setFiles] = useState([])
  const [fileGrants, setFileGrants] = useState([])
  const [shareOpenFileId, setShareOpenFileId] = useState(null)
  const [historyOpenFileId, setHistoryOpenFileId] = useState(null)
  const [accessLogs, setAccessLogs] = useState([])
  const [docTypeFilter, setDocTypeFilter] = useState('all')
  const [loadingFolders, setLoadingFolders] = useState(true)
  const [uploadingFolderId, setUploadingFolderId] = useState(null)
  const [uploadError, setUploadError] = useState('')
  const [editingFolderId, setEditingFolderId] = useState(null)
  const [folderEditVal, setFolderEditVal] = useState('')
  const [editingFileDocId, setEditingFileDocId] = useState(null)
  const [fileDocTypeVal, setFileDocTypeVal] = useState('')
  const [addingFolder, setAddingFolder] = useState(false)
  const [newFolderLabel, setNewFolderLabel] = useState('')
  const [dragOverFolderId, setDragOverFolderId] = useState(null)
  const [showAllFilesByFolder, setShowAllFilesByFolder] = useState({})
  const [zipping, setZipping] = useState(false)
  const [zipMsg, setZipMsg] = useState('')
  const [galleryFiles, setGalleryFiles] = useState(null)
  const [galleryIndex, setGalleryIndex] = useState(0)
  const [galleryUrls, setGalleryUrls] = useState({})
  const [galleryLoading, setGalleryLoading] = useState(false)

  useEffect(() => {
    loadAll()
  }, [workspaceId])

  async function loadAll() {
    setLoadingFolders(true)
    try {
      const { data: foldersData } = await supabase
        .from('ws_file_folders')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: true })

      let finalFolders = foldersData || []

      if (finalFolders.length === 0) {
        await supabase.from('ws_file_folders').insert([
          { workspace_id: workspaceId, role_label: '自社（不動産）', is_fixed: true, sort_order: 0 },
          { workspace_id: workspaceId, role_label: '顧客', is_fixed: true, sort_order: 1 },
        ])
        const { data: reloaded } = await supabase
          .from('ws_file_folders')
          .select('*')
          .eq('workspace_id', workspaceId)
          .order('sort_order', { ascending: true })
          .order('created_at', { ascending: true })
        finalFolders = reloaded || []
      }

      setFolders(finalFolders)

      const { data: filesData } = await supabase
        .from('ws_files')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: false })
      setFiles(filesData || [])

      const { data: grantsData } = await supabase
        .from('file_grants')
        .select('*')
        .eq('workspace_id', workspaceId)
      setFileGrants(grantsData || [])

      await loadAccessLogs()
    } catch (e) {
      console.error('FileFolderPanel loadAll error', e)
    } finally {
      setLoadingFolders(false)
    }
  }

  async function loadAccessLogs() {
    const { data: logsData } = await supabase
      .from('access_logs')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false })
    setAccessLogs(logsData || [])
  }

  async function handleUpload(folderId, file) {
    if (!file) return
    let ext = (file.name.split('.').pop() || '').toLowerCase()
    if (ext === 'heic' || ext === 'heif') {
      try {
        setUploadingFolderId(folderId)
        const jpegBlob = await heicTo({ blob: file, type: 'image/jpeg', quality: 0.9 })
        const newName = file.name.replace(/\.(heic|heif)$/i, '.jpg')
        file = new File([jpegBlob], newName, { type: 'image/jpeg' })
        ext = 'jpeg'
      } catch (err) {
        setUploadError('HEICの変換に失敗しました')
        setUploadingFolderId(null)
        return
      }
    }
    if (!ALLOWED_EXTS.includes(ext)) {
      setUploadError('PDF / PNG / JPG / JPEG / WEBP のみ対応しています。')
      return
    }
    setUploadError('')
    setUploadingFolderId(folderId)
    try {
      const path = makeSafeStoragePath(workspaceId, ext)
      const { error: storageErr } = await supabase.storage.from('workspace-files').upload(path, file)
      if (storageErr) throw storageErr
      const { data: dbRow, error: dbErr } = await supabase.from('ws_files').insert({
        workspace_id: workspaceId,
        folder_id: folderId,
        file_name: file.name,
        storage_path: path,
        mime_type: file.type,
        size_bytes: file.size,
        doc_type: null,
        uploaded_by: currentUserId,
      }).select().single()
      if (dbErr) throw dbErr
      setFiles(prev => [dbRow, ...prev])
    } catch (e) {
      console.error('upload error', e)
      setUploadError('アップロードに失敗しました: ' + (e.message || ''))
    } finally {
      setUploadingFolderId(null)
    }
  }

  async function handleDeleteFile(file) {
    try {
      await supabase.storage.from('workspace-files').remove([file.storage_path])
      await supabase.from('ws_files').delete().eq('id', file.id)
      setFiles(prev => prev.filter(f => f.id !== file.id))
    } catch (e) {
      console.error('file delete error', e)
    }
  }

  function formatJst(iso) {
    try {
      return new Date(iso).toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
    } catch (e) {
      return ''
    }
  }

  function nameForUser(userId) {
    const m = (workspaceMembers || []).find(wm => wm.user_id === userId)
    if (!m) return '不明'
    const dn = (m.profiles && m.profiles.display_name) || m.display_name || ''
    if (dn) return dn
    const em = m.email || ''
    return em.split('@')[0] || '不明'
  }

  function actionLabel(action) {
    if (action === 'view') return '閲覧'
    if (action === 'download') return 'DL'
    return action || ''
  }

  async function getSignedFileUrl(fileId, action) {
    const { data } = await supabase.auth.getSession()
    const token = (data && data.session && data.session.access_token) || ''
    const res = await fetch('/api/sign-file', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
      body: JSON.stringify({ fileId: fileId, action: action }),
    })
    if (!res.ok) {
      console.log(res.status, await res.clone().json().catch(() => null))
      if (res.status === 403) alert('このファイルへのアクセス権限がありません')
      else if (res.status === 401) alert('セッションが切れました。再度ログインしてください')
      else alert('ファイルの取得に失敗しました')
      return null
    }
    return (await res.json()).url
  }

  async function handleViewFile(file) {
    const url = await getSignedFileUrl(file.id, 'view')
    if (url) {
      window.open(url, '_blank')
      loadAccessLogs()
    }
  }

  async function handleDownloadFile(file) {
    try {
      const url = await getSignedFileUrl(file.id, 'download')
      if (!url) return
      const res = await fetch(url)
      if (!res.ok) throw new Error('fetch failed')
      const blob = await res.blob()
      const objUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = objUrl; a.download = file.file_name; a.click()
      URL.revokeObjectURL(objUrl)
      loadAccessLogs()
    } catch (e) {
      console.error('download error', e)
    }
  }

  function getFolderLabel(folder) {
    if (folder.is_fixed && folder.role_label === '自社（不動産）') return orgName || '会社'
    if (folder.is_fixed && folder.role_label === '顧客') return customerName ? customerName + ' 様' : 'お客様'
    return folder.role_label || ''
  }

  function safeName(s) {
    return String(s || '').replace(/[/\\:*?"<>|]/g, '_').slice(0, 80)
  }

  async function fetchFileBlob(file) {
    const url = await getSignedFileUrl(file.id, 'download')
    if (!url) return null
    const res = await fetch(url)
    if (!res.ok) return null
    return await res.blob()
  }

  async function downloadFolderZip(folder, fileList) {
    if (zipping) return
    setZipping(true)
    try {
      const zip = new JSZip()
      const used = {}
      let done = 0
      for (const f of fileList) {
        setZipMsg('準備中 ' + (done + 1) + '/' + fileList.length)
        const blob = await fetchFileBlob(f)
        done++
        if (!blob) continue
        const origName = f.file_name || ('file_' + f.id)
        if (!used[origName]) used[origName] = 0
        const count = used[origName]
        used[origName]++
        let nm
        if (count === 0) {
          nm = origName
        } else {
          const d = origName.lastIndexOf('.')
          const b = d > 0 ? origName.slice(0, d) : origName
          const e = d > 0 ? origName.slice(d) : ''
          nm = b + '_' + count + e
        }
        zip.file(nm, blob)
      }
      const content = await zip.generateAsync({ type: 'blob' })
      const u = URL.createObjectURL(content)
      const a = document.createElement('a')
      a.href = u
      a.download = (safeName(getFolderLabel(folder)) || 'files') + '.zip'
      a.click()
      URL.revokeObjectURL(u)
    } catch (e) {
      console.error('zip error', e)
      alert('一括ダウンロードに失敗しました')
    } finally {
      setZipping(false)
      setZipMsg('')
    }
  }

  async function downloadAllZip() {
    if (zipping) return
    setZipping(true)
    try {
      const zip = new JSZip()
      let total = 0
      folders.forEach(fl => { total += getFolderFiles(fl.id).length })
      let done = 0
      for (const fl of folders) {
        const dir = safeName(getFolderLabel(fl)) || ('folder_' + fl.id)
        const used = {}
        for (const f of getFolderFiles(fl.id)) {
          setZipMsg('準備中 ' + (done + 1) + '/' + total)
          const blob = await fetchFileBlob(f)
          done++
          if (!blob) continue
          const origName = f.file_name || ('file_' + f.id)
          if (!used[origName]) used[origName] = 0
          const count = used[origName]
          used[origName]++
          let nm
          if (count === 0) {
            nm = origName
          } else {
            const d = origName.lastIndexOf('.')
            const b = d > 0 ? origName.slice(0, d) : origName
            const e = d > 0 ? origName.slice(d) : ''
            nm = b + '_' + count + e
          }
          zip.file(dir + '/' + nm, blob)
        }
      }
      const content = await zip.generateAsync({ type: 'blob' })
      const u = URL.createObjectURL(content)
      const a = document.createElement('a')
      a.href = u
      a.download = (customerName ? safeName(customerName) + '_' : '') + '資料一括.zip'
      a.click()
      URL.revokeObjectURL(u)
    } catch (e) {
      console.error('zipall error', e)
      alert('一括ダウンロードに失敗しました')
    } finally {
      setZipping(false)
      setZipMsg('')
    }
  }

  function openGallery(fileList) {
    const imgs = (fileList || []).filter(f => (f.mime_type || '').startsWith('image/'))
    if (imgs.length === 0) return
    setGalleryUrls({}); setGalleryIndex(0); setGalleryFiles(imgs)
  }

  useEffect(() => {
    if (!galleryFiles) return
    const f = galleryFiles[galleryIndex]
    if (!f || galleryUrls[f.id]) return
    let cancelled = false
    setGalleryLoading(true)
    getSignedFileUrl(f.id, 'view').then(url => {
      if (cancelled) return
      if (url) setGalleryUrls(prev => ({ ...prev, [f.id]: url }))
      setGalleryLoading(false)
    })
    return () => { cancelled = true }
  }, [galleryFiles, galleryIndex])

  useEffect(() => {
    if (!galleryFiles) return
    function handleKey(e) {
      if (e.key === 'Escape') { setGalleryFiles(null); return }
      if (e.key === 'ArrowLeft') setGalleryIndex(i => (i - 1 + galleryFiles.length) % galleryFiles.length)
      if (e.key === 'ArrowRight') setGalleryIndex(i => (i + 1) % galleryFiles.length)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [galleryFiles])

  async function handleUpdateDocType(fileId, newDocType) {
    try {
      const val = (newDocType || '').trim() || null
      await supabase.from('ws_files').update({ doc_type: val }).eq('id', fileId)
      setFiles(prev => prev.map(f => f.id === fileId ? { ...f, doc_type: val } : f))
      setEditingFileDocId(null)
    } catch (e) {
      console.error('doc_type update error', e)
    }
  }

  async function handleSaveFolderLabel(folderId, newLabel) {
    const trimmed = (newLabel || '').trim()
    if (!trimmed) { setEditingFolderId(null); return }
    const dup = folders.some(f => f.id !== folderId && normalizeLabel(f.role_label) === normalizeLabel(trimmed))
    if (dup) {
      alert('同じ名前の役割フォルダが既にあります。別の名前にしてください。')
      return
    }
    try {
      await supabase.from('ws_file_folders').update({ role_label: trimmed }).eq('id', folderId)
      setFolders(prev => prev.map(f => f.id === folderId ? { ...f, role_label: trimmed } : f))
      setEditingFolderId(null)
    } catch (e) {
      console.error('folder label update error', e)
    }
  }

  async function handleDeleteFolder(folder) {
    try {
      const folderFiles = files.filter(f => f.folder_id === folder.id)
      if (folderFiles.length > 0) {
        const paths = folderFiles.map(f => f.storage_path)
        await supabase.storage.from('workspace-files').remove(paths)
        await supabase.from('ws_files').delete().eq('folder_id', folder.id)
        setFiles(prev => prev.filter(f => f.folder_id !== folder.id))
      }
      await supabase.from('ws_file_folders').delete().eq('id', folder.id)
      setFolders(prev => prev.filter(f => f.id !== folder.id))
    } catch (e) {
      console.error('folder delete error', e)
    }
  }

  async function handleAddFolder() {
    const trimmed = (newFolderLabel || '').trim()
    if (!trimmed) return
    const dup = folders.some(f => normalizeLabel(f.role_label) === normalizeLabel(trimmed))
    if (dup) {
      alert('同じ名前の役割フォルダが既にあります。別の名前にしてください。')
      return
    }
    try {
      const maxOrder = folders.length > 0 ? Math.max(...folders.map(f => f.sort_order || 0)) : 1
      const { data, error } = await supabase.from('ws_file_folders').insert({
        workspace_id: workspaceId,
        role_label: trimmed,
        is_fixed: false,
        sort_order: maxOrder + 1,
      }).select().single()
      if (error) throw error
      setFolders(prev => [...prev, data])
      setNewFolderLabel('')
      setAddingFolder(false)
    } catch (e) {
      console.error('folder add error', e)
    }
  }

  async function handleGrantToggle(fileId, memberId, currentlyGranted) {
    if (currentlyGranted) {
      await supabase.from('file_grants').delete()
        .eq('file_id', fileId).eq('member_id', memberId)
      setFileGrants(prev => prev.filter(g => !(g.file_id === fileId && g.member_id === memberId)))
    } else {
      const { data: inserted } = await supabase.from('file_grants').insert({
        workspace_id: workspaceId,
        file_id: fileId,
        member_id: memberId,
        granted_by: currentUserId,
      }).select().maybeSingle()
      if (inserted) setFileGrants(prev => [...prev, inserted])
      // unique(file_id, member_id) 衝突エラーは握りつぶす
    }
  }

  const allDocTypes = [...new Set(files.filter(f => f.doc_type).map(f => f.doc_type))]

  function getFolderFiles(folderId) {
    const allFolderFiles = files.filter(f => f.folder_id === folderId)
    const filtered = docTypeFilter === 'all' ? allFolderFiles : allFolderFiles.filter(f => f.doc_type === docTypeFilter)
    if (isFullAccess) return filtered
    // 業者ロール: 自分のフォルダなら全ファイル、それ以外は自分に grant されたファイルのみ
    if (!myMemberId) return []
    const folderObj = folders.find(f => f.id === folderId)
    const isMyFolder = folderObj ? folderObj.owner_member_id === myMemberId : false
    if (isMyFolder) return filtered
    return filtered.filter(f => fileGrants.some(g => g.file_id === f.id && g.member_id === myMemberId))
  }

  if (loadingFolders) {
    return (
      <div style={{ background: 'rgba(15,23,42,0.85)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 0 30px rgba(201,168,76,0.15)', borderRadius: 14, padding: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
        <Loader size={16} color="#c9a84c" />
        <span style={{ fontSize: 12, color: '#64748B', fontWeight: 400 }}>読み込み中...</span>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

      {/* ヘッダー + 種別フィルタ */}
      <div style={{ background: 'rgba(15,23,42,0.85)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 0 30px rgba(201,168,76,0.15)', borderRadius: 14, padding: '14px 18px' }}>
        <div style={{ fontSize: 10, color: '#c9a84c', fontWeight: 500, letterSpacing: 3, marginBottom: 4 }}>FILES</div>
        <div style={{ fontSize: 14, color: '#E2E8F0', fontWeight: 500, marginBottom: 12 }}>役割フォルダ</div>
        <select
          value={docTypeFilter}
          onChange={e => setDocTypeFilter(e.target.value)}
          style={{ fontSize: 16, fontWeight: 400, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#94A3B8', padding: '6px 10px', borderRadius: 6, outline: 'none', fontFamily: 'inherit', width: '100%', appearance: 'none', WebkitAppearance: 'none', boxSizing: 'border-box' }}
        >
          <option value="all" style={{ background: '#0F172A' }}>すべての種別</option>
          {allDocTypes.map(dt => (
            <option key={dt} value={dt} style={{ background: '#0F172A' }}>{dt}</option>
          ))}
        </select>
        {uploadError ? <div style={{ fontSize: 11, color: '#F87171', fontWeight: 400, marginTop: 8 }}>{uploadError}</div> : null}
      </div>

      {isFullAccess && folders.reduce((acc, fl) => acc + getFolderFiles(fl.id).length, 0) >= 2 ? (
        <button
          onClick={downloadAllZip}
          disabled={zipping}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: '1px solid rgba(201,168,76,0.35)', color: '#c9a84c', borderRadius: 6, padding: '5px 12px', fontSize: 11, fontWeight: 400, cursor: zipping ? 'not-allowed' : 'pointer', marginBottom: 10 }}
        >
          <Download size={12} />
          {zipping ? (zipMsg || '準備中...') : '資料一括DL'}
        </button>
      ) : null}

      {/* フォルダ一覧 */}
      {folders.map(folder => {
        const folderFiles = getFolderFiles(folder.id)

        // 業者ロール: 自分のフォルダ または 表示可能ファイルがあるフォルダのみ描画
        if (!isFullAccess && (myMemberId === null || folder.owner_member_id !== myMemberId) && folderFiles.length === 0) return null

        const isUploading = uploadingFolderId === folder.id
        const showAll = showAllFilesByFolder[folder.id] || false
        const visibleFiles = showAll ? folderFiles : folderFiles.slice(0, 2)
        const inputId = `ws-folder-input-${folder.id}`

        return (
          <div
            key={folder.id}
            style={{
              background: dragOverFolderId === folder.id ? 'rgba(201,168,76,0.06)' : 'rgba(15,23,42,0.85)',
              border: dragOverFolderId === folder.id ? '1px solid rgba(201,168,76,0.5)' : '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 0 30px rgba(201,168,76,0.15)',
              borderRadius: 12,
              padding: 16,
              transition: 'all 0.15s',
            }}
            onDragOver={e => { e.preventDefault(); setDragOverFolderId(folder.id) }}
            onDragLeave={() => setDragOverFolderId(null)}
            onDrop={async e => {
              e.preventDefault()
              setDragOverFolderId(null)
              const files = Array.from(e.dataTransfer.files || [])
              for (const f of files) { await handleUpload(folder.id, f) }
            }}
          >
            {/* フォルダヘッダー */}
            <div style={{ marginBottom: folderFiles.length > 0 ? 12 : 0 }}>
              {/* 1段目: 名前 + 削除 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                {!folder.is_fixed && editingFolderId === folder.id ? (
                  <input
                    type="text"
                    value={folderEditVal}
                    onChange={e => setFolderEditVal(e.target.value)}
                    onBlur={() => handleSaveFolderLabel(folder.id, folderEditVal)}
                    onKeyDown={e => {
                      if (e.nativeEvent.isComposing || e.keyCode === 229) return
                      if (e.key === 'Enter') handleSaveFolderLabel(folder.id, folderEditVal)
                      if (e.key === 'Escape') setEditingFolderId(null)
                    }}
                    autoFocus
                    style={{ fontSize: 16, fontWeight: 500, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(201,168,76,0.45)', color: '#c9a84c', padding: '2px 8px', borderRadius: 4, outline: 'none', fontFamily: 'inherit', flex: 1, minWidth: 0, boxSizing: 'border-box' }}
                  />
                ) : (
                  <span
                    onClick={() => {
                      if (!folder.is_fixed) {
                        setEditingFolderId(folder.id)
                        setFolderEditVal(folder.role_label || '')
                      }
                    }}
                    style={{ fontSize: 13, color: '#c9a84c', fontWeight: 500, flex: 1, minWidth: 0, cursor: folder.is_fixed ? 'default' : 'pointer' }}
                    title={folder.is_fixed ? undefined : 'クリックで編集'}
                  >{
                    folder.is_fixed && folder.role_label === '自社（不動産）'
                      ? (orgName || '会社')
                      : folder.is_fixed && folder.role_label === '顧客'
                        ? (customerName ? customerName + ' 様' : 'お客様')
                        : (folder.role_label || '')
                  }</span>
                )}
                {!folder.is_fixed ? (
                  fpCanDel ? (
                    <button
                      onClick={() => handleDeleteFolder(folder)}
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 2, flexShrink: 0 }}
                      title="フォルダを削除"
                    >
                      <Trash2 size={12} color="#475569" />
                    </button>
                  ) : null
                ) : null}
              </div>
              {/* 2段目: アップロード + 全部DL */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <input
                  id={inputId}
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.webp,.heic,.heif,image/heic,image/heif"
                  multiple
                  style={{ position: 'absolute', opacity: 0, width: 0, height: 0, overflow: 'hidden', pointerEvents: 'none' }}
                  onChange={async e => {
                    const files = Array.from(e.target.files || [])
                    e.target.value = ''
                    for (const f of files) { await handleUpload(folder.id, f) }
                  }}
                />
                {isFullAccess || (myMemberId !== null && folder.owner_member_id === myMemberId) ? (
                  <label
                    htmlFor={inputId}
                    onClick={e => { if (isUploading) e.preventDefault() }}
                    style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.35)', color: '#c9a84c', borderRadius: 5, padding: '3px 8px', fontSize: 11, fontWeight: 400, cursor: isUploading ? 'not-allowed' : 'pointer', flexShrink: 0, userSelect: 'none' }}
                  >
                    {isUploading ? <Loader size={11} /> : <Plus size={11} />}
                    アップロード
                  </label>
                ) : null}
                {folderFiles.length >= 2 ? (
                  <button
                    onClick={() => downloadFolderZip(folder, folderFiles)}
                    disabled={zipping}
                    style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: '1px solid rgba(201,168,76,0.35)', color: '#c9a84c', borderRadius: 5, padding: '3px 8px', fontSize: 11, fontWeight: 400, cursor: zipping ? 'not-allowed' : 'pointer', flexShrink: 0 }}
                  >
                    <Download size={11} />
                    {zipping ? (zipMsg || '準備中...') : '全部DL'}
                  </button>
                ) : null}
                {folderFiles.filter(f => (f.mime_type || '').startsWith('image/')).length >= 2 ? (
                  <button
                    onClick={() => openGallery(folderFiles)}
                    style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: '1px solid rgba(201,168,76,0.35)', color: '#c9a84c', borderRadius: 5, padding: '3px 8px', fontSize: 11, fontWeight: 400, cursor: 'pointer', flexShrink: 0 }}
                  >
                    <Eye size={11} />
                    全表示
                  </button>
                ) : null}
              </div>
            </div>

            {/* ファイル0件 */}
            {folderFiles.length === 0 ? (
              <div style={{ fontSize: 11, color: '#334155', fontWeight: 400, textAlign: 'center', padding: '10px 0', borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: 10 }}>
                {docTypeFilter === 'all' ? 'ファイルがありません' : 'この種別のファイルなし'}
              </div>
            ) : (
              <>
              {visibleFiles.map((wf, idx) => {
                const isImage = (wf.mime_type || '').startsWith('image/')
                const isEditingDocType = editingFileDocId === wf.id
                const datalistId = `doc-type-list-${wf.id}`

                return (
                  <div key={wf.id} style={{ padding: '6px 0', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    {/* ファイルアイコン */}
                    <div style={{ width: 34, height: 34, flexShrink: 0, borderRadius: 5, overflow: 'hidden', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {isImage ? (
                        <Image size={16} color="#c9a84c" />
                      ) : (
                        <FileText size={16} color="#c9a84c" />
                      )}
                    </div>
                    {/* ファイル情報 */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 11, color: '#CBD5E1', fontWeight: 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: 1 }}>{wf.file_name || ''}</div>
                      <div style={{ fontSize: 10, color: '#475569', fontWeight: 400, marginBottom: 2 }}>{formatFileSize(wf.size_bytes)}</div>
                      {/* 種別タグ */}
                      {isEditingDocType ? (
                        <div>
                          <datalist id={datalistId}>
                            {DOC_TYPE_CANDIDATES.map(c => <option key={c} value={c} />)}
                          </datalist>
                          <input
                            type="text"
                            value={fileDocTypeVal}
                            list={datalistId}
                            onChange={e => setFileDocTypeVal(e.target.value)}
                            onBlur={() => handleUpdateDocType(wf.id, fileDocTypeVal)}
                            onKeyDown={e => {
                              if (e.key === 'Enter') handleUpdateDocType(wf.id, fileDocTypeVal)
                              if (e.key === 'Escape') setEditingFileDocId(null)
                            }}
                            autoFocus
                            placeholder="種別を入力"
                            style={{ fontSize: 16, fontWeight: 400, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(201,168,76,0.4)', color: '#E2E8F0', padding: '2px 6px', borderRadius: 4, outline: 'none', fontFamily: 'inherit', width: '100%', boxSizing: 'border-box' }}
                          />
                        </div>
                      ) : (
                        <span
                          onClick={() => { setEditingFileDocId(wf.id); setFileDocTypeVal(wf.doc_type || '') }}
                          style={{ fontSize: 9, background: wf.doc_type ? 'rgba(201,168,76,0.12)' : 'rgba(255,255,255,0.04)', color: wf.doc_type ? '#c9a84c' : '#475569', border: wf.doc_type ? '1px solid rgba(201,168,76,0.25)' : '1px solid rgba(255,255,255,0.1)', borderRadius: 3, padding: '1px 5px', fontWeight: 400, cursor: 'pointer', display: 'inline-block' }}
                        >{wf.doc_type || '種別を設定'}</span>
                      )}
                      {wf.uploaded_by ? (
                        <div style={{ fontSize: 9, color: '#334155', fontWeight: 400, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{'投稿: ' + nameForUser(wf.uploaded_by)}</div>
                      ) : null}
                      {isFullAccess ? (
                        (() => {
                          const logs = (accessLogs || []).filter(l => l.file_id === wf.id)
                          return logs.length > 0 ? (
                            <div style={{ fontSize: 10, color: '#64748B', fontWeight: 400, marginTop: 2, display: 'flex', alignItems: 'center', gap: 3, whiteSpace: 'nowrap', overflow: 'hidden' }}>
                              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0 }}>{nameForUser(logs[0].user_id)}</span>
                              <span style={{ flexShrink: 0 }}>{'・' + formatJst(logs[0].created_at) + '・' + actionLabel(logs[0].action)}</span>
                            </div>
                          ) : null
                        })()
                      ) : null}
                    </div>
                    {/* アクション */}
                    <div style={{ display: 'flex', gap: 2, flexShrink: 0, alignItems: 'center', marginTop: 2 }}>
                      <button onClick={() => handleViewFile(wf)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 3 }} title="プレビュー">
                        <Eye size={12} color="#64748B" />
                      </button>
                      <button onClick={() => handleDownloadFile(wf)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 3 }} title="ダウンロード">
                        <Download size={12} color="#64748B" />
                      </button>
                      {isFullAccess ? (
                        <button
                          onClick={() => setHistoryOpenFileId(historyOpenFileId === wf.id ? null : wf.id)}
                          style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 3 }}
                          title="アクセス履歴"
                        >
                          <History size={12} color={historyOpenFileId === wf.id ? '#c9a84c' : '#64748B'} />
                        </button>
                      ) : null}
                      {fpCanDel ? (
                        <button
                          onClick={() => setShareOpenFileId(shareOpenFileId === wf.id ? null : wf.id)}
                          style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 3 }}
                          title="共有"
                        >
                          <Share2 size={12} color={shareOpenFileId === wf.id ? '#c9a84c' : '#64748B'} />
                        </button>
                      ) : null}
                      {(fpCanDel || (wf.uploaded_by && wf.uploaded_by === currentUserId)) ? (
                        <button onClick={() => handleDeleteFile(wf)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 3 }} title="削除">
                          <Trash2 size={12} color="#475569" />
                        </button>
                      ) : null}
                    </div>
                    </div>
                    {/* 共有パネル（fpCanDel かつ開いているときのみ） */}
                    {shareOpenFileId === wf.id ? (
                    <div style={{ marginTop: 8, padding: '10px 12px', background: 'rgba(15,23,42,0.85)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 0 30px rgba(201,168,76,0.15)', borderRadius: 8 }}>
                      <div style={{ fontSize: 10, color: '#c9a84c', fontWeight: 500, letterSpacing: 1, marginBottom: 8 }}>共有相手（業者ロール）</div>
                      {vendorMembers.length === 0 ? (
                        <div style={{ fontSize: 11, color: '#475569', fontWeight: 400 }}>業者ロールのメンバーがいません</div>
                      ) : (
                        vendorMembers.map(vm => {
                          const granted = fileGrants.some(g => g.file_id === wf.id && g.member_id === vm.id)
                          const displayName = (vm.profiles && vm.profiles.display_name) || vm.email || ''
                          const roleLabel = PERMISSION_LABEL[normRole(vm.role)] || normRole(vm.role)
                          return (
                            <div key={vm.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                              <div>
                                <div style={{ fontSize: 11, color: '#CBD5E1', fontWeight: 400 }}>{displayName}</div>
                                <div style={{ fontSize: 9, color: '#64748B', fontWeight: 400 }}>{roleLabel}</div>
                              </div>
                              <button
                                onClick={() => handleGrantToggle(wf.id, vm.id, granted)}
                                style={{
                                  background: granted ? 'rgba(201,168,76,0.15)' : 'rgba(255,255,255,0.05)',
                                  border: granted ? '1px solid rgba(201,168,76,0.45)' : '1px solid rgba(255,255,255,0.12)',
                                  color: granted ? '#c9a84c' : '#64748B',
                                  borderRadius: 5,
                                  padding: '3px 8px',
                                  fontSize: 10,
                                  fontWeight: 500,
                                  cursor: 'pointer',
                                  flexShrink: 0,
                                }}
                              >{granted ? '共有中' : '共有する'}</button>
                            </div>
                          )
                        })
                      )}
                    </div>
                    ) : null}
                    {isFullAccess && historyOpenFileId === wf.id ? (
                    <div style={{ marginTop: 8, padding: '10px 12px', background: 'rgba(15,23,42,0.85)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 0 30px rgba(201,168,76,0.15)', borderRadius: 8 }}>
                      <div style={{ fontSize: 10, color: '#c9a84c', fontWeight: 500, letterSpacing: 1, marginBottom: 8 }}>アクセス履歴</div>
                      {(() => {
                        const logs = (accessLogs || []).filter(l => l.file_id === wf.id)
                        return logs.length === 0 ? (
                          <div style={{ fontSize: 11, color: '#475569', fontWeight: 400 }}>アクセス履歴はありません</div>
                        ) : (
                          logs.map((l, li) => (
                            <div key={l.id || li} style={{ fontSize: 11, color: '#94A3B8', fontWeight: 400, padding: '3px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                              {nameForUser(l.user_id) + '・' + formatJst(l.created_at) + '・' + actionLabel(l.action)}
                            </div>
                          ))
                        )
                      })()}
                    </div>
                    ) : null}
                  </div>
                )
              })}
              {folderFiles.length > 2 ? (
                <button onClick={() => setShowAllFilesByFolder(prev => ({ ...prev, [folder.id]: !showAll }))}
                  style={{ background: 'none', border: 'none', color: '#c9a84c', fontSize: 11, fontWeight: 400, cursor: 'pointer', padding: '4px 0', textAlign: 'left' }}>
                  {showAll ? '閉じる' : 'もっと見る（残り' + (folderFiles.length - 2) + '件）'}
                </button>
              ) : null}
              </>
            )}
          </div>
        )
      })}

      {/* フォルダ追加 */}
      {fpIsInternal ? (
        addingFolder ? (
          <div style={{ background: 'rgba(15,23,42,0.85)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 0 30px rgba(201,168,76,0.15)', borderRadius: 12, padding: '12px 16px', display: 'flex', gap: 8, alignItems: 'center', position: 'relative', zIndex: 51 }}>
            <input
              type="text"
              value={newFolderLabel}
              onChange={e => setNewFolderLabel(e.target.value)}
              onKeyDown={e => {
                if (e.nativeEvent.isComposing || e.keyCode === 229) return
                if (e.key === 'Enter') handleAddFolder()
                if (e.key === 'Escape') { setAddingFolder(false); setNewFolderLabel('') }
              }}
              autoFocus
              placeholder="役割名（例：司法書士）"
              style={{ fontSize: 16, fontWeight: 400, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: '#E2E8F0', padding: '6px 10px', borderRadius: 6, outline: 'none', fontFamily: 'inherit', flex: 1, boxSizing: 'border-box' }}
            />
            <button
              onClick={handleAddFolder}
              style={{ background: '#c9a84c', color: '#0A0F1E', border: 'none', borderRadius: 6, padding: '6px 12px', fontSize: 12, fontWeight: 500, cursor: 'pointer', flexShrink: 0 }}
            >追加</button>
            <button
              onMouseDown={e => { e.preventDefault(); e.stopPropagation(); setAddingFolder(false); setNewFolderLabel('') }}
              onClick={() => { setAddingFolder(false); setNewFolderLabel('') }}
              style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', color: '#64748B', borderRadius: 6, padding: '6px 10px', fontSize: 12, fontWeight: 400, cursor: 'pointer', flexShrink: 0 }}
            >キャンセル</button>
          </div>
        ) : (
          <button
            onClick={() => setAddingFolder(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'transparent', border: '1px dashed rgba(201,168,76,0.4)', color: '#c9a84c', borderRadius: 10, padding: '8px 12px', fontSize: 12, fontWeight: 400, cursor: 'pointer', width: '100%', justifyContent: 'center', boxSizing: 'border-box' }}
          >
            <Plus size={12} />
            役割（フォルダ）を追加
          </button>
        )
      ) : null}

      <AnimatePresence>
        {galleryFiles ? (
          <motion.div
            key="gallery"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setGalleryFiles(null)}
            style={{ position: 'fixed', inset: 0, zIndex: 100002, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
          >
            <button
              onClick={e => { e.stopPropagation(); setGalleryFiles(null) }}
              style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: '#E2E8F0', cursor: 'pointer', padding: 4 }}
            >
              <X size={24} />
            </button>
            <div style={{ position: 'absolute', top: 20, left: 20, fontSize: 13, fontWeight: 400, color: '#94A3B8' }}>
              {(galleryIndex + 1) + ' / ' + galleryFiles.length}
            </div>
            <div onClick={e => e.stopPropagation()} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12, width: '100%' }}>
              {galleryUrls[galleryFiles[galleryIndex].id] ? (
                <img
                  src={galleryUrls[galleryFiles[galleryIndex].id]}
                  alt={galleryFiles[galleryIndex].file_name || ''}
                  style={{ maxWidth: '90%', maxHeight: '82vh', objectFit: 'contain', borderRadius: 8 }}
                />
              ) : galleryLoading ? (
                <Loader size={32} color="#c9a84c" />
              ) : (
                <div style={{ fontSize: 13, fontWeight: 400, color: '#64748B' }}>読み込めません</div>
              )}
              <div style={{ fontSize: 13, fontWeight: 400, color: '#64748B', maxWidth: '90%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {galleryFiles[galleryIndex].file_name || ''}
              </div>
            </div>
            {galleryFiles.length > 1 ? (
              <button
                onClick={e => { e.stopPropagation(); setGalleryIndex(i => (i - 1 + galleryFiles.length) % galleryFiles.length) }}
                style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#E2E8F0', cursor: 'pointer', borderRadius: 6, padding: 8 }}
              >
                <ChevronLeft size={24} />
              </button>
            ) : null}
            {galleryFiles.length > 1 ? (
              <button
                onClick={e => { e.stopPropagation(); setGalleryIndex(i => (i + 1) % galleryFiles.length) }}
                style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#E2E8F0', cursor: 'pointer', borderRadius: 6, padding: 8 }}
              >
                <ChevronRight size={24} />
              </button>
            ) : null}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
