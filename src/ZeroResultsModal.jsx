import { X, MessageSquare, List, Sparkles } from 'lucide-react';

export default function ZeroResultsModal({ onClose }) {
  function navigate(path) {
    window.location.href = path;
  }

  return (
    <div style={{
      position:'fixed', inset:0, background:'rgba(0,0,0,0.88)',
      display:'flex', alignItems:'center', justifyContent:'center',
      zIndex:50, padding:16
    }}>
      <div style={{ maxWidth:1000, width:'100%', position:'relative' }}>
        <button onClick={onClose} style={{
          position:'absolute', top:16, right:16, color:'#9ca3af',
          background:'none', border:'none', cursor:'pointer',
          display:'flex', alignItems:'center'
        }}>
          <X size={24} />
        </button>
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <h2 style={{ fontSize:22, color:'#fff', marginBottom:12, lineHeight:1.6 }}>
            魔法相場・通勤導線・生活便性・非公開流通情報等で研析しましたが、現在の掲載情報<br />
            では一致する物件が見つかりませんでした。
          </h2>
          <p style={{ color:'#9ca3af', fontSize:14 }}>
            でもまだまだ、House-AIは推奨していない物件や、未掲載事業者の保有物件情報で支援できます。<br />
            次の方法からお選びください。
          </p>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:24 }}>
          <div style={{
            background:'linear-gradient(135deg,rgba(113,63,18,0.3),rgba(92,45,10,0.2))',
            border:'1px solid rgba(234,179,8,0.3)', borderRadius:12, padding:24,
            display:'flex', flexDirection:'column'
          }}>
            <div style={{ marginBottom:16 }}>
              <div style={{ display:'flex', gap:8, marginBottom:16, flexWrap:'wrap' }}>
                {['条件提示型','非公開物件','未掲載業者対応'].map(tag => (
                  <span key={tag} style={{
                    padding:'4px 12px', background:'rgba(234,179,8,0.2)',
                    color:'#facc15', fontSize:12, borderRadius:9999,
                    border:'1px solid rgba(234,179,8,0.3)'
                  }}>{tag}</span>
                ))}
              </div>
              <h3 style={{ fontSize:18, color:'#fff', marginBottom:12 }}>
                希望条件を相談室で投稿する
              </h3>
              <p style={{ fontSize:13, color:'#d1d5db', lineHeight:1.6, marginBottom:16 }}>
                AIがあなたの条件を分析し、適した業者をマッチング。
                募集だけで条件を満たす未掲載や非公開物件を、業者から直接提案が届きます。
              </p>
            </div>
            <div style={{ marginTop:'auto' }}>
              {['希望条件を一度登録するだけで複数業者に届く','非公開物件を含む提案が受け取れる','掲載情報に載っていない物件も対象','登録企業が直接カタログ提案する仕組み'].map(item => (
                <div key={item} style={{ display:'flex', alignItems:'flex-start', gap:8, marginBottom:6 }}>
                  <span style={{ color:'#9ca3af', fontSize:12, marginTop:2 }}>✓</span>
                  <span style={{ color:'#9ca3af', fontSize:12 }}>{item}</span>
                </div>
              ))}
            </div>
            <button onClick={() => navigate('/community/create')} style={{
              width:'100%', marginTop:24, height:48,
              background:'linear-gradient(90deg,#eab308,#ca8a04)',
              color:'#000', border:'none', borderRadius:8,
              fontWeight:700, fontSize:14, cursor:'pointer',
              display:'flex', alignItems:'center', justifyContent:'center', gap:8
            }}>
              <MessageSquare size={16} />
              住まい相談室に投稿する
            </button>
          </div>
          <div style={{
            background:'#1a1a24', border:'1px solid rgba(255,255,255,0.1)',
            borderRadius:12, padding:24, display:'flex', flexDirection:'column'
          }}>
            <div style={{ marginBottom:16 }}>
              <h3 style={{ fontSize:18, color:'#fff', marginBottom:12 }}>一覧ページで探す</h3>
              <p style={{ fontSize:13, color:'#d1d5db', lineHeight:1.6 }}>
                エリア、賃料、間取り等、制約条件を変えて探し、工夫をして挑戦してみる。
              </p>
            </div>
            <div style={{ marginTop:'auto' }}>
              <button onClick={() => navigate('/community')} style={{
                width:'100%', height:48, background:'transparent',
                color:'#fff', border:'1px solid rgba(255,255,255,0.2)',
                borderRadius:8, fontWeight:600, fontSize:14, cursor:'pointer',
                display:'flex', alignItems:'center', justifyContent:'center', gap:8
              }}>
                <List size={16} />
                一覧ページへ
              </button>
            </div>
          </div>
          <div style={{
            background:'#1a1a24', border:'1px solid rgba(255,255,255,0.1)',
            borderRadius:12, padding:24, display:'flex', flexDirection:'column'
          }}>
            <div style={{ marginBottom:16 }}>
              <h3 style={{ fontSize:18, color:'#fff', marginBottom:12 }}>AIと会話で条件を明瞭化する</h3>
              <p style={{ fontSize:13, color:'#d1d5db', lineHeight:1.6 }}>
                あなたの真のニーズを整理し、適した条件で探せるよう支援します。別の切り口や提案があるかもしれません。
              </p>
            </div>
            <div style={{ marginTop:'auto' }}>
              <button onClick={() => alert('AI相談機能は準備中です')} style={{
                width:'100%', height:48, background:'transparent',
                color:'#fff', border:'1px solid rgba(255,255,255,0.2)',
                borderRadius:8, fontWeight:600, fontSize:14, cursor:'pointer',
                display:'flex', alignItems:'center', justifyContent:'center', gap:8
              }}>
                <Sparkles size={16} />
                業者を呼んでくる
              </button>
            </div>
          </div>
        </div>
        <div style={{ textAlign:'center', marginTop:24 }}>
          <p style={{ fontSize:12, color:'#6b7280' }}>※ 掲載物件以外も含めた最適な提案を受けられます</p>
        </div>
      </div>
    </div>
  );
}
