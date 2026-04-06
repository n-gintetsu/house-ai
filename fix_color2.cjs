const fs = require('fs')

let content = fs.readFileSync('src/App.jsx', 'utf-8')

// 背景色を白に近いブルーに変更
content = content.replace('--bg: #0a1628;', '--bg: #eef3f8;')
content = content.replace('--surface: rgba(255, 255, 255, 0.06);', '--surface: rgba(255, 255, 255, 0.85);')
content = content.replace('--border: rgba(100, 160, 255, 0.25);', '--border: rgba(30, 80, 160, 0.2);')
content = content.replace('--border-2: rgba(100, 160, 255, 0.12);', '--border-2: rgba(30, 80, 160, 0.1);')
content = content.replace('--text: rgba(255, 255, 255, 0.9);', '--text: rgba(10, 30, 70, 0.9);')
content = content.replace('--muted: rgba(255, 255, 255, 0.58);', '--muted: rgba(10, 30, 70, 0.5);')

fs.writeFileSync('src/App.jsx', content, 'utf-8')
console.log('SUCCESS')