import { useState } from 'react';
import { ChevronLeft, ThumbsUp, Lightbulb, Bot, Bookmark, MessageCircle } from 'lucide-react';

const DUMMY_POSTS = [
  { id: 1, type: 'success', title: 'リフォーム成功の秘訣は綿密な打ち合わせ', summary: '業者との丁寧なコミュニケーションが成功のカギでした。', tags: ['リフォーム', '成功談'], likes: 248, comments: 32 },
  { id: 2, type: 'failure', title: '住宅ローン審査で焦った話', summary: '複数の金融機関に相談することで解決できました。', tags: ['住宅ローン', '失敗談'], likes: 312, comments: 45 },
  { id: 3, type: 'question', title: '注文住宅か建売か、選択に迷う段階', summary: '実際に物件を見始めることで具体的な検討が進みました。', tags: ['住宅購入', '注文住宅'], likes: 189, comments: 28 },
  { id: 4, type: 'success', title: '複数社査定で300万円UP', summary: '最初の業者の査定額で売ろうとしていましたが、複数社に依頼したら300万も高く売れました。', tags: ['売却', '査定'], likes: 423, comments: 56 },
  { id: 5, type: 'failure', title: '利回りだけ見て失敗しました', summary: '高利回り物件に飛びついたら修繕費や空室リスクで実質利回りが大幅ダウン。', tags: ['投資', '失敗談'], likes: 312, comments: 45 },
  { id: 6, type: 'question', title: '空き家の相続、どうすれば？', summary: '専門家への早めの相談が重要だとわかりました。', tags: ['空き家', '相続'], likes: 156, comments: 19 },
];

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

  const filtered = DUMMY_POSTS.filter(p => p.type === activeTab);

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
        {filtered.map(post => {
          const badge = TYPE_BADGE[post.type] || TYPE_BADGE.question;
          return (
            <div key={post.id} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: 20, marginBottom: 12 }}>

              <span style={{ fontSize: 11, fontWeight: 600, borderRadius: 20, padding: '3px 10px', background: badge.background, color: badge.color }}>
                {badge.label}
              </span>

              <p style={{ color: '#ffffff', fontSize: 16, fontWeight: 700, marginTop: 8, marginBottom: 6 }}>{post.title}</p>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, lineHeight: 1.6, margin: 0 }}>{post.summary}</p>

              <p style={{ color: '#94a3b8', fontSize: 12, marginTop: 8, marginBottom: 12 }}>
                {post.tags.map(t => `#${t}`).join(' ')}
              </p>

              {/* CTAボタン群 */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                {ACTION_BTNS.map(({ Icon, label, href }) => (
                  <button
                    key={label}
                    onClick={href ? () => { window.location.href = href; } : undefined}
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 20, padding: '6px 12px', color: 'rgba(255,255,255,0.7)', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 4 }}
                  >
                    <Icon size={13} />{label}
                  </button>
                ))}
              </div>

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
    </div>
  );
}
