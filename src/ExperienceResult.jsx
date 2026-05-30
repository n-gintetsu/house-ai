import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Edit, Send, X } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const VIOLATION_RE = /https?:\/\/|[\w.+-]+@[\w-]+\.[a-z]{2,}|\d{10,}/i;
const SPAM_RE = /営業|宣伝|広告/;

export default function ExperienceResult() {
  const navigate = useNavigate();
  const location = useLocation();
  const initialResult = (location.state || {}).result || { title: '', summary: '', tags: [], learnings: [] };
  const wantsAdvice = (location.state || {}).wantsAdvice || false;

  const [result, setResult] = useState(initialResult);
  const [showAdviceModal, setShowAdviceModal] = useState(false);
  const [adviceText, setAdviceText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editSummary, setEditSummary] = useState('');
  const [editLearnings, setEditLearnings] = useState('');

  const openEditModal = () => {
    setEditTitle(result.title);
    setEditSummary(result.summary);
    setEditLearnings((result.learnings || []).join('\n'));
    setShowEditModal(true);
  };

  const validateEdit = () => {
    const fields = [editTitle, editSummary, editLearnings];
    if (fields.some(f => VIOLATION_RE.test(f))) {
      alert('URL・電話番号（10桁以上）・メールアドレスは含められません');
      return false;
    }
    if (fields.some(f => SPAM_RE.test(f))) {
      alert('「営業」「宣伝」「広告」を含む内容は投稿できません');
      return false;
    }
    if (editSummary.length > 200) {
      alert('AI要約は200文字以内で入力してください');
      return false;
    }
    return true;
  };

  const confirmEdit = () => {
    if (!validateEdit()) return;
    setResult(prev => ({
      ...prev,
      title: editTitle,
      summary: editSummary,
      learnings: editLearnings.split('\n').map(s => s.trim()).filter(Boolean),
    }));
    setShowEditModal(false);
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.from('experience_posts').insert({
        type: (location.state || {}).type || 'success',
        title: result.title || '体験談',
        summary: result.summary || '',
        tags: result.tags || [],
        learnings: result.learnings || [],
        wants_advice: (location.state || {}).wantsAdvice || false,
      });
      if (error) throw error;
      setSubmitted(true);
      navigate('/experiences/complete');
    } catch (e) {
      alert('投稿に失敗しました。もう一度お試しください。');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAdviceSubmit = () => {
    const hasViolation = /https?:\/\/|tel:|0\d{1,4}-\d{1,4}-\d{4}|[\w.+-]+@[\w-]+\.[a-z]{2,}/i.test(adviceText);
    if (hasViolation) {
      alert('URL・電話番号・メールアドレスは含められません');
      return;
    }
    if (adviceText.length > 200) {
      alert('200文字以内で入力してください');
      return;
    }
    alert('アドバイスを送信しました！ありがとうございます');
    setShowAdviceModal(false);
    setAdviceText('');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0A1628', position: 'relative', overflow: 'hidden', padding: '48px 16px' }}>
      <div style={{ position: 'absolute', inset: 0, opacity: 0.2 }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(0,212,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.1) 1px, transparent 1px)', backgroundSize: '50px 50px' }} />
      </div>
      <div style={{ position: 'absolute', top: 80, right: 80, width: 384, height: 384, background: '#00D4FF', borderRadius: '50%', opacity: 0.2, filter: 'blur(120px)' }} />
      <div style={{ position: 'relative', zIndex: 10, maxWidth: 768, margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ color: '#fff', fontSize: '2rem', fontWeight: 700, marginBottom: 8 }}>AI生成完了</h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1rem' }}>あなたの体験談が整理されました</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.2 }} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(0,212,255,0.3)', borderRadius: 24, overflow: 'hidden' }}>
          <div style={{ padding: 32, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <h2 style={{ color: '#fff', fontSize: '1.75rem', fontWeight: 600, marginBottom: 12 }}>{result.title}</h2>
            {wantsAdvice === true ? (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(0,191,255,0.1)', border: '1px solid rgba(0,191,255,0.4)', borderRadius: 20, padding: '4px 12px', marginBottom: 12 }}>
                <span style={{ color: '#00BFFF', fontSize: 12 }}>💬 同じ悩みの方・経験者のアドバイスを募集中</span>
              </div>
            ) : null}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #00D4FF, #0099CC)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sparkles size={16} color="#fff" />
              </div>
              <span style={{ color: '#00D4FF', fontSize: '0.875rem', fontWeight: 500 }}>AI要約</span>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1rem', lineHeight: 1.7, margin: 0 }}>
              {result.summary}
            </p>
          </div>
          <div style={{ padding: '24px 32px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {result.tags.map((tag, index) => (
              <motion.span key={tag} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }} style={{ padding: '8px 16px', borderRadius: 9999, color: '#00D4FF', background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.3)', fontSize: '0.875rem' }}>
                #{tag}
              </motion.span>
            ))}
          </div>
          <div style={{ padding: 32 }}>
            <h3 style={{ color: '#fff', fontSize: '1.125rem', fontWeight: 600, marginBottom: 12 }}>学び</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {result.learnings.map((learning, index) => (
                <motion.li key={index} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, color: 'rgba(255,255,255,0.7)', fontSize: '0.9375rem', marginBottom: 8 }}>
                  <span style={{ color: '#D4AF37', marginTop: 2 }}>•</span>
                  <span>{learning}</span>
                </motion.li>
              ))}
            </ul>
            {wantsAdvice === true ? (
              <div style={{ marginTop: 20 }}>
                <button
                  onClick={() => setShowAdviceModal(true)}
                  style={{ background: 'rgba(0,191,255,0.1)', border: '1px solid rgba(0,191,255,0.4)', color: '#00BFFF', borderRadius: 12, padding: '12px 24px', fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}
                >
                  アドバイスする
                </button>
              </div>
            ) : null}
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.8 }} style={{ marginTop: 32, display: 'flex', gap: 16 }}>
          <button onClick={openEditModal} style={{ flex: 1, padding: '16px 24px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: '1rem' }}>
            <Edit size={20} />編集
          </button>
          <button onClick={handleSubmit} disabled={submitting} style={{ flex: 1, padding: '16px 24px', borderRadius: 12, background: 'linear-gradient(to right, #00D4FF, #0099CC)', color: '#fff', border: 'none', cursor: submitting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: '1rem', fontWeight: 500, opacity: submitting ? 0.7 : 1 }}>
            <Send size={20} />{submitting ? '投稿中...' : '投稿'}
          </button>
        </motion.div>
      </div>

      {/* 編集モーダル */}
      {showEditModal ? (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#0d1f3c', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: 24, width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h3 style={{ color: '#ffffff', fontSize: 18, fontWeight: 600, margin: 0 }}>体験談を編集</h3>
              <button
                onClick={() => setShowEditModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', padding: 4 }}
              >
                <X size={20} />
              </button>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, margin: '0 0 20px' }}>
              ※ URL・電話番号（10桁以上）・メールアドレス・「営業」「宣伝」「広告」を含む投稿は送信できません。AI要約は200文字以内。
            </p>

            <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: 13, marginBottom: 6 }}>タイトル</label>
            <input
              type="text"
              value={editTitle}
              onChange={e => setEditTitle(e.target.value)}
              style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, color: '#fff', padding: '10px 12px', fontSize: 16, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', marginBottom: 16 }}
            />

            <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: 13, marginBottom: 6 }}>
              AI要約
              <span style={{ color: editSummary.length > 200 ? '#ef4444' : 'rgba(255,255,255,0.3)', fontSize: 11, marginLeft: 8 }}>{editSummary.length}/200</span>
            </label>
            <textarea
              rows={4}
              value={editSummary}
              onChange={e => setEditSummary(e.target.value)}
              style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: `1px solid ${editSummary.length > 200 ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.15)'}`, borderRadius: 8, color: '#fff', padding: '10px 12px', fontSize: 16, fontFamily: 'inherit', resize: 'vertical', outline: 'none', boxSizing: 'border-box', marginBottom: 16 }}
            />

            <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: 13, marginBottom: 6 }}>学び（1行1項目）</label>
            <textarea
              rows={5}
              value={editLearnings}
              onChange={e => setEditLearnings(e.target.value)}
              placeholder="1行に1つの学びを入力してください"
              style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, color: '#fff', padding: '10px 12px', fontSize: 16, fontFamily: 'inherit', resize: 'vertical', outline: 'none', boxSizing: 'border-box', marginBottom: 20 }}
            />

            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => setShowEditModal(false)}
                style={{ flex: 1, padding: '12px 0', borderRadius: 8, background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.7)', fontSize: 15, cursor: 'pointer', fontFamily: 'inherit' }}
              >
                キャンセル
              </button>
              <button
                onClick={confirmEdit}
                style={{ flex: 1, padding: '12px 0', borderRadius: 8, background: 'linear-gradient(to right, #00D4FF, #0099CC)', border: 'none', color: '#fff', fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
              >
                確定する
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {showAdviceModal === true ? (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#0d1f3c', borderRadius: 16, padding: 24, width: '90%', maxWidth: 480 }}>
            <h3 style={{ color: '#ffffff', fontSize: 18, fontWeight: 700, marginTop: 0, marginBottom: 12 }}>アドバイスを送る</h3>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, marginBottom: 12, marginTop: 0 }}>※URL・電話番号・メールアドレスを含む投稿は送信できません</p>
            <textarea
              rows={4}
              placeholder="同じ悩みの方へのアドバイスをどうぞ（200文字以内）"
              value={adviceText}
              onChange={e => setAdviceText(e.target.value)}
              style={{ fontSize: 16, width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8, color: '#fff', padding: 12, boxSizing: 'border-box', fontFamily: 'inherit', resize: 'vertical', outline: 'none' }}
            />
            <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
              <button
                onClick={() => { setShowAdviceModal(false); setAdviceText(''); }}
                style={{ flex: 1, padding: '12px 0', borderRadius: 8, background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}
              >
                閉じる
              </button>
              <button
                onClick={handleAdviceSubmit}
                style={{ flex: 1, padding: '12px 0', borderRadius: 8, background: 'rgba(0,191,255,0.2)', border: '1px solid rgba(0,191,255,0.4)', color: '#00BFFF', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
              >
                送信する
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
