'use strict';

function parseVersion(value) {
  const match = String(value || '').trim().match(/^v?(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?(?:\+[0-9A-Za-z.-]+)?$/);
  if (!match) return null;
  return {
    raw: `${match[1]}.${match[2]}.${match[3]}${match[4] ? `-${match[4]}` : ''}`,
    core: [Number(match[1]), Number(match[2]), Number(match[3])],
    prerelease: match[4] ? match[4].split('.') : [],
  };
}

function parseReleaseTag(value, channel = 'basic') {
  const escapedChannel = String(channel || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = String(value || '').trim().match(new RegExp(`^${escapedChannel}-v(.+)$`, 'i'));
  return match ? parseVersion(match[1]) : null;
}

function comparePrerelease(left, right) {
  if (!left.length && !right.length) return 0;
  if (!left.length) return 1;
  if (!right.length) return -1;
  const length = Math.max(left.length, right.length);
  for (let index = 0; index < length; index += 1) {
    if (left[index] === undefined) return -1;
    if (right[index] === undefined) return 1;
    if (left[index] === right[index]) continue;
    const leftNumeric = /^\d+$/.test(left[index]);
    const rightNumeric = /^\d+$/.test(right[index]);
    if (leftNumeric && rightNumeric) return Number(left[index]) > Number(right[index]) ? 1 : -1;
    if (leftNumeric !== rightNumeric) return leftNumeric ? -1 : 1;
    return left[index] > right[index] ? 1 : -1;
  }
  return 0;
}

function compareVersions(leftValue, rightValue) {
  const left = parseVersion(leftValue);
  const right = parseVersion(rightValue);
  if (!left || !right) return null;
  for (let index = 0; index < 3; index += 1) {
    if (left.core[index] !== right.core[index]) return left.core[index] > right.core[index] ? 1 : -1;
  }
  return comparePrerelease(left.prerelease, right.prerelease);
}

function safeHttpsUrl(value) {
  try {
    const url = new URL(String(value || ''));
    return url.protocol === 'https:' ? url.toString() : null;
  } catch {
    return null;
  }
}

function releaseDownloadUrl(release) {
  const assets = Array.isArray(release?.assets) ? release.assets : [];
  const preferred = assets.find((asset) => /^VidoGo-Basic-.*-Setup\.exe$/i.test(String(asset?.name || '')) && safeHttpsUrl(asset?.browser_download_url))
    || assets.find((asset) => /setup.*\.exe$/i.test(String(asset?.name || '')) && safeHttpsUrl(asset?.browser_download_url))
    || assets.find((asset) => /\.exe$/i.test(String(asset?.name || '')) && safeHttpsUrl(asset?.browser_download_url));
  return preferred ? safeHttpsUrl(preferred.browser_download_url) : null;
}

function latestChannelRelease(data, channel) {
  const releases = Array.isArray(data) ? data : [data];
  return releases
    .filter((release) => release && release.draft !== true && parseReleaseTag(release.tag_name, channel))
    .sort((left, right) => compareVersions(
      parseReleaseTag(right.tag_name, channel).raw,
      parseReleaseTag(left.tag_name, channel).raw,
    ))[0] || null;
}

function deriveGitHubUpdateState(currentVersion, response, checkedAt = new Date().toISOString(), channel = 'basic') {
  const current = parseVersion(currentVersion)?.raw || String(currentVersion || '0.0.0');
  const status = Number(response?.status) || 0;
  const release = latestChannelRelease(response?.data, channel);
  if (status === 404 || (status >= 200 && status < 300 && !release)) {
    return {
      ok: false,
      status: 'unpublished',
      available: false,
      currentVersion: current,
      latestVersion: null,
      releaseUrl: null,
      downloadUrl: null,
      publishedAt: null,
      checkedAt,
      source: 'github',
      message: 'No public GitHub release is available.',
    };
  }
  const latest = parseReleaseTag(release?.tag_name, channel);
  const comparison = latest ? compareVersions(latest.raw, current) : null;
  if (status < 200 || status >= 300 || !latest || comparison === null || release?.draft === true) {
    return {
      ok: false,
      status: status === 403 ? 'rate-limited' : 'failed',
      available: false,
      currentVersion: current,
      latestVersion: latest?.raw || null,
      releaseUrl: safeHttpsUrl(release?.html_url),
      downloadUrl: releaseDownloadUrl(release),
      publishedAt: typeof release?.published_at === 'string' ? release.published_at : null,
      checkedAt,
      source: 'github',
      message: status === 403 ? 'GitHub API rate limit reached.' : 'The GitHub release response is invalid.',
    };
  }
  return {
    ok: true,
    status: comparison > 0 ? 'available' : 'current',
    available: comparison > 0,
    currentVersion: current,
    latestVersion: latest.raw,
    releaseUrl: safeHttpsUrl(release.html_url),
    downloadUrl: releaseDownloadUrl(release),
    publishedAt: typeof release.published_at === 'string' ? release.published_at : null,
    checkedAt,
    source: 'github',
    message: null,
  };
}

module.exports = {
  compareVersions,
  deriveGitHubUpdateState,
  latestChannelRelease,
  parseVersion,
  parseReleaseTag,
  releaseDownloadUrl,
  safeHttpsUrl,
};
