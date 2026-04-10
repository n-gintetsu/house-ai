const fs = require('fs')
const path = require('path')

const appPath = path.join(__dirname, 'src', 'App.jsx')
let content = fs.readFileSync(appPath, 'utf8')

// すでに追加済みチェック
if (content.includes('agencyType')) {
  console.log('INFO: すでに業者選択画面が追加されています')
  process.exit(0)
}

// agencyタブ全体を新しい内容に置き換え
// <AgencyForm /> の前後を含むagencyタブブロックを正規表現で探す
const agencyTabRegex = /(\{tab === 'agency' && \(\s*<div className="ha-panel"[^>]*>)[\s\S]*?(<AgencyForm \/>)\s*<\/div>\s*\)\}/

if (!agencyTabRegex.test(content)) {
  console.log('ERROR: agencyタブのブロックが見つかりませんでした')
  process.exit(1)
}

const newAgency = `{tab === 'agency' && (
            <div className="ha-panel" style={{ padding: 0 }}>
              {!agencyType && (
                <div style={{ padding: '40px 24px' }}>
                  <h2 style={{ color: '#1a3a5c', fontSize: 20, fontWeight: 700, textAlign: 'center', marginBottom: 8 }}>&#x1F3D7;&#xFE0F; \u696d\u8005\u69d8\u5411\u3051\u30b5\u30fc\u30d3\u30b9</h2>
                  <p style={{ color: '#666', fontSize: 14, textAlign: 'center', marginBottom: 32 }}>\u3054\u5229\u7528\u7528\u9014\u3092\u304a\u9�x3093\u3060\u3055\u3044</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 560, margin: '0 auto' }}>
                    <div style={{ border: '2px solid #1a3a5c', borderRadius: 16, padding: '28px 24px', cursor: 'pointer', background: '#fff' }}
                      onClick={() => setAgencyType('realestate')}>
                      <div style={{ fontSize: 32, marginBottom: 10 }}>&#x1F3E0;</div>
                      <div style={{ color: '#1a3a5c', fontSize: 18, fontWeight: 700, marginBottom: 8 }}>\u4e0d\u52d5\u7523\u696d\u8005\u69d8</div>
                      <div style={{ color: '#555', fontSize: 13, lineHeight: 1.7, marginBottom: 16 }}>
                        \u7269\u4ef6\u306e\u767b\u9332\u30fb\u63b2\u8f09\u30fb\u7ba1\u7406\u304c\u3067\u304d\u307e\u3059\u3002<br />
                        \u5c02\u7528\u30c0\u30c3\u30b7\u30e5\u30dc\u30fc\u30c9\u306b\u3066\u7269\u4ef6\u60c5\u5831\u3092\u3054\u767b\u9332\u3044\u305f\u3060\u3051\u307e\u3059\u3002
                      </div>
                      <div style={{ display: 'inline-block', padding: '10px 24px', background: '#1a3a5c', color: '#fff', borderRadius: 10, fontWeight: 700, fontSize: 14 }}>
                        \u7269\u4ef6\u63b2\u8f09\u30c0\u30c3\u30b7\u30e5\u30dc\u30fc\u30c9\u3078 \u2192
                      </div>
                    </div>
                    <div style={{ border: '2px solid #c9a84c', borderRadius: 16, padding: '28px 24px', cursor: 'pointer', background: '#fff' }}
                      onClick={() => setAgencyType('other')}>
                      <div style={{ fontSize: 32, marginBottom: 10 }}>&#x1F3E2;</div>
                      <div style={{ color: '#1a3a5c', fontSize: 18, fontWeight: 700, marginBottom: 8 }}>\u305d\u306e\u4ed6\u306e\u696d\u8005\u69d8</div>
                      <div style={{ color: '#555', fontSize: 13, lineHeight: 1.7, marginBottom: 4 }}>
                        \u30ea\u30d5\u30a9\u30fc\u30e0\u30fb\u5916\u69cb\u30fb\u53f8\u6cd5\u66f8\u58eb\u30fb\u7a0e\u7406\u58eb\u30fb\u91d1\u878d\u6a5f\u95a2\u306a\u3069<br />
                        \u5f53\u30b5\u30a4\u30c8\u3078\u306e\u5e83\u544a\u63b2\u8f09\u3092\u3054\u5e0c\u671b\u306e\u65b9\u306f\u3053\u3061\u3089\u3002
                      </div>
                      <div style={{ color: '#888', fontSize: 12, marginBottom: 16 }}>\u203b \u5e83\u544a\u30da\u30fc\u30b8\u306f\u3053\u3061\u3089\u3067\u4f5c\u6210\u3057\u3001\u5f53\u30b5\u30a4\u30c8\u306b\u63b2\u8f09\u3044\u305f\u3057\u307e\u3059</div>
                      <div style={{ display: 'inline-block', padding: '10px 24px', background: '#c9a84c', color: '#fff', borderRadius: 10, fontWeight: 700, fontSize: 14 }}>
                        \u5e83\u544a\u63b2\u8f09\u306e\u304a\u7533\u3057\u8fbc\u307f\u3078 \u2192
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {agencyType === 'realestate' && (
                <div>
                  <div style={{ background: '#1a3a5c', borderRadius: '12px 12px 0 0', padding: '20px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                      <div>
                        <div style={{ color: '#c9a84c', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>\u4e0d\u52d5\u7523\u696d\u8005\u69d8\u5411\u3051</div>
                        <div style={{ color: '#fff', fontSize: 16, fontWeight: 700 }}>&#x1F3E0; \u4e0d\u52d5\u7523\u696d\u8005\u69d8\u5c02\u7528\u30c0\u30c3\u30b7\u30e5\u30dc\u30fc\u30c9</div>
                        <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 4 }}>\u7269\u4ef6\u306e\u767b\u9332\u30fb\u7ba1\u7406\u30fb\u516c\u958b\u8a2d\u5b9a\u304c\u3067\u304d\u307e\u3059</div>
                      </div>
                      <a href="/agency" style={{ display: 'inline-block', padding: '12px 24px', background: '#f5a623', color: '#1a3a5c', borderRadius: 10, fontWeight: 700, fontSize: 14, textDecoration: 'none', whiteSpace: 'nowrap' }}>
                        \u30c0\u30c3\u30b7\u30e5\u30dc\u30fc\u30c9\u3078 \u2192
                      </a>
                    </div>
                  </div>
                  <div style={{ padding: '12px 24px' }}>
                    <button onClick={() => setAgencyType(null)} style={{ background: 'none', border: 'none', color: '#1a3a5c', fontSize: 13, cursor: 'pointer', textDecoration: 'underline' }}>\u2190 \u9078\u629e\u753b\u9762\u306b\u623b\u308b</button>
                  </div>
                  <AgencyForm />
                </div>
              )}
              {agencyType === 'other' && (
                <div style={{ padding: '32px 24px' }}>
                  <button onClick={() => setAgencyType(null)} style={{ background: 'none', border: 'none', color: '#1a3a5c', fontSize: 13, cursor: 'pointer', textDecoration: 'underline', marginBottom: 24, display: 'block' }}>\u2190 \u9078\u629e\u753b\u9762\u306b\u623b\u308b</button>
                  <h2 style={{ color: '#1a3a5c', fontSize: 18, fontWeight: 700, marginBottom: 8 }}>&#x1F3E2; \u5e83\u544a\u63b2\u8f09\u306e\u304a\u7533\u3057\u8fbc\u307f</h2>
                  <p style={{ color: '#555', fontSize: 13, lineHeight: 1.8, marginBottom: 24 }}>
                    \u30ea\u30d5\u30a9\u30fc\u30e0\u30fb\u5916\u69cb\u30fb\u53f8\u6cd5\u66f8\u58eb\u30fb\u7a0e\u7406\u58eb\u30fb\u91d1\u878d\u6a5f\u95a2\u306a\u3069\u3001\u5404\u696d\u7a2e\u306e\u696d\u8005\u69d8\u306e\u5e83\u544a\u3092\u5f53\u30b5\u30a4\u30c8\u306b\u63b2\u8f09\u3044\u305f\u3057\u307e\u3059\u3002<br />
                    \u307e\u305a\u306f\u4f1a\u54e1\u767b\u9332\u3092\u304a\u9858\u3044\u3044\u305f\u3057\u307e\u3059\u3002\u62c5\u5f53\u8005\u3088\u308a\u3054\u9023\u7d61\u3055\u305b\u3066\u3044\u305f\u3060\u304d\u307e\u3059\u3002
                  </p>
                  <AgencyForm />
                </div>
              )}
            </div>
          )}`

content = content.replace(agencyTabRegex, newAgency)

// useState の追加（agencyType用）
const tabStateRegex = /(const \[tab, setTab\] = useState\([^)]*\))/
if (tabStateRegex.test(content)) {
  content = content.replace(tabStateRegex, '$1\n  const [agencyType, setAgencyType] = useState(null)')
} else {
  console.log('WARNING: tab useStateが見つかりませんでした。手動でagencyTypeのuseStateを追加してください')
}

fs.writeFileSync(appPath, content, 'utf8')
console.log('SUCCESS: \u696d\u8005\u9078\u629e\u753b\u9762\u3092\u8ffd\u52a0\u3057\u307e\u3057\u305f\uff01npm run build \u3092\u5b9f\u884c\u3057\u3066\u304f\u3060\u3055\u3044')
