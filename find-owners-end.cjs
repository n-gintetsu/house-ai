const fs = require('fs')
const path = require('path')
const content = fs.readFileSync(path.join(__dirname, 'src', 'AdminDashboard.jsx'), 'utf8')
const lines = content.split('\n')

// owners を含む行を全部表示
console.log('=== owners関連の行 ===')
lines.forEach((line, i) => {
  if (line.includes('owner') || line.includes('Owner')) {
    console.log(`${String(i+1).padStart(4)}: ${line.trim().substring(0, 80)}`)
  }
})

// 最後から100行
console.log('\n=== 最後から100行（500行目以降） ===')
const start = Math.max(0, lines.length - 100)
lines.slice(start).forEach((line, i) => {
  console.log(`${String(start+i+1).padStart(4)}: ${line.trim().substring(0, 80)}`)
})
