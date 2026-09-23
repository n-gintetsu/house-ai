// LINE の push 送信。宛先の LINE ユーザーIDは引数で受け取るだけで、ログには出さない。
// 本文は固定文のみ（案件名・顧客名・ファイル名・依頼者名・メッセージ本文は載せない）。
const LINE_PUSH_URL = 'https://api.line.me/v2/bot/message/push'
const WORKSPACE_URL_BASE = 'https://www.house-ai.co.jp/workspace?id='

// 確認依頼の固定文。差し込むのは案件ID（リンク用）だけ。
export function buildConfirmRequestLineText(workspaceId) {
  return 'House-AI Workspace で確認のご依頼が届きました。\n内容はWorkspaceでご確認ください。\n' + WORKSPACE_URL_BASE + workspaceId
}

/**
 * LINE へ push する。戻り値は { ok, errorCode }。
 * 失敗しても例外は投げない。errorCode は固定コードのみで、
 * 外部APIの生のエラー本文・ステータス・宛先は保存もログ出力もしない。
 */
export async function sendLinePush(accessToken, to, text) {
  try {
    const res = await fetch(LINE_PUSH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + accessToken,
      },
      body: JSON.stringify({
        to: to,
        messages: [{ type: 'text', text: text }],
      }),
    })
    if (!res.ok) {
      console.error('[line/notify] push failed')
      return { ok: false, errorCode: 'line_push_failed' }
    }
    return { ok: true, errorCode: null }
  } catch (e) {
    console.error('[line/notify] push error')
    return { ok: false, errorCode: 'line_push_error' }
  }
}
