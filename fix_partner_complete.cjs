const fs = require('fs');
const path = 'src/AdminDashboard.jsx';
let content = fs.readFileSync(path, 'utf8');
const lines = content.split('\n');

let changed = false;

// 1. partnerProfiles state を追加（なければ）
if (!content.includes('partnerProfiles, setPartnerProfiles')) {
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('const [agencies, setAgencies] = useState([])')) {
      const indent = lines[i].match(/^(\s*)/)[1];
      lines.splice(i + 1, 0,
        `${indent}const [partnerProfiles, setPartnerProfiles] = useState([])`,
        `${indent}const [partnerMsg, setPartnerMsg] = useState('')`
      );
      console.log('✓ partnerProfiles state追加');
      changed = true;
      break;
    }
  }
} else {
  console.log('⚠️ partnerProfiles state は既にあります');
}

// 2. loadAll内のsetOwners後にpartner_profiles取得を追加（なければ）
const joined = lines.join('\n');
if (!joined.includes("from('partner_profiles')")) {
  // setOwners行を探す
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('setOwners(o.data') || lines[i].includes('setOwners(o ||')) {
      const indent = lines[i].match(/^(\s*)/)[1];
      // owner_requestsをPromise.allに追加
      // まずPromise.allの変数名を更新
      for (let j = 0; j < lines.length; j++) {
        if (lines[j].includes('const [m, a, v, e, c, o]') && lines[j].includes('Promise.all')) {
          lines[j] = lines[j].replace('const [m, a, v, e, c, o]', 'const [m, a, v, e, c, o, pp]');
          console.log('✓ Promise.all変数名更新');
          break;
        }
      }
      // owner_requestsの行を探してその後にpartner_profilesを追加
      for (let j = 0; j < lines.length; j++) {
        if (lines[j].includes("from('owner_requests')") && lines[j].includes('select')) {
          const ownerIndent = lines[j].match(/^(\s*)/)[1];
          lines.splice(j + 1, 0, `${ownerIndent}supabase.from('partner_profiles').select('*').order('created_at', { ascending: false }),`);
          console.log('✓ partner_profiles取得をPromise.allに追加');
          break;
        }
      }
      // setOwnersの後にsetPartnerProfiles追加（インデックス再取得）
      for (let k = 0; k < lines.length; k++) {
        if (lines[k].includes('setOwners(o.data') || lines[k].includes('setOwners(o ||')) {
          const ind = lines[k].match(/^(\s*)/)[1];
          lines.splice(k + 1, 0, `${ind}setPartnerProfiles(pp.data || [])`);
          console.log('✓ setPartnerProfiles追加');
          changed = true;
          break;
        }
      }
      break;
    }
  }
} else {
  console.log('⚠️ partner_profiles取得は既にあります');
}

// 3. updateAdStatus関数を追加（なければ）
const joined2 = lines.join('\n');
if (!joined2.includes('updateAdStatus')) {
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
      changed = true;
      break;
    }
  }
} else {
  console.log('⚠️ updateAdStatus は既にあります');
}

fs.writeFileSync(path, lines.join('\n'), 'utf8');
if (changed) {
  console.log('✅ 完了！次は npm run build を実行してください。');
} else {
  console.log('変更なし');
}
