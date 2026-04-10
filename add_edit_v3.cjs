const fs = require('fs');

const filePath = 'src/AgencyDashboard.jsx';
const raw = fs.readFileSync(filePath, 'utf8');
// \r\n → \n に統一して処理
const content = raw.replace(/\r\n/g, '\n');

// ① screen stateのコメント更新（スペース2個インデント）
const oldScreenComment = `  const [screen, setScreen] = useState('menu') // menu | sale | rent | form | list`;
const newScreenComment = `  const [screen, setScreen] = useState('menu') // menu | sale | rent | form | list | edit`;

// ② submitMsg stateの後にedit statesを追加
const oldState = `  const [submitMsg, setSubmitMsg] = useState('')`;
const newState = `  const [submitMsg, setSubmitMsg] = useState('')
  const [editingProperty, setEditingProperty] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [editMsg, setEditMsg] = useState('')`;

// ③ 削除ボタンの前に編集ボタンを追加
const oldDeleteBtn = `                      <button onClick={() => deleteProperty(p.id)} style={{ padding: '5px 12px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, cursor: 'pointer' }}>削除</button>`;
const newDeleteBtn = `                      <button onClick={() => { setEditingProperty(p); setEditForm(Object.assign({}, p)); setScreen('edit'); setEditMsg('') }} style={{ padding: '5px 12px', background: '#0ea5e9', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, cursor: 'pointer' }}>\u270f\ufe0f 編集</button>
                      <button onClick={() => deleteProperty(p.id)} style={{ padding: '5px 12px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, cursor: 'pointer' }}>削除</button>`;

// ④ 編集フォームスクリーン（JSXのreturnの最後の </div> の前に挿入）
const editScreenJSX = `
        {/* 物件編集フォーム */}
        {screen === 'edit' && editingProperty && (
          <div>
            <button onClick={() => setScreen('list')} style={{ marginBottom: 16, background: 'none', border: 'none', color: '#1a3a5c', cursor: 'pointer', fontSize: 13 }}>\u2190 物件一覧に戻る</button>
            <h2 style={{ color: '#1a3a5c', fontSize: 20, marginBottom: 20 }}>\u270f\ufe0f 物件編集：{editingProperty.title}</h2>
            <div style={{ background: '#fff', borderRadius: 14, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              {[
                { key: 'title', label: '物件名 *', type: 'text' },
                { key: 'catchcopy', label: 'キャッチコピー', type: 'text' },
                { key: 'price', label: '売買価格（円）', type: 'number' },
                { key: 'rent', label: '賃料（円/月）', type: 'number' },
                { key: 'address', label: '所在地 *', type: 'text' },
                { key: 'access', label: '交通・アクセス', type: 'text' },
                { key: 'management_fee', label: '管理費（円/月）', type: 'number' },
                { key: 'remarks', label: '備考', type: 'textarea' },
              ].map(function(field) {
                return (
                  <div key={field.key} style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#1a3a5c', marginBottom: 4 }}>{field.label}</label>
                    {field.type === 'textarea' ? (
                      <textarea
                        value={editForm[field.key] || ''}
                        onChange={function(e) { var v = e.target.value; setEditForm(function(f) { return Object.assign({}, f, { [field.key]: v }) }) }}
                        rows={3}
                        style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13, boxSizing: 'border-box', resize: 'vertical' }}
                      />
                    ) : (
                      <input
                        type={field.type}
                        value={editForm[field.key] || ''}
                        onChange={function(e) { var v = e.target.value; setEditForm(function(f) { return Object.assign({}, f, { [field.key]: v }) }) }}
                        style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13, boxSizing: 'border-box' }}
                      />
                    )}
                  </div>
                )
              })}
              {editMsg && (
                <div style={{ padding: '10px 16px', borderRadius: 8, background: editMsg.startsWith('\u2705') ? '#dcfce7' : '#fee2e2', color: editMsg.startsWith('\u2705') ? '#16a34a' : '#dc2626', marginBottom: 16, fontSize: 13 }}>{editMsg}</div>
              )}
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button onClick={function() { setScreen('list') }} style={{ padding: '10px 24px', background: '#f1f5f9', color: '#555', border: 'none', borderRadius: 8, fontSize: 13, cursor: 'pointer' }}>キャンセル</button>
                <button onClick={async function() {
                  if (!editForm.title || !editForm.address) { setEditMsg('\u274c 物件名と所在地は必須です'); return }
                  var result = await supabase.from('agency_properties').update({
                    title: editForm.title,
                    catchcopy: editForm.catchcopy || '',
                    price: editForm.price ? Number(editForm.price) : null,
                    rent: editForm.rent ? Number(editForm.rent) : null,
                    address: editForm.address,
                    access: editForm.access || '',
                    management_fee: editForm.management_fee ? Number(editForm.management_fee) : null,
                    remarks: editForm.remarks || '',
                  }).eq('id', editingProperty.id)
                  if (result.error) { setEditMsg('\u274c 更新失敗: ' + result.error.message); return }
                  setEditMsg('\u2705 更新しました！')
                  await loadMyProperties()
                }} style={{ padding: '10px 24px', background: '#1a3a5c', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, cursor: 'pointer', fontWeight: 700 }}>\ud83d\udcbe 保存する</button>
              </div>
            </div>
          </div>
        )}`;

// 変更を適用
let newContent = content;

// 1. screenコメント更新
if (!newContent.includes(oldScreenComment)) {
  console.log('ERROR: screen state行が見つかりません');
  console.log('実際の行:', newContent.split('\n')[323]);
  process.exit(1);
}
newContent = newContent.replace(oldScreenComment, newScreenComment);
console.log('✓ screen stateコメント更新');

// 2. state追加
if (!newContent.includes(oldState)) {
  console.log('ERROR: submitMsg state行が見つかりません');
  process.exit(1);
}
newContent = newContent.replace(oldState, newState);
console.log('✓ edit states追加');

// 3. 編集ボタン追加
if (!newContent.includes(oldDeleteBtn)) {
  console.log('ERROR: 削除ボタン行が見つかりません');
  // デバッグ用に近い行を表示
  const lines = newContent.split('\n');
  lines.forEach((l, i) => {
    if (l.includes('deleteProperty')) console.log(`行${i+1}: ${l}`);
  });
  process.exit(1);
}
newContent = newContent.replace(oldDeleteBtn, newDeleteBtn);
console.log('✓ 編集ボタン追加');

// 4. 編集フォームをreturnの最後の </div> の前に挿入
// 「      </div>\n    )\n}」のパターンを探す
const returnEnd = `      </div>\n    )\n}`;
const returnEndIdx = newContent.lastIndexOf(returnEnd);
if (returnEndIdx === -1) {
  console.log('ERROR: return終わりパターンが見つかりません');
  process.exit(1);
}
const insertPos = returnEndIdx + `      </div>`.length;
newContent = newContent.slice(0, insertPos) + '\n' + editScreenJSX + '\n' + newContent.slice(insertPos);
console.log('✓ 編集フォームスクリーン追加');

fs.writeFileSync(filePath, newContent, 'utf8');
console.log('SUCCESS: AgencyDashboardに物件編集機能を追加しました！');
