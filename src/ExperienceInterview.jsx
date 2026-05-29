import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles } from 'lucide-react';

const questions = [
  'どんなことで悩んでいましたか？',
  'どのように解決しましたか？',
  '同じ悩みを持つ人へアドバイスはありますか？',
];

export default function ExperienceInterview() {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [chatHistory, setChatHistory] = useState([{ type: 'ai', text: questions[0] }]);

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const handleSend = () => {
    if (!inputValue.trim()) return;
    const newAnswers = [...answers, inputValue];
    setAnswers(newAnswers);
    setChatHistory([...chatHistory, { type: 'user', text: inputValue }]);
    setInputValue('');
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setChatHistory((prev) => [...prev, { type: 'ai', text: questions[currentQuestion + 1] }]);
        setCurrentQuestion(currentQuestion + 1);
      } else {
        navigate('/experiences/analyzing', { state: { answers: newAnswers } });
      }
    }, 500);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0A1628', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, opacity: 0.1 }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(0,212,255,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(212,175,55,0.2) 0%, transparent 50%)' }} />
      </div>
      <div style={{ position: 'relative', zIndex: 10, padding: '24px 16px 6px' }}>
        <div style={{ maxWidth: 768, margin: '0 auto' }}>
          <div style={{ position: 'relative', height: 8, width: '100%', borderRadius: 9999, background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(to right, #00D4FF, #D4AF37)', transition: 'width 0.5s' }} />
          </div>
          <p style={{ color: 'rgba(255,255,255,0.6)', textAlign: 'center', marginTop: 8, fontSize: '0.875rem' }}>
            {currentQuestion + 1} / {questions.length}
          </p>
        </div>
      </div>
      <div style={{ position: 'relative', zIndex: 10, maxWidth: 768, margin: '0 auto', padding: '0 16px 128px' }}>
        <AnimatePresence>
          {chatHistory.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              style={{ display: 'flex', justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start', marginBottom: 24 }}
            >
              {message.type === 'ai' ? (
                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', maxWidth: 512 }}>
                  <img src="/logo.png" alt="House-AI" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', border: '1.5px solid rgba(212,175,55,0.6)', boxShadow: '0 0 12px rgba(212,175,55,0.3), 0 2px 8px rgba(0,0,0,0.4)' }} />
                  <div style={{ padding: 16, borderRadius: 16, background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.3)' }}>
                    <p style={{ color: '#fff', fontSize: '1rem', lineHeight: 1.6, margin: 0 }}>{message.text}</p>
                  </div>
                </div>
              ) : (
                <div style={{ padding: 16, borderRadius: 16, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', maxWidth: 512 }}>
                  <p style={{ color: '#fff', fontSize: '1rem', lineHeight: 1.6, margin: 0 }}>{message.text}</p>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 20, padding: 16, background: 'rgba(10,22,40,0.8)', borderTop: '1px solid rgba(0,212,255,0.2)' }}>
        <div style={{ maxWidth: 768, margin: '0 auto', display: 'flex', gap: 16 }}>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="回答を入力..."
            style={{ flex: 1, padding: '16px 24px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: 16, outline: 'none' }}
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim()}
            style={{ padding: '16px 24px', borderRadius: 12, background: 'linear-gradient(to right, #00D4FF, #0099CC)', color: '#fff', border: 'none', cursor: inputValue.trim() ? 'pointer' : 'not-allowed', opacity: inputValue.trim() ? 1 : 0.5 }}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
