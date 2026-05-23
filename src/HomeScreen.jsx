import { useState, useEffect, useRef } from "react";
import { AffiliateCard } from './AffiliateCard';
import SEOHead from './SEOHead';
import { supabase } from "./lib/supabase";
import { trackEvent } from './lib/analytics';
import { FigmaExperienceSection } from './FigmaExperienceSection';
import { FigmaNewsSection } from './FigmaNewsSection';
import { SectionTransition } from './SectionTransition';
import AIToolsSection from './AIToolsSection';
import AIPartnerSection from './AIPartnerSection';
import FleaMarketSection from './FleaMarketSection';
import './HouseAiHome.css';

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
      <SEOHead
        title="House-AI | 不動産AIコンシェルジュ"
        description="AIが不動産の悩みを整理・分析・提案。物件探し・住宅ローン相談・諸費用計算など不動産のすべてをAIがサポートします。"
        url="https://house-ai.co.jp"
      />
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
// LIVE Lounge カードデータ
// ============================================================
const liveCards = [
  { type: 'consultation', label: '相談開始',   user: '30代 / 埼玉',      title: '住宅ローンが怖いです...', body: '無理のない返済額をAIが整理中', dots: true,  meta: '3分前' },
  { type: 'ai-answer',    label: 'AI回答',     user: 'House-AI',         title: '焦って決めなくて大丈夫です', body: 'まずは月々の負担と将来の支出を一緒に整理しましょう。', dots: false, meta: '回答済み' },
  { type: 'consultation', label: '相談開始',   user: '40代 / 東京',      title: '空き家をどう活用すればいいですか？', body: '売却・賃貸・管理の選択肢をAIが比較中', dots: true,  meta: '5分前' },
  { type: 'expert',       label: '専門家参加', user: '住宅ローン専門家',  title: '住宅ローン相談に参加しました', body: '必要な場合のみ、専門家へつなげます。', dots: false, meta: '参加中' },
  { type: 'property',     label: '新着物件',   user: 'AIおすすめ',       title: 'さいたま市大宮区 4,280万円', body: '12件のいいね。問い合わせが増えています。', dots: false, meta: 'ハート 28  コメント 12' },
  { type: 'consultation', label: '相談開始',   user: '50代夫婦 / 神奈川', title: '売るべきか貸すべきか迷っています', body: '収益性と売却価格をAIが比較中', dots: true,  meta: '8分前' },
  { type: 'ai-answer',    label: 'AI診断完了', user: 'House-AI',         title: '投資物件のAI診断が完了しました', body: '収益シミュレーション準備完了です。', dots: false, meta: '回答済み' },
  { type: 'consultation', label: '相談開始',   user: '30代 / 大阪',      title: '初めての住宅購入で何から始めれば...', body: '優先順位をAIが整理中', dots: true,  meta: '2分前' },
];

// ============================================================
// HomeScreen — 完全リニューアル版
// ============================================================
const storyItems = [
  { initial: 'F', user: '30代女性', category: '賃貸', badge: '後悔', badgeType: 'red', title: '焦って契約して後悔しました', body: '今日決めないと無くなると言われて焦って契約しました。住んでから後悔しています。', aiComment: '契約前に周辺環境・管理費・修繕積立金を比較すると防げるケースです。最低3物件は比較し、時間帯を変えて内見することをおすすめします。' },
  { initial: 'M', user: '40代男性', category: '購入', badge: '失敗談', badgeType: 'orange', title: '営業マンに言われるまま決めてしまった', body: '営業マンに言われるまま決めてしまった。後から同じ条件でもっと安い物件を見つけました。', aiComment: 'このケースでは比較不足が原因でした。複数物件の比較と、時間帯を変えた内見が重要です。' },
  { initial: 'Y', user: '20代男性', category: '投資', badge: '失敗談', badgeType: 'orange', title: '利回りだけ見て大失敗しました', body: '利回りだけ見て投資して大失敗。空室が続いて修繕費も想定外でした。', aiComment: '表面利回りだけでなく、実質利回り、空室率、修繕積立金の推移を確認することが重要です。' },
  { initial: 'S', user: '50代女性', category: '売却', badge: 'AI活用', badgeType: 'blue', title: 'AIに相談して納得いく選択ができた', body: 'AIに相談したら複数の視点で整理してくれて、納得いく選択ができました。', aiComment: 'AI相談は初心者の方に特に効果的です。疑問点の整理と優先順位付けができます。' },
];

const verticalProperties = [
  {
    type: '賃貸',
    area: 'さいたま市大宮区',
    title: '大宮駅徒歩3分 新築マンション',
    price: '月8.5万円',
    image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&q=80',
    matchRate: '94%',
    aiBadge: 'AI PICK',
    aiComments: ['駅近・単身層からの問い合わせが増えています', '同条件ユーザーの満足度が高いエリアです', '初期費用の総額を事前に確認することをおすすめします'],
    aiReason: '一人暮らし・駅近希望の相談と相性が高いです',
  },
  {
    type: '売買',
    area: 'さいたま市浦和区',
    title: 'ファミリー向け戸建て',
    price: '4,580万円',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',
    matchRate: '88%',
    aiBadge: '人気上昇中',
    aiComments: ['学区・住環境を重視する方に人気です', 'ファミリー層の保存数が増えています', '通勤時間と学区の両立を確認するのがポイントです'],
    aiReason: 'ファミリー層・マイホーム希望の相談と相性が高いです',
  },
  {
    type: '投資',
    area: '川口市',
    title: '収益マンション',
    price: '1,580万円',
    image: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=400&q=80',
    matchRate: '91%',
    aiBadge: 'AI PICK',
    aiComments: ['表面利回り5%以上・空室リスク低めです', '投資初心者からの相談が増えている条件です', '修繕積立金と管理費の確認をおすすめします'],
    aiReason: '投資・利回り重視の相談と相性が高いです',
  },
];

export default function HomeScreen({ onTabChange, onNavigate }) {
  const navigate = onTabChange || onNavigate || (() => {});
  const [showChat, setShowChat] = useState(false);
  const [user, setUser] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [statusIndex, setStatusIndex] = useState(0);
  const [typedText, setTypedText] = useState('');
  const [feedIndex, setFeedIndex] = useState(0);
  const [feedKey, setFeedKey] = useState(0);
  const [aiCommentIndex, setAiCommentIndex] = useState(0);
  const [showStorySheet, setShowStorySheet] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiStep, setAiStep] = useState(0);
  const [noticeIndex, setNoticeIndex] = useState(0);
  const chatRef = useRef(null);

  const STATUS_TEXTS = ['AI分析中...', '条件を整理しています', '類似相談を検索しています'];
  const TYPED_FULL = 'どんなことでお悩みですか？内容を教えていただくと、AIが最適な進め方を整理します。';
  const FEED_MSGS = [
    '3分前　埼玉県のユーザーが住宅ローン相談を開始',
    '1分前　空き家相談がAIマッチングされました',
    '20秒前　投資物件のAI診断が完了しました',
    'たった今　さいたま市で新規相談が入りました',
  ];

  const aiMessages = [
    'AIが物件条件を読み取っています...',
    '価格・エリア・リスクを整理しています...',
    '似た相談事例を確認しています...',
    'あなた向けの相談画面を準備しています...',
  ];

  const liveNotices = [
    '20秒前　投資物件のAI診断が完了しました',
    '3分前　さいたま市で住宅ローン相談が始まりました',
    '5分前　この物件が保存されました',
    '8分前　似た条件の体験談が読まれました',
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY >= 200);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) setUser(data.session.user);
    });
  }, []);

  useEffect(() => { trackEvent('page_view', { page: 'home' }); }, []);

  useEffect(() => {
    const id = setInterval(() => setStatusIndex(i => (i + 1) % STATUS_TEXTS.length), 2000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    let i = 0;
    setTypedText('');
    const id = setInterval(() => {
      i++;
      setTypedText(TYPED_FULL.slice(0, i));
      if (i >= TYPED_FULL.length) clearInterval(id);
    }, 50);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setFeedIndex(n => (n + 1) % FEED_MSGS.length);
      setFeedKey(k => k + 1);
    }, 5000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setAiCommentIndex(prev => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      setNoticeIndex(prev => (prev + 1) % liveNotices.length);
    }, 12000);
    return () => clearInterval(t);
  }, []);

  const handleAIConsult = () => {
    setAiLoading(true);
    setAiStep(0);
    let step = 0;
    const interval = setInterval(() => {
      step = step + 1;
      if (step >= aiMessages.length) {
        clearInterval(interval);
        setTimeout(() => {
          setAiLoading(false);
          navigate('chat');
        }, 600);
      } else {
        setAiStep(step);
      }
    }, 450);
  };

  const handleStartChat = () => {
    setShowChat(true);
    setTimeout(() => chatRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  };

  const worries = [
    { text: '予算・ローンが心配', sub: '借りられる金額がわからない', tag: 'ローン不安' },
    { text: '物件の選び方がわからない', sub: '何を基準にすべきか迷っている', tag: '初心者' },
    { text: '失敗・後悔したくない', sub: '後になって気づく落とし穴が怖い', tag: '失敗回避' },
    { text: '売却タイミングがわからない', sub: 'いつ・いくらで売れるか不安', tag: 'タイミング' },
    { text: '投資物件を探したい', sub: '利回りと空室リスクを知りたい', tag: '物件探し中' },
    { text: '契約・法律が不安', sub: '重要事項説明書が読めない', tag: '法律' },
  ];

  const consultationItems = [
    {
      user: '30代女性 / 賃貸',
      badge: '解決済み',
      badgeType: 'green',
      question: '敷金・礼金なしは本当に得ですか？',
      answer: '礼金ゼロでも家賃が高めに設定されているケースがあります。2年分の総支払いで比較すると判断しやすくなります。',
      likes: 128,
      comments: 24,
      views: 2341,
    },
    {
      user: '40代男性 / 購入',
      badge: '相談中',
      badgeType: 'yellow',
      question: '変動金利と固定金利どちらがいい？',
      answer: '変動は短期返済向き、固定は長期安心派向きです。現在の金利差と返済期間でシミュレーションしましょう。',
      likes: 96,
      comments: 18,
      views: 1890,
    },
    {
      user: '20代男性 / 投資',
      badge: 'AI提案済み',
      badgeType: 'blue',
      question: '初めての投資物件で失敗しないコツは？',
      answer: '駅徒歩・築年数・表面利回りだけでなく、空室率と修繕費も確認しましょう。',
      likes: 214,
      comments: 47,
      views: 3120,
    },
    {
      user: '50代女性 / 売却',
      badge: '解決済み',
      badgeType: 'green',
      question: '相続した実家をどうすればいい？',
      answer: '売却・賃貸・空き家管理の3パターンで比較しましょう。固定資産税と維持費も重要です。',
      likes: 183,
      comments: 31,
      views: 2760,
    },
  ];


  return (
    <div className="hah-root">
      <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;600;700&family=Noto+Serif+JP:wght@400;700&display=swap" rel="stylesheet" />

      {/* 1. Hero */}
      <section className="hah-hero">
        <div className="hah-hero-left">
          <div className="hah-hero-badge">AI不動産コンシェルジュ</div>
          <h1 className="hah-hero-title">AIがあなたに最適な<br />住まいと進め方を提案</h1>
          <ul className="hah-hero-features">
            <li>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              30秒でAI診断・完全無料
            </li>
            <li>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              営業連絡は一切ありません
            </li>
            <li>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              専門家ネットワークに即接続
            </li>
          </ul>
          <div className="hah-hero-ctas">
            <button className="hah-cta-primary" onClick={handleStartChat}>
              AIに無料相談する
            </button>
            <button className="hah-cta-gold" onClick={handleStartChat}>
              30秒で無料診断
            </button>
          </div>
          <div className="hah-hero-stats">
            {[
              { label: '本日AI診断', value: '128件' },
              { label: '新着物件', value: '24件' },
              { label: '相談中', value: '18人' },
            ].map(item => (
              <div key={item.label} className="hah-stat-chip">
                <span className="hah-stat-label">{item.label}：</span>
                <span className="hah-stat-value">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="hah-hero-right" ref={chatRef}>
          {showChat ? (
            <AIChatFlow onNavigate={navigate} onRegisterSuccess={setUser} user={user} initialTag={null} />
          ) : (
            <div className="hah-chat-preview">
              <div className="hah-chat-header">
                <img src="/logo.png" alt="HOUSE-AI" className="hah-chat-logo" />
                <div>
                  <div className="hah-chat-header-name">HOUSE-AI コンシェルジュ</div>
                  <div className="hah-chat-header-status">
                    <span className="hah-online-dot" />
                    <span className="hah-status-pulse">{STATUS_TEXTS[statusIndex]}</span>
                  </div>
                </div>
              </div>
              <div className="hah-chat-body">
                <div className="hah-chat-bubble-wrap">
                  <img src="/logo.png" alt="AI" className="hah-chat-avatar" />
                  <div className="hah-chat-bubble">
                    <span className="hah-typed-text">{typedText}</span>
                    <span className="hah-typed-cursor" />
                    <div className="hah-chat-chips">
                      {['一人暮らし','家族','投資','ペット可','駅近','戸建て'].map(chip => (
                        <button key={chip} className="hah-chat-chip" onClick={handleStartChat}>{chip}</button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="hah-chat-input-wrap">
                <input
                  type="text"
                  placeholder="AIに相談してみる..."
                  className="hah-chat-input"
                  onFocus={handleStartChat}
                  readOnly
                />
                <button className="hah-chat-send" onClick={handleStartChat}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                </button>
              </div>
              <div className="hah-chat-trust">
                {['営業なし','完全無料','AI提案','30秒診断'].map(t => (
                  <span key={t} className="hah-trust-chip">{t}</span>
                ))}
              </div>
              <div className="hah-quick-chips-label">よく使われる相談</div>
              <div className="hah-quick-chips-row">
                {['家買うべき？','住宅ローン不安','空き家どうする？','何から始めればいい？'].map(q => (
                  <button key={q} className="hah-quick-chip" onClick={handleStartChat}>{q}</button>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 2. AIツール紹介 */}
      <AIToolsSection onTabChange={navigate} />

      {/* 3. LIVE Lounge フィード */}
      <section className="live-lounge-section">
        <div className="live-lounge-header">
          <div className="live-logo-wrap">
            <img src="/logo.png" alt="HOUSE-AI" className="live-logo-img" />
          </div>
          <div className="live-title-row">
            <span className="live-dot"></span>
            <h2>今、このような相談が増えています</h2>
          </div>
          <p>AIがリアルタイムでお悩みに寄り添っています</p>
        </div>
        <div className="live-feed-wrap">
          <div className="live-feed-track">
            {[...liveCards, ...liveCards].map((card, i) => (
              <div key={i} className={`live-card ${card.type}`} onClick={() => navigate('chat')}>
                <div className="live-card-label">{card.label}</div>
                <div className="live-user">{card.user}</div>
                <h3>{card.title}</h3>
                <p>{card.body}{card.dots ? <span className="typing-dots">...</span> : null}</p>
                <div className="live-meta">{card.meta}</div>
              </div>
            ))}
          </div>
        </div>
        <button className="live-main-cta" onClick={() => navigate('chat')}>
          今の悩みを話してみる
        </button>
      </section>

      {/* 3. 他ユーザー相談例 */}
      <section className="consult-section-sns">
        <div className="realtime-bar">
          <span className="rt-dot"></span>
          <span>今こんな相談が増えています：20秒前　投資物件のAI診断が完了しました</span>
        </div>

        <div className="section-header-row">
          <div>
            <h2>他のユーザーの相談例</h2>
            <p>実際の相談とAIの回答をご覧ください</p>
          </div>
          <button onClick={() => navigate('community')}>すべて見る</button>
        </div>

        <div className="scroll-feed">
          {consultationItems.map((item, i) => (
            <article key={i} className="consult-card-sns">
              <div className="card-user-row">
                <div className="user-avatar">{item.user.slice(0, 1)}</div>
                <span className="user-name">{item.user}</span>
                <span className={`badge badge-${item.badgeType}`}>{item.badge}</span>
              </div>
              <h3 className="card-question">Q. {item.question}</h3>
              <div className="ai-answer-box">
                <div className="ai-answer-label">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D6AE3B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.9 5.8H20l-4.9 3.6 1.9 5.8L12 14.8l-5 3.4 1.9-5.8L4 8.8h6.1z"/></svg>
                  AI ANSWER
                </div>
                <p>{item.answer}</p>
              </div>
              <div className="card-footer-stats">
                <span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                  {item.likes}
                </span>
                <span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  {item.comments}
                </span>
                <span className="ml-auto">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  {item.views}
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* 4. 人気物件プレビュー（縦型フィード） */}
      <section className="vertical-feed-section">
        <div className="vf-notice-bar">
          <span className="vf-notice-dot" />
          <span>今こんな相談が増えています：</span>
          <span className="vf-notice-text">{liveNotices[noticeIndex]}</span>
        </div>
        <div className="vertical-feed-inner">

          {/* 左：縦型フィード */}
          <div className="feed-phone-wrap">
            <div className="feed-phone-frame">
              <div className="feed-phone-header">
                <span className="feed-phone-label">HOUSE-AI FEED</span>
                <span className="feed-phone-title">人気物件プレビュー</span>
                <span className="feed-phone-count">1/5</span>
              </div>
              <div className="feed-phone-screen">
                <div className="feed-track">
                  {[...verticalProperties, ...verticalProperties].map((item, i) => (
                    <div key={i} className="feed-card" onClick={() => navigate('properties')}>
                      <img src={item.image} alt={item.title} className="feed-card-img" />
                      <div className="feed-card-overlay" />
                      <div className="feed-side-icons">
                        <button className="feed-icon-btn">
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                        </button>
                        <button className="feed-icon-btn">
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                        </button>
                        <button className="feed-icon-btn">
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
                        </button>
                        <button className="feed-icon-btn feed-icon-ai" onClick={(e) => { e.stopPropagation(); handleAIConsult(); }}>
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0B1F33" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>
                        </button>
                        <button className="feed-icon-btn" onClick={(e) => { e.stopPropagation(); setShowStorySheet(true); }}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                            <circle cx="9" cy="7" r="4"/>
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                          </svg>
                        </button>
                      </div>
                      <span className="feed-type-badge">{item.type}</span>
                      <span className="feed-match-badge">{item.aiBadge}　マッチ率 {item.matchRate}</span>
                      <div className="feed-card-bottom">
                        <div className="feed-area">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                          {item.area}
                        </div>
                        <h3 className="feed-card-title">{item.title}</h3>
                        <p className="feed-card-price">{item.price}</p>
                        <div className="feed-ai-comment">
                          <p>AI分析：{item.aiComments[aiCommentIndex % item.aiComments.length]}</p>
                          <p className="feed-ai-reason">{item.aiReason}</p>
                        </div>
                        <div className="feed-detail-btn">詳細を見る</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 右：説明・CTA */}
          <div className="feed-desc-wrap">
            <div className="feed-desc-badge">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D6AE3B" strokeWidth="2"><path d="M12 3l1.9 5.8H20l-4.9 3.6 1.9 5.8L12 14.8l-5 3.4 1.9-5.8L4 8.8h6.1z"/></svg>
              物件探しもAIでかんたんに
            </div>
            <h2 className="feed-desc-title">物件を見るだけでなく、<br/>AIに相談しながら探せます。</h2>
            <p className="feed-desc-body">気になる物件をSNSを見るように眺めながら、価格・利回り・ローン・周辺環境までAIに相談できます。探す、比べる、相談するをひとつの画面で完結できます。</p>
            <div className="feed-steps">
              <div className="feed-step">
                <img src="/favicon-src.png" alt="" className="feed-step-logo" />
                <div>
                  <strong>物件を縦にスワイプ</strong>
                  <span>気になる物件を直感的に見つけられます。</span>
                </div>
              </div>
              <div className="feed-step">
                <img src="/favicon-src.png" alt="" className="feed-step-logo" />
                <div>
                  <strong>気になったらAIに質問</strong>
                  <span>ローン・価格・リスク・周辺環境をその場で確認できます。</span>
                </div>
              </div>
              <div className="feed-step">
                <img src="/favicon-src.png" alt="" className="feed-step-logo" />
                <div>
                  <strong>似た条件の体験談も確認</strong>
                  <span>後悔しないための注意点をAIが整理します。</span>
                </div>
              </div>
              <div className="feed-step">
                <img src="/favicon-src.png" alt="" className="feed-step-logo" />
                <div>
                  <strong>必要なら専門家へ相談</strong>
                  <span>相談内容に合わせて最適な専門家へつなげます。</span>
                </div>
              </div>
            </div>
            <div className="feed-cta-row">
              <button className="feed-cta-navy" onClick={() => navigate('properties')}>物件情報を見る</button>
              <button className="feed-cta-gold" onClick={handleAIConsult}>AIに相談して探す</button>
            </div>
            <p className="feed-note">掲載物件はAIおすすめ順に表示されます。条件はいつでも変更できます。</p>
          </div>

        </div>

        {showStorySheet ? (
          <div className="story-sheet-overlay" onClick={() => setShowStorySheet(false)}>
            <div className="story-sheet" onClick={(e) => e.stopPropagation()}>
              <div className="story-sheet-handle" />
              <h3 className="story-sheet-title">似た条件でよくある体験談</h3>
              <p className="story-sheet-sub">このエリア・価格帯では、初期費用・騒音・通勤時間についての相談が多く寄せられています。</p>
              <div className="story-sheet-ai">
                <div className="story-sheet-ai-label">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D6AE3B" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4"/></svg>
                  契約前に確認したいポイント
                </div>
                <ol className="story-sheet-list">
                  <li>初期費用の総額（敷金・礼金・仲介手数料）</li>
                  <li>夜間の騒音環境</li>
                  <li>駅までの実際の徒歩時間</li>
                  <li>管理会社の対応範囲</li>
                </ol>
              </div>
              <p className="story-sheet-note">投稿内容はAIと運営により、個人・企業を特定しない形に整理して掲載しています。</p>
              <div className="story-sheet-cta-row">
                <button className="story-sheet-btn-outline" onClick={() => { setShowStorySheet(false); navigate('community'); }}>体験談をもっと見る</button>
                <button className="story-sheet-btn-gold" onClick={() => { setShowStorySheet(false); navigate('chat'); }}>AIにこの条件で相談する</button>
              </div>
              <button className="story-sheet-close" onClick={() => setShowStorySheet(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
          </div>
        ) : null}

        {aiLoading ? (
          <div className="ai-loading-overlay">
            <div className="ai-loading-card">
              <div className="ai-loading-header">
                <div className="ai-loading-avatar">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0B1F33" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>
                </div>
                <div>
                  <p className="ai-loading-label">HOUSE-AI ANALYSIS</p>
                  <h3 className="ai-loading-title">AIがあなた向けに整理しています</h3>
                </div>
              </div>
              <p className="ai-loading-sub">選択中の物件・相談内容・似た条件の体験談を確認しています。</p>
              <div className="ai-loading-box">
                <p className="ai-loading-message">{aiMessages[aiStep]}</p>
                <div className="ai-progress-bar">
                  <div className="ai-progress-fill" style={{ width: `${((aiStep + 1) / aiMessages.length) * 100}%` }} />
                </div>
              </div>
              <p className="ai-loading-note">営業連絡は一切ありません。安心して相談できます。</p>
            </div>
          </div>
        ) : null}
      </section>

      {/* 7. 体験談プレビュー */}
      <SectionTransition />
      <FigmaExperienceSection onTabChange={navigate} />
      <SectionTransition />
      <FigmaNewsSection onTabChange={navigate} />
      <AIPartnerSection onTabChange={navigate} />
      <FleaMarketSection />

      {/* 8. 下部固定CTA */}
      {scrolled ? (
        <div className="hah-fixed-cta">
          <div className="hah-fixed-cta-inner">
            <div className="hah-fixed-cta-text">AIが30秒で最適な住まいを提案します</div>
            <button className="hah-fixed-cta-btn" onClick={handleStartChat}>
              無料でAI相談をはじめる →
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
