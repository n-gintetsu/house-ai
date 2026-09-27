-- =====================================================================
-- House-AI Workspace / 共有関数の現状定義（ベースライン記録）
--
-- 作成日   : 2026-09-27
-- 対象DB   : Supabase house-ai (bbkjnetmdfdrzcedmbdn)
-- 取得方法 : pg_get_functiondef() を Supabase SQL Editor で照会
--
-- ★実行用ではなく記録用です。
-- ★これらの関数は house_records / client_records / workspaces 以外の
--   テーブルからも使われています。変更時は影響範囲を必ず確認してください。
--
-- 収録: can_access_workspace / current_org_id / enforce_record_lifecycle /
--       guard_deleted_at_basic / guard_deleted_at_workspace / is_org_admin /
--       log_ws_code / org_is_billable / set_org_id_from_current
-- =====================================================================

-- ---- can_access_workspace ----
CREATE OR REPLACE FUNCTION public.can_access_workspace(ws_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select
    exists (
      select 1 from public.workspaces w
      where w.id = ws_id
        and w.org_id = public.current_org_id()
    )
    or exists (
      select 1 from public.workspace_members wm
      where wm.workspace_id = ws_id
        and wm.user_id = auth.uid()
        and wm.status = 'active'
    );
$function$

-- ---- current_org_id ----
CREATE OR REPLACE FUNCTION public.current_org_id()
 RETURNS uuid
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select org_id from public.profiles where id = auth.uid()
$function$

-- ---- enforce_record_lifecycle ----
CREATE OR REPLACE FUNCTION public.enforce_record_lifecycle()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_is_completed boolean := false;
begin
  if (tg_op = 'INSERT') then
    if (new.created_by is null and auth.uid() is not null) then
      new.created_by := auth.uid();
    end if;
    new.deleted_at := null;
    new.deleted_by := null;
    return new;
  end if;

  if (tg_op = 'UPDATE') then
    -- バックエンド(service_role / SQL editor 等, auth.uid()=null)は制限対象外
    if (auth.uid() is null) then
      return new;
    end if;

    -- ソフト削除: deleted_at が null -> 値
    if (old.deleted_at is null and new.deleted_at is not null) then
      if (tg_table_name = 'workspaces') then
        v_is_completed := (coalesce(old.status, '') = '完了');
      end if;
      if is_org_admin() then
        new.deleted_by := auth.uid();
      elsif (old.created_by = auth.uid() and not v_is_completed) then
        new.deleted_by := auth.uid();
      else
        raise exception '削除権限がありません（管理者、または作成者本人かつ未完了のみ削除可）';
      end if;

    -- 復元: deleted_at が 値 -> null（管理者のみ）
    elsif (old.deleted_at is not null and new.deleted_at is null) then
      if not is_org_admin() then
        raise exception '復元は管理者のみ可能です';
      end if;
      new.deleted_by := null;
    end if;

    return new;
  end if;

  return new;
end;
$function$

-- ---- guard_deleted_at_basic ----
CREATE OR REPLACE FUNCTION public.guard_deleted_at_basic()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_is_owner boolean;
begin
  if new.deleted_at is distinct from old.deleted_at then
    if auth.uid() is null then
      return new;  -- service_role等の信頼バックエンドは素通り
    end if;

    select exists(
      select 1 from public.organizations o
      where o.id = old.org_id and o.owner_id = auth.uid()
    ) into v_is_owner;

    if v_is_owner then
      return new;
    end if;

    if old.created_by is not null and old.created_by = auth.uid() then
      return new;
    end if;

    raise exception 'delete_not_allowed: only org owner or record creator may change deleted_at'
      using errcode = '42501';
  end if;
  return new;
end;
$function$

-- ---- guard_deleted_at_workspace ----
CREATE OR REPLACE FUNCTION public.guard_deleted_at_workspace()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_is_owner boolean;
begin
  if new.deleted_at is distinct from old.deleted_at then
    if auth.uid() is null then
      return new;
    end if;

    select exists(
      select 1 from public.organizations o
      where o.id = old.org_id and o.owner_id = auth.uid()
    ) into v_is_owner;

    if v_is_owner then
      return new;  -- オーナーは完了案件でも削除/復元可
    end if;

    if old.created_by is not null and old.created_by = auth.uid() then
      if old.status = '完了' then
        raise exception 'delete_not_allowed: completed case can only be deleted by org owner'
          using errcode = '42501';
      end if;
      return new;
    end if;

    raise exception 'delete_not_allowed: only org owner or record creator may change deleted_at'
      using errcode = '42501';
  end if;
  return new;
end;
$function$

-- ---- is_org_admin ----
CREATE OR REPLACE FUNCTION public.is_org_admin()
 RETURNS boolean
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select exists (
    select 1 from public.organizations o
    where o.id = current_org_id() and o.owner_id = auth.uid()
  );
$function$

-- ---- log_ws_code ----
CREATE OR REPLACE FUNCTION public.log_ws_code()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  insert into public.ws_code_log (ws_code, workspace_id, org_id, org_name, created_by)
  values (
    new.ws_code,
    new.id,
    new.org_id,
    (select name from public.organizations where id = new.org_id),
    auth.uid()
  )
  on conflict (ws_code) do nothing;
  return new;
end;
$function$

-- ---- org_is_billable ----
CREATE OR REPLACE FUNCTION public.org_is_billable(p_org_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$ select case when p_org_id is null then false else coalesce((select s.billing_exempt or (s.status = 'active' and s.current_period_end is not null and s.current_period_end + interval '3 days' > now()) or (s.status = 'trialing' and s.trial_ends_at > now()) from public.organization_subscriptions s where s.org_id = p_org_id), false) end $function$

-- ---- set_org_id_from_current ----
CREATE OR REPLACE FUNCTION public.set_org_id_from_current()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  if new.org_id is null then
    new.org_id := public.current_org_id();
  end if;
  return new;
end;
$function$

-- =====================================================================
-- 依存メモ（2026-09-27 時点）
--
-- enforce_record_lifecycle は is_org_admin() を呼んでいる（本ファイル収録済み）。
-- is_org_admin() は organizations.owner_id = auth.uid() を見ており、
-- guard_deleted_at_basic / guard_deleted_at_workspace のオーナー判定と同一のロジック。
-- is_org_admin() だけ STABLE が付いていない（他7本は STABLE または VOLATILE 明示）。
-- can_access_workspace は public.workspace_members を参照している。
-- org_is_billable は public.organization_subscriptions を参照している。
-- log_ws_code は public.ws_code_log に insert している。
-- current_org_id は public.profiles.org_id を参照している（1ユーザー＝1org前提）。
-- =====================================================================
