import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

export default function DrillRankingPage({ onBack }) {
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [iq3Answer, setIq3Answer] = useState('');
  const [iq3Submitted, setIq3Submitted] = useState(false);

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
    <div style={{ background: '#0F172A', color: 'white', minHeight: '100vh', boxSizing: 'border-box' }}>
      <style>{`
        @keyframes shieldGlow {
          0%, 100% { box-shadow: 0 0 20px rgba(212,175,55,0.3); }
          50% { box-shadow: 0 0 60px rgba(212,175,55,0.8), 0 0 100px rgba(212,175,55,0.3); }
        }
        @keyframes silverGlow {
          0%, 100% { box-shadow: 0 0 20px rgba(192,192,192,0.3); }
          50% { box-shadow: 0 0 60px rgba(192,192,192,0.7), 0 0 100px rgba(192,192,192,0.2); }
        }
        @keyframes bronzeGlow {
          0%, 100% { box-shadow: 0 0 20px rgba(205,127,50,0.3); }
          50% { box-shadow: 0 0 60px rgba(205,127,50,0.7), 0 0 100px rgba(205,127,50,0.2); }
        }
        @keyframes iqPulse {
          0%, 100% { box-shadow: 0 0 30px rgba(212,175,55,0.2), inset 0 0 30px rgba(212,175,55,0.05); }
          50% { box-shadow: 0 0 80px rgba(212,175,55,0.5), inset 0 0 60px rgba(212,175,55,0.1); }
        }
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        @keyframes goldBreath {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.3); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
      `}</style>

      {/* 戻るボタン */}
      <div style={{ padding: '16px 24px' }}>
        <button
          onClick={onBack}
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}
        >
          戻る
        </button>
      </div>

      {/* ゾーン1: HALL OF FAME */}
      <div style={{ background: 'linear-gradient(180deg, #0a0a0f 0%, #0F172A 100%)', padding: '48px 24px 40px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.5), transparent)', animation: 'scanline 6s linear infinite', pointerEvents: 'none' }} />

        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ fontSize: '10px', color: 'rgba(212,175,55,0.5)', letterSpacing: '5px', marginBottom: '10px' }}>
            HOUSE-AI INVESTOR HALL OF FAME
          </div>
          <div style={{ fontSize: '26px', fontWeight: '700', color: 'white', letterSpacing: '1px' }}>
            殿堂入り投資家
          </div>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', marginTop: '8px' }}>
            全課程を制覇した者のみが刻まれる
          </div>
        </div>

        {/* 盾3枚 */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', alignItems: 'flex-end', maxWidth: '600px', margin: '0 auto' }}>

          {/* 2位 シルバー */}
          <div style={{ width: '140px', textAlign: 'center' }}>
            <svg width="100" height="120" viewBox="0 0 100 120" style={{ margin: '0 auto', display: 'block', animation: 'silverGlow 4s ease-in-out infinite', filter: 'drop-shadow(0 0 10px rgba(192,192,192,0.5))' }}>
              <defs>
                <linearGradient id="silverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#E8E8E8" />
                  <stop offset="50%" stopColor="#C0C0C0" />
                  <stop offset="100%" stopColor="#888888" />
                </linearGradient>
              </defs>
              <path d="M50 5 L90 20 L90 60 Q90 95 50 115 Q10 95 10 60 L10 20 Z" fill="url(#silverGrad)" stroke="rgba(255,255,255,0.3)" strokeWidth="1"/>
              <path d="M50 18 L78 30 L78 58 Q78 84 50 100 Q22 84 22 58 L22 30 Z" fill="rgba(0,0,0,0.2)"/>
              <text x="50" y="62" textAnchor="middle" fill="white" fontSize="28" fontWeight="700" fontFamily="serif">2</text>
              <text x="50" y="78" textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize="8" letterSpacing="2">SILVER</text>
            </svg>
            {rankings[1] ? (
              <div>
                <div style={{ fontSize: '13px', color: '#C0C0C0', fontWeight: 600, marginTop: '12px' }}>{rankings[1].user_name}</div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>{rankings[1].rate}%</div>
              </div>
            ) : (
              <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.2)', marginTop: '12px' }}>---</div>
            )}
          </div>

          {/* 1位 ゴールド */}
          <div style={{ width: '160px', textAlign: 'center' }}>
            <svg width="40" height="24" viewBox="0 0 40 24" style={{ margin: '0 auto', display: 'block', marginBottom: '4px', animation: 'float 3s ease-in-out infinite' }}>
              <polygon points="0,24 8,8 20,20 32,0 40,24" fill="#D4AF37" opacity="0.9"/>
              <circle cx="0" cy="24" r="3" fill="#D4AF37"/>
              <circle cx="20" cy="20" r="3" fill="#D4AF37"/>
              <circle cx="40" cy="24" r="3" fill="#D4AF37"/>
            </svg>
            <svg width="120" height="140" viewBox="0 0 100 120" style={{ margin: '0 auto', display: 'block', animation: 'shieldGlow 3s ease-in-out infinite', filter: 'drop-shadow(0 0 20px rgba(212,175,55,0.8))' }}>
              <defs>
                <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFE566" />
                  <stop offset="50%" stopColor="#D4AF37" />
                  <stop offset="100%" stopColor="#9A7B00" />
                </linearGradient>
                <linearGradient id="goldInner" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="rgba(255,229,102,0.3)" />
                  <stop offset="100%" stopColor="rgba(154,123,0,0.3)" />
                </linearGradient>
              </defs>
              <path d="M50 5 L90 20 L90 60 Q90 95 50 115 Q10 95 10 60 L10 20 Z" fill="url(#goldGrad)" stroke="rgba(255,229,102,0.5)" strokeWidth="1.5"/>
              <path d="M50 18 L78 30 L78 58 Q78 84 50 100 Q22 84 22 58 L22 30 Z" fill="url(#goldInner)"/>
              <text x="50" y="60" textAnchor="middle" fill="white" fontSize="30" fontWeight="700" fontFamily="serif">1</text>
              <text x="50" y="76" textAnchor="middle" fill="rgba(255,255,255,0.8)" fontSize="8" letterSpacing="2">GOLD</text>
              <circle cx="50" cy="26" r="4" fill="rgba(255,229,102,0.6)"/>
            </svg>
            {rankings[0] ? (
              <div>
                <div style={{ fontSize: '15px', color: '#D4AF37', fontWeight: 700, marginTop: '12px' }}>{rankings[0].user_name}</div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>{rankings[0].rate}%</div>
              </div>
            ) : (
              <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.2)', marginTop: '12px' }}>---</div>
            )}
          </div>

          {/* 3位 ブロンズ */}
          <div style={{ width: '140px', textAlign: 'center' }}>
            <svg width="90" height="110" viewBox="0 0 100 120" style={{ margin: '0 auto', display: 'block', animation: 'bronzeGlow 5s ease-in-out infinite', filter: 'drop-shadow(0 0 8px rgba(205,127,50,0.5))' }}>
              <defs>
                <linearGradient id="bronzeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#E8A060" />
                  <stop offset="50%" stopColor="#CD7F32" />
                  <stop offset="100%" stopColor="#8B4513" />
                </linearGradient>
              </defs>
              <path d="M50 5 L90 20 L90 60 Q90 95 50 115 Q10 95 10 60 L10 20 Z" fill="url(#bronzeGrad)" stroke="rgba(232,160,96,0.3)" strokeWidth="1"/>
              <path d="M50 18 L78 30 L78 58 Q78 84 50 100 Q22 84 22 58 L22 30 Z" fill="rgba(0,0,0,0.2)"/>
              <text x="50" y="62" textAnchor="middle" fill="white" fontSize="28" fontWeight="700" fontFamily="serif">3</text>
              <text x="50" y="78" textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize="8" letterSpacing="2">BRONZE</text>
            </svg>
            {rankings[2] ? (
              <div>
                <div style={{ fontSize: '13px', color: '#CD7F32', fontWeight: 600, marginTop: '12px' }}>{rankings[2].user_name}</div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>{rankings[2].rate}%</div>
              </div>
            ) : (
              <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.2)', marginTop: '12px' }}>---</div>
            )}
          </div>
        </div>

        {/* 盾下メッセージ */}
        <div style={{ textAlign: 'center', marginTop: '32px', padding: '16px', border: '1px solid rgba(212,175,55,0.15)', borderRadius: '12px', maxWidth: '400px', margin: '32px auto 0' }}>
          <div style={{ fontSize: '11px', color: 'rgba(212,175,55,0.5)', letterSpacing: '3px', marginBottom: '8px' }}>NOTICE</div>
          <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', lineHeight: '1.7' }}>
            まだ全課程を終了したユーザーはいません。<br/>
            最初の殿堂入り投資家になれるか。
          </div>
        </div>
      </div>

      {/* ゾーン2: ランキング表 */}
      <div style={{ background: '#0F172A', padding: '32px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', maxWidth: '600px', margin: '0 auto 24px' }}>
          <div style={{ width: '3px', height: '20px', background: 'linear-gradient(180deg, #D4AF37, transparent)', borderRadius: '2px' }} />
          <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', letterSpacing: '2px' }}>RANKING</div>
          <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, rgba(212,175,55,0.3), transparent)' }} />
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)' }}>
            全{rankings.length}名挑戦中
          </div>
        </div>

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
          </div>
        )}
      </div>

      {/* ゾーン3: IQ500 CHALLENGE */}
      <div style={{ background: 'linear-gradient(180deg, #0F172A 0%, #080808 100%)', padding: '48px 24px 64px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '15%', right: '8%', width: '3px', height: '3px', borderRadius: '50%', background: 'rgba(212,175,55,0.4)', animation: 'goldBreath 4s ease-in-out infinite', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '50%', left: '5%', width: '2px', height: '2px', borderRadius: '50%', background: 'rgba(212,175,55,0.3)', animation: 'goldBreath 6s ease-in-out infinite', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '20%', right: '12%', width: '4px', height: '4px', borderRadius: '50%', background: 'rgba(212,175,55,0.2)', animation: 'goldBreath 5s ease-in-out infinite', pointerEvents: 'none' }} />

        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ fontSize: '10px', color: 'rgba(212,175,55,0.6)', letterSpacing: '5px', marginBottom: '12px' }}>
            BEYOND EXTREME
          </div>
          <div style={{ fontSize: '22px', fontWeight: '700', color: '#D4AF37', letterSpacing: '2px' }}>
            IQ500 CHALLENGE
          </div>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', marginTop: '10px', lineHeight: '1.8' }}>
            これを解けた者はまだいない<br/>
            本物の投資家・経済学者・MBAホルダーでも唸る3問
          </div>
        </div>

        <div style={{ maxWidth: '560px', margin: '0 auto' }}>

          {/* カード1 */}
          <div style={{ background: 'linear-gradient(135deg, rgba(15,5,0,0.95), rgba(5,5,15,0.95))', border: '1px solid rgba(212,175,55,0.5)', borderRadius: '20px', padding: '32px', marginBottom: '16px', position: 'relative', overflow: 'hidden', animation: 'iqPulse 4s ease-in-out infinite' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '1px', background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid #D4AF37', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '700', color: '#D4AF37' }}>I</div>
              <div style={{ fontSize: '10px', color: 'rgba(212,175,55,0.6)', letterSpacing: '3px' }}>QUESTION 01</div>
              <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, rgba(212,175,55,0.3), transparent)' }} />
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.2)', letterSpacing: '1px' }}>IRR・DCF</div>
            </div>
            <div style={{ fontSize: '16px', color: 'rgba(255,255,255,0.9)', lineHeight: '1.8', marginBottom: '20px', fontWeight: '500' }}>
              ある投資家がNOI利回り6%・LTV70%・金利2.5%（元利均等30年）の条件で物件を取得した。
              5年後にキャップレートが6%→4.5%に圧縮された場合、
              自己資金に対するIRR（税引き前）として最も近い値はどれか。
              ただし年間NOIは一定・売却コストは売却価格の3%とする。
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {['約14%', '約22%', '約31%', '約8%'].map((choice, idx) => (
                <div key={idx} style={{ padding: '14px', border: '1px solid rgba(212,175,55,0.15)', borderRadius: '10px', color: 'rgba(255,255,255,0.6)', fontSize: '15px', marginBottom: '8px', background: 'rgba(255,255,255,0.02)' }}>
                  {choice}
                </div>
              ))}
            </div>
            <div style={{ marginTop: '20px', padding: '14px', background: 'rgba(212,175,55,0.05)', border: '1px solid rgba(212,175,55,0.1)', borderRadius: '10px' }}>
              <div style={{ fontSize: '10px', color: 'rgba(212,175,55,0.5)', letterSpacing: '2px', marginBottom: '6px' }}>AI HINT</div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', lineHeight: '1.7' }}>
                FCR・K%・キャップレート圧縮益・売却コストを全て織り込んだ複合計算が必要。
                MBAのファイナンス試験レベル。
              </div>
            </div>
          </div>

          {/* カード2 */}
          <div style={{ background: 'linear-gradient(135deg, rgba(15,5,0,0.95), rgba(5,5,15,0.95))', border: '1px solid rgba(212,175,55,0.5)', borderRadius: '20px', padding: '32px', marginBottom: '16px', position: 'relative', overflow: 'hidden', animation: 'iqPulse 4s ease-in-out infinite' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '1px', background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid #D4AF37', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '700', color: '#D4AF37' }}>II</div>
              <div style={{ fontSize: '10px', color: 'rgba(212,175,55,0.6)', letterSpacing: '3px' }}>QUESTION 02</div>
              <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, rgba(212,175,55,0.3), transparent)' }} />
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.2)', letterSpacing: '1px' }}>税務・法人化</div>
            </div>
            <div style={{ fontSize: '16px', color: 'rgba(255,255,255,0.9)', lineHeight: '1.8', marginBottom: '20px', fontWeight: '500' }}>
              課税所得2,000万円の個人投資家が法人を設立し、
              役員報酬800万円・法人留保1,200万円とした場合、
              個人単体と比較した時の年間節税額として最も近いものはどれか。
              （社会保険料増加・法人設立コスト・税理士費用は除く）
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {['約180万円', '約320万円', '約95万円', '約440万円'].map((choice, idx) => (
                <div key={idx} style={{ padding: '14px', border: '1px solid rgba(212,175,55,0.15)', borderRadius: '10px', color: 'rgba(255,255,255,0.6)', fontSize: '15px', marginBottom: '8px', background: 'rgba(255,255,255,0.02)' }}>
                  {choice}
                </div>
              ))}
            </div>
            <div style={{ marginTop: '20px', padding: '14px', background: 'rgba(212,175,55,0.05)', border: '1px solid rgba(212,175,55,0.1)', borderRadius: '10px' }}>
              <div style={{ fontSize: '10px', color: 'rgba(212,175,55,0.5)', letterSpacing: '2px', marginBottom: '6px' }}>AI HINT</div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', lineHeight: '1.7' }}>
                所得税・住民税・法人税実効税率の3つを同時に計算する必要がある。中小企業診断士の財務試験頻出。
              </div>
            </div>
          </div>

          {/* カード3 */}
          <div style={{ background: 'linear-gradient(135deg, rgba(15,5,0,0.95), rgba(5,5,15,0.95))', border: '1px solid rgba(212,175,55,0.5)', borderRadius: '20px', padding: '32px', marginBottom: '16px', position: 'relative', overflow: 'hidden', animation: 'iqPulse 4s ease-in-out infinite' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '1px', background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid #D4AF37', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '700', color: '#D4AF37' }}>III</div>
              <div style={{ fontSize: '10px', color: 'rgba(212,175,55,0.6)', letterSpacing: '3px' }}>QUESTION 03</div>
              <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, rgba(212,175,55,0.3), transparent)' }} />
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.2)', letterSpacing: '1px' }}>市場分析・総合</div>
            </div>
            <div style={{ fontSize: '16px', color: 'rgba(255,255,255,0.9)', lineHeight: '1.8', marginBottom: '20px', fontWeight: '500' }}>
              人口減少率1.2%/年・空室率上昇トレンドのB市において、
              表面利回り9%・築15年・RC造・積算評価率85%の一棟マンションがある。
              10年保有・出口キャップレートを現在より1.5%高く想定した場合、
              この投資のリスク調整後期待リターンとして投資判断の分岐点となる
              借入金利の上限値として最も適切なものはどれか。
            </div>
            <div style={{ fontSize: '11px', color: 'rgba(212,175,55,0.5)', letterSpacing: '3px', marginBottom: '10px', marginTop: '20px' }}>
              YOUR ANSWER
            </div>

            {iq3Submitted === false ? (
              <div>
                <textarea
                  value={iq3Answer}
                  onChange={(e) => setIq3Answer(e.target.value)}
                  placeholder="借入金利の上限値と、その根拠・計算過程を記述してください..."
                  rows={5}
                  style={{
                    width: '100%',
                    padding: '16px',
                    fontSize: '16px',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(212,175,55,0.3)',
                    borderRadius: '12px',
                    color: 'white',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                    lineHeight: '1.7',
                    boxSizing: 'border-box',
                    outline: 'none',
                  }}
                />
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', marginTop: '8px', textAlign: 'right' }}>
                  {iq3Answer.length} 文字
                </div>
                <button
                  onClick={() => { if (iq3Answer.trim().length >= 20) setIq3Submitted(true); }}
                  style={{
                    width: '100%',
                    marginTop: '12px',
                    padding: '16px',
                    fontSize: '16px',
                    fontWeight: '700',
                    background: iq3Answer.trim().length >= 20
                      ? 'linear-gradient(135deg, #D4AF37, #c9a84c)'
                      : 'rgba(255,255,255,0.05)',
                    color: iq3Answer.trim().length >= 20 ? '#0F172A' : 'rgba(255,255,255,0.2)',
                    border: iq3Answer.trim().length >= 20
                      ? 'none'
                      : '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    cursor: iq3Answer.trim().length >= 20 ? 'pointer' : 'default',
                    letterSpacing: '1px',
                    transition: 'all 0.3s',
                  }}
                >
                  解答を提出する
                </button>
                {iq3Answer.trim().length < 20 ? (
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', textAlign: 'center', marginTop: '8px' }}>
                    根拠を含め20文字以上で記述してください
                  </div>
                ) : null}
              </div>
            ) : null}

            {iq3Submitted === true ? (
              <div style={{
                padding: '24px',
                background: 'rgba(212,175,55,0.05)',
                border: '1px solid rgba(212,175,55,0.3)',
                borderRadius: '12px',
                marginTop: '16px',
              }}>
                <div style={{ fontSize: '11px', color: 'rgba(212,175,55,0.6)', letterSpacing: '3px', marginBottom: '12px' }}>
                  AI ANALYSIS
                </div>
                <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', fontStyle: 'italic', lineHeight: '1.7', marginBottom: '16px', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', borderLeft: '2px solid rgba(212,175,55,0.3)' }}>
                  {'「'}{iq3Answer.length > 60 ? iq3Answer.slice(0, 60) + '...' : iq3Answer}{'」'}
                </div>
                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', lineHeight: '1.8', marginBottom: '16px' }}>
                  解答を受け付けました。<br/>
                  AI解析・模範解答機能は近日公開予定です。
                </div>
                <div style={{ fontSize: '12px', color: 'rgba(212,175,55,0.5)', lineHeight: '1.7', padding: '12px', background: 'rgba(212,175,55,0.05)', borderRadius: '8px' }}>
                  参考：正解は約2.1%。FCR=6%・K%=約4.7%（LTV70%・金利2.5%・30年）の条件下で、
                  キャップレート1.5%悪化による売却損をDSCR・IRRに織り込むと
                  許容できる金利上昇幅は約0.4%となり、現行金利2.5%＋0.4%＝約2.9%が上限。
                  ただし人口減少・空室率悪化のリスクプレミアムを加味すると保守的には2.1%が分岐点となる。
                </div>
              </div>
            ) : null}
          </div>

          {/* 解答送信エリア */}
          <div style={{ maxWidth: '560px', margin: '32px auto 0', textAlign: 'center' }}>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', letterSpacing: '2px', marginBottom: '16px' }}>
              COMING SOON — 解答・解説機能は近日公開
            </div>
            <div style={{ padding: '20px', border: '1px solid rgba(212,175,55,0.2)', borderRadius: '14px', background: 'rgba(212,175,55,0.03)' }}>
              <div style={{ fontSize: '13px', color: 'rgba(212,175,55,0.7)', marginBottom: '8px' }}>
                3問全問正解者には「LEGEND INVESTOR」称号を授与
              </div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', lineHeight: '1.7' }}>
                現在まで全問正解者：0名
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
