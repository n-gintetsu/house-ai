-- ============================================================
-- 記録用ファイル（実行用ではない）
-- 2026-09-28 13:50 JST に本番（house-ai / bbkjnetmdfdrzcedmbdn）の
-- Supabase SQL Editor で実行済み。F-2-5b 段階4。
--
-- 目的：
--   1) 家カルテの候補検索RPC find_house_record_candidates を追加する。
--      住所を正規化関数 normalize_property_address_v1 で match_key に変換し、
--      自組織・生存カルテのうち match_key が一致するものを候補として返す。
--      候補はあくまで候補であり、1件一致でも自動統合しない（最終判断は人が行う）。
--   2) house_records.address_key の NOT NULL を外す。
--      address_key は旧方式の照合キー（legacy）。既存値は変更しない。
--      F-2-5b 以降の新規家カルテでは書き込まない（NULL）。
--      部分ユニークインデックス house_records_org_address_key_active は残す
--      （NULL 同士は衝突しないため、同一住所の別カルテを作成できる）。
--
-- RPC の安全設計：
--   - SECURITY INVOKER。呼び出したユーザーの権限と既存RLSで動く。
--   - 組織はクライアントから受け取らず、current_org_id() で DB 側が決める。
--     house_records の SELECT ポリシー（org_id = current_org_id()）と同じ条件を
--     明示し、インデックス house_records_match_key_active_idx を効かせる。
--   - SELECT ポリシーは削除済みを除外しないため、deleted_at is null を必ず付ける。
--   - 正規化結果が NULL（空・空白のみ・都道府県のみ）なら検索せず0件を返す。
--     NULL の match_key 同士を候補にしない。
--   - authenticated のみ EXECUTE。public / anon からは REVOKE。
--   - 呼び出し側（アプリ）は、RPC の失敗を0件扱いしない（fail closed）。
--
-- 適用前の確認：
--   - house_records は RLS 有効、SELECT ポリシーは authenticated のみ・org_id = current_org_id()
--   - current_org_id() は SECURITY DEFINER・STABLE
--   - address_key への依存（DB関数・VIEW・RLSポリシー）は0件
--
-- 適用前の検証（取り消し付き・Owner になりすまし）：
--   - 全角・ハイフン・都道府県なしの住所で Log川崎の1件のみ
--   - 同じ住所を入れた別組織のカルテは返らない（組織境界）
--   - 空白・NULL・存在しない住所は0件
--   - anon は permission denied
--
-- 適用後の検証：
--   security_definer=f / anon_exec=f / authenticated_exec=t / public_exec=f
--   address_key_nullable=YES / address_key_null_rows=0
--   Owner として呼ぶと Log川崎（155fda0f）の1件
--
-- 巻き戻し：
--   drop function if exists public.find_house_record_candidates(text);
--   alter table public.house_records alter column address_key set not null;
--   ※ address_key が NULL の行が存在する場合、set not null は失敗する。
--     その場合は先にそれらの行の扱いを決めてから戻すこと。
-- ============================================================

begin;

create function public.find_house_record_candidates(p_address text)
returns table (
  id uuid, address_raw text, property_type text, building_name text,
  unit_no text, transaction_count integer, last_completed_at timestamptz
)
language plpgsql
stable
security invoker
set search_path = ''
as $fn$
#variable_conflict use_column
declare
  k text;
begin
  k := public.normalize_property_address_v1(p_address);
  if k is null then return; end if;
  return query
    select h.id, h.address_raw, h.property_type, h.building_name,
           h.unit_no, h.transaction_count, h.last_completed_at
      from public.house_records h
     where h.org_id = public.current_org_id()
       and h.deleted_at is null
       and h.match_key = k
     order by h.last_completed_at desc nulls last, h.id
     limit 20;
end
$fn$;

revoke all on function public.find_house_record_candidates(text) from public, anon;
grant execute on function public.find_house_record_candidates(text) to authenticated;

alter table public.house_records alter column address_key drop not null;

commit;
