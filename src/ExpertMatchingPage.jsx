import { useState, useEffect } from 'react';
import { CheckCircle, Circle, ChevronRight, Star } from 'lucide-react';
import { motion } from 'framer-motion';

const NAVY = '#1a3a5c';
const GOLD = '#c9a84c';

const WORRIES = ['相続', '住宅ローン', '売却', '空き家', '離婚', '投資', 'リフォーム', 'その他'];

const QUESTIONS_MAP = {
  '相続': [
    { q: '不動産はありますか？', opts: ['あり', 'なし'] },
    { q: '相続人は何名ですか？', opts: ['1名', '2〜3名', '4名以上'] },
    { q: 'お急ぎですか？', opts: ['急いでいる', '余裕あり'] },
  ],
  '住宅ローン': [
    { q: '現在ローンはありますか？', opts: ['あり', 'なし'] },
    { q: 'ご希望は？', opts: ['借換え', '新規', '相談のみ'] },
    { q: 'お住まいの地域は？', opts: ['首都圏', '関西', 'その他'] },
  ],
  '売却': [
    { q: '不動産の種類は？', opts: ['戸建て', 'マンション', '土地'] },
    { q: '売却理由は？', opts: ['住替え', '相続', '資金化'] },
    { q: 'お急ぎですか？', opts: ['急いでいる', '余裕あり'] },
  ],
};

const DEFAULT_QUESTIONS = [
  { q: 'ご状況を教えてください', opts: ['急いでいる', '情報収集中', 'ゆっくり検討したい'] },
  { q: '現在の状況は？', opts: ['具体的に動いている', '検討中', 'まず相談したい'] },
  { q: 'ご希望のサポートは？', opts: ['専門家に任せたい', '一緒に考えたい', '情報だけほしい'] },
];

const ANALYZE_ITEMS = [
  '案件を分析中',
  '専門家データベースを検索中',
  '適性スコアを計算中',
  '最適な専門家を選定中',
];

const RANK_COLORS = {
  Diamond: { bg: '#e0f2fe', color: '#0284c7', border: '#7dd3fc' },
  Gold: { bg: 'rgba(201,168,76,0.15)', color: GOLD, border: GOLD },
  Silver: { bg: '#f1f5f9', color: '#64748b', border: '#cbd5e1' },
  Bronze: { bg: '#fef3c7', color: '#92400e', border: '#fcd34d' },
  Rookie: { bg: '#f3f4f6', color: '#6b7280', border: '#d1d5db' },
};

const WORRY_TO_EXPERT = {
  '相続': ['司法書士', '税理士'],
  '住宅ローン': ['FP', '住宅ローン'],
  '売却': ['不動産コンサルタント'],
  '空き家': ['不動産コンサルタント', '司法書士'],
  '離婚': ['弁護士', '司法書士'],
  '投資': ['不動産コンサルタント', 'FP'],
  'リフォーム': ['不動産コンサルタント'],
  'その他': ['不動産コンサルタント', '税理士'],
};

const EXPERTS = [
  {
    id: 1,
    name: '田中 一郎',
    title: '司法書士',
    license: '東京司法書士会 第12345号',
    rank: 'Diamond',
    tags: ['相続', '不動産登記', '遺言書作成', '後見人'],
    skill: 5, response: 4, record: 5,
    badges: ['本人確認済', 'AI認証済', 'オンライン相談可', '即レス対応'],
  },
  {
    id: 2,
    name: '山田 花子',
    title: '税理士',
    license: '東京税理士会 第67890号',
    rank: 'Gold',
    tags: ['相続税', '不動産税務', '確定申告', '節税対策'],
    skill: 5, response: 5, record: 4,
    badges: ['本人確認済', 'AI認証済', 'オンライン相談可'],
  },
  {
    id: 3,
    name: '佐藤 次郎',
    title: '不動産コンサルタント',
    license: '宅地建物取引士 第54321号',
    rank: 'Gold',
    tags: ['売却', '購入', '投資', '収益物件'],
    skill: 4, response: 5, record: 5,
    badges: ['本人確認済', 'AI認証済', '即レス対応'],
  },
  {
    id: 4,
    name: '鈴木 三郎',
    title: 'FP・住宅ローンアドバイザー',
    license: 'CFP認定 第98765号',
    rank: 'Silver',
    tags: ['住宅ローン', '借換え', 'ライフプラン', '資金計画'],
    skill: 4, response: 4, record: 4,
    badges: ['本人確認済', 'オンライン相談可', '即レス対応'],
  },
  {
    id: 5,
    name: '伊藤 健太',
    title: '弁護士',
    license: '東京弁護士会 第11111号',
    rank: 'Bronze',
    tags: ['離婚', '相続争い', '不動産紛争', '調停'],
    skill: 5, response: 3, record: 4,
    badges: ['本人確認済', 'AI認証済'],
  },
];

const MATCH_PCTS = [94, 89, 81];

function StarRow({ value }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1,2,3,4,5].map(i => (
        <Star key={i} size={12} color={i <= value ? GOLD : '#e2e8f0'} fill={i <= value ? GOLD : 'none'} />
      ))}
    </div>
  );
}

export default function ExpertMatchingPage({ onNavigate }) {
  const [step, setStep] = useState('worry');
  const [selectedWorries, setSelectedWorries] = useState([]);
  const [hearingQuestions, setHearingQuestions] = useState([]);
  const [hearingAnswers, setHearingAnswers] = useState([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [checkIndex, setCheckIndex] = useState(-1);
  const [isPC, setIsPC] = useState(typeof window !== 'undefined' ? window.innerWidth >= 768 : false);

  useEffect(() => {
    const onResize = () => setIsPC(window.innerWidth >= 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (step !== 'analyzing') return;
    setCheckIndex(-1);
    const timers = [];
    ANALYZE_ITEMS.forEach((_, i) => {
      timers.push(setTimeout(() => setCheckIndex(i), (i + 1) * 400));
    });
    timers.push(setTimeout(() => setStep('result'), 2000));
    return () => timers.forEach(t => clearTimeout(t));
  }, [step]);

  const toggleWorry = (w) => {
    if (selectedWorries.includes(w)) {
      setSelectedWorries(selectedWorries.filter(x => x !== w));
    } else {
      setSelectedWorries([...selectedWorries, w]);
    }
  };

  const handleStartHearing = () => {
    const primary = selectedWorries[0] || 'その他';
    const qs = QUESTIONS_MAP[primary] || DEFAULT_QUESTIONS;
    setHearingQuestions(qs);
    setHearingAnswers([]);
    setCurrentQIndex(0);
    setStep('hearing');
  };

  const handleAnswer = (answer) => {
    const newAnswers = [...hearingAnswers, answer];
    setHearingAnswers(newAnswers);
    if (newAnswers.length >= hearingQuestions.length) {
      setCheckIndex(-1);
      setStep('analyzing');
    } else {
      setCurrentQIndex(currentQIndex + 1);
    }
  };

  const handleRestart = () => {
    setStep('worry');
    setSelectedWorries([]);
    setHearingQuestions([]);
    setHearingAnswers([]);
    setCurrentQIndex(0);
    setCheckIndex(-1);
  };

  const matchedExperts = (() => {
    const priorities = selectedWorries.flatMap(w => WORRY_TO_EXPERT[w] || []);
    return [...EXPERTS].sort((a, b) => {
      const scoreA = priorities.filter(p => a.title.includes(p) || a.tags.some(t => t.includes(p))).length;
      const scoreB = priorities.filter(p => b.title.includes(p) || b.tags.some(t => t.includes(p))).length;
      return scoreB - scoreA;
    });
  })();

  return (
    <div style={{ background: '#f8fafd', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '24px 16px 80px' }}>

        {/* STEP1: worry */}
        {step === 'worry' ? (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: NAVY, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <CheckCircle size={24} color={GOLD} />
              </div>
              <h1 style={{ fontSize: 22, fontWeight: 500, color: NAVY, margin: '0 0 8px' }}>どのようなお悩みですか？</h1>
              <p style={{ fontSize: 14, color: '#64748b', margin: 0 }}>AIがあなたに最適な専門家をご紹介します</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 32 }}>
              {WORRIES.map(w => {
                const sel = selectedWorries.includes(w);
                return (
                  <button
                    key={w}
                    onClick={() => toggleWorry(w)}
                    style={{
                      padding: '20px 12px',
                      borderRadius: 16,
                      border: '2px solid ' + (sel ? GOLD : '#e2e8f0'),
                      background: sel ? NAVY : '#ffffff',
                      color: sel ? '#ffffff' : NAVY,
                      fontSize: 15,
                      fontWeight: 500,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      textAlign: 'center',
                      transition: 'border-color 0.15s, background 0.15s',
                    }}
                  >
                    {w}
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleStartHearing}
              disabled={selectedWorries.length === 0}
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: 50,
                border: 'none',
                background: selectedWorries.length === 0 ? '#e2e8f0' : 'linear-gradient(to right, #1a3a5c, #2a5a8c)',
                color: selectedWorries.length === 0 ? '#94a3b8' : '#ffffff',
                fontSize: 16,
                fontWeight: 500,
                cursor: selectedWorries.length === 0 ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                boxSizing: 'border-box',
              }}
            >
              AIに相談する
              <ChevronRight size={18} color={selectedWorries.length === 0 ? '#94a3b8' : '#ffffff'} />
            </button>
          </div>
        ) : null}

        {/* STEP2: hearing */}
        {step === 'hearing' ? (
          <div>
            <div style={{ marginBottom: 28 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: '#94a3b8' }}>{currentQIndex + 1}問目 / {hearingQuestions.length}問中</span>
                <span style={{ fontSize: 12, color: '#94a3b8' }}>{selectedWorries.join('・')}</span>
              </div>
              <div style={{ height: 4, background: '#e2e8f0', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: ((currentQIndex + 1) / (hearingQuestions.length || 1) * 100) + '%', background: NAVY, borderRadius: 2, transition: 'width 0.3s' }} />
              </div>
            </div>

            {hearingQuestions[currentQIndex] ? (
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 500, color: NAVY, margin: '0 0 28px', lineHeight: 1.5 }}>
                  {hearingQuestions[currentQIndex].q}
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {hearingQuestions[currentQIndex].opts.map(opt => (
                    <button
                      key={opt}
                      onClick={() => handleAnswer(opt)}
                      style={{
                        padding: '18px 20px',
                        borderRadius: 16,
                        border: '1.5px solid #e2e8f0',
                        background: '#ffffff',
                        color: NAVY,
                        fontSize: 15,
                        fontWeight: 500,
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        textAlign: 'left',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        boxShadow: '0 2px 8px rgba(26,58,92,0.04)',
                        boxSizing: 'border-box',
                      }}
                    >
                      {opt}
                      <ChevronRight size={16} color={NAVY} />
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        {/* STEP3: analyzing */}
        {step === 'analyzing' ? (
          <div style={{ background: '#08162b', borderRadius: 24, padding: '48px 28px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32 }}>
            <div style={{ textAlign: 'center' }}>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                style={{ width: 48, height: 48, borderRadius: '50%', border: '3px solid rgba(201,168,76,0.25)', borderTopColor: GOLD, margin: '0 auto 20px' }}
              />
              <div style={{ color: '#ffffff', fontSize: 16, fontWeight: 500, marginBottom: 6 }}>AI専門家マッチング中...</div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>{selectedWorries.join('・')}のご相談を分析しています</div>
            </div>
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 14 }}>
              {ANALYZE_ITEMS.map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {i <= checkIndex ? (
                    <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
                      <CheckCircle size={20} color="#22c55e" />
                    </motion.div>
                  ) : (
                    <Circle size={20} color="rgba(255,255,255,0.2)" />
                  )}
                  <span style={{ color: i <= checkIndex ? '#ffffff' : 'rgba(255,255,255,0.3)', fontSize: 14, fontWeight: i <= checkIndex ? 500 : 400, flex: 1, transition: 'color 0.3s' }}>{item}</span>
                  {i === checkIndex ? (
                    <motion.div animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 0.9, repeat: Infinity }} style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', flexShrink: 0 }} />
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* STEP4: result */}
        {step === 'result' ? (
          <div>

            {/* Header */}
            <div style={{ background: NAVY, borderRadius: 16, padding: '24px', marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginBottom: 4 }}>AIマッチング完了</div>
              <div style={{ fontSize: 18, fontWeight: 500, color: '#ffffff', marginBottom: 12 }}>あなたに最適な専門家が見つかりました</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {selectedWorries.map(w => (
                  <span key={w} style={{ fontSize: 11, color: GOLD, background: 'rgba(201,168,76,0.18)', border: '1px solid ' + GOLD, borderRadius: 12, padding: '2px 10px' }}>{w}</span>
                ))}
              </div>
            </div>

            {/* Top 3 */}
            <div style={{ background: '#ffffff', borderRadius: 16, padding: '20px', marginBottom: 16, border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: NAVY, marginBottom: 16 }}>おすすめ専門家 TOP3</div>
              {matchedExperts.slice(0, 3).map((expert, i) => (
                <div key={expert.id} style={{ marginBottom: i < 2 ? 14 : 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 11, fontWeight: 500, color: i === 0 ? GOLD : '#94a3b8', background: i === 0 ? 'rgba(201,168,76,0.15)' : '#f1f5f9', borderRadius: 8, padding: '2px 8px' }}>
                        {i === 0 ? '1位' : i === 1 ? '2位' : '3位'}
                      </span>
                      <span style={{ fontSize: 13, color: NAVY, fontWeight: 500 }}>{expert.name}（{expert.title}）</span>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 500, color: i === 0 ? GOLD : NAVY }}>{MATCH_PCTS[i]}%</span>
                  </div>
                  <div style={{ height: 6, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
                    <motion.div
                      initial={{ width: '0%' }}
                      animate={{ width: MATCH_PCTS[i] + '%' }}
                      transition={{ duration: 0.7, delay: i * 0.15, ease: 'easeOut' }}
                      style={{ height: '100%', background: i === 0 ? GOLD : NAVY, borderRadius: 3 }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* AI matching reason */}
            <div style={{ background: '#f0f6ff', borderRadius: 16, padding: '16px 20px', marginBottom: 20, border: '1px solid #dbeafe' }}>
              <div style={{ fontSize: 12, color: '#6b8ab5', marginBottom: 6, fontWeight: 500 }}>AIマッチング理由</div>
              <p style={{ fontSize: 13, color: '#334155', lineHeight: 1.75, margin: 0 }}>
                {'「' + selectedWorries.join('・') + '」に関するヒアリング結果と専門家データベースを照合しました。お客様の状況に最も適した専門家を優先度順にご紹介します。'}
              </p>
            </div>

            {/* Expert cards */}
            <div style={{ display: 'grid', gridTemplateColumns: isPC ? '1fr 1fr' : '1fr', gap: 16, marginBottom: 24 }}>
              {matchedExperts.map(expert => {
                const rankStyle = RANK_COLORS[expert.rank] || RANK_COLORS.Rookie;
                return (
                  <div key={expert.id} style={{ background: '#ffffff', borderRadius: 16, border: '1.5px solid #e2e8f0', padding: '20px', boxShadow: '0 2px 12px rgba(26,58,92,0.04)' }}>

                    {/* Rank + AI badge + name */}
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                        <span style={{ fontSize: 10, fontWeight: 500, color: rankStyle.color, background: rankStyle.bg, border: '1px solid ' + rankStyle.border, borderRadius: 6, padding: '2px 8px' }}>{expert.rank}</span>
                        <span style={{ fontSize: 10, fontWeight: 500, color: GOLD, background: 'rgba(201,168,76,0.12)', border: '1px solid ' + GOLD, borderRadius: 6, padding: '2px 8px' }}>AI認証済</span>
                      </div>
                      <div style={{ fontSize: 16, fontWeight: 500, color: NAVY, marginBottom: 2 }}>{expert.name}</div>
                      <div style={{ fontSize: 12, color: '#64748b', marginBottom: 2 }}>{expert.title}</div>
                      <div style={{ fontSize: 11, color: '#94a3b8' }}>{expert.license}</div>
                    </div>

                    {/* Auth badges */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 14 }}>
                      {expert.badges.map(b => (
                        <span key={b} style={{ fontSize: 10, color: '#22c55e', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 6, padding: '2px 7px' }}>{b}</span>
                      ))}
                    </div>

                    {/* Ability meters */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
                      {[
                        { label: '専門スキル', val: expert.skill },
                        { label: 'レスポンス', val: expert.response },
                        { label: '実績', val: expert.record },
                      ].map(m => (
                        <div key={m.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 11, color: '#64748b', width: 72, flexShrink: 0 }}>{m.label}</span>
                          <StarRow value={m.val} />
                        </div>
                      ))}
                    </div>

                    {/* Tags */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 16 }}>
                      {expert.tags.map(t => (
                        <span key={t} style={{ fontSize: 11, color: '#64748b', background: '#f8fafd', border: '1px solid #e2e8f0', borderRadius: 6, padding: '2px 8px' }}>{t}</span>
                      ))}
                    </div>

                    {/* Buttons */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
                      <button onClick={() => onNavigate('chat')} style={{ padding: '10px 4px', borderRadius: 10, border: 'none', background: NAVY, color: '#ffffff', fontSize: 11, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>AI相談</button>
                      <button onClick={() => onNavigate('expert')} style={{ padding: '10px 4px', borderRadius: 10, border: 'none', background: GOLD, color: NAVY, fontSize: 11, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>相談予約</button>
                      <button onClick={() => {}} style={{ padding: '10px 4px', borderRadius: 10, border: '1px solid #e2e8f0', background: '#f8fafd', color: '#64748b', fontSize: 11, fontWeight: 400, cursor: 'pointer', fontFamily: 'inherit' }}>口コミを見る</button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Restart */}
            <button
              onClick={handleRestart}
              style={{ width: '100%', padding: '14px', borderRadius: 50, border: '1.5px solid #e2e8f0', background: '#ffffff', color: '#64748b', fontSize: 15, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxSizing: 'border-box' }}
            >
              条件を変えて再検索
            </button>

          </div>
        ) : null}

      </div>
    </div>
  );
}
