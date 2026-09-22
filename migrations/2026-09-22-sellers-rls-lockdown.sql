-- sellers / seller_activities のアクセスを service_role のみに閉じる
-- 実行日: 2026-09-22（本番 Supabase で実行済み。このファイルは記録と再現用）
--
-- ── 背景 ────────────────────────────────────────────────────────────────
-- 既存ポリシー "staff full access" が authenticated 全体に効いており、
-- 一般会員として登録しただけのユーザーでも全売主の氏名・メール・電話・住所を
-- 読み書きできる状態だった。
-- "seller token access" は app.seller_token を参照していたが、アプリ側に
-- set_config を行うコードが存在せず、機能していなかった。
--
-- ── 方針 ────────────────────────────────────────────────────────────────
-- ポリシーを 0 件にし、テーブル権限も revoke する。
-- service_role は RLS をバイパスするため、"TO service_role" のポリシーは書かない。
-- ポリシーを書くと TO 句の付け忘れで PUBLIC に効いてしまう事故が起きるため、
-- 「何も書かない」ことをそのまま認可の表明とする。
--
-- ── アプリへの影響 ──────────────────────────────────────────────────────
-- なし。両テーブルに触れる経路はすべて service_role の API 経由である。
--   api/admin-sellers.js   GET/POST  稼働中   service_role
--   api/seller.js          GET       503 停止中（Phase S0）
--   api/seller-report.js   GET       503 停止中（Phase S0）
-- anon / authenticated クライアントから直接触るコードは 1 箇所も存在しない。

begin;

-- 1) RLS を有効化（既に有効。冪等性のため明示する）
alter table public.sellers            enable row level security;
alter table public.seller_activities  enable row level security;

-- 2) 既存ポリシーを削除してポリシー 0 件にする
drop policy if exists "staff full access"   on public.sellers;
drop policy if exists "seller token access" on public.sellers;
drop policy if exists "staff full access"   on public.seller_activities;
drop policy if exists "seller token access" on public.seller_activities;

-- 3) テーブル権限を revoke する
--    RLS はポリシーの評価であり、GRANT された権限そのものは別。両方を閉じる。
revoke all on public.sellers           from anon, authenticated;
revoke all on public.seller_activities from anon, authenticated;

commit;

-- ── 確認用（読み取りのみ。上の変更とは独立して実行できる）──────────────
--
-- ポリシーが 0 件であること:
--   select tablename, policyname from pg_policies
--    where schemaname = 'public' and tablename in ('sellers','seller_activities');
--
-- RLS が有効であること:
--   select relname, relrowsecurity from pg_class
--    where relnamespace = 'public'::regnamespace
--      and relname in ('sellers','seller_activities');
--
-- authenticated に権限が残っていないこと:
--   select has_table_privilege('authenticated','public.sellers','select')            as sel,
--          has_table_privilege('authenticated','public.sellers','update')            as upd,
--          has_table_privilege('authenticated','public.seller_activities','select')  as act_sel,
--          has_table_privilege('authenticated','public.seller_activities','update')  as act_upd;
--   -- いずれも false になること

-- ── 残っている宿題（このファイルの対象外）────────────────────────────────
-- 売主ポータル（api/seller.js / api/seller-report.js）の再開には、
-- access_token の有効期限・失効・レート制限の設計が必要。
-- 詳細は各ファイルの [Phase S0] コメントを参照。
