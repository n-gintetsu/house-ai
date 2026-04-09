const fs = require('fs')
const path = require('path')
const content = fs.readFileSync(path.join(__dirname, 'src', 'App.jsx'), 'utf8')
const lines = content.split('\n')

// 233-237行目の正確な内容（スペースも含めて）
console.log('=== 233-240行目（正確な文字列）===')
lines.slice(232, 240).forEach((line, i) => {
  const spaces = line.match(/^(\s*)/)[1].length
  console.log(`${233+i}: [${spaces}spaces] ${JSON.stringify(line)}`)
})
