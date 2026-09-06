const { app, BrowserWindow, dialog, ipcMain, nativeImage, net, session, shell, webContents } = require('electron');
const crypto = require('node:crypto');
const fsSync = require('fs');
const fs = require('fs/promises');
const path = require('path');
const { execFileSync, spawn } = require('child_process');
const {
  classifyMediaPage,
  isProviderMediaContext,
  isPlaylistResource,
  isSupportedMetadataPage,
  normalizePageUrl,
  providerSiteForUrl,
  shouldIgnoreRawMediaResource,
} = require('./media-rules');
const {
  buildDashCandidate,
  buildHlsCandidate,
  parseDashManifest,
  parseHlsPlaylist,
} = require('./manifest-rules');
const {
  clampConcurrency: clampPlanConcurrency,
  consumeDailyEntitlement: consumePlanDailyEntitlement,
  downloadEntitlementCharge,
  entitlementState,
  normalizeProfile: normalizeEntitlementProfile,
  normalizeStore: normalizeEntitlementStore,
} = require('./entitlements');
const { deriveGitHubUpdateState, safeHttpsUrl } = require('./update-check');
const {
  builtinOwnerSessionToken,
  builtinOwnerUser,
  isBuiltinOwnerEmail,
  isBuiltinOwnerSession,
  verifyBuiltinOwnerCredentials,
} = require('./builtin-account');

const APP_NAME = 'VidoGo Basic';
const RELEASE_CHANNEL = 'basic';
const APP_ID = 'com.vidogo.desktop';
const STORAGE_NAMESPACE = 'VidoGo Runtime';
const RUNTIME_PROFILE = 'basic-0.1.3';
const PARTITION_NAME = 'vidogo-basic-0.1.3';
const BROWSER_PARTITION = `persist:${PARTITION_NAME}`;
const BACKGROUND_DOWNLOAD_PARTITION = `${PARTITION_NAME}-background-downloads`;
const IS_SMOKE_TEST = process.env.ELECTRON_SMOKE_TEST === '1';
const USE_PERSISTENT_SMOKE_PROFILE = IS_SMOKE_TEST && process.env.ELECTRON_SMOKE_USE_PERSISTENT_PROFILE === '1';
const USE_SMOKE_ACCOUNT_MOCK = IS_SMOKE_TEST && process.env.ELECTRON_SMOKE_REAL_ACCOUNT_API !== '1';
const IS_REAL_DOWNLOAD_SMOKE = process.env.ELECTRON_SMOKE_REAL_DOWNLOADS === '1';
const USER_DATA_ROOT = path.join(app.getPath('appData'), STORAGE_NAMESPACE);
const USER_DATA_PATH = IS_SMOKE_TEST && !USE_PERSISTENT_SMOKE_PROFILE
  ? path.join(app.getPath('temp'), `${APP_NAME}-smoke-${process.pid}`)
  : path.join(USER_DATA_ROOT, RUNTIME_PROFILE);
const SESSION_DATA_PATH = path.join(USER_DATA_PATH, 'SessionData');
const PARTITIONS_PATH = path.join(USER_DATA_PATH, 'Partitions');
const ENTITLEMENT_STATE_PATH = path.join(USER_DATA_PATH, 'entitlements.json');
const ACCOUNT_SESSION_PATH = path.join(USER_DATA_PATH, 'account-session.json');
const PLATFORM_CONFIG_PATH = path.join(USER_DATA_PATH, 'platforms.json');
const ACCOUNT_API_ORIGIN = (() => {
  try {
    const configPath = app.isPackaged
      ? path.join(process.resourcesPath, 'config', 'account-service.json')
      : path.join(__dirname, '..', 'config', 'account-service.json');
    let configuredOrigin = '';
    try { configuredOrigin = JSON.parse(fsSync.readFileSync(configPath, 'utf8'))?.apiOrigin || ''; } catch { /* environment override may provide it */ }
    const value = new URL(process.env.VIDOGO_ACCOUNT_API_ORIGIN || configuredOrigin || 'http://127.0.0.1:8790');
    if (!['http:', 'https:'].includes(value.protocol)) return '';
    if (app.isPackaged && value.protocol !== 'https:') return '';
    return value.origin;
  } catch {
    return '';
  }
})();
const ACCEPT_LANGUAGE_BY_LOCALE = {
  'zh-CN': 'zh-CN,zh;q=0.9,en;q=0.8',
  'zh-TW': 'zh-TW,zh;q=0.9,en;q=0.8',
  en: 'en-US,en;q=0.9',
  ru: 'ru-RU,ru;q=0.9,en;q=0.8',
  pt: 'pt-BR,pt;q=0.9,en;q=0.8',
  vi: 'vi-VN,vi;q=0.9,en;q=0.8',
  th: 'th-TH,th;q=0.9,en;q=0.8',
  ar: 'ar,ar-SA;q=0.9,en;q=0.8',
};
const BLOCKED_HOST_PARTS = [
  'doubleclick.net',
  'googlesyndication.com',
  'googleadservices.com',
  'taboola.com',
  'outbrain.com',
  'scorecardresearch.com',
  'adnxs.com',
  'adsrvr.org',
  'criteo.com',
  'pubmatic.com',
  'rubiconproject.com',
];
const MEDIA_EXTENSIONS = new Set([
  '.mp4',
  '.m4v',
  '.webm',
  '.mkv',
  '.mov',
  '.avi',
  '.mp3',
  '.m4a',
  '.aac',
  '.ogg',
  '.wav',
  '.flac',
  '.m3u8',
  '.mpd',
]);
const MEDIA_MIME_PREFIXES = [
  'video/',
  'audio/',
  'application/vnd.apple.mpegurl',
  'application/x-mpegurl',
  'application/mpegurl',
  'application/dash+xml',
];

app.setPath('userData', USER_DATA_PATH);
app.setPath('sessionData', SESSION_DATA_PATH);

let mainWindow = null;
const activeDownloadJobs = new Map();
const queuedDownloadJobs = [];
const nativeDownloadPermits = new Map();
const programmaticBrowserDownloads = new Set();
const programmaticBrowserDownloadSources = new Map();
const programmaticMediaRequests = new Set();
const activeRecordingSessions = new Map();
let downloadConcurrencyLimit = 1;
let downloadJobCounter = 0;
let downloadCookieGroupCounter = 0;
let recordingSessionCounter = 0;
let recordingOutputDir = '';
let recordingEnabled = false;
let browserPopupWindows = new Set();
let browserPreferredLocale = 'zh-CN';
let browserAcceptLanguage = ACCEPT_LANGUAGE_BY_LOCALE[browserPreferredLocale];
let browserAdBlockerEnabled = true;
let browserChromeVersion = '';
let requestFeaturesRegistered = false;
const blockedRequestDiagnostics = [];
const dailymotionRequestDiagnostics = [];
const mediaCandidates = new Map();
const retainedMediaResolvers = new Map();
const manifestInspectionInFlight = new Map();
const metadataExtractionCache = new Map();
const metadataExtractionInFlight = new Map();
const METADATA_CACHE_TTL_MS = 5 * 60 * 1000;
const MAX_MANIFEST_BYTES = 2 * 1024 * 1024;
const MANIFEST_FETCH_TIMEOUT_MS = 12_000;
const TITLE_BAR_HEIGHT = 32;
const TITLE_BAR_THEMES = {
  light: { color: '#ffffff', symbolColor: '#303133' },
  dark: { color: '#070c17', symbolColor: '#edf6ff' },
};
const UPDATE_RELEASE_API_URL = process.env.VIDOGO_UPDATE_API_URL
  || 'https://api.github.com/repos/Imoot-TT/VidoGo-Basic/releases?per_page=30';
let metadataRequestCounter = 0;
let metadataGeneration = 0;
let currentEntitlementProfile = normalizeEntitlementProfile({});
let entitlementStore = loadEntitlementStore();
let accountSession = loadAccountSession();
const smokeAccounts = new Map();
let smokeOrders = [];

function bundledPlatformConfigPath() {
  return app.isPackaged
    ? path.join(process.resourcesPath, 'config', 'platforms.json')
    : path.join(__dirname, '..', 'config', 'platforms.json');
}

function normalizePlatformId(value, fallback = 'item') {
  const normalized = String(value || '').trim().toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);
  return normalized || fallback;
}

function normalizePlatformUrl(value) {
  const parsed = new URL(String(value || '').trim());
  if (!['http:', 'https:'].includes(parsed.protocol) || parsed.username || parsed.password) {
    throw new Error('平台地址必须是有效的 HTTP(S) 网址。');
  }
  parsed.hash = '';
  return parsed.href;
}

function normalizePlatformIcon(value) {
  const icon = String(value || '').trim();
  if (!icon) return '';
  if (/^\.\/assets\/[A-Za-z0-9_.-]+$/.test(icon)) return icon;
  if (/^https:\/\//i.test(icon) && icon.length <= 4096) return icon;
  if (/^data:image\/(?:png|jpeg|webp|gif);base64,[A-Za-z0-9+/=]+$/i.test(icon) && icon.length <= 1024 * 1024) return icon;
  return '';
}

function normalizePlatformConfiguration(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('平台配置格式无效。');
  const sourceCategories = Array.isArray(value.categories) ? value.categories.slice(0, 30) : [];
  const seenCategoryIds = new Set();
  const categories = sourceCategories.map((item, index) => {
    const id = normalizePlatformId(item?.id, `category-${index + 1}`);
    if (seenCategoryIds.has(id)) return null;
    seenCategoryIds.add(id);
    const sourceLabels = item?.labels && typeof item.labels === 'object' ? item.labels : {};
    const zhLabel = String(sourceLabels['zh-CN'] || item?.name || id).trim().slice(0, 30) || id;
    const enLabel = String(sourceLabels.en || zhLabel).trim().slice(0, 30) || zhLabel;
    return {
      id,
      labels: { ...sourceLabels, 'zh-CN': zhLabel, en: enLabel },
      enabled: item?.enabled !== false,
      builtIn: item?.builtIn === true,
    };
  }).filter(Boolean);
  if (!categories.length) throw new Error('平台配置至少需要一个分类。');

  const seenPlatformIds = new Set();
  const platforms = (Array.isArray(value.platforms) ? value.platforms.slice(0, 150) : []).map((item, index) => {
    const id = normalizePlatformId(item?.id, `platform-${index + 1}`);
    if (seenPlatformIds.has(id)) return null;
    seenPlatformIds.add(id);
    const name = String(item?.name || '').trim().slice(0, 60);
    if (!name || !seenCategoryIds.has(String(item?.categoryId || ''))) return null;
    let url;
    try { url = normalizePlatformUrl(item?.url); } catch { return null; }
    return {
      id,
      name,
      url,
      categoryId: String(item.categoryId),
      icon: normalizePlatformIcon(item.icon),
      enabled: item?.enabled !== false,
      builtIn: item?.builtIn === true,
    };
  }).filter(Boolean);
  return { schemaVersion: 1, categories, platforms };
}

function loadDefaultPlatformConfiguration() {
  return normalizePlatformConfiguration(JSON.parse(fsSync.readFileSync(bundledPlatformConfigPath(), 'utf8')));
}

async function loadPlatformConfiguration() {
  try {
    return normalizePlatformConfiguration(JSON.parse(await fs.readFile(PLATFORM_CONFIG_PATH, 'utf8')));
  } catch {
    const defaults = loadDefaultPlatformConfiguration();
    await fs.mkdir(path.dirname(PLATFORM_CONFIG_PATH), { recursive: true });
    await fs.writeFile(PLATFORM_CONFIG_PATH, `${JSON.stringify(defaults, null, 2)}\n`, { encoding: 'utf8', mode: 0o600 });
    return defaults;
  }
}

async function savePlatformConfiguration(value) {
  const normalized = normalizePlatformConfiguration(value);
  await fs.mkdir(path.dirname(PLATFORM_CONFIG_PATH), { recursive: true });
  const temporaryPath = `${PLATFORM_CONFIG_PATH}.tmp`;
  await fs.writeFile(temporaryPath, `${JSON.stringify(normalized, null, 2)}\n`, { encoding: 'utf8', mode: 0o600 });
  await fs.rename(temporaryPath, PLATFORM_CONFIG_PATH);
  return normalized;
}

function loadAccountSession() {
  try {
    const value = JSON.parse(fsSync.readFileSync(ACCOUNT_SESSION_PATH, 'utf8'));
    return typeof value?.accessToken === 'string' && value.accessToken ? { accessToken: value.accessToken } : {};
  } catch {
    return {};
  }
}

function saveAccountSession() {
  fsSync.mkdirSync(path.dirname(ACCOUNT_SESSION_PATH), { recursive: true });
  const temporaryPath = `${ACCOUNT_SESSION_PATH}.tmp`;
  fsSync.writeFileSync(temporaryPath, JSON.stringify(accountSession), { encoding: 'utf8', mode: 0o600 });
  fsSync.renameSync(temporaryPath, ACCOUNT_SESSION_PATH);
}

async function accountApiRequest(route, options = {}) {
  if (!ACCOUNT_API_ORIGIN) throw new Error('账户服务地址无效。');
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  let response;
  try {
    response = await net.fetch(`${ACCOUNT_API_ORIGIN}/api/v1${route}`, {
      method: options.method || 'GET',
      headers: {
        Accept: 'application/json',
        'X-VidoGo-Client': 'desktop',
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...(accountSession.accessToken ? { Authorization: `Bearer ${accountSession.accessToken}` } : {}),
        ...(options.headers || {}),
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
      signal: controller.signal,
    });
  } catch (error) {
    throw new Error(error?.name === 'AbortError' ? '账户服务连接超时。' : '暂时无法连接账户服务。');
  } finally {
    clearTimeout(timeout);
  }
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const error = new Error(payload?.error?.message || `账户服务请求失败 (${response.status})`);
    error.code = payload?.error?.code || 'ACCOUNT_API_ERROR';
    error.status = response.status;
    throw error;
  }
  return payload?.data || null;
}

function smokeUser(email) {
  const user = smokeAccounts.get(String(email || '').toLowerCase());
  return user ? { id: user.id, email: user.email, role: 'user', plan: user.plan, planExpiresAt: null, createdAt: user.createdAt } : null;
}

async function accountRegister(credentials = {}) {
  if (isBuiltinOwnerEmail(credentials.email)) throw new Error('该内置账户已存在，请直接登录。');
  if (USE_SMOKE_ACCOUNT_MOCK) {
    const email = String(credentials.email || '').trim().toLowerCase();
    if (smokeAccounts.has(email)) throw new Error('An account already exists for this email.');
    smokeAccounts.set(email, { id: `smoke-${Date.now()}`, email, password: String(credentials.password || ''), plan: 'free', createdAt: new Date().toISOString() });
    return { user: smokeUser(email), next: 'login' };
  }
  return accountApiRequest('/auth/register', { method: 'POST', body: credentials });
}

async function accountLogin(credentials = {}) {
  if (isBuiltinOwnerEmail(credentials.email)) {
    if (!verifyBuiltinOwnerCredentials(credentials)) throw new Error('Email or password is incorrect.');
    accountSession = { accessToken: builtinOwnerSessionToken(credentials.email) };
    saveAccountSession();
    return { user: builtinOwnerUser(credentials.email) };
  }
  if (USE_SMOKE_ACCOUNT_MOCK) {
    const email = String(credentials.email || '').trim().toLowerCase();
    const user = smokeAccounts.get(email);
    if (!user || user.password !== credentials.password) throw new Error('Email or password is incorrect.');
    accountSession = { accessToken: `smoke:${email}` };
    return { user: smokeUser(email) };
  }
  const data = await accountApiRequest('/auth/login', { method: 'POST', body: credentials });
  accountSession = { accessToken: data.accessToken };
  saveAccountSession();
  return { user: data.user };
}

async function accountCurrent() {
  if (isBuiltinOwnerSession(accountSession.accessToken)) return { user: builtinOwnerUser(accountSession.accessToken) };
  if (String(accountSession.accessToken || '').startsWith('builtin-owner:')) {
    accountSession = {};
    saveAccountSession();
    return { user: null };
  }
  if (USE_SMOKE_ACCOUNT_MOCK) return { user: accountSession.accessToken?.startsWith('smoke:') ? smokeUser(accountSession.accessToken.slice(6)) : null };
  if (!accountSession.accessToken) return { user: null };
  try {
    return await accountApiRequest('/auth/me');
  } catch (error) {
    if (error.status === 401) {
      accountSession = {};
      saveAccountSession();
      return { user: null };
    }
    throw error;
  }
}

async function accountLogout() {
  if (!USE_SMOKE_ACCOUNT_MOCK && accountSession.accessToken && !isBuiltinOwnerSession(accountSession.accessToken)) {
    await accountApiRequest('/auth/logout', { method: 'POST' }).catch(() => null);
  }
  accountSession = {};
  saveAccountSession();
  return { ok: true };
}

async function accountOrders() {
  if (isBuiltinOwnerSession(accountSession.accessToken)) return { orders: [] };
  if (USE_SMOKE_ACCOUNT_MOCK) return { orders: smokeOrders.filter((order) => order.email === accountSession.accessToken?.slice(6)) };
  return accountApiRequest('/orders');
}

async function accountCreateOrder(productCode) {
  if (isBuiltinOwnerSession(accountSession.accessToken)) throw new Error('内置所有者账户已拥有无限权益，无需购买套餐。');
  if (USE_SMOKE_ACCOUNT_MOCK) {
    const level = String(productCode).split('_')[0];
    const email = accountSession.accessToken?.slice(6);
    const order = { id: `smoke-order-${Date.now()}`, productCode, productName: level, level, amountCents: 100, currency: 'USD', provider: 'mock', status: 'pending', checkoutUrl: 'https://example.com/mock-checkout', createdAt: new Date().toISOString(), email };
    smokeOrders = [order, ...smokeOrders];
    return { order };
  }
  return accountApiRequest('/orders', { method: 'POST', headers: { 'Idempotency-Key': `desktop-${crypto.randomUUID()}` }, body: { productCode } });
}

async function accountChangePassword(currentPassword, newPassword) {
  if (isBuiltinOwnerSession(accountSession.accessToken)) throw new Error('内置所有者账户密码固定，不能在应用内修改。');
  if (USE_SMOKE_ACCOUNT_MOCK) {
    const email = accountSession.accessToken?.slice(6);
    const user = smokeAccounts.get(email);
    if (!user || user.password !== currentPassword) throw new Error('Current password is incorrect.');
    user.password = String(newPassword || '');
    return { user: smokeUser(email) };
  }
  return accountApiRequest('/auth/password', { method: 'POST', body: { currentPassword, newPassword } });
}

async function accountCatalog() {
  if (USE_SMOKE_ACCOUNT_MOCK) return { products: [] };
  return accountApiRequest('/catalog/plans');
}

async function fetchLatestReleaseResponse() {
  if (IS_SMOKE_TEST) {
    return {
      status: 200,
      data: [{
        tag_name: 'basic-v0.2.0',
        html_url: 'https://github.com/Imoot-TT/VidoGo-Basic/releases/tag/basic-v0.2.0',
        published_at: '2026-08-23T12:00:00Z',
        assets: [{
          name: 'VidoGo-Basic-0.2.0-x64-Setup.exe',
          browser_download_url: 'https://github.com/Imoot-TT/VidoGo-Basic/releases/download/basic-v0.2.0/VidoGo-Basic-0.2.0-x64-Setup.exe',
        }],
      }],
    };
  }
  const requestUrl = safeHttpsUrl(UPDATE_RELEASE_API_URL);
  if (!requestUrl) return { status: 0, error: 'The update API URL is invalid.' };
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12_000);
  try {
    const response = await net.fetch(requestUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/vnd.github+json',
        'User-Agent': `${APP_NAME}/${app.getVersion()}`,
        'X-GitHub-Api-Version': '2022-11-28',
      },
      signal: controller.signal,
    });
    let data = null;
    try { data = await response.json(); } catch { /* non-JSON error responses are represented by status */ }
    return { status: response.status, data };
  } catch (error) {
    return {
      status: 0,
      error: error?.name === 'AbortError' ? 'Update check timed out.' : String(error?.message || error),
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function checkForAppUpdates() {
  const response = await fetchLatestReleaseResponse();
  const state = deriveGitHubUpdateState(app.getVersion(), response, undefined, RELEASE_CHANNEL);
  if (response.error) state.message = response.error;
  return state;
}

function createAppIcon() {
  const image = nativeImage.createFromPath(path.join(__dirname, 'renderer', 'assets', 'vidogo-app-icon-256.png'));
  return image.isEmpty() ? undefined : image;
}

async function ensureUserDataPath() {
  await fs.mkdir(USER_DATA_PATH, { recursive: true });
  await fs.mkdir(SESSION_DATA_PATH, { recursive: true });
  await fs.mkdir(PARTITIONS_PATH, { recursive: true });
  return USER_DATA_PATH;
}

function loadEntitlementStore() {
  try {
    return normalizeEntitlementStore(JSON.parse(fsSync.readFileSync(ENTITLEMENT_STATE_PATH, 'utf8')));
  } catch {
    return normalizeEntitlementStore({});
  }
}

function persistEntitlementStore() {
  fsSync.mkdirSync(USER_DATA_PATH, { recursive: true });
  fsSync.writeFileSync(ENTITLEMENT_STATE_PATH, JSON.stringify(entitlementStore, null, 2), 'utf8');
}

function getCurrentEntitlementState() {
  return entitlementState(entitlementStore, currentEntitlementProfile);
}

function notifyEntitlementState(state = getCurrentEntitlementState()) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('entitlements:changed', state);
  }
  return state;
}

function configureEntitlementProfile(options = {}) {
  currentEntitlementProfile = normalizeEntitlementProfile({
    accountId: options.accountId,
    planLevel: options.planLevel,
  });
  downloadConcurrencyLimit = clampPlanConcurrency(downloadConcurrencyLimit, currentEntitlementProfile);
  return notifyEntitlementState();
}

function consumeCurrentDailyEntitlement(count) {
  const result = consumePlanDailyEntitlement(entitlementStore, currentEntitlementProfile, count);
  if (!result.ok) return result;
  entitlementStore = result.store;
  persistEntitlementStore();
  notifyEntitlementState(result.state);
  return result;
}

function assertDailyEntitlementAvailable(count) {
  const state = getCurrentEntitlementState();
  if (state.remainingToday !== null && count > state.remainingToday) {
    const error = new Error('daily-entitlement-limit-reached');
    error.entitlements = state;
    throw error;
  }
  return state;
}

function getRuntimeInfo() {
  return {
    appName: APP_NAME,
    version: app.getVersion(),
    runtimeProfile: RUNTIME_PROFILE,
    browserPartition: BROWSER_PARTITION,
    userDataPath: USER_DATA_PATH,
    sessionDataPath: SESSION_DATA_PATH,
    backendMode: app.isPackaged ? 'bundled' : 'python',
  };
}

function resolveWorkerLaunch(mode) {
  if (app.isPackaged) {
    const workerPath = path.join(process.resourcesPath, 'vendor', 'vidogo-worker.exe');
    if (!fsSync.existsSync(workerPath)) {
      throw new Error(`Packaged backend is missing: ${workerPath}`);
    }
    return {
      command: workerPath,
      args: [mode],
      env: { ...process.env, ELECTRON_RUN_AS_NODE: '1' },
    };
  }
  const scriptName = mode === 'metadata' ? 'metadata_worker.py' : 'download_worker.py';
  return {
    command: process.env.PYTHON || 'python',
    args: [path.join(__dirname, '..', 'backend', scriptName)],
    env: { ...process.env, ELECTRON_RUN_AS_NODE: '1' },
  };
}

function resolveBundledFfmpegLocation() {
  if (!app.isPackaged) return null;
  const binPath = path.join(process.resourcesPath, 'vendor', 'bin');
  return fsSync.existsSync(path.join(binPath, 'ffmpeg.exe')) ? binPath : null;
}

function getLegacyInfo() {
  const appDataRoot = app.getPath('appData');
  const legacyDirs = [
    path.join(appDataRoot, 'VidBrowser'),
    path.join(appDataRoot, 'VidoGo'),
  ];

  let legacyProcess = null;
  try {
    const stdout = execFileSync('tasklist.exe', ['/FI', 'IMAGENAME eq VidBrowser.exe', '/FO', 'CSV', '/NH'], {
      encoding: 'utf8',
      windowsHide: true,
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    if (stdout && !stdout.startsWith('INFO:')) {
      const match = stdout.match(/^"([^"]+)","([^"]+)","([^"]+)","([^"]+)","([^"]+)"$/m);
      if (match) {
        legacyProcess = {
          name: match[1],
          pid: match[2],
          memory: match[5],
        };
      }
    }
  } catch {
    legacyProcess = null;
  }

  return {
    legacyDirs,
    legacyProcess,
  };
}

function createWindow(url = null) {
  const icon = createAppIcon();
  mainWindow = new BrowserWindow({
    width: 1360,
    height: 860,
    minWidth: 980,
    minHeight: 680,
    center: true,
    title: APP_NAME,
    roundedCorners: true,
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'hidden',
    ...(process.platform === 'darwin' ? {} : {
      titleBarOverlay: {
        ...TITLE_BAR_THEMES.dark,
        height: TITLE_BAR_HEIGHT,
      },
    }),
    show: false,
    autoHideMenuBar: true,
    backgroundColor: '#0b1220',
    icon,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      webviewTag: true,
    },
  });

  mainWindow.webContents.on('will-attach-webview', (_event, webPreferences) => {
    webPreferences.preload = path.join(__dirname, 'webview-preload.js');
    webPreferences.contextIsolation = true;
    webPreferences.nodeIntegration = false;
    webPreferences.sandbox = false;
    webPreferences.partition = BROWSER_PARTITION;
  });
  if (url) {
    mainWindow.webContents.once('did-finish-load', () => {
      mainWindow.webContents.send('browser:navigate', url);
    });
  }

  if (IS_SMOKE_TEST) {
    let smokeStarted = false;
    const startSmoke = () => {
      if (smokeStarted || !mainWindow || mainWindow.isDestroyed()) return;
      smokeStarted = true;
      runSmokeTest(mainWindow).catch((error) => {
        console.error(error?.stack || error);
        void writeSmokeResult({ ok: false, result: { ok: false, reason: error?.stack || String(error) } })
          .finally(() => app.exit(1));
      });
    };
    mainWindow.webContents.once('did-finish-load', startSmoke);
    mainWindow.webContents.once('dom-ready', startSmoke);
    setTimeout(startSmoke, 1500);
  }

  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));

  if (!IS_SMOKE_TEST) {
    mainWindow.webContents.once('did-finish-load', () => {
      setTimeout(() => {
        if (mainWindow && !mainWindow.isDestroyed() && !mainWindow.isVisible()) mainWindow.show();
      }, 4000);
    });
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

async function runSmokeTest(window) {
  const result = await window.webContents.executeJavaScript(`
    new Promise((resolve) => {
      const startedAt = Date.now();
      const check = () => {
        const bootError = window.__VIDOGO_BOOT_ERROR || null;
        if (bootError) {
          resolve({ ok: false, reason: bootError });
          return;
        }
        const requiredIds = [
          'window-title',
          'tab-strip',
          'platform-groups',
          'platform-manage-button',
          'browser-stage',
          'candidate-list',
          'url-input',
          'download-body',
          'history-list',
          'favorites-content',
          'plan-table',
          'settings-theme-control',
          'settings-language-control',
          'settings-adblock-control',
          'settings-recording-control',
          'settings-output-dir'
        ];
        const missing = requiredIds.filter((id) => !document.getElementById(id));
        if (window.__VIDOGO_BOOTSTRAPPED && missing.length === 0) {
          const scenario = ${JSON.stringify(process.env.ELECTRON_SMOKE_SCENARIO || '')};
          const runnerName = scenario === 'browser-youtube-flow'
            ? '__VIDOGO_RUN_BROWSER_YOUTUBE_FLOW_TEST'
            : (scenario === 'browser-platform-flow'
              ? '__VIDOGO_RUN_BROWSER_PLATFORM_FLOW_TEST'
            : (scenario === 'account-ui-flow'
              ? '__VIDOGO_RUN_ACCOUNT_UI_FLOW_TEST'
            : (scenario === 'owner-flow'
              ? '__VIDOGO_RUN_OWNER_FLOW_TEST'
            : (scenario === 'locale-rtl'
              ? '__VIDOGO_RUN_RTL_LOCALE_TEST'
              : (scenario === 'recorder-flow'
                ? '__VIDOGO_RUN_RECORDER_FLOW_TEST'
                : (scenario === 'manifest-flow'
                  ? '__VIDOGO_RUN_MANIFEST_FLOW_TEST'
                  : (scenario === 'dash-flow'
                    ? '__VIDOGO_RUN_DASH_FLOW_TEST'
                    : (scenario === 'resolver-flow' ? '__VIDOGO_RUN_RESOLVER_FLOW_TEST' : '__VIDOGO_RUN_SELF_TEST'))))))));
          const runnerLabel = scenario || 'self test';
          const runnerTimeoutMs = ['browser-youtube-flow', 'browser-platform-flow'].includes(scenario)
            ? 65000
            : (['download-queue-real', 'resolver-flow'].includes(scenario) ? 60000 : (scenario === 'recorder-flow' ? 40000 : 18000));
          const selfTestPromise = Promise.resolve(
            typeof window[runnerName] === 'function'
              ? window[runnerName](scenario === 'owner-flow'
                ? ${JSON.stringify(process.env.ELECTRON_SMOKE_OWNER_PASSWORD || '')}
                : (scenario === 'resolver-flow'
                  ? ${JSON.stringify(process.env.ELECTRON_SMOKE_BROWSER_URL || process.env.ELECTRON_SMOKE_MANIFEST_PAGE_URL || null)}
                  : ${JSON.stringify(process.env.ELECTRON_SMOKE_MANIFEST_PAGE_URL || null)}))
              : { ok: false, failures: [runnerLabel + ' function missing'] }
          );
          const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve({
            ok: false,
            failures: [runnerLabel + ' timed out'],
            progress: window.__VIDOGO_SELF_TEST_PROGRESS || null
          }), runnerTimeoutMs));
          Promise.race([selfTestPromise, timeoutPromise]).then((selfTest) => {
            const finalSection = ${JSON.stringify(process.env.ELECTRON_SMOKE_FINAL_SECTION || '')};
            const finalLocale = ${JSON.stringify(process.env.ELECTRON_SMOKE_FINAL_LOCALE || '')};
            const finalSettingsSection = ${JSON.stringify(process.env.ELECTRON_SMOKE_FINAL_SETTINGS_SECTION || '')};
            const visualAudit = ${JSON.stringify(process.env.ELECTRON_SMOKE_VISUAL_AUDIT === '1')};
            if (finalLocale) {
              const languageControl = document.getElementById('settings-language-control');
              if (languageControl instanceof HTMLSelectElement) {
                languageControl.value = finalLocale;
                languageControl.dispatchEvent(new Event('change'));
              }
            }
            if (visualAudit && finalSection && typeof window.__VIDOGO_PREPARE_VISUAL_AUDIT === 'function') {
              window.__VIDOGO_PREPARE_VISUAL_AUDIT(finalSection);
            }
            if (finalSection && typeof window.__VIDOGO_SET_SECTION === 'function') {
              window.__VIDOGO_SET_SECTION(finalSection);
            }
            if (finalSection === 'settings' && finalSettingsSection) {
              document.querySelector('[data-settings-section="' + CSS.escape(finalSettingsSection) + '"]')?.click();
            }
            const finish = () => {
              const activePageIds = Array.from(document.querySelectorAll('.page.active')).map((page) => page.id);
              resolve({
                ok: Boolean(selfTest && selfTest.ok) && activePageIds.length === 1,
                selfTest,
                tabs: document.querySelectorAll('.tab').length,
                pages: document.querySelectorAll('.page').length,
                quickSites: document.querySelectorAll('.popular-site-button, .site-card').length,
                activePage: activePageIds[0] || null,
                activePageIds,
                browserLayout: typeof window.__VIDOGO_GET_BROWSER_LAYOUT === 'function'
                  ? window.__VIDOGO_GET_BROWSER_LAYOUT()
                  : null
              });
            };
            if (finalSection) setTimeout(finish, 800);
            else finish();
          });
          return;
        }
        if (Date.now() - startedAt > 7000) {
          resolve({
            ok: false,
            reason: 'Renderer bootstrap timed out',
            bootstrapped: Boolean(window.__VIDOGO_BOOTSTRAPPED),
            missing
          });
          return;
        }
        setTimeout(check, 100);
      };
      check();
    })
  `);

  if (!result?.ok) {
    await writeSmokeResult({ ok: false, result });
    console.error('Electron smoke test failed:', JSON.stringify(result));
    app.exit(1);
    return;
  }
  await writeSmokeResult({ ok: true, result });
  console.log('Electron smoke test passed:', JSON.stringify(result));
  app.exit(0);
}

async function writeSmokeResult(payload) {
  const resultPath = process.env.ELECTRON_SMOKE_RESULT;
  const screenshotPath = process.env.ELECTRON_SMOKE_SCREENSHOT;
  if (screenshotPath && mainWindow && !mainWindow.isDestroyed()) {
    let debuggerAttached = false;
    try {
      if (!mainWindow.isVisible()) {
        mainWindow.showInactive();
      }
      const hoverSection = String(process.env.ELECTRON_SMOKE_HOVER_SECTION || '').trim();
      if (hoverSection) {
        mainWindow.webContents.debugger.attach('1.3');
        debuggerAttached = true;
        await mainWindow.webContents.debugger.sendCommand('DOM.enable');
        await mainWindow.webContents.debugger.sendCommand('CSS.enable');
        const documentNode = await mainWindow.webContents.debugger.sendCommand('DOM.getDocument');
        const target = await mainWindow.webContents.debugger.sendCommand('DOM.querySelector', {
          nodeId: documentNode.root.nodeId,
          selector: `.sidebar-btn[data-section="${hoverSection.replaceAll('"', '\\"')}"]`,
        });
        if (target.nodeId) {
          await mainWindow.webContents.debugger.sendCommand('CSS.forcePseudoState', {
            nodeId: target.nodeId,
            forcedPseudoClasses: ['hover'],
          });
        }
      }
      await mainWindow.webContents.executeJavaScript(`
        document.body.dataset.theme = 'dark';
        document.body.dataset.resolvedTheme = 'dark';
        new Promise((resolve) => {
          let frames = 0;
          const tick = () => (++frames >= 6 ? resolve() : requestAnimationFrame(tick));
          requestAnimationFrame(tick);
        })
      `);
      const image = await Promise.race([
        mainWindow.webContents.capturePage(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Smoke screenshot timed out')), 3000)),
      ]);
      await fs.writeFile(screenshotPath, image.toPNG());
    } catch (error) {
      payload.screenshotError = error?.message || String(error);
    } finally {
      if (debuggerAttached) mainWindow.webContents.debugger.detach();
    }
  }
  if (resultPath) {
    await fs.writeFile(resultPath, JSON.stringify(payload, null, 2), 'utf8');
  }
}

function createPopupWindow(url, partition = BROWSER_PARTITION) {
  const popup = new BrowserWindow({
    width: 1180,
    height: 820,
    autoHideMenuBar: true,
    title: APP_NAME,
    backgroundColor: '#0b1220',
    icon: createAppIcon(),
    webPreferences: {
      partition,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });
  popup.loadURL(url);
  browserPopupWindows.add(popup);
  popup.on('closed', () => browserPopupWindows.delete(popup));
  return popup;
}

function getBrowserSession() {
  return session.fromPartition(BROWSER_PARTITION);
}

function getBackgroundDownloadSession() {
  const downloadSession = session.fromPartition(BACKGROUND_DOWNLOAD_PARTITION);
  const browserUserAgent = getBrowserSession().getUserAgent();
  if (browserUserAgent && downloadSession.getUserAgent() !== browserUserAgent) {
    downloadSession.setUserAgent(browserUserAgent);
  }
  return downloadSession;
}

function configureBrowserIdentity() {
  const browserSession = getBrowserSession();
  const browserUserAgent = String(browserSession.getUserAgent() || '')
    // Electron converts an application name such as "VidoGo Basic" into the
    // product token "VidoGoBasic" (and smoke runs append "Smoke<pid>"). The
    // former expression only removed VidoGo or VidoGo-Basic, so normal site
    // requests still advertised a custom browser product and repeatedly
    // triggered anti-bot verification pages.
    .replace(/\s+(?:Electron|VidoGo(?:-?Basic)?(?:Smoke\d+)?)\/[^\s]+/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
  if (browserUserAgent) browserSession.setUserAgent(browserUserAgent);
  browserChromeVersion = browserUserAgent.match(/Chrome\/([\d.]+)/i)?.[1] || '';
  return browserUserAgent;
}

function setHeader(headers, name, value) {
  for (const key of Object.keys(headers)) {
    if (key.toLowerCase() === name.toLowerCase()) delete headers[key];
  }
  headers[name] = value;
}

function getResponseHeader(headers, name) {
  if (!headers) return null;
  const match = Object.keys(headers).find((key) => key.toLowerCase() === name.toLowerCase());
  const value = match ? headers[match] : null;
  return Array.isArray(value) ? value[0] : value || null;
}

function classifyBrowserWindowOpen(url, openerUrl = '') {
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return 'deny';
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return 'deny';
  const openerIsGoogleOrYouTube = /(^|\.)(?:google\.com|youtube\.com)$/i.test((() => {
    try { return new URL(openerUrl).hostname; } catch { return ''; }
  })());
  const isGoogleAccountFlow = parsed.hostname === 'accounts.google.com' && openerIsGoogleOrYouTube;
  const isTelegramDownload = parsed.hostname === 'web.telegram.org'
    && /^\/(a|k)\/download\//.test(parsed.pathname)
    && String(openerUrl || '').includes('web.telegram.org');
  if (isTelegramDownload) return 'allow-hidden-popup';
  if (isGoogleAccountFlow) return 'allow-popup';
  return 'open-app-tab';
}

function shouldBlockRequest(rawUrl, resourceType) {
  if (isTrustedDirectMediaUrl(rawUrl)) return false;
  let parsed;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return false;
  }
  if (parsed.hostname.includes('youtube.com') || parsed.hostname.includes('googlevideo.com') || parsed.hostname.includes('ytimg.com')) {
    return false;
  }
  const host = parsed.hostname.toLowerCase();
  if (BLOCKED_HOST_PARTS.some((part) => host === part || host.endsWith(`.${part}`))) return true;
  if (resourceType === 'media' || resourceType === 'mainFrame') return false;
  return /\/(?:ad|ads|adserver|analytics|pixel|tracking|trackers?)(?:[/?#&_.=-]|$)/i.test(parsed.pathname)
    || /[?&](?:ad_id|ad_slot|ad_unit|adurl|gclid|fbclid)=/i.test(parsed.search);
}

function webContentsUsesAdSupportedPlayback(webContentsId) {
  const id = Number(webContentsId);
  if (!Number.isInteger(id) || id <= 0) return false;
  let guest = null;
  try {
    guest = webContents.fromId(id);
  } catch {
    return false;
  }
  if (!guest || guest.isDestroyed() || guest.getType() !== 'webview') return false;
  return ['dailymotion', 'pixabay', 'pexels', 'mixkit', 'coverr', 'videvo', 'videezy']
    .includes(providerSiteForUrl(guest.getURL()));
}

function requestUsesAdSupportedPlayback(details = {}) {
  if (webContentsUsesAdSupportedPlayback(details.webContentsId)) return true;
  const frame = details.frame;
  const contextUrls = [
    details.referrer,
    details.initiator,
    frame?.url,
    frame?.top?.url,
    frame?.parent?.url,
  ];
  try { contextUrls.push(details.webContents?.getURL?.()); } catch { /* request may outlive its contents */ }
  return contextUrls.some((value) => providerSiteForUrl(value) === 'dailymotion');
}

function frameUsesAdSupportedPlayback(frame) {
  const contextUrls = [frame?.url, frame?.top?.url, frame?.parent?.url];
  return contextUrls.some((value) => providerSiteForUrl(value) === 'dailymotion');
}

function sendAdBlockerState() {
  for (const contents of webContents.getAllWebContents()) {
    if (!contents.isDestroyed() && contents.getType() === 'webview') {
      contents.send('browser:ad-blocker-changed', browserAdBlockerEnabled);
    }
  }
}

function looksLikeMedia(details) {
  const mime = String(getResponseHeader(details.responseHeaders, 'content-type') || '').split(';')[0].trim().toLowerCase();
  if (MEDIA_MIME_PREFIXES.some((prefix) => mime.startsWith(prefix))) return true;
  try {
    const pathname = new URL(details.url).pathname.toLowerCase();
    return MEDIA_EXTENSIONS.has(path.extname(pathname));
  } catch {
    return false;
  }
}

function browserPageContext(webContentsId) {
  const id = Number(webContentsId);
  if (!Number.isInteger(id) || id <= 0) return { pageUrl: null, pageTitle: null, userAgent: null };
  let guest = null;
  try {
    guest = webContents.fromId(id);
  } catch {
    return { pageUrl: null, pageTitle: null, userAgent: null };
  }
  if (!guest || guest.isDestroyed()) return { pageUrl: null, pageTitle: null, userAgent: null };
  const pageUrl = normalizePageUrl(guest.getURL());
  const pageTitle = String(guest.getTitle() || '').trim() || null;
  const userAgent = String(guest.getUserAgent() || '').trim() || null;
  return { pageUrl, pageTitle, userAgent };
}

function playlistSourceClient(mime, extension) {
  const lowerMime = String(mime || '').toLowerCase();
  const lowerExtension = String(extension || '').toLowerCase();
  if (lowerExtension === 'm3u8' || lowerMime.includes('mpegurl')) return 'hls';
  if (lowerExtension === 'mpd' || lowerMime.includes('dash+xml')) return 'dash';
  return null;
}

function createMediaCandidate(details) {
  let parsed;
  try {
    parsed = new URL(details.url);
  } catch {
    return null;
  }
  const mime = String(getResponseHeader(details.responseHeaders, 'content-type') || '').split(';')[0].trim();
  const contentLength = Number(getResponseHeader(details.responseHeaders, 'content-length') || 0);
  const contentRange = String(getResponseHeader(details.responseHeaders, 'content-range') || '');
  const rangeTotal = Number(contentRange.match(/\/(\d+)\s*$/)?.[1] || 0);
  const totalSize = Math.max(
    Number.isFinite(contentLength) && contentLength > 0 ? contentLength : 0,
    Number.isFinite(rangeTotal) && rangeTotal > 0 ? rangeTotal : 0,
  );
  const extension = path.extname(parsed.pathname).replace('.', '').toLowerCase();
  const page = browserPageContext(details.webContentsId);
  const sourceClient = playlistSourceClient(mime, extension);
  const id = Buffer.from(details.url).toString('base64url').slice(0, 48);
  let title;
  try {
    title = decodeURIComponent(path.basename(parsed.pathname));
  } catch {
    title = path.basename(parsed.pathname);
  }
  return {
    id,
    url: details.url,
    host: parsed.hostname,
    title: page.pageTitle || title || parsed.hostname,
    fileName: title || null,
    pageUrl: page.pageUrl,
    mime,
    extension,
    size: totalSize || null,
    kind: isPlaylistResource({ url: details.url, mimeType: mime, extension })
      ? 'playlist'
      : (mime.toLowerCase().startsWith('audio/') ? 'audio' : 'video'),
    resourceType: details.resourceType,
    sourceClient,
    requestReferrer: normalizePageUrl(details.referrer || details.frame?.url || page.pageUrl),
    webContentsId: details.webContentsId,
    detectedAt: new Date().toISOString(),
  };
}

async function fetchManifestText(browserSession, manifestUrl, pageUrl, userAgent) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), MANIFEST_FETCH_TIMEOUT_MS);
  try {
    const headers = { Accept: 'application/vnd.apple.mpegurl,application/x-mpegurl,application/dash+xml,text/plain;q=0.9,*/*;q=0.1' };
    if (pageUrl) headers.Referer = pageUrl;
    if (userAgent) headers['User-Agent'] = userAgent;
    const response = await browserSession.fetch(manifestUrl, {
      headers,
      redirect: 'follow',
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`Manifest request failed (${response.status}).`);
    const declaredLength = Number(response.headers.get('content-length') || 0);
    if (declaredLength > MAX_MANIFEST_BYTES) throw new Error('Manifest exceeds the size limit.');
    const reader = response.body?.getReader();
    if (!reader) throw new Error('Manifest response was empty.');
    const chunks = [];
    let totalBytes = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      totalBytes += value.byteLength;
      if (totalBytes > MAX_MANIFEST_BYTES) {
        await reader.cancel();
        throw new Error('Manifest exceeds the size limit.');
      }
      chunks.push(Buffer.from(value));
    }
    return {
      text: Buffer.concat(chunks, totalBytes).toString('utf8'),
      url: response.url || manifestUrl,
    };
  } finally {
    clearTimeout(timeout);
  }
}

function sendMediaCandidate(candidate) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('browser:media-candidate', candidate);
  }
}

function inspectHlsCandidate(candidate) {
  const inspectionKey = `${candidate.webContentsId}:${candidate.url}`;
  if (manifestInspectionInFlight.has(inspectionKey)) return manifestInspectionInFlight.get(inspectionKey);
  const task = (async () => {
    const page = browserPageContext(candidate.webContentsId);
    const browserSession = getBrowserSession();
    const masterResponse = await fetchManifestText(browserSession, candidate.url, page.pageUrl, page.userAgent);
    const manifest = parseHlsPlaylist(masterResponse.text, masterResponse.url);
    if (!manifest) return null;
    let mediaPlaylist = null;
    const bestVariant = manifest.variants[0];
    if (bestVariant?.url && bestVariant.url !== masterResponse.url) {
      try {
        const mediaResponse = await fetchManifestText(browserSession, bestVariant.url, page.pageUrl, page.userAgent);
        mediaPlaylist = parseHlsPlaylist(mediaResponse.text, mediaResponse.url);
      } catch {
        mediaPlaylist = null;
      }
    }
    const current = mediaCandidates.get(candidate.id);
    if (!current || current.url !== candidate.url || Number(current.webContentsId) !== Number(candidate.webContentsId)) return null;
    const enriched = buildHlsCandidate({
      ...current,
      pageUrl: current.pageUrl || page.pageUrl,
      title: page.pageTitle || current.title,
      metadataSource: 'hls-manifest',
      detectedAt: new Date().toISOString(),
    }, manifest, mediaPlaylist);
    mediaCandidates.set(enriched.id, enriched);
    sendMediaCandidate(enriched);
    return enriched;
  })().catch(() => null).finally(() => manifestInspectionInFlight.delete(inspectionKey));
  manifestInspectionInFlight.set(inspectionKey, task);
  return task;
}

function inspectDashCandidate(candidate) {
  const inspectionKey = `${candidate.webContentsId}:${candidate.url}`;
  if (manifestInspectionInFlight.has(inspectionKey)) return manifestInspectionInFlight.get(inspectionKey);
  const task = (async () => {
    const page = browserPageContext(candidate.webContentsId);
    const manifestResponse = await fetchManifestText(
      getBrowserSession(),
      candidate.url,
      page.pageUrl,
      page.userAgent,
    );
    const manifest = parseDashManifest(manifestResponse.text, manifestResponse.url);
    if (!manifest) return null;
    const current = mediaCandidates.get(candidate.id);
    if (!current || current.url !== candidate.url || Number(current.webContentsId) !== Number(candidate.webContentsId)) return null;
    const enriched = buildDashCandidate({
      ...current,
      pageUrl: current.pageUrl || page.pageUrl,
      title: page.pageTitle || current.title,
      metadataSource: 'dash-manifest',
      detectedAt: new Date().toISOString(),
    }, manifest);
    mediaCandidates.set(enriched.id, enriched);
    sendMediaCandidate(enriched);
    return enriched;
  })().catch(() => null).finally(() => manifestInspectionInFlight.delete(inspectionKey));
  manifestInspectionInFlight.set(inspectionKey, task);
  return task;
}

function rememberMediaCandidate(details) {
  if (!Number.isFinite(Number(details.webContentsId)) || Number(details.webContentsId) <= 0) return;
  if (!looksLikeMedia(details)) return;
  const candidate = createMediaCandidate(details);
  if (!candidate) return;
  if (shouldIgnoreRawMediaResource({
    url: candidate.url,
    mimeType: candidate.mime,
    extension: candidate.extension,
    sizeBytes: candidate.size,
  })) return;
  // TikTok and Douyin commonly attach a blob: URL to the visible <video>
  // element while the real MP4 exists only in byte-range network responses.
  // Keep those responses for enriching the single active-video row, but never
  // render the fragments as independent media items.
  const activeShortVideoProvider = providerSiteForUrl(candidate.pageUrl);
  if (['tiktok', 'douyin'].includes(activeShortVideoProvider) && candidate.kind !== 'playlist') {
    candidate.hiddenForActiveMedia = true;
    candidate.sourceClient = `${activeShortVideoProvider}-network`;
  }
  mediaCandidates.set(candidate.id, candidate);
  if (mediaCandidates.size > 300) {
    const [oldest] = mediaCandidates.keys();
    mediaCandidates.delete(oldest);
  }
  sendMediaCandidate(candidate);
  if (candidate.sourceClient === 'hls') void inspectHlsCandidate(candidate);
  if (candidate.sourceClient === 'dash') void inspectDashCandidate(candidate);
}

function registerBrowserRequestFeatures() {
  if (requestFeaturesRegistered) return;
  requestFeaturesRegistered = true;
  const browserSession = getBrowserSession();
  browserSession.on('will-download', (event, item, sourceContents) => {
    const sourceId = Number(sourceContents?.id || 0);
    const url = String(item.getURL() || '').trim();
    const key = `${sourceId}\u0000${url}`;
    if (programmaticBrowserDownloads.delete(key) || programmaticBrowserDownloadSources.has(sourceId)) return;
    if (!sourceId || !url || sourceContents?.getType?.() !== 'webview') return;
    event.preventDefault();
    const expiresAt = Date.now() + 30_000;
    nativeDownloadPermits.set(key, expiresAt);
    setTimeout(() => {
      if (nativeDownloadPermits.get(key) === expiresAt) nativeDownloadPermits.delete(key);
    }, 30_500);
    mainWindow?.webContents.send('browser:native-download-request', {
      url,
      webContentsId: sourceId,
      fileName: String(item.getFilename() || '').slice(0, 260),
      mimeType: String(item.getMimeType() || '').slice(0, 120),
      sizeBytes: Math.max(0, Number(item.getTotalBytes() || 0)),
      pageUrl: sourceContents.getURL(),
      title: sourceContents.getTitle(),
    });
  });
  browserSession.webRequest.onBeforeRequest({ urls: ['http://*/*', 'https://*/*'] }, (details, callback) => {
    const pageAllowsAds = requestUsesAdSupportedPlayback(details);
    const requestWebContentsId = Number(details.webContentsId || 0);
    const isBackendDirectDownload = (!Number.isInteger(requestWebContentsId) || requestWebContentsId <= 0)
      && Array.from(activeDownloadJobs.values()).some((job) => job?.task?.directDownload === true && !job.cancelled);
    // Electron's net.request follows CDN redirects inside the network service.
    // Redirected requests may no longer match the original URL byte-for-byte,
    // but they still have no page webContents. Keep those app-owned transfers
    // outside the browser-page ad filter.
    const isAppDownload = programmaticMediaRequests.has(details.url) || isBackendDirectDownload;
    const cancel = !isAppDownload && browserAdBlockerEnabled && !pageAllowsAds && shouldBlockRequest(details.url, details.resourceType);
    if (cancel && IS_SMOKE_TEST) {
      blockedRequestDiagnostics.push({
        url: details.url,
        resourceType: details.resourceType,
        webContentsId: details.webContentsId,
        referrer: details.referrer || '',
        initiator: details.initiator || '',
        frameUrl: details.frame?.url || '',
        topFrameUrl: details.frame?.top?.url || '',
      });
      if (blockedRequestDiagnostics.length > 200) blockedRequestDiagnostics.splice(0, blockedRequestDiagnostics.length - 200);
    }
    callback({ cancel });
  });
  browserSession.webRequest.onBeforeSendHeaders({ urls: ['http://*/*', 'https://*/*'] }, (details, callback) => {
    const requestHeaders = { ...details.requestHeaders };
    setHeader(requestHeaders, 'Accept-Language', browserAcceptLanguage);
    callback({ requestHeaders });
  });
  browserSession.webRequest.onHeadersReceived({ urls: ['http://*/*', 'https://*/*'] }, (details, callback) => {
    if (IS_SMOKE_TEST && /(?:dailymotion|dmxleo|cdndirector)/i.test(details.url)) {
      dailymotionRequestDiagnostics.push({ phase: 'headers', url: details.url, statusCode: details.statusCode, resourceType: details.resourceType });
      if (dailymotionRequestDiagnostics.length > 300) dailymotionRequestDiagnostics.splice(0, dailymotionRequestDiagnostics.length - 300);
    }
    rememberMediaCandidate(details);
    callback({ responseHeaders: details.responseHeaders });
  });
  browserSession.webRequest.onErrorOccurred({ urls: ['http://*/*', 'https://*/*'] }, (details) => {
    if (!IS_SMOKE_TEST || !/(?:dailymotion|dmxleo|cdndirector)/i.test(details.url)) return;
    dailymotionRequestDiagnostics.push({ phase: 'error', url: details.url, error: details.error, resourceType: details.resourceType });
  });
}

async function resetBrowserSession() {
  const browserSession = getBrowserSession();
  await Promise.allSettled([
    browserSession.clearStorageData(),
    browserSession.clearCache(),
  ]);
  mediaCandidates.clear();
  manifestInspectionInFlight.clear();
  metadataExtractionCache.clear();
  metadataGeneration += 1;
}

async function exportCookieJar(cookiePath) {
  const cookies = await getBrowserSession().cookies.get({});
  const lines = ['# Netscape HTTP Cookie File'];
  for (const cookie of cookies) {
    const domain = cookie.domain || '';
    const includeSubdomains = domain.startsWith('.') ? 'TRUE' : 'FALSE';
    const secure = cookie.secure ? 'TRUE' : 'FALSE';
    const expires = Number.isFinite(cookie.expirationDate)
      ? Math.floor(cookie.expirationDate)
      : Math.floor(Date.now() / 1000) + 31536000;
    const value = [
      domain,
      includeSubdomains,
      cookie.path || '/',
      secure,
      expires,
      cookie.name,
      cookie.value,
    ].join('\t');
    lines.push(value);
  }
  await fs.writeFile(cookiePath, lines.join('\n'), 'utf8');
}

function normalizeFormatSelector(value) {
  const selector = String(value || '').trim();
  if (!selector) return null;
  if (selector.length > 300 || !/^[A-Za-z0-9_+*/.\[\]=:,<>!-]+$/.test(selector)) {
    throw new Error('Invalid yt-dlp format selector.');
  }
  return selector;
}

function downloadRequestKey(url, formatId = null) {
  return `${String(url || '').trim()}\u0000${String(formatId || '').trim()}`;
}

function normalizeMergeOutputFormat(value) {
  const outputFormat = String(value || 'mp4').trim().toLowerCase();
  if (!['mp4', 'webm', 'mkv'].includes(outputFormat)) throw new Error('Invalid merge output format.');
  return outputFormat;
}

function normalizeDownloadReferrer(value) {
  if (!value) return null;
  try {
    const parsed = new URL(String(value).trim());
    if (!['http:', 'https:'].includes(parsed.protocol) || parsed.username || parsed.password) return null;
    parsed.hash = '';
    return parsed.href;
  } catch {
    return null;
  }
}

function consumeNativeDownloadPermit(url, webContentsId) {
  const key = `${Number(webContentsId || 0)}\u0000${String(url || '').trim()}`;
  const expiresAt = nativeDownloadPermits.get(key) || 0;
  nativeDownloadPermits.delete(key);
  return expiresAt > Date.now();
}

function isAllowedSiteDownloadIntent(url, referrer, webContentsId) {
  let guest = null;
  try { guest = webContents.fromId(Number(webContentsId)); } catch { guest = null; }
  if (!guest || guest.isDestroyed() || guest.getType() !== 'webview') return false;
  let target;
  try { target = new URL(String(url || '').trim()); } catch { return false; }
  if (target.protocol !== 'https:' || target.username || target.password) return false;
  const pageProvider = providerSiteForUrl(guest.getURL());
  const referrerProvider = providerSiteForUrl(referrer);
  return Boolean(pageProvider && pageProvider === referrerProvider
    && ['pixabay', 'pexels', 'mixkit', 'coverr', 'videvo', 'videezy', 'distill', 'mazwai', 'lifeofvids', 'dareful'].includes(pageProvider));
}

function runMetadataWorker(task, cookiePath) {
  const launch = resolveWorkerLaunch('metadata');
  return new Promise((resolve, reject) => {
    const proc = spawn(launch.command, launch.args, {
      stdio: ['pipe', 'pipe', 'pipe'],
      windowsHide: true,
      env: launch.env,
    });
    let stdout = '';
    let stderr = '';
    let settled = false;
    const finish = (callback) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      callback();
    };
    const timeout = setTimeout(() => {
      proc.kill();
      finish(() => reject(new Error('Media analysis timed out.')));
    }, 65000);
    proc.stdout.setEncoding('utf8');
    proc.stdout.on('data', (chunk) => {
      stdout += chunk;
      if (stdout.length > 12 * 1024 * 1024) {
        proc.kill();
        finish(() => reject(new Error('Media analysis returned too much data.')));
      }
    });
    proc.stderr.setEncoding('utf8');
    proc.stderr.on('data', (chunk) => {
      stderr = `${stderr}${chunk}`.slice(-4000);
    });
    proc.on('error', (error) => finish(() => reject(error)));
    proc.on('close', (code) => {
      finish(() => {
        let payload;
        try {
          payload = JSON.parse(stdout.trim());
        } catch {
          reject(new Error(stderr.trim() || `Media analysis worker exited with code ${code}.`));
          return;
        }
        if (!payload?.ok) {
          reject(new Error(payload?.error || stderr.trim() || `Media analysis worker exited with code ${code}.`));
          return;
        }
        resolve(Array.isArray(payload.candidates) ? payload.candidates : []);
      });
    });
    proc.stdin.end(JSON.stringify({
      ...task,
      cookieFile: cookiePath,
      jsRuntimePath: process.execPath,
    }));
  });
}

async function extractPageMediaCandidates(pageUrl, webContentsId, force = false) {
  const page = classifyMediaPage(pageUrl);
  const normalizedUrl = page?.normalizedUrl || null;
  const id = Number(webContentsId);
  if (!page || !Number.isFinite(id) || id <= 0) return [];
  const guest = webContents.fromId(id);
  if (!guest || guest.isDestroyed() || guest.getType() !== 'webview') return [];
  const guestUrl = normalizePageUrl(guest.getURL());
  if (guestUrl !== normalizedUrl && !isProviderMediaContext(guestUrl, normalizedUrl)) return [];
  if (IS_SMOKE_TEST) return [];

  const cacheKey = `${id}:${normalizedUrl}`;
  const cached = metadataExtractionCache.get(cacheKey);
  if (!force && cached?.expiresAt > Date.now()) return cached.candidates;
  if (metadataExtractionInFlight.has(cacheKey)) return metadataExtractionInFlight.get(cacheKey);
  const generation = metadataGeneration;
  const task = (async () => {
    const cookieDir = path.join(app.getPath('userData'), 'cookies');
    await fs.mkdir(cookieDir, { recursive: true });
    metadataRequestCounter += 1;
    const cookiePath = path.join(cookieDir, `media-analysis-${process.pid}-${metadataRequestCounter}.txt`);
    try {
      await exportCookieJar(cookiePath);
      const candidates = await runMetadataWorker({
        pageUrl: normalizedUrl,
        provider: page.provider,
        webContentsId: id,
      }, cookiePath);
      const currentGuestUrl = normalizePageUrl(guest.getURL());
      if (generation !== metadataGeneration
        || (currentGuestUrl !== normalizedUrl && !isProviderMediaContext(currentGuestUrl, normalizedUrl))) return [];
      const normalizedCandidates = candidates.slice(0, 10).map((candidate) => ({
        ...candidate,
        webContentsId: id,
        provider: candidate.provider || page.provider,
        metadataSource: candidate.metadataSource || `yt-dlp:${page.provider}`,
        detectedAt: candidate.detectedAt || new Date().toISOString(),
        variants: Array.isArray(candidate.variants) ? candidate.variants.slice(0, 20) : [],
      })).filter((candidate) => candidate.id && candidate.url);
      for (const candidate of normalizedCandidates) mediaCandidates.set(candidate.id, candidate);
      metadataExtractionCache.set(cacheKey, {
        candidates: normalizedCandidates,
        expiresAt: Date.now() + METADATA_CACHE_TTL_MS,
      });
      return normalizedCandidates;
    } finally {
      void fs.unlink(cookiePath).catch(() => {});
    }
  })();
  metadataExtractionInFlight.set(cacheKey, task);
  try {
    return await task;
  } finally {
    metadataExtractionInFlight.delete(cacheKey);
  }
}

function normalizeDownloadConcurrency(value) {
  const concurrency = Number.parseInt(String(value || 1), 10);
  return Number.isFinite(concurrency) ? Math.max(1, Math.min(10, concurrency)) : 1;
}

function effectiveDownloadConcurrency(value) {
  if (getCurrentEntitlementState().maxConcurrentDownloads === null) return Number.MAX_SAFE_INTEGER;
  return clampPlanConcurrency(normalizeDownloadConcurrency(value), currentEntitlementProfile);
}

function broadcastRecordingEnabled() {
  for (const contents of webContents.getAllWebContents()) {
    if (!contents.isDestroyed() && contents.getType() === 'webview') {
      contents.send('recording:enabled-changed', recordingEnabled);
    }
  }
}

function getDownloadQueueState() {
  const activeDownloadCount = Array.from(activeDownloadJobs.values()).filter((job) => !job.cancelled).length;
  const activeRecordingCount = Array.from(activeRecordingSessions.values()).filter((recording) => !recording.finished).length;
  const activeCount = activeDownloadCount + activeRecordingCount;
  return {
    running: activeCount > 0 || queuedDownloadJobs.length > 0,
    activeCount,
    queuedCount: queuedDownloadJobs.length,
    concurrency: downloadConcurrencyLimit,
  };
}

function sanitizeRecordingStem(value) {
  return String(value || 'recording')
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/[. ]+$/g, '')
    .slice(0, 120) || 'recording';
}

function recordingExtension(mimeType) {
  const mime = String(mimeType || '').toLowerCase();
  if (mime.includes('mp4')) return '.mp4';
  if (mime.includes('ogg')) return mime.startsWith('audio/') ? '.ogg' : '.ogv';
  if (mime.startsWith('audio/')) return '.webm';
  return '.webm';
}

function recordingBuffer(value) {
  if (Buffer.isBuffer(value)) return value;
  if (value instanceof ArrayBuffer) return Buffer.from(value);
  if (ArrayBuffer.isView(value)) return Buffer.from(value.buffer, value.byteOffset, value.byteLength);
  if (value?.type === 'Buffer' && Array.isArray(value.data)) return Buffer.from(value.data);
  throw new Error('Invalid recording chunk.');
}

async function reserveRecordingPaths(outputDir, requestedStem, extension) {
  await fs.mkdir(outputDir, { recursive: true });
  const stem = sanitizeRecordingStem(requestedStem);
  for (let attempt = 0; attempt < 1000; attempt += 1) {
    const suffix = attempt === 0 ? '' : ` (${attempt + 1})`;
    const finalPath = path.join(outputDir, `${stem}${suffix}${extension}`);
    const temporaryPath = `${finalPath}.part`;
    if (fsSync.existsSync(finalPath)) continue;
    try {
      await fs.writeFile(temporaryPath, Buffer.alloc(0), { flag: 'wx' });
      return { finalPath, temporaryPath };
    } catch (error) {
      if (error?.code !== 'EEXIST') throw error;
    }
  }
  throw new Error('Unable to reserve a recording file name.');
}

function resolveRecordingFfmpegExecutable() {
  const executableName = process.platform === 'win32' ? 'ffmpeg.exe' : 'ffmpeg';
  const candidates = app.isPackaged
    ? [path.join(process.resourcesPath, 'vendor', 'bin', executableName)]
    : [path.join(__dirname, '..', 'build', 'vendor', 'bin', executableName)];
  return candidates.find((candidate) => fsSync.existsSync(candidate)) || null;
}

async function remuxRecordingFile(filePath) {
  const ffmpeg = resolveRecordingFfmpegExecutable();
  if (!ffmpeg) return false;
  const extension = path.extname(filePath) || '.webm';
  const remuxPath = path.join(
    path.dirname(filePath),
    `.${path.basename(filePath, extension)}.remux-${process.pid}-${Date.now()}${extension}`,
  );
  try {
    const code = await new Promise((resolve, reject) => {
      const child = spawn(ffmpeg, [
        '-hide_banner', '-loglevel', 'error', '-y',
        '-i', filePath,
        '-map', '0', '-c', 'copy', '-fflags', '+genpts',
        remuxPath,
      ], {
        stdio: ['ignore', 'ignore', 'pipe'],
        windowsHide: true,
      });
      let stderr = '';
      child.stderr.setEncoding('utf8');
      child.stderr.on('data', (chunk) => { stderr = `${stderr}${chunk}`.slice(-4000); });
      child.once('error', reject);
      child.once('close', (exitCode) => {
        if (exitCode === 0) resolve(exitCode);
        else reject(new Error(stderr.trim() || `FFmpeg remux exited with code ${exitCode}.`));
      });
    });
    if (code !== 0) return false;
    const remuxStat = await fs.stat(remuxPath);
    if (remuxStat.size <= 0) return false;
    await fs.copyFile(remuxPath, filePath);
    return true;
  } catch {
    return false;
  } finally {
    await fs.unlink(remuxPath).catch(() => {});
  }
}

function recordingEventPayload(recording, payload) {
  return {
    ...payload,
    sessionId: recording.id,
    jobId: recording.id,
    url: recording.pageUrl,
    pageUrl: recording.pageUrl,
    pageTitle: recording.pageTitle,
    fileName: path.basename(recording.finalPath),
    path: recording.finalPath,
    savePath: path.dirname(recording.finalPath),
    thumbnailUrl: recording.thumbnailUrl,
    quality: recording.quality,
    source: 'recording',
  };
}

function sendRecordingEvent(recording, payload) {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  mainWindow.webContents.send('recording:event', recordingEventPayload(recording, payload));
}

function recordingForEvent(event, sessionId) {
  const recording = activeRecordingSessions.get(String(sessionId || ''));
  if (!recording || recording.finished) throw new Error('Recording session not found.');
  if (recording.senderId !== event.sender.id) throw new Error('Recording session sender mismatch.');
  return recording;
}

async function completeRecording(recording, detail = {}) {
  if (recording.finishPromise) return recording.finishPromise;
  recording.finishPromise = (async () => {
    await recording.writeChain;
    if (recording.writeError) throw recording.writeError;
    if (recording.bytes <= 0) throw new Error('Recording produced no media data.');
    await fs.rename(recording.temporaryPath, recording.finalPath);
    recording.remuxed = await remuxRecordingFile(recording.finalPath);
    if (recording.remuxed) {
      const remuxedStat = await fs.stat(recording.finalPath);
      recording.bytes = remuxedStat.size;
    }
    recording.finished = true;
    activeRecordingSessions.delete(recording.id);
    sendRecordingEvent(recording, {
      type: 'progress',
      data: {
        filename: recording.finalPath,
        percent: 100,
        status: 'finished',
        downloaded_bytes: recording.bytes,
        total_bytes: recording.bytes,
        duration_ms: Math.max(0, Number(detail.durationMs) || recording.durationMs || 0),
      },
    });
    sendRecordingEvent(recording, {
      type: 'done',
      downloaded: 1,
      failed: 0,
      bytes: recording.bytes,
      durationMs: Math.max(0, Number(detail.durationMs) || recording.durationMs || 0),
      reason: detail.reason || 'completed',
      remuxed: recording.remuxed,
    });
    pumpDownloadQueue();
    sendDownloadQueueState();
    return {
      ok: true,
      sessionId: recording.id,
      path: recording.finalPath,
      bytes: recording.bytes,
      remuxed: recording.remuxed,
    };
  })().catch(async (error) => {
    await abortRecording(recording, error?.message || String(error));
    throw error;
  });
  return recording.finishPromise;
}

async function abortRecording(recording, errorMessage = 'Recording stopped.') {
  if (!recording || recording.finished) return { ok: false, sessionId: recording?.id || null };
  recording.finished = true;
  activeRecordingSessions.delete(recording.id);
  try { await recording.writeChain; } catch { /* the original write error is reported below */ }
  await fs.unlink(recording.temporaryPath).catch(() => {});
  sendRecordingEvent(recording, { type: 'error', message: String(errorMessage || 'Recording failed.') });
  pumpDownloadQueue();
  sendDownloadQueueState();
  return { ok: false, sessionId: recording.id };
}

function finishRecordingsForSender(senderId) {
  for (const recording of activeRecordingSessions.values()) {
    if (recording.senderId !== senderId || recording.finished) continue;
    if (recording.bytes > 0) {
      void completeRecording(recording, { reason: 'webview-closed', durationMs: recording.durationMs })
        .catch(() => {});
    } else {
      void abortRecording(recording, 'The video page closed before media data was recorded.');
    }
  }
}

function sendDownloadQueueState() {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  mainWindow.webContents.send('download:state', getDownloadQueueState());
}

function releaseDownloadJobCookie(job) {
  if (job.cookieReleased) return;
  job.cookieReleased = true;
  job.cookieGroup.remaining -= 1;
  if (job.cookieGroup.remaining <= 0) void fs.unlink(job.cookieGroup.path).catch(() => {});
}

function sendDownloadJobEvent(job, payload) {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  mainWindow.webContents.send('download:event', {
    ...payload,
    jobId: job.id,
    requestKey: job.requestKey,
    url: job.url,
  });
}

async function repairDailymotionPlayback() {
  const browserSession = getBrowserSession();
  await Promise.allSettled([
    browserSession.clearCache(),
    browserSession.clearStorageData({
      origin: 'https://www.dailymotion.com',
      storages: ['serviceworkers', 'cachestorage'],
    }),
  ]);
  return { repaired: true };
}

async function inspectBrowserFrames(webContentsId) {
  const id = Number(webContentsId);
  if (!Number.isInteger(id) || id <= 0) return [];
  const guest = webContents.fromId(id);
  if (!guest || guest.isDestroyed() || guest.getType() !== 'webview') return [];
  const mainFrame = guest.mainFrame;
  const frames = [mainFrame, ...(mainFrame?.framesInSubtree || [])].filter(Boolean);
  const uniqueFrames = Array.from(new Map(frames.map((frame) => [`${frame.processId}:${frame.routingId}`, frame])).values());
  return Promise.all(uniqueFrames.map(async (frame) => {
    const status = await frame.executeJavaScript(`(() => {
      const copy = String(document.body?.innerText || '');
      const video = document.querySelector('video');
      return {
        hasPlaybackError: /playback error|please check your internet connection/i.test(copy),
        hasAntiAdblockText: /(?:ad blocker|adblock|\u5e7f\u544a\u62e6\u622a)/i.test(copy),
        cosmeticStylePresent: Boolean(document.querySelector('style[id="__vidogo_cosmetic_ad_css"]')),
        text: copy.replace(/\s+/g, ' ').trim().slice(0, 240),
        codecSupport: {
          h264: document.createElement('video').canPlayType('video/mp4; codecs="avc1.42E01E, mp4a.40.2"'),
          hls: document.createElement('video').canPlayType('application/vnd.apple.mpegurl'),
          mseH264: typeof MediaSource !== 'undefined' && MediaSource.isTypeSupported('video/mp4; codecs="avc1.42E01E, mp4a.40.2"'),
        },
        video: video ? {
          paused: video.paused,
          ended: video.ended,
          readyState: video.readyState,
          networkState: video.networkState,
          currentTime: video.currentTime,
          currentSrc: video.currentSrc,
          error: video.error ? { code: video.error.code, message: video.error.message } : null,
        } : null,
      };
    })()`, true).catch(() => null);
    return { url: frame.url, ...(status || {}) };
  }));
}

const DIRECT_MEDIA_HOST_SUFFIXES = [
  'tiktok.com',
  'tiktokcdn.com',
  'tiktokcdn-us.com',
  'muscdn.com',
  'byteoversea.com',
  'douyin.com',
  'douyinvod.com',
  'bytecdn.cn',
  'byteimg.com',
  'zjcdn.com',
  'toutiao50.com',
];

function isTrustedDirectMediaUrl(value) {
  try {
    const parsed = new URL(String(value || '').trim());
    const host = parsed.hostname.toLowerCase();
    return parsed.protocol === 'https:'
      && !parsed.username
      && !parsed.password
      && DIRECT_MEDIA_HOST_SUFFIXES.some((suffix) => host === suffix || host.endsWith('.' + suffix));
  } catch {
    return false;
  }
}

function safeDirectDownloadStem(value) {
  const cleaned = String(value || 'TikTok video')
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/[. ]+$/g, '')
    .trim()
    .slice(0, 120);
  const fallback = cleaned || 'TikTok video';
  return /^(?:con|prn|aux|nul|com[1-9]|lpt[1-9])$/i.test(fallback) ? '_' + fallback : fallback;
}

async function reserveDirectDownloadPaths(outputDir, title) {
  const root = path.resolve(String(outputDir || '').trim() || path.join(app.getPath('downloads'), APP_NAME));
  await fs.mkdir(root, { recursive: true });
  const date = new Date().toISOString().slice(0, 10).replaceAll('-', '');
  const stem = date + ' - ' + safeDirectDownloadStem(title);
  for (let index = 0; index < 1000; index += 1) {
    const suffix = index ? ' (' + (index + 1) + ')' : '';
    const taskDir = path.join(root, stem + suffix);
    try {
      await fs.mkdir(taskDir);
      return {
        taskDir,
        finalPath: path.join(taskDir, 'video.mp4'),
        temporaryPath: path.join(taskDir, '.video.download'),
      };
    } catch (error) {
      if (error?.code !== 'EEXIST') throw error;
    }
  }
  throw new Error('Could not reserve a download folder.');
}

function openDirectMediaResponse(url, signal, headers = {}, timeoutMs = 20_000, onRedirect = null) {
  return new Promise((resolve, reject) => {
    const request = net.request({
      method: 'GET',
      url,
      // File transfers use an isolated Electron session. Browser-page ad
      // filtering is registered only on BROWSER_PARTITION and must never be
      // able to cancel an app-owned background media transfer.
      session: getBackgroundDownloadSession(),
    });
    for (const [name, value] of Object.entries(headers)) {
      if (value !== undefined && value !== null && value !== '') request.setHeader(name, String(value));
    }
    let responseStream = null;
    let settled = false;
    const cleanup = () => signal?.removeEventListener('abort', abort);
    const abort = () => {
      request.abort();
      responseStream?.destroy?.(new Error('Download paused or cancelled.'));
    };
    if (signal?.aborted) {
      abort();
      reject(new Error('Download paused or cancelled.'));
      return;
    }
    signal?.addEventListener('abort', abort, { once: true });
    const responseTimeout = setTimeout(() => {
      if (settled) return;
      settled = true;
      abort();
      cleanup();
      reject(new Error('Media server connection timed out.'));
    }, timeoutMs);
    request.once('response', (response) => {
      if (settled) return;
      settled = true;
      clearTimeout(responseTimeout);
      responseStream = response;
      response.once('close', cleanup);
      response.once('end', cleanup);
      resolve(response);
    });
    request.once('error', (error) => {
      if (settled) return;
      settled = true;
      clearTimeout(responseTimeout);
      cleanup();
      reject(error);
    });
    request.on('redirect', (_statusCode, _method, redirectUrl) => {
      onRedirect?.(redirectUrl);
      request.followRedirect();
    });
    request.end();
  });
}

async function directMediaRequestHeaders(url, referrer, includeRange = false) {
  const cookies = await getBrowserSession().cookies.get({ url }).catch(() => []);
  return {
    Accept: '*/*',
    'Accept-Encoding': 'identity',
    Referer: referrer || 'https://www.tiktok.com/',
    'User-Agent': getBrowserSession().getUserAgent(),
    ...(cookies.length ? { Cookie: cookies.map((cookie) => cookie.name + '=' + cookie.value).join('; ') } : {}),
    ...(includeRange ? { Range: 'bytes=0-' } : {}),
  };
}

function directResponseHeader(response, name) {
  const value = response?.headers?.[String(name || '').toLowerCase()];
  return Array.isArray(value) ? value[0] : value || null;
}

async function downloadDirectThumbnail(taskDir, thumbnailUrl, referrer, signal) {
  if (!isTrustedDirectMediaUrl(thumbnailUrl)) return null;
  const thumbnailController = new AbortController();
  const forwardAbort = () => thumbnailController.abort();
  const timeout = setTimeout(() => thumbnailController.abort(), 8_000);
  signal?.addEventListener('abort', forwardAbort, { once: true });
  try {
    const headers = await directMediaRequestHeaders(thumbnailUrl, referrer);
    const response = await openDirectMediaResponse(thumbnailUrl, thumbnailController.signal, headers);
    if (response.statusCode < 200 || response.statusCode >= 300) return null;
    const contentType = String(directResponseHeader(response, 'content-type') || '').toLowerCase();
    const extension = contentType.includes('png') ? '.png'
      : (contentType.includes('webp') ? '.webp' : '.jpg');
    const chunks = [];
    let contentLength = 0;
    for await (const chunk of response) {
      contentLength += chunk.length;
      if (contentLength > 20 * 1024 * 1024) return null;
      chunks.push(chunk);
    }
    if (!contentLength) return null;
    const coverPath = path.join(taskDir, 'cover' + extension);
    await fs.writeFile(coverPath, Buffer.concat(chunks));
    return coverPath;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener('abort', forwardAbort);
  }
}

function failWebviewDownloadsForSender(senderId) {
  for (const job of activeDownloadJobs.values()) {
    if (job.finalized || !job.webviewStream || Number(job.task?.webContentsId) !== Number(senderId)) continue;
    void finalizeWebviewDirectDownloadJob(job, {
      error: new Error('The source video page was closed during download.'),
    });
  }
}

function spawnDirectDownloadJob(job) {
  const abortController = new AbortController();
  job.abortController = abortController;
  activeDownloadJobs.set(job.id, job);
  sendDownloadQueueState();
  void (async () => {
    const reserved = await reserveDirectDownloadPaths(job.task.outputDir, job.task.title);
    job.temporaryPath = reserved.temporaryPath;
    job.taskDir = reserved.taskDir;
    const startedAt = Date.now();
    let downloadedBytes = 0;
    let totalBytes = 0;
    let lastProgressAt = 0;
    let handle = null;
    const requestUrls = new Set([job.url]);
    const registerRequestUrl = (url) => {
      if (!url) return;
      requestUrls.add(url);
      programmaticMediaRequests.add(url);
    };
    try {
      registerRequestUrl(job.url);
      const headers = await directMediaRequestHeaders(job.url, job.task.referrer, true);
      const response = await openDirectMediaResponse(job.url, abortController.signal, headers, 20_000, registerRequestUrl);
      if (response.statusCode < 200 || response.statusCode >= 300) {
        throw new Error('Direct media request failed with HTTP ' + response.statusCode + '.');
      }
      totalBytes = Math.max(0, Number(directResponseHeader(response, 'content-length') || 0));
      handle = await fs.open(reserved.temporaryPath, 'w');
      for await (const chunk of response) {
        if (job.cancelled) throw new Error('Download cancelled.');
        await handle.write(chunk);
        downloadedBytes += chunk.length;
        const now = Date.now();
        if (now - lastProgressAt < 250) continue;
        lastProgressAt = now;
        const elapsedSeconds = Math.max(0.001, (now - startedAt) / 1000);
        sendDownloadJobEvent(job, {
          type: 'progress',
          data: {
            item_index: 1,
            item_total: 1,
            percent: totalBytes > 0 ? Math.min(99, downloadedBytes / totalBytes * 100) : 0,
            status: 'downloading',
            filename: reserved.finalPath,
            downloaded_bytes: downloadedBytes,
            total_bytes: totalBytes || null,
            speed: downloadedBytes / elapsedSeconds,
            eta: totalBytes > downloadedBytes ? (totalBytes - downloadedBytes) / (downloadedBytes / elapsedSeconds) : 0,
          },
        });
      }
      await handle.close();
      handle = null;
      if (!downloadedBytes) throw new Error('Direct media request returned no data.');
      await fs.rename(reserved.temporaryPath, reserved.finalPath);
      const coverPath = await downloadDirectThumbnail(
        reserved.taskDir,
        job.task.thumbnailUrl,
        job.task.referrer,
        abortController.signal,
      );
      sendDownloadJobEvent(job, {
        type: 'progress',
        data: {
          item_index: 1,
          item_total: 1,
          percent: 100,
          status: 'completed',
          filename: reserved.finalPath,
          task_dir: reserved.taskDir,
          thumbnail_filename: coverPath,
          downloaded_bytes: downloadedBytes,
          total_bytes: downloadedBytes,
          speed: 0,
          eta: 0,
        },
      });
      sendDownloadJobEvent(job, { type: 'done', downloaded: 1, failed: 0 });
    } catch (error) {
      if (handle) await handle.close().catch(() => {});
      await fs.unlink(reserved.temporaryPath).catch(() => {});
      await fs.rmdir(reserved.taskDir).catch(() => {});
      if (!job.cancelled) {
        sendDownloadJobEvent(job, { type: 'error', message: error?.message || String(error) });
      }
    } finally {
      for (const requestUrl of requestUrls) programmaticMediaRequests.delete(requestUrl);
      activeDownloadJobs.delete(job.id);
      releaseDownloadJobCookie(job);
      pumpDownloadQueue();
      sendDownloadQueueState();
    }
  })();
}

async function finalizeWebviewDirectDownloadJob(job, outcome = {}) {
  if (job.finalized) return;
  job.finalized = true;
  const stream = job.webviewStream;
  if (stream) {
    clearTimeout(stream.inactivityTimer);
    await stream.writeChain.catch(() => {});
    if (stream.handle) {
      await stream.handle.close().catch(() => {});
      stream.handle = null;
    }
  }
  try {
    if (outcome.success) {
      if (!stream?.downloadedBytes) throw new Error('Direct media request returned no data.');
      await fs.rename(stream.reserved.temporaryPath, stream.reserved.finalPath);
      const coverPath = await downloadDirectThumbnail(
        stream.reserved.taskDir,
        job.task.thumbnailUrl,
        job.task.referrer,
        null,
      );
      sendDownloadJobEvent(job, {
        type: 'progress',
        data: {
          item_index: 1,
          item_total: 1,
          percent: 100,
          status: 'completed',
          filename: stream.reserved.finalPath,
          task_dir: stream.reserved.taskDir,
          thumbnail_filename: coverPath,
          downloaded_bytes: stream.downloadedBytes,
          total_bytes: stream.downloadedBytes,
          speed: 0,
          eta: 0,
        },
      });
      sendDownloadJobEvent(job, { type: 'done', downloaded: 1, failed: 0 });
    } else {
      if (stream?.reserved?.temporaryPath) await fs.unlink(stream.reserved.temporaryPath).catch(() => {});
      if (stream?.reserved?.taskDir) await fs.rmdir(stream.reserved.taskDir).catch(() => {});
      if (!job.cancelled && outcome.error) {
        sendDownloadJobEvent(job, { type: 'error', message: outcome.error?.message || String(outcome.error) });
      }
    }
  } catch (error) {
    if (stream?.reserved?.temporaryPath) await fs.unlink(stream.reserved.temporaryPath).catch(() => {});
    if (stream?.reserved?.taskDir) await fs.rmdir(stream.reserved.taskDir).catch(() => {});
    if (!job.cancelled) sendDownloadJobEvent(job, { type: 'error', message: error?.message || String(error) });
  } finally {
    activeDownloadJobs.delete(job.id);
    releaseDownloadJobCookie(job);
    pumpDownloadQueue();
    sendDownloadQueueState();
  }
}

function armWebviewDownloadTimeout(job) {
  const stream = job.webviewStream;
  if (!stream || job.finalized) return;
  clearTimeout(stream.inactivityTimer);
  stream.inactivityTimer = setTimeout(() => {
    let guest = null;
    try { guest = webContents.fromId(Number(job.task.webContentsId)); } catch { guest = null; }
    if (guest && !guest.isDestroyed()) guest.send('browser:cancel-direct-download', { jobId: job.id });
    void finalizeWebviewDirectDownloadJob(job, { error: new Error('Media server connection timed out.') });
  }, 30_000);
}

function spawnWebviewDirectDownloadJob(job) {
  let guest = null;
  try { guest = webContents.fromId(Number(job.task.webContentsId)); } catch { guest = null; }
  if (!guest || guest.isDestroyed() || guest.getType() !== 'webview') {
    spawnDirectDownloadJob(job);
    return;
  }
  job.abortController = {
    abort: () => {
      if (!guest.isDestroyed()) guest.send('browser:cancel-direct-download', { jobId: job.id });
      job.abortPromise = finalizeWebviewDirectDownloadJob(job, { cancelled: true });
      return job.abortPromise;
    },
  };
  activeDownloadJobs.set(job.id, job);
  sendDownloadQueueState();
  void (async () => {
    const reserved = await reserveDirectDownloadPaths(job.task.outputDir, job.task.title);
    job.temporaryPath = reserved.temporaryPath;
    job.taskDir = reserved.taskDir;
    if (job.cancelled || job.finalized) {
      await fs.rmdir(reserved.taskDir).catch(() => {});
      return;
    }
    const handle = await fs.open(reserved.temporaryPath, 'w');
    job.webviewStream = {
      reserved,
      handle,
      writeChain: Promise.resolve(),
      downloadedBytes: 0,
      totalBytes: Math.max(0, Number(job.task.sizeBytes || 0)),
      startedAt: Date.now(),
      lastProgressAt: 0,
      inactivityTimer: null,
    };
    armWebviewDownloadTimeout(job);
    guest.send('browser:start-direct-download', {
      jobId: job.id,
      url: job.url,
    });
  })().catch((error) => finalizeWebviewDirectDownloadJob(job, { error }));
}

function spawnDownloadWorker(job) {
  const { task } = job;
  const launch = resolveWorkerLaunch('download');
  const proc = spawn(launch.command, launch.args, {
    stdio: ['pipe', 'pipe', 'pipe'],
    windowsHide: true,
    env: launch.env,
  });

  job.process = proc;
  job.stdoutBuffer = '';
  job.reportedTerminalEvent = false;
  activeDownloadJobs.set(job.id, job);
  sendDownloadQueueState();

  const forwardLine = (line) => {
    const trimmed = line.trim();
    if (!trimmed) return;
    try {
      const payload = JSON.parse(trimmed);
      if (payload?.type === 'done' || payload?.type === 'error') job.reportedTerminalEvent = true;
      sendDownloadJobEvent(job, payload);
    } catch {
      sendDownloadJobEvent(job, { type: 'log', message: trimmed });
    }
  };

  proc.stdout.setEncoding('utf8');
  proc.stdout.on('data', (chunk) => {
    job.stdoutBuffer += chunk;
    const parts = job.stdoutBuffer.split(/\r?\n/);
    job.stdoutBuffer = parts.pop() || '';
    for (const line of parts) forwardLine(line);
  });

  proc.stderr.setEncoding('utf8');
  proc.stderr.on('data', (chunk) => {
    const text = String(chunk).trim();
    if (text) sendDownloadJobEvent(job, { type: 'log', message: text });
  });

  let finalized = false;
  const finalize = (code, spawnError = null) => {
    if (finalized) return;
    finalized = true;
    if (job.stdoutBuffer.trim()) {
      forwardLine(job.stdoutBuffer);
    }
    activeDownloadJobs.delete(job.id);
    if (!job.cancelled && (spawnError || code !== 0) && !job.reportedTerminalEvent) {
      sendDownloadJobEvent(job, {
        type: 'error',
        message: spawnError?.message || `Download worker exited with code ${code}.`,
      });
    }
    releaseDownloadJobCookie(job);
    pumpDownloadQueue();
    sendDownloadQueueState();
  };
  proc.once('error', (error) => finalize(null, error));
  proc.once('close', (code) => finalize(code));
  proc.stdin.once('error', (error) => finalize(null, error));

  proc.stdin.end(JSON.stringify({
    ...task,
    cookieFile: job.cookieGroup.path,
    jsRuntimePath: process.execPath,
  }));
}

function retainProgrammaticBrowserDownloadSource(sourceId) {
  const id = Number(sourceId || 0);
  if (!Number.isInteger(id) || id <= 0) return;
  programmaticBrowserDownloadSources.set(id, (programmaticBrowserDownloadSources.get(id) || 0) + 1);
}

function releaseProgrammaticBrowserDownloadSource(sourceId) {
  const id = Number(sourceId || 0);
  const remaining = (programmaticBrowserDownloadSources.get(id) || 0) - 1;
  if (remaining > 0) programmaticBrowserDownloadSources.set(id, remaining);
  else programmaticBrowserDownloadSources.delete(id);
}

function spawnBrowserDownloadJob(job) {
  activeDownloadJobs.set(job.id, job);
  sendDownloadQueueState();
  void (async () => {
    const reserved = await reserveDirectDownloadPaths(job.task.outputDir, job.task.title);
    const guestId = Number(job.task.webContentsId);
    let guest = null;
    try {
      guest = Number.isInteger(guestId) && guestId > 0 ? webContents.fromId(guestId) : null;
    } catch {
      guest = null;
    }
    if (!guest || guest.isDestroyed()) throw new Error('The source tab is no longer available.');
    await new Promise((resolve, reject) => {
      const browserSession = getBrowserSession();
      let item = null;
      let settled = false;
      let inactivityTimer = null;
      let interruptionRetries = 0;
      let sourcePermitHeld = true;
      const releaseSourcePermit = () => {
        if (!sourcePermitHeld) return;
        sourcePermitHeld = false;
        releaseProgrammaticBrowserDownloadSource(guestId);
      };
      const finish = (error = null) => {
        if (settled) return;
        settled = true;
        clearTimeout(startTimeout);
        clearTimeout(inactivityTimer);
        browserSession.removeListener('will-download', onWillDownload);
        programmaticBrowserDownloads.delete(`${guestId}\u0000${job.url}`);
        releaseSourcePermit();
        if (error) reject(error);
        else resolve();
      };
      const armInactivityTimeout = () => {
        clearTimeout(inactivityTimer);
        inactivityTimer = setTimeout(() => {
          item?.cancel();
          finish(new Error('Media server connection timed out.'));
        }, 30_000);
      };
      const startTimeout = setTimeout(() => {
        finish(new Error('The browser did not start the media download.'));
      }, 12_000);
      const onWillDownload = (_event, downloadItem, sourceContents) => {
        const urlChain = typeof downloadItem.getURLChain === 'function' ? downloadItem.getURLChain() : [downloadItem.getURL()];
        if (sourceContents?.id !== guestId || (!urlChain.includes(job.url) && downloadItem.getURL() !== job.url)) return;
        clearTimeout(startTimeout);
        browserSession.removeListener('will-download', onWillDownload);
        releaseSourcePermit();
        item = downloadItem;
        job.downloadItem = downloadItem;
        downloadItem.setSavePath(reserved.temporaryPath);
        downloadItem.on('updated', (_downloadEvent, stateValue) => {
          if (stateValue === 'interrupted') {
            if (!job.cancelled && downloadItem.canResume() && interruptionRetries < 3) {
              interruptionRetries += 1;
              armInactivityTimeout();
              setTimeout(() => {
                if (!settled && !job.cancelled && downloadItem.canResume()) downloadItem.resume();
              }, 400 * interruptionRetries);
              return;
            }
            finish(new Error(job.cancelled ? 'Download cancelled.' : 'Browser media download was interrupted.'));
            return;
          }
          armInactivityTimeout();
          const received = downloadItem.getReceivedBytes();
          const total = downloadItem.getTotalBytes();
          sendDownloadJobEvent(job, {
            type: 'progress',
            data: {
              item_index: 1,
              item_total: 1,
              percent: total > 0 ? Math.min(99, received / total * 100) : 0,
              status: 'downloading',
              filename: reserved.finalPath,
              downloaded_bytes: received,
              total_bytes: total || null,
              speed: 0,
              eta: 0,
            },
          });
        });
        downloadItem.once('done', (_downloadEvent, stateValue) => {
          if (stateValue === 'completed') finish();
          else finish(new Error(stateValue === 'cancelled' ? 'Download cancelled.' : 'Browser media download failed.'));
        });
        armInactivityTimeout();
      };
      browserSession.on('will-download', onWillDownload);
      programmaticBrowserDownloads.add(`${guestId}\u0000${job.url}`);
      retainProgrammaticBrowserDownloadSource(guestId);
      programmaticMediaRequests.add(job.url);
      try {
        guest.downloadURL(job.url, {
          headers: job.task.referrer ? { Referer: job.task.referrer } : undefined,
        });
      } catch (error) {
        finish(error);
      }
    });
    await fs.rename(reserved.temporaryPath, reserved.finalPath);
    const fileStat = await fs.stat(reserved.finalPath);
    sendDownloadJobEvent(job, {
      type: 'progress',
      data: {
        item_index: 1,
        item_total: 1,
        percent: 100,
        status: 'completed',
        filename: reserved.finalPath,
        task_dir: reserved.taskDir,
        thumbnail_filename: null,
        downloaded_bytes: fileStat.size,
        total_bytes: fileStat.size,
        speed: 0,
        eta: 0,
      },
    });
    sendDownloadJobEvent(job, { type: 'done', downloaded: 1, failed: 0 });
  })().catch(async (error) => {
    if (job.temporaryPath) await fs.unlink(job.temporaryPath).catch(() => {});
    if (job.taskDir) await fs.rmdir(job.taskDir).catch(() => {});
    if (!job.cancelled) sendDownloadJobEvent(job, { type: 'error', message: error?.message || String(error) });
  }).finally(() => {
    programmaticMediaRequests.delete(job.url);
    if (job.task.backgroundResolvedMedia) releaseRetainedMediaResolver(job.task.webContentsId);
    activeDownloadJobs.delete(job.id);
    releaseDownloadJobCookie(job);
    pumpDownloadQueue();
    sendDownloadQueueState();
  });
}

function spawnResolvedPageDownloadJob(job) {
  job.phase = 'resolving';
  activeDownloadJobs.set(job.id, job);
  sendDownloadQueueState();
  sendDownloadJobEvent(job, {
    type: 'progress',
    data: {
      item_index: 1,
      item_total: 1,
      percent: 0,
      status: 'resolving',
      filename: null,
      downloaded_bytes: 0,
      total_bytes: null,
      speed: 0,
      eta: 0,
    },
  });
  void (async () => {
    const result = await resolvePageMediaInBackground({
      pageUrl: job.url,
      title: job.task.title,
      fileName: job.task.title,
      thumbnailUrl: job.task.thumbnailUrl,
      timeoutMs: 22_000,
    });
    if (!result?.ok || !result.candidate?.url) {
      throw new Error(result?.message || '未能解析到该分集的真实视频资源。');
    }
    if (job.cancelled) {
      releaseRetainedMediaResolver(result.candidate.webContentsId);
      activeDownloadJobs.delete(job.id);
      releaseDownloadJobCookie(job);
      pumpDownloadQueue();
      sendDownloadQueueState();
      return;
    }
    const candidate = result.candidate;
    job.url = candidate.url;
    job.phase = 'connecting';
    Object.assign(job.task, {
      directDownload: true,
      backgroundResolvedMedia: true,
      sourceClient: 'background-resolver',
      kind: candidate.kind || 'video',
      mimeType: candidate.mimeType || candidate.mime || 'video/mp4',
      sizeBytes: Math.max(0, Number(candidate.sizeBytes || candidate.size || 0)),
      referrer: candidate.referrer || job.task.referrer,
      webContentsId: candidate.webContentsId,
    });
    sendDownloadJobEvent(job, {
      type: 'progress',
      data: {
        item_index: 1,
        item_total: 1,
        percent: 0,
        status: 'connecting',
        filename: null,
        downloaded_bytes: 0,
        total_bytes: job.task.sizeBytes || null,
        speed: 0,
        eta: 0,
        source_client: 'background-resolver',
      },
    });
    spawnBrowserDownloadJob(job);
  })().catch((error) => {
    if (!job.cancelled) sendDownloadJobEvent(job, { type: 'error', message: error?.message || String(error) });
    activeDownloadJobs.delete(job.id);
    releaseDownloadJobCookie(job);
    pumpDownloadQueue();
    sendDownloadQueueState();
  });
}

function pumpDownloadQueue() {
  while (activeDownloadJobs.size + activeRecordingSessions.size < downloadConcurrencyLimit && queuedDownloadJobs.length > 0) {
    const job = queuedDownloadJobs.shift();
    if (!job || job.cancelled) {
      if (job) releaseDownloadJobCookie(job);
      continue;
    }
    try {
      if (job.task.backgroundResolvePage) {
        spawnResolvedPageDownloadJob(job);
      } else if (job.task.directDownload && job.task.nativeBrowserDownload) {
        spawnBrowserDownloadJob(job);
      } else if (job.task.directDownload && job.task.backgroundResolvedMedia && job.task.webContentsId) {
        spawnBrowserDownloadJob(job);
      } else if (job.task.directDownload
        && job.task.sourceClient === 'douyin-page'
        && job.task.webContentsId) {
        spawnBrowserDownloadJob(job);
      } else if (job.task.directDownload
        && /^(?:tiktok|douyin)-page$/.test(job.task.sourceClient || '')
        && job.task.webContentsId) {
        spawnWebviewDirectDownloadJob(job);
      } else if (job.task.directDownload) {
        spawnDirectDownloadJob(job);
      } else {
        spawnDownloadWorker(job);
      }
    } catch (error) {
      sendDownloadJobEvent(job, { type: 'error', message: error?.message || String(error) });
      releaseDownloadJobCookie(job);
    }
  }
  sendDownloadQueueState();
}

function resolveUrl(input) {
  const trimmed = String(input || '').trim();
  if (!trimmed) return '';
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

app.setName(IS_SMOKE_TEST ? `${APP_NAME} Smoke ${process.pid}` : APP_NAME);
app.setAppUserModelId(IS_SMOKE_TEST ? `${APP_ID}.smoke.${process.pid}` : APP_ID);
app.commandLine.appendSwitch('disable-features', 'CalculateNativeWinOcclusion');
// Match VidBrowser's Windows playback compatibility profile. Hybrid/older GPU
// drivers can decode YouTube audio while presenting a permanently black video
// surface; Chromium's software decoder avoids that broken hardware path.
app.commandLine.appendSwitch('disable-gpu-shader-disk-cache');
app.commandLine.appendSwitch('disable-accelerated-video-decode');

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
}

app.on('second-instance', () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
});

app.on('web-contents-created', (_event, contents) => {
  if (contents.getType() !== 'webview') return;
  contents.setWindowOpenHandler(({ url }) => {
    const disposition = classifyBrowserWindowOpen(url, contents.getURL());
    if (disposition === 'allow-popup') {
      return {
        action: 'allow',
        overrideBrowserWindowOptions: {
          backgroundColor: '#ffffff',
          autoHideMenuBar: true,
          width: 520,
          height: 720,
        },
      };
    }
    if (disposition === 'allow-hidden-popup') {
      return { action: 'allow', overrideBrowserWindowOptions: { show: false, skipTaskbar: true } };
    }
    if (disposition === 'open-app-tab' && mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('browser:open-new-tab', url);
    }
    return { action: 'deny' };
  });
  contents.once('destroyed', () => {
    finishRecordingsForSender(contents.id);
    failWebviewDownloadsForSender(contents.id);
  });
});

app.whenReady().then(async () => {
  await ensureUserDataPath();
  configureBrowserIdentity();
  registerBrowserRequestFeatures();
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', () => {
  for (const job of queuedDownloadJobs.splice(0)) {
    job.cancelled = true;
    releaseDownloadJobCookie(job);
  }
  for (const job of activeDownloadJobs.values()) {
    job.cancelled = true;
    job.process?.kill();
  }
  for (const recording of activeRecordingSessions.values()) {
    recording.finished = true;
    try { fsSync.unlinkSync(recording.temporaryPath); } catch { /* best-effort shutdown cleanup */ }
  }
  activeRecordingSessions.clear();
  for (const resolverId of [...retainedMediaResolvers.keys()]) releaseRetainedMediaResolver(resolverId);
});

ipcMain.handle('app:get-system-locale', () => app.getLocale());

ipcMain.handle('app:get-default-download-dir', () => (IS_SMOKE_TEST
  ? path.join(USER_DATA_PATH, 'SmokeDownloads')
  : path.join(app.getPath('downloads'), APP_NAME)));

ipcMain.handle('app:get-runtime-info', () => getRuntimeInfo());
ipcMain.handle('app:get-legacy-info', () => getLegacyInfo());

ipcMain.handle('session:reset-browser', async () => {
  await resetBrowserSession();
  return getRuntimeInfo();
});

ipcMain.handle('browser:set-preferred-language', (_event, locale) => {
  if (typeof locale !== 'string' || !ACCEPT_LANGUAGE_BY_LOCALE[locale]) {
    return browserAcceptLanguage;
  }
  browserPreferredLocale = locale;
  browserAcceptLanguage = ACCEPT_LANGUAGE_BY_LOCALE[locale];
  for (const contents of webContents.getAllWebContents()) {
    if (!contents.isDestroyed() && contents.getType() === 'webview') {
      contents.send('browser:preferred-locale-changed', browserPreferredLocale);
    }
  }
  return browserAcceptLanguage;
});

ipcMain.handle('browser:get-preferred-locale', () => browserPreferredLocale);
ipcMain.handle('recording:get-enabled', () => recordingEnabled);
ipcMain.handle('browser:get-ad-blocker-enabled', (event) => (
  browserAdBlockerEnabled && !frameUsesAdSupportedPlayback(event.senderFrame)
));

ipcMain.handle('browser:set-ad-blocker-enabled', (_event, enabled) => {
  browserAdBlockerEnabled = enabled !== false;
  sendAdBlockerState();
  return browserAdBlockerEnabled;
});

ipcMain.handle('browser:repair-dailymotion-playback', () => repairDailymotionPlayback());
ipcMain.handle('browser:inspect-frames', (_event, webContentsId) => inspectBrowserFrames(webContentsId));
ipcMain.handle('browser:get-blocked-request-diagnostics', () => blockedRequestDiagnostics.slice());
ipcMain.handle('browser:get-dailymotion-request-diagnostics', () => dailymotionRequestDiagnostics.slice());

ipcMain.handle('app:check-for-updates', () => checkForAppUpdates());

ipcMain.handle('account:get-config', () => ({ apiOrigin: ACCOUNT_API_ORIGIN, connected: Boolean(ACCOUNT_API_ORIGIN) }));
ipcMain.handle('account:register', (_event, credentials = {}) => accountRegister({ email: credentials.email, password: credentials.password }));
ipcMain.handle('account:login', (_event, credentials = {}) => accountLogin({ email: credentials.email, password: credentials.password }));
ipcMain.handle('account:current', () => accountCurrent());
ipcMain.handle('account:logout', () => accountLogout());
ipcMain.handle('account:list-orders', () => accountOrders());
ipcMain.handle('account:create-order', (_event, productCode) => accountCreateOrder(String(productCode || '')));
ipcMain.handle('account:change-password', (_event, payload = {}) => accountChangePassword(payload.currentPassword, payload.newPassword));
ipcMain.handle('account:catalog', () => accountCatalog());

function filterMediaCandidates(webContentsId = null) {
  const id = Number(webContentsId);
  const candidates = Array.from(mediaCandidates.values());
  if (!Number.isFinite(id) || id <= 0) return candidates;
  return candidates.filter((candidate) => Number(candidate.webContentsId) === id);
}

function resolverCandidateScore(candidate) {
  if (!candidate?.url) return -1;
  let score = 0;
  if (candidate.kind === 'playlist') score += 100;
  if (candidate.sourceClient === 'hls' || candidate.sourceClient === 'dash') score += 80;
  if (candidate.metadataSource === 'hls-manifest' || candidate.metadataSource === 'dash-manifest') score += 30;
  if (candidate.kind === 'video') score += 40;
  if (Number(candidate.size || 0) > 1024 * 1024) score += 10;
  return score;
}

async function requestResolverPlayback(contents) {
  if (!contents || contents.isDestroyed()) return;
  const script = `(() => {
    for (const video of document.querySelectorAll('video')) {
      video.muted = true;
      video.autoplay = true;
      void video.play().catch(() => {});
    }
    const selectors = [
      '.art-video-player .art-icon-play',
      '.art-video-player',
      '[class*="play" i]',
      '[aria-label*="play" i]',
      '[aria-label*="播放" i]',
      '[title*="play" i]',
      '[title*="播放" i]'
    ];
    for (const selector of selectors) {
      const control = document.querySelector(selector);
      if (control) { control.click?.(); break; }
    }
    return document.querySelectorAll('video').length;
  })()`;
  const frames = [];
  try {
    frames.push(contents.mainFrame);
    for (const frame of contents.mainFrame.framesInSubtree || []) {
      if (frame !== contents.mainFrame) frames.push(frame);
    }
  } catch { /* a frame may be replaced while the player initializes */ }
  await Promise.allSettled(frames.map((frame) => frame.executeJavaScript(script, true)));
}

function releaseRetainedMediaResolver(webContentsId) {
  const resolverId = Number(webContentsId || 0);
  const retained = retainedMediaResolvers.get(resolverId);
  if (!retained) return;
  retainedMediaResolvers.delete(resolverId);
  clearTimeout(retained.expiryTimer);
  if (!retained.window.isDestroyed()) retained.window.destroy();
}

function retainMediaResolver(resolver) {
  const resolverId = resolver.webContents.id;
  const expiryTimer = setTimeout(() => releaseRetainedMediaResolver(resolverId), 90_000);
  retainedMediaResolvers.set(resolverId, { window: resolver, expiryTimer });
  return resolverId;
}

async function resolverFailureDiagnostics(contents, resolverId) {
  if (!IS_SMOKE_TEST || !contents || contents.isDestroyed()) return null;
  const frameUrls = [];
  try {
    frameUrls.push(contents.mainFrame.url);
    for (const frame of contents.mainFrame.framesInSubtree || []) frameUrls.push(frame.url);
  } catch { /* frames may be replaced while collecting diagnostics */ }
  const page = await contents.executeJavaScript(`({
    href: location.href,
    title: document.title,
    readyState: document.readyState,
    text: String(document.body?.innerText || '').replace(/\\s+/g, ' ').trim().slice(0, 500),
    videos: document.querySelectorAll('video').length,
    iframes: Array.from(document.querySelectorAll('iframe')).map((frame) => frame.src).filter(Boolean).slice(0, 10)
  })`, true).catch(() => null);
  return {
    page,
    frameUrls: [...new Set(frameUrls.filter(Boolean))].slice(0, 20),
    candidates: filterMediaCandidates(resolverId).slice(0, 20).map((candidate) => ({
      url: candidate.url,
      kind: candidate.kind,
      mime: candidate.mime,
      size: candidate.size,
      sourceClient: candidate.sourceClient,
      requestReferrer: candidate.requestReferrer,
    })),
  };
}

async function resolvePageMediaInBackground(request = {}) {
  const pageUrl = normalizePageUrl(request.pageUrl || request.url);
  if (!pageUrl || !/^https?:\/\//i.test(pageUrl)) {
    return { ok: false, message: '无效的视频页面地址。' };
  }
  const requestedTimeout = Number(request.timeoutMs || 0);
  const timeoutMs = Math.max(5_000, Math.min(25_000, requestedTimeout || 14_000));
  const resolver = new BrowserWindow({
    show: true,
    skipTaskbar: true,
    focusable: false,
    opacity: 0,
    x: -32000,
    y: -32000,
    width: 1100,
    height: 760,
    backgroundColor: '#070c17',
    webPreferences: {
      partition: BROWSER_PARTITION,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      backgroundThrottling: false,
      autoplayPolicy: 'no-user-gesture-required',
    },
  });
  resolver.setMenuBarVisibility(false);
  resolver.setIgnoreMouseEvents(true);
  resolver.webContents.setAudioMuted(true);
  resolver.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  const resolverId = resolver.webContents.id;
  const startedAt = Date.now();
  let playbackTimer = null;
  let loadTimeout = null;
  let retainedForDownload = false;
  try {
    const loadDeadline = new Promise((_, reject) => {
      loadTimeout = setTimeout(() => {
        if (!resolver.isDestroyed()) resolver.webContents.stop();
        reject(new Error('分集页面加载超时。'));
      }, timeoutMs);
    });
    await Promise.race([
      resolver.loadURL(pageUrl, { extraHeaders: `Accept-Language: ${browserAcceptLanguage}\r\n` }),
      loadDeadline,
    ]);
    clearTimeout(loadTimeout);
    loadTimeout = null;
    await requestResolverPlayback(resolver.webContents);
    playbackTimer = setInterval(() => {
      void requestResolverPlayback(resolver.webContents);
    }, 900);
    while (Date.now() - startedAt < timeoutMs) {
      const candidate = filterMediaCandidates(resolverId)
        .filter((item) => item?.url && item.url !== pageUrl)
        .filter((item) => !item.detectedAt || new Date(item.detectedAt).getTime() >= startedAt - 1_000)
        .sort((left, right) => resolverCandidateScore(right) - resolverCandidateScore(left))[0];
      if (candidate && resolverCandidateScore(candidate) >= 40) {
        // Give manifest inspection a brief chance to attach variants and duration.
        if (candidate.kind === 'playlist') await new Promise((resolve) => setTimeout(resolve, 350));
        const latest = mediaCandidates.get(candidate.id) || candidate;
        let playerFrameUrl = null;
        try {
          playerFrameUrl = Array.from(resolver.webContents.mainFrame.framesInSubtree || [], (frame) => frame.url)
            .find((url) => url && normalizePageUrl(url) !== pageUrl) || null;
        } catch { /* the player frame may be replaced during handoff */ }
        retainMediaResolver(resolver);
        retainedForDownload = true;
        return {
          ok: true,
          candidate: {
            ...latest,
            title: String(request.title || latest.title || '').trim() || latest.title,
            fileName: String(request.fileName || request.title || latest.fileName || '').trim() || latest.fileName,
            thumbnailUrl: request.thumbnailUrl || latest.thumbnailUrl || null,
            pageUrl,
            referrer: latest.requestReferrer || playerFrameUrl || pageUrl,
            sourceClient: latest.kind === 'video' ? 'background-resolver' : latest.sourceClient,
            downloadStrategy: latest.kind === 'video' ? 'direct' : latest.downloadStrategy,
            // Keep the proven player context alive long enough for the
            // background download to originate from the same browser session.
            webContentsId: resolverId,
          },
        };
      }
      await new Promise((resolve) => setTimeout(resolve, 180));
    }
    return {
      ok: false,
      message: '未能从该分集页面解析到真实视频资源。',
      diagnostics: await resolverFailureDiagnostics(resolver.webContents, resolverId),
    };
  } catch (error) {
    return {
      ok: false,
      message: error?.message || '分集页面解析失败。',
      diagnostics: await resolverFailureDiagnostics(resolver.webContents, resolverId),
    };
  } finally {
    if (loadTimeout) clearTimeout(loadTimeout);
    if (playbackTimer) clearInterval(playbackTimer);
    for (const [candidateId, candidate] of mediaCandidates.entries()) {
      if (Number(candidate.webContentsId) === resolverId) mediaCandidates.delete(candidateId);
    }
    if (!retainedForDownload && !resolver.isDestroyed()) resolver.destroy();
  }
}

ipcMain.handle('media:get-candidates', (_event, webContentsId = null) => filterMediaCandidates(webContentsId));

ipcMain.handle('media:resolve-page', (_event, request = {}) => resolvePageMediaInBackground(request));

ipcMain.handle('media:extract-page', (_event, request = {}) => extractPageMediaCandidates(
  request.pageUrl,
  request.webContentsId,
  request.force === true,
));

ipcMain.handle('media:clear-candidates', (_event, webContentsId = null) => {
  const id = Number(webContentsId);
  metadataGeneration += 1;
  if (!Number.isFinite(id) || id <= 0) {
    mediaCandidates.clear();
    manifestInspectionInFlight.clear();
    metadataExtractionCache.clear();
    return [];
  }
  for (const [candidateId, candidate] of mediaCandidates.entries()) {
    if (Number(candidate.webContentsId) === id) mediaCandidates.delete(candidateId);
  }
  for (const key of metadataExtractionCache.keys()) {
    if (key.startsWith(`${id}:`)) metadataExtractionCache.delete(key);
  }
  return filterMediaCandidates(webContentsId);
});

ipcMain.handle('entitlements:get-state', () => getCurrentEntitlementState());

ipcMain.handle('entitlements:configure', (event, options = {}) => {
  if (!mainWindow || mainWindow.isDestroyed() || event.sender.id !== mainWindow.webContents.id) {
    throw new Error('Entitlement configuration is only available to the app renderer.');
  }
  const state = configureEntitlementProfile(options);
  pumpDownloadQueue();
  sendDownloadQueueState();
  return state;
});

ipcMain.handle('recording:configure', (event, options = {}) => {
  if (!mainWindow || mainWindow.isDestroyed() || event.sender.id !== mainWindow.webContents.id) {
    throw new Error('Recording configuration is only available to the app renderer.');
  }
  if (typeof options.outputDir === 'string' && options.outputDir.trim()) {
    recordingOutputDir = path.resolve(options.outputDir.trim());
  }
  if (typeof options.enabled === 'boolean' && recordingEnabled !== options.enabled) {
    recordingEnabled = options.enabled;
    broadcastRecordingEnabled();
  }
  const entitlements = configureEntitlementProfile(options);
  downloadConcurrencyLimit = effectiveDownloadConcurrency(options.maxConcurrentDownloads || downloadConcurrencyLimit);
  pumpDownloadQueue();
  return {
    outputDir: recordingOutputDir || path.join(app.getPath('downloads'), APP_NAME),
    recordingEnabled,
    maxConcurrentDownloads: entitlements.maxConcurrentDownloads === null ? null : downloadConcurrencyLimit,
    entitlements,
  };
});

ipcMain.handle('recording:start', async (event, payload = {}) => {
  if (event.sender.getType() !== 'webview') throw new Error('Recording must start from a browser video.');
  if (!recordingEnabled) throw new Error('recording-disabled');
  if (activeDownloadJobs.size + activeRecordingSessions.size >= downloadConcurrencyLimit) {
    throw new Error('recording-capacity-reached');
  }
  assertDailyEntitlementAvailable(1);
  const pageUrl = String(payload.pageUrl || event.sender.getURL() || '').slice(0, 4096);
  const pageTitle = String(payload.pageTitle || event.sender.getTitle() || 'recording').slice(0, 500);
  const mimeType = String(payload.mimeType || 'video/webm').slice(0, 200);
  const outputDir = recordingOutputDir || path.join(app.getPath('downloads'), APP_NAME);
  const requestedStem = sanitizeRecordingStem(payload.suggestedFileName || `${pageTitle} - recording`);
  const { finalPath, temporaryPath } = await reserveRecordingPaths(outputDir, requestedStem, recordingExtension(mimeType));
  const consumed = consumeCurrentDailyEntitlement(1);
  if (!consumed.ok) {
    await fs.unlink(temporaryPath).catch(() => {});
    const error = new Error('daily-entitlement-limit-reached');
    error.entitlements = consumed.state;
    throw error;
  }
  const id = `recording-${process.pid}-${++recordingSessionCounter}`;
  const recording = {
    id,
    senderId: event.sender.id,
    pageUrl,
    pageTitle,
    mimeType,
    quality: payload.quality && typeof payload.quality === 'object' ? {
      width: Math.max(0, Number(payload.quality.width) || 0),
      height: Math.max(0, Number(payload.quality.height) || 0),
      frameRate: Math.max(0, Number(payload.quality.frameRate) || 0),
      videoBitsPerSecond: Math.max(0, Number(payload.quality.videoBitsPerSecond) || 0),
    } : null,
    thumbnailUrl: typeof payload.thumbnailUrl === 'string' && payload.thumbnailUrl.length <= 300_000
      ? payload.thumbnailUrl
      : null,
    duration: Number.isFinite(Number(payload.duration)) ? Math.max(0, Number(payload.duration)) : null,
    finalPath,
    temporaryPath,
    bytes: 0,
    durationMs: 0,
    durationLimitMs: consumed.state.recordingDurationLimitMs,
    durationLimitStopRequested: false,
    lastProgressAt: 0,
    writeChain: Promise.resolve(),
    writeError: null,
    finishPromise: null,
    finished: false,
    startedAt: Date.now(),
  };
  activeRecordingSessions.set(id, recording);
  sendRecordingEvent(recording, {
    type: 'started',
    mimeType,
    duration: recording.duration,
    recordingDurationLimitMs: recording.durationLimitMs,
    entitlements: consumed.state,
    startedAt: new Date(recording.startedAt).toISOString(),
  });
  sendDownloadQueueState();
  return {
    ok: true,
    sessionId: id,
    path: finalPath,
    mimeType,
    recordingDurationLimitMs: recording.durationLimitMs,
    entitlements: consumed.state,
  };
});

ipcMain.handle('recording:append', async (event, payload = {}) => {
  const recording = recordingForEvent(event, payload.sessionId);
  const chunk = recordingBuffer(payload.data);
  if (chunk.length <= 0) return { ok: true, bytes: recording.bytes };
  if (chunk.length > 64 * 1024 * 1024) throw new Error('Recording chunk exceeds the 64 MB safety limit.');
  recording.durationMs = Math.max(recording.durationMs, Number(payload.durationMs) || 0);
  if (recording.durationLimitMs !== null
    && recording.durationMs >= recording.durationLimitMs
    && !recording.durationLimitStopRequested) {
    recording.durationLimitStopRequested = true;
    event.sender.send('recording:stop-request', {
      sessionId: recording.id,
      reason: 'recording-duration-limit-reached',
    });
  }
  recording.writeChain = recording.writeChain.then(async () => {
    await fs.appendFile(recording.temporaryPath, chunk);
    recording.bytes += chunk.length;
  }).catch((error) => {
    recording.writeError = error;
    throw error;
  });
  await recording.writeChain;
  const now = Date.now();
  if (now - recording.lastProgressAt >= 750) {
    recording.lastProgressAt = now;
    sendRecordingEvent(recording, {
      type: 'progress',
      data: {
        filename: recording.finalPath,
        percent: Math.max(0, Math.min(99, Number(payload.percent) || 0)),
        status: 'recording',
        downloaded_bytes: recording.bytes,
        total_bytes: 0,
        duration_ms: recording.durationMs,
      },
    });
  }
  return { ok: true, bytes: recording.bytes };
});

ipcMain.handle('recording:finish', async (event, payload = {}) => {
  const recording = recordingForEvent(event, payload.sessionId);
  recording.durationMs = Math.max(recording.durationMs, Number(payload.durationMs) || 0);
  return completeRecording(recording, {
    durationMs: recording.durationMs,
    reason: String(payload.reason || 'completed').slice(0, 100),
  });
});

ipcMain.handle('recording:abort', async (event, payload = {}) => {
  const recording = recordingForEvent(event, payload.sessionId);
  return abortRecording(recording, String(payload.error || 'Recording stopped.').slice(0, 1000));
});

ipcMain.on('recording:notice', (event, payload = {}) => {
  if (event.sender.getType() !== 'webview' || !mainWindow || mainWindow.isDestroyed()) return;
  mainWindow.webContents.send('recording:event', {
    type: 'notice',
    level: payload.type === 'error' ? 'error' : 'info',
    message: String(payload.message || '').slice(0, 1500),
    pageUrl: String(payload.pageUrl || event.sender.getURL() || '').slice(0, 4096),
    pageTitle: String(payload.pageTitle || event.sender.getTitle() || '').slice(0, 500),
    source: 'recording',
  });
});

ipcMain.handle('dialog:choose-directory', async () => {
  if (IS_SMOKE_TEST) return path.join(USER_DATA_PATH, 'SmokeDownloads');
  if (!mainWindow) return null;
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Select output folder',
    properties: ['openDirectory', 'createDirectory'],
  });
  return result.canceled ? null : result.filePaths[0];
});

ipcMain.handle('dialog:choose-text-file', async () => {
  if (IS_SMOKE_TEST) return 'https://example.com/smoke-video.mp4\nhttps://example.com/smoke-audio.mp3\n';
  if (!mainWindow) return null;
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Import URL list',
    properties: ['openFile'],
    filters: [{ name: 'Text files', extensions: ['txt'] }, { name: 'All files', extensions: ['*'] }],
  });
  if (result.canceled) return null;
  return fs.readFile(result.filePaths[0], 'utf8');
});

ipcMain.handle('platforms:get', () => loadPlatformConfiguration());

ipcMain.handle('platforms:save', (_event, configuration) => savePlatformConfiguration(configuration));

ipcMain.handle('platforms:reset', async () => {
  const defaults = loadDefaultPlatformConfiguration();
  return savePlatformConfiguration(defaults);
});

ipcMain.handle('platforms:choose-icon', async () => {
  if (IS_SMOKE_TEST) return null;
  if (!mainWindow) return null;
  const result = await dialog.showOpenDialog(mainWindow, {
    title: '选择平台图标',
    properties: ['openFile'],
    filters: [
      { name: '图片', extensions: ['png', 'jpg', 'jpeg', 'webp', 'gif', 'ico'] },
    ],
  });
  if (result.canceled || !result.filePaths[0]) return null;
  const image = nativeImage.createFromPath(result.filePaths[0]);
  if (image.isEmpty()) throw new Error('无法读取所选图标。');
  return image.resize({ width: 64, height: 64, quality: 'best' }).toPNG().toString('base64');
});

ipcMain.handle('app:open-external', async (_event, url) => {
  if (typeof url !== 'string' || !url.trim()) return false;
  let target;
  try {
    target = new URL(url.trim());
  } catch {
    return false;
  }
  if (!['http:', 'https:'].includes(target.protocol)) return false;
  if (IS_SMOKE_TEST) return true;
  await shell.openExternal(target.toString());
  return true;
});

const DOWNLOAD_MEDIA_EXTENSIONS = new Set([
  '.mp4', '.webm', '.mkv', '.mov', '.m4v', '.avi',
  '.mp3', '.m4a', '.opus', '.ogg', '.wav', '.flac',
]);

async function statPath(targetPath) {
  if (typeof targetPath !== 'string' || !targetPath.trim()) return null;
  try {
    return await fs.stat(path.resolve(targetPath.trim()));
  } catch {
    return null;
  }
}

async function resolveDownloadedFile(item = {}) {
  const requestedPath = typeof item.path === 'string' && item.path.trim()
    ? path.resolve(item.path.trim())
    : '';
  const requestedStat = requestedPath ? await statPath(requestedPath) : null;
  if (requestedStat?.isFile()) return requestedPath;

  const directories = [];
  if (requestedPath) directories.push(path.dirname(requestedPath));
  if (typeof item.savePath === 'string' && item.savePath.trim()) directories.push(path.resolve(item.savePath.trim()));
  const requestedName = requestedPath ? path.basename(requestedPath) : '';
  const intermediateStem = requestedName.replace(/\.f[^.]+\.[^.]+$/i, '').replace(/\.[^.]+$/, '');

  for (const directory of Array.from(new Set(directories))) {
    const directoryStat = await statPath(directory);
    if (!directoryStat?.isDirectory()) continue;
    let entries = [];
    try {
      entries = await fs.readdir(directory, { withFileTypes: true });
    } catch {
      continue;
    }
    const candidates = [];
    for (const entry of entries) {
      if (!entry.isFile()) continue;
      const extension = path.extname(entry.name).toLowerCase();
      if (!DOWNLOAD_MEDIA_EXTENSIONS.has(extension) || /\.(?:part|ytdl)$/i.test(entry.name)) continue;
      const fullPath = path.join(directory, entry.name);
      let score = 0;
      if (intermediateStem && path.basename(entry.name, extension) === intermediateStem) score += 100;
      if (intermediateStem && entry.name.startsWith(`${intermediateStem}.`)) score += 80;
      if (item.formatId && entry.name.includes(`[${item.formatId}]`)) score += 40;
      if (item.fileName && entry.name === item.fileName) score += 30;
      try {
        const stat = await fs.stat(fullPath);
        candidates.push({ fullPath, score, modified: stat.mtimeMs, size: stat.size });
      } catch {
        // Ignore files that disappear while resolving a legacy record.
      }
    }
    candidates.sort((left, right) => right.score - left.score || right.modified - left.modified || right.size - left.size);
    if (candidates[0] && (candidates[0].score > 0 || candidates.length === 1)) return candidates[0].fullPath;
  }
  return null;
}

async function resolveDownloadedFolder(item = {}) {
  const resolvedFile = await resolveDownloadedFile(item);
  if (resolvedFile) return path.dirname(resolvedFile);
  const savePath = typeof item.savePath === 'string' && item.savePath.trim()
    ? path.resolve(item.savePath.trim())
    : '';
  const savePathStat = savePath ? await statPath(savePath) : null;
  if (savePathStat?.isDirectory()) return savePath;
  const requestedPath = typeof item.path === 'string' && item.path.trim() ? path.resolve(item.path.trim()) : '';
  const parent = requestedPath ? path.dirname(requestedPath) : '';
  return (await statPath(parent))?.isDirectory() ? parent : null;
}

ipcMain.handle('app:open-path', async (_event, targetPath) => {
  if (typeof targetPath !== 'string' || !targetPath.trim()) return false;
  if (IS_SMOKE_TEST) return true;
  const result = await shell.openPath(targetPath);
  return result === '';
});

ipcMain.handle('app:show-item-in-folder', (_event, targetPath) => {
  if (typeof targetPath !== 'string' || !targetPath.trim()) return false;
  if (IS_SMOKE_TEST) return true;
  shell.showItemInFolder(targetPath);
  return true;
});

ipcMain.handle('download:open-file', async (_event, item) => {
  if (IS_SMOKE_TEST && !IS_REAL_DOWNLOAD_SMOKE) return { ok: true, path: item?.path || '' };
  const resolvedPath = await resolveDownloadedFile(item || {});
  if (!resolvedPath) return { ok: false, reason: 'file-not-found' };
  if (IS_SMOKE_TEST) return { ok: true, path: resolvedPath, taskDir: path.dirname(resolvedPath) };
  const result = await shell.openPath(resolvedPath);
  return { ok: result === '', path: resolvedPath, taskDir: path.dirname(resolvedPath), reason: result || null };
});

ipcMain.handle('download:open-folder', async (_event, item) => {
  if (IS_SMOKE_TEST && !IS_REAL_DOWNLOAD_SMOKE) return { ok: true, path: item?.savePath || '' };
  const resolvedPath = await resolveDownloadedFolder(item || {});
  if (!resolvedPath) return { ok: false, reason: 'folder-not-found' };
  if (IS_SMOKE_TEST) return { ok: true, path: resolvedPath };
  const result = await shell.openPath(resolvedPath);
  return { ok: result === '', path: resolvedPath, reason: result || null };
});

ipcMain.handle('window:minimize', () => {
  if (!mainWindow) return false;
  if (IS_SMOKE_TEST) return true;
  mainWindow.minimize();
  return true;
});

ipcMain.handle('window:toggle-maximize', () => {
  if (!mainWindow) return false;
  if (IS_SMOKE_TEST) return true;
  if (mainWindow.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow.maximize();
  }
  return true;
});

ipcMain.handle('window:close', () => {
  if (!mainWindow) return false;
  if (IS_SMOKE_TEST) return true;
  mainWindow.close();
  return true;
});

ipcMain.handle('download:verify-output', async (_event, item) => {
  if (IS_SMOKE_TEST && !IS_REAL_DOWNLOAD_SMOKE) {
    return { ok: Boolean(item?.completionVerified || item?.path), path: item?.path || '', size: Number(item?.completedBytes || 2048) };
  }
  const resolvedPath = await resolveDownloadedFile(item || {});
  if (!resolvedPath) return { ok: false, reason: 'file-not-found' };
  const fileStat = await statPath(resolvedPath);
  if (!fileStat?.isFile() || fileStat.size <= 0) return { ok: false, reason: 'empty-file' };
  return { ok: true, path: resolvedPath, taskDir: path.dirname(resolvedPath), size: fileStat.size };
});

ipcMain.handle('window:renderer-ready', (event) => {
  if (IS_SMOKE_TEST || !mainWindow || mainWindow.isDestroyed() || event.sender !== mainWindow.webContents) return false;
  mainWindow.show();
  return true;
});

ipcMain.handle('browser:direct-download-event', async (event, payload = {}) => {
  const jobId = String(payload.jobId || '').trim();
  const job = activeDownloadJobs.get(jobId);
  if (!job || job.finalized || Number(job.task.webContentsId) !== event.sender.id) {
    return { ok: false, reason: 'download-not-active' };
  }
  const stream = job.webviewStream;
  if (!stream) return { ok: false, reason: 'download-not-ready' };
  const type = String(payload.type || '');
  if (type === 'response') {
    armWebviewDownloadTimeout(job);
    const statusCode = Number(payload.statusCode || 0);
    if (statusCode < 200 || statusCode >= 300) {
      await finalizeWebviewDirectDownloadJob(job, {
        error: new Error('Direct media request failed with HTTP ' + statusCode + '.'),
      });
      return { ok: false, reason: 'http-error' };
    }
    stream.totalBytes = Math.max(stream.totalBytes, Number(payload.totalBytes || 0));
    return { ok: true };
  }
  if (type === 'chunk') {
    const chunk = Buffer.from(payload.chunk || []);
    if (!chunk.length || chunk.length > 2 * 1024 * 1024) return { ok: false, reason: 'invalid-chunk' };
    const writeOperation = stream.writeChain.then(async () => {
      if (job.cancelled || job.finalized || !stream.handle) return;
      await stream.handle.write(chunk);
      stream.downloadedBytes += chunk.length;
      armWebviewDownloadTimeout(job);
      const now = Date.now();
      if (now - stream.lastProgressAt < 250) return;
      stream.lastProgressAt = now;
      const elapsedSeconds = Math.max(0.001, (now - stream.startedAt) / 1000);
      sendDownloadJobEvent(job, {
        type: 'progress',
        data: {
          item_index: 1,
          item_total: 1,
          percent: stream.totalBytes > 0 ? Math.min(99, stream.downloadedBytes / stream.totalBytes * 100) : 0,
          status: 'downloading',
          filename: stream.reserved.finalPath,
          downloaded_bytes: stream.downloadedBytes,
          total_bytes: stream.totalBytes || null,
          speed: stream.downloadedBytes / elapsedSeconds,
          eta: stream.totalBytes > stream.downloadedBytes
            ? (stream.totalBytes - stream.downloadedBytes) / (stream.downloadedBytes / elapsedSeconds)
            : 0,
        },
      });
    });
    stream.writeChain = writeOperation.catch(() => {});
    try {
      await writeOperation;
      return { ok: !job.cancelled && !job.finalized };
    } catch (error) {
      await finalizeWebviewDirectDownloadJob(job, { error });
      return { ok: false, reason: 'write-failed' };
    }
  }
  if (type === 'done') {
    await stream.writeChain;
    await finalizeWebviewDirectDownloadJob(job, { success: true });
    return { ok: true };
  }
  if (type === 'error') {
    await finalizeWebviewDirectDownloadJob(job, { error: new Error(String(payload.message || 'Browser media download failed.')) });
    return { ok: false, reason: 'download-error' };
  }
  return { ok: false, reason: 'invalid-event' };
});

ipcMain.handle('download:start', async (_event, task) => {
  if (!Array.isArray(task?.urls) || !task.urls.length) {
    throw new Error('No URLs provided.');
  }
  const urls = Array.from(new Set(task.urls.map((url) => String(url || '').trim()).filter(Boolean)));
  if (!urls.length) throw new Error('No URLs provided.');
  downloadConcurrencyLimit = effectiveDownloadConcurrency(task.maxConcurrentDownloads);
  const baseTask = {
    outputDir: task.outputDir,
    resolution: task.resolution,
    playlist: task.playlist,
    audioOnly: task.audioOnly,
    jsRuntime: task.jsRuntime || 'auto',
    ffmpegLocation: task.ffmpegLocation || resolveBundledFfmpegLocation(),
    formatId: normalizeFormatSelector(task.formatId),
    mergeOutputFormat: normalizeMergeOutputFormat(task.mergeOutputFormat),
    referrer: normalizeDownloadReferrer(task.referrer),
    thumbnailUrl: normalizeDownloadReferrer(task.thumbnailUrl),
    title: String(task.title || task.fileName || 'TikTok video').trim().slice(0, 300),
    directDownload: task.directDownload === true,
    backgroundResolvedMedia: task.backgroundResolvedMedia === true,
    backgroundResolvePage: task.backgroundResolvePage === true,
    siteDownloadIntent: task.siteDownloadIntent === true,
    sourceClient: String(task.sourceClient || '').trim().slice(0, 80),
    kind: String(task.kind || '').trim().slice(0, 40),
    mimeType: String(task.mimeType || '').trim().slice(0, 120),
    sizeBytes: Math.max(0, Number(task.sizeBytes || 0)),
    webContentsId: Number.isInteger(Number(task.webContentsId)) && Number(task.webContentsId) > 0
      ? Number(task.webContentsId)
      : null,
  };
  const requestedEntries = urls.map((url) => ({
    url,
    requestKey: downloadRequestKey(url, baseTask.formatId),
    nativeBrowserDownload: baseTask.directDownload && (
      consumeNativeDownloadPermit(url, baseTask.webContentsId)
      || (baseTask.siteDownloadIntent && isAllowedSiteDownloadIntent(url, baseTask.referrer, baseTask.webContentsId))
    ),
  }));
  const existingByRequestKey = new Map([
    ...Array.from(activeDownloadJobs.values()),
    ...queuedDownloadJobs,
  ].map((job) => [job.requestKey || downloadRequestKey(job.url, job.task?.formatId), job]));
  const newEntries = requestedEntries.filter((entry) => !existingByRequestKey.has(entry.requestKey));
  if (IS_SMOKE_TEST && !IS_REAL_DOWNLOAD_SMOKE) {
    const consumed = consumeCurrentDailyEntitlement(downloadEntitlementCharge(newEntries.length, task.retryExisting));
    if (!consumed.ok) {
      releaseRetainedMediaResolver(baseTask.webContentsId);
      const error = new Error('daily-entitlement-limit-reached');
      error.entitlements = consumed.state;
      throw error;
    }
    const jobs = requestedEntries.map(({ url, requestKey }) => ({
      jobId: `smoke-job-${++downloadJobCounter}`,
      requestKey,
      url,
    }));
    mainWindow?.webContents.send('download:state', {
      running: true,
      activeCount: Math.min(jobs.length, downloadConcurrencyLimit),
      queuedCount: Math.max(0, jobs.length - downloadConcurrencyLimit),
      concurrency: downloadConcurrencyLimit,
    });
    jobs.forEach((job, index) => setTimeout(() => {
      if (!mainWindow || mainWindow.isDestroyed()) return;
      const filename = path.join(USER_DATA_PATH, 'SmokeDownloads', `smoke-video-${index + 1}.mp4`);
      mainWindow.webContents.send('download:event', {
        type: 'progress',
        ...job,
        data: {
          item_index: 1,
          item_total: 1,
          percent: 50,
          status: 'downloading',
          filename,
          downloaded_bytes: 1024,
          total_bytes: 2048,
          speed: 2048,
          eta: 1,
        },
      });
      mainWindow.webContents.send('download:event', {
        type: 'progress',
        ...job,
        data: {
          item_index: 1,
          item_total: 1,
          percent: 100,
          status: 'completed',
          filename,
          task_dir: path.dirname(filename),
          thumbnail_filename: path.join(path.dirname(filename), 'cover.jpg'),
          downloaded_bytes: 2048,
          total_bytes: 2048,
          speed: 0,
          eta: 0,
        },
      });
      mainWindow.webContents.send('download:event', { type: 'done', ...job, downloaded: 1, failed: 0 });
      if (index === jobs.length - 1) {
        mainWindow.webContents.send('download:state', {
          running: false,
          activeCount: 0,
          queuedCount: 0,
          concurrency: downloadConcurrencyLimit,
        });
      }
    }, 25 + index * 15));
    releaseRetainedMediaResolver(baseTask.webContentsId);
    return {
      started: true,
      smoke: true,
      jobs,
      activeCount: Math.min(jobs.length, downloadConcurrencyLimit),
      queuedCount: Math.max(0, jobs.length - downloadConcurrencyLimit),
      entitlements: consumed.state,
    };
  }
  const userData = app.getPath('userData');
  if (!newEntries.length) {
    releaseRetainedMediaResolver(baseTask.webContentsId);
    pumpDownloadQueue();
    return {
      started: true,
      jobs: requestedEntries.map(({ url, requestKey }) => {
        const job = existingByRequestKey.get(requestKey);
        return {
          jobId: job.id,
          requestKey,
          url,
          state: activeDownloadJobs.has(job.id) ? (job.phase || 'downloading') : 'queued',
        };
      }),
      entitlements: getCurrentEntitlementState(),
      ...getDownloadQueueState(),
    };
  }
  const consumed = consumeCurrentDailyEntitlement(downloadEntitlementCharge(newEntries.length, task.retryExisting));
  if (!consumed.ok) {
    releaseRetainedMediaResolver(baseTask.webContentsId);
    const error = new Error('daily-entitlement-limit-reached');
    error.entitlements = consumed.state;
    throw error;
  }
  const cookieDir = path.join(userData, 'cookies');
  await fs.mkdir(cookieDir, { recursive: true });
  const cookiePath = path.join(
    cookieDir,
    `browser-session-${process.pid}-${++downloadCookieGroupCounter}.txt`,
  );
  await exportCookieJar(cookiePath);
  const cookieGroup = { path: cookiePath, remaining: newEntries.length };
  const jobs = newEntries.map(({ url, requestKey, nativeBrowserDownload }) => ({
    id: `download-job-${process.pid}-${++downloadJobCounter}`,
    requestKey,
    url,
    task: { ...baseTask, urls: [url], nativeBrowserDownload },
    cookieGroup,
    cookieReleased: false,
    cancelled: false,
  }));
  queuedDownloadJobs.push(...jobs);
  pumpDownloadQueue();
  const newJobsByRequestKey = new Map(jobs.map((job) => [job.requestKey, job]));
  return {
    started: true,
    jobs: requestedEntries.map(({ url, requestKey }) => {
      const job = newJobsByRequestKey.get(requestKey) || existingByRequestKey.get(requestKey);
      return {
        jobId: job.id,
        requestKey,
        url,
        state: activeDownloadJobs.has(job.id) ? (job.phase || 'downloading') : 'queued',
      };
    }),
    entitlements: consumed.state,
    ...getDownloadQueueState(),
  };
});

ipcMain.handle('theme:update-title-bar', (_event, theme) => {
  if (!mainWindow || mainWindow.isDestroyed() || process.platform === 'darwin') return false;
  const palette = TITLE_BAR_THEMES[theme] || TITLE_BAR_THEMES.dark;
  mainWindow.setTitleBarOverlay({ ...palette, height: TITLE_BAR_HEIGHT });
  return true;
});

ipcMain.handle('download:cancel', async () => {
  const queued = queuedDownloadJobs.splice(0);
  for (const job of queued) {
    job.cancelled = true;
    sendDownloadJobEvent(job, { type: 'cancelled' });
    releaseDownloadJobCookie(job);
    if (job.task.backgroundResolvedMedia) releaseRetainedMediaResolver(job.task.webContentsId);
  }
  const active = Array.from(activeDownloadJobs.values());
  for (const job of active) {
    job.cancelled = true;
    sendDownloadJobEvent(job, { type: 'cancelled' });
    job.abortController?.abort();
    job.downloadItem?.cancel();
    job.process?.kill();
  }
  for (const recording of activeRecordingSessions.values()) {
    const sender = webContents.fromId(recording.senderId);
    if (sender && !sender.isDestroyed()) {
      sender.send('recording:stop-request', { sessionId: recording.id, reason: 'cancel-all' });
    } else if (recording.bytes > 0) {
      void completeRecording(recording, { reason: 'cancel-all', durationMs: recording.durationMs }).catch(() => {});
    } else {
      void abortRecording(recording, 'Recording cancelled.');
    }
  }
  sendDownloadQueueState();
  return {
    running: activeRecordingSessions.size > 0,
    cancelled: queued.length + active.length,
    recordingsStopping: activeRecordingSessions.size,
  };
});

ipcMain.handle('download:control', async (_event, payload = {}) => {
  const jobId = String(payload.jobId || '').trim();
  const requestKey = String(payload.requestKey || '').trim();
  const action = String(payload.action || '').trim();
  if ((!jobId && !requestKey) || !['pause', 'cancel'].includes(action)) return { ok: false, reason: 'invalid-request' };

  const queuedIndex = queuedDownloadJobs.findIndex((job) => job.id === jobId || (requestKey && job.requestKey === requestKey));
  if (queuedIndex >= 0) {
    const [job] = queuedDownloadJobs.splice(queuedIndex, 1);
    job.cancelled = true;
    sendDownloadJobEvent(job, { type: action === 'pause' ? 'paused' : 'cancelled' });
    releaseDownloadJobCookie(job);
    if (job.task.backgroundResolvedMedia) releaseRetainedMediaResolver(job.task.webContentsId);
    sendDownloadQueueState();
    return { ok: true, action, state: action === 'pause' ? 'paused' : 'cancelled' };
  }

  const job = activeDownloadJobs.get(jobId)
    || Array.from(activeDownloadJobs.values()).find((item) => requestKey && item.requestKey === requestKey);
  if (!job) return { ok: true, action, state: 'not-running' };
  job.cancelled = true;
  sendDownloadJobEvent(job, { type: action === 'pause' ? 'paused' : 'cancelled' });
  const abortResult = job.abortController?.abort();
  job.downloadItem?.cancel();
  job.process?.kill();
  if (abortResult && typeof abortResult.then === 'function') await abortResult;
  activeDownloadJobs.delete(job.id);
  pumpDownloadQueue();
  sendDownloadQueueState();
  return { ok: true, action, state: action === 'pause' ? 'paused' : 'cancelled' };
});
