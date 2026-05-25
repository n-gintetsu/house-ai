import React from 'react';

const rankers = [
  { rank: 1, name: 'nori', score: '98,765pt', tier: 'GOLD' },
  { rank: 2, name: 'Morioka', score: '91,342pt', tier: 'SILVER' },
  { rank: 3, name: 'Takayuki', score: '87,654pt', tier: 'BRONZE' },
  { rank: 4, name: 'AI-Challenger', score: '82,019pt' },
  { rank: 5, name: 'BrainStormer', score: '79,450pt' },
  { rank: 6, name: 'QuizMaster', score: '77,331pt' },
  { rank: 7, name: 'LogicKing', score: '75,880pt' },
  { rank: 8, name: 'ThinkAI', score: '73,210pt' },
];

const tiers = [
  ['ROOKIE', '0 - 1,999pt', 'rookie'],
  ['IRON', '2,000 - 4,999pt', 'iron'],
  ['BRONZE', '5,000 - 9,999pt', 'bronze'],
  ['SILVER', '10,000 - 19,999pt', 'silver'],
  ['GOLD', '20,000 - 49,999pt', 'gold'],
  ['PLATINUM', '50,000 - 99,999pt', 'platinum'],
  ['DIAMOND', '100,000pt〜', 'diamond'],
  ['LEGEND', '頂点の証', 'legend'],
];

function HouseLogo({ size, gold }) {
  var s = size || 48;
  var color = gold ? 'url(#logoGoldGrad)' : 'rgba(212,175,55,0.9)';
  return (
    <svg width={s} height={s} viewBox="0 0 100 100" fill="none" style={{ filter: gold ? 'drop-shadow(0 0 8px rgba(212,175,55,0.8))' : 'none' }}>
      <defs>
        <linearGradient id="logoGoldGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f5e070"/>
          <stop offset="50%" stopColor="#D4AF37"/>
          <stop offset="100%" stopColor="#8B6914"/>
        </linearGradient>
      </defs>
      <polyline points="10,52 50,8 90,52" fill="none" stroke={color} strokeWidth="6" strokeLinejoin="round" strokeLinecap="round"/>
      <rect x="62" y="18" width="7" height="16" fill={color} rx="1"/>
      <rect x="44" y="22" width="12" height="10" fill="none" stroke={color} strokeWidth="2.5" rx="1"/>
      <line x1="50" y1="22" x2="50" y2="32" stroke={color} strokeWidth="1.5"/>
      <line x1="44" y1="27" x2="56" y2="27" stroke={color} strokeWidth="1.5"/>
      <line x1="15" y1="52" x2="15" y2="88" stroke={color} strokeWidth="6" strokeLinecap="round"/>
      <line x1="85" y1="52" x2="85" y2="88" stroke={color} strokeWidth="6" strokeLinecap="round"/>
      <line x1="15" y1="88" x2="85" y2="88" stroke={color} strokeWidth="6" strokeLinecap="round"/>
      <line x1="34" y1="56" x2="34" y2="84" stroke={color} strokeWidth="6" strokeLinecap="round"/>
      <line x1="66" y1="56" x2="66" y2="84" stroke={color} strokeWidth="6" strokeLinecap="round"/>
      <line x1="34" y1="70" x2="66" y2="70" stroke={color} strokeWidth="5" strokeLinecap="round"/>
    </svg>
  );
}

function MainLegendBadge() {
  return (
    <div className="main-badge-wrap">
      <div className="flare flare-one" />
      <img
        src="/shield-main.png"
        alt="shield"
        style={{
          width: '100%',
          maxWidth: '360px',
          height: 'auto',
          display: 'block',
          margin: '0 auto',
          animation: 'shieldFloat 6s ease-in-out infinite, shieldGlow 3s ease-in-out infinite'
        }}
      />
<div className="rank-no">No.1</div>
      <div className="rank-copy">知識 x 思考力 x 発想力</div>
      <div className="main-message">真の知性が、ここに証明される。</div>
    </div>
  );
}

function RankerPanel() {
  var tierColors = {
    GOLD: 'linear-gradient(135deg,#ffe98a,#a56813)',
    SILVER: 'linear-gradient(135deg,#fff,#8e99a5)',
    BRONZE: 'linear-gradient(135deg,#ffd0a0,#a95313)',
  };
  return (
    <aside className="rank-panel">
      <h2>TOP RANKERS</h2>
      {rankers.map((r) => (
        <div className={'rank-row rank-' + r.rank} key={r.rank}>
          <div className="rank-badge-mini" style={{ background: tierColors[r.tier] || 'linear-gradient(135deg,#333,#666)' }}>
            <span>{r.rank}</span>
            <div style={{ position: 'absolute', bottom: '14px', opacity: 0.6 }}>
              <HouseLogo size={16}/>
            </div>
          </div>
          <div className="rank-user">
            <strong>{r.name}</strong>
            <span>No.{r.rank}</span>
          </div>
          <div className="rank-score">{r.score}</div>
        </div>
      ))}
      <div className="and-more">... and more</div>
    </aside>
  );
}

function SmallBadge({ name, point, type }) {
  var shieldColors = {
    rookie: 'linear-gradient(135deg,#143d2f,#42b883)',
    iron: 'linear-gradient(135deg,#111,#777)',
    bronze: 'linear-gradient(135deg,#5b2708,#d98132)',
    silver: 'linear-gradient(135deg,#777,#fff)',
    gold: 'linear-gradient(135deg,#7a4d12,#fff1a8,#d9a441)',
    platinum: 'linear-gradient(135deg,#e9f3ff,#7e98b8)',
    diamond: 'linear-gradient(135deg,#0b2d66,#6fb7ff)',
    legend: 'linear-gradient(135deg,#050505,#d9a441,#050505)',
  };
  var isDark = ['rookie','iron','bronze','diamond','legend'].includes(type);
  return (
    <div className={'small-badge-card ' + type}>
      <div className="small-shield" style={{ background: shieldColors[type] || 'linear-gradient(135deg,#333,#666)' }}>
        <HouseLogo size={22} />
        <span style={{ color: isDark ? 'rgba(255,255,255,0.9)' : '#1b1204' }}>{name}</span>
      </div>
      <div className="small-name">{name}</div>
      <div className="small-point">{point}</div>
    </div>
  );
}

function InfoBox({ title, items }) {
  return (
    <div className="info-box">
      <h3>{title}</h3>
      {items.map((item) => (
        <div className="info-item" key={item}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ marginRight: '6px', flexShrink: 0 }}>
            <path d="M2 7L5.5 10.5L12 3.5" stroke="#d9a441" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {item}
        </div>
      ))}
    </div>
  );
}

export default function HouseAiRankingPage({ onBack }) {
  var badges = [
    { src: '/badge-rookie.png', label: 'ルーキー', range: '0〜1,999pt' },
    { src: '/badge-iron.png', label: 'アイアン', range: '2,000〜4,999pt' },
    { src: '/badge-bronze.png', label: 'ブロンズ', range: '5,000〜9,999pt' },
    { src: '/badge-silver.png', label: 'シルバー', range: '10,000〜19,999pt' },
    { src: '/badge-gold.png', label: 'ゴールド', range: '20,000〜49,999pt' },
    { src: '/badge-platinum.png', label: 'プラチナ', range: '50,000〜99,999pt' },
    { src: '/badge-legend.png', label: 'レジェンド', range: '頂点の証' },
  ];
  return (
    <div className="house-ai-ranking">
      <div className="particles" />

      <header className="brand-header">
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '12px 20px',
        }}>
          <div style={{
            width: 52,
            height: 52,
            borderRadius: '50%',
            border: '2px solid #c9a84c',
            overflow: 'hidden',
            boxShadow: '0 0 12px rgba(201,168,76,0.6), 0 0 24px rgba(201,168,76,0.3)',
            flexShrink: 0,
            background: '#0a0e1a',
          }}>
            <img src="/favicon-src.png" alt="logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div>
            <div style={{ color: '#c9a84c', fontSize: 18, fontWeight: 'bold', letterSpacing: 2, lineHeight: 1.2 }}>HOUSE-AI</div>
            <div style={{ color: '#64748b', fontSize: 10, letterSpacing: 1.5 }}>知性が未来を創る。</div>
          </div>
        </div>
        {onBack ? (
          <button onClick={onBack} style={{ marginLeft: 'auto', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '8px 16px', color: 'rgba(255,255,255,0.6)', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>
            戻る
          </button>
        ) : null}
      </header>

      <main className="hero-grid">
        <section className="badge-stage">
          <MainLegendBadge />
        </section>

        <section className="hero-copy">
          <div className="eyebrow">挑戦者求む。知識とひらめきの頂点へ。</div>
          <h1>超難問ランキング</h1>
          <p className="english">ULTIMATE CHALLENGE RANKING</p>
          <div className="gold-ribbon">限界を超えろ、頭脳のエリートへ。</div>

          <div className="feature-grid">
            {[
              ['M', '超難問に挑戦', '選び抜かれた最難関の問題群'],
              ['R', 'ランキングで競う', '全国の挑戦者とスコアを競え'],
              ['T', '思考力を極める', '解くほどに知性が進化する'],
              ['C', '称号を獲得', '実力の証をプロフィールに刻む'],
            ].map((item) => (
              <div className="feature-card" key={item[1]}>
                <div className="feature-icon">
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                    <circle cx="14" cy="14" r="12" stroke="#d9a441" strokeWidth="1.5" fill="rgba(217,164,65,0.08)"/>
                    <text x="14" y="19" textAnchor="middle" fontSize="13" fontWeight="700" fill="#d9a441" fontFamily="monospace">{item[0]}</text>
                  </svg>
                </div>
                <h3>{item[1]}</h3>
                <p>{item[2]}</p>
              </div>
            ))}
          </div>
        </section>

        <RankerPanel />
      </main>

      <section className="badge-list-section">
        <div className="section-title">CHALLENGER BADGES</div>
        <div className="challenger-badges-grid">
          {badges.map((b) => (
            <div key={b.label} className="challenger-badge-item">
              <img src={b.src} alt={b.label} />
              <span className="badge-label">{b.label}</span>
              <span className="badge-range">{b.range}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="bottom-grid">
        <div className="cta-block">
          <div className="cta-text">今すぐ挑戦 &gt;&gt;&gt;</div>
          <p>あなたの知性が、未来を変える。さあ、超難問の扉を開けよう。</p>
          <button>HOUSE-AI 超難問ランキング</button>
        </div>

        <InfoBox
          title="ランキングルール"
          items={[
            '全国オリジナルの超難問',
            '制限時間内の正答でスコア獲得',
            '難易度に応じたポイント設計',
            '不正行為は永久BAN対象',
          ]}
        />

        <InfoBox
          title="ランキング特典"
          items={[
            '限定バッジ・称号の獲得',
            '上位者は殿堂入り表示',
            '限定イベント・特典へ招待',
            'HOUSE-AIからの特別オファー',
          ]}
        />
      </section>

      <section style={{
        marginTop: '40px',
        background: 'linear-gradient(135deg, rgba(0,0,0,0.9), rgba(10,5,0,0.95))',
        border: '1px solid rgba(212,175,55,0.4)',
        borderRadius: '20px',
        padding: '40px 32px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:'400px', height:'200px', background:'radial-gradient(ellipse,rgba(212,175,55,0.08),transparent 70%)', pointerEvents:'none' }} />

        <div style={{ textAlign:'center', marginBottom:'32px' }}>
          <div style={{ fontSize:'10px', color:'rgba(212,175,55,0.5)', letterSpacing:'5px', fontFamily:'monospace', marginBottom:'8px' }}>BEYOND EXTREME</div>
          <div style={{ fontSize:'28px', fontWeight:'900', color:'#D4AF37', letterSpacing:'4px', marginBottom:'4px', textShadow:'0 0 20px rgba(212,175,55,0.5)' }}>IQ 500 CHALLENGE</div>
          <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.4)', letterSpacing:'2px' }}>ネットで調べても解けない・本物の投資家だけが解ける領域</div>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'16px' }}>
          {[
            {
              num:'01',
              title:'不動産DCF最適化問題',
              desc:'NOI成長率・ターミナルキャップレート・WACC・レバレッジ効果を同時最適化し、IRR最大化のための最適LTV比率を導出せよ。',
              tag:'DCF / IRR / WACC',
            },
            {
              num:'02',
              title:'税務ストラクチャー設計',
              desc:'個人・法人・信託を組み合わせた複合ストラクチャーで、相続税・譲渡税・法人税の合計税負担を最小化する最適な資産移転スキームを設計せよ。',
              tag:'法人化 / 信託 / 相続',
            },
            {
              num:'03',
              title:'市場分析・総合判断',
              desc:'人口減少1.2%/年・空室率上昇のB市において、表面利回り9%・築15年・RC造・積算評価率85%の一棟マンション。10年保有・出口キャップレートを現在より1.5%高く想定した場合、このIRRの分岐点となる借入金利の上限値はいくらか。',
              tag:'IRR / DCF / 融資戦略',
              isFree: true,
            },
          ].map((q, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.02)',
              border: i === 2 ? '1px solid rgba(212,175,55,0.5)' : '1px solid rgba(212,175,55,0.2)',
              borderRadius: '16px',
              padding: '24px',
              position: 'relative',
              overflow: 'hidden',
            }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'12px' }}>
                <div style={{ fontSize:'10px', color:'rgba(212,175,55,0.5)', letterSpacing:'3px', fontFamily:'monospace' }}>QUESTION {q.num}</div>
                {i === 2 ? (
                  <div style={{ fontSize:'9px', padding:'3px 8px', background:'rgba(212,175,55,0.15)', border:'1px solid rgba(212,175,55,0.4)', borderRadius:'4px', color:'#D4AF37', letterSpacing:'1px' }}>自由記述式</div>
                ) : (
                  <div style={{ fontSize:'9px', padding:'3px 8px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'4px', color:'rgba(255,255,255,0.3)', letterSpacing:'1px' }}>LOCKED</div>
                )}
              </div>

              <div style={{ fontSize:'10px', color:'rgba(212,175,55,0.6)', marginBottom:'10px', fontFamily:'monospace' }}>{q.tag}</div>

              <div style={{ fontSize:'15px', fontWeight:'700', color:'white', marginBottom:'10px', lineHeight:'1.4' }}>{q.title}</div>

              <div style={{
                fontSize:'12px',
                color:'rgba(255,255,255,0.55)',
                lineHeight:'1.7',
                filter: i !== 2 ? 'blur(3px)' : 'none',
                userSelect: i !== 2 ? 'none' : 'auto',
              }}>{q.desc}</div>

              {i !== 2 ? (
                <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:'6px' }}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <rect x="3" y="9" width="14" height="10" rx="2" stroke="rgba(212,175,55,0.6)" strokeWidth="1.5"/>
                    <path d="M6 9V6.5C6 4.6 7.8 3 10 3C12.2 3 14 4.6 14 6.5V9" stroke="rgba(212,175,55,0.6)" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  <div style={{ fontSize:'10px', color:'rgba(212,175,55,0.5)', letterSpacing:'2px', fontFamily:'monospace' }}>IQ500認定者のみ</div>
                </div>
              ) : null}
            </div>
          ))}
        </div>

        <div style={{ textAlign:'center', marginTop:'24px', fontSize:'11px', color:'rgba(255,255,255,0.25)', letterSpacing:'2px' }}>
          EXTREME全問正解者のみ閲覧可能 — IQ500認定への最終関門
        </div>
      </section>

      <style>{css}</style>
    </div>
  );
}

var css = `
.house-ai-ranking {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  color: #f7f2df;
  background:
    radial-gradient(circle at 18% 20%, rgba(217,164,65,.24), transparent 26%),
    radial-gradient(circle at 72% 30%, rgba(0,56,105,.28), transparent 30%),
    linear-gradient(135deg, #02030a 0%, #07101d 45%, #02030a 100%);
  padding: 28px;
  font-family: "Times New Roman", "Noto Serif JP", serif;
}
.particles {
  position: absolute; inset: 0; opacity: .35; pointer-events: none;
  background-image:
    radial-gradient(circle, rgba(255,228,128,.8) 1px, transparent 1.5px),
    radial-gradient(circle, rgba(255,255,255,.5) 1px, transparent 1.2px);
  background-size: 90px 90px, 140px 140px;
  animation: particleMove 28s linear infinite;
}
@keyframes particleMove { from{transform:translateY(0)} to{transform:translateY(-180px)} }
.brand-header {
  position: relative; z-index: 2; display: flex; align-items: center;
  justify-content: flex-start; gap: 18px; margin-bottom: 32px; padding: 0 8px;
}
.brand-mark {
  width: 56px; height: 56px; display: grid; place-items: center;
  border: 2px solid #d9a441; border-radius: 14px;
  box-shadow: 0 0 20px rgba(217,164,65,.45); flex-shrink: 0;
}
.brand-name { font-size: clamp(20px,2.5vw,36px); letter-spacing: .08em; color: #fff1a8; text-shadow: 0 0 18px rgba(217,164,65,.7); white-space: nowrap; }
.brand-sub { color: #d9a441; letter-spacing: .15em; font-size: 11px; white-space: nowrap; }
.hero-grid {
  position: relative; z-index: 2;
  display: grid; grid-template-columns: 320px 1fr 300px; gap: 32px; align-items: start; padding-top: 0;
}
.badge-stage { min-height: auto; display: flex; align-items: flex-start; justify-content: center; padding-top: 0; }
.main-badge-wrap { position: relative; width: 340px; text-align: center; filter: drop-shadow(0 35px 55px rgba(0,0,0,.75)); padding-bottom: 20px; }
.main-badge {
  width: 280px; height: 350px; margin: 0 auto; position: relative;
  clip-path: polygon(50% 0%,88% 13%,88% 57%,50% 100%,12% 57%,12% 13%);
  background: linear-gradient(120deg,#5d3608,#ffe889 18%,#b87918 38%,#fff6b8 55%,#7a4d12 74%,#ffda5e);
  padding: 14px; animation: badgeGlow 3.8s ease-in-out infinite;
}
@keyframes badgeGlow {
  0%,100%{filter:brightness(1);transform:translateY(0)}
  50%{filter:brightness(1.18);transform:translateY(-8px)}
}
.badge-inner {
  position: absolute; inset: 18px;
  clip-path: polygon(50% 0%,84% 14%,84% 56%,50% 92%,16% 56%,16% 14%);
  background: radial-gradient(circle at 30% 20%,#fff8c9,transparent 28%), linear-gradient(110deg,#9b6a18,#f7df82 35%,#ffeeb0 50%,#b17a22 75%,#f9d466);
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; padding: 20px 12px;
}
.badge-shine {
  position: absolute; inset: -40%;
  background: linear-gradient(115deg,transparent 35%,rgba(255,255,255,.75) 48%,transparent 58%);
  transform: translateX(-70%) rotate(12deg);
  animation: shinePass 4.5s ease-in-out infinite; z-index: 5;
}
@keyframes shinePass {
  0%,45%{transform:translateX(-80%) rotate(12deg)}
  70%,100%{transform:translateX(80%) rotate(12deg)}
}
.badge-brand { font-size: 20px; color: #2b1a05; font-weight: 900; letter-spacing: .02em; margin-top: 4px; white-space: nowrap; }
.badge-caption { color: #2b1a05; font-size: 9px; letter-spacing: .08em; text-align: center; line-height: 1.4; padding: 0 8px; word-break: keep-all; }
.blue-ribbon {
  position: absolute; width: 190px; height: 50px; bottom: 190px;
  background: linear-gradient(90deg,#001c38,#00608e,#001b35);
  border: 1px solid #d9a441; box-shadow: 0 15px 30px rgba(0,0,0,.65); z-index: -1;
}
.blue-ribbon.left { left:-20px; transform:rotate(-14deg); border-radius:999px 30px 30px 999px; }
.blue-ribbon.right { right:-20px; transform:rotate(14deg); border-radius:30px 999px 999px 30px; }
.flare { position:absolute; width:95px; height:95px; background:radial-gradient(circle,#fff 0%,#ffe07a 20%,transparent 60%); z-index:8; animation:flarePulse 2.8s ease-in-out infinite; }
.flare-one { left:82px; top:20px; }
@keyframes flarePulse { 0%,100%{opacity:.65;transform:scale(.9)} 50%{opacity:1;transform:scale(1.2)} }
.rank-no { margin-top:16px; font-size:64px; color:#fff1a8; text-shadow:0 0 24px rgba(217,164,65,.8); line-height:1; }
.rank-copy { color:#d9a441; font-size:15px; margin-top:4px; line-height:1.4; }
.main-message { margin-top:16px; font-size:clamp(16px,1.8vw,24px); color:#ffe58a; text-shadow:0 0 20px rgba(217,164,65,.5); white-space:nowrap; }
.hero-copy { text-align:center; }
.eyebrow { color:#d9a441; font-size:14px; margin-bottom:12px; white-space:nowrap; }
.hero-copy h1 { font-size:clamp(28px,3.5vw,56px); margin:0 0 8px; color:#fff1a8; text-shadow:0 0 32px rgba(217,164,65,.65); letter-spacing:.06em; line-height:1.1; white-space:nowrap; }
.english { color:#d9a441; letter-spacing:.3em; font-size:13px; white-space:nowrap; }
.gold-ribbon {
  display:inline-block; margin:20px auto; padding:14px 40px; color:#1b1204;
  font-weight:900; font-size:18px;
  background:linear-gradient(90deg,#8b5a16,#fff1a8,#d9a441,#fff7c2,#8b5a16);
  clip-path:polygon(7% 0,93% 0,100% 50%,93% 100%,7% 100%,0 50%);
  box-shadow:0 0 26px rgba(217,164,65,.45);
  white-space:nowrap;
}
.feature-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; margin-top:20px; }
.feature-card, .rank-panel, .badge-list-section, .info-box, .cta-block {
  background:rgba(5,8,15,.78); border:1px solid rgba(217,164,65,.42);
  box-shadow:inset 0 0 28px rgba(217,164,65,.08),0 18px 40px rgba(0,0,0,.5);
  backdrop-filter:blur(10px);
}
.feature-card { padding:24px 14px; border-radius:16px; transition:.25s ease; }
.feature-card:hover { transform:translateY(-6px); box-shadow:0 0 30px rgba(217,164,65,.35); }
.feature-icon { margin-bottom:8px; }
.feature-card h3 { color:#fff1a8; margin-bottom:8px; font-size:12px; line-height:1.4; word-break:keep-all; }
.feature-card p { color:#d4d4d8; font-size:11px; line-height:1.5; }
.rank-panel { border-radius:22px; padding:22px; max-height:600px; overflow-y:auto; }
.rank-panel h2, .section-title, .info-box h3 {
  color:#fff1a8; letter-spacing:.22em; border-bottom:1px solid rgba(217,164,65,.35); padding-bottom:14px; margin-bottom:12px;
}
.rank-row { display:grid; grid-template-columns:56px 1fr auto; align-items:center; gap:12px; padding:14px 0; border-bottom:1px solid rgba(217,164,65,.22); transition:.2s; }
.rank-row:hover { background:rgba(217,164,65,.08); }
.rank-badge-mini {
  width:46px; height:56px; display:grid; place-items:center; font-size:22px; font-weight:900;
  clip-path:polygon(50% 0,88% 18%,88% 62%,50% 100%,12% 62%,12% 18%);
  color:#1b1204; position:relative;
}
.rank-user strong { color:#f7f2df; display:block; font-size:14px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:140px; }
.rank-user span { color:#d9a441; font-size:12px; }
.rank-score { color:#ffe58a; font-weight:900; font-size:16px; white-space:nowrap; }
.and-more { text-align:right; color:#d4d4d8; padding-top:14px; font-size:13px; }
.badge-list-section { position:relative; z-index:2; border-radius:22px; padding:22px; margin-top:34px; }
.section-title { font-size:16px; font-weight:700; letter-spacing:.3em; }
.tier-grid { display:grid; grid-template-columns:repeat(8,1fr); gap:18px; margin-top:22px; }
.small-badge-card { text-align:center; }
.small-shield {
  height:128px; max-width:110px; margin:0 auto 10px; display:grid; place-items:center;
  clip-path:polygon(50% 0,88% 17%,88% 60%,50% 100%,12% 60%,12% 17%);
  color:#fff; border:1px solid rgba(255,255,255,.4);
  box-shadow:0 0 22px rgba(255,255,255,.15); position:relative; transition:.25s;
}
.small-shield:hover { transform:translateY(-4px); filter:brightness(1.15); }
.small-shield span { position:absolute; bottom:26px; font-size:10px; letter-spacing:.08em; font-weight:700; }
.small-name { color:#fff1a8; font-size:13px; }
.small-point { color:#d4d4d8; font-size:12px; }
.bottom-grid { position:relative; z-index:2; display:grid; grid-template-columns:1.5fr .75fr .75fr; gap:20px; margin-top:24px; }
.cta-block, .info-box { border-radius:18px; padding:24px; }
.cta-text { color:#ffe58a; font-size:28px; font-weight:900; margin-bottom:8px; }
.cta-block p { color:#d4d4d8; margin-bottom:12px; font-size:14px; }
.cta-block button {
  width:100%; margin-top:8px; padding:16px; border-radius:12px;
  border:1px solid #d9a441; background:rgba(0,0,0,.45); color:#fff1a8;
  font-size:17px; cursor:pointer; font-family:inherit;
  animation:ctaPulse 2.5s ease-in-out infinite;
}
@keyframes ctaPulse { 0%,100%{box-shadow:0 0 0 rgba(217,164,65,0)} 50%{box-shadow:0 0 28px rgba(217,164,65,.45)} }
.info-item { color:#e5e7eb; margin:12px 0; display:flex; align-items:flex-start; font-size:14px; }
@media(max-width:1100px){
  .hero-grid{grid-template-columns:1fr}
  .bottom-grid{grid-template-columns:1fr}
  .feature-grid{grid-template-columns:repeat(2,1fr)}
  .tier-grid{grid-template-columns:repeat(4,1fr)}
  .badge-stage{min-height:auto;margin:0 auto;max-width:380px}
  .hero-copy h1{white-space:normal;font-size:clamp(32px,6vw,56px)}
  .main-message{white-space:normal}
  .eyebrow{white-space:normal}
  .english{white-space:normal;letter-spacing:.15em}
  .gold-ribbon{white-space:normal;font-size:16px;padding:12px 24px}
}
@media(max-width:640px){
  .house-ai-ranking{padding:18px}
  .main-badge{width:230px;height:300px}
  .blue-ribbon{display:none}
  .rank-no{font-size:54px}
  .feature-grid,.tier-grid{grid-template-columns:repeat(2,1fr)}
  .hero-copy h1{font-size:44px}
  .english{letter-spacing:.22em}
  .gold-ribbon{font-size:18px;padding:12px 28px}
}
@keyframes shieldFloat { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-14px)} }
@keyframes shieldGlow { 0%,100%{filter:drop-shadow(0 0 20px rgba(201,168,76,.5))} 50%{filter:drop-shadow(0 0 55px rgba(201,168,76,1.0)) brightness(1.1)} }
`;
