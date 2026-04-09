const fs = require('fs')
const path = require('path')
const content = fs.readFileSync(path.join(__dirname, 'src', 'App.jsx'), 'utf8')
const lines = content.split('\n')

// nav タグ周辺
console.log('=== </nav> 周辺 ===')
lines.forEach((line, i) => {
  if (line.includes('ha-tabs') || line.includes('</nav>') || line.includes('<nav')) {
    const start = Math.max(0, i-1)
    const end = Math.min(lines.length, i+3)
    lines.slice(start, end).forEach((l, j) => {
      console.log(`${String(start+j+1).padStart(4)}: ${l}`)
    })
    console.log('---')
  }
})

// isSending周辺
console.log('\n=== isSending 周辺（最初の3件） ===')
let count = 0
lines.forEach((line, i) => {
  if (line.includes('isSending') && count < 6) {
    console.log(`${String(i+1).padStart(4)}: ${line}`)
    count++
  }
})
