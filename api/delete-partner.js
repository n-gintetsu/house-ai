import { createClient } from '@supabase/supabase-js';

const ADMIN_EMAILS = ['gintetsu.fudosan@gmail.com']

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

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

  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: 'userId required' });

  const { data, error } = await supabaseAdmin.auth.admin.deleteUser(userId);
  console.log('deleteUser result:', JSON.stringify({ data, error }));
  if (error) return res.status(500).json({ error: error.message, details: JSON.stringify(error) });

  const { error: profileErr } = await supabaseAdmin.from('partner_profiles').delete().eq('user_id', userId);
  if (profileErr) {
    console.error('[delete-partner] partner_profiles delete error:', JSON.stringify(profileErr));
  }

  res.json({ success: true });
}
