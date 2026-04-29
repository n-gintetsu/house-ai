import { useState, useEffect, useRef } from "react";

// ============================================================
// HomeScreen.jsx — CV最大化版
// 心理導線：不安 → 共感 → 解決 → 行動
// ============================================================

const LINE_URL = "https://line.me/R/ti/p/@216lcryt";

const C = {
  navy: "#1a3a5c",
  gold: "#c9a84c",
  green: "#06C755",
  bg: "#F4F7FB",
  card: "#ffffff",
  blue: "#2F6BFF",
  blueBg: "#EAF1FF",
  title: "#102A43",
  desc: "#5C677D",
  border: "#E2E8F0",
  red: "#c0392b",
  redBg: "#fff5f5",
};

// ============================================================
// 会話フローデータ
// ============================================================
const FLOW = {
  start: {
    text: "こんにちは！不動産AIコンシェルジュです😊\n30秒であなたに最適な解決方法をご提案します。\n\nどんなご相談ですか？",
    choices: [
      { label: "🏠 購入したい", next: "buy_type" },
      { label: "🏷️ 売却したい", next: "sell_worry" },
      { label: "💰 投資したい", next: "invest_worry" },
      { label: "🔨 リフォームしたい", next: "reform_worry" },
      { label: "😟 トラブル・悩み", next: "trouble_worry" },
    ],
  },
  buy_type: {
    text: "どんな物件をお探しですか？",
    choices: [
      { label: "🏗️ 新築", next: "buy_area", tag: "新築" },
      { label: "🏚️ 中古", next: "buy_area", tag: "中古" },
      { label: "🏢 マンション", next: "buy_area", tag: "マンション" },
      { label: "🏡 戸建て", next: "buy_area", tag: "戸建て" },
    ],
  },
  buy_area: {
    text: "ご希望のエリアはどちらですか？",
    freeInput: true,
    freeInputPlaceholder: "例：さいたま市、大宮近辺など",
    next: "buy_worry",
  },
  buy_worry: {
    text: "今こんな不安ありませんか？👇",
    choices: [
      { label: "💸 予算が不安", next: "value", tag: "予算不安" },
      { label: "🏦 ローンが不安", next: "value", tag: "ローン不安" },
      { label: "😰 失敗したくない", next: "value", tag: "失敗回避" },
      { label: "🤷 何から始めるかわからない", next: "value", tag: "初心者" },
    ],
  },
  sell_worry: {
    text: "今こんな不安ありませんか？👇",
    choices: [
      { label: "📉 相場がわからない", next: "value", tag: "相場不安" },
      { label: "⏰ いつ売るか迷っている", next: "value", tag: "タイミング" },
      { label: "💰 少しでも高く売りたい", next: "value", tag: "高値売却" },
      { label: "🏦 ローン残債がある", next: "value", tag: "残債あり" },
    ],
  },
  invest_worry: {
    text: "投資について、今どの段階ですか？",
    choices: [
      { label: "📚 初めて検討している", next: "value", tag: "初心者" },
      { label: "📊 すでに1件以上所有", next: "value", tag: "経験者" },
      { label: "🔍 物件を探している", next: "value", tag: "物件探し中" },
      { label: "💹 利回りを改善したい", next: "value", tag: "利回り改善" },
    ],
  },
  reform_worry: {
    text: "リフォームについて教えてください😊",
    choices: [
      { label: "🏠 購入前にリフォームしたい", next: "value", tag: "購入前" },
      { label: "🔧 今の家をリフォームしたい", next: "value", tag: "現居" },
      { label: "💰 費用感が知りたい", next: "value", tag: "費用確認" },
      { label: "🏗️ 業者を探している", next: "value", tag: "業者探し" },
    ],
  },
  trouble_worry: {
    text: "どんなお悩みですか？一緒に整理しましょう😊",
    choices: [
      { label: "👥 隣人・近隣トラブル", next: "value", tag: "近隣トラブル" },
      { label: "📄 契約・法律のこと", next: "value", tag: "法律" },
      { label: "🏚️ 空き家の管理", next: "value", tag: "空き家" },
      { label: "💰 税金・相続のこと", next: "value", tag: "税金相続" },
    ],
  },
  value: {
    type: "value",
    next: "cta",
  },
  cta: {
    text: "あなた専用の提案を作成できます👇\n\n・おすすめ物件\n・資金計画\n・注意点\n\n👉 無料で確認しますか？",
    choices: [
      { label: "✅ はい、確認したい！", next: "register" },
      { label: "🤔 まだ考えたい", next: "later" },
    ],
  },
  register: {
    type: "register",
    text: "続きは無料会員登録で確認できます👇\n※営業連絡は一切ありません",
  },
  later: {
    type: "line_only",
    text: "わかりました😊\nいつでもご相談ください！",
  },
};

function getValueText(tags) {
  const tagStr = tags.join("・");
  return `ありがとうございます😊\n\n「${tagStr}」のお悩みですね。\n\nあなたの状況だと、情報不足のまま進むと損するケースが多いです。\n\nただ安心してください。\n今の条件なら最適な選択肢を出せます。`;
}

// ============================================================
// AIChatFlow
// ============================================================
function AIChatFlow({ onNavigate }) {
  const [messages, setMessages] = useState([]);
  const [currentNode, setCurrentNode] = useState("start");
  const [tags, setTags] = useState([]);
  const [freeInput, setFreeInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [step, setStep] = useState(1);
  const endRef = useRef(null);

  useEffect(() => {
    addAIMessage(FLOW.start.text);
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const addAIMessage = (text, delay = 0) => {
    if (delay > 0) {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        setMessages((p) => [...p, { role: "ai", text }]);
      }, delay);
    } else {
      setMessages((p) => [...p, { role: "ai", text }]);
    }
  };

  const handleChoice = (choice) => {
    setMessages((p) => [...p, { role: "user", text: choice.label }]);
    if (choice.tag) setTags((p) => [...p, choice.tag]);
    setStep((s) => Math.min(s + 1, 4));
    const nextId = choice.next;
    const nextNode = FLOW[nextId];
    if (!nextNode) return;
    if (nextNode.type === "value") {
      const vText = getValueText(choice.tag ? [...tags, choice.tag] : tags);
      setCurrentNode(nextId);
      addAIMessage(vText, 800);
      setTimeout(() => {
        setCurrentNode("cta");
        addAIMessage(FLOW.cta.text, 1600);
        setStep(4);
      }, 2400);
      return;
    }
    setCurrentNode(nextId);
    if (nextNode.text) addAIMessage(nextNode.text, 700);
  };

  const handleFreeInput = () => {
    if (!freeInput.trim()) return;
    const node = FLOW[currentNode];
    setMessages((p) => [...p, { role: "user", text: freeInput }]);
    setTags((p) => [...p, freeInput]);
    setFreeInput("");
    if (node.next) {
      const nextNode = FLOW[node.next];
      setCurrentNode(node.next);
      setStep((s) => Math.min(s + 1, 4));
      if (nextNode.text) addAIMessage(nextNode.text, 700);
    }
  };

  const handleReset = () => {
    setMessages([]);
    setCurrentNode("start");
    setTags([]);
    setFreeInput("");
    setStep(1);
    setTimeout(() => addAIMessage(FLOW.start.text), 100);
  };

  const node = FLOW[currentNode];

  return (
    <div style={{ background: C.card, borderRadius: 20, boxShadow: "0 8px 32px rgba(0,0,0,0.08)", overflow: "hidden" }}>
      {/* ヘッダー */}
      <div style={{ background: C.navy, padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 30, height: 30, borderRadius: "50%", background: C.gold, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🏠</div>
          <div>
            <p style={{ color: "#fff", fontSize: 12, fontWeight: 700, margin: 0, fontFamily: "'Noto Sans JP', sans-serif" }}>不動産AIコンシェルジュ</p>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 10, margin: 0, fontFamily: "'Noto Sans JP', sans-serif" }}>● オンライン</p>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 10, margin: "0 0 3px", fontFamily: "'Noto Sans JP', sans-serif" }}>あと{Math.max(0, 4 - step)}問</p>
          <div style={{ display: "flex", gap: 3 }}>
            {[1,2,3,4].map((s) => (
              <div key={s} style={{ width: 16, height: 3, borderRadius: 2, background: step >= s ? C.gold : "rgba(255,255,255,0.2)", transition: "background 0.3s" }} />
            ))}
          </div>
        </div>
      </div>

      {/* メッセージ */}
      <div style={{ padding: "12px", background: "#F0F4F8", minHeight: 240, maxHeight: 320, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
            {m.role === "ai" && <div style={{ width: 24, height: 24, borderRadius: "50%", background: C.navy, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, marginRight: 6, flexShrink: 0 }}>🏠</div>}
            <div style={{ maxWidth: "78%", background: m.role === "ai" ? "#fff" : C.navy, color: m.role === "ai" ? C.title : "#fff", borderRadius: m.role === "ai" ? "4px 14px 14px 14px" : "14px 4px 14px 14px", padding: "8px 12px", fontSize: 12, lineHeight: 1.7, fontFamily: "'Noto Sans JP', sans-serif", whiteSpace: "pre-wrap", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              {m.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 24, height: 24, borderRadius: "50%", background: C.navy, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>🏠</div>
            <div style={{ background: "#fff", borderRadius: "4px 14px 14px 14px", padding: "8px 14px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <style>{`@keyframes d{0%,80%,100%{opacity:.3;transform:translateY(0)}40%{opacity:1;transform:translateY(-3px)}}`}</style>
              {[0,1,2].map((i) => <span key={i} style={{ display: "inline-block", width: 5, height: 5, borderRadius: "50%", background: C.desc, margin: "0 2px", animation: "d 1.1s infinite", animationDelay: `${i*0.15}s` }} />)}
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* 選択肢エリア */}
      <div style={{ padding: "12px", background: "#fff", borderTop: `1px solid ${C.border}` }}>
        {!isTyping && node?.choices && !["cta","register","later"].includes(currentNode) && (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {node.choices.map((c, i) => (
              <button key={i} onClick={() => handleChoice(c)} style={{ background: "#fff", border: `1.5px solid ${C.border}`, borderRadius: 10, padding: "10px 14px", fontSize: 13, fontWeight: 600, color: C.title, cursor: "pointer", textAlign: "left", fontFamily: "'Noto Sans JP', sans-serif", transition: "all 0.15s" }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.blue; e.currentTarget.style.background = C.blueBg; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = "#fff"; }}
              >{c.label}</button>
            ))}
          </div>
        )}
        {!isTyping && node?.freeInput && (
          <div style={{ display: "flex", gap: 6 }}>
            <input value={freeInput} onChange={(e) => setFreeInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleFreeInput()} placeholder={node.freeInputPlaceholder} style={{ flex: 1, border: `1.5px solid ${C.border}`, borderRadius: 10, padding: "10px 12px", fontSize: 13, outline: "none", fontFamily: "'Noto Sans JP', sans-serif", color: C.title }} />
            <button onClick={handleFreeInput} style={{ background: C.navy, color: "#fff", border: "none", borderRadius: 10, padding: "10px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Noto Sans JP', sans-serif" }}>送信</button>
          </div>
        )}
        {!isTyping && currentNode === "cta" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {FLOW.cta.choices.map((c, i) => (
              <button key={i} onClick={() => handleChoice(c)} style={{ background: i === 0 ? C.navy : "#fff", color: i === 0 ? "#fff" : C.desc, border: `1.5px solid ${i === 0 ? C.navy : C.border}`, borderRadius: 10, padding: "12px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Noto Sans JP', sans-serif" }}>{c.label}</button>
            ))}
          </div>
        )}
        {!isTyping && currentNode === "register" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <button onClick={() => onNavigate("member")} style={{ background: C.navy, color: "#fff", border: "none", borderRadius: 10, padding: "14px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Noto Sans JP', sans-serif" }}>👤 無料会員登録はこちら</button>
            <p style={{ fontSize: 11, color: "#888", textAlign: "center", margin: 0, fontFamily: "'Noto Sans JP', sans-serif" }}>※営業は一切ありません</p>
            <button onClick={handleReset} style={{ background: "none", border: "none", color: C.desc, fontSize: 11, cursor: "pointer", fontFamily: "'Noto Sans JP', sans-serif", textDecoration: "underline" }}>最初からやり直す</button>
          </div>
        )}
        {!isTyping && currentNode === "later" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <button onClick={handleReset} style={{ background: "none", border: `1.5px solid ${C.border}`, borderRadius: 10, padding: "10px", fontSize: 12, color: C.desc, cursor: "pointer", fontFamily: "'Noto Sans JP', sans-serif" }}>最初からやり直す</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// 左サイド：不安・失敗事例
// ============================================================
function LeftPanel({ onNavigate }) {
  const cases = [
    { title: "住宅購入で後悔しました", tag: "購入", desc: "営業に急かされて決めてしまった。もっと比較すれば良かった..." },
    { title: "リフォームで100万損しました", tag: "リフォーム", desc: "見積もりを1社しか取らなかったのが失敗でした..." },
    { title: "投資物件で空室が続いています", tag: "投資", desc: "利回りだけ見て立地を軽視していた..." },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ background: C.card, borderRadius: 18, padding: "20px", border: `0.5px solid ${C.border}` }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: C.red, margin: "0 0 14px", fontFamily: "'Noto Sans JP', sans-serif", lineHeight: 1.5 }}>
          ⚠️ 知らないと損する<br />不動産の現実
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {cases.map((c, i) => (
            <div key={i} style={{ background: C.redBg, borderLeft: `3px solid ${C.red}`, padding: "10px 12px", borderRadius: "0 10px 10px 0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: C.red, margin: 0, fontFamily: "'Noto Sans JP', sans-serif" }}>{c.title}</p>
                <span style={{ fontSize: 9, background: "#ffd5d5", color: C.red, padding: "1px 5px", borderRadius: 3, fontWeight: 600, flexShrink: 0, marginLeft: 4 }}>{c.tag}</span>
              </div>
              <p style={{ fontSize: 10, color: "#666", margin: 0, lineHeight: 1.5, fontFamily: "'Noto Sans JP', sans-serif" }}>{c.desc}</p>
            </div>
          ))}
        </div>
        <button onClick={() => onNavigate("community")} style={{ marginTop: 12, width: "100%", background: C.navy, color: "#fff", border: "none", borderRadius: 8, padding: "10px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'Noto Sans JP', sans-serif" }}>
          体験談を見る → 失敗を避ける
        </button>
      </div>
    </div>
  );
}

// ============================================================
// 右サイド：最新情報
// ============================================================
function RightPanel({ onNavigate }) {
  const news = [
    { badge: "新着", badgeBg: C.blueBg, badgeColor: C.blue, text: "大宮エリアで新着物件3件" },
    { badge: "市場", badgeBg: "#FFF9E6", badgeColor: "#854F0B", text: "変動金利、上昇傾向が続く" },
    { badge: "NEWS", badgeBg: "#E8F5E9", badgeColor: "#27500A", text: "AI査定サービス開始" },
    { badge: "INFO", badgeBg: "#F0F4F8", badgeColor: C.desc, text: "空き家対策セミナー開催予定" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ background: C.card, borderRadius: 18, padding: "20px", border: `0.5px solid ${C.border}` }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: C.title, margin: "0 0 12px", fontFamily: "'Noto Sans JP', sans-serif" }}>📰 最新情報</p>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {news.map((n, i) => (
            <div key={i} style={{ padding: "10px 0", borderBottom: i < news.length - 1 ? `0.5px solid ${C.border}` : "none", display: "flex", alignItems: "flex-start", gap: 8 }}>
              <span style={{ fontSize: 9, background: n.badgeBg, color: n.badgeColor, padding: "2px 5px", borderRadius: 3, fontWeight: 700, flexShrink: 0, marginTop: 1 }}>{n.badge}</span>
              <p style={{ fontSize: 12, color: C.title, margin: 0, lineHeight: 1.6, fontFamily: "'Noto Sans JP', sans-serif" }}>{n.text}</p>
            </div>
          ))}
        </div>
        <button onClick={() => onNavigate("properties")} style={{ marginTop: 10, width: "100%", background: C.bg, color: C.navy, border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "'Noto Sans JP', sans-serif" }}>
          物件一覧を見る →
        </button>
      </div>
    </div>
  );
}

// ============================================================
// コミュニティ導線（中央下）
// ============================================================
function CommunityStrip({ onNavigate }) {
  const posts = [
    { title: "住宅購入で後悔しました", tag: "購入", tagBg: C.blueBg, tagColor: C.blue, desc: "営業に急かされて決めてしまった..." },
    { title: "リフォームで100万損しました", tag: "リフォーム", tagBg: C.redBg, tagColor: C.red, desc: "見積もりを1社しか取らなかった..." },
  ];

  return (
    <div style={{ background: C.card, borderRadius: 18, padding: "20px", border: `0.5px solid ${C.border}` }}>
      <p style={{ fontSize: 13, fontWeight: 700, color: C.title, margin: "0 0 12px", fontFamily: "'Noto Sans JP', sans-serif" }}>
        💬 あなたの不安、みんな同じです
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {posts.map((p, i) => (
          <div key={i} style={{ background: C.bg, borderRadius: 10, padding: "10px 12px", cursor: "pointer" }} onClick={() => onNavigate("community")}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: C.title, margin: 0, fontFamily: "'Noto Sans JP', sans-serif" }}>{p.title}</p>
              <span style={{ fontSize: 9, background: p.tagBg, color: p.tagColor, padding: "2px 6px", borderRadius: 4, fontWeight: 600, flexShrink: 0, marginLeft: 6 }}>{p.tag}</span>
            </div>
            <p style={{ fontSize: 11, color: C.desc, margin: 0, fontFamily: "'Noto Sans JP', sans-serif" }}>{p.desc}</p>
          </div>
        ))}
      </div>
      <button onClick={() => onNavigate("community")} style={{ marginTop: 10, width: "100%", background: "none", border: `1.5px solid ${C.border}`, borderRadius: 8, padding: "8px", fontSize: 12, color: C.blue, fontWeight: 700, cursor: "pointer", fontFamily: "'Noto Sans JP', sans-serif" }}>
        体験談を見る →
      </button>
    </div>
  );
}

// ============================================================
// TickerBanner
// ============================================================
function MiniTicker() {
  const text = ["🏠 新着物件が更新されました", "🤝 専門家ネットワーク拡大中", "✨ AI査定サービス開始", "📰 空き家対策セミナー開催予定"].join("　　●　　");
  return (
    <div style={{ background: "#fffbe6", borderBottom: "1px solid #f0d060", overflow: "hidden", padding: "5px 0" }}>
      <style>{`@keyframes tk{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}`}</style>
      <div style={{ display: "inline-flex", whiteSpace: "nowrap", animation: "tk 24s linear infinite" }}>
        {[0,1].map((i) => <span key={i} style={{ fontSize: 11, color: "#92400e", paddingRight: 60, fontFamily: "'Noto Sans JP', sans-serif" }}>{text}</span>)}
      </div>
    </div>
  );
}

// ============================================================
// 固定底部CTA
// ============================================================
function FixedCTA({ onStartChat }) {
  return (
    <div style={{ position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)", zIndex: 1000 }}>
      <button onClick={onStartChat} style={{ background: C.navy, color: "#fff", border: "none", borderRadius: 50, padding: "14px 32px", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "'Noto Sans JP', sans-serif", boxShadow: "0 4px 20px rgba(26,58,92,0.4)", whiteSpace: "nowrap", transition: "all 0.2s", display: "flex", alignItems: "center", gap: 8 }}
        onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.04)"}
        onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
      >
        💬 無料でAI相談する
      </button>
    </div>
  );
}

// ============================================================
// HomeScreen
// ============================================================
export default function HomeScreen({ onNavigate }) {
  const navigate = onNavigate || (() => {});
  const [showChat, setShowChat] = useState(false);
  const chatRef = useRef(null);

  const handleStartChat = () => {
    setShowChat(true);
    setTimeout(() => chatRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Noto Sans JP', sans-serif", paddingBottom: 80 }}>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;600;700&family=Noto+Serif+JP:wght@400;700&display=swap" rel="stylesheet" />
      <MiniTicker />

      <main style={{ maxWidth: "100%", margin: "0 auto", padding: "20px 24px 48px" }}>

        {/* ファーストビュー */}
        <div style={{ textAlign: "center", padding: "24px 16px 28px", maxWidth: 800, margin: "0 auto" }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: C.red, letterSpacing: 2, marginBottom: 8, fontFamily: "'Noto Sans JP', sans-serif" }}>
            ⚠️ 知らずに進むと損します
          </p>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: C.title, fontFamily: "'Noto Serif JP', serif", lineHeight: 1.4, marginBottom: 8 }}>
            あなたの不動産判断、<br />30秒で最適化
          </h1>
          <p style={{ fontSize: 13, color: C.desc, fontFamily: "'Noto Sans JP', sans-serif", marginBottom: 20, lineHeight: 1.7 }}>
            営業なし・完全無料｜AIが最適な進め方を提示します
          </p>

          {/* クイック選択（最大3つ表示） */}
          <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginBottom: 20 }}>
            {["🏠 家を買いたい", "🏷️ 売りたい", "💰 投資したい"].map((label) => (
              <button key={label} onClick={handleStartChat} style={{ background: "#fff", border: `1.5px solid ${C.border}`, borderRadius: 10, padding: "10px 16px", fontSize: 13, fontWeight: 600, color: C.title, cursor: "pointer", fontFamily: "'Noto Sans JP', sans-serif", transition: "all 0.15s" }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.blue; e.currentTarget.style.background = C.blueBg; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = "#fff"; }}
              >{label}</button>
            ))}
          </div>

          {/* メインCTA（1つだけ強調） */}
          <button onClick={handleStartChat} style={{ background: C.navy, color: "#fff", border: "none", borderRadius: 50, padding: "16px 48px", fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: "'Noto Sans JP', sans-serif", boxShadow: "0 4px 20px rgba(26,58,92,0.3)", transition: "all 0.2s" }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.03)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
          >
            💬 無料でAI相談する
          </button>
          <p style={{ fontSize: 10, color: "#aaa", marginTop: 8, fontFamily: "'Noto Sans JP', sans-serif" }}>※営業は一切ありません</p>
        </div>

        {/* 3カラムレイアウト */}
        <div style={{ display: "grid", gridTemplateColumns: "280px 1fr 260px", gap: 0, alignItems: "start", width: "100%", padding: "0" }}>

          {/* 左：不安・失敗事例 */}
          <div style={{ padding: "0 16px 0 20px" }}><LeftPanel onNavigate={navigate} /></div>

          {/* 中央：AIチャット + コミュニティ */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "0 12px" }} ref={chatRef}>
            {showChat ? (
              <AIChatFlow onNavigate={navigate} />
            ) : (
              <div style={{ background: C.card, borderRadius: 20, padding: "24px", border: `0.5px solid ${C.border}`, textAlign: "center", cursor: "pointer" }} onClick={handleStartChat}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>🤖</div>
                <p style={{ fontSize: 15, fontWeight: 700, color: C.title, fontFamily: "'Noto Serif JP', serif", marginBottom: 6 }}>AIに相談してみる</p>
                <p style={{ fontSize: 12, color: C.desc, fontFamily: "'Noto Sans JP', sans-serif", marginBottom: 16, lineHeight: 1.6 }}>3ステップで最適な進め方を提案します</p>
                <div style={{ background: C.navy, color: "#fff", borderRadius: 50, padding: "12px 32px", fontSize: 14, fontWeight: 700, display: "inline-block", fontFamily: "'Noto Sans JP', sans-serif" }}>
                  💬 無料でAI相談する
                </div>
              </div>
            )}
            <CommunityStrip onNavigate={navigate} />
          </div>

          {/* 右：最新情報 */}
          <div style={{ padding: "0 20px 0 16px" }}><RightPanel onNavigate={navigate} /></div>
        </div>

        {/* 裏導線（小さく） */}
        <div style={{ display: "flex", justifyContent: "center", gap: 16, padding: "20px 16px 0", flexWrap: "wrap" }}>
          {[
            { label: "業者の方はこちら", tab: "agency" },
            { label: "専門家の方はこちら", tab: "expert" },
            { label: "物件を見る", tab: "properties" },
          ].map((l) => (
            <button key={l.label} onClick={() => navigate(l.tab)} style={{ background: "none", border: "none", color: "#bbb", fontSize: 11, cursor: "pointer", fontFamily: "'Noto Sans JP', sans-serif", textDecoration: "underline" }}>
              {l.label}
            </button>
          ))}
        </div>
      </main>

      <FixedCTA onStartChat={handleStartChat} />
    </div>
  );
}
