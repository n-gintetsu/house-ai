const fs = require('fs')
const path = require('path')
const content = fs.readFileSync(path.join(__dirname, 'src', 'AdminDashboard.jsx'), 'utf8')
const lines = content.split('\n')

console.log('\n=== activeTab === 行一覧 ===')
lines.forEach((line, i) => {
  if (line.includes("activeTab ===")) {
    console.log(`${String(i+1).padStart(4)}: ${line.trim()}`)
  }
})

console.log('\n=== ads関連 ===')
lines.forEach((line, i) => {
  if (line.includes("'ads'") || line.includes('"ads"') || line.includes('AdManagement')) {
    console.log(`${String(i+1).padStart(4)}: ${line.trim()}`)
  }
})
