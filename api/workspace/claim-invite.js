import { supabaseAdmin } from '../_adminAuth.js'
import { requireUser } from '../_userAuth.js'

/**
 * Vercel Serverless Function: POST /api/workspace/claim-invite
 * ログイン中ユーザー宛の pending 招待をすべて受諾する。
 * 対象は必ずセッションのメールアドレスから決め、リクエストの body は読まない。
 * role は既存行の値をそのまま残す（受諾者が自分の権限を選べないようにするため）。
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

  // 3. メールアドレスが無ければ照合できない
  const myEmail = String(ctx.email || '').trim().toLowerCase()
  if (myEmail === '') {
    return res.status(400).json({ error: 'no_email' })
  }

  // 4. 未受諾の招待を取得し、JS 側で小文字比較して自分宛だけに絞る
  const { data: pending, error: pendingErr } = await supabaseAdmin
    .from('workspace_members')
    .select('id, workspace_id, email')
    .is('user_id', null)
    .eq('status', 'pending')
  if (pendingErr) {
    console.error('[workspace/claim-invite] pending lookup error:', JSON.stringify(pendingErr))
    return res.status(500).json({ error: 'db_error' })
  }

  const mine = (pending || []).filter(r => String(r.email || '').toLowerCase() === myEmail)
  if (mine.length === 0) {
    return res.status(200).json({ ok: true, claimed: 0 })
  }

  let claimed = 0
  for (let i = 0; i < mine.length; i++) {
    const row = mine[i]

    // 5. 同じ案件に既に自分の active 行があるなら claim しない
    const { data: existing, error: existErr } = await supabaseAdmin
      .from('workspace_members')
      .select('id')
      .eq('workspace_id', row.workspace_id)
      .eq('user_id', ctx.userId)
      .eq('status', 'active')
      .limit(1)
      .maybeSingle()
    if (existErr) {
      console.error('[workspace/claim-invite] existing lookup error:', JSON.stringify(existErr))
      return res.status(500).json({ error: 'db_error' })
    }
    if (existing) continue

    // 6. 競合防止のため pending かつ user_id が null のままの行だけを更新する
    const { data: updated, error: updErr } = await supabaseAdmin
      .from('workspace_members')
      .update({ user_id: ctx.userId, status: 'active' })
      .eq('id', row.id)
      .eq('status', 'pending')
      .is('user_id', null)
      .select('id')
    if (updErr) {
      console.error('[workspace/claim-invite] claim update error:', JSON.stringify(updErr))
      return res.status(500).json({ error: 'db_error' })
    }
    // 0 行なら他プロセスが先に処理済み。スキップ扱いにする
    if (updated && updated.length > 0) {
      claimed = claimed + 1
    }
  }

  // 7. 実際に更新できた件数を返す
  return res.status(200).json({ ok: true, claimed: claimed })
}
