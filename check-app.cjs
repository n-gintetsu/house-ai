const fs = require('fs')
const path = require('path')

const filePath = path.join(__dirname, 'src', 'App.jsx')

if (!fs.existsSync(filePath)) {
  console.error('ERROR: src/App.jsx が見つかりません')
  process.exit(1)
}

const content = fs.readFileSync(filePath, 'utf8')
const lines = content.split('\n')

console.log('=== App.jsx 先頭30行 ===')
lines.slice(0, 30).forEach((line, i) => {
  console.log(`${String(i+1).padStart(3)}: ${line}`)
})

console.log('')
console.log('=== return( の周辺 ===')
lines.forEach((line, i) => {
  if (line.includes('return') || line.includes('<header') || line.includes('<nav') || line.includes('<div') && i < 60) {
    console.log(`${String(i+1).padStart(3)}: ${line}`)
  }
})

// returnの位置を探す
const returnIdx = lines.findIndex(l => l.trim().startsWith('return'))
if (returnIdx >= 0) {
  console.log('')
  console.log(`=== return文 (${returnIdx+1}行目) の前後10行 ===`)
  lines.slice(Math.max(0, returnIdx-2), returnIdx+12).forEach((line, i) => {
    console.log(`${String(returnIdx-1+i).padStart(3)}: ${line}`)
  })
}
