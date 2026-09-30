-- =============================================================================
-- 2026-09-30  ファイルの閲覧制御の封鎖（file_grants / ws_file_folders / ws_files）
--             ＋ workspace_members の招待の重複防止（一意インデックス）
-- 状態：本番に適用済み（2026-09-30 SQL Editor / Role=postgres）。このファイルは記録用。
--       下の DDL は、適用後の「最終的な状態」を表す。
-- =============================================================================
--
-- ■ 背景1：業者ロールが共有されていないファイルを見られる経路（4つ）
--   閲覧 API（api/sign-file.js）は、業者ロールに対して「file_grants に自分宛ての共有がある」
--   または「ファイルのフォルダの持ち主が自分」のときだけ署名 URL を発行する。
--   しかしその判定材料（file_grants / ws_file_folders.owner_member_id / ws_files）は、
--   案件のメンバーなら誰でも書き換えられた。
--   ① file_grants に自分宛ての共有を作る
--   ② ws_files.folder_id を自分のフォルダに書き換える
--   ③ ws_file_folders.owner_member_id を自分に書き換える／自分が持ち主のフォルダを作る
--   ④ 他人のファイルの storage_path をコピーして、自分のフォルダにファイルの行を作る
--
-- ■ 背景2：招待の二重作成
--   招待ボタンの二重クリックで、同じメールの pending 行が2つ作られた（WS-2026-000060）。
--   画面・API・DB のどこにも二重作成を止める仕組みがなかった。
--   画面と API の対策はコミット f8a2817（本番反映済み）。
--
-- ■ 適用の経緯
--   (1) 11:47 頃、封鎖の DDL を適用（can_admin_workspace に組織の分岐あり・状態の確認なし の版）
--   (2) 11:58 頃、前へ直す修正を適用：
--       - can_admin_workspace から組織の分岐を削除（案件の Owner/Manager の active メンバーのみ。画面の canDel と同一）
--       - fg_insert / wsff_insert に、相手・持ち主のメンバーの状態の許可リスト（active / pending）を追加
--   (3) 15:11 頃、WS-060 の重複行を削除し、一意インデックスを追加
--
-- ■ 検証結果（2026-09-30）
--   - アップロード（④の確認の追加後）：正常
--   - 画面：業者の招待・専用フォルダの作成・共有の付与と取り消し・種別の変更・フォルダ名の変更が正常
--   - 二重クリックの招待：1行だけ作成・エラーなし
--   - なりすまし（Broker・取り消し付き）：①〜④、③-b、③-c すべて拒否
--   - 一意インデックス作成後の重複：0
-- =============================================================================

-- ========== 判定関数 ==========
-- 案件の管理者 = その案件で Owner または Manager の active なメンバー
create or replace function public.can_admin_workspace(p_ws uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select p_ws is not null and exists (
    select 1 from public.workspace_members wm
    where wm.workspace_id = p_ws
      and wm.user_id = auth.uid()
      and wm.status = 'active'
      and lower(wm.role) in ('owner', 'manager')
  );
$$;
revoke all on function public.can_admin_workspace(uuid) from public, anon;
grant execute on function public.can_admin_workspace(uuid) to authenticated;

-- そのストレージの実体を、自分がアップロードしたか
create or replace function public.ws_storage_object_is_mine(p_path text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select p_path is not null and exists (
    select 1 from storage.objects o
    where o.bucket_id = 'workspace-files'
      and o.name = p_path
      and o.owner_id = (auth.uid())::text
  );
$$;
revoke all on function public.ws_storage_object_is_mine(text) from public, anon;
grant execute on function public.ws_storage_object_is_mine(text) to authenticated;

-- ========== ① file_grants ==========
drop policy if exists fg_update on public.file_grants;

drop policy if exists fg_insert on public.file_grants;
create policy fg_insert on public.file_grants
  for insert to authenticated
  with check (
    public.can_admin_workspace(workspace_id)
    and public.workspace_org_is_billable(workspace_id)
    and exists (select 1 from public.ws_files f
                where f.id = file_grants.file_id
                  and f.workspace_id = file_grants.workspace_id)
    and exists (select 1 from public.workspace_members m
                where m.id = file_grants.member_id
                  and m.workspace_id = file_grants.workspace_id
                  and m.status in ('active', 'pending'))
  );

drop policy if exists fg_delete on public.file_grants;
create policy fg_delete on public.file_grants
  for delete to authenticated
  using (public.can_admin_workspace(workspace_id));

-- ========== ③ ws_file_folders ==========
drop policy if exists wsff_insert on public.ws_file_folders;
create policy wsff_insert on public.ws_file_folders
  for insert to authenticated
  with check (
    public.can_access_workspace(workspace_id)
    and (
      owner_member_id is null
      or (
        public.can_admin_workspace(workspace_id)
        and exists (select 1 from public.workspace_members m
                    where m.id = ws_file_folders.owner_member_id
                      and m.workspace_id = ws_file_folders.workspace_id
                      and m.status in ('active', 'pending'))
      )
    )
  );

drop policy if exists wsff_delete on public.ws_file_folders;
create policy wsff_delete on public.ws_file_folders
  for delete to authenticated
  using (public.can_admin_workspace(workspace_id));

-- ========== ④ ws_files の INSERT ==========
drop policy if exists wsf_insert on public.ws_files;
create policy wsf_insert on public.ws_files
  for insert to authenticated
  with check (
    public.can_access_workspace(workspace_id)
    and public.workspace_org_is_billable(workspace_id)
    and split_part(storage_path, '/', 1) = workspace_id::text
    and public.ws_storage_object_is_mine(storage_path)
    and (
      folder_id is null
      or exists (select 1 from public.ws_file_folders fo
                 where fo.id = ws_files.folder_id and fo.workspace_id = ws_files.workspace_id)
    )
  );

-- ========== ②③ 列単位の UPDATE 権限 ==========
revoke update on public.ws_files        from anon, authenticated;
revoke update on public.ws_file_folders from anon, authenticated;
revoke update on public.file_grants     from anon, authenticated;
grant update (doc_type)   on public.ws_files        to authenticated;
grant update (role_label) on public.ws_file_folders to authenticated;

-- ========== 招待の重複防止 ==========
-- 適用時に WS-2026-000060 の重複行（id=910c524b-6cfa-4c23-b1f0-6398d227f248、何も紐付いていない pending 行）を削除した上で作成
create unique index workspace_members_ws_email_live_key
  on public.workspace_members (workspace_id, lower(btrim(email)))
  where email is not null and status in ('active', 'pending');

-- =============================================================================
-- ■ 巻き戻し（通常は実行しない）
--   - 封鎖の巻き戻しは、元のポリシー（すべて can_access_workspace のみ）とテーブル単位の UPDATE の付与に戻す形になる。
--     巻き戻すと①〜④の経路が再び開くので、行わない前提。
--   - 一意インデックスの巻き戻しは drop index で可能。
--     削除した重複行の再作成は、「適用直後で、その後に同じメールの招待が作られていない場合」に限り可能
--     （インデックスの削除後であっても、同じ案件・同じメールの live な行が既にあれば重複を作り直すことになる）。
--
-- ■ 別件として記録（本ファイルでは未対応）
--   - 案件にぶら下がる他のテーブル（roadmap_steps / timeline_events / ws_schedule / ws_law_docs /
--     ws_members / access_logs）は、依然として案件のメンバーなら誰でも追加・変更・削除できる。ロールと課金のゲートの棚卸しが必要
--   - 他社の組織の Manager の共有操作の可否は、権限の表（B）で正式に決める
--   - 共有のリアルタイム反映（Realtime）は別タスク
-- =============================================================================
