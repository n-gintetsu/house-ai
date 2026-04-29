path = "/Users/ogawayotakeshi/Desktop/house-ai/src/HomeScreen.jsx"

with open(path, "r", encoding="utf-8") as f:
    content = f.read()

old_func = '''// ============================================================
// 登録後の即価値提供
// ============================================================
function PostRegisterValue({ tags, onNavigate }) {
  const result = getResultContent(tags);
  return (
    <div style={{ background: C.card, borderRadius: 20, padding: "28px", boxShadow: "0 8px 32px rgba(0,0,0,0.08)" }}>
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div style={{ fontSize: 40, marginBottom: 8 }}>🎉</div>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: C.title, fontFamily: "'Noto Serif JP', serif", margin: "0 0 6px" }}>
          {result.title}
        </h2>
        <p style={{ fontSize: 12, color: C.green, fontWeight: 700, fontFamily: "'Noto Sans JP', sans-serif" }}>
          登録完了！あなた専用の内容です
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
        {result.steps.map((s, i) => (
          <div key={i} style={{ background: C.bg, borderRadius: 12, padding: "14px 16px", display: "flex", alignItems: "flex-start", gap: 10 }}>
            <span style={{ fontSize: 18, flexShrink: 0 }}>{s.icon}</span>
            <p style={{ fontSize: 13, color: C.title, fontFamily: "'Noto Sans JP', sans-serif", margin: 0, lineHeight: 1.7 }}>{s.text}</p>
          </div>
        ))}
      </div>

      <p style={{ fontSize: 13, fontWeight: 700, color: C.navy, textAlign: "center", fontFamily: "'Noto Sans JP', sans-serif", marginBottom: 14 }}>
        このまま進めると失敗しません👇
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <button onClick={() => onNavigate("chat")} style={{ background: C.navy, color: "#fff", border: "none", borderRadius: 12, padding: "13px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Noto Sans JP', sans-serif" }}>
          💬 AIで続きを相談する
        </button>
        <button onClick={() => onNavigate("sell")} style={{ background: "#fff", color: C.navy, border: `1.5px solid ${C.border}`, borderRadius: 12, padding: "11px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Noto Sans JP', sans-serif" }}>
          🏷️ 無料査定を受ける
        </button>
        <button onClick={() => onNavigate("expert")} style={{ background: "#fff", color: C.navy, border: `1.5px solid ${C.border}`, borderRadius: 12, padding: "11px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Noto Sans JP', sans-serif" }}>
          👔 専門家に相談する
        </button>
      </div>
    </div>
  );
}'''

new_func = '''// ============================================================
// 登録後の即価値提供 + AI業者マッチング
// ============================================================

// タグから推薦理由を生成
function getMatchReason(tags) {
  const t = tags.join("・");
  return `「${t}」の状況に最も合致した業者です`;
}

// ダミー業者データ（実際はSupabaseから取得）
function getMatchedVendors(tags) {
  const isInvest = tags.some(t => ["初心者","経験者","利回り改善","物件探し中"].includes(t));
  const isReform = tags.some(t => ["購入前","現居","費用確認","業者探し"].includes(t));

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
      {/* 登録完了 */}
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <div style={{ fontSize: 40, marginBottom: 8 }}>🎉</div>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: C.title, fontFamily: "'Noto Serif JP', serif", margin: "0 0 6px" }}>
          {result.title}
        </h2>
        <p style={{ fontSize: 12, color: C.green, fontWeight: 700, fontFamily: "'Noto Sans JP', sans-serif" }}>
          登録完了！あなた専用の内容です
        </p>
      </div>

      {/* 専用提案3ステップ */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
        {result.steps.map((s, i) => (
          <div key={i} style={{ background: C.bg, borderRadius: 12, padding: "12px 14px", display: "flex", alignItems: "flex-start", gap: 10 }}>
            <span style={{ fontSize: 16, flexShrink: 0 }}>{s.icon}</span>
            <p style={{ fontSize: 13, color: C.title, fontFamily: "'Noto Sans JP', sans-serif", margin: 0, lineHeight: 1.7 }}>{s.text}</p>
          </div>
        ))}
      </div>

      {/* AI業者マッチング */}
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
              {/* AIおすすめバッジ */}
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

              {/* 推薦理由（1位のみ） */}
              {v.reason && (
                <div style={{ background: "#E6F1FB", borderRadius: 6, padding: "6px 10px", marginBottom: 8 }}>
                  <p style={{ fontSize: 11, color: "#0C447C", fontWeight: 600, fontFamily: "'Noto Sans JP', sans-serif", margin: 0 }}>
                    推薦理由：{v.reason}
                  </p>
                </div>
              )}

              {/* プレミアムの評価 */}
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

      {/* アクションボタン */}
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
}'''

if old_func in content:
    content = content.replace(old_func, new_func, 1)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print("✅ PostRegisterValue 更新完了！")
else:
    print("❌ 対象関数が見つかりませんでした")
