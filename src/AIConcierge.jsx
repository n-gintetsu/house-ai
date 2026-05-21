import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Home, Calculator, BookOpen, Users, Wrench, ChevronRight, UserPlus, Star, Smile, Zap } from 'lucide-react';

const GOLD = '#D8B33F';
const BG = '#071426';
const FREE_LIMIT = 5;

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

const AI_LOG_MESSAGES = [
  '新着物件を確認しています…',
  '人気エリアを分析しています…',
  '類似体験談を検索しています…',
  'ローン相談が増えています…',
  '条件に合う物件を整理中…',
  '市場データを更新しています…',
  'AIが最適解を検索中…',
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

export default function AIConcierge() {
  const [isOpen, setIsOpen] = useState(false);
  const [phase, setPhase] = useState('char');
  const [character, setCharacter] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [chatCount, setChatCount] = useState(0);
  const [badge, setBadge] = useState(1);
  const [logIndex, setLogIndex] = useState(0);
  const [showLog, setShowLog] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setShowLog(false);
      return;
    }
    const showTimer = setTimeout(() => setShowLog(true), 2500);
    const cycleInterval = setInterval(() => {
      setLogIndex(prev => (prev + 1) % AI_LOG_MESSAGES.length);
    }, 3500);
    return () => {
      clearTimeout(showTimer);
      clearInterval(cycleInterval);
    };
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  const handleOpen = () => {
    setIsOpen(true);
    setBadge(0);
    setShowLog(false);
  };

  const selectCharacter = (charId) => {
    setCharacter(charId);
    setMessages([{ role: 'assistant', text: WELCOME_MESSAGES[charId] }]);
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
    setIsSending(true);
    try {
      const reply = await callClaude(newMessages, character);
      const newCount = chatCount + 1;
      setChatCount(newCount);
      const withReply = [...newMessages, { role: 'assistant', text: reply }];
      setMessages(withReply);
      if (newCount >= FREE_LIMIT) {
        setTimeout(() => setPhase('limit'), 600);
      }
    } catch {
      setMessages([...newMessages, { role: 'assistant', text: 'エラーが発生しました。しばらくしてからお試しください。' }]);
    } finally {
      setIsSending(false);
    }
  };

  const selectAction = (action) => {
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
  };

  const charObj = CHARACTERS.find(c => c.id === character) || null;

  return (
    <>
      <style>{`
        @keyframes ai-concierge-pulse {
          0%, 100% { opacity: 0.3; transform: translateY(0); }
          50% { opacity: 1; transform: translateY(-3px); }
        }
      `}</style>

      {/* AI log — visible when panel is closed */}
      {showLog ? (
        <div style={{ position: 'fixed', bottom: '38px', right: '52px', zIndex: 9997, pointerEvents: 'none' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={logIndex}
              initial={{ opacity: 0, x: -24, filter: 'blur(8px)' }}
              animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, x: 10, filter: 'blur(4px)' }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
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
                animate={{
                  opacity: [0, 1, 0, 1, 0, 1, 1],
                  boxShadow: [
                    '0 0 0px rgba(216,179,63,0)',
                    `0 0 6px ${GOLD}`,
                    '0 0 0px rgba(216,179,63,0)',
                    `0 0 6px ${GOLD}`,
                    '0 0 0px rgba(216,179,63,0)',
                    `0 0 6px ${GOLD}`,
                    `0 0 4px ${GOLD}`,
                  ],
                }}
                transition={{ duration: 1.4, ease: 'easeInOut' }}
                style={{ width: '6px', height: '6px', borderRadius: '50%', background: GOLD, flexShrink: 0 }}
              />
              <span style={{ color: 'rgba(216,179,63,0.85)', fontSize: '12px', fontWeight: 500, whiteSpace: 'nowrap' }}>
                {AI_LOG_MESSAGES[logIndex]}
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

      {/* Panel */}
      <AnimatePresence>
        {isOpen ? (
          <motion.div
            key="concierge-panel"
            initial={{ opacity: 0, y: 40, scale: 0.92, filter: 'blur(8px)' }}
            animate={{
              opacity: 1, y: 0, scale: 1, filter: 'blur(0px)',
              boxShadow: [
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
              boxShadow: { duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.5 },
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
                  {charObj !== null ? (
                    <div style={{ color: 'rgba(216,179,63,0.55)', fontSize: '11px', marginTop: '2px' }}>
                      {charObj.name}モード・残り{FREE_LIMIT - chatCount}回
                    </div>
                  ) : null}
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

              {/* キャラ選択 */}
              {phase === 'char' ? (
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
              {phase === 'action' ? (
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
              {phase === 'tool-search' ? (
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
                  <div ref={messagesEndRef} />
                </div>
              ) : null}

              {/* チャット */}
              {phase === 'chat' ? (
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
                  {isSending ? (
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
              {phase === 'limit' ? (
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
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        phase === 'tool-search' ? handleToolSearch() : handleSendInput();
                      }
                    }}
                    placeholder={phase === 'tool-search' ? 'キーワードを入力...' : 'メッセージを入力...'}
                    disabled={isSending}
                    style={{
                      flex: 1, background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(216,179,63,0.28)', borderRadius: '10px',
                      padding: '8px 12px', color: '#fff', fontSize: '13px',
                      resize: 'none', minHeight: '40px', maxHeight: '90px',
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
