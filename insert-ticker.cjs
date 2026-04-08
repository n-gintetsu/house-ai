const fs = require('fs')
const path = require('path')

const appPath = path.join(__dirname, 'src', 'App.jsx')

if (!fs.existsSync(appPath)) {
  console.error('ERROR: src/App.jsx が見つかりません')
  process.exit(1)
}

let content = fs.readFileSync(appPath, 'utf8')

// --- 1) import追加 ---
if (content.includes("import TickerBanner")) {
  console.log('ℹ️  TickerBanner import は既にあります')
} else {
  content = content.replace(
    "import AgencyForm from './AgencyForm'",
    "import AgencyForm from './AgencyForm'\nimport TickerBanner from './TickerBanner'"
  )
  console.log('✅ TickerBanner import を追加しました')
}

// --- 2) </header>の直後に<TickerBanner />を挿入 ---
if (content.includes('<TickerBanner')) {
  console.log('ℹ️  <TickerBanner /> は既にあります')
} else {
  // </header> が何個あるか確認
  const count = (content.match(/<\/header>/g) || []).length
  console.log(`</header> タグ: ${count}個 見つかりました`)

  if (count === 0) {
    console.error('ERROR: </header> タグが見つかりませんでした')
    process.exit(1)
  }

  // 最初の </header> の直後に挿入
  content = content.replace(
    '</header>',
    '</header>\n        <TickerBanner />'
  )
  console.log('✅ </header> の直後に <TickerBanner /> を挿入しました')
}

fs.writeFileSync(appPath, content, 'utf8')
console.log('')
console.log('✅ SUCCESS! src/App.jsx の更新が完了しました')
console.log('次: git add -A → git commit → git push を実行してください')
