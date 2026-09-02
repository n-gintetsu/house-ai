import { useState, useEffect, useRef } from 'react'
import { ChevronUp, ChevronDown, ArrowLeft } from 'lucide-react'
import { GROUPS } from '../lib/juusetsu-schema.js'
import { supabase } from './supabaseClient'

const MAX_TOTAL_FILE_BYTES = 2500000
const MAX_FILE_COUNT = 8
const MAX_IMAGE_EDGE = 2000

function readAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : ''
      if (result.indexOf(',') === -1) {
        reject(new Error('書類の読み込みに失敗しました'))
        return
      }
      resolve(result)
    }
    reader.onerror = () => reject(new Error('書類の読み込みに失敗しました'))
    reader.readAsDataURL(file)
  })
}

function base64Part(dataUrl) {
  return dataUrl.slice(dataUrl.indexOf(',') + 1)
}

function isHeic(file) {
  const type = (file.type || '').toLowerCase()
  const name = (file.name || '').toLowerCase()
  return (
    type === 'image/heic' ||
    type === 'image/heif' ||
    name.endsWith('.heic') ||
    name.endsWith('.heif')
  )
}

// 画像は長辺2000pxまで縮小したうえでJPEGに変換する
function processImage(file) {
  return readAsDataUrl(file).then(dataUrl => new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      let width = img.width
      let height = img.height
      const longEdge = width > height ? width : height
      if (longEdge > MAX_IMAGE_EDGE) {
        const scale = MAX_IMAGE_EDGE / longEdge
        width = Math.round(width * scale)
        height = Math.round(height * scale)
      }
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, width, height)
      const out = canvas.toDataURL('image/jpeg', 0.92)
      const data = base64Part(out)
      resolve({
        name: file.name,
        data: data,
        mediaType: 'image/jpeg',
        bytes: Math.round(data.length * 0.75),
      })
    }
    img.onerror = () => reject(new Error('画像の読み込みに失敗しました'))
    img.src = dataUrl
  }))
}

function processPdf(file) {
  return readAsDataUrl(file).then(dataUrl => {
    const data = base64Part(dataUrl)
    return {
      name: file.name,
      data: data,
      mediaType: 'application/pdf',
      bytes: Math.round(data.length * 0.75),
    }
  })
}

function processFile(file) {
  const type = (file.type || '').toLowerCase()
  const name = (file.name || '').toLowerCase()
  if (isHeic(file)) {
    return Promise.reject(new Error('HEIC形式は対応していません。PNGまたはJPEGで保存し直してください'))
  }
  if (type === 'application/pdf' || name.endsWith('.pdf')) {
    return processPdf(file)
  }
  if (type === 'image/jpeg' || type === 'image/png' || type === 'image/webp') {
    return processImage(file)
  }
  if (name.endsWith('.jpg') || name.endsWith('.jpeg') || name.endsWith('.png') || name.endsWith('.webp')) {
    return processImage(file)
  }
  return Promise.reject(new Error('対応していない形式のファイルです。PDFまたは画像（JPEG・PNG・WebP）を選択してください'))
}

// AIが返す value（'外' 'ア' 等）を画面表示用の label に読み替える。
// 一致する選択肢が無ければ value をそのまま返す。
function optionLabel(options, value) {
  if (!Array.isArray(options)) return value
  for (const o of options) {
    if (typeof o === 'string') {
      if (o === value) return o
    } else if (o && o.value === value) {
      return o.label || o.value
    }
  }
  return value
}

// サーバーが返す code に応じてメッセージと再ログイン要否を決める
function describeApiError(data) {
  const code = data ? data.code : ''
  if (code === 'no_token' || code === 'invalid_token') {
    const e = new Error('ログインの有効期限が切れました。再度ログインしてください')
    e.needLogin = true
    return e
  }
  if (code === 'limit_reached') {
    const used = data ? data.used : null
    const limit = data ? data.limit : null
    const suffix =
      typeof used === 'number' && typeof limit === 'number'
        ? `（${used}/${limit}回）`
        : ''
    return new Error('無料でお試しいただける回数の上限に達しました' + suffix)
  }
  return new Error((data && data.error) || 'ドラフト生成に失敗しました')
}

function formatMb(bytes) {
  return (bytes / 1000000).toFixed(1) + 'MB'
}

function formatChatText(text) {
  return text
    .replace(/^#{1,3}\s+/gm, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/^[*-]\s/gm, '・')
    .replace(/\n{3,}/g, '\n\n')
}

export default function ProDocsPage() {
  const [screen, setScreen] = useState('input')
  const [address, setAddress] = useState('')
  const [propertyType, setPropertyType] = useState('')
  const [ageYears, setAgeYears] = useState('')
  const [pdfs, setPdfs] = useState([])
  const [logIndex, setLogIndex] = useState(0)
  const [draft, setDraft] = useState(null)
  const [activeItem, setActiveItem] = useState(0)
  const [chatMessages, setChatMessages] = useState([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [menuCollapsed, setMenuCollapsed] = useState(false)
  const [fileError, setFileError] = useState('')
  const [apiError, setApiError] = useState('')
  const [regenLoading, setRegenLoading] = useState(false)
  const [regenError, setRegenError] = useState('')
  const [progressDone, setProgressDone] = useState(0)
  const [progressTotal, setProgressTotal] = useState(0)
  const [failedGroups, setFailedGroups] = useState([])
  const [fileProcessing, setFileProcessing] = useState(false)
  const [user, setUser] = useState(null)
  const [authChecking, setAuthChecking] = useState(true)
  const [runId, setRunId] = useState('')
  const [apiNeedLogin, setApiNeedLogin] = useState(false)
  const [regenNeedLogin, setRegenNeedLogin] = useState(false)
  const [templateFile, setTemplateFile] = useState(null)
  const [exportLoading, setExportLoading] = useState(false)
  const [exportError, setExportError] = useState('')
  const [exportNeedLogin, setExportNeedLogin] = useState(false)
  const [exportResult, setExportResult] = useState(null)
  // 宅建士の手入力。draft とは別に持ち、作り直しで消えないようにする
  // 形式: { カテゴリkey: { フィールドkey: 文字列 } }
  const [manualEdits, setManualEdits] = useState({})

  const fileInputRef = useRef(null)
  const addFileInputRef = useRef(null)
  const regenFileInputRef = useRef(null)
  const templateInputRef = useRef(null)
  const chatEndRef = useRef(null)
  const apiCalledRef = useRef(false)

  const logs = ['書類受付中...', '登記簿解析中...', '管理規約解析中...', '用途地域確認中...', 'ハザード情報取得中...', 'ドラフト生成中...']

  // 物件種別に該当するカテゴリだけを GROUPS の定義順に並べる
  const menuItems = []
  for (const g of GROUPS) {
    for (const c of g.categories) {
      if (c.appliesTo.indexOf(propertyType) !== -1) {
        menuItems.push(c)
      }
    }
  }

  useEffect(() => {
    let mounted = true
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return
      const session = data ? data.session : null
      setUser(session ? session.user : null)
      setAuthChecking(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return
      setUser(session ? session.user : null)
      setAuthChecking(false)
    })
    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  // 初回生成とドラフト画面からの再生成で共通利用する。
  // g1 から g5 まで必ず直列で呼ぶ（並列にするとプロンプトキャッシュが効かずコストが跳ねる）。
  const generateDraft = (onFirstGroupDone) => {
    // 1回の生成（g1〜g5）は同じ runId を使い、無料枠の消費を1回分にする
    const currentRunId = runId || crypto.randomUUID()
    if (currentRunId !== runId) setRunId(currentRunId)

    setProgressTotal(GROUPS.length)
    setProgressDone(0)
    setFailedGroups([])
    const confidences = []

    const runGroup = (groupId, encoded) => {
      // 有効期限切れを避けるため、呼び出し直前に毎回セッションを取り直す
      return supabase.auth.getSession()
      .then(({ data }) => {
        const session = data ? data.session : null
        const token = session ? session.access_token : ''
        if (!token) {
          const e = new Error('ログインの有効期限が切れました。再度ログインしてください')
          e.needLogin = true
          throw e
        }
        return fetch('/api/pro-docs-draft', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token,
          },
          body: JSON.stringify({ address, propertyType, ageYears, pdfs: encoded, group: groupId, runId: currentRunId })
        })
      })
      .then(r => r.json().catch(() => ({})).then(data => {
        if (!r.ok) throw describeApiError(data)
        return data
      }))
      .then(data => {
        // 対象カテゴリが無いグループはサーバーがスキップを返す
        if (data.skipped === true) return
        const text = data.text || ''
        const clean = text.replace(/```json|```/g, '').trim()
        const parsed = JSON.parse(clean)
        if (parsed.meta && typeof parsed.meta.confidence === 'number') {
          confidences.push(parsed.meta.confidence)
        }
        const merged = {}
        for (const k of Object.keys(parsed)) {
          if (k !== 'meta') merged[k] = parsed[k]
        }
        let avg = 0
        if (confidences.length > 0) {
          let sum = 0
          for (const c of confidences) {
            sum = sum + c
          }
          avg = Math.round(sum / confidences.length)
        }
        const warnings = (parsed.meta && parsed.meta.warnings) || []
        // 返ってきたキーだけを上書きし、既に埋まったカテゴリは保持する
        setDraft(prev => Object.assign({}, prev || {}, merged, {
          meta: { confidence: avg, warnings: warnings },
        }))
      })
    }

    // 選択時に変換済みなのでそのまま送る（bytes は送らない）
    const encoded = pdfs.map(f => ({ name: f.name, data: f.data, mediaType: f.mediaType }))

    return Promise.resolve().then(() => {
      let chain = Promise.resolve()
      GROUPS.forEach((g, index) => {
        chain = chain.then(() =>
          runGroup(g.id, encoded)
            .then(() => {
              setProgressDone(index + 1)
              if (index === 0 && onFirstGroupDone) onFirstGroupDone()
            })
            .catch(err => {
              // 先頭グループの失敗は全体の失敗として扱う（画面遷移の判断に使う）
              if (index === 0) throw err
              setFailedGroups(prev => prev.concat([g.id]))
              setProgressDone(index + 1)
            })
        )
      })
      return chain
    })
  }

  useEffect(() => {
    if (screen !== 'analyzing') return
    if (logIndex < logs.length - 1) {
      const timer = setTimeout(() => setLogIndex(prev => prev + 1), 1000)
      return () => clearTimeout(timer)
    }
    if (apiCalledRef.current) return
    apiCalledRef.current = true
    const timer = setTimeout(() => {
      generateDraft(() => { setScreen('draft') })
      .catch(err => {
        setApiError((err && err.message) || 'ドラフト生成に失敗しました')
        setApiNeedLogin(err && err.needLogin === true)
        apiCalledRef.current = false
        setScreen('input')
      })
    }, 1000)
    return () => clearTimeout(timer)
  }, [screen, logIndex])

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [chatMessages])

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)
    e.target.value = ''
    if (files.length === 0) return

    setFileError('')
    setFileProcessing(true)

    // 1件ずつ変換し、上限に達したらそこで打ち切る
    let accepted = pdfs.slice()
    let errorMessage = ''
    let chain = Promise.resolve()

    files.forEach(file => {
      chain = chain.then(() => {
        if (accepted.length >= MAX_FILE_COUNT) {
          errorMessage = '書類は最大8件までです'
          return null
        }
        return processFile(file)
          .then(processed => {
            let totalSize = processed.bytes
            for (const f of accepted) {
              totalSize = totalSize + f.bytes
            }
            if (totalSize > MAX_TOTAL_FILE_BYTES) {
              errorMessage = '書類の合計サイズが上限（2.5MB）を超えています'
              return null
            }
            accepted = accepted.concat([processed])
            return null
          })
          .catch(err => {
            errorMessage = (err && err.message) || '書類の読み込みに失敗しました'
            return null
          })
      })
    })

    chain.then(() => {
      setPdfs(accepted)
      setFileError(errorMessage)
      setFileProcessing(false)
    })
  }

  const removeFile = (index) => {
    setFileError('')
    setPdfs(prev => prev.filter((_, i) => i !== index))
  }

  const handleRegenerate = () => {
    if (regenLoading) return
    setRegenLoading(true)
    setRegenError('')
    setRegenNeedLogin(false)
    generateDraft()
      .then(() => { setRegenLoading(false) })
      .catch(err => {
        setRegenError((err && err.message) || 'ドラフト生成に失敗しました')
        setRegenNeedLogin(err && err.needLogin === true)
        setRegenLoading(false)
      })
  }

  const handleTemplateChange = (e) => {
    const files = Array.from(e.target.files)
    e.target.value = ''
    if (files.length === 0) return
    setExportError('')
    setExportNeedLogin(false)
    setExportResult(null)
    setTemplateFile(files[0])
  }

  const handleExport = () => {
    if (!templateFile || exportLoading) return
    setExportLoading(true)
    setExportError('')
    setExportNeedLogin(false)
    setExportResult(null)

    readAsDataUrl(templateFile)
      .then(dataUrl => {
        const template = base64Part(dataUrl)
        return supabase.auth.getSession().then(({ data }) => {
          const session = data ? data.session : null
          const token = session ? session.access_token : ''
          if (!token) {
            const e = new Error('ログインの有効期限が切れました。再度ログインしてください')
            e.needLogin = true
            throw e
          }
          return fetch('/api/juusetsu-export', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: 'Bearer ' + token,
            },
            body: JSON.stringify({ template: template, draft: buildMergedDraft() }),
          })
        })
      })
      .then(r => r.json().catch(() => ({})).then(data => {
        if (!r.ok) throw describeApiError(data)
        return data
      }))
      .then(data => {
        const binary = atob(data.file || '')
        const bytes = new Uint8Array(binary.length)
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i)
        }
        const blob = new Blob([bytes], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = data.filename || '重要事項説明書_下書き.xlsx'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        setExportResult({
          written: data.written || 0,
          skipped: Array.isArray(data.skipped) ? data.skipped.length : 0,
        })
        setExportLoading(false)
      })
      .catch(err => {
        setExportError((err && err.message) || '転記に失敗しました')
        setExportNeedLogin(err && err.needLogin === true)
        setExportLoading(false)
      })
  }

  const handleChatSubmit = () => {
    if (!chatInput.trim() || chatLoading) return
    const userMsg = chatInput.trim()
    setChatMessages(prev => [...prev, { role: 'user', content: userMsg }])
    setChatInput('')
    setChatLoading(true)
    fetch('/api/claude', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 1000,
        source_tool: 'main',
        feature: 'pro_docs_chat',
        system: 'あなたは重要事項説明書の専門家です。宅建士・不動産業者の質問に簡潔に答えてください。',
        messages: [
          ...chatMessages.map(m => ({ role: m.role, content: m.content })),
          { role: 'user', content: userMsg }
        ]
      })
    })
    .then(r => r.json())
    .then(data => {
      setChatMessages(prev => [...prev, { role: 'assistant', content: data.text || '回答を取得できませんでした' }])
      setChatLoading(false)
    })
    .catch(() => {
      setChatMessages(prev => [...prev, { role: 'assistant', content: 'エラーが発生しました。' }])
      setChatLoading(false)
    })
  }

  // 手入力を最優先し、無ければ draft の値を返す。
  // draft の値は文字列か { value, note } のどちらか。
  const getFieldValue = (categoryKey, fieldKey) => {
    const edits = manualEdits[categoryKey]
    if (edits && typeof edits[fieldKey] === 'string' && edits[fieldKey] !== '') {
      return edits[fieldKey]
    }
    const section = draft ? draft[categoryKey] : null
    const raw = section && typeof section === 'object' ? section[fieldKey] : null
    if (raw === null || raw === undefined) return null
    if (typeof raw === 'object') {
      const v = raw.value
      return v === null || v === undefined || v === '' ? null : v
    }
    return raw === '' ? null : raw
  }

  const isManualField = (categoryKey, fieldKey) => {
    const edits = manualEdits[categoryKey]
    return edits && typeof edits[fieldKey] === 'string' && edits[fieldKey] !== '' ? true : false
  }

  const hasManualInCategory = (categoryKey) => {
    const edits = manualEdits[categoryKey]
    if (!edits) return false
    for (const k of Object.keys(edits)) {
      if (typeof edits[k] === 'string' && edits[k] !== '') return true
    }
    return false
  }

  // 空文字はキーごと削除し、AIの値に戻す
  const updateManualEdit = (categoryKey, fieldKey, text) => {
    setManualEdits(prev => {
      const next = Object.assign({}, prev)
      const section = Object.assign({}, next[categoryKey] || {})
      if (text === '') {
        delete section[fieldKey]
      } else {
        section[fieldKey] = text
      }
      if (Object.keys(section).length === 0) {
        delete next[categoryKey]
      } else {
        next[categoryKey] = section
      }
      return next
    })
  }

  // 転記用。draft のディープコピーに手入力を重ねる（draft state は書き換えない）
  const buildMergedDraft = () => {
    const base = draft ? JSON.parse(JSON.stringify(draft)) : {}
    for (const categoryKey of Object.keys(manualEdits)) {
      const edits = manualEdits[categoryKey] || {}
      const section =
        base[categoryKey] && typeof base[categoryKey] === 'object' ? base[categoryKey] : {}
      for (const fieldKey of Object.keys(edits)) {
        const text = edits[fieldKey]
        if (typeof text !== 'string' || text === '') continue
        const original = section[fieldKey]
        if (original !== null && original !== undefined && typeof original === 'object') {
          section[fieldKey] = Object.assign({}, original, { value: text })
        } else {
          section[fieldKey] = { value: text, note: null }
        }
      }
      base[categoryKey] = section
    }
    return base
  }

  let manualEditCount = 0
  for (const categoryKey of Object.keys(manualEdits)) {
    const edits = manualEdits[categoryKey] || {}
    for (const fieldKey of Object.keys(edits)) {
      if (typeof edits[fieldKey] === 'string' && edits[fieldKey] !== '') manualEditCount++
    }
  }

  const getStatusColor = (status) => {
    if (status === 'ai_filled') return '#10B981'
    if (status === 'requires_check') return '#F59E0B'
    return '#6B7280'
  }

  const renderStatusBanner = (status) => {
    return status === 'ai_filled' ? (
      <div style={{ background: '#052e16', border: '1px solid #166534', color: '#4ade80', padding: '8px 12px', borderRadius: '6px', fontSize: '12px', marginBottom: '16px' }}>
        AI自動入力済み
      </div>
    ) : status === 'requires_check' ? (
      <div style={{ background: '#1c1007', border: '1px solid #92400e', color: '#fbbf24', padding: '8px 12px', borderRadius: '6px', fontSize: '12px', marginBottom: '16px' }}>
        要確認：内容をご確認ください
      </div>
    ) : (
      <div style={{ background: '#1f1f1f', border: '1px solid #374151', color: '#9ca3af', padding: '8px 12px', borderRadius: '6px', fontSize: '12px', marginBottom: '16px' }}>
        宅建士記入欄：AIでは入力できません
      </div>
    )
  }

  // 値は自由テキスト（文字列）か、選択肢フィールドの { value, note } のどちらか。
  // 表示だけ label に読み替え、draft が持つ値は value のまま（Excel転記で使うため）。
  const renderFieldValue = (value, options) => {
    if (value !== null && value !== undefined && typeof value === 'object') {
      const selected = value.value
      const note = value.note
      return (
        <div>
          {typeof selected === 'string' && selected !== '' ? (
            <div style={{ fontSize: '14px', color: '#E2E8F0' }}>{optionLabel(options, selected)}</div>
          ) : (
            <div style={{ fontSize: '14px', color: '#64748B' }}>判定不可</div>
          )}
          {typeof note === 'string' && note !== '' ? (
            <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>{note}</div>
          ) : null}
        </div>
      )
    }
    if (value !== null && value !== undefined && value !== '') {
      return <div style={{ fontSize: '14px', color: '#E2E8F0' }}>{value}</div>
    }
    return <div style={{ fontSize: '14px', color: '#475569' }}>生成中...</div>
  }

  // 既存の入力欄（チャット欄）と同じ見た目に揃える
  const fieldInputStyle = {
    width: '100%',
    boxSizing: 'border-box',
    fontSize: '16px',
    fontWeight: 400,
    background: '#111827',
    border: '1px solid #1E293B',
    color: '#E2E8F0',
    padding: '8px 10px',
    borderRadius: '6px',
    outline: 'none',
    marginTop: '10px',
  }

  // 宅建士が一覧しながら埋められるよう、入力欄は常時表示する（編集モードは作らない）
  const renderFieldInput = (categoryKey, field) => {
    const resolved = getFieldValue(categoryKey, field.key)
    const current = resolved === null || resolved === undefined ? '' : String(resolved)
    const hasOptions = Array.isArray(field.options) && field.options.length > 0

    return hasOptions ? (
      <select
        value={current}
        onChange={e => updateManualEdit(categoryKey, field.key, e.target.value)}
        style={fieldInputStyle}
      >
        <option value="">未入力</option>
        {field.options.map(o => {
          const optValue = typeof o === 'string' ? o : o.value
          const optLabel = typeof o === 'string' ? o : (o.label || o.value)
          return (
            <option key={optValue} value={optValue}>{optLabel}</option>
          )
        })}
      </select>
    ) : (
      <input
        type="text"
        value={current}
        onChange={e => updateManualEdit(categoryKey, field.key, e.target.value)}
        style={fieldInputStyle}
      />
    )
  }

  const renderField = (categoryKey, field) => {
    const section = draft ? draft[categoryKey] : null
    const rawValue = section && typeof section === 'object' ? section[field.key] : null
    const manual = isManualField(categoryKey, field.key)
    const manualText = manual ? manualEdits[categoryKey][field.key] : ''

    return (
      <div style={{ background: '#111827', border: '1px solid #1E293B', borderRadius: '8px', padding: '16px' }}>
        <div style={{ fontSize: '11px', color: '#64748B', marginBottom: '4px' }}>{field.label}</div>
        {manual ? (
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '14px', color: '#E2E8F0' }}>{optionLabel(field.options, manualText)}</span>
            <span style={{ fontSize: '11px', color: '#6B7280' }}>宅建士入力</span>
          </div>
        ) : (
          renderFieldValue(rawValue, field.options)
        )}
        {renderFieldInput(categoryKey, field)}
      </div>
    )
  }

  const renderCaution = (caution) => {
    return caution !== null && caution !== undefined ? (
      <div style={{ background: '#1C1A0A', border: '1px solid #92400E', borderRadius: '6px', padding: '12px', marginTop: '12px' }}>
        <span style={{ fontSize: '12px', color: '#FCD34D' }}>※ {caution}</span>
      </div>
    ) : null
  }

  const renderSection = () => {
    const item = menuItems[activeItem]
    if (!item) return null
    const section = draft ? draft[item.key] : null

    return (
      <div>
        <div style={{ fontSize: '20px', fontWeight: '500', marginBottom: '16px', color: '#E2E8F0' }}>{item.label}</div>
        {section ? renderStatusBanner(section.status) : null}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {item.fields.map(f => (
            <div key={f.key}>
              {renderField(item.key, f)}
            </div>
          ))}
        </div>
        {section ? renderCaution(section.caution) : null}
      </div>
    )
  }

  // セッション確認中は入力画面もログイン案内も出さない（ちらつき防止）
  if (screen === 'input' && authChecking) return null

  if (screen === 'input' && !user) {
    return (
      <div style={{ background: '#0A0F1E', minHeight: '100vh', color: '#E2E8F0' }}>
        <div style={{ maxWidth: '640px', margin: '0 auto', padding: '40px 20px' }}>
          <div style={{ textAlign: 'center' }}>
            <img src="/logo.png" alt="logo" style={{ width: '140px', marginBottom: '16px' }} />
            <div style={{ fontSize: '28px', fontWeight: '500', color: '#E2E8F0' }}>AI重説ドラフト支援</div>
            <div style={{ fontSize: '13px', color: '#64748B', marginTop: '24px', lineHeight: '1.8' }}>
              ご利用にはHouse-AIへのログインが必要です。無料でお試しいただけます。
            </div>
            <button
              onClick={() => { window.location.href = '/login' }}
              style={{ background: '#c9a84c', color: '#0A0F1E', fontSize: '15px', fontWeight: '500', padding: '14px 32px', borderRadius: '8px', border: 'none', cursor: 'pointer', marginTop: '32px' }}
            >
              ログインする
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (screen === 'input') {
    return (
      <div style={{ background: '#0A0F1E', minHeight: '100vh', color: '#E2E8F0' }}>
        <div style={{ maxWidth: '640px', margin: '0 auto', padding: '40px 20px' }}>
          <div style={{ textAlign: 'center' }}>
            <img src="/logo.png" alt="logo" style={{ width: '140px', marginBottom: '16px' }} />
            <div style={{ fontSize: '28px', fontWeight: '500', color: '#E2E8F0' }}>AI重説ドラフト支援</div>
            <div style={{ fontSize: '13px', color: '#64748B', marginBottom: '40px' }}>重説作成を2〜4時間から30分に</div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '6px' }}>物件所在地</div>
            <input
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="例：東京都中央区〇〇"
              style={{ fontSize: '16px', background: '#111827', border: '1px solid #1E293B', color: '#E2E8F0', padding: '12px 16px', borderRadius: '8px', width: '100%', boxSizing: 'border-box', outline: 'none' }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '6px' }}>物件種別</div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['戸建', 'マンション', '土地'].map(type => (
                <button
                  key={type}
                  onClick={() => setPropertyType(type)}
                  style={{
                    fontSize: '13px',
                    padding: '8px 20px',
                    borderRadius: '20px',
                    cursor: 'pointer',
                    background: propertyType === type ? '#D4AF37' : '#111827',
                    color: propertyType === type ? '#0A0F1E' : '#64748B',
                    border: propertyType === type ? 'none' : '1px solid #1E293B',
                    fontWeight: '400',
                  }}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '6px' }}>築年数</div>
            <input
              type="text"
              value={ageYears}
              onChange={e => setAgeYears(e.target.value)}
              placeholder="例：築35年、または西暦1989年築"
              style={{ fontSize: '16px', background: '#111827', border: '1px solid #1E293B', color: '#E2E8F0', padding: '12px 16px', borderRadius: '8px', width: '100%', boxSizing: 'border-box', outline: 'none' }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '4px' }}>書類アップロード（最大8ファイル）</div>
            <div style={{ fontSize: '11px', color: '#475569', marginBottom: '8px' }}>登記簿・公図・測量図・ハザードマップ・都市計画情報など（PDF・画像に対応）</div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,image/jpeg,image/png,image/webp"
              multiple
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            <input
              ref={addFileInputRef}
              type="file"
              accept=".pdf,image/jpeg,image/png,image/webp"
              multiple
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            {pdfs.length === 0 ? (
              <div
                onClick={() => fileInputRef.current ? fileInputRef.current.click() : null}
                style={{ border: '2px dashed #1E293B', borderRadius: '12px', padding: '32px', textAlign: 'center', cursor: 'pointer' }}
              >
                <div style={{ fontSize: '14px', color: '#475569' }}>{fileProcessing ? '処理中...' : 'PDF・画像をアップロード'}</div>
              </div>
            ) : (
              <div>
                {pdfs.map((file, index) => (
                  <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#111827', borderRadius: '6px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '13px', color: '#E2E8F0' }}>
                      {file.name}
                      <span style={{ fontSize: '11px', color: '#64748B', marginLeft: '6px' }}>
                        {file.mediaType === 'application/pdf' ? 'PDF' : '画像'}
                      </span>
                    </span>
                    <button
                      onClick={() => removeFile(index)}
                      style={{ color: '#EF4444', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '14px' }}
                    >
                      ×
                    </button>
                  </div>
                ))}
                {pdfs.length < MAX_FILE_COUNT ? (
                  <button
                    onClick={() => addFileInputRef.current ? addFileInputRef.current.click() : null}
                    disabled={fileProcessing}
                    style={{ background: 'transparent', border: '1px dashed #475569', color: '#64748B', padding: '8px', width: '100%', borderRadius: '6px', cursor: fileProcessing ? 'not-allowed' : 'pointer', fontSize: '13px', marginTop: '8px', opacity: fileProcessing ? 0.5 : 1 }}
                  >
                    {fileProcessing ? '処理中...' : `+ 書類を追加（${pdfs.length}/${MAX_FILE_COUNT}）`}
                  </button>
                ) : null}
              </div>
            )}
            {fileError ? (
              <div style={{ fontSize: '12px', color: '#EF4444', marginTop: '8px' }}>{fileError}</div>
            ) : null}
          </div>

          <div style={{ background: '#0D1117', border: '1px solid #1E293B', borderRadius: '8px', padding: '16px', marginTop: '24px' }}>
            <div style={{ fontSize: '12px', color: '#64748B' }}>AIが入力可能な項目を自動入力し、確認が必要な項目にフラグを立てます。</div>
            <div style={{ fontSize: '12px', color: '#92400E', marginTop: '4px' }}>宅建士による最終確認・署名は必ず行ってください。</div>
          </div>

          {apiError ? (
            <div style={{ marginTop: '16px' }}>
              <div style={{ fontSize: '12px', color: '#EF4444' }}>{apiError}</div>
              {apiNeedLogin ? (
                <button
                  onClick={() => { window.location.href = '/login' }}
                  style={{ background: '#c9a84c', color: '#0A0F1E', fontSize: '13px', fontWeight: '500', padding: '8px 20px', borderRadius: '6px', border: 'none', cursor: 'pointer', marginTop: '8px' }}
                >
                  ログインする
                </button>
              ) : null}
            </div>
          ) : null}

          <button
            onClick={() => {
              if (address && propertyType) {
                apiCalledRef.current = false
                setApiError('')
                setApiNeedLogin(false)
                // 入力画面からの生成は毎回新しい runId を発行する
                setRunId(crypto.randomUUID())
                // 新規生成なので手入力もリセットする（作り直しでは保持する）
                setManualEdits({})
                setLogIndex(0)
                setScreen('analyzing')
              }
            }}
            style={{
              background: '#D4AF37',
              color: '#0A0F1E',
              fontSize: '15px',
              fontWeight: '500',
              padding: '14px',
              width: '100%',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              marginTop: '24px',
              opacity: address && propertyType ? 1 : 0.4,
              pointerEvents: address && propertyType ? 'auto' : 'none',
            }}
          >
            AI重説ドラフト生成を開始する
          </button>
        </div>
      </div>
    )
  }

  if (screen === 'analyzing') {
    return (
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: '#0A0F1E', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <style>{`
          @keyframes prodocs-breathe {
            0%, 100% { transform: scale(1); opacity: 0.8; }
            50% { transform: scale(1.08); opacity: 1; }
          }
          @keyframes prodocs-glow {
            0%, 100% { filter: drop-shadow(0 0 8px rgba(212,175,55,0.3)); }
            50% { filter: drop-shadow(0 0 20px rgba(212,175,55,0.7)); }
          }
        `}</style>
        <img
          src="/favicon.png"
          alt="loading"
          style={{ width: '64px', marginBottom: '32px', animation: 'prodocs-breathe 2s ease-in-out infinite, prodocs-glow 2s ease-in-out infinite', borderRadius: '50%' }}
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '240px' }}>
          {logs.map((log, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: i <= logIndex ? 1 : 0.2 }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                {i < logIndex ? (
                  <circle cx="7" cy="7" r="7" fill="#10B981" />
                ) : i === logIndex ? (
                  <circle cx="7" cy="7" r="7" fill="#D4AF37" />
                ) : (
                  <circle cx="7" cy="7" r="7" fill="#1E293B" />
                )}
                {i < logIndex ? (
                  <path d="M4 7L6 9L10 5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                ) : null}
              </svg>
              <span style={{ fontSize: '13px', color: i < logIndex ? '#10B981' : i === logIndex ? '#D4AF37' : '#64748B' }}>{log}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  let totalPdfBytes = 0
  for (const f of pdfs) {
    totalPdfBytes = totalPdfBytes + f.bytes
  }
  const isOverLimit = pdfs.length > MAX_FILE_COUNT || totalPdfBytes > MAX_TOTAL_FILE_BYTES

  if (screen === 'draft') {
    return (
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', background: '#0A0F1E' }}>
        <button
          onClick={() => setScreen('input')}
          style={{ position: 'fixed', top: '16px', right: '16px', zIndex: 100, background: 'transparent', border: '1px solid #1E293B', color: '#E2E8F0', fontSize: '18px', cursor: 'pointer', borderRadius: '6px', padding: '4px 10px', lineHeight: '1', fontWeight: '400' }}
        >
          <ArrowLeft size={18} color="#E2E8F0" />
        </button>

        <div style={{ width: '30%', minWidth: '260px', background: '#0D1117', borderRight: '1px solid #1E293B', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '16px', borderBottom: '1px solid #1E293B' }}>
            <div style={{ fontSize: '12px', color: '#D4AF37' }}>AI重説ドラフト</div>
            <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>{address}</div>
          </div>

          {draft ? (
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #1E293B' }}>
              <div style={{ fontSize: '11px', color: '#94A3B8' }}>総合信頼度 {draft.meta.confidence}%</div>
              <div style={{ background: '#1E293B', height: '4px', borderRadius: '2px', marginTop: '6px' }}>
                <div style={{ background: '#D4AF37', width: `${draft.meta.confidence}%`, height: '100%', borderRadius: '2px' }} />
              </div>
              {progressTotal > 0 && progressDone < progressTotal ? (
                <div style={{ fontSize: '11px', color: '#64748B', marginTop: '6px' }}>生成中 {progressDone}/{progressTotal}</div>
              ) : null}
            </div>
          ) : null}

          <div style={{ padding: '8px 16px', borderBottom: '1px solid #1E293B', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: '#10B981' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
              AI入力済
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: '#F59E0B' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#F59E0B', display: 'inline-block' }} />
              要確認
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: '#6B7280' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#6B7280', display: 'inline-block' }} />
              宅建士記入
            </span>
          </div>

          <div
            onClick={() => setMenuCollapsed(prev => !prev)}
            style={{ padding: '8px 16px', borderBottom: '1px solid #1E293B', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', userSelect: 'none' }}
          >
            <span style={{ fontSize: '11px', color: '#94A3B8' }}>書類カテゴリ</span>
            {menuCollapsed ? <ChevronDown size={14} color="#D4AF37" /> : <ChevronUp size={14} color="#D4AF37" />}
          </div>

          {menuCollapsed ? null : (
            <div style={{ overflowY: 'auto' }}>
              {menuItems.map((item, i) => {
                const sectionData = draft ? draft[item.key] : null
                const status = sectionData ? sectionData.status : null
                // 手入力が1つでもあれば「宅建士記入」の色を優先する
                const dotColor = hasManualInCategory(item.key) ? '#6B7280' : getStatusColor(status)
                return (
                  <div
                    key={item.key}
                    onClick={() => setActiveItem(i)}
                    style={{
                      padding: '12px 16px',
                      cursor: 'pointer',
                      borderBottom: '1px solid #0F172A',
                      background: activeItem === i ? '#1E293B' : 'transparent',
                      borderLeft: activeItem === i ? '2px solid #D4AF37' : '2px solid transparent',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span style={{ fontSize: '13px', color: '#E2E8F0' }}>{item.label}</span>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: dotColor, display: 'inline-block', flexShrink: 0 }} />
                  </div>
                )
              })}
            </div>
          )}

          <div style={{ padding: '12px 16px', borderTop: '1px solid #1E293B' }}>
            <div style={{ fontSize: '10px', color: '#475569' }}>※本ドラフトは参考資料です</div>
            <div style={{ fontSize: '10px', color: '#92400E', marginTop: '2px' }}>宅建士の最終確認が必要です</div>
          </div>

          <div style={{ padding: '12px', borderTop: '1px solid #1E293B', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
            {chatMessages.length > 0 ? (
              <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', marginBottom: '8px' }}>
                {chatMessages.map((msg, i) => (
                  <div key={i} style={{ marginBottom: '6px' }}>
                    <div style={{ fontSize: '10px', color: msg.role === 'user' ? '#D4AF37' : '#64748B', marginBottom: '2px' }}>
                      {msg.role === 'user' ? 'あなた' : 'AI'}
                    </div>
                    <div style={{ fontSize: '15px', lineHeight: '1.6', color: '#E2E8F0', whiteSpace: 'pre-wrap' }}>
                      {msg.role === 'assistant' ? formatChatText(msg.content) : msg.content}
                    </div>
                  </div>
                ))}
                {chatLoading ? <div style={{ fontSize: '12px', color: '#64748B' }}>解析中...</div> : null}
                <div ref={chatEndRef} />
              </div>
            ) : null}
            <div style={{ marginBottom: '12px' }}>
              {manualEditCount > 0 ? (
                <div style={{ fontSize: '11px', color: '#64748B', marginBottom: '6px' }}>宅建士入力 {manualEditCount}件</div>
              ) : null}
              <div style={{ fontSize: '11px', color: '#94A3B8', marginBottom: '6px' }}>参考書類</div>
              <input
                ref={regenFileInputRef}
                type="file"
                accept=".pdf,image/jpeg,image/png,image/webp"
                multiple
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
              {pdfs.length > 0 ? (
                <div>
                  {pdfs.map((file, index) => (
                    <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#111827', borderRadius: '6px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '13px', color: '#E2E8F0' }}>
                        {file.name}
                        <span style={{ fontSize: '11px', color: '#64748B', marginLeft: '6px' }}>
                          {file.mediaType === 'application/pdf' ? 'PDF' : '画像'}
                        </span>
                      </span>
                      <button
                        onClick={() => removeFile(index)}
                        style={{ color: '#EF4444', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '14px' }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: '11px', color: '#475569', marginBottom: '4px' }}>まだ書類はありません</div>
              )}
              <div style={{ fontSize: '11px', color: isOverLimit ? '#EF4444' : '#64748B', marginTop: '4px' }}>
                合計 {formatMb(totalPdfBytes)} / 2.5MB（{pdfs.length}/{MAX_FILE_COUNT}ファイル）
              </div>
              {fileError ? (
                <div style={{ fontSize: '12px', color: '#EF4444', marginTop: '4px' }}>{fileError}</div>
              ) : null}
              {regenError ? (
                <div style={{ marginTop: '4px' }}>
                  <div style={{ fontSize: '12px', color: '#EF4444' }}>{regenError}</div>
                  {regenNeedLogin ? (
                    <button
                      onClick={() => { window.location.href = '/login' }}
                      style={{ background: '#c9a84c', color: '#0A0F1E', fontSize: '13px', fontWeight: '500', padding: '6px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer', marginTop: '6px' }}
                    >
                      ログインする
                    </button>
                  ) : null}
                </div>
              ) : null}
              <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                <button
                  onClick={() => regenFileInputRef.current ? regenFileInputRef.current.click() : null}
                  disabled={pdfs.length >= MAX_FILE_COUNT || fileProcessing}
                  style={{ flex: 1, background: 'transparent', border: '1px dashed #475569', color: '#64748B', padding: '8px', borderRadius: '6px', cursor: pdfs.length >= MAX_FILE_COUNT || fileProcessing ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: '400', opacity: pdfs.length >= MAX_FILE_COUNT || fileProcessing ? 0.5 : 1 }}
                >
                  {fileProcessing ? '処理中...' : '書類を追加'}
                </button>
                <button
                  onClick={handleRegenerate}
                  disabled={regenLoading || isOverLimit}
                  style={{ flex: 1, background: regenLoading || isOverLimit ? '#1E293B' : '#c9a84c', color: regenLoading || isOverLimit ? '#64748B' : '#0A0F1E', border: 'none', borderRadius: '6px', padding: '8px', fontSize: '13px', fontWeight: '500', cursor: regenLoading || isOverLimit ? 'not-allowed' : 'pointer' }}
                >
                  {regenLoading ? '解析中...' : 'この内容で作り直す'}
                </button>
              </div>
              <div style={{ fontSize: '11px', color: '#475569', marginTop: '6px' }}>作り直すたびに全ての書類を再解析します</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <textarea
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                placeholder="書類の内容について質問する..."
                rows={3}
                style={{ fontSize: '16px', fontWeight: 400, background: '#111827', border: '1px solid #1E293B', color: '#E2E8F0', padding: '8px 12px', borderRadius: '6px', width: '100%', boxSizing: 'border-box', outline: 'none', resize: 'none' }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={handleChatSubmit}
                  style={{ background: '#c9a84c', color: '#0A0F1E', border: 'none', borderRadius: '6px', padding: '6px 18px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}
                >
                  送信
                </button>
              </div>
            </div>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', background: '#0A0F1E' }}>
          {renderSection()}

          <div style={{ marginTop: '48px', paddingTop: '24px', borderTop: '1px solid #1E293B' }}>
            <div style={{ fontSize: '16px', fontWeight: '500', color: '#E2E8F0', marginBottom: '16px' }}>次のステップ</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ background: '#111827', border: '1px solid #1E293B', borderRadius: '8px', padding: '16px' }}>
                <div style={{ fontSize: '14px', fontWeight: '500', color: '#E2E8F0', marginBottom: '8px' }}>重説フォーマットに転記</div>
                {propertyType !== '土地' ? (
                  <div style={{ fontSize: '12px', color: '#64748B', lineHeight: '1.8' }}>
                    現在この機能は『土地の売買・交換用』の書式のみに対応しています。戸建・マンションの書式は準備中です。
                  </div>
                ) : (
                <div>
                <div style={{ fontSize: '12px', color: '#64748B', lineHeight: '1.8', marginBottom: '12px' }}>
                  全宅連の『重要事項説明書（土地の売買・交換用）』のExcelファイルをアップロードすると、AIが読み取った内容を転記します。書式は全宅連の会員ページからダウンロードしてください。
                </div>

                <input
                  ref={templateInputRef}
                  type="file"
                  accept=".xlsx"
                  style={{ display: 'none' }}
                  onChange={handleTemplateChange}
                />

                {templateFile ? (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#0D1117', borderRadius: '6px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '13px', color: '#E2E8F0' }}>{templateFile.name}</span>
                    <button
                      onClick={() => { setTemplateFile(null); setExportResult(null); setExportError('') }}
                      style={{ color: '#EF4444', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '14px' }}
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => templateInputRef.current ? templateInputRef.current.click() : null}
                    style={{ background: 'transparent', border: '1px dashed #475569', color: '#64748B', padding: '10px', width: '100%', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '400', marginBottom: '8px' }}
                  >
                    Excelファイルを選択
                  </button>
                )}

                <button
                  onClick={handleExport}
                  disabled={!templateFile || exportLoading}
                  style={{ background: !templateFile || exportLoading ? '#1E293B' : '#c9a84c', color: !templateFile || exportLoading ? '#64748B' : '#0A0F1E', padding: '10px 24px', width: '100%', borderRadius: '6px', border: 'none', cursor: !templateFile || exportLoading ? 'not-allowed' : 'pointer', fontSize: '14px', fontWeight: '500' }}
                >
                  {exportLoading ? '転記中...' : '転記してダウンロード'}
                </button>

                {exportResult ? (
                  <div style={{ marginTop: '10px' }}>
                    <div style={{ fontSize: '13px', color: '#4ade80' }}>{exportResult.written}項目を転記しました</div>
                    {exportResult.skipped > 0 ? (
                      <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>
                        {exportResult.skipped}項目は書類から判定できなかったため空欄のままです
                      </div>
                    ) : null}
                  </div>
                ) : null}

                {exportError ? (
                  <div style={{ marginTop: '10px' }}>
                    <div style={{ fontSize: '12px', color: '#EF4444' }}>{exportError}</div>
                    {exportNeedLogin ? (
                      <button
                        onClick={() => { window.location.href = '/login' }}
                        style={{ background: '#c9a84c', color: '#0A0F1E', fontSize: '13px', fontWeight: '500', padding: '6px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer', marginTop: '6px' }}
                      >
                        ログインする
                      </button>
                    ) : null}
                  </div>
                ) : null}

                <div style={{ fontSize: '11px', color: '#475569', marginTop: '10px' }}>
                  転記後のファイルは必ず宅建士が全項目を確認してください。
                </div>
                </div>
                )}
              </div>
              <button
                onClick={() => { window.location.href = '/pro/investigation' }}
                style={{ background: '#D4AF37', color: '#0A0F1E', padding: '12px 24px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '500', textAlign: 'left' }}
              >
                AI現地調査室で物件を詳細調査する
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return null
}
