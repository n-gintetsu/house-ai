const fs = require('fs');
const path = 'src/AdminDashboard.jsx';
let content = fs.readFileSync(path, 'utf8');

const count = (content.match(/sessionStorage/g) || []).length;
console.log(`sessionStorage の箇所: ${count}件`);

content = content.replace(/sessionStorage/g, 'localStorage');

fs.writeFileSync(path, content, 'utf8');
console.log('✅ 全て localStorage に変更しました！次は npm run build を実行してください。');
