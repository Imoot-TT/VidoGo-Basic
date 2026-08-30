const assert = require('assert');
const {
  clampConcurrency,
  consumeDailyEntitlement,
  entitlementState,
  normalizeIdentity,
  normalizePlanLevel,
  normalizeProfile,
  normalizeStore,
} = require('../src/entitlements');

const now = new Date('2026-08-23T12:00:00.000Z');
let store = normalizeStore({});
const free = { accountId: null, planLevel: 'free' };

assert.strictEqual(normalizePlanLevel('flagship'), 'ultimate');
assert.strictEqual(normalizeIdentity('device:anonymous'), 'device:anonymous');
assert.strictEqual(normalizeIdentity('account:Person@Example.com'), 'account:person@example.com');
assert.deepStrictEqual(
  normalizeProfile(normalizeProfile({ accountId: 'Person@Example.com', planLevel: 'pro' })),
  { identity: 'account:person@example.com', planLevel: 'pro' },
);
assert.strictEqual(clampConcurrency(10, free), 1);
assert.strictEqual(clampConcurrency(10, { accountId: 'pro@example.com', planLevel: 'pro' }), 5);
assert.strictEqual(clampConcurrency(10, { accountId: 'vip@example.com', planLevel: 'ultimate' }), 10);
assert.strictEqual(clampConcurrency(10, { accountId: 'owner@example.com', planLevel: 'owner' }), 10);

for (let index = 0; index < 5; index += 1) {
  const result = consumeDailyEntitlement(store, free, 1, now);
  assert.strictEqual(result.ok, true);
  store = result.store;
}
let state = entitlementState(store, free, now);
assert.strictEqual(state.usedToday, 5);
assert.strictEqual(state.remainingToday, 0);
assert.strictEqual(state.recordingDurationLimitMs, 300000);
assert.strictEqual(consumeDailyEntitlement(store, free, 1, now).ok, false);

state = entitlementState(store, free, new Date('2026-08-24T00:00:01.000Z'));
assert.strictEqual(state.usedToday, 0);
assert.strictEqual(state.remainingToday, 5);

const pro = consumeDailyEntitlement(store, { accountId: 'pro@example.com', planLevel: 'pro' }, 30, now);
assert.strictEqual(pro.ok, true);
assert.strictEqual(pro.state.remainingToday, 0);
assert.strictEqual(pro.state.recordingDurationLimitMs, 1800000);

const ultimate = consumeDailyEntitlement(store, { accountId: 'vip@example.com', planLevel: 'ultimate' }, 100, now);
assert.strictEqual(ultimate.ok, true);
assert.strictEqual(ultimate.state.dailyLimit, null);
assert.strictEqual(ultimate.state.remainingToday, null);
assert.strictEqual(ultimate.state.usedToday, 100);

const owner = consumeDailyEntitlement(store, { accountId: 'owner@example.com', planLevel: 'owner' }, 1000, now);
assert.strictEqual(owner.ok, true);
assert.strictEqual(owner.state.dailyLimit, null);
assert.strictEqual(owner.state.remainingToday, null);
assert.strictEqual(owner.state.maxConcurrentDownloads, null);
assert.strictEqual(owner.state.recordingDurationLimitMs, null);

console.log(JSON.stringify({ free, pro: pro.state, ultimate: ultimate.state, owner: owner.state }));
