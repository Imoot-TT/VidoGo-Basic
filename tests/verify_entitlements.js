const assert = require('assert');
const {
  clampConcurrency,
  consumeDailyEntitlement,
  consumeProjectEntitlement,
  downloadEntitlementCharge,
  entitlementState,
  normalizeIdentity,
  normalizePlanLevel,
  normalizeProfile,
  normalizeStore,
} = require('../src/entitlements');

const now = new Date('2026-08-23T12:00:00.000Z');
let store = normalizeStore({});
const free = { accountId: null, planLevel: 'free' };

assert.strictEqual(normalizePlanLevel('flagship'), 'creator');
assert.strictEqual(normalizePlanLevel('pro'), 'creator');
assert.strictEqual(normalizePlanLevel('lifetime'), 'creator');
assert.strictEqual(normalizeIdentity('device:anonymous'), 'device:anonymous');
assert.strictEqual(normalizeIdentity('account:Person@Example.com'), 'account:person@example.com');
assert.deepStrictEqual(
  normalizeProfile(normalizeProfile({ accountId: 'Person@Example.com', planLevel: 'pro' })),
  { identity: 'account:person@example.com', planLevel: 'creator' },
);
assert.strictEqual(clampConcurrency(10, free), 1);
assert.strictEqual(clampConcurrency(10, { accountId: 'pro@example.com', planLevel: 'pro' }), 5);
assert.strictEqual(clampConcurrency(10, { accountId: 'vip@example.com', planLevel: 'ultimate' }), 5);
assert.strictEqual(clampConcurrency(10, { accountId: 'owner@example.com', planLevel: 'owner' }), 10);
assert.strictEqual(downloadEntitlementCharge(3, false), 3);
assert.strictEqual(downloadEntitlementCharge(3, true), 0);
assert.strictEqual(downloadEntitlementCharge(-1, false), 0);

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
assert.strictEqual(pro.state.remainingToday, null);
assert.strictEqual(pro.state.recordingDurationLimitMs, null);

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

const projectA = 'a'.repeat(64);
const projectB = 'b'.repeat(64);
let projectStore = normalizeStore({});
let projectResult = consumeProjectEntitlement(projectStore, free, [projectA, projectA], now);
assert.strictEqual(projectResult.ok, true);
assert.strictEqual(projectResult.charge, 1);
assert.strictEqual(projectResult.state.usedToday, 1);
projectStore = projectResult.store;
projectResult = consumeProjectEntitlement(projectStore, free, [projectA], now);
assert.strictEqual(projectResult.ok, true);
assert.strictEqual(projectResult.charge, 0);
assert.strictEqual(projectResult.state.usedToday, 1);
projectResult = consumeProjectEntitlement(projectStore, free, [projectA, projectB], now);
assert.strictEqual(projectResult.charge, 1);
assert.strictEqual(projectResult.state.usedToday, 2);
assert.strictEqual(projectResult.store.projects['device:anonymous|2026-08-23'].length, 2);
projectStore = projectResult.store;
const remainingProjectKeys = ['c', 'd', 'e'].map((character) => character.repeat(64));
projectResult = consumeProjectEntitlement(projectStore, free, remainingProjectKeys, now);
assert.strictEqual(projectResult.ok, true);
assert.strictEqual(projectResult.charge, 3);
assert.strictEqual(projectResult.state.usedToday, 5);
projectStore = projectResult.store;
projectResult = consumeProjectEntitlement(projectStore, free, [projectA, projectA, projectA, projectA], now);
assert.strictEqual(projectResult.ok, true, 'Video, audio, subtitle, and cover for an existing source must remain allowed');
assert.strictEqual(projectResult.charge, 0, 'Four assets from one source must not consume four project credits');
assert.strictEqual(projectResult.state.usedToday, 5);
const sixthProject = 'f'.repeat(64);
projectResult = consumeProjectEntitlement(projectStore, free, [sixthProject], now);
assert.strictEqual(projectResult.ok, false);
assert.strictEqual(projectResult.state.usedToday, 5);
projectResult = consumeProjectEntitlement(projectStore, free, [sixthProject], new Date('2026-08-24T00:00:01.000Z'));
assert.strictEqual(projectResult.ok, true);
assert.strictEqual(projectResult.charge, 1);
assert.strictEqual(projectResult.state.usedToday, 1);

console.log(JSON.stringify({ free, pro: pro.state, ultimate: ultimate.state, owner: owner.state }));
