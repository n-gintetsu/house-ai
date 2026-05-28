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

const compareData = [
  {
    id: "1",
    overall: 92,
    bars: [
      { label: "利便性", score: 98 },
      { label: "快適性", score: 90 },
      { label: "コスパ",  score: 85 },
      { label: "資産価値", score: 95 },
    ],
    merits: ["渋谷駅5分の抜群の立地", "在宅ワーク向けの防音設計", "高層階で眺望も良好"],
    risks:  ["家賃が相場より高め", "周辺の繁華街による夜間騒音"],
    comment: "利便性・資産価値ともにトップクラスの物件。長期入居でのコスパも優秀。",
  },
  {
    id: "2",
    overall: 88,
    bars: [
      { label: "利便性", score: 75 },
      { label: "快適性", score: 95 },
      { label: "コスパ",  score: 92 },
      { label: "資産価値", score: 85 },
    ],
    merits: ["専用ワークスペースで快適な在宅勤務", "リノベ済みで設備が新しい", "三大副都心近くでアクセス良好"],
    risks:  ["駅から徒歩7分とやや遠い", "築5年でやや資産価値が下がりやすい"],
    comment: "コストパフォーマンスと快適性のバランスが最も優れた物件。",
  },
  {
    id: "3",
    overall: 90,
    bars: [
      { label: "利便性", score: 88 },
      { label: "快適性", score: 93 },
      { label: "コスパ",  score: 78 },
      { label: "資産価値", score: 98 },
    ],
    merits: ["表参道の最高峰の立地", "デザイナーズで高い資産価値", "静かで質の高い住環境"],
    risks:  ["家賃が最も高い", "コスパは3物件中最も低い"],
    comment: "資産価値・快適性を最重視する方に最適。長期の資産形成にも有利。",
  },
];

const envData = {
  "1": { sunlight: 85, quietness: 38, floodRisk: "低 (A判定)", quakeRisk: "中 (B判定)" },
  "2": { sunlight: 78, quietness: 30, floodRisk: "低 (A判定)", quakeRisk: "中 (B判定)" },
  "3": { sunlight: 92, quietness: 70, floodRisk: "低 (A判定)", quakeRisk: "低 (A判定)" },
};

const secretProperties = [
  {
    id: "s1",
    title: "麻布十番 プレミアムペントハウス",
    area: "麻布十番",
    price: "¥680,000/月",
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1080&auto=format&fit=crop",
    aiScore: 99,
    tags: [
      { label: "非公開物件", icon: "🔒" },
      { label: "オーナー直接", icon: "🏆" },
      { label: "最高級",     icon: "💎" },
    ],
  },
  {
    id: "s2",
    title: "六本木 最上階レジデンス",
    area: "六本木",
    price: "¥1,200,000/月",
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1080&auto=format&fit=crop",
    aiScore: 98,
    tags: [
      { label: "非公開物件", icon: "🔒" },
      { label: "完全非公開", icon: "🛡" },
      { label: "超高級",    icon: "💎" },
    ],
  },
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
   DetailPanel: icon + title + items（meter or value）
   ===================================================== */
function DetailPanel({ icon, title, items }) {
  return (
    <div className="apc-detail-section">
      <h4>{icon} {title}</h4>
      <div className="apc-info-grid">
        {items.map((item, i) => (
          <div key={i} className="apc-info-item">
            <span className="apc-info-label">{item.label}</span>
            {item.meter !== undefined ? (
              <div className="apc-detail-meter">
                <div
                  className="apc-detail-meter-fill"
                  style={{
                    width: `${item.meter}%`,
                    background: item.color || "var(--ai-glow-blue)",
                  }}
                />
              </div>
            ) : (
              <span className="apc-info-value">{item.value}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* =====================================================
   ComparisonEvaluation: 総合スコア + 4軸バー（motion）
   ===================================================== */
function ComparisonEvaluation({ data }) {
  return (
    <div className="apc-cmp-eval">
      <div className="apc-cmp-overall">
        <span className="apc-cmp-overall-num">{data.overall}</span>
        <span className="apc-cmp-overall-label">総合評価</span>
      </div>
      <div className="apc-cmp-bars">
        {data.bars.map((bar, i) => (
          <div key={i} className="apc-cmp-bar-row">
            <span className="apc-cmp-bar-label">{bar.label}</span>
            <div className="apc-cmp-bar-track">
              <motion.div
                className="apc-cmp-bar-fill"
                initial={{ width: "0%" }}
                animate={{ width: `${bar.score}%` }}
                transition={{ duration: 0.75, delay: i * 0.12 }}
              />
            </div>
            <span className="apc-cmp-bar-score">{bar.score}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* =====================================================
   AIAnalysisPanel: バッジ + コメント + メリット・リスク
   ===================================================== */
function AIAnalysisPanel({ data }) {
  return (
    <div className="apc-cmp-ai">
      <span className="apc-cmp-ai-badge">AI 分析</span>
      <p className="apc-cmp-ai-comment">{data.comment}</p>
      <div className="apc-cmp-ai-list">
        {data.merits.map((m, i) => (
          <div key={i} className="apc-cmp-ai-item apc-cmp-ai-merit">
            <span className="apc-cmp-ai-icon">✓</span>
            <span>{m}</span>
          </div>
        ))}
        {data.risks.map((r, i) => (
          <div key={i} className="apc-cmp-ai-item apc-cmp-ai-risk">
            <span className="apc-cmp-ai-icon">⚠</span>
            <span>{r}</span>
          </div>
        ))}
      </div>
    </div>
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
function CinemaCard({ prop, position, entrancePhase, entranceDelay }) {
  const [hovered, setHovered] = useState(false);
  const isCenter = position === "center";
  const showEntrance = entrancePhase !== null && position !== "hidden" && position !== "leaving";
  const extraClass = showEntrance ? ` card-${entrancePhase}` : "";
  const cardStyle = (showEntrance && entrancePhase === "entered")
    ? { transitionDelay: `${entranceDelay}ms` }
    : undefined;

  return (
    <div
      className={`apc-card apc-card-${position}${extraClass}`}
      style={cardStyle || undefined}
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
function CinemaScreen({ properties, activeIndex, setActiveIndex, setPhase, showIntro, onIntroComplete, cinemaEntered, onCinemaEntered }) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [leavingIndex, setLeavingIndex] = useState(null);
  const [entrancePhase, setEntrancePhase] = useState(null);
  const navTimers = useRef([]);
  const entranceTimers = useRef([]);
  const onCinemaEnteredRef = useRef(onCinemaEntered);
  onCinemaEnteredRef.current = onCinemaEntered;

  useEffect(() => {
    return () => navTimers.current.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (cinemaEntered || showIntro) return;
    setEntrancePhase("entering");
    const t1 = setTimeout(() => setEntrancePhase("entered"), 500);
    const t2 = setTimeout(() => {
      setEntrancePhase(null);
      onCinemaEnteredRef.current();
    }, 2300);
    entranceTimers.current = [t1, t2];
    return () => entranceTimers.current.forEach(clearTimeout);
  }, [showIntro, cinemaEntered]);

  const navigate = (newIndex) => {
    if (isAnimating || entrancePhase !== null || newIndex === activeIndex) return;
    if (newIndex < 0 || newIndex >= properties.length) return;

    setIsAnimating(true);
    setLeavingIndex(activeIndex);

    const t1 = setTimeout(() => setActiveIndex(newIndex), 16);
    const t2 = setTimeout(() => setLeavingIndex(null), 500);
    const t3 = setTimeout(() => setIsAnimating(false), 750);
    navTimers.current = [t1, t2, t3];
  };

  const getPosition = (index) => {
    if (index === leavingIndex) return "leaving";
    if (index === activeIndex) return "center";
    if (index === activeIndex - 1) return "left";
    if (index === activeIndex + 1) return "right";
    return "hidden";
  };

  const getEntranceDelay = (pos) => {
    if (pos === "left") return 0;
    if (pos === "center") return 200;
    if (pos === "right") return 400;
    return 0;
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
              entrancePhase={entrancePhase}
              entranceDelay={getEntranceDelay(getPosition(index))}
            />
          ))}
        </div>

        <div className="apc-controls">
          <button
            className={`apc-ctrl-btn${isAnimating ? " apc-ctrl-disabled" : ""}`}
            onClick={() => navigate(activeIndex - 1)}
          >
            ⏮
          </button>
          <button
            className={`apc-ctrl-btn${isAnimating ? " apc-ctrl-disabled" : ""}`}
            onClick={() => navigate(activeIndex + 1)}
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
          <button
            className="apc-action-btn apc-action-secret"
            onClick={() => setPhase("secret")}
          >
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
  const env = envData[property.id] || { sunlight: 80, quietness: 50, floodRisk: "低", quakeRisk: "中" };

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

          <DetailPanel
            icon="🌞"
            title="環境分析"
            items={[
              { label: "日当たり", meter: env.sunlight, color: "#F3D97B" },
              { label: "静粛性",   meter: env.quietness, color: "#22D3EE" },
            ]}
          />

          <DetailPanel
            icon="⚡"
            title="災害リスク"
            items={[
              { label: "洪水リスク", value: env.floodRisk },
              { label: "地震リスク", value: env.quakeRisk },
            ]}
          />

          <div className="apc-detail-reservation">
            <p className="apc-detail-reservation-title">🗓 内見予約</p>
            <div className="apc-detail-reservation-note">
              <span className="apc-comment-icon">AI</span>
              <p>
                この物件は問い合わせ多数のため、来週末の枠が埋まりつつあります。
                早めのご予約をおすすめします。
              </p>
            </div>
            <button className="apc-detail-reservation-btn">内見を予約する</button>
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
        {properties.map((prop) => {
          const cmp = compareData.find((d) => d.id === prop.id) || compareData[0];
          return (
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
              <ComparisonEvaluation data={cmp} />
              <AIAnalysisPanel data={cmp} />
            </div>
          );
        })}
      </div>

      <div className="apc-cmp-banner">
        <span className="apc-comment-icon">AI</span>
        <div>
          <p className="apc-cmp-banner-title">AI 総合評価</p>
          <p className="apc-cmp-banner-text">
            渋谷物件が利便性・資産価値でトップ評価。在宅ワーク重視なら新宿物件がコスパ最良。
            長期資産形成なら表参道物件が最適です。
          </p>
        </div>
      </div>
    </motion.div>
  );
}

/* =====================================================
   SCREEN: Secret
   ===================================================== */
function SecretScreen({ setPhase }) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [unlockStage, setUnlockStage] = useState("idle");
  const timers = useRef([]);

  useEffect(() => {
    return () => timers.current.forEach(clearTimeout);
  }, []);

  const handleUnlock = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setUnlockStage("locked");
    const t1 = setTimeout(() => setUnlockStage("scanning"), 800);
    const t2 = setTimeout(() => setUnlockStage("authorized"), 1600);
    const t3 = setTimeout(() => {
      setIsUnlocked(true);
      setUnlockStage("idle");
    }, 2400);
    timers.current = [t1, t2, t3];
  };

  return (
    <motion.div
      className="apc-secret"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.45 }}
    >
      <button className="apc-back-btn" onClick={() => setPhase("cinema")}>
        ← シネマモードに戻る
      </button>

      {unlockStage !== "idle" ? (
        <div className="apc-secret-overlay">
          {unlockStage === "locked" ? (
            <motion.div
              key="locked"
              className="apc-secret-stage"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div style={{ fontSize: 64 }}>🔒</div>
              <p className="apc-secret-stage-text" style={{ color: "#ef4444" }}>LOCKED</p>
              <p className="apc-secret-stage-sub">認証確認中...</p>
            </motion.div>
          ) : unlockStage === "scanning" ? (
            <motion.div
              key="scanning"
              className="apc-secret-stage"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="apc-secret-scan-rings">
                <div className="apc-secret-scan-ring-expand" />
                <div className="apc-secret-scan-ring-expand apc-secret-scan-ring-expand-2" />
                <div className="apc-secret-scan-ring-expand apc-secret-scan-ring-expand-3" />
                <div className="apc-secret-scan-icon-inner">🔒</div>
              </div>
              <p className="apc-secret-stage-text" style={{ color: "#5B8CFF" }}>SCANNING</p>
              <p className="apc-secret-stage-sub apc-secret-scan-blink">ネットワーク認証中</p>
            </motion.div>
          ) : (
            <motion.div
              key="authorized"
              className="apc-secret-stage"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="apc-secret-authorized-icon">✓</div>
              <p className="apc-secret-stage-text" style={{ color: "#22c55e" }}>AUTHORIZED</p>
              <p className="apc-secret-stage-sub">アクセスが許可されました</p>
            </motion.div>
          )}
        </div>
      ) : null}

      {isUnlocked ? (
        <motion.div
          className="apc-secret-unlocked"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="apc-secret-unlock-header">
            <div className="apc-secret-unlock-icon">🔓</div>
            <h2 className="apc-secret-unlock-title">アクセス許可されました</h2>
            <p className="apc-secret-unlock-sub">非公開物件への特別アクセスが有効です</p>
          </div>
          <div className="apc-secret-cards">
            {secretProperties.map((prop) => (
              <div key={prop.id} className="apc-secret-card">
                <div className="apc-secret-card-img">
                  <img src={prop.image} alt={prop.title} loading="lazy" />
                  <span className="apc-secret-score">{prop.aiScore}%</span>
                </div>
                <div className="apc-secret-card-body">
                  <span className="apc-area-badge">📍 {prop.area}</span>
                  <h3 className="apc-secret-card-title">{prop.title}</h3>
                  <p className="apc-secret-card-price">{prop.price}</p>
                  <div className="apc-card-tags">
                    {prop.tags.map((tag, i) => (
                      <span key={i} className="apc-tag">{tag.icon} {tag.label}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      ) : (
        <div className="apc-secret-locked">
          <div className="apc-secret-icon-wrap">
            <div className="apc-secret-pulse-ring apc-secret-pulse-ring-1" />
            <div className="apc-secret-pulse-ring apc-secret-pulse-ring-2" />
            <div className="apc-secret-pulse-ring apc-secret-pulse-ring-3" />
            <div className="apc-secret-icon-circle">
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="10" y="28" width="44" height="32" rx="4" fill="none" stroke="#FF6B6B" strokeWidth="3"/>
                <path d="M20 28V20C20 12.268 26.268 6 34 6V6C41.732 6 48 12.268 48 20V28" fill="none" stroke="#FF6B6B" strokeWidth="3" strokeLinecap="round"/>
                <circle cx="32" cy="44" r="5" fill="#FF6B6B"/>
                <rect x="29" y="46" width="6" height="8" rx="1" fill="#FF6B6B"/>
                <circle cx="32" cy="44" r="5" fill="#FF6B6B" opacity="0.4"/>
              </svg>
            </div>
          </div>
          <h1 style={{ fontSize: "2.5rem", fontWeight: 700, color: "var(--ai-text-primary)", margin: "1rem 0 0.5rem" }}>🔒 非公開物件</h1>
          <p className="apc-secret-sub">AIネットワークに接続して、特別な物件を閲覧できます</p>
          <div className="apc-secret-card-wrap">
            <p className="apc-secret-desc-text">
              AIネットワークに接続すると、一般には公開されていない
              <span className="apc-secret-highlight">プレミアム物件</span>
              にアクセスできます。これらの物件は、条件に合う方のみに紹介される特別なものです。
            </p>
            <div className="apc-secret-feature-list">
              {["一般非公開の高級物件", "オーナー直接取引可能", "優先内見予約"].map((item, i) => (
                <motion.div
                  key={i}
                  className="apc-secret-feature-item"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.35 }}
                >
                  <span className="apc-secret-feature-check">✓</span>
                  <span>{item}</span>
                </motion.div>
              ))}
            </div>
            <button className="apc-secret-btn" onClick={handleUnlock}>
              🔒 ネットワークに接続してアクセス
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}

/* =====================================================
   SCREEN: NoResult
   ===================================================== */
function NoResultScreen({ setPhase }) {
  const merits = [
    "条件に合う物件を業者側から提案",
    "非公開物件に出会える可能性",
    "諸費用が安くなる場合あり",
    "やり取りは会員ページ内で完結",
  ];

  return (
    <motion.div
      className="apc-noresult"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.45 }}
    >
      <div className="apc-noresult-header">
        <div className="apc-noresult-icon">
          <svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="22" cy="22" r="14" stroke="#7C879F" strokeWidth="2.5"/>
            <path d="M32 32L45 45" stroke="#7C879F" strokeWidth="2.5" strokeLinecap="round"/>
            <path d="M17 17L27 27" stroke="#7C879F" strokeWidth="2" strokeLinecap="round"/>
            <path d="M27 17L17 27" stroke="#7C879F" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
        <p className="apc-noresult-main">現在の掲載物件では条件に合う物件が見つかりませんでした。</p>
        <p className="apc-noresult-sub">でも大丈夫です。House-AIなら、掲載されていない物件や業者の非公開情報まで含めて探せます。</p>
        <p className="apc-noresult-hint">次の方法から選んでください。</p>
      </div>

      <div className="apc-noresult-cards">
        <motion.div
          className="apc-noresult-card apc-noresult-card-gold"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0, duration: 0.45 }}
        >
          <h3 className="apc-noresult-card-title">希望条件を相談室に投稿する</h3>
          <p className="apc-noresult-card-desc">
            あなたの希望条件を投稿すると、条件に合う物件を扱える業者がマイページにお知らせします。投稿して待つだけで探せるので、自分で何度も検索する必要がありません。
          </p>
          <ul className="apc-noresult-merits">
            {merits.map((m, i) => (
              <li key={i} className="apc-noresult-merit">
                <span className="apc-noresult-check">✓</span>
                <span>{m}</span>
              </li>
            ))}
          </ul>
          <button className="apc-noresult-btn apc-noresult-btn-gold">
            住まい相談室に投稿する
          </button>
        </motion.div>

        <motion.div
          className="apc-noresult-card apc-noresult-card-blue"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.45 }}
        >
          <h3 className="apc-noresult-card-title">一覧検索ページで探す</h3>
          <p className="apc-noresult-card-desc">
            エリア・賃料・間取り・物件種別などを指定して、掲載中の物件を一覧から探せます。
          </p>
          <button className="apc-noresult-btn apc-noresult-btn-blue" onClick={() => setPhase("top")}>
            一覧検索へ進む
          </button>
        </motion.div>

        <motion.div
          className="apc-noresult-card apc-noresult-card-purple"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.45 }}
        >
          <h3 className="apc-noresult-card-title">AIに条件に合う業者を探してもらう</h3>
          <p className="apc-noresult-card-desc">
            希望エリアや条件に強い業者をAIが整理します。掲載物件がなくても、非公開物件や近い条件の提案を受けられる可能性があります。
          </p>
          <button className="apc-noresult-btn apc-noresult-btn-purple" onClick={() => setPhase("top")}>
            業者を探してもらう
          </button>
        </motion.div>
      </div>

      <button className="apc-noresult-back" onClick={() => setPhase("top")}>
        ← 条件を変えてもう一度探す
      </button>
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
  const [cinemaEntered, setCinemaEntered] = useState(false);
  const [noResultTest, setNoResultTest] = useState(true);
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
    setCinemaEntered(false);
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
      if (noResultTest) {
        setPhase("noResult");
      } else {
        setPhase("cinema");
      }
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
              cinemaEntered={cinemaEntered}
              onCinemaEntered={() => setCinemaEntered(true)}
            />
          ) : null}

          {phase === "detail" ? (
            <DetailScreen property={properties[activeIndex]} setPhase={setPhase} />
          ) : null}

          {phase === "compare" ? (
            <CompareScreen properties={properties} setPhase={setPhase} />
          ) : null}

          {phase === "secret" ? (
            <SecretScreen setPhase={setPhase} />
          ) : null}

          {phase === "noResult" ? (
            <NoResultScreen setPhase={setPhase} />
          ) : null}
        </div>
      ) : null}
    </>
  );
}
