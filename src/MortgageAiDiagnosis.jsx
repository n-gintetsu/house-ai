import { useState, useEffect } from 'react';
import { CheckCircle, Circle, ChevronRight, TrendingUp, Home, Calculator, ArrowRight, MessageSquare, Building2 } from 'lucide-react';
import { motion } from 'framer-motion';

const NAVY = '#1a3a5c';
const GOLD = '#c9a84c';

const CHECK_ITEMS = [
  '年収・勤続年数を確認しています',
  '返済負担率を計算しています',
  '金融機関の審査基準と照合中',
  '最適な金利プランを検索中',
  'AI診断スコアを算出しています',
];

function calcResults(form) {
  const income = parseInt(form.income) || 400;
  const downPayment = parseInt(form.downPayment) || 0;
  const years = parseInt(form.years) || 3;
  const desiredLoan = parseInt(form.desiredLoan) || 3000;
  const hasOtherLoan = form.otherLoan === 'あり';
  const employment = form.employment || '会社員';

  let multiplier = 5.5;
  if (employment === '公務員') multiplier = 6.5;
  else if (employment === '会社員') multiplier = 5.5;
  else if (employment === '自営業') multiplier = 4.0;
  else if (employment === 'パート') multiplier = 3.5;

  if (years < 1) multiplier = multiplier * 0.7;
  else if (years < 3) multiplier = multiplier * 0.85;
  else if (years >= 10) multiplier = multiplier * 1.1;

  if (hasOtherLoan) multiplier = multiplier * 0.8;

  const maxLoan = Math.floor(income * multiplier / 100) * 100;
  const r = 0.005 / 12;
  const n = 35 * 12;
  const actualLoan = Math.min(desiredLoan, maxLoan);
  const rawMonthly = actualLoan * 10000 * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
  const monthlyPayment = Math.round(rawMonthly / 1000) * 1000;

  let score = 60;
  if (income >= 500) score = score + 8;
  if (income >= 700) score = score + 8;
  if (years >= 3) score = score + 8;
  if (years >= 5) score = score + 5;
  if (years >= 10) score = score + 4;
  if (employment === '公務員') score = score + 10;
  else if (employment === '会社員') score = score + 5;
  if (!hasOtherLoan) score = score + 8;
  if (downPayment >= 200) score = score + 5;
  score = Math.min(score, 97);

  const scoreLabel = score >= 85 ? '通過見込み高' : score >= 70 ? '標準評価' : '条件整備を推奨';

  let comment = '年収' + income + '万円・勤続' + years + '年の条件で審査シミュレーションを実施しました。';
  if (score >= 85) {
    comment = comment + '審査通過の可能性が高い状況です。変動金利0.3%台を中心に複数の金融機関へ同時申込みを検討してください。';
  } else if (score >= 70) {
    comment = comment + '標準的な審査評価です。頭金を物件価格の10〜20%確保するか、借入期間の見直しでさらに有利な条件が得られます。';
  } else {
    comment = comment + '現時点では審査条件を整える余地があります。他の借入の整理と勤続年数の積み上げが最も効果的です。';
  }

  return { maxLoan, monthlyPayment, score, actualLoan, comment, scoreLabel };
}

const baseInput = {
  width: '100%',
  boxSizing: 'border-box',
  border: '1.5px solid #e2e8f0',
  borderRadius: 12,
  padding: '12px 14px',
  fontSize: 16,
  fontFamily: 'inherit',
  color: NAVY,
  background: '#f8fafd',
  outline: 'none',
};

const labelStyle = {
  display: 'block',
  fontSize: 13,
  color: '#4a5568',
  marginBottom: 6,
  fontWeight: 500,
};

export default function MortgageAiDiagnosis({ onNavigate }) {
  const [step, setStep] = useState('form');
  const [form, setForm] = useState({
    age: '',
    income: '',
    downPayment: '',
    years: '',
    employment: '会社員',
    desiredLoan: '',
    otherLoan: 'なし',
    concerns: '',
  });
  const [checkIndex, setCheckIndex] = useState(-1);
  const [results, setResults] = useState(null);

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const handleSubmit = () => {
    const r = calcResults(form);
    setResults(r);
    setCheckIndex(-1);
    setStep('analyzing');
  };

  useEffect(() => {
    if (step !== 'analyzing') return;
    const timers = [];
    CHECK_ITEMS.forEach((_, i) => {
      timers.push(setTimeout(() => setCheckIndex(i), (i + 1) * 460));
    });
    timers.push(setTimeout(() => setStep('result'), 2600));
    return () => timers.forEach(t => clearTimeout(t));
  }, [step]);

  return (
    <div style={{ background: '#ffffff', minHeight: '100vh', padding: '24px 16px 80px', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: 520, margin: '0 auto' }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: NAVY, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Calculator size={20} color={GOLD} />
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 500, color: NAVY }}>AI住宅ローン診断</div>
            <div style={{ fontSize: 12, color: '#94a3b8' }}>30秒で借入可能額を診断します</div>
          </div>
        </div>

        {step === 'form' ? (
          <div style={{ background: '#ffffff', borderRadius: 32, border: '1.5px solid #e2e8f0', padding: '28px 24px', boxShadow: '0 4px 24px rgba(26,58,92,0.06)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={labelStyle}>年齢</label>
                  <input type="number" placeholder="35" value={form.age} onChange={set('age')} style={baseInput} />
                </div>
                <div>
                  <label style={labelStyle}>年収（万円）</label>
                  <input type="number" placeholder="500" value={form.income} onChange={set('income')} style={baseInput} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={labelStyle}>頭金（万円）</label>
                  <input type="number" placeholder="300" value={form.downPayment} onChange={set('downPayment')} style={baseInput} />
                </div>
                <div>
                  <label style={labelStyle}>勤続年数（年）</label>
                  <input type="number" placeholder="5" value={form.years} onChange={set('years')} style={baseInput} />
                </div>
              </div>

              <div>
                <label style={labelStyle}>雇用形態</label>
                <select value={form.employment} onChange={set('employment')} style={baseInput}>
                  <option value="会社員">会社員</option>
                  <option value="自営業">自営業</option>
                  <option value="公務員">公務員</option>
                  <option value="パート">パート</option>
                </select>
              </div>

              <div>
                <label style={labelStyle}>希望借入額（万円）</label>
                <input type="number" placeholder="3000" value={form.desiredLoan} onChange={set('desiredLoan')} style={baseInput} />
              </div>

              <div>
                <label style={labelStyle}>他の借入</label>
                <select value={form.otherLoan} onChange={set('otherLoan')} style={baseInput}>
                  <option value="なし">なし</option>
                  <option value="あり">あり</option>
                  <option value="わからない">わからない</option>
                </select>
              </div>

              <div>
                <label style={labelStyle}>気になること・不安（任意）</label>
                <textarea
                  placeholder="例：変動金利が心配、将来の教育費も考慮したい..."
                  value={form.concerns}
                  onChange={set('concerns')}
                  style={{ ...baseInput, minHeight: 90, resize: 'vertical' }}
                />
              </div>

              <button
                onClick={handleSubmit}
                style={{
                  width: '100%',
                  padding: '16px',
                  borderRadius: 50,
                  border: 'none',
                  background: 'linear-gradient(to right, #12375d, #f0c94b)',
                  color: '#ffffff',
                  fontSize: 16,
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  fontFamily: 'inherit',
                  boxSizing: 'border-box',
                }}
              >
                AI診断を開始する
                <ArrowRight size={18} color="#ffffff" />
              </button>

            </div>
          </div>
        ) : null}

        {step === 'analyzing' ? (
          <div style={{ background: '#08162b', borderRadius: 32, padding: '48px 28px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32 }}>
            <div style={{ textAlign: 'center' }}>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  border: '3px solid rgba(201,168,76,0.25)',
                  borderTopColor: GOLD,
                  margin: '0 auto 20px',
                }}
              />
              <div style={{ color: '#ffffff', fontSize: 16, fontWeight: 500, marginBottom: 6 }}>AI診断中</div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>しばらくお待ちください</div>
            </div>

            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 14 }}>
              {CHECK_ITEMS.map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {i <= checkIndex ? (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    >
                      <CheckCircle size={20} color="#22c55e" />
                    </motion.div>
                  ) : (
                    <Circle size={20} color="rgba(255,255,255,0.2)" />
                  )}
                  <span style={{
                    color: i <= checkIndex ? '#ffffff' : 'rgba(255,255,255,0.3)',
                    fontSize: 14,
                    fontWeight: i <= checkIndex ? 500 : 400,
                    flex: 1,
                    transition: 'color 0.3s',
                  }}>
                    {item}
                  </span>
                  {i === checkIndex ? (
                    <motion.div
                      animate={{ opacity: [1, 0.2, 1] }}
                      transition={{ duration: 0.9, repeat: Infinity }}
                      style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', flexShrink: 0 }}
                    />
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {step === 'result' ? (
          results ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              <div style={{ background: NAVY, borderRadius: 32, padding: '28px 24px' }}>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginBottom: 6 }}>AI診断スコア</div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, marginBottom: 12 }}>
                  <span style={{ fontSize: 52, fontWeight: 500, color: GOLD, lineHeight: 1 }}>{results.score}</span>
                  <span style={{ fontSize: 18, color: 'rgba(255,255,255,0.5)', paddingBottom: 6 }}>/ 100</span>
                </div>
                <div style={{ display: 'inline-block', background: 'rgba(201,168,76,0.18)', border: '1px solid ' + GOLD, borderRadius: 20, padding: '4px 14px', fontSize: 12, color: GOLD }}>
                  {results.scoreLabel}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ background: '#f0f6ff', borderRadius: 20, padding: '18px 14px', border: '1px solid #dbeafe' }}>
                  <div style={{ fontSize: 11, color: '#6b8ab5', marginBottom: 6 }}>推定借入可能額</div>
                  <div style={{ fontSize: 22, fontWeight: 500, color: NAVY, lineHeight: 1.2 }}>{results.maxLoan.toLocaleString()}</div>
                  <div style={{ fontSize: 11, color: '#6b8ab5', marginTop: 2 }}>万円</div>
                </div>
                <div style={{ background: '#fffbeb', borderRadius: 20, padding: '18px 14px', border: '1px solid #fde68a' }}>
                  <div style={{ fontSize: 11, color: '#92693a', marginBottom: 6 }}>月々返済目安</div>
                  <div style={{ fontSize: 22, fontWeight: 500, color: '#92400e', lineHeight: 1.2 }}>{(results.monthlyPayment / 10000).toFixed(1)}</div>
                  <div style={{ fontSize: 11, color: '#92693a', marginTop: 2 }}>万円 / 月</div>
                  <div style={{ fontSize: 10, color: '#b07a42', marginTop: 4 }}>変動0.5% ・ 35年</div>
                </div>
              </div>

              <div style={{ background: '#f8fafd', borderRadius: 20, padding: '20px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <TrendingUp size={16} color={NAVY} />
                  <span style={{ fontSize: 13, fontWeight: 500, color: NAVY }}>AIコメント</span>
                </div>
                <p style={{ fontSize: 14, color: '#4a5568', lineHeight: 1.75, margin: 0 }}>{results.comment}</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button
                  onClick={() => onNavigate('chat')}
                  style={{ width: '100%', padding: '14px 20px', borderRadius: 16, border: 'none', background: NAVY, color: '#ffffff', fontSize: 15, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: 'inherit', boxSizing: 'border-box' }}
                >
                  <span>AIチャットでローン相談</span>
                  <MessageSquare size={18} color="#ffffff" />
                </button>
                <button
                  onClick={() => onNavigate('expert')}
                  style={{ width: '100%', padding: '14px 20px', borderRadius: 16, border: '1.5px solid #e2e8f0', background: '#f8fafd', color: NAVY, fontSize: 15, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: 'inherit', boxSizing: 'border-box' }}
                >
                  <span>住宅ローン専門家に相談</span>
                  <Building2 size={18} color={NAVY} />
                </button>
                <button
                  onClick={() => onNavigate('properties')}
                  style={{ width: '100%', padding: '14px 20px', borderRadius: 16, border: '1.5px solid #e2e8f0', background: '#f8fafd', color: NAVY, fontSize: 15, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: 'inherit', boxSizing: 'border-box' }}
                >
                  <span>物件情報を見る</span>
                  <Home size={18} color={NAVY} />
                </button>
                <button
                  onClick={() => onNavigate('sell')}
                  style={{ width: '100%', padding: '14px 20px', borderRadius: 16, border: '1.5px solid #e2e8f0', background: '#f8fafd', color: NAVY, fontSize: 15, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: 'inherit', boxSizing: 'border-box' }}
                >
                  <span>売却査定・資産相談</span>
                  <ChevronRight size={18} color={NAVY} />
                </button>
              </div>

              <button
                onClick={() => { setStep('form'); setCheckIndex(-1); setResults(null); }}
                style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: 13, cursor: 'pointer', textAlign: 'center', fontFamily: 'inherit', padding: '8px', width: '100%' }}
              >
                最初からやり直す
              </button>

            </div>
          ) : null
        ) : null}

      </div>
    </div>
  );
}
