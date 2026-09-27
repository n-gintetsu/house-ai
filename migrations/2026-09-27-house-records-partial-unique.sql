-- =====================================================================
-- house_records: UNIQUE (org_id, address_key) を部分ユニークインデックスへ張り替え
--
-- 適用日 : 2026-09-27
-- 対象DB : Supabase house-ai (bbkjnetmdfdrzcedmbdn)
--
-- ★本番の Supabase SQL Editor で実行済み。このファイルは記録と再現用。
--
-- 背景:
--   論理削除済み（deleted_at IS NOT NULL）の家カルテが
--   UNIQUE (org_id, address_key) のスロットを占有し続け、
--   同じ住所で家カルテを作り直せなくなっていた。
--
-- 適用前の実測（ロールバック付きテスト・本番）:
--   T1 削除済みと同じキーで新規作成   -> unique_violation
--   T2 生存2件目の作成                -> unique_violation
--   T3 T1を論理削除して再作成         -> unique_violation
--
-- 適用後の実測:
--   T1 -> inserted / T2 -> unique_violation / T3 -> inserted
--
-- 注意:
--   これは address_key 方式を安全に延命するための止血であり、
--   「同じ住所＝同じ不動産」という前提を正当化するものではない。
--   同一住所の別住戸・別棟は依然として表現できない。
--   恒久的な物件identity（property_id / property_type / building_name / unit_no）
--   の設計は F-2 本体で別途進める。
--
--   この変更により、同一 address_key の行が「生存1件＋削除N件」で
--   並び得るようになる。昇格時のルックアップは deleted_at を
--   除外する必要がある（同日の B-7-d で対応）。
-- =====================================================================

begin;

create unique index house_records_org_address_key_active
  on public.house_records (org_id, address_key)
  where deleted_at is null;

alter table public.house_records
  drop constraint house_records_org_address_key;

commit;

-- ---------------------------------------------------------------------
-- 巻き戻し（重複が無いことを確認してから実行すること）
-- ---------------------------------------------------------------------
-- select org_id, address_key, count(*) from public.house_records
--  group by org_id, address_key having count(*) > 1;
--
-- begin;
-- alter table public.house_records
--   add constraint house_records_org_address_key unique (org_id, address_key);
-- drop index if exists public.house_records_org_address_key_active;
-- commit;
