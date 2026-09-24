import { supabaseAdmin } from '../_adminAuth.js'
import { requireUser } from '../_userAuth.js'
import { canSendNotification } from '../_roles.js'
import { buildConfirmRequestLineText, sendLinePush } from '../_lineNotify.js'
import { CONFIRM_REQUEST_SUBJECT, buildConfirmRequestMailText, sendMail } from '../_mailNotify.js'

// 今回扱う通知種別と対象の種類。draft は対象の実体が無いため受け付けない。
const NOTIFICATION_TYPE = 'confirm_request'
const TARGET_TABLES = { file: 'ws_files', message: 'workspace_messages' }

function nowIso() {
  return new Date().toISOString()
}

// ログの更新は id 指定で行う。error_code は固定コードのみを入れる。
async function updateLog(logId, patch) {
  const { error } = await supabaseAdmin
    .from('workspace_line_notification_log')
    .update({ ...patch, updated_at: nowIso() })
    .eq('id', logId)
  if (error) {
    console.error('[workspace/notify-line] log update error:', JSON.stringify(error))
  }
}

/**
 * Vercel Serverless Function: POST /api/workspace/notify-line
 * 案件の関係者へ「確認のご依頼」を通知する。
 * 送信者・宛先・対象はすべて DB から再検証し、リクエストの自己申告値は使わない。
 * 通知本文は固定文のみで、案件名・顧客名・ファイル名・依頼者名・本文は載せない。
 */
export default async function handler(req, res) {
  // 1. メソッド確認
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // 2. env 確認
  const lineToken = process.env.LINE_WORKSPACE_CHANNEL_ACCESS_TOKEN
  if (!lineToken) {
    console.error('[workspace/notify-line] line env is not configured')
    return res.status(500).json({ error: 'line_not_configured' })
  }
  const resendKey = process.env.RESEND_API_KEY
  if (!resendKey) {
    console.error('[workspace/notify-line] mail env is not configured')
    return res.status(500).json({ error: 'mail_not_configured' })
  }

  // 3. 本人確認（失敗時はレスポンス送信済み）
  const ctx = await requireUser(req, res)
  if (!ctx) return
  if (!ctx.userId) {
    return res.status(401).json({ error: 'no_user' })
  }

  let body = req.body
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body)
    } catch {
      body = null
    }
  }
  body = body || {}

  // 4. 入力検証（sender / email / LINE のユーザーID / 本文は受け取らない）
  const workspaceId = body.workspaceId
  const recipientMemberId = body.recipientMemberId
  const targetType = body.targetType
  const targetId = body.targetId
  if (typeof workspaceId !== 'string' || workspaceId === '' ||
      typeof recipientMemberId !== 'string' || recipientMemberId === '' ||
      typeof targetId !== 'string' || targetId === '') {
    return res.status(400).json({ error: 'invalid_input' })
  }
  if (typeof targetType !== 'string' || !TARGET_TABLES[targetType]) {
    return res.status(400).json({ error: 'invalid_target_type' })
  }

  // 5. 送信者がこの案件の active メンバーか
  const { data: actor, error: actorErr } = await supabaseAdmin
    .from('workspace_members')
    .select('id, role')
    .eq('workspace_id', workspaceId)
    .eq('user_id', ctx.userId)
    .eq('status', 'active')
    .limit(1)
    .maybeSingle()
  if (actorErr) {
    console.error('[workspace/notify-line] actor lookup error:', JSON.stringify(actorErr))
    return res.status(500).json({ error: 'db_error' })
  }
  if (!actor) {
    return res.status(403).json({ error: 'not_a_member' })
  }

  // 6. 課金判定。判定するのは案件を所有する組織（host org）。
  //    メンバーでない相手には直前の not_a_member で既に返している。
  const { data: billable, error: billErr } =
    await supabaseAdmin.rpc('workspace_org_is_billable', { p_workspace_id: workspaceId })
  if (billErr) {
    console.error('[workspace/notify-line] billing check error:', JSON.stringify(billErr))
    return res.status(500).json({ error: 'billing_check_failed' })
  }
  if (billable !== true) {
    return res.status(402).json({ error: 'billing_required' })
  }

  // 7. 送信者の role（allowlist。判定は normRole 経由）
  if (!canSendNotification(actor.role)) {
    return res.status(403).json({ error: 'insufficient_permission' })
  }

  // 8. 宛先の検証（この案件の active メンバーだけを対象にする）
  const { data: recipient, error: recipientErr } = await supabaseAdmin
    .from('workspace_members')
    .select('id, user_id')
    .eq('id', recipientMemberId)
    .eq('workspace_id', workspaceId)
    .eq('status', 'active')
    .limit(1)
    .maybeSingle()
  if (recipientErr) {
    console.error('[workspace/notify-line] recipient lookup error:', JSON.stringify(recipientErr))
    return res.status(500).json({ error: 'db_error' })
  }
  if (!recipient) {
    return res.status(404).json({ error: 'recipient_not_found' })
  }
  if (!recipient.user_id) {
    return res.status(409).json({ error: 'recipient_not_linked' })
  }

  // 9. 自分自身への送信は受け付けない
  if (recipient.user_id === ctx.userId) {
    return res.status(400).json({ error: 'invalid_input' })
  }

  // 10. 対象がこの案件に属しているか
  const { data: target, error: targetErr } = await supabaseAdmin
    .from(TARGET_TABLES[targetType])
    .select('id')
    .eq('id', targetId)
    .eq('workspace_id', workspaceId)
    .limit(1)
    .maybeSingle()
  if (targetErr) {
    console.error('[workspace/notify-line] target lookup error:', JSON.stringify(targetErr))
    return res.status(500).json({ error: 'db_error' })
  }
  if (!target) {
    return res.status(404).json({ error: 'target_not_found' })
  }

  // 11. 送信経路を決める（LINE 連携があり通知が ON のときだけ LINE。それ以外はメール）
  const { data: connection, error: connErr } = await supabaseAdmin
    .from('workspace_line_connections')
    .select('line_user_id')
    .eq('user_id', recipient.user_id)
    .eq('status', 'active')
    .limit(1)
    .maybeSingle()
  if (connErr) {
    console.error('[workspace/notify-line] connection lookup error:', JSON.stringify(connErr))
    return res.status(500).json({ error: 'db_error' })
  }

  const { data: settings, error: settingsErr } = await supabaseAdmin
    .from('workspace_notification_settings')
    .select('line_confirm_request')
    .eq('user_id', recipient.user_id)
    .limit(1)
    .maybeSingle()
  if (settingsErr) {
    console.error('[workspace/notify-line] settings lookup error:', JSON.stringify(settingsErr))
    return res.status(500).json({ error: 'db_error' })
  }

  // 行が無い／null は未設定として ON 扱い（既定ON）
  let lineEnabled = true
  if (settings && settings.line_confirm_request === false) {
    lineEnabled = false
  }
  const useLine = connection && connection.line_user_id && lineEnabled ? true : false
  const requestedChannel = useLine ? 'line' : 'email'

  // 12. 連打防止。accepted のときだけログ行が作られ、その id が戻り値に入る。
  //     引数は旧関数と同じ。戻り値の形だけが uuid から jsonb に変わる。
  const { data: claim, error: claimErr } = await supabaseAdmin.rpc('claim_line_notification_v2', {
    p_workspace_id: workspaceId,
    p_sender_user_id: ctx.userId,
    p_recipient_user_id: recipient.user_id,
    p_notification_type: NOTIFICATION_TYPE,
    p_target_type: targetType,
    p_target_id: targetId,
    p_requested_channel: requestedChannel,
  })
  if (claimErr) {
    console.error('[workspace/notify-line] claim error:', JSON.stringify(claimErr))
    return res.status(500).json({ error: 'db_error' })
  }
  const claimResult = claim && claim.result ? claim.result : ''
  if (claimResult === 'duplicate_cooldown') {
    return res.status(429).json({ error: 'duplicate_cooldown' })
  }
  if (claimResult === 'recipient_rate_limit') {
    return res.status(429).json({ error: 'recipient_rate_limit' })
  }
  // invalid_input / null / 想定外はここで止める
  if (claimResult !== 'accepted' || !claim.id) {
    console.error('[workspace/notify-line] claim unexpected result:', String(claimResult))
    return res.status(500).json({ error: 'db_error' })
  }
  const logId = claim.id

  // 13. 送信
  let lastErrorCode = null

  if (requestedChannel === 'line') {
    const lineResult = await sendLinePush(lineToken, connection.line_user_id, buildConfirmRequestLineText(workspaceId))
    if (lineResult.ok) {
      await updateLog(logId, { status: 'sent', delivered_channel: 'line' })
      return res.status(200).json({ ok: true, channel: 'line' })
    }
    // LINE の失敗では status を変えない（accepted のまま）。記録してメールへ進む。
    lastErrorCode = lineResult.errorCode
    await updateLog(logId, { error_code: lastErrorCode })
  }

  const { data: userData, error: userErr } = await supabaseAdmin.auth.admin.getUserById(recipient.user_id)
  if (userErr) {
    console.error('[workspace/notify-line] recipient user lookup failed')
    lastErrorCode = 'email_lookup_failed'
  } else {
    const recipientEmail = userData && userData.user ? userData.user.email : null
    if (!recipientEmail) {
      lastErrorCode = 'email_no_address'
    } else {
      const mailResult = await sendMail(
        resendKey,
        recipientEmail,
        CONFIRM_REQUEST_SUBJECT,
        buildConfirmRequestMailText(workspaceId)
      )
      if (mailResult.ok) {
        await updateLog(logId, { status: 'sent', delivered_channel: 'email' })
        return res.status(200).json({ ok: true, channel: 'email' })
      }
      lastErrorCode = mailResult.errorCode
    }
  }

  // どちらも送れなかった場合だけ failed にする
  await updateLog(logId, { status: 'failed', error_code: 'both_failed' })
  console.error('[workspace/notify-line] notify failed:', 'last_error=' + String(lastErrorCode))
  return res.status(500).json({ error: 'notify_failed' })
}
