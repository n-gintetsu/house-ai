import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'

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

function buildTitle(post) {
  if (post.free_text) return post.free_text.slice(0, 40)
  const areas = (post.areas || []).slice(0, 2).join('・')
  const tags = (post.tags || []).slice(0, 2).join('・')
  if (areas && tags) return `${areas}で${tags}な物件を探しています`
  if (areas) return `${areas}で物件を探しています`
  if (tags) return `${tags}な物件を探しています`
  return '物件を探しています'
}

const STATUS_MAP = {
  '募集中': { label: '募集中', color: '#4a9eff', bg: 'rgba(74,158,255,0.12)', border: 'rgba(74,158,255,0.3)' },
  '提案あり': { label: '提案あり', color: '#c9a84c', bg: 'rgba(201,168,76,0.12)', border: 'rgba(201,168,76,0.3)' },
  '成約': { label: '成約', color: '#4cba7a', bg: 'rgba(76,186,122,0.12)', border: 'rgba(76,186,122,0.3)' },
}

function StatusBadge({ status }) {
  const s = STATUS_MAP[status] || STATUS_MAP['募集中']
  return (
    <span style={{
      display: 'inline-block',
      fontSize: 11,
      fontWeight: 700,
      color: s.color,
      background: s.bg,
      border: `1px solid ${s.border}`,
      borderRadius: 999,
      padding: '3px 10px',
      letterSpacing: '0.5px',
    }}>
      {s.label}
    </span>
  )
}

export default function CommunityListPage() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    supabase
      .from('community_posts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20)
      .then(({ data, error: err }) => {
        if (err) {
          setError('投稿の取得に失敗しました。')
        } else {
          setPosts(data || [])
        }
        setLoading(false)
      })
  }, [])

  return (
    <>
      <style>{`
        .cl-wrap {
          min-height: 100svh;
          background: #050816;
          padding: 0 0 60px;
          position: relative;
          overflow: hidden;
        }
        .cl-grid {
          position: fixed;
          inset: 0;
          background-image:
            linear-gradient(rgba(100,140,255,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(100,140,255,0.04) 1px, transparent 1px);
          background-size: 48px 48px;
          pointer-events: none;
          z-index: 0;
        }
        .cl-inner {
          position: relative;
          z-index: 1;
          max-width: 600px;
          margin: 0 auto;
          padding: 0 16px;
        }
        .cl-header {
          padding: 32px 0 24px;
          text-align: center;
        }
        .cl-back {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: rgba(180,200,255,0.55);
          font-size: 13px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          margin-bottom: 16px;
          font-family: inherit;
        }
        .cl-badge {
          display: inline-block;
          font-size: 11px;
          color: #c9a84c;
          border: 1px solid rgba(201,168,76,0.4);
          padding: 4px 12px;
          border-radius: 999px;
          letter-spacing: 2px;
          margin-bottom: 12px;
        }
        .cl-title {
          font-size: clamp(20px, 5vw, 26px);
          font-weight: 800;
          color: #fff;
          margin: 0 0 8px;
        }
        .cl-subtitle {
          font-size: 13px;
          color: rgba(180,200,255,0.55);
          margin: 0;
        }
        .cl-cta-btn {
          display: block;
          width: 100%;
          box-sizing: border-box;
          padding: 14px;
          background: linear-gradient(135deg, #c9a84c, #e8c96a);
          color: #050816;
          border: none;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 800;
          cursor: pointer;
          font-family: inherit;
          margin-bottom: 28px;
          transition: opacity 0.15s;
          letter-spacing: 0.5px;
          text-align: center;
        }
        .cl-cta-btn:hover {
          opacity: 0.9;
        }
        .cl-card {
          border: 1px solid rgba(100,140,255,0.14);
          border-radius: 16px;
          padding: 18px 16px;
          background: rgba(255,255,255,0.025);
          margin-bottom: 14px;
          transition: border-color 0.15s, background 0.15s;
        }
        .cl-card:hover {
          border-color: rgba(201,168,76,0.3);
          background: rgba(255,255,255,0.04);
        }
        .cl-card-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 10px;
        }
        .cl-card-title {
          font-size: 14px;
          font-weight: 700;
          color: rgba(255,255,255,0.9);
          line-height: 1.45;
          flex: 1;
          min-width: 0;
        }
        .cl-card-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 12px;
        }
        .cl-meta-item {
          font-size: 12px;
          color: rgba(180,200,255,0.5);
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .cl-meta-val {
          color: rgba(180,200,255,0.8);
          font-weight: 600;
        }
        .cl-detail-btn {
          padding: 8px 16px;
          background: transparent;
          border: 1px solid rgba(100,140,255,0.25);
          border-radius: 8px;
          color: rgba(180,200,255,0.6);
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          font-family: inherit;
          transition: border-color 0.15s, color 0.15s;
        }
        .cl-detail-btn:hover {
          border-color: rgba(201,168,76,0.4);
          color: #c9a84c;
        }
        .cl-loading {
          text-align: center;
          color: rgba(180,200,255,0.45);
          font-size: 14px;
          padding: 60px 0;
        }
        .cl-error {
          text-align: center;
          color: #ffa0a0;
          font-size: 14px;
          padding: 40px 0;
        }
        .cl-empty {
          text-align: center;
          padding: 60px 0;
        }
        .cl-empty p {
          color: rgba(180,200,255,0.4);
          font-size: 14px;
          margin: 0 0 20px;
        }
        .cl-tags-row {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 10px;
        }
        .cl-tag {
          font-size: 11px;
          color: rgba(180,200,255,0.55);
          border: 1px solid rgba(100,140,255,0.15);
          border-radius: 999px;
          padding: 2px 8px;
        }
        .cl-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 8px;
        }
      `}</style>

      <div className="cl-wrap">
        <div className="cl-grid" />
        <div className="cl-inner">
          <div className="cl-header">
            <button type="button" className="cl-back" onClick={() => window.history.back()}>
              ← 戻る
            </button>
            <div className="cl-badge">COMMUNITY</div>
            <h1 className="cl-title">住まい相談室</h1>
            <p className="cl-subtitle">みんなの希望条件・提案一覧</p>
          </div>

          <button
            type="button"
            className="cl-cta-btn"
            onClick={() => { window.location.href = '/community/create' }}
          >
            あなたも投稿する →
          </button>

          {loading ? (
            <div className="cl-loading">読み込み中...</div>
          ) : error ? (
            <div className="cl-error">{error}</div>
          ) : posts.length === 0 ? (
            <div className="cl-empty">
              <p>まだ投稿がありません</p>
              <button
                type="button"
                className="cl-cta-btn"
                onClick={() => { window.location.href = '/community/create' }}
                style={{ display: 'inline-block', width: 'auto', padding: '12px 28px' }}
              >
                最初の投稿をする
              </button>
            </div>
          ) : (
            <div>
              {posts.map(post => (
                <div key={post.id} className="cl-card">
                  <div className="cl-card-top">
                    <p className="cl-card-title">{buildTitle(post)}</p>
                    <StatusBadge status={post.status || '募集中'} />
                  </div>

                  {(post.tags || []).length > 0 ? (
                    <div className="cl-tags-row">
                      {(post.tags || []).map(tag => (
                        <span key={tag} className="cl-tag">{tag}</span>
                      ))}
                    </div>
                  ) : null}

                  <div className="cl-card-meta">
                    {(post.budget_min || post.budget_max) ? (
                      <span className="cl-meta-item">
                        予算 <span className="cl-meta-val">
                          {post.budget_min || '—'}万円〜{post.budget_max || '—'}万円
                        </span>
                      </span>
                    ) : null}
                    <span className="cl-meta-item">
                      {timeAgo(post.created_at)}
                    </span>
                  </div>

                  <div className="cl-card-footer">
                    <span className="cl-meta-item">
                      提案数 <span className="cl-meta-val">{post.proposal_count || 0}件</span>
                    </span>
                    <button type="button" className="cl-detail-btn">
                      詳細を見る
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
