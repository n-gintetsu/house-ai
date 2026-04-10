const fs = require('fs');

const filePath = 'src/App.jsx';
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

// 1274行目（{/* chat_nav_buttons_v3 */}）〜1285行目（</button>）を置換
// 0-indexedなので1273〜1284

const before = lines.slice(0, 1273);
const after = lines.slice(1285);

const newBlock = [
  '\t\t\t\t{/* chat_nav_buttons_v3 */}',
  '\t\t\t\t<div style={{ display: \'flex\', gap: 6, alignItems: \'center\', flexWrap: \'wrap\' }}>',
  '\t\t\t\t\t<button type="button" onClick={() => setTab(\'properties\')}',
  '\t\t\t\t\t\tstyle={{ padding: \'5px 10px\', background: \'#1a3a5c\', color: \'#fff\', border: \'none\', borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: \'pointer\', whiteSpace: \'nowrap\' }}>',
  '\t\t\t\t\t\t\u{1F3E0} 物件情報',
  '\t\t\t\t\t</button>',
  '\t\t\t\t\t<button type="button" onClick={() => setTab(\'vendors\')}',
  '\t\t\t\t\t\tstyle={{ padding: \'5px 10px\', background: \'#c9a84c\', color: \'#fff\', border: \'none\', borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: \'pointer\', whiteSpace: \'nowrap\' }}>',
  '\t\t\t\t\t\t\u{1F477} 業者一覧・比較',
  '\t\t\t\t\t</button>',
  '\t\t\t\t\t<button type="button" className="ha-btn ha-btnGhost" onClick={handleResetChat} disabled={isSending}>',
  '\t\t\t\t\t\t新規チャット',
  '\t\t\t\t\t</button>',
  '\t\t\t\t</div>',
];

const newLines = [...before, ...newBlock, ...after];
fs.writeFileSync(filePath, newLines.join('\n'), 'utf8');
console.log('SUCCESS: チャットヘッダーのボタンを横並びdivでまとめました');
