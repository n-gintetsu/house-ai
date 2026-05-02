import { useState, useEffect, useRef, useCallback } from "react";
import ReactDOM from "react-dom";

// ── NGワードフィルター ──────────────────────────────
const NG_WORDS = ["個人情報", "詐欺", "死ね", "バカ", "アホ", "営業", "勧誘", "LINE教えて", "電話番号"];
const containsNgWord = (text) => NG_WORDS.some((w) => text.includes(w));

// ── モックコメントデータ ────────────────────────────
const MOCK_COMMENTS = {
  default: [
    { id: 1, nick: "投資家Aさん", text: "立地が良さそうですね。周辺の賃料相場はどのくらいですか？", tag: "投資", time: "2時間前" },
    { id: 2, nick: "GINTETSUスタッフ", text: "周辺1LDKの平均賃料は約7.2万円です。利回り約5.8%で安定した物件です。", tag: "スタッフ", time: "1時間前", isStaff: true },
    { id: 3, nick: "検討中Bさん", text: "管理費・修繕積立金はいくらですか？", tag: "購入", time: "30分前" },
  ],
};

// ── AIコメント生成（モック） ────────────────────────
const generateAIReply = (text, property) => {
  if (text.includes("利回") || text.includes("投資")) {
    return `この物件の想定利回りは約${property.yield || "5.5"}%です。${property.area || "大宮"}エリアの平均より${Math.random() > 0.5 ? "高め" : "同水準"}です。`;
  }
  if (text.includes("買い") || text.includes("おすすめ")) {
    return `${property.title}は${property.location || "駅近"}立地で需要が安定しています。ご予算・目的に合わせて詳しくご相談できます。`;
  }
  if (text.includes("賃料") || text.includes("家賃")) {
    return `周辺相場から算出すると、適正賃料は${property.price ? Math.floor(parseInt(property.price) * 0.0045).toLocaleString() : "要確認"}円/月程度です。`;
  }
  return `ご質問ありがとうございます。${property.title}について詳しくはAI相談またはスタッフまでお気軽にどうぞ。`;
};

// ── コメントモーダル ───────────────────────────────
function CommentModal({ property, onClose }) {
  const [comments, setComments] = useState(MOCK_COMMENTS.default);
  const [text, setText] = useState("");
  const [nick, setNick] = useState("");
  const [tag, setTag] = useState("購入");
  const [error, setError] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const listRef = useRef(null);

  const handleSubmit = useCallback(async () => {
    if (!text.trim()) return;
    if (containsNgWord(text)) {
      setError("不適切な内容が含まれています。");
      return;
    }
    const newComment = {
      id: Date.now(),
      nick: nick.trim() || "匿名さん",
      text: text.trim(),
      tag,
      time: "たった今",
    };
    setComments((prev) => [...prev, newComment]);
    setText("");
    setError("");

    // AI自動返信
    setAiLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    const aiReply = generateAIReply(text, property);
    setComments((prev) => [
      ...prev,
      { id: Date.now() + 1, nick: "🤖 AI不動産アドバイザー", text: aiReply, tag: "AI", time: "今", isAI: true },
    ]);
    setAiLoading(false);

    setTimeout(() => {
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
    }, 100);
  }, [text, nick, tag, property]);

  const modal = (
    <div className="pf-comment-overlay" onClick={onClose}>
      <div className="pf-comment-modal" onClick={(e) => e.stopPropagation()}>
        <div className="pf-comment-handle" />
        <div className="pf-comment-header">
          <span className="pf-comment-title">💬 コメント</span>
          <button className="pf-comment-close" onClick={onClose}>✕</button>
        </div>
        <div className="pf-comment-list" ref={listRef}>
          {comments.map((c) => (
            <div key={c.id} className={`pf-comment-item ${c.isStaff ? "is-staff" : ""} ${c.isAI ? "is-ai" : ""}`}>
              <div className="pf-comment-meta">
                <span className="pf-comment-nick">{c.nick}</span>
                <span className={`pf-comment-tag tag-${c.tag}`}>{c.tag}</span>
                <span className="pf-comment-time">{c.time}</span>
                {!c.isStaff && !c.isAI && (
                  <button className="pf-comment-report" title="通報">⚑</button>
                )}
              </div>
              <p className="pf-comment-text">{c.text}</p>
            </div>
          ))}
          {aiLoading && (
            <div className="pf-comment-item is-ai">
              <div className="pf-comment-meta">
                <span className="pf-comment-nick">🤖 AI不動産アドバイザー</span>
              </div>
              <p className="pf-comment-text pf-ai-typing">回答を生成中…</p>
            </div>
          )}
        </div>
        <div className="pf-comment-form">
          {error && <p className="pf-comment-error">{error}</p>}
          <input
            className="pf-comment-nick-input"
            placeholder="ニックネーム（任意）"
            value={nick}
            onChange={(e) => setNick(e.target.value)}
            style={{ fontSize: 16 }}
          />
          <div className="pf-comment-tag-row">
            {["購入", "賃貸", "投資"].map((t) => (
              <button
                key={t}
                className={`pf-tag-btn ${tag === t ? "active" : ""}`}
                onClick={() => setTag(t)}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="pf-comment-input-row">
            <textarea
              className="pf-comment-textarea"
              placeholder="コメントを入力…（個人情報・営業投稿は禁止）"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={2}
              style={{ fontSize: 16 }}
            />
            <button
              className="pf-comment-send"
              onClick={handleSubmit}
              disabled={!text.trim()}
            >
              送信
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modal, document.body);
}

// ── AI相談モーダル ─────────────────────────────────
function AIConsultModal({ property, onClose }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: `「${property.title}」について何でもお聞きください。\n価格・利回り・周辺環境・ローンなど、AIがお答えします。`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const listRef = useRef(null);

  const handleSend = useCallback(async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setLoading(true);

    await new Promise((r) => setTimeout(r, 800));
    const reply = generateAIReply(userMsg, property);
    setMessages((prev) => [...prev, { role: "assistant", text: reply }]);
    setLoading(false);

    setTimeout(() => {
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
    }, 100);
  }, [input, loading, property]);

  const modal = (
    <div className="pf-comment-overlay" onClick={onClose}>
      <div className="pf-comment-modal pf-ai-modal" onClick={(e) => e.stopPropagation()}>
        <div className="pf-comment-handle" />
        <div className="pf-comment-header">
          <span className="pf-comment-title">🤖 AI不動産相談</span>
          <button className="pf-comment-close" onClick={onClose}>✕</button>
        </div>
        <div className="pf-ai-property-chip">
          <span className="pf-ai-chip-label">対象物件</span>
          <span className="pf-ai-chip-title">{property.title}</span>
          <span className="pf-ai-chip-price">{property.priceLabel}</span>
        </div>
        <div className="pf-comment-list" ref={listRef}>
          {messages.map((m, i) => (
            <div key={i} className={`pf-ai-message ${m.role}`}>
              {m.role === "assistant" && <span className="pf-ai-avatar">🤖</span>}
              <div className="pf-ai-bubble">{m.text}</div>
            </div>
          ))}
          {loading && (
            <div className="pf-ai-message assistant">
              <span className="pf-ai-avatar">🤖</span>
              <div className="pf-ai-bubble pf-ai-typing">回答を生成中…</div>
            </div>
          )}
        </div>
        <div className="pf-comment-form">
          <div className="pf-comment-input-row">
            <textarea
              className="pf-comment-textarea"
              placeholder="例：この物件は買いですか？利回りは？"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={2}
              style={{ fontSize: 16 }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
              }}
            />
            <button className="pf-comment-send" onClick={handleSend} disabled={!input.trim() || loading}>
              送信
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modal, document.body);
}

// ── 1物件スライド ──────────────────────────────────
function PropertySlide({ property, onAIConsult, isMobile }) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(property.likeCount || Math.floor(Math.random() * 40 + 5));
  const [showComments, setShowComments] = useState(false);
  const [showAI, setShowAI] = useState(false);

  const handleLike = (e) => {
    e.stopPropagation();
    setLiked((v) => !v);
    setLikeCount((n) => liked ? n - 1 : n + 1);
  };

  return (
    <div className="pf-slide">
      {/* 背景画像 */}
      <div className="pf-image-wrap">
        <img
          src={property.image}
          alt={property.title}
          className="pf-image"
          loading="lazy"
        />
        <div className="pf-image-gradient" />
      </div>

      {/* 情報オーバーレイ（下部） */}
      <div className="pf-info">
        <div className="pf-tags">
          <span className={`pf-type-tag type-${property.type}`}>{property.type}</span>
          {property.aiScore && (
            <span className="pf-ai-tag">🤖 AI {property.aiScore}</span>
          )}
        </div>
        <h2 className="pf-title">{property.title}</h2>
        <p className="pf-price">{property.priceLabel}</p>
        <div className="pf-meta-row">
          {property.location && <span className="pf-meta-item">📍 {property.location}</span>}
          {property.size && <span className="pf-meta-item">🏠 {property.size}</span>}
          {property.access && <span className="pf-meta-item">🚃 {property.access}</span>}
        </div>
      </div>

      {/* 右側アクションボタン */}
      <div className="pf-actions">
        <button
          className={`pf-action-btn ${liked ? "liked" : ""}`}
          onClick={handleLike}
          aria-label="お気に入り"
        >
          <span className="pf-action-icon">{liked ? "❤️" : "🤍"}</span>
          <span className="pf-action-count">{likeCount}</span>
        </button>
        <button
          className="pf-action-btn"
          onClick={(e) => { e.stopPropagation(); setShowComments(true); }}
          aria-label="コメント"
        >
          <span className="pf-action-icon">💬</span>
          <span className="pf-action-count">{property.commentCount || 3}</span>
        </button>
        <button
          className="pf-action-btn pf-action-ai"
          onClick={(e) => { e.stopPropagation(); setShowAI(true); }}
          aria-label="AI相談"
        >
          <span className="pf-action-icon">🤖</span>
          <span className="pf-action-count">相談</span>
        </button>
        <button
          className="pf-action-btn"
          onClick={(e) => { e.stopPropagation(); navigator.share?.({ title: property.title, url: window.location.href }); }}
          aria-label="シェア"
        >
          <span className="pf-action-icon">↗️</span>
          <span className="pf-action-count">共有</span>
        </button>
      </div>

      {/* 下部CTA（固定しない・スライド内固定） */}
      <div className="pf-slide-cta">
        <button
          className="pf-cta-btn"
          onClick={(e) => { e.stopPropagation(); setShowAI(true); }}
        >
          🤖 この物件をAIに相談する
        </button>
      </div>

      {/* モーダル */}
      {showComments && (
        <CommentModal property={property} onClose={() => setShowComments(false)} />
      )}
      {showAI && (
        <AIConsultModal property={property} onClose={() => setShowAI(false)} />
      )}
    </div>
  );
}

// ── メインコンポーネント ───────────────────────────
export default function PropertiesPage({
  properties = [],
  onNavigate,
  isMobile,
}) {
  const [filter, setFilter] = useState("すべて");
  const [currentIndex, setCurrentIndex] = useState(0);
  const feedRef = useRef(null);

  // サンプルデータ（DBから来る場合はpropsで受け取る）
  const sampleProperties = [
    {
      id: 1,
      type: "賃貸",
      title: "さいたま市 築浅賃貸アパート",
      priceLabel: "¥85,000/月",
      price: "85000",
      image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80",
      location: "大宮駅 徒歩8分",
      size: "1LDK / 42㎡",
      access: "さいたま市北区",
      aiScore: "B+",
      yield: null,
      area: "さいたま市",
      likeCount: 18,
      commentCount: 5,
    },
    {
      id: 2,
      type: "売買",
      title: "川口市 中古一戸建て",
      priceLabel: "3,200万円",
      price: "32000000",
      image: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80",
      location: "川口駅 徒歩12分",
      size: "4LDK / 95㎡",
      access: "川口市",
      aiScore: "A",
      yield: null,
      area: "川口市",
      likeCount: 24,
      commentCount: 8,
    },
    {
      id: 3,
      type: "売買",
      title: "大宮駅徒歩3分 新築マンション",
      priceLabel: "4,580万円",
      price: "45800000",
      image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80",
      location: "大宮駅 徒歩3分",
      size: "2LDK / 65㎡",
      access: "さいたま市大宮区",
      aiScore: "A+",
      yield: null,
      area: "大宮",
      likeCount: 41,
      commentCount: 12,
    },
    {
      id: 4,
      type: "売買",
      title: "大宮区 収益マンション一棟",
      priceLabel: "1億2,800万円",
      price: "128000000",
      image: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80",
      location: "大宮駅 徒歩7分",
      size: "8世帯 / 1棟",
      access: "さいたま市大宮区",
      aiScore: "B",
      yield: "5.8",
      area: "大宮",
      likeCount: 33,
      commentCount: 7,
    },
    {
      id: 5,
      type: "賃貸",
      title: "浦和区 駅近リノベ物件",
      priceLabel: "¥65,000/月",
      price: "65000",
      image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80",
      location: "浦和駅 徒歩5分",
      size: "1K / 28㎡",
      access: "さいたま市浦和区",
      aiScore: "B+",
      yield: null,
      area: "浦和",
      likeCount: 27,
      commentCount: 4,
    },
  ];

  // propsまたはサンプルを使用
  const allProperties = properties.length > 0 ? properties : sampleProperties;

  const filteredProperties = allProperties.filter((p) => {
    if (filter === "すべて") return true;
    return p.type === filter;
  });

  // スクロール監視でcurrentIndex更新
  useEffect(() => {
    const feed = feedRef.current;
    if (!feed) return;
    const handleScroll = () => {
      const slideHeight = feed.clientHeight;
      const idx = Math.round(feed.scrollTop / slideHeight);
      setCurrentIndex(idx);
    };
    feed.addEventListener("scroll", handleScroll, { passive: true });
    return () => feed.removeEventListener("scroll", handleScroll);
  }, []);

  // PC表示時はリスト型UI
  if (!isMobile) {
    return (
      <div className="properties-pc-wrap">
        <div className="pf-filter-bar pf-filter-bar-pc">
          {["すべて", "売買", "賃貸"].map((f) => (
            <button
              key={f}
              className={`pf-filter-btn ${filter === f ? "active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="properties-pc-list">
          {filteredProperties.map((p) => (
            <div key={p.id} className="properties-pc-card">
              <img src={p.image} alt={p.title} className="properties-pc-img" />
              <div className="properties-pc-info">
                <div className="pf-tags">
                  <span className={`pf-type-tag type-${p.type}`}>{p.type}</span>
                  {p.aiScore && <span className="pf-ai-tag">🤖 AI {p.aiScore}</span>}
                </div>
                <h3 className="properties-pc-title">{p.title}</h3>
                <p className="properties-pc-price">{p.priceLabel}</p>
                {p.location && <p className="properties-pc-meta">📍 {p.location}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── モバイル：TikTok風UI ──
  return (
    <div className="pf-root">
      {/* フィルターバー（スライドの上に固定） */}
      <div className="pf-filter-bar">
        <button className="pf-back-btn" onClick={() => onNavigate?.("home")}>
          ← 戻る
        </button>
        {["すべて", "売買", "賃貸"].map((f) => (
          <button
            key={f}
            className={`pf-filter-btn ${filter === f ? "active" : ""}`}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      {/* フィード */}
      <div className="pf-feed" ref={feedRef}>
        {filteredProperties.length === 0 ? (
          <div className="pf-empty">
            <p>該当する物件がありません</p>
          </div>
        ) : (
          filteredProperties.map((p, i) => (
            <PropertySlide
              key={p.id}
              property={p}
              isMobile={isMobile}
            />
          ))
        )}
      </div>

      {/* インジケーター */}
      {filteredProperties.length > 1 && (
        <div className="pf-indicator">
          {filteredProperties.map((_, i) => (
            <div
              key={i}
              className={`pf-dot ${i === currentIndex ? "active" : ""}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
