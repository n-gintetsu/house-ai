import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { Calculator, TrendingUp, GraduationCap, FileText, Receipt, BookOpen, Shield, Home, Sparkles } from 'lucide-react';

const tools = [
  { id: 'mortgage', icon: Calculator, title: '住宅ローンシミュレーション', description: '返済・固定変動を整理', labels: ['登録不要', '人気'] },
  { id: 'investment', icon: TrendingUp, title: '投資ローンシミュレータ', description: '利回り・返済を整理', labels: ['登録不要', 'AI整理'] },
  { id: 'beginner', icon: GraduationCap, title: '投資初心者ドリル', description: '初心者向けにAIが整理', labels: ['登録不要'] },
  { id: 'costs', icon: FileText, title: '諸費用計算', description: '購入時費用を整理', labels: ['登録不要', '物件連携'] },
  { id: 'tax', icon: Receipt, title: '不動産税金整理', description: '税金をAIが整理', labels: ['登録不要', 'AI整理'] },
  { id: 'dictionary', icon: BookOpen, title: '宅建用語集', description: '難しい言葉を整理', labels: ['登録不要'] },
  { id: 'insurance', icon: Shield, title: '火災保険整理', description: '補償内容を比較', labels: ['登録不要', 'AI整理'] },
  { id: 'moving', icon: Home, title: '引越し費用比較', description: '相場確認・条件比較', labels: ['登録不要'] },
];

const loadingMessages = ['住宅ローン条件を整理中...', '固定・変動を確認...', 'AIが整理しました'];

const labelStyle = (label) => {
  if (label === '登録不要') return { background: '#F0FDF4', color: '#15803d' };
  if (label === '人気') return { background: '#FFF7ED', color: '#c2410c' };
  if (label === 'AI整理') return { background: '#EFF6FF', color: '#1d4ed8' };
  return { background: '#FAF5FF', color: '#7e22ce' };
};

export default function ToolHubSection({ onTabChange }) {
  const [loadingTool, setLoadingTool] = useState(null);
  const [loadingStep, setLoadingStep] = useState(0);

  const handleToolClick = (toolId) => {
    setLoadingTool(toolId);
    setLoadingStep(0);
    [0, 1, 2].forEach((step, idx) => {
      setTimeout(() => {
        setLoadingStep(step);
        if (step === 2) {
          setTimeout(() => {
            setLoadingTool(null);
            onTabChange('chat');
          }, 400);
        }
      }, idx * 600);
    });
  };

  return (
    <section style={{ position: 'relative', background: '#F7F9FC', padding: '80px 20px 100px', overflow: 'hidden' }}>
      {/* Grid background */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.3, backgroundImage: 'linear-gradient(rgba(59,130,246,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.05) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <div style={{ position: 'relative', maxWidth: '1080px', margin: '0 auto' }}>
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', marginBottom: '56px' }}>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '16px', flexWrap: 'wrap' }}>
            {['登録不要', '匿名OK', '無料'].map((tag, i) => (
              <span key={tag} style={{ padding: '6px 16px', borderRadius: '999px', fontSize: '13px', fontWeight: 600, background: i === 0 ? '#F0FDF4' : i === 1 ? '#EFF6FF' : '#FAF5FF', color: i === 0 ? '#15803d' : i === 1 ? '#1d4ed8' : '#7e22ce' }}>{tag}</span>
            ))}
          </div>
          <h2 style={{ fontSize: 'clamp(28px,4vw,48px)', fontWeight: 700, marginBottom: '12px', background: 'linear-gradient(to right, #111827, #1e3a5f, #111827)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>便利ツール</h2>
          <p style={{ color: '#4B5563', fontSize: '18px' }}>不動産の悩みをAIと整理できます</p>
        </motion.div>

        {/* Tool Grid */}
        <div className="tool-hub-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
          {tools.map((tool, idx) => {
            const Icon = tool.icon;
            return (
              <motion.button
                key={tool.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(11,31,51,0.12)' }}
                onClick={() => handleToolClick(tool.id)}
                style={{ position: 'relative', background: 'white', borderRadius: '24px', padding: '32px', border: '1px solid #E5E7EB', textAlign: 'left', cursor: 'pointer', transition: 'border-color 0.2s ease' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(96,165,250,0.5)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#E5E7EB'}
              >
                <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'linear-gradient(135deg, #3b82f6, #2563eb)', display: 'grid', placeItems: 'center', marginBottom: '16px', transition: 'transform 0.2s' }}>
                  <Icon size={28} color="white" />
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>{tool.title}</h3>
                <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '16px', lineHeight: 1.6 }}>{tool.description}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {tool.labels.map(label => (
                    <span key={label} style={{ padding: '4px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: 600, ...labelStyle(label) }}>{label}</span>
                  ))}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Loading Modal */}
      {loadingTool ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ background: 'white', borderRadius: '28px', padding: '48px', maxWidth: '400px', width: '100%', textAlign: 'center' }}>
            <motion.div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #9333ea)', display: 'grid', placeItems: 'center', margin: '0 auto 24px' }} animate={{ scale: [1, 1.1, 1], boxShadow: ['0 0 20px rgba(59,130,246,0.3)', '0 0 40px rgba(59,130,246,0.6)', '0 0 20px rgba(59,130,246,0.3)'] }} transition={{ duration: 2, repeat: Infinity }}>
              <Sparkles size={40} color="white" />
            </motion.div>
            <AnimatePresence mode="wait">
              <motion.p key={loadingStep} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} style={{ fontSize: '16px', color: '#374151', marginBottom: '24px' }}>
                {loadingMessages[loadingStep]}
              </motion.p>
            </AnimatePresence>
            <div style={{ height: '4px', background: '#F3F4F6', borderRadius: '999px', overflow: 'hidden' }}>
              <motion.div style={{ height: '100%', background: 'linear-gradient(to right, #3b82f6, #9333ea)', borderRadius: '999px' }} animate={{ width: `${((loadingStep + 1) / 3) * 100}%` }} transition={{ duration: 0.5 }} />
            </div>
          </motion.div>
        </motion.div>
      ) : null}

      <style>{`
        @media (max-width: 900px) {
          .tool-hub-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 600px) {
          .tool-hub-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
