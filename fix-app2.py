path = "/Users/ogawayotakeshi/Desktop/house-ai/src/App.jsx"

with open(path, "r", encoding="utf-8") as f:
    lines = f.readlines()

# 削除対象を特定：margin: '0 12px 12px' から始まるdivブロック
start = None
for i, line in enumerate(lines):
    if "margin: '0 12px 12px'" in line:
        # この行から遡って<div style=のある行を探す
        for j in range(i, max(i-5, 0), -1):
            if "<div style=" in lines[j]:
                start = j
                break
        break

if start is None:
    print("❌ 開始行が見つかりませんでした")
else:
    # 対応する</div>を探す（ネスト深度カウント）
    depth = 0
    end = None
    for i in range(start, len(lines)):
        depth += lines[i].count("<div")
        depth -= lines[i].count("</div>")
        if depth <= 0:
            end = i
            break

    if end is None:
        print("❌ 終了行が見つかりませんでした")
    else:
        print(f"削除範囲: {start+1}行 〜 {end+1}行")
        new_lines = lines[:start] + lines[end+1:]
        with open(path, "w", encoding="utf-8") as f:
            f.writelines(new_lines)
        print("✅ ご利用上の注意ボックス削除完了！")
