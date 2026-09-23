import { supabaseAdmin } from '../../_adminAuth.js'
import { requireUser } from '../../_userAuth.js'

// 解除の対象になる状態。active（連携済み）と pending（発行済みで未連携）をまとめて閉じる。
const REVOKE_TARGET_STATUSES = ['active', 'pending']

function nowIso() {
  return new Date().toISOString()
}

/**
 * Vercel Serverless Function: POST /api/notifications/line/unlink
 * ログイン済みユーザー自身の LINE 連携を解除する。
 * 対象ユーザーはセッションから決まり、リクエストの body / query は読まない。
 * 監査のため LINE 側の識別子は残し、照合に使う値だけを消す。
 */
export default async function handler(req, res) {
  // 1. メソッド確認
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // 2. 本人確認（失敗時はレスポンス送信済み）
  const ctx = await requireUser(req, res)
  if (!ctx) return
  if (!ctx.userId) {
    return res.status(401).json({ error: 'no_user' })
  }

  // 3. active と pending をまとめて revoked にする
  const revokedAt = nowIso()
  const { error: revokeErr } = await supabaseAdmin
    .from('workspace_line_connections')
    .update({
      status: 'revoked',
      code_hash: null,
      code_expires_at: null,
      revoked_at: revokedAt,
      updated_at: revokedAt,
    })
    .eq('user_id', ctx.userId)
    .in('status', REVOKE_TARGET_STATUSES)
  if (revokeErr) {
    console.error('[line/unlink] revoke error:', JSON.stringify(revokeErr))
    return res.status(500).json({ error: 'db_error' })
  }

  // 4. 対象が0件でも成功として返す（解除済みの再実行を失敗にしない）
  return res.status(200).json({ ok: true })
}
