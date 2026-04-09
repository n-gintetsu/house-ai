const fs = require('fs')
const path = require('path')

const filePath = path.join(__dirname, 'src', 'PropertyMatching.jsx')
let content = fs.readFileSync(filePath, 'utf8')

// loadProperties関数を置き換え
// 元の関数
const oldLoad = `  async function loadProperties() {
    const { data } = await supabase.from('properties').select('*').eq('status', 'active').order('created_at', { ascending: false })
    setProperties(data || [])
  }`

// 新しい関数：2テーブルを統合
const newLoad = `  async function loadProperties() {
    // 管理画面登録物件を取得
    const { data: adminProps } = await supabase
      .from('properties')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    // 業者登録物件を取得（公開物件は全員、非公開は会員のみ）
    let agencyQuery = supabase
      .from('agency_properties')
      .select('*')
      .eq('status', 'active')

    if (user) {
      // ログイン済み：公開＋自分の非公開物件
      agencyQuery = agencyQuery.or(\`is_public.eq.true,agency_user_id.eq.\${user.id}\`)
    } else {
      // 未ログイン：公開物件のみ
      agencyQuery = agencyQuery.eq('is_public', true)
    }

    const { data: agencyProps } = await agencyQuery.order('created_at', { ascending: false })

    // 業者物件をPropertyCardで表示できる形式に変換
    const normalizedAgency = (agencyProps || []).map(p => {
      const details = p.details ? (typeof p.details === 'string' ? JSON.parse(p.details) : p.details) : {}
      return {
        id: 'agency_' + p.id,
        title: p.title,
        address: details.address || '',
        property_type: p.property_type_detail || '',
        deal_type: p.deal_category === 'sale' ? 'sale' : 'rent',
        price: p.price || null,
        rent: p.rent || null,
        image_url: p.image_url || null,
        description: p.catchcopy || '',
        layout: details.layout || '',
        area: details.building_area || details.land_area || null,
        status: 'active',
        is_agency: true,
        is_public: p.is_public,
      }
    })

    // 両方を結合して表示
    setProperties([...(adminProps || []), ...normalizedAgency])
  }`

if (content.includes(oldLoad)) {
  content = content.replace(oldLoad, newLoad)
  fs.writeFileSync(filePath, content, 'utf8')
  console.log('SUCCESS: PropertyMatching.jsx を更新しました！')
} else {
  console.log('ERROR: 対象箇所が見つかりませんでした')
  console.log('別パターンで試みます...')

  // 別パターン：行番号で特定
  const lines = content.split('\n')
  let startLine = -1
  let endLine = -1

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('async function loadProperties()')) {
      startLine = i
    }
    if (startLine >= 0 && i > startLine && lines[i].trim() === '}') {
      endLine = i
      break
    }
  }

  if (startLine >= 0 && endLine >= 0) {
    const newLines = newLoad.split('\n')
    lines.splice(startLine, endLine - startLine + 1, ...newLines)
    fs.writeFileSync(filePath, lines.join('\n'), 'utf8')
    console.log('SUCCESS: PropertyMatching.jsx を更新しました！（別パターン）')
  } else {
    console.log('FAILED: 自動修正できませんでした')
  }
}
