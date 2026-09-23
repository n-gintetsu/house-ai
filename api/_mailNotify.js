// Resend でのメール送信。宛先アドレスは引数で受け取るだけで、ログには出さない。
// 本文は固定文のみ（案件名・顧客名・ファイル名・依頼者名・メッセージ本文は載せない）。
const RESEND_URL = 'https://api.resend.com/emails'
const MAIL_FROM = 'House-AI <noreply@house-ai.co.jp>'
const WORKSPACE_URL_BASE = 'https://www.house-ai.co.jp/workspace?id='

export const CONFIRM_REQUEST_SUBJECT = '【House-AI】確認のご依頼が届きました'

// 確認依頼の固定文。差し込むのは案件ID（リンク用）だけ。
export function buildConfirmRequestMailText(workspaceId) {
  return 'House-AI Workspace で確認のご依頼が届きました。\n'
    + '\n'
    + '内容はWorkspaceにログインしてご確認ください。\n'
    + WORKSPACE_URL_BASE + workspaceId + '\n'
    + '\n'
    + 'このメールは House-AI Workspace の通知設定がオンの方にお送りしています。\n'
    + '通知の停止は「設定 → 通知」から変更できます。\n'
    + '\n'
    + '--\n'
    + 'House-AI（GINTETSU不動産株式会社）'
}

/**
 * メールを送る。戻り値は { ok, errorCode }。
 * 失敗しても例外は投げない。errorCode は固定コードのみで、
 * 外部APIの生のエラー本文・ステータス・宛先は保存もログ出力もしない。
 */
export async function sendMail(apiKey, to, subject, text) {
  try {
    const res = await fetch(RESEND_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + apiKey,
      },
      body: JSON.stringify({
        from: MAIL_FROM,
        to: [to],
        subject: subject,
        text: text,
      }),
    })
    if (!res.ok) {
      console.error('[mail/notify] send failed')
      return { ok: false, errorCode: 'email_send_failed' }
    }
    return { ok: true, errorCode: null }
  } catch (e) {
    console.error('[mail/notify] send error')
    return { ok: false, errorCode: 'email_send_error' }
  }
}
