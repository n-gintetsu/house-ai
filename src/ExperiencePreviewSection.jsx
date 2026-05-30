import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';

const DUMMY = [
  { id: 1, title: '注文住宅か建売か、選択に迷う段階', summary: '実際に物件を見始めることで具体的な検討が進みました。', tags: ['#住宅購入', '#注文住宅'], type: 'question' },
  { id: 2, title: 'リフォーム成功の秘訣は綿密な打ち合わせ', summary: '業者との丁寧なコミュニケーションが成功のカギでした。', tags: ['#リフォーム', '#成功談'], type: 'success' },
  { id: 3, title: '住宅ローン審査で焦った話', summary: '複数の金融機関に相談することで解決できました。', tags: ['#住宅ローン', '#失敗談'], type: 'failure' },
  { id: 4, title: '空き家の相続、どうすれば？', summary: '専門家への早めの相談が重要だとわかりました。', tags: ['#空き家', '#相続'], type: 'question' },
];

const TYPE_BADGE = {
  success:  { label: '成功談', background: '#dcfce7', color: '#16a34a' },
  failure:  { label: '失敗談', background: '#fee2e2', color: '#dc2626' },
  question: { label: '質問',   background: '#dbeafe', color: '#2563eb' },
};

export default function ExperiencePreviewSection({ onNavigate }) {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    supabase
      .from('experience_posts')
      .select('id, title, summary, tags, type')
      .order('created_at', { ascending: false })
      .limit(4)
      .then(({ data, error }) => {
        if (error || !data || data.length === 0) {
          setPosts(DUMMY);
        } else {
          setPosts(data);
        }
      })
      .catch(() => setPosts(DUMMY));
  }, []);

  const displayPosts = posts.length > 0 ? posts : DUMMY;

  return (
    <section style={{ background: 'white', padding: '48px 16px' }}>
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1a3a5c', marginBottom: 8, marginTop: 0 }}>みんなの体験談</h2>
        <p style={{ fontSize: 14, color: '#64748b', marginBottom: 24, marginTop: 0 }}>似た悩みや成功体験から学ぼう</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
          {displayPosts.map((post) => {
            const badge = TYPE_BADGE[post.type] || TYPE_BADGE.question;
            const tags = Array.isArray(post.tags) ? post.tags : [];
            return (
              <div
                key={post.id}
                onClick={() => onNavigate('experiences')}
                style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: 16, cursor: 'pointer' }}
              >
                <span style={{ fontSize: 11, borderRadius: 20, padding: '2px 8px', background: badge.background, color: badge.color, fontWeight: 600 }}>
                  {badge.label}
                </span>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#1a3a5c', marginTop: 8, marginBottom: 4 }}>{post.title}</p>
                <p style={{ fontSize: 12, color: '#64748b', lineHeight: 1.5, margin: 0 }}>{post.summary}</p>
                <p style={{ fontSize: 11, color: '#3b82f6', marginTop: 8, marginBottom: 0 }}>{tags.join(' ')}</p>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <button
            onClick={() => onNavigate('experiences')}
            style={{ color: '#1a3a5c', border: '1px solid #1a3a5c', borderRadius: 8, padding: '10px 24px', background: 'white', cursor: 'pointer', fontSize: 14, fontFamily: 'inherit' }}
          >
            体験談をもっと見る
          </button>
        </div>
      </div>
    </section>
  );
}
