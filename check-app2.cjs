const fs = require('fs')
const path = require('path')
const content = fs.readFileSync(path.join(__dirname, 'src', 'App.jsx'), 'utf8')
const lines = content.split('\n')

// AuthPanel周辺10行を表示
lines.forEach((line, i) => {
  if (line.includes('AuthPanel')) {
    const start = Math.max(0, i-5)
    const end = Math.min(lines.length, i+10)
    console.log(`\n=== AuthPanel (${i+1}行目) 周辺 ===`)
    lines.slice(start, end).forEach((l, j) => {
      console.log(`${String(start+j+1).padStart(4)}: ${l}`)
    })
  }
})

// userステートを探す
console.log('\n=== useState(null) 周辺 ===')
lines.forEach((line, i) => {
  if (line.includes('useState') && (line.includes('user') || line.includes('User'))) {
    console.log(`${String(i+1).padStart(4)}: ${line}`)
  }
})
