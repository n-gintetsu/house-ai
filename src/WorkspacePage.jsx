import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Bell, FileText, UserCheck, FileSignature, CreditCard, Map,
  Check, Users, Calendar, Send, AlertCircle, X, MessageSquare,
  Plus, ChevronLeft, Loader, Trash2
} from 'lucide-react'
import { supabase } from './supabaseClient'
import WorkspaceNav from './WorkspaceNav'

const FILES = [
  { id: 1, icon: FileText,      name: '申込書',                    shared: ['顧客', '担当'] },
  { id: 2, icon: UserCheck,     name: '本人確認書類',              shared: ['担当'] },
  { id: 3, icon: FileSignature, name: '重要事項説明書（ドラフト）', shared: ['顧客', '担当', '宅建士'] },
  { id: 4, icon: CreditCard,    name: 'ローン事前審査書類',        shared: ['担当', '銀行'] },
  { id: 5, icon: Map,           name: '物件図面',                  shared: ['顧客', '担当'] },
]

const glass = {
  background: 'rgba(15,23,42,0.85)',
  border: '1px solid rgba(255,255,255,0.08)',
  boxShadow: '0 0 30px rgba(201,168,76,0.15)',
}

const CONTRACT_TYPES = ['賃貸', '売買', '買取', '注文住宅', 'リフォーム', '外構工事', '相続', '登記', '住宅ローン']
const ROLE_OPTIONS = ['顧客', '担当', '司法書士', '銀行', '火災保険', 'リフォーム', '管理会社', '売主', '買主']
const PERMISSION_OPTIONS = ['Owner', 'Manager', 'Member', 'Guest']
const STEP_STATES = ['未着手', '進行中', '承認待ち', '差戻し', '完了']

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
  if (p === 'Owner')   return { bg: 'rgba(201,168,76,0.14)',  color: '#c9a84c',  border: '1px solid rgba(201,168,76,0.25)' }
  if (p === 'Manager') return { bg: 'rgba(59,130,246,0.14)',  color: '#60A5FA',  border: '1px solid rgba(59,130,246,0.25)' }
  if (p === 'Guest')   return { bg: 'rgba(99,102,241,0.14)', color: '#818CF8',  border: '1px solid rgba(99,102,241,0.25)' }
  return { bg: 'rgba(255,255,255,0.07)', color: '#94A3B8', border: '1px solid rgba(255,255,255,0.1)' }
}

// ===================== メインエントリ =====================

export default function WorkspacePage() {
  const workspaceId = new URLSearchParams(window.location.search).get('id')
  return workspaceId ? <DashboardView id={workspaceId} /> : <ListView />
}

// ===================== 案件一覧 =====================

function ListView() {
  const [workspaces, setWorkspaces] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)

  useEffect(() => {
    supabase.from('workspaces').select('*').order('updated_at', { ascending: false })
      .then(({ data }) => { setWorkspaces(data || []); setLoading(false) })
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0A0F1E 0%, #0F172A 100%)', color: '#E2E8F0', fontFamily: "'Noto Sans JP', sans-serif" }}>
      <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, height: 64, background: 'rgba(10,15,30,0.78)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: 12, padding: '0 24px', boxSizing: 'border-box' }}>
        <img src="/logo.png" alt="HOUSE-AI" style={{ height: 34, objectFit: 'contain', flexShrink: 0, filter: 'drop-shadow(0 0 8px rgba(201,168,76,0.6))' }} />
        <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.15)', flexShrink: 0 }} />
        <div style={{ fontSize: 14, fontWeight: 500, color: '#E2E8F0' }}>House-AI Workspace</div>
        <WorkspaceNav current="/workspace" />
        <div style={{ marginLeft: 'auto' }}>
          <button onClick={() => setShowCreate(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#c9a84c', color: '#0A0F1E', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
            <Plus size={15} />
            新規案件作成
          </button>
        </div>
      </header>
      <main style={{ paddingTop: 80, paddingBottom: 40, paddingLeft: 24, paddingRight: 24, maxWidth: 1200, margin: '0 auto', boxSizing: 'border-box' }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: 12 }}>
            <Loader size={20} color="#c9a84c" />
            <span style={{ color: '#64748B', fontSize: 14, fontWeight: 400 }}>読み込み中...</span>
          </div>
        ) : workspaces.length === 0 ? (
          <div style={{ textAlign: 'center', paddingTop: 80 }}>
            <div style={{ fontSize: 14, color: '#64748B', fontWeight: 400, marginBottom: 24 }}>案件がありません。新規案件を作成してください。</div>
            <button onClick={() => setShowCreate(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#c9a84c', color: '#0A0F1E', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
              <Plus size={16} />新規案件作成
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16, paddingTop: 8 }}>
            {workspaces.map(ws => (
              <div key={ws.id} onClick={() => { window.location.href = `/workspace?id=${ws.id}` }} style={{ ...glass, borderRadius: 14, padding: 20, cursor: 'pointer' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, color: '#E2E8F0', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ws.title || '-'}</div>
                    <div style={{ fontSize: 10, color: '#c9a84c', fontWeight: 400, letterSpacing: 1 }}>{ws.ws_code || '-'}</div>
                  </div>
                  <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, fontWeight: 400, background: 'rgba(201,168,76,0.12)', color: '#c9a84c', border: '1px solid rgba(201,168,76,0.3)', whiteSpace: 'nowrap', marginLeft: 8, flexShrink: 0 }}>{ws.status || '-'}</span>
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
            ))}
          </div>
        )}
      </main>
      {showCreate ? <CreateModal onClose={() => setShowCreate(false)} onCreated={(id) => { window.location.href = `/workspace?id=${id}` }} /> : null}
    </div>
  )
}

// ===================== 新規作成モーダル =====================

function CreateModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ title: '', customer_name: '', agent_name: '', contract_type: '売買', property_address: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (key, value) => setForm(prev => ({ ...prev, [key]: value }))

  const handleSubmit = async () => {
    if (!form.title || !form.customer_name || !form.contract_type) { setError('案件名・顧客名・契約種別は必須です。'); return }
    setSubmitting(true); setError('')
    try {
      const { count } = await supabase.from('workspaces').select('*', { count: 'exact', head: true })
      const wsCode = `WS-2026-${String((count || 0) + 1).padStart(6, '0')}`
      const { data: wsData, error: wsErr } = await supabase.from('workspaces').insert({
        ws_code: wsCode, title: form.title, customer_name: form.customer_name,
        agent_name: form.agent_name, contract_type: form.contract_type,
        property_address: form.property_address, status: '進行中', progress: 0,
      }).select().single()
      if (wsErr) throw wsErr
      const labels = getRoadmapLabels(form.contract_type)
      await supabase.from('roadmap_steps').insert(labels.map((label, i) => ({ workspace_id: wsData.id, step_order: i + 1, label, state: i === 0 ? '進行中' : '未着手' })))
      onCreated(wsData.id)
    } catch (e) { setError('作成に失敗しました。' + (e.message || '')); setSubmitting(false) }
  }

  const inputStyle = { fontSize: 16, fontWeight: 400, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#E2E8F0', padding: '10px 14px', borderRadius: 8, width: '100%', boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit' }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.72)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ ...glass, borderRadius: 16, padding: 28, width: '100%', maxWidth: 480 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div style={{ fontSize: 15, fontWeight: 500, color: '#E2E8F0' }}>新規案件作成</div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4 }}><X size={18} color="#64748B" /></button>
        </div>
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
        </div>
        {error ? <div style={{ marginTop: 12, fontSize: 12, color: '#F87171', fontWeight: 400 }}>{error}</div> : null}
        <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
          <button onClick={onClose} style={{ flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#94A3B8', borderRadius: 8, padding: '10px', fontSize: 14, fontWeight: 400, cursor: 'pointer' }}>キャンセル</button>
          <button onClick={handleSubmit} style={{ flex: 1, background: submitting ? 'rgba(201,168,76,0.5)' : '#c9a84c', color: '#0A0F1E', border: 'none', borderRadius: 8, padding: '10px', fontSize: 14, fontWeight: 500, cursor: submitting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            {submitting ? <Loader size={14} /> : null}作成
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
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [chatInput, setChatInput] = useState('')
  const [secretaryOpen, setSecretaryOpen] = useState(true)

  // 編集UI用 state
  const [activeStepPopover, setActiveStepPopover] = useState(null)
  const [showMemberForm, setShowMemberForm] = useState(false)
  const [memberForm, setMemberForm] = useState({ name: '', role_label: '顧客', permission: 'Member' })
  const [showTimelineForm, setShowTimelineForm] = useState(false)
  const [timelineForm, setTimelineForm] = useState({ event_date: '', label: '' })
  const [showScheduleForm, setShowScheduleForm] = useState(false)
  const [scheduleForm, setScheduleForm] = useState({ scheduled_date: '', label: '' })
  const [showNoticeForm, setShowNoticeForm] = useState(false)
  const [noticeForm, setNoticeForm] = useState({ level: 'info', message: '' })
  // insert失敗時にフォーム内に表示するエラー文言
  const [memberError, setMemberError] = useState('')
  const [timelineError, setTimelineError] = useState('')
  const [scheduleError, setScheduleError] = useState('')
  const [noticeError, setNoticeError] = useState('')
  // 家カルテ昇格用
  const [promoting, setPromoting] = useState(false)
  const [promoteMessage, setPromoteMessage] = useState('')

  useEffect(() => {
    async function fetchAll() {
      const { data: ws, error: wsErr } = await supabase.from('workspaces').select('*').eq('id', id).single()
      if (wsErr || !ws) { setNotFound(true); setLoading(false); return }
      setWorkspace(ws)
      const [{ data: stepsData }, { data: membersData }, { data: timelineData }, { data: noticesData }, { data: scheduleData }] = await Promise.all([
        supabase.from('roadmap_steps').select('*').eq('workspace_id', id).order('step_order', { ascending: true }),
        supabase.from('ws_members').select('*').eq('workspace_id', id),
        supabase.from('timeline_events').select('*').eq('workspace_id', id).order('event_date', { ascending: true }),
        supabase.from('ws_notices').select('*').eq('workspace_id', id),
        supabase.from('ws_schedule').select('*').eq('workspace_id', id).order('scheduled_date', { ascending: true }),
      ])
      setSteps(stepsData || [])
      setMembers(membersData || [])
      setTimeline(timelineData || [])
      setNotices(noticesData || [])
      setSchedule(scheduleData || [])
      setLoading(false)
    }
    fetchAll()
  }, [id])

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
      setMemberForm({ name: '', role_label: '顧客', permission: 'Member' })
      setShowMemberForm(false)
    } catch (e) { console.error('ws_members insert error', e); setMemberError('追加に失敗しました: ' + (e.message || '')) }
  }
  const handleDeleteMember = async (memberId) => {
    await supabase.from('ws_members').delete().eq('id', memberId)
    setMembers(prev => prev.filter(m => m.id !== memberId))
  }

  // --- TIMELINE ---
  // 修正: event_textカラム名 → label（実テーブルのカラム名）+ try/catch追加
  const handleAddTimeline = async () => {
    if (!timelineForm.event_date || !timelineForm.label) { setTimelineError('日付と内容は必須です'); return }
    setTimelineError('')
    try {
      const { data, error } = await supabase.from('timeline_events').insert({
        workspace_id: id, event_date: timelineForm.event_date, label: timelineForm.label
      }).select().single()
      if (error) throw error
      setTimeline(prev => [...prev, data].sort((a, b) => a.event_date > b.event_date ? 1 : -1))
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
      const { data, error } = await supabase.from('ws_schedule').insert({
        workspace_id: id, scheduled_date: scheduleForm.scheduled_date, label: scheduleForm.label
      }).select().single()
      if (error) throw error
      setSchedule(prev => [...prev, data].sort((a, b) => a.scheduled_date > b.scheduled_date ? 1 : -1))
      setScheduleForm({ scheduled_date: '', label: '' })
      setShowScheduleForm(false)
    } catch (e) { console.error('ws_schedule insert error', e); setScheduleError('追加に失敗しました: ' + (e.message || '')) }
  }
  const handleDeleteSchedule = async (itemId) => {
    await supabase.from('ws_schedule').delete().eq('id', itemId)
    setSchedule(prev => prev.filter(s => s.id !== itemId))
  }

  // --- NOTICE ---
  // 修正: textカラム名 → message（実テーブルのカラム名）+ try/catch追加
  const handleAddNotice = async () => {
    if (!noticeForm.message) { setNoticeError('通知内容は必須です'); return }
    setNoticeError('')
    try {
      const { data, error } = await supabase.from('ws_notices').insert({
        workspace_id: id, level: noticeForm.level, message: noticeForm.message
      }).select().single()
      if (error) throw error
      setNotices(prev => [...prev, data])
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

  const ws = workspace
  const lastDoneIdx = steps.reduce((acc, s, i) => s.state === '完了' ? i : acc, -1)

  // インラインフォーム共通スタイル
  const fi = { fontSize: 16, fontWeight: 400, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: '#E2E8F0', padding: '6px 10px', borderRadius: 6, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }
  const fiSel = { ...fi, appearance: 'none', WebkitAppearance: 'none' }
  const addBtn = { display: 'flex', alignItems: 'center', gap: 4, background: 'transparent', border: '1px dashed rgba(201,168,76,0.4)', color: '#c9a84c', borderRadius: 6, padding: '5px 10px', fontSize: 12, fontWeight: 400, cursor: 'pointer', width: '100%', justifyContent: 'center', marginTop: 10 }
  const saveBtn = { background: '#c9a84c', color: '#0A0F1E', border: 'none', borderRadius: 6, padding: '6px 14px', fontSize: 13, fontWeight: 500, cursor: 'pointer' }
  const cancelBtn = { background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', color: '#64748B', borderRadius: 6, padding: '6px 12px', fontSize: 13, fontWeight: 400, cursor: 'pointer' }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0A0F1E 0%, #0F172A 100%)', color: '#E2E8F0', fontFamily: "'Noto Sans JP', sans-serif" }}>
      <style>{`
        .ws-grid { display: grid; grid-template-columns: 260px 1fr 280px; gap: 16px; }
        @media (max-width: 960px) { .ws-grid { grid-template-columns: 1fr !important; } }
      `}</style>

      {/* ポップオーバー用バックドロップ */}
      {activeStepPopover ? (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 49 }} onClick={() => setActiveStepPopover(null)} />
      ) : null}

      {/* ヘッダー - 本物ガラス */}
      <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, height: 64, background: 'rgba(10,15,30,0.78)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: 12, padding: '0 20px', boxSizing: 'border-box' }}>
        <img src="/logo.png" alt="HOUSE-AI" style={{ height: 34, objectFit: 'contain', flexShrink: 0, filter: 'drop-shadow(0 0 8px rgba(201,168,76,0.6))' }} />
        <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.15)', flexShrink: 0 }} />
        <button onClick={() => { window.location.href = '/workspace' }} style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px 6px', flexShrink: 0 }}>
          <ChevronLeft size={14} color="#64748B" />
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: '#E2E8F0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ws.customer_name || ''}｜{ws.title || ''}</div>
          <div style={{ fontSize: 10, color: '#c9a84c', fontWeight: 400, letterSpacing: 1 }}>{ws.ws_code || ''}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          {[{ label: '顧客', value: ws.customer_name }, { label: '担当', value: ws.agent_name }, { label: '契約種別', value: ws.contract_type }, { label: 'ステータス', value: ws.status }, { label: '最終更新', value: formatDate(ws.updated_at) }].map(chip => (
            <div key={chip.label} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 6, padding: '3px 8px', textAlign: 'center' }}>
              <div style={{ fontSize: 9, color: '#64748B', fontWeight: 400 }}>{chip.label}</div>
              <div style={{ fontSize: 11, color: '#E2E8F0', fontWeight: 500 }}>{chip.value || '-'}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          <div style={{ width: 100, height: 5, background: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${ws.progress || 0}%`, background: 'linear-gradient(90deg, #c9a84c, #D4AF37)', borderRadius: 3 }} />
          </div>
          <span style={{ fontSize: 11, color: '#c9a84c', fontWeight: 500 }}>{ws.progress || 0}%</span>
        </div>
        {/* 家カルテ保存ボタン */}
        {ws.promoted_at ? (
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
        )}
        <div style={{ position: 'relative', cursor: 'pointer', flexShrink: 0 }}>
          <Bell size={18} color="#94A3B8" />
          {notices.length > 0 ? (
            <div style={{ position: 'absolute', top: -5, right: -5, width: 15, height: 15, background: '#EF4444', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 9, color: '#fff', fontWeight: 500 }}>{notices.length}</span>
            </div>
          ) : null}
        </div>
      </header>
      {/* 家カルテ保存メッセージ（固定トースト） */}
      {promoteMessage ? (
        <div style={{ position: 'fixed', top: 72, right: 20, zIndex: 150, background: 'rgba(15,23,42,0.97)', border: '1px solid rgba(201,168,76,0.45)', borderRadius: 8, padding: '8px 16px', fontSize: 12, color: '#c9a84c', fontWeight: 400, boxShadow: '0 4px 16px rgba(0,0,0,0.4)' }}>
          {promoteMessage}
        </div>
      ) : null}

      <main style={{ paddingTop: 80, paddingBottom: 140, paddingLeft: 20, paddingRight: 20, maxWidth: 1440, margin: '0 auto', boxSizing: 'border-box' }}>
        <div className="ws-grid">

          {/* 左カラム：ファイル（静的） */}
          <div style={{ ...glass, borderRadius: 14, padding: 20, height: 'fit-content' }}>
            <div style={{ fontSize: 10, color: '#c9a84c', fontWeight: 500, letterSpacing: 3, marginBottom: 6 }}>FILE</div>
            <div style={{ fontSize: 14, color: '#E2E8F0', fontWeight: 500, marginBottom: 16 }}>ファイル</div>
            {FILES.map(file => {
              const Icon = file.icon
              return (
                <div key={file.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ flexShrink: 0, marginTop: 2 }}><Icon size={15} color="#c9a84c" /></div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, color: '#CBD5E1', fontWeight: 400, marginBottom: 5, lineHeight: 1.4 }}>{file.name}</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {file.shared.map(tag => <span key={tag} style={{ fontSize: 9, background: 'rgba(99,102,241,0.12)', color: '#818CF8', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 3, padding: '1px 5px', fontWeight: 400 }}>{tag}</span>)}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* 中央カラム */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* ROADMAP */}
            <div style={{ ...glass, borderRadius: 14, padding: 24 }}>
              <div style={{ fontSize: 10, color: '#c9a84c', fontWeight: 500, letterSpacing: 3, marginBottom: 6 }}>ROADMAP</div>
              <div style={{ fontSize: 14, color: '#E2E8F0', fontWeight: 500, marginBottom: 8 }}>進捗ロードマップ（{ws.contract_type || ''}）</div>
              <div style={{ fontSize: 11, color: '#475569', fontWeight: 400, marginBottom: 20 }}>各ステップをクリックして状態を変更できます</div>
              {steps.length === 0 ? (
                <div style={{ fontSize: 12, color: '#475569', fontWeight: 400 }}>ロードマップがありません。</div>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', overflowX: 'auto' }}>
                  {steps.map((step, idx) => {
                    const dotType = stepDotType(step.state)
                    return (
                      <div key={step.id || idx} style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                        <div
                          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, cursor: 'pointer' }}
                          onClick={() => setActiveStepPopover(activeStepPopover === step.id ? null : step.id)}
                        >
                          {dotType === 'done' ? (
                            <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(201,168,76,0.12)', border: '2px solid #c9a84c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
                          <span style={{ fontSize: 10, fontWeight: step.state === '進行中' ? 500 : 400, color: stepLabelColor(step.state), whiteSpace: 'nowrap', textAlign: 'center', maxWidth: 58, lineHeight: 1.3 }}>{step.label}</span>
                        </div>
                        {/* 状態選択ポップオーバー */}
                        {activeStepPopover === step.id ? (
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
                        {idx < steps.length - 1 ? (
                          <div style={{ width: 20, height: 2, background: idx <= lastDoneIdx ? 'rgba(201,168,76,0.55)' : 'rgba(255,255,255,0.1)', marginBottom: 26, flexShrink: 0 }} />
                        ) : null}
                      </div>
                    )
                  })}
                </div>
              )}
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
                    <button onClick={() => handleDeleteTimeline(item.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4, flexShrink: 0, marginTop: 1 }}>
                      <Trash2 size={12} color="#475569" />
                    </button>
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
                <button onClick={() => setShowTimelineForm(true)} style={addBtn}><Plus size={12} />記録を追加</button>
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
                      <button onClick={() => handleDeleteNotice(n.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 2, flexShrink: 0 }}>
                        <Trash2 size={11} color="#475569" />
                      </button>
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
                <button onClick={() => setShowNoticeForm(true)} style={addBtn}><Plus size={12} />通知を追加</button>
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
                        <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 4, fontWeight: 400, background: ps.bg, color: ps.color, border: ps.border }}>{m.permission || 'Member'}</span>
                        <button onClick={() => handleDeleteMember(m.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 2 }}>
                          <Trash2 size={11} color="#475569" />
                        </button>
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
                    {PERMISSION_OPTIONS.map(p => <option key={p} value={p} style={{ background: '#0F172A' }}>{p}</option>)}
                  </select>
                  {memberError ? <div style={{ fontSize: 11, color: '#F87171', fontWeight: 400 }}>{memberError}</div> : null}
                  <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                    <button onClick={() => { setShowMemberForm(false); setMemberForm({ name: '', role_label: '顧客', permission: 'Member' }); setMemberError('') }} style={cancelBtn}>キャンセル</button>
                    <button onClick={handleAddMember} style={saveBtn}>追加</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setShowMemberForm(true)} style={addBtn}><Plus size={12} />関係者を追加</button>
              )}
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
                    <button onClick={() => handleDeleteSchedule(s.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 2, flexShrink: 0 }}>
                      <Trash2 size={11} color="#475569" />
                    </button>
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
                <button onClick={() => setShowScheduleForm(true)} style={addBtn}><Plus size={12} />予定を追加</button>
              )}
            </div>

          </div>
        </div>
      </main>

      {/* AI案件秘書 - 本物ガラス・固定右下 */}
      {secretaryOpen ? (
        <div style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 200, width: 340, background: 'rgba(10,15,30,0.84)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', border: '1px solid rgba(201,168,76,0.32)', borderRadius: 14, boxShadow: '0 8px 40px rgba(0,0,0,0.55), 0 0 20px rgba(201,168,76,0.1)' }}>
          <div style={{ padding: '12px 14px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <img src="/logo.png" alt="AI" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'contain', background: '#000', border: '2px solid #c9a84c', flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: '#E2E8F0', fontWeight: 500 }}>AI案件秘書</span>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#22C55E' }} />
            <button onClick={() => setSecretaryOpen(false)} style={{ marginLeft: 'auto', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 4 }}>
              <X size={14} color="#64748B" />
            </button>
          </div>
          <div style={{ padding: '14px 14px 12px' }}>
            <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '9px 11px', marginBottom: 10 }}>
              <span style={{ fontSize: 13, color: '#CBD5E1', fontWeight: 400, lineHeight: 1.6 }}>{ws.title || '案件'}のAI秘書です。質問はお気軽にどうぞ。</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
              {['火災保険比較を行う', 'リフォーム見積を取得'].map(chip => (
                <button key={chip} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 20, background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.3)', color: '#c9a84c', cursor: 'pointer', fontWeight: 400 }}>{chip}</button>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <textarea value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="AIに質問する..." rows={2} style={{ fontSize: 16, fontWeight: 400, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#E2E8F0', padding: '7px 10px', borderRadius: 7, width: '100%', boxSizing: 'border-box', outline: 'none', resize: 'none', fontFamily: 'inherit' }} />
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button style={{ background: '#c9a84c', color: '#0A0F1E', border: 'none', borderRadius: 7, padding: '6px 14px', fontSize: 13, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Send size={12} />送信
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <button onClick={() => setSecretaryOpen(true)} style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 200, width: 56, height: 56, borderRadius: '50%', background: 'rgba(10,15,30,0.9)', border: '1px solid rgba(201,168,76,0.6)', boxShadow: '0 0 16px rgba(201,168,76,0.4)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
          <MessageSquare size={22} color="#c9a84c" />
        </button>
      )}

    </div>
  )
}
