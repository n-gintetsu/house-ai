const fs = require('fs')
const path = require('path')

const filePath = path.join(__dirname, 'src', 'TickerBanner.jsx')

if (!fs.existsSync(filePath)) {
  console.error('ERROR: src/TickerBanner.jsx が見つかりません')
  process.exit(1)
}

let content = fs.readFileSync(filePath, 'utf8')

// margin-bottom を追加
content = content.replace(
  'flexShrink: 0,',
  'flexShrink: 0,\n      marginBottom: \'12px\','
)

fs.writeFileSync(filePath, content, 'utf8')
console.log('✅ SUCCESS! ティッカーバナーの下に余白を追加しました')
