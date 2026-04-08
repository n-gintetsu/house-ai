const fs = require('fs');

const newHtml = `<!doctype html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />

    <!-- タイトル・説明 -->
    <title>不動産AIコンシェルジュ | GINTETSU不動産株式会社</title>
    <meta name="description" content="さいたま市・埼玉県の不動産相談はAIコンシェルジュにお任せください。売却査定・賃貸管理・専門家紹介・コミュニティ機能を無料で提供。GINTETSU不動産株式会社が運営するAI不動産プラットフォームです。" />
    <meta name="keywords" content="不動産,AI,さいたま市,埼玉,売却査定,賃貸管理,不動産相談,GINTETSU,ハウスAI,コンシェルジュ" />
    <meta name="author" content="GINTETSU不動産株式会社" />
    <meta name="robots" content="index, follow" />

    <!-- OGP（SNSシェア用） -->
    <meta property="og:type" content="website" />
    <meta property="og:title" content="不動産AIコンシェルジュ | GINTETSU不動産株式会社" />
    <meta property="og:description" content="さいたま市・埼玉県の不動産相談はAIコンシェルジュにお任せください。売却査定・賃貸管理・専門家紹介を無料で提供。" />
    <meta property="og:url" content="https://www.gintetsu-fudosan.com" />
    <meta property="og:site_name" content="不動産AIコンシェルジュ" />
    <meta property="og:locale" content="ja_JP" />
    <meta property="og:image" content="https://www.gintetsu-fudosan.com/ogp.png" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="不動産AIコンシェルジュ | GINTETSU不動産株式会社" />
    <meta name="twitter:description" content="さいたま市・埼玉県の不動産相談はAIコンシェルジュにお任せください。" />
    <meta name="twitter:image" content="https://www.gintetsu-fudosan.com/ogp.png" />

    <!-- 正規URL -->
    <link rel="canonical" href="https://www.gintetsu-fudosan.com" />

    <!-- 構造化データ（Google検索向け） -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "RealEstateAgent",
      "name": "GINTETSU不動産株式会社",
      "url": "https://www.gintetsu-fudosan.com",
      "description": "さいたま市大宮区を拠点とする不動産会社。AIコンシェルジュによる不動産相談・売却査定・賃貸管理サービスを提供。",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "桜木町1-366-9 オープンオフィス大宮駅西口ビル402",
        "addressLocality": "さいたま市大宮区",
        "addressRegion": "埼玉県",
        "postalCode": "330-0854",
        "addressCountry": "JP"
      },
      "telephone": "048-606-4317",
      "areaServed": "埼玉県"
    }
    </script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
`;

fs.writeFileSync('index.html', newHtml, 'utf8');
console.log('SUCCESS: index.html のSEO対策を完了しました');
