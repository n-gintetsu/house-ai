// Workspace 共通の選択肢定義。WorkspacePage / HouseRecordPage の両方から import する。
// 同じ配列を2ファイルに重複定義していたのを1箇所にまとめたもの。

// 契約種別。DB（workspaces.contract_type）には CHECK が無く、値域はこの配列で閉じる。
export const CONTRACT_TYPES = ['賃貸', '売買', '買取', '注文住宅', 'リフォーム', '外構工事', '相続', '登記', '住宅ローン', '不動産担保ローン', 'アジェンダ']

// この案件が特定の不動産に関するものかどうか（workspaces.property_scope）。
// DB 側は CHECK で3値に閉じており、既定値は 'undecided'。
export const PROPERTY_SCOPES = [
  { value: 'property', label: 'はい', hint: '特定の不動産に関する案件' },
  { value: 'non_property', label: 'いいえ', hint: '名刺・Web制作・決算など' },
  { value: 'undecided', label: 'まだ未定', hint: '物件探し・購入相談など' },
]

// 物件種別（workspaces.property_type / house_records.property_type）。
// DB に CHECK は付けていないため、値域はこの配列で閉じる。
export const PROPERTY_TYPES = [
  { value: 'detached_house', label: '戸建' },
  { value: 'land', label: '土地' },
  { value: 'condo_unit', label: '区分マンション' },
  { value: 'rental_unit', label: '賃貸住戸' },
  { value: 'whole_building', label: '一棟物件' },
  { value: 'commercial_unit', label: '店舗・事務所' },
  { value: 'other', label: 'その他' },
]

const BUILDING_NAME_TYPES = ['condo_unit', 'rental_unit', 'whole_building', 'commercial_unit', 'other']
const UNIT_NO_TYPES = ['condo_unit', 'rental_unit', 'commercial_unit', 'other']

// 物件種別に応じて、建物名・部屋番号の入力を出すかどうかを返す。
// 土地（land）と戸建（detached_house）はどちらも出さない。未選択（''）も出さない。
export function propertyFieldsFor(type) {
  const t = String(type || '')
  return {
    building: BUILDING_NAME_TYPES.indexOf(t) !== -1,
    unit: UNIT_NO_TYPES.indexOf(t) !== -1,
  }
}

// --- 案件（workspaces）→ 家カルテ（house_records）への物件属性のコピー ---
// 対象は property_type / building_name / unit_no の3列のみ。
// match_key は F-2-5 で扱うためここでは書かない。snapshot にも入れない。
const PROPERTY_ATTR_COLUMNS = ['property_type', 'building_name', 'unit_no']

function attrOrNull(v) {
  const t = String(v || '').trim()
  return t === '' ? null : t
}

// 新規 insert 用。案件の値をそのまま入れる（空文字は null）。
export function propertyAttrsForInsert(ws) {
  const src = ws || {}
  const out = {}
  for (let i = 0; i < PROPERTY_ATTR_COLUMNS.length; i++) {
    const col = PROPERTY_ATTR_COLUMNS[i]
    out[col] = attrOrNull(src[col])
  }
  return out
}

// 合流 update / 上書き保存 update 用。
// 家カルテ側が null（または空）の列だけを案件の値で埋める。
// 家カルテ側に既に値がある列は返さない（別案件の値で物件情報を書き換えないため）。
// 案件側が null の列も返さない。
export function propertyAttrsFillNulls(ws, existing) {
  const src = ws || {}
  const cur = existing || {}
  const out = {}
  for (let i = 0; i < PROPERTY_ATTR_COLUMNS.length; i++) {
    const col = PROPERTY_ATTR_COLUMNS[i]
    const next = attrOrNull(src[col])
    if (next === null) continue
    if (attrOrNull(cur[col]) !== null) continue
    out[col] = next
  }
  return out
}
