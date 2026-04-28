import { useState, useEffect, useRef } from "react";

// ============================================================
// HomeScreen.jsx  — House AI コンシェルジュ v5 ホーム画面
// 仕様書 v11 第3章 準拠
// ============================================================

// --- カラーパレット ---
const C = {
  bg: "#faf7f2",
  card: "#ffffff",
  cardBorder: "#e8dfc8",
  ticker: "#f5f0e8",
  navy: "#1a3a5c",
  gold: "#c9a84c",
  red: "#c0392b",
  text1: "#2c2010",
  text2: "#6b5a45",
  text3: "#b8a898",
};

// ============================================================
// AnimatedLogo  — House(筆書き) + AI(バッジ) + コンシェルジュ
// ============================================================
function AnimatedLogo() {
  const [phase, setPhase] = useState(0);
  // phase: 0=nothing 1=House 2=AI 3=concierge 4=underline

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 100),
      setTimeout(() => setPhase(2), 1300),
      setTimeout(() => setPhase(3), 1700),
      setTimeout(() => setPhase(4), 2700),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, position: "relative" }}>
      {/* House — 筆書きアニメーション */}
      <span
        style={{
          fontFamily: "'Brush Script MT', cursive",
          fontSize: 32,
          color: C.red,
          fontStyle: "italic",
          display: "inline-block",
          overflow: "hidden",
          maxWidth: phase >= 1 ? 120 : 0,
          opacity: phase >= 1 ? 1 : 0,
          transition: "max-width 1.4s ease, opacity 0.3s ease",
          whiteSpace: "nowrap",
        }}
      >
        House
      </span>

      {/* AI バッジ */}
      <span
        style={{
          background: C.navy,
          color: "#fff",
          fontSize: 11,
          fontWeight: 700,
          fontFamily: "Georgia, serif",
          letterSpacing: 1,
          padding: "2px 7px",
          borderRadius: 4,
          opacity: phase >= 2 ? 1 : 0,
          transform: phase >= 2 ? "scale(1)" : "scale(0.7)",
          transition: "opacity 0.4s ease, transform 0.4s ease",
        }}
      >
        AI
      </span>

      {/* コンシェルジュ */}
      <span
        style={{
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontSize: 18,
          color: C.navy,
          fontStyle: "italic",
          overflow: "hidden",
          maxWidth: phase >= 3 ? 200 : 0,
          opacity: phase >= 3 ? 1 : 0,
          transition: "max-width 1s ease, opacity 0.4s ease",
          whiteSpace: "nowrap",
        }}
      >
        コンシェルジュ
      </span>

      {/* ゴールドアンダーライン */}
      <span
        style={{
          position: "absolute",
          bottom: -4,
          left: 0,
          height: 2,
          background: C.gold,
          width: phase >= 4 ? "100%" : "0%",
          transition: "width 0.4s ease",
          borderRadius: 1,
        }}
      />
    </div>
  );
}

// ============================================================
// TickerBanner
// ============================================================
const TICKER_ITEMS = [
  "🏠 INFO：新着物件が更新されました",
  "🤝 提携：専門家ネットワーク拡大中",
  "✨ NEW：AI査定サービス開始",
  "📰 INFO：空き家対策セミナー開催予定",
  "🔑 NEW：会員限定物件を公開中",
  "🏡 提携：地域密着の不動産業者と連携",
];

function TickerBanner() {
  const text = TICKER_ITEMS.join("　　●　　");

  return (
    <div
      style={{
        background: C.ticker,
        borderTop: `1px solid ${C.cardBorder}`,
        borderBottom: `1px solid ${C.cardBorder}`,
        overflow: "hidden",
        padding: "7px 0",
        position: "relative",
      }}
    >
      <style>{`
        @keyframes ticker {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
      <div
        style={{
          display: "inline-flex",
          whiteSpace: "nowrap",
          animation: "ticker 28s linear infinite",
        }}
      >
        {[0, 1].map((i) => (
          <span
            key={i}
            style={{
              fontSize: 12,
              color: C.text2,
              letterSpacing: 0.5,
              paddingRight: 80,
              fontFamily: "'Noto Sans JP', sans-serif",
            }}
          >
            {text}
          </span>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// AIChatCard  — メインカード
// ============================================================
const SUGGESTIONS = [
  "賃貸物件を探したい",
  "家の売却価格を知りたい",
  "空き家の活用方法は？",
  "住宅ローンの相談",
];

function AIChatCard({ onNavigate }) {
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    onNavigate("chat", input);
  };

  return (
    <div
      style={{
        background: C.card,
        border: `1px solid ${C.cardBorder}`,
        borderRadius: 16,
        padding: "28px 28px 24px",
        boxShadow: "0 4px 24px rgba(26,58,92,0.07)",
        flex: 1,
        minWidth: 0,
      }}
    >
      <p
        style={{
          fontSize: 13,
          color: C.gold,
          fontFamily: "Georgia, serif",
          fontStyle: "italic",
          marginBottom: 6,
          letterSpacing: 0.5,
        }}
      >
        AI Concierge
      </p>
      <h2
        style={{
          fontSize: 20,
          fontWeight: 700,
          color: C.text1,
          fontFamily: "'Noto Serif JP', serif",
          marginBottom: 18,
          lineHeight: 1.5,
        }}
      >
        今日、何をお探しですか？
      </h2>

      {/* 入力欄 */}
      <div
        style={{
          display: "flex",
          gap: 8,
          border: `1.5px solid ${C.cardBorder}`,
          borderRadius: 12,
          padding: "10px 14px",
          background: C.bg,
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="例：大宮エリアで2LDK賃貸を探しています"
          style={{
            flex: 1,
            border: "none",
            background: "transparent",
            outline: "none",
            fontSize: 14,
            color: C.text1,
            fontFamily: "'Noto Sans JP', sans-serif",
          }}
        />
        <button
          onClick={handleSend}
          style={{
            background: C.navy,
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "7px 16px",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "'Noto Sans JP', sans-serif",
            flexShrink: 0,
          }}
        >
          送信
        </button>
      </div>

      {/* サジェスト */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => onNavigate("chat", s)}
            style={{
              background: "transparent",
              border: `1px solid ${C.cardBorder}`,
              borderRadius: 20,
              padding: "5px 14px",
              fontSize: 12,
              color: C.text2,
              cursor: "pointer",
              fontFamily: "'Noto Sans JP', sans-serif",
              transition: "border-color 0.2s, color 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = C.gold;
              e.currentTarget.style.color = C.navy;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = C.cardBorder;
              e.currentTarget.style.color = C.text2;
            }}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// TopicsPanel — 右側3枚
// ============================================================
const TOPICS = [
  {
    tag: "提携",
    tagColor: C.navy,
    title: "専門家ネットワーク",
    desc: "弁護士・税理士・司法書士と連携",
  },
  {
    tag: "おすすめ",
    tagColor: C.gold,
    title: "注目物件ピックアップ",
    desc: "今週の新着・値下げ物件はこちら",
  },
  {
    tag: "情報",
    tagColor: "#7a9a6a",
    title: "不動産お役立ち情報",
    desc: "住宅ローン・税金・相続まで網羅",
  },
];

function TopicsPanel({ onNavigate }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 10,
        width: 200,
        flexShrink: 0,
      }}
    >
      {TOPICS.map((t) => (
        <div
          key={t.title}
          onClick={() => onNavigate("column")}
          style={{
            background: C.card,
            border: `1px solid ${C.cardBorder}`,
            borderRadius: 12,
            padding: "12px 14px",
            cursor: "pointer",
            transition: "box-shadow 0.2s",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.boxShadow = "0 4px 16px rgba(26,58,92,0.10)")
          }
          onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
        >
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: "#fff",
              background: t.tagColor,
              borderRadius: 4,
              padding: "2px 7px",
              fontFamily: "'Noto Sans JP', sans-serif",
              letterSpacing: 0.5,
            }}
          >
            {t.tag}
          </span>
          <p
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: C.text1,
              marginTop: 6,
              marginBottom: 3,
              fontFamily: "'Noto Sans JP', sans-serif",
            }}
          >
            {t.title}
          </p>
          <p
            style={{
              fontSize: 11,
              color: C.text3,
              fontFamily: "'Noto Sans JP', sans-serif",
              lineHeight: 1.5,
            }}
          >
            {t.desc}
          </p>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// CommunitySection
// ============================================================
const VOICES = [
  { text: "AIに相談したら、ぴったりな物件がすぐ見つかりました！", area: "さいたま市" },
  { text: "査定の流れをAIが丁寧に説明してくれて助かりました。", area: "川口市" },
  { text: "専門家紹介で税理士さんに繋いでもらえて本当に助かった。", area: "戸田市" },
];

function CommunitySection({ onNavigate }) {
  return (
    <section style={{ padding: "32px 0 0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 16 }}>
        <h3
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: C.text1,
            fontFamily: "'Noto Serif JP', serif",
          }}
        >
          他の人はこんな体験をしています
        </h3>
        <button
          onClick={() => onNavigate("community")}
          style={{
            fontSize: 12,
            color: C.gold,
            background: "none",
            border: "none",
            cursor: "pointer",
            fontFamily: "'Noto Sans JP', sans-serif",
          }}
        >
          声 248件 →
        </button>
      </div>
      <div style={{ display: "flex", gap: 12 }}>
        {VOICES.map((v, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              background: C.card,
              border: `1px solid ${C.cardBorder}`,
              borderRadius: 12,
              padding: "16px 18px",
            }}
          >
            <p
              style={{
                fontSize: 13,
                color: C.text1,
                lineHeight: 1.7,
                fontFamily: "'Noto Sans JP', sans-serif",
                marginBottom: 8,
              }}
            >
              "{v.text}"
            </p>
            <p style={{ fontSize: 11, color: C.text3, fontFamily: "'Noto Sans JP', sans-serif" }}>
              — {v.area} ユーザー
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ============================================================
// ServicesMenu — +ボタンでスタッガーアニメーション展開
// ============================================================
const MENUS = [
  { label: "業者一覧", icon: "🏢", view: "agencies" },
  { label: "専門家を探す", icon: "👤", view: "experts" },
  { label: "お得情報", icon: "💡", view: "column" },
  { label: "会員専用", icon: "🔑", view: "member" },
];

function ServicesMenu({ onNavigate }) {
  const [open, setOpen] = useState(false);

  return (
    <section style={{ padding: "28px 0 0" }}>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
        <h3
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: C.text1,
            fontFamily: "'Noto Serif JP', serif",
          }}
        >
          すべてのサービス
        </h3>
        <button
          onClick={() => setOpen(!open)}
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: C.navy,
            color: "#fff",
            border: "none",
            cursor: "pointer",
            fontSize: 20,
            lineHeight: "30px",
            textAlign: "center",
            transform: open ? "rotate(45deg)" : "rotate(0deg)",
            transition: "transform 0.3s ease",
            flexShrink: 0,
          }}
        >
          +
        </button>
      </div>

      {open && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {MENUS.map((m, i) => (
            <button
              key={m.label}
              onClick={() => onNavigate(m.view)}
              style={{
                background: C.card,
                border: `1px solid ${C.cardBorder}`,
                borderRadius: 12,
                padding: "16px 20px",
                textAlign: "left",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 10,
                animation: `fadeUp 0.3s ease forwards`,
                animationDelay: `${i * 0.07}s`,
                opacity: 0,
                transition: "box-shadow 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.boxShadow = "0 4px 16px rgba(26,58,92,0.10)")
              }
              onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
            >
              <span style={{ fontSize: 20 }}>{m.icon}</span>
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: C.text1,
                  fontFamily: "'Noto Sans JP', sans-serif",
                }}
              >
                {m.label}
              </span>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

// ============================================================
// SubActionButtons — 物件サーフィン / AI査定
// ============================================================
function SubActionButtons({ onNavigate }) {
  return (
    <section style={{ padding: "28px 0 0", display: "flex", gap: 12 }}>
      {/* 物件サーフィン */}
      <button
        onClick={() => onNavigate("property")}
        style={{
          flex: 1,
          background: C.navy,
          color: "#fff",
          border: "none",
          borderRadius: 14,
          padding: "20px 20px",
          cursor: "pointer",
          textAlign: "left",
          position: "relative",
          overflow: "hidden",
          transition: "opacity 0.2s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.88")}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
      >
        <p
          style={{
            fontSize: 12,
            color: "rgba(255,255,255,0.6)",
            fontFamily: "'Noto Sans JP', sans-serif",
            marginBottom: 6,
          }}
        >
          売買 / 賃貸 / 収益物件
        </p>
        <p
          style={{
            fontSize: 18,
            fontWeight: 700,
            fontFamily: "'Noto Serif JP', serif",
          }}
        >
          🏄 物件サーフィン
        </p>
      </button>

      {/* AI査定 */}
      <button
        onClick={() => onNavigate("valuation")}
        style={{
          flex: 1,
          background: C.gold,
          color: C.navy,
          border: "none",
          borderRadius: 14,
          padding: "20px 20px",
          cursor: "pointer",
          textAlign: "left",
          transition: "opacity 0.2s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.88")}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
      >
        <p
          style={{
            fontSize: 12,
            color: "rgba(26,58,92,0.6)",
            fontFamily: "'Noto Sans JP', sans-serif",
            marginBottom: 6,
          }}
        >
          家の相場が気になる方
        </p>
        <p
          style={{
            fontSize: 18,
            fontWeight: 700,
            fontFamily: "'Noto Serif JP', serif",
          }}
        >
          🏠 無料AI査定
        </p>
      </button>
    </section>
  );
}

// ============================================================
// Header
// ============================================================
function Header({ onNavigate }) {
  return (
    <header
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "16px 20px",
        background: "transparent",
      }}
    >
      <AnimatedLogo />
      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={() => onNavigate("login")}
          style={{
            background: "transparent",
            border: `1.5px solid ${C.navy}`,
            color: C.navy,
            borderRadius: 8,
            padding: "6px 16px",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "'Noto Sans JP', sans-serif",
          }}
        >
          ログイン
        </button>
        <button
          onClick={() => onNavigate("register")}
          style={{
            background: C.navy,
            border: "none",
            color: "#fff",
            borderRadius: 8,
            padding: "6px 16px",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "'Noto Sans JP', sans-serif",
          }}
        >
          会員登録
        </button>
      </div>
    </header>
  );
}

// ============================================================
// HomeScreen — メインエクスポート
// ============================================================
export default function HomeScreen({ onNavigate }) {
  const navigate = onNavigate || (() => {});

  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.bg,
        fontFamily: "'Noto Sans JP', sans-serif",
      }}
    >
      {/* Google Fonts */}
      <link
        href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;600;700&family=Noto+Serif+JP:wght@400;700&display=swap"
        rel="stylesheet"
      />

      <Header onNavigate={navigate} />
      <TickerBanner />

      <main style={{ maxWidth: 900, margin: "0 auto", padding: "24px 20px 48px" }}>
        {/* AIチャット + トピックス */}
        <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
          <AIChatCard onNavigate={navigate} />
          <TopicsPanel onNavigate={navigate} />
        </div>

        {/* コミュニティ */}
        <CommunitySection onNavigate={navigate} />

        {/* すべてのサービス */}
        <ServicesMenu onNavigate={navigate} />

        {/* サブアクションボタン */}
        <SubActionButtons onNavigate={navigate} />
      </main>
    </div>
  );
}
