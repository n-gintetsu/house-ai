const fs = require('fs');

const filePath = 'src/AdminDashboard.jsx';
const raw = fs.readFileSync(filePath, 'utf8');
const content = raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

// AdManagement関数内のuseStateとuseEffectの後に
// partner_profiles関連のstateとfetch関数を追加

// 1. activeSection stateの初期値を変更 & partnerProfiles stateを追加
const oldActiveSection = `  const [activeSection, setActiveSection] = useState('ticker')`;
const newActiveSection = `  const [activeSection, setActiveSection] = useState('ticker')
  const [partnerProfiles, setPartnerProfiles] = useState([])
  const [partnerMsg, setPartnerMsg] = useState('')`;

// 2. fetchAdsの後にfetchPartnerProfilesを追加
const oldFetchAds = `  const fetchAds = async () => {
    const { data } = await supabaseAdmin.from('ad_items').select('*').order('sort_order')
    if (data) setAdItems(data)
  }`;
const newFetchAds = `  const fetchAds = async () => {
    const { data } = await supabaseAdmin.from('ad_items').select('*').order('sort_order')
    if (data) setAdItems(data)
  }

  const fetchPartnerProfiles = async () => {
    const { data } = await supabaseAdmin.from('partner_profiles').select('*').order('created_at', { ascending: false })
    if (data) setPartnerProfiles(data)
  }

  const updateAdStatus = async (userId, newStatus) => {
    const { error } = await supabaseAdmin.from('partner_profiles').update({ ad_status: newStatus }).eq('user_id', userId)
    if (!error) { setPartnerMsg('\u2705 \u5c55\u793a\u30b9\u30c6\u30fc\u30bf\u30b9\u3092\u5909\u66f4\u3057\u307e\u3057\u305f'); fetchPartnerProfiles() }
    else setPartnerMsg('\u274c \u30a8\u30e9\u30fc: ' + error.message)
  }`;

// 3. useEffectにfetchPartnerProfilesを追加
const oldUseEffect = `  useEffect(() => {
    fetchTicker()
    fetchAds()
  }, [])`;
const newUseEffect = `  useEffect(() => {
    fetchTicker()
    fetchAds()
    fetchPartnerProfiles()
  }, [])`;

// 4. セクションボタンに「パートナー業者」を追加
// 「広告バナー」ボタンの行を探して後ろに追加
const oldAdsButton = `<button style={btnStyle(activeSection==='ads')} onClick={() => setActiveSection('ads')}>\ud83d\udcf8 広告バナー </b`;
// ボタン行の後ろにパートナー業者ボタンを追加
// まず広告バナーボタンの完全な行を特定
let btnLineIdx = -1;
const lines = content.split('\n');
lines.forEach((l, i) => {
  if (l.includes("setActiveSection('ads')") && l.includes('広告バナー')) btnLineIdx = i;
});

if (btnLineIdx === -1) {
  console.log('ERROR: 広告バナーボタン行が見つかりません');
  process.exit(1);
}
console.log(`広告バナーボタン: ${btnLineIdx + 1}行目`);

// 5. パートナー業者セクションのJSXを広告管理の最後に追加
// 「現在の広告一覧」の後に追加する

let newContent = content;

// state追加
if (!newContent.includes(oldActiveSection)) {
  console.log('ERROR: activeSection stateが見つかりません');
  process.exit(1);
}
newContent = newContent.replace(oldActiveSection, newActiveSection);
console.log('✓ partnerProfiles state追加');

// fetchAds後にfetchPartnerProfiles追加
if (!newContent.includes(oldFetchAds)) {
  console.log('ERROR: fetchAds関数が見つかりません');
  process.exit(1);
}
newContent = newContent.replace(oldFetchAds, newFetchAds);
console.log('✓ fetchPartnerProfiles関数追加');

// useEffect更新
if (!newContent.includes(oldUseEffect)) {
  console.log('ERROR: useEffectが見つかりません');
  process.exit(1);
}
newContent = newContent.replace(oldUseEffect, newUseEffect);
console.log('✓ useEffect更新');

// ボタン追加（行番号で挿入）
const newLines = newContent.split('\n');
// 再度広告バナーボタン行を検索
let newBtnLineIdx = -1;
newLines.forEach((l, i) => {
  if (l.includes("setActiveSection('ads')") && l.includes('広告バナー')) newBtnLineIdx = i;
});

if (newBtnLineIdx === -1) {
  console.log('ERROR: 広告バナーボタン行が見つかりません（更新後）');
  process.exit(1);
}

// 広告バナーボタンの行の後にパートナー業者ボタンを挿入
const partnerBtn = newLines[newBtnLineIdx].replace(
  "setActiveSection('ads')}",
  "setActiveSection('ads')}"
);
// 同じインデントでボタンを追加
const indent = newLines[newBtnLineIdx].match(/^(\s*)/)[1];
newLines.splice(newBtnLineIdx + 1, 0, `${indent}<button style={btnStyle(activeSection==='partners')} onClick={() => setActiveSection('partners')}>\ud83d\udc65 \u30d1\u30fc\u30c8\u30ca\u30fc\u696d\u8005</button>`);
console.log('✓ パートナー業者ボタン追加');

// パートナー業者セクションJSXをAdManagement関数の最後のreturnの直前に追加
// return文の直前にパートナー業者セクションを追加するのではなく
// JSX内の最後のセクションの後に追加する

// 「現在の広告一覧」セクションの後、returnの閉じる前に挿入
// AdManagement関数の最後の </div>\n  )\n} パターンを探す
const joined = newLines.join('\n');

const partnerSection = `
      {activeSection === 'partners' && (
        <div>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, color: '#1a3a5c' }}>\ud83d\udc65 \u30d1\u30fc\u30c8\u30ca\u30fc\u696d\u8005\u4e00\u89a7\uff08{partnerProfiles.length}\u4ef6\uff09</h3>
          {partnerMsg && <div style={{ padding: '8px 14px', borderRadius: 8, background: partnerMsg.startsWith('\u2705') ? '#dcfce7' : '#fee2e2', color: partnerMsg.startsWith('\u2705') ? '#16a34a' : '#dc2626', marginBottom: 12, fontSize: 13 }}>{partnerMsg}</div>}
          {partnerProfiles.length === 0 ? (
            <p style={{ color: '#777' }}>\u767b\u9332\u306f\u3042\u308a\u307e\u305b\u3093</p>
          ) : partnerProfiles.map(p => (
            <div key={p.user_id} style={{ background: '#fff', borderRadius: 14, padding: 16, marginBottom: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: '#1a3a5c' }}>{p.company_name || p.user_id}</div>
                  {p.ad_title && <div style={{ fontSize: 13, color: '#555', marginTop: 4 }}>\u5e83\u544a\u30bf\u30a4\u30c8\u30eb\uff1a{p.ad_title}</div>}
                  {p.ad_description && <div style={{ fontSize: 12, color: '#777', marginTop: 4 }}>{p.ad_description}</div>}
                  <div style={{ fontSize: 11, color: '#aaa', marginTop: 4 }}>\u767b\u9332\uff1a{p.created_at ? new Date(p.created_at).toLocaleString('ja-JP') : ''}</div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ padding: '4px 10px', borderRadius: 999, fontSize: 12, fontWeight: 700,
                    background: p.ad_status === '\u63b2\u8f09\u4e2d' ? '#dcfce7' : '#fef9c3',
                    color: p.ad_status === '\u63b2\u8f09\u4e2d' ? '#16a34a' : '#92400e'
                  }}>
                    {p.ad_status === '\u63b2\u8f09\u4e2d' ? '\u2705 \u63b2\u8f09\u4e2d' : '\u23f3 \u5be9\u67fb\u4e2d'}
                  </span>
                  {p.ad_status !== '\u63b2\u8f09\u4e2d' && (
                    <button onClick={() => updateAdStatus(p.user_id, '\u63b2\u8f09\u4e2d')} style={{ padding: '4px 12px', background: '#1a3a5c', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, cursor: 'pointer' }}>\u63b2\u8f09\u4e2d\u306b\u3059\u308b</button>
                  )}
                  {p.ad_status === '\u63b2\u8f09\u4e2d' && (
                    <button onClick={() => updateAdStatus(p.user_id, '\u5be9\u67fb\u4e2d')} style={{ padding: '4px 12px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, cursor: 'pointer' }}>\u5c55\u793a\u505c\u6b62</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}`;

// AdManagement関数の最後の </div>\n  )\n} を探して、その直前に挿入
const adMgmtEnd = `    </div>\n  )\n}`;
const adMgmtEndIdx = joined.lastIndexOf(adMgmtEnd);
if (adMgmtEndIdx === -1) {
  console.log('ERROR: AdManagement関数の終わりが見つかりません');
  process.exit(1);
}

const insertPos = adMgmtEndIdx + `    </div>`.length;
const finalContent = joined.slice(0, insertPos) + '\n' + partnerSection + '\n' + joined.slice(insertPos);

fs.writeFileSync(filePath, finalContent, 'utf8');
console.log('✓ パートナー業者セクション追加');
console.log('SUCCESS: 管理画面にad_status変更機能を追加しました！');
