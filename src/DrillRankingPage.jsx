import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function DrillRankingPage({ onBack }) {
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchRankings() {
      const { data, error } = await supabase
        .from('drill_scores')
        .select('*')
        .order('rate', { ascending: false })
        .order('streak', { ascending: false })
        .order('created_at', { ascending: true })
        .limit(50);
      if (error) {
        setError(error.message);
      } else {
        setRankings(data || []);
      }
      setLoading(false);
    }
    fetchRankings();
  }, []);

  return (
    <div style={{ background: '#0F172A', color: 'white', minHeight: '100vh', padding: '24px', boxSizing: 'border-box' }}>
      <button
        onClick={onBack}
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}
      >
        戻る
      </button>

      <h1 style={{ color: '#D4AF37', fontSize: '24px', fontWeight: 700, textAlign: 'center', margin: '24px 0 4px' }}>
        全国投資家ランキング
      </h1>
      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', textAlign: 'center', letterSpacing: '2px', marginBottom: '32px' }}>
        House-AI ドリル スコアボード
      </p>

      {loading ? (
        <p style={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>データを取得中...</p>
      ) : (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          {rankings.length === 0 ? (
            <p style={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>
              まだ記録がありません。最初のランカーになろう！
            </p>
          ) : (
            rankings.map((entry, i) => {
              const rank = i + 1;
              const rankStyle =
                rank === 1
                  ? { bg: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.3)', numColor: '#D4AF37', numSize: '28px' }
                  : rank === 2
                  ? { bg: 'rgba(192,192,192,0.05)', border: '1px solid rgba(192,192,192,0.2)', numColor: '#C0C0C0', numSize: '28px' }
                  : rank === 3
                  ? { bg: 'rgba(205,127,50,0.05)', border: '1px solid rgba(205,127,50,0.2)', numColor: '#CD7F32', numSize: '28px' }
                  : { bg: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', numColor: 'rgba(255,255,255,0.3)', numSize: '16px' };

              const badgeEl =
                entry.badge === 'GOLD' ? (
                  <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', border: '1px solid #D4AF37', color: '#D4AF37' }}>GOLD</span>
                ) : entry.badge === 'SILVER' ? (
                  <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', border: '1px solid #C0C0C0', color: '#C0C0C0' }}>SILVER</span>
                ) : entry.badge === 'BRONZE' ? (
                  <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', border: '1px solid #CD7F32', color: '#CD7F32' }}>BRONZE</span>
                ) : null;

              return (
                <div
                  key={entry.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '16px 20px',
                    borderRadius: '12px',
                    marginBottom: '8px',
                    background: rankStyle.bg,
                    border: rankStyle.border,
                  }}
                >
                  <div style={{ minWidth: '40px', textAlign: 'center', fontSize: rankStyle.numSize, fontWeight: 700, color: rankStyle.numColor }}>
                    {rank}
                  </div>
                  {badgeEl}
                  <div style={{ flex: 1, fontSize: '16px', fontWeight: 600, color: 'white' }}>
                    {entry.user_name}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '18px', fontWeight: 700, color: '#D4AF37' }}>{entry.rate}%</div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>最大{entry.streak}連続</div>
                  </div>
                </div>
              );
            })
          )}
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', textAlign: 'center', marginTop: '24px' }}>
            全{rankings.length}名が挑戦中
          </p>
        </div>
      )}
    </div>
  );
}
