import { useState } from 'react';

export default function FleaMarketSection() {
  const [activeCard, setActiveCard] = useState(null);

  const items = [
    { id: 1, name: '冷蔵庫', category: '家電' },
    { id: 2, name: '洗濯機', category: '家電' },
    { id: 3, name: 'ソファ', category: '家具' },
    { id: 4, name: 'テレビ', category: '家電' },
    { id: 5, name: '机・デスク', category: '家具' },
    { id: 6, name: '自転車', category: '乗り物' },
    { id: 7, name: '工具類', category: '工具' },
    { id: 8, name: '家具一式', category: '家具' },
  ];

  const tags = ['エリア限定スタート', '古物商対応', '3ステップ出品', '業者査定OK'];

  const steps = [
    { num: '01', title: '写真をアップロード', desc: 'スマホで撮った写真でOK。複数枚まとめて対応。' },
    { num: '02', title: 'AIが商品情報を整理', desc: 'カテゴリ・説明文・相場感をAIが自動で補助します。' },
    { num: '03', title: '出品 or 査定依頼', desc: '自分で売るか、業者にまとめて査定依頼か選べます。' },
  ];

  return (
    <div style={{ background: '#F7F9FC', padding: '64px 24px', fontFamily: 'inherit' }}>
      <style>{`
        @keyframes cardHover {
          0% { transform: translateY(0); }
          100% { transform: translateY(-4px); }
        }
        .flea-item-card:hover {
          transform: translateY(-4px);
          border-color: rgba(26,58,92,0.3);
          box-shadow: 0 8px 24px rgba(26,58,92,0.1);
        }
        .flea-item-card { transition: all 0.2s ease; }
        .flea-cta-btn:hover { opacity: 0.9; }
      `}</style>

      {/* 見出しエリア */}
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <div style={{ width: '40px', height: '2px', background: '#D4AF37', margin: '0 auto 16px' }} />
        <div style={{ fontSize: '26px', fontWeight: '700', color: '#1a3a5c', marginBottom: '10px', lineHeight: '1.4' }}>
          不用品を、捨てる前にAIで整理
        </div>
        <div style={{ fontSize: '14px', color: '#6B7280', lineHeight: '1.8', maxWidth: '480px', margin: '0 auto 20px' }}>
          写真を撮って、カテゴリを選ぶだけ。<br />
          売れそうなものは出品、面倒なら業者査定へ。
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px' }}>
          {tags.map((tag, i) => (
            <span
              key={i}
              style={{
                fontSize: '11px',
                padding: '4px 12px',
                border: '1px solid rgba(201,168,76,0.5)',
                color: '#c9a84c',
                borderRadius: '4px',
                letterSpacing: '1px',
                background: 'rgba(201,168,76,0.05)',
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* 3ステップカード */}
      <div style={{ maxWidth: '800px', margin: '0 auto 56px', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '20px' }}>
        {steps.map((step, i) => (
          <div
            key={i}
            style={{
              background: 'white',
              border: '1px solid rgba(26,58,92,0.08)',
              borderRadius: '16px',
              padding: '28px 24px',
              position: 'relative',
              textAlign: 'center',
            }}
          >
            <div style={{ position: 'absolute', top: '16px', right: '16px', fontSize: '11px', color: 'rgba(201,168,76,0.5)', fontWeight: '700', letterSpacing: '1px' }}>
              STEP
            </div>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(26,58,92,0.05)', border: '1px solid rgba(26,58,92,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <span style={{ fontSize: '18px', fontWeight: '700', color: '#1a3a5c' }}>{step.num}</span>
            </div>
            <div style={{ fontSize: '15px', fontWeight: '700', color: '#1a3a5c', marginBottom: '8px' }}>{step.title}</div>
            <div style={{ fontSize: '13px', color: '#6B7280', lineHeight: '1.6' }}>{step.desc}</div>
          </div>
        ))}
      </div>

      {/* 出品カード例 */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <span style={{ fontSize: '13px', color: '#6B7280', letterSpacing: '2px' }}>出品カード例</span>
      </div>
      <div style={{ maxWidth: '900px', margin: '0 auto 48px', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px' }}>
        {items.map((item) => (
          <div
            key={item.id}
            className="flea-item-card"
            onClick={() => setActiveCard(activeCard === item.id ? null : item.id)}
            style={{
              background: 'white',
              border: '1px solid rgba(26,58,92,0.08)',
              borderRadius: '14px',
              padding: '20px 16px',
              cursor: 'pointer',
            }}
          >
            <div style={{ fontSize: '10px', color: '#c9a84c', background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)', padding: '2px 8px', borderRadius: '4px', marginBottom: '12px', display: 'inline-block', letterSpacing: '1px' }}>
              {item.category}
            </div>
            <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(26,58,92,0.05)', border: '1px solid rgba(26,58,92,0.1)', margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: '20px', height: '20px', borderRadius: '4px', background: 'rgba(26,58,92,0.15)' }} />
            </div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#1a3a5c', textAlign: 'center', marginBottom: '12px' }}>{item.name}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <button style={{ background: '#1a3a5c', color: 'white', fontSize: '12px', padding: '7px', borderRadius: '7px', border: 'none', cursor: 'pointer', width: '100%' }}>
                出品する
              </button>
              <button style={{ background: 'white', color: '#c9a84c', fontSize: '12px', padding: '7px', borderRadius: '7px', border: '1px solid rgba(201,168,76,0.4)', cursor: 'pointer', width: '100%' }}>
                査定依頼する
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* メインCTAエリア */}
      <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{ background: 'white', border: '1px solid rgba(26,58,92,0.1)', borderRadius: '20px', padding: '36px 32px', boxShadow: '0 4px 20px rgba(26,58,92,0.06)' }}>
          <div style={{ fontSize: '18px', fontWeight: '700', color: '#1a3a5c', marginBottom: '8px' }}>
            捨てる前に、一度確かめてみませんか
          </div>
          <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '24px', lineHeight: '1.7' }}>
            まずは写真でかんたん相談。対応エリア限定でスタートします。
          </div>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              className="flea-cta-btn"
              style={{ background: 'linear-gradient(135deg,#1a3a5c,#2a5a8c)', color: 'white', fontSize: '15px', fontWeight: '700', padding: '16px 28px', borderRadius: '12px', border: 'none', cursor: 'pointer' }}
            >
              かんたん出品してみる
            </button>
            <button
              className="flea-cta-btn"
              style={{ background: 'white', color: '#c9a84c', fontSize: '15px', fontWeight: '600', padding: '16px 28px', borderRadius: '12px', border: '1px solid rgba(201,168,76,0.5)', cursor: 'pointer' }}
            >
              業者にまとめて査定依頼
            </button>
          </div>
          <div style={{ marginTop: '16px', fontSize: '12px', color: '#9CA3AF', lineHeight: '1.7' }}>
            エリア限定スタート・古物商許可対応・売れる可能性をAIが整理
          </div>
          <div style={{ marginTop: '8px', fontSize: '11px', color: '#9CA3AF' }}>
            古物商許可番号：第431060069560号
          </div>
        </div>

        {/* 将来拡張ラベル */}
        <div style={{ marginTop: '32px', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: 'rgba(26,58,92,0.03)', border: '1px solid rgba(26,58,92,0.08)', borderRadius: '50px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#c9a84c' }} />
            <span style={{ fontSize: '11px', color: '#9CA3AF', letterSpacing: '1px' }}>地域別フリマ・業者買取・引越し連携・不用品回収 など順次拡張予定</span>
          </div>
        </div>
      </div>
    </div>
  );
}
