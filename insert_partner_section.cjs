const fs = require('fs');

const filePath = 'src/AdminDashboard.jsx';
const raw = fs.readFileSync(filePath, 'utf8');
const content = raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
const lines = content.split('\n');

// 744行目（index 743）の "</div>" の後にパートナーセクションを挿入
// つまりindex 743の後、744の前に挿入

const partnerLines = [
  '',
  `      {activeSection === '\u30d1\u30fc\u30c8\u30ca\u30fc' && (`,
  `        <div>`,
  `          <h3 style={{ margin: '0 0 16px', fontSize: 15, color: '#1a3a5c' }}>\ud83d\udc65 \u30d1\u30fc\u30c8\u30ca\u30fc\u696d\u8005\u4e00\u89a7\uff08{partnerProfiles.length}\u4ef6\uff09</h3>`,
  `          {partnerMsg && <div style={{ padding: '8px 14px', borderRadius: 8, background: partnerMsg.startsWith('\u2705') ? '#dcfce7' : '#fee2e2', color: partnerMsg.startsWith('\u2705') ? '#16a34a' : '#dc2626', marginBottom: 12, fontSize: 13 }}>{partnerMsg}</div>}`,
  `          {partnerProfiles.length === 0 ? (`,
  `            <p style={{ color: '#777', fontSize: 13 }}>\u767b\u9332\u306f\u3042\u308a\u307e\u305b\u3093</p>`,
  `          ) : partnerProfiles.map(p => (`,
  `            <div key={p.user_id} style={{ background: '#fff', borderRadius: 14, padding: 16, marginBottom: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>`,
  `              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>`,
  `                <div>`,
  `                  <div style={{ fontWeight: 700, fontSize: 14, color: '#1a3a5c' }}>{p.company_name || p.user_id}</div>`,
  `                  {p.ad_title && <div style={{ fontSize: 12, color: '#555', marginTop: 3 }}>\u5e83\u544a\u30bf\u30a4\u30c8\u30eb\uff1a{p.ad_title}</div>}`,
  `                  {p.ad_description && <div style={{ fontSize: 11, color: '#777', marginTop: 2 }}>{p.ad_description}</div>}`,
  `                  <div style={{ fontSize: 10, color: '#aaa', marginTop: 3 }}>\u767b\u9332\uff1a{p.created_at ? new Date(p.created_at).toLocaleString('ja-JP') : ''}</div>`,
  `                </div>`,
  `                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>`,
  `                  <span style={{ padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700, background: p.ad_status === '\u63b2\u8f09\u4e2d' ? '#dcfce7' : '#fef9c3', color: p.ad_status === '\u63b2\u8f09\u4e2d' ? '#16a34a' : '#92400e' }}>`,
  `                    {p.ad_status === '\u63b2\u8f09\u4e2d' ? '\u2705 \u63b2\u8f09\u4e2d' : '\u23f3 \u5be9\u67fb\u4e2d'}`,
  `                  </span>`,
  `                  {p.ad_status !== '\u63b2\u8f09\u4e2d' && <button onClick={() => updateAdStatus(p.user_id, '\u63b2\u8f09\u4e2d')} style={{ padding: '4px 12px', background: '#1a3a5c', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, cursor: 'pointer', fontWeight: 700 }}>\u63b2\u8f09\u4e2d\u306b\u3059\u308b</button>}`,
  `                  {p.ad_status === '\u63b2\u8f09\u4e2d' && <button onClick={() => updateAdStatus(p.user_id, '\u5be9\u67fb\u4e2d')} style={{ padding: '4px 12px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, cursor: 'pointer', fontWeight: 700 }}>\u5c55\u793a\u505c\u6b62</button>}`,
  `                </div>`,
  `              </div>`,
  `            </div>`,
  `          ))}`,
  `        </div>`,
  `      )}`,
];

// 744行目 = index 743 の後に挿入
lines.splice(743, 0, ...partnerLines);

fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
console.log('SUCCESS: パートナー業者セクションを挿入しました！');
