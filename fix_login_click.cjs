const fs = require('fs');
const path = 'src/AdminDashboard.jsx';
let content = fs.readFileSync(path, 'utf8');

const broken = `onClick={() => pw === ADMIN_PASSWORD ? (setAuthed(true), setPwError('')) : setPwError('パスワードが違います')}`;
const fixed  = `onClick={() => pw === ADMIN_PASSWORD ? (setAuthed(true), localStorage.setItem('admin_authed', 'true'), setPwError('')) : setPwError('パスワードが違います')}`;

if (!content.includes(broken)) {
  console.log('⚠️  対象の文字列が見つかりませんでした。スクリーンショットをClaudeに送ってください。');
  process.exit(1);
}

fs.writeFileSync(path, content.replace(broken, fixed), 'utf8');
console.log('✅ 修正完了！次は npm run build を実行してください。');
