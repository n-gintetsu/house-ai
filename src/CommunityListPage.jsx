import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { supabase } from './lib/supabase'

const MOCK_POSTS = [
  {
    id: 'mock-1',
    title: '渋谷区で在宅ワーク向き1LDKを探しています',
    status: '募集中',
    area: '東京都渋谷区・目黒区',
    budget: '20〜35万円/月',
    proposal_count: 8,
    views: 142,
    saves: 23,
    tags: ['在宅ワーク', '静か', '駅近'],
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    free_text: '',
    budget_min: 200000,
    budget_max: 350000,
    areas: ['東京都渋谷区', '目黒区'],
  },
  {
    id: 'mock-2',
    title: '新宿区周辺でペット可のデザイナーズ物件を希望',
    status: '提案あり',
    area: '東京都新宿区・中野区',
    budget: '18〜28万円/月',
    proposal_count: 15,
    views: 289,
    saves: 47,
    tags: ['ペット', 'デザイナーズ', '新築'],
    created_at: new Date(Date.now() - 3600000 * 18).toISOString(),
    free_text: '',
    budget_min: 180000,
    budget_max: 280000,
    areas: ['東京都新宿区', '中野区'],
  },
  {
    id: 'mock-3',
    title: '港区で眺望の良い高級マンションを探しています',
    status: '成約済み',
    area: '東京都港区',
    budget: '50〜100万円/月',
    proposal_count: 22,
    views: 531,
    saves: 89,
    tags: ['眺望', '高級感', 'セキュリティ'],
    created_at: new Date(Date.now() - 3600000 * 96).toISOString(),
    free_text: '',
    budget_min: 500000,
    budget_max: 1000000,
    areas: ['東京都港区'],
    success_days: 4,
  },
  {
    id: 'mock-4',
    title: '横浜市中区で日当たり良好な2LDKを探しています',
    status: '募集中',
    area: '横浜市中区・西区',
    budget: '15〜25万円/月',
    proposal_count: 3,
    views: 76,
    saves: 12,
    tags: ['日当たり', '静か'],
    created_at: new Date(Date.now() - 3600000 * 1).toISOString(),
    free_text: '',
    budget_min: 150000,
    budget_max: 250000,
    areas: ['横浜市中区', '横浜市西区'],
  },
]

const STATS = [
  { label: '相談投稿', value: 137, unit: '件' },
  { label: '提案成立', value: 91, unit: '件' },
  { label: '成約報告', value: 26, unit: '件' },
]

const STATUS_CONFIG = {
  '募集中': { label: '募集中', color: '#4a9eff', bg: 'rgba(74,158,255,0.12)', border: 'rgba(74,158,255,0.3)' },
  '提案あり': { label: '提案あり', color: '#4cba7a', bg: 'rgba(76,186,122,0.12)', border: 'rgba(76,186,122,0.3)' },
  '成約済み': { label: '成約済み', color: '#a78bfa', bg: 'rgba(167,139,250,0.12)', border: 'rgba(167,139,250,0.3)' },
  // Supabaseからくる場合の互換
  '提案あり(DB)': { label: '提案あり', color: '#4cba7a', bg: 'rgba(76,186,122,0.12)', border: 'rgba(76,186,122,0.3)' },
  '成約': { label: '成約済み', color: '#a78bfa', bg: 'rgba(167,139,250,0.12)', border: 'rgba(167,139,250,0.3)' },
}

function getStatusConfig(status) {
  return STATUS_CONFIG[status] || STATUS_CONFIG['募集中']
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'たった今'
  if (m < 60) return `${m}分前`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}時間前`
  const d = Math.floor(h / 24)
  return `${d}日前`
}

function buildPostTitle(post) {
  if (post.title) return post.title
  if (post.free_text) return post.free_text.slice(0, 40)
  const areas = (post.areas || []).slice(0, 2).join('・')
  const tags = (post.tags || []).slice(0, 2).join('・')
  if (areas && tags) return `${areas}で${tags}な物件を探しています`
  if (areas) return `${areas}で物件を探しています`
  return '物件を探しています'
}

function buildBudgetText(post) {
  if (post.budget) return post.budget
  const mn = post.budget_min ? Math.floor(post.budget_min / 10000) + '万円' : '下限なし'
  const mx = post.budget_max ? Math.floor(post.budget_max / 10000) + '万円' : '上限なし'
  if (!post.budget_min && !post.budget_max) return '予算未設定'
  return `${mn}〜${mx}`
}

function buildAreaText(post) {
  if (post.area) return post.area
  return (post.areas || []).slice(0, 2).join('・') || '未設定'
}

function StatCounter({ label, value, unit, delay }) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    const t = setTimeout(() => {
      let start = 0
      const step = Math.ceil(value / 40)
      const timer = setInterval(() => {
        start += step
        if (start >= value) {
          setCount(value)
          clearInterval(timer)
        } else {
          setCount(start)
        }
      }, 30)
      return () => clearInterval(timer)
    }, delay)
    return () => clearTimeout(t)
  }, [value, delay])

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 'clamp(28px, 6vw, 40px)', fontWeight: 800, color: '#c9a84c', lineHeight: 1 }}>
        {count}
        <span style={{ fontSize: 14, color: 'rgba(180,200,255,0.6)', fontWeight: 400, marginLeft: 2 }}>{unit}</span>
      </div>
      <div style={{ fontSize: 12, color: 'rgba(180,200,255,0.5)', marginTop: 4 }}>{label}</div>
    </div>
  )
}

function PostCard({ post, index }) {
  const sc = getStatusConfig(post.status)
  const isSuccess = post.status === '成約済み' || post.status === '成約'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.4 }}
      style={{
        border: `1px solid ${isSuccess ? 'rgba(167,139,250,0.2)' : 'rgba(100,140,255,0.12)'}`,
        borderRadius: 16,
        padding: '18px 16px',
        background: isSuccess ? 'rgba(167,139,250,0.04)' : 'rgba(255,255,255,0.025)',
        marginBottom: 14,
        cursor: 'default',
      }}
    >
      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 10 }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.9)', lineHeight: 1.45, margin: 0, flex: 1, minWidth: 0 }}>
          {buildPostTitle(post)}
        </p>
        <span style={{
          flexShrink: 0,
          display: 'inline-block',
          fontSize: 11,
          fontWeight: 700,
          color: sc.color,
          background: sc.bg,
          border: `1px solid ${sc.border}`,
          borderRadius: 999,
          padding: '3px 10px',
          whiteSpace: 'nowrap',
        }}>
          {sc.label}
        </span>
      </div>

      {/* Tags */}
      {(post.tags || []).length > 0 ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
          {(post.tags || []).map(tag => (
            <span key={tag} style={{
              fontSize: 11,
              color: 'rgba(180,200,255,0.55)',
              border: '1px solid rgba(100,140,255,0.15)',
              borderRadius: 999,
              padding: '2px 8px',
            }}>{tag}</span>
          ))}
        </div>
      ) : null}

      {/* Meta info */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginBottom: 12 }}>
        <span style={{ fontSize: 12, color: 'rgba(180,200,255,0.5)', display: 'flex', alignItems: 'center', gap: 4 }}>
          📍 <span style={{ color: 'rgba(180,200,255,0.8)' }}>{buildAreaText(post)}</span>
        </span>
        <span style={{ fontSize: 12, color: 'rgba(180,200,255,0.5)', display: 'flex', alignItems: 'center', gap: 4 }}>
          💰 <span style={{ color: 'rgba(180,200,255,0.8)' }}>{buildBudgetText(post)}</span>
        </span>
        <span style={{ fontSize: 12, color: 'rgba(180,200,255,0.5)' }}>
          {timeAgo(post.created_at)}
        </span>
      </div>

      {/* Success panel */}
      {isSuccess ? (
        <div style={{
          borderRadius: 10,
          padding: '10px 14px',
          background: 'rgba(167,139,250,0.08)',
          border: '1px solid rgba(167,139,250,0.2)',
          marginBottom: 12,
        }}>
          <p style={{ margin: 0, fontSize: 12, color: '#a78bfa', fontWeight: 600 }}>
            投稿から{post.success_days || 4}日で理想の住まいが見つかりました
          </p>
        </div>
      ) : null}

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', gap: 14 }}>
          <span style={{ fontSize: 12, color: 'rgba(180,200,255,0.5)' }}>
            提案 <span style={{ color: '#c9a84c', fontWeight: 700 }}>{post.proposal_count || 0}件</span>
          </span>
          <span style={{ fontSize: 12, color: 'rgba(180,200,255,0.5)' }}>
            👁 {post.views || 0}
          </span>
          <span style={{ fontSize: 12, color: 'rgba(180,200,255,0.5)' }}>
            🔖 {post.saves || 0}
          </span>
        </div>
        <button
          type="button"
          onClick={() => {}}
          style={{
            padding: '7px 14px',
            background: 'transparent',
            border: '1px solid rgba(100,140,255,0.25)',
            borderRadius: 8,
            color: 'rgba(180,200,255,0.6)',
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          詳細を見る
        </button>
      </div>
    </motion.div>
  )
}

export default function CommunityListPage() {
  const [dbPosts, setDbPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('community_posts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20)
      .then(({ data }) => {
        setDbPosts(data || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const displayPosts = dbPosts.length > 0 ? dbPosts : MOCK_POSTS

  return (
    <>
      <style>{`
        .cl-wrap {
          min-height: 100svh;
          background: #0a0a0f;
          padding-bottom: 60px;
          position: relative;
          overflow-x: hidden;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        .cl-grid {
          position: fixed;
          inset: 0;
          background-image:
            linear-gradient(rgba(100,140,255,0.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(100,140,255,0.035) 1px, transparent 1px);
          background-size: 56px 56px;
          pointer-events: none;
          z-index: 0;
        }
        .cl-sticky-header {
          position: sticky;
          top: 0;
          z-index: 50;
          background: rgba(10,10,15,0.92);
          border-bottom: 1px solid rgba(100,140,255,0.1);
          padding: 16px 20px;
        }
        .cl-inner {
          position: relative;
          z-index: 1;
          max-width: 640px;
          margin: 0 auto;
          padding: 0 16px;
        }
        .cl-stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1px;
          background: rgba(100,140,255,0.1);
          border: 1px solid rgba(100,140,255,0.1);
          border-radius: 14px;
          overflow: hidden;
          margin: 20px 0;
        }
        .cl-stat-cell {
          background: rgba(255,255,255,0.02);
          padding: 16px 8px;
        }
        .cl-cta-btn {
          display: block;
          width: 100%;
          box-sizing: border-box;
          padding: 15px;
          background: linear-gradient(135deg, #c9a84c, #e8c96a);
          color: #050816;
          border: none;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 800;
          cursor: pointer;
          font-family: inherit;
          margin-bottom: 24px;
          transition: opacity 0.15s, transform 0.1s;
          letter-spacing: 0.3px;
        }
        .cl-cta-btn:hover {
          opacity: 0.9;
        }
        .cl-cta-btn:active {
          transform: scale(0.98);
        }
        .cl-section-label {
          font-size: 12px;
          color: rgba(180,200,255,0.4);
          letter-spacing: 2px;
          text-transform: uppercase;
          margin-bottom: 14px;
          margin-top: 4px;
        }
        .cl-loading {
          text-align: center;
          color: rgba(180,200,255,0.4);
          font-size: 14px;
          padding: 60px 0;
        }
      `}</style>

      <div className="cl-wrap">
        <div className="cl-grid" />

        {/* Sticky header */}
        <div className="cl-sticky-header">
          <div style={{ maxWidth: 640, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div>
              <h1 style={{ margin: 0, fontSize: 'clamp(15px,4vw,18px)', fontWeight: 800, color: '#fff' }}>
                あなたの希望を投稿してください
              </h1>
              <p style={{ margin: '2px 0 0', fontSize: 11, color: 'rgba(180,200,255,0.45)' }}>
                検索する時代から、AIに探してもらう時代へ
              </p>
            </div>
            <button
              type="button"
              onClick={() => { window.location.href = '/community/create' }}
              style={{
                flexShrink: 0,
                padding: '9px 16px',
                background: 'linear-gradient(135deg, #c9a84c, #e8c96a)',
                color: '#050816',
                border: 'none',
                borderRadius: 10,
                fontSize: 12,
                fontWeight: 800,
                cursor: 'pointer',
                fontFamily: 'inherit',
                whiteSpace: 'nowrap',
              }}
            >
              + 投稿する
            </button>
          </div>
        </div>

        <div className="cl-inner">
          {/* Stats */}
          <div className="cl-stats-grid">
            {STATS.map((s, i) => (
              <div key={s.label} className="cl-stat-cell">
                <StatCounter label={s.label} value={s.value} unit={s.unit} delay={i * 150} />
              </div>
            ))}
          </div>

          {/* CTA */}
          <button
            type="button"
            className="cl-cta-btn"
            onClick={() => { window.location.href = '/community/create' }}
          >
            新しい相談を投稿する →
          </button>

          {/* Posts */}
          <p className="cl-section-label">最近の相談投稿</p>

          {loading ? (
            <div className="cl-loading">読み込み中...</div>
          ) : (
            <div>
              {displayPosts.map((post, i) => (
                <PostCard key={post.id} post={post} index={i} />
              ))}
            </div>
          )}

          <div style={{ height: 40 }} />
        </div>
      </div>
    </>
  )
}
