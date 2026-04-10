const fs = require('fs')
const path = require('path')

// main.jsxにPartnerDashboardのルートを追加
const mainPath = path.join(__dirname, 'src', 'main.jsx')
let content = fs.readFileSync(mainPath, 'utf8')

if (content.includes('PartnerDashboard')) {
  console.log('INFO: すでにPartnerDashboardが追加されています')
  process.exit(0)
}

// AgencyDashboardのimportの後にPartnerDashboardを追加
content = content.replace(
  "import AgencyDashboard from './AgencyDashboard'",
  "import AgencyDashboard from './AgencyDashboard'\nimport PartnerDashboard from './PartnerDashboard'"
)

// /agencyのルートの後に/partnerを追加
content = content.replace(
  "loc === '/agency' ? <AgencyDashboard /> :",
  "loc === '/agency' ? <AgencyDashboard /> :\n    loc === '/partner' ? <PartnerDashboard /> :"
)

fs.writeFileSync(mainPath, content, 'utf8')
console.log('SUCCESS: /partnerルートを追加しました！npm run build を実行してください')
