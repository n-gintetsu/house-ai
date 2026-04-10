const fs = require('fs')
const path = require('path')

const appPath = path.join(__dirname, 'src', 'App.jsx')
let content = fs.readFileSync(appPath, 'utf8')

// 現在のボタンテキストを確認してログ出力
const checks = [
  '物件掲載ダッシュボードへ',
  '広告掲載のお申し込みへ',
  '会員登録はこちら',
  'agencyType'
]
checks.forEach(c => {
  console.log(`"${c}" 存在: ${content.includes(c)}`)
})

// 不動産業者ボタンを変更
if (content.includes('物件掲載ダッシュボードへ')) {
  content = content.split('物件掲載ダッシュボードへ →').join('会員登録はこちら →')
  console.log('不動産ボタン: 変更完了')
} else {
  console.log('不動産ボタン: 見つかりませんでした')
}

// その他業者ボタンを変更
if (content.includes('広告掲載のお申し込みへ')) {
  content = content.split('広告掲載のお申し込みへ →').join('会員登録はこちら →')
  console.log('その他業者ボタン: 変更完了')
} else {
  console.log('その他業者ボタン: 見つかりませんでした')
}

fs.writeFileSync(appPath, content, 'utf8')
console.log('SUCCESS: 書き込み完了！npm run build を実行してください')
