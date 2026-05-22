import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Home, Calculator, BookOpen, Users, Wrench, ChevronRight, UserPlus, Star, Smile, Zap } from 'lucide-react';
import { supabase } from './lib/supabase';

const GOLD = '#D8B33F';
const BG = '#071426';
const FREE_LIMIT = 5;

const DAILY_LIMIT = 5;
const STORAGE_KEY = 'house_ai_concierge_usage';

function getUsageData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { count: 0, date: new Date().toDateString() };
    const data = JSON.parse(raw);
    if (data.date !== new Date().toDateString()) {
      return { count: 0, date: new Date().toDateString() };
    }
    return data;
  } catch(e) {
    return { count: 0, date: new Date().toDateString() };
  }
}

function incrementUsage() {
  const data = getUsageData();
  data.count = data.count + 1;
  data.date = new Date().toDateString();
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch(e) {}
  return data.count;
}

function getRemainingCount() {
  const data = getUsageData();
  return Math.max(0, DAILY_LIMIT - data.count);
}

const CHARACTERS = [
  { id: 'polite', name: '丁寧系', desc: '親切・丁寧にご案内します', Icon: Star },
  { id: 'comedy', name: 'お笑い系', desc: 'ユーモアたっぷりでご案内', Icon: Smile },
  { id: 'ds', name: 'ドS系', desc: 'ビシッと的確にご案内', Icon: Zap },
];

const ACTIONS = [
  { id: 'property', label: '物件を探したい', Icon: Home },
  { id: 'mortgage', label: '住宅ローンを相談したい', Icon: Calculator },
  { id: 'stories', label: '体験談を見たい', Icon: BookOpen },
  { id: 'expert', label: '専門家に相談したい', Icon: Users },
  { id: 'tools', label: '便利ツールを使いたい', Icon: Wrench },
];

const HAPPY_LOGS = [
  '山田さんが理想のお部屋を契約しました',
  '初めての住宅ローン相談が完了しました',
  'AI相談から問題が解決されました',
  '新着物件が3件追加されました',
  '鈴木さんが内見予約を完了しました',
  '体験談への共感が急増しています',
  '住宅ローン条件を整理しています…',
  '人気エリアを分析しています…',
  '類似体験談を検索しています…',
  'ローン相談が増えています…',
  '条件に合う物件を整理中…',
  '市場データを更新しています…',
  'コミュニティで問題が解決されました',
  'ベスト回答が選ばれました',
];

const SYSTEM_PROMPTS = {
  polite: 'あなたは丁寧で親切な不動産AIコンシェルジュです。敬語で、ユーザーに寄り添い、分かりやすく回答してください。絵文字は一切使わないでください。',
  comedy: 'あなたはユーモアあふれる不動産AIコンシェルジュです。面白い例えや軽いジョークを交えながら、しっかりした内容で回答してください。絵文字は一切使わないでください。',
  ds: 'あなたはドS系の不動産AIコンシェルジュです。ちょっと厳しめに、でも的確に回答してください。ユーザーを甘やかさず、ビシッと指摘するスタイルです。絵文字は一切使わないでください。',
};

const WELCOME_MESSAGES = {
  polite: 'こんにちは。不動産のことなら何でもご相談ください。\n一つずつ丁寧に整理していきましょう。',
  comedy: 'やあやあ、ようこそ！不動産の悩みを笑いと共に解決しましょう。\nなんでも気軽に聞いてや〜！',
  ds: 'よし来い。不動産の悩みならビシッと答えてやる。\n条件をはっきり言ってくれると助かります。',
};

const TOOL_KEYWORD_MAP = [
  { keywords: ['住宅ローン', 'ローン', '返済', '金利', '月々'], toolId: 'mortgage', label: '住宅ローンシミュレーション' },
  { keywords: ['投資', '利回り', '収益', '投資ローン'], toolId: 'investment', label: '投資ローンシミュレータ' },
  { keywords: ['初心者', '勉強', '知識', 'ドリル'], toolId: 'beginner', label: '投資初心者ドリル' },
  { keywords: ['諸費用', '購入費用', '初期費用'], toolId: 'costs', label: '諸費用計算' },
  { keywords: ['税金', '不動産税', '譲渡', '売買税'], toolId: 'tax', label: '不動産税金整理' },
  { keywords: ['宅建', '用語', '専門用語'], toolId: 'dictionary', label: '宅建用語集' },
  { keywords: ['火災保険', '保険', '補償'], toolId: 'insurance', label: '火災保険整理' },
  { keywords: ['引越し', '引っ越し', '引越費用'], toolId: 'moving', label: '引越し費用比較' },
];

function findToolByKeyword(input) {
  const text = input || '';
  for (const item of TOOL_KEYWORD_MAP) {
    for (const kw of item.keywords) {
      if (text.includes(kw)) return item;
    }
  }
  return null;
}

const EVENTS = [
  { label: '内見予約完了', toast: '理想のお部屋と出会えますように', type: 'celebration' },
  { label: '契約完了', toast: 'おめでとうございます。新生活のスタートですね。', type: 'contract' },
];

const GLOW_RINGS = [
  { offset: '-8px', opacity: 0.5, dur: 3.0 },
  { offset: '-16px', opacity: 0.3, dur: 4.5 },
  { offset: '-24px', opacity: 0.15, dur: 6.0 },
];

const PARTICLES = Array.from({ length: 8 }, (_, i) => ({
  id: i,
  cx: Math.cos(i * Math.PI / 4) * (44 + (i % 3) * 6),
  cy: Math.sin(i * Math.PI / 4) * (44 + (i % 3) * 6),
  delay: i * 0.35,
  dur: 3 + (i % 3),
}));

const CEL_ANGLES = Array.from({ length: 8 }, (_, i) => i * 45);
const THINKING_DELAYS = [0, 0.2, 0.4];

export default function AIConcierge() {
  const [isOpen, setIsOpen] = useState(false);
  const [phase, setPhase] = useState('char');
  const [character, setCharacter] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [chatCount, setChatCount] = useState(0);
  const [badge, setBadge] = useState(1);
  const [logIndex, setLogIndex] = useState(0);
  const [showLog, setShowLog] = useState(false);
  const [toolFoundFlash, setToolFoundFlash] = useState(false);
  const [eventToast, setEventToast] = useState(null);
  const [celebrationActive, setCelebrationActive] = useState(false);
  const [confettiPieces, setConfettiPieces] = useState([]);
  const [showDemoPanel, setShowDemoPanel] = useState(false);
  const [dynamicLog, setDynamicLog] = useState(null);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [remaining, setRemaining] = useState(DAILY_LIMIT);
  const [showLimitMsg, setShowLimitMsg] = useState(false);
  const [lastHistoryLabel, setLastHistoryLabel] = useState(null);
  const [panelGlowActive, setPanelGlowActive] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setShowLog(false);
      return;
    }
    const showTimer = setTimeout(() => setShowLog(true), 2500);
    const cycleInterval = setInterval(() => {
      setLogIndex(prev => (prev + 1) % HAPPY_LOGS.length);
    }, 6000);
    return () => {
      clearTimeout(showTimer);
      clearInterval(cycleInterval);
    };
  }, [isOpen]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const session = data.session || null;
      const user = session ? session.user : null;
      setLoggedInUser(user);
      if (user) {
        setRemaining(999);
      } else {
        setRemaining(getRemainingCount());
      }
    });
  }, []);

  useEffect(() => {
    const handler = (e) => {
      const name = (e.detail && e.detail.userName) || 'ユーザー';
      setDynamicLog(`${name}さんの悩みが解決されました`);
      setTimeout(() => setDynamicLog(null), 4000);
    };
    window.addEventListener('community-solved', handler);
    return () => window.removeEventListener('community-solved', handler);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending, isThinking]);

  const handleOpen = () => {
    setIsOpen(true);
    setBadge(0);
    setShowLog(false);
    if (loggedInUser) {
      setPanelGlowActive(true);
      setTimeout(() => setPanelGlowActive(false), 800);
      supabase
        .from('user_concierge_history')
        .select('action_label, created_at')
        .eq('user_id', loggedInUser.id)
        .order('created_at', { ascending: false })
        .limit(5)
        .then(({ data }) => {
          const items = data || [];
          setLastHistoryLabel(items.length > 0 ? items[0].action_label : null);
        });
    }
  };

  const selectCharacter = (charId) => {
    setCharacter(charId);
    let welcomeText = WELCOME_MESSAGES[charId];
    if (loggedInUser) {
      const namePart = (loggedInUser.email || '').split('@')[0];
      welcomeText = `おかえりなさいませ。${namePart}さん。`;
      if (lastHistoryLabel !== null) {
        welcomeText += `\n前回は${lastHistoryLabel}をご相談されていましたね。`;
      }
      welcomeText += '\n本日は続きを整理しますか？';
    }
    setMessages([{ role: 'assistant', text: welcomeText }]);
    setPhase('action');
  };

  const callClaude = async (msgs, charId) => {
    const res = await fetch('/api/claude', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        model: import.meta.env.VITE_CLAUDE_MODEL || 'claude-sonnet-4-5',
        system: SYSTEM_PROMPTS[charId || character],
        messages: msgs.map(m => ({
          role: m.role === 'user' ? 'user' : 'assistant',
          content: [{ type: 'text', text: m.text }],
        })),
        max_tokens: 500,
      }),
    });
    const data = await res.json().catch(() => ({}));
    return typeof data?.text === 'string' ? data.text : 'エラーが発生しました。';
  };

  const doSend = async (newMessages) => {
    setIsThinking(true);
    setIsSending(true);
    setTimeout(() => setIsThinking(false), 800);
    try {
      const reply = await callClaude(newMessages, character);
      const newCount = chatCount + 1;
      setChatCount(newCount);
      const withReply = [...newMessages, { role: 'assistant', text: reply }];
      setMessages(withReply);
      if (!loggedInUser && newCount >= FREE_LIMIT) {
        setTimeout(() => setPhase('limit'), 600);
      }
    } catch {
      setMessages([...newMessages, { role: 'assistant', text: 'エラーが発生しました。しばらくしてからお試しください。' }]);
    } finally {
      setIsThinking(false);
      setIsSending(false);
    }
  };

  const selectAction = (action) => {
    if (!loggedInUser && remaining <= 0) {
      setShowLimitMsg(true);
      return;
    }
    if (!loggedInUser) {
      incrementUsage();
      setRemaining(getRemainingCount());
    }
    if (loggedInUser) {
      supabase.from('user_concierge_history').insert({
        user_id: loggedInUser.id,
        action_type: action.id,
        action_label: action.label,
      });
    }
    if (action.id === 'tools') {
      const newMessages = [
        ...messages,
        { role: 'user', text: action.label },
        { role: 'assistant', text: 'どのツールをお探しですか？キーワードで教えてください。\n例：住宅ローン、税金、引越し' },
      ];
      setMessages(newMessages);
      setPhase('tool-search');
      return;
    }
    const newMessages = [...messages, { role: 'user', text: action.label }];
    setMessages(newMessages);
    setPhase('chat');
    doSend(newMessages);
  };

  const handleToolSearch = () => {
    const text = input.trim();
    if (!text) return;
    setInput('');
    const match = findToolByKeyword(text);
    const userMsg = { role: 'user', text };
    if (match) {
      setMessages(prev => [...prev, userMsg, { role: 'assistant', text: `${match.label}へご案内します。` }]);
      window.dispatchEvent(new CustomEvent('navigate', { detail: { tab: 'home' } }));
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('open-tool-hub'));
        setTimeout(() => {
          const el = document.getElementById(`tool-card-${match.toolId}`);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el.classList.add('ai-guide-highlight');
            setTimeout(() => el.classList.remove('ai-guide-highlight'), 1460);
          }
          setToolFoundFlash(true);
          setTimeout(() => setToolFoundFlash(false), 2500);
          setMessages(prev => [...prev, { role: 'assistant', text: 'こちらです。登録不要で使えます。' }]);
        }, 700);
      }, 400);
    } else {
      setMessages(prev => [...prev, userMsg, { role: 'assistant', text: '該当するツールが見つかりませんでした。別のキーワードをお試しください。' }]);
    }
  };

  const handleSendInput = () => {
    const text = input.trim();
    if (!text || isSending) return;
    const newMessages = [...messages, { role: 'user', text }];
    setMessages(newMessages);
    setInput('');
    doSend(newMessages);
  };

  const handleReset = () => {
    setPhase('char');
    setCharacter(null);
    setMessages([]);
    setInput('');
    setChatCount(0);
    setIsThinking(false);
    setToolFoundFlash(false);
    setShowLimitMsg(false);
  };

  const triggerEvent = (event) => {
    setEventToast({ text: event.toast, type: event.type });
    setTimeout(() => setEventToast(null), 3500);
    if (event.type === 'celebration') {
      setCelebrationActive(true);
      setTimeout(() => setCelebrationActive(false), 2000);
    }
    if (event.type === 'contract') {
      const pieces = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: (i * 5.17 + 2.3) % 100,
        color: ['#D8B33F', '#FFFFFF', '#93C5FD'][i % 3],
        delay: (i % 5) * 0.1,
        dur: 1.8 + (i % 3) * 0.25,
        rotation: (i * 37) % 360,
        size: 7 + (i % 3) * 2,
      }));
      setConfettiPieces(pieces);
      setTimeout(() => setConfettiPieces([]), 2600);
    }
  };

  const charObj = CHARACTERS.find(c => c.id === character) || null;

  return (
    <>
      <style>{`
        @keyframes ai-concierge-pulse {
          0%, 100% { opacity: 0.3; transform: translateY(0); }
          50% { opacity: 1; transform: translateY(-3px); }
        }
        @keyframes ai-thinking-dot {
          0%, 80%, 100% { opacity: 0.2; transform: scale(0.7); }
          40% { opacity: 1; transform: scale(1); }
        }
      `}</style>

      {/* Confetti — top 20% of screen, falls and fades */}
      {confettiPieces.map(p => (
        <motion.div
          key={`confetti-${p.id}`}
          initial={{ x: `${p.x}vw`, y: '-10px', opacity: 1, rotate: p.rotation }}
          animate={{ y: '18vh', opacity: 0, rotate: p.rotation + 180 }}
          transition={{ duration: p.dur, delay: p.delay, ease: 'easeIn' }}
          style={{
            position: 'fixed',
            top: 0, left: 0,
            width: `${p.size}px`, height: `${p.size * 1.5}px`,
            background: p.color,
            borderRadius: '2px',
            zIndex: 99999,
            pointerEvents: 'none',
          }}
        />
      ))}

      {/* Event toast */}
      <AnimatePresence>
        {eventToast !== null ? (
          <motion.div
            key="event-toast"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4 }}
            style={{
              position: 'fixed',
              bottom: '104px',
              right: '20px',
              background: eventToast.type === 'celebration' ? 'rgba(216,179,63,0.18)' : BG,
              color: GOLD,
              border: `1px solid ${GOLD}`,
              borderRadius: '12px',
              padding: '10px 16px',
              fontSize: '13px', fontWeight: 600,
              zIndex: 10001,
              boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
              maxWidth: '240px',
              pointerEvents: 'none',
            }}
          >
            {eventToast.text}
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* AI log — visible when panel is closed */}
      {showLog ? (
        <div style={{ position: 'fixed', bottom: '38px', right: '52px', zIndex: 9997, pointerEvents: 'none' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={logIndex}
              initial={{ opacity: 0, x: -20, filter: 'blur(6px)' }}
              animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, x: 10, filter: 'blur(4px)' }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(7,20,38,0.92)',
                border: '1px solid rgba(216,179,63,0.25)',
                borderRadius: '999px',
                padding: '6px 14px 6px 10px',
                backdropFilter: 'blur(8px)',
              }}
            >
              <motion.div
                animate={{ opacity: [0, 1, 0, 1, 0, 1, 1] }}
                transition={{ duration: 1.2 }}
                style={{ width: '6px', height: '6px', borderRadius: '50%', background: GOLD, flexShrink: 0 }}
              />
              <span style={{ color: 'rgba(216,179,63,0.85)', fontSize: '12px', fontWeight: 500, whiteSpace: 'nowrap' }}>
                {dynamicLog !== null ? dynamicLog : HAPPY_LOGS[logIndex]}
              </span>
            </motion.div>
          </AnimatePresence>
        </div>
      ) : null}

      {/* FAB wrapper */}
      <div style={{ position: 'fixed', bottom: '28px', right: '-20px', zIndex: 9999, width: '60px', height: '60px' }}>

        {/* Ripple rings */}
        {[0, 0.9, 1.8].map((delay, i) => (
          <motion.div
            key={`ripple-${i}`}
            style={{
              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
              borderRadius: '50%',
              border: '1px solid rgba(216,179,63,0.35)',
              pointerEvents: 'none',
            }}
            animate={{ scale: [1, 2.8], opacity: [0.4, 0] }}
            transition={{ duration: 2.7, repeat: Infinity, delay, ease: 'easeOut' }}
          />
        ))}

        {/* Outer glow rings */}
        {GLOW_RINGS.map((ring, i) => (
          <motion.div
            key={`ring-${i}`}
            style={{
              position: 'absolute',
              top: ring.offset, right: ring.offset, bottom: ring.offset, left: ring.offset,
              borderRadius: '50%',
              border: `1px solid ${GOLD}`,
              pointerEvents: 'none',
            }}
            animate={{ opacity: [ring.opacity, 0, ring.opacity], scale: [1, 1.8, 1] }}
            transition={{ duration: ring.dur, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}

        {/* Micro particles */}
        {PARTICLES.map(p => (
          <motion.div
            key={`particle-${p.id}`}
            style={{
              position: 'absolute',
              top: `${30 + p.cy - 1}px`,
              left: `${30 + p.cx - 1}px`,
              width: '2px', height: '2px',
              borderRadius: '50%',
              background: GOLD,
              pointerEvents: 'none',
            }}
            animate={{ y: [-4, 4, -4], opacity: [0.08, 0.28, 0.08] }}
            transition={{ duration: p.dur, repeat: Infinity, delay: p.delay, ease: 'easeInOut' }}
          />
        ))}

        {/* Celebration burst particles */}
        {celebrationActive ? (
          CEL_ANGLES.map((angle, i) => {
            const rad = angle * Math.PI / 180;
            const tx = Math.cos(rad) * 80;
            const ty = Math.sin(rad) * 80;
            return (
              <motion.div
                key={`cel-${i}`}
                initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                animate={{ x: tx, y: ty, opacity: 0, scale: 0.3 }}
                transition={{ duration: 1.2, ease: 'easeOut', delay: i * 0.04 }}
                style={{
                  position: 'absolute',
                  top: '50%', left: '50%',
                  width: '8px', height: '8px',
                  borderRadius: '50%',
                  background: GOLD,
                  marginTop: '-4px', marginLeft: '-4px',
                  pointerEvents: 'none',
                  zIndex: 2,
                }}
              />
            );
          })
        ) : null}

        {/* Breathing FAB */}
        <motion.div
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          onClick={isOpen ? () => setIsOpen(false) : handleOpen}
          style={{ cursor: 'pointer', position: 'absolute', top: 0, left: 0, width: '60px', height: '60px' }}
        >
          {badge > 0 ? (
            <div style={{
              position: 'absolute', top: '-4px', left: '2px',
              background: '#ef4444', color: 'white', borderRadius: '999px',
              width: '18px', height: '18px', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: '11px', fontWeight: 700,
              zIndex: 1, pointerEvents: 'none',
            }}>{badge}</div>
          ) : null}
          <div style={{
            width: '60px', height: '60px', borderRadius: '50%',
            background: BG, border: `2.5px solid ${GOLD}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 4px 20px rgba(0,0,0,0.5), 0 0 14px rgba(216,179,63,0.35)`,
            overflow: 'hidden',
          }}>
            <img src="/logo.png" alt="AI" style={{ width: '46px', height: '46px', objectFit: 'contain' }} />
          </div>
        </motion.div>
      </div>

      {/* Demo controls */}
      <div style={{ position: 'fixed', bottom: '10px', left: '10px', zIndex: 10000 }}>
        {showDemoPanel ? (
          <div style={{
            position: 'absolute', bottom: '36px', left: 0,
            background: BG, border: `1px solid rgba(216,179,63,0.3)`,
            borderRadius: '12px', padding: '10px', minWidth: '164px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
          }}>
            <div style={{ color: 'rgba(216,179,63,0.6)', fontSize: '10px', fontWeight: 600, marginBottom: '8px', letterSpacing: '0.05em' }}>
              DEMO EVENTS
            </div>
            {EVENTS.map(ev => (
              <button
                key={ev.label}
                type="button"
                onClick={() => { triggerEvent(ev); setShowDemoPanel(false); }}
                style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  background: 'rgba(216,179,63,0.08)', border: '1px solid rgba(216,179,63,0.2)',
                  borderRadius: '8px', padding: '8px 10px', marginBottom: '6px',
                  color: 'rgba(255,255,255,0.85)', fontSize: '12px', cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                {ev.label}
              </button>
            ))}
          </div>
        ) : null}
        <button
          type="button"
          onClick={() => setShowDemoPanel(prev => !prev)}
          style={{
            background: 'rgba(7,20,38,0.7)', border: `1px solid rgba(216,179,63,0.2)`,
            borderRadius: '8px', padding: '4px 8px',
            color: 'rgba(216,179,63,0.5)', fontSize: '10px', cursor: 'pointer',
            fontFamily: 'inherit', fontWeight: 600, letterSpacing: '0.04em',
          }}
        >
          DEMO
        </button>
      </div>

      {/* Panel */}
      <AnimatePresence>
        {isOpen ? (
          <motion.div
            key="concierge-panel"
            initial={{ opacity: 0, y: 40, scale: 0.92, filter: 'blur(8px)' }}
            animate={{
              opacity: 1, y: 0, scale: 1, filter: 'blur(0px)',
              boxShadow: panelGlowActive
                ? [
                    '0 8px 48px rgba(0,0,0,0.7), 0 0 0px rgba(216,179,63,0)',
                    '0 8px 48px rgba(0,0,0,0.7), 0 0 60px rgba(216,179,63,0.75), inset 0 0 24px rgba(216,179,63,0.12)',
                    '0 8px 48px rgba(0,0,0,0.7), 0 0 0px rgba(216,179,63,0)',
                  ]
                : [
                    '0 8px 48px rgba(0,0,0,0.7), 0 0 0px rgba(216,179,63,0)',
                    '0 8px 48px rgba(0,0,0,0.7), 0 0 30px rgba(216,179,63,0.15)',
                    '0 8px 48px rgba(0,0,0,0.7), 0 0 0px rgba(216,179,63,0)',
                  ],
            }}
            exit={{ opacity: 0, y: 20, scale: 0.96, filter: 'blur(4px)' }}
            transition={{
              opacity: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
              y: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
              scale: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
              filter: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
              boxShadow: panelGlowActive
                ? { duration: 0.8, repeat: 0, ease: 'easeInOut' }
                : { duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.5 },
            }}
            style={{
              position: 'fixed', bottom: '100px', right: '16px',
              width: '340px', maxHeight: '560px',
              background: BG, border: `1.5px solid ${GOLD}`,
              borderRadius: '20px', zIndex: 9998,
              display: 'flex', flexDirection: 'column', overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '14px 16px', borderBottom: `1px solid rgba(216,179,63,0.25)`, flexShrink: 0,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img src="/logo.png" alt="H" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
                <div>
                  <div style={{ color: GOLD, fontWeight: 700, fontSize: '14px', lineHeight: 1.2 }}>AIコンシェルジュ</div>
                  <div style={{ color: 'rgba(216,179,63,0.55)', fontSize: '11px', marginTop: '2px' }}>
                    {charObj !== null ? `${charObj.name}モード・` : ''}{loggedInUser ? '無制限' : `残り${remaining}回`}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {phase !== 'char' ? (
                  <button
                    type="button"
                    onClick={handleReset}
                    style={{
                      background: 'none', border: `1px solid rgba(216,179,63,0.35)`,
                      color: 'rgba(216,179,63,0.7)', borderRadius: '6px',
                      padding: '4px 8px', fontSize: '11px', cursor: 'pointer', fontFamily: 'inherit',
                    }}
                  >
                    リセット
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '2px' }}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px', minHeight: 0 }}>

              {showLimitMsg ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ background: 'rgba(216,179,63,0.04)', border: '1px solid rgba(216,179,63,0.15)', borderRadius: '14px', padding: '16px' }}>
                    <div style={{ color: 'rgba(216,179,63,0.9)', fontSize: '13px', marginBottom: '8px' }}>本日の無料相談回数（5回）を使い切りました</div>
                    <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '11.5px', lineHeight: 1.7, marginBottom: '12px' }}>登録すると相談回数が無制限になります。過去の相談内容も保存されます。</div>
                    <button
                      type="button"
                      onClick={() => window.dispatchEvent(new CustomEvent('show-auth-sheet'))}
                      style={{ width: '100%', background: 'linear-gradient(135deg, #c8a030, #D8B33F)', border: 'none', borderRadius: '10px', padding: '12px', color: '#071426', fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
                    >
                      無料登録して無制限に使う
                    </button>
                    <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: '10.5px', textAlign: 'center', marginTop: '8px' }}>明日またリセットされます</div>
                  </div>
                </div>
              ) : null}

              {/* キャラ選択 */}
              {phase === 'char' && !showLimitMsg ? (
                <div>
                  <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '13px', margin: '0 0 16px', lineHeight: 1.7 }}>
                    担当コンシェルジュを選んでください。
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {CHARACTERS.map(ch => {
                      const CharIcon = ch.Icon;
                      return (
                        <motion.button
                          key={ch.id}
                          type="button"
                          onClick={() => selectCharacter(ch.id)}
                          whileHover={{ scale: 1.02, borderColor: 'rgba(216,179,63,0.5)' }}
                          transition={{ duration: 0.2 }}
                          style={{
                            background: 'rgba(216,179,63,0.07)',
                            borderWidth: '1px', borderStyle: 'solid', borderColor: 'rgba(216,179,63,0.28)',
                            borderRadius: '12px', padding: '12px 14px',
                            display: 'flex', alignItems: 'center', gap: '12px',
                            cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
                          }}
                        >
                          <div style={{
                            width: '36px', height: '36px', borderRadius: '50%',
                            background: 'rgba(216,179,63,0.12)', border: `1px solid rgba(216,179,63,0.35)`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                          }}>
                            <CharIcon size={18} color={GOLD} />
                          </div>
                          <div>
                            <div style={{ color: GOLD, fontWeight: 700, fontSize: '13px' }}>{ch.name}</div>
                            <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: '11px', marginTop: '2px' }}>{ch.desc}</div>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              {/* アクション選択 */}
              {phase === 'action' && !showLimitMsg ? (
                <div>
                  {messages.map((m, i) => (
                    <div key={i} style={{ marginBottom: '14px' }}>
                      <div style={{ fontSize: '11px', color: 'rgba(216,179,63,0.6)', marginBottom: '5px' }}>
                        {m.role === 'assistant' ? 'コンシェルジュ' : 'あなた'}
                      </div>
                      <div style={{
                        background: 'rgba(216,179,63,0.07)', border: '1px solid rgba(216,179,63,0.2)',
                        borderRadius: '10px', padding: '10px 12px',
                        color: 'rgba(255,255,255,0.88)', fontSize: '13px', lineHeight: 1.65, whiteSpace: 'pre-wrap',
                      }}>
                        {m.text}
                      </div>
                    </div>
                  ))}
                  <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', margin: '4px 0 12px' }}>
                    何についてお手伝いしましょうか？
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {ACTIONS.map(action => {
                      const ActionIcon = action.Icon;
                      return (
                        <motion.button
                          key={action.id}
                          type="button"
                          onClick={() => selectAction(action)}
                          whileHover={{
                            y: -2,
                            boxShadow: '0 4px 20px rgba(216,179,63,0.15)',
                            borderColor: 'rgba(216,179,63,0.4)',
                          }}
                          transition={{ duration: 0.2 }}
                          style={{
                            background: 'rgba(216,179,63,0.05)',
                            borderWidth: '1px', borderStyle: 'solid', borderColor: 'rgba(216,179,63,0.22)',
                            borderRadius: '10px', padding: '10px 14px',
                            display: 'flex', alignItems: 'center', gap: '10px',
                            cursor: 'pointer', color: 'rgba(255,255,255,0.85)',
                            fontSize: '13px', fontWeight: 500, textAlign: 'left', fontFamily: 'inherit',
                          }}
                        >
                          <ActionIcon size={15} color={GOLD} />
                          {action.label}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              {/* ツール検索 */}
              {phase === 'tool-search' && !showLimitMsg ? (
                <div>
                  {messages.map((m, i) => (
                    <div key={i} style={{ marginBottom: '12px', display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                      <div style={{
                        maxWidth: '85%',
                        background: m.role === 'assistant' ? 'rgba(216,179,63,0.07)' : 'rgba(255,255,255,0.07)',
                        border: `1px solid ${m.role === 'assistant' ? 'rgba(216,179,63,0.2)' : 'rgba(255,255,255,0.12)'}`,
                        borderRadius: '10px', padding: '10px 12px',
                        color: 'rgba(255,255,255,0.9)', fontSize: '13px', lineHeight: 1.65,
                        whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                      }}>
                        {m.text}
                      </div>
                    </div>
                  ))}
                  {toolFoundFlash ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [0, 1, 1, 0] }}
                      transition={{ duration: 2.5, times: [0, 0.12, 0.8, 1] }}
                      style={{
                        textAlign: 'center', padding: '10px 8px',
                        color: GOLD, fontSize: '13px', fontWeight: 600,
                      }}
                    >
                      条件に合うツールを見つけました
                    </motion.div>
                  ) : null}
                  <div ref={messagesEndRef} />
                </div>
              ) : null}

              {/* チャット */}
              {phase === 'chat' && !showLimitMsg ? (
                <div>
                  {messages.map((m, i) => (
                    <div key={i} style={{ marginBottom: '12px', display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                      <div style={{
                        maxWidth: '85%',
                        background: m.role === 'assistant' ? 'rgba(216,179,63,0.07)' : 'rgba(255,255,255,0.07)',
                        border: `1px solid ${m.role === 'assistant' ? 'rgba(216,179,63,0.2)' : 'rgba(255,255,255,0.12)'}`,
                        borderRadius: '10px', padding: '10px 12px',
                        color: 'rgba(255,255,255,0.9)', fontSize: '13px', lineHeight: 1.65,
                        whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                      }}>
                        {m.text}
                      </div>
                    </div>
                  ))}
                  {isThinking ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 4px' }}>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {THINKING_DELAYS.map((delay, i) => (
                          <div
                            key={i}
                            style={{
                              width: '6px', height: '6px', borderRadius: '50%',
                              background: 'rgba(216,179,63,0.6)',
                              animation: `ai-thinking-dot 1.2s ${delay}s ease-in-out infinite`,
                            }}
                          />
                        ))}
                      </div>
                      <span style={{ color: 'rgba(216,179,63,0.6)', fontSize: '12px' }}>少々お待ちください…</span>
                    </div>
                  ) : isSending ? (
                    <div style={{ display: 'flex', gap: '5px', padding: '10px 4px', alignItems: 'center' }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: GOLD, animation: 'ai-concierge-pulse 1s 0s infinite' }} />
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: GOLD, animation: 'ai-concierge-pulse 1s 0.15s infinite' }} />
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: GOLD, animation: 'ai-concierge-pulse 1s 0.3s infinite' }} />
                    </div>
                  ) : null}
                  <div ref={messagesEndRef} />
                </div>
              ) : null}

              {/* 登録誘導 */}
              {phase === 'limit' && !showLimitMsg ? (
                <div style={{ textAlign: 'center', padding: '20px 8px' }}>
                  <div style={{ color: GOLD, fontWeight: 700, fontSize: '15px', marginBottom: '12px', lineHeight: 1.4 }}>
                    無料チャット（{FREE_LIMIT}回）に達しました
                  </div>
                  <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', lineHeight: 1.7, margin: '0 0 20px' }}>
                    会員登録すると無制限でAIコンシェルジュをご利用いただけます。
                  </p>
                  <button
                    type="button"
                    onClick={() => window.dispatchEvent(new CustomEvent('show-auth-sheet'))}
                    style={{
                      background: GOLD, color: BG, border: 'none', borderRadius: '10px',
                      padding: '12px 24px', fontWeight: 700, fontSize: '14px', cursor: 'pointer',
                      display: 'inline-flex', alignItems: 'center', gap: '8px', fontFamily: 'inherit',
                    }}
                  >
                    <UserPlus size={16} />
                    無料会員登録
                  </button>
                  <div>
                    <button
                      type="button"
                      onClick={handleReset}
                      style={{
                        background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)',
                        fontSize: '12px', cursor: 'pointer', marginTop: '14px',
                        textDecoration: 'underline', fontFamily: 'inherit',
                      }}
                    >
                      最初からやり直す
                    </button>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Chat / Tool-search input */}
            {phase === 'chat' || phase === 'tool-search' ? (
              <div style={{ borderTop: '1px solid rgba(216,179,63,0.2)', flexShrink: 0 }}>
                <div style={{ padding: '10px 12px', display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
                  <textarea
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && (e.shiftKey || e.metaKey)) {
                        e.preventDefault();
                        phase === 'tool-search' ? handleToolSearch() : handleSendInput();
                      }
                    }}
                    placeholder={phase === 'tool-search' ? 'キーワードを入力...' : 'メッセージを入力...'}
                    disabled={isSending}
                    rows={1}
                    style={{
                      flex: 1, background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(216,179,63,0.28)', borderRadius: '10px',
                      padding: '8px 12px', color: '#fff', fontSize: '16px',
                      resize: 'none', minHeight: '40px', maxHeight: '120px',
                      overflowY: 'auto',
                      fontFamily: 'inherit', outline: 'none', lineHeight: 1.5,
                    }}
                  />
                  <button
                    type="button"
                    onClick={phase === 'tool-search' ? handleToolSearch : handleSendInput}
                    disabled={isSending}
                    style={{
                      background: GOLD, color: BG, border: 'none', borderRadius: '10px',
                      padding: '10px 12px', fontWeight: 700,
                      cursor: isSending ? 'not-allowed' : 'pointer',
                      flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      opacity: isSending ? 0.5 : 1,
                    }}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
                {phase === 'chat' ? (
                  <div style={{ padding: '0 12px 10px', display: 'flex', justifyContent: 'center' }}>
                    <button
                      type="button"
                      onClick={() => setPhase('action')}
                      style={{
                        background: 'none', border: '1px solid rgba(216,179,63,0.25)',
                        color: 'rgba(216,179,63,0.65)', borderRadius: '8px',
                        padding: '5px 14px', fontSize: '11px', cursor: 'pointer', fontFamily: 'inherit',
                      }}
                    >
                      アクション選択に戻る
                    </button>
                  </div>
                ) : null}
                {phase === 'tool-search' ? (
                  <div style={{ padding: '0 12px 10px', display: 'flex', justifyContent: 'center' }}>
                    <button
                      type="button"
                      onClick={() => setPhase('action')}
                      style={{
                        background: 'none', border: '1px solid rgba(216,179,63,0.25)',
                        color: 'rgba(216,179,63,0.65)', borderRadius: '8px',
                        padding: '5px 14px', fontSize: '11px', cursor: 'pointer', fontFamily: 'inherit',
                      }}
                    >
                      アクション選択に戻る
                    </button>
                  </div>
                ) : null}
              </div>
            ) : null}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
