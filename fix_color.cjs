const fs = require('fs')

let content = fs.readFileSync('src/App.jsx', 'utf-8')

// 背景色をダークブルー系に変更
content = content.replace('--bg: #050508;', '--bg: #0a1628;')
content = content.replace('--surface: rgba(255, 255, 255, 0.035);', '--surface: rgba(255, 255, 255, 0.06);')
content = content.replace('--border: rgba(255, 215, 100, 0.22);', '--border: rgba(100, 160, 255, 0.25);')
content = content.replace('--border-2: rgba(255, 215, 100, 0.12);', '--border-2: rgba(100, 160, 255, 0.12);')
content = content.replace('--accent: #ffd764;', '--accent: #c9a84c;')

fs.writeFileSync('src/App.jsx', content, 'utf-8')
console.log('SUCCESS')