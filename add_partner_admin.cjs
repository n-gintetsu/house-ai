const fs = require('fs');

const filePath = 'src/AdminDashboard.jsx';
const raw = fs.readFileSync(filePath, 'utf8');
const content = raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

let newContent = content;

// 1. activeSection stateの後にpartnerProfiles stateを追加
const oldActiveSection = `  const [activeSection, setActiveSection] = useState('ticker')`;
const newActiveSection = `  const [activeSection, setActiveSection] = useState('ticker')
  const [partnerProfiles, setPartnerProfiles] = useState([])
  const [partnerMsg, setPartnerMsg] = useState('')`;

if (!newContent.includes(oldActiveSection)) {
  console.log('ERROR: activeSection stateが見つかりません');
  process.exit(1);
}
newContent = newContent.replace(oldActiveSection, newActiveSection);
console.log('✓ partnerProfiles state追加');

// 2. useEffectにfetchPartnerProfilesを追加
const oldUseEffect = `  useEffect(() => {
    fetchTicker()
    fetchAds()
  }, [])`;
const newUseEffect = `  useEffect(() => {
    fetchTicker()
    fetchAds()
    fetchPartnerProfiles()
  }, [])`;

if (!newContent.includes(oldUseEffect)) {
  console.log('ERROR: useEffectが見つかりません');
  process.exit(1);
}
newContent = newContent.replace(oldUseEffect, newUseEffect);
console.log('✓ useEffect更新');

// 3. fetchAdsの後にfetchPartnerProfiles・updateAdStatus関数を追加
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
    if (!error) { setPartnerMsg('\u2705 \u30b9\u30c6\u30fc\u30bf\u30b9\u3092\u5909\u66f4\u3057\u307e\u3057\u305f'); fetchPartnerProfiles() }
    else setPartnerMsg('\u274c \u30a8\u30e9\u30fc: ' + error.message)
  }`;

if (!newContent.includes(oldFetchAds)) {
  console.log('ERROR: fetchAds関数が見つかりません');
  process.exit(1);
}
newContent = newContent.replace(oldFetchAds, newFetchAds);
console.log('✓ fetchPartnerProfiles・updateAdStatus関数追加');

// 4. 広告バナーボタンの後にパートナー業者ボタンを追加
const lines = newContent.split('\n');
let btnLineIdx = -1;
lines.forEach((l, i) => {
  if (l.includes("setActiveSection('ads')") && l.includes('\u5e83\u544a\u30d0\u30ca\u30fc')) btnLineIdx = i;
});

if (btnLineIdx === -1) {
  console.log('ERROR: 広告バナーボタン行が見つかりません');
  process.exit(1);
}

const indent = lines[btnLineIdx].match(/^(\s*)/)[1];
lines.splice(btnLineIdx + 1, 0, `${indent}<button style={btnStyle(activeSection==='\u30d1\u30fc\u30c8\u30ca\u30fc')} onClick={() => setActiveSection('\u30d1\u30fc\u30c8\u30ca\u30fc')}>\ud83d\udc65 \u30d1\u30fc\u30c8\u30ca\u30fc\u696d\u8005</button>`);
console.log('✓ パートナー業者ボタン追加');

newContent = lines.join('\n');

// 5. パートナー業者セクションを return内の最後の </div> の直前に挿入
// 末尾パターン: 「      </div>\n    )\n}」を探す（AdManagement関数の末尾）
const partnerSection = `
      {activeSection === '\u30d1\u30fc\u30c8\u30ca\u30fc' && (
        <div>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, color: '#1a3a5c' }}>\ud83d\udc65 \u30d1\u30fc\u30c8\u30ca\u30fc\u696d\u8005\u4e00\u89a7\uff08{partnerProfiles.length}\u4ef6\uff09</h3>
          {partnerMsg && <div style={{ padding: '8px 14px', borderRadius: 8, background: partnerMsg.startsWith('\u2705') ? '#dcfce7' : '#fee2e2', color: partnerMsg.startsWith('\u2705') ? '#16a34a' : '#dc2626', marginBottom: 12, fontSize: 13 }}>{partnerMsg}</div>}
          {partnerProfiles.length === 0 ? (
            <p style={{ color: '#777', fontSize: 13 }}>\u767b\u9332\u306f\u3042\u308a\u307e\u305b\u3093</p>
          ) : partnerProfiles.map(p => (
            <div key={p.user_id} style={{ background: '#fff', borderRadius: 14, padding: 16, marginBottom: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#1a3a5c' }}>{p.company_name || p.user_id}</div>
                  {p.ad_title && <div style={{ fontSize: 12, color: '#555', marginTop: 3 }}>\u5e83\u544a\u30bf\u30a4\u30c8\u30eb\uff1a{p.ad_title}</div>}
                  {p.ad_description && <div style={{ fontSize: 11, color: '#777', marginTop: 2 }}>{p.ad_description}</div>}
                  <div style={{ fontSize: 10, color: '#aaa', marginTop: 3 }}>\u767b\u9332\uff1a{p.created_at ? new Date(p.created_at).toLocaleString('ja-JP') : ''}</div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700,
                    background: p.ad_status === '\u63b2\u8f09\u4e2d' ? '#dcfce7' : '#fef9c3',
                    color: p.ad_status === '\u63b2\u8f09\u4e2d' ? '#16a34a' : '#92400e'
                  }}>
                    {p.ad_status === '\u63b2\u8f09\u4e2d' ? '\u2705 \u63b2\u8f09\u4e2d' : '\u23f3 \u5be9\u67fb\u4e2d'}
                  </span>
                  {p.ad_status !== '\u63b2\u8f09\u4e2d' && (
                    <button onClick={() => updateAdStatus(p.user_id, '\u63b2\u8f09\u4e2d')} style={{ padding: '4px 12px', background: '#1a3a5c', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, cursor: 'pointer', fontWeight: 700 }}>\u63b2\u8f09\u4e2d\u306b\u3059\u308b</button>
                  )}
                  {p.ad_status === '\u63b2\u8f09\u4e2d' && (
                    <button onClick={() => updateAdStatus(p.user_id, '\u5be9\u67fb\u4e2d')} style={{ padding: '4px 12px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, cursor: 'pointer', fontWeight: 700 }}>\u5c55\u793a\u505c\u6b62</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}`;

// AdManagement関数のreturn内の最後の </div> の直前に挿入
// 「      </div>\n    )\n}」パターンを探す
const endPattern = `      </div>\n    )\n}`;
const endIdx = newContent.lastIndexOf(endPattern);

if (endIdx === -1) {
  console.log('ERROR: return終わりパターンが見つかりません');
  // デバッグ
  const dbgLines = newContent.split('\n');
  for (let i = dbgLines.length - 8; i < dbgLines.length; i++) {
    console.log((i+1) + ': ' + JSON.stringify(dbgLines[i]));
  }
  process.exit(1);
}

const insertPos = endIdx + `      </div>`.length;
newContent = newContent.slice(0, insertPos) + '\n' + partnerSection + '\n' + newContent.slice(insertPos);
console.log('✓ パートナー業者セクション追加');

fs.writeFileSync(filePath, newContent, 'utf8');
console.log('SUCCESS: 管理画面にad_status変更機能を追加しました！');
