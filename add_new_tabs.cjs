const fs = require('fs')
const path = require('path')

const appPath = path.join(__dirname, 'src', 'App.jsx')
let content = fs.readFileSync(appPath, 'utf8')

if (content.includes("id: 'properties'")) {
  console.log('INFO: すでに新タブが追加されています')
  process.exit(0)
}

// 1. importを追加
content = content.replace(
  "import { useState, useEffect, useRef } from 'react'",
  "import { useState, useEffect, useRef } from 'react'\nimport PropertiesPage from './PropertiesPage'\nimport VendorPage from './VendorPage'"
)

// importがない場合の別パターン
if (!content.includes('PropertiesPage')) {
  content = content.replace(
    "import { useState,",
    "import PropertiesPage from './PropertiesPage'\nimport VendorPage from './VendorPage'\nimport { useState,"
  )
}

// 2. タブ定義に新タブを追加（chatタブの前に追加）
content = content.replace(
  "{ id: 'chat',",
  "{ id: 'properties', label: '🏠 物件情報', icon: '🏠' },\n  { id: 'vendors', label: '👷 業者一覧', icon: '👷' },\n  { id: 'chat',"
)

// 3. AIチャットタブの表示部分の前にボタンを追加
content = content.replace(
  "{tab === 'chat' && (",
  `{tab === 'properties' && (
            <div className="ha-panel" style={{ padding: 0 }}>
              <PropertiesPage user={user} />
            </div>
          )}
          {tab === 'vendors' && (
            <div className="ha-panel" style={{ padding: 0 }}>
              <VendorPage />
            </div>
          )}
          {tab === 'chat' && (`
)

fs.writeFileSync(appPath, content, 'utf8')
console.log('SUCCESS: 物件情報・業者一覧タブを追加しました！npm run build を実行してください')
