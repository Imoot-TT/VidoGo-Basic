const assert = require('node:assert/strict');
const { beginSession, createEvent, normalizeAnalyticsStore } = require('../src/analytics');

const first = beginSession({}, new Date('2026-09-10T10:00:00Z'));
assert.equal(first.sessionCount, 1);
assert.equal(beginSession(first, new Date('2026-09-10T23:00:00Z')).sessionCount, 1);
assert.equal(beginSession(first, new Date('2026-09-11T10:00:00Z')).sessionCount, 2);
assert.equal(normalizeAnalyticsStore({ consent: false }).consent, false);
assert.equal(createEvent('unknown'), null);
const event = createEvent('verified_saved', {
  provider: 'YouTube',
  path: 'C:\\private\\secret.mp4',
  title: 'private title',
  mediaType: 'Video',
});
assert.deepEqual(event.properties, { provider: 'youtube', mediaType: 'video' });
console.log('Analytics verification passed.');
