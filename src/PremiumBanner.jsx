import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'

const FALLBACK_ADS = [
  {
    id: 1,
    label: '広告',
    title: 'リフォームのご相談',
    description: '地元密着・丁寧な仕事・専門家へ',
    url: 'https://www.gintetsu-fudosan.com',
    color: '#1a3a5c',
    show_inquiry_form: false,
    partner_user_id: null,
  },
  {
    id: 2,
    label: '広告',
    title: '住宅ローン相談',
    description: 'お気軽に住宅ローン無料相談できます',
    url: 'https://www.gintetsu-fudosan.com',
    color: '#2d6a4f',
    show_inquiry_form: false,
    partner_user_id: null,
  },
]

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
      } catch (e) {}
    }
    fetchAds()
  }, [])
  return adItems
}

function InquiryPopup({ ad, onClose }) {
  const [form, setForm] = useState({ name: '', phone: '', email: '', message: '' })
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async () => {
    if (!form.name || !form.phone) return
    setSending(true)
    try {
      await supabase.from('partner_inquiries').insert({
        partner_user_id: ad.partner_user_id,
        customer_name: form.name,
        customer_phone: form.phone,
        customer_email: form.email,
        message: form.message || (ad.title + 'の広告を見てお問い合わせしました'),
        status: '未対応'
      })
      setSent(true)
      setTimeout(() => { setSent(false); onClose() }, 2000)
    } catch(e) {}
    setSending(false)
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={onClose}
    >
      <div
        style={{ background: '#fff', borderRadius: 16, padding: 28, width: '100%', maxWidth: 440, boxShadow: '0 8px 40px rgba(0,0,0,0.2)' }}
        onClick={e => e.stopPropagation()}
      >
        {sent ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
            <div style={{ color: '#1a3a5c', fontSize: 16, fontWeight: 700 }}>送信しました！</div>
            <div style={{ color: '#888', fontSize: 13, marginTop: 8 }}>担当者よりご連絡いたします</div>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <div style={{ color: '#1a3a5c', fontSize: 16, fontWeight: 700 }}>{ad.title}</div>
                <div style={{ color: '#888', fontSize: 12, marginTop: 2 }}>お問い合わせフォーム</div>
              </div>
              <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#aaa' }}>✕</button>
            </div>
            {[
              { key: 'name', label: 'お名前 *', placeholder: '山田 太郎', type: 'text' },
              { key: 'phone', label: '電話番号 *', placeholder: '090-0000-0000', type: 'tel' },
              { key: 'email', label: 'メールアドレス', placeholder: 'example@email.com', type: 'email' },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: 14 }}>
                <label style={{ color: '#555', fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>{f.label}</label>
                <input
                  type={f.type}
                  value={form[f.key]}
                  onChange={e => setForm({...form, [f.key]: e.target.value})}
                  placeholder={f.placeholder}
                  style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #ddd', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' }}
                />
              </div>
            ))}
            <div style={{ marginBottom: 20 }}>
              <label style={{ color: '#555', fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>お問い合わせ内容</label>
              <textarea
                value={form.message}
                onChange={e => setForm({...form, message: e.target.value})}
                placeholder="ご質問・ご要望をご記入ください"
                rows={3}
                style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #ddd', borderRadius: 8, fontSize: 14, boxSizing: 'border-box', resize: 'none' }}
              />
            </div>
            <button
              onClick={handleSubmit}
              disabled={sending || !form.name || !form.phone}
              style={{ width: '100%', padding: '12px', background: form.name && form.phone ? '#1a3a5c' : '#ccc', color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: form.name && form.phone ? 'pointer' : 'not-allowed' }}
            >
              {sending ? '送信中...' : '送信する'}
            </button>
            <div style={{ color: '#aaa', fontSize: 11, textAlign: 'center', marginTop: 10 }}>※ お名前と電話番号は必須です</div>
          </>
        )}
      </div>
    </div>
  )
}

export function AdBanner({ slot = 'sidebar' }) {
  const adItems = useAdItems()
  const [adIndex] = useState(() => Math.floor(Math.random() * FALLBACK_ADS.length))
  const [showInquiry, setShowInquiry] = useState(false)
  const [selectedAd, setSelectedAd] = useState(null)

  const ad = adItems[adIndex % adItems.length] || FALLBACK_ADS[0]

  const handleAdClick = () => {
    if (ad.show_inquiry_form && ad.partner_user_id) {
      setSelectedAd(ad)
      setShowInquiry(true)
    } else if (ad.url) {
      window.open(ad.url, '_blank', 'noopener,noreferrer')
    }
  }

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
      <>
        {showInquiry && selectedAd && <InquiryPopup ad={selectedAd} onClose={() => setShowInquiry(false)} />}
        <div style={inlineStyle} onClick={handleAdClick}>
          <div style={{ background: ad.color || '#1a3a5c', color: '#fff', fontSize: '10px', fontWeight: '600', padding: '2px 8px', borderRadius: '4px', whiteSpace: 'nowrap' }}>
            {ad.label}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '13px', fontWeight: '600', color: ad.color || '#1a3a5c' }}>{ad.title}</div>
            <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>{ad.description}</div>
          </div>
          <div style={{ fontSize: '12px', color: '#999' }}>›</div>
        </div>
      </>
    )
  }

  return (
    <>
      {showInquiry && selectedAd && <InquiryPopup ad={selectedAd} onClose={() => setShowInquiry(false)} />}
      <div
        style={sidebarStyle}
        onClick={handleAdClick}
        onMouseEnter={e => e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.12)'}
        onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
      >
        <div style={{ fontSize: '10px', color: '#999', marginBottom: '6px' }}>
          <span style={{ background: '#f0f0f0', padding: '1px 6px', borderRadius: '3px' }}>{ad.label}</span>
        </div>
        <div style={{ width: '100%', height: '80px', background: `linear-gradient(135deg, ${ad.color || '#1a3a5c'}, ${ad.color || '#1a3a5c'}aa)`, borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>
          <div style={{ color: '#fff', fontSize: '13px', fontWeight: '600', textAlign: 'center', padding: '0 12px' }}>
            {ad.title}
          </div>
        </div>
        <div style={{ fontSize: '12px', color: '#555' }}>{ad.description}</div>
      </div>
    </>
  )
}

export function PremiumUpgradeBanner({ user, isPremium, onUpgrade }) {
  if (user) return null
  return (
    <div style={{ background: 'linear-gradient(135deg, #1a3a5c, #2a5a8c)', borderRadius: '12px', padding: '16px', color: '#fff', margin: '12px 0' }}>
      <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
        👤 会員登録で全機能が無料で使えます！
      </div>
      <div style={{ fontSize: '11px', opacity: 0.85, marginBottom: '12px', lineHeight: 1.8 }}>
        ✓ AIチャット無制限（未登録は1日5回まで）<br />
        ✓ 物件マッチングAI・お気に入り保存<br />
        ✓ 毎月無料の無料査定・専門家紹介<br />
        ✓ コミュニティ参加・参加
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '13px', opacity: 0.9 }}>今なら無料・登録30秒</span>
        <button
          onClick={() => {
            const el = document.querySelector('[data-tab="member"]') || document.querySelector('.ha-tabs button:last-child')
            if (el) el.click()
          }}
          style={{ background: '#c9a84c', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 18px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
        >
          無料会員登録 ›
        </button>
      </div>
    </div>
  )
}
