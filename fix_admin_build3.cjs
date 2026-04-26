const fs = require('fs');
const path = 'src/AdminDashboard.jsx';
const content = fs.readFileSync(path, 'utf8');

const broken = `onClick={() => setAuthed(false); sessionStorage.removeItem('admin_authed')}`;
const fixed  = `onClick={() => { setAuthed(false); sessionStorage.removeItem('admin_authed'); }}`;

if (!content.includes(broken)) {
  console.log('⚠️  対象の文字列が見つかりませんでした。スクリーンショットをClaudeに送ってください。');
  process.exit(1);
}

fs.writeFileSync(path, content.replace(broken, fixed), 'utf8');
console.log('✅ 修正完了！次は npm run build を実行してください。');
