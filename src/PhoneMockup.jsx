import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'motion/react';
import { Calculator, TrendingUp, Home, BarChart3, Search, Sparkles } from 'lucide-react';

const aiTools = [
  { id: 'loan', icon: <Calculator size={24} />, category: '購入向け', categoryColor: 'from-blue-400 to-cyan-400', title: 'AI住宅ローン診断', description: '月々返済・借入可能額をAI分析', gradientFrom: 'rgba(59,130,246,0.1)', gradientTo: 'rgba(6,182,212,0.1)' },
  { id: 'market', icon: <TrendingUp size={24} />, category: '売却向け', categoryColor: 'from-violet-400 to-purple-400', title: 'AI相場分析', description: '周辺価格・成約事例をAI予測', gradientFrom: 'rgba(139,92,246,0.1)', gradientTo: 'rgba(168,85,247,0.1)' },
  { id: 'investment', icon: <BarChart3 size={24} />, category: '投資向け', categoryColor: 'from-amber-400 to-orange-400', title: 'AI投資分析', description: '利回り・空室率をAI分析', gradientFrom: 'rgba(251,191,36,0.1)', gradientTo: 'rgba(251,146,60,0.1)' },
  { id: 'inspection', icon: <Search size={24} />, category: '初心者向け', categoryColor: 'from-emerald-400 to-teal-400', title: 'AI内見チェック', description: '確認ポイントをAIが整理', gradientFrom: 'rgba(52,211,153,0.1)', gradientTo: 'rgba(20,184,166,0.1)' },
  { id: 'recommend', icon: <Home size={24} />, category: '購入向け', categoryColor: 'from-rose-400 to-pink-400', title: 'AI物件マッチング', description: '最適な物件をAIが提案', gradientFrom: 'rgba(251,113,133,0.1)', gradientTo: 'rgba(244,114,182,0.1)' },
  { id: 'area', icon: <Sparkles size={24} />, category: '初心者向け', categoryColor: 'from-indigo-400 to-blue-400', title: 'AIエリア分析', description: '住みやすさをAIが評価', gradientFrom: 'rgba(99,102,241,0.1)', gradientTo: 'rgba(59,130,246,0.1)' },
];

const aiProcessingLogs = ['AIが周辺相場を取得中...', '類似相談を分析中...', 'ローン負担を計算中...', 'AI提案を生成中...', '物件データを収集中...', '最適プランを作成中...', 'エリア情報を分析中...'];
const aiAnalysisSteps = ['✓ 周辺相場取得', '✓ ローン比較完了', '✓ 類似相談分析', '✓ AI提案生成中...'];

export default function PhoneMockup() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentLog, setCurrentLog] = useState(0);
  const [currentAnalysisStep, setCurrentAnalysisStep] = useState(0);
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: false, amount: 0.3 });

  useEffect(() => {
    if (!isInView) return;
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => { setCurrentIndex(prev => (prev + 1) % aiTools.length); setIsAnimating(false); }, 500);
    }, 3500);
    return () => clearInterval(interval);
  }, [isInView]);

  useEffect(() => {
    if (!isInView) return;
    const iv = setInterval(() => setCurrentLog(prev => (prev + 1) % aiProcessingLogs.length), 2500);
    return () => clearInterval(iv);
  }, [isInView]);

  useEffect(() => {
    if (!isInView || isAnimating) return;
    const iv = setInterval(() => setCurrentAnalysisStep(prev => (prev + 1) % aiAnalysisSteps.length), 600);
    return () => clearInterval(iv);
  }, [isInView, isAnimating]);

  const currentTool = aiTools[currentIndex];

  return (
    <div ref={containerRef} className="relative">
      <motion.div className="absolute -inset-12" initial={{ opacity: 0 }} animate={{ opacity: isInView ? 0.5 : 0 }} transition={{ duration: 1 }}>
        <motion.div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full" style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.4) 0%, transparent 70%)', filter: 'blur(70px)' }} animate={isInView ? { scale: [1,1.15,1], opacity: [0.4,0.6,0.4] } : {}} transition={{ duration: 5, repeat: Infinity }} />
      </motion.div>

      <motion.div className="relative w-[min(380px,90vw)] mx-auto" style={{ height: 'min(760px,85vh)', maxHeight: '760px' }} initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={isInView ? { scale:1, opacity:1, y:0 } : { scale:0.95, opacity:0, y:20 }} transition={{ duration: 0.8, ease: [0.23,1,0.32,1] }}>
        <div className="absolute inset-0 rounded-[3rem] opacity-30" style={{ background: 'radial-gradient(50% 50% at 50% 50%, rgba(0,0,0,0.4) 0%, transparent 100%)', filter: 'blur(40px)', transform: 'translateY(20px)' }} />
        <div className="relative w-full h-full rounded-[3rem] overflow-hidden shadow-2xl" style={{ background: 'linear-gradient(180deg, #091224 0%, #0B1730 40%, #0A1328 100%)', border: '1px solid rgba(255,255,255,0.06)', boxShadow: '0 30px 80px rgba(0,0,0,0.35), 0 0 60px rgba(58,123,255,0.12)' }}>
          <motion.div className="absolute top-6 left-1/2 -translate-x-1/2 h-8 rounded-full bg-black z-50 flex items-center justify-center gap-2 px-3 overflow-hidden" animate={{ width: isAnimating ? 150 : 120 }} transition={{ duration: 0.4 }}>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-blue-500/10 rounded-full" />
            <div className="flex gap-0.5">
              {[0,1,2].map(i => <motion.div key={i} className="w-1 h-1 rounded-full bg-blue-400" animate={{ opacity:[0.3,1,0.3], scale:[0.8,1.2,0.8] }} transition={{ duration: 1.2, repeat: Infinity, delay: i*0.15 }} />)}
            </div>
            <div className="flex items-center gap-px">
              {[0,1,2,3,4].map(i => <motion.div key={i} className="w-0.5 bg-gradient-to-t from-blue-400 to-violet-400 rounded-full" animate={{ height:['4px','12px','6px','10px','4px'] }} transition={{ duration: 1, repeat: Infinity, delay: i*0.1 }} />)}
            </div>
            <AnimatePresence mode="wait">
              <motion.div key={isAnimating?'analyzing':'ready'} initial={{ opacity:0, scale:0.8 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0, scale:0.8 }} className="text-[10px] font-medium" style={{ background:'linear-gradient(90deg,#60A5FA,#A78BFA)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
                {isAnimating ? 'AI分析中' : 'AI準備完了'}
              </motion.div>
            </AnimatePresence>
            <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/20 to-transparent" animate={{ x:['-100%','100%'] }} transition={{ duration: 2, repeat: Infinity }} />
          </motion.div>

          <div className="relative w-full h-full pt-16 pb-8 px-6 overflow-hidden">
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage:'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.1) 1px, transparent 0)', backgroundSize:'24px 24px' }} />
            {isInView ? (
              <motion.div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-400/60 to-transparent" animate={{ top:['0%','100%'], opacity:[0,0.6,0] }} transition={{ duration: 5, repeat: Infinity }} />
            ) : null}

            <div className="relative mb-6">
              <div className="flex items-center gap-2 mb-2">
                <motion.div className="w-1.5 h-1.5 rounded-full bg-green-400" animate={{ opacity:[0.5,1,0.5], scale:[1,1.3,1] }} transition={{ duration: 2, repeat: Infinity }} />
                <span className="text-xs text-slate-400 font-medium">House-AI Engine</span>
              </div>
              <h3 className="text-lg font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">AIツール実行中</h3>
            </div>

            <div className="relative flex items-center justify-center" style={{ height: '480px' }}>
              <AnimatePresence mode="wait">
                <motion.div key={currentTool.id} initial={{ x:300, opacity:0, scale:0.8, filter:'blur(10px)' }} animate={{ x:0, opacity:1, scale: isAnimating?1:1.05, filter:'blur(0px) brightness(1.1)' }} exit={{ x:-300, opacity:0, scale:0.8, filter:'blur(10px)' }} transition={{ duration: 0.6, ease:[0.23,1,0.32,1] }} className="w-full">
                  <div className="relative rounded-2xl overflow-hidden" style={{ background:`linear-gradient(135deg, ${currentTool.gradientFrom} 0%, ${currentTool.gradientTo} 100%)` }}>
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-900/95 to-slate-800/95" style={{ backgroundImage:'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)', backgroundSize:'20px 20px' }} />
                    <motion.div className={`absolute -inset-1 bg-gradient-to-r ${currentTool.categoryColor} rounded-2xl blur-xl`} animate={{ opacity: isAnimating?[0.2,0.5,0.2]:[0.2,0.35,0.2] }} transition={{ duration: isAnimating?0.6:2, repeat: isAnimating?0:Infinity }} />
                    <div className="relative p-6">
                      <motion.div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${currentTool.categoryColor} flex items-center justify-center mb-4 text-white`} animate={{ scale: isAnimating?[1,1.1,1]:1 }} transition={{ duration: 0.4 }}>
                        {currentTool.icon}
                      </motion.div>
                      <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium mb-3 bg-gradient-to-r ${currentTool.categoryColor} text-white`}>{currentTool.category}</div>
                      <h4 className="text-xl font-bold text-white mb-2">{currentTool.title}</h4>
                      <p className="text-slate-300 text-sm leading-relaxed mb-4">{currentTool.description}</p>
                      <div className="relative h-1.5 bg-slate-700/50 rounded-full overflow-hidden mb-3">
                        <motion.div className={`absolute inset-y-0 left-0 bg-gradient-to-r ${currentTool.categoryColor} rounded-full`} initial={{ width:'0%' }} animate={{ width: isAnimating?'100%':['0%','100%','0%'] }} transition={{ duration: isAnimating?0.5:3, repeat: isAnimating?0:Infinity }} />
                        <motion.div className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/40 to-transparent rounded-full" animate={{ x:['-100%','400%'] }} transition={{ duration: 1.8, repeat: Infinity }} />
                      </div>
                      <AnimatePresence mode="wait">
                        {!isAnimating ? (
                          <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-10 }} className="mb-3 space-y-1.5">
                            {aiAnalysisSteps.map((step, index) => (
                              <motion.div key={step} initial={{ opacity:0, x:-10 }} animate={{ opacity: index<=currentAnalysisStep?1:0.3, x:0 }} className="flex items-center gap-2 text-xs">
                                <motion.div className={`w-1 h-1 rounded-full ${index<=currentAnalysisStep?`bg-gradient-to-r ${currentTool.categoryColor}`:'bg-slate-600'}`} animate={index<=currentAnalysisStep?{scale:[1,1.3,1],opacity:[0.7,1,0.7]}:{}} transition={{ duration:1, repeat:Infinity }} />
                                <span className={index<=currentAnalysisStep?'text-slate-200':'text-slate-500'}>{step}</span>
                              </motion.div>
                            ))}
                          </motion.div>
                        ) : null}
                      </AnimatePresence>
                      <motion.button className={`w-full py-2.5 px-4 rounded-lg bg-gradient-to-r ${currentTool.categoryColor} text-white text-sm font-medium relative overflow-hidden`} animate={{ boxShadow: isAnimating?'0 4px 20px rgba(59,130,246,0.3)':['0 4px 20px rgba(59,130,246,0.3)','0 6px 30px rgba(59,130,246,0.6)','0 4px 20px rgba(59,130,246,0.3)'] }} transition={{ duration:2, repeat:Infinity }}>
                        <span className="relative z-10">AIで分析</span>
                        <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent" animate={{ x:['-100%','100%'] }} transition={{ duration:2, repeat:Infinity }} />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            <motion.div className="absolute bottom-16 left-0 right-0 px-6" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}>
              <div className="relative bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-lg px-3 py-2 overflow-hidden">
                <motion.div className="absolute inset-0 rounded-lg border border-blue-400/30" animate={{ opacity:[0.3,0.6,0.3] }} transition={{ duration:2, repeat:Infinity }} />
                <div className="relative flex items-center gap-2">
                  <motion.div className="w-1.5 h-1.5 rounded-full bg-blue-400" animate={{ opacity:[0.5,1,0.5], scale:[1,1.2,1] }} transition={{ duration:1.5, repeat:Infinity }} />
                  <AnimatePresence mode="wait">
                    <motion.span key={currentLog} initial={{ opacity:0, y:5, filter:'blur(4px)' }} animate={{ opacity:1, y:0, filter:'blur(0px)' }} exit={{ opacity:0, y:-5, filter:'blur(4px)' }} transition={{ duration:0.4 }} className="text-xs text-slate-300 font-medium">
                      {aiProcessingLogs[currentLog]}
                    </motion.span>
                  </AnimatePresence>
                </div>
                <motion.div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent" animate={{ x:['-100%','100%'] }} transition={{ duration:2, repeat:Infinity }} />
              </div>
            </motion.div>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {aiTools.map((_, index) => (
                <motion.div key={index} className="w-1.5 h-1.5 rounded-full" style={{ background: index===currentIndex?'linear-gradient(to right,#60A5FA,#A78BFA)':'rgba(148,163,184,0.3)' }} animate={{ scale: index===currentIndex?1.3:1 }} transition={{ duration:0.3 }} />
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
