import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ThumbsUp, MessageCircle, Send } from 'lucide-react';
import { supabase } from './lib/supabase';

const TYPE_BADGE = {
  success:  { label: '成功談', background: 'rgba(34,197,94,0.2)',  color: '#22c55e' },
  failure:  { label: '失敗談', background: 'rgba(239,68,68,0.2)',   color: '#ef4444' },
  question: { label: '相談',   background: 'rgba(59,130,246,0.2)',  color: '#60a5fa' },
};

export default function ExperiencePost() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loadingPost, setLoadingPost] = useState(true);
  const [loadingComments, setLoadingComments] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    supabase
      .from('experience_posts')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data, error }) => {
        if (!error && data) setPost(data);
        setLoadingPost(false);
      })
      .catch(() => setLoadingPost(false));

    supabase
      .from('experience_comments')
      .select('id, type, content, created_at')
      .eq('post_id', id)
      .order('created_at', { ascending: true })
      .then(({ data, error }) => {
        if (!error && data) setComments(data);
        setLoadingComments(false);
      })
      .catch(() => setLoadingComments(false));
  }, [id]);

  const handleSubmit = async () => {
    if (!commentText.trim() || submitting) return;
    const hasViolation = /https?:\/\/|tel:|0\d{1,4}-\d{1,4}-\d{4}|[\w.+-]+@[\w-]+\.[a-z]{2,}/i.test(commentText);
    if (hasViolation) {
      alert('URL・電話番号・メールアドレスは含められません');
      return;
    }
    if (commentText.length > 200) {
      alert('200文字以内で入力してください');
      return;
    }
    setSubmitting(true);
    const { data: inserted, error } = await supabase
      .from('experience_comments')
      .insert({ post_id: id, type: 'comment', content: commentText })
      .select()
      .single();
    if (error) {
      alert('送信に失敗しました。もう一度お試しください。');
      setSubmitting(false);
      return;
    }
    if (post) {
      await supabase
        .from('experience_posts')
        .update({ comments: (post.comments || 0) + 1 })
        .eq('id', id);
      setPost(prev => ({ ...prev, comments: (prev.comments || 0) + 1 }));
    }
    setComments(prev => [...prev, inserted]);
    setCommentText('');
    setSubmitting(false);
  };

  const badge = post ? (TYPE_BADGE[post.type] || TYPE_BADGE.question) : null;
  const isQuestion = post?.type === 'question';
  const formHeading = isQuestion ? 'アドバイスする' : 'あなたの体験談もみんなと共有しませんか？';
  const formPlaceholder = isQuestion ? 'アドバイスや経験をシェアしてください' : 'あなたの体験や想いを書いてください';

  return (
    <div style={{ minHeight: '100vh', background: '#0A1628', paddingBottom: 96 }}>

      {/* ヘッダー */}
      <div style={{ position: 'sticky', top: 0, zIndex: 20, background: '#0A1628', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={() => navigate(-1)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4, padding: 0, fontSize: 14 }}
        >
          <ChevronLeft size={20} />戻る
        </button>
      </div>

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '16px 16px 0' }}>

        {/* 投稿本文 */}
        {loadingPost ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 0' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#00BFFF', animation: 'spin 0.8s linear infinite' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : post ? (
          <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: 20, marginBottom: 24 }}>
            <span style={{ fontSize: 11, fontWeight: 600, borderRadius: 20, padding: '3px 10px', background: badge.background, color: badge.color }}>
              {badge.label}
            </span>
            <h1 style={{ color: '#ffffff', fontSize: 18, fontWeight: 700, marginTop: 10, marginBottom: 8 }}>{post.title}</h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, lineHeight: 1.7, margin: '0 0 12px' }}>{post.summary}</p>
            {Array.isArray(post.tags) && post.tags.length > 0 ? (
              <p style={{ color: '#94a3b8', fontSize: 12, margin: '0 0 12px' }}>{post.tags.map(t => `#${t}`).join(' ')}</p>
            ) : null}
            <div style={{ display: 'flex', gap: 16 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>
                <ThumbsUp size={12} /> {post.likes || 0}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>
                <MessageCircle size={12} /> {post.comments || 0}
              </span>
            </div>
          </div>
        ) : (
          <p style={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center', padding: '48px 0' }}>投稿が見つかりませんでした。</p>
        )}

        {/* コメント一覧 */}
        <h2 style={{ color: '#ffffff', fontSize: 15, fontWeight: 700, marginBottom: 12 }}>
          {isQuestion ? 'みんなのアドバイス' : 'みんなのコメント'}
        </h2>

        {loadingComments ? (
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>読み込み中...</p>
        ) : comments.length === 0 ? (
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, marginBottom: 24 }}>まだコメントはありません。最初のコメントを投稿してみましょう。</p>
        ) : (
          <div style={{ marginBottom: 24 }}>
            {comments.map(c => (
              <div key={c.id} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '12px 14px', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 10, fontWeight: 600, borderRadius: 20, padding: '2px 8px', background: c.type === 'advice' ? 'rgba(212,175,55,0.15)' : 'rgba(255,255,255,0.08)', color: c.type === 'advice' ? '#D4AF37' : 'rgba(255,255,255,0.5)' }}>
                    {c.type === 'advice' ? 'アドバイス' : 'コメント'}
                  </span>
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>
                    {new Date(c.created_at).toLocaleDateString('ja-JP')}
                  </span>
                </div>
                <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, lineHeight: 1.6, margin: 0 }}>{c.content}</p>
              </div>
            ))}
          </div>
        )}

        {/* コメント投稿フォーム */}
        <h3 style={{ color: '#ffffff', fontSize: 15, fontWeight: 500, marginBottom: 12 }}>{formHeading}</h3>
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: 16 }}>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, margin: '0 0 8px' }}>※URL・電話番号・メールアドレスを含む投稿は送信できません（200文字以内）</p>
          <textarea
            rows={4}
            placeholder={formPlaceholder}
            value={commentText}
            onChange={e => setCommentText(e.target.value)}
            style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, color: '#fff', padding: 12, fontSize: 14, fontFamily: 'inherit', resize: 'vertical', outline: 'none', boxSizing: 'border-box' }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
            <button
              onClick={handleSubmit}
              disabled={submitting || !commentText.trim()}
              style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(0,191,255,0.15)', border: '1px solid rgba(0,191,255,0.4)', borderRadius: 10, padding: '10px 20px', color: '#00BFFF', fontSize: 14, fontWeight: 600, cursor: submitting || !commentText.trim() ? 'not-allowed' : 'pointer', opacity: submitting || !commentText.trim() ? 0.5 : 1, fontFamily: 'inherit' }}
            >
              <Send size={14} />{submitting ? '送信中...' : '送信する'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
