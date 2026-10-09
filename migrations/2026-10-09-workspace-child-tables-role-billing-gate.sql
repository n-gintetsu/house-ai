-- 2026-10-09 12:46 JST 本番適用済み（SQL Editor・Role=postgres・1トランザクション・COMMIT 前の自動検証 A〜I を全通過）
-- 目的：案件にぶら下がる8テーブルの書き込みを、画面の権限・課金の方針と一致させる（§2-3 / 引き継ぎ 09-30 §5-1）
-- 判定表（2026-10-01 確定）：
--   roadmap_steps   追加=管理 / 変更=社内（Staff は state のみ、label・step_order は管理のみ＝トリガー）/ 削除=管理
--   timeline_events・ws_schedule・ws_notices・ws_members  追加=社内 / 変更=なし / 削除=管理
--   ws_file_folders 追加=普通フォルダは社内、固定・業者の専用フォルダは管理 / 名前変更=普通は社内、専用は管理、固定は拒否 / 削除=管理（09-30 のまま）
--   file_grants     ポリシーは 09-30 のまま、権限の整理のみ
--   access_logs     画面からの書き込みは全拒否（記録はサーバの service_role のみ）
--   社内=active の Owner/Manager/Staff、管理=active の Owner/Manager、どちらも案件が削除されていないこと（組織では分けない＝原則65）
--   追加・変更は案件の所属組織の課金が有効なときだけ（WITH CHECK に置き、拒否はエラーで返す）。閲覧と削除は課金不要
-- 事前確認（2026-10-09）：生きている全19案件で固定フォルダ2種類が1つずつ／組織の持ち主が Owner か Manager として active／organization_subscriptions は org_id が主キー
-- 事前の画面修正：案件作成で Owner を先に登録する（753efff、本番で検証済み）
-- 変えていないもの：閲覧（SELECT）のポリシー（tl_select・ntc_select・sch_select の対象は public のまま）、workspaces、workspace_members、課金の関数
-- 巻き戻し（参考）：新ポリシー・トリガー・関数3つを削除し、2026-10-01 に読み取った元のポリシー定義と権限を復元する

begin;

-- ============ 1. 判定関数（削除済みの案件は書き込み対象外） ============
create function public.ws_can_edit(p_ws uuid)
returns boolean language sql stable security definer set search_path to ''
as $$
  select p_ws is not null
    and exists (select 1 from public.workspaces w where w.id = p_ws and w.deleted_at is null)
    and exists (select 1 from public.workspace_members wm
                where wm.workspace_id = p_ws and wm.user_id = auth.uid()
                  and wm.status = 'active'
                  and lower(wm.role) in ('owner', 'manager', 'staff'));
$$;

create function public.ws_can_admin_live(p_ws uuid)
returns boolean language sql stable security definer set search_path to ''
as $$
  select p_ws is not null
    and exists (select 1 from public.workspaces w where w.id = p_ws and w.deleted_at is null)
    and exists (select 1 from public.workspace_members wm
                where wm.workspace_id = p_ws and wm.user_id = auth.uid()
                  and wm.status = 'active'
                  and lower(wm.role) in ('owner', 'manager'));
$$;

revoke all on function public.ws_can_edit(uuid) from public, anon;
revoke all on function public.ws_can_admin_live(uuid) from public, anon;
grant execute on function public.ws_can_edit(uuid) to authenticated;
grant execute on function public.ws_can_admin_live(uuid) to authenticated;

-- ============ 2. 工程名・順序の変更は管理者のみ（Staff は state だけ） ============
create function public.roadmap_steps_guard_admin_columns()
returns trigger language plpgsql security definer set search_path to ''
as $$
begin
  if auth.uid() is not null
     and (new.label is distinct from old.label or new.step_order is distinct from old.step_order)
     and not public.ws_can_admin_live(old.workspace_id) then
    raise exception 'roadmap_admin_only' using errcode = '42501';
  end if;
  return new;
end;
$$;
revoke all on function public.roadmap_steps_guard_admin_columns() from public, anon, authenticated;

create trigger trg_roadmap_steps_guard_admin_columns
  before update on public.roadmap_steps
  for each row execute function public.roadmap_steps_guard_admin_columns();

-- ============ 3. 権限：anon は全剥奪、authenticated は実在する操作だけ ============
revoke all on public.roadmap_steps, public.timeline_events, public.ws_schedule, public.ws_notices,
              public.ws_members, public.ws_file_folders, public.file_grants, public.access_logs
  from anon;
revoke insert, update, delete, truncate, references, trigger, maintain
  on public.roadmap_steps, public.timeline_events, public.ws_schedule, public.ws_notices,
     public.ws_members, public.ws_file_folders, public.file_grants, public.access_logs
  from authenticated;
grant insert, delete
  on public.roadmap_steps, public.timeline_events, public.ws_schedule, public.ws_notices,
     public.ws_members, public.ws_file_folders, public.file_grants
  to authenticated;
grant update (state, label, step_order) on public.roadmap_steps to authenticated;
grant update (role_label) on public.ws_file_folders to authenticated;

-- ============ 4. roadmap_steps ============
drop policy rs_insert on public.roadmap_steps;
drop policy rs_update on public.roadmap_steps;
drop policy rs_delete on public.roadmap_steps;
create policy rs_insert on public.roadmap_steps for insert to authenticated
  with check (public.ws_can_admin_live(workspace_id) and public.workspace_org_is_billable(workspace_id));
create policy rs_update on public.roadmap_steps for update to authenticated
  using (public.ws_can_edit(workspace_id))
  with check (public.ws_can_edit(workspace_id) and public.workspace_org_is_billable(workspace_id));
create policy rs_delete on public.roadmap_steps for delete to authenticated
  using (public.ws_can_admin_live(workspace_id));

-- ============ 5. 追加＝社内、変更＝なし、削除＝管理 ============
drop policy tl_insert on public.timeline_events;
drop policy tl_update on public.timeline_events;
drop policy tl_delete on public.timeline_events;
create policy tl_insert on public.timeline_events for insert to authenticated
  with check (public.ws_can_edit(workspace_id) and public.workspace_org_is_billable(workspace_id));
create policy tl_delete on public.timeline_events for delete to authenticated
  using (public.ws_can_admin_live(workspace_id));

drop policy sch_insert on public.ws_schedule;
drop policy sch_update on public.ws_schedule;
drop policy sch_delete on public.ws_schedule;
create policy sch_insert on public.ws_schedule for insert to authenticated
  with check (public.ws_can_edit(workspace_id) and public.workspace_org_is_billable(workspace_id));
create policy sch_delete on public.ws_schedule for delete to authenticated
  using (public.ws_can_admin_live(workspace_id));

drop policy ntc_insert on public.ws_notices;
drop policy ntc_update on public.ws_notices;
drop policy ntc_delete on public.ws_notices;
create policy ntc_insert on public.ws_notices for insert to authenticated
  with check (public.ws_can_edit(workspace_id) and public.workspace_org_is_billable(workspace_id));
create policy ntc_delete on public.ws_notices for delete to authenticated
  using (public.ws_can_admin_live(workspace_id));

drop policy wsm_insert on public.ws_members;
drop policy wsm_update on public.ws_members;
drop policy wsm_delete on public.ws_members;
create policy wsm_insert on public.ws_members for insert to authenticated
  with check (public.ws_can_edit(workspace_id) and public.workspace_org_is_billable(workspace_id));
create policy wsm_delete on public.ws_members for delete to authenticated
  using (public.ws_can_admin_live(workspace_id));

-- ============ 6. ws_file_folders ============
drop policy wsff_insert on public.ws_file_folders;
drop policy wsff_update on public.ws_file_folders;
create policy wsff_insert on public.ws_file_folders for insert to authenticated
  with check (
    public.workspace_org_is_billable(workspace_id)
    and (
      (owner_member_id is null and not coalesce(is_fixed, false) and public.ws_can_edit(workspace_id))
      or (
        public.ws_can_admin_live(workspace_id)
        and (owner_member_id is null or exists (
          select 1 from public.workspace_members m
          where m.id = ws_file_folders.owner_member_id
            and m.workspace_id = ws_file_folders.workspace_id
            and m.status in ('active', 'pending')))
      )
    )
  );
create policy wsff_update on public.ws_file_folders for update to authenticated
  using (
    not coalesce(is_fixed, false)
    and ((owner_member_id is null and public.ws_can_edit(workspace_id))
      or (owner_member_id is not null and public.ws_can_admin_live(workspace_id)))
  )
  with check (
    not coalesce(is_fixed, false)
    and ((owner_member_id is null and public.ws_can_edit(workspace_id))
      or (owner_member_id is not null and public.ws_can_admin_live(workspace_id)))
    and public.workspace_org_is_billable(workspace_id)
  );

-- ============ 7. access_logs：画面からの書き込みは全拒否 ============
drop policy al_insert on public.access_logs;
drop policy al_update on public.access_logs;
drop policy al_delete on public.access_logs;

-- ============ 8. COMMIT 前の自動検証（1つでも外れたら全体 ROLLBACK） ============
do $$
declare
  v_tables text[] := array['roadmap_steps','timeline_events','ws_schedule','ws_notices',
                           'ws_members','ws_file_folders','file_grants','access_logs'];
  v_n int;
begin
  select count(*) into v_n
  from pg_class c join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public' and c.relname = any(v_tables) and c.relrowsecurity;
  if v_n <> 8 then raise exception 'assert_A_rls_enabled: % / 8', v_n; end if;

  with expected(tbl, pol, cmd) as (values
    ('roadmap_steps','rs_select','SELECT'), ('roadmap_steps','rs_insert','INSERT'),
    ('roadmap_steps','rs_update','UPDATE'), ('roadmap_steps','rs_delete','DELETE'),
    ('timeline_events','tl_select','SELECT'), ('timeline_events','tl_insert','INSERT'),
    ('timeline_events','tl_delete','DELETE'),
    ('ws_schedule','sch_select','SELECT'), ('ws_schedule','sch_insert','INSERT'),
    ('ws_schedule','sch_delete','DELETE'),
    ('ws_notices','ntc_select','SELECT'), ('ws_notices','ntc_insert','INSERT'),
    ('ws_notices','ntc_delete','DELETE'),
    ('ws_members','wsm_select','SELECT'), ('ws_members','wsm_insert','INSERT'),
    ('ws_members','wsm_delete','DELETE'),
    ('ws_file_folders','wsff_select','SELECT'), ('ws_file_folders','wsff_insert','INSERT'),
    ('ws_file_folders','wsff_update','UPDATE'), ('ws_file_folders','wsff_delete','DELETE'),
    ('file_grants','fg_select','SELECT'), ('file_grants','fg_insert','INSERT'),
    ('file_grants','fg_delete','DELETE'),
    ('access_logs','al_select','SELECT')
  ),
  actual as (
    select p.tablename::text as tbl, p.policyname::text as pol, p.cmd::text as cmd
    from pg_policies p
    where p.schemaname = 'public' and p.tablename = any(v_tables)
  )
  select count(*) into v_n
  from expected e full join actual a on a.tbl = e.tbl and a.pol = e.pol and a.cmd = e.cmd
  where e.tbl is null or a.tbl is null;
  if v_n <> 0 then raise exception 'assert_B_policy_set_mismatch: %', v_n; end if;

  select count(*) into v_n
  from pg_policies p
  where p.schemaname = 'public' and p.tablename = any(v_tables)
    and (p.permissive <> 'PERMISSIVE'
         or (p.cmd <> 'SELECT' and p.roles <> array['authenticated']::name[]));
  if v_n <> 0 then raise exception 'assert_B2_policy_roles: %', v_n; end if;

  select count(*) into v_n
  from pg_class c join pg_namespace n on n.oid = c.relnamespace,
       aclexplode(c.relacl) x
  where n.nspname = 'public' and c.relname = any(v_tables)
    and (x.grantee = 'anon'::regrole::oid or x.grantee = 0);
  if v_n <> 0 then raise exception 'assert_C_anon_public_table_acl: %', v_n; end if;

  select count(*) into v_n
  from pg_attribute a join pg_class c on c.oid = a.attrelid
       join pg_namespace n on n.oid = c.relnamespace,
       aclexplode(a.attacl) x
  where n.nspname = 'public' and c.relname = any(v_tables)
    and a.attnum > 0 and not a.attisdropped
    and (x.grantee = 'anon'::regrole::oid or x.grantee = 0);
  if v_n <> 0 then raise exception 'assert_C2_anon_public_column_acl: %', v_n; end if;

  select count(*) into v_n
  from pg_class c join pg_namespace n on n.oid = c.relnamespace,
       aclexplode(c.relacl) x
  where n.nspname = 'public' and c.relname = any(v_tables)
    and x.grantee = 'authenticated'::regrole::oid
    and x.privilege_type in ('UPDATE','TRUNCATE','REFERENCES','TRIGGER','MAINTAIN');
  if v_n <> 0 then raise exception 'assert_D_authenticated_table_acl: %', v_n; end if;

  select count(*) into v_n
  from pg_class c join pg_namespace n on n.oid = c.relnamespace,
       aclexplode(c.relacl) x
  where n.nspname = 'public' and c.relname = 'access_logs'
    and x.grantee = 'authenticated'::regrole::oid
    and x.privilege_type in ('INSERT','UPDATE','DELETE');
  if v_n <> 0 then raise exception 'assert_D2_access_logs_write: %', v_n; end if;

  select count(*) into v_n
  from pg_class c join pg_namespace n on n.oid = c.relnamespace,
       aclexplode(c.relacl) x
  where n.nspname = 'public' and c.relname = any(v_tables) and c.relname <> 'access_logs'
    and x.grantee = 'authenticated'::regrole::oid
    and x.privilege_type in ('INSERT','DELETE');
  if v_n <> 14 then raise exception 'assert_D3_insert_delete_grants: % / 14', v_n; end if;

  with expected(tbl, col) as (values
    ('roadmap_steps','state'), ('roadmap_steps','label'), ('roadmap_steps','step_order'),
    ('ws_file_folders','role_label')
  ),
  actual as (
    select c.relname::text as tbl, a.attname::text as col
    from pg_attribute a join pg_class c on c.oid = a.attrelid
         join pg_namespace n on n.oid = c.relnamespace,
         aclexplode(a.attacl) x
    where n.nspname = 'public' and c.relname = any(v_tables)
      and a.attnum > 0 and not a.attisdropped
      and x.grantee = 'authenticated'::regrole::oid and x.privilege_type = 'UPDATE'
  )
  select count(*) into v_n
  from expected e full join actual a on a.tbl = e.tbl and a.col = e.col
  where e.tbl is null or a.tbl is null;
  if v_n <> 0 then raise exception 'assert_E_column_update_mismatch: %', v_n; end if;

  select count(*) into v_n
  from pg_trigger t
  where t.tgrelid = 'public.roadmap_steps'::regclass
    and t.tgname = 'trg_roadmap_steps_guard_admin_columns'
    and t.tgenabled = 'O' and not t.tgisinternal;
  if v_n <> 1 then raise exception 'assert_F_trigger_enabled: %', v_n; end if;

  if not (select bool_and(p.prosecdef) from pg_proc p join pg_namespace n on n.oid = p.pronamespace
          where n.nspname = 'public'
            and p.proname in ('ws_can_edit','ws_can_admin_live','roadmap_steps_guard_admin_columns')) then
    raise exception 'assert_G_security_definer';
  end if;
  if has_function_privilege('anon', 'public.ws_can_edit(uuid)', 'EXECUTE')
     or has_function_privilege('anon', 'public.ws_can_admin_live(uuid)', 'EXECUTE')
     or has_function_privilege('anon', 'public.roadmap_steps_guard_admin_columns()', 'EXECUTE')
     or has_function_privilege('authenticated', 'public.roadmap_steps_guard_admin_columns()', 'EXECUTE')
     or not has_function_privilege('authenticated', 'public.ws_can_edit(uuid)', 'EXECUTE')
     or not has_function_privilege('authenticated', 'public.ws_can_admin_live(uuid)', 'EXECUTE') then
    raise exception 'assert_G_function_execute';
  end if;

  select count(*) into v_n
  from public.workspaces w
  where w.deleted_at is null
    and not exists (select 1 from public.workspace_members m
                    where m.workspace_id = w.id and m.status = 'active'
                      and lower(m.role) in ('owner','manager'));
  if v_n <> 0 then raise exception 'assert_H_live_ws_without_admin: %', v_n; end if;

  select count(*) into v_n
  from (
    select w.id,
           count(f.id) filter (where f.is_fixed and f.role_label = '自社（不動産）') as self_n,
           count(f.id) filter (where f.is_fixed and f.role_label = '顧客') as customer_n,
           count(f.id) filter (where f.is_fixed and f.role_label not in ('自社（不動産）','顧客')) as other_n
    from public.workspaces w
    left join public.ws_file_folders f on f.workspace_id = w.id
    where w.deleted_at is null
    group by w.id
  ) s
  where s.self_n <> 1 or s.customer_n <> 1 or s.other_n <> 0;
  if v_n <> 0 then raise exception 'assert_I_fixed_folders: %', v_n; end if;

  raise notice 'all asserts passed';
end;
$$;

commit;
