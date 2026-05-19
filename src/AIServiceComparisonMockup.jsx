import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { Calculator, TrendingUp, Home, Check } from 'lucide-react';

const toolCards = [
  { icon: Calculator, title: '住宅ローン診断', items: ['月々返済をAI試算', '固定 / 変動比較', 'AIおすすめ整理'], cta: '無料で診断' },
  { icon: Home, title: '火災保険整理', items: ['補償内容を比較', '不要項目チェック', '保険料目安確認'], cta: '無料で整理' },
  { icon: TrendingUp, title: '引越し費用比較', items: ['相場確認', 'AIおすすめ整理', '条件比較'], cta: '無料で比較' },
  { icon: Calculator, title: 'リフォーム整理', items: ['予算感整理', '優先順位分析', '相場確認'], cta: 'AIで整理' },
];

const aiCompareLogs = ['条件を整理中...', 'AIが相場を分析中...', '優先順位を確認中...', '類似相談を分析中...'];
const statusLabels = ['住宅ローン条件整理中', '引越し相場分析中', 'リフォーム予算整理中'];

export default function AIServiceComparisonMockup() {
  const [currentToolIndex, setCurrentToolIndex] = useState(0);
  const [currentLogIndex, setCurrentLogIndex] = useState(0);
  const [currentStatusIndex, setCurrentStatusIndex] = useState(0);

  useEffect(() => {
    const iv = setInterval(() => setCurrentToolIndex(p => (p + 1) % toolCards.length), 5000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    const iv = setInterval(() => setCurrentLogIndex(p => (p + 1) % aiCompareLogs.length), 2000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    const iv = setInterval(() => setCurrentStatusIndex(p => (p + 1) % statusLabels.length), 3000);
    return () => clearInterval(iv);
  }, []);

  const CurrentIcon = toolCards[currentToolIndex].icon;

  return (
    <div style={{ position: 'relative', width: '420px', height: '780px', margin: '0 auto' }}>
      <motion.div style={{ position: 'absolute', inset: 0, borderRadius: '44px', opacity: 0.4, filter: 'blur(48px)' }} animate={{ background: ['radial-gradient(circle at 50% 50%, rgba(59,130,246,0.3), transparent 70%)', 'radial-gradient(circle at 30% 50%, rgba(147,51,234,0.2), transparent 70%)', 'radial-gradient(circle at 70% 50%, rgba(59,130,246,0.3), transparent 70%)'] }} transition={{ duration: 4, repeat: Infinity }} />
      <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: '44px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, #071226, #0A1A35, #091A35)' }} />
        <div style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '32px 24px' }}>
            <div style={{ color: 'rgba(147,197,253,0.7)', fontSize: '11px', letterSpacing: '0.1em', marginBottom: '24px' }}>HOUSE-AI TOOLS</div>
            <AnimatePresence mode="wait">
              <motion.div key={currentToolIndex} initial={{ opacity: 0, x: 30, filter: 'blur(8px)' }} animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }} exit={{ opacity: 0, x: -30, filter: 'blur(8px)' }} transition={{ duration: 0.5 }} style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)', borderRadius: '16px', padding: '20px', border: '1px solid rgba(255,255,255,0.2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, #60a5fa, #2563eb)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                    <CurrentIcon size={20} color="white" />
                  </div>
                  <h3 style={{ color: 'white', fontSize: '18px', margin: 0 }}>{toolCards[currentToolIndex].title}</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                  {toolCards[currentToolIndex].items.map((item, idx) => (
                    <motion.div key={idx} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(219,234,254,0.9)', fontSize: '14px' }}>
                      <div style={{ width: '4px', height: '4px', background: '#60a5fa', borderRadius: '50%' }} />
                      {item}
                    </motion.div>
                  ))}
                </div>
                <button style={{ width: '100%', padding: '10px', background: 'linear-gradient(to right, #3b82f6, #2563eb)', color: 'white', fontSize: '14px', borderRadius: '10px', border: 'none', cursor: 'pointer' }}>{toolCards[currentToolIndex].cta}</button>
              </motion.div>
            </AnimatePresence>
          </div>
          <div style={{ position: 'relative', height: '1px', background: 'linear-gradient(to right, transparent, rgba(96,165,250,0.5), transparent)', margin: '0 32px' }}>
            <motion.div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, transparent, #60a5fa, transparent)' }} animate={{ x: ['-100%', '100%'] }} transition={{ duration: 2, repeat: Infinity }} />
            <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%) translateY(-50%)', background: '#091A35', padding: '4px 12px' }}>
              <span style={{ fontSize: '10px', color: '#60a5fa', letterSpacing: '0.1em' }}>AI CONNECT</span>
            </div>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '32px 24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {aiCompareLogs.map((log, idx) => (
                <motion.div key={idx} animate={{ opacity: currentLogIndex === idx ? 1 : 0.3 }} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <motion.div animate={{ scale: currentLogIndex === idx ? 1 : 0.8, background: currentLogIndex === idx ? 'rgba(34,197,94,1)' : 'rgba(59,130,246,0.5)' }} style={{ width: '16px', height: '16px', borderRadius: '50%', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                    {currentLogIndex > idx ? <Check size={10} color="white" /> : null}
                  </motion.div>
                  <span style={{ fontSize: '14px', color: currentLogIndex === idx ? 'rgba(219,234,254,0.9)' : 'rgba(147,197,253,0.5)' }}>{log}</span>
                </motion.div>
              ))}
              <div style={{ marginTop: '24px', marginBottom: '16px' }}>
                <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '999px', overflow: 'hidden' }}>
                  <motion.div style={{ height: '100%', background: 'linear-gradient(to right, #3b82f6, #9333ea)', borderRadius: '999px' }} animate={{ width: ['0%', '100%'] }} transition={{ duration: 8, repeat: Infinity }} />
                </div>
              </div>
              <AnimatePresence mode="wait">
                <motion.div key={currentStatusIndex} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} style={{ textAlign: 'center', fontSize: '12px', color: 'rgba(147,197,253,0.7)' }}>
                  {statusLabels[currentStatusIndex]}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
