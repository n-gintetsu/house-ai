import { useState, useEffect } from 'react';
import { drillLevel1, drillExtreme, drillLevel2, drillLevel3 } from './drillData';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const correctComments = [
  '分析精度が上昇しています…',
  'その視点、投資家です。',
  '市場を読む眼が開いてきました。',
  '正確です。この判断力は本物です。',
  'AIが成長を検知しました。',
  'その直感、鍛えられています。',
  '投資家としての思考パターンを確認。',
  'データと直感の融合。理想的です。',
];

const wrongComment = 'その視点は悪くありません。\n投資家でも迷う領域です。';

const reactionItems = [
  { key: 'hard', label: 'むずい' },
  { key: 'great', label: '神問題' },
  { key: 'good', label: 'なるほど' },
  { key: 'beaten', label: 'やられた' },
  { key: 'explain', label: '解説ほしい' },
];

export default function InvestorDrillPage({ onBack, onOpenTool, onShowRanking }) {
  const [phase, setPhase] = useState('select');
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [praiseIndex] = useState(() => Math.floor(Math.random() * correctComments.length));
  const [showNameInput, setShowNameInput] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [scoreSaved, setScoreSaved] = useState(false);
  const [resultPhase, setResultPhase] = useState(0);
  const [userPercentile, setUserPercentile] = useState(null);
  const [liveStats, setLiveStats] = useState(null);
  const [reactions, setReactions] = useState({ hard: 0, great: 0, good: 0, beaten: 0, explain: 0 });
  const [myReaction, setMyReaction] = useState(null);

  useEffect(() => {
    if (phase !== 'result') return;
    const fetchPercentile = async () => {
      const { data } = await supabase
        .from('drill_scores')
        .select('rate');
      if (data && data.length > 0) {
        const myRate = Math.round(score / questions.length * 100);
        const above = data.filter(d => d.rate < myRate).length;
        const percentile = Math.round((above / data.length) * 100);
        setUserPercentile(percentile);
      }
    };
    fetchPercentile();
    setTimeout(() => setResultPhase(1), 1200);
    setTimeout(() => setResultPhase(2), 2400);
    setTimeout(() => setResultPhase(3), 3600);
  }, [phase]);

  useEffect(() => {
    const fetchLiveStats = async () => {
      const { data } = await supabase
        .from('drill_scores')
        .select('user_name, badge, streak, created_at')
        .order('created_at', { ascending: false })
        .limit(100);
      if (data && data.length > 0) {
        const total = data.length;
        const goldCount = data.filter(d => d.badge === 'GOLD').length;
        const silverCount = data.filter(d => d.badge === 'SILVER').length;
        const maxStreakAll = Math.max(...data.map(d => d.streak || 0));
        const latestNames = data.slice(0, 5).map(d => d.user_name);
        setLiveStats({ total, goldCount, silverCount, maxStreakAll, latestNames });
      }
    };
    fetchLiveStats();
  }, []);

  function startQuiz(count) {
    setQuestions(drillLevel1.slice(0, count));
    setPhase('quiz');
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
  }

  function handleAnswer(choiceIndex) {
    if (showResult) return;
    setSelectedAnswer(choiceIndex);
    setShowResult(true);
    const q = questions[currentIndex];
    if (choiceIndex === q.correct) {
      const newStreak = streak + 1;
      setScore(s => s + 1);
      setStreak(newStreak);
      setMaxStreak(m => Math.max(m, newStreak));
    } else {
      setStreak(0);
    }
  }

  function handleNext() {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(i => i + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setResultPhase(0);
      setPhase('result');
    }
  }

  function handleReset() {
    setPhase('select');
    setSelectedLevel(null);
    setQuestions([]);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setShowNameInput(false);
    setPlayerName('');
    setScoreSaved(false);
    setResultPhase(0);
    setUserPercentile(null);
    setReactions({ hard: 0, great: 0, good: 0, beaten: 0, explain: 0 });
    setMyReaction(null);
  }

  async function handleSaveScore() {
    if (!playerName.trim()) return;
    const rate = Math.round(score / questions.length * 100);
    const badge = rate >= 95 ? 'GOLD' : rate >= 80 ? 'SILVER' : rate >= 60 ? 'BRONZE' : null;
    const { error } = await supabase.from('drill_scores').insert({
      user_name: playerName.trim(),
      score,
      total: questions.length,
      rate,
      streak: maxStreak,
      badge,
    });
    if (!error) setScoreSaved(true);
  }

  const progressPct = questions.length > 0 ? (currentIndex / questions.length) * 100 : 0;
  const q = questions[currentIndex];

  if (phase === 'select') {
    return (
      <div style={{ minHeight: '100vh', background: '#0F172A', padding: '24px', boxSizing: 'border-box' }}>
        {onBack ? (
          <button
            onClick={onBack}
            style={{ marginBottom: '24px', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: 'rgba(255,255,255,0.6)', fontSize: '14px', padding: '8px 16px', cursor: 'pointer' }}
          >
            戻る
          </button>
        ) : null}

        <div style={{ textAlign: 'center', marginBottom: '48px', paddingTop: '24px' }}>
          <div style={{ fontSize: '10px', color: 'rgba(212,175,55,0.6)', letterSpacing: '4px', marginBottom: '12px' }}>
            AI INVESTOR TRAINING
          </div>
          <div style={{ fontSize: '28px', fontWeight: '700', color: 'white' }}>
            投資家育成ドリル
          </div>
          <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginTop: '8px' }}>
            レベルを選択してください
          </div>
        </div>

        <div style={{ maxWidth: '480px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* LEVEL 1 */}
          <div
            onClick={() => { setSelectedLevel('lv1'); setQuestions(drillLevel1.slice(0, 50)); setPhase('modeSelect'); }}
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(212,175,55,0.25)', borderRadius: '16px', padding: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '16px' }}
          >
            <div style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '8px', padding: '8px 12px', textAlign: 'center' }}>
              <div style={{ fontSize: '10px', color: '#D4AF37', letterSpacing: '2px' }}>LV</div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#D4AF37', lineHeight: 1 }}>1</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '18px', fontWeight: 700, color: 'white' }}>投資見習い</div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>利回り・空室・修繕・ローン基礎</div>
              <div style={{ fontSize: '11px', color: 'rgba(212,175,55,0.6)', marginTop: '8px' }}>全50問</div>
            </div>
            <div style={{ color: 'rgba(212,175,55,0.5)', fontSize: '20px' }}>{'>'}</div>
          </div>

          {/* LEVEL 2 */}
          <div
            onClick={() => { setSelectedLevel('lv2'); setPhase('modeSelect'); }}
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(100,160,255,0.3)', borderRadius: '16px', padding: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '16px' }}
          >
            <div style={{ background: 'rgba(100,160,255,0.05)', border: '1px solid rgba(100,160,255,0.2)', borderRadius: '8px', padding: '8px 12px', textAlign: 'center' }}>
              <div style={{ fontSize: '10px', color: '#60a0ff', letterSpacing: '2px' }}>LV</div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#60a0ff', lineHeight: 1 }}>2</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '18px', fontWeight: 700, color: 'white' }}>収益化チャレンジャー</div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>キャッシュフロー・融資・出口戦略</div>
              <div style={{ fontSize: '11px', color: 'rgba(100,160,255,0.6)', marginTop: '8px' }}>全50問</div>
            </div>
            <div style={{ color: 'rgba(100,160,255,0.5)', fontSize: '20px' }}>{'>'}</div>
          </div>

          {/* LEVEL 3 */}
          <div
            onClick={() => { setSelectedLevel('lv3'); setPhase('modeSelect'); }}
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '16px', padding: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '16px' }}
          >
            <div style={{ background: 'rgba(212,175,55,0.05)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: '8px', padding: '8px 12px', textAlign: 'center' }}>
              <div style={{ fontSize: '10px', color: '#D4AF37', letterSpacing: '2px' }}>LV</div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#D4AF37', lineHeight: 1 }}>3</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '18px', fontWeight: 700, color: 'white' }}>プロ投資家</div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>IRR・積算・法人化・相続・レバレッジ</div>
              <div style={{ fontSize: '11px', color: 'rgba(212,175,55,0.6)', marginTop: '8px' }}>全50問</div>
            </div>
            <div style={{ color: 'rgba(212,175,55,0.5)', fontSize: '20px' }}>{'>'}</div>
          </div>

          {/* EXTREME */}
          <div
            onClick={() => { setSelectedLevel('extreme'); setPhase('modeSelect'); }}
            style={{ background: 'linear-gradient(135deg, rgba(20,0,0,0.8), rgba(10,10,10,0.9))', border: '1px solid rgba(212,175,55,0.6)', borderRadius: '16px', padding: '28px', cursor: 'pointer', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', gap: '16px' }}
          >
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '2px', background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)' }} />
            <div style={{ background: 'rgba(212,175,55,0.15)', border: '1px solid #D4AF37', borderRadius: '8px', padding: '8px 12px', textAlign: 'center' }}>
              <div style={{ fontSize: '10px', color: '#D4AF37', letterSpacing: '2px' }}>EX</div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#D4AF37', lineHeight: 1 }}>!</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#D4AF37', letterSpacing: '1px' }}>AI EXTREME TEST</div>
              <div style={{ fontSize: '12px', color: 'rgba(212,175,55,0.6)', marginTop: '4px' }}>ネットで調べても解けない超難問</div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', marginTop: '4px' }}>本物の投資家だけが解ける領域</div>
            </div>
            <div style={{ color: '#D4AF37', fontSize: '20px' }}>{'>'}</div>
          </div>

          <div style={{ textAlign: 'center', fontSize: '11px', color: 'rgba(255,255,255,0.2)', marginTop: '8px' }}>
            EXTREME は登録不要・全問正解者は全国TOP認定
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'modeSelect') {
    const isExtreme = selectedLevel === 'extreme';
    const counts = selectedLevel === 'extreme' ? [5, 10, 20, drillExtreme.length]
      : selectedLevel === 'lv2' ? [5, 10, 30, 50]
      : selectedLevel === 'lv3' ? [5, 10, 30, 50]
      : [5, 10, 30, 50];
    const labels = isExtreme
      ? ['5問チャレンジ（超難問）', '10問チャレンジ（超難問）', '20問（本気モード）', '全問挑戦（伝説級）']
      : ['5問チャレンジ', '10問チャレンジ', '30問チャレンジ', '全50問挑戦'];

    return (
      <div style={{ minHeight: '100vh', background: '#0F172A', padding: '24px', boxSizing: 'border-box' }}>
        <button
          onClick={() => setPhase('select')}
          style={{ marginBottom: '24px', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: 'rgba(255,255,255,0.6)', fontSize: '14px', padding: '8px 16px', cursor: 'pointer' }}
        >
          戻る
        </button>

        {isExtreme ? (
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <div style={{ color: '#D4AF37', fontSize: '24px', fontWeight: 700, letterSpacing: '2px' }}>AI EXTREME TEST</div>
            <div style={{ color: 'rgba(212,175,55,0.5)', fontSize: '12px', marginTop: '8px' }}>本物の投資家領域への挑戦</div>
          </div>
        ) : selectedLevel === 'lv2' ? (
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <div style={{ color: 'white', fontSize: '22px', fontWeight: 700 }}>LEVEL 2 ｜ 収益化チャレンジャー</div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', marginTop: '8px' }}>問題数を選択してください</div>
          </div>
        ) : selectedLevel === 'lv3' ? (
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <div style={{ color: '#D4AF37', fontSize: '22px', fontWeight: 700 }}>LEVEL 3 ｜ プロ投資家</div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', marginTop: '8px' }}>問題数を選択してください</div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <div style={{ color: 'white', fontSize: '22px', fontWeight: 700 }}>LEVEL 1 ｜ 投資見習い</div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', marginTop: '8px' }}>問題数を選択してください</div>
          </div>
        )}

        <div style={{ maxWidth: '440px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {labels.map((label, index) => (
            <button
              key={index}
              onClick={() => {
                const pool = selectedLevel === 'extreme' ? drillExtreme
                  : selectedLevel === 'lv2' ? drillLevel2
                  : selectedLevel === 'lv3' ? drillLevel3
                  : drillLevel1;
                setQuestions(pool.slice(0, counts[index]));
                setPhase('quiz');
                setCurrentIndex(0);
                setSelectedAnswer(null);
                setShowResult(false);
                setScore(0);
                setStreak(0);
                setMaxStreak(0);
              }}
              style={{
                background: isExtreme ? 'rgba(212,175,55,0.06)' : 'rgba(255,255,255,0.04)',
                border: isExtreme ? '1px solid rgba(212,175,55,0.35)' : '1px solid rgba(255,255,255,0.1)',
                color: isExtreme ? '#D4AF37' : 'white',
                fontSize: '16px',
                padding: '18px',
                borderRadius: '12px',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (phase === 'quiz') {
    const isCorrect = selectedAnswer === q.correct;

    const streakLabel =
      streak >= 10 ? 'AIが異常な成長速度を検知しました。' :
      streak === 5 ? '投資家思考、覚醒中。' :
      streak === 3 ? '分析精度が上昇しています…' :
      null;

    const aiAnalysisMsg =
      showResult && isCorrect && streak >= 3 ? '連続正解を検知。思考パターンが安定しています。' :
      showResult && isCorrect ? '正答を確認しました。' :
      showResult ? 'この領域は多くの投資家が迷います。' :
      '次の問題を分析中…';

    const sidePanelDisplay = typeof window !== 'undefined' && window.innerWidth < 768 ? 'none' : 'flex';

    return (
      <div style={{ minHeight: '100vh', background: '#0F172A', color: 'white', fontFamily: 'inherit', display: 'flex' }}>
        <style>{`
          @keyframes scanline {
            0% { transform: translateY(-100%); opacity: 0.3; }
            100% { transform: translateY(100vh); opacity: 0; }
          }
          @keyframes goldBreath {
            0%, 100% { opacity: 0.4; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.3); }
          }
          @keyframes particleFloat {
            0% { transform: translateY(0px) translateX(0px); opacity: 0.6; }
            50% { transform: translateY(-20px) translateX(10px); opacity: 0.3; }
            100% { transform: translateY(0px) translateX(0px); opacity: 0.6; }
          }
          @keyframes aiScan {
            0% { width: 0%; opacity: 1; }
            100% { width: 100%; opacity: 0; }
          }
          @keyframes livePulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.4; transform: scale(0.8); }
          }
        `}</style>

        {/* スキャンライン */}
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '2px', background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.6), transparent)', animation: 'scanline 4s linear infinite', pointerEvents: 'none', zIndex: 999 }} />

        {/* 微粒子 */}
        <div style={{ position: 'fixed', top: '20%', right: '5%', width: '4px', height: '4px', borderRadius: '50%', background: 'rgba(212,175,55,0.4)', animation: 'particleFloat 3s ease-in-out infinite', pointerEvents: 'none' }} />
        <div style={{ position: 'fixed', top: '60%', left: '3%', width: '3px', height: '3px', borderRadius: '50%', background: 'rgba(212,175,55,0.3)', animation: 'particleFloat 5s ease-in-out infinite', pointerEvents: 'none' }} />
        <div style={{ position: 'fixed', top: '40%', right: '8%', width: '2px', height: '2px', borderRadius: '50%', background: 'rgba(212,175,55,0.2)', animation: 'particleFloat 7s ease-in-out infinite', pointerEvents: 'none' }} />

        {/* 左カラム */}
        <div style={{ flex: 1, minWidth: 0, overflowY: 'auto' }}>
          {/* ヘッダー */}
          <div style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ color: '#D4AF37', fontWeight: 700, fontSize: '16px' }}>
                Q.{currentIndex + 1} / {questions.length}
              </span>
              <span style={{ padding: '3px 10px', borderRadius: '999px', background: 'rgba(212,175,55,0.12)', color: '#D4AF37', fontSize: '12px', fontWeight: 600 }}>
                {q.category}
              </span>
              {selectedLevel === 'extreme' ? (
                <span style={{ fontSize: '9px', fontWeight: '700', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.6)', padding: '2px 6px', borderRadius: '3px', letterSpacing: '1px' }}>EXTREME</span>
              ) : null}
            </div>
            <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>
              スコア {score}
            </span>
          </div>

          {/* 進捗バー */}
          <div style={{ height: '4px', background: 'rgba(255,255,255,0.08)' }}>
            <div style={{ height: '100%', width: `${progressPct}%`, background: 'linear-gradient(90deg, #D4AF37, #c9a84c)', transition: 'width 0.5s ease' }} />
          </div>

          {/* ストリーク演出 */}
          {!showResult && streakLabel !== null ? (
            <div style={{ textAlign: 'center', padding: '12px', color: '#D4AF37', fontWeight: 700, fontSize: '14px' }}>
              {streakLabel}
            </div>
          ) : null}

          {/* 問題カード */}
          <div style={{ maxWidth: '560px', margin: '0 auto', padding: '32px 24px' }}>
            <div
              style={{
                background: showResult && isCorrect ? 'rgba(212,175,55,0.1)' : 'rgba(255,255,255,0.05)',
                borderRadius: '20px',
                padding: '32px',
                marginBottom: '24px',
                transition: 'background 0.3s ease',
                opacity: 1,
              }}
            >
              {/* AI解析ヘッダー */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#D4AF37', animation: 'goldBreath 3s ease-in-out infinite' }} />
                <span style={{ fontSize: '10px', color: 'rgba(212,175,55,0.7)', letterSpacing: '3px', fontWeight: '600' }}>AI ANALYSIS</span>
                <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, rgba(212,175,55,0.4), transparent)' }} />
                <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', letterSpacing: '1px' }}>Q.{currentIndex + 1}</span>
              </div>

              <p style={{ fontSize: '20px', fontWeight: 600, color: 'white', lineHeight: 1.6, margin: '0 0 28px' }}>
                {q.question}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {q.choices.map((choice, idx) => {
                  let bg = 'rgba(255,255,255,0.05)';
                  let borderColor = 'rgba(255,255,255,0.1)';
                  let color = 'white';
                  let opacity = 1;

                  if (showResult) {
                    if (idx === q.correct) {
                      bg = 'rgba(212,175,55,0.2)';
                      borderColor = '#D4AF37';
                      color = '#D4AF37';
                    } else if (idx === selectedAnswer) {
                      bg = 'rgba(239,68,68,0.1)';
                      borderColor = '#EF4444';
                      color = '#EF4444';
                    } else {
                      opacity = 0.4;
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleAnswer(idx)}
                      disabled={showResult}
                      style={{
                        background: bg,
                        border: `1px solid ${borderColor}`,
                        borderRadius: '12px',
                        padding: '16px',
                        color: color,
                        fontSize: '16px',
                        textAlign: 'left',
                        cursor: showResult ? 'default' : 'pointer',
                        opacity: opacity,
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {choice}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 正解・不正解演出 */}
            {showResult ? (
              isCorrect ? (
                <div style={{ color: '#D4AF37', fontSize: '14px', fontWeight: 600, marginBottom: '16px' }}>
                  {correctComments[praiseIndex]}
                </div>
              ) : (
                <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', marginBottom: '16px', whiteSpace: 'pre-line' }}>
                  {wrongComment}
                </div>
              )
            ) : null}

            {/* 解説 */}
            {showResult ? (
              <div style={{ background: 'rgba(255,255,255,0.05)', borderLeft: '3px solid #D4AF37', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
                <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '14px', lineHeight: 1.7, margin: 0 }}>
                  {q.explanation}
                </p>
              </div>
            ) : null}

            {/* 次へボタン */}
            {showResult ? (
              <button
                onClick={handleNext}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '16px 40px',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #D4AF37, #c9a84c)',
                  color: '#0F172A',
                  fontWeight: 700,
                  fontSize: '16px',
                  cursor: 'pointer',
                }}
              >
                {currentIndex < questions.length - 1 ? '次の問題へ' : '結果を見る'}
              </button>
            ) : null}
          </div>
        </div>

        {/* 右カラム（AI伴走モニター） */}
        <div style={{
          width: '220px',
          minWidth: '220px',
          borderLeft: '1px solid rgba(255,255,255,0.06)',
          background: 'rgba(5,5,15,0.8)',
          minHeight: '100vh',
          display: sidePanelDisplay,
          flexDirection: 'column',
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflowY: 'auto',
        }}>
          {/* Zone 1: AI ANALYZER */}
          <div style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: '9px', color: 'rgba(212,175,55,0.6)', letterSpacing: '3px', marginBottom: '12px' }}>AI ANALYZER</div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, marginBottom: '16px' }}>
              {aiAnalysisMsg}
            </div>
            {liveStats !== null ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                  <span style={{ color: 'rgba(255,255,255,0.4)' }}>累計挑戦者</span>
                  <span style={{ color: 'white', fontWeight: 700 }}>{liveStats.total}人</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                  <span style={{ color: 'rgba(255,255,255,0.4)' }}>GOLD認定</span>
                  <span style={{ color: '#D4AF37', fontWeight: 700 }}>{liveStats.goldCount}人</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                  <span style={{ color: 'rgba(255,255,255,0.4)' }}>最高連続正解</span>
                  <span style={{ color: '#D4AF37', fontWeight: 700 }}>{liveStats.maxStreakAll}連続</span>
                </div>
              </div>
            ) : null}
          </div>

          {/* Zone 2: LIVE LOG */}
          <div style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.06)', flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22C55E', animation: 'livePulse 2s ease-in-out infinite' }} />
              <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.5)', letterSpacing: '2px' }}>LIVE LOG</span>
            </div>
            {liveStats !== null && liveStats.latestNames.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {liveStats.latestNames.map((name, i) => (
                  <div key={i} style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ color: 'rgba(255,255,255,0.2)' }}>—</span>
                    <span>{name} が挑戦</span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)' }}>ログなし</div>
            )}
          </div>

          {/* Zone 3: REACTION */}
          <div style={{ padding: '16px' }}>
            <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', letterSpacing: '2px', marginBottom: '10px' }}>REACTION</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {reactionItems.map(item => (
                <button
                  key={item.key}
                  onClick={() => {
                    if (myReaction === item.key) {
                      setMyReaction(null);
                      setReactions(r => ({ ...r, [item.key]: Math.max(0, r[item.key] - 1) }));
                    } else {
                      if (myReaction !== null) {
                        setReactions(r => ({ ...r, [myReaction]: Math.max(0, r[myReaction] - 1) }));
                      }
                      setMyReaction(item.key);
                      setReactions(r => ({ ...r, [item.key]: r[item.key] + 1 }));
                    }
                  }}
                  style={{
                    background: myReaction === item.key ? 'rgba(212,175,55,0.15)' : 'rgba(255,255,255,0.03)',
                    border: myReaction === item.key ? '1px solid rgba(212,175,55,0.5)' : '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '6px',
                    padding: '6px 10px',
                    color: myReaction === item.key ? '#D4AF37' : 'rgba(255,255,255,0.5)',
                    fontSize: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    textAlign: 'left',
                  }}
                >
                  <span>{item.label}</span>
                  <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)' }}>{reactions[item.key]}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'result') {
    const rate = Math.round(score / questions.length * 100);
    const badge = rate >= 95 ? 'GOLD' : rate >= 80 ? 'SILVER' : rate >= 60 ? 'BRONZE' : null;
    const pct = rate;
    const aiComment =
      pct >= 80
        ? '投資家の基礎知識がかなり身についてきました。実際の物件分析に挑戦する準備ができています。'
        : pct >= 60
        ? '理解が深まっています。もう一度チャレンジすると更に定着します。'
        : '不動産投資は最初から分からなくて当然。繰り返すうちに必ず身につきます。';

    const badgeConfig =
      badge === 'GOLD' ? {
        bg: 'linear-gradient(135deg, rgba(212,175,55,0.15), rgba(212,175,55,0.05))',
        border: '1px solid #D4AF37',
        color: '#D4AF37',
        text: 'GOLD INVESTOR 認定',
        sub: 'ここまで来るユーザーはかなり少数です',
        animation: 'goldPulse 2s ease-in-out infinite alternate',
      } : badge === 'SILVER' ? {
        bg: 'transparent',
        border: '1px solid #C0C0C0',
        color: '#C0C0C0',
        text: 'SILVER INVESTOR 認定',
        sub: '本物の投資家レベルに近づいています',
        animation: 'none',
      } : badge === 'BRONZE' ? {
        bg: 'transparent',
        border: '1px solid #CD7F32',
        color: '#CD7F32',
        text: 'BRONZE INVESTOR 認定',
        sub: '投資の基礎が身についてきました',
        animation: 'none',
      } : null;

    const navBtnStyle = {
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.1)',
      color: 'rgba(255,255,255,0.8)',
      fontSize: '14px',
      padding: '14px',
      borderRadius: '10px',
      width: '100%',
      cursor: 'pointer',
      textAlign: 'left',
    };

    return (
      <div style={{ background: '#0F172A', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', boxSizing: 'border-box', position: 'relative', overflow: 'hidden' }}>
        <style>{`
          @keyframes goldPulse {
            0% { box-shadow: 0 0 10px rgba(212,175,55,0.3); }
            100% { box-shadow: 0 0 40px rgba(212,175,55,0.7), 0 0 80px rgba(212,175,55,0.2); }
          }
          @keyframes scanline {
            0% { transform: translateY(-100%); opacity: 0.3; }
            100% { transform: translateY(100vh); opacity: 0; }
          }
          @keyframes aiScan {
            0% { width: 0%; opacity: 1; }
            100% { width: 100%; opacity: 0; }
          }
          @keyframes goldBreath {
            0%, 100% { opacity: 0.4; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.3); }
          }
        `}</style>

        {/* スキャンライン */}
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '2px', background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.6), transparent)', animation: 'scanline 3s linear infinite', pointerEvents: 'none', zIndex: 999 }} />

        <div style={{ width: '100%', maxWidth: '480px', textAlign: 'center' }}>
          {resultPhase === 0 ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: 'rgba(212,175,55,0.8)', letterSpacing: '4px', marginBottom: '24px' }}>
                AI ANALYSIS COMPLETE
              </div>
              <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', letterSpacing: '2px' }}>
                データを解析しています…
              </div>
              <div style={{ width: '200px', height: '2px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', margin: '24px auto 0', overflow: 'hidden' }}>
                <div style={{ height: '100%', background: 'linear-gradient(90deg, #D4AF37, #c9a84c)', animation: 'aiScan 1.2s ease-out forwards' }} />
              </div>
            </div>
          ) : null}

          {resultPhase >= 1 ? (
            <div style={{ textAlign: 'center', marginBottom: '24px', opacity: 1, transition: 'opacity 0.8s' }}>
              <div style={{ fontSize: '11px', color: 'rgba(212,175,55,0.6)', letterSpacing: '4px', marginBottom: '12px' }}>
                AI ANALYSIS COMPLETE
              </div>
              <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', letterSpacing: '1px', marginBottom: '8px' }}>
                あなたの分析力は
              </div>
              <div style={{ fontSize: '48px', fontWeight: '700', color: '#D4AF37', lineHeight: 1 }}>
                上位{userPercentile !== null ? userPercentile : Math.floor(Math.random() * 20 + 5)}%
              </div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', marginTop: '8px', letterSpacing: '1px' }}>
                市場適性：{pct >= 80 ? '高' : '標準'}
              </div>
            </div>
          ) : null}

          {resultPhase >= 2 ? (
            badge !== null ? (
              <div style={{
                background: badgeConfig.bg,
                border: badgeConfig.border,
                borderRadius: '16px',
                padding: '24px',
                textAlign: 'center',
                marginBottom: '24px',
                animation: badgeConfig.animation,
                opacity: 1,
                transition: 'opacity 0.8s',
                transform: 'scale(1)',
              }}>
                <div style={{ fontSize: '22px', fontWeight: 700, color: badgeConfig.color, letterSpacing: '3px' }}>
                  {badgeConfig.text}
                </div>
                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', marginTop: '8px' }}>
                  {badgeConfig.sub}
                </div>
              </div>
            ) : null
          ) : null}

          {resultPhase >= 3 ? (
            <div>
              {!scoreSaved ? (
                !showNameInput ? (
                  <button
                    onClick={() => setShowNameInput(true)}
                    style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.4)', color: '#D4AF37', fontSize: '14px', padding: '12px 24px', borderRadius: '10px', cursor: 'pointer', width: '100%', marginBottom: '16px' }}
                  >
                    スコアをランキングに登録する
                  </button>
                ) : (
                  <div>
                    <input
                      type="text"
                      placeholder="ニックネームを入力（例：Takumi_AI）"
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                      style={{ width: '100%', padding: '14px', fontSize: '16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(212,175,55,0.4)', borderRadius: '10px', color: 'white', boxSizing: 'border-box', marginBottom: '8px' }}
                    />
                    <button
                      onClick={handleSaveScore}
                      style={{ background: 'linear-gradient(135deg, #D4AF37, #c9a84c)', color: '#0F172A', fontWeight: 700, padding: '14px', borderRadius: '10px', border: 'none', fontSize: '16px', cursor: 'pointer', width: '100%', marginBottom: '16px' }}
                    >
                      登録してランキングに載る
                    </button>
                  </div>
                )
              ) : (
                <div>
                  <p style={{ color: '#D4AF37', textAlign: 'center', fontSize: '14px', marginBottom: '16px' }}>
                    ランキングに登録しました！
                  </p>
                  <button
                    onClick={() => { if (onShowRanking) onShowRanking(); }}
                    style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.4)', color: '#D4AF37', fontSize: '14px', padding: '12px', borderRadius: '10px', cursor: 'pointer', width: '100%', marginBottom: '16px' }}
                  >
                    ランキングを見る
                  </button>
                </div>
              )}

              <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '20px', padding: '32px', marginBottom: '24px' }}>
                <div style={{ fontSize: '56px', fontWeight: 700, color: 'white', lineHeight: 1 }}>
                  {score} <span style={{ fontSize: '24px', color: 'rgba(255,255,255,0.5)' }}>/ {questions.length}</span>
                </div>
                <div style={{ fontSize: '32px', fontWeight: 700, color: '#D4AF37', margin: '8px 0 24px' }}>{pct}%</div>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '32px', marginBottom: '24px' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>正答率</div>
                    <div style={{ fontSize: '18px', fontWeight: 700, color: 'white' }}>{pct}%</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>最大連続正解</div>
                    <div style={{ fontSize: '18px', fontWeight: 700, color: '#D4AF37' }}>{maxStreak}連続</div>
                  </div>
                </div>

                <div style={{ background: 'rgba(212,175,55,0.08)', borderLeft: '3px solid #D4AF37', borderRadius: '8px', padding: '16px', textAlign: 'left' }}>
                  <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '14px', lineHeight: 1.7, margin: 0 }}>{aiComment}</p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button
                  onClick={handleReset}
                  style={{ padding: '16px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #D4AF37, #c9a84c)', color: '#0F172A', fontWeight: 700, fontSize: '16px', cursor: 'pointer' }}
                >
                  もう一度挑戦する
                </button>
                <button
                  onClick={() => { window.location.href = '/'; }}
                  style={{ padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: 'white', fontSize: '16px', cursor: 'pointer' }}
                >
                  実際の投資物件を見る
                </button>
              </div>

              <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', margin: '24px 0' }} />
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', letterSpacing: '2px', textAlign: 'center', marginBottom: '16px' }}>
                次のステップへ
              </div>
              <button
                onClick={() => { if (onOpenTool) onOpenTool('investment'); }}
                style={navBtnStyle}
              >
                投資ローンをシミュレーションする
              </button>
              <button
                style={{ ...navBtnStyle, opacity: 0.5, marginTop: '8px', cursor: 'default' }}
              >
                AIコンシェルジュに相談する
              </button>
              <button
                onClick={() => { if (onOpenTool) onOpenTool('dictionary'); }}
                style={{ ...navBtnStyle, marginTop: '8px' }}
              >
                宅建用語集で知識を深める
              </button>
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  return null;
}
