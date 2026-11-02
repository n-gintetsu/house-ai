import { createClient } from '@supabase/supabase-js';

const ADMIN_EMAILS = ['gintetsu.fudosan@gmail.com']

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export default async function handler(req, res) {
  const authHeader = req.headers.authorization || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''
  if (!token) return res.status(401).json({ error: 'no_token' })

  const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token)
  if (userErr || !userData || !userData.user) {
    return res.status(401).json({ error: 'invalid_token' })
  }

  const email = userData.user.email || ''
  if (!ADMIN_EMAILS.includes(email)) {
    return res.status(403).json({ error: 'not_admin' })
  }

  if (req.method === 'GET') {
    // 業者・パートナーチェック用
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: 'userId required' });

    const [agencyResult, partnerResult] = await Promise.all([
      supabaseAdmin.from('agency_registrations').select('id, company_name').eq('agency_user_id', userId).maybeSingle(),
      supabaseAdmin.from('partner_profiles').select('id, company_name').eq('user_id', userId).maybeSingle(),
    ]);

    return res.json({
      hasAgency: !!agencyResult.data,
      agencyName: agencyResult.data?.company_name || null,
      hasPartner: !!partnerResult.data,
      partnerName: partnerResult.data?.company_name || null,
    });
  }

  if (req.method === 'POST') {
    const { userId, action } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId required' });

    // 復活
    if (action === 'restore') {
      await supabaseAdmin.from('profiles').update({ deleted_at: null, account_status: 'active' }).eq('id', userId);
      return res.json({ success: true });
    }

    // 論理削除（30日猶予）
    if (action === 'soft') {
      await supabaseAdmin.from('profiles').update({
        deleted_at: new Date().toISOString(),
        account_status: 'suspended'
      }).eq('id', userId);
      return res.json({ success: true });
    }

    // 完全削除（物理削除）
    if (action === 'hard') {
      if (userId === userData.user.id) {
        return res.status(400).json({ error: 'cannot_delete_self' });
      }

      // 事前確認A：組織の持ち主なら止める（organizations.owner_id には外部キーが無く、DB は止めない）
      const { data: ownedOrgs, error: orgErr } = await supabaseAdmin
        .from('organizations')
        .select('id, name')
        .eq('owner_id', userId);
      if (orgErr) {
        return res.status(500).json({ error: 'precheck_failed', step: 'organizations' });
      }
      if ((ownedOrgs || []).length > 0) {
        return res.status(409).json({ error: 'owns_organization', organizations: ownedOrgs.map(o => o.name) });
      }

      // 事前確認B：生存案件の最後の Owner なら止める（workspace_members.user_id は CASCADE で行ごと消えるため）
      const { data: myRows, error: myErr } = await supabaseAdmin
        .from('workspace_members')
        .select('workspace_id, role')
        .eq('user_id', userId);
      if (myErr) {
        return res.status(500).json({ error: 'precheck_failed', step: 'workspace_owner' });
      }
      const ownerWsIds = (myRows || [])
        .filter(m => String(m.role || '').toLowerCase() === 'owner')
        .map(m => m.workspace_id);
      if (ownerWsIds.length > 0) {
        const { data: liveWs, error: wsErr } = await supabaseAdmin
          .from('workspaces')
          .select('id, title')
          .in('id', ownerWsIds)
          .is('deleted_at', null);
        if (wsErr) {
          return res.status(500).json({ error: 'precheck_failed', step: 'workspace_owner' });
        }
        const lastOwnerTitles = [];
        for (const ws of (liveWs || [])) {
          const { data: others, error: othersErr } = await supabaseAdmin
            .from('workspace_members')
            .select('role')
            .eq('workspace_id', ws.id)
            .neq('user_id', userId)
            .eq('status', 'active');
          if (othersErr) {
            return res.status(500).json({ error: 'precheck_failed', step: 'workspace_owner' });
          }
          const hasOtherOwner = (others || []).some(m => String(m.role || '').toLowerCase() === 'owner');
          if (!hasOtherOwner) lastOwnerTitles.push(ws.title);
        }
        if (lastOwnerTitles.length > 0) {
          return res.status(409).json({ error: 'last_owner_of_workspace', workspaces: lastOwnerTitles });
        }
      }

      // auth を先に消す。NO ACTION の参照が残っていればここで失敗し、まだ何も消していない。
      // profiles は CASCADE、reports は SET NULL で DB 側が処理する。
      const { error: authErr } = await supabaseAdmin.auth.admin.deleteUser(userId);
      if (authErr) {
        return res.status(409).json({ error: 'auth_delete_failed', detail: authErr.message });
      }

      // 外部キーの無い関連データ。失敗しても残りは続け、失敗したテーブル名を返す。
      // admin_notes は admin_id（メモを書いた管理者）ではなく target_id で絞ること。
      const cleanupTargets = [
        ['admin_notes', 'target_id'],
        ['community_posts', 'user_id'],
        ['valuations', 'user_id'],
        ['expert_requests', 'user_id'],
        ['favorites', 'user_id'],
      ];
      const cleanup_failed = [];
      for (const [table, column] of cleanupTargets) {
        const { error: delErr } = await supabaseAdmin.from(table).delete().eq(column, userId);
        if (delErr) cleanup_failed.push(table);
      }
      return res.json({ success: true, cleanup_failed });
    }

    return res.status(400).json({ error: 'invalid action' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
