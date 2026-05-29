import { motion } from 'framer-motion';
import { MessageSquare, ThumbsUp, CheckCircle } from 'lucide-react';

export default function StatsCounter({ totalPosts, totalProposals, totalDeals, showStats = false }) {
  if (!showStats || totalPosts < 100) return null;
  const stats = [
    { label: '相談投稿', value: totalPosts, Icon: MessageSquare, bg: 'linear-gradient(135deg,#3b82f6,#2563eb)' },
    { label: '提案成立', value: totalProposals, Icon: ThumbsUp, bg: 'linear-gradient(135deg,#22c55e,#16a34a)' },
    { label: '成約報告', value: totalDeals, Icon: CheckCircle, bg: 'linear-gradient(135deg,#a855f7,#7c3aed)' },
  ];
  return (
    <div style={{ background: 'linear-gradient(135deg,#1a1a24,#0f0f18)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: 32, marginBottom: 32 }}>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <h3 style={{ fontSize: 20, color: '#fff', marginBottom: 8 }}>House-AI 実績</h3>
        <p style={{ fontSize: 14, color: '#9ca3af' }}>多くの方が理想の住まいと出会っています</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }}>
        {stats.map((stat, i) => {
          const Icon = stat.Icon;
          return (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} style={{ textAlign: 'center' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Icon size={32} color="#fff" />
              </div>
              <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} transition={{ delay: i * 0.1 + 0.2, type: 'spring' }} style={{ fontSize: 36, fontWeight: 700, color: '#fff', marginBottom: 8 }}>
                {stat.value.toLocaleString()}
              </motion.div>
              <div style={{ fontSize: 14, color: '#9ca3af' }}>{stat.label}</div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
