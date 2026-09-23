import { randomInt, createHmac } from 'node:crypto'
import { supabaseAdmin } from '../../_adminAuth.js'
import { requireUser } from '../../_userAuth.js'

// コードの有効期限（10分）。短命にして、漏れた場合の影響を限定する。
const CODE_TTL_MS = 10 * 60 * 1000
// 一意制約に当たったときの再生成回数。
const MAX_ATTEMPTS = 5

function nowIso() {
  return new Date().toISOString()
}

// 6桁ゼロ埋め。予測可能な疑似乱数は使わず、crypto の randomInt を使う。
function generateCode() {
  return String(randomInt(0, 1000000)).padStart(6, '0')
}

/**
 * Vercel Serverless Function: POST /api/notifications/line/link-code
 * ログイン済みユーザーが LINE 連携用の6桁コードを発行する。
 * 対象ユーザーはセッションから決まり、リクエストの body / query は読まない。
 * DB に保存するのは HMAC ハッシュのみで、コード本体は保存もログ出力もしない。
 */
export default async function handler(req, res) {
  // 1. メソッド確認
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // 2. env の存在確認
  const secret = process.env.LINE_WORKSPACE_LINK_CODE_SECRET
  if (!secret) {
    console.error('[line/link-code] line env is not configured')
    return res.status(500).json({ error: 'line_not_configured' })
  }

  // 3. 本人確認（失敗時はレスポンス送信済み）
  const ctx = await requireUser(req, res)
  if (!ctx) return
  if (!ctx.userId) {
    return res.status(401).json({ error: 'no_user' })
  }

  // 4. 既に連携済みなら発行しない
  const { data: active, error: activeErr } = await supabaseAdmin
    .from('workspace_line_connections')
    .select('id')
    .eq('user_id', ctx.userId)
    .eq('status', 'active')
    .limit(1)
    .maybeSingle()
  if (activeErr) {
    console.error('[line/link-code] active select error:', JSON.stringify(activeErr))
    return res.status(500).json({ error: 'db_error' })
  }
  if (active) {
    return res.status(409).json({ error: 'already_linked' })
  }

  // 5. この user の既存 pending を無効化する（有効なコードを常に1つに保つ）
  //    revoked には CHECK が無いため、code_hash と期限を null にして消す。
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
    .eq('status', 'pending')
  if (revokeErr) {
    console.error('[line/link-code] revoke pending error:', JSON.stringify(revokeErr))
    return res.status(500).json({ error: 'db_error' })
  }

  // 6. コードを生成して insert。一意制約に当たった場合のみ作り直す。
  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    const code = generateCode()
    const codeHash = createHmac('sha256', secret).update(code).digest('hex')
    const expiresAt = new Date(Date.now() + CODE_TTL_MS).toISOString()

    const { error: insErr } = await supabaseAdmin
      .from('workspace_line_connections')
      .insert({
        user_id: ctx.userId,
        status: 'pending',
        code_hash: codeHash,
        code_expires_at: expiresAt,
      })

    if (!insErr) {
      // 7. 成功。コード本体はレスポンスでのみ返し、保存もログ出力もしない。
      return res.status(200).json({ code: code, expiresAt: expiresAt })
    }

    if (insErr.code === '23505') {
      // 同じハッシュが既にある。別のコードで作り直す
      continue
    }

    console.error('[line/link-code] insert error:', JSON.stringify(insErr))
    return res.status(500).json({ error: 'db_error' })
  }

  console.error('[line/link-code] code generation failed for user:', ctx.userId)
  return res.status(500).json({ error: 'code_generation_failed' })
}
