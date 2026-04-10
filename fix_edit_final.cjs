const fs = require('fs');

const filePath = 'src/AgencyDashboard.jsx';
const raw = fs.readFileSync(filePath, 'utf8');
const content = raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

let newContent = content;

// 1. addressフィールド行を削除
newContent = newContent.replace(
  `              { key: 'address', label: '\u6240\u5728\u5730 *', type: 'text' },\n`,
  ``
);

// 2. management_feeフィールド行を削除
newContent = newContent.replace(
  `              { key: 'management_fee', label: '\u7ba1\u7406\u8cbb\uff08\u5186/\u6708\uff09', type: 'number' },\n`,
  ``
);

// 3. remarksフィールド行を削除
newContent = newContent.replace(
  `              { key: 'remarks', label: '\u5099\u8003', type: 'textarea' },\n`,
  ``
);

// 4. 「賞料」→「賃料」修正
newContent = newContent.replace(
  `{ key: 'rent', label: '\u8cde\u6599\uff08\u5186/\u6708\uff09 ', type: 'number' }`,
  `{ key: 'rent', label: '\u8cbc\u6599\uff08\u5186/\u6708\uff09', type: 'number' }`
);
// 念のため賞料を直接置換
newContent = newContent.replace(/賞料/g, '賃料');

// 5. update処理からaddress・management_fee・remarksを削除
newContent = newContent.replace(
  ` address: editForm.address, management_fee: editForm.management_fee ? Number(editForm.management_fee) : null, remarks: editForm.remarks || '',`,
  ``
);
// address単独パターンも対応
newContent = newContent.replace(
  ` address: editForm.address,`,
  ``
);

// 6. 必須チェックからaddressを削除
newContent = newContent.replace(
  `if (!editForm.title || !editForm.address) { setEditMsg('\u274c \u7269\u4ef6\u540d\u3068\u6240\u5728\u5730\u306f\u5fc5\u9808\u3067\u3059'); return }`,
  `if (!editForm.title) { setEditMsg('\u274c \u7269\u4ef6\u540d\u306f\u5fc5\u9808\u3067\u3059'); return }`
);

fs.writeFileSync(filePath, newContent, 'utf8');
console.log('SUCCESS: 編集フォームを修正しました');
console.log('  - address・管理費・備考フィールドを削除');
console.log('  - 賞料→賃料の誤字修正');
console.log('  - update処理とバリデーションを修正');
