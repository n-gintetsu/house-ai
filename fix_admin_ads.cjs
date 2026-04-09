const fs = require('fs')
const path = require('path')

const filePath = path.join(__dirname, 'src', 'AdminDashboard.jsx')

let content = fs.readFileSync(filePath, 'utf8')

// 会員管理パネルの表示部分の後に広告管理タブを追加
const target = `          {/* 莨壼藤邂｡逅・*/}
          {tab === 'members' && (
            <MembersPanel supabaseAdmin={supabaseAdmin} />
          )}`

const replacement = `          {/* 莨壼藤邂｡逅・*/}
          {tab === 'members' && (
            <MembersPanel supabaseAdmin={supabaseAdmin} />
          )}

          {/* 蠎・相邂｡逅・*/}
          {tab === 'ads' && (
            <div>
              <h2 style={{ margin: '0 0 20px', color: '#1a3a5c', fontSize: 20 }}>📢 広告管理</h2>
              <AdManagement supabaseAdmin={supabaseAdmin} />
            </div>
          )}`

if (content.includes(target)) {
  content = content.replace(target, replacement)
  fs.writeFileSync(filePath, content, 'utf8')
  console.log('SUCCESS: 広告管理タブの表示を追加しました！')
} else {
  console.log('ERROR: 対象箇所が見つかりませんでした。')
  console.log('別の方法で修正します...')

  // 別パターンで検索（文字化けを考慮）
  const lines = content.split('\n')
  let membersPanelEndLine = -1

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("tab === 'members'") && lines[i+1] && lines[i+1].includes('MembersPanel')) {
      // 閉じの行を探す
      for (let j = i; j < Math.min(i+10, lines.length); j++) {
        if (lines[j].includes(')}') && j > i) {
          membersPanelEndLine = j
          break
        }
      }
      break
    }
  }

  if (membersPanelEndLine >= 0) {
    lines.splice(membersPanelEndLine + 1, 0,
      '',
      "          {/* 広告管理 */}",
      "          {tab === 'ads' && (",
      "            <div>",
      "              <h2 style={{ margin: '0 0 20px', color: '#1a3a5c', fontSize: 20 }}>📢 広告管理</h2>",
      "              <AdManagement supabaseAdmin={supabaseAdmin} />",
      "            </div>",
      "          )}"
    )
    fs.writeFileSync(filePath, lines.join('\n'), 'utf8')
    console.log('SUCCESS: 広告管理タブの表示を追加しました！（別パターン）')
  } else {
    console.log('FAILED: 自動修正できませんでした。手動対応が必要です。')
  }
}
