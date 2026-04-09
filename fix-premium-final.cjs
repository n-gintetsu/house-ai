const fs = require('fs')
const path = require('path')

const appPath = path.join(__dirname, 'src', 'App.jsx')
let content = fs.readFileSync(appPath, 'utf8')

// 1) isPremiumステートを追加
// userステートを探す（AuthPanelがある=useStateでuserを管理しているはず）
// App関数内の最初のuseStateを探す
if (content.includes('isPremium')) {
  console.log('ℹ️  isPremium は既にあります')
} else {
  // const [posts, setPosts] = useState([]) など最初のuseStateの前に追加
  // より確実な方法：関数コンポーネントの開始直後
  // "function App()" または "export default function" を探す
  const appFuncMatch = content.match(/export default function \w+\s*\([^)]*\)\s*\{/)
  if (appFuncMatch) {
    const insertAfter = appFuncMatch[0]
    content = content.replace(
      insertAfter,
      insertAfter + '\n  const [isPremium, setIsPremium] = React.useState ? React.useState(false) : (() => { throw new Error() })()'
    )
  }
  
  // もっとシンプルな方法：useStateのimportがあるのでそれを使う
  // 最初のuseState呼び出しの前の行に追加
  content = content.replace(
    /^(export default function \w+)/m,
    '$1'
  )
  
  // 一番確実：const [posts または const [chatMessages などの最初のuseStateの前に挿入
  const firstUseState = content.match(/\n(\s+)(const \[[a-z])/m)
  if (firstUseState) {
    const indent = firstUseState[1]
    content = content.replace(
      firstUseState[0],
      `\n${indent}const [isPremium, setIsPremium] = useState(false)${firstUseState[0]}`
    )
    console.log('✅ isPremium ステートを追加しました')
  } else {
    console.error('ERROR: useState挿入位置が見つかりません')
    process.exit(1)
  }
}

// 2) <AuthPanel /> の前にバナーを挿入（isPremiumが定義された後なら安全）
if (content.includes('<PremiumUpgradeBanner')) {
  console.log('ℹ️  PremiumUpgradeBanner は既にあります')
} else {
  content = content.replace(
    '              <AuthPanel />',
    '              <PremiumUpgradeBanner user={null} isPremium={isPremium} />\n              <AuthPanel />'
  )
  console.log('✅ PremiumUpgradeBanner を挿入しました')
}

fs.writeFileSync(appPath, content, 'utf8')
console.log('\n✅ SUCCESS!')
