const fs = require('fs')
const path = require('path')

const appPath = path.join(__dirname, 'src', 'App.jsx')
let content = fs.readFileSync(appPath, 'utf8')
content = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n')

const lines = content.split('\n')

// 692〜730行目あたりのCSSブロックを確認して書き換え
// .ha-tabs { から .ha-tab[aria-selected="true"] { の終わり } まで

let haTabsStart = -1
let haTabsEnd = -1

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('.ha-tabs {') && haTabsStart === -1) {
    haTabsStart = i
  }
  if (haTabsStart > 0 && lines[i].includes('.ha-tab[aria-selected="true"]')) {
    // このブロックの終わりを探す
    for (let j = i; j < i + 15; j++) {
      if (lines[j].trim() === '}') {
        haTabsEnd = j
        break
      }
    }
    break
  }
}

console.log(`ha-tabs CSS: ${haTabsStart+1}〜${haTabsEnd+1}行目`)

if (haTabsStart > 0 && haTabsEnd > 0) {
  const newCSS = `          .ha-tabs {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 6px;
            background: #f5a623;
            padding: 10px 12px;
            border-radius: 14px;
            margin: 0 0 4px;
          }
          .ha-tab {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 3px;
            padding: 10px 6px;
            border-radius: 10px;
            border: 1.5px solid rgba(255,255,255,0.4);
            background: rgba(255,255,255,0.2);
            color: #fff;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.15s;
            white-space: nowrap;
          }
          .ha-tab span[aria-hidden] {
            font-size: 16px;
          }
          .ha-tab:hover {
            background: rgba(255,255,255,0.35);
          }
          .ha-tab[aria-selected="true"] {
            background: #fff;
            color: #c47d00;
            border-color: #fff;
          }`

  lines.splice(haTabsStart, haTabsEnd - haTabsStart + 1, newCSS)
  console.log('✅ タブのCSSを新しいデザインに書き換えました')
} else {
  console.error('ERROR: CSSブロックが見つかりません')
  process.exit(1)
}

const newContent = lines.join('\n')
fs.writeFileSync(appPath, newContent, 'utf8')
console.log('\n✅ SUCCESS!')
