import { supabaseAdmin } from '../_adminAuth.js'
import { requireUser } from '../_userAuth.js'

// 「次に何をすべきか」を返す。RPC の戻り値をそのまま成否に読み替えない。
// trial_consumed / already_decided は異常ではなく、契約導線へ進むべき正常な結果。
const RESULT_RESPONSE = {
  trial_started: { canCreateWorkspace: true, needsContract: false },
  already_trialing: { canCreateWorkspace: true, needsContract: false },
  already_billable: { canCreateWorkspace: true, needsContract: false },
  trial_consumed: { canCreateWorkspace: false, needsContract: true },
  already_decided: { canCreateWorkspace: false, needsContract: true },
}

// 呼び出し自体が成立しない場合のみエラーとして扱う
const ERROR_STATUS = {
  multiple_owned_orgs: 409,
  exception_unavailable: 409,
  invalid_input: 400,
}

/**
 * Vercel Serverless Function: POST /api/billing/start-trial
 * 無料期間を開始する。organization をまだ持たないユーザーも対象になるため、
 * requireOrgOwner ではなく requireUser を使い、組織の特定は RPC 側に任せる。
 * 対象ユーザーは必ずセッションから決まり、リクエストの body は読まない。
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

  // 3. body は読まない。対象はセッション由来の値のみ。
  const { data, error } = await supabaseAdmin.rpc('start_trial', {
    p_user_id: ctx.userId,
  })

  // 4. RPC 自体の失敗
  if (error) {
    console.error('[billing/start-trial] rpc error:', JSON.stringify(error))
    return res.status(500).json({ error: 'db_error' })
  }

  // 5. 戻り値で分岐（クライアントが次に何をすべきかを返す）
  if (Object.prototype.hasOwnProperty.call(RESULT_RESPONSE, data)) {
    const next = RESULT_RESPONSE[data]
    return res.status(200).json({
      ok: true,
      result: data,
      canCreateWorkspace: next.canCreateWorkspace,
      needsContract: next.needsContract,
    })
  }

  const errStatus = ERROR_STATUS[data]
  if (errStatus) {
    return res.status(errStatus).json({ error: data })
  }

  console.error('[billing/start-trial] unknown rpc result:', String(data))
  return res.status(500).json({ error: 'unknown_result' })
}
