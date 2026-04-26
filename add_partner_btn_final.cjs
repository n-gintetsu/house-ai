const fs = require('fs');
const path = 'src/AdminDashboard.jsx';
let content = fs.readFileSync(path, 'utf8');

const target = `<button style={btnStyle(activeSection==='ads')} onClick={() => setActiveSection('ads')}>📢広告バナー</button>`;
const replacement = `<button style={btnStyle(activeSection==='ads')} onClick={() => setActiveSection('ads')}>📢広告バナー</button>
            <button style={btnStyle(activeSection==='パートナー')} onClick={() => setActiveSection('パートナー')}>👥パートナー業者</button>`;

if (!content.includes(target)) {
  console.log('⚠️  対象の文字列が見つかりませんでした。スクリーンショットをClaudeに送ってください。');
  process.exit(1);
}

fs.writeFileSync(path, content.replace(target, replacement), 'utf8');
console.log('✅ パートナー業者ボタンを追加しました！次は npm run build を実行してください。');
