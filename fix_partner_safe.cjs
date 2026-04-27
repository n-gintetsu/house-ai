const fs = require('fs');
const path = 'src/AdminDashboard.jsx';
let content = fs.readFileSync(path, 'utf8');
const lines = content.split('\n');

// 1. owner_requests行を探してその後にpartner_profilesを追加
let ownerIdx = -1;
let setOwnersIdx = -1;
let promiseVarIdx = -1;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("from('owner_requests')") && lines[i].includes('select')) ownerIdx = i;
  if (lines[i].includes('setOwners(o.data')) setOwnersIdx = i;
  if (lines[i].includes('[m, a, v, e, c, o]') && lines[i].includes('Promise.all')) promiseVarIdx = i;
}

console.log(`owner_requests: ${ownerIdx+1}行目`);
console.log(`setOwners: ${setOwnersIdx+1}行目`);
console.log(`Promise.all変数: ${promiseVarIdx+1}行目`);

if (ownerIdx === -1 || setOwnersIdx === -1 || promiseVarIdx === -1) {
  console.log('⚠️ 必要な行が見つかりません');
  process.exit(1);
}

// Promise.all変数名を更新
lines[promiseVarIdx] = lines[promiseVarIdx].replace('[m, a, v, e, c, o]', '[m, a, v, e, c, o, pp]');
console.log('✓ Promise.all変数名更新');

// owner_requestsの後にpartner_profilesを追加
const ownerIndent = lines[ownerIdx].match(/^(\s*)/)[1];
lines.splice(ownerIdx + 1, 0, `${ownerIndent}supabase.from('partner_profiles').select('*').order('created_at', { ascending: false }),`);
console.log('✓ partner_profilesをPromise.allに追加');

// setOwnersの後にsetPartnerProfiles追加（インデックスがずれるので再取得）
let newSetOwnersIdx = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('setOwners(o.data')) { newSetOwnersIdx = i; break; }
}
const setIndent = lines[newSetOwnersIdx].match(/^(\s*)/)[1];
// エラーログとnull安全でsetPartnerProfiles追加
lines.splice(newSetOwnersIdx + 1, 0,
  `${setIndent}if (pp?.error) console.error('partner_profiles error:', pp.error)`,
  `${setIndent}setPartnerProfiles(pp?.data || [])`
);
console.log('✓ setPartnerProfiles追加（null安全）');

fs.writeFileSync(path, lines.join('\n'), 'utf8');
console.log('✅ 完了！次は npm run build を実行してください。');
