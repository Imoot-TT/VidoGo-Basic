const assert = require('assert');
const {
  compareVersions,
  deriveGitHubUpdateState,
  latestChannelRelease,
  parseReleaseTag,
  parseVersion,
} = require('../src/update-check');

assert.strictEqual(parseVersion('v1.5.0').raw, '1.5.0');
assert.strictEqual(parseReleaseTag('basic-v0.1.0').raw, '0.1.0');
assert.strictEqual(parseReleaseTag('v2-v0.9.0'), null);
assert.strictEqual(parseVersion('1.5'), null);
assert.strictEqual(compareVersions('1.6.0', '1.5.9'), 1);
assert.strictEqual(compareVersions('1.5.0', '1.5.0'), 0);
assert.strictEqual(compareVersions('1.5.0-beta.2', '1.5.0-beta.1'), 1);
assert.strictEqual(compareVersions('1.5.0', '1.5.0-rc.1'), 1);

const releases = [
  {
    tag_name: 'v2-v3.0.0',
    html_url: 'https://github.com/Imoot-TT/VidoGo-V2/releases/tag/v2-v3.0.0',
  },
  {
    tag_name: 'basic-v0.2.0',
    html_url: 'https://github.com/Imoot-TT/VidoGo-Basic/releases/tag/basic-v0.2.0',
    published_at: '2026-08-23T12:00:00Z',
    assets: [
      { name: 'latest.yml', browser_download_url: 'https://github.com/Imoot-TT/VidoGo-Basic/releases/download/basic-v0.2.0/latest.yml' },
      { name: 'VidoGo-Basic-0.2.0-x64-Setup.exe', browser_download_url: 'https://github.com/Imoot-TT/VidoGo-Basic/releases/download/basic-v0.2.0/VidoGo-Basic-0.2.0-x64-Setup.exe' },
    ],
  },
  {
    tag_name: 'basic-v0.1.1',
    html_url: 'https://github.com/Imoot-TT/VidoGo-Basic/releases/tag/basic-v0.1.1',
  },
];
assert.strictEqual(latestChannelRelease(releases, 'basic').tag_name, 'basic-v0.2.0');

const newer = deriveGitHubUpdateState('0.1.0', {
  status: 200,
  data: releases,
}, '2026-08-23T12:30:00Z');
assert.strictEqual(newer.ok, true);
assert.strictEqual(newer.available, true);
assert.strictEqual(newer.latestVersion, '0.2.0');
assert.match(newer.downloadUrl, /Setup\.exe$/);

const current = deriveGitHubUpdateState('0.2.0', { status: 200, data: releases });
assert.strictEqual(current.available, false);
assert.strictEqual(current.status, 'current');

const unpublished = deriveGitHubUpdateState('0.1.0', { status: 200, data: [releases[0]] });
assert.strictEqual(unpublished.ok, false);
assert.strictEqual(unpublished.status, 'unpublished');
assert.strictEqual(unpublished.latestVersion, null);

const unsafe = deriveGitHubUpdateState('0.1.0', { status: 200, data: { tag_name: 'basic-v0.2.0', html_url: 'file:///tmp/release' } });
assert.strictEqual(unsafe.releaseUrl, null);

console.log(JSON.stringify({ newer, current, unpublished }));
