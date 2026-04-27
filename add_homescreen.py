import os

file_path = os.path.expanduser('~/Desktop/house-ai/src/App.jsx')

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. import追加 - ColumnPageのimportの後に追加
old_import = "import ColumnPage from './ColumnPage'"
new_import = "import ColumnPage from './ColumnPage'\nimport HomeScreen from './HomeScreen'"

if old_import not in content:
    print('❌ import追加ターゲットが見つかりません')
    exit(1)

if 'HomeScreen' in content:
    print('⚠️ HomeScreenはすでにimport済みです')
else:
    content = content.replace(old_import, new_import)
    print('✅ import追加完了')

# 2. tab === 'chat' の直前にhomeの条件分岐を追加
old_chat = "        {tab === 'chat' && ("
new_chat = "        {tab === 'home' && (\n          <HomeScreen onNavigate={(view) => setTab(view)} />\n        )}\n\n        {tab === 'chat' && ("

if old_chat not in content:
    print('❌ chat条件分岐ターゲットが見つかりません')
    exit(1)

if "'home'" in content and 'HomeScreen' in content and 'onNavigate' in content:
    print('⚠️ home条件分岐はすでに存在します')
else:
    content = content.replace(old_chat, new_chat, 1)
    print('✅ home条件分岐追加完了')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print('✅ App.jsx更新完了！')
print('次: npm run build && git add -A && git commit -m "add HomeScreen" && git push')
