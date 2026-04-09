const fs = require('fs')
const path = require('path')

const mainPath = path.join(__dirname, 'src', 'main.jsx')
let content = fs.readFileSync(mainPath, 'utf8')

console.log('現在のmain.jsx の内容:')
console.log(content)
console.log('\n---')

// AgencyDashboardのimportを追加（まだない場合）
if (!content.includes('AgencyDashboard')) {
  // AdminDashboardのimport行を探して、その後に追加
  if (content.includes("import AdminDashboard from './AdminDashboard'")) {
    content = content.replace(
      "import AdminDashboard from './AdminDashboard'",
      "import AdminDashboard from './AdminDashboard'\nimport AgencyDashboard from './AgencyDashboard'"
    )
    console.log('✅ AgencyDashboard importを追加しました')
  } else {
    // importがない場合、ファイル先頭のimport群の最後に追加
    const lines = content.split('\n')
    let lastImportLine = 0
    lines.forEach((line, i) => {
      if (line.startsWith('import ')) lastImportLine = i
    })
    lines.splice(lastImportLine + 1, 0, "import AgencyDashboard from './AgencyDashboard'")
    content = lines.join('\n')
    console.log('✅ AgencyDashboard importを末尾importの後に追加しました')
  }
}

// /agencyルートを追加
if (!content.includes("'/agency'") && !content.includes('"/agency"')) {
  // path === '/admin' の部分を探して前に追加
  if (content.includes("'/admin'")) {
    content = content.replace(
      "if (path === '/admin')",
      "if (path === '/agency') {\n    root.render(<AgencyDashboard />)\n  } else if (path === '/admin')"
    )
    console.log("✅ /agency ルートを追加しました（'/admin'の前に挿入）")
  } else if (content.includes('"/admin"')) {
    content = content.replace(
      'if (path === "/admin")',
      'if (path === "/agency") {\n    root.render(<AgencyDashboard />)\n  } else if (path === "/admin")'
    )
    console.log('✅ /agency ルートを追加しました（"/admin"の前に挿入）')
  } else {
    console.log('ERROR: /admin のルート記述が見つかりませんでした')
    console.log('main.jsx の内容を確認してください')
    process.exit(1)
  }
} else {
  console.log('INFO: /agency ルートはすでに存在します')
}

fs.writeFileSync(mainPath, content, 'utf8')
console.log('\nSUCCESS: main.jsx を更新しました！')
