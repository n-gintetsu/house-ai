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
      await supabaseAdmin.from('admin_notes').delete().eq('admin_id', userId);
      await supabaseAdmin.from('reports').delete().eq('reporter_id', userId);
      await supabaseAdmin.from('reports').delete().eq('handled_by', userId);
      await supabaseAdmin.from('community_posts').delete().eq('user_id', userId);
      await supabaseAdmin.from('valuations').delete().eq('user_id', userId);
      await supabaseAdmin.from('expert_requests').delete().eq('user_id', userId);
      await supabaseAdmin.from('favorites').delete().eq('user_id', userId);
      await supabaseAdmin.from('profiles').delete().eq('id', userId);
      const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
      if (error) return res.status(500).json({ error: error.message });
      return res.json({ success: true });
    }

    return res.status(400).json({ error: 'invalid action' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
