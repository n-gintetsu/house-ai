path = "/Users/ogawayotakeshi/Desktop/house-ai/src/HomeScreen.jsx"

with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. 3カラムの幅バランスを調整（左右を大きく）
content = content.replace(
    'gridTemplateColumns: "220px 1fr 200px", gap: 0',
    'gridTemplateColumns: "280px 1fr 260px", gap: 0'
)

# 2. 左パネルのpaddingを広げる
content = content.replace(
    '<div style={{ padding: "0 12px 0 16px" }}><LeftPanel onNavigate={navigate} /></div>',
    '<div style={{ padding: "0 16px 0 20px" }}><LeftPanel onNavigate={navigate} /></div>'
)

# 3. 右パネルのpaddingを広げる
content = content.replace(
    '<div style={{ padding: "0 16px 0 12px" }}><RightPanel onNavigate={navigate} /></div>',
    '<div style={{ padding: "0 20px 0 16px" }}><RightPanel onNavigate={navigate} /></div>'
)

# 4. 左パネルのフォントサイズを大きく
content = content.replace(
    'fontSize: 13, fontWeight: 700, color: C.red, margin: "0 0 12px", fontFamily: "\'Noto Sans JP\', sans-serif", lineHeight: 1.5',
    'fontSize: 14, fontWeight: 700, color: C.red, margin: "0 0 14px", fontFamily: "\'Noto Sans JP\', sans-serif", lineHeight: 1.5'
)

# 5. 左パネルの失敗事例カードを大きく
content = content.replace(
    'background: C.redBg, borderLeft: `3px solid ${C.red}`, padding: "8px 10px", borderRadius: "0 8px 8px 0"',
    'background: C.redBg, borderLeft: `3px solid ${C.red}`, padding: "10px 12px", borderRadius: "0 10px 10px 0"'
)

# 6. 右パネルのフォントサイズを大きく
content = content.replace(
    'fontSize: 13, fontWeight: 700, color: C.title, margin: "0 0 10px", fontFamily: "\'Noto Sans JP\', sans-serif"',
    'fontSize: 14, fontWeight: 700, color: C.title, margin: "0 0 12px", fontFamily: "\'Noto Sans JP\', sans-serif"'
)

# 7. 右パネルのニュースアイテムを大きく
content = content.replace(
    'padding: "8px 0", borderBottom: i < news.length - 1 ? `0.5px solid ${C.border}` : "none", display: "flex", alignItems: "flex-start", gap: 7',
    'padding: "10px 0", borderBottom: i < news.length - 1 ? `0.5px solid ${C.border}` : "none", display: "flex", alignItems: "flex-start", gap: 8'
)

# 8. 右パネルのテキストサイズを大きく
content = content.replace(
    'fontSize: 11, color: C.title, margin: 0, lineHeight: 1.5, fontFamily: "\'Noto Sans JP\', sans-serif"',
    'fontSize: 12, color: C.title, margin: 0, lineHeight: 1.6, fontFamily: "\'Noto Sans JP\', sans-serif"'
)

# 9. 左右パネルのカード自体を大きく（border-radius・padding）
content = content.replace(
    'background: C.card, borderRadius: 16, padding: "16px", border: `0.5px solid ${C.border}`',
    'background: C.card, borderRadius: 18, padding: "20px", border: `0.5px solid ${C.border}`'
)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print("✅ UI バランス調整完了！")
