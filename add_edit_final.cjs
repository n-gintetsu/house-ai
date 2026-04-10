const fs = require('fs');

const filePath = 'src/AgencyDashboard.jsx';
const raw = fs.readFileSync(filePath, 'utf8');
const content = raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
const lines = content.split('\n');

// ① screen stateにedit追加（324行目 = index 323）
lines[323] = lines[323].replace(
  "// menu | sale | rent | form | list",
  "// menu | sale | rent | form | list | edit"
);

// ② submitMsg stateの後にedit states追加（330行目 = index 329）
lines[329] = lines[329] + '\n  const [editingProperty, setEditingProperty] = useState(null)\n  const [editForm, setEditForm] = useState({})\n  const [editMsg, setEditMsg] = useState(\'\')';

// ③ 削除ボタンの前に編集ボタン追加（709行目 = index 708）
lines[708] = '                      <button onClick={() => { setEditingProperty(p); setEditForm(Object.assign({}, p)); setScreen(\'edit\'); setEditMsg(\'\') }} style={{ padding: \'5px 12px\', background: \'#0ea5e9\', color: \'#fff\', border: \'none\', borderRadius: 8, fontSize: 12, cursor: \'pointer\' }}>\u270f\ufe0f \u7de8\u96c6</button>\n' + lines[708];

// ④ 編集フォームスクリーンを717行目（</div>）の後、718行目（    </div>）の前に挿入
// 716行目 = index 715 が )}  、717行目 = index 716 が      </div>
// 718行目 = index 717 が    </div>  ← ここの前に挿入

const editScreenLines = [
  '',
  '        {/* \u7269\u4ef6\u7de8\u96c6\u30d5\u30a9\u30fc\u30e0 */}',
  '        {screen === \'edit\' && editingProperty && (',
  '          <div>',
  '            <button onClick={() => setScreen(\'list\')} style={{ marginBottom: 16, background: \'none\', border: \'none\', color: \'#1a3a5c\', cursor: \'pointer\', fontSize: 13 }}>\u2190 \u7269\u4ef6\u4e00\u89a7\u306b\u623b\u308b</button>',
  '            <h2 style={{ color: \'#1a3a5c\', fontSize: 20, marginBottom: 20 }}>\u270f\ufe0f \u7269\u4ef6\u7de8\u96c6\uff1a{editingProperty.title}</h2>',
  '            <div style={{ background: \'#fff\', borderRadius: 14, padding: 24, boxShadow: \'0 2px 8px rgba(0,0,0,0.06)\' }}>',
  '              {[',
  '                { key: \'title\', label: \'\u7269\u4ef6\u540d *\', type: \'text\' },',
  '                { key: \'catchcopy\', label: \'\u30ad\u30e3\u30c3\u30c1\u30b3\u30d4\u30fc\', type: \'text\' },',
  '                { key: \'price\', label: \'\u58f2\u8cb7\u4fa1\u683c\uff08\u5186\uff09\', type: \'number\' },',
  '                { key: \'rent\', label: \'\u8cde\u6599\uff08\u5186/\u6708\uff09\', type: \'number\' },',
  '                { key: \'address\', label: \'\u6240\u5728\u5730 *\', type: \'text\' },',
  '                { key: \'access\', label: \'\u4ea4\u901a\u30fb\u30a2\u30af\u30bb\u30b9\', type: \'text\' },',
  '                { key: \'management_fee\', label: \'\u7ba1\u7406\u8cbb\uff08\u5186/\u6708\uff09\', type: \'number\' },',
  '                { key: \'remarks\', label: \'\u5099\u8003\', type: \'textarea\' },',
  '              ].map(function(field) {',
  '                return (',
  '                  <div key={field.key} style={{ marginBottom: 16 }}>',
  '                    <label style={{ display: \'block\', fontSize: 12, fontWeight: 700, color: \'#1a3a5c\', marginBottom: 4 }}>{field.label}</label>',
  '                    {field.type === \'textarea\' ? (',
  '                      <textarea value={editForm[field.key] || \'\'} onChange={function(e) { var v = e.target.value; setEditForm(function(f) { return Object.assign({}, f, { [field.key]: v }) }) }} rows={3} style={{ width: \'100%\', padding: \'8px 12px\', border: \'1px solid #e2e8f0\', borderRadius: 8, fontSize: 13, boxSizing: \'border-box\', resize: \'vertical\' }} />',
  '                    ) : (',
  '                      <input type={field.type} value={editForm[field.key] || \'\'} onChange={function(e) { var v = e.target.value; setEditForm(function(f) { return Object.assign({}, f, { [field.key]: v }) }) }} style={{ width: \'100%\', padding: \'8px 12px\', border: \'1px solid #e2e8f0\', borderRadius: 8, fontSize: 13, boxSizing: \'border-box\' }} />',
  '                    )}',
  '                  </div>',
  '                )',
  '              })}',
  '              {editMsg && (',
  '                <div style={{ padding: \'10px 16px\', borderRadius: 8, background: editMsg.startsWith(\'\u2705\') ? \'#dcfce7\' : \'#fee2e2\', color: editMsg.startsWith(\'\u2705\') ? \'#16a34a\' : \'#dc2626\', marginBottom: 16, fontSize: 13 }}>{editMsg}</div>',
  '              )}',
  '              <div style={{ display: \'flex\', gap: 12, justifyContent: \'flex-end\' }}>',
  '                <button onClick={function() { setScreen(\'list\') }} style={{ padding: \'10px 24px\', background: \'#f1f5f9\', color: \'#555\', border: \'none\', borderRadius: 8, fontSize: 13, cursor: \'pointer\' }}>\u30ad\u30e3\u30f3\u30bb\u30eb</button>',
  '                <button onClick={async function() {',
  '                  if (!editForm.title || !editForm.address) { setEditMsg(\'\u274c \u7269\u4ef6\u540d\u3068\u6240\u5728\u5730\u306f\u5fc5\u9808\u3067\u3059\'); return }',
  '                  var result = await supabase.from(\'agency_properties\').update({ title: editForm.title, catchcopy: editForm.catchcopy || \'\', price: editForm.price ? Number(editForm.price) : null, rent: editForm.rent ? Number(editForm.rent) : null, address: editForm.address, access: editForm.access || \'\', management_fee: editForm.management_fee ? Number(editForm.management_fee) : null, remarks: editForm.remarks || \'\' }).eq(\'id\', editingProperty.id)',
  '                  if (result.error) { setEditMsg(\'\u274c \u66f4\u65b0\u5931\u6557: \' + result.error.message); return }',
  '                  setEditMsg(\'\u2705 \u66f4\u65b0\u3057\u307e\u3057\u305f\uff01\')',
  '                  await loadMyProperties()',
  '                }} style={{ padding: \'10px 24px\', background: \'#1a3a5c\', color: \'#fff\', border: \'none\', borderRadius: 8, fontSize: 13, cursor: \'pointer\', fontWeight: 700 }}>\ud83d\udcbe \u4fdd\u5b58\u3059\u308b</button>',
  '              </div>',
  '            </div>',
  '          </div>',
  '        )}',
];

// 717行目（index 716）の後に挿入 → spliceで716と717の間に入れる
lines.splice(717, 0, ...editScreenLines);

fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
console.log('SUCCESS: 物件編集機能を追加しました！');
console.log('  - ✏️ 編集ボタン追加');
console.log('  - 編集フォームスクリーン追加');
console.log('  - Supabase更新処理実装');
