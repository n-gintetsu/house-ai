import { supabaseAdmin } from './_adminAuth.js'

// 一般ユーザー（管理者に限らない）の本人確認。
// service_role クライアントは _adminAuth.js のものを再利用する（createClient を二重に書かない）。
// env は process.env.SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY（VITE_ は付けない）。

/**
 * Bearer トークンから本人を特定する。管理者かどうかは判定しない。
 * 失敗時はレスポンスを送信したうえで null を返す（呼び出し側は null なら即 return すること）。
 * userId / email は必ず getUser の結果から取る。req.body / req.query の自己申告値は使わない。
 */
export async function requireUser(req, res) {
  const authHeader = req.headers.authorization || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''
  if (!token) {
    res.status(401).json({ error: 'no_token' })
    return null
  }

  const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token)
  if (userErr || !userData || !userData.user) {
    res.status(401).json({ error: 'invalid_token' })
    return null
  }

  const user = userData.user
  return { userId: user.id, email: user.email }
}

/**
 * 本人確認のうえ、その人がオーナーの組織を owner_id から引き直す。
 * org_id はクライアントから受け取らない（自己申告の org を操作させないため）。
 * オーナーの組織が無いことは異常ではないので、org: null を返して呼び出し側に判断させる。
 * 失敗時はレスポンスを送信したうえで null を返す。
 */
export async function requireOrgOwner(req, res) {
  const user = await requireUser(req, res)
  if (!user) return null

  const { data: org, error: orgErr } = await supabaseAdmin
    .from('organizations')
    .select('id, name')
    .eq('owner_id', user.userId)
    .limit(1)
    .maybeSingle()
  if (orgErr) {
    console.error('[_userAuth] organizations select error:', JSON.stringify(orgErr))
    res.status(500).json({ error: 'db_error' })
    return null
  }

  if (!org) {
    return { userId: user.userId, email: user.email, org: null }
  }

  return {
    userId: user.userId,
    email: user.email,
    org: { id: org.id, name: org.name },
  }
}
