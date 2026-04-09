const fs = require('fs')
const path = require('path')

const appPath = path.join(__dirname, 'src', 'App.jsx')
let content = fs.readFileSync(appPath, 'utf8')
content = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n')

const lines = content.split('\n')

// === 1) ha-composerInner と ha-composerActions のCSS修正 ===
let composerInnerIdx = -1
let composerActionsIdx = -1
let haFieldIdx = -1

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('.ha-composerInner') && lines[i].includes('{')) composerInnerIdx = i
  if (lines[i].includes('.ha-composerActions') && lines[i].includes('{')) composerActionsIdx = i
  if (lines[i].includes('.ha-field') && lines[i].includes('{') && haFieldIdx === -1) haFieldIdx = i
}

console.log(`ha-composerInner: ${composerInnerIdx+1}, ha-composerActions: ${composerActionsIdx+1}, ha-field: ${haFieldIdx+1}`)

// ha-composerInner を横並び・高さ揃えに
if (composerInnerIdx >= 0) {
  // ブロック終わりを探す
  let end = composerInnerIdx
  for (let j = composerInnerIdx+1; j < composerInnerIdx+15; j++) {
    if (lines[j].trim() === '}') { end = j; break }
  }
  const newInner = `          .ha-composerInner {
            display: flex;
            align-items: stretch;
            gap: 8px;
          }`
  lines.splice(composerInnerIdx, end - composerInnerIdx + 1, newInner)
  console.log('✅ ha-composerInner を横並びに変更')
} else {
  // なければ ha-composer の直後に追加
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('.ha-composer {')) {
      let end = i
      for (let j = i+1; j < i+15; j++) {
        if (lines[j].trim() === '}') { end = j; break }
      }
      lines.splice(end+1, 0, `          .ha-composerInner {
            display: flex;
            align-items: stretch;
            gap: 8px;
          }`)
      console.log('✅ ha-composerInner を追加')
      break
    }
  }
}

content = lines.join('\n')
const lines2 = content.split('\n')

// ha-composerActions を縦並びボタンに（flex-direction: column）
let actionsIdx2 = -1
for (let i = 0; i < lines2.length; i++) {
  if (lines2[i].includes('.ha-composerActions') && lines2[i].includes('{')) {
    actionsIdx2 = i; break
  }
}
if (actionsIdx2 >= 0) {
  let end = actionsIdx2
  for (let j = actionsIdx2+1; j < actionsIdx2+15; j++) {
    if (lines2[j].trim() === '}') { end = j; break }
  }
  const newActions = `          .ha-composerActions {
            display: flex;
            flex-direction: column;
            gap: 6px;
            flex-shrink: 0;
          }`
  lines2.splice(actionsIdx2, end - actionsIdx2 + 1, newActions)
  console.log('✅ ha-composerActions を縦並びに変更')
}
content = lines2.join('\n')

// textareaのmin-heightを調整（ha-composerInner内で伸びるように）
content = content.replace(
  /(<textarea[\s\S]*?className="ha-field"[\s\S]*?\/>)/,
  (match) => {
    if (match.includes('style=')) return match
    return match.replace('/>', 'style={{ minHeight: \'80px\', flex: 1, resize: \'none\' }} />')
  }
)
console.log('✅ textareaにflex:1とminHeightを追加')

// === 2) コミュニティ投稿本文の色を黒に ===
// p.body や {post.body} を含む行を探す
const lines3 = content.split('\n')
let communityFixed = 0
for (let i = 0; i < lines3.length; i++) {
  if (lines3[i].includes('{post.body}') || lines3[i].includes('{p.body}')) {
    // この行のpタグにstyleを追加
    if (!lines3[i].includes('color:')) {
      lines3[i] = lines3[i]
        .replace('<p>', '<p style={{ color: \'#1a1a1a\', fontSize: 14, lineHeight: 1.7 }}>')
        .replace('<p ', '<p style={{ color: \'#1a1a1a\', fontSize: 14, lineHeight: 1.7 }} ')
      communityFixed++
    }
  }
  // コミュニティ投稿のbodyクラス
  if (lines3[i].includes('ha-post-body') && !lines3[i].includes('color')) {
    lines3[i] = lines3[i].replace('ha-post-body">', 'ha-post-body" style={{ color: \'#1a1a1a\' }}>')
    communityFixed++
  }
}
content = lines3.join('\n')

// CSSでも color を設定
if (content.includes('.ha-post-body {')) {
  content = content.replace(
    '.ha-post-body {',
    '.ha-post-body {\n            color: #1a1a1a !important;'
  )
  communityFixed++
} else {
  // ha-post というクラスのbodyっぽいCSSを探す
  content = content.replace(
    '.ha-post {',
    '.ha-post {\n            color: #1a1a1a;'
  )
}

// コミュニティ投稿カードの文字色を強制的に黒に
content = content.replace(
  /className="ha-post"/g,
  'className="ha-post" style={{ color: \'#1a1a1a\' }}'
)
console.log(`✅ コミュニティ投稿の本文色を黒に設定 (${communityFixed}箇所)`)

fs.writeFileSync(appPath, content, 'utf8')
console.log('\n✅ SUCCESS!')
