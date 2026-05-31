import { useState, useEffect } from 'react';
import { CheckCircle, Circle, ChevronRight, TrendingUp, Home, Calculator, ArrowRight, MessageSquare, Building2, Star, Info } from 'lucide-react';
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

const CONSULT_CARDS = [
  { name: '住宅ローン相談センター', specialty: '銀行比較・金利交渉', area: '全国対応', fee: '無料', rating: 4 },
  { name: 'FPオンライン相談', specialty: '家計全体の資金計画', area: 'オンライン全国', fee: '初回無料', rating: 5 },
  { name: '銀行窓口相談', specialty: '自社ローン・優遇金利', area: '近隣店舗', fee: '無料', rating: 3 },
];

function calcResults(form) {
  const age = parseInt(form.age) || 35;
  const income = parseInt(form.income) || 400;
  const downPayment = parseInt(form.downPayment) || 0;
  const years = parseInt(form.years) || 3;
  const desiredLoan = parseInt(form.desiredLoan) || 3000;
  const hasOtherLoan = form.otherLoan === 'あり';
  const employment = form.employment || '会社員';

  let multiplier = 5.5;
  if (employment === '公務員') multiplier = 6.5;
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

  let passRate = Math.min(93, Math.max(18, score - 3));
  if (income >= 800) passRate = Math.min(93, passRate + 4);

  const isVariable = years >= 5 && !hasOtherLoan && income >= 500;
  const loanType = isVariable ? '変動金利' : '固定金利';
  const loanTypeRatio = isVariable
    ? Math.min(88, 65 + Math.floor(score / 4))
    : Math.min(85, 58 + Math.floor(score / 5));
  const loanTypeReasons = isVariable
    ? ['安定した収入と勤続年数がある', '返済余力があり金利上昇に対応可能', '当初期間の支払いを抑えられる']
    : ['返済計画の予測が立てやすい', '金利上昇リスクを排除できる', '長期の安定した返済が可能'];

  const borrowingRatio = maxLoan > 0 ? desiredLoan / maxLoan : 1;
  const riskItems = [
    {
      label: '教育費リスク',
      level: age < 35 ? 4 : age < 45 ? 3 : 2,
      comment: age < 40 ? '教育費のピークが返済期間と重なる可能性があります' : '教育費の負担が比較的落ち着く時期です',
    },
    {
      label: '金利上昇リスク',
      level: isVariable ? 4 : 2,
      comment: isVariable ? '変動金利は金利上昇時に返済額が増加します' : '固定金利で金利上昇リスクをカバーできています',
    },
    {
      label: '借入余力',
      level: borrowingRatio <= 0.7 ? 1 : borrowingRatio <= 0.85 ? 2 : borrowingRatio <= 1.0 ? 3 : 5,
      comment: borrowingRatio <= 0.7 ? '希望借入額は十分余裕のある範囲です' : '希望額が上限に近く余力は限られます',
    },
    {
      label: '老後資金余力',
      level: income >= 700 ? 2 : income >= 500 ? 3 : 4,
      comment: income >= 600 ? '返済しながら老後資金の積立も可能な水準です' : '老後資金の準備計画を合わせて立てることを推奨します',
    },
  ];

  const savingsAmount = Math.max(20, Math.round(actualLoan * 0.034 / 10) * 10);

  let comment = '年収' + income + '万円・勤続' + years + '年の条件で審査シミュレーションを実施しました。';
  if (score >= 85) {
    comment = comment + '審査通過の可能性が高い状況です。変動金利0.3%台を中心に複数の金融機関へ同時申込みを検討してください。';
  } else if (score >= 70) {
    comment = comment + '標準的な審査評価です。頭金を物件価格の10〜20%確保するか、借入期間の見直しでさらに有利な条件が得られます。';
  } else {
    comment = comment + '現時点では審査条件を整える余地があります。他の借入の整理と勤続年数の積み上げが最も効果的です。';
  }

  const cases = [
    { age: age + 1, income: income + 30, loan: actualLoan + 300, outcome: '購入成功', comment: '複数行を比較して変動金利で購入。月々の返済を抑えることができました。' },
    { age: age + 3, income: income + 60, loan: actualLoan + 100, outcome: '審査通過', comment: 'FPに相談し、固定期間選択型で安心感を得ながら購入しました。' },
    { age: Math.max(25, age - 2), income: Math.max(300, income - 20), loan: Math.max(500, actualLoan - 200), outcome: '条件交渉成功', comment: '頭金を増やして審査を通過。金利優遇も受けられました。' },
  ];

  return { maxLoan, monthlyPayment, score, actualLoan, comment, scoreLabel, passRate, loanType, loanTypeRatio, loanTypeReasons, riskItems, savingsAmount, cases };
}

const baseInput = {
  width: '100%', boxSizing: 'border-box', border: '1.5px solid #e2e8f0',
  borderRadius: 12, padding: '12px 14px', fontSize: 16, fontFamily: 'inherit',
  color: NAVY, background: '#f8fafd', outline: 'none',
};

const labelStyle = { display: 'block', fontSize: 13, color: '#4a5568', marginBottom: 6, fontWeight: 500 };

export default function MortgageAiDiagnosis({ onNavigate }) {
  const [step, setStep] = useState('form');
  const [form, setForm] = useState({ age: '', income: '', downPayment: '', years: '', employment: '会社員', desiredLoan: '', otherLoan: 'なし', concerns: '' });
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
    CHECK_ITEMS.forEach((_, i) => { timers.push(setTimeout(() => setCheckIndex(i), (i + 1) * 460)); });
    timers.push(setTimeout(() => setStep('result'), 2600));
    return () => timers.forEach(t => clearTimeout(t));
  }, [step]);

  const primaryTab = results ? (results.score >= 90 ? 'properties' : results.score >= 70 ? 'chat' : 'expert') : 'expert';
  const passRateColor = results ? (results.passRate >= 75 ? '#22c55e' : results.passRate >= 55 ? '#f59e0b' : '#ef4444') : '#22c55e';

  const ctaBtn = (label, tab, iconEl, isPrimary) => (
    <button
      onClick={() => onNavigate(tab)}
      style={{ width: '100%', padding: '14px 20px', borderRadius: 16, border: isPrimary ? 'none' : '1.5px solid #e2e8f0', background: isPrimary ? NAVY : '#f8fafd', color: isPrimary ? '#ffffff' : NAVY, fontSize: 15, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: 'inherit', boxSizing: 'border-box' }}
    >
      <span>{label}</span>
      {iconEl}
    </button>
  );

  return (
    <div style={{ background: '#ffffff', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: 520, margin: '0 auto', padding: '24px 16px 0' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: NAVY, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Calculator size={20} color={GOLD} />
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 500, color: NAVY }}>AI住宅ローン診断</div>
            <div style={{ fontSize: 12, color: '#94a3b8' }}>30秒で借入可能額を診断します</div>
          </div>
        </div>

        {/* FORM */}
        {step === 'form' ? (
          <div style={{ background: '#ffffff', borderRadius: 32, border: '1.5px solid #e2e8f0', padding: '28px 24px', boxShadow: '0 4px 24px rgba(26,58,92,0.06)', marginBottom: 80 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div><label style={labelStyle}>年齢</label><input type="number" placeholder="35" value={form.age} onChange={set('age')} style={baseInput} /></div>
                <div><label style={labelStyle}>年収（万円）</label><input type="number" placeholder="500" value={form.income} onChange={set('income')} style={baseInput} /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div><label style={labelStyle}>頭金（万円）</label><input type="number" placeholder="300" value={form.downPayment} onChange={set('downPayment')} style={baseInput} /></div>
                <div><label style={labelStyle}>勤続年数（年）</label><input type="number" placeholder="5" value={form.years} onChange={set('years')} style={baseInput} /></div>
              </div>
              <div>
                <label style={labelStyle}>雇用形態</label>
                <select value={form.employment} onChange={set('employment')} style={baseInput}>
                  <option value="会社員">会社員</option><option value="自営業">自営業</option>
                  <option value="公務員">公務員</option><option value="パート">パート</option>
                </select>
              </div>
              <div><label style={labelStyle}>希望借入額（万円）</label><input type="number" placeholder="3000" value={form.desiredLoan} onChange={set('desiredLoan')} style={baseInput} /></div>
              <div>
                <label style={labelStyle}>他の借入</label>
                <select value={form.otherLoan} onChange={set('otherLoan')} style={baseInput}>
                  <option value="なし">なし</option><option value="あり">あり</option><option value="わからない">わからない</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>気になること・不安（任意）</label>
                <textarea placeholder="例：変動金利が心配、将来の教育費も考慮したい..." value={form.concerns} onChange={set('concerns')} style={{ ...baseInput, minHeight: 90, resize: 'vertical' }} />
              </div>
              <button onClick={handleSubmit} style={{ width: '100%', padding: '16px', borderRadius: 50, border: 'none', background: 'linear-gradient(to right, #12375d, #f0c94b)', color: '#ffffff', fontSize: 16, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: 'inherit', boxSizing: 'border-box' }}>
                AI診断を開始する<ArrowRight size={18} color="#ffffff" />
              </button>
            </div>
          </div>
        ) : null}

        {/* ANALYZING */}
        {step === 'analyzing' ? (
          <div style={{ background: '#08162b', borderRadius: 32, padding: '48px 28px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32 }}>
            <div style={{ textAlign: 'center' }}>
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} style={{ width: 48, height: 48, borderRadius: '50%', border: '3px solid rgba(201,168,76,0.25)', borderTopColor: GOLD, margin: '0 auto 20px' }} />
              <div style={{ color: '#ffffff', fontSize: 16, fontWeight: 500, marginBottom: 6 }}>AI診断中</div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>しばらくお待ちください</div>
            </div>
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 14 }}>
              {CHECK_ITEMS.map((item, i) => (
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

        {/* RESULT */}
        {step === 'result' ? (
          results ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: 110 }}>

              {/* 1. Score card */}
              <div style={{ background: NAVY, borderRadius: 16, padding: '28px 24px' }}>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginBottom: 6 }}>AI診断スコア</div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, marginBottom: 12 }}>
                  <span style={{ fontSize: 52, fontWeight: 500, color: GOLD, lineHeight: 1 }}>{results.score}</span>
                  <span style={{ fontSize: 18, color: 'rgba(255,255,255,0.5)', paddingBottom: 6 }}>/ 100</span>
                </div>
                <div style={{ display: 'inline-block', background: 'rgba(201,168,76,0.18)', border: '1px solid ' + GOLD, borderRadius: 20, padding: '4px 14px', fontSize: 12, color: GOLD }}>{results.scoreLabel}</div>
              </div>

              {/* 2. Loan amounts */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ background: '#f0f6ff', borderRadius: 16, padding: '18px 14px', border: '1px solid #dbeafe' }}>
                  <div style={{ fontSize: 11, color: '#6b8ab5', marginBottom: 6 }}>推定借入可能額</div>
                  <div style={{ fontSize: 22, fontWeight: 500, color: NAVY, lineHeight: 1.2 }}>{results.maxLoan.toLocaleString()}</div>
                  <div style={{ fontSize: 11, color: '#6b8ab5', marginTop: 2 }}>万円</div>
                </div>
                <div style={{ background: '#fffbeb', borderRadius: 16, padding: '18px 14px', border: '1px solid #fde68a' }}>
                  <div style={{ fontSize: 11, color: '#92693a', marginBottom: 6 }}>月々返済目安</div>
                  <div style={{ fontSize: 22, fontWeight: 500, color: '#92400e', lineHeight: 1.2 }}>{(results.monthlyPayment / 10000).toFixed(1)}</div>
                  <div style={{ fontSize: 11, color: '#92693a', marginTop: 2 }}>万円 / 月</div>
                  <div style={{ fontSize: 10, color: '#b07a42', marginTop: 4 }}>変動0.5% ・ 35年</div>
                </div>
              </div>

              {/* 3. Pass rate */}
              <div style={{ background: '#ffffff', borderRadius: 16, border: '1.5px solid #e2e8f0', padding: '20px' }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: NAVY, marginBottom: 12 }}>住宅ローン審査予測</div>
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span style={{ fontSize: 32, fontWeight: 500, color: passRateColor, lineHeight: 1 }}>
                    {results.passRate}<span style={{ fontSize: 16, marginLeft: 2 }}>%</span>
                  </span>
                  <span style={{ fontSize: 12, color: '#94a3b8' }}>審査通過可能性</span>
                </div>
                <div style={{ height: 8, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden', marginBottom: 10 }}>
                  <motion.div initial={{ width: '0%' }} animate={{ width: results.passRate + '%' }} transition={{ duration: 0.8, ease: 'easeOut' }} style={{ height: '100%', background: passRateColor, borderRadius: 4 }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Info size={12} color="#94a3b8" />
                  <span style={{ fontSize: 11, color: '#94a3b8' }}>実際の審査結果を保証するものではありません</span>
                </div>
              </div>

              {/* 4. Loan type */}
              <div style={{ background: '#f0f6ff', borderRadius: 16, border: '1px solid #dbeafe', padding: '20px' }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: NAVY, marginBottom: 12 }}>AIおすすめローンタイプ</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <span style={{ fontSize: 20, fontWeight: 500, color: NAVY }}>{results.loanType}向き</span>
                  <span style={{ fontSize: 13, color: GOLD, fontWeight: 500 }}>適性{Math.round(results.loanTypeRatio)}%</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {results.loanTypeReasons.map((reason, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <CheckCircle size={14} color="#22c55e" />
                      <span style={{ fontSize: 13, color: '#4a5568' }}>{reason}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 5. Risk analysis */}
              <div style={{ background: '#ffffff', borderRadius: 16, border: '1.5px solid #e2e8f0', padding: '20px' }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: NAVY, marginBottom: 16 }}>あなたの住宅ローンリスク分析</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {results.riskItems.map((item, i) => {
                    const rc = item.level <= 2 ? '#22c55e' : item.level === 3 ? '#f59e0b' : '#ef4444';
                    const rl = item.level <= 2 ? '低' : item.level === 3 ? '中' : '高';
                    return (
                      <div key={i}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                          <span style={{ fontSize: 13, color: NAVY, fontWeight: 500 }}>{item.label}</span>
                          <span style={{ fontSize: 12, color: rc, fontWeight: 500 }}>リスク {rl}</span>
                        </div>
                        <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
                          {[1,2,3,4,5].map(level => (
                            <motion.div key={level} initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: i * 0.12 + level * 0.07, duration: 0.3 }} style={{ flex: 1, height: 6, borderRadius: 3, background: level <= item.level ? rc : '#e2e8f0', transformOrigin: 'left' }} />
                          ))}
                        </div>
                        <span style={{ fontSize: 11, color: '#94a3b8' }}>{item.comment}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 6. AI comment */}
              <div style={{ background: '#f8fafd', borderRadius: 16, padding: '20px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <TrendingUp size={16} color={NAVY} />
                  <span style={{ fontSize: 13, fontWeight: 500, color: NAVY }}>AIコメント</span>
                </div>
                <p style={{ fontSize: 14, color: '#4a5568', lineHeight: 1.75, margin: 0 }}>{results.comment}</p>
              </div>

              {/* 7. Savings proposal */}
              <motion.div animate={{ opacity: [1, 0.85, 1] }} transition={{ duration: 2.2, repeat: Infinity }} style={{ borderRadius: 16, background: 'linear-gradient(135deg, #c9a84c, #f0e68c)', padding: '20px', border: '2px solid rgba(201,168,76,0.4)' }}>
                <div style={{ fontSize: 12, color: '#4a3000', marginBottom: 6, fontWeight: 500 }}>AI節約提案</div>
                <p style={{ fontSize: 15, fontWeight: 500, color: '#1a1a1a', lineHeight: 1.65, margin: '0 0 16px' }}>
                  複数金融機関を比較することで最大<span style={{ fontSize: 20, fontWeight: 500, margin: '0 2px' }}>{results.savingsAmount}</span>万円程度返済総額が下がる可能性があります
                </p>
                <button onClick={() => onNavigate('simulator')} style={{ background: NAVY, color: '#ffffff', border: 'none', borderRadius: 12, padding: '12px 24px', fontSize: 15, fontWeight: 500, cursor: 'pointer', width: '100%', fontFamily: 'inherit', boxSizing: 'border-box' }}>
                  金融機関を比較する
                </button>
              </motion.div>

              {/* 8. Similar cases */}
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: NAVY, marginBottom: 12 }}>似た条件の方の購入事例</div>
                <div style={{ display: 'flex', gap: 12, overflowX: 'auto', scrollSnapType: 'x mandatory', paddingBottom: 8 }}>
                  {results.cases.map((c, i) => (
                    <div key={i} style={{ flexShrink: 0, width: 240, scrollSnapAlign: 'start', background: '#f8fafd', borderRadius: 16, border: '1px solid #e2e8f0', padding: '16px' }}>
                      <div style={{ display: 'inline-block', fontSize: 11, color: '#22c55e', fontWeight: 500, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '2px 8px', marginBottom: 10 }}>{c.outcome}</div>
                      <div style={{ fontSize: 13, color: NAVY, marginBottom: 3 }}>年齢：{c.age}歳 / 年収：{c.income}万円</div>
                      <div style={{ fontSize: 13, color: NAVY, marginBottom: 10 }}>借入：{c.loan}万円</div>
                      <p style={{ fontSize: 12, color: '#64748b', lineHeight: 1.65, margin: 0 }}>{c.comment}</p>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 8 }}>
                  <Info size={12} color="#94a3b8" />
                  <span style={{ fontSize: 11, color: '#94a3b8' }}>参考データとしてご利用ください</span>
                </div>
              </div>

              {/* 9. Consultation cards */}
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: NAVY, marginBottom: 12 }}>住宅ローン相談先</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {CONSULT_CARDS.map((card, i) => (
                    <div key={i} style={{ background: '#ffffff', borderRadius: 16, border: '1.5px solid #e2e8f0', padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span style={{ fontSize: 14, fontWeight: 500, color: NAVY }}>{card.name}</span>
                        <div style={{ display: 'flex', gap: 2 }}>
                          {[1,2,3,4,5].map(s => (
                            <Star key={s} size={12} color={s <= card.rating ? GOLD : '#e2e8f0'} fill={s <= card.rating ? GOLD : 'none'} />
                          ))}
                        </div>
                      </div>
                      <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>得意：{card.specialty}</div>
                      <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
                        <span style={{ fontSize: 12, color: '#94a3b8' }}>{card.area}</span>
                        <span style={{ fontSize: 12, color: '#22c55e', fontWeight: 500 }}>相談料：{card.fee}</span>
                      </div>
                      <button onClick={() => onNavigate('expert')} style={{ background: '#f0f6ff', color: NAVY, border: '1px solid #dbeafe', borderRadius: 10, padding: '10px 16px', fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', width: '100%', boxSizing: 'border-box' }}>
                        相談する
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* 10. CTAs */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {ctaBtn('AIチャットでローン相談', 'chat', <MessageSquare size={18} color={primaryTab === 'chat' ? '#ffffff' : NAVY} />, primaryTab === 'chat')}
                {ctaBtn('住宅ローン専門家に相談', 'expert', <Building2 size={18} color={primaryTab === 'expert' ? '#ffffff' : NAVY} />, primaryTab === 'expert')}
                {ctaBtn('物件情報を見る', 'properties', <Home size={18} color={primaryTab === 'properties' ? '#ffffff' : NAVY} />, primaryTab === 'properties')}
                {ctaBtn('売却査定・資産相談', 'sell', <ChevronRight size={18} color={NAVY} />, false)}
              </div>

              {/* Score < 50: re-diagnose */}
              {results.score < 50 ? (
                <button onClick={() => { setStep('form'); setCheckIndex(-1); setResults(null); }} style={{ background: 'linear-gradient(135deg, #1a3a5c, #2a5a8c)', color: '#ffffff', border: 'none', borderRadius: 16, padding: '16px 24px', fontSize: 15, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', width: '100%', boxSizing: 'border-box' }}>
                  条件を変えて再診断する
                </button>
              ) : null}

              {/* 11. Restart */}
              <button onClick={() => { setStep('form'); setCheckIndex(-1); setResults(null); }} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: 13, cursor: 'pointer', textAlign: 'center', fontFamily: 'inherit', padding: '8px', width: '100%' }}>
                最初からやり直す
              </button>

            </div>
          ) : null
        ) : null}

      </div>

      {/* Fixed CTA - result only */}
      {step === 'result' ? (
        <motion.div initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.4 }} style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: NAVY, zIndex: 1000, padding: '14px 20px', boxShadow: '0 -4px 20px rgba(0,0,0,0.2)' }}>
          <div style={{ maxWidth: 520, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginBottom: 3 }}>今なら無料で住宅ローン専門家をご紹介します</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <motion.div animate={{ opacity: [1, 0.7, 1] }} transition={{ duration: 1.8, repeat: Infinity }} style={{ width: 7, height: 7, borderRadius: '50%', background: GOLD, flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: GOLD, fontWeight: 500 }}>専門家が対応中</span>
              </div>
            </div>
            <button onClick={() => onNavigate('expert')} style={{ background: GOLD, color: NAVY, border: 'none', borderRadius: 12, padding: '12px 20px', fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap', flexShrink: 0 }}>
              無料相談する
            </button>
          </div>
        </motion.div>
      ) : null}

    </div>
  );
}
