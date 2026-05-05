import { useState } from 'react'
import { supabase } from './lib/supabase'

const BUSINESS_TYPES = [
  '不動産会社（売買）',
  '不動産会社（賃貸）',
  '不動産会社（売買・賃貸）',
  '不動産会社（投資）',
  'その他',
]

const DEAL_TYPE_OPTIONS = ['売買', '賃貸', '投資', '買取', '管理']

export default function AgencyForm() {
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [done, setDone] = useState(false)

  const [form, setForm] = useState({
    company_name: '',
    contact_name: '',
    email: '',
    phone: '',
    password: '',
    business_type: '不動産会社（売買・賃貸）',
    area: '',
    service_description: '',
    license_number: '',
    deal_types: [],
    address: '',
    url: '',
  })

  function update(key, val) {
    setForm(f => ({ ...f, [key]: val }))
  }

  function toggleDealType(type) {
    setForm(f => ({
      ...f,
      deal_types: f.deal_types.includes(type)
        ? f.deal_types.filter(t => t !== type)
        : [...f.deal_types, type],
    }))
  }

  async function handleSubmit() {
    if (submitting) return
    setSubmitError('')
    setSubmitting(true)
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: { data: { user_type: 'agency' } },
      })
      if (authError) throw authError

      const { error: insertError } = await supabase.from('agency_registrations').insert({
        agency_user_id: authData.user?.id,
        company_name: form.company_name,
        contact_name: form.contact_name,
        email: form.email,
        phone: form.phone,
        business_type: form.business_type,
        area: form.area,
        service_description: form.service_description,
        license_number: form.license_number,
        deal_types: form.deal_types,
        address: form.address,
        url: form.url,
      })
      if (insertError) throw insertError

      await fetch('/api/sendmail', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ type: 'agency', data: form }),
      })

      setDone(true)
    } catch (err) {
      console.error(err)
      if (err.message?.includes('User already registered') || err.message?.includes('already registered')) {
        setSubmitError('このメールアドレスはすでに登録されています。')
      } else if (err.message?.includes('agency_user_id')) {
        setSubmitError('登録処理でエラーが発生しました。管理者にお問い合わせください。')
      } else {
        setSubmitError('送信に失敗しました。もう一度お試しください。')
      }
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
        <button style={ghostBtnStyle} onClick={() => {
          setDone(false)
          setStep(1)
          setForm({ company_name: '', contact_name: '', email: '', phone: '', password: '', business_type: '不動産会社（売買・賃貸）', area: '', service_description: '', license_number: '', deal_types: [], address: '', url: '' })
        }}>
          新規登録
        </button>
      </div>
    )
  }

  return (
    <div style={{ padding: 20 }}>
      <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1a3a5c', margin: '0 0 4px' }}>
        🏠 不動産業者 無料登録
      </h2>
      <p style={{ fontSize: 13, color: '#777', margin: '0 0 20px', lineHeight: 1.6 }}>
        登録後すぐに物件を掲載できます。
      </p>

      {/* ステップバッジ */}
      <div style={{ display: 'inline-block', fontSize: 11, color: '#1a3a5c', border: '1px solid rgba(26,58,92,0.15)', padding: '4px 10px', borderRadius: 8, marginBottom: 16 }}>
        ステップ {step} / 2　{step === 1 ? '基本情報' : '詳細情報'}
      </div>

      {step === 1 && (
        <>
          <div style={rowStyle}>
            <label style={labelStyle}>会社名 <span style={{ color: '#e53e3e' }}>*</span></label>
            <input style={fieldStyle} value={form.company_name} onChange={e => update('company_name', e.target.value)} placeholder="例：株式会社○○" />
          </div>
          <div style={rowStyle}>
            <label style={labelStyle}>担当者名 <span style={{ color: '#e53e3e' }}>*</span></label>
            <input style={fieldStyle} value={form.contact_name} onChange={e => update('contact_name', e.target.value)} placeholder="例：山田 太郎" />
          </div>
          <div style={rowStyle}>
            <label style={labelStyle}>メールアドレス <span style={{ color: '#e53e3e' }}>*</span></label>
            <input style={fieldStyle} type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="例：info@example.com" />
          </div>
          <div style={rowStyle}>
            <label style={labelStyle}>電話番号 <span style={{ color: '#e53e3e' }}>*</span></label>
            <input style={fieldStyle} value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="例：048-000-0000" inputMode="tel" />
          </div>
          <div style={rowStyle}>
            <label style={labelStyle}>パスワード <span style={{ color: '#e53e3e' }}>*</span></label>
            <input style={fieldStyle} type="password" value={form.password} onChange={e => update('password', e.target.value)} placeholder="8文字以上" />
          </div>
          <div style={rowStyle}>
            <label style={labelStyle}>業種</label>
            <select style={fieldStyle} value={form.business_type} onChange={e => update('business_type', e.target.value)}>
              {BUSINESS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          {submitError && <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 12, background: 'rgba(255,60,60,0.08)', border: '1px solid rgba(255,100,100,0.45)', color: '#dc2626', fontSize: 13 }}>{submitError}</div>}
          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <button
              style={{ ...btnStyle, flex: 1 }}
              onClick={() => {
                if (!form.company_name.trim() || !form.contact_name.trim() || !form.email.trim() || !form.phone.trim()) {
                  setSubmitError('会社名・担当者名・メールアドレス・電話番号は必須です')
                  return
                }
                if (form.password.length < 8) {
                  setSubmitError('パスワードは8文字以上で入力してください')
                  return
                }
                setSubmitError('')
                setStep(2)
              }}
            >
              無料登録して物件を掲載する
            </button>
          </div>
          <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 12, lineHeight: 1.8 }}>
            ※掲載内容は運営確認のうえ公開される場合があります。※無料で始められます。※有料プランは登録後に必要に応じて利用できます。
          </p>
        </>
      )}

      {step === 2 && (
        <>
          <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 16px', lineHeight: 1.6 }}>
            アップグレード時に詳細情報を入力するとAI推薦・優先表示が強化されます
          </p>
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
          <div style={rowStyle}>
            <label style={labelStyle}>宅建業免許番号</label>
            <input style={fieldStyle} value={form.license_number} onChange={e => update('license_number', e.target.value)} placeholder="例：埼玉県知事(1)第○○号" />
          </div>
          <div style={rowStyle}>
            <label style={labelStyle}>取扱種別</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 4 }}>
              {DEAL_TYPE_OPTIONS.map(type => (
                <label key={type} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#333', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={form.deal_types.includes(type)}
                    onChange={() => toggleDealType(type)}
                  />
                  {type}
                </label>
              ))}
            </div>
          </div>
          <div style={rowStyle}>
            <label style={labelStyle}>会社所在地</label>
            <input style={fieldStyle} value={form.address} onChange={e => update('address', e.target.value)} placeholder="例：埼玉県さいたま市大宮区○○" />
          </div>
          <div style={rowStyle}>
            <label style={labelStyle}>会社サイトURL</label>
            <input style={fieldStyle} type="url" value={form.url} onChange={e => update('url', e.target.value)} placeholder="https://example.com" />
          </div>
          {submitError && <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 12, background: 'rgba(255,60,60,0.08)', border: '1px solid rgba(255,100,100,0.45)', color: '#dc2626', fontSize: 13 }}>{submitError}</div>}
          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <button style={ghostBtnStyle} onClick={() => { setSubmitError(''); setStep(1) }}>戻る</button>
            <button style={{ ...btnStyle, flex: 1 }} disabled={submitting} onClick={handleSubmit}>
              {submitting ? '送信中…' : '登録を完了する'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
