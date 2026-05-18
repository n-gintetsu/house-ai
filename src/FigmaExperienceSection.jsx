import { ArrowRight, ChevronLeft, ChevronRight, Heart, MessageCircle, Sparkles, AlertCircle, CheckCircle, Bot, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';
import { useState, useRef } from 'react';
import { LiveTag } from './LiveTag';
import { AIComment } from './AIComment';
import { SocialComments } from './SocialComments';

const experiences = [
  { id: '1', userAge: '30代女性', category: '賃貸', status: 'regret', title: '焦って契約して後悔しました', excerpt: '内見1回だけで即決してしまい、後から騒音問題や設備の不具合に気づきました。もっと時間をかけて比較検討すればよかったです。', aiSummary: '契約前に周辺環境・管理費・修繕積立金を比較すると防げるケースです。最低3物件は比較し、時間帯を変えて内見することをおすすめします。', aiComment: 'このケースでは比較不足が原因でした。複数物件の比較と、時間帯を変えた内見が重要です。', likes: 248, comments: 32, liveTag: 'trending' },
  { id: '2', userAge: '40代男性', category: '投資', status: 'regret', title: '利回りだけ見て失敗しました', excerpt: '高利回り物件に飛びついたら、修繕費や空室リスクで実質利回りが大幅ダウン。キャッシュフローが想定の半分以下になってしまいました。', aiSummary: '表面利回りだけでなく、実質利回り、空室率、修繕積立金の推移を確認することが重要です。築年数と将来の大規模修繕計画も必ずチェックしましょう。', likes: 312, comments: 45 },
  { id: '3', userAge: '20代女性', category: '購入', status: 'ai-used', title: 'AI相談でかなり楽になった', excerpt: '初めての住宅購入で不安だらけでしたが、AIが質問を整理してくれて、本当に聞くべきことが明確になりました。', aiSummary: 'AIは情報の整理と質問の優先順位付けに有効です。専門用語の理解や、複数物件の比較表作成などでも活用できます。', aiComment: 'AI相談は初心者の方に特に効果的です。疑問点の整理と優先順位付けができます。', likes: 567, comments: 78, liveTag: 'ai-recommended' },
  { id: '4', userAge: '50代男性', category: '売却', status: 'success', title: '複数社査定で300万円UP', excerpt: '最初の業者の査定額で売ろうとしていましたが、複数社に依頼したら300万円も高く売れました。', aiSummary: '売却時は最低3社の査定比較が基本です。各社の査定根拠を聞き、市場相場と照らし合わせることで適正価格が見えてきます。', likes: 423, comments: 56, liveTag: 'popular' },
  { id: '5', userAge: '30代男性', category: '賃貸', status: 'resolved', title: '営業マン任せにして失敗', excerpt: '言われるがままに契約したら、不要なオプションがたくさん。後から交渉して外してもらいましたが、最初から確認すべきでした。', aiSummary: '初期費用の内訳は全て確認し、不要な項目は削除交渉が可能です。仲介手数料、消臭・消毒費用、鍵交換費用などは交渉の余地があります。', likes: 289, comments: 41 },
];

const statusConfig = {
  regret:   { label: '学び',   icon: AlertCircle,  bg: 'rgba(59,130,246,0.1)',  text: '#2563eb', border: 'rgba(59,130,246,0.3)' },
  success:  { label: '成功談', icon: TrendingUp,   bg: 'rgba(16,185,129,0.1)', text: '#059669', border: 'rgba(16,185,129,0.3)' },
  'ai-used':{ label: 'AI活用', icon: Bot,           bg: 'rgba(168,85,247,0.1)', text: '#9333ea', border: 'rgba(168,85,247,0.3)' },
  resolved: { label: '解決済', icon: CheckCircle,  bg: 'rgba(245,158,11,0.1)', text: '#d97706', border: 'rgba(245,158,11,0.3)' },
};

function ExperienceCard({ experience, onConsult }) {
  const [liked, setLiked] = useState(false);
  const cfg = statusConfig[experience.status] || statusConfig.regret;
  const StatusIcon = cfg.icon;

  return (
    <div className="exp-card" style={{ position: 'relative', flexShrink: 0, width: '360px' }}>
      <div
        style={{ background: 'white', borderRadius: '20px', border: '1px solid #E2E8F0', overflow: 'hidden', transition: 'all 0.4s ease', cursor: 'pointer' }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-16px)'; e.currentTarget.style.boxShadow = '0 24px 72px -18px rgba(10,22,40,0.35)'; e.currentTarget.style.borderColor = 'rgba(212,175,55,0.6)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = '#E2E8F0'; }}
      >
        {experience.liveTag ? (
          <div style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 10 }}>
            <LiveTag type={experience.liveTag} />
          </div>
        ) : null}

        <div style={{ padding: '20px', borderBottom: '1px solid #F1F5F9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg, #0a1628, #1a2a42)', display: 'grid', placeItems: 'center', color: 'white', fontWeight: 700, fontSize: '14px', flexShrink: 0 }}>
              {experience.userAge[0]}
            </div>
            <div>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>{experience.userAge}</span>
              <span style={{ fontSize: '12px', color: '#9CA3AF', margin: '0 6px' }}>・</span>
              <span style={{ fontSize: '13px', color: '#6B7280' }}>{experience.category}</span>
            </div>
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 12px', borderRadius: '999px', background: cfg.bg, border: `1px solid ${cfg.border}` }}>
            <StatusIcon size={13} style={{ color: cfg.text }} />
            <span style={{ fontSize: '11px', fontWeight: 700, color: cfg.text }}>{cfg.label}</span>
          </div>
        </div>

        <div style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#111827', marginBottom: '10px', lineHeight: 1.5 }}>{experience.title}</h3>
          <p style={{ fontSize: '13px', color: '#6B7280', lineHeight: 1.8, margin: 0 }}>{experience.excerpt}</p>
        </div>

        <div style={{ margin: '0 20px 20px', position: 'relative' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', background: 'linear-gradient(to bottom, #D4AF37, #F0D97F)', borderRadius: '999px', boxShadow: '0 0 12px rgba(212,175,55,0.6)' }} />
          <div style={{ paddingLeft: '20px', paddingTop: '16px', paddingBottom: '16px', paddingRight: '16px', background: 'linear-gradient(135deg, rgba(10,22,40,0.06), rgba(10,22,40,0.04))', borderRadius: '14px', border: '1px solid rgba(10,22,40,0.12)' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, #D4AF37, #F0D97F)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                <Sparkles size={14} color="#0a1628" />
              </div>
              <div>
                <div style={{ fontSize: '10px', fontWeight: 800, color: '#D4AF37', marginBottom: '5px', letterSpacing: '0.08em' }}>AIまとめ</div>
                <p style={{ fontSize: '12px', color: 'rgba(10,22,40,0.85)', lineHeight: 1.7, margin: 0, fontWeight: 500 }}>{experience.aiSummary}</p>
              </div>
            </div>
          </div>
        </div>

        <div style={{ padding: '0 20px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '20px' }}>
            <button onClick={() => setLiked(!liked)} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: liked ? '#ef4444' : '#9CA3AF', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
              <Heart size={16} fill={liked ? '#ef4444' : 'none'} />
              {experience.likes + (liked ? 1 : 0)}
            </button>
            <button style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#9CA3AF', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
              <MessageCircle size={16} />
              {experience.comments}
            </button>
          </div>
          <button style={{ padding: '7px 16px', background: 'linear-gradient(135deg, #0a1628, #1a2a42)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
            詳細を見る
          </button>
        </div>

        {experience.aiComment ? (
          <div style={{ padding: '0 20px' }}>
            <AIComment comment={experience.aiComment} />
          </div>
        ) : null}

        <div style={{ padding: '0 20px' }}>
          <SocialComments />
        </div>

        <div style={{ padding: '12px 20px 16px', borderTop: '1px solid #F1F5F9' }}>
          <button onClick={onConsult} style={{ width: '100%', padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '12px', fontWeight: 700, color: 'rgba(10,22,40,0.7)', background: 'linear-gradient(135deg, rgba(10,22,40,0.04), rgba(26,42,66,0.04))', border: '1px solid rgba(10,22,40,0.1)', borderRadius: '10px', cursor: 'pointer' }}>
            <Bot size={14} />
            似た悩みをAIに相談
          </button>
        </div>
      </div>
    </div>
  );
}

export function FigmaExperienceSection({ onTabChange }) {
  const scrollRef = useRef(null);
  const scroll = (dir) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir === 'left' ? -400 : 400, behavior: 'smooth' });
    }
  };

  return (
    <section style={{ position: 'relative', padding: '80px 0', background: 'linear-gradient(to bottom, white, rgba(249,250,251,0.4), white)', overflow: 'hidden' }}>
      <motion.div animate={{ x: [0, 30, 0], opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 18, repeat: Infinity }} style={{ position: 'absolute', top: '80px', left: 0, width: '384px', height: '384px', background: 'linear-gradient(to right, rgba(10,22,40,0.04), transparent)', borderRadius: '50%', filter: 'blur(48px)' }} />
      <motion.div animate={{ x: [0, -30, 0], opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 22, repeat: Infinity }} style={{ position: 'absolute', bottom: '80px', right: 0, width: '384px', height: '384px', background: 'linear-gradient(to left, rgba(212,175,55,0.04), transparent)', borderRadius: '50%', filter: 'blur(48px)' }} />

      <div style={{ position: 'relative', maxWidth: '1080px', margin: '0 auto', padding: '0 20px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '32px' }}>
          <div>
            <h2 style={{ fontSize: 'clamp(22px,2.5vw,30px)', fontWeight: 900, color: '#0a1628', margin: '0 0 6px' }}>みんなの不動産体験談</h2>
            <p style={{ fontSize: '13px', color: '#6B7280', margin: 0 }}>失敗談・成功談をAIと一緒に整理します</p>
          </div>
          <button onClick={() => onTabChange('community')} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: 700, color: '#0a1628', background: 'none', border: 'none', cursor: 'pointer' }}>
            すべて見る <ArrowRight size={16} />
          </button>
        </div>

        <div style={{ position: 'relative' }}>
          <button onClick={() => scroll('left')} style={{ position: 'absolute', left: '-16px', top: '50%', transform: 'translateY(-50%)', zIndex: 10, width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'white', border: '1px solid #E2E8F0', borderRadius: '50%', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', cursor: 'pointer' }}>
            <ChevronLeft size={20} />
          </button>
          <button onClick={() => scroll('right')} style={{ position: 'absolute', right: '-16px', top: '50%', transform: 'translateY(-50%)', zIndex: 10, width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'white', border: '1px solid #E2E8F0', borderRadius: '50%', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', cursor: 'pointer' }}>
            <ChevronRight size={20} />
          </button>
          <div ref={scrollRef} style={{ display: 'flex', gap: '24px', overflowX: 'auto', paddingBottom: '16px', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {experiences.map(exp => (
              <ExperienceCard key={exp.id} experience={exp} onConsult={() => onTabChange('chat')} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
