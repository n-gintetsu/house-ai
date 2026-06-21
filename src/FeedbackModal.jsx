import { useState } from 'react'
import { Mail, Bug, Lightbulb, MessageSquare, X } from 'lucide-react'
import { supabase } from './supabaseClient'

const CATEGORIES = [
  { value: 'bug',     label: '不具合の報告', Icon: Bug },
  { value: 'feature', label: '機能の要望',   Icon: Lightbulb },
  { value: 'other',   label: 'その他',       Icon: MessageSquare },
]

export default function FeedbackModal({ onClose, currentUserId, orgId }) {
  const [category, setCategory]   = useState('')
  const [body, setBody]           = useState('')
  const [email, setEmail]         = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]         = useState('')
  const [done, setDone]           = useState(false)

  const canSubmit = category !== '' && body.trim() !== '' && !submitting

  async function handleSubmit() {
    if (!canSubmit) return
    setSubmitting(true)
    setError('')
    const id = crypto.randomUUID()
    const { error: insertErr } = await supabase.from('feedback').insert({
      id,
      source_tool:   'workspace',
      category,
      body:          body.trim(),
      contact_email: email.trim() !== '' ? email.trim() : null,
      org_id:        orgId || null,
      created_by:    currentUserId || null,
      page_url:      window.location.href,
    })
    setSubmitting(false)
    if (insertErr) {
      setError('送信に失敗しました。もう一度お試しください。')
      return
    }
    setDone(true)
  }

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ width: '100%', maxWidth: 480, background: 'rgba(15,23,42,.98)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 16, boxShadow: '0 20px 60px rgba(0,0,0,.6)', padding: 28, position: 'relative' }}
      >
        <div onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, cursor: 'pointer', color: '#94A3B8' }}>
          <X size={20} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <Mail size={20} color="#c9a84c" />
          <div style={{ fontSize: 17, fontWeight: 500, color: '#fff' }}>ご意見・不具合報告</div>
        </div>
        <div style={{ fontSize: 12, color: '#64748B', marginBottom: 24 }}>いただいたご意見は今後のアップデートの参考にさせていただきます</div>

        {done ? (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <div style={{ fontSize: 15, fontWeight: 500, color: '#E2E8F0', marginBottom: 8 }}>ご報告ありがとうございます</div>
            <div style={{ fontSize: 13, color: '#64748B', marginBottom: 24 }}>改善の参考にさせていただきます</div>
            <button
              onClick={onClose}
              style={{ padding: '10px 28px', borderRadius: 10, border: 'none', background: '#c9a84c', color: '#1a1a1a', fontWeight: 500, fontSize: 14, cursor: 'pointer' }}
            >閉じる</button>
          </div>
        ) : (
          <>
            <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 8 }}>種別</div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
              {CATEGORIES.map(({ value, label, Icon }) => (
                <button
                  key={value}
                  onClick={() => setCategory(value)}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 6,
                    padding: '12px 8px',
                    borderRadius: 10,
                    border: category === value ? '1.5px solid #c9a84c' : '1.5px solid rgba(255,255,255,.1)',
                    background: category === value ? 'rgba(201,168,76,.12)' : 'rgba(255,255,255,.03)',
                    color: category === value ? '#c9a84c' : '#94A3B8',
                    cursor: 'pointer',
                    fontSize: 12,
                    fontWeight: 400,
                    transition: 'all .15s',
                  }}
                >
                  <Icon size={16} />
                  {label}
                </button>
              ))}
            </div>

            <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 8 }}>本文<span style={{ color: '#c9a84c', marginLeft: 4 }}>*</span></div>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="内容をご入力ください"
              rows={5}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                background: 'rgba(255,255,255,.04)',
                border: '1px solid rgba(255,255,255,.1)',
                borderRadius: 10,
                color: '#E2E8F0',
                fontSize: 16,
                padding: '10px 12px',
                resize: 'vertical',
                outline: 'none',
                marginBottom: 16,
                fontFamily: 'inherit',
              }}
            />

            <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 8 }}>連絡先メール（任意）</div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="返信が必要な場合はご記入ください"
              style={{
                width: '100%',
                boxSizing: 'border-box',
                background: 'rgba(255,255,255,.04)',
                border: '1px solid rgba(255,255,255,.1)',
                borderRadius: 10,
                color: '#E2E8F0',
                fontSize: 16,
                padding: '10px 12px',
                outline: 'none',
                marginBottom: error !== '' ? 8 : 20,
                fontFamily: 'inherit',
              }}
            />

            {error !== '' ? (
              <div style={{ fontSize: 13, color: '#EF4444', marginBottom: 16 }}>{error}</div>
            ) : null}

            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              style={{
                width: '100%',
                padding: '12px 0',
                borderRadius: 10,
                border: 'none',
                background: canSubmit ? '#c9a84c' : 'rgba(201,168,76,.35)',
                color: canSubmit ? '#1a1a1a' : 'rgba(26,26,26,.5)',
                fontWeight: 500,
                fontSize: 15,
                cursor: canSubmit ? 'pointer' : 'default',
              }}
            >
              {submitting ? '送信中…' : '送信する'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
