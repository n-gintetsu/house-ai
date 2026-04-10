const fs = require('fs')
const path = require('path')

const appPath = path.join(__dirname, 'src', 'App.jsx')
let content = fs.readFileSync(appPath, 'utf8')

if (content.includes('chat_nav_buttons_v3')) {
  console.log('INFO: すでに追加済みです')
  process.exit(0)
}

// 「新規チャット」ボタンの直前にボタンを追加
// <button type="button" className="ha-btn ha-btnGhost" onClick={handleResetChat} disabled={isSending}>
const oldBtn = `<button type="button" className="ha-btn ha-btnGhost" onClick={handleResetChat} disabled={isSending}>`

if (!content.includes(oldBtn)) {
  console.log('ERROR: 新規チャットボタンが見つかりませんでした')
  process.exit(1)
}

const newBtns = `{/* chat_nav_buttons_v3 */}
                <button type="button" onClick={() => setTab('properties')}
                  style={{ padding: '5px 10px', background: '#1a3a5c', color: '#fff', border: 'none', borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  🏠 物件情報
                </button>
                <button type="button" onClick={() => setTab('vendors')}
                  style={{ padding: '5px 10px', background: '#c9a84c', color: '#fff', border: 'none', borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  👷 業者一覧・比較
                </button>
                <button type="button" className="ha-btn ha-btnGhost" onClick={handleResetChat} disabled={isSending}>`

content = content.replace(oldBtn, newBtns)

// コミュニティタブのヘッダーも修正
// ha-sectionTitle で「コミュニティ」を含む部分を探す
// コミュニティタブの構造: <h2 className="ha-sectionTitle">🏘️ コミュニティ</h2>
// ただし文字化けしているので別のアプローチ：community タブの ha-panel 内の最初の h2 を探す

// {tab === 'community' && ( の後の最初の h2 タグを探す
const communityTabIdx = content.indexOf("{tab === 'community' && (")
if (communityTabIdx < 0) {
  console.log('WARNING: communityタブが見つかりませんでした')
} else {
  // communityタブ内の最初の h2 を探す
  const h2Idx = content.indexOf('<h2 className="ha-sectionTitle">', communityTabIdx)
  const h2EndIdx = content.indexOf('</h2>', h2Idx) + 5

  if (h2Idx > 0 && h2EndIdx > 0) {
    const h2Content = content.slice(h2Idx, h2EndIdx)
    const newH2 = `<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                ${h2Content}
                <div style={{ display: 'flex', gap: 6 }}>
                  <button type="button" onClick={() => setTab('properties')}
                    style={{ padding: '5px 10px', background: '#1a3a5c', color: '#fff', border: 'none', borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    🏠 物件情報
                  </button>
                  <button type="button" onClick={() => setTab('vendors')}
                    style={{ padding: '5px 10px', background: '#c9a84c', color: '#fff', border: 'none', borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    👷 業者一覧・比較
                  </button>
                </div>
              </div>`

    content = content.slice(0, h2Idx) + newH2 + content.slice(h2EndIdx)
    console.log('コミュニティタブにボタン追加完了')
  }
}

// 前回追加した tab_nav_buttons_added を削除（重複防止）
content = content.replace(/\s*\{\/\* tab_nav_buttons_added \*\/\}[\s\S]*?<\/div>\s*/g, '')

fs.writeFileSync(appPath, content, 'utf8')
console.log('SUCCESS: ボタンを追加しました！npm run build を実行してください')
