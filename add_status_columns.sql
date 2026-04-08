-- agency_registrations に status カラムを追加
alter table agency_registrations add column if not exists status text default 'pending';

-- valuations に status カラムを追加
alter table valuations add column if not exists status text default 'pending';
