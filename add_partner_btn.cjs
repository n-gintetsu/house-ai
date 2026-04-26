const fs = require('fs');

const filePath = 'src/AdminDashboard.jsx';
const raw = fs.readFileSync(filePath, 'utf8');
const content = raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

// 広告バナーボタンの行を探して後ろにパートナー業者ボタンを追加
const lines = content.split('\n');
let btnLineIdx = -1;
lines.forEach((l, i) => {
  if (l.includes("setActiveSection('ads')") && l.includes('広告バナー')) btnLineIdx = i;
});

if (btnLineIdx === -1) {
  // 英語で探してみる
  lines.forEach((l, i) => {
    if (l.includes("setActiveSection('ads')")) {
      console.log('見つかった行: ' + (i+1) + ': ' + l.trim());
      btnLineIdx = i;
    }
  });
}

if (btnLineIdx === -1) {
  console.log('ERROR: 広告バナーボタン行が見つかりません');
  // ボタン周辺を表示
  lines.forEach((l, i) => {
    if (l.includes('activeSection') && l.includes('button')) {
      console.log((i+1) + ': ' + l.trim());
    }
  });
  process.exit(1);
}

console.log('広告バナーボタン行: ' + (btnLineIdx+1) + ': ' + lines[btnLineIdx].trim());

// すでにパートナーボタンがあれば追加しない
const alreadyHasPartner = lines.some(l => l.includes("setActiveSection('パートナー')"));
if (alreadyHasPartner) {
  console.log('パートナーボタンは既に存在します');
  process.exit(0);
}

const indent = lines[btnLineIdx].match(/^(\s*)/)[1];
lines.splice(btnLineIdx + 1, 0, `${indent}<button style={btnStyle(activeSection==='\u30d1\u30fc\u30c8\u30ca\u30fc')} onClick={() => setActiveSection('\u30d1\u30fc\u30c8\u30ca\u30fc')}>\ud83d\udc65 \u30d1\u30fc\u30c8\u30ca\u30fc\u696d\u8005</button>`);

fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
console.log('SUCCESS: パートナー業者ボタンを追加しました！');
