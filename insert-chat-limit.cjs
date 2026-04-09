const fs = require('fs')
const path = require('path')

const appPath = path.join(__dirname, 'src', 'App.jsx')
let content = fs.readFileSync(appPath, 'utf8')

// 1) チャット制限チェックをhandleSendに追加
const target = `    if (!text || isSending) return
    setErrorMessage('')`

if (content.includes('getTodayChatCount() >= AI_CHAT_FREE_LIMIT')) {
  console.log('ℹ️  チャット制限は既にあります')
} else if (content.includes(target)) {
  content = content.replace(
    target,
    `    if (!text || isSending) return
    // 未ログイン時のチャット回数制限
    const currentUser = window.__houseAiUser || null
    if (!currentUser) {
      const count = getTodayChatCount()
      if (count >= AI_CHAT_FREE_LIMIT) {
        setErrorMessage('本日の無料チャット回数（5回）に達しました。会員登録すると無制限でご利用いただけます。')
        return
      }
      incrementTodayChatCount()
    }
    setErrorMessage('')`
  )
  console.log('✅ チャット制限チェックを追加しました')
} else {
  console.error('ERROR: 挿入位置が見つかりません')
  process.exit(1)
}

// 2) 会員登録促進バナーをAIチャット内に追加（エラーメッセージの近く）
// errorMessageの表示部分を探して、その下に会員登録促進を追加
if (content.includes('chatLimitBanner') || content.includes('会員登録で無制限')) {
  console.log('ℹ️  会員登録促進バナーは既にあります')
} else {
  // {errorMessage && ... の部分を探す
  const errorTarget = `{errorMessage && (`
  if (content.includes(errorTarget)) {
    content = content.replace(
      errorTarget,
      `{!window.__houseAiUser && getTodayChatCount() >= AI_CHAT_FREE_LIMIT && (
                <div style={{
                  background: 'linear-gradient(135deg, #1a3a5c, #2a5a8c)',
                  borderRadius: '10px',
                  padding: '14px 16px',
                  color: '#fff',
                  margin: '8px 0',
                  textAlign: 'center',
                }}>
                  <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>
                    🎉 会員登録で無制限に使えます！
                  </div>
                  <div style={{ fontSize: '11px', opacity: 0.85, marginBottom: '10px' }}>
                    無料・物件マッチングAI・お気に入り保存も
                  </div>
                  <button
                    onClick={() => { window.scrollTo(0,0); }}
                    style={{
                      background: '#c9a84c', color: '#fff', border: 'none',
                      borderRadius: '8px', padding: '8px 20px',
                      fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                    }}
                  >
                    無料会員登録はこちら →
                  </button>
                </div>
              )}
              {errorMessage && (`
    )
    console.log('✅ 会員登録促進バナーを追加しました')
  } else {
    console.log('⚠️  errorMessage表示部分が見つかりませんでした')
  }
}

fs.writeFileSync(appPath, content, 'utf8')
console.log('\n✅ SUCCESS!')
