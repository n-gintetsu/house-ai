import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';

export function AIComment({ comment }) {
  const [isTyping, setIsTyping] = useState(true);
  const [displayed, setDisplayed] = useState('');

  useEffect(() => {
    setIsTyping(true);
    setDisplayed('');
    const t = setTimeout(() => {
      setIsTyping(false);
      let i = 0;
      const iv = setInterval(() => {
        if (i < comment.length) {
          setDisplayed(comment.slice(0, i + 1));
          i++;
        } else { clearInterval(iv); }
      }, 20);
    }, 800);
    return () => clearTimeout(t);
  }, [comment]);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ position: 'relative', marginTop: '12px' }}>
      <motion.div
        animate={{ opacity: [0.6, 1, 0.6], boxShadow: ['0 0 8px rgba(212,175,55,0.4)', '0 0 16px rgba(212,175,55,0.7)', '0 0 8px rgba(212,175,55,0.4)'] }}
        transition={{ duration: 3, repeat: Infinity }}
        style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', background: 'linear-gradient(to bottom, #D4AF37, #F0D97F, #D4AF37)', borderRadius: '999px' }}
      />
      <div style={{ paddingLeft: '20px', paddingTop: '14px', paddingBottom: '14px', paddingRight: '14px', background: 'linear-gradient(135deg, rgba(212,175,55,0.08), rgba(212,175,55,0.12), rgba(240,217,127,0.08))', borderRadius: '12px', border: '1px solid rgba(212,175,55,0.3)' }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
          <motion.div animate={{ rotate: isTyping ? [0, 360] : [0, 5, -5, 0] }} transition={{ duration: isTyping ? 1 : 2, repeat: Infinity }} style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'linear-gradient(135deg, #D4AF37, #F0D97F)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
            <Sparkles size={14} color="#0a1628" />
          </motion.div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#D4AF37', marginBottom: '4px' }}>{isTyping ? 'AIコメント生成中...' : 'AIコメント'}</div>
            {isTyping ? (
              <div style={{ display: 'flex', gap: '4px' }}>
                {[0, 1, 2].map(i => (
                  <motion.div key={i} animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }} style={{ width: '6px', height: '6px', background: 'rgba(10,22,40,0.6)', borderRadius: '50%' }} />
                ))}
              </div>
            ) : (
              <p style={{ fontSize: '12px', color: 'rgba(10,22,40,0.9)', lineHeight: 1.7, fontWeight: 500, margin: 0 }}>{displayed}</p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
