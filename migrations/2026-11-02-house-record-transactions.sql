-- =====================================================================
-- F-2-7 段階2：取引履歴の正規化（house_record_transactions）
-- 適用：2026-11-02 14:13 JST（house-ai bbkjnetmdfdrzcedmbdn・SQL Editor・postgres）
-- 結果：COMMIT 前の検証 P1〜P5・V1〜V12 すべて合格。backfill 26件
-- 適用後の読み取り：26件・26ペア・例外0・組織不一致0・RLS有効・ポリシー3・トリガー2
-- 攻撃テスト（段階3・全体ロールバック）：22 / 22 PASS（2026-11-02 14:32）
-- 既知の例外：WS-2026-000023（9b735855-…）× カルテ 37ad1f64-… は組織不一致のため移行しない（元の jsonb に残す）
-- 元の house_records.transactions（jsonb）と transaction_count は変更していない（legacy）
-- 巻き戻し：house_record_transactions と関数 hrt_before_insert / hrt_before_update を削除（他に依存なし）
-- この記録は本番適用済みの SQL そのもの。再実行しないこと
-- =====================================================================
begin;

lock table public.house_records, public.workspaces, public.organizations
  in share row exclusive mode nowait;

create temp table _hrt_snap on commit drop as
select count(*) as n,
       md5(coalesce(string_agg(
             h.id::text || ':' || coalesce(h.transactions::text, 'null')
             || ':' || coalesce(h.transaction_count::text, 'null'),
             '|' order by h.id), '')) as hash
from public.house_records h;

create table public.house_record_transactions (
  id              uuid primary key default gen_random_uuid(),
  house_record_id uuid not null references public.house_records(id) on delete restrict,
  workspace_id    uuid not null references public.workspaces(id)    on delete restrict,
  org_id          uuid not null references public.organizations(id) on delete restrict,
  promoted_at     timestamptz not null default now(),
  completed_at    timestamptz not null,
  ws_code         text,
  agent_name      text,
  contract_type   text,
  customer_name   text,
  created_at      timestamptz not null default now(),
  constraint house_record_transactions_hr_ws_key unique (house_record_id, workspace_id)
);

create index house_record_transactions_workspace_id_idx on public.house_record_transactions (workspace_id);
create index house_record_transactions_org_id_idx       on public.house_record_transactions (org_id);

create function public.hrt_before_insert()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_hr_org uuid;
  v_ws_org uuid;
begin
  select h.org_id into v_hr_org
    from public.house_records h
   where h.id = new.house_record_id;
  if v_hr_org is null then
    raise exception 'hrt_parent_not_found' using errcode = '23503';
  end if;

  select w.org_id into v_ws_org
    from public.workspaces w
   where w.id = new.workspace_id;
  if not found then
    raise exception 'hrt_workspace_not_found' using errcode = '23503';
  end if;

  if v_ws_org is distinct from v_hr_org then
    raise exception 'hrt_org_mismatch' using errcode = '42501';
  end if;

  new.org_id := v_hr_org;
  return new;
end;
$$;

create function public.hrt_before_update()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.id              is distinct from old.id
  or new.house_record_id is distinct from old.house_record_id
  or new.workspace_id    is distinct from old.workspace_id
  or new.org_id          is distinct from old.org_id
  or new.promoted_at     is distinct from old.promoted_at
  or new.created_at      is distinct from old.created_at then
    raise exception 'hrt_immutable_column' using errcode = '42501';
  end if;
  return new;
end;
$$;

revoke execute on function public.hrt_before_insert() from public, anon, authenticated;
revoke execute on function public.hrt_before_update() from public, anon, authenticated;

create trigger trg_hrt_before_insert
  before insert on public.house_record_transactions
  for each row execute function public.hrt_before_insert();

create trigger trg_hrt_before_update
  before update on public.house_record_transactions
  for each row execute function public.hrt_before_update();

alter table public.house_record_transactions enable row level security;

revoke all on table public.house_record_transactions from public, anon, authenticated;
grant select on table public.house_record_transactions to authenticated;
grant insert (house_record_id, workspace_id, completed_at, ws_code, agent_name, contract_type, customer_name)
  on table public.house_record_transactions to authenticated;
grant update (completed_at, ws_code, agent_name, contract_type, customer_name)
  on table public.house_record_transactions to authenticated;

create policy hrt_select_own_org
  on public.house_record_transactions
  for select to authenticated
  using (org_id = public.current_org_id());

create policy hrt_insert_own_org_live_parent
  on public.house_record_transactions
  for insert to authenticated
  with check (
        org_id = public.current_org_id()
    and public.org_is_billable(public.current_org_id())
    and exists (
          select 1 from public.house_records h
           where h.id = house_record_transactions.house_record_id
             and h.deleted_at is null)
  );

create policy hrt_update_own_org
  on public.house_record_transactions
  for update to authenticated
  using (org_id = public.current_org_id())
  with check (
        org_id = public.current_org_id()
    and public.org_is_billable(public.current_org_id())
  );

create temp table _hrt_src on commit drop as
select h.id                                     as house_record_id,
       (e.elem->>'workspace_id')::uuid          as workspace_id,
       h.org_id                                 as hr_org,
       (e.elem->>'promoted_at')::timestamptz    as promoted_at,
       (e.elem->>'completed_at')::timestamptz   as completed_at,
       e.elem->>'ws_code'                       as ws_code,
       e.elem->>'agent_name'                    as agent_name,
       e.elem->>'contract_type'                 as contract_type,
       e.elem->>'customer_name'                 as customer_name
from public.house_records h
cross join lateral jsonb_array_elements(
  case when jsonb_typeof(h.transactions) = 'array' then h.transactions else '[]'::jsonb end
) with ordinality as e(elem, ord)
where not (h.id = '37ad1f64-0341-41c5-aa80-be5f4fcfa087'::uuid
           and e.elem->>'workspace_id' = '9b735855-e683-4384-81d1-1a17ed99273f');

-- P1〜P5（移行元 26行・26ペア・例外0・案件の存在・組織一致）と
-- V1〜V12（件数・例外・組織一致・中身一致・jsonb不変・RLS・ポリシー完全一致・ACL・列権限・トリガー・関数・制約）
-- の DO ブロックを本番では実行した（いずれも合格）。記録では省略する。

insert into public.house_record_transactions
  (house_record_id, workspace_id, org_id, promoted_at, completed_at,
   ws_code, agent_name, contract_type, customer_name)
select house_record_id, workspace_id, hr_org, promoted_at, completed_at,
       ws_code, agent_name, contract_type, customer_name
from _hrt_src;

commit;
