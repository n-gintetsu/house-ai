path = "/Users/ogawayotakeshi/Desktop/house-ai/src/App.jsx"

with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. stateにmenuOpen追加
old_state = "const [tab, setTab] = useState('home')"
new_state = "const [tab, setTab] = useState('home')\n  const [menuOpen, setMenuOpen] = useState(false)"
content = content.replace(old_state, new_state, 1)

# 2. ヘッダーの会員登録ボタンの後にハンバーガーボタンを追加
old_btn = """              style={{ background: 'var(--accent)', color: '#fff', border: 'none' }}
              onClick={() => alert('会員登録機能は準備中です。')}
            >
              会員登録
            </button></div>"""

new_btn = """              style={{ background: 'var(--accent)', color: '#fff', border: 'none' }}
              onClick={() => alert('会員登録機能は準備中です。')}
            >
              会員登録
            </button>
            {/* ハンバーガーメニュー */}
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
          </div>"""

content = content.replace(old_btn, new_btn, 1)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print("✅ ハンバーガーメニュー追加完了！")
