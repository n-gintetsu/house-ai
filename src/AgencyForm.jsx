import { useState } from 'react'
import { supabase } from './lib/supabase'

const BUSINESS_TYPES = [
  '不動産会社',
  'リフォーム・リノベーション',
  '外構・エクステリア',
  '司法書士・行政書士',
  '税理士・会計士',
  '金融機関・ローン',
  'ハウスクリーニング',
  'その他',
]

export default function AgencyForm() {
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [done, setDone] = useState(false)

  const [form, setForm] = useState({
    company_name: '',
    contact_name: '',
    phone: '',
    email: '',
    business_type: '',
    area: '',
    service_description: '',
    address: '',
  })

  function update(key, val) {
    setForm(f => ({ ...f, [key]: val }))
  }

  async function handleSubmit() {
    if (submitting) return
    setSubmitError('')
    setSubmitting(true)
    try {
      const { error } = await supabase.from('agency_registrations').insert(form)
      if (error) throw error

      await fetch('/api/sendmail', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ type: 'agency', data: form }),
      })

      setDone(true)
    } catch (err) {
      console.error(err)
      setSubmitError('送信に失敗しました。もう一度お試しください。')
    } finally {
      setSubmitting(false)
    }
  }

  const fieldStyle = {
    width: '100%',
    boxSizing: 'border-box',
    padding: '11px 12px',
    borderRadius: 12,
    border: '1px solid rgba(26, 58, 92, 0.1)',
    background: '#ffffff',
    color: '#222',
    fontSize: 14,
    outline: 'none',
    fontFamily: 'inherit',
  }

  const labelStyle = {
    display: 'block',
    fontSize: 12,
    color: '#777',
    marginBottom: 6,
  }

  const rowStyle = { marginBottom: 14 }

  const btnStyle = {
    appearance: 'none',
    border: 'none',
    background: '#1a3a5c',
    color: '#fff',
    padding: '11px 24px',
    borderRadius: 12,
    fontWeight: 700,
    cursor: submitting ? 'not-allowed' : 'pointer',
    fontSize: 14,
    opacity: submitting ? 0.6 : 1,
  }

  const ghostBtnStyle = {
    ...btnStyle,
    background: 'transparent',
    color: '#777',
    border: '1px solid rgba(26,58,92,0.15)',
  }

  if (done) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 16px' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
        <h3 style={{ margin: '0 0 10px', color: '#1a3a5c', fontSize: 20 }}>登録申請を受け付けました</h3>
        <p style={{ color: '#777', fontSize: 14, lineHeight: 1.6, margin: '0 0 24px' }}>
          内容を確認後、担当者よりご連絡いたします。<br />
          しばらくお待ちください。
        </p>
        <button style={ghostBtnStyle} onClick={() => { setDone(false); setStep(1); setForm({ company_name: '', contact_name: '', phone: '', email: '', business_type: '', area: '', service_description: '', address: '' }) }}>
          新規登録
        </button>
      </div>
    )
  }

  return (
    <div style={{ padding: 20 }}>
      <h2 style={{ fontSize: 18, fontWeight: 750, color: '#1a3a5c', margin: '0 0 4px' }}>
        🏢 業者様向け会員登録
      </h2>
      <p style={{ fontSize: 13, color: '#777', margin: '0 0 20px', lineHeight: 1.6 }}>
        不動産・リフォーム・金融機関など、業者様の登録フォームです。<br />
        登録後、担当者よりご連絡いたします。
      </p>

      {/* ステップバッジ */}
      <div style={{ display: 'inline-block', fontSize: 11, color: '#1a3a5c', border: '1px solid rgba(26,58,92,0.15)', padding: '4px 10px', borderRadius: 8, marginBottom: 16 }}>
        ステップ {step} / 2 　{step === 1 ? '会社情報' : 'サービス・PR情報'}
      </div>

      {step === 1 && (
        <>
          <div style={rowStyle}>
            <label style={labelStyle}>会社名 <span style={{ color: '#e53e3e' }}>*</span></label>
            <input style={fieldStyle} value={form.company_name} onChange={e => update('company_name', e.target.value)} placeholder="例：株式会社〇〇" />
          </div>
          <div style={rowStyle}>
            <label style={labelStyle}>担当者名 <span style={{ color: '#e53e3e' }}>*</span></label>
            <input style={fieldStyle} value={form.contact_name} onChange={e => update('contact_name', e.target.value)} placeholder="例：山田 太郎" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
            <div>
              <label style={labelStyle}>電話番号 <span style={{ color: '#e53e3e' }}>*</span></label>
              <input style={fieldStyle} value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="例：048-000-0000" inputMode="tel" />
            </div>
            <div>
              <label style={labelStyle}>メールアドレス <span style={{ color: '#e53e3e' }}>*</span></label>
              <input style={fieldStyle} type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="例：info@example.com" />
            </div>
          </div>
          <div style={rowStyle}>
            <label style={labelStyle}>業種</label>
            <select style={fieldStyle} value={form.business_type} onChange={e => update('business_type', e.target.value)}>
              <option value="">選択してください</option>
              {BUSINESS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div style={rowStyle}>
            <label style={labelStyle}>会社所在地</label>
            <input style={fieldStyle} value={form.address} onChange={e => update('address', e.target.value)} placeholder="例：埼玉県さいたま市大宮区〇〇" />
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <button
              style={btnStyle}
              onClick={() => {
                if (!form.company_name.trim() || !form.contact_name.trim() || !form.phone.trim() || !form.email.trim()) {
                  setSubmitError('会社名・担当者名・電話番号・メールアドレスは必須です')
                  return
                }
                setSubmitError('')
                setStep(2)
              }}
            >
              次へ
            </button>
          </div>
          {submitError && <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 12, background: 'rgba(255,60,60,0.08)', border: '1px solid rgba(255,100,100,0.45)', color: '#dc2626', fontSize: 13 }}>{submitError}</div>}
        </>
      )}

      {step === 2 && (
        <>
          <div style={rowStyle}>
            <label style={labelStyle}>対応エリア</label>
            <input style={fieldStyle} value={form.area} onChange={e => update('area', e.target.value)} placeholder="例：埼玉県全域・東京都内" />
          </div>
          <div style={rowStyle}>
            <label style={labelStyle}>サービス内容・PR文</label>
            <textarea
              style={{ ...fieldStyle, minHeight: 120, resize: 'vertical' }}
              value={form.service_description}
              onChange={e => update('service_description', e.target.value)}
              placeholder="提供サービスの内容、強み、実績などをご記入ください"
            />
          </div>
          {submitError && <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 12, background: 'rgba(255,60,60,0.08)', border: '1px solid rgba(255,100,100,0.45)', color: '#dc2626', fontSize: 13 }}>{submitError}</div>}
          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <button style={ghostBtnStyle} onClick={() => { setSubmitError(''); setStep(1) }}>戻る</button>
            <button style={btnStyle} disabled={submitting} onClick={handleSubmit}>
              {submitting ? '送信中…' : '登録申請する'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
