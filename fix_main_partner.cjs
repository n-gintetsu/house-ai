const fs = require('fs')
const path = require('path')

const mainPath = path.join(__dirname, 'src', 'main.jsx')
let content = fs.readFileSync(mainPath, 'utf8')

if (content.includes("pathname === '/partner'")) {
  console.log('INFO: すでに/partnerルートが追加されています')
  process.exit(0)
}

// AgencyDashboardのelse ifの後に/partnerを追加
content = content.replace(
  `} else if (pathname === '/agency' || pathname === '/agency/') {
  Component = AgencyDashboard
}`,
  `} else if (pathname === '/agency' || pathname === '/agency/') {
  Component = AgencyDashboard
} else if (pathname === '/partner' || pathname === '/partner/') {
  Component = PartnerDashboard
}`
)

fs.writeFileSync(mainPath, content, 'utf8')
console.log('SUCCESS: /partnerルートを追加しました！npm run build を実行してください')
