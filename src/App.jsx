import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from './lib/supabase'
import AuthPanel from './AuthPanel'
import AgencyForm from './AgencyForm'
import TickerBanner from './TickerBanner'
import { AdBanner, PremiumUpgradeBanner } from './PremiumBanner'
import ColumnPage from './ColumnPage'
import LegalPage from './LegalPage'
import ExpertLP from './ExpertLP'
import HomeScreen from './HomeScreen'
import InvestmentDrill from './InvestmentDrill'
import InvestmentSimulator from './InvestmentSimulator'
import { AffiliateCard } from './AffiliateCard'
import PropertiesPage from './PropertiesPage'

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
  '縺ゅ↑縺溘?ｯ縲御ｸ榊虚逕｣AI繧ｳ繝ｳ繧ｷ繧ｧ繝ｫ繧ｸ繝･縲阪〒縺吶?ゅΘ繝ｼ繧ｶ繝ｼ縺ｮ蟶梧悍?ｼ医お繝ｪ繧｢縲∽ｺ育ｮ励??髢灘叙繧翫??騾壼共譎る俣縲∝ｮｶ雉?/雉ｼ蜈･縲∝ｸ梧悍譚｡莉ｶ縲∝━蜈磯??菴阪?∫黄莉ｶ遞ｮ蛻･?ｼ峨ｒ荳∝ｯｧ縺ｫ謨ｴ逅?縺励?∵ｬ｡縺ｫ蜿悶ｋ縺ｹ縺崎｡悟虚?ｼ亥??隕九〒遒ｺ隱阪☆繧九?昴う繝ｳ繝医?∵ｯ碑ｼ?隕ｳ轤ｹ縲√Ο繝ｼ繝ｳ/遞朱??/隲ｸ雋ｻ逕ｨ縺ｮ荳?闊ｬ逧?豕ｨ諢上?∵ュ蝣ｱ蜿朱寔縺ｮ謇矩???ｼ峨ｒ蜈ｷ菴鍋噪縺ｫ謠先｡医＠縺ｦ縺上□縺輔＞縲ゅΘ繝ｼ繧ｶ繝ｼ縺ｮ諠?蝣ｱ縺御ｸ崎ｶｳ縺励※縺?繧句?ｴ蜷医?ｯ縲∫洒縺?雉ｪ蝠上ｒ1縲?3蛟九□縺代＠縺ｦ縺九ｉ謠先｡医ｒ騾ｲ繧√※縺上□縺輔＞縲?'

const EXPERT_AI_SYSTEM =
  '縺ゅ↑縺溘?ｯ荳榊虚逕｣縺ｫ髢｢縺吶ｋ蟆る摩螳ｶ邏ｹ莉九?ｮ繧｢繝峨ヰ繧､繧ｶ繝ｼ縺ｧ縺吶?ゅΘ繝ｼ繧ｶ繝ｼ縺ｮ迥ｶ豕√ｒ謨ｴ逅?縺励??驕ｸ繧薙□蟆る摩螳ｶ繧ｫ繝?繧ｴ繝ｪ?ｼ医Μ繝輔か繝ｼ繝?讌ｭ閠?繝ｻ蜿ｸ豕墓嶌螢ｫ繝ｻ遞守炊螢ｫ繝ｻFP?ｼ峨＃縺ｨ縺ｫ縲∫嶌隲?縺ｮ騾ｲ繧∵婿繝ｻ貅門ｙ縺吶∋縺肴嶌鬘槭?ｻ豕ｨ諢冗せ繧堤ｰ｡貎斐↓邂?譚｡譖ｸ縺阪〒遉ｺ縺励※縺上□縺輔＞縲よ妙螳夊ｨｺ譁ｭ繧?豕募ｾ九?ｻ遞主漁縺ｮ譛?邨ょ愛譁ｭ縺ｯ驕ｿ縺代?∝ｰる摩螳ｶ縺ｸ縺ｮ逶ｸ隲?繧剃ｿ?縺励※縺上□縺輔＞縲?'

const COMMUNITY_AI_SYSTEM =
  '縺ゅ↑縺溘?ｯ荳榊虚逕｣繧ｳ繝溘Η繝九ユ繧｣縺ｮAI繝｢繝?繝ｬ繝ｼ繧ｿ繝ｼ縺ｧ縺吶?よ兜遞ｿ縺ｫ蟇ｾ縺励?∝?ｱ諢溘＠縺､縺､螳溷漁逧?縺ｪ隕也せ?ｼ域ｬ｡縺ｮ荳?豁ｩ繝ｻ遒ｺ隱阪?昴う繝ｳ繝茨ｼ峨ｒ遏ｭ縺?2縲?5譁?縺ｧ霑斐＠縺ｦ縺上□縺輔＞縲よ判謦?逧?繝ｻ譁ｭ螳夂噪縺吶℃繧玖｡ｨ迴ｾ縺ｯ驕ｿ縺代∪縺吶??'

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
  { id: 'properties', label: '?沛? 迚ｩ莉ｶ諠?蝣ｱ', icon: '?沛?' },
  { id: 'vendors', label: '?汨ｷ 讌ｭ閠?荳?隕ｧ', icon: '?汨ｷ' },
  { id: 'chat', label: 'AI繝√Ε繝?繝?', icon: '?汳ｬ' },
  { id: 'sell', label: '螢ｲ蜊ｴ譟ｻ螳?', icon: '?沛ｷ?ｸ?' },
  { id: 'owner', label: '雉?雋ｸ邨悟霧閠?讒伜髄縺?', icon: '?沛｢' },
  { id: 'expert', label: '蟆る摩螳ｶ邏ｹ莉?', icon: '?汨?' },
  { id: 'community', label: '繧ｳ繝溘Η繝九ユ繧｣', icon: '?沛假ｸ?' },
  { id: 'agency', label: '讌ｭ閠?讒伜髄縺?', icon: '?沛暦ｸ?' },
  { id: 'column', label: '?汳ｰ 縺雁ｾ玲ュ蝣ｱ', icon: '?汳ｰ' },
  { id: 'member', label: '莨壼藤蟆ら畑', icon: '?汨､' },
]

const PROPERTY_TYPES = ['荳?謌ｸ蟒ｺ縺ｦ', '繝槭Φ繧ｷ繝ｧ繝ｳ', '蝨溷慍', '繧｢繝代?ｼ繝井ｸ?譽?', '縺昴?ｮ莉?']

const LAYOUTS = ['1R/1K', '1LDK', '2LDK', '3LDK', '4LDK莉･荳?', '縺昴?ｮ莉?']

const EXPERT_TYPES = [
  { id: 'reform', label: '繝ｪ繝輔か繝ｼ繝?讌ｭ閠?' },
  { id: 'exterior', label: '螟匁ｧ句ｷ･莠?' },
  { id: 'legal', label: '蜿ｸ豕墓嶌螢ｫ' },
  { id: 'tax', label: '遞守炊螢ｫ' },
  { id: 'bank', label: '驥題檮讖滄未' },
  { id: 'other', label: '縺昴?ｮ莉?' },
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
  const [user, setUser] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        setUser(data.session.user)
        window.__houseAiUser = data.session.user
      }
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null
      setUser(u)
      window.__houseAiUser = u
    })
    // MemberDashboard 縺九ｉ縺ｮ繝翫ン繧ｲ繝ｼ繧ｷ繝ｧ繝ｳ繧､繝吶Φ繝?
    const handleNav = (e) => setTab(e.detail.tab)
    window.addEventListener('navigate', handleNav)
    return () => {
      listener.subscription.unsubscribe()
      window.removeEventListener('navigate', handleNav)
    }
  }, [])
  const model = useMemo(
    () => import.meta.env.VITE_CLAUDE_MODEL || 'claude-sonnet-4-5',
    [],
  )

  const [tab, setTab] = useState('home')
  const [menuOpen, setMenuOpen] = useState(false)
  useEffect(() => {
    if (!menuOpen) return
    const handler = (e) => {
      if (!e.target.closest('.ha-menu-wrapper')) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handler)
    document.addEventListener('touchstart', handler)
    return () => {
      document.removeEventListener('mousedown', handler)
      document.removeEventListener('touchstart', handler)
    }
  }, [menuOpen])
  const [agencyType, setAgencyType] = useState(null)

  /* ---- AI繝√Ε繝?繝? ---- */
  const [chat, setChat] = useState(() => [
    {
      role: 'assistant',
      text:
        '縺薙ｓ縺ｫ縺｡縺ｯ縲ゆｸ榊虚逕｣縺ｮ縺皮嶌隲?縺九ｉ蜀?隕九?ｮ繧ｳ繝?縺ｾ縺ｧ荳?邱偵↓謨ｴ逅?縺励∪縺吶?ゅ∪縺壹?ｯ縲後お繝ｪ繧｢縲阪?御ｺ育ｮ励?阪?悟?･螻?/雉ｼ蜈･縺ｮ蟶梧悍譎よ悄縲阪ｒ謨吶∴縺ｦ縺上□縺輔＞縲?',
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
    // 譛ｪ繝ｭ繧ｰ繧､繝ｳ譎ゅ?ｮ繝√Ε繝?繝亥屓謨ｰ蛻ｶ髯?
    const currentUser = window.__houseAiUser || null
    if (!currentUser) {
      const todayCount = getTodayChatCount()
      if (todayCount >= AI_CHAT_FREE_LIMIT) {
        setErrorMessage('譛ｬ譌･縺ｮ辟｡譁吶メ繝｣繝?繝亥屓謨ｰ?ｼ?5蝗橸ｼ峨↓驕斐＠縺ｾ縺励◆縲ゆｼ壼藤逋ｻ骭ｲ縺吶ｋ縺ｨ辟｡蛻ｶ髯舌〒縺泌茜逕ｨ縺?縺溘□縺代∪縺吶??')
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
            '縺吶∩縺ｾ縺帙ｓ縲，laude縺ｸ縺ｮ謗･邯壹↓螟ｱ謨励＠縺ｾ縺励◆縲ゅお繝ｩ繝ｼ蜀?螳ｹ繧堤｢ｺ隱阪＠縺ｦ蜀榊ｺｦ縺願ｩｦ縺励￥縺?縺輔＞縲?',
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
          '縺薙ｓ縺ｫ縺｡縺ｯ縲ゆｸ榊虚逕｣縺ｮ縺皮嶌隲?縺九ｉ蜀?隕九?ｮ繧ｳ繝?縺ｾ縺ｧ荳?邱偵↓謨ｴ逅?縺励∪縺吶?ゅ∪縺壹?ｯ縲後お繝ｪ繧｢縲阪?御ｺ育ｮ励?阪?悟?･螻?/雉ｼ蜈･縺ｮ蟶梧悍譎よ悄縲阪ｒ謨吶∴縺ｦ縺上□縺輔＞縲?',
      },
    ])
  }

  /* ---- 螢ｲ荳ｻ譟ｻ螳? ---- */
  const [sell, setSell] = useState(initialSell)
  const [sellSubmitting, setSellSubmitting] = useState(false)
  const [sellSubmitError, setSellSubmitError] = useState('')

  /* ---- 繧ｪ繝ｼ繝翫?ｼ ---- */
  const [ownerService, setOwnerService] = useState(null)
  const [ownerForm, setOwnerForm] = useState(() => initialOwnerForm())
  const [ownerSubmitting, setOwnerSubmitting] = useState(false)
  const [ownerSubmitError, setOwnerSubmitError] = useState('')

  const ownerTitle = useMemo(() => {
    if (ownerService === 'manage') return '邂｡逅?蟋碑ｨ励?ｮ縺皮嶌隲?'
    if (ownerService === 'occupancy') return '遞ｼ蜒咲紫繧｢繝?繝励?ｮ縺皮嶌隲?'
    if (ownerService === 'sell') return '繧ｪ繝ｼ繝翫?ｼ蜷代¢螢ｲ蜊ｴ譟ｻ螳?'
    return ''
  }, [ownerService])

  /* ---- 蟆る摩螳ｶ邏ｹ莉? ---- */
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
      setExpert((e) => ({ ...e, aiError: '蟆る摩螳ｶ縺ｮ遞ｮ鬘槭→逶ｸ隲?蜀?螳ｹ繧貞?･蜉帙＠縺ｦ縺上□縺輔＞縲?' }))
      return
    }
    setExpert((e) => ({ ...e, aiLoading: true, aiError: '', aiAdvice: '' }))
    const labels = EXPERT_TYPES.filter((t) => expert.types.includes(t.id))
      .map((t) => t.label)
      .join('縲?')
    const userText = `蟶梧悍縺吶ｋ蟆る摩螳ｶ: ${labels}\n繧ｨ繝ｪ繧｢繝ｻ迥ｶ豕?: ${expert.region}\n逶ｸ隲?蜀?螳ｹ:\n${expert.detail}`
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
      setSellSubmitError('騾∽ｿ｡縺ｫ螟ｱ謨励＠縺ｾ縺励◆縲ゅｂ縺?荳?蠎ｦ縺願ｩｦ縺励￥縺?縺輔＞縲?')
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
      setOwnerSubmitError('騾∽ｿ｡縺ｫ螟ｱ謨励＠縺ｾ縺励◆縲ゅｂ縺?荳?蠎ｦ縺願ｩｦ縺励￥縺?縺輔＞縲?')
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
        .join('縲?')

      const situationText = expert.detail.trim() +
        (expert.notes.trim() ? `\n\n蛯呵??: ${expert.notes.trim()}` : '')

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
      setExpertSubmitError('騾∽ｿ｡縺ｫ螟ｱ謨励＠縺ｾ縺励◆縲ゅｂ縺?荳?蠎ｦ縺願ｩｦ縺励￥縺?縺輔＞縲?')
    } finally {
      setExpertSubmitting(false)
    }
  }

  /* ---- 繧ｳ繝溘Η繝九ユ繧｣ ---- */
  const [posts, setPosts] = useState(() => loadCommunity())
  const [communityDraft, setCommunityDraft] = useState({
    title: '',
    body: '',
    author: '',
    lossAmount: '',
    category: 'other',
  })
  const [expandedPost, setExpandedPost] = useState(null)
  const [commentDrafts, setCommentDrafts] = useState({})
  const [aiLoadingPostId, setAiLoadingPostId] = useState(null)
  const [rankSort, setRankSort] = useState('empathy')

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
      author: communityDraft.author.trim() || '蛹ｿ蜷?',
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
              author: '繝ｦ繝ｼ繧ｶ繝ｼ',
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
      const userText = `繧ｿ繧､繝医Ν: ${post.title}\n譛ｬ譁?:\n${post.body}`
      const text = await callClaudeUserMessage(model, COMMUNITY_AI_SYSTEM, userText, 600)
      setPosts((list) =>
        list.map((p) => (p.id === post.id ? { ...p, aiComment: text } : p)),
      )
    } catch {
      setPosts((list) =>
        list.map((p) =>
          p.id === post.id
            ? { ...p, aiComment: 'AI繧ｳ繝｡繝ｳ繝医?ｮ逕滓?舌↓螟ｱ謨励＠縺ｾ縺励◆縲ゅｂ縺?荳?蠎ｦ縺願ｩｦ縺励￥縺?縺輔＞縲?' }
            : p,
        ),
      )
    } finally {
      setAiLoadingPostId(null)
    }
  }

  /* ---- 蜈ｱ騾?: 蜈･蜉? ---- */
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
          max-width: 100%;
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
          overflow: visible;
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
          overflow: visible;
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

        /* 繝√Ε繝?繝? */
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
            align-items: flex-end;
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

        /* 繧ｪ繝ｼ繝翫?ｼ 繝｡繝九Η繝ｼ繧ｫ繝ｼ繝? */
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

        /* 蟆る摩螳ｶ繝√ぉ繝?繧ｯ */
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

        /* 繧ｳ繝溘Η繝九ユ繧｣ */
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
        {tab !== 'properties' && (<header className="ha-header">
          <div className="ha-brand">
            <div className="ha-logo" aria-hidden="true">
              H
            </div>
            <div>
              <strong>荳榊虚逕｣AI繧ｳ繝ｳ繧ｷ繧ｧ繝ｫ繧ｸ繝･</strong>
              <span>荳榊虚逕｣縺ｮ縺頑か縺ｿ繝ｻ譟ｻ螳壹?ｻ蟆る摩螳ｶ邏ｹ莉九?ｻ繧ｳ繝溘Η繝九ユ繧｣</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {user ? (
              <button
                type="button"
                onClick={() => setTab('member')}
                style={{ background: 'rgba(201,168,76,0.15)', border: '1.5px solid #c9a84c', borderRadius: 20, padding: '5px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, color: '#c9a84c', fontSize: 12, fontWeight: 700, fontFamily: 'inherit' }}
              >
                <span style={{ fontSize: 16 }}>?汨､</span>
                <span style={{ maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.user_metadata?.name || user.email?.split('@')[0] || '繝槭う繝壹?ｼ繧ｸ'}
                </span>
              </button>
            ) : (
              <button
                type="button"
                className="ha-btn"
                style={{ whiteSpace: 'nowrap', background: 'var(--accent)', color: '#fff', border: 'none', fontSize: 12, padding: '7px 14px' }}
                onClick={() => setTab('member')}
              >
                莨壼藤逋ｻ骭ｲ / 繝ｭ繧ｰ繧､繝ｳ
              </button>
            )}
            {/* 繝上Φ繝舌?ｼ繧ｬ繝ｼ繝｡繝九Η繝ｼ */}
            <div className='ha-menu-wrapper' style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setMenuOpen(!menuOpen)}
                style={{
                  background: 'transparent',
                  border: '1.5px solid var(--accent)',
                  borderRadius: 8,
                  padding: '7px 10px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {menuOpen ? (
                  <span style={{ fontSize: 16, lineHeight: 1, color: 'var(--accent)', fontWeight: 700 }}>笨?</span>
                ) : (
                  <>
                    <div style={{ width: 20, height: 2, background: 'var(--accent)', borderRadius: 2 }} />
                    <div style={{ width: 20, height: 2, background: 'var(--accent)', borderRadius: 2 }} />
                    <div style={{ width: 20, height: 2, background: 'var(--accent)', borderRadius: 2 }} />
                  </>
                )}
              </button>
              {menuOpen && (
                <div style={{
                  position: 'fixed',
                  top: 60,
                  right: 12,
                  background: '#1a3a5c',
                  borderRadius: 14,
                  padding: '12px 8px',
                  zIndex: 9999,
                  minWidth: 200,
                  maxHeight: '70vh',
                  overflowY: 'auto',
                  boxShadow: '0 8px 32px rgba(26,58,92,0.25)',
                }}>
                  {[
                    { id: 'properties', label: '?沛? 迚ｩ莉ｶ諠?蝣ｱ' },
                    { id: 'vendors',    label: '?汨ｷ 讌ｭ閠?荳?隕ｧ' },
                    { id: 'chat',       label: '?汳ｬ AI繝√Ε繝?繝?' },
                    { id: 'sell',       label: '?沛ｷ?ｸ? 螢ｲ蜊ｴ譟ｻ螳?' },
                    { id: 'owner',      label: '?沛｢ 雉?雋ｸ邨悟霧閠?讒伜髄縺?' },
                    { id: 'expert',     label: '?汨? 蟆る摩螳ｶ邏ｹ莉?' },
                    { id: 'community',  label: '?沛假ｸ? 繧ｳ繝溘Η繝九ユ繧｣' },
                    { id: 'agency',     label: '?沛暦ｸ? 讌ｭ閠?讒伜髄縺?' },
                    { id: 'column',     label: '?汳ｰ 縺雁ｾ玲ュ蝣ｱ' },
                    { id: 'drill',      label: '?沒? 謚戊ｳ?繝峨Μ繝ｫ' },
                    { id: 'simulator',  label: '?洫ｮ 謚戊ｳ?繧ｷ繝溘Η繝ｬ繝ｼ繧ｿ繝ｼ' },
                    { id: 'member',     label: '?汨､ 莨壼藤蟆ら畑' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => { setTab(item.id); setMenuOpen(false); }}
                      style={{
                        display: 'block',
                        width: '100%',
                        background: tab === item.id ? 'rgba(255,255,255,0.15)' : 'transparent',
                        border: 'none',
                        borderRadius: 8,
                        padding: '10px 14px',
                        color: '#fff',
                        fontSize: 13,
                        fontWeight: tab === item.id ? 700 : 400,
                        cursor: 'pointer',
                        textAlign: 'left',
                        fontFamily: 'inherit',
                      }}
                    >
                      {item.label}
                    </button>
                  ))}
                  {user && (
                    <button
                      type="button"
                      onClick={async () => {
                        await supabase.auth.signOut()
                        setUser(null)
                        window.__houseAiUser = null
                        setMenuOpen(false)
                      }}
                      style={{ display: "block", width: "100%", background: "transparent", border: "none", borderTop: "1px solid rgba(255,255,255,0.15)", padding: "10px 14px", color: "#ff8080", fontSize: 13, fontWeight: 700, cursor: "pointer", textAlign: "left", fontFamily: "inherit", marginTop: 4 }}
                    >
                      ?泅ｪ 繝ｭ繧ｰ繧｢繧ｦ繝?
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>)}
        {tab !== 'properties' && <TickerBanner />}



        <main className="ha-main">
          {tab === 'properties' && (
            <div className="ha-panel" style={{ padding: 0 }}>
              <PropertiesPage user={user} onNavigate={(view) => setTab(view)} />
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
                    ?汳ｬ AI繝√Ε繝?繝?
                  </h2>
                  <p className="ha-sectionDesc" style={{ margin: 0 }}>
                    荳榊虚逕｣繧ｳ繝ｳ繧ｷ繧ｧ繝ｫ繧ｸ繝･縺梧擅莉ｶ謨ｴ逅?縺ｨ谺｡縺ｮ荳?豁ｩ繧偵し繝昴?ｼ繝医＠縺ｾ縺吶??
                  </p>
                </div>
				{/* chat_nav_buttons_v3 */}
				<div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
					<button type="button" onClick={() => setTab('properties')}
						style={{ padding: '5px 10px', background: '#1a3a5c', color: '#fff', border: 'none', borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
						?沛? 迚ｩ莉ｶ諠?蝣ｱ
					</button>
					<button type="button" onClick={() => setTab('vendors')}
						style={{ padding: '5px 10px', background: '#c9a84c', color: '#fff', border: 'none', borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
						?汨ｷ 讌ｭ閠?荳?隕ｧ繝ｻ豈碑ｼ?
					</button>
					<button type="button" className="ha-btn ha-btnGhost" onClick={handleResetChat} disabled={isSending}>
						譁ｰ隕上メ繝｣繝?繝?
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
                      <div className="ha-meta">{m.role === 'user' ? '縺ゅ↑縺?' : '繧ｳ繝ｳ繧ｷ繧ｧ繝ｫ繧ｸ繝･'}</div>
                      <div className="ha-bubbleText">{m.text.replace(/\*\*/g, "").replace(/\*/g, "").replace(/^#+\s/gm, "").replace(/^-\s/gm, "繝ｻ")}</div>
                    </div>
                  </div>
                ))}
                {isSending ? (
                  <div className="ha-msgRow assistant">
                    <div className="ha-bubble">
                      <div className="ha-meta">繧ｳ繝ｳ繧ｷ繧ｧ繝ｫ繧ｸ繝･</div>
                      <div className="ha-bubbleText">
                        霑比ｿ｡繧堤函謌蝉ｸｭ
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
                    placeholder="繧ｨ繝ｪ繧｢縲∽ｺ育ｮ励?∝ｸ梧悍譚｡莉ｶ縺ｪ縺ｩ?ｼ?Enter縺ｧ騾∽ｿ｡ / Shift+Enter縺ｧ謾ｹ陦鯉ｼ?"
                    disabled={isSending}
                    onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && chatInput.endsWith('\n')) {
                        e.preventDefault()
                        handleSend()
                      }
                    }}
                  style={{ minHeight: '80px', flex: 1, resize: 'none' }} />
                  <div className="ha-composerActions">
                    <button type="submit" className="ha-btn" disabled={isSending}>
                      騾∽ｿ｡
                    </button>
                    <button
                      type="button"
                      className="ha-btn ha-btnGhost"
                      onClick={() =>
                        setInput('譚ｱ莠ｬ23蛹ｺ蜀?縺ｧ縲?30縲?50緕｡縲∝ｮｶ雉?縺ｯ譛?25荳?蜀?莉･蜀?縲る?壼共縺ｯ30蛻?莉･蜀?縺檎炊諠ｳ縺ｧ縺吶??')
                      }
                      disabled={isSending}
                    >
                      萓区枚
                    </button>
                  </div>
                </div>

              </form>
            </div>
          )}

          {tab === 'sell' && (
            <div className="ha-panel">
              <h2 className="ha-sectionTitle">?沛ｷ?ｸ? 螢ｲ蜊ｴ譟ｻ螳?</h2>
              <p className="ha-sectionDesc">
                螢ｲ蜊ｴ譟ｻ螳壹?ｮ縺比ｾ晞?ｼ繧?2繧ｹ繝?繝?繝励〒蜿励¢莉倥¢縺ｾ縺吶?よ球蠖楢??繧医ｊ謚倥ｊ霑斐＠縺秘?｣邨｡縺?縺溘＠縺ｾ縺吶??
              </p>

              {sell.step === 'done' ? (
                <div className="ha-done">
                  <h3>騾∽ｿ｡縺励∪縺励◆?ｼ?</h3>
                  <p>
                    譟ｻ螳壻ｾ晞?ｼ繧貞女縺台ｻ倥¢縺ｾ縺励◆縲よ球蠖薙ｈ繧翫＃騾｣邨｡縺励∪縺吶??
                  </p>
                  <button
                    type="button"
                    className="ha-btn"
                    onClick={() => {
                      setSellSubmitError('')
                      setSell({ ...initialSell, step: 1 })
                    }}
                  >
                    譁ｰ縺励＞萓晞?ｼ繧貞?･蜉?
                  </button>
                </div>
              ) : (
                <>
                  <div className="ha-stepBadge">
                    繧ｹ繝?繝?繝? {sell.step} / 2 窶? {sell.step === 1 ? '迚ｩ莉ｶ諠?蝣ｱ' : '縺秘?｣邨｡蜈医?ｻ蛯呵??'}
                  </div>

                  {sell.step === 1 && (
                    <>
                      <div className="ha-row">
                        <label className={labelClass}>迚ｩ莉ｶ遞ｮ蛻･</label>
                        <select
                          className={fieldClass}
                          value={sell.propertyType}
                          onChange={(e) => setSell((s) => ({ ...s, propertyType: e.target.value }))}
                        >
                          <option value="">驕ｸ謚槭＠縺ｦ縺上□縺輔＞</option>
                          {PROPERTY_TYPES.map((p) => (
                            <option key={p} value={p}>
                              {p}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="ha-row">
                        <label className={labelClass}>驛ｵ萓ｿ逡ｪ蜿ｷ?ｼ郁?ｪ蜍募?･蜉幢ｼ?</label>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <input
                            className={fieldClass}
                            value={sell.zip || ''}
                            onChange={(e) => setSell((s) => ({ ...s, zip: e.target.value }))}
                            placeholder="萓具ｼ?3300803"
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
                            菴乗園繧呈､懃ｴ｢
                          </button>
                        </div>
                      </div>
                      <div className="ha-row">
                        <label className={labelClass}>菴乗園?ｼ亥ｸょ玄逕ｺ譚代?ｻ逡ｪ蝨ｰ縺ｾ縺ｧ?ｼ?</label>
                        <input
                          className={fieldClass}
                          value={sell.address}
                          onChange={(e) => setSell((s) => ({ ...s, address: e.target.value }))}
                          placeholder="萓具ｼ壽擲莠ｬ驛ｽ縲?縲?蛹ｺ..."
                          autoComplete="street-address"
                        />
                      </div>
                      <div className="ha-grid2">
                        <div className="ha-row" style={{ marginBottom: 0 }}>
                          <label className={labelClass}>蟆よ怏髱｢遨搾ｼ医治?ｼ?</label>
                          <input
                            className={fieldClass}
                            value={sell.area}
                            onChange={(e) => setSell((s) => ({ ...s, area: e.target.value }))}
                            inputMode="decimal"
                            placeholder="萓具ｼ?65.2"
                          />
                        </div>
                        <div className="ha-row" style={{ marginBottom: 0 }}>
                          <label className={labelClass}>遽牙ｹｴ謨ｰ?ｼ亥ｹｴ?ｼ?</label>
                          <input
                            className={fieldClass}
                            value={sell.builtYear}
                            onChange={(e) => setSell((s) => ({ ...s, builtYear: e.target.value }))}
                            inputMode="numeric"
                            placeholder="萓具ｼ?12"
                          />
                        </div>
                      </div>
                      <div className="ha-row">
                        <label className={labelClass}>髢灘叙繧?</label>
                        <select
                          className={fieldClass}
                          value={sell.layout}
                          onChange={(e) => setSell((s) => ({ ...s, layout: e.target.value }))}
                        >
                          <option value="">驕ｸ謚槭＠縺ｦ縺上□縺輔＞</option>
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
                          谺｡縺ｸ?ｼ磯?｣邨｡蜈亥?･蜉幢ｼ?
                        </button>
                      </div>
                    </>
                  )}

                  {sell.step === 2 && (
                    <>
                      <div className="ha-grid2">
                        <div className="ha-row" style={{ marginBottom: 0 }}>
                          <label className={labelClass}>縺雁錐蜑?</label>
                          <input
                            className={fieldClass}
                            value={sell.name}
                            onChange={(e) => setSell((s) => ({ ...s, name: e.target.value }))}
                            autoComplete="name"
                          />
                        </div>
                        <div className="ha-row" style={{ marginBottom: 0 }}>
                          <label className={labelClass}>髮ｻ隧ｱ逡ｪ蜿ｷ</label>
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
                        <label className={labelClass}>繝｡繝ｼ繝ｫ繧｢繝峨Ξ繧ｹ</label>
                        <input
                          className={fieldClass}
                          type="email"
                          value={sell.email}
                          onChange={(e) => setSell((s) => ({ ...s, email: e.target.value }))}
                          autoComplete="email"
                        />
                      </div>
                      <div className="ha-row">
                        <label className={labelClass}>蟶梧悍繝ｻ蛯呵??</label>
                        <textarea
                          className={fieldClass}
                          value={sell.notes}
                          onChange={(e) => setSell((s) => ({ ...s, notes: e.target.value }))}
                          placeholder="螢ｲ蜊ｴ譎よ悄縺ｮ蟶梧悍縲∝??隕ｧ縺ｮ蜿ｯ蜷ｦ縺ｪ縺ｩ"
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
                          謌ｻ繧?
                        </button>
                        <button
                          type="button"
                          className="ha-btn"
                          disabled={sellSubmitting}
                          onClick={submitValuation}
                        >
                          {sellSubmitting ? '騾∽ｿ｡荳ｭ窶ｦ' : '騾∽ｿ｡縺吶ｋ'}
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
              <h2 className="ha-sectionTitle">?沛｢ 繧｢繝代?ｼ繝郁ｳ?雋ｸ邨悟霧閠?讒伜髄縺?</h2>
              <p className="ha-sectionDesc">
                邂｡逅?蟋碑ｨ励?ｻ遞ｼ蜒咲紫謾ｹ蝟?繝ｻ螢ｲ蜊ｴ譟ｻ螳壹?ｮ縺皮嶌隲?繝｡繝九Η繝ｼ縺ｧ縺吶?ょ推繝｡繝九Η繝ｼ縺ｯ2繧ｹ繝?繝?繝励?ｮ繝輔か繝ｼ繝?蠕後↓騾∽ｿ｡螳御ｺ?縺ｸ騾ｲ縺ｿ縺ｾ縺吶??
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
                    <h4>邂｡逅?蟋碑ｨ?</h4>
                    <p>雉?雋ｸ邂｡逅?縺ｮ蟋碑ｨ玲擅莉ｶ繧?蛻?譖ｿ縺ｮ繧ｿ繧､繝溘Φ繧ｰ縲∬ｦ狗ｩ肴ｯ碑ｼ?縺ｮ隕ｳ轤ｹ繧呈紛逅?縺励∪縺吶??</p>
                  </button>
                  <button
                    type="button"
                    className="ha-card"
                    onClick={() => {
                      setOwnerService('occupancy')
                      setOwnerForm({ ...initialOwnerForm(), step: 1 })
                    }}
                  >
                    <h4>遞ｼ蜒咲紫繧｢繝?繝?</h4>
                    <p>遨ｺ螳､蟇ｾ遲悶?ｻ螳ｶ雉?險ｭ螳壹?ｻ繝ｪ繝輔か繝ｼ繝?縺ｮ蜆ｪ蜈亥ｺｦ縺ｪ縺ｩ縲∝庶逶頑隼蝟?縺ｮ謇薙■謇九ｒ讀懆ｨ弱＠縺ｾ縺吶??</p>
                  </button>
                  <button
                    type="button"
                    className="ha-card"
                    onClick={() => {
                      setOwnerService('sell')
                      setOwnerForm({ ...initialOwnerForm(), step: 1 })
                    }}
                  >
                    <h4>螢ｲ蜊ｴ譟ｻ螳夲ｼ医が繝ｼ繝翫?ｼ?ｼ?</h4>
                    <p>荳?譽溘い繝代?ｼ繝医?ｮ螢ｲ蜊ｴ縺ｫ蜷代¢縺滓ュ蝣ｱ謨ｴ逅?縺ｨ谺｡縺ｮ繧ｹ繝?繝?繝励ｒ縺ｾ縺ｨ繧√∪縺吶??</p>
                  </button>
                </div>
              )}

              {ownerService && ownerForm.step === 'done' && (
                <div className="ha-done">
                  <h3>騾∽ｿ｡縺励∪縺励◆?ｼ?</h3>
                  <p>
                    縲鶏ownerTitle}縲阪?ｮ萓晞?ｼ繧貞女縺台ｻ倥¢縺ｾ縺励◆縲よ球蠖薙ｈ繧翫＃騾｣邨｡縺励∪縺吶??
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
                    繝｡繝九Η繝ｼ縺ｫ謌ｻ繧?
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
                      竊? 繝｡繝九Η繝ｼ縺ｫ謌ｻ繧?
                    </button>
                  </div>
                  <h3 style={{ margin: '0 0 8px', fontSize: 16, color: 'var(--accent)' }}>{ownerTitle}</h3>
                  <div className="ha-stepBadge">
                    繧ｹ繝?繝?繝? {ownerForm.step} / 2 窶? {ownerForm.step === 1 ? '迚ｩ莉ｶ繝ｻ讎りｦ?' : '縺秘?｣邨｡蜈医?ｻ隧ｳ邏ｰ'}
                  </div>

                  {ownerForm.step === 1 && (
                    <>
                      <div className="ha-row">
                        <label className={labelClass}>迚ｩ莉ｶ遞ｮ蛻･</label>
                        <select
                          className={fieldClass}
                          value={ownerForm.propertyType}
                          onChange={(e) => setOwnerForm((o) => ({ ...o, propertyType: e.target.value }))}
                        >
                          <option value="">驕ｸ謚?</option>
                          <option value="譛ｨ騾?繧｢繝代?ｼ繝?">譛ｨ騾?繧｢繝代?ｼ繝?</option>
                          <option value="RC荳?譽?">RC荳?譽?</option>
                          <option value="縺昴?ｮ莉?">縺昴?ｮ莉?</option>
                        </select>
                      </div>
                      <div className="ha-row">
                        <label className={labelClass}>謌ｸ謨ｰ / 螳､謨ｰ</label>
                        <input
                          className={fieldClass}
                          value={ownerForm.units}
                          onChange={(e) => setOwnerForm((o) => ({ ...o, units: e.target.value }))}
                          placeholder="萓具ｼ?8謌ｸ"
                        />
                      </div>
                      <div className="ha-row">
                        <label className={labelClass}>謇?蝨ｨ蝨ｰ</label>
                        <input
                          className={fieldClass}
                          value={ownerForm.address}
                          onChange={(e) => setOwnerForm((o) => ({ ...o, address: e.target.value }))}
                          placeholder="蟶ょ玄逕ｺ譚代∪縺ｧ縺ｧ蜿ｯ"
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
                          谺｡縺ｸ
                        </button>
                      </div>
                    </>
                  )}

                  {ownerForm.step === 2 && (
                    <>
                      <div className="ha-grid2">
                        <div className="ha-row" style={{ marginBottom: 0 }}>
                          <label className={labelClass}>縺雁錐蜑?</label>
                          <input
                            className={fieldClass}
                            value={ownerForm.name}
                            onChange={(e) => setOwnerForm((o) => ({ ...o, name: e.target.value }))}
                          />
                        </div>
                        <div className="ha-row" style={{ marginBottom: 0 }}>
                          <label className={labelClass}>髮ｻ隧ｱ逡ｪ蜿ｷ</label>
                          <input
                            className={fieldClass}
                            value={ownerForm.phone}
                            onChange={(e) => setOwnerForm((o) => ({ ...o, phone: e.target.value }))}
                            inputMode="tel"
                          />
                        </div>
                      </div>
                      <div className="ha-row">
                        <label className={labelClass}>繝｡繝ｼ繝ｫ繧｢繝峨Ξ繧ｹ</label>
                        <input
                          className={fieldClass}
                          type="email"
                          value={ownerForm.email}
                          onChange={(e) => setOwnerForm((o) => ({ ...o, email: e.target.value }))}
                        />
                      </div>
                      <div className="ha-row">
                        <label className={labelClass}>縺皮嶌隲?蜀?螳ｹ繝ｻ蛯呵??</label>
                        <textarea
                          className={fieldClass}
                          value={ownerForm.notes}
                          onChange={(e) => setOwnerForm((o) => ({ ...o, notes: e.target.value }))}
                          placeholder={
                            ownerService === 'manage'
                              ? '邂｡逅?莨夂､ｾ縺ｮ蛻?譖ｿ讀懆ｨ弱?∝ｧ碑ｨ苓ｲｻ縺ｮ蟶梧悍縺ｪ縺ｩ'
                              : ownerService === 'occupancy'
                                ? '遨ｺ螳､譛滄俣縲∝ｮｶ雉?縲√Μ繝輔か繝ｼ繝?螻･豁ｴ縺ｪ縺ｩ'
                                : '螢ｲ蜊ｴ逅?逕ｱ縲∝ｸ梧悍譎よ悄縲√Ο繝ｼ繝ｳ谿句し縺ｮ譛臥┌縺ｪ縺ｩ'
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
                          謌ｻ繧?
                        </button>
                        <button
                          type="button"
                          className="ha-btn"
                          disabled={ownerSubmitting}
                          onClick={submitOwnerRequest}
                        >
                          {ownerSubmitting ? '騾∽ｿ｡荳ｭ窶ｦ' : '騾∽ｿ｡縺吶ｋ'}
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
              <h2 className="ha-sectionTitle">?汨? 蟆る摩螳ｶ邏ｹ莉?</h2>
              <p className="ha-sectionDesc">
                縺ゅ↑縺溘↓蜷医▲縺溷推蟆る摩螳ｶ繧偵＃邏ｹ莉九＞縺溘＠縺ｾ縺吶?ら嶌隲?譁吶?ｻ縺願ｦ狗ｩ阪ｊ縺ｯ辟｡譁吶〒縺吶?らｴｹ莉区侭縺ｪ縺ｩ繧ゆｸ?蛻?逋ｺ逕溘＞縺溘＠縺ｾ縺帙ｓ縲よ擅莉ｶ縺ｫ蜷医∴縺ｰ謌千ｴ?縺ｨ縺ｪ繧翫∪縺吶?ゅ＃螳牙ｿ?縺励※縺雁撫縺?蜷医ｏ縺帙￥縺?縺輔＞縲?
              </p>

              {expert.step === 'done' ? (
                <div className="ha-done">
                  <h3>騾∽ｿ｡縺励∪縺励◆?ｼ?</h3>
                  <p>蟆る摩螳ｶ邏ｹ莉九?ｮ縺比ｾ晞?ｼ繧貞女縺台ｻ倥¢縺ｾ縺励◆縲よ球蠖薙ｈ繧翫＃騾｣邨｡縺励∪縺吶??</p>
                  <button
                    type="button"
                    className="ha-btn"
                    onClick={() => {
                      setExpertSubmitError('')
                      setExpert({ ...initialExpert, step: 1 })
                    }}
                  >
                    譁ｰ隕丞?･蜉?
                  </button>
                </div>
              ) : (
                <>
                  <div className="ha-stepBadge">
                    繧ｹ繝?繝?繝? {expert.step} / 2 窶? {expert.step === 1 ? '逶ｸ隲?蜀?螳ｹ' : '騾｣邨｡蜈医?ｻ騾∽ｿ｡'}
                  </div>

                  {expert.step === 1 && (
                    <>
                      <div className="ha-row">
                        <span className={labelClass}>邏ｹ莉九ｒ蟶梧悍縺吶ｋ蟆る摩螳ｶ?ｼ郁､?謨ｰ蜿ｯ?ｼ?</span>
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
                        <label className={labelClass}>繧ｨ繝ｪ繧｢繝ｻ迚ｩ莉ｶ縺ｮ讎りｦ?</label>
                        <input
                          className={fieldClass}
                          value={expert.region}
                          onChange={(e) => setExpert((x) => ({ ...x, region: e.target.value }))}
                          placeholder="萓具ｼ夐未譚ｱ / 荳ｭ蜿､繝槭Φ繧ｷ繝ｧ繝ｳ雉ｼ蜈･莠亥ｮ?"
                        />
                      </div>
                      <div className="ha-row">
                        <label className={labelClass}>逶ｸ隲?縺励◆縺?縺薙→</label>
                        <textarea
                          className={fieldClass}
                          value={expert.detail}
                          onChange={(e) => setExpert((x) => ({ ...x, detail: e.target.value }))}
                          placeholder="迥ｶ豕√ｄ隱ｲ鬘後ｒ蜈ｷ菴鍋噪縺ｫ縺碑ｨ伜?･縺上□縺輔＞縲?"
                        />
                      </div>
                      <div className="ha-actions">
                        <button
                          type="button"
                          className="ha-btn"
                          disabled={expert.aiLoading}
                          onClick={generateExpertAdvice}
                        >
                          {expert.aiLoading ? 'AI逕滓?蝉ｸｭ窶ｦ' : 'AI繧｢繝峨ヰ繧､繧ｹ繧堤函謌?'}
                        </button>
                        <button
                          type="button"
                          className="ha-btn ha-btnGhost"
                          onClick={() => {
                            if (!expert.types.length || !expert.detail.trim()) return
                            setExpert((x) => ({ ...x, step: 2 }))
                          }}
                        >
                          谺｡縺ｸ?ｼ磯?｣邨｡蜈茨ｼ?
                        </button>
                      </div>
                      {expert.aiError ? <div className="ha-error">{expert.aiError}</div> : null}
                      {expert.aiAdvice ? (
                        <div>
                          <div className={labelClass} style={{ marginTop: 16 }}>
                            AI繧｢繝峨ヰ繧､繧ｹ?ｼ亥盾閠??ｼ?
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
                        <p className="ha-sectionDesc">繧ｹ繝?繝?繝?1縺ｧ逕滓?舌＠縺蘗I繧｢繝峨ヰ繧､繧ｹ縺後％縺薙↓陦ｨ遉ｺ縺輔ｌ縺ｾ縺吶??</p>
                      )}
                      <div className="ha-grid2">
                        <div className="ha-row" style={{ marginBottom: 0 }}>
                          <label className={labelClass}>縺雁錐蜑?</label>
                          <input
                            className={fieldClass}
                            value={expert.name}
                            onChange={(e) => setExpert((x) => ({ ...x, name: e.target.value }))}
                          />
                        </div>
                        <div className="ha-row" style={{ marginBottom: 0 }}>
                          <label className={labelClass}>髮ｻ隧ｱ逡ｪ蜿ｷ</label>
                          <input
                            className={fieldClass}
                            value={expert.phone}
                            onChange={(e) => setExpert((x) => ({ ...x, phone: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div className="ha-row">
                        <label className={labelClass}>繝｡繝ｼ繝ｫ繧｢繝峨Ξ繧ｹ</label>
                        <input
                          className={fieldClass}
                          type="email"
                          value={expert.email}
                          onChange={(e) => setExpert((x) => ({ ...x, email: e.target.value }))}
                        />
                      </div>
                      <div className="ha-row">
                        <label className={labelClass}>蛯呵??</label>
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
                          謌ｻ繧?
                        </button>
                        <button
                          type="button"
                          className="ha-btn"
                          disabled={expertSubmitting}
                          onClick={submitExpertRequest}
                        >
                          {expertSubmitting ? '騾∽ｿ｡荳ｭ窶ｦ' : '騾∽ｿ｡縺吶ｋ'}
                        </button>
                      </div>
                    </>
                  )}
            </div>
          )}

          {tab === 'member' && (
          <div className="auth-overlay">
            <div className="auth-modal">
              <PremiumUpgradeBanner user={user} isPremium={isPremium} />
              <AuthPanel />
            </div>
        )}
          </div>

          {tab === 'agency' && (
            <div className="ha-panel" style={{ padding: 0 }}>
              {!agencyType && (
                <div style={{ padding: '40px 24px' }}>
                  <h2 style={{ color: '#1a3a5c', fontSize: 20, fontWeight: 700, textAlign: 'center', marginBottom: 8 }}>?沛暦ｸ? 讌ｭ閠?讒伜髄縺代し繝ｼ繝薙せ</h2>
                  <p style={{ color: '#666', fontSize: 14, textAlign: 'center', marginBottom: 32 }}>縺泌茜逕ｨ逕ｨ騾斐ｒ縺企∈縺ｳ縺上□縺輔＞</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 560, margin: '0 auto' }}>
                    <div style={{ border: '2px solid #1a3a5c', borderRadius: 16, padding: '28px 24px', cursor: 'pointer', background: '#fff' }}
                      onClick={() => window.location.href = '/agency'}>
                      <div style={{ fontSize: 32, marginBottom: 10 }}>?沛?</div>
                      <div style={{ color: '#1a3a5c', fontSize: 18, fontWeight: 700, marginBottom: 8 }}>荳榊虚逕｣讌ｭ閠?讒?</div>
                      <div style={{ color: '#555', fontSize: 13, lineHeight: 1.7, marginBottom: 16 }}>
                        迚ｩ莉ｶ縺ｮ逋ｻ骭ｲ繝ｻ謗ｲ霈峨?ｻ邂｡逅?縺後〒縺阪∪縺吶?ょｰら畑繝?繝?繧ｷ繝･繝懊?ｼ繝峨↓縺ｦ迚ｩ莉ｶ諠?蝣ｱ繧偵＃逋ｻ骭ｲ縺?縺溘□縺代∪縺吶??
                      </div>
                      <div style={{ display: 'inline-block', padding: '10px 24px', background: '#1a3a5c', color: '#fff', borderRadius: 10, fontWeight: 700, fontSize: 14 }}>
                        莨壼藤逋ｻ骭ｲ縺ｯ縺薙■繧? 竊?
                      </div>
                      <div style={{ marginTop: 12, fontSize: 12, color: '#888' }}>
                        縺吶〒縺ｫ逋ｻ骭ｲ貂医∩縺ｮ譁ｹ縺ｯ
                        <a href="/agency" style={{ color: '#1a3a5c', fontWeight: 700, marginLeft: 4 }}>縺薙■繧峨°繧峨Ο繧ｰ繧､繝ｳ 竊?</a>
                      </div>
                    </div>
                    <div style={{ border: '2px solid #c9a84c', borderRadius: 16, padding: '28px 24px', cursor: 'pointer', background: '#fff' }}
                      onClick={() => window.location.href = '/partner'}>
                      <div style={{ fontSize: 32, marginBottom: 10 }}>?沛｢</div>
                      <div style={{ color: '#1a3a5c', fontSize: 18, fontWeight: 700, marginBottom: 8 }}>縺昴?ｮ莉悶?ｮ讌ｭ閠?讒?</div>
                      <div style={{ color: '#555', fontSize: 13, lineHeight: 1.7, marginBottom: 4 }}>
                        繝ｪ繝輔か繝ｼ繝?繝ｻ螟匁ｧ九?ｻ蜿ｸ豕墓嶌螢ｫ繝ｻ遞守炊螢ｫ繝ｻ驥題檮讖滄未縺ｪ縺ｩ縲∝ｽ薙し繧､繝医∈縺ｮ蠎?蜻頑軸霈峨ｒ縺泌ｸ梧悍縺ｮ譁ｹ縺ｯ縺薙■繧峨??
                      </div>
                      <div style={{ color: '#888', fontSize: 12, marginBottom: 16 }}>窶ｻ 蠎?蜻翫?壹?ｼ繧ｸ縺ｯ縺薙■繧峨〒菴懈?舌＠縲∝ｽ薙し繧､繝医↓謗ｲ霈峨＞縺溘＠縺ｾ縺?</div>
                      <div style={{ display: 'inline-block', padding: '10px 24px', background: '#c9a84c', color: '#fff', borderRadius: 10, fontWeight: 700, fontSize: 14 }}>
                        莨壼藤逋ｻ骭ｲ縺ｯ縺薙■繧? 竊?
                      </div>
                      <div style={{ marginTop: 12, fontSize: 12, color: '#888' }}>
                        縺吶〒縺ｫ逋ｻ骭ｲ貂医∩縺ｮ譁ｹ縺ｯ
                        <a href="/agency" style={{ color: '#c9a84c', fontWeight: 700, marginLeft: 4 }}>縺薙■繧峨°繧峨Ο繧ｰ繧､繝ｳ 竊?</a>
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
                        <div style={{ color: '#c9a84c', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>荳榊虚逕｣讌ｭ閠?讒伜髄縺?</div>
                        <div style={{ color: '#fff', fontSize: 16, fontWeight: 700 }}>?沛? 荳榊虚逕｣讌ｭ閠?讒伜ｰら畑繝?繝?繧ｷ繝･繝懊?ｼ繝?</div>
                        <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 4 }}>迚ｩ莉ｶ縺ｮ逋ｻ骭ｲ繝ｻ邂｡逅?繝ｻ蜈ｬ髢玖ｨｭ螳壹′縺ｧ縺阪∪縺?</div>
                      </div>
                      <a href="/agency" style={{ display: 'inline-block', padding: '12px 24px', background: '#f5a623', color: '#1a3a5c', borderRadius: 10, fontWeight: 700, fontSize: 14, textDecoration: 'none', whiteSpace: 'nowrap' }}>
                        繝?繝?繧ｷ繝･繝懊?ｼ繝峨∈ 竊?
                      </a>
                    </div>
                  </div>
                  <div style={{ padding: '12px 24px' }}>
                    <button onClick={() => setAgencyType(null)} style={{ background: 'none', border: 'none', color: '#1a3a5c', fontSize: 13, cursor: 'pointer', textDecoration: 'underline' }}>竊? 驕ｸ謚樒判髱｢縺ｫ謌ｻ繧?</button>
                  </div>
                  <AgencyForm />
                </div>
              )}
              {agencyType === 'other' && (
                <div style={{ padding: '32px 24px' }}>
                  <button onClick={() => setAgencyType(null)} style={{ background: 'none', border: 'none', color: '#1a3a5c', fontSize: 13, cursor: 'pointer', textDecoration: 'underline', marginBottom: 24, display: 'block' }}>竊? 驕ｸ謚樒判髱｢縺ｫ謌ｻ繧?</button>
                  <h2 style={{ color: '#1a3a5c', fontSize: 18, fontWeight: 700, marginBottom: 8 }}>?沛｢ 蠎?蜻頑軸霈峨?ｮ縺顔筏縺苓ｾｼ縺ｿ</h2>
                  <p style={{ color: '#555', fontSize: 13, lineHeight: 1.8, marginBottom: 24 }}>
                    繝ｪ繝輔か繝ｼ繝?繝ｻ螟匁ｧ九?ｻ蜿ｸ豕墓嶌螢ｫ繝ｻ遞守炊螢ｫ繝ｻ驥題檮讖滄未縺ｪ縺ｩ縲∝推讌ｭ遞ｮ縺ｮ讌ｭ閠?讒倥?ｮ蠎?蜻翫ｒ蠖薙し繧､繝医↓謗ｲ霈峨＞縺溘＠縺ｾ縺吶??
                    縺ｾ縺壹?ｯ莨壼藤逋ｻ骭ｲ繧偵♀鬘倥＞縺?縺溘＠縺ｾ縺吶?よ球蠖楢??繧医ｊ縺秘?｣邨｡縺輔○縺ｦ縺?縺溘□縺阪∪縺吶??
                  </p>
                  <AgencyForm />
                </div>
              )}
            </div>
          )}

          {tab === 'column' && (
            <ColumnPage />
          )}

          {tab === 'drill' && (
            <div className="ha-panel" style={{ padding: 0 }}>
              <InvestmentDrill onNavigate={(view) => setTab(view)} />
            </div>
          )}

          {tab === 'simulator' && (
            <div className="ha-panel" style={{ padding: 0 }}>
              <InvestmentSimulator onNavigate={(view) => setTab(view)} />
            </div>
          )}

          {tab === 'legal' && (
            <div className="ha-panel" style={{ padding: 0 }}>
              <LegalPage onNavigate={(view) => setTab(view)} />
            </div>
          )}

          {tab === 'expertlp' && (
            <div className="ha-panel" style={{ padding: 0 }}>
              <ExpertLP onNavigate={(view) => setTab(view)} />
            </div>
          )}

          {tab === 'community' && (
            <div className="ha-panel" style={{ paddingLeft: 16, paddingRight: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                <h2 className="ha-sectionTitle">?沛假ｸ? 繧ｳ繝溘Η繝九ユ繧｣</h2>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <select value={rankSort} onChange={(e) => setRankSort(e.target.value)}
                    style={{ fontSize: 11, padding: '4px 8px', borderRadius: 6, border: '1px solid #ddd', color: '#555', cursor: 'pointer' }}>
                    <option value="empathy">?汳? 蜈ｱ諢滄??</option>
                    <option value="likes">?汨? 縺?縺?縺ｭ鬆?</option>
                    <option value="new">?氣? 譁ｰ逹?鬆?</option>
                  </select>
                  <button type="button" onClick={() => setTab('properties')}
                    style={{ padding: '5px 10px', background: '#1a3a5c', color: '#fff', border: 'none', borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    ?沛? 迚ｩ莉ｶ諠?蝣ｱ
                  </button>
                  <button type="button" onClick={() => setTab('vendors')}
                    style={{ padding: '5px 10px', background: '#c9a84c', color: '#fff', border: 'none', borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    ?汨ｷ 讌ｭ閠?荳?隕ｧ繝ｻ豈碑ｼ?
                  </button>
                </div>
              </div>
              <p className="ha-sectionDesc">
                荳榊虚逕｣縺ｮ菴馴ｨ楢ｫ?繧?謔ｩ縺ｿ繧貞?ｱ譛峨〒縺阪∪縺吶?よ兜遞ｿ蜀?螳ｹ縺ｯ繧ｵ繝ｼ繝薙せ蜈ｨ菴薙〒蜈ｱ譛峨＆繧後∪縺吶??
              </p>

              <div className="ha-postForm">
              {/* 謚慕ｨｿ繝偵Φ繝? */}
              <div style={{ background: '#fffbe6', border: '1px solid #f0d060', borderRadius: 8, padding: '10px 12px', marginBottom: 12, fontSize: 12, color: '#92400e', lineHeight: 1.6 }}>
                ?汳｡ <strong>謚慕ｨｿ繝?繝ｳ繝励Ξ?ｼ?</strong>縲後??縲?縺ｧ蠕梧ｔ縺励∪縺励◆縲阪?後??縲?縺ｧ謳阪＠縺ｾ縺励◆縲榊ｽ｢蠑上′蜈ｱ諢溘ｒ蜻ｼ縺ｳ縺ｾ縺呻ｼ?
              </div>
                <div className="ha-row">
                  <label className={labelClass}>繧ｿ繧､繝医Ν</label>
                  <input
                    className={fieldClass}
                    value={communityDraft.title}
                    onChange={(e) => setCommunityDraft((d) => ({ ...d, title: e.target.value }))}
                  />
                </div>
                <div className="ha-row">
                  <label className={labelClass}>譛ｬ譁?</label>
                  <textarea
                    className={fieldClass}
                    value={communityDraft.body}
                    onChange={(e) => setCommunityDraft((d) => ({ ...d, body: e.target.value }))}
                  />
                </div>
                <div className="ha-row">
                  <label className={labelClass}>縺雁錐蜑搾ｼ井ｻｻ諢擾ｼ?</label>
                  <input
                    className={fieldClass}
                    value={communityDraft.author}
                    onChange={(e) => setCommunityDraft((d) => ({ ...d, author: e.target.value }))}
                    placeholder="遨ｺ谺?縺ｪ繧牙諺蜷?"
                  />
                </div>
              </div>
              <div className="ha-row">
                <label className={labelClass}>?汳ｸ 謳阪＠縺滄?鷹｡搾ｼ井ｻｻ諢擾ｼ?</label>
                <input
                  className={fieldClass}
                  value={communityDraft.lossAmount || ''}
                  onChange={(e) => setCommunityDraft((d) => ({ ...d, lossAmount: e.target.value }))}
                  placeholder="萓具ｼ夂ｴ?100荳?蜀?"
                />
                <button type="button" className="ha-btn" onClick={addPost} style={{ marginTop: 20 }}>
                  謚慕ｨｿ縺吶ｋ
                </button>
              </div>

              {posts.length === 0 ? (
                <p style={{ color: 'var(--muted)', fontSize: 14 }}>縺ｾ縺?謚慕ｨｿ縺後≠繧翫∪縺帙ｓ縲よ怙蛻昴?ｮ菴馴ｨ楢ｫ?繧呈兜遞ｿ縺励※縺ｿ縺ｾ縺励ｇ縺?縲?</p>
              ) : (
                posts.map((post) => (
                  <article key={post.id} className="ha-post" style={{ color: '#1a1a1a' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                      <h4 style={{ margin: 0, flex: 1 }}>{post.title}</h4>
                      {post.lossAmount && (
                        <span style={{ fontSize: 11, fontWeight: 700, background: '#fff5f5', color: '#c0392b', border: '1px solid #ffd5d5', padding: '2px 8px', borderRadius: 10, marginLeft: 8, whiteSpace: 'nowrap' }}>
                          ?汳ｸ {post.lossAmount}
                        </span>
                      )}
                    </div>
                    <div className="ha-postBody">{post.body}</div>
                    <div className="ha-postMeta">
                      {post.author} 繝ｻ {new Date(post.createdAt).toLocaleString('ja-JP')}
                    </div>
                    <div className="ha-reactions">
                      <button
                        type="button"
                        className="ha-reactBtn"
                        data-on={post.likedByMe}
                        onClick={() => toggleLike(post.id)}
                      >
                        ?汨? 縺?縺?縺ｭ {post.likes}
                      </button>
                      <button
                        type="button"
                        className="ha-reactBtn"
                        data-on={post.empathyByMe}
                        onClick={() => toggleEmpathy(post.id)}
                      >
                        ?汳? 蜈ｱ諢? {post.empathy}
                      </button>
                      <button
                        type="button"
                        className="ha-btn ha-btnGhost"
                        style={{ padding: '6px 10px', fontSize: 12 }}
                        onClick={() => setExpandedPost((id) => (id === post.id ? null : post.id))}
                      >
                        {expandedPost === post.id ? '髢峨§繧?' : '繧ｳ繝｡繝ｳ繝医?ｻAI'}
                      </button>
                    </div>

                    {expandedPost === post.id && (
                      <div className="ha-comments">
                        {post.aiComment ? (
                          <div className="ha-aiComment">
                            <strong style={{ color: 'var(--accent)' }}>AI繧ｳ繝｡繝ｳ繝?</strong>
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
                            {aiLoadingPostId === post.id ? 'AI逕滓?蝉ｸｭ窶ｦ' : 'AI繧ｳ繝｡繝ｳ繝医ｒ逕滓??'}
                          </button>
                        </div>
                        {post.comments.map((c) => (
                          <div key={c.id} className="ha-comment">
                            <strong>{c.author}</strong> ﾂｷ {new Date(c.createdAt).toLocaleString('ja-JP')}
                            {'\n'}
                            {c.text}
                          </div>
                        ))}
                        <div className="ha-row" style={{ marginTop: 10 }}>
                          <input
                            className={fieldClass}
                            placeholder="繧ｳ繝｡繝ｳ繝医ｒ蜈･蜉?"
                            value={commentDrafts[post.id] || ''}
                            onChange={(e) =>
                              setCommentDrafts((d) => ({ ...d, [post.id]: e.target.value }))
                            }
                          />
                        </div>
                        <button type="button" className="ha-btn ha-btnGhost" onClick={() => addComment(post.id)}>
                          繧ｳ繝｡繝ｳ繝医ｒ謚慕ｨｿ
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

        {/* 繝輔ャ繧ｿ繝ｼ */}
        <footer style={{
          background: '#1a3a5c',
          color: 'rgba(255,255,255,0.7)',
          padding: '24px 20px 32px',
          marginTop: 16,
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#c9a84c', marginBottom: 12 }}>
            荳榊虚逕｣AI繧ｳ繝ｳ繧ｷ繧ｧ繝ｫ繧ｸ繝･
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px 20px', marginBottom: 16 }}>
            {[
              { label: '蛻ｩ逕ｨ繧ｬ繧､繝?', tab: 'guide' },
              { label: '蛻ｩ逕ｨ隕冗ｴ?', tab: 'terms' },
              { label: '繝励Λ繧､繝舌す繝ｼ繝昴Μ繧ｷ繝ｼ', tab: 'privacy' },
              { label: '迚ｹ螳壼膚蜿門ｼ墓ｳ輔↓蝓ｺ縺･縺剰｡ｨ險?', tab: 'tokusho' },
              { label: '讌ｭ閠?繝ｻ蟆る摩螳ｶ蜷代¢蛻ｩ逕ｨ隕冗ｴ?', tab: 'partner_terms' },
            ].map((item) => (
              <button
                key={item.tab}
                type="button"
                onClick={() => setTab('legal')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255,255,255,0.75)',
                  fontSize: 12,
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  fontFamily: 'inherit',
                  padding: 0,
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
            ﾂｩ 2024 GINTETSU荳榊虚逕｣譬ｪ蠑丈ｼ夂､ｾ縲?All rights reserved.
          </div>
        </footer>
    </>
  )
}
