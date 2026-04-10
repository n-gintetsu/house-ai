const fs = require('fs');

const filePath = 'src/AgencyDashboard.jsx';
const raw = fs.readFileSync(filePath, 'utf8');
const content = raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

// 古いフィールド定義を新しいものに置換
const oldFields = `              {[
                { key: 'title', label: '物件名 *', type: 'text' },
                { key: 'catchcopy', label: 'キャッチコピー', type: 'text' },
                { key: 'price', label: '売買価格（円）', type: 'number' },
                { key: 'rent', label: '賃料（円/月）', type: 'number' },
                { key: 'address', label: '所在地 *', type: 'text' },
                { key: 'management_fee', label: '管理費（円/月）', type: 'number' },
                { key: 'remarks', label: '備考', type: 'textarea' },
              ].map(function(field) {`;

const newFields = `              {[
                { key: 'title', label: '物件名 *', type: 'text' },
                { key: 'catchcopy', label: 'キャッチコピー', type: 'text' },
                { key: 'price', label: '売買価格（円）', type: 'number' },
                { key: 'rent', label: '賃料（円/月）', type: 'number' },
              ].map(function(field) {`;

// 古いupdate処理を新しいものに置換
const oldUpdate = `                  var result = await supabase.from('agency_properties').update({ title: editForm.title, catchcopy: editForm.catchcopy || '', price: editForm.price ? Number(editForm.price) : null, rent: editForm.rent ? Number(editForm.rent) : null, address: editForm.address, management_fee: editForm.management_fee ? Number(editForm.management_fee) : null, remarks: editForm.remarks || '' }).eq('id', editingProperty.id)`;

const newUpdate = `                  var result = await supabase.from('agency_properties').update({ title: editForm.title, catchcopy: editForm.catchcopy || '', price: editForm.price ? Number(editForm.price) : null, rent: editForm.rent ? Number(editForm.rent) : null }).eq('id', editingProperty.id)`;

// 必須チェックも修正（addressを除く）
const oldCheck = `                  if (!editForm.title || !editForm.address) { setEditMsg('\u274c 物件名と所在地は必須です'); return }`;
const newCheck = `                  if (!editForm.title) { setEditMsg('\u274c 物件名は必須です'); return }`;

// 「賞料」→「賃料」の誤字修正
const oldLabel = `                { key: 'rent', label: '\u8cde\u6599\uff08\u5186/\u6708\uff09', type: 'number' },`;
// ※ newFieldsに既に正しく「賃料」で書いているのでここは不要

let newContent = content;

if (!newContent.includes(oldFields)) {
  console.log('ERROR: フィールド定義が見つかりません');
  // デバッグ
  const idx = newContent.indexOf('{ key: \'title\', label: \'物件名');
  console.log('title周辺:', newContent.substring(idx - 50, idx + 200));
  process.exit(1);
}
newContent = newContent.replace(oldFields, newFields);
console.log('✓ フィールド定義を修正（address・管理費・備考を削除）');

if (!newContent.includes(oldUpdate)) {
  console.log('ERROR: update処理が見つかりません');
  process.exit(1);
}
newContent = newContent.replace(oldUpdate, newUpdate);
console.log('✓ update処理を修正');

if (!newContent.includes(oldCheck)) {
  console.log('ERROR: 必須チェックが見つかりません');
  process.exit(1);
}
newContent = newContent.replace(oldCheck, newCheck);
console.log('✓ 必須チェックを修正');

// 「賞料」→「賃料」修正（フォームラベル内）
if (newContent.includes('\u8cde\u6599\uff08\u5186/\u6708\uff09')) {
  console.log('✓ 賃料ラベルは正しく設定済み');
} else if (newContent.includes('\u8cde\u6599\uff08\u5186/\u6708\uff09')) {
  newContent = newContent.replace(/賞料/g, '賃料');
  console.log('✓ 賞料→賃料の誤字修正');
}

fs.writeFileSync(filePath, newContent, 'utf8');
console.log('SUCCESS: 編集フォームを実際のカラムに合わせて修正しました');
