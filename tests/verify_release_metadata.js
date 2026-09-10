const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');
const packageJson = JSON.parse(read('package.json'));
const version = packageJson.version;
const tag = `basic-v${version}`;
const installer = `VidoGo-Basic-${version}-x64-Setup.exe`;

for (const readmePath of ['README.md', 'README.zh-CN.md']) {
  const readme = read(readmePath);
  assert.match(readme, new RegExp(`version-${version.replaceAll('.', '\\.')}-1688f0`), `${readmePath} version badge is stale`);
  assert.ok(readme.includes(`/releases/tag/${tag}`), `${readmePath} release link is stale`);
  assert.ok(readme.includes(version), `${readmePath} download label is stale`);
}

const versionDoc = read('VERSION.md');
assert.ok(versionDoc.includes(`源码版本：**${version}**`), 'VERSION.md source version is stale');
assert.ok(versionDoc.includes(`\`${tag}\``), 'VERSION.md release tag is stale');
assert.ok(versionDoc.includes(`\`${installer}\``), 'VERSION.md installer name is stale');

const notesPath = path.join(root, 'docs', 'releases', `${version}.md`);
assert.ok(fs.existsSync(notesPath), `Missing release notes: docs/releases/${version}.md`);
const notes = fs.readFileSync(notesPath, 'utf8');
assert.ok(notes.includes(`VidoGo Basic ${version}`), 'Release notes title is stale');
assert.ok(!/Full Changelog/i.test(notes), 'Release notes must not be a generated Full Changelog');
assert.ok(!/测试通过|代码行数|SHA-?\d*|IPC|electron-updater/i.test(notes), 'Release notes contain developer-facing details');

console.log(JSON.stringify({ version, tag, installer, releaseNotes: path.relative(root, notesPath) }));
