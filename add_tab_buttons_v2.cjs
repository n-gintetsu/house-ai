const fs = require('fs')
const path = require('path')

const appPath = path.join(__dirname, 'src', 'App.jsx')
let content = fs.readFileSync(appPath, 'utf8')

if (content.includes('tab_nav_buttons_added')) {
  console.log('INFO: すでに追加済みです')
  process.exit(0)
}

// ha-chatTop の中を探す - 「新規チャット」ボタンを含む div を探す
// handleResetChat を含む button タグを探して、その前に div を追加

const oldChatTop = `className="ha-btn ha-btnGhost" onClick={handleResetChat} disabled={isSending}>`
const newChatTop = `className="ha-btn ha-btnGhost" onClick={handleResetChat} disabled={isSending}>`

if (!content.includes(oldChatTop)) {
  console.log('ERROR: チャットボタンが見つかりませんでした')
  // 含まれる文字を確認
  console.log('handleResetChat exists:', content.includes('handleResetChat'))
  process.exit(1)
}

// ha-chatTop の閉じ </div> を探して、その直前にボタンを差し込む
// より安全な方法：handleResetChat ボタンを含む div を丸ごと置き換える

// chatTop全体を探す
const chatTopStart = content.indexOf('className="ha-chatTop"')
if (chatTopStart < 0) {
  console.log('ERROR: ha-chatTopが見つかりませんでした')
  process.exit(1)
}

// chatTopの閉じタグを探す（2つ目の </div>）
let depth = 0
let i = chatTopStart
let firstDivFound = false
let chatTopEnd = -1

while (i < content.length) {
  if (content.slice(i, i+4) === '<div') {
    depth++
    if (!firstDivFound) firstDivFound = true
  } else if (content.slice(i, i+6) === '</div>') {
    if (firstDivFound) {
      depth--
      if (depth === 0) {
        chatTopEnd = i + 6
        break
      }
    }
  }
  i++
}

if (chatTopEnd < 0) {
  console.log('ERROR: ha-chatTopの閉じタグが見つかりませんでした')
  process.exit(1)
}

const chatTopBlock = content.slice(chatTopStart - 16, chatTopEnd)
console.log('chatTop block length:', chatTopBlock.length)

// 新規チャットボタンの後に2つのボタンを追加
const resetBtnEnd = content.indexOf('</button>', content.indexOf('handleResetChat')) + 9
const insertPos = resetBtnEnd

const buttonsHtml = `
                {/* tab_nav_buttons_added */}
                <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                  <button type="button" onClick={() => setTab('properties')}
                    style={{ padding: '5px 10px', background: '#1a3a5c', color: '#fff', border: 'none', borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    🏠 物件情報
                  </button>
                  <button type="button" onClick={() => setTab('vendors')}
                    style={{ padding: '5px 10px', background: '#c9a84c', color: '#fff', border: 'none', borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    👷 業者一覧・比較
                  </button>
                </div>`

content = content.slice(0, insertPos) + buttonsHtml + content.slice(insertPos)

fs.writeFileSync(appPath, content, 'utf8')
console.log('SUCCESS: AIチャットにボタンを追加しました！npm run build を実行してください')
