import { motion } from 'motion/react';
import { useEffect, useState } from 'react';

const msgs = ['類似相談検索中...', '利回り分析中...', '周辺価格比較中...', '空室率を分析中...', '市場データ確認中...', 'ローン条件を整理中...'];

export function AIAnalyzing({ delay = 0 }) {
  const [current, setCurrent] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => {
      const iv = setInterval(() => setCurrent(p => (p + 1) % msgs.length), 3000);
      return () => clearInterval(iv);
    }, delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay / 1000 }}
      style={{ position: 'relative', overflow: 'hidden', borderRadius: '8px', background: 'linear-gradient(to right, rgba(10,22,40,0.05), rgba(212,175,55,0.05), rgba(10,22,40,0.05))', padding: '10px 12px', border: '1px solid rgba(10,22,40,0.1)' }}
    >
      <motion.div
        animate={{ x: ['-100%', '200%'] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
        style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, transparent, rgba(212,175,55,0.3), transparent)' }}
      />
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ display: 'flex', gap: '3px' }}>
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
              style={{ width: '5px', height: '5px', background: 'linear-gradient(to right, #D4AF37, #F0D97F)', borderRadius: '50%' }}
            />
          ))}
        </div>
        <motion.span
          key={current}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(10,22,40,0.8)' }}
        >
          {msgs[current]}
        </motion.span>
      </div>
    </motion.div>
  );
}
