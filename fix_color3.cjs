const fs = require('fs')

let content = fs.readFileSync('src/App.jsx', 'utf-8')

// 白×紺のスタイリッシュデザインに変更
content = content.replace('--bg: #eef3f8;', '--bg: #f0f4f8;')
content = content.replace('--surface: rgba(255, 255, 255, 0.85);', '--surface: rgba(255, 255, 255, 0.95);')
content = content.replace('--border: rgba(30, 80, 160, 0.2);', '--border: rgba(26, 58, 92, 0.2);')
content = content.replace('--border-2: rgba(30, 80, 160, 0.1);', '--border-2: rgba(26, 58, 92, 0.1);')
content = content.replace('--text: rgba(10, 30, 70, 0.9);', '--text: #1a3a5c;')
content = content.replace('--muted: rgba(10, 30, 70, 0.5);', '--muted: rgba(26, 58, 92, 0.5);')
content = content.replace('--accent: #c9a84c;', '--accent: #1a3a5c;')
content = content.replace('--accent-dim: rgba(255, 215, 100, 0.12);', '--accent-dim: rgba(26, 58, 92, 0.08);')
content = content.replace('--accent-border: rgba(255, 215, 100, 0.35);', '--accent-border: rgba(26, 58, 92, 0.3);')
content = content.replace('--shadow: 0 12px 40px rgba(0, 0, 0, 0.55);', '--shadow: 0 4px 24px rgba(26, 58, 92, 0.12);')

fs.writeFileSync('src/App.jsx', content, 'utf-8')
console.log('SUCCESS')