import os

file_path = os.path.expanduser('~/Desktop/house-ai/src/App.jsx')

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 正確なターゲット（Pythonの生文字列）
target = '            </form>\n        </div>\n        )}'

banner = '''            </form>
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
              \U0001f4ac あなたの体験談・不満をみんなと共有しませんか？
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
        )}'''

count = content.count(target)
print(f'ターゲット出現回数: {count}')

if count == 0:
    print('❌ 見つかりません')
    # デバッグ: 実際の文字列を確認
    lines = content.split('\n')
    for i in range(1358, 1365):
        print(f'  {i+1}: {repr(lines[i])}')
elif count > 1:
    print(f'❌ {count}箇所見つかりました。安全のため中断。')
else:
    new_content = content.replace(target, banner)
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print('✅ App.jsx を更新しました！')
    print('次: npm run build && git add -A && git commit -m "add community banner" && git push')
