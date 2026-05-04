import { supabase } from './supabase';

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
  try {
    await supabase.from('analytics_events').insert([{
      event_type: eventType,
      session_id: getSessionId(),
      metadata,
    }]);
  } catch (e) {
    console.warn('track error', e);
  }
}
