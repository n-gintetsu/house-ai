const fs = require('fs')
const path = require('path')

const appPath = path.join(__dirname, 'src', 'App.jsx')
let content = fs.readFileSync(appPath, 'utf8')

// タブ定義に追加（agencyタブの後）
// { id: 'agency', ... } の行を探して後に追加
const lines = content.split('\n')
let tabInserted = false

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("{ id: 'agency'") && lines[i].includes('icon:')) {
    // この行の後にcolumnタブを追加
    // agencyタブの行末に }, があるか確認
    const agencyLine = lines[i]
    console.log(`agencyタブ発見: ${i+1}行目: ${agencyLine}`)
    
    // columnタブを次の行に挿入
    lines.splice(i + 1, 0, "  { id: 'column', label: '\\u{1F4B0} \\u304A\\u5F97\\u60C5\\u5831', icon: '\\u{1F4B0}' },")
    tabInserted = true
    console.log('✅ タブ定義にcolumnタブを追加しました')
    break
  }
}

if (!tabInserted) {
  console.log('ERROR: agencyタブが見つかりませんでした')
  process.exit(1)
}

content = lines.join('\n')

// コラムタブのコンテンツ表示を追加
// memberタブ（AuthPanel）の表示を探して後に追加
const memberPatterns = [
  "{ id: 'member'",
  "tab === 'member'",
  "tab==='member'",
]

let contentInserted = false
const contentLines = content.split('\n')

for (let i = 0; i < contentLines.length; i++) {
  // AuthPanelが使われている行を探す（タブコンテンツ表示部分）
  if (contentLines[i].includes('<AuthPanel') && contentLines[i].includes('/>')) {
    // AuthPanelの表示ブロックの閉じ括弧を探す
    let j = i
    while (j < contentLines.length) {
      if (contentLines[j].includes(')}') || contentLines[j].trim() === ')}') {
        // ここの後にコラムタブを追加
        contentLines.splice(j + 1, 0, 
          '',
          "          {tab === 'column' && (",
          "            <ColumnPage />",
          "          )}"
        )
        console.log(`✅ コラムタブ表示を${j+2}行目に追加しました`)
        contentInserted = true
        break
      }
      j++
      if (j > i + 10) break // 10行以内で見つからなければ次へ
    }
    if (contentInserted) break
  }
}

if (!contentInserted) {
  // 別の方法：agencyタブのコンテンツ表示の後に追加
  const content2 = contentLines.join('\n')
  const agencyContentPattern = /<AgencyForm/
  const agencyIdx = content2.search(agencyContentPattern)
  
  if (agencyIdx >= 0) {
    // AgencyFormの後の )} を探す
    let idx = agencyIdx
    let depth = 0
    let foundParen = false
    
    for (let i = agencyIdx; i < Math.min(content2.length, agencyIdx + 500); i++) {
      if (content2[i] === '(') { depth++; foundParen = true }
      if (content2[i] === ')' && foundParen) {
        depth--
        if (depth === 0) {
          const insertStr = '\n\n          {tab === \'column\' && (\n            <ColumnPage />\n          )}'
          const newContent = content2.slice(0, i + 1) + insertStr + content2.slice(i + 1)
          fs.writeFileSync(appPath, newContent, 'utf8')
          console.log('✅ コラムタブ表示をAgencyFormの後に追加しました')
          contentInserted = true
          break
        }
      }
    }
  }
}

if (!contentInserted) {
  // タブ定義だけ追加してコンテンツは次回
  fs.writeFileSync(appPath, contentLines.join('\n'), 'utf8')
  console.log('WARNING: タブ定義は追加しましたが、コンテンツ表示の追加に失敗しました')
} else if (!content.includes('AgencyForm')) {
  fs.writeFileSync(appPath, contentLines.join('\n'), 'utf8')
}

console.log('\nSUCCESS: App.jsx を更新しました！npm run build を実行してください')
