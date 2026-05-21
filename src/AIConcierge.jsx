import { useState, useRef, useEffect } from 'react';
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

const SYSTEM_PROMPTS = {
  polite: 'あなたは丁寧で親切な不動産AIコンシェルジュです。敬語で、ユーザーに寄り添い、分かりやすく回答してください。絵文字は一切使わないでください。',
  comedy: 'あなたはユーモアあふれる不動産AIコンシェルジュです。面白い例えや軽いジョークを交えながら、しっかりした内容で回答してください。絵文字は一切使わないでください。',
  ds: 'あなたはドS系の不動産AIコンシェルジュです。ちょっと厳しめに、でも的確に回答してください。ユーザーを甘やかさず、ビシッと指摘するスタイルです。絵文字は一切使わないでください。',
};

const WELCOME_MESSAGES = {
  polite: 'こんにちは。不動産のことなら何でもご相談ください。どのようなお手伝いをしましょうか？',
  comedy: 'やあやあ、ようこそ！不動産の悩みを笑いと共に解決しましょう。どんな相談でもどーんと来い！',
  ds: 'よし来い。不動産の悩みならビシッと答えてやる。何から話す？',
};

export default function AIConcierge() {
  const [isOpen, setIsOpen] = useState(false);
  const [phase, setPhase] = useState('char');
  const [character, setCharacter] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [chatCount, setChatCount] = useState(0);
  const [badge, setBadge] = useState(1);
  const [toast, setToast] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isOpen) {
        setToast('不動産の悩みをAIが整理します');
        setTimeout(() => setToast(null), 4000);
      }
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  const handleOpen = () => {
    setIsOpen(true);
    setBadge(0);
    setToast(null);
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
    const newMessages = [...messages, { role: 'user', text: action.label }];
    setMessages(newMessages);
    setPhase('chat');
    doSend(newMessages);
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
        @keyframes ai-concierge-fadein {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {toast !== null ? (
        <div style={{
          position: 'fixed',
          bottom: '104px',
          right: '20px',
          background: BG,
          color: GOLD,
          border: `1px solid ${GOLD}`,
          borderRadius: '12px',
          padding: '10px 16px',
          fontSize: '13px',
          fontWeight: 600,
          zIndex: 10000,
          boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
          maxWidth: '220px',
          animation: 'ai-concierge-fadein 0.3s ease',
          pointerEvents: 'none',
        }}>
          {toast}
        </div>
      ) : null}

      {/* FAB — half-peeking from right */}
      <div
        onClick={isOpen ? () => setIsOpen(false) : handleOpen}
        style={{
          position: 'fixed',
          bottom: '28px',
          right: '-20px',
          zIndex: 9999,
          cursor: 'pointer',
        }}
      >
        {badge > 0 ? (
          <div style={{
            position: 'absolute',
            top: '-4px',
            left: '2px',
            background: '#ef4444',
            color: 'white',
            borderRadius: '999px',
            width: '18px',
            height: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '11px',
            fontWeight: 700,
            zIndex: 1,
            pointerEvents: 'none',
          }}>{badge}</div>
        ) : null}
        <div style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: BG,
          border: `2.5px solid ${GOLD}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: `0 4px 20px rgba(0,0,0,0.5), 0 0 14px rgba(216,179,63,0.35)`,
          overflow: 'hidden',
        }}>
          <img src="/logo.png" alt="AI" style={{ width: '46px', height: '46px', objectFit: 'contain' }} />
        </div>
      </div>

      {/* Panel */}
      {isOpen ? (
        <div style={{
          position: 'fixed',
          bottom: '100px',
          right: '16px',
          width: '340px',
          maxHeight: '560px',
          background: BG,
          border: `1.5px solid ${GOLD}`,
          borderRadius: '20px',
          zIndex: 9998,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 8px 48px rgba(0,0,0,0.7)',
          animation: 'ai-concierge-fadein 0.25s ease',
          overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 16px',
            borderBottom: `1px solid rgba(216,179,63,0.25)`,
            flexShrink: 0,
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
                    background: 'none',
                    border: `1px solid rgba(216,179,63,0.35)`,
                    color: 'rgba(216,179,63,0.7)',
                    borderRadius: '6px',
                    padding: '4px 8px',
                    fontSize: '11px',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
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
              <div style={{ animation: 'ai-concierge-fadein 0.2s ease' }}>
                <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '13px', margin: '0 0 16px', lineHeight: 1.7 }}>
                  担当コンシェルジュを選んでください。
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {CHARACTERS.map(ch => {
                    const CharIcon = ch.Icon;
                    return (
                      <button
                        key={ch.id}
                        type="button"
                        onClick={() => selectCharacter(ch.id)}
                        style={{
                          background: 'rgba(216,179,63,0.07)',
                          border: `1px solid rgba(216,179,63,0.28)`,
                          borderRadius: '12px',
                          padding: '12px 14px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          cursor: 'pointer',
                          textAlign: 'left',
                          fontFamily: 'inherit',
                        }}
                      >
                        <div style={{
                          width: '36px', height: '36px', borderRadius: '50%',
                          background: 'rgba(216,179,63,0.12)',
                          border: `1px solid rgba(216,179,63,0.35)`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        }}>
                          <CharIcon size={18} color={GOLD} />
                        </div>
                        <div>
                          <div style={{ color: GOLD, fontWeight: 700, fontSize: '13px' }}>{ch.name}</div>
                          <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: '11px', marginTop: '2px' }}>{ch.desc}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {/* アクション選択 */}
            {phase === 'action' ? (
              <div style={{ animation: 'ai-concierge-fadein 0.2s ease' }}>
                {messages.map((m, i) => (
                  <div key={i} style={{ marginBottom: '14px' }}>
                    <div style={{ fontSize: '11px', color: 'rgba(216,179,63,0.6)', marginBottom: '5px' }}>
                      {m.role === 'assistant' ? 'コンシェルジュ' : 'あなた'}
                    </div>
                    <div style={{
                      background: 'rgba(216,179,63,0.07)',
                      border: '1px solid rgba(216,179,63,0.2)',
                      borderRadius: '10px',
                      padding: '10px 12px',
                      color: 'rgba(255,255,255,0.88)',
                      fontSize: '13px',
                      lineHeight: 1.65,
                      whiteSpace: 'pre-wrap',
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
                      <button
                        key={action.id}
                        type="button"
                        onClick={() => selectAction(action)}
                        style={{
                          background: 'rgba(216,179,63,0.05)',
                          border: '1px solid rgba(216,179,63,0.22)',
                          borderRadius: '10px',
                          padding: '10px 14px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          cursor: 'pointer',
                          color: 'rgba(255,255,255,0.85)',
                          fontSize: '13px',
                          fontWeight: 500,
                          textAlign: 'left',
                          fontFamily: 'inherit',
                        }}
                      >
                        <ActionIcon size={15} color={GOLD} />
                        {action.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {/* チャット */}
            {phase === 'chat' ? (
              <div style={{ animation: 'ai-concierge-fadein 0.2s ease' }}>
                {messages.map((m, i) => (
                  <div key={i} style={{ marginBottom: '12px', display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                    <div style={{
                      maxWidth: '85%',
                      background: m.role === 'assistant' ? 'rgba(216,179,63,0.07)' : 'rgba(255,255,255,0.07)',
                      border: `1px solid ${m.role === 'assistant' ? 'rgba(216,179,63,0.2)' : 'rgba(255,255,255,0.12)'}`,
                      borderRadius: '10px',
                      padding: '10px 12px',
                      color: 'rgba(255,255,255,0.9)',
                      fontSize: '13px',
                      lineHeight: 1.65,
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
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
              <div style={{ textAlign: 'center', padding: '20px 8px', animation: 'ai-concierge-fadein 0.2s ease' }}>
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
                    background: GOLD,
                    color: BG,
                    border: 'none',
                    borderRadius: '10px',
                    padding: '12px 24px',
                    fontWeight: 700,
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontFamily: 'inherit',
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
                      background: 'none',
                      border: 'none',
                      color: 'rgba(255,255,255,0.4)',
                      fontSize: '12px',
                      cursor: 'pointer',
                      marginTop: '14px',
                      textDecoration: 'underline',
                      fontFamily: 'inherit',
                    }}
                  >
                    最初からやり直す
                  </button>
                </div>
              </div>
            ) : null}
          </div>

          {/* チャット入力エリア */}
          {phase === 'chat' ? (
            <div style={{ borderTop: '1px solid rgba(216,179,63,0.2)', flexShrink: 0 }}>
              <div style={{ padding: '10px 12px', display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
                <textarea
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendInput();
                    }
                  }}
                  placeholder="メッセージを入力..."
                  disabled={isSending}
                  style={{
                    flex: 1,
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(216,179,63,0.28)',
                    borderRadius: '10px',
                    padding: '8px 12px',
                    color: '#fff',
                    fontSize: '13px',
                    resize: 'none',
                    minHeight: '40px',
                    maxHeight: '90px',
                    fontFamily: 'inherit',
                    outline: 'none',
                    lineHeight: 1.5,
                  }}
                />
                <button
                  type="button"
                  onClick={handleSendInput}
                  disabled={isSending}
                  style={{
                    background: GOLD,
                    color: BG,
                    border: 'none',
                    borderRadius: '10px',
                    padding: '10px 12px',
                    fontWeight: 700,
                    cursor: isSending ? 'not-allowed' : 'pointer',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: isSending ? 0.5 : 1,
                  }}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
              <div style={{ padding: '0 12px 10px', display: 'flex', justifyContent: 'center' }}>
                <button
                  type="button"
                  onClick={() => setPhase('action')}
                  style={{
                    background: 'none',
                    border: '1px solid rgba(216,179,63,0.25)',
                    color: 'rgba(216,179,63,0.65)',
                    borderRadius: '8px',
                    padding: '5px 14px',
                    fontSize: '11px',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  アクション選択に戻る
                </button>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
