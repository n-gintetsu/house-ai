const fs = require('fs');
const path = 'src/AdminDashboard.jsx';
let content = fs.readFileSync(path, 'utf8');

if (content.includes("from('partner_profiles')")) {
  console.log('⚠️ partner_profiles は既に追加されています');
  process.exit(0);
}

const lines = content.split('\n');
let ownerIdx = -1;
let setOwnersIdx = -1;
let promiseVarIdx = -1;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("from('owner_requests')") && lines[i].includes('select')) ownerIdx = i;
  if (lines[i].includes('setOwners(o.data')) setOwnersIdx = i;
  if (lines[i].includes('const [m, a, v, e, c, o]') && lines[i].includes('Promise.all')) promiseVarIdx = i;
}

console.log(`owner_requests: ${ownerIdx+1}行目`);
console.log(`setOwners: ${setOwnersIdx+1}行目`);
console.log(`Promise.all変数: ${promiseVarIdx+1}行目`);

if (ownerIdx === -1 || setOwnersIdx === -1 || promiseVarIdx === -1) {
  console.log('⚠️ 必要な行が見つかりません');
  process.exit(1);
}

// owner_requestsの行のインデントを取得して合わせる
const ownerIndent = lines[ownerIdx].match(/^(\s*)/)[1];
// owner_requestsの行の後にpartner_profilesを挿入
lines.splice(ownerIdx + 1, 0, `${ownerIndent}supabase.from('partner_profiles').select('*').order('created_at', { ascending: false }),`);
console.log('✓ partner_profilesをPromise.allに追加');

// インデックスがずれるので再取得
let newSetOwnersIdx = -1;
let newPromiseVarIdx = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('setOwners(o.data')) newSetOwnersIdx = i;
  if (lines[i].includes('const [m, a, v, e, c, o]') && lines[i].includes('Promise.all')) newPromiseVarIdx = i;
}

// setOwnersの後にsetPartnerProfilesを追加
const setIndent = lines[newSetOwnersIdx].match(/^(\s*)/)[1];
lines.splice(newSetOwnersIdx + 1, 0, `${setIndent}setPartnerProfiles(pp.data || [])`);
console.log('✓ setPartnerProfiles追加');

// Promise.all変数名を更新
lines[newPromiseVarIdx] = lines[newPromiseVarIdx].replace(
  'const [m, a, v, e, c, o]',
  'const [m, a, v, e, c, o, pp]'
);
console.log('✓ Promise.all変数名更新');

fs.writeFileSync(path, lines.join('\n'), 'utf8');
console.log('✅ 完了！次は npm run build を実行してください。');
