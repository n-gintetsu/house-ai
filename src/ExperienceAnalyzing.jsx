import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 500, height: 500, borderRadius: '50%', border: '2px solid rgba(0,212,255,0.3)' }} />
      </div>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 400, height: 400, borderRadius: '50%', border: '2px solid rgba(212,175,55,0.2)' }} />
      </div>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 300, height: 300, borderRadius: '50%', border: '1px solid rgba(0,212,255,0.4)' }} />
      </div>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 256, height: 256, borderRadius: '50%', background: '#00D4FF', filter: 'blur(60px)' }} />
      </div>
      <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', padding: '0 16px' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 700, letterSpacing: '0.05em', marginBottom: 64, background: 'linear-gradient(to right, #00D4FF, #D4AF37, #00D4FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          AI EXPERIENCE<br />ANALYZING...
        </h1>
        <div>
          {steps.map((step, index) => (
            <div key={step} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `2px solid ${completedSteps.includes(index) ? '#00D4FF' : 'rgba(255,255,255,0.3)'}`, background: completedSteps.includes(index) ? '#00D4FF' : 'transparent', transition: 'all 0.3s' }}>
                {completedSteps.includes(index) ? (
                  <div>
                    <Check size={14} color="#000" />
                  </div>
                ) : null}
              </div>
              <span style={{ fontSize: '1.125rem', fontWeight: 500, color: completedSteps.includes(index) ? '#00D4FF' : 'rgba(255,255,255,0.6)', transition: 'all 0.3s' }}>
                {step}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
