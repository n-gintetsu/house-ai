import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Calculator, TrendingUp, GraduationCap, FileText, Receipt, BookOpen, Shield, Home, Sparkles, ChevronLeft, MessageSquare, FileSearch, FileSignature } from 'lucide-react';

const tools = [
  { id: 'mortgage', icon: Calculator, title: '住宅ローンシミュレーション', description: '返済・固定変動を整理', labels: ['登録不要', '人気'] },
  { id: 'investment', icon: TrendingUp, title: '投資ローンシミュレータ', description: '利回り・返済を整理', labels: ['登録不要', 'AI整理'] },
  { id: 'beginner', icon: GraduationCap, title: '投資初心者ドリル', description: '初心者向けにAIが整理', labels: ['登録不要'] },
  { id: 'costs', icon: FileText, title: '諸費用計算', description: '購入時費用を整理', labels: ['登録不要', '物件連携'] },
  { id: 'tax', icon: Receipt, title: '不動産税金整理', description: '税金をAIが整理', labels: ['登録不要', 'AI整理'] },
  { id: 'dictionary', icon: BookOpen, title: '宅建用語集', description: '難しい言葉を整理', labels: ['登録不要'] },
  { id: 'insurance', icon: Shield, title: '火災保険整理', description: '補償内容を比較', labels: ['登録不要', 'AI整理'] },
  { id: 'moving', icon: Home, title: '引越し費用比較', description: '相場確認・条件比較', labels: ['登録不要'] },
  { id: 'satei', icon: null, title: 'AI不動産整理査定', description: '相場感をAIが整理', labels: ['登録不要', 'AI査定'] },
  { id: 'community_room', icon: MessageSquare, title: '住まい相談室', description: '希望条件投稿できます', labels: ['要登録', 'AI整理'], iconBg: 'linear-gradient(135deg, #c9a84c, #a07830)', href: '/consultation' },
  { id: 'pro_investigation', icon: FileSearch, title: 'AI現地調査レポート', description: '現地調査をAIが整理', labels: ['事業者様向け', '要登録', 'AI整理', '一部課金あり'], iconBg: 'linear-gradient(135deg, #c9a84c, #D4AF37)', href: '/pro', variant: 'pro' },
  { id: 'pro_docs', icon: FileSignature, title: 'AI重説ドラフト', description: '重説作成をAIが支援', labels: ['事業者様向け', '要登録', 'AI整理', '一部課金あり'], iconBg: 'linear-gradient(135deg, #c9a84c, #D4AF37)', href: '/pro/docs', variant: 'pro' },
];

const loadingMessages = ['住宅ローン条件を整理中...', '固定・変動を確認...', 'AIが整理しました'];

const labelStyle = (label) => {
  if (label === '事業者様向け') return { background: 'rgba(201,168,76,0.18)', color: '#D4AF37' };
  if (label === '一部課金あり') return { background: 'rgba(245,158,11,0.15)', color: '#f59e0b' };
  if (label === '登録不要' || label === '要登録') return { background: '#F0FDF4', color: '#15803d' };
  if (label === '人気') return { background: '#FFF7ED', color: '#c2410c' };
  if (label === 'AI整理') return { background: '#EFF6FF', color: '#1d4ed8' };
  if (label === 'AI査定') return { background: '#FFFBEB', color: '#b45309' };
  return { background: '#FAF5FF', color: '#7e22ce' };
};

export default function ToolHubPage({ onSelectTool, onBack }) {
  const [loadingTool, setLoadingTool] = useState(null);
  const [loadingStep, setLoadingStep] = useState(0);
  const [hoveredCard, setHoveredCard] = useState(null);

  const handleToolClick = (toolId) => {
    setLoadingTool(toolId);
    setLoadingStep(0);
    [0, 1, 2].forEach((step, idx) => {
      setTimeout(() => {
        setLoadingStep(step);
        if (step === 2) {
          setTimeout(() => {
            setLoadingTool(null);
            onSelectTool(toolId);
          }, 400);
        }
      }, idx * 600);
    });
  };

  return (
    <div style={{ minHeight: '100vh', width: '100%', background: '#F7F9FC', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, opacity: 0.3, backgroundImage: 'linear-gradient(rgba(59,130,246,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.05) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <motion.button onClick={onBack} style={{ position: 'fixed', top: '24px', left: '24px', zIndex: 100, display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '999px', border: '1px solid #E5E7EB', background: 'white', color: '#374151', fontSize: '14px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }} whileHover={{ y: -1 }}>
        <ChevronLeft size={16} /> 戻る
      </motion.button>

      <section style={{ position: 'relative', maxWidth: '1080px', margin: '0 auto', padding: '80px 40px 60px' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', marginBottom: '72px' }}>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '20px', flexWrap: 'wrap' }}>
            <span style={{ padding: '6px 16px', borderRadius: '999px', fontSize: '13px', fontWeight: 600, background: '#F0FDF4', color: '#15803d' }}>登録不要</span>
            <span style={{ padding: '6px 16px', borderRadius: '999px', fontSize: '13px', fontWeight: 600, background: '#EFF6FF', color: '#1d4ed8' }}>匿名OK</span>
            <span style={{ padding: '6px 16px', borderRadius: '999px', fontSize: '13px', fontWeight: 600, background: '#FAF5FF', color: '#7e22ce' }}>無料</span>
          </div>
          <h1 style={{ fontSize: '56px', fontWeight: 700, marginBottom: '20px', color: '#111827' }}>便利ツール</h1>
          <p style={{ color: '#6B7280', fontSize: '18px', margin: 0 }}>不動産の悩みをAIと整理できます</p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
          {tools.map((tool, idx) => {
            const Icon = tool.icon;
            const isSatei = tool.id === 'satei';
            return (
              <motion.button
                key={tool.id}
                id={`tool-card-${tool.id}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                onMouseEnter={() => setHoveredCard(tool.id)}
                onMouseLeave={() => setHoveredCard(null)}
                onClick={() => tool.href ? (window.location.href = tool.href) : handleToolClick(tool.id)}
                style={{
                  background: tool.variant === 'pro'
                    ? (hoveredCard === tool.id ? 'linear-gradient(135deg, #0F172A, #1e293b)' : '#0F172A')
                    : (hoveredCard === tool.id ? 'linear-gradient(135deg, #EFF6FF, #F5F3FF)' : 'white'),
                  borderRadius: '24px',
                  padding: '40px',
                  border: tool.variant === 'pro'
                    ? (hoveredCard === tool.id ? '1px solid rgba(201,168,76,1)' : '1px solid rgba(201,168,76,0.4)')
                    : (hoveredCard === tool.id ? '1px solid rgba(99,102,241,0.5)' : '1px solid #E5E7EB'),
                  boxShadow: tool.variant === 'pro'
                    ? (hoveredCard === tool.id ? '0 0 24px 4px rgba(201,168,76,0.55), 0 16px 40px rgba(201,168,76,0.3)' : '0 2px 8px rgba(0,0,0,0.3)')
                    : (hoveredCard === tool.id ? '0 16px 40px rgba(99,102,241,0.18), 0 0 0 1px rgba(99,102,241,0.12)' : '0 2px 8px rgba(0,0,0,0.04)'),
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                  transform: hoveredCard === tool.id ? 'translateY(-4px)' : 'translateY(0)',
                }}
              >
                <div style={{ width: '64px', height: '64px', borderRadius: '18px', background: tool.iconBg ? tool.iconBg : isSatei ? 'linear-gradient(135deg, #c9a84c, #D4AF37)' : hoveredCard === tool.id ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'linear-gradient(135deg, #3b82f6, #2563eb)', display: 'grid', placeItems: 'center', marginBottom: '20px', transition: 'background 0.25s ease' }}>
                  {isSatei ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M3 11L12 3L21 11V21H15V15H9V21H3V11Z" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
                      <circle cx="19" cy="6" r="4" fill="#D4AF37"/>
                      <text x="19" y="9" textAnchor="middle" fontSize="5" fill="white" fontWeight="bold">AI</text>
                    </svg>
                  ) : (
                    <Icon size={32} color="white" />
                  )}
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: tool.variant === 'pro' ? '#F8FAFC' : '#111827', marginBottom: '8px', margin: '0 0 8px 0' }}>{tool.title}</h3>
                <p style={{ fontSize: '14px', color: tool.variant === 'pro' ? 'rgba(255,255,255,0.6)' : '#6B7280', marginBottom: '16px', lineHeight: 1.6, margin: '0 0 16px 0' }}>{tool.description}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {tool.labels.map(label => (
                    <span key={label} style={{ padding: '4px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: 600, ...labelStyle(label) }}>{label}</span>
                  ))}
                </div>
              </motion.button>
            );
          })}
        </div>
      </section>

      {loadingTool ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ background: 'white', borderRadius: '28px', padding: '48px', maxWidth: '400px', width: '100%', textAlign: 'center' }}>
            <motion.div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #9333ea)', display: 'grid', placeItems: 'center', margin: '0 auto 24px' }} animate={{ scale: [1,1.1,1], boxShadow: ['0 0 20px rgba(59,130,246,0.3)','0 0 40px rgba(59,130,246,0.6)','0 0 20px rgba(59,130,246,0.3)'] }} transition={{ duration: 2, repeat: Infinity }}>
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
    </div>
  );
}
