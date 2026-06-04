import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Bell, FileText, UserCheck, FileSignature, CreditCard, Map,
  Check, Users, Calendar, Send, AlertCircle, X, MessageSquare,
  Plus, ChevronLeft, Loader
} from 'lucide-react'
import { supabase } from './supabaseClient'

// ファイル一覧は次フェーズでDB化予定のため静的
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
    supabase
      .from('workspaces')
      .select('*')
      .order('updated_at', { ascending: false })
      .then(({ data }) => {
        setWorkspaces(data || [])
        setLoading(false)
      })
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0A0F1E 0%, #0F172A 100%)', color: '#E2E8F0', fontFamily: "'Noto Sans JP', sans-serif" }}>

      {/* ヘッダー - 本物ガラス */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        height: 64,
        background: 'rgba(10,15,30,0.78)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        display: 'flex', alignItems: 'center', gap: 12, padding: '0 24px',
        boxSizing: 'border-box',
      }}>
        <img src="/logo.png" alt="HOUSE-AI" style={{ height: 34, objectFit: 'contain', flexShrink: 0, filter: 'drop-shadow(0 0 8px rgba(201,168,76,0.6))' }} />
        <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.15)', flexShrink: 0 }} />
        <div style={{ fontSize: 14, fontWeight: 500, color: '#E2E8F0' }}>House-AI Workspace</div>
        <div style={{ marginLeft: 'auto' }}>
          <button
            onClick={() => setShowCreate(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#c9a84c', color: '#0A0F1E', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
          >
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
            <button
              onClick={() => setShowCreate(true)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#c9a84c', color: '#0A0F1E', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}
            >
              <Plus size={16} />
              新規案件作成
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16, paddingTop: 8 }}>
            {workspaces.map(ws => (
              <div
                key={ws.id}
                onClick={() => { window.location.href = `/workspace?id=${ws.id}` }}
                style={{ ...glass, borderRadius: 14, padding: 20, cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, color: '#E2E8F0', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ws.title || '-'}</div>
                    <div style={{ fontSize: 10, color: '#c9a84c', fontWeight: 400, letterSpacing: 1 }}>{ws.ws_code || '-'}</div>
                  </div>
                  <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, fontWeight: 400, background: 'rgba(201,168,76,0.12)', color: '#c9a84c', border: '1px solid rgba(201,168,76,0.3)', whiteSpace: 'nowrap', marginLeft: 8, flexShrink: 0 }}>{ws.status || '-'}</span>
                </div>
                <div style={{ display: 'flex', gap: 16, marginBottom: 14, flexWrap: 'wrap' }}>
                  {[
                    { label: '顧客',     value: ws.customer_name },
                    { label: '担当',     value: ws.agent_name },
                    { label: '契約種別', value: ws.contract_type },
                  ].map(item => (
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
    if (!form.title || !form.customer_name || !form.contract_type) {
      setError('案件名・顧客名・契約種別は必須です。')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const { count } = await supabase.from('workspaces').select('*', { count: 'exact', head: true })
      const num = (count || 0) + 1
      const wsCode = `WS-2026-${String(num).padStart(6, '0')}`

      const { data: wsData, error: wsErr } = await supabase.from('workspaces').insert({
        ws_code: wsCode,
        title: form.title,
        customer_name: form.customer_name,
        agent_name: form.agent_name,
        contract_type: form.contract_type,
        property_address: form.property_address,
        status: '進行中',
        progress: 0,
      }).select().single()

      if (wsErr) throw wsErr

      const labels = getRoadmapLabels(form.contract_type)
      const steps = labels.map((label, i) => ({
        workspace_id: wsData.id,
        step_order: i + 1,
        label,
        state: i === 0 ? '進行中' : '未着手',
      }))
      await supabase.from('roadmap_steps').insert(steps)

      onCreated(wsData.id)
    } catch (e) {
      setError('作成に失敗しました。' + (e.message || ''))
      setSubmitting(false)
    }
  }

  const inputStyle = {
    fontSize: 16, fontWeight: 400,
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    color: '#E2E8F0',
    padding: '10px 14px',
    borderRadius: 8,
    width: '100%',
    boxSizing: 'border-box',
    outline: 'none',
    fontFamily: 'inherit',
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.72)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ ...glass, borderRadius: 16, padding: 28, width: '100%', maxWidth: 480 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div style={{ fontSize: 15, fontWeight: 500, color: '#E2E8F0' }}>新規案件作成</div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4 }}>
            <X size={18} color="#64748B" />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 6, fontWeight: 400 }}>案件名 *</div>
            <input type="text" value={form.title} onChange={e => handleChange('title', e.target.value)} placeholder="例：山田様 さいたま市〇〇マンション購入" style={inputStyle} />
          </div>
          <div>
            <div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 6, fontWeight: 400 }}>顧客名 *</div>
            <input type="text" value={form.customer_name} onChange={e => handleChange('customer_name', e.target.value)} placeholder="例：山田太郎" style={inputStyle} />
          </div>
          <div>
            <div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 6, fontWeight: 400 }}>担当</div>
            <input type="text" value={form.agent_name} onChange={e => handleChange('agent_name', e.target.value)} placeholder="例：自社スタッフ" style={inputStyle} />
          </div>
          <div>
            <div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 6, fontWeight: 400 }}>契約種別 *</div>
            <select value={form.contract_type} onChange={e => handleChange('contract_type', e.target.value)} style={{ ...inputStyle, appearance: 'none', WebkitAppearance: 'none' }}>
              {CONTRACT_TYPES.map(t => (
                <option key={t} value={t} style={{ background: '#0F172A' }}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 6, fontWeight: 400 }}>物件住所</div>
            <input type="text" value={form.property_address} onChange={e => handleChange('property_address', e.target.value)} placeholder="例：さいたま市大宮区〇〇" style={inputStyle} />
          </div>
        </div>

        {error ? (
          <div style={{ marginTop: 12, fontSize: 12, color: '#F87171', fontWeight: 400 }}>{error}</div>
        ) : null}

        <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
          <button onClick={onClose} style={{ flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#94A3B8', borderRadius: 8, padding: '10px', fontSize: 14, fontWeight: 400, cursor: 'pointer' }}>
            キャンセル
          </button>
          <button
            onClick={handleSubmit}
            style={{ flex: 1, background: submitting ? 'rgba(201,168,76,0.5)' : '#c9a84c', color: '#0A0F1E', border: 'none', borderRadius: 8, padding: '10px', fontSize: 14, fontWeight: 500, cursor: submitting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
          >
            {submitting ? <Loader size={14} /> : null}
            作成
          </button>
        </div>
      </div>
    </div>
  )
}

// ===================== 個別ダッシュボード =====================

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

function DashboardView({ id }) {
  const [workspace, setWorkspace] = useState(null)
  const [steps, setSteps] = useState([])
  const [members, setMembers] = useState([])
  const [timeline, setTimeline] = useState([])
  const [notices, setNotices] = useState([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [chatInput, setChatInput] = useState('')
  const [secretaryOpen, setSecretaryOpen] = useState(true)

  useEffect(() => {
    async function fetchAll() {
      const { data: ws, error: wsErr } = await supabase.from('workspaces').select('*').eq('id', id).single()
      if (wsErr || !ws) { setNotFound(true); setLoading(false); return }
      setWorkspace(ws)
      const [{ data: stepsData }, { data: membersData }, { data: timelineData }, { data: noticesData }] = await Promise.all([
        supabase.from('roadmap_steps').select('*').eq('workspace_id', id).order('step_order', { ascending: true }),
        supabase.from('ws_members').select('*').eq('workspace_id', id),
        supabase.from('timeline_events').select('*').eq('workspace_id', id).order('event_date', { ascending: true }),
        supabase.from('ws_notices').select('*').eq('workspace_id', id),
      ])
      setSteps(stepsData || [])
      setMembers(membersData || [])
      setTimeline(timelineData || [])
      setNotices(noticesData || [])
      setLoading(false)
    }
    fetchAll()
  }, [id])

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
        <button
          onClick={() => { window.location.href = '/workspace' }}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#E2E8F0', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 400, cursor: 'pointer' }}
        >
          <ChevronLeft size={14} />
          一覧に戻る
        </button>
      </div>
    )
  }

  const ws = workspace
  const lastDoneIdx = steps.reduce((acc, s, i) => s.state === '完了' ? i : acc, -1)

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0A0F1E 0%, #0F172A 100%)', color: '#E2E8F0', fontFamily: "'Noto Sans JP', sans-serif" }}>
      <style>{`
        .ws-grid { display: grid; grid-template-columns: 260px 1fr 280px; gap: 16px; }
        @media (max-width: 960px) { .ws-grid { grid-template-columns: 1fr !important; } }
      `}</style>

      {/* ヘッダー - 本物ガラス */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        height: 64,
        background: 'rgba(10,15,30,0.78)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        display: 'flex', alignItems: 'center', gap: 12, padding: '0 20px',
        boxSizing: 'border-box',
      }}>
        <img src="/logo.png" alt="HOUSE-AI" style={{ height: 34, objectFit: 'contain', flexShrink: 0, filter: 'drop-shadow(0 0 8px rgba(201,168,76,0.6))' }} />
        <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.15)', flexShrink: 0 }} />
        <button
          onClick={() => { window.location.href = '/workspace' }}
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px 6px', flexShrink: 0 }}
        >
          <ChevronLeft size={14} color="#64748B" />
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: '#E2E8F0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {ws.customer_name || ''}｜{ws.title || ''}
          </div>
          <div style={{ fontSize: 10, color: '#c9a84c', fontWeight: 400, letterSpacing: 1 }}>{ws.ws_code || ''}</div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          {[
            { label: '顧客',      value: ws.customer_name },
            { label: '担当',      value: ws.agent_name },
            { label: '契約種別',  value: ws.contract_type },
            { label: 'ステータス', value: ws.status },
            { label: '最終更新',  value: formatDate(ws.updated_at) },
          ].map(chip => (
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

        <div style={{ position: 'relative', cursor: 'pointer', flexShrink: 0 }}>
          <Bell size={18} color="#94A3B8" />
          {notices.length > 0 ? (
            <div style={{ position: 'absolute', top: -5, right: -5, width: 15, height: 15, background: '#EF4444', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 9, color: '#fff', fontWeight: 500 }}>{notices.length}</span>
            </div>
          ) : null}
        </div>
      </header>

      {/* メインコンテンツ */}
      <main style={{ paddingTop: 80, paddingBottom: 140, paddingLeft: 20, paddingRight: 20, maxWidth: 1440, margin: '0 auto', boxSizing: 'border-box' }}>
        <div className="ws-grid">

          {/* 左カラム：ファイル（静的・次フェーズでDB化予定） */}
          <div style={{ ...glass, borderRadius: 14, padding: 20, height: 'fit-content' }}>
            <div style={{ fontSize: 10, color: '#c9a84c', fontWeight: 500, letterSpacing: 3, marginBottom: 6 }}>FILE</div>
            <div style={{ fontSize: 14, color: '#E2E8F0', fontWeight: 500, marginBottom: 16 }}>ファイル</div>
            {FILES.map(file => {
              const Icon = file.icon
              return (
                <div key={file.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ flexShrink: 0, marginTop: 2 }}>
                    <Icon size={15} color="#c9a84c" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, color: '#CBD5E1', fontWeight: 400, marginBottom: 5, lineHeight: 1.4 }}>{file.name}</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {file.shared.map(tag => (
                        <span key={tag} style={{ fontSize: 9, background: 'rgba(99,102,241,0.12)', color: '#818CF8', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 3, padding: '1px 5px', fontWeight: 400 }}>{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* 中央カラム：ロードマップ＋タイムライン */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* 進捗ロードマップ */}
            <div style={{ ...glass, borderRadius: 14, padding: 24 }}>
              <div style={{ fontSize: 10, color: '#c9a84c', fontWeight: 500, letterSpacing: 3, marginBottom: 6 }}>ROADMAP</div>
              <div style={{ fontSize: 14, color: '#E2E8F0', fontWeight: 500, marginBottom: 24 }}>進捗ロードマップ（{ws.contract_type || ''}）</div>
              {steps.length === 0 ? (
                <div style={{ fontSize: 12, color: '#475569', fontWeight: 400 }}>ロードマップがありません。</div>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', overflowX: 'auto' }}>
                  {steps.map((step, idx) => {
                    const dotType = stepDotType(step.state)
                    return (
                      <div key={step.id || idx} style={{ display: 'flex', alignItems: 'center' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
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
                              <motion.div
                                animate={{ opacity: [1, 0.3, 1] }}
                                transition={{ duration: 1.2, repeat: Infinity }}
                                style={{ width: 10, height: 10, borderRadius: '50%', background: '#60A5FA' }}
                              />
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
                          <span style={{
                            fontSize: 10,
                            fontWeight: step.state === '進行中' ? 500 : 400,
                            color: stepLabelColor(step.state),
                            whiteSpace: 'nowrap', textAlign: 'center', maxWidth: 58, lineHeight: 1.3,
                          }}>{step.label}</span>
                        </div>
                        {idx < steps.length - 1 ? (
                          <div style={{ width: 20, height: 2, background: idx <= lastDoneIdx ? 'rgba(201,168,76,0.55)' : 'rgba(255,255,255,0.1)', marginBottom: 26, flexShrink: 0 }} />
                        ) : null}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* タイムライン */}
            <div style={{ ...glass, borderRadius: 14, padding: 24 }}>
              <div style={{ fontSize: 10, color: '#c9a84c', fontWeight: 500, letterSpacing: 3, marginBottom: 6 }}>TIMELINE</div>
              <div style={{ fontSize: 14, color: '#E2E8F0', fontWeight: 500, marginBottom: 20 }}>タイムライン</div>
              {timeline.length === 0 ? (
                <div style={{ fontSize: 12, color: '#475569', fontWeight: 400 }}>履歴がありません。</div>
              ) : (
                timeline.map((item, idx) => (
                  <div key={item.id || idx} style={{ display: 'flex', gap: 14 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#c9a84c', marginTop: 3 }} />
                      {idx < timeline.length - 1 ? (
                        <div style={{ width: 1, height: 32, background: 'rgba(201,168,76,0.25)', marginTop: 4 }} />
                      ) : null}
                    </div>
                    <div style={{ paddingBottom: idx < timeline.length - 1 ? 8 : 0 }}>
                      <span style={{ fontSize: 12, color: '#c9a84c', fontWeight: 500, marginRight: 10 }}>{formatEventDate(item.event_date)}</span>
                      <span style={{ fontSize: 13, color: '#94A3B8', fontWeight: 400 }}>{item.event_text || ''}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>

          {/* 右カラム：通知・関係者・次回予定 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* 通知 */}
            <div style={{ ...glass, borderRadius: 14, padding: 18 }}>
              <div style={{ fontSize: 10, color: '#c9a84c', fontWeight: 500, letterSpacing: 3, marginBottom: 6 }}>NOTICE</div>
              <div style={{ fontSize: 14, color: '#E2E8F0', fontWeight: 500, marginBottom: 14 }}>通知</div>
              {notices.length === 0 ? (
                <div style={{ fontSize: 12, color: '#475569', fontWeight: 400 }}>通知はありません。</div>
              ) : (
                notices.map((n, idx) => {
                  const isUrgent = n.level === 'urgent' || n.level === 'high'
                  return (
                    <div key={n.id || idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '9px 10px', borderRadius: 8, background: isUrgent ? 'rgba(239,68,68,0.07)' : 'rgba(255,255,255,0.04)', border: isUrgent ? '1px solid rgba(239,68,68,0.22)' : '1px solid rgba(255,255,255,0.06)', marginBottom: idx < notices.length - 1 ? 8 : 0 }}>
                      <div style={{ flexShrink: 0, marginTop: 1 }}>
                        <AlertCircle size={13} color={isUrgent ? '#F87171' : '#64748B'} />
                      </div>
                      <span style={{ fontSize: 12, color: isUrgent ? '#FCA5A5' : '#94A3B8', fontWeight: 400, lineHeight: 1.5 }}>{n.text || ''}</span>
                    </div>
                  )
                })
              )}
            </div>

            {/* 関係者 */}
            <div style={{ ...glass, borderRadius: 14, padding: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <Users size={12} color="#c9a84c" />
                <span style={{ fontSize: 10, color: '#c9a84c', fontWeight: 500, letterSpacing: 3 }}>MEMBERS</span>
              </div>
              <div style={{ fontSize: 14, color: '#E2E8F0', fontWeight: 500, marginBottom: 14 }}>関係者</div>
              {members.length === 0 ? (
                <div style={{ fontSize: 12, color: '#475569', fontWeight: 400 }}>関係者が登録されていません。</div>
              ) : (
                members.map((m, idx) => (
                  <div key={m.id || idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: idx < members.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                    <div>
                      <div style={{ fontSize: 12, color: '#E2E8F0', fontWeight: 400 }}>{m.name || ''}</div>
                      <div style={{ fontSize: 10, color: '#64748B', fontWeight: 400 }}>{m.role || ''}</div>
                    </div>
                    <span style={{
                      fontSize: 10, padding: '2px 7px', borderRadius: 4, fontWeight: 400,
                      background: m.permission === 'Owner' ? 'rgba(201,168,76,0.14)' : m.permission === 'Guest' ? 'rgba(99,102,241,0.14)' : 'rgba(255,255,255,0.07)',
                      color: m.permission === 'Owner' ? '#c9a84c' : m.permission === 'Guest' ? '#818CF8' : '#94A3B8',
                      border: m.permission === 'Owner' ? '1px solid rgba(201,168,76,0.25)' : m.permission === 'Guest' ? '1px solid rgba(99,102,241,0.25)' : '1px solid rgba(255,255,255,0.1)',
                    }}>{m.permission || 'Member'}</span>
                  </div>
                ))
              )}
            </div>

            {/* 次回予定（スケジュールテーブルは次フェーズ） */}
            <div style={{ ...glass, borderRadius: 14, padding: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <Calendar size={12} color="#c9a84c" />
                <span style={{ fontSize: 10, color: '#c9a84c', fontWeight: 500, letterSpacing: 3 }}>SCHEDULE</span>
              </div>
              <div style={{ fontSize: 14, color: '#E2E8F0', fontWeight: 500, marginBottom: 14 }}>次回予定</div>
              <div style={{ fontSize: 12, color: '#475569', fontWeight: 400 }}>予定がありません。</div>
            </div>

          </div>
        </div>
      </main>

      {/* AI案件秘書 - 本物ガラス・固定右下 */}
      {secretaryOpen ? (
        <div style={{
          position: 'fixed', bottom: 20, right: 20, zIndex: 200,
          width: 340,
          background: 'rgba(10,15,30,0.84)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          border: '1px solid rgba(201,168,76,0.32)',
          borderRadius: 14,
          boxShadow: '0 8px 40px rgba(0,0,0,0.55), 0 0 20px rgba(201,168,76,0.1)',
        }}>
          <div style={{ padding: '12px 14px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <img src="/logo.png" alt="AI" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'contain', background: '#000', border: '2px solid #c9a84c', flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: '#E2E8F0', fontWeight: 500 }}>AI案件秘書</span>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#22C55E' }} />
            <button
              onClick={() => setSecretaryOpen(false)}
              style={{ marginLeft: 'auto', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 4 }}
            >
              <X size={14} color="#64748B" />
            </button>
          </div>
          <div style={{ padding: '14px 14px 12px' }}>
            <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '9px 11px', marginBottom: 10 }}>
              <span style={{ fontSize: 13, color: '#CBD5E1', fontWeight: 400, lineHeight: 1.6 }}>
                {ws.title || '案件'}のAI秘書です。質問はお気軽にどうぞ。
              </span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
              {['火災保険比較を行う', 'リフォーム見積を取得'].map(chip => (
                <button key={chip} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 20, background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.3)', color: '#c9a84c', cursor: 'pointer', fontWeight: 400 }}>
                  {chip}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <textarea
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                placeholder="AIに質問する..."
                rows={2}
                style={{ fontSize: 16, fontWeight: 400, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#E2E8F0', padding: '7px 10px', borderRadius: 7, width: '100%', boxSizing: 'border-box', outline: 'none', resize: 'none', fontFamily: 'inherit' }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button style={{ background: '#c9a84c', color: '#0A0F1E', border: 'none', borderRadius: 7, padding: '6px 14px', fontSize: 13, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Send size={12} />
                  送信
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setSecretaryOpen(true)}
          style={{
            position: 'fixed', bottom: 20, right: 20, zIndex: 200,
            width: 56, height: 56, borderRadius: '50%',
            background: 'rgba(10,15,30,0.9)',
            border: '1px solid rgba(201,168,76,0.6)',
            boxShadow: '0 0 16px rgba(201,168,76,0.4)',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 0,
          }}
        >
          <MessageSquare size={22} color="#c9a84c" />
        </button>
      )}

    </div>
  )
}
