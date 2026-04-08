const fs = require('fs');

let content = fs.readFileSync('src/App.jsx', 'utf8');

// AuthPanelのimportを追加（まだない場合）
if (!content.includes("import AuthPanel from './AuthPanel'")) {
  content = content.replace(
    "import { supabase } from './lib/supabase'",
    "import { supabase } from './lib/supabase'\nimport AuthPanel from './AuthPanel'"
  );
  console.log('AuthPanel import を追加しました');
} else {
  console.log('AuthPanel import はすでにあります');
}

// 会員専用タブを差し替え（tab === 'member' のブロックを探す）
const memberStart = content.indexOf("{tab === 'member'");
if (memberStart === -1) {
  console.log('ERROR: member タブが見つかりませんでした');
  process.exit(1);
}

// member タブの終わりを探す（次の {tab === で終わる、またはmainの閉じタグ）
// </div>\n          )} の組み合わせを探す
let braceDepth = 0;
let i = memberStart;
let inJsx = false;

// シンプルな方法：{tab === 'member' && ( から始まり、対応する)} を見つける
// カッコの深さをカウント
let start = memberStart;
let parenDepth = 0;
let pos = start;

// {tab === 'member' && ( の最初の { から始める
while (pos < content.length) {
  const ch = content[pos];
  if (ch === '{') parenDepth++;
  else if (ch === '}') {
    parenDepth--;
    if (parenDepth === 0) {
      pos++; // } の次
      break;
    }
  }
  pos++;
}

const memberBlock = content.substring(start, pos);
const newMemberBlock = `{tab === 'member' && (
            <div className="ha-panel" style={{ padding: 0 }}>
              <AuthPanel />
            </div>
          )}`;

content = content.substring(0, start) + newMemberBlock + content.substring(pos);
console.log('SUCCESS: 会員専用タブを AuthPanel に差し替えました');

fs.writeFileSync('src/App.jsx', content, 'utf8');
console.log('SUCCESS: App.jsx を保存しました');
