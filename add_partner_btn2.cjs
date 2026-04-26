const fs = require('fs');
const path = 'src/AdminDashboard.jsx';
let content = fs.readFileSync(path, 'utf8');

// 681行目の広告バナーボタンの後にパートナー業者ボタンを追加
// setActiveSection('ads') を含む行の後に追加
const lines = content.split('\n');
let targetIdx = -1;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("setActiveSection('ads')") && lines[i].includes('button')) {
    targetIdx = i;
    break;
  }
}

if (targetIdx === -1) {
  console.log('⚠️ 広告バナーボタンが見つかりませんでした。');
  process.exit(1);
}

console.log(`✓ ${targetIdx + 1}行目に広告バナーボタンを発見`);

// 既にパートナーボタンがないか確認
if (lines[targetIdx + 1] && lines[targetIdx + 1].includes('パートナー')) {
  console.log('⚠️ パートナーボタンは既に存在します。');
  process.exit(0);
}

// 広告バナーボタンの行のインデントを取得
const indent = lines[targetIdx].match(/^(\s*)/)[1];

// パートナーボタンを挿入
const partnerBtn = `${indent}<button style={btnStyle(activeSection==='パートナー')} onClick={() => setActiveSection('パートナー')}>👥パートナー業者</button>`;
lines.splice(targetIdx + 1, 0, partnerBtn);

fs.writeFileSync(path, lines.join('\n'), 'utf8');
console.log('✅ パートナー業者ボタンを追加しました！次は npm run build を実行してください。');
