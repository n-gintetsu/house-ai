const fs = require('fs');
const path = 'src/AdminDashboard.jsx';
let content = fs.readFileSync(path, 'utf8');

// Promise.allにpartner_profilesを追加
const oldPromise = `const [m, a, v, e, c, o] = await Promise.all([
      supabase.auth.admin ? supabase.from('profiles').select('*').order('created_at', { ascending: false }) : { data: [] },
      supabase.from('agency_registrations').select('*').order('created_at', { ascending: false }),
      supabase.from('valuations').select('*').order('created_at', { ascending: false }),
      supabase.from('expert_requests').select('*').order('created_at', { ascending: false }),
      supabase.from('community_posts').select('*').order('created_at', { ascending: false }),
      supabase.from('owner_requests').select('*').order('created_at', { ascending: false }),
    ])
    setAgencies(a.data || [])
    setValuations(v.data || [])
    setExperts(e.data || [])
    setCommunity(c.data || [])
    setOwners(o.data || [])`;

const newPromise = `const [m, a, v, e, c, o, pp] = await Promise.all([
      supabase.auth.admin ? supabase.from('profiles').select('*').order('created_at', { ascending: false }) : { data: [] },
      supabase.from('agency_registrations').select('*').order('created_at', { ascending: false }),
      supabase.from('valuations').select('*').order('created_at', { ascending: false }),
      supabase.from('expert_requests').select('*').order('created_at', { ascending: false }),
      supabase.from('community_posts').select('*').order('created_at', { ascending: false }),
      supabase.from('owner_requests').select('*').order('created_at', { ascending: false }),
      supabaseAdmin.from('partner_profiles').select('*').order('created_at', { ascending: false }),
    ])
    setAgencies(a.data || [])
    setValuations(v.data || [])
    setExperts(e.data || [])
    setCommunity(c.data || [])
    setOwners(o.data || [])
    setPartnerProfiles(pp.data || [])`;

if (!content.includes(oldPromise)) {
  console.log('⚠️ Promise.allのパターンが一致しませんでした。');
  // 簡易パターンで試す
  const simple = `supabase.from('owner_requests').select('*').order('created_at', { ascending: false }),\n    ])`;
  const simpleNew = `supabase.from('owner_requests').select('*').order('created_at', { ascending: false }),\n      supabaseAdmin.from('partner_profiles').select('*').order('created_at', { ascending: false }),\n    ])`;
  
  if (content.includes(simple)) {
    content = content.replace(simple, simpleNew);
    // setOwners の後にsetPartnerProfiles追加
    content = content.replace(
      `setOwners(o.data || [])`,
      `setOwners(o.data || [])\n    setPartnerProfiles(pp.data || [])`
    );
    // Promise.allの変数名も更新
    content = content.replace(
      `const [m, a, v, e, c, o] = await Promise.all`,
      `const [m, a, v, e, c, o, pp] = await Promise.all`
    );
    console.log('✅ partner_profiles取得を追加しました（簡易パターン）');
  } else {
    console.log('⚠️ 簡易パターンも一致しませんでした。');
    process.exit(1);
  }
} else {
  content = content.replace(oldPromise, newPromise);
  console.log('✅ partner_profiles取得を追加しました');
}

// updateAdStatus関数を追加（なければ）
if (!content.includes('updateAdStatus')) {
  const insertTarget = `async function deletePost`;
  const updateFn = `async function updateAdStatus(userId, status) {
    const { error } = await supabaseAdmin.from('partner_profiles').update({ ad_status: status }).eq('user_id', userId)
    if (error) { alert('更新に失敗しました: ' + error.message); return }
    setPartnerProfiles(list => list.map(p => p.user_id === userId ? { ...p, ad_status: status } : p))
    setPartnerMsg('✅ ステータスを更新しました')
    setTimeout(() => setPartnerMsg(''), 3000)
  }

  `;
  if (content.includes(insertTarget)) {
    content = content.replace(insertTarget, updateFn + insertTarget);
    console.log('✅ updateAdStatus関数を追加しました');
  } else {
    console.log('⚠️ updateAdStatus挿入位置が見つかりません');
  }
} else {
  console.log('⚠️ updateAdStatus は既に存在します');
}

fs.writeFileSync(path, content, 'utf8');
console.log('完了！次は npm run build を実行してください。');
