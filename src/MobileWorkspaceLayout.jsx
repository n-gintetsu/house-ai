import { useState, useEffect, useRef } from 'react'
import { Home, FolderOpen, MessageSquare, Calendar, Sparkles, Loader, Check, X, Trash2, Plus, FileText, ChevronDown, ChevronUp, Eye, Send } from 'lucide-react'
import { supabase } from './supabaseClient'

const NAV_TABS = [
  { label: '案件',   icon: Home },
  { label: '資料',   icon: FolderOpen },
  { label: 'チャット', icon: MessageSquare },
  { label: '予定',   icon: Calendar },
  { label: 'AI',    icon: Sparkles },
]

const ROLE_CANON = { owner: 'Owner', manager: 'Manager', staff: 'Staff', customer: 'Customer', broker: 'Broker', judicialscrivener: 'JudicialScrivener', bank: 'Bank', reformcompany: 'ReformCompany', guest: 'Guest', member: 'Member' }
const normRole = (r) => ROLE_CANON[String(r || '').toLowerCase()] || r
const FULL_ACCESS_ROLES = ['Owner', 'Manager', 'Staff', 'Customer']
const ALLOWED_EXTS = ['pdf', 'png', 'jpg', 'jpeg', 'webp']

function makeSafeStoragePath(workspaceId, ext) {
  const rand = crypto.randomUUID().replace(/-/g, '')
  return `${workspaceId}/${Date.now()}_${rand}.${ext}`
}

function formatDate(dateStr) {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return '-'
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}/${m}/${day}`
}

function formatMD(dateStr) {
  if (!dateStr) return ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const p = dateStr.split('-')
    return `${parseInt(p[1])}/${parseInt(p[2])}`
  }
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return ''
  return `${d.getMonth() + 1}/${d.getDate()}`
}

function formatFileSize(bytes) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
}

function stepLabelColor(state) {
  if (state === '完了')    return '#c9a84c'
  if (state === '進行中')  return '#60A5FA'
  if (state === '承認待ち') return '#FCD34D'
  if (state === '差戻し')  return '#F87171'
  return '#475569'
}

function StepDot({ state }) {
  if (state === '完了') {
    return (
      <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(201,168,76,0.12)', border: '2px solid #c9a84c', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Check size={12} color="#c9a84c" />
      </div>
    )
  }
  if (state === '進行中') {
    return (
      <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(59,130,246,0.15)', border: '2px solid #60A5FA', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#60A5FA' }} />
      </div>
    )
  }
  if (state === '承認待ち') {
    return (
      <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(245,158,11,0.15)', border: '2px solid #FCD34D', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#FCD34D' }} />
      </div>
    )
  }
  if (state === '差戻し') {
    return (
      <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(239,68,68,0.15)', border: '2px solid #F87171', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <X size={12} color="#F87171" />
      </div>
    )
  }
  return (
    <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(255,255,255,0.03)', border: '2px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#475569' }} />
    </div>
  )
}

const CARD_STYLE = {
  background: 'rgba(15,23,42,0.85)',
  border: '1px solid rgba(255,255,255,0.08)',
  boxShadow: '0 0 30px rgba(201,168,76,0.15)',
  borderRadius: 16,
  padding: 16,
}

export default function MobileWorkspaceLayout() {
  const id = new URLSearchParams(window.location.search).get('id')
  const [workspace, setWorkspace] = useState(null)
  const [steps, setSteps] = useState([])
  const [schedule, setSchedule] = useState([])
  const [timeline, setTimeline] = useState([])
  const [folders, setFolders] = useState([])
  const [files, setFiles] = useState([])
  const [fileGrants, setFileGrants] = useState([])
  const [orgName, setOrgName] = useState(null)
  const [myMemberId, setMyMemberId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)
  const [activeTab, setActiveTab] = useState(0)
  const [currentUserId, setCurrentUserId] = useState(null)
  const [currentRole, setCurrentRole] = useState(null)
  const [expandedFolders, setExpandedFolders] = useState({})

  // 予定タブ用フォーム state
  const [showScheduleForm, setShowScheduleForm] = useState(false)
  const [scheduleForm, setScheduleForm] = useState({ scheduled_date: '', label: '' })
  const [scheduleError, setScheduleError] = useState('')

  // 資料タブ アップロード state
  const [uploadingFolderId, setUploadingFolderId] = useState(null)
  const [uploadError, setUploadError] = useState('')

  // チャットタブ state
  const [memberMessages, setMemberMessages] = useState([])
  const [memberInput, setMemberInput] = useState('')
  const [isMemberSending, setIsMemberSending] = useState(false)
  const [myDisplayName, setMyDisplayName] = useState('')
  const [chatReads, setChatReads] = useState([])
  const memberComposingRef = useRef(false)
  const memberBottomRef = useRef(null)

  // AIタブ state
  const [workspaceMembers, setWorkspaceMembers] = useState([])
  const [aiInput, setAiInput] = useState('')
  const [aiMessages, setAiMessages] = useState([])
  const [isAiSending, setIsAiSending] = useState(false)
  const aiComposingRef = useRef(false)
  const aiBottomRef = useRef(null)

  useEffect(() => {
    if (!id) { setLoading(false); setFailed(true); return }
    async function fetchAll() {
      const [{ data: wsData, error: wsError }, { data: stepsData }, { data: scheduleData }, { data: timelineData }, { data: foldersData }, { data: filesData }, { data: fileGrantsData }, { data: wsMembersData }] = await Promise.all([
        supabase.from('workspaces').select('*').eq('id', id).is('deleted_at', null).maybeSingle(),
        supabase.from('roadmap_steps').select('id, label, state, step_order').eq('workspace_id', id).order('step_order', { ascending: true }),
        supabase.from('ws_schedule').select('id, scheduled_date, label').eq('workspace_id', id).order('scheduled_date', { ascending: true }),
        supabase.from('timeline_events').select('id, event_date, label').eq('workspace_id', id).order('event_date', { ascending: true }),
        supabase.from('ws_file_folders').select('*').eq('workspace_id', id).order('sort_order', { ascending: true }),
        supabase.from('ws_files').select('*').eq('workspace_id', id).order('created_at', { ascending: false }),
        supabase.from('file_grants').select('*').eq('workspace_id', id),
        supabase.from('workspace_members').select('id, role, display_name, email').eq('workspace_id', id).eq('status', 'active'),
      ])
      if (wsError || !wsData) { setFailed(true); setLoading(false); return }
      setWorkspace(wsData)
      setSteps(stepsData || [])
      setSchedule(scheduleData || [])
      setTimeline(timelineData || [])
      setFolders(foldersData || [])
      setFiles(filesData || [])
      setFileGrants(fileGrantsData || [])
      setWorkspaceMembers(wsMembersData || [])
      const { data: orgNameData } = await supabase.rpc('workspace_org_name', { p_workspace_id: id })
      setOrgName(orgNameData || null)
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        setCurrentUserId(session.user.id)
        const { data: wmData } = await supabase.from('workspace_members').select('id, role, display_name, email').eq('workspace_id', id).eq('user_id', session.user.id).eq('status', 'active').maybeSingle()
        setCurrentRole(wmData ? wmData.role : null)
        setMyMemberId(wmData ? wmData.id : null)
        setMyDisplayName(wmData ? (wmData.display_name || wmData.email || '') : '')
      }
      setLoading(false)
    }
    fetchAll()
  }, [id])

  // チャットポーリング (activeTab === 2 のときだけ)
  useEffect(() => {
    if (!id || activeTab !== 2) return
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
  }, [activeTab, id, currentUserId])

  // チャット最下部スクロール
  useEffect(() => {
    if (memberBottomRef.current) {
      memberBottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [memberMessages])

  // AI秘書 最下部スクロール
  useEffect(() => {
    if (aiBottomRef.current) {
      aiBottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [aiMessages])

  const progress = (workspace && workspace.progress) ? workspace.progress : 0
  const statusColor = (workspace && workspace.status === '完了') ? '#D4AF37' : '#38bdf8'
  const statusBg = (workspace && workspace.status === '完了') ? 'rgba(212,175,55,0.15)' : 'rgba(56,189,248,0.15)'
  const statusBorder = (workspace && workspace.status === '完了') ? 'rgba(212,175,55,0.4)' : 'rgba(56,189,248,0.4)'

  const lastDoneIdx = steps.reduce((acc, s, i) => s.state === '完了' ? i : acc, -1)

  const role = normRole(currentRole)
  const isInternal = ['Owner', 'Manager', 'Staff'].includes(role)
  const canDel = role === 'Owner' || role === 'Manager'
  const isFullAccess = FULL_ACCESS_ROLES.includes(role)

  function getFolderDisplayName(folder) {
    if (folder.is_fixed && folder.role_label === '自社（不動産）') return orgName || '会社'
    if (folder.is_fixed && folder.role_label === '顧客') return (workspace && workspace.customer_name) ? workspace.customer_name + ' 様' : 'お客様'
    return folder.role_label || ''
  }

  function getFolderFiles(folderId) {
    const folderFiles = files.filter(f => f.folder_id === folderId)
    if (isFullAccess) return folderFiles
    if (!myMemberId) return []
    const folderObj = folders.find(f => f.id === folderId)
    const isMyFolder = folderObj ? folderObj.owner_member_id === myMemberId : false
    if (isMyFolder) return folderFiles
    return folderFiles.filter(f => fileGrants.some(g => g.file_id === f.id && g.member_id === myMemberId))
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
      if (res.status === 403) alert('このファイルへのアクセス権限がありません')
      else if (res.status === 401) alert('セッションが切れました。再度ログインしてください')
      else alert('ファイルの取得に失敗しました')
      return null
    }
    return (await res.json()).url
  }

  async function handleUpload(folderId, file) {
    if (!file) return
    const ext = (file.name.split('.').pop() || '').toLowerCase()
    if (!ALLOWED_EXTS.includes(ext)) {
      setUploadError('PDF / PNG / JPG / JPEG / WEBP のみ対応しています。')
      return
    }
    setUploadError('')
    setUploadingFolderId(folderId)
    try {
      const path = makeSafeStoragePath(id, ext)
      const { error: storageErr } = await supabase.storage.from('workspace-files').upload(path, file)
      if (storageErr) throw storageErr
      const { data: dbRow, error: dbErr } = await supabase.from('ws_files').insert({
        workspace_id: id,
        folder_id: folderId,
        file_name: file.name,
        storage_path: path,
        mime_type: file.type,
        size_bytes: file.size,
        doc_type: null,
        uploaded_by: null,
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

  async function handleDeleteFile(wf) {
    if (!window.confirm('このファイルを削除しますか？この操作は取り消せません')) return
    try {
      await supabase.storage.from('workspace-files').remove([wf.storage_path])
      await supabase.from('ws_files').delete().eq('id', wf.id)
      setFiles(prev => prev.filter(f => f.id !== wf.id))
    } catch (e) {
      console.error('file delete error', e)
    }
  }

  const handleMemberSend = async () => {
    const body = memberInput.trim()
    if (!body || isMemberSending) return
    const senderName = myDisplayName
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
    } finally {
      setIsMemberSending(false)
    }
  }

  const buildAiSystemPrompt = () => {
    const stepsText = steps.length > 0
      ? steps.map(s => `  - ${s.label}（${s.state || '未着手'}）`).join('\n')
      : '  （未設定）'
    const membersText = workspaceMembers.length > 0
      ? workspaceMembers.map(m => `  - ${m.role || '-'}：${m.display_name || m.email || '-'}`).join('\n')
      : '  （未設定）'
    const scheduleText = schedule.slice(0, 5).length > 0
      ? schedule.slice(0, 5).map(s => `  - ${s.scheduled_date}：${s.label}`).join('\n')
      : '  （なし）'
    const timelineText = timeline.slice(-5).length > 0
      ? timeline.slice(-5).map(t => `  - ${t.event_date}：${t.label}`).join('\n')
      : '  （なし）'
    const wsFilesText = files.length > 0
      ? files.map(f => {
          const date = f.created_at ? new Date(f.created_at).toLocaleDateString('ja-JP') : ''
          return `  - ${f.file_name || '(不明)'}${f.doc_type ? '（' + f.doc_type + '）' : ''}${date ? ' ' + date + 'アップ' : ''}`
        }).join('\n')
      : '  （アップロード済みファイルなし）'
    const ws = workspace || {}
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
  （なし）

【直近のタイムライン（最新5件）】
${timelineText}

【アップロード済みファイル】
${wsFilesText}

丁寧かつ簡潔に、案件の担当者・顧客の立場に寄り添って回答してください。案件情報に書かれていない内容（Workspaceの使い方、火災保険・リフォーム・住宅ローンなど不動産一般の話題）でも、「案件情報の範囲外です」「サポート窓口へ」などと断らず、知っている範囲でわかりやすく前向き・具体的に答えてください。確実でない点は可能性として軽く補足する程度にとどめ、回答自体は前向きに行ってください。回答はマークダウン記法（#見出し・**強調**・---区切り線・>引用など）を使わず、プレーンな日本語の文章で答えてください。箇条書きが必要なときは行頭に「・」を使い、簡潔に。

【補足情報：利用料金について】
House-AIは現在、無料でご利用いただけます。より多くの方に使っていただきたいという思いから、今のところ有料プランは設けていません。将来、運営の都合で有料プランを設ける可能性はありますが、その場合も必ず事前にご案内し、ご了承いただいてから変更します。勝手に課金されることはありません。
料金について質問されたときは、この内容をわかりやすく簡潔に、優しく不安にさせない表現で伝えてください。`
  }

  const handleAiSend = async (text) => {
    const content = (text !== undefined ? text : aiInput).trim()
    if (!content || isAiSending) return
    setAiInput('')
    const userMsg = { id: Date.now() + '-u', role: 'user', content }
    setAiMessages(prev => [...prev, userMsg])
    setIsAiSending(true)
    try {
      const history = [...aiMessages, userMsg].map(m => ({ role: m.role, content: m.content }))
      const res = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          system: buildAiSystemPrompt(),
          messages: history,
          max_tokens: 900,
        }),
      })
      const data = await res.json()
      const replyText = (data.text && data.text.trim()) ? data.text : 'エラーが発生しました'
      setAiMessages(prev => [...prev, { id: Date.now() + '-a', role: 'assistant', content: replyText }])
    } catch (e) {
      setAiMessages(prev => [...prev, { id: Date.now() + '-e', role: 'assistant', content: 'エラーが発生しました' }])
    }
    setIsAiSending(false)
  }

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
    } catch (e) { setScheduleError('追加に失敗しました: ' + (e.message || '')) }
  }

  const handleDeleteSchedule = async (itemId) => {
    await supabase.from('ws_schedule').delete().eq('id', itemId)
    setSchedule(prev => prev.filter(s => s.id !== itemId))
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0A0F1E', color: '#E2E8F0', fontFamily: "'Noto Sans JP', sans-serif", display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>

      <div style={{ flex: 1, padding: '24px 16px 80px', boxSizing: 'border-box' }}>

        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: 10 }}>
            <Loader size={18} color="#c9a84c" />
            <span style={{ fontSize: 14, fontWeight: 400, color: '#64748B' }}>読み込み中...</span>
          </div>
        ) : failed || !workspace ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 80 }}>
            <span style={{ fontSize: 13, fontWeight: 400, color: '#c9a84c' }}>案件が見つかりません</span>
          </div>
        ) : activeTab === 1 ? (

          /* ===== 資料タブ ===== */
          <div>
            {folders.length === 0 ? (
              <div style={{ ...CARD_STYLE, textAlign: 'center' }}>
                <span style={{ fontSize: 13, fontWeight: 400, color: '#475569' }}>フォルダがありません</span>
              </div>
            ) : (
              folders.map(folder => {
                const folderFiles = getFolderFiles(folder.id)
                const isExpanded = expandedFolders[folder.id] || false
                const displayName = getFolderDisplayName(folder)
                const canUpload = isFullAccess || (myMemberId !== null && folder.owner_member_id === myMemberId)
                const isUploading = uploadingFolderId === folder.id
                return (
                  <div key={folder.id} style={{ ...CARD_STYLE, marginBottom: 12 }}>

                    <div
                      onClick={() => setExpandedFolders(prev => ({ ...prev, [folder.id]: !prev[folder.id] }))}
                      style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
                    >
                      <span style={{ fontSize: 14, fontWeight: 500, color: '#c9a84c', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{displayName}</span>
                      <span style={{ fontSize: 12, fontWeight: 400, color: '#475569', flexShrink: 0 }}>{folderFiles.length}件</span>
                      {isExpanded ? <ChevronUp size={16} color="#475569" /> : <ChevronDown size={16} color="#475569" />}
                    </div>

                    {isExpanded ? (
                      <div style={{ marginTop: 12 }}>
                        {folderFiles.length === 0 ? (
                          <div style={{ fontSize: 13, fontWeight: 400, color: '#475569', textAlign: 'center', padding: '8px 0', borderTop: '1px solid rgba(255,255,255,0.06)' }}>ファイルがありません</div>
                        ) : (
                          folderFiles.map((wf, idx) => (
                            <div key={wf.id || idx} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                              <FileText size={16} color="#c9a84c" style={{ flexShrink: 0 }} />
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 14, fontWeight: 400, color: '#CBD5E1', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{wf.file_name || ''}</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                                  <span style={{ fontSize: 11, fontWeight: 400, color: '#475569' }}>{formatFileSize(wf.size_bytes)}</span>
                                  {wf.doc_type ? (
                                    <span style={{ fontSize: 10, fontWeight: 400, color: '#c9a84c', background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.25)', borderRadius: 3, padding: '1px 5px' }}>{wf.doc_type}</span>
                                  ) : null}
                                </div>
                              </div>
                              <button
                                onClick={async () => {
                                  const url = await getSignedFileUrl(wf.id, 'view')
                                  if (url) window.open(url, '_blank')
                                }}
                                style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', color: '#94A3B8', borderRadius: 6, padding: '5px 10px', fontSize: 12, fontWeight: 400, cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 4 }}
                              >
                                <Eye size={12} color="#94A3B8" />閲覧
                              </button>
                              {canDel ? (
                                <button
                                  onClick={() => handleDeleteFile(wf)}
                                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4, flexShrink: 0 }}
                                >
                                  <Trash2 size={14} color="#475569" />
                                </button>
                              ) : null}
                            </div>
                          ))
                        )}

                        {canUpload ? (
                          <div style={{ marginTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 12 }}>
                            <input
                              type="file"
                              id={`upload-${folder.id}`}
                              accept=".pdf,.png,.jpg,.jpeg,.webp"
                              style={{ position: 'absolute', opacity: 0, width: 0, height: 0, overflow: 'hidden', pointerEvents: 'none' }}
                              onChange={e => {
                                const f = e.target.files ? e.target.files[0] : null
                                e.target.value = ''
                                if (f) handleUpload(folder.id, f)
                              }}
                            />
                            {isUploading ? (
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: '#c9a84c', fontSize: 13, fontWeight: 400 }}>
                                <Loader size={14} color="#c9a84c" />アップロード中...
                              </div>
                            ) : (
                              <label
                                htmlFor={`upload-${folder.id}`}
                                style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'transparent', border: '1px dashed rgba(201,168,76,0.4)', color: '#c9a84c', borderRadius: 6, padding: '8px 12px', fontSize: 14, fontWeight: 400, cursor: 'pointer', width: '100%', justifyContent: 'center', boxSizing: 'border-box' }}
                              >
                                <Plus size={14} color="#c9a84c" />ファイルを追加
                              </label>
                            )}
                            {uploadError ? (
                              <div style={{ fontSize: 12, fontWeight: 400, color: '#F87171', marginTop: 6 }}>{uploadError}</div>
                            ) : null}
                          </div>
                        ) : null}

                      </div>
                    ) : null}

                  </div>
                )
              })
            )}
          </div>

        ) : activeTab === 3 ? (

          /* ===== 予定タブ ===== */
          <div style={CARD_STYLE}>

            <div style={{ fontSize: 12, fontWeight: 500, color: '#c9a84c', marginBottom: 14, letterSpacing: 0.5 }}>予定</div>

            {schedule.length === 0 ? (
              <div style={{ fontSize: 13, fontWeight: 400, color: '#475569', marginBottom: 14 }}>予定はありません</div>
            ) : (
              <div style={{ marginBottom: 14 }}>
                {schedule.map((s, idx) => (
                  <div key={s.id || idx} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: idx < schedule.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                    <div style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.28)', borderRadius: 7, padding: '4px 8px', textAlign: 'center', flexShrink: 0 }}>
                      <div style={{ fontSize: 13, color: '#c9a84c', fontWeight: 500, whiteSpace: 'nowrap' }}>{formatMD(s.scheduled_date)}</div>
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 400, color: '#CBD5E1', flex: 1 }}>{s.label || ''}</span>
                    {canDel ? (
                      <button onClick={() => handleDeleteSchedule(s.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4, flexShrink: 0 }}>
                        <Trash2 size={14} color="#475569" />
                      </button>
                    ) : null}
                  </div>
                ))}
              </div>
            )}

            {showScheduleForm ? (
              <div style={{ marginTop: 8, padding: '12px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <input
                  type="date"
                  value={scheduleForm.scheduled_date}
                  onChange={e => setScheduleForm(prev => ({ ...prev, scheduled_date: e.target.value }))}
                  style={{ fontSize: 16, fontWeight: 400, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: '#E2E8F0', padding: '8px 10px', borderRadius: 6, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', width: '100%', maxWidth: '100%', minWidth: 0, WebkitAppearance: 'none' }}
                />
                <input
                  type="text"
                  value={scheduleForm.label}
                  onChange={e => setScheduleForm(prev => ({ ...prev, label: e.target.value }))}
                  placeholder="内容"
                  style={{ fontSize: 16, fontWeight: 400, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: '#E2E8F0', padding: '8px 10px', borderRadius: 6, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', width: '100%', maxWidth: '100%', minWidth: 0 }}
                />
                {scheduleError ? (
                  <div style={{ fontSize: 12, fontWeight: 400, color: '#F87171' }}>{scheduleError}</div>
                ) : null}
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => { setShowScheduleForm(false); setScheduleForm({ scheduled_date: '', label: '' }); setScheduleError('') }}
                    style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', color: '#64748B', borderRadius: 6, padding: '8px 14px', fontSize: 14, fontWeight: 400, cursor: 'pointer' }}
                  >キャンセル</button>
                  <button
                    onClick={handleAddSchedule}
                    style={{ background: '#c9a84c', color: '#0A0F1E', border: 'none', borderRadius: 6, padding: '8px 16px', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}
                  >追加</button>
                </div>
              </div>
            ) : null}

            {isInternal ? (
              <button
                onClick={() => setShowScheduleForm(true)}
                style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'transparent', border: '1px dashed rgba(201,168,76,0.4)', color: '#c9a84c', borderRadius: 6, padding: '8px 12px', fontSize: 14, fontWeight: 400, cursor: 'pointer', width: '100%', justifyContent: 'center', marginTop: showScheduleForm ? 10 : 0 }}
              >
                <Plus size={14} />予定を追加
              </button>
            ) : null}

          </div>

        ) : activeTab !== 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 80 }}>
            <span style={{ fontSize: 14, fontWeight: 400, color: '#475569' }}>{NAV_TABS[activeTab].label}は準備中です</span>
          </div>
        ) : (
          <div>

            {/* サマリーカード */}
            <div style={CARD_STYLE}>

              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 500, color: '#c9a84c', lineHeight: 1.3 }}>
                    {workspace.customer_name || '-'}様
                  </div>
                  {workspace.ws_code ? (
                    <div style={{ fontSize: 10, fontWeight: 400, color: '#475569', marginTop: 3, letterSpacing: 1 }}>{workspace.ws_code}</div>
                  ) : null}
                </div>
                <span style={{ fontSize: 11, fontWeight: 400, padding: '3px 10px', borderRadius: 20, color: statusColor, background: statusBg, border: `1px solid ${statusBorder}`, whiteSpace: 'nowrap', flexShrink: 0, marginLeft: 8 }}>
                  {workspace.status || '-'}
                </span>
              </div>

              {workspace.title ? (
                <div style={{ fontSize: 14, fontWeight: 500, color: '#E2E8F0', marginBottom: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {workspace.title}
                </div>
              ) : null}

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                {workspace.contract_type ? (
                  <span style={{ fontSize: 11, fontWeight: 400, padding: '3px 10px', borderRadius: 20, color: '#c9a84c', background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.35)' }}>
                    {workspace.contract_type}
                  </span>
                ) : null}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 11, fontWeight: 400, color: '#64748B', minWidth: 40 }}>担当</span>
                  <span style={{ fontSize: 14, fontWeight: 400, color: '#E2E8F0' }}>{workspace.agent_name || '-'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 11, fontWeight: 400, color: '#64748B', minWidth: 40 }}>更新日</span>
                  <span style={{ fontSize: 14, fontWeight: 400, color: '#E2E8F0' }}>{formatDate(workspace.updated_at)}</span>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontSize: 11, fontWeight: 400, color: '#64748B' }}>進捗</span>
                  <span style={{ fontSize: 12, fontWeight: 500, color: '#c9a84c' }}>{progress}%</span>
                </div>
                <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg, #c9a84c, #D4AF37)', borderRadius: 3, transition: 'width 0.4s ease' }} />
                </div>
              </div>

            </div>

            {/* ロードマップカード */}
            {steps.length > 0 ? (
              <div style={{ ...CARD_STYLE, marginTop: 16 }}>

                <div style={{ fontSize: 12, fontWeight: 500, color: '#c9a84c', marginBottom: 16, letterSpacing: 0.5 }}>進捗ロードマップ</div>

                <div style={{ paddingLeft: 4 }}>
                  {steps.map((step, idx) => {
                    const isLast = idx === steps.length - 1
                    const lineColor = idx < lastDoneIdx ? 'rgba(201,168,76,0.55)' : 'rgba(255,255,255,0.1)'
                    return (
                      <div key={step.id || idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>

                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                          <StepDot state={step.state} />
                          {isLast ? null : (
                            <div style={{ width: 2, flex: 1, minHeight: 24, background: lineColor, marginTop: 3, marginBottom: 3 }} />
                          )}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingBottom: isLast ? 0 : 20, minHeight: 18 }}>
                          <span style={{ fontSize: 14, fontWeight: step.state === '進行中' ? 500 : 400, color: stepLabelColor(step.state) }}>
                            {step.label}
                          </span>
                          {step.state === '進行中' ? (
                            <span style={{ fontSize: 10, fontWeight: 400, padding: '2px 7px', borderRadius: 20, color: '#60A5FA', background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(96,165,250,0.35)', whiteSpace: 'nowrap' }}>
                              進行中
                            </span>
                          ) : null}
                        </div>

                      </div>
                    )
                  })}
                </div>

              </div>
            ) : null}

            {/* 次回予定カード */}
            <div style={{ ...CARD_STYLE, marginTop: 16 }}>

              <div style={{ fontSize: 12, fontWeight: 500, color: '#c9a84c', marginBottom: 14, letterSpacing: 0.5 }}>次回予定</div>

              {schedule.length === 0 ? (
                <div style={{ fontSize: 13, fontWeight: 400, color: '#475569' }}>予定はありません</div>
              ) : (
                <div>
                  {schedule.map((s, idx) => (
                    <div key={s.id || idx} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: idx < schedule.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                      <div style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.28)', borderRadius: 7, padding: '4px 8px', textAlign: 'center', flexShrink: 0 }}>
                        <div style={{ fontSize: 13, color: '#c9a84c', fontWeight: 500, whiteSpace: 'nowrap' }}>{formatMD(s.scheduled_date)}</div>
                      </div>
                      <span style={{ fontSize: 14, fontWeight: 400, color: '#CBD5E1', flex: 1 }}>{s.label || ''}</span>
                    </div>
                  ))}
                </div>
              )}

            </div>

            {/* タイムラインカード */}
            <div style={{ ...CARD_STYLE, marginTop: 16 }}>

              <div style={{ fontSize: 12, fontWeight: 500, color: '#c9a84c', marginBottom: 14, letterSpacing: 0.5 }}>タイムライン</div>

              {timeline.length === 0 ? (
                <div style={{ fontSize: 13, fontWeight: 400, color: '#475569' }}>履歴はありません</div>
              ) : (
                <div>
                  {timeline.map((item, idx) => {
                    const isLast = idx === timeline.length - 1
                    return (
                      <div key={item.id || idx} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#c9a84c', marginTop: 3, flexShrink: 0 }} />
                          {isLast ? null : (
                            <div style={{ width: 1, height: 32, background: 'rgba(201,168,76,0.25)', marginTop: 4 }} />
                          )}
                        </div>
                        <div style={{ flex: 1, paddingBottom: isLast ? 0 : 8 }}>
                          <span style={{ fontSize: 13, color: '#c9a84c', fontWeight: 500, marginRight: 10 }}>{formatMD(item.event_date)}</span>
                          <span style={{ fontSize: 14, fontWeight: 400, color: '#94A3B8' }}>{item.label || ''}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

            </div>

          </div>
        )}

      </div>

      {/* ===== チャットタブ: position fixed で全面表示 (下部ナビより下) ===== */}
      {activeTab === 2 ? (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 64, zIndex: 100, background: '#0A0F1E', display: 'flex', flexDirection: 'column' }}>

          {/* ヘッダー */}
          <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid rgba(255,255,255,0.08)', flexShrink: 0 }}>
            <span style={{ fontSize: 14, fontWeight: 500, color: '#E2E8F0' }}>チャット</span>
          </div>

          {/* メッセージエリア */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {memberMessages.length === 0 ? (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 13, color: '#475569', fontWeight: 400 }}>まだメッセージはありません</span>
              </div>
            ) : (
              memberMessages.map(msg => {
                const isMe = msg.user_id === currentUserId
                const timeStr = msg.created_at ? new Date(msg.created_at).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }) : ''
                const readCount = isMe ? chatReads.filter(r => r.user_id !== currentUserId && new Date(r.last_read_at) >= new Date(msg.created_at)).length : 0
                return (
                  <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                    {isMe ? null : (
                      <span style={{ fontSize: 11, color: '#64748B', fontWeight: 400, marginBottom: 2, paddingLeft: 2 }}>{msg.sender_name || '不明'}</span>
                    )}
                    <div style={{ maxWidth: '80%', padding: '8px 12px', borderRadius: isMe ? '12px 12px 3px 12px' : '12px 12px 12px 3px', background: isMe ? 'rgba(59,130,246,0.18)' : 'rgba(255,255,255,0.07)', border: isMe ? '1px solid rgba(59,130,246,0.38)' : '1px solid rgba(255,255,255,0.1)', fontSize: 14, color: '#E2E8F0', fontWeight: 400, lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                      {msg.body}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2, paddingRight: isMe ? 2 : 0, paddingLeft: isMe ? 0 : 2 }}>
                      {isMe && readCount > 0 ? (
                        <span style={{ fontSize: 10, color: '#64748B', fontWeight: 400 }}>{readCount === 1 ? '既読' : '既読 ' + readCount}</span>
                      ) : null}
                      <span style={{ fontSize: 10, color: '#475569', fontWeight: 400 }}>{timeStr}</span>
                    </div>
                  </div>
                )
              })
            )}
            <div ref={memberBottomRef} />
          </div>

          {/* 入力エリア */}
          <div style={{ flexShrink: 0, padding: '8px 16px 10px', borderTop: '1px solid rgba(255,255,255,0.08)', background: '#0A0F1E', display: 'flex', gap: 8, alignItems: 'flex-end' }}>
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
              placeholder="メッセージを入力...（Shift+Enterで改行）"
              rows={2}
              style={{ flex: 1, fontSize: 16, fontWeight: 400, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#E2E8F0', padding: '8px 10px', borderRadius: 8, outline: 'none', resize: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
            />
            <button
              onClick={handleMemberSend}
              disabled={isMemberSending || !memberInput.trim()}
              style={{ background: (isMemberSending || !memberInput.trim()) ? 'rgba(59,130,246,0.3)' : '#3b82f6', color: '#ffffff', border: 'none', borderRadius: 8, padding: '10px 14px', fontSize: 14, fontWeight: 500, cursor: (isMemberSending || !memberInput.trim()) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, flexShrink: 0 }}
            >
              <Send size={15} />送信
            </button>
          </div>

        </div>
      ) : null}

      {/* ===== AIタブ: position fixed で全面表示 (下部ナビより下) ===== */}
      {activeTab === 4 ? (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 64, zIndex: 100, background: '#0A0F1E', display: 'flex', flexDirection: 'column' }}>

          {/* ヘッダー */}
          <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid rgba(201,168,76,0.18)', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sparkles size={16} color="#c9a84c" />
            <span style={{ fontSize: 14, fontWeight: 500, color: '#E2E8F0' }}>AI秘書</span>
          </div>

          {/* メッセージエリア */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {aiMessages.length === 0 ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
                <span style={{ fontSize: 13, color: '#475569', fontWeight: 400 }}>案件について何でも聞いてください</span>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
                  {['Workspaceの使い方', '利用料金について'].map(chip => (
                    <button key={chip} onClick={() => handleAiSend(chip)} disabled={isAiSending} style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.3)', color: isAiSending ? '#64748B' : '#c9a84c', borderRadius: 20, fontSize: 12, padding: '5px 12px', fontWeight: 400, cursor: isAiSending ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>{chip}</button>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {aiMessages.map(msg => (
                  <div key={msg.id} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                    <div style={{ maxWidth: '80%', padding: '8px 12px', borderRadius: msg.role === 'user' ? '12px 12px 3px 12px' : '12px 12px 12px 3px', background: msg.role === 'user' ? 'rgba(201,168,76,0.18)' : 'rgba(255,255,255,0.07)', border: msg.role === 'user' ? '1px solid rgba(201,168,76,0.35)' : '1px solid rgba(255,255,255,0.1)', fontSize: 14, color: '#E2E8F0', fontWeight: 400, lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isAiSending ? (
                  <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                    <div style={{ padding: '8px 12px', borderRadius: '12px 12px 12px 3px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', fontSize: 14, color: '#64748B', fontWeight: 400 }}>考え中...</div>
                  </div>
                ) : null}
                <div ref={aiBottomRef} />
              </div>
            )}
          </div>

          {/* 入力エリア */}
          <div style={{ flexShrink: 0, padding: '8px 16px 10px', borderTop: '1px solid rgba(201,168,76,0.18)', background: '#0A0F1E', display: 'flex', gap: 8, alignItems: 'flex-end' }}>
            <textarea
              value={aiInput}
              onChange={e => setAiInput(e.target.value)}
              onCompositionStart={() => { aiComposingRef.current = true }}
              onCompositionEnd={() => { aiComposingRef.current = false }}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey && !aiComposingRef.current) {
                  e.preventDefault()
                  handleAiSend()
                }
              }}
              placeholder="AIに質問する...（Shift+Enterで改行）"
              rows={2}
              style={{ flex: 1, fontSize: 16, fontWeight: 400, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(201,168,76,0.22)', color: '#E2E8F0', padding: '8px 10px', borderRadius: 8, outline: 'none', resize: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
            />
            <button
              onClick={() => handleAiSend()}
              disabled={isAiSending || !aiInput.trim()}
              style={{ background: (isAiSending || !aiInput.trim()) ? 'rgba(201,168,76,0.3)' : '#c9a84c', color: '#0A0F1E', border: 'none', borderRadius: 8, padding: '10px 14px', fontSize: 14, fontWeight: 500, cursor: (isAiSending || !aiInput.trim()) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, flexShrink: 0 }}
            >
              <Send size={15} />送信
            </button>
          </div>

        </div>
      ) : null}

      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: 64, background: 'rgba(10,15,30,0.97)', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-around', zIndex: 200, boxSizing: 'border-box' }}>
        {NAV_TABS.map((tab, i) => {
          const Icon = tab.icon
          const active = activeTab === i
          return (
            <div key={tab.label} onClick={() => setActiveTab(i)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flex: 1, cursor: 'pointer' }}>
              <Icon size={20} color={active ? '#c9a84c' : '#475569'} />
              <span style={{ fontSize: 10, fontWeight: 400, color: active ? '#c9a84c' : '#475569' }}>{tab.label}</span>
            </div>
          )
        })}
      </div>

    </div>
  )
}
