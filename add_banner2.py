import os

file_path = os.path.expanduser('~/Desktop/house-ai/src/App.jsx')

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

print(f'総行数: {len(lines)}')
print('1361-1363行目の内容:')
for i in [1360, 1361, 1362]:
    print(f'  {i+1}: {repr(lines[i])}')

# 1363行目（インデックス1362）が '        )}\n' であることを確認
target_line = lines[1362].rstrip('\r\n')
print(f'\n挿入前確認: {repr(target_line)}')

if target_line.strip() != ')}':
    print('❌ 想定外の行です。中断します。')
    exit(1)

# 改行コードを既存ファイルに合わせる
nl = '\n'
if '\r\n' in lines[0]:
    nl = '\r\n'

banner = (
    f'        {{/* ===== コミュニティ誘導バナー ===== */}}{nl}'
    f'        <div{nl}'
    f"          onClick={{() => setTab('community')}}{nl}"
    f'          style={{{{{nl}'
    f"            margin: '12px 16px 0',{nl}"
    f"            padding: '14px 18px',{nl}"
    f"            background: 'linear-gradient(135deg, #faf7f2 0%, #f5f0e8 100%)',{nl}"
    f"            border: '1px solid #e8dfc8',{nl}"
    f'            borderRadius: 14,{nl}'
    f"            cursor: 'pointer',{nl}"
    f"            display: 'flex',{nl}"
    f"            alignItems: 'center',{nl}"
    f"            justifyContent: 'space-between',{nl}"
    f'            gap: 12,{nl}'
    f'          }}}}{nl}'
    f'          onMouseEnter={{e => e.currentTarget.style.boxShadow = \'0 4px 16px rgba(26,58,92,0.10)\'}}{nl}'
    f"          onMouseLeave={{e => e.currentTarget.style.boxShadow = 'none'}}{nl}"
    f'        >{nl}'
    f'          <div>{nl}'
    f'            <p style={{{{ fontSize: 13, fontWeight: 700, color: \'#2c2010\', marginBottom: 3 }}}}>{nl}'
    f'              \U0001f4ac あなたの体験談・不満をみんなと共有しませんか？{nl}'
    f'            </p>{nl}'
    f"            <p style={{{{ fontSize: 11, color: '#b8a898', margin: 0 }}}}>{nl}"
    f'              コミュニティで声を投稿する →{nl}'
    f'            </p>{nl}'
    f'          </div>{nl}'
    f'          <span style={{{{{nl}'
    f"            background: '#c9a84c',{nl}"
    f"            color: '#fff',{nl}"
    f'            fontSize: 11,{nl}'
    f'            fontWeight: 700,{nl}'
    f'            borderRadius: 6,{nl}'
    f"            padding: '4px 10px',{nl}"
    f'            flexShrink: 0,{nl}'
    f'          }}}}>{nl}'
    f'            参加する{nl}'
    f'          </span>{nl}'
    f'        </div>{nl}'
)

# 1362行目（インデックス）の前に挿入
lines.insert(1362, banner)

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(lines)

print('✅ 挿入完了！')
print('次: npm run build && git add -A && git commit -m "add community banner" && git push')
