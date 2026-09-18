import { supabaseAdmin } from '../_adminAuth.js'
import { requireUser } from '../_userAuth.js'

// src/WorkspaceAuthGuard.jsx:5-9 の定義をそのまま移植したもの
const CLAIM_ROLE_LABEL = {
  owner: 'Owner', manager: 'Manager', staff: '担当', customer: 'お客様',
  broker: '仲介業者', judicialscrivener: '司法書士', bank: '銀行',
  reformcompany: 'リフォーム', guest: 'Guest',
}

/**
 * claim に成功した行に対する補助処理（参加通知と関係者登録）。
 * ここでの失敗はログインを止める理由にならないため、例外も DB エラーもログに留める。
 */
async function notifyJoined(row) {
  const joinName = row.display_name || ''

  try {
    const noticeMessage = joinName ? (joinName + '様が参加されました。') : '新しいメンバーが参加されました。'
    const { error: noticeErr } = await supabaseAdmin
      .from('ws_notices')
      .insert({
        workspace_id: row.workspace_id,
        level: 'info',
        message: noticeMessage,
      })
    if (noticeErr) {
      console.error('[workspace/claim-invite] notice insert error:', JSON.stringify(noticeErr))
    }
  } catch (e) {
    console.error('[workspace/claim-invite] notice insert error:', (e && e.message) || String(e))
  }

  try {
    const { data: existingMember, error: findErr } = await supabaseAdmin
      .from('ws_members')
      .select('id')
      .eq('workspace_id', row.workspace_id)
      .eq('name', joinName)
      .limit(1)
      .maybeSingle()
    if (findErr) {
      console.error('[workspace/claim-invite] ws_members lookup error:', JSON.stringify(findErr))
      return
    }
    if (existingMember) return

    const roleKey = String(row.role || '').toLowerCase()
    const roleLabel = CLAIM_ROLE_LABEL[roleKey] || row.role || ''
    const { error: insErr } = await supabaseAdmin
      .from('ws_members')
      .insert({
        workspace_id: row.workspace_id,
        name: joinName,
        role_label: roleLabel,
        permission: row.role,
      })
    if (insErr) {
      console.error('[workspace/claim-invite] ws_members insert error:', JSON.stringify(insErr))
    }
  } catch (e) {
    console.error('[workspace/claim-invite] ws_members insert error:', (e && e.message) || String(e))
  }
}

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
    .select('id, workspace_id, email, role, display_name')
    .is('user_id', null)
    .eq('status', 'pending')
  if (pendingErr) {
    console.error('[workspace/claim-invite] pending lookup error:', JSON.stringify(pendingErr))
    return res.status(500).json({ error: 'db_error' })
  }

  const mine = (pending || []).filter(r => String(r.email || '').toLowerCase() === myEmail)
  if (mine.length === 0) {
    return res.status(200).json({ ok: true, claimed: 0, workspaceIds: [] })
  }

  let claimed = 0
  const workspaceIds = []
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
      workspaceIds.push(row.workspace_id)
      // 参加通知と関係者登録は補助的な処理。失敗しても claim は成立させる
      await notifyJoined(row)
    }
  }

  // 7. 実際に更新できた件数と、その案件IDを返す
  return res.status(200).json({ ok: true, claimed: claimed, workspaceIds: workspaceIds })
}
