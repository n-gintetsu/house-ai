const fs = require('fs');
const path = require('path');

const filePath = path.join('C:\\Users\\ginte\\Desktop\\house-ai\\src\\App.jsx');
let code = fs.readFileSync(filePath, 'utf8');

// 1. 専門家紹介の説明文を変更
code = code.replace(
  `                リフォーム・司法書士・税理士・FPへの相談導線を想定したフォームです。ステップ1で状況を入力し、AIアドバイスを生成してから連絡先を送信します。`,
  `                あなたに合った各専門家をご紹介いたします。相談料・お見積りは無料です。紹介料なども一切発生いたしません。条件に合えば成約となります。ご安心してお問い合わせください。`
);

// 2. コミュニティの古い文言を修正
code = code.replace(
  `不動産の体験談や悩みを共有できます。データはお使いのブラウザに保存されます（他端末とは共有されません）。`,
  `不動産の体験談や悩みを共有できます。投稿内容はサービス全体で共有されます。`
);

fs.writeFileSync(filePath, code, 'utf8');
console.log('SUCCESS');