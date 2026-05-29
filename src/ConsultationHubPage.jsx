import { useNavigate } from 'react-router-dom';
import { Home as HomeIcon, MessageSquare, Wrench, TreePine, Trash2, Scale, Calculator, FileText } from 'lucide-react';

const services = [
  { id:'housing', name:'住まい', Icon:HomeIcon, description:'理想の物件を見つける', path:'/community', available:true, bg:'linear-gradient(135deg,#eab308,#ca8a04)' },
  { id:'reform', name:'リフォーム', Icon:Wrench, description:'住まいを新しく', path:'', available:false, bg:'linear-gradient(135deg,#3b82f6,#2563eb)' },
  { id:'exterior', name:'外構工事', Icon:TreePine, description:'理想のお庭づくり', path:'', available:false, bg:'linear-gradient(135deg,#22c55e,#16a34a)' },
  { id:'demolition', name:'解体', Icon:Wrench, description:'安全な解体工事', path:'', available:false, bg:'linear-gradient(135deg,#ef4444,#dc2626)' },
  { id:'disposal', name:'不用品回収', Icon:Trash2, description:'スムーズな片付け', path:'', available:false, bg:'linear-gradient(135deg,#a855f7,#7c3aed)' },
  { id:'inheritance', name:'相続相談', Icon:Scale, description:'専門家がサポート', path:'', available:false, bg:'linear-gradient(135deg,#6366f1,#4f46e5)' },
  { id:'tax', name:'税理士', Icon:Calculator, description:'税務のプロに相談', path:'', available:false, bg:'linear-gradient(135deg,#06b6d4,#0891b2)' },
  { id:'legal', name:'司法書士', Icon:FileText, description:'法務手続きをサポート', path:'', available:false, bg:'linear-gradient(135deg,#ec4899,#db2777)' },
];

export default function ConsultationHubPage() {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight:'100vh', background:'#0a0a0f', padding:'80px 16px' }}>
      <div style={{ maxWidth:1152, margin:'0 auto' }}>
        <div style={{ textAlign:'center', marginBottom:64 }}>
          <h1 style={{ fontSize:40, color:'#fff', marginBottom:16 }}>House-AI 相談室</h1>
          <p style={{ fontSize:20, color:'#9ca3af', marginBottom:8 }}>不動産 × 専門家 × 周辺サービス</p>
          <p style={{ color:'#6b7280' }}>ワンストップで、あなたの理想を実現します</p>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:24 }}>
          {services.map(({ id, name, Icon, description, path, available, bg }) => (
            <div key={id}
              onClick={() => { if (available && path) navigate(path); }}
              style={{ background:'#1a1a24', border:'1px solid rgba(255,255,255,0.1)', borderRadius:12, padding:24, display:'flex', flexDirection:'column', cursor:available ? 'pointer' : 'not-allowed', opacity:available ? 1 : 0.6, transition:'border-color 0.2s' }}>
              <div style={{ width:64, height:64, borderRadius:'50%', background:bg, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:16 }}>
                <Icon size={32} color="#fff" />
              </div>
              <h3 style={{ fontSize:20, color:'#fff', marginBottom:8 }}>{name}</h3>
              <p style={{ fontSize:14, color:'#9ca3af', marginBottom:16, flexGrow:1 }}>{description}</p>
              {available ? (
                <button onClick={() => navigate(path)} style={{ width:'100%', padding:'10px 0', background:bg, color:'#000', border:'none', borderRadius:8, fontWeight:700, fontSize:14, cursor:'pointer' }}>
                  投稿する
                </button>
              ) : (
                <div style={{ textAlign:'center', fontSize:14, color:'#6b7280' }}>準備中</div>
              )}
            </div>
          ))}
        </div>
        <div style={{ marginTop:64, textAlign:'center' }}>
          <div style={{ background:'linear-gradient(135deg,rgba(113,63,18,0.2),rgba(92,45,10,0.2))', border:'1px solid rgba(234,179,8,0.3)', borderRadius:12, padding:32 }}>
            <MessageSquare size={48} color="#eab308" style={{ margin:'0 auto 16px' }} />
            <h2 style={{ fontSize:24, color:'#fff', marginBottom:12 }}>まずは住まい探しから始めましょう</h2>
            <p style={{ color:'#9ca3af', marginBottom:24 }}>AIがあなたの理想の条件を整理し、最適な業者をマッチングします</p>
            <button onClick={() => navigate('/community')} style={{ padding:'12px 32px', background:'linear-gradient(90deg,#eab308,#ca8a04)', color:'#000', border:'none', borderRadius:8, fontWeight:700, fontSize:16, cursor:'pointer' }}>
              住まい相談室へ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
