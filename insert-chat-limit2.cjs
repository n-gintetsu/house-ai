const fs = require('fs')
const path = require('path')

const appPath = path.join(__dirname, 'src', 'App.jsx')
let content = fs.readFileSync(appPath, 'utf8')

// \r\n と \n 両方対応
const target1 = "    if (!text || isSending) return\r\n    setErrorMessage('')"
const target2 = "    if (!text || isSending) return\n    setErrorMessage('')"

const replacement = `    if (!text || isSending) return
    // 未ログイン時のチャット回数制限
    const currentUser = window.__houseAiUser || null
    if (!currentUser) {
      const todayCount = getTodayChatCount()
      if (todayCount >= AI_CHAT_FREE_LIMIT) {
        setErrorMessage('本日の無料チャット回数（5回）に達しました。会員登録すると無制限でご利用いただけます。')
        return
      }
      incrementTodayChatCount()
    }
    setErrorMessage('')`

if (content.includes('getTodayChatCount() >= AI_CHAT_FREE_LIMIT') || content.includes('todayCount >= AI_CHAT_FREE_LIMIT')) {
  console.log('ℹ️  チャット制限は既にあります')
} else if (content.includes(target1)) {
  content = content.replace(target1, replacement)
  console.log('✅ チャット制限チェックを追加しました（CRLF）')
} else if (content.includes(target2)) {
  content = content.replace(target2, replacement)
  console.log('✅ チャット制限チェックを追加しました（LF）')
} else {
  // \rを除去して再試行
  const stripped = content.replace(/\r/g, '')
  if (stripped.includes(target2)) {
    const newContent = stripped.replace(target2, replacement)
    fs.writeFileSync(appPath, newContent, 'utf8')
    console.log('✅ チャット制限チェックを追加しました（\r除去後）')
    console.log('\n✅ SUCCESS!')
    process.exit(0)
  }
  console.error('ERROR: 挿入位置が見つかりません')
  process.exit(1)
}

fs.writeFileSync(appPath, content, 'utf8')
console.log('\n✅ SUCCESS!')
