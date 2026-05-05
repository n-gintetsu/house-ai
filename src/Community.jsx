import { useState, useEffect, useCallback } from 'react'
import { supabase } from './lib/supabase'

const STORAGE_KEY = 'house-ai-community-v1'

const COMMUNITY_AI_SYSTEM =
  'あなたは不動産コミュニティのAIモデレーターです。投稿に対し、共感しつつ実務的な視点（次の一歩・確認ポイント）を短く2〜5文で返してください。攻撃的・断定的すぎる表現は避けます。'

const CATEGORIES = [
  { id: 'buy', label: '🏠 購入' },
  { id: 'rent', label: '🔑 賃貸' },
  { id: 'sell', label: '💰 売却' },
  { id: 'invest', label: '📈 投資' },
  { id: 'reform', label: '🔨 リフォーム' },
  { id: 'other', label: '💬 その他' },
]

const SAMPLE_POSTS = [
  {
    id: 'sample-1',
    category: 'buy',
    title: '新築マンションで300万円損しました',
    body: '購入時に「値下がりしない」と言われましたが、3年後の査定で300万円以上下落。オプション工事も高額でした。同じ失敗をしてほしくないので共有します。',
    author_name: '田中さん',
    anon: false,
    likes: 48,
    empathy: 120,
    likedByMe: false,
    empathyByMe: false,
    comments: [],
    aiComment: '',
    createdAt: Date.now() - 86400000 * 3,
  },
  {
    id: 'sample-2',
    category: 'rent',
    title: '退去時の原状回復で揉めた話',
    body: '入居時のチェックリストをしっかり記録していなかったせいで、退去時に50万円請求されました。写真撮影と書面確認は絶対にやったほうがいい。',
    author_name: null,
    anon: true,
    likes: 35,
    empathy: 89,
    likedByMe: false,
    empathyByMe: false,
    comments: [],
    aiComment: '',
    createdAt: Date.now() - 86400000 * 7,
  },
  {
    id: 'sample-3',
    category: 'invest',
    title: 'ワンルーム投資で後悔していること',
    body: '利回り8%と言われて購入しましたが、管理費・修繕積立金・空室期間を考えると実質3%台。節税効果も思ったほど出ず。もっと勉強してから決めればよかった。',
    author_name: '投資家K',
    anon: false,
    likes: 62,
    empathy: 145,
    likedByMe: false,
    empathyByMe: false,
    comments: [],
    aiComment: '',
    createdAt: Date.now() - 86400000 * 14,
  },
]

function uid() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`
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
  } catch {}
}

async function callClaudeApi({ system, messages }) {
  const res = await fetch('/api/claude', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      model: import.meta.env.VITE_CLAUDE_MODEL || 'claude-sonnet-4-5',
      system,
      messages,
      temperature: 0.4,
      max_tokens: 600,
    }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(`Claude API error (${res.status})`)
  return typeof data?.text === 'string' ? data.text : ''
}

const labelStyle = {
  display: 'block',
  fontSize: 13,
  fontWeight: 600,
  color: '#374151',
  marginBottom: 6,
}

export default function Community({ user }) {
  const [posts, setPosts] = useState(() => {
    const saved = loadCommunity()
    return saved.length > 0 ? saved : SAMPLE_POSTS
  })
  const [draft, setDraft] = useState({
    title: '',
    body: '',
    author: '',
    lossAmount: '',
    category: 'other',
    anon: false,
  })
  const [showForm, setShowForm] = useState(false)
  const [expandedPost, setExpandedPost] = useState(null)
  const [commentDrafts, setCommentDrafts] = useState({})
  const [aiLoadingPostId, setAiLoadingPostId] = useState(null)
  const [rankSort, setRankSort] = useState('empathy')
  const [activeCategory, setActiveCategory] = useState('all')

  useEffect(() => {
    saveCommunity(posts)
  }, [posts])

  useEffect(() => {
    supabase
      .from('community_posts')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error || !data?.length) return
        setPosts(data.map((p) => normalizePost({ ...p, createdAt: new Date(p.created_at).getTime() })))
      })
  }, [])

  const sortedPosts = [...posts]
    .filter((p) => activeCategory === 'all' || p.category === activeCategory)
    .sort((a, b) => {
      if (rankSort === 'empathy') return b.empathy - a.empathy
      if (rankSort === 'likes') return b.likes - a.likes
      return b.createdAt - a.createdAt
    })

  const submitPost = async () => {
    if (!draft.title.trim() || !draft.body.trim()) return
    const payload = {
      category: draft.category,
      title: draft.title.trim(),
      body: draft.body.trim(),
      anon: draft.anon,
      author_name: draft.anon ? null : (draft.author.trim() || null),
      likes: 0,
      empathy: 0,
    }
    const { data, error } = await supabase.from('community_posts').insert(payload).select()
    if (error) { console.error(error); return }
    const newPost = {
      ...data[0],
      likedByMe: false,
      empathyByMe: false,
      comments: [],
      aiComment: '',
      createdAt: Date.now(),
    }
    setPosts((list) => [newPost, ...list])
    setDraft({ title: '', body: '', author: '', lossAmount: '', category: 'other', anon: false })
    setShowForm(false)
  }

  const toggleLike = (id) => {
    setPosts((list) =>
      list.map((p) => {
        if (p.id !== id) return p
        const next = !p.likedByMe
        return { ...p, likedByMe: next, likes: Math.max(0, p.likes + (next ? 1 : -1)) }
      }),
    )
  }

  const toggleEmpathy = (id) => {
    setPosts((list) =>
      list.map((p) => {
        if (p.id !== id) return p
        const next = !p.empathyByMe
        return { ...p, empathyByMe: next, empathy: Math.max(0, p.empathy + (next ? 1 : -1)) }
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
          comments: [...p.comments, { id: uid(), author: user?.email?.split('@')[0] || 'ユーザー', text, createdAt: Date.now() }],
        }
      }),
    )
    setCommentDrafts((d) => ({ ...d, [postId]: '' }))
  }

  const generateAiComment = useCallback(async (post) => {
    setAiLoadingPostId(post.id)
    try {
      const text = await callClaudeApi({
        system: COMMUNITY_AI_SYSTEM,
        messages: [{ role: 'user', content: [{ type: 'text', text: `タイトル: ${post.title}\n本文:\n${post.body}` }] }],
      })
      setPosts((list) => list.map((p) => (p.id === post.id ? { ...p, aiComment: text } : p)))
    } catch {
      setPosts((list) =>
        list.map((p) =>
          p.id === post.id ? { ...p, aiComment: 'AIコメントの生成に失敗しました。もう一度お試しください。' } : p,
        ),
      )
    } finally {
      setAiLoadingPostId(null)
    }
  }, [])

  return (
    <div style={{ paddingBottom: showForm ? 0 : 80, color: '#1e293b' }}>
      {/* ヘッダー */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: 0 }}>🏘️ 体験談コミュニティ</h2>
        <select
          value={rankSort}
          onChange={(e) => setRankSort(e.target.value)}
          style={{ fontSize: 11, padding: '4px 8px', borderRadius: 6, border: '1px solid #ddd', color: '#374151', cursor: 'pointer', background: '#fff' }}
        >
          <option value="empathy">💗 共感順</option>
          <option value="likes">👍 いいね順</option>
          <option value="new">🆕 新着順</option>
        </select>
      </div>

      <p style={{ fontSize: 13, color: '#475569', marginBottom: 14, lineHeight: 1.6 }}>
        不動産の体験談・失敗談・成功話を共有できます。あなたの経験が誰かの役に立ちます。
      </p>

      {/* カテゴリタブ */}
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 8, marginBottom: 12 }}>
        <button
          onClick={() => setActiveCategory('all')}
          style={{
            padding: '5px 12px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap',
            background: activeCategory === 'all' ? '#1a3a5c' : '#f0f4f8',
            color: activeCategory === 'all' ? '#fff' : '#374151',
          }}
        >
          すべて
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            style={{
              padding: '5px 12px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap',
              background: activeCategory === cat.id ? '#1a3a5c' : '#f0f4f8',
              color: activeCategory === cat.id ? '#fff' : '#374151',
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* 投稿フォーム */}
      {showForm && (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 16, marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ margin: 0, fontSize: 15, color: '#1a3a5c', fontWeight: 750 }}>✏️ 体験談を投稿する</h3>
            <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: '#94a3b8' }}>✕</button>
          </div>
          <div style={{ background: '#fffbe6', border: '1px solid #f0d060', borderRadius: 8, padding: '10px 12px', marginBottom: 12, fontSize: 12, color: '#92400e', lineHeight: 1.6 }}>
            💡 <strong>テンプレ：</strong>「〇〇で後悔しました」「〇〇で損しました」形式が共感を呼びます！
          </div>
          <div style={{ marginBottom: 10 }}>
            <label style={labelStyle}>カテゴリ</label>
            <select
              className="ha-field"
              value={draft.category}
              onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value }))}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.label}</option>
              ))}
            </select>
          </div>
          <div style={{ marginBottom: 10 }}>
            <label style={labelStyle}>タイトル</label>
            <input
              className="ha-field"
              value={draft.title}
              onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
              placeholder="例：新築マンションで300万損した話"
            />
          </div>
          <div style={{ marginBottom: 10 }}>
            <label style={labelStyle}>本文</label>
            <textarea
              className="ha-field"
              value={draft.body}
              onChange={(e) => setDraft((d) => ({ ...d, body: e.target.value }))}
              placeholder="体験談の詳細を書いてください..."
              rows={5}
            />
          </div>
          <div style={{ marginBottom: 10 }}>
            <label style={labelStyle}>💸 損した金額（任意）</label>
            <input
              className="ha-field"
              value={draft.lossAmount}
              onChange={(e) => setDraft((d) => ({ ...d, lossAmount: e.target.value }))}
              placeholder="例：約100万円"
            />
          </div>
          <div style={{ marginBottom: 10 }}>
            <label style={labelStyle}>お名前（任意）</label>
            <input
              className="ha-field"
              value={draft.author}
              onChange={(e) => setDraft((d) => ({ ...d, author: e.target.value }))}
              placeholder="空欄なら匿名"
              disabled={draft.anon}
            />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#374151', cursor: 'pointer' }}>
              <input type="checkbox" checked={draft.anon} onChange={(e) => setDraft((d) => ({ ...d, anon: e.target.checked }))} />
              匿名で投稿する
            </label>
          </div>
          <button type="button" className="ha-btn" onClick={submitPost} style={{ width: '100%' }}>
            投稿する
          </button>
        </div>
      )}

      {/* 投稿一覧 */}
      {sortedPosts.length === 0 ? (
        <p style={{ color: '#475569', fontSize: 14 }}>まだ投稿がありません。最初の体験談を投稿してみましょう。</p>
      ) : (
        sortedPosts.map((post) => (
          <article key={post.id} className="ha-post" style={{ color: '#1e293b', background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: '14px 14px 10px', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, flexWrap: 'wrap' }}>
              {CATEGORIES.find((c) => c.id === post.category) && (
                <span style={{ fontSize: 11, background: '#f0f4f8', color: '#334155', padding: '2px 8px', borderRadius: 10, fontWeight: 600 }}>
                  {CATEGORIES.find((c) => c.id === post.category).label}
                </span>
              )}
              {post.lossAmount && (
                <span style={{ fontSize: 11, fontWeight: 700, background: '#fff5f5', color: '#c0392b', border: '1px solid #ffd5d5', padding: '2px 8px', borderRadius: 10, whiteSpace: 'nowrap' }}>
                  💸 {post.lossAmount}
                </span>
              )}
            </div>
            <h4 style={{ margin: '0 0 6px', fontSize: 14, fontWeight: 750, color: '#1e293b', lineHeight: 1.4 }}>{post.title}</h4>
            <p style={{ margin: '0 0 8px', fontSize: 13, color: '#1e293b', lineHeight: 1.65 }}>{post.body}</p>
            <p style={{ margin: '0 0 10px', fontSize: 11, color: '#64748b' }}>
              {post.anon ? '匿名' : (post.author_name || post.author || '匿名')} ・{' '}
              {new Date(post.createdAt || post.created_at).toLocaleDateString('ja-JP')}
            </p>
            <div className="ha-reactions">
              <button type="button" className="ha-reactBtn" data-on={post.likedByMe} onClick={() => toggleLike(post.id)}>
                👍 {post.likes}
              </button>
              <button type="button" className="ha-reactBtn" data-on={post.empathyByMe} onClick={() => toggleEmpathy(post.id)}>
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
              <div className="ha-comments" style={{ marginTop: 12 }}>
                {post.aiComment ? (
                  <div className="ha-aiComment" style={{ color: '#1e293b' }}>
                    <strong style={{ color: '#1a3a5c' }}>AIコメント</strong>
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
                  <div key={c.id} className="ha-comment" style={{ color: '#1e293b' }}>
                    <strong style={{ color: '#1e293b' }}>{c.author}</strong>
                    <span style={{ color: '#64748b' }}> · {new Date(c.createdAt).toLocaleString('ja-JP')}</span>
                    {'\n'}
                    {c.text}
                  </div>
                ))}
                <div className="ha-row" style={{ marginTop: 10 }}>
                  <input
                    className="ha-field"
                    placeholder="コメントを入力"
                    value={commentDrafts[post.id] || ''}
                    onChange={(e) => setCommentDrafts((d) => ({ ...d, [post.id]: e.target.value }))}
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

      {/* 固定投稿ボタン（フォーム非表示時） */}
      {!showForm && (
        <div style={{
          position: 'fixed', bottom: 64, left: 0, right: 0,
          background: 'linear-gradient(to top, #fff 70%, transparent)',
          padding: '16px 16px 16px',
          zIndex: 7000,
        }}>
          <button
            type="button"
            onClick={() => {
              if (!user) {
                window.dispatchEvent(new CustomEvent('show-auth-sheet', {}))
                return
              }
              setShowForm(true)
            }}
            style={{
              width: '100%', maxWidth: 480, display: 'block', margin: '0 auto',
              background: '#1a3a5c', color: '#fff', border: 'none', borderRadius: 12,
              padding: '14px 0', fontSize: 16, fontWeight: 750, cursor: 'pointer',
            }}
          >
            ✏️ 体験談を投稿する
          </button>
        </div>
      )}
    </div>
  )
}
