import os

file_path = os.path.expanduser('~/Desktop/house-ai/src/App.jsx')

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# 1263行目周辺（chatブロック開始）と1360-1370行目を表示
print('=== chatブロック開始 (1263-1268) ===')
for i in range(1262, 1268):
    print(f'{i+1}: {lines[i].rstrip()}')

print('\n=== chatブロック末尾 (1355-1370) ===')
for i in range(1354, min(1370, len(lines))):
    print(f'{i+1}: {lines[i].rstrip()}')
