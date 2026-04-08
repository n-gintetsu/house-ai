const fs = require('fs');

// vercel.json を作成
const vercelJson = {
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
};

fs.writeFileSync('vercel.json', JSON.stringify(vercelJson, null, 2), 'utf8');
console.log('SUCCESS: vercel.json を作成しました');
