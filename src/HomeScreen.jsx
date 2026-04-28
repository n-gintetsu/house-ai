import { useState, useEffect } from "react";

// ============================================================
// HomeScreen.jsx  — House AI コンシェルジュ
// CV最大化改善版（TASK①〜⑥対応）
// ============================================================

const LINE_URL = "https://line.me/R/ti/p/@216lcryt";

// TASK①：デバイス判定
const isMobile = /iPhone|Android/i.test(
  typeof navigator !== "undefined" ? navigator.userAgent : ""
);

// --- 診断UI用カラー ---
const D = {
  bg: "#F4F7FB",
  card: "#FFFFFF",
  blue: "#2F6BFF",
  blueBg: "#EAF1FF",
  title: "#102A43",
  desc: "#5C677D",
};

// --- 既存UI用カラー ---
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
// 診断データ
// ============================================================
const STEP3_OPTIONS = {
  "住む-購入":     { question: "重視したい条件は？",     options: ["駅近・立地", "広さ・間取り", "価格の安さ"] },
  "住む-賃貸":     { question: "重視したい条件は？",     options: ["駅近・立地", "広さ・間取り", "価格の安さ"] },
  "投資-初めて":   { question: "重視したい投資方針は？", options: ["安定収入", "売却益", "低リスク"] },
  "投資-経験あり": { question: "重視したい投資方針は？", options: ["安定収入", "売却益", "低リスク"] },
};

// TASK③：結果文言強化
const RESULTS = {
  "住む-購入": {
    icon: "🏡",
    title: 'あなたは「無理なく購入スタート型」です',
    desc: "今すぐ購入を検討できる可能性があります。まずは予算・希望エリア・住宅ローンの目安を整理することで、失敗しない物件選びができます。",
    cta: "今の市場状況だと早めの相談が有利です。LINEで今すぐ無料診断を受けられます",
  },
  "住む-賃貸": {
    icon: "🔑",
    title: 'あなたは「まずは賃貸で安心スタート型」です',
    desc: "生活スタイルや予算に合わせて、無理なく住める物件を探すのがおすすめです。将来的な購入も見据えて、今の条件を整理しましょう。",
    cta: "条件の良い物件はすぐ埋まります。LINEで最新情報を受け取れます",
  },
  "投資-初めて": {
    icon: "📚",
    title: 'あなたは「低リスク投資スタート型」です',
    desc: "初めての不動産投資では、利回りだけでなく空室リスク・管理費・出口戦略まで確認することが大切です。まずはリスクの少ない選択肢から検討しましょう。",
    cta: "リスクを抑えるには早めの情報収集が重要です。LINEで無料相談できます",
  },
  "投資-経験あり": {
    icon: "📊",
    title: 'あなたは「積極投資検討型」です',
    desc: "収益性・エリア・出口戦略を比較しながら、より条件の良い投資物件を検討できます。複数物件の比較や収益シミュレーションがおすすめです。",
    cta: "好条件の物件はスピード勝負です。LINEで最新案件をチェックできます",
  },
};

// ============================================================
// LINEButton — TASK①②⑤
// ============================================================
function LINEButton() {
  const [hover, setHover] = useState(false);
  const [active, setActive] = useState(false);

  const handleClick = () => {
    window.open(LINE_URL, "_blank", "noopener,noreferrer");
  };

  return (
    <div style={{ marginBottom: 6 }}>
      <button
        onClick={handleClick}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => { setHover(false); setActive(false); }}
        onMouseDown={() => setActive(true)}
        onMouseUp={() => setActive(false)}
        onTouchStart={() => setActive(true)}
        onTouchEnd={() => setActive(false)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          width: "100%",
          background: hover ? "#05a847" : "#06C755",
          color: "#fff",
          border: "none",
          borderRadius: 14,
          padding: "16px",
          fontSize: 16,
          fontWeight: 700,
          cursor: "pointer",
          fontFamily: "'Noto Sans JP', sans-serif",
          marginBottom: 6,
          boxSizing: "border-box",
          transition: "all 0.2s ease",
          transform: active ? "scale(0.98)" : "scale(1)",
          boxShadow: hover
            ? "0 4px 20px rgba(6,199,85,0.35)"
            : "0 2px 8px rgba(6,199,85,0.2)",
        }}
      >
        <svg width="20" height="20" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 4C11.163 4 4 10.268 4 17.994c0 6.993 6.2 12.848 14.594 13.808.568.122 1.341.374 1.537.859.176.44.115 1.13.056 1.576l-.249 1.492c-.076.44-.351 1.723 1.51.939 1.861-.784 10.042-5.914 13.7-10.125C37.175 23.658 38 20.93 38 17.994 38 10.268 28.837 4 20 4z" fill="white"/>
        </svg>
        30秒で無料相談する
      </button>
      <p style={{ fontSize: 12, color: "#06C755", textAlign: "center", fontFamily: "'Noto Sans JP', sans-serif", fontWeight: 600, marginBottom: 4 }}>
        最短5分で専門家から返信が来ます
      </p>
      <p style={{ fontSize: 11, color: D.desc, textAlign: "center", fontFamily: "'Noto Sans JP', sans-serif", marginBottom: 0 }}>
        LINE追加後「診断」と送信してください
      </p>
    </div>
  );
}

// ============================================================
// DiagnosisGame — 3ステップ診断（TASK④戻るボタン追加）
// ============================================================
function DiagnosisGame({ onNavigate }) {
  const [step, setStep] = useState(1);
  const [s1, setS1] = useState(null);
  const [s2, setS2] = useState(null);
  const [s3, setS3] = useState(null);
  const [hoveredBtn, setHoveredBtn] = useState(null);

  const handleReset = () => {
    setStep(1); setS1(null); setS2(null); setS3(null); setHoveredBtn(null);
  };

  // TASK④：戻る
  const handleBack = () => {
    if (step === 2) { setStep(1); setS1(null); }
    if (step === 3) { setStep(2); setS2(null); }
    setHoveredBtn(null);
  };

  const resultKey = s1 && s2 ? `${s1}-${s2}` : null;
  const result = resultKey ? RESULTS[resultKey] : null;
  const step3Data = resultKey ? STEP3_OPTIONS[resultKey] : null;

  const cardStyle = {
    background: D.card,
    borderRadius: 24,
    boxShadow: "0 12px 40px rgba(0,0,0,0.08)",
    padding: "32px 28px",
    maxWidth: 520,
    margin: "0 auto",
    width: "100%",
    boxSizing: "border-box",
  };

  const optionBtnStyle = (key) => ({
    width: "100%",
    background: hoveredBtn === key ? D.blueBg : D.card,
    border: `2px solid ${hoveredBtn === key ? D.blue : "#D0D7E3"}`,
    borderRadius: 14,
    padding: "18px 20px",
    fontSize: 15,
    fontWeight: 600,
    color: D.title,
    cursor: "pointer",
    fontFamily: "'Noto Sans JP', sans-serif",
    textAlign: "left",
    transition: "all 0.18s ease",
    marginBottom: 10,
    display: "block",
    boxSizing: "border-box",
  });

  const BackButton = () => (
    <button
      onClick={handleBack}
      style={{
        background: "none",
        border: "none",
        color: D.desc,
        fontSize: 13,
        cursor: "pointer",
        fontFamily: "'Noto Sans JP', sans-serif",
        padding: "0 0 16px 0",
        display: "flex",
        alignItems: "center",
        gap: 4,
      }}
    >
      ← 戻る
    </button>
  );

  const progressBar = (
    <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
      {[1, 2, 3].map((s) => (
        <div
          key={s}
          style={{
            height: 4,
            flex: 1,
            borderRadius: 2,
            background: step > s ? D.blue : step === s ? D.blue : "#D0D7E3",
            opacity: step >= s ? 1 : 0.4,
            transition: "all 0.3s",
          }}
        />
      ))}
    </div>
  );

  const stepLabel = (n) => (
    <p style={{ fontSize: 12, fontWeight: 700, color: D.blue, fontFamily: "'Noto Sans JP', sans-serif", marginBottom: 8, letterSpacing: 1 }}>
      STEP {n} / 3
    </p>
  );

  const titleStyle = {
    fontSize: 22,
    fontWeight: 700,
    color: D.title,
    fontFamily: "'Noto Serif JP', serif",
    marginBottom: 20,
    lineHeight: 1.5,
  };

  return (
    <div style={cardStyle}>

      {/* STEP 1 */}
      {step === 1 && (
        <>
          {progressBar}
          {stepLabel(1)}
          <h2 style={titleStyle}>あなたの目的は？</h2>
          {[
            { label: "🏠 住む家を探している", val: "住む" },
            { label: "💰 資産として不動産を考えている", val: "投資" },
          ].map((o) => (
            <button
              key={o.val}
              style={optionBtnStyle(o.val)}
              onMouseEnter={() => setHoveredBtn(o.val)}
              onMouseLeave={() => setHoveredBtn(null)}
              onClick={() => { setS1(o.val); setStep(2); setHoveredBtn(null); }}
            >
              {o.label}
            </button>
          ))}
        </>
      )}

      {/* STEP 2：住む */}
      {step === 2 && s1 === "住む" && (
        <>
          {progressBar}
          <BackButton />
          {stepLabel(2)}
          <h2 style={titleStyle}>どちらを考えていますか？</h2>
          {[
            { label: "🏡 購入したい", val: "購入" },
            { label: "🔑 賃貸で探したい", val: "賃貸" },
          ].map((o) => (
            <button
              key={o.val}
              style={optionBtnStyle(o.val)}
              onMouseEnter={() => setHoveredBtn(o.val)}
              onMouseLeave={() => setHoveredBtn(null)}
              onClick={() => { setS2(o.val); setStep(3); setHoveredBtn(null); }}
            >
              {o.label}
            </button>
          ))}
        </>
      )}

      {/* STEP 2：投資 */}
      {step === 2 && s1 === "投資" && (
        <>
          {progressBar}
          <BackButton />
          {stepLabel(2)}
          <h2 style={titleStyle}>投資経験はありますか？</h2>
          {[
            { label: "📚 初めて", val: "初めて" },
            { label: "📊 経験あり", val: "経験あり" },
          ].map((o) => (
            <button
              key={o.val}
              style={optionBtnStyle(o.val)}
              onMouseEnter={() => setHoveredBtn(o.val)}
              onMouseLeave={() => setHoveredBtn(null)}
              onClick={() => { setS2(o.val); setStep(3); setHoveredBtn(null); }}
            >
              {o.label}
            </button>
          ))}
        </>
      )}

      {/* STEP 3 */}
      {step === 3 && step3Data && (
        <>
          {progressBar}
          <BackButton />
          {stepLabel(3)}
          <h2 style={titleStyle}>{step3Data.question}</h2>
          {step3Data.options.map((o) => (
            <button
              key={o}
              style={optionBtnStyle(o)}
              onMouseEnter={() => setHoveredBtn(o)}
              onMouseLeave={() => setHoveredBtn(null)}
              onClick={() => { setS3(o); setStep(4); setHoveredBtn(null); }}
            >
              {o}
            </button>
          ))}
        </>
      )}

      {/* 結果 STEP 4 */}
      {step === 4 && result && (
        <>
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>{result.icon}</div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: D.title, fontFamily: "'Noto Serif JP', serif", marginBottom: 12, lineHeight: 1.5 }}>
              {result.title}
            </h2>
            <p style={{ fontSize: 14, color: D.desc, fontFamily: "'Noto Sans JP', sans-serif", lineHeight: 1.8, marginBottom: 12 }}>
              {result.desc}
            </p>
            <p style={{ fontSize: 14, fontWeight: 700, color: D.blue, fontFamily: "'Noto Sans JP', sans-serif", marginBottom: 20, background: D.blueBg, borderRadius: 10, padding: "12px 16px" }}>
              💡 {result.cta}
            </p>
          </div>

          <LINEButton />

          <button
            onClick={() => onNavigate("chat")}
            style={{
              width: "100%",
              background: D.blue,
              color: "#fff",
              border: "none",
              borderRadius: 14,
              padding: "14px",
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "'Noto Sans JP', sans-serif",
              marginTop: 10,
              marginBottom: 16,
              boxSizing: "border-box",
              transition: "opacity 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            AIチャットで相談する
          </button>

          <div style={{ textAlign: "center" }}>
            <button
              onClick={handleReset}
              style={{ background: "none", border: "none", color: D.desc, fontSize: 13, cursor: "pointer", fontFamily: "'Noto Sans JP', sans-serif", textDecoration: "underline" }}
            >
              最初からやり直す
            </button>
          </div>
        </>
      )}
    </div>
  );
}

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
      <span style={{ fontFamily: "'Brush Script MT', cursive", fontSize: 32, color: C.red, fontStyle: "italic", display: "inline-block", overflow: "hidden", maxWidth: phase >= 1 ? 120 : 0, opacity: phase >= 1 ? 1 : 0, transition: "max-width 1.4s ease, opacity 0.3s ease", whiteSpace: "nowrap" }}>House</span>
      <span style={{ background: C.navy, color: "#fff", fontSize: 11, fontWeight: 700, fontFamily: "Georgia, serif", letterSpacing: 1, padding: "2px 7px", borderRadius: 4, opacity: phase >= 2 ? 1 : 0, transform: phase >= 2 ? "scale(1)" : "scale(0.7)", transition: "opacity 0.4s ease, transform 0.4s ease" }}>AI</span>
      <span style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: 18, color: C.navy, fontStyle: "italic", overflow: "hidden", maxWidth: phase >= 3 ? 200 : 0, opacity: phase >= 3 ? 1 : 0, transition: "max-width 1s ease, opacity 0.4s ease", whiteSpace: "nowrap" }}>コンシェルジュ</span>
      <span style={{ position: "absolute", bottom: -4, left: 0, height: 2, background: C.gold, width: phase >= 4 ? "100%" : "0%", transition: "width 0.4s ease", borderRadius: 1 }} />
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
    <div style={{ background: C.ticker, borderTop: `1px solid ${C.cardBorder}`, borderBottom: `1px solid ${C.cardBorder}`, overflow: "hidden", padding: "7px 0" }}>
      <style>{`@keyframes ticker { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }`}</style>
      <div style={{ display: "inline-flex", whiteSpace: "nowrap", animation: "ticker 28s linear infinite" }}>
        {[0, 1].map((i) => (
          <span key={i} style={{ fontSize: 12, color: C.text2, letterSpacing: 0.5, paddingRight: 80, fontFamily: "'Noto Sans JP', sans-serif" }}>{text}</span>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// CommunityBanner
// ============================================================
function CommunityBanner({ onNavigate }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={() => onNavigate("community")}
      style={{ background: "#fdf6e8", border: `1px solid ${C.cardBorder}`, borderRadius: 14, padding: "16px 20px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 16, boxShadow: hovered ? "0 4px 16px rgba(201,168,76,0.15)" : "none", transition: "box-shadow 0.2s" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div>
        <p style={{ fontSize: 13, fontWeight: 700, color: C.text1, fontFamily: "'Noto Sans JP', sans-serif", marginBottom: 3 }}>👥 みんなの不動産コミュニティ</p>
        <p style={{ fontSize: 12, color: C.text2, fontFamily: "'Noto Sans JP', sans-serif" }}>体験談・質問・情報交換はこちら</p>
      </div>
      <span style={{ background: C.gold, color: "#fff", fontSize: 12, fontWeight: 700, padding: "5px 14px", borderRadius: 20, fontFamily: "'Noto Sans JP', sans-serif", flexShrink: 0 }}>参加する</span>
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
        <div key={t.title} onClick={() => onNavigate("column")}
          style={{ background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 12, padding: "12px 14px", cursor: "pointer" }}
        >
          <span style={{ fontSize: 10, fontWeight: 700, color: "#fff", background: t.tagColor, borderRadius: 4, padding: "2px 7px", fontFamily: "'Noto Sans JP', sans-serif" }}>{t.tag}</span>
          <p style={{ fontSize: 13, fontWeight: 700, color: C.text1, marginTop: 6, marginBottom: 3, fontFamily: "'Noto Sans JP', sans-serif" }}>{t.title}</p>
          <p style={{ fontSize: 11, color: C.text3, fontFamily: "'Noto Sans JP', sans-serif", lineHeight: 1.5 }}>{t.desc}</p>
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
      <button onClick={() => onNavigate("property")}
        style={{ flex: 1, background: C.navy, color: "#fff", border: "none", borderRadius: 14, padding: "20px", cursor: "pointer", textAlign: "left", transition: "opacity 0.2s" }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.88")}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
      >
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", fontFamily: "'Noto Sans JP', sans-serif", marginBottom: 6 }}>売買 / 賃貸 / 収益物件</p>
        <p style={{ fontSize: 18, fontWeight: 700, fontFamily: "'Noto Serif JP', serif" }}>🏄 物件サーフィン</p>
      </button>
      <button onClick={() => onNavigate("valuation")}
        style={{ flex: 1, background: C.gold, color: C.navy, border: "none", borderRadius: 14, padding: "20px", cursor: "pointer", textAlign: "left", transition: "opacity 0.2s" }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.88")}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
      >
        <p style={{ fontSize: 12, color: "rgba(26,58,92,0.6)", fontFamily: "'Noto Sans JP', sans-serif", marginBottom: 6 }}>家の相場が気になる方</p>
        <p style={{ fontSize: 18, fontWeight: 700, fontFamily: "'Noto Serif JP', serif" }}>🏠 無料AI査定</p>
      </button>
    </section>
  );
}

// ============================================================
// Header
// ============================================================
function Header({ onNavigate }) {
  return (
    <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", background: "transparent" }}>
      <AnimatedLogo />
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={() => onNavigate("login")}
          style={{ background: "transparent", border: `1.5px solid ${C.navy}`, color: C.navy, borderRadius: 8, padding: "6px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Noto Sans JP', sans-serif" }}
        >ログイン</button>
        <button onClick={() => onNavigate("register")}
          style={{ background: C.navy, border: "none", color: "#fff", borderRadius: 8, padding: "6px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Noto Sans JP', sans-serif" }}
        >会員登録</button>
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
    <div style={{ minHeight: "100vh", background: D.bg, fontFamily: "'Noto Sans JP', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;600;700&family=Noto+Serif+JP:wght@400;700&display=swap" rel="stylesheet" />
      <Header onNavigate={navigate} />
      <TickerBanner />
      <main style={{ maxWidth: 900, margin: "0 auto", padding: "32px 20px 48px" }}>
        <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <DiagnosisGame onNavigate={navigate} />
            <CommunityBanner onNavigate={navigate} />
          </div>
          <TopicsPanel onNavigate={navigate} />
        </div>
        <SubActionButtons onNavigate={navigate} />
      </main>
    </div>
  );
}
