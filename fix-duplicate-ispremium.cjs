const fs = require('fs')
const path = require('path')

const appPath = path.join(__dirname, 'src', 'App.jsx')
let content = fs.readFileSync(appPath, 'utf8')

// React.useState を使った重複行を削除
const badLine = `\n  const [isPremium, setIsPremium] = React.useState ? React.useState(false) : (() => { throw new Error() })()`
if (content.includes(badLine)) {
  content = content.replace(badLine, '')
  console.log('✅ 重複したisPremium宣言を削除しました')
} else {
  // 別パターンで探す
  const lines = content.split('\n')
  let removed = false
  const newLines = []
  let skipNext = false
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('isPremium') && lines[i].includes('React.useState')) {
      console.log(`✅ ${i+1}行目の重複isPremiumを削除: ${lines[i].trim()}`)
      removed = true
      continue
    }
    newLines.push(lines[i])
  }
  if (removed) {
    content = newLines.join('\n')
  } else {
    console.log('ℹ️  削除対象が見つかりませんでした。現在の228-230行目を確認します')
    const check = content.split('\n').slice(225, 232)
    check.forEach((l, i) => console.log(`${226+i}: ${l}`))
  }
}

fs.writeFileSync(appPath, content, 'utf8')
console.log('\n✅ SUCCESS!')
