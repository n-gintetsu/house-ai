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
  const [usedToday, setUsedToday] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (!address) { setMapRegion(null); return; }
    const matched = regionMap.find(r => r.keywords.some(k => address.includes(k)));
    setMapRegion(matched || defaultRegion);
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
          <svg width="100%" height="300" viewBox="0 0 300 260" style={{ display: 'block' }}>
            <rect width="300" height="260" fill="rgba(5,5,20,0.6)" rx="10"/>

            {/* 北海道 */}
            <path d="M178 28 Q185 22 195 25 Q205 22 210 30 Q218 28 220 38 Q225 45 218 52 Q212 58 205 55 Q198 62 190 58 Q182 64 175 58 Q168 62 165 55 Q160 48 165 40 Q168 32 178 28Z" fill="rgba(26,58,92,0.6)" stroke="rgba(212,175,55,0.25)" strokeWidth="0.8"/>
            {/* 北海道 東部 */}
            <path d="M220 38 Q228 35 233 42 Q238 48 232 55 Q226 60 220 55 Q215 50 218 44Z" fill="rgba(26,58,92,0.5)" stroke="rgba(212,175,55,0.2)" strokeWidth="0.8"/>

            {/* 東北 */}
            <path d="M175 68 Q180 62 188 65 Q195 62 200 68 Q205 74 202 82 Q198 90 190 92 Q182 95 175 90 Q168 86 168 78 Q168 70 175 68Z" fill="rgba(26,58,92,0.6)" stroke="rgba(212,175,55,0.25)" strokeWidth="0.8"/>

            {/* 関東 */}
            <path d="M168 98 Q175 93 183 96 Q190 93 195 100 Q200 107 196 115 Q191 122 183 123 Q175 125 168 120 Q162 115 162 107 Q162 100 168 98Z" fill="rgba(26,58,92,0.6)" stroke="rgba(212,175,55,0.25)" strokeWidth="0.8"/>
            {/* 房総半島 */}
            <path d="M193 112 Q198 110 202 116 Q205 122 200 126 Q195 128 192 122 Q190 116 193 112Z" fill="rgba(26,58,92,0.5)" stroke="rgba(212,175,55,0.2)" strokeWidth="0.8"/>

            {/* 中部・甲信越 */}
            <path d="M152 105 Q158 100 165 103 Q168 110 165 118 Q160 124 153 122 Q146 118 146 110 Q146 104 152 105Z" fill="rgba(26,58,92,0.55)" stroke="rgba(212,175,55,0.2)" strokeWidth="0.8"/>
            {/* 伊豆半島 */}
            <path d="M172 125 Q176 122 180 127 Q182 133 178 137 Q174 138 172 133 Q170 128 172 125Z" fill="rgba(26,58,92,0.45)" stroke="rgba(212,175,55,0.15)" strokeWidth="0.8"/>

            {/* 北陸 */}
            <path d="M142 98 Q148 93 154 97 Q156 104 152 110 Q147 114 141 110 Q136 106 138 100Z" fill="rgba(26,58,92,0.55)" stroke="rgba(212,175,55,0.2)" strokeWidth="0.8"/>
            {/* 能登半島 */}
            <path d="M138 90 Q143 86 147 91 Q148 97 143 99 Q138 98 136 93Z" fill="rgba(26,58,92,0.45)" stroke="rgba(212,175,55,0.15)" strokeWidth="0.8"/>

            {/* 近畿 */}
            <path d="M130 110 Q137 105 144 108 Q148 115 145 123 Q140 130 132 130 Q124 128 122 120 Q120 112 130 110Z" fill="rgba(26,58,92,0.6)" stroke="rgba(212,175,55,0.25)" strokeWidth="0.8"/>
            {/* 紀伊半島 */}
            <path d="M130 130 Q136 128 140 135 Q142 142 136 147 Q130 148 127 142 Q124 135 130 130Z" fill="rgba(26,58,92,0.5)" stroke="rgba(212,175,55,0.2)" strokeWidth="0.8"/>

            {/* 中国地方 */}
            <path d="M112 118 Q120 113 128 117 Q132 124 128 132 Q122 138 114 136 Q106 132 106 124 Q106 116 112 118Z" fill="rgba(26,58,92,0.55)" stroke="rgba(212,175,55,0.2)" strokeWidth="0.8"/>

            {/* 四国 */}
            <path d="M118 140 Q126 136 133 140 Q138 147 134 154 Q128 160 120 158 Q112 154 112 147 Q112 140 118 140Z" fill="rgba(26,58,92,0.55)" stroke="rgba(212,175,55,0.2)" strokeWidth="0.8"/>

            {/* 九州 */}
            <path d="M98 130 Q106 125 113 130 Q118 137 115 146 Q110 154 102 154 Q93 152 90 144 Q88 136 98 130Z" fill="rgba(26,58,92,0.6)" stroke="rgba(212,175,55,0.25)" strokeWidth="0.8"/>
            {/* 薩摩半島・大隅 */}
            <path d="M95 154 Q100 152 104 158 Q106 165 100 168 Q94 167 93 161 Q92 156 95 154Z" fill="rgba(26,58,92,0.45)" stroke="rgba(212,175,55,0.15)" strokeWidth="0.8"/>

            {/* 沖縄 */}
            <path d="M88 185 Q92 183 95 186 Q96 190 93 192 Q89 192 88 189Z" fill="rgba(26,58,92,0.4)" stroke="rgba(212,175,55,0.15)" strokeWidth="0.8"/>

            {mapRegion !== null ? (
              <g>
                <circle cx={mapRegion.cx} cy={mapRegion.cy} r="5" fill="rgba(212,175,55,0.8)" stroke="#D4AF37" strokeWidth="1.5"/>
                <circle cx={mapRegion.cx} cy={mapRegion.cy} r="5" fill="none" stroke="rgba(212,175,55,0.6)" strokeWidth="1">
                  <animate attributeName="r" from="5" to="25" dur="2s" repeatCount="indefinite"/>
                  <animate attributeName="opacity" from="0.8" to="0" dur="2s" repeatCount="indefinite"/>
                </circle>
                <circle cx={mapRegion.cx} cy={mapRegion.cy} r="5" fill="none" stroke="rgba(212,175,55,0.3)" strokeWidth="1">
                  <animate attributeName="r" from="5" to="40" dur="2s" begin="0.5s" repeatCount="indefinite"/>
                  <animate attributeName="opacity" from="0.5" to="0" dur="2s" begin="0.5s" repeatCount="indefinite"/>
                </circle>
                <text x={mapRegion.cx} y={mapRegion.cy + 18} textAnchor="middle" fontSize="9" fill="rgba(212,175,55,0.8)">{mapRegion.name}</text>
              </g>
            ) : null}

            {analyzing ? (
              <line x1="0" y1="0" x2="300" y2="0" stroke="rgba(212,175,55,0.4)" strokeWidth="1">
                <animateTransform attributeName="transform" type="translate" from="0,0" to="0,260" dur="2s" repeatCount="indefinite"/>
              </line>
            ) : null}

            {result !== null ? (
              mapRegion !== null ? (
                <g>
                  <circle cx={mapRegion.cx - 20} cy={mapRegion.cy - 15} r="3" fill="rgba(74,222,128,0.6)" stroke="rgba(74,222,128,0.4)" strokeWidth="1"/>
                  <circle cx={mapRegion.cx + 18} cy={mapRegion.cy + 10} r="3" fill="rgba(74,222,128,0.6)" stroke="rgba(74,222,128,0.4)" strokeWidth="1"/>
                  <circle cx={mapRegion.cx - 10} cy={mapRegion.cy + 20} r="3" fill="rgba(74,222,128,0.6)" stroke="rgba(74,222,128,0.4)" strokeWidth="1"/>
                  <circle cx={mapRegion.cx + 25} cy={mapRegion.cy - 8} r="2.5" fill="rgba(74,222,128,0.4)"/>
                  <circle cx={mapRegion.cx - 28} cy={mapRegion.cy + 8} r="2.5" fill="rgba(74,222,128,0.4)"/>
                  <text x="150" y="245" textAnchor="middle" fontSize="9" fill="rgba(74,222,128,0.6)">成約事例 5件取得</text>
                </g>
              ) : null
            ) : null}

            {mapRegion === null ? (
              <text x="150" y="245" textAnchor="middle" fontSize="10" fill="rgba(255,255,255,0.2)">住所を入力するとエリアが発光します</text>
            ) : null}
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
                  <div style={{ fontSize: '10px', color: 'rgba(212,175,55,0.6)', marginBottom: '6px' }}>AI推定価格</div>
                  <div style={{ fontSize: '16px', fontWeight: '700', color: '#D4AF37' }}>{result.low.toLocaleString()}〜{result.high.toLocaleString()}万円</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '14px' }}>
                  <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginBottom: '6px' }}>売却難易度</div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#4ade80' }}>低い（売れやすい）</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '14px' }}>
                  <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginBottom: '6px' }}>人気エリア度</div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: (mapRegion && (mapRegion.name === '東京都' || mapRegion.name === '神奈川県' || mapRegion.name === '大阪府' || mapRegion.name === '近畿')) ? '#4ade80' : '#fbbf24' }}>
                    {(mapRegion && (mapRegion.name === '東京都' || mapRegion.name === '神奈川県' || mapRegion.name === '大阪府' || mapRegion.name === '近畿')) ? '高い' : '標準'}
                  </div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '14px' }}>
                  <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginBottom: '6px' }}>投資適性</div>
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
