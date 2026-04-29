import re

# ============================================================
# ① + ② App.jsx の修正（損した金額・ランキング）
# ============================================================
path = "/Users/ogawayotakeshi/Desktop/house-ai/src/App.jsx"

with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# ① communityDraftの初期値にlossAmountを追加
content = content.replace(
    "const [communityDraft, setCommunityDraft] = useState({\n    title: '',\n    body: '',\n    author: '',\n  })",
    "const [communityDraft, setCommunityDraft] = useState({\n    title: '',\n    body: '',\n    author: '',\n    lossAmount: '',\n    category: 'other',\n  })"
)

# ① 投稿フォームに「損した金額」と「カテゴリ」フィールドを追加
old_form = """              <div className="ha-row">
                <label className={labelClass}>タイトル</label>
                <input
                  className={fieldClass}
                  value={communityDraft.title}
                  onChange={(e) => setCommunityDraft((d) => ({ ...d, title: e.target.value }))}
                />
              </div>"""

new_form = """              {/* 投稿テンプレートヒント */}
              <div style={{ background: '#fffbe6', border: '1px solid #f0d060', borderRadius: 8, padding: '10px 12px', marginBottom: 12, fontSize: 12, color: '#92400e', lineHeight: 1.6 }}>
                💡 <strong>投稿テンプレ：</strong>「〇〇で後悔しました」形式が共感を呼びます！
              </div>
              <div className="ha-row">
                <label className={labelClass}>カテゴリ</label>
                <select className={fieldClass} value={communityDraft.category || 'other'}
                  onChange={(e) => setCommunityDraft((d) => ({ ...d, category: e.target.value }))}>
                  <option value="buy">購入</option>
                  <option value="sell">売却</option>
                  <option value="reform">リフォーム</option>
                  <option value="invest">投資</option>
                  <option value="trouble">トラブル</option>
                  <option value="other">その他</option>
                </select>
              </div>
              <div className="ha-row">
                <label className={labelClass}>タイトル（例：住宅購入で後悔しました）</label>
                <input
                  className={fieldClass}
                  value={communityDraft.title}
                  onChange={(e) => setCommunityDraft((d) => ({ ...d, title: e.target.value }))}
                  placeholder="〇〇で後悔しました / 〇〇で損しました"
                />
              </div>"""

content = content.replace(old_form, new_form, 1)

# ① お名前フィールドの後に「損した金額」フィールドを追加
old_name_field = """              <div className="ha-row">
                <label className={labelClass}>お名前（任意）</label>
                <input
                  className={fieldClass}
                  value={communityDraft.author}
                  onChange={(e) => setCommunityDraft((d) => ({ ...d, author: e.target.value }))}
                  placeholder="空欄なら匿名"
                />
              </div>
              <button type="button" className="ha-btn" onClick={addPost}>
                投稿する
              </button>"""

new_name_field = """              <div style={{ display: 'flex', gap: 12 }}>
                <div className="ha-row" style={{ flex: 1 }}>
                  <label className={labelClass}>お名前（任意）</label>
                  <input
                    className={fieldClass}
                    value={communityDraft.author}
                    onChange={(e) => setCommunityDraft((d) => ({ ...d, author: e.target.value }))}
                    placeholder="空欄なら匿名"
                  />
                </div>
                <div className="ha-row" style={{ flex: 1 }}>
                  <label className={labelClass}>💸 損した金額（任意）</label>
                  <input
                    className={fieldClass}
                    value={communityDraft.lossAmount || ''}
                    onChange={(e) => setCommunityDraft((d) => ({ ...d, lossAmount: e.target.value }))}
                    placeholder="例：約100万円"
                  />
                </div>
              </div>
              <button type="button" className="ha-btn" onClick={addPost}>
                投稿する（匿名OK）
              </button>"""

content = content.replace(old_name_field, new_name_field, 1)

# ② ランキングソート用のstateを追加
content = content.replace(
    "const [aiLoadingPostId, setAiLoadingPostId] = useState(null)",
    "const [aiLoadingPostId, setAiLoadingPostId] = useState(null)\n  const [rankSort, setRankSort] = useState('empathy')"
)

# ② コミュニティセクションのタイトル部分にランキングソートを追加
old_community_header = """              <h2 className="ha-sectionTitle">🏘️ コミュニティ</h2>
                <div style={{ display: 'flex', gap: 6 }}>"""

new_community_header = """              <h2 className="ha-sectionTitle">🏘️ コミュニティ</h2>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <select value={rankSort} onChange={(e) => setRankSort(e.target.value)}
                    style={{ fontSize: 11, padding: '4px 8px', borderRadius: 6, border: '1px solid #ddd', color: '#555', cursor: 'pointer' }}>
                    <option value="empathy">💗 共感順</option>
                    <option value="likes">👍 いいね順</option>
                    <option value="new">🆕 新着順</option>
                  </select>"""

content = content.replace(old_community_header, new_community_header, 1)

# ② ランキング表示：posts.mapの前にソート処理を追加
old_posts_map = "              posts.length === 0 ? (\n                <p style={{ color: 'var(--muted)', fontSize: 14 }}>まだ投稿がありません。最初の体験談を投稿してみましょう。</p>\n              ) : (\n                posts.map((post) => ("

new_posts_map = """              posts.length === 0 ? (
                <p style={{ color: 'var(--muted)', fontSize: 14 }}>まだ投稿がありません。最初の体験談を投稿してみましょう。</p>
              ) : (
                [...posts].sort((a, b) => {
                  if (rankSort === 'empathy') return (b.empathy || 0) - (a.empathy || 0)
                  if (rankSort === 'likes') return (b.likes || 0) - (a.likes || 0)
                  return (b.createdAt || 0) - (a.createdAt || 0)
                }).map((post) => ("""

content = content.replace(old_posts_map, new_posts_map, 1)

# ② 投稿カードに損した金額・ランキングバッジを表示
old_post_h4 = "                  <article key={post.id} className=\"ha-post\" style={{ color: '#1a1a1a' }}>\n                    <h4>{post.title}</h4>"

new_post_h4 = """                  <article key={post.id} className="ha-post" style={{ color: '#1a1a1a' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                      <h4 style={{ margin: 0, flex: 1 }}>{post.title}</h4>
                      {post.lossAmount && (
                        <span style={{ fontSize: 11, fontWeight: 700, background: '#fff5f5', color: '#c0392b', border: '1px solid #ffd5d5', padding: '2px 8px', borderRadius: 10, marginLeft: 8, whiteSpace: 'nowrap' }}>
                          💸 {post.lossAmount}
                        </span>
                      )}
                    </div>"""

content = content.replace(old_post_h4, new_post_h4, 1)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print("✅ App.jsx 修正完了（損した金額・ランキング）")

# ============================================================
# ③ index.html の OGP 設定
# ============================================================
import os
html_path = "/Users/ogawayotakeshi/Desktop/house-ai/index.html"

with open(html_path, "r", encoding="utf-8") as f:
    html = f.read()

ogp_tags = '''
    <!-- OGP / SNSシェア設定 -->
    <meta property="og:title" content="不動産AIコンシェルジュ｜あなたの判断を30秒で最適化" />
    <meta property="og:description" content="住宅購入・売却・投資・リフォームの悩みをAIが解決。営業なし・完全無料。同じ失敗を繰り返さないために。" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://house-ai-ten.vercel.app" />
    <meta property="og:image" content="https://house-ai-ten.vercel.app/og-image.png" />
    <meta property="og:site_name" content="不動産AIコンシェルジュ" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="不動産AIコンシェルジュ｜あなたの判断を30秒で最適化" />
    <meta name="twitter:description" content="住宅購入で後悔する前に。AIが最適な進め方を提案します。営業なし・完全無料。" />
    <meta name="twitter:image" content="https://house-ai-ten.vercel.app/og-image.png" />
    <!-- SEO -->
    <meta name="description" content="住宅購入・売却・投資・リフォームの悩みをAIが解決。不動産で失敗しないための無料AIコンシェルジュ。" />
    <meta name="keywords" content="不動産,失敗,住宅購入,後悔,リフォーム,トラブル,AI,無料相談" />'''

# <title>タグの前にOGPを挿入
if 'og:title' not in html:
    html = html.replace('<title>', ogp_tags + '\n    <title>')
    with open(html_path, "w", encoding="utf-8") as f:
        f.write(html)
    print("✅ index.html OGP設定完了")
else:
    print("ℹ️ OGPはすでに設定済みです")
