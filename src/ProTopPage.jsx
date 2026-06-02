export default function ProTopPage({ onStart, onLogin }) {
  const features = [
    { title: 'AI写真解析', desc: '現地写真をAIが即時解析。劣化・欠陥・リスクを自動検出。' },
    { title: 'AI土地調査補助', desc: '地形・用途地域・ハザードをAIが整理して提示。' },
    { title: 'PDF・図面解析', desc: '間取り図・重説PDFをアップロードするだけで要点抽出。' },
    { title: 'AI現地調査レポート', desc: '調査結果をワンクリックでプロ品質レポートに変換。' },
    { title: 'リフォーム費用概算', desc: '写真と面積から修繕費をAIが概算。投資判断を即断。' },
    { title: '専門家マッチング', desc: '建築士・弁護士・FPに直接相談できる窓口を提供。' },
  ]

  const plans = [
    { name: '一般', color: '#E2E8F0', border: '1px solid #1E293B', count: '月5回', photo: '3枚/回', pdf: '×', report: '×', chat: '×', history: '×' },
    { name: 'Pro', color: '#E2E8F0', border: '1px solid #1E293B', count: '月50回', photo: '10枚/回', pdf: '○', report: '○', chat: '○', history: '30日' },
    { name: 'プラチナ', color: '#D4AF37', border: '1px solid #D4AF37', count: '無制限', photo: '無制限', pdf: '○', report: '○', chat: '○', history: '無期限' },
  ]

  const rows = [
    { label: '月間回数', key: 'count' },
    { label: '写真', key: 'photo' },
    { label: 'PDF', key: 'pdf' },
    { label: 'レポート', key: 'report' },
    { label: '自由チャット', key: 'chat' },
    { label: '履歴保存', key: 'history' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#0A0F1E', color: '#E2E8F0', fontFamily: "'Noto Sans JP', sans-serif", boxSizing: 'border-box' }}>

      {/* ヘッダー */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid #1E293B' }}>
        <span style={{ fontSize: 18, fontWeight: 500, color: '#D4AF37' }}>House-AI Pro</span>
        <button
          onClick={onLogin}
          style={{ background: 'transparent', border: '1px solid #D4AF37', color: '#D4AF37', borderRadius: 8, padding: '7px 18px', fontSize: 14, fontWeight: 400, cursor: 'pointer' }}
        >
          ログイン
        </button>
      </div>

      {/* ヒーローセクション */}
      <div style={{ textAlign: 'center', padding: '64px 24px 48px' }}>
        <div style={{ fontSize: 32, fontWeight: 500, color: '#E2E8F0', marginBottom: 16 }}>AI現地調査室</div>
        <div style={{ fontSize: 16, color: '#94A3B8', marginBottom: 40 }}>現地へ行く前に80%判断する</div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={onStart}
            style={{ background: '#D4AF37', color: '#0A0F1E', border: 'none', borderRadius: 10, padding: '13px 32px', fontSize: 15, fontWeight: 500, cursor: 'pointer' }}
          >
            無料で始める
          </button>
          <button
            onClick={onLogin}
            style={{ background: 'transparent', border: '1px solid #475569', color: '#E2E8F0', borderRadius: 10, padding: '13px 32px', fontSize: 15, fontWeight: 400, cursor: 'pointer' }}
          >
            ログイン
          </button>
        </div>
      </div>

      {/* できること */}
      <div style={{ padding: '0 24px 56px', maxWidth: 720, margin: '0 auto' }}>
        <div style={{ fontSize: 20, fontWeight: 500, color: '#E2E8F0', marginBottom: 24, textAlign: 'center' }}>できること</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {features.map((f) => (
            <div key={f.title} style={{ background: '#111827', border: '1px solid #1E293B', borderRadius: 12, padding: '20px' }}>
              <div style={{ fontSize: 14, fontWeight: 500, color: '#D4AF37', marginBottom: 8 }}>{f.title}</div>
              <div style={{ fontSize: 12, color: '#94A3B8', lineHeight: 1.7 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* プラン比較テーブル */}
      <div style={{ padding: '0 24px 56px', maxWidth: 720, margin: '0 auto' }}>
        <div style={{ fontSize: 20, fontWeight: 500, color: '#E2E8F0', marginBottom: 24, textAlign: 'center' }}>プラン比較</div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr>
                <th style={{ padding: '10px 12px', textAlign: 'left', color: '#475569', fontWeight: 400, borderBottom: '1px solid #1E293B' }}></th>
                {plans.map((p) => (
                  <th key={p.name} style={{ padding: '10px 12px', textAlign: 'center', color: p.color, fontWeight: 500, borderBottom: '1px solid #1E293B', border: p.name === 'プラチナ' ? '1px solid #D4AF37' : undefined, borderRadius: p.name === 'プラチナ' ? '8px 8px 0 0' : undefined }}>
                    {p.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.key}>
                  <td style={{ padding: '10px 12px', color: '#94A3B8', borderBottom: '1px solid #1E293B' }}>{row.label}</td>
                  {plans.map((p) => (
                    <td key={p.name} style={{ padding: '10px 12px', textAlign: 'center', color: p.name === 'プラチナ' ? '#D4AF37' : '#E2E8F0', borderBottom: '1px solid #1E293B', borderLeft: p.name === 'プラチナ' ? '1px solid #D4AF37' : undefined, borderRight: p.name === 'プラチナ' ? '1px solid #D4AF37' : undefined }}>
                      {p[row.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* フッター */}
      <div style={{ fontSize: 12, color: '#475569', textAlign: 'center', padding: '24px' }}>
        © 2026 House-AI Pro
      </div>

    </div>
  )
}
