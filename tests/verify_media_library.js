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
  groupMediaLibraryItems,
  normalizeProviderId,
  providerFolderName,
  resolveMediaProjectDirectory,
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
    'Sample video [12345]',
  );
  assert.equal(downloadMediaFileName({ kind: 'video', qualityLabel: '1080p · H.264', videoCodec: 'avc1', extension: 'mp4' }), 'video-1080p-h264.mp4');
  assert.equal(downloadMediaFileName({ kind: 'audio', formatId: '140', mimeType: 'audio/mp4' }), 'audio-140.m4a');
  assert.equal(downloadMediaFileName({ assetType: 'image', mimeType: 'image/jpeg' }), 'cover.jpg');
  assert.equal(downloadMediaFileName({ assetType: 'subtitle', subtitleLanguage: 'zh-Hans', extension: 'vtt' }), 'subtitle-zh-hans.vtt');

  const temporaryRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'vidogo-media-library-'));
  try {
    const mediaPath = path.join(temporaryRoot, 'TikTok', '20260906 - Sample [123]', 'video-1080p-h264.mp4');
    await fs.mkdir(path.dirname(mediaPath), { recursive: true });
    await fs.writeFile(mediaPath, Buffer.from('test-media'));
    const store = createMediaLibraryStore(path.join(temporaryRoot, 'media-library.json'));
    const legacyVideoFolder = path.join(temporaryRoot, 'YouTube', '20260907-231211 - Old title [same-id] [401+140]');
    const legacyAudioFolder = path.join(temporaryRoot, 'YouTube', '20260907-231438 - New title [same-id] [251]');
    await fs.mkdir(path.join(legacyVideoFolder, 'video'), { recursive: true });
    await fs.mkdir(path.join(legacyAudioFolder, 'audio'), { recursive: true });
    await fs.writeFile(path.join(legacyVideoFolder, 'video', 'video.mp4'), Buffer.from('video'));
    await fs.writeFile(path.join(legacyAudioFolder, 'audio', 'audio.mp3'), Buffer.from('audio'));
    assert.equal(
      await resolveMediaProjectDirectory(path.join(temporaryRoot, 'YouTube'), { title: 'Changed title', mediaId: 'same-id' }),
      legacyVideoFolder,
      'Existing projects with the same media id must be reused, preferring the folder that owns the video',
    );
    const first = await store.addCompleted({
      sourceTaskId: 'job-1',
      title: 'Sample',
      provider: 'tiktok',
      mediaId: '123',
      sourceGroupId: 'tiktok:123',
      sourceUrl: 'https://www.tiktok.com/@demo/video/123',
      filePath: mediaPath,
      qualityLabel: '1080p',
    });
    assert.equal(first.status, 'available');
    assert.equal(first.fileSize, 10);
    assert.equal(first.assetType, 'video');
    assert.equal(first.sourceGroupId, 'tiktok:123');

    await store.addCompleted({ sourceTaskId: 'job-1', title: 'Updated title', provider: 'tiktok', filePath: mediaPath });
    await store.addCompleted({ sourceTaskId: 'job-2', title: 'Intentional duplicate', provider: 'tiktok', filePath: mediaPath });
    let library = await store.list();
    assert.equal(library.items.length, 1, 'The same physical asset must remain one library record across repeated tasks');
    assert.equal(library.items.find((item) => item.sourceTaskId === 'job-1').title, 'Updated title');

    await fs.unlink(mediaPath);
    library = await store.list({ refresh: true });
    assert(library.items.every((item) => item.status === 'missing'), 'Refresh must retain records and mark externally deleted files as missing');
    const persisted = JSON.parse(await fs.readFile(store.filePath, 'utf8'));
    assert.equal(persisted.schemaVersion, 3);
    const manifest = JSON.parse(await fs.readFile(path.join(path.dirname(mediaPath), 'metadata.json'), 'utf8'));
    assert.equal(manifest.schemaVersion, 3);
    assert.equal(manifest.assets[0].assetType, 'video');
    assert.equal(manifest.assets[0].relativePath, 'video-1080p-h264.mp4');

    const groupedProjects = groupMediaLibraryItems([
      {
        id: 'asset-video', sourceTaskId: 'video-job', title: 'Shared project', provider: 'youtube', mediaId: 'shared-id',
        filePath: path.join(legacyVideoFolder, 'video', 'video.mp4'), folderPath: legacyVideoFolder, assetType: 'video',
        fileSize: 5, downloadedAt: '2026-09-07T23:12:00.000Z', status: 'available',
      },
      {
        id: 'asset-audio', sourceTaskId: 'audio-job', title: 'Shared project', provider: 'youtube', mediaId: 'shared-id',
        filePath: path.join(legacyAudioFolder, 'audio', 'audio.mp3'), folderPath: legacyAudioFolder, assetType: 'audio',
        fileSize: 5, downloadedAt: '2026-09-07T23:14:00.000Z', status: 'available',
      },
      {
        id: 'cover-from-video', sourceTaskId: 'video-job:cover', title: 'Shared project', provider: 'youtube', mediaId: 'shared-id',
        filePath: path.join(legacyVideoFolder, 'images', 'cover.jpg'), folderPath: legacyVideoFolder, assetType: 'image', assetRole: 'cover',
        fileSize: 4, downloadedAt: '2026-09-07T23:12:00.000Z', status: 'available',
      },
      {
        id: 'cover-from-audio', sourceTaskId: 'audio-job:cover', title: 'Shared project', provider: 'youtube', mediaId: 'shared-id',
        filePath: path.join(legacyAudioFolder, 'images', 'cover.jpg'), folderPath: legacyAudioFolder, assetType: 'image', assetRole: 'cover',
        fileSize: 4, downloadedAt: '2026-09-07T23:14:00.000Z', status: 'available',
      },
    ]);
    assert.equal(groupedProjects.length, 1, 'Assets with the same provider and media id must appear as one project');
    assert.deepEqual(groupedProjects[0].assetCounts, { video: 1, audio: 1, image: 1, subtitle: 0 });
    assert.equal(groupedProjects[0].assets.filter((asset) => asset.assetRole === 'cover').length, 1, 'Duplicate legacy covers must be represented as one shared cover');
    assert.equal(groupedProjects[0].assetCount, 3);
  } finally {
    await fs.rm(temporaryRoot, { recursive: true, force: true });
  }

  process.stdout.write(JSON.stringify({ naming: true, classification: true, records: true, missingFiles: true, projectGrouping: true, sharedCover: true }) + '\n');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
