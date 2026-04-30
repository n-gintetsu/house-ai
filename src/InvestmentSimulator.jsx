import { useState, useRef } from 'react'

const C = {
  navy: '#1a3a5c',
  gold: '#c9a84c',
  bg: '#F4F7FB',
  card: '#ffffff',
  title: '#102A43',
  desc: '#5C677D',
  border: '#E2E8F0',
  green: '#27500A',
  greenBg: '#EAF3DE',
  greenBorder: '#97C459',
  amber: '#633806',
  amberBg: '#FAEEDA',
  amberBorder: '#EF9F27',
  red: '#791F1F',
  redBg: '#FCEBEB',
}

function fmt(n, d = 2) {
  if (isNaN(n) || !isFinite(n)) return '-'
  return Number(n).toFixed(d)
}
function fmtM(n) {
  if (isNaN(n) || !isFinite(n)) return '-'
  return Math.round(n).toLocaleString() + '万円'
}

function judge(val, good, warn) {
  if (val >= good) return 'good'
  if (val >= warn) return 'warn'
  return 'bad'
}

function MetricCard({ label, value, tip, status }) {
  const color = status === 'good' ? C.green : status === 'warn' ? '#854F0B' : status === 'bad' ? C.red : C.title
  return (
    <div style={{ background: C.bg, borderRadius: 12, padding: '12px 10px', textAlign: 'center' }}>
      <p style={{ fontSize: 20, fontWeight: 700, color, margin: '0 0 2px' }}>{value}</p>
      <p style={{ fontSize: 12, color: C.title, margin: '0 0 2px', fontWeight: 600 }}>{label}</p>
      <p style={{ fontSize: 10, color: C.desc, margin: 0, lineHeight: 1.4 }}>{tip}</p>
    </div>
  )
}

function InputField({ label, id, value, onChange, step = '1', unit = '' }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 11, color: C.desc, marginBottom: 4 }}>{label}</label>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <input
          type="number"
          value={value}
          step={step}
          onChange={e => onChange(id, e.target.value)}
          style={{ width: '100%', border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 10px', fontSize: 13, color: C.title, background: C.card, outline: 'none', boxSizing: 'border-box', MozAppearance: 'textfield' }}
        />
        {unit && <span style={{ fontSize: 11, color: C.desc, flexShrink: 0 }}>{unit}</span>}
      </div>
    </div>
  )
}

export default function InvestmentSimulator({ onNavigate }) {
  const [vals, setVals] = useState({
    price: 3000, rent: 240, cost: 150, exp: 36,
    loan: 2400, rate: 1.8, years: 25, vacancy: 5,
    sell: 2800, hold: 10, dep: 60, tax: 20,
  })
  const [loading, setLoading] = useState(false)
  const [aiAdvice, setAiAdvice] = useState(null)
  const resultRef = useRef(null)

  const set = (id, v) => setVals(prev => ({ ...prev, [id]: parseFloat(v) || 0 }))

  const calc = () => {
    const { price: P, rent: R, cost: C2, exp: E, loan: L, rate: ri, years: Y, vacancy: VV, sell: SP, hold: H, dep: D, tax: T } = vals
    const i = ri / 100 / 12
    const n = Y * 12
    const equity = P + C2 - L
    const effR = R * (1 - VV / 100)
    const noi = effR - E
    const grossYield = P > 0 ? R / P * 100 : 0
    const netYield = P > 0 ? noi / P * 100 : 0
    const capRate = P > 0 ? noi / P * 100 : 0
    const monthly = n > 0 && i > 0 ? L * i * Math.pow(1 + i, n) / (Math.pow(1 + i, n) - 1) : 0
    const annualDebt = monthly * 12
    const annualCF = noi - annualDebt
    const dscr = annualDebt > 0 ? noi / annualDebt : 0
    const cocr = equity > 0 ? annualCF / equity * 100 : 0
    const payback = noi > 0 ? (P + C2) / noi : 999
    const turn = H > 0 && (P + C2) > 0 ? effR * H / (P + C2) * 100 : 0
    const taxEffect = D * (T / 100)

    // IRR計算（ニュートン法）
    const bookVal = Math.max(0, P - D * H)
    const gainTax = Math.max(0, SP - bookVal) * (T / 100)
    const netSell = SP - gainTax
    const cfs = [-(equity)]
    for (let y = 1; y <= H; y++) cfs.push(annualCF)
    cfs[H] += netSell
    const npv = (r) => cfs.reduce((s, cf, t) => s + cf / Math.pow(1 + r, t), 0)
    let lo = -0.5, hi = 5
    for (let k = 0; k < 80; k++) {
      const mid = (lo + hi) / 2
      npv(mid) > 0 ? lo = mid : hi = mid
    }
    const irr = (lo + hi) / 2 * 100

    return { grossYield, netYield, capRate, cocr, dscr, irr, payback, turn, equity, noi, annualCF, taxEffect, annualDebt }
  }

  const metrics = calc()

  const handleAI = async () => {
    setLoading(true)
    setAiAdvice(null)
    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
    const m = metrics
    const prompt = `不動産投資物件の指標分析をしてください。以下の指標に基づいて、投資判断・改善点・リスクを具体的に教えてください。
表面利回り: ${fmt(m.grossYield)}%
ネット利回り: ${fmt(m.netYield)}%
キャップレート: ${fmt(m.capRate)}%
CCR（自己資本利回り）: ${fmt(m.cocr)}%
DSCR: ${fmt(m.dscr)}倍
IRR: ${fmt(m.irr)}%
投資回収期間: ${fmt(m.payback, 1)}年
資金回転率: ${fmt(m.turn, 1)}%
NOI: ${fmtM(m.noi)}/年
年間CF: ${fmtM(m.annualCF)}/年
物件価格: ${vals.price}万円、自己資金: ${fmtM(m.equity)}
プロの投資家視点で3点以内に絞って簡潔にアドバイスしてください。`

    try {
      const res = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          system: 'あなたは不動産投資のプロフェッショナルです。指標を見て投資判断・改善点・リスクを簡潔に3点で答えてください。日本語で。',
          messages: [{ role: 'user', content: [{ type: 'text', text: prompt }] }],
          max_tokens: 600,
        })
      })
      const data = await res.json()
      setAiAdvice(data.text || 'アドバイスを取得できませんでした。')
    } catch {
      setAiAdvice('AIアドバイスの取得に失敗しました。もう一度お試しください。')
    } finally {
      setLoading(false)
    }
  }

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

  return (
    <div style={{ background: C.bg, minHeight: '100vh', fontFamily: "'Noto Sans JP', sans-serif", paddingBottom: 60 }}>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;600;700&display=swap" rel="stylesheet" />
      <style>{`input[type=number]::-webkit-inner-spin-button,input[type=number]::-webkit-outer-spin-button{-webkit-appearance:none;margin:0}input[type=number]{-moz-appearance:textfield}`}</style>

      {/* ヘッダー */}
      <div style={{ background: C.navy, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <p style={{ color: '#fff', fontSize: 15, fontWeight: 700, margin: '0 0 2px' }}>不動産投資指標シミュレーター</p>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, margin: 0 }}>Proが使う全指標を3秒で算出</p>
        </div>
        <button onClick={() => onNavigate && onNavigate('drill')}
          style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 12px', fontSize: 12, cursor: 'pointer' }}>
          ← ドリルへ
        </button>
      </div>

      <div style={{ padding: '16px', maxWidth: 720, margin: '0 auto' }}>
        {/* 入力フォーム */}
        <div style={{ background: C.card, borderRadius: 16, padding: '16px', marginBottom: 16, border: `1px solid ${C.border}` }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: C.navy, margin: '0 0 14px' }}>📋 物件情報を入力</p>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: 10, marginBottom: 12 }}>
            <InputField label="物件価格（万円）" id="price" value={vals.price} onChange={set} />
            <InputField label="年間家賃収入（万円）" id="rent" value={vals.rent} onChange={set} />
            <InputField label="諸費用・初期費用（万円）" id="cost" value={vals.cost} onChange={set} />
            <InputField label="年間経費（万円）" id="exp" value={vals.exp} onChange={set} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: 10, marginBottom: 12 }}>
            <InputField label="ローン金額（万円）" id="loan" value={vals.loan} onChange={set} />
            <InputField label="金利（%/年）" id="rate" value={vals.rate} onChange={set} step="0.1" />
            <InputField label="返済期間（年）" id="years" value={vals.years} onChange={set} />
            <InputField label="空室率（%）" id="vacancy" value={vals.vacancy} onChange={set} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: 10 }}>
            <InputField label="想定売却価格（万円）" id="sell" value={vals.sell} onChange={set} />
            <InputField label="保有期間（年）" id="hold" value={vals.hold} onChange={set} />
            <InputField label="減価償却（万円/年）" id="dep" value={vals.dep} onChange={set} />
            <InputField label="実効税率（%）" id="tax" value={vals.tax} onChange={set} />
          </div>
        </div>

        {/* 指標グリッド */}
        <div ref={resultRef} style={{ background: C.card, borderRadius: 16, padding: '16px', marginBottom: 16, border: `1px solid ${C.border}` }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: C.navy, margin: '0 0 14px' }}>📊 算出指標（リアルタイム）</p>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: 8 }}>
            <MetricCard label="表面利回り" value={fmt(metrics.grossYield) + '%'} tip="年間家賃÷物件価格" status={judge(metrics.grossYield, 8, 5)} />
            <MetricCard label="ネット利回り" value={fmt(metrics.netYield) + '%'} tip="NOI÷物件価格" status={judge(metrics.netYield, 6, 4)} />
            <MetricCard label="キャップレート" value={fmt(metrics.capRate) + '%'} tip="収益還元法の基準" status={judge(metrics.capRate, 5, 3)} />
            <MetricCard label="CCR（自己資本利回り）" value={fmt(metrics.cocr) + '%'} tip="手残り÷自己資金" status={judge(metrics.cocr, 10, 5)} />
            <MetricCard label="DSCR（返済余裕度）" value={fmt(metrics.dscr) + '倍'} tip="1.2倍以上が安全圏" status={judge(metrics.dscr, 1.3, 1.0)} />
            <MetricCard label="IRR（内部収益率）" value={fmt(metrics.irr) + '%'} tip="投資全体の年利回り" status={judge(metrics.irr, 8, 4)} />
            <MetricCard label="投資回収期間" value={metrics.payback > 100 ? '計算不可' : fmt(metrics.payback, 1) + '年'} tip="物件価格÷NOI" status={metrics.payback <= 15 ? 'good' : metrics.payback <= 20 ? 'warn' : 'bad'} />
            <MetricCard label="資金回転率" value={fmt(metrics.turn, 1) + '%'} tip={`${vals.hold}年間の累計回収率`} status={judge(metrics.turn, 80, 50)} />
            <MetricCard label="NOI（純営業収益）" value={fmtM(metrics.noi) + '/年'} tip="実効収入－経費" status={metrics.noi > 0 ? 'good' : 'bad'} />
            <MetricCard label="年間CF（手残り）" value={fmtM(metrics.annualCF) + '/年'} tip="NOI－年間返済額" status={metrics.annualCF > 0 ? 'good' : 'bad'} />
            <MetricCard label="自己資金" value={fmtM(metrics.equity)} tip="価格+諸費用－ローン" status="" />
            <MetricCard label="減価償却節税効果" value={fmtM(metrics.taxEffect) + '/年'} tip="減価償却×実効税率" status="" />
          </div>

          {/* 凡例 */}
          <div style={{ display: 'flex', gap: 12, marginTop: 12, flexWrap: 'wrap' }}>
            {[['good', C.greenBg, C.green, '優良'], ['warn', C.amberBg, '#854F0B', '要注意'], ['bad', C.redBg, C.red, '要改善']].map(([k, bg, color, label]) => (
              <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: color }} />
                <span style={{ fontSize: 11, color: C.desc }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* AIアドバイスボタン */}
        <button onClick={handleAI} disabled={loading}
          style={{ width: '100%', background: C.navy, color: '#fff', border: 'none', borderRadius: 20, padding: '14px', fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', marginBottom: 16, opacity: loading ? 0.7 : 1 }}>
          {loading ? '🤖 AI分析中...' : '🤖 AIの判断・アドバイスを見る'}
        </button>

        {/* AIアドバイス結果 */}
        {aiAdvice && (
          <div style={{ background: C.card, borderRadius: 16, padding: '16px', border: `1px solid ${C.border}`, marginBottom: 16 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: C.navy, margin: '0 0 10px' }}>🤖 AIアドバイス</p>
            <p style={{ fontSize: 13, color: C.title, lineHeight: 1.9, margin: '0 0 14px', whiteSpace: 'pre-wrap' }}>{aiAdvice}</p>
            <button onClick={() => onNavigate && onNavigate('properties')}
              style={{ width: '100%', background: C.gold, color: C.navy, border: 'none', borderRadius: 20, padding: '12px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
              👉 実際の投資物件を見る
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
