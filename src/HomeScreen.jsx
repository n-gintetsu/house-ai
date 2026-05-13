import { useState, useEffect, useRef } from "react";
import { AffiliateCard } from './AffiliateCard';
import { supabase } from "./lib/supabase";
import { trackEvent } from './lib/analytics';

// ============================================================
// HomeScreen.jsx — CV最大化版 + 会員登録ロック機能
// 心理導線：AI興味 → 共感 → ロック → 登録 → 即価値
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
    text: "こんにちは！House-AIです😊\n30秒であなたに最適な解決方法をご提案します。\n\nどんなご相談ですか？",
    choices: [
      { label: "🏠 購入したい", next: "buy_type" },
      { label: "🏠 借りたい（賃貸）", next: "rent_worry" },
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
  rent_worry: {
    text: "賃貸でどんなことが気になりますか？👇",
    choices: [
      { label: "💰 家賃・予算が不安", next: "value", tag: "家賃不安" },
      { label: "📍 エリア・駅近で探したい", next: "rent_area", tag: "エリア重視" },
      { label: "🏠 間取り・設備にこだわりたい", next: "value", tag: "設備重視" },
      { label: "⏰ 入居時期が決まっている", next: "value", tag: "急ぎ" },
    ],
  },
  rent_area: {
    text: "ご希望のエリアはどちらですか？",
    freeInput: true,
    freeInputPlaceholder: "例：大宮駅周辺、さいたま市など",
    next: "value",
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
  value: { type: "value", next: "lock" },
  lock: { type: "lock" },
};

function getValueText(tags) {
  const tagStr = tags.join("・");
  return `ありがとうございます😊\n\n「${tagStr}」のお悩みですね。\n\nあなたの状況だと、情報不足のまま進むと損するケースが多いです。\n\nあなた専用の"具体的な進め方"を出せます。`;
}

function getResultContent(tags) {
  const tag = tags[0] || "不動産";
  return {
    title: `あなた専用の提案が完成しました`,
    steps: [
      { icon: "✅", text: `「${tag}」に最適な進め方：まず資金計画から始めましょう` },
      { icon: "⚠️", text: "注意点：焦って決めると後悔するケースが多いです" },
      { icon: "🎯", text: "おすすめ行動：AIと一緒に条件を整理してから動く" },
    ],
  };
}

// ============================================================
// シンプル登録フォーム
// ============================================================
function RegisterModal({ onSuccess, onClose, tags }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async () => {
    if (!email || !password) { setError("メールとパスワードを入力してください"); return; }
    if (password.length < 6) { setError("パスワードは6文字以上"); return; }
    setLoading(true);
    setError("");
    try {
      const { data, error: err } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { user_type: "general" } },
      });
      if (err) throw err;
      onSuccess(data.user);
    } catch (e) {
      setError("登録に失敗しました。もう一度お試しください。");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) { setError("メールとパスワードを入力してください"); return; }
    setLoading(true);
    setError("");
    try {
      const { data, error: err } = await supabase.auth.signInWithPassword({ email, password });
      if (err) throw err;
      onSuccess(data.user);
    } catch (e) {
      setError("ログインに失敗しました。");
    } finally {
      setLoading(false);
    }
  };

  const [isLogin, setIsLogin] = useState(false);

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ background: "#fff", borderRadius: 20, padding: "32px 28px", maxWidth: 400, width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🔓</div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: C.title, fontFamily: "'Noto Serif JP', serif", margin: "0 0 6px", lineHeight: 1.4 }}>
            ここから先はあなた専用の提案です
          </h2>
          <p style={{ fontSize: 13, color: C.desc, fontFamily: "'Noto Sans JP', sans-serif", lineHeight: 1.6 }}>
            無料登録で続きが見れます<br />
            <strong style={{ color: C.red }}>※営業連絡は一切ありません</strong>
          </p>
        </div>

        <div style={{ background: C.blueBg, borderRadius: 10, padding: "10px 14px", marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 16 }}>🎁</span>
          <p style={{ fontSize: 12, color: C.blue, fontFamily: "'Noto Sans JP', sans-serif", margin: 0, fontWeight: 600 }}>
            登録後すぐ → あなた専用の提案が届きます
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
          <input
            type="email"
            placeholder="メールアドレス"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ border: `1.5px solid ${C.border}`, borderRadius: 10, padding: "12px 14px", fontSize: 14, outline: "none", fontFamily: "'Noto Sans JP', sans-serif", color: C.title }}
          />
          <input
            type="password"
            placeholder="パスワード（6文字以上）"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (isLogin ? handleLogin() : handleRegister())}
            style={{ border: `1.5px solid ${C.border}`, borderRadius: 10, padding: "12px 14px", fontSize: 14, outline: "none", fontFamily: "'Noto Sans JP', sans-serif", color: C.title }}
          />
        </div>

        {error && <p style={{ fontSize: 12, color: C.red, margin: "0 0 10px", fontFamily: "'Noto Sans JP', sans-serif" }}>{error}</p>}

        <button
          onClick={isLogin ? handleLogin : handleRegister}
          disabled={loading}
          style={{ width: "100%", background: C.navy, color: "#fff", border: "none", borderRadius: 12, padding: "14px", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "'Noto Sans JP', sans-serif", marginBottom: 10, opacity: loading ? 0.7 : 1 }}
        >
          {loading ? "処理中..." : isLogin ? "ログインして続きを見る" : "30秒で無料登録 →"}
        </button>

        <div style={{ textAlign: "center", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button onClick={() => setIsLogin(!isLogin)} style={{ background: "none", border: "none", color: C.blue, fontSize: 12, cursor: "pointer", fontFamily: "'Noto Sans JP', sans-serif", textDecoration: "underline" }}>
            {isLogin ? "新規登録はこちら" : "すでに登録済みの方"}
          </button>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#bbb", fontSize: 12, cursor: "pointer", fontFamily: "'Noto Sans JP', sans-serif" }}>
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// 登録後の即価値提供 + AI業者マッチング
// ============================================================

function getMatchReason(tags) {
  const t = tags.join("・");
  return `「${t}」の状況に最も合致した業者です`;
}

function getMatchedVendors(tags) {
  const isRent = tags.some(t => ["家賃不安","エリア重視","設備重視","急ぎ"].includes(t))
  const isInvest = tags.some(t => ["初心者","経験者","利回り改善","物件探し中"].includes(t));
  const isReform = tags.some(t => ["購入前","現居","費用確認","業者探し"].includes(t));

  if (isRent) return [
    { name: "〇〇賃貸サポート", desc: "賃貸物件探し・条件整理の専門家", plan: "premium", reason: getMatchReason(tags) },
    { name: "△△不動産エージェント", desc: "エリア密着の賃貸専門店", plan: "standard", reason: null },
  ]
  if (isInvest) return [
    { name: "〇〇不動産投資コンサル", desc: "投資物件・収益分析の専門家", plan: "premium", reason: getMatchReason(tags) },
    { name: "△△資産運用アドバイザー", desc: "ローン・資金計画の相談", plan: "standard", reason: null },
  ];
  if (isReform) return [
    { name: "〇〇リフォーム専門店", desc: "リフォーム・外構の実績多数", plan: "premium", reason: getMatchReason(tags) },
    { name: "△△建築デザイン事務所", desc: "住まいのトータルサポート", plan: "standard", reason: null },
  ];
  return [
    { name: "〇〇不動産コンサルティング", desc: "住宅購入・資金計画の専門家", plan: "premium", reason: getMatchReason(tags) },
    { name: "△△住宅ローンアドバイザー", desc: "ローン・資金計画の相談", plan: "standard", reason: null },
  ];
}

function PostRegisterValue({ tags, onNavigate }) {
  const result = getResultContent(tags);
  const vendors = getMatchedVendors(tags);

  return (
    <div style={{ background: C.card, borderRadius: 20, padding: "28px", boxShadow: "0 8px 32px rgba(0,0,0,0.08)" }}>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <div style={{ fontSize: 40, marginBottom: 8 }}>🎉</div>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: C.title, fontFamily: "'Noto Serif JP', serif", margin: "0 0 6px" }}>
          {result.title}
        </h2>
        <p style={{ fontSize: 12, color: C.green, fontWeight: 700, fontFamily: "'Noto Sans JP', sans-serif" }}>
          登録完了！あなた専用の内容です
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
        {result.steps.map((s, i) => (
          <div key={i} style={{ background: C.bg, borderRadius: 12, padding: "12px 14px", display: "flex", alignItems: "flex-start", gap: 10 }}>
            <span style={{ fontSize: 16, flexShrink: 0 }}>{s.icon}</span>
            <p style={{ fontSize: 13, color: C.title, fontFamily: "'Noto Sans JP', sans-serif", margin: 0, lineHeight: 1.7 }}>{s.text}</p>
          </div>
        ))}
      </div>

      <div style={{ borderTop: `0.5px solid ${C.border}`, paddingTop: 16, marginBottom: 16 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: C.title, fontFamily: "'Noto Sans JP', sans-serif", margin: "0 0 12px", display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 14 }}>🤖</span> あなたの状況に合った業者をAIが提案
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {vendors.map((v, i) => (
            <div key={i} style={{
              border: `1.5px solid ${v.plan === "premium" ? C.gold : C.border}`,
              borderRadius: 12,
              padding: "14px",
              background: C.card,
              position: "relative",
            }}>
              {i === 0 && (
                <div style={{ position: "absolute", top: -9, left: 12, background: "#06C755", color: "#fff", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 10 }}>
                  🤖 AIおすすめ No.1
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: C.title, fontFamily: "'Noto Sans JP', sans-serif", margin: "0 0 2px" }}>{v.name}</p>
                  <p style={{ fontSize: 11, color: v.plan === "premium" ? "#854F0B" : C.desc, fontFamily: "'Noto Sans JP', sans-serif", margin: 0 }}>{v.desc}</p>
                </div>
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 10, whiteSpace: "nowrap", marginLeft: 8,
                  background: v.plan === "premium" ? "#FFF9E6" : "#EAF1FF",
                  color: v.plan === "premium" ? "#854F0B" : "#185FA5",
                  border: `1px solid ${v.plan === "premium" ? C.gold : C.blue}`,
                }}>
                  {v.plan === "premium" ? "👑 プレミアム" : "⭐ スタンダード"}
                </span>
              </div>

              {v.reason && (
                <div style={{ background: "#E6F1FB", borderRadius: 6, padding: "6px 10px", marginBottom: 8 }}>
                  <p style={{ fontSize: 11, color: "#0C447C", fontWeight: 600, fontFamily: "'Noto Sans JP', sans-serif", margin: 0 }}>
                    推薦理由：{v.reason}
                  </p>
                </div>
              )}

              {v.plan === "premium" && (
                <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                  <span style={{ fontSize: 10, background: "#EAF3DE", color: "#27500A", padding: "2px 7px", borderRadius: 6, fontWeight: 600 }}>⭐ 評価 4.8</span>
                  <span style={{ fontSize: 10, background: "#EAF1FF", color: "#0C447C", padding: "2px 7px", borderRadius: 6, fontWeight: 600 }}>📊 成約実績多数</span>
                </div>
              )}

              <button
                onClick={() => onNavigate("vendors")}
                style={{
                  width: "100%",
                  background: v.plan === "premium" ? C.gold : C.navy,
                  color: v.plan === "premium" ? C.navy : "#fff",
                  border: "none", borderRadius: 8, padding: "10px",
                  fontSize: 13, fontWeight: 700, cursor: "pointer",
                  fontFamily: "'Noto Sans JP', sans-serif",
                }}
              >
                {v.plan === "premium" ? "👑 優先的に問い合わせる" : "問い合わせる"}
              </button>
            </div>
          ))}
        </div>
      </div>

      <p style={{ fontSize: 12, fontWeight: 700, color: C.navy, textAlign: "center", fontFamily: "'Noto Sans JP', sans-serif", marginBottom: 10 }}>
        このまま進めると失敗しません👇
      </p>
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={() => onNavigate("chat")} style={{ flex: 1, background: C.navy, color: "#fff", border: "none", borderRadius: 12, padding: "12px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Noto Sans JP', sans-serif" }}>
          💬 AIで続きを相談
        </button>
        <button onClick={() => onNavigate("sell")} style={{ flex: 1, background: "#fff", color: C.navy, border: `1.5px solid ${C.border}`, borderRadius: 12, padding: "12px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Noto Sans JP', sans-serif" }}>
          🏷️ 無料査定
        </button>
      </div>
    </div>
  );
}

// ============================================================
// AIChatFlow（3ターン後ロック機能付き）
// ============================================================
function AIChatFlow({ onNavigate, onRegisterSuccess, user, initialTag }) {
  const [messages, setMessages] = useState([]);
  const [currentNode, setCurrentNode] = useState("start");
  const [tags, setTags] = useState([]);
  const [freeInput, setFreeInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [step, setStep] = useState(1);
  const [turnCount, setTurnCount] = useState(0);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [registered, setRegistered] = useState(!!user);
  const [showValue, setShowValue] = useState(false);
  const [savedTags, setSavedTags] = useState([]);
  const endRef = useRef(null);

  useEffect(() => { addAIMessage(FLOW.start.text); if (initialTag) setTags([initialTag]); }, []);
  useEffect(() => { if (endRef.current) { const el = endRef.current; const parent = el.parentElement; if (parent) parent.scrollTop = parent.scrollHeight; } }, [messages, isTyping]);

  const addAIMessage = (text, delay = 0) => {
    if (delay > 0) {
      setIsTyping(true);
      setTimeout(() => { setIsTyping(false); setMessages((p) => [...p, { role: "ai", text }]); }, delay);
    } else {
      setMessages((p) => [...p, { role: "ai", text }]);
    }
  };

  const handleChoice = (choice) => {
    setMessages((p) => [...p, { role: "user", text: choice.label }]);
    if (choice.tag) setTags((p) => [...p, choice.tag]);
    const newTurn = turnCount + 1;
    setTurnCount(newTurn);
    setStep((s) => Math.min(s + 1, 4));
    const nextId = choice.next;
    const nextNode = FLOW[nextId];
    if (!nextNode) return;

    if (nextNode.type === "value") {
      const currentTags = choice.tag ? [...tags, choice.tag] : tags;
      setSavedTags(currentTags);
      setCurrentNode(nextId);
      addAIMessage(getValueText(currentTags), 800);
      setTimeout(() => {
        setCurrentNode("lock");
        setStep(4);
      }, 2000);
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
    setSavedTags((p) => [...p, freeInput]);
    setFreeInput("");
    setTurnCount((t) => t + 1);
    if (node.next) {
      const nextNode = FLOW[node.next];
      setCurrentNode(node.next);
      setStep((s) => Math.min(s + 1, 4));
      if (nextNode.text) addAIMessage(nextNode.text, 700);
    }
  };

  const handleRegisterSuccess = (u) => {
    setShowRegisterModal(false);
    setRegistered(true);
    setShowValue(true);
    onRegisterSuccess && onRegisterSuccess(u);
  };

  const node = FLOW[currentNode];

  if (showValue) {
    return <PostRegisterValue tags={savedTags} onNavigate={onNavigate} />;
  }

  return (
    <>
      {showRegisterModal && (
        <RegisterModal
          tags={savedTags}
          onSuccess={handleRegisterSuccess}
          onClose={() => setShowRegisterModal(false)}
        />
      )}

      <div style={{ background: C.card, borderRadius: 20, boxShadow: "0 8px 32px rgba(0,0,0,0.08)", overflow: "hidden" }}>
        {/* ヘッダー */}
        <div style={{ background: C.navy, padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 30, height: 30, borderRadius: "50%", background: C.gold, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🏠</div>
            <div>
              <p style={{ color: "#fff", fontSize: 12, fontWeight: 700, margin: 0, fontFamily: "'Noto Sans JP', sans-serif" }}>House-AI</p>
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
        <div style={{ padding: "12px", background: "#F0F4F8", height: 360, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
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

          {/* 通常選択肢 */}
          {!isTyping && node?.choices && !["lock"].includes(currentNode) && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {node.choices.map((c, i) => (
                <button key={i} onClick={() => handleChoice(c)}
                  style={{ background: "#fff", border: `1.5px solid ${C.border}`, borderRadius: 10, padding: "10px 14px", fontSize: 13, fontWeight: 600, color: C.title, cursor: "pointer", textAlign: "left", fontFamily: "'Noto Sans JP', sans-serif", transition: "all 0.15s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.blue; e.currentTarget.style.background = C.blueBg; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = "#fff"; }}
                >{c.label}</button>
              ))}
            </div>
          )}

          {/* 自由入力 */}
          {!isTyping && node?.freeInput && (
            <div style={{ display: "flex", gap: 6 }}>
              <input value={freeInput} onChange={(e) => setFreeInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleFreeInput()} placeholder={node.freeInputPlaceholder}
                style={{ flex: 1, minWidth: 0, border: `1.5px solid ${C.border}`, borderRadius: 10, padding: "10px 12px", fontSize: 16, outline: "none", fontFamily: "'Noto Sans JP', sans-serif", color: C.title }} />
              <button onClick={handleFreeInput} style={{ background: C.navy, color: "#fff", border: "none", borderRadius: 10, padding: "10px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Noto Sans JP', sans-serif", flexShrink: 0 }}>送信</button>
            </div>
          )}

          {/* ロック画面 */}
          {!isTyping && currentNode === "lock" && (
            <div style={{ textAlign: "center", padding: "8px 0" }}>
              <div style={{ background: C.bg, borderRadius: 12, padding: "14px", marginBottom: 12, border: `1.5px dashed ${C.border}` }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: C.title, fontFamily: "'Noto Sans JP', sans-serif", margin: "0 0 4px" }}>
                  🔒 ここから先はあなた専用の提案です
                </p>
                <p style={{ fontSize: 11, color: C.desc, fontFamily: "'Noto Sans JP', sans-serif", margin: 0 }}>
                  続きは保存されません。無料登録で確認できます。
                </p>
              </div>
              {registered ? (
                <button onClick={() => setShowValue(true)} style={{ width: "100%", background: C.navy, color: "#fff", border: "none", borderRadius: 12, padding: "14px", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "'Noto Sans JP', sans-serif" }}>
                  🎉 あなた専用の提案を見る
                </button>
              ) : (
                <>
                  <button onClick={() => setShowRegisterModal(true)} style={{ width: "100%", background: C.navy, color: "#fff", border: "none", borderRadius: 12, padding: "14px", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "'Noto Sans JP', sans-serif", marginBottom: 8 }}>
                    30秒で無料登録 → 続きを見る
                  </button>
                  <p style={{ fontSize: 11, color: "#aaa", fontFamily: "'Noto Sans JP', sans-serif", margin: 0 }}>
                    ※営業連絡は一切ありません
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ============================================================
// 左サイド：不安・失敗事例
// ============================================================
function LeftPanel({ onNavigate, onStartChat }) {
  const cases = [
    { title: "住宅購入で後悔しました", tag: "購入", desc: "営業に急かされて決めてしまった...", startTag: "失敗回避", cta: "AIで確認する" },
    { title: "リフォームで100万損しました", tag: "リフォーム", desc: "見積もりを1社しか取らなかった...", startTag: "業者探し", cta: "失敗を避ける" },
    { title: "投資物件で空室が続いています", tag: "投資", desc: "利回りだけ見て立地を軽視していた...", startTag: "初心者", cta: "リスクを診断する" },
  ];

  return (
    <div style={{ background: C.card, borderRadius: 18, padding: "20px", border: `0.5px solid ${C.border}` }}>
      <p style={{ fontSize: 14, fontWeight: 700, color: C.red, margin: "0 0 14px", fontFamily: "'Noto Sans JP', sans-serif", lineHeight: 1.5 }}>
        ⚠️ 知らないと損する<br />不動産の現実
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {cases.map((c, i) => (
          <div key={i}
            onClick={() => onStartChat && onStartChat(c.startTag)}
            style={{ background: C.redBg, borderLeft: `3px solid ${C.red}`, padding: "10px 12px", borderRadius: "0 10px 10px 0", cursor: "pointer", transition: "opacity 0.2s" }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = "0.85"}
            onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: C.red, margin: 0, fontFamily: "'Noto Sans JP', sans-serif" }}>{c.title}</p>
              <span style={{ fontSize: 9, background: "#ffd5d5", color: C.red, padding: "1px 5px", borderRadius: 3, fontWeight: 600, flexShrink: 0, marginLeft: 4 }}>{c.tag}</span>
            </div>
            <p style={{ fontSize: 10, color: "#666", margin: 0, lineHeight: 1.5, fontFamily: "'Noto Sans JP', sans-serif" }}>{c.desc}</p>
            <p style={{ fontSize: 10, color: C.blue, fontWeight: 700, margin: "4px 0 0", fontFamily: "'Noto Sans JP', sans-serif" }}>→ {c.cta}</p>
          </div>
        ))}
      </div>
      <button onClick={() => onNavigate("community")} style={{ marginTop: 14, width: "100%", background: C.navy, color: "#fff", border: "none", borderRadius: 10, padding: "10px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'Noto Sans JP', sans-serif" }}>
        体験談を見る → 失敗を避ける
      </button>
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
      <button onClick={() => onNavigate("properties")} style={{ marginTop: 12, width: "100%", background: C.bg, color: C.navy, border: `1px solid ${C.border}`, borderRadius: 10, padding: "9px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'Noto Sans JP', sans-serif" }}>
        物件一覧を見る →
      </button>
      <AffiliateCard type="insurance" reason="物件購入・賃貸時に確認を" />
    </div>
  );
}

// ============================================================
// コミュニティ導線
// ============================================================
function CommunityStrip({ onNavigate }) {
  const posts = [
    { title: "住宅購入で後悔しました", tag: "購入", tagBg: C.blueBg, tagColor: C.blue, desc: "営業に急かされて決めてしまった..." },
    { title: "リフォームで100万損しました", tag: "リフォーム", tagBg: C.redBg, tagColor: C.red, desc: "見積もりを1社しか取らなかった..." },
  ];
  return (
    <div style={{ background: C.card, borderRadius: 16, padding: "16px", border: `0.5px solid ${C.border}` }}>
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
// 固定底部CTA（スマホのみ表示）
// ============================================================

function ScrollCTA({ user, scrolled }) {
  const [visible, setVisible] = useState(true)
  const lastY = useRef(0)
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      if (y > lastY.current + 5) setVisible(false)
      else if (y < lastY.current - 5) setVisible(true)
      lastY.current = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  if (!scrolled || user) return null;
  return (
    <div style={{ position: "fixed", bottom: 64, left: 0, right: 0, padding: "8px 16px", background: "#fff", boxShadow: "0 -2px 12px rgba(0,0,0,0.15)", zIndex: 7000, display: "flex", gap: 8, transform: visible ? 'translateY(0)' : 'translateY(100%)', transition: 'transform 0.3s ease' }}>
      <button
        onClick={() => document.getElementById('ai-consult-section')?.scrollIntoView({ behavior: 'smooth' })}
        style={{ flex: 1, background: "#1a3a5c", color: "#fff", border: "none", borderRadius: 10, padding: "12px 8px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Noto Sans JP', sans-serif" }}
      >
        🤖 無料でAI相談する
      </button>
      <button
        onClick={() => window.dispatchEvent(new CustomEvent("show-auth-sheet", {}))}
        style={{ flex: 1, background: "#00a651", color: "#fff", border: "none", borderRadius: 10, padding: "12px 8px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Noto Sans JP', sans-serif" }}
      >
        ✅ 無料会員登録（簡単3ステップ）
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
  const [initialTag, setInitialTag] = useState(null);
  const [user, setUser] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const chatRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY >= 300);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) setUser(data.session.user);
    });
  }, []);

  useEffect(() => { trackEvent('page_view', { page: 'home' }); }, []);

  // レスポンシブ判定
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const handleStartChat = () => {
    setShowChat(true);
    setTimeout(() => chatRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Noto Sans JP', sans-serif", paddingBottom: 80, overflowX: "hidden" }}>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;600;700&family=Noto+Serif+JP:wght@400;700&display=swap" rel="stylesheet" />
      <MiniTicker />

      <main style={{ width: "100%", padding: "20px 0 48px" }}>
        {/* ファーストビュー */}
        <div style={{ textAlign: "center", padding: isMobile ? "24px 16px 24px" : "32px 16px 32px", maxWidth: 900, margin: "0 auto" }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: C.red, letterSpacing: 1, marginBottom: 10, fontFamily: "'Noto Sans JP', sans-serif" }}>
            ⚠️ 知らずに進むと損します
          </p>
          <h1 style={{
            fontSize: isMobile ? 22 : 28,
            fontWeight: 700,
            color: C.title,
            fontFamily: "'Noto Serif JP', serif",
            lineHeight: 1.4,
            marginBottom: 10,
            // whiteSpace: "nowrap" を削除してスマホ対応
          }}>
            あなたの不動産判断、<br style={{ display: isMobile ? "block" : "none" }} />30秒で最適化
          </h1>
          <p style={{ fontSize: isMobile ? 13 : 14, color: C.desc, fontFamily: "'Noto Sans JP', sans-serif", marginBottom: 24, lineHeight: 1.7 }}>
            営業なし・完全無料｜AIが最適な進め方を提示します
          </p>
          <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginBottom: 20 }}>
            {["🏠 家を買いたい", "🏷️ 売りたい", "💰 投資したい"].map((label) => (
              <button key={label} onClick={handleStartChat}
                style={{
                  background: "#fff",
                  border: `1.5px solid ${C.border}`,
                  borderRadius: 12,
                  padding: isMobile ? "10px 14px" : "12px 20px",
                  fontSize: isMobile ? 13 : 14,
                  fontWeight: 600,
                  color: C.title,
                  cursor: "pointer",
                  fontFamily: "'Noto Sans JP', sans-serif",
                  flex: isMobile ? "1 1 45%" : "0 0 auto",
                  maxWidth: isMobile ? "46%" : "none",
                }}
              >{label}</button>
            ))}
          </div>
        </div>

        {/* レイアウト：スマホは1カラム、PCは3カラム */}
        {isMobile ? (
          // スマホ：1カラム縦積み
          <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: "0 16px", maxWidth: 480, margin: "0 auto", width: "100%" }}>
            {/* AIチャット */}
            <div id="ai-consult-section" ref={chatRef}>
              {showChat ? (
                <AIChatFlow onNavigate={navigate} onRegisterSuccess={setUser} user={user} initialTag={initialTag} />
              ) : (
                <div
                  onClick={handleStartChat}
                  style={{
                    background: '#ff6b35',
                    border: 'none',
                    borderRadius: 16,
                    padding: '20px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 2px 12px rgba(255,107,53,0.3)',
                  }}
                >
                  <div style={{
                    fontSize: '28px',
                    fontWeight: '700',
                    letterSpacing: '2px',
                    fontFamily: 'Georgia, serif',
                    background: 'linear-gradient(90deg, #8a6820 0%, #c9a84c 30%, #f5e08a 50%, #c9a84c 70%, #8a6820 100%)',
                    backgroundSize: '200% auto',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    animation: 'goldFlow 3s linear infinite',
                    marginBottom: 8
                  }}>HOUSE-AI</div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#fff', margin: '0 0 4px', fontFamily: "'Noto Sans JP', sans-serif" }}>AIに相談してみる</p>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', margin: '0 0 14px', fontFamily: "'Noto Sans JP', sans-serif" }}>3ステップで最適な進め方を提案します</p>
                  <button style={{ background: '#fff', color: '#ff6b35', border: 'none', borderRadius: 50, padding: '10px 24px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'Noto Sans JP', sans-serif" }}>
                    💬 無料でAI相談する
                  </button>
                </div>
              )}
            </div>
            {/* 失敗事例 */}
            <LeftPanel onNavigate={navigate} onStartChat={(tag) => { setInitialTag(tag); handleStartChat(); }} />
            {/* コミュニティ */}
            <CommunityStrip onNavigate={navigate} />
            {/* 投資ドリルCTA */}
            <div style={{ background: '#FAEEDA', border: '1px solid #EF9F27', borderRadius: 16, padding: '16px' }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#633806', margin: '0 0 4px' }}>📊 投資家へのサクセスロード</p>
              <p style={{ fontSize: 12, color: '#854F0B', margin: '0 0 12px', lineHeight: 1.6 }}>楽しく学べる不動産投資術ドリルで投資力を測ろう！</p>
              <button onClick={() => navigate('drill')} style={{ width: '100%', background: '#1a3a5c', color: '#fff', border: 'none', borderRadius: 20, padding: '12px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'Noto Sans JP', sans-serif" }}>
                今すぐチャレンジ →
              </button>
            </div>
            {/* 最新情報 */}
            <RightPanel onNavigate={navigate} />
          </div>
        ) : (
          // PC：3カラム
          <div style={{ display: "grid", gridTemplateColumns: "320px 1fr 300px", gap: 0, alignItems: "start", width: "100%" }}>
            <div style={{ padding: "0 16px 0 20px" }}>
              <LeftPanel onNavigate={navigate} onStartChat={(tag) => { setInitialTag(tag); handleStartChat(); }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "0 12px" }} ref={chatRef}>
                {showChat ? <AIChatFlow onNavigate={navigate} onRegisterSuccess={setUser} user={user} initialTag={initialTag} /> : (
                  <div onClick={handleStartChat} style={{ background: "#ff6b35", border: "none", borderRadius: 16, padding: "20px", textAlign: "center", cursor: "pointer", boxShadow: "0 2px 12px rgba(255,107,53,0.3)" }}>
                    <div style={{
                      fontSize: '28px',
                      fontWeight: '700',
                      letterSpacing: '2px',
                      fontFamily: 'Georgia, serif',
                      background: 'linear-gradient(90deg, #8a6820 0%, #c9a84c 30%, #f5e08a 50%, #c9a84c 70%, #8a6820 100%)',
                      backgroundSize: '200% auto',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      animation: 'goldFlow 3s linear infinite',
                      marginBottom: 8
                    }}>HOUSE-AI</div>
                    <p style={{ fontSize: 14, fontWeight: 700, color: "#fff", margin: "0 0 4px" }}>AIに相談してみる</p>
                    <p style={{ fontSize: 12, color: "rgba(255,255,255,0.85)", margin: "0 0 14px" }}>3ステップで最適な進め方を提案します</p>
                    <button style={{ background: "#fff", color: "#ff6b35", border: "none", borderRadius: 50, padding: "10px 24px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>💬 無料でAI相談する</button>
                  </div>
                )}
              <CommunityStrip onNavigate={navigate} />
            </div>
            <div style={{ padding: "0 20px 0 16px" }}>
              <RightPanel onNavigate={navigate} />
            </div>
          </div>
        )}

        {/* 裏導線 */}
        <div style={{ padding: "32px 16px 0", textAlign: "center" }}>
          <div style={{ display: "flex", justifyContent: "center", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
            <button onClick={() => onNavigate("agency")} style={{ background: "#c9a84c", color: "#fff", border: "none", borderRadius: 50, padding: "14px 28px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Noto Sans JP', sans-serif", boxShadow: "0 4px 15px rgba(201,168,76,0.4)" }}>業者の方はこちら →</button>
            <button onClick={() => navigate("properties")} style={{ background: "#ff6b35", color: "#fff", border: "none", borderRadius: 50, padding: "14px 28px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Noto Sans JP', sans-serif", boxShadow: "0 4px 15px rgba(255,107,53,0.4)" }}>物件を見る →</button>
            <button onClick={() => navigate("community")} style={{ background: "#00a651", color: "#fff", border: "none", borderRadius: 50, padding: "14px 28px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Noto Sans JP', sans-serif", boxShadow: "0 4px 15px rgba(0,166,81,0.4)" }}>体験談を見る →</button>
          </div>
          <div style={{ background: "linear-gradient(135deg, #1a3a5c 0%, #2a5a8c 100%)", borderRadius: 16, padding: "24px 20px", maxWidth: 480, margin: "0 auto" }}>
            <p style={{ color: "#c9a84c", fontSize: 12, fontWeight: 700, margin: "0 0 4px", letterSpacing: 1 }}>🔔 営業なし・AIが相談を整理して送客</p>
            <p style={{ color: "white", fontSize: 13, margin: "0 0 16px", lineHeight: 1.6 }}>AIがユーザーの悩みを整理し、<br />専門家が必要な相談だけをお届けします</p>
            <button onClick={() => { trackEvent('expert_register_click'); navigate("expertregister"); }} style={{ background: "#c9a84c", border: "none", borderRadius: 10, padding: "14px 28px", color: "#1a3a5c", fontSize: 15, fontWeight: 800, cursor: "pointer", width: "100%", maxWidth: 360, fontFamily: "'Noto Sans JP', sans-serif", letterSpacing: 0.5 }}>無料で相談が届く｜専門家登録はこちら →</button>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 11, margin: "10px 0 0" }}>※無料掲載から始められます　※案件発生を保証するものではありません</p>
          </div>
        </div>
      </main>

      <ScrollCTA user={user} scrolled={scrolled} />
    </div>
  );
}
