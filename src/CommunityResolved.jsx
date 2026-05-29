import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const GOLD = '#D8B33F';
const CONFETTI_COLORS = ['#D8B33F', '#FFFFFF', '#BFDBFE', '#DDD6FE'];

const PIECES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  x: (i * 5.78 + 3) % 100,
  color: CONFETTI_COLORS[i % 4],
  delay: (i % 5) * 0.08,
  dur: 1.6 + (i % 4) * 0.2,
  rotation: (i * 41) % 360,
  size: 7 + (i % 3) * 2,
}));

export default function CommunityResolved({ userName, onClose }) {
  const [visible, setVisible] = useState(true);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(false);
      onCloseRef.current();
    }, 3000);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0,
        height: '20vh', zIndex: 9999, pointerEvents: 'none',
        overflow: 'hidden',
      }}>
        {PIECES.map(p => (
          <motion.div
            key={`resolved-confetti-${p.id}`}
            initial={{ x: `${p.x}vw`, y: '-12px', opacity: 1, rotate: p.rotation }}
            animate={{ y: '20vh', opacity: 0, rotate: p.rotation + 180 }}
            transition={{ duration: p.dur, delay: p.delay, ease: 'easeIn' }}
            style={{
              position: 'absolute',
              top: 0, left: 0,
              width: `${p.size}px`, height: `${p.size * 1.5}px`,
              background: p.color,
              borderRadius: '2px',
            }}
          />
        ))}
      </div>

      <AnimatePresence>
        {visible ? (
          <motion.div
            key="resolved-banner"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            style={{
              position: 'fixed',
              top: '24px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 10000,
              pointerEvents: 'none',
              background: 'rgba(8,14,36,0.92)',
              border: '1px solid rgba(216,179,63,0.3)',
              borderRadius: '16px',
              padding: '16px 28px',
              textAlign: 'center',
              backdropFilter: 'blur(8px)',
              minWidth: '280px',
              maxWidth: '90vw',
            }}
          >
            <div style={{ color: GOLD, fontWeight: 700, fontSize: '15px', lineHeight: 1.5, marginBottom: '6px' }}>
              {`${userName}さんの悩みが解決されました`}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: '13px', lineHeight: 1.6 }}>
              みんなの知識が誰かを救いました
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
