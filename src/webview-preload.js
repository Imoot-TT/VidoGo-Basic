const { installRecorderToolbar } = require('./recorder-toolbar');

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

function boot() {
  // VidBrowser exempts YouTube pages from broad cosmetic selectors and only
  // runs its dedicated skipper there. Hiding YouTube's ad containers during
  // player bootstrap can leave the real video in a hidden, uninitialized state.
  if (!location.hostname.includes('youtube.com')) injectCosmeticAdCss();
  installYouTubeAdHelper();
  installRecorderToolbar();
}

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}
