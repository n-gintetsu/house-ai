import React, { useState } from "react";
import "./AIPropertyCinema.css";

const mockProperties = [
  {
    id: 1,
    title: "リノベーション済み物件",
    area: "目黒区",
    match: 91,
    image: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=1200&auto=format&fit=crop",
    agent: "佐藤エージェント",
    likes: 189,
    questions: 32,
    tags: ["自然光", "落ち着く", "リノベ済み"],
    ai: "築年数はありますが、フルリノベーションで新築同様です。自然光が入りやすく、在宅ワークにも向いています。"
  },
  {
    id: 2,
    title: "デザイナーズマンション",
    area: "渋谷区",
    match: 94,
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1200&auto=format&fit=crop",
    agent: "山田エージェント",
    likes: 234,
    questions: 45,
    tags: ["在宅ワーク向き", "駅近", "人気急上昇"],
    ai: "駅距離と生活利便性が高く、在宅ワーカーに人気のエリアです。"
  },
  {
    id: 3,
    title: "タワーマンション最上階",
    area: "港区",
    match: 88,
    image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=1200&auto=format&fit=crop",
    agent: "田中エージェント",
    likes: 512,
    questions: 89,
    tags: ["高級感", "眺望", "ホテルライク"],
    ai: "眺望と共用施設が魅力です。高級感を重視する方に相性が良いです。"
  }
];

export default function AIPropertyCinema() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [phase, setPhase] = useState("chat");
  const [logs, setLogs] = useState([]);
  const [active, setActive] = useState(0);

  const analysisLogs = [
    "条件を解析中...",
    "周辺相場を取得中...",
    "通勤導線を解析中...",
    "生活利便性を確認中...",
    "非公開物件の可能性を照合中...",
    "AIがあなた向けに3件整理しました"
  ];

  const startAnalysis = () => {
    if (!query.trim()) return;
    setPhase("analysis");
    setLogs([]);

    analysisLogs.forEach((log, index) => {
      setTimeout(() => {
        setLogs((prev) => [...prev, log]);
      }, index * 850);
    });

    setTimeout(() => {
      setPhase("result");
    }, analysisLogs.length * 850 + 700);
  };

  return (
    <>
      <button className="ai-cinema-trigger" onClick={() => setOpen(true)}>
        ✨ AIに条件で探してもらう
      </button>

      {open ? (
        <div className={`ai-cinema-overlay phase-${phase}`}>
          <div className="ai-cinema-bg-grid" />
          <div className="ai-cinema-particles" />

          <button className="ai-cinema-close" onClick={() => setOpen(false)}>
            ×
          </button>

          {phase === "chat" ? (
            <div className="ai-cinema-chat">
              <p className="ai-cinema-label">AI PROPERTY CONCIERGE</p>
              <h2>どんな物件をお探しですか？</h2>
              <p>
                理想の暮らし条件を入力してください。AIが条件を整理して、
                あなた向けの物件を提案します。
              </p>

              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    startAnalysis();
                  }
                }}
                placeholder="例：渋谷近辺で、在宅ワーク向け、ホテルライクな部屋"
              />

              <button onClick={startAnalysis}>AI解析を開始する →</button>
            </div>
          ) : null}

          {phase === "analysis" ? (
            <div className="ai-cinema-analysis">
              <p className="ai-cinema-label">AI PROPERTY ANALYSIS</p>
              <h2>条件を解析しています</h2>

              <div className="analysis-log-box">
                {logs.map((log, i) => (
                  <div key={i} className="analysis-log blink-three">
                    <span /> {log}
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {phase === "result" ? (
            <div className="ai-cinema-result">
              <p className="ai-cinema-label">AI PROPERTY CINEMA</p>
              <h2>AIがあなた向けに3件整理しました</h2>

              <div className="property-stage">
                {mockProperties.map((item, index) => {
                  const pos =
                    index === active
                      ? "center"
                      : index < active
                      ? "left"
                      : "right";

                  return (
                    <div key={item.id} className={`cinema-card ${pos}`}>
                      <div className="cinema-image">
                        <img src={item.image} alt={item.title} />
                        <span>AI解析済み</span>
                      </div>

                      <div className="cinema-body">
                        <div className="cinema-meta">
                          <p>{item.area}</p>
                          <strong>{item.match}%</strong>
                        </div>

                        <h3>{item.title}</h3>

                        <div className="ai-comment">
                          <b>AI</b>
                          <p>{item.ai}</p>
                        </div>

                        <div className="tag-row">
                          {item.tags.map((tag) => (
                            <span key={tag}>{tag}</span>
                          ))}
                        </div>

                        <div className="card-footer">
                          <span>♡ {item.likes}</span>
                          <span>💬 {item.questions}</span>
                          <span>🏢 {item.agent}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="cinema-controls">
                <button onClick={() => setActive(Math.max(active - 1, 0))}>
                  ←
                </button>
                <button>Ⅱ</button>
                <button
                  onClick={() =>
                    setActive(Math.min(active + 1, mockProperties.length - 1))
                  }
                >
                  →
                </button>
              </div>

              <div className="cinema-actions">
                <button>詳細を見る</button>
                <button>周辺環境</button>
                <button>周辺相場</button>
                <button>内見予約</button>
                <button className="dark">非公開物件</button>
                <button>AIに相談</button>
              </div>

              <div className="private-panel">
                <h3>この条件に近い非公開物件を検出</h3>
                <p>
                  類似条件の非公開物件を保有している可能性のある業者があります。
                  AIが希望条件を整理して、会員ページ内で安全に相談できます。
                </p>
                <p className="safe">
                  しつこい営業はありません。やり取りは会員ページ内で完結します。
                </p>
                <button>AIに相談して確認する</button>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
