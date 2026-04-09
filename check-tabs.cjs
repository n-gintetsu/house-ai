const fs = require('fs')
const path = require('path')
const content = fs.readFileSync(path.join(__dirname, 'src', 'App.jsx'), 'utf8')
const lines = content.split('\n')

// ha-tabs周辺を探す
console.log('=== ha-tabs 周辺 ===')
lines.forEach((line, i) => {
  if (line.includes('ha-tabs') || line.includes('ha-tab') || line.includes('tablist')) {
    const start = Math.max(0, i-1)
    const end = Math.min(lines.length, i+8)
    lines.slice(start, end).forEach((l, j) => {
      console.log(`${String(start+j+1).padStart(4)}: ${l}`)
    })
    console.log('---')
  }
})

// CSSのha-tabs部分
console.log('\n=== CSS ha-tabs ===')
lines.forEach((line, i) => {
  if (line.includes('.ha-tab') && (line.includes('{') || line.includes('background') || line.includes('border'))) {
    console.log(`${String(i+1).padStart(4)}: ${line}`)
  }
})
