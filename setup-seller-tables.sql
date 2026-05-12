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
