import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Search, Building2, MessageSquare } from 'lucide-react';
import { useState, useEffect } from 'react';

const features = [
  { icon: Sparkles, title: 'AI比較', description: 'AIが最適サービスを比較', hoverBorder: 'rgba(139,92,246,0.5)', hoverShadow: '0 8px 24px rgba(139,92,246,0.15)', iconBg: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' },
  { icon: Search, title: '条件整理', description: '価格・審査・実績を整理', hoverBorder: 'rgba(59,130,246,0.5)', hoverShadow: '0 8px 24px rgba(59,130,246,0.15)', iconBg: 'linear-gradient(135deg, #3b82f6, #2563eb)' },
  { icon: Building2, title: '提携企業', description: '提携企業をAIおすすめ順表示', hoverBorder: 'rgba(16,185,129,0.5)', hoverShadow: '0 8px 24px rgba(16,185,129,0.15)', iconBg: 'linear-gradient(135deg, #10b981, #059669)' },
  { icon: MessageSquare, title: '即相談', description: 'そのままAI相談可能', hoverBorder: 'rgba(245,158,11,0.5)', hoverShadow: '0 8px 24px rgba(245,158,11,0.15)', iconBg: 'linear-gradient(135deg, #f59e0b, #d97706)' },
];

const tickerMessages = ['AI相談が増えています', '住宅ローン比較完了', '引越し費用比較中', '火災保険を整理中'];

export default function PartnerServiceContents({ onOpenModal }) {
  const [currentTicker, setCurrentTicker] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => setCurrentTicker(p => (p + 1) % tickerMessages.length), 3000);
    return () => clearInterval(iv);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <motion.h2
          style={{ fontSize: 'clamp(24px,3vw,36px)', fontWeight: 700, lineHeight: 1.4, marginBottom: '12px', background: 'linear-gradient(135deg, #111827, #1e3a5f, #7c3aed, #2563eb, #111827)', backgroundSize: '300% 300%', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
          animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        >
          AIが比較・整理して<br />あなた向けに提案します
        </motion.h2>
        <p style={{ color: '#4B5563', lineHeight: 1.8 }}>価格だけではなく、<br />条件・相性・リスク・実績まで<br />AIが整理して比較できます。</p>
      </motion.div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {features.map((feature, idx) => {
          const Icon = feature.icon;
          return (
            <motion.div key={feature.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + idx * 0.1 }} style={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(8px)', borderRadius: '16px', padding: '20px', border: '1px solid rgba(209,213,219,0.5)', cursor: 'pointer', transition: 'all 0.25s ease' }} onMouseEnter={e => { e.currentTarget.style.borderColor = feature.hoverBorder; e.currentTarget.style.boxShadow = feature.hoverShadow; e.currentTarget.style.transform = 'scale(1.02)'; }} onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(209,213,219,0.5)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: feature.iconBg, display: 'grid', placeItems: 'center', marginBottom: '12px' }}>
                <Icon size={20} color="white" />
              </div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#111827', marginBottom: '4px' }}>{feature.title}</h3>
              <p style={{ fontSize: '13px', color: '#6B7280' }}>{feature.description}</p>
            </motion.div>
          );
        })}
      </div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <button onClick={onOpenModal} style={{ position: 'relative', width: '100%', height: '58px', borderRadius: '20px', overflow: 'hidden', border: 'none', cursor: 'pointer', transition: 'transform 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #b8860b, #D4AF37, #f0c040, #D4AF37, #b8860b)', backgroundSize: '300% 300%' }} />
          <motion.div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.3), transparent)' }} animate={{ x: ['-100%', '200%'] }} transition={{ duration: 2, repeat: Infinity }} />
          <span style={{ position: 'relative', zIndex: 1, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '8px', fontWeight: 700, fontSize: '15px' }}>
            <Sparkles size={18} /> AI比較を始める
          </span>
        </button>
        <button onClick={onOpenModal} style={{ position: 'relative', width: '100%', height: '58px', borderRadius: '20px', overflow: 'hidden', border: '1px solid rgba(96,165,250,0.3)', cursor: 'pointer', background: 'linear-gradient(to right, rgba(23,37,84,0.8), rgba(30,58,138,0.8))', backdropFilter: 'blur(4px)', color: 'rgba(219,234,254,0.9)', fontWeight: 600, fontSize: '15px', transition: 'transform 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
          便利ツールを見る
        </button>
      </motion.div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }} style={{ background: 'linear-gradient(to right, #eff6ff, #f5f3ff)', borderRadius: '12px', padding: '16px', border: '1px solid rgba(196,221,255,0.5)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <motion.div style={{ width: '8px', height: '8px', background: 'linear-gradient(to right, #3b82f6, #9333ea)', borderRadius: '50%', flexShrink: 0 }} animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }} />
          <AnimatePresence mode="wait">
            <motion.div key={currentTicker} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} style={{ fontSize: '14px', color: '#374151' }}>
              {tickerMessages[currentTicker]}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
