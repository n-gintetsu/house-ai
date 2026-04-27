// add-community-banner-v3.cjs
// ha-chatWrap の閉じ </div> を目印にして挿入
const fs = require('fs');
const path = require('path');

const filePath = path.join(process.env.HOME, 'Desktop', 'house-ai', 'src', 'App.jsx');
const content = fs.readFileSync(filePath, 'utf8');

// 挿入ターゲット: chat ブロックの閉じパターン
// </form>\n        </div>\n        )}
// この </div>\n        )} の直前（</div> と )} の間）にバナーを挿入

const TARGET = `            </form>
        </div>
        )}`;

const REPLACEMENT = `            </form>
        </div>
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
        </div>
        )}`;

if (!content.includes(TARGET)) {
  console.error('❌ ターゲット文字列が見つかりません。以下を確認してください:');
  console.error(JSON.stringify(TARGET));
  process.exit(1);
}

const count = (content.match(new RegExp(TARGET.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
if (count > 1) {
  console.error(`❌ ターゲット文字列が${count}箇所見つかりました。安全のため中断します。`);
  process.exit(1);
}

const newContent = content.replace(TARGET, REPLACEMENT);
fs.writeFileSync(filePath, newContent, 'utf8');
console.log('✅ App.jsx を更新しました！');
console.log('次のステップ:');
console.log('npm run build && git add -A && git commit -m "add community banner below chat" && git push');
