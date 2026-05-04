export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { category, area, summary, session_id, case_type = 'ai_consultation' } = req.body;

  const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
  const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;
  const headers = { 'Content-Type': 'application/json', 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` };

  try {
    // 業者一覧取得
    const agRes = await fetch(`${SUPABASE_URL}/rest/v1/agency_registrations?select=id,email,area,business_type,created_at&status=eq.approved`, { headers });
    let agencies = await agRes.json();
    if (!Array.isArray(agencies)) agencies = [];

    // 未承認でも全業者を対象（登録済み全員）
    const agAllRes = await fetch(`${SUPABASE_URL}/rest/v1/agency_registrations?select=id,email,area,business_type,created_at,plan`, { headers });
    let allAgencies = await agAllRes.json();
    if (!Array.isArray(allAgencies)) allAgencies = [];

    if (allAgencies.length === 0) {
      return res.json({ distributed: 0, message: '配信対象の業者がいません' });
    }

    // 返信率集計（case_distributions の status='read' 件数 / 総配信数）
    const cdStatsRes = await fetch(
      `${SUPABASE_URL}/rest/v1/case_distributions?select=agency_email,status`,
      { headers }
    );
    let cdStats = await cdStatsRes.json();
    if (!Array.isArray(cdStats)) cdStats = [];

    const replyRateMap = {};
    for (const row of cdStats) {
      if (!row.agency_email) continue;
      if (!replyRateMap[row.agency_email]) replyRateMap[row.agency_email] = { total: 0, read: 0 };
      replyRateMap[row.agency_email].total++;
      if (row.status === 'read') replyRateMap[row.agency_email].read++;
    }

    // スコア計算
    const now = new Date();
    const scored = allAgencies.map(ag => {
      let score = 0;
      const isNew = ag.created_at && (now - new Date(ag.created_at)) < 7 * 24 * 60 * 60 * 1000;
      const stats = replyRateMap[ag.email] || { total: 0, read: 0 };
      const rate = stats.total > 0 ? (stats.read / stats.total) * 100 : 0;
      const is_recommended = rate >= 80;

      // エリアマッチ
      if (area && ag.area && ag.area.includes(area.slice(0, 3))) score += 50;
      // カテゴリマッチ
      if (category && ag.business_type && ag.business_type.includes(category)) score += 30;
      // プロフィール充実（emailあり）
      if (ag.email) score += 10;
      // 新規ブースト（7日以内）
      if (isNew) score += 40;
      // プランブースト
      if (ag.plan === 'premium') score += 50;
      else if (ag.plan === 'standard') score += 20;
      // 返信率ブースト
      if (is_recommended) score += 30;
      else if (rate >= 60) score += 10;

      return { ...ag, score, is_boosted: isNew, is_recommended };
    });

    // スコア降順ソート・上位5社
    scored.sort((a, b) => b.score - a.score);
    const targets = scored.slice(0, Math.min(5, scored.length));
    const competitor_count = targets.length - 1;

    // case_distributionsに挿入
    const inserts = targets.map(ag => ({
      case_type,
      category: category || 'general',
      area: area || '',
      summary: summary || '',
      user_session_id: session_id || '',
      agency_id: ag.id,
      agency_email: ag.email,
      score: ag.score,
      status: 'new',
      is_boosted: ag.is_boosted,
      competitor_count,
    }));

    await fetch(`${SUPABASE_URL}/rest/v1/case_distributions`, {
      method: 'POST',
      headers: { ...headers, 'Prefer': 'return=minimal' },
      body: JSON.stringify(inserts),
    });

    res.json({ distributed: targets.length, competitor_count, message: `${targets.length}社に配信しました` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
