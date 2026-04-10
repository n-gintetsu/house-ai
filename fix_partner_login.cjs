const fs = require('fs')
const path = require('path')

const filePath = path.join(__dirname, 'src', 'PartnerDashboard.jsx')
let content = fs.readFileSync(filePath, 'utf8')

// ログイン成功後に/partnerに留まるよう修正
// signInWithPasswordの後にwindow.location.hrefを追加
content = content.replace(
  `const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setLoginError('メールアドレスまたはパスワードが正しくありません')
    setLoginLoading(false)`,
  `const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setLoginError('メールアドレスまたはパスワードが正しくありません')
    } else {
      window.location.href = '/partner'
    }
    setLoginLoading(false)`
)

fs.writeFileSync(filePath, content, 'utf8')
console.log('SUCCESS: ログイン後のリダイレクトを修正しました！npm run build を実行してください')
