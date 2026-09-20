const crypto = require('node:crypto');

const ALLOWED_EVENTS = new Set([
  'first_open',
  'second_session',
  'source_opened',
  'media_detected',
  'asset_pack_started',
  'verified_saved',
  'save_failed',
  'editor_imported',
  'paywall_viewed',
  'checkout_started',
  'purchase_completed',
]);
const ALLOWED_PROPERTIES = new Set(['provider', 'mediaType', 'strategy', 'result', 'errorCategory', 'billing']);

function dayKey(now = new Date()) {
  return new Date(now).toISOString().slice(0, 10);
}

function normalizeAnalyticsStore(value = {}, now = new Date()) {
  const source = value && typeof value === 'object' ? value : {};
  const queue = Array.isArray(source.queue) ? source.queue.filter((event) => event && ALLOWED_EVENTS.has(event.event)).slice(-200) : [];
  return {
    version: 1,
    anonymousId: /^[0-9a-f-]{36}$/i.test(String(source.anonymousId || '')) ? source.anonymousId : crypto.randomUUID(),
    consent: typeof source.consent === 'boolean' ? source.consent : null,
    firstSeenAt: source.firstSeenAt || new Date(now).toISOString(),
    lastSessionDay: source.lastSessionDay || null,
    sessionCount: Math.max(0, Number(source.sessionCount) || 0),
    firstOpenTracked: source.firstOpenTracked === true,
    secondSessionTracked: source.secondSessionTracked === true,
    queue,
  };
}

function beginSession(value, now = new Date()) {
  const store = normalizeAnalyticsStore(value, now);
  const today = dayKey(now);
  if (store.lastSessionDay !== today) {
    store.lastSessionDay = today;
    store.sessionCount += 1;
  }
  return store;
}

function sanitizeProperties(value = {}) {
  const output = {};
  for (const [key, raw] of Object.entries(value && typeof value === 'object' ? value : {})) {
    if (!ALLOWED_PROPERTIES.has(key)) continue;
    const safe = String(raw ?? '').trim().toLowerCase().replace(/[^a-z0-9._-]/g, '-').slice(0, 64);
    if (safe) output[key] = safe;
  }
  return output;
}

function createEvent(event, properties = {}, now = new Date()) {
  if (!ALLOWED_EVENTS.has(event)) return null;
  return {
    eventId: crypto.randomUUID(),
    event,
    occurredAt: new Date(now).toISOString(),
    properties: sanitizeProperties(properties),
  };
}

module.exports = { ALLOWED_EVENTS, beginSession, createEvent, normalizeAnalyticsStore, sanitizeProperties };
