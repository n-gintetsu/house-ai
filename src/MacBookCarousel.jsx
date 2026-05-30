import { useState, useEffect } from "react";
import { Heart, Bookmark, ThumbsUp, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';

const MAC8_PROPS = [
  { id: 1, image: 'https://images.unsplash.com/photo-1680416124510-5eae1beca412?w=800', title: 'リノベーション済み物件',    badgeGradient: 'linear-gradient(to right,#a855f7,#ec4899)' },
  { id: 2, image: 'https://images.unsplash.com/photo-1682184805271-11671b7ecf4c?w=800', title: 'タワーマンション最上階',    badgeGradient: 'linear-gradient(to right,#a855f7,#ec4899)' },
  { id: 3, image: 'https://images.unsplash.com/photo-1663811397207-418a92396ad5?w=800', title: 'デザイナーズマンション',    badgeGradient: 'linear-gradient(to right,#a855f7,#ec4899)' },
  { id: 4, image: 'https://images.unsplash.com/photo-1667584523543-d1d9cc828a15?w=800', title: 'モダンラグジュアリー空間',  badgeGradient: 'linear-gradient(to right,#3b82f6,#06b6d4)' },
  { id: 5, image: 'https://images.unsplash.com/photo-1653972233597-05822baa3c4e?w=800', title: 'シャンデリア付き高級物件',  badgeGradient: 'linear-gradient(to right,#f59e0b,#f97316)' },
  { id: 6, image: 'https://images.unsplash.com/photo-1638454668466-e8dbd5462f20?w=800', title: 'スタイリッシュベッドルーム', badgeGradient: 'linear-gradient(to right,#22c55e,#10b981)' },
  { id: 7, image: 'https://images.unsplash.com/photo-1638454795595-0a0abf68614d?w=800', title: '大型テレビ付きリビング',    badgeGradient: 'linear-gradient(to right,#f43f5e,#ec4899)' },
  { id: 8, image: 'https://images.unsplash.com/photo-1715985160053-d339e8b6eb94?w=800', title: 'プレミアムキッチン付き',    badgeGradient: 'linear-gradient(to right,#6366f1,#a855f7)' },
];

function Carousel({ onNavigate }) {
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setRotation(r => r + 0.3), 50);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{ background: '#0A1628', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', perspective: '800px' }}>
        <div style={{ position: 'relative', width: '180px', height: '280px', transformStyle: 'preserve-3d', transform: `rotateY(${rotation}deg)` }}>
          {MAC8_PROPS.map((item, i) => {
            const angle = (360 / MAC8_PROPS.length) * i;
            return (
              <div
                key={item.id}
                style={{ position: 'absolute', top: 0, left: 0, width: '180px', height: '280px', transform: `rotateY(${angle}deg) translateZ(320px)`, borderRadius: '16px', overflow: 'hidden', cursor: 'pointer' }}
                onClick={() => onNavigate('properties')}
              >
                <img src={item.image} alt={item.title} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.85), rgba(0,0,0,0.1), transparent)' }} />
                <div style={{ position: 'absolute', top: 8, right: 8, background: item.badgeGradient, color: 'white', padding: '3px 8px', borderRadius: 9999, fontSize: 10, fontWeight: 600, whiteSpace: 'nowrap' }}>AI推奨物件</div>
                <div style={{ position: 'absolute', bottom: 28, left: 8, right: 8, display: 'flex', gap: 4 }}>
                  {[Heart, Bookmark, ThumbsUp, Share2].map((Icon, j) => (
                    <motion.button
                      key={j}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={e => e.stopPropagation()}
                      style={{ flex: 1, background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', padding: '6px', borderRadius: 9999, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <Icon size={10} color="white" />
                    </motion.button>
                  ))}
                </div>
                <div style={{ position: 'absolute', bottom: 8, left: 8, right: 8, color: 'white', fontSize: 12, fontWeight: 500, lineHeight: 1.3 }}>{item.title}</div>
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg,#ff0000,#ff7f00,#ffff00,#00ff00,#0000ff,#9400d3)' }} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function MacBookCarousel({ onNavigate }) {
  return (
    <div className="macbook-wrap">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: [0.34, 1.56, 0.64, 1] }}
      >
        <div style={{ perspective: '1200px', transform: 'rotateX(-2deg)', transformOrigin: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ position: 'relative', background: '#000', borderRadius: 16, width: 700, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.1)', padding: 12 }}>
            <div style={{ position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)', width: 64, height: 6, background: '#1e293b', borderRadius: 9999 }} />
            <div style={{ aspectRatio: '16/10', background: '#0A1628', borderRadius: 8, overflow: 'hidden', position: 'relative' }}>
              <Carousel onNavigate={onNavigate} />
            </div>
          </div>
          <div style={{ position: 'relative', background: 'linear-gradient(to bottom, #cbd5e1, #94a3b8)', borderRadius: '0 0 12px 12px', height: 20, width: 700, transform: 'perspective(1200px) rotateX(65deg)', transformOrigin: 'top', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)' }}>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 128, height: 8, background: 'rgba(100,116,139,0.3)', borderRadius: 4 }} />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
