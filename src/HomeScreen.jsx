import { useState, useEffect, useRef } from "react";

// ============================================================
// HomeScreen.jsx — 不動産AIコンシェルジュ
// AI主導型営業フロー v1（仕様書準拠）
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
};

// ============================================================
// 会話フローデータ
// ============================================================
const FLOW = {
  start: {
    id: "start",
    text: "こんにちは！不動産AIコンシェルジュです😊\n30秒であなたに最適な解決方法をご提案します。\n\nまず教えてください👇 どんなご相談ですか？",
    choices: [
      { label: "🏠 購入したい", next: "buy_type" },
      { label: "🏷️ 売却したい", next: "sell_worry" },
      { label: "💰 投資したい", next: "invest_worry" },
      { label: "🔨 リフォームしたい", next: "reform_worry" },
      { label: "😟 トラブル・悩みがある", next: "trouble_worry" },
    ],
  },
  buy_type: {
    id: "buy_type",
    text: "ありがとうございます😊\nどんな物件をお探しですか？",
    choices: [
      { label: "🏗️ 新築", next: "buy_area", tag: "新築" },
      { label: "🏚️ 中古", next: "buy_area", tag: "中古" },
      { label: "🏢 マンション", next: "buy_area", tag: "マンション" },
      { label: "🏡 戸建て", next: "buy_area", tag: "戸建て" },
    ],
  },
  buy_area: {
    id: "buy_area",
    text: "ご希望のエリアはどちらですか？",
    freeInput: true,
    freeInputPlaceholder: "例：さいたま市、大宮近辺など",
    next: "buy_worry",
  },
  buy_worry: {
    id: "buy_worry",
    text: "ちなみに今こんな不安ありませんか？👇",
    choices: [
      { label: "💸 予算が不安", next: "buy_value", tag: "予算不安" },
      { label: "🏦 ローンが不安", next: "buy_value", tag: "ローン不安" },
      { label: "😰 失敗したくない", next: "buy_value", tag: "失敗回避" },
      { label: "🤷 何から始めるかわからない", next: "buy_value", tag: "初心者" },
    ],
  },
  buy_value: {
    id: "buy_value",
    text: null, // 動的生成
    type: "value",
    next: "cta",
  },
  sell_worry: {
    id: "sell_worry",
    text: "ちなみに今こんな不安ありませんか？👇",
    choices: [
      { label: "📉 相場がわからない", next: "sell_value", tag: "相場不安" },
      { label: "⏰ いつ売るか迷っている", next: "sell_value", tag: "タイミング" },
      { label: "💰 少しでも高く売りたい", next: "sell_value", tag: "高値売却" },
      { label: "🏦 ローン残債がある", next: "sell_value", tag: "残債あり" },
    ],
  },
  sell_value: {
    id: "sell_value",
    text: null,
    type: "value",
    next: "cta",
  },
  invest_worry: {
    id: "invest_worry",
    text: "投資について、今どの段階ですか？",
    choices: [
      { label: "📚 初めて検討している", next: "invest_value", tag: "初心者" },
      { label: "📊 すでに1件以上所有", next: "invest_value", tag: "経験者" },
      { label: "🔍 物件を探している", next: "invest_value", tag: "物件探し中" },
      { label: "💹 利回りを改善したい", next: "invest_value", tag: "利回り改善" },
    ],
  },
  invest_value: {
    id: "invest_value",
    text: null,
    type: "value",
    next: "cta",
  },
  reform_worry: {
    id: "reform_worry",
    text: "リフォームについて教えてください😊",
    choices: [
      { label: "🏠 購入前にリフォームしたい", next: "reform_value", tag: "購入前" },
      { label: "🔧 今の家をリフォームしたい", next: "reform_value", tag: "現居" },
      { label: "💰 費用感が知りたい", next: "reform_value", tag: "費用確認" },
      { label: "🏗️ 業者を探している", next: "reform_value", tag: "業者探し" },
    ],
  },
  reform_value: {
    id: "reform_value",
    text: null,
    type: "value",
    next: "cta",
  },
  trouble_worry: {
    id: "trouble_worry",
    text: "どんなお悩みですか？\n一緒に整理しましょう😊",
    choices: [
      { label: "👥 隣人・近隣トラブル", next: "trouble_value", tag: "近隣トラブル" },
      { label: "📄 契約・法律のこと", next: "trouble_value", tag: "法律" },
      { label: "🏚️ 空き家の管理", next: "trouble_value", tag: "空き家" },
      { label: "💰 税金・相続のこと", next: "trouble_value", tag: "税金相続" },
    ],
  },
  trouble_value: {
    id: "trouble_value",
    text: null,
    type: "value",
    next: "cta",
  },
  cta: {
    id: "cta",
    text: "あなた専用の提案を作成できます👇\n\n・おすすめ物件\n・資金計画\n・注意点\n\n👉 無料で確認しますか？",
    choices: [
      { label: "✅ はい、確認したい！", next: "register" },
      { label: "🤔 まだ考えたい", next: "later" },
    ],
  },
  register: {
    id: "register",
    type: "register",
    text: "続きは無料会員登録で確認できます👇\n※営業連絡は一切ありません",
  },
  later: {
    id: "later",
    text: "わかりました😊\nいつでもご相談ください！\n\nLINEでも気軽に相談できます👇",
    type: "line_only",
  },
};

// 動的価値提供メッセージ
function getValueText(tags, category) {
  const tagStr = tags.join("・");
  if (category === "buy_value") {
    return `ありがとうございます😊\n\n「${tagStr}」のお悩みですね。\n\nあなたの場合は"失敗しやすいパターン"に入る可能性があります。\n\nただ安心してください。\n今の条件なら"最適な選択肢"を出せます。`;
  }
  if (category === "sell_value") {
    return `ありがとうございます😊\n\n「${tagStr}」のお悩みですね。\n\n今の市場状況なら、適切な戦略を取ることで希望条件での売却も可能です。\n\n一緒に最適な方法を見つけましょう！`;
  }
  if (category === "invest_value") {
    return `ありがとうございます😊\n\n「${tagStr}」の段階ですね。\n\n不動産投資は情報と戦略が全てです。\n今の状況に合わせた最適な選択肢をご提案できます。`;
  }
  if (category === "reform_value") {
    return `ありがとうございます😊\n\n「${tagStr}」のご状況ですね。\n\nリフォームは業者選びと予算設定が重要です。\n信頼できる業者をご紹介できます。`;
  }
  return `ありがとうございます😊\n\n「${tagStr}」のお悩みですね。\n\n専門家と連携して、最適な解決策をご提案できます。`;
}

// ============================================================
// AIチャットUI（LINE風）
// ============================================================
function AIChatFlow({ onNavigate }) {
  const [messages, setMessages] = useState([]);
  const [currentNode, setCurrentNode] = useState("start");
  const [tags, setTags] = useState([]);
  const [category, setCategory] = useState(null);
  const [freeInput, setFreeInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [totalSteps] = useState(4);
  const [currentStep, setCurrentStep] = useState(1);
  const endRef = useRef(null);

  useEffect(() => {
    // 最初のメッセージを表示
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
        setMessages((prev) => [...prev, { role: "ai", text }]);
      }, delay);
    } else {
      setMessages((prev) => [...prev, { role: "ai", text }]);
    }
  };

  const addUserMessage = (text) => {
    setMessages((prev) => [...prev, { role: "user", text }]);
  };

  const handleChoice = (choice) => {
    addUserMessage(choice.label);
    if (choice.tag) setTags((prev) => [...prev, choice.tag]);

    const nextId = choice.next;
    const nextNode = FLOW[nextId];
    if (!nextNode) return;

    setCurrentStep((s) => Math.min(s + 1, totalSteps));

    if (nextNode.type === "value") {
      const cat = nextId;
      setCategory(cat);
      const valueText = getValueText(
        choice.tag ? [...tags, choice.tag] : tags,
        cat
      );
      setCurrentNode(nextId);
      addAIMessage(valueText, 800);
      // 自動で次のノード（cta）へ
      setTimeout(() => {
        setCurrentNode("cta");
        addAIMessage(FLOW.cta.text, 1600);
        setCurrentStep(4);
      }, 2400);
      return;
    }

    setCurrentNode(nextId);
    if (nextNode.text) {
      addAIMessage(nextNode.text, 700);
    }
  };

  const handleFreeInput = () => {
    if (!freeInput.trim()) return;
    const node = FLOW[currentNode];
    addUserMessage(freeInput);
    setFreeInput("");
    setTags((prev) => [...prev, freeInput]);
    if (node.next) {
      const nextNode = FLOW[node.next];
      setCurrentNode(node.next);
      setCurrentStep((s) => Math.min(s + 1, totalSteps));
      if (nextNode.text) addAIMessage(nextNode.text, 700);
    }
  };

  const handleReset = () => {
    setMessages([]);
    setCurrentNode("start");
    setTags([]);
    setCategory(null);
    setFreeInput("");
    setCurrentStep(1);
    setTimeout(() => addAIMessage(FLOW.start.text), 100);
  };

  const node = FLOW[currentNode];

  return (
    <div style={{
      background: C.card,
      borderRadius: 24,
      boxShadow: "0 12px 40px rgba(0,0,0,0.08)",
      maxWidth: 520,
      margin: "0 auto",
      width: "100%",
      boxSizing: "border-box",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
    }}>
      {/* ヘッダー */}
      <div style={{
        background: C.navy,
        padding: "14px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: C.gold, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🏠</div>
          <div>
            <p style={{ color: "#fff", fontSize: 14, fontWeight: 700, margin: 0, fontFamily: "'Noto Sans JP', sans-serif" }}>不動産AIコンシェルジュ</p>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 11, margin: 0, fontFamily: "'Noto Sans JP', sans-serif" }}>● オンライン</p>
          </div>
        </div>
        {/* 進捗バー */}
        <div style={{ textAlign: "right" }}>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 11, margin: "0 0 4px", fontFamily: "'Noto Sans JP', sans-serif" }}>
            あと{Math.max(0, totalSteps - currentStep)}問
          </p>
          <div style={{ display: "flex", gap: 4 }}>
            {[1, 2, 3, 4].map((s) => (
              <div key={s} style={{ width: 20, height: 4, borderRadius: 2, background: currentStep >= s ? C.gold : "rgba(255,255,255,0.25)", transition: "background 0.3s" }} />
            ))}
          </div>
        </div>
      </div>

      {/* メッセージエリア */}
      <div style={{
        flex: 1,
        padding: "16px",
        background: "#F0F4F8",
        minHeight: 320,
        maxHeight: 400,
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
            {m.role === "ai" && (
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: C.navy, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, marginRight: 8, flexShrink: 0 }}>🏠</div>
            )}
            <div style={{
              maxWidth: "78%",
              background: m.role === "ai" ? "#fff" : C.navy,
              color: m.role === "ai" ? C.title : "#fff",
              borderRadius: m.role === "ai" ? "4px 16px 16px 16px" : "16px 4px 16px 16px",
              padding: "10px 14px",
              fontSize: 13,
              lineHeight: 1.7,
              fontFamily: "'Noto Sans JP', sans-serif",
              whiteSpace: "pre-wrap",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            }}>
              {m.text}
            </div>
          </div>
        ))}

        {/* タイピングインジケーター */}
        {isTyping && (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: C.navy, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🏠</div>
            <div style={{ background: "#fff", borderRadius: "4px 16px 16px 16px", padding: "10px 16px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
              <style>{`@keyframes dot { 0%,80%,100%{opacity:.3;transform:translateY(0)} 40%{opacity:1;transform:translateY(-3px)} }`}</style>
              {[0, 1, 2].map((i) => (
                <span key={i} style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: C.desc, margin: "0 2px", animation: `dot 1.1s infinite`, animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* 選択肢・入力エリア */}
      <div style={{ padding: "14px 16px", background: "#fff", borderTop: `1px solid ${C.border}` }}>

        {/* 通常の選択肢 */}
        {!isTyping && node && node.choices && currentNode !== "cta" && currentNode !== "register" && currentNode !== "later" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {node.choices.map((c, i) => (
              <button key={i} onClick={() => handleChoice(c)} style={{
                background: "#fff",
                border: `2px solid ${C.border}`,
                borderRadius: 12,
                padding: "12px 16px",
                fontSize: 14,
                fontWeight: 600,
                color: C.title,
                cursor: "pointer",
                textAlign: "left",
                fontFamily: "'Noto Sans JP', sans-serif",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.blue; e.currentTarget.style.background = C.blueBg; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = "#fff"; }}
              >
                {c.label}
              </button>
            ))}
          </div>
        )}

        {/* 自由入力 */}
        {!isTyping && node && node.freeInput && (
          <div style={{ display: "flex", gap: 8 }}>
            <input
              value={freeInput}
              onChange={(e) => setFreeInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleFreeInput()}
              placeholder={node.freeInputPlaceholder || "入力してください"}
              style={{
                flex: 1, border: `2px solid ${C.border}`, borderRadius: 12,
                padding: "12px 14px", fontSize: 14, outline: "none",
                fontFamily: "'Noto Sans JP', sans-serif", color: C.title,
              }}
            />
            <button onClick={handleFreeInput} style={{
              background: C.navy, color: "#fff", border: "none",
              borderRadius: 12, padding: "12px 20px", fontSize: 14,
              fontWeight: 700, cursor: "pointer", fontFamily: "'Noto Sans JP', sans-serif",
            }}>送信</button>
          </div>
        )}

        {/* CTA選択肢 */}
        {!isTyping && currentNode === "cta" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {FLOW.cta.choices.map((c, i) => (
              <button key={i} onClick={() => handleChoice(c)} style={{
                background: i === 0 ? C.navy : "#fff",
                color: i === 0 ? "#fff" : C.desc,
                border: `2px solid ${i === 0 ? C.navy : C.border}`,
                borderRadius: 12, padding: "14px 16px",
                fontSize: 14, fontWeight: 700, cursor: "pointer",
                fontFamily: "'Noto Sans JP', sans-serif",
              }}>
                {c.label}
              </button>
            ))}
          </div>
        )}

        {/* 登録誘導 */}
        {!isTyping && currentNode === "register" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <button onClick={() => onNavigate("member")} style={{
              background: C.navy, color: "#fff", border: "none",
              borderRadius: 12, padding: "16px", fontSize: 15,
              fontWeight: 700, cursor: "pointer", fontFamily: "'Noto Sans JP', sans-serif",
            }}>
              👤 無料会員登録はこちら
            </button>
            <a href={LINE_URL} target="_blank" rel="noopener noreferrer" style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              background: C.green, color: "#fff", border: "none",
              borderRadius: 12, padding: "14px", fontSize: 14,
              fontWeight: 700, textDecoration: "none", fontFamily: "'Noto Sans JP', sans-serif",
            }}>
              <svg width="18" height="18" viewBox="0 0 40 40" fill="none"><path d="M20 4C11.163 4 4 10.268 4 17.994c0 6.993 6.2 12.848 14.594 13.808.568.122 1.341.374 1.537.859.176.44.115 1.13.056 1.576l-.249 1.492c-.076.44-.351 1.723 1.51.939 1.861-.784 10.042-5.914 13.7-10.125C37.175 23.658 38 20.93 38 17.994 38 10.268 28.837 4 20 4z" fill="white"/></svg>
              LINEで相談する
            </a>
            <p style={{ fontSize: 11, color: "#888", textAlign: "center", margin: 0, fontFamily: "'Noto Sans JP', sans-serif" }}>※営業は一切ありません</p>
            <button onClick={handleReset} style={{ background: "none", border: "none", color: C.desc, fontSize: 12, cursor: "pointer", textDecoration: "underline", fontFamily: "'Noto Sans JP', sans-serif" }}>
              最初からやり直す
            </button>
          </div>
        )}

        {/* LINE誘導のみ */}
        {!isTyping && currentNode === "later" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <a href={LINE_URL} target="_blank" rel="noopener noreferrer" style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              background: C.green, color: "#fff", border: "none",
              borderRadius: 12, padding: "14px", fontSize: 14,
              fontWeight: 700, textDecoration: "none", fontFamily: "'Noto Sans JP', sans-serif",
            }}>
              <svg width="18" height="18" viewBox="0 0 40 40" fill="none"><path d="M20 4C11.163 4 4 10.268 4 17.994c0 6.993 6.2 12.848 14.594 13.808.568.122 1.341.374 1.537.859.176.44.115 1.13.056 1.576l-.249 1.492c-.076.44-.351 1.723 1.51.939 1.861-.784 10.042-5.914 13.7-10.125C37.175 23.658 38 20.93 38 17.994 38 10.268 28.837 4 20 4z" fill="white"/></svg>
              LINEでいつでも相談する
            </a>
            <button onClick={handleReset} style={{ background: "none", border: "none", color: C.desc, fontSize: 12, cursor: "pointer", textDecoration: "underline", fontFamily: "'Noto Sans JP', sans-serif" }}>
              最初からやり直す
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// ファーストビュー（トップ）
// ============================================================
function HeroSection({ onStartChat }) {
  const CATEGORIES = [
    { icon: "🏠", label: "家を買いたい" },
    { icon: "🏷️", label: "売りたい" },
    { icon: "💰", label: "投資したい" },
    { icon: "🔨", label: "リフォームしたい" },
    { icon: "😟", label: "悩みがある" },
  ];

  return (
    <div style={{ textAlign: "center", padding: "32px 20px 24px", maxWidth: 560, margin: "0 auto" }}>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;600;700&family=Noto+Serif+JP:wght@400;700&display=swap" rel="stylesheet" />
      <p style={{ fontSize: 12, fontWeight: 700, color: C.gold, letterSpacing: 2, marginBottom: 10, fontFamily: "'Noto Sans JP', sans-serif" }}>
        AI CONCIERGE
      </p>
      <h1 style={{ fontSize: 26, fontWeight: 700, color: C.title, fontFamily: "'Noto Serif JP', serif", lineHeight: 1.4, marginBottom: 10 }}>
        あなたの不動産の悩み、<br />30秒で解決します
      </h1>
      <p style={{ fontSize: 14, color: C.desc, fontFamily: "'Noto Sans JP', sans-serif", marginBottom: 28, lineHeight: 1.7 }}>
        AIがあなたに最適な選択肢を提案します
      </p>

      {/* カード型カテゴリ選択 */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center", marginBottom: 24 }}>
        {CATEGORIES.map((cat) => (
          <button key={cat.label} onClick={onStartChat} style={{
            background: "#fff",
            border: `2px solid ${C.border}`,
            borderRadius: 14,
            padding: "14px 18px",
            fontSize: 13,
            fontWeight: 600,
            color: C.title,
            cursor: "pointer",
            fontFamily: "'Noto Sans JP', sans-serif",
            display: "flex", alignItems: "center", gap: 6,
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.blue; e.currentTarget.style.background = C.blueBg; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = "#fff"; }}
          >
            <span style={{ fontSize: 18 }}>{cat.icon}</span>
            {cat.label}
          </button>
        ))}
      </div>

      {/* メインCTAボタン */}
      <button onClick={onStartChat} style={{
        background: C.navy,
        color: "#fff",
        border: "none",
        borderRadius: 50,
        padding: "16px 40px",
        fontSize: 16,
        fontWeight: 700,
        cursor: "pointer",
        fontFamily: "'Noto Sans JP', sans-serif",
        boxShadow: `0 4px 20px rgba(26,58,92,0.3)`,
        display: "flex", alignItems: "center", gap: 8,
        margin: "0 auto",
        transition: "all 0.2s",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.03)"; e.currentTarget.style.boxShadow = "0 6px 28px rgba(26,58,92,0.4)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(26,58,92,0.3)"; }}
      >
        ▶ 無料で相談する（AI起動）
      </button>
      <p style={{ fontSize: 11, color: "#aaa", marginTop: 10, fontFamily: "'Noto Sans JP', sans-serif" }}>
        ※営業は一切ありません
      </p>
    </div>
  );
}

// ============================================================
// 裏導線（小さく）
// ============================================================
function SubLinks({ onNavigate }) {
  return (
    <div style={{ display: "flex", justifyContent: "center", gap: 20, padding: "12px 0 20px", flexWrap: "wrap" }}>
      {[
        { label: "業者の方はこちら", tab: "agency" },
        { label: "専門家の方はこちら", tab: "expert" },
        { label: "物件を見る", tab: "properties" },
        { label: "コミュニティ", tab: "community" },
      ].map((l) => (
        <button key={l.label} onClick={() => onNavigate(l.tab)} style={{
          background: "none", border: "none", color: "#aaa",
          fontSize: 12, cursor: "pointer",
          fontFamily: "'Noto Sans JP', sans-serif",
          textDecoration: "underline",
        }}>
          {l.label}
        </button>
      ))}
    </div>
  );
}

// ============================================================
// TickerBanner（ミニ）
// ============================================================
const TICKER_ITEMS = [
  "🏠 INFO：新着物件が更新されました",
  "🤝 提携：専門家ネットワーク拡大中",
  "✨ NEW：AI査定サービス開始",
  "📰 INFO：空き家対策セミナー開催予定",
  "🔑 NEW：会員限定物件を公開中",
];

function MiniTicker() {
  const text = TICKER_ITEMS.join("　　●　　");
  return (
    <div style={{ background: "#fffbe6", borderBottom: "1px solid #f0d060", overflow: "hidden", padding: "6px 0" }}>
      <style>{`@keyframes ticker2 { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }`}</style>
      <div style={{ display: "inline-flex", whiteSpace: "nowrap", animation: "ticker2 24s linear infinite" }}>
        {[0, 1].map((i) => (
          <span key={i} style={{ fontSize: 11, color: "#92400e", paddingRight: 60, fontFamily: "'Noto Sans JP', sans-serif" }}>{text}</span>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// 固定底部ボタン
// ============================================================
function FixedCTA({ onStartChat }) {
  return (
    <div style={{ position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)", zIndex: 1000 }}>
      <button onClick={onStartChat} style={{
        background: C.green, color: "#fff", border: "none",
        borderRadius: 50, padding: "14px 32px",
        fontSize: 15, fontWeight: 700, cursor: "pointer",
        fontFamily: "'Noto Sans JP', sans-serif",
        boxShadow: "0 4px 20px rgba(6,199,85,0.45)",
        whiteSpace: "nowrap", transition: "all 0.2s",
        display: "flex", alignItems: "center", gap: 8,
      }}
      onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.04)"}
      onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
      >
        🏠 無料診断する（30秒）
      </button>
    </div>
  );
}

// ============================================================
// HomeScreen — メインエクスポート
// ============================================================
export default function HomeScreen({ onNavigate }) {
  const navigate = onNavigate || (() => {});
  const [showChat, setShowChat] = useState(false);
  const chatRef = useRef(null);

  const handleStartChat = () => {
    setShowChat(true);
    setTimeout(() => {
      chatRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Noto Sans JP', sans-serif", paddingBottom: 80 }}>
      <MiniTicker />

      {/* ファーストビュー */}
      {!showChat && <HeroSection onStartChat={handleStartChat} />}

      {/* AIチャット */}
      <div ref={chatRef} style={{ padding: showChat ? "20px 16px" : "0 16px" }}>
        {showChat && <AIChatFlow onNavigate={navigate} />}
      </div>

      {/* チャット起動前はコミュニティ誘導 */}
      {!showChat && (
        <div style={{ maxWidth: 520, margin: "0 auto", padding: "0 16px" }}>
          <div
            onClick={() => navigate("community")}
            style={{
              background: "#fdf6e8", border: `1px solid #e8dfc8`,
              borderRadius: 14, padding: "14px 20px", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}
          >
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: C.title, fontFamily: "'Noto Sans JP', sans-serif", marginBottom: 3 }}>
                👥 同じ悩みの人の事例はこちら
              </p>
              <p style={{ fontSize: 12, color: C.desc, fontFamily: "'Noto Sans JP', sans-serif" }}>
                コミュニティで体験談・質問を確認
              </p>
            </div>
            <span style={{ background: C.gold, color: "#fff", fontSize: 12, fontWeight: 700, padding: "5px 14px", borderRadius: 20, fontFamily: "'Noto Sans JP', sans-serif", flexShrink: 0 }}>
              見る
            </span>
          </div>
        </div>
      )}

      {/* 裏導線 */}
      <SubLinks onNavigate={navigate} />

      {/* 固定底部ボタン */}
      <FixedCTA onStartChat={handleStartChat} />
    </div>
  );
}
