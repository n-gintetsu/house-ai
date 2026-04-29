import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

const navy = '#1a3a5c'
const gold = '#c9a84c'
const blue = '#2F6BFF'

// プランの定義
const PLANS = {
  premium: { label: '👑 プレミアム', bg: '#FFF9E6', color: '#854F0B', border: '#c9a84c', priority: 3 },
  standard: { label: '⭐ スタンダード', bg: '#EAF1FF', color: '#185FA5', border: '#2F6BFF', priority: 2 },
  free: { label: '無料掲載', bg: '#F0F4F8', color: '#5C677D', border: '#E2E8F0', priority: 1 },
}

// プランを取得（DBにplanカラムがない場合はfreeとして扱う）
function getPlan(vendor) {
  if (vendor.plan === 'premium') return PLANS.premium
  if (vendor.plan === 'standard') return PLANS.standard
  return PLANS.free
}

// ============================================================
// 問い合わせフォーム
// ============================================================
function InquiryPopup({ vendor, onClose }) {
  const [form, setForm] = useState({ name: '', phone: '', email: '', message: '' })
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async () => {
    if (!form.name || !form.phone) return
    setSending(true)
    try {
      await supabase.from('partner_inquiries').insert({
        partner_user_id: vendor.partner_user_id,
        customer_name: form.name,
        customer_phone: form.phone,
        customer_email: form.email,
        message: form.message || (vendor.company_name + 'へのお問い合わせ'),
        status: '未対応'
      })
      setSent(true)
      setTimeout(() => { setSent(false); onClose() }, 2000)
    } catch(e) {}
    setSending(false)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={onClose}>
      <div style={{ background: '#fff', borderRadius: 16, padding: 28, width: '100%', maxWidth: 440, boxShadow: '0 8px 40px rgba(0,0,0,0.2)' }}
        onClick={e => e.stopPropagation()}>
        {sent ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
            <div style={{ color: navy, fontSize: 16, fontWeight: 700 }}>送信しました！</div>
            <div style={{ color: '#888', fontSize: 13, marginTop: 8 }}>担当者よりご連絡いたします</div>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <div style={{ color: navy, fontSize: 16, fontWeight: 700 }}>{vendor.company_name}</div>
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
                <input type={f.type} value={form[f.key]} onChange={e => setForm({...form, [f.key]: e.target.value})}
                  placeholder={f.placeholder}
                  style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #ddd', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' }} />
              </div>
            ))}
            <div style={{ marginBottom: 20 }}>
              <label style={{ color: '#555', fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>お問い合わせ内容</label>
              <textarea value={form.message} onChange={e => setForm({...form, message: e.target.value})}
                placeholder="ご質問・ご要望をご記入ください" rows={3}
                style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #ddd', borderRadius: 8, fontSize: 14, boxSizing: 'border-box', resize: 'none' }} />
            </div>
            <button onClick={handleSubmit} disabled={sending || !form.name || !form.phone}
              style={{ width: '100%', padding: '12px', background: form.name && form.phone ? navy : '#ccc', color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: form.name && form.phone ? 'pointer' : 'not-allowed' }}>
              {sending ? '送信中...' : '送信する'}
            </button>
            <div style={{ color: '#aaa', fontSize: 11, textAlign: 'center', marginTop: 10 }}>※ お名前と電話番号は必須です</div>
          </>
        )}
      </div>
    </div>
  )
}

// ============================================================
// 業者カード
// ============================================================
function VendorCard({ vendor, onInquiry, aiRecommended }) {
  const plan = getPlan(vendor)
  const isPremium = vendor.plan === 'premium'
  const isStandard = vendor.plan === 'standard'

  return (
    <div style={{
      border: `1.5px solid ${isPremium ? gold : isStandard ? blue : '#E2E8F0'}`,
      borderRadius: 14,
      padding: 20,
      background: '#fff',
      cursor: 'pointer',
      position: 'relative',
      transition: 'box-shadow 0.2s',
    }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = `0 4px 16px rgba(${isPremium ? '201,168,76' : '26,58,92'},0.15)`}
      onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
    >
      {/* AI推薦バッジ */}
      {aiRecommended && (
        <div style={{ position: 'absolute', top: -10, left: 16, background: '#06C755', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>
          🤖 AIおすすめ
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <div style={{ color: navy, fontSize: 16, fontWeight: 700 }}>{vendor.company_name || '会社名未設定'}</div>
            {/* プランバッジ */}
            <span style={{ fontSize: 10, fontWeight: 700, background: plan.bg, color: plan.color, border: `1px solid ${plan.border}`, padding: '2px 8px', borderRadius: 10, whiteSpace: 'nowrap' }}>
              {plan.label}
            </span>
          </div>
          {vendor.ad_title && <div style={{ color: gold, fontSize: 12, fontWeight: 600 }}>{vendor.ad_title}</div>}
        </div>
        <span style={{ background: '#e8f5e9', color: '#27ae60', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, flexShrink: 0, marginLeft: 8 }}>掲載中</span>
      </div>

      {vendor.ad_description && (
        <div style={{ color: '#555', fontSize: 13, lineHeight: 1.7, marginBottom: 12 }}>{vendor.ad_description}</div>
      )}

      {/* AI推薦理由（プレミアム・スタンダードのみ） */}
      {(isPremium || isStandard) && aiRecommended && (
        <div style={{ background: '#F0F8FF', border: '1px solid #B5D4F4', borderRadius: 8, padding: '8px 12px', marginBottom: 12 }}>
          <p style={{ fontSize: 11, color: '#185FA5', fontWeight: 600, margin: 0 }}>
            🤖 AIが推薦する理由：あなたの状況に最も合った業者です
          </p>
        </div>
      )}

      {/* 実績・評価（プレミアムのみ） */}
      {isPremium && (
        <div style={{ display: 'flex', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11, color: '#854F0B', fontWeight: 600, background: '#FFF9E6', padding: '3px 8px', borderRadius: 6 }}>⭐ 評価 4.8</span>
          <span style={{ fontSize: 11, color: '#185FA5', fontWeight: 600, background: '#EAF1FF', padding: '3px 8px', borderRadius: 6 }}>📊 成約実績多数</span>
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
        {vendor.phone && <span style={{ color: '#666', fontSize: 12 }}>📞 {vendor.phone}</span>}
        {vendor.email && <span style={{ color: '#666', fontSize: 12 }}>✉️ {vendor.email}</span>}
      </div>

      <button onClick={() => onInquiry(vendor)}
        style={{ width: '100%', padding: '11px', background: isPremium ? gold : navy, color: isPremium ? navy : '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
        {isPremium ? '👑 優先的に問い合わせる' : 'この業者に問い合わせる'}
      </button>
    </div>
  )
}

// ============================================================
// 業者向け掲載CTA
// ============================================================
function VendorSignupCTA() {
  return (
    <div style={{ margin: '24px 16px 0', background: navy, borderRadius: 16, padding: '20px 20px', color: '#fff' }}>
      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', margin: '0 0 4px', fontFamily: 'sans-serif' }}>業者・専門家の方へ</p>
      <p style={{ fontSize: 16, fontWeight: 700, margin: '0 0 8px' }}>あなたのサービスを掲載する</p>
      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', margin: '0 0 16px', lineHeight: 1.7 }}>
        見込み客を自動獲得・営業不要・成果課金のみ
      </p>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        {['無料掲載あり', '成果課金のみ', '月額プランで優遇'].map(t => (
          <span key={t} style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 20 }}>{t}</span>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 16 }}>
        {[
          { plan: 'ライト', price: '無料', desc: '基本掲載のみ' },
          { plan: 'スタンダード', price: '¥9,800/月', desc: 'AI優先表示' },
          { plan: 'プレミアム', price: '¥29,800/月', desc: 'AI推薦枠' },
        ].map(p => (
          <div key={p.plan} style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px 8px', textAlign: 'center' }}>
            <p style={{ fontSize: 11, fontWeight: 700, margin: '0 0 4px', color: p.plan === 'プレミアム' ? gold : '#fff' }}>{p.plan}</p>
            <p style={{ fontSize: 13, fontWeight: 700, margin: '0 0 2px', color: '#fff' }}>{p.price}</p>
            <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', margin: 0 }}>{p.desc}</p>
          </div>
        ))}
      </div>
      <a href="/partner" style={{ display: 'block', textAlign: 'center', background: gold, color: navy, fontWeight: 700, fontSize: 14, padding: '12px', borderRadius: 10, textDecoration: 'none' }}>
        無料で掲載を始める →
      </a>
    </div>
  )
}

// ============================================================
// メイン
// ============================================================
export default function VendorPage() {
  const [vendors, setVendors] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState(null)

  useEffect(() => { fetchVendors() }, [])

  const fetchVendors = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('partner_profiles')
      .select('*')
      .eq('ad_status', '掲載中')
      .order('created_at', { ascending: false })
    setVendors(data || [])
    setLoading(false)
  }

  const categories = [
    { key: 'all', label: 'すべて' },
    { key: 'リフォーム', label: 'リフォーム' },
    { key: '外構', label: '外構' },
    { key: '司法書士', label: '司法書士' },
    { key: '税理士', label: '税理士' },
    { key: '金融機関', label: '金融機関' },
  ]

  const filtered = filter === 'all' ? vendors
    : vendors.filter(v => v.category === filter || (v.ad_title && v.ad_title.includes(filter)))

  // プレミアム→スタンダード→無料の順に並べ替え
  const sorted = [...filtered].sort((a, b) => {
    const pa = getPlan(a).priority
    const pb = getPlan(b).priority
    return pb - pa
  })

  return (
    <div style={{ padding: '0 0 24px' }}>
      {/* ヘッダー */}
      <div style={{ background: navy, padding: '20px 20px 16px', marginBottom: 16 }}>
        <h2 style={{ color: '#fff', fontSize: 18, fontWeight: 700, margin: 0 }}>👷 業者一覧・比較</h2>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, margin: '4px 0 0' }}>
          リフォーム・外構・専門家など各業者様の情報
        </p>
      </div>

      {/* AI推薦バナー */}
      <div style={{ margin: '0 16px 16px', background: '#F0F8FF', border: '1px solid #B5D4F4', borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 20 }}>🤖</span>
        <div>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#185FA5', margin: 0 }}>AIがあなたの状況に合った業者を提案します</p>
          <p style={{ fontSize: 11, color: '#5C677D', margin: 0 }}>AIチャットで相談すると最適な業者が優先表示されます</p>
        </div>
      </div>

      {/* カテゴリフィルター */}
      <div style={{ padding: '0 16px 12px', display: 'flex', gap: 8, overflowX: 'auto' }}>
        {categories.map(c => (
          <button key={c.key} onClick={() => setFilter(c.key)}
            style={{ padding: '6px 14px', background: filter === c.key ? navy : '#f0f0f0', color: filter === c.key ? '#fff' : '#555', border: 'none', borderRadius: 20, fontSize: 12, fontWeight: filter === c.key ? 700 : 400, cursor: 'pointer', whiteSpace: 'nowrap' }}>
            {c.label}
          </button>
        ))}
      </div>

      {/* 業者一覧 */}
      <div style={{ padding: '0 16px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#aaa' }}>読み込み中...</div>
        ) : sorted.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#aaa' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🏢</div>
            <div style={{ fontSize: 14 }}>現在掲載中の業者はありません</div>
            <div style={{ fontSize: 12, marginTop: 8, color: '#bbb' }}>業者様の掲載申込みは下記から</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {sorted.map((v, i) => (
              <VendorCard
                key={v.id}
                vendor={v}
                onInquiry={setSelected}
                aiRecommended={i === 0}
              />
            ))}
          </div>
        )}
      </div>

      {/* 業者向け掲載CTA */}
      <VendorSignupCTA />

      {selected && <InquiryPopup vendor={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
