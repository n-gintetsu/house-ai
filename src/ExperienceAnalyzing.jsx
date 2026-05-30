import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const steps = ['内容分析', 'カテゴリ分類', 'AI要約作成', 'タグ生成', '投稿カード作成'];

const generateExperience = async (answers) => {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': import.meta.env.VITE_ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5',
      max_tokens: 1000,
      messages: [{
        role: 'user',
        content: `不動産の体験談を以下の回答から整理してください。

回答1（悩み）: ${answers[0]}
回答2（解決方法）: ${answers[1]}
回答3（アドバイス）: ${answers[2]}

以下のJSON形式のみで返してください（他のテキスト不要）:
{
  "title": "体験談のタイトル（20文字以内）",
  "summary": "3文程度の要約。ユーザーの体験を自然な文章でまとめる",
  "tags": ["タグ1", "タグ2", "タグ3", "タグ4"],
  "learnings": ["学び1", "学び2", "学び3"]
}`,
      }],
    }),
  });
  const data = await response.json();
  const text = data.content[0].text;
  const clean = text.replace(/```json|```/g, '').trim();
  return JSON.parse(clean);
};

export default function ExperienceAnalyzing() {
  const navigate = useNavigate();
  const location = useLocation();
  const answers = (location.state || {}).answers || [];
  const [completedSteps, setCompletedSteps] = useState([]);

  useEffect(() => {
    steps.forEach((_, index) => {
      setTimeout(() => {
        setCompletedSteps((prev) => [...prev, index]);
      }, (index + 1) * 600);
    });

    const wantsAdvice = /はい/.test(answers[3] || '');

    generateExperience(answers)
      .then((result) => {
        navigate('/experiences/result', { state: { result, wantsAdvice } });
      })
      .catch(() => {
        const fallback = { title: '体験談', summary: answers[0] || '', tags: [], learnings: [] };
        navigate('/experiences/result', { state: { result: fallback, wantsAdvice } });
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
        <h1 style={{ fontSize: '2rem', fontWeight: 700, letterSpacing: '0.05em', color: '#00D4FF', lineHeight: 1.3, textAlign: 'center', marginBottom: 32 }}>
          AI EXPERIENCE<br />ANALYZING...
        </h1>
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
