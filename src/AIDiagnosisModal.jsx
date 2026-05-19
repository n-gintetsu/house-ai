import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { X, Sparkles, Search, Target, Clock, DollarSign, ShieldCheck, Home as HomeIcon, MapPin } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';

const categories = ['賃貸','住宅購入','投資','売却','空き家','住宅ローン','相続','リフォーム','引越し','火災保険','土地活用'];
const aiLoadingLogs = ['あなた向け条件を整理しています...','似た相談事例を分析中...','エリア情報を確認しています...','AI提案を準備しています...'];
const ageRanges = ['10代','20代','30代','40代','50代','60代〜'];

const userTypes = [
  { id: 'first', label: '初めて検討中', sub: '何から始めればいいか知りたい', icon: HomeIcon, color: '#3b82f6' },
  { id: 'compare', label: '比較・検討中', sub: '複数の選択肢を整理したい', icon: Search, color: '#8b5cf6' },
  { id: 'invest', label: '投資・資産運用', sub: '利回り・リスクを分析したい', icon: Target, color: '#f59e0b' },
  { id: 'sell', label: '売却・整理したい', sub: '相場・タイミングを知りたい', icon: DollarSign, color: '#10b981' },
];

const priorities = [
  { id: 'price', label: '価格・費用を抑えたい', icon: DollarSign },
  { id: 'speed', label: 'スピード重視', icon: Clock },
  { id: 'safety', label: '安心・安全優先', icon: ShieldCheck },
  { id: 'location', label: 'エリア・立地重視', icon: MapPin },
];

const overlayStyle = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.6)',
  backdropFilter: 'blur(4px)',
  zIndex: 9998,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '16px',
};

const contentStyle = {
  position: 'relative',
  background: '#fff',
  borderRadius: '24px',
  width: '100%',
  maxWidth: '480px',
  maxHeight: '90vh',
  overflowY: 'auto',
  boxShadow: '0 25px 60px rgba(0,0,0,0.2)',
  zIndex: 9999,
};

export default function AIDiagnosisModal({ open, onOpenChange }) {
  const [step, setStep] = useState(1);
  const [selections, setSelections] = useState({});
  const [currentLog, setCurrentLog] = useState(0);
  const [area, setArea] = useState('');
  const [age, setAge] = useState('');

  useEffect(() => {
    if (!open) {
      setTimeout(() => { setStep(1); setSelections({}); setCurrentLog(0); setArea(''); setAge(''); }, 300);
    }
  }, [open]);

  useEffect(() => {
    if (step !== 4) return;
    let logIndex = 0;
    const interval = setInterval(() => {
      logIndex++;
      if (logIndex < aiLoadingLogs.length) {
        setCurrentLog(logIndex);
      } else {
        clearInterval(interval);
        setTimeout(() => setStep('preview'), 500);
      }
    }, 600);
    return () => clearInterval(interval);
  }, [step]);

  const handleUserTypeSelect = (type) => {
    setSelections({ ...selections, userType: type });
    setTimeout(() => setStep(2), 400);
  };
  const handleCategorySelect = (category) => {
    setSelections({ ...selections, category });
    setTimeout(() => setStep(3), 400);
  };
  const handlePrioritySelect = (priority) => {
    setSelections({ ...selections, priority });
    setTimeout(() => setStep(4), 400);
  };
  const handleSubmit = () => {
    setSelections({ ...selections, area, age });
    onOpenChange(false);
  };

  const totalSteps = 3;
  const stepNum = typeof step === 'number' ? step : (step === 'preview' ? 4 : 5);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay asChild>
          <motion.div
            style={overlayStyle}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        </Dialog.Overlay>
        <Dialog.Content asChild>
          <motion.div
            style={contentStyle}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
          >
            <VisuallyHidden.Root>
              <Dialog.Title>AI診断</Dialog.Title>
              <Dialog.Description>AIがあなたに合ったサービスを診断します</Dialog.Description>
            </VisuallyHidden.Root>

            {/* ヘッダー */}
            <div style={{ padding: '24px 24px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'linear-gradient(135deg, #3b82f6, #7c3aed)', display: 'grid', placeItems: 'center' }}>
                  <Sparkles size={16} color="white" />
                </div>
                <span style={{ fontWeight: 700, fontSize: '15px', color: '#111827' }}>AI診断</span>
              </div>
              <Dialog.Close asChild>
                <button style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid #e5e7eb', background: '#f9fafb', display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
                  <X size={16} color="#6b7280" />
                </button>
              </Dialog.Close>
            </div>

            {/* プログレスバー (step 1-3のみ) */}
            {typeof step === 'number' && step <= 3 ? (
              <div style={{ padding: '0 24px 16px' }}>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {[1, 2, 3].map(s => (
                    <div key={s} style={{ flex: 1, height: '3px', borderRadius: '99px', background: step >= s ? 'linear-gradient(to right, #3b82f6, #7c3aed)' : '#e5e7eb', transition: 'background 0.3s' }} />
                  ))}
                </div>
                <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '6px' }}>{step} / {totalSteps}</p>
              </div>
            ) : null}

            {/* ステップコンテンツ */}
            <div style={{ padding: '0 24px 28px', minHeight: '320px' }}>
              <AnimatePresence mode="wait">

                {/* STEP 1: ユーザータイプ */}
                {step === 1 ? (
                  <motion.div key="step1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', marginBottom: '6px' }}>どのようなご相談ですか？</h3>
                    <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '20px' }}>あなたの状況に合わせてAIが整理します</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {userTypes.map(type => {
                        const Icon = type.icon;
                        return (
                          <motion.button
                            key={type.id}
                            onClick={() => handleUserTypeSelect(type.id)}
                            whileHover={{ scale: 1.01, x: 4 }}
                            whileTap={{ scale: 0.99 }}
                            style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px', borderRadius: '14px', border: `1.5px solid ${selections.userType === type.id ? type.color : '#e5e7eb'}`, background: selections.userType === type.id ? `${type.color}12` : '#fafafa', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' }}
                          >
                            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: `${type.color}20`, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                              <Icon size={20} color={type.color} />
                            </div>
                            <div>
                              <div style={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>{type.label}</div>
                              <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>{type.sub}</div>
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  </motion.div>
                ) : null}

                {/* STEP 2: カテゴリ */}
                {step === 2 ? (
                  <motion.div key="step2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', marginBottom: '6px' }}>相談カテゴリを選んでください</h3>
                    <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '20px' }}>複数に当てはまる場合は最も近いものを選択</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {categories.map(cat => (
                        <motion.button
                          key={cat}
                          onClick={() => handleCategorySelect(cat)}
                          whileHover={{ scale: 1.04 }}
                          whileTap={{ scale: 0.97 }}
                          style={{ padding: '8px 16px', borderRadius: '999px', border: `1.5px solid ${selections.category === cat ? '#3b82f6' : '#e5e7eb'}`, background: selections.category === cat ? '#eff6ff' : '#fafafa', color: selections.category === cat ? '#1d4ed8' : '#374151', fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
                        >
                          {cat}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                ) : null}

                {/* STEP 3: 優先事項 */}
                {step === 3 ? (
                  <motion.div key="step3" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', marginBottom: '6px' }}>何を最も重視しますか？</h3>
                    <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '20px' }}>AIが優先度を考慮して提案を絞り込みます</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {priorities.map(p => {
                        const Icon = p.icon;
                        return (
                          <motion.button
                            key={p.id}
                            onClick={() => handlePrioritySelect(p.id)}
                            whileHover={{ scale: 1.01, x: 4 }}
                            whileTap={{ scale: 0.99 }}
                            style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', borderRadius: '14px', border: `1.5px solid ${selections.priority === p.id ? '#3b82f6' : '#e5e7eb'}`, background: selections.priority === p.id ? '#eff6ff' : '#fafafa', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' }}
                          >
                            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: selections.priority === p.id ? '#dbeafe' : '#f3f4f6', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                              <Icon size={18} color={selections.priority === p.id ? '#2563eb' : '#6b7280'} />
                            </div>
                            <span style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>{p.label}</span>
                          </motion.button>
                        );
                      })}
                    </div>
                  </motion.div>
                ) : null}

                {/* STEP 4: AIローディング */}
                {step === 4 ? (
                  <motion.div key="step4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '280px', gap: '24px' }}>
                    <motion.div
                      style={{ width: '64px', height: '64px', borderRadius: '20px', background: 'linear-gradient(135deg, #3b82f6, #7c3aed)', display: 'grid', placeItems: 'center' }}
                      animate={{ scale: [1, 1.08, 1], boxShadow: ['0 0 0 0 rgba(59,130,246,0)', '0 0 0 12px rgba(59,130,246,0.15)', '0 0 0 0 rgba(59,130,246,0)'] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <Sparkles size={28} color="white" />
                    </motion.div>
                    <div style={{ width: '100%', maxWidth: '320px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {aiLoadingLogs.map((log, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0.3 }}
                            animate={{ opacity: currentLog >= idx ? 1 : 0.3 }}
                            style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
                          >
                            <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: currentLog >= idx ? 'linear-gradient(135deg, #3b82f6, #7c3aed)' : '#e5e7eb', display: 'grid', placeItems: 'center', flexShrink: 0, transition: 'background 0.3s' }}>
                              {currentLog > idx ? (
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                              ) : null}
                            </div>
                            <span style={{ fontSize: '13px', color: currentLog >= idx ? '#111827' : '#9ca3af', fontWeight: currentLog === idx ? 600 : 400, transition: 'all 0.3s' }}>{log}</span>
                          </motion.div>
                        ))}
                      </div>
                      <div style={{ marginTop: '20px', height: '4px', background: '#e5e7eb', borderRadius: '999px', overflow: 'hidden' }}>
                        <motion.div
                          style={{ height: '100%', background: 'linear-gradient(to right, #3b82f6, #7c3aed)', borderRadius: '999px' }}
                          animate={{ width: `${((currentLog + 1) / aiLoadingLogs.length) * 100}%` }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                    </div>
                  </motion.div>
                ) : null}

                {/* STEP preview: AI結果プレビュー */}
                {step === 'preview' ? (
                  <motion.div key="preview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}>
                    <div style={{ background: 'linear-gradient(135deg, #eff6ff, #f5f3ff)', borderRadius: '16px', padding: '20px', marginBottom: '20px', border: '1px solid rgba(59,130,246,0.2)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                        <Sparkles size={16} color="#2563eb" />
                        <span style={{ fontSize: '12px', fontWeight: 700, color: '#2563eb', letterSpacing: '0.05em' }}>AI分析完了</span>
                      </div>
                      <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>
                        {selections.category || '不動産'}に関する提案が準備できました
                      </h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {[
                          `「${selections.category || '不動産'}」の相談事例を分析しました`,
                          `${selections.priority === 'price' ? '費用を抑えた' : selections.priority === 'speed' ? 'スピード重視の' : selections.priority === 'safety' ? '安心できる' : 'エリア条件の'}プランを整理しました`,
                          'あなた専用のAI提案を確認できます',
                        ].map((text, idx) => (
                          <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                            <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #7c3aed)', display: 'grid', placeItems: 'center', flexShrink: 0, marginTop: '1px' }}>
                              <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                            </div>
                            <span style={{ fontSize: '13px', color: '#374151' }}>{text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <motion.button
                      onClick={() => setStep(5)}
                      whileHover={{ scale: 1.01, y: -1 }}
                      whileTap={{ scale: 0.99 }}
                      style={{ width: '100%', padding: '14px', borderRadius: '14px', border: 'none', background: 'linear-gradient(to right, #2563eb, #7c3aed)', color: 'white', fontSize: '15px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    >
                      <Sparkles size={16} />
                      詳細を確認する
                    </motion.button>
                    <button
                      onClick={() => onOpenChange(false)}
                      style={{ width: '100%', marginTop: '10px', padding: '12px', borderRadius: '14px', border: '1px solid #e5e7eb', background: '#fafafa', color: '#6b7280', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}
                    >
                      閉じる
                    </button>
                  </motion.div>
                ) : null}

                {/* STEP 5: エリア・年代入力 */}
                {step === 5 ? (
                  <motion.div key="step5" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', marginBottom: '6px' }}>もう少し教えてください</h3>
                    <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '20px' }}>より精度の高い提案のために使用します</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>
                          <MapPin size={14} color="#6b7280" />
                          希望エリア（任意）
                        </label>
                        <input
                          type="text"
                          placeholder="例：さいたま市、大宮周辺"
                          value={area}
                          onChange={e => setArea(e.target.value)}
                          style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1.5px solid #e5e7eb', fontSize: '16px', color: '#111827', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
                          onFocus={e => { e.currentTarget.style.borderColor = '#3b82f6'; }}
                          onBlur={e => { e.currentTarget.style.borderColor = '#e5e7eb'; }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>
                          <HomeIcon size={14} color="#6b7280" />
                          年代（任意）
                        </label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {ageRanges.map(a => (
                            <button
                              key={a}
                              onClick={() => setAge(a)}
                              style={{ padding: '8px 16px', borderRadius: '999px', border: `1.5px solid ${age === a ? '#3b82f6' : '#e5e7eb'}`, background: age === a ? '#eff6ff' : '#fafafa', color: age === a ? '#1d4ed8' : '#374151', fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
                            >
                              {a}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '24px' }}>
                      <motion.button
                        onClick={handleSubmit}
                        whileHover={{ scale: 1.01, y: -1 }}
                        whileTap={{ scale: 0.99 }}
                        style={{ width: '100%', padding: '14px', borderRadius: '14px', border: 'none', background: 'linear-gradient(to right, #2563eb, #7c3aed)', color: 'white', fontSize: '15px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                      >
                        <Sparkles size={16} />
                        AI提案を見る
                      </motion.button>
                      <button
                        onClick={() => setStep('preview')}
                        style={{ width: '100%', padding: '12px', borderRadius: '14px', border: '1px solid #e5e7eb', background: '#fafafa', color: '#6b7280', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}
                      >
                        戻る
                      </button>
                    </div>
                  </motion.div>
                ) : null}

              </AnimatePresence>
            </div>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
