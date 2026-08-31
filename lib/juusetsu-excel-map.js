/**
 * 全宅連「重要事項説明書（土地の売買・交換用）」xlsx への転記マップ。
 * チェックボックスは独立セルの文字「□」で、入力規則が "□,☑"。該当セルに ☑ を書けばよい。
 * ここには座標データと最小限のヘルパーだけを置き、xlsx の読み書きは行わない。
 */

export const SHEET_NAME = '重要事項説明書(土地の売買・交換用)'

export const CHECK_MARK = '☑'

export const EXCEL_MAP = {
  property_info: {
    address: { type: 'text', cell: 'F41' },
    lot_number: { type: 'text', cell: 'AC41' },
    land_category: { type: 'text', cell: 'AL41' },
    registered_area: { type: 'text', cell: 'AW41', strip: '㎡' },
    share: { type: 'text', cell: 'BE41' },
  },
  rights: {
    owner_address: { type: 'text', cell: 'S84' },
    owner_name: { type: 'text', cell: 'S85' },
  },
  zoning: {
    area_division: {
      type: 'check',
      cells: {
        '市街化区域': 'U124',
        '市街化調整区域': 'AE124',
        '非線引き区域': 'U125',
        '準都市計画区域': 'U126',
        '都市計画区域外': 'U127',
      },
    },
    city_planning_restriction: {
      type: 'check',
      cells: { '有': 'Q139', '無': 'Q144' },
    },
    use_district: { type: 'text', cell: 'Q145' },
    building_coverage: { type: 'text', cell: 'Z153', strip: '%' },
    floor_area_ratio: { type: 'text', cell: 'AA162', strip: '%' },
  },
  road_access: {
    road_ownership: { type: 'text', cell: 'AB195' },
    road_type: { type: 'text', cell: 'AK195' },
    road_width: { type: 'text', cell: 'AV195', strip: 'm' },
    frontage_length: { type: 'text', cell: 'BD195', strip: 'm' },
    private_road_burden: {
      type: 'check',
      cells: { '有': 'P250', '無': 'K250' },
    },
  },
  hazard: {
    developed_land_disaster: {
      type: 'check',
      cells: { '外': 'Y255', '内': 'AD255' },
    },
    landslide_warning: {
      type: 'check',
      cells: { '外': 'AF258', '内': 'AK258' },
    },
    landslide_special: {
      type: 'check',
      cells: { '外': 'AF259', '内': 'AK259' },
    },
    tsunami_warning: {
      type: 'check',
      cells: { '外': 'AF262', '内': 'AK262' },
    },
    tsunami_special: {
      type: 'check',
      cells: { '外': 'AF263', '内': 'AK263' },
    },
    flood_map: {
      type: 'check',
      cells: { '有': 'X267', '無': 'AV267' },
    },
    inland_water_map: {
      type: 'check',
      cells: { '有': 'X268', '無': 'AV268' },
    },
    storm_surge_map: {
      type: 'check',
      cells: { '有': 'X269', '無': 'AV269' },
    },
  },
}

// 記入欄に入ってはいけない説明文の語。含まれていたら書き込まない。
const NOTE_LIKE_WORDS = [
  '記載なし',
  '判定不可',
  '要確認',
  '確認が必要',
  '不明',
  '未確認',
  '添付なし',
  '推定',
  '要調査',
]

// 末尾に付きやすい単位。括弧処理のあとに落とす。
const UNIT_TOKENS = ['㎡', 'm2', '%', '％', 'm', 'ｍ']

function containsNoteLikeWord(text) {
  for (const w of NOTE_LIKE_WORDS) {
    if (text.indexOf(w) !== -1) return true
  }
  return false
}

// 全角・半角の丸括弧より前だけを採用する（'60（用途地域図に明記）' → '60'）
function stripParenthetical(text) {
  let cut = text.length
  for (const open of ['(', '（']) {
    const i = text.indexOf(open)
    if (i !== -1 && i < cut) cut = i
  }
  return text.slice(0, cut)
}

function stripUnits(text, strip) {
  let out = text
  if (strip) out = out.split(strip).join('')
  for (const u of UNIT_TOKENS) {
    out = out.split(u).join('')
  }
  return out
}

// 値は自由テキスト（文字列）か、選択肢フィールドの { value, note } のどちらか
function extractValue(raw) {
  if (raw === null || raw === undefined) return null
  if (typeof raw === 'object') {
    const v = raw.value
    return v === null || v === undefined ? null : v
  }
  return raw
}

/**
 * ドラフトから、書き込むセルと値の一覧を求める。
 * 選択肢に完全一致しない値では絶対にチェックを付けない（推測で書き込まない）。
 */
export function resolveWrites(draft) {
  const writes = []
  const skipped = []

  if (!draft || typeof draft !== 'object') {
    return { writes: writes, skipped: skipped }
  }

  for (const category of Object.keys(EXCEL_MAP)) {
    const fields = EXCEL_MAP[category]
    const section = draft[category]

    for (const field of Object.keys(fields)) {
      const def = fields[field]
      const raw = section && typeof section === 'object' ? section[field] : null
      const value = extractValue(raw)

      if (value === null || value === undefined || value === '') {
        skipped.push({ category: category, field: field, reason: 'no_value' })
        continue
      }

      if (def.type === 'check') {
        const cell = def.cells[value]
        if (!cell) {
          skipped.push({ category: category, field: field, reason: 'invalid_option' })
          continue
        }
        writes.push({ cell: cell, value: CHECK_MARK })
        continue
      }

      // 記入欄に説明文が入らないようにする最終防衛線
      let text = String(value).trim()

      if (containsNoteLikeWord(text)) {
        skipped.push({ category: category, field: field, reason: 'looks_like_note' })
        continue
      }

      // まず括弧より前を採用し、そのあとで単位を落とす
      text = stripParenthetical(text).trim()
      if (text === '') {
        skipped.push({ category: category, field: field, reason: 'looks_like_note' })
        continue
      }

      text = stripUnits(text, def.strip).trim()
      if (text === '') {
        skipped.push({ category: category, field: field, reason: 'no_value' })
        continue
      }

      writes.push({ cell: def.cell, value: text })
    }
  }

  return { writes: writes, skipped: skipped }
}
