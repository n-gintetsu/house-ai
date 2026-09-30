-- =============================================================================
-- 2026-09-30  workspace-files バケットのストレージのポリシー差し替え（P0 修正）
-- 状態：本番に適用済み（2026-09-30 SQL Editor / Role=postgres）。このファイルは記録用。
-- =============================================================================
--
-- ■ 背景
--   storage.objects のポリシー "ws_files authenticated all" が
--   「FOR ALL TO authenticated USING/CHECK (bucket_id = 'workspace-files')」だけで、
--   案件のメンバーかどうか・どの組織かを見ていなかった。
--   ログインできる全ユーザーが、全組織・全案件のファイルを一覧・ダウンロード・
--   アップロード・上書き・削除できる状態だった（バケット自体は非公開）。
--
-- ■ 事前確認（すべて読み取りのみで確認済み）
--   - バケット workspace-files は public=false
--   - 既存 94 件すべてのパスが「案件ID/ファイル名」で、1段目が実在する workspaces.id と一致（94/94）
--   - storage.objects.owner_id（text）あり。94 件中 85 件に値あり、9 件は NULL
--     （NULL の 9 件は管理者のみ削除可として許容）
--   - コード上の workspace-files の操作は、ブラウザの upload（upsert なし）と remove のみ。
--     閲覧は api/sign-file.js が service_role で createSignedUrl を発行（RLS の影響なし）。
--     download / list / move / copy / update / getPublicUrl は不使用。
--
-- ■ 変更後の権限（DB のテーブル ws_files と同じ条件に揃える）
--   INSERT：その案件のメンバー（can_access_workspace）かつ 案件の所属組織の課金が有効（workspace_org_is_billable）
--   SELECT：管理者（can_manage_workspace）または アップロードした本人（owner_id）で案件のメンバー
--   DELETE：SELECT と同じ
--   UPDATE：ポリシーなし（拒否）
--   anon  ：ポリシーなし（拒否）
--   パスの1段目は、UUID の形のときだけ uuid に変換し、それ以外は NULL（= false、fail closed）
--
-- ■ 検証結果（2026-09-30）
--   V-1 ポリシー一覧：新しい3本のみ。旧ポリシーは削除済み。UPDATE なし。roles は authenticated のみ
--   V-2 なりすまし（取り消し付き）：外部の組織ありユーザー 0 件 / 組織なしユーザー 0 件 / anon 0 件 /
--       組織の所有者 94 件（期待値 94）。テーブルからの直接削除は Supabase の保護トリガーで拒否
--   V-3 画面：管理者・アップロードした本人のアップロードと削除が正常。
--       削除後、ws_files の行・ストレージの実体とも 0、バケット全体は 94 件に戻ることを確認
-- =============================================================================

begin;

-- 旧：ログインしている全ユーザーに全操作を許可していたポリシーを削除
drop policy "ws_files authenticated all" on storage.objects;

-- アップロード：その案件のメンバーで、案件の所属組織の課金が有効なとき
create policy "ws_files_storage_insert" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'workspace-files'
    and public.can_access_workspace(
          case when split_part(name, '/', 1) ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
               then split_part(name, '/', 1)::uuid end)
    and public.workspace_org_is_billable(
          case when split_part(name, '/', 1) ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
               then split_part(name, '/', 1)::uuid end)
  );

-- 閲覧（削除の前提）：管理者、またはアップロードした本人（その案件のメンバーであること）
create policy "ws_files_storage_select" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'workspace-files'
    and (
      public.can_manage_workspace(
        case when split_part(name, '/', 1) ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
             then split_part(name, '/', 1)::uuid end)
      or (
        owner_id is not null
        and owner_id = (select auth.uid())::text
        and public.can_access_workspace(
              case when split_part(name, '/', 1) ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
                   then split_part(name, '/', 1)::uuid end)
      )
    )
  );

-- 削除：閲覧と同じ条件
create policy "ws_files_storage_delete" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'workspace-files'
    and (
      public.can_manage_workspace(
        case when split_part(name, '/', 1) ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
             then split_part(name, '/', 1)::uuid end)
      or (
        owner_id is not null
        and owner_id = (select auth.uid())::text
        and public.can_access_workspace(
              case when split_part(name, '/', 1) ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
                   then split_part(name, '/', 1)::uuid end)
      )
    )
  );

-- UPDATE と anon のポリシーは作らない（拒否）

commit;

-- =============================================================================
-- ■ 巻き戻し（必要な場合のみ。通常は実行しない）
-- =============================================================================
-- begin;
-- drop policy if exists "ws_files_storage_insert" on storage.objects;
-- drop policy if exists "ws_files_storage_select" on storage.objects;
-- drop policy if exists "ws_files_storage_delete" on storage.objects;
-- create policy "ws_files authenticated all" on storage.objects
--   as permissive for all to authenticated
--   using (bucket_id = 'workspace-files')
--   with check (bucket_id = 'workspace-files');
-- commit;
--
-- ■ 別件として記録（本ファイルでは未対応）
--   - api/sign-file.js は workspaces.deleted_at を見ていない（論理削除した案件のファイルにも署名 URL を発行する）
--   - アップロードはストレージを先に書き、ws_files の登録に失敗するとファイルだけが残る構造
--   - file_grants は案件のメンバーなら誰でも書ける（業者ロールが自分に共有を付けられる可能性）
