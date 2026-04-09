const fs = require('fs')
const path = require('path')
const content = fs.readFileSync(path.join(__dirname, 'src', 'App.jsx'), 'utf8')
const lines = content.split('\n')

// post.body の表示部分を探す
console.log('=== post.body 表示部分 ===')
lines.forEach((line, i) => {
  if (line.includes('post.body') || line.includes('post\.body')) {
    const start = Math.max(0, i-2)
    const end = Math.min(lines.length, i+4)
    lines.slice(start, end).forEach((l, j) => {
      console.log(`${String(start+j+1).padStart(4)}: ${l}`)
    })
    console.log('---')
  }
})

// ha-composer または AIチャット入力エリア
console.log('\n=== ha-composer / textarea ===')
lines.forEach((line, i) => {
  if (line.includes('ha-composer') || (line.includes('textarea') && line.includes('input'))) {
    const start = Math.max(0, i-1)
    const end = Math.min(lines.length, i+6)
    lines.slice(start, end).forEach((l, j) => {
      console.log(`${String(start+j+1).padStart(4)}: ${l}`)
    })
    console.log('---')
  }
})

// composerActions
console.log('\n=== composerActions ===')
lines.forEach((line, i) => {
  if (line.includes('composerActions') || line.includes('送信') || line.includes('ha-btn')) {
    if (i < 1350 && i > 1280) {
      console.log(`${String(i+1).padStart(4)}: ${line}`)
    }
  }
})
