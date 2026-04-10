const fs = require('fs')
const path = require('path')

const filePath = path.join(__dirname, 'src', 'PremiumBanner.jsx')
let content = fs.readFileSync(filePath, 'utf8')

// すでに追加済みチェック
if (content.includes('InquiryPopup')) {
  console.log('INFO: すでに問い合わせポップアップが追加されています')
  process.exit(0)
}

// インポートの後にsupabaseインポートを確認して追加
// AdBanner コンポーネントを探して、クリック時にポップアップを表示する機能を追加

// 1. useState に setShowInquiry, showInquiry, selectedAd を追加
content = content.replace(
  `export function AdBanner({ slot = 'sidebar' }) {
  const adItems = useAdItems()
  const [adIndex] = useState(() => Math.floor(Math.random() * FALLBACK_ADS.length))`,
  `// 問い合わせポップアップコンポーネント
function InquiryPopup({ ad, onClose }) {
  const [form, setForm] = useState({ name: '', phone: '', email: '', message: '' })
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async () => {
    if (!form.name || !form.phone) return
    setSending(true)
    try {
      await supabase.from('partner_inquiries').insert({
        partner_user_id: ad.partner_user_id,
        customer_name: form.name,
        customer_phone: form.phone,
        customer_email: form.email,
        message: form.message || ad.title + 'の広告を見てお問い合わせしました',
        status: '未対応'
      })
      setSent(true)
      setTimeout(() => { setSent(false); onClose() }, 2000)
    } catch(e) {}
    setSending(false)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={onClose}>
      <div style={{ background: '#fff', borderRadius: 16, padding: 28, width: '100%', maxWidth: 440, boxShadow: '0 8px 40px rgba(0,0,0,0.2)' }}
        onClick={e => e.stopPropagation()}>
        {sent ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
            <div style={{ color: '#1a3a5c', fontSize: 16, fontWeight: 700 }}>送信しました！</div>
            <div style={{ color: '#888', fontSize: 13, marginTop: 8 }}>担当者よりご連絡いたします</div>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <div style={{ color: '#1a3a5c', fontSize: 16, fontWeight: 700 }}>{ad.title}</div>
                <div style={{ color: '#888', fontSize: 12, marginTop: 2 }}>お問い合わせフォーム</div>
              </div>
              <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#aaa' }}>✕</button>
            </div>
            {[
              { key: 'name', label: 'お名前 *', placeholder: '山田 太郎', type: 'text' },
              { key: 'phone', label: '電話番号 *', placeholder: '090-0000-0000', type: 'tel' },
              { key: 'email', label: 'メールアドレス', placeholder: 'example@email.com', type: 'email' },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: 14 }}>
                <label style={{ color: '#555', fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>{f.label}</label>
                <input type={f.type} value={form[f.key]} onChange={e => setForm({...form, [f.key]: e.target.value})}
                  placeholder={f.placeholder}
                  style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #ddd', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' }} />
              </div>
            ))}
            <div style={{ marginBottom: 20 }}>
              <label style={{ color: '#555', fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>お問い合わせ内容</label>
              <textarea value={form.message} onChange={e => setForm({...form, message: e.target.value})}
                placeholder="ご質問・ご要望をご記入ください"
                rows={3}
                style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #ddd', borderRadius: 8, fontSize: 14, boxSizing: 'border-box', resize: 'none' }} />
            </div>
            <button onClick={handleSubmit} disabled={sending || !form.name || !form.phone}
              style={{ width: '100%', padding: '12px', background: form.name && form.phone ? '#1a3a5c' : '#ccc', color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: form.name && form.phone ? 'pointer' : 'not-allowed' }}>
              {sending ? '送信中...' : '送信する'}
            </button>
            <div style={{ color: '#aaa', fontSize: 11, textAlign: 'center', marginTop: 10 }}>※ お名前と電話番号は必須です</div>
          </>
        )}
      </div>
    </div>
  )
}

export function AdBanner({ slot = 'sidebar' }) {
  const adItems = useAdItems()
  const [adIndex] = useState(() => Math.floor(Math.random() * FALLBACK_ADS.length))
  const [showInquiry, setShowInquiry] = useState(false)
  const [selectedAd, setSelectedAd] = useState(null)`
)

// AdBanner の return 文の最初に InquiryPopup を追加
// ad.show_inquiry_form が true の場合はポップアップ、そうでなければ通常リンク
content = content.replace(
  `const ad = adItems[adIndex % adItems.length]
  if (!ad) return null`,
  `const ad = adItems[adIndex % adItems.length]
  if (!ad) return null

  const handleAdClick = (e) => {
    if (ad.show_inquiry_form && ad.partner_user_id) {
      e.preventDefault()
      setSelectedAd(ad)
      setShowInquiry(true)
    }
  }`
)

// return文にInquiryPopupとonClickを追加
content = content.replace(
  `  return (`,
  `  return (
    <>
    {showInquiry && selectedAd && <InquiryPopup ad={selectedAd} onClose={() => setShowInquiry(false)} />}`
)

// aタグにonClickを追加（最初のhref="/のあるaタグ）
// 閉じタグの処理
const returnEnd = content.lastIndexOf('  )\n}')
if (returnEnd > 0) {
  content = content.slice(0, returnEnd) + '  </>\n  )\n}'
}

fs.writeFileSync(filePath, content, 'utf8')
console.log('SUCCESS: 問い合わせポップアップを追加しました！npm run build を実行してください')
