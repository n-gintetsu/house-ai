import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const steps = ['内容分析', 'カテゴリ分類', 'AI要約作成', 'タグ生成', '投稿カード作成'];

export default function ExperienceAnalyzing() {
  const navigate = useNavigate();
  const [completedSteps, setCompletedSteps] = useState([]);

  useEffect(() => {
    steps.forEach((_, index) => {
      setTimeout(() => {
        setCompletedSteps((prev) => [...prev, index]);
      }, (index + 1) * 600);
    });
    setTimeout(() => {
      navigate('/experiences/result');
    }, 3500);
  }, [navigate]);

  return (
    <div style={{ minHeight: '100vh', background: '#000', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <motion.div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }} animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}>
        <div style={{ width: 500, height: 500, borderRadius: '50%', border: '2px solid rgba(0,212,255,0.3)' }} />
      </motion.div>
      <motion.div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }} animate={{ rotate: -360 }} transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}>
        <div style={{ width: 400, height: 400, borderRadius: '50%', border: '2px solid rgba(212,175,55,0.2)' }} />
      </motion.div>
      <motion.div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }} animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}>
        <div style={{ width: 300, height: 300, borderRadius: '50%', border: '1px solid rgba(0,212,255,0.4)' }} />
      </motion.div>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.1, 0.3] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }} style={{ width: 256, height: 256, borderRadius: '50%', background: '#00D4FF', filter: 'blur(60px)' }} />
      </div>
      <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', padding: '0 16px' }}>
        <motion.h1 initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }} style={{ fontSize: '3rem', fontWeight: 700, letterSpacing: '0.05em', marginBottom: 64, color: '#00D4FF' }}>
          AI EXPERIENCE<br />ANALYZING...
        </motion.h1>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}>
          {steps.map((step, index) => (
            <motion.div key={step} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: index * 0.1 }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `2px solid ${completedSteps.includes(index) ? '#00D4FF' : 'rgba(255,255,255,0.3)'}`, background: completedSteps.includes(index) ? '#00D4FF' : 'transparent', transition: 'all 0.3s' }}>
                {completedSteps.includes(index) ? (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.3 }}>
                    <Check size={14} color="#000" />
                  </motion.div>
                ) : null}
              </div>
              <span style={{ fontSize: '1.125rem', fontWeight: 500, color: completedSteps.includes(index) ? '#00D4FF' : 'rgba(255,255,255,0.6)', transition: 'all 0.3s' }}>
                {step}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
