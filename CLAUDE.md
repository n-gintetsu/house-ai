
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

## アクセス制御・Basic認証

### Workspace先行リリースのBasic認証免除（2026-06-11, commit 4dedacb）
- middleware.js の Basic認証免除は /workspace・/login を「完全一致（===）」で免除している。
- これは Magic Link の着地（/workspace ぴったり）と WorkspaceAuthGuard のリダイレクト（/login ぴったり）に対応した最小設定。
- 【将来の注意】/workspace/:id のようなパスベースのサブルートを導入する場合は、その時に限り `=== '/workspace'`（および '/workspace/'）を `startsWith('/workspace')` に変更すること。完全一致のままだとサブパスがBasic認証ダイアログに阻まれる。
- 本体トップ（/）は引き続き Basic認証で保護。本体公開時にこの仮ゲート自体を廃止予定。

### 静的アセット免除の追記（2026-06-11, commit d0c4af7）
- HTMLルート（/workspace・/login）だけ免除しても不十分。SPAが後から読み込む /assets/ 配下のJS/CSS（および public配下の拡張子付き静的ファイル）が免除外だと、ブラウザがサブリソースの401でBasic認証ダイアログを出す。→ 静的アセットも免除が必須。
- 現在の免除: /api、/assets/、拡張子付き静的ファイル（js|mjs|css|svg|png|jpe?g|gif|webp|avif|ico|woff2?|ttf|otf。.map=ソースマップは除外し生ソースを晒さない）、/workspace(/)、/login(/)。
- 副作用: 静的アセット公開によりJSバンドル（=アプリ全クライアントコード）が公開取得可能。Basic認証は開発中の仮の蓋で本物の防御ではない（実防御はRLS/API Bearer/AuthGuard）。クライアントの秘密混入なしは確認済み（参照はVITE_SUPABASE_ANON_KEYとVITE_CLAUDE_MODELのみ、service_roleはsrc/dist共に無し）。
- 【将来タスク】本体コードを公開面から外すなら、Workspaceを別ビルド/別デプロイに分離（スライス戦略§7と整合）。
- 【検証の注意】middleware変更の検証は「資格情報未入力の新しいシークレット」で行う。ブラウザはBasic認証資格情報をセッション中キャッシュ自動送信するため、一度認証したウィンドウでは免除の効きを誤判定する。curl検証は x-vercel-cache: HIT に注意（キャッシュ応答はmiddlewareを反映しない）。POST等のキャッシュされないリクエストでmiddleware実走を確認できる。

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

---

## セキュリティ / Anthropic APIキー管理（重要・2026-06-07 追記）

### プロジェクトごとに別キーを使用（Anthropic組織は共通）
Anthropic の APIキーは1ワークスペース（組織）に複数あり、プロジェクトごとに使い分けている。
Revoke / 削除するときは、他プロジェクトのキーを誤って消さないよう必ず照合すること。

| 用途 | Console上のキー名 | 末尾4文字 | 置き場所 |
|---|---|---|---|
| House-AI（現行・サーバー専用） | house-ai-server-202606 | ...2AAA | house-ai プロジェクトの ANTHROPIC_API_KEY（/api/claude・/api/ai-chat が使用） |
| GINTETSU不動産HP | gintetsu-fudosan | ...BwAA | gintetsu-fudosan プロジェクトの ANTHROPIC_API_KEY |
| EstateFlow | gintetsu-promiq | ...FQAA | estateflow プロジェクトの ANTHROPIC_API_KEY |

- 無効化済み（漏洩対応）: house-ai-2026（...SwAA）= House-AI の旧キー。フロントバンドルに露出していたため 2026-06-07 に無効化。
- その他の古い house-ai 系キー（ハウスAI / house-ai ×3、いずれも2026-04-06作成・休眠中）は孤児キー。整理する場合も下記ルールを守る。

### 古いキーを削除/無効化する前のチェック（厳守）
1. 各 Vercel プロジェクト（house-ai / gintetsu-fudosan / estateflow）の ANTHROPIC_API_KEY の末尾4文字を確認する。
2. 消そうとしているキーの末尾4文字が、どのプロジェクトでも使われていないことを確認してから Revoke する。
3. 共用していた場合は、先に該当プロジェクトを別キーへ移してから消す。
   ※ 誤って消すと本番サイト（gintetsu-fudosan.co.jp 等）のAI機能が停止する。

### House-AI のキー露出対策（済み・参考）
- フロントの Anthropic 直呼び（VITE_ANTHROPIC_API_KEY）は廃止し、すべて /api/claude（process.env.ANTHROPIC_API_KEY）経由に統一済み。
- VITE_ANTHROPIC_API_KEY は Vercel から削除済み。
- 未対応: VITE_SUPABASE_SERVICE_ROLE_KEY は AdminDashboard.jsx でまだフロント露出（バンドルに service_role が焼き込まれている）。フェーズ2で api 経由へ移設＋ローテーション予定。
- /api/claude は現状「認証なしプロキシ」。ローンチ前に保護（レート制限/呼び出し元チェック）を追加すること。

### 後日の必須タスク（GINTETSU不動産HP / EstateFlow のセキュリティ点検）
House-AI と同様の漏洩チェックを、gintetsu-fudosan と estateflow の両プロジェクトでも実施すること（各プロジェクトの専用セッションで行う。House-AIセッションからは触らない）:
- フロント側コードで NEXT_PUBLIC_ 接頭辞の Anthropic / Supabase service_role キーを参照していないか grep で確認（両プロジェクトは Next.js なので公開接頭辞は NEXT_PUBLIC_）。
- 露出していれば、サーバー（api / route handler）経由へ移設 → キーをローテーション → 露出していた env 変数を削除。
- service_role キー・APIキーがクライアントバンドルに焼き込まれていないか点検。

## 通知ベル既読管理
- 現状：通知ベルの既読は localStorage（キー `houseai_notices_read_{currentUserId}_{id}`、id=案件/ワークスペースID）で端末ローカル管理。赤バッジ＝未読お知らせ件数。ベルを開いた瞬間に全件既読化してバッジが消える。
- 将来アップグレード：端末をまたいで既読を同期したくなったら、`ws_notice_reads`（user_id, notice_id, read_at）テーブル＋RLS を追加し、サーバー側の既読管理へ移行する。

## セキュリティTODO：profiles の過大なRLSポリシー締め直し
- 問題：profiles テーブルの「Service role full access profiles」ポリシーが、実際は TO public（全員）/ FOR ALL / USING(true) で効いており、全認証ユーザー（場合により公開anonキー）が他人の profiles 行を全件 読み書き/削除できる状態。露出列に email・stripe_customer_id・account_status 等の機微情報を含む。
- 注意：このポリシーが MemberDashboard の自分profile upsert、AdminDashboard の他人profile 読み取り/更新を支えている可能性が高い。単純に削除/締め直すと それらが壊れる。
- 修正方針（要・事前確認）：①Admin/Member がどう profiles にアクセスしているか（service_role経由API か クライアント直か）を調査 → ②「Service role full access」を TO service_role に限定（service_roleはRLSをバイパスするので本来これで十分）→ ③ユーザー用 INSERT(own) ポリシーを追加（upsert用）→ ④動作確認（管理画面・プロフィール保存が壊れていないか）。
- 補足：アバターはこの問題と切り離して user_avatars テーブルで実装済み（profilesに非依存）。

## セキュリティ対応ログ（2026-06-11）
### 修正済み
- api/delete-user.js：管理者認証ゲートを追加（Authorizationヘッダ → Bearerトークン → supabaseAdmin.auth.getUser → ADMIN_EMAILS判定。無認証/非adminは401/403で即return）。admin-users.js と同じ流儀。AdminDashboard の5箇所（handleDeleteUser/executeSoftDelete/executeHardDelete/executeRestore/deleteAgency）の fetch に Authorization: Bearer を付与。→ 無認証でのユーザー削除（auth.admin.deleteUser）の穴を閉鎖。実機で①admin削除が動く ②無認証GETが {"error":"no_token"} を返す、を確認済み。

### 未対応（次にやる：B-2〜B-4）
- profiles の過大なRLSポリシー締め直し（"Service role full access profiles" が実際は TO public / ALL / USING(true) で、全認証ユーザーが他人の profiles 行を読み書き可能。露出列に email・stripe_customer_id・account_status 等）。
  - B-2：AdminDashboard:635(select)/689(update) を service_role API（admin-update-profile）経由に移設（admin-users.js と同じ認証ゲート付き）
  - B-3：profiles に「自分の行のみ INSERT」ポリシー追加（MemberDashboard の自分upsert用。UPDATE-own は既存）
  - B-4：「Service role full access profiles」を TO service_role に限定
  - B-5：動作確認（Admin読み取り/更新・自分のプロフィール保存・一般ユーザーが他人を読めないこと）
- 横断監査（将来）：他テーブルにも同種の "service role full access が TO public" ミスが無いか確認。

---
## セキュリティ対応ログ（2026-06-11〜12）
profiles テーブルのRLS穴を塞いだ。
- B-1: api/delete-user.js が無認証だった（誰でもユーザー削除可能）→ 管理者認証ゲート追加（Bearer→getUser→ADMIN_EMAILS判定）
- B-2: AdminDashboard の他人profile読み書きを service_role API（api/admin-profile.js）経由に移設
- B-3: profiles に own-INSERT ポリシー追加（to authenticated, with check auth.uid()=id）
- B-4: 「Service role full access profiles」ポリシーを TO public → TO service_role に限定（これが本丸の穴）
- B-5: 検証済み。他人=0行/本人=1行/Admin動作OK。新規ユーザーのprofiles作成は on_auth_user_created→handle_new_user（SECURITY DEFINER）でRLSバイパスのため影響なし。

【教訓】RLS有効テーブルで「Service role full access」を TO public / USING(true) で作るのは穴。service_role はRLSをバイパスするのでポリシーは必ず TO service_role にする。
【TODO】①他テーブルにも同種の "TO public full access" ミスが無いか監査 ②MemberDashboard:213 の name/phone カラム不存在バグ ③業者管理の管理者メモ保存バグ
---

## House-AI 製品ビジョン（最重要・前提）
- House-AIは「不動産まわりの便利ツールを束ねるOS/プラットフォーム」型のマルチテナントSaaS。商品として外部事業者（不動産会社・司法書士等）に販売し、GINTETSU不動産自身も利用する。
- 本体(house-ai.co.jp)にAI相談・物件掲載・AI重説ドラフト・火災保険整理・引越し比較・AI査定・AI現地調査レポート等を集約。開発中のWorkspace(案件管理)もその1ツール。今後もツールを追加。
- 戦略：本体OSを一気に出さず、各ツールを"スライスリリース"して先にユーザーを集める。Workspaceの最大目的はユーザーが新規案件を作って増えること。将来は各ツールが連携して価値最大化＝OSが成立。
- 各ユーザーは1つのHouse-AIアカウント（アイコン/ID/拡張機能の素地）を持つ。
- マルチテナント：各事業者ユーザーは案件を作ると自分のorg(テナント)を持ち、自分の案件・家カルテ・顧客カルテは自分のものだけ（他orgとRLSで隔離）。1人が「自分のorgのオーナー」かつ「他orgの招待ゲスト」を両立。
- 現状はGINTETSUが唯一のorg所有者。今後の主要開発＝招待ユーザーが新規案件作成時に自分のorgを持てるようにする（org自動発行＋サインアップ）。
- 運営用「アカウント管理画面」を別枠で用意予定。全アカウントを蓄積するが目的は運営のみ（開発・セキュリティ・データ保存・ユーザー規模把握）で営業目的ではない。アクセスは運営者だけに厳格制限する。

---

## アーキテクチャ & 公開制御（2026-06-17時点）

### 製品の全体像
House-AIは「不動産まわりの便利ツールを束ねる本体OS/プラットフォーム」型マルチテナントSaaS。本体(house-ai.co.jp)に各ツール(AI相談/物件掲載/AI重説/AI現調/物確/AI査定…)を集約し、Workspace(案件管理)もその1スライス。戦略=本体を一気に出さず各ツールを"スライスリリース"。Workspaceの最大目的=新規ユーザーが案件を作りorgが増えること。後で本体OSに統合。

### 公開制御は2層（別レイヤー・混同禁止）
**① middleware.js Basic認証（DEMO段階の外側の蓋）**
- env: BASIC_AUTH_USER / BASIC_AUTH_PASS（Vercel全環境）。未設定なら通さない safe-by-default。
- サイト全体をゲート。除外(Basic認証なしで通す)=
  - `/api`（startsWith）
  - `/assets/`（startsWith）
  - 拡張子付き静的ファイル（`js|mjs|css|svg|png|jpe?g|gif|webp|avif|ico|woff2?|ttf|otf`）
  - `/workspace`、`/workspace/`（完全一致）
  - `/login`、`/login/`（完全一致）
  - `/houses`、`/houses/`（完全一致）
  - `/clients`、`/clients/`（完全一致）
  - `/house/`（startsWith）
  - ⚠ `/admin`・`/signup`・`/ws-legal` は除外に含まれない → Basic認証が掛かる
- Basic認証はHTTPの蓋であり、Supabaseのデータ取得・RLS・admin判定には一切使われない（混同禁止）。

**② main.jsx HONTAI_PUBLIC + DevGuard（内側の本体公開制御）**
- `const HONTAI_PUBLIC = false`（src/main.jsx冒頭）
  - `false` = 本体(消費者向け)ルートは ADMIN_EMAIL でログイン中の管理者のみプレビュー可。他は /login へ。
  - `true`  = 本体も全公開（本番ローンチ時はこの1行だけ変える）。
- `_WS_ALLOW`（常時通すルート）= `['/login', '/signup', '/workspace', '/houses', '/clients', '/ws-legal', '/admin']` ＋ `startsWith('/house/')` ＋ `startsWith('/auth/')`
- DevGuard（main.jsx内）: 本体ルート(`!HONTAI_PUBLIC && !_isWsPath`)を `<DevGuard>` でラップ。`supabase.auth.getSession()` + `onAuthStateChange` で `email === ADMIN_EMAIL` の時のみ children を描画。確認中(checking)は null（本体を一瞬も描画しない＝戦略漏れ防止）、非管理者(deny)は /login へ。
- 認証コールバック(URLハッシュに `access_token` or `type=recovery`)が本体ルートに着地した場合は、元の search+hash 保持で /workspace へ転送（古い招待/再設定リンクの本体直行を防止）。

### /admin（管理ダッシュボード）
- `/admin` は `_WS_ALLOW` 入り（DevGuard対象外）。AdminDashboard.jsx 内で `getSession()` + `onAuthStateChange` の email 判定で認証（旧 localStorage 平文パスは廃止済）。
- `email === ADMIN_EMAIL` でなければサイドバー等を一切描画せず「管理者専用／ログインページへ」のみ。ログアウト = `signOut()` + /login。
- データ取得の前提 = ADMIN_EMAIL で Supabase ログイン中であること（会員一覧等は `/api/admin-users` が Bearer トークンの email を照合）。満たされないと黙って0件になる仕様（バグではない）。

### ADMIN_EMAIL（単一ソース）
- `src/adminEmail.js` → `export const ADMIN_EMAIL = 'gintetsu.fudosan@gmail.com'`
- AdminDashboard.jsx と main.jsx の DevGuard が両方ここから import（値のズレ防止）。

### データ保護
- 本物の顧客データは Supabase RLS ＋ Workspace認証 が守る。
- admin系API（`api/admin-users.js` / `admin-profile.js` / `admin-partners.js` / `admin-sellers.js` / `delete-user.js` / `update-partner-status.js`）は共通で `ADMIN_EMAILS = ['gintetsu.fudosan@gmail.com']` を Bearer トークンで照合し不一致なら 403。`SUPABASE_SERVICE_ROLE_KEY`（Vercel環境変数）を使用（2026-06-17 に存在・正常動作を確認）。

### 目標アーキテクチャ（サブドメイン分離）
理想は1アプリ1サブドメイン＋デプロイ分離：
- 本体 = house-ai.co.jp（OSの入口・各ツールへのリンク集だけ置く）
- Workspace = workspace.house-ai.co.jp
- 管理画面 = admin.house-ai.co.jp
- 将来ツール = tools.house-ai.co.jp

本体側は便利ツール（Workspace/AI重説/AI現調/物確…）の入口カードだけ置き、リンクで各サブドメインへ飛ばす＝スライスリリース戦略に最も合致。

### 移行Phase
- Phase1（済 2026-06-17）: /admin を ADMIN_EMAIL セッションでガード ＋ 本体ルートを DevGuard で管理者プレビュー化。
- Phase2: Workspace をサブドメイン分離。
- Phase3: admin を別デプロイ化。
- Phase4: 本体を各ツールへのリンク集として統合。
