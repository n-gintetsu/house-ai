import { useState } from 'react'

const AD_ITEMS = [
  {
    id: 1,
    label: '広告',
    title: 'リフォームのご相談',
    desc: '外壁・内装・水回りの工事は信頼の提携業者へ',
    url: 'https://www.gintetsu-fudosan.com',
    color: '#1a3a5c',
  },
  {
    id: 2,
    label: '提携',
    title: '住宅ローン相談',
    desc: 'ご成約者様に提携金融機関をご紹介します',
    url: 'https://www.gintetsu-fudosan.com',
    color: '#2d6a4f',
  },
  {
    id: 3,
    label: 'PR',
    title: '司法書士・税理士紹介',
    desc: '不動産取得・相続のプロフェッショナルへ',
    url: 'https://www.gintetsu-fudosan.com',
    color: '#7b4f12',
  },
]

export function AdBanner({ slot = 'sidebar' }) {
  const ad = AD_ITEMS[Math.floor(Math.random() * AD_ITEMS.length)]

  const sidebarStyle = {
    background: '#fff',
    border: '1px solid #e0e0e0',
    borderRadius: '10px',
    padding: '14px',
    cursor: 'pointer',
    transition: 'box-shadow 0.2s',
  }

  const inlineStyle = {
    background: `linear-gradient(135deg, ${ad.color}15, ${ad.color}05)`,
    border: `1px solid ${ad.color}30`,
    borderRadius: '8px',
    padding: '10px 14px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    cursor: 'pointer',
    margin: '8px 0',
  }

  if (slot === 'inline') {
    return (
      <div style={inlineStyle} onClick={() => window.open(ad.url, '_blank', 'noopener,noreferrer')}>
        <div style={{
          background: ad.color,
          color: '#fff',
          fontSize: '10px',
          fontWeight: '600',
          padding: '2px 8px',
          borderRadius: '4px',
          whiteSpace: 'nowrap',
        }}>
          {ad.label}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '13px', fontWeight: '600', color: ad.color }}>{ad.title}</div>
          <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>{ad.desc}</div>
        </div>
        <div style={{ fontSize: '12px', color: '#999' }}>›</div>
      </div>
    )
  }

  return (
    <div
      style={sidebarStyle}
      onClick={() => window.open(ad.url, '_blank', 'noopener,noreferrer')}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.12)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
    >
      <div style={{ fontSize: '10px', color: '#999', marginBottom: '6px' }}>
        <span style={{
          background: '#f0f0f0',
          padding: '1px 6px',
          borderRadius: '3px',
        }}>{ad.label}</span>
      </div>
      <div style={{
        width: '100%',
        height: '80px',
        background: `linear-gradient(135deg, ${ad.color}, ${ad.color}aa)`,
        borderRadius: '6px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '8px',
      }}>
        <div style={{ color: '#fff', fontSize: '13px', fontWeight: '600', textAlign: 'center', padding: '0 12px' }}>
          {ad.title}
        </div>
      </div>
      <div style={{ fontSize: '12px', color: '#555' }}>{ad.desc}</div>
    </div>
  )
}

export function PremiumUpgradeBanner({ user, isPremium, onUpgrade }) {
  const [loading, setLoading] = useState(false)

  if (isPremium) return null

  const handleUpgrade = async () => {
    if (!user) {
      alert('アップグレードするには会員登録が必要です')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/stripe-checkout', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ userId: user.id, email: user.email }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        alert('エラーが発生しました。もう一度お試しください。')
      }
    } catch (err) {
      alert('エラーが発生しました。もう一度お試しください。')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, #1a3a5c, #2a5a8c)',
      borderRadius: '12px',
      padding: '16px',
      color: '#fff',
      margin: '12px 0',
    }}>
      <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>
        ✨ プレミアム会員にアップグレード
      </div>
      <div style={{ fontSize: '11px', opacity: 0.85, marginBottom: '10px', lineHeight: 1.6 }}>
        • AIチャット無制限<br />
        • 物件マッチングAI優先利用<br />
        • 広告非表示<br />
        • 専門家紹介の優先対応
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '16px', fontWeight: '700' }}>
          月額 ¥980
          <span style={{ fontSize: '11px', fontWeight: '400', opacity: 0.8, marginLeft: '4px' }}>（税込）</span>
        </span>
        <button
          onClick={handleUpgrade}
          disabled={loading}
          style={{
            background: '#c9a84c',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            padding: '8px 18px',
            fontSize: '13px',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? '処理中...' : 'アップグレード'}
        </button>
      </div>
    </div>
  )
}
