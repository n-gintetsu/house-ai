// 案件メンバーの role の正規化。保存値が小文字のことがあるため、判定は必ず normRole を通す。
// 既存の api/sign-file.js / api/meeting-*.js と同じマップ（Member は既存データ保護用のフォールバック）。
export const ROLE_CANON = {
  owner: 'Owner', manager: 'Manager', staff: 'Staff', customer: 'Customer',
  broker: 'Broker', judicialscrivener: 'JudicialScrivener', bank: 'Bank',
  reformcompany: 'ReformCompany', guest: 'Guest', member: 'Member',
}

export const normRole = (r) => ROLE_CANON[String(r || '').toLowerCase()] || r

// 確認依頼を送れる role（正規化後）。allowlist なので、未知の値・null・Customer・Guest・Member は送れない。
export const NOTIFY_SENDER_ROLES = [
  'Owner',
  'Manager',
  'Staff',
  'Broker',
  'JudicialScrivener',
  'Bank',
  'ReformCompany',
]

export function canSendNotification(role) {
  return NOTIFY_SENDER_ROLES.indexOf(normRole(role)) !== -1
}
