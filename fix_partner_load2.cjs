const fs = require('fs');
const path = 'src/AdminDashboard.jsx';
let content = fs.readFileSync(path, 'utf8');
const lines = content.split('\n');

// owner_requests の行を探す
let ownerIdx = -1;
let promiseVarIdx = -1;
let setOwnersIdx = -1;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("from('owner_requests')") && lines[i].includes('select')) {
    ownerIdx = i;
  }
  if (lines[i].includes('const [m, a, v, e, c, o]') && lines[i].includes('Promise.all')) {
    promiseVarIdx = i;
  }
  if (lines[i].includes('setOwners(o.data')) {
    setOwnersIdx = i;
  }
}

console.log(`owner_requests行: ${ownerIdx + 1}`);
console.log(`Promise.all変数行: ${promiseVarIdx + 1}`);
console.log(`setOwners行: ${setOwnersIdx + 1}`);

if (ownerIdx === -1 || setOwnersIdx === -1) {
  console.log('⚠️ 必要な行が見つかりませんでした');
  process.exit(1);
}

// 既にpartner_profilesが追加されていないか確認
if (content.includes("from('partner_profiles')")) {
  console.log('⚠️ partner_profiles は既に追加されています');
  process.exit(0);
}

// 1. owner_requestsの行の後にpartner_profilesを追加
const ownerIndent = lines[ownerIdx].match(/^(\s*)/)[1];
lines.splice(ownerIdx + 1, 0, `${ownerIndent}supabaseAdmin.from('partner_profiles').select('*').order('created_at', { ascending: false }),`);

// インデックスがずれるので再取得
let newSetOwnersIdx = -1;
let newPromiseVarIdx = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('setOwners(o.data')) newSetOwnersIdx = i;
  if (lines[i].includes('const [m, a, v, e, c, o]') && lines[i].includes('Promise.all')) newPromiseVarIdx = i;
}

// 2. setOwnersの後にsetPartnerProfilesを追加
if (newSetOwnersIdx !== -1) {
  const setIndent = lines[newSetOwnersIdx].match(/^(\s*)/)[1];
  lines.splice(newSetOwnersIdx + 1, 0, `${setIndent}setPartnerProfiles(pp.data || [])`);
  console.log('✓ setPartnerProfiles追加');
}

// 3. Promise.allの変数名を更新
if (newPromiseVarIdx !== -1) {
  lines[newPromiseVarIdx] = lines[newPromiseVarIdx].replace(
    'const [m, a, v, e, c, o]',
    'const [m, a, v, e, c, o, pp]'
  );
  console.log('✓ Promise.all変数名更新');
}

const newContent = lines.join('\n');

// updateAdStatus関数を追加（なければ）
let finalContent = newContent;
if (!finalContent.includes('updateAdStatus')) {
  const insertTarget = 'async function deletePost';
  const updateFn = `async function updateAdStatus(userId, status) {
    const { error } = await supabaseAdmin.from('partner_profiles').update({ ad_status: status }).eq('user_id', userId)
    if (error) { alert('更新に失敗しました: ' + error.message); return }
    setPartnerProfiles(list => list.map(p => p.user_id === userId ? { ...p, ad_status: status } : p))
    setPartnerMsg('✅ ステータスを更新しました')
    setTimeout(() => setPartnerMsg(''), 3000)
  }

  `;
  if (finalContent.includes(insertTarget)) {
    finalContent = finalContent.replace(insertTarget, updateFn + insertTarget);
    console.log('✓ updateAdStatus関数追加');
  }
}

fs.writeFileSync(path, finalContent, 'utf8');
console.log('✅ 完了！次は npm run build を実行してください。');
