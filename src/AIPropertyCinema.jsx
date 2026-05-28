import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion } from "framer-motion";
import "./AIPropertyCinema.css";

/* =====================================================
   DATA
   ===================================================== */
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
  "渋谷近辺で、在宅ワーク向け、ホテルライクな部屋",
  "表参道エリア、デザイナーズマンション、眺望良好",
  "新宿駅近、静かな環境、自然光が入る部屋",
];

/* =====================================================
   AILogPanel: ログ一覧（タイピングアニメーション付き）
   ===================================================== */
function AILogItem({ text }) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplayed("");
    setDone(false);
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(id);
        setDone(true);
      }
    }, 30);
    return () => clearInterval(id);
  }, [text]);

  return (
    <motion.div
      className={`apc-logpanel-item${done ? " apc-logpanel-done" : ""}`}
      initial={{ opacity: 0, x: -14 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div className="apc-logpanel-icon">
        {done ? (
          <span className="apc-logpanel-check">✓</span>
        ) : (
          <span className="apc-logpanel-spinner" />
        )}
      </div>
      <div className="apc-logpanel-content">
        <span className="apc-logpanel-text">{displayed}</span>
        {done ? null : (
          <div className="apc-logpanel-bar">
            <div className="apc-logpanel-bar-fill" />
          </div>
        )}
      </div>
    </motion.div>
  );
}

function AILogPanel({ logs }) {
  return (
    <div className="apc-logpanel">
      {logs.map((log, i) => (
        <AILogItem key={i} text={log} />
      ))}
    </div>
  );
}

/* =====================================================
   AIMatchScore: SVG円形プログレスバッジ
   ===================================================== */
function AIMatchScore({ score }) {
  const radius = 24;
  const cx = 30;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - score / 100);
  const color =
    score >= 94 ? "#F3D97B" : score >= 90 ? "#22D3EE" : "#5B8CFF";

  return (
    <div className="apc-match-score">
      <svg viewBox="0 0 60 60" width="60" height="60" className="apc-match-svg">
        <circle
          cx={cx}
          cy={cx}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="3.5"
        />
        <circle
          cx={cx}
          cy={cx}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="3.5"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cx})`}
        />
      </svg>
      <div className="apc-match-score-center">
        <span className="apc-match-score-num" style={{ color }}>
          {score}%
        </span>
        <span className="apc-match-score-tag">Match</span>
      </div>
    </div>
  );
}

/* =====================================================
   AIPersonalityBadge: price/tagsからAIタイプを自動判定
   ===================================================== */
const PERSONALITY = {
  LUX_AI:    { label: "LUX AI",    color: "#F3D97B", bg: "rgba(243,217,123,0.14)" },
  WORK_AI:   { label: "WORK AI",   color: "#9C6BFF", bg: "rgba(156,107,255,0.14)" },
  LIFE_AI:   { label: "LIFE AI",   color: "#5B8CFF", bg: "rgba(91,140,255,0.14)"  },
  INVEST_AI: { label: "INVEST AI", color: "#FACC15", bg: "rgba(250,204,21,0.14)"  },
};

function detectPersonality(price, tags) {
  const num = parseInt((price || "").replace(/[^0-9]/g, ""), 10) || 0;
  const lbls = (tags || []).map((t) => t.label);
  if (num >= 300000 || lbls.includes("高級感")) return "LUX_AI";
  if (lbls.some((l) => ["在宅向き", "Wi-Fi完備", "リノベ済"].includes(l))) return "WORK_AI";
  if (lbls.some((l) => ["資産価値", "新築"].includes(l))) return "INVEST_AI";
  return "LIFE_AI";
}

function AIPersonalityBadge({ price, tags }) {
  const type = detectPersonality(price, tags);
  const cfg = PERSONALITY[type];
  return (
    <span
      className="apc-personality-badge"
      style={{
        color: cfg.color,
        background: cfg.bg,
        border: `1px solid ${cfg.color}55`,
      }}
    >
      {cfg.label}
    </span>
  );
}

/* =====================================================
   AIScanEffect: ホバー時スキャン演出ラッパー
   ===================================================== */
function AIScanEffect({ active, children }) {
  return (
    <div className="apc-scan-wrap">
      {children}
      {active ? (
        <motion.div
          className="apc-scan-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.18 }}
        >
          <div className="apc-scan-line-sweep" />
          <div className="apc-scan-corner apc-scan-tl" />
          <div className="apc-scan-corner apc-scan-tr" />
          <div className="apc-scan-corner apc-scan-bl" />
          <div className="apc-scan-corner apc-scan-br" />
          <span className="apc-scan-text">ANALYZING...</span>
        </motion.div>
      ) : null}
    </div>
  );
}

/* =====================================================
   CinemaIntroEffect: blackout→grid→particles→ripple→complete
   ===================================================== */
function CinemaIntroEffect({ onComplete }) {
  const [stage, setStage] = useState(0);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (stage < 4) {
      const t = setTimeout(() => setStage((s) => s + 1), 600);
      return () => clearTimeout(t);
    }
    // stage 4: フェードアウト後にコールバック
    const t = setTimeout(() => onCompleteRef.current(), 500);
    return () => clearTimeout(t);
  }, [stage]);

  return (
    <motion.div
      className="apc-intro"
      animate={{ opacity: stage >= 4 ? 0 : 1 }}
      transition={{ duration: 0.45 }}
    >
      {stage >= 1 ? <div className="apc-intro-grid" /> : null}

      {stage >= 2 ? (
        <div className="apc-intro-ptcl-layer">
          {Array.from({ length: 14 }, (_, i) => (
            <motion.div
              key={i}
              className="apc-intro-particle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              transition={{ delay: i * 0.045, duration: 0.32 }}
              style={{
                left: `${6 + i * 6.3}%`,
                top: `${38 + (i % 4) * 9}%`,
              }}
            />
          ))}
        </div>
      ) : null}

      {stage === 3 ? <div className="apc-intro-ripple" key="ripple" /> : null}

      {stage >= 1 ? (
        <motion.div
          className="apc-intro-text"
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="apc-badge">AI PROPERTY</p>
          <h2 className="apc-intro-title">CINEMA</h2>
        </motion.div>
      ) : null}
    </motion.div>
  );
}

/* =====================================================
   SCREEN: Top
   ===================================================== */
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
      <p className="apc-subtitle">AIと一緒に、住まいを体験する</p>

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

      <button
        className="apc-start-btn"
        onClick={startAnalysis}
        disabled={!query.trim()}
      >
        AI解析を開始
      </button>
    </motion.div>
  );
}

/* =====================================================
   SCREEN: Analysis（AILogPanel使用）
   ===================================================== */
function AnalysisScreen({ logs }) {
  const total = analysisLogs.length;
  const current = logs.length - 1;

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

      <div className="apc-progress-dots">
        {Array.from({ length: total }, (_, i) => (
          <div
            key={i}
            className={
              i < current
                ? "apc-progress-dot apc-progress-dot--done"
                : i === current
                ? "apc-progress-dot apc-progress-dot--active"
                : "apc-progress-dot"
            }
          />
        ))}
      </div>

      <AILogPanel logs={logs} />
    </motion.div>
  );
}

/* =====================================================
   CARD: CinemaCard（AIMatchScore・AIPersonalityBadge・AIScanEffect使用）
   ===================================================== */
function CinemaCard({ prop, position }) {
  const [hovered, setHovered] = useState(false);
  const isCenter = position === "center";

  return (
    <div
      className={`apc-card apc-card-${position}`}
      onMouseEnter={isCenter ? () => setHovered(true) : undefined}
      onMouseLeave={isCenter ? () => setHovered(false) : undefined}
    >
      <AIScanEffect active={isCenter && hovered}>
        <div className="apc-card-image">
          <img src={prop.image} alt={prop.title} loading="lazy" />
          <div className="apc-card-img-overlay" />
          <span className="apc-area-badge">📍 {prop.area}</span>
          <AIMatchScore score={prop.aiScore} />
        </div>
      </AIScanEffect>

      <div className="apc-card-body">
        <div className="apc-card-price-row">
          <p className="apc-card-price">{prop.price}</p>
          <AIPersonalityBadge price={prop.price} tags={prop.tags} />
        </div>
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

/* =====================================================
   SCREEN: Cinema（CinemaIntroEffect使用）
   ===================================================== */
function CinemaScreen({ properties, activeIndex, setActiveIndex, setPhase, showIntro, onIntroComplete }) {

  const getPosition = (index) => {
    if (index === activeIndex) return "center";
    if (index === activeIndex - 1) return "left";
    if (index === activeIndex + 1) return "right";
    return "hidden";
  };

  return (
    <>
      {showIntro ? (
        <CinemaIntroEffect onComplete={onIntroComplete} />
      ) : null}

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
            onClick={() =>
              setActiveIndex(Math.min(activeIndex + 1, properties.length - 1))
            }
          >
            ⏭
          </button>
        </div>

        <div className="apc-actions">
          <button
            className="apc-action-btn apc-action-primary"
            onClick={() => setPhase("detail")}
          >
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
    </>
  );
}

/* =====================================================
   SCREEN: Detail
   ===================================================== */
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

/* =====================================================
   SCREEN: Compare
   ===================================================== */
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

/* =====================================================
   MAIN EXPORT
   ===================================================== */
export default function AIPropertyCinema() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [phase, setPhase] = useState("top");
  const [logs, setLogs] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [cinemaIntroShown, setCinemaIntroShown] = useState(false);
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
    setCinemaIntroShown(false);
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
              showIntro={!cinemaIntroShown}
              onIntroComplete={() => setCinemaIntroShown(true)}
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
