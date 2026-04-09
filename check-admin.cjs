const fs = require('fs')
const path = require('path')
const content = fs.readFileSync(path.join(__dirname, 'src', 'AdminDashboard.jsx'), 'utf8')
const lines = content.split('\n')

console.log(`総行数: ${lines.length}`)
console.log('\n=== 先頭20行 ===')
lines.slice(0, 20).forEach((line, i) => {
  console.log(`${String(i+1).padStart(4)}: ${line}`)
})

console.log('\n=== メニュー項目 ===')
lines.forEach((line, i) => {
  if (line.includes('サマリー') || line.includes('会員管理') || line.includes('物件管理') || 
      line.includes('section') || line.includes('activeMenu') || line.includes('menu')) {
    console.log(`${String(i+1).padStart(4)}: ${line}`)
  }
})
