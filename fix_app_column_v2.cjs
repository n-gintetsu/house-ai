const fs = require('fs')
const path = require('path')

const appPath = path.join(__dirname, 'src', 'App.jsx')
let content = fs.readFileSync(appPath, 'utf8')

// 壊れた挿入を削除：onChange の中に入り込んでしまったコードを取り除く
// パターン1: onChange={(e)\n          {tab === 'column' ...}\n => setCommunity...
const brokenPattern1 = `onChange={(e)
          {tab === 'column' && (
            <ColumnPage />
          )} => setCommunityDraft((d) => ({ ...d, title: e.target.value }))}`

const fixedPattern1 = `onChange={(e) => setCommunityDraft((d) => ({ ...d, title: e.target.value }))}`

if (content.includes(brokenPattern1)) {
  content = content.replace(brokenPattern1, fixedPattern1)
  console.log('✅ 壊れた挿入を修正しました（パターン1）')
} else {
  // 別パターンで試す：行単位で修正
  const lines = content.split('\n')
  let fixedLines = []
  let skipNext = false
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    
    // 壊れたパターンを検出して修正
    if (line.includes("onChange={(e)") && !line.includes("=>") && 
        i + 3 < lines.length && lines[i+1].includes("tab === 'column'")) {
      // onChange={(e) の後にコラムタブが挿入されているケース
      // コラムタブの行を飛ばして、=> の部分をonChangeに結合
      let j = i + 1
      // コラムタブのブロックを飛ばす
      while (j < lines.length && !lines[j].includes('=>')) {
        j++
      }
      if (j < lines.length && lines[j].includes('=>')) {
        // onChange={(e) と => ... を結合
        const onChangePart = line.trim()
        const arrowPart = lines[j].trim()
        fixedLines.push(line.replace('onChange={(e)', 'onChange={(e) ' + arrowPart.replace(/^\s*/, '')))
        i = j // スキップ
      } else {
        fixedLines.push(line)
      }
    } else {
      fixedLines.push(line)
    }
  }
  
  const newContent = fixedLines.join('\n')
  if (newContent !== content) {
    content = newContent
    console.log('✅ 壊れた挿入を修正しました（行単位）')
  } else {
    // さらに別の方法：問題のある行を直接探す
    console.log('別の方法で修正を試みます...')
    
    // tab === 'column' の前後を確認して削除
    const colStart = content.indexOf("          {tab === 'column' && (\n            <ColumnPage />\n          )}")
    if (colStart > 0) {
      // この前後のコンテキストを確認
      const before = content.slice(Math.max(0, colStart - 50), colStart)
      const after = content.slice(colStart + 50, colStart + 100)
      console.log('前後のコンテキスト:', JSON.stringify(before + '<<<HERE>>>' + after))
      
      // コンテキストが onChange の中なら削除
      if (before.includes('onChange={(e)') || after.includes('=>')) {
        content = content.slice(0, colStart) + content.slice(colStart + "          {tab === 'column' && (\n            <ColumnPage />\n          )}".length)
        console.log('✅ コラムタブの誤挿入を削除しました')
      }
    }
  }
}

// コラムタブ表示が正しい場所にあるか確認
if (!content.includes("tab === 'column'")) {
  console.log('INFO: コラムタブ表示がありません。agencyタブの後に追加します')
  
  // agencyタブの表示ブロックを探す（最後の出現）
  // パターン：{tab === 'agency' && ( ... )}
  const searchStr = "tab === 'agency'"
  const lastIdx = content.lastIndexOf(searchStr)
  
  if (lastIdx >= 0) {
    // そのブロックの閉じ括弧 )} を探す
    let depth = 0
    let foundOpen = false
    let closeIdx = -1
    
    for (let i = lastIdx; i < content.length; i++) {
      if (content[i] === '(' ) { depth++; foundOpen = true }
      if (content[i] === ')' && foundOpen) {
        depth--
        if (depth === 0) { closeIdx = i; break }
      }
    }
    
    if (closeIdx > 0) {
      const insertStr = `\n\n          {tab === 'column' && (\n            <ColumnPage />\n          )}`
      content = content.slice(0, closeIdx + 1) + insertStr + content.slice(closeIdx + 1)
      console.log('✅ コラムタブ表示を正しい場所に追加しました')
    }
  }
} else {
  console.log('✅ コラムタブ表示は存在します')
}

fs.writeFileSync(appPath, content, 'utf8')
console.log('\nSUCCESS: App.jsx の修正完了！npm run build を実行してください')
