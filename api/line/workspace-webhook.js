import { createHmac, timingSafeEqual } from 'node:crypto'
import { supabaseAdmin } from '../_adminAuth.js'

// Workspace 専用チャネルの Webhook。
// 既存の2チャネル（api/linebot.js / api/line-webhook.js）とは別チャネル・別 env を使う。
// 返信文はすべて固定文で、案件名・顧客名・住所・金額・ファイル名・利用者の入力文は載せない。
const MSG_FOLLOW = 'House-AI Workspace の通知アカウントです。\n連携するには、Workspaceの「設定 → 通知」で表示される6桁の番号をこのトークに送信してください。'
const MSG_NEED_CODE = '6桁の番号を送信してください。番号はWorkspaceの「設定 → 通知」で発行できます。'
const MSG_LINKED = '連携が完了しました。\n確認のご依頼があるときに、このトークでお知らせします。'
const MSG_INVALID = '番号が確認できませんでした。\n有効期限（10分）が切れている場合は、Workspaceで新しい番号を発行してください。'
const MSG_LOCKED = '試行回数の上限に達しました。しばらく時間をおいてからお試しください。'
const MSG_LINE_ALREADY_LINKED = 'このLINEアカウントは既に別のアカウントと連携されています。'
const MSG_TEMPORARY_ERROR = 'ただいま処理できませんでした。時間をおいてもう一度お試しください。'

// Vercel の自動パースを無効化し、署名検証用の生バイト列を保つ
export const config = { api: { bodyParser: false } }

async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', chunk => chunks.push(chunk))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

// 長さが違う場合に timingSafeEqual が例外になるため、先に長さを確認する
function signatureMatches(expected, received) {
  const a = Buffer.from(expected, 'utf8')
  const b = Buffer.from(received, 'utf8')
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}

// 全角数字を半角に直し、空白とハイフンを取り除く
function normalizeCode(text) {
  const half = String(text).replace(/[０-９]/g, c => String.fromCharCode(c.charCodeAt(0) - 0xFEE0))
  return half.trim().replace(/[\s　]/g, '').replace(/[-‐‑‒–—―−－ー]/g, '')
}

// 返信の失敗は処理を止める理由にしない。ログに残して続行する。
async function replyMessage(accessToken, replyToken, text) {
  if (!replyToken) return
  try {
    const res = await fetch('https://api.line.me/v2/bot/message/reply', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        replyToken,
        messages: [{ type: 'text', text: text }],
      }),
    })
    if (!res.ok) {
      console.error('[line/workspace-webhook] reply failed:', 'status=' + res.status)
    }
  } catch (e) {
    console.error('[line/workspace-webhook] reply error:', (e && e.message) || String(e))
  }
}

// RPC の戻り値に対応する固定文。想定外の値は invalid と同じ扱いにする。
function messageForResult(result) {
  if (result === 'linked') return MSG_LINKED
  if (result === 'locked') return MSG_LOCKED
  if (result === 'line_already_linked') return MSG_LINE_ALREADY_LINKED
  return MSG_INVALID
}

// コード本体・ハッシュ・LINE のユーザーIDはログに出さない
async function handleTextMessage(event, accessToken, linkCodeSecret) {
  const message = event.message
  const raw = message && typeof message.text === 'string' ? message.text : ''
  const code = normalizeCode(raw)

  if (!/^[0-9]{6}$/.test(code)) {
    await replyMessage(accessToken, event.replyToken, MSG_NEED_CODE)
    return
  }

  const source = event.source
  const lineUserId = source && typeof source.userId === 'string' ? source.userId : ''
  if (lineUserId === '') return

  const codeHash = createHmac('sha256', linkCodeSecret).update(code).digest('hex')

  const { data, error } = await supabaseAdmin.rpc('consume_line_link_code', {
    p_code_hash: codeHash,
    p_line_user_id: lineUserId,
  })
  if (error) {
    console.error('[line/workspace-webhook] rpc error:', JSON.stringify({ code: error.code, message: error.message }))
    await replyMessage(accessToken, event.replyToken, MSG_TEMPORARY_ERROR)
    return
  }

  await replyMessage(accessToken, event.replyToken, messageForResult(data))
}

/**
 * Vercel Serverless Function: POST /api/line/workspace-webhook
 * Workspace 専用 LINE チャネルの Webhook。
 * 署名を検証したあとは、結果にかかわらず 200 を返して LINE の再送を止める。
 */
export default async function handler(req, res) {
  // 1. メソッド確認
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // 2. env の存在確認（署名を検証できない状態では DB に触らない）
  const channelSecret = process.env.LINE_WORKSPACE_CHANNEL_SECRET
  const accessToken = process.env.LINE_WORKSPACE_CHANNEL_ACCESS_TOKEN
  const linkCodeSecret = process.env.LINE_WORKSPACE_LINK_CODE_SECRET
  if (!channelSecret || !accessToken || !linkCodeSecret) {
    console.error('[line/workspace-webhook] line env is not configured')
    return res.status(400).json({ error: 'invalid_signature' })
  }

  // 3. 署名検証（生バイト列で行う）
  const rawBody = await getRawBody(req)
  const signature = req.headers['x-line-signature']
  if (typeof signature !== 'string' || signature === '') {
    return res.status(400).json({ error: 'invalid_signature' })
  }
  const expected = createHmac('sha256', channelSecret).update(rawBody).digest('base64')
  if (!signatureMatches(expected, signature)) {
    console.error('[line/workspace-webhook] signature verification failed')
    return res.status(400).json({ error: 'invalid_signature' })
  }

  // 4. ここから先は結果にかかわらず 200 を返す（LINE の再送を防ぐ）
  let body = null
  try {
    body = JSON.parse(rawBody.toString('utf8'))
  } catch (e) {
    console.error('[line/workspace-webhook] body parse error')
    return res.status(200).json({ ok: true })
  }

  const events = body && Array.isArray(body.events) ? body.events : []

  // 5. 1件の失敗で他を止めない
  for (let i = 0; i < events.length; i++) {
    const event = events[i]
    try {
      if (!event) continue
      if (event.type === 'follow') {
        await replyMessage(accessToken, event.replyToken, MSG_FOLLOW)
        continue
      }
      if (event.type === 'message' && event.message && event.message.type === 'text') {
        await handleTextMessage(event, accessToken, linkCodeSecret)
        continue
      }
      // それ以外のイベント・メッセージ種別は何もしない
    } catch (e) {
      console.error('[line/workspace-webhook] event handling error:', (e && e.message) || String(e))
    }
  }

  return res.status(200).json({ ok: true })
}
