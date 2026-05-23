import { useState, useMemo, useEffect } from 'react';

const liveLogs = [
  '新着投資物件を分析中…',
  '融資相談が増加しています',
  '空室リスクを再計算中…',
  '実質利回りを重視するユーザーが増えています',
  '金利上昇耐性を分析しています',
  '投資家がキャッシュフローを比較しています',
  'キャッシュフローを再計算しています',
  '高利回りエリアの分析が増加中',
];

const getYieldColor = (v) => v >= 7 ? '#4ade80' : v >= 5 ? '#fbbf24' : '#ef4444';
const getCFColor = (v) => v >= 5 ? '#4ade80' : v >= 0 ? '#fbbf24' : '#ef4444';
const getDSCRColor = (v) => v >= 1.2 ? '#4ade80' : v >= 1.0 ? '#fbbf24' : '#ef4444';
const getROIColor = (v) => v >= 8 ? '#4ade80' : v >= 4 ? '#fbbf24' : '#ef4444';
const getVacancyColor = (v) => v >= 30 ? '#4ade80' : v >= 15 ? '#fbbf24' : '#ef4444';
const getBorderColor = (color) => {
  if (color === '#4ade80') return 'rgba(74,222,128,0.3)';
  if (color === '#fbbf24') return 'rgba(251,191,36,0.3)';
  return 'rgba(239,68,68,0.3)';
};

export default function InvestmentLoanPage({ onBack, onOpenTool }) {
  const [propertyPrice, setPropertyPrice] = useState('3000');
  const [monthlyRent, setMonthlyRent] = useState('15');
  const [vacancyRate, setVacancyRate] = useState('5');
  const [managementFee, setManagementFee] = useState('1.5');
  const [repairFund, setRepairFund] = useState('1');
  const [propertyTax, setPropertyTax] = useState('10');
  const [otherExpense, setOtherExpense] = useState('0.5');
  const [ownFunds, setOwnFunds] = useState('600');
  const [interestRate, setInterestRate] = useState('2.5');
  const [loanYears, setLoanYears] = useState('30');
  const [liveLog, setLiveLog] = useState('新着投資物件を分析中…');

  const calc = useMemo(() => {
    const price = parseFloat(propertyPrice) || 0;
    const rent = parseFloat(monthlyRent) || 0;
    const vacancy = parseFloat(vacancyRate) || 0;
    const mgmt = parseFloat(managementFee) || 0;
    const repair = parseFloat(repairFund) || 0;
    const tax = parseFloat(propertyTax) || 0;
    const other = parseFloat(otherExpense) || 0;
    const own = parseFloat(ownFunds) || 0;
    const rate = parseFloat(interestRate) || 0;
    const years = parseFloat(loanYears) || 30;

    const loanAmount = price - own;
    const monthlyRate = rate / 100 / 12;
    const payments = years * 12;

    const monthlyPayment = loanAmount > 0 && monthlyRate > 0
      ? loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, payments)) / (Math.pow(1 + monthlyRate, payments) - 1)
      : loanAmount > 0 ? loanAmount / payments : 0;

    const annualRent = rent * 12 * (1 - vacancy / 100);
    const annualExpense = (mgmt + repair + other) * 12 + tax;
    const annualPayment = monthlyPayment * 12;
    const annualNOI = annualRent - annualExpense;
    const annualCF = annualNOI - annualPayment;
    const monthlyCF = annualCF / 12;

    const surfaceYield = price > 0 ? (rent * 12 / price * 100) : 0;
    const realYield = price > 0 ? (annualNOI / price * 100) : 0;
    const roi = own > 0 ? (annualCF / own * 100) : 0;
    const dscr = annualPayment > 0 ? (annualNOI / annualPayment) : 0;

    const breakEvenVacancy = rent * 12 > 0
      ? ((rent * 12 - annualExpense - annualPayment) / (rent * 12) * 100)
      : 0;
    const maxVacancy = 100 - breakEvenVacancy;

    const stressRate = (rate + 1) / 100 / 12;
    const stressPayment = loanAmount > 0 && stressRate > 0
      ? loanAmount * (stressRate * Math.pow(1 + stressRate, payments)) / (Math.pow(1 + stressRate, payments) - 1)
      : monthlyPayment;
    const stressCFDiff = (stressPayment - monthlyPayment) * 12;

    const ltv = price > 0 ? (loanAmount / price * 100) : 0;

    return {
      loanAmount: Math.round(loanAmount),
      monthlyPayment: Math.round(monthlyPayment * 10) / 10,
      annualPayment: Math.round(annualPayment),
      annualRent: Math.round(annualRent * 10) / 10,
      annualExpense: Math.round(annualExpense * 10) / 10,
      annualCF: Math.round(annualCF * 10) / 10,
      monthlyCF: Math.round(monthlyCF * 10) / 10,
      surfaceYield: Math.round(surfaceYield * 10) / 10,
      realYield: Math.round(realYield * 10) / 10,
      roi: Math.round(roi * 10) / 10,
      dscr: Math.round(dscr * 100) / 100,
      maxVacancy: Math.round(maxVacancy * 10) / 10,
      stressCFDiff: Math.round(stressCFDiff * 10) / 10,
      ltv: Math.round(ltv * 10) / 10,
    };
  }, [propertyPrice, monthlyRent, vacancyRate, managementFee, repairFund, propertyTax, otherExpense, ownFunds, interestRate, loanYears]);

  useEffect(() => {
    const interval = setInterval(() => {
      const idx = Math.floor(Math.random() * liveLogs.length);
      setLiveLog(liveLogs[idx]);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const getAIComment = () => {
    const comments = [];
    if (calc.surfaceYield >= 8) {
      comments.push('表面利回りは高水準です。ただし実質利回りとの乖離も確認してください。');
    } else if (calc.surfaceYield >= 5) {
      comments.push('表面利回りは標準的な水準です。');
    } else {
      comments.push('表面利回りが低めです。経費削減や家賃設定の見直しが比較検討の余地があります。');
    }
    if (calc.dscr < 1.0) {
      comments.push('DSCRが1.0を下回っています。返済に対してNOIが不足している状態です。自己資金の追加や金利条件の見直しをご検討ください。');
    } else if (calc.dscr < 1.2) {
      comments.push('DSCRが1.2未満です。金利上昇や空室増加時にキャッシュフローが圧迫される可能性があります。');
    } else {
      comments.push('DSCRは良好な水準です。返済余力があります。');
    }
    if (calc.annualCF < 0) {
      comments.push('現在の条件では年間キャッシュフローがマイナスです。条件の再検討をおすすめします。');
    } else if (calc.annualCF < 50) {
      comments.push('キャッシュフローはプラスですが、余裕は限られています。突発的な修繕に備えた資金確保が重要です。');
    }
    if (calc.ltv > 80) {
      comments.push('LTVが80%を超えています。自己資金を増やすことでリスク耐性が改善する可能性があります。');
    }
    return comments.slice(0, 2).join('\n\n');
  };

  const inputStyle = {
    type: 'number',
    style: {
      fontSize: '16px',
      background: 'rgba(255,255,255,0.05)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '8px',
      padding: '12px',
      color: 'white',
      width: '100%',
      boxSizing: 'border-box',
      outline: 'none',
    },
  };

  const SectionHeader = ({ label }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
      <div style={{ width: '3px', height: '16px', background: '#D4AF37', borderRadius: '2px' }} />
      <span style={{ fontSize: '11px', color: 'rgba(212,175,55,0.7)', letterSpacing: '2px' }}>{label}</span>
      <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, rgba(212,175,55,0.3), transparent)' }} />
    </div>
  );

  const kpiCards = [
    { label: '表面利回り', value: `${calc.surfaceYield}%`, color: getYieldColor(calc.surfaceYield) },
    { label: '実質利回り', value: `${calc.realYield}%`, color: getYieldColor(calc.realYield) },
    { label: '月CF', value: `${calc.monthlyCF >= 0 ? '+' : ''}${calc.monthlyCF}万`, color: getCFColor(calc.monthlyCF) },
    { label: 'DSCR', value: `${calc.dscr}`, color: getDSCRColor(calc.dscr) },
    { label: 'ROI', value: `${calc.roi}%`, color: getROIColor(calc.roi) },
    { label: '損益分岐空室率', value: `${calc.maxVacancy}%`, color: getVacancyColor(calc.maxVacancy) },
  ];

  const detailRows = [
    { label: '月返済額', value: `${calc.monthlyPayment}万円`, color: 'white' },
    { label: '年間返済額', value: `${calc.annualPayment}万円`, color: 'white' },
    { label: '年間家賃収入', value: `${calc.annualRent}万円`, color: 'white' },
    { label: '年間経費合計', value: `${calc.annualExpense}万円`, color: 'white' },
    { label: '年間CF', value: `${calc.annualCF >= 0 ? '+' : ''}${calc.annualCF}万円`, color: getCFColor(calc.annualCF) },
    { label: 'LTV', value: `${calc.ltv}%`, color: 'white' },
    { label: '金利1%上昇時CF影響', value: `-${calc.stressCFDiff}万円/年`, color: 'rgba(239,68,68,0.8)' },
  ];

  const loanCards = [
    '投資用ローン相談',
    'アパートローン',
    '不動産担保ローン',
    '法人融資',
    '借り換え相談',
    'ノンバンク比較',
  ];

  return (
    <div style={{ background: '#0F172A', color: 'white', minHeight: '100vh', fontFamily: 'inherit', overflowY: 'auto' }}>
      <style>{`
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        @keyframes goldBreath {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
        @keyframes liveFade {
          0% { opacity: 0; transform: translateY(4px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '2px', background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.5), transparent)', animation: 'scanline 6s linear infinite', pointerEvents: 'none', zIndex: 999 }} />

      {/* ヒーローセクション */}
      <div style={{ padding: '40px 24px 32px', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'relative' }}>
        {onBack ? (
          <button
            onClick={onBack}
            style={{ position: 'absolute', top: '20px', left: '20px', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: 'rgba(255,255,255,0.6)', fontSize: '14px', padding: '8px 16px', cursor: 'pointer' }}
          >
            戻る
          </button>
        ) : null}
        <div style={{ fontSize: '10px', color: 'rgba(212,175,55,0.5)', letterSpacing: '4px', marginBottom: '10px' }}>AI INVESTMENT ANALYZER</div>
        <div style={{ fontSize: '28px', fontWeight: 700, color: 'white', marginBottom: '8px' }}>投資ローンシミュレータ</div>
        <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', marginBottom: '20px' }}>AIが利回り・返済・キャッシュフローを整理します</div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {['登録不要', '匿名OK', 'AI分析', 'リアルタイム分析'].map(tag => (
            <span key={tag} style={{ fontSize: '11px', padding: '4px 12px', border: '1px solid rgba(212,175,55,0.3)', color: 'rgba(212,175,55,0.7)', borderRadius: '4px', letterSpacing: '1px' }}>{tag}</span>
          ))}
        </div>
      </div>

      {/* メインコンテンツ（2カラム） */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 0, maxWidth: '1100px', margin: '0 auto' }}>
        {/* 左カラム */}
        <div style={{ flex: 1, padding: '28px 24px', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
          {/* 物件情報 */}
          <SectionHeader label="物件情報" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '28px' }}>
            <div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '5px' }}>物件価格（万円）</div>
              <input {...inputStyle} value={propertyPrice} onChange={e => setPropertyPrice(e.target.value)} />
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '5px' }}>想定月額家賃（万円）</div>
              <input {...inputStyle} value={monthlyRent} onChange={e => setMonthlyRent(e.target.value)} />
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '5px' }}>空室率（%）</div>
              <input {...inputStyle} value={vacancyRate} onChange={e => setVacancyRate(e.target.value)} />
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '5px' }}>管理費（万円/月）</div>
              <input {...inputStyle} value={managementFee} onChange={e => setManagementFee(e.target.value)} />
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '5px' }}>修繕積立金（万円/月）</div>
              <input {...inputStyle} value={repairFund} onChange={e => setRepairFund(e.target.value)} />
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '5px' }}>固定資産税（万円/年）</div>
              <input {...inputStyle} value={propertyTax} onChange={e => setPropertyTax(e.target.value)} />
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '5px' }}>その他経費（万円/月）</div>
              <input {...inputStyle} value={otherExpense} onChange={e => setOtherExpense(e.target.value)} />
            </div>
          </div>

          {/* 融資情報 */}
          <SectionHeader label="融資情報" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '5px' }}>自己資金（万円）</div>
              <input {...inputStyle} value={ownFunds} onChange={e => setOwnFunds(e.target.value)} />
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '5px' }}>借入金利（%）</div>
              <input {...inputStyle} value={interestRate} onChange={e => setInterestRate(e.target.value)} />
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '5px' }}>返済年数（年）</div>
              <input {...inputStyle} value={loanYears} onChange={e => setLoanYears(e.target.value)} />
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '5px' }}>借入額（自動計算）</div>
              <input
                type="number"
                readOnly
                value={calc.loanAmount}
                style={{ ...inputStyle.style, opacity: 0.6, cursor: 'default' }}
              />
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.2)', marginTop: '4px' }}>物件価格 - 自己資金で自動計算</div>
            </div>
          </div>
        </div>

        {/* 右カラム */}
        <div style={{ width: '340px', minWidth: '340px', padding: '28px 20px', position: 'sticky', top: 0, maxHeight: '100vh', overflowY: 'auto' }}>
          {/* KPIカード */}
          <SectionHeader label="AI分析結果" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
            {kpiCards.map(card => (
              <div key={card.label} style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${getBorderColor(card.color)}`, borderRadius: '10px', padding: '14px' }}>
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginBottom: '4px' }}>{card.label}</div>
                <div style={{ fontSize: '20px', fontWeight: 700, color: card.color }}>{card.value}</div>
              </div>
            ))}
          </div>

          {/* 詳細数値テーブル */}
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '14px', marginBottom: '20px' }}>
            {detailRows.map((row, i) => (
              <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < detailRows.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>{row.label}</span>
                <span style={{ fontSize: '13px', fontWeight: 600, color: row.color }}>{row.value}</span>
              </div>
            ))}
          </div>

          {/* AIコメント */}
          <div style={{ background: 'rgba(212,175,55,0.05)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: '10px', padding: '16px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#D4AF37', animation: 'goldBreath 2s infinite' }} />
              <span style={{ fontSize: '9px', color: 'rgba(212,175,55,0.6)', letterSpacing: '3px' }}>AI ANALYSIS</span>
            </div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, whiteSpace: 'pre-line', marginTop: '10px' }}>
              {getAIComment()}
            </div>
          </div>

          {/* ライブログ */}
          <div style={{ background: 'rgba(5,5,15,0.8)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '14px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22C55E' }} />
              <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.25)', letterSpacing: '2px' }}>LIVE</span>
            </div>
            <div key={liveLog} style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', marginTop: '8px', animation: 'liveFade 0.5s ease' }}>
              {liveLog}
            </div>
          </div>
        </div>
      </div>

      {/* ローン比較導線 */}
      <div style={{ background: '#0a0a14', padding: '40px 24px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ fontSize: '18px', fontWeight: 700, color: 'white', textAlign: 'center', marginBottom: '8px' }}>投資ローンを比較する</div>
        <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)', textAlign: 'center', marginBottom: '28px' }}>条件に合った融資先を探す</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', maxWidth: '700px', margin: '0 auto' }}>
          {loanCards.map(title => (
            <div key={title} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'white', marginBottom: '6px' }}>{title}</div>
              <span style={{ fontSize: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.3)', padding: '3px 8px', borderRadius: '4px', letterSpacing: '1px' }}>準備中</span>
            </div>
          ))}
        </div>
      </div>

      {/* 次のアクション */}
      <div style={{ padding: '32px 24px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', letterSpacing: '2px', marginBottom: '20px' }}>次のステップへ</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '400px', margin: '0 auto' }}>
          <button style={{ background: 'linear-gradient(135deg, #D4AF37, #c9a84c)', color: '#0F172A', fontSize: '16px', fontWeight: 700, padding: '16px', borderRadius: '12px', border: 'none', cursor: 'pointer' }}>
            AIに投資相談する
          </button>
          <button
            onClick={() => { onOpenTool ? onOpenTool('beginner') : null; }}
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', fontSize: '14px', padding: '14px', borderRadius: '12px', cursor: 'pointer', textAlign: 'center' }}
          >
            投資初心者ドリルへ
          </button>
          <button
            onClick={() => { onOpenTool ? onOpenTool('dictionary') : null; }}
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', fontSize: '14px', padding: '14px', borderRadius: '12px', cursor: 'pointer', textAlign: 'center' }}
          >
            宅建用語集で知識を深める
          </button>
          <button
            onClick={() => { onOpenTool ? onOpenTool('mortgage') : null; }}
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', fontSize: '14px', padding: '14px', borderRadius: '12px', cursor: 'pointer', textAlign: 'center' }}
          >
            住宅ローンシミュレーターへ
          </button>
          <button
            onClick={() => { onOpenTool ? onOpenTool('costs') : null; }}
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', fontSize: '14px', padding: '14px', borderRadius: '12px', cursor: 'pointer', textAlign: 'center' }}
          >
            諸費用を計算する
          </button>
        </div>
      </div>
    </div>
  );
}
