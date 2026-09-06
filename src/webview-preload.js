const { ipcRenderer } = require('electron');
const { installRecorderToolbar } = require('./recorder-toolbar');

function installChromeIdentityHints() {
  const original = navigator.userAgentData;
  const fullVersion = navigator.userAgent.match(/Chrome\/([\d.]+)/i)?.[1] || '';
  const major = fullVersion.split('.')[0];
  if (!original || !major) return;
  const brands = [
    { brand: 'Not_A Brand', version: '99' },
    { brand: 'Google Chrome', version: major },
    { brand: 'Chromium', version: major },
  ];
  const fullVersionList = [
    { brand: 'Not_A Brand', version: '99.0.0.0' },
    { brand: 'Google Chrome', version: fullVersion },
    { brand: 'Chromium', version: fullVersion },
  ];
  const getHighEntropyValues = original.getHighEntropyValues?.bind(original);
  const compatible = {
    brands,
    mobile: original.mobile,
    platform: original.platform,
    toJSON: () => ({ brands, mobile: original.mobile, platform: original.platform }),
    getHighEntropyValues: async (hints = []) => {
      const value = getHighEntropyValues ? await getHighEntropyValues(hints) : {};
      return { ...value, brands, fullVersionList, uaFullVersion: fullVersion };
    },
  };
  try {
    Object.defineProperty(navigator, 'userAgentData', { configurable: true, get: () => compatible });
  } catch {
    // Some Chromium builds expose a non-configurable descriptor; request
    // headers are still normalized by the browser session in that case.
  }
}

installChromeIdentityHints();

const COSMETIC_AD_CSS = `
iframe[src*="doubleclick.net" i],
iframe[src*="googlesyndication.com" i],
iframe[src*="googleadservices.com" i],
iframe[src*="taboola.com" i],
iframe[src*="outbrain.com" i],
iframe[src*="/ads/" i],
iframe[src*="/adserver/" i],
.adsbygoogle,
[id="ad" i],
[id^="ad-" i],
[id^="ad_" i],
[id$="-ad" i],
[id*="-ad-" i],
[id*="_ad_" i],
[class="ad" i],
[class^="ad-" i],
[class^="ad_" i],
[class*=" ad-" i],
[class*=" ad_" i],
[class*=" ads " i],
[class*=" advert" i],
[class*=" banner-ad" i],
[class*=" sponsored" i],
[data-ad],
[data-ad-client],
[data-ad-slot],
[aria-label="Advertisement" i],
[aria-label="Sponsored" i] {
  display: none !important;
  visibility: hidden !important;
  pointer-events: none !important;
}
`;

const VERIFICATION_LIGHT_CSS = `
:root { color-scheme: light !important; }
html, body { background: #ffffff !important; color: #1f2937 !important; }
#challenge-stage, #challenge-running, .main-content, .main-wrapper, main {
  color: #1f2937 !important;
  background-color: #ffffff !important;
}
`;

function updateVerificationPageTheme() {
  const copy = String(document.body?.innerText || '').replace(/\s+/g, ' ').slice(0, 4000);
  const challenge = /(?:正在进行安全验证|安全验证|verify you are human|performing security verification|checking your browser|just a moment)/i.test(copy)
    || Boolean(document.querySelector('#challenge-stage, #challenge-running, .cf-turnstile'));
  const existing = document.getElementById('__vidogo_verification_light_css');
  if (!challenge) {
    existing?.remove();
    return;
  }
  if (existing) return;
  const style = document.createElement('style');
  style.id = '__vidogo_verification_light_css';
  style.textContent = VERIFICATION_LIGHT_CSS;
  document.documentElement.appendChild(style);
}

function injectCosmeticAdCss() {
  if (document.getElementById('__vidogo_cosmetic_ad_css')) return;
  const style = document.createElement('style');
  style.id = '__vidogo_cosmetic_ad_css';
  style.textContent = COSMETIC_AD_CSS;
  document.documentElement.appendChild(style);
}

function removeCosmeticAdCss() {
  document.getElementById('__vidogo_cosmetic_ad_css')?.remove();
}

function pageRequiresAdvertising() {
  const host = location.hostname.toLowerCase();
  const allowsPageResources = (value) => value === 'dai.ly'
    || value === 'dailymotion.com' || value.endsWith('.dailymotion.com')
    || value === 'pixabay.com' || value.endsWith('.pixabay.com')
    || value === 'pexels.com' || value.endsWith('.pexels.com')
    || value === 'mixkit.co' || value.endsWith('.mixkit.co')
    || value === 'coverr.co' || value.endsWith('.coverr.co')
    || value === 'videvo.net' || value.endsWith('.videvo.net')
    || value === 'videezy.com' || value.endsWith('.videezy.com');
  if (allowsPageResources(host)) return true;
  try {
    const referrerHost = new URL(document.referrer).hostname.toLowerCase();
    return allowsPageResources(referrerHost);
  } catch {
    return false;
  }
}

function clickFirstVisible(selectors) {
  for (const selector of selectors) {
    for (const element of document.querySelectorAll(selector)) {
      const rect = element.getBoundingClientRect();
      const style = window.getComputedStyle(element);
      if (rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.display !== 'none') {
        element.click();
        return true;
      }
    }
  }
  return false;
}

function installYouTubeAdHelper() {
  if (!location.hostname.includes('youtube.com')) return;
  const existing = window.__vidogoYouTubeAdHelper;
  if (existing && typeof existing.stop === 'function') existing.stop();
  const state = {
    observer: null,
    restoreMuted: null,
    restorePlaybackRate: null,
    restoreVolume: null,
    timer: null,
  };
  const skipSelectors = [
    '.ytp-ad-skip-button',
    '.ytp-ad-skip-button-modern',
    '.ytp-skip-ad-button',
    'button.ytp-ad-skip-button',
    'button.ytp-ad-skip-button-modern',
  ];
  const closeSelectors = [
    '.ytp-ad-overlay-close-button',
    '.ytp-ad-image-overlay-close-button',
    '.ytp-ad-text-overlay-close-button',
    '.ytp-ad-survey-questions__close-btn',
    'button[aria-label="Close"]',
    'button[aria-label="Dismiss"]',
  ];

  const getPlayer = () => document.querySelector('.html5-video-player');
  const getVideo = () => document.querySelector('video');
  const isAdShowing = () => {
    const player = getPlayer();
    return Boolean(player && (
      player.classList.contains('ad-showing')
      || player.classList.contains('ad-interrupting')
      || player.querySelector('.ytp-ad-player-overlay')
      || player.querySelector('.video-ads .ytp-ad-module')
    ));
  };
  const rememberVideoState = (video) => {
    if (state.restoreMuted !== null) return;
    state.restoreMuted = video.muted;
    state.restoreVolume = video.volume;
    state.restorePlaybackRate = video.playbackRate;
  };
  const restoreVideoState = (video) => {
    if (state.restoreMuted === null) return;
    video.muted = state.restoreMuted;
    if (typeof state.restoreVolume === 'number') video.volume = state.restoreVolume;
    if (typeof state.restorePlaybackRate === 'number' && video.playbackRate > 4) {
      video.playbackRate = state.restorePlaybackRate;
    }
    state.restoreMuted = null;
    state.restoreVolume = null;
    state.restorePlaybackRate = null;
  };
  const jumpToAdEnd = (video) => {
    if (!Number.isFinite(video.duration) || video.duration <= 0) return;
    if (video.currentTime >= video.duration - 0.2) return;
    video.currentTime = Math.max(video.duration - 0.15, 0);
  };
  const tick = () => {
    clickFirstVisible(closeSelectors);
    const video = getVideo();
    if (!video) return;
    if (!isAdShowing()) {
      restoreVideoState(video);
      return;
    }
    // Do not seek or accelerate YouTube's empty bootstrap video. On some
    // machines the ad classes appear before a playable ad source is attached;
    // touching that placeholder can leave the real player permanently black.
    if (video.readyState < 2 || video.videoWidth <= 0 || video.videoHeight <= 0) {
      restoreVideoState(video);
      clickFirstVisible(skipSelectors);
      return;
    }
    rememberVideoState(video);
    video.muted = true;
    video.playbackRate = Math.max(video.playbackRate, 16);
    clickFirstVisible(skipSelectors);
    jumpToAdEnd(video);
    if (video.paused) void video.play().catch(() => undefined);
  };

  state.timer = window.setInterval(tick, 250);
  state.observer = new MutationObserver(tick);
  state.observer.observe(document.documentElement, {
    attributes: true,
    childList: true,
    subtree: true,
  });
  window.__vidogoYouTubeAdHelper = {
    stop() {
      window.clearInterval(state.timer);
      state.observer.disconnect();
      const video = getVideo();
      if (video) restoreVideoState(video);
      delete window.__vidogoYouTubeAdHelper;
    },
  };
  tick();
}

function stopYouTubeAdHelper() {
  const helper = window.__vidogoYouTubeAdHelper;
  if (helper && typeof helper.stop === 'function') helper.stop();
}

function applyAdBlockerState(enabled) {
  const shouldFilter = enabled !== false && !pageRequiresAdvertising();
  if (shouldFilter && !location.hostname.includes('youtube.com')) injectCosmeticAdCss();
  else removeCosmeticAdCss();
  if (shouldFilter) installYouTubeAdHelper();
  else stopYouTubeAdHelper();
}

function visibleArea(rect) {
  const width = Math.max(0, Math.min(rect.right, window.innerWidth) - Math.max(rect.left, 0));
  const height = Math.max(0, Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0));
  return width * height;
}

function activeVideoElement() {
  const viewportCenter = window.innerHeight / 2;
  return Array.from(document.querySelectorAll('video')).map((video) => {
    const rect = video.getBoundingClientRect();
    const style = getComputedStyle(video);
    if (rect.width < 120 || rect.height < 120 || style.display === 'none' || style.visibility === 'hidden') return null;
    const area = visibleArea(rect);
    if (area <= 0) return null;
    const centerDistance = Math.abs((rect.top + rect.bottom) / 2 - viewportCenter);
    const playingBonus = !video.paused && !video.ended ? window.innerWidth * window.innerHeight * 2 : 0;
    return { video, score: playingBonus + area - centerDistance * 100 };
  }).filter(Boolean).sort((left, right) => right.score - left.score)[0]?.video || null;
}

function firstMediaUrl(value) {
  if (typeof value === 'string' && /^https?:/i.test(value)) return value;
  if (!value || typeof value !== 'object') return '';
  const values = [value.url, value.src, ...(value.urlList || []), ...(value.url_list || [])];
  return values.find((item) => typeof item === 'string' && /^https?:/i.test(item)) || '';
}

function tiktokReactItem(video, expectedDescription = '') {
  let rootFiber = null;
  for (let node = video; node && !rootFiber; node = node.parentElement) {
    const fiberKey = Object.keys(node).find((key) => key.startsWith('__reactFiber'));
    if (fiberKey) rootFiber = node[fiberKey];
  }
  if (!rootFiber) return null;
  const seen = new WeakSet();
  let visited = 0;
  const items = [];
  const itemIds = new Set();
  const scan = (value, depth) => {
    if (!value || typeof value !== 'object' || seen.has(value) || depth > 9 || visited >= 16000 || items.length >= 80) return;
    seen.add(value);
    visited += 1;
    const mediaId = String(value.id || value.itemId || value.item_id || value.awemeId || value.aweme_id || '');
    if (/^\d{12,}$/.test(mediaId) && value.video && typeof value.video === 'object') {
      if (!itemIds.has(mediaId)) {
        itemIds.add(mediaId);
        items.push(value);
      }
      return;
    }
    for (const key of Object.keys(value).slice(0, 140)) {
      if (/^(?:return|child|sibling|stateNode|_owner|ref)$/i.test(key)) continue;
      let next;
      try { next = value[key]; } catch { continue; }
      scan(next, depth + 1);
    }
  };
  for (let fiber = rootFiber, level = 0; fiber && level < 36 && items.length < 80; fiber = fiber.return, level += 1) {
    scan(fiber.memoizedProps, 0);
    scan(fiber.pendingProps, 0);
    scan(fiber.memoizedState, 0);
  }
  const expected = String(expectedDescription || '').replace(/\s+/g, ' ').trim().toLowerCase();
  const item = items.find((candidate) => {
    const title = String(candidate.desc || candidate.description || candidate.title || '').replace(/\s+/g, ' ').trim().toLowerCase();
    return expected && title && (expected.includes(title) || title.includes(expected));
  }) || items[0] || null;
  if (!item) return null;
  const mediaId = String(item.id || item.itemId || item.item_id || item.awemeId || item.aweme_id || '');
  const authorValue = item.author || item.authorInfo || item.author_info || {};
  const author = String(authorValue.uniqueId || authorValue.unique_id || authorValue.secUid || authorValue || '').replace(/^@/, '');
  return {
    mediaId,
    author,
    title: String(item.desc || item.description || item.title || '').replace(/\s+/g, ' ').trim(),
    thumbnailUrl: firstMediaUrl(item.video?.cover)
      || firstMediaUrl(item.video?.originCover)
      || firstMediaUrl(item.video?.dynamicCover)
      || firstMediaUrl(item.cover),
  };
}

function tiktokMediaResourceUrls() {
  const urls = [];
  for (const entry of performance.getEntriesByType?.('resource') || []) {
    try {
      const url = new URL(entry.name);
      const mediaHost = /(?:tiktokcdn|byteoversea|ibytedtos|bytevcdn|\.tiktok\.com)$/i.test(url.hostname);
      const mediaPath = /(?:mime_type=video_mp4|\/video\/tos\/|\.mp4(?:$|[?#]))/i.test(url.href);
      if (url.protocol === 'https:' && mediaHost && mediaPath && !urls.includes(url.href)) urls.push(url.href);
    } catch {
      // Ignore non-URL performance entries.
    }
  }
  return urls;
}

function tiktokVideoScope(video) {
  return video?.closest?.('[data-e2e="recommend-list-item-container"], [data-e2e="browse-video"], [data-e2e="feed-video"], article')
    || video?.parentElement?.parentElement
    || document;
}

function tiktokVideoContentKey(video) {
  const scope = tiktokVideoScope(video);
  const description = textFrom(scope, [
    '[data-e2e="browse-video-desc"]',
    '[data-e2e="video-desc"]',
    '[data-e2e="search-card-desc"]',
    'h1',
  ]);
  const author = textFrom(scope, [
    '[data-e2e="video-author-uniqueid"]',
    '[data-e2e="browse-username"]',
    '[data-e2e="video-author-nickname"]',
  ]);
  const thumbnail = visibleImageUrl(scope);
  const source = String(video?.currentSrc || video?.src || '').trim();
  return {
    scope,
    description,
    author,
    thumbnail,
    value: `${source}|${description}`,
    identity: `${source}|${author}|${description}|${thumbnail}`,
  };
}

function tiktokMediaUrlForVideo(targetVideo, targetContent = null) {
  const source = String(targetVideo?.currentSrc || targetVideo?.src || '').trim();
  if (/^https?:/i.test(source)) return source;
  if (!source) return '';
  const registry = window.__vidogoTikTokMediaRegistry || {
    mediaToUrl: Object.create(null),
    assignedUrls: Object.create(null),
    activeContentKey: '',
  };
  registry.mediaToUrl ||= Object.create(null);
  registry.assignedUrls ||= Object.create(null);
  window.__vidogoTikTokMediaRegistry = registry;
  const mediaUrls = tiktokMediaResourceUrls();
  const videos = Array.from(document.querySelectorAll('video'));
  const targetKey = targetContent?.value || tiktokVideoContentKey(targetVideo).value || source;
  const targetDescription = String(targetContent?.description || '').trim();
  const targetPreviousKey = String(targetVideo?.__vidogoTikTokContentKey || '');
  const targetSourceReused = Boolean(targetPreviousKey && targetPreviousKey !== targetKey && targetPreviousKey.startsWith(`${source}|`));
  const previousActiveSource = String(registry.activeContentKey || '').split('|')[0];
  const targetChanged = registry.activeContentKey !== targetKey;
  registry.activeContentKey = targetKey;
  for (const video of videos) {
    const blobUrl = String(video.currentSrc || video.src || '').trim();
    if (!blobUrl || /^https?:/i.test(blobUrl)) continue;
    const content = video === targetVideo && targetContent ? targetContent : tiktokVideoContentKey(video);
    const mediaKey = content.value || blobUrl;
    const previousVideoKey = String(video.__vidogoTikTokContentKey || '');
    const sourceReused = Boolean(previousVideoKey && previousVideoKey !== mediaKey && previousVideoKey.startsWith(`${blobUrl}|`));
    video.__vidogoTikTokContentKey = mediaKey;
    if (registry.mediaToUrl[mediaKey]) continue;
    const sameSourceUrl = !sourceReused && blobUrl !== previousActiveSource
      ? Object.entries(registry.mediaToUrl).find(([key]) => key.startsWith(`${blobUrl}|`))?.[1]
      : '';
    if (sameSourceUrl) {
      registry.mediaToUrl[mediaKey] = sameSourceUrl;
      continue;
    }
    const matchingContentUrl = String(content.description || '').trim()
      ? Object.entries(registry.mediaToUrl).find(([key]) => key.endsWith(`|${content.description}`))?.[1]
      : '';
    if (matchingContentUrl) {
      registry.mediaToUrl[mediaKey] = matchingContentUrl;
      continue;
    }
    const nextUrl = mediaUrls.find((url) => !registry.assignedUrls[url]);
    if (!nextUrl) continue;
    registry.mediaToUrl[mediaKey] = nextUrl;
    registry.assignedUrls[nextUrl] = true;
  }
  // TikTok virtualizes the feed and eventually reuses a single <video> node.
  // Once all preloaded URLs have been assigned, later wheel changes would
  // otherwise keep the first mapping forever. A newly active card should bind
  // to the newest media request observed for the reused player.
  if (targetChanged && !registry.mediaToUrl[targetKey] && mediaUrls.length) {
    const sameSourceUrl = !targetSourceReused && source !== previousActiveSource
      ? Object.entries(registry.mediaToUrl).find(([key]) => key.startsWith(`${source}|`))?.[1]
      : '';
    const matchingContentUrl = targetDescription
      ? Object.entries(registry.mediaToUrl).find(([key]) => key.endsWith(`|${targetDescription}`))?.[1]
      : '';
    registry.mediaToUrl[targetKey] = matchingContentUrl || sameSourceUrl || mediaUrls.at(-1);
    registry.assignedUrls[registry.mediaToUrl[targetKey]] = true;
  }
  return registry.mediaToUrl[targetKey] || '';
}

function visibleImageUrl(scope) {
  return Array.from(scope?.querySelectorAll?.('img') || []).map((image) => {
    const url = String(image.currentSrc || image.src || '').trim();
    if (!/^https?:/i.test(url)) return null;
    const rect = image.getBoundingClientRect();
    const area = visibleArea(rect);
    return area >= 10_000 ? { url, area } : null;
  }).filter(Boolean).sort((left, right) => right.area - left.area)[0]?.url || '';
}

function tiktokVideoLink(video, reactItem = null) {
  const directLocation = location.pathname.match(/^\/@[^/]+\/video\/\d+/i) ? location.href : null;
  if (directLocation) return directLocation;
  let scope = video;
  for (let depth = 0; scope && depth < 10; depth += 1, scope = scope.parentElement) {
    const link = scope.matches?.('a[href*="/video/"]') ? scope : scope.querySelector?.('a[href*="/video/"]');
    if (!link?.href || !/^\/@[^/]+\/video\/\d+/i.test(new URL(link.href, location.href).pathname)) continue;
    return link.href;
  }
  if (reactItem?.mediaId && reactItem.author) {
    return new URL(`/@${reactItem.author}/video/${reactItem.mediaId}`, location.origin).href;
  }
  return null;
}

function textFrom(scope, selectors) {
  for (const selector of selectors) {
    const value = scope?.querySelector?.(selector)?.textContent?.replace(/\s+/g, ' ').trim();
    if (value) return value;
  }
  return '';
}

function tiktokActiveMediaSnapshot() {
  const host = location.hostname.toLowerCase();
  if (host !== 'tiktok.com' && !host.endsWith('.tiktok.com')) return null;
  const video = activeVideoElement();
  if (!video) return null;
  const content = tiktokVideoContentKey(video);
  const foundReactItem = tiktokReactItem(video, content.description);
  const normalizedDomTitle = content.description.toLowerCase();
  const normalizedReactTitle = String(foundReactItem?.title || '').trim().toLowerCase();
  const reactItemMatches = !normalizedDomTitle || !normalizedReactTitle
    || normalizedDomTitle.includes(normalizedReactTitle)
    || normalizedReactTitle.includes(normalizedDomTitle);
  const reactItem = reactItemMatches ? foundReactItem : null;
  const isDirectVideoPage = /^\/@[^/]+\/video\/\d+/i.test(location.pathname);
  const reportedCanonicalUrl = isDirectVideoPage ? tiktokVideoLink(video, reactItem) : null;
  const videoUrl = String(video.currentSrc || video.src || '');
  const directUrl = tiktokMediaUrlForVideo(video, content);
  if (!reportedCanonicalUrl && !directUrl) return null;
  const hash = Array.from(content.identity || content.value || videoUrl || directUrl || (location.href + ':' + video.currentTime)).reduce(
    (value, character) => Math.imul(value ^ character.charCodeAt(0), 16777619) >>> 0,
    2166136261,
  ).toString(36);
  const canonicalUrl = reportedCanonicalUrl || location.href;
  const mediaId = reportedCanonicalUrl?.match(/\/video\/(\d+)/i)?.[1] || ('active-' + hash);
  const { scope, description, author, thumbnail } = content;
  const genericTitle = /^(?:tiktok(?:\s*[-|].*)?|sign up\s*\|\s*tiktok)$/i.test(document.title.trim());
  const title = description || reactItem?.title || (genericTitle ? '' : document.title.trim()) || (author ? `${author} · TikTok` : 'TikTok video');
  const poster = String(video.poster || '').trim();
  const metaThumbnail = document.querySelector('meta[property="og:image"]')?.content || '';
  const width = Number(video.videoWidth || 0);
  const height = Number(video.videoHeight || 0);
  const resolution = Math.min(width || height, height || width) || 0;
  return {
    provider: 'tiktok',
    mediaId,
    canonicalUrl,
    title,
    thumbnailUrl: (/^https?:/i.test(poster) ? poster : thumbnail) || reactItem?.thumbnailUrl
      || (/^https?:/i.test(metaThumbnail) ? metaThumbnail : ''),
    directUrl,
    width,
    height,
    resolution,
    qualityLabel: resolution ? `${resolution}p` : '',
    variants: directUrl ? [{
      url: directUrl,
      extension: 'mp4',
      mimeType: 'video/mp4',
      width,
      height,
      resolution,
      qualityLabel: resolution ? `${resolution}p` : '',
      sizeBytes: 0,
      hasAudio: true,
      hasVideo: true,
      isDrmProtected: false,
      sourceClient: 'tiktok-page',
    }] : [],
    playing: !video.paused && !video.ended,
  };
}

function nearbyMediaLink(video, pattern) {
  for (let scope = video; scope && scope !== document.documentElement; scope = scope.parentElement) {
    const links = [
      ...(scope.matches?.('a[href]') ? [scope] : []),
      ...Array.from(scope.querySelectorAll?.('a[href]') || []),
    ];
    const link = links.find((item) => {
      try { return pattern.test(new URL(item.href, location.href).pathname); } catch { return false; }
    });
    if (link?.href) return link.href;
  }
  return '';
}

function douyinActiveMediaSnapshot() {
  const host = location.hostname.toLowerCase();
  if (host !== 'douyin.com' && !host.endsWith('.douyin.com')) return null;
  const video = activeVideoElement();
  if (!video) return null;
  const modalId = new URLSearchParams(location.search).get('modal_id') || '';
  const directPage = location.pathname.match(/^\/video\/(\d+)/i)
    ? location.href
    : (/^\d{12,}$/.test(modalId) ? new URL(`/video/${modalId}`, location.origin).href : '');
  const nearby = nearbyMediaLink(video, /^\/video\/\d+/i);
  const canonicalUrl = directPage || nearby;
  const mediaId = canonicalUrl.match(/\/video\/(\d+)/i)?.[1] || '';
  if (!mediaId) return null;
  const scope = video.closest('[data-e2e], article, [class*="modal" i], [class*="player" i]') || video.parentElement?.parentElement || document;
  const title = textFrom(scope, [
    '[data-e2e="video-desc"]', '[class*="video-info" i]', '[class*="desc" i]', 'h1', 'h2',
  ]) || document.querySelector('meta[property="og:title"]')?.content || document.title || '抖音视频';
  const poster = String(video.poster || '').trim();
  const metaThumbnail = document.querySelector('meta[property="og:image"]')?.content || '';
  const directUrl = /^https?:/i.test(video.currentSrc || video.src || '') ? (video.currentSrc || video.src) : '';
  const width = Number(video.videoWidth || 0);
  const height = Number(video.videoHeight || 0);
  const resolution = Math.min(width || height, height || width) || 0;
  return {
    provider: 'douyin',
    mediaId,
    canonicalUrl,
    title: String(title).replace(/\s+/g, ' ').trim().slice(0, 300),
    thumbnailUrl: /^https?:/i.test(poster) ? poster : (/^https?:/i.test(metaThumbnail) ? metaThumbnail : visibleImageUrl(scope)),
    directUrl,
    width,
    height,
    resolution,
    qualityLabel: resolution ? `${resolution}p` : '',
    variants: directUrl ? [{
      url: directUrl,
      extension: 'mp4',
      mimeType: 'video/mp4',
      width,
      height,
      resolution,
      qualityLabel: resolution ? `${resolution}p` : '当前播放',
      sizeBytes: 0,
      hasAudio: true,
      hasVideo: true,
      isDrmProtected: false,
      sourceClient: 'douyin-page',
    }] : [],
    playing: !video.paused && !video.ended,
  };
}

function stockActiveMediaSnapshot() {
  const host = location.hostname.toLowerCase();
  const providers = [
    ['pixabay', /(^|\.)pixabay\.com$/], ['pexels', /(^|\.)pexels\.com$/],
    ['mixkit', /(^|\.)mixkit\.co$/], ['coverr', /(^|\.)coverr\.co$/],
    ['videvo', /(^|\.)videvo\.net$/], ['videezy', /(^|\.)videezy\.com$/],
  ];
  const provider = providers.find(([, pattern]) => pattern.test(host))?.[0] || '';
  if (!provider) return null;
  const video = activeVideoElement();
  const metaTitle = document.querySelector('meta[property="og:title"]')?.content || document.title || `${provider} video`;
  const metaThumbnail = document.querySelector('meta[property="og:image"]')?.content || '';
  const poster = String(video?.poster || '').trim();
  const variants = [];
  const seen = new Set();
  for (const element of document.querySelectorAll('a[href], [data-url], [data-download-url], [data-src]')) {
    const raw = element.href || element.dataset?.downloadUrl || element.dataset?.url || element.dataset?.src || '';
    let href;
    try { href = new URL(raw, location.href); } catch { continue; }
    if (href.protocol !== 'https:' || seen.has(href.href)) continue;
    const copy = String(element.textContent || element.getAttribute('aria-label') || element.getAttribute('title') || '').replace(/\s+/g, ' ').trim();
    if (!/\.mp4(?:$|[?#])/i.test(href.href) && !/download/i.test(`${href.pathname} ${copy}`)) continue;
    seen.add(href.href);
    const dimensions = copy.match(/(\d{3,5})\s*[×x]\s*(\d{3,5})/i);
    const width = Number(dimensions?.[1] || 0);
    const height = Number(dimensions?.[2] || 0);
    variants.push({
      url: href.href,
      width,
      height,
      resolution: Math.min(width, height) || 0,
      qualityLabel: dimensions ? `${width}×${height}` : copy.slice(0, 80),
      sizeBytes: 0,
    });
    if (variants.length >= 12) break;
  }
  const playingUrl = String(video?.currentSrc || video?.src || '').trim();
  if (/^https:\/\//i.test(playingUrl) && !seen.has(playingUrl)) {
    variants.unshift({
      url: playingUrl,
      width: Number(video?.videoWidth || 0),
      height: Number(video?.videoHeight || 0),
      resolution: Math.min(Number(video?.videoWidth || 0), Number(video?.videoHeight || 0)) || 0,
      qualityLabel: video?.videoHeight ? `${video.videoHeight}p` : '',
      sizeBytes: 0,
    });
  }
  if (!video && !variants.length) return null;
  return {
    provider,
    mediaId: location.pathname,
    canonicalUrl: location.href,
    title: String(metaTitle).replace(/\s+/g, ' ').trim().slice(0, 300),
    thumbnailUrl: /^https?:/i.test(poster) ? poster : (/^https?:/i.test(metaThumbnail) ? metaThumbnail : ''),
    directUrl: variants[0]?.url || '',
    width: Number(video?.videoWidth || 0),
    height: Number(video?.videoHeight || 0),
    resolution: Math.min(Number(video?.videoWidth || 0), Number(video?.videoHeight || 0)) || 0,
    variants,
  };
}

function collectionMediaSnapshot() {
  const host = location.hostname.toLowerCase();
  let provider = '';
  let patterns = [];
  let collectionPage = false;
  if (host === 'tiktok.com' || host.endsWith('.tiktok.com')) {
    provider = 'tiktok';
    collectionPage = /^\/@[^/]+\/?$/i.test(location.pathname);
    patterns = [/^\/@[^/]+\/video\/\d+/i];
  } else if (host === 'douyin.com' || host.endsWith('.douyin.com')) {
    provider = 'douyin';
    collectionPage = /^\/(?:user|channel)\//i.test(location.pathname);
    patterns = [/^\/video\/\d+/i];
  } else if (host === 'agedm.io' || host.endsWith('.agedm.io')) {
    provider = 'agedm';
    collectionPage = true;
    patterns = [/\/(?:play|episode)\//i, /[?&](?:ep|episode)=\d+/i];
  }
  if (!collectionPage) return null;
  const seen = new Set();
  const entries = [];
  const anchorRoot = provider === 'agedm'
    ? (document.querySelector('.tab-pane.show.active') || document.querySelector('.video_detail_episode') || document)
    : document;
  const pageThumbnail = document.querySelector('meta[property="og:image"]')?.content || '';
  for (const anchor of anchorRoot.querySelectorAll('a[href]')) {
    let href;
    try { href = new URL(anchor.href, location.href); } catch { continue; }
    if (href.origin !== location.origin || !patterns.some((pattern) => pattern.test(`${href.pathname}${href.search}`))) continue;
    href.hash = '';
    if (seen.has(href.href)) continue;
    seen.add(href.href);
    const image = anchor.querySelector('img') || anchor.closest('article, li, [class*="item" i]')?.querySelector('img');
    const thumbnailUrl = String(image?.currentSrc || image?.src || pageThumbnail || '').trim();
    const title = String(anchor.getAttribute('title') || image?.alt || anchor.textContent || '').replace(/\s+/g, ' ').trim();
    entries.push({
      id: `${provider}-${entries.length + 1}-${href.pathname.split('/').filter(Boolean).at(-1) || 'item'}`,
      provider,
      canonicalUrl: href.href,
      title: title.slice(0, 300) || `${provider} ${entries.length + 1}`,
      thumbnailUrl: /^https?:/i.test(thumbnailUrl) ? thumbnailUrl : '',
    });
    if (entries.length >= 50) break;
  }
  return entries.length >= 2 ? { provider, pageUrl: location.href, entries } : null;
}

function installActiveMediaReporter() {
  if (window.__vidogoActiveMediaReporter) return;
  let lastSignature = '';
  let timer = 0;
  const report = () => {
    timer = 0;
    updateVerificationPageTheme();
    const snapshot = tiktokActiveMediaSnapshot() || douyinActiveMediaSnapshot();
    const stockSnapshot = stockActiveMediaSnapshot();
    const collection = collectionMediaSnapshot();
    const signature = JSON.stringify([
      snapshot?.provider || '', snapshot?.mediaId || '', snapshot?.title || '', snapshot?.thumbnailUrl || '', snapshot?.directUrl || '', snapshot?.playing || false,
      collection?.provider || '', ...(collection?.entries || []).map((entry) => entry.canonicalUrl),
      stockSnapshot?.provider || '', stockSnapshot?.canonicalUrl || '', ...(stockSnapshot?.variants || []).map((entry) => entry.url),
    ]);
    if (signature === lastSignature) return;
    lastSignature = signature;
    if (snapshot) {
      ipcRenderer.sendToHost('vidogo:active-media', snapshot);
    } else {
      const provider = providerSiteName();
      // TikTok and Douyin rebuild their feed DOM between wheel changes. During
      // that short window there may be no visible player at all; clearing here
      // races with the next probe and makes a valid media row flash empty.
      // Navigation already resets the tab, so retain the row for these feeds.
      const shortVideoFeed = ['tiktok', 'douyin'].includes(provider);
      if (!shortVideoFeed) ipcRenderer.sendToHost('vidogo:active-media', { provider, cleared: true });
    }
    ipcRenderer.sendToHost('vidogo:media-collection', collection || { provider: providerSiteName(), entries: [] });
    ipcRenderer.sendToHost('vidogo:stock-media', stockSnapshot || { provider: providerSiteName(), cleared: true });
  };
  const schedule = () => {
    if (timer) return;
    timer = window.setTimeout(report, 180);
  };
  const observer = new MutationObserver(schedule);
  observer.observe(document.documentElement, { attributes: true, childList: true, subtree: true });
  document.addEventListener('play', schedule, true);
  document.addEventListener('pause', schedule, true);
  document.addEventListener('loadedmetadata', schedule, true);
  window.addEventListener('scroll', schedule, { passive: true });
  window.__vidogoActiveMediaReporter = {
    report: () => {
      lastSignature = '';
      report();
    },
  };
  schedule();
}

function providerSiteName() {
  const host = location.hostname.toLowerCase();
  if (host === 'tiktok.com' || host.endsWith('.tiktok.com')) return 'tiktok';
  if (host === 'douyin.com' || host.endsWith('.douyin.com')) return 'douyin';
  if (host === 'agedm.io' || host.endsWith('.agedm.io')) return 'agedm';
  if (host === 'pixabay.com' || host.endsWith('.pixabay.com')) return 'pixabay';
  if (host === 'pexels.com' || host.endsWith('.pexels.com')) return 'pexels';
  if (host === 'mixkit.co' || host.endsWith('.mixkit.co')) return 'mixkit';
  if (host === 'coverr.co' || host.endsWith('.coverr.co')) return 'coverr';
  if (host === 'videvo.net' || host.endsWith('.videvo.net')) return 'videvo';
  if (host === 'videezy.com' || host.endsWith('.videezy.com')) return 'videezy';
  if (host === 'wedistill.io' || host.endsWith('.wedistill.io')) return 'distill';
  if (host === 'mazwai.com' || host.endsWith('.mazwai.com')) return 'mazwai';
  if (host === 'lifeofvids.com' || host.endsWith('.lifeofvids.com')) return 'lifeofvids';
  if (host === 'dareful.com' || host.endsWith('.dareful.com')) return 'dareful';
  return '';
}

function installCompactScrollbarStyle() {
  if (document.getElementById('vidogo-compact-scrollbars')) return;
  const style = document.createElement('style');
  style.id = 'vidogo-compact-scrollbars';
  style.textContent = `
    * { scrollbar-width: thin; scrollbar-color: rgba(120, 132, 150, .56) transparent; }
    *::-webkit-scrollbar { width: 6px !important; height: 6px !important; }
    *::-webkit-scrollbar-track { background: transparent !important; }
    *::-webkit-scrollbar-thumb { border-radius: 999px !important; background: rgba(120, 132, 150, .56) !important; }
    *::-webkit-scrollbar-thumb:hover { background: rgba(100, 116, 139, .78) !important; }
    *::-webkit-scrollbar-corner { background: transparent !important; }
  `;
  (document.head || document.documentElement).appendChild(style);
}

function installSiteDownloadBridge() {
  if (window.__vidogoSiteDownloadBridge) return;
  const supported = new Set(['pixabay', 'pexels', 'mixkit', 'coverr', 'videvo', 'videezy', 'distill', 'mazwai', 'lifeofvids', 'dareful']);
  document.addEventListener('click', (event) => {
    const provider = providerSiteName();
    if (!supported.has(provider)) return;
    const control = event.target?.closest?.('a[href], button, [role="button"]');
    if (!control) return;
    const copy = String(control.textContent || control.getAttribute('aria-label') || control.getAttribute('title') || '').replace(/\s+/g, ' ').trim();
    if (!/download|下载/i.test(`${copy} ${control.className || ''} ${control.dataset?.action || ''}`)) return;
    const checked = document.querySelector('input[type="radio"]:checked, select option:checked');
    const holder = control.closest('[data-url], [data-download-url], [data-href]');
    const title = document.querySelector('meta[property="og:title"]')?.content || document.title || `${provider} video`;
    const selectedCopy = String(checked?.closest('label')?.textContent || checked?.textContent || copy).replace(/\s+/g, ' ').trim();
    const dimensions = selectedCopy.match(/(\d{3,5})\s*[×x]\s*(\d{3,5})/i);
    const qualityLabel = dimensions
      ? `${dimensions[1]}×${dimensions[2]}`
      : (selectedCopy.match(/\b(?:4k|2k|2160p|1440p|1080p|720p|576p|480p|full\s*hd|hd\s*ready)\b/i)?.[0] || '');
    const metadata = {
      provider,
      pageUrl: location.href,
      title: String(title).replace(/\s+/g, ' ').trim().slice(0, 300),
      thumbnailUrl: document.querySelector('meta[property="og:image"]')?.content || '',
      width: Number(dimensions?.[1] || 0),
      height: Number(dimensions?.[2] || 0),
      qualityLabel: String(qualityLabel).slice(0, 80),
    };
    const stockSnapshot = stockActiveMediaSnapshot();
    const selectedVariant = (stockSnapshot?.variants || []).find((variant) => (
      dimensions && Number(variant.width || 0) === Number(dimensions[1])
        && Number(variant.height || 0) === Number(dimensions[2])
    )) || (stockSnapshot?.variants || []).find((variant) => (
      qualityLabel && String(variant.qualityLabel || '').toLowerCase().includes(String(qualityLabel).toLowerCase())
    ));
    const rawCandidates = [
      control.href,
      control.dataset?.downloadUrl,
      control.dataset?.url,
      control.dataset?.href,
      holder?.dataset?.downloadUrl,
      holder?.dataset?.url,
      holder?.dataset?.href,
      checked?.dataset?.downloadUrl,
      checked?.dataset?.url,
      /^https?:\/\//i.test(String(checked?.value || '')) ? checked.value : '',
      selectedVariant?.url,
      stockSnapshot?.directUrl,
    ].filter(Boolean);
    const url = rawCandidates.map((raw) => {
      try { return new URL(raw, location.href); } catch { return null; }
    }).find((candidate) => candidate?.protocol === 'https:'
      && candidate.href !== location.href
      && (/\.(?:mp4|webm|mov)(?:$|[?#])/i.test(candidate.href)
        || /\b(?:download|attachment|dl)\b/i.test(`${candidate.pathname} ${candidate.search}`)));
    // Some sites create a signed URL only after their own click handler runs.
    // Let that path continue and capture Electron's will-download event instead
    // of turning a quality token such as "1080p" into a bogus page URL.
    if (!url) {
      ipcRenderer.sendToHost('vidogo:site-download-metadata', metadata);
      return;
    }
    event.preventDefault();
    event.stopImmediatePropagation();
    ipcRenderer.sendToHost('vidogo:site-download-intent', {
      ...metadata,
      url: url.href,
    });
  }, true);
  window.__vidogoSiteDownloadBridge = true;
}

const directDownloadControllers = new Map();
const directDownloadChunkDelayMs = Math.max(0, Math.min(500, Number(process.env.ELECTRON_SMOKE_DIRECT_CHUNK_DELAY_MS || 0)));
const directDownloadChunkTarget = directDownloadChunkDelayMs > 0 ? 64 * 1024 : 512 * 1024;

ipcRenderer.on('browser:start-direct-download', (_event, payload = {}) => {
  const jobId = String(payload.jobId || '').trim();
  const url = String(payload.url || '').trim();
  if (!jobId || !/^https?:\/\//i.test(url)) return;
  directDownloadControllers.get(jobId)?.abort();
  const controller = new AbortController();
  directDownloadControllers.set(jobId, controller);
  void (async () => {
    try {
      const response = await fetch(url, {
        credentials: 'include',
        headers: { Accept: '*/*', Range: 'bytes=0-' },
        signal: controller.signal,
      });
      const contentRange = String(response.headers.get('content-range') || '');
      const rangeTotal = Number(contentRange.match(/\/(\d+)$/)?.[1] || 0);
      const contentLength = Number(response.headers.get('content-length') || 0);
      const accepted = await ipcRenderer.invoke('browser:direct-download-event', {
        jobId,
        type: 'response',
        statusCode: response.status,
        totalBytes: rangeTotal || contentLength,
      });
      if (!accepted?.ok || !response.ok || !response.body) return;
      const reader = response.body.getReader();
      let pending = [];
      let pendingBytes = 0;
      const flush = async () => {
        if (!pendingBytes) return true;
        if (directDownloadChunkDelayMs > 0) {
          await new Promise((resolve) => setTimeout(resolve, directDownloadChunkDelayMs));
        }
        const chunk = Buffer.concat(pending, pendingBytes);
        pending = [];
        pendingBytes = 0;
        const result = await ipcRenderer.invoke('browser:direct-download-event', { jobId, type: 'chunk', chunk });
        return result?.ok === true;
      };
      while (!controller.signal.aborted) {
        const { done, value } = await reader.read();
        if (done) break;
        if (!value?.byteLength) continue;
        const chunk = Buffer.from(value.buffer, value.byteOffset, value.byteLength);
        pending.push(chunk);
        pendingBytes += chunk.length;
        if (pendingBytes >= directDownloadChunkTarget && !await flush()) return;
      }
      if (controller.signal.aborted || !await flush()) return;
      await ipcRenderer.invoke('browser:direct-download-event', { jobId, type: 'done' });
    } catch (error) {
      if (!controller.signal.aborted) {
        await ipcRenderer.invoke('browser:direct-download-event', {
          jobId,
          type: 'error',
          message: error?.message || String(error),
        }).catch(() => {});
      }
    } finally {
      if (directDownloadControllers.get(jobId) === controller) directDownloadControllers.delete(jobId);
    }
  })();
});

ipcRenderer.on('browser:cancel-direct-download', (_event, payload = {}) => {
  const jobId = String(payload.jobId || '').trim();
  directDownloadControllers.get(jobId)?.abort();
});

function boot() {
  installCompactScrollbarStyle();
  installRecorderToolbar();
  installActiveMediaReporter();
  installSiteDownloadBridge();
  void ipcRenderer.invoke('browser:get-ad-blocker-enabled')
    .then((enabled) => applyAdBlockerState(enabled))
    .catch(() => applyAdBlockerState(true));
}

ipcRenderer.on('browser:ad-blocker-changed', (_event, enabled) => applyAdBlockerState(enabled));

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}
