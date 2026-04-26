const fs = require('fs');
const path = 'src/AdminDashboard.jsx';
let content = fs.readFileSync(path, 'utf8');

// 残っているsessionStorageを全てlocalStorageに置換
const count = (content.match(/sessionStorage/g) || []).length;
console.log(`残っている sessionStorage: ${count}件`);

if (count === 0) {
  console.log('⚠️  sessionStorage は見つかりませんでした。既に修正済みかもしれません。');
  process.exit(0);
}

content = content.replace(/sessionStorage/g, 'localStorage');
fs.writeFileSync(path, content, 'utf8');

// 確認
const remaining = (content.match(/sessionStorage/g) || []).length;
console.log(`修正後の残り: ${remaining}件`);
console.log('✅ 修正完了！次は npm run build を実行してください。');
