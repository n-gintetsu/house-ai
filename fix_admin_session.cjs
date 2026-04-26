const fs = require('fs');

const filePath = 'src/AdminDashboard.jsx';
const raw = fs.readFileSync(filePath, 'utf8');
let content = raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

// 1. authedのuseStateをsessionStorageから初期値を取得するように変更
const oldAuthed = `  const [authed, setAuthed] = useState(false)`;
const newAuthed = `  const [authed, setAuthed] = useState(() => sessionStorage.getItem('admin_authed') === 'true')`;

if (!content.includes(oldAuthed)) {
  console.log('ERROR: authed stateが見つかりません');
  // 近い行を探す
  const lines = content.split('\n');
  lines.forEach((l, i) => {
    if (l.includes('authed')) console.log((i+1) + ': ' + l.trim());
  });
  process.exit(1);
}
content = content.replace(oldAuthed, newAuthed);
console.log('✓ authed stateをsessionStorage対応に変更');

// 2. ログイン成功時にsessionStorageに保存
const oldSetAuthed = `setAuthed(true)`;
const newSetAuthed = `setAuthed(true); sessionStorage.setItem('admin_authed', 'true')`;

if (!content.includes(oldSetAuthed)) {
  console.log('ERROR: setAuthed(true)が見つかりません');
  process.exit(1);
}
content = content.replace(oldSetAuthed, newSetAuthed);
console.log('✓ ログイン成功時にsessionStorageに保存');

// 3. ログアウト時にsessionStorageを削除
const oldLogout = `setAuthed(false)`;
const newLogout = `setAuthed(false); sessionStorage.removeItem('admin_authed')`;

if (!content.includes(oldLogout)) {
  console.log('ERROR: setAuthed(false)が見つかりません');
  process.exit(1);
}
content = content.replace(oldLogout, newLogout);
console.log('✓ ログアウト時にsessionStorageを削除');

fs.writeFileSync(filePath, content, 'utf8');
console.log('SUCCESS: セッション保持機能を追加しました！');
