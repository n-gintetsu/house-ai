const fs = require('fs')
const path = require('path')

const appPath = path.join(__dirname, 'src', 'App.jsx')
let content = fs.readFileSync(appPath, 'utf8')

// すでに更新済みチェック
if (content.includes('会員登録はこちら')) {
  console.log('INFO: すでに更新済みです')
  process.exit(0)
}

if (!content.includes('agencyType')) {
  console.log('ERROR: 業者選択画面が見つかりませんでした')
  process.exit(1)
}

// 不動産業者ボタンを変更
content = content.replace(
  '物件掲載ダッシュボードへ →',
  '会員登録はこちら →'
)

// その他業者ボタンを変更
content = content.replace(
  '広告掲載のお申し込みへ →',
  '会員登録はこちら →'
)

// 不動産業者カードにログインリンクを追加
content = content.replace(
  `                      <div style={{ display: 'inline-block', padding: '10px 24px', background: '#1a3a5c', color: '#fff', borderRadius: 10, fontWeight: 700, fontSize: 14 }}>
                        会員登録はこちら →
                      </div>
                    </div>
                    <div style={{ border: '2px solid #c9a84c'`,
  `                      <div style={{ display: 'inline-block', padding: '10px 24px', background: '#1a3a5c', color: '#fff', borderRadius: 10, fontWeight: 700, fontSize: 14 }}>
                        会員登録はこちら →
                      </div>
                      <div style={{ marginTop: 12, fontSize: 12, color: '#888' }}>
                        すでに登録済みの方は
                        <a href="/agency" style={{ color: '#1a3a5c', fontWeight: 700, marginLeft: 4 }}>こちらからログイン →</a>
                      </div>
                    </div>
                    <div style={{ border: '2px solid #c9a84c'`
)

// その他業者カードにもログインリンクを追加
content = content.replace(
  `                      <div style={{ display: 'inline-block', padding: '10px 24px', background: '#c9a84c', color: '#fff', borderRadius: 10, fontWeight: 700, fontSize: 14 }}>
                        会員登録はこちら →
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {agencyType === 'realestate'`,
  `                      <div style={{ display: 'inline-block', padding: '10px 24px', background: '#c9a84c', color: '#fff', borderRadius: 10, fontWeight: 700, fontSize: 14 }}>
                        会員登録はこちら →
                      </div>
                      <div style={{ marginTop: 12, fontSize: 12, color: '#888' }}>
                        すでに登録済みの方は
                        <a href="/agency" style={{ color: '#c9a84c', fontWeight: 700, marginLeft: 4 }}>こちらからログイン →</a>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {agencyType === 'realestate'`
)

fs.writeFileSync(appPath, content, 'utf8')
console.log('SUCCESS: ボタンとログインリンクを更新しました！npm run build を実行してください')
