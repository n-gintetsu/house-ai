const fs = require('fs');

const filePath = 'src/AgencyDashboard.jsx';
const content = fs.readFileSync(filePath, 'utf8');

// ① stateの追加: [submitMsg, setSubmitMsg] の行の直後に追加
const oldState = `\tconst [submitMsg, setSubmitMsg] = useState('')`;
const newState = `\tconst [submitMsg, setSubmitMsg] = useState('')
\tconst [editingProperty, setEditingProperty] = useState(null)
\tconst [editForm, setEditForm] = useState({})
\tconst [editMsg, setEditMsg] = useState('')`;

// ② screenのコメントを更新
const oldScreenComment = `\tconst [screen, setScreen] = useState('menu') // menu | sale | rent | form | list`;
const newScreenComment = `\tconst [screen, setScreen] = useState('menu') // menu | sale | rent | form | list | edit`;

// ③ 削除ボタンの行を探して編集ボタンを前に追加
const oldDeleteBtn = `\t\t\t\t\t\t<button onClick={() => deleteProperty(p.id)} style={{ padding: '5px 12px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, cursor: 'pointer' }}>削除</button>`;
const newDeleteBtn = `\t\t\t\t\t\t<button onClick={() => { setEditingProperty(p); setEditForm({...p}); setScreen('edit'); setEditMsg('') }} style={{ padding: '5px 12px', background: '#0ea5e9', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, cursor: 'pointer' }}>\u270f\ufe0f 編集</button>
\t\t\t\t\t\t<button onClick={() => deleteProperty(p.id)} style={{ padding: '5px 12px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, cursor: 'pointer' }}>削除</button>`;

// ④ 編集フォームスクリーンを末尾の } の直前に追加
const editScreenJSX = `
\t\t{/* 物件編集フォーム */}
\t\t{screen === 'edit' && editingProperty && (
\t\t\t<div>
\t\t\t\t<button onClick={() => setScreen('list')} style={{ marginBottom: 16, background: 'none', border: 'none', color: '#1a3a5c', cursor: 'pointer', fontSize: 13 }}>\u2190 物件一覧に戻る</button>
\t\t\t\t<h2 style={{ color: '#1a3a5c', fontSize: 20, marginBottom: 20 }}>\u270f\ufe0f 物件編集：{editingProperty.title}</h2>
\t\t\t\t<div style={{ background: '#fff', borderRadius: 14, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
\t\t\t\t\t{[
\t\t\t\t\t\t{ key: 'title', label: '物件名 *', type: 'text' },
\t\t\t\t\t\t{ key: 'catchcopy', label: 'キャッチコピー', type: 'text' },
\t\t\t\t\t\t{ key: 'price', label: '売買価格（円）', type: 'number' },
\t\t\t\t\t\t{ key: 'rent', label: '賃料（円/月）', type: 'number' },
\t\t\t\t\t\t{ key: 'address', label: '所在地 *', type: 'text' },
\t\t\t\t\t\t{ key: 'access', label: '交通・アクセス', type: 'text' },
\t\t\t\t\t\t{ key: 'floor_plan', label: '間取り', type: 'text' },
\t\t\t\t\t\t{ key: 'management_fee', label: '管理費（円/月）', type: 'number' },
\t\t\t\t\t\t{ key: 'remarks', label: '備考', type: 'textarea' },
\t\t\t\t\t].map(function(field) {
\t\t\t\t\t\treturn (
\t\t\t\t\t\t\t<div key={field.key} style={{ marginBottom: 16 }}>
\t\t\t\t\t\t\t\t<label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#1a3a5c', marginBottom: 4 }}>{field.label}</label>
\t\t\t\t\t\t\t\t{field.type === 'textarea' ? (
\t\t\t\t\t\t\t\t\t<textarea
\t\t\t\t\t\t\t\t\t\tvalue={editForm[field.key] || ''}
\t\t\t\t\t\t\t\t\t\tonChange={function(e) { setEditForm(function(f) { var n = Object.assign({}, f); n[field.key] = e.target.value; return n; }) }}
\t\t\t\t\t\t\t\t\t\trows={3}
\t\t\t\t\t\t\t\t\t\tstyle={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13, boxSizing: 'border-box', resize: 'vertical' }}
\t\t\t\t\t\t\t\t\t/>
\t\t\t\t\t\t\t\t) : (
\t\t\t\t\t\t\t\t\t<input
\t\t\t\t\t\t\t\t\t\ttype={field.type}
\t\t\t\t\t\t\t\t\t\tvalue={editForm[field.key] || ''}
\t\t\t\t\t\t\t\t\t\tonChange={function(e) { setEditForm(function(f) { var n = Object.assign({}, f); n[field.key] = e.target.value; return n; }) }}
\t\t\t\t\t\t\t\t\t\tstyle={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13, boxSizing: 'border-box' }}
\t\t\t\t\t\t\t\t\t/>
\t\t\t\t\t\t\t\t)}
\t\t\t\t\t\t\t</div>
\t\t\t\t\t\t)
\t\t\t\t\t})}
\t\t\t\t\t{editMsg && (
\t\t\t\t\t\t<div style={{ padding: '10px 16px', borderRadius: 8, background: editMsg.startsWith('\u2705') ? '#dcfce7' : '#fee2e2', color: editMsg.startsWith('\u2705') ? '#16a34a' : '#dc2626', marginBottom: 16, fontSize: 13 }}>{editMsg}</div>
\t\t\t\t\t)}
\t\t\t\t\t<div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
\t\t\t\t\t\t<button onClick={function() { setScreen('list') }} style={{ padding: '10px 24px', background: '#f1f5f9', color: '#555', border: 'none', borderRadius: 8, fontSize: 13, cursor: 'pointer' }}>キャンセル</button>
\t\t\t\t\t\t<button onClick={async function() {
\t\t\t\t\t\t\tif (!editForm.title || !editForm.address) { setEditMsg('\u274c 物件名と所在地は必須です'); return; }
\t\t\t\t\t\t\tvar updateData = {
\t\t\t\t\t\t\t\ttitle: editForm.title,
\t\t\t\t\t\t\t\tcatchcopy: editForm.catchcopy || '',
\t\t\t\t\t\t\t\tprice: editForm.price ? Number(editForm.price) : null,
\t\t\t\t\t\t\t\trent: editForm.rent ? Number(editForm.rent) : null,
\t\t\t\t\t\t\t\taddress: editForm.address,
\t\t\t\t\t\t\t\taccess: editForm.access || '',
\t\t\t\t\t\t\t\tmanagement_fee: editForm.management_fee ? Number(editForm.management_fee) : null,
\t\t\t\t\t\t\t\tremarks: editForm.remarks || '',
\t\t\t\t\t\t\t};
\t\t\t\t\t\t\tvar result = await supabase.from('agency_properties').update(updateData).eq('id', editingProperty.id);
\t\t\t\t\t\t\tif (result.error) { setEditMsg('\u274c 更新に失敗しました: ' + result.error.message); return; }
\t\t\t\t\t\t\tsetEditMsg('\u2705 物件情報を更新しました！');
\t\t\t\t\t\t\tawait loadMyProperties();
\t\t\t\t\t\t}} style={{ padding: '10px 24px', background: '#1a3a5c', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, cursor: 'pointer', fontWeight: 700 }}>\ud83d\udcbe 保存する</button>
\t\t\t\t\t</div>
\t\t\t\t</div>
\t\t\t</div>
\t\t)}`;

// 変更を適用
let newContent = content;

// 1. screenコメント更新
if (!newContent.includes(oldScreenComment)) {
  console.log('ERROR: screen state行が見つかりません');
  process.exit(1);
}
newContent = newContent.replace(oldScreenComment, newScreenComment);

// 2. state追加
if (!newContent.includes(oldState)) {
  console.log('ERROR: submitMsg state行が見つかりません');
  process.exit(1);
}
newContent = newContent.replace(oldState, newState);

// 3. 編集ボタン追加
if (!newContent.includes(oldDeleteBtn)) {
  console.log('ERROR: 削除ボタン行が見つかりません');
  process.exit(1);
}
newContent = newContent.replace(oldDeleteBtn, newDeleteBtn);

// 4. 編集フォームスクリーンを末尾のexport関数の最後の } 直前に追加
// ファイルの最後の }  を探す
const lastBraceIdx = newContent.lastIndexOf('\n}');
if (lastBraceIdx === -1) {
  console.log('ERROR: ファイル末尾が見つかりません');
  process.exit(1);
}

// 最後の } の直前に編集スクリーンを挿入
// ただし、JSXのreturn内の最後の </div> の後に入れる必要がある
// 「\t\t</div>\n\t)\n}」のパターンを探す
const returnEndPattern = `\t\t</div>\n\t)\n}`;
const returnEndIdx = newContent.lastIndexOf(returnEndPattern);
if (returnEndIdx === -1) {
  console.log('ERROR: return終わりパターンが見つかりません');
  process.exit(1);
}

const insertPos = returnEndIdx + `\t\t</div>`.length;
newContent = newContent.slice(0, insertPos) + '\n' + editScreenJSX + '\n' + newContent.slice(insertPos);

fs.writeFileSync(filePath, newContent, 'utf8');
console.log('SUCCESS: AgencyDashboardに物件編集機能を追加しました');
