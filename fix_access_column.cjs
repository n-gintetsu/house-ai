const fs = require('fs');

const filePath = 'src/AgencyDashboard.jsx';
const raw = fs.readFileSync(filePath, 'utf8');
const content = raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

// access カラムへの参照を2箇所修正

// 1. フォームのフィールド定義から access を削除
const oldField = `                { key: 'access', label: '交通・アクセス', type: 'text' },\n`;
const newField = ``;

// 2. supabaseのupdateからaccess を削除
const oldUpdate = ` address: editForm.address, access: editForm.access || '',`;
const newUpdate = ` address: editForm.address,`;

let newContent = content;

if (!newContent.includes(oldField)) {
  console.log('ERROR: accessフィールド定義が見つかりません');
  process.exit(1);
}
newContent = newContent.replace(oldField, newField);
console.log('✓ accessフィールド定義を削除');

if (!newContent.includes(oldUpdate)) {
  console.log('ERROR: accessカラムのupdate行が見つかりません');
  process.exit(1);
}
newContent = newContent.replace(oldUpdate, newUpdate);
console.log('✓ accessカラムのupdateを削除');

fs.writeFileSync(filePath, newContent, 'utf8');
console.log('SUCCESS: accessカラムへの参照を削除しました');
