const fs = require('fs')
const path = require('path')
const content = fs.readFileSync(path.join(__dirname, 'src', 'AdminDashboard.jsx'), 'utf8')
const lines = content.split('\n')

console.log(`総行数: ${lines.length}`)

// activeTab関連を探す
console.log('\n=== activeTab 表示切り替え部分 ===')
lines.forEach((line, i) => {
  if (line.includes("activeTab ===")) {
    console.log(`${String(i+1).padStart(4)}: ${line}`)
  }
})

// AdManagementを探す
console.log('\n=== AdManagement関連 ===')
lines.forEach((line, i) => {
  if (line.includes('AdManagement') || line.includes("'ads'")) {
    console.log(`${String(i+1).padStart(4)}: ${line}`)
  }
})

// 最後の50行
console.log('\n=== 最後の30行 ===')
lines.slice(-30).forEach((line, i) => {
  console.log(`${String(lines.length-29+i).padStart(4)}: ${line}`)
})
