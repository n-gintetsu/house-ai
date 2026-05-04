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
    const safeMetadata = JSON.parse(JSON.stringify(metadata, (key, value) => {
      if (value instanceof Element || value instanceof HTMLElement || value instanceof Node) return undefined;
      if (typeof value === 'function') return undefined;
      return value;
    }));
    await supabase.from('analytics_events').insert([{
      event_type: eventType,
      session_id: getSessionId(),
      metadata: safeMetadata,
    }]);
  } catch (e) {
    console.warn('track error', e);
  }
}
