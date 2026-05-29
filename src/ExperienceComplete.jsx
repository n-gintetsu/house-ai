import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Search, MessageCircle, Users, Building2, UserCheck } from 'lucide-react';

const CONFETTI_COLORS = ['#D4AF37', '#00D4FF', '#FF6B6B', '#4ECDC4', '#FFE66D', '#A8E6CF', '#FF8B94'];

function generateConfetti() {
  return Array.from({ length: 50 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    width: 6 + Math.random() * 8,
    height: 6 + Math.random() * 8,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    delay: Math.random() * 3,
    duration: 2.5 + Math.random() * 2.5,
    rotate: Math.random() * 360,
  }));
}

const actions = [
  { icon: Search, label: '似た悩みを見る', path: '/experiences' },
  { icon: MessageCircle, label: 'AIへ相談する', path: '/' },
  { icon: Users, label: '相談室を見る', path: '/community' },
  { icon: Building2, label: '物件を探す', path: '/search' },
  { icon: UserCheck, label: '専門家に相談', path: '/consultation' },
];

export default function ExperienceComplete() {
  const navigate = useNavigate();
  const [confetti] = useState(generateConfetti);

  return (
    <>
      <style>{`
        @keyframes confettiFall {
          0%   { transform: translateY(-40px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
        }
        .ec-confetti {
          position: fixed;
          top: 0;
          border-radius: 2px;
          animation: confettiFall linear infinite;
          pointer-events: none;
          z-index: 0;
        }
        .ec-card {
          position: relative;
          z-index: 1;
          background: rgba(255,255,255,0.04);
          border: 2px solid #D4AF37;
          border-radius: 20px;
          padding: 40px 32px;
          max-width: 520px;
          width: 100%;
          text-align: center;
        }
        .ec-action-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 16px 8px;
          border-radius: 12px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          color: #fff;
          cursor: pointer;
          font-family: inherit;
          font-size: 12px;
          font-weight: 500;
          transition: border-color 0.2s, background 0.2s;
          flex: 1;
        }
        .ec-action-btn:hover {
          border-color: #D4AF37;
          background: rgba(212,175,55,0.08);
        }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#0A1628', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 16px 120px' }}>

        {/* Confetti */}
        {confetti.map(c => (
          <div
            key={c.id}
            className="ec-confetti"
            style={{
              left: `${c.left}%`,
              width: c.width,
              height: c.height,
              background: c.color,
              animationDelay: `${c.delay}s`,
              animationDuration: `${c.duration}s`,
              transform: `rotate(${c.rotate}deg)`,
            }}
          />
        ))}

        {/* Card */}
        <div className="ec-card">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(212,175,55,0.15)', border: '2px solid #D4AF37', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={28} color="#D4AF37" />
            </div>
          </div>

          <h1 style={{ color: '#D4AF37', fontSize: '2.5rem', fontWeight: 700, marginBottom: 16, fontFamily: "'Noto Sans JP', sans-serif" }}>
            投稿完了
          </h1>

          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.9375rem', lineHeight: 1.8, marginBottom: 32 }}>
            あなたの経験は、これから住まいを探す誰かを助けます。<br />
            House-AIが必要な人へ届けます。
          </p>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {actions.map(({ icon: Icon, label, path }) => (
              <button key={label} className="ec-action-btn" onClick={() => navigate(path)}>
                <Icon size={20} color="#D4AF37" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* City silhouette */}
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 0, pointerEvents: 'none' }}>
          <svg viewBox="0 0 1200 160" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{ width: '100%', height: 120, display: 'block' }}>
            <rect x="0"   y="80"  width="60"  height="80" fill="#0d1f35" />
            <rect x="10"  y="50"  width="20"  height="30" fill="#0d1f35" />
            <rect x="70"  y="60"  width="80"  height="100" fill="#0d1f35" />
            <rect x="100" y="40"  width="20"  height="20" fill="#0d1f35" />
            <rect x="160" y="90"  width="50"  height="70" fill="#0d1f35" />
            <rect x="220" y="50"  width="70"  height="110" fill="#0d1f35" />
            <rect x="240" y="30"  width="15"  height="20" fill="#0d1f35" />
            <rect x="300" y="70"  width="90"  height="90" fill="#0d1f35" />
            <rect x="330" y="45"  width="25"  height="25" fill="#0d1f35" />
            <rect x="400" y="55"  width="60"  height="105" fill="#0d1f35" />
            <rect x="470" y="80"  width="40"  height="80" fill="#0d1f35" />
            <rect x="520" y="40"  width="80"  height="120" fill="#0d1f35" />
            <rect x="545" y="20"  width="18"  height="20" fill="#0d1f35" />
            <rect x="610" y="65"  width="55"  height="95" fill="#0d1f35" />
            <rect x="675" y="50"  width="70"  height="110" fill="#0d1f35" />
            <rect x="695" y="30"  width="15"  height="20" fill="#0d1f35" />
            <rect x="755" y="75"  width="45"  height="85" fill="#0d1f35" />
            <rect x="810" y="55"  width="65"  height="105" fill="#0d1f35" />
            <rect x="835" y="35"  width="12"  height="20" fill="#0d1f35" />
            <rect x="885" y="70"  width="55"  height="90" fill="#0d1f35" />
            <rect x="950" y="45"  width="75"  height="115" fill="#0d1f35" />
            <rect x="975" y="25"  width="20"  height="20" fill="#0d1f35" />
            <rect x="1035" y="80" width="50"  height="80" fill="#0d1f35" />
            <rect x="1095" y="60" width="65"  height="100" fill="#0d1f35" />
            <rect x="1115" y="40" width="18"  height="20" fill="#0d1f35" />
            <rect x="0" y="130" width="1200" height="30" fill="#0d1f35" />
          </svg>
        </div>
      </div>
    </>
  );
}
