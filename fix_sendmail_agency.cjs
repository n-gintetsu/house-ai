const fs = require('fs');

let content = fs.readFileSync('api/sendmail.js', 'utf8');

// subjectsオブジェクトにagencyを追加
const oldExpert = "expert:";
const searchStr = content.includes("expert:") ? true : false;

if (!searchStr) {
  console.log('ERROR: sendmail.js の構造が想定と異なります');
  process.exit(1);
}

// expertの行を見つけてその後にagencyを追加
content = content.replace(
  /expert:\s*['"`][^'"`]*['"`]/,
  match => match + ",\n    agency: '【業者登録申請】新規業者様からの登録申請があります'"
);

if (content.includes('agency:')) {
  console.log('SUCCESS: agency メール件名を追加しました');
} else {
  console.log('WARNING: 追加できませんでした。手動で確認してください');
}

fs.writeFileSync('api/sendmail.js', content, 'utf8');
console.log('SUCCESS: api/sendmail.js を更新しました');
