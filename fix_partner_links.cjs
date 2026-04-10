const fs = require('fs')
const path = require('path')

const appPath = path.join(__dirname, 'src', 'App.jsx')
let content = fs.readFileSync(appPath, 'utf8')

// 不動産業者カードのonClickをpartnerページへの遷移に変更
// 現在: onClick={() => setAgencyType('realestate')}
// 変更後: 不動産業者はそのまま /agency へ、その他業者は /partner へ

// その他業者カードのonClickを/partnerへのリンクに変更
content = content.replace(
  `onClick={() => setAgencyType('other')}`,
  `onClick={() => window.location.href = '/partner'}`
)

// 不動産業者カードのonClickを/agencyへのリンクに変更  
content = content.replace(
  `onClick={() => setAgencyType('realestate')}`,
  `onClick={() => window.location.href = '/agency'}`
)

fs.writeFileSync(appPath, content, 'utf8')
console.log('SUCCESS: リンクを修正しました！npm run build を実行してください')
