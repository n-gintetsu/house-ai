const fs = require('fs');
const path = 'src/AdminDashboard.jsx';
let content = fs.readFileSync(path, 'utf8');

if (content.includes("from('partner_profiles')")) {
  console.log('⚠️ partner_profiles は既に追加されています');
  process.exit(0);
}

// owner_requestsの行の後にpartner_profilesを追加
const oldOwner = `      supabase.from('owner_requests').select('*').order('created_at', { ascending: false }),
    ])`;
const newOwner = `      supabase.from('owner_requests').select('*').order('created_at', { ascending: false }),
      supabase.from('partner_profiles').select('*').order('created_at', { ascending: false }),
    ])`;

if (!content.includes(oldOwner)) {
  console.log('⚠️ owner_requestsのパターンが見つかりません');
  process.exit(1);
}
content = content.replace(oldOwner, newOwner);
console.log('✓ partner_profilesをPromise.allに追加');

// Promise.allの変数名を更新
content = content.replace(
  'const [m, a, v, e, c, o] = await Promise.all',
  'const [m, a, v, e, c, o, pp] = await Promise.all'
);
console.log('✓ Promise.all変数名更新');

// setOwnersの後にsetPartnerProfilesを追加
const oldSetOwners = `    setOwners(o.data || [])
  } finally {`;
const newSetOwners = `    setOwners(o.data || [])
    setPartnerProfiles(pp.data || [])
  } finally {`;

if (!content.includes(oldSetOwners)) {
  console.log('⚠️ setOwnersのパターンが見つかりません');
  process.exit(1);
}
content = content.replace(oldSetOwners, newSetOwners);
console.log('✓ setPartnerProfiles追加');

fs.writeFileSync(path, content, 'utf8');
console.log('✅ 完了！次は npm run build を実行してください。');
