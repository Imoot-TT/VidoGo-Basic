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
const editorIntegration = fs.readFileSync(path.join(root, 'src', 'editor-integration.js'), 'utf8');
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

const requiredCopy = ['浏览器', '主页', '下载', '素材库', '历史', '收藏', '一键下载 · 畅享精彩', '搜索或输入网址', '套餐购买'];
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
assert(html.includes('id="head-type"') && app.includes("document.getElementById('head-type').textContent = text('assetType')"), 'Downloads table must expose a localized asset-type column');
assert(app.includes('downloadAssetType') && app.includes('downloadAssetTitle') === false && app.includes("subtitle: { label: text('assetSubtitle')"), 'Download rows must infer and label video, MP3, image, and subtitle assets');
assert(app.includes("previewAudio: '试听 MP3'") && app.includes("openSubtitle: '打开字幕'"), 'Asset-aware download action labels are incomplete');
assert(app.includes("icon: 'video-play'") && app.includes("icon: 'document'"), 'MP3 and subtitle rows must use distinct open-action icons');
assert(main.includes("throw new Error('No URLs provided.')"), 'Main process must reject an empty download request');
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
assert(app.includes('renderCandidateQuickAssets(candidate, assets)') && app.includes('data-download-selected-subtitle'), 'Derived media assets must remain reachable above the long video-quality list');
assert(app.indexOf("renderCandidateQuickAssets(candidate, assets)") < app.indexOf("text('videoQuality')"), 'Quick MP3, cover, and subtitle actions must render before video quality rows');
assert(css.includes('.sniffer-resource-quick-grid') && css.includes('.sniffer-resource-subtitle-picker'), 'Compact quick-download and subtitle-picker styles are missing');
assert(app.includes('selectedSubtitleAssetKeysByCandidateId') && app.includes('data-asset-index'), 'Subtitle selection must survive candidate refreshes');
assert(app.includes("subtitleDetecting: '字幕检测中…'") && app.includes('subtitleDiscoveryPending: true') && css.includes('.sniffer-resource-subtitle-status'), 'YouTube subtitle discovery must expose a visible pending state');
assert(/select:not\(\[multiple\]\):focus-visible\s*\{[^}]*outline:\s*1px[^}]*box-shadow:\s*none/s.test(css), 'Select controls must use the restrained global focus treatment');
for (const token of ['xiaohongshuMediaSnapshot', 'xiaohongshuContentImages', "vidogo:xiaohongshu-media", "assetRole: 'gallery'"]) {
  assert(webviewPreload.includes(token) || app.includes(token), `Xiaohongshu image-note integration token missing: ${token}`);
}
assert(app.includes('data-download-all-images') && app.includes('startCandidateImageBatchDownload'), 'Xiaohongshu image posts must support all-image downloads');
assert(main.includes("ipcMain.handle('system:get-network-speed'") && preload.includes('getSystemNetworkSpeed') && app.includes('startSystemNetworkSpeedPolling'), 'System network-speed monitoring is incomplete');
assert(html.includes('网络速度') && !html.includes('当前下载总速度'), 'Browser status bar must describe total network speed rather than only download speed');
assert(app.includes('resetTabMediaForNavigation') && app.includes('candidateMatchesTabPage'), 'Page navigation must clear stale media and reject candidates from the previous page');
assert(app.includes('filterCandidatesByResolution') && app.includes('selectedMinimumResolutionByTabId') && app.includes("text('allResolutions')"), 'Browser resolution control must filter candidates by minimum resolution');
assert(app.includes('downloadRequestKey') && main.includes('downloadRequestKey') && main.includes('existingByRequestKey'), 'Downloads must be keyed by URL and format so separate resolutions stay independent');
assert(app.includes("!/^\\[download\\]/i.test(message)") && downloaderCore.includes('"noprogress": True'), 'yt-dlp textual progress must not flood the notification area');
assert(main.includes("ipcMain.handle('download:open-file'") && main.includes('resolveDownloadedFile') && preload.includes('openDownloadedFile'), 'Completed downloads must resolve and open the final media file');
assert(main.includes("ipcMain.handle('download:preview-file'") && main.includes('pathToFileURL') && preload.includes('previewDownloadedFile'), 'Built-in local media preview bridge is incomplete');
assert(main.includes("ipcMain.handle('editor:scan'") && main.includes("ipcMain.handle('editor:choose-executable'") && main.includes("ipcMain.handle('editor:import-files'") && preload.includes('scanEditors') && preload.includes('chooseEditorExecutable') && preload.includes('importManyIntoEditor'), 'Editing-app discovery, manual configuration, and project import bridge is incomplete');
assert(main.includes("ipcMain.handle('editor:import-file'") && editorIntegration.includes("importMode = 'import-dialog'") && editorIntegration.includes("importMode = 'open-file'") && editorIntegration.includes("importMode = 'open-media'") && editorIntegration.includes('DIALOG_IMPORT_SCRIPT') && editorIntegration.includes('Clipboard') && editorIntegration.includes('`-open-file=${mediaPath}`') && editorIntegration.includes("['/OPEN', mediaPath]"), 'Editor imports must use per-application adapters instead of one shared launch argument');
assert(app.includes('data-library-asset-action="import-editor"') && app.includes("libraryImportEditor: '导入 {editor}'"), 'Every media-library asset view must expose a dynamically named editor-import action');
assert(html.includes('id="settings-search-engine-control"') && html.includes('id="settings-editor-control"') && html.includes('data-settings-panel="preferences"') && !html.includes('data-settings-panel="editors"') && !html.includes('class="settings-header"'), 'Settings must restore search-engine selection, merge editor management into Preferences, and omit redundant panel titles');
assert(html.includes('id="media-preview-overlay"') && app.includes('showMediaPreview') && app.includes('closeMediaPreview'), 'Built-in video, audio, image, and subtitle preview UI is incomplete');
assert(css.includes('.media-preview-dialog[data-preview-type="audio"]') && css.includes('height: 250px'), 'Audio preview must use a compact layout instead of the video canvas');
assert(css.includes('.media-preview-dialog[data-preview-type="image"] .media-preview-body') && css.includes('overflow: hidden'), 'Image preview must contain portrait images without an internal scrollbar');
assert(app.includes('guardOverlayWheel') || app.includes('function guardOverlayWheel') || app.includes('function blockOverlayWheel') || app.includes('function containOverlayWheel'), 'Modal and drawer wheel events must not scroll the obscured page');
assert(main.includes("ipcMain.handle('download:open-folder'") && preload.includes('openDownloadedFolder'), 'Download folder action must open the task folder');
assert(downloaderCore.includes('"writethumbnail": settings.include_cover') && downloaderCore.includes('thumbnail_filename') && downloaderCore.includes('task_dir'), 'Each media project must retain one reusable source cover beside its assets');
assert(main.includes('classifiedOutputDirectory(outputRoot, provider)') && main.includes('downloadTaskFolderName') && main.includes('downloadMediaFileName'), 'New downloads must use platform classification and descriptive names');
assert(main.includes('mediaLibraryStore.addCompleted') && main.includes("ipcMain.handle('library:list'") && main.includes("ipcMain.handle('library:refresh'"), 'Completed downloads must be stored in the media library');
assert(main.includes("mainWindow.webContents.send('library:changed')") && preload.includes('onMediaLibraryChanged'), 'Completed downloads must refresh the visible media library automatically');
assert(preload.includes('listMediaLibrary') && preload.includes('refreshMediaLibrary'), 'The media-library read bridge is incomplete');
assert(html.includes('id="page-library"') && html.includes('data-section="library"'), 'The media library sidebar entry or page is missing');
for (const token of ['loadMediaLibrary', 'renderLibrary', 'filteredLibraryProjects', 'filteredLibraryAssets', 'renderLibraryDetail', 'data-library-project-action', 'data-library-project-import', 'data-library-asset-action']) {
  assert(app.includes(token), `Media library interaction is incomplete: ${token}`);
}
assert(app.includes('state.platformConfig.platforms') && app.includes('platform.enabled !== false'), 'Media-library platform filters must come from the managed Home platform catalog');
assert(css.includes('.media-preview-dialog[data-preview-type="video"] .media-preview-video') && css.includes('position: absolute') && css.includes('object-fit: contain'), 'Image and video previews must fit their fixed canvas without cropping');
for (const token of ['library-provider-filter', 'library-type-filter', 'library-time-filter', 'library-search', 'library-detail-overlay', '.library-project-card', '.library-asset-card']) {
  assert(html.includes(token) || css.includes(token), `Media library UI token is missing: ${token}`);
}
assert(html.includes('id="browser-login-button"') && html.includes('id="external-login-overlay"'), 'External YouTube login entry and modal are missing');
assert(!html.includes('class="library-header"') && !html.includes('id="library-subtitle"'), 'Media library must not repeat a title and explanatory subtitle above the toolbar');
assert(app.includes('openUrl(project.sourceUrl') && !app.includes('openExternal(project.sourceUrl'), 'Media library source links must open in the embedded browser');
assert(!app.includes('data-library-asset-action="system"'), 'Media library must not render a duplicate system-open action');
assert(app.includes('class="library-detail-meta-item') && app.includes('downloadAssetPresentation(asset.assetType).openLabel'), 'Media library compact metadata and type-specific open actions are missing');
assert(preload.includes('startExternalYouTubeLogin') && preload.includes('syncExternalBrowserLogin') && preload.includes('onExternalLoginRequest'), 'External browser login preload bridge is incomplete');
assert(main.includes("ipcMain.handle('browser:start-external-login'") && main.includes("ipcMain.handle('browser:sync-external-login'"), 'External browser login IPC handlers are missing');
assert(main.includes('startManagedExternalLogin') && main.includes('isGoogleLoginFromYouTube'), 'Embedded Google login is not redirected to an external Chrome/Edge login window');
assert(main.includes("'Network.getAllCookies'") && main.includes("'Browser.close'"), 'External login must sync through the local browser debugging channel without copying a locked cookie database');
assert(main.includes('cookie?.expirationDate ?? cookie?.expires'), 'Synchronized YouTube cookies must preserve the CDP expiry so login survives an app restart');
assert(packageJson.dependencies?.ws, 'External login WebSocket support must be packaged with the application');
assert(app.includes('syncExternalLogin') && app.includes("text('externalLoginSuccess'"), 'External login modal does not synchronize and refresh YouTube');
assert(css.includes('.external-login-overlay') && /\.external-login-overlay\s*\{[^}]*z-index:\s*2147483646/s.test(css), 'External login instructions must stay above browser content and other dialogs');
assert(/\.toast-region\s*\{[^}]*z-index:\s*2147483647/s.test(css), 'System notices must remain above every dialog');
assert(!main.includes('cookies.txt') && !main.includes('writeFileSync(COOKIE'), 'Browser login sync must not write a plaintext cookie file');
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
