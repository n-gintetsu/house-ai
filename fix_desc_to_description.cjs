const fs = require('fs')
const path = require('path')

// AdminDashboard.jsx の desc → description 修正
const adminPath = path.join(__dirname, 'src', 'AdminDashboard.jsx')
let adminContent = fs.readFileSync(adminPath, 'utf8')

// adForm の desc フィールドを description に変更
adminContent = adminContent.replace(
  /const \[adForm, setAdForm\] = useState\(\{ label: '.*?', title: '', desc: '', url: '', active: true, color: '#1a3a5c' \}\)/,
  "const [adForm, setAdForm] = useState({ label: '広告', title: '', description: '', url: '', active: true, color: '#1a3a5c' })"
)

// adForm.desc → adForm.description
adminContent = adminContent.replace(/adForm\.desc/g, 'adForm.description')

// ...adForm の展開時に desc が含まれないよう、saveAd関数を修正
// insert時の { ...adForm } はそのままでOK（descriptionになっているので）

// setAdForm リセット時の desc → description
adminContent = adminContent.replace(
  /setAdForm\(\{ label: '.*?', title: '', desc: '', url: '', active: true, color: '#1a3a5c' \}\)/,
  "setAdForm({ label: '広告', title: '', description: '', url: '', active: true, color: '#1a3a5c' })"
)

// placeholder の desc 関連テキスト修正
adminContent = adminContent.replace(
  /placeholder="隱ｬ譏取枚.*?"/,
  'placeholder="説明文（例：外壁・内装・水回りの工事）"'
)

// adItems表示部分の item.desc → item.description
adminContent = adminContent.replace(/item\.desc/g, 'item.description')

fs.writeFileSync(adminPath, adminContent, 'utf8')
console.log('SUCCESS: AdminDashboard.jsx の desc → description 修正完了！')

// PremiumBanner.jsx の desc → description 修正
const bannerPath = path.join(__dirname, 'src', 'PremiumBanner.jsx')
let bannerContent = fs.readFileSync(bannerPath, 'utf8')

bannerContent = bannerContent.replace(/ad\.desc/g, 'ad.description')
bannerContent = bannerContent.replace(/item\.desc/g, 'item.description')

// FALLBACK_ADS の desc → description
bannerContent = bannerContent.replace(/desc: 'リフォームのご相談は信頼の提携業者へ'/g, "description: 'リフォームのご相談は信頼の提携業者へ'")
bannerContent = bannerContent.replace(/desc: 'ご成約者様に提携金融機関をご紹介します'/g, "description: 'ご成約者様に提携金融機関をご紹介します'")
// 汎用的に desc: を description: に置換（FALLBACK_ADS内）
bannerContent = bannerContent.replace(/(\s+)desc: /g, '$1description: ')

fs.writeFileSync(bannerPath, bannerContent, 'utf8')
console.log('SUCCESS: PremiumBanner.jsx の desc → description 修正完了！')
