const fs = require('fs');

const filePath = 'src/AgencyDashboard.jsx';
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

// ① stateの追加：editingProperty と editForm を追加
// setScreen の定義行を探してその後に追加
// 330行目付近のuseStateをまとめて確認して追加

// editingProperty stateを追加（screen stateの近くに挿入）
// 「const [screen, setScreen]」の行を探す
let screenLineIdx = -1;
lines.forEach((l, i) => {
  if (l.includes('const [screen, setScreen]')) screenLineIdx = i;
});

if (screenLineIdx === -1) {
  console.log('ERROR: screen stateが見つかりませんでした');
  process.exit(1);
}

// ② 編集ボタンを物件一覧カードに追加（709行目の削除ボタンの前）
// 削除ボタンの行を特定
let deleteLineIdx = -1;
lines.forEach((l, i) => {
  if (l.includes("onClick={() => deleteProperty(p.id)")) deleteLineIdx = i;
});

if (deleteLineIdx === -1) {
  console.log('ERROR: 削除ボタンが見つかりませんでした');
  process.exit(1);
}

// ③ editingProperty stateと編集フォームのスクリーン追加
// screen === 'list' の終わり（716行目）の直前に編集フォームを追加
let listEndIdx = -1;
lines.forEach((l, i) => {
  if (l.includes("screen === 'list' && (")) listEndIdx = i;
});

console.log(`screen state: ${screenLineIdx + 1}行目`);
console.log(`削除ボタン: ${deleteLineIdx + 1}行目`);
console.log(`list screen: ${listEndIdx + 1}行目`);

// 変更1: screen stateの直後にeditingPropertyとeditFormを追加
const editStateLines = [
  lines[screenLineIdx],
  `\tconst [editingProperty, setEditingProperty] = useState(null)`,
  `\tconst [editForm, setEditForm] = useState({})`,
  `\tconst [editMsg, setEditMsg] = useState('')`,
];

// 変更2: 削除ボタンの前に編集ボタンを挿入
const editButton = `\t\t\t\t\t\t<button onClick={() => { setEditingProperty(p); setEditForm({...p}); setScreen('edit'); setEditMsg('') }} style={{ padding: '5px 12px', background: '#0ea5e9', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, cursor: 'pointer' }}>✏️ 編集</button>`;

// 変更3: 編集フォームのスクリーンを list スクリーンの後に追加
const editScreen = `
\t\t{/* 物件編集フォーム */}
\t\t{screen === 'edit' && editingProperty && (
\t\t\t<div>
\t\t\t\t<button onClick={() => setScreen('list')} style={{ marginBottom: 16, background: 'none', border: 'none', color: '#1a3a5c', cursor: 'pointer', fontSize: 13 }}>← 物件一覧に戻る</button>
\t\t\t\t<h2 style={{ color: '#1a3a5c', fontSize: 20, marginBottom: 20 }}>✏️ 物件編集：{editingProperty.title}</h2>

\t\t\t\t<div style={{ background: '#fff', borderRadius: 14, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
\t\t\t\t\t{[
\t\t\t\t\t\t{ key: 'title', label: '物件名 *', type: 'text' },
\t\t\t\t\t\t{ key: 'catchcopy', label: 'キャッチコピー', type: 'text' },
\t\t\t\t\t\t{ key: 'price', label: '売買価格（円）', type: 'number' },
\t\t\t\t\t\t{ key: 'rent', label: '賃料（円/月）', type: 'number' },
\t\t\t\t\t\t{ key: 'address', label: '所在地 *', type: 'text' },
\t\t\t\t\t\t{ key: 'area', label: '面積（㎡）', type: 'number' },
\t\t\t\t\t\t{ key: 'floor_plan', label: '間取り', type: 'text' },
\t\t\t\t\t\t{ key: 'age', label: '築年数', type: 'number' },
\t\t\t\t\t\t{ key: 'nearest_station', label: '最寄り駅', type: 'text' },
\t\t\t\t\t\t{ key: 'walk_minutes', label: '駅徒歩（分）', type: 'number' },
\t\t\t\t\t\t{ key: 'management_fee', label: '管理費（円/月）', type: 'number' },
\t\t\t\t\t\t{ key: 'description', label: '物件説明', type: 'textarea' },
\t\t\t\t\t\t{ key: 'remarks', label: '備考', type: 'textarea' },
\t\t\t\t\t].map(({ key, label, type }) => (
\t\t\t\t\t\t<div key={key} style={{ marginBottom: 16 }}>
\t\t\t\t\t\t\t<label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#1a3a5c', marginBottom: 4 }}>{label}</label>
\t\t\t\t\t\t\t{type === 'textarea' ? (
\t\t\t\t\t\t\t\t<textarea
\t\t\t\t\t\t\t\t\tvalue={editForm[key] || ''}
\t\t\t\t\t\t\t\t\tonChange={e => setEditForm(f => ({ ...f, [key]: e.target.value }))}
\t\t\t\t\t\t\t\t\trows={3}
\t\t\t\t\t\t\t\t\tstyle={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13, boxSizing: 'border-box', resize: 'vertical' }}
\t\t\t\t\t\t\t\t/>
\t\t\t\t\t\t\t) : (
\t\t\t\t\t\t\t\t<input
\t\t\t\t\t\t\t\t\ttype={type}
\t\t\t\t\t\t\t\t\tvalue={editForm[key] || ''}
\t\t\t\t\t\t\t\t\tonChange={e => setEditForm(f => ({ ...f, [key]: e.target.value }))}
\t\t\t\t\t\t\t\t\tstyle={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13, boxSizing: 'border-box' }}
\t\t\t\t\t\t\t\t/>
\t\t\t\t\t\t\t)}
\t\t\t\t\t\t</div>
\t\t\t\t\t))}

\t\t\t\t\t{editMsg && <div style={{ padding: '10px 16px', borderRadius: 8, background: editMsg.startsWith('✅') ? '#dcfce7' : '#fee2e2', color: editMsg.startsWith('✅') ? '#16a34a' : '#dc2626', marginBottom: 16, fontSize: 13 }}>{editMsg}</div>}

\t\t\t\t\t<div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
\t\t\t\t\t\t<button onClick={() => setScreen('list')} style={{ padding: '10px 24px', background: '#f1f5f9', color: '#555', border: 'none', borderRadius: 8, fontSize: 13, cursor: 'pointer' }}>キャンセル</button>
\t\t\t\t\t\t<button onClick={async () => {
\t\t\t\t\t\t\tif (!editForm.title || !editForm.address) { setEditMsg('❌ 物件名と所在地は必須です'); return; }
\t\t\t\t\t\t\tconst { error } = await supabase.from('agency_properties').update({
\t\t\t\t\t\t\t\ttitle: editForm.title,
\t\t\t\t\t\t\t\tcatchcopy: editForm.catchcopy,
\t\t\t\t\t\t\t\tprice: editForm.price ? Number(editForm.price) : null,
\t\t\t\t\t\t\t\trent: editForm.rent ? Number(editForm.rent) : null,
\t\t\t\t\t\t\t\taddress: editForm.address,
\t\t\t\t\t\t\t\tarea: editForm.area ? Number(editForm.area) : null,
\t\t\t\t\t\t\t\tfloor_plan: editForm.floor_plan,
\t\t\t\t\t\t\t\tage: editForm.age ? Number(editForm.age) : null,
\t\t\t\t\t\t\t\tnearest_station: editForm.nearest_station,
\t\t\t\t\t\t\t\twalk_minutes: editForm.walk_minutes ? Number(editForm.walk_minutes) : null,
\t\t\t\t\t\t\t\tmanagement_fee: editForm.management_fee ? Number(editForm.management_fee) : null,
\t\t\t\t\t\t\t\tdescription: editForm.description,
\t\t\t\t\t\t\t\tremarks: editForm.remarks,
\t\t\t\t\t\t\t}).eq('id', editingProperty.id);
\t\t\t\t\t\t\tif (error) { setEditMsg('❌ 更新に失敗しました: ' + error.message); return; }
\t\t\t\t\t\t\tsetEditMsg('✅ 物件情報を更新しました！');
\t\t\t\t\t\t\tawait loadMyProperties();
\t\t\t\t\t\t\tsetEditingProperty({ ...editingProperty, ...editForm });
\t\t\t\t\t\t}} style={{ padding: '10px 24px', background: '#1a3a5c', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, cursor: 'pointer', fontWeight: 700 }}>💾 保存する</button>
\t\t\t\t\t</div>
\t\t\t\t</div>
\t\t\t</div>
\t\t)}`;

// 変更を適用
const newLines = [...lines];

// 1. screen stateの後にedit statesを追加
newLines.splice(screenLineIdx + 1, 0,
  `\tconst [editingProperty, setEditingProperty] = useState(null)`,
  `\tconst [editForm, setEditForm] = useState({})`,
  `\tconst [editMsg, setEditMsg] = useState('')`
);

// インデックスがずれるので+3
const adjustedDeleteLineIdx = deleteLineIdx + 3;

// 2. 削除ボタンの前に編集ボタンを挿入
newLines.splice(adjustedDeleteLineIdx, 0, editButton);

// 3. 編集フォームスクリーンを最後の </div> の前に追加（list screenの終わり付近）
// 新しいlines配列でlist終わりを再探索
let newListEndIdx = -1;
newLines.forEach((l, i) => {
  if (l.includes('{screen === \'list\' && (')) newListEndIdx = i;
});

// list screenの終わりの )}  を探す（newListEndIdx以降）
let listCloseIdx = -1;
for (let i = newListEndIdx; i < newLines.length; i++) {
  if (newLines[i].trim() === ')}' && i > newListEndIdx + 10) {
    listCloseIdx = i;
    break;
  }
}

if (listCloseIdx === -1) {
  console.log('ERROR: list screenの終わりが見つかりませんでした');
  process.exit(1);
}

// list screenの )}の後に編集フォームを挿入
newLines.splice(listCloseIdx + 1, 0, ...editScreen.split('\n'));

fs.writeFileSync(filePath, newLines.join('\n'), 'utf8');
console.log('SUCCESS: AgencyDashboardに物件編集機能を追加しました');
console.log('  - ✏️ 編集ボタンを各物件カードに追加');
console.log('  - 編集フォームスクリーン（edit）を追加');
console.log('  - Supabaseへの更新処理を実装');
