import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, Cpu, Zap } from 'lucide-react';

export default function CommunitySuccessPage() {
  const navigate = useNavigate();
  const [stage, setStage] = useState('design');
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('設計中...');

  useEffect(() => {
    let progressInterval;
    const t1 = setTimeout(() => { setStage('construction'); setMessage('建築中...'); setProgress(0); }, 2000);
    const t2 = setTimeout(() => {
      progressInterval = setInterval(() => {
        setProgress(prev => { if (prev >= 100) { clearInterval(progressInterval); return 100; } return prev + 2; });
      }, 40);
    }, 2000);
    const t3 = setTimeout(() => { setStage('complete'); setMessage('完成'); }, 4500);
    const t4 = setTimeout(() => { setStage('sending'); }, 5500);
    const t5 = setTimeout(() => { setStage('waiting'); }, 7000);
    const t6 = setTimeout(() => { setStage('done'); }, 8500);
    return () => { [t1,t2,t3,t4,t5,t6].forEach(clearTimeout); if (progressInterval) clearInterval(progressInterval); };
  }, []);

  const gridStyle = { position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(to right,rgba(255,255,255,0.1) 1px,transparent 1px),linear-gradient(to bottom,rgba(255,255,255,0.1) 1px,transparent 1px)', backgroundSize: '40px 40px', opacity: 0.1 };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
      <motion.div style={{ position: 'absolute', top: 32, left: 0, right: 0, textAlign: 'center' }} initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 style={{ fontSize: 22, color: '#fff', fontWeight: 700, letterSpacing: 2 }}>House-AI Construction System</h1>
      </motion.div>
      <div style={gridStyle} />
      {[...Array(6)].map((_, i) => (
        <motion.div key={i} style={{ position: 'absolute', height: 1, background: 'linear-gradient(to right,transparent,rgba(6,182,212,0.3),transparent)', left: 0, right: 0, top: `${15 + i * 15}%` }}
          animate={{ opacity: [0.2,0.6,0.2], scaleX: [0.8,1,0.8] }} transition={{ duration: 3, delay: i * 0.3, repeat: Infinity }} />
      ))}
      <div style={{ position: 'relative', zIndex: 10, maxWidth: 672, margin: '0 auto', padding: '0 16px', textAlign: 'center' }}>
        {(stage === 'design' || stage === 'construction' || stage === 'complete') ? (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <motion.div style={{ position: 'relative', width: 256, height: 256, margin: '0 auto 32px' }}>
              <motion.div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }} animate={{ opacity: stage === 'design' ? 0.3 : 1 }}>
                <Building2 size={192} color="#22d3ee" />
              </motion.div>
              {stage === 'construction' ? (
                <>
                  <motion.div style={{ position: 'absolute', top: '25%', left: '25%' }} animate={{ y: [0,-10,0], rotate: [0,5,0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                    <Cpu size={32} color="#facc15" />
                  </motion.div>
                  <motion.div style={{ position: 'absolute', top: '33%', right: '25%' }} animate={{ y: [0,-8,0], rotate: [0,-5,0] }} transition={{ duration: 1.3, repeat: Infinity, delay: 0.3 }}>
                    <Cpu size={32} color="#facc15" />
                  </motion.div>
                </>
              ) : null}
              {stage === 'design' ? (
                <motion.div style={{ position: 'absolute', inset: 0 }} initial={{ y: '-100%' }} animate={{ y: '100%' }} transition={{ duration: 2, repeat: Infinity }}>
                  <div style={{ height: 4, background: 'linear-gradient(to right,transparent,#22d3ee,transparent)' }} />
                </motion.div>
              ) : null}
            </motion.div>
            <motion.h2 style={{ fontSize: 30, color: '#fff', marginBottom: 24 }} animate={{ opacity: stage === 'complete' ? [0.7,1,0.7] : 1 }} transition={{ duration: 1, repeat: stage === 'complete' ? Infinity : 0 }}>
              {message}
            </motion.h2>
            {stage === 'construction' ? (
              <div style={{ maxWidth: 384, margin: '0 auto' }}>
                <div style={{ height: 8, background: 'rgba(255,255,255,0.1)', borderRadius: 9999, overflow: 'hidden', marginBottom: 12 }}>
                  <motion.div style={{ height: '100%', background: 'linear-gradient(to right,#22d3ee,#3b82f6)', width: `${progress}%` }} />
                </div>
                <div style={{ color: '#22d3ee', fontSize: 18, fontFamily: 'monospace' }}>{progress}%</div>
              </div>
            ) : null}
          </motion.div>
        ) : null}
        {stage === 'sending' ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <motion.div style={{ width: 128, height: 128, margin: '0 auto 32px' }} animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
              <Zap size={128} color="#eab308" />
            </motion.div>
            <h2 style={{ fontSize: 30, color: '#fff', marginBottom: 16 }}>投稿完了</h2>
            <motion.p style={{ fontSize: 20, color: '#d1d5db', marginBottom: 16 }} animate={{ opacity: [0.5,1,0.5] }} transition={{ duration: 1.5, repeat: Infinity }}>
              あなたの希望が実現しますように。
            </motion.p>
            <p style={{ color: '#9ca3af' }}>House-AIがあなたに合う住まい探しをサポートします。</p>
          </motion.div>
        ) : null}
        {stage === 'waiting' ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <motion.div style={{ width: 96, height: 96, margin: '0 auto 32px', position: 'relative' }} animate={{ scale: [1,1.1,1] }} transition={{ duration: 1.5, repeat: Infinity }}>
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right,#22d3ee,#3b82f6)', borderRadius: '50%', opacity: 0.2, filter: 'blur(16px)' }} />
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Cpu size={64} color="#22d3ee" />
              </div>
            </motion.div>
            <motion.p style={{ fontSize: 20, color: '#fff', marginBottom: 16 }} animate={{ opacity: [0.6,1,0.6] }} transition={{ duration: 1.5, repeat: Infinity }}>
              House-AIがあなたの希望条件に合う業者を厳選して送信しています。
            </motion.p>
          </motion.div>
        ) : null}
        {stage === 'done' ? (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
            <motion.div style={{ width: 128, height: 128, margin: '0 auto 32px', background: 'linear-gradient(to right,#22c55e,#10b981)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', duration: 0.6 }}>
              <Zap size={64} color="#fff" />
            </motion.div>
            <motion.h2 style={{ fontSize: 28, color: '#fff', marginBottom: 16 }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              条件に合う業者へ相談内容を送信しました。
            </motion.h2>
            <motion.p style={{ fontSize: 18, color: '#d1d5db', marginBottom: 48 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
              業者からの提案をお待ちください。
            </motion.p>
            <motion.div style={{ display: 'flex', gap: 16, justifyContent: 'center' }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
              <button onClick={() => navigate('/community')}
                style={{ padding: '12px 32px', background: 'linear-gradient(to right,#22d3ee,#3b82f6)', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontSize: 15 }}>
                投稿一覧を見る
              </button>
              <button onClick={() => navigate('/')}
                style={{ padding: '12px 32px', background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontSize: 15 }}>
                トップに戻る
              </button>
            </motion.div>
          </motion.div>
        ) : null}
      </div>
    </div>
  );
}
