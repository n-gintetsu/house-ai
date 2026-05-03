import { useState, useRef } from 'react'

const NAVY = '#1a3a5c'
const GOLD = '#c9a84c'
const WHITE = '#ffffff'
const GRAY = '#f5f5f5'
const TEXT = '#1e293b'

const CASES = [
  { icon: '🏠', title: '相続', desc: '親の不動産をどうすればいいか分からない' },
  { icon: '💰', title: '税金', desc: '売却時の税金が不安' },
  { icon: '📝', title: '登記', desc: '名義変更や登記手続きが分からない' },
  { icon: '⚠️', title: '契約トラブル', desc: '契約内容や違約金が不安' },
  { icon: '🏚️', title: '空き家', desc: '空き家の活用・売却方法が知りたい' },
  { icon: '📈', title: '投資', desc: '不動産投資のリスクを専門家に聞きたい' },
  { icon: '🔨', title: 'リフォーム', desc: 'リフォーム費用と価値向上について' },
  { icon: '🤝', title: '売却相談', desc: '相場より高く売るためのアドバイスが欲しい' },
]

const STEPS = [
  { num: 1, title: '無料掲載申請', desc: 'フォームから申請' },
  { num: 2, title: '運営審査', desc: '内容確認・審査' },
  { num: 3, title: 'プロフィール公開', desc: 'サイトに掲載開始' },
  { num: 4, title: 'AIが相談を分類', desc: 'ユーザーの悩みを自動整理' },
  { num: 5, title: '専門家へ相談導線', desc: '条件に合う専門家を紹介' },
  { num: 6, title: 'DM・面談へ', desc: 'やり取りスタート' },
]

const FAQS = [
  { q: '無料で登録できますか？', a: 'はい。まずは無料掲載申請から始められます。' },
  { q: '登録すれば必ず案件が来ますか？', a: '案件発生を保証するものではありません。掲載後の相談状況は専門家様の対応エリア・分野等によります。' },
  { q: '有料プランは必須ですか？', a: 'いいえ。無料掲載から始められます。反応を見ながら必要に応じてアップグレードをご検討ください。' },
  { q: 'いつ有料プランに変更できますか？', a: '掲載後、必要に応じていつでもアップグレードできます。' },
  { q: 'ユーザーとはどう連絡しますか？', a: 'サイト内DMまたは運営指定の方法でやり取りできます。' },
]

const QUAL_OPTIONS = ['弁護士', '司法書士', '税理士', '行政書士', '宅地建物取引士', 'ファイナンシャルプランナー', 'その他']

const initialForm = {
  name: '', office: '', email: '', phone: '',
  qual: '', area: '', field: '', url: '', profile: '',
}

export default function ExpertLP({ onNavigate, onExpertLogin }) {
  const [form, setForm] = useState(initialForm)
  const [submitted, setSubmitted] = useState(false)
  const [openIndex, setOpenIndex] = useState(null)

  const formSection = useRef(null)
  const flowSection = useRef(null)

  const scrollToForm = () => formSection.current?.scrollIntoView({ behavior: 'smooth' })
  const scrollToFlow = () => flowSection.current?.scrollIntoView({ behavior: 'smooth' })

  const handleSubmit = () => {
    setSubmitted(true)
  }

  const setField = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const fieldStyle = {
    width: '100%', boxSizing: 'border-box',
    padding: '12px 14px', borderRadius: 10,
    border: '1.5px solid #dde3ec', background: WHITE,
    color: TEXT, fontSize: 16, fontFamily: 'inherit', outline: 'none',
  }
  const labelStyle = { display: 'block', fontSize: 13, fontWeight: 600, color: '#94a3b8', marginBottom: 6 }

  /* ── 送信完了 ── */
  if (submitted) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 20px', textAlign: 'center', background: WHITE }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: NAVY, marginBottom: 12 }}>申請ありがとうございます</h2>
        <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.8, marginBottom: 28, maxWidth: 400 }}>
          まずは無料掲載の審査を行います。掲載後、相談状況を見ながら有料プランへアップグレードできます。
        </p>
        <button
          onClick={() => onNavigate('member')}
          style={{ background: GOLD, color: WHITE, border: 'none', borderRadius: 12, padding: '14px 32px', fontSize: 15, fontWeight: 800, cursor: 'pointer' }}
        >
          マイページで確認する
        </button>
      </div>
    )
  }

  return (
    <div style={{ color: TEXT, fontFamily: 'inherit' }}>

      {/* ① ファーストビュー */}
      <section style={{ background: `linear-gradient(135deg, ${NAVY} 0%, #0f2540 100%)`, padding: '56px 20px 48px', textAlign: 'center' }}>
        <p style={{ fontSize: 12, color: GOLD, fontWeight: 700, letterSpacing: '0.08em', marginBottom: 12 }}>不動産専門家のための集客プラットフォーム</p>
        <h1 style={{ color: WHITE, fontSize: 22, fontWeight: 800, lineHeight: 1.6, margin: '0 auto 16px', maxWidth: 480 }}>
          不動産相談に強い専門家を<br />無料掲載できます
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14, lineHeight: 1.8, margin: '0 auto 28px', maxWidth: 420 }}>
          AIがユーザーの悩みを整理し、相続・税金・登記・契約トラブルなど、専門家が必要な相談だけをマッチングします。
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
          <button
            onClick={scrollToForm}
            style={{ background: GOLD, color: WHITE, border: 'none', borderRadius: 12, padding: '14px 28px', fontSize: 15, fontWeight: 800, cursor: 'pointer' }}
          >
            無料で掲載申請する
          </button>
          <button
            onClick={scrollToFlow}
            style={{ background: 'transparent', color: WHITE, border: `2px solid ${WHITE}`, borderRadius: 12, padding: '14px 28px', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}
          >
            仕組みを見る
          </button>
        </div>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, marginBottom: 16 }}>
          ※無料掲載から始められます　※案件発生を保証するものではありません
        </p>
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={() => onNavigate ? onNavigate('expertdashboard') : onExpertLogin?.()}
            style={{ background: WHITE, color: NAVY, border: `2px solid ${NAVY}`, borderRadius: 8, padding: '12px 24px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
          >
            専門家ログインはこちら
          </button>
        </div>
      </section>

      {/* ② どんな相談が届くか */}
      <section style={{ padding: '48px 16px', background: WHITE }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: NAVY, textAlign: 'center', marginBottom: 8 }}>こんな不動産相談が届きます</h2>
        <p style={{ fontSize: 13, color: '#64748b', textAlign: 'center', marginBottom: 24 }}>AIが整理した、相談意欲の高いユーザーのみをマッチング</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, maxWidth: 720, margin: '0 auto' }}>
          {CASES.map((c) => (
            <div key={c.title} style={{ background: GRAY, borderRadius: 12, padding: '16px 14px', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 24, flexShrink: 0 }}>{c.icon}</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: NAVY, marginBottom: 4 }}>{c.title}</div>
                <div style={{ fontSize: 12, color: '#475569', lineHeight: 1.5 }}>{c.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ③ 無料登録でできること */}
      <section style={{ padding: '48px 16px', background: GRAY }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: NAVY, textAlign: 'center', marginBottom: 8 }}>まずは無料掲載から始められます</h2>
        <p style={{ fontSize: 13, color: '#64748b', textAlign: 'center', marginBottom: 24 }}>最初から有料契約は不要です。まずは掲載して反応を確認できます。</p>
        <div style={{ background: WHITE, borderRadius: 16, padding: '24px 20px', maxWidth: 480, margin: '0 auto 24px' }}>
          {[
            '専門家プロフィール掲載',
            '対応分野の登録',
            '対応エリアの登録',
            '一部相談案件の閲覧',
            'ユーザーからの問い合わせ受付',
            '運営審査後に掲載',
          ].map((item) => (
            <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid #f1f5f9', fontSize: 14, color: TEXT }}>
              <span style={{ fontSize: 18 }}>✅</span>
              {item}
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={scrollToForm}
            style={{ background: GOLD, color: WHITE, border: 'none', borderRadius: 12, padding: '14px 32px', fontSize: 15, fontWeight: 800, cursor: 'pointer' }}
          >
            無料で掲載申請する
          </button>
        </div>
      </section>

      {/* ④ マッチングの流れ */}
      <section ref={flowSection} style={{ padding: '48px 16px', background: WHITE }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: NAVY, textAlign: 'center', marginBottom: 32 }}>相談紹介までの流れ</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 480, margin: '0 auto' }}>
          {STEPS.map((s, i) => (
            <div key={s.num} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                background: i % 2 === 0 ? NAVY : GOLD,
                color: WHITE, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 800,
              }}>
                {s.num}
              </div>
              <div style={{ flex: 1, background: GRAY, borderRadius: 10, padding: '12px 14px' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>{s.title}</div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ⑤ 料金プラン */}
      <section style={{ padding: '48px 16px', background: GRAY }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: NAVY, textAlign: 'center', marginBottom: 8 }}>もっと相談機会を増やしたい方へ</h2>
        <p style={{ fontSize: 13, color: '#64748b', textAlign: 'center', marginBottom: 28 }}>反応を見ながら、有料プランへアップグレードできます。</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 480, margin: '0 auto' }}>

          {/* フリー */}
          <div style={{ background: WHITE, borderRadius: 16, padding: '24px 20px', border: '1.5px solid #e2e8f0' }}>
            <div style={{ display: 'inline-block', background: GRAY, color: '#64748b', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, marginBottom: 12 }}>まずはこちら</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: NAVY, marginBottom: 4 }}>フリープラン</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: TEXT, marginBottom: 16 }}>0円</div>
            {['プロフィール掲載', '対応分野登録', '対応エリア登録', '一部案件閲覧', '問い合わせ制限あり'].map((f) => (
              <div key={f} style={{ fontSize: 13, color: '#475569', padding: '6px 0', borderBottom: '1px solid #f1f5f9' }}>・ {f}</div>
            ))}
            <button onClick={scrollToForm} style={{ marginTop: 18, width: '100%', background: GOLD, color: WHITE, border: 'none', borderRadius: 10, padding: '12px 0', fontSize: 14, fontWeight: 800, cursor: 'pointer' }}>
              無料で始める
            </button>
          </div>

          {/* スタンダード */}
          <div style={{ background: WHITE, borderRadius: 16, padding: '24px 20px', border: `2px solid ${GOLD}` }}>
            <div style={{ display: 'inline-block', background: '#fff8e6', color: '#92650a', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, marginBottom: 12 }}>相談機会を増やしたい方向け</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: NAVY, marginBottom: 4 }}>スタンダード</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: TEXT, marginBottom: 16 }}>9,800円<span style={{ fontSize: 14, fontWeight: 400 }}>/月</span></div>
            {['プロフィール掲載', '案件通知', 'DM機能', '月15件まで相談受付', '検索/AI推薦対象'].map((f) => (
              <div key={f} style={{ fontSize: 13, color: '#475569', padding: '6px 0', borderBottom: '1px solid #f1f5f9' }}>・ {f}</div>
            ))}
            <button onClick={scrollToForm} style={{ marginTop: 18, width: '100%', background: NAVY, color: WHITE, border: 'none', borderRadius: 10, padding: '12px 0', fontSize: 14, fontWeight: 800, cursor: 'pointer' }}>
              アップグレードする
            </button>
          </div>

          {/* プレミアム */}
          <div style={{ background: NAVY, borderRadius: 16, padding: '24px 20px' }}>
            <div style={{ display: 'inline-block', background: GOLD, color: WHITE, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, marginBottom: 12 }}>本格的に集客したい方向け</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.7)', marginBottom: 4 }}>プレミアム</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: WHITE, marginBottom: 16 }}>29,800円<span style={{ fontSize: 14, fontWeight: 400 }}>/月</span></div>
            {['AI優先推薦', '特集掲載', '案件優先通知', '相談件数上限アップ', 'レビュー掲載', '専門家ページ強化'].map((f) => (
              <div key={f} style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>・ {f}</div>
            ))}
            <button onClick={scrollToForm} style={{ marginTop: 18, width: '100%', background: GOLD, color: WHITE, border: 'none', borderRadius: 10, padding: '12px 0', fontSize: 14, fontWeight: 800, cursor: 'pointer' }}>
              プレミアムを見る
            </button>
          </div>
        </div>
      </section>

      {/* ⑥ 登録フォーム */}
      <section ref={formSection} style={{ padding: '48px 16px', background: NAVY }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: WHITE, textAlign: 'center', marginBottom: 8 }}>無料掲載申請フォーム</h2>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', textAlign: 'center', marginBottom: 28 }}>内容確認後、運営よりご連絡いたします。</p>
        <div style={{ maxWidth: 480, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={labelStyle}>氏名</label>
            <input style={fieldStyle} type="text" value={form.name} onChange={setField('name')} placeholder="山田 太郎" />
          </div>
          <div>
            <label style={labelStyle}>事務所名</label>
            <input style={fieldStyle} type="text" value={form.office} onChange={setField('office')} placeholder="山田法律事務所" />
          </div>
          <div>
            <label style={labelStyle}>メールアドレス</label>
            <input style={fieldStyle} type="email" value={form.email} onChange={setField('email')} placeholder="example@office.jp" />
          </div>
          <div>
            <label style={labelStyle}>電話番号</label>
            <input style={fieldStyle} type="tel" value={form.phone} onChange={setField('phone')} placeholder="03-0000-0000" />
          </div>
          <div>
            <label style={labelStyle}>資格種別</label>
            <select style={fieldStyle} value={form.qual} onChange={setField('qual')}>
              <option value="">選択してください</option>
              {QUAL_OPTIONS.map((q) => <option key={q} value={q}>{q}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>対応エリア</label>
            <input style={fieldStyle} type="text" value={form.area} onChange={setField('area')} placeholder="例：東京都・神奈川県" />
          </div>
          <div>
            <label style={labelStyle}>対応分野</label>
            <input style={fieldStyle} type="text" value={form.field} onChange={setField('field')} placeholder="例：相続・税金・登記" />
          </div>
          <div>
            <label style={labelStyle}>公式サイトURL</label>
            <input style={fieldStyle} type="url" value={form.url} onChange={setField('url')} placeholder="https://your-office.jp" />
          </div>
          <div>
            <label style={labelStyle}>プロフィール文</label>
            <textarea
              style={{ ...fieldStyle, resize: 'vertical' }}
              value={form.profile}
              onChange={setField('profile')}
              rows={4}
              placeholder="専門分野や得意な相談内容を記入してください"
            />
          </div>
          <button
            onClick={handleSubmit}
            style={{ width: '100%', height: 52, background: GOLD, color: WHITE, border: 'none', borderRadius: 12, fontSize: 16, fontWeight: 800, cursor: 'pointer' }}
          >
            無料掲載を申請する
          </button>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', textAlign: 'center', lineHeight: 1.8 }}>
            ※申請内容を確認後、掲載可否をご連絡します<br />
            ※案件発生を保証するものではありません<br />
            ※営業連絡は一切ありません
          </p>
        </div>
      </section>

      {/* ⑦ FAQ */}
      <section style={{ padding: '48px 16px', background: WHITE }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: NAVY, textAlign: 'center', marginBottom: 24 }}>よくある質問</h2>
        <div style={{ maxWidth: 480, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {FAQS.map((faq, i) => (
            <div key={i} style={{ border: '1.5px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' }}>
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                style={{
                  width: '100%', background: openIndex === i ? '#f0f4f8' : WHITE,
                  border: 'none', padding: '14px 16px', textAlign: 'left', cursor: 'pointer',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8,
                  fontSize: 14, fontWeight: 700, color: NAVY,
                }}
              >
                <span>Q. {faq.q}</span>
                <span style={{ flexShrink: 0, fontSize: 16, color: GOLD }}>{openIndex === i ? '▲' : '▼'}</span>
              </button>
              {openIndex === i && (
                <div style={{ padding: '12px 16px 14px', fontSize: 13, color: '#475569', lineHeight: 1.7, borderTop: '1px solid #e2e8f0' }}>
                  A. {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ⑧ 最終CTA */}
      <section style={{ padding: '48px 20px', background: `linear-gradient(135deg, ${GOLD} 0%, #a87c2a 100%)`, textAlign: 'center' }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: WHITE, marginBottom: 24 }}>まずは無料掲載申請から始めましょう</h2>
        <button
          onClick={scrollToForm}
          style={{ background: NAVY, color: WHITE, border: 'none', borderRadius: 12, padding: '14px 36px', fontSize: 15, fontWeight: 800, cursor: 'pointer' }}
        >
          無料で掲載申請する
        </button>
      </section>

    </div>
  )
}
