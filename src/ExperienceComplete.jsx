import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { Search, MessageCircle, Users, Building2, UserCheck } from 'lucide-react';

const LEFT_BUILDINGS = [
  { left: 0,   width: 70, height: 320 },
  { left: 80,  width: 60, height: 250 },
  { left: 150, width: 75, height: 300 },
  { left: 235, width: 65, height: 220 },
];

const RIGHT_BUILDINGS = [
  { right: 0,   width: 70, height: 280 },
  { right: 80,  width: 65, height: 340 },
  { right: 155, width: 75, height: 260 },
  { right: 240, width: 60, height: 210 },
];

const ACTIONS = [
  { Icon: Search,         label: '似た悩みを見る', path: '/community' },
  { Icon: MessageCircle,  label: 'AIへ相談する',   path: '/' },
  { Icon: Users,          label: '相談室を見る',   path: '/community' },
  { Icon: Building2,      label: '物件を探す',     path: '/' },
  { Icon: UserCheck,      label: '専門家に相談',   path: '/' },
];

function BuildingCol({ pos }) {
  return (
    <div style={{ position: 'absolute', bottom: 0, width: pos.width, height: pos.height, left: pos.left !== undefined ? pos.left : undefined, right: pos.right !== undefined ? pos.right : undefined, background: '#0d1f3c', border: '1px solid rgba(0,180,255,0.2)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 12px)', gridTemplateRows: 'repeat(5, 12px)', gap: '6px', padding: '16px 10px 10px' }}>
        {Array.from({ length: 15 }).map((_, wi) => (
          <div
            key={wi}
            style={{
              width: 12,
              height: 12,
              background: '#00BFFF',
              opacity: 0.7 + Math.random() * 0.3,
              boxShadow: '0 0 4px rgba(0,191,255,0.5)',
              animation: `windowBlink ${1 + Math.random() * 2}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default function ExperienceComplete() {
  const navigate = useNavigate();
  const [hoverIndex, setHoverIndex] = useState(null);

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
    <div style={{ minHeight: '100vh', background: '#0A1628', position: 'relative', overflow: 'hidden' }}>

      {LEFT_BUILDINGS.map((b, i) => (
        <BuildingCol key={`l${i}`} pos={b} />
      ))}

      {RIGHT_BUILDINGS.map((b, i) => (
        <BuildingCol key={`r${i}`} pos={b} />
      ))}

      {[0, 1, 2].map(i => (
        <div key={i} style={{ position: 'absolute', top: `${100 + i * 80}px`, width: 20, height: 20, borderRadius: '50%', background: '#00D4FF', boxShadow: '0 0 10px #00D4FF', animation: `dronefly ${15 + i * 5}s linear infinite`, pointerEvents: 'none', zIndex: 2 }} />
      ))}

      <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', paddingTop: '60px' }}>

        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 80, height: 80, borderRadius: 16, border: '2px solid #D4AF37', background: 'rgba(212,175,55,0.1)' }}>
          <span style={{ fontSize: 32, color: '#D4AF37' }}>✦</span>
        </div>

        <h1 style={{ color: '#D4AF37', fontSize: 32, fontWeight: 700, marginTop: 24, marginBottom: 16 }}>✦ 投稿完了 ✦</h1>

        <p style={{ color: '#ffffff', fontSize: 16, lineHeight: 1.7, margin: '0 0 4px' }}>あなたの経験は、</p>
        <p style={{ color: '#ffffff', fontSize: 18, fontWeight: 600, lineHeight: 1.7, margin: '0 0 8px' }}>これから住まいを探す誰かを助けます。</p>
        <p style={{ color: '#00BFFF', fontSize: 14, margin: '0 0 48px' }}>House-AIが必要な人へ届けます。</p>

        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, letterSpacing: 2, marginBottom: 16 }}>次のアクション</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, maxWidth: 640, margin: '0 auto', padding: '0 16px 80px' }}>
          {ACTIONS.map(({ Icon, label, path }, idx) => (
            <button
              key={label}
              onClick={() => navigate(path)}
              onMouseEnter={() => setHoverIndex(idx)}
              onMouseLeave={() => setHoverIndex(null)}
              style={{ background: hoverIndex === idx ? 'rgba(0,191,255,0.12)' : 'rgba(255,255,255,0.06)', border: hoverIndex === idx ? '1px solid rgba(0,191,255,0.4)' : '1px solid rgba(255,255,255,0.12)', borderRadius: 16, padding: '24px 16px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', fontFamily: 'inherit', transition: 'all 0.2s ease', boxShadow: hoverIndex === idx ? 'inset 0 1px 0 rgba(0,191,255,0.2), 0 4px 20px rgba(0,191,255,0.15)' : 'inset 0 1px 0 rgba(255,255,255,0.1), 0 4px 16px rgba(0,0,0,0.3)' }}
            >
              <Icon size={28} color={hoverIndex === idx ? '#00BFFF' : '#60a5fa'} />
              <p style={{ color: '#ffffff', fontSize: 13, margin: '8px 0 0' }}>{label}</p>
            </button>
          ))}
        </div>

        <div style={{ marginTop: 32, textAlign: 'center' }}>
          <button
            onClick={() => window.location.href = '/experiences/feed'}
            style={{
              background: 'transparent',
              color: '#00BFFF',
              border: '2px solid rgba(0,191,255,0.5)',
              borderRadius: 50,
              padding: '14px 48px',
              fontSize: 16,
              fontWeight: 700,
              cursor: 'pointer',
              letterSpacing: '0.05em',
              boxShadow: '0 4px 20px rgba(0,191,255,0.2)',
              transition: 'all 0.2s ease',
              display: 'block',
              width: '100%',
              maxWidth: 240,
              margin: '0 auto'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(0,191,255,0.1)'
              e.currentTarget.style.borderColor = 'rgba(0,191,255,0.8)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.borderColor = 'rgba(0,191,255,0.5)'
            }}
          >
            投稿一覧を見る
          </button>
          <button
            onClick={() => window.location.href = '/'}
            style={{
              background: 'linear-gradient(135deg, #D4AF37, #FFD700, #D4AF37)',
              color: '#0A1628',
              border: 'none',
              borderRadius: 50,
              padding: '14px 48px',
              fontSize: 16,
              fontWeight: 700,
              cursor: 'pointer',
              letterSpacing: '0.05em',
              boxShadow: '0 4px 20px rgba(212,175,55,0.5), 0 2px 8px rgba(0,0,0,0.3)',
              transition: 'all 0.2s ease',
              display: 'block',
              width: '100%',
              maxWidth: 240,
              margin: '8px auto 0'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.boxShadow = '0 6px 28px rgba(212,175,55,0.7), 0 2px 8px rgba(0,0,0,0.3)'
              e.currentTarget.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(212,175,55,0.5), 0 2px 8px rgba(0,0,0,0.3)'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            ホームに戻る
          </button>
        </div>
      </div>
    </div>
  );
}
