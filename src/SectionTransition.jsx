import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

export function SectionTransition() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.5, 1], [20, 0, -20]);

  return (
    <motion.div ref={ref} style={{ opacity, y, position: 'relative', height: '96px', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent, rgba(249,250,251,0.5), transparent)' }} />
      <motion.div animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.2, 1] }} transition={{ duration: 4, repeat: Infinity }} style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', width: '384px', height: '96px', background: 'linear-gradient(to right, rgba(212,175,55,0.1), rgba(212,175,55,0.2), rgba(212,175,55,0.1))', borderRadius: '999px', filter: 'blur(40px)' }} />
      <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', display: 'flex', gap: '8px' }}>
        {[0, 1, 2].map(i => (
          <motion.div key={i} animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }} transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }} style={{ width: '6px', height: '6px', background: '#D4AF37', borderRadius: '50%', boxShadow: '0 0 8px rgba(212,175,55,0.6)' }} />
        ))}
      </div>
    </motion.div>
  );
}
