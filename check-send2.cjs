const fs = require('fs')
const path = require('path')
const content = fs.readFileSync(path.join(__dirname, 'src', 'App.jsx'), 'utf8')
const lines = content.split('\n')

// handleSend本体を探す（async function or const handleSend）
lines.forEach((line, i) => {
  if (line.includes('handleSend') && (line.includes('const') || line.includes('async') || line.includes('function'))) {
    const start = Math.max(0, i-1)
    const end = Math.min(lines.length, i+20)
    console.log(`\n--- handleSend定義 (${i+1}行目) ---`)
    lines.slice(start, end).forEach((l, j) => {
      console.log(`${String(start+j+1).padStart(4)}: ${l}`)
    })
  }
})
