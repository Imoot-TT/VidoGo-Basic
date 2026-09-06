const { contextBridge, ipcRenderer } = require('electron');

function bind(channel, callback) {
  const handler = (_event, payload) => callback(payload);
  ipcRenderer.on(channel, handler);
  return () => ipcRenderer.off(channel, handler);
}

contextBridge.exposeInMainWorld('mediaDeck', {
  getSystemLocale: () => ipcRenderer.invoke('app:get-system-locale'),
  getDefaultDownloadDir: () => ipcRenderer.invoke('app:get-default-download-dir'),
  getRuntimeInfo: () => ipcRenderer.invoke('app:get-runtime-info'),
  getLegacyInfo: () => ipcRenderer.invoke('app:get-legacy-info'),
  chooseDirectory: () => ipcRenderer.invoke('dialog:choose-directory'),
  chooseTextFile: () => ipcRenderer.invoke('dialog:choose-text-file'),
  getPlatforms: () => ipcRenderer.invoke('platforms:get'),
  savePlatforms: (configuration) => ipcRenderer.invoke('platforms:save', configuration),
  resetPlatforms: () => ipcRenderer.invoke('platforms:reset'),
  choosePlatformIcon: () => ipcRenderer.invoke('platforms:choose-icon'),
  openExternal: (url) => ipcRenderer.invoke('app:open-external', url),
  openPath: (targetPath) => ipcRenderer.invoke('app:open-path', targetPath),
  showItemInFolder: (targetPath) => ipcRenderer.invoke('app:show-item-in-folder', targetPath),
  openDownloadedFile: (item) => ipcRenderer.invoke('download:open-file', item),
  openDownloadedFolder: (item) => ipcRenderer.invoke('download:open-folder', item),
  minimizeWindow: () => ipcRenderer.invoke('window:minimize'),
  toggleMaximizeWindow: () => ipcRenderer.invoke('window:toggle-maximize'),
  closeWindow: () => ipcRenderer.invoke('window:close'),
  rendererReady: () => ipcRenderer.invoke('window:renderer-ready'),
  setTitleBarTheme: (theme) => ipcRenderer.invoke('theme:update-title-bar', theme),
  resetBrowserSession: () => ipcRenderer.invoke('session:reset-browser'),
  repairDailymotionPlayback: () => ipcRenderer.invoke('browser:repair-dailymotion-playback'),
  inspectBrowserFrames: (webContentsId) => ipcRenderer.invoke('browser:inspect-frames', webContentsId),
  getBlockedRequestDiagnostics: () => ipcRenderer.invoke('browser:get-blocked-request-diagnostics'),
  getDailymotionRequestDiagnostics: () => ipcRenderer.invoke('browser:get-dailymotion-request-diagnostics'),
  setPreferredLanguage: (locale) => ipcRenderer.invoke('browser:set-preferred-language', locale),
  setAdBlockerEnabled: (enabled) => ipcRenderer.invoke('browser:set-ad-blocker-enabled', enabled),
  getEntitlements: () => ipcRenderer.invoke('entitlements:get-state'),
  checkDownloadEntitlement: (payload) => ipcRenderer.invoke('entitlements:check-download', payload),
  configureEntitlements: (options) => ipcRenderer.invoke('entitlements:configure', options),
  configureRecording: (options) => ipcRenderer.invoke('recording:configure', options),
  checkForUpdates: () => ipcRenderer.invoke('app:check-for-updates'),
  getAccountServiceConfig: () => ipcRenderer.invoke('account:get-config'),
  registerAccount: (credentials) => ipcRenderer.invoke('account:register', credentials),
  loginAccount: (credentials) => ipcRenderer.invoke('account:login', credentials),
  getCurrentAccount: () => ipcRenderer.invoke('account:current'),
  logoutAccount: () => ipcRenderer.invoke('account:logout'),
  listAccountOrders: () => ipcRenderer.invoke('account:list-orders'),
  createAccountOrder: (productCode) => ipcRenderer.invoke('account:create-order', productCode),
  changeAccountPassword: (payload) => ipcRenderer.invoke('account:change-password', payload),
  getAccountCatalog: () => ipcRenderer.invoke('account:catalog'),
  getMediaCandidates: (webContentsId = null) => ipcRenderer.invoke('media:get-candidates', webContentsId),
  extractPageMedia: (request) => ipcRenderer.invoke('media:extract-page', request),
  resolvePageMedia: (request) => ipcRenderer.invoke('media:resolve-page', request),
  clearMediaCandidates: (webContentsId = null) => ipcRenderer.invoke('media:clear-candidates', webContentsId),
  startDownload: (payload) => ipcRenderer.invoke('download:start', payload),
  cancelDownload: () => ipcRenderer.invoke('download:cancel'),
  controlDownload: (payload) => ipcRenderer.invoke('download:control', payload),
  verifyDownloadedFile: (item) => ipcRenderer.invoke('download:verify-output', item),
  listMediaLibrary: () => ipcRenderer.invoke('library:list'),
  refreshMediaLibrary: () => ipcRenderer.invoke('library:refresh'),
  onOpenNewTab: (callback) => bind('browser:open-new-tab', callback),
  onBrowserNavigate: (callback) => bind('browser:navigate', callback),
  onMediaCandidate: (callback) => bind('browser:media-candidate', callback),
  onNativeDownloadRequest: (callback) => bind('browser:native-download-request', callback),
  onDownloadEvent: (callback) => bind('download:event', callback),
  onDownloadState: (callback) => bind('download:state', callback),
  onEntitlementsChanged: (callback) => bind('entitlements:changed', callback),
  onRecordingEvent: (callback) => bind('recording:event', callback),
});

contextBridge.exposeInMainWorld('mediaDeckSmokeExpectedBackend', process.env.ELECTRON_SMOKE_EXPECT_BACKEND || '');
contextBridge.exposeInMainWorld('mediaDeckSmokeVisualAudit', process.env.ELECTRON_SMOKE_VISUAL_AUDIT === '1');
contextBridge.exposeInMainWorld('mediaDeckSmokeBrowserUrl', process.env.ELECTRON_SMOKE_BROWSER_URL || '');
contextBridge.exposeInMainWorld('mediaDeckSmokeDownload', {
  real: process.env.ELECTRON_SMOKE_REAL_DOWNLOADS === '1',
  urls: (() => {
    try {
      const value = JSON.parse(process.env.ELECTRON_SMOKE_DOWNLOAD_URLS || '[]');
      return Array.isArray(value) ? value : [];
    } catch {
      return [];
    }
  })(),
  outputDir: process.env.ELECTRON_SMOKE_DOWNLOAD_OUTPUT_DIR || '',
  thumbnailUrl: process.env.ELECTRON_SMOKE_DOWNLOAD_THUMBNAIL_URL || '',
  slowUrl: process.env.ELECTRON_SMOKE_DOWNLOAD_SLOW_URL || '',
  pauseResume: process.env.ELECTRON_SMOKE_PAUSE_RESUME === '1',
});
