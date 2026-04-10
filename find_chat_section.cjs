const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'App.jsx');
const content = fs.readFileSync(filePath, 'utf8');

const lines = content.split('\n');

// 「新規チャット」「物件情報」「業者一覧」に関係しそうなキーワードを検索
const keywords = ['newChat', 'properties', 'vendors', 'チャット', '新規', '物件', '業者', 'setChatTab', 'chatTab'];

keywords.forEach(keyword => {
  lines.forEach((line, i) => {
    if (line.includes(keyword)) {
      console.log(`行${i+1}: ${line.trim().substring(0, 120)}`);
    }
  });
});
