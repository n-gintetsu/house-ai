-- 2026-11-02 12:33 JST 本番適用済み（SQL Editor・Role=postgres・1トランザクション・COMMIT 前の自動検証 A〜F を全通過）
-- 目的：P2（物理削除の監査）。authenticated / anon のクライアントから、案件・家カルテ・顧客カルテ・組織を物理削除・TRUNCATE できる経路をなくす
-- 発見：workspaces_delete_own_org により、組織の持ち主は API を直接呼べば案件を物理削除できた（14テーブルが CASCADE で連鎖削除、access_logs も消える）
--       4テーブルとも anon・authenticated に全権限（TRUNCATE を含む）が付いていた。RLS は4テーブルとも有効
-- 事前確認（2026-11-02）：
--   画面の削除はすべて soft_delete_workspace / soft_delete_house_record / soft_delete_client_record（SECURITY DEFINER・deleted_at の UPDATE のみ）
--   src・api・リポジトリ直下に、4テーブルを .delete() / TRUNCATE するコードは0件（api の createClient は全て service_role）
--   ログイン前に4テーブルを読むコード経路は0件（全て WorkspaceAuthGuard の中）
-- 変えていないもの：authenticated の SELECT・INSERT・UPDATE、他のポリシー、論理削除の RPC、service_role
-- 適用後の検証：攻撃テスト13項目すべて PASS（持ち主の DELETE・TRUNCATE は 42501、閲覧と soft_delete は成功、anon は閲覧も 42501）、画面6項目 OK
-- 巻き戻し（参考）：workspaces_delete_own_org を同じ定義（for delete to authenticated using (org_id = current_org_id())）で作り直し、外した権限を付け直す

begin;

-- 1. 案件の物理削除の経路をなくす（削除は soft_delete_* RPC のみ）
drop policy workspaces_delete_own_org on public.workspaces;

-- 2. anon は全権限を外す
revoke all on public.workspaces, public.house_records, public.client_records, public.organizations
  from anon;

-- 3. authenticated から削除系・テーブル全体の操作の権限を外す
revoke delete, truncate, references, trigger, maintain
  on public.workspaces, public.house_records, public.client_records, public.organizations
  from authenticated;

-- 4. COMMIT 前の自動検証（1つでも外れたら全体 ROLLBACK）
do $$
declare
  v_tables text[] := array['workspaces','house_records','client_records','organizations'];
  v_n int;
begin
  select count(*) into v_n from pg_class c
  where c.relnamespace = 'public'::regnamespace and c.relname = any(v_tables) and c.relrowsecurity;
  if v_n <> 4 then raise exception 'assert_A_rls: % / 4', v_n; end if;

  select count(*) into v_n from pg_policies p
  where p.schemaname = 'public' and p.tablename = any(v_tables) and p.cmd in ('DELETE','ALL');
  if v_n <> 0 then raise exception 'assert_B_delete_policy: %', v_n; end if;

  select count(*) into v_n
  from pg_class c, aclexplode(c.relacl) x
  where c.relnamespace = 'public'::regnamespace and c.relname = any(v_tables)
    and (x.grantee = 'anon'::regrole::oid or x.grantee = 0);
  if v_n <> 0 then raise exception 'assert_C_anon_public_table_acl: %', v_n; end if;

  select count(*) into v_n
  from pg_attribute a join pg_class c on c.oid = a.attrelid,
       aclexplode(a.attacl) x
  where c.relnamespace = 'public'::regnamespace and c.relname = any(v_tables)
    and a.attnum > 0 and not a.attisdropped
    and (x.grantee = 'anon'::regrole::oid or x.grantee = 0);
  if v_n <> 0 then raise exception 'assert_C2_anon_public_column_acl: %', v_n; end if;

  select count(*) into v_n
  from unnest(v_tables) t,
       (values ('DELETE'),('TRUNCATE'),('REFERENCES'),('TRIGGER'),('MAINTAIN')) r(priv)
  where has_table_privilege('authenticated', 'public.' || t, r.priv);
  if v_n <> 0 then raise exception 'assert_D_authenticated_effective: %', v_n; end if;

  select count(*) into v_n
  from unnest(v_tables) t,
       (values ('SELECT'),('INSERT'),('UPDATE'),('DELETE'),('TRUNCATE'),('REFERENCES'),('TRIGGER'),('MAINTAIN')) r(priv)
  where has_table_privilege('anon', 'public.' || t, r.priv);
  if v_n <> 0 then raise exception 'assert_D2_anon_table_effective: %', v_n; end if;

  select count(*) into v_n
  from unnest(v_tables) t,
       (values ('SELECT'),('INSERT'),('UPDATE'),('REFERENCES')) r(priv)
  where has_any_column_privilege('anon', 'public.' || t, r.priv);
  if v_n <> 0 then raise exception 'assert_D2_anon_column_effective: %', v_n; end if;

  select count(*) into v_n
  from unnest(v_tables) t, (values ('SELECT'),('INSERT'),('UPDATE')) r(priv)
  where has_table_privilege('authenticated', 'public.' || t, r.priv);
  if v_n <> 12 then raise exception 'assert_E_authenticated_kept: % / 12', v_n; end if;

  select count(*) into v_n from pg_proc p
  where p.pronamespace = 'public'::regnamespace and p.prosecdef
    and p.proname in ('soft_delete_workspace','soft_delete_house_record','soft_delete_client_record')
    and has_function_privilege('authenticated', p.oid, 'EXECUTE');
  if v_n <> 3 then raise exception 'assert_F_soft_delete_rpc: % / 3', v_n; end if;

  raise notice 'all asserts passed';
end;
$$;

commit;
