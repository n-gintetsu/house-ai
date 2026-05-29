import { motion } from 'motion/react';
import { MessageCircle, Bookmark, ThumbsUp } from 'lucide-react';

const comments = [
  { text: '私も同じでした', icon: ThumbsUp, color: '#3b82f6' },
  { text: '参考になった', icon: MessageCircle, color: '#10b981' },
  { text: 'AI相談して解決', icon: MessageCircle, color: '#9333ea' },
  { text: '保存しました', icon: Bookmark, color: '#f97316' },
];

export function SocialComments() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
      {comments.map((c, i) => {
        const Icon = c.icon;
        return (
          <motion.div key={i} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }} whileHover={{ scale: 1.05 }} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: '#F1F5F9', borderRadius: '999px', border: '1px solid #E2E8F0', cursor: 'pointer' }}>
            <Icon size={12} style={{ color: c.color }} />
            <span style={{ fontSize: '11px', color: '#374151', fontWeight: 600 }}>{c.text}</span>
          </motion.div>
        );
      })}
    </div>
  );
}
