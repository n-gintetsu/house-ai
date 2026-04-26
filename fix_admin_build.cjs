const fs = require('fs');
const path = 'src/AdminDashboard.jsx';
const content = fs.readFileSync(path, 'utf8');

const broken = `(pw === ADMIN_PASSWORD ? (setAuthed(true); sessionStorage.setItem('admin_authed', 'true'), setPwError('')) : setPwError('パスワードが違います'))`;
const fixed  = `(pw === ADMIN_PASSWORD ? (setAuthed(true), sessionStorage.setItem('admin_authed', 'true'), setPwError('')) : setPwError('パスワードが違います'))`;

if (!content.includes(broken)) {
  console.log('⚠️  対象の文字列が見つかりませんでした。スクリーンショットをClaudeに送ってください。');
  process.exit(1);
}

fs.writeFileSync(path, content.replace(broken, fixed), 'utf8');
console.log('✅ 修正完了！次は npm run build を実行してください。');
