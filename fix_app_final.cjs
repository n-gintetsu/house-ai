const fs = require('fs')
const path = require('path')

const appPath = path.join(__dirname, 'src', 'App.jsx')
let content = fs.readFileSync(appPath, 'utf8')

// 壊れたパターン：onChange={(e)\n => setCommunity... を修正
// 改行が入ってしまっている
const broken = `onChange={(e)\n => setCommunityDraft((d) => ({ ...d, title: e.target.value }))}`
const fixed = `onChange={(e) => setCommunityDraft((d) => ({ ...d, title: e.target.value }))}`

if (content.includes(broken)) {
  content = content.replace(broken, fixed)
  console.log('✅ 壊れたonChangeを修正しました')
} else {
  // 別パターン（スペースや改行が違う場合）
  const lines = content.split('\n')
  for (let i = 0; i < lines.length - 1; i++) {
    if (lines[i].trim() === 'onChange={(e)' && lines[i+1].trim().startsWith('=>')) {
      lines[i] = lines[i].replace('onChange={(e)', 'onChange={(e) ' + lines[i+1].trim())
      lines.splice(i+1, 1)
      console.log(`✅ ${i+1}行目のonChangeを修正しました`)
      break
    }
  }
  content = lines.join('\n')
}

// コラムタブが正しい場所にあるか確認・修正
// まず既存のコラムタブ表示をすべて削除
const colPattern1 = `\n\n          {tab === 'column' && (\n            <ColumnPage />\n          )}`
const colPattern2 = `\n          {tab === 'column' && (\n            <ColumnPage />\n          )}`

content = content.split(colPattern1).join('')
content = content.split(colPattern2).join('')
console.log('✅ 既存のコラムタブ表示を削除しました')

// agencyタブ表示の直後に正しく追加
// App.jsx内でagencyタブを表示している部分を探す
// パターン: tab === 'agency' && ( ... AgencyForm ... )}
const agencySearch = "tab === 'agency'"
const lastAgencyIdx = content.lastIndexOf(agencySearch)

if (lastAgencyIdx >= 0) {
  let depth = 0
  let foundOpen = false
  let closeIdx = -1
  
  for (let i = lastAgencyIdx; i < Math.min(content.length, lastAgencyIdx + 3000); i++) {
    if (content[i] === '(') { depth++; foundOpen = true }
    if (content[i] === ')' && foundOpen) {
      depth--
      if (depth === 0) { closeIdx = i; break }
    }
  }
  
  if (closeIdx > 0) {
    // )}の後に改行があるか確認
    const insertStr = `\n\n          {tab === 'column' && (\n            <ColumnPage />\n          )}`
    content = content.slice(0, closeIdx + 1) + insertStr + content.slice(closeIdx + 1)
    console.log('✅ コラムタブ表示をagencyタブの後に追加しました')
  } else {
    console.log('WARNING: agencyタブの閉じ括弧が見つかりませんでした')
  }
}

fs.writeFileSync(appPath, content, 'utf8')
console.log('\nSUCCESS: App.jsx を修正しました！npm run build を実行してください')
