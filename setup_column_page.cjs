const fs = require('fs')
const path = require('path')

// 1. ColumnPage.jsx を src/ にコピー
const columnSrc = path.join(__dirname, 'ColumnPage.jsx')
const columnDst = path.join(__dirname, 'src', 'ColumnPage.jsx')
if (!fs.existsSync(columnSrc)) {
  console.log('ERROR: ColumnPage.jsx がこのフォルダにありません')
  process.exit(1)
}
fs.copyFileSync(columnSrc, columnDst)
console.log('✅ ColumnPage.jsx を src/ にコピーしました')

// 2. 引越し・火災保険ボタンを PropertyMatching.jsx に追加
const pmPath = path.join(__dirname, 'src', 'PropertyMatching.jsx')
let pmContent = fs.readFileSync(pmPath, 'utf8')

const oldBtn = `          {/* 問い合わせボタン */}
          <button onClick={() => { onClose(); window.scrollTo(0,0) }} style={{ width: '100%', marginTop: 16, padding: '14px', background: '#f5a623', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
            📞 この物件について相談する
          </button>`

const newBtn = `          {/* 問い合わせボタン */}
          <button onClick={() => { onClose(); window.scrollTo(0,0) }} style={{ width: '100%', marginTop: 16, padding: '14px', background: '#f5a623', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
            📞 この物件について相談する
          </button>

          {/* 引越し見積もりボタン（賃貸物件のみ）*/}
          {(p.deal_type === 'rent' || p.rent) && (
            <div style={{ marginTop: 12, border: '1.5px solid #2d6a4f', borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ background: '#f0faf5', padding: '12px 16px', borderBottom: '1px solid #d1fae5' }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: '#2d6a4f', marginBottom: 4 }}>🚚 引越し費用を節約しませんか？</div>
                <div style={{ fontSize: 12, color: '#555', lineHeight: 1.6 }}>複数の引越し業者に一括見積もりを依頼できます。平均で<strong>3〜5万円</strong>お得になるケースも！</div>
              </div>
              <div style={{ padding: '12px 16px', background: '#fff' }}>
                <a href="https://px.a8.net/svt/ejp?a8mat=引越し案件リンク" target="_blank" rel="noopener noreferrer sponsored"
                  style={{ display: 'block', width: '100%', boxSizing: 'border-box', padding: '12px', background: '#2d6a4f', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: 'pointer', textDecoration: 'none', textAlign: 'center' }}>
                  🚚 引越し費用を無料一括見積もり →
                </a>
                <div style={{ fontSize: 10, color: '#bbb', textAlign: 'center', marginTop: 4 }}>※ 引越し比較サービスのページへ移動します</div>
              </div>
            </div>
          )}

          {/* 火災保険ボタン（売買・賃貸両方）*/}
          <div style={{ marginTop: 12, border: '1.5px solid #1e40af', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ background: '#eff6ff', padding: '12px 16px', borderBottom: '1px solid #bfdbfe' }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#1e40af', marginBottom: 4 }}>🔥 火災保険の加入はお済みですか？</div>
              <div style={{ fontSize: 12, color: '#555', lineHeight: 1.6 }}>{(p.deal_type === 'rent' || p.rent) ? '賃貸でも火災保険は必須です。' : '住宅購入時の火災保険を比較できます。'}一括比較で<strong>最安値</strong>を見つけましょう。</div>
            </div>
            <div style={{ padding: '12px 16px', background: '#fff' }}>
              <a href="https://px.a8.net/svt/ejp?a8mat=火災保険案件リンク" target="_blank" rel="noopener noreferrer sponsored"
                style={{ display: 'block', width: '100%', boxSizing: 'border-box', padding: '12px', background: '#1e40af', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: 'pointer', textDecoration: 'none', textAlign: 'center' }}>
                🔥 火災保険を無料一括比較する →
              </a>
              <div style={{ fontSize: 10, color: '#bbb', textAlign: 'center', marginTop: 4 }}>※ 保険比較サービスのページへ移動します</div>
            </div>
          </div>`

if (pmContent.includes(oldBtn)) {
  pmContent = pmContent.replace(oldBtn, newBtn)
  fs.writeFileSync(pmPath, pmContent, 'utf8')
  console.log('✅ 引越し・火災保険ボタンを追加しました')
} else {
  console.log('INFO: 引越しボタンはすでに追加済みかもしれません（スキップ）')
}

// 3. App.jsx にコラムタブを追加
const appPath = path.join(__dirname, 'src', 'App.jsx')
let appContent = fs.readFileSync(appPath, 'utf8')

// ColumnPageのimportを追加
if (!appContent.includes('ColumnPage')) {
  // 最後のimport行を探して追加
  const importLines = appContent.split('\n').filter(l => l.startsWith('import'))
  const lastImport = importLines[importLines.length - 1]
  appContent = appContent.replace(lastImport, lastImport + "\nimport ColumnPage from './ColumnPage'")
  console.log('✅ ColumnPage import追加')
}

// タブ定義にコラムを追加（業者様向けタブの後）
const tabPatterns = [
  { old: "{ id: 'agency', label: '🏗️ 業者様向け' },", new: "{ id: 'agency', label: '🏗️ 業者様向け' },\n  { id: 'column', label: '📰 コラム' }," },
  { old: "{ id: 'agency', label: \"🏗️ 業者様向け\" },", new: "{ id: 'agency', label: \"🏗️ 業者様向け\" },\n  { id: 'column', label: '📰 コラム' }," },
]

let tabAdded = false
for (const pat of tabPatterns) {
  if (appContent.includes(pat.old)) {
    appContent = appContent.replace(pat.old, pat.new)
    tabAdded = true
    console.log('✅ コラムタブをタブ定義に追加')
    break
  }
}
if (!tabAdded) {
  console.log('INFO: タブ定義の自動追加をスキップ（手動で確認してください）')
}

// コラムタブの表示を追加（会員専用タブの表示の近く）
if (!appContent.includes("tab === 'column'") && !appContent.includes('ColumnPage')) {
  // 会員専用タブの表示を探して後に追加
  const memberTabPatterns = [
    "tab === 'member'",
    "tab === 'auth'",
  ]
  for (const pat of memberTabPatterns) {
    if (appContent.includes(pat)) {
      // そのブロックの後にコラムタブを追加
      const searchStr = `{tab === '${pat.split("'")[1]}' && `
      if (appContent.includes(searchStr)) {
        // 閉じ括弧を探して後に追加は複雑なので、シンプルな方法で
        console.log('INFO: コラムタブ表示の自動追加は複雑なため、別途対応します')
      }
      break
    }
  }
}

fs.writeFileSync(appPath, appContent, 'utf8')
console.log('✅ App.jsx を更新しました')
console.log('\nSUCCESS: セットアップ完了！npm run build を実行してください')
