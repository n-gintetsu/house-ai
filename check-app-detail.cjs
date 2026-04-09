const fs = require('fs')
const path = require('path')

const content = fs.readFileSync(path.join(__dirname, 'src', 'App.jsx'), 'utf8')
const lines = content.split('\n')

console.log('=== 1900〜1920行目 ===')
lines.slice(1899, 1920).forEach((line, i) => {
  console.log(`${String(1900+i).padStart(4)}: ${line}`)
})

console.log('')
console.log('=== userステート周辺（576行目前後） ===')
lines.slice(573, 595).forEach((line, i) => {
  console.log(`${String(574+i).padStart(4)}: ${line}`)
})

console.log('')
console.log('=== isPremium関連 ===')
lines.forEach((line, i) => {
  if (line.includes('isPremium') || line.includes('is_premium')) {
    console.log(`${String(i+1).padStart(4)}: ${line}`)
  }
})
