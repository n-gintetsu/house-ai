// add-community-banner-v2.cjs
// 行番号直接指定版 — 1362行目の </div> と 1363行目の )} の間に挿入
const fs = require('fs');
const path = require('path');

const filePath = path.join(process.env.HOME, 'Desktop', 'house-ai', 'src', 'App.jsx');
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

// 挿入前に現在の行内容を確認
console.log('現在の行内容確認:');
for (let i = 1358; i <= 1365; i++) {
  console.log(`  ${i + 1}: "${lines[i]}"`);
}

// )} を含む行を1360〜1370の範囲で探す
let insertIdx = -1;
for (let i = 1360; i <= 1370; i++) {
  if (lines[i] && lines[i].trim() === ')}') {
    insertIdx = i;
    break;
  }
}

if (insertIdx === -1) {
  console.error('❌ )} が見つかりません。行内容を確認してください。');
  process.exit(1);
}

console.log(`\n✅ )} 発見: ${insertIdx + 1}行目`);
console.log(`✅ バナーを ${insertIdx + 1}行目（)}の直前）に挿入します`);

const bannerJSX = `        {/* ===== コミュニティ誘導バナー ===== */}
        <div
          onClick={() => setTab('community')}
          style={{
            margin: '12px 16px 0',
            padding: '14px 18px',
            background: 'linear-gradient(135deg, #faf7f2 0%, #f5f0e8 100%)',
            border: '1px solid #e8dfc8',
            borderRadius: 14,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}
          onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(26,58,92,0.10)'}
          onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
        >
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#2c2010', marginBottom: 3 }}>
              💬 あなたの体験談・不満をみんなと共有しませんか？
            </p>
            <p style={{ fontSize: 11, color: '#b8a898', margin: 0 }}>
              コミュニティで声を投稿する →
            </p>
          </div>
          <span style={{
            background: '#c9a84c',
            color: '#fff',
            fontSize: 11,
            fontWeight: 700,
            borderRadius: 6,
            padding: '4px 10px',
            flexShrink: 0,
          }}>
            参加する
          </span>
        </div>`;

// insertIdx（)}の行）の直前に挿入
lines.splice(insertIdx, 0, bannerJSX);

fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
console.log('✅ App.jsx を更新しました！');
console.log('\n次のステップ:');
console.log('npm run build && git add -A && git commit -m "add community banner below chat" && git push');
