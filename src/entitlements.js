'use strict';

const PLAN_ENTITLEMENTS = Object.freeze({
  free: Object.freeze({ dailyLimit: 5, maxConcurrentDownloads: 1, recordingDurationLimitMs: 5 * 60 * 1000 }),
  creator: Object.freeze({ dailyLimit: null, maxConcurrentDownloads: 5, recordingDurationLimitMs: null }),
  owner: Object.freeze({ dailyLimit: null, maxConcurrentDownloads: null, recordingDurationLimitMs: null }),
});

function normalizePlanLevel(value) {
  const original = String(value || '').trim().toLowerCase();
  const normalized = ['pro', 'ultimate', 'flagship', 'lifetime'].includes(original) ? 'creator' : original;
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
  const projects = {};
  if (value && typeof value === 'object' && value.usage && typeof value.usage === 'object') {
    for (const [key, count] of Object.entries(value.usage)) {
      const normalizedCount = Math.max(0, Math.floor(Number(count) || 0));
      if (/^(?:account:|device:).+\|\d{4}-\d{2}-\d{2}$/.test(key) && normalizedCount > 0) {
        usage[key] = normalizedCount;
      }
    }
  }
  if (value && typeof value === 'object' && value.projects && typeof value.projects === 'object') {
    for (const [key, identifiers] of Object.entries(value.projects)) {
      if (!/^(?:account:|device:).+\|\d{4}-\d{2}-\d{2}$/.test(key) || !Array.isArray(identifiers)) continue;
      const normalized = Array.from(new Set(identifiers
        .map((identifier) => String(identifier || '').trim().toLowerCase())
        .filter((identifier) => /^[a-f0-9]{64}$/.test(identifier))))
        .slice(0, 1000);
      if (normalized.length) projects[key] = normalized;
    }
  }
  return { version: 2, usage, projects };
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

function normalizeProjectKeys(values) {
  const input = Array.isArray(values) ? values : [values];
  return Array.from(new Set(input
    .map((value) => String(value || '').trim().toLowerCase())
    .filter((value) => /^[a-f0-9]{64}$/.test(value))));
}

function consumeProjectEntitlement(storeValue, profileValue = {}, projectKeys = [], now = Date.now()) {
  const store = normalizeStore(storeValue);
  const before = entitlementState(store, profileValue, now);
  const usageKey = `${before.identity}|${before.date}`;
  const existing = new Set(store.projects[usageKey] || []);
  const requestedKeys = normalizeProjectKeys(projectKeys);
  const newKeys = requestedKeys.filter((key) => !existing.has(key));
  if (!newKeys.length) return { ok: true, charge: 0, store, state: before };
  if (before.remainingToday !== null && newKeys.length > before.remainingToday) {
    return { ok: false, charge: newKeys.length, store, state: before };
  }
  store.projects[usageKey] = [...existing, ...newKeys].slice(-1000);
  store.usage[usageKey] = before.usedToday + newKeys.length;
  const minimumDate = dayKey(new Date(new Date(now).getTime() - 35 * 24 * 60 * 60 * 1000));
  for (const key of Object.keys(store.usage)) {
    if (key.slice(-10) < minimumDate) delete store.usage[key];
  }
  for (const key of Object.keys(store.projects)) {
    if (key.slice(-10) < minimumDate) delete store.projects[key];
  }
  return { ok: true, charge: newKeys.length, store, state: entitlementState(store, profileValue, now) };
}

function downloadEntitlementCharge(newEntryCount, retryExisting = false) {
  const count = Math.max(0, Math.floor(Number(newEntryCount) || 0));
  return retryExisting === true ? 0 : count;
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
  consumeProjectEntitlement,
  downloadEntitlementCharge,
  dayKey,
  entitlementState,
  normalizeIdentity,
  normalizePlanLevel,
  normalizeProfile,
  normalizeStore,
};
