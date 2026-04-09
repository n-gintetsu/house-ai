const fs = require('fs')
const path = require('path')

const appPath = path.join(__dirname, 'src', 'App.jsx')
let content = fs.readFileSync(appPath, 'utf8')

// 問題のパターン：onChange={(e) の後に改行があって次の行が => setCommunityDraft
// 行単位で処理して修正する
const lines = content.split('\n')
const newLines = []

for (let i = 0; i < lines.length; i++) {
  const line = lines[i]
  const nextLine = lines[i + 1] || ''
  
  // onChange={(e) だけで終わっている行（=> がない）
  if (line.trim() === 'onChange={(e)' && nextLine.trim().startsWith('=>')) {
    // 次の行の => 以降と結合
    const combined = line.replace('onChange={(e)', 'onChange={(e) ' + nextLine.trim())
    newLines.push(combined)
    i++ // 次の行をスキップ
    console.log(`✅ ${i}行目を修正しました: onChange={(e) と => を結合`)
  } else {
    newLines.push(line)
  }
}

content = newLines.join('\n')

// コラムタブが正しい場所にあるか確認
const hasColumnTab = content.includes("tab === 'column'")
console.log('コラムタブ存在確認:', hasColumnTab)

if (!hasColumnTab) {
  // agencyタブの表示ブロックの後に追加
  // App.jsxでagencyタブを表示している最後の部分を探す
  const searchStr = "tab === 'agency'"
  const lastIdx = content.lastIndexOf(searchStr)
  
  if (lastIdx >= 0) {
    let depth = 0
    let foundOpen = false
    let closeIdx = -1
    
    for (let i = lastIdx; i < Math.min(content.length, lastIdx + 5000); i++) {
      if (content[i] === '(') { depth++; foundOpen = true }
      if (content[i] === ')' && foundOpen) {
        depth--
        if (depth === 0) { closeIdx = i; break }
      }
    }
    
    if (closeIdx > 0) {
      const insertStr = `\n\n          {tab === 'column' && (\n            <ColumnPage />\n          )}`
      content = content.slice(0, closeIdx + 1) + insertStr + content.slice(closeIdx + 1)
      console.log('✅ コラムタブ表示を追加しました')
    }
  }
}

fs.writeFileSync(appPath, content, 'utf8')
console.log('\nSUCCESS: App.jsx 修正完了！npm run build を実行してください')
