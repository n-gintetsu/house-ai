import { useState, useEffect } from 'react';
import { drillLevel1 } from './drillData';
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

const COUNT_OPTIONS = [
  { count: 5, label: '5問チャレンジ' },
  { count: 10, label: '10問チャレンジ' },
  { count: 30, label: '30問チャレンジ' },
  { count: 50, label: '全50問挑戦' },
];

export default function InvestorDrillPage({ onBack, onOpenTool, onShowRanking }) {
  const [phase, setPhase] = useState('select');
  const [selectedCount, setSelectedCount] = useState(null);
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

  function handleStart(count) {
    setSelectedCount(count);
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
    setSelectedCount(null);
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
      <div style={{ minHeight: '100vh', background: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', overflowY: 'auto' }}>
        <div style={{ width: '100%', maxWidth: '480px' }}>
          {onBack ? (
            <button
              onClick={onBack}
              style={{ marginBottom: '24px', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: 'rgba(255,255,255,0.6)', fontSize: '14px', padding: '8px 16px', cursor: 'pointer' }}
            >
              戻る
            </button>
          ) : null}

          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#D4AF37', margin: '0 0 8px' }}>投資初心者ドリル</h1>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', margin: 0 }}>LEVEL 1 ｜ 投資見習い</p>
          </div>

          <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)', marginBottom: '32px' }} />

          <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.7)', fontSize: '14px', marginBottom: '32px' }}>
            AIと一緒に不動産投資の基礎を身につけよう
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {COUNT_OPTIONS.map(({ count, label }) => (
              <button
                key={count}
                onClick={() => handleStart(count)}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(212,175,55,0.3)',
                  borderRadius: '12px',
                  padding: '16px',
                  color: 'white',
                  fontSize: '16px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'border-color 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#D4AF37'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(212,175,55,0.3)'; }}
              >
                {label}
              </button>
            ))}
          </div>
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

    return (
      <div style={{ minHeight: '100vh', background: '#0F172A', color: 'white', overflowY: 'auto', fontFamily: 'inherit', animation: 'flicker 8s infinite' }}>
        <style>{`
          @keyframes scanline {
            0% { transform: translateY(-100%); opacity: 0.3; }
            100% { transform: translateY(100vh); opacity: 0; }
          }
          @keyframes flicker {
            0%, 100% { opacity: 1; }
            92% { opacity: 1; }
            93% { opacity: 0.4; }
            94% { opacity: 1; }
            96% { opacity: 0.6; }
            97% { opacity: 1; }
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
        `}</style>

        {/* スキャンライン */}
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '2px', background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.6), transparent)', animation: 'scanline 4s linear infinite', pointerEvents: 'none', zIndex: 999 }} />

        {/* 微粒子 */}
        <div style={{ position: 'fixed', top: '20%', right: '5%', width: '4px', height: '4px', borderRadius: '50%', background: 'rgba(212,175,55,0.4)', animation: 'particleFloat 3s ease-in-out infinite', pointerEvents: 'none' }} />
        <div style={{ position: 'fixed', top: '60%', left: '3%', width: '3px', height: '3px', borderRadius: '50%', background: 'rgba(212,175,55,0.3)', animation: 'particleFloat 5s ease-in-out infinite', pointerEvents: 'none' }} />
        <div style={{ position: 'fixed', top: '40%', right: '8%', width: '2px', height: '2px', borderRadius: '50%', background: 'rgba(212,175,55,0.2)', animation: 'particleFloat 7s ease-in-out infinite', pointerEvents: 'none' }} />

        {/* ヘッダー */}
        <div style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ color: '#D4AF37', fontWeight: 700, fontSize: '16px' }}>
              Q.{currentIndex + 1} / {questions.length}
            </span>
            <span style={{ padding: '3px 10px', borderRadius: '999px', background: 'rgba(212,175,55,0.12)', color: '#D4AF37', fontSize: '12px', fontWeight: 600 }}>
              {q.category}
            </span>
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
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#D4AF37', animation: 'flicker 2s infinite' }} />
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
          @keyframes flicker {
            0%, 100% { opacity: 1; }
            92% { opacity: 1; }
            93% { opacity: 0.4; }
            94% { opacity: 1; }
            96% { opacity: 0.6; }
            97% { opacity: 1; }
          }
          @keyframes aiScan {
            0% { width: 0%; opacity: 1; }
            100% { width: 100%; opacity: 0; }
          }
        `}</style>

        {/* スキャンライン */}
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '2px', background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.6), transparent)', animation: 'scanline 3s linear infinite', pointerEvents: 'none', zIndex: 999 }} />

        <div style={{ width: '100%', maxWidth: '480px', textAlign: 'center' }}>
          {resultPhase === 0 ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: 'rgba(212,175,55,0.8)', letterSpacing: '4px', marginBottom: '24px', animation: 'flicker 1s infinite' }}>
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
