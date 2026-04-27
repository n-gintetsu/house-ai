import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from './lib/supabase'
import AuthPanel from './AuthPanel'
import AgencyForm from './AgencyForm'
import TickerBanner from './TickerBanner'
import { AdBanner, PremiumUpgradeBanner } from './PremiumBanner'
import ColumnPage from './ColumnPage'
import HomeScreen from './HomeScreen'

const STORAGE_KEY = 'house-ai-community-v1'
const AI_CHAT_FREE_LIMIT = 5
const AI_CHAT_COUNT_KEY = 'house-ai-chat-count'

function getTodayChatCount() {
  try {
    const data = JSON.parse(localStorage.getItem(AI_CHAT_COUNT_KEY) || '{}')
    const today = new Date().toDateString()
    return data.date === today ? (data.count || 0) : 0
  } catch { return 0 }
}

function incrementTodayChatCount() {
  try {
    const today = new Date().toDateString()
    const count = getTodayChatCount() + 1
    localStorage.setItem(AI_CHAT_COUNT_KEY, JSON.stringify({ date: today, count }))
    return count
  } catch { return 0 }
}

const DEFAULT_SYSTEM_PROMPT =
  'あなたは「不動産AIコンシェルジュ」です。ユーザーの希望（エリア、予算、間取り、通勤時間、家賃/購入、希望条件、優先順位、物件種別）を丁寧に整理し、次に取るべき行動（内見で確認するポイント、比較観点、ローン/税金/諸費用の一般的注意、情報収集の手順）を具体的に提案してください。ユーザーの情報が不足している場合は、短い質問を1〜3個だけしてから提案を進めてください。'

const EXPERT_AI_SYSTEM =
  'あなたは不動産に関する専門家紹介のアドバイザーです。ユーザーの状況を整理し、選んだ専門家カテゴリ（リフォーム業者・司法書士・税理士・FP）ごとに、相談の進め方・準備すべき書類・注意点を簡潔に箇条書きで示してください。断定診断や法律・税務の最終判断は避け、専門家への相談を促してください。'

const COMMUNITY_AI_SYSTEM =
  'あなたは不動産コミュニティのAIモデレーターです。投稿に対し、共感しつつ実務的な視点（次の一歩・確認ポイント）を短く2〜5文で返してください。攻撃的・断定的すぎる表現は避けます。'

async function callClaudeApi({
  model,
  system,
  messages,
  temperature = 0.4,
  maxTokens = 900,
}) {
  const res = await fetch('/api/claude', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      model,
      system,
      messages,
      temperature,
      max_tokens: maxTokens,
    }),
  })

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    const detail = data?.error != null ? String(data.error) : ''
    throw new Error(
      `Claude API request failed (${res.status}).${detail ? ` ${detail}` : ''}`,
    )
  }

  return typeof data?.text === 'string' ? data.text : ''
}

function callClaudeUserMessage(model, system, userText, maxTokens = 900) {
  return callClaudeApi({
    model,
    system,
    messages: [
      {
        role: 'user',
        content: [{ type: 'text', text: userText }],
      },
    ],
    maxTokens,
  })
}

function uid() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function toNumberOrNull(v) {
  if (v === null || v === undefined) return null
  const s = typeof v === 'string' ? v.trim() : v
  if (typeof s === 'string' && s === '') return null
  const n = Number(s)
  return Number.isFinite(n) ? n : null
}

function toIntOrNull(v) {
  const n = toNumberOrNull(v)
  return n === null ? null : Math.trunc(n)
}

function normalizePost(p) {
  if (!p || typeof p !== 'object') return null
  return {
    ...p,
    likes: typeof p.likes === 'number' ? p.likes : 0,
    empathy: typeof p.empathy === 'number' ? p.empathy : 0,
    likedByMe: !!p.likedByMe,
    empathyByMe: !!p.empathyByMe,
    comments: Array.isArray(p.comments) ? p.comments : [],
    aiComment: typeof p.aiComment === 'string' ? p.aiComment : '',
  }
}

function loadCommunity() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.map(normalizePost).filter(Boolean)
  } catch {
    return []
  }
}

function saveCommunity(posts) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts))
  } catch {
    // ignore
  }
}

const TABS = [
  { id: 'properties', label: '🏠 物件情報', icon: '🏠' },
  { id: 'vendors', label: '👷 業者一覧', icon: '👷' },
  { id: 'chat', label: 'AIチャット', icon: '💬' },
  { id: 'sell', label: '売却査定', icon: '🏷️' },
  { id: 'owner', label: '賃貸経営者様向け', icon: '🏢' },
  { id: 'expert', label: '専門家紹介', icon: '👔' },
  { id: 'community', label: 'コミュニティ', icon: '🏘️' },
  { id: 'agency', label: '業者様向け', icon: '🏗️' },
  { id: 'column', label: '💰 お得情報', icon: '💰' },
  { id: 'member', label: '会員専用', icon: '👤' },
]

const PROPERTY_TYPES = ['一戸建て', 'マンション', '土地', 'アパート一棟', 'その他']

const LAYOUTS = ['1R/1K', '1LDK', '2LDK', '3LDK', '4LDK以上', 'その他']

const EXPERT_TYPES = [
  { id: 'reform', label: 'リフォーム業者' },
  { id: 'exterior', label: '外構工事' },
  { id: 'legal', label: '司法書士' },
  { id: 'tax', label: '税理士' },
  { id: 'bank', label: '金融機関' },
  { id: 'other', label: 'その他' },
]

const initialSell = {
  step: 1,
  propertyType: '',
  address: '',
  area: '',
  builtYear: '',
  layout: '',
  name: '',
  phone: '',
  email: '',
  notes: '',
}

const initialExpert = {
  step: 1,
  types: [],
  region: '',
  detail: '',
  name: '',
  phone: '',
  email: '',
  notes: '',
  aiAdvice: '',
  aiLoading: false,
  aiError: '',
}

function initialOwnerForm() {
  return {
    step: 1,
    propertyType: '',
    units: '',
    address: '',
    name: '',
    phone: '',
    email: '',
    notes: '',
  }
}

export default function App() {
  const [isPremium, setIsPremium] = useState(false)
  const model = useMemo(
    () => import.meta.env.VITE_CLAUDE_MODEL || 'claude-sonnet-4-5',
    [],
  )

  const [tab, setTab] = useState('home')
  const [agencyType, setAgencyType] = useState(null)

  /* ---- AIチャット ---- */
  const [chat, setChat] = useState(() => [
    {
      role: 'assistant',
      text:
        'こんにちは。不動産のご相談から内見のコツまで一緒に整理します。まずは「エリア」「予算」「入居/購入の希望時期」を教えてください。',
    },
  ])
  const [input, setInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const endRef = useRef(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chat, isSending])

  const toAnthropicMessages = (nextChat) => {
    const valid = nextChat.filter((m) => m.role === 'user' || m.role === 'assistant')
    const firstUserIndex = valid.findIndex((m) => m.role === 'user')
    const trimmed = firstUserIndex === -1 ? [] : valid.slice(firstUserIndex)
    return trimmed.map((m) => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: [{ type: 'text', text: m.text }],
    }))
  }

  async function handleSend() {
    const text = input.trim()
    if (!text || isSending) return
    // 未ログイン時のチャット回数制限
    const currentUser = window.__houseAiUser || null
    if (!currentUser) {
      const todayCount = getTodayChatCount()
      if (todayCount >= AI_CHAT_FREE_LIMIT) {
        setErrorMessage('本日の無料チャット回数（5回）に達しました。会員登録すると無制限でご利用いただけます。')
        return
      }
      incrementTodayChatCount()
    }
    setErrorMessage('')
    setIsSending(true)
    const nextChat = [...chat, { role: 'user', text }]
    setChat(nextChat)
    setInput('')
    try {
      const assistantText = await callClaudeApi({
        model,
        system: DEFAULT_SYSTEM_PROMPT,
        messages: toAnthropicMessages(nextChat),
      })
      setChat((prev) => [...prev, { role: 'assistant', text: assistantText }])
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      setErrorMessage(message)
      setChat((prev) => [
        ...prev,
        {
          role: 'assistant',
          text:
            'すみません、Claudeへの接続に失敗しました。エラー内容を確認して再度お試しください。',
        },
      ])
    } finally {
      setIsSending(false)
    }
  }

  function handleResetChat() {
    if (isSending) return
    setErrorMessage('')
    setInput('')
    setChat([
      {
        role: 'assistant',
        text:
          'こんにちは。不動産のご相談から内見のコツまで一緒に整理します。まずは「エリア」「予算」「入居/購入の希望時期」を教えてください。',
      },
    ])
  }

  /* ---- 売主査定 ---- */
  const [sell, setSell] = useState(initialSell)
  const [sellSubmitting, setSellSubmitting] = useState(false)
  const [sellSubmitError, setSellSubmitError] = useState('')

  /* ---- オーナー ---- */
  const [ownerService, setOwnerService] = useState(null)
  const [ownerForm, setOwnerForm] = useState(() => initialOwnerForm())
  const [ownerSubmitting, setOwnerSubmitting] = useState(false)
  const [ownerSubmitError, setOwnerSubmitError] = useState('')

  const ownerTitle = useMemo(() => {
    if (ownerService === 'manage') return '管理委託のご相談'
    if (ownerService === 'occupancy') return '稼働率アップのご相談'
    if (ownerService === 'sell') return 'オーナー向け売却査定'
    return ''
  }, [ownerService])

  /* ---- 専門家紹介 ---- */
  const [expert, setExpert] = useState(initialExpert)
  const [expertSubmitting, setExpertSubmitting] = useState(false)
  const [expertSubmitError, setExpertSubmitError] = useState('')

  const toggleExpertType = (id) => {
    setExpert((e) => ({
      ...e,
      types: e.types.includes(id) ? e.types.filter((t) => t !== id) : [...e.types, id],
    }))
  }

  const generateExpertAdvice = useCallback(async () => {
    if (expert.types.length === 0 || !expert.detail.trim()) {
      setExpert((e) => ({ ...e, aiError: '専門家の種類と相談内容を入力してください。' }))
      return
    }
    setExpert((e) => ({ ...e, aiLoading: true, aiError: '', aiAdvice: '' }))
    const labels = EXPERT_TYPES.filter((t) => expert.types.includes(t.id))
      .map((t) => t.label)
      .join('、')
    const userText = `希望する専門家: ${labels}\nエリア・状況: ${expert.region}\n相談内容:\n${expert.detail}`
    try {
      const text = await callClaudeUserMessage(model, EXPERT_AI_SYSTEM, userText, 1200)
      setExpert((e) => ({ ...e, aiLoading: false, aiAdvice: text }))
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      setExpert((e) => ({ ...e, aiLoading: false, aiError: message }))
    }
  }, [expert.detail, expert.region, expert.types, model])

  async function submitValuation() {
    if (sellSubmitting) return
    if (!sell.propertyType || !sell.address.trim()) return
    if (!sell.name.trim() || !sell.phone.trim() || !sell.email.trim()) return

    setSellSubmitError('')
    setSellSubmitting(true)
    try {
      const size = toNumberOrNull(sell.area)
      const age = toIntOrNull(sell.builtYear)

      const payload = {
        property_type: sell.propertyType,
        address: sell.address,
        size,
        age,
        layout: sell.layout || null,
        name: sell.name,
        phone: sell.phone,
        email: sell.email,
        wishes: sell.notes || null,
      }

      const { error } = await supabase.from('valuations').insert(payload)
      if (error) throw error

      await fetch('/api/sendmail', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ type: 'valuation', data: payload }),
      })

      setSell((s) => ({ ...s, step: 'done' }))
    } catch (err) {
      console.error(err)
      setSellSubmitError('送信に失敗しました。もう一度お試しください。')
    } finally {
      setSellSubmitting(false)
    }
  }

  async function submitOwnerRequest() {
    if (ownerSubmitting) return
    if (!ownerService) return
    if (!ownerForm.propertyType || !ownerForm.address.trim()) return
    if (!ownerForm.name.trim() || !ownerForm.phone.trim() || !ownerForm.email.trim()) return

    setOwnerSubmitError('')
    setOwnerSubmitting(true)
    try {
      const payload = {
        service_type: ownerService,
        property_type: ownerForm.propertyType || null,
        address: ownerForm.address,
        units: ownerForm.units || null,
        occupancy: null,
        name: ownerForm.name,
        phone: ownerForm.phone,
        email: ownerForm.email,
        note: ownerForm.notes || null,
      }

      const { error } = await supabase.from('owner_requests').insert(payload)
      if (error) throw error

      await fetch('/api/sendmail', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ type: 'owner', data: payload }),
      })

      setOwnerForm((o) => ({ ...o, step: 'done' }))
    } catch (err) {
      console.error(err)
      setOwnerSubmitError('送信に失敗しました。もう一度お試しください。')
    } finally {
      setOwnerSubmitting(false)
    }
  }

  async function submitExpertRequest() {
    if (expertSubmitting) return
    if (!expert.types.length) return
    if (!expert.detail.trim()) return
    if (!expert.name.trim() || !expert.phone.trim() || !expert.email.trim()) return

    setExpertSubmitError('')
    setExpertSubmitting(true)
    try {
      const expertTypeLabels = EXPERT_TYPES.filter((t) =>
        expert.types.includes(t.id),
      )
        .map((t) => t.label)
        .join('、')

      const situationText = expert.detail.trim() +
        (expert.notes.trim() ? `\n\n備考: ${expert.notes.trim()}` : '')

      const payload = {
        expert_type: expertTypeLabels || null,
        name: expert.name,
        phone: expert.phone,
        email: expert.email,
        situation: situationText || null,
        timing: expert.region || null,
      }

      const { error } = await supabase.from('expert_requests').insert(payload)
      if (error) throw error

      await fetch('/api/sendmail', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ type: 'expert', data: payload }),
      })

      setExpert((x) => ({ ...x, step: 'done' }))
    } catch (err) {
      console.error(err)
      setExpertSubmitError('送信に失敗しました。もう一度お試しください。')
    } finally {
      setExpertSubmitting(false)
    }
  }

  /* ---- コミュニティ ---- */
  const [posts, setPosts] = useState(() => loadCommunity())
  const [communityDraft, setCommunityDraft] = useState({
    title: '',
    body: '',
    author: '',
  })
  const [expandedPost, setExpandedPost] = useState(null)
  const [commentDrafts, setCommentDrafts] = useState({})
  const [aiLoadingPostId, setAiLoadingPostId] = useState(null)

  useEffect(() => {
    saveCommunity(posts)
  }, [posts])

  const addPost = async () => {
    const title = communityDraft.title.trim()
    const body = communityDraft.body.trim()
    if (!title || !body) return
    const payload = {
      category: communityDraft.category || 'other',
      title,
      body,
      anon: communityDraft.anon || false,
      author_name: communityDraft.anon ? null : (communityDraft.author || null),
      likes: 0,
      empathy: 0,
    }
    const { data, error } = await supabase.from('community_posts').insert(payload).select()
    if (error) { console.error(error); return }
    const post = {
      ...data[0],
      id: data[0].id,
      title: data[0].title,
      body,
      author: communityDraft.author.trim() || '匿名',
      createdAt: Date.now(),
      likes: 0,
      empathy: 0,
      likedByMe: false,
      empathyByMe: false,
      comments: [],
      aiComment: '',
    }
    setPosts((p) => [post, ...p])
    setCommunityDraft({ title: '', body: '', author: '' })
  }

  const toggleLike = (id) => {
    setPosts((list) =>
      list.map((p) => {
        if (p.id !== id) return p
        const next = !p.likedByMe
        return {
          ...p,
          likedByMe: next,
          likes: Math.max(0, p.likes + (next ? 1 : -1)),
        }
      }),
    )
  }

  const toggleEmpathy = (id) => {
    setPosts((list) =>
      list.map((p) => {
        if (p.id !== id) return p
        const next = !p.empathyByMe
        return {
          ...p,
          empathyByMe: next,
          empathy: Math.max(0, p.empathy + (next ? 1 : -1)),
        }
      }),
    )
  }

  const addComment = (postId) => {
    const text = (commentDrafts[postId] || '').trim()
    if (!text) return
    setPosts((list) =>
      list.map((p) => {
        if (p.id !== postId) return p
        return {
          ...p,
          comments: [
            ...p.comments,
            {
              id: uid(),
              author: 'ユーザー',
              text,
              createdAt: Date.now(),
            },
          ],
        }
      }),
    )
    setCommentDrafts((d) => ({ ...d, [postId]: '' }))
  }

  const submitPost = async () => {
    if (!newPost.title.trim() || !newPost.body.trim()) return
    const payload = {
      category: newPost.category,
      title: newPost.title,
      body: newPost.body,
      anon: newPost.anon,
      author_name: newPost.anon ? null : newPost.authorName,
      likes: 0,
      empathy: 0,
    }
    const { data, error } = await supabase.from('community_posts').insert(payload).select()
    if (error) { console.error(error); return }
    setPosts((list) => [{ ...data[0], likedByMe: false, empathyByMe: false, comments: [] }, ...list])
    setNewPost({ category: 'buy', title: '', body: '', anon: false, authorName: '' })
  }

  const loadPosts = async () => {
    const { data, error } = await supabase.from('community_posts').select('*').order('created_at', { ascending: false })
    if (error) { console.error(error); return }
    setPosts((data || []).map((p) => ({ ...p, likedByMe: false, empathyByMe: false, comments: [] })))
  }

  const generateAiComment = async (post) => {
    setAiLoadingPostId(post.id)
    try {
      const userText = `タイトル: ${post.title}\n本文:\n${post.body}`
      const text = await callClaudeUserMessage(model, COMMUNITY_AI_SYSTEM, userText, 600)
      setPosts((list) =>
        list.map((p) => (p.id === post.id ? { ...p, aiComment: text } : p)),
      )
    } catch {
      setPosts((list) =>
        list.map((p) =>
          p.id === post.id
            ? { ...p, aiComment: 'AIコメントの生成に失敗しました。もう一度お試しください。' }
            : p,
        ),
      )
    } finally {
      setAiLoadingPostId(null)
    }
  }

  /* ---- 共通: 入力 ---- */
  const fieldClass = 'ha-field'
  const labelClass = 'ha-label'

  return (
    <>
      <style>{`
        :root {
          --accent: #1a3a5c;
          --accent-dim: rgba(26, 58, 92, 0.08);
          --accent-border: rgba(26, 58, 92, 0.25);
          --bg: #eef2f7;
          --surface: #ffffff;
          --border: rgba(26, 58, 92, 0.15);
          --border-2: rgba(26, 58, 92, 0.1);
          --text: #222222;
          --muted: #777777;
          --shadow: 0 2px 12px rgba(26,58,92,0.08);
        }

        #root {
          background: var(--bg);
          border-inline: none;
          text-align: left;
          align-items: stretch;
        }

        .ha-app {
          width: 100%;
          max-width: 1080px;
          margin: 0 auto;
          min-height: 100svh;
          display: flex;
          flex-direction: column;
          color: var(--text);
          padding-bottom: 24px;
        }

        .ha-header {
          padding: 16px 16px 8px;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .ha-brand {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .ha-logo {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: linear-gradient(145deg, rgba(255, 215, 100, 0.35), rgba(255, 215, 100, 0.08));
          border: 1px solid var(--border);
          display: grid;
          place-items: center;
          font-weight: 900;
          color: var(--accent);
          box-shadow: var(--shadow);
        }

        .ha-brand strong {
          display: block;
          font-size: 16px;
          font-weight: 750;
        }
        .ha-brand span {
          font-size: 12px;
          color: var(--muted);
        }

        .ha-pill {
          font-size: 11px;
          color: var(--muted);
          border: 1px solid var(--border-2);
          padding: 6px 10px;
          border-radius: 999px;
          max-width: 280px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

          .ha-tabs {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 6px;
            background: #f5a623;
            padding: 10px 12px;
            border-radius: 14px;
            margin: 0 0 4px;
          }
          .ha-tab {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 3px;
            padding: 10px 6px;
            border-radius: 10px;
            border: 1.5px solid rgba(255,255,255,0.6);
            background: rgba(255,255,255,0.85);
            color: #1a3a5c;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.15s;
            white-space: nowrap;
          }
          .ha-tab span[aria-hidden] {
            font-size: 16px;
          }
          .ha-tab:hover {
            background: rgba(255,255,255,0.35);
          }
          .ha-tab[aria-selected="true"] {
            background: #fff;
            color: #1a3a5c;
            border-color: #fff;
            font-weight: 700;
          }

        .ha-main {
          flex: 1;
          margin: 0 12px;
          border: 1px solid var(--border-2);
          border-radius: 18px;
          background: #ffffff;
          box-shadow: var(--shadow);
          min-height: 480px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .ha-panel {
          padding: 16px;
          flex: 1;
          display: flex;
          flex-direction: column;
          min-height: 0;
        }

        .ha-sectionTitle {
          font-size: 18px;
          font-weight: 750;
          margin: 0 0 6px;
          color: var(--accent);
        }

        .ha-sectionDesc {
          font-size: 13px;
          color: var(--muted);
          margin: 0 0 16px;
          line-height: 1.5;
        }

        .ha-grid2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        @media (max-width: 640px) {
          .ha-grid2 {
            grid-template-columns: 1fr;
          }
          .ha-pill {
            display: none;
          }
        }

        .ha-label {
          display: block;
          font-size: 12px;
          color: var(--muted);
          margin-bottom: 6px;
        }

        .ha-field,
        .ha-panel select {
          width: 100%;
          box-sizing: border-box;
          padding: 11px 12px;
          border-radius: 12px;
          border: 1px solid var(--border-2);
          background: #ffffff;
          color: var(--text);
          font-size: 14px;
          outline: none;
          font-family: inherit;
        }

        .ha-field:focus,
        .ha-panel select:focus {
          border-color: var(--accent);
          box-shadow: 0 0 0 3px rgba(255, 215, 100, 0.12);
        }

        textarea.ha-field {
          min-height: 88px;
          resize: vertical;
        }

        .ha-row {
          margin-bottom: 12px;
        }

        .ha-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 18px;
          align-items: center;
        }

        .ha-btn {
          appearance: none;
          border: 1px solid var(--border);
          background: var(--accent-dim);
          color: var(--accent);
          padding: 10px 16px;
          border-radius: 12px;
          font-weight: 750;
          cursor: pointer;
          font-size: 14px;
          transition: transform 0.08s, background 0.15s;
        }

        .ha-btn:hover:not(:disabled) {
          background: rgba(255, 215, 100, 0.2);
        }

        .ha-btn:active:not(:disabled) {
          transform: translateY(1px);
        }

        .ha-btn:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        .ha-btnGhost {
          background: transparent;
          color: var(--muted);
          border-color: var(--border-2);
        }

        .ha-done {
          text-align: center;
          padding: 32px 16px;
        }

        .ha-done h3 {
          margin: 0 0 10px;
          color: var(--accent);
          font-size: 20px;
        }

        .ha-done p {
          color: var(--muted);
          font-size: 14px;
          line-height: 1.6;
          margin: 0 0 20px;
        }

        /* チャット */
        .ha-chatWrap {
          display: flex;
          flex-direction: column;
          flex: 1;
          min-height: 420px;
        }

        .ha-chatTop {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          margin-bottom: 10px;
        }

        .ha-messages {
          flex: 1;
          overflow: auto;
          padding: 8px 4px 12px;
          scrollbar-width: thin;
        }

        .ha-msgRow {
          display: flex;
          margin: 10px 0;
        }
        .ha-msgRow.assistant {
          justify-content: flex-start;
        }
        .ha-msgRow.user {
          justify-content: flex-end;
        }

        .ha-bubble {
          max-width: min(92%, 720px);
          border-radius: 16px;
          padding: 12px 14px;
          border: 1px solid var(--border-2);
        }

        .ha-msgRow.assistant .ha-bubble {
          background: rgba(255, 215, 100, 0.07);
          border-color: var(--accent-border);
        }

        .ha-msgRow.user .ha-bubble {
          background: rgba(255, 255, 255, 0.04);
        }

        .ha-meta {
          font-size: 11px;
          color: var(--muted);
          margin-bottom: 6px;
        }

        .ha-bubbleText {
          white-space: pre-wrap;
          word-break: break-word;
          font-size: 14px;
          line-height: 1.55;
        }

        .ha-composer {
          border-top: 1px solid var(--border-2);
          padding: 12px 0 0;
          margin-top: auto;
          background: #f8fafc;
          margin-left: -16px;
          margin-right: -16px;
          padding-left: 16px;
          padding-right: 16px;
          padding-bottom: 4px;
            min-height: 100px;
        }

          .ha-composerInner {
            display: flex;
            align-items: stretch;
            gap: 8px;
          }

        .ha-composer textarea {
          flex: 1;
          min-height: 46px;
          max-height: 160px;
        }

          .ha-composerActions {
            display: flex;
            flex-direction: column;
            gap: 6px;
            flex-shrink: 0;
          }

        .ha-error {
          margin: 8px 0 0;
          padding: 10px 12px;
          border-radius: 12px;
          border: 1px solid rgba(255, 100, 100, 0.45);
          background: rgba(255, 60, 60, 0.08);
          color: #ffc9c9;
          font-size: 13px;
        }

        .ha-hint {
          font-size: 11px;
          color: var(--muted);
          margin-top: 8px;
        }

        .ha-spinnerDot {
          display: inline-block;
          width: 6px;
          height: 6px;
          margin: 0 2px;
          border-radius: 50%;
          background: var(--accent);
          animation: haPulse 1.1s infinite ease-in-out;
        }
        .ha-spinnerDot:nth-child(2) {
          animation-delay: 0.12s;
        }
        .ha-spinnerDot:nth-child(3) {
          animation-delay: 0.24s;
        }
        @keyframes haPulse {
          0%,
          80%,
          100% {
            opacity: 0.35;
            transform: translateY(0);
          }
          40% {
            opacity: 1;
            transform: translateY(-3px);
          }
        }

        /* オーナー メニューカード */
        .ha-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 12px;
        }

        .ha-card {
          border: 1px solid var(--border-2);
          border-radius: 14px;
          padding: 16px;
          background: #ffffff;
          cursor: pointer;
          text-align: left;
          transition: border-color 0.15s, background 0.15s;
        }

        .ha-card:hover {
          border-color: var(--accent-border);
          background: rgba(255, 215, 100, 0.05);
        }

        .ha-card h4 {
          margin: 0 0 8px;
          font-size: 15px;
          color: var(--accent);
        }

        .ha-card p {
          margin: 0;
          font-size: 13px;
          color: var(--muted);
          line-height: 1.45;
        }

        .ha-back {
          margin-bottom: 12px;
        }

        /* 専門家チェック */
        .ha-checkGrid {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .ha-check {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 10px;
          border-radius: 10px;
          border: 1px solid var(--border-2);
          font-size: 13px;
          cursor: pointer;
          user-select: none;
        }

        .ha-checkOn {
          border-color: var(--accent-border);
          background: var(--accent-dim);
          color: var(--accent);
        }

        .ha-check input {
          accent-color: var(--accent);
        }

        .ha-aiBox {
          margin-top: 14px;
          padding: 14px;
          border-radius: 14px;
          border: 1px dashed var(--accent-border);
          background: rgba(255, 215, 100, 0.06);
          font-size: 13px;
          line-height: 1.6;
          white-space: pre-wrap;
        }

        /* コミュニティ */
        .ha-postForm {
          border: 1px solid var(--border-2);
          border-radius: 14px;
          padding: 14px;
          margin-bottom: 18px;
          background: #ffffff;
        }

        .ha-post {
            color: #1a1a1a;
          border: 1px solid var(--border-2);
          border-radius: 14px;
          padding: 14px;
          margin-bottom: 12px;
          background: #f8fafc;
        }

        .ha-post h4 {
          margin: 0 0 8px;
          font-size: 15px;
          color: var(--text);
        }

        .ha-postBody {
          font-size: 14px;
          line-height: 1.55;
          color: rgba(255, 255, 255, 0.82);
          margin-bottom: 10px;
          white-space: pre-wrap;
        }

        .ha-postMeta {
          font-size: 12px;
          color: var(--muted);
          margin-bottom: 10px;
        }

        .ha-reactions {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 10px;
        }

        .ha-reactBtn {
          font-size: 12px;
          padding: 6px 10px;
          border-radius: 999px;
          border: 1px solid var(--border-2);
          background: rgba(255, 255, 255, 0.03);
          color: var(--muted);
          cursor: pointer;
        }

        .ha-reactBtn[data-on="true"] {
          border-color: var(--accent-border);
          color: var(--accent);
          background: var(--accent-dim);
        }

        .ha-comments {
          margin-top: 10px;
          padding-top: 10px;
          border-top: 1px solid var(--border-2);
        }

        .ha-comment {
          font-size: 13px;
          padding: 8px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          color: rgba(255, 255, 255, 0.78);
        }

        .ha-aiComment {
          margin-top: 10px;
          padding: 12px;
          border-radius: 12px;
          background: rgba(255, 215, 100, 0.08);
          border: 1px solid var(--accent-border);
          font-size: 13px;
          line-height: 1.55;
          white-space: pre-wrap;
        }

        .ha-stepBadge {
          display: inline-block;
          font-size: 11px;
          color: var(--accent);
          border: 1px solid var(--border-2);
          padding: 4px 8px;
          border-radius: 8px;
          margin-bottom: 12px;
        }
      `}</style>

      <div className="ha-app">
        <header className="ha-header">
          <div className="ha-brand">
            <div className="ha-logo" aria-hidden="true">
              H
            </div>
            <div>
              <strong>不動産AIコンシェルジュ</strong>
              <span>不動産のお悩み・査定・専門家紹介・コミュニティ</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="ha-pill" title="Claudeモデル">
              Claude: {model}
            </div>
            <button
              type="button"
              className="ha-btn"
              style={{ whiteSpace: 'nowrap', background: 'var(--accent)', color: '#fff', border: 'none' }}
              onClick={() => alert('会員登録機能は準備中です。')}
            >
              会員登録
            </button></div>
        </header>
        <TickerBanner />

        <div style={{
          margin: '0 12px 12px',
          padding: '14px 16px',
          borderRadius: 14,
          background: '#fffbeb',
          border: '1px solid #f59e0b',
          fontSize: 13,
          lineHeight: 1.7,
          color: '#92400e',
        }}>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>📋 ご利用上の注意</div>
          <div><strong>目的：</strong>当コミュニティは不動産にまつわるお悩みや課題を解決することを目的としています。</div>
          <div>※ 組織名・固有名詞・個人もしくは組織を特定できるような内容はお控えください。</div>
          <div>※ コミュニティ内での営業は理由を問わずアドバイス以外は禁止とします。</div>
          <div>※ 悩みや問題解決以外の目的でのご利用はご遠慮ください。運営側で発見した場合、如何なる理由を問わず削除させていただく場合がございます。</div>
        </div>

        <nav className="ha-tabs" role="tablist" aria-label="メイン">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              className="ha-tab"
              onClick={() => setTab(t.id)}
            >
              <span aria-hidden="true">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </nav>

        <main className="ha-main">
          {tab === 'properties' && (
            <div className="ha-panel" style={{ padding: 0 }}>
              <PropertiesPage user={user} />
            </div>
          )}
          {tab === 'vendors' && (
            <div className="ha-panel" style={{ padding: 0 }}>
              <VendorPage />
            </div>
          )}
          {tab === 'home' && (
          <HomeScreen onNavigate={(view) => setTab(view)} />
        )}

        {tab === 'chat' && (
            <div className="ha-panel ha-chatWrap">
              <div className="ha-chatTop">
                <div>
                  <h2 className="ha-sectionTitle" style={{ marginBottom: 4 }}>
                    💬 AIチャット
                  </h2>
                  <p className="ha-sectionDesc" style={{ margin: 0 }}>
                    不動産コンシェルジュが条件整理と次の一歩をサポートします。
                  </p>
                </div>
				{/* chat_nav_buttons_v3 */}
				<div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
					<button type="button" onClick={() => setTab('properties')}
						style={{ padding: '5px 10px', background: '#1a3a5c', color: '#fff', border: 'none', borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
						🏠 物件情報
					</button>
					<button type="button" onClick={() => setTab('vendors')}
						style={{ padding: '5px 10px', background: '#c9a84c', color: '#fff', border: 'none', borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
						👷 業者一覧・比較
					</button>
					<button type="button" className="ha-btn ha-btnGhost" onClick={handleResetChat} disabled={isSending}>
						新規チャット
					</button>
				</div>
              </div>

              <div className="ha-messages" role="log" aria-live="polite">
                {chat.map((m, idx) => (
                  <div
                    key={`${m.role}-${idx}`}
                    className={`ha-msgRow ${m.role === 'user' ? 'user' : 'assistant'}`}
                  >
                    <div className="ha-bubble">
                      <div className="ha-meta">{m.role === 'user' ? 'あなた' : 'コンシェルジュ'}</div>
                      <div className="ha-bubbleText">{m.text}</div>
                    </div>
                  </div>
                ))}
                <AdBanner slot="chat" />
                {isSending ? (
                  <div className="ha-msgRow assistant">
                    <div className="ha-bubble">
                      <div className="ha-meta">コンシェルジュ</div>
                      <div className="ha-bubbleText">
                        返信を生成中
                        <span style={{ marginLeft: 8 }} aria-hidden="true">
                          <span className="ha-spinnerDot" />
                          <span className="ha-spinnerDot" />
                          <span className="ha-spinnerDot" />
                        </span>
                      </div>
                    </div>
                  </div>
                ) : null}
                <div ref={endRef} />
              </div>

              {errorMessage ? <div className="ha-error">{errorMessage}</div> : null}

              <form
                className="ha-composer"
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSend()
                }}
              >
                <div className="ha-composerInner">
                  <textarea
                    className="ha-field"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="エリア、予算、希望条件など（Enterで送信 / Shift+Enterで改行）"
                    disabled={isSending}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSend()
                      }
                    }}
                  style={{ minHeight: '80px', flex: 1, resize: 'none' }} />
                  <div className="ha-composerActions">
                    <button type="submit" className="ha-btn" disabled={isSending}>
                      送信
                    </button>
                    <button
                      type="button"
                      className="ha-btn ha-btnGhost"
                      onClick={() =>
                        setInput('東京23区内で、30〜50㎡、家賃は月25万円以内。通勤は30分以内が理想です。')
                      }
                      disabled={isSending}
                    >
                      例文
                    </button>
                  </div>
                </div>

              </form>
            </div>
          )}

          {tab === 'sell' && (
            <div className="ha-panel">
              <h2 className="ha-sectionTitle">🏷️ 売却査定</h2>
              <p className="ha-sectionDesc">
                売却査定のご依頼を2ステップで受け付けます。担当者より折り返しご連絡いたします。
              </p>

              {sell.step === 'done' ? (
                <div className="ha-done">
                  <h3>送信しました！</h3>
                  <p>
                    査定依頼を受け付けました。担当よりご連絡します。
                  </p>
                  <button
                    type="button"
                    className="ha-btn"
                    onClick={() => {
                      setSellSubmitError('')
                      setSell({ ...initialSell, step: 1 })
                    }}
                  >
                    新しい依頼を入力
                  </button>
                </div>
              ) : (
                <>
                  <div className="ha-stepBadge">
                    ステップ {sell.step} / 2 — {sell.step === 1 ? '物件情報' : 'ご連絡先・備考'}
                  </div>

                  {sell.step === 1 && (
                    <>
                      <div className="ha-row">
                        <label className={labelClass}>物件種別</label>
                        <select
                          className={fieldClass}
                          value={sell.propertyType}
                          onChange={(e) => setSell((s) => ({ ...s, propertyType: e.target.value }))}
                        >
                          <option value="">選択してください</option>
                          {PROPERTY_TYPES.map((p) => (
                            <option key={p} value={p}>
                              {p}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="ha-row">
                        <label className={labelClass}>郵便番号（自動入力）</label>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <input
                            className={fieldClass}
                            value={sell.zip || ''}
                            onChange={(e) => setSell((s) => ({ ...s, zip: e.target.value }))}
                            placeholder="例：3300803"
                            inputMode="numeric"
                            maxLength={8}
                            style={{ maxWidth: 160 }}
                          />
                          <button
                            type="button"
                            className="ha-btn"
                            onClick={async () => {
                              const zip = (sell.zip || '').replace('-', '').trim();
                              if (zip.length !== 7) return;
                              try {
                                const res = await fetch(`https://zipcloud.ibsnet.co.jp/api/search?zipcode=${zip}`);
                                const data = await res.json();
                                if (data.results && data.results[0]) {
                                  const r = data.results[0];
                                  setSell((s) => ({ ...s, address: r.address1 + r.address2 + r.address3 }));
                                }
                              } catch {}
                            }}
                          >
                            住所を検索
                          </button>
                        </div>
                      </div>
                      <div className="ha-row">
                        <label className={labelClass}>住所（市区町村・番地まで）</label>
                        <input
                          className={fieldClass}
                          value={sell.address}
                          onChange={(e) => setSell((s) => ({ ...s, address: e.target.value }))}
                          placeholder="例：東京都〇〇区..."
                          autoComplete="street-address"
                        />
                      </div>
                      <div className="ha-grid2">
                        <div className="ha-row" style={{ marginBottom: 0 }}>
                          <label className={labelClass}>専有面積（㎡）</label>
                          <input
                            className={fieldClass}
                            value={sell.area}
                            onChange={(e) => setSell((s) => ({ ...s, area: e.target.value }))}
                            inputMode="decimal"
                            placeholder="例：65.2"
                          />
                        </div>
                        <div className="ha-row" style={{ marginBottom: 0 }}>
                          <label className={labelClass}>築年数（年）</label>
                          <input
                            className={fieldClass}
                            value={sell.builtYear}
                            onChange={(e) => setSell((s) => ({ ...s, builtYear: e.target.value }))}
                            inputMode="numeric"
                            placeholder="例：12"
                          />
                        </div>
                      </div>
                      <div className="ha-row">
                        <label className={labelClass}>間取り</label>
                        <select
                          className={fieldClass}
                          value={sell.layout}
                          onChange={(e) => setSell((s) => ({ ...s, layout: e.target.value }))}
                        >
                          <option value="">選択してください</option>
                          {LAYOUTS.map((l) => (
                            <option key={l} value={l}>
                              {l}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="ha-actions">
                        <button
                          type="button"
                          className="ha-btn"
                          onClick={() => {
                            if (!sell.propertyType || !sell.address.trim()) return
                            setSell((s) => ({ ...s, step: 2 }))
                          }}
                        >
                          次へ（連絡先入力）
                        </button>
                      </div>
                    </>
                  )}

                  {sell.step === 2 && (
                    <>
                      <div className="ha-grid2">
                        <div className="ha-row" style={{ marginBottom: 0 }}>
                          <label className={labelClass}>お名前</label>
                          <input
                            className={fieldClass}
                            value={sell.name}
                            onChange={(e) => setSell((s) => ({ ...s, name: e.target.value }))}
                            autoComplete="name"
                          />
                        </div>
                        <div className="ha-row" style={{ marginBottom: 0 }}>
                          <label className={labelClass}>電話番号</label>
                          <input
                            className={fieldClass}
                            value={sell.phone}
                            onChange={(e) => setSell((s) => ({ ...s, phone: e.target.value }))}
                            inputMode="tel"
                            autoComplete="tel"
                          />
                        </div>
                      </div>
                      <div className="ha-row">
                        <label className={labelClass}>メールアドレス</label>
                        <input
                          className={fieldClass}
                          type="email"
                          value={sell.email}
                          onChange={(e) => setSell((s) => ({ ...s, email: e.target.value }))}
                          autoComplete="email"
                        />
                      </div>
                      <div className="ha-row">
                        <label className={labelClass}>希望・備考</label>
                        <textarea
                          className={fieldClass}
                          value={sell.notes}
                          onChange={(e) => setSell((s) => ({ ...s, notes: e.target.value }))}
                          placeholder="売却時期の希望、内覧の可否など"
                        />
                      </div>
                      {sellSubmitError ? <div className="ha-error">{sellSubmitError}</div> : null}
                      <div className="ha-actions">
                        <button
                          type="button"
                          className="ha-btn ha-btnGhost"
                          onClick={() => {
                            setSellSubmitError('')
                            setSell((s) => ({ ...s, step: 1 }))
                          }}
                        >
                          戻る
                        </button>
                        <button
                          type="button"
                          className="ha-btn"
                          disabled={sellSubmitting}
                          onClick={submitValuation}
                        >
                          {sellSubmitting ? '送信中…' : '送信する'}
                        </button>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          )}

          {tab === 'owner' && (
            <div className="ha-panel">
              <h2 className="ha-sectionTitle">🏢 アパート賃貸経営者様向け</h2>
              <p className="ha-sectionDesc">
                管理委託・稼働率改善・売却査定のご相談メニューです。各メニューは2ステップのフォーム後に送信完了へ進みます。
              </p>

              {!ownerService && (
                <div className="ha-cards">
                  <button
                    type="button"
                    className="ha-card"
                    onClick={() => {
                      setOwnerService('manage')
                      setOwnerForm({ ...initialOwnerForm(), step: 1 })
                    }}
                  >
                    <h4>管理委託</h4>
                    <p>賃貸管理の委託条件や切替のタイミング、見積比較の観点を整理します。</p>
                  </button>
                  <button
                    type="button"
                    className="ha-card"
                    onClick={() => {
                      setOwnerService('occupancy')
                      setOwnerForm({ ...initialOwnerForm(), step: 1 })
                    }}
                  >
                    <h4>稼働率アップ</h4>
                    <p>空室対策・家賃設定・リフォームの優先度など、収益改善の打ち手を検討します。</p>
                  </button>
                  <button
                    type="button"
                    className="ha-card"
                    onClick={() => {
                      setOwnerService('sell')
                      setOwnerForm({ ...initialOwnerForm(), step: 1 })
                    }}
                  >
                    <h4>売却査定（オーナー）</h4>
                    <p>一棟アパートの売却に向けた情報整理と次のステップをまとめます。</p>
                  </button>
                </div>
              )}

              {ownerService && ownerForm.step === 'done' && (
                <div className="ha-done">
                  <h3>送信しました！</h3>
                  <p>
                    「{ownerTitle}」の依頼を受け付けました。担当よりご連絡します。
                  </p>
                  <button
                    type="button"
                    className="ha-btn"
                    onClick={() => {
                      setOwnerSubmitError('')
                      setOwnerService(null)
                      setOwnerForm(initialOwnerForm())
                    }}
                  >
                    メニューに戻る
                  </button>
                </div>
              )}

              {ownerService && ownerForm.step !== 'done' && (
                <>
                  <div className="ha-back">
                    <button
                      type="button"
                      className="ha-btn ha-btnGhost"
                      onClick={() => {
                        setOwnerService(null)
                        setOwnerForm(initialOwnerForm())
                      }}
                    >
                      ← メニューに戻る
                    </button>
                  </div>
                  <h3 style={{ margin: '0 0 8px', fontSize: 16, color: 'var(--accent)' }}>{ownerTitle}</h3>
                  <div className="ha-stepBadge">
                    ステップ {ownerForm.step} / 2 — {ownerForm.step === 1 ? '物件・概要' : 'ご連絡先・詳細'}
                  </div>

                  {ownerForm.step === 1 && (
                    <>
                      <div className="ha-row">
                        <label className={labelClass}>物件種別</label>
                        <select
                          className={fieldClass}
                          value={ownerForm.propertyType}
                          onChange={(e) => setOwnerForm((o) => ({ ...o, propertyType: e.target.value }))}
                        >
                          <option value="">選択</option>
                          <option value="木造アパート">木造アパート</option>
                          <option value="RC一棟">RC一棟</option>
                          <option value="その他">その他</option>
                        </select>
                      </div>
                      <div className="ha-row">
                        <label className={labelClass}>戸数 / 室数</label>
                        <input
                          className={fieldClass}
                          value={ownerForm.units}
                          onChange={(e) => setOwnerForm((o) => ({ ...o, units: e.target.value }))}
                          placeholder="例：8戸"
                        />
                      </div>
                      <div className="ha-row">
                        <label className={labelClass}>所在地</label>
                        <input
                          className={fieldClass}
                          value={ownerForm.address}
                          onChange={(e) => setOwnerForm((o) => ({ ...o, address: e.target.value }))}
                          placeholder="市区町村までで可"
                        />
                      </div>
                      <div className="ha-actions">
                        <button
                          type="button"
                          className="ha-btn"
                          onClick={() => {
                            if (!ownerForm.propertyType || !ownerForm.address.trim()) return
                            setOwnerForm((o) => ({ ...o, step: 2 }))
                          }}
                        >
                          次へ
                        </button>
                      </div>
                    </>
                  )}

                  {ownerForm.step === 2 && (
                    <>
                      <div className="ha-grid2">
                        <div className="ha-row" style={{ marginBottom: 0 }}>
                          <label className={labelClass}>お名前</label>
                          <input
                            className={fieldClass}
                            value={ownerForm.name}
                            onChange={(e) => setOwnerForm((o) => ({ ...o, name: e.target.value }))}
                          />
                        </div>
                        <div className="ha-row" style={{ marginBottom: 0 }}>
                          <label className={labelClass}>電話番号</label>
                          <input
                            className={fieldClass}
                            value={ownerForm.phone}
                            onChange={(e) => setOwnerForm((o) => ({ ...o, phone: e.target.value }))}
                            inputMode="tel"
                          />
                        </div>
                      </div>
                      <div className="ha-row">
                        <label className={labelClass}>メールアドレス</label>
                        <input
                          className={fieldClass}
                          type="email"
                          value={ownerForm.email}
                          onChange={(e) => setOwnerForm((o) => ({ ...o, email: e.target.value }))}
                        />
                      </div>
                      <div className="ha-row">
                        <label className={labelClass}>ご相談内容・備考</label>
                        <textarea
                          className={fieldClass}
                          value={ownerForm.notes}
                          onChange={(e) => setOwnerForm((o) => ({ ...o, notes: e.target.value }))}
                          placeholder={
                            ownerService === 'manage'
                              ? '管理会社の切替検討、委託費の希望など'
                              : ownerService === 'occupancy'
                                ? '空室期間、家賃、リフォーム履歴など'
                                : '売却理由、希望時期、ローン残債の有無など'
                          }
                        />
                      </div>
                      {ownerSubmitError ? <div className="ha-error">{ownerSubmitError}</div> : null}
                      <div className="ha-actions">
                        <button
                          type="button"
                          className="ha-btn ha-btnGhost"
                          onClick={() => {
                            setOwnerSubmitError('')
                            setOwnerForm((o) => ({ ...o, step: 1 }))
                          }}
                        >
                          戻る
                        </button>
                        <button
                          type="button"
                          className="ha-btn"
                          disabled={ownerSubmitting}
                          onClick={submitOwnerRequest}
                        >
                          {ownerSubmitting ? '送信中…' : '送信する'}
                        </button>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          )}

          {tab === 'expert' && (
            <div className="ha-panel">
              <h2 className="ha-sectionTitle">👔 専門家紹介</h2>
              <p className="ha-sectionDesc">
                あなたに合った各専門家をご紹介いたします。相談料・お見積りは無料です。紹介料なども一切発生いたしません。条件に合えば成約となります。ご安心してお問い合わせください。
              </p>

              {expert.step === 'done' ? (
                <div className="ha-done">
                  <h3>送信しました！</h3>
                  <p>専門家紹介のご依頼を受け付けました。担当よりご連絡します。</p>
                  <button
                    type="button"
                    className="ha-btn"
                    onClick={() => {
                      setExpertSubmitError('')
                      setExpert({ ...initialExpert, step: 1 })
                    }}
                  >
                    新規入力
                  </button>
                </div>
              ) : (
                <>
                  <div className="ha-stepBadge">
                    ステップ {expert.step} / 2 — {expert.step === 1 ? '相談内容' : '連絡先・送信'}
                  </div>

                  {expert.step === 1 && (
                    <>
                      <div className="ha-row">
                        <span className={labelClass}>紹介を希望する専門家（複数可）</span>
                        <div className="ha-checkGrid">
                          {EXPERT_TYPES.map((t) => (
                            <label
                              key={t.id}
                              className={`ha-check ${expert.types.includes(t.id) ? 'ha-checkOn' : ''}`}
                            >
                              <input
                                type="checkbox"
                                checked={expert.types.includes(t.id)}
                                onChange={() => toggleExpertType(t.id)}
                              />
                              {t.label}
                            </label>
                          ))}
                        </div>
                      </div>
                      <div className="ha-row">
                        <label className={labelClass}>エリア・物件の概要</label>
                        <input
                          className={fieldClass}
                          value={expert.region}
                          onChange={(e) => setExpert((x) => ({ ...x, region: e.target.value }))}
                          placeholder="例：関東 / 中古マンション購入予定"
                        />
                      </div>
                      <div className="ha-row">
                        <label className={labelClass}>相談したいこと</label>
                        <textarea
                          className={fieldClass}
                          value={expert.detail}
                          onChange={(e) => setExpert((x) => ({ ...x, detail: e.target.value }))}
                          placeholder="状況や課題を具体的にご記入ください。"
                        />
                      </div>
                      <div className="ha-actions">
                        <button
                          type="button"
                          className="ha-btn"
                          disabled={expert.aiLoading}
                          onClick={generateExpertAdvice}
                        >
                          {expert.aiLoading ? 'AI生成中…' : 'AIアドバイスを生成'}
                        </button>
                        <button
                          type="button"
                          className="ha-btn ha-btnGhost"
                          onClick={() => {
                            if (!expert.types.length || !expert.detail.trim()) return
                            setExpert((x) => ({ ...x, step: 2 }))
                          }}
                        >
                          次へ（連絡先）
                        </button>
                      </div>
                      {expert.aiError ? <div className="ha-error">{expert.aiError}</div> : null}
                      {expert.aiAdvice ? (
                        <div>
                          <div className={labelClass} style={{ marginTop: 16 }}>
                            AIアドバイス（参考）
                          </div>
                          <div className="ha-aiBox">{expert.aiAdvice}</div>
                        </div>
                      ) : null}
                    </>
                  )}

                  {expert.step === 2 && (
                    <>
                      {expert.aiAdvice ? (
                        <div className="ha-aiBox" style={{ marginBottom: 14 }}>
                          {expert.aiAdvice}
                        </div>
                      ) : (
                        <p className="ha-sectionDesc">ステップ1で生成したAIアドバイスがここに表示されます。</p>
                      )}
                      <div className="ha-grid2">
                        <div className="ha-row" style={{ marginBottom: 0 }}>
                          <label className={labelClass}>お名前</label>
                          <input
                            className={fieldClass}
                            value={expert.name}
                            onChange={(e) => setExpert((x) => ({ ...x, name: e.target.value }))}
                          />
                        </div>
                        <div className="ha-row" style={{ marginBottom: 0 }}>
                          <label className={labelClass}>電話番号</label>
                          <input
                            className={fieldClass}
                            value={expert.phone}
                            onChange={(e) => setExpert((x) => ({ ...x, phone: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div className="ha-row">
                        <label className={labelClass}>メールアドレス</label>
                        <input
                          className={fieldClass}
                          type="email"
                          value={expert.email}
                          onChange={(e) => setExpert((x) => ({ ...x, email: e.target.value }))}
                        />
                      </div>
                      <div className="ha-row">
                        <label className={labelClass}>備考</label>
                        <textarea
                          className={fieldClass}
                          value={expert.notes}
                          onChange={(e) => setExpert((x) => ({ ...x, notes: e.target.value }))}
                        />
                      </div>
                      {expertSubmitError ? <div className="ha-error">{expertSubmitError}</div> : null}
                      <div className="ha-actions">
                        <button
                          type="button"
                          className="ha-btn ha-btnGhost"
                          onClick={() => {
                            setExpertSubmitError('')
                            setExpert((x) => ({ ...x, step: 1 }))
                          }}
                        >
                          戻る
                        </button>
                        <button
                          type="button"
                          className="ha-btn"
                          disabled={expertSubmitting}
                          onClick={submitExpertRequest}
                        >
                          {expertSubmitting ? '送信中…' : '送信する'}
                        </button>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          )}

          {tab === 'member' && (
            <div className="ha-panel" style={{ padding: 0 }}>
              <PremiumUpgradeBanner user={null} isPremium={isPremium} />
              <AuthPanel />
            </div>
          )}

          {tab === 'agency' && (
            <div className="ha-panel" style={{ padding: 0 }}>
              {!agencyType && (
                <div style={{ padding: '40px 24px' }}>
                  <h2 style={{ color: '#1a3a5c', fontSize: 20, fontWeight: 700, textAlign: 'center', marginBottom: 8 }}>🏗️ 業者様向けサービス</h2>
                  <p style={{ color: '#666', fontSize: 14, textAlign: 'center', marginBottom: 32 }}>ご利用用途をお選びください</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 560, margin: '0 auto' }}>
                    <div style={{ border: '2px solid #1a3a5c', borderRadius: 16, padding: '28px 24px', cursor: 'pointer', background: '#fff' }}
                      onClick={() => window.location.href = '/agency'}>
                      <div style={{ fontSize: 32, marginBottom: 10 }}>🏠</div>
                      <div style={{ color: '#1a3a5c', fontSize: 18, fontWeight: 700, marginBottom: 8 }}>不動産業者様</div>
                      <div style={{ color: '#555', fontSize: 13, lineHeight: 1.7, marginBottom: 16 }}>
                        物件の登録・掲載・管理ができます。専用ダッシュボードにて物件情報をご登録いただけます。
                      </div>
                      <div style={{ display: 'inline-block', padding: '10px 24px', background: '#1a3a5c', color: '#fff', borderRadius: 10, fontWeight: 700, fontSize: 14 }}>
                        会員登録はこちら →
                      </div>
                      <div style={{ marginTop: 12, fontSize: 12, color: '#888' }}>
                        すでに登録済みの方は
                        <a href="/agency" style={{ color: '#1a3a5c', fontWeight: 700, marginLeft: 4 }}>こちらからログイン →</a>
                      </div>
                    </div>
                    <div style={{ border: '2px solid #c9a84c', borderRadius: 16, padding: '28px 24px', cursor: 'pointer', background: '#fff' }}
                      onClick={() => window.location.href = '/partner'}>
                      <div style={{ fontSize: 32, marginBottom: 10 }}>🏢</div>
                      <div style={{ color: '#1a3a5c', fontSize: 18, fontWeight: 700, marginBottom: 8 }}>その他の業者様</div>
                      <div style={{ color: '#555', fontSize: 13, lineHeight: 1.7, marginBottom: 4 }}>
                        リフォーム・外構・司法書士・税理士・金融機関など、当サイトへの広告掲載をご希望の方はこちら。
                      </div>
                      <div style={{ color: '#888', fontSize: 12, marginBottom: 16 }}>※ 広告ページはこちらで作成し、当サイトに掲載いたします</div>
                      <div style={{ display: 'inline-block', padding: '10px 24px', background: '#c9a84c', color: '#fff', borderRadius: 10, fontWeight: 700, fontSize: 14 }}>
                        会員登録はこちら →
                      </div>
                      <div style={{ marginTop: 12, fontSize: 12, color: '#888' }}>
                        すでに登録済みの方は
                        <a href="/agency" style={{ color: '#c9a84c', fontWeight: 700, marginLeft: 4 }}>こちらからログイン →</a>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {agencyType === 'realestate' && (
                <div>
                  <div style={{ background: '#1a3a5c', borderRadius: '12px 12px 0 0', padding: '20px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                      <div>
                        <div style={{ color: '#c9a84c', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>不動産業者様向け</div>
                        <div style={{ color: '#fff', fontSize: 16, fontWeight: 700 }}>🏠 不動産業者様専用ダッシュボード</div>
                        <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 4 }}>物件の登録・管理・公開設定ができます</div>
                      </div>
                      <a href="/agency" style={{ display: 'inline-block', padding: '12px 24px', background: '#f5a623', color: '#1a3a5c', borderRadius: 10, fontWeight: 700, fontSize: 14, textDecoration: 'none', whiteSpace: 'nowrap' }}>
                        ダッシュボードへ →
                      </a>
                    </div>
                  </div>
                  <div style={{ padding: '12px 24px' }}>
                    <button onClick={() => setAgencyType(null)} style={{ background: 'none', border: 'none', color: '#1a3a5c', fontSize: 13, cursor: 'pointer', textDecoration: 'underline' }}>← 選択画面に戻る</button>
                  </div>
                  <AgencyForm />
                </div>
              )}
              {agencyType === 'other' && (
                <div style={{ padding: '32px 24px' }}>
                  <button onClick={() => setAgencyType(null)} style={{ background: 'none', border: 'none', color: '#1a3a5c', fontSize: 13, cursor: 'pointer', textDecoration: 'underline', marginBottom: 24, display: 'block' }}>← 選択画面に戻る</button>
                  <h2 style={{ color: '#1a3a5c', fontSize: 18, fontWeight: 700, marginBottom: 8 }}>🏢 広告掲載のお申し込み</h2>
                  <p style={{ color: '#555', fontSize: 13, lineHeight: 1.8, marginBottom: 24 }}>
                    リフォーム・外構・司法書士・税理士・金融機関など、各業種の業者様の広告を当サイトに掲載いたします。
                    まずは会員登録をお願いいたします。担当者よりご連絡させていただきます。
                  </p>
                  <AgencyForm />
                </div>
              )}
            </div>
          )}

          {tab === 'column' && (
            <ColumnPage />
          )}

          {tab === 'community' && (
            <div className="ha-panel">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                <h2 className="ha-sectionTitle">🏘️ コミュニティ</h2>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button type="button" onClick={() => setTab('properties')}
                    style={{ padding: '5px 10px', background: '#1a3a5c', color: '#fff', border: 'none', borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    🏠 物件情報
                  </button>
                  <button type="button" onClick={() => setTab('vendors')}
                    style={{ padding: '5px 10px', background: '#c9a84c', color: '#fff', border: 'none', borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    👷 業者一覧・比較
                  </button>
                </div>
              </div>
              <p className="ha-sectionDesc">
                不動産の体験談や悩みを共有できます。投稿内容はサービス全体で共有されます。
              </p>

              <div className="ha-postForm">
                <div className="ha-row">
                  <label className={labelClass}>タイトル</label>
                  <input
                    className={fieldClass}
                    value={communityDraft.title}
                    onChange={(e) => setCommunityDraft((d) => ({ ...d, title: e.target.value }))}
                  />
                </div>
                <div className="ha-row">
                  <label className={labelClass}>本文</label>
                  <textarea
                    className={fieldClass}
                    value={communityDraft.body}
                    onChange={(e) => setCommunityDraft((d) => ({ ...d, body: e.target.value }))}
                  />
                </div>
                <div className="ha-row">
                  <label className={labelClass}>お名前（任意）</label>
                  <input
                    className={fieldClass}
                    value={communityDraft.author}
                    onChange={(e) => setCommunityDraft((d) => ({ ...d, author: e.target.value }))}
                    placeholder="空欄なら匿名"
                  />
                </div>
                <button type="button" className="ha-btn" onClick={addPost}>
                  投稿する
                </button>
              </div>

              {posts.length === 0 ? (
                <p style={{ color: 'var(--muted)', fontSize: 14 }}>まだ投稿がありません。最初の体験談を投稿してみましょう。</p>
              ) : (
                posts.map((post) => (
                  <article key={post.id} className="ha-post" style={{ color: '#1a1a1a' }}>
                    <h4>{post.title}</h4>
                    <div className="ha-postBody">{post.body}</div>
                    <div className="ha-postMeta">
                      {post.author} ・ {new Date(post.createdAt).toLocaleString('ja-JP')}
                    </div>
                    <div className="ha-reactions">
                      <button
                        type="button"
                        className="ha-reactBtn"
                        data-on={post.likedByMe}
                        onClick={() => toggleLike(post.id)}
                      >
                        👍 いいね {post.likes}
                      </button>
                      <button
                        type="button"
                        className="ha-reactBtn"
                        data-on={post.empathyByMe}
                        onClick={() => toggleEmpathy(post.id)}
                      >
                        💗 共感 {post.empathy}
                      </button>
                      <button
                        type="button"
                        className="ha-btn ha-btnGhost"
                        style={{ padding: '6px 10px', fontSize: 12 }}
                        onClick={() => setExpandedPost((id) => (id === post.id ? null : post.id))}
                      >
                        {expandedPost === post.id ? '閉じる' : 'コメント・AI'}
                      </button>
                    </div>

                    {expandedPost === post.id && (
                      <div className="ha-comments">
                        {post.aiComment ? (
                          <div className="ha-aiComment">
                            <strong style={{ color: 'var(--accent)' }}>AIコメント</strong>
                            {'\n\n'}
                            {post.aiComment}
                          </div>
                        ) : null}
                        <div className="ha-actions" style={{ marginTop: 10 }}>
                          <button
                            type="button"
                            className="ha-btn"
                            disabled={aiLoadingPostId === post.id}
                            onClick={() => generateAiComment(post)}
                          >
                            {aiLoadingPostId === post.id ? 'AI生成中…' : 'AIコメントを生成'}
                          </button>
                        </div>
                        {post.comments.map((c) => (
                          <div key={c.id} className="ha-comment">
                            <strong>{c.author}</strong> · {new Date(c.createdAt).toLocaleString('ja-JP')}
                            {'\n'}
                            {c.text}
                          </div>
                        ))}
                        <div className="ha-row" style={{ marginTop: 10 }}>
                          <input
                            className={fieldClass}
                            placeholder="コメントを入力"
                            value={commentDrafts[post.id] || ''}
                            onChange={(e) =>
                              setCommentDrafts((d) => ({ ...d, [post.id]: e.target.value }))
                            }
                          />
                        </div>
                        <button type="button" className="ha-btn ha-btnGhost" onClick={() => addComment(post.id)}>
                          コメントを投稿
                        </button>
                      </div>
                    )}
                  </article>
                ))
              )}
            </div>
          )}
        </main>
      </div>
    </>
  )
}
