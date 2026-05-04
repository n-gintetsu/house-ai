import { useState, useEffect, useRef, useCallback } from "react";
import ReactDOM from "react-dom";
import './TikTokPropertyFeed.css'

// ── NGワード ─────────────────────────────────────────
const NG_WORDS = [
  "個人情報", "営業", "勧誘", "LINE教えて", "電話番号",
  "死ね", "殺す", "クズ", "ゴミ", "最悪", "詐欺師", "悪徳",
  "詐欺です", "絶対やめろ", "100%",
];
const NG_PATTERNS = [/\d{2,4}-\d{2,4}-\d{4}/, /https?:\/\//];
const NG_MSG = "投稿できません。個人情報・誹謗中傷・断定表現は使用できません。表現を見直してください。";
const hasNg = (t) => NG_WORDS.some((w) => t.includes(w)) || NG_PATTERNS.some(p => p.test(t));

// ── AI返信（モック） ──────────────────────────────────
const aiReply = (text, p) => {
  if (text.includes("利回") || text.includes("投資"))
    return `想定利回りは約${p.yield || "5.5"}%です。${p.station || "駅近"}エリアで需要が安定しています。`;
  if (text.includes("買い") || text.includes("おすすめ"))
    return `${p.title}は立地・価格帯ともにバランスの取れた物件です。詳細はAI相談またはスタッフまで。`;
  if (text.includes("賃料") || text.includes("家賃"))
    return `周辺相場から想定賃料は${p.rent || "要問合せ"}です。詳しくはお気軽にご相談ください。`;
  return `ご質問ありがとうございます。${p.title}について、お気軽にAI相談またはスタッフまでどうぞ。`;
};

// ── コメントモーダル ──────────────────────────────────
const REPORT_REASONS = ["誹謗中傷", "個人情報", "虚偽情報", "営業投稿", "不適切表現", "その他"];
const TAG_OPTIONS = ["質問", "内見感想", "周辺環境", "注意点", "住んだ経験", "投資目線"];
const TRUST_LABELS = ["なし", "内見済み", "居住経験あり", "近隣住民", "投資家目線"];

function CommentModal({ property, onClose, user }) {
  const [list, setList] = useState([
    { id: 1, nick: "投資家Aさん", text: "立地が良さそう。利回りはどのくらいですか？", tag: "投資目線", time: "2時間前" },
    { id: 2, nick: "GINTETSUスタッフ", text: "周辺1LDK平均賃料は約7.2万円。利回り約5.8%の安定物件です。", tag: "質問", time: "1時間前", isStaff: true },
  ]);
  const [text, setText] = useState("");
  const [nick, setNick] = useState("");
  const [tag, setTag] = useState("質問");
  const [trustLabel, setTrustLabel] = useState("なし");
  const [err, setErr] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [reportTarget, setReportTarget] = useState(null);
  const [reportDone, setReportDone] = useState(false);
  const listRef = useRef(null);
  const lastEnterRef = useRef(null);

  const submit = useCallback(async () => {
    if (!text.trim()) return;
    if (hasNg(text)) { setErr(NG_MSG); return; }
    const newComment = {
      id: Date.now(),
      nick: nick.trim() || "匿名さん",
      text: text.trim(),
      tag,
      trustLabel: trustLabel !== "なし" ? trustLabel : null,
      time: "たった今",
    };
    setList(p => [...p, newComment]);
    setText(""); setErr("");
    setAiLoading(true);
    await new Promise(r => setTimeout(r, 900));
    setList(p => [...p, { id: Date.now() + 1, nick: "🤖 AIアドバイザー", text: aiReply(text, property), tag: "AI", time: "今", isAI: true }]);
    setAiLoading(false);
    setTimeout(() => listRef.current?.scrollTo({ top: 9999, behavior: "smooth" }), 100);
  }, [text, nick, tag, trustLabel, property]);

  return ReactDOM.createPortal(
    <div className="tt-overlay" onClick={onClose}>
      <div className="tt-sheet" onClick={e => e.stopPropagation()}>
        <div className="tt-sheet-handle" />
        <div className="tt-sheet-header">
          <span>💬 コメント</span>
          <button className="tt-sheet-close" onClick={onClose}>✕</button>
        </div>

        {/* コメントリスト */}
        <div className="tt-comment-list" ref={listRef}>
          {list.map(c => (
            <div key={c.id} className={`tt-comment-item${c.isStaff ? " is-staff" : ""}${c.isAI ? " is-ai" : ""}`}>
              <div className="tt-comment-meta">
                <span className="tt-comment-nick">{c.nick}</span>
                {c.trustLabel && (
                  <span style={{ fontSize: 10, color: '#64748b', background: '#f1f5f9', borderRadius: 4, padding: '1px 5px', marginLeft: 4 }}>
                    [{c.trustLabel}・自己申告]
                  </span>
                )}
                <span className={`tt-comment-tag t-${c.tag}`}>{c.tag}</span>
                <span className="tt-comment-time">{c.time}</span>
                {!c.isStaff && !c.isAI && (
                  <button className="tt-report" onClick={e => { e.stopPropagation(); setReportTarget(c.id); setReportDone(false); }}>⚑</button>
                )}
              </div>
              <p className="tt-comment-text">{c.text}</p>
            </div>
          ))}
          {aiLoading && (
            <div className="tt-comment-item is-ai">
              <div className="tt-comment-meta"><span className="tt-comment-nick">🤖 AIアドバイザー</span></div>
              <p className="tt-comment-text tt-typing">回答を生成中</p>
            </div>
          )}
          {/* 法務注意文 */}
          <p style={{ fontSize: 11, color: '#94a3b8', padding: '12px 16px', borderTop: '1px solid #f1f5f9', margin: 0 }}>
            投稿内容はユーザー個人の意見であり、正確性を保証するものではありません。不動産取引の判断は、必ず公式情報・専門家確認のうえ行ってください。
          </p>
        </div>

        {/* 通報モーダル */}
        {reportTarget !== null && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '20px 20px 0 0', zIndex: 20 }}>
            <div style={{ background: '#fff', borderRadius: 16, padding: '24px 20px', width: '85%', maxWidth: 320 }}>
              {reportDone ? (
                <>
                  <p style={{ textAlign: 'center', color: '#1a3a5c', fontSize: 14, fontWeight: 600, marginBottom: 16 }}>
                    通報を受け付けました。確認後、必要に応じて対応します。
                  </p>
                  <button onClick={() => { setReportTarget(null); setReportDone(false); }}
                    style={{ width: '100%', padding: '10px', background: '#1a3a5c', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, cursor: 'pointer' }}>
                    閉じる
                  </button>
                </>
              ) : (
                <>
                  <p style={{ fontWeight: 700, marginBottom: 12, color: '#1a3a5c', fontSize: 14 }}>通報理由を選択</p>
                  {REPORT_REASONS.map(r => (
                    <button key={r} onClick={() => setReportDone(true)}
                      style={{ display: 'block', width: '100%', padding: '10px 14px', marginBottom: 8, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13, cursor: 'pointer', textAlign: 'left', color: '#334155' }}>
                      {r}
                    </button>
                  ))}
                  <button onClick={() => setReportTarget(null)}
                    style={{ width: '100%', padding: '10px', background: 'none', border: 'none', color: '#94a3b8', fontSize: 13, cursor: 'pointer' }}>
                    キャンセル
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* 投稿フォーム or ログインゲート */}
        {user ? (
          <div className="tt-form">
            {err && <p className="tt-err">{err}</p>}
            <input className="tt-nick-input" placeholder="ニックネーム（任意）" value={nick} onChange={e => setNick(e.target.value)} style={{ fontSize: 16 }} />
            {/* カテゴリ */}
            <div className="tt-tag-row">
              {TAG_OPTIONS.map(t => (
                <button key={t} className={`tt-tag-btn${tag === t ? " active" : ""}`} onClick={() => setTag(t)}>{t}</button>
              ))}
            </div>
            {/* 信頼ラベル */}
            <div className="tt-tag-row" style={{ marginTop: 6, alignItems: 'center' }}>
              <span style={{ fontSize: 11, color: '#94a3b8', marginRight: 4, whiteSpace: 'nowrap' }}>信頼ラベル（任意・自己申告）</span>
              {TRUST_LABELS.map(l => (
                <button key={l} className={`tt-tag-btn${trustLabel === l ? " active" : ""}`} onClick={() => setTrustLabel(l)}>{l}</button>
              ))}
            </div>
            {/* 注意文 */}
            <p style={{ fontSize: 11, color: '#94a3b8', margin: '6px 0' }}>
              安心して使えるコメント欄にするため、個人情報・誹謗中傷・根拠のない断定は投稿できません。
            </p>
            <div className="tt-input-row">
              <textarea className="tt-textarea" placeholder="コメントを入力…（個人情報・営業投稿は禁止）" value={text} onChange={e => setText(e.target.value)} rows={2} style={{ fontSize: 16 }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    const now = Date.now();
                    if (lastEnterRef.current && now - lastEnterRef.current < 500) {
                      e.preventDefault();
                      lastEnterRef.current = null;
                      submit();
                    } else {
                      lastEnterRef.current = now;
                    }
                  }
                }} />
              <button className="tt-send" onClick={submit} disabled={!text.trim()}>送信</button>
            </div>
          </div>
        ) : (
          <div className="tt-form" style={{ textAlign: 'center', padding: '20px 16px' }}>
            <p style={{ fontSize: 13, color: '#64748b', marginBottom: 12 }}>コメントするにはログインが必要です</p>
            <button
              style={{ background: '#1a3a5c', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 32px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
              onClick={() => { onClose(); window.dispatchEvent(new CustomEvent('show-auth-sheet', {})); }}
            >
              ログイン・会員登録
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

// ── AI相談モーダル ────────────────────────────────────
function AIModal({ property, onClose }) {
  const [msgs, setMsgs] = useState([
    { role: "ai", text: `「${property.title}」について何でもお聞きください。\n価格・利回り・ローン・周辺環境など、AIがお答えします。` }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const listRef = useRef(null);
  const lastEnterRef = useRef(null);

  const send = useCallback(async (forceText) => {
    const q = forceText ?? input.trim();
    if (!q || loading) return;
    setInput("");
    setMsgs(p => [...p, { role: "user", text: q }]);
    setLoading(true);
    const res = await fetch('/api/ai-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: q, property, history: msgs.filter(m => m.role !== 'ai' || msgs.indexOf(m) > 0).map(m => ({ role: m.role === 'ai' ? 'assistant' : 'user', content: m.text })) }),
    });
    const data = await res.json();
    const reply = data.reply || 'エラーが発生しました。もう一度お試しください。';
    setMsgs(p => [...p, { role: "ai", text: reply }]);
    // 案件配信
    fetch('/api/distribute-case', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        category: property?.deal_type === 'rent' ? '賃貸' : '売買',
        area: property?.address?.slice(0, 4) || '',
        summary: q,
        session_id: sessionStorage.getItem('ha_session_id') || '',
        case_type: 'ai_consultation',
      }),
    }).catch(() => {});
    setLoading(false);
    setTimeout(() => listRef.current?.scrollTo({ top: 9999, behavior: "smooth" }), 100);
  }, [input, loading, property]);

  return ReactDOM.createPortal(
    <div className="tt-overlay" onClick={onClose}>
      <div className="tt-sheet tt-ai-sheet" style={{ height: '80dvh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
        <div className="tt-sheet-handle" />
        <div className="tt-sheet-header">
          <span>🤖 AI不動産相談</span>
          <button className="tt-sheet-close" onClick={onClose}>✕</button>
        </div>
        <div className="tt-ai-chip">
          <span className="tt-ai-chip-label">対象物件</span>
          <span className="tt-ai-chip-title">{property.title}</span>
          <span className="tt-ai-chip-price">{property.price}</span>
        </div>
        <div className="tt-comment-list" ref={listRef}>
          {msgs.map((m, i) => (
            <div key={i} className={`tt-ai-msg ${m.role}`}>
              {m.role === "ai" && <span className="tt-ai-avatar">🤖</span>}
              <div className="tt-ai-bubble" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.7' }}>{m.text}</div>
            </div>
          ))}
          {loading && (
            <div className="tt-ai-msg ai">
              <span className="tt-ai-avatar">🤖</span>
              <div className="tt-ai-bubble tt-typing">回答を生成中</div>
            </div>
          )}
        </div>
        <div className="tt-form">
          <div className="tt-input-row">
            <textarea className="tt-textarea" placeholder="例：この物件は買いですか？利回りは？" value={input} onChange={e => setInput(e.target.value)} rows={2} style={{ fontSize: 16 }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  const now = Date.now();
                  if (lastEnterRef.current && now - lastEnterRef.current < 500) {
                    e.preventDefault();
                    lastEnterRef.current = null;
                    send();
                  } else {
                    lastEnterRef.current = now;
                  }
                }
              }} />
            <button className="tt-send" onClick={send} disabled={!input.trim() || loading}>送信</button>
          </div>
          <div style={{ display: 'flex', gap: 8, padding: '8px 12px 4px', borderTop: '1px solid #f0f0f0' }}>
            <button onClick={() => { onClose(); window.dispatchEvent(new CustomEvent('open-dm', { detail: { property } })); }} style={{ flex: 1, padding: '10px 4px', background: '#1a3a5c', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>📩 問い合わせる</button>
            <button onClick={() => send('他の物件と比べてどうですか？おすすめの比較ポイントを教えてください。')} style={{ flex: 1, padding: '10px 4px', background: '#f5f5f5', color: '#333', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>🔍 比較する</button>
            <button onClick={() => { setInput('他の物件と比べてどうですか？'); }} style={{ flex: 1, padding: '10px 4px', background: '#f0f4ff', color: '#1a3a5c', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>🤖 さらに聞く</button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ── DMモーダル ────────────────────────────────────────
function DMModal({ property, user, onClose }) {
  const [message, setMessage] = useState(
    `「${property.title}」について相談したいです。`
  );
  const lastEnterRef = useRef(null);

  const handleSend = async () => {
    if (!message.trim()) return;
    console.log('DM送信:', {
      propertyId: property.id,
      propertyTitle: property.title,
      userId: user?.id,
      message,
    });
    alert('DMを送信しました');
    onClose();
  };

  return ReactDOM.createPortal(
    <div className="tt-overlay" onClick={onClose}>
      <div className="tt-sheet" onClick={e => e.stopPropagation()}>
        <div className="tt-sheet-handle" />
        <div className="tt-sheet-header">
          <span>✉️ DMを送る</span>
          <button className="tt-sheet-close" onClick={onClose}>✕</button>
        </div>
        <div style={{ padding: '16px', flex: 1, overflowY: 'auto' }}>
          <div className="tt-ai-chip" style={{ marginBottom: 16 }}>
            <span className="tt-ai-chip-label">対象物件</span>
            <span className="tt-ai-chip-title">{property.title}</span>
          </div>
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="相談内容を入力してください"
            style={{
              width: '100%',
              minHeight: 130,
              border: '1.5px solid #e2e8f0',
              borderRadius: 12,
              padding: 14,
              fontSize: 16,
              boxSizing: 'border-box',
              resize: 'none',
              fontFamily: 'inherit',
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                const now = Date.now();
                if (lastEnterRef.current && now - lastEnterRef.current < 500) {
                  e.preventDefault();
                  lastEnterRef.current = null;
                  handleSend();
                } else {
                  lastEnterRef.current = now;
                }
              }
            }}
          />
          <p style={{ fontSize: 11, color: '#94a3b8', margin: '8px 0 0' }}>
            ※ 個人情報の記載はご遠慮ください
          </p>
        </div>
        <div className="tt-form" style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}>
          <button
            onClick={handleSend}
            disabled={!message.trim()}
            style={{
              width: '100%', height: 52, border: 'none',
              borderRadius: 999, background: '#14395b',
              color: '#fff', fontSize: 16, fontWeight: 800, cursor: 'pointer',
            }}
          >
            送信する
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ── 物件詳細モーダル ──────────────────────────────────
const DETAIL_FIELDS = [
  { label: '土地面積', key: 'land_area' },
  { label: '地目', key: 'land_category' },
  { label: '用途地域', key: 'use_district' },
  { label: '建ぺい率', key: 'building_coverage' },
  { label: '容積率', key: 'floor_area_ratio' },
  { label: '接道状況', key: 'road_access' },
  { label: '都市計画', key: 'city_planning' },
  { label: '引渡', key: 'handover' },
  { label: '取引態様', key: 'transaction_type' },
  { label: '土地権利', key: 'land_rights' },
  { label: '地勢', key: 'topography' },
  { label: '土地持分', key: 'land_share' },
  { label: '私道負担', key: 'private_road' },
  { label: '国土法', key: 'national_land_law' },
  { label: '農地法', key: 'agricultural_land_law' },
  { label: '埋蔵文化財', key: 'buried_cultural_property' },
  { label: '土壌汚染', key: 'soil_contamination' },
];

function PropertyDetailModal({ property, onClose, onAIConsult, onDM }) {
  const [imgIdx, setImgIdx] = useState(0);
  const [showFullSlider, setShowFullSlider] = useState(false);
  const touchStartX = useRef(null);

  const images = property.image_urls?.length > 0
    ? property.image_urls
    : property.image_url
    ? [property.image_url]
    : [];

  const isMobileModal = window.innerWidth <= 768;

  let details = {};
  try {
    details = typeof property.details === 'string'
      ? JSON.parse(property.details)
      : (property.details || {});
  } catch {}

  const dealLabel = { rent: '賃貸', sale: '売買', '賃貸': '賃貸', '売買': '売買' }[property.deal_type] ?? property.deal_type;
  const priceLabel = formatPrice(property);

  const address = details.address || property.address || '';
  const access = details.access || property.station || '';
  const area = details.area || details.land_area || property.size || '';
  const detailRows = DETAIL_FIELDS.map(f => ({ label: f.label, value: details[f.key] })).filter(r => r.value);

  return ReactDOM.createPortal(
    <div className="tt-overlay" onClick={onClose}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          height: '90dvh',
          background: '#fff',
          borderRadius: '20px 20px 0 0',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 10001,
          overflow: 'hidden',
        }}
      >
        {/* ヘッダー */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid #f1f5f9', flexShrink: 0 }}>
          <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: 32, height: 32, fontSize: 14, cursor: 'pointer', color: '#64748b', flexShrink: 0 }}>✕</button>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '60%' }}>{property.title}</span>
          <button style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', flexShrink: 0 }}
            onClick={() => {
              const shareUrl = `${window.location.origin}?property=${property.id}`;
              if (navigator.share) { navigator.share({ title: property.title, text: property.title, url: shareUrl }); }
              else { navigator.clipboard?.writeText(shareUrl); }
            }}>↗️</button>
        </div>

        {/* スクロール領域 */}
        <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
          {/* 写真エリア */}
          {isMobileModal ? (
            /* A案：スマホ - 4:3シンプルスライダー */
            <div
              style={{ position: 'relative', aspectRatio: '4/3', background: '#0f172a', overflow: 'hidden' }}
              onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
              onTouchEnd={(e) => {
                if (touchStartX.current === null) return;
                const diff = touchStartX.current - e.changedTouches[0].clientX;
                if (Math.abs(diff) > 40) {
                  if (diff > 0) setImgIdx(i => (i + 1) % images.length);
                  else setImgIdx(i => (i - 1 + images.length) % images.length);
                }
                touchStartX.current = null;
              }}
            >
              {images[0] ? (
                <img src={images[imgIdx]} alt="物件" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#f1f5f9' }}>
                  <span style={{ fontSize: 36 }}>🏠</span>
                  <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>準備中</span>
                </div>
              )}
              {images.length > 1 && (
                <>
                  <button onClick={() => setImgIdx(i => (i - 1 + images.length) % images.length)}
                    style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.45)', color: '#fff', border: 'none', borderRadius: '50%', width: 32, height: 32, fontSize: 16, cursor: 'pointer' }}>‹</button>
                  <button onClick={() => setImgIdx(i => (i + 1) % images.length)}
                    style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.45)', color: '#fff', border: 'none', borderRadius: '50%', width: 32, height: 32, fontSize: 16, cursor: 'pointer' }}>›</button>
                  <div style={{ position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 4 }}>
                    {images.map((_, i) => (
                      <div key={i} style={{ width: i === imgIdx ? 16 : 6, height: 4, borderRadius: 2, background: i === imgIdx ? '#fff' : 'rgba(255,255,255,0.4)', transition: 'width 0.2s' }} />
                    ))}
                  </div>
                  <div style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.5)', color: '#fff', borderRadius: 999, padding: '2px 8px', fontSize: 10 }}>
                    {imgIdx + 1}/{images.length}
                  </div>
                </>
              )}
            </div>
          ) : showFullSlider ? (
            /* B案PC：フルスライダー */
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'relative', width: '100%', height: 250, background: '#0f172a', overflow: 'hidden' }}>
                <img src={images[imgIdx]} alt={property.title} style={{ width: '100%', height: 250, objectFit: 'cover', display: 'block' }} />
                {images.length > 1 && (
                  <>
                    <button onClick={() => setImgIdx(i => (i - 1 + images.length) % images.length)}
                      style={{ position: 'absolute', top: '50%', left: 10, transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.45)', color: '#fff', border: 'none', borderRadius: '50%', width: 36, height: 36, fontSize: 18, cursor: 'pointer', zIndex: 2 }}>‹</button>
                    <button onClick={() => setImgIdx(i => (i + 1) % images.length)}
                      style={{ position: 'absolute', top: '50%', right: 10, transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.45)', color: '#fff', border: 'none', borderRadius: '50%', width: 36, height: 36, fontSize: 18, cursor: 'pointer', zIndex: 2 }}>›</button>
                  </>
                )}
                <button
                  onClick={() => setShowFullSlider(false)}
                  style={{ position: 'absolute', top: 8, left: 8, zIndex: 10, background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none', borderRadius: 999, padding: '4px 10px', fontSize: 11, cursor: 'pointer' }}
                >
                  ← 一覧
                </button>
              </div>
              {images.length > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: 6, padding: '8px 0' }}>
                  {images.map((_, i) => (
                    <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: i === imgIdx ? '#1a3a5c' : '#cbd5e1' }} />
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* B案PC：グリッド */
            <div
              style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gridTemplateRows: '130px 130px', gap: 2, background: '#e2e8f0', cursor: 'pointer' }}
              onClick={() => images.length > 1 && setShowFullSlider(true)}
            >
              {images[0] ? (
                <img src={images[0]} alt="メイン" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', gridRow: 'span 2' }} />
              ) : (
                <div style={{ gridRow: 'span 2', background: '#f1f5f9', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <span style={{ fontSize: 28 }}>🏠</span>
                  <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>準備中</span>
                </div>
              )}
              {images[1] ? (
                <img src={images[1]} alt="サブ1" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              ) : (
                <div style={{ background: '#f8fafc', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                  <span style={{ fontSize: 18 }}>📷</span>
                  <span style={{ fontSize: 10, color: '#cbd5e1', fontWeight: 600 }}>準備中</span>
                </div>
              )}
              {images[2] ? (
                <div style={{ position: 'relative' }}>
                  <img src={images[2]} alt="サブ2" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  {images.length > 3 && (
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 16, fontWeight: 800 }}>
                      +{images.length - 3}枚
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ background: '#f8fafc', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                  <span style={{ fontSize: 18 }}>📷</span>
                  <span style={{ fontSize: 10, color: '#cbd5e1', fontWeight: 600 }}>準備中</span>
                </div>
              )}
            </div>
          )}

          {/* 物件情報 */}
          <div style={{ padding: 16 }}>
            <p style={{ fontSize: 24, fontWeight: 900, color: '#c9a84c', margin: '0 0 6px' }}>{priceLabel}</p>
            <span style={{ display: 'inline-block', marginBottom: 8, padding: '4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 800, background: '#f1f5f9', color: '#14395b' }}>{dealLabel}</span>
            <h2 style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', margin: '0 0 12px', lineHeight: 1.4 }}>{property.title}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
              {address && <p style={{ fontSize: 13, color: '#475569', margin: 0 }}>📍 {address}</p>}
              {access && <p style={{ fontSize: 13, color: '#475569', margin: 0 }}>🚃 {access}</p>}
              {area && <p style={{ fontSize: 13, color: '#475569', margin: 0 }}>🏠 {area}</p>}
            </div>

            {/* 詳細テーブル */}
            {detailRows.length > 0 && (
              <>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#1a3a5c', margin: '0 0 8px' }}>■ 物件詳細</p>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <tbody>
                    {detailRows.map(r => (
                      <tr key={r.label} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '8px 4px', color: '#64748b', width: '40%' }}>{r.label}</td>
                        <td style={{ padding: '8px 4px', color: '#1e293b' }}>{r.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </div>
        </div>

        {/* フッター */}
        <div style={{ display: 'flex', gap: 10, padding: '12px 16px', paddingBottom: 'max(12px, env(safe-area-inset-bottom))', borderTop: '1px solid #f1f5f9', background: '#fff', flexShrink: 0 }}>
          <button onClick={() => { onClose(); onAIConsult(); }}
            style={{ flex: 1, height: 52, border: 'none', borderRadius: 12, background: '#1a3a5c', color: '#fff', fontSize: 15, fontWeight: 800, cursor: 'pointer' }}>
            🤖 AIに相談
          </button>
          <button onClick={() => { onClose(); onDM(); }}
            style={{ flex: 1, height: 52, borderRadius: 12, background: '#fff', color: '#1a3a5c', border: '2px solid #1a3a5c', fontSize: 15, fontWeight: 800, cursor: 'pointer' }}>
            ✉️ DMを送る
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ── 価格フォーマット ───────────────────────────────────
const formatPrice = (property) => {
  if ((property.deal_type === 'rent' || property.deal_type === '賃貸') && property.rent) {
    return `¥${Number(property.rent).toLocaleString()}/月`;
  }
  if (property.price) {
    return `${Number(property.price).toLocaleString()}万円`;
  }
  return '価格応相談';
};

// ── 業者詳細モーダル ──────────────────────────────────
function AgencyDetailModal({ agency, properties, onClose, onDM }) {
  return ReactDOM.createPortal(
    <div className="tt-overlay" onClick={onClose}>
      <div className="tt-sheet tt-agency-sheet" onClick={e => e.stopPropagation()}>
        <div className="tt-sheet-handle" />
        <div className="tt-sheet-header">
          <span>🏢 業者詳細</span>
          <button className="tt-sheet-close" onClick={onClose}>✕</button>
        </div>

        {/* 業者プロフィール */}
        <div className="tt-agency-profile-header">
          <div className="tt-agency-modal-avatar">{agency.initial}</div>
          <div className="tt-agency-modal-info">
            <div className="tt-agency-modal-name">{agency.name}</div>
            <div className="tt-agency-modal-count">掲載物件 {agency.count}件</div>
          </div>
          <button className="tt-follow-btn" style={{ flexShrink: 0 }}>
            {agency.followed ? "フォロー中" : "+ フォロー"}
          </button>
        </div>

        {/* 物件リスト */}
        <div className="tt-comment-list">
          <div className="tt-agency-props-label">掲載物件</div>
          {properties.slice(0, 4).map(p => (
            <div key={p.id} className="tt-agency-prop-item">
              <img src={p.image_url} alt={p.title} className="tt-agency-prop-img" />
              <div className="tt-agency-prop-info">
                <div className="tt-agency-prop-title">{p.title}</div>
                <div className="tt-agency-prop-price">{formatPrice(p)}</div>
                {p.station && <div className="tt-agency-prop-station">📍 {p.station}</div>}
              </div>
            </div>
          ))}
        </div>

        {/* DM送信ボタン */}
        <div className="tt-form" style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}>
          <button
            onClick={() => { onClose(); onDM?.(); }}
            style={{ width: '100%', height: 52, border: 'none', borderRadius: 999, background: '#14395b', color: '#fff', fontSize: 16, fontWeight: 800, cursor: 'pointer' }}
          >
            ✉️ DMで問い合わせ
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ── 1スライド ─────────────────────────────────────────
function TikTokSlide({ property, user, onDM, index, total }) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(property.likeCount ?? Math.floor(Math.random() * 40 + 5));
  const [showComments, setShowComments] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [showDM, setShowDM] = useState(false);
  const [showAgency, setShowAgency] = useState(false);

  const agencyData = SAMPLE_AGENCIES?.[0] ?? { id: 1, name: 'GINTETSU不動産', initial: 'G', count: 12, followed: false };

  const toggleLike = e => {
    e.stopPropagation();
    setLiked(v => !v);
    setLikeCount(n => liked ? n - 1 : n + 1);
  };

  const dealLabel = { rent: '賃貸', sale: '売買', '賃貸': '賃貸', '売買': '売買' }[property.deal_type] ?? property.deal_type
  const priceLabel = formatPrice(property)

  return (
    <section className="tiktok-slide">
      {/* 背景画像 */}
      <img className="tiktok-image" src={property.image_url} alt={property.title} loading="lazy" />

      {/* グラデーションオーバーレイ */}
      <div className="tiktok-overlay" />

      {/* 物件番号インジケーター */}
      {total > 1 && (
        <div style={{ position: 'absolute', top: 'max(56px, calc(env(safe-area-inset-top) + 56px))', right: 18, zIndex: 5, background: 'rgba(0,0,0,0.45)', color: '#fff', fontSize: 13, fontWeight: 700, padding: '4px 10px', borderRadius: 999, backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}>
          {index + 1}/{total}
        </div>
      )}

      {/* 物件情報（画像の上） */}
      <div className="tiktok-info">
        <div className="tiktok-badges">
          <span className={`tt-badge-type type-${dealLabel}`}>{dealLabel}</span>
          {property.ai_rank && <span className="tt-badge-ai">🤖 AI {property.ai_rank}</span>}
        </div>
        <h2 style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{property.title}</h2>
        <p className="price">{priceLabel}</p>
        {property.station && <p className="tt-station">📍 {property.station}</p>}
        {property.size && <p className="tt-size">🏠 {property.size}</p>}
      </div>

      {/* 右側アクションボタン */}
      <div className="tiktok-actions">
        <div className="tt-action-item">
          <button
            className="tt-action-btn tt-action-btn-agency"
            onClick={(e) => { e.stopPropagation(); setShowAgency(true); }}
            aria-label="業者情報"
          >
            <div className="tt-agency-mini-avatar">{agencyData.initial}</div>
          </button>
          <span className="tt-action-label">業者</span>
        </div>
        <div className="tt-action-item">
          <button
            className={`tt-action-btn${liked ? " liked" : ""}`}
            onClick={toggleLike}
            aria-label="お気に入り"
          >
            {liked ? "❤️" : "🤍"}
          </button>
          <span className="tt-action-label">保存</span>
        </div>
        <div className="tt-action-item">
          <button
            className="tt-action-btn"
            onClick={e => { e.stopPropagation(); setShowComments(true); }}
            aria-label="コメント"
          >
            💬
          </button>
          <span className="tt-action-label">質問</span>
        </div>
        <div className="tt-action-item">
          <button
            className="tt-action-btn tt-action-btn-ai"
            onClick={e => { e.stopPropagation(); setShowAI(true); }}
            aria-label="AI相談"
          >
            🤖
          </button>
          <span className="tt-action-label">相談</span>
        </div>
      </div>

      {/* 下部CTAボタン */}
      <button
        className="tiktok-detail"
        onClick={e => { e.stopPropagation(); setShowDetail(true); }}
      >
        詳細を見る →
      </button>

      {/* モーダル */}
      {showAgency && (
        <AgencyDetailModal
          agency={agencyData}
          properties={[property]}
          onClose={() => setShowAgency(false)}
          onDM={onDM}
        />
      )}
      {showComments && <CommentModal property={property} onClose={() => setShowComments(false)} user={user} />}
      {showAI && <AIModal property={property} onClose={() => setShowAI(false)} />}
      {showDetail && (
        <PropertyDetailModal
          property={property}
          onClose={() => setShowDetail(false)}
          onAIConsult={() => { setShowDetail(false); setShowAI(true); }}
          onDM={() => { setShowDetail(false); setShowDM(true); }}
        />
      )}
      {showDM && (
        <DMModal
          property={property}
          user={user}
          onClose={() => setShowDM(false)}
        />
      )}
    </section>
  );
}

// ── サンプル業者データ ────────────────────────────────
const SAMPLE_AGENCIES = [
  { id: 1, name: 'GINTETSU不動産', initial: 'G', count: 12, followed: true },
  { id: 2, name: '大宮不動産センター', initial: '大', count: 8, followed: false },
  { id: 3, name: 'さいたま住宅販売', initial: 'さ', count: 5, followed: false },
];

// ── サンプルデータ ────────────────────────────────────
const SAMPLE_PROPERTIES = [
  {
    id: 1, deal_type: "賃貸", ai_rank: "B+",
    title: "さいたま市 築浅賃貸アパート",
    price: null, rent: 85000,
    station: "大宮駅 徒歩8分", size: "1LDK / 42㎡",
    image_url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80",
    image_urls: [
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80",
    ],
    likeCount: 18, commentCount: 5,
  },
  {
    id: 2, deal_type: "売買", ai_rank: "A",
    title: "川口市 中古一戸建て",
    price: 3200, rent: null,
    station: "川口駅 徒歩12分", size: "4LDK / 95㎡",
    image_url: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80",
    image_urls: [
      "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80",
      "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800&q=80",
      "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80",
    ],
    likeCount: 24, commentCount: 8,
  },
  {
    id: 3, deal_type: "売買", ai_rank: "A+",
    title: "大宮駅徒歩3分 新築マンション",
    price: 4580, rent: null,
    station: "大宮駅 徒歩3分", size: "2LDK / 65㎡",
    image_url: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80",
    image_urls: [
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80",
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80",
    ],
    likeCount: 41, commentCount: 12,
  },
  {
    id: 4, deal_type: "売買", ai_rank: "B",
    title: "大宮区 収益マンション一棟",
    price: 12800, rent: null,
    station: "大宮駅 徒歩7分", size: "8世帯 / 1棟",
    image_url: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80",
    image_urls: [
      "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80",
      "https://images.unsplash.com/photo-1460317442991-0ec209397118?w=800&q=80",
    ],
    likeCount: 33, commentCount: 7, yield: "5.8",
  },
  {
    id: 5, deal_type: "賃貸", ai_rank: "B+",
    title: "浦和区 駅近リノベ物件",
    price: null, rent: 65000,
    station: "浦和駅 徒歩5分", size: "1K / 28㎡",
    image_url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80",
    image_urls: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80",
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80",
    ],
    likeCount: 27, commentCount: 4,
  },
];

// ── メインエクスポート ─────────────────────────────────
export default function TikTokPropertyFeed({ properties, user, onDM, onNavigate }) {
  const [filter, setFilter] = useState("すべて");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [searchQuery, setSearchQuery] = useState('');
  const [agencies, setAgencies] = useState(SAMPLE_AGENCIES);
  const [selectedAgency, setSelectedAgency] = useState(null);
  const [showSidebarAI, setShowSidebarAI] = useState(false);
  const [aiConsultProperty, setAiConsultProperty] = useState(null);
  const feedRef = useRef(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleFollow = (id) => {
    setAgencies(prev => prev.map(a => a.id === id ? { ...a, followed: !a.followed } : a));
  };

  const allProperties = properties?.length > 0 ? properties : SAMPLE_PROPERTIES;
  const data = allProperties
    .filter(p => {
      if (filter === "すべて") return true;
      if (filter === "売買") return p.deal_type === 'sale' || p.deal_type === '売買';
      if (filter === "賃貸") return p.deal_type === 'rent' || p.deal_type === '賃貸';
      if (filter === "投資") return p.deal_type === 'investment' || (p.property_type && p.property_type.includes('投資'));
      return true;
    })
    .filter(p => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        p.title?.toLowerCase().includes(q) ||
        p.address?.toLowerCase().includes(q) ||
        p.station?.toLowerCase().includes(q) ||
        JSON.stringify(p.details || {}).toLowerCase().includes(q)
      );
    });

  if (!isMobile) {
    return (
      <div className="tt-pc-wrapper">
        {/* 左余白（ダーク） */}
        <div className="tt-pc-left" />

        {/* 中央：縦長フィード */}
        <div className="tt-pc-center">
          {/* フィルターバー */}
          <div className="tt-filter-bar tt-filter-bar-pc">
            <button className="tt-back-btn" onClick={() => onNavigate?.('home')}>← 戻る</button>
            {["すべて", "売買", "賃貸", "投資"].map(f => (
              <button key={f} className={`tt-filter-btn${filter === f ? " active" : ""}`} onClick={() => setFilter(f)}>{f}</button>
            ))}
          </div>
          {/* フィード本体 */}
          <div className="tiktok-feed tt-feed-pc" ref={feedRef}>
            {data.length === 0
              ? <div className="tt-empty">該当する物件がありません</div>
              : data.map((p, i) => <TikTokSlide key={p.id} property={p} user={user} onDM={onDM} index={i} total={data.length} />)
            }
          </div>
        </div>

        {/* 右サイドバー */}
        <div className="tt-pc-sidebar">
          {/* 検索バー */}
          <div className="tt-sidebar-section">
            <div className="tt-sidebar-label">物件を探す</div>
            <input
              className="tt-search-input"
              placeholder="🔍 エリア・駅名・物件名"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ fontSize: 16 }}
            />
          </div>

          {/* フィルター */}
          <div className="tt-sidebar-section">
            <div className="tt-sidebar-label">絞り込み</div>
            <div className="tt-sidebar-filters">
              {["すべて", "売買", "賃貸", "投資"].map(f => (
                <button key={f} className={`tt-sidebar-filter-btn${filter === f ? " active" : ""}`} onClick={() => setFilter(f)}>{f}</button>
              ))}
            </div>
          </div>

          {/* フォロー中の業者 */}
          <div className="tt-sidebar-section">
            <div className="tt-sidebar-label">業者をフォロー</div>
            <div className="tt-agency-list">
              {agencies.map(a => (
                <div key={a.id} className="tt-agency-item" style={{ cursor: 'pointer' }} onClick={() => setSelectedAgency(a)}>
                  <div className="tt-agency-avatar">{a.initial}</div>
                  <div className="tt-agency-info">
                    <div className="tt-agency-name">{a.name}</div>
                    <div className="tt-agency-count">物件{a.count}件</div>
                  </div>
                  <button
                    className={`tt-follow-btn${a.followed ? " followed" : ""}`}
                    onClick={() => toggleFollow(a.id)}
                  >
                    {a.followed ? "フォロー中" : "+ フォロー"}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* AI相談CTA */}
          <div className="tt-sidebar-ai">
            <div className="tt-sidebar-ai-icon">🤖</div>
            <div className="tt-sidebar-ai-title">AI不動産相談</div>
            <div className="tt-sidebar-ai-sub">価格・利回り・ローンを無料診断</div>
            <button className="tt-sidebar-ai-btn" onClick={() => { const first = data[0]; if (first) { setAiConsultProperty(first); setShowSidebarAI(true); } }}>無料で相談する</button>
          </div>
        </div>

        {/* 業者詳細・AI相談モーダル */}
        {selectedAgency && (
          <AgencyDetailModal
            agency={selectedAgency}
            properties={data}
            onClose={() => setSelectedAgency(null)}
            onDM={onDM}
          />
        )}
        {showSidebarAI && aiConsultProperty && (
          <AIModal
            property={aiConsultProperty}
            onClose={() => { setShowSidebarAI(false); setAiConsultProperty(null); }}
          />
        )}

        {/* 右余白（ダーク） */}
        <div className="tt-pc-right" />
      </div>
    );
  }

  return (
    <>
      {/* フィルターバー（フィードの外・絶対配置） */}
      <div className="tt-filter-bar">
        <button className="tt-back-btn" onClick={() => onNavigate?.('home')}>← 戻る</button>
        {["すべて", "売買", "賃貸", "投資"].map(f => (
          <button
            key={f}
            className={`tt-filter-btn${filter === f ? " active" : ""}`}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      {/* TikTokフィード本体 */}
      <div className="tiktok-feed">
        {data.length === 0
          ? <div className="tt-empty">該当する物件がありません</div>
          : data.map((p, i) => <TikTokSlide key={p.id} property={p} user={user} onDM={onDM} index={i} total={data.length} />)
        }
      </div>
    </>
  );
}
