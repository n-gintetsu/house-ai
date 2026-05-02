import { useState, useRef, useCallback } from "react";
import ReactDOM from "react-dom";
import './TikTokPropertyFeed.css'

// ── NGワード ─────────────────────────────────────────
const NG_WORDS = ["個人情報", "詐欺", "死ね", "営業", "勧誘", "LINE教えて", "電話番号"];
const hasNg = (t) => NG_WORDS.some((w) => t.includes(w));

// ── AI返信（モック） ──────────────────────────────────
const aiReply = (text, p) => {
  if (text.includes("利回") || text.includes("投資"))
    return `想定利回りは約${p.yield || "5.5"}%です。${p.station || "駅近"}エリアで需要が安定しています。`;
  if (text.includes("買い") || text.includes("おすすめ"))
    return `${p.title}は立地・価格帯ともにバランスの取れた物件です。詳細はAI相談またはスタッフまで。`;
  if (text.includes("賃料") || text.includes("家賃"))
    return `周辺相場から想定賃料は${p.rent || "要問合せ"}です。詳しくはお気軽にご相談ください。`;
  return `ご質問ありがとうございます。${p.title}について、お気軽にAI相談またはスタッフまでどうぞ。`;
};

// ── コメントモーダル ──────────────────────────────────
function CommentModal({ property, onClose }) {
  const [list, setList] = useState([
    { id: 1, nick: "投資家Aさん", text: "立地が良さそう。利回りはどのくらいですか？", tag: "投資", time: "2時間前" },
    { id: 2, nick: "GINTETSUスタッフ", text: "周辺1LDK平均賃料は約7.2万円。利回り約5.8%の安定物件です。", tag: "スタッフ", time: "1時間前", isStaff: true },
  ]);
  const [text, setText] = useState("");
  const [nick, setNick] = useState("");
  const [tag, setTag] = useState("購入");
  const [err, setErr] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const listRef = useRef(null);

  const submit = useCallback(async () => {
    if (!text.trim()) return;
    if (hasNg(text)) { setErr("不適切な内容が含まれています。"); return; }
    setList(p => [...p, { id: Date.now(), nick: nick.trim() || "匿名さん", text: text.trim(), tag, time: "たった今" }]);
    setText(""); setErr("");
    setAiLoading(true);
    await new Promise(r => setTimeout(r, 900));
    setList(p => [...p, { id: Date.now() + 1, nick: "🤖 AIアドバイザー", text: aiReply(text, property), tag: "AI", time: "今", isAI: true }]);
    setAiLoading(false);
    setTimeout(() => listRef.current?.scrollTo({ top: 9999, behavior: "smooth" }), 100);
  }, [text, nick, tag, property]);

  return ReactDOM.createPortal(
    <div className="tt-overlay" onClick={onClose}>
      <div className="tt-sheet" onClick={e => e.stopPropagation()}>
        <div className="tt-sheet-handle" />
        <div className="tt-sheet-header">
          <span>💬 コメント</span>
          <button className="tt-sheet-close" onClick={onClose}>✕</button>
        </div>
        <div className="tt-comment-list" ref={listRef}>
          {list.map(c => (
            <div key={c.id} className={`tt-comment-item${c.isStaff ? " is-staff" : ""}${c.isAI ? " is-ai" : ""}`}>
              <div className="tt-comment-meta">
                <span className="tt-comment-nick">{c.nick}</span>
                <span className={`tt-comment-tag t-${c.tag}`}>{c.tag}</span>
                <span className="tt-comment-time">{c.time}</span>
                {!c.isStaff && !c.isAI && <button className="tt-report">⚑</button>}
              </div>
              <p className="tt-comment-text">{c.text}</p>
            </div>
          ))}
          {aiLoading && (
            <div className="tt-comment-item is-ai">
              <div className="tt-comment-meta"><span className="tt-comment-nick">🤖 AIアドバイザー</span></div>
              <p className="tt-comment-text tt-typing">回答を生成中</p>
            </div>
          )}
        </div>
        <div className="tt-form">
          {err && <p className="tt-err">{err}</p>}
          <input className="tt-nick-input" placeholder="ニックネーム（任意）" value={nick} onChange={e => setNick(e.target.value)} style={{ fontSize: 16 }} />
          <div className="tt-tag-row">
            {["購入", "賃貸", "投資"].map(t => (
              <button key={t} className={`tt-tag-btn${tag === t ? " active" : ""}`} onClick={() => setTag(t)}>{t}</button>
            ))}
          </div>
          <div className="tt-input-row">
            <textarea className="tt-textarea" placeholder="コメントを入力…（個人情報・営業投稿は禁止）" value={text} onChange={e => setText(e.target.value)} rows={2} style={{ fontSize: 16 }} />
            <button className="tt-send" onClick={submit} disabled={!text.trim()}>送信</button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ── AI相談モーダル ────────────────────────────────────
function AIModal({ property, onClose }) {
  const [msgs, setMsgs] = useState([
    { role: "ai", text: `「${property.title}」について何でもお聞きください。\n価格・利回り・ローン・周辺環境など、AIがお答えします。` }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const listRef = useRef(null);

  const send = useCallback(async () => {
    if (!input.trim() || loading) return;
    const q = input.trim();
    setInput("");
    setMsgs(p => [...p, { role: "user", text: q }]);
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    setMsgs(p => [...p, { role: "ai", text: aiReply(q, property) }]);
    setLoading(false);
    setTimeout(() => listRef.current?.scrollTo({ top: 9999, behavior: "smooth" }), 100);
  }, [input, loading, property]);

  return ReactDOM.createPortal(
    <div className="tt-overlay" onClick={onClose}>
      <div className="tt-sheet tt-ai-sheet" onClick={e => e.stopPropagation()}>
        <div className="tt-sheet-handle" />
        <div className="tt-sheet-header">
          <span>🤖 AI不動産相談</span>
          <button className="tt-sheet-close" onClick={onClose}>✕</button>
        </div>
        <div className="tt-ai-chip">
          <span className="tt-ai-chip-label">対象物件</span>
          <span className="tt-ai-chip-title">{property.title}</span>
          <span className="tt-ai-chip-price">{property.price}</span>
        </div>
        <div className="tt-comment-list" ref={listRef}>
          {msgs.map((m, i) => (
            <div key={i} className={`tt-ai-msg ${m.role}`}>
              {m.role === "ai" && <span className="tt-ai-avatar">🤖</span>}
              <div className="tt-ai-bubble">{m.text}</div>
            </div>
          ))}
          {loading && (
            <div className="tt-ai-msg ai">
              <span className="tt-ai-avatar">🤖</span>
              <div className="tt-ai-bubble tt-typing">回答を生成中</div>
            </div>
          )}
        </div>
        <div className="tt-form">
          <div className="tt-input-row">
            <textarea className="tt-textarea" placeholder="例：この物件は買いですか？利回りは？" value={input} onChange={e => setInput(e.target.value)} rows={2} style={{ fontSize: 16 }}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }} />
            <button className="tt-send" onClick={send} disabled={!input.trim() || loading}>送信</button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ── 1スライド ─────────────────────────────────────────
function TikTokSlide({ property }) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(property.likeCount ?? Math.floor(Math.random() * 40 + 5));
  const [showComments, setShowComments] = useState(false);
  const [showAI, setShowAI] = useState(false);

  const toggleLike = e => {
    e.stopPropagation();
    setLiked(v => !v);
    setLikeCount(n => liked ? n - 1 : n + 1);
  };

  return (
    <section className="tiktok-slide">
      {/* 背景画像 */}
      <img className="tiktok-image" src={property.image} alt={property.title} loading="lazy" />

      {/* グラデーションオーバーレイ */}
      <div className="tiktok-overlay" />

      {/* 物件情報（画像の上） */}
      <div className="tiktok-info">
        <div className="tiktok-badges">
          <span className={`tt-badge-type type-${property.dealType}`}>{property.dealType}</span>
          {property.aiRank && <span className="tt-badge-ai">🤖 AI {property.aiRank}</span>}
        </div>
        <h2>{property.title}</h2>
        <p className="price">{property.price}</p>
        {property.station && <p className="tt-station">📍 {property.station}</p>}
        {property.size && <p className="tt-size">🏠 {property.size}</p>}
      </div>

      {/* 右側アクションボタン */}
      <div className="tiktok-actions">
        <div className="tt-action-item">
          <button
            className={`tt-action-btn${liked ? " liked" : ""}`}
            onClick={toggleLike}
            aria-label="お気に入り"
          >
            {liked ? "❤️" : "🤍"}
          </button>
          <span className="tt-action-label">{likeCount}</span>
        </div>
        <div className="tt-action-item">
          <button
            className="tt-action-btn"
            onClick={e => { e.stopPropagation(); setShowComments(true); }}
            aria-label="コメント"
          >
            💬
          </button>
          <span className="tt-action-label">{property.commentCount ?? 3}</span>
        </div>
        <div className="tt-action-item">
          <button
            className="tt-action-btn tt-action-btn-ai"
            onClick={e => { e.stopPropagation(); setShowAI(true); }}
            aria-label="AI相談"
          >
            🤖
          </button>
          <span className="tt-action-label">相談</span>
        </div>
      </div>

      {/* 下部CTAボタン */}
      <button
        className="tiktok-detail"
        onClick={e => { e.stopPropagation(); setShowAI(true); }}
      >
        🤖 この物件をAIに相談する
      </button>

      {/* モーダル */}
      {showComments && <CommentModal property={property} onClose={() => setShowComments(false)} />}
      {showAI && <AIModal property={property} onClose={() => setShowAI(false)} />}
    </section>
  );
}

// ── サンプルデータ ────────────────────────────────────
const SAMPLE_PROPERTIES = [
  {
    id: 1, dealType: "賃貸", aiRank: "B+",
    title: "さいたま市 築浅賃貸アパート",
    price: "¥85,000/月",
    station: "大宮駅 徒歩8分", size: "1LDK / 42㎡",
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80",
    likeCount: 18, commentCount: 5, yield: null, rent: "85,000円/月",
  },
  {
    id: 2, dealType: "売買", aiRank: "A",
    title: "川口市 中古一戸建て",
    price: "3,200万円",
    station: "川口駅 徒歩12分", size: "4LDK / 95㎡",
    image: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80",
    likeCount: 24, commentCount: 8, yield: null, rent: null,
  },
  {
    id: 3, dealType: "売買", aiRank: "A+",
    title: "大宮駅徒歩3分 新築マンション",
    price: "4,580万円",
    station: "大宮駅 徒歩3分", size: "2LDK / 65㎡",
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80",
    likeCount: 41, commentCount: 12, yield: null, rent: null,
  },
  {
    id: 4, dealType: "売買", aiRank: "B",
    title: "大宮区 収益マンション一棟",
    price: "1億2,800万円",
    station: "大宮駅 徒歩7分", size: "8世帯 / 1棟",
    image: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80",
    likeCount: 33, commentCount: 7, yield: "5.8", rent: null,
  },
  {
    id: 5, dealType: "賃貸", aiRank: "B+",
    title: "浦和区 駅近リノベ物件",
    price: "¥65,000/月",
    station: "浦和駅 徒歩5分", size: "1K / 28㎡",
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80",
    likeCount: 27, commentCount: 4, yield: null, rent: "65,000円/月",
  },
];

// ── メインエクスポート ─────────────────────────────────
export default function TikTokPropertyFeed({ properties }) {
  const [filter, setFilter] = useState("すべて");
  const data = (properties?.length > 0 ? properties : SAMPLE_PROPERTIES).filter(p =>
    filter === "すべて" ? true : p.dealType === filter
  );

  return (
    <>
      {/* フィルターバー（フィードの外・絶対配置） */}
      <div className="tt-filter-bar">
        {["すべて", "売買", "賃貸"].map(f => (
          <button
            key={f}
            className={`tt-filter-btn${filter === f ? " active" : ""}`}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      {/* TikTokフィード本体 */}
      <div className="tiktok-feed">
        {data.length === 0
          ? <div className="tt-empty">該当する物件がありません</div>
          : data.map(p => <TikTokSlide key={p.id} property={p} />)
        }
      </div>
    </>
  );
}
