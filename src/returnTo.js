// ログイン後の復帰先（returnTo）を扱う。外部URLへは絶対に飛ばさない。
// 保存先は sessionStorage（同一タブのみ・読み書きは常に try/catch）。
const STORAGE_KEY = 'ha_ws_return_to'

// src/main.jsx で WorkspaceAuthGuard に包まれているパスだけを許可する。
//   :202 /workspace（/workspace/）  :204 /houses（/houses/）  :206 /clients（/clients/）
//   :208 /settings（/settings/）    :210 /house/<id>（startsWith）
// Guard 外のパス（/login /signup /ws-legal /admin /pro/docs /meeting/ 等）は許可しない。
const ALLOWED_BASES = ['/workspace', '/houses', '/clients', '/settings', '/house']

// 制御文字と空白は入り得ない。混入していれば壊れた値か細工された値とみなす。
function hasUnsafeChars(v) {
  if (/[\u0000-\u001F\u007F]/.test(v)) return true
  if (/\s/.test(v)) return true
  return false
}

function pathPart(v) {
  const q = v.indexOf('?')
  if (q === -1) return v
  return v.slice(0, q)
}

// pathname を '/' で分割し、'.' または '..' と完全一致するセグメントがあれば真。
// '/workspace/../admin' はブラウザが /admin に正規化するため allowlist をすり抜ける。
// includes('..') ではなくセグメント単位で見るので '/house/a..b' や '/workspace/..foo' は拒否しない。
// クエリは見ない（'?note=a..b' は正当）。
function hasDotSegment(v) {
  const parts = pathPart(v).split('/')
  for (let i = 0; i < parts.length; i++) {
    if (parts[i] === '.' || parts[i] === '..') return true
  }
  return false
}

// 形の検証（規則2〜6）。デコード後にも同じ検証をかける。
function basicShapeOk(v) {
  if (typeof v !== 'string' || v === '') return false
  if (hasUnsafeChars(v)) return false
  if (v.charAt(0) !== '/') return false
  if (v.indexOf('//') === 0) return false
  if (v.indexOf('/\\') === 0) return false
  if (v.indexOf(':') !== -1) return false
  if (hasDotSegment(v)) return false
  return true
}

// パス部分が allowlist と一致、または '/' 区切りの前方一致であること
function inAllowlist(v) {
  const p = pathPart(v)
  for (let i = 0; i < ALLOWED_BASES.length; i++) {
    const base = ALLOWED_BASES[i]
    if (p === base) return true
    if (p.indexOf(base + '/') === 0) return true
  }
  return false
}

export function isSafeInternalPath(v) {
  if (typeof v !== 'string' || v === '') return false
  if (!basicShapeOk(v)) return false
  let decoded = ''
  try {
    decoded = decodeURIComponent(v)
  } catch (e) {
    // 不正なエンコード（%zz など）は受け付けない
    return false
  }
  if (!basicShapeOk(decoded)) return false
  if (!inAllowlist(v)) return false
  if (!inAllowlist(decoded)) return false
  return true
}

export function saveReturnTo(path) {
  if (!isSafeInternalPath(path)) return
  try {
    window.sessionStorage.setItem(STORAGE_KEY, path)
  } catch (e) {
    // sessionStorage が使えない環境ではクエリ側の returnTo が保険になる
  }
}

function fromQuery() {
  try {
    const v = new URLSearchParams(window.location.search).get('returnTo')
    return isSafeInternalPath(v) ? v : null
  } catch (e) {
    return null
  }
}

function fromStorage() {
  try {
    const v = window.sessionStorage.getItem(STORAGE_KEY)
    return isSafeInternalPath(v) ? v : null
  } catch (e) {
    return null
  }
}

function clearStorage() {
  try {
    window.sessionStorage.removeItem(STORAGE_KEY)
  } catch (e) {
    // 消せなくても動作は続ける
  }
}

// 消さずに返す。クエリを先に見る（クエリも必ず再検証する）。
export function getReturnTo() {
  const q = fromQuery()
  if (q) return q
  return fromStorage()
}

// 1回限りの消費。取得できたら sessionStorage から消す。
export function takeReturnTo() {
  const v = getReturnTo()
  if (!v) return null
  clearStorage()
  return v
}
