const fs = require('fs')
const path = require('path')

const filePath = path.join(__dirname, 'src', 'AdminDashboard.jsx')
let content = fs.readFileSync(filePath, 'utf8')

// onChange の desc: → description: に修正
const before = 'onChange={e => setAdForm({...adForm, desc: e.target.value})}'
const after  = 'onChange={e => setAdForm({...adForm, description: e.target.value})}'

if (content.includes(before)) {
  content = content.replace(before, after)
  fs.writeFileSync(filePath, content, 'utf8')
  console.log('SUCCESS: desc → description に修正しました！')
} else {
  console.log('ERROR: 対象箇所が見つかりませんでした。')
  // 念のため全体を検索して状況を表示
  const lines = content.split('\n')
  lines.forEach((line, i) => {
    if (line.includes('adForm') && line.includes('desc')) {
      console.log(`行${i+1}: ${line.trim()}`)
    }
  })
}
