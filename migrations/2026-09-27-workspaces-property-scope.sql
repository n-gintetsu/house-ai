-- =====================================================================
-- workspaces: 案件側の物件情報を受ける4列を追加（F-2-3 第1段）
--
-- 適用日 : 2026-09-27
-- 対象DB : Supabase house-ai (bbkjnetmdfdrzcedmbdn)
--
-- ★本番の Supabase SQL Editor で実行済み。このファイルは記録と再現用。
--
-- 背景:
--   案件作成時に「この案件は特定の不動産に関する案件か」を記録し、
--   物件ありの場合の種別・建物名・部屋番号を受けるための器。
--   案件を作れる条件と家カルテを作れる条件を分離する設計に対応する。
--
-- property_scope の3状態:
--   'property'     特定の不動産に関する案件
--   'non_property' 不動産に紐づかない（名刺作成・Web制作・決算など）
--   'undecided'    まだ未定（物件探し・購入相談など）※既定値
--
--   'undecided' は「データ不足」ではなく正式な業務状態として定義する。
--   「案件は存在するが property_id はまだ存在しない」を表現するため、
--   null や空文字ではなく明示的な値にしている。
--
-- 設計判断:
--   - property_scope は3状態が仕様として閉じているため CHECK を付ける。
--   - property_type は今後増える蓋然性が高いため CHECK を付けない。
--     値域はフロントの <select> で閉じる（contract_type と同じ流儀。
--     contract_type も11値だが DB に CHECK は無い）。
--   - 値は英字スラッグにし、表示文言と分離する。
--     workspaces.status（'進行中'/'完了'）や ws_file_folders.role_label（'顧客'）が
--     日本語値のため、表示を変えるときに DB 値を書き換えられない問題が既にある。
--   - 既存行のバックフィル（house_record_id があるものを 'property' にする等）は
--     ここでは行わない。F-2-6（既存データの掃除）で扱う。
--
-- 適用時の実測:
--   既存 workspaces 49件がすべて property_scope = 'undecided' になった。
--   CHECK の攻撃テスト（ロールバック付き）: bogus=rejected / valid=accepted
--   アプリ経路で新規作成した案件（WS-2026-000050）も 'undecided' になることを確認。
-- =====================================================================

begin;

alter table public.workspaces
  add column property_scope text not null default 'undecided',
  add column property_type  text,
  add column building_name  text,
  add column unit_no        text;

alter table public.workspaces
  add constraint workspaces_property_scope_check
    check (property_scope in ('property', 'non_property', 'undecided'));

commit;

-- ---------------------------------------------------------------------
-- 巻き戻し
-- ---------------------------------------------------------------------
-- ★コードがこれらの列を書くようになった後は実質戻せない。
--   drop column で入力済みの値が失われ、復元できない。
--   順序は「コード → DDL」の逆順で戻すこと。
--
-- begin;
-- alter table public.workspaces
--   drop constraint if exists workspaces_property_scope_check;
-- alter table public.workspaces
--   drop column if exists unit_no,
--   drop column if exists building_name,
--   drop column if exists property_type,
--   drop column if exists property_scope;
-- commit;
