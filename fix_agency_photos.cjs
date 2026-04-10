const fs = require('fs')
const path = require('path')

const agPath = path.join(__dirname, 'src', 'AgencyDashboard.jsx')
let content = fs.readFileSync(agPath, 'utf8')

// 1. ImageUploaderをMultiImageUploaderに変更
const oldUploader = `                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>迚ｩ莉ｶ蜀咏悄</label>
                  <ImageUploader onUploaded={url => setForm(f => ({ ...f, image_url: url }))} currentUrl={form.image_url} />
                </div>`

const newUploader = `                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>物件写真（最大20枚・1枚目がメイン）</label>
                  <MultiImageUploader
                    onUploaded={urls => setForm(f => ({ ...f, image_url: urls[0] || '', image_urls: urls }))}
                    currentUrls={form.image_urls || (form.image_url ? [form.image_url] : [])}
                  />
                </div>`

if (content.includes(oldUploader)) {
  content = content.replace(oldUploader, newUploader)
  console.log('✅ ImageUploader → MultiImageUploader に変更しました')
} else {
  // 文字化けしている可能性があるので行番号で直接置き換え
  const lines = content.split('\n')
  let found = false
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('ImageUploader') && lines[i].includes('onUploaded') && lines[i].includes('image_url')) {
      // この行をMultiImageUploaderに変更
      const indent = lines[i].match(/^(\s*)/)[1]
      lines[i] = `${indent}<MultiImageUploader`
      lines.splice(i + 1, 0,
        `${indent}  onUploaded={urls => setForm(f => ({ ...f, image_url: urls[0] || '', image_urls: urls }))}`,
        `${indent}  currentUrls={form.image_urls || (form.image_url ? [form.image_url] : [])}`,
        `${indent}/>`
      )
      // 前の行のlabelも更新
      for (let j = i - 1; j >= Math.max(0, i - 5); j--) {
        if (lines[j].includes('label') && lines[j].includes('蜀咏悄')) {
          lines[j] = lines[j].replace(/蜀咏悄.*?(<\/label>)/, '物件写真（最大20枚）$1')
          break
        }
      }
      console.log(`✅ ${i + 1}行目のImageUploaderをMultiImageUploaderに変更しました`)
      found = true
      break
    }
  }
  if (!found) {
    console.log('ERROR: ImageUploaderが見つかりませんでした')
    process.exit(1)
  }
  content = lines.join('\n')
}

// 2. ImageUploaderの写真プレビューが横に広がる問題を修正
// style={{ width: '100%' }} → objectFit: 'cover' で正方形にならないように修正
const oldImgStyle = `style={{ width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 8, marginBottom: 8 }}`
const newImgStyle = `style={{ width: '100%', maxHeight: 180, objectFit: 'contain', borderRadius: 8, marginBottom: 8, background: '#f0f4f8' }}`

if (content.includes(oldImgStyle)) {
  content = content.replace(oldImgStyle, newImgStyle)
  console.log('✅ プレビュー画像の横広がりを修正しました')
}

// 3. initFormにimage_urlsがなければ追加
if (!content.includes("image_urls: []")) {
  content = content.replace(
    "image_url: '', is_public: true,",
    "image_url: '', image_urls: [], is_public: true,"
  )
  console.log('✅ initFormにimage_urlsを追加しました')
} else {
  console.log('INFO: image_urlsはすでにinitFormにあります')
}

fs.writeFileSync(agPath, content, 'utf8')
console.log('\nSUCCESS: AgencyDashboard.jsx を修正しました！npm run build を実行してください')
