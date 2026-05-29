import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { Sparkles, Search, MessageCircle, Users, Building2, UserCheck } from 'lucide-react';

const BUILDINGS = [
  { left: '2%',  width: '9%',  height: '55%' },
  { left: '13%', width: '10%', height: '72%' },
  { left: '25%', width: '9%',  height: '48%' },
  { left: '36%', width: '11%', height: '65%' },
  { left: '49%', width: '9%',  height: '78%' },
  { left: '60%', width: '10%', height: '58%' },
  { left: '72%', width: '9%',  height: '44%' },
  { left: '83%', width: '11%', height: '68%' },
];

const RAYS = [
  { left: '15%', delay: '0s' },
  { left: '30%', delay: '0.6s' },
  { left: '50%', delay: '1.2s' },
  { left: '68%', delay: '0.4s' },
  { left: '84%', delay: '1s' },
];

const ACTIONS = [
  { Icon: Search,       label: '似た悩みを見る', path: '/community' },
  { Icon: MessageCircle, label: 'AIへ相談する',  path: '/' },
  { Icon: Users,        label: '相談室を見る',   path: '/community' },
  { Icon: Building2,    label: '物件を探す',     path: '/' },
  { Icon: UserCheck,    label: '専門家に相談',   path: '/' },
];

export default function ExperienceComplete() {
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#00D4FF', '#D4AF37', '#FFD700'],
      });
    }, 400);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <style>{`
        @keyframes rayPulse {
          0%, 100% { opacity: 0.05; }
          50%       { opacity: 0.25; }
        }
        .ec-ray {
          position: absolute;
          top: 0;
          width: 2px;
          height: 100%;
          background: linear-gradient(to bottom, transparent, #00D4FF, transparent);
          animation: rayPulse 2.4s ease-in-out infinite;
        }
        .ec-action-btn {
          padding: 24px 8px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 16px;
          cursor: pointer;
          font-family: inherit;
          transition: border-color 0.2s, background 0.2s;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
        }
        .ec-action-btn:hover {
          border-color: rgba(0,212,255,0.4);
          background: rgba(0,212,255,0.06);
        }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#0A1628', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingBottom: 160 }}>

        {/* Vertical rays */}
        {RAYS.map((r, i) => (
          <div key={i} className="ec-ray" style={{ left: r.left, animationDelay: r.delay }} />
        ))}

        {/* Buildings */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '80%', pointerEvents: 'none' }}>
          {BUILDINGS.map((b, bi) => (
            <div key={bi} style={{ position: 'absolute', bottom: 0, left: b.left, width: b.width, height: b.height, background: 'linear-gradient(to top, #0d1e35, #112240)', borderTop: '1px solid rgba(0,212,255,0.19)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gridTemplateRows: 'repeat(4, 1fr)', gap: 3, padding: 6, height: '60%' }}>
                {Array.from({ length: 12 }).map((_, wi) => (
                  <div key={wi} style={{ background: Math.random() > 0.4 ? 'rgba(0,212,255,0.18)' : 'rgba(212,175,55,0.12)', borderRadius: 1 }} />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Center content */}
        <div style={{ position: 'relative', zIndex: 10, maxWidth: 900, width: '100%', padding: '0 16px', textAlign: 'center' }}>

          {/* Card icon */}
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 96, height: 128, borderRadius: 16, background: 'linear-gradient(135deg, rgba(212,175,55,0.15), rgba(0,212,255,0.1))', border: '2px solid #D4AF37', marginBottom: 32 }}>
            <Sparkles size={32} color="#D4AF37" />
          </div>

          {/* Title */}
          <h1 style={{ color: '#D4AF37', fontSize: '3rem', fontWeight: 700, marginBottom: 24, fontFamily: "'Noto Sans JP', sans-serif" }}>
            投稿完了
          </h1>

          {/* Sub text */}
          <p style={{ color: '#fff', fontSize: '1.25rem', lineHeight: 1.7, marginBottom: 4 }}>あなたの経験は、</p>
          <p style={{ color: '#fff', fontSize: '1.25rem', lineHeight: 1.7, marginBottom: 4 }}>これから住まいを探す誰かを助けます。</p>
          <p style={{ color: '#00D4FF', fontSize: '1.125rem', fontWeight: 500, marginBottom: 48 }}>House-AIが必要な人へ届けます。</p>

          {/* Action buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16 }}>
            {ACTIONS.map(({ Icon, label, path }) => (
              <button key={label} className="ec-action-btn" onClick={() => navigate(path)}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(0,212,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={24} color="#00D4FF" />
                </div>
                <p style={{ color: '#fff', fontSize: '0.875rem', fontWeight: 500, margin: 0 }}>{label}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
