const fs = require('fs');

const filePath = 'src/App.jsx';
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

// 1265行目〜1286行目を新しい内容に置き換える（0-indexedで1264〜1285）
const oldBlock = lines.slice(1264, 1286).join('\n');

const newBlock = `            <div className="ha-panel ha-chatWrap">
              <div className="ha-chatTop">
                <div>
                  <h2 className="ha-sectionTitle" style={{ marginBottom: 4 }}>
                    💬 AIチャット
                  </h2>
                  <p className="ha-sectionDesc" style={{ margin: 0 }}>
                    不動産コンシェルジュが条件整理と次の一歩をサポートします。
                  </p>
                </div>
                {/* chat_nav_buttons_v3 */}
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
                </div>
              </div>`;

const newLines = [
  ...lines.slice(0, 1264),
  ...newBlock.split('\n'),
  ...lines.slice(1286)
];

fs.writeFileSync(filePath, newLines.join('\n'), 'utf8');
console.log('SUCCESS: チャットヘッダーのボタンを横並びにまとめました');
