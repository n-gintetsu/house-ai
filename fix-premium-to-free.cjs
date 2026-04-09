const fs = require('fs')
const path = require('path')

// PremiumBanner.jsx を修正
const filePath = path.join(__dirname, 'src', 'PremiumBanner.jsx')
let content = fs.readFileSync(filePath, 'utf8')

// PremiumUpgradeBanner を無料会員登録バナーに書き換え
const oldBanner = `export function PremiumUpgradeBanner({ user, isPremium, onUpgrade }) {
  const [loading, setLoading] = useState(false)

  if (isPremium) return null

  const handleUpgrade = async () => {
    if (!user) {
      alert('アップグレードするには会員登録が必要です')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/stripe-checkout', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ userId: user.id, email: user.email }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        alert('エラーが発生しました。もう一度お試しください。')
      }
    } catch (err) {
      alert('エラーが発生しました。もう一度お試しください。')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, #1a3a5c, #2a5a8c)',
      borderRadius: '12px',
      padding: '16px',
      color: '#fff',
      margin: '12px 0',
    }}>
      <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>
        ✨ プレミアム会員にアップグレード
      </div>
      <div style={{ fontSize: '11px', opacity: 0.85, marginBottom: '10px', lineHeight: 1.6 }}>
        • AIチャット無制限<br />
        • 物件マッチングAI優先利用<br />
        • 広告非表示<br />
        • 専門家紹介の優先対応
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '16px', fontWeight: '700' }}>
          月額 ¥980
          <span style={{ fontSize: '11px', fontWeight: '400', opacity: 0.8, marginLeft: '4px' }}>（税込）</span>
        </span>
        <button
          onClick={handleUpgrade}
          disabled={loading}
          style={{
            background: '#c9a84c',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            padding: '8px 18px',
            fontSize: '13px',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? '処理中...' : 'アップグレード'}
        </button>
      </div>
    </div>
  )
}`

const newBanner = `export function PremiumUpgradeBanner({ user, isPremium, onUpgrade }) {
  // ログイン済みの場合は表示しない
  if (user) return null

  return (
    <div style={{
      background: 'linear-gradient(135deg, #1a3a5c, #2a5a8c)',
      borderRadius: '12px',
      padding: '16px',
      color: '#fff',
      margin: '12px 0',
    }}>
      <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
        🎉 会員登録で全機能が無料で使えます！
      </div>
      <div style={{ fontSize: '11px', opacity: 0.85, marginBottom: '12px', lineHeight: 1.8 }}>
        • AIチャット無制限（未登録は1日5回まで）<br />
        • 物件マッチングAI・お気に入り保存<br />
        • 専門家紹介・売却査定依頼<br />
        • コミュニティ投稿・参加
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '13px', opacity: 0.9 }}>
          完全無料・登録30秒
        </span>
        <button
          onClick={() => {
            const el = document.querySelector('[data-tab="member"]') || document.querySelector('.ha-tabs button:last-child')
            if (el) el.click()
          }}
          style={{
            background: '#c9a84c',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            padding: '8px 18px',
            fontSize: '13px',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          無料会員登録 →
        </button>
      </div>
    </div>
  )
}`

if (content.includes('プレミアム会員にアップグレード')) {
  content = content.replace(oldBanner, newBanner)
  if (content.includes('会員登録で全機能が無料で使えます')) {
    console.log('✅ PremiumUpgradeBanner を無料会員登録バナーに変更しました')
  } else {
    // フォールバック：関数全体を置換
    content = content.replace(
      /export function PremiumUpgradeBanner[\s\S]*?^\}/m,
      newBanner
    )
    console.log('✅ PremiumUpgradeBanner を変更しました（フォールバック）')
  }
} else {
  console.log('ℹ️  既に変更済みか、対象が見つかりません')
}

// useState のimportが不要になった場合も残しておく（他で使用中）
fs.writeFileSync(filePath, content, 'utf8')
console.log('\n✅ SUCCESS!')
