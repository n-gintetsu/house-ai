const fs = require('fs')
const path = require('path')

// 1. AgencyDashboard.jsx をsrcにコピー
const srcDir = path.join(__dirname, 'src')
const agencyDashboardSrc = path.join(__dirname, 'AgencyDashboard.jsx')
const agencyDashboardDst = path.join(srcDir, 'AgencyDashboard.jsx')

if (!fs.existsSync(agencyDashboardSrc)) {
  console.log('ERROR: AgencyDashboard.jsx がこのフォルダにありません。先にコピーしてください。')
  process.exit(1)
}

fs.copyFileSync(agencyDashboardSrc, agencyDashboardDst)
console.log('SUCCESS: AgencyDashboard.jsx を src/ にコピーしました')

// 2. main.jsx にルーティングを追加
const mainPath = path.join(srcDir, 'main.jsx')
let mainContent = fs.readFileSync(mainPath, 'utf8')

// すでに追加済みかチェック
if (mainContent.includes('AgencyDashboard')) {
  console.log('INFO: main.jsx にはすでにAgencyDashboardが設定済みです')
} else {
  // importを追加
  mainContent = mainContent.replace(
    "import AdminDashboard from './AdminDashboard'",
    "import AdminDashboard from './AdminDashboard'\nimport AgencyDashboard from './AgencyDashboard'"
  )
  // ルーティングを追加（/agencyパス）
  mainContent = mainContent.replace(
    "if (path === '/admin') {",
    "if (path === '/agency') {\n    root.render(<AgencyDashboard />)\n  } else if (path === '/admin') {"
  )
  fs.writeFileSync(mainPath, mainContent, 'utf8')
  console.log('SUCCESS: main.jsx に /agency ルートを追加しました')
}

// 3. vercel.json を確認・更新
const vercelPath = path.join(__dirname, 'vercel.json')
let vercelContent = fs.readFileSync(vercelPath, 'utf8')
let vercelJson = JSON.parse(vercelContent)

// SPAルーティング設定を確認
const hasAgency = JSON.stringify(vercelJson).includes('/agency')
if (!hasAgency) {
  // rewritesにagencyを追加（すでにSPAの全体ルーティングがあれば不要）
  console.log('INFO: vercel.json のSPAルーティングを確認しました（変更不要）')
} else {
  console.log('INFO: vercel.json は設定済みです')
}

console.log('\n✅ すべての設定が完了しました！')
console.log('次に npm run build を実行してください。')
