
const AFFILIATES = {
  reform: {
    category: 'リフォーム・省エネ',
    title: '補助金で最大500万円以上お得に！',
    desc: '太陽光・蓄電池の設置で光熱費を大幅削減。補助金申請成功率100%の実績。',
    cta: '無料相談はこちら →',
    url: 'https://px.a8.net/svt/ejp?a8mat=4B1HTN+60PSZ6+5UVO+5ZEMP',
    icon: '☀️',
    badge: 'リフォーム',
    badgeColor: '#27500A',
    badgeBg: '#EAF3DE',
  },
  insurance: {
    category: '火災保険',
    title: '火災保険を比較して最適プランを選ぶ',
    desc: '複数社を一括比較。物件購入・賃貸契約時は必ず確認しましょう。',
    cta: '無料で比較する →',
    url: 'https://px.a8.net/svt/ejp?a8mat=4B1HTN+B43BAQ+2PS+2N9ZXT',
    icon: '🛡️',
    badge: '火災保険',
    badgeColor: '#0C447C',
    badgeBg: '#E6F1FB',
  },
  insurance2: {
    category: '火災保険診断',
    title: '火災保険の無料診断サービス',
    desc: '今の保険料が適正か無料で診断。見直しで年間数万円節約できるケースも。',
    cta: '無料診断はこちら →',
    url: 'https://px.a8.net/svt/ejp?a8mat=4B1HTK+BNQM9E+3RU+6S4D6B',
    icon: '🔍',
    badge: '保険診断',
    badgeColor: '#0C447C',
    badgeBg: '#E6F1FB',
  },
  loan: {
    category: '不動産担保ローン',
    title: '不動産担保ローン｜審査無料・最短即日',
    desc: '不動産を活用した資金調達。売却せずに資金を確保できます。',
    cta: '無料審査を申し込む →',
    url: 'https://px.a8.net/svt/ejp?a8mat=4B1HTK+AZXA2A+5PBE+5YJRM',
    icon: '🏦',
    badge: 'ローン',
    badgeColor: '#633806',
    badgeBg: '#FAEEDA',
  },
  investment: {
    category: '不動産投資スクール',
    title: '不動産投資スクール｜正しい知識で始める',
    desc: 'プロの投資家から直接学べる。失敗しない投資の基礎を身につけましょう。',
    cta: '無料で詳細を見る →',
    url: 'https://px.a8.net/svt/ejp?a8mat=4B1HTN+691VG2+1IRY+1ZGVGH',
    icon: '📊',
    badge: '投資教育',
    badgeColor: '#3C3489',
    badgeBg: '#EEEDFE',
  },
  security: {
    category: '防犯カメラ設置',
    title: '防犯カメラ設置業者を無料紹介【EMEAO!】',
    desc: '累計10万件突破。空き家・賃貸物件のセキュリティ強化に。',
    cta: '業者を無料で探す →',
    url: 'https://px.a8.net/svt/ejp?a8mat=4B1HTN+62I3SI+2LHA+3N12TD',
    icon: '📷',
    badge: '防犯',
    badgeColor: '#501313',
    badgeBg: '#FCEBEB',
  },
  smarthome: {
    category: 'スマートホーム',
    title: 'SwitchBot｜スマートホームのベストセラー',
    desc: 'リモート施錠・見守りカメラ・自動化で快適な住まいに。',
    cta: '公式サイトを見る →',
    url: 'https://px.a8.net/svt/ejp?a8mat=4B1HTN+69NB1U+4W9U+609HT',
    icon: '🏠',
    badge: 'スマートホーム',
    badgeColor: '#085041',
    badgeBg: '#E1F5EE',
  },
  pet: {
    category: 'ペット共生住宅',
    title: 'ペットと幸せに暮らす住まいを学ぶ',
    desc: 'ペット共生住宅管理士の資格でペット可物件の知識を深めましょう。',
    cta: '詳細を見る →',
    url: 'https://px.a8.net/svt/ejp?a8mat=4B1HTN+8FN3AQ+4EDO+BXIYP',
    icon: '🐾',
    badge: 'ペット',
    badgeColor: '#3C3489',
    badgeBg: '#EEEDFE',
  },
}

export function AffiliateCard({ type, reason }) {
  const a = AFFILIATES[type]
  if (!a) return null
  return (
    <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 14, padding: '14px 16px', marginTop: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 11, background: a.badgeBg, color: a.badgeColor, padding: '2px 8px', borderRadius: 10, fontWeight: 700 }}>
          {a.badge}
        </span>
        {reason && <span style={{ fontSize: 11, color: '#5C677D' }}>{reason}</span>}
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <span style={{ fontSize: 24, flexShrink: 0 }}>{a.icon}</span>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#102A43', margin: '0 0 3px', fontFamily: "'Noto Sans JP', sans-serif" }}>
            {a.title}
          </p>
          <p style={{ fontSize: 11, color: '#5C677D', margin: '0 0 10px', lineHeight: 1.6, fontFamily: "'Noto Sans JP', sans-serif" }}>
            {a.desc}
          </p>
          <a href={a.url} target="_blank" rel="nofollow noopener noreferrer"
            style={{ display: 'inline-block', background: '#1a3a5c', color: '#fff', fontSize: 12, fontWeight: 700, padding: '8px 16px', borderRadius: 20, textDecoration: 'none', fontFamily: "'Noto Sans JP', sans-serif" }}>
            {a.cta}
          </a>
        </div>
      </div>
      <p style={{ fontSize: 10, color: '#aaa', margin: '8px 0 0', fontFamily: "'Noto Sans JP', sans-serif" }}>
        📌 おすすめ
      </p>
    </div>
  )
}

// カテゴリからアフィリエイトタイプを判定
export function getAffiliateType(tags) {
  if (!tags || tags.length === 0) return null
  const t = tags.join(' ')
  if (t.includes('リフォーム') || t.includes('業者')) return 'reform'
  if (t.includes('投資') || t.includes('利回り')) return 'investment'
  if (t.includes('ローン') || t.includes('担保') || t.includes('資金')) return 'loan'
  if (t.includes('防犯') || t.includes('空き家') || t.includes('管理')) return 'security'
  if (t.includes('購入') || t.includes('売却') || t.includes('火災')) return 'insurance'
  if (t.includes('ペット')) return 'pet'
  if (t.includes('スマート') || t.includes('設備')) return 'smarthome'
  return 'insurance'
}

export default AFFILIATES
