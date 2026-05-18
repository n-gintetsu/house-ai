import { ChevronLeft, ChevronRight, Sparkles, Bot, Newspaper } from 'lucide-react';
import { motion } from 'motion/react';
import { useRef } from 'react';
import { LiveTag } from './LiveTag';
import { AIAnalyzing } from './AIAnalyzing';
import { AIComparisonCTA } from './AIComparisonCTA';

const tagConfig = {
  'interest-rate': { label: '金利',     bg: '#ef4444' },
  subsidy:         { label: '補助金',   bg: '#22c55e' },
  tax:             { label: '税金',     bg: '#3b82f6' },
  investment:      { label: '投資',     bg: '#a855f7' },
  sale:            { label: '売却',     bg: '#f97316' },
  rental:          { label: '賃貸',     bg: '#06b6d4' },
  insurance:       { label: '火災保険', bg: '#ec4899' },
};

const mockNews = [
  { id: '1', tag: 'interest-rate', title: '住宅ローン金利上昇、今後どうなる？',    imageUrl: 'https://images.unsplash.com/photo-1613545325278-f24b0cae1224?w=400&q=80', aiSummary: '固定金利需要が増加傾向。借換え相談が増えています。変動金利を選んでいる方は、金利動向を定期的にチェックすることをおすすめします。', liveTag: 'trending', showComparison: true },
  { id: '2', tag: 'subsidy',       title: '2026年度 住宅補助金の最新情報',        imageUrl: 'https://images.unsplash.com/photo-1628744876497-eb30460be9f6?w=400&q=80', aiSummary: '省エネ住宅への補助金が拡充されています。申請期限は2026年12月末まで。条件を満たせば最大100万円の補助が受けられます。', liveTag: 'hot', showComparison: true },
  { id: '3', tag: 'tax',           title: '相続税対策としての不動産活用',          imageUrl: 'https://images.unsplash.com/photo-1638885930125-85350348d266?w=400&q=80', aiSummary: '現金より不動産の方が相続税評価額が低くなります。ただし、流動性リスクや管理コストも考慮が必要です。専門家への相談をおすすめします。' },
  { id: '4', tag: 'investment',    title: '首都圏の投資用マンション市場動向',      imageUrl: 'https://images.unsplash.com/photo-1613082294483-fec382d8367e?w=400&q=80', aiSummary: '都心3区の中古マンション価格は高止まり傾向。一方で郊外エリアは需要増加により利回りが改善しています。' },
  { id: '5', tag: 'insurance',     title: '火災保険料の値上げと選び方',            imageUrl: 'https://images.unsplash.com/photo-1503174971373-b1f69850bded?w=400&q=80', aiSummary: '自然災害増加により保険料が上昇傾向。補償内容を見直し、本当に必要な特約を選ぶことで保険料を抑えられます。' },
];

function NewsCard({ news, onConsult }) {
  const cfg = tagConfig[news.tag] || { label: news.tag, bg: '#6b7280' };
  return (
    <div style={{ position: 'relative', flexShrink: 0, width: '360px' }}>
      <div
        style={{ background: 'white', borderRadius: '20px', border: '1px solid #E2E8F0', overflow: 'hidden', transition: 'all 0.5s ease' }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-16px)'; e.currentTarget.style.boxShadow = '0 24px 72px -18px rgba(10,22,40,0.35)'; e.currentTarget.style.borderColor = 'rgba(212,175,55,0.6)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = '#E2E8F0'; }}
      >
        {news.liveTag ? (
          <div style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 10 }}>
            <LiveTag type={news.liveTag} />
          </div>
        ) : null}

        <div style={{ position: 'relative', height: '200px', overflow: 'hidden' }}>
          <img
            src={news.imageUrl}
            alt={news.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.7s ease' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.08)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.2) 40%, transparent 100%)' }} />
          <div style={{ position: 'absolute', top: '16px', left: '16px', padding: '5px 14px', borderRadius: '999px', background: cfg.bg, color: 'white', fontSize: '11px', fontWeight: 700 }}>{cfg.label}</div>
        </div>

        <div style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#111827', lineHeight: 1.5, marginBottom: '16px' }}>{news.title}</h3>

          <div style={{ position: 'relative', marginBottom: '16px' }}>
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', background: 'linear-gradient(to bottom, #D4AF37, #F0D97F)', borderRadius: '999px', boxShadow: '0 0 12px rgba(212,175,55,0.6)' }} />
            <div style={{ paddingLeft: '20px', paddingTop: '14px', paddingBottom: '14px', paddingRight: '14px', background: 'linear-gradient(135deg, rgba(10,22,40,0.06), rgba(10,22,40,0.04))', borderRadius: '12px', border: '1px solid rgba(10,22,40,0.12)' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, #D4AF37, #F0D97F)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  <Sparkles size={14} color="#0a1628" />
                </div>
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 800, color: '#D4AF37', marginBottom: '5px', letterSpacing: '0.08em' }}>AI要約</div>
                  <p style={{ fontSize: '12px', color: 'rgba(10,22,40,0.85)', lineHeight: 1.7, margin: 0, fontWeight: 500 }}>{news.aiSummary}</p>
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <AIAnalyzing delay={500} />
          </div>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
            <button style={{ flex: 1, padding: '11px 8px', border: '1px solid #D1D5DB', background: 'white', color: '#374151', fontSize: '11px', fontWeight: 700, borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <Sparkles size={14} /> AIに要約してもらう
            </button>
            <button onClick={onConsult} style={{ flex: 1, padding: '11px 8px', background: 'linear-gradient(135deg, #D4AF37, #F0D97F)', color: '#0a1628', fontSize: '11px', fontWeight: 800, borderRadius: '10px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', boxShadow: '0 4px 12px rgba(212,175,55,0.3)' }}>
              <Bot size={14} /> 私の場合を相談
            </button>
          </div>

          {news.showComparison ? <AIComparisonCTA onConsult={onConsult} /> : null}
        </div>
      </div>
    </div>
  );
}

export function FigmaNewsSection({ onTabChange }) {
  const scrollRef = useRef(null);
  const scroll = (dir) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir === 'left' ? -400 : 400, behavior: 'smooth' });
    }
  };

  return (
    <section style={{ position: 'relative', padding: '80px 0', background: 'linear-gradient(to bottom, white, rgba(249,250,251,0.3), white)', overflow: 'hidden' }}>
      <motion.div
        animate={{ x: [0, -40, 0], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 20, repeat: Infinity }}
        style={{ position: 'absolute', top: '80px', right: 0, width: '384px', height: '384px', background: 'linear-gradient(to left, rgba(212,175,55,0.05), transparent)', borderRadius: '50%', filter: 'blur(48px)' }}
      />
      <motion.div
        animate={{ x: [0, 40, 0], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 24, repeat: Infinity }}
        style={{ position: 'absolute', bottom: '80px', left: 0, width: '384px', height: '384px', background: 'linear-gradient(to right, rgba(10,22,40,0.05), transparent)', borderRadius: '50%', filter: 'blur(48px)' }}
      />

      <div style={{ position: 'relative', maxWidth: '1080px', margin: '0 auto', padding: '0 20px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '32px' }}>
          <div>
            <h2 style={{ fontSize: 'clamp(22px,2.5vw,30px)', fontWeight: 900, color: '#0a1628', margin: '0 0 6px' }}>不動産お得情報・最新ニュース</h2>
            <p style={{ fontSize: '13px', color: '#6B7280', margin: 0 }}>AIが重要ポイントを整理しています</p>
          </div>
          <button style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, color: '#0a1628', background: 'none', border: 'none', cursor: 'pointer' }}>
            最新情報を見る <Newspaper size={16} />
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
            {mockNews.map(news => (
              <NewsCard key={news.id} news={news} onConsult={() => onTabChange('chat')} />
            ))}
          </div>
        </div>

        <div style={{ position: 'relative', marginTop: '48px', padding: '48px 40px', background: 'linear-gradient(135deg, #0a1628, #1a2a42, #0a1628)', borderRadius: '28px', textAlign: 'center', overflow: 'hidden', boxShadow: '0 32px 80px rgba(10,22,40,0.3)' }}>
          <div style={{ position: 'absolute', top: 0, left: '25%', width: '256px', height: '256px', background: 'linear-gradient(135deg, rgba(212,175,55,0.2), transparent)', borderRadius: '50%', filter: 'blur(48px)' }} />
          <div style={{ position: 'absolute', bottom: 0, right: '25%', width: '256px', height: '256px', background: 'linear-gradient(to top left, rgba(212,175,55,0.2), transparent)', borderRadius: '50%', filter: 'blur(48px)' }} />
          <div style={{ position: 'absolute', inset: 0, borderRadius: '28px', border: '1px solid rgba(212,175,55,0.2)' }} />
          <div style={{ position: 'relative' }}>
            <h3 style={{ fontSize: 'clamp(18px,2.5vw,24px)', fontWeight: 900, color: 'white', marginBottom: '12px', lineHeight: 1.4 }}>
              難しい不動産情報も、<br />
              <span style={{ background: 'linear-gradient(to right, #D4AF37, #F0D97F, #D4AF37)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AIがあなた向けに整理します</span>
            </h3>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', marginBottom: '32px', lineHeight: 1.8 }}>
              住宅ローン・相場・税金・補助金まで、AIがわかりやすくサポートします。
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center' }}>
              <button onClick={() => onTabChange('chat')} style={{ padding: '14px 32px', background: 'linear-gradient(135deg, #D4AF37, #F0D97F, #D4AF37)', color: '#0a1628', fontWeight: 800, fontSize: '14px', borderRadius: '14px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 0 32px rgba(212,175,55,0.5)' }}>
                <Bot size={18} /> AIに相談する
              </button>
              <button style={{ padding: '14px 32px', background: 'rgba(255,255,255,0.1)', color: 'white', fontWeight: 800, fontSize: '14px', borderRadius: '14px', border: '2px solid rgba(255,255,255,0.3)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', backdropFilter: 'blur(8px)' }}>
                <Newspaper size={18} /> 最新情報を見る
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
