const fs = require('fs');

const filePath = 'src/App.jsx';
const content = fs.readFileSync(filePath, 'utf8');

// 現在の3つのボタンが並んでいる部分を特定して、divで囲む
// 「{/* chat_nav_buttons_v3 */}」の直後から「新規チャット」ボタンの閉じタグまでを置換

const oldPart = `                {/* chat_nav_buttons_v3 */}
                <button type="button" onClick={() => setTab('properties')}
                  style={{ padding: '5px 10px', background: '#1a3a5c', color: '#fff', border: 'none', borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  🏠 物件情報
                </button>
                <button type="button" onClick={() => setTab('vendors')}
                  style={{ padding: '5px 10px', background: '#c9a84c', color: '#fff', border: 'none', borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  👷 業者一覧・比較
                </button>
                <button type="button" className="ha-btn ha-btnGhost" onClick={handleResetChat} disabled={isSending}>
                  新規チャット
                </button>`;

const newPart = `                {/* chat_nav_buttons_v3 */}
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                  <button type="button" onClick={() => setTab('properties')}
                    style={{ padding: '5px 10px', background: '#1a3a5c', color: '#fff', border: 'none', borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    🏠 物件情報
                  </button>
                  <button type="button" onClick={() => setTab('vendors')}
                    style={{ padding: '5px 10px', background: '#c9a84c', color: '#fff', border: 'none', borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    👷 業者一覧・比較
                  </button>
                  <button type="button" className="ha-btn ha-btnGhost" onClick={handleResetChat} disabled={isSending}>
                    新規チャット
                  </button>
                </div>`;

if (!content.includes(oldPart)) {
  console.log('ERROR: 対象の文字列が見つかりませんでした。');
  console.log('現在のchat_nav_buttons_v3周辺を確認してください。');
  process.exit(1);
}

const newContent = content.replace(oldPart, newPart);
fs.writeFileSync(filePath, newContent, 'utf8');
console.log('SUCCESS: チャットヘッダーのボタンを横並びdivでまとめました');
