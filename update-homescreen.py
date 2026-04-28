import os

new_content = r'''import { useState, useEffect } from "react";

// ============================================================
// HomeScreen.jsx  — House AI コンシェルジュ v5 ホーム画面
// 仕様書 v12 準拠：診断ゲームUI追加
// ============================================================

const LINE_URL = "https://line.me/R/ti/p/@216lcryt";

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
// AnimatedLogo
// ============================================================
function AnimatedLogo() {
  const [phase, setPhase] = useState(0);

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
// DiagnosisGame — 2ステップ診断ゲーム
// ============================================================
const RESULTS = {
  "住む-購入": {
    title: "購入物件をAIがご提案",
    desc: "ご予算・エリア・間取りの希望をAIにお伝えください。最適な物件をご案内します。",
    icon: "🏡",
  },
  "住む-賃貸": {
    title: "賃貸物件をAIが探します",
    desc: "希望条件を入力するだけで、AIがぴったりの賃貸物件をご提案します。",
    icon: "🔑",
  },
  "投資-初心者": {
    title: "初心者向け投資入門ガイド",
    desc: "不動産投資の基礎からAIがわかりやすく解説。まずは無料相談から始めましょう。",
    icon: "📚",
  },
  "投資-経験あり": {
    title: "収益物件の詳細分析",
    desc: "利回り・キャッシュフロー・リスク分析をAIが即座に算出します。",
    icon: "📊",
  },
};

function DiagnosisGame({ onNavigate }) {
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState({});

  const handleStep1 = (val) => {
    setAnswers({ step1: val });
    setStep(2);
  };

  const handleStep2 = (val) => {
    setAnswers((prev) => ({ ...prev, step2: val }));
    setStep(3);
  };

  const handleReset = () => {
    setStep(1);
    setAnswers({});
  };

  const resultKey = answers.step1 && answers.step2 ? `${answers.step1}-${answers.step2}` : null;
  const result = resultKey ? RESULTS[resultKey] : null;

  const btnStyle = (color = C.navy) => ({
    flex: 1,
    background: color,
    color: color === C.gold ? C.navy : "#fff",
    border: "none",
    borderRadius: 12,
    padding: "14px 10px",
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "'Noto Sans JP', sans-serif",
    transition: "opacity 0.2s",
  });

  return (
    <div
      style={{
        background: C.card,
        border: `1px solid ${C.cardBorder}`,
        borderRadius: 16,
        padding: "24px",
        boxShadow: "0 4px 24px rgba(26,58,92,0.07)",
      }}
    >
      {/* ステップインジケーター */}
      <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            style={{
              height: 4,
              flex: 1,
              borderRadius: 2,
              background: step >= s ? C.gold : C.cardBorder,
              transition: "background 0.3s",
            }}
          />
        ))}
      </div>

      {step === 1 && (
        <>
          <p style={{ fontSize: 12, color: C.gold, fontFamily: "Georgia, serif", fontStyle: "italic", marginBottom: 6 }}>
            STEP 1 / 2
          </p>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: C.text1, fontFamily: "'Noto Serif JP', serif", marginBottom: 20, lineHeight: 1.5 }}>
            不動産の目的を教えてください
          </h2>
          <div style={{ display: "flex", gap: 12 }}>
            <button style={btnStyle(C.navy)} onClick={() => handleStep1("住む")}>
              🏠 住む
            </button>
            <button style={btnStyle(C.gold)} onClick={() => handleStep1("投資")}>
              💰 投資
            </button>
          </div>
        </>
      )}

      {step === 2 && answers.step1 === "住む" && (
        <>
          <p style={{ fontSize: 12, color: C.gold, fontFamily: "Georgia, serif", fontStyle: "italic", marginBottom: 6 }}>
            STEP 2 / 2
          </p>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: C.text1, fontFamily: "'Noto Serif JP', serif", marginBottom: 20, lineHeight: 1.5 }}>
            購入・賃貸どちらをお考えですか？
          </h2>
          <div style={{ display: "flex", gap: 12 }}>
            <button style={btnStyle(C.navy)} onClick={() => handleStep2("購入")}>
              🏡 購入
            </button>
            <button style={btnStyle(C.gold)} onClick={() => handleStep2("賃貸")}>
              🔑 賃貸
            </button>
          </div>
        </>
      )}

      {step === 2 && answers.step1 === "投資" && (
        <>
          <p style={{ fontSize: 12, color: C.gold, fontFamily: "Georgia, serif", fontStyle: "italic", marginBottom: 6 }}>
            STEP 2 / 2
          </p>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: C.text1, fontFamily: "'Noto Serif JP', serif", marginBottom: 20, lineHeight: 1.5 }}>
            投資経験はありますか？
          </h2>
          <div style={{ display: "flex", gap: 12 }}>
            <button style={btnStyle(C.navy)} onClick={() => handleStep2("初心者")}>
              📚 初めて
            </button>
            <button style={btnStyle(C.gold)} onClick={() => handleStep2("経験あり")}>
              📊 経験あり
            </button>
          </div>
        </>
      )}

      {step === 3 && result && (
        <>
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>{result.icon}</div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: C.navy, fontFamily: "'Noto Serif JP', serif", marginBottom: 8 }}>
              {result.title}
            </h2>
            <p style={{ fontSize: 13, color: C.text2, fontFamily: "'Noto Sans JP', sans-serif", lineHeight: 1.7 }}>
              {result.desc}
            </p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <a
              href={LINE_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                flex: 2,
                background: "#06C755",
                color: "#fff",
                border: "none",
                borderRadius: 12,
                padding: "14px 10px",
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "'Noto Sans JP', sans-serif",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
              }}
            >
              LINE で相談する
            </a>
            <button
              onClick={() => onNavigate("chat")}
              style={{
                flex: 2,
                background: C.navy,
                color: "#fff",
                border: "none",
                borderRadius: 12,
                padding: "14px 10px",
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "'Noto Sans JP', sans-serif",
              }}
            >
              AIに相談する
            </button>
            <button
              onClick={handleReset}
              style={{
                flex: 1,
                background: "transparent",
                color: C.text3,
                border: `1px solid ${C.cardBorder}`,
                borderRadius: 12,
                padding: "14px 10px",
                fontSize: 13,
                cursor: "pointer",
                fontFamily: "'Noto Sans JP', sans-serif",
              }}
            >
              やり直す
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ============================================================
// CommunityBanner — コミュニティ誘導バナー
// ============================================================
function CommunityBanner({ onNavigate }) {
  return (
    <div
      onClick={() => onNavigate("community")}
      style={{
        background: "#fdf6e8",
        border: `1px solid ${C.cardBorder}`,
        borderRadius: 14,
        padding: "16px 20px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: 16,
        transition: "box-shadow 0.2s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 4px 16px rgba(201,168,76,0.15)")}
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
    >
      <div>
        <p style={{ fontSize: 13, fontWeight: 700, color: C.text1, fontFamily: "'Noto Sans JP', sans-serif", marginBottom: 3 }}>
          👥 みんなの不動産コミュニティ
        </p>
        <p style={{ fontSize: 12, color: C.text2, fontFamily: "'Noto Sans JP', sans-serif" }}>
          体験談・質問・情報交換はこちら
        </p>
      </div>
      <span
        style={{
          background: C.gold,
          color: "#fff",
          fontSize: 12,
          fontWeight: 700,
          padding: "5px 14px",
          borderRadius: 20,
          fontFamily: "'Noto Sans JP', sans-serif",
          flexShrink: 0,
        }}
      >
        参加する
      </span>
    </div>
  );
}

// ============================================================
// TopicsPanel
// ============================================================
const TOPICS = [
  { tag: "提携", tagColor: C.navy, title: "専門家ネットワーク", desc: "弁護士・税理士・司法書士と連携" },
  { tag: "おすすめ", tagColor: C.gold, title: "注目物件ピックアップ", desc: "今週の新着・値下げ物件はこちら" },
  { tag: "情報", tagColor: "#7a9a6a", title: "不動産お役立ち情報", desc: "住宅ローン・税金・相続まで網羅" },
];

function TopicsPanel({ onNavigate }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, width: 200, flexShrink: 0 }}>
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
          onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 4px 16px rgba(26,58,92,0.10)")}
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
          <p style={{ fontSize: 13, fontWeight: 700, color: C.text1, marginTop: 6, marginBottom: 3, fontFamily: "'Noto Sans JP', sans-serif" }}>
            {t.title}
          </p>
          <p style={{ fontSize: 11, color: C.text3, fontFamily: "'Noto Sans JP', sans-serif", lineHeight: 1.5 }}>
            {t.desc}
          </p>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// SubActionButtons
// ============================================================
function SubActionButtons({ onNavigate }) {
  return (
    <section style={{ padding: "28px 0 0", display: "flex", gap: 12 }}>
      <button
        onClick={() => onNavigate("property")}
        style={{
          flex: 1, background: C.navy, color: "#fff", border: "none",
          borderRadius: 14, padding: "20px 20px", cursor: "pointer",
          textAlign: "left", transition: "opacity 0.2s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.88")}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
      >
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", fontFamily: "'Noto Sans JP', sans-serif", marginBottom: 6 }}>
          売買 / 賃貸 / 収益物件
        </p>
        <p style={{ fontSize: 18, fontWeight: 700, fontFamily: "'Noto Serif JP', serif" }}>
          🏄 物件サーフィン
        </p>
      </button>
      <button
        onClick={() => onNavigate("valuation")}
        style={{
          flex: 1, background: C.gold, color: C.navy, border: "none",
          borderRadius: 14, padding: "20px 20px", cursor: "pointer",
          textAlign: "left", transition: "opacity 0.2s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.88")}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
      >
        <p style={{ fontSize: 12, color: "rgba(26,58,92,0.6)", fontFamily: "'Noto Sans JP', sans-serif", marginBottom: 6 }}>
          家の相場が気になる方
        </p>
        <p style={{ fontSize: 18, fontWeight: 700, fontFamily: "'Noto Serif JP', serif" }}>
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
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Noto Sans JP', sans-serif" }}>
      <link
        href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;600;700&family=Noto+Serif+JP:wght@400;700&display=swap"
        rel="stylesheet"
      />

      <Header onNavigate={navigate} />
      <TickerBanner />

      <main style={{ maxWidth: 900, margin: "0 auto", padding: "24px 20px 48px" }}>
        {/* 診断ゲーム + トピックス */}
        <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <DiagnosisGame onNavigate={navigate} />
            {/* コミュニティ誘導バナー */}
            <CommunityBanner onNavigate={navigate} />
          </div>
          <TopicsPanel onNavigate={navigate} />
        </div>

        {/* サブアクションボタン */}
        <SubActionButtons onNavigate={navigate} />
      </main>
    </div>
  );
}
'''

target = os.path.expanduser("~/Desktop/house-ai/src/HomeScreen.jsx")
with open(target, "w", encoding="utf-8") as f:
    f.write(new_content)
print("✅ HomeScreen.jsx 更新完了！")
