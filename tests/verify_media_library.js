'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const {
  classifiedOutputDirectory,
  createMediaLibraryStore,
  downloadMediaFileName,
  downloadTaskFolderName,
  normalizeProviderId,
  providerFolderName,
  safePathSegment,
} = require('../src/media-library');

async function main() {
  assert.equal(normalizeProviderId('', 'https://www.tiktok.com/@demo/video/123'), 'tiktok');
  assert.equal(normalizeProviderId('x'), 'twitter');
  assert.equal(providerFolderName('agedm'), 'AGE');
  assert.equal(path.basename(classifiedOutputDirectory('D:\\Downloads\\VidoGo Basic', 'youtube')), 'YouTube');
  assert.equal(safePathSegment('A:B/C*D?'), 'A B C D');
  assert.equal(
    downloadTaskFolderName({ title: 'Sample: video', mediaId: '12345' }, new Date(2026, 8, 6)),
    '20260906 - Sample video [12345]',
  );
  assert.equal(downloadMediaFileName({ kind: 'video', qualityLabel: '1080p · H.264', videoCodec: 'avc1', extension: 'mp4' }), 'video-1080p-h264.mp4');
  assert.equal(downloadMediaFileName({ kind: 'audio', formatId: '140', mimeType: 'audio/mp4' }), 'audio-140.m4a');

  const temporaryRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'vidogo-media-library-'));
  try {
    const mediaPath = path.join(temporaryRoot, 'TikTok', '20260906 - Sample [123]', 'video-1080p-h264.mp4');
    await fs.mkdir(path.dirname(mediaPath), { recursive: true });
    await fs.writeFile(mediaPath, Buffer.from('test-media'));
    const store = createMediaLibraryStore(path.join(temporaryRoot, 'media-library.json'));
    const first = await store.addCompleted({
      sourceTaskId: 'job-1',
      title: 'Sample',
      provider: 'tiktok',
      mediaId: '123',
      sourceUrl: 'https://www.tiktok.com/@demo/video/123',
      filePath: mediaPath,
      qualityLabel: '1080p',
    });
    assert.equal(first.status, 'available');
    assert.equal(first.fileSize, 10);

    await store.addCompleted({ sourceTaskId: 'job-1', title: 'Updated title', provider: 'tiktok', filePath: mediaPath });
    await store.addCompleted({ sourceTaskId: 'job-2', title: 'Intentional duplicate', provider: 'tiktok', filePath: mediaPath });
    let library = await store.list();
    assert.equal(library.items.length, 2, 'Separate download tasks must remain separate library records');
    assert.equal(library.items.find((item) => item.sourceTaskId === 'job-1').title, 'Updated title');

    await fs.unlink(mediaPath);
    library = await store.list({ refresh: true });
    assert(library.items.every((item) => item.status === 'missing'), 'Refresh must retain records and mark externally deleted files as missing');
    const persisted = JSON.parse(await fs.readFile(store.filePath, 'utf8'));
    assert.equal(persisted.schemaVersion, 1);
  } finally {
    await fs.rm(temporaryRoot, { recursive: true, force: true });
  }

  process.stdout.write(JSON.stringify({ naming: true, classification: true, records: true, missingFiles: true }) + '\n');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
