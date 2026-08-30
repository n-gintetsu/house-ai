/**
 * 重要事項説明書（全宅連書式・売買）の項目定義。
 * ロジックは持たず、データと JSON スキーマ文字列の組み立てだけを担う。
 * Vite のビルド対象外（api/ から import して使う）。
 */

export const PROPERTY_TYPES = ['土地', '戸建', 'マンション']

const ALL = ['土地', '戸建', 'マンション']

export const GROUPS = [
  {
    id: 'g1',
    label: '物件表示・権利関係',
    appliesTo: ALL,
    categories: [
      {
        key: 'property_info',
        label: '物件表示',
        appliesTo: ALL,
        fields: [
          { key: 'address', label: '所在' },
          { key: 'lot_number', label: '地番' },
          { key: 'land_category', label: '地目', options: ['宅地', '田', '畑', '山林', '原野', '雑種地', '公衆用道路', 'その他'] },
          { key: 'registered_area', label: '登記簿面積' },
          { key: 'surveyed_area', label: '実測面積' },
          { key: 'share', label: '持分' },
          { key: 'parcel_count', label: '筆数' },
          { key: 'survey_map', label: '測量図の有無' },
        ],
        requiredDocuments: ['登記事項証明書', '公図', '測量図'],
      },
      {
        key: 'rights',
        label: '権利関係',
        appliesTo: ALL,
        fields: [
          { key: 'owner_address', label: '甲区名義人住所' },
          { key: 'owner_name', label: '甲区名義人氏名' },
          { key: 'ownership_restrictions', label: '所有権に係る権利' },
          { key: 'other_rights', label: '所有権以外の権利' },
          { key: 'leasehold', label: '借地権の有無' },
          { key: 'third_party_occupancy', label: '第三者の占有' },
        ],
        requiredDocuments: ['登記事項証明書'],
      },
    ],
  },
  {
    id: 'g2',
    label: '法令制限',
    appliesTo: ALL,
    categories: [
      {
        key: 'zoning',
        label: '都市計画法・建築基準法の制限',
        appliesTo: ALL,
        fields: [
          { key: 'area_division', label: '区域区分', options: ['市街化区域', '市街化調整区域', '非線引き区域', '準都市計画区域', '都市計画区域外'] },
          { key: 'development_restriction', label: '開発行為の制限' },
          { key: 'city_planning_restriction', label: '都市計画制限', options: ['有', '無'] },
          {
            key: 'use_district',
            label: '用途地域',
            options: [
              '第一種低層住居専用地域',
              '第二種低層住居専用地域',
              '第一種中高層住居専用地域',
              '第二種中高層住居専用地域',
              '第一種住居地域',
              '第二種住居地域',
              '準住居地域',
              '田園住居地域',
              '近隣商業地域',
              '商業地域',
              '準工業地域',
              '工業地域',
              '工業専用地域',
              '指定なし',
            ],
          },
          { key: 'district_zones', label: '地区・街区等' },
          { key: 'building_coverage', label: '建蔽率' },
          { key: 'floor_area_ratio', label: '容積率' },
          { key: 'height_restriction', label: '高さ制限' },
          { key: 'other_building_restriction', label: 'その他の建築制限' },
          { key: 'ordinance_restriction', label: '条例による制限' },
        ],
        requiredDocuments: ['都市計画情報', '建築指導課の証明'],
      },
      {
        key: 'other_laws',
        label: 'その他法令に基づく制限',
        appliesTo: ALL,
        fields: [
          { key: 'applicable_laws', label: '該当法令名' },
          { key: 'restriction_details', label: '制限の内容' },
          { key: 'land_readjustment', label: '土地区画整理法' },
        ],
        requiredDocuments: ['都市計画情報', '各法令所管課の証明'],
      },
    ],
  },
  {
    id: 'g3',
    label: '接道・災害・インフラ',
    appliesTo: ALL,
    categories: [
      {
        key: 'road_access',
        label: '接道・私道負担',
        appliesTo: ['土地', '戸建'],
        fields: [
          { key: 'frontage_obligation', label: '接道義務' },
          { key: 'road_direction', label: '接道方向' },
          { key: 'road_ownership', label: '公私道の別', options: ['公道', '私道'] },
          {
            key: 'road_type',
            label: '接面道路の種類',
            options: [
              '法42条1項1号',
              '法42条1項2号',
              '法42条1項3号',
              '法42条1項4号',
              '法42条1項5号（位置指定道路）',
              '法42条2項道路',
              '法42条の道路に該当しない',
            ],
          },
          { key: 'road_width', label: '幅員' },
          { key: 'frontage_length', label: '接道長さ' },
          { key: 'setback', label: 'セットバック' },
          { key: 'private_road_burden', label: '私道負担の有無', options: ['有', '無'] },
          { key: 'private_road_area', label: '私道負担面積' },
          { key: 'private_road_change', label: '私道の変更廃止', options: ['原則としてできない', 'できる'] },
        ],
        requiredDocuments: ['道路台帳', '道路種別証明', '公図', '測量図'],
      },
      {
        key: 'hazard',
        label: '災害区域・ハザード',
        appliesTo: ALL,
        fields: [
          { key: 'developed_land_disaster', label: '造成宅地防災区域', options: ['区域外', '区域内'] },
          { key: 'landslide_warning', label: '土砂災害警戒区域', options: ['区域外', '区域内'] },
          { key: 'landslide_special', label: '土砂災害特別警戒区域', options: ['区域外', '区域内'] },
          { key: 'tsunami_warning', label: '津波災害警戒区域', options: ['区域外', '区域内'] },
          { key: 'tsunami_special', label: '津波災害特別警戒区域', options: ['区域外', '区域内'] },
          { key: 'flood_map', label: '洪水ハザードマップ', options: ['有', '無'] },
          { key: 'inland_water_map', label: '内水ハザードマップ', options: ['有', '無'] },
          { key: 'storm_surge_map', label: '高潮ハザードマップ', options: ['有', '無'] },
        ],
        requiredDocuments: ['ハザードマップ', '土砂災害警戒区域図'],
      },
      {
        key: 'infrastructure',
        label: 'インフラ整備状況',
        appliesTo: ['土地', '戸建'],
        fields: [
          { key: 'water', label: '飲用水' },
          { key: 'gas', label: 'ガス' },
          { key: 'electricity', label: '電気' },
          { key: 'sewage', label: '汚水' },
          { key: 'waste_water', label: '雑排水' },
          { key: 'rain_water', label: '雨水' },
        ],
        requiredDocuments: ['水道台帳', '下水道台帳', 'ガス配管図'],
      },
    ],
  },
  {
    id: 'g4',
    label: '建物・管理',
    appliesTo: ['戸建', 'マンション'],
    categories: [
      {
        key: 'building',
        label: '建物の状況',
        appliesTo: ['戸建', 'マンション'],
        fields: [
          { key: 'building_type', label: '種類' },
          { key: 'structure', label: '構造' },
          { key: 'floor_area', label: '床面積' },
          { key: 'built_date', label: '新築年月日' },
          { key: 'asbestos', label: '石綿使用調査' },
          { key: 'seismic_diagnosis', label: '耐震診断' },
          { key: 'inspection', label: '建物状況調査' },
        ],
        requiredDocuments: ['建物登記事項証明書', '検査済証', '建物状況調査報告書'],
      },
      {
        key: 'management',
        label: '管理・区分所有',
        appliesTo: ['マンション'],
        fields: [
          { key: 'site_rights', label: '敷地に関する権利' },
          { key: 'common_area_rules', label: '共用部分の規約' },
          { key: 'exclusive_use_restriction', label: '専有部分の利用制限' },
          { key: 'exclusive_use_right', label: '専用使用権' },
          { key: 'management_fee', label: '管理費' },
          { key: 'repair_fund', label: '修繕積立金' },
          { key: 'repair_fund_total', label: '積立総額' },
          { key: 'arrears', label: '滞納額' },
          { key: 'management_company', label: '管理委託先' },
          { key: 'maintenance_record', label: '維持修繕の実施記録' },
        ],
        requiredDocuments: ['管理規約', '重要事項調査報告書'],
      },
    ],
  },
  {
    id: 'g5',
    label: '取引条件',
    appliesTo: ALL,
    categories: [
      {
        key: 'transaction',
        label: '取引条件',
        appliesTo: ALL,
        fields: [
          { key: 'price', label: '売買代金' },
          { key: 'tax', label: '消費税等相当額' },
          { key: 'deposit', label: '手付金' },
          { key: 'tax_settlement', label: '固定資産税等清算金' },
          { key: 'other_payments', label: 'その他授受金銭' },
        ],
        requiredDocuments: ['売買契約書（案）'],
      },
      {
        key: 'securement',
        label: '保全措置・融資',
        appliesTo: ALL,
        fields: [
          { key: 'deposit_protection', label: '手付金等保全措置' },
          { key: 'payment_protection', label: '支払金預り金の保全措置' },
          { key: 'loan_terms', label: '金銭の貸借' },
          { key: 'loan_deadline', label: '融資未承認時の解除期限' },
          { key: 'installment', label: '割賦販売' },
        ],
        requiredDocuments: ['売買契約書（案）', '融資条件書'],
      },
      {
        key: 'termination',
        label: '契約解除・責任',
        appliesTo: ALL,
        fields: [
          { key: 'deposit_termination', label: '手付解除' },
          { key: 'loss_damage', label: '滅失損傷' },
          { key: 'breach', label: '契約違反' },
          { key: 'antisocial', label: '反社条項' },
          { key: 'loan_condition', label: '融資特約' },
          { key: 'nonconformity', label: '契約不適合責任' },
          { key: 'damages', label: '損害賠償額の予定', options: ['有', '無'] },
          { key: 'nonconformity_insurance', label: '契約不適合の保証保険措置' },
        ],
        requiredDocuments: ['売買契約書（案）'],
      },
    ],
  },
]

/**
 * 指定グループのうち、その物件種別に該当するカテゴリだけのJSON形式指定文字列を返す。
 * 該当カテゴリが0件の場合は null を返す。
 */
export function buildGroupSchema(groupId, propertyType) {
  const group = GROUPS.find((g) => g.id === groupId)
  if (!group) return null

  const categories = group.categories.filter(
    (c) => c.appliesTo.indexOf(propertyType) !== -1
  )
  if (categories.length === 0) return null

  const outline = categories
    .map((c) => {
      const fieldList = c.fields
        .map((f) => `${f.key}=${f.label}`)
        .join('、')
      const docs = c.requiredDocuments.join(' / ')
      return `- ${c.key}（${c.label}）: ${fieldList}\n  必要書類: ${docs}`
    })
    .join('\n')

  // 選択肢を持つフィールドは、選択肢一覧を明示して一字一句同じ値を返させる
  const optionLines = []
  for (const c of categories) {
    for (const f of c.fields) {
      if (Array.isArray(f.options) && f.options.length > 0) {
        optionLines.push(
          `- ${c.key}.${f.key}（${f.label}）: ${f.options.join(' / ')}`
        )
      }
    }
  }

  const jsonLines = categories.map((c) => {
    const fieldPairs = c.fields
      .map((f) =>
        Array.isArray(f.options) && f.options.length > 0
          ? `"${f.key}": { "value": "選択肢のいずれかと完全一致する文字列、または判定できない場合はnull", "note": "根拠や補足（文字列、なければnull）" }`
          : `"${f.key}": "文字列"`
      )
      .join(', ')
    return `  "${c.key}": { ${fieldPairs}, "status": "ai_filled|requires_check|attorney_required", "caution": null或いは文字列 }`
  })

  const jsonBody = [
    '  "meta": { "confidence": 数値0-100, "warnings": [文字列配列] }',
  ]
    .concat(jsonLines)
    .join(',\n')

  const optionSection =
    optionLines.length > 0
      ? `

選択肢が指定されたフィールド（value には以下のいずれかを一字一句そのまま入れる。判断できない場合は null）:
${optionLines.join('\n')}`
      : ''

  return `対象カテゴリ（${group.label}）:
${outline}${optionSection}

JSON形式:
{
${jsonBody}
}`
}

/**
 * プロンプトキャッシュを効かせるため、物件やグループによって変化しない完全共通の文字列。
 * 可変情報（所在地・種別・築年数・グループ名など）は絶対に含めないこと。
 */
export const COMMON_SYSTEM_PROMPT = `あなたは不動産取引の重要事項説明書作成を支援するAIアシスタントです。
プロの宅建士・不動産業者向けに、重要事項説明書のドラフトを作成します。

出力の決まり:
- 指示されたJSON形式のみで返答してください。前後に説明文を付けないでください。
- 添付書類から読み取れた項目は status を "ai_filled" にし、実際に読み取った値を記載してください。
- 添付書類に記載がない項目を推測で埋めてはいけません。記載がない場合は「（書類名）に記載なし」のように、どの書類に無かったかを明記してください。
- 推定・参考値にとどまる項目は status を "requires_check" にしてください。
- AIでは判断できない項目は status を "attorney_required" にしてください。
- 取引条件・契約解除・保全措置は原則として当事者間で決めるものです。書類に明記がない限り status は "attorney_required" にしてください。
- caution は注意点がある場合のみ文字列を入れ、なければ null にしてください。

選択肢が指定されたフィールドの決まり:
- value には、指定された選択肢のいずれかを一字一句そのまま入れてください。表記を変えたり、選択肢にない値を入れたりしないでください。
- 添付書類から判断できない場合は、value を必ず null にしてください。推測で選択肢を選んではいけません。
- note には、根拠となった書類名や補足を書いてください。補足がなければ null にしてください。

本ドラフトは参考資料であり、宅建士による最終確認・署名・押印が必ず必要です。`
