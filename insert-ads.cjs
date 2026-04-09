const fs = require('fs')
const path = require('path')

const appPath = path.join(__dirname, 'src', 'App.jsx')
let content = fs.readFileSync(appPath, 'utf8')

// 1) タブ下（</nav>の直後・<main>の前）に広告挿入
if (content.includes('AdBanner slot=')) {
  console.log('ℹ️  広告バナーは既にあります')
} else {
  content = content.replace(
    '            </nav>\n\n              <main className="ha-main">',
    '            </nav>\n            <AdBanner slot="tab" />\n\n              <main className="ha-main">'
  )
  // 上記でマッチしない場合のフォールバック
  if (!content.includes('AdBanner slot=')) {
    content = content.replace(
      '            </nav>',
      '            </nav>\n            <AdBanner slot="tab" />'
    )
  }
  console.log('✅ タブ下に広告バナーを挿入しました')
}

// 2) AIチャット内 - isSending ? ( の直前に挿入
if (content.includes('AdBanner slot="chat"')) {
  console.log('ℹ️  チャット内広告は既にあります')
} else {
  // 1265行目付近の {isSending ? ( の直前
  content = content.replace(
    '                {isSending ? (',
    '                <AdBanner slot="chat" />\n                {isSending ? ('
  )
  console.log('✅ AIチャット内に広告バナーを挿入しました')
}

fs.writeFileSync(appPath, content, 'utf8')
console.log('\n✅ SUCCESS!')
