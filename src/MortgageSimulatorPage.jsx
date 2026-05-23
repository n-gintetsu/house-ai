import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TrendingUp, Users, ChevronRight, ArrowRight } from 'lucide-react';
import SEOHead from './SEOHead';
import { supabase } from './lib/supabase';

const LAST_UPDATED = '2026年5月22日';

const RATE_DATA = [
  { bank: '三菱UFJ銀行', variable: 0.345, fixed10: 1.22, fixed35: 2.11, url: 'https://www.bk.mufg.jp', tag: '安定型' },
  { bank: '三井住友銀行', variable: 0.375, fixed10: 1.35, fixed35: 2.15, url: 'https://www.smbc.co.jp', tag: '安定型' },
  { bank: 'みずほ銀行', variable: 0.375, fixed10: 1.40, fixed35: 2.20, url: 'https://www.mizuhobank.co.jp', tag: '安定型' },
  { bank: 'PayPay銀行', variable: 0.289, fixed10: 1.18, fixed35: null, url: 'https://www.paypay-bank.co.jp', tag: 'AIおすすめ' },
  { bank: 'auじぶん銀行', variable: 0.319, fixed10: 1.05, fixed35: null, url: 'https://www.jibunbank.co.jp', tag: 'AIおすすめ' },
  { bank: 'SBI新生銀行', variable: 0.420, fixed10: 1.15, fixed35: 1.95, url: 'https://www.sbishinseibank.co.jp', tag: '人気' },
  { bank: '楽天銀行', variable: 0.298, fixed10: 1.10, fixed35: null, url: 'https://www.rakuten-bank.co.jp', tag: '人気' },
  { bank: 'ARUHI', variable: null, fixed10: null, fixed35: 1.82, url: 'https://aruhi-corp.co.jp', tag: '固定向き' },
  { bank: '住信SBIネット銀行', variable: 0.298, fixed10: 1.12, fixed35: 1.98, url: 'https://www.netbk.co.jp', tag: 'AIおすすめ' },
];

const AI_LOG_MESSAGES = [
  '住宅ローン相談が増えています…',
  '変動金利の動向を確認しています…',
  '金利比較データを整理しています…',
  '類似条件の返済プランを分析中…',
  '住宅購入の相談が入っています…',
  'フラット35の最新情報を確認中…',
];

const TAG_STYLE = {
  AIおすすめ: { background: '#EFF6FF', color: '#1d4ed8' },
  人気: { background: '#FFF7ED', color: '#c2410c' },
  安定型: { background: '#F0FDF4', color: '#15803d' },
  固定向き: { background: '#FAF5FF', color: '#7e22ce' },
};

function useCountUp(target, duration = 1000) {
  const [current, setCurrent] = useState(0);
  useEffect(() => {
    if (!target) { setCurrent(0); return; }
    const start = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.round(target * eased));
      if (progress >= 1) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return current;
}

export default function MortgageSimulatorPage({ onBack, onOpenConcierge }) {
  const safeOnOpenConcierge = onOpenConcierge || (() => {});

  const [loanAmount, setLoanAmount] = useState(3000);
  const [downPayment, setDownPayment] = useState(500);
  const [rate, setRate] = useState(0.345);
  const [rateType, setRateType] = useState('variable');
  const [years, setYears] = useState(35);
  const [bonusPayment, setBonusPayment] = useState(0);
  const [annualIncome, setAnnualIncome] = useState(600);
  const [logIndex, setLogIndex] = useState(0);
  const [logVisible, setLogVisible] = useState(true);
  const [hoveredBank, setHoveredBank] = useState(null);
  const [prevSaved, setPrevSaved] = useState(false);
  const [rateData, setRateData] = useState(RATE_DATA);
  const [rateLastUpdated, setRateLastUpdated] = useState(LAST_UPDATED);
  const [rateLoading, setRateLoading] = useState(true);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('house_ai_mortgage_last');
      if (saved) {
        const data = JSON.parse(saved);
        if (data.loanAmount) setLoanAmount(data.loanAmount);
        if (data.downPayment) setDownPayment(data.downPayment);
        if (data.years) setYears(data.years);
        if (data.rateType) setRateType(data.rateType);
        if (data.annualIncome) setAnnualIncome(data.annualIncome);
        setPrevSaved(true);
      }
    } catch (e) {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('house_ai_mortgage_last', JSON.stringify({ loanAmount, downPayment, years, rateType, annualIncome }));
    } catch (e) {}
  }, [loanAmount, downPayment, years, rateType, annualIncome]);

  useEffect(() => {
    const timer = setInterval(() => {
      setLogVisible(false);
      setTimeout(() => {
        setLogIndex((i) => (i + 1) % AI_LOG_MESSAGES.length);
        setLogVisible(true);
      }, 400);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    supabase
      .from('mortgage_rates')
      .select('*')
      .eq('is_active', true)
      .order('bank_name')
      .then(({ data, error }) => {
        if (!error && data && data.length > 0) {
          setRateData(data.map(r => ({
            bank: r.bank_name,
            variable: r.variable_rate,
            fixed10: r.fixed10_rate,
            fixed35: r.fixed35_rate,
            tag: r.tag,
            url: r.bank_url,
          })));
          const latest = data.reduce((a, b) => new Date(a.last_updated) > new Date(b.last_updated) ? a : b);
          const d = new Date(latest.last_updated);
          setRateLastUpdated(`${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日`);
        }
        setRateLoading(false);
      });
  }, []);

  const result = useMemo(() => {
    const principal = (loanAmount - downPayment) * 10000;
    if (principal <= 0) return null;
    const monthlyRate = rate / 100 / 12;
    const n = years * 12;
    const adjustedPrincipal = principal - (bonusPayment * 10000 * years) / 2;
    const mainPrincipal = Math.max(adjustedPrincipal, principal * 0.7);
    let monthly;
    if (monthlyRate === 0) {
      monthly = mainPrincipal / n;
    } else {
      monthly = (mainPrincipal * monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1);
    }
    const total = monthly * n + bonusPayment * 10000 * years;
    const interest = total - principal;
    const ratio = ((monthly * 12) / (annualIncome * 10000)) * 100;
    return {
      monthly: Math.round(monthly),
      total: Math.round(total),
      interest: Math.round(interest),
      ratio: Math.round(ratio * 10) / 10,
    };
  }, [loanAmount, downPayment, rate, years, bonusPayment, annualIncome]);

  const animatedMonthly = useCountUp(result ? result.monthly : 0);
  const animatedTotal = useCountUp(result ? Math.round(result.total / 10000) : 0);
  const animatedInterest = useCountUp(result ? Math.round(result.interest / 10000) : 0);

  const lowestVariable = rateData.filter((b) => b.variable).sort((a, b) => a.variable - b.variable)[0];

  const fmt = (n) => Math.round(n).toLocaleString('ja-JP');

  const FIELDS = [
    { label: '物件価格（万円）', value: loanAmount, setter: setLoanAmount, min: 500, max: 20000, step: 100 },
    { label: '頭金（万円）', value: downPayment, setter: setDownPayment, min: 0, max: 5000, step: 50 },
    { label: '返済年数（年）', value: years, setter: setYears, min: 5, max: 35, step: 1 },
    { label: '年収（万円）', value: annualIncome, setter: setAnnualIncome, min: 200, max: 3000, step: 50 },
    { label: 'ボーナス払い（万円/年）', value: bonusPayment, setter: setBonusPayment, min: 0, max: 200, step: 10 },
  ];

  const AI_POINTS = [
    '現在は変動金利が優勢です。主要ネット銀行では0.3%台前半が中心となっています。',
    '日銀の政策金利動向により、今後1〜2年で変動金利が上昇する可能性があります。長期返済の場合は固定金利との比較検討をおすすめします。',
    `年収${annualIncome}万円・${years}年返済の場合、変動より固定を選ぶと月々の返済額は増えますが、将来の金利上昇リスクを回避できます。`,
  ];

  const ratioComment = result
    ? result.ratio <= 20
      ? `返済比率は約${result.ratio}%で、余裕のある返済設計です。繰上返済も視野に入れると利息を抑えられます。`
      : result.ratio <= 25
      ? `返済比率は約${result.ratio}%です。一般的な目安（25%以下）の範囲内ですが、生活費の変動に備えた貯蓄も大切です。`
      : `返済比率が約${result.ratio}%と高めです。頭金を増やす・返済期間を延ばすなど、月々の負担を下げる検討をおすすめします。`
    : '';

  const cta = result
    ? result.ratio > 25
      ? { title: '返済負担が少し高めです', text: '年収に対して返済比率が高めです。AIコンシェルジュが頭金・借入額・年数の最適バランスを一緒に整理します。' }
      : result.ratio <= 20
      ? { title: '余裕のある返済設計です', text: '返済比率に余裕があります。繰上返済・資産運用との組み合わせをAIが提案できます。' }
      : { title: 'より詳しく相談しますか？', text: 'AIコンシェルジュが年収・家族構成・希望エリアをもとに、あなた向けのローンプランを整理します。' }
    : { title: 'より詳しく相談しますか？', text: 'AIコンシェルジュが年収・家族構成・希望エリアをもとに、あなた向けのローンプランを整理します。' };

  const RESULT_CARDS = [
    { label: '月々返済額', value: `${fmt(animatedMonthly)}円` },
    { label: '総返済額', value: `${fmt(animatedTotal)}万円` },
    { label: '利息総額', value: `${fmt(animatedInterest)}万円` },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#F7F9FC', paddingBottom: '80px' }}>
      <style>{`
        @media (max-width: 600px) {
          .sim-grid { grid-template-columns: 1fr !important; }
          .result-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <SEOHead
        title="住宅ローンシミュレーター・金利比較 | House-AI"
        description="主要9行の住宅ローン金利を比較。変動・固定の月々返済額・総返済額をAIが分析。借入額・年収を入力するだけで最適なローンプランを提案します。"
        url="https://house-ai.co.jp/tools/mortgage"
      />

      <button
        type="button"
        onClick={onBack}
        style={{ position: 'fixed', top: '24px', left: '24px', zIndex: 100, display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 20px', borderRadius: '999px', border: '1px solid #E5E7EB', background: 'white', color: '#374151', fontSize: '14px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', fontFamily: 'inherit' }}
      >
        <ChevronRight size={16} style={{ transform: 'rotate(180deg)' }} />
        戻る
      </button>

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '80px 24px 0' }}>

        {/* ヘッダー */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <img src="/logo.png" alt="House-AI" style={{ width: '44px', height: '44px', objectFit: 'contain', display: 'block', margin: '0 auto 16px' }} />
          <h1 style={{ fontSize: '32px', fontWeight: 700, color: '#1a3a5c', margin: '0 0 8px' }}>住宅ローンシミュレーター</h1>
          <p style={{ fontSize: '15px', color: '#6B7280', margin: '0 0 8px' }}>金利比較・返済試算・AIアドバイス</p>
          <p style={{ fontSize: '11px', color: '#9CA3AF', margin: 0 }}>金利・審査条件は変更される場合があります。最新情報は各金融機関の公式サイトをご確認ください。</p>
        </div>

        {/* AIライブログ */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px', padding: '12px 20px', background: 'rgba(26,58,92,0.04)', borderRadius: '12px', border: '1px solid rgba(26,58,92,0.08)' }}>
          <motion.div
            animate={{ opacity: [1, 0.3, 1], scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', flexShrink: 0 }}
          />
          <span style={{ fontSize: '12px', color: '#6B7280', letterSpacing: '0.03em' }}>AI分析中</span>
          <AnimatePresence mode="wait">
            <motion.span
              key={logIndex}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: logVisible ? 1 : 0, x: 0 }}
              exit={{ opacity: 0 }}
              style={{ fontSize: '12px', color: '#1a3a5c', flex: 1 }}
            >
              {AI_LOG_MESSAGES[logIndex]}
            </motion.span>
          </AnimatePresence>
        </div>

        {/* 金利比較表 */}
        <div style={{ background: 'white', borderRadius: '24px', padding: '32px', border: '1px solid #E5E7EB', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '8px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1a3a5c', margin: 0 }}>最新住宅ローン金利比較</h2>
            <span style={{ fontSize: '11px', color: '#9CA3AF' }}>最終更新日：{rateLastUpdated}　参考値</span>
          </div>
          {rateLoading ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#9CA3AF', fontSize: '14px' }}>金利データを読み込み中...</div>
          ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ background: '#F7F9FC' }}>
                  {['金融機関', '変動金利', '10年固定', '35年固定'].map((h, i) => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: i === 0 ? 'left' : 'center', color: '#6B7280', fontWeight: 600, borderBottom: '1px solid #E5E7EB' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rateData.map((bank, i) => (
                  <tr
                    key={bank.bank}
                    onMouseEnter={() => setHoveredBank(i)}
                    onMouseLeave={() => setHoveredBank(null)}
                    style={{ background: hoveredBank === i ? '#EFF6FF' : i % 2 === 0 ? 'white' : '#FAFAFA', transition: 'background 0.15s', cursor: 'pointer' }}
                  >
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: '#1a3a5c', borderBottom: '1px solid #F3F4F6' }}>
                      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '4px' }}>
                        <a href={bank.url} target="_blank" rel="noopener noreferrer" style={{ color: '#1a3a5c', textDecoration: 'none' }}>{bank.bank}</a>
                        <span style={{ padding: '2px 8px', borderRadius: '999px', fontSize: '11px', fontWeight: 600, marginLeft: '4px', ...(TAG_STYLE[bank.tag] || {}) }}>{bank.tag}</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center', borderBottom: '1px solid #F3F4F6' }}>
                      {bank.variable ? (
                        <span style={{ color: bank.variable === lowestVariable.variable ? '#16a34a' : '#111827', fontWeight: bank.variable === lowestVariable.variable ? 700 : 400 }}>
                          {bank.variable.toFixed(3)}%{bank.variable === lowestVariable.variable ? '　最低' : ''}
                        </span>
                      ) : <span style={{ color: '#D1D5DB' }}>—</span>}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center', color: '#111827', borderBottom: '1px solid #F3F4F6' }}>
                      {bank.fixed10 ? `${bank.fixed10.toFixed(2)}%` : <span style={{ color: '#D1D5DB' }}>—</span>}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center', color: '#111827', borderBottom: '1px solid #F3F4F6' }}>
                      {bank.fixed35 ? `${bank.fixed35.toFixed(2)}%` : <span style={{ color: '#D1D5DB' }}>—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}
        </div>

        {/* AI金利分析 */}
        <div style={{ background: 'linear-gradient(135deg, #0F172A, #1a3a5c)', borderRadius: '24px', padding: '32px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <TrendingUp size={20} color="#c9a84c" />
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#c9a84c', margin: 0 }}>AI金利分析</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {AI_POINTS.map((text, i) => (
              <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#c9a84c', flexShrink: 0, marginTop: '6px' }} />
                <p style={{ fontSize: '13px', color: 'rgba(240,235,220,0.8)', lineHeight: 1.7, margin: 0 }}>{text}</p>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '20px', padding: '16px', background: 'rgba(201,168,76,0.08)', borderRadius: '12px', border: '1px solid rgba(201,168,76,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Users size={14} color="#c9a84c" />
              <span style={{ fontSize: '12px', color: '#c9a84c', fontWeight: 600 }}>同条件ユーザーの傾向</span>
            </div>
            <p style={{ fontSize: '13px', color: 'rgba(240,235,220,0.7)', margin: 0, lineHeight: 1.6 }}>
              借入額{fmt(loanAmount - downPayment)}万円・{years}年返済の条件では、約68%のユーザーが変動金利を選択しています。（参考値）
            </p>
          </div>
        </div>

        {/* シミュレーター */}
        <div style={{ background: 'white', borderRadius: '24px', padding: '32px', border: '1px solid #E5E7EB', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1a3a5c', margin: '0 0 24px' }}>返済シミュレーター</h2>

          {prevSaved ? (
            <div style={{ padding: '10px 16px', background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '10px', marginBottom: '16px', fontSize: '13px', color: '#92400e' }}>
              前回の試算条件を読み込みました（物件価格{loanAmount}万円・{years}年・{rateType === 'variable' ? '変動' : '固定'}）
            </div>
          ) : null}

          <div className="sim-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
            {FIELDS.map(({ label, value, setter, min, max, step }) => (
              <div key={label}>
                <label style={{ fontSize: '13px', color: '#6B7280', display: 'block', marginBottom: '6px' }}>{label}</label>
                <input
                  type="number"
                  value={value}
                  onChange={(e) => setter(Number(e.target.value))}
                  min={min}
                  max={max}
                  step={step}
                  style={{ width: '100%', fontSize: '16px', padding: '12px 16px', borderRadius: '12px', border: '1px solid #E5E7EB', background: '#F7F9FC', color: '#111827', boxSizing: 'border-box', fontFamily: 'inherit' }}
                />
              </div>
            ))}
            <div>
              <label style={{ fontSize: '13px', color: '#6B7280', display: 'block', marginBottom: '6px' }}>金利タイプ</label>
              <select
                value={rateType}
                onChange={(e) => {
                  const t = e.target.value;
                  setRateType(t);
                  if (t === 'variable') { setRate(lowestVariable.variable); }
                  else if (t === 'fixed10') { setRate(1.10); }
                  else { setRate(1.95); }
                }}
                style={{ width: '100%', fontSize: '16px', padding: '12px 16px', borderRadius: '12px', border: '1px solid #E5E7EB', background: '#F7F9FC', color: '#111827', boxSizing: 'border-box', fontFamily: 'inherit' }}
              >
                <option value="variable">変動金利（{lowestVariable.variable}%〜）</option>
                <option value="fixed10">10年固定（1.05%〜）</option>
                <option value="fixed35">35年固定（1.82%〜）</option>
              </select>
            </div>
          </div>

          {result ? (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: '28px', padding: '24px', background: '#F7F9FC', borderRadius: '16px', border: '1px solid #E5E7EB' }}>
              <div className="result-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' }}>
                {RESULT_CARDS.map(({ label, value }) => (
                  <div key={label} style={{ textAlign: 'center', padding: '16px', background: 'white', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
                    <div style={{ fontSize: '11px', color: '#9CA3AF', marginBottom: '4px' }}>{label}</div>
                    <div style={{ fontSize: '20px', fontWeight: 700, color: '#1a3a5c' }}>{value}</div>
                    <div style={{ fontSize: '10px', color: '#D1D5DB' }}>概算</div>
                  </div>
                ))}
              </div>
              <div style={{ padding: '16px', background: 'rgba(26,58,92,0.04)', borderRadius: '12px', border: '1px solid rgba(26,58,92,0.08)' }}>
                <div style={{ fontSize: '12px', color: '#c9a84c', fontWeight: 600, marginBottom: '6px' }}>AIアドバイス</div>
                <p style={{ fontSize: '13px', color: '#374151', lineHeight: 1.7, margin: 0 }}>{ratioComment}</p>
              </div>
            </motion.div>
          ) : (
            <div style={{ marginTop: '20px', padding: '20px', textAlign: 'center', color: '#9CA3AF', fontSize: '14px' }}>
              頭金が物件価格を超えています。数値を確認してください。
            </div>
          )}
        </div>

        {/* AI相談導線 */}
        <div style={{ background: 'linear-gradient(135deg, #1a3a5c, #2563eb)', borderRadius: '24px', padding: '32px', textAlign: 'center' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'white', margin: '0 0 8px' }}>{cta.title}</h3>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', margin: '0 0 20px', lineHeight: 1.7 }}>{cta.text}</p>
          <motion.button
            type="button"
            onClick={safeOnOpenConcierge}
            whileHover={{ scale: 1.03, boxShadow: '0 8px 30px rgba(201,168,76,0.6)' }}
            whileTap={{ scale: 0.98 }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '14px 32px', borderRadius: '999px', border: 'none', background: 'linear-gradient(135deg, #c8a030, #D4AF37, #c8a030)', boxShadow: '0 4px 20px rgba(201,168,76,0.4)', color: '#0F172A', fontSize: '15px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
          >
            AIに相談する <ArrowRight size={16} />
          </motion.button>
          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '12px', marginBottom: 0 }}>登録不要・無料でご利用いただけます</p>
        </div>

        {/* 免責事項 */}
        <p style={{ fontSize: '11px', color: '#9CA3AF', textAlign: 'center', marginTop: '24px', lineHeight: 1.7 }}>
          本シミュレーターの結果は概算であり、将来にわたり保証するものではありません。実際の返済額は金融機関の審査・条件により異なります。借入の際は必ず金融機関にご確認ください。
        </p>
      </div>
    </div>
  );
}
