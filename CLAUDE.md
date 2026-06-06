
# House-AI Claude Code ルール

## 最重要：作業前に必ず読むこと

### 絶対禁止
- 動いている機能を理由なく変更しない
- 指示されていない箇所を触らない
- 複数箇所を一度に変えない（1箇所変えて確認してから次へ）
- 推測で進めない・不明な点は必ず確認してから作業する

---

## プロジェクト基本情報

| 項目 | 内容 |
|------|------|
| サイト | house-ai.co.jp |
| 構成 | Vite + React SPA（JSX）TypeScript禁止 |
| Supabase | bbkjnetmdfdrzcedmbdn |
| GitHub | n-gintetsu/house-ai |
| ローカル | ~/Desktop/house-ai |

---

## 永久コーディングルール（全セッション共通・必ず守る）

- `??` 禁止 → `||` 使用
- `&&` 条件JSX禁止 → 三項演算子 `条件 ? (...) : null`
- 絵文字禁止（チャット内AIレスポンスは許可）→ lucide-react / SVG アイコンを使う
- fontWeight: 400/500のみ（600/700/900禁止）
- input/textarea/select の fontSize は最低16px（iOS zoom防止）
- framer-motion import は `'framer-motion'`（`'motion/react'` ではない）
- インラインstyleのみ（Tailwindクラス禁止）
- TypeScript禁止（JSXのみ）
- `100vw` 禁止
- `WebkitBackgroundClip`・`WebkitTextFillColor` 禁止
- `npm run build && git push` の順厳守
- noResultTest は常に false
- house-ai（bbkjnetmdfdrzcedmbdn）とgintetsu-fudosan混在禁止

## backdrop-filter ルール
- 使用OK（本物のガラス）：単一・固定・繰り返さないサーフェスのみ → ①ヘッダー ②AIチャット窓 ③モーダル/オーバーレイ
  - blur 8〜12px まで／-webkit-backdrop-filter を必ず併記／rgba背景のフォールバックを必ず持たせる／複数枚スタック・アニメーション禁止
- 使用NG（疑似ガラスで代替）：物件・ランキング・ツール等の繰り返しカード全般、一覧/グリッド/フィード、全面の常時レイヤー
  - 疑似ガラス標準レシピ：
    background: rgba(15, 23, 42, 0.85);
    border: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow: 0 0 30px rgba(201, 168, 76, 0.15);

---

## カラー

- 背景: #0A0F1E
- テキスト: #E2E8F0
- アクセント（ゴールド）: #D4AF37
- サブテキスト: #64748B
- カードbg: #111827
- ボーダー: #1E293B

---

## 画像ファイルの扱い

- `favicon.png` → インタビュー画面の吹き出しアイコン・analyzing画面で使用。黒背景はデザインの一部。触らない
- `logo.png` → 入力画面上部の大きいロゴ（width:140）
- `logo-icon.png` → 透過PNG。小サイズでは黒丸にしか見えないため32px以下では使わない
- 画像の見た目が気になっても、動いている状態を勝手に変更しない

---

## URL構造

| URL | ファイル | 説明 |
|-----|---------|------|
| /pro | ProTopPage.jsx | House-AI Proトップ |
| /pro/investigation | ProInvestigationPage.jsx | AI現地調査室 |
| /pro/docs | ProDocsPage.jsx | AI重説ドラフト支援 |

---

## Workspace 系ルール（過去にハマった点）

- ファイルアップロードの storage_path は ASCII セーフ（ランダム英数字）にする。元の日本語ファイル名は file_name 列に入れる（Supabase Storage の "Invalid key" 回避）。
- 追加系 input は IME 変換中の Enter 誤確定をガードする（isComposing を見る）。
- SQL 実行時に RLS の警告が出たら、段階4までは「Run without RLS」を選ぶ（RLS は段階4でまとめて締める方針）。

---

## ロール体系（重要）

### ログイン権限ロール（9種）= PERMISSION_OPTIONS（英語値で保存）
Owner, Manager, Staff, Customer, Broker, JudicialScrivener, Bank, ReformCompany, Guest

### PERMISSION_LABEL（日本語表示）
| 英語値 | 表示 |
|--------|------|
| Owner | Owner |
| Manager | Manager |
| Staff | スタッフ |
| Customer | 顧客 |
| Broker | 仲介業者 |
| JudicialScrivener | 司法書士 |
| Bank | 金融機関 |
| ReformCompany | リフォーム会社 |
| Guest | Guest |
| Member | Member（フォールバック・既存データ保護用） |

### ROLE_CANON（大文字小文字を吸収する正規化マップ）
小文字キー → 正規形。例: owner→Owner, broker→Broker, judicialscrivener→JudicialScrivener。
**ロール判定・表示は必ず normRole() を通すこと。**
直書きの `=== 'Owner'` 比較は事故のもと（過去に "owner" と 'Owner' の不一致で権限ボタンが消えるバグあり）。

### permissionStyle の色（把握分）
- Owner: ゴールド #c9a84c
- Manager: ブルー #60A5FA
- Staff: グレー #94A3B8
- Customer: ティール #2dd4bf
- Broker: オレンジ #fb923c（新規）
- JudicialScrivener: バイオレット #a78bfa
- Bank: スカイ #38bdf8
- ReformCompany: グリーン #34d399
- Guest: インディゴ #818CF8

### UXガード（現状）
```
canDel    = normRole(currentRole) === 'Owner' || normRole(currentRole) === 'Manager'
canAdd    = currentRole != null（ログインメンバーなら追加可）
canManage = canDel
```
※これは画面の出し分け（UX）のみ。本当の強制は段階4 RLS。

### 関係者（連絡先 ws_members）のロール選択肢（ログイン権限とは別物）
顧客 / 担当 / 仲介業者 / 司法書士 / 銀行 / 火災保険 / リフォーム / 管理会社 / 売主 / 買主
（あくまで「誰が関わっているか」のラベル。アクセス権は持たない。）

---

## アクセス制御の設計合意（段階5の核心）

### 決定事項
- 社内（Owner / Manager / Staff）= 全ファイル閲覧・DL 可
- 顧客（Customer）= 全ファイル閲覧・DL 可
  - 理由: 顧客が案件の主役（依頼主）。司法書士の請求書・銀行のローン審査書などはすべて顧客宛。顧客が自分の案件の全書類を保存できる＝ペーパーレス化＋一目で把握＝本サービスの価値。
- 業者（Broker / JudicialScrivener / Bank / ReformCompany / Guest）= Owner が共有したファイルだけ閲覧・DL 可（デフォルトは何も見えない）
- アップロードは各役割が自分のフォルダに（社内は全フォルダ可）

### 共有モデル（採用）
「名前指定の共有」を採用。業者は既にログイン（本人特定）済みなので、Owner が「このファイルをこの人に共有」を1クリックで付与・取り消し。
- パスワード方式は却下（取り消しにくい・誰が見たか記録できない・漏洩経路）。
- 「アカウントを作らない一回限りの外部の人」のみ、後日「期限付きリンク（任意パスワード）」を特例追加検討。

### セキュリティ原則
- 本当のガードはサーバー側（Supabase RLS + Storage 非公開 + 署名URL + アクセスログ）。フロントの非表示は UX のみ。
- 「権限の無いファイルURL直アクセス不可」は、バケット非公開化 + Vercel関数（権限/共有を確認 → 短命の署名URL発行 → ログ記録）で実現。
- 段階5a/5b は見た目だけ: バケット公開のままなので、本物の外部公開は 5c・段階4 完了後。テストは自分のメールのみ。

---

## 過去の失敗パターン（同じ失敗をしないこと）

1. **画像の黒背景問題** → favicon.pngの黒背景はデザインの一部。「黒背景が問題」と判断して変更したことで長時間ロゴが壊れた。動いている画像は触らない
2. **指示範囲外の変更** → 1箇所の修正指示で関係ない箇所まで変更してしまった。指示された箇所のみ変更すること
3. **推測で進める** → コードを確認せず推測で修正指示を出し続けた。必ず該当コードを確認してから修正すること
4. **同じ修正を繰り返す** → 修正が効いていない場合は原因を特定してから再修正する
5. **ロールの大文字小文字** → 保存値が小文字のことがある。判定・表示は必ず normRole() 経由。直書きの `=== 'Owner'` 比較は事故のもと
6. **プロジェクト混線** → house-ai 専用セッション以外で触らない。指示文にクロスプロジェクトの cd を入れない
7. **Storage Invalid key** → storage_path は ASCII セーフ、日本語名は file_name へ
8. **IME Enter 誤確定** → 追加系 input は変換中 Enter をガード（isComposing を見る）
9. **RLS 警告** → 段階4まで Run without RLS

---

## セッション開始時の確認コマンド
