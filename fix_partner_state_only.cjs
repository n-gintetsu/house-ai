const fs = require('fs');
const path = 'src/AdminDashboard.jsx';
let content = fs.readFileSync(path, 'utf8');
const lines = content.split('\n');

// partnerProfiles stateを追加（なければ）
if (content.includes('partnerProfiles, setPartnerProfiles')) {
  console.log('⚠️ 既に存在します');
  process.exit(0);
}

// agencies stateの行を探して直後に追加
let added = false;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('const [agencies, setAgencies] = useState([])')) {
    const indent = lines[i].match(/^(\s*)/)[1];
    lines.splice(i + 1, 0,
      `${indent}const [partnerProfiles, setPartnerProfiles] = useState([])`,
      `${indent}const [partnerMsg, setPartnerMsg] = useState('')`
    );
    added = true;
    console.log('✓ partnerProfiles / partnerMsg state追加');
    break;
  }
}

if (!added) {
  console.log('⚠️ agencies stateが見つかりませんでした');
  process.exit(1);
}

// updateAdStatus関数も追加（なければ）
const joined = lines.join('\n');
if (!joined.includes('updateAdStatus')) {
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('async function deletePost')) {
      const indent = lines[i].match(/^(\s*)/)[1];
      lines.splice(i, 0,
        `${indent}async function updateAdStatus(userId, status) {`,
        `${indent}  const { error } = await supabase.from('partner_profiles').update({ ad_status: status }).eq('user_id', userId)`,
        `${indent}  if (error) { alert('更新に失敗しました: ' + error.message); return }`,
        `${indent}  setPartnerProfiles(list => list.map(p => p.user_id === userId ? { ...p, ad_status: status } : p))`,
        `${indent}  setPartnerMsg('✅ ステータスを更新しました')`,
        `${indent}  setTimeout(() => setPartnerMsg(''), 3000)`,
        `${indent}}`,
        ``
      );
      console.log('✓ updateAdStatus関数追加');
      break;
    }
  }
}

fs.writeFileSync(path, lines.join('\n'), 'utf8');
console.log('✅ 完了！次は npm run build を実行してください。');
