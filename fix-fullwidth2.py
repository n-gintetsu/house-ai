path = "/Users/ogawayotakeshi/Desktop/house-ai/src/HomeScreen.jsx"

with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# mainのスタイルを全画面幅対応に変更
old_main = 'maxWidth: "100%", margin: "0 auto", padding: "20px 16px 48px"'
new_main = 'width: "100%", padding: "20px 0 48px"'
content = content.replace(old_main, new_main)

# ファーストビューに最大幅を設定（中央寄せ維持）
old_hero = 'textAlign: "center", padding: "24px 16px 28px"'
new_hero = 'textAlign: "center", padding: "24px 16px 28px", maxWidth: 800, margin: "0 auto"'
content = content.replace(old_hero, new_hero)

# 3カラムを画面全幅に・padding追加
old_grid = 'display: "grid", gridTemplateColumns: "220px 1fr 200px", gap: 16, alignItems: "start"'
new_grid = 'display: "grid", gridTemplateColumns: "220px 1fr 200px", gap: 0, alignItems: "start", width: "100%", padding: "0"'
content = content.replace(old_grid, new_grid)

# 左パネルにpaddingを追加
old_left = '<LeftPanel onNavigate={navigate} />'
new_left = '<div style={{ padding: "0 12px 0 16px" }}><LeftPanel onNavigate={navigate} /></div>'
content = content.replace(old_left, new_left, 1)

# 中央パネルにpaddingを追加
old_center = '<div style={{ display: "flex", flexDirection: "column", gap: 12 }} ref={chatRef}>'
new_center = '<div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "0 12px" }} ref={chatRef}>'
content = content.replace(old_center, new_center, 1)

# 右パネルにpaddingを追加
old_right = '<RightPanel onNavigate={navigate} />'
new_right = '<div style={{ padding: "0 16px 0 12px" }}><RightPanel onNavigate={navigate} /></div>'
content = content.replace(old_right, new_right, 1)

# 裏導線のmax-widthも調整
old_sub = 'display: "flex", justifyContent: "center", gap: 16, padding: "20px 0 0", flexWrap: "wrap"'
new_sub = 'display: "flex", justifyContent: "center", gap: 16, padding: "20px 16px 0", flexWrap: "wrap"'
content = content.replace(old_sub, new_sub)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print("✅ 全画面3カラム（枠外し）完了！")
