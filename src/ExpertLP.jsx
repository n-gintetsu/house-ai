import React, { useState } from "react";

const C = {
  navy: "#1a3a5c",
  gold: "#c9a84c",
  bg: "#f4f6f9",
  card: "#ffffff",
  border: "#e2e8f0",
  title: "#1a2a3a",
  desc: "#64748b",
  red: "#e53e3e",
};

const MERITS = [
  { icon: "🤖", text: "AIが相談内容を整理してから送客" },
  { icon: "🎯", text: "対応エリア・得意分野でマッチング" },
  { icon: "👤", text: "プロフィール掲載で信頼獲得" },
  { icon: "💬", text: "DMで直接やり取り可能" },
  { icon: "📅", text: "初回相談・面談につなげやすい" },
];

const CASES = [
  { icon: "🏠", label: "相続", text: "「親の不動産をどうすればいいか分からない」" },
  { icon: "💰", label: "税金", text: "「売却時の税金が不安」" },
  { icon: "📋", label: "登記", text: "「名義変更や相続登記を相談したい」" },
  { icon: "⚠️", label: "契約トラブル", text: "「契約内容や違約金が不安」" },
  { icon: "🏚️", label: "空き家", text: "「空き家を売る・貸す・管理したい」" },
  { icon: "📈", label: "投資", text: "「法人化・節税・資産形成を相談したい」" },
];

const STEPS = [
  { n: 1, text: "専門家会員登録" },
  { n: 2, text: "対応分野・エリアを登録" },
  { n: 3, text: "AIが相談内容を分類" },
  { n: 4, text: "条件に合う専門家へマッチング" },
  { n: 5, text: "ユーザーとDM・相談開始" },
];

const FAQS = [
  { q: "登録すれば必ず案件が来ますか？", a: "案件発生を保証するものではありません。" },
  { q: "対応エリアは指定できますか？", a: "はい。対応可能地域を設定できます。" },
  { q: "無料プランはありますか？", a: "はい。まずは無料掲載から始められます。" },
  { q: "ユーザーとはどう連絡しますか？", a: "サイト内DMまたは指定の連絡方法でやり取りできます。" },
  { q: "解約できますか？", a: "所定の手続きでいつでも解約可能です。" },
];

const QUAL_OPTIONS = ["弁護士","司法書士","税理士","行政書士","土地家屋調査士","FP","建築士","不動産鑑定士","その他"];
const FIELD_OPTIONS = ["相続","税金・節税","登記","契約トラブル","空き家","投資・資産形成","リフォーム","その他"];

export default function ExpertLP({ onNavigate }) {
  const [form, setForm] = useState({
    name: "", office: "", qual: "", fields: [], area: "", email: "", phone: "", url: "", profile: "", plan: "free"
  });
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const toggleField = (f) => {
    setForm((p) => ({
      ...p,
      fields: p.fields.includes(f) ? p.fields.filter((x) => x !== f) : [...p.fields, f],
    }));
  };

  const handleSubmit = () => {
    if (!form.name || !form.email || !form.qual) return;
    setSubmitted(true);
  };

  const scrollToForm = (plan) => {
    if (plan) setForm((p) => ({ ...p, plan }));
    document.getElementById("expert-form")?.scrollIntoView({ behavior: "smooth" });
  };
  const scrollToPlan = () => {
    document.getElementById("expert-plan")?.scrollIntoView({ behavior: "smooth" });
  };

  if (submitted) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 32, textAlign: "center" }}>
        <div>
          <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: C.navy, marginBottom: 12 }}>申請を受け付けました</h2>
          <p style={{ color: C.desc, lineHeight: 1.8, marginBottom: 24 }}>
            申請ありがとうございます。<br />内容確認後、運営よりご連絡いたします。
          </p>
          <button onClick={() => onNavigate && onNavigate("home")}
            style={{ background: C.navy, color: "#fff", border: "none", borderRadius: 12, padding: "12px 32px", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
            トップへ戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Noto Sans JP', sans-serif", background: C.bg, paddingBottom: 80 }}>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;600;700&family=Noto+Serif+JP:wght@700&display=swap" rel="stylesheet" />

      {/* ファーストビュー */}
      <div style={{ background: C.navy, padding: "48px 24px 40px", textAlign: "center" }}>
        <p style={{ color: C.gold, fontSize: 12, fontWeight: 700, letterSpacing: 2, marginBottom: 12 }}>EXPERT NETWORK</p>
        <h1 style={{ color: "#fff", fontSize: 22, fontWeight: 700, fontFamily: "'Noto Serif JP', serif", lineHeight: 1.6, marginBottom: 16 }}>
          不動産相談に強い<br />専門家を募集しています
        </h1>
        <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 13, lineHeight: 1.8, marginBottom: 28 }}>
          AIがユーザーの悩みを整理し、<br />
          専門家が必要な相談だけをマッチングします。
        </p>
        <button onClick={scrollToForm}
          style={{ background: C.gold, color: C.navy, border: "none", borderRadius: 50, padding: "14px 36px", fontSize: 15, fontWeight: 700, cursor: "pointer", marginBottom: 12, display: "block", margin: "0 auto 12px" }}>
          無料で掲載申請する
        </button>
        <button onClick={scrollToPlan}
          style={{ background: "transparent", color: "rgba(255,255,255,0.8)", border: "1px solid rgba(255,255,255,0.4)", borderRadius: 50, padding: "10px 28px", fontSize: 13, cursor: "pointer", marginTop: 10, display: "block", margin: "10px auto 0" }}>
          料金プランを見る
        </button>
      </div>

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "0 16px" }}>

        {/* 相談ジャンル */}
        <div style={{ background: C.card, borderRadius: 16, padding: "28px 20px", margin: "20px 0", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: C.navy, marginBottom: 6, textAlign: "center" }}>こんな相談が届きます</h2>
          <p style={{ fontSize: 12, color: C.desc, textAlign: "center", marginBottom: 20 }}>AIが整理した相談意欲の高いユーザーをご紹介します</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {CASES.map((c) => (
              <div key={c.label} style={{ background: C.bg, borderRadius: 12, padding: "14px 12px", border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 22, marginBottom: 4 }}>{c.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.navy, marginBottom: 4 }}>{c.label}</div>
                <div style={{ fontSize: 11, color: C.desc, lineHeight: 1.6 }}>{c.text}</div>
              </div>
            ))}
          </div>
        </div>

        {/* メリット */}
        <div style={{ background: C.card, borderRadius: 16, padding: "28px 20px", margin: "20px 0", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: C.navy, marginBottom: 6, textAlign: "center" }}>営業せずに、相談意欲の高い<br />見込み客と出会える</h2>
          <p style={{ fontSize: 12, color: C.desc, textAlign: "center", marginBottom: 20 }}>AI時代の新しい専門家集客</p>
          {MERITS.map((m) => (
            <div key={m.text} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: `1px solid ${C.border}` }}>
              <span style={{ fontSize: 22, flexShrink: 0 }}>{m.icon}</span>
              <span style={{ fontSize: 13, color: C.title, fontWeight: 600 }}>{m.text}</span>
            </div>
          ))}
        </div>

        {/* 仕組み */}
        <div style={{ background: C.card, borderRadius: 16, padding: "28px 20px", margin: "20px 0", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: C.navy, marginBottom: 20, textAlign: "center" }}>ご紹介までの流れ</h2>
          {STEPS.map((s, i) => (
            <div key={s.n} style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: i < STEPS.length - 1 ? 0 : 0 }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: C.navy, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, flexShrink: 0 }}>
                  {s.n}
                </div>
                {i < STEPS.length - 1 && <div style={{ width: 2, height: 24, background: C.border }} />}
              </div>
              <div style={{ paddingBottom: i < STEPS.length - 1 ? 24 : 0 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: C.title, margin: 0 }}>{s.text}</p>
              </div>
            </div>
          ))}
        </div>

        {/* 料金プラン */}
        <div id="expert-plan" style={{ background: C.card, borderRadius: 16, padding: "28px 20px", margin: "20px 0", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: C.navy, marginBottom: 20, textAlign: "center" }}>料金プラン</h2>
          {[
            { key: "free", name: "フリープラン", price: "0円", items: ["プロフィール掲載", "一部案件閲覧", "問い合わせ制限あり"], color: C.border, textColor: C.title },
            { key: "standard", name: "スタンダード", price: "9,800円/月", items: ["プロフィール掲載", "案件通知", "DM機能", "月15件まで相談受付", "検索/AI推薦対象"], color: C.navy, textColor: "#fff" },
            { key: "premium", name: "プレミアム", price: "29,800円/月", items: ["AI優先推薦", "特集掲載", "案件優先通知", "相談件数上限アップ", "専門家ページ強化", "レビュー掲載"], color: C.gold, textColor: C.navy },
          ].map((plan) => (
            <div key={plan.key} onClick={() => setForm((p) => ({ ...p, plan: plan.key }))}
              style={{ border: `2px solid ${form.plan === plan.key ? C.gold : C.border}`, borderRadius: 14, padding: "16px", marginBottom: 12, cursor: "pointer", background: form.plan === plan.key ? "#fffbf0" : "#fff", transition: "all 0.2s" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: C.navy }}>{plan.name}</span>
                <span style={{ fontSize: 16, fontWeight: 700, color: C.gold }}>{plan.price}</span>
              </div>
              {plan.items.map((item) => (
                <div key={item} style={{ fontSize: 12, color: C.desc, paddingLeft: 4, marginBottom: 2 }}>✓ {item}</div>
              ))}
            </div>
          ))}
        </div>

        {/* 登録フォーム */}
        <div id="expert-form" style={{ background: C.card, borderRadius: 16, padding: "28px 20px", margin: "20px 0", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: C.navy, marginBottom: 6, textAlign: "center" }}>専門家会員として申請する</h2>
          <p style={{ fontSize: 12, color: C.desc, textAlign: "center", marginBottom: 20 }}>申請後、内容確認のうえご連絡いたします</p>

          {[
            { key: "name", label: "氏名 *", placeholder: "山田 太郎" },
            { key: "office", label: "事務所名", placeholder: "山田法律事務所" },
            { key: "area", label: "対応エリア", placeholder: "例：埼玉県全域、さいたま市近郊" },
            { key: "email", label: "メールアドレス *", placeholder: "example@example.com" },
            { key: "phone", label: "電話番号", placeholder: "090-0000-0000" },
            { key: "url", label: "公式サイトURL", placeholder: "https://..." },
          ].map((f) => (
            <div key={f.key} style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, color: C.desc, display: "block", marginBottom: 4 }}>{f.label}</label>
              <input value={form[f.key]} onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))}
                placeholder={f.placeholder}
                style={{ width: "100%", border: `1.5px solid ${C.border}`, borderRadius: 10, padding: "10px 12px", fontSize: 16, outline: "none", fontFamily: "'Noto Sans JP', sans-serif", color: C.title, boxSizing: "border-box" }} />
            </div>
          ))}

          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, color: C.desc, display: "block", marginBottom: 6 }}>資格種別 *</label>
            <select value={form.qual} onChange={(e) => setForm((p) => ({ ...p, qual: e.target.value }))}
              style={{ width: "100%", border: `1.5px solid ${C.border}`, borderRadius: 10, padding: "10px 12px", fontSize: 16, outline: "none", fontFamily: "'Noto Sans JP', sans-serif", color: C.title, background: "#fff" }}>
              <option value="">選択してください</option>
              {QUAL_OPTIONS.map((q) => <option key={q} value={q}>{q}</option>)}
            </select>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, color: C.desc, display: "block", marginBottom: 6 }}>対応分野（複数可）</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {FIELD_OPTIONS.map((f) => (
                <button key={f} onClick={() => toggleField(f)}
                  style={{ background: form.fields.includes(f) ? C.navy : "#fff", color: form.fields.includes(f) ? "#fff" : C.title, border: `1.5px solid ${form.fields.includes(f) ? C.navy : C.border}`, borderRadius: 20, padding: "6px 14px", fontSize: 12, cursor: "pointer", fontFamily: "'Noto Sans JP', sans-serif" }}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 12, color: C.desc, display: "block", marginBottom: 4 }}>プロフィール文</label>
            <textarea value={form.profile} onChange={(e) => setForm((p) => ({ ...p, profile: e.target.value }))}
              placeholder="得意分野や実績などをご記入ください"
              rows={4}
              style={{ width: "100%", border: `1.5px solid ${C.border}`, borderRadius: 10, padding: "10px 12px", fontSize: 16, outline: "none", fontFamily: "'Noto Sans JP', sans-serif", color: C.title, resize: "vertical", boxSizing: "border-box" }} />
          </div>

          <button onClick={handleSubmit}
            style={{ width: "100%", background: C.navy, color: "#fff", border: "none", borderRadius: 12, padding: "15px", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "'Noto Sans JP', sans-serif" }}>
            審査申請を送信する
          </button>
          <p style={{ fontSize: 11, color: C.desc, textAlign: "center", marginTop: 8 }}>※ 営業連絡は一切ありません</p>
        </div>

        {/* FAQ */}
        <div style={{ background: C.card, borderRadius: 16, padding: "28px 20px", margin: "20px 0", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: C.navy, marginBottom: 20, textAlign: "center" }}>よくある質問</h2>
          {FAQS.map((f, i) => (
            <div key={i} style={{ borderBottom: `1px solid ${C.border}`, paddingBottom: 12, marginBottom: 12 }}>
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                style={{ width: "100%", background: "none", border: "none", textAlign: "left", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", padding: 0 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: C.navy, fontFamily: "'Noto Sans JP', sans-serif" }}>Q. {f.q}</span>
                <span style={{ color: C.gold, fontSize: 18, flexShrink: 0, marginLeft: 8 }}>{openFaq === i ? "−" : "+"}</span>
              </button>
              {openFaq === i && (
                <p style={{ fontSize: 13, color: C.desc, lineHeight: 1.7, margin: "10px 0 0", paddingLeft: 4 }}>A. {f.a}</p>
              )}
            </div>
          ))}
        </div>

        {/* 最終CTA */}
        <div style={{ background: C.navy, borderRadius: 16, padding: "28px 20px", margin: "20px 0", textAlign: "center" }}>
          <h2 style={{ color: "#fff", fontSize: 17, fontWeight: 700, marginBottom: 8 }}>まずは無料掲載から始める</h2>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, marginBottom: 20, lineHeight: 1.7 }}>
            相談意欲の高い見込み客と出会える<br />AI時代の新しい専門家集客
          </p>
          <button onClick={scrollToForm}
            style={{ background: C.gold, color: C.navy, border: "none", borderRadius: 50, padding: "14px 36px", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
            専門家会員として登録する
          </button>
        </div>

      </div>
    </div>
  );
}
