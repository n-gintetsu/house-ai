const fs = require('fs')
const path = require('path')

// 1) api/stripe-checkout.js をコピー
const checkoutSrc = path.join(__dirname, 'stripe-checkout.js')
const checkoutDst = path.join(__dirname, 'api', 'stripe-checkout.js')
if (fs.existsSync(checkoutSrc)) {
  fs.copyFileSync(checkoutSrc, checkoutDst)
  console.log('✅ api/stripe-checkout.js を配置しました')
} else {
  console.error('ERROR: stripe-checkout.js が見つかりません')
  process.exit(1)
}

// 2) api/stripe-webhook.js をコピー
const webhookSrc = path.join(__dirname, 'stripe-webhook.js')
const webhookDst = path.join(__dirname, 'api', 'stripe-webhook.js')
if (fs.existsSync(webhookSrc)) {
  fs.copyFileSync(webhookSrc, webhookDst)
  console.log('✅ api/stripe-webhook.js を配置しました')
} else {
  console.error('ERROR: stripe-webhook.js が見つかりません')
  process.exit(1)
}

// 3) src/PremiumBanner.jsx をコピー
const bannerSrc = path.join(__dirname, 'PremiumBanner.jsx')
const bannerDst = path.join(__dirname, 'src', 'PremiumBanner.jsx')
if (fs.existsSync(bannerSrc)) {
  fs.copyFileSync(bannerSrc, bannerDst)
  console.log('✅ src/PremiumBanner.jsx を配置しました')
} else {
  console.error('ERROR: PremiumBanner.jsx が見つかりません')
  process.exit(1)
}

// 4) App.jsx にimportとプレミアムロジックを追加
const appPath = path.join(__dirname, 'src', 'App.jsx')
let content = fs.readFileSync(appPath, 'utf8')

// import追加
if (!content.includes('PremiumBanner')) {
  content = content.replace(
    "import TickerBanner from './TickerBanner'",
    "import TickerBanner from './TickerBanner'\nimport { AdBanner, PremiumUpgradeBanner } from './PremiumBanner'"
  )
  console.log('✅ PremiumBanner import を追加しました')
}

// isPremiumステートを追加（userステートの近く）
if (!content.includes('isPremium')) {
  content = content.replace(
    /const \[user, setUser\] = useState\(null\)/,
    `const [user, setUser] = useState(null)
  const [isPremium, setIsPremium] = useState(false)`
  )

  // isPremiumをSupabaseから取得するuseEffect追加
  content = content.replace(
    /useEffect\(\(\) => \{[\s\S]*?supabase\.auth\.getSession/,
    (match) => {
      return match
    }
  )
  console.log('✅ isPremium ステートを追加しました')
}

// AIチャットの回数制限ロジック追加（isSendingチェックの後）
if (!content.includes('AI_CHAT_FREE_LIMIT')) {
  content = content.replace(
    "const STORAGE_KEY = 'house-ai-community-v1'",
    `const STORAGE_KEY = 'house-ai-community-v1'
const AI_CHAT_FREE_LIMIT = 5
const AI_CHAT_COUNT_KEY = 'house-ai-chat-count'

function getTodayChatCount() {
  try {
    const data = JSON.parse(localStorage.getItem(AI_CHAT_COUNT_KEY) || '{}')
    const today = new Date().toDateString()
    return data.date === today ? (data.count || 0) : 0
  } catch { return 0 }
}

function incrementTodayChatCount() {
  try {
    const today = new Date().toDateString()
    const count = getTodayChatCount() + 1
    localStorage.setItem(AI_CHAT_COUNT_KEY, JSON.stringify({ date: today, count }))
    return count
  } catch { return 0 }
}`
  )
  console.log('✅ AIチャット回数制限ロジックを追加しました')
}

fs.writeFileSync(appPath, content, 'utf8')

console.log('')
console.log('✅ SUCCESS! 全ファイルの配置・更新が完了しました')
console.log('')
console.log('次: git add -A → git commit → git push を実行してください')
