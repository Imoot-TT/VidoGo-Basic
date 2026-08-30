const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const referencePath = path.join(root, 'legacy_reference', 'out', 'renderer', 'assets', 'index.pretty.js');
const rendererPath = path.join(root, 'src', 'renderer', 'app.js');

function readObjectLiteral(filePath, startMarker, endMarker) {
  const source = fs.readFileSync(filePath, 'utf8');
  const start = source.indexOf(startMarker);
  const end = source.indexOf(endMarker, start + startMarker.length);
  if (start < 0 || end < 0) {
    throw new Error(`Unable to locate object literal in ${filePath}`);
  }
  const literalStart = start + startMarker.length;
  const literal = source.slice(literalStart, end).trim().replace(/;$/, '');
  return vm.runInNewContext(`(${literal})`, Object.create(null), { timeout: 1_000 });
}

function flatten(value, prefix = '', result = new Map()) {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    for (const [key, child] of Object.entries(value)) {
      flatten(child, prefix ? `${prefix}.${key}` : key, result);
    }
  } else if (typeof value === 'string') {
    result.set(prefix, value);
  }
  return result;
}

function getPath(value, dottedPath) {
  return dottedPath.split('.').reduce((current, key) => current?.[key], value);
}

const referenceMessages = readObjectLiteral(
  referencePath,
  'const messages =',
  '\nfunction getLocaleDirection'
);
const rendererText = readObjectLiteral(rendererPath, 'const TEXT =', '\nconst I18N =');
const referenceEnglish = flatten(referenceMessages.en);
const pathsByEnglishValue = new Map();

const pathOverrides = {
  browser: 'nav.browser',
  downloads: 'nav.downloads',
  history: 'nav.history',
  favorites: 'nav.favorites',
  account: 'nav.account',
  settings: 'nav.settings',
  newTab: 'browser.newTab',
  stopLoading: 'browser.stop',
  search: 'browser.searchPlaceholder',
  open: 'browser.visit',
  visit: 'browser.visit',
  video: 'browser.popularCategories.video',
  browserAddress: 'browser.searchPlaceholder',
  noMedia: 'media.emptyTitle',
  noMediaHint: 'media.scanning',
  scanning: 'media.scanning',
  suspectedVideosFound: 'media.suspectedVideosFound',
  copyLinkFailed: 'media.copyLinkFailed',
  showVariants: 'media.showVariants',
  hideVariants: 'media.hideVariants',
  downloadCompleted: 'media.downloadCompleted',
  videoKind: 'media.video',
  all: 'media.all',
  outputFolder: 'settings.downloadDirectory',
  browse: 'settings.chooseDownloadDirectory',
  quality: 'media.resolutionFilter',
  startDownload: 'media.download',
  allTime: 'downloads.timeFilterAll',
  today: 'downloads.filterToday',
  yesterday: 'downloads.filterYesterday',
  last7: 'downloads.filterLast7Days',
  last30: 'downloads.filterLast30Days',
  downloaded: 'downloads.downloadedSize',
  downloadStatus: 'downloads.status',
  action: 'downloads.actions',
  completed: 'media.status.completed',
  waiting: 'media.status.queued',
  error: 'media.status.error',
  failed: 'media.status.error',
  cancelled: 'media.status.cancelled',
  canceled: 'media.status.cancelled',
  addDownloadTask: 'media.download',
  remove: 'downloads.remove',
  retry: 'downloads.retry',
  clear: 'media.clear',
  noFavorites: 'favorites.empty',
  favoritesTitle: 'favorites.title',
  plansTitle: 'account.purchaseTitle',
  plansSubtitle: 'account.purchaseDescription',
  free: 'account.planNames.free',
  pro: 'account.planNames.pro',
  flagship: 'account.planNames.ultimate',
  ultimate: 'account.planNames.ultimate',
  lifetime: 'account.planNames.lifetime',
  included: 'account.freeIncluded',
  fromPrice: 'account.fromPrice',
  month: 'account.billing.monthly',
  year: 'account.billing.yearly',
  once: 'account.billing.oneTime',
  comparisonTitle: 'account.comparison.title',
  tableFeature: 'account.comparison.feature',
  monthlyPrice: 'account.comparison.monthly',
  yearlyPrice: 'account.comparison.yearly',
  lifetimePrice: 'account.comparison.lifetimePrice',
  yearlySavings: 'account.comparison.yearlySavings',
  dailyDownloadsRecording: 'account.comparison.dailyDownloads',
  concurrentDownloads: 'account.comparison.concurrentDownloads',
  recordingDuration: 'account.comparison.recordingDuration',
  mediaLibrary: 'account.comparison.mediaLibrary',
  drmSupport: 'account.comparison.drmSupport',
  futureUpdates: 'account.comparison.futureUpdates',
  prioritySupport: 'account.comparison.prioritySupport',
  none: 'account.comparison.none',
  unlimited: 'account.comparison.unlimited',
  basic: 'account.comparison.basic',
  medium: 'account.comparison.medium',
  lifetimeFree: 'account.comparison.lifetimeFree',
  savings40: 'account.comparison.savings40',
  savings45: 'account.comparison.savings45',
  timesPerDay: 'account.comparison.timesPerDay',
  minutes: 'account.comparison.minutes',
  purchase: 'account.loginToPurchase',
  purchaseTitle: 'account.payment',
  paymentOpenFailed: 'account.paymentOpenFailed',
  accountTitle: 'account.title',
  loginSubtitle: 'account.loginDescription',
  register: 'account.register',
  registerTitle: 'account.registerTitle',
  registerSubtitle: 'account.registerDescription',
  refresh: 'account.refresh',
  signedInDescription: 'account.signedInDescription',
  profileTitle: 'account.title',
  profileSubtitle: 'account.signedInDescription',
  todayDownloads: 'account.dailyDownloadsToday',
  ordersSubtitle: 'account.ordersDescription',
  noOrders: 'account.noOrders',
  registerSuccess: 'account.registerSuccess',
  invalidEmail: 'account.usernameInvalid',
  passwordRequired: 'account.passwordRequired',
  passwordMismatch: 'account.passwordMismatch',
  paymentStarted: 'account.paymentStarted',
  paymentContinued: 'account.orderStatuses.paid',
  orderRemoved: 'downloads.remove',
  payNow: 'account.payNow',
  passwordSubtitle: 'account.changePasswordTitle',
  wrongPassword: 'account.requestFailed',
  passwordChanged: 'account.changePasswordSuccess',
  loginFailed: 'account.requestFailed',
  continuePayment: 'account.payNow',
  paid: 'account.orderStatuses.paid',
  created: 'account.orderStatuses.pending',
  noActivePage: 'favorites.empty',
  historyRemoved: 'history.clear',
  adBlockerDescription: 'settings.adBlockerDescription',
  updatesDescription: 'settings.updates',
  checkUpdates: 'update.checkNow',
  chinese: 'language.names.zh-CN',
  started: 'media.status.downloading',
  stopped: 'media.status.cancelled',
  loadFailed: 'browser.loadFailed',
  accountPending: 'account.loginToPurchase',
  featureQuality: 'media.bestQuality',
  featureBatch: 'account.comparison.batchAutomation',
  featurePlaylist: 'media.playlist',
  settingsTitle: 'settings.title',
  settingsDownloadDir: 'settings.downloadDirectory',
  chooseDownloadDirectory: 'settings.chooseDownloadDirectory',
  resetDownloadDirectory: 'settings.resetDownloadDirectory',
  maxConcurrentDownloads: 'settings.maxConcurrentDownloads',
  maxConcurrentDownloadsDescription: 'settings.maxConcurrentDownloadsDescription',
  defaultSearchEngineDescription: 'settings.defaultSearchEngineDescription',
};

const localeOrder = ['zh-CN', 'zh-TW', 'en', 'ru', 'pt', 'vi', 'th', 'ar'];
const nativeLanguageNames = {
  'zh-CN': '简体中文',
  'zh-TW': '繁體中文',
  en: 'English',
  ru: 'Русский',
  pt: 'Português',
  vi: 'Tiếng Việt',
  th: 'ไทย',
  ar: 'العربية',
};
const customTranslations = {
  'zh-CN': {
    title: 'VidoGo', homeSlogan: '一键下载 · 畅享精彩', allowPlaylists: '允许播放列表', audioOnly: '仅音频', importList: '导入列表',
    logoutSuccess: '已退出登录', on: '开启', off: '关闭', system: '跟随系统', browserSession: '浏览器',
    resetSession: '清除浏览器登录状态', sessionReset: '浏览器登录状态已清除', noUrls: '请先粘贴至少一个视频链接。',
    imported: '已导入链接列表', downloadDone: '完成：成功 {success} 个，失败 {failed} 个。', downloadError: '错误：{message}',
    recordingStarted: '录制已开始', recordingCompleted: '录制已保存', recordingFailed: '录制失败：{message}',
    featureBrowser: '内置浏览器', settingsThemeDescription: '选择界面显示模式。', settingsLanguageDescription: '选择应用界面语言。',
    decrease: '减少', increase: '增加', currentVersionDescription: '本地应用运行信息。',
    latestVersionDescription: '最近一次更新检查获得的版本。', saved: '已保存',
  },
  'zh-TW': {
    title: 'VidoGo', homeSlogan: '一鍵下載 · 暢享精彩', allowPlaylists: '允許播放清單', audioOnly: '僅音訊', importList: '匯入清單',
    logoutSuccess: '已登出', on: '開啟', off: '關閉', system: '跟隨系統', browserSession: '瀏覽器',
    resetSession: '清除瀏覽器登入狀態', sessionReset: '瀏覽器登入狀態已清除', noUrls: '請先貼上至少一個影片連結。',
    imported: '已匯入網址清單', downloadDone: '完成：成功 {success} 個，失敗 {failed} 個。', downloadError: '錯誤：{message}',
    recordingStarted: '錄製已開始', recordingCompleted: '錄製已儲存', recordingFailed: '錄製失敗：{message}',
    featureBrowser: '內建瀏覽器', settingsThemeDescription: '選擇介面顯示模式。', settingsLanguageDescription: '選擇應用程式介面語言。',
    decrease: '減少', increase: '增加', currentVersionDescription: '本機應用程式執行資訊。',
    latestVersionDescription: '最近一次更新檢查回報的版本。', saved: '已儲存',
  },
  en: {
    title: 'VidoGo', homeSlogan: 'One-click downloads · Enjoy every moment', allowPlaylists: 'Allow playlists', audioOnly: 'Audio only', importList: 'Import list',
    logoutSuccess: 'Signed out', on: 'On', off: 'Off', system: 'Follow system', browserSession: 'Browser',
    resetSession: 'Clear browser login state', sessionReset: 'Browser login state cleared', noUrls: 'Paste at least one video URL first.',
    imported: 'URL list imported', downloadDone: 'Completed: {success} succeeded, {failed} failed.', downloadError: 'Error: {message}',
    recordingStarted: 'Recording started', recordingCompleted: 'Recording saved', recordingFailed: 'Recording failed: {message}',
    featureBrowser: 'Built-in browser', settingsThemeDescription: 'Choose the interface appearance.', settingsLanguageDescription: 'Choose the application language.',
    decrease: 'Decrease', increase: 'Increase', currentVersionDescription: 'Local application runtime information.',
    latestVersionDescription: 'Version reported by the latest update check.', saved: 'Saved',
  },
  ru: {
    title: 'VidoGo', homeSlogan: 'Скачивание в один клик · Наслаждайтесь лучшим', allowPlaylists: 'Разрешить плейлисты', audioOnly: 'Только аудио', importList: 'Импортировать список',
    logoutSuccess: 'Вы вышли из аккаунта', on: 'Вкл.', off: 'Выкл.', system: 'Как в системе', browserSession: 'Браузер',
    resetSession: 'Очистить данные входа браузера', sessionReset: 'Данные входа браузера очищены', noUrls: 'Сначала вставьте хотя бы одну ссылку на видео.',
    imported: 'Список URL импортирован', downloadDone: 'Готово: успешно — {success}, с ошибкой — {failed}.', downloadError: 'Ошибка: {message}',
    recordingStarted: 'Запись началась', recordingCompleted: 'Запись сохранена', recordingFailed: 'Ошибка записи: {message}',
    featureBrowser: 'Встроенный браузер', settingsThemeDescription: 'Выберите оформление интерфейса.', settingsLanguageDescription: 'Выберите язык интерфейса приложения.',
    decrease: 'Уменьшить', increase: 'Увеличить', currentVersionDescription: 'Сведения о локальном приложении.',
    latestVersionDescription: 'Версия, полученная при последней проверке обновлений.', saved: 'Сохранено',
  },
  pt: {
    title: 'VidoGo', homeSlogan: 'Baixe com um clique · Aproveite o melhor', allowPlaylists: 'Permitir playlists', audioOnly: 'Somente áudio', importList: 'Importar lista',
    logoutSuccess: 'Sessão encerrada', on: 'Ativado', off: 'Desativado', system: 'Seguir o sistema', browserSession: 'Navegador',
    resetSession: 'Limpar sessão do navegador', sessionReset: 'Sessão do navegador limpa', noUrls: 'Cole pelo menos um URL de vídeo primeiro.',
    imported: 'Lista de URLs importada', downloadDone: 'Concluído: {success} com sucesso, {failed} com falha.', downloadError: 'Erro: {message}',
    recordingStarted: 'Gravação iniciada', recordingCompleted: 'Gravação salva', recordingFailed: 'Falha na gravação: {message}',
    featureBrowser: 'Navegador integrado', settingsThemeDescription: 'Escolha a aparência da interface.', settingsLanguageDescription: 'Escolha o idioma da interface do aplicativo.',
    decrease: 'Diminuir', increase: 'Aumentar', currentVersionDescription: 'Informações de execução do aplicativo local.',
    latestVersionDescription: 'Versão informada pela última verificação de atualizações.', saved: 'Salvo',
  },
  vi: {
    title: 'VidoGo', homeSlogan: 'Tải xuống một chạm · Tận hưởng trọn vẹn', allowPlaylists: 'Cho phép danh sách phát', audioOnly: 'Chỉ âm thanh', importList: 'Nhập danh sách',
    logoutSuccess: 'Đã đăng xuất', on: 'Bật', off: 'Tắt', system: 'Theo hệ thống', browserSession: 'Trình duyệt',
    resetSession: 'Xóa trạng thái đăng nhập trình duyệt', sessionReset: 'Đã xóa trạng thái đăng nhập trình duyệt', noUrls: 'Hãy dán ít nhất một URL video trước.',
    imported: 'Đã nhập danh sách URL', downloadDone: 'Hoàn tất: {success} thành công, {failed} thất bại.', downloadError: 'Lỗi: {message}',
    recordingStarted: 'Đã bắt đầu ghi', recordingCompleted: 'Đã lưu bản ghi', recordingFailed: 'Ghi thất bại: {message}',
    featureBrowser: 'Trình duyệt tích hợp', settingsThemeDescription: 'Chọn giao diện hiển thị.', settingsLanguageDescription: 'Chọn ngôn ngữ giao diện ứng dụng.',
    decrease: 'Giảm', increase: 'Tăng', currentVersionDescription: 'Thông tin thời gian chạy của ứng dụng cục bộ.',
    latestVersionDescription: 'Phiên bản từ lần kiểm tra cập nhật gần nhất.', saved: 'Đã lưu',
  },
  th: {
    title: 'VidoGo', homeSlogan: 'ดาวน์โหลดในคลิกเดียว · สนุกได้เต็มที่', allowPlaylists: 'อนุญาตเพลย์ลิสต์', audioOnly: 'เสียงเท่านั้น', importList: 'นำเข้ารายการ',
    logoutSuccess: 'ออกจากระบบแล้ว', on: 'เปิด', off: 'ปิด', system: 'ตามระบบ', browserSession: 'เบราว์เซอร์',
    resetSession: 'ล้างสถานะการเข้าสู่ระบบของเบราว์เซอร์', sessionReset: 'ล้างสถานะการเข้าสู่ระบบของเบราว์เซอร์แล้ว', noUrls: 'โปรดวาง URL วิดีโออย่างน้อยหนึ่งรายการก่อน',
    imported: 'นำเข้ารายการ URL แล้ว', downloadDone: 'เสร็จสิ้น: สำเร็จ {success} รายการ ล้มเหลว {failed} รายการ', downloadError: 'ข้อผิดพลาด: {message}',
    recordingStarted: 'เริ่มบันทึกแล้ว', recordingCompleted: 'บันทึกไฟล์แล้ว', recordingFailed: 'บันทึกล้มเหลว: {message}',
    featureBrowser: 'เบราว์เซอร์ในตัว', settingsThemeDescription: 'เลือกรูปแบบการแสดงผลของอินเทอร์เฟซ', settingsLanguageDescription: 'เลือกภาษาของอินเทอร์เฟซแอปพลิเคชัน',
    decrease: 'ลด', increase: 'เพิ่ม', currentVersionDescription: 'ข้อมูลรันไทม์ของแอปพลิเคชันในเครื่อง',
    latestVersionDescription: 'เวอร์ชันที่รายงานจากการตรวจสอบอัปเดตล่าสุด', saved: 'บันทึกแล้ว',
  },
  ar: {
    title: 'VidoGo', homeSlogan: 'تنزيل بنقرة واحدة · استمتع بكل لحظة', allowPlaylists: 'السماح بقوائم التشغيل', audioOnly: 'صوت فقط', importList: 'استيراد قائمة',
    logoutSuccess: 'تم تسجيل الخروج', on: 'تشغيل', off: 'إيقاف', system: 'اتباع النظام', browserSession: 'المتصفح',
    resetSession: 'مسح حالة تسجيل دخول المتصفح', sessionReset: 'تم مسح حالة تسجيل دخول المتصفح', noUrls: 'ألصق رابط فيديو واحدا على الأقل أولا.',
    imported: 'تم استيراد قائمة الروابط', downloadDone: 'اكتمل: نجح {success} وفشل {failed}.', downloadError: 'خطأ: {message}',
    recordingStarted: 'بدأ التسجيل', recordingCompleted: 'تم حفظ التسجيل', recordingFailed: 'فشل التسجيل: {message}',
    featureBrowser: 'متصفح مدمج', settingsThemeDescription: 'اختر مظهر الواجهة.', settingsLanguageDescription: 'اختر لغة واجهة التطبيق.',
    decrease: 'تقليل', increase: 'زيادة', currentVersionDescription: 'معلومات تشغيل التطبيق المحلي.',
    latestVersionDescription: 'الإصدار الذي أبلغ عنه آخر فحص للتحديث.', saved: 'تم الحفظ',
  },
};

for (const [dottedPath, value] of referenceEnglish) {
  const paths = pathsByEnglishValue.get(value) || [];
  paths.push(dottedPath);
  pathsByEnglishValue.set(value, paths);
}

const exact = {};
const missing = [];
for (const [key, value] of Object.entries(rendererText.en)) {
  if (pathOverrides[key]) {
    exact[key] = pathOverrides[key];
    continue;
  }
  const paths = pathsByEnglishValue.get(value) || [];
  if (paths.length === 1) {
    exact[key] = paths[0];
  } else {
    missing.push({ key, english: value, candidates: paths });
  }
}

if (process.argv.includes('--module')) {
  const translations = {};
  for (const locale of localeOrder) {
    translations[locale] = {
      ...Object.fromEntries(Object.entries(exact).map(([key, dottedPath]) => [key, getPath(referenceMessages[locale], dottedPath)])),
      homeSlogan: getPath(referenceMessages[locale], 'browser.homeSlogan'),
      ...customTranslations[locale],
    };
    const missingKeys = Object.keys(rendererText.en).filter((key) => typeof translations[locale][key] !== 'string');
    if (missingKeys.length) throw new Error(`${locale} is missing: ${missingKeys.join(', ')}`);
  }
  const payload = JSON.stringify(translations, null, 2);
  const names = JSON.stringify(nativeLanguageNames, null, 2);
  process.stdout.write(`(function initVidoGoI18n(global) {\n  'use strict';\n\n  const localeOrder = ${JSON.stringify(localeOrder)};\n  const nativeLanguageNames = ${names};\n  const translations = ${payload};\n  const rtlLocales = new Set(['ar']);\n\n  function resolveSupportedLocale(value) {\n    if (!value) return null;\n    const normalized = String(value).trim().replace(/_/g, '-');\n    if (localeOrder.includes(normalized)) return normalized;\n    const lower = normalized.toLowerCase();\n    if (lower === 'zh' || lower === 'zh-cn' || lower === 'zh-sg' || lower.startsWith('zh-hans')) return 'zh-CN';\n    if (lower === 'zh-tw' || lower === 'zh-hk' || lower === 'zh-mo' || lower.startsWith('zh-hant')) return 'zh-TW';\n    const language = lower.split('-')[0];\n    return ['en', 'ru', 'pt', 'vi', 'th', 'ar'].includes(language) ? language : null;\n  }\n\n  function createTextTables(baseTables) {\n    const englishFallback = baseTables?.en || {};\n    return Object.fromEntries(localeOrder.map((locale) => [locale, { ...englishFallback, ...translations[locale] }]));\n  }\n\n  global.VidoGoI18n = Object.freeze({\n    localeOrder: Object.freeze([...localeOrder]),\n    nativeLanguageNames: Object.freeze({ ...nativeLanguageNames }),\n    translations: Object.freeze(translations),\n    resolveSupportedLocale,\n    getDirection: (locale) => rtlLocales.has(locale) ? 'rtl' : 'ltr',\n    createTextTables,\n  });\n})(window);\n`);
} else if (process.argv.includes('--reference')) {
  for (const [dottedPath, value] of referenceEnglish) {
    console.log(`${dottedPath}\t${value}`);
  }
} else if (process.argv.includes('--json')) {
  const translations = {};
  for (const locale of Object.keys(referenceMessages)) {
    translations[locale] = Object.fromEntries(
      Object.entries(exact).map(([key, dottedPath]) => [key, getPath(referenceMessages[locale], dottedPath)])
    );
  }
  process.stdout.write(`${JSON.stringify({ exact, missing, translations }, null, 2)}\n`);
} else {
  console.log(`Exact reference matches: ${Object.keys(exact).length}/${Object.keys(rendererText.en).length}`);
  for (const item of missing) {
    console.log(`${item.key}\t${item.english}`);
  }
}
