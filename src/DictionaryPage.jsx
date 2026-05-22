import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Search, ChevronDown, ChevronUp } from 'lucide-react';

const NAVY = '#1a3a5c';
const BG = '#F7F9FC';

const CATEGORIES = [
  {
    id: 'contract',
    label: '契約・取引',
    color: '#3b82f6',
    terms: [
      { term: 'クーリング・オフ', reading: 'くーりんぐおふ', desc: '契約締結後、一定期間内に無条件で契約を解除できる制度。事務所等以外の場所で契約した場合に適用される。' },
      { term: '手付金', reading: 'てつけきん', desc: '契約締結時に買主が売主に交付する金銭。解約手付・証約手付・違約手付の3種類がある。' },
      { term: '解約手付', reading: 'かいやくてつけ', desc: '買主は手付金を放棄、売主は手付金の倍額を返還することで契約を解除できる手付。' },
      { term: '媒介契約', reading: 'ばいかいけいやく', desc: '不動産の売買・賃貸の仲介を宅建業者に依頼する契約。一般・専任・専属専任の3種類がある。' },
      { term: '専属専任媒介契約', reading: 'せんぞくせんにんばいかいけいやく', desc: '1社のみに仲介を依頼し、自己発見取引も禁止される最も拘束力の強い媒介契約。' },
      { term: '重要事項説明', reading: 'じゅうようじこうせつめい', desc: '契約締結前に宅建士が買主・借主に対して物件の重要な情報を書面で説明する義務。' },
      { term: '37条書面', reading: 'さんじゅうななじょうしょめん', desc: '契約締結後に交付が義務付けられている書面。契約内容を記載した書類。' },
      { term: '瑕疵担保責任', reading: 'かしたんぽせきにん', desc: '引き渡した物件に隠れた欠陥があった場合に売主が負う責任。現在は契約不適合責任に統一。' },
      { term: '契約不適合責任', reading: 'けいやくふてきごうせきにん', desc: '売買した物件が契約の内容に適合しない場合に売主が負う責任。旧瑕疵担保責任に代わる制度。' },
      { term: '停止条件', reading: 'ていしじょうけん', desc: '一定の条件が成就した時点から法律行為の効力が発生する条件。住宅ローン特約等が代表例。' },
    ],
  },
  {
    id: 'registration',
    label: '登記・権利',
    color: '#8b5cf6',
    terms: [
      { term: '所有権移転登記', reading: 'しょゆうけんいてんとうき', desc: '不動産の所有者が変わった際に行う登記。売買・相続・贈与等の際に必要。' },
      { term: '抵当権', reading: 'ていとうけん', desc: '債務の担保として不動産を提供する権利。返済できない場合に競売にかけられる。' },
      { term: '根抵当権', reading: 'ねていとうけん', desc: '一定の範囲の不特定の債権を極度額の限度で担保する抵当権。' },
      { term: '地上権', reading: 'ちじょうけん', desc: '他人の土地を使用する物権。建物所有・竹木栽培等を目的とする。賃借権より強い権利。' },
      { term: '地役権', reading: 'ちえきけん', desc: '他人の土地を自己の土地の便益のために利用できる権利。通行地役権が代表例。' },
      { term: '借地権', reading: 'しゃくちけん', desc: '建物所有を目的とする地上権または土地賃借権の総称。' },
      { term: '区分所有権', reading: 'くぶんしょゆうけん', desc: 'マンション等の一棟の建物を区分して所有する権利。区分所有法が適用される。' },
      { term: '共有', reading: 'きょうゆう', desc: '一つの物を複数人が持分で所有すること。処分には全員の同意が必要。' },
      { term: '仮登記', reading: 'かりとうき', desc: '本登記のための権利保全を目的とする登記。本登記の順位を保全する効力がある。' },
      { term: '乙区', reading: 'おつく', desc: '登記記録の権利部のうち、所有権以外の権利（抵当権・地上権等）を記録する欄。' },
    ],
  },
  {
    id: 'tax',
    label: '税金・費用',
    color: '#f59e0b',
    terms: [
      { term: '不動産取得税', reading: 'ふどうさんしゅとくぜい', desc: '不動産を取得した際に課される都道府県税。取得後3〜6ヶ月以内に納付書が届く。' },
      { term: '固定資産税', reading: 'こていしさんぜい', desc: '毎年1月1日時点の不動産所有者に課される市町村税。標準税率は1.4%。' },
      { term: '都市計画税', reading: 'としけいかくぜい', desc: '市街化区域内の土地・建物に課される税。固定資産税と合わせて納付。上限0.3%。' },
      { term: '譲渡所得税', reading: 'じょうとしょとくぜい', desc: '不動産を売却して利益が出た場合に課される税。所有期間5年超で長期・以下で短期。' },
      { term: '印紙税', reading: 'いんしぜい', desc: '売買契約書等の課税文書に課される税。契約金額に応じて税額が決まる。' },
      { term: '登録免許税', reading: 'とうろくめんきょぜい', desc: '登記を行う際に課される国税。所有権移転は固定資産税評価額の2%等。' },
      { term: '仲介手数料', reading: 'ちゅうかいてすうりょう', desc: '宅建業者に支払う報酬。売買では物件価格の3%+6万円（税別）が上限。' },
      { term: '敷金', reading: 'しききん', desc: '賃貸借契約時に借主が家主に預ける金銭。退去時に原状回復費用を差し引いて返還される。' },
    ],
  },
  {
    id: 'law',
    label: '法令・規制',
    color: '#10b981',
    terms: [
      { term: '用途地域', reading: 'ようとちいき', desc: '都市計画法に基づき、土地の用途を規制するために定められた地域。13種類がある。' },
      { term: '建ぺい率', reading: 'けんぺいりつ', desc: '敷地面積に対する建築面積の割合。用途地域ごとに上限が定められている。' },
      { term: '容積率', reading: 'ようせきりつ', desc: '敷地面積に対する延べ床面積の割合。用途地域ごとに上限が定められている。' },
      { term: '建築確認', reading: 'けんちくかくにん', desc: '建築工事着工前に建築主事等が建築基準法への適合を確認する手続き。' },
      { term: '開発許可', reading: 'かいはつきょか', desc: '市街化調整区域等で一定規模以上の開発行為を行う場合に必要な許可。' },
      { term: '市街化区域', reading: 'しがいかくいき', desc: '既に市街地を形成している区域と、おおむね10年以内に優先的に市街化を図る区域。' },
      { term: '市街化調整区域', reading: 'しがいかちょうせいくいき', desc: '市街化を抑制すべき区域。原則として建築物の建築が制限される。' },
      { term: '農地転用', reading: 'のうちてんよう', desc: '農地を農地以外の用途に変更すること。農地法による許可が必要。' },
      { term: '日影規制', reading: 'にちえいきせい', desc: '隣接する土地への日照を確保するため、建物が落とす影の時間を規制するもの。' },
    ],
  },
  {
    id: 'loan',
    label: 'ローン・金融',
    color: '#ef4444',
    terms: [
      { term: 'フラット35', reading: 'ふらっとさんじゅうご', desc: '住宅金融支援機構と民間金融機関が提携した最長35年の固定金利住宅ローン。' },
      { term: '変動金利', reading: 'へんどうきんり', desc: '半年ごとに金利が見直される金利タイプ。一般的に固定より低いが将来の返済額が不確定。' },
      { term: '元利均等返済', reading: 'がんりきんとうへんさい', desc: '毎月の返済額が一定の返済方式。元金と利息の合計が変わらない。' },
      { term: '元金均等返済', reading: 'がんきんきんとうへんさい', desc: '毎月の元金返済額が一定の返済方式。当初返済額が多いが総支払利息が少ない。' },
      { term: '団体信用生命保険', reading: 'だんたいしんようせいめいほけん', desc: '住宅ローン契約者が死亡・高度障害になった場合にローン残高が支払われる保険。' },
      { term: 'LTV', reading: 'えるてぃーぶい', desc: 'Loan To Valueの略。物件価格に対するローン借入額の比率。低いほど審査に有利。' },
      { term: '繰上返済', reading: 'くりあげへんさい', desc: '通常の返済とは別に元金を一括返済すること。期間短縮型と返済額軽減型がある。' },
    ],
  },
  {
    id: 'business',
    label: '宅建業法',
    color: '#6366f1',
    terms: [
      { term: '宅地建物取引士', reading: 'たくちたてものとりひきし', desc: '不動産取引の専門家として国家資格。重要事項説明・記名押印が独占業務。' },
      { term: '宅地建物取引業', reading: 'たくちたてものとりひきぎょう', desc: '宅地・建物の売買・交換・賃貸の代理・媒介を業として行うこと。免許が必要。' },
      { term: '免許換え', reading: 'めんきょがえ', desc: '事務所を増設・移転した際に免許権者が変わる場合に必要な手続き。' },
      { term: '営業保証金', reading: 'えいぎょうほしょうきん', desc: '宅建業者が供託する保証金。本店1000万円・支店1店につき500万円。' },
      { term: '保証協会', reading: 'ほしょうきょうかい', desc: '宅建業者が加入できる協会。弁済業務保証金分担金を納付することで営業保証金の代替となる。' },
      { term: '専任の宅建士', reading: 'せんにんのたくけんし', desc: '事務所ごとに必置の宅建士。従業者5人につき1人以上の設置が必要。' },
      { term: 'クーリング・オフ（宅建業法）', reading: 'くーりんぐおふたくけんぎょうほう', desc: '事務所等以外の場所で買受申込みをした場合、書面で申込み撤回・契約解除できる制度。' },
    ],
  },
];

const TOTAL_TERMS = CATEGORIES.reduce((sum, c) => sum + c.terms.length, 0);

export default function DictionaryPage({ onBack }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [expandedTerm, setExpandedTerm] = useState(null);

  const filtered = useMemo(() => {
    const base = activeCategory === 'all'
      ? CATEGORIES
      : CATEGORIES.filter((c) => c.id === activeCategory);
    if (!searchQuery) return base;
    const q = searchQuery;
    return base
      .map((cat) => ({
        ...cat,
        terms: cat.terms.filter(
          (t) => t.term.includes(q) || t.reading.includes(q) || t.desc.includes(q)
        ),
      }))
      .filter((cat) => cat.terms.length > 0);
  }, [searchQuery, activeCategory]);

  const filteredCount = filtered.reduce((sum, c) => sum + c.terms.length, 0);

  const toggleTerm = (key) => {
    setExpandedTerm(expandedTerm === key ? null : key);
  };

  return (
    <div style={{ minHeight: '100vh', background: BG, paddingBottom: '80px' }}>
      <button
        type="button"
        onClick={onBack}
        style={{
          position: 'fixed',
          top: '24px',
          left: '24px',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 20px',
          borderRadius: '999px',
          border: '1px solid #E5E7EB',
          background: 'white',
          color: '#374151',
          fontSize: '14px',
          fontWeight: 600,
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          fontFamily: 'inherit',
        }}
      >
        <ChevronLeft size={16} />
        戻る
      </button>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '80px 20px 0' }}>
        {/* ヘッダー */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '8px' }}>
            <img src="/logo.png" alt="House-AI" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
            <h1 style={{ fontSize: '32px', fontWeight: 700, color: NAVY, margin: 0 }}>宅建用語集</h1>
          </div>
          <p style={{ color: '#6B7280', fontSize: '15px', margin: 0 }}>不動産取引の重要用語をカテゴリ別に整理</p>
        </div>

        {/* 検索バー */}
        <div style={{ position: 'relative', marginBottom: '24px', display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} color="#9CA3AF" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setExpandedTerm(null); }}
              placeholder="用語・読み・説明で検索..."
              style={{
                width: '100%',
                fontSize: '16px',
                padding: '12px 16px 12px 44px',
                borderRadius: '12px',
                border: '1px solid #E5E7EB',
                background: 'white',
                color: '#111827',
                outline: 'none',
                boxSizing: 'border-box',
                fontFamily: 'inherit',
              }}
            />
          </div>
          <div style={{
            flexShrink: 0,
            padding: '8px 16px',
            borderRadius: '999px',
            background: NAVY,
            color: 'white',
            fontSize: '13px',
            fontWeight: 600,
            whiteSpace: 'nowrap',
          }}>
            {searchQuery ? `${filteredCount} / ${TOTAL_TERMS}件` : `全${TOTAL_TERMS}件`}
          </div>
        </div>

        {/* カテゴリタブ */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', marginBottom: '32px', WebkitOverflowScrolling: 'touch' }}>
          {[{ id: 'all', label: 'すべて', color: NAVY }, ...CATEGORIES].map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => { setActiveCategory(cat.id); setExpandedTerm(null); }}
                style={{
                  flexShrink: 0,
                  padding: '8px 18px',
                  borderRadius: '999px',
                  border: isActive ? 'none' : '1px solid #E5E7EB',
                  background: isActive ? NAVY : 'white',
                  color: isActive ? 'white' : '#374151',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  fontFamily: 'inherit',
                  whiteSpace: 'nowrap',
                }}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* 用語リスト */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9CA3AF', fontSize: '15px' }}>
            該当する用語が見つかりませんでした
          </div>
        ) : (
          filtered.map((cat) => (
            <div key={cat.id} style={{ marginBottom: '40px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <div style={{ width: '6px', height: '24px', borderRadius: '3px', background: cat.color }} />
                <span style={{ fontSize: '16px', fontWeight: 700, color: NAVY }}>{cat.label}</span>
                <span style={{ fontSize: '13px', color: '#9CA3AF' }}>{cat.terms.length}件</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {cat.terms.map((t) => {
                  const key = `${cat.id}-${t.term}`;
                  const isExpanded = expandedTerm === key;
                  return (
                    <div
                      key={key}
                      style={{
                        background: 'white',
                        borderRadius: '16px',
                        border: isExpanded ? `1px solid ${cat.color}40` : '1px solid #E5E7EB',
                        overflow: 'hidden',
                        transition: 'border-color 0.2s ease',
                        boxShadow: isExpanded ? `0 4px 20px ${cat.color}18` : '0 1px 4px rgba(0,0,0,0.04)',
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => toggleTerm(key)}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0',
                          padding: '0',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          textAlign: 'left',
                          fontFamily: 'inherit',
                        }}
                      >
                        <div style={{ width: '4px', alignSelf: 'stretch', background: cat.color, flexShrink: 0, borderRadius: '0' }} />
                        <div style={{ flex: 1, padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                          <div>
                            <div style={{ fontSize: '16px', fontWeight: 700, color: '#111827', marginBottom: '2px' }}>{t.term}</div>
                            <div style={{ fontSize: '12px', color: '#6B7280' }}>{t.reading}</div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                            {isExpanded ? (
                              <span style={{ fontSize: '11px', color: cat.color, fontWeight: 600 }}>閉じる</span>
                            ) : null}
                            {isExpanded ? (
                              <ChevronUp size={16} color={cat.color} />
                            ) : (
                              <ChevronDown size={16} color="#9CA3AF" />
                            )}
                          </div>
                        </div>
                      </button>

                      <AnimatePresence initial={false}>
                        {isExpanded ? (
                          <motion.div
                            key="desc"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.22, ease: 'easeInOut' }}
                            style={{ overflow: 'hidden' }}
                          >
                            <div style={{
                              padding: '12px 20px 20px 24px',
                              borderTop: `1px solid ${cat.color}20`,
                              color: '#374151',
                              fontSize: '14px',
                              lineHeight: 1.75,
                            }}>
                              {t.desc}
                            </div>
                          </motion.div>
                        ) : null}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
