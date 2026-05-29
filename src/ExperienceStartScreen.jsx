import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, AlertTriangle, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const HOVER_STYLES = [
  { background: 'rgba(212,175,55,0.1)',  border: '1px solid rgba(212,175,55,0.5)',  boxShadow: 'inset 0 1px 0 rgba(212,175,55,0.2), 0 4px 20px rgba(212,175,55,0.2)'  },
  { background: 'rgba(0,191,255,0.1)',   border: '1px solid rgba(0,191,255,0.5)',   boxShadow: 'inset 0 1px 0 rgba(0,191,255,0.2), 0 4px 20px rgba(0,191,255,0.2)'   },
  { background: 'rgba(139,92,246,0.1)',  border: '1px solid rgba(139,92,246,0.5)', boxShadow: 'inset 0 1px 0 rgba(139,92,246,0.2), 0 4px 20px rgba(139,92,246,0.2)' },
];

export default function ExperienceStartScreen() {
  const navigate = useNavigate();
  const [hoverIndex, setHoverIndex] = useState(null);

  const cards = [
    { icon: Sparkles, title: '成功談を書く', emoji: '✨', gradient: 'from-[#D4AF37] to-[#FFD700]', type: 'success' },
    { icon: AlertTriangle, title: '失敗談を書く', emoji: '⚠️', gradient: 'from-[#00D4FF] to-[#0099CC]', type: 'failure' },
    { icon: HelpCircle, title: '質問する', emoji: '❓', gradient: 'from-[#8B5CF6] to-[#6D28D9]', type: 'question' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#0A1628', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, opacity: 0.2 }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(0,212,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.1) 1px, transparent 1px)', backgroundSize: '50px 50px' }} />
      </div>
      <div style={{ position: 'absolute', top: 80, left: 80, width: 384, height: 384, background: '#00D4FF', borderRadius: '50%', opacity: 0.2, filter: 'blur(100px)' }} />
      <div style={{ position: 'absolute', bottom: 80, right: 80, width: 384, height: 384, background: '#D4AF37', borderRadius: '50%', opacity: 0.1, filter: 'blur(100px)' }} />
      <div style={{ position: 'relative', zIndex: 10, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 16px' }}>
        <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} style={{ textAlign: 'center', marginBottom: 64 }}>
          <h1 style={{ fontSize: '3rem', fontWeight: 700, lineHeight: 1.2, marginBottom: 24, color: '#00D4FF' }}>
            AI体験談アシスタント
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.125rem', maxWidth: 480, margin: '0 auto' }}>
            あなたの経験をAIが整理し、<br />同じ悩みを持つ人へ届けます。
          </p>
        </motion.div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32, maxWidth: 900, width: '100%' }}>
          {cards.map((card, index) => (
            <motion.button
              key={card.type}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -10 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/experiences/interview', { state: { type: card.type } })}
              onMouseEnter={() => setHoverIndex(index)}
              onMouseLeave={() => setHoverIndex(null)}
              style={{ position: 'relative', padding: 32, borderRadius: 16, cursor: 'pointer', transition: 'all 0.2s ease', background: hoverIndex === index ? HOVER_STYLES[index].background : 'rgba(255,255,255,0.06)', border: hoverIndex === index ? HOVER_STYLES[index].border : '1px solid rgba(255,255,255,0.12)', boxShadow: hoverIndex === index ? HOVER_STYLES[index].boxShadow : 'inset 0 1px 0 rgba(255,255,255,0.1), 0 4px 16px rgba(0,0,0,0.3)' }}
            >
              <div style={{ position: 'relative', zIndex: 10 }}>
                <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'center' }}>
                  <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, #D4AF37, #FFD700)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '2.5rem' }}>{card.emoji}</span>
                  </div>
                </div>
                <h3 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 600, textAlign: 'center' }}>{card.title}</h3>
              </div>
            </motion.button>
          ))}
        </div>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.5 }} style={{ color: 'rgba(255,255,255,0.4)', marginTop: 64, fontSize: '0.875rem' }}>
          Powered by House-AI
        </motion.p>
      </div>
    </div>
  );
}
