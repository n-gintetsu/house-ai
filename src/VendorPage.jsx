import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

const navy = '#1a3a5c'
const gold = '#c9a84c'

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

export default function VendorPage() {
  const [vendors, setVendors] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    fetchVendors()
  }, [])

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

  return (
    <div style={{ padding: '0 0 24px' }}>
      {/* ヘッダー */}
      <div style={{ background: `linear-gradient(135deg, ${navy}, #2a5a8c)`, padding: '20px 20px 16px', marginBottom: 16 }}>
        <h2 style={{ color: '#fff', fontSize: 18, fontWeight: 700, margin: 0 }}>👷 業者一覧・比較</h2>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, margin: '4px 0 0' }}>
          リフォーム・外構・専門家など各業者様の情報
        </p>
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
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#aaa' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🏢</div>
            <div style={{ fontSize: 14 }}>現在掲載中の業者はありません</div>
            <div style={{ fontSize: 12, marginTop: 8, color: '#bbb' }}>業者様の掲載申込みは「業者様向け」タブから</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map(v => (
              <div key={v.id}
                style={{ border: `1.5px solid ${gold}`, borderRadius: 12, padding: 20, background: '#fff', cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(201,168,76,0.2)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div>
                    <div style={{ color: navy, fontSize: 16, fontWeight: 700 }}>{v.company_name || '会社名未設定'}</div>
                    {v.ad_title && <div style={{ color: gold, fontSize: 12, fontWeight: 600, marginTop: 2 }}>{v.ad_title}</div>}
                  </div>
                  <span style={{ background: '#e8f5e9', color: '#27ae60', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>掲載中</span>
                </div>
                {v.ad_description && (
                  <div style={{ color: '#555', fontSize: 13, lineHeight: 1.7, marginBottom: 12 }}>{v.ad_description}</div>
                )}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
                  {v.phone && <span style={{ color: '#666', fontSize: 12 }}>📞 {v.phone}</span>}
                  {v.email && <span style={{ color: '#666', fontSize: 12 }}>✉️ {v.email}</span>}
                </div>
                <button
                  onClick={() => setSelected(v)}
                  style={{ width: '100%', padding: '10px', background: navy, color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                  この業者に問い合わせる
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {selected && <InquiryPopup vendor={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
