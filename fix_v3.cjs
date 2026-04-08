const fs = require('fs');
const path = require('path');

const filePath = path.join('C:\\Users\\ginte\\Desktop\\house-ai\\src\\App.jsx');
let code = fs.readFileSync(filePath, 'utf8');

// 1. タイトル変更
code = code.replace(
  '<strong>House AI プラットフォーム</strong>',
  '<strong>不動産AIコンシェルジュ</strong>'
);
code = code.replace(
  '<span>不動産の相談・査定・オーナー支援・コミュニティ</span>',
  '<span>不動産のお悩み・査定・専門家紹介・コミュニティ</span>'
);

// 2. タブ名変更
code = code.replace(
  "{ id: 'sell', label: '買取無料査定', icon: '🏷️' }",
  "{ id: 'sell', label: '売却査定', icon: '🏷️' }"
);

// 3. 売主査定の古い文言削除
code = code.replace(
  `<h2 className="ha-sectionTitle">🏷️ 売主査定</h2>
              <p className="ha-sectionDesc">
                売却査定のご依頼を2ステップで受け付けます。入力内容はデモのためブラウザ内のみで完結します（実運用ではサーバー送信に差し替えてください）。
              </p>`,
  `<h2 className="ha-sectionTitle">🏷️ 売却査定</h2>
              <p className="ha-sectionDesc">
                売却査定のご依頼を2ステップで受け付けます。担当者より折り返しご連絡いたします。
              </p>`
);

// 4. 青マーカー（ヒント文言）削除
code = code.replace(
  `                <p className="ha-hint">※Claudeはサーバー経由（/api/claude）。APIキーはサーバー側で管理されます。</p>`,
  ``
);

// 5. 業者様向けタブを追加
code = code.replace(
  "{ id: 'community', label: 'コミュニティ', icon: '🏘️' },",
  `{ id: 'community', label: 'コミュニティ', icon: '🏘️' },
  { id: 'agency', label: '業者様向け', icon: '🏗️' },`
);

// 6. 郵便番号自動入力機能を追加（住所フィールドの前に郵便番号欄を追加）
code = code.replace(
  `                      <div className="ha-row">
                        <label className={labelClass}>住所（市区町村・番地まで）</label>
                        <input
                          className={fieldClass}
                          value={sell.address}
                          onChange={(e) => setSell((s) => ({ ...s, address: e.target.value }))}
                          placeholder="例：東京都〇〇区..."
                          autoComplete="street-address"
                        />
                      </div>`,
  `                      <div className="ha-row">
                        <label className={labelClass}>郵便番号（自動入力）</label>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <input
                            className={fieldClass}
                            value={sell.zip || ''}
                            onChange={(e) => setSell((s) => ({ ...s, zip: e.target.value }))}
                            placeholder="例：3300803"
                            inputMode="numeric"
                            maxLength={8}
                            style={{ maxWidth: 160 }}
                          />
                          <button
                            type="button"
                            className="ha-btn"
                            onClick={async () => {
                              const zip = (sell.zip || '').replace('-', '').trim();
                              if (zip.length !== 7) return;
                              try {
                                const res = await fetch(\`https://zipcloud.ibsnet.co.jp/api/search?zipcode=\${zip}\`);
                                const data = await res.json();
                                if (data.results && data.results[0]) {
                                  const r = data.results[0];
                                  setSell((s) => ({ ...s, address: r.address1 + r.address2 + r.address3 }));
                                }
                              } catch {}
                            }}
                          >
                            住所を検索
                          </button>
                        </div>
                      </div>
                      <div className="ha-row">
                        <label className={labelClass}>住所（市区町村・番地まで）</label>
                        <input
                          className={fieldClass}
                          value={sell.address}
                          onChange={(e) => setSell((s) => ({ ...s, address: e.target.value }))}
                          placeholder="例：東京都〇〇区..."
                          autoComplete="street-address"
                        />
                      </div>`
);

// 7. 利用上の注意をヘッダー直下に追加
code = code.replace(
  `        <nav className="ha-tabs" role="tablist" aria-label="メイン">`,
  `        <div style={{
          margin: '0 12px 12px',
          padding: '14px 16px',
          borderRadius: 14,
          background: '#fffbeb',
          border: '1px solid #f59e0b',
          fontSize: 13,
          lineHeight: 1.7,
          color: '#92400e',
        }}>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>📋 ご利用上の注意</div>
          <div><strong>目的：</strong>当コミュニティは不動産にまつわるお悩みや課題を解決することを目的としています。</div>
          <div>※ 組織名・固有名詞・個人もしくは組織を特定できるような内容はお控えください。</div>
          <div>※ コミュニティ内での営業は理由を問わずアドバイス以外は禁止とします。</div>
          <div>※ 悩みや問題解決以外の目的でのご利用はご遠慮ください。運営側で発見した場合、如何なる理由を問わず削除させていただく場合がございます。</div>
        </div>

        <nav className="ha-tabs" role="tablist" aria-label="メイン">`
);

// 8. 業者様向けページを追加（タブの最後に）
code = code.replace(
  `          {tab === 'community' &&`,
  `          {tab === 'agency' && (
            <div className="ha-panel">
              <h2 className="ha-sectionTitle">🏗️ 業者様向け</h2>
              <p className="ha-sectionDesc">
                不動産業者・リフォーム業者・士業の方向けの会員サービスです。会員登録いただくと企業紹介ページを作成できます。
              </p>
              <div className="ha-cards">
                <div className="ha-card">
                  <h4>📣 企業紹介ページ</h4>
                  <p>会員登録後、自社の紹介ページを作成できます。サービス内容・エリア・実績などを掲載可能です。</p>
                </div>
                <div className="ha-card">
                  <h4>🎯 ターゲット集客</h4>
                  <p>不動産に関心の高いユーザーへのアプローチが可能です。問い合わせを直接受け付けられます。</p>
                </div>
                <div className="ha-card">
                  <h4>📊 広告掲載</h4>
                  <p>バナー広告・記事広告など、貴社のニーズに合わせた広告プランをご用意予定です。</p>
                </div>
              </div>
              <div className="ha-actions" style={{ marginTop: 24 }}>
                <button
                  type="button"
                  className="ha-btn"
                  style={{ background: 'var(--accent)', color: '#fff', border: 'none' }}
                  onClick={() => alert('業者様向け会員登録は準備中です。しばらくお待ちください。')}
                >
                  業者会員登録（準備中）
                </button>
              </div>
            </div>
          )}

          {tab === 'community' &&`
);

// 9. 会員専用ページタブを追加
code = code.replace(
  "{ id: 'agency', label: '業者様向け', icon: '🏗️' },",
  `{ id: 'agency', label: '業者様向け', icon: '🏗️' },
  { id: 'member', label: '会員専用', icon: '👤' },`
);

// 10. 会員専用ページを追加
code = code.replace(
  `          {tab === 'agency' && (`,
  `          {tab === 'member' && (
            <div className="ha-panel">
              <h2 className="ha-sectionTitle">👤 会員専用ページ</h2>
              <p className="ha-sectionDesc">
                会員の方向けの専用コンテンツです。会員登録いただくと以下のサービスをご利用いただけます。
              </p>
              <div className="ha-cards">
                <div className="ha-card">
                  <h4>📁 相談履歴</h4>
                  <p>過去のAI相談履歴を保存・閲覧できます。いつでも振り返ることができます。</p>
                </div>
                <div className="ha-card">
                  <h4>🔔 物件アラート</h4>
                  <p>希望条件に合った物件が出たらメールでお知らせします。</p>
                </div>
                <div className="ha-card">
                  <h4>⭐ お気に入り</h4>
                  <p>気になる物件や専門家をお気に入り登録できます。</p>
                </div>
              </div>
              <div className="ha-actions" style={{ marginTop: 24 }}>
                <button
                  type="button"
                  className="ha-btn"
                  style={{ background: 'var(--accent)', color: '#fff', border: 'none' }}
                  onClick={() => alert('会員登録機能は準備中です。しばらくお待ちください。')}
                >
                  会員登録する（準備中）
                </button>
              </div>
            </div>
          )}

          {tab === 'agency' && (`
);

fs.writeFileSync(filePath, code, 'utf8');
console.log('SUCCESS');