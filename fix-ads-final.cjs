const fs = require('fs')
const path = require('path')

const filePath = path.join(__dirname, 'src', 'AdminDashboard.jsx')
let content = fs.readFileSync(filePath, 'utf8')
content = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n')

const lines = content.split('\n')

// 1) TABS に 'ads' を追加（なければ）
if (!content.includes("id: 'ads'")) {
  // 20行目付近の owners の後に追加
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("id: 'owners'")) {
      lines[i] = lines[i] + "\n  { id: 'ads', label: '📢 広告管理' },"
      console.log(`✅ ${i+1}行目の後にads tabを追加`)
      break
    }
  }
} else {
  console.log('ℹ️  ads tab already in TABS')
}

// 2) activeTab === 'ads' の表示JSXを追加
// owners の表示ブロックを探す
// "activeTab === 'owners'" を探す
let ownersTabIdx = -1
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("activeTab === 'owners'") || lines[i].includes('activeTab === "owners"')) {
    ownersTabIdx = i
  }
}

if (ownersTabIdx < 0) {
  // owners という文字を含む表示ブロックを探す（別パターン）
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("'owners'") && lines[i].includes('tab ===')) {
      ownersTabIdx = i
    }
  }
}

console.log(`owners tab idx: ${ownersTabIdx}`)

if (ownersTabIdx > 0 && !content.includes("activeTab === 'ads'")) {
  // ownersブロックの終わりを見つける（括弧の深さを追跡）
  let depth = 0
  let blockStart = false
  let endIdx = ownersTabIdx

  for (let i = ownersTabIdx; i < lines.length; i++) {
    for (const ch of lines[i]) {
      if (ch === '(') { depth++; blockStart = true }
      if (ch === ')') depth--
    }
    if (blockStart && depth <= 0) {
      endIdx = i
      break
    }
  }

  console.log(`owners block ends at line ${endIdx + 1}`)

  const adsSection = `
              {activeTab === 'ads' && (
                <div>
                  <h2 style={{ margin: '0 0 20px', color: '#1a3a5c', fontSize: 20 }}>📢 広告管理</h2>
                  <AdManagement supabaseAdmin={supabaseAdmin} />
                </div>
              )}`

  lines.splice(endIdx + 1, 0, adsSection)
  console.log(`✅ 広告管理セクションを${endIdx + 2}行目に挿入`)
} else if (content.includes("activeTab === 'ads'")) {
  console.log('ℹ️  ads section already exists')
} else {
  console.log('⚠️  owners tab not found, trying last resort...')
  // 最終手段: コンテンツエリア最後の </div> の手前に挿入
  // 具体的には AdManagement コンポーネント定義の直前の行を探す
  for (let i = lines.length - 1; i >= 0; i--) {
    if (lines[i].includes('function AdManagement(')) {
      const adsSection = `
              {activeTab === 'ads' && (
                <div>
                  <h2 style={{ margin: '0 0 20px', color: '#1a3a5c', fontSize: 20 }}>📢 広告管理</h2>
                  <AdManagement supabaseAdmin={supabaseAdmin} />
                </div>
              )}`
      // AdManagement の2行前あたりの閉じdivの後に挿入
      // まず return の閉じ括弧を探す
      for (let j = i - 1; j >= 0; j--) {
        if (lines[j].trim() === ')' && lines[j-1] && lines[j-1].trim().startsWith('</div>')) {
          lines.splice(j, 0, adsSection)
          console.log(`✅ 最終手段: ${j+1}行目に挿入`)
          break
        }
      }
      break
    }
  }
}

const newContent = lines.join('\n')
fs.writeFileSync(filePath, newContent, 'utf8')
console.log('\n✅ SUCCESS!')
