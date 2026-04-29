import { useState } from "react";

const C = {
  navy: "#1a3a5c",
  gold: "#c9a84c",
  bg: "#F4F7FB",
  card: "#ffffff",
  title: "#102A43",
  desc: "#5C677D",
  border: "#E2E8F0",
  blue: "#2F6BFF",
  blueBg: "#EAF1FF",
};

const TABS = [
  { id: "guide", label: "利用ガイド" },
  { id: "terms", label: "利用規約" },
  { id: "privacy", label: "プライバシーポリシー" },
  { id: "tokusho", label: "特定商取引法" },
  { id: "partner_terms", label: "業者・専門家向け規約" },
];

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <h2 style={{ fontSize: 16, fontWeight: 700, color: C.navy, fontFamily: "'Noto Sans JP', sans-serif", borderLeft: "4px solid #c9a84c", paddingLeft: 10, marginBottom: 12 }}>
        {title}
      </h2>
      <div style={{ fontSize: 13, color: C.desc, fontFamily: "'Noto Sans JP', sans-serif", lineHeight: 2 }}>
        {children}
      </div>
    </div>
  );
}

function Article({ no, title, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <p style={{ fontSize: 14, fontWeight: 700, color: C.title, fontFamily: "'Noto Sans JP', sans-serif", marginBottom: 6 }}>
        第{no}条（{title}）
      </p>
      <div style={{ fontSize: 13, color: C.desc, fontFamily: "'Noto Sans JP', sans-serif", lineHeight: 2, paddingLeft: 8 }}>
        {children}
      </div>
    </div>
  );
}

function GuideContent() {
  return (
    <div>
      <p style={{ fontSize: 13, color: C.desc, fontFamily: "'Noto Sans JP', sans-serif", lineHeight: 2, marginBottom: 24 }}>
        本サービスは、不動産に関する情報提供・マッチング・AIによる相談支援を目的としたプラットフォームです。
      </p>
      <Section title="ご利用の流れ">
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            { step: "①", title: "AIチャットで相談", desc: "不動産に関するお悩みを入力または選択してください。" },
            { step: "②", title: "最適な情報の提示", desc: "AIが状況に応じて、物件情報・体験談・専門家・業者をご提案します。" },
            { step: "③", title: "詳細確認・会員登録", desc: "一部の詳細情報や機能は、無料会員登録後にご利用いただけます。" },
            { step: "④", title: "業者・専門家への相談", desc: "ご希望に応じて、提携業者・専門家へお問い合わせが可能です。" },
          ].map((item) => (
            <div key={item.step} style={{ display: "flex", gap: 12, background: C.blueBg, borderRadius: 10, padding: "12px 14px" }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: C.navy, flexShrink: 0 }}>{item.step}</span>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: C.title, margin: "0 0 2px", fontFamily: "'Noto Sans JP', sans-serif" }}>{item.title}</p>
                <p style={{ fontSize: 12, color: C.desc, margin: 0, fontFamily: "'Noto Sans JP', sans-serif" }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>
      <Section title="提供サービス">
        {["AIチャットによる相談支援", "不動産物件情報の閲覧", "体験談・コミュニティ機能", "業者・専門家の紹介", "リフォーム・売却・投資に関する情報提供"].map((s) => (
          <p key={s} style={{ margin: "2px 0" }}>・{s}</p>
        ))}
      </Section>
      <Section title="注意事項">
        <p>・本サービスは情報提供を目的としており、特定の契約や取引を保証するものではありません。</p>
        <p>・AIの回答は参考情報であり、最終判断はご自身で行ってください。</p>
        <p>・業者との契約は、ユーザーと業者間で直接行われます。</p>
      </Section>
      <Section title="禁止事項">
        {["虚偽情報の投稿", "他者への誹謗中傷", "不正利用", "商用利用（当社許可なし）"].map((s) => (
          <p key={s} style={{ margin: "2px 0" }}>・{s}</p>
        ))}
      </Section>
      <Section title="お問い合わせ">
        <p>ご不明点はお問い合わせフォームよりご連絡ください。</p>
      </Section>
    </div>
  );
}

function TermsContent() {
  return (
    <div>
      <p style={{ fontSize: 13, color: C.desc, fontFamily: "'Noto Sans JP', sans-serif", lineHeight: 2, marginBottom: 24 }}>
        本規約は、本サービスの利用条件を定めるものです。
      </p>
      <Article no="1" title="適用">本規約は、ユーザーと当社との間の本サービスの利用に関わる一切の関係に適用されます。</Article>
      <Article no="2" title="サービス内容">
        当社は、以下のサービスを提供します。
        <p>・AIによる情報提供</p><p>・不動産関連情報の掲載</p><p>・業者・専門家のマッチング</p><p>・コミュニティ機能</p>
      </Article>
      <Article no="3" title="免責事項">
        <p>1. 当社は、本サービスに掲載される情報の正確性・完全性を保証しません。</p>
        <p>2. AIによる回答は参考情報であり、法的助言や専門的判断を代替するものではありません。</p>
        <p>3. ユーザーと業者・専門家との間で発生したトラブルについて、当社は責任を負いません。</p>
      </Article>
      <Article no="4" title="禁止事項">
        ユーザーは以下の行為をしてはなりません。
        <p>・法令違反</p><p>・虚偽情報の登録・投稿</p><p>・他者への誹謗中傷</p><p>・本サービスの運営を妨害する行為</p>
      </Article>
      <Article no="5" title="登録"><p>1. 一部機能は会員登録が必要です。</p><p>2. 登録情報は正確に入力してください。</p></Article>
      <Article no="6" title="サービスの停止">
        当社は、以下の場合サービスを停止できるものとします。
        <p>・システム保守</p><p>・障害発生</p><p>・その他やむを得ない理由</p>
      </Article>
      <Article no="7" title="知的財産">本サービスに関する著作権・知的財産権は当社に帰属します。</Article>
      <Article no="8" title="規約変更">当社は必要に応じて本規約を変更できるものとします。</Article>
      <Article no="9" title="準拠法・管轄">本規約は日本法に準拠し、当社所在地の管轄裁判所を専属管轄とします。</Article>
    </div>
  );
}

function PrivacyContent() {
  return (
    <div>
      <p style={{ fontSize: 13, color: C.desc, fontFamily: "'Noto Sans JP', sans-serif", lineHeight: 2, marginBottom: 24 }}>
        当社は、ユーザーの個人情報を適切に取り扱います。
      </p>
      <Section title="取得する情報">
        {["メールアドレス", "LINE情報（連携時）", "利用履歴（閲覧・AI利用など）", "投稿内容"].map((s) => <p key={s} style={{ margin: "2px 0" }}>・{s}</p>)}
      </Section>
      <Section title="利用目的">
        {["サービス提供", "ユーザーサポート", "サービス改善", "マッチング精度向上"].map((s) => <p key={s} style={{ margin: "2px 0" }}>・{s}</p>)}
      </Section>
      <Section title="第三者提供">
        以下の場合を除き、第三者へ提供しません。
        <p>・本人の同意がある場合</p><p>・法令に基づく場合</p>
      </Section>
      <Section title="業者・専門家への情報提供">ユーザーが問い合わせを行った場合、必要な情報を業者・専門家に提供することがあります。</Section>
      <Section title="Cookie等の利用">本サービスは、利便性向上のためCookie等を利用する場合があります。</Section>
      <Section title="セキュリティ">当社は、個人情報の漏洩・紛失防止のため適切な管理を行います。</Section>
      <Section title="ユーザーの権利">ユーザーは自身の個人情報について、開示・訂正・削除を請求できます。</Section>
      <Section title="改定">本ポリシーは必要に応じて変更される場合があります。</Section>
      <Section title="お問い合わせ">個人情報に関するお問い合わせは、当社窓口までご連絡ください。</Section>
    </div>
  );
}

function TokushoContent() {
  const items = [
    { label: "事業者名", value: "GINTETSU不動産株式会社" },
    { label: "代表者", value: "小川" },
    { label: "所在地", value: "〒330-0854 埼玉県さいたま市大宮区桜木町1-366-9 オープンオフィス大宮駅西口ビル402" },
    { label: "電話番号", value: "048-606-4317　※受付時間：平日10:00〜18:00" },
    { label: "メールアドレス", value: "info@gintetsu-fudosan.co.jp" },
    { label: "販売価格", value: "各サービス・プランごとに表示された価格に準じます。" },
    { label: "商品代金以外の必要料金", value: "インターネット接続にかかる通信料 / 振込手数料（必要な場合）" },
    { label: "支払方法", value: "クレジットカード / 銀行振込 / その他当社が定める方法" },
    { label: "支払時期", value: "各サービス申込時または契約時にお支払いいただきます。" },
    { label: "サービス提供時期", value: "決済完了後、または契約成立後、速やかに提供します。" },
    { label: "返品・キャンセル", value: "サービスの性質上、原則として返品・返金はできません。ただし、当社が特別に認めた場合はこの限りではありません。" },
    { label: "解約について", value: "サブスクリプションサービスの場合、所定の手続きにより解約が可能です。" },
    { label: "注意書き", value: "本サービスで示された内容は、効果・成果を保証するものではありません。" },
    { label: "その他", value: "詳細は利用規約をご確認ください。" },
  ];
  return (
    <div>
      {items.map((item) => (
        <div key={item.label} style={{ borderBottom: "0.5px solid " + C.border, padding: "12px 0", display: "grid", gridTemplateColumns: "130px 1fr", gap: 12 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: C.navy, fontFamily: "'Noto Sans JP', sans-serif", margin: 0 }}>{item.label}</p>
          <p style={{ fontSize: 13, color: C.desc, fontFamily: "'Noto Sans JP', sans-serif", margin: 0, lineHeight: 1.8 }}>{item.value}</p>
        </div>
      ))}
    </div>
  );
}

function PartnerTermsContent() {
  return (
    <div>
      <p style={{ fontSize: 13, color: C.desc, fontFamily: "'Noto Sans JP', sans-serif", lineHeight: 2, marginBottom: 24 }}>
        本規約は、本サービスに登録する業者・専門家の利用条件を定めるものです。
      </p>
      <Article no="1" title="目的">本サービスは、ユーザーと業者・専門家をマッチングすることを目的とします。</Article>
      <Article no="2" title="登録"><p>1. 業者・専門家は、正確な情報を登録するものとします。</p><p>2. 虚偽情報の登録は禁止します。</p></Article>
      <Article no="3" title="サービス内容"><p>・ユーザーからの問い合わせ受信</p><p>・案件紹介</p><p>・AIマッチングによる推薦</p></Article>
      <Article no="4" title="料金">
        <p>1. 無料プラン・有料プランがあります。</p>
        <p>2. 有料プランは、月額または成果報酬に基づき課金されます。</p>
        <p>3. 成果報酬は、問い合わせ・成約などに応じて発生します。</p>
      </Article>
      <Article no="5" title="禁止事項"><p>・虚偽の実績表示</p><p>・ユーザーへの不当な営業行為</p><p>・誹謗中傷</p><p>・本サービスの信用を損なう行為</p></Article>
      <Article no="6" title="責任"><p>1. 業者・専門家とユーザー間の契約は、当事者間で直接成立します。</p><p>2. 当社は契約内容・結果について責任を負いません。</p></Article>
      <Article no="7" title="アカウント停止"><p>・規約違反</p><p>・ユーザーからの苦情多数</p><p>・不正行為</p></Article>
      <Article no="8" title="情報の利用">登録情報・実績・レビューは、本サービス上に掲載される場合があります。</Article>
      <Article no="9" title="解約">業者・専門家は、所定の手続きにより解約できます。ただし、未払い料金がある場合は支払いが必要です。</Article>
      <Article no="10" title="規約変更">当社は本規約を随時変更できるものとします。</Article>
      <Article no="11" title="準拠法">本規約は日本法に準拠します。</Article>
      <Article no="12" title="管轄">当社所在地の裁判所を専属管轄とします。</Article>
    </div>
  );
}

export default function LegalPage({ onNavigate }) {
  const [activeTab, setActiveTab] = useState("guide");

  const renderContent = () => {
    switch (activeTab) {
      case "guide": return <GuideContent />;
      case "terms": return <TermsContent />;
      case "privacy": return <PrivacyContent />;
      case "tokusho": return <TokushoContent />;
      case "partner_terms": return <PartnerTermsContent />;
      default: return null;
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Noto Sans JP', sans-serif", paddingBottom: 60 }}>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;600;700&display=swap" rel="stylesheet" />
      <div style={{ background: C.navy, padding: "16px 20px", display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={() => onNavigate && onNavigate("home")} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.7)", fontSize: 13, cursor: "pointer", fontFamily: "'Noto Sans JP', sans-serif" }}>
          ← 戻る
        </button>
        <h1 style={{ fontSize: 16, fontWeight: 700, color: "#fff", margin: 0, fontFamily: "'Noto Sans JP', sans-serif" }}>
          サービス案内・規約
        </h1>
      </div>
      <div style={{ background: C.card, borderBottom: "1px solid " + C.border, overflowX: "auto", whiteSpace: "nowrap" }}>
        <div style={{ display: "inline-flex", padding: "0 16px" }}>
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: "none",
                border: "none",
                borderBottom: activeTab === tab.id ? "2px solid " + C.navy : "2px solid transparent",
                color: activeTab === tab.id ? C.navy : C.desc,
                fontSize: 13,
                fontWeight: activeTab === tab.id ? 700 : 400,
                padding: "14px 14px",
                cursor: "pointer",
                fontFamily: "'Noto Sans JP', sans-serif",
                whiteSpace: "nowrap",
                transition: "all 0.2s",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "28px 20px" }}>
        <div style={{ background: C.card, borderRadius: 16, padding: "28px 24px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: C.title, fontFamily: "'Noto Serif JP', serif", marginBottom: 24, paddingBottom: 12, borderBottom: "1px solid " + C.border }}>
            {TABS.find(t => t.id === activeTab)?.label}
          </h2>
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
