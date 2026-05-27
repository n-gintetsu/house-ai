import React, { useState, useRef, useMemo } from "react";
import { motion } from "framer-motion";
import "./AIPropertyCinema.css";

const properties = [
  {
    id: "1",
    title: "渋谷ホテルライク高層マンション",
    area: "渋谷",
    price: "¥280,000/月",
    image: "https://images.unsplash.com/photo-1638454668466-e8dbd5462f20?w=1080&auto=format&fit=crop",
    aiScore: 94,
    aiComment: "在宅ワーク環境に最適。自然光が豊富で、防音性も高く、集中できる空間です。駅近で利便性も抜群。",
    tags: [
      { label: "在宅向き", icon: "🏠" },
      { label: "高級感", icon: "✨" },
      { label: "静音", icon: "🔇" },
      { label: "駅近", icon: "🚉" },
      { label: "自然光", icon: "☀️" },
    ],
    detail: { size: "45㎡", floor: "15階", age: "築3年", layout: "1LDK" },
    location: { station: "渋谷駅", walkTime: "徒歩5分", address: "東京都渋谷区渋谷2-XX-XX" },
  },
  {
    id: "2",
    title: "新宿モダンワークスペース付き",
    area: "新宿",
    price: "¥240,000/月",
    image: "https://images.unsplash.com/photo-1558478551-1a378f63328e?w=1080&auto=format&fit=crop",
    aiScore: 89,
    aiComment: "専用ワークスペースを完備。明るく開放的な空間で、生産性の高い在宅勤務が実現できます。",
    tags: [
      { label: "在宅向き", icon: "🏠" },
      { label: "明るい", icon: "💡" },
      { label: "リノベ済", icon: "🔨" },
      { label: "Wi-Fi完備", icon: "📶" },
    ],
    detail: { size: "52㎡", floor: "8階", age: "築5年", layout: "1LDK+WIC" },
    location: { station: "新宿駅", walkTime: "徒歩7分", address: "東京都新宿区西新宿X-XX-XX" },
  },
  {
    id: "3",
    title: "表参道デザイナーズレジデンス",
    area: "表参道",
    price: "¥320,000/月",
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1080&auto=format&fit=crop",
    aiScore: 91,
    aiComment: "洗練されたデザインと機能性を両立。クリエイティブな仕事に最適な、インスピレーションを刺激する空間です。",
    tags: [
      { label: "デザイナーズ", icon: "🎨" },
      { label: "高級感", icon: "✨" },
      { label: "眺望良好", icon: "🌆" },
      { label: "静音", icon: "🔇" },
    ],
    detail: { size: "58㎡", floor: "12階", age: "築2年", layout: "2LDK" },
    location: { station: "表参道駅", walkTime: "徒歩6分", address: "東京都港区南青山X-XX-XX" },
  },
];

const analysisLogs = [
  "条件を解析中...",
  "周辺相場を取得中...",
  "生活導線を解析中...",
  "通勤時間を計算中...",
  "非公開物件を照合中...",
  "AI マッチング完了 ✓",
];

const examples = [
  "渋谷近辺で在宅ワーク向き、ホテルライクな部屋を探しています",
  "新宿エリアでリノベ済み、広めのワークスペースがある物件",
  "表参道のデザイナーズマンション、眺望が良く静かな環境",
];

function TopScreen({ query, setQuery, startAnalysis }) {
  return (
    <motion.div
      className="apc-top"
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55 }}
    >
      <p className="apc-badge">HOUSE-AI PROPERTY CONCIERGE</p>
      <h1 className="apc-main-title">
        <span className="apc-title-gradient">House-AI</span>
      </h1>
      <p className="apc-subtitle">
        理想の暮らし条件を入力してください。<br />
        AIが最適な物件を提案します。
      </p>

      <textarea
        className="apc-textarea"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            startAnalysis();
          }
        }}
        placeholder="例：渋谷近辺で在宅ワーク向き、ホテルライクな部屋を探しています"
      />

      <div className="apc-examples">
        {examples.map((ex, i) => (
          <button key={i} className="apc-example-btn" onClick={() => setQuery(ex)}>
            {ex}
          </button>
        ))}
      </div>

      <button className="apc-start-btn" onClick={startAnalysis}>
        AI解析を開始
      </button>
    </motion.div>
  );
}

function AnalysisScreen({ logs }) {
  return (
    <motion.div
      className="apc-analysis"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.45 }}
    >
      <p className="apc-badge">AI PROPERTY ANALYSIS</p>
      <h2 className="apc-analysis-title">AI 解析中</h2>

      <div className="apc-rings-wrap">
        <div className="apc-ring apc-ring-1" />
        <div className="apc-ring apc-ring-2" />
        <div className="apc-ring apc-ring-3" />
        <div className="apc-orb" />
      </div>

      <div className="apc-log-list">
        {logs.map((log, i) => (
          <motion.div
            key={i}
            className="apc-log-item"
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <span className="apc-log-dot" />
            {log}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function CinemaCard({ prop, position }) {
  return (
    <div className={`apc-card apc-card-${position}`}>
      <div className="apc-card-image">
        <img src={prop.image} alt={prop.title} loading="lazy" />
        <div className="apc-card-img-overlay" />
        <span className="apc-area-badge">📍 {prop.area}</span>
        <div className="apc-score-badge">
          <span className="apc-score-num">{prop.aiScore}%</span>
          <span className="apc-score-label">AI Match</span>
        </div>
      </div>

      <div className="apc-card-body">
        <p className="apc-card-price">{prop.price}</p>
        <h3 className="apc-card-title">{prop.title}</h3>

        <div className="apc-card-comment">
          <span className="apc-comment-icon">AI</span>
          <p>{prop.aiComment}</p>
        </div>

        <div className="apc-card-tags">
          {prop.tags.map((tag, i) => (
            <span key={i} className="apc-tag">
              {tag.icon} {tag.label}
            </span>
          ))}
        </div>

        <div className="apc-card-footer">
          <button className="apc-footer-btn">♡</button>
          <button className="apc-footer-btn">💬</button>
          <span className="apc-agent">🏢 提携業者</span>
        </div>
      </div>
    </div>
  );
}

function CinemaScreen({ properties, activeIndex, setActiveIndex, setPhase }) {
  const getPosition = (index) => {
    if (index === activeIndex) return "center";
    if (index === activeIndex - 1) return "left";
    if (index === activeIndex + 1) return "right";
    return "hidden";
  };

  return (
    <div className="apc-cinema">
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <p className="apc-badge">AI PROPERTY CINEMA</p>
        <h2 className="apc-cinema-title">AIが提案する住まい</h2>
        <p className="apc-cinema-sub">3件の物件が見つかりました</p>
      </motion.div>

      <div className="apc-stage">
        {properties.map((prop, index) => (
          <CinemaCard
            key={prop.id}
            prop={prop}
            position={getPosition(index)}
          />
        ))}
      </div>

      <div className="apc-controls">
        <button
          className="apc-ctrl-btn"
          onClick={() => setActiveIndex(Math.max(activeIndex - 1, 0))}
        >
          ⏮
        </button>
        <button
          className="apc-ctrl-btn"
          onClick={() => setActiveIndex(Math.min(activeIndex + 1, properties.length - 1))}
        >
          ⏭
        </button>
      </div>

      <div className="apc-actions">
        <button className="apc-action-btn apc-action-primary" onClick={() => setPhase("detail")}>
          詳細を見る
        </button>
        <button className="apc-action-btn" onClick={() => setPhase("compare")}>
          比較モード
        </button>
        <button className="apc-action-btn apc-action-secret">
          非公開物件
        </button>
      </div>
    </div>
  );
}

function DetailScreen({ property, setPhase }) {
  return (
    <motion.div
      className="apc-detail"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.45 }}
    >
      <button className="apc-back-btn" onClick={() => setPhase("cinema")}>
        ← シネマモードに戻る
      </button>

      <div className="apc-detail-inner">
        <div className="apc-detail-left">
          <div className="apc-detail-image">
            <img src={property.image} alt={property.title} />
          </div>
          <p className="apc-detail-price">{property.price}</p>
          <div className="apc-detail-specs">
            <span>🏗 {property.detail.layout}</span>
            <span>📐 {property.detail.size}</span>
            <span>🏢 {property.detail.floor}</span>
            <span>📅 {property.detail.age}</span>
          </div>
        </div>

        <div className="apc-detail-right">
          <div className="apc-detail-comment">
            <span className="apc-comment-icon">AI</span>
            <p>{property.aiComment}</p>
          </div>

          <div className="apc-detail-section">
            <h4>📍 アクセス情報</h4>
            <div className="apc-info-grid">
              <div className="apc-info-item">
                <span className="apc-info-label">最寄り駅</span>
                <span className="apc-info-value">{property.location.station}</span>
              </div>
              <div className="apc-info-item">
                <span className="apc-info-label">徒歩</span>
                <span className="apc-info-value">{property.location.walkTime}</span>
              </div>
              <div className="apc-info-item">
                <span className="apc-info-label">住所</span>
                <span className="apc-info-value">{property.location.address}</span>
              </div>
            </div>
          </div>

          <div className="apc-detail-section">
            <h4>🚶 生活導線</h4>
            <div className="apc-info-grid">
              <div className="apc-info-item">
                <span className="apc-info-label">通勤時間</span>
                <span className="apc-info-value">都心まで約20分</span>
              </div>
              <div className="apc-info-item">
                <span className="apc-info-label">周辺環境</span>
                <span className="apc-info-value">スーパー・コンビニ徒歩3分以内</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function CompareScreen({ properties, setPhase }) {
  const [axis, setAxis] = useState("通勤特化");
  const axes = ["通勤特化", "在宅ワーク特化", "資産価値重視"];

  return (
    <motion.div
      className="apc-compare"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.45 }}
    >
      <button className="apc-back-btn" onClick={() => setPhase("cinema")}>
        ← シネマモードに戻る
      </button>

      <p className="apc-badge">AI COMPARE MODE</p>
      <h2 className="apc-compare-title">AI 比較モード</h2>
      <p className="apc-compare-sub">3つの物件を並べて比較できます</p>

      <div className="apc-axis-btns">
        {axes.map((ax) => (
          <button
            key={ax}
            className={`apc-axis-btn${axis === ax ? " active" : ""}`}
            onClick={() => setAxis(ax)}
          >
            {ax}
          </button>
        ))}
      </div>

      <div className="apc-compare-grid">
        {properties.map((prop) => (
          <div key={prop.id} className="apc-compare-card">
            <div className="apc-compare-img">
              <img src={prop.image} alt={prop.title} loading="lazy" />
              <div className="apc-score-badge apc-score-sm">
                <span className="apc-score-num">{prop.aiScore}%</span>
                <span className="apc-score-label">AI Match</span>
              </div>
            </div>
            <div className="apc-compare-body">
              <h4 className="apc-compare-card-title">{prop.title}</h4>
              <p className="apc-compare-price">{prop.price}</p>
              <p className="apc-compare-comment">{prop.aiComment}</p>
              <div className="apc-card-tags">
                {prop.tags.slice(0, 3).map((tag, i) => (
                  <span key={i} className="apc-tag">
                    {tag.icon} {tag.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export default function AIPropertyCinema() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [phase, setPhase] = useState("top");
  const [logs, setLogs] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const timersRef = useRef([]);

  const particles = useMemo(
    () =>
      Array.from({ length: 30 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 4,
        duration: 2 + Math.random() * 3,
        size: 2 + Math.random() * 2.5,
      })),
    []
  );

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  const handleClose = () => {
    clearTimers();
    setOpen(false);
    setPhase("top");
    setLogs([]);
    setQuery("");
    setActiveIndex(0);
  };

  const handleOpen = () => {
    setPhase("top");
    setLogs([]);
    setQuery("");
    setActiveIndex(0);
    setOpen(true);
  };

  const startAnalysis = () => {
    if (!query.trim()) return;
    setPhase("analysis");
    setLogs([]);

    analysisLogs.forEach((log, i) => {
      const t = setTimeout(() => {
        setLogs((prev) => [...prev, log]);
      }, i * 1200);
      timersRef.current.push(t);
    });

    const finalT = setTimeout(() => {
      setPhase("cinema");
    }, analysisLogs.length * 1200 + 1500);
    timersRef.current.push(finalT);
  };

  return (
    <>
      <button className="apc-trigger" onClick={handleOpen}>
        ✨ AIに条件で探してもらう
      </button>

      {open ? (
        <div className="apc-overlay">
          <div className="apc-bg-grid" />
          <div className="apc-scan-line" />

          <div className="apc-particles-layer">
            {particles.map((p) => (
              <div
                key={p.id}
                className="apc-particle"
                style={{
                  left: `${p.x}%`,
                  top: `${p.y}%`,
                  width: `${p.size}px`,
                  height: `${p.size}px`,
                  animationDelay: `${p.delay}s`,
                  animationDuration: `${p.duration}s`,
                }}
              />
            ))}
          </div>

          <button className="apc-close" onClick={handleClose}>×</button>

          {phase === "top" ? (
            <TopScreen query={query} setQuery={setQuery} startAnalysis={startAnalysis} />
          ) : null}

          {phase === "analysis" ? (
            <AnalysisScreen logs={logs} />
          ) : null}

          {phase === "cinema" ? (
            <CinemaScreen
              properties={properties}
              activeIndex={activeIndex}
              setActiveIndex={setActiveIndex}
              setPhase={setPhase}
            />
          ) : null}

          {phase === "detail" ? (
            <DetailScreen property={properties[activeIndex]} setPhase={setPhase} />
          ) : null}

          {phase === "compare" ? (
            <CompareScreen properties={properties} setPhase={setPhase} />
          ) : null}
        </div>
      ) : null}
    </>
  );
}
