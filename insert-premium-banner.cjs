const fs = require('fs')
const path = require('path')

const appPath = path.join(__dirname, 'src', 'App.jsx')
let content = fs.readFileSync(appPath, 'utf8')

if (content.includes('<PremiumUpgradeBanner')) {
  console.log('ℹ️  PremiumUpgradeBanner は既に挿入されています')
} else {
  content = content.replace(
    '<AuthPanel />',
    `<PremiumUpgradeBanner user={user} isPremium={isPremium} />\n              <AuthPanel />`
  )
  console.log('✅ <AuthPanel /> の前に PremiumUpgradeBanner を挿入しました')
}

if (content.includes("from('profiles')")) {
  console.log('ℹ️  isPremium 取得ロジックは既にあります')
} else {
  const target = 'setUser(session?.user ?? null)'
  if (content.includes(target)) {
    content = content.replace(
      target,
      `setUser(session?.user ?? null)
      if (session?.user) {
        supabase.from('profiles').select('is_premium').eq('id', session.user.id).single()
          .then(({ data }) => { if (data) setIsPremium(data.is_premium ?? false) })
      } else {
        setIsPremium(false)
      }`
    )
    console.log('✅ isPremium 取得ロジックを追加しました')
  } else {
    console.log('⚠️  setUser の挿入位置が見つかりませんでした')
  }
}

fs.writeFileSync(appPath, content, 'utf8')
console.log('')
console.log('✅ SUCCESS!')
