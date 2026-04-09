const fs = require('fs')
const path = require('path')

const appPath = path.join(__dirname, 'src', 'App.jsx')
const content = fs.readFileSync(appPath, 'utf8')
const lines = content.split('\n')

console.log('総行数:', lines.length)

// agencyタブとmemberタブの間に挿入
// agencyタブの行を探す
let agencyLineIdx = -1
let memberLineIdx = -1

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("{ id: 'agency'")) agencyLineIdx = i
  if (lines[i].includes("{ id: 'member'")) memberLineIdx = i
}

console.log('agencyタブ行:', agencyLineIdx + 1)
console.log('memberタブ行:', memberLineIdx + 1)

if (agencyLineIdx < 0 || memberLineIdx < 0) {
  console.log('ERROR: タブが見つかりませんでした')
  process.exit(1)
}

// agencyタブの行のインデントを取得
const indent = lines[agencyLineIdx].match(/^(\s*)/)[1]

// agencyとmemberの間（agencyの次の行）にcolumnタブを挿入
const columnTabLine = `${indent}{ id: 'column', label: '\u{1F4B0} \u304A\u5F97\u60C5\u5831', icon: '\u{1F4B0}' },`
lines.splice(agencyLineIdx + 1, 0, columnTabLine)
console.log('✅ columnタブをTABS定義に追加しました')
console.log('追加した行:', columnTabLine)

// コンテンツ表示を追加
// memberタブのインデックスが1つずれたので更新
const newMemberLineIdx = memberLineIdx + 1

// App関数内でtab === 'member'またはtab === 'agency'を表示している部分を探す
// agencyのコンテンツ表示（AgencyForm）を探す
let agencyContentIdx = -1
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('AgencyForm') && lines[i].includes('<')) {
    agencyContentIdx = i
    break
  }
}

console.log('AgencyForm表示行:', agencyContentIdx + 1)

if (agencyContentIdx >= 0) {
  // AgencyFormが含まれるif文ブロックの閉じ括弧 )} を探す
  let j = agencyContentIdx
  let depth = 0
  let foundParen = false
  let closeLineIdx = -1

  // 前の行に戻って ( を探す
  for (let k = agencyContentIdx; k >= Math.max(0, agencyContentIdx - 5); k--) {
    if (lines[k].includes("tab === 'agency'")) {
      // ここからブロックを数える
      for (let m = k; m < Math.min(lines.length, k + 30); m++) {
        for (const ch of lines[m]) {
          if (ch === '(') { depth++; foundParen = true }
          if (ch === ')' && foundParen) { depth-- }
        }
        if (foundParen && depth === 0) {
          closeLineIdx = m
          break
        }
      }
      break
    }
  }

  console.log('agencyコンテンツ閉じ行:', closeLineIdx + 1)

  if (closeLineIdx >= 0) {
    const contentIndent = lines[closeLineIdx].match(/^(\s*)/)[1]
    const columnContent = [
      '',
      `${contentIndent}{tab === 'column' && (`,
      `${contentIndent}  <ColumnPage />`,
      `${contentIndent})}`
    ]
    lines.splice(closeLineIdx + 1, 0, ...columnContent)
    console.log('✅ columnコンテンツ表示を追加しました')
  } else {
    console.log('WARNING: agencyコンテンツの閉じ括弧が見つかりませんでした')
    console.log('タブ定義のみ追加しました。コンテンツは次回追加します。')
  }
}

fs.writeFileSync(appPath, lines.join('\n'), 'utf8')
console.log('\nSUCCESS: App.jsx を更新しました！npm run build を実行してください')
