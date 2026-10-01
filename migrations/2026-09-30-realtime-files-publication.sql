-- 2026-09-30 16:29 JST 本番適用済み（SQL Editor・Role=postgres）
-- 目的：資料欄（フォルダ・ファイル・共有）の変更をリロードなしで反映する（コミット 36a1f01）
-- 内容：file_grants / ws_files / ws_file_folders を supabase_realtime の配信対象に追加
-- replica identity は3テーブルとも default（d）のまま変更していない（2026-10-01 確認）
-- 画面側は通知を「変わった合図」としてだけ使い、payload は使わない。0.5秒 debounce 後に RLS 込みで読み直す
-- DELETE の通知は Supabase の仕様で案件による絞り込みができないため、全件で受けている
-- 将来見直し：利用規模が大きくなったら案件単位の Broadcast への移行を検討する
-- 再実行しても安全なように、既に配信対象に入っているテーブルは飛ばす
-- 巻き戻し（参考・コメントのまま）：
--   alter publication supabase_realtime drop table public.file_grants, public.ws_files, public.ws_file_folders;
-- 検証（参考・コメントのまま）：
--   select schemaname, tablename from pg_publication_tables where pubname = 'supabase_realtime' order by tablename;

do $$
declare
  t text;
begin
  foreach t in array array['file_grants', 'ws_files', 'ws_file_folders'] loop
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = t
    ) then
      execute format('alter publication supabase_realtime add table public.%I', t);
    end if;
  end loop;
end $$;
