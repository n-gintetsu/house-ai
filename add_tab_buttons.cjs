const fs = require('fs')
const path = require('path')

const appPath = path.join(__dirname, 'src', 'App.jsx')
let content = fs.readFileSync(appPath, 'utf8')

if (content.includes('業者一覧・比較ボタン')) {
  console.log('INFO: すでに追加済みです')
  process.exit(0)
}

// AIチャットの ha-chatTop の中の「新規チャット」ボタンの後にボタンを追加
const chatTopOld = `<button type="button" className="ha-btn ha-btnGhost" onClick={handleResetChat} disabled={isSending}>`
const chatTopNew = `<div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                  <button type="button" onClick={() => setTab('properties')}
                    style={{ padding: '6px 12px', background: '#1a3a5c', color: '#fff', border: 'none', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    🏠 物件情報
                  </button>
                  <button type="button" onClick={() => setTab('vendors')}
                    style={{ padding: '6px 12px', background: '#c9a84c', color: '#fff', border: 'none', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    👷 業者一覧・比較ボタン
                  </button>
                  <button type="button" className="ha-btn ha-btnGhost" onClick={handleResetChat} disabled={isSending}>`

if (!content.includes(chatTopOld)) {
  console.log('ERROR: AIチャットの新規チャットボタンが見つかりませんでした')
  process.exit(1)
}

content = content.replace(chatTopOld, chatTopNew)

// 新規チャットボタンの閉じタグの後に </div> を追加
content = content.replace(
  `onClick={handleResetChat} disabled={isSending}>
                  譁ｰ隕上メ繝｣繝・ヨ
                </button>
              </div>`,
  `onClick={handleResetChat} disabled={isSending}>
                  譁ｰ隕上メ繝｣繝・ヨ
                </button>
                </div>
              </div>`
)

// コミュニティタブのヘッダーにもボタンを追加
const communityOld = `<h2 className="ha-sectionTitle">🏘️ コミュニティ</h2>`
const communityNew = `<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8, marginBottom: 4 }}>
                <h2 className="ha-sectionTitle" style={{ margin: 0 }}>🏘️ コミュニティ</h2>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button type="button" onClick={() => setTab('properties')}
                    style={{ padding: '6px 12px', background: '#1a3a5c', color: '#fff', border: 'none', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    🏠 物件情報
                  </button>
                  <button type="button" onClick={() => setTab('vendors')}
                    style={{ padding: '6px 12px', background: '#c9a84c', color: '#fff', border: 'none', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    👷 業者一覧・比較
                  </button>
                </div>
              </div>`

if (content.includes(communityOld)) {
  content = content.replace(communityOld, communityNew)
  console.log('コミュニティタブにボタン追加完了')
} else {
  console.log('WARNING: コミュニティタブのヘッダーが見つかりませんでした')
}

fs.writeFileSync(appPath, content, 'utf8')
console.log('SUCCESS: ボタンを追加しました！npm run build を実行してください')
