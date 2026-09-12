const SESSION_KEY = 'ha_session_id';

function getSessionId() {
  let sid = sessionStorage.getItem(SESSION_KEY);
  if (!sid) {
    sid = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, sid);
  }
  return sid;
}

export async function trackEvent(eventType, metadata = {}) {
  // [Phase S0] 計測を一時停止している。
  // analytics_events は RLS 有効で anon からの insert ができず、
  // ブラウザから直接書き込むと 403 が発生していた。
  // 本体（HONTAI_PUBLIC=false）は未公開のため、匿名書き込みの
  // 公開APIは今回作らず、no-op とする。
  //
  // TODO（本体公開Phase / Analytics Phase で再設計）:
  //   - 公開 analytics API（insert-only・service_role はサーバー側のみ）
  //   - body サイズ制限 / event_name allowlist / params schema
  //   - rate limit / 重複防止
  //   - DB の読み取り権限や任意テーブル操作は一切渡さない
  return
}
