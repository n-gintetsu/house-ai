const fs = require('fs')
const path = require('path')

const appPath = path.join(__dirname, 'src', 'App.jsx')
let content = fs.readFileSync(appPath, 'utf8')

// すでに追加済みチェック
if (content.includes('agencyType')) {
  console.log('INFO: すでに業者選択画面が追加されています')
  process.exit(0)
}

// agencyタブ全体を置き換え
const oldAgency = `          {tab === 'agency' && (
            <div className="ha-panel" style={{ padding: 0 }}>
              {/* 業者専用ダッシュボードリンク */}
              <div style={{ background: '#1a3a5c', borderRadius: '12px 12px 0 0', padding: '20px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <div style={{ color: '#c9a84c', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>すでに登録済みの業者様へ</div>
                    <div style={{ color: '#fff', fontSize: 16, fontWeight: 700 }}>🏢 業者専用ダッシュボード</div>
                    <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 4 }}>物件の登録・管理・公開設定ができます</div>
                  </div>
                  <a href="/agency" style={{ display: 'inline-block', padding: '12px 24px', background: '#f5a623', color: '#1a3a5c', borderRadius: 10, fontWeight: 700, fontSize: 14, textDecoration: 'none', whiteSpace: 'nowrap' }}>
                    ダッシュボードへ →
                  </a>
                </div>
              </div>
              <AgencyForm />
            </div>
          )}`

const newAgency = `          {tab === 'agency' && (
            <div className="ha-panel" style={{ padding: 0 }}>
              {!agencyType && (
                <div style={{ padding: '40px 24px' }}>
                  <h2 style={{ color: '#1a3a5c', fontSize: 20, fontWeight: 700, textAlign: 'center', marginBottom: 8 }}>🏗️ 業者様向けサービス</h2>
                  <p style={{ color: '#666', fontSize: 14, textAlign: 'center', marginBottom: 32 }}>ご利用用途をお選びください</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 560, margin: '0 auto' }}>
                    <div style={{ border: '2px solid #1a3a5c', borderRadius: 16, padding: '28px 24px', cursor: 'pointer', background: '#fff', transition: 'box-shadow 0.2s' }}
                      onClick={() => setAgencyType('realestate')}
                      onMouseEnter={e => e.currentTarget.style.boxShadow='0 4px 20px rgba(26,58,92,0.15)'}
                      onMouseLeave={e => e.currentTarget.style.boxShadow='none'}>
                      <div style={{ fontSize: 32, marginBottom: 10 }}>🏠</div>
                      <div style={{ color: '#1a3a5c', fontSize: 18, fontWeight: 700, marginBottom: 8 }}>不動産業者様</div>
                      <div style={{ color: '#555', fontSize: 13, lineHeight: 1.7, marginBottom: 16 }}>
                        物件の登録・掲載・管理ができます。<br />
                        専用ダッシュボードにて物件情報をご登録いただけます。
                      </div>
                      <div style={{ display: 'inline-block', padding: '10px 24px', background: '#1a3a5c', color: '#fff', borderRadius: 10, fontWeight: 700, fontSize: 14 }}>
                        物件掲載ダッシュボードへ →
                      </div>
                    </div>
                    <div style={{ border: '2px solid #c9a84c', borderRadius: 16, padding: '28px 24px', cursor: 'pointer', background: '#fff', transition: 'box-shadow 0.2s' }}
                      onClick={() => setAgencyType('other')}
                      onMouseEnter={e => e.currentTarget.style.boxShadow='0 4px 20px rgba(201,168,76,0.2)'}
                      onMouseLeave={e => e.currentTarget.style.boxShadow='none'}>
                      <div style={{ fontSize: 32, marginBottom: 10 }}>🏢</div>
                      <div style={{ color: '#1a3a5c', fontSize: 18, fontWeight: 700, marginBottom: 8 }}>その他の業者様</div>
                      <div style={{ color: '#555', fontSize: 13, lineHeight: 1.7, marginBottom: 4 }}>
                        リフォーム・外構・司法書士・税理士・金融機関など<br />
                        当サイトへの広告掲載をご希望の方はこちら。
                      </div>
                      <div style={{ color: '#888', fontSize: 12, marginBottom: 16 }}>※ 広告ページはこちらで作成し、当サイトに掲載いたします</div>
                      <div style={{ display: 'inline-block', padding: '10px 24px', background: '#c9a84c', color: '#fff', borderRadius: 10, fontWeight: 700, fontSize: 14 }}>
                        広告掲載のお申し込みへ →
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {agencyType === 'realestate' && (
                <div>
                  <div style={{ background: '#1a3a5c', borderRadius: '12px 12px 0 0', padding: '20px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                      <div>
                        <div style={{ color: '#c9a84c', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>不動産業者様向け</div>
                        <div style={{ color: '#fff', fontSize: 16, fontWeight: 700 }}>🏠 不動産業者様専用ダッシュボード</div>
                        <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 4 }}>物件の登録・管理・公開設定ができます</div>
                      </div>
                      <a href="/agency" style={{ display: 'inline-block', padding: '12px 24px', background: '#f5a623', color: '#1a3a5c', borderRadius: 10, fontWeight: 700, fontSize: 14, textDecoration: 'none', whiteSpace: 'nowrap' }}>
                        ダッシュボードへ →
                      </a>
                    </div>
                  </div>
                  <div style={{ padding: '16px 24px' }}>
                    <button onClick={() => setAgencyType(null)} style={{ background: 'none', border: 'none', color: '#1a3a5c', fontSize: 13, cursor: 'pointer', textDecoration: 'underline' }}>← 選択画面に戻る</button>
                  </div>
                  <AgencyForm />
                </div>
              )}
              {agencyType === 'other' && (
                <div style={{ padding: '32px 24px' }}>
                  <button onClick={() => setAgencyType(null)} style={{ background: 'none', border: 'none', color: '#1a3a5c', fontSize: 13, cursor: 'pointer', textDecoration: 'underline', marginBottom: 24, display: 'block' }}>← 選択画面に戻る</button>
                  <h2 style={{ color: '#1a3a5c', fontSize: 18, fontWeight: 700, marginBottom: 8 }}>🏢 広告掲載のお申し込み</h2>
                  <p style={{ color: '#555', fontSize: 13, lineHeight: 1.8, marginBottom: 24 }}>
                    リフォーム・外構・司法書士・税理士・金融機関など、各業種の業者様の広告を当サイトに掲載いたします。<br />
                    まずは会員登録をお願いいたします。担当者よりご連絡させていただきます。
                  </p>
                  <AgencyForm />
                </div>
              )}
            </div>
          )}`

if (!content.includes(oldAgency)) {
  console.log('ERROR: 置き換え対象が見つかりませんでした。App.jsxの内容を確認してください')
  process.exit(1)
}

// useState の追加（agencyType用）
// const [tab, setTab] = useState の行を探してその後に追加
const stateTarget = `const [tab, setTab] = useState(`
if (!content.includes(stateTarget)) {
  console.log('ERROR: useState(tab)が見つかりませんでした')
  process.exit(1)
}

// tabのuseState行を探して改行後にagencyTypeを追加
const tabStateRegex = /(const \[tab, setTab\] = useState\([^)]*\))/
content = content.replace(tabStateRegex, '$1\n  const [agencyType, setAgencyType] = useState(null)')

content = content.replace(oldAgency, newAgency)
fs.writeFileSync(appPath, content, 'utf8')
console.log('SUCCESS: 業者選択画面を追加しました！npm run build を実行してください')
