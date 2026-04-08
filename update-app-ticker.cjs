const fs = require('fs')
const path = require('path')

const filePath = path.join(__dirname, 'src', 'App.jsx')

if (!fs.existsSync(filePath)) {
  console.error('ERROR: src/App.jsx が見つかりません')
  console.error('このファイルを house-ai フォルダに置いてから実行してください')
  process.exit(1)
}

let content = fs.readFileSync(filePath, 'utf8')

// 1) TickerBanner import を追加（まだない場合）
if (!content.includes('TickerBanner')) {
  content = content.replace(
    /^(import .+from .+\n)/m,
    `$1import TickerBanner from './TickerBanner'\n`
  )
  console.log('✅ TickerBanner import を追加しました')
} else {
  console.log('ℹ️  TickerBanner import は既に存在します')
}

// 2) <TickerBanner /> をヘッダー直後に挿入
// パターン1: <header ... > または <nav ... > の直後
// パターン2: return ( の直後の最初の div の中
if (!content.includes('<TickerBanner')) {
  // よくあるパターン: return (\n    <div ...>\n      <header
  // ヘッダー閉じタグ </header> の直後に挿入を試みる
  if (content.includes('</header>')) {
    content = content.replace(
      '</header>',
      `</header>\n      <TickerBanner />`
    )
    console.log('✅ </header> の直後に <TickerBanner /> を挿入しました')
  } else if (content.includes('</nav>')) {
    content = content.replace(
      '</nav>',
      `</nav>\n      <TickerBanner />`
    )
    console.log('✅ </nav> の直後に <TickerBanner /> を挿入しました')
  } else {
    // フォールバック: return 文の最初のJSXブロックの直後
    const returnMatch = content.match(/return\s*\(\s*\n(\s*)</)
    if (returnMatch) {
      const indent = returnMatch[1]
      content = content.replace(
        /return\s*\(\s*\n(\s*)</,
        `return (\n${indent}<>\n${indent}  <TickerBanner />\n${indent}  <`
      )
      // 対応する閉じタグも追加
      content = content.replace(/(\s*)\);\s*$/, '$1  </>\n$1);')
      console.log('✅ return の先頭に <TickerBanner /> を挿入しました')
    } else {
      console.error('ERROR: 挿入位置が見つかりませんでした')
      console.error('App.jsx の構造を確認してください')
      process.exit(1)
    }
  }
} else {
  console.log('ℹ️  <TickerBanner /> は既に存在します')
}

fs.writeFileSync(filePath, content, 'utf8')
console.log('')
console.log('✅ SUCCESS! src/App.jsx を更新しました')
console.log('')
console.log('次のステップ:')
console.log('  src/TickerBanner.jsx を配置してから git push してください')
