const fs = require('fs')
const path = require('path')

const filePath = path.join(__dirname, 'src', 'PropertyMatching.jsx')
let content = fs.readFileSync(filePath, 'utf8')

// PropertyModal関数の最初のreturn文の前にローンシミュレーターのstateを追加
// 「const searchUrl」の行を探して前に追加
const oldSearchUrl = `function PropertyModal({ property: p, isFavorite, onToggleFavorite, onClose }) {
  const searchUrl = p.address ? \`https://www.google.com/maps/search/?api=1&query=\${encodeURIComponent(p.address)}\` : ''`

const newSearchUrl = `function PropertyModal({ property: p, isFavorite, onToggleFavorite, onClose }) {
  const searchUrl = p.address ? \`https://www.google.com/maps/search/?api=1&query=\${encodeURIComponent(p.address)}\` : ''

  // ローンシミュレーター
  const defaultPrice = p.price ? Math.round(p.price / 10000) : ''
  const [loanPrice, setLoanPrice] = useState(defaultPrice)
  const [downPayment, setDownPayment] = useState('')
  const [rate, setRate] = useState('1.5')
  const [years, setYears] = useState('35')
  const [showLoan, setShowLoan] = useState(false)

  function calcLoan() {
    const price = parseFloat(loanPrice) || 0
    const down = parseFloat(downPayment) || 0
    const principal = (price - down) * 10000
    const monthlyRate = parseFloat(rate) / 100 / 12
    const n = parseInt(years) * 12
    if (principal <= 0 || monthlyRate <= 0 || n <= 0) return 0
    const monthly = principal * monthlyRate * Math.pow(1 + monthlyRate, n) / (Math.pow(1 + monthlyRate, n) - 1)
    return Math.round(monthly)
  }

  const monthlyPayment = calcLoan()
  const totalPayment = monthlyPayment * parseInt(years || 0) * 12
  const totalInterest = totalPayment - ((parseFloat(loanPrice || 0) - parseFloat(downPayment || 0)) * 10000)`

if (content.includes(oldSearchUrl)) {
  content = content.replace(oldSearchUrl, newSearchUrl)
  console.log('✅ ローンシミュレーターのstate追加完了')
} else {
  console.log('ERROR: PropertyModal関数の開始部分が見つかりませんでした')
  process.exit(1)
}

// 「この物件について相談する」ボタンの前にローンシミュレーターUIを追加
const oldConsultBtn = `          {/* 問い合わせボタン */}
          <button onClick={() => { onClose(); window.scrollTo(0,0) }} style={{ width: '100%', marginTop: 16, padding: '14px', background: '#f5a623', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
            📞 この物件について相談する
          </button>`

const newConsultBtn = `          {/* 住宅ローンシミュレーター（売買物件のみ表示）*/}
          {p.deal_type === 'sale' || p.price ? (
            <div style={{ marginTop: 20, border: '1.5px solid #f5a623', borderRadius: 12, overflow: 'hidden' }}>
              <button onClick={() => setShowLoan(!showLoan)} style={{ width: '100%', padding: '12px 16px', background: showLoan ? '#f5a623' : '#fff8e7', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 700, fontSize: 14, color: '#1a3a5c' }}>
                <span>🏦 住宅ローンシミュレーター</span>
                <span style={{ fontSize: 18 }}>{showLoan ? '▲' : '▼'}</span>
              </button>
              {showLoan && (
                <div style={{ padding: 16, background: '#fffdf5' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 11, color: '#777', marginBottom: 3 }}>物件価格（万円）</label>
                      <input type="number" value={loanPrice} onChange={e => setLoanPrice(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '8px 10px', borderRadius: 8, border: '1px solid #ddd', fontSize: 13 }} placeholder="例：3000" />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 11, color: '#777', marginBottom: 3 }}>頭金（万円）</label>
                      <input type="number" value={downPayment} onChange={e => setDownPayment(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '8px 10px', borderRadius: 8, border: '1px solid #ddd', fontSize: 13 }} placeholder="例：300" />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 11, color: '#777', marginBottom: 3 }}>金利（年率%）</label>
                      <input type="number" value={rate} onChange={e => setRate(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '8px 10px', borderRadius: 8, border: '1px solid #ddd', fontSize: 13 }} step="0.1" />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 11, color: '#777', marginBottom: 3 }}>返済期間（年）</label>
                      <select value={years} onChange={e => setYears(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '8px 10px', borderRadius: 8, border: '1px solid #ddd', fontSize: 13 }}>
                        {[10,15,20,25,30,35].map(y => <option key={y} value={y}>{y}年</option>)}
                      </select>
                    </div>
                  </div>

                  {monthlyPayment > 0 && (
                    <div style={{ background: '#1a3a5c', borderRadius: 10, padding: '14px 16px', marginBottom: 12, color: '#fff' }}>
                      <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 4 }}>毎月の返済額（概算）</div>
                      <div style={{ fontSize: 28, fontWeight: 800 }}>{monthlyPayment.toLocaleString()}<span style={{ fontSize: 14, fontWeight: 400 }}>円/月</span></div>
                      <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: 12, opacity: 0.8 }}>
                        <span>借入額：{((parseFloat(loanPrice||0) - parseFloat(downPayment||0))).toLocaleString()}万円</span>
                        <span>総返済額：{Math.round(totalPayment/10000).toLocaleString()}万円</span>
                        <span>利息総額：{Math.round(totalInterest/10000).toLocaleString()}万円</span>
                      </div>
                    </div>
                  )}

                  <div style={{ fontSize: 11, color: '#999', marginBottom: 10 }}>※ 元利均等返済の概算です。実際の返済額は金融機関にご確認ください。</div>

                  <a href="https://h.accesstrade.net/sp/cc?rk=0100p7qk00ib4b" target="_blank" rel="noopener noreferrer sponsored" style={{ display: 'block', width: '100%', boxSizing: 'border-box', padding: '12px', background: 'linear-gradient(135deg, #f5a623, #e8920f)', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: 'pointer', textDecoration: 'none', textAlign: 'center' }}>
                    🏦 住宅ローンを無料で比較・相談する →
                  </a>
                  <div style={{ fontSize: 10, color: '#bbb', textAlign: 'center', marginTop: 4 }}>※ 提携金融機関のサービスページへ移動します</div>
                </div>
              )}
            </div>
          ) : null}

          {/* 問い合わせボタン */}
          <button onClick={() => { onClose(); window.scrollTo(0,0) }} style={{ width: '100%', marginTop: 16, padding: '14px', background: '#f5a623', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
            📞 この物件について相談する
          </button>`

if (content.includes(oldConsultBtn)) {
  content = content.replace(oldConsultBtn, newConsultBtn)
  console.log('✅ ローンシミュレーターUI追加完了')
} else {
  console.log('ERROR: 相談するボタンが見つかりませんでした')
  process.exit(1)
}

fs.writeFileSync(filePath, content, 'utf8')
console.log('SUCCESS: PropertyMatching.jsx にローンシミュレーターを追加しました！')
