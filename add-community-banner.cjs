// add-community-banner.cjs
// AIチャット真下にコミュニティバナーを追加
const fs = require('fs');
const path = require('path');

const filePath = path.join(process.env.HOME, 'Desktop', 'house-ai', 'src', 'App.jsx');
const lines = fs.readFileSync(filePath, 'utf8').split('\n');

// 挿入するJSX（1361行目の </div> の後、1362行目の )} の前に挿入）
const bannerJSX = `
        {/* ===== コミュニティ誘導バナー ===== */}
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
            transition: 'box-shadow 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(26,58,92,0.10)'}
          onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
        >
          <div>
            <p style={{
              fontSize: 13,
              fontWeight: 700,
              color: '#2c2010',
              marginBottom: 3,
            }}>
              💬 あなたの体験談・不満をみんなと共有しませんか？
            </p>
            <p style={{
              fontSize: 11,
              color: '#b8a898',
              margin: 0,
            }}>
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

// 構造:
// </form>
// </div>   ← chatWrap の閉じdiv
// )}       ← ここの前（</div>の後）に挿入

// chat セクション内の </form> を探す
let formCloseIdx = -1;
for (let i = 1250; i < 1380; i++) {
  if (lines[i] && lines[i].trim() === '</form>') {
    formCloseIdx = i;
    break;
  }
}

if (formCloseIdx === -1) {
  console.error('❌ </form> が見つかりませんでした');
  process.exit(1);
}

// </form> の後の )} を探す（その直前の </div> が挿入ポイント）
let parenCloseIdx = -1;
for (let i = formCloseIdx + 1; i < formCloseIdx + 10; i++) {
  if (lines[i] && lines[i].trim() === ')}') {
    parenCloseIdx = i;
    break;
  }
}

if (parenCloseIdx === -1) {
  console.error('❌ )} が見つかりませんでした');
  process.exit(1);
}

// )} の直前の </div> を確認
const insertIdx = parenCloseIdx - 1;
console.log(`✅ </form> 発見: ${formCloseIdx + 1}行目`);
console.log(`✅ )}      発見: ${parenCloseIdx + 1}行目`);
console.log(`✅ バナーを ${insertIdx + 2}行目（</div>の直後・)}の直前）に挿入します`);
console.log(`   挿入位置の行内容: "${lines[insertIdx]}"`);

// </div> の後（)} の前）に挿入
lines.splice(parenCloseIdx, 0, bannerJSX);

fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
console.log('✅ App.jsx を更新しました！');
console.log('次のステップ: npm run build && git add -A && git commit -m "add community banner below chat" && git push');
