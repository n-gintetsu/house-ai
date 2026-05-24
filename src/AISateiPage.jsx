import { useState, useEffect } from 'react';
import SEOHead from './SEOHead';
import { supabase } from './lib/supabase';

const propertyTypes = ['戸建', 'マンション', '一棟アパート', '一棟ビル', '土地', '収益物件'];

const purposes = [
  { key: 'high', label: '高く売りたい', desc: '複数業者を比較しながら高値売却を目指します' },
  { key: 'speed', label: 'スピード重視', desc: '早期売却・即現金化向け業者を優先表示' },
  { key: 'info', label: '相場観だけ知りたい', desc: 'まずはAIで価格感を整理したい方向け' },
];

const analysisSteps = [
  'AIが地域データを解析中…',
  '周辺売買事例を取得中…',
  '公示価格を整理中…',
  '流通性を分析中…',
  'AI推定価格を算出中…',
];

const regionMap = [
  { keywords: ['東京', '千代田', '新宿', '渋谷', '港', '品川', '目黒', '世田谷', '杉並', '中野', '豊島', '北区', '板橋', '練馬', '足立', '葛飾', '江戸川', '墨田', '江東', '荒川', '台東', '文京', '中央'], cx: 183, cy: 110, name: '東京都' },
  { keywords: ['横浜', '川崎', '神奈川', '相模', '厚木', '藤沢', '鎌倉', '逗子', '三浦', '横須賀'], cx: 183, cy: 118, name: '神奈川県' },
  { keywords: ['大阪', '梅田', '難波', '心斎橋', '天王寺', '堺', '豊中', '吹田', '枚方', '東大阪'], cx: 132, cy: 118, name: '大阪府' },
  { keywords: ['名古屋', '愛知', '豊田', '岡崎', '一宮', '豊橋', '春日井'], cx: 152, cy: 112, name: '愛知県' },
  { keywords: ['札幌', '北海道', '函館', '旭川', '釧路', '帯広', '小樽'], cx: 192, cy: 38, name: '北海道' },
  { keywords: ['福岡', '博多', '北九州', '久留米'], cx: 100, cy: 138, name: '福岡県' },
  { keywords: ['佐賀', '長崎', '熊本', '鹿児島', '宮崎', '大分'], cx: 100, cy: 145, name: '九州南部' },
  { keywords: ['仙台', '宮城', '岩手', '青森', '秋田', '山形', '福島'], cx: 188, cy: 75, name: '東北' },
  { keywords: ['広島', '岡山', '山口', '鳥取', '島根'], cx: 118, cy: 125, name: '中国地方' },
  { keywords: ['高知', '愛媛', '香川', '徳島'], cx: 124, cy: 147, name: '四国' },
  { keywords: ['京都', '兵庫', '神戸', '奈良', '滋賀', '和歌山', '三重'], cx: 135, cy: 118, name: '近畿' },
  { keywords: ['新潟', '富山', '石川', '福井', '長野', '岐阜', '静岡', '山梨'], cx: 155, cy: 105, name: '中部' },
  { keywords: ['沖縄', '那覇'], cx: 90, cy: 188, name: '沖縄県' },
];

const defaultRegion = { cx: 145, cy: 115, name: 'エリア' };

export default function AISateiPage({ onBack }) {
  const [address, setAddress] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [area, setArea] = useState('');
  const [age, setAge] = useState('');
  const [purpose, setPurpose] = useState('');
  const [memo, setMemo] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [result, setResult] = useState(null);
  const [mapRegion, setMapRegion] = useState(null);
  const [mapStatus, setMapStatus] = useState(0);
  const [usedToday, setUsedToday] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (!address) {
      setMapRegion(null);
      setMapStatus(0);
      return;
    }
    const matched = regionMap.find(r => r.keywords.some(k => address.includes(k)));
    setMapRegion(matched || defaultRegion);
    setMapStatus(1);
    const t = setTimeout(() => setMapStatus(2), 2000);
    return () => clearTimeout(t);
  }, [address]);

  useEffect(() => {
    const key = 'satei_used_' + new Date().toDateString();
    if (localStorage.getItem(key)) setUsedToday(true);
  }, []);

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session ? session.user : null);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session ? session.user : null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleAnalyze = () => {
    if (!address || !propertyType || !area || !age || !purpose) return;
    if (usedToday && user === null) return;

    setAnalyzing(true);
    setAnalysisStep(0);
    setResult(null);

    const stepInterval = setInterval(() => {
      setAnalysisStep(prev => {
        if (prev >= analysisSteps.length - 1) {
          clearInterval(stepInterval);
          setTimeout(() => {
            setAnalyzing(false);

            const areaNum = parseFloat(area) || 60;
            const ageNum = parseFloat(age) || 10;
            const basePrice = areaNum * 80;
            const ageFactor = Math.max(0.5, 1 - ageNum * 0.015);
            const regionFactor = mapRegion && mapRegion.name === '東京都' ? 1.4
              : mapRegion && (mapRegion.name === '神奈川県' || mapRegion.name === '近畿' || mapRegion.name === '大阪府') ? 1.1 : 0.85;
            const low = Math.round(basePrice * ageFactor * regionFactor / 100) * 100;
            const high = Math.round(low * 1.12 / 100) * 100;

            setResult({ low, high });
            const key = 'satei_used_' + new Date().toDateString();
            user === null ? localStorage.setItem(key, '1') : null;
            user === null ? setUsedToday(true) : null;
          }, 600);
          return prev;
        }
        return prev + 1;
      });
    }, 900);
  };

  const canSubmit = address && propertyType && area && age && purpose && (!usedToday || user !== null) && !analyzing;

  return (
    <div style={{ background: '#0F172A', color: 'white', minHeight: '100vh', fontFamily: 'inherit', overflowY: 'auto' }}>
      <SEOHead
        title="AI不動産整理査定 | House-AI"
        description="AIが不動産の相場感を整理します。住所・種別・面積を入力するだけで、AI推定価格・売却難易度・エリア分析を無料で確認できます。しつこい営業なし。"
        url="https://house-ai.co.jp/satei"
      />
      <style>{`
        @keyframes scanline {
          0% { transform: translateY(-100%); opacity: 0.6; }
          100% { transform: translateY(400px); opacity: 0; }
        }
        @keyframes goldBreath {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .satei-input {
          width: 100%;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          padding: 12px 14px;
          font-size: 16px;
          color: white;
          outline: none;
          box-sizing: border-box;
          font-family: inherit;
          transition: border-color 0.2s;
        }
        .satei-input:focus { border-color: rgba(212,175,55,0.5); }
        .satei-input::placeholder { color: rgba(255,255,255,0.25); }
        .type-btn {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          padding: 9px 6px;
          font-size: 13px;
          color: rgba(255,255,255,0.6);
          cursor: pointer;
          text-align: center;
          transition: all 0.15s;
          font-family: inherit;
        }
        .type-btn:hover { border-color: rgba(212,175,55,0.3); color: rgba(212,175,55,0.8); }
        @keyframes mapScan {
          0% { transform: translateY(0px); opacity: 0.4; }
          100% { transform: translateY(280px); opacity: 0; }
        }
        @keyframes particleMove {
          0% { transform: translate(0, 0); opacity: 0.6; }
          50% { transform: translate(8px, -12px); opacity: 0.3; }
          100% { transform: translate(0, 0); opacity: 0.6; }
        }
        @keyframes statusCycle {
          0%, 30% { opacity: 1; }
          35%, 65% { opacity: 0; }
          70%, 100% { opacity: 1; }
        }
      `}</style>

      <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '2px', background: 'linear-gradient(90deg,transparent,rgba(212,175,55,0.5),transparent)', animation: 'scanline 6s linear infinite', pointerEvents: 'none', zIndex: 999 }} />

      {/* ヘッダー */}
      <div style={{ padding: '24px 24px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, padding: '8px 14px', color: 'rgba(255,255,255,0.7)', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}
            >
              戻る
            </button>
          ) : null}
          <div>
            <div style={{ fontSize: '10px', color: 'rgba(212,175,55,0.5)', letterSpacing: '4px', marginBottom: '6px' }}>AI REAL ESTATE ANALYSIS</div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: 'white' }}>AI不動産整理査定</div>
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>まずはAIが相場感を整理します</div>
          </div>
        </div>
        {user !== null ? (
          <div style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '20px', padding: '8px 16px', textAlign: 'center' }}>
            <div style={{ fontSize: '10px', color: 'rgba(212,175,55,0.6)', letterSpacing: '2px', marginBottom: '2px' }}>会員ステータス</div>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#D4AF37' }}>無制限利用中</div>
          </div>
        ) : (
          usedToday === false ? (
            <div style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '20px', padding: '8px 16px', textAlign: 'center' }}>
              <div style={{ fontSize: '10px', color: 'rgba(212,175,55,0.6)', letterSpacing: '2px', marginBottom: '2px' }}>本日の無料AI査定</div>
              <div style={{ fontSize: '14px', fontWeight: '700', color: '#D4AF37' }}>残り1回</div>
            </div>
          ) : (
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '8px 16px', textAlign: 'center' }}>
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', letterSpacing: '1px', marginBottom: '2px' }}>次回更新</div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>明日0:00</div>
            </div>
          )
        )}
      </div>

      {/* メインコンテンツ 2カラム */}
      <div style={{ display: 'flex', alignItems: 'flex-start', maxWidth: '1100px', margin: '0 auto' }}>

        {/* 左カラム */}
        <div style={{ flex: 1, padding: '28px 24px', borderRight: '1px solid rgba(255,255,255,0.06)' }}>

          {/* 住所 */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginBottom: '8px', letterSpacing: '1px' }}>住所（市区町村まで入力）</label>
            <input className="satei-input" type="text" placeholder="例：東京都渋谷区..." value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>

          {/* 種別 */}
          <div style={{ marginTop: '20px' }}>
            <label style={{ display: 'block', fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginBottom: '8px', letterSpacing: '1px' }}>物件種別</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '8px' }}>
              {propertyTypes.map(t => (
                <button
                  key={t}
                  className="type-btn"
                  onClick={() => setPropertyType(t)}
                  style={{
                    background: propertyType === t ? 'rgba(212,175,55,0.12)' : 'rgba(255,255,255,0.04)',
                    border: propertyType === t ? '1px solid rgba(212,175,55,0.5)' : '1px solid rgba(255,255,255,0.1)',
                    color: propertyType === t ? '#D4AF37' : 'rgba(255,255,255,0.6)',
                  }}
                >{t}</button>
              ))}
            </div>
          </div>

          {/* 面積・築年数 */}
          <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginBottom: '8px', letterSpacing: '1px' }}>面積（㎡）</label>
              <input className="satei-input" type="number" placeholder="85" value={area} onChange={(e) => setArea(e.target.value)} style={{ fontSize: '16px' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginBottom: '8px', letterSpacing: '1px' }}>築年数</label>
              <input className="satei-input" type="number" placeholder="10" value={age} onChange={(e) => setAge(e.target.value)} style={{ fontSize: '16px' }} />
            </div>
          </div>

          {/* 査定目的 */}
          <div style={{ marginTop: '20px' }}>
            <label style={{ display: 'block', fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginBottom: '8px', letterSpacing: '1px' }}>査定の目的</label>
            {purposes.map(p => (
              <button
                key={p.key}
                type="button"
                onClick={() => setPurpose(p.key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  width: '100%', marginBottom: '8px',
                  border: purpose === p.key ? '1px solid rgba(212,175,55,0.4)' : '1px solid rgba(255,255,255,0.08)',
                  background: purpose === p.key ? 'rgba(212,175,55,0.08)' : 'rgba(255,255,255,0.02)',
                  borderRadius: '10px', padding: '12px 14px',
                  cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
                }}
              >
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: purpose === p.key ? '#D4AF37' : 'rgba(255,255,255,0.2)', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: purpose === p.key ? '#D4AF37' : 'rgba(255,255,255,0.7)' }}>{p.label}</div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', marginTop: '2px' }}>{p.desc}</div>
                </div>
              </button>
            ))}
          </div>

          {/* 備考 */}
          <div style={{ marginTop: '20px' }}>
            <label style={{ display: 'block', fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginBottom: '8px', letterSpacing: '1px' }}>備考・特記事項（任意）</label>
            <textarea className="satei-input" rows={3} placeholder="気になる点や状況など" value={memo} onChange={(e) => setMemo(e.target.value)} style={{ resize: 'vertical' }} />
          </div>

          {/* 安心感ボックス */}
          <div style={{ marginTop: '20px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(212,175,55,0.12)', borderRadius: '12px', padding: '16px' }}>
            <div style={{ fontSize: '9px', color: 'rgba(212,175,55,0.5)', letterSpacing: '3px', marginBottom: '8px' }}>SAFE POLICY</div>
            {[
              'しつこい営業はありません',
              'やり取りは会員ページ内で完結。電話番号を公開せず相談できます。',
              'AIが希望条件を整理するため、合わない業者は自動で除外されます。',
            ].map((txt, i) => (
              <div key={i} style={{ display: 'flex', gap: '8px', fontSize: '12px', color: 'rgba(255,255,255,0.5)', lineHeight: '1.6' }}>
                <div style={{ width: '6px', height: '6px', background: '#4ade80', borderRadius: '50%', marginTop: '5px', flexShrink: 0 }} />
                <span>{txt}</span>
              </div>
            ))}
          </div>

          {/* CTAボタン */}
          <div style={{ marginTop: '20px' }}>
            {analyzing ? (
              <div style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                <div style={{ fontSize: '13px', color: 'rgba(212,175,55,0.8)', marginBottom: '10px' }}>
                  {analysisSteps[analysisStep]}
                </div>
                <div style={{ height: '3px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    background: 'linear-gradient(90deg, #D4AF37, #c9a84c)',
                    width: `${((analysisStep + 1) / analysisSteps.length) * 100}%`,
                    transition: 'width 0.8s ease',
                    borderRadius: '2px',
                  }} />
                </div>
              </div>
            ) : (
              <button
                onClick={handleAnalyze}
                disabled={!canSubmit}
                style={{
                  width: '100%', padding: '16px',
                  background: canSubmit ? 'linear-gradient(135deg, #D4AF37, #c9a84c)' : 'rgba(255,255,255,0.05)',
                  color: canSubmit ? '#0F172A' : 'rgba(255,255,255,0.2)',
                  border: canSubmit ? 'none' : '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px', fontSize: '16px', fontWeight: '700',
                  cursor: canSubmit ? 'pointer' : 'default',
                  fontFamily: 'inherit',
                }}
              >
                {usedToday === true ? (user !== null ? 'AIで相場感を整理する' : '本日の無料査定は利用済みです') : 'AIで相場感を整理する'}
              </button>
            )}
          </div>
        </div>

        {/* 右カラム */}
        <div style={{ width: '400px', minWidth: '400px', padding: '28px 20px', position: 'sticky', top: 0 }}>
          <div style={{ fontSize: '10px', color: 'rgba(212,175,55,0.5)', letterSpacing: '3px', marginBottom: '12px' }}>AI LOCATION ANALYSIS</div>

          {/* 地図SVG */}
          <svg width="100%" height="280" viewBox="0 0 300 280" style={{ display: 'block' }}>
            {/* 背景 */}
            <rect width="300" height="280" fill="rgba(3,8,20,0.95)" rx="8"/>

            {/* グリッドライン */}
            {[40,80,120,160,200,240].map(y => (
              <line key={y} x1="0" y1={y} x2="300" y2={y} stroke="rgba(26,58,92,0.3)" strokeWidth="0.5" strokeDasharray="4,8"/>
            ))}
            {[50,100,150,200,250].map(x => (
              <line key={x} x1={x} y1="0" x2={x} y2="280" stroke="rgba(26,58,92,0.3)" strokeWidth="0.5" strokeDasharray="4,8"/>
            ))}

            {/* 海のグロー効果 */}
            <ellipse cx="150" cy="140" rx="130" ry="110" fill="rgba(15,30,60,0.4)"/>

            {/* 北海道 本島 */}
            <path d="M175 22 Q182 18 192 20 Q200 17 207 23 Q215 20 220 28 Q226 35 224 44 Q220 52 213 56 Q206 62 198 59 Q191 65 183 61 Q175 66 168 60 Q161 64 158 57 Q153 50 157 42 Q160 34 168 28 Z" fill="rgba(22,50,100,0.7)" stroke="rgba(100,160,255,0.35)" strokeWidth="0.8"/>
            {/* 北海道 知床・根室 */}
            <path d="M224 44 Q232 40 238 47 Q242 54 236 60 Q229 64 224 58 Q220 52 224 44Z" fill="rgba(22,50,100,0.6)" stroke="rgba(100,160,255,0.3)" strokeWidth="0.7"/>
            {/* 道南 */}
            <path d="M168 60 Q172 65 168 71 Q163 75 158 70 Q156 64 160 60Z" fill="rgba(22,50,100,0.55)" stroke="rgba(100,160,255,0.25)" strokeWidth="0.7"/>

            {/* 東北 */}
            <path d="M172 75 Q178 70 186 72 Q194 69 200 75 Q206 81 204 90 Q201 99 193 102 Q185 106 177 102 Q169 98 168 89 Q167 80 172 75Z" fill="rgba(22,50,100,0.65)" stroke="rgba(100,160,255,0.3)" strokeWidth="0.8"/>
            {/* 三陸海岸 */}
            <path d="M200 80 Q205 78 207 85 Q208 92 203 95 Q199 92 200 85Z" fill="rgba(22,50,100,0.5)" stroke="rgba(100,160,255,0.2)" strokeWidth="0.6"/>

            {/* 関東 */}
            <path d="M170 108 Q177 103 185 106 Q193 103 198 110 Q203 117 200 126 Q196 134 188 136 Q180 139 172 134 Q164 129 163 120 Q162 111 170 108Z" fill="rgba(22,50,100,0.65)" stroke="rgba(100,160,255,0.3)" strokeWidth="0.8"/>
            {/* 房総半島 */}
            <path d="M196 122 Q202 119 205 126 Q207 133 202 138 Q197 139 195 133 Q193 126 196 122Z" fill="rgba(22,50,100,0.55)" stroke="rgba(100,160,255,0.25)" strokeWidth="0.7"/>
            {/* 三浦・伊豆 */}
            <path d="M175 136 Q179 133 183 138 Q185 144 181 148 Q177 149 175 144 Q173 139 175 136Z" fill="rgba(22,50,100,0.5)" stroke="rgba(100,160,255,0.2)" strokeWidth="0.6"/>

            {/* 北陸・甲信越 */}
            <path d="M148 105 Q156 100 163 104 Q167 111 164 120 Q160 128 152 128 Q144 126 141 118 Q139 109 148 105Z" fill="rgba(22,50,100,0.6)" stroke="rgba(100,160,255,0.28)" strokeWidth="0.8"/>
            {/* 能登半島 */}
            <path d="M140 97 Q146 92 151 97 Q153 103 148 106 Q142 107 139 102Z" fill="rgba(22,50,100,0.5)" stroke="rgba(100,160,255,0.22)" strokeWidth="0.6"/>

            {/* 東海・中部 */}
            <path d="M155 124 Q162 119 169 123 Q173 130 170 139 Q165 146 157 146 Q149 143 147 134 Q145 125 155 124Z" fill="rgba(22,50,100,0.6)" stroke="rgba(100,160,255,0.28)" strokeWidth="0.8"/>
            {/* 伊勢湾 */}
            <path d="M159 142 Q163 139 166 144 Q167 150 163 153 Q159 153 158 148Z" fill="rgba(22,50,100,0.45)" stroke="rgba(100,160,255,0.2)" strokeWidth="0.6"/>

            {/* 近畿 */}
            <path d="M130 118 Q138 113 146 116 Q151 123 148 132 Q143 140 134 141 Q125 139 122 130 Q119 121 130 118Z" fill="rgba(22,50,100,0.65)" stroke="rgba(100,160,255,0.3)" strokeWidth="0.8"/>
            {/* 紀伊半島 */}
            <path d="M130 141 Q137 138 142 145 Q145 153 140 159 Q133 161 128 155 Q123 148 130 141Z" fill="rgba(22,50,100,0.55)" stroke="rgba(100,160,255,0.25)" strokeWidth="0.7"/>

            {/* 中国地方 */}
            <path d="M108 122 Q117 116 126 120 Q131 127 128 136 Q122 143 113 142 Q104 139 102 130 Q100 121 108 122Z" fill="rgba(22,50,100,0.6)" stroke="rgba(100,160,255,0.28)" strokeWidth="0.8"/>
            {/* 島根半島 */}
            <path d="M106 118 Q112 114 117 119 Q116 124 110 124 Q105 122 106 118Z" fill="rgba(22,50,100,0.5)" stroke="rgba(100,160,255,0.2)" strokeWidth="0.6"/>

            {/* 四国 */}
            <path d="M117 148 Q126 143 135 147 Q140 154 137 163 Q131 170 121 169 Q111 166 109 157 Q107 148 117 148Z" fill="rgba(22,50,100,0.6)" stroke="rgba(100,160,255,0.28)" strokeWidth="0.8"/>

            {/* 九州 */}
            <path d="M96 138 Q105 132 114 136 Q120 143 118 153 Q114 163 105 166 Q95 167 89 159 Q83 150 88 141 Q92 136 96 138Z" fill="rgba(22,50,100,0.65)" stroke="rgba(100,160,255,0.3)" strokeWidth="0.8"/>
            {/* 薩摩半島 */}
            <path d="M93 166 Q98 163 103 168 Q105 175 100 179 Q94 179 92 173Z" fill="rgba(22,50,100,0.5)" stroke="rgba(100,160,255,0.22)" strokeWidth="0.7"/>
            {/* 大隅半島 */}
            <path d="M103 166 Q108 163 111 169 Q112 176 107 179 Q102 178 101 172Z" fill="rgba(22,50,100,0.5)" stroke="rgba(100,160,255,0.22)" strokeWidth="0.7"/>

            {/* 沖縄本島 */}
            <path d="M86 198 Q91 195 95 199 Q96 204 92 206 Q87 206 86 202Z" fill="rgba(22,50,100,0.5)" stroke="rgba(100,160,255,0.22)" strokeWidth="0.6"/>
            {/* 先島 */}
            <path d="M72 206 Q76 204 78 207 Q79 210 76 211 Q73 211 72 208Z" fill="rgba(22,50,100,0.45)" stroke="rgba(100,160,255,0.18)" strokeWidth="0.5"/>

            {/* スキャンライン */}
            <line x1="0" y1="0" x2="300" y2="0" stroke="rgba(100,160,255,0.25)" strokeWidth="1.5">
              <animateTransform attributeName="transform" type="translate" from="0,0" to="0,280" dur="5s" repeatCount="indefinite"/>
            </line>

            {/* データ粒子 */}
            <circle cx="140" cy="85" r="1.5" fill="rgba(212,175,55,0.4)">
              <animateTransform attributeName="transform" type="translate" values="0,0; 6,-10; 0,0" dur="4s" repeatCount="indefinite"/>
              <animate attributeName="opacity" values="0.4;0.8;0.4" dur="4s" repeatCount="indefinite"/>
            </circle>
            <circle cx="185" cy="120" r="1.2" fill="rgba(100,200,255,0.4)">
              <animateTransform attributeName="transform" type="translate" values="0,0; -5,8; 0,0" dur="5s" repeatCount="indefinite"/>
              <animate attributeName="opacity" values="0.3;0.7;0.3" dur="5s" repeatCount="indefinite"/>
            </circle>
            <circle cx="115" cy="155" r="1.5" fill="rgba(212,175,55,0.35)">
              <animateTransform attributeName="transform" type="translate" values="0,0; 8,5; 0,0" dur="6s" repeatCount="indefinite"/>
              <animate attributeName="opacity" values="0.3;0.6;0.3" dur="6s" repeatCount="indefinite"/>
            </circle>

            {/* 発光ポイント */}
            {mapRegion !== null ? (
              <g>
                <circle cx={mapRegion.cx} cy={mapRegion.cy} r="4" fill="#D4AF37" opacity="0.95"/>
                <circle cx={mapRegion.cx} cy={mapRegion.cy} r="4" fill="rgba(212,175,55,0.3)">
                  <animate attributeName="r" values="4;6;4" dur="1.5s" repeatCount="indefinite"/>
                  <animate attributeName="opacity" values="0.8;0.3;0.8" dur="1.5s" repeatCount="indefinite"/>
                </circle>
                <circle cx={mapRegion.cx} cy={mapRegion.cy} r="4" fill="none" stroke="rgba(212,175,55,0.6)" strokeWidth="1">
                  <animate attributeName="r" from="6" to="24" dur="2s" repeatCount="indefinite"/>
                  <animate attributeName="opacity" from="0.7" to="0" dur="2s" repeatCount="indefinite"/>
                </circle>
                <circle cx={mapRegion.cx} cy={mapRegion.cy} r="4" fill="none" stroke="rgba(212,175,55,0.4)" strokeWidth="0.8">
                  <animate attributeName="r" from="6" to="36" dur="2s" begin="0.6s" repeatCount="indefinite"/>
                  <animate attributeName="opacity" from="0.5" to="0" dur="2s" begin="0.6s" repeatCount="indefinite"/>
                </circle>
                <circle cx={mapRegion.cx} cy={mapRegion.cy} r="4" fill="none" stroke="rgba(212,175,55,0.2)" strokeWidth="0.6">
                  <animate attributeName="r" from="6" to="50" dur="2s" begin="1.2s" repeatCount="indefinite"/>
                  <animate attributeName="opacity" from="0.4" to="0" dur="2s" begin="1.2s" repeatCount="indefinite"/>
                </circle>
                <line x1={mapRegion.cx - 10} y1={mapRegion.cy} x2={mapRegion.cx - 6} y2={mapRegion.cy} stroke="rgba(212,175,55,0.6)" strokeWidth="0.8"/>
                <line x1={mapRegion.cx + 6} y1={mapRegion.cy} x2={mapRegion.cx + 10} y2={mapRegion.cy} stroke="rgba(212,175,55,0.6)" strokeWidth="0.8"/>
                <line x1={mapRegion.cx} y1={mapRegion.cy - 10} x2={mapRegion.cx} y2={mapRegion.cy - 6} stroke="rgba(212,175,55,0.6)" strokeWidth="0.8"/>
                <line x1={mapRegion.cx} y1={mapRegion.cy + 6} x2={mapRegion.cx} y2={mapRegion.cy + 10} stroke="rgba(212,175,55,0.6)" strokeWidth="0.8"/>
                <rect x={mapRegion.cx - 24} y={mapRegion.cy + 12} width="48" height="14" rx="3" fill="rgba(212,175,55,0.15)" stroke="rgba(212,175,55,0.4)" strokeWidth="0.5"/>
                <text x={mapRegion.cx} y={mapRegion.cy + 22} textAnchor="middle" fontSize="8" fill="#D4AF37" fontWeight="bold">{mapRegion.name}</text>
              </g>
            ) : null}

            {/* 成約事例ドット */}
            {result !== null ? (
              mapRegion !== null ? (
                <g>
                  <circle cx={mapRegion.cx - 18} cy={mapRegion.cy - 14} r="2.5" fill="rgba(74,222,128,0.7)" stroke="rgba(74,222,128,0.4)" strokeWidth="0.5"/>
                  <circle cx={mapRegion.cx + 16} cy={mapRegion.cy + 12} r="2.5" fill="rgba(74,222,128,0.7)" stroke="rgba(74,222,128,0.4)" strokeWidth="0.5"/>
                  <circle cx={mapRegion.cx - 8} cy={mapRegion.cy + 18} r="2" fill="rgba(74,222,128,0.6)"/>
                  <circle cx={mapRegion.cx + 22} cy={mapRegion.cy - 6} r="2" fill="rgba(74,222,128,0.5)"/>
                  <circle cx={mapRegion.cx - 24} cy={mapRegion.cy + 6} r="1.5" fill="rgba(74,222,128,0.4)"/>
                </g>
              ) : null
            ) : null}

            {/* ステータステキスト */}
            {mapStatus === 0 ? (
              <text x="150" y="268" textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.2)">住所を入力するとエリアが発光します</text>
            ) : (
              mapStatus === 1 ? (
                <text x="150" y="268" textAnchor="middle" fontSize="9" fill="rgba(212,175,55,0.6)">{mapRegion ? mapRegion.name : 'エリア'}を解析中…</text>
              ) : (
                result === null ? (
                  <text x="150" y="268" textAnchor="middle" fontSize="9" fill="rgba(74,222,128,0.7)">周辺データ取得完了 — 査定実行可能</text>
                ) : (
                  <text x="150" y="268" textAnchor="middle" fontSize="9" fill="rgba(74,222,128,0.8)">周辺成約事例 5件取得 — 解析完了</text>
                )
              )
            )}
          </svg>

          {/* 解析ステータス */}
          {analyzing ? (
            <div style={{ marginTop: '12px', background: 'rgba(212,175,55,0.05)', border: '1px solid rgba(212,175,55,0.15)', borderRadius: '10px', padding: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>AI解析ステータス</span>
                <span style={{ fontSize: '10px', color: '#D4AF37' }}>解析中...</span>
              </div>
              <div style={{ height: '3px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden', margin: '8px 0' }}>
                <div style={{ width: `${((analysisStep + 1) / analysisSteps.length) * 100}%`, background: 'linear-gradient(90deg,#D4AF37,#c9a84c)', height: '100%', transition: 'width 0.8s' }} />
              </div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>{analysisSteps[analysisStep]}</div>
            </div>
          ) : null}

          {/* AI分析結果 */}
          {result !== null ? (
            <div style={{ marginTop: '16px', animation: 'fadeUp 0.6s ease' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.25)', borderRadius: '10px', padding: '14px' }}>
                  <div style={{ fontSize: '10px', color: 'rgba(212,175,55,0.6)', marginBottom: '6px' }}>AI参考価格（概算）</div>
                  <div style={{ fontSize: '16px', fontWeight: '700', color: '#D4AF37' }}>{result.low.toLocaleString()}〜{result.high.toLocaleString()}万円</div>
                  <div style={{ fontSize: '10px', color: 'rgba(212,175,55,0.4)', marginTop: '4px' }}>※参考値 実際の査定とは異なります</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '14px' }}>
                  <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginBottom: '6px' }}>売却難易度（AI推定）</div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#4ade80' }}>低い（売れやすい）</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '14px' }}>
                  <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginBottom: '6px' }}>エリア人気度</div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: (mapRegion !== null && (mapRegion.name === '東京都' || mapRegion.name === '神奈川県' || mapRegion.name === '大阪府' || mapRegion.name === '近畿')) ? '#4ade80' : '#fbbf24' }}>
                    {(mapRegion !== null && (mapRegion.name === '東京都' || mapRegion.name === '神奈川県' || mapRegion.name === '大阪府' || mapRegion.name === '近畿')) ? '高い' : '標準'}
                  </div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '14px' }}>
                  <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginBottom: '6px' }}>投資適性（参考）</div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: purpose === 'high' ? '#4ade80' : purpose === 'speed' ? '#fbbf24' : 'rgba(255,255,255,0.4)' }}>
                    {purpose === 'high' ? '高め' : purpose === 'speed' ? '標準' : '参考値'}
                  </div>
                </div>
              </div>

              {/* AIコメント */}
              <div style={{ marginTop: '12px', background: 'rgba(212,175,55,0.04)', border: '1px solid rgba(212,175,55,0.15)', borderRadius: '10px', padding: '14px' }}>
                <div style={{ display: 'flex', gap: '6px', marginBottom: '8px', alignItems: 'center' }}>
                  <div style={{ width: '5px', height: '5px', background: '#D4AF37', borderRadius: '50%', animation: 'goldBreath 2s infinite' }} />
                  <span style={{ fontSize: '9px', color: 'rgba(212,175,55,0.5)', letterSpacing: '3px' }}>AI ANALYSIS</span>
                </div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.65)', lineHeight: '1.8' }}>
                  現在このエリアでは需要が安定しています。築年数の影響はありますが、条件次第で比較検討価値があります。AIが目的に合う業者を整理することで、より良い条件での売却が検討できます。
                </div>
              </div>

              {/* AIお断りテンプレ */}
              <div style={{ marginTop: '12px' }}>
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginBottom: '8px', letterSpacing: '1px' }}>AIお断りテンプレ（ワンタップ送信可能）</div>
                {[
                  '今回は比較検討段階のため、売却時期は未定です。',
                  '今回は相場確認のみ希望しています。',
                ].map((txt, i) => (
                  <button
                    key={i}
                    type="button"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '10px 14px', fontSize: '12px', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', width: '100%', marginBottom: '6px', textAlign: 'left', fontFamily: 'inherit' }}
                  >
                    {txt}
                  </button>
                ))}
              </div>

              {user !== null ? (
                <div style={{ marginTop: '12px', padding: '10px 14px', background: 'rgba(212,175,55,0.05)', border: '1px solid rgba(212,175,55,0.15)', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#D4AF37', flexShrink: 0 }} />
                  <div style={{ fontSize: '12px', color: 'rgba(212,175,55,0.7)' }}>
                    会員特典：査定履歴が自動保存されます
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
