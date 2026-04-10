const fs = require('fs')
const path = require('path')

const appPath = path.join(__dirname, 'src', 'App.jsx')
let content = fs.readFileSync(appPath, 'utf8')

// <AgencyForm /> を含む行を探す（インデント問わず）
const target = `<AgencyForm />`

if (!content.includes(target)) {
  console.log('ERROR: AgencyFormが見つかりませんでした')
  process.exit(1)
}

// すでにダッシュボードリンクが追加済みかチェック
if (content.includes('業者専用ダッシュボードリンク')) {
  console.log('INFO: すでにダッシュボードリンクが追加されています')
  process.exit(0)
}

// <AgencyForm /> の前にダッシュボードリンクを挿入
const dashboardLink = `              {/* 業者専用ダッシュボードリンク */}
              <div style={{ background: '#1a3a5c', borderRadius: '12px 12px 0 0', padding: '20px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <div style={{ color: '#c9a84c', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>すでに登録済みの業者様へ</div>
                    <div style={{ color: '#fff', fontSize: 16, fontWeight: 700 }}>🏢 業者専用ダッシュボード</div>
                    <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 4 }}>物件の登録・管理・公開設定ができます</div>
                  </div>
                  <a href="/agency" style={{ display: 'inline-block', padding: '12px 24px', background: '#f5a623', color: '#1a3a5c', borderRadius: 10, fontWeight: 700, fontSize: 14, textDecoration: 'none', whiteSpace: 'nowrap' }}>
                    ダッシュボードへ →
                  </a>
                </div>
              </div>
              `

content = content.replace(target, dashboardLink + target)
fs.writeFileSync(appPath, content, 'utf8')
console.log('SUCCESS: ダッシュボードリンクを追加しました！npm run build を実行してください')
