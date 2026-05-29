import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { X, Sparkles, Search, DollarSign, Clock, ShieldCheck, Home as HomeIcon, MapPin } from 'lucide-react';

const categories = ['賃貸','住宅購入','投資','売却','空き家','住宅ローン','相続','リフォーム','引越し','火災保険','土地活用'];
const aiLoadingLogs = ['あなた向け条件を整理しています...','似た相談事例を分析中...','エリア情報を確認しています...','AI提案を準備しています...'];
const ageRanges = ['10代','20代','30代','40代','50代','60代〜'];

export default function AIDiagnosisModal({ open, onOpenChange }) {
  const [step, setStep] = useState(1);
  const [selections, setSelections] = useState({});
  const [currentLog, setCurrentLog] = useState(0);

  useEffect(() => {
    if (!open) { setTimeout(() => { setStep(1); setSelections({}); setCurrentLog(0); }, 300); }
  }, [open]);

  useEffect(() => {
    if (step === 4) {
      let i = 0;
      const iv = setInterval(() => {
        i++;
        if (i < aiLoadingLogs.length) { setCurrentLog(i); }
        else { clearInterval(iv); setTimeout(() => setStep('preview'), 500); }
      }, 600);
      return () => clearInterval(iv);
    }
  }, [step]);

  const handleUserTypeSelect = (type) => { setSelections({ ...selections, userType: type }); setTimeout(() => setStep(2), 400); };
  const handleCategorySelect = (cat) => { setSelections({ ...selections, category: cat }); setTimeout(() => setStep(3), 400); };
  const handlePrioritySelect = (p) => { setSelections({ ...selections, priority: p }); setTimeout(() => setStep(4), 400); };
  const handleSubmit = () => { onOpenChange(false); };

  if (!open) { return null; }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div onClick={() => onOpenChange(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} style={{ position: 'relative', width: '100%', maxWidth: '720px', maxHeight: '90vh', overflowY: 'auto', background: 'white', borderRadius: '32px', boxShadow: '0 25px 50px rgba(0,0,0,0.25)', zIndex: 1 }}>

        {/* Header */}
        <div style={{ position: 'sticky', top: 0, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)', borderBottom: '1px solid #F3F4F6', padding: '24px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: '32px 32px 0 0', zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #3b82f6, #2563eb)', display: 'grid', placeItems: 'center' }}>
              <Sparkles size={20} color="white" />
            </div>
            <span style={{ fontSize: '14px', color: '#4B5563' }}>House-AI Engine</span>
          </div>
          {typeof step === 'number' && step <= 3 ? (
            <span style={{ fontSize: '14px', color: '#6B7280' }}>STEP {step} / 3</span>
          ) : null}
          {step === 'preview' ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#16a34a' }}>
              <motion.div style={{ width: '8px', height: '8px', background: '#22c55e', borderRadius: '50%' }} animate={{ scale: [1,1.2,1], opacity: [0.5,1,0.5] }} transition={{ duration: 2, repeat: Infinity }} />
              AI分析完了
            </div>
          ) : null}
          <button onClick={() => onOpenChange(false)} style={{ width: '32px', height: '32px', borderRadius: '8px', border: 'none', background: 'none', cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
            <X size={20} color="#9CA3AF" />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '40px 32px' }}>
          <AnimatePresence mode="wait">

            {/* Step 1 */}
            {step === 1 ? (
              <motion.div key="s1" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }} transition={{ duration:0.3 }}>
                <h2 style={{ fontSize: '28px', fontWeight: 700, textAlign: 'center', marginBottom: '12px' }}>あなたはどちらのタイプですか？</h2>
                <p style={{ color: '#6B7280', textAlign: 'center', marginBottom: '40px' }}>AIがあなた向けに進め方を整理します</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  <motion.button whileHover={{ scale:1.02, y:-4 }} onClick={() => handleUserTypeSelect('compare')} style={{ padding: '32px', borderRadius: '20px', border: '2px solid #E5E7EB', background: 'white', cursor: 'pointer', transition: 'border-color 0.2s' }} onMouseEnter={e=>e.currentTarget.style.borderColor='#60a5fa'} onMouseLeave={e=>e.currentTarget.style.borderColor='#E5E7EB'}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: '#EFF6FF', display: 'grid', placeItems: 'center', margin: '0 auto 16px' }}>
                      <Search size={28} color="#2563eb" />
                    </div>
                    <div style={{ textAlign: 'center', fontWeight: 600, marginBottom: '8px' }}>自分で比較しながら探したい</div>
                    <div style={{ textAlign: 'center', fontSize: '14px', color: '#6B7280' }}>詳しく見て決めたい方</div>
                  </motion.button>
                  <motion.button whileHover={{ scale:1.02, y:-4 }} onClick={() => handleUserTypeSelect('ai-suggest')} style={{ padding: '32px', borderRadius: '20px', border: '2px solid #E5E7EB', background: 'white', cursor: 'pointer', transition: 'border-color 0.2s' }} onMouseEnter={e=>e.currentTarget.style.borderColor='#60a5fa'} onMouseLeave={e=>e.currentTarget.style.borderColor='#E5E7EB'}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'linear-gradient(135deg, #3b82f6, #9333ea)', display: 'grid', placeItems: 'center', margin: '0 auto 16px' }}>
                      <Sparkles size={28} color="white" />
                    </div>
                    <div style={{ textAlign: 'center', fontWeight: 600, marginBottom: '8px' }}>AIにおすすめ提案してほしい</div>
                    <div style={{ textAlign: 'center', fontSize: '14px', color: '#6B7280' }}>AIに任せたい方</div>
                  </motion.button>
                </div>
              </motion.div>
            ) : null}

            {/* Step 2 */}
            {step === 2 ? (
              <motion.div key="s2" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }} transition={{ duration:0.3 }}>
                <h2 style={{ fontSize: '28px', fontWeight: 700, textAlign: 'center', marginBottom: '12px' }}>何についてお悩みですか？</h2>
                <p style={{ color: '#6B7280', textAlign: 'center', marginBottom: '40px' }}>複数選択可能です</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center', maxWidth: '560px', margin: '0 auto' }}>
                  {categories.map(cat => (
                    <motion.button key={cat} whileHover={{ scale:1.05 }} whileTap={{ scale:0.95 }} onClick={() => handleCategorySelect(cat)} style={{ padding: '12px 24px', borderRadius: '999px', border: `2px solid ${selections.category === cat ? '#2563eb' : '#E5E7EB'}`, background: selections.category === cat ? 'linear-gradient(to right, #3b82f6, #2563eb)' : 'white', color: selections.category === cat ? 'white' : '#374151', fontWeight: 600, cursor: 'pointer', fontSize: '14px' }}>
                      {cat}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            ) : null}

            {/* Step 3 */}
            {step === 3 ? (
              <motion.div key="s3" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }} transition={{ duration:0.3 }}>
                <h2 style={{ fontSize: '28px', fontWeight: 700, textAlign: 'center', marginBottom: '12px' }}>何を重点的に解決したいですか？</h2>
                <p style={{ color: '#6B7280', textAlign: 'center', marginBottom: '40px' }}>最も優先したいものを選んでください</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px', maxWidth: '600px', margin: '0 auto' }}>
                  {[
                    { key:'price', icon:<DollarSign size={24} color="#16a34a" />, label:'価格を抑えたい', bg:'#F0FDF4' },
                    { key:'time', icon:<Clock size={24} color="#2563eb" />, label:'時間を短縮したい', bg:'#EFF6FF' },
                    { key:'safety', icon:<ShieldCheck size={24} color="#9333ea" />, label:'失敗したくない', bg:'#FAF5FF' },
                  ].map(item => (
                    <motion.button key={item.key} whileHover={{ scale:1.02, y:-4 }} onClick={() => handlePrioritySelect(item.key)} style={{ padding: '24px', borderRadius: '20px', border: '2px solid #E5E7EB', background: 'white', cursor: 'pointer', textAlign: 'center', transition: 'border-color 0.2s' }} onMouseEnter={e=>e.currentTarget.style.borderColor='#60a5fa'} onMouseLeave={e=>e.currentTarget.style.borderColor='#E5E7EB'}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: item.bg, display: 'grid', placeItems: 'center', margin: '0 auto 12px' }}>{item.icon}</div>
                      <div style={{ fontWeight: 600, fontSize: '14px' }}>{item.label}</div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            ) : null}

            {/* Step 4: Loading */}
            {step === 4 ? (
              <motion.div key="s4" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} style={{ padding: '64px 0', textAlign: 'center' }}>
                <motion.div style={{ width: '96px', height: '96px', borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #9333ea)', display: 'grid', placeItems: 'center', margin: '0 auto 32px' }} animate={{ scale:[1,1.1,1], boxShadow:['0 0 20px rgba(59,130,246,0.3)','0 0 40px rgba(59,130,246,0.6)','0 0 20px rgba(59,130,246,0.3)'] }} transition={{ duration:2, repeat:Infinity }}>
                  <Sparkles size={48} color="white" />
                </motion.div>
                <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '24px' }}>AI解析中</h2>
                <AnimatePresence mode="wait">
                  <motion.p key={currentLog} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-10 }} style={{ color: '#4B5563', marginBottom: '24px' }}>
                    {aiLoadingLogs[currentLog]}
                  </motion.p>
                </AnimatePresence>
                <div style={{ height: '4px', background: '#F3F4F6', borderRadius: '999px', overflow: 'hidden', maxWidth: '300px', margin: '0 auto' }}>
                  <motion.div style={{ height: '100%', background: 'linear-gradient(to right, #3b82f6, #9333ea)', borderRadius: '999px' }} initial={{ width:'0%' }} animate={{ width:'100%' }} transition={{ duration:2.4 }} />
                </div>
              </motion.div>
            ) : null}

            {/* Preview */}
            {step === 'preview' ? (
              <motion.div key="prev" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} style={{ padding: '32px 0' }}>
                <div style={{ maxWidth: '560px', margin: '0 auto' }}>
                  <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <h2 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px' }}>あなた向けに整理しました</h2>
                    <p style={{ color: '#6B7280', fontSize: '14px' }}>AIが条件・悩み・優先順位を分析しています</p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
                    {[
                      { bg:'linear-gradient(135deg,#EFF6FF,#FAF5FF)', border:'rgba(196,221,255,0.5)', iconBg:'linear-gradient(135deg,#3b82f6,#9333ea)', icon:<Sparkles size={24} color="white" />, title:`あなたは「${selections.priority==='price'?'コスト重視':selections.priority==='time'?'時間重視':'安全重視'}タイプ」です`, body: selections.priority==='price'?'価格を抑えながら、最適な選択肢を見つけたい傾向があります。':selections.priority==='time'?'比較よりも、早く最適解にたどり着きたい傾向があります。':'慎重に検討し、失敗を避けたい傾向があります。' },
                      { bg:'linear-gradient(135deg,#F0FDF4,#EFF6FF)', border:'rgba(187,247,208,0.5)', iconBg:'linear-gradient(135deg,#22c55e,#16a34a)', icon:<HomeIcon size={24} color="white" />, title:`${selections.category || '住宅ローン'}比較との相性が高いです`, body: selections.priority==='safety'?'固定・変動の違いをAI整理すると失敗率を下げられます。':'AIが最適な選択肢を絞り込み、スムーズに進められます。' },
                      { bg:'linear-gradient(135deg,#FAF5FF,#FDF2F8)', border:'rgba(233,213,255,0.5)', iconBg:'linear-gradient(135deg,#a855f7,#ec4899)', icon:<MapPin size={24} color="white" />, title:'同じ悩みを持つ方が増えています', body:'最近は返済不安・比較相談が増加中です。AIが最新の傾向を踏まえて提案します。' },
                    ].map((c,i) => (
                      <motion.div key={i} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2+i*0.2 }} style={{ background:c.bg, borderRadius:'20px', padding:'24px', border:`1px solid ${c.border}` }}>
                        <div style={{ display:'flex', gap:'16px', alignItems:'flex-start' }}>
                          <div style={{ width:'48px', height:'48px', borderRadius:'14px', background:c.iconBg, display:'grid', placeItems:'center', flexShrink:0 }}>{c.icon}</div>
                          <div>
                            <h3 style={{ fontWeight:700, marginBottom:'8px' }}>{c.title}</h3>
                            <p style={{ fontSize:'14px', color:'#374151', lineHeight:1.7 }}>{c.body}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  <button onClick={() => setStep(5)} style={{ width:'100%', padding:'16px', borderRadius:'20px', border:'none', background:'linear-gradient(to right,#a16207,#ca8a04)', color:'white', fontWeight:700, fontSize:'16px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px' }}>
                    <Sparkles size={18} /> 無料で続きを見る
                  </button>
                  <p style={{ textAlign:'center', fontSize:'12px', color:'#9CA3AF', marginTop:'12px' }}>登録後すぐAI提案を表示します</p>
                </div>
              </motion.div>
            ) : null}

            {/* Step 5: Form */}
            {step === 5 ? (
              <motion.div key="s5" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }} transition={{ duration:0.3 }}>
                <h2 style={{ fontSize:'28px', fontWeight:700, textAlign:'center', marginBottom:'12px' }}>AI提案を受け取る</h2>
                <div style={{ display:'flex', flexWrap:'wrap', gap:'8px', justifyContent:'center', marginBottom:'32px' }}>
                  {selections.category ? <div style={{ padding:'4px 14px', background:'#EFF6FF', color:'#1d4ed8', fontSize:'14px', borderRadius:'999px' }}>{selections.category}</div> : null}
                  {selections.priority ? <div style={{ padding:'4px 14px', background:'#EFF6FF', color:'#1d4ed8', fontSize:'14px', borderRadius:'999px' }}>{selections.priority==='price'?'価格を抑えたい':selections.priority==='time'?'時間を短縮したい':'失敗したくない'}</div> : null}
                </div>
                <div style={{ maxWidth:'440px', margin:'0 auto', display:'flex', flexDirection:'column', gap:'20px' }}>
                  {[
                    { label:'ニックネーム（仮名OK）', type:'text', placeholder:'山田太郎', key:'name' },
                    { label:'メールアドレス', type:'email', placeholder:'example@email.com', key:'email' },
                    { label:'パスワード（8文字以上）', type:'password', placeholder:'8文字以上', key:'password' },
                  ].map(field => (
                    <div key={field.key}>
                      <label style={{ display:'block', fontSize:'14px', marginBottom:'8px', color:'#374151' }}>{field.label}</label>
                      <input type={field.type} placeholder={field.placeholder} onChange={e=>setSelections({...selections,[field.key]:e.target.value})} style={{ width:'100%', padding:'14px 16px', borderRadius:'14px', border:'1px solid #E5E7EB', fontSize:'16px', outline:'none', boxSizing:'border-box' }} onFocus={e=>e.target.style.borderColor='#60a5fa'} onBlur={e=>e.target.style.borderColor='#E5E7EB'} />
                    </div>
                  ))}
                  <div>
                    <label style={{ display:'block', fontSize:'14px', marginBottom:'8px', color:'#374151' }}>年代</label>
                    <select onChange={e=>setSelections({...selections,age:e.target.value})} style={{ width:'100%', padding:'14px 16px', borderRadius:'14px', border:'1px solid #E5E7EB', fontSize:'16px', outline:'none', background:'white' }}>
                      <option value="">選択してください</option>
                      {ageRanges.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                  </div>
                  <button onClick={handleSubmit} style={{ width:'100%', padding:'16px', borderRadius:'20px', border:'none', background:'linear-gradient(to right,#a16207,#ca8a04)', color:'white', fontWeight:700, fontSize:'16px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', marginTop:'8px' }}>
                    <Sparkles size={18} /> AI分析を開始する
                  </button>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px', fontSize:'12px', color:'#6B7280', paddingTop:'8px' }}>
                    {['営業電話なし','完全無料','AIのみ利用OK','後から専門家相談可能'].map(t => (
                      <div key={t} style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                        <div style={{ width:'6px', height:'6px', background:'#22c55e', borderRadius:'50%' }} />{t}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : null}

          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
