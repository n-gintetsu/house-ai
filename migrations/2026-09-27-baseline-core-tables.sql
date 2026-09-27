-- =====================================================================
-- House-AI Workspace / 中核3テーブルの現状定義（ベースライン記録）
--
-- 作成日   : 2026-09-27
-- 対象DB   : Supabase house-ai (bbkjnetmdfdrzcedmbdn)
-- 取得方法 : information_schema / pg_catalog を Supabase SQL Editor で照会
--
-- ★このファイルは実行用の migration ではありません。
-- ★本番に既に存在する定義を記録した「正本」です。そのまま実行しないでください。
-- ★FK が循環しているため（workspaces <-> house_records <-> client_records）、
--   この順序では再実行できません。再構築が必要な場合は
--   「全テーブルを CREATE してから FK を ALTER で追加」の順に組み替えてください。
--
-- 以降の schema 変更は、このファイルを起点に
--   migrations/YYYY-MM-DD-<変更内容>.sql
-- として 1変更1ファイルで積んでいきます。
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1. house_records（家カルテ）
-- ---------------------------------------------------------------------
create table public.house_records (
  id                  uuid        not null default gen_random_uuid(),
  address_key         text        not null,
  address_raw         text,
  property_name       text,
  contract_type       text,
  latest_workspace_id uuid,
  snapshot            jsonb       not null default '{}'::jsonb,
  transactions        jsonb       not null default '[]'::jsonb,
  transaction_count   integer     not null default 0,
  first_completed_at  timestamptz,
  last_completed_at   timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  org_id              uuid,
  created_by          uuid,
  deleted_at          timestamptz,
  deleted_by          uuid,
  constraint house_records_pkey primary key (id),
  constraint house_records_org_address_key unique (org_id, address_key)
);

-- ---------------------------------------------------------------------
-- 2. client_records（顧客カルテ）
-- ---------------------------------------------------------------------
create table public.client_records (
  id                   uuid        not null default gen_random_uuid(),
  name                 text        not null,
  name_kana            text,
  contact_email        text,
  contact_phone        text,
  notes                text,
  last_workspace_id    uuid,
  last_house_record_id uuid,
  deal_count           integer     not null default 0,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  org_id               uuid,
  created_by           uuid,
  deleted_at           timestamptz,
  deleted_by           uuid,
  constraint client_records_pkey primary key (id)
);

-- ---------------------------------------------------------------------
-- 3. workspaces（案件）
-- ---------------------------------------------------------------------
create table public.workspaces (
  id                uuid        not null default gen_random_uuid(),
  ws_code           text        not null,
  title             text        not null,
  customer_name     text,
  agent_name        text,
  contract_type     text        not null,
  status            text        not null default '進行中'::text,
  progress          integer     not null default 0,
  property_address  text,
  completed_at      timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  house_record_id   uuid,
  client_record_id  uuid,
  promoted_at       timestamptz,
  org_id            uuid,
  created_by        uuid,
  deleted_at        timestamptz,
  deleted_by        uuid,
  constraint workspaces_pkey primary key (id),
  constraint workspaces_ws_code_key unique (ws_code)
);

-- ---------------------------------------------------------------------
-- 4. 外部キー（循環しているため、全テーブル作成後にまとめて追加）
-- ---------------------------------------------------------------------
alter table public.house_records
  add constraint house_records_latest_workspace_id_fkey
    foreign key (latest_workspace_id) references public.workspaces(id) on delete set null,
  add constraint house_records_org_id_fkey
    foreign key (org_id) references public.organizations(id);

alter table public.client_records
  add constraint client_records_last_workspace_id_fkey
    foreign key (last_workspace_id) references public.workspaces(id) on delete set null,
  add constraint client_records_last_house_record_id_fkey
    foreign key (last_house_record_id) references public.house_records(id) on delete set null,
  add constraint client_records_org_id_fkey
    foreign key (org_id) references public.organizations(id);

alter table public.workspaces
  add constraint workspaces_house_record_id_fkey
    foreign key (house_record_id) references public.house_records(id) on delete set null,
  add constraint workspaces_client_record_id_fkey
    foreign key (client_record_id) references public.client_records(id) on delete set null,
  add constraint workspaces_org_id_fkey
    foreign key (org_id) references public.organizations(id);

-- ---------------------------------------------------------------------
-- 5. インデックス（PK / UNIQUE 制約に付随するもののみ。独立インデックスは無し）
-- ---------------------------------------------------------------------
-- house_records_pkey            : unique btree (id)
-- house_records_org_address_key : unique btree (org_id, address_key)
-- client_records_pkey           : unique btree (id)
-- workspaces_pkey               : unique btree (id)
-- workspaces_ws_code_key        : unique btree (ws_code)

-- ---------------------------------------------------------------------
-- 6. RLS
-- ---------------------------------------------------------------------
alter table public.house_records  enable row level security;  -- forced = false
alter table public.client_records enable row level security;  -- forced = false
alter table public.workspaces     enable row level security;  -- forced = false

-- house_records
create policy house_records_select_own_org on public.house_records
  for select to authenticated
  using (org_id = current_org_id());

create policy house_records_insert_own_org on public.house_records
  for insert to authenticated
  with check ((org_id = current_org_id()) and org_is_billable(current_org_id()));

create policy house_records_update_own_org on public.house_records
  for update to authenticated
  using (org_id = current_org_id())
  with check ((org_id = current_org_id()) and org_is_billable(current_org_id()));
-- ※ DELETE ポリシーは無し（物理削除は不可。論理削除のみ）

-- client_records
create policy client_records_select_own_org on public.client_records
  for select to authenticated
  using (org_id = current_org_id());

create policy client_records_insert_own_org on public.client_records
  for insert to authenticated
  with check ((org_id = current_org_id()) and org_is_billable(current_org_id()));

create policy client_records_update_own_org on public.client_records
  for update to authenticated
  using (org_id = current_org_id())
  with check ((org_id = current_org_id()) and org_is_billable(current_org_id()));
-- ※ DELETE ポリシーは無し

-- workspaces
create policy workspaces_select_org_or_member on public.workspaces
  for select to authenticated
  using (can_access_workspace(id));

create policy workspaces_insert_own_org on public.workspaces
  for insert to authenticated
  with check (
    (current_org_id() is not null)
    and ((org_id is null) or (org_id = current_org_id()))
    and org_is_billable(current_org_id())
  );

create policy workspaces_update_own_org on public.workspaces
  for update to authenticated
  using (org_id = current_org_id())
  with check ((org_id = current_org_id()) and org_is_billable(current_org_id()));

create policy workspaces_delete_own_org on public.workspaces
  for delete to authenticated
  using (org_id = current_org_id());

-- ---------------------------------------------------------------------
-- 7. トリガー（関数本体は 2026-09-27-baseline-shared-functions.sql を参照）
-- ---------------------------------------------------------------------
create trigger trg_set_org_id_house_records
  before insert on public.house_records
  for each row execute function set_org_id_from_current();

create trigger trg_house_records_lifecycle
  before insert or update on public.house_records
  for each row execute function enforce_record_lifecycle();

create trigger trg_guard_deleted_at
  before update on public.house_records
  for each row execute function guard_deleted_at_basic();

create trigger trg_set_org_id_client_records
  before insert on public.client_records
  for each row execute function set_org_id_from_current();

create trigger trg_client_records_lifecycle
  before insert or update on public.client_records
  for each row execute function enforce_record_lifecycle();

create trigger trg_guard_deleted_at
  before update on public.client_records
  for each row execute function guard_deleted_at_basic();

create trigger trg_set_org_id_workspaces
  before insert on public.workspaces
  for each row execute function set_org_id_from_current();

create trigger trg_workspaces_lifecycle
  before insert or update on public.workspaces
  for each row execute function enforce_record_lifecycle();

create trigger trg_guard_deleted_at
  before update on public.workspaces
  for each row execute function guard_deleted_at_workspace();

create trigger trg_log_ws_code
  after insert on public.workspaces
  for each row execute function log_ws_code();

-- ---------------------------------------------------------------------
-- 8. 権限（2026-09-27 時点の実際の状態。※ 是正予定あり。下部メモ参照）
-- ---------------------------------------------------------------------
-- 3テーブルとも以下が付与されている：
--   anon          : DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE
--   authenticated : DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE
--   postgres      : DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE
--   service_role  : DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE

-- =====================================================================
-- 既知の問題（2026-09-27 時点・未修正）
--
-- [1] anon に DELETE / INSERT / UPDATE / TRUNCATE が付与されている。
--     Supabase が public スキーマの新規テーブルに自動付与するデフォルト権限。
--     SELECT/INSERT/UPDATE/DELETE は RLS（anon 向けポリシーがゼロ）で全拒否されるが、
--     TRUNCATE は RLS を迂回する。PostgREST は TRUNCATE を公開しないため直接は到達
--     できないが、権限としては誤り。REVOKE ALL ... FROM anon で是正予定。
--
-- [2] UNIQUE (org_id, address_key) が論理削除済みの行も対象にしている。
--     deleted_at が入った家カルテの address_key が UNIQUE スロットを占有し続けるため、
--     同じ住所で家カルテを作り直せない。
--     さらに昇格時のルックアップ（WorkspacePage.jsx / MobileWorkspaceLayout.jsx）が
--     deleted_at を除外していないため、削除済みカルテに transactions が append され、
--     一覧に出ないカルテへ案件が紐づく。
--     対策: UNIQUE (org_id, address_key) WHERE deleted_at IS NULL（部分ユニーク）へ張替え
--           ＋ ルックアップに deleted_at 除外を追加（DDL を先、コードを後）。
--
-- [3] transactions (jsonb) に (house_record_id, workspace_id) の一意性が無い。
--     同一 workspace_id が複数 append された実績あり（本番で10回）。
--     transaction_count はクライアント側の read-modify-write で算出しており lost update する。
--
-- [4] 削除権限のモデルが2系統ある。
--     enforce_record_lifecycle : is_org_admin() または（作成者本人 かつ 未完了）
--     guard_deleted_at_*       : organizations.owner_id または 作成者本人
--     両方を通る必要があるため、owner 以外の org 管理者は他人のレコードを削除できない。
--
-- [5] DELETE ポリシーの有無が不揃い。
--     house_records / client_records には DELETE ポリシーが無く物理削除は不可（正しい）。
--     workspaces にのみ workspaces_delete_own_org があり物理削除の口が開いている。
--
-- [6] workspaces に customer_email 列が存在しない。
--     案件作成フォームの state には customer_email があるが保存先が無い。要確認。
-- =====================================================================
