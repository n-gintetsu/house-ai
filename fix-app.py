import re

path = "/Users/ogawayotakeshi/Desktop/house-ai/src/App.jsx"

with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. ha-pill（Claudeモデル表示）を削除
# <div className="ha-pill" title="Claudeモデル ">...</div>
content = re.sub(
    r'\s*<div className="ha-pill"[^>]*>.*?</div>',
    '',
    content,
    flags=re.DOTALL
)

# 2. ご利用上の注意ボックスを削除
# <div style={{ margin: '0 12px 12px', ... }}>...</div>
content = re.sub(
    r'\s*<div style=\{\{[\s\S]*?margin:.*?0 12px 12px.*?\}\}>[\s\S]*?ご利用上の注意[\s\S]*?</div>\s*',
    '\n',
    content,
    count=1
)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print("✅ App.jsx 修正完了！")
