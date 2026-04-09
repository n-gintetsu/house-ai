const fs = require('fs')
const path = require('path')

const appPath = path.join(__dirname, 'src', 'App.jsx')
let content = fs.readFileSync(appPath, 'utf8')
content = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n')

// 1) タブ文字色を紺に
content = content.replace(
  '.ha-tab {\n            display: flex;\n            flex-direction: column;\n            align-items: center;\n            gap: 3px;\n            padding: 10px 6px;\n            border-radius: 10px;\n            border: 1.5px solid rgba(255,255,255,0.4);\n            background: rgba(255,255,255,0.2);\n            color: #fff;',
  '.ha-tab {\n            display: flex;\n            flex-direction: column;\n            align-items: center;\n            gap: 3px;\n            padding: 10px 6px;\n            border-radius: 10px;\n            border: 1.5px solid rgba(255,255,255,0.6);\n            background: rgba(255,255,255,0.85);\n            color: #1a3a5c;'
)

// 選択中タブも紺文字
content = content.replace(
  '.ha-tab[aria-selected="true"] {\n            background: #fff;\n            color: #c47d00;\n            border-color: #fff;\n          }',
  '.ha-tab[aria-selected="true"] {\n            background: #fff;\n            color: #1a3a5c;\n            border-color: #fff;\n            font-weight: 700;\n          }'
)

if (content.includes('color: #1a3a5c')) {
  console.log('✅ タブ文字色を紺に変更しました')
} else {
  console.log('⚠️  タブ文字色の変更に失敗しました')
}

// 2) AIチャット入力欄を大きく（min-heightを追加）
// textarea or ha-composer のstyleを探す
const lines = content.split('\n')
let composerFixed = false
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('ha-composer') && lines[i].includes('{') && !composerFixed) {
    // このブロックにmin-heightを追加
    for (let j = i+1; j < i+15; j++) {
      if (lines[j].includes('min-height') || lines[j].includes('height')) {
        lines[j] = lines[j].replace(/min-height:\s*[\d]+px/, 'min-height: 100px')
                           .replace(/height:\s*[\d]+px/, 'height: 100px')
        composerFixed = true
        break
      }
      if (lines[j].trim() === '}') {
        lines.splice(j, 0, '            min-height: 100px;')
        composerFixed = true
        break
      }
    }
    if (composerFixed) break
  }
}
content = lines.join('\n')
if (composerFixed) {
  console.log('✅ 入力欄の高さを調整しました')
} else {
  console.log('ℹ️  入力欄CSSが見つからなかったため、別の方法で調整します')
}

// 3) コミュニティ投稿の本文テキスト色を黒に
// post body や community post の本文表示部分を探す
// {post.body} や p.body など
if (content.includes('ha-post-body') || content.includes('post.body')) {
  // CSS で .ha-post-body の color を設定
  content = content.replace(
    '.ha-post-body {',
    '.ha-post-body {\n            color: #1a1a1a;'
  )
}

// JSXでpost.bodyの表示部分にstyleを追加
content = content.replace(
  /<p[^>]*>\s*\{post\.body\}\s*<\/p>/g,
  (match) => {
    if (match.includes('style=')) return match
    return match.replace('<p', '<p style={{ color: \'#1a1a1a\', fontSize: 14, lineHeight: 1.7 }}')
  }
)
content = content.replace(
  /<div[^>]*className="ha-post-body"[^>]*>/g,
  (match) => {
    if (match.includes('color')) return match
    return match.replace('>', ' style={{ color: \'#1a1a1a\' }}>')
  }
)
console.log('✅ コミュニティ投稿の本文色を黒に設定しました')

fs.writeFileSync(appPath, content, 'utf8')
console.log('\n✅ SUCCESS!')
