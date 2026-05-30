import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';

const NavIcons = {
  home: (active) => (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 10L11 3L19 10V19H14V14H8V19H3V10Z" stroke={active ? '#1a3a5c' : '#94a3b8'} strokeWidth="1.5" strokeLinejoin="round"/>
      <rect x="9" y="14" width="4" height="5" rx="0.5" stroke={active ? '#1a3a5c' : '#94a3b8'} strokeWidth="1.2"/>
    </svg>
  ),
  properties: (active) => (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="4" width="16" height="14" rx="2" stroke={active ? '#1a3a5c' : '#94a3b8'} strokeWidth="1.5"/>
      <path d="M3 9H19" stroke={active ? '#1a3a5c' : '#94a3b8'} strokeWidth="1.2"/>
      <path d="M8 4V9" stroke={active ? '#1a3a5c' : '#94a3b8'} strokeWidth="1.2"/>
      <path d="M14 4V9" stroke={active ? '#1a3a5c' : '#94a3b8'} strokeWidth="1.2"/>
      <circle cx="7" cy="13" r="1.2" fill={active ? '#1a3a5c' : '#94a3b8'}/>
      <circle cx="11" cy="13" r="1.2" fill={active ? '#1a3a5c' : '#94a3b8'}/>
      <circle cx="15" cy="13" r="1.2" fill={active ? '#1a3a5c' : '#94a3b8'}/>
    </svg>
  ),
  experiences: (active) => (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M11 2L13.5 8H20L14.5 12L16.5 18L11 14L5.5 18L7.5 12L2 8H8.5L11 2Z" stroke={active ? '#1a3a5c' : '#94a3b8'} strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
  ),
  community_room: (active) => (
    <MessageSquare size={22} color={active ? '#1a3a5c' : '#94a3b8'} />
  ),
  expert: (active) => (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="8" cy="7" r="3" stroke={active ? '#1a3a5c' : '#94a3b8'} strokeWidth="1.5"/>
      <circle cx="14" cy="7" r="3" stroke={active ? '#1a3a5c' : '#94a3b8'} strokeWidth="1.5"/>
      <path d="M2 18C2 15.2 4.7 13 8 13" stroke={active ? '#1a3a5c' : '#94a3b8'} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M20 18C20 15.2 17.3 13 14 13C10.7 13 8 15.2 8 18" stroke={active ? '#1a3a5c' : '#94a3b8'} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  member: (active) => (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="11" cy="7" r="3.5" stroke={active ? '#1a3a5c' : '#94a3b8'} strokeWidth="1.5"/>
      <path d="M3 19C3 15.7 6.6 13 11 13C15.4 13 19 15.7 19 19" stroke={active ? '#1a3a5c' : '#94a3b8'} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
};

const TABS = [
  { label: 'ホーム',     id: 'home' },
  { label: '物件',       id: 'properties' },
  { label: '体験談',     id: 'experiences' },
  { label: '相談室',     id: 'community_room' },
  { label: '専門家相談', id: 'expert' },
  { label: 'マイページ', id: 'member' },
];

const SHOW_PATHS = ['/experiences/feed', '/experiences/complete'];

export default function BottomNav() {
  const location = useLocation();
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      if (currentY > lastScrollY.current) {
        setVisible(false);
      } else {
        setVisible(true);
      }
      lastScrollY.current = currentY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isPost = location.pathname.startsWith('/experiences/post/');
  if (!SHOW_PATHS.includes(location.pathname) && !isPost) return null;

  const handleClick = (id) => {
    if (id === 'home') {
      window.location.href = '/';
    } else if (id === 'properties') {
      window.location.href = '/';
    } else if (id === 'experiences') {
      window.location.href = '/experiences';
    } else if (id === 'community_room') {
      window.location.href = '/community';
    } else if (id === 'expert') {
      window.location.href = '/';
    } else if (id === 'member') {
      window.location.href = '/';
    }
  };

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      height: 64,
      background: '#fff',
      borderTop: '1px solid #e2e8f0',
      display: 'flex',
      zIndex: 8000,
      paddingBottom: 'env(safe-area-inset-bottom)',
      transform: visible ? 'translateY(0)' : 'translateY(100%)',
      transition: 'transform 0.3s ease',
    }}>
      {TABS.map(({ label, id }) => {
        const isActive = id === 'experiences' ? location.pathname.startsWith('/experiences') : false;
        return (
          <button
            key={id}
            onClick={() => handleClick(id)}
            style={{
              flex: 1, background: 'none', border: 'none', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: 2, padding: '6px 0',
            }}
          >
            {NavIcons[id](isActive)}
            <span style={{ fontSize: 10, fontWeight: isActive ? 700 : 400, color: isActive ? '#1a3a5c' : '#94a3b8' }}>{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
