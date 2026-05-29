import { motion } from 'motion/react';
import { Bot, GitCompare, TrendingUp } from 'lucide-react';

export function AIComparisonCTA({ title = 'あなたの場合も分析できます', onConsult }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      style={{ marginTop: '16px', padding: '16px', background: 'linear-gradient(135deg, rgba(10,22,40,0.05), rgba(26,42,66,0.05))', borderRadius: '14px', border: '1px solid rgba(10,22,40,0.1)', position: 'relative', overflow: 'hidden' }}
    >
      <motion.div
        animate={{ x: ['-100%', '100%'] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, transparent, rgba(212,175,55,0.06), transparent)' }}
      />
      <div style={{ position: 'relative' }}>
        <p style={{ fontSize: '13px', fontWeight: 800, color: '#0a1628', textAlign: 'center', margin: '0 0 4px' }}>{title}</p>
        <p style={{ fontSize: '11px', color: 'rgba(10,22,40,0.6)', textAlign: 'center', marginBottom: '12px', lineHeight: 1.6 }}>年収・家族構成・エリア・ローン状況をAIが整理します</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onConsult}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', padding: '10px 8px', background: 'white', borderRadius: '10px', border: '1px solid rgba(10,22,40,0.15)', cursor: 'pointer' }}
          >
            <Bot size={16} color="#0a1628" />
            <span style={{ fontSize: '10px', fontWeight: 600, color: '#0a1628' }}>私の場合を相談</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', padding: '10px 8px', background: 'white', borderRadius: '10px', border: '1px solid rgba(10,22,40,0.15)', cursor: 'pointer' }}
          >
            <GitCompare size={16} color="#0a1628" />
            <span style={{ fontSize: '10px', fontWeight: 600, color: '#0a1628' }}>条件を比較</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onConsult}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', padding: '10px 8px', background: 'linear-gradient(135deg, #D4AF37, #F0D97F)', borderRadius: '10px', border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(212,175,55,0.3)' }}
          >
            <TrendingUp size={16} color="#0a1628" />
            <span style={{ fontSize: '10px', fontWeight: 800, color: '#0a1628' }}>AI診断スタート</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
