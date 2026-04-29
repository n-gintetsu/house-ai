path = "/Users/ogawayotakeshi/Desktop/house-ai/src/App.jsx"

with open(path, "r", encoding="utf-8") as f:
    lines = f.readlines()

# 「会員登録」ボタンの閉じタグ行を探す
target_line = None
for i, line in enumerate(lines):
    if '</button></div>' in line and i > 1200:
        target_line = i
        break

if target_line is None:
    print("❌ 対象行が見つかりませんでした")
else:
    print(f"✅ 対象行: {target_line + 1}行目")
    hamburger = """            {/* ハンバーガーメニュー */}
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setMenuOpen(!menuOpen)}
                style={{
                  background: 'transparent',
                  border: '1.5px solid var(--accent)',
                  borderRadius: 8,
                  padding: '7px 10px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {menuOpen ? (
                  <span style={{ fontSize: 16, lineHeight: 1, color: 'var(--accent)', fontWeight: 700 }}>✕</span>
                ) : (
                  <>
                    <div style={{ width: 20, height: 2, background: 'var(--accent)', borderRadius: 2 }} />
                    <div style={{ width: 20, height: 2, background: 'var(--accent)', borderRadius: 2 }} />
                    <div style={{ width: 20, height: 2, background: 'var(--accent)', borderRadius: 2 }} />
                  </>
                )}
              </button>
              {menuOpen && (
                <div style={{
                  position: 'absolute',
                  top: '110%',
                  right: 0,
                  background: '#1a3a5c',
                  borderRadius: 14,
                  padding: '12px 8px',
                  zIndex: 9999,
                  minWidth: 200,
                  boxShadow: '0 8px 32px rgba(26,58,92,0.25)',
                }}>
                  {[
                    { id: 'properties', label: '🏠 物件情報' },
                    { id: 'vendors',    label: '👷 業者一覧' },
                    { id: 'chat',       label: '💬 AIチャット' },
                    { id: 'sell',       label: '🏷️ 売却査定' },
                    { id: 'owner',      label: '🏢 賃貸経営者様向け' },
                    { id: 'expert',     label: '👔 専門家紹介' },
                    { id: 'community',  label: '🏘️ コミュニティ' },
                    { id: 'agency',     label: '🏗️ 業者様向け' },
                    { id: 'column',     label: '💰 お得情報' },
                    { id: 'member',     label: '👤 会員専用' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => { setTab(item.id); setMenuOpen(false); }}
                      style={{
                        display: 'block',
                        width: '100%',
                        background: tab === item.id ? 'rgba(255,255,255,0.15)' : 'transparent',
                        border: 'none',
                        borderRadius: 8,
                        padding: '10px 14px',
                        color: '#fff',
                        fontSize: 13,
                        fontWeight: tab === item.id ? 700 : 400,
                        cursor: 'pointer',
                        textAlign: 'left',
                        fontFamily: 'inherit',
                      }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
"""
    # </button></div> の行を </button> と </div> に分割してハンバーガーを挿入
    old_line = lines[target_line]
    new_lines = (
        lines[:target_line]
        + ["            </button>\n", hamburger, "          </div>\n"]
        + lines[target_line + 1:]
    )

    with open(path, "w", encoding="utf-8") as f:
        f.writelines(new_lines)
    print("✅ ハンバーガーメニュー挿入完了！")
