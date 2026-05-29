import { motion } from 'framer-motion';
import { TrendingUp, Eye, Sparkles, MessageSquare, Star } from 'lucide-react';

const tagConfig = {
  trending: { label: '人気急上昇', icon: TrendingUp, textColor: '#dc2626', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)', glow: '0 0 16px rgba(239,68,68,0.4)' },
  popular: { label: '閲覧増加中', icon: Eye, textColor: '#2563eb', bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.3)', glow: '0 0 16px rgba(59,130,246,0.4)' },
  'ai-recommended': { label: 'AIおすすめ', icon: Sparkles, textColor: '#D4AF37', bg: 'rgba(212,175,55,0.2)', border: 'rgba(212,175,55,0.4)', glow: '0 0 16px rgba(212,175,55,0.5)' },
  active: { label: '問い合わせ増加', icon: MessageSquare, textColor: '#059669', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)', glow: '0 0 16px rgba(16,185,129,0.4)' },
  hot: { label: 'AI注目', icon: Star, textColor: '#9333ea', bg: 'rgba(168,85,247,0.12)', border: 'rgba(168,85,247,0.3)', glow: '0 0 16px rgba(168,85,247,0.4)' },
};

export function LiveTag({ type }) {
  const config = tagConfig[type] || tagConfig.trending;
  const Icon = config.icon;
  return (
    <motion.div
      animate={{ scale: [1, 1.05, 1] }}
      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '999px', background: config.bg, border: `1px solid ${config.border}`, boxShadow: config.glow }}
    >
      <Icon size={12} style={{ color: config.textColor }} />
      <span style={{ fontSize: '11px', fontWeight: 800, color: config.textColor }}>{config.label}</span>
      <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity }} style={{ width: '6px', height: '6px', borderRadius: '50%', background: config.textColor }} />
    </motion.div>
  );
}
