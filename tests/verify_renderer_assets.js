const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'src', 'renderer', 'index.html'), 'utf8');
const app = fs.readFileSync(path.join(root, 'src', 'renderer', 'app.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'src', 'renderer', 'style.css'), 'utf8');
const icons = fs.readFileSync(path.join(root, 'src', 'renderer', 'icons.js'), 'utf8');
const locales = fs.readFileSync(path.join(root, 'src', 'renderer', 'locales.js'), 'utf8');
const main = fs.readFileSync(path.join(root, 'src', 'main.js'), 'utf8');
const preload = fs.readFileSync(path.join(root, 'src', 'preload.js'), 'utf8');
const webviewPreload = fs.readFileSync(path.join(root, 'src', 'webview-preload.js'), 'utf8');
const recorder = fs.readFileSync(path.join(root, 'src', 'recorder-toolbar.js'), 'utf8');
const entitlements = fs.readFileSync(path.join(root, 'src', 'entitlements.js'), 'utf8');
const updateCheck = fs.readFileSync(path.join(root, 'src', 'update-check.js'), 'utf8');
const manifestRules = fs.readFileSync(path.join(root, 'src', 'manifest-rules.js'), 'utf8');
const downloaderCore = fs.readFileSync(path.join(root, 'backend', 'downloader_core.py'), 'utf8');
const packageJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const ids = new Set(Array.from(html.matchAll(/id="([^"]+)"/g), (match) => match[1]));
const refs = Array.from(app.matchAll(/getElementById\('([^']+)'\)/g), (match) => match[1]);
const missing = Array.from(new Set(refs.filter((id) => !ids.has(id))));
assert(missing.length === 0, `Missing DOM ids: ${missing.join(', ')}`);

const expectedAssets = [
  'chzzk.ico',
  'dailymotion.ico',
  'facebook.png',
  'instagram.png',
  'kick.png',
  'niconico.ico',
  'reddit.ico',
  'rumble.ico',
  'snapchat.ico',
  'sooplive.ico',
  'tiktok.ico',
  'twitch.ico',
  'vimeo.ico',
  'x.ico',
  'youtube.ico',
];
const assetDir = path.join(root, 'src', 'renderer', 'assets');
for (const asset of expectedAssets) {
  const stat = fs.statSync(path.join(assetDir, asset));
  assert(stat.size > 0, `Icon asset is empty: ${asset}`);
  assert(app.includes(`./assets/${asset}`), `Icon asset is not referenced: ${asset}`);
}
assert(fs.statSync(path.join(assetDir, 'vidogo-empty.png')).size > 0, 'Shared empty-state artwork is missing');
assert(app.includes('./assets/vidogo-empty.png'), 'Shared empty-state artwork is not wired into the renderer');
assert(!app.includes('downloads-empty-icon') && !app.includes('history-empty-icon') && !app.includes('favorites-empty-icon'), 'Menu empty states must use the shared artwork instead of tiny placeholder icons');
assert((app.match(/class="[^"]*menu-empty-state[^"]*"/g) || []).length === 3, 'Download, history, and favorites pages must share one aligned empty-state layout');
assert(!/menu-empty-state[^`]*<p>/.test(app), 'Main menu empty states must not render redundant empty-copy labels');

const requiredCopy = ['浏览器', '主页', '下载', '历史', '收藏', '一键下载 · 畅享精彩', '搜索或输入网址', '套餐购买'];
for (const copy of requiredCopy) {
  assert(html.includes(copy) || app.includes(copy), `Required Chinese copy missing: ${copy}`);
}

const mojibakeMarkers = ['鈥', '脳', '鉁', '鎼', '璐', '鏃', '瑙', '绮'];
const combined = `${html}\n${app}\n${locales}`;
const badMarkers = mojibakeMarkers.filter((marker) => combined.includes(marker));
assert(badMarkers.length === 0, `Mojibake markers found: ${badMarkers.join(', ')}`);

const referenceIcons = [
  'monitor', 'download', 'clock', 'star', 'shopping-cart', 'user', 'setting',
  'house', 'plus', 'close', 'arrow-left', 'arrow-right', 'refresh',
  'search', 'scale-to-original', 'delete', 'timer', 'view', 'folder-opened', 'minus',
  'circle-check', 'circle-close', 'switch-button', 'user-filled',
];
for (const icon of referenceIcons) {
  assert(icons.includes(`'${icon}':`) || icons.includes(`    ${icon}:`), `Reference icon definition missing: ${icon}`);
}

const iconContext = { window: {}, queueMicrotask: () => {} };
vm.runInNewContext(icons, iconContext, { filename: 'icons.js', timeout: 1_000 });
const settingsIconMarkup = iconContext.window.VidoGoIcons.svg('setting');
assert(settingsIconMarkup.includes('viewBox="0 0 24 24"'), 'Settings icon must use the compact Windows-compatible SVG');
assert(settingsIconMarkup.includes('stroke="currentColor"') && settingsIconMarkup.includes('<circle'), 'Settings icon must render as a stroked gear');

const officialIconDir = path.join(root, 'assets', 'app-icons');
const officialIconFiles = [
  'video_downloader_icon_16x16.png',
  'video_downloader_icon_24x24.png',
  'video_downloader_icon_32x32.png',
  'video_downloader_icon_48x48.png',
  'video_downloader_icon_64x64.png',
  'video_downloader_icon_128x128.png',
  'video_downloader_icon_256x256.png',
  'video_downloader_icon_512x512.png',
  'video_downloader_icon_1024x1024.png',
  'video_downloader_icon.ico',
];
for (const asset of officialIconFiles) {
  assert(fs.statSync(path.join(officialIconDir, asset)).size > 0, `Official application icon is empty: ${asset}`);
}
const sameBinary = (left, right) => fs.readFileSync(left).equals(fs.readFileSync(right));
assert(sameBinary(path.join(officialIconDir, 'video_downloader_icon_16x16.png'), path.join(assetDir, 'vidogo-app-icon-16.png')), 'Compact title bar must use the official 16px VidoGo icon');
assert(sameBinary(path.join(officialIconDir, 'video_downloader_icon_32x32.png'), path.join(assetDir, 'vidogo-app-icon-32.png')), 'Account brand must use the official 32px VidoGo icon');
assert(sameBinary(path.join(officialIconDir, 'video_downloader_icon_256x256.png'), path.join(assetDir, 'vidogo-app-icon-256.png')), 'Runtime window must use the official 256px VidoGo icon');
assert(sameBinary(path.join(officialIconDir, 'video_downloader_icon_1024x1024.png'), path.join(root, 'assets', 'app-icon.png')), 'Packaged PNG icon must match the official icon set');
assert(sameBinary(path.join(officialIconDir, 'video_downloader_icon.ico'), path.join(root, 'assets', 'app-icon.ico')), 'Packaged ICO must match the official icon set');
assert(html.includes('src="./assets/vidogo-app-icon-16.png"') && html.includes('src="./assets/vidogo-app-icon-32.png"'), 'Official VidoGo images are not wired into the renderer');
assert(main.includes("nativeImage.createFromPath(path.join(__dirname, 'renderer', 'assets', 'vidogo-app-icon-256.png'))"), 'Electron runtime icon must load the official renderer asset');
assert(packageJson.build?.win?.icon === 'app-icon.ico', 'Windows packaging must use the official app-icon.ico');
assert(packageJson.scripts?.['pack:win']?.includes('--config.electronDist=node_modules/electron/dist'), 'Windows packaging must use the installed Electron distribution reliably');
assert(main.includes('roundedCorners: true'), 'Native supported window rounding must remain enabled');
assert(main.includes('const TITLE_BAR_HEIGHT = 32;') && css.includes('--titlebar: 32px;'), 'Native overlay and renderer title bar must share the compact 32px height');
assert(html.includes('src="./icons.js"'), 'Renderer icon system is not loaded');
assert(html.includes('src="./locales.js"'), 'Renderer locale system is not loaded');
assert(!html.includes('id="page-pin"'), 'Non-reference browser pin button must not be present');
assert(!html.includes('id="home-search-go"'), 'Home search must not have a separate non-reference button');
assert(!html.includes('id="popular-title"'), 'Home page must not render the removed Popular heading');
assert(!html.includes('aria-label="热门"'), 'Home page accessibility label must not retain the removed Popular wording');
assert(!html.includes('id="favorites-add-current"'), 'Favorites page must not have a non-reference add-current button');
assert(!html.includes('titlebar-actions'), 'Custom window controls must not replace the native title bar overlay');
assert(!html.includes('titlebar-mode') && !html.includes('VIDEO BROWSER') && !html.includes('>WORKSPACE<'), 'Title bar must not contain decorative pseudo-controls or unreadable microcopy');
assert(!html.includes('titlebar-context') && !html.includes('titlebar-divider'), 'Compact title bar must not duplicate the current page');
assert(!css.includes('.titlebar::after'), 'Title bar must not paint a partial-width decorative line over page headers');
assert(/\.titlebar\s*\{[^}]*border-bottom:\s*0/s.test(css), 'Native overlay must not clip a title-bar border before the right edge');
assert(/\.workspace\s*\{[^}]*border-top:\s*1px solid var\(--app-border\)/s.test(css), 'The full-width workspace must own the title-bar separator');

const localeContext = { window: {} };
vm.runInNewContext(locales, localeContext, { filename: 'locales.js', timeout: 1_000 });
const i18n = localeContext.window.VidoGoI18n;
const expectedLocales = ['zh-CN', 'zh-TW', 'en', 'ru', 'pt', 'vi', 'th', 'ar'];
assert(JSON.stringify(Array.from(i18n.localeOrder)) === JSON.stringify(expectedLocales), 'Reference locale order is incomplete');
const englishKeys = Object.keys(i18n.translations.en).sort();
assert(englishKeys.length >= 207, `Locale key coverage is too small: ${englishKeys.length}`);
for (const locale of expectedLocales) {
  const localeKeys = Object.keys(i18n.translations[locale]).sort();
  assert(JSON.stringify(localeKeys) === JSON.stringify(englishKeys), `Locale key coverage differs: ${locale}`);
  assert(localeKeys.every((key) => typeof i18n.translations[locale][key] === 'string' && i18n.translations[locale][key].length > 0), `Locale contains an empty value: ${locale}`);
  assert(html.includes(`value="${locale}"`), `Language option missing: ${locale}`);
}
assert(i18n.getDirection('ar') === 'rtl' && i18n.getDirection('en') === 'ltr', 'Locale direction mapping is incorrect');
assert(i18n.resolveSupportedLocale('zh-Hant-HK') === 'zh-TW', 'Traditional Chinese locale resolution failed');
assert(i18n.resolveSupportedLocale('pt-BR') === 'pt', 'Portuguese locale resolution failed');
assert(css.includes('html[dir="rtl"] .sidebar'), 'RTL sidebar layout rules are missing');
assert(/\.tab-strip\s*\{[^}]*flex:\s*0 1 auto/s.test(css), 'Tab strip must shrink to its VidBrowser content width');
assert(/\.tab-strip\s*\{[^}]*overflow-x:\s*auto/s.test(css), 'Overflowing browser tabs must remain horizontally reachable');
assert(/\.browser-tab\s*\{[^}]*width:\s*176px[^}]*min-width:\s*72px[^}]*max-width:\s*176px[^}]*flex:\s*0 1 176px/s.test(css), 'Browser tabs must shrink while retaining close controls');
assert(app.includes('reorderBrowserTab') && app.includes("setData('text/x-vidogo-tab'"), 'Browser tabs must support drag reordering');
assert(app.includes('scrollActiveTabIntoView'), 'The active browser tab must be scrolled into view');

for (const planCode of ['pro_month', 'pro_year', 'ultimate_month', 'ultimate_year', 'lifetime']) {
  assert(app.includes(`${planCode}:`), `Reference plan product missing: ${planCode}`);
}
for (const token of [
  "free: { dailyDownloadLimit: 5, maxConcurrentDownloads: 1, recordingMinutes: 5",
  "pro: { dailyDownloadLimit: 30, maxConcurrentDownloads: 5, recordingMinutes: 30",
  "ultimate: { dailyDownloadLimit: null, maxConcurrentDownloads: 10, recordingMinutes: null",
  "lifetime: { dailyDownloadLimit: null, maxConcurrentDownloads: 10, recordingMinutes: null",
  "{ key: 'dailyDownloadsRecording'",
  "{ key: 'prioritySupport'",
]) assert(app.includes(token), `Reference plan comparison token missing: ${token}`);
assert(html.includes('data-payment-channel="stripe"') && !html.includes('data-payment-channel="payssion"'), 'Desktop checkout must be delegated to the management platform provider');
assert(app.includes('window.mediaDeck.createAccountOrder(selected.code)'), 'Desktop purchases must create orders through the management platform');
assert(!app.includes('https://www.vidbrowser.net/?plan='), 'Desktop purchases must not use the reference website');
assert(html.includes('id="settings-concurrency" type="number" min="1" max="10"'), 'Concurrent download control must expose VidBrowser range 1–10');
assert(html.includes('id="settings-concurrency-limit"') && html.includes('id="settings-concurrency-plans"'), 'Concurrency control must explain plan limits and provide a working plans action');
assert(app.includes('els.settingsConcurrency.disabled = unlimitedConcurrency || concurrencyLimit <= 1'), 'Free-plan concurrency control must present an explicit locked state');
assert(app.includes("els.settingsConcurrencyPlans.addEventListener('click', () => setSection('plans'))"), 'Concurrency plan action must navigate to the plans page');
assert(main.includes('Math.min(10, concurrency)'), 'Main download queue must accept the VidBrowser 10-task limit');
assert(main.includes('width: 1360') && main.includes('height: 860') && main.includes('minWidth: 980') && main.includes('minHeight: 680'), 'Main window dimensions must match VidBrowser');
assert(main.includes("appendSwitch('disable-gpu-shader-disk-cache')") && main.includes("appendSwitch('disable-accelerated-video-decode')"), 'Electron playback compatibility switches must match VidBrowser');
assert(/\.download-actions-cell \.el-button\s*\{[^}]*display:\s*inline-flex[^}]*align-items:\s*center[^}]*justify-content:\s*center/s.test(css), 'Download row action icons must use a centered flex layout');
assert(!html.includes('id="head-path"') && !app.includes('download-path-cell'), 'Download list must use the open-folder action instead of a redundant save-path column');

const recorderTokens = [
  '__vidogoRecorderToolbar',
  'captureStreamForVideo',
  'MediaRecorder.isTypeSupported',
  "recorder.start(1000)",
  "ipcRenderer.invoke('recording:append'",
  "ipcRenderer.invoke('recording:finish'",
  "button[data-role=\"record-all\"]",
  'PLAYBACK_RATES = [1, 2, 4]',
  'getAvailableQualityLevels',
  'setPlaybackQualityRange',
  'highest-quality-not-ready',
  'drm-protected',
];
for (const token of recorderTokens) assert(recorder.includes(token), `Recorder toolbar token missing: ${token}`);
assert(webviewPreload.includes("require('./recorder-toolbar')"), 'Recorder toolbar is not loaded in browser webviews');
assert(preload.includes('configureRecording') && preload.includes('onRecordingEvent'), 'Host recording bridge is incomplete');
for (const channel of ['recording:start', 'recording:append', 'recording:finish', 'recording:abort']) {
  assert(main.includes(`ipcMain.handle('${channel}'`), `Main recording IPC handler missing: ${channel}`);
}
assert(main.includes('activeDownloadJobs.size + activeRecordingSessions.size'), 'Recording does not share the configured concurrency limit');
assert(app.includes('handleRecordingEvent') && app.includes("source: 'recording'"), 'Recording tasks are not connected to the download list');
assert(html.includes('id="settings-recording-control" type="checkbox"'), 'Settings must expose the recording enable/disable switch');
assert(app.includes('recordingEnabled: false') && app.includes('enabled: state.settings.recordingEnabled === true'), 'Recording must be disabled by default and synchronized to the main process');
assert(main.includes("ipcMain.handle('recording:get-enabled'") && main.includes("throw new Error('recording-disabled')"), 'Main process must enforce the recording switch');
assert(recorder.includes("ipcRenderer.on('recording:enabled-changed'") && recorder.includes('if (!recordingEnabled) return hideToolbar()'), 'Webview recorder must react to the recording switch');
for (const token of [
  'dailyLimit: 5',
  'maxConcurrentDownloads: 1',
  'recordingDurationLimitMs: 5 * 60 * 1000',
  'dailyLimit: 30',
  'maxConcurrentDownloads: 5',
  'recordingDurationLimitMs: 30 * 60 * 1000',
  'maxConcurrentDownloads: 10',
  'owner: Object.freeze({ dailyLimit: null, maxConcurrentDownloads: null, recordingDurationLimitMs: null })',
  'consumeDailyEntitlement',
  'downloadEntitlementCharge',
]) assert(entitlements.includes(token), `Entitlement implementation token missing: ${token}`);
for (const token of [
  "ipcMain.handle('entitlements:get-state'",
  "ipcMain.handle('entitlements:configure'",
  'consumeCurrentDailyEntitlement',
  'recordingDurationLimitMs',
  'daily-entitlement-limit-reached',
]) assert(main.includes(token), `Main entitlement enforcement token missing: ${token}`);
assert(preload.includes('getEntitlements') && preload.includes('checkDownloadEntitlement') && preload.includes('configureEntitlements') && preload.includes('onEntitlementsChanged'), 'Entitlement renderer bridge is incomplete');
assert(main.includes("ipcMain.handle('entitlements:check-download'") && app.includes('ensureDownloadEntitlementAvailable(candidates.length)'), 'Batch resolution must be blocked by an authoritative entitlement preflight');
assert(main.includes('entitlements.remainingToday > 0 && (retryExisting || requested <= entitlements.remainingToday)') && !app.includes('if (options.retryExisting === true || requested === 0) return true'), 'A retry may avoid a second charge but must not bypass the zero-remaining preflight gate');
assert(app.indexOf('ensureDownloadEntitlementAvailable(candidates.length)') < app.indexOf('const queuedTasks = candidates.map'), 'Batch entitlement preflight must run before queue rows are mounted or resolved');
assert(app.indexOf('ensureDownloadEntitlementAvailable(activeUrls.length') < app.indexOf('const queuedRows = queueUrls(urls, downloadTarget)'), 'Single-download entitlement preflight must run before a queue row is mounted');
assert(html.includes('id="head-result"'), 'Downloads table must include the result-details column header');
assert(app.includes("resultDetails: '结果详情'") && app.includes('download-result-cell'), 'Downloads table must render localized failure details');
assert(css.includes('minmax(180px, 1.5fr)') && css.includes('text-overflow: ellipsis') && css.includes('white-space: nowrap'), 'Failure details column must use a compact single-line ellipsis');
assert(app.includes('browser-download-interrupted:') && app.includes('Chromium 将媒体下载标记为'), 'Browser download failures must expose factual Chromium diagnostics');
assert(app.includes('item.errorMessage = rawMessage') && app.includes('errorMessage: item.errorMessage'), 'Download errors must retain their raw cause until display formatting');
assert(app.includes('原始错误原因已丢失') && app.includes('retry it to capture an accurate diagnosis'), 'Legacy generic failures must not be presented as factual diagnoses');
assert(main.includes('browserDownloadInterruptionError') && main.includes('rememberBrowserDownloadNetworkError'), 'Main process must preserve browser network failure diagnostics');
assert(app.includes('retryExisting: downloadTarget?.isRetry === true'), 'Only an explicit retry may skip daily entitlement consumption');
assert(/retryRowId:\s*rowId,\s*isRetry:\s*true,/.test(app), 'Failed-task retry must explicitly preserve its entitlement exemption');
assert(app.includes('BATCH_RESOLVER_CONCURRENCY') && app.includes('Math.min(BATCH_RESOLVER_CONCURRENCY, queuedTasks.length)'), 'Batch episode resolution must use a bounded parallel worker pool');
assert(!app.includes('const resolverConcurrency = hasCollectionPages ? 1'), 'Collection-page resolution must not force the worker pool back to serial execution');
assert(main.includes('分集页面加载超时。') && main.includes('Promise.race(['), 'Background episode resolver must enforce a hard page-load timeout');
assert(recorder.includes('recording-duration-limit-reached') && recorder.includes('recordingDurationLimitMs'), 'Recorder duration entitlement is not enforced in the webview');
assert(!/<button[^>]+data-order-pay/.test(app) && !app.includes('continueLocalPayment'), 'Non-reference local payment confirmation control must not be present');
for (const token of ['parseVersion', 'compareVersions', 'deriveGitHubUpdateState', 'releaseDownloadUrl', 'safeHttpsUrl']) {
  assert(updateCheck.includes(token), `Update checker token missing: ${token}`);
}
assert(main.includes('api.github.com/repos/Imoot-TT/VidoGo-Basic/releases?per_page=30') && main.includes('RELEASE_CHANNEL') && main.includes('net.fetch'), 'Main update check is not connected to the Basic GitHub release channel');
assert(app.includes('handleUpdateCheck') && app.includes("text('updateAvailable'") && app.includes("text('openRelease'"), 'Settings update UI does not handle available releases');
for (const token of ['parseAttributeList', 'parseHlsPlaylist', 'buildHlsCandidate', 'drmSystemForKey', 'parseDashManifest', 'buildDashCandidate', 'dashDrmSystem', 'estimatedSizeBytes']) {
  assert(manifestRules.includes(token), `Manifest implementation token missing: ${token}`);
}
for (const token of ['browserSession.fetch', 'MAX_MANIFEST_BYTES', 'MANIFEST_FETCH_TIMEOUT_MS', 'inspectHlsCandidate', "metadataSource: 'hls-manifest'", 'inspectDashCandidate', "metadataSource: 'dash-manifest'"]) {
  assert(main.includes(token), `Main manifest integration token missing: ${token}`);
}
assert(app.includes('candidateMergeOutputFormat') && app.includes('candidateDownloadUrl'), 'Media download actions do not normalize HLS targets and merge containers');
assert(app.includes('resetTabMediaForNavigation') && app.includes('candidateMatchesTabPage'), 'Page navigation must clear stale media and reject candidates from the previous page');
assert(app.includes('filterCandidatesByResolution') && app.includes('selectedMinimumResolutionByTabId') && app.includes("text('allResolutions')"), 'Browser resolution control must filter candidates by minimum resolution');
assert(app.includes('downloadRequestKey') && main.includes('downloadRequestKey') && main.includes('existingByRequestKey'), 'Downloads must be keyed by URL and format so separate resolutions stay independent');
assert(app.includes("!/^\\[download\\]/i.test(message)") && downloaderCore.includes('"noprogress": True'), 'yt-dlp textual progress must not flood the notification area');
assert(main.includes("ipcMain.handle('download:open-file'") && main.includes('resolveDownloadedFile') && preload.includes('openDownloadedFile'), 'Completed downloads must resolve and open the final media file');
assert(main.includes("ipcMain.handle('download:open-folder'") && preload.includes('openDownloadedFolder'), 'Download folder action must open the task folder');
assert(downloaderCore.includes('"writethumbnail": True') && downloaderCore.includes('thumbnail_filename') && downloaderCore.includes('task_dir'), 'Each download task must retain its source cover beside the final media file');
assert(main.includes('classifiedOutputDirectory(outputRoot, provider)') && main.includes('downloadTaskFolderName') && main.includes('downloadMediaFileName'), 'New downloads must use platform classification and descriptive names');
assert(main.includes('mediaLibraryStore.addCompleted') && main.includes("ipcMain.handle('library:list'") && main.includes("ipcMain.handle('library:refresh'"), 'Completed downloads must be prepared for the future media library');
assert(preload.includes('listMediaLibrary') && preload.includes('refreshMediaLibrary'), 'The future media-library read bridge is incomplete');
assert(app.includes('provider: downloadTarget?.provider') && app.includes('mediaId: downloadTarget?.mediaId'), 'Download jobs must retain provider and media identity metadata');
assert(app.includes("downloadStrategy: 'record'") && app.includes('data-record-candidate') && app.includes("text('recordingRequired')"), 'Live media must render the recording-required action instead of a download button');
assert(css.includes('.sniffer-resource-recording'), 'Live recording-required action is missing its reference styling');
assert(app.includes('__VIDOGO_RUN_MANIFEST_FLOW_TEST'), 'HLS Electron flow regression test is not exposed');
assert(app.includes('__VIDOGO_RUN_DASH_FLOW_TEST'), 'DASH Electron flow regression test is not exposed');

const referenceStyleTokens = [
  '--app-bg',
  '--app-panel',
  '--app-accent',
  '#2563eb',
  '.sidebar-btn',
  '.browser-stage webview.browser-view',
  '.browser-stage webview.browser-view.is-active',
  '.browser-split.has-media-panel',
  '.browser-side[hidden]',
  '.download-badge',
  '.downloads-pagination',
  '.browser-home',
  '.browser-home-brand',
  '.browser-home-logo',
  '.logo-vid',
  '.logo-browser',
  '.home-address-input',
  '.address-input-shell',
  '.favorites-popover',
  '.popular-sites',
  '.platform-manage-button',
  '.platform-manage-arrow',
  '.popular-site-groups',
  '.popular-site-group',
  '.popular-site-list',
  '.popular-site-button',
  '.generic-media-panel',
  '.media-count',
  '.sniffer-resource-list',
  '.sniffer-resource-row',
  '.sniffer-resource-main',
  '.sniffer-resource-thumbnail',
  '.sniffer-resource-download-actions',
  '.sniffer-resource-download.has-variants',
  '.sniffer-resource-split-toggle',
  '.sniffer-resource-variants',
  '.sniffer-resource-variant',
  '.sniffer-resource-variant-download',
  '.site-card',
  '.plan-card',
];
for (const token of referenceStyleTokens) {
  assert(css.includes(token), `Style token missing: ${token}`);
}
assert(!css.includes('.sniffer-resource-variant-toggle'), 'Detached media variant toggle style must not return');
assert(css.includes('content: attr(data-tooltip)') && app.includes('button.dataset.tooltip = label'), 'Custom localized sidebar tooltips are missing');
assert(!css.includes('.sniffer-resource-copy'), 'Removed media copy-link style must not return');
assert(!app.includes('navigator.clipboard.writeText') && !app.includes("iconSvg('copy-document')"), 'Removed media copy-link controls must not return');
assert(css.includes('.favorite-site-icon.is-fallback'), 'Reference favorite/site icon fallback style is missing');
assert(!/\.favorite-site-icon\s*\{[^}]*background:\s*var\(--app-accent\)/s.test(css), 'Favorite/site icons must not use the accent color as their base background');

const requiredRuntimeTokens = [
  'download-badge',
  'data-section="browser"',
  'DOWNLOAD_PAGE_SIZE',
  'data-download-page="next"',
  'data-download-page="prev"',
  'getBrowserLayoutSnapshot',
  'viewHeight === secondLayout.stageHeight',
  'mediaPanelHeight',
  'Active webview should use VidBrowser CSS flow instead of inline sizing',
  'scheduleActiveWebviewResize',
  'candidatesByTabId',
  'home:quick-site:youtube',
  'popular-site-button',
  'sniffer-resource-row',
  'data-download-candidate',
  'extractPageMedia',
  'data-toggle-candidate-variants',
  'data-download-variant',
  'ytInitialPlayerResponse',
  'getPlayerResponse',
  'planYouTubeDomFormats',
  'mergeOutputFormat',
  'backendMode',
  'maxConcurrentDownloads',
  'downloadRowForEvent',
  'runBrowserYouTubeFlowTest',
  '__VIDOGO_RUN_BROWSER_YOUTUBE_FLOW_TEST',
  'runRecorderFlowTest',
  '__VIDOGO_RUN_RECORDER_FLOW_TEST',
  'browser:media-panel-close',
  'browser:media-panel-toggle-open',
  'browser:favorites-popover-open',
  'updateDownloadBadge',
];
for (const token of requiredRuntimeTokens) {
  assert(html.includes(token) || app.includes(token), `Runtime token missing: ${token}`);
}

console.log(JSON.stringify({
  domRefs: refs.length,
  iconAssets: expectedAssets.length,
  referenceIcons: referenceIcons.length,
  copyChecks: requiredCopy.length,
  styleTokens: referenceStyleTokens.length,
  runtimeTokens: requiredRuntimeTokens.length,
  recorderTokens: recorderTokens.length,
}));
