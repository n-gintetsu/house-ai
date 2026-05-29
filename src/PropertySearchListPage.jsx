import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SlidersHorizontal, X, Heart, MessageSquare, Calendar, MapPin, Train, Building, Home } from 'lucide-react';
import AreaAutocomplete from './AreaAutocomplete';
import { supabase } from './supabaseClient';

// ── 定数 ────────────────────────────────────────────
const DEAL_TYPES = [
  { id: 'rent', label: '賃貸' },
  { id: 'sale', label: '売買' },
  { id: 'investment', label: '投資' },
];
const LAYOUTS = ['1R','1K','1DK','1LDK','2DK','2LDK','3LDK','4LDK+'];
const AI_TAGS = ['在宅ワーク向き','駅近','静かな環境','自然光','ペット可','高級感','ファミリー向き','初期費用安め','投資向き','利回り重視'];
const SORT_OPTIONS = [
  { id:'ai', label:'AIおすすめ順' },
  { id:'new', label:'新着順' },
  { id:'price_asc', label:'価格が安い順' },
  { id:'station', label:'駅近順' },
  { id:'size', label:'広さ順' },
];

const MOCK = [
  { id:'m1', title:'プレミアム渋谷タワーレジデンス', area:'東京都渋谷区', price:280000, priceLabel:'28万円/月', layout:'2LDK', walkMin:3, ageYear:2, image:'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400', dealType:'rent', aiComment:'在宅ワーク向きの広いリビング、防音設備充実、眺望良好', tags:['在宅ワーク向き','駅近','高級感'], agent:'プレミアム不動産', size:68 },
  { id:'m2', title:'恵比寿デザイナーズマンション', area:'東京都渋谷区恵比寿', price:220000, priceLabel:'22万円/月', layout:'1LDK', walkMin:5, ageYear:8, image:'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400', dealType:'rent', aiComment:'おしゃれな内装、自然光たっぷり、静かな住環境', tags:['自然光','静かな環境','高級感'], agent:'スタイル住宅', size:52 },
  { id:'m3', title:'新宿ビジネスアクセス好立地', area:'東京都新宿区', price:180000, priceLabel:'18万円/月', layout:'1LDK', walkMin:2, ageYear:5, image:'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400', dealType:'rent', aiComment:'駅徒歩2分、ビジネス利用に最適、セキュリティ万全', tags:['駅近','在宅ワーク向き'], agent:'新宿不動産センター', size:45 },
  { id:'m4', title:'世田谷ファミリーマンション', area:'東京都世田谷区', price:250000, priceLabel:'25万円/月', layout:'3LDK', walkMin:8, ageYear:12, image:'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400', dealType:'rent', aiComment:'広々3LDK、学区良好、公園近く', tags:['ファミリー向き','ペット可'], agent:'世田谷ハウス', size:85 },
  { id:'m5', title:'目黒区投資用一棟マンション', area:'東京都目黒区', price:85000000, priceLabel:'8,500万円', layout:'1K×8', walkMin:6, ageYear:18, image:'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=400', dealType:'investment', aiComment:'表面利回り5.8%、満室稼働中', tags:['投資向き','利回り重視'], agent:'投資不動産プロ', size:32 },
  { id:'m6', title:'港区タワーマンション高層階', area:'東京都港区', price:380000, priceLabel:'38万円/月', layout:'2LDK', walkMin:4, ageYear:1, image:'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=400', dealType:'rent', aiComment:'築1年・眺望最高・フルスペック設備', tags:['高級感','自然光','駅近'], agent:'港区プレミアム', size:72 },
];

function calcScore(property, filters) {
  let score = 60;
  if (filters.dealType && property.dealType === filters.dealType) score += 20;
  if (filters.areas.length > 0 && filters.areas.some(a => property.area.includes(a))) score += 15;
  if (filters.maxPrice && property.price <= parseInt(filters.maxPrice) * 10000) score += 10;
  if (filters.layouts.length > 0 && filters.layouts.includes(property.layout)) score += 10;
  const tagMatch = filters.aiTags.filter(t => (property.tags || []).includes(t)).length;
  score += tagMatch * 5;
  return Math.min(99, score);
}

// ── サブコンポーネント（必ずファイルトップレベルで定義）────
function ScoreBadge({ score }) {
  const color = score >= 90 ? '#22c55e' : score >= 80 ? '#3b82f6' : score >= 70 ? '#f59e0b' : '#6b7280';
  const label = score >= 90 ? '高相性' : score >= 80 ? 'おすすめ' : score >= 70 ? '条件近い' : '参考候補';
  return (
    <span style={{ background:`${color}22`, border:`1px solid ${color}44`, borderRadius:9999, padding:'3px 8px', fontSize:11, fontWeight:700, color, display:'inline-flex', alignItems:'center', gap:4 }}>
      AI相性 {score}% {label}
    </span>
  );
}

function PropertyCard({ property, score, saved, onSave }) {
  return (
    <div style={{ background:'#1a1a24', border:'1px solid rgba(255,255,255,0.1)', borderRadius:12, overflow:'hidden' }}>
      <div style={{ position:'relative' }}>
        <img src={property.image} alt={property.title} style={{ width:'100%', height:180, objectFit:'cover', display:'block' }} />
        <div style={{ position:'absolute', top:10, left:10 }}><ScoreBadge score={score} /></div>
        <button onClick={() => onSave(property.id)} style={{ position:'absolute', top:10, right:10, background:'rgba(0,0,0,0.5)', border:'none', borderRadius:'50%', width:34, height:34, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color: saved ? '#ef4444' : '#fff' }}>
          <Heart size={16} fill={saved ? '#ef4444' : 'none'} />
        </button>
      </div>
      <div style={{ padding:16 }}>
        <h3 style={{ fontSize:15, fontWeight:700, color:'#fff', marginBottom:6 }}>{property.title}</h3>
        <div style={{ fontSize:20, fontWeight:700, color:'#eab308', marginBottom:8 }}>{property.priceLabel}</div>
        <div style={{ display:'flex', flexWrap:'wrap', gap:10, fontSize:13, color:'#9ca3af', marginBottom:10 }}>
          <span style={{ display:'flex', alignItems:'center', gap:4 }}><MapPin size={12} />{property.area}</span>
          <span style={{ display:'flex', alignItems:'center', gap:4 }}><Home size={12} />{property.layout}</span>
          <span style={{ display:'flex', alignItems:'center', gap:4 }}><Train size={12} />徒歩{property.walkMin}分</span>
          <span style={{ display:'flex', alignItems:'center', gap:4 }}><Building size={12} />築{property.ageYear}年</span>
        </div>
        <div style={{ background:'rgba(99,102,241,0.1)', border:'1px solid rgba(99,102,241,0.2)', borderRadius:8, padding:'8px 12px', fontSize:12, color:'#a5b4fc', marginBottom:10 }}>
          ✦ {property.aiComment}
        </div>
        {(property.tags || []).length > 0 ? (
          <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:10 }}>
            {property.tags.map(t => (
              <span key={t} style={{ fontSize:11, padding:'2px 8px', borderRadius:9999, background:'rgba(234,179,8,0.1)', color:'#facc15', border:'1px solid rgba(234,179,8,0.2)' }}>{t}</span>
            ))}
          </div>
        ) : null}
        <div style={{ fontSize:12, color:'#6b7280', marginBottom:12 }}>提携: {property.agent}</div>
        <div style={{ display:'flex', gap:8 }}>
          <button style={{ flex:1, padding:'8px 0', background:'linear-gradient(90deg,#eab308,#ca8a04)', color:'#000', border:'none', borderRadius:6, fontWeight:700, fontSize:13, cursor:'pointer' }}>詳細を見る</button>
          <button style={{ padding:'8px 10px', background:'rgba(99,102,241,0.2)', color:'#a5b4fc', border:'1px solid rgba(99,102,241,0.3)', borderRadius:6, fontSize:12, cursor:'pointer', display:'flex', alignItems:'center', gap:4 }}><MessageSquare size={13} />AI相談</button>
          <button style={{ padding:'8px 10px', background:'rgba(34,197,94,0.1)', color:'#4ade80', border:'1px solid rgba(34,197,94,0.2)', borderRadius:6, fontSize:12, cursor:'pointer', display:'flex', alignItems:'center', gap:4 }}><Calendar size={13} />内見</button>
        </div>
      </div>
    </div>
  );
}

function ZeroResults({ onRetry, navigate }) {
  return (
    <div style={{ textAlign:'center', padding:'64px 24px' }}>
      <div style={{ fontSize:48, marginBottom:16 }}>🔍</div>
      <h3 style={{ fontSize:20, color:'#fff', marginBottom:12 }}>条件に近い掲載物件が見つかりませんでした</h3>
      <p style={{ fontSize:14, color:'#9ca3af', marginBottom:32, lineHeight:1.8 }}>
        現在の掲載物件では一致する物件がありませんでした。<br />
        House-AIなら、掲載されていない物件や業者側の非公開情報も含めて探せます。
      </p>
      <div style={{ display:'flex', flexDirection:'column', gap:12, maxWidth:320, margin:'0 auto' }}>
        <button onClick={() => navigate('/community/create')} style={{ padding:'14px', background:'linear-gradient(90deg,#eab308,#ca8a04)', color:'#000', border:'none', borderRadius:8, fontWeight:700, fontSize:14, cursor:'pointer' }}>住まい相談室に投稿する</button>
        <button onClick={() => navigate('/consultation')} style={{ padding:'14px', background:'rgba(99,102,241,0.2)', color:'#a5b4fc', border:'1px solid rgba(99,102,241,0.3)', borderRadius:8, fontSize:14, cursor:'pointer' }}>AIに条件に合う業者を探してもらう</button>
        <button onClick={onRetry} style={{ padding:'14px', background:'transparent', color:'#9ca3af', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, fontSize:14, cursor:'pointer' }}>条件をゆるめて再検索する</button>
      </div>
    </div>
  );
}

function BackModal({ onClose, onBack, navigate }) {
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.8)', zIndex:100, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
      <div style={{ background:'#1a1a24', border:'1px solid rgba(255,255,255,0.1)', borderRadius:16, padding:32, maxWidth:400, width:'100%' }}>
        <h3 style={{ fontSize:18, color:'#fff', marginBottom:12 }}>このまま戻りますか？</h3>
        <p style={{ fontSize:14, color:'#9ca3af', marginBottom:24, lineHeight:1.8 }}>条件に合う物件が見つからない場合、非公開物件を持つ業者へ希望条件を送ることもできます。</p>
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          <button onClick={() => navigate('/community/create')} style={{ padding:'12px', background:'linear-gradient(90deg,#eab308,#ca8a04)', color:'#000', border:'none', borderRadius:8, fontWeight:700, cursor:'pointer' }}>住まい相談室に投稿する</button>
          <button onClick={() => navigate('/consultation')} style={{ padding:'12px', background:'rgba(99,102,241,0.2)', color:'#a5b4fc', border:'1px solid rgba(99,102,241,0.3)', borderRadius:8, cursor:'pointer' }}>業者を探してもらう</button>
          <button onClick={onBack} style={{ padding:'12px', background:'transparent', color:'#9ca3af', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, cursor:'pointer' }}>そのまま戻る</button>
        </div>
      </div>
    </div>
  );
}

// ── メインコンポーネント ────────────────────────────
export default function PropertySearchListPage() {
  const navigate = useNavigate();

  // 入力中の状態（検索ボタン押すまでフィルタに反映しない）
  const [inputAreas, setInputAreas] = useState([]);
  const [inputDealType, setInputDealType] = useState('');
  const [inputLayouts, setInputLayouts] = useState([]);
  const [inputMaxPrice, setInputMaxPrice] = useState('');
  const [inputMaxWalk, setInputMaxWalk] = useState('');
  const [inputAiTags, setInputAiTags] = useState([]);

  // 適用済みフィルタ（物件表示に使う）
  const [filters, setFilters] = useState({ areas:[], dealType:'', layouts:[], maxPrice:'', maxWalk:'', aiTags:[] });

  const [sortBy, setSortBy] = useState('ai');
  const [properties, setProperties] = useState(MOCK);
  const [saved, setSaved] = useState([]);
  const [showFilter, setShowFilter] = useState(false);
  const [showBackModal, setShowBackModal] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 900);

  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 900);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data, error } = await supabase.from('properties').select('*').limit(20);
        if (!error && data && data.length > 0) {
          const mapped = data.map(p => ({
            id: p.id,
            title: p.name || p.title || '物件',
            area: p.address || p.area || '',
            price: p.price || p.rent || 0,
            priceLabel: p.price ? `${Math.round(p.price/10000)}万円` : p.rent ? `${(p.rent/10000).toFixed(1)}万円/月` : '価格未定',
            layout: p.layout || p.floor_plan || '',
            walkMin: p.walk_minutes || p.station_walk || 0,
            ageYear: p.building_age || 0,
            image: p.image_url || MOCK[0].image,
            dealType: p.deal_type || 'rent',
            aiComment: p.description || 'House-AIが分析中です',
            tags: [],
            agent: p.agent_name || 'House-AI提携業者',
            size: p.size || 0,
          }));
          setProperties(mapped);
        }
      } catch (e) { /* use mock */ }
    };
    fetch();
  }, []);

  const applySearch = () => {
    setFilters({ areas: inputAreas, dealType: inputDealType, layouts: inputLayouts, maxPrice: inputMaxPrice, maxWalk: inputMaxWalk, aiTags: inputAiTags });
    if (isMobile) setShowFilter(false);
  };

  const resetAll = () => {
    setInputAreas([]); setInputDealType(''); setInputLayouts([]);
    setInputMaxPrice(''); setInputMaxWalk(''); setInputAiTags([]);
    setFilters({ areas:[], dealType:'', layouts:[], maxPrice:'', maxWalk:'', aiTags:[] });
  };

  const toggleLayout = (l) => setInputLayouts(prev => prev.includes(l) ? prev.filter(x => x !== l) : [...prev, l]);
  const toggleTag = (t) => setInputAiTags(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  const toggleSave = (id) => setSaved(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const scored = properties.map(p => ({ ...p, score: calcScore(p, filters) }));
  const filtered = scored.filter(p => {
    if (filters.dealType && p.dealType !== filters.dealType) return false;
    if (filters.areas.length > 0 && !filters.areas.some(a => p.area.includes(a))) return false;
    if (filters.maxPrice && p.price > parseInt(filters.maxPrice) * 10000) return false;
    if (filters.layouts.length > 0 && !filters.layouts.includes(p.layout)) return false;
    if (filters.maxWalk && p.walkMin > parseInt(filters.maxWalk)) return false;
    return true;
  });
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'ai') return b.score - a.score;
    if (sortBy === 'price_asc') return a.price - b.price;
    if (sortBy === 'station') return a.walkMin - b.walkMin;
    if (sortBy === 'size') return b.size - a.size;
    return 0;
  });

  const iStyle = { width:'100%', padding:'10px 12px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, color:'#fff', fontSize:16, boxSizing:'border-box' };
  const lStyle = { fontSize:13, color:'#9ca3af', display:'block', marginBottom:8 };
  const tagBtn = (active) => ({ padding:'6px 12px', borderRadius:9999, border: active ? 'none' : '1px solid rgba(255,255,255,0.1)', background: active ? '#eab308' : 'transparent', color: active ? '#000' : '#9ca3af', fontSize:13, cursor:'pointer', fontWeight: active ? 700 : 400 });

  const FilterContent = (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
      <div>
        <label style={lStyle}>エリア（複数選択可）</label>
        <AreaAutocomplete selectedAreas={inputAreas} onAreasChange={setInputAreas} />
      </div>
      <div>
        <label style={lStyle}>物件種別</label>
        <div style={{ display:'flex', gap:8 }}>
          {DEAL_TYPES.map(t => (
            <button key={t.id} onClick={() => setInputDealType(prev => prev === t.id ? '' : t.id)} style={{ ...tagBtn(inputDealType === t.id), flex:1 }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label style={lStyle}>賃料/価格上限（万円）</label>
        <input type="number" placeholder="上限なし" value={inputMaxPrice} onChange={e => setInputMaxPrice(e.target.value)} style={iStyle} />
      </div>
      <div>
        <label style={lStyle}>間取り</label>
        <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
          {LAYOUTS.map(l => (
            <button key={l} onClick={() => toggleLayout(l)} style={tagBtn(inputLayouts.includes(l))}>
              {l}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label style={lStyle}>駅徒歩（分以内）</label>
        <input type="number" placeholder="指定なし" value={inputMaxWalk} onChange={e => setInputMaxWalk(e.target.value)} style={iStyle} />
      </div>
      <div>
        <label style={lStyle}>AIおすすめ条件</label>
        <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
          {AI_TAGS.map(t => (
            <button key={t} onClick={() => toggleTag(t)}
              style={{ padding:'6px 12px', borderRadius:9999, border: inputAiTags.includes(t) ? 'none' : '1px solid rgba(255,255,255,0.1)', background: inputAiTags.includes(t) ? 'rgba(234,179,8,0.2)' : 'transparent', color: inputAiTags.includes(t) ? '#facc15' : '#9ca3af', fontSize:12, cursor:'pointer' }}>
              {t}
            </button>
          ))}
        </div>
      </div>
      <button onClick={resetAll} style={{ padding:'10px', background:'transparent', color:'#6b7280', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, cursor:'pointer', fontSize:13 }}>
        条件をリセット
      </button>
      <motion.button onClick={applySearch}
        animate={{ boxShadow: ['0 0 0px rgba(234,179,8,0)', '0 0 20px rgba(234,179,8,0.8)', '0 0 0px rgba(234,179,8,0)'] }}
        transition={{ duration:2, repeat:Infinity }}
        style={{ width:'100%', padding:'14px 0', background:'linear-gradient(90deg,#eab308,#ca8a04)', color:'#000', border:'none', borderRadius:8, fontWeight:700, fontSize:15, cursor:'pointer' }}>
        この条件で検索
      </motion.button>
    </div>
  );

  return (
    <div style={{ minHeight:'100vh', background:'#0a0a0f', paddingBottom:80 }}>
      {/* Header */}
      <div style={{ borderBottom:'1px solid rgba(255,255,255,0.1)', background:'rgba(10,10,15,0.9)', position:'sticky', top:0, zIndex:20 }}>
        <div style={{ maxWidth:1200, margin:'0 auto', padding:'16px', display:'flex', alignItems:'center', gap:12, flexWrap:'wrap' }}>
          <button onClick={() => setShowBackModal(true)} style={{ background:'none', border:'none', color:'#9ca3af', cursor:'pointer', fontSize:14, display:'flex', alignItems:'center', gap:4 }}>← 戻る</button>
          <div style={{ flex:1 }}>
            <h1 style={{ fontSize:18, color:'#fff', fontWeight:700 }}>掲載物件を一覧で探す</h1>
            <p style={{ fontSize:12, color:'#6b7280' }}>条件を調整しながら、現在掲載中の物件を探せます。</p>
          </div>
          {isMobile ? (
            <button onClick={() => setShowFilter(true)} style={{ padding:'8px 14px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, color:'#fff', cursor:'pointer', display:'flex', alignItems:'center', gap:6, fontSize:13 }}>
              <SlidersHorizontal size={15} />フィルター
            </button>
          ) : null}
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ ...iStyle, width:'auto', fontSize:13, cursor:'pointer', padding:'8px 12px' }}>
            {SORT_OPTIONS.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
          </select>
        </div>
      </div>

      <div style={{ maxWidth:1200, margin:'0 auto', padding:'24px 16px', display: isMobile ? 'block' : 'grid', gridTemplateColumns: isMobile ? undefined : '290px 1fr', gap:24 }}>
        {/* Desktop Filter */}
        {!isMobile ? (
          <div style={{ background:'#0f0f18', border:'1px solid rgba(255,255,255,0.05)', borderRadius:12, padding:20, height:'fit-content', position:'sticky', top:80 }}>
            <h2 style={{ fontSize:15, color:'#fff', fontWeight:700, marginBottom:20, display:'flex', alignItems:'center', gap:8 }}>
              <SlidersHorizontal size={15} color="#eab308" />検索条件
            </h2>
            {FilterContent}
          </div>
        ) : null}

        {/* Results */}
        <div>
          <div style={{ marginBottom:16, padding:'12px 16px', background:'rgba(99,102,241,0.08)', border:'1px solid rgba(99,102,241,0.15)', borderRadius:8 }}>
            <p style={{ fontSize:14, color:'#fff', fontWeight:700 }}>現在の掲載物件 {sorted.length}件見つかりました</p>
            <p style={{ fontSize:12, color:'#9ca3af' }}>条件に近い順にAIが並び替えています</p>
          </div>
          {sorted.length === 0 ? (
            <ZeroResults onRetry={resetAll} navigate={navigate} />
          ) : (
            <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2,1fr)', gap:16 }}>
              {sorted.map(p => (
                <PropertyCard key={p.id} property={p} score={p.score} saved={saved.includes(p.id)} onSave={toggleSave} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Bottom Sheet */}
      {isMobile && showFilter ? (
        <div style={{ position:'fixed', inset:0, zIndex:50 }}>
          <div onClick={() => setShowFilter(false)} style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.7)' }} />
          <div style={{ position:'absolute', bottom:0, left:0, right:0, background:'#1a1a24', borderRadius:'16px 16px 0 0', padding:24, maxHeight:'85vh', overflowY:'auto' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
              <h3 style={{ fontSize:16, color:'#fff', fontWeight:700 }}>検索条件</h3>
              <button onClick={() => setShowFilter(false)} style={{ background:'none', border:'none', color:'#9ca3af', cursor:'pointer' }}><X size={20} /></button>
            </div>
            {FilterContent}
          </div>
        </div>
      ) : null}

      {/* Back Modal */}
      {showBackModal ? (
        <BackModal onClose={() => setShowBackModal(false)} onBack={() => { setShowBackModal(false); navigate(-1); }} navigate={navigate} />
      ) : null}
    </div>
  );
}
