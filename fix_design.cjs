const fs = require('fs');
const path = require('path');

const filePath = path.join('C:\\Users\\ginte\\Desktop\\house-ai\\src\\App.jsx');
let code = fs.readFileSync(filePath, 'utf8');

// 1. タブ名変更
code = code.replace(
  "{ id: 'sell', label: '売主査定', icon: '🏷️' }",
  "{ id: 'sell', label: '買取無料査定', icon: '🏷️' }"
);
code = code.replace(
  "{ id: 'owner', label: 'オーナー', icon: '🏢' }",
  "{ id: 'owner', label: '賃貸経営者様向け', icon: '🏢' }"
);

// 2. 専門家タイプ変更
code = code.replace(
  `const EXPERT_TYPES = [
  { id: 'reform', label: 'リフォーム業者' },
  { id: 'legal', label: '司法書士' },
  { id: 'tax', label: '税理士' },
  { id: 'fp', label: 'FP（ファイナンシャルプランナー）' },
]`,
  `const EXPERT_TYPES = [
  { id: 'reform', label: 'リフォーム業者' },
  { id: 'exterior', label: '外構工事' },
  { id: 'legal', label: '司法書士' },
  { id: 'tax', label: '税理士' },
  { id: 'bank', label: '金融機関' },
  { id: 'other', label: 'その他' },
]`
);

// 3. デザイン変更（CSS変数）
code = code.replace(
  `:root {
          --accent: #1a3a5c;
          --accent-dim: rgba(26, 58, 92, 0.06);
          --accent-border: rgba(26, 58, 92, 0.3);
          --bg: #f5f7fa;
          --surface: #ffffff;
          --border: rgba(26, 58, 92, 0.15);
          --border-2: rgba(26, 58, 92, 0.08);
          --text: #333333;
          --muted: #888888;
          --shadow: 0 1px 8px rgba(0,0,0,0.08);
        }`,
  `:root {
          --accent: #1a3a5c;
          --accent-dim: rgba(26, 58, 92, 0.08);
          --accent-border: rgba(26, 58, 92, 0.25);
          --bg: #eef2f7;
          --surface: #ffffff;
          --border: rgba(26, 58, 92, 0.15);
          --border-2: rgba(26, 58, 92, 0.1);
          --text: #222222;
          --muted: #777777;
          --shadow: 0 2px 12px rgba(26,58,92,0.08);
        }`
);

// 4. 入力欄の背景をwhiteに修正
code = code.replace(
  `          background: rgba(0, 0, 0, 0.25);`,
  `          background: #ffffff;`
);

// 5. メインエリアの背景修正
code = code.replace(
  `          background: linear-gradient(180deg, rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0.015));`,
  `          background: #ffffff;`
);

// 6. postの背景修正
code = code.replace(
  `          background: rgba(0, 0, 0, 0.15);
        }

        .ha-post h4`,
  `          background: #f8fafc;
        }

        .ha-post h4`
);

// 7. composerの背景修正
code = code.replace(
  `          background: rgba(0, 0, 0, 0.15);`,
  `          background: #f8fafc;`
);

// 8. ヘッダーに会員登録ボタン追加
code = code.replace(
  `          <div className="ha-pill" title="Claudeモデル">
            Claude: {model}
          </div>`,
  `          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="ha-pill" title="Claudeモデル">
              Claude: {model}
            </div>
            <button
              type="button"
              className="ha-btn"
              style={{ whiteSpace: 'nowrap', background: 'var(--accent)', color: '#fff', border: 'none' }}
              onClick={() => alert('会員登録機能は準備中です。')}
            >
              会員登録
            </button>
          </div>`
);

// 9. オーナータブのタイトル修正
code = code.replace(
  '<h2 className="ha-sectionTitle">🏢 アパート賃貸オーナー向け</h2>',
  '<h2 className="ha-sectionTitle">🏢 アパート賃貸経営者様向け</h2>'
);

fs.writeFileSync(filePath, code, 'utf8');
console.log('SUCCESS');