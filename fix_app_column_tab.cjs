const fs = require('fs')
const path = require('path')

const appPath = path.join(__dirname, 'src', 'App.jsx')
let content = fs.readFileSync(appPath, 'utf8')

// 間違った場所に挿入されたコラムタブ表示を削除
// 複数パターンで対応
const wrongPatterns = [
  "\n          {tab === 'column' && <ColumnPage />}",
  "\n{tab === 'column' && <ColumnPage />}",
  "{tab === 'column' && <ColumnPage />}\n",
]

let removed = false
for (const pat of wrongPatterns) {
  if (content.includes(pat)) {
    content = content.split(pat).join('')
    removed = true
    console.log('✅ 間違った挿入を削除しました')
    break
  }
}

if (!removed) {
  // 行単位で探して削除
  const lines = content.split('\n')
  const newLines = lines.filter(line => !line.includes("tab === 'column' && <ColumnPage"))
  if (newLines.length < lines.length) {
    content = newLines.join('\n')
    console.log('✅ 間違った行を削除しました')
    removed = true
  }
}

if (!removed) {
  console.log('INFO: 削除対象が見つかりませんでした（すでに修正済みかもしれません）')
}

// 正しい場所に挿入：agencyタブの表示の後
// agencyタブの表示パターンを探す
const agencyTabPatterns = [
  "tab === 'agency'",
  'tab === "agency"',
]

let inserted = false
for (const pat of agencyTabPatterns) {
  const idx = content.lastIndexOf(pat)  // 最後の出現（表示部分）
  if (idx >= 0) {
    // そのif文の閉じ括弧 )} を探す
    let depth = 0
    let i = idx
    // { を探す
    while (i < content.length && content[i] !== '{') i++
    // ネストを数えて閉じ括弧を見つける
    let closeIdx = -1
    for (let j = i; j < content.length; j++) {
      if (content[j] === '(') depth++
      if (content[j] === ')') {
        depth--
        if (depth === 0) {
          closeIdx = j
          break
        }
      }
    }
    
    if (closeIdx > 0) {
      // )} の後に改行＋コラムタブを追加
      const insertStr = `\n\n          {tab === 'column' && (\n            <ColumnPage />\n          )}`
      content = content.slice(0, closeIdx + 1) + insertStr + content.slice(closeIdx + 1)
      console.log('✅ コラムタブ表示を正しい場所に追加しました')
      inserted = true
      break
    }
  }
}

if (!inserted) {
  console.log('WARNING: コラムタブ表示の挿入ができませんでした')
  console.log('手動で確認が必要です')
}

fs.writeFileSync(appPath, content, 'utf8')
console.log('\nSUCCESS: App.jsx を修正しました！npm run build を実行してください')
