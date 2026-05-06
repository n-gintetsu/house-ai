import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: 'userId required' });

  const supabaseAdmin = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SECRET_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  await supabaseAdmin.from('partner_profiles').delete().eq('user_id', userId);

  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
  if (error) return res.status(500).json({ error: error.message });

  res.json({ success: true });
}
