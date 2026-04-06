const fs = require('fs')

let content = fs.readFileSync('src/App.jsx', 'utf-8')

// アメブロ風：白背景・紺アクセント・すっきりデザイン
content = content.replace('--bg: #e8eef5;', '--bg: #f5f7fa;')
content = content.replace('--surface: #ffffff;', '--surface: #ffffff;')
content = content.replace('--text: #1a3a5c;', '--text: #333333;')
content = content.replace('--muted: rgba(26, 58, 92, 0.5);', '--muted: #888888;')
content = content.replace('--accent: #1a3a5c;', '--accent: #1a3a5c;')
content = content.replace('--accent-dim: rgba(26, 58, 92, 0.08);', '--accent-dim: rgba(26, 58, 92, 0.06);')
content = content.replace('--shadow: 0 2px 12px rgba(26, 58, 92, 0.10);', '--shadow: 0 1px 8px rgba(0,0,0,0.08);')

// 入力欄の背景を白に修正
content = content.replaceAll('background: rgba(0,0,0,0.2)', 'background: #ffffff')
content = content.replaceAll('background: rgba(0, 0, 0, 0.2)', 'background: #ffffff')
content = content.replaceAll('backgroundColor: \'rgba(0,0,0,0.2)\'', 'backgroundColor: \'#ffffff\'')
content = content.replaceAll('rgba(255,255,255,0.07)', '#f8f9fa')
content = content.replaceAll('rgba(255, 255, 255, 0.07)', '#f8f9fa')
content = content.replaceAll('rgba(255,255,255,0.05)', '#f8f9fa')
content = content.replaceAll('rgba(255, 255, 255, 0.05)', '#f8f9fa')
content = content.replaceAll('rgba(255,255,255,0.1)', '#ffffff')
content = content.replaceAll('rgba(255, 255, 255, 0.1)', '#ffffff')

fs.writeFileSync('src/App.jsx', content, 'utf-8')
console.log('SUCCESS')