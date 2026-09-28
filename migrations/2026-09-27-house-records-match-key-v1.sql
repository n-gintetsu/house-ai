-- ============================================================
-- 記録用ファイル（実行用ではない）
-- 2026-09-27 19:39 JST に本番（house-ai / bbkjnetmdfdrzcedmbdn）の
-- Supabase SQL Editor で実行済み。F-2-5a。
--
-- 目的：house_records.match_key を物件住所から自動生成する。
--   match_key は identity ではなく「同じ不動産かもしれない候補を拾う検索キー」。
--   UNIQUE は付けない。1件一致でも自動統合しない（最終判断は人が行う：F-2-5b）。
--   形式は v1|正規化住所 のみ。物件種別・建物名・部屋番号は含めない。
--   address_raw は書き換えない。正規化結果が空なら null。
--   正規化の正本はこの関数1本。トリガーと将来の候補検索RPC（F-2-5b）の両方から呼ぶ。
--   物件住所専用であり、建物名などへの流用はしない。
--   ルールを変更するときはバージョンを上げ、migration＋再生成で扱う。
--
-- v1 の正規化：NFKC → 空白除去 → 英字小文字化 → ハイフン類を "-" に統一
--   → 数字に挟まれた "ー" のみ "-" に → 数字間の 丁目/番地/番 を "-" に
--   → 末尾の 号/番地/番 を除去 → 先頭の都道府県名（47の完全一致のみ）を除去
--   → 空なら null、それ以外は 'v1|' を付与。
--   漢数字の変換・住所からの建物名/部屋番号の切り出し・曖昧一致は行わない。
--
-- 既存行のバックフィルは行っていない（F-2-6 で扱う）。
-- 照合は従来どおり address_key のまま（F-2-5b で切り替える）。
--
-- 適用前の検証（取り消し付き）：実データ・境界ケース18件で期待どおり。
-- 適用後の検証：
--   ・取り消し付き UPDATE でトリガー発火を確認（same_addr / forced とも v1|検証用テスト町888）
--   ・anon に実行権限なし、authenticated にあり
--   ・アプリ経路で作成した WS-2026-000054 の家カルテに match_key = v1|検証市3-5-7
--
-- 巻き戻し：
--   drop trigger if exists trg_set_match_key_house_records on public.house_records;
--   drop function if exists public.set_house_record_match_key();
--   drop function if exists public.normalize_property_address_v1(text);
--   （入っている match_key は照合に使われていないので残しても害はない）
-- ============================================================

begin;

create function public.normalize_property_address_v1(p_address text)
returns text
language plpgsql
immutable
parallel safe
set search_path = ''
as $fn$
declare
  s text;
begin
  if p_address is null then return null; end if;
  s := normalize(p_address, NFKC);
  s := regexp_replace(s, '\s+', '', 'g');
  s := lower(s);
  s := regexp_replace(s, '[‐‑‒–—―−]', '-', 'g');
  s := regexp_replace(s, '([0-9])ー(?=[0-9])', '\1-', 'g');
  s := regexp_replace(s, '([0-9])(丁目|番地|番)(?=[0-9])', '\1-', 'g');
  s := regexp_replace(s, '([0-9])(号|番地|番)$', '\1');
  s := regexp_replace(s, '^(北海道|東京都|京都府|大阪府|(青森|岩手|宮城|秋田|山形|福島|茨城|栃木|群馬|埼玉|千葉|神奈川|新潟|富山|石川|福井|山梨|長野|岐阜|静岡|愛知|三重|滋賀|兵庫|奈良|和歌山|鳥取|島根|岡山|広島|山口|徳島|香川|愛媛|高知|福岡|佐賀|長崎|熊本|大分|宮崎|鹿児島|沖縄)県)', '');
  if s = '' then return null; end if;
  return 'v1|' || s;
end
$fn$;

create function public.set_house_record_match_key()
returns trigger
language plpgsql
set search_path = ''
as $fn$
begin
  new.match_key := public.normalize_property_address_v1(new.address_raw);
  return new;
end
$fn$;

revoke all on function public.normalize_property_address_v1(text) from public, anon;
grant execute on function public.normalize_property_address_v1(text) to authenticated, service_role;

revoke all on function public.set_house_record_match_key() from public, anon;
grant execute on function public.set_house_record_match_key() to authenticated, service_role;

create trigger trg_set_match_key_house_records
  before insert or update of address_raw, match_key on public.house_records
  for each row execute function public.set_house_record_match_key();

commit;
