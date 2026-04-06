const fs = require('fs')

let content = fs.readFileSync('src/App.jsx', 'utf-8')

// SNS風・白カード×紺アクセントに変更
content = content.replace('--bg: #f0f4f8;', '--bg: #e8eef5;')
content = content.replace('--surface: rgba(255, 255, 255, 0.95);', '--surface: #ffffff;')
content = content.replace('--border: rgba(26, 58, 92, 0.2);', '--border: rgba(26, 58, 92, 0.15);')
content = content.replace('--border-2: rgba(26, 58, 92, 0.1);', '--border-2: rgba(26, 58, 92, 0.08);')
content = content.replace('--accent: #1a3a5c;', '--accent: #1a3a5c;')
content = content.replace('--shadow: 0 4px 24px rgba(26, 58, 92, 0.12);', '--shadow: 0 2px 12px rgba(26, 58, 92, 0.10);')

// カードの背景を白に（グレーになっているのを修正）
content = content.replaceAll('background: var(--surface)', 'background: #ffffff')
content = content.replaceAll('backgroundColor: var(--surface)', 'backgroundColor: #ffffff')

fs.writeFileSync('src/App.jsx', content, 'utf-8')
console.log('SUCCESS')