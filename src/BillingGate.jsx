import { useState } from 'react'
import { X, Loader } from 'lucide-react'
import { supabase } from './supabaseClient'

const START_TRIAL_ERROR = {
  multiple_owned_orgs: '組織の状態を確認できませんでした。サポートへお問い合わせください。',
  exception_unavailable: '無料期間を開始できませんでした。サポートへお問い合わせください。',
  invalid_input: '無料期間を開始できませんでした。',
}

// モーダルの外枠は WorkspacePage の CreateModal と同じパターンに揃える
const overlayStyle = { position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.72)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }
const cardStyle = { background: 'rgba(15,23,42,0.85)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 0 30px rgba(201,168,76,0.15)', borderRadius: 16, padding: 28, width: '100%', maxWidth: 440, boxSizing: 'border-box' }
const headerRowStyle = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }
const titleStyle = { fontSize: 15, fontWeight: 500, color: '#E2E8F0' }
const closeIconStyle = { background: 'transparent', border: 'none', cursor: 'pointer', padding: 4 }
const bodyTextStyle = { fontSize: 13, fontWeight: 400, color: '#CBD5E1', lineHeight: 1.8 }
const buttonRowStyle = { display: 'flex', gap: 10, marginTop: 24 }
const cancelButtonStyle = { flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#94A3B8', borderRadius: 8, padding: '10px', fontSize: 14, fontWeight: 400, cursor: 'pointer', fontFamily: 'inherit' }

/**
 * 案件を作成してよいかの判定。判定はこの関数に集約し、呼び出し側は state 文字列だけを見る。
 * 案件数・organization の有無・status の生文字列では判断しない。
 */
export async function checkWorkspaceCreateGate() {
  const { data: sess } = await supabase.auth.getSession()
  const token = (sess && sess.session && sess.session.access_token) || ''
  if (!token) return { state: 'error', message: 'ログインの有効期限が切れています。' }
  try {
    const res = await fetch('/api/billing/status', {
      headers: { 'Authorization': 'Bearer ' + token },
    })
    if (!res.ok) return { state: 'error', message: '契約状態を確認できませんでした。' }
    const data = await res.json().catch(() => ({}))
    if (data.needsTrialStart === true) return { state: 'trial' }
    if (data.canCreateWorkspace === true) return { state: 'allow' }
    return { state: 'contract' }
  } catch (e) {
    console.error(e)
    return { state: 'error', message: '契約状態を確認できませんでした。' }
  }
}

/**
 * 無料期間の開始。body は送らず、対象はサーバー側がセッションから決める。
 */
export async function startTrial() {
  const { data: sess } = await supabase.auth.getSession()
  const token = (sess && sess.session && sess.session.access_token) || ''
  if (!token) return { ok: false, message: 'ログインの有効期限が切れています。' }
  try {
    const res = await fetch('/api/billing/start-trial', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + token },
    })
    const data = await res.json().catch(() => ({}))
    if (res.ok && data.canCreateWorkspace === true) return { ok: true, allowed: true }
    if (res.ok && data.needsContract === true) return { ok: true, allowed: false, contract: true }
    return { ok: false, message: START_TRIAL_ERROR[data.error] || '無料期間を開始できませんでした。時間をおいて再度お試しください。' }
  } catch (e) {
    console.error(e)
    return { ok: false, message: '無料期間を開始できませんでした。時間をおいて再度お試しください。' }
  }
}

/**
 * 無料期間の開始を確認するモーダル。
 * 失敗したときは onAllowed を呼ばない（fail closed）。
 */
export function TrialStartModal({ onAllowed, onClose, onContract }) {
  const [starting, setStarting] = useState(false)
  const [error, setError] = useState('')

  const handleStart = async () => {
    if (starting) return
    setStarting(true)
    setError('')
    const r = await startTrial()
    if (r.ok && r.allowed) { onAllowed(); return }
    if (r.ok && r.contract) { onContract(); return }
    setError(r.message || '無料期間を開始できませんでした。')
    setStarting(false)
  }

  return (
    <div style={overlayStyle}>
      <div style={cardStyle}>
        <div style={headerRowStyle}>
          <div style={titleStyle}>自社のWorkspaceを開設します</div>
          <button onClick={onClose} style={closeIconStyle}><X size={18} color="#64748B" /></button>
        </div>
        <div style={bodyTextStyle}>最初の3か月は無料です。無料期間中は料金は発生しません。</div>
        <div style={{ ...bodyTextStyle, marginTop: 10 }}>無料期間終了後、継続してご利用の場合は月額9,800円（税別）です。</div>
        {error !== '' ? (
          <div style={{ fontSize: 12, fontWeight: 400, color: '#F87171', marginTop: 12 }}>{error}</div>
        ) : null}
        <div style={buttonRowStyle}>
          <button onClick={onClose} style={cancelButtonStyle}>キャンセル</button>
          <button
            onClick={handleStart}
            disabled={starting}
            style={{ flex: 1, background: starting ? 'rgba(201,168,76,0.5)' : '#c9a84c', color: '#0A0F1E', border: 'none', borderRadius: 8, padding: '10px', fontSize: 14, fontWeight: 500, cursor: starting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontFamily: 'inherit' }}
          >
            {starting ? <Loader size={14} /> : null}{starting ? '開始中...' : '3か月無料で始める'}
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * 無料期間が使えない場合に契約導線へ誘導するモーダル。
 */
export function ContractRequiredModal({ onClose }) {
  return (
    <div style={overlayStyle}>
      <div style={cardStyle}>
        <div style={headerRowStyle}>
          <div style={titleStyle}>ご契約が必要です</div>
          <button onClick={onClose} style={closeIconStyle}><X size={18} color="#64748B" /></button>
        </div>
        <div style={bodyTextStyle}>新しく案件を作成するには、ご契約が必要です。</div>
        <div style={buttonRowStyle}>
          <button onClick={onClose} style={cancelButtonStyle}>閉じる</button>
          <button
            onClick={() => { window.location.href = '/settings?tab=billing' }}
            style={{ flex: 1, background: '#c9a84c', color: '#0A0F1E', border: 'none', borderRadius: 8, padding: '10px', fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}
          >プランを確認する</button>
        </div>
      </div>
    </div>
  )
}
