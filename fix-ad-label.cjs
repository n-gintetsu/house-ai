const fs = require('fs')
const path = require('path')

const filePath = path.join(__dirname, 'src', 'PremiumBanner.jsx')
let content = fs.readFileSync(filePath, 'utf8')

// "広告" テキストを1つに修正
content = content.replace(
  `<div style={{ fontSize: '10px', color: '#999', marginBottom: '6px' }}>
        <span style={{
          background: '#f0f0f0',
          padding: '1px 6px',
          borderRadius: '3px',
          marginRight: '6px',
        }}>{ad.label}</span>
        広告
      </div>`,
  `<div style={{ fontSize: '10px', color: '#999', marginBottom: '6px' }}>
        <span style={{
          background: '#f0f0f0',
          padding: '1px 6px',
          borderRadius: '3px',
        }}>{ad.label}</span>
      </div>`
)

fs.writeFileSync(filePath, content, 'utf8')
console.log('✅ SUCCESS! 広告ラベルの重複を修正しました')
