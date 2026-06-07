import { createClient } from '@supabase/supabase-js'

const ROLE_CANON = {
  owner: 'Owner', manager: 'Manager', staff: 'Staff', customer: 'Customer',
  broker: 'Broker', judicialscrivener: 'JudicialScrivener', bank: 'Bank',
  reformcompany: 'ReformCompany', guest: 'Guest', member: 'Member',
}
const normRole = (r) => ROLE_CANON[String(r || '').toLowerCase()] || r
const FULL_ACCESS_ROLES = ['Owner', 'Manager', 'Staff', 'Customer']

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const authHeader = req.headers['authorization'] || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''
  if (!token) return res.status(401).json({ error: 'no_token' })

  const { fileId, action } = req.body || {}
  if (!fileId) return res.status(400).json({ error: 'fileId required' })

  const supabaseAdmin = createClient(
    'https://bbkjnetmdfdrzcedmbdn.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  // ユーザー特定
  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
  if (authError || !user) {
    console.error('sign-file: getUser failed', authError)
    return res.status(401).json({ error: 'invalid_token', detail: (authError && authError.message) || null })
  }

  // ファイル取得
  const { data: file, error: fileErr } = await supabaseAdmin
    .from('ws_files')
    .select('id, workspace_id, folder_id, storage_path')
    .eq('id', fileId)
    .maybeSingle()
  if (fileErr || !file) return res.status(404).json({ error: 'File not found' })

  const { workspace_id, folder_id, storage_path } = file

  // ワークスペースメンバーシップ確認
  const { data: member, error: memberErr } = await supabaseAdmin
    .from('workspace_members')
    .select('id, role')
    .eq('workspace_id', workspace_id)
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle()
  if (memberErr || !member) return res.status(403).json({ error: 'Not a member' })

  const myMemberId = member.id
  const role = normRole(member.role)

  // アクセス権チェック（業者ロールのみ追加確認）
  if (!FULL_ACCESS_ROLES.includes(role)) {
    const [{ data: grant }, { data: folder }] = await Promise.all([
      supabaseAdmin
        .from('file_grants')
        .select('file_id')
        .eq('file_id', fileId)
        .eq('member_id', myMemberId)
        .maybeSingle(),
      supabaseAdmin
        .from('ws_file_folders')
        .select('owner_member_id')
        .eq('id', folder_id)
        .maybeSingle(),
    ])
    const hasGrant = !!grant
    const isMyFolder = !!(folder && folder.owner_member_id === myMemberId)
    if (!hasGrant && !isMyFolder) return res.status(403).json({ error: 'Access denied' })
  }

  // 署名URL発行（60秒有効）
  const { data: signed, error: signErr } = await supabaseAdmin.storage
    .from('workspace-files')
    .createSignedUrl(storage_path, 60)
  if (signErr || !signed) return res.status(500).json({ error: 'Failed to create signed URL' })

  // access_logs 記録（失敗してもURL返却は続行）
  try {
    await supabaseAdmin.from('access_logs').insert({
      workspace_id,
      user_id: user.id,
      file_id: fileId,
      action: action || 'view',
    })
  } catch (e) {
    console.error('sign-file: access_log insert error', e)
  }

  return res.status(200).json({ url: signed.signedUrl })
}
