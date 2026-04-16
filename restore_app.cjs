const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, 'src', 'App.jsx');
const backupPath = path.join(__dirname, 'src', 'App.jsx.backup');

if (!fs.existsSync(backupPath)) {
  console.log('ERROR: バックアップファイル（App.jsx.backup）が見つかりません');
  process.exit(1);
}

fs.copyFileSync(backupPath, appPath);
fs.unlinkSync(backupPath);
console.log('✓ App.jsxをバックアップから復元しました');
console.log('SUCCESS: メンテナンスモードを解除しました！');
