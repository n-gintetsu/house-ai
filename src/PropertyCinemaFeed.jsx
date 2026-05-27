import React, { useEffect, useRef, useState } from "react";
import {
  Heart,
  MessageCircle,
  Share2,
  Building2,
  Bot,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  MapPin,
  Sparkles,
  CalendarDays,
  CloudSun,
  Train,
  LockKeyhole,
  Search,
} from "lucide-react";
import "./PropertyCinemaFeed.css";

const demoProperties = [
  {
    id: 1,
    title: "デザイナーズマンション",
    area: "渋谷区",
    image:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1200&auto=format&fit=crop",
    agent: "山田エージェント",
    match: 94,
    likes: 234,
    comments: 45,
    tags: ["在宅ワーク向き", "駅近", "人気急上昇"],
    aiComment:
      "このエリアは再開発が進み、資産価値が上昇傾向です。駅直結で利便性が高く、在宅ワーカーに人気のエリアです。",
    detail: {
      price: "18.8万円",
      layout: "1LDK",
      age: "築8年",
      station: "渋谷駅 徒歩5分",
    },
  },
  {
    id: 2,
    title: "リノベーション済み物件",
    area: "目黒区",
    image:
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=1200&auto=format&fit=crop",
    agent: "佐藤エージェント",
    match: 91,
    likes: 189,
    comments: 32,
    tags: ["自然光", "落ち着く", "リノベ済み"],
    aiComment:
      "築年数はありますが、フルリノベーションで新築同様です。自然光が入りやすく、緑豊かな住環境が魅力です。",
    detail: {
      price: "16.2万円",
      layout: "1LDK",
      age: "築20年",
      station: "目黒駅 徒歩9分",
    },
  },
  {
    id: 3,
    title: "タワーマンション最上階",
    area: "港区",
    image:
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=1200&auto=format&fit=crop",
    agent: "田中エージェント",
    match: 88,
    likes: 512,
    comments: 89,
    tags: ["高級感", "眺望", "ホテルライク"],
    aiComment:
      "東京タワーを望める贅沢な眺望。コンシェルジュサービスやフィットネスジムなど、共用施設が充実しています。",
    detail: {
      price: "42.0万円",
      layout: "2LDK",
      age: "築5年",
      station: "六本木駅 徒歩7分",
    },
  },
];

const logMessages = [
  "PROPERTY DATABASE SCANNING...",
  "AREA MATCHING...",
  "LIFESTYLE SCORE CALCULATING...",
  "MARKET DATA CHECKING...",
  "AI MATCH COMPLETE",
];

const SLOT_CLASSES = ["pos-center", "pos-next1", "pos-next2", "pos-prev2", "pos-prev1"];
const SLOT_OFFSETS = [0, 1, 2, -2, -1];

export default function PropertyCinemaFeed({ properties = demoProperties }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [centerSlot, setCenterSlot] = useState(2);
  const [isPlaying, setIsPlaying] = useState(true);
  const [panel, setPanel] = useState("detail");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentLog, setCurrentLog] = useState("AIが条件に合う物件を整理します");
  const isAnimatingRef = useRef(false);

  const activeProperty = properties[activeIndex];
  const N = properties.length;

  const getSlotClass = (slotIdx) => {
    const relative = (slotIdx - centerSlot + 5) % 5;
    return SLOT_CLASSES[relative];
  };

  const getSlotProperty = (slotIdx) => {
    const relative = (slotIdx - centerSlot + 5) % 5;
    const offset = SLOT_OFFSETS[relative];
    return properties[(activeIndex + offset + N * 10) % N];
  };

  const goNext = () => {
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;
    setActiveIndex((prev) => (prev + 1) % N);
    setCenterSlot((prev) => (prev + 1) % 5);
    setCurrentLog("AIが次の候補を整理しました");
    setTimeout(() => { isAnimatingRef.current = false; }, 500);
  };

  const goPrev = () => {
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;
    setActiveIndex((prev) => (prev - 1 + N) % N);
    setCenterSlot((prev) => (prev - 1 + 5) % 5);
    setCurrentLog("前の候補を再解析しました");
    setTimeout(() => { isAnimatingRef.current = false; }, 500);
  };

  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(goNext, 4200);
    return () => clearInterval(timer);
  }, [isPlaying]);

  const startAiAnalyze = () => {
    setIsAnalyzing(true);
    let i = 0;
    setCurrentLog(logMessages[0]);

    const timer = setInterval(() => {
      i += 1;
      if (i < logMessages.length) {
        setCurrentLog(logMessages[i]);
      } else {
        clearInterval(timer);
        setIsAnalyzing(false);
        setCurrentLog("AI MATCH COMPLETE：3件の候補を表示しました");
      }
    }, 420);
  };

  return (
    <section className="ai-cinema-section">
      <div className="ai-cinema-header">
        <p className="ai-cinema-kicker">AI PROPERTY CINEMA</p>
        <h2>AI物件フィード</h2>
        <p>AIがあなたに合う暮らしを整理します</p>
      </div>

      <div className="ai-cinema-layout">
      <div className="ai-cinema-left-col">
      <div className="ai-cinema-logbar">
        <span className="ai-cinema-live-dot" />
        <span>{currentLog}</span>
      </div>

      <div className="ai-cinema-stage-wrap">
        <div className="ai-cinema-stage">
          {[0, 1, 2, 3, 4].map((slotIdx) => {
            const property = getSlotProperty(slotIdx);
            const posClass = getSlotClass(slotIdx);
            return (
              <article key={slotIdx} className={`ai-cinema-card ${posClass}`}>
                <div
                  className="ai-cinema-image"
                  style={{ backgroundImage: `url(${property.image})` }}
                >
                  <div className="ai-cinema-gradient" />
                  <div className="ai-cinema-badge">
                    <Sparkles size={14} />
                    AI解析済み
                  </div>
                  <div className="ai-cinema-location">
                    <MapPin size={16} />
                    {property.area}
                  </div>
                  <h3>{property.title}</h3>
                </div>

                <div className="ai-cinema-body">
                  <div className="ai-cinema-match">
                    <span>AI相性</span>
                    <strong>{property.match}%</strong>
                  </div>

                  <div className="ai-cinema-ai-comment">
                    <div className="ai-cinema-ai-icon">AI</div>
                    <p>{property.aiComment}</p>
                  </div>

                  <div className="ai-cinema-tags">
                    {property.tags.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>

                  <div className="ai-cinema-meta">
                    <span>
                      <Heart size={17} /> {property.likes}
                    </span>
                    <span>
                      <MessageCircle size={17} /> {property.comments}
                    </span>
                    <span>
                      <Building2 size={17} /> {property.agent}
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      <div className="ai-cinema-controls">
        <button onClick={goPrev}>
          <ChevronLeft size={24} />
        </button>
        <button onClick={() => setIsPlaying((v) => !v)} className="is-primary">
          {isPlaying ? <Pause size={24} /> : <Play size={24} />}
        </button>
        <button onClick={goNext}>
          <ChevronRight size={24} />
        </button>
      </div>

      <div className="ai-cinema-actions">
        <button>
          <Bookmark size={20} />
          保存
        </button>
        <button>
          <MessageCircle size={20} />
          質問
        </button>
        <button>
          <Building2 size={20} />
          業者
        </button>
        <button className="is-gold">
          <Bot size={20} />
          AI相談
        </button>
        <button>
          <Share2 size={20} />
          シェア
        </button>
      </div>
      </div>

      <div className="ai-cinema-right-col">
        <button className="ai-cinema-main-cta" onClick={startAiAnalyze}>
          <Sparkles size={18} />
          AIに条件で探してもらう
        </button>

        <div className="ai-cinema-right-summary">
          <div className="ai-cinema-match">
            <span>AI相性</span>
            <strong>{activeProperty.match}%</strong>
          </div>
          <div className="ai-cinema-tags">
            {activeProperty.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
          <div className="ai-cinema-ai-comment">
            <div className="ai-cinema-ai-icon">AI</div>
            <p>{activeProperty.aiComment}</p>
          </div>
        </div>

        <div className="ai-cinema-panel-tabs">
          <button className={panel === "detail" ? "active" : ""} onClick={() => setPanel("detail")}>
            詳細を見る
          </button>
          <button className={panel === "area" ? "active" : ""} onClick={() => setPanel("area")}>
            周辺環境
          </button>
          <button className={panel === "market" ? "active" : ""} onClick={() => setPanel("market")}>
            周辺相場
          </button>
          <button className={panel === "visit" ? "active" : ""} onClick={() => setPanel("visit")}>
            内見予約
          </button>
          <button className={panel === "private" ? "active" : ""} onClick={() => setPanel("private")}>
            非公開物件
          </button>
        </div>

        <div className="ai-cinema-info-panel">
          {panel === "detail" ? (
            <div className="ai-cinema-grid-info">
              <InfoBox label="価格/賃料" value={activeProperty.detail.price} />
              <InfoBox label="間取り" value={activeProperty.detail.layout} />
              <InfoBox label="築年数" value={activeProperty.detail.age} />
              <InfoBox label="駅距離" value={activeProperty.detail.station} />
            </div>
          ) : null}

          {panel === "area" ? (
            <div className="ai-cinema-text-panel">
              <h4>AREA ANALYSIS COMPLETE</h4>
              <p>
                周辺にはスーパー・カフェ・公園が揃っており、日常生活の利便性が高いエリアです。
                夜は比較的静かで、在宅ワークや単身世帯にも向いています。
              </p>
            </div>
          ) : null}

          {panel === "market" ? (
            <div className="ai-cinema-text-panel">
              <h4>MARKET SCAN COMPLETE</h4>
              <p>
                周辺相場と比較すると、現在の条件ではやや割安傾向です。
                ただし人気エリアのため、良条件の物件は早期終了する可能性があります。
              </p>
            </div>
          ) : null}

          {panel === "visit" ? (
            <div className="ai-cinema-grid-info">
              <InfoBox icon={<CalendarDays size={20} />} label="内見候補日" value="今週末" />
              <InfoBox icon={<CloudSun size={20} />} label="天気" value="くもり時々晴れ" />
              <InfoBox icon={<Train size={20} />} label="交通手段" value="電車＋徒歩9分" />
              <InfoBox label="AIメモ" value="駅から少し歩くため、雨天時は傘推奨です。" />
            </div>
          ) : null}

          {panel === "private" ? (
            <div className="ai-cinema-private-panel">
              <LockKeyhole size={26} />
              <h4>この条件に近い非公開物件を検出</h4>
              <p>
                類似条件の非公開物件を保有している可能性のある業者があります。
                AIが希望条件を整理して、会員ページ内で安全に相談できます。
              </p>
              <p style={{ fontSize: 13, color: '#64748b', textAlign: 'center', margin: '12px 0 0' }}>
                しつこい営業はありません。やり取りは会員ページ内で完結します。AIが希望条件を整理してから、条件に合う業者だけに相談できます。
              </p>
              <button>
                <Search size={18} />
                AIに相談して確認する
              </button>
            </div>
          ) : null}
        </div>
      </div>
      </div>

      {isAnalyzing ? (
        <div className="ai-cinema-overlay">
          <div className="ai-cinema-loader">
            <div className="ai-cinema-loader-icon">
              <Sparkles size={34} />
            </div>
            <p>{currentLog}</p>
            <div className="ai-cinema-loader-line">
              <span />
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function InfoBox({ label, value, icon }) {
  return (
    <div className="ai-cinema-info-box">
      {icon ? icon : null}
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
