
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

## 永久ルール（全セッション共通）

- `??` 禁止 → `||` 使用
- `&&` 条件JSX禁止 → 三項演算子 `: null`
- 絵文字禁止（チャット内AIレスポンスは許可）
- `backdrop-filter` 禁止
- `100vw` 禁止
- `WebkitBackgroundClip`・`WebkitTextFillColor` 禁止
- fontWeight: 400/500のみ（600/700/900禁止）
- input/textarea fontSize最低16px（iOS zoom防止）
- framer-motion import は `'framer-motion'`
- インラインstyleのみ（Tailwindクラス禁止）
- TypeScript禁止（JSXのみ）
- `npm run build && git push` の順厳守
- noResultTest は常に false
- house-ai（bbkjnetmdfdrzcedmbdn）とgintetsu-fudosan混在禁止

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

## 過去の失敗パターン（同じ失敗をしないこと）

1. **画像の黒背景問題** → favicon.pngの黒背景はデザインの一部。「黒背景が問題」と判断して変更したことで長時間ロゴが壊れた。動いている画像は触らない
2. **指示範囲外の変更** → 1箇所の修正指示で関係ない箇所まで変更してしまった。指示された箇所のみ変更すること
3. **推測で進める** → コードを確認せず推測で修正指示を出し続けた。必ず該当コードを確認してから修正すること
4. **同じ修正を繰り返す** → 修正が効いていない場合は原因を特定してから再修正する

---

## セッション開始時の確認コマンド
