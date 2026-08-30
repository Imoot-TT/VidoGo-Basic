'use strict';

const PLAN_ENTITLEMENTS = Object.freeze({
  free: Object.freeze({ dailyLimit: 5, maxConcurrentDownloads: 1, recordingDurationLimitMs: 5 * 60 * 1000 }),
  pro: Object.freeze({ dailyLimit: 30, maxConcurrentDownloads: 5, recordingDurationLimitMs: 30 * 60 * 1000 }),
  ultimate: Object.freeze({ dailyLimit: null, maxConcurrentDownloads: 10, recordingDurationLimitMs: null }),
  lifetime: Object.freeze({ dailyLimit: null, maxConcurrentDownloads: 10, recordingDurationLimitMs: null }),
  owner: Object.freeze({ dailyLimit: null, maxConcurrentDownloads: null, recordingDurationLimitMs: null }),
});

function normalizePlanLevel(value) {
  const normalized = value === 'flagship' ? 'ultimate' : String(value || '').trim().toLowerCase();
  return Object.prototype.hasOwnProperty.call(PLAN_ENTITLEMENTS, normalized) ? normalized : 'free';
}

function normalizeIdentity(value) {
  const normalized = String(value || '').trim().toLowerCase();
  if (normalized === 'device:anonymous') return normalized;
  if (normalized.startsWith('account:') && normalized.length > 'account:'.length) return normalized;
  if (normalized.startsWith('device:') && normalized.length > 'device:'.length) return normalized;
  return normalized ? `account:${normalized}` : 'device:anonymous';
}

function dayKey(value = Date.now()) {
  const date = value instanceof Date ? value : new Date(value);
  if (!Number.isFinite(date.getTime())) return dayKey(Date.now());
  return date.toISOString().slice(0, 10);
}

function normalizeStore(value) {
  const usage = {};
  if (value && typeof value === 'object' && value.usage && typeof value.usage === 'object') {
    for (const [key, count] of Object.entries(value.usage)) {
      const normalizedCount = Math.max(0, Math.floor(Number(count) || 0));
      if (/^(?:account:|device:).+\|\d{4}-\d{2}-\d{2}$/.test(key) && normalizedCount > 0) {
        usage[key] = normalizedCount;
      }
    }
  }
  return { version: 1, usage };
}

function normalizeProfile(profile = {}) {
  return {
    identity: normalizeIdentity(profile.accountId || profile.identity),
    planLevel: normalizePlanLevel(profile.planLevel),
  };
}

function entitlementState(storeValue, profileValue = {}, now = Date.now()) {
  const store = normalizeStore(storeValue);
  const profile = normalizeProfile(profileValue);
  const date = dayKey(now);
  const limits = PLAN_ENTITLEMENTS[profile.planLevel];
  const usageKey = `${profile.identity}|${date}`;
  const usedToday = Math.max(0, Number(store.usage[usageKey]) || 0);
  const remainingToday = limits.dailyLimit === null
    ? null
    : Math.max(0, limits.dailyLimit - usedToday);
  return {
    identity: profile.identity,
    planLevel: profile.planLevel,
    date,
    usedToday,
    dailyLimit: limits.dailyLimit,
    remainingToday,
    maxConcurrentDownloads: limits.maxConcurrentDownloads,
    recordingDurationLimitMs: limits.recordingDurationLimitMs,
  };
}

function consumeDailyEntitlement(storeValue, profileValue = {}, count = 1, now = Date.now()) {
  const store = normalizeStore(storeValue);
  const requested = Math.max(0, Math.floor(Number(count) || 0));
  const before = entitlementState(store, profileValue, now);
  if (requested === 0) return { ok: true, store, state: before };
  if (before.remainingToday !== null && requested > before.remainingToday) {
    return { ok: false, store, state: before };
  }
  const usageKey = `${before.identity}|${before.date}`;
  store.usage[usageKey] = before.usedToday + requested;
  const minimumDate = dayKey(new Date(new Date(now).getTime() - 35 * 24 * 60 * 60 * 1000));
  for (const key of Object.keys(store.usage)) {
    if (key.slice(-10) < minimumDate) delete store.usage[key];
  }
  return { ok: true, store, state: entitlementState(store, profileValue, now) };
}

function clampConcurrency(value, profileValue = {}) {
  const profile = normalizeProfile(profileValue);
  const requested = Math.max(1, Math.min(10, Math.floor(Number(value) || 1)));
  const limit = PLAN_ENTITLEMENTS[profile.planLevel].maxConcurrentDownloads;
  return limit === null ? requested : Math.min(requested, limit);
}

module.exports = {
  PLAN_ENTITLEMENTS,
  clampConcurrency,
  consumeDailyEntitlement,
  dayKey,
  entitlementState,
  normalizeIdentity,
  normalizePlanLevel,
  normalizeProfile,
  normalizeStore,
};
