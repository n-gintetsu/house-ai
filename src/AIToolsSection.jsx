import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Sparkles, TrendingUp, Home, Calculator, BarChart3, Search, ChevronRight } from 'lucide-react';
import PhoneMockup from './PhoneMockup';

const aiTools = [
  { id:'loan', icon:<Calculator size={32}/>, category:'購入向け', categoryColor:'from-blue-400 to-cyan-400', title:'AI住宅ローン診断', description:'月々返済・借入可能額・金利比較をAIが整理します。', ctaText:'AIで診断', gradientFrom:'rgba(59,130,246,0.1)', gradientTo:'rgba(6,182,212,0.1)' },
  { id:'market', icon:<TrendingUp size={32}/>, category:'売却向け', categoryColor:'from-violet-400 to-purple-400', title:'AI相場分析', description:'周辺価格・成約事例・AI予測を分析。', ctaText:'相場を見る', gradientFrom:'rgba(139,92,246,0.1)', gradientTo:'rgba(168,85,247,0.1)' },
  { id:'investment', icon:<BarChart3 size={32}/>, category:'投資向け', categoryColor:'from-amber-400 to-orange-400', title:'AI投資分析', description:'利回り・空室率・修繕リスクをAIが分析。', ctaText:'投資分析', gradientFrom:'rgba(251,191,36,0.1)', gradientTo:'rgba(251,146,60,0.1)' },
  { id:'inspection', icon:<Search size={32}/>, category:'初心者向け', categoryColor:'from-emerald-400 to-teal-400', title:'AI内見チェック', description:'失敗しない確認ポイントをAIが整理。', ctaText:'チェックする', gradientFrom:'rgba(52,211,153,0.1)', gradientTo:'rgba(20,184,166,0.1)' },
  { id:'recommend', icon:<Home size={32}/>, category:'購入向け', categoryColor:'from-rose-400 to-pink-400', title:'AI物件マッチング', description:'あなたの希望条件から最適な物件をAIが提案。', ctaText:'AIに相談', gradientFrom:'rgba(251,113,133,0.1)', gradientTo:'rgba(244,114,182,0.1)' },
  { id:'area', icon:<Sparkles size={32}/>, category:'初心者向け', categoryColor:'from-indigo-400 to-blue-400', title:'AIエリア分析', description:'住みやすさ・将来性・生活環境をAIが評価。', ctaText:'エリアを見る', gradientFrom:'rgba(99,102,241,0.1)', gradientTo:'rgba(59,130,246,0.1)' },
];

function CompactToolCard({ tool }) {
  return (
    <motion.div initial={{ opacity:0.7, filter:'blur(1px) saturate(0.8)' }} whileHover={{ scale:1.02, y:-4, opacity:1, filter:'blur(0px) saturate(1)' }} transition={{ duration:0.3 }} className="group relative rounded-xl overflow-hidden p-5 cursor-pointer" style={{ background:`linear-gradient(135deg, ${tool.gradientFrom} 0%, ${tool.gradientTo} 100%)` }}>
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 to-slate-800/90" style={{ backgroundImage:'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.03) 1px, transparent 0)', backgroundSize:'16px 16px' }} />
      <div className={`absolute -inset-0.5 bg-gradient-to-r ${tool.categoryColor} rounded-xl blur-lg opacity-0 group-hover:opacity-40 transition-opacity duration-500`} />
      <div className="relative flex items-start gap-4">
        <motion.div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${tool.categoryColor} flex items-center justify-center text-white flex-shrink-0`} style={{ boxShadow:'0 4px 12px rgba(0,0,0,0.3)' }} whileHover={{ scale:1.1, rotate:5 }} transition={{ type:'spring', stiffness:400 }}>
          <div className="scale-75">{tool.icon}</div>
        </motion.div>
        <div className="flex-grow min-w-0">
          <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium mb-2 bg-gradient-to-r ${tool.categoryColor} text-white`}>{tool.category}</div>
          <h4 className="text-sm font-bold text-white mb-1 line-clamp-1">{tool.title}</h4>
          <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">{tool.description}</p>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-700/30 overflow-hidden">
        <motion.div className={`h-full w-1/3 bg-gradient-to-r from-transparent ${tool.categoryColor} to-transparent`} animate={{ x:['-100%','300%'] }} transition={{ duration:2.5, repeat:Infinity, ease:'linear' }} />
      </div>
    </motion.div>
  );
}

function ToolCard({ tool, index, isInView }) {
  return (
    <motion.div initial={{ opacity:0, y:40, filter:'blur(10px)' }} animate={isInView?{opacity:1,y:0,filter:'blur(0px)'}:{opacity:0,y:40,filter:'blur(10px)'}} transition={{ duration:0.6, delay:index*0.1 }} className="group relative w-[80vw] sm:w-[340px] rounded-2xl overflow-hidden flex-shrink-0" style={{ height:'480px', background:`linear-gradient(135deg, ${tool.gradientFrom} 0%, ${tool.gradientTo} 100%)` }}>
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-sm" style={{ backgroundImage:'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)', backgroundSize:'24px 24px' }} />
      <div className={`absolute -inset-0.5 bg-gradient-to-r ${tool.categoryColor} rounded-2xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500`} />
      <div className="relative h-full flex flex-col p-6 sm:p-8">
        <motion.div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br ${tool.categoryColor} flex items-center justify-center mb-5 text-white`} style={{ boxShadow:'0 8px 16px rgba(0,0,0,0.3)' }} whileHover={{ scale:1.1, rotate:5 }} transition={{ type:'spring', stiffness:400 }}>
          {tool.icon}
        </motion.div>
        <div className={`inline-flex self-start items-center px-2.5 py-0.5 rounded-full text-xs font-medium mb-3 bg-gradient-to-r ${tool.categoryColor} text-white`}>{tool.category}</div>
        <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">{tool.title}</h3>
        <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6 flex-grow">{tool.description}</p>
        <div className="mb-6 relative h-1 bg-slate-700/50 rounded-full overflow-hidden">
          <motion.div className={`absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r ${tool.categoryColor} rounded-full`} animate={{ x:['-100%','300%'] }} transition={{ duration:2, repeat:Infinity }} />
        </div>
        <motion.button whileHover={{ scale:1.02, y:-2 }} whileTap={{ scale:0.98 }} className={`w-full py-3 px-4 rounded-xl bg-gradient-to-r ${tool.categoryColor} text-white font-medium flex items-center justify-center gap-2`}>
          {tool.ctaText} <ChevronRight size={16} />
        </motion.button>
      </div>
    </motion.div>
  );
}

export default function AIToolsSection({ onTabChange }) {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });

  return (
    <section ref={sectionRef} className="relative py-16 sm:py-24 lg:py-32 px-4 overflow-hidden" style={{ background:'linear-gradient(180deg, #F7F8FA 0%, #EEF1F5 100%)' }}>
      <div className="absolute inset-0 opacity-30" style={{ backgroundImage:'radial-gradient(circle at 2px 2px, rgba(15,23,42,0.15) 1px, transparent 0)', backgroundSize:'40px 40px' }} />
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage:'linear-gradient(to right, rgba(59,130,246,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(59,130,246,0.1) 1px, transparent 1px)', backgroundSize:'80px 80px' }} />
      <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ background:'radial-gradient(circle at 30% 40%, rgba(59,130,246,0.15) 0%, transparent 50%)' }} />

      <div className="relative max-w-7xl mx-auto">
        <motion.div initial={{ opacity:0, y:20 }} animate={isInView?{opacity:1,y:0}:{}} transition={{ duration:0.6 }} className="text-center mb-8 sm:mb-12 lg:mb-16">
          <motion.div className="inline-flex items-center gap-2 mb-3 sm:mb-4 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full relative overflow-hidden" style={{ background:'linear-gradient(to right, rgba(59,130,246,0.1), rgba(168,85,247,0.1))', border:'1px solid rgba(59,130,246,0.2)' }} animate={{ boxShadow:['0 0 20px rgba(59,130,246,0.1)','0 0 30px rgba(168,85,247,0.15)','0 0 20px rgba(59,130,246,0.1)'] }} transition={{ duration:3, repeat:Infinity }}>
            <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" animate={{ x:['-200%','200%'] }} transition={{ duration:3, repeat:Infinity, repeatDelay:1 }} />
            <motion.div animate={{ rotate:[0,360] }} transition={{ duration:3, repeat:Infinity }}>
              <Sparkles size={16} className="text-blue-600" />
            </motion.div>
            <span className="text-xs sm:text-sm font-semibold relative z-10" style={{ background:'linear-gradient(to right,#1d4ed8,#6d28d9)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>AI不動産プラットフォーム</span>
          </motion.div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 px-4" style={{ background:'linear-gradient(to right,#0f172a,#1e3a5f,#4c1d95)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>House-AIでできること</h2>
          <p className="text-base sm:text-lg lg:text-xl text-slate-600 px-4 max-w-2xl mx-auto">AIが不動産の悩みを整理・分析・提案します</p>
        </motion.div>

        <div className="relative -mx-4 lg:hidden">
          <div className="overflow-x-auto pb-8 snap-x snap-mandatory" style={{ scrollbarWidth:'none', msOverflowStyle:'none' }}>
            <div className="flex gap-4 px-4">
              {aiTools.map((tool, index) => (
                <div key={tool.id} className="snap-start">
                  <ToolCard tool={tool} index={index} isInView={isInView} />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="hidden lg:block relative">
          <div className="grid grid-cols-3 gap-8 items-center max-w-6xl mx-auto">
            <div className="flex flex-col gap-6 justify-center">
              {aiTools.slice(0,3).map((tool,index) => (
                <motion.div key={tool.id} initial={{ opacity:0, x:-40, filter:'blur(10px)' }} animate={isInView?{opacity:1,x:0,filter:'blur(0px)'}:{}} transition={{ duration:0.6, delay:index*0.15 }}>
                  <CompactToolCard tool={tool} />
                </motion.div>
              ))}
            </div>
            <motion.div initial={{ opacity:0, scale:0.9 }} animate={isInView?{opacity:1,scale:1}:{}} transition={{ duration:0.8, delay:0.2 }}>
              <PhoneMockup />
            </motion.div>
            <div className="flex flex-col gap-6 justify-center">
              {aiTools.slice(3,6).map((tool,index) => (
                <motion.div key={tool.id} initial={{ opacity:0, x:40, filter:'blur(10px)' }} animate={isInView?{opacity:1,x:0,filter:'blur(0px)'}:{}} transition={{ duration:0.6, delay:index*0.15 }}>
                  <CompactToolCard tool={tool} />
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <motion.div initial={{ opacity:0, y:20 }} animate={isInView?{opacity:1,y:0}:{}} transition={{ duration:0.6, delay:0.4 }} className="text-center mt-12 sm:mt-16 lg:mt-20">
          <motion.button onClick={() => onTabChange('chat')} className="group relative inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 rounded-full text-white text-sm sm:text-base font-medium overflow-hidden" style={{ background:'linear-gradient(to right,#2563eb,#7c3aed)' }} whileHover={{ scale:1.02, y:-2 }} whileTap={{ scale:0.98 }} animate={{ boxShadow:['0 10px 40px rgba(59,130,246,0.3)','0 15px 50px rgba(168,85,247,0.4)','0 10px 40px rgba(59,130,246,0.3)'] }} transition={{ boxShadow:{ duration:3, repeat:Infinity } }}>
            <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent" animate={{ x:['-200%','200%'] }} transition={{ duration:3, repeat:Infinity }} />
            <span className="relative z-10">さらにAI機能を見る</span>
            <ChevronRight size={18} className="relative z-10 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
