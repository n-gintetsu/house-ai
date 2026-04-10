const fs = require('fs');

const filePath = 'src/AgencyDashboard.jsx';
const raw = fs.readFileSync(filePath, 'utf8');
let content = raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

// management_feeへの参照を全て削除
const before = content;

// update処理内のmanagement_fee部分を削除（様々なパターンに対応）
content = content.replace(/, management_fee: editForm\.management_fee \? Number\(editForm\.management_fee\) : null/g, '');
content = content.replace(/management_fee: editForm\.management_fee \? Number\(editForm\.management_fee\) : null,? ?/g, '');

// フィールド定義内のmanagement_fee行を削除
content = content.replace(/.*key: 'management_fee'.*\n/g, '');

// remarksへの参照も削除
content = content.replace(/, remarks: editForm\.remarks \|\| ''/g, '');
content = content.replace(/remarks: editForm\.remarks \|\| '',? ?/g, '');
content = content.replace(/.*key: 'remarks'.*\n/g, '');

if (content === before) {
  console.log('WARNING: 変更箇所が見つかりませんでした');
} else {
  console.log('✓ management_fee・remarks への参照を削除しました');
}

// update処理の中身を確認
const updateIdx = content.indexOf("supabase.from('agency_properties').update(");
if (updateIdx !== -1) {
  console.log('現在のupdate処理:', content.substring(updateIdx, updateIdx + 300));
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('SUCCESS: ファイルを保存しました');
