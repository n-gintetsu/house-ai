const fs = require('fs')
const path = require('path')
const content = fs.readFileSync(path.join(__dirname, 'src', 'App.jsx'), 'utf8')
const lines = content.split('\n')

// handleSend周辺を探す
console.log('=== handleSend 周辺 ===')
lines.forEach((line, i) => {
  if (line.includes('handleSend') || line.includes('handleSubmit')) {
    const start = Math.max(0, i-2)
    const end = Math.min(lines.length, i+15)
    console.log(`\n--- ${i+1}行目 ---`)
    lines.slice(start, end).forEach((l, j) => {
      console.log(`${String(start+j+1).padStart(4)}: ${l}`)
    })
  }
})

// user関連のステートを探す
console.log('\n=== user ステート ===')
lines.forEach((line, i) => {
  if (line.includes('const [user') || line.includes('setUser(')) {
    console.log(`${String(i+1).padStart(4)}: ${line}`)
  }
})

// AI_CHAT_FREE_LIMIT 関連
console.log('\n=== AI_CHAT_FREE_LIMIT 関連 ===')
lines.forEach((line, i) => {
  if (line.includes('AI_CHAT') || line.includes('chatCount') || line.includes('getTodayChat')) {
    console.log(`${String(i+1).padStart(4)}: ${line}`)
  }
})
