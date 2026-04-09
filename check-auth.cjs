const fs = require('fs')
const path = require('path')

const content = fs.readFileSync(path.join(__dirname, 'src', 'App.jsx'), 'utf8')
const lines = content.split('\n')

// AuthPanel周辺を探す
lines.forEach((line, i) => {
  if (line.includes('AuthPanel') || line.includes('auth') || line.includes('isPremium') || line.includes('premium')) {
    console.log(`${String(i+1).padStart(4)}: ${line}`)
  }
})
