export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
  const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;
  const headers = { 'Content-Type': 'application/json', 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` };

  try {
    // 直近100件の行動イベントを取得
    const evRes = await fetch(
      `${SUPABASE_URL}/rest/v1/analytics_events?event_type=in.(property_view,favorite_add)&order=created_at.desc&limit=100&select=*`,
      { headers }
    );
    let events = await evRes.json();
    if (!Array.isArray(events)) events = [];

    if (events.length === 0) return res.json({ distributed: 0, message: '対象イベントなし' });

    // 変換済みの session_id+case_type の組み合わせを取得
    const cdRes = await fetch(
      `${SUPABASE_URL}/rest/v1/case_distributions?case_type=in.(property_view,favorite_add)&select=user_session_id,case_type`,
      { headers }
    );
    let existing = await cdRes.json();
    if (!Array.isArray(existing)) existing = [];

    const existingSet = new Set(existing.map(r => `${r.user_session_id}:${r.case_type}`));

    // 未処理イベントのみ抽出
    const unprocessed = events.filter(ev => !existingSet.has(`${ev.session_id}:${ev.event_type}`));

    if (unprocessed.length === 0) return res.json({ distributed: 0, message: '新規イベントなし' });

    // 業者一覧取得（planカラム含む）
    const agRes = await fetch(
      `${SUPABASE_URL}/rest/v1/agency_registrations?select=id,email,area,business_type,created_at,plan`,
      { headers }
    );
    let agencies = await agRes.json();
    if (!Array.isArray(agencies)) agencies = [];

    if (agencies.length === 0) return res.json({ distributed: 0, message: '配信対象業者なし' });

    const now = new Date();
    let totalInserted = 0;

    for (const ev of unprocessed) {
      const meta = ev.metadata || {};
      const category = meta.category || 'general';
      const area = meta.area || '';
      const title = String(meta.title || '');
      const baseScore = ev.event_type === 'favorite_add' ? 80 : 50;
      const summary = ev.event_type === 'favorite_add'
        ? `お気に入りに追加しました：${title}`
        : `物件を閲覧しました：${title}`;

      // 業者スコア計算（distribute-case.jsと同様のロジック）
      const scored = agencies.map(ag => {
        let score = baseScore;
        const isNew = ag.created_at && (now - new Date(ag.created_at)) < 7 * 24 * 60 * 60 * 1000;
        if (area && ag.area && ag.area.includes(area.slice(0, 3))) score += 50;
        if (category && ag.business_type && ag.business_type.includes(category)) score += 30;
        if (ag.email) score += 10;
        if (isNew) score += 40;
        if (ag.plan === 'premium') score += 50;
        else if (ag.plan === 'standard') score += 20;
        return { ...ag, score };
      });

      scored.sort((a, b) => b.score - a.score);
      const targets = scored.slice(0, Math.min(5, scored.length));
      const competitor_count = targets.length - 1;

      const inserts = targets.map(ag => ({
        case_type: ev.event_type,
        category,
        area,
        summary,
        user_session_id: ev.session_id || '',
        agency_id: ag.id,
        agency_email: ag.email,
        score: ag.score,
        status: 'new',
        is_boosted: false,
        competitor_count,
      }));

      await fetch(`${SUPABASE_URL}/rest/v1/case_distributions`, {
        method: 'POST',
        headers: { ...headers, 'Prefer': 'return=minimal' },
        body: JSON.stringify(inserts),
      });
      totalInserted += inserts.length;
    }

    res.json({
      distributed: totalInserted,
      events: unprocessed.length,
      message: `${unprocessed.length}件のイベントを${totalInserted}件の配信に変換しました`,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
