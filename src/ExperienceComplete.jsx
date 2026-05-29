import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, MessageCircle, Users, Building2, UserCheck } from 'lucide-react';

export default function ExperienceComplete() {
  const navigate = useNavigate();

  const actions = [
    { icon: Search, label: '似た悩みを見る', color: '#00D4FF', path: '/experiences' },
    { icon: MessageCircle, label: 'AIへ相談する', color: '#00D4FF', path: '/' },
    { icon: Users, label: '相談室を見る', color: '#8B5CF6', path: '/community' },
    { icon: Building2, label: '物件を探す', color: '#D4AF37', path: '/properties' },
    { icon: UserCheck, label: '専門家に相談', color: '#10B981', path: '/consultation' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#0A1628', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'absolute', inset: 0 }}>
        {[0,1,2,3,4,5,6,7].map((i) => (
          <motion.div key={i} style={{ position: 'absolute', bottom: 0, left: `${i * 12}%`, width: '10%', height: `${40 + i * 5}%`, background: 'linear-gradient(to top, #1a2744, transparent)', borderTop: '2px solid rgba(0,212,255,0.3)' }} initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: i * 0.1 }} />
        ))}
        {[0,1,2,3,4].map((i) => (
          <motion.div key={i} style={{ position: 'absolute', left: `${20 + i * 15}%`, top: 0, width: 2, height: '100%', background: 'linear-gradient(to bottom, transparent, #00D4FF, transparent)' }} animate={{ opacity: [0, 0.5, 0] }} transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }} />
        ))}
      </div>
      <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', padding: '0 16px', maxWidth: 900 }}>
        <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ duration: 0.8, type: 'spring' }} style={{ marginBottom: 32, display: 'inline-block' }}>
          <div style={{ width: 96, height: 128, borderRadius: 16, background: 'linear-gradient(135deg, rgba(212,175,55,0.2), rgba(0,212,255,0.2))', border: '2px solid #D4AF37', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
              <span style={{ fontSize: '2rem' }}>✨</span>
            </motion.div>
          </div>
        </motion.div>
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }} style={{ fontSize: '3rem', fontWeight: 700, marginBottom: 24, background: 'linear-gradient(to right, #D4AF37, #FFD700, #D4AF37)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          投稿完了
        </motion.h1>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.5 }} style={{ marginBottom: 48 }}>
          <p style={{ color: '#fff', fontSize: '1.25rem', lineHeight: 1.7, marginBottom: 4 }}>あなたの経験は、</p>
          <p style={{ color: '#fff', fontSize: '1.25rem', lineHeight: 1.7, marginBottom: 4 }}>これから住まいを探す誰かを助けます。</p>
          <p style={{ color: '#00D4FF', fontSize: '1.125rem', fontWeight: 500 }}>House-AIが必要な人へ届けます。</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.7 }}>
          <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 24, fontSize: '1rem' }}>次のアクション</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16 }}>
            {actions.map((action, index) => (
              <motion.button key={action.label} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, delay: 0.8 + index * 0.1 }} whileHover={{ scale: 1.05, y: -5 }} whileTap={{ scale: 0.95 }} onClick={() => navigate(action.path)} style={{ padding: 24, borderRadius: 16, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}>
                <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'center' }}>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: `${action.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <action.icon size={24} color={action.color} />
                  </div>
                </div>
                <p style={{ color: '#fff', fontSize: '0.875rem', fontWeight: 500, textAlign: 'center', margin: 0 }}>{action.label}</p>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
