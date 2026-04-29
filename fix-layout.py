path = "/Users/ogawayotakeshi/Desktop/house-ai/src/HomeScreen.jsx"

with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. maxWidthを960から100%に変更
content = content.replace(
    "maxWidth: 960, margin: \"0 auto\", padding: \"20px 16px 48px\"",
    "maxWidth: \"100%\", margin: \"0 auto\", padding: \"20px 24px 48px\""
)

# 2. 3カラムのgridを全画面幅・中央大きく変更
content = content.replace(
    "gridTemplateColumns: \"200px 1fr 180px\", gap: 14",
    "gridTemplateColumns: \"220px 1fr 200px\", gap: 16"
)

# 3. ファーストビューのmaxWidthも広げる
content = content.replace(
    "maxWidth: 960, margin: \"0 auto\"",
    "maxWidth: \"100%\", margin: \"0 auto\""
)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print("✅ レイアウト更新完了！")
