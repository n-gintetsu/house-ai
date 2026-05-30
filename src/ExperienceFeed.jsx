import { useState, useEffect } from 'react';
import { ChevronLeft, ThumbsUp, Lightbulb, Bot, Bookmark, MessageCircle, Users, MessageSquare } from 'lucide-react';
import { supabase } from './lib/supabase';


const TYPE_BADGE = {
  success:  { label: '成功談', background: 'rgba(34,197,94,0.2)',   color: '#22c55e' },
  failure:  { label: '失敗談', background: 'rgba(239,68,68,0.2)',    color: '#ef4444' },
  question: { label: '相談',   background: 'rgba(59,130,246,0.2)',   color: '#60a5fa' },
};

const TABS = [
  { id: 'success',  label: '成功談' },
  { id: 'failure',  label: '失敗談' },
  { id: 'question', label: '相談' },
];

const ACTION_BTNS = [
  { Icon: ThumbsUp,  label: '私も同じでした' },
  { Icon: Lightbulb, label: '参考になった' },
  { Icon: Bot,       label: 'AI相談して解決', href: '/' },
  { Icon: Bookmark,  label: '保存しました' },
];

export default function ExperienceFeed() {
  const [activeTab, setActiveTab] = useState('success');
  const [adviceModal, setAdviceModal] = useState(null);
  const [adviceText, setAdviceText] = useState('');
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('experience_posts')
      .select('id, type, title, summary, tags, likes, comments, created_at')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data && data.length > 0) {
          setPosts(data);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = posts.filter(p => p.type === activeTab).sort((a, b) => {
    const likeDiff = (b.likes || 0) - (a.likes || 0);
    if (likeDiff !== 0) return likeDiff;
    return new Date(b.created_at || 0) - new Date(a.created_at || 0);
  });
  const topPostId = filtered.length > 0 ? filtered.reduce((a, b) => ((a.likes || 0) > (b.likes || 0) ? a : b)).id : null;

  const handleAdviceSubmit = () => {
    const hasViolation = /https?:\/\/|tel:|0\d{1,4}-\d{1,4}-\d{4}|[\w.+-]+@[\w-]+\.[a-z]{2,}/i.test(adviceText);
    if (hasViolation) {
      alert('URL・電話番号・メールアドレスは含められません');
      return;
    }
    if (adviceText.length > 200) {
      alert('200文字以内で入力してください');
      return;
    }
    alert('アドバイスを送信しました！');
    setAdviceModal(null);
    setAdviceText('');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0A1628', paddingBottom: 80 }}>

      {/* ヘッダー */}
      <div style={{ position: 'sticky', top: 0, zIndex: 20, background: '#0A1628', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={() => window.history.back()}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center', padding: 0 }}
        >
          <ChevronLeft size={24} />
        </button>
        <h1 style={{ color: '#ffffff', fontSize: 22, fontWeight: 700, margin: 0 }}>みんなの体験談</h1>
      </div>

      {/* タブ */}
      <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{ flex: 1, padding: '14px 0', background: 'none', border: 'none', borderBottom: activeTab === tab.id ? '2px solid #D4AF37' : '2px solid transparent', color: activeTab === tab.id ? '#D4AF37' : 'rgba(255,255,255,0.5)', fontSize: 14, fontWeight: activeTab === tab.id ? 700 : 400, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s ease' }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* カード一覧 */}
      <div style={{ padding: '16px 16px 0' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '60px 0' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#00BFFF', animation: 'spin 0.8s linear infinite' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : null}
        {loading ? null : filtered.map(post => {
          const badge = TYPE_BADGE[post.type] || TYPE_BADGE.question;
          const isTop = topPostId === post.id;
          return (
            <div key={post.id} style={{ position: 'relative', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: 20, marginBottom: 12, marginTop: isTop ? 24 : 0 }}>

              {isTop ? (
                <div style={{ position: 'absolute', top: 12, right: 12, left: 'auto', transform: 'none', background: 'linear-gradient(135deg, #FFD700, #D4AF37, #FFA500)', borderRadius: 20, padding: '4px 14px', display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 2px 12px rgba(212,175,55,0.6)', zIndex: 10, whiteSpace: 'nowrap' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#7B3F00">
                    <path d="M2 19h20v2H2v-2zm2-3l3-9 5 4 5-4 3 9H4zm8-5.5L9 12l3-8 3 8-3-1.5z"/>
                  </svg>
                  <span style={{ color: '#7B3F00', fontSize: 11, fontWeight: 800, letterSpacing: '0.05em' }}>共感ランキング 1位</span>
                </div>
              ) : null}

              <span style={{ fontSize: 11, fontWeight: 600, borderRadius: 20, padding: '3px 10px', background: badge.background, color: badge.color }}>
                {badge.label}
              </span>

              <p style={{ color: '#ffffff', fontSize: 16, fontWeight: 700, marginTop: 8, marginBottom: 6 }}>{post.title}</p>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, lineHeight: 1.6, margin: 0 }}>{post.summary}</p>

              <p style={{ color: '#94a3b8', fontSize: 12, marginTop: 8, marginBottom: 0 }}>
                {post.tags.map(t => `#${t}`).join(' ')}
              </p>
              <div style={{ display: 'flex', gap: 16, marginTop: 8, marginBottom: 12 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>
                  <ThumbsUp size={12} /> {post.likes || 0}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>
                  <MessageCircle size={12} /> {post.comments || 0}
                </span>
              </div>

              {/* CTAボタン群 */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                {ACTION_BTNS.map(({ Icon, label, href }) => {
                  const isLike = label === '私も同じでした';
                  const liked = isLike ? likedPosts.has(post.id) : false;
                  return (
                    <button
                      key={label}
                      onClick={isLike ? () => { if (!likedPosts.has(post.id)) { setLikedPosts(prev => new Set([...prev, post.id])); } } : href ? () => { window.location.href = href; } : undefined}
                      style={{ background: liked ? 'rgba(212,175,55,0.2)' : 'rgba(255,255,255,0.06)', border: liked ? '1px solid rgba(212,175,55,0.6)' : '1px solid rgba(255,255,255,0.12)', borderRadius: 20, padding: '6px 12px', color: liked ? '#D4AF37' : 'rgba(255,255,255,0.7)', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 4 }}
                    >
                      <Icon size={13} />{label}
                    </button>
                  );
                })}
              </div>

              {activeTab === 'question' ? (
                <button
                  onClick={() => setAdviceModal(post.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.4)', borderRadius: 20, padding: '6px 12px', color: '#D4AF37', fontSize: 12, cursor: 'pointer', marginBottom: 8, fontFamily: 'inherit' }}
                >
                  <Users size={13} /> アドバイスする
                </button>
              ) : (
                <button
                  onClick={() => setAdviceModal(post.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 20, padding: '6px 12px', color: 'rgba(255,255,255,0.7)', fontSize: 12, cursor: 'pointer', marginBottom: 8, fontFamily: 'inherit' }}
                >
                  <MessageSquare size={13} /> コメントする
                </button>
              )}

              <button
                onClick={() => { window.location.href = '/'; }}
                style={{ width: '100%', background: 'rgba(0,191,255,0.08)', border: '1px solid rgba(0,191,255,0.3)', color: '#00BFFF', borderRadius: 12, padding: '10px', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
              >
                <MessageCircle size={14} />似た悩みをAIに相談
              </button>
            </div>
          );
        })}
        </div>

      {adviceModal !== null ? (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#0d1f3c', borderRadius: 16, padding: 24, width: '90%', maxWidth: 480 }}>
            <h3 style={{ color: '#ffffff', fontSize: 18, fontWeight: 700, marginTop: 0, marginBottom: 8 }}>{activeTab === 'question' ? 'アドバイスを送る' : 'コメントを送る'}</h3>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, marginTop: 0, marginBottom: 12 }}>※URL・電話番号・メールアドレス・長文（200文字超）を含む投稿は送信できません</p>
            <textarea
              rows={4}
              placeholder={activeTab === 'question' ? '同じ悩みの方へのアドバイスをどうぞ（200文字以内）' : 'この体験談へのコメントをどうぞ（200文字以内）'}
              value={adviceText}
              onChange={e => setAdviceText(e.target.value)}
              style={{ fontSize: 16, width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8, color: '#fff', padding: 12, boxSizing: 'border-box', fontFamily: 'inherit', resize: 'vertical', outline: 'none' }}
            />
            <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
              <button
                onClick={() => { setAdviceModal(null); setAdviceText(''); }}
                style={{ flex: 1, background: 'transparent', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8, padding: '10px 24px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14 }}
              >
                キャンセル
              </button>
              <button
                onClick={handleAdviceSubmit}
                style={{ flex: 1, background: '#D4AF37', color: '#0A1628', border: 'none', borderRadius: 8, padding: '10px 24px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', fontSize: 14 }}
              >
                送信する
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
