import { createClient } from '@supabase/supabase-js'
import JSZip from 'jszip'
import { resolveWrites, CHECK_MARK, SHEET_NAME } from '../lib/juusetsu-excel-map.js'

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

const MAX_TEMPLATE_BASE64_CHARS = 4000000
const EMPTY_CHECKBOX = '□'

export function escapeXml(text) {
  return String(text)
    .split('&').join('&amp;')
    .split('<').join('&lt;')
    .split('>').join('&gt;')
    .split('"').join('&quot;')
    .split("'").join('&apos;')
}

export function escapeRegExp(text) {
  return String(text).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * シートXMLから <c r="セル参照" ...> 要素を1つ取り出す。
 * 自己終了タグ（<c r="F41" s="344"/>）と、内容を持つ形（<c ...>...</c>）の両方に対応する。
 */
export function findCellElement(xml, ref) {
  const pattern = new RegExp(
    '<c r="' + escapeRegExp(ref) + '"[^>]*?(?:/>|>[\\s\\S]*?</c>)'
  )
  const match = xml.match(pattern)
  return match ? match[0] : null
}

export function extractStyleAttr(element) {
  const m = element.match(/\ss="(\d+)"/)
  return m ? ' s="' + m[1] + '"' : ''
}

/**
 * sharedStrings.xml から □ に対応するインデックスをすべて集める。
 * 書式によっては同じ文字列が複数のインデックスに存在しうるため配列で持つ。
 */
export function findCheckboxIndexes(sharedStringsXml) {
  const indexes = []
  if (!sharedStringsXml) return indexes
  const items = sharedStringsXml.match(/<si>[\s\S]*?<\/si>/g) || []
  for (let i = 0; i < items.length; i++) {
    const texts = items[i].match(/<t[^>]*>([\s\S]*?)<\/t>/g) || []
    const joined = texts
      .map((t) => t.replace(/<[^>]+>/g, ''))
      .join('')
      .trim()
    if (joined === EMPTY_CHECKBOX) indexes.push(i)
  }
  return indexes
}

/**
 * 置換対象セルが本当に空のチェックボックス（t="s" かつ <v> が □ のインデックス）かを確認する。
 * 誤った書式に誤ったチェックを付けないための安全確認。
 */
export function isEmptyCheckboxCell(element, checkboxIndexes) {
  if (!/\st="s"/.test(element)) return false
  const m = element.match(/<v>(\d+)<\/v>/)
  if (!m) return false
  return checkboxIndexes.indexOf(Number(m[1])) !== -1
}

export function buildInlineStrCell(ref, styleAttr, value) {
  return (
    '<c r="' + ref + '"' + styleAttr + ' t="inlineStr"><is><t xml:space="preserve">' +
    escapeXml(value) +
    '</t></is></c>'
  )
}

/**
 * workbook.xml と workbook.xml.rels から、対象シートXMLのパスを解決する。
 * パスはハードコードしない。
 */
export function resolveSheetPath(workbookXml, relsXml) {
  const sheetTags = workbookXml.match(/<sheet\b[^>]*\/?>/g) || []
  let relId = ''
  for (const tag of sheetTags) {
    const nameMatch = tag.match(/\sname="([^"]*)"/)
    if (!nameMatch) continue
    const name = nameMatch[1]
      .split('&amp;').join('&')
      .split('&lt;').join('<')
      .split('&gt;').join('>')
      .split('&quot;').join('"')
      .split('&apos;').join("'")
    if (name !== SHEET_NAME) continue
    const idMatch = tag.match(/r:id="([^"]*)"/)
    if (idMatch) relId = idMatch[1]
    break
  }
  if (!relId) return ''

  const relTags = relsXml.match(/<Relationship\b[^>]*\/?>/g) || []
  for (const tag of relTags) {
    const idMatch = tag.match(/\sId="([^"]*)"/)
    if (!idMatch || idMatch[1] !== relId) continue
    const targetMatch = tag.match(/\sTarget="([^"]*)"/)
    if (!targetMatch) return ''
    let target = targetMatch[1]
    // xl/ からの相対パスを解決する
    if (target.startsWith('/')) return target.slice(1)
    if (target.startsWith('../')) return target.slice(3)
    return 'xl/' + target
  }
  return ''
}

/**
 * Vercel Serverless Function: POST /api/juusetsu-export
 * 全宅連の重説xlsxテンプレートに、生成済みドラフトの値を転記して返す。
 * zip 内の対象シートXMLだけを書き換え、他のパーツ（drawing・styles・printerSettings 等）は一切触らない。
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  let body = req.body
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body)
    } catch {
      return res.status(400).json({ error: 'Invalid JSON body' })
    }
  }
  if (!body || typeof body !== 'object') {
    return res.status(400).json({ error: 'Request body is required' })
  }

  // 認証ゲート（api/pro-docs-draft.js と同じ流儀）。
  // AI呼び出しが無くコストゼロのため、runId や回数チェックは行わない。
  const authHeader = req.headers.authorization || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''
  if (!token) {
    return res.status(401).json({ error: 'ログインが必要です', code: 'no_token' })
  }

  const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token)
  if (userErr || !userData || !userData.user) {
    return res.status(401).json({ error: 'ログインの有効期限が切れています', code: 'invalid_token' })
  }

  const { template, draft } = body

  if (typeof template !== 'string' || template === '') {
    return res.status(400).json({ error: 'テンプレートファイルが必要です' })
  }
  if (template.length > MAX_TEMPLATE_BASE64_CHARS) {
    return res.status(400).json({ error: 'ファイルサイズが大きすぎます' })
  }

  let zip
  try {
    zip = await JSZip.loadAsync(Buffer.from(template, 'base64'))
  } catch {
    return res.status(400).json({ error: 'ファイルを読み込めませんでした' })
  }

  const workbookFile = zip.file('xl/workbook.xml')
  const relsFile = zip.file('xl/_rels/workbook.xml.rels')
  if (!workbookFile || !relsFile) {
    return res.status(400).json({
      error: '対応している書式ではありません。全宅連の『重要事項説明書（土地の売買・交換用）』をアップロードしてください',
    })
  }

  const workbookXml = await workbookFile.async('string')
  const relsXml = await relsFile.async('string')
  const sheetPath = resolveSheetPath(workbookXml, relsXml)

  const sheetFile = sheetPath ? zip.file(sheetPath) : null
  if (!sheetFile) {
    return res.status(400).json({
      error: '対応している書式ではありません。全宅連の『重要事項説明書（土地の売買・交換用）』をアップロードしてください',
    })
  }

  let sheetXml = await sheetFile.async('string')

  const sharedStringsFile = zip.file('xl/sharedStrings.xml')
  const sharedStringsXml = sharedStringsFile ? await sharedStringsFile.async('string') : ''
  const checkboxIndexes = findCheckboxIndexes(sharedStringsXml)

  const resolved = resolveWrites(draft)
  const skipped = resolved.skipped.slice()
  let written = 0

  for (const w of resolved.writes) {
    const element = findCellElement(sheetXml, w.cell)
    if (!element) {
      skipped.push({ cell: w.cell, reason: 'cell_not_found' })
      continue
    }

    // チェックの書き込みは、対象が空のチェックボックスであることを確認してから行う
    if (w.value === CHECK_MARK && !isEmptyCheckboxCell(element, checkboxIndexes)) {
      skipped.push({ cell: w.cell, reason: 'not_a_checkbox' })
      continue
    }

    const styleAttr = extractStyleAttr(element)
    const replacement = buildInlineStrCell(w.cell, styleAttr, w.value)
    sheetXml = sheetXml.split(element).join(replacement)
    written = written + 1
  }

  // 対象シートXMLだけを差し替える。他のパーツには一切触れない。
  zip.file(sheetPath, sheetXml)

  const buffer = await zip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
  })

  return res.status(200).json({
    file: buffer.toString('base64'),
    filename: '重要事項説明書_下書き.xlsx',
    written: written,
    skipped: skipped,
  })
}
