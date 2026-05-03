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
      <div className="tt-sheet" style={{ position: 'relative' }} onClick={e => e.stopPropagation()}>
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
              <textarea className="tt-textarea" placeholder="コメントを入力…（個人情報・営業投稿は禁止）" value={text} onChange={e => setText(e.target.value)} rows={2} style={{ fontSize: 16 }} />
              <button className="tt-send" onClick={submit} disabled={!text.trim()}>送信</button>
            </div>
          </div>
        ) : (
          <div className="tt-form" style={{ textAlign: 'center', padding: '20px 16px' }}>
            <p style={{ fontSize: 13, color: '#64748b', marginBottom: 12 }}>コメントするにはログインが必要です</p>
            <button
              style={{ background: '#1a3a5c', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 32px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
              onClick={() => { onClose(); window.dispatchEvent(new CustomEvent('navigate', { detail: { tab: 'member' } })); }}
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

  const send = useCallback(async () => {
    if (!input.trim() || loading) return;
    const q = input.trim();
    setInput("");
    setMsgs(p => [...p, { role: "user", text: q }]);
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    setMsgs(p => [...p, { role: "ai", text: aiReply(q, property) }]);
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
              <div className="tt-ai-bubble">{m.text}</div>
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
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }} />
            <button className="tt-send" onClick={send} disabled={!input.trim() || loading}>送信</button>
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
  const touchStartX = useRef(null);

  const images = Array.isArray(property.image_urls) && property.image_urls.length > 0
    ? property.image_urls
    : property.image_url
      ? [property.image_url]
      : [];

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
      <div className="pd-modal" onClick={e => e.stopPropagation()}>
        {/* ヘッダー */}
        <div className="pd-header">
          <button className="pd-close-btn" onClick={onClose}>✕</button>
          <span className="pd-header-title">{property.title}</span>
          <button className="pd-share-btn"
            onClick={() => navigator.share?.({ title: property.title, url: window.location.href })}>
            ↗️
          </button>
        </div>

        {/* スクロールエリア */}
        <div className="pd-scroll">
          {/* 写真スライダー */}
          {images.length > 0 && (
            <>
              <div className="pd-slider"
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
                <img className="pd-slider-img" src={images[imgIdx]} alt={property.title} />
                {images.length > 1 && (
                  <>
                    <button className="pd-slider-btn prev"
                      onClick={() => setImgIdx(i => (i - 1 + images.length) % images.length)}>‹</button>
                    <button className="pd-slider-btn next"
                      onClick={() => setImgIdx(i => (i + 1) % images.length)}>›</button>
                  </>
                )}
              </div>
              {images.length > 1 && (
                <div className="pd-dots">
                  {images.map((_, i) => (
                    <div key={i} className={`pd-dot${i === imgIdx ? ' active' : ''}`} />
                  ))}
                </div>
              )}
            </>
          )}

          {/* 物件基本情報 */}
          <div className="pd-body">
            <p className="pd-price">{priceLabel}</p>
            <span className={`tt-badge-type type-${dealLabel}`} style={{ marginBottom: 8, display: 'inline-block' }}>{dealLabel}</span>
            <h2 className="pd-title">{property.title}</h2>
            <div className="pd-meta-list">
              {address && <p className="pd-meta-item">📍 {address}</p>}
              {access && <p className="pd-meta-item">🚃 {access}</p>}
              {area && <p className="pd-meta-item">🏠 {area}</p>}
            </div>

            {/* 物件詳細テーブル */}
            {detailRows.length > 0 && (
              <>
                <p className="pd-section-title">■ 物件詳細</p>
                <table className="pd-detail-table">
                  <tbody>
                    {detailRows.map(r => (
                      <tr key={r.label}>
                        <td>{r.label}</td>
                        <td>{r.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </div>
        </div>

        {/* 固定フッター */}
        <div className="pd-footer">
          <button className="pd-btn-ai" onClick={() => { onClose(); onAIConsult(); }}>🤖 AIに相談</button>
          <button className="pd-btn-dm" onClick={() => { onClose(); onDM(); }}>✉️ DMを送る</button>
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

// ── 1スライド ─────────────────────────────────────────
function TikTokSlide({ property, user, onDM, index, total }) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(property.likeCount ?? Math.floor(Math.random() * 40 + 5));
  const [showComments, setShowComments] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [showDM, setShowDM] = useState(false);

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

// ── サンプルデータ ────────────────────────────────────
const SAMPLE_PROPERTIES = [
  {
    id: 1, deal_type: "賃貸", ai_rank: "B+",
    title: "さいたま市 築浅賃貸アパート",
    price: null, rent: 85000,
    station: "大宮駅 徒歩8分", size: "1LDK / 42㎡",
    image_url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80",
    likeCount: 18, commentCount: 5,
  },
  {
    id: 2, deal_type: "売買", ai_rank: "A",
    title: "川口市 中古一戸建て",
    price: 3200, rent: null,
    station: "川口駅 徒歩12分", size: "4LDK / 95㎡",
    image_url: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80",
    likeCount: 24, commentCount: 8,
  },
  {
    id: 3, deal_type: "売買", ai_rank: "A+",
    title: "大宮駅徒歩3分 新築マンション",
    price: 4580, rent: null,
    station: "大宮駅 徒歩3分", size: "2LDK / 65㎡",
    image_url: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80",
    likeCount: 41, commentCount: 12,
  },
  {
    id: 4, deal_type: "売買", ai_rank: "B",
    title: "大宮区 収益マンション一棟",
    price: 12800, rent: null,
    station: "大宮駅 徒歩7分", size: "8世帯 / 1棟",
    image_url: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80",
    likeCount: 33, commentCount: 7, yield: "5.8",
  },
  {
    id: 5, deal_type: "賃貸", ai_rank: "B+",
    title: "浦和区 駅近リノベ物件",
    price: null, rent: 65000,
    station: "浦和駅 徒歩5分", size: "1K / 28㎡",
    image_url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80",
    likeCount: 27, commentCount: 4,
  },
];

// ── メインエクスポート ─────────────────────────────────
export default function TikTokPropertyFeed({ properties, user, onDM, onNavigate }) {
  const [filter, setFilter] = useState("すべて");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const data = (properties?.length > 0 ? properties : SAMPLE_PROPERTIES).filter(p => {
    if (filter === "すべて") return true
    if (filter === "売買") return p.deal_type === 'sale' || p.deal_type === '売買'
    if (filter === "賃貸") return p.deal_type === 'rent' || p.deal_type === '賃貸'
    if (filter === "投資") return p.deal_type === 'investment' || (p.property_type && p.property_type.includes('投資'))
    return true
  });

  return (
    <>
      {/* フィルターバー（フィードの外・絶対配置） */}
      <div className="tt-filter-bar">
        {!isMobile && (
          <button className="tt-back-btn" onClick={() => onNavigate?.('home')}>← 戻る</button>
        )}
        {isMobile && (
          <button className="tt-home-btn" onClick={() => onNavigate?.('home')}>🏠</button>
        )}
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
