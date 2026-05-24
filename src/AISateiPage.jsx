import { useState, useEffect } from 'react';
import SEOHead from './SEOHead';
import { supabase } from './lib/supabase';
import DigitalJapanMap from './DigitalJapanMap';

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
  { keywords: ['東京', '千代田', '新宿', '渋谷', '港', '品川', '目黒', '世田谷', '杉並', '中野', '豊島', '北区', '板橋', '練馬', '足立', '葛飾', '江戸川', '墨田', '江東', '荒川', '台東', '文京', '中央'], cx: 310, cy: 260, name: '東京都' },
  { keywords: ['横浜', '川崎', '神奈川', '相模', '厚木', '藤沢', '鎌倉', '逗子', '三浦', '横須賀'], cx: 305, cy: 275, name: '神奈川県' },
  { keywords: ['大阪', '梅田', '難波', '心斎橋', '天王寺', '堺', '豊中', '吹田', '枚方', '東大阪'], cx: 240, cy: 268, name: '大阪府' },
  { keywords: ['名古屋', '愛知', '豊田', '岡崎', '一宮', '豊橋', '春日井'], cx: 268, cy: 265, name: '愛知県' },
  { keywords: ['札幌', '北海道', '函館', '旭川', '釧路', '帯広', '小樽'], cx: 340, cy: 80, name: '北海道' },
  { keywords: ['福岡', '博多', '北九州', '久留米'], cx: 180, cy: 310, name: '福岡県' },
  { keywords: ['佐賀', '長崎', '熊本', '鹿児島', '宮崎', '大分'], cx: 175, cy: 330, name: '九州南部' },
  { keywords: ['仙台', '宮城', '岩手', '青森', '秋田', '山形', '福島'], cx: 330, cy: 165, name: '東北' },
  { keywords: ['広島', '岡山', '山口', '鳥取', '島根'], cx: 215, cy: 275, name: '中国地方' },
  { keywords: ['高知', '愛媛', '香川', '徳島'], cx: 240, cy: 300, name: '四国' },
  { keywords: ['京都', '兵庫', '神戸', '奈良', '滋賀', '和歌山', '三重'], cx: 248, cy: 265, name: '近畿' },
  { keywords: ['新潟', '富山', '石川', '福井', '長野', '岐阜', '静岡', '山梨'], cx: 278, cy: 240, name: '中部' },
  { keywords: ['沖縄', '那覇'], cx: 170, cy: 460, name: '沖縄県' },
];

const defaultRegion = { cx: 290, cy: 260, name: 'エリア' };

const aiLogs = [
  'MARKET SIGNAL DETECTED',
  'PUBLIC PRICE DATABASE CONNECTED',
  'SIMILAR PROPERTY FOUND: 5',
  'AREA DEMAND ANALYSIS: HIGH',
  'AI PRICE ENGINE INITIALIZED',
  'TRANSACTION HISTORY VERIFIED',
  'INVESTMENT SCORE CALCULATED',
  'LOCATION SCORE: 87/100',
  'MARKET TEMPERATURE: NORMAL',
  'AI ANALYSIS COMPLETE',
];

const vendorOptions = [
  { key: 'A', label: '高く売りたい', desc: '複数業者を比較しながら、できるだけ高値売却を目指したい' },
  { key: 'B', label: 'スピード重視', desc: '早期売却・即現金化を優先したい' },
  { key: 'C', label: 'まず相場観を知りたい', desc: '査定だけ受けて、売却は検討中' },
  { key: 'D', label: '相談してから決めたい', desc: '何から始めればいいか、AIや専門家に相談したい' },
];

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
  const [displayPrice, setDisplayPrice] = useState(0);
  const [logText, setLogText] = useState('SYSTEM READY...');
  const [logIndex, setLogIndex] = useState(0);
  const [typePos, setTypePos] = useState(0);
  const [floor, setFloor] = useState('');
  const [roomType, setRoomType] = useState('');
  const [landArea, setLandArea] = useState('');
  const [buildingArea, setBuildingArea] = useState('');
  const [units, setUnits] = useState('');
  const [occupancy, setOccupancy] = useState('');
  const [annualRent, setAnnualRent] = useState('');
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [vendorPurpose, setVendorPurpose] = useState(null);
  const [vendorConfirmed, setVendorConfirmed] = useState(false);
  const [showVendorForm, setShowVendorForm] = useState(false);
  const [vendorFormData, setVendorFormData] = useState({
    nickname: '',
    sellTiming: '',
    desiredPrice: '',
    hasLoan: '',
    loanBalance: '',
    contactMethod: 'chat',
    freeText: '',
  });
  const [vendorSubmitting, setVendorSubmitting] = useState(false);
  const [vendorSubmitted, setVendorSubmitted] = useState(false);

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

  useEffect(() => {
    const fullText = aiLogs[logIndex];
    if (typePos < fullText.length) {
      const t = setTimeout(() => {
        setLogText(fullText.slice(0, typePos + 1));
        setTypePos(prev => prev + 1);
      }, 45);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => {
        setLogIndex(prev => (prev + 1) % aiLogs.length);
        setTypePos(0);
      }, 1200);
      return () => clearTimeout(t);
    }
  }, [logIndex, typePos]);

  useEffect(() => {
    if (!result) { setDisplayPrice(0); return; }
    const target = result.low;
    const duration = 1200;
    const steps = 40;
    const increment = target / steps;
    let current = 0;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      current = Math.min(Math.round(increment * step), target);
      setDisplayPrice(current);
      if (step >= steps) clearInterval(timer);
    }, duration / steps);
    return () => clearInterval(timer);
  }, [result]);

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

  const isHighDemand = mapRegion !== null && (
    mapRegion.name === '東京都' || mapRegion.name === '神奈川県' ||
    mapRegion.name === '大阪府' || mapRegion.name === '近畿'
  );

  const vendorLabel = vendorPurpose === 'A' ? '高く売りたい'
    : vendorPurpose === 'B' ? 'スピード重視'
    : vendorPurpose === 'C' ? 'まず相場観を知りたい'
    : '相談してから決めたい';

  return (
    <>
      {showVendorModal === true ? (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0,0,0,0.75)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '20px',
        }}>
          <div style={{
            background: '#0F172A',
            border: '1px solid rgba(212,175,55,0.3)',
            borderRadius: '20px',
            padding: '32px 28px',
            maxWidth: '480px', width: '100%',
            position: 'relative',
          }}>
            <button
              onClick={() => { setShowVendorModal(false); setVendorPurpose(null); setVendorConfirmed(false); }}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: '20px', cursor: 'pointer', lineHeight: 1, fontFamily: 'inherit' }}
            >
              x
            </button>

            {vendorConfirmed === false ? (
              <div>
                <div style={{ fontSize: '10px', color: 'rgba(212,175,55,0.5)', letterSpacing: '3px', marginBottom: '12px', fontFamily: 'monospace' }}>VENDOR MATCHING</div>
                <div style={{ fontSize: '18px', fontWeight: '700', color: 'white', marginBottom: '6px' }}>業者査定依頼</div>
                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '24px', lineHeight: '1.6' }}>
                  やり取りは会員ページ内で完結。しつこい営業はございません。安心してご利用いただけます。
                </div>
                {vendorOptions.map((opt) => (
                  <div
                    key={opt.key}
                    onClick={() => setVendorPurpose(opt.key)}
                    style={{
                      padding: '14px 16px',
                      marginBottom: '8px',
                      border: vendorPurpose === opt.key ? '1px solid rgba(212,175,55,0.6)' : '1px solid rgba(255,255,255,0.08)',
                      background: vendorPurpose === opt.key ? 'rgba(212,175,55,0.08)' : 'rgba(255,255,255,0.02)',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: '12px',
                    }}
                  >
                    <div style={{
                      width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
                      background: vendorPurpose === opt.key ? 'rgba(212,175,55,0.2)' : 'rgba(255,255,255,0.05)',
                      border: vendorPurpose === opt.key ? '1px solid #D4AF37' : '1px solid rgba(255,255,255,0.1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '12px', fontWeight: '700',
                      color: vendorPurpose === opt.key ? '#D4AF37' : 'rgba(255,255,255,0.3)',
                      fontFamily: 'monospace',
                    }}>{opt.key}</div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: vendorPurpose === opt.key ? '#D4AF37' : 'white', marginBottom: '2px' }}>{opt.label}</div>
                      <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', lineHeight: '1.5' }}>{opt.desc}</div>
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => vendorPurpose !== null ? setVendorConfirmed(true) : null}
                  style={{
                    width: '100%', marginTop: '16px', padding: '16px',
                    background: vendorPurpose !== null ? 'linear-gradient(135deg, #D4AF37, #c9a84c)' : 'rgba(255,255,255,0.05)',
                    color: vendorPurpose !== null ? '#0F172A' : 'rgba(255,255,255,0.2)',
                    border: 'none', borderRadius: '12px',
                    fontSize: '16px', fontWeight: '700', cursor: vendorPurpose !== null ? 'pointer' : 'default',
                    fontFamily: 'inherit',
                  }}
                >
                  この条件で進める
                </button>
              </div>
            ) : null}

            {vendorConfirmed === true ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '10px', color: 'rgba(212,175,55,0.5)', letterSpacing: '3px', marginBottom: '16px', fontFamily: 'monospace' }}>AI MATCHING READY</div>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', border: '2px solid rgba(212,175,55,0.4)', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'goldPulseBtn 1.5s ease-in-out infinite' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(212,175,55,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <circle cx="10" cy="10" r="8" stroke="#D4AF37" strokeWidth="1.5"/>
                      <path d="M7 10L9 12L13 8" stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
                <div style={{ fontSize: '16px', fontWeight: '700', color: 'white', marginBottom: '8px' }}>
                  {vendorLabel}
                </div>
                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px', lineHeight: '1.6' }}>
                  選択した条件で進めてよろしいですか？
                </div>
                <div style={{ fontSize: '11px', color: 'rgba(212,175,55,0.5)', marginBottom: '28px', padding: '10px', background: 'rgba(212,175,55,0.05)', borderRadius: '8px' }}>
                  AIが条件に合う業者を整理します。やり取りは会員ページ内で完結します。
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    onClick={() => { setShowVendorModal(false); setVendorPurpose(null); setVendorConfirmed(false); }}
                    style={{
                      flex: 1, padding: '14px',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px', color: 'rgba(255,255,255,0.5)',
                      fontSize: '15px', cursor: 'pointer', fontFamily: 'inherit',
                    }}
                  >
                    NO — 戻る
                  </button>
                  <button
                    onClick={() => { setVendorConfirmed(false); setShowVendorModal(false); setShowVendorForm(true); }}
                    style={{
                      flex: 2, padding: '14px',
                      background: 'linear-gradient(135deg, #D4AF37, #c9a84c)',
                      border: 'none', borderRadius: '12px',
                      color: '#0F172A', fontSize: '15px', fontWeight: '700',
                      cursor: 'pointer', fontFamily: 'inherit',
                    }}
                  >
                    YES — 進める
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {showVendorForm === true ? (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1001,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '16px',
        }}>
          <div style={{
            background: '#F9FAFB',
            borderRadius: '24px',
            width: '100%', maxWidth: '520px',
            maxHeight: '90vh',
            overflow: 'hidden',
            display: 'flex', flexDirection: 'column',
            boxShadow: '0 25px 60px rgba(0,0,0,0.25)',
          }}>
            {vendorSubmitted === true ? (
              <div style={{
                padding: '48px 32px',
                textAlign: 'center',
                animation: 'completeFade 0.6s ease',
                flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
              }}>
                <div style={{ position: 'relative', width: '80px', height: '80px', margin: '0 auto 28px' }}>
                  <div style={{
                    position: 'absolute', inset: 0, borderRadius: '50%',
                    border: '2px solid rgba(26,58,92,0.15)',
                    animation: 'ringExpand 1.5s ease-out infinite',
                  }} />
                  <div style={{
                    width: '80px', height: '80px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #1a3a5c, #2a5a8c)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                      <path d="M8 18L15 25L28 11" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                        style={{ strokeDasharray: 50, strokeDashoffset: 0, animation: 'checkDraw 0.8s ease forwards' }}/>
                    </svg>
                  </div>
                </div>
                <div style={{ fontSize: '22px', fontWeight: '700', color: '#111827', marginBottom: '10px' }}>
                  送信が完了しました
                </div>
                <div style={{ fontSize: '15px', color: '#6B7280', lineHeight: '1.7', marginBottom: '8px' }}>
                  査定依頼を受け付けました。
                </div>
                <div style={{
                  fontSize: '14px', color: '#374151', lineHeight: '1.7',
                  padding: '16px 20px',
                  background: 'rgba(26,58,92,0.05)',
                  borderRadius: '14px',
                  marginBottom: '28px',
                  border: '1px solid rgba(26,58,92,0.1)',
                }}>
                  結果は会員ページのお知らせに届きます。<br/>
                  やり取りはすべて会員ページ内で完結します。
                </div>
                <button
                  onClick={() => { setShowVendorForm(false); setVendorSubmitted(false); setVendorPurpose(null); }}
                  style={{
                    padding: '14px 40px',
                    background: 'linear-gradient(135deg, #1a3a5c, #2a5a8c)',
                    color: 'white', border: 'none', borderRadius: '14px',
                    fontSize: '16px', fontWeight: '600', cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  閉じる
                </button>
              </div>
            ) : null}
            {vendorSubmitted === false ? (
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
                <div style={{
                  padding: '20px 24px 16px',
                  borderBottom: '1px solid #E5E7EB',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: 'white', flexShrink: 0,
                }}>
                  <div>
                    <div style={{ fontSize: '11px', color: '#9CA3AF', letterSpacing: '2px', marginBottom: '2px' }}>
                      {vendorPurpose === 'A' ? 'HIGH VALUE SALE' : vendorPurpose === 'B' ? 'SPEED SALE' : vendorPurpose === 'C' ? 'MARKET CHECK' : 'CONSULTATION'}
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: '700', color: '#111827' }}>
                      {vendorPurpose === 'A' ? '高く売りたい' : vendorPurpose === 'B' ? 'スピード重視' : vendorPurpose === 'C' ? '相場観を確認' : '相談してから決める'}
                    </div>
                  </div>
                  <button
                    onClick={() => setShowVendorForm(false)}
                    style={{ background: '#F3F4F6', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', fontSize: '18px', color: '#6B7280', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    x
                  </button>
                </div>
                <div style={{ overflowY: 'auto', flex: 1, padding: '20px 24px' }}>
                  <div style={{
                    background: 'white', border: '1px solid #E5E7EB',
                    borderRadius: '16px', padding: '16px', marginBottom: '20px',
                  }}>
                    <div style={{ fontSize: '11px', color: '#9CA3AF', letterSpacing: '2px', marginBottom: '12px' }}>物件情報（自動反映）</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      {[
                        { label: '住所', value: address || '未入力' },
                        { label: '種別', value: propertyType || '未選択' },
                        { label: '面積', value: area ? area + '㎡' : '未入力' },
                        { label: '築年数', value: age ? age + '年' : '未入力' },
                      ].map((item, i) => (
                        <div key={i} style={{ padding: '10px 12px', background: '#F9FAFB', borderRadius: '10px' }}>
                          <div style={{ fontSize: '11px', color: '#9CA3AF', marginBottom: '3px' }}>{item.label}</div>
                          <div style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>{item.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="vendor-section">
                    <label className="vendor-label">ニックネーム <span style={{ color: '#EF4444', fontSize: '12px' }}>必須</span></label>
                    <input
                      className="vendor-input"
                      type="text"
                      placeholder="例：Takeshi（匿名OK）"
                      value={vendorFormData.nickname}
                      onChange={(e) => setVendorFormData(prev => ({ ...prev, nickname: e.target.value }))}
                    />
                    <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '5px' }}>実名不要。会員ページ内での表示名です。</div>
                  </div>
                  {(vendorPurpose === 'A' || vendorPurpose === 'B') ? (
                    <div className="vendor-section">
                      <label className="vendor-label">希望売却時期 <span style={{ color: '#EF4444', fontSize: '12px' }}>必須</span></label>
                      <select
                        className="vendor-input"
                        value={vendorFormData.sellTiming}
                        onChange={(e) => setVendorFormData(prev => ({ ...prev, sellTiming: e.target.value }))}
                        style={{ cursor: 'pointer' }}
                      >
                        <option value="">選択してください</option>
                        <option>できるだけ早く（1ヶ月以内）</option>
                        <option>3ヶ月以内</option>
                        <option>半年以内</option>
                        <option>1年以内</option>
                        <option>時期は未定</option>
                      </select>
                    </div>
                  ) : null}
                  {vendorPurpose === 'A' ? (
                    <div className="vendor-section">
                      <label className="vendor-label">希望売却価格（任意）</label>
                      <input
                        className="vendor-input"
                        type="text"
                        placeholder="例：4,500万円以上"
                        value={vendorFormData.desiredPrice}
                        onChange={(e) => setVendorFormData(prev => ({ ...prev, desiredPrice: e.target.value }))}
                      />
                    </div>
                  ) : null}
                  {(vendorPurpose === 'A' || vendorPurpose === 'B') ? (
                    <div className="vendor-section">
                      <label className="vendor-label">現在のローン</label>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        {['あり', 'なし', '不明'].map(v => (
                          <button
                            key={v}
                            onClick={() => setVendorFormData(prev => ({ ...prev, hasLoan: v }))}
                            style={{
                              flex: 1, padding: '12px',
                              background: vendorFormData.hasLoan === v ? '#1a3a5c' : 'white',
                              color: vendorFormData.hasLoan === v ? 'white' : '#374151',
                              border: vendorFormData.hasLoan === v ? '1px solid #1a3a5c' : '1px solid #E5E7EB',
                              borderRadius: '10px', fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit',
                            }}
                          >{v}</button>
                        ))}
                      </div>
                      {vendorFormData.hasLoan === 'あり' ? (
                        <input
                          className="vendor-input"
                          type="text"
                          placeholder="残債額（例：2,000万円）"
                          value={vendorFormData.loanBalance}
                          onChange={(e) => setVendorFormData(prev => ({ ...prev, loanBalance: e.target.value }))}
                          style={{ marginTop: '10px' }}
                        />
                      ) : null}
                    </div>
                  ) : null}
                  {vendorPurpose === 'D' ? (
                    <div className="vendor-section">
                      <label className="vendor-label">お悩み・相談内容</label>
                      <textarea
                        className="vendor-input"
                        rows={4}
                        placeholder="例：相続した物件をどうすればいいか分からない。まず何から始めるべきか相談したい。"
                        value={vendorFormData.freeText}
                        onChange={(e) => setVendorFormData(prev => ({ ...prev, freeText: e.target.value }))}
                        style={{ resize: 'vertical', fontSize: '16px' }}
                      />
                    </div>
                  ) : null}
                  <div className="vendor-section">
                    <label className="vendor-label">連絡方法</label>
                    <div style={{
                      padding: '14px 16px',
                      background: 'rgba(26,58,92,0.04)',
                      border: '1px solid rgba(26,58,92,0.12)',
                      borderRadius: '12px',
                      display: 'flex', alignItems: 'center', gap: '10px',
                    }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#1a3a5c', flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>会員ページ内チャットのみ</div>
                        <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '2px' }}>電話番号の開示は不要です。安心してご利用いただけます。</div>
                      </div>
                    </div>
                  </div>
                  <div style={{
                    padding: '14px 16px',
                    background: '#F0FDF4',
                    border: '1px solid #BBF7D0',
                    borderRadius: '12px',
                    marginBottom: '8px',
                  }}>
                    <div style={{ fontSize: '12px', color: '#15803D', lineHeight: '1.7' }}>
                      しつこい営業は一切ございません。
                      やり取りはすべて会員ページ内で完結します。
                      結果はお知らせにてご連絡いたします。
                    </div>
                  </div>
                </div>
                <div style={{
                  padding: '16px 24px',
                  background: 'white',
                  borderTop: '1px solid #E5E7EB',
                  flexShrink: 0,
                }}>
                  <button
                    onClick={async () => {
                      if (!vendorFormData.nickname.trim()) return;
                      setVendorSubmitting(true);
                      await new Promise(r => setTimeout(r, 2200));
                      setVendorSubmitting(false);
                      setVendorSubmitted(true);
                    }}
                    disabled={vendorSubmitting || !vendorFormData.nickname.trim()}
                    style={{
                      width: '100%', padding: '16px',
                      background: vendorSubmitting
                        ? '#E5E7EB'
                        : vendorFormData.nickname.trim()
                          ? 'linear-gradient(135deg, #1a3a5c, #2a5a8c)'
                          : '#E5E7EB',
                      color: vendorFormData.nickname.trim() && !vendorSubmitting ? 'white' : '#9CA3AF',
                      border: 'none', borderRadius: '14px',
                      fontSize: '16px', fontWeight: '700',
                      cursor: vendorFormData.nickname.trim() && !vendorSubmitting ? 'pointer' : 'default',
                      fontFamily: 'inherit',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                    }}
                  >
                    {vendorSubmitting ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '20px', height: '20px', borderRadius: '50%',
                          border: '2px solid rgba(26,58,92,0.2)',
                          borderTopColor: '#1a3a5c',
                          animation: 'submitSpin 0.8s linear infinite',
                        }} />
                        <span style={{ color: '#6B7280', fontSize: '15px' }}>送信中...</span>
                      </div>
                    ) : '査定依頼を送信する'}
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

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
          @keyframes priceFlash {
            0% { opacity: 1; }
            20% { opacity: 0.3; }
            40% { opacity: 1; }
            60% { opacity: 0.6; }
            100% { opacity: 1; }
          }
          @keyframes gaugeGrow {
            from { width: 0%; }
            to { width: 78%; }
          }
          @keyframes lockPulse {
            0%, 100% { opacity: 0.4; }
            50% { opacity: 0.8; }
          }
          @keyframes djGlow {
            0%, 100% { opacity: 0.4; }
            50% { opacity: 1; }
          }
          @keyframes goldShine {
            0% { background-position: -200% center; }
            100% { background-position: 200% center; }
          }
          @keyframes goldPulseBtn {
            0%, 100% { box-shadow: 0 0 20px rgba(212,175,55,0.4), 0 4px 15px rgba(212,175,55,0.3); }
            50% { box-shadow: 0 0 40px rgba(212,175,55,0.7), 0 4px 25px rgba(212,175,55,0.5); }
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
          .satei-input option { background: #0F172A; color: white; }
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
          .price-flash { animation: priceFlash 0.6s ease; }
          @keyframes submitSpin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes checkDraw {
            0% { stroke-dashoffset: 50; opacity: 0; }
            50% { opacity: 1; }
            100% { stroke-dashoffset: 0; opacity: 1; }
          }
          @keyframes completeFade {
            0% { opacity: 0; transform: scale(0.92); }
            100% { opacity: 1; transform: scale(1); }
          }
          @keyframes ringExpand {
            0% { transform: scale(0.5); opacity: 0.8; }
            100% { transform: scale(2.5); opacity: 0; }
          }
          .vendor-input {
            width: 100%;
            padding: 14px 16px;
            font-size: 16px;
            border: 1px solid #E5E7EB;
            border-radius: 12px;
            color: #111827;
            background: white;
            box-sizing: border-box;
            font-family: inherit;
            outline: none;
            transition: border-color 0.2s, box-shadow 0.2s;
            -webkit-appearance: none;
          }
          .vendor-input:focus {
            border-color: #1a3a5c;
            box-shadow: 0 0 0 3px rgba(26,58,92,0.08);
          }
          .vendor-label {
            font-size: 13px;
            font-weight: 500;
            color: #374151;
            margin-bottom: 6px;
            display: block;
          }
          .vendor-section {
            margin-bottom: 20px;
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
              <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>AIが不動産市場をリアルタイム解析します</div>
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

            {/* 物件種別追加入力 — マンション */}
            {propertyType === 'マンション' ? (
              <div style={{ marginTop: '20px' }}>
                <div style={{ fontSize: '11px', color: 'rgba(212,175,55,0.5)', letterSpacing: '2px', marginBottom: '12px', fontFamily: 'monospace' }}>DETAIL INPUT — マンション</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '5px' }}>階数</div>
                    <input className="satei-input" type="number" placeholder="例：8" value={floor} onChange={(e) => setFloor(e.target.value)} style={{ fontSize: '16px' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '5px' }}>間取り</div>
                    <select className="satei-input" value={roomType} onChange={(e) => setRoomType(e.target.value)} style={{ fontSize: '16px', cursor: 'pointer' }}>
                      <option value="">選択してください</option>
                      <option>1R</option>
                      <option>1K</option>
                      <option>1DK</option>
                      <option>1LDK</option>
                      <option>2LDK</option>
                      <option>3LDK</option>
                      <option>4LDK以上</option>
                    </select>
                  </div>
                </div>
              </div>
            ) : null}

            {/* 物件種別追加入力 — 戸建 */}
            {propertyType === '戸建' ? (
              <div style={{ marginTop: '20px' }}>
                <div style={{ fontSize: '11px', color: 'rgba(212,175,55,0.5)', letterSpacing: '2px', marginBottom: '12px', fontFamily: 'monospace' }}>DETAIL INPUT — 戸建</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '5px' }}>土地面積（㎡）</div>
                    <input className="satei-input" type="number" placeholder="例：120" value={landArea} onChange={(e) => setLandArea(e.target.value)} style={{ fontSize: '16px' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '5px' }}>延床面積（㎡）</div>
                    <input className="satei-input" type="number" placeholder="例：95" value={buildingArea} onChange={(e) => setBuildingArea(e.target.value)} style={{ fontSize: '16px' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '5px' }}>間取り</div>
                    <select className="satei-input" value={roomType} onChange={(e) => setRoomType(e.target.value)} style={{ fontSize: '16px', cursor: 'pointer' }}>
                      <option value="">選択してください</option>
                      <option>2LDK</option>
                      <option>3LDK</option>
                      <option>4LDK</option>
                      <option>5LDK以上</option>
                    </select>
                  </div>
                </div>
              </div>
            ) : null}

            {/* 物件種別追加入力 — 土地 */}
            {propertyType === '土地' ? (
              <div style={{ marginTop: '20px' }}>
                <div style={{ fontSize: '11px', color: 'rgba(212,175,55,0.5)', letterSpacing: '2px', marginBottom: '12px', fontFamily: 'monospace' }}>DETAIL INPUT — 土地</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '5px' }}>土地面積（㎡）</div>
                    <input className="satei-input" type="number" placeholder="例：150" value={landArea} onChange={(e) => setLandArea(e.target.value)} style={{ fontSize: '16px' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '5px' }}>用途地域</div>
                    <select className="satei-input" value={roomType} onChange={(e) => setRoomType(e.target.value)} style={{ fontSize: '16px', cursor: 'pointer' }}>
                      <option value="">選択してください</option>
                      <option>第一種低層住居専用</option>
                      <option>第二種低層住居専用</option>
                      <option>第一種中高層住居専用</option>
                      <option>準住居地域</option>
                      <option>商業地域</option>
                      <option>準工業地域</option>
                      <option>不明</option>
                    </select>
                  </div>
                </div>
              </div>
            ) : null}

            {/* 物件種別追加入力 — 収益物件 */}
            {(propertyType === '一棟アパート' || propertyType === '一棟ビル' || propertyType === '収益物件') ? (
              <div style={{ marginTop: '20px' }}>
                <div style={{ fontSize: '11px', color: 'rgba(212,175,55,0.5)', letterSpacing: '2px', marginBottom: '12px', fontFamily: 'monospace' }}>DETAIL INPUT — 収益物件</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '5px' }}>総戸数・区画数</div>
                    <input className="satei-input" type="number" placeholder="例：8" value={units} onChange={(e) => setUnits(e.target.value)} style={{ fontSize: '16px' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '5px' }}>現在入居率（%）</div>
                    <input className="satei-input" type="number" placeholder="例：85" value={occupancy} onChange={(e) => setOccupancy(e.target.value)} style={{ fontSize: '16px' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '5px' }}>年間家賃収入（万円）</div>
                    <input className="satei-input" type="number" placeholder="例：480" value={annualRent} onChange={(e) => setAnnualRent(e.target.value)} style={{ fontSize: '16px' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '5px' }}>土地面積（㎡）</div>
                    <input className="satei-input" type="number" placeholder="例：200" value={landArea} onChange={(e) => setLandArea(e.target.value)} style={{ fontSize: '16px' }} />
                  </div>
                </div>
              </div>
            ) : null}

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
                    width: '100%',
                    padding: '18px',
                    background: canSubmit
                      ? 'linear-gradient(90deg, #c9a84c, #f0d060, #D4AF37, #f0d060, #c9a84c)'
                      : 'rgba(255,255,255,0.05)',
                    backgroundSize: '200% auto',
                    animation: canSubmit ? 'goldShine 3s linear infinite, goldPulseBtn 2s ease-in-out infinite' : 'none',
                    color: canSubmit ? '#0F172A' : 'rgba(255,255,255,0.2)',
                    border: canSubmit ? 'none' : '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '14px',
                    fontSize: '17px',
                    fontWeight: '700',
                    cursor: canSubmit ? 'pointer' : 'default',
                    fontFamily: 'inherit',
                    letterSpacing: '1px',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  {usedToday === true ? (user !== null ? '30秒で無料AI分析を開始' : '本日の無料分析は利用済みです') : '30秒で無料AI分析を開始'}
                </button>
              )}
            </div>
          </div>

          {/* 右カラム */}
          <div style={{ width: '400px', minWidth: '400px', padding: '28px 20px', position: 'sticky', top: 0 }}>
            <div style={{ fontSize: '10px', color: 'rgba(212,175,55,0.5)', letterSpacing: '3px', marginBottom: '12px' }}>AI LOCATION ANALYSIS</div>

            <DigitalJapanMap
              activeArea={mapRegion}
              areaName={mapRegion ? mapRegion.name : ''}
              mapStatus={mapStatus}
            />

            {/* 成約事例件数バッジ */}
            {result !== null ? (
              <div style={{ display: 'flex', gap: '8px', marginTop: '10px', marginBottom: '0', flexWrap: 'wrap' }}>
                {[
                  { label: '周辺成約事例', value: '5件', color: 'rgba(74,222,128,0.8)' },
                  { label: '類似物件', value: '12件', color: 'rgba(96,165,250,0.8)' },
                  { label: '公示地点', value: '3地点', color: 'rgba(212,175,55,0.8)' },
                ].map((item, i) => (
                  <div key={i} style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '6px',
                    padding: '5px 10px',
                    display: 'flex', alignItems: 'center', gap: '6px',
                  }}>
                    <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace', letterSpacing: '1px' }}>{item.label}</span>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: item.color, fontFamily: 'monospace' }}>{item.value}</span>
                  </div>
                ))}
              </div>
            ) : null}

            {/* AIログエリア */}
            <div style={{
              background: 'rgba(0,8,20,0.9)',
              border: '1px solid rgba(96,165,250,0.15)',
              borderRadius: '10px',
              padding: '10px 14px',
              marginTop: '10px',
              marginBottom: '12px',
              minHeight: '36px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#22c55e', animation: 'djGlow 1.5s infinite' }} />
                <span style={{ fontSize: '9px', color: 'rgba(96,165,250,0.5)', letterSpacing: '3px', fontFamily: 'monospace' }}>AI ANALYSIS LOG</span>
              </div>
              <div style={{ fontSize: '11px', color: 'rgba(34,197,94,0.9)', fontFamily: 'monospace', letterSpacing: '1px', minHeight: '16px' }}>
                {logText}<span style={{ animation: 'lockPulse 0.8s infinite', color: 'rgba(34,197,94,0.6)' }}>_</span>
              </div>
            </div>

            {/* 解析ステータス */}
            {analyzing ? (
              <div style={{ marginBottom: '12px', background: 'rgba(212,175,55,0.05)', border: '1px solid rgba(212,175,55,0.15)', borderRadius: '10px', padding: '12px' }}>
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
              <div style={{ animation: 'fadeUp 0.6s ease' }}>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>

                  {/* 価格カード（全幅） */}
                  <div style={{
                    gridColumn: '1 / -1',
                    background: 'rgba(212,175,55,0.06)',
                    border: '1px solid rgba(212,175,55,0.3)',
                    borderRadius: '12px',
                    padding: '16px',
                  }}>
                    <div style={{ fontSize: '9px', color: 'rgba(212,175,55,0.5)', letterSpacing: '3px', marginBottom: '8px', fontFamily: 'monospace' }}>AI PRICE ESTIMATE</div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                      <div style={{ fontSize: '32px', fontWeight: '700', color: '#D4AF37', fontFamily: 'monospace', letterSpacing: '1px', textShadow: '0 0 20px rgba(212,175,55,0.5)' }}>
                        {displayPrice.toLocaleString()}
                      </div>
                      <div style={{ fontSize: '16px', color: 'rgba(212,175,55,0.7)', fontWeight: '600' }}>万円〜</div>
                      <div style={{ fontSize: '20px', fontWeight: '700', color: 'rgba(212,175,55,0.6)', fontFamily: 'monospace' }}>
                        {result.high.toLocaleString()}万円
                      </div>
                    </div>
                    <div style={{ fontSize: '10px', color: 'rgba(212,175,55,0.35)', marginTop: '6px' }}>※AI概算 実際の査定とは異なります</div>
                  </div>

                  {/* MARKET SIGNAL */}
                  <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '12px' }}>
                    <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', letterSpacing: '2px', fontFamily: 'monospace', marginBottom: '6px' }}>MARKET SIGNAL</div>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: '#22c55e', fontFamily: 'monospace' }}>低い（売れやすい）</div>
                  </div>

                  {/* AREA DEMAND */}
                  <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '12px' }}>
                    <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', letterSpacing: '2px', fontFamily: 'monospace', marginBottom: '6px' }}>AREA DEMAND</div>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: isHighDemand ? '#22d3ee' : '#fbbf24', fontFamily: 'monospace' }}>
                      {isHighDemand ? 'HIGH' : 'NORMAL'}
                    </div>
                  </div>

                  {/* INVEST SCORE */}
                  <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '12px' }}>
                    <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', letterSpacing: '2px', fontFamily: 'monospace', marginBottom: '6px' }}>INVEST SCORE</div>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: purpose === 'high' ? '#22c55e' : purpose === 'speed' ? '#fbbf24' : 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>
                      {purpose === 'high' ? 'HIGH' : purpose === 'speed' ? 'NORMAL' : 'REF ONLY'}
                    </div>
                  </div>

                  {/* PRICE/TSUBO */}
                  <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '12px' }}>
                    <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', letterSpacing: '2px', fontFamily: 'monospace', marginBottom: '6px' }}>PRICE/TSUBO</div>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: '#D4AF37', fontFamily: 'monospace' }}>145万円</div>
                  </div>

                  {/* MARKET TEMPERATURE（全幅） */}
                  <div style={{ gridColumn: '1 / -1', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', letterSpacing: '2px', fontFamily: 'monospace' }}>MARKET TEMPERATURE</span>
                      <span style={{ fontSize: '13px', fontWeight: '700', color: '#D4AF37', fontFamily: 'monospace' }}>78%</span>
                    </div>
                    <div style={{ height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', background: 'linear-gradient(90deg, #1d6fcc, #22c55e, #D4AF37)', borderRadius: '2px', animation: 'gaugeGrow 1.5s ease forwards' }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                      <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.2)', fontFamily: 'monospace' }}>COLD</span>
                      <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.2)', fontFamily: 'monospace' }}>HOT</span>
                    </div>
                  </div>

                  {/* PRO ONLY - 将来予測 */}
                  <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '12px', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', inset: 0, backdropFilter: 'blur(4px)', background: 'rgba(5,11,29,0.6)', borderRadius: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ marginBottom: '4px', animation: 'lockPulse 2s infinite' }}>
                        <rect x="2" y="6" width="10" height="8" rx="1.5" stroke="rgba(212,175,55,0.6)" strokeWidth="1.2"/>
                        <path d="M4 6V4.5C4 2.8 5.3 1.5 7 1.5C8.7 1.5 10 2.8 10 4.5V6" stroke="rgba(212,175,55,0.6)" strokeWidth="1.2" strokeLinecap="round"/>
                      </svg>
                      <span style={{ fontSize: '9px', color: 'rgba(212,175,55,0.6)', letterSpacing: '2px', fontFamily: 'monospace' }}>PRO ONLY</span>
                    </div>
                    <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.2)', letterSpacing: '1px', marginBottom: '6px', fontFamily: 'monospace' }}>FORECAST +6M</div>
                    <div style={{ fontSize: '16px', fontWeight: '700', color: 'rgba(74,222,128,0.5)', fontFamily: 'monospace' }}>+4.2%</div>
                  </div>

                  {/* PRO ONLY - AI信頼度 */}
                  <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '12px', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', inset: 0, backdropFilter: 'blur(4px)', background: 'rgba(5,11,29,0.6)', borderRadius: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ marginBottom: '4px', animation: 'lockPulse 2s infinite' }}>
                        <rect x="2" y="6" width="10" height="8" rx="1.5" stroke="rgba(212,175,55,0.6)" strokeWidth="1.2"/>
                        <path d="M4 6V4.5C4 2.8 5.3 1.5 7 1.5C8.7 1.5 10 2.8 10 4.5V6" stroke="rgba(212,175,55,0.6)" strokeWidth="1.2" strokeLinecap="round"/>
                      </svg>
                      <span style={{ fontSize: '9px', color: 'rgba(212,175,55,0.6)', letterSpacing: '2px', fontFamily: 'monospace' }}>PRO ONLY</span>
                    </div>
                    <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.2)', letterSpacing: '1px', marginBottom: '6px', fontFamily: 'monospace' }}>AI CONFIDENCE</div>
                    <div style={{ fontSize: '16px', fontWeight: '700', color: 'rgba(74,222,128,0.5)', fontFamily: 'monospace' }}>92%</div>
                  </div>
                </div>

                {user !== null ? (
                  <div style={{ marginTop: '4px', padding: '10px 14px', background: 'rgba(212,175,55,0.05)', border: '1px solid rgba(212,175,55,0.15)', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#D4AF37', flexShrink: 0 }} />
                    <div style={{ fontSize: '12px', color: 'rgba(212,175,55,0.7)' }}>
                      会員特典：査定履歴が自動保存されます
                    </div>
                  </div>
                ) : null}

                {/* CTA 2本 */}
                <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                  <button
                    onClick={() => window.open('https://house-ai.co.jp', '_blank')}
                    style={{
                      flex: 1, padding: '12px 8px',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: '10px', color: 'rgba(255,255,255,0.7)',
                      fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit',
                    }}
                  >
                    公示価格を見る
                  </button>
                  <button
                    onClick={() => setShowVendorModal(true)}
                    style={{
                      flex: 1, padding: '12px 8px',
                      background: 'linear-gradient(135deg, rgba(212,175,55,0.15), rgba(212,175,55,0.08))',
                      border: '1px solid rgba(212,175,55,0.4)',
                      borderRadius: '10px', color: '#D4AF37',
                      fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit',
                    }}
                  >
                    業者査定依頼（無料）
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}
