-- profilesテーブルにプレミアム関連カラムを追加
alter table profiles
  add column if not exists is_premium boolean not null default false,
  add column if not exists stripe_customer_id text;

-- profilesテーブルがない場合は作成
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  is_premium boolean not null default false,
  stripe_customer_id text,
  created_at timestamptz default now()
);

-- RLS有効化
alter table profiles enable row level security;

-- 自分のプロフィールだけ読める
create policy "Users can read own profile"
on profiles for select
using (auth.uid() = id);

-- 自分のプロフィールだけ更新できる
create policy "Users can update own profile"
on profiles for update
using (auth.uid() = id);

-- サービスロールは全件操作可能（Webhook用）
create policy "Service role full access profiles"
on profiles for all
using (true);
