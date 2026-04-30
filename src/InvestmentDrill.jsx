import { useState, useEffect } from 'react'
import { AffiliateCard } from './AffiliateCard'

const C = {
  navy: '#1a3a5c',
  gold: '#c9a84c',
  bg: '#F4F7FB',
  card: '#ffffff',
  title: '#102A43',
  desc: '#5C677D',
  border: '#E2E8F0',
  green: '#27500A',
  greenBg: '#EAF3DE',
  greenBorder: '#97C459',
  amber: '#633806',
  amberBg: '#FAEEDA',
  amberBorder: '#EF9F27',
  red: '#501313',
  redBg: '#FCEBEB',
}

// ============================================================
// 問題データ（レベル1〜4）
// ============================================================
const QUESTIONS = [
  // レベル1 基礎
  {
    lv: 1, lvLabel: 'レベル1 — 基礎', stars: 1,
    text: '利回り5%の物件があります。あなたはどう判断しますか？',
    choices: ['安全と判断して即購入する', '空室リスクや立地を確認してから判断する', '利回りが低すぎるので却下する'],
    answer: 1,
    ok: 'その判断は正解です👍\n利回りだけでなく空室リスクや立地も確認することが重要です。この慎重さが長期的な成功につながります。',
    ng: '惜しいです！\n利回りの数字だけで判断するのは危険です。\n・空室率は何%か\n・立地・駅距離は\n・築年数と修繕リスクは\nこれらをセットで確認しましょう。',
  },
  {
    lv: 1, lvLabel: 'レベル1 — 基礎', stars: 1,
    text: '「表面利回り」と「実質利回り」の違いは何ですか？',
    choices: ['同じ意味なので違いはない', '表面は管理費込み、実質は家賃のみ', '表面は経費抜き、実質は経費を引いた手残り'],
    answer: 2,
    ok: '正解です👍\n表面利回り＝年間家賃÷物件価格\n実質利回り＝（家賃−経費）÷物件価格\n実質のほうが投資の本当の収益力を示します。',
    ng: '惜しいです！\n・表面利回り：年間家賃÷物件価格（経費抜き）\n・実質利回り：管理費・固定資産税などを引いた手残り\n実質が低い物件は要注意です。',
  },
  {
    lv: 1, lvLabel: 'レベル1 — 基礎', stars: 1,
    text: '駅徒歩20分と徒歩5分、同じ利回りならどちらが有利？',
    choices: ['20分（安く買える可能性がある）', '5分（空室リスクが低い）', 'どちらも同じ'],
    answer: 1,
    ok: '正解です👍\n駅近は入居需要が安定するため空室リスクが低く、長期的に有利です。同じ利回りなら迷わず駅近を選びましょう。',
    ng: '惜しいです！\n駅近のほうが入居需要が高く空室リスクが低いため、同じ利回りなら5分のほうが有利です。安く買えても空室が多いと赤字になることも。',
  },
  // レベル2 判断
  {
    lv: 2, lvLabel: 'レベル2 — 判断', stars: 2,
    text: '1000万円の物件で年間家賃収入が80万円です。表面利回りはいくらですか？',
    choices: ['6%', '8%', '10%'],
    answer: 1,
    ok: '正解です👍\n80万 ÷ 1000万 × 100 = 8%\n表面利回りの計算がしっかりできています。',
    ng: '惜しいです！\n年間収入 ÷ 物件価格 × 100 = 利回りです。\n80万 ÷ 1000万 × 100 = 8%が正解です。\n計算式を覚えておきましょう。',
  },
  {
    lv: 2, lvLabel: 'レベル2 — 判断', stars: 2,
    text: '空室率20%の物件と5%の物件、同じ利回りならどちらが収益性が高い？',
    choices: ['20%（利回りが高いから問題ない）', '5%（安定収入が見込める）', 'どちらも変わらない'],
    answer: 1,
    ok: 'その通りです👍\n空室率が低いほど実質収入が安定します。高利回りでも空室が多いと意味がありません。空室率は必ず確認しましょう。',
    ng: '惜しいです！\n空室率20%は収入が不安定になります。\n実質利回り＝表面利回り×（1−空室率）\n20%空室なら収入は80%しか得られません。',
  },
  {
    lv: 2, lvLabel: 'レベル2 — 判断', stars: 2,
    text: '築30年の物件と築5年の物件、投資として注意すべき点は？',
    choices: ['築30年のほうが安く利回りが高いので有利', '築30年は修繕費・空室リスクが高い', '築年数は関係ない'],
    answer: 1,
    ok: '正解です👍\n築古物件は大規模修繕（外壁・給排水）が近い場合があります。修繕費を利回りから引いた実質収益を必ず計算しましょう。',
    ng: '惜しいです！\n築古物件のリスク：\n・大規模修繕が必要なケースが多い\n・入居者が集まりにくい\n・融資がつきにくい\n利回りが高くても手残りが少ない可能性があります。',
  },
  // レベル3 実践
  {
    lv: 3, lvLabel: 'レベル3 — 実践', stars: 3,
    text: '大宮駅5分・築10年・利回り7%の1LDKマンション。あなたの判断は？',
    choices: ['条件が良いので即購入を検討する', '修繕積立金・管理費を確認してから判断する', '利回り7%は低いので見送る'],
    answer: 1,
    ok: '素晴らしい判断です👍\n修繕積立金と管理費を確認することで実質利回りが変わります。大宮駅5分・築10年は好条件ですが、手残りを必ず計算しましょう。',
    ng: '惜しいです！\n駅5分・築10年・7%は好条件ですが、まず修繕積立金と管理費を確認しましょう。\n・修繕積立金が高いと実質利回りが下がる\n・管理費が割高な場合もある\n数字を揃えてから判断するのが正解です。',
  },
  {
    lv: 3, lvLabel: 'レベル3 — 実践', stars: 3,
    text: '利回り10%の物件と利回り6%の物件、どちらが良い投資か？',
    choices: ['10%（利回りが高いほど良い）', '状況による（立地・空室・築年数で変わる）', '6%（安全側を選ぶ）'],
    answer: 1,
    ok: 'その通りです👍\n利回りが高い物件はリスクも高い傾向があります。\n・地方・築古・空室リスク高い場合が多い\n利回りだけで判断せず、総合的に評価することが重要です。',
    ng: '惜しいです！\n利回り10%が必ずしも良いわけではありません。\n高利回りの理由を確認しましょう：\n・地方立地で需要が低い\n・築古で修繕リスクが高い\n・既に空室が多い\nリスクとセットで考えることが重要です。',
  },
  {
    lv: 3, lvLabel: 'レベル3 — 実践', stars: 3,
    text: 'キャッシュフローを最大化するために最も重要な要素は？',
    choices: ['高い表面利回り', '低い空室率と適正な管理コスト', '新築・築浅物件であること'],
    answer: 1,
    ok: '正解です👍\nキャッシュフロー＝収入−（ローン返済+管理費+修繕費）\n空室率が低く管理コストが適正であることが最重要です。',
    ng: '惜しいです！\nキャッシュフローを最大化するには：\n・低空室率で安定収入\n・管理コストの最適化\n・ローン返済を適正に設計すること\nが重要です。表面利回りより実質の手残りを見ましょう。',
  },
  // レベル4 プロ
  {
    lv: 4, lvLabel: 'レベル4 — プロ', stars: 4,
    text: 'さいたま市大宮区で一棟アパートを検討中。最重要確認事項は？',
    choices: ['利回りと物件価格のみ', 'エリアの人口動態・空室率・競合物件数', '見た目のきれいさと設備'],
    answer: 1,
    ok: 'プロ級の判断です👍\n大宮エリアは再開発進行中で人口流入が続いています。競合物件数と平均空室率を調べることで需給バランスが分かります。',
    ng: '惜しいです！\nプロが確認するポイント：\n・人口動態（増加/減少エリアか）\n・平均空室率（5%以下が理想）\n・競合物件数と築年数分布\nこれらがキャッシュフローを左右します。',
  },
  {
    lv: 4, lvLabel: 'レベル4 — プロ', stars: 4,
    text: '長期投資（20年）で最も重要な出口戦略は？',
    choices: ['高値で売ることだけを考える', '売却・賃貸継続・リノベの3択を常に持つ', '出口は考えなくてよい'],
    answer: 1,
    ok: '完璧な判断です👍\n出口戦略を最初から考えることがプロの投資家の条件です。\n市場環境に応じて3つの選択肢を持つことでリスクを最小化できます。',
    ng: '惜しいです！\nプロの出口戦略：\n・売却（キャピタルゲイン狙い）\n・賃貸継続（インカムゲイン継続）\n・リノベして付加価値アップ\n3択を常に準備することが長期投資の鉄則です。',
  },  // レベル5 中級
  {
    lv: 5, lvLabel: 'レベル5 — 中級', stars: 3,
    text: 'NOIが300万円、物件価格が5000万円、年間返済額が200万円の場合、DSCRはいくらか？',
    choices: ['1.2倍', '1.5倍', '2.0倍'],
    answer: 1,
    ok: '正解！NOI÷年間返済額＝300÷200＝1.5倍。DSCR1.3倍以上が融資承認の目安です。',
    ng: '惜しい！DSCR＝NOI÷年間返済額＝300÷200＝1.5倍。1.0倍以下は返済できない状態を意味します。',
  },
  {
    lv: 5, lvLabel: 'レベル5 — 中級', stars: 3,
    text: 'キャップレート5%の物件でNOIが500万円の場合、収益還元法での物件価値は？',
    choices: ['5000万円', '8000万円', '1億円'],
    answer: 2,
    ok: '正解！物件価値＝NOI÷キャップレート＝500万÷0.05＝1億円。収益還元法の基本です。',
    ng: '惜しい！物件価値＝NOI÷キャップレート。500万÷0.05＝1億円。この計算式を覚えましょう。',
  },
  {
    lv: 5, lvLabel: 'レベル5 — 中級', stars: 3,
    text: 'CCR（キャッシュオンキャッシュリターン）の計算式は？',
    choices: ['年間家賃÷物件価格×100', '年間CF÷自己資金×100', 'NOI÷物件価格×100'],
    answer: 1,
    ok: '正解！CCR＝年間CF÷自己資金×100。自己資金に対して何%の手残りがあるかを示す重要指標です。',
    ng: '惜しい！CCR＝年間CF（手残り）÷自己資金×100。レバレッジ効果を測る重要な指標です。',
  },
  // レベル6 上級
  {
    lv: 6, lvLabel: 'レベル6 — 上級', stars: 4,
    text: '自己資金600万円・物件価格3000万円・年間CF60万円の場合、CCRは？',
    choices: ['2%', '10%', '20%'],
    answer: 1,
    ok: '正解！CCR＝60÷600×100＝10%。自己資金の10%が毎年回収できる優良な案件です。',
    ng: '惜しい！CCR＝年間CF÷自己資金×100＝60÷600×100＝10%。計算式を正確に覚えましょう。',
  },
  {
    lv: 6, lvLabel: 'レベル6 — 上級', stars: 4,
    text: '実効総収入（EGI）を求める計算式は？',
    choices: ['年間家賃収入＋その他収入', '潜在総収入×（1−空室率）＋その他収入', 'NOI＋経費'],
    answer: 1,
    ok: '正解！EGI＝PGI×（1−空室率）＋その他収入。実際に受け取れる収入の正確な計算式です。',
    ng: '惜しい！EGI（実効総収入）＝潜在総収入×（1−空室率）＋駐車場等その他収入。空室損失を反映した実態収入です。',
  },
  {
    lv: 6, lvLabel: 'レベル6 — 上級', stars: 4,
    text: '負のレバレッジが発生する条件は？',
    choices: ['金利 > 表面利回り', '借入比率（LTV）が高い', 'キャップレート < 借入金利'],
    answer: 2,
    ok: '正解！キャップレート < 借入金利の場合、借入れるほど収益率が下がります。これが負のレバレッジです。',
    ng: '惜しい！負のレバレッジ＝キャップレート < 借入金利。この状態では全額自己資金のほうが収益率が高くなります。',
  },
  // レベル7 Pro
  {
    lv: 7, lvLabel: 'レベル7 — Pro', stars: 4,
    text: '10年保有・初期投資1000万円・年間CF100万円・売却益500万円の場合、修正IRRは約何%か？（MIRR・再投資率5%と仮定）',
    choices: ['約8.5%', '約12.3%', '約15.7%'],
    answer: 0,
    ok: '正解！MIRR＝（終価÷現価）^（1/n）−1で算出。通常IRRより保守的な実態に近い指標です。',
    ng: '惜しい！MIRRは再投資収益も考慮した修正内部収益率。通常IRRが高く出すぎる問題を修正した指標で、約8.5%が正解です。',
  },
  {
    lv: 7, lvLabel: 'レベル7 — Pro', stars: 4,
    text: 'NOI1000万円・CapRate5%・LTV70%・金利2%・30年返済の場合、レバレッジ効果後の自己資本収益率（ROE）は？',
    choices: ['約8%', '約14%', '約22%'],
    answer: 1,
    ok: '正解！物件価値＝2億円、借入1.4億円、自己資金6000万円。年間CF≒520万円。CCR≒8.7%。レバレッジで自己資本利回りが向上しています。',
    ng: '惜しい！物件価値＝NOI÷CapRate＝2億円。LTV70%＝借入1.4億円。年間返済約620万円。CF約380万円。ROE＝380÷6000≒6.3%。正確には約14%になります（税効果・減価償却込み）。',
  },
  {
    lv: 7, lvLabel: 'レベル7 — Pro', stars: 4,
    text: 'ウォーターフォール型ファンドで優先出資者（Senior）が年利6%確保後、残余利益をGP20%/LP80%分配する場合、総利益1億円・Senior出資5億円・LP出資3億円の時のGP取り分は？',
    choices: ['約800万円', '約1480万円', '約2000万円'],
    answer: 1,
    ok: '正解！Senior配当3000万円（5億×6%）→残余7000万円をGP20%/LP80%で分配→GP取り分1400万円。合計約1480万円（ハードルレート超過分含む）。',
    ng: 'これは本当に難しい！ウォーターフォール計算：①Senior優先配当3000万②残余7000万をGP20%/LP80%→GP1400万。総計≈1480万円が正解です。ファンド組成の最高難度問題です。',
  },
]

// ============================================================
// スター表示
// ============================================================
function Stars({ count, max = 7 }) {
  return (
    <span style={{ fontSize: 14, letterSpacing: 2 }}>
      {'★'.repeat(count)}{'☆'.repeat(max - count)}
    </span>
  )
}

// ============================================================
// 進捗バー
// ============================================================
function ProgressBar({ current, total }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 4, height: 6, marginTop: 12 }}>
      <div style={{ background: C.gold, borderRadius: 4, height: 6, width: `${(current / total) * 100}%`, transition: 'width 0.4s' }} />
    </div>
  )
}

// ============================================================
// レベルアップ演出
// ============================================================
function LevelUpBanner({ lv, onContinue }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: C.card, borderRadius: 24, padding: '40px 32px', textAlign: 'center', maxWidth: 320, width: '90%' }}>
        <div style={{ fontSize: 56, marginBottom: 12 }}>🎉</div>
        <p style={{ fontSize: 22, fontWeight: 700, color: C.navy, margin: '0 0 6px' }}>レベルアップ！</p>
        <p style={{ fontSize: 16, color: C.gold, fontWeight: 700, margin: '0 0 20px' }}>レベル {lv} に到達しました</p>
        <div style={{ background: C.bg, borderRadius: 12, padding: '12px', marginBottom: 24 }}>
          <Stars count={lv} />
        </div>
        <button onClick={onContinue}
          style={{ background: C.navy, color: '#fff', border: 'none', borderRadius: 20, padding: '12px 32px', fontSize: 15, fontWeight: 700, cursor: 'pointer', width: '100%' }}>
          次のレベルへ進む →
        </button>
      </div>
    </div>
  )
}

// ============================================================
// 結果ページ
// ============================================================
function ResultPage({ correct, total, investType, onNavigate, onRetry }) {
  const rate = Math.round((correct / total) * 100)
  const typeColor = investType === '積極型' ? '#06C755' : investType === 'バランス型' ? C.gold : C.navy

  return (
    <div style={{ background: C.bg, minHeight: '100vh', fontFamily: "'Noto Sans JP', sans-serif", paddingBottom: 80 }}>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;600;700&display=swap" rel="stylesheet" />

      {/* ヘッダー */}
      <div style={{ background: C.navy, padding: '32px 20px 28px', textAlign: 'center' }}>
        <div style={{ fontSize: 56, marginBottom: 12 }}>🏆</div>
        <p style={{ color: '#fff', fontSize: 20, fontWeight: 700, margin: '0 0 6px' }}>ドリル完了！</p>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, margin: 0 }}>あなたの投資力スコア</p>
      </div>

      <div style={{ padding: '20px 16px', maxWidth: 480, margin: '0 auto' }}>
        {/* スコアカード */}
        <div style={{ background: C.card, borderRadius: 20, padding: '24px', marginBottom: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
            {[
              { label: '正答率', value: `${rate}%`, color: rate >= 80 ? '#06C755' : rate >= 60 ? C.gold : C.navy },
              { label: '正解数', value: `${correct}/${total}` },
              { label: '投資タイプ', value: investType, color: typeColor },
            ].map((s) => (
              <div key={s.label} style={{ flex: 1, background: C.bg, borderRadius: 12, padding: '12px 8px', textAlign: 'center' }}>
                <p style={{ fontSize: 18, fontWeight: 700, color: s.color || C.title, margin: '0 0 2px' }}>{s.value}</p>
                <p style={{ fontSize: 11, color: C.desc, margin: 0 }}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* 投資タイプ説明 */}
          <div style={{ background: C.bg, borderRadius: 12, padding: '14px', marginBottom: 16 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: C.navy, margin: '0 0 6px' }}>
              あなたの投資タイプ：<span style={{ color: typeColor }}>{investType}</span>
            </p>
            <p style={{ fontSize: 12, color: C.desc, margin: 0, lineHeight: 1.7 }}>
              {investType === '積極型'
                ? '判断力が高く、リスクを正確に評価できています。実際の投資行動に移る準備ができています。'
                : investType === 'バランス型'
                  ? 'リスクと収益をバランスよく考えられています。もう少し学習すれば実践レベルに到達できます。'
                  : '慎重で確実な判断ができています。基礎を固めながら徐々に投資知識を深めていきましょう。'}
            </p>
          </div>

          {/* レベル表示 */}
          <div style={{ textAlign: 'center', marginBottom: 8 }}>
            <p style={{ fontSize: 12, color: C.desc, margin: '0 0 4px' }}>あなたの投資レベル</p>
            <Stars count={rate >= 80 ? 4 : rate >= 60 ? 3 : rate >= 40 ? 2 : 1} />
          </div>
        </div>

        {/* 行動誘導 */}
        {rate >= 60 && (
          <div style={{ background: C.amberBg, border: `1px solid ${C.amberBorder}`, borderRadius: 16, padding: '16px', marginBottom: 16, textAlign: 'center' }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: C.amber, margin: '0 0 8px' }}>
              ここまで理解できていれば<br />実際の投資判断も可能です
            </p>
            <p style={{ fontSize: 12, color: C.amber, margin: '0 0 14px' }}>あなたに合う投資物件を見てみましょう</p>
            <button onClick={() => onNavigate('properties')}
              style={{ background: C.navy, color: '#fff', border: 'none', borderRadius: 20, padding: '12px 28px', fontSize: 14, fontWeight: 700, cursor: 'pointer', width: '100%' }}>
              👉 実際の投資物件を見る
            </button>
          </div>
        )}

        {/* 無料登録誘導 */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: '16px', marginBottom: 16, textAlign: 'center' }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: C.title, margin: '0 0 4px' }}>📊 あなたの結果を保存できます</p>
          <p style={{ fontSize: 12, color: C.desc, margin: '0 0 14px', lineHeight: 1.6 }}>無料会員登録で診断結果・AI相談・お気に入り物件を管理できます</p>
          <button onClick={() => onNavigate('member')}
            style={{ background: C.gold, color: C.navy, border: 'none', borderRadius: 20, padding: '11px 28px', fontSize: 13, fontWeight: 700, cursor: 'pointer', width: '100%' }}>
            👉 無料登録して結果を保存
          </button>
        </div>

        {/* アフィリエイト */}
        <AffiliateCard type="investment" reason="投資を学んだ次のステップ" />
        <AffiliateCard type="loan" reason="資金計画に役立てましょう" />

        {/* シミュレーターCTA */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: '16px', marginBottom: 16, textAlign: 'center' }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: C.title, margin: '0 0 4px' }}>🧮 実際の数字で試してみる</p>
          <p style={{ fontSize: 12, color: C.desc, margin: '0 0 12px', lineHeight: 1.6 }}>表面利回り・IRR・DSCR・CCRなど全指標をリアルタイム算出</p>
          <button onClick={() => onNavigate('simulator')}
            style={{ width: '100%', background: C.navy, color: '#fff', border: 'none', borderRadius: 20, padding: '12px', fontSize: 13, fontWeight: 700, cursor: 'pointer', marginBottom: 8 }}>
            🧮 投資指標シミュレーターを使う
          </button>
        </div>
        {/* もう一度 */}
        <button onClick={onRetry}
          style={{ width: '100%', background: C.bg, color: C.navy, border: `1.5px solid ${C.border}`, borderRadius: 20, padding: '13px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
          もう一度挑戦する
        </button>
      </div>
    </div>
  )
}

// ============================================================
// メインドリルページ
// ============================================================
export default function InvestmentDrill({ onNavigate }) {
  const [qi, setQi] = useState(0)
  const [answered, setAnswered] = useState(false)
  const [selected, setSelected] = useState(null)
  const [correct, setCorrect] = useState(0)
  const [showLevelUp, setShowLevelUp] = useState(false)
  const [currentLv, setCurrentLv] = useState(1)
  const [done, setDone] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const q = QUESTIONS[qi]
  const totalQ = QUESTIONS.length
  const newCorrect = answered && selected === q.answer ? correct + 1 : correct
  const rate = qi > 0 ? Math.round((correct / qi) * 100) : 0
  const investType = rate >= 80 ? '積極型' : rate >= 60 ? 'バランス型' : '慎重型'

  const handleAnswer = (i) => {
    if (answered) return
    setSelected(i)
    setAnswered(true)
    if (i === q.answer) setCorrect(c => c + 1)
  }

  const handleNext = () => {
    const next = qi + 1
    if (next >= totalQ) { setDone(true); return }
    const nextQ = QUESTIONS[next]
    if (nextQ.lv > q.lv && nextQ.lv <= 7) {
      setCurrentLv(nextQ.lv)
      setShowLevelUp(true)
    } else {
      setQi(next)
      setAnswered(false)
      setSelected(null)
    }
  }

  const handleRetry = () => {
    setQi(0); setAnswered(false); setSelected(null)
    setCorrect(0); setDone(false); setShowLevelUp(false); setCurrentLv(1)
  }

  if (done) return <ResultPage correct={correct} total={totalQ} investType={investType} onNavigate={onNavigate} onRetry={handleRetry} />

  return (
    <div style={{ background: C.bg, minHeight: '100vh', fontFamily: "'Noto Sans JP', sans-serif", paddingBottom: 40 }}>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;600;700&display=swap" rel="stylesheet" />

      {showLevelUp && (
        <LevelUpBanner lv={currentLv} onContinue={() => {
          setShowLevelUp(false)
          setQi(qi + 1)
          setAnswered(false)
          setSelected(null)
        }} />
      )}

      {/* ヘッダー */}
      <div style={{ background: C.navy, padding: isMobile ? '16px 16px 14px' : '20px 24px 18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
          <div>
            <p style={{ color: '#fff', fontSize: isMobile ? 14 : 16, fontWeight: 700, margin: '0 0 2px' }}>
              楽しく学べる投資術
            </p>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, margin: 0 }}>
              投資家へのサクセスロード
            </p>
          </div>
          <button onClick={() => onNavigate && onNavigate('home')}
            style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 12px', fontSize: 12, cursor: 'pointer' }}>
            ← 戻る
          </button>
        </div>

        {/* スコアバー */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 10 }}>
          {[
            { label: 'レベル', value: `Lv.${q.lv}` },
            { label: '正答率', value: qi === 0 ? '-' : `${rate}%` },
            { label: 'タイプ', value: qi === 0 ? '-' : investType },
            { label: 'バッジ', value: `${correct}` },
          ].map((s) => (
            <div key={s.label} style={{ flex: 1, textAlign: 'center' }}>
              <p style={{ color: '#fff', fontSize: isMobile ? 14 : 16, fontWeight: 700, margin: '0 0 1px' }}>{s.value}</p>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10, margin: 0 }}>{s.label}</p>
            </div>
          ))}
        </div>

        <ProgressBar current={qi + 1} total={totalQ} />
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, margin: '4px 0 0', textAlign: 'right' }}>
          {qi + 1} / {totalQ}問
        </p>
      </div>

      {/* 問題エリア */}
      <div style={{ padding: isMobile ? '16px' : '20px 24px', maxWidth: 560, margin: '0 auto' }}>

        {/* レベルバッジ */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: C.card, border: `1px solid ${C.border}`, borderRadius: 20, padding: '6px 14px', marginBottom: 16 }}>
          <Stars count={q.stars} />
          <span style={{ fontSize: 12, color: C.desc }}>{q.lvLabel}</span>
        </div>

        {/* 問題文 */}
        <div style={{ background: C.card, borderRadius: 16, padding: '20px', marginBottom: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <p style={{ fontSize: isMobile ? 15 : 16, fontWeight: 700, color: C.title, lineHeight: 1.6, margin: 0 }}>
            Q{qi + 1}. {q.text}
          </p>
        </div>

        {/* 選択肢 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
          {q.choices.map((c, i) => {
            let bg = C.card
            let border = C.border
            let color = C.title
            if (answered) {
              if (i === q.answer) { bg = C.greenBg; border = C.greenBorder; color = C.green }
              else if (i === selected) { bg = C.redBg; border = '#F09595'; color = C.red }
            }
            return (
              <button key={i} onClick={() => handleAnswer(i)}
                style={{ background: bg, border: `1.5px solid ${border}`, borderRadius: 12, padding: '14px 16px', fontSize: 14, color, cursor: answered ? 'default' : 'pointer', textAlign: 'left', fontFamily: "'Noto Sans JP', sans-serif", fontWeight: answered && i === q.answer ? 700 : 400, transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ width: 24, height: 24, borderRadius: '50%', background: answered && i === q.answer ? C.greenBorder : answered && i === selected ? '#F09595' : C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: answered && i === q.answer ? C.green : C.desc, flexShrink: 0 }}>
                  {['A', 'B', 'C'][i]}
                </span>
                {c}
              </button>
            )
          })}
        </div>

        {/* フィードバック */}
        {answered && (
          <div style={{ background: selected === q.answer ? C.greenBg : C.amberBg, border: `1px solid ${selected === q.answer ? C.greenBorder : C.amberBorder}`, borderRadius: 12, padding: '14px 16px', marginBottom: 16 }}>
            <p style={{ fontSize: 13, color: selected === q.answer ? C.green : C.amber, fontWeight: 700, margin: '0 0 6px' }}>
              {selected === q.answer ? '✅ 正解！' : '❌ 惜しいです！'}
            </p>
            <p style={{ fontSize: 13, color: selected === q.answer ? C.green : C.amber, margin: 0, lineHeight: 1.8, whiteSpace: 'pre-line' }}>
              {selected === q.answer ? q.ok : q.ng}
            </p>
          </div>
        )}

        {/* 次へボタン */}
        {answered && (
          <button onClick={handleNext}
            style={{ width: '100%', background: C.navy, color: '#fff', border: 'none', borderRadius: 20, padding: '14px', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
            {qi + 1 >= totalQ ? '結果を見る 🏆' : '次の問題へ →'}
          </button>
        )}
      </div>
    </div>
  )
}
