'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs/promises');
const path = require('node:path');

const MEDIA_LIBRARY_SCHEMA_VERSION = 1;

const PROVIDER_ALIASES = Object.freeze({
  x: 'twitter',
  'x-twitter': 'twitter',
  'youtu-be': 'youtube',
  'youtube-tab': 'youtube',
  age: 'agedm',
  sooplive: 'soop',
});

const PROVIDER_FOLDER_NAMES = Object.freeze({
  youtube: 'YouTube',
  tiktok: 'TikTok',
  douyin: 'Douyin',
  agedm: 'AGE',
  vimeo: 'Vimeo',
  dailymotion: 'Dailymotion',
  rumble: 'Rumble',
  instagram: 'Instagram',
  facebook: 'Facebook',
  twitter: 'X-Twitter',
  reddit: 'Reddit',
  snapchat: 'Snapchat',
  twitch: 'Twitch',
  kick: 'Kick',
  soop: 'SOOP',
  chzzk: 'Chzzk',
  niconico: 'Niconico',
  pexels: 'Pexels',
  pixabay: 'Pixabay',
  mixkit: 'Mixkit',
  coverr: 'Coverr',
  videvo: 'Videvo',
  videezy: 'Videezy',
  web: 'Other',
});

function safePathSegment(value, fallback = 'Untitled', maxLength = 120) {
  const cleaned = String(value || '')
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/[. ]+$/g, '')
    .slice(0, maxLength);
  const result = cleaned || fallback;
  return /^(?:con|prn|aux|nul|com[1-9]|lpt[1-9])$/i.test(result) ? `_${result}` : result;
}

function providerFromUrl(rawUrl) {
  try {
    const host = new URL(String(rawUrl || '').trim()).hostname.toLowerCase().replace(/^www\./, '');
    const rules = [
      ['youtube', /(?:^|\.)youtube\.com$|^youtu\.be$/],
      ['tiktok', /(?:^|\.)tiktok\.com$/],
      ['douyin', /(?:^|\.)douyin\.com$/],
      ['agedm', /(?:^|\.)agedm\.io$/],
      ['vimeo', /(?:^|\.)vimeo\.com$/],
      ['dailymotion', /(?:^|\.)dailymotion\.com$|^dai\.ly$/],
      ['rumble', /(?:^|\.)rumble\.com$/],
      ['instagram', /(?:^|\.)instagram\.com$/],
      ['facebook', /(?:^|\.)facebook\.com$|^fb\.watch$/],
      ['twitter', /(?:^|\.)(?:x|twitter)\.com$/],
      ['reddit', /(?:^|\.)reddit\.com$/],
      ['snapchat', /(?:^|\.)snapchat\.com$/],
      ['twitch', /(?:^|\.)twitch\.tv$/],
      ['kick', /(?:^|\.)kick\.com$/],
      ['soop', /(?:^|\.)sooplive\.(?:com|co\.kr)$/],
      ['chzzk', /(?:^|\.)chzzk\.naver\.com$/],
      ['niconico', /(?:^|\.)(?:nicovideo\.jp|niconico\.jp)$/],
      ['pexels', /(?:^|\.)pexels\.com$/],
      ['pixabay', /(?:^|\.)pixabay\.com$/],
      ['mixkit', /(?:^|\.)mixkit\.co$/],
      ['coverr', /(?:^|\.)coverr\.co$/],
      ['videvo', /(?:^|\.)videvo\.net$/],
      ['videezy', /(?:^|\.)videezy\.com$/],
    ];
    return rules.find(([, matcher]) => matcher.test(host))?.[0] || '';
  } catch {
    return '';
  }
}

function normalizeProviderId(value, ...fallbackUrls) {
  const supplied = String(value || '').trim().toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
  const detected = fallbackUrls.map(providerFromUrl).find(Boolean) || '';
  const provider = supplied || detected || 'web';
  return PROVIDER_ALIASES[provider] || provider;
}

function providerFolderName(provider) {
  const normalized = normalizeProviderId(provider);
  return PROVIDER_FOLDER_NAMES[normalized]
    || safePathSegment(normalized.replace(/[-_]+/g, ' ').replace(/\b\w/g, (value) => value.toUpperCase()), 'Other', 60);
}

function localDateStamp(value = new Date()) {
  const date = value instanceof Date ? value : new Date(value);
  const valid = Number.isFinite(date.getTime()) ? date : new Date();
  return [valid.getFullYear(), valid.getMonth() + 1, valid.getDate()]
    .map((part) => String(part).padStart(2, '0'))
    .join('');
}

function downloadTaskFolderName(task = {}, value = new Date()) {
  const title = safePathSegment(task.title || task.fileName, 'Untitled', 120);
  const mediaId = safePathSegment(task.mediaId, '', 72);
  return `${localDateStamp(value)} - ${title}${mediaId ? ` [${mediaId}]` : ''}`;
}

function mediaExtension(task = {}) {
  const explicit = String(task.extension || '').trim().toLowerCase().replace(/^\./, '');
  if (/^[a-z0-9]{2,8}$/.test(explicit)) return explicit;
  const mime = String(task.mimeType || '').split(';')[0].trim().toLowerCase();
  const byMime = {
    'video/mp4': 'mp4',
    'video/webm': 'webm',
    'video/x-matroska': 'mkv',
    'audio/mpeg': 'mp3',
    'audio/mp4': 'm4a',
    'audio/webm': 'webm',
    'audio/ogg': 'ogg',
  };
  return byMime[mime] || (/^audio\//.test(mime) ? 'm4a' : 'mp4');
}

function compactMediaToken(value, maxLength = 24) {
  return String(value || '').toLowerCase()
    .replace(/avc1|avc/g, 'h264')
    .replace(/hevc|hev1|hvc1/g, 'h265')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, maxLength);
}

function downloadMediaFileName(task = {}) {
  const kind = String(task.kind || '').toLowerCase() === 'audio' || String(task.mimeType || '').toLowerCase().startsWith('audio/')
    ? 'audio'
    : 'video';
  const quality = String(task.qualityLabel || '').match(/\b\d{3,4}p\b/i)?.[0]?.toLowerCase()
    || (Number(task.resolution) > 0 ? `${Math.floor(Number(task.resolution))}p` : '');
  const codec = compactMediaToken(kind === 'audio' ? task.audioCodec : task.videoCodec);
  const format = !quality && !codec ? compactMediaToken(task.formatId, 36) : '';
  const descriptors = [quality, codec, format].filter(Boolean);
  return `${kind}${descriptors.length ? `-${descriptors.join('-')}` : ''}.${mediaExtension(task)}`;
}

function classifiedOutputDirectory(outputRoot, provider) {
  return path.join(path.resolve(String(outputRoot || '').trim()), providerFolderName(provider));
}

function emptyLibrary() {
  return { schemaVersion: MEDIA_LIBRARY_SCHEMA_VERSION, updatedAt: null, items: [] };
}

function normalizeLibraryItem(item) {
  if (!item || typeof item !== 'object') return null;
  const filePath = String(item.filePath || '').trim();
  if (!filePath) return null;
  return {
    id: String(item.id || `asset-${crypto.randomUUID()}`),
    sourceTaskId: String(item.sourceTaskId || ''),
    title: String(item.title || path.basename(filePath)),
    provider: normalizeProviderId(item.provider, item.sourceUrl, item.mediaUrl),
    mediaId: String(item.mediaId || ''),
    sourceUrl: String(item.sourceUrl || ''),
    mediaUrl: String(item.mediaUrl || ''),
    filePath: path.resolve(filePath),
    folderPath: path.resolve(String(item.folderPath || path.dirname(filePath))),
    coverPath: item.coverPath ? path.resolve(String(item.coverPath)) : null,
    fileSize: Math.max(0, Number(item.fileSize || 0)),
    resolution: String(item.resolution || ''),
    qualityLabel: String(item.qualityLabel || ''),
    formatId: String(item.formatId || ''),
    kind: String(item.kind || 'video'),
    mimeType: String(item.mimeType || ''),
    videoCodec: String(item.videoCodec || ''),
    audioCodec: String(item.audioCodec || ''),
    downloadedAt: String(item.downloadedAt || new Date().toISOString()),
    status: item.status === 'missing' ? 'missing' : 'available',
  };
}

function normalizeMediaLibrary(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return emptyLibrary();
  return {
    schemaVersion: MEDIA_LIBRARY_SCHEMA_VERSION,
    updatedAt: typeof value.updatedAt === 'string' ? value.updatedAt : null,
    items: (Array.isArray(value.items) ? value.items : []).map(normalizeLibraryItem).filter(Boolean),
  };
}

function createMediaLibraryStore(filePath) {
  const resolvedFilePath = path.resolve(filePath);
  let cached = null;
  let operationChain = Promise.resolve();

  async function load() {
    if (cached) return cached;
    try {
      cached = normalizeMediaLibrary(JSON.parse(await fs.readFile(resolvedFilePath, 'utf8')));
    } catch (error) {
      if (error?.code !== 'ENOENT') {
        const backup = `${resolvedFilePath}.corrupt-${Date.now()}`;
        await fs.rename(resolvedFilePath, backup).catch(() => {});
      }
      cached = emptyLibrary();
    }
    return cached;
  }

  async function save(document) {
    const normalized = normalizeMediaLibrary(document);
    normalized.updatedAt = new Date().toISOString();
    await fs.mkdir(path.dirname(resolvedFilePath), { recursive: true });
    const temporaryPath = `${resolvedFilePath}.tmp`;
    await fs.writeFile(temporaryPath, `${JSON.stringify(normalized, null, 2)}\n`, { encoding: 'utf8', mode: 0o600 });
    await fs.rename(temporaryPath, resolvedFilePath);
    cached = normalized;
    return normalized;
  }

  function enqueue(operation) {
    const result = operationChain.then(operation, operation);
    operationChain = result.catch(() => undefined);
    return result;
  }

  async function addCompleted(item) {
    return enqueue(async () => {
      const normalized = normalizeLibraryItem(item);
      if (!normalized) return null;
      const fileStat = await fs.stat(normalized.filePath).catch(() => null);
      if (!fileStat?.isFile() || fileStat.size <= 0) return null;
      normalized.fileSize = fileStat.size;
      normalized.status = 'available';
      const document = await load();
      const existingIndex = normalized.sourceTaskId
        ? document.items.findIndex((entry) => entry.sourceTaskId === normalized.sourceTaskId)
        : -1;
      if (existingIndex >= 0) document.items[existingIndex] = { ...document.items[existingIndex], ...normalized };
      else document.items.unshift(normalized);
      await save(document);
      return { ...normalized };
    });
  }

  async function list(options = {}) {
    return enqueue(async () => {
      const document = await load();
      if (options.refresh === true) {
        let changed = false;
        for (const item of document.items) {
          const fileStat = await fs.stat(item.filePath).catch(() => null);
          const nextStatus = fileStat?.isFile() && fileStat.size > 0 ? 'available' : 'missing';
          if (nextStatus !== item.status || (fileStat?.size && fileStat.size !== item.fileSize)) changed = true;
          item.status = nextStatus;
          if (fileStat?.isFile()) item.fileSize = fileStat.size;
        }
        if (changed) await save(document);
      }
      return JSON.parse(JSON.stringify(document));
    });
  }

  return Object.freeze({ addCompleted, list, filePath: resolvedFilePath });
}

module.exports = {
  MEDIA_LIBRARY_SCHEMA_VERSION,
  classifiedOutputDirectory,
  createMediaLibraryStore,
  downloadMediaFileName,
  downloadTaskFolderName,
  localDateStamp,
  normalizeMediaLibrary,
  normalizeProviderId,
  providerFolderName,
  safePathSegment,
};
