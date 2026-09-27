-- =====================================================================
-- house_records: 不動産entity側の物件属性4列と照合用インデックスを追加（F-2-3 第2段）
--
-- 適用日 : 2026-09-27
-- 対象DB : Supabase house-ai (bbkjnetmdfdrzcedmbdn)
--
-- ★本番の Supabase SQL Editor で実行済み。このファイルは記録と再現用。
--
-- 背景:
--   「家カルテ1枚＝独立して取引・管理される不動産単位」という方針に対応する器。
--   区分マンションの201号室と202号室、同一敷地の別棟を別カルテとして
--   表現できるようにする。
--
-- identity の関係（重要）:
--   house_records.id = House-AI 内部の不変 property_id（identity）
--   match_key        = 重複候補を探すための検索キー（identity ではない）
--   NULL             = まだ照合キーを生成していない
--   同じ match_key が複数存在するのは正常
--
--   したがって match_key に UNIQUE は付けない。
--   同一住所に 201号室・202号室、同一敷地の別棟、土地と建物が併存するため、
--   一意制約を付けると2件目の登録が 23505 で失敗する。
--
-- 外部IDとの分離:
--   地番 / 家屋番号 / 不動産番号 / 国交省の不動産ID は今回追加しない。
--   これらは House-AI の identity ではなく、将来「接続」する外部識別子。
--   不動産IDは不動産番号13桁＋特定コード4桁を基本とするが、2026年現在
--   国交省が2027年度の試験運用に向けてルールを再検討中のため、
--   現行仕様に DB を固定しない。必要になった段階で
--   lot_number / building_number / real_estate_number / real_estate_id 等を
--   別概念として追加する。
--
-- インデックスの設計:
--   - org_id を先頭に置く。RLS の SELECT ポリシーが org_id = current_org_id() で、
--     実クエリは必ず org_id で絞られるため。
--   - deleted_at is null：ルックアップは生存行だけを見る（B-7-d で変更済み）。
--   - match_key is not null：PostgreSQL の B-tree は NULL も索引に格納するため、
--     この述語が無いと未生成の行がすべて索引に入る。
--     候補検索は match_key = ? の形でしか使わないので NULL は不要。
--     match_key = ? は strict 演算子なので match_key is not null を含意し、
--     プランナはこの部分インデックスを使える。
--
-- 適用時の実測:
--   既存 house_records 16件（論理削除済みを含む全行。生存は6件）すべてで4列が NULL。
--   非UNIQUE の実証（ロールバック付き）:
--     生存2行に同じ match_key を入れて same_match_key=accepted
-- =====================================================================

begin;

alter table public.house_records
  add column property_type text,
  add column building_name text,
  add column unit_no       text,
  add column match_key     text;

create index house_records_match_key_active_idx
  on public.house_records (org_id, match_key)
  where deleted_at is null
    and match_key is not null;

commit;

-- ---------------------------------------------------------------------
-- 巻き戻し
-- ---------------------------------------------------------------------
-- ★コードがこれらの列を書くようになった後は実質戻せない（第1段と同じ）。
--
-- begin;
-- drop index if exists public.house_records_match_key_active_idx;
-- alter table public.house_records
--   drop column if exists match_key,
--   drop column if exists unit_no,
--   drop column if exists building_name,
--   drop column if exists property_type;
-- commit;
