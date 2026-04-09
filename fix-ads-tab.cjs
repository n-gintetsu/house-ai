const fs = require('fs')
const path = require('path')

const filePath = path.join(__dirname, 'src', 'AdminDashboard.jsx')
let content = fs.readFileSync(filePath, 'utf8')

// owners セクションの終わり部分を探して直後に追加
// {activeTab === 'owners' の部分を探す
if (content.includes("activeTab === 'ads'")) {
  console.log('ℹ️  ads表示切り替えは既にあります')
  process.exit(0)
}

// owners タブの表示部分を探す（ownersという文字を含む条件式）
const ownersTabMatch = content.match(/\{tab\s*===\s*['"]owners['"]\s*&&[\s\S]*?\}\s*\}\s*\)/m) ||
                       content.match(/activeTab\s*===\s*['"]owners['"][\s\S]*?\n\s*\}\)\s*\n/)

// 別アプローチ: コンテンツエリアの終わり近くに挿入
// 最後の </div> の前、かつ </main> や コンテンツラッパーの前
// owners という単語を含む最後のブロックを探す

const lines = content.split('\n')
let ownersEndLine = -1

// "owners" を含む行を探す（表示コンテンツ部分）
for (let i = lines.length - 1; i >= 0; i--) {
  if (lines[i].includes("'owners'") && lines[i].includes('tab')) {
    // このブロックの終わりを探す
    let depth = 0
    for (let j = i; j < lines.length; j++) {
      for (const ch of lines[j]) {
        if (ch === '(') depth++
        if (ch === ')') depth--
      }
      if (depth < 0 || (depth === 0 && j > i)) {
        ownersEndLine = j
        break
      }
    }
    break
  }
}

if (ownersEndLine > 0) {
  const insertion = `
              {activeTab === 'ads' && (
                <div>
                  <h2 style={{ margin: '0 0 20px', color: '#1a3a5c', fontSize: 20 }}>📢 広告管理</h2>
                  <AdManagement supabaseAdmin={supabaseAdmin} />
                </div>
              )}`
  lines.splice(ownersEndLine + 1, 0, insertion)
  content = lines.join('\n')
  console.log(`✅ ${ownersEndLine+1}行目の後に広告管理セクションを挿入しました`)
} else {
  // フォールバック: コンテンツエリア終わりの </div> の手前に追加
  // 最後から2番目の大きな </div> を探す
  const lastMainDiv = content.lastIndexOf('          </div>\n        </div>')
  if (lastMainDiv > 0) {
    const insertion = `
              {activeTab === 'ads' && (
                <div>
                  <h2 style={{ margin: '0 0 20px', color: '#1a3a5c', fontSize: 20 }}>📢 広告管理</h2>
                  <AdManagement supabaseAdmin={supabaseAdmin} />
                </div>
              )}
`
    content = content.slice(0, lastMainDiv) + insertion + content.slice(lastMainDiv)
    console.log('✅ 広告管理セクションを挿入しました（フォールバック）')
  } else {
    console.error('ERROR: 挿入位置が見つかりません')
    process.exit(1)
  }
}

fs.writeFileSync(filePath, content, 'utf8')
console.log('\n✅ SUCCESS!')
