const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'ColumnPage.jsx');

const newContent = `import { useState } from 'react'

const COLUMNS = [
  {
    id: 1,
    category: '住宅ローン',
    title: '住宅ローンの選び方完全ガイド｜固定・変動の比較・審査・無理のない返済額を徹底解説',
    summary: '住宅購入を検討中の方必見。固定金利・変動金利の違い、審査のポイント、無理のない返済額の計算方法をわかりやすく解説します。',
    readTime: '8分',
    date: '2026年4月',
    tags: ['住宅ローン', '金利', '審査'],
    content: \`
## 住宅ローンを選ぶ前に知っておくべき3つのポイント
住宅購入は人生最大の買い物です。住宅ローン選びを間違えると、数十年にわたって損をすることになります。この記事では、住宅ローン選びの基本をわかりやすく解説します。
### 1. 金利タイプの違いを理解する

住宅ローンには大きく3つの金利タイプがあります。
**固定金利型**
借入時の金利が完済時まで変わりません。毎月の返済額が一定なので、長期の返済計画が立てやすいです。フラット35が代表的な商品です。
**変動金利型**
市場の金利動向に合わせて金利が変動します。現在は固定より低いことが多いですが、将来金利が上昇するリスクがあります。
**固定期間選択型**
一定期間（3年・5年・10年など）は固定金利、その後は変動または固定を選べるタイプです。
### 2. 無理のない返済額の目安
一般的な目安として、年収の5倍以内が無理のない返済額と言われています。
例えば年収500万円の場合、返済総額は2,500万〜3,500万円が目安です。
また月々の返済額は、手取り収入の25%以内に収めることが理想的です。
### 3. 審査を通すためのポイント
住宅ローンの審査では主に以下の点が確認されます。
- 勤続年数（3年以上が望ましい）- 年収と返済比率
- 信用情報（延滞の履歴など）- 他のローンの残高
## まとめ
住宅ローンは一度結んだら長い付き合いになります。複数の金融機関を比較して、最もお得な条件のローンを選びましょう。
    \`,
    affiliate: {
      label: '🏠 住宅ローンを無料で一括比較する',
      desc: '複数の金融機関に一括で申込・比較できます。金利・審査条件を比べて最適なローンを見つけましょう。',
      url: 'https://h.accesstrade.net/sp/cc?rk=0100p7qk00ib4b',
      color: '#1a3a5c',
    }
  },
  {
    id: 2,
    category: '不動産担保ローン',
    title: '不動産担保ローンとは？活用シーンと審査のポイントを徹底解説',
    summary: '所有する不動産を担保にまとまった資金を調達できる不動産担保ローン。事業資金・リフォーム・相続など幅広い用途に活用できます。審査のポイントや注意点をわかりやすく解説します。',
    readTime: '5分',
    date: '2026年4月',
    tags: ['不動産担保ローン', '資金調達', 'ローン'],
    content: \`
## 不動産担保ローンとは

不動産担保ローンとは、所有している土地や建物を担保に入れることで、まとまった資金を借り入れできる金融サービスです。

### 主な活用シーン

- **事業資金の調達**：法人・個人事業主の運転資金や設備投資
- **リフォーム・修繕費用**：大規模な工事費用の調達
- **相続税の納税資金**：相続後の急な出費に対応
- **おまとめローン**：複数のローンを一本化して月々の返済を軽減

### 通常ローンとの違い

不動産担保ローンは無担保ローンに比べて借入限度額が高く、金利が低めに設定されます。ただし審査期間はやや長くなります。

### 審査のポイント

不動産担保ローンの審査では主に以下が確認されます。

- **担保不動産の評価額**：土地・建物の市場価値
- **返済能力**：収入・既存ローンの状況
- **物件の種類**：居住用・収益用・更地など

## まとめ

不動産担保ローンは、不動産を活用して有利な条件で資金調達できる手段です。複数の金融機関を比較して、最適なプランを見つけましょう。
    \`,
    affiliate: {
      label: '🏦 不動産担保ローンを無料で一括比較する',
      desc: '複数の金融機関に一括で申込・比較できます。融資額・金利・審査条件を比べて最適なローンを見つけましょう。',
      url: 'https://px.a8.net/svt/ejp?a8mat=4B1HTK+AZXA2A+5PBE+5YJRM',
      color: '#7c3aed',
    }
  },
  {
    id: 3,
    category: '引越し',
    title: '引越し費用を安くする5つのコツ｜一括見積もりで平均より大幅に節約',
    summary: '引越し費用の相場と節約術を解説。一括見積もりサービスの使い方から、引越し業者との交渉術まで、実践的なノウハウをお伝えします。',
    readTime: '6分',
    date: '2026年4月',
    tags: ['引越し', '節約', '見積もり'],
    content: \`
## 引越し費用の相場を知ろう

引越し費用は移動距離・荷物量・時期によって大きく変わります。一般的な目安は以下の通りです。
- 同一市区町村：3〜5万円
- 近距離移動（100km以内）：5〜10万円
- 遠距離移動（100km以上）：10〜30万円

### 費用を安くする5つのコツ
**① 複数業者に見積もりを取る**
これが最も効果的です。同じ条件でも業者によって5〜10万円の差が出ることも珍しくありません。
**② 引越し時期を選ぶ**
3〜4月は繁忙期で料金が高くなります。可能であれば5〜2月の閑散期か、繁忙期でも平日・月末より月中を選びましょう。
**③ 不用品を処理する**
荷物を事前に処分することで、トラックの大きさが下がり料金を抑えられます。
**④ 平日・午後便を選ぶ**
土日より平日、朝便より午後便の方が安くなるケースが多いです。
**⑤ 荷造りを自分でする**
梱包作業を業者に頼むと費用が上がります。自分で荷造りすることで大幅に節約できます。
## まとめ
引越し費用の節約には、複数業者への一括見積もりが最も効果的です。
    \`,
    affiliate: {
      label: '🚛 引越し費用を無料で一括見積もりする',
      desc: '最大10社に一括見積もり依頼。比較して一番安い業者を選べます。',
      url: 'https://px.a8.net/svt/ejp?a8mat=引越し仮リンク',
      color: '#2d6a4f',
    }
  },
  {
    id: 4,
    category: '火災保険',
    title: '火災保険の選び方｜賃貸・持ち家それぞれ最適な補償内容と保険料の目安',
    summary: '火災保険は火災だけでなく、水害・風災・盗難なども補償されます。賃貸・持ち家それぞれに最適な火災保険の選び方を解説します。',
    readTime: '6分',
    date: '2026年4月',
    tags: ['火災保険', '賃貸', '持ち家'],
    content: \`
## 火災保険は「火災」だけじゃない
火災保険という名前ですが、実際には様々なリスクに備えることができます。
### 主な補償内容

**建物への補償**
- 火災・落雷・破裂・爆発
- 風災・雹災・雪災
- 水災（洪水・高潮・土砂崩れなど）
- 盗難

**家財への補償**
- 家具・家電などの損害
- 建物内の現金（上限あり）

### 賃貸と持ち家で異なる選び方

**賃貸の場合**
建物は大家さんが補償するため、「家財補償」が主な対象です。また「借家人賠償責任保険」（うっかり火を出してしまった場合の補償）と「個人賠償責任保険」も重要です。
**持ち家の場合**
建物の実際の価値に設定した補償額に設定しましょう。

### 保険料の目安
賃貸の場合：年間1〜2万円程度（家財補償のみ）
持ち家の場合：年間5〜10万円程度（建物の価値による）

## まとめ
火災保険は複数社を比較することで、同じ補償内容でも保険料が大きく変わります。
    \`,
    affiliate: {
      label: '🔥 火災保険を無料で一括比較する',
      desc: '最大20社を一括比較。補償内容と保険料を比べて最適な保険を選べます。',
      url: 'https://px.a8.net/svt/ejp?a8mat=4B1HTK+BNQM9E+3RU+6S3XQQ',
      color: '#1e40af',
    }
  },
]

const CATEGORY_COLORS = {
  '住宅ローン': { bg: '#dbeafe', text: '#1e40af' },
  '不動産担保ローン': { bg: '#ede9fe', text: '#5b21b6' },
  '引越し': { bg: '#dcfce7', text: '#166534' },
  '火災保険': { bg: '#fee2e2', text: '#991b1b' },
}

const CATEGORY_ICONS = {
  '住宅ローン': '🏠',
  '不動産担保ローン': '🏦',
  '引越し': '🚛',
  '火災保険': '🔥',
}

export default function ColumnPage() {
  const [selectedColumn, setSelectedColumn] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState('すべて')

  const categories = ['すべて', ...new Set(COLUMNS.map(c => c.category))]
  const filtered = selectedCategory === 'すべて' ? COLUMNS : COLUMNS.filter(c => c.category === selectedCategory)

  if (selectedColumn) {
    const col = selectedColumn
    const catColor = CATEGORY_COLORS[col.category] || { bg: '#eef2f7', text: '#1a3a5c' }
    return (
      <div style={{ padding: 20, maxWidth: 720, margin: '0 auto' }}>
        <button onClick={() => setSelectedColumn(null)} style={{ background: 'none', border: 'none', color: '#1a3a5c', cursor: 'pointer', fontSize: 13, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 4 }}>
          ← コラム一覧に戻る
        </button>

        <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: catColor.bg, color: catColor.text, fontWeight: 700, marginBottom: 12, display: 'inline-block' }}>
          {col.category}
        </span>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1a3a5c', lineHeight: 1.5, margin: '8px 0 12px' }}>{col.title}</h1>
        <div style={{ display: 'flex', gap: 12, fontSize: 12, color: '#888', marginBottom: 20 }}>
          <span>📅 {col.date}</span>
          <span>⏱ 読了時間：{col.readTime}</span>
        </div>

        {/* アフィリエイトバナー（上部） */}
        <div style={{ background: '#f8fafc', border: \`1.5px solid \${col.affiliate.color}20\`, borderRadius: 12, padding: 16, marginBottom: 24 }}>
          <div style={{ fontSize: 13, color: '#555', marginBottom: 10 }}>{col.affiliate.desc}</div>
          <a href={col.affiliate.url} target="_blank" rel="noopener noreferrer sponsored"
            style={{ display: 'block', padding: '12px', background: col.affiliate.color, color: '#fff', borderRadius: 10, fontWeight: 700, fontSize: 14, textDecoration: 'none', textAlign: 'center' }}>
            {col.affiliate.label} →
          </a>
          <div style={{ fontSize: 10, color: '#bbb', textAlign: 'center', marginTop: 4 }}>※ 提携・紹介サービスのページへ移動します</div>
        </div>

        {/* 本文 */}
        <div style={{ fontSize: 14, lineHeight: 1.9, color: '#333' }}>
          {col.content.trim().split('\\n').map((line, i) => {
            if (line.startsWith('## ')) return <h2 key={i} style={{ fontSize: 18, fontWeight: 700, color: '#1a3a5c', margin: '28px 0 12px', borderBottom: '2px solid #f5a623', paddingBottom: 6 }}>{line.replace('## ', '')}</h2>
            if (line.startsWith('### ')) return <h3 key={i} style={{ fontSize: 15, fontWeight: 700, color: '#1a3a5c', margin: '20px 0 8px' }}>{line.replace('### ', '')}</h3>
            if (line.startsWith('**') && line.endsWith('**')) return <p key={i} style={{ fontWeight: 700, color: '#1a3a5c', margin: '12px 0 4px' }}>{line.replace(/\\*\\*/g, '')}</p>
            if (line.startsWith('- ')) return <li key={i} style={{ marginLeft: 20, marginBottom: 4 }}>{line.replace('- ', '')}</li>
            if (line.trim() === '') return <br key={i} />
            return <p key={i} style={{ margin: '8px 0' }}>{line}</p>
          })}
        </div>

        {/* アフィリエイトバナー（下部） */}
        <div style={{ background: col.affiliate.color, borderRadius: 14, padding: 20, marginTop: 32, color: '#fff', textAlign: 'center' }}>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>{col.affiliate.label}</div>
          <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 14 }}>{col.affiliate.desc}</div>
          <a href={col.affiliate.url} target="_blank" rel="noopener noreferrer sponsored"
            style={{ display: 'inline-block', padding: '12px 32px', background: '#fff', color: col.affiliate.color, borderRadius: 10, fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
            {col.affiliate.label} →
          </a>
          <div style={{ fontSize: 10, opacity: 0.6, marginTop: 8 }}>※ 提携・紹介サービスのページへ移動します</div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: 20 }}>
      <h2 style={{ fontSize: 18, fontWeight: 750, color: '#1a3a5c', margin: '0 0 4px' }}>💰 お得な情報コラム</h2>
      <p style={{ fontSize: 13, color: '#777', margin: '0 0 20px' }}>住宅購入・引越し・保険に役立つ情報をお届けします</p>

      {/* カテゴリフィルター */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
        {categories.map(cat => (
          <button key={cat} onClick={() => setSelectedCategory(cat)} style={{
            padding: '6px 16px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700,
            background: selectedCategory === cat ? '#1a3a5c' : '#eef2f7',
            color: selectedCategory === cat ? '#fff' : '#555',
          }}>{cat}</button>
        ))}
      </div>

      {/* コラム一覧 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {filtered.map(col => {
          const catColor = CATEGORY_COLORS[col.category] || { bg: '#eef2f7', text: '#1a3a5c' }
          return (
            <div key={col.id} onClick={() => setSelectedColumn(col)}
              style={{ background: '#fff', borderRadius: 14, padding: 18, border: '1.5px solid #f5a623', cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(245,166,35,0.2)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 11, padding: '2px 10px', borderRadius: 20, background: catColor.bg, color: catColor.text, fontWeight: 700 }}>{col.category}</span>
                    <span style={{ fontSize: 11, color: '#aaa' }}>⏱ {col.readTime}</span>
                  </div>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1a3a5c', margin: '0 0 6px', lineHeight: 1.5 }}>{col.title}</h3>
                  <p style={{ fontSize: 12, color: '#666', margin: 0, lineHeight: 1.6 }}>{col.summary}</p>
                  <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                    {col.tags.map(tag => <span key={tag} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 4, background: '#f0f4f8', color: '#555' }}>#{tag}</span>)}
                  </div>
                </div>
                <div style={{ fontSize: 24, flexShrink: 0 }}>
                  {CATEGORY_ICONS[col.category] || '📄'}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
`;

fs.writeFileSync(filePath, newContent, 'utf8');
console.log('SUCCESS: ColumnPage.jsx を完全に書き直しました');
console.log('  - 住宅ローンコラム（既存）: そのまま');
console.log('  - 不動産担保ローンコラム: 新規追加');
console.log('  - 引越しコラム: 仮リンクのまま（承認後に差替え）');
console.log('  - 火災保険コラム: 本物のA8.netリンクに差替え済み');
