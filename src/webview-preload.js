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
  if (host === 'dai.ly' || host === 'dailymotion.com' || host.endsWith('.dailymotion.com')) return true;
  try {
    const referrerHost = new URL(document.referrer).hostname.toLowerCase();
    return referrerHost === 'dai.ly' || referrerHost === 'dailymotion.com' || referrerHost.endsWith('.dailymotion.com');
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

function tiktokReactItem(video) {
  const feed = video.closest('[data-e2e="feed-video"]');
  const fiberKey = feed ? Object.keys(feed).find((key) => key.startsWith('__reactFiber')) : null;
  let fiber = fiberKey ? feed[fiberKey] : null;
  for (let level = 0; fiber && level < 24; level += 1, fiber = fiber.return) {
    const props = fiber.memoizedProps || fiber.pendingProps;
    const item = props?.item || props?.value?.item;
    const mediaId = String(item?.id || item?.itemId || item?.aweme_id || '');
    if (!/^\d{12,}$/.test(mediaId)) continue;
    const author = String(item?.author?.uniqueId || item?.author?.unique_id || item?.author || '').replace(/^@/, '');
    return {
      mediaId,
      author,
      title: String(item?.desc || item?.description || item?.title || '').replace(/\s+/g, ' ').trim(),
      thumbnailUrl: firstMediaUrl(item?.video?.cover)
        || firstMediaUrl(item?.video?.originCover)
        || firstMediaUrl(item?.video?.dynamicCover)
        || firstMediaUrl(item?.cover),
    };
  }
  return null;
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
  const reactItem = tiktokReactItem(video);
  const canonicalUrl = tiktokVideoLink(video, reactItem);
  const mediaId = canonicalUrl?.match(/\/video\/(\d+)/i)?.[1] || null;
  if (!canonicalUrl || !mediaId) return null;
  const scope = video.closest('[data-e2e="recommend-list-item-container"], [data-e2e="browse-video"], article')
    || video.parentElement?.parentElement
    || document;
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
  const genericTitle = /^(?:tiktok(?:\s*[-|].*)?|sign up\s*\|\s*tiktok)$/i.test(document.title.trim());
  const title = reactItem?.title || description || (genericTitle ? '' : document.title.trim()) || (author ? `${author} · TikTok` : 'TikTok video');
  const poster = String(video.poster || '').trim();
  const metaThumbnail = document.querySelector('meta[property="og:image"]')?.content || '';
  return {
    provider: 'tiktok',
    mediaId,
    canonicalUrl,
    title,
    thumbnailUrl: reactItem?.thumbnailUrl || (/^https?:/i.test(poster) ? poster : (/^https?:/i.test(metaThumbnail) ? metaThumbnail : '')),
    playing: !video.paused && !video.ended,
  };
}

function installActiveMediaReporter() {
  if (window.__vidogoActiveMediaReporter) return;
  let lastSignature = '';
  let timer = 0;
  const report = () => {
    timer = 0;
    const snapshot = tiktokActiveMediaSnapshot();
    if (!snapshot) return;
    const signature = JSON.stringify([snapshot.mediaId, snapshot.title, snapshot.thumbnailUrl, snapshot.playing]);
    if (signature === lastSignature) return;
    lastSignature = signature;
    ipcRenderer.sendToHost('vidogo:active-media', snapshot);
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
  window.__vidogoActiveMediaReporter = { report: schedule };
  schedule();
}

function boot() {
  installRecorderToolbar();
  installActiveMediaReporter();
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
