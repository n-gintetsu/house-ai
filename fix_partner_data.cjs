const fs = require('fs');
const path = 'src/AdminDashboard.jsx';
let content = fs.readFileSync(path, 'utf8');

// 1. useState に partnerProfiles を追加
// 既存の useState 群を探す（例：const [agencies, setAgencies] = useState([])）
const stateTarget = `const [agencies, setAgencies] = useState([])`;
const stateReplacement = `const [agencies, setAgencies] = useState([])
  const [partnerProfiles, setPartnerProfiles] = useState([])
  const [partnerMsg, setPartnerMsg] = useState('')`;

if (!content.includes(stateTarget)) {
  console.log('⚠️ agencies stateが見つかりません');
  process.exit(1);
}
if (content.includes('setPartnerProfiles')) {
  console.log('⚠️ partnerProfiles は既に定義されています');
} else {
  content = content.replace(stateTarget, stateReplacement);
  console.log('✓ partnerProfiles state を追加');
}

// 2. loadAll関数にpartner_profiles取得を追加
// 既存のloadAll内のagencies取得処理の後に追加
const loadTarget = `const { data: a } = await supabase.from('agency_registrations').select('*').order('created_at', { ascending: false })
    setAgencies(a || [])`;
const loadReplacement = `const { data: a } = await supabase.from('agency_registrations').select('*').order('created_at', { ascending: false })
    setAgencies(a || [])
    const { data: pp } = await supabaseAdmin.from('partner_profiles').select('*').order('created_at', { ascending: false })
    setPartnerProfiles(pp || [])`;

if (!content.includes(loadTarget)) {
  // 別パターンを試す
  const loadTarget2 = `setAgencies(a || [])`;
  const idx = content.indexOf(loadTarget2);
  if (idx === -1) {
    console.log('⚠️ loadAll内のsetAgenciesが見つかりません');
    process.exit(1);
  }
  // 最初のsetAgencies の後に追加
  const before = content.slice(0, idx + loadTarget2.length);
  const after = content.slice(idx + loadTarget2.length);
  if (!content.includes('setPartnerProfiles')) {
    content = before + `\n    const { data: pp } = await supabaseAdmin.from('partner_profiles').select('*').order('created_at', { ascending: false })\n    setPartnerProfiles(pp || [])` + after;
    console.log('✓ partner_profiles取得処理を追加（パターン2）');
  }
} else if (!content.includes('partner_profiles')) {
  content = content.replace(loadTarget, loadReplacement);
  console.log('✓ partner_profiles取得処理を追加');
} else {
  console.log('⚠️ partner_profiles取得処理は既に存在します');
}

// 3. updateAdStatus関数を追加（なければ）
if (!content.includes('updateAdStatus')) {
  const insertTarget = `async function deletePost(id)`;
  const updateFn = `async function updateAdStatus(userId, status) {
    const { error } = await supabaseAdmin.from('partner_profiles').update({ ad_status: status }).eq('user_id', userId)
    if (error) { alert('更新に失敗しました: ' + error.message); return; }
    setPartnerProfiles(list => list.map(p => p.user_id === userId ? { ...p, ad_status: status } : p))
    setPartnerMsg('✅ ステータスを更新しました')
    setTimeout(() => setPartnerMsg(''), 3000)
  }

  `;
  if (content.includes(insertTarget)) {
    content = content.replace(insertTarget, updateFn + insertTarget);
    console.log('✓ updateAdStatus関数を追加');
  } else {
    console.log('⚠️ updateAdStatus挿入位置が見つかりません（deletePost関数がない）');
  }
} else {
  console.log('⚠️ updateAdStatus は既に存在します');
}

fs.writeFileSync(path, content, 'utf8');
console.log('✅ 完了！次は npm run build を実行してください。');
