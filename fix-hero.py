path = "/Users/ogawayotakeshi/Desktop/house-ai/src/HomeScreen.jsx"

with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. タイトルを1行に（<br/>を削除）・フォントサイズ調整
content = content.replace(
    'あなたの不動産判断、<br />30秒で最適化',
    'あなたの不動産判断、30秒で最適化'
)

# 2. h1のfont-sizeを少し小さくして1行に収まるよう調整
content = content.replace(
    'fontSize: 24, fontWeight: 700, color: C.title, fontFamily: "\'Noto Serif JP\', serif", lineHeight: 1.4, marginBottom: 8',
    'fontSize: 28, fontWeight: 700, color: C.title, fontFamily: "\'Noto Serif JP\', serif", lineHeight: 1.3, marginBottom: 10, whiteSpace: "nowrap"'
)

# 3. ファーストビューのpaddingを少し広げる
content = content.replace(
    'textAlign: "center", padding: "24px 16px 28px", maxWidth: 800, margin: "0 auto"',
    'textAlign: "center", padding: "32px 16px 32px", maxWidth: 900, margin: "0 auto"'
)

# 4. サブテキストのフォントを少し大きく
content = content.replace(
    'fontSize: 13, color: C.desc, fontFamily: "\'Noto Sans JP\', sans-serif", marginBottom: 20, lineHeight: 1.7',
    'fontSize: 14, color: C.desc, fontFamily: "\'Noto Sans JP\', sans-serif", marginBottom: 24, lineHeight: 1.7'
)

# 5. クイック選択ボタンを少し大きく
content = content.replace(
    'background: "#fff", border: `1.5px solid ${C.border}`, borderRadius: 10, padding: "10px 16px", fontSize: 13, fontWeight: 600, color: C.title, cursor: "pointer", fontFamily: "\'Noto Sans JP\', sans-serif", transition: "all 0.15s"',
    'background: "#fff", border: `1.5px solid ${C.border}`, borderRadius: 12, padding: "12px 20px", fontSize: 14, fontWeight: 600, color: C.title, cursor: "pointer", fontFamily: "\'Noto Sans JP\', sans-serif", transition: "all 0.15s"'
)

# 6. メインCTAボタンを大きく
content = content.replace(
    'background: C.navy, color: "#fff", border: "none", borderRadius: 50, padding: "16px 48px", fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: "\'Noto Sans JP\', sans-serif", boxShadow: "0 4px 20px rgba(26,58,92,0.3)", transition: "all 0.2s"',
    'background: C.navy, color: "#fff", border: "none", borderRadius: 50, padding: "18px 56px", fontSize: 17, fontWeight: 700, cursor: "pointer", fontFamily: "\'Noto Sans JP\', sans-serif", boxShadow: "0 4px 20px rgba(26,58,92,0.3)", transition: "all 0.2s"'
)

# 7. 警告テキストのフォントも少し大きく
content = content.replace(
    'fontSize: 11, fontWeight: 700, color: C.red, letterSpacing: 2, marginBottom: 8, fontFamily: "\'Noto Sans JP\', sans-serif"',
    'fontSize: 13, fontWeight: 700, color: C.red, letterSpacing: 1, marginBottom: 10, fontFamily: "\'Noto Sans JP\', sans-serif"'
)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print("✅ ファーストビュー UI調整完了！")
