const fs = require('fs');

const filePath = 'src/AdminDashboard.jsx';
const raw = fs.readFileSync(filePath, 'utf8');
let content = raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

// リンク化されてしまった箇所を正しいコードに修正
const fixes = [
  // partnerProfiles.map
  ['[partnerProfiles.map](http://partnerProfiles.map)', 'partnerProfiles.map'],
  // p.company_name
  ['[p.company](http://p.company)_name', 'p.company_name'],
  // p.ad_title
  ['[p.ad](http://p.ad)_title', 'p.ad_title'],
  // p.ad_description  
  ['[p.ad](http://p.ad)_description', 'p.ad_description'],
  // p.ad_status
  ['[p.ad](http://p.ad)_status', 'p.ad_status'],
];

let fixed = 0;
fixes.forEach(([from, to]) => {
  if (content.includes(from)) {
    content = content.split(from).join(to);
    console.log(`✓ 修正: ${from} → ${to}`);
    fixed++;
  }
});

if (fixed === 0) {
  console.log('修正箇所が見つかりませんでした');
} else {
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`SUCCESS: ${fixed}箇所を修正しました`);
}
