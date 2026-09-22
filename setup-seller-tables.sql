-- ⚠️ このファイルは実行しないこと（2026-09-22 追記）
--
-- 末尾の「disable row level security」は現在の本番と逆の状態である。
-- 本番では 2026-09-22 に sellers / seller_activities を service_role のみに閉じた。
--   ポリシー 0 件 ／ anon・authenticated の権限は revoke 済み
--   → migrations/2026-09-22-sellers-rls-lockdown.sql
--
-- このファイルをそのまま実行すると RLS が無効に戻り、
-- 一般会員が全売主の氏名・メール・電話・住所を読める状態に逆戻りする。
--
-- テーブル定義（create table 部分）は当時の記録として残す。
-- 新しい環境を作る場合は、この create table の後に必ず上記マイグレーションを適用すること。

-- sellersテーブル作成（存在しない場合）
create table if not exists sellers (
  id uuid primary key default gen_random_uuid(),
  access_token text not null unique,
  address text,
  agent_name text,
  agent_phone text,
  inquiry_count integer not null default 0,
  view_count integer not null default 0,
  created_at timestamptz default now()
);

-- seller_activitiesテーブル作成（存在しない場合）
create table if not exists seller_activities (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid references sellers(id) on delete cascade,
  activity_type text not null,
  description text,
  created_at timestamptz default now()
);

-- sellersテーブルのRLSを無効化
-- セキュリティはaccess_tokenの推測困難性（UUID等）で担保する
alter table sellers disable row level security;

-- seller_activitiesテーブルのRLSを無効化
alter table seller_activities disable row level security;
