const fs = require('fs')
const path = require('path')

const filePath = path.join(__dirname, 'src', 'PropertyMatching.jsx')
let content = fs.readFileSync(filePath, 'utf8')

// 「この物件について相談する」ボタンの後に引越し見積もりボタンを追加
const oldBtn = `          {/* 問い合わせボタン */}
          <button onClick={() => { onClose(); window.scrollTo(0,0) }} style={{ width: '100%', marginTop: 16, padding: '14px', background: '#f5a623', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
            📞 この物件について相談する
          </button>`

const newBtn = `          {/* 問い合わせボタン */}
          <button onClick={() => { onClose(); window.scrollTo(0,0) }} style={{ width: '100%', marginTop: 16, padding: '14px', background: '#f5a623', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
            📞 この物件について相談する
          </button>

          {/* 引越し見積もりボタン（賃貸物件のみ）*/}
          {(p.deal_type === 'rent' || p.rent) && (
            <div style={{ marginTop: 12, border: '1.5px solid #2d6a4f', borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ background: '#f0faf5', padding: '12px 16px', borderBottom: '1px solid #d1fae5' }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: '#2d6a4f', marginBottom: 4 }}>🚚 引越し費用を節約しませんか？</div>
                <div style={{ fontSize: 12, color: '#555', lineHeight: 1.6 }}>
                  複数の引越し業者に一括見積もりを依頼できます。<br />
                  平均で<strong>3〜5万円</strong>お得になるケースも！
                </div>
              </div>
              <div style={{ padding: '12px 16px', background: '#fff' }}>
                <a
                  href="https://px.a8.net/svt/ejp?a8mat=3ZOOM00+XXXXXX+XXXX+XXXXXX"
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  style={{ display: 'block', width: '100%', boxSizing: 'border-box', padding: '12px', background: '#2d6a4f', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: 'pointer', textDecoration: 'none', textAlign: 'center' }}
                >
                  🚚 引越し費用を無料一括見積もり →
                </a>
                <div style={{ fontSize: 10, color: '#bbb', textAlign: 'center', marginTop: 4 }}>※ 引越し比較サービスのページへ移動します</div>
              </div>
            </div>
          )}

          {/* 火災保険ボタン（売買・賃貸両方）*/}
          <div style={{ marginTop: 12, border: '1.5px solid #1e40af', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ background: '#eff6ff', padding: '12px 16px', borderBottom: '1px solid #bfdbfe' }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#1e40af', marginBottom: 4 }}>🔥 火災保険の加入はお済みですか？</div>
              <div style={{ fontSize: 12, color: '#555', lineHeight: 1.6 }}>
                {p.deal_type === 'rent' || p.rent ? '賃貸でも火災保険は必須です。' : '住宅購入時の火災保険を比較できます。'}
                一括比較で<strong>最安値</strong>を見つけましょう。
              </div>
            </div>
            <div style={{ padding: '12px 16px', background: '#fff' }}>
              <a
                href="https://px.a8.net/svt/ejp?a8mat=3ZOOM00+YYYYYY+YYYY+YYYYYY"
                target="_blank"
                rel="noopener noreferrer sponsored"
                style={{ display: 'block', width: '100%', boxSizing: 'border-box', padding: '12px', background: '#1e40af', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: 'pointer', textDecoration: 'none', textAlign: 'center' }}
              >
                🔥 火災保険を無料一括比較する →
              </a>
              <div style={{ fontSize: 10, color: '#bbb', textAlign: 'center', marginTop: 4 }}>※ 保険比較サービスのページへ移動します</div>
            </div>
          </div>`

if (content.includes(oldBtn)) {
  content = content.replace(oldBtn, newBtn)
  fs.writeFileSync(filePath, content, 'utf8')
  console.log('SUCCESS: 引越し見積もり・火災保険ボタンを追加しました！')
} else {
  console.log('ERROR: 対象箇所が見つかりませんでした')
  process.exit(1)
}
