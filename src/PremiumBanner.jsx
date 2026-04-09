import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'

// フォールバック用サンプルデータ（Supabaseにデータがない場合に使用）
const FALLBACK_ADS = [
  {
    id: 1,
    label: '広告',
    title: 'リフォームのご相談',
    description: '外壁・内装・水回りの工事は信頼の提携業者へ',
    url: 'https://www.gintetsu-fudosan.com',
    color: '#1a3a5c',
  },
  {
    id: 2,
    label: '提携',
    title: '住宅ローン相談',
    description: 'ご成約者様に提携金融機関をご紹介します',
    url: 'https://www.gintetsu-fudosan.com',
    color: '#2d6a4f',
  },
]

// 広告データをSupabaseから取得するカスタムフック
function useAdItems() {
  const [adItems, setAdItems] = useState(FALLBACK_ADS)

  useEffect(() => {
    async function fetchAds() {
      try {
        const { data, error } = await supabase
          .from('ad_items')
          .select('*')
          .eq('active', true)
          .order('sort_order', { ascending: true })

        if (!error && data && data.length > 0) {
          setAdItems(data)
        }
      } catch (e) {
        // エラー時はフォールバックデータをそのまま使用
      }
    }
    fetchAds()
  }, [])

  return adItems
}

export function AdBanner({ slot = 'sidebar' }) {
  const adItems = useAdItems()
  const [adIndex] = useState(() => Math.floor(Math.random() * FALLBACK_ADS.length))

  // adItemsが読み込まれたら対応するインデックスの広告を表示
  const ad = adItems[adIndex % adItems.length] || FALLBACK_ADS[0]

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
      <div style={inlineStyle} onClick={() => ad.url && window.open(ad.url, '_blank', 'noopener,noreferrer')}>
        <div style={{
          background: ad.color || '#1a3a5c',
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
          <div style={{ fontSize: '13px', fontWeight: '600', color: ad.color || '#1a3a5c' }}>{ad.title}</div>
          <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>{ad.description}</div>
        </div>
        <div style={{ fontSize: '12px', color: '#999' }}>›</div>
      </div>
    )
  }

  return (
    <div
      style={sidebarStyle}
      onClick={() => ad.url && window.open(ad.url, '_blank', 'noopener,noreferrer')}
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
        background: `linear-gradient(135deg, ${ad.color || '#1a3a5c'}, ${ad.color || '#1a3a5c'}aa)`,
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
      <div style={{ fontSize: '12px', color: '#555' }}>{ad.description}</div>
    </div>
  )
}

export function PremiumUpgradeBanner({ user, isPremium, onUpgrade }) {
  // ログイン済みの場合は表示しない
  if (user) return null

  return (
    <div style={{
      background: 'linear-gradient(135deg, #1a3a5c, #2a5a8c)',
      borderRadius: '12px',
      padding: '16px',
      color: '#fff',
      margin: '12px 0',
    }}>
      <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
        🎁 会員登録で全機能が無料で使えます！
      </div>
      <div style={{ fontSize: '11px', opacity: 0.85, marginBottom: '12px', lineHeight: 1.8 }}>
        ✓ AIチャット無制限（未登録は1日5回まで）<br />
        ✓ 物件マッチングAI・お気に入り保存<br />
        ✓ 専門家紹介・売却査定依頼<br />
        ✓ コミュニティ投稿・参加
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '13px', opacity: 0.9 }}>
          完全無料・登録30秒
        </span>
        <button
          onClick={() => {
            const el = document.querySelector('[data-tab="member"]') || document.querySelector('.ha-tabs button:last-child')
            if (el) el.click()
          }}
          style={{
            background: '#c9a84c',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            padding: '8px 18px',
            fontSize: '13px',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          無料会員登録 ›
        </button>
      </div>
    </div>
  )
}
