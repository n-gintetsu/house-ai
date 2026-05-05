import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: 'userId required' });

  const supabaseAdmin = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data, error } = await supabaseAdmin.auth.admin.deleteUser(userId);
  console.log('deleteUser result:', JSON.stringify({ data, error }));
  if (error) return res.status(500).json({ error: error.message, details: JSON.stringify(error) });

  await supabaseAdmin.from('profiles').delete().eq('id', userId);

  res.json({ success: true });
}
