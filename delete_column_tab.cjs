const fs = require('fs')
const path = require('path')

const appPath = path.join(__dirname, 'src', 'App.jsx')
let content = fs.readFileSync(appPath, 'utf8')

// 行単位で処理
const lines = content.split('\n')

console.log('総行数:', lines.length)
console.log('1935-1945行目の内容:')
for (let i = 1934; i < Math.min(1945, lines.length); i++) {
  console.log(`${i+1}: ${lines[i]}`)
}

// コラムタブ関連の行をすべて削除
const newLines = []
let i = 0
while (i < lines.length) {
  const line = lines[i]
  
  // コラムタブのブロック開始を検出
  if (line.includes("tab === 'column'") && line.includes('&&')) {
    console.log(`削除開始: ${i+1}行目: ${line}`)
    // このブロック全体を削除（開き括弧を数えて閉じ括弧まで）
    // 単純に次の )} まで削除
    let j = i
    let depth = 0
    let foundParen = false
    
    // ( を探す
    while (j < lines.length) {
      for (const ch of lines[j]) {
        if (ch === '(') { depth++; foundParen = true }
        if (ch === ')' && foundParen) { depth-- }
      }
      if (foundParen && depth === 0) {
        console.log(`削除終了: ${j+1}行目: ${lines[j]}`)
        i = j + 1
        break
      }
      j++
    }
    continue
  }
  
  newLines.push(line)
  i++
}

console.log('\n修正後の行数:', newLines.length)
content = newLines.join('\n')

fs.writeFileSync(appPath, content, 'utf8')
console.log('SUCCESS: コラムタブを削除しました！npm run build を実行してください')
console.log('※ コラムタブは後で正しい場所に追加します')
