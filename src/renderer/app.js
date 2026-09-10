const HOME_URL = 'https://www.youtube.com/';
const MEDIA_RULES = window.VidoGoMediaRules;
const SEARCH_ENGINES = {
  google: 'https://www.google.com/search?q=',
  bing: 'https://www.bing.com/search?q=',
  duckduckgo: 'https://duckduckgo.com/?q=',
};
const FALLBACK_PARTITION = 'persist:vidogo-basic-0.1.3';
const SUPPORTED_EXTERNAL_LOGIN_BROWSERS = new Set(['chrome', 'edge']);
const STORAGE_KEYS = {
  theme: 'vidogo:theme',
  locale: 'vidogo:locale',
  settings: 'vidogo:settings',
  history: 'vidogo:history',
  favorites: 'vidogo:favorites',
  downloads: 'vidogo:downloads',
  account: 'vidogo:account',
  users: 'vidogo:users',
  orders: 'vidogo:orders',
};

const PLAN_LEVELS = ['free', 'pro', 'ultimate', 'lifetime'];
const PLAN_PRODUCTS = {
  pro_month: { code: 'pro_month', level: 'pro', amount: 4.9, currency: 'USD', billing: 1 },
  pro_year: { code: 'pro_year', level: 'pro', amount: 39, currency: 'USD', billing: 2 },
  ultimate_month: { code: 'ultimate_month', level: 'ultimate', amount: 9.9, currency: 'USD', billing: 1 },
  ultimate_year: { code: 'ultimate_year', level: 'ultimate', amount: 59, currency: 'USD', billing: 2 },
  lifetime: { code: 'lifetime', level: 'lifetime', amount: 149, currency: 'USD', billing: 0 },
};
const PLAN_LIMITS = {
  free: { dailyDownloadLimit: 5, maxConcurrentDownloads: 1, recordingMinutes: 5, mediaLibrary: 'basic' },
  pro: { dailyDownloadLimit: 30, maxConcurrentDownloads: 5, recordingMinutes: 30, mediaLibrary: 'medium' },
  ultimate: { dailyDownloadLimit: null, maxConcurrentDownloads: 10, recordingMinutes: null, mediaLibrary: 'unlimited' },
  lifetime: { dailyDownloadLimit: null, maxConcurrentDownloads: 10, recordingMinutes: null, mediaLibrary: 'unlimited' },
  owner: { dailyDownloadLimit: null, maxConcurrentDownloads: null, recordingMinutes: null, mediaLibrary: 'unlimited' },
};

const QUICK_SITES = {
  video: [
    { name: 'YouTube', url: 'https://www.youtube.com/', icon: './assets/youtube.ico', color: '#ff0033', short: 'YT' },
    { name: 'TikTok', url: 'https://www.tiktok.com/', icon: './assets/tiktok.ico', color: '#101317', short: 'TT' },
    { name: 'Vimeo', url: 'https://vimeo.com/', icon: './assets/vimeo.ico', color: '#1ab7ea', short: 'V' },
    { name: 'Dailymotion', url: 'https://www.dailymotion.com/', icon: './assets/dailymotion.ico', color: '#0050ff', short: 'DM' },
    { name: 'Rumble', url: 'https://rumble.com/', icon: './assets/rumble.ico', color: '#093a20', short: 'R' },
  ],
  social: [
    { name: 'Instagram', url: 'https://www.instagram.com/', icon: './assets/instagram.png', color: '#e1306c', short: 'IG' },
    { name: '小红书', url: 'https://www.xiaohongshu.com/explore', icon: 'https://www.xiaohongshu.com/favicon.ico', color: '#ff2442', short: 'RED' },
    { name: 'Facebook', url: 'https://www.facebook.com/', icon: './assets/facebook.png', color: '#1877f2', short: 'FB' },
    { name: 'X/Twitter', url: 'https://x.com/', icon: './assets/x.ico', color: '#111111', short: 'X' },
    { name: 'Reddit', url: 'https://www.reddit.com/', icon: './assets/reddit.ico', color: '#ff4500', short: 'RD' },
    { name: 'Snapchat', url: 'https://www.snapchat.com/', icon: './assets/snapchat.ico', color: '#fffc00', short: 'SC', darkText: true },
  ],
  live: [
    { name: 'Twitch', url: 'https://www.twitch.tv/', icon: './assets/twitch.ico', color: '#9146ff', short: 'TW' },
    { name: 'Kick', url: 'https://kick.com/', icon: './assets/kick.png', color: '#53fc18', short: 'K', darkText: true },
    { name: 'SoopLive', url: 'https://www.sooplive.com/', icon: './assets/sooplive.ico', color: '#00c2ff', short: 'SL' },
    { name: 'Chzzk', url: 'https://chzzk.naver.com/', icon: './assets/chzzk.ico', color: '#22cc88', short: 'CZ' },
    { name: 'Niconico', url: 'https://www.nicovideo.jp/', icon: './assets/niconico.ico', color: '#666666', short: 'NC' },
  ],
};

const QUALITY_OPTIONS = [
  { value: 'best', labelKey: 'featureQuality' },
  { value: '2160', label: '4K (≤ 2160p)' },
  { value: '1440', label: '≤ 1440p' },
  { value: '1080', label: '≤ 1080p' },
  { value: '720', label: '≤ 720p' },
  { value: '480', label: '≤ 480p' },
];
const DOWNLOAD_PAGE_SIZE = 50;

const TEXT = {
  zh: {
    title: 'VidoGo',
    home: '主页',
    browser: '浏览',
    downloads: '下载',
    history: '历史',
    favorites: '收藏',
    plans: '套餐',
    account: '账户',
    settings: '设置',
    newTab: '新标签页',
    closeTab: '关闭标签页',
    back: '后退',
    forward: '前进',
    stopLoading: '停止加载',
    search: '搜索或输入网址',
    open: '打开',
    visit: '访问',
    popular: '热门',
    video: '视频',
    social: '社交',
    live: '直播',
    browserAddress: '输入网址',
    mediaPanel: '视频媒体',
    noMedia: '当前页面暂无可下载媒体，可能需要先播放视频，或该网站暂不支持',
    noMediaHint: '打开视频页面后自动嗅探',
    openPanel: '打开媒体面板',
    closePanel: '关闭媒体面板',
    scanning: '扫描中',
    suspectedVideosFound: '发现疑似视频',
    copyLink: '复制链接',
    copyLinkCopied: '已复制链接',
    copyLinkFailed: '复制失败',
    showVariants: '展开清晰度',
    hideVariants: '收起清晰度',
    unknownSize: '未知大小',
    downloadCompleted: '下载完成',
    videoKind: '视频',
    audioKind: '音频',
    playlistKind: '播放列表',
    recommend: '推荐',
    all: '全部',
    outputFolder: '输出目录',
    browse: '浏览',
    quality: '分辨率',
    allowPlaylists: '允许播放列表',
    audioOnly: '仅音频',
    importList: '导入列表',
    cancel: '停止',
    download: '下载',
    startDownload: '开始下载',
    allTime: '全部时间',
    today: '今天',
    yesterday: '昨天',
    last7: '最近 7 天',
    last30: '最近 30 天',
    clearFinished: '清除已结束',
    previousPage: '上一页',
    nextPage: '下一页',
    pageStatus: '第 {current} / {total} 页',
    fileName: '文件名',
    progress: '进度',
    downloaded: '已下载',
    fileSize: '文件大小',
    downloadTime: '下载时间',
    downloadStatus: '下载状态',
    resultDetails: '结果详情',
    savePath: '保存地址',
    action: '操作',
    completed: '已完成',
    queued: '等待下载',
    waiting: '等待下载',
    downloading: '下载中',
    error: '下载失败',
    failed: '下载失败',
    cancelled: '已停止',
    canceled: '已停止',
    noDownloads: '暂无下载',
    addDownloadTask: '新增下载任务',
    openFile: '打开文件',
    openFolder: '打开文件夹',
    openFileFailed: '找不到下载完成的视频文件。',
    openFolderFailed: '找不到该下载任务的文件夹。',
    remove: '删除',
    retry: '重试',
    unknownPath: '未知路径',
    clear: '清空',
    noHistory: '暂无浏览历史',
    noFavorites: '暂无收藏',
    favoritesTitle: '收藏夹',
    plansTitle: '套餐购买',
    plansSubtitle: '选择套餐和支付方式，购买记录会显示在账户订单中。',
    free: '免费版',
    pro: '专业版',
    flagship: '旗舰版',
    ultimate: '旗舰版',
    lifetime: '终身版',
    included: '默认包含',
    fromPrice: '{price} 起',
    month: '月',
    year: '年',
    once: '一次性',
    comparisonTitle: '套餐对比',
    monthlyPrice: '月付',
    yearlyPrice: '年付',
    lifetimePrice: '买断',
    yearlySavings: '年付节省',
    dailyDownloadsRecording: '每日下载/录制次数',
    concurrentDownloads: '并发下载数',
    recordingDuration: '单次录制时长',
    mediaLibrary: '媒体库容量',
    drmSupport: 'DRM 内容支持',
    futureUpdates: '后续更新',
    prioritySupport: '优先客服支持',
    none: '-',
    unlimited: '无限',
    basic: '基础',
    medium: '中等',
    lifetimeFree: '终身免费',
    savings40: '省 40%',
    savings45: '省 45%',
    timesPerDay: '{count} 次/天',
    minutes: '{count} 分钟',
    purchaseTitle: '购买支付方式',
    purchase: '登录后购买',
    paymentOpenFailed: '无法打开支付页面，请稍后重试。',
    accountTitle: '账户',
    accountSubtitle: '登录后查看套餐、订单和购买状态。',
    login: '登录账户',
    loginSubtitle: '使用管理平台中的 VidoGo 账户继续。',
    email: '邮箱',
    password: '密码',
    emailPlaceholder: '输入邮箱地址',
    passwordPlaceholder: '输入密码',
    register: '注册',
    registerTitle: '注册账户',
    registerSubtitle: '使用邮箱创建账号后即可购买套餐并同步订单。',
    confirmPassword: '确认密码',
    confirmPasswordPlaceholder: '再次输入密码',
    backToLogin: '返回登录',
    logout: '退出登录',
    refresh: '刷新',
    refreshSuccess: '账户信息已刷新',
    signedInDescription: '已登录，可查看套餐和订单。',
    signedOutDescription: '登录后查看套餐、订单和购买状态。',
    profileTitle: '账户信息',
    profileSubtitle: '从管理平台同步账户和套餐信息。',
    currentPlan: '当前套餐',
    todayDownloads: '今日下载',
    ordersTitle: '订单',
    ordersSubtitle: '查看管理平台同步的购买记录和支付状态。',
    noOrders: '暂无订单',
    loginSuccess: '登录成功',
    registerSuccess: '注册成功',
    logoutSuccess: '已退出登录',
    invalidEmail: '请输入有效邮箱。',
    passwordRequired: '请输入密码。',
    passwordMismatch: '两次输入的密码不一致。',
    paymentStarted: '订单已创建，正在打开安全支付页面',
    paymentContinued: '订单已标记为已支付',
    orderRemoved: '订单已删除',
    payNow: '立即购买',
    viewPlans: '查看套餐',
    changePassword: '修改密码',
    passwordTitle: '修改密码',
    passwordSubtitle: '通过管理平台安全更新账户密码。',
    oldPassword: '当前密码',
    newPassword: '新密码',
    savePassword: '保存密码',
    wrongPassword: '当前密码不正确。',
    passwordChanged: '密码已更新',
    loginFailed: '账户或密码不正确。',
    showPassword: '显示密码',
    hidePassword: '隐藏密码',
    toastInfo: '提示',
    toastSuccess: '操作成功',
    toastWarning: '请注意',
    toastError: '操作失败',
    continuePayment: '继续支付',
    paid: '已支付',
    created: '已创建',
    addCurrentFavorite: '收藏当前页',
    removeCurrentFavorite: '取消收藏',
    noActivePage: '当前没有可收藏页面。',
    historyRemoved: '历史记录已删除',
    adBlocker: '广告拦截',
    adBlockerDescription: '拦截广告、统计和跟踪请求。',
    on: '开启',
    off: '关闭',
    updates: '更新',
    updatesDescription: '检查当前版本是否有可用更新。',
    checkUpdates: '检查更新',
    updateUnavailable: '当前已是最新版本',
    stripe: 'Stripe',
    payssion: 'Payssion',
    theme: '主题',
    system: '跟随系统',
    light: '浅色',
    dark: '深色',
    language: '语言',
    chinese: '中文',
    english: 'English',
    browserSession: '浏览器',
    resetSession: '清除浏览器登录状态',
    sessionReset: '浏览器登录状态已清除',
    started: '下载已开始',
    stopped: '下载已停止',
    noUrls: '请先输入视频链接。',
    imported: '已导入链接列表',
    downloadDone: '完成：成功 {success} 个，失败 {failed} 个。',
    downloadError: '错误：{message}',
    recordingStarted: '录制已开始',
    recordingCompleted: '录制已保存',
    recordingFailed: '录制失败：{message}',
    loadFailed: '页面加载失败',
    accountPending: '请先登录账户再购买套餐。',
    tableFeature: '功能',
    featureQuality: '最高画质下载',
    featureBatch: '批量下载',
    featurePlaylist: '播放列表',
    featureBrowser: '内置浏览器',
    featureSupport: '优先支持',
    settingsTitle: '设置',
    settingsInterface: '界面',
    settingsPreferences: '偏好',
    settingsAbout: '关于',
    settingsThemeDescription: '选择界面显示模式。',
    settingsLanguageDescription: '选择应用界面语言。',
    settingsDownloadDir: '默认下载位置',
    settingsDownloadDirDescription: '视频和音频下载会保存到此文件夹。',
    chooseDownloadDirectory: '选择文件夹',
    resetDownloadDirectory: '恢复默认',
    decrease: '减少',
    increase: '增加',
    maxConcurrentDownloads: '同时下载数',
    maxConcurrentDownloadsDescription: '控制可同时进行的下载与录制任务；数量上限由当前套餐决定。',
    recordingFeature: '网页录制',
    recordingFeatureDescription: '在网页视频上显示录制工具栏。该功能默认关闭。',
    owner: '所有者',
    ownerConcurrency: '所有者账户 · 不限并发',
    concurrencyLimitLabel: '{plan}上限 {count}',
    concurrencyLimitReached: '当前{plan}最多同时进行 {count} 个任务',
    defaultSearchEngine: '默认搜索引擎',
    defaultSearchEngineDescription: '地址栏输入关键词时使用的搜索引擎。',
    currentVersion: '当前版本',
    currentVersionDescription: '本地应用运行信息。',
    latestVersion: '最新版本',
    latestVersionDescription: '上次检查更新获得的版本。',
    saved: '已保存',
  },
  en: {
    title: 'VidoGo',
    home: 'Home',
    browser: 'Browser',
    downloads: 'Downloads',
    history: 'History',
    favorites: 'Favorites',
    plans: 'Plans',
    account: 'Account',
    settings: 'Settings',
    newTab: 'New tab',
    closeTab: 'Close tab',
    back: 'Back',
    forward: 'Forward',
    stopLoading: 'Stop loading',
    search: 'Search or enter URL',
    open: 'Open',
    visit: 'Visit',
    popular: 'Popular',
    video: 'Video',
    social: 'Social',
    live: 'Live',
    browserAddress: 'Enter URL',
    mediaPanel: 'Video media',
    noMedia: 'No downloadable media on this page. Try playing the video, or the site may not be supported yet.',
    noMediaHint: 'Open a video page to sniff media',
    openPanel: 'Open media panel',
    closePanel: 'Close media panel',
    scanning: 'Scanning',
    suspectedVideosFound: 'Suspected videos found',
    copyLink: 'Copy link',
    copyLinkCopied: 'Link copied',
    copyLinkFailed: 'Copy failed',
    showVariants: 'Show qualities',
    hideVariants: 'Hide qualities',
    unknownSize: 'Unknown size',
    downloadCompleted: 'Download completed',
    videoKind: 'Video',
    audioKind: 'Audio',
    playlistKind: 'Playlist',
    recommend: 'Recommended',
    all: 'All',
    outputFolder: 'Output folder',
    browse: 'Browse',
    quality: 'Resolution',
    allowPlaylists: 'Allow playlists',
    audioOnly: 'Audio only',
    importList: 'Import list',
    cancel: 'Stop',
    download: 'Download',
    startDownload: 'Start download',
    allTime: 'All time',
    today: 'Today',
    yesterday: 'Yesterday',
    last7: 'Last 7 days',
    last30: 'Last 30 days',
    clearFinished: 'Clear finished',
    previousPage: 'Previous page',
    nextPage: 'Next page',
    pageStatus: 'Page {current} of {total}',
    fileName: 'File name',
    progress: 'Progress',
    downloaded: 'Downloaded',
    fileSize: 'File size',
    downloadTime: 'Download time',
    downloadStatus: 'Status',
    resultDetails: 'Result details',
    savePath: 'Save path',
    action: 'Action',
    completed: 'Completed',
    queued: 'Queued',
    waiting: 'Waiting',
    downloading: 'Downloading',
    error: 'Failed',
    failed: 'Failed',
    cancelled: 'Stopped',
    canceled: 'Stopped',
    noDownloads: 'No downloads',
    addDownloadTask: 'Add download task',
    openFile: 'Open file',
    openFolder: 'Open folder',
    openFileFailed: 'The completed video file could not be found.',
    openFolderFailed: 'The folder for this download task could not be found.',
    remove: 'Remove',
    retry: 'Retry',
    unknownPath: 'Unknown path',
    clear: 'Clear',
    noHistory: 'No browsing history',
    noFavorites: 'No favorites',
    favoritesTitle: 'Favorites',
    plansTitle: 'Plans',
    plansSubtitle: 'Choose a plan and payment method. Purchases appear in account orders.',
    free: 'Free',
    pro: 'Pro',
    flagship: 'Ultimate',
    ultimate: 'Ultimate',
    lifetime: 'Lifetime',
    included: 'Included by default',
    fromPrice: 'From {price}',
    month: 'month',
    year: 'year',
    once: 'one-time',
    comparisonTitle: 'Plan comparison',
    monthlyPrice: 'Monthly',
    yearlyPrice: 'Yearly',
    lifetimePrice: 'Lifetime',
    yearlySavings: 'Yearly savings',
    dailyDownloadsRecording: 'Daily downloads/recordings',
    concurrentDownloads: 'Concurrent downloads',
    recordingDuration: 'Single recording length',
    mediaLibrary: 'Media library capacity',
    drmSupport: 'DRM content support',
    futureUpdates: 'Future updates',
    prioritySupport: 'Priority support',
    none: '-',
    unlimited: 'Unlimited',
    basic: 'Basic',
    medium: 'Medium',
    lifetimeFree: 'Lifetime free',
    savings40: 'Save 40%',
    savings45: 'Save 45%',
    timesPerDay: '{count}/day',
    minutes: '{count} min',
    purchaseTitle: 'Payment method',
    purchase: 'Purchase after login',
    paymentOpenFailed: 'Could not open the payment page. Please try again.',
    accountTitle: 'Account',
    accountSubtitle: 'Sign in to view plans, orders, and purchase status.',
    login: 'Sign in',
    loginSubtitle: 'Continue with your VidoGo account from the management service.',
    email: 'Email',
    password: 'Password',
    emailPlaceholder: 'Enter email address',
    passwordPlaceholder: 'Enter password',
    register: 'Register',
    registerTitle: 'Register account',
    registerSubtitle: 'Create an account with your email to purchase plans and sync orders.',
    confirmPassword: 'Confirm password',
    confirmPasswordPlaceholder: 'Enter password again',
    backToLogin: 'Back to sign in',
    logout: 'Sign out',
    refresh: 'Refresh',
    refreshSuccess: 'Account refreshed',
    signedInDescription: 'Signed in. Plans and orders are available.',
    signedOutDescription: 'Sign in to view plans, orders, and purchase status.',
    profileTitle: 'Account info',
    profileSubtitle: 'Account and plan information synchronized from the management service.',
    currentPlan: 'Current plan',
    todayDownloads: 'Today downloads',
    ordersTitle: 'Orders',
    ordersSubtitle: 'View purchase records and payment status synchronized from the management service.',
    noOrders: 'No orders',
    loginSuccess: 'Signed in',
    registerSuccess: 'Registered',
    logoutSuccess: 'Signed out',
    invalidEmail: 'Enter a valid email.',
    passwordRequired: 'Enter a password.',
    passwordMismatch: 'Passwords do not match.',
    paymentStarted: 'Order created. Opening secure checkout',
    paymentContinued: 'Order marked as paid',
    orderRemoved: 'Order removed',
    payNow: 'Buy now',
    viewPlans: 'View plans',
    changePassword: 'Change password',
    passwordTitle: 'Change password',
    passwordSubtitle: 'Securely update your account password through the management service.',
    oldPassword: 'Current password',
    newPassword: 'New password',
    savePassword: 'Save password',
    wrongPassword: 'Current password is incorrect.',
    passwordChanged: 'Password updated',
    loginFailed: 'Account or password is incorrect.',
    showPassword: 'Show password',
    hidePassword: 'Hide password',
    toastInfo: 'Notice',
    toastSuccess: 'Success',
    toastWarning: 'Attention',
    toastError: 'Action failed',
    continuePayment: 'Continue payment',
    paid: 'paid',
    created: 'created',
    addCurrentFavorite: 'Add current page',
    removeCurrentFavorite: 'Remove current page',
    noActivePage: 'There is no active page to favorite.',
    historyRemoved: 'History entry removed',
    adBlocker: 'Ad blocker',
    adBlockerDescription: 'Block advertising, analytics, and tracking requests.',
    on: 'On',
    off: 'Off',
    updates: 'Updates',
    updatesDescription: 'Check whether a newer version is available.',
    checkUpdates: 'Check updates',
    updateUnavailable: 'You are on the latest version',
    stripe: 'Stripe',
    payssion: 'Payssion',
    theme: 'Theme',
    system: 'Follow system',
    light: 'Light',
    dark: 'Dark',
    language: 'Language',
    chinese: '中文',
    english: 'English',
    browserSession: 'Browser',
    resetSession: 'Clear browser login state',
    sessionReset: 'Browser login state cleared',
    started: 'Download started',
    stopped: 'Download stopped',
    noUrls: 'Paste at least one video URL first.',
    imported: 'URL list imported',
    downloadDone: 'Completed: {success} succeeded, {failed} failed.',
    downloadError: 'Error: {message}',
    recordingStarted: 'Recording started',
    recordingCompleted: 'Recording saved',
    recordingFailed: 'Recording failed: {message}',
    loadFailed: 'Page load failed',
    accountPending: 'Sign in before purchasing a plan.',
    tableFeature: 'Feature',
    featureQuality: 'Best quality downloads',
    featureBatch: 'Batch downloads',
    featurePlaylist: 'Playlists',
    featureBrowser: 'Built-in browser',
    featureSupport: 'Priority support',
    settingsTitle: 'Settings',
    settingsInterface: 'Interface',
    settingsPreferences: 'Preferences',
    settingsAbout: 'About',
    settingsThemeDescription: 'Choose the interface appearance.',
    settingsLanguageDescription: 'Choose the application language.',
    settingsDownloadDir: 'Download directory',
    settingsDownloadDirDescription: 'Video and audio downloads are saved to this folder.',
    chooseDownloadDirectory: 'Choose directory',
    resetDownloadDirectory: 'Reset default',
    decrease: 'Decrease',
    increase: 'Increase',
    maxConcurrentDownloads: 'Concurrent downloads',
    maxConcurrentDownloadsDescription: 'Control concurrent downloads and recordings. The current plan sets the maximum.',
    recordingFeature: 'Web recording',
    recordingFeatureDescription: 'Show the recording toolbar on web videos. This feature is off by default.',
    owner: 'Owner',
    ownerConcurrency: 'Owner account · Unlimited concurrency',
    concurrencyLimitLabel: '{plan} limit {count}',
    concurrencyLimitReached: 'Your {plan} plan allows up to {count} concurrent tasks',
    defaultSearchEngine: 'Default search engine',
    defaultSearchEngineDescription: 'Used when address bar text is not a URL.',
    currentVersion: 'Current version',
    currentVersionDescription: 'Local application runtime information.',
    latestVersion: 'Latest version',
    latestVersionDescription: 'Version reported by the latest update check.',
    saved: 'Saved',
  },
};

const I18N = window.VidoGoI18n;
if (!I18N) throw new Error('VidoGo locale module did not load');
const TEXT_TABLES = I18N.createTextTables(TEXT);
TEXT_TABLES['zh-CN'].resultDetails = TEXT.zh.resultDetails;
TEXT_TABLES['zh-TW'].resultDetails = '結果詳情';
const PLATFORM_MANAGER_TEXT = {
  'zh-CN': {
    platformLauncher: '常用平台', platformManager: '平台管理', platformManagerSubtitle: '管理主页显示的平台和分类',
    platformCategory: '分类', platformSite: '平台', addPlatform: '添加平台', addCategory: '添加分类', restoreDefaults: '恢复默认',
    platformName: '名称', platformUrl: '网址', platformIcon: '图标', categoryName: '分类名称', autoIcon: '自动获取', chooseImage: '选择图片',
    edit: '编辑', hide: '隐藏', show: '显示', cannotDeleteUsedCategory: '请先移动或删除该分类中的平台。',
    platformSaved: '平台配置已保存', platformReset: '平台配置已恢复默认', platformInvalidUrl: '请输入有效的 HTTP(S) 网址。',
    platformNameRequired: '请输入平台名称。', categoryNameRequired: '请输入分类名称。', emptyCategory: '该分类还没有平台。',
    currentAddress: '当前网页地址', close: '关闭', cancel: '取消', save: '保存', remove: '删除',
  },
  en: {
    platformLauncher: 'Platforms', platformManager: 'Manage platforms', platformManagerSubtitle: 'Choose the platforms and categories shown on Home',
    platformCategory: 'Categories', platformSite: 'Platforms', addPlatform: 'Add platform', addCategory: 'Add category', restoreDefaults: 'Restore defaults',
    platformName: 'Name', platformUrl: 'Website', platformIcon: 'Icon', categoryName: 'Category name', autoIcon: 'Auto icon', chooseImage: 'Choose image',
    edit: 'Edit', hide: 'Hide', show: 'Show', cannotDeleteUsedCategory: 'Move or delete the platforms in this category first.',
    platformSaved: 'Platform settings saved', platformReset: 'Platform settings restored', platformInvalidUrl: 'Enter a valid HTTP(S) website.',
    platformNameRequired: 'Enter a platform name.', categoryNameRequired: 'Enter a category name.', emptyCategory: 'No platforms in this category.',
    currentAddress: 'Current page address', close: 'Close', cancel: 'Cancel', save: 'Save', remove: 'Remove',
  },
};
for (const locale of I18N.localeOrder) Object.assign(TEXT_TABLES[locale], PLATFORM_MANAGER_TEXT[locale] || PLATFORM_MANAGER_TEXT.en);
const AUTH_FAILURE_TEXT = {
  'zh-CN': { loginFailed: '邮箱或密码不正确。' },
  'zh-TW': { loginFailed: '電子郵件或密碼不正確。' },
  en: { loginFailed: 'Email or password is incorrect.' },
  ru: { loginFailed: 'Неверный адрес электронной почты или пароль.' },
  pt: { loginFailed: 'E-mail ou senha incorretos.' },
  vi: { loginFailed: 'Email hoặc mật khẩu không đúng.' },
  th: { loginFailed: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' },
  ar: { loginFailed: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.' },
};
for (const [locale, copy] of Object.entries(AUTH_FAILURE_TEXT)) Object.assign(TEXT_TABLES[locale], copy);
const NOTICE_TEXT = {
  'zh-CN': { toastInfo: '提示', toastSuccess: '成功', toastWarning: '注意', toastError: '失败', adBlockerNotice: '注意：应部分平台的播放要求，VidoGo 会保留必要广告，因此无法屏蔽所有广告。' },
  'zh-TW': { toastInfo: '提示', toastSuccess: '成功', toastWarning: '注意', toastError: '失敗', adBlockerNotice: '注意：因應部分平台的播放要求，VidoGo 會保留必要廣告，因此無法屏蔽所有廣告。' },
  en: { toastInfo: 'Notice', toastSuccess: 'Success', toastWarning: 'Attention', toastError: 'Failed', adBlockerNotice: 'Note: Some platforms require essential ads for playback, so VidoGo cannot block every advertisement.' },
  ru: { toastInfo: 'Сведения', toastSuccess: 'Успех', toastWarning: 'Внимание', toastError: 'Ошибка', adBlockerNotice: 'Примечание. Для воспроизведения на некоторых платформах необходима реклама, поэтому VidoGo не может блокировать всю рекламу.' },
  pt: { toastInfo: 'Aviso', toastSuccess: 'Sucesso', toastWarning: 'Atenção', toastError: 'Falha', adBlockerNotice: 'Observação: algumas plataformas exigem anúncios essenciais para reprodução, portanto o VidoGo não pode bloquear todos os anúncios.' },
  vi: { toastInfo: 'Thông báo', toastSuccess: 'Thành công', toastWarning: 'Chú ý', toastError: 'Thất bại', adBlockerNotice: 'Lưu ý: một số nền tảng cần quảng cáo thiết yếu để phát video, vì vậy VidoGo không thể chặn tất cả quảng cáo.' },
  th: { toastInfo: 'แจ้งเตือน', toastSuccess: 'สำเร็จ', toastWarning: 'โปรดทราบ', toastError: 'ล้มเหลว', adBlockerNotice: 'หมายเหตุ: บางแพลตฟอร์มต้องใช้โฆษณาที่จำเป็นเพื่อเล่นวิดีโอ VidoGo จึงไม่สามารถบล็อกโฆษณาทั้งหมดได้' },
  ar: { toastInfo: 'تنبيه', toastSuccess: 'نجح', toastWarning: 'انتباه', toastError: 'فشل', adBlockerNotice: 'ملاحظة: تتطلب بعض المنصات إعلانات ضرورية للتشغيل، لذلك لا يمكن لـ VidoGo حظر جميع الإعلانات.' },
};
for (const [locale, copy] of Object.entries(NOTICE_TEXT)) Object.assign(TEXT_TABLES[locale], copy);
const ENTITLEMENT_TEXT = {
  'zh-CN': { dailyLimitReached: '今日下载/录制次数已达到当前套餐上限。' },
  'zh-TW': { dailyLimitReached: '今日下載/錄製次數已達到目前方案上限。' },
  en: { dailyLimitReached: 'Today\'s download and recording limit has been reached for the current plan.' },
  ru: { dailyLimitReached: 'Достигнут дневной лимит загрузок и записей для текущего тарифа.' },
  pt: { dailyLimitReached: 'O limite diário de downloads e gravações do plano atual foi atingido.' },
  vi: { dailyLimitReached: 'Đã đạt giới hạn tải xuống và ghi hằng ngày của gói hiện tại.' },
  th: { dailyLimitReached: 'ถึงขีดจำกัดการดาวน์โหลดและบันทึกรายวันของแพ็กเกจปัจจุบันแล้ว' },
  ar: { dailyLimitReached: 'تم بلوغ الحد اليومي للتنزيلات والتسجيلات في الباقة الحالية.' },
};
for (const [locale, copy] of Object.entries(ENTITLEMENT_TEXT)) Object.assign(TEXT_TABLES[locale], copy);
const CONCURRENCY_TEXT = {
  'zh-CN': { concurrencyLimitLabel: '{plan}上限 {count}', concurrencyLimitReached: '当前{plan}最多同时进行 {count} 个任务' },
  'zh-TW': { concurrencyLimitLabel: '{plan}上限 {count}', concurrencyLimitReached: '目前{plan}最多同時進行 {count} 個工作' },
  en: { concurrencyLimitLabel: '{plan} limit {count}', concurrencyLimitReached: 'Your {plan} plan allows up to {count} concurrent tasks' },
  ru: { concurrencyLimitLabel: '{plan}: лимит {count}', concurrencyLimitReached: 'Тариф {plan} допускает до {count} одновременных задач' },
  pt: { concurrencyLimitLabel: 'Limite {plan}: {count}', concurrencyLimitReached: 'O plano {plan} permite até {count} tarefas simultâneas' },
  vi: { concurrencyLimitLabel: '{plan}: tối đa {count}', concurrencyLimitReached: 'Gói {plan} cho phép tối đa {count} tác vụ đồng thời' },
  th: { concurrencyLimitLabel: '{plan}: สูงสุด {count}', concurrencyLimitReached: 'แพ็กเกจ {plan} ใช้งานพร้อมกันได้สูงสุด {count} งาน' },
  ar: { concurrencyLimitLabel: 'حد {plan}: {count}', concurrencyLimitReached: 'تسمح باقة {plan} بما يصل إلى {count} مهام متزامنة' },
};
for (const [locale, copy] of Object.entries(CONCURRENCY_TEXT)) Object.assign(TEXT_TABLES[locale], copy);
const RECORDING_SETTING_TEXT = {
  'zh-CN': { recordingFeature: '网页录制', recordingFeatureDescription: '在网页视频上显示录制工具栏。该功能默认关闭。', owner: '所有者', ownerConcurrency: '所有者账户 · 不限并发', recordingRequired: '请使用录制功能保存', enableRecordingFirst: '请先在设置中开启网页录制' },
  'zh-TW': { recordingFeature: '網頁錄製', recordingFeatureDescription: '在網頁影片上顯示錄製工具列。此功能預設關閉。', owner: '擁有者', ownerConcurrency: '擁有者帳戶 · 不限並行數', recordingRequired: '請使用錄製功能儲存', enableRecordingFirst: '請先在設定中開啟網頁錄製' },
  en: { recordingFeature: 'Web recording', recordingFeatureDescription: 'Show the recording toolbar on web videos. This feature is off by default.', owner: 'Owner', ownerConcurrency: 'Owner account · Unlimited concurrency', recordingRequired: 'Use recording to save this video', enableRecordingFirst: 'Enable Web recording in Settings first' },
  ru: { recordingRequired: 'Используйте запись, чтобы сохранить видео', enableRecordingFirst: 'Сначала включите запись веб-видео в настройках' },
  pt: { recordingRequired: 'Use a gravação para salvar este vídeo', enableRecordingFirst: 'Ative primeiro a gravação da Web nas configurações' },
  vi: { recordingRequired: 'Dùng ghi hình để lưu video này', enableRecordingFirst: 'Trước tiên hãy bật ghi hình web trong Cài đặt' },
  th: { recordingRequired: 'ใช้การบันทึกเพื่อบันทึกวิดีโอนี้', enableRecordingFirst: 'เปิดการบันทึกเว็บในการตั้งค่าก่อน' },
  ar: { recordingRequired: 'استخدم التسجيل لحفظ هذا الفيديو', enableRecordingFirst: 'فعّل تسجيل الويب من الإعدادات أولاً' },
};
for (const [locale, copy] of Object.entries(RECORDING_SETTING_TEXT)) Object.assign(TEXT_TABLES[locale], copy);
const MEDIA_FILTER_TEXT = {
  'zh-CN': { allResolutions: '全部分辨率', mediaPanel: '媒体资源', showVariants: '选择下载内容', hideVariants: '收起下载内容', downloadVideo: '下载视频', downloadImage: '下载图片', downloadAllImages: '下载全部图片 ({count})', imageNumber: '图片 {index}', quickDownload: '配套素材', assetStorageHint: '视频、MP3、封面和字幕保存到同一素材项目', videoQuality: '视频画质', extractMp3: '提取 MP3', downloadCover: '下载封面', downloadSubtitle: '下载字幕', chooseSubtitle: '选择字幕', subtitleDetecting: '字幕检测中…', automaticSubtitle: '自动字幕', assetType: '类型', assetVideo: '视频', assetAudio: 'MP3', assetImage: '图片', assetSubtitle: '字幕', previewVideo: '播放视频', previewAudio: '试听 MP3', previewImage: '预览图片', openSubtitle: '打开字幕', mediaPreview: '媒体预览', previewLoading: '正在打开本地文件…', previewUnsupported: '当前内置播放器不支持此文件编码，可使用系统应用打开。', openWithSystem: '使用系统应用打开' },
  'zh-TW': { allResolutions: '全部解析度', mediaPanel: '媒體資源', showVariants: '選擇下載內容', hideVariants: '收起下載內容', downloadVideo: '下載影片', downloadImage: '下載圖片', downloadAllImages: '下載全部圖片 ({count})', imageNumber: '圖片 {index}', quickDownload: '配套素材', assetStorageHint: '影片、MP3、封面和字幕會儲存到同一素材專案', videoQuality: '影片畫質', extractMp3: '擷取 MP3', downloadCover: '下載封面', downloadSubtitle: '下載字幕', chooseSubtitle: '選擇字幕', subtitleDetecting: '字幕偵測中…', automaticSubtitle: '自動字幕', assetType: '類型', assetVideo: '影片', assetAudio: 'MP3', assetImage: '圖片', assetSubtitle: '字幕', previewVideo: '播放影片', previewAudio: '試聽 MP3', previewImage: '預覽圖片', openSubtitle: '開啟字幕', mediaPreview: '媒體預覽', previewLoading: '正在開啟本機檔案…', previewUnsupported: '內建播放器不支援此檔案編碼，可使用系統應用程式開啟。', openWithSystem: '使用系統應用程式開啟' },
  en: { allResolutions: 'All resolutions', mediaPanel: 'Media resources', showVariants: 'Choose download content', hideVariants: 'Hide download content', downloadVideo: 'Download video', downloadImage: 'Download image', downloadAllImages: 'Download all images ({count})', imageNumber: 'Image {index}', quickDownload: 'Related assets', assetStorageHint: 'Video, MP3, cover, and subtitles share one media project', videoQuality: 'Video quality', extractMp3: 'Extract MP3', downloadCover: 'Download cover', downloadSubtitle: 'Download subtitles', chooseSubtitle: 'Choose subtitles', subtitleDetecting: 'Detecting subtitles…', automaticSubtitle: 'Automatic captions', assetType: 'Type', assetVideo: 'Video', assetAudio: 'MP3', assetImage: 'Image', assetSubtitle: 'Subtitle', previewVideo: 'Play video', previewAudio: 'Play MP3', previewImage: 'Preview image', openSubtitle: 'Open subtitle', mediaPreview: 'Media preview', previewLoading: 'Opening the local file…', previewUnsupported: 'The built-in player does not support this file codec. Open it with a system app instead.', openWithSystem: 'Open with system app' },
  ru: { allResolutions: 'Все разрешения' },
  pt: { allResolutions: 'Todas as resoluções' },
  vi: { allResolutions: 'Tất cả độ phân giải' },
  th: { allResolutions: 'ความละเอียดทั้งหมด' },
  ar: { allResolutions: 'كل درجات الدقة' },
};
for (const [locale, copy] of Object.entries(MEDIA_FILTER_TEXT)) Object.assign(TEXT_TABLES[locale], copy);
const LIBRARY_TEXT = {
  'zh-CN': {
    library: '素材库', libraryTitle: '素材库', libraryDescription: '视频、MP3、封面和字幕按来源归入同一个媒体项目。',
    libraryProjects: '媒体项目', libraryAllAssets: '全部素材', libraryRefresh: '刷新', libraryRefreshing: '正在刷新…',
    librarySearch: '搜索素材库', librarySearchPlaceholder: '搜索标题、文件名或平台', libraryAllPlatforms: '全部平台', libraryAllTypes: '全部类型',
    librarySortRecent: '最近下载', librarySortTitle: '按标题', librarySortSize: '按大小', libraryGridView: '网格视图', libraryListView: '列表视图',
    libraryLoading: '正在读取素材库…', libraryLoadFailed: '素材库读取失败：{message}', libraryEmptyTitle: '素材库还是空的',
    libraryEmptyBody: '下载视频、MP3、封面或字幕后，会自动整理到这里。', libraryNoResultsTitle: '没有匹配的素材', libraryNoResultsBody: '试试清空搜索或更换筛选条件。', libraryBrowse: '去浏览下载',
    libraryProjectSummary: '共 {count} 个媒体项目', libraryAssetSummary: '共 {count} 个素材', libraryProjectAssets: '{count} 个素材 · {size}',
    libraryOpenProject: '查看项目', libraryOpenFolder: '打开项目文件夹', libraryOpenSource: '打开来源网页', libraryPreview: '预览', libraryOpenSystem: '系统打开', libraryReveal: '定位文件',
    libraryImportEditor: '导入 {editor}', libraryImportProject: '导入全部素材到 {editor}', libraryImportingEditor: '正在启动并导入 {editor}…', libraryImportEditorDone: '已导入 {editor}', libraryImportProjectDone: '已向 {editor} 导入 {count} 个素材', libraryImportEditorMissing: '请先在偏好设置中扫描或选择剪辑软件。', libraryImportEditorNotReady: '未能打开 {editor} 的导入窗口，请确认软件处于编辑界面后重试。', libraryImportEditorBackgroundUnsupported: '当前版本尚未完成 {editor} 的导入适配。', libraryImportEditorFailed: '无法导入 {editor}', libraryEditorGeneric: '剪辑软件',
    libraryProvider: '平台', libraryDownloadedAt: '下载时间', libraryFolder: '项目文件夹', librarySize: '大小',
    libraryStatusAvailable: '完整', libraryStatusPartial: '部分文件缺失', libraryStatusMissing: '文件缺失', libraryMissing: '缺失', libraryUnknownProvider: '其他平台',
    libraryVideo: '视频', libraryAudio: 'MP3', libraryImage: '图片', librarySubtitle: '字幕', librarySharedCover: '共享封面', libraryRefreshDone: '素材库已刷新',
  },
  'zh-TW': {
    library: '素材庫', libraryTitle: '素材庫', libraryDescription: '影片、MP3、封面與字幕會依來源歸入同一個媒體專案。',
    libraryProjects: '媒體專案', libraryAllAssets: '全部素材', libraryRefresh: '重新整理', libraryRefreshing: '正在重新整理…',
    librarySearch: '搜尋素材庫', librarySearchPlaceholder: '搜尋標題、檔名或平台', libraryAllPlatforms: '全部平台', libraryAllTypes: '全部類型',
    librarySortRecent: '最近下載', librarySortTitle: '依標題', librarySortSize: '依大小', libraryGridView: '網格檢視', libraryListView: '清單檢視',
    libraryLoading: '正在讀取素材庫…', libraryLoadFailed: '素材庫讀取失敗：{message}', libraryEmptyTitle: '素材庫還是空的',
    libraryEmptyBody: '下載影片、MP3、封面或字幕後，會自動整理到這裡。', libraryNoResultsTitle: '沒有符合的素材', libraryNoResultsBody: '請清除搜尋或更換篩選條件。', libraryBrowse: '前往瀏覽下載',
    libraryProjectSummary: '共 {count} 個媒體專案', libraryAssetSummary: '共 {count} 個素材', libraryProjectAssets: '{count} 個素材 · {size}',
    libraryOpenProject: '查看專案', libraryOpenFolder: '開啟專案資料夾', libraryOpenSource: '開啟來源網頁', libraryPreview: '預覽', libraryOpenSystem: '系統開啟', libraryReveal: '顯示檔案位置',
    libraryImportEditor: '匯入 {editor}', libraryImportProject: '將全部素材匯入 {editor}', libraryImportingEditor: '正在啟動並匯入 {editor}…', libraryImportEditorDone: '已匯入 {editor}', libraryImportProjectDone: '已向 {editor} 匯入 {count} 個素材', libraryImportEditorMissing: '請先在偏好設定中掃描或選擇剪輯軟體。', libraryImportEditorNotReady: '無法開啟 {editor} 的匯入視窗，請確認剪輯軟體位於編輯介面後重試。', libraryImportEditorBackgroundUnsupported: '目前版本尚未完成 {editor} 的匯入適配。', libraryImportEditorFailed: '無法匯入 {editor}', libraryEditorGeneric: '剪輯軟體',
    libraryProvider: '平台', libraryDownloadedAt: '下載時間', libraryFolder: '專案資料夾', librarySize: '大小',
    libraryStatusAvailable: '完整', libraryStatusPartial: '部分檔案遺失', libraryStatusMissing: '檔案遺失', libraryMissing: '遺失', libraryUnknownProvider: '其他平台',
    libraryVideo: '影片', libraryAudio: 'MP3', libraryImage: '圖片', librarySubtitle: '字幕', librarySharedCover: '共用封面', libraryRefreshDone: '素材庫已重新整理',
  },
  en: {
    library: 'Library', libraryTitle: 'Media library', libraryDescription: 'Video, MP3, covers and subtitles are grouped into one source project.',
    libraryProjects: 'Media projects', libraryAllAssets: 'All assets', libraryRefresh: 'Refresh', libraryRefreshing: 'Refreshing…',
    librarySearch: 'Search library', librarySearchPlaceholder: 'Search title, file name, or platform', libraryAllPlatforms: 'All platforms', libraryAllTypes: 'All types',
    librarySortRecent: 'Most recent', librarySortTitle: 'By title', librarySortSize: 'By size', libraryGridView: 'Grid view', libraryListView: 'List view',
    libraryLoading: 'Loading the media library…', libraryLoadFailed: 'Could not load the media library: {message}', libraryEmptyTitle: 'Your library is empty',
    libraryEmptyBody: 'Downloaded video, MP3, covers, and subtitles will be organized here automatically.', libraryNoResultsTitle: 'No matching assets', libraryNoResultsBody: 'Clear the search or change a filter.', libraryBrowse: 'Browse and download',
    libraryProjectSummary: '{count} media projects', libraryAssetSummary: '{count} assets', libraryProjectAssets: '{count} assets · {size}',
    libraryOpenProject: 'View project', libraryOpenFolder: 'Open project folder', libraryOpenSource: 'Open source page', libraryPreview: 'Preview', libraryOpenSystem: 'Open in system', libraryReveal: 'Show in folder',
    libraryImportEditor: 'Import into {editor}', libraryImportProject: 'Import all assets into {editor}', libraryImportingEditor: 'Starting and importing into {editor}…', libraryImportEditorDone: 'Imported into {editor}', libraryImportProjectDone: 'Imported {count} assets into {editor}', libraryImportEditorMissing: 'Scan for or choose an editing app in Preferences first.', libraryImportEditorNotReady: 'Could not open the {editor} import window. Keep the app in its editing workspace and try again.', libraryImportEditorBackgroundUnsupported: 'Import support for {editor} is not available in this version.', libraryImportEditorFailed: 'Could not import into {editor}', libraryEditorGeneric: 'editing app',
    libraryProvider: 'Platform', libraryDownloadedAt: 'Downloaded', libraryFolder: 'Project folder', librarySize: 'Size',
    libraryStatusAvailable: 'Complete', libraryStatusPartial: 'Some files are missing', libraryStatusMissing: 'Files missing', libraryMissing: 'Missing', libraryUnknownProvider: 'Other',
    libraryVideo: 'Video', libraryAudio: 'MP3', libraryImage: 'Image', librarySubtitle: 'Subtitle', librarySharedCover: 'Shared cover', libraryRefreshDone: 'Media library refreshed',
  },
};
for (const locale of I18N.localeOrder) Object.assign(TEXT_TABLES[locale], LIBRARY_TEXT[locale] || LIBRARY_TEXT.en);
const EDITOR_SETTINGS_TEXT = {
  'zh-CN': {
    settingsEditors: '剪辑软件', settingsEditorTitle: '默认剪辑软件', settingsEditorDescription: '根据所选软件使用对应导入方式，支持视频、音频、图片和字幕。',
    settingsEditorNone: '未检测到剪辑软件', settingsEditorScan: '扫描软件', settingsEditorScanning: '正在扫描…', settingsEditorChoose: '手动选择',
    settingsEditorScanDone: '已找到 {count} 个剪辑软件', settingsEditorSaved: '默认剪辑软件已设为 {editor}', settingsEditorChooseFailed: '选择的程序不可用',
  },
  'zh-TW': {
    settingsEditors: '剪輯軟體', settingsEditorTitle: '預設剪輯軟體', settingsEditorDescription: '依所選軟體使用對應匯入方式，支援影片、音訊、圖片與字幕。',
    settingsEditorNone: '未偵測到剪輯軟體', settingsEditorScan: '掃描軟體', settingsEditorScanning: '正在掃描…', settingsEditorChoose: '手動選擇',
    settingsEditorScanDone: '已找到 {count} 個剪輯軟體', settingsEditorSaved: '預設剪輯軟體已設為 {editor}', settingsEditorChooseFailed: '選擇的程式無法使用',
  },
  en: {
    settingsEditors: 'Editing apps', settingsEditorTitle: 'Default editing app', settingsEditorDescription: 'Uses the import adapter for the selected app and supports video, audio, images, and subtitles.',
    settingsEditorNone: 'No editing app detected', settingsEditorScan: 'Scan apps', settingsEditorScanning: 'Scanning…', settingsEditorChoose: 'Choose manually',
    settingsEditorScanDone: 'Found {count} editing apps', settingsEditorSaved: 'Default editing app set to {editor}', settingsEditorChooseFailed: 'The selected program is unavailable',
  },
};
for (const locale of I18N.localeOrder) Object.assign(TEXT_TABLES[locale], EDITOR_SETTINGS_TEXT[locale] || EDITOR_SETTINGS_TEXT.en);
const DOWNLOAD_OPEN_TEXT = {
  'zh-CN': { openFileFailed: '找不到下载完成的视频文件。', openFolderFailed: '找不到该下载任务的文件夹。' },
  'zh-TW': { openFileFailed: '找不到下載完成的影片檔案。', openFolderFailed: '找不到此下載工作的資料夾。' },
  en: { openFileFailed: 'The completed video file could not be found.', openFolderFailed: 'The folder for this download task could not be found.' },
  ru: { openFileFailed: 'Не удалось найти загруженный видеофайл.', openFolderFailed: 'Не удалось найти папку этой загрузки.' },
  pt: { openFileFailed: 'Não foi possível encontrar o arquivo de vídeo baixado.', openFolderFailed: 'Não foi possível encontrar a pasta deste download.' },
  vi: { openFileFailed: 'Không tìm thấy tệp video đã tải xuống.', openFolderFailed: 'Không tìm thấy thư mục của tác vụ tải xuống này.' },
  th: { openFileFailed: 'ไม่พบไฟล์วิดีโอที่ดาวน์โหลดเสร็จแล้ว', openFolderFailed: 'ไม่พบโฟลเดอร์ของงานดาวน์โหลดนี้' },
  ar: { openFileFailed: 'تعذر العثور على ملف الفيديو الذي تم تنزيله.', openFolderFailed: 'تعذر العثور على مجلد مهمة التنزيل هذه.' },
};
for (const [locale, copy] of Object.entries(DOWNLOAD_OPEN_TEXT)) Object.assign(TEXT_TABLES[locale], copy);

const DOWNLOAD_CONTROL_TEXT = {
  'zh-CN': {
    paused: '已暂停', resolving: '正在解析', connecting: '正在连接', finalizing: '正在完成', pause: '暂停', resume: '继续下载', retryAllFailed: '批量重试失败项',
    retryingFailed: '正在重试 {current}/{total}', retriedFailed: '已重新提交 {count} 个失败任务。',
    retryFailedPartial: '已重新提交 {started} 个，仍有 {failed} 个无法重试。', noRetryableFailed: '暂无可重试的失败任务。',
    invalidDownloadOutput: '下载结果无有效文件，任务已标记为失败，请重试。', batchQueued: '已添加 {count} 个下载任务，正在后台解析。',
  },
  'zh-TW': {
    paused: '已暫停', resolving: '正在解析', connecting: '正在連線', finalizing: '正在完成', pause: '暫停', resume: '繼續下載', retryAllFailed: '批次重試失敗項目',
    retryingFailed: '正在重試 {current}/{total}', retriedFailed: '已重新提交 {count} 個失敗任務。',
    retryFailedPartial: '已重新提交 {started} 個，仍有 {failed} 個無法重試。', noRetryableFailed: '暫無可重試的失敗任務。',
    invalidDownloadOutput: '下載結果沒有有效檔案，任務已標記為失敗，請重試。', batchQueued: '已加入 {count} 個下載任務，正在背景解析。',
  },
  en: {
    paused: 'Paused', resolving: 'Resolving', connecting: 'Connecting', finalizing: 'Finishing', pause: 'Pause', resume: 'Resume', retryAllFailed: 'Retry all failed',
    retryingFailed: 'Retrying {current}/{total}', retriedFailed: 'Resubmitted {count} failed tasks.',
    retryFailedPartial: 'Resubmitted {started}; {failed} could not be retried.', noRetryableFailed: 'There are no retryable failed tasks.',
    invalidDownloadOutput: 'No valid output file was produced. The task was marked as failed; please retry.', batchQueued: 'Added {count} download tasks; resolving in the background.',
  },
};
for (const locale of I18N.localeOrder) Object.assign(TEXT_TABLES[locale], DOWNLOAD_CONTROL_TEXT[locale] || DOWNLOAD_CONTROL_TEXT.en);
const UPDATE_TEXT = {
  'zh-CN': { checkingUpdates: '正在检查…', updateAvailable: '发现新版本 {version}。', openRelease: '打开下载页面', updateNotPublished: '项目尚未发布公开版本。', updateCheckFailed: '检查更新失败：{message}' },
  'zh-TW': { checkingUpdates: '正在檢查…', updateAvailable: '發現新版本 {version}。', openRelease: '開啟下載頁面', updateNotPublished: '專案尚未發布公開版本。', updateCheckFailed: '檢查更新失敗：{message}' },
  en: { checkingUpdates: 'Checking…', updateAvailable: 'Version {version} is available.', openRelease: 'Open download page', updateNotPublished: 'No public release has been published yet.', updateCheckFailed: 'Update check failed: {message}' },
  ru: { checkingUpdates: 'Проверка…', updateAvailable: 'Доступна версия {version}.', openRelease: 'Открыть страницу загрузки', updateNotPublished: 'Публичный выпуск ещё не опубликован.', updateCheckFailed: 'Не удалось проверить обновления: {message}' },
  pt: { checkingUpdates: 'Verificando…', updateAvailable: 'A versão {version} está disponível.', openRelease: 'Abrir página de download', updateNotPublished: 'Ainda não há uma versão pública publicada.', updateCheckFailed: 'Falha ao verificar atualizações: {message}' },
  vi: { checkingUpdates: 'Đang kiểm tra…', updateAvailable: 'Đã có phiên bản {version}.', openRelease: 'Mở trang tải xuống', updateNotPublished: 'Chưa có bản phát hành công khai.', updateCheckFailed: 'Kiểm tra cập nhật thất bại: {message}' },
  th: { checkingUpdates: 'กำลังตรวจสอบ…', updateAvailable: 'มีเวอร์ชัน {version} พร้อมใช้งาน', openRelease: 'เปิดหน้าดาวน์โหลด', updateNotPublished: 'ยังไม่มีรุ่นสาธารณะ', updateCheckFailed: 'ตรวจสอบอัปเดตไม่สำเร็จ: {message}' },
  ar: { checkingUpdates: 'جار التحقق…', updateAvailable: 'الإصدار {version} متاح.', openRelease: 'فتح صفحة التنزيل', updateNotPublished: 'لم يُنشر إصدار عام بعد.', updateCheckFailed: 'فشل التحقق من التحديثات: {message}' },
};
for (const [locale, copy] of Object.entries(UPDATE_TEXT)) Object.assign(TEXT_TABLES[locale], copy);
const BROWSER_STATUS_TEXT = {
  'zh-CN': { media: '媒体识别', local: '本地保存', adblock: '广告过滤', network: '网络速度', currentSpeed: '当前系统网络速度', queue: '下载队列', openQueue: '打开下载队列' },
  'zh-TW': { media: '媒體識別', local: '本機儲存', adblock: '廣告過濾', network: '網路速度', currentSpeed: '目前系統網路速度', queue: '下載佇列', openQueue: '開啟下載佇列' },
  en: { media: 'Media', local: 'Local save', adblock: 'Ad blocker', network: 'Network speed', currentSpeed: 'Current system network speed', queue: 'Queue', openQueue: 'Open download queue' },
};
const EXTERNAL_LOGIN_TEXT = {
  'zh-CN': {
    externalLoginButton: '使用系统浏览器登录 YouTube',
    externalLoginTitle: '使用系统浏览器登录 YouTube',
    externalLoginSubtitle: 'Google 验证将在你电脑上的浏览器中完成，VidoGo 不会读取账号密码。',
    externalLoginStepOpenTitle: '完成浏览器登录',
    externalLoginStepOpenCopy: '在刚打开的浏览器中完成 Google 验证，并确认已经进入 YouTube。',
    externalLoginStepCloseTitle: '保持登录窗口打开',
    externalLoginStepCloseCopy: '验证完成后不要关闭该窗口，VidoGo 会通过仅限本机的通道读取登录结果。',
    externalLoginStepSyncTitle: '同步登录状态',
    externalLoginStepSyncCopy: '回到 VidoGo 点击同步；成功后登录窗口会自动关闭并刷新 YouTube。',
    externalLoginBrowserLabel: '登录使用的浏览器',
    externalLoginWaiting: '等待你在外部登录窗口中完成登录。完成后请保持该窗口打开，再点击“同步并刷新”。',
    externalLoginOpening: '正在打开系统浏览器…',
    externalLoginSyncing: '正在从所选浏览器读取 YouTube 登录状态，请稍候…',
    externalLoginSuccess: '已同步 {count} 项登录信息，正在刷新 YouTube。',
    externalLoginFailed: '同步失败：{message}',
    externalLoginReopen: '重新打开登录页',
    externalLoginSync: '已完成登录，同步并刷新',
    externalLoginPrivacy: 'VidoGo 使用独立的浏览器登录配置，仅通过本机通道同步 Google/YouTube Cookie；不读取密码、不上传服务器、不导出明文 Cookie 文件。',
    externalLoginNoCookies: '没有找到 Google/YouTube 登录信息。请确认已在刚打开的登录窗口中进入 YouTube，并保持该窗口打开。',
  },
  'zh-TW': {
    externalLoginButton: '使用系統瀏覽器登入 YouTube',
    externalLoginTitle: '使用系統瀏覽器登入 YouTube',
    externalLoginSubtitle: 'Google 驗證會在電腦上的瀏覽器中完成，VidoGo 不會讀取帳號密碼。',
    externalLoginStepOpenTitle: '完成瀏覽器登入',
    externalLoginStepOpenCopy: '在剛開啟的瀏覽器中完成 Google 驗證，並確認已進入 YouTube。',
    externalLoginStepCloseTitle: '保持登入視窗開啟',
    externalLoginStepCloseCopy: '驗證完成後不要關閉該視窗，VidoGo 會透過僅限本機的通道讀取登入結果。',
    externalLoginStepSyncTitle: '同步登入狀態',
    externalLoginStepSyncCopy: '回到 VidoGo 按同步；成功後登入視窗會自動關閉並重新整理 YouTube。',
    externalLoginBrowserLabel: '登入使用的瀏覽器',
    externalLoginWaiting: '等待你在外部登入視窗中完成登入。完成後請保持該視窗開啟，再按「同步並重新整理」。',
    externalLoginOpening: '正在開啟系統瀏覽器…',
    externalLoginSyncing: '正在從所選瀏覽器讀取 YouTube 登入狀態，請稍候…',
    externalLoginSuccess: '已同步 {count} 項登入資訊，正在重新整理 YouTube。',
    externalLoginFailed: '同步失敗：{message}',
    externalLoginReopen: '重新開啟登入頁',
    externalLoginSync: '已完成登入，同步並重新整理',
    externalLoginPrivacy: 'VidoGo 使用獨立的瀏覽器登入設定，僅透過本機通道同步 Google/YouTube Cookie；不讀取密碼、不上傳伺服器、不匯出明文 Cookie 檔案。',
    externalLoginNoCookies: '找不到 Google/YouTube 登入資訊。請確認已在剛開啟的登入視窗中進入 YouTube，並保持該視窗開啟。',
  },
  en: {
    externalLoginButton: 'Sign in to YouTube in your system browser',
    externalLoginTitle: 'Sign in to YouTube in your system browser',
    externalLoginSubtitle: 'Google verification happens in a browser on this computer. VidoGo never reads your password.',
    externalLoginStepOpenTitle: 'Complete browser sign-in',
    externalLoginStepOpenCopy: 'Complete Google verification in the browser that opened and make sure YouTube is signed in.',
    externalLoginStepCloseTitle: 'Keep the login window open',
    externalLoginStepCloseCopy: 'After verification, leave that window open so VidoGo can read the result over a local-only connection.',
    externalLoginStepSyncTitle: 'Sync the sign-in state',
    externalLoginStepSyncCopy: 'Return to VidoGo and sync. The login window closes automatically after YouTube refreshes.',
    externalLoginBrowserLabel: 'Browser used to sign in',
    externalLoginWaiting: 'Waiting for sign-in in the external login window. Keep that window open, then choose Sync and refresh.',
    externalLoginOpening: 'Opening your system browser…',
    externalLoginSyncing: 'Reading the YouTube sign-in state from the selected browser…',
    externalLoginSuccess: 'Synced {count} sign-in items. Refreshing YouTube.',
    externalLoginFailed: 'Sync failed: {message}',
    externalLoginReopen: 'Reopen sign-in page',
    externalLoginSync: 'I am signed in — sync and refresh',
    externalLoginPrivacy: 'VidoGo uses an isolated browser login profile and copies only Google/YouTube cookies over a local-only connection. Passwords are never read, data is not uploaded, and no plaintext cookie file is exported.',
    externalLoginNoCookies: 'No Google/YouTube sign-in data was found. Make sure YouTube is signed in in the login window and keep that window open.',
  },
};
for (const locale of I18N.localeOrder) Object.assign(TEXT_TABLES[locale], EXTERNAL_LOGIN_TEXT[locale] || EXTERNAL_LOGIN_TEXT.en);
const TITLEBAR_ACCOUNT_TEXT = {
  'zh-CN': { signedOut: '未登录 · 免费版', remaining: '今日剩余 {remaining}/{limit}', unlimited: '下载不限', open: '查看账户信息' },
  'zh-TW': { signedOut: '未登入 · 免費版', remaining: '今日剩餘 {remaining}/{limit}', unlimited: '下載不限', open: '查看帳戶資訊' },
  en: { signedOut: 'Signed out · Free', remaining: '{remaining}/{limit} left today', unlimited: 'Unlimited downloads', open: 'View account' },
};
const MEDIA_CONTEXT_TEXT = {
  'zh-CN': { currentMedia: '当前视频', batchMedia: '批量', selectAllMedia: '全选', downloadSelectedMedia: '下载所选', selectMediaFirst: '请先选择要下载的视频。', resolvingEpisode: '正在识别第 {current}/{total} 集…', batchResolveDone: '批量处理完成：已开始 {started} 个，未识别 {failed} 个。', batchResolveFailed: '未能识别所选分集的真实视频，请先打开其中一集并播放后再试。' },
  'zh-TW': { currentMedia: '目前影片', batchMedia: '批次', selectAllMedia: '全選', downloadSelectedMedia: '下載所選', selectMediaFirst: '請先選擇要下載的影片。', resolvingEpisode: '正在辨識第 {current}/{total} 集…', batchResolveDone: '批次處理完成：已開始 {started} 個，未辨識 {failed} 個。', batchResolveFailed: '無法辨識所選分集的真實影片，請先開啟其中一集並播放後再試。' },
  en: { currentMedia: 'Current', batchMedia: 'Batch', selectAllMedia: 'Select all', downloadSelectedMedia: 'Download selected', selectMediaFirst: 'Select at least one video.', resolvingEpisode: 'Detecting episode {current}/{total}…', batchResolveDone: 'Batch ready: {started} started, {failed} not detected.', batchResolveFailed: 'The selected episodes could not be detected. Open and play one episode, then try again.' },
};
for (const locale of I18N.localeOrder) Object.assign(TEXT_TABLES[locale], MEDIA_CONTEXT_TEXT[locale] || MEDIA_CONTEXT_TEXT.en);

const SHELL_EXPERIENCE_TEXT = {
  'zh-CN': {
    flow: ['浏览', '识别', '选择', '保存'],
    storyTitle: '让浏览、套餐和下载记录保持同步',
    storyCopy: '登录后即可从管理平台安全读取权益，在同一个工作台继续你的任务。',
    benefits: ['同步套餐与额度', '查看订单与支付状态', '账户数据独立加密存储'],
    footnote: '凭据仅发送到你配置的 VidoGo 管理平台',
  },
  'zh-TW': {
    flow: ['瀏覽', '辨識', '選擇', '儲存'],
    storyTitle: '讓瀏覽、方案與下載記錄保持同步',
    storyCopy: '登入後即可從管理平台安全讀取權益，在同一個工作台繼續你的任務。',
    benefits: ['同步方案與額度', '查看訂單與付款狀態', '帳戶資料獨立加密儲存'],
    footnote: '憑證只會傳送至你設定的 VidoGo 管理平台',
  },
  en: {
    flow: ['Browse', 'Detect', 'Choose', 'Save'],
    storyTitle: 'Keep browsing, plans and downloads in sync',
    storyCopy: 'Sign in to securely read your entitlements and continue every task from one workspace.',
    benefits: ['Sync plans and usage', 'Review orders and payment status', 'Keep account data encrypted'],
    footnote: 'Credentials are sent only to your configured VidoGo admin service',
  },
  ru: {
    flow: ['Обзор', 'Поиск', 'Выбор', 'Сохранить'],
    storyTitle: 'Синхронизируйте просмотр, тариф и загрузки',
    storyCopy: 'Войдите, чтобы безопасно получить права доступа и продолжить задачи в одном рабочем пространстве.',
    benefits: ['Синхронизация тарифа и лимитов', 'Заказы и статус оплаты', 'Шифрование данных аккаунта'],
    footnote: 'Данные отправляются только в настроенную службу VidoGo',
  },
  pt: {
    flow: ['Navegar', 'Detectar', 'Escolher', 'Salvar'],
    storyTitle: 'Mantenha navegação, plano e downloads sincronizados',
    storyCopy: 'Entre para consultar seus benefícios com segurança e continuar as tarefas em um único espaço.',
    benefits: ['Sincronizar plano e limites', 'Ver pedidos e pagamentos', 'Dados da conta criptografados'],
    footnote: 'As credenciais são enviadas apenas ao serviço VidoGo configurado',
  },
  vi: {
    flow: ['Duyệt', 'Nhận diện', 'Chọn', 'Lưu'],
    storyTitle: 'Đồng bộ trình duyệt, gói dịch vụ và lượt tải',
    storyCopy: 'Đăng nhập để đọc quyền lợi an toàn và tiếp tục mọi tác vụ trong cùng một không gian.',
    benefits: ['Đồng bộ gói và hạn mức', 'Xem đơn hàng và thanh toán', 'Mã hóa dữ liệu tài khoản'],
    footnote: 'Thông tin chỉ được gửi tới dịch vụ VidoGo bạn đã cấu hình',
  },
  th: {
    flow: ['เรียกดู', 'ตรวจจับ', 'เลือก', 'บันทึก'],
    storyTitle: 'ซิงค์การเรียกดู แพ็กเกจ และรายการดาวน์โหลด',
    storyCopy: 'เข้าสู่ระบบเพื่ออ่านสิทธิ์อย่างปลอดภัยและทำงานต่อจากพื้นที่เดียว',
    benefits: ['ซิงค์แพ็กเกจและโควตา', 'ดูคำสั่งซื้อและการชำระเงิน', 'เข้ารหัสข้อมูลบัญชี'],
    footnote: 'ข้อมูลจะถูกส่งไปยังบริการ VidoGo ที่คุณตั้งค่าไว้เท่านั้น',
  },
  ar: {
    flow: ['تصفح', 'اكتشاف', 'اختيار', 'حفظ'],
    storyTitle: 'زامن التصفح والباقات والتنزيلات',
    storyCopy: 'سجل الدخول لقراءة مزاياك بأمان ومتابعة جميع المهام من مساحة عمل واحدة.',
    benefits: ['مزامنة الباقة والحدود', 'عرض الطلبات وحالة الدفع', 'تشفير بيانات الحساب'],
    footnote: 'ترسل بيانات الدخول فقط إلى خدمة VidoGo التي أعددتها',
  },
};

const els = {
  body: document.body,
  title: document.getElementById('window-title'),
  titlebarAccount: document.getElementById('titlebar-account'),
  titlebarAccountState: document.getElementById('titlebar-account-state'),
  titlebarAccountQuota: document.getElementById('titlebar-account-quota'),
  sidebar: Array.from(document.querySelectorAll('.sidebar-btn')),
  downloadBadge: document.getElementById('download-badge'),
  pages: Object.fromEntries(Array.from(document.querySelectorAll('.page')).map((page) => [page.id.replace('page-', ''), page])),
  tabStrip: document.getElementById('tab-strip'),
  tabbar: document.getElementById('browser-tabbar'),
  tabAdd: document.getElementById('tab-add'),
  homeTagline: document.getElementById('home-tagline'),
  platformGroups: document.getElementById('platform-groups'),
  platformManageButton: document.getElementById('platform-manage-button'),
  platformManageLabel: document.getElementById('platform-manage-label'),
  homeFlowBrowser: document.getElementById('home-flow-browser'),
  homeFlowDetect: document.getElementById('home-flow-detect'),
  homeFlowChoose: document.getElementById('home-flow-choose'),
  homeFlowSave: document.getElementById('home-flow-save'),
  browserStage: document.getElementById('browser-stage'),
  browserSplit: document.getElementById('browser-split'),
  browserSide: document.getElementById('browser-side'),
  back: document.getElementById('nav-back'),
  forward: document.getElementById('nav-forward'),
  reload: document.getElementById('nav-reload'),
  reloadIcon: document.getElementById('nav-reload-icon'),
  address: document.getElementById('address-input'),
  browserSideTitle: document.getElementById('browser-side-title'),
  recommend: document.querySelector('[data-side-tab="recommend"]'),
  allMedia: document.querySelector('[data-side-tab="all"]'),
  mediaCount: document.getElementById('media-count'),
  browserStatusMediaLabel: document.getElementById('browser-status-media-label'),
  browserStatusMediaCount: document.getElementById('browser-status-media-count'),
  browserStatusLocalLabel: document.getElementById('browser-status-local-label'),
  browserStatusAdblockLabel: document.getElementById('browser-status-adblock-label'),
  browserStatusAdblockState: document.getElementById('browser-status-adblock-state'),
  browserStatusNetwork: document.getElementById('browser-status-network'),
  browserStatusNetworkLabel: document.getElementById('browser-status-network-label'),
  browserStatusNetworkSpeed: document.getElementById('browser-status-network-speed'),
  browserStatusDownloads: document.getElementById('browser-status-downloads'),
  browserStatusDownloadLabel: document.getElementById('browser-status-download-label'),
  browserStatusDownloadCount: document.getElementById('browser-status-download-count'),
  recommendCount: document.getElementById('recommend-count'),
  allCount: document.getElementById('all-count'),
  mediaPanelTabs: document.querySelector('.media-panel-tabs'),
  mediaContextSwitch: document.getElementById('media-context-switch'),
  mediaModeButtons: Array.from(document.querySelectorAll('[data-media-mode]')),
  batchMediaCount: document.getElementById('batch-media-count'),
  batchMediaToolbar: document.getElementById('batch-media-toolbar'),
  batchSelectAll: document.getElementById('batch-select-all'),
  batchSelectAllLabel: document.getElementById('batch-select-all-label'),
  batchDownloadSelected: document.getElementById('batch-download-selected'),
  batchDownloadLabel: document.getElementById('batch-download-label'),
  browserQualityLabel: document.getElementById('browser-quality-label'),
  browserQuality: document.getElementById('browser-quality'),
  downloadQuality: document.getElementById('download-quality'),
  candidateList: document.getElementById('candidate-list'),
  pageFavorite: document.getElementById('page-favorite'),
  browserLoginButton: document.getElementById('browser-login-button'),
  pageFavoriteIcon: document.getElementById('page-favorite-icon'),
  favoritesPopover: document.getElementById('favorites-popover'),
  favoritesPopoverCount: document.getElementById('favorites-popover-count'),
  favoritesPopoverContent: document.getElementById('favorites-popover-content'),
  favoriteCurrentButton: document.getElementById('favorite-current-button'),
  favoriteCurrentLabel: document.getElementById('favorite-current-label'),
  pageMediaToggle: document.getElementById('page-media-toggle'),
  sideRefresh: document.getElementById('side-refresh'),
  sideClose: document.getElementById('side-close'),
  sideTrash: document.getElementById('side-trash'),
  urlInput: document.getElementById('url-input'),
  outputDir: document.getElementById('output-dir'),
  chooseOutput: document.getElementById('choose-output'),
  importUrls: document.getElementById('import-urls'),
  startDownload: document.getElementById('start-download'),
  cancelDownload: document.getElementById('cancel-download'),
  playlistToggle: document.getElementById('playlist-toggle'),
  audioToggle: document.getElementById('audio-toggle'),
  downloadBody: document.getElementById('download-body'),
  downloadHeader: document.getElementById('downloads-header'),
  downloadRange: document.getElementById('download-range'),
  clearFinished: document.getElementById('clear-finished'),
  retryFailedDownloads: document.getElementById('retry-failed-downloads'),
  downloadFilters: document.getElementById('download-filters'),
  libraryRefresh: document.getElementById('library-refresh'),
  libraryRefreshLabel: document.getElementById('library-refresh-label'),
  libraryTabs: document.getElementById('library-tabs'),
  libraryProjectCount: document.getElementById('library-project-count'),
  libraryAssetCount: document.getElementById('library-asset-count'),
  libraryProjectsLabel: document.getElementById('library-projects-label'),
  libraryAssetsLabel: document.getElementById('library-assets-label'),
  librarySearch: document.getElementById('library-search'),
  librarySearchLabel: document.getElementById('library-search-label'),
  libraryProviderFilter: document.getElementById('library-provider-filter'),
  libraryTypeFilter: document.getElementById('library-type-filter'),
  libraryTimeFilter: document.getElementById('library-time-filter'),
  librarySort: document.getElementById('library-sort'),
  libraryGridView: document.getElementById('library-grid-view'),
  libraryListView: document.getElementById('library-list-view'),
  librarySummary: document.getElementById('library-summary'),
  libraryContent: document.getElementById('library-content'),
  libraryDetailOverlay: document.getElementById('library-detail-overlay'),
  libraryDetailScrim: document.getElementById('library-detail-scrim'),
  libraryDetailCover: document.getElementById('library-detail-cover'),
  libraryDetailTitle: document.getElementById('library-detail-title'),
  libraryDetailEyebrow: document.getElementById('library-detail-eyebrow'),
  libraryDetailClose: document.getElementById('library-detail-close'),
  libraryDetailBody: document.getElementById('library-detail-body'),
  historyList: document.getElementById('history-list'),
  historyRange: document.getElementById('history-range'),
  historyClear: document.getElementById('history-clear'),
  favoritesCount: document.getElementById('favorites-count'),
  favoritesTitle: document.getElementById('favorites-title'),
  planTable: document.getElementById('plan-table'),
  planCards: document.getElementById('plan-cards'),
  purchaseButton: document.getElementById('purchase-button'),
  purchasePrice: document.getElementById('purchase-price'),
  paymentChannels: Array.from(document.querySelectorAll('[data-payment-channel]')),
  payssionMethod: document.getElementById('payssion-method'),
  accountRefresh: document.getElementById('account-refresh'),
  accountAuthPanel: document.getElementById('account-auth-panel'),
  authStoryTitle: document.getElementById('auth-story-title'),
  authStoryCopy: document.getElementById('auth-story-copy'),
  authBenefitPlan: document.getElementById('auth-benefit-plan'),
  authBenefitOrders: document.getElementById('auth-benefit-orders'),
  authBenefitSecurity: document.getElementById('auth-benefit-security'),
  authFootnote: document.getElementById('auth-footnote'),
  accountProfilePanel: document.getElementById('account-profile-panel'),
  loginModeButton: document.getElementById('login-mode-button'),
  registerModeButton: document.getElementById('register-mode-button'),
  loginButton: document.getElementById('login-button'),
  registerButton: document.getElementById('register-button'),
  loginEmail: document.getElementById('login-email'),
  loginPassword: document.getElementById('login-password'),
  accountAuthError: document.getElementById('account-auth-error'),
  accountAuthErrorCopy: document.getElementById('account-auth-error-copy'),
  passwordVisibilityToggles: Array.from(document.querySelectorAll('[data-password-target]')),
  confirmPasswordField: document.getElementById('confirm-password-field'),
  confirmPassword: document.getElementById('confirm-password'),
  logoutButton: document.getElementById('logout-button'),
  accountViewPlans: document.getElementById('account-view-plans'),
  accountChangePasswordToggle: document.getElementById('account-change-password-toggle'),
  accountPasswordPanel: document.getElementById('account-password-panel'),
  oldPassword: document.getElementById('old-password'),
  newPassword: document.getElementById('new-password'),
  savePasswordButton: document.getElementById('save-password-button'),
  cancelPasswordButton: document.getElementById('cancel-password-button'),
  ordersList: document.getElementById('orders-list'),
  accountOrdersPanel: document.getElementById('account-orders-panel'),
  settingsTitle: document.getElementById('settings-title'),
  settingsNav: Array.from(document.querySelectorAll('[data-settings-section]')),
  settingsPanels: Array.from(document.querySelectorAll('[data-settings-panel]')),
  settingsTheme: document.getElementById('settings-theme-control'),
  settingsLanguage: document.getElementById('settings-language-control'),
  settingsSearchEngine: document.getElementById('settings-search-engine-control'),
  settingsAdBlock: document.getElementById('settings-adblock-control'),
  settingsAdBlockState: document.getElementById('settings-adblock-state'),
  settingsOutputDir: document.getElementById('settings-output-dir'),
  settingsChooseOutput: document.getElementById('settings-choose-output'),
  settingsResetOutput: document.getElementById('settings-reset-output'),
  settingsConcurrency: document.getElementById('settings-concurrency'),
  settingsConcurrencyDecrease: document.getElementById('settings-concurrency-decrease'),
  settingsConcurrencyIncrease: document.getElementById('settings-concurrency-increase'),
  settingsConcurrencyLimit: document.getElementById('settings-concurrency-limit'),
  settingsConcurrencyPlans: document.getElementById('settings-concurrency-plans'),
  settingsRecording: document.getElementById('settings-recording-control'),
  settingsRecordingState: document.getElementById('settings-recording-state'),
  settingsEditor: document.getElementById('settings-editor-control'),
  settingsEditorPath: document.getElementById('settings-editor-path'),
  settingsEditorScan: document.getElementById('settings-editor-scan'),
  settingsEditorScanLabel: document.getElementById('settings-editor-scan-label'),
  settingsEditorChoose: document.getElementById('settings-editor-choose'),
  settingsEditorChooseLabel: document.getElementById('settings-editor-choose-label'),
  settingsCheckUpdate: document.getElementById('settings-check-update'),
  settingsVersion: document.getElementById('settings-version'),
  settingsLatestVersion: document.getElementById('settings-latest-version'),
  platformManagerOverlay: document.getElementById('platform-manager-overlay'),
  platformManagerClose: document.getElementById('platform-manager-close'),
  platformResetButton: document.getElementById('platform-reset-button'),
  platformCategoryAdd: document.getElementById('platform-category-add'),
  platformCategoryList: document.getElementById('platform-category-list'),
  platformSiteAdd: document.getElementById('platform-site-add'),
  platformSiteList: document.getElementById('platform-site-list'),
  platformEditor: document.getElementById('platform-editor'),
  platformEditId: document.getElementById('platform-edit-id'),
  platformEditName: document.getElementById('platform-edit-name'),
  platformEditUrl: document.getElementById('platform-edit-url'),
  platformEditCategory: document.getElementById('platform-edit-category'),
  platformIconPreview: document.getElementById('platform-icon-preview'),
  platformIconAuto: document.getElementById('platform-icon-auto'),
  platformIconChoose: document.getElementById('platform-icon-choose'),
  platformEditCancel: document.getElementById('platform-edit-cancel'),
  categoryEditor: document.getElementById('category-editor'),
  categoryEditId: document.getElementById('category-edit-id'),
  categoryEditName: document.getElementById('category-edit-name'),
  categoryEditCancel: document.getElementById('category-edit-cancel'),
  externalLoginOverlay: document.getElementById('external-login-overlay'),
  externalLoginClose: document.getElementById('external-login-close'),
  externalLoginBrowser: document.getElementById('external-login-browser'),
  externalLoginStatus: document.getElementById('external-login-status'),
  externalLoginReopen: document.getElementById('external-login-reopen'),
  externalLoginSync: document.getElementById('external-login-sync'),
  mediaPreviewOverlay: document.getElementById('media-preview-overlay'),
  mediaPreviewDialog: document.getElementById('media-preview-dialog'),
  mediaPreviewClose: document.getElementById('media-preview-close'),
  mediaPreviewKind: document.getElementById('media-preview-kind'),
  mediaPreviewTitle: document.getElementById('media-preview-title'),
  mediaPreviewBody: document.getElementById('media-preview-body'),
  mediaPreviewStatus: document.getElementById('media-preview-status'),
  mediaPreviewSystemOpen: document.getElementById('media-preview-system-open'),
  mediaPreviewSystemOpenLabel: document.getElementById('media-preview-system-open-label'),
  toastRegion: document.getElementById('toast-region'),
};

const state = {
  theme: localStorage.getItem(STORAGE_KEYS.theme) || 'dark',
  locale: I18N.resolveSupportedLocale(localStorage.getItem(STORAGE_KEYS.locale)) || 'zh-CN',
  section: 'browser',
  navSection: 'browser',
  browserSideTab: 'recommend',
  mediaPanelVisible: true,
  favoritesPopoverOpen: false,
  activeSettingsSection: 'interface',
  tabs: [],
  activeTabId: null,
  tabCounter: 0,
  running: false,
  retryingFailedDownloads: false,
  activeDownloadStatus: 'all',
  downloadPage: 1,
  accountMode: 'login',
  passwordPanelOpen: false,
  account: {},
  users: [],
  orders: [],
  selectedPlan: 'ultimate_month',
  paymentChannel: 'stripe',
  queue: readArray(STORAGE_KEYS.downloads),
  downloadRange: 'all',
  historyRange: 'all',
  history: readArray(STORAGE_KEYS.history),
  favorites: readArray(STORAGE_KEYS.favorites),
  platformConfig: { schemaVersion: 1, categories: [], platforms: [] },
  activePlatformCategoryId: null,
  platformEditorIcon: '',
  candidatesByTabId: {},
  mediaCollectionsByTabId: {},
  mediaModeByTabId: {},
  selectedBatchCandidateIdsByTabId: {},
  selectedCandidateIdsByTabId: {},
  expandedCandidateIdsByTabId: {},
  selectedSubtitleAssetKeysByCandidateId: {},
  selectedMinimumResolutionByTabId: {},
  settings: {
    outputDir: '',
    resolution: 'best',
    playlist: false,
    audioOnly: false,
    maxConcurrentDownloads: 1,
    searchEngine: 'google',
    adBlocker: true,
    recordingEnabled: false,
  },
  runtimeInfo: null,
  entitlements: null,
  downloadDiagnostics: [],
  updateInfo: null,
  externalLoginBusy: false,
  externalLoginCanSync: false,
  previewItem: null,
  editor: { selected: null, editors: [], scanning: false, importing: false },
  library: {
    loaded: false,
    loading: false,
    error: '',
    items: [],
    projects: [],
    tab: 'projects',
    query: '',
    provider: 'all',
    assetType: 'all',
    timeRange: 'all',
    sort: 'recent',
    view: 'grid',
    selectedProjectId: null,
    previewUrls: new Map(),
  },
  systemNetworkSpeed: {
    available: false,
    receivedBytesPerSecond: 0,
    sentBytesPerSecond: 0,
    totalBytesPerSecond: 0,
  },
};

let webviewResizeFrame = 0;
let systemNetworkSpeedTimer = 0;
let systemNetworkSpeedRefreshPending = false;

function readArray(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || '[]');
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function readObject(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || '{}');
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  } catch {
    return {};
  }
}

function text(key, vars = {}) {
  const table = TEXT_TABLES[state.locale] || TEXT_TABLES.en;
  return String(table[key] || TEXT_TABLES.en[key] || key).replace(/\{(\w+)\}/g, (_, name) => vars[name] ?? '');
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[char]));
}

function iconSvg(name, className = 'ui-icon') {
  return window.VidoGoIcons?.svg?.(name, className) || '';
}

function hydrateIcons(root = document) {
  window.VidoGoIcons?.hydrate?.(root);
}

function setIcon(element, name) {
  if (!element) return;
  element.dataset.icon = name;
  window.VidoGoIcons?.mount?.(element, name);
}

function saveState() {
  localStorage.setItem(STORAGE_KEYS.theme, state.theme);
  localStorage.setItem(STORAGE_KEYS.locale, state.locale);
  localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(state.settings));
  localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(state.history.slice(0, 150)));
  localStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify(state.favorites.slice(0, 150)));
  localStorage.setItem(STORAGE_KEYS.downloads, JSON.stringify(state.queue.slice(0, 300)));
  localStorage.removeItem(STORAGE_KEYS.account);
  localStorage.removeItem(STORAGE_KEYS.users);
  localStorage.removeItem(STORAGE_KEYS.orders);
}

function resolveTheme() {
  if (state.theme !== 'system') return state.theme;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme() {
  els.body.dataset.theme = state.theme;
  const resolvedTheme = resolveTheme();
  els.body.dataset.resolvedTheme = resolvedTheme;
  if (els.settingsTheme) els.settingsTheme.value = state.theme;
  void window.mediaDeck?.setTitleBarTheme?.(resolvedTheme);
}

function applyLocale() {
  state.locale = I18N.resolveSupportedLocale(state.locale) || 'zh-CN';
  document.documentElement.lang = state.locale;
  document.documentElement.dir = I18N.getDirection(state.locale);
  document.title = text('title');
  els.title.textContent = text('title');
  updateTitlebarAccount();
  els.homeTagline.textContent = text('homeSlogan');
  els.platformManageLabel.textContent = text('platformManager');
  els.platformManageButton.title = text('platformManager');
  els.platformManageButton.setAttribute('aria-label', text('platformManager'));
  document.getElementById('platform-manager-title').textContent = text('platformManager');
  document.getElementById('platform-manager-subtitle').textContent = text('platformManagerSubtitle');
  document.getElementById('platform-category-title').textContent = text('platformCategory');
  document.getElementById('platform-site-title').textContent = text('platformSite');
  document.getElementById('platform-site-add-label').textContent = text('addPlatform');
  document.getElementById('platform-edit-name-label').textContent = text('platformName');
  document.getElementById('platform-edit-url-label').textContent = text('platformUrl');
  document.getElementById('platform-edit-category-label').textContent = text('platformCategory');
  document.getElementById('platform-edit-icon-label').textContent = text('platformIcon');
  document.getElementById('category-edit-name-label').textContent = text('categoryName');
  els.platformIconAuto.textContent = text('autoIcon');
  els.platformIconChoose.textContent = text('chooseImage');
  els.platformEditCancel.textContent = text('cancel');
  document.getElementById('platform-edit-save').textContent = text('save');
  els.categoryEditCancel.textContent = text('cancel');
  document.getElementById('category-edit-save').textContent = text('save');
  els.platformResetButton.textContent = text('restoreDefaults');
  els.platformManagerClose.title = text('close');
  els.platformManagerClose.setAttribute('aria-label', text('close'));
  const shellCopy = SHELL_EXPERIENCE_TEXT[state.locale] || SHELL_EXPERIENCE_TEXT.en;
  [els.homeFlowBrowser, els.homeFlowDetect, els.homeFlowChoose, els.homeFlowSave].forEach((element, index) => {
    if (element) element.textContent = shellCopy.flow[index];
  });
  if (els.authStoryTitle) els.authStoryTitle.textContent = shellCopy.storyTitle;
  if (els.authStoryCopy) els.authStoryCopy.textContent = shellCopy.storyCopy;
  [els.authBenefitPlan, els.authBenefitOrders, els.authBenefitSecurity].forEach((element, index) => {
    if (element) element.textContent = shellCopy.benefits[index];
  });
  if (els.authFootnote) els.authFootnote.textContent = shellCopy.footnote;
  els.address.placeholder = text('currentAddress');
  els.back.title = text('back');
  els.back.setAttribute('aria-label', text('back'));
  els.forward.title = text('forward');
  els.forward.setAttribute('aria-label', text('forward'));
  els.tabAdd.title = text('newTab');
  els.tabAdd.setAttribute('aria-label', text('newTab'));
  els.pageFavorite.title = text('favoritesTitle');
  els.pageFavorite.setAttribute('aria-label', text('favoritesTitle'));
  els.browserLoginButton.title = text('externalLoginButton');
  els.browserLoginButton.setAttribute('aria-label', text('externalLoginButton'));
  document.getElementById('external-login-title').textContent = text('externalLoginTitle');
  document.getElementById('external-login-subtitle').textContent = text('externalLoginSubtitle');
  document.getElementById('external-login-step-open-title').textContent = text('externalLoginStepOpenTitle');
  document.getElementById('external-login-step-open-copy').textContent = text('externalLoginStepOpenCopy');
  document.getElementById('external-login-step-close-title').textContent = text('externalLoginStepCloseTitle');
  document.getElementById('external-login-step-close-copy').textContent = text('externalLoginStepCloseCopy');
  document.getElementById('external-login-step-sync-title').textContent = text('externalLoginStepSyncTitle');
  document.getElementById('external-login-step-sync-copy').textContent = text('externalLoginStepSyncCopy');
  document.getElementById('external-login-browser-label').textContent = text('externalLoginBrowserLabel');
  document.getElementById('external-login-reopen-label').textContent = text('externalLoginReopen');
  document.getElementById('external-login-sync-label').textContent = text('externalLoginSync');
  document.getElementById('external-login-privacy').textContent = text('externalLoginPrivacy');
  els.externalLoginClose.title = text('close');
  els.externalLoginClose.setAttribute('aria-label', text('close'));
  els.pageMediaToggle.title = state.mediaPanelVisible ? text('closePanel') : text('openPanel');
  els.pageMediaToggle.setAttribute('aria-label', state.mediaPanelVisible ? text('closePanel') : text('openPanel'));
  els.browserSideTitle.textContent = text('mediaPanel');
  els.sideRefresh.title = text('refresh');
  els.sideRefresh.setAttribute('aria-label', text('refresh'));
  els.sideTrash.title = text('clear');
  els.sideTrash.setAttribute('aria-label', text('clear'));
  els.sideClose.title = text('closePanel');
  els.sideClose.setAttribute('aria-label', text('closePanel'));
  els.browserQualityLabel.textContent = text('quality');
  els.mediaModeButtons.find((button) => button.dataset.mediaMode === 'current').childNodes[0].textContent = text('currentMedia');
  els.mediaModeButtons.find((button) => button.dataset.mediaMode === 'batch').childNodes[0].textContent = `${text('batchMedia')} `;
  els.batchSelectAllLabel.textContent = text('selectAllMedia');
  els.batchDownloadLabel.textContent = text('downloadSelectedMedia');
  document.getElementById('download-url-summary').textContent = text('addDownloadTask');
  document.getElementById('output-dir-label').textContent = text('outputFolder');
  document.getElementById('download-quality-label').textContent = text('quality');
  document.getElementById('playlist-label').textContent = text('allowPlaylists');
  document.getElementById('audio-label').textContent = text('audioOnly');
  els.chooseOutput.textContent = text('browse');
  els.importUrls.textContent = text('importList');
  els.cancelDownload.textContent = text('cancel');
  els.startDownload.textContent = text('startDownload');
  els.clearFinished.querySelector('span:last-child').textContent = text('clearFinished');
  els.retryFailedDownloads.querySelector('span:last-child').textContent = text('retryAllFailed');
  document.getElementById('head-file').textContent = text('fileName');
  document.getElementById('head-type').textContent = text('assetType');
  document.getElementById('head-progress').textContent = text('progress');
  document.getElementById('head-downloaded').textContent = text('downloaded');
  document.getElementById('head-size').textContent = text('fileSize');
  document.getElementById('head-time').textContent = text('downloadTime');
  document.getElementById('head-status').textContent = text('downloadStatus');
  document.getElementById('head-result').textContent = text('resultDetails');
  document.getElementById('head-action').textContent = text('action');
  els.mediaPreviewTitle.textContent = text('mediaPreview');
  els.mediaPreviewSystemOpenLabel.textContent = text('openWithSystem');
  els.mediaPreviewClose.title = text('close');
  els.mediaPreviewClose.setAttribute('aria-label', text('close'));
  els.historyClear.querySelector('span:last-child').textContent = text('clear');
  els.favoritesTitle.textContent = text('favoritesTitle');
  document.getElementById('favorites-popover-title').textContent = text('favoritesTitle');
  document.getElementById('plans-title').textContent = text('plansTitle');
  document.getElementById('plans-subtitle').textContent = text('plansSubtitle');
  document.getElementById('purchase-title').textContent = text('purchaseTitle');
  els.purchaseButton.textContent = text('purchase');
  updateAccountCopy();
  updateSettingsCopy();
  renderMediaResolutionFilter();
  renderQualitySelect(els.downloadQuality);
  renderRangeSelect(els.downloadRange, state.downloadRange);
  renderRangeSelect(els.historyRange, state.historyRange);
  updateLibraryCopy();
  els.sidebar.forEach((button) => {
    const label = text(button.dataset.section);
    button.removeAttribute('title');
    button.dataset.tooltip = label;
    button.setAttribute('aria-label', label);
  });
  if (els.settingsLanguage) els.settingsLanguage.value = state.locale;
  void window.mediaDeck?.setPreferredLanguage?.(state.locale);
  renderTabs();
  renderCandidates();
  renderDownloads();
  renderHistory();
  renderFavorites();
  renderPlans();
  renderQuickSites();
  renderPlatformManager();
  hydrateIcons();
}

function updateSettingsCopy() {
  els.settingsTitle.textContent = text('settingsTitle');
  document.getElementById('settings-nav-interface').textContent = text('settingsInterface');
  document.getElementById('settings-nav-downloads').textContent = text('downloads');
  document.getElementById('settings-nav-preferences').textContent = text('settingsPreferences');
  document.getElementById('settings-nav-about').textContent = text('settingsAbout');
  document.getElementById('settings-theme-title').textContent = text('theme');
  document.getElementById('settings-theme-description').textContent = text('settingsThemeDescription');
  els.settingsTheme.querySelector('option[value="light"]').textContent = text('light');
  els.settingsTheme.querySelector('option[value="dark"]').textContent = text('dark');
  document.getElementById('settings-language-title').textContent = text('language');
  document.getElementById('settings-language-description').textContent = text('settingsLanguageDescription');
  els.settingsLanguage.innerHTML = I18N.localeOrder.map((locale) => (
    `<option value="${locale}">${escapeHtml(I18N.nativeLanguageNames[locale])}</option>`
  )).join('');
  els.settingsLanguage.value = state.locale;
  document.getElementById('settings-download-dir-title').textContent = text('settingsDownloadDir');
  document.getElementById('settings-download-dir-description').textContent = text('settingsDownloadDirDescription');
  document.getElementById('settings-choose-output-label').textContent = text('chooseDownloadDirectory');
  document.getElementById('settings-reset-output-label').textContent = text('resetDownloadDirectory');
  document.getElementById('settings-concurrency-title').textContent = text('maxConcurrentDownloads');
  document.getElementById('settings-concurrency-description').textContent = text('maxConcurrentDownloadsDescription');
  els.settingsConcurrencyDecrease.title = text('decrease');
  els.settingsConcurrencyDecrease.setAttribute('aria-label', text('decrease'));
  els.settingsConcurrencyIncrease.title = text('increase');
  els.settingsConcurrencyIncrease.setAttribute('aria-label', text('increase'));
  els.settingsConcurrencyPlans.textContent = text('viewPlans');
  document.getElementById('settings-recording-title').textContent = text('recordingFeature');
  document.getElementById('settings-recording-description').textContent = text('recordingFeatureDescription');
  document.getElementById('settings-search-engine-title').textContent = text('defaultSearchEngine');
  document.getElementById('settings-search-engine-description').textContent = text('defaultSearchEngineDescription');
  document.getElementById('settings-editor-title').textContent = text('settingsEditorTitle');
  document.getElementById('settings-editor-description').textContent = text('settingsEditorDescription');
  els.settingsEditorScanLabel.textContent = text(state.editor.scanning ? 'settingsEditorScanning' : 'settingsEditorScan');
  els.settingsEditorChooseLabel.textContent = text('settingsEditorChoose');
  document.getElementById('settings-adblock-title').textContent = text('adBlocker');
  document.getElementById('settings-adblock-description-copy').textContent = text('adBlockerDescription');
  document.getElementById('settings-adblock-notice').textContent = text('adBlockerNotice');
  els.settingsAdBlockState.textContent = text(state.settings.adBlocker !== false ? 'on' : 'off');
  els.settingsRecordingState.textContent = text(state.settings.recordingEnabled === true ? 'on' : 'off');
  document.getElementById('settings-update-title').textContent = text('updates');
  syncUpdateCheckControl();
  document.getElementById('settings-version-title').textContent = text('currentVersion');
  document.getElementById('settings-latest-version-title').textContent = text('latestVersion');
  syncSettingsControls();
}

function syncUpdateCheckControl() {
  if (!els.settingsCheckUpdate) return;
  const canOpenRelease = state.updateInfo?.available === true && Boolean(state.updateInfo.releaseUrl);
  els.settingsCheckUpdate.textContent = text(canOpenRelease ? 'openRelease' : 'checkUpdates');
}

async function handleUpdateCheck() {
  if (state.updateInfo?.available && state.updateInfo.releaseUrl) {
    const didOpen = await window.mediaDeck.openExternal(state.updateInfo.releaseUrl);
    if (!didOpen) toast(text('updateCheckFailed', { message: text('paymentOpenFailed') }));
    return;
  }
  els.settingsCheckUpdate.disabled = true;
  els.settingsCheckUpdate.textContent = text('checkingUpdates');
  try {
    const result = await window.mediaDeck.checkForUpdates();
    state.updateInfo = result && typeof result === 'object' ? result : null;
    els.settingsLatestVersion.textContent = result?.latestVersion || '-';
    if (result?.available) toast(text('updateAvailable', { version: result.latestVersion || '-' }));
    else if (result?.status === 'unpublished') toast(text('updateNotPublished'));
    else if (result?.ok) toast(text('updateUnavailable'));
    else toast(text('updateCheckFailed', { message: result?.message || 'unknown error' }));
  } catch (error) {
    state.updateInfo = null;
    toast(text('updateCheckFailed', { message: error?.message || String(error) }));
  } finally {
    els.settingsCheckUpdate.disabled = false;
    syncUpdateCheckControl();
  }
}

function setSettingsSection(section) {
  const next = ['interface', 'downloads', 'preferences', 'about'].includes(section) ? section : 'interface';
  state.activeSettingsSection = next;
  els.settingsNav.forEach((button) => {
    const active = button.dataset.settingsSection === next;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-current', active ? 'page' : 'false');
  });
  els.settingsPanels.forEach((panel) => {
    const active = panel.dataset.settingsPanel === next;
    panel.hidden = !active;
    panel.classList.toggle('is-active', active);
  });
}

function renderQualitySelect(select) {
  select.innerHTML = QUALITY_OPTIONS.map((option) => {
    const label = option.labelKey ? text(option.labelKey) : option.label;
    return `<option value="${option.value}">${escapeHtml(label)}</option>`;
  }).join('');
  select.value = state.settings.resolution;
}

function renderMediaResolutionFilter(candidates = mediaCandidatesForTab()) {
  const resolutions = mediaResolutionOptions(candidates);
  const selected = selectedMinimumResolution();
  const filter = els.browserQuality.closest('.media-resolution-filter');
  if (filter) filter.hidden = resolutions.length === 0;
  els.browserQuality.innerHTML = [
    `<option value="0">${escapeHtml(text('allResolutions'))}</option>`,
    ...resolutions.map((resolution) => `<option value="${resolution}">≥${resolution}p</option>`),
  ].join('');
  els.browserQuality.value = String(selected);
  els.browserQuality.setAttribute('aria-label', text('quality'));
}

function renderRangeSelect(select, selected) {
  select.innerHTML = [
    { value: 'all', label: text('allTime') },
    { value: 'today', label: text('today') },
    { value: 'yesterday', label: text('yesterday') },
    { value: 'last7', label: text('last7') },
    { value: 'last30', label: text('last30') },
  ].map((option) => `<option value="${option.value}">${escapeHtml(option.label)}</option>`).join('');
  select.value = selected;
}

function syncSettingsControls() {
  const concurrencyLimit = currentConcurrencyLimit();
  const planLevel = currentPlanLevel();
  const planLabel = text(planLevel);
  const unlimitedConcurrency = concurrencyLimit === null;
  if (!unlimitedConcurrency) {
    state.settings.maxConcurrentDownloads = Math.max(1, Math.min(
      concurrencyLimit,
      Number.parseInt(String(state.settings.maxConcurrentDownloads || 1), 10) || 1,
    ));
  }
  els.outputDir.value = state.settings.outputDir || '';
  els.settingsOutputDir.value = state.settings.outputDir || '';
  els.downloadQuality.value = state.settings.resolution;
  els.playlistToggle.checked = state.settings.playlist;
  els.audioToggle.checked = state.settings.audioOnly;
  els.settingsConcurrency.max = unlimitedConcurrency ? '' : String(concurrencyLimit);
  els.settingsConcurrency.value = unlimitedConcurrency ? '' : String(state.settings.maxConcurrentDownloads || 1);
  els.settingsConcurrency.placeholder = unlimitedConcurrency ? '∞' : '';
  els.settingsConcurrency.disabled = unlimitedConcurrency || concurrencyLimit <= 1;
  els.settingsConcurrencyDecrease.disabled = unlimitedConcurrency || Number(els.settingsConcurrency.value) <= 1;
  els.settingsConcurrencyIncrease.disabled = unlimitedConcurrency || Number(els.settingsConcurrency.value) >= concurrencyLimit;
  els.settingsConcurrencyLimit.textContent = unlimitedConcurrency
    ? text('ownerConcurrency')
    : text('concurrencyLimitLabel', { plan: planLabel, count: concurrencyLimit });
  els.settingsConcurrencyPlans.hidden = unlimitedConcurrency || concurrencyLimit >= 10;
  const increaseLabel = unlimitedConcurrency
    ? text('ownerConcurrency')
    : els.settingsConcurrencyIncrease.disabled
    ? text('concurrencyLimitReached', { plan: planLabel, count: concurrencyLimit })
    : text('increase');
  els.settingsConcurrencyIncrease.title = increaseLabel;
  els.settingsConcurrencyIncrease.setAttribute('aria-label', increaseLabel);
  els.settingsTheme.value = state.theme;
  els.settingsLanguage.value = state.locale;
  els.settingsSearchEngine.value = SEARCH_ENGINES[state.settings.searchEngine] ? state.settings.searchEngine : 'google';
  els.settingsAdBlock.checked = state.settings.adBlocker !== false;
  els.settingsAdBlockState.textContent = text(els.settingsAdBlock.checked ? 'on' : 'off');
  els.settingsRecording.checked = state.settings.recordingEnabled === true;
  els.settingsRecordingState.textContent = text(els.settingsRecording.checked ? 'on' : 'off');
  renderEditorSettings();
  updateBrowserStatusBar();
  els.settingsVersion.textContent = `${state.runtimeInfo?.appName || text('title')} ${state.runtimeInfo?.version || '-'}`;
  if (els.settingsLatestVersion.textContent === '-') {
    els.settingsLatestVersion.textContent = state.runtimeInfo?.version || '-';
  }
  setSettingsSection(state.activeSettingsSection);
}

function currentPlanLevel() {
  return normalizePlanLevel(state.account?.plan);
}

function currentConcurrencyLimit() {
  const planLimit = PLAN_LIMITS[currentPlanLevel()].maxConcurrentDownloads;
  if (planLimit === null || state.entitlements?.maxConcurrentDownloads === null) return null;
  const configuredLimit = Number(state.entitlements?.maxConcurrentDownloads);
  return Number.isFinite(configuredLimit) && configuredLimit > 0
    ? Math.min(planLimit, configuredLimit)
    : planLimit;
}

function applyEntitlementState(value) {
  if (!value || typeof value !== 'object') return;
  state.entitlements = value;
  const concurrencyLimit = currentConcurrencyLimit();
  const requested = Number.parseInt(String(state.settings.maxConcurrentDownloads || 1), 10) || 1;
  if (concurrencyLimit !== null) state.settings.maxConcurrentDownloads = Math.max(1, Math.min(concurrencyLimit, requested));
  syncSettingsControls();
  updateTitlebarAccount();
  if (state.section === 'account') renderAccount();
}

function updateTitlebarAccount() {
  if (!els.titlebarAccount || !els.titlebarAccountState || !els.titlebarAccountQuota) return;
  const copy = TITLEBAR_ACCOUNT_TEXT[state.locale] || TITLEBAR_ACCOUNT_TEXT.en;
  const planLevel = currentPlanLevel();
  const planLimit = PLAN_LIMITS[planLevel]?.dailyDownloadLimit ?? null;
  const limit = state.entitlements?.dailyLimit === null ? null : (Number(state.entitlements?.dailyLimit) || planLimit);
  const fallbackRemaining = limit === null ? null : Math.max(0, limit);
  const remaining = state.entitlements?.remainingToday === null
    ? null
    : Math.max(0, Number(state.entitlements?.remainingToday ?? fallbackRemaining) || 0);
  els.titlebarAccountState.textContent = state.account?.email
    ? `${state.account.email} · ${text(planLevel)}`
    : copy.signedOut;
  els.titlebarAccountQuota.textContent = limit === null
    ? copy.unlimited
    : copy.remaining.replace('{remaining}', String(remaining)).replace('{limit}', String(limit));
  els.titlebarAccount.title = `${els.titlebarAccountState.textContent} · ${els.titlebarAccountQuota.textContent}`;
  els.titlebarAccount.setAttribute('aria-label', `${copy.open}：${els.titlebarAccount.title}`);
}

async function ensureDownloadEntitlementAvailable(count = 1, options = {}) {
  const requested = Math.max(0, Math.floor(Number(count) || 0));
  if (requested === 0) return true;
  try {
    const result = await window.mediaDeck.checkDownloadEntitlement({
      count: requested,
      retryExisting: options.retryExisting === true,
    });
    if (result?.entitlements) applyEntitlementState(result.entitlements);
    if (result?.ok) return true;
    const remaining = Math.max(0, Number(result?.entitlements?.remainingToday || 0));
    const message = remaining === 0
      ? text('dailyLimitReached')
      : (state.locale.startsWith('zh')
        ? `今日剩余 ${remaining} 次，本次选择了 ${requested} 个任务，未开始解析。`
        : `${remaining} downloads remain today, but ${requested} tasks were selected. Resolution was not started.`);
    if (!options.suppressToast) toast(message, 'error');
    return false;
  } catch (error) {
    if (!options.suppressToast) toast(userFacingDownloadError(error), 'error');
    return false;
  }
}

function updateConcurrentDownloads(value, announce = true) {
  const concurrencyLimit = currentConcurrencyLimit();
  if (concurrencyLimit === null) return;
  const next = Math.max(1, Math.min(concurrencyLimit, Number.parseInt(String(value), 10) || 1));
  state.settings.maxConcurrentDownloads = next;
  syncSettingsControls();
  saveState();
  void syncRecordingConfiguration();
  if (announce) toast(text('saved'));
}

async function syncRecordingConfiguration() {
  const result = await window.mediaDeck.configureRecording({
    outputDir: state.settings.outputDir,
    maxConcurrentDownloads: state.settings.maxConcurrentDownloads,
    enabled: state.settings.recordingEnabled === true,
    accountId: state.account?.email || null,
    planLevel: currentPlanLevel(),
  });
  if (result?.entitlements) applyEntitlementState(result.entitlements);
  if (Number(result?.maxConcurrentDownloads) > 0) {
    state.settings.maxConcurrentDownloads = Number(result.maxConcurrentDownloads);
    syncSettingsControls();
  }
  return result;
}

function userFacingDownloadError(error) {
  const message = String(error?.message || error || '').replace(/\s+/g, ' ').trim().slice(0, 800);
  if (message.includes('daily-entitlement-limit-reached')) return text('dailyLimitReached');
  if (message === '下载失败，请刷新播放页并重新识别视频后再试。'
    || message === 'The download failed. Refresh the playback page and retry.') {
    return state.locale.startsWith('zh')
      ? '该历史任务由旧版保存，原始错误原因已丢失；请重新下载以获取准确诊断。'
      : 'This task was saved by an older version without its original error; retry it to capture an accurate diagnosis.';
  }
  const browserDiagnosticText = message.match(/browser-download-interrupted:(\{.*\})/)?.[1];
  if (browserDiagnosticText) {
    try {
      const diagnostic = JSON.parse(browserDiagnosticText);
      const received = Math.max(0, Number(diagnostic.receivedBytes || 0));
      const total = Math.max(0, Number(diagnostic.totalBytes || 0));
      const transfer = total > 0
        ? `${formatBytes(received)} / ${formatBytes(total)}`
        : formatBytes(received);
      const httpStatus = Math.max(0, Number(diagnostic.httpStatus || 0));
      const networkError = String(diagnostic.networkError || '').replace(/^net::/, '');
      if (httpStatus >= 400) return state.locale.startsWith('zh')
        ? `媒体服务器返回 HTTP ${httpStatus}，传输中断（${transfer}）。`
        : `The media server returned HTTP ${httpStatus}; transfer stopped at ${transfer}.`;
      const networkReasons = {
        ERR_CONNECTION_RESET: '连接被远端重置',
        ERR_CONNECTION_CLOSED: '连接被远端关闭',
        ERR_TIMED_OUT: '网络连接超时',
        ERR_INTERNET_DISCONNECTED: '设备当前没有网络连接',
        ERR_NETWORK_CHANGED: '下载过程中网络发生变化',
        ERR_NAME_NOT_RESOLVED: '无法解析媒体服务器地址',
        ERR_CONNECTION_REFUSED: '媒体服务器拒绝连接',
        ERR_ADDRESS_UNREACHABLE: '无法连接媒体服务器',
        ERR_BLOCKED_BY_CLIENT: '请求被浏览器客户端拦截',
        ERR_ABORTED: '媒体请求被浏览器中止',
      };
      if (networkError) return state.locale.startsWith('zh')
        ? `${networkReasons[networkError] || 'Chromium 网络请求失败'}（${networkError}，${transfer}）。`
        : `Chromium reported ${networkError}; transfer stopped at ${transfer}.`;
      return state.locale.startsWith('zh')
        ? `Chromium 将媒体下载标记为“${diagnostic.state || 'interrupted'}”（${transfer}），但没有提供更具体的网络错误码。`
        : `Chromium marked the media download as ${diagnostic.state || 'interrupted'} at ${transfer}, without a more specific network error code.`;
    } catch { /* preserve the raw diagnostic below */ }
  }
  if (/ERR_BLOCKED_BY_CLIENT/i.test(message)) return state.locale.startsWith('zh')
    ? '媒体连接被浏览器中断，请重新识别视频后再试。'
    : 'The browser interrupted the media connection. Detect the video again and retry.';
  if (/Fresh cookies|confirm you are on the latest version|yt-dlp.*issue/i.test(message)) return state.locale.startsWith('zh')
    ? '当前站点会话无法用于下载，请刷新播放页并重新识别视频。'
    : 'The current site session cannot be used for downloading. Refresh the playback page and detect the video again.';
  if (/Browser media download (?:was interrupted|failed)/i.test(message)) return state.locale.startsWith('zh')
    ? 'Chromium 将媒体下载标记为中断，但没有提供更具体的网络错误码。'
    : 'Chromium marked the media download as interrupted without a more specific network error code.';
  if (/Media server connection timed out/i.test(message)) return state.locale.startsWith('zh')
    ? '媒体服务器连接超时，请重新下载。'
    : 'The media server connection timed out. Please retry.';
  if (/Direct media request failed with HTTP\s+(\d+)/i.test(message)) {
    const statusCode = message.match(/HTTP\s+(\d+)/i)?.[1] || '';
    return state.locale.startsWith('zh')
      ? `媒体服务器拒绝了下载请求（HTTP ${statusCode}），请重新识别后再试。`
      : `The media server rejected the download request (HTTP ${statusCode}). Detect the video again and retry.`;
  }
  if (/Direct media request returned no data/i.test(message)) return state.locale.startsWith('zh')
    ? '媒体服务器没有返回视频数据，请重新识别后再试。'
    : 'The media server returned no video data. Detect the video again and retry.';
  if (/Unsupported URL/i.test(message)) return state.locale.startsWith('zh')
    ? '该视频地址暂不支持直接下载，请在播放页重新识别后再试。'
    : 'This video URL cannot be downloaded directly yet. Open its playback page and detect it again.';
  if (/Failed to fetch|NetworkError|Load failed|ECONNRESET|socket hang up/i.test(message)) return state.locale.startsWith('zh')
    ? `媒体网络请求失败：${message}`
    : `The media network request failed: ${message}`;
  if (!message) return state.locale.startsWith('zh') ? '下载失败，但下载引擎没有返回错误原因。' : 'The download failed without an error reason.';
  if (/[\u3400-\u9fff]/.test(message)) return message;
  return state.locale.startsWith('zh') ? `下载引擎返回：${message}` : message;
}

function updateDownloadBadge() {
  const hasActiveDownloads = state.running || state.queue.some((item) => {
    const status = normalizeDownloadState(item.status || item.state);
    return ['queued', 'resolving', 'connecting', 'downloading', 'finalizing'].includes(status);
  });
  els.downloadBadge.hidden = !hasActiveDownloads;
  updateBrowserStatusBar();
}

async function refreshSystemNetworkSpeed() {
  if (systemNetworkSpeedRefreshPending) return;
  systemNetworkSpeedRefreshPending = true;
  try {
    const sample = await window.mediaDeck.getSystemNetworkSpeed();
    state.systemNetworkSpeed = {
      available: sample?.available === true,
      receivedBytesPerSecond: Math.max(0, Number(sample?.receivedBytesPerSecond || 0)),
      sentBytesPerSecond: Math.max(0, Number(sample?.sentBytesPerSecond || 0)),
      totalBytesPerSecond: Math.max(0, Number(sample?.totalBytesPerSecond || 0)),
    };
    updateBrowserStatusBar();
  } catch {
    state.systemNetworkSpeed = { ...state.systemNetworkSpeed, available: false };
  } finally {
    systemNetworkSpeedRefreshPending = false;
  }
}

function startSystemNetworkSpeedPolling() {
  if (systemNetworkSpeedTimer || window.mediaDeckSmokeTest) return;
  void refreshSystemNetworkSpeed();
  systemNetworkSpeedTimer = window.setInterval(() => void refreshSystemNetworkSpeed(), 1000);
}

function updateBrowserStatusBar() {
  if (!els.browserStatusDownloads) return;
  const copy = BROWSER_STATUS_TEXT[state.locale] || BROWSER_STATUS_TEXT.en;
  const activePageAllowsAds = ['dailymotion', 'pixabay', 'pexels', 'mixkit', 'coverr', 'videvo', 'videezy']
    .includes(tabProvider(activeTab()));
  const adBlockerActive = state.settings.adBlocker !== false && !activePageAllowsAds;
  els.browserStatusMediaLabel.textContent = copy.media;
  els.browserStatusMediaCount.textContent = String(mediaCandidatesForTab().length);
  els.browserStatusLocalLabel.textContent = copy.local;
  els.browserStatusAdblockLabel.textContent = copy.adblock;
  els.browserStatusAdblockState.textContent = adBlockerActive ? 'ON' : 'OFF';
  els.browserStatusAdblockState.classList.toggle('is-off', !adBlockerActive);
  const totalSpeed = Math.max(0, Number(state.systemNetworkSpeed.totalBytesPerSecond || 0));
  const speedText = totalSpeed > 0 ? `${formatBytes(totalSpeed)}/s` : '0 B/s';
  els.browserStatusNetworkLabel.textContent = copy.network;
  els.browserStatusNetworkSpeed.querySelector('bdi').textContent = speedText;
  els.browserStatusNetwork.classList.toggle('is-active', totalSpeed > 0);
  els.browserStatusNetwork.title = `${copy.currentSpeed}: ${speedText}`;
  els.browserStatusDownloadLabel.textContent = copy.queue;
  els.browserStatusDownloadCount.textContent = String(state.queue.length);
  els.browserStatusDownloads.title = copy.openQueue;
  els.browserStatusDownloads.setAttribute('aria-label', copy.openQueue);
}

function syncMediaPanelVisibility() {
  const visible = state.section === 'browser' && state.mediaPanelVisible;
  els.browserSplit.classList.toggle('has-media-panel', visible);
  els.browserSide.hidden = !visible;
  els.pageMediaToggle.classList.toggle('active', visible);
  els.pageMediaToggle.classList.toggle('is-active', visible);
  els.pageMediaToggle.title = visible ? text('closePanel') : text('openPanel');
  els.pageMediaToggle.setAttribute('aria-label', visible ? text('closePanel') : text('openPanel'));
  scheduleActiveWebviewResize();
}

function resizeActiveWebview() {
  webviewResizeFrame = 0;
  state.tabs.forEach((item) => {
    item.webview.style.width = '';
    item.webview.style.height = '';
    item.webview.removeAttribute('width');
    item.webview.removeAttribute('height');
  });
}

function scheduleActiveWebviewResize() {
  if (webviewResizeFrame) cancelAnimationFrame(webviewResizeFrame);
  webviewResizeFrame = requestAnimationFrame(() => {
    resizeActiveWebview();
    requestAnimationFrame(resizeActiveWebview);
  });
}

function setSection(section) {
  const requestedSection = section;
  if (section === 'browser' && !state.tabs.length) section = 'home';
  if (section !== 'browser') setFavoritesPopoverOpen(false);
  state.section = section;
  state.navSection = requestedSection === 'home' ? 'browser' : requestedSection;
  els.tabbar.hidden = !['home', 'browser'].includes(section);
  Object.entries(els.pages).forEach(([key, page]) => page.classList.toggle('active', key === section));
  els.sidebar.forEach((button) => button.classList.toggle('active', button.dataset.section === state.navSection));
  if (!els.sidebar.some((button) => button.dataset.section === state.navSection) && document.activeElement?.classList?.contains('sidebar-btn')) {
    document.activeElement.blur();
  }
  if (section === 'plans') renderPlans();
  if (section === 'account') renderAccount();
  if (section === 'library' && !state.library.loaded && !state.library.loading) void loadMediaLibrary();
  if (section !== 'library' && !els.libraryDetailOverlay.hidden) closeLibraryDetail();
  renderTabs();
  setVisibleWebviews();
  syncMediaPanelVisibility();
  renderCandidates();
  updateBrowserControls();
}

function createTab(url = HOME_URL, title = text('newTab'), options = {}) {
  const webview = document.createElement('webview');
  const tab = {
    id: `tab-${++state.tabCounter}`,
    url,
    title,
    webview,
    ready: false,
    loading: false,
    webContentsId: null,
    mediaEnrichmentSequence: 0,
    mediaEnrichmentTimer: 0,
    lastEnrichedUrl: null,
    activeMediaContext: null,
    activeMediaExtractionKey: null,
    activeMediaNetworkCandidates: [],
    recentStockMediaCandidate: null,
    pendingNativeDownloadMetadata: null,
    activeMediaProbeTimer: 0,
    dailymotionRecoveryUrl: '',
    dailymotionRecoveryTimer: 0,
    internal: options.internal === true,
  };
  webview.className = `browser-view${tab.internal ? ' is-internal-resolver' : ''}`;
  webview.setAttribute('partition', FALLBACK_PARTITION);
  webview.setAttribute('allowpopups', 'true');
  if (tab.internal) webview.setAttribute('webpreferences', 'backgroundThrottling=no');
  webview.src = url;
  els.browserStage.appendChild(webview);
  attachWebviewEvents(tab);
  state.tabs.push(tab);
  if (!tab.internal) state.activeTabId = tab.id;
  renderTabs();
  setVisibleWebviews();
  updateBrowserControls();
  scheduleActiveWebviewResize();
  return tab;
}

function createInternalResolverTab(url, title) {
  return createTab(url, title, { internal: true });
}

function activeTab() {
  return state.tabs.find((tab) => tab.id === state.activeTabId) || null;
}

function attachWebviewEvents(tab) {
  const rememberWebContentsId = () => {
    try {
      const id = Number(tab.webview.getWebContentsId?.());
      if (Number.isFinite(id) && id > 0) tab.webContentsId = id;
    } catch {
      // The webview id is only available after Electron attaches the guest.
    }
  };
  const sync = () => {
    rememberWebContentsId();
    const previousUrl = tab.url;
    const nextUrl = tab.webview.getURL() || tab.url;
    tab.url = nextUrl;
    const previousPageUrl = MEDIA_RULES?.normalizePageUrl?.(previousUrl) || previousUrl;
    const nextPageUrl = MEDIA_RULES?.normalizePageUrl?.(nextUrl) || nextUrl;
    if (previousPageUrl && nextPageUrl && previousPageUrl !== nextPageUrl) resetTabMediaForNavigation(tab);
    if (tab.id === state.activeTabId) updateBrowserControls();
  };
  tab.webview.addEventListener('did-attach', rememberWebContentsId);
  tab.webview.addEventListener('dom-ready', () => {
    tab.ready = true;
    sync();
    scheduleActiveWebviewResize();
    scheduleActiveMediaProbe(tab, 300);
    void tab.webview.executeJavaScript('window.__vidogoActiveMediaReporter?.report?.()', true).catch(() => null);
  });
  tab.webview.addEventListener('did-start-loading', () => {
    tab.loading = true;
    clearTimeout(tab.dailymotionRecoveryTimer);
    sync();
  });
  tab.webview.addEventListener('did-navigate', () => {
    sync();
    addHistory(tab.title || tab.url, tab.url);
    schedulePageMediaEnrichment(tab);
    scheduleActiveMediaProbe(tab, 300);
  });
  tab.webview.addEventListener('did-navigate-in-page', () => {
    sync();
    schedulePageMediaEnrichment(tab);
    scheduleActiveMediaProbe(tab, 150);
  });
  tab.webview.addEventListener('did-stop-loading', () => {
    tab.loading = false;
    sync();
    scheduleActiveWebviewResize();
    schedulePageMediaEnrichment(tab);
    scheduleActiveMediaProbe(tab, 150);
    scheduleDailymotionPlaybackRecovery(tab);
  });
  tab.webview.addEventListener('page-title-updated', (event) => {
    tab.title = event.title || tab.title;
    renderTabs();
    if (tab.id === state.activeTabId) updateBrowserControls();
    if (isSupportedMetadataPage(tab.url)) schedulePageMediaEnrichment(tab, true);
  });
  tab.webview.addEventListener('did-fail-load', (event) => {
    if (event.isMainFrame && event.errorCode !== -3) toast(`${text('loadFailed')}: ${event.validatedURL || tab.url}`);
  });
  tab.webview.addEventListener('ipc-message', (event) => {
    if (event.channel === 'vidogo:active-media') {
      void handleActiveMediaContext(tab, event.args?.[0]);
    } else if (event.channel === 'vidogo:media-collection') {
      handleMediaCollection(tab, event.args?.[0]);
    } else if (event.channel === 'vidogo:stock-media') {
      handleStockMediaContext(tab, event.args?.[0]);
    } else if (event.channel === 'vidogo:xiaohongshu-media') {
      handleXiaohongshuMediaContext(tab, event.args?.[0]);
    } else if (event.channel === 'vidogo:site-download-metadata') {
      handleSiteDownloadMetadata(tab, event.args?.[0]);
    } else if (event.channel === 'vidogo:site-download-intent') {
      handleSiteDownloadIntent(tab, event.args?.[0]);
    }
  });
}

function scheduleDailymotionPlaybackRecovery(tab) {
  clearTimeout(tab.dailymotionRecoveryTimer);
  if (tabProvider(tab) !== 'dailymotion') return;
  const pageUrl = MEDIA_RULES?.normalizePageUrl?.(tab.url) || tab.url;
  if (!pageUrl || tab.dailymotionRecoveryUrl === pageUrl) return;
  const inspect = async (remainingChecks) => {
    if (!state.tabs.includes(tab) || tabProvider(tab) !== 'dailymotion') return;
    const hasPlaybackError = await tab.webview.executeJavaScript(`(() => {
      const copy = String(document.body?.innerText || '');
      return /playback error/i.test(copy) && /check your internet connection/i.test(copy);
    })()`, true).catch(() => false);
    if (hasPlaybackError) {
      tab.dailymotionRecoveryUrl = pageUrl;
      await window.mediaDeck.repairDailymotionPlayback().catch(() => null);
      if (state.tabs.includes(tab)) tab.webview.reloadIgnoringCache();
      return;
    }
    if (remainingChecks > 1) {
      tab.dailymotionRecoveryTimer = window.setTimeout(() => void inspect(remainingChecks - 1), 2500);
    }
  };
  tab.dailymotionRecoveryTimer = window.setTimeout(() => void inspect(4), 1800);
}

let draggingBrowserTabId = null;

function reorderBrowserTab(sourceId, targetId, placeAfter) {
  if (!sourceId || sourceId === targetId) return false;
  const sourceIndex = state.tabs.findIndex((tab) => tab.id === sourceId);
  const targetIndex = state.tabs.findIndex((tab) => tab.id === targetId);
  if (sourceIndex < 0 || targetIndex < 0) return false;
  const [source] = state.tabs.splice(sourceIndex, 1);
  const adjustedTargetIndex = state.tabs.findIndex((tab) => tab.id === targetId);
  state.tabs.splice(adjustedTargetIndex + (placeAfter ? 1 : 0), 0, source);
  return true;
}

function clearTabDropIndicators() {
  els.tabStrip.querySelectorAll('.browser-tab').forEach((tab) => {
    tab.classList.remove('is-dragging', 'drop-before', 'drop-after');
  });
}

function scrollActiveTabIntoView() {
  const selector = state.section === 'home'
    ? '.home-tab-button'
    : '.browser-tab.is-active';
  requestAnimationFrame(() => {
    els.tabStrip.querySelector(selector)?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  });
}

function renderTabs() {
  els.tabStrip.innerHTML = '';
  const home = document.createElement('button');
  home.className = `tab home-tab-button ${state.section === 'home' ? 'active is-active' : ''}`;
  home.type = 'button';
  home.innerHTML = `${iconSvg('house', 'ui-icon tab-icon')}<span class="tab-title"></span>`;
  home.querySelector('.tab-title').classList.add('browser-tab-title');
  home.querySelector('.tab-title').textContent = text('home');
  home.addEventListener('click', () => setSection('home'));
  els.tabStrip.appendChild(home);

  state.tabs.forEach((tab) => {
    if (tab.internal) return;
    const button = document.createElement('div');
    button.className = `tab browser-tab ${state.section === 'browser' && tab.id === state.activeTabId ? 'active is-active' : ''}`;
    button.tabIndex = 0;
    button.dataset.tabId = tab.id;
    button.setAttribute('role', 'tab');
    button.setAttribute('aria-selected', String(state.section === 'browser' && tab.id === state.activeTabId));
    button.title = tab.title || text('newTab');
    button.innerHTML = `<span class="tab-title">${escapeHtml(tab.title || text('newTab'))}</span><button class="tab-close tab-close-button" type="button" title="${escapeHtml(text('closeTab'))}" aria-label="${escapeHtml(text('closeTab'))}">${iconSvg('close')}</button>`;
    button.querySelector('.tab-title')?.classList.add('browser-tab-title');
    button.draggable = true;
    button.addEventListener('dragstart', (event) => {
      draggingBrowserTabId = tab.id;
      button.classList.add('is-dragging');
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/x-vidogo-tab', tab.id);
    });
    button.addEventListener('dragover', (event) => {
      const sourceId = draggingBrowserTabId || event.dataTransfer.getData('text/x-vidogo-tab');
      if (!sourceId || sourceId === tab.id) return;
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
      const after = event.clientX >= button.getBoundingClientRect().left + button.getBoundingClientRect().width / 2;
      button.classList.toggle('drop-before', !after);
      button.classList.toggle('drop-after', after);
    });
    button.addEventListener('dragleave', () => {
      button.classList.remove('drop-before', 'drop-after');
    });
    button.addEventListener('drop', (event) => {
      event.preventDefault();
      const sourceId = draggingBrowserTabId || event.dataTransfer.getData('text/x-vidogo-tab');
      const after = event.clientX >= button.getBoundingClientRect().left + button.getBoundingClientRect().width / 2;
      clearTabDropIndicators();
      if (reorderBrowserTab(sourceId, tab.id, after)) renderTabs();
    });
    button.addEventListener('dragend', () => {
      draggingBrowserTabId = null;
      clearTabDropIndicators();
    });
    button.addEventListener('auxclick', (event) => {
      if (event.button === 1) closeTab(tab.id);
    });
    button.addEventListener('click', (event) => {
      if (event.target.closest('.tab-close-button')) {
        closeTab(tab.id);
        return;
      }
      state.activeTabId = tab.id;
      setSection('browser');
    });
    button.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      state.activeTabId = tab.id;
      setSection('browser');
    });
    els.tabStrip.appendChild(button);
  });
  scrollActiveTabIntoView();
}

function closeTab(id) {
  const index = state.tabs.findIndex((tab) => tab.id === id);
  if (index < 0) return;
  const closingTab = state.tabs[index];
  if (closingTab.mediaEnrichmentTimer) clearTimeout(closingTab.mediaEnrichmentTimer);
  if (closingTab.activeMediaProbeTimer) clearTimeout(closingTab.activeMediaProbeTimer);
  closingTab.mediaEnrichmentSequence += 1;
  closingTab.webview.remove();
  state.tabs.splice(index, 1);
  if (state.activeTabId === id) {
    const visibleTabs = state.tabs.filter((tab) => !tab.internal);
    state.activeTabId = visibleTabs[Math.min(index, visibleTabs.length - 1)]?.id || visibleTabs.at(-1)?.id || null;
  }
  delete state.candidatesByTabId[id];
  delete state.mediaCollectionsByTabId[id];
  delete state.mediaModeByTabId[id];
  delete state.selectedBatchCandidateIdsByTabId[id];
  delete state.selectedCandidateIdsByTabId[id];
  delete state.expandedCandidateIdsByTabId[id];
  delete state.selectedMinimumResolutionByTabId[id];
  if (!state.tabs.some((tab) => !tab.internal)) {
    state.activeTabId = null;
    setSection('home');
    return;
  }
  renderTabs();
  setVisibleWebviews();
  renderCandidates();
  updateBrowserControls();
  scheduleActiveWebviewResize();
}

function setVisibleWebviews() {
  state.tabs.forEach((tab) => {
    tab.webview.classList.toggle('is-active', state.section === 'browser' && tab.id === state.activeTabId);
  });
  scheduleActiveWebviewResize();
}

function getVisibleWebviews() {
  return state.tabs.filter((tab) => tab.webview.classList.contains('is-active'));
}

function getBrowserLayoutSnapshot() {
  resizeActiveWebview();
  const activePageIds = Array.from(document.querySelectorAll('.page.active')).map((page) => page.id);
  const stageRect = els.browserStage.getBoundingClientRect();
  const splitRect = els.browserSplit?.getBoundingClientRect();
  const sideRect = document.querySelector('.browser-side')?.getBoundingClientRect();
  const activeView = activeTab()?.webview || null;
  const activeViewRect = activeView?.getBoundingClientRect();
  const activeViewStyle = activeView ? getComputedStyle(activeView) : null;
  const activeCandidates = mediaCandidatesForTab();
  return {
    activePageIds,
    visibleWebviews: getVisibleWebviews().length,
    stageWidth: Math.round(stageRect.width),
    stageHeight: Math.round(stageRect.height),
    splitWidth: Math.round(splitRect?.width || 0),
    sideWidth: Math.round(sideRect?.width || 0),
    viewWidth: Math.round(activeViewRect?.width || 0),
    viewHeight: Math.round(activeViewRect?.height || 0),
    viewPosition: activeViewStyle?.position || '',
    viewDisplay: activeViewStyle?.display || '',
    viewVisibility: activeViewStyle?.visibility || '',
    viewInlineHeight: activeView?.style.height || '',
    viewInlineWidth: activeView?.style.width || '',
    mediaPanelVisible: Boolean(els.browserSide && getComputedStyle(els.browserSide).display !== 'none'),
    mediaPanelHeight: Math.round(sideRect?.height || 0),
    activeMediaCandidates: activeCandidates.length,
    activeMediaTab: state.browserSideTab,
  };
}

async function inspectActiveGuestPage() {
  const view = activeTab()?.webview;
  if (!view) return null;
  try {
    return await Promise.race([view.executeJavaScript(`
      (() => {
        const pickRect = (selector) => {
          const element = document.querySelector(selector);
          if (!element) return null;
          const rect = element.getBoundingClientRect();
          return {
            width: Math.round(rect.width),
            height: Math.round(rect.height),
            top: Math.round(rect.top),
            bottom: Math.round(rect.bottom)
          };
        };
        const meaningfulSelectors = [
          'ytd-app',
          '#content',
          '#page-manager',
          'video',
          'main',
          'body'
        ];
        const videos = Array.from(document.querySelectorAll('video'));
        const video = videos.find((item) => {
          const rect = item.getBoundingClientRect();
          const style = getComputedStyle(item);
          return rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden';
        }) || videos[0] || null;
        const videoRect = video?.getBoundingClientRect() || null;
        const videoStyle = video ? getComputedStyle(video) : null;
        const player = document.querySelector('.html5-video-player');
        const playerRect = player?.getBoundingClientRect() || null;
        const playerStyle = player ? getComputedStyle(player) : null;
        const describeVideo = (item) => {
          const rect = item.getBoundingClientRect();
          const style = getComputedStyle(item);
          return {
            className: item.className,
            currentSrc: String(item.currentSrc || item.src || '').slice(0, 500),
            poster: String(item.poster || '').slice(0, 500),
            currentTime: Number(item.currentTime) || 0,
            decodedFrames: Number(item.webkitDecodedFrameCount) || 0,
            display: style.display,
            height: Number(item.videoHeight) || 0,
            muted: item.muted,
            opacity: style.opacity,
            paused: item.paused,
            playbackRate: Number(item.playbackRate) || 0,
            readyState: Number(item.readyState) || 0,
            rect: {
              height: Math.round(rect.height),
              left: Math.round(rect.left),
              top: Math.round(rect.top),
              width: Math.round(rect.width)
            },
            visibility: style.visibility,
            width: Number(item.videoWidth) || 0
          };
        };
        return {
          href: location.href,
          title: document.title,
          readyState: document.readyState,
          identity: {
            userAgent: navigator.userAgent,
            brands: Array.from(navigator.userAgentData?.brands || []),
            mobile: navigator.userAgentData?.mobile ?? null,
            platform: navigator.userAgentData?.platform || navigator.platform,
            webdriver: navigator.webdriver,
            language: navigator.language,
          },
          innerHeight: window.innerHeight,
          innerWidth: window.innerWidth,
          clientHeight: document.documentElement.clientHeight,
          bodyHeight: document.body ? document.body.getBoundingClientRect().height : 0,
          scrollHeight: Math.max(
            document.documentElement.scrollHeight || 0,
            document.body?.scrollHeight || 0
          ),
          visibleTextLength: document.body ? document.body.innerText.trim().length : 0,
          tiktokDiagnostics: location.hostname.endsWith('tiktok.com') ? {
            videoLinks: Array.from(document.querySelectorAll('a[href*="/video/"]')).slice(0, 8).map((item) => item.href),
            reactAncestors: video ? Array.from((() => {
              const items = [];
              for (let node = video, depth = 0; node && depth < 12; node = node.parentElement, depth += 1) {
                items.push({
                  tag: node.tagName,
                  e2e: node.getAttribute?.('data-e2e') || '',
                  reactKeys: Object.keys(node).filter((key) => key.startsWith('__react')).slice(0, 4),
                });
              }
              return items;
            })()) : [],
            mediaResources: performance.getEntriesByType('resource').map((entry) => entry.name)
              .filter((url) => /(?:video|mime_type=video|\.mp4)/i.test(url)).slice(-8),
          } : null,
          videoCount: videos.length,
          videos: videos.slice(0, 4).map(describeVideo),
          player: player ? {
            className: player.className,
            display: playerStyle?.display || '',
            rect: playerRect ? {
              height: Math.round(playerRect.height),
              left: Math.round(playerRect.left),
              top: Math.round(playerRect.top),
              width: Math.round(playerRect.width)
            } : null,
            visibility: playerStyle?.visibility || '',
            hasAdModule: Boolean(player.querySelector('.video-ads .ytp-ad-module')),
            hasAdOverlay: Boolean(player.querySelector('.ytp-ad-player-overlay'))
          } : null,
          video: video ? {
            className: video.className,
            currentTime: Number(video.currentTime) || 0,
            decodedFrames: Number(video.webkitDecodedFrameCount) || 0,
            droppedFrames: Number(video.webkitDroppedFrameCount) || 0,
            display: videoStyle?.display || '',
            height: Number(video.videoHeight) || 0,
            muted: video.muted,
            opacity: videoStyle?.opacity || '',
            paused: video.paused,
            playbackRate: Number(video.playbackRate) || 0,
            readyState: Number(video.readyState) || 0,
            rect: videoRect ? {
              height: Math.round(videoRect.height),
              left: Math.round(videoRect.left),
              top: Math.round(videoRect.top),
              width: Math.round(videoRect.width)
            } : null,
            visibility: videoStyle?.visibility || '',
            width: Number(video.videoWidth) || 0
          } : null,
          rects: Object.fromEntries(meaningfulSelectors.map((selector) => [selector, pickRect(selector)]))
        };
      })()
    `, true), new Promise((_, reject) => window.setTimeout(() => reject(new Error('Guest inspection timed out.')), 4000))]);
  } catch (error) {
    return { error: error?.message || String(error) };
  }
}

async function startActiveGuestPlaybackForSmoke() {
  const view = activeTab()?.webview;
  if (!view) return false;
  try {
    return await Promise.race([view.executeJavaScript(`
      (() => {
        const videos = Array.from(document.querySelectorAll('video'));
        const video = videos.find((item) => {
          const rect = item.getBoundingClientRect();
          const style = getComputedStyle(item);
          return rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden';
        }) || videos[0] || null;
        if (!video) return false;
        video.muted = true;
        return Promise.resolve(video.play()).then(() => true, () => false);
      })()
    `, true), new Promise((resolve) => window.setTimeout(() => resolve(false), 3000))]);
  } catch {
    return false;
  }
}

async function forceActiveGuestDarkModeForSmoke() {
  const view = activeTab()?.webview;
  if (!view) return;
  try {
    await view.executeJavaScript(`
      (() => {
        document.documentElement.setAttribute('dark', 'true');
        document.documentElement.dataset.vidogoSmokeDark = 'true';
        document.documentElement.style.colorScheme = 'dark';
        if (document.body) {
          document.body.setAttribute('dark', 'true');
          document.body.style.colorScheme = 'dark';
        }
        let style = document.querySelector('#__vidogo_smoke_dark_mode');
        if (!style) {
          style = document.createElement('style');
          style.id = '__vidogo_smoke_dark_mode';
          document.documentElement.appendChild(style);
        }
        style.textContent = [
          'html, body, ytd-app, #content, #page-manager, #container, #primary, #secondary { background: #0f0f0f !important; color: #f1f1f1 !important; }',
          'yt-formatted-string, ytd-rich-grid-media, ytd-guide-entry-renderer, #video-title, #text, #label, span, h1, h2, h3, a { color: #f1f1f1 !important; }',
          'input, #search, #search-form, #search-container, .ytd-searchbox { background: #181818 !important; color: #f1f1f1 !important; border-color: #303030 !important; }',
          '#guide-content, ytd-mini-guide-renderer, ytd-masthead, #masthead-container { background: #0f0f0f !important; }'
        ].join('\\n');
      })()
    `, true);
  } catch {
    // Smoke diagnostics should not fail only because a guest page refused CSS injection.
  }
}

function updateBrowserControls() {
  const tab = activeTab();
  const view = tab?.webview;
  const ready = Boolean(tab?.ready && view);
  els.back.disabled = !ready || !view.canGoBack();
  els.forward.disabled = !ready || !view.canGoForward();
  els.reload.disabled = !view;
  els.address.disabled = !view;
  els.address.value = tab?.url || '';
  const reloadLabel = tab?.loading ? text('stopLoading') : text('refresh');
  els.reload.title = reloadLabel;
  els.reload.setAttribute('aria-label', reloadLabel);
  setIcon(els.reloadIcon, tab?.loading ? 'close' : 'refresh');
  syncFavoriteButton();
}

function normalizeUrl(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(raw)) return raw;
  if (/^[\w.-]+\.[a-z]{2,}(\/.*)?$/i.test(raw)) return `https://${raw}`;
  const searchPrefix = SEARCH_ENGINES[state.settings.searchEngine] || SEARCH_ENGINES.google;
  return `${searchPrefix}${encodeURIComponent(raw)}`;
}

function openUrl(value, title = text('newTab')) {
  const url = normalizeUrl(value);
  if (!url) return;
  createTab(url, title);
  setSection('browser');
}

function navigateActive(value) {
  const url = normalizeUrl(value);
  if (!url) return;
  const tab = activeTab();
  if (!tab) return openUrl(url);
  void tab.webview.loadURL(url).catch((error) => {
    if (![-3, -2].includes(Number(error?.errno))) toast(`${text('loadFailed')}: ${url}`);
  });
}

function addHistory(title, url) {
  if (!url || url === 'about:blank') return;
  state.history = [{ title: title || url, url, time: new Date().toISOString() }, ...state.history.filter((item) => item.url !== url)].slice(0, 150);
  saveState();
  renderHistory();
}

function removeHistory(url) {
  state.history = state.history.filter((item) => item.url !== url);
  saveState();
  renderHistory();
  toast(text('historyRemoved'));
}

function siteIcon(url) {
  try {
    const host = new URL(url).hostname;
    return state.platformConfig.platforms.find((item) => host.includes(new URL(item.url).hostname.replace('www.', '')))
      || Object.values(QUICK_SITES).flat().find((item) => host.includes(new URL(item.url).hostname.replace('www.', '')))
      || { color: '#2b3440', short: '●' };
  } catch {
    return { color: '#2b3440', short: '●' };
  }
}

function localizedCategoryName(category) {
  const language = String(state.locale || '').split('-')[0];
  return category?.labels?.[state.locale]
    || category?.labels?.[language]
    || category?.labels?.en
    || category?.labels?.['zh-CN']
    || category?.id
    || '';
}

function faviconForUrl(url) {
  try { return `${new URL(url).origin}/favicon.ico`; } catch { return ''; }
}

function platformIconMarkup(platform, className = 'site-icon favorite-site-icon') {
  const icon = platform?.icon || faviconForUrl(platform?.url);
  if (!icon) return `<span class="${className}">${iconSvg('monitor')}</span>`;
  return `<span class="${className}"><img src="${escapeHtml(icon)}" alt="" loading="lazy" /></span>`;
}

function bindPlatformIconFallbacks(root) {
  root?.querySelectorAll?.('.site-icon img, .platform-site-row-icon img, .platform-icon-preview img').forEach((image) => {
    image.addEventListener('error', () => {
      const wrapper = image.parentElement;
      if (wrapper) wrapper.innerHTML = iconSvg('monitor');
    }, { once: true });
  });
}

function renderQuickSites() {
  if (!els.platformGroups) return;
  els.platformGroups.innerHTML = state.platformConfig.categories
    .filter((category) => category.enabled !== false)
    .map((category) => {
      const sites = state.platformConfig.platforms.filter((site) => site.categoryId === category.id && site.enabled !== false);
      if (!sites.length) return '';
      return `<div class="quick-row popular-site-group" data-platform-category="${escapeHtml(category.id)}">
        <div class="quick-label">${escapeHtml(localizedCategoryName(category))}</div>
        <div class="quick-cards popular-site-list">${sites.map((site) => `
          <button class="popular-site-button site-card" type="button" data-platform-open="${escapeHtml(site.id)}" title="${escapeHtml(site.name)}">
            ${platformIconMarkup(site)}<span class="site-name"><bdi>${escapeHtml(site.name)}</bdi></span>
          </button>`).join('')}</div>
      </div>`;
    }).join('');
  els.platformGroups.querySelectorAll('[data-platform-open]').forEach((button) => {
    button.addEventListener('click', () => {
      const site = state.platformConfig.platforms.find((item) => item.id === button.dataset.platformOpen);
      if (site) openUrl(site.url, site.name);
    });
  });
  bindPlatformIconFallbacks(els.platformGroups);
}

function renderPlatformIconPreview() {
  const icon = state.platformEditorIcon || faviconForUrl(els.platformEditUrl.value);
  els.platformIconPreview.innerHTML = icon ? `<img src="${escapeHtml(icon)}" alt="" />` : iconSvg('monitor');
  bindPlatformIconFallbacks(els.platformIconPreview);
}

function closePlatformEditors() {
  els.platformEditor.hidden = true;
  els.categoryEditor.hidden = true;
  els.platformEditId.value = '';
  els.categoryEditId.value = '';
  state.platformEditorIcon = '';
}

function openPlatformEditor(platform = null) {
  els.categoryEditor.hidden = true;
  els.platformEditor.hidden = false;
  els.platformEditId.value = platform?.id || '';
  els.platformEditName.value = platform?.name || '';
  els.platformEditUrl.value = platform?.url || '';
  els.platformEditCategory.innerHTML = state.platformConfig.categories.map((category) => (
    `<option value="${escapeHtml(category.id)}">${escapeHtml(localizedCategoryName(category))}</option>`
  )).join('');
  els.platformEditCategory.value = platform?.categoryId || state.activePlatformCategoryId || state.platformConfig.categories[0]?.id || '';
  state.platformEditorIcon = platform?.icon || '';
  renderPlatformIconPreview();
  els.platformEditName.focus();
}

function openCategoryEditor(category = null) {
  els.platformEditor.hidden = true;
  els.categoryEditor.hidden = false;
  els.categoryEditId.value = category?.id || '';
  els.categoryEditName.value = category ? localizedCategoryName(category) : '';
  els.categoryEditName.focus();
}

async function persistPlatformConfiguration(successMessage = 'platformSaved') {
  try {
    state.platformConfig = await window.mediaDeck.savePlatforms(state.platformConfig);
    if (!state.platformConfig.categories.some((category) => category.id === state.activePlatformCategoryId)) {
      state.activePlatformCategoryId = state.platformConfig.categories[0]?.id || null;
    }
    renderQuickSites();
    renderPlatformManager();
    if (state.library.loaded) renderLibraryFilters();
    toast(text(successMessage), 'success');
    return true;
  } catch (error) {
    toast(error?.message || text('platformInvalidUrl'), 'error');
    return false;
  }
}

function renderPlatformManager() {
  if (!els.platformCategoryList || !els.platformSiteList) return;
  const categories = state.platformConfig.categories;
  if (!categories.some((category) => category.id === state.activePlatformCategoryId)) {
    state.activePlatformCategoryId = categories[0]?.id || null;
  }
  els.platformCategoryAdd.title = text('addCategory');
  els.platformCategoryAdd.setAttribute('aria-label', text('addCategory'));
  els.platformCategoryList.innerHTML = categories.map((category) => `
    <div class="platform-category-row${category.id === state.activePlatformCategoryId ? ' is-active' : ''}">
      <button class="platform-category-select" type="button" data-category-select="${escapeHtml(category.id)}">${escapeHtml(localizedCategoryName(category))}</button>
      <span class="platform-row-actions">
        <button class="platform-toggle${category.enabled !== false ? ' is-enabled' : ''}" type="button" data-category-toggle="${escapeHtml(category.id)}" title="${text(category.enabled !== false ? 'hide' : 'show')}" aria-label="${text(category.enabled !== false ? 'hide' : 'show')}"></button>
        <button class="platform-row-action" type="button" data-category-edit="${escapeHtml(category.id)}" title="${text('edit')}" aria-label="${text('edit')}">${iconSvg('document')}</button>
        <button class="platform-row-action is-danger" type="button" data-category-delete="${escapeHtml(category.id)}" title="${text('remove')}" aria-label="${text('remove')}">${iconSvg('delete')}</button>
      </span>
    </div>`).join('');
  const platforms = state.platformConfig.platforms.filter((site) => site.categoryId === state.activePlatformCategoryId);
  els.platformSiteList.innerHTML = platforms.length ? platforms.map((site) => `
    <div class="platform-site-row">
      ${platformIconMarkup(site, 'platform-site-row-icon')}
      <div class="platform-site-row-copy"><b><bdi>${escapeHtml(site.name)}</bdi></b><span title="${escapeHtml(site.url)}">${escapeHtml(site.url)}</span></div>
      <span class="platform-row-actions">
        <button class="platform-toggle${site.enabled !== false ? ' is-enabled' : ''}" type="button" data-platform-toggle="${escapeHtml(site.id)}" title="${text(site.enabled !== false ? 'hide' : 'show')}" aria-label="${text(site.enabled !== false ? 'hide' : 'show')}"></button>
        <button class="platform-row-action" type="button" data-platform-edit="${escapeHtml(site.id)}" title="${text('edit')}" aria-label="${text('edit')}">${iconSvg('document')}</button>
        <button class="platform-row-action is-danger" type="button" data-platform-delete="${escapeHtml(site.id)}" title="${text('remove')}" aria-label="${text('remove')}">${iconSvg('delete')}</button>
      </span>
    </div>`).join('') : `<div class="platform-list-empty">${escapeHtml(text('emptyCategory'))}</div>`;
  bindPlatformIconFallbacks(els.platformSiteList);

  els.platformCategoryList.querySelectorAll('[data-category-select]').forEach((button) => button.addEventListener('click', () => {
    state.activePlatformCategoryId = button.dataset.categorySelect;
    closePlatformEditors();
    renderPlatformManager();
  }));
  els.platformCategoryList.querySelectorAll('[data-category-toggle]').forEach((button) => button.addEventListener('click', () => {
    const category = categories.find((item) => item.id === button.dataset.categoryToggle);
    if (!category) return;
    category.enabled = category.enabled === false;
    void persistPlatformConfiguration();
  }));
  els.platformCategoryList.querySelectorAll('[data-category-edit]').forEach((button) => button.addEventListener('click', () => {
    openCategoryEditor(categories.find((item) => item.id === button.dataset.categoryEdit));
  }));
  els.platformCategoryList.querySelectorAll('[data-category-delete]').forEach((button) => button.addEventListener('click', () => {
    const id = button.dataset.categoryDelete;
    if (state.platformConfig.platforms.some((site) => site.categoryId === id)) return toast(text('cannotDeleteUsedCategory'), 'warning');
    state.platformConfig.categories = categories.filter((item) => item.id !== id);
    state.activePlatformCategoryId = state.platformConfig.categories[0]?.id || null;
    void persistPlatformConfiguration();
  }));
  els.platformSiteList.querySelectorAll('[data-platform-toggle]').forEach((button) => button.addEventListener('click', () => {
    const site = state.platformConfig.platforms.find((item) => item.id === button.dataset.platformToggle);
    if (!site) return;
    site.enabled = site.enabled === false;
    void persistPlatformConfiguration();
  }));
  els.platformSiteList.querySelectorAll('[data-platform-edit]').forEach((button) => button.addEventListener('click', () => {
    openPlatformEditor(state.platformConfig.platforms.find((item) => item.id === button.dataset.platformEdit));
  }));
  els.platformSiteList.querySelectorAll('[data-platform-delete]').forEach((button) => button.addEventListener('click', () => {
    state.platformConfig.platforms = state.platformConfig.platforms.filter((item) => item.id !== button.dataset.platformDelete);
    void persistPlatformConfiguration();
  }));
}

function normalizedPlatformEditorUrl(value) {
  const raw = String(value || '').trim();
  try {
    const parsed = new URL(/^[a-z][a-z0-9+.-]*:/i.test(raw) ? raw : `https://${raw}`);
    if (!['http:', 'https:'].includes(parsed.protocol) || parsed.username || parsed.password) return '';
    return parsed.href;
  } catch {
    return '';
  }
}

function uniquePlatformId(prefix, name) {
  const stem = String(name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 36) || prefix;
  let candidate = `${prefix}-${stem}`;
  let index = 2;
  const used = new Set([...state.platformConfig.categories, ...state.platformConfig.platforms].map((item) => item.id));
  while (used.has(candidate)) candidate = `${prefix}-${stem}-${index++}`;
  return candidate;
}

function bindPlatformManagerEvents() {
  els.platformManageButton.addEventListener('click', () => {
    closePlatformEditors();
    renderPlatformManager();
    els.platformManagerOverlay.hidden = false;
  });
  els.platformManagerClose.addEventListener('click', () => { els.platformManagerOverlay.hidden = true; closePlatformEditors(); });
  els.platformManagerOverlay.addEventListener('click', (event) => {
    if (event.target === els.platformManagerOverlay) { els.platformManagerOverlay.hidden = true; closePlatformEditors(); }
  });
  els.platformResetButton.addEventListener('click', async () => {
    try {
      state.platformConfig = await window.mediaDeck.resetPlatforms();
      state.activePlatformCategoryId = state.platformConfig.categories[0]?.id || null;
      closePlatformEditors();
      renderQuickSites();
      renderPlatformManager();
      if (state.library.loaded) renderLibraryFilters();
      toast(text('platformReset'), 'success');
    } catch (error) { toast(error?.message || text('platformInvalidUrl'), 'error'); }
  });
  els.platformCategoryAdd.addEventListener('click', () => openCategoryEditor());
  els.platformSiteAdd.addEventListener('click', () => openPlatformEditor());
  els.platformEditCancel.addEventListener('click', closePlatformEditors);
  els.categoryEditCancel.addEventListener('click', closePlatformEditors);
  els.platformEditUrl.addEventListener('input', () => {
    if (!state.platformEditorIcon || /^https:\/\//i.test(state.platformEditorIcon)) {
      state.platformEditorIcon = faviconForUrl(normalizedPlatformEditorUrl(els.platformEditUrl.value));
      renderPlatformIconPreview();
    }
  });
  els.platformIconAuto.addEventListener('click', () => {
    state.platformEditorIcon = faviconForUrl(normalizedPlatformEditorUrl(els.platformEditUrl.value));
    renderPlatformIconPreview();
  });
  els.platformIconChoose.addEventListener('click', async () => {
    try {
      const base64 = await window.mediaDeck.choosePlatformIcon();
      if (!base64) return;
      state.platformEditorIcon = `data:image/png;base64,${base64}`;
      renderPlatformIconPreview();
    } catch (error) { toast(error?.message || text('platformIcon'), 'error'); }
  });
  els.platformEditor.addEventListener('submit', (event) => {
    event.preventDefault();
    const name = els.platformEditName.value.trim();
    const url = normalizedPlatformEditorUrl(els.platformEditUrl.value);
    if (!name) return toast(text('platformNameRequired'), 'warning');
    if (!url) return toast(text('platformInvalidUrl'), 'warning');
    const existing = state.platformConfig.platforms.find((site) => site.id === els.platformEditId.value);
    const next = {
      id: existing?.id || uniquePlatformId('custom', name),
      name,
      url,
      categoryId: els.platformEditCategory.value,
      icon: state.platformEditorIcon || faviconForUrl(url),
      enabled: existing?.enabled !== false,
      builtIn: existing?.builtIn === true,
    };
    if (existing) Object.assign(existing, next);
    else state.platformConfig.platforms.push(next);
    state.activePlatformCategoryId = next.categoryId;
    closePlatformEditors();
    void persistPlatformConfiguration();
  });
  els.categoryEditor.addEventListener('submit', (event) => {
    event.preventDefault();
    const name = els.categoryEditName.value.trim();
    if (!name) return toast(text('categoryNameRequired'), 'warning');
    const existing = state.platformConfig.categories.find((category) => category.id === els.categoryEditId.value);
    if (existing) existing.labels[state.locale] = name;
    else {
      const category = { id: uniquePlatformId('category', name), labels: { 'zh-CN': name, en: name }, enabled: true, builtIn: false };
      state.platformConfig.categories.push(category);
      state.activePlatformCategoryId = category.id;
    }
    closePlatformEditors();
    void persistPlatformConfiguration();
  });
}

function formatTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat(state.locale, {
    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
  }).format(date);
}

function getFileName(value) {
  const raw = String(value || '');
  if (!raw) return '';
  const normalized = raw.replace(/\\/g, '/').split('/').filter(Boolean).pop() || raw;
  try {
    return decodeURIComponent(normalized);
  } catch {
    return normalized;
  }
}

function normalizeDownloadState(status) {
  const value = String(status || 'queued').toLowerCase();
  if (value === 'waiting') return 'queued';
  if (value === 'failed') return 'error';
  if (value === 'canceled') return 'cancelled';
  if (value === 'finished') return 'completed';
  if (['queued', 'resolving', 'connecting', 'downloading', 'finalizing', 'paused', 'completed', 'error', 'cancelled'].includes(value)) return value;
  return 'queued';
}

function isTerminalDownloadState(status) {
  return ['completed', 'error', 'cancelled'].includes(normalizeDownloadState(status));
}

function formatBytes(value) {
  const size = Number(value);
  if (!Number.isFinite(size) || size <= 0) return '-';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let next = size;
  for (const unit of units) {
    if (next < 1024 || unit === units[units.length - 1]) return `${next.toFixed(next >= 10 ? 0 : 1)} ${unit}`;
    next /= 1024;
  }
  return '-';
}

function isInRange(time, range) {
  if (range === 'all') return true;
  const date = new Date(time);
  if (Number.isNaN(date.getTime())) return false;
  const now = new Date();
  const startOf = (target) => {
    const next = new Date(target);
    next.setHours(0, 0, 0, 0);
    return next.getTime();
  };
  const todayStart = startOf(now);
  const dateStart = startOf(date);
  const dayMs = 24 * 60 * 60 * 1000;
  if (range === 'today') return dateStart === todayStart;
  if (range === 'yesterday') return dateStart === todayStart - dayMs;
  if (range === 'last7') return dateStart >= todayStart - 6 * dayMs;
  if (range === 'last30') return dateStart >= todayStart - 29 * dayMs;
  return true;
}

function selectedEditorName() {
  return state.editor.selected?.name || text('libraryEditorGeneric');
}

function beginLibraryEditorImport(triggerButton) {
  if (state.editor.importing) return false;
  state.editor.importing = true;
  const controls = document.querySelectorAll('[data-library-asset-action="import-editor"], [data-library-project-import]');
  controls.forEach((control) => {
    control.dataset.importWasDisabled = control.disabled ? 'true' : 'false';
    control.disabled = true;
  });
  if (triggerButton) {
    triggerButton.dataset.importIdleHtml = triggerButton.innerHTML;
    triggerButton.dataset.importIdleTitle = triggerButton.title || '';
    const loadingLabel = text('libraryImportingEditor', { editor: selectedEditorName() });
    triggerButton.innerHTML = iconSvg('refresh');
    triggerButton.title = loadingLabel;
    triggerButton.setAttribute('aria-label', loadingLabel);
    triggerButton.setAttribute('aria-busy', 'true');
    triggerButton.classList.add('is-loading');
  }
  return true;
}

function finishLibraryEditorImport() {
  state.editor.importing = false;
  document.querySelectorAll('[data-import-was-disabled]').forEach((control) => {
    control.disabled = control.dataset.importWasDisabled === 'true';
    if (control.classList.contains('is-loading')) {
      control.innerHTML = control.dataset.importIdleHtml || iconSvg('send');
      control.title = control.dataset.importIdleTitle || '';
      control.setAttribute('aria-label', control.title);
      control.removeAttribute('aria-busy');
      control.classList.remove('is-loading');
    }
    delete control.dataset.importWasDisabled;
    delete control.dataset.importIdleHtml;
    delete control.dataset.importIdleTitle;
  });
}

function applyEditorConfiguration(configuration) {
  state.editor.editors = Array.isArray(configuration?.editors) ? configuration.editors : [];
  state.editor.selected = configuration?.selected || null;
  renderEditorSettings();
  if (state.section === 'library') {
    renderLibrary();
    if (!els.libraryDetailOverlay.hidden) renderLibraryDetail();
  }
}

function renderEditorSettings() {
  if (!els.settingsEditor) return;
  const options = state.editor.editors.length
    ? state.editor.editors.map((editor) => `<option value="${escapeHtml(editor.id)}">${escapeHtml(editor.name)}</option>`).join('')
    : `<option value="">${escapeHtml(text('settingsEditorNone'))}</option>`;
  els.settingsEditor.innerHTML = options;
  els.settingsEditor.value = state.editor.selected?.id || '';
  els.settingsEditor.disabled = !state.editor.editors.length || state.editor.scanning;
  els.settingsEditorPath.value = state.editor.selected?.executable || '';
  els.settingsEditorScan.disabled = state.editor.scanning;
  els.settingsEditorScanLabel.textContent = text(state.editor.scanning ? 'settingsEditorScanning' : 'settingsEditorScan');
  els.settingsEditorChooseLabel.textContent = text('settingsEditorChoose');
}

async function scanEditingApps() {
  if (state.editor.scanning) return;
  state.editor.scanning = true;
  renderEditorSettings();
  try {
    const configuration = await window.mediaDeck.scanEditors();
    applyEditorConfiguration(configuration);
    toast(text('settingsEditorScanDone', { count: state.editor.editors.length }), 'success');
  } catch {
    toast(text('settingsEditorChooseFailed'), 'error');
  } finally {
    state.editor.scanning = false;
    renderEditorSettings();
  }
}

async function chooseEditingApp() {
  const configuration = await window.mediaDeck.chooseEditorExecutable().catch(() => null);
  if (!configuration) return;
  if (!configuration.ok) return toast(text('settingsEditorChooseFailed'), 'error');
  applyEditorConfiguration(configuration);
  toast(text('settingsEditorSaved', { editor: selectedEditorName() }), 'success');
}

async function changeDefaultEditingApp() {
  const configuration = await window.mediaDeck.setDefaultEditor(els.settingsEditor.value).catch(() => null);
  if (!configuration?.ok) return toast(text('settingsEditorChooseFailed'), 'error');
  applyEditorConfiguration(configuration);
  toast(text('settingsEditorSaved', { editor: selectedEditorName() }), 'success');
}

function libraryAssetBridgeItem(asset = {}) {
  return {
    ...asset,
    path: asset.filePath || asset.path || '',
    savePath: asset.folderPath || asset.savePath || '',
    fileName: getFileName(asset.filePath || asset.path || asset.title),
  };
}

function libraryAssetPresentation(assetType) {
  const presentations = {
    video: { label: text('libraryVideo'), icon: 'video-play', color: '#4c9fff' },
    audio: { label: text('libraryAudio'), icon: 'headset', color: '#a78bfa' },
    image: { label: text('libraryImage'), icon: 'view', color: '#34d399' },
    subtitle: { label: text('librarySubtitle'), icon: 'document', color: '#f59e0b' },
  };
  return presentations[assetType] || presentations.video;
}

function libraryProviderLabel(provider) {
  const key = libraryProviderKey(provider);
  const configured = state.platformConfig.platforms.find((platform) => libraryPlatformProviderKey(platform) === key);
  if (configured?.name) return configured.name;
  const labels = {
    youtube: 'YouTube', tiktok: 'TikTok', douyin: 'Douyin', agedm: 'AGE', vimeo: 'Vimeo',
    dailymotion: 'Dailymotion', instagram: 'Instagram', facebook: 'Facebook', twitter: 'X',
    reddit: 'Reddit', twitch: 'Twitch', pexels: 'Pexels', pixabay: 'Pixabay', web: text('libraryUnknownProvider'),
  };
  return labels[key] || key.replace(/[-_]+/g, ' ').replace(/\b\w/g, (value) => value.toUpperCase());
}

function libraryProviderKey(provider) {
  const key = String(provider || 'web').trim().toLowerCase();
  if (['twitter', 'x-twitter', 'x/twitter'].includes(key)) return 'x';
  return key;
}

function libraryPlatformProviderKey(platform = {}) {
  let detected = '';
  try { detected = MEDIA_RULES?.providerSiteForUrl?.(platform.url) || ''; } catch { /* fall back to its configured ID */ }
  return libraryProviderKey(detected || platform.id);
}

function libraryFilterPlatforms() {
  const enabledCategories = new Set(state.platformConfig.categories
    .filter((category) => category.enabled !== false)
    .map((category) => category.id));
  return state.platformConfig.platforms.filter((platform) => platform.enabled !== false && enabledCategories.has(platform.categoryId));
}

function libraryStatusPresentation(status) {
  if (status === 'missing') return { label: text('libraryStatusMissing'), className: 'is-missing' };
  if (status === 'partial') return { label: text('libraryStatusPartial'), className: 'is-partial' };
  return { label: text('libraryStatusAvailable'), className: 'is-available' };
}

function logicalLibraryAssets() {
  return state.library.projects.flatMap((project) => Array.isArray(project.assets) ? project.assets : []);
}

function libraryProjectForId(projectId) {
  return state.library.projects.find((project) => project.id === projectId) || null;
}

function libraryAssetForId(assetId) {
  return logicalLibraryAssets().find((asset) => asset.id === assetId) || null;
}

function libraryProjectForAsset(assetId) {
  return state.library.projects.find((project) => project.assets?.some((asset) => asset.id === assetId)) || null;
}

function librarySearchText(project) {
  return [project.title, project.provider, libraryProviderLabel(project.provider), project.sourceUrl, project.folderPath]
    .concat((project.assets || []).flatMap((asset) => [asset.title, asset.filePath, asset.language]))
    .filter(Boolean)
    .join(' ')
    .toLocaleLowerCase(state.locale);
}

function filteredLibraryProjects() {
  const query = state.library.query.trim().toLocaleLowerCase(state.locale);
  const projects = state.library.projects.filter((project) => {
    if (state.library.provider !== 'all' && libraryProviderKey(project.provider) !== state.library.provider) return false;
    if (state.library.assetType !== 'all' && !(project.assets || []).some((asset) => asset.assetType === state.library.assetType)) return false;
    if (!isInRange(project.updatedAt || project.downloadedAt, state.library.timeRange)) return false;
    return !query || librarySearchText(project).includes(query);
  });
  if (state.library.sort === 'title') return projects.sort((left, right) => String(left.title).localeCompare(String(right.title), state.locale));
  if (state.library.sort === 'size') return projects.sort((left, right) => Number(right.totalSize || 0) - Number(left.totalSize || 0));
  return projects.sort((left, right) => Date.parse(right.updatedAt || 0) - Date.parse(left.updatedAt || 0));
}

function filteredLibraryAssets() {
  const query = state.library.query.trim().toLocaleLowerCase(state.locale);
  const assets = [];
  for (const project of state.library.projects) {
    if (state.library.provider !== 'all' && libraryProviderKey(project.provider) !== state.library.provider) continue;
    for (const asset of project.assets || []) {
      if (state.library.assetType !== 'all' && asset.assetType !== state.library.assetType) continue;
      if (!isInRange(asset.downloadedAt, state.library.timeRange)) continue;
      const searchable = [project.title, project.provider, libraryProviderLabel(project.provider), asset.title, asset.filePath, asset.language]
        .filter(Boolean).join(' ').toLocaleLowerCase(state.locale);
      if (query && !searchable.includes(query)) continue;
      assets.push({ asset, project });
    }
  }
  if (state.library.sort === 'title') return assets.sort((left, right) => getFileName(left.asset.filePath).localeCompare(getFileName(right.asset.filePath), state.locale));
  if (state.library.sort === 'size') return assets.sort((left, right) => Number(right.asset.fileSize || 0) - Number(left.asset.fileSize || 0));
  return assets.sort((left, right) => Date.parse(right.asset.downloadedAt || 0) - Date.parse(left.asset.downloadedAt || 0));
}

function renderLibraryFilters() {
  if (!els.libraryProviderFilter) return;
  const providers = libraryFilterPlatforms()
    .map((platform) => ({ value: libraryPlatformProviderKey(platform), label: platform.name }))
    .filter((platform, index, items) => platform.value && items.findIndex((item) => item.value === platform.value) === index);
  els.libraryProviderFilter.innerHTML = [
    `<option value="all">${escapeHtml(text('libraryAllPlatforms'))}</option>`,
    ...providers.map((provider) => `<option value="${escapeHtml(provider.value)}">${escapeHtml(provider.label)}</option>`),
  ].join('');
  if (!providers.some((provider) => provider.value === state.library.provider)) state.library.provider = 'all';
  els.libraryProviderFilter.value = state.library.provider;
  els.libraryTypeFilter.innerHTML = [
    ['all', text('libraryAllTypes')], ['video', text('libraryVideo')], ['audio', text('libraryAudio')],
    ['image', text('libraryImage')], ['subtitle', text('librarySubtitle')],
  ].map(([value, label]) => `<option value="${value}">${escapeHtml(label)}</option>`).join('');
  els.libraryTypeFilter.value = state.library.assetType;
  renderRangeSelect(els.libraryTimeFilter, state.library.timeRange);
  els.librarySort.innerHTML = [
    ['recent', text('librarySortRecent')], ['title', text('librarySortTitle')], ['size', text('librarySortSize')],
  ].map(([value, label]) => `<option value="${value}">${escapeHtml(label)}</option>`).join('');
  els.librarySort.value = state.library.sort;
}

function libraryCountChips(project) {
  return ['video', 'audio', 'image', 'subtitle'].map((assetType) => {
    const count = Number(project.assetCounts?.[assetType] || 0);
    if (!count) return '';
    const presentation = libraryAssetPresentation(assetType);
    return `<span style="--asset-color:${presentation.color}" title="${escapeHtml(presentation.label)}">${iconSvg(presentation.icon)}${count}</span>`;
  }).join('');
}

function libraryProjectCard(project) {
  const status = libraryStatusPresentation(project.status);
  const statusBadge = project.status === 'available' ? '' : `<span class="library-status-badge ${status.className}">${escapeHtml(status.label)}</span>`;
  const cover = project.coverPath ? `data-library-cover-path="${escapeHtml(project.coverPath)}"` : '';
  if (state.library.view === 'list') {
    return `<article class="library-project-row-shell">
      <button class="library-project-row" type="button" data-library-project="${escapeHtml(project.id)}" title="${escapeHtml(text('libraryOpenProject'))}">
        <span class="library-row-cover" ${cover}>${iconSvg('folder-opened')}</span>
        <span class="library-row-primary"><b>${escapeHtml(project.title)}</b></span>
        <span class="library-row-secondary">${escapeHtml(libraryProviderLabel(project.provider))}</span>
        <span class="library-project-counts">${libraryCountChips(project)}</span>
        <span class="library-row-secondary">${escapeHtml(formatBytes(project.totalSize))}</span>
      </button>
      <button class="library-project-import" type="button" data-library-project-import="${escapeHtml(project.id)}" title="${escapeHtml(text('libraryImportProject', { editor: selectedEditorName() }))}" aria-label="${escapeHtml(text('libraryImportProject', { editor: selectedEditorName() }))}">${iconSvg('send')}</button>
    </article>`;
  }
  return `<button class="library-project-card" type="button" data-library-project="${escapeHtml(project.id)}" title="${escapeHtml(text('libraryOpenProject'))}">
    <span class="library-project-cover" ${cover}>${iconSvg('folder-opened')}<span class="library-provider-badge">${escapeHtml(libraryProviderLabel(project.provider))}</span>${statusBadge}</span>
    <span class="library-project-body">
      <span class="library-project-title">${escapeHtml(project.title)}</span>
      <span class="library-project-meta">${escapeHtml(text('libraryProjectAssets', { count: project.assetCount, size: formatBytes(project.totalSize) }))}</span>
      <span class="library-project-counts">${libraryCountChips(project)}<span class="library-project-size">${escapeHtml(formatTime(project.updatedAt))}</span></span>
    </span>
  </button>`;
}

function libraryAssetActions(asset, compact = false) {
  const disabled = asset.status === 'missing' ? ' disabled' : '';
  const missingClass = asset.status === 'missing' ? ' is-disabled' : '';
  const presentation = libraryAssetPresentation(asset.assetType);
  const openLabel = escapeHtml(downloadAssetPresentation(asset.assetType).openLabel);
  const revealLabel = escapeHtml(text('libraryReveal'));
  const importLabel = escapeHtml(text('libraryImportEditor', { editor: selectedEditorName() }));
  const importAction = `<button class="library-asset-action is-editor-action${missingClass}" type="button" data-library-asset-action="import-editor" data-library-asset-id="${escapeHtml(asset.id)}" title="${importLabel}" aria-label="${importLabel}"${disabled}>${iconSvg('send')}</button>`;
  return `<span class="${compact ? 'library-detail-asset-actions' : 'library-asset-actions'}">
    <button class="library-asset-action is-type-action${missingClass}" style="--asset-color:${presentation.color}" type="button" data-library-asset-action="preview" data-library-asset-id="${escapeHtml(asset.id)}" title="${openLabel}" aria-label="${openLabel}"${disabled}>${iconSvg(presentation.icon)}</button>
    ${importAction}
    <button class="library-asset-action${missingClass}" type="button" data-library-asset-action="reveal" data-library-asset-id="${escapeHtml(asset.id)}" title="${revealLabel}" aria-label="${revealLabel}"${disabled}>${iconSvg('folder-opened')}</button>
  </span>`;
}

function libraryAssetCard(entry) {
  const { asset, project } = entry;
  const presentation = libraryAssetPresentation(asset.assetType);
  const coverPath = asset.assetType === 'image' ? asset.filePath : '';
  const cover = coverPath ? `data-library-cover-path="${escapeHtml(coverPath)}"` : '';
  const fileName = getFileName(asset.filePath);
  const typeLabel = asset.assetRole === 'cover' ? text('librarySharedCover') : presentation.label;
  if (state.library.view === 'list') {
    return `<article class="library-asset-row">
      <span class="library-row-cover is-asset" ${cover}>${iconSvg(presentation.icon)}</span>
      <span class="library-row-primary"><b>${escapeHtml(fileName)}</b><span>${escapeHtml(project.title)}</span></span>
      <span class="library-row-secondary">${escapeHtml(typeLabel)}</span>
      <span class="library-row-secondary">${escapeHtml(libraryProviderLabel(project.provider))}</span>
      <span class="library-row-secondary">${asset.status === 'missing' ? escapeHtml(text('libraryMissing')) : escapeHtml(formatBytes(asset.fileSize))}</span>
      ${libraryAssetActions(asset)}
    </article>`;
  }
  return `<article class="library-asset-card" style="--asset-color:${presentation.color}">
    <div class="library-asset-cover" ${cover}>${iconSvg(presentation.icon)}<span class="library-asset-type-badge">${escapeHtml(typeLabel)}</span></div>
    <div class="library-project-body">
      <div class="library-asset-title">${escapeHtml(fileName)}</div>
      <div class="library-asset-meta">${escapeHtml(project.title)}</div>
      <div class="library-asset-footer"><span>${asset.status === 'missing' ? escapeHtml(text('libraryMissing')) : escapeHtml(formatBytes(asset.fileSize))}</span>${libraryAssetActions(asset)}</div>
    </div>
  </article>`;
}

function libraryEmptyState(filtered) {
  const hasLibrary = state.library.projects.length > 0;
  const title = hasLibrary && filtered ? text('libraryNoResultsTitle') : text('libraryEmptyTitle');
  const body = hasLibrary && filtered ? text('libraryNoResultsBody') : text('libraryEmptyBody');
  const action = hasLibrary && filtered ? '' : `<div class="library-empty-actions"><button class="is-primary" type="button" data-library-browse>${escapeHtml(text('libraryBrowse'))}</button></div>`;
  return `<div class="library-empty"><div class="library-empty-inner"><img class="app-empty-image" src="./assets/vidogo-empty.png" alt="" /><h3>${escapeHtml(title)}</h3><p>${escapeHtml(body)}</p>${action}</div></div>`;
}

function renderLibrary() {
  if (!els.libraryContent) return;
  els.libraryProjectCount.textContent = String(state.library.projects.length);
  els.libraryAssetCount.textContent = String(logicalLibraryAssets().length);
  els.libraryTabs.querySelectorAll('[data-library-tab]').forEach((button) => {
    const active = button.dataset.libraryTab === state.library.tab;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-selected', String(active));
  });
  els.libraryGridView.classList.toggle('is-active', state.library.view === 'grid');
  els.libraryListView.classList.toggle('is-active', state.library.view === 'list');
  els.libraryRefresh.classList.toggle('is-loading', state.library.loading);
  els.libraryRefresh.disabled = state.library.loading;
  els.libraryRefreshLabel.textContent = text(state.library.loading ? 'libraryRefreshing' : 'libraryRefresh');
  if (state.library.loading && !state.library.loaded) {
    els.libraryContent.innerHTML = `<div class="library-loading"><span>${iconSvg('refresh')}${escapeHtml(text('libraryLoading'))}</span></div>`;
    return;
  }
  if (state.library.error) {
    els.libraryContent.innerHTML = `<div class="library-error">${escapeHtml(text('libraryLoadFailed', { message: state.library.error }))}</div>`;
    return;
  }
  const isProjects = state.library.tab === 'projects';
  const entries = isProjects ? filteredLibraryProjects() : filteredLibraryAssets();
  const summary = text(isProjects ? 'libraryProjectSummary' : 'libraryAssetSummary', { count: entries.length });
  els.librarySummary.textContent = summary;
  if (!entries.length) {
    const filtered = Boolean(state.library.query || state.library.provider !== 'all' || state.library.assetType !== 'all' || state.library.timeRange !== 'all');
    els.libraryContent.innerHTML = libraryEmptyState(filtered);
    return;
  }
  const body = isProjects
    ? entries.map(libraryProjectCard).join('')
    : entries.map(libraryAssetCard).join('');
  els.libraryContent.innerHTML = `<div class="library-${state.library.view === 'grid' ? 'grid' : 'list'}">${body}</div>`;
  void renderLibraryCoverPreviews(els.libraryContent);
}

async function renderLibraryCoverPreviews(root) {
  const targets = Array.from(root?.querySelectorAll?.('[data-library-cover-path]') || []);
  await Promise.all(targets.map(async (target) => {
    const coverPath = target.dataset.libraryCoverPath;
    if (!coverPath) return;
    let url = state.library.previewUrls.get(coverPath);
    if (!url) {
      const result = await window.mediaDeck.previewDownloadedFile({ path: coverPath, fileName: getFileName(coverPath), assetType: 'image' }).catch(() => null);
      if (!result?.ok || !result.url) return;
      url = result.url;
      state.library.previewUrls.set(coverPath, url);
    }
    if (!target.isConnected || target.dataset.libraryCoverPath !== coverPath || target.querySelector('img')) return;
    const image = document.createElement('img');
    image.src = url;
    image.alt = '';
    target.appendChild(image);
  }));
}

function renderLibraryDetail() {
  const project = libraryProjectForId(state.library.selectedProjectId);
  if (!project) return closeLibraryDetail();
  els.libraryDetailEyebrow.textContent = libraryProviderLabel(project.provider);
  els.libraryDetailTitle.textContent = project.title;
  els.libraryDetailCover.innerHTML = iconSvg('folder-opened');
  if (project.coverPath) {
    els.libraryDetailCover.dataset.libraryCoverPath = project.coverPath;
    void renderLibraryCoverPreviews(els.libraryDetailCover.parentElement);
  } else delete els.libraryDetailCover.dataset.libraryCoverPath;
  const actions = [
    `<button class="library-detail-action" type="button" data-library-project-action="folder">${iconSvg('folder-opened')}<span>${escapeHtml(text('libraryOpenFolder'))}</span></button>`,
    project.sourceUrl ? `<button class="library-detail-action" type="button" data-library-project-action="source">${iconSvg('view')}<span>${escapeHtml(text('libraryOpenSource'))}</span></button>` : '',
  ].join('');
  const fields = [
    [text('libraryProvider'), libraryProviderLabel(project.provider), false],
    [text('libraryDownloadedAt'), formatTime(project.updatedAt), false], [text('librarySize'), formatBytes(project.totalSize), false],
    [text('libraryFolder'), project.folderPath || '-', true],
  ];
  const groups = ['video', 'audio', 'image', 'subtitle'].map((assetType) => {
    const assets = (project.assets || []).filter((asset) => asset.assetType === assetType);
    if (!assets.length) return '';
    const presentation = libraryAssetPresentation(assetType);
    const rows = assets.map((asset) => `<div class="library-detail-asset">
      <span class="library-asset-kind" style="--asset-color:${presentation.color}">${iconSvg(presentation.icon)}</span>
      <span class="library-detail-asset-copy"><b>${escapeHtml(getFileName(asset.filePath))}</b><span>${escapeHtml(asset.status === 'missing' ? text('libraryMissing') : `${formatBytes(asset.fileSize)} · ${formatTime(asset.downloadedAt)}`)}</span></span>
      ${libraryAssetActions(asset, true)}
    </div>`).join('');
    return `<section class="library-asset-group"><h3 class="library-asset-group-title" style="--asset-color:${presentation.color}">${iconSvg(presentation.icon)}${escapeHtml(presentation.label)}<strong>${assets.length}</strong></h3><div class="library-detail-assets">${rows}</div></section>`;
  }).join('');
  els.libraryDetailBody.innerHTML = `<div class="library-detail-actions">${actions}</div><dl class="library-detail-meta">${fields.map(([label, value, wide]) => `<div class="library-detail-meta-item${wide ? ' is-wide' : ''}"><dt>${escapeHtml(label)}</dt><dd title="${escapeHtml(value)}">${escapeHtml(value)}</dd></div>`).join('')}</dl>${groups}`;
}

function openLibraryDetail(projectId) {
  if (!libraryProjectForId(projectId)) return;
  state.library.selectedProjectId = projectId;
  renderLibraryDetail();
  els.libraryDetailOverlay.hidden = false;
  els.libraryDetailClose.focus();
}

function closeLibraryDetail() {
  if (!els.libraryDetailOverlay) return;
  els.libraryDetailOverlay.hidden = true;
  state.library.selectedProjectId = null;
}

async function handleLibraryAction(action, assetId, triggerButton = null) {
  const asset = libraryAssetForId(assetId);
  if (!asset || asset.status === 'missing') return;
  const item = libraryAssetBridgeItem(asset);
  if (action === 'preview') return showMediaPreview(item);
  if (action === 'import-editor') {
    if (!beginLibraryEditorImport(triggerButton)) return;
    let result;
    try {
      result = await window.mediaDeck.importIntoEditor(item).catch(() => ({ ok: false, reason: 'editor-launch-failed' }));
    } finally {
      finishLibraryEditorImport();
    }
    const editorName = result?.editorName || selectedEditorName();
    if (result?.ok) return toast(text('libraryImportEditorDone', { editor: editorName }), 'success');
    if (result?.reason === 'editor-not-found') return toast(text('libraryImportEditorMissing'), 'error');
    if (result?.reason === 'editor-not-ready') return toast(text('libraryImportEditorNotReady', { editor: editorName }), 'warning');
    if (result?.reason === 'background-import-unsupported') return toast(text('libraryImportEditorBackgroundUnsupported', { editor: editorName }), 'warning');
    if (result?.reason === 'file-not-found') return toast(text('openFileFailed'), 'error');
    return toast(text('libraryImportEditorFailed', { editor: editorName }), 'error');
  }
  if (action === 'reveal') {
    const result = await window.mediaDeck.showItemInFolder(item.path).catch(() => false);
    if (!result) toast(text('openFolderFailed'), 'error');
  }
}

async function handleLibraryProjectImport(projectId, triggerButton = null) {
  const project = libraryProjectForId(projectId);
  const items = (project?.assets || [])
    .filter((asset) => asset.status !== 'missing')
    .map((asset) => libraryAssetBridgeItem(asset));
  if (!items.length) return toast(text('openFileFailed'), 'error');
  if (!beginLibraryEditorImport(triggerButton)) return;
  let result;
  try {
    result = await window.mediaDeck.importManyIntoEditor(items).catch(() => ({ ok: false, reason: 'editor-launch-failed' }));
  } finally {
    finishLibraryEditorImport();
  }
  const editorName = result?.editorName || selectedEditorName();
  if (result?.ok) return toast(text('libraryImportProjectDone', { editor: editorName, count: result.count || items.length }), 'success');
  if (result?.reason === 'editor-not-found') return toast(text('libraryImportEditorMissing'), 'error');
  if (result?.reason === 'editor-not-ready') return toast(text('libraryImportEditorNotReady', { editor: editorName }), 'warning');
  if (result?.reason === 'background-import-unsupported') return toast(text('libraryImportEditorBackgroundUnsupported', { editor: editorName }), 'warning');
  if (result?.reason === 'file-not-found') return toast(text('openFileFailed'), 'error');
  return toast(text('libraryImportEditorFailed', { editor: editorName }), 'error');
}

async function handleLibraryProjectAction(action) {
  const project = libraryProjectForId(state.library.selectedProjectId);
  if (!project) return;
  if (action === 'folder') {
    const opened = await window.mediaDeck.openPath(project.folderPath).catch(() => false);
    if (!opened) toast(text('openFolderFailed'), 'error');
  } else if (action === 'source' && project.sourceUrl) {
    closeLibraryDetail();
    openUrl(project.sourceUrl, project.title || libraryProviderLabel(project.provider));
  }
}

async function loadMediaLibrary(options = {}) {
  if (state.library.loading) return;
  state.library.loading = true;
  state.library.error = '';
  renderLibrary();
  try {
    const document = options.refresh
      ? await window.mediaDeck.refreshMediaLibrary()
      : await window.mediaDeck.listMediaLibrary();
    state.library.items = Array.isArray(document?.items) ? document.items : [];
    state.library.projects = Array.isArray(document?.projects) ? document.projects : [];
    state.library.loaded = true;
    renderLibraryFilters();
    if (state.library.selectedProjectId && !libraryProjectForId(state.library.selectedProjectId)) closeLibraryDetail();
    else if (state.library.selectedProjectId) renderLibraryDetail();
    if (options.announce) toast(text('libraryRefreshDone'), 'success');
  } catch (error) {
    state.library.error = error?.message || String(error);
  } finally {
    state.library.loading = false;
    renderLibrary();
  }
}

function updateLibraryCopy() {
  if (!els.libraryContent) return;
  els.libraryProjectsLabel.textContent = text('libraryProjects');
  els.libraryAssetsLabel.textContent = text('libraryAllAssets');
  els.librarySearchLabel.textContent = text('librarySearch');
  els.librarySearch.placeholder = text('librarySearchPlaceholder');
  els.libraryRefresh.title = text('libraryRefresh');
  els.libraryRefresh.setAttribute('aria-label', text('libraryRefresh'));
  els.libraryGridView.title = text('libraryGridView');
  els.libraryGridView.setAttribute('aria-label', text('libraryGridView'));
  els.libraryListView.title = text('libraryListView');
  els.libraryListView.setAttribute('aria-label', text('libraryListView'));
  els.libraryDetailEyebrow.textContent = text('libraryProjects');
  els.libraryDetailClose.title = text('close');
  els.libraryDetailClose.setAttribute('aria-label', text('close'));
  els.libraryDetailScrim.setAttribute('aria-label', text('close'));
  renderLibraryFilters();
  renderLibrary();
}

function tabForWebContentsId(webContentsId) {
  const id = Number(webContentsId);
  if (!Number.isFinite(id) || id <= 0) return null;
  return state.tabs.find((tab) => Number(tab.webContentsId) === id) || null;
}

function mediaTabIdForCandidate(candidate) {
  const webContentsId = Number(candidate?.webContentsId);
  if (Number.isFinite(webContentsId) && webContentsId > 0) return tabForWebContentsId(webContentsId)?.id || null;
  return state.activeTabId;
}

function mediaCandidatesForTab(tabId = state.activeTabId) {
  return tabId ? state.candidatesByTabId[tabId] || [] : [];
}

function tabProvider(tab) {
  return MEDIA_RULES?.providerSiteForUrl?.(tab?.url) || null;
}

function isSingleActiveMediaTab(tab) {
  return ['tiktok', 'douyin'].includes(tabProvider(tab));
}

function createTikTokActiveMediaProbeScript() {
  return `(() => {
    const visibleArea = (rect) => Math.max(0, Math.min(rect.right, innerWidth) - Math.max(rect.left, 0))
      * Math.max(0, Math.min(rect.bottom, innerHeight) - Math.max(rect.top, 0));
    const video = Array.from(document.querySelectorAll('video')).map((item) => {
      const rect = item.getBoundingClientRect();
      const style = getComputedStyle(item);
      if (rect.width < 120 || rect.height < 120 || style.display === 'none' || style.visibility === 'hidden') return null;
      const area = visibleArea(rect);
      if (!area) return null;
      return { item, score: (!item.paused && !item.ended ? innerWidth * innerHeight * 2 : 0) + area };
    }).filter(Boolean).sort((left, right) => right.score - left.score)[0]?.item;
    if (!video) return null;
    let rootFiber = null;
    for (let node = video; node && !rootFiber; node = node.parentElement) {
      const fiberKey = Object.keys(node).find((key) => key.startsWith('__reactFiber'));
      if (fiberKey) rootFiber = node[fiberKey];
    }
    let item = null;
    const items = [];
    const itemIds = new Set();
    const seen = new WeakSet();
    let visited = 0;
    const scan = (value, depth) => {
      if (!value || typeof value !== 'object' || seen.has(value) || depth > 9 || visited >= 16000 || items.length >= 80) return;
      seen.add(value);
      visited += 1;
      const id = String(value.id || value.itemId || value.item_id || value.awemeId || value.aweme_id || '');
      if (/^\\d{12,}$/.test(id) && value.video && typeof value.video === 'object') {
        if (!itemIds.has(id)) { itemIds.add(id); items.push(value); }
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
    let nearbyCanonicalUrl = /^\\/@[^/]+\\/video\\/\\d+/i.test(location.pathname) ? location.href : '';
    for (let node = video, depth = 0; node && !nearbyCanonicalUrl && depth < 12; node = node.parentElement, depth += 1) {
      const link = node.matches?.('a[href*="/video/"]') ? node : node.querySelector?.('a[href*="/video/"]');
      if (!link?.href) continue;
      try {
        const parsed = new URL(link.href, location.href);
        if (/^\\/@[^/]+\\/video\\/\\d+/i.test(parsed.pathname)) nearbyCanonicalUrl = parsed.href;
      } catch { /* ignore transient feed links */ }
    }
    const firstUrl = (value) => {
      if (typeof value === 'string' && /^https?:/i.test(value)) return value;
      if (!value || typeof value !== 'object') return '';
      const values = [value.url, value.src, ...(value.urlList || []), ...(value.UrlList || []), ...(value.url_list || [])];
      return values.find((entry) => typeof entry === 'string' && /^https?:/i.test(entry)) || '';
    };
    const integer = (value) => {
      const number = Number(value || 0);
      return Number.isFinite(number) && number > 0 ? Math.round(number) : 0;
    };
    const codecLabel = (value) => {
      const codec = String(value || '');
      if (/265|hevc|bytevc/i.test(codec)) return 'H.265';
      if (/264|avc/i.test(codec)) return 'H.264';
      return '';
    };
    const toVariant = (entry, fallbackLabel = '') => {
      const playAddress = entry?.PlayAddr || entry?.playAddr || entry?.play_addr || entry;
      const url = firstUrl(playAddress);
      if (!url) return null;
      const width = integer(playAddress?.Width || playAddress?.width || entry?.Width || entry?.width);
      const height = integer(playAddress?.Height || playAddress?.height || entry?.Height || entry?.height);
      const resolution = Math.min(width || height, height || width);
      const videoCodec = codecLabel(entry?.CodecType || entry?.codecType || entry?.codec || entry?.Format || entry?.format);
      const bitrate = integer(entry?.Bitrate || entry?.bitrate);
      return {
        url,
        extension: 'mp4',
        mimeType: 'video/mp4',
        width,
        height,
        resolution,
        qualityLabel: resolution ? (resolution + 'p' + (videoCodec ? ' · ' + videoCodec : '')) : fallbackLabel,
        videoCodec,
        bitrateKbps: bitrate ? Math.round(bitrate / 1000) : 0,
        bandwidthBitsPerSecond: bitrate,
        sizeBytes: integer(playAddress?.DataSize || playAddress?.dataSize || entry?.DataSize || entry?.dataSize),
        hasAudio: true,
        hasVideo: true,
        isDrmProtected: false,
        sourceClient: 'tiktok-page',
      };
    };
    let media = item?.video || {};
    let primary = toVariant(media.PlayAddrStruct || media.playAddr || media.play_addr, '原画');
    const mediaResourceUrls = (() => {
      const urls = [];
      const entries = performance.getEntriesByType?.('resource') || [];
      for (const entry of entries) {
        try {
          const url = new URL(entry.name);
          const mediaHost = /(?:tiktokcdn|byteoversea|ibytedtos|bytevcdn|\\.tiktok\\.com)$/i.test(url.hostname);
          const mediaPath = /(?:mime_type=video_mp4|\\/video\\/tos\\/|\\.mp4(?:$|[?#]))/i.test(url.href);
          if (url.protocol === 'https:' && mediaHost && mediaPath && !urls.includes(url.href)) urls.push(url.href);
        } catch { /* ignore non-URL performance entries */ }
      }
      return urls;
    })();
    const scope = video.closest('[data-e2e="recommend-list-item-container"], [data-e2e="browse-video"], [data-e2e="feed-video"], article')
      || video.parentElement?.parentElement || document;
    const titleForVideo = (itemVideo) => {
      const itemScope = itemVideo.closest?.('[data-e2e="recommend-list-item-container"], [data-e2e="browse-video"], [data-e2e="feed-video"], article')
        || itemVideo.parentElement?.parentElement || document;
      return ['[data-e2e="browse-video-desc"]', '[data-e2e="video-desc"]', '[data-e2e="search-card-desc"]', 'h1']
        .map((selector) => itemScope.querySelector?.(selector)?.textContent?.replace(/\\s+/g, ' ').trim())
        .find(Boolean) || '';
    };
    const domTitle = titleForVideo(video);
    const visibleThumbnail = Array.from(scope.querySelectorAll?.('img') || []).map((image) => {
      const url = String(image.currentSrc || image.src || '').trim();
      if (!/^https?:/i.test(url)) return null;
      const rect = image.getBoundingClientRect();
      const area = visibleArea(rect);
      return area >= 10000 ? { url, area } : null;
    }).filter(Boolean).sort((left, right) => right.area - left.area)[0]?.url || '';
    const rawVideoUrl = String(video.currentSrc || video.src || '').trim();
    const contentKeyForVideo = (itemVideo) => {
      const source = String(itemVideo.currentSrc || itemVideo.src || '').trim();
      return source + '|' + titleForVideo(itemVideo);
    };
    const currentContentKey = rawVideoUrl + '|' + domTitle;
    const currentIdentityKey = currentContentKey + '|' + visibleThumbnail;
    const targetPreviousKey = String(video.__vidogoTikTokContentKey || '');
    const targetSourceReused = Boolean(targetPreviousKey && targetPreviousKey !== currentContentKey
      && targetPreviousKey.startsWith(rawVideoUrl + '|'));
    const normalizedDomTitle = domTitle.toLowerCase();
    const matchingItem = items.find((candidate) => {
      const title = String(candidate?.desc || candidate?.description || candidate?.title || '').replace(/\\s+/g, ' ').trim().toLowerCase();
      return normalizedDomTitle && title && (normalizedDomTitle.includes(title) || title.includes(normalizedDomTitle));
    }) || null;
    item = matchingItem || items[0] || null;
    const normalizedReactTitle = String(item?.desc || item?.description || item?.title || '').replace(/\\s+/g, ' ').trim().toLowerCase();
    const reactItemMatches = !normalizedDomTitle || !normalizedReactTitle
      || normalizedDomTitle.includes(normalizedReactTitle)
      || normalizedReactTitle.includes(normalizedDomTitle);
    const activeItem = reactItemMatches ? item : null;
    media = activeItem?.video || {};
    primary = toVariant(media.PlayAddrStruct || media.playAddr || media.play_addr, '原画');
    const mediaRegistry = window.__vidogoTikTokMediaRegistry || {
      mediaToUrl: Object.create(null),
      assignedUrls: Object.create(null),
      activeContentKey: '',
    };
    mediaRegistry.mediaToUrl ||= Object.create(null);
    mediaRegistry.assignedUrls ||= Object.create(null);
    window.__vidogoTikTokMediaRegistry = mediaRegistry;
    const previousActiveSource = String(mediaRegistry.activeContentKey || '').split('|')[0];
    const activeContentChanged = mediaRegistry.activeContentKey !== currentContentKey;
    mediaRegistry.activeContentKey = currentContentKey;
    for (const itemVideo of Array.from(document.querySelectorAll('video'))) {
      const blobUrl = String(itemVideo.currentSrc || itemVideo.src || '').trim();
      if (!blobUrl || /^https?:/i.test(blobUrl)) continue;
      const mediaKey = itemVideo === video ? currentContentKey : contentKeyForVideo(itemVideo);
      const previousVideoKey = String(itemVideo.__vidogoTikTokContentKey || '');
      const sourceReused = Boolean(previousVideoKey && previousVideoKey !== mediaKey && previousVideoKey.startsWith(blobUrl + '|'));
      itemVideo.__vidogoTikTokContentKey = mediaKey;
      if (mediaRegistry.mediaToUrl[mediaKey]) continue;
      const sameSourceUrl = !sourceReused && blobUrl !== previousActiveSource
        ? Object.entries(mediaRegistry.mediaToUrl).find(([key]) => key.startsWith(blobUrl + '|'))?.[1]
        : '';
      if (sameSourceUrl) {
        mediaRegistry.mediaToUrl[mediaKey] = sameSourceUrl;
        continue;
      }
      const itemTitle = titleForVideo(itemVideo);
      const matchingContentUrl = itemTitle
        ? Object.entries(mediaRegistry.mediaToUrl).find(([key]) => key.endsWith('|' + itemTitle))?.[1]
        : '';
      if (matchingContentUrl) {
        mediaRegistry.mediaToUrl[mediaKey] = matchingContentUrl;
        continue;
      }
      const nextUrl = mediaResourceUrls.find((url) => !mediaRegistry.assignedUrls[url]);
      if (!nextUrl) continue;
      mediaRegistry.mediaToUrl[mediaKey] = nextUrl;
      mediaRegistry.assignedUrls[nextUrl] = true;
    }
    if (activeContentChanged && !mediaRegistry.mediaToUrl[currentContentKey] && mediaResourceUrls.length) {
      const sameSourceUrl = !targetSourceReused && rawVideoUrl !== previousActiveSource
        ? Object.entries(mediaRegistry.mediaToUrl).find(([key]) => key.startsWith(rawVideoUrl + '|'))?.[1]
        : '';
      const matchingContentUrl = domTitle
        ? Object.entries(mediaRegistry.mediaToUrl).find(([key]) => key.endsWith('|' + domTitle))?.[1]
        : '';
      mediaRegistry.mediaToUrl[currentContentKey] = matchingContentUrl || sameSourceUrl || mediaResourceUrls[mediaResourceUrls.length - 1];
      mediaRegistry.assignedUrls[mediaRegistry.mediaToUrl[currentContentKey]] = true;
    }
    const playingUrl = firstUrl(rawVideoUrl) || mediaRegistry.mediaToUrl[currentContentKey] || '';
    const playingWidth = integer(video.videoWidth);
    const playingHeight = integer(video.videoHeight);
    const playingResolution = Math.min(playingWidth || playingHeight, playingHeight || playingWidth);
    const playingVariant = playingUrl ? {
      url: playingUrl,
      extension: 'mp4',
      mimeType: 'video/mp4',
      width: playingWidth,
      height: playingHeight,
      resolution: playingResolution,
      qualityLabel: playingResolution ? (playingResolution + 'p') : '当前播放',
      videoCodec: '',
      bitrateKbps: 0,
      bandwidthBitsPerSecond: 0,
      sizeBytes: 0,
      hasAudio: true,
      hasVideo: true,
      isDrmProtected: false,
      sourceClient: 'tiktok-page',
    } : null;
    const variants = [primary, ...((media.bitrateInfo || media.bit_rate || [])
      .map((entry) => toVariant(entry))), playingVariant]
      .filter(Boolean)
      .filter((entry, index, all) => all.findIndex((other) => other.url === entry.url) === index)
      .slice(0, 12);
    const nearbyMatch = (() => {
      try { return new URL(nearbyCanonicalUrl).pathname.match(/^\\/@([^/]+)\\/video\\/(\\d+)/i); } catch { return null; }
    })();
    const isDirectVideoPage = /^\\/@[^/]+\\/video\\/\\d+/i.test(location.pathname);
    const reportedMediaId = isDirectVideoPage
      ? String(activeItem?.id || activeItem?.itemId || activeItem?.item_id || activeItem?.awemeId || activeItem?.aweme_id || nearbyMatch?.[2] || '')
      : '';
    const authorValue = activeItem?.author || activeItem?.authorInfo || activeItem?.author_info || {};
    const author = String(authorValue?.uniqueId || authorValue?.unique_id || nearbyMatch?.[1] || '').replace(/^@/, '');
    const hashSource = currentIdentityKey || currentContentKey || rawVideoUrl || playingUrl || (location.href + ':' + Math.floor(Number(video.currentTime || 0)));
    const mediaHash = Array.from(hashSource).reduce(
      (value, character) => Math.imul(value ^ character.charCodeAt(0), 16777619) >>> 0,
      2166136261,
    ).toString(36);
    const mediaId = reportedMediaId || ('active-' + mediaHash);
    const selected = primary || variants[0] || null;
    if (!playingUrl && !selected?.url && (!reportedMediaId || !author)) return null;
    return {
      provider: 'tiktok',
      mediaId,
      canonicalUrl: reportedMediaId && author ? (location.origin + '/@' + author + '/video/' + reportedMediaId) : location.href,
      title: String(domTitle || activeItem?.desc || activeItem?.description || activeItem?.title || '').replace(/\\s+/g, ' ').trim() || (author + ' · TikTok'),
      thumbnailUrl: firstUrl(video.poster) || visibleThumbnail || firstUrl(media.cover) || firstUrl(media.originCover)
        || firstUrl(media.dynamicCover) || firstUrl(activeItem?.cover),
      directUrl: selected?.url || playingUrl || '',
      width: integer(video.videoWidth) || selected?.width || 0,
      height: integer(video.videoHeight) || selected?.height || 0,
      resolution: Math.min(integer(video.videoWidth) || selected?.width || 0, integer(video.videoHeight) || selected?.height || 0),
      qualityLabel: selected?.qualityLabel || '',
      sizeBytes: selected?.sizeBytes || 0,
      variants,
    };
  })()`;
}

function createDouyinActiveMediaProbeScript() {
  return `(() => {
    const targetId = new URLSearchParams(location.search).get('modal_id')
      || location.pathname.match(/^\\/video\\/(\\d+)/i)?.[1]
      || '';
    if (!/^\\d{12,}$/.test(targetId)) return null;
    const visibleArea = (rect) => Math.max(0, Math.min(rect.right, innerWidth) - Math.max(rect.left, 0))
      * Math.max(0, Math.min(rect.bottom, innerHeight) - Math.max(rect.top, 0));
    const activeVideo = Array.from(document.querySelectorAll('video')).map((video) => {
      const rect = video.getBoundingClientRect();
      const area = visibleArea(rect);
      return area > 0 ? { video, score: (!video.paused && !video.ended ? innerWidth * innerHeight * 2 : 0) + area } : null;
    }).filter(Boolean).sort((left, right) => right.score - left.score)[0]?.video || null;
    if (!activeVideo) return null;
    let rootFiber = null;
    for (let node = activeVideo; node && !rootFiber; node = node.parentElement) {
      const key = Object.keys(node).find((name) => name.startsWith('__reactFiber'));
      if (key) rootFiber = node[key];
    }
    if (!rootFiber) return null;
    let item = null;
    const findItem = (root) => {
      const seen = new WeakSet();
      let visited = 0;
      const scan = (value, depth) => {
        if (item || !value || typeof value !== 'object' || seen.has(value) || depth > 8 || visited >= 4000) return;
        seen.add(value);
        visited += 1;
        const id = String(value.awemeId || value.aweme_id || value.itemId || value.item_id || value.id || '');
        if (id === targetId && value.video) { item = value; return; }
        const keys = Object.keys(value).slice(0, 140).sort((left, right) => {
          const score = (key) => /(?:aweme|item|video|detail|data|state|props|list)/i.test(key) ? 1 : 0;
          return score(right) - score(left);
        });
        for (const key of keys) {
          if (/^(?:return|child|sibling|stateNode|_owner|ref)$/i.test(key)) continue;
          let next;
          try { next = value[key]; } catch { continue; }
          scan(next, depth + 1);
          if (item) return;
        }
      };
      scan(root, 0);
    };
    for (let fiber = rootFiber, level = 0; fiber && level < 36 && !item; fiber = fiber.return, level += 1) {
      findItem(fiber.memoizedProps);
      findItem(fiber.pendingProps);
      findItem(fiber.memoizedState);
    }
    if (!item?.video) return null;
    const firstUrl = (value) => {
      if (typeof value === 'string' && /^https?:/i.test(value)) return value;
      if (Array.isArray(value)) return value.find((entry) => typeof entry === 'string' && /^https?:/i.test(entry)) || '';
      if (!value || typeof value !== 'object') return '';
      const values = [value.url, value.src, ...(value.urlList || []), ...(value.UrlList || []), ...(value.url_list || [])];
      return values.find((entry) => typeof entry === 'string' && /^https?:/i.test(entry)) || '';
    };
    const integer = (value) => {
      const number = Number(value || 0);
      return Number.isFinite(number) && number > 0 ? Math.round(number) : 0;
    };
    const media = item.video;
    const toVariant = (entry, fallbackLabel = '') => {
      const address = entry?.playAddr || entry?.play_addr || entry?.PlayAddr || entry;
      const url = firstUrl(address) || firstUrl(entry?.playApi || entry?.play_api || entry?.PlayApi);
      if (!url) return null;
      const width = integer(address?.width || address?.Width || entry?.width || entry?.Width || media.width);
      const height = integer(address?.height || address?.Height || entry?.height || entry?.Height || media.height);
      const resolution = Math.min(width || height, height || width);
      const isH265 = Boolean(entry?.isH265 || entry?.is_h265 || /265|hevc|bytevc/i.test(String(entry?.codecType || entry?.codec || '')));
      const codec = isH265 ? 'H.265' : 'H.264';
      const sizeBytes = integer(entry?.playAddrSize || entry?.play_addr_size || address?.dataSize || address?.data_size || entry?.dataSize || entry?.data_size || media.dataSize);
      const bitrate = integer(entry?.bitRate || entry?.bit_rate || entry?.bitrate);
      return {
        url,
        extension: 'mp4',
        mimeType: 'video/mp4',
        width,
        height,
        resolution,
        qualityLabel: resolution ? (resolution + 'p · ' + codec) : (fallbackLabel || codec),
        videoCodec: codec,
        bitrateKbps: bitrate ? Math.round(bitrate / 1000) : 0,
        bandwidthBitsPerSecond: bitrate,
        sizeBytes,
        hasAudio: true,
        hasVideo: true,
        isDrmProtected: false,
        sourceClient: 'douyin-page',
      };
    };
    const primary = toVariant({
      playAddr: media.playAddr || media.play_addr,
      playApi: media.playApi || media.play_api,
      width: media.width,
      height: media.height,
      dataSize: media.dataSize,
    }, '原画');
    const variants = [primary, ...((media.bitRateList || media.bit_rate || media.bitrateInfo || []).map((entry) => toVariant(entry)))]
      .filter(Boolean)
      .filter((entry, index, all) => all.findIndex((other) => other.url === entry.url) === index)
      .sort((left, right) => (right.resolution - left.resolution) || (right.sizeBytes - left.sizeBytes))
      .slice(0, 12);
    const selected = primary || variants[0] || null;
    const thumbnailUrl = firstUrl(media.cover) || firstUrl(media.coverUrlList)
      || firstUrl(media.originCover) || firstUrl(media.originCoverUrlList)
      || firstUrl(media.dynamicCover);
    return {
      provider: 'douyin',
      mediaId: targetId,
      canonicalUrl: location.origin + '/video/' + targetId,
      title: String(item.desc || item.itemTitle || item.caption || document.title || '抖音视频').replace(/\\s+/g, ' ').trim(),
      thumbnailUrl,
      directUrl: selected?.url || '',
      width: integer(activeVideo.videoWidth) || selected?.width || integer(media.width),
      height: integer(activeVideo.videoHeight) || selected?.height || integer(media.height),
      resolution: Math.min(integer(activeVideo.videoWidth) || selected?.width || integer(media.width), integer(activeVideo.videoHeight) || selected?.height || integer(media.height)),
      qualityLabel: selected?.qualityLabel || '',
      sizeBytes: selected?.sizeBytes || integer(media.dataSize),
      variants,
    };
  })()`;
}

async function probeActiveMedia(tab) {
  const provider = tabProvider(tab);
  if (!tab || !state.tabs.includes(tab) || !['tiktok', 'douyin'].includes(provider) || !tab.ready) return;
  try {
    const payload = await Promise.race([
      tab.webview.executeJavaScript(provider === 'douyin'
        ? createDouyinActiveMediaProbeScript()
        : createTikTokActiveMediaProbeScript(), true),
      new Promise((resolve) => setTimeout(() => resolve(null), 3000)),
    ]);
    if (payload) await handleActiveMediaContext(tab, payload);
  } catch {
    // A navigation can invalidate an in-flight page probe.
  }
}

function scheduleActiveMediaProbe(tab, delay = 900) {
  if (!tab) return;
  if (tab.activeMediaProbeTimer) clearTimeout(tab.activeMediaProbeTimer);
  if (!['tiktok', 'douyin'].includes(tabProvider(tab))) {
    tab.activeMediaProbeTimer = 0;
    return;
  }
  tab.activeMediaProbeTimer = window.setTimeout(async () => {
    tab.activeMediaProbeTimer = 0;
    await probeActiveMedia(tab);
    if (state.tabs.includes(tab) && ['tiktok', 'douyin'].includes(tabProvider(tab))) {
      scheduleActiveMediaProbe(tab, tabProvider(tab) === 'tiktok' ? 450 : 900);
    }
  }, delay);
}

function activeMediaPlaceholder(tab, context) {
  const thumbnailUrl = context.thumbnailUrl || null;
  return {
    id: `active-${context.provider}-${context.mediaId}`,
    webContentsId: tab.webContentsId,
    url: context.directUrl || context.canonicalUrl,
    pageUrl: context.canonicalUrl,
    provider: context.provider,
    fileName: context.title,
    title: context.title,
    kind: 'video',
    thumbnailUrl,
    extension: 'mp4',
    width: context.width || null,
    height: context.height || null,
    resolution: context.resolution || null,
    qualityLabel: context.qualityLabel || null,
    sizeBytes: context.sizeBytes || null,
    variants: context.variants || [],
    hasAudio: true,
    hasVideo: true,
    assets: {
      audio: [{ id: 'audio-mp3', assetType: 'audio', assetRole: 'derived', extension: 'mp3', generated: true }],
      images: thumbnailUrl ? [{ id: 'cover', assetType: 'image', assetRole: 'cover', extension: 'jpg', url: thumbnailUrl }] : [],
      subtitles: [],
    },
    isRecommended: true,
    downloadStrategy: context.directUrl ? 'direct' : 'merge',
    sourceClient: context.directUrl ? `${context.provider}-page` : 'active-page',
    metadataSource: `${context.provider}-active-video`,
    detectedAt: new Date().toISOString(),
  };
}

function safeActiveMediaUrl(value, maxLength = 16384) {
  const raw = String(value || '').trim();
  if (!raw || raw.length > maxLength) return null;
  try {
    const parsed = new URL(raw);
    if (parsed.protocol !== 'https:' || !parsed.hostname || parsed.username || parsed.password) return null;
    return parsed.href;
  } catch {
    return null;
  }
}

function safePositiveInteger(value) {
  const number = Number(value || 0);
  return Number.isFinite(number) && number > 0 ? Math.round(number) : null;
}

function safeActiveMediaVariant(value, provider = 'web') {
  const url = safeActiveMediaUrl(value?.url);
  if (!url) return null;
  const width = safePositiveInteger(value?.width);
  const height = safePositiveInteger(value?.height);
  const resolution = safePositiveInteger(value?.resolution || height);
  const videoCodec = ['H.264', 'H.265'].includes(value?.videoCodec) ? value.videoCodec : null;
  return {
    url,
    extension: 'mp4',
    mimeType: 'video/mp4',
    width,
    height,
    resolution,
    qualityLabel: String(value?.qualityLabel || (resolution ? resolution + 'p' : '')).slice(0, 80),
    videoCodec,
    bitrateKbps: safePositiveInteger(value?.bitrateKbps),
    bandwidthBitsPerSecond: safePositiveInteger(value?.bandwidthBitsPerSecond),
    sizeBytes: safePositiveInteger(value?.sizeBytes),
    hasAudio: true,
    hasVideo: true,
    isDrmProtected: false,
    sourceClient: `${provider}-page`,
  };
}

function candidateMatchesActiveMedia(candidate, context) {
  if (!context || candidate?.provider !== context.provider) return false;
  const candidatePage = MEDIA_RULES?.classifyMediaPage?.(candidate.pageUrl || candidate.url);
  return candidatePage?.provider === context.provider && candidatePage?.mediaId === context.mediaId;
}

async function handleActiveMediaContext(tab, payload) {
  const provider = tabProvider(tab);
  if (!tab || !['tiktok', 'douyin'].includes(provider) || payload?.provider !== provider) return;
  if (payload?.cleared) {
    tab.activeMediaContext = null;
    tab.activeMediaExtractionKey = null;
    clearMediaCandidatesForTab(tab.id);
    if (tab.id === state.activeTabId) renderCandidates();
    return;
  }
  const reportedMediaId = String(payload.mediaId || '');
  const reportedCanonicalUrl = safeActiveMediaUrl(payload.canonicalUrl) || tab.url;
  const canonicalPage = MEDIA_RULES?.classifyMediaPage?.(reportedCanonicalUrl);
  const variants = (Array.isArray(payload.variants) ? payload.variants : [])
    .map((variant) => safeActiveMediaVariant(variant, provider))
    .filter(Boolean)
    .filter((variant, index, all) => all.findIndex((other) => other.url === variant.url) === index)
    .slice(0, 12);
  const directUrl = safeActiveMediaUrl(payload.directUrl) || variants[0]?.url || null;
  const canonicalMatches = canonicalPage?.provider === provider && canonicalPage?.mediaId === reportedMediaId;
  const directHomepageFallback = provider === 'tiktok'
    && /^active-[a-z0-9]+$/i.test(reportedMediaId)
    && Boolean(directUrl)
    && MEDIA_RULES?.providerSiteForUrl?.(reportedCanonicalUrl) === provider;
  if (!canonicalMatches && !directHomepageFallback) return;
  let context = {
    provider,
    mediaId: canonicalMatches ? canonicalPage.mediaId : reportedMediaId,
    canonicalUrl: canonicalMatches ? canonicalPage.normalizedUrl : reportedCanonicalUrl,
    title: String(payload.title || (provider === 'douyin' ? '抖音视频' : 'TikTok video')).trim().slice(0, 300),
    thumbnailUrl: safeActiveMediaUrl(payload.thumbnailUrl, 8192),
    directUrl,
    width: safePositiveInteger(payload.width),
    height: safePositiveInteger(payload.height),
    resolution: safePositiveInteger(payload.resolution),
    qualityLabel: String(payload.qualityLabel || '').slice(0, 80),
    sizeBytes: safePositiveInteger(payload.sizeBytes),
    variants,
  };
  context = enrichActiveMediaContextFromNetwork(tab, context);
  const extractionKey = `${context.provider}:${context.mediaId}`;
  const activeChanged = tab.activeMediaExtractionKey !== extractionKey;
  tab.activeMediaContext = context;
  const placeholder = activeMediaPlaceholder(tab, context);
  const currentMatching = mediaCandidatesForTab(tab.id).filter((candidate) => candidateMatchesActiveMedia(candidate, context));
  setMediaCandidatesForTab(tab.id, context.directUrl
    ? [placeholder]
    : (currentMatching.length ? currentMatching.map((candidate) => ({
      ...candidate,
      title: context.title || candidate.title,
      thumbnailUrl: context.thumbnailUrl || candidate.thumbnailUrl,
    })) : [placeholder]));
  if (tab.id === state.activeTabId) renderCandidates();
  if (activeChanged) {
    tab.activeMediaExtractionKey = extractionKey;
    tab.mediaEnrichmentSequence += 1;
  }
  if (context.directUrl) return;
  if (!activeChanged) return;
  const sequence = tab.mediaEnrichmentSequence;
  const webContentsId = Number(tab.webContentsId);
  if (!Number.isFinite(webContentsId) || webContentsId <= 0) return;
  void (async () => {
    await window.mediaDeck.clearMediaCandidates(webContentsId).catch(() => []);
    try {
      const candidates = await window.mediaDeck.extractPageMedia({
        pageUrl: context.canonicalUrl,
        webContentsId,
        force: true,
      });
      if (sequence !== tab.mediaEnrichmentSequence || tab.activeMediaExtractionKey !== extractionKey) return;
      const matching = (Array.isArray(candidates) ? candidates : [])
        .filter((candidate) => candidateMatchesActiveMedia(candidate, context))
        .map((candidate) => ({
          ...candidate,
          title: candidate.title || context.title,
          thumbnailUrl: candidate.thumbnailUrl || context.thumbnailUrl,
        }));
      setMediaCandidatesForTab(tab.id, matching.length ? matching : [placeholder]);
      if (tab.id === state.activeTabId) renderCandidates();
    } catch {
      // The canonical page URL remains directly downloadable even when metadata
      // analysis is unavailable, so retain the single active-video row.
    }
  })();
}

function handleXiaohongshuMediaContext(tab, payload) {
  const provider = tabProvider(tab);
  if (!tab || provider !== 'xiaohongshu' || payload?.provider !== provider) return;
  if (payload?.cleared) {
    clearMediaCandidatesForTab(tab.id);
    if (tab.id === state.activeTabId) renderCandidates();
    return;
  }
  const canonicalUrl = safeActiveMediaUrl(payload?.canonicalUrl) || tab.url;
  const page = MEDIA_RULES?.classifyMediaPage?.(canonicalUrl);
  const mediaId = String(payload?.mediaId || '');
  if (page?.provider !== provider || page?.mediaId !== mediaId) return;
  const variants = (Array.isArray(payload?.variants) ? payload.variants : [])
    .map((variant) => safeActiveMediaVariant(variant, provider))
    .filter(Boolean)
    .filter((variant, index, all) => all.findIndex((other) => other.url === variant.url) === index)
    .slice(0, 12);
  const directUrl = safeActiveMediaUrl(payload?.directUrl) || variants[0]?.url || null;
  const images = (Array.isArray(payload?.images) ? payload.images : [])
    .map((image, index) => {
      const url = safeActiveMediaUrl(image?.url);
      if (!url) return null;
      const requestedExtension = String(image?.extension || '').toLowerCase();
      return {
        id: String(image?.id || `image-${index + 1}`).slice(0, 100),
        assetType: 'image',
        assetRole: 'gallery',
        extension: ['jpg', 'jpeg', 'png', 'webp', 'avif'].includes(requestedExtension)
          ? (requestedExtension === 'jpeg' ? 'jpg' : requestedExtension)
          : 'jpg',
        url,
        width: safePositiveInteger(image?.width),
        height: safePositiveInteger(image?.height),
        name: String(image?.name || text('imageNumber', { index: index + 1 })).slice(0, 80),
      };
    })
    .filter(Boolean)
    .filter((image, index, all) => all.findIndex((other) => other.url === image.url) === index)
    .slice(0, 30);
  if (!directUrl && !images.length) return;
  const thumbnailUrl = images[0]?.url || safeActiveMediaUrl(payload?.thumbnailUrl, 8192);
  const isVideo = Boolean(directUrl);
  const title = String(payload?.title || tab.title || '小红书笔记').replace(/\s+/g, ' ').trim().slice(0, 300);
  const candidate = {
    id: `xiaohongshu-${mediaId}`,
    webContentsId: tab.webContentsId,
    url: directUrl || page.normalizedUrl,
    pageUrl: page.normalizedUrl,
    provider,
    mediaId,
    fileName: title,
    title,
    kind: isVideo ? 'video' : 'image',
    thumbnailUrl,
    extension: isVideo ? 'mp4' : (images[0]?.extension || 'jpg'),
    width: safePositiveInteger(payload?.width),
    height: safePositiveInteger(payload?.height),
    resolution: isVideo ? safePositiveInteger(payload?.resolution) : null,
    variants,
    hasAudio: isVideo,
    hasVideo: isVideo,
    assets: {
      audio: isVideo ? [{ id: 'audio-mp3', assetType: 'audio', assetRole: 'derived', extension: 'mp3', generated: true }] : [],
      images: images.length ? images : (thumbnailUrl ? [{ id: 'cover', assetType: 'image', assetRole: 'cover', extension: 'jpg', url: thumbnailUrl }] : []),
      subtitles: [],
    },
    isRecommended: true,
    downloadStrategy: isVideo ? 'direct' : 'asset-list',
    sourceClient: isVideo ? 'xiaohongshu-page' : 'xiaohongshu-dom',
    metadataSource: 'xiaohongshu-page',
    detectedAt: new Date().toISOString(),
  };
  setMediaCandidatesForTab(tab.id, [candidate]);
  if (tab.id === state.activeTabId) renderCandidates();
}

function enrichActiveMediaContextFromNetwork(tab, context) {
  if (!tab || !context || context.directUrl) return context;
  const selected = (tab.activeMediaNetworkCandidates || [])
    .filter((candidate) => candidate?.kind === 'video' && (
      candidateMatchesActiveMedia(candidate, context)
      || (context.provider === 'tiktok' && MEDIA_RULES?.providerSiteForUrl?.(candidate.pageUrl) === 'tiktok')
    ))
    .sort((left, right) => Number(right.size || right.sizeBytes || 0) - Number(left.size || left.sizeBytes || 0))[0];
  const directUrl = safeActiveMediaUrl(selected?.url);
  if (!directUrl) return context;
  const variant = safeActiveMediaVariant({
    ...selected,
    sizeBytes: selected.sizeBytes || selected.size,
    qualityLabel: selected.qualityLabel || (selected.resolution ? `${selected.resolution}p` : ''),
  }, context.provider);
  return {
    ...context,
    directUrl,
    sizeBytes: safePositiveInteger(selected.sizeBytes || selected.size) || context.sizeBytes,
    variants: variant ? [variant, ...(context.variants || []).filter((item) => item.url !== variant.url)] : context.variants,
  };
}

function refreshActiveMediaFromNetwork(tab) {
  if (!tab?.activeMediaContext || tab.activeMediaContext.directUrl) return;
  const enriched = enrichActiveMediaContextFromNetwork(tab, tab.activeMediaContext);
  if (!enriched.directUrl) return;
  tab.activeMediaContext = enriched;
  setMediaCandidatesForTab(tab.id, [activeMediaPlaceholder(tab, enriched)]);
  if (tab.id === state.activeTabId) renderCandidates();
}

function handleMediaCollection(tab, payload) {
  if (!tab || !state.tabs.includes(tab)) return;
  const provider = tabProvider(tab) || String(payload?.provider || '');
  if (!provider || payload?.provider !== provider) return;
  const pageOrigin = (() => {
    try { return new URL(tab.url).origin; } catch { return ''; }
  })();
  const entries = (Array.isArray(payload?.entries) ? payload.entries : []).map((entry, index) => {
    const canonicalUrl = safeActiveMediaUrl(entry?.canonicalUrl);
    if (!canonicalUrl) return null;
    try {
      if (new URL(canonicalUrl).origin !== pageOrigin) return null;
    } catch {
      return null;
    }
    return {
      id: `collection-${tab.id}-${index}-${String(entry?.id || '').replace(/[^a-z0-9_-]/gi, '').slice(0, 50)}`,
      webContentsId: tab.webContentsId,
      url: canonicalUrl,
      pageUrl: canonicalUrl,
      provider,
      title: String(entry?.title || `${provider} ${index + 1}`).replace(/\s+/g, ' ').trim().slice(0, 300),
      fileName: String(entry?.title || '').replace(/\s+/g, ' ').trim().slice(0, 300),
      thumbnailUrl: safeActiveMediaUrl(entry?.thumbnailUrl, 8192),
      kind: 'video',
      extension: 'mp4',
      hasAudio: true,
      hasVideo: true,
      isRecommended: false,
      downloadStrategy: 'merge',
      sourceClient: 'collection-page',
      metadataSource: `${provider}-collection`,
      detectedAt: new Date().toISOString(),
    };
  }).filter(Boolean).filter((entry, index, all) => all.findIndex((other) => other.url === entry.url) === index).slice(0, 50);
  state.mediaCollectionsByTabId[tab.id] = entries.length >= 2 ? entries : [];
  const validIds = new Set(state.mediaCollectionsByTabId[tab.id].map((entry) => entry.id));
  state.selectedBatchCandidateIdsByTabId[tab.id] = (state.selectedBatchCandidateIdsByTabId[tab.id] || [])
    .filter((id) => validIds.has(id));
  if (entries.length < 2) state.mediaModeByTabId[tab.id] = 'current';
  else if (!state.mediaModeByTabId[tab.id]) {
    state.mediaModeByTabId[tab.id] = mediaCandidatesForTab(tab.id).length ? 'current' : 'batch';
  }
  if (tab.id === state.activeTabId) renderCandidates();
}

function handleStockMediaContext(tab, payload) {
  if (!tab || !state.tabs.includes(tab) || payload?.cleared) return;
  const provider = tabProvider(tab);
  if (!provider || payload?.provider !== provider) return;
  const canonicalUrl = safeActiveMediaUrl(payload?.canonicalUrl);
  if (!canonicalUrl) return;
  const variants = (Array.isArray(payload?.variants) ? payload.variants : [])
    .map((variant) => safeActiveMediaVariant(variant, provider))
    .filter(Boolean)
    .filter((variant, index, all) => all.findIndex((other) => other.url === variant.url) === index)
    .slice(0, 12);
  const context = {
    provider,
    mediaId: String(payload?.mediaId || canonicalUrl).slice(0, 300),
    canonicalUrl,
    title: String(payload?.title || `${provider} video`).replace(/\s+/g, ' ').trim().slice(0, 300),
    thumbnailUrl: safeActiveMediaUrl(payload?.thumbnailUrl, 8192),
    directUrl: safeActiveMediaUrl(payload?.directUrl) || variants[0]?.url || null,
    width: safePositiveInteger(payload?.width),
    height: safePositiveInteger(payload?.height),
    resolution: safePositiveInteger(payload?.resolution),
    qualityLabel: String(payload?.qualityLabel || '').slice(0, 80),
    sizeBytes: safePositiveInteger(payload?.sizeBytes),
    variants,
  };
  const candidate = activeMediaPlaceholder(tab, context);
  candidate.sourceClient = `${provider}-page`;
  candidate.pageUrl = canonicalUrl;
  tab.recentStockMediaCandidate = { ...candidate, capturedAt: Date.now() };
  setMediaCandidatesForTab(tab.id, [candidate]);
  if (tab.id === state.activeTabId) renderCandidates();
}

function handleSiteDownloadMetadata(tab, payload) {
  const provider = String(payload?.provider || '');
  if (!tab || !provider || provider !== tabProvider(tab)) return;
  tab.pendingNativeDownloadMetadata = {
    provider,
    pageUrl: safeActiveMediaUrl(payload?.pageUrl) || tab.url,
    title: String(payload?.title || tab.title || 'Video').replace(/\s+/g, ' ').trim().slice(0, 300),
    thumbnailUrl: safeActiveMediaUrl(payload?.thumbnailUrl, 8192),
    width: safePositiveInteger(payload?.width),
    height: safePositiveInteger(payload?.height),
    qualityLabel: String(payload?.qualityLabel || '').slice(0, 80),
    capturedAt: Date.now(),
  };
}

function handleSiteDownloadIntent(tab, payload) {
  const url = safeActiveMediaUrl(payload?.url);
  if (!tab || !url || payload?.provider !== tabProvider(tab)) return;
  void startDownload({
    id: `site-download-${Date.now()}`,
    url,
    pageUrl: safeActiveMediaUrl(payload?.pageUrl) || tab.url,
    webContentsId: tab.webContentsId,
    provider: payload.provider,
    title: String(payload?.title || tab.title || 'Video').replace(/\s+/g, ' ').trim().slice(0, 300),
    thumbnailUrl: safeActiveMediaUrl(payload?.thumbnailUrl, 8192),
    width: safePositiveInteger(payload?.width),
    height: safePositiveInteger(payload?.height),
    resolution: Math.min(safePositiveInteger(payload?.width) || 0, safePositiveInteger(payload?.height) || 0) || null,
    qualityLabel: String(payload?.qualityLabel || '').slice(0, 80),
    kind: 'video',
    isRecommended: true,
    sourceClient: 'site-download-intent',
    downloadStrategy: 'direct',
  });
}

function setMediaCandidatesForTab(tabId, candidates) {
  if (!tabId) return;
  const nextCandidates = Array.isArray(candidates)
    ? candidates.slice(0, 80).sort((left, right) => Number(right?.isRecommended === true) - Number(left?.isRecommended === true))
    : [];
  state.candidatesByTabId[tabId] = nextCandidates;
  const selectedId = state.selectedCandidateIdsByTabId[tabId];
  state.selectedCandidateIdsByTabId[tabId] = nextCandidates.some((item) => item.id === selectedId)
    ? selectedId
    : nextCandidates[0]?.id || null;
}

function clearMediaCandidatesForTab(tabId = state.activeTabId) {
  if (!tabId) return;
  const tab = state.tabs.find((item) => item.id === tabId);
  if (tab) tab.activeMediaNetworkCandidates = [];
  state.candidatesByTabId[tabId] = [];
  state.selectedCandidateIdsByTabId[tabId] = null;
  state.expandedCandidateIdsByTabId[tabId] = [];
}

function resetTabMediaForNavigation(tab) {
  if (!tab) return;
  if (tab.mediaEnrichmentTimer) {
    clearTimeout(tab.mediaEnrichmentTimer);
    tab.mediaEnrichmentTimer = 0;
  }
  tab.mediaEnrichmentSequence += 1;
  tab.lastEnrichedUrl = null;
  tab.activeMediaContext = null;
  tab.activeMediaExtractionKey = null;
  tab.activeMediaNetworkCandidates = [];
  state.mediaCollectionsByTabId[tab.id] = [];
  delete state.mediaModeByTabId[tab.id];
  state.selectedBatchCandidateIdsByTabId[tab.id] = [];
  state.selectedMinimumResolutionByTabId[tab.id] = 0;
  clearMediaCandidatesForTab(tab.id);
  if (tab.id === state.activeTabId) renderCandidates();
  const webContentsId = Number(tab.webContentsId);
  if (Number.isFinite(webContentsId) && webContentsId > 0) {
    void window.mediaDeck.clearMediaCandidates(webContentsId).catch(() => []);
  }
}

function candidateMatchesTabPage(candidate, tab) {
  if (isSingleActiveMediaTab(tab)) return candidateMatchesActiveMedia(candidate, tab.activeMediaContext);
  if (tabProvider(tab) === 'agedm') return true;
  if (!tab || !candidate?.pageUrl) return true;
  const candidateUrl = MEDIA_RULES?.normalizePageUrl?.(candidate.pageUrl) || candidate.pageUrl;
  const tabUrl = MEDIA_RULES?.normalizePageUrl?.(tab.url) || tab.url;
  return !candidateUrl || !tabUrl || candidateUrl === tabUrl;
}

function getFaviconUrl(url) {
  try {
    return `${new URL(url).origin}/favicon.ico`;
  } catch {
    return '';
  }
}

function favoriteSiteIconMarkup(item) {
  const known = siteIcon(item.url);
  const iconUrl = known.icon || getFaviconUrl(item.url);
  if (!iconUrl) return `<span class="favorite-site-icon is-fallback">${iconSvg('star')}</span>`;
  return `<span class="favorite-site-icon"><img src="${escapeHtml(iconUrl)}" alt="${escapeHtml(item.title || '')}" loading="lazy" /></span>`;
}

function bindFaviconFallbacks(root) {
  root.querySelectorAll('.favorite-site-icon img').forEach((image) => {
    image.addEventListener('error', () => {
      const wrapper = image.parentElement;
      if (!wrapper) return;
      wrapper.classList.add('is-fallback');
      wrapper.innerHTML = iconSvg('star');
    }, { once: true });
  });
}

function addCandidate(candidate) {
  if (!candidate?.url) return;
  const tabId = mediaTabIdForCandidate(candidate);
  if (!tabId) return;
  const tab = state.tabs.find((item) => item.id === tabId);
  if (candidate.hiddenForActiveMedia === true) {
    const retained = tab?.activeMediaNetworkCandidates || [];
    if (tab) {
      tab.activeMediaNetworkCandidates = [
        candidate,
        ...retained.filter((item) => item.url !== candidate.url),
      ].slice(0, 20);
      refreshActiveMediaFromNetwork(tab);
    }
    return;
  }
  if (isSingleActiveMediaTab(tab) && !candidateMatchesActiveMedia(candidate, tab.activeMediaContext)) return;
  if (!candidateMatchesTabPage(candidate, tab)) return;
  const stockProvider = tabProvider(tab);
  const structuredStock = tab?.recentStockMediaCandidate;
  if (['pixabay', 'pexels', 'mixkit', 'coverr', 'videvo', 'videezy'].includes(stockProvider)
    && structuredStock?.provider === stockProvider
    && Date.now() - Number(structuredStock.capturedAt || 0) <= 120_000) {
    const variants = candidateVariants(structuredStock).map((variant) => variant.url === candidate.url ? {
      ...variant,
      sizeBytes: safePositiveInteger(candidate.sizeBytes || candidate.size) || variant.sizeBytes,
      mimeType: candidate.mimeType || candidate.mime || variant.mimeType,
    } : variant);
    const enriched = {
      ...structuredStock,
      sizeBytes: candidate.url === structuredStock.url
        ? safePositiveInteger(candidate.sizeBytes || candidate.size) || structuredStock.sizeBytes
        : structuredStock.sizeBytes,
      variants,
    };
    tab.recentStockMediaCandidate = enriched;
    setMediaCandidatesForTab(tabId, [enriched]);
    if (tabId === state.activeTabId) renderCandidates();
    return;
  }
  const current = mediaCandidatesForTab(tabId);
  setMediaCandidatesForTab(tabId, [candidate, ...current.filter((item) => item.url !== candidate.url)]);
  if (tabId === state.activeTabId) renderCandidates();
}

function isSupportedMetadataPage(rawUrl) {
  return MEDIA_RULES?.isSupportedMetadataPage(rawUrl) === true;
}

function getYouTubeVideoId(rawUrl) {
  try {
    const parsed = new URL(String(rawUrl || '').trim());
    const host = parsed.hostname.toLowerCase().replace(/^www\./, '');
    if (host === 'youtu.be') return parsed.pathname.split('/').filter(Boolean)[0] || null;
    if (host !== 'youtube.com' && !host.endsWith('.youtube.com')) return null;
    if (parsed.pathname.startsWith('/shorts/')) return parsed.pathname.split('/').filter(Boolean)[1] || null;
    return parsed.searchParams.get('v');
  } catch {
    return null;
  }
}

function normalizeYouTubeTitle(value) {
  const title = String(value || '').replace(/\s*-\s*YouTube\s*$/i, '').replace(/^[-\s]+|[-\s]+$/g, '').trim();
  return title && !/^youtube$/i.test(title) ? title : null;
}

function createYouTubeSnapshotScript(expectedVideoId) {
  return `
    (() => new Promise((resolve) => {
      const expectedVideoId = ${JSON.stringify(expectedVideoId)};
      const collectorKey = Symbol.for('vidogo.youtube-player-response-collector');
      let collector = globalThis[collectorKey];
      if (!collector) {
        const responsesByVideoId = new Map();
        const parseResponse = (value) => {
          if (typeof value !== 'string') return value;
          try { return JSON.parse(value); } catch { return null; }
        };
        const rememberResponse = (value) => {
          const response = parseResponse(value);
          const videoId = response?.videoDetails?.videoId;
          if (!videoId) return;
          responsesByVideoId.delete(videoId);
          responsesByVideoId.set(videoId, response);
          while (responsesByVideoId.size > 12) responsesByVideoId.delete(responsesByVideoId.keys().next().value);
        };
        const collect = () => {
          rememberResponse(globalThis.ytInitialPlayerResponse);
          rememberResponse(globalThis.ytplayer?.config?.args?.raw_player_response);
          rememberResponse(globalThis.ytplayer?.config?.args?.player_response);
          const players = new Set(document.querySelectorAll('#movie_player, #shorts-player, .html5-video-player'));
          for (const player of players) {
            if (typeof player.getPlayerResponse !== 'function') continue;
            try { rememberResponse(player.getPlayerResponse()); } catch {}
          }
        };
        collector = {
          collect,
          get(videoId) { collect(); return responsesByVideoId.get(videoId) || null; }
        };
        globalThis[collectorKey] = collector;
        for (const eventName of ['yt-navigate-finish', 'yt-page-data-updated', 'yt-player-updated']) {
          document.addEventListener(eventName, collect);
        }
        collect();
      }
      let pollTimer = 0;
      let timeoutTimer = 0;
      let settled = false;
      const copySnapshot = () => {
        const response = collector.get(expectedVideoId);
        const basicVideo = document.querySelector('video');
        const metadataHeight = Number(document.querySelector('meta[itemprop="height"]')?.content) || 0;
        const basicPage = {
          title: String(document.title || '').replace(/\s*-\s*YouTube\s*$/i, '').replace(/^[-\s]+|[-\s]+$/g, '').trim(),
          videoHeight: Number(basicVideo?.videoHeight) || metadataHeight,
          videoWidth: Number(basicVideo?.videoWidth) || 0
        };
        let playerFallback = null;
        const player = document.querySelector('#movie_player, #shorts-player, .html5-video-player');
        if (player && typeof player.getVideoData === 'function') {
          try {
            const videoData = player.getVideoData();
            const qualityLevels = typeof player.getAvailableQualityLevels === 'function'
              ? player.getAvailableQualityLevels()
              : [];
            if (videoData?.video_id === expectedVideoId) {
              playerFallback = {
                durationSeconds: typeof player.getDuration === 'function' ? player.getDuration() : null,
                qualityLevels: Array.isArray(qualityLevels) ? qualityLevels : [],
                title: videoData.title,
                videoId: videoData.video_id
              };
            }
          } catch {}
        }
        if (!response && !playerFallback && !basicPage.title) return null;
        const copyFormat = (format) => ({
          approxDurationMs: format.approxDurationMs,
          bitrate: format.bitrate,
          contentLength: format.contentLength,
          fps: format.fps,
          height: format.height,
          itag: format.itag,
          mimeType: format.mimeType,
          width: format.width
        });
        const responseFormats = [
          ...(Array.isArray(response?.streamingData?.formats) ? response.streamingData.formats : []),
          ...(Array.isArray(response?.streamingData?.adaptiveFormats) ? response.streamingData.adaptiveFormats : [])
        ];
        const broadcast = response?.microformat?.playerMicroformatRenderer?.liveBroadcastDetails;
        const playabilityStatus = String(response?.playabilityStatus?.status || '').toUpperCase();
        const liveStatus = broadcast?.isLiveNow === true
          ? 'is-live'
          : (broadcast?.endTimestamp && responseFormats.length > 0
            ? 'not-live'
            : (response?.videoDetails?.isLiveContent === true
              ? (responseFormats.length > 0 ? 'is-live' : (playabilityStatus === 'LIVE_STREAM_OFFLINE' || broadcast?.startTimestamp ? 'is-upcoming' : 'post-live'))
              : (playabilityStatus === 'OK' || responseFormats.length > 0 ? 'not-live' : 'unavailable')));
        return {
          liveStatus,
          streamingData: {
            formats: Array.isArray(response?.streamingData?.formats) ? response.streamingData.formats.map(copyFormat) : [],
            adaptiveFormats: Array.isArray(response?.streamingData?.adaptiveFormats) ? response.streamingData.adaptiveFormats.map(copyFormat) : []
          },
          basicPage,
          playerFallback,
          videoDetails: response?.videoDetails ? {
            isLiveContent: response.videoDetails.isLiveContent,
            lengthSeconds: response.videoDetails.lengthSeconds,
            thumbnail: response.videoDetails.thumbnail ? {
              thumbnails: Array.isArray(response.videoDetails.thumbnail.thumbnails)
                ? response.videoDetails.thumbnail.thumbnails.map((thumbnail) => ({ url: thumbnail.url }))
                : []
            } : null,
            title: response.videoDetails.title,
            videoId: response.videoDetails.videoId
          } : playerFallback ? {
            isLiveContent: false,
            lengthSeconds: playerFallback.durationSeconds,
            thumbnail: null,
            title: playerFallback.title,
            videoId: playerFallback.videoId
          } : {
            isLiveContent: false,
            lengthSeconds: null,
            thumbnail: null,
            title: basicPage.title,
            videoId: expectedVideoId
          }
        };
      };
      const cleanup = () => { clearInterval(pollTimer); clearTimeout(timeoutTimer); };
      const check = () => {
        if (settled) return;
        const snapshot = copySnapshot();
        if (!snapshot) return;
        settled = true;
        cleanup();
        resolve(snapshot);
      };
      pollTimer = setInterval(check, 25);
      timeoutTimer = setTimeout(() => {
        if (settled) return;
        settled = true;
        cleanup();
        resolve(null);
      }, 1500);
      check();
    }))()
  `;
}

function isYouTubeVideoCodec(codec) {
  return /^(?:av01|av1|vp0?9|vp9|avc1|avc3|h264|hev1|hvc1|hevc|h265)/i.test(String(codec || ''));
}

function youtubeVideoCodecLabel(codec) {
  const normalized = String(codec || '').toLowerCase();
  if (/^(?:av01|av1)/.test(normalized)) return 'AV1';
  if (/^(?:vp0?9|vp9)/.test(normalized)) return 'VP9';
  if (/^(?:avc1|avc3|h264)/.test(normalized)) return 'H.264';
  if (/^(?:hev1|hvc1|hevc|h265)/.test(normalized)) return 'H.265';
  return String(codec || '').split('.')[0].toUpperCase() || null;
}

function youtubeAudioCodecLabel(codec) {
  const normalized = String(codec || '').toLowerCase();
  if (/^(?:mp4a|aac)/.test(normalized)) return 'AAC';
  if (normalized.includes('opus')) return 'Opus';
  if (normalized.includes('vorbis')) return 'Vorbis';
  return String(codec || '').split('.')[0].toUpperCase() || null;
}

function parseYouTubePlayerFormat(value) {
  const formatId = Number(value?.itag) > 0 ? String(Math.round(Number(value.itag))) : null;
  const mimeMatch = String(value?.mimeType || '').match(/^([^/]+)\/([^;\s]+)(?:;\s*codecs="([^"]+)")?/i);
  if (!formatId || !mimeMatch) return null;
  const kind = mimeMatch[1].toLowerCase();
  const codecs = String(mimeMatch[3] || '').split(',').map((codec) => codec.trim()).filter(Boolean);
  const videoCodec = codecs.find(isYouTubeVideoCodec) || null;
  const audioCodec = codecs.find((codec) => !isYouTubeVideoCodec(codec)) || null;
  const bitrate = Number(value.bitrate);
  const contentLength = Number(value.contentLength);
  return {
    format_id: formatId,
    ext: mimeMatch[2].toLowerCase(),
    width: Number(value.width) || null,
    height: Number(value.height) || null,
    fps: Number(value.fps) || null,
    tbr: Number.isFinite(bitrate) && bitrate > 0 ? bitrate / 1000 : null,
    abr: kind === 'audio' && Number.isFinite(bitrate) && bitrate > 0 ? bitrate / 1000 : null,
    filesize: Number.isFinite(contentLength) && contentLength > 0 ? contentLength : null,
    vcodec: kind === 'video' ? videoCodec || 'unknown' : 'none',
    acodec: kind === 'audio' ? audioCodec || 'unknown' : audioCodec || 'none',
  };
}

function planYouTubeDomFormats(formats, durationSeconds) {
  const audioFormats = formats.filter((format) => format.vcodec === 'none' && format.acodec !== 'none');
  const selectedVideos = new Map();
  formats.forEach((format, index) => {
    if (!format.format_id || format.vcodec === 'none' || format.vcodec === 'unknown') return;
    const width = Number(format.width);
    const height = Number(format.height);
    if (!(width > 0 && height > 0)) return;
    const resolution = Math.min(width, height);
    const videoCodec = youtubeVideoCodecLabel(format.vcodec);
    if (!videoCodec) return;
    const key = `${resolution}:${videoCodec}`;
    const rank = [-(Number(format.fps) || 0), -(Number(format.tbr) || 0), -index];
    const existing = selectedVideos.get(key);
    let rankComparison = 0;
    if (existing) {
      for (let part = 0; part < rank.length; part += 1) {
        if (rank[part] === existing.rank[part]) continue;
        rankComparison = rank[part] - existing.rank[part];
        break;
      }
    }
    const isBetter = !existing || rankComparison < 0;
    if (isBetter) {
      selectedVideos.set(key, { format, index, rank, resolution, videoCodec });
    }
  });
  const plans = [];
  for (const video of selectedVideos.values()) {
    const format = video.format;
    const extension = ['mp4', 'm4v', 'mov'].includes(format.ext) ? 'mp4' : format.ext === 'webm' ? 'webm' : null;
    if (!extension) continue;
    const hasAudio = format.acodec && !['none', 'unknown'].includes(format.acodec);
    const compatibleAudio = audioFormats
      .filter((audio) => extension === 'mp4'
        ? ['m4a', 'mp4', 'aac'].includes(audio.ext) || /^(?:mp4a|aac)/i.test(audio.acodec)
        : audio.ext === 'webm' || /(?:opus|vorbis)/i.test(audio.acodec))
      .sort((left, right) => (Number(right.abr || right.tbr) || 0) - (Number(left.abr || left.tbr) || 0))[0] || null;
    if (!hasAudio && !compatibleAudio?.format_id) continue;
    const estimateSize = (item, audio) => {
      if (Number(item?.filesize) > 0) return Number(item.filesize);
      const bitrate = Number(audio ? item?.abr || item?.tbr : item?.tbr);
      return durationSeconds > 0 && bitrate > 0 ? Math.round(durationSeconds * bitrate * 1000 / 8) : null;
    };
    const videoSize = estimateSize(format, false);
    const audioSize = compatibleAudio ? estimateSize(compatibleAudio, true) : 0;
    const audioFilter = compatibleAudio?.ext ? `[ext=${compatibleAudio.ext}]` : '';
    const selector = compatibleAudio
      ? `${format.format_id}+${compatibleAudio.format_id}/bv*[ext=${extension}][width=${format.width}][height=${format.height}]+ba${audioFilter}`
      : format.format_id;
    plans.push({
      formatSelector: selector,
      extension,
      width: Number(format.width),
      height: Number(format.height),
      resolution: video.resolution,
      videoCodec: video.videoCodec,
      audioCodec: youtubeAudioCodecLabel(compatibleAudio?.acodec || format.acodec),
      fps: Number(format.fps) || null,
      totalSizeBytes: videoSize !== null && audioSize !== null ? videoSize + audioSize : null,
    });
  }
  const codecRanks = { AV1: 4, VP9: 3, 'H.265': 2, 'H.264': 1 };
  return plans.sort((left, right) => right.resolution - left.resolution
    || (codecRanks[right.videoCodec] || 0) - (codecRanks[left.videoCodec] || 0)
    || (right.totalSizeBytes || 0) - (left.totalSizeBytes || 0));
}

function planYouTubeQualityFallback(qualityLevels, visibleHeight = 0) {
  const resolutionsByLevel = {
    highres: 2160,
    hd2160: 2160,
    hd1440: 1440,
    hd1080: 1080,
    hd720: 720,
    large: 480,
    medium: 360,
    small: 240,
    tiny: 144,
  };
  const suppliedResolutions = (Array.isArray(qualityLevels) ? qualityLevels : [])
    .map((level) => resolutionsByLevel[level])
    .filter(Boolean);
  const decodedHeight = Number(visibleHeight) > 0 ? Math.round(Number(visibleHeight)) : 0;
  const safeFallbacks = decodedHeight > 0
    ? [decodedHeight, 2160, 1440, 1080, 720, 480, 360, 240, 144].filter((resolution) => resolution <= decodedHeight)
    : [1080, 720, 480, 360, 240];
  const resolutions = [...new Set([...suppliedResolutions, ...safeFallbacks])].sort((left, right) => right - left);
  return resolutions.map((resolution) => ({
    formatSelector: `bestvideo[height<=${resolution}]+bestaudio/best[height<=${resolution}]/best`,
    extension: 'mp4',
    width: null,
    height: resolution,
    resolution,
    qualityLabel: `${decodedHeight > 0 || suppliedResolutions.length > 0 ? '' : '≤'}${resolution}p`,
    videoCodec: null,
    audioCodec: null,
    fps: null,
    totalSizeBytes: null,
  }));
}

function stableTextHash(value) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

async function extractYouTubeDomCandidate(tab, pageUrl) {
  const videoId = getYouTubeVideoId(pageUrl);
  if (!videoId) {
    tab.mediaEnrichmentDiagnostic = { stage: 'video-id-missing', pageUrl };
    return null;
  }
  let snapshot = null;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      snapshot = await Promise.race([
        tab.webview.executeJavaScript(createYouTubeSnapshotScript(videoId), true),
        new Promise((resolve) => window.setTimeout(() => resolve(null), 4000)),
      ]);
    } catch (error) {
      tab.mediaEnrichmentDiagnostic = { stage: 'snapshot-error', attempt, message: error?.message || String(error) };
    }
    const rawFormatCount = (snapshot?.streamingData?.formats?.length || 0)
      + (snapshot?.streamingData?.adaptiveFormats?.length || 0);
    const qualityLevelCount = snapshot?.playerFallback?.qualityLevels?.length || 0;
    const visibleVideoHeight = Number(snapshot?.basicPage?.videoHeight) || 0;
    tab.mediaEnrichmentDiagnostic = {
      stage: snapshot ? 'snapshot-read' : 'snapshot-missing',
      attempt,
      videoId,
      snapshotVideoId: snapshot?.videoDetails?.videoId || null,
      rawFormatCount,
      qualityLevelCount,
      visibleVideoHeight,
    };
    if (snapshot?.videoDetails?.videoId === videoId && (rawFormatCount > 0 || qualityLevelCount > 0 || visibleVideoHeight > 0)) break;
    if (attempt < 3) await new Promise((resolve) => window.setTimeout(resolve, 900));
  }
  if (!snapshot?.videoDetails || snapshot.videoDetails.videoId !== videoId) return null;
  if (snapshot.liveStatus && snapshot.liveStatus !== 'not-live') {
    const title = normalizeYouTubeTitle(snapshot.videoDetails.title) || normalizeYouTubeTitle(tab.title) || 'YouTube Live';
    const thumbnails = snapshot.videoDetails.thumbnail?.thumbnails || [];
    return {
      id: `media-${tab.webContentsId}-${stableTextHash(`youtube:${videoId}`)}`,
      mediaId: videoId,
      webContentsId: tab.webContentsId,
      url: pageUrl,
      pageUrl,
      fileName: title.replace(/[<>:"/\\|?*]/g, '_').slice(0, 180),
      title,
      kind: 'video',
      thumbnailUrl: thumbnails.at(-1)?.url || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      variants: [],
      hasAudio: true,
      hasVideo: true,
      isLive: snapshot.liveStatus === 'is-live' || snapshot.liveStatus === 'is-upcoming',
      isRecommended: true,
      downloadStrategy: 'record',
      sourceClient: 'youtube-dom',
      metadataSource: 'youtube-dom-live',
      detectedAt: new Date().toISOString(),
    };
  }
  const rawFormats = [
    ...(Array.isArray(snapshot.streamingData?.formats) ? snapshot.streamingData.formats : []),
    ...(Array.isArray(snapshot.streamingData?.adaptiveFormats) ? snapshot.streamingData.adaptiveFormats : []),
  ];
  const formats = rawFormats.map(parseYouTubePlayerFormat).filter(Boolean);
  const durationSeconds = Number(snapshot.videoDetails.lengthSeconds)
    || Number(rawFormats[0]?.approxDurationMs) / 1000
    || null;
  const exactPlans = planYouTubeDomFormats(formats, durationSeconds);
  const plans = exactPlans.length > 0
    ? exactPlans
    : planYouTubeQualityFallback(snapshot.playerFallback?.qualityLevels, snapshot.basicPage?.videoHeight);
  tab.mediaEnrichmentDiagnostic = {
    ...tab.mediaEnrichmentDiagnostic,
    stage: plans.length ? 'candidate-ready' : 'planning-empty',
    parsedFormatCount: formats.length,
    planCount: plans.length,
    planSource: exactPlans.length > 0 ? 'player-response' : 'quality-levels',
  };
  if (!plans.length) return null;
  const title = normalizeYouTubeTitle(snapshot.videoDetails.title) || normalizeYouTubeTitle(tab.title);
  if (!title) return null;
  const thumbnails = snapshot.videoDetails.thumbnail?.thumbnails || [];
  const variants = plans.slice(0, 20).map((plan) => ({
    url: pageUrl,
    formatId: plan.formatSelector,
    mimeType: `video/${plan.extension}`,
    extension: plan.extension,
    qualityLabel: plan.qualityLabel || `${plan.resolution}p${plan.videoCodec ? ` · ${plan.videoCodec}` : ''}`,
    width: plan.width,
    height: plan.height,
    resolution: plan.resolution,
    videoCodec: plan.videoCodec,
    audioCodec: plan.audioCodec,
    fps: plan.fps,
    hasAudio: true,
    hasVideo: true,
    sourceClient: 'yt-dlp',
    sizeBytes: plan.totalSizeBytes,
    isDrmProtected: false,
  }));
  const primary = variants[0];
  return {
    id: `media-${tab.webContentsId}-${stableTextHash(`youtube:${videoId}`)}`,
    mediaId: videoId,
    webContentsId: tab.webContentsId,
    url: pageUrl,
    pageUrl,
    fileName: title.replace(/[<>:"/\\|?*]/g, '_').slice(0, 180),
    title,
    kind: 'video',
    thumbnailUrl: thumbnails.at(-1)?.url || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
    ...primary,
    variants,
    assets: {
      audio: [{ id: 'audio-mp3', assetType: 'audio', assetRole: 'derived', extension: 'mp3', generated: true }],
      images: [{ id: 'cover', assetType: 'image', assetRole: 'cover', extension: 'jpg', url: thumbnails.at(-1)?.url || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` }],
      subtitles: [],
    },
    isRecommended: true,
    downloadStrategy: 'merge',
    sourceClient: 'yt-dlp',
    metadataSource: exactPlans.length > 0 ? 'youtube-dom' : 'youtube-dom-fallback',
    subtitleDiscoveryPending: true,
    detectedAt: new Date().toISOString(),
  };
}

async function enrichTabMedia(tab, { force = false, reportErrors = false } = {}) {
  const pageUrl = tab?.url;
  if (!tab || !isSupportedMetadataPage(pageUrl)) return [];
  try {
    const webContentsId = Number(tab.webContentsId || tab.webview.getWebContentsId?.());
    if (!Number.isFinite(webContentsId) || webContentsId <= 0) return [];
    tab.webContentsId = webContentsId;
    const existingCandidate = mediaCandidatesForTab(tab.id)
      .find((candidate) => candidate.isRecommended === true && candidate.pageUrl === pageUrl);
    if (!force && tab.lastEnrichedUrl === pageUrl && existingCandidate) return [existingCandidate];
    tab.mediaEnrichmentSequence += 1;
    const sequence = tab.mediaEnrichmentSequence;
    const domCandidate = await extractYouTubeDomCandidate(tab, pageUrl);
    if (sequence !== tab.mediaEnrichmentSequence || tab.url !== pageUrl) return [];
    if (domCandidate) {
      addCandidate(domCandidate);
      tab.lastEnrichedUrl = pageUrl;
      void window.mediaDeck.extractPageMedia({ pageUrl, webContentsId, force })
        .then((candidates) => {
          if (sequence !== tab.mediaEnrichmentSequence || tab.url !== pageUrl) return;
          const metadataCandidate = (Array.isArray(candidates) ? candidates : [])
            .find((candidate) => candidate.mediaId === domCandidate.mediaId || candidate.pageUrl === pageUrl);
          addCandidate({
            ...domCandidate,
            ...(metadataCandidate?.assets ? { assets: metadataCandidate.assets } : {}),
            subtitleDiscoveryPending: false,
          });
        })
        .catch(() => {
          if (sequence === tab.mediaEnrichmentSequence && tab.url === pageUrl) {
            addCandidate({ ...domCandidate, subtitleDiscoveryPending: false });
          }
        });
      return [domCandidate];
    }
    const candidates = await window.mediaDeck.extractPageMedia({ pageUrl, webContentsId, force });
    if (sequence !== tab.mediaEnrichmentSequence || tab.url !== pageUrl) return [];
    for (const candidate of Array.isArray(candidates) ? candidates : []) addCandidate(candidate);
    tab.lastEnrichedUrl = Array.isArray(candidates) && candidates.length > 0 ? pageUrl : null;
    return Array.isArray(candidates) ? candidates : [];
  } catch (error) {
    tab.lastEnrichedUrl = null;
    if (reportErrors) toast(error?.message || String(error));
    return [];
  }
}

function schedulePageMediaEnrichment(tab, force = false) {
  if (!tab) return;
  if (tab.mediaEnrichmentTimer) clearTimeout(tab.mediaEnrichmentTimer);
  tab.mediaEnrichmentTimer = window.setTimeout(() => {
    tab.mediaEnrichmentTimer = 0;
    void enrichTabMedia(tab, { force });
  }, 350);
}

function selectedCandidate() {
  const candidates = mediaCandidatesForTab();
  const selectedId = state.selectedCandidateIdsByTabId[state.activeTabId];
  return candidates.find((item) => item.id === selectedId) || candidates[0] || null;
}

function candidateSize(candidate) {
  return candidate?.sizeBytes ?? candidate?.size ?? null;
}

function candidateKind(candidate) {
  const mime = String(candidate?.mime || candidate?.mimeType || '').toLowerCase();
  if (candidate?.kind) return candidate.kind;
  if (mime.startsWith('audio/')) return 'audio';
  if (candidate?.resourceType === 'playlist' || candidate?.extension === 'm3u8') return 'playlist';
  return 'video';
}

function candidateKindLabel(candidate) {
  const kind = candidateKind(candidate);
  if (kind === 'audio') return text('audioKind');
  if (kind === 'playlist') return text('playlistKind');
  return text('videoKind');
}

function candidateFormat(candidate) {
  return (candidate?.extension || candidate?.mime || candidate?.mimeType || candidate?.resourceType || '').toUpperCase();
}

function candidateResolution(candidate) {
  if (candidate?.qualityLabel) return candidate.qualityLabel;
  if (candidate?.resolution) return `${candidate.resolution}p`;
  if (candidate?.height) return `${candidate.height}p`;
  if (candidate?.width && candidate?.height) return `${candidate.width}x${candidate.height}`;
  return '';
}

function candidateTitle(candidate) {
  return candidate?.title || candidate?.fileName || candidate?.host || candidate?.url || text('noMedia');
}

function candidateIcon(candidate) {
  const kind = candidateKind(candidate);
  if (kind === 'audio') return 'headset';
  if (kind === 'playlist') return 'document';
  return 'video-play';
}

function candidateMetaParts(candidate) {
  return [
    candidateKindLabel(candidate),
    candidateFormat(candidate),
    candidateResolution(candidate),
  ].filter(Boolean);
}

function candidateVariants(candidate) {
  return (Array.isArray(candidate?.variants) ? candidate.variants.filter((variant) => variant?.url) : [])
    .sort((left, right) => {
      const resolutionDifference = candidateVariantResolution(right) - candidateVariantResolution(left);
      if (resolutionDifference !== 0) return resolutionDifference;
      const codecDifference = videoCodecRank(right.videoCodec) - videoCodecRank(left.videoCodec);
      if (codecDifference !== 0) return codecDifference;
      return Number(right.bandwidthBitsPerSecond || right.bitrateKbps || 0)
        - Number(left.bandwidthBitsPerSecond || left.bitrateKbps || 0);
    });
}

function videoCodecRank(codec) {
  const normalized = String(codec || '').toUpperCase();
  if (normalized === 'AV1') return 4;
  if (normalized === 'VP9') return 3;
  if (normalized === 'H.265' || normalized === 'HEVC') return 2;
  if (normalized === 'H.264' || normalized === 'AVC') return 1;
  return 0;
}

function candidateVariantResolution(variant) {
  const resolution = Number(variant?.resolution || variant?.height || 0);
  return Number.isInteger(resolution) && resolution > 0 ? resolution : 0;
}

function mediaResolutionOptions(candidates = mediaCandidatesForTab()) {
  return [...new Set(candidates.flatMap((candidate) => candidateVariants(candidate)
    .map(candidateVariantResolution)
    .filter((resolution) => resolution > 0)))].sort((left, right) => right - left);
}

function selectedMinimumResolution(tabId = state.activeTabId) {
  const value = Number(state.selectedMinimumResolutionByTabId[tabId] || 0);
  return Number.isInteger(value) && value > 0 ? value : 0;
}

function candidateForVariant(candidate, variant, preserveCandidateId = false) {
  return {
    ...candidate,
    ...variant,
    id: preserveCandidateId ? candidate.id : `${candidate.id}:variant:${variant.formatId || candidateVariantResolution(variant) || 'media'}`,
    url: variant.url || candidate.url,
    pageUrl: candidate.pageUrl,
    formatId: variant.formatId || candidate.formatId,
    variants: candidate.variants,
    downloadStrategy: variant.isDrmProtected ? 'unsupported' : candidate.downloadStrategy,
  };
}

function filterCandidateVariantsByResolution(candidate, minimumResolution) {
  if (!minimumResolution || !candidateVariants(candidate).length) return candidate;
  const variants = candidateVariants(candidate)
    .filter((variant) => candidateVariantResolution(variant) >= minimumResolution);
  const primary = variants[0];
  return primary
    ? { ...candidateForVariant(candidate, primary, true), variants }
    : { ...candidate, variants: [] };
}

function filterCandidatesByResolution(candidates, minimumResolution) {
  if (!minimumResolution) return candidates;
  return candidates.flatMap((candidate) => {
    if (!candidateVariants(candidate).length) return [candidate];
    const filtered = filterCandidateVariantsByResolution(candidate, minimumResolution);
    return filtered.variants.length ? [filtered] : [];
  });
}

function candidateMergeOutputFormat(candidate) {
  const extension = String(candidate?.extension || '').toLowerCase();
  return ['mp4', 'webm', 'mkv'].includes(extension) ? extension : 'mp4';
}

function candidateDownloadUrl(candidate, variant = null) {
  if (variant?.url) return variant.url;
  if (candidate?.sourceClient === 'yt-dlp' && candidate?.pageUrl) return candidate.pageUrl;
  return candidate?.url || candidate?.pageUrl || null;
}

function candidateRequiresRecording(candidate) {
  return candidate?.downloadStrategy === 'record' || candidate?.isLive === true;
}

function isCandidateExpanded(candidateId) {
  return (state.expandedCandidateIdsByTabId[state.activeTabId] || []).includes(candidateId);
}

function toggleCandidateExpanded(candidateId) {
  const expanded = new Set(state.expandedCandidateIdsByTabId[state.activeTabId] || []);
  if (expanded.has(candidateId)) expanded.delete(candidateId);
  else expanded.add(candidateId);
  state.expandedCandidateIdsByTabId[state.activeTabId] = [...expanded];
}

function renderCandidateVariant(candidate, variant, index) {
  const merged = { ...candidate, ...variant };
  const size = formatBytes(candidateSize(merged));
  const numericResolution = candidateVariantResolution(variant);
  const resolution = numericResolution > 0 ? `${numericResolution}p` : 'HLS';
  const label = variant.videoCodec ? `${resolution} · ${variant.videoCodec}` : resolution;
  return `
    <div class="sniffer-resource-variant" data-candidate-variant="${escapeHtml(candidate.id)}:${index}">
      <button class="sniffer-resource-variant-download" type="button" data-download-variant="${escapeHtml(candidate.id)}" data-variant-index="${index}">
        <strong><bdi>${escapeHtml(label || `#${index + 1}`)}</bdi></strong>
        <span><bdi>${size === '-' ? '' : escapeHtml(size)}</bdi></span>
      </button>
    </div>
  `;
}

function renderCandidateRow(candidate) {
  const sizeLabel = formatBytes(candidateSize(candidate));
  const hasSize = sizeLabel !== '-';
  const thumbnail = candidate.thumbnailUrl
    ? `<img src="${escapeHtml(candidate.thumbnailUrl)}" alt="${escapeHtml(candidateTitle(candidate))}" loading="lazy" />`
    : iconSvg(candidateIcon(candidate));
  const requiresRecording = candidateRequiresRecording(candidate);
  const variants = requiresRecording ? [] : candidateVariants(candidate);
  const assets = requiresRecording ? [] : candidateAssetOptions(candidate);
  const galleryImages = assets.filter((asset) => asset.assetType === 'image' && asset.assetRole === 'gallery');
  const imageCollection = !requiresRecording && candidate.kind === 'image' && galleryImages.length > 0;
  const hasDownloadOptions = variants.length > 1 || assets.length > 0;
  const expanded = hasDownloadOptions && isCandidateExpanded(candidate.id);
  const variantRows = expanded
    ? `<div class="sniffer-resource-variants">
        ${assets.length ? renderCandidateQuickAssets(candidate, assets) : ''}
        ${variants.length > 1 ? `<div class="sniffer-resource-option-label">${escapeHtml(text('videoQuality'))}</div>${variants.map((variant, index) => renderCandidateVariant(candidate, variant, index)).join('')}` : ''}
      </div>`
    : '';
  return `
    <article class="sniffer-resource-row" data-candidate="${escapeHtml(candidate.id)}">
      <div class="sniffer-resource-main">
        <span class="sniffer-resource-thumbnail${candidate.thumbnailUrl ? ' has-thumbnail' : ''}">${thumbnail}</span>
        <div class="sniffer-resource-content">
          <div class="sniffer-resource-title" title="${escapeHtml(candidateTitle(candidate))}"><bdi>${escapeHtml(candidateTitle(candidate))}</bdi></div>
          <div class="sniffer-resource-meta">
            ${candidateMetaParts(candidate).map((part, index) => index === 0
              ? `<span class="media-kind-badge is-${escapeHtml(candidateKind(candidate))}">${escapeHtml(part)}</span>`
              : `<span><bdi>${escapeHtml(part)}</bdi></span>`).join('')}
          </div>
          <div class="sniffer-resource-footer">
            ${hasSize ? `<span class="sniffer-resource-size"><bdi>${escapeHtml(sizeLabel)}</bdi></span>` : ''}
          </div>
        </div>
      </div>
      <div class="sniffer-resource-download-actions">
        ${requiresRecording
          ? `<button class="sniffer-resource-recording" type="button" data-record-candidate="${escapeHtml(candidate.id)}">${iconSvg('lock')}<span>${text('recordingRequired')}</span></button>`
          : `<button class="sniffer-resource-download${hasDownloadOptions ? ' has-variants' : ''}" type="button" ${imageCollection ? `data-download-all-images="${escapeHtml(candidate.id)}"` : `data-download-candidate="${escapeHtml(candidate.id)}"`}>${iconSvg('download')}<span>${imageCollection ? text('downloadAllImages', { count: galleryImages.length }) : text('downloadVideo')}</span></button>
            ${hasDownloadOptions ? `<button class="sniffer-resource-split-toggle${expanded ? ' is-expanded' : ''}" type="button" data-toggle-candidate-variants="${escapeHtml(candidate.id)}" title="${text(expanded ? 'hideVariants' : 'showVariants')}" aria-label="${text(expanded ? 'hideVariants' : 'showVariants')}" aria-expanded="${expanded}">${iconSvg(expanded ? 'arrow-up' : 'arrow-down')}</button>` : ''}`}
      </div>
      ${variantRows}
    </article>
  `;
}

function candidateAssetOptions(candidate) {
  const assets = candidate?.assets && typeof candidate.assets === 'object' ? candidate.assets : {};
  const options = [];
  if (Array.isArray(assets.audio) && assets.audio.length) {
    options.push({ ...assets.audio[0], label: text('extractMp3'), detail: 'MP3 · 320 kbps' });
  }
  if (Array.isArray(assets.images) && assets.images.length) {
    const gallery = assets.images.filter((asset) => asset?.assetRole === 'gallery');
    if (gallery.length) {
      gallery.slice(0, 30).forEach((asset, index) => options.push({
        ...asset,
        label: asset.name || text('imageNumber', { index: index + 1 }),
        detail: String(asset.extension || 'JPG').toUpperCase(),
      }));
    } else {
      options.push({ ...assets.images[0], label: text('downloadCover'), detail: String(assets.images[0].extension || 'JPG').toUpperCase() });
    }
  }
  for (const subtitle of (Array.isArray(assets.subtitles) ? assets.subtitles : []).slice(0, 8)) {
    options.push({
      ...subtitle,
      label: `${text('downloadSubtitle')} · ${subtitle.name || subtitle.language || ''}`,
      detail: `${String(subtitle.extension || 'VTT').toUpperCase()}${subtitle.automatic ? ` · ${text('automaticSubtitle')}` : ''}`,
    });
  }
  return options;
}

function renderCandidateAsset(candidate, asset, index) {
  return `
    <div class="sniffer-resource-variant is-asset">
      <button class="sniffer-resource-variant-download" type="button" data-download-asset="${escapeHtml(candidate.id)}" data-asset-index="${index}">
        <strong><bdi>${escapeHtml(asset.label)}</bdi></strong>
        <span><bdi>${escapeHtml(asset.detail || '')}</bdi></span>
      </button>
    </div>
  `;
}

function renderCandidateQuickAssets(candidate, assets) {
  const indexedAssets = assets.map((asset, index) => ({ asset, index }));
  const directAssets = indexedAssets.filter(({ asset }) => asset.assetType !== 'subtitle');
  const subtitleAssets = indexedAssets.filter(({ asset }) => asset.assetType === 'subtitle');
  const storedSubtitleKey = state.selectedSubtitleAssetKeysByCandidateId[candidate.id];
  const selectedSubtitleKey = subtitleAssets.some(({ asset, index }) => candidateSubtitleAssetKey(asset, index) === storedSubtitleKey)
    ? storedSubtitleKey
    : candidateSubtitleAssetKey(subtitleAssets[0]?.asset, subtitleAssets[0]?.index);
  return `
    <section class="sniffer-resource-quick-assets" aria-label="${escapeHtml(text('quickDownload'))}">
      <div class="sniffer-resource-option-heading">
        <div class="sniffer-resource-option-label">${escapeHtml(text('quickDownload'))}</div>
        <div class="sniffer-resource-storage-hint">${escapeHtml(text('assetStorageHint'))}</div>
      </div>
      ${candidate.subtitleDiscoveryPending === true ? `<div class="sniffer-resource-subtitle-status" role="status"><span aria-hidden="true"></span>${escapeHtml(text('subtitleDetecting'))}</div>` : ''}
      ${directAssets.length ? `<div class="sniffer-resource-quick-grid">${directAssets.map(({ asset, index }) => renderCandidateAsset(candidate, asset, index)).join('')}</div>` : ''}
      ${subtitleAssets.length ? `<div class="sniffer-resource-subtitle-picker">
        <select data-candidate-subtitle-select="${escapeHtml(candidate.id)}" aria-label="${escapeHtml(text('chooseSubtitle'))}">
          ${subtitleAssets.map(({ asset, index }) => {
            const key = candidateSubtitleAssetKey(asset, index);
            return `<option value="${escapeHtml(key)}" data-asset-index="${index}"${key === selectedSubtitleKey ? ' selected' : ''}>${escapeHtml(asset.name || asset.language || text('chooseSubtitle'))}${asset.automatic ? ` · ${escapeHtml(text('automaticSubtitle'))}` : ''}</option>`;
          }).join('')}
        </select>
        <button type="button" data-download-selected-subtitle="${escapeHtml(candidate.id)}">${iconSvg('download')}<span>${escapeHtml(text('downloadSubtitle'))}</span></button>
      </div>` : ''}
    </section>
  `;
}

function candidateSubtitleAssetKey(asset, index = 0) {
  if (!asset) return '';
  return String(asset.id || [
    'subtitle',
    asset.language || asset.name || '',
    asset.automatic ? 'automatic' : 'manual',
    asset.extension || 'vtt',
    index,
  ].join(':'));
}

function renderBatchCandidateRow(candidate, selected) {
  return `<label class="batch-candidate-row${selected ? ' is-selected' : ''}">
    <input class="batch-candidate-checkbox" type="checkbox" data-batch-candidate="${escapeHtml(candidate.id)}" ${selected ? 'checked' : ''} />
    <span class="batch-candidate-title" title="${escapeHtml(candidateTitle(candidate))}"><bdi>${escapeHtml(candidateTitle(candidate))}</bdi></span>
  </label>`;
}

function renderCandidates() {
  const focusedSubtitleSelect = document.activeElement?.matches?.('[data-candidate-subtitle-select]')
    ? document.activeElement
    : null;
  const collection = state.activeTabId ? state.mediaCollectionsByTabId[state.activeTabId] || [] : [];
  const supportsBatch = collection.length >= 2;
  const currentCandidates = mediaCandidatesForTab();
  const hasCurrentMedia = currentCandidates.length > 0;
  const mediaMode = supportsBatch && (!hasCurrentMedia || state.mediaModeByTabId[state.activeTabId] === 'batch') ? 'batch' : 'current';
  if (state.activeTabId) state.mediaModeByTabId[state.activeTabId] = mediaMode;
  els.mediaContextSwitch.hidden = !supportsBatch;
  els.mediaModeButtons.forEach((button) => {
    button.classList.toggle('is-active', button.dataset.mediaMode === mediaMode);
    button.disabled = button.dataset.mediaMode === 'current' && !hasCurrentMedia;
  });
  els.batchMediaCount.textContent = String(collection.length);
  els.batchMediaToolbar.hidden = mediaMode !== 'batch';
  els.mediaPanelTabs.hidden = mediaMode === 'batch';
  els.browserQuality.closest('.media-resolution-filter').hidden = mediaMode === 'batch';

  const selectedBatch = new Set(state.selectedBatchCandidateIdsByTabId[state.activeTabId] || []);
  const unfilteredCandidates = mediaMode === 'batch' ? collection : currentCandidates;
  if (mediaMode === 'batch') {
    const selectedCount = collection.filter((candidate) => selectedBatch.has(candidate.id)).length;
    els.batchSelectAll.checked = selectedCount > 0 && selectedCount === collection.length;
    els.batchSelectAll.indeterminate = selectedCount > 0 && selectedCount < collection.length;
    els.batchDownloadSelected.disabled = selectedCount === 0;
  }
  renderMediaResolutionFilter(unfilteredCandidates);
  if (mediaMode === 'batch') els.browserQuality.closest('.media-resolution-filter').hidden = true;
  const activeCandidates = mediaMode === 'batch'
    ? unfilteredCandidates
    : filterCandidatesByResolution(unfilteredCandidates, selectedMinimumResolution());
  const recommendedCandidates = activeCandidates.filter((candidate) => candidate.isRecommended === true);
  const rows = mediaMode === 'batch'
    ? activeCandidates
    : (state.browserSideTab === 'recommend' ? recommendedCandidates.slice(0, 1) : activeCandidates);
  els.recommend.childNodes[0].textContent = `${text('recommend')} `;
  els.allMedia.childNodes[0].textContent = `${text('all')} `;
  els.recommendCount.textContent = String(recommendedCandidates.length);
  els.allCount.textContent = String(unfilteredCandidates.length);
  els.mediaCount.textContent = String(rows.length);
  updateBrowserStatusBar();
  els.recommend.classList.toggle('active', state.browserSideTab === 'recommend');
  els.allMedia.classList.toggle('active', state.browserSideTab === 'all');
  els.recommend.classList.toggle('is-active', state.browserSideTab === 'recommend');
  els.allMedia.classList.toggle('is-active', state.browserSideTab === 'all');
  if (!rows.length) {
    const emptyMessage = state.browserSideTab === 'recommend' && activeCandidates.length > 0 ? text('suspectedVideosFound') : text('scanning');
    els.candidateList.innerHTML = `<div class="media-empty"><img class="app-empty-image is-compact" src="./assets/vidogo-empty.png" alt="" /><p>${escapeHtml(emptyMessage === text('scanning') ? text('noMedia') : emptyMessage)}</p></div>`;
    return;
  }
  if (focusedSubtitleSelect
    && rows.some((candidate) => candidate.id === focusedSubtitleSelect.dataset.candidateSubtitleSelect)) {
    return;
  }
  els.candidateList.innerHTML = rows.map((item) => mediaMode === 'batch'
    ? renderBatchCandidateRow(item, selectedBatch.has(item.id))
    : renderCandidateRow(item)).join('');
  els.candidateList.querySelectorAll('.sniffer-resource-thumbnail img').forEach((image) => {
    image.addEventListener('error', () => {
      const row = image.closest('[data-candidate]');
      const candidate = rows.find((item) => item.id === row?.dataset.candidate);
      const thumbnail = image.closest('.sniffer-resource-thumbnail');
      if (!thumbnail || !candidate) return;
      thumbnail.classList.remove('has-thumbnail');
      thumbnail.innerHTML = iconSvg(candidateIcon(candidate));
    }, { once: true });
  });
  els.candidateList.querySelectorAll('[data-candidate]').forEach((button) => {
    button.addEventListener('click', (event) => {
      if (event.target.closest('button, select, input, a, label')) return;
      state.selectedCandidateIdsByTabId[state.activeTabId] = button.dataset.candidate;
      renderCandidates();
    });
  });
  els.candidateList.querySelectorAll('[data-candidate-subtitle-select]').forEach((select) => {
    for (const eventName of ['pointerdown', 'mousedown', 'mouseup', 'click']) {
      select.addEventListener(eventName, (event) => event.stopPropagation());
    }
    select.addEventListener('change', (event) => {
      event.stopPropagation();
      state.selectedSubtitleAssetKeysByCandidateId[select.dataset.candidateSubtitleSelect] = select.value;
    });
  });
  els.candidateList.querySelectorAll('[data-toggle-candidate-variants]').forEach((button) => {
    button.addEventListener('click', (event) => {
      event.stopPropagation();
      toggleCandidateExpanded(button.dataset.toggleCandidateVariants);
      renderCandidates();
    });
  });
  els.candidateList.querySelectorAll('[data-download-candidate]').forEach((button) => {
    button.addEventListener('click', (event) => {
      event.stopPropagation();
      const candidate = rows.find((item) => item.id === button.dataset.downloadCandidate);
      if (!candidate?.url) return;
      state.selectedCandidateIdsByTabId[state.activeTabId] = candidate.id;
      void startCandidateDownload(candidate);
    });
  });
  els.candidateList.querySelectorAll('[data-record-candidate]').forEach((button) => {
    button.addEventListener('click', (event) => {
      event.stopPropagation();
      toast(text(state.settings.recordingEnabled ? 'recordingRequired' : 'enableRecordingFirst'));
    });
  });
  els.candidateList.querySelectorAll('[data-download-variant]').forEach((button) => {
    button.addEventListener('click', (event) => {
      event.stopPropagation();
      const candidate = rows.find((item) => item.id === button.dataset.downloadVariant);
      const variant = candidateVariants(candidate)[Number(button.dataset.variantIndex)];
      if (!candidate || !variant) return;
      state.selectedCandidateIdsByTabId[state.activeTabId] = candidate.id;
      void startCandidateDownload(candidate, variant);
    });
  });
  els.candidateList.querySelectorAll('[data-download-all-images]').forEach((button) => {
    button.addEventListener('click', (event) => {
      event.stopPropagation();
      const candidate = rows.find((item) => item.id === button.dataset.downloadAllImages);
      if (!candidate) return;
      state.selectedCandidateIdsByTabId[state.activeTabId] = candidate.id;
      void startCandidateImageBatchDownload(candidate);
    });
  });
  els.candidateList.querySelectorAll('[data-download-asset]').forEach((button) => {
    button.addEventListener('click', (event) => {
      event.stopPropagation();
      const candidate = rows.find((item) => item.id === button.dataset.downloadAsset);
      const asset = candidateAssetOptions(candidate)[Number(button.dataset.assetIndex)];
      if (!candidate || !asset) return;
      state.selectedCandidateIdsByTabId[state.activeTabId] = candidate.id;
      void startCandidateAssetDownload(candidate, asset);
    });
  });
  els.candidateList.querySelectorAll('[data-download-selected-subtitle]').forEach((button) => {
    button.addEventListener('click', (event) => {
      event.stopPropagation();
      const candidate = rows.find((item) => item.id === button.dataset.downloadSelectedSubtitle);
      const select = els.candidateList.querySelector(`[data-candidate-subtitle-select="${CSS.escape(button.dataset.downloadSelectedSubtitle)}"]`);
      const selectedOption = select?.selectedOptions?.[0];
      const asset = candidateAssetOptions(candidate)[Number(selectedOption?.dataset.assetIndex)];
      if (!candidate || asset?.assetType !== 'subtitle') return;
      state.selectedCandidateIdsByTabId[state.activeTabId] = candidate.id;
      void startCandidateAssetDownload(candidate, asset);
    });
  });
}

function agedmPlaybackUrl(candidate, tab = activeTab()) {
  const candidates = [
    candidate?.pageUrl,
    tabProvider(tab) === 'agedm' ? tab?.url : null,
    candidate?.provider === 'agedm' ? candidate?.url : null,
  ];
  return candidates.find((value) => {
    const page = MEDIA_RULES?.classifyMediaPage?.(value);
    return page?.provider === 'agedm' && page?.pageKind === 'episode';
  }) || null;
}

async function startResolvedAgedmDownload(candidate) {
  const pageUrl = agedmPlaybackUrl(candidate);
  if (!pageUrl) return null;
  if (!await ensureDownloadEntitlementAvailable(1)) return null;
  const pending = {
    ...candidate,
    url: pageUrl,
    pageUrl,
    provider: 'agedm',
    sourceClient: 'collection-page',
    downloadStrategy: 'merge',
  };
  const [row] = queueUrls([pageUrl], pending);
  if (!row) return null;
  row.status = 'resolving';
  row.state = 'resolving';
  row.percent = 0;
  row.downloaded = '-';
  row.size = '-';
  row.errorMessage = null;
  saveState();
  renderDownloads();
  toast(text('batchQueued', { count: 1 }), 'success');

  return startDownload({
    ...pending,
    pageUrl,
    provider: 'agedm',
    backgroundResolvePage: true,
    entitlementPreflightPassed: true,
    retryRowId: String(row.id || row.downloadId),
    suppressToast: true,
  });
}

async function startCandidateDownload(candidate, variant = null) {
  if (candidateRequiresRecording(candidate)) {
    toast(text(state.settings.recordingEnabled ? 'recordingRequired' : 'enableRecordingFirst'));
    return;
  }
  const selectedVariant = variant
    || (/^(?:tiktok|douyin)-page$/.test(candidate?.sourceClient) ? null : candidateVariants(candidate)[0] || null);
  const target = selectedVariant ? candidateForVariant(candidate, selectedVariant) : { ...candidate };
  target.url = candidateDownloadUrl(candidate, selectedVariant);
  if (!target.url) return;
  els.urlInput.value = target.url;
  if (agedmPlaybackUrl(candidate)) return startResolvedAgedmDownload(target);
  return startDownload(target);
}

function candidateSourceGroupId(candidate) {
  return [candidate?.provider || 'web', candidate?.mediaId || candidate?.pageUrl || candidate?.url || candidate?.id]
    .map((part) => String(part || '').trim())
    .join(':')
    .slice(0, 500);
}

async function startCandidateAssetDownload(candidate, asset, options = {}) {
  const pageUrl = candidate?.pageUrl || candidate?.url;
  if (!pageUrl) return null;
  const common = {
    ...candidate,
    url: pageUrl,
    pageUrl,
    sourceClient: 'yt-dlp',
    downloadStrategy: 'merge',
    directDownload: false,
    sourceGroupId: candidateSourceGroupId(candidate),
    assetType: asset.assetType,
    assetRole: asset.assetRole,
    projectTitle: candidate.title || candidate.fileName,
    entitlementPreflightPassed: options.entitlementPreflightPassed === true,
    suppressToast: options.suppressToast === true,
  };
  if (asset.assetType === 'audio') {
    return startDownload({
      ...common,
      kind: 'audio',
      mimeType: 'audio/mpeg',
      extension: 'mp3',
      formatId: 'bestaudio/best',
      qualityLabel: 'MP3 · 320 kbps',
      audioOnly: true,
    });
  }
  if (asset.assetType === 'image') {
    const assetIndex = Math.max(0, (candidate?.assets?.images || []).findIndex((item) => item?.url === asset.url));
    const assetName = asset.name || text('imageNumber', { index: assetIndex + 1 });
    const imageTitle = asset.assetRole === 'gallery' ? `${candidate.title || candidate.fileName || '小红书笔记'} - ${assetName}` : candidate.title;
    return startDownload({
      ...common,
      url: asset.url || pageUrl,
      referrer: pageUrl,
      title: imageTitle,
      fileName: imageTitle,
      kind: 'image',
      mimeType: `image/${asset.extension === 'jpg' ? 'jpeg' : (asset.extension || 'jpeg')}`,
      extension: asset.extension || 'jpg',
      formatId: null,
      thumbnailUrl: asset.url || candidate.thumbnailUrl,
      qualityLabel: asset.assetRole === 'gallery' ? assetName : text('downloadCover'),
      assetIndex: asset.assetRole === 'gallery' ? assetIndex + 1 : 0,
      audioOnly: false,
    });
  }
  if (asset.assetType === 'subtitle') {
    return startDownload({
      ...common,
      kind: 'subtitle',
      mimeType: asset.extension === 'srt' ? 'application/x-subrip' : 'text/vtt',
      extension: asset.extension || 'vtt',
      formatId: null,
      subtitleLanguage: asset.language,
      subtitleAutomatic: asset.automatic === true,
      qualityLabel: asset.name || asset.language,
      audioOnly: false,
    });
  }
  return null;
}

async function startCandidateImageBatchDownload(candidate) {
  const images = candidateAssetOptions(candidate)
    .filter((asset) => asset.assetType === 'image' && asset.assetRole === 'gallery');
  if (!images.length) return null;
  if (!await ensureDownloadEntitlementAvailable(images.length)) return null;
  const results = await Promise.all(images.map((asset) => startCandidateAssetDownload(candidate, asset, {
    entitlementPreflightPassed: true,
    suppressToast: true,
  })));
  const started = results.filter(Boolean).length;
  if (started > 0) toast(text('batchQueued', { count: started }), 'success');
  return results;
}

function waitForDelay(milliseconds) {
  return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
}

const BATCH_RESOLVER_CONCURRENCY = Math.max(
  2,
  Math.min(4, Math.floor(Number(navigator.hardwareConcurrency) || 4)),
);

async function resolveCollectionDownloadCandidate(candidate) {
  if (candidate?.sourceClient !== 'collection-page') return candidate;
  const targetUrl = candidate.pageUrl || candidate.url;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const result = await window.mediaDeck.resolvePageMedia({
        pageUrl: targetUrl,
        title: candidate.title,
        fileName: candidate.fileName,
        thumbnailUrl: candidate.thumbnailUrl,
        timeoutMs: attempt === 0 ? 14000 : 18000,
      });
      if (result?.ok && result.candidate?.url) {
        return {
          ...result.candidate,
          title: candidate.title || result.candidate.title,
          fileName: candidate.fileName || candidate.title || result.candidate.fileName,
          thumbnailUrl: candidate.thumbnailUrl || result.candidate.thumbnailUrl,
          pageUrl: targetUrl,
          webContentsId: result.candidate.webContentsId || null,
        };
      }
    } catch { /* retry transient player startup failures once */ }
    if (attempt === 0) await waitForDelay(700);
  }
  return null;
}

function addFailedBatchRow(candidate, message) {
  const [row] = queueUrls([candidate.url], candidate);
  if (!row) return;
  row.status = 'error';
  row.state = 'error';
  row.errorMessage = message;
  saveState();
  renderDownloads();
}

async function startSelectedBatchDownloads() {
  const tabId = state.activeTabId;
  const selectedIds = new Set(state.selectedBatchCandidateIdsByTabId[tabId] || []);
  const candidates = (state.mediaCollectionsByTabId[tabId] || []).filter((candidate) => selectedIds.has(candidate.id));
  if (!candidates.length) {
    toast(text('selectMediaFirst'));
    return;
  }
  if (!await ensureDownloadEntitlementAvailable(candidates.length)) return;
  const originalLabel = els.batchDownloadLabel.textContent;
  const sourceTab = activeTab();
  const currentDetectedMedia = mediaCandidatesForTab(tabId)
    .find((item) => item?.sourceClient !== 'collection-page' && item?.url);
  els.batchDownloadSelected.disabled = true;
  const queuedTasks = candidates.map((candidate) => {
    const [row] = queueUrls([candidate.url], candidate);
    if (!row) return null;
    // Mount every selected episode immediately, but do not claim that all of
    // them are already resolving. The batch coordinator promotes each row only
    // when its page resolver actually begins working on that episode.
    row.status = 'queued';
    row.state = 'queued';
    row.errorMessage = null;
    return { candidate, rowId: String(row.id || row.downloadId) };
  }).filter(Boolean);
  saveState();
  renderDownloads();
  toast(text('batchQueued', { count: queuedTasks.length }), 'success');
  let started = 0;
  let failed = 0;
  let completedResolutions = 0;
  let nextTaskIndex = 0;
  const processTask = async ({ candidate, rowId }) => {
    let row = state.queue.find((item) => String(item.id || item.downloadId) === rowId);
    if (!row || normalizeDownloadState(row.state || row.status) === 'paused') return;
    try {
      // A mounted row is only a user-visible plan. Promote it to resolving when
      // this worker actually starts, then reuse the proven page resolver before
      // handing a real media URL to the download queue. This keeps immediate UI
      // feedback without changing the previously reliable transfer pipeline.
      row.status = 'resolving';
      row.state = 'resolving';
      row.errorMessage = null;
      saveState();
      renderDownloads();
      const isCurrentEpisode = sourceTab && MEDIA_RULES?.normalizePageUrl?.(candidate.pageUrl)
        === MEDIA_RULES?.normalizePageUrl?.(sourceTab.url);
      const resolved = isCurrentEpisode && currentDetectedMedia
        ? {
          ...currentDetectedMedia,
          title: candidate.title || currentDetectedMedia.title,
          fileName: candidate.fileName || currentDetectedMedia.fileName,
          thumbnailUrl: candidate.thumbnailUrl || currentDetectedMedia.thumbnailUrl,
          pageUrl: candidate.pageUrl,
          webContentsId: sourceTab.webContentsId,
        }
        : await resolveCollectionDownloadCandidate(candidate);
      row = state.queue.find((item) => String(item.id || item.downloadId) === rowId);
      if (!row || normalizeDownloadState(row.state || row.status) === 'paused') return;
      if (!resolved) throw new Error(text('batchResolveFailed'));
      const result = await startDownload({
        ...resolved,
        // `resolveCollectionDownloadCandidate` already returned a real media
        // candidate. Do not send the page through a second independent resolver.
        backgroundResolvePage: false,
        entitlementPreflightPassed: true,
        retryRowId: rowId,
        suppressToast: true,
      });
      if (result) started += 1;
      else failed += 1;
    } catch {
      row = state.queue.find((item) => String(item.id || item.downloadId) === rowId);
      if (row && normalizeDownloadState(row.state || row.status) !== 'paused') {
        failed += 1;
        row.status = 'error';
        row.state = 'error';
        row.errorMessage = text('batchResolveFailed');
        saveState();
        renderDownloads();
      }
    } finally {
      completedResolutions += 1;
      els.batchDownloadLabel.textContent = text('resolvingEpisode', {
        current: completedResolutions,
        total: queuedTasks.length,
      });
    }
  };
  const worker = async () => {
    while (nextTaskIndex < queuedTasks.length) {
      const task = queuedTasks[nextTaskIndex];
      nextTaskIndex += 1;
      await processTask(task);
    }
  };
  try {
    // Resolution is network/renderer bound rather than GPU bound. A bounded
    // worker pool lets slow episode pages time out independently without
    // blocking every task behind them or opening an excessive number of
    // hidden Chromium players at once.
    const resolverConcurrency = Math.min(BATCH_RESOLVER_CONCURRENCY, queuedTasks.length);
    await Promise.all(Array.from({ length: resolverConcurrency }, () => worker()));
  } finally {
    els.batchDownloadLabel.textContent = originalLabel;
    els.batchDownloadSelected.disabled = false;
  }
  // The queue rows already expose per-episode progress and errors. Avoid a
  // second top-level notification after the initial "tasks added" message.
}

function handleNativeDownloadRequest(payload) {
  const tab = tabForWebContentsId(payload?.webContentsId);
  const url = String(payload?.url || '').trim();
  if (!tab || !/^https?:\/\//i.test(url)) return;
  const fileName = String(payload?.fileName || '').trim();
  const provider = MEDIA_RULES?.providerSiteForUrl?.(payload?.pageUrl) || tabProvider(tab) || 'web';
  const pending = tab.pendingNativeDownloadMetadata?.provider === provider
    && Date.now() - Number(tab.pendingNativeDownloadMetadata.capturedAt || 0) <= 30_000
    ? tab.pendingNativeDownloadMetadata
    : null;
  const recent = tab.recentStockMediaCandidate?.provider === provider
    && Date.now() - Number(tab.recentStockMediaCandidate.capturedAt || 0) <= 120_000
    ? tab.recentStockMediaCandidate
    : null;
  const detected = mediaCandidatesForTab(tab.id).find((candidate) => candidate?.provider === provider) || recent || null;
  const qualityFromFileName = (() => {
    const copy = fileName.toLowerCase();
    if (/\b(?:2160|4k)\b/.test(copy)) return '2160p';
    if (/\b(?:1440|2k)\b/.test(copy)) return '1440p';
    if (/\b1080\b|full[-_ ]?hd/.test(copy)) return '1080p';
    if (/\b720\b|hd[-_ ]?ready/.test(copy)) return '720p';
    return copy.match(/\b(?:576|480|360)p?\b/)?.[0]?.replace(/p?$/, 'p') || '';
  })();
  tab.pendingNativeDownloadMetadata = null;
  void startDownload({
    id: `native-${Date.now()}`,
    url,
    pageUrl: String(pending?.pageUrl || payload?.pageUrl || tab.url || ''),
    webContentsId: tab.webContentsId,
    provider,
    title: fileName || pending?.title || detected?.title || String(payload?.title || tab.title || 'Video'),
    fileName: fileName || null,
    thumbnailUrl: pending?.thumbnailUrl || detected?.thumbnailUrl || null,
    width: safePositiveInteger(pending?.width || detected?.width),
    height: safePositiveInteger(pending?.height || detected?.height),
    resolution: safePositiveInteger(pending?.height || detected?.resolution || detected?.height),
    qualityLabel: String(pending?.qualityLabel || qualityFromFileName || candidateResolution(detected) || '').slice(0, 80),
    mimeType: String(payload?.mimeType || ''),
    sizeBytes: safePositiveInteger(payload?.sizeBytes),
    kind: 'video',
    isRecommended: true,
    sourceClient: 'native-download',
    downloadStrategy: 'direct',
  });
}

function setFavorite(url, title, enabled) {
  if (!url) return;
  const exists = state.favorites.some((item) => item.url === url);
  if (enabled && !exists) state.favorites.unshift({ title: title || url, url, time: new Date().toISOString() });
  if (!enabled && exists) state.favorites = state.favorites.filter((item) => item.url !== url);
  saveState();
  renderFavorites();
  syncFavoriteButton();
}

function addCurrentFavorite() {
  const tab = activeTab();
  if (!tab?.url) return toast(text('noActivePage'));
  setFavorite(tab.url, tab.title || tab.url, true);
  toast(text('saved'));
}

function setFavoritesPopoverOpen(open) {
  state.favoritesPopoverOpen = Boolean(open && activeTab()?.url);
  els.favoritesPopover.hidden = !state.favoritesPopoverOpen;
  els.pageFavorite.setAttribute('aria-expanded', String(state.favoritesPopoverOpen));
  if (state.favoritesPopoverOpen) renderFavoritesPopover();
}

function syncFavoriteButton() {
  const tab = activeTab();
  const isFavorite = Boolean(tab) && state.favorites.some((item) => item.url === tab.url);
  els.pageFavorite.disabled = !tab?.url;
  els.pageFavorite.classList.toggle('active', isFavorite);
  els.pageFavorite.classList.toggle('is-active', isFavorite);
  setIcon(els.pageFavoriteIcon, isFavorite ? 'star-filled' : 'star');
  renderFavoritesPopover();
}

function readUrls() {
  return els.urlInput.value.split(/\r?\n/).map((item) => item.trim()).filter(Boolean);
}

function assetRequestDiscriminator(target = {}) {
  return `${target?.assetType || target?.kind || 'video'}:${target?.subtitleLanguage || ''}:${target?.subtitleAutomatic ? 'auto' : 'manual'}`;
}

function downloadRequestKey(url, formatId = null, assetKey = '') {
  return `${String(url || '').trim()}\u0000${String(formatId || '').trim()}\u0000${String(assetKey || '').trim()}`;
}

function queueUrls(urls, downloadTarget = null) {
  const now = new Date().toISOString();
  const formatId = downloadTarget?.formatId || null;
  const assetKey = assetRequestDiscriminator(downloadTarget);
  const existingActive = new Set(state.queue
    .filter((item) => ['queued', 'resolving', 'connecting', 'downloading', 'finalizing'].includes(normalizeDownloadState(item.status || item.state)))
    .map((item) => item.requestKey || downloadRequestKey(item.url, item.formatId, assetRequestDiscriminator(item))));
  const retryRowId = String(downloadTarget?.retryRowId || '').trim();
  const retryRow = retryRowId
    ? state.queue.find((item) => String(item.id || item.downloadId) === retryRowId)
    : null;
  const requested = urls.map((url) => ({ url, requestKey: downloadRequestKey(url, formatId, assetKey) }));
  const rows = requested.filter((item) => retryRow || !existingActive.has(item.requestKey)).map(({ url, requestKey }) => {
    if (retryRow) {
      Object.assign(retryRow, {
        requestKey,
        formatId,
        url,
        title: downloadTarget?.title || retryRow.title || url,
        fileName: downloadTarget?.fileName || retryRow.fileName || getFileName(url) || url,
        thumbnailUrl: downloadTarget?.thumbnailUrl || retryRow.thumbnailUrl || null,
        qualityLabel: candidateResolution(downloadTarget) || retryRow.qualityLabel,
        percent: 0,
        downloaded: '-',
        speed: '-',
        size: downloadTarget ? formatBytes(candidateSize(downloadTarget)) : '-',
        time: now,
        createdAt: Date.now(),
        status: 'queued',
        state: 'queued',
        jobId: null,
        errorMessage: null,
        completionVerified: false,
        completedBytes: 0,
        path: state.settings.outputDir,
        savePath: state.settings.outputDir,
        provider: downloadTarget?.provider || retryRow.provider || null,
        kind: downloadTarget?.kind || retryRow.kind || null,
        assetType: downloadTarget?.assetType || downloadTarget?.kind || retryRow.assetType || null,
        assetRole: downloadTarget?.assetRole || retryRow.assetRole || null,
        sourceGroupId: downloadTarget?.sourceGroupId || retryRow.sourceGroupId || null,
        subtitleLanguage: downloadTarget?.subtitleLanguage || retryRow.subtitleLanguage || null,
        subtitleAutomatic: downloadTarget?.subtitleAutomatic === true,
        mimeType: downloadTarget?.mimeType || downloadTarget?.mime || retryRow.mimeType || null,
        sourceClient: downloadTarget?.sourceClient || retryRow.sourceClient || null,
        pageUrl: downloadTarget?.pageUrl || retryRow.pageUrl || null,
        referrer: downloadTarget?.referrer || retryRow.referrer || null,
        webContentsId: downloadTarget?.webContentsId || retryRow.webContentsId || null,
        downloadStrategy: downloadTarget?.downloadStrategy || retryRow.downloadStrategy || null,
        backgroundResolvePage: downloadTarget?.backgroundResolvePage === true,
      });
      return retryRow;
    }
    const id = `dl-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    return {
      id,
      downloadId: id,
      requestKey,
      formatId,
      url,
      title: downloadTarget?.title || url,
      fileName: downloadTarget?.fileName || getFileName(url) || url,
      thumbnailUrl: downloadTarget?.thumbnailUrl || null,
      qualityLabel: candidateResolution(downloadTarget),
      percent: 0,
      downloaded: '-',
      speed: '-',
      size: downloadTarget ? formatBytes(candidateSize(downloadTarget)) : '-',
      time: now,
      createdAt: Date.now(),
      status: 'queued',
      state: 'queued',
      path: state.settings.outputDir,
      savePath: state.settings.outputDir,
      provider: downloadTarget?.provider || null,
      kind: downloadTarget?.kind || null,
      assetType: downloadTarget?.assetType || downloadTarget?.kind || null,
      assetRole: downloadTarget?.assetRole || null,
      sourceGroupId: downloadTarget?.sourceGroupId || null,
      subtitleLanguage: downloadTarget?.subtitleLanguage || null,
      subtitleAutomatic: downloadTarget?.subtitleAutomatic === true,
      mimeType: downloadTarget?.mimeType || downloadTarget?.mime || null,
      sourceClient: downloadTarget?.sourceClient || null,
      pageUrl: downloadTarget?.pageUrl || null,
      referrer: downloadTarget?.referrer || null,
      webContentsId: downloadTarget?.webContentsId || null,
      downloadStrategy: downloadTarget?.downloadStrategy || null,
      backgroundResolvePage: downloadTarget?.backgroundResolvePage === true,
      completionVerified: false,
      completedBytes: 0,
    };
  });
  if (!retryRow) state.queue = [...rows, ...state.queue].slice(0, 300);
  state.downloadPage = 1;
  saveState();
  updateDownloadBadge();
  renderDownloads();
  return rows;
}

async function startDownload(downloadTarget = null) {
  const urls = downloadTarget?.url ? [downloadTarget.url] : readUrls();
  if (!urls.length) {
    if (!downloadTarget?.suppressToast) toast(text('noUrls'));
    return null;
  }
  const activeUrls = [...new Set(urls)];
  if (downloadTarget?.entitlementPreflightPassed !== true
    && !await ensureDownloadEntitlementAvailable(activeUrls.length, {
      retryExisting: downloadTarget?.isRetry === true,
      suppressToast: downloadTarget?.suppressToast === true,
    })) return null;
  const queuedRows = queueUrls(urls, downloadTarget);
  const requestKeys = new Set(activeUrls.map((url) => downloadRequestKey(
    url,
    downloadTarget?.formatId || null,
    assetRequestDiscriminator(downloadTarget),
  )));
  const retryRowId = String(downloadTarget?.retryRowId || '').trim();
  const requestRows = retryRowId
    ? state.queue.filter((item) => String(item.id || item.downloadId) === retryRowId)
    : requestKeys.size > 0
    ? state.queue.filter((item) => requestKeys.has(item.requestKey || downloadRequestKey(item.url, item.formatId, assetRequestDiscriminator(item)))
      && ['queued', 'resolving', 'connecting', 'downloading', 'finalizing'].includes(normalizeDownloadState(item.status || item.state)))
    : queuedRows;
  requestRows.forEach((item) => {
      item.status = 'queued';
      item.state = 'queued';
      item.jobId = null;
      item.percent = item.percent || 0;
      item.path = state.settings.outputDir;
      item.savePath = item.savePath || state.settings.outputDir;
      item.fileName = item.fileName || getFileName(item.title || item.url) || item.url;
      item.createdAt = item.createdAt || new Date(item.time || Date.now()).getTime();
      item.completionVerified = false;
      item.completedBytes = 0;
      item.errorMessage = null;
      item.suppressCompletionToast = Boolean(downloadTarget?.suppressToast);
    if (downloadTarget) {
      item.title = downloadTarget.title || item.title;
      item.fileName = downloadTarget.fileName || item.fileName;
      item.thumbnailUrl = downloadTarget.thumbnailUrl || item.thumbnailUrl;
      item.size = formatBytes(candidateSize(downloadTarget));
      item.qualityLabel = candidateResolution(downloadTarget);
      item.formatId = downloadTarget.formatId || null;
      item.requestKey = downloadRequestKey(item.url, item.formatId, assetRequestDiscriminator(downloadTarget));
      item.provider = downloadTarget.provider || item.provider || null;
      item.kind = downloadTarget.kind || item.kind || null;
      item.assetType = downloadTarget.assetType || downloadTarget.kind || item.assetType || null;
      item.assetRole = downloadTarget.assetRole || item.assetRole || null;
      item.sourceGroupId = downloadTarget.sourceGroupId || item.sourceGroupId || null;
      item.subtitleLanguage = downloadTarget.subtitleLanguage || item.subtitleLanguage || null;
      item.subtitleAutomatic = downloadTarget.subtitleAutomatic === true;
      item.mimeType = downloadTarget.mimeType || downloadTarget.mime || item.mimeType || null;
      item.sourceClient = downloadTarget.sourceClient || item.sourceClient || null;
      item.pageUrl = downloadTarget.pageUrl || item.pageUrl || null;
      item.referrer = downloadTarget.referrer || item.referrer || null;
      item.webContentsId = downloadTarget.webContentsId || item.webContentsId || null;
      item.downloadStrategy = downloadTarget.downloadStrategy || item.downloadStrategy || null;
      item.backgroundResolvePage = downloadTarget.backgroundResolvePage === true;
    }
  });
  saveState();
  updateDownloadBadge();
  renderDownloads();
  try {
    const normalizedTargetUrl = MEDIA_RULES?.normalizePageUrl?.(downloadTarget?.url) || String(downloadTarget?.url || '');
    const normalizedPageUrl = MEDIA_RULES?.normalizePageUrl?.(downloadTarget?.pageUrl) || String(downloadTarget?.pageUrl || '');
    const sourceMediaContext = MEDIA_RULES?.classifyMediaPage?.(downloadTarget?.pageUrl || downloadTarget?.url) || null;
    const detectedDirectMedia = downloadTarget?.kind === 'video'
      && Boolean(normalizedTargetUrl)
      && normalizedTargetUrl !== normalizedPageUrl
      && downloadTarget?.sourceClient !== 'yt-dlp';
    const result = await window.mediaDeck.startDownload({
      urls: activeUrls,
      outputDir: state.settings.outputDir,
      resolution: state.settings.resolution,
      playlist: state.settings.playlist,
      audioOnly: downloadTarget?.audioOnly ?? state.settings.audioOnly,
      assetType: downloadTarget?.assetType || downloadTarget?.kind || (state.settings.audioOnly ? 'audio' : 'video'),
      assetRole: downloadTarget?.assetRole || null,
      sourceGroupId: downloadTarget?.sourceGroupId || candidateSourceGroupId(downloadTarget),
      subtitleLanguage: downloadTarget?.subtitleLanguage || null,
      subtitleAutomatic: downloadTarget?.subtitleAutomatic === true,
      jsRuntime: 'auto',
      ffmpegLocation: null,
      formatId: downloadTarget?.formatId || null,
      mergeOutputFormat: candidateMergeOutputFormat(downloadTarget),
      referrer: downloadTarget?.referrer || downloadTarget?.pageUrl || null,
      thumbnailUrl: downloadTarget?.thumbnailUrl || window.mediaDeckSmokeDownload?.thumbnailUrl || null,
      title: downloadTarget?.title || downloadTarget?.fileName || null,
      provider: downloadTarget?.provider || sourceMediaContext?.provider || null,
      mediaId: downloadTarget?.mediaId || sourceMediaContext?.mediaId || null,
      pageUrl: downloadTarget?.pageUrl || sourceMediaContext?.normalizedUrl || null,
      qualityLabel: candidateResolution(downloadTarget),
      extension: downloadTarget?.extension || null,
      videoCodec: downloadTarget?.videoCodec || null,
      audioCodec: downloadTarget?.audioCodec || null,
      directDownload: detectedDirectMedia || downloadTarget?.downloadStrategy === 'direct'
        || /^(?:(?:tiktok|douyin)-page|native-download|site-download-intent|background-resolver)$/.test(downloadTarget?.sourceClient || ''),
      backgroundResolvedMedia: downloadTarget?.sourceClient === 'background-resolver',
      backgroundResolvePage: downloadTarget?.backgroundResolvePage === true,
      siteDownloadIntent: downloadTarget?.sourceClient === 'site-download-intent',
      sourceClient: downloadTarget?.sourceClient || null,
      kind: downloadTarget?.kind || null,
      mimeType: downloadTarget?.mimeType || downloadTarget?.mime || null,
      sizeBytes: candidateSize(downloadTarget),
      webContentsId: downloadTarget?.webContentsId || null,
      maxConcurrentDownloads: state.settings.maxConcurrentDownloads,
      // A pre-mounted batch row also supplies retryRowId so the resolved job
      // reuses that row. Only an explicit retry is entitlement-exempt.
      retryExisting: downloadTarget?.isRetry === true,
    });
    if (result?.entitlements) applyEntitlementState(result.entitlements);
    for (const job of Array.isArray(result?.jobs) ? result.jobs : []) {
      const jobRequestKey = job.requestKey || downloadRequestKey(job.url, downloadTarget?.formatId || null, assetRequestDiscriminator(downloadTarget));
      const row = state.queue.find((item) => (item.requestKey || downloadRequestKey(item.url, item.formatId, assetRequestDiscriminator(item))) === jobRequestKey
        && ['queued', 'resolving', 'connecting', 'downloading', 'finalizing'].includes(normalizeDownloadState(item.status || item.state)));
      if (!row) continue;
      row.jobId = job.jobId;
      row.status = normalizeDownloadState(job.state || 'queued') === 'downloading'
        ? 'connecting'
        : normalizeDownloadState(job.state || 'queued');
      row.state = row.status;
    }
    state.running = result?.running !== false;
    saveState();
    renderDownloads();
    updateDownloadBadge();
    return result;
  } catch (error) {
    const rawMessage = String(error?.message || error || 'download failed');
    const message = userFacingDownloadError(rawMessage);
    state.queue.forEach((item) => {
      if (requestKeys.has(item.requestKey || downloadRequestKey(item.url, item.formatId, assetRequestDiscriminator(item)))
        && ['queued', 'resolving', 'connecting', 'downloading', 'finalizing'].includes(normalizeDownloadState(item.status || item.state))) {
        item.status = 'error';
        item.state = 'error';
        item.errorMessage = rawMessage;
      }
    });
    state.running = false;
    saveState();
    updateDownloadBadge();
    renderDownloads();
    if (!downloadTarget?.suppressToast) toast(message);
    return null;
  }
}

async function retryDownloadRow(row, options = {}) {
  const rowId = String(row?.id || row?.downloadId || '').trim();
  if (!row?.url || !rowId) return null;
  let target = { ...row };
  const needsCollectionResolution = row.sourceClient === 'collection-page'
    || row.provider === 'agedm'
    || /(?:^|\.)agedm\.io\/play\//i.test(String(row.pageUrl || row.url));
  if (needsCollectionResolution) {
    const pageTarget = {
      ...row,
      url: row.pageUrl || row.url,
      pageUrl: row.pageUrl || row.url,
      provider: 'agedm',
      sourceClient: 'collection-page',
    };
    row.status = 'resolving';
    row.state = 'resolving';
    row.percent = 0;
    row.downloaded = '-';
    row.speed = '-';
    row.errorMessage = null;
    saveState();
    renderDownloads();
    const resolved = await resolveCollectionDownloadCandidate(pageTarget).catch(() => null);
    const currentRow = state.queue.find((item) => String(item.id || item.downloadId) === rowId);
    if (!currentRow || normalizeDownloadState(currentRow.state || currentRow.status) === 'paused') return null;
    if (!resolved) {
      currentRow.status = 'error';
      currentRow.state = 'error';
      currentRow.errorMessage = text('batchResolveFailed');
      saveState();
      renderDownloads();
      return null;
    }
    target = {
      ...resolved,
      title: row.title || resolved.title,
      fileName: row.fileName || resolved.fileName,
      thumbnailUrl: row.thumbnailUrl || resolved.thumbnailUrl,
      pageUrl: pageTarget.pageUrl,
      backgroundResolvePage: false,
    };
  }
  return startDownload({
    ...target,
    retryRowId: rowId,
    isRetry: true,
    suppressToast: Boolean(options.suppressToast),
  });
}

async function retryAllFailedDownloads() {
  if (state.retryingFailedDownloads) return;
  const failedRows = state.queue
    .filter((item) => normalizeDownloadState(item.status || item.state) === 'error')
    .filter((item) => isInRange(item.time, state.downloadRange));
  const uniqueRows = [];
  const seen = new Set();
  const duplicateIds = new Set();
  for (const row of failedRows) {
    const collectionPage = row.provider === 'agedm'
      ? (MEDIA_RULES?.normalizePageUrl?.(row.pageUrl) || String(row.pageUrl || ''))
      : '';
    const key = collectionPage || row.requestKey || downloadRequestKey(row.pageUrl || row.url, row.formatId);
    if (seen.has(key)) {
      duplicateIds.add(String(row.id || row.downloadId));
      continue;
    }
    seen.add(key);
    uniqueRows.push(row);
  }
  if (duplicateIds.size) {
    state.queue = state.queue.filter((item) => !duplicateIds.has(String(item.id || item.downloadId)));
  }
  if (!uniqueRows.length) {
    toast(text('noRetryableFailed'), 'warning');
    return;
  }
  state.retryingFailedDownloads = true;
  let started = 0;
  let failed = 0;
  let completed = 0;
  let nextIndex = 0;
  renderDownloads();
  const worker = async () => {
    while (nextIndex < uniqueRows.length) {
      const row = uniqueRows[nextIndex];
      nextIndex += 1;
      const result = await retryDownloadRow(row, { suppressToast: true }).catch(() => null);
      if (result) started += 1;
      else failed += 1;
      completed += 1;
      els.retryFailedDownloads.querySelector('span:last-child').textContent = text('retryingFailed', {
        current: completed,
        total: uniqueRows.length,
      });
    }
  };
  await Promise.all(Array.from({ length: Math.min(3, uniqueRows.length) }, () => worker()));
  state.retryingFailedDownloads = false;
  saveState();
  renderDownloads();
  toast(
    failed ? text('retryFailedPartial', { started, failed }) : text('retriedFailed', { count: started }),
    failed ? 'warning' : 'success',
  );
}

async function controlDownloadRow(row, action) {
  if (!row) return false;
  if (action === 'resume') return Boolean(await retryDownloadRow(row));
  const rowState = normalizeDownloadState(row.status || row.state);
  if (action === 'pause' && !row.jobId && ['queued', 'resolving', 'connecting'].includes(rowState)) {
    row.status = 'paused';
    row.state = 'paused';
    row.speed = '-';
    saveState();
    renderDownloads();
    updateDownloadBadge();
    return true;
  }
  const result = await window.mediaDeck.controlDownload({
    jobId: row.jobId || null,
    requestKey: row.requestKey || downloadRequestKey(row.url, row.formatId, assetRequestDiscriminator(row)),
    action,
  });
  if (!result?.ok || result.state === 'not-running') return false;
  if (action === 'pause') {
    row.status = 'paused';
    row.state = 'paused';
    row.speed = '-';
  }
  saveState();
  renderDownloads();
  updateDownloadBadge();
  return true;
}

function markActiveDownloads(status) {
  const normalizedStatus = normalizeDownloadState(status);
  state.queue.forEach((item) => {
    if (item.source !== 'recording' && normalizeDownloadState(item.status || item.state) === 'downloading') {
      item.status = normalizedStatus;
      item.state = normalizedStatus;
    }
  });
  saveState();
  updateDownloadBadge();
  renderDownloads();
}

function downloadRowForEvent(payload, data = {}) {
  if (payload?.jobId) {
    const byJob = state.queue.find((item) => item.jobId === payload.jobId);
    if (byJob) return byJob;
  }
  if (payload?.requestKey) {
    const byRequest = state.queue.find((item) => (item.requestKey || downloadRequestKey(item.url, item.formatId, assetRequestDiscriminator(item))) === payload.requestKey
      && ['queued', 'resolving', 'connecting', 'downloading', 'finalizing'].includes(normalizeDownloadState(item.status || item.state)));
    if (byRequest && (!byRequest.jobId || !payload?.jobId || byRequest.jobId === payload.jobId)) return byRequest;
    if (payload?.jobId) return null;
  }
  if (payload?.url) {
    const byUrl = state.queue.find((item) => item.url === payload.url
      && ['queued', 'resolving', 'connecting', 'downloading', 'finalizing'].includes(normalizeDownloadState(item.status || item.state)));
    if (byUrl) return byUrl;
  }
  const index = Math.max(0, Number(data.item_index || 1) - 1);
  const activeRows = state.queue.filter((item) => item.source !== 'recording'
    && ['queued', 'resolving', 'connecting', 'downloading', 'finalizing'].includes(normalizeDownloadState(item.status || item.state)));
  return activeRows[index] || null;
}

function recordingRowForEvent(payload) {
  const sessionId = payload?.sessionId || payload?.jobId;
  return sessionId
    ? state.queue.find((item) => item.jobId === sessionId || item.downloadId === sessionId)
    : null;
}

// Download workers can finish several jobs during the same renderer tick. Keep
// the comparatively small output-verification/state-commit step ordered while
// allowing the downloads and their progress events to remain fully concurrent.
// This also prevents multiple context-bridge file verification calls from
// leaving earlier rows stranded in the transient `finalizing` state.
let downloadCompletionChain = Promise.resolve();

async function finalizeDownloadEvent(payload) {
  const row = downloadRowForEvent(payload);
  if (row) {
    if (normalizeDownloadState(row.status || row.state) === 'paused') return;
    row.jobId = payload.jobId || row.jobId;
    const output = !payload.failed && row.completionCandidate
      ? await window.mediaDeck.verifyDownloadedFile(row).catch(() => ({ ok: false }))
      : { ok: false };
    row.completionVerified = Boolean(output?.ok);
    if (output?.ok) {
      row.path = output.path || row.path;
      row.savePath = output.taskDir || row.savePath;
      row.completedBytes = Number(output.size || row.completedBytes || 0);
      row.downloaded = formatBytes(row.completedBytes);
      row.size = formatBytes(row.completedBytes);
    }
    row.percent = row.completionVerified ? 100 : Math.min(99, Number(row.percent || 0));
    row.status = row.completionVerified ? 'completed' : 'error';
    row.state = row.status;
    if (!row.completionVerified && !row.errorMessage) row.errorMessage = text('invalidDownloadOutput');
  }
  saveState();
  updateDownloadBadge();
  renderDownloads();
  const completedWithFailure = Number(payload.failed || 0) > 0 || Boolean(row && !row.completionVerified);
  if (!row?.suppressCompletionToast) {
    toast(
      completedWithFailure && row?.errorMessage
        ? row.errorMessage
        : text('downloadDone', { success: payload.downloaded || 0, failed: payload.failed || 0 }),
      completedWithFailure ? 'error' : 'success',
    );
  }
  if (row) {
    delete row.suppressCompletionToast;
    saveState();
  }
}

function queueDownloadCompletion(payload) {
  const completion = downloadCompletionChain
    .catch(() => undefined)
    .then(() => finalizeDownloadEvent(payload));
  downloadCompletionChain = completion.catch(() => undefined);
  return completion;
}

function formatRecordingDuration(milliseconds) {
  const totalSeconds = Math.floor(Math.max(0, Number(milliseconds) || 0) / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const minuteText = String(minutes).padStart(2, '0');
  const secondText = String(seconds).padStart(2, '0');
  return hours > 0 ? `${hours}:${minuteText}:${secondText}` : `${minuteText}:${secondText}`;
}

function handleRecordingEvent(payload) {
  if (!payload) return;
  if (payload.entitlements) applyEntitlementState(payload.entitlements);
  if (payload.type === 'notice') {
    if (payload.message) toast(payload.message);
    return;
  }
  let row = recordingRowForEvent(payload);
  if (payload.type === 'started') {
    if (!row) {
      const now = payload.startedAt || new Date().toISOString();
      const createdAt = Date.parse(now);
      row = {
        id: payload.sessionId,
        downloadId: payload.sessionId,
        jobId: payload.sessionId,
        source: 'recording',
        url: payload.pageUrl || payload.url || '',
        title: payload.pageTitle || payload.fileName || text('recordingStarted'),
        fileName: payload.fileName || `recording-${Date.now()}.webm`,
        thumbnailUrl: payload.thumbnailUrl || null,
        percent: 0,
        downloaded: '0 B',
        speed: '00:00',
        size: '-',
        time: now,
        createdAt: Number.isFinite(createdAt) ? createdAt : Date.now(),
        status: 'downloading',
        state: 'downloading',
        path: payload.path || state.settings.outputDir,
        savePath: payload.savePath || state.settings.outputDir,
      };
      state.queue = [row, ...state.queue].slice(0, 300);
    }
    state.downloadPage = 1;
    toast(text('recordingStarted'));
  }
  if (payload.type === 'progress' && row) {
    const data = payload.data || {};
    row.percent = Math.max(row.percent || 0, Number(data.percent || 0));
    row.downloaded = formatBytes(data.downloaded_bytes) || row.downloaded || '0 B';
    row.size = data.total_bytes ? formatBytes(data.total_bytes) : row.size || '-';
    row.speed = formatRecordingDuration(data.duration_ms);
    row.path = data.filename || payload.path || row.path;
    row.savePath = payload.savePath || row.savePath;
    row.status = data.status === 'finished' ? 'completed' : 'downloading';
    row.state = row.status;
  }
  if (payload.type === 'done' && row) {
    row.percent = 100;
    row.status = 'completed';
    row.state = 'completed';
    row.path = payload.path || row.path;
    row.downloaded = payload.bytes ? formatBytes(payload.bytes) : row.downloaded;
    row.size = payload.bytes ? formatBytes(payload.bytes) : row.size;
    toast(text('recordingCompleted'));
  }
  if (payload.type === 'error') {
    if (row) {
      row.status = 'error';
      row.state = 'error';
    }
    toast(text('recordingFailed', { message: payload.message || 'unknown error' }));
  }
  saveState();
  renderDownloads();
  updateDownloadBadge();
}

function prepareSmokeVisualAudit(section) {
  const now = new Date().toISOString();
  if (section === 'home') {
    state.tabs.forEach((tab) => tab.webview.remove());
    state.tabs = [];
    state.activeTabId = null;
    state.candidatesByTabId = {};
    state.selectedCandidateIdsByTabId = {};
    state.expandedCandidateIdsByTabId = {};
    state.selectedMinimumResolutionByTabId = {};
    renderTabs();
  }
  if (section === 'downloads') {
    const outputDir = state.settings.outputDir || 'C:\\Users\\Demo\\Downloads\\VidoGo';
    const taskDir2160 = `${outputDir}\\20260502 - This Swiss Train Offers Stunning Views [Dc-vLw_4aWk] [401+251]`;
    const taskDir1440 = `${outputDir}\\20260502 - This Swiss Train Offers Stunning Views [Dc-vLw_4aWk] [400+251]`;
    const taskDir1080 = `${outputDir}\\20260502 - This Swiss Train Offers Stunning Views [Dc-vLw_4aWk] [399+251]`;
    state.activeDownloadStatus = 'all';
    state.downloadRange = 'all';
    state.downloadPage = 1;
    state.queue = [
      {
        id: 'visual-download-2160',
        downloadId: 'visual-download-2160',
        source: 'download',
        url: 'https://www.youtube.com/watch?v=visual-audit',
        formatId: '401+251',
        title: 'This Swiss Train Offers Stunning Views to Travelers',
        fileName: 'This Swiss Train Offers Stunning Views to Travelers.webm',
        percent: 22,
        downloaded: '1.4 GB',
        speed: '13 MB/s',
        size: '6.4 GB',
        time: now,
        createdAt: Date.now(),
        status: 'downloading',
        state: 'downloading',
        path: outputDir,
        savePath: taskDir2160,
      },
      {
        id: 'visual-download-1440',
        downloadId: 'visual-download-1440',
        source: 'download',
        url: 'https://www.youtube.com/watch?v=visual-audit',
        formatId: '400+251',
        title: 'This Swiss Train Offers Stunning Views to Travelers',
        fileName: 'This Swiss Train Offers Stunning Views to Travelers.webm',
        percent: 0,
        downloaded: '-',
        speed: '-',
        size: '-',
        time: now,
        createdAt: Date.now() - 1000,
        status: 'resolving',
        state: 'resolving',
        path: outputDir,
        savePath: taskDir1440,
      },
      {
        id: 'visual-download-1080',
        downloadId: 'visual-download-1080',
        source: 'download',
        url: 'https://www.youtube.com/watch?v=visual-audit',
        formatId: '399+251',
        title: 'This Swiss Train Offers Stunning Views to Travelers',
        fileName: 'This Swiss Train Offers Stunning Views to Travelers.webm',
        percent: 100,
        downloaded: '1.6 GB',
        speed: '-',
        size: '1.6 GB',
        time: now,
        createdAt: Date.now() - 2000,
        status: 'completed',
        state: 'completed',
        path: `${taskDir1080}\\video.mp4`,
        savePath: taskDir1080,
        thumbnailPath: `${taskDir1080}\\cover.webp`,
      },
      {
        id: 'visual-download-failed',
        downloadId: 'visual-download-failed',
        source: 'download',
        url: 'https://www.agedm.io/play/20260210/1/2',
        pageUrl: 'https://www.agedm.io/play/20260210/1/2',
        provider: 'agedm',
        sourceClient: 'collection-page',
        title: '第02集',
        fileName: '第02集',
        thumbnailUrl: './assets/vidogo-empty.png',
        percent: 0,
        downloaded: '-',
        speed: '-',
        size: '-',
        time: now,
        createdAt: Date.now() - 3000,
        status: 'error',
        state: 'error',
        path: outputDir,
        savePath: outputDir,
        errorMessage: text('invalidDownloadOutput'),
      },
    ];
    renderDownloads();
    const previewType = String(window.mediaDeckSmokeVisualPreview || '').trim();
    if (['video', 'audio', 'image', 'subtitle'].includes(previewType)) {
      const extensions = { video: 'mp4', audio: 'mp3', image: 'jpg', subtitle: 'vtt' };
      void showMediaPreview({
        ...state.queue[2],
        id: `visual-preview-${previewType}`,
        assetType: previewType,
        fileName: `A descriptive local media title that is intentionally long for preview layout verification.${extensions[previewType]}`,
        path: `${taskDir1080}\\preview.${extensions[previewType]}`,
      });
    }
  }
  if (section === 'library') {
    const makeAsset = (projectKey, assetType, fileName, fileSize, options = {}) => ({
      id: `${projectKey}-${assetType}-${fileName}`,
      title: options.title || projectKey,
      provider: options.provider || 'youtube',
      mediaId: options.mediaId || projectKey,
      assetType,
      assetRole: options.assetRole || (assetType === 'image' ? 'cover' : 'primary'),
      status: options.status || 'available',
      fileSize,
      downloadedAt: options.downloadedAt || now,
      filePath: `C:\\SmokeDownloads\\${projectKey}\\${assetType}\\${fileName}`,
      folderPath: `C:\\SmokeDownloads\\${projectKey}`,
    });
    const makeProject = (id, title, provider, mediaId, assets, options = {}) => ({
      id, title, provider, mediaId, sourceGroupId: `${provider}:${mediaId}`,
      sourceUrl: `https://www.youtube.com/watch?v=${mediaId}`,
      folderPath: `C:\\SmokeDownloads\\${id}`,
      coverPath: assets.find((asset) => asset.assetRole === 'cover')?.filePath || null,
      updatedAt: options.updatedAt || now,
      downloadedAt: options.updatedAt || now,
      status: options.status || 'available',
      missingCount: options.status === 'partial' ? 1 : 0,
      totalSize: assets.reduce((sum, asset) => sum + asset.fileSize, 0),
      assetCount: assets.length,
      assetCounts: assets.reduce((counts, asset) => ({ ...counts, [asset.assetType]: counts[asset.assetType] + 1 }), { video: 0, audio: 0, image: 0, subtitle: 0 }),
      assets,
    });
    const swissAssets = [
      makeAsset('swiss', 'video', 'video-2160p-av1.webm', 147 * 1024 * 1024, { mediaId: 'Mpx3HPlyFZk' }),
      makeAsset('swiss', 'audio', 'audio-320k.mp3', 12 * 1024 * 1024, { mediaId: 'Mpx3HPlyFZk' }),
      makeAsset('swiss', 'image', 'cover.jpg', 340 * 1024, { mediaId: 'Mpx3HPlyFZk', assetRole: 'cover' }),
      makeAsset('swiss', 'subtitle', 'subtitle-zh-hans.vtt', 28 * 1024, { mediaId: 'Mpx3HPlyFZk' }),
    ];
    const tutorialAssets = [
      makeAsset('tutorial', 'video', 'video-2160p-vp9.webm', 255 * 1024 * 1024, { mediaId: 'PvSsT_kT_0w' }),
      makeAsset('tutorial', 'image', 'cover.jpg', 290 * 1024, { mediaId: 'PvSsT_kT_0w', assetRole: 'cover' }),
    ];
    const musicAssets = [
      makeAsset('music', 'audio', 'audio-320k.mp3', 8 * 1024 * 1024, { provider: 'tiktok', mediaId: 'music-42' }),
      makeAsset('music', 'image', 'cover.jpg', 210 * 1024, { provider: 'tiktok', mediaId: 'music-42', assetRole: 'cover' }),
    ];
    const galleryAssets = [
      makeAsset('gallery', 'image', 'image-01.jpg', 2 * 1024 * 1024, { provider: 'xiaohongshu', mediaId: 'gallery-7', assetRole: 'gallery' }),
      makeAsset('gallery', 'image', 'image-02.jpg', 3 * 1024 * 1024, { provider: 'xiaohongshu', mediaId: 'gallery-7', assetRole: 'gallery', status: 'missing' }),
    ];
    const interviewAssets = [
      makeAsset('interview', 'video', 'video-1080p-h264.mp4', 96 * 1024 * 1024, { mediaId: 'interview-5' }),
      makeAsset('interview', 'image', 'cover.jpg', 260 * 1024, { mediaId: 'interview-5', assetRole: 'cover' }),
    ];
    state.library = {
      ...state.library,
      loaded: true,
      loading: false,
      error: '',
      tab: 'projects',
      query: '',
      provider: 'all',
      assetType: 'all',
      timeRange: 'all',
      sort: 'recent',
      view: 'grid',
      projects: [
        makeProject('visual-swiss', '瑞士🇨🇭EP.2 🚂 冰河列車直達策馬特！馬特洪峰日照金山', 'youtube', 'Mpx3HPlyFZk', swissAssets),
        makeProject('visual-tutorial', '【宅男福利来了】PotPlayer + Whisper + Ollama 最详细教程', 'youtube', 'PvSsT_kT_0w', tutorialAssets),
        makeProject('visual-music', '城市夜行 · 音乐收藏', 'tiktok', 'music-42', musicAssets),
        makeProject('visual-gallery', '旅行图片合集', 'xiaohongshu', 'gallery-7', galleryAssets, { status: 'partial' }),
        makeProject('visual-interview', '创作者访谈 · 影像工作流', 'youtube', 'interview-5', interviewAssets),
      ],
    };
    state.library.items = logicalLibraryAssets();
    renderLibraryFilters();
    renderLibrary();
    const libraryPreview = String(window.mediaDeckSmokeVisualPreview || '').trim();
    if (libraryPreview === 'library-assets') {
      state.library.tab = 'assets';
      renderLibrary();
    } else if (libraryPreview === 'library-detail') {
      openLibraryDetail(state.library.projects[0].id);
    }
  }
  if (section === 'browser') {
    const tab = activeTab();
    if (tab) {
      state.mediaPanelVisible = true;
      setMediaCandidatesForTab(tab.id, [{
        id: 'visual-resolution-candidate',
        url: 'https://www.youtube.com/watch?v=visual-resolution-filter',
        pageUrl: tab.url,
        title: 'This Swiss Train Offers Stunning Views to Travelers',
        extension: 'webm',
        thumbnailUrl: './assets/youtube.ico',
        isRecommended: true,
        variants: [
          { url: 'https://www.youtube.com/watch?v=visual-resolution-filter', formatId: '401+251', extension: 'webm', resolution: 2160, qualityLabel: '2160p · AV1', videoCodec: 'AV1', sizeBytes: 6871947674 },
          { url: 'https://www.youtube.com/watch?v=visual-resolution-filter', formatId: '400+251', extension: 'webm', resolution: 1440, qualityLabel: '1440p · AV1', videoCodec: 'AV1', sizeBytes: 3435973837 },
          { url: 'https://www.youtube.com/watch?v=visual-resolution-filter', formatId: '399+251', extension: 'webm', resolution: 1080, qualityLabel: '1080p · AV1', videoCodec: 'AV1', sizeBytes: 1717986918 },
          { url: 'https://www.youtube.com/watch?v=visual-resolution-filter', formatId: '398+251', extension: 'webm', resolution: 720, qualityLabel: '720p · AV1', videoCodec: 'AV1', sizeBytes: 858993459 },
        ],
        assets: {
          audio: [{ id: 'audio-mp3', assetType: 'audio', assetRole: 'derived', extension: 'mp3' }],
          images: [{ id: 'cover', assetType: 'image', assetRole: 'cover', extension: 'jpg', url: './assets/youtube.ico' }],
          subtitles: [],
        },
        subtitleDiscoveryPending: true,
      }]);
      state.selectedMinimumResolutionByTabId[tab.id] = 1440;
      state.expandedCandidateIdsByTabId[tab.id] = ['visual-resolution-candidate'];
      renderCandidates();
      syncMediaPanelVisibility();
    }
  }
  if (section === 'history') {
    state.historyRange = 'all';
    state.history = [
      { title: 'YouTube', url: 'https://www.youtube.com/', time: now },
      { title: 'Vimeo', url: 'https://vimeo.com/', time: new Date(Date.now() - 3600000).toISOString() },
    ];
    renderHistory();
  }
  if (section === 'favorites') {
    state.favorites = [
      { title: 'YouTube', url: 'https://www.youtube.com/', time: now },
      { title: 'Vimeo', url: 'https://vimeo.com/', time: now },
    ];
    renderFavorites();
  }
  if (section === 'plans' || section === 'account') {
    state.account = null;
    state.accountMode = 'login';
    state.passwordPanelOpen = false;
    updateAccountCopy();
    renderPlans();
  }
}

function downloadAssetType(item = {}) {
  const declared = String(item.assetType || item.kind || '').trim().toLowerCase();
  if (['video', 'audio', 'image', 'subtitle'].includes(declared)) return declared;
  if (item.source === 'recording') return 'video';
  const fileName = String(item.fileName || item.path || item.url || '').split(/[?#]/, 1)[0].toLowerCase();
  const extension = fileName.match(/\.([a-z0-9]{2,8})$/)?.[1] || '';
  if (['mp3', 'm4a', 'aac', 'ogg', 'opus', 'wav', 'flac'].includes(extension)) return 'audio';
  if (['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif', 'bmp'].includes(extension)) return 'image';
  if (['srt', 'vtt', 'ass', 'ssa', 'ttml', 'srv3', 'lrc'].includes(extension)) return 'subtitle';
  return 'video';
}

function downloadAssetPresentation(assetType) {
  const presentations = {
    video: { label: text('assetVideo'), openLabel: text('previewVideo'), icon: 'view' },
    audio: { label: text('assetAudio'), openLabel: text('previewAudio'), icon: 'video-play' },
    image: { label: text('assetImage'), openLabel: text('previewImage'), icon: 'view' },
    subtitle: { label: text('assetSubtitle'), openLabel: text('openSubtitle'), icon: 'document' },
  };
  return presentations[assetType] || presentations.video;
}

function closeMediaPreview() {
  for (const media of els.mediaPreviewBody.querySelectorAll('video, audio')) {
    media.pause();
    media.removeAttribute('src');
    media.load();
  }
  els.mediaPreviewBody.replaceChildren();
  els.mediaPreviewOverlay.hidden = true;
  els.mediaPreviewDialog.dataset.previewType = '';
  els.mediaPreviewStatus.textContent = '';
  state.previewItem = null;
}

function containOverlayWheel(event, scrollSelector) {
  const scroller = event.target.closest(scrollSelector);
  if (!scroller) {
    event.preventDefault();
    event.stopPropagation();
    return;
  }
  const canScroll = scroller.scrollHeight > scroller.clientHeight + 1;
  const atTop = scroller.scrollTop <= 0;
  const atBottom = scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 1;
  if (!canScroll || (event.deltaY < 0 && atTop) || (event.deltaY > 0 && atBottom)) event.preventDefault();
  event.stopPropagation();
}

async function openPreviewInSystem() {
  if (!state.previewItem) return;
  const result = await window.mediaDeck.openDownloadedFile(state.previewItem).catch(() => ({ ok: false }));
  if (!result?.ok) toast(text('openFileFailed'), 'error');
}

async function showMediaPreview(item) {
  const assetType = downloadAssetType(item);
  const presentation = downloadAssetPresentation(assetType);
  const previewItem = { ...item, assetType };
  state.previewItem = previewItem;
  els.mediaPreviewOverlay.hidden = false;
  els.mediaPreviewDialog.dataset.previewType = assetType;
  els.mediaPreviewKind.textContent = presentation.label;
  els.mediaPreviewTitle.textContent = item.fileName || text('mediaPreview');
  els.mediaPreviewStatus.textContent = text('previewLoading');
  els.mediaPreviewBody.replaceChildren();
  const result = await window.mediaDeck.previewDownloadedFile(previewItem).catch(() => ({ ok: false }));
  if (state.previewItem !== previewItem) return;
  if (!result?.ok) {
    els.mediaPreviewStatus.textContent = text('openFileFailed');
    return;
  }
  const markUnsupported = () => {
    els.mediaPreviewStatus.textContent = text('previewUnsupported');
    els.mediaPreviewSystemOpen.focus();
  };
  let content;
  if (assetType === 'subtitle') {
    content = document.createElement('pre');
    content.className = 'media-preview-subtitle';
    content.textContent = String(result.text || '');
  } else if (assetType === 'image') {
    content = document.createElement('img');
    content.className = 'media-preview-image';
    content.alt = item.fileName || presentation.label;
    content.src = result.url;
    content.addEventListener('error', markUnsupported, { once: true });
  } else {
    content = document.createElement(assetType === 'audio' ? 'audio' : 'video');
    content.className = `media-preview-${assetType}`;
    content.controls = true;
    content.autoplay = true;
    content.preload = 'metadata';
    content.src = result.url;
    content.addEventListener('error', markUnsupported, { once: true });
    void content.play().catch(() => {});
  }
  els.mediaPreviewBody.replaceChildren(content);
  els.mediaPreviewStatus.textContent = '';
}

function renderDownloads() {
  const normalizedQueue = state.queue.map((item) => {
    let normalizedState = normalizeDownloadState(item.state || item.status);
    const hasOutputEvidence = item.completionVerified === true || (
      item.path
      && item.path !== state.settings.outputDir
      && item.path !== item.savePath
      && item.downloaded !== '-'
      && item.size !== '-'
    );
    if (normalizedState === 'completed' && !hasOutputEvidence) normalizedState = 'error';
    return {
      ...item,
      state: normalizedState,
      status: normalizedState,
      percent: normalizedState === 'error' && Number(item.percent) >= 100 ? 0 : item.percent,
      errorMessage: item.errorMessage,
      createdAt: item.createdAt || new Date(item.time || Date.now()).getTime(),
      time: item.time || new Date(item.createdAt || Date.now()).toISOString(),
      fileName: item.fileName || getFileName(item.title || item.path || item.url) || item.url,
      savePath: item.savePath || item.path || state.settings.outputDir,
      path: item.path || item.savePath || state.settings.outputDir,
    };
  });
  state.queue = normalizedQueue;
  updateDownloadBadge();
  const counts = {
    all: normalizedQueue.length,
    queued: normalizedQueue.filter((item) => ['queued', 'resolving', 'connecting', 'paused'].includes(item.state)).length,
    downloading: normalizedQueue.filter((item) => ['downloading', 'finalizing'].includes(item.state)).length,
    completed: normalizedQueue.filter((item) => item.state === 'completed').length,
    error: normalizedQueue.filter((item) => item.state === 'error').length,
  };
  els.retryFailedDownloads.hidden = counts.error === 0;
  els.retryFailedDownloads.disabled = state.retryingFailedDownloads || counts.error === 0;
  els.retryFailedDownloads.querySelector('span:last-child').textContent = state.retryingFailedDownloads
    ? els.retryFailedDownloads.querySelector('span:last-child').textContent
    : text('retryAllFailed');
  els.clearFinished.disabled = normalizedQueue.every((item) => !isTerminalDownloadState(item.state));
  els.downloadFilters.querySelectorAll('.downloads-tab').forEach((button) => {
    const status = button.dataset.status;
    button.classList.toggle('is-active', status === state.activeDownloadStatus);
    button.setAttribute('aria-selected', String(status === state.activeDownloadStatus));
    button.firstChild.textContent = `${text(status === 'all' ? 'all' : status)} `;
    button.querySelector('.downloads-tab-count').textContent = String(counts[status] || 0);
  });
  const rows = normalizedQueue
    .filter((item) => state.activeDownloadStatus === 'all'
      || item.state === state.activeDownloadStatus
      || (state.activeDownloadStatus === 'queued' && ['resolving', 'connecting', 'paused'].includes(item.state))
      || (state.activeDownloadStatus === 'downloading' && item.state === 'finalizing'))
    .filter((item) => isInRange(item.time, state.downloadRange));
  els.downloadHeader.hidden = rows.length === 0;
  if (!rows.length) {
    els.downloadBody.innerHTML = `<div class="downloads-empty menu-empty-state"><img class="app-empty-image" src="./assets/vidogo-empty.png" alt="" /></div>`;
    return;
  }
  const totalPages = Math.max(1, Math.ceil(rows.length / DOWNLOAD_PAGE_SIZE));
  state.downloadPage = Math.max(1, Math.min(state.downloadPage || 1, totalPages));
  const startIndex = (state.downloadPage - 1) * DOWNLOAD_PAGE_SIZE;
  const visibleRows = rows.slice(startIndex, startIndex + DOWNLOAD_PAGE_SIZE);
  const pagination = totalPages > 1 ? `
    <nav class="downloads-pagination" aria-label="${escapeHtml(text('downloads'))}">
      <button class="downloads-pagination-button el-button is-previous" type="button" data-download-page="prev" ${state.downloadPage <= 1 ? 'disabled' : ''} aria-label="${escapeHtml(text('previousPage'))}">
        ${iconSvg('arrow-left')}<span>${escapeHtml(text('previousPage'))}</span>
      </button>
      <span class="downloads-pagination-status">${escapeHtml(text('pageStatus', { current: state.downloadPage, total: totalPages }))}</span>
      <button class="downloads-pagination-button el-button is-next" type="button" data-download-page="next" ${state.downloadPage >= totalPages ? 'disabled' : ''} aria-label="${escapeHtml(text('nextPage'))}">
        ${iconSvg('arrow-right')}<span>${escapeHtml(text('nextPage'))}</span>
      </button>
    </nav>
  ` : '';
  els.downloadBody.innerHTML = visibleRows.map((item) => {
    const percent = Math.max(0, Math.min(100, Number(item.percent || 0)));
    const isResolving = item.state === 'resolving';
    const isConnecting = item.state === 'connecting';
    const id = escapeHtml(item.id || item.downloadId);
    const canOpen = item.state === 'completed' && item.path && item.path !== state.settings.outputDir;
    const canRetry = item.source !== 'recording' && ['error', 'cancelled'].includes(item.state);
    const canPause = item.source !== 'recording' && ['queued', 'resolving', 'connecting', 'downloading'].includes(item.state);
    const canResume = item.source !== 'recording' && item.state === 'paused';
    const resultDetails = item.state === 'error'
      ? userFacingDownloadError(item.errorMessage || text('invalidDownloadOutput'))
      : '--';
    const assetType = downloadAssetType(item);
    const assetPresentation = downloadAssetPresentation(assetType);
    const thumbnail = item.thumbnailUrl
      ? `<span class="download-thumbnail has-thumbnail"><img src="${escapeHtml(item.thumbnailUrl)}" alt="${escapeHtml(item.fileName)}" loading="lazy" /></span>`
      : `<span class="download-thumbnail" aria-hidden="true">${iconSvg(assetType === 'subtitle' ? 'document' : (assetType === 'image' ? 'view' : 'video-play'))}</span>`;
    const actionButtons = [
      canOpen ? `<button class="el-button" type="button" title="${escapeHtml(assetPresentation.openLabel)}" aria-label="${escapeHtml(assetPresentation.openLabel)}" data-preview="${id}">${iconSvg(assetPresentation.icon)}</button>` : '',
      item.savePath ? `<button class="el-button" type="button" title="${text('openFolder')}" aria-label="${text('openFolder')}" data-folder="${id}">${iconSvg('folder-opened')}</button>` : '',
      canPause ? `<button class="el-button" type="button" title="${text('pause')}" aria-label="${text('pause')}" data-pause="${id}">${iconSvg('pause')}</button>` : '',
      canResume ? `<button class="el-button" type="button" title="${text('resume')}" aria-label="${text('resume')}" data-resume="${id}">${iconSvg('video-play')}</button>` : '',
      canRetry ? `<button class="el-button" type="button" title="${text('retry')}" aria-label="${text('retry')}" data-retry="${id}">${iconSvg('refresh')}</button>` : '',
      `<button class="el-button" type="button" title="${text('remove')}" aria-label="${text('remove')}" data-remove="${id}">${iconSvg('delete')}</button>`,
    ].filter(Boolean).join('');
    return `
      <article class="downloads-row download-item-row">
        <div class="download-title-cell">
          ${thumbnail}
          <span class="download-file-name" title="${escapeHtml(item.fileName)}"><bdi>${escapeHtml(item.fileName)}</bdi></span>
        </div>
        <div class="download-type-cell is-${escapeHtml(assetType)}"><span>${escapeHtml(assetPresentation.label)}</span></div>
        <div class="download-progress-cell${isResolving || isConnecting ? ' is-resolving' : ''}">
          ${isResolving || isConnecting ? '' : `<div class="download-list-progress"><div class="download-progress-track"><span style="width:${percent}%"></span></div></div>
          <div class="download-progress-meta">
            <span class="download-progress-speed"><bdi>${escapeHtml(item.speed || item.downloaded || '-')}</bdi></span>
            <span class="download-progress-ratio"><bdi>${item.state === 'completed' && item.completionVerified ? '100' : Math.round(percent)}%</bdi></span>
          </div>`}
        </div>
        <div class="download-text-cell download-size-cell"><bdi>${isResolving || isConnecting ? '' : escapeHtml(item.downloaded || '0 B')}</bdi></div>
        <div class="download-text-cell download-size-cell"><bdi>${isResolving ? '' : escapeHtml(item.size || '-')}</bdi></div>
        <div class="download-text-cell download-time-cell" title="${escapeHtml(formatTime(item.time))}">${escapeHtml(formatTime(item.time))}</div>
        <div class="download-status-cell is-${escapeHtml(item.state)}" title="${escapeHtml(item.state === 'error' ? resultDetails : text(item.state))}">${escapeHtml(text(item.state))}</div>
        <div class="download-result-cell${item.state === 'error' ? ' has-error' : ''}" title="${escapeHtml(resultDetails)}"><bdi>${escapeHtml(resultDetails)}</bdi></div>
        <div class="download-actions-cell">${actionButtons}</div>
      </article>
    `;
  }).join('') + pagination;
  els.downloadBody.querySelectorAll('[data-download-page]').forEach((button) => {
    button.addEventListener('click', () => {
      const direction = button.dataset.downloadPage;
      state.downloadPage += direction === 'next' ? 1 : -1;
      renderDownloads();
    });
  });
  els.downloadBody.querySelectorAll('[data-preview]').forEach((button) => {
    button.addEventListener('click', () => {
      const item = state.queue.find((row) => (row.id || row.downloadId) === button.dataset.preview);
      if (!item) return;
      void showMediaPreview(item);
    });
  });
  els.downloadBody.querySelectorAll('[data-folder]').forEach((button) => {
    button.addEventListener('click', () => {
      const item = state.queue.find((row) => (row.id || row.downloadId) === button.dataset.folder);
      if (!item) return;
      void window.mediaDeck.openDownloadedFolder(item).then((result) => {
        if (!result?.ok) {
          toast(text('openFolderFailed'));
          return;
        }
        item.savePath = result.path || item.savePath;
        saveState();
        renderDownloads();
      }).catch(() => toast(text('openFolderFailed')));
    });
  });
  els.downloadBody.querySelectorAll('[data-retry]').forEach((button) => {
    button.addEventListener('click', () => {
      const item = state.queue.find((row) => (row.id || row.downloadId) === button.dataset.retry);
      if (!item?.url) return;
      void retryDownloadRow(item);
    });
  });
  els.downloadBody.querySelectorAll('[data-pause]').forEach((button) => {
    button.addEventListener('click', () => {
      const item = state.queue.find((row) => (row.id || row.downloadId) === button.dataset.pause);
      void controlDownloadRow(item, 'pause');
    });
  });
  els.downloadBody.querySelectorAll('[data-resume]').forEach((button) => {
    button.addEventListener('click', () => {
      const item = state.queue.find((row) => (row.id || row.downloadId) === button.dataset.resume);
      void controlDownloadRow(item, 'resume');
    });
  });
  els.downloadBody.querySelectorAll('[data-remove]').forEach((button) => {
    button.addEventListener('click', async () => {
      const row = state.queue.find((item) => (item.id || item.downloadId) === button.dataset.remove);
      if (row?.jobId && ['queued', 'resolving', 'connecting', 'downloading', 'finalizing'].includes(normalizeDownloadState(row.status || row.state))) {
        await window.mediaDeck.controlDownload({
          jobId: row.jobId,
          requestKey: row.requestKey || downloadRequestKey(row.url, row.formatId, assetRequestDiscriminator(row)),
          action: 'cancel',
        });
      } else if (row && ['queued', 'resolving', 'connecting', 'downloading', 'finalizing'].includes(normalizeDownloadState(row.status || row.state))) {
        await window.mediaDeck.controlDownload({
          requestKey: row.requestKey || downloadRequestKey(row.url, row.formatId, assetRequestDiscriminator(row)),
          action: 'cancel',
        });
      }
      state.queue = state.queue.filter((item) => (item.id || item.downloadId) !== button.dataset.remove);
      saveState();
      updateDownloadBadge();
      renderDownloads();
    });
  });
}

function renderHistory() {
  const rows = state.history.filter((item) => isInRange(item.time, state.historyRange));
  els.historyClear.disabled = state.history.length === 0;
  if (!rows.length) {
    els.historyList.innerHTML = `<div class="history-empty menu-empty-state"><img class="app-empty-image" src="./assets/vidogo-empty.png" alt="" /></div>`;
    return;
  }
  els.historyList.innerHTML = rows.map((item) => `
    <button class="history-row history-open" type="button" data-url="${escapeHtml(item.url)}">
      ${favoriteSiteIconMarkup(item)}
      <span class="history-content"><span class="history-title"><bdi>${escapeHtml(item.title)}</bdi></span><span class="history-url"><bdi>${escapeHtml(item.url)}</bdi></span></span>
      <time class="history-time">${escapeHtml(formatTime(item.time))}</time>
    </button>
  `).join('');
  els.historyList.querySelectorAll('.history-open').forEach((button) => {
    button.addEventListener('click', () => openUrl(button.dataset.url));
  });
  bindFaviconFallbacks(els.historyList);
}

function renderFavorites() {
  els.favoritesCount.textContent = String(state.favorites.length);
  const content = document.getElementById('favorites-content');
  if (!state.favorites.length) {
    content.innerHTML = `<div class="favorites-empty favorites-view-empty menu-empty-state"><img class="app-empty-image" src="./assets/vidogo-empty.png" alt="" /></div>`;
  } else {
    content.innerHTML = `<div class="favorites-view-list favorite-list">${state.favorites.map((item) => `
      <div class="favorite-row favorites-view-row">
        <button type="button" class="favorite-open-button history-open" data-url="${escapeHtml(item.url)}">
          ${favoriteSiteIconMarkup(item)}
          <span class="favorite-content"><span class="favorite-title"><bdi>${escapeHtml(item.title)}</bdi></span><span class="favorite-url"><bdi>${escapeHtml(item.url)}</bdi></span></span>
        </button>
        <button class="favorite-remove-button" type="button" data-favorite-remove="${escapeHtml(item.url)}" title="${text('remove')}" aria-label="${text('remove')}">${iconSvg('delete')}</button>
      </div>
    `).join('')}</div>`;
    content.querySelectorAll('.history-open').forEach((button) => button.addEventListener('click', () => openUrl(button.dataset.url)));
    content.querySelectorAll('[data-favorite-remove]').forEach((button) => {
      button.addEventListener('click', () => setFavorite(button.dataset.favoriteRemove, '', false));
    });
    bindFaviconFallbacks(content);
  }
  renderFavoritesPopover();
}

function renderFavoritesPopover() {
  const tab = activeTab();
  const currentIsFavorite = Boolean(tab?.url) && state.favorites.some((item) => item.url === tab.url);
  els.favoritesPopoverCount.textContent = String(state.favorites.length);
  els.favoriteCurrentButton.disabled = !tab?.url;
  els.favoriteCurrentLabel.textContent = text(currentIsFavorite ? 'removeCurrentFavorite' : 'addCurrentFavorite');
  setIcon(els.favoriteCurrentButton.querySelector('[data-icon]'), currentIsFavorite ? 'star-filled' : 'star');
  if (!state.favorites.length) {
    els.favoritesPopoverContent.innerHTML = `<div class="favorites-empty"><img class="app-empty-image is-popover" src="./assets/vidogo-empty.png" alt="" /></div>`;
    return;
  }
  els.favoritesPopoverContent.innerHTML = `<div class="favorites-list">${state.favorites.map((item) => `
    <div class="favorite-row">
      <button class="favorite-open-button" type="button" data-popover-favorite="${escapeHtml(item.url)}">
        ${favoriteSiteIconMarkup(item)}
        <span class="favorite-content"><span class="favorite-title"><bdi>${escapeHtml(item.title)}</bdi></span><span class="favorite-url"><bdi>${escapeHtml(item.url)}</bdi></span></span>
      </button>
      <button class="favorite-remove-button" type="button" data-popover-remove="${escapeHtml(item.url)}" title="${text('remove')}" aria-label="${text('remove')}">${iconSvg('delete')}</button>
    </div>
  `).join('')}</div>`;
  els.favoritesPopoverContent.querySelectorAll('[data-popover-favorite]').forEach((button) => {
    button.addEventListener('click', () => {
      setFavoritesPopoverOpen(false);
      openUrl(button.dataset.popoverFavorite);
    });
  });
  els.favoritesPopoverContent.querySelectorAll('[data-popover-remove]').forEach((button) => {
    button.addEventListener('click', () => setFavorite(button.dataset.popoverRemove, '', false));
  });
  bindFaviconFallbacks(els.favoritesPopoverContent);
}

function normalizePlanLevel(value) {
  const normalized = value === 'flagship' ? 'ultimate' : String(value || '');
  if (normalized === 'owner') return 'owner';
  return PLAN_LEVELS.includes(normalized) ? normalized : 'free';
}

function formatPlanCurrency(amount, currency = 'USD') {
  try {
    return new Intl.NumberFormat(state.locale, { style: 'currency', currency }).format(amount);
  } catch {
    return `${currency} ${amount}`;
  }
}

function planBillingLabel(billing) {
  if (billing === 1) return text('month');
  if (billing === 2) return text('year');
  return text('once');
}

function formatPlanProduct(code) {
  const product = PLAN_PRODUCTS[code] || PLAN_PRODUCTS.ultimate_month;
  const price = formatPlanCurrency(product.amount, product.currency);
  return product.billing === 0 ? `${price} ${text('once')}` : `${price} / ${planBillingLabel(product.billing)}`;
}

function planChoices(level) {
  if (level === 'pro') return [PLAN_PRODUCTS.pro_month, PLAN_PRODUCTS.pro_year];
  if (level === 'ultimate') return [PLAN_PRODUCTS.ultimate_month, PLAN_PRODUCTS.ultimate_year];
  if (level === 'lifetime') return [PLAN_PRODUCTS.lifetime];
  return [];
}

function planCardPrice(level) {
  if (level === 'free') return formatPlanCurrency(0, 'USD');
  if (level === 'lifetime') return formatPlanProduct('lifetime');
  return text('fromPrice', { price: formatPlanProduct(`${level}_month`) });
}

function formatDailyPlanLimit(limit) {
  return limit === null ? text('unlimited') : text('timesPerDay', { count: limit });
}

function formatRecordingPlanLimit(minutes) {
  return minutes === null ? text('unlimited') : text('minutes', { count: minutes });
}

function planFeature(enabled, label = '') {
  return { kind: 'feature', enabled, label };
}

function renderPlans() {
  const selected = getSelectedPlan();
  const currentLevel = state.account?.email ? normalizePlanLevel(state.account.plan) : null;
  els.planCards.innerHTML = `
    <div class="account-plan-grid-label">${text('tableFeature')}</div>
    ${PLAN_LEVELS.map((level) => {
      const choices = planChoices(level);
      const isCurrent = currentLevel === level;
      return `
        <article class="account-plan-card${selected.level === level ? ' is-selected' : ''}${isCurrent ? ' is-current' : ''}" data-plan-level="${level}">
          <div class="account-plan-card-header"><span>${escapeHtml(text(level))}</span><strong><bdi>${escapeHtml(planCardPrice(level))}</bdi></strong></div>
          ${isCurrent
            ? `<span class="account-current-plan">${text('currentPlan')}</span>`
            : (level === 'free'
              ? `<span class="plan-tag">${text('included')}</span>`
              : `<div class="account-plan-options">${choices.map((choice) => `<button class="account-plan-option${selected.code === choice.code ? ' is-active' : ''}" data-plan-code="${choice.code}" type="button"><span>${escapeHtml(planBillingLabel(choice.billing))}</span><bdi>${escapeHtml(formatPlanProduct(choice.code))}</bdi></button>`).join('')}</div>`)}
        </article>
      `;
    }).join('')}
  `;
  document.getElementById('purchase-current').textContent = selected.code === 'lifetime'
    ? text('lifetime')
    : `${text(selected.level)} ${selected.billingLabel}`;
  els.purchasePrice.textContent = selected.price;
  els.purchaseButton.innerHTML = `${iconSvg(state.account?.email ? 'shopping-cart' : 'lock')}<span>${escapeHtml(text(state.account?.email ? 'payNow' : 'purchase'))}</span>`;
  els.paymentChannels.forEach((button) => button.classList.toggle('is-active', button.dataset.paymentChannel === state.paymentChannel));
  els.payssionMethod.classList.toggle('hidden', state.paymentChannel !== 'payssion');

  const rows = [
    { key: 'monthlyPrice', values: [formatPlanCurrency(0), formatPlanProduct('pro_month'), formatPlanProduct('ultimate_month'), text('none')] },
    { key: 'yearlyPrice', values: [text('none'), formatPlanProduct('pro_year'), formatPlanProduct('ultimate_year'), text('none')] },
    { key: 'lifetimePrice', values: [text('none'), text('none'), text('none'), formatPlanProduct('lifetime')] },
    { key: 'yearlySavings', values: [text('none'), text('savings40'), text('savings45'), text('none')] },
    { key: 'dailyDownloadsRecording', values: PLAN_LEVELS.map((level) => formatDailyPlanLimit(PLAN_LIMITS[level].dailyDownloadLimit)) },
    { key: 'concurrentDownloads', values: PLAN_LEVELS.map((level) => String(PLAN_LIMITS[level].maxConcurrentDownloads)) },
    { key: 'recordingDuration', values: PLAN_LEVELS.map((level) => formatRecordingPlanLimit(PLAN_LIMITS[level].recordingMinutes)) },
    { key: 'mediaLibrary', values: PLAN_LEVELS.map((level) => text(PLAN_LIMITS[level].mediaLibrary)) },
    { key: 'drmSupport', values: PLAN_LEVELS.map(() => planFeature(true)) },
    { key: 'futureUpdates', values: [planFeature(false), planFeature(true), planFeature(true), planFeature(true, text('lifetimeFree'))] },
    { key: 'prioritySupport', values: [planFeature(false), planFeature(false), planFeature(true), planFeature(true)] },
  ];
  els.planTable.setAttribute('aria-label', text('comparisonTitle'));
  els.planTable.innerHTML = `
    <div class="account-comparison-row account-comparison-header"><div>${text('tableFeature')}</div>${PLAN_LEVELS.map((level) => `<div class="${level === selected.level ? 'is-selected-plan' : ''}">${escapeHtml(text(level))}</div>`).join('')}</div>
    ${rows.map((row) => `<div class="account-comparison-row" data-plan-comparison="${row.key}"><div>${escapeHtml(text(row.key))}</div>${row.values.map((value, index) => {
      const selectedClass = PLAN_LEVELS[index] === selected.level ? 'is-selected-plan' : '';
      const content = value?.kind === 'feature'
        ? `<span class="account-feature-cell ${value.enabled ? 'is-enabled' : 'is-disabled'}">${iconSvg(value.enabled ? 'circle-check' : 'circle-close')}${value.label ? `<span>${escapeHtml(value.label)}</span>` : ''}</span>`
        : `<bdi>${escapeHtml(value)}</bdi>`;
      return `<div class="${selectedClass}">${content}</div>`;
    }).join('')}</div>`).join('')}
  `;
  els.planCards.querySelectorAll('[data-plan-code]').forEach((button) => {
    button.addEventListener('click', () => {
      state.selectedPlan = button.dataset.planCode;
      renderPlans();
      saveState();
    });
  });
}

function findLocalUser(email) {
  const normalizedEmail = String(email || '').trim().toLowerCase();
  return state.users.find((user) => String(user.email || '').toLowerCase() === normalizedEmail) || null;
}

function upsertLocalUser(user) {
  const normalizedEmail = String(user.email || '').trim().toLowerCase();
  state.users = [
    { ...user, email: normalizedEmail, updatedAt: new Date().toISOString() },
    ...state.users.filter((item) => String(item.email || '').toLowerCase() !== normalizedEmail),
  ].slice(0, 300);
}

function getSelectedPlan() {
  const requestedCode = String(state.selectedPlan || 'ultimate_month').replace(/^flagship_/, 'ultimate_');
  const product = PLAN_PRODUCTS[requestedCode] || PLAN_PRODUCTS.ultimate_month;
  return {
    code: product.code,
    level: product.level,
    billingLabel: planBillingLabel(product.billing),
    price: formatPlanProduct(product.code),
  };
}

function updateAccountCopy() {
  document.getElementById('account-title').textContent = text('accountTitle');
  document.getElementById('account-subtitle').textContent = state.account?.email ? text('signedInDescription') : text('signedOutDescription');
  const page = els.pages.account;
  page.querySelector('.login-title').textContent = text(state.accountMode === 'login' ? 'login' : 'registerTitle');
  page.querySelector('.login-subtitle').textContent = text(state.accountMode === 'login' ? 'loginSubtitle' : 'registerSubtitle');
  const labels = page.querySelectorAll('.field > span:first-child');
  labels[0].textContent = text('email');
  labels[1].textContent = text('password');
  document.getElementById('confirm-password-label').textContent = text('confirmPassword');
  els.loginEmail.placeholder = text('emailPlaceholder');
  els.loginPassword.placeholder = text('passwordPlaceholder');
  els.confirmPassword.placeholder = text('confirmPasswordPlaceholder');
  els.loginButton.textContent = text('login');
  els.registerButton.textContent = text('register');
  els.registerModeButton.textContent = text('register');
  els.loginModeButton.textContent = text('backToLogin');
  document.getElementById('account-refresh-label').textContent = text('refresh');
  document.getElementById('logout-button-label').textContent = text('logout');
  document.getElementById('account-view-plans-label').textContent = text('viewPlans');
  document.getElementById('account-change-password-label').textContent = text('changePassword');
  document.getElementById('password-title').textContent = text('passwordTitle');
  document.getElementById('password-subtitle').textContent = text('passwordSubtitle');
  document.getElementById('old-password-label').textContent = text('oldPassword');
  document.getElementById('new-password-label').textContent = text('newPassword');
  els.savePasswordButton.textContent = text('savePassword');
  els.cancelPasswordButton.textContent = text('cancel');
  els.passwordVisibilityToggles.forEach((button) => {
    const target = document.getElementById(button.dataset.passwordTarget || '');
    const label = text(target?.type === 'text' ? 'hidePassword' : 'showPassword');
    button.setAttribute('aria-label', label);
    button.title = label;
  });
  document.getElementById('profile-title').textContent = text('profileTitle');
  document.getElementById('profile-subtitle').textContent = text('profileSubtitle');
  document.getElementById('profile-email-label').textContent = text('email');
  document.getElementById('profile-plan-label').textContent = text('currentPlan');
  document.getElementById('profile-quota-label').textContent = text('todayDownloads');
  document.getElementById('orders-title').textContent = text('ordersTitle');
  document.getElementById('orders-subtitle').textContent = text('ordersSubtitle');
  renderAccount();
}

function renderAccount() {
  const signedIn = Boolean(state.account?.email);
  els.accountAuthPanel.classList.toggle('hidden', signedIn);
  els.accountProfilePanel.classList.toggle('hidden', !signedIn);
  els.accountOrdersPanel.classList.toggle('hidden', !signedIn);
  els.accountRefresh.classList.toggle('hidden', !signedIn);
  els.confirmPasswordField.classList.toggle('hidden', state.accountMode !== 'register');
  els.loginButton.classList.toggle('hidden', state.accountMode !== 'login');
  els.registerModeButton.classList.toggle('hidden', state.accountMode !== 'login');
  els.registerButton.classList.toggle('hidden', state.accountMode !== 'register');
  els.loginModeButton.classList.toggle('hidden', state.accountMode !== 'register');
  els.accountPasswordPanel.classList.toggle('hidden', !signedIn || !state.passwordPanelOpen);
  if (signedIn) {
    document.getElementById('profile-email').textContent = state.account.email;
    const planLevel = normalizePlanLevel(state.account.plan);
    document.getElementById('profile-plan').textContent = text(planLevel);
    const quota = PLAN_LIMITS[planLevel].dailyDownloadLimit;
    const usedToday = state.entitlements?.identity === `account:${String(state.account.email).toLowerCase()}`
      ? Math.max(0, Number(state.entitlements.usedToday) || 0)
      : 0;
    document.getElementById('profile-quota').textContent = `${usedToday} / ${quota === null ? text('unlimited') : quota}`;
  }
  updateTitlebarAccount();
  renderOrders();
}

function renderOrders() {
  const visibleOrders = state.orders;
  if (!visibleOrders.length) {
    els.ordersList.innerHTML = `<div class="account-empty">${text('noOrders')}</div>`;
    return;
  }
  els.ordersList.innerHTML = visibleOrders.map((order) => `
    <div class="account-order-row">
      <div><strong>${escapeHtml(text(order.level || order.plan))}</strong><span>${escapeHtml(order.provider || order.channel || 'payment')}</span></div>
      <bdi>${escapeHtml(order.amountCents === undefined ? order.amount : formatPlanCurrency(order.amountCents / 100, order.currency))}</bdi>
      <time>${escapeHtml(formatTime(order.createdAt || order.time))}</time>
      <span class="account-order-status">${escapeHtml(text(order.status) || order.status)}</span>
    </div>
  `).join('');
}

function setAccountMode(mode) {
  state.accountMode = mode === 'register' ? 'register' : 'login';
  clearAccountAuthError();
  renderAccount();
}

let accountAuthPending = false;

function clearAccountAuthError() {
  els.accountAuthError.hidden = true;
  els.accountAuthErrorCopy.textContent = '';
  els.loginEmail.removeAttribute('aria-invalid');
  els.loginPassword.removeAttribute('aria-invalid');
  els.confirmPassword.removeAttribute('aria-invalid');
}

function showAccountAuthError(message, fields = []) {
  clearAccountAuthError();
  els.accountAuthErrorCopy.textContent = String(message || text('loginFailed'));
  els.accountAuthError.hidden = false;
  fields.forEach((field) => field?.setAttribute('aria-invalid', 'true'));
}

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
}

async function submitLocalLogin() {
  if (accountAuthPending) return;
  const email = els.loginEmail.value.trim();
  if (!isEmail(email)) return showAccountAuthError(text('invalidEmail'), [els.loginEmail]);
  if (!els.loginPassword.value) return showAccountAuthError(text('passwordRequired'), [els.loginPassword]);
  clearAccountAuthError();
  accountAuthPending = true;
  els.loginButton.disabled = true;
  try {
    const data = await window.mediaDeck.loginAccount({ email, password: els.loginPassword.value });
    state.account = data?.user || {};
    els.loginPassword.value = '';
    await refreshRemoteAccount();
    await syncRecordingConfiguration();
    toast(text('loginSuccess'));
  } catch (error) {
    showAccountAuthError(text('loginFailed'), [els.loginEmail, els.loginPassword]);
  } finally {
    accountAuthPending = false;
    els.loginButton.disabled = false;
  }
}

async function runAccountUiFlowTest() {
  const failures = [];
  const assert = (condition, message) => { if (!condition) failures.push(message); };
  state.account = {};
  state.accountMode = 'login';
  state.passwordPanelOpen = false;
  setSection('account');
  updateAccountCopy();
  els.loginEmail.value = 'moote@gmail.com';
  els.loginPassword.value = 'definitely-wrong';
  await Promise.all(Array.from({ length: 12 }, () => submitLocalLogin()));
  assert(els.accountAuthError.hidden === false, 'Wrong-password error was not shown inline');
  assert(els.accountAuthErrorCopy.textContent === text('loginFailed'), 'Wrong-password error exposed an internal IPC message');
  assert(els.loginEmail.getAttribute('aria-invalid') === 'true' && els.loginPassword.getAttribute('aria-invalid') === 'true', 'Invalid account fields were not highlighted');
  assert(els.loginButton.disabled === false, 'Login button stayed disabled after the request');
  assert(els.toastRegion.children.length === 0, 'Wrong-password attempts created duplicate global toasts');
  const eye = els.passwordVisibilityToggles.find((button) => button.dataset.passwordTarget === 'login-password');
  eye?.click();
  assert(els.loginPassword.type === 'text', 'Password visibility button did not reveal the password');
  eye?.click();
  assert(els.loginPassword.type === 'password', 'Password visibility button did not restore masking');
  toast(text('noUrls'), 'warning');
  return { ok: failures.length === 0, failures, inlineError: els.accountAuthErrorCopy.textContent, toastCount: els.toastRegion.children.length };
}

async function submitLocalRegister() {
  if (accountAuthPending) return;
  const email = els.loginEmail.value.trim();
  if (!isEmail(email)) return showAccountAuthError(text('invalidEmail'), [els.loginEmail]);
  if (!els.loginPassword.value) return showAccountAuthError(text('passwordRequired'), [els.loginPassword]);
  if (els.loginPassword.value.length < 10 || els.loginPassword.value.length > 128) return showAccountAuthError(text('passwordRequired'), [els.loginPassword]);
  if (els.loginPassword.value !== els.confirmPassword.value) return showAccountAuthError(text('passwordMismatch'), [els.loginPassword, els.confirmPassword]);
  clearAccountAuthError();
  accountAuthPending = true;
  els.registerButton.disabled = true;
  try {
    await window.mediaDeck.registerAccount({ email, password: els.loginPassword.value });
    state.account = {};
    els.loginPassword.value = '';
    els.confirmPassword.value = '';
    state.accountMode = 'login';
    updateAccountCopy();
    toast(text('registerSuccess'));
  } catch (error) {
    showAccountAuthError(text('loginFailed'), [els.loginEmail, els.loginPassword]);
  } finally {
    accountAuthPending = false;
    els.registerButton.disabled = false;
  }
}

async function submitLocalPurchase() {
  if (!state.account?.email) {
    setSection('account');
    return toast(text('accountPending'));
  }
  const selected = getSelectedPlan();
  try {
    const data = await window.mediaDeck.createAccountOrder(selected.code);
    const order = data?.order;
    if (order) state.orders = [order, ...state.orders.filter((item) => item.id !== order.id)];
    renderPlans();
    updateAccountCopy();
    const didOpen = order?.checkoutUrl ? await window.mediaDeck.openExternal(order.checkoutUrl) : false;
    toast(text(didOpen ? 'paymentStarted' : 'paymentOpenFailed'));
  } catch (error) {
    toast(error?.message || text('paymentOpenFailed'));
  }
}

function removeLocalOrder(orderId) {
  state.orders = state.orders.filter((order) => order.id !== orderId);
  saveState();
  renderOrders();
  toast(text('orderRemoved'));
}

async function submitPasswordChange() {
  if (!state.account?.email) return;
  if (!els.oldPassword.value || !els.newPassword.value) return toast(text('passwordRequired'));
  try {
    await window.mediaDeck.changeAccountPassword({ currentPassword: els.oldPassword.value, newPassword: els.newPassword.value });
    els.oldPassword.value = '';
    els.newPassword.value = '';
    state.passwordPanelOpen = false;
    renderAccount();
    toast(text('passwordChanged'));
  } catch (error) {
    toast(error?.message || text('wrongPassword'));
  }
}

async function refreshRemoteAccount() {
  const current = await window.mediaDeck.getCurrentAccount();
  state.account = current?.user || {};
  state.orders = state.account?.email ? ((await window.mediaDeck.listAccountOrders())?.orders || []) : [];
  updateAccountCopy();
  renderPlans();
  return state.account;
}

function normalizeToastMessage(message) {
  return String(message || '')
    .replace(/^Error invoking remote method '[^']+':\s*(?:Error:\s*)?/i, '')
    .replace(/^Error:\s*/i, '')
    .trim();
}

function inferToastKind(message) {
  const copy = String(message || '').toLowerCase();
  if (/(error|failed|failure|incorrect|invalid|unable|cannot|can't|错误|失败|不正确|无法)/i.test(copy)) return 'error';
  if (/(success|saved|completed|started|updated|成功|已保存|已完成|已更新|已开始)/i.test(copy)) return 'success';
  if (/(please|required|need|unavailable|请|需要|必须|暂无)/i.test(copy)) return 'warning';
  return 'info';
}

function toast(message, requestedKind = '') {
  const copy = normalizeToastMessage(message);
  if (!copy) return;
  const kind = ['info', 'success', 'warning', 'error'].includes(requestedKind)
    ? requestedKind
    : inferToastKind(copy);
  const key = `${kind}:${copy}`;
  const existing = Array.from(els.toastRegion.children).find((item) => item.dataset.toastKey === key);
  const scheduleRemoval = (item) => {
    window.clearTimeout(item.__removeTimer);
    item.__removeTimer = window.setTimeout(() => item.remove(), kind === 'error' ? 6000 : 4500);
  };
  if (existing) {
    existing.classList.remove('is-repeated');
    void existing.offsetWidth;
    existing.classList.add('is-repeated');
    scheduleRemoval(existing);
    return;
  }
  const item = document.createElement('div');
  const icon = document.createElement('span');
  const body = document.createElement('span');
  const detail = document.createElement('span');
  item.className = `toast toast-${kind}`;
  item.dataset.toastKey = key;
  item.setAttribute('role', kind === 'error' ? 'alert' : 'status');
  icon.className = 'toast-icon';
  icon.dataset.icon = kind === 'success' ? 'circle-check' : (kind === 'error' ? 'circle-close' : 'info-filled');
  body.className = 'toast-copy';
  detail.textContent = copy;
  body.append(detail);
  item.append(icon, body);
  els.toastRegion.appendChild(item);
  window.VidoGoIcons?.mount(icon, icon.dataset.icon);
  while (els.toastRegion.children.length > 3) els.toastRegion.firstElementChild?.remove();
  scheduleRemoval(item);
}

function setExternalLoginStatus(message, kind = '') {
  els.externalLoginStatus.textContent = String(message || '');
  els.externalLoginStatus.classList.toggle('is-busy', kind === 'busy');
  els.externalLoginStatus.classList.toggle('is-error', kind === 'error');
  els.externalLoginStatus.classList.toggle('is-success', kind === 'success');
}

function syncExternalLoginControls() {
  els.externalLoginBrowser.disabled = state.externalLoginBusy;
  els.externalLoginReopen.disabled = state.externalLoginBusy;
  els.externalLoginSync.disabled = state.externalLoginBusy || !state.externalLoginCanSync;
}

function showExternalLoginDialog(payload = null) {
  els.externalLoginOverlay.hidden = false;
  if (SUPPORTED_EXTERNAL_LOGIN_BROWSERS.has(payload?.browser)) els.externalLoginBrowser.value = payload.browser;
  if (payload?.error) {
    state.externalLoginCanSync = false;
    setExternalLoginStatus(text('externalLoginFailed', { message: externalLoginErrorMessage(payload.error) }), 'error');
  } else {
    if (payload?.opened) state.externalLoginCanSync = true;
    setExternalLoginStatus(text('externalLoginWaiting'));
  }
  syncExternalLoginControls();
  queueMicrotask(() => els.externalLoginBrowser.focus());
}

function hideExternalLoginDialog() {
  if (state.externalLoginBusy) return;
  els.externalLoginOverlay.hidden = true;
}

function externalLoginErrorMessage(error) {
  const raw = String(error?.message || error || '').trim();
  if (/no (?:google|usable)|no .*cookies? (?:were )?found|could not find.*cookies?/i.test(raw)) {
    return `${text('externalLoginNoCookies')} (${raw})`;
  }
  return raw || text('externalLoginNoCookies');
}

async function beginExternalLogin() {
  showExternalLoginDialog();
  state.externalLoginCanSync = false;
  state.externalLoginBusy = true;
  syncExternalLoginControls();
  setExternalLoginStatus(text('externalLoginOpening'), 'busy');
  try {
    const result = await window.mediaDeck.startExternalYouTubeLogin({ browser: els.externalLoginBrowser.value });
    if (SUPPORTED_EXTERNAL_LOGIN_BROWSERS.has(result?.browser)) els.externalLoginBrowser.value = result.browser;
    state.externalLoginCanSync = result?.opened === true;
    setExternalLoginStatus(text('externalLoginWaiting'));
  } catch (error) {
    state.externalLoginCanSync = false;
    setExternalLoginStatus(text('externalLoginFailed', { message: externalLoginErrorMessage(error) }), 'error');
  } finally {
    state.externalLoginBusy = false;
    syncExternalLoginControls();
  }
}

async function syncExternalLogin() {
  if (state.externalLoginBusy || !state.externalLoginCanSync) return;
  state.externalLoginBusy = true;
  syncExternalLoginControls();
  setExternalLoginStatus(text('externalLoginSyncing'), 'busy');
  let successMessage = '';
  try {
    const result = await window.mediaDeck.syncExternalBrowserLogin({
      browser: els.externalLoginBrowser.value,
    });
    const imported = Number(result?.imported || 0);
    successMessage = text('externalLoginSuccess', { count: imported });
    setExternalLoginStatus(successMessage, 'success');
    state.externalLoginCanSync = false;
    const tab = activeTab();
    if (tab?.webview) {
      resetTabMediaForNavigation(tab);
      void tab.webview.loadURL(HOME_URL).catch(() => null);
    }
  } catch (error) {
    const message = text('externalLoginFailed', { message: externalLoginErrorMessage(error) });
    setExternalLoginStatus(message, 'error');
  } finally {
    state.externalLoginBusy = false;
    syncExternalLoginControls();
  }
  if (successMessage) {
    hideExternalLoginDialog();
    toast(successMessage, 'success');
  }
}

function bindEvents() {
  bindPlatformManagerEvents();
  els.browserLoginButton.addEventListener('click', () => void beginExternalLogin());
  els.externalLoginClose.addEventListener('click', hideExternalLoginDialog);
  els.externalLoginReopen.addEventListener('click', () => void beginExternalLogin());
  els.externalLoginSync.addEventListener('click', () => void syncExternalLogin());
  els.externalLoginOverlay.addEventListener('click', (event) => {
    if (event.target === els.externalLoginOverlay) hideExternalLoginDialog();
  });
  els.mediaPreviewClose.addEventListener('click', closeMediaPreview);
  els.mediaPreviewSystemOpen.addEventListener('click', () => void openPreviewInSystem());
  els.mediaPreviewOverlay.addEventListener('click', (event) => {
    if (event.target === els.mediaPreviewOverlay) closeMediaPreview();
  });
  els.mediaPreviewOverlay.addEventListener('wheel', (event) => containOverlayWheel(event, '.media-preview-body'), { passive: false, capture: true });
  els.titlebarAccount?.addEventListener('click', () => setSection('account'));
  els.sidebar.forEach((button) => button.addEventListener('click', () => setSection(button.dataset.section)));
  els.browserStatusDownloads.addEventListener('click', () => setSection('downloads'));
  els.libraryRefresh.addEventListener('click', () => void loadMediaLibrary({ refresh: true, announce: true }));
  els.libraryTabs.addEventListener('click', (event) => {
    const tab = event.target.closest('[data-library-tab]');
    if (!tab) return;
    state.library.tab = tab.dataset.libraryTab === 'assets' ? 'assets' : 'projects';
    renderLibrary();
  });
  els.librarySearch.addEventListener('input', () => {
    state.library.query = els.librarySearch.value;
    renderLibrary();
  });
  els.libraryProviderFilter.addEventListener('change', () => {
    state.library.provider = els.libraryProviderFilter.value;
    renderLibrary();
  });
  els.libraryTypeFilter.addEventListener('change', () => {
    state.library.assetType = els.libraryTypeFilter.value;
    renderLibrary();
  });
  els.libraryTimeFilter.addEventListener('change', () => {
    state.library.timeRange = els.libraryTimeFilter.value;
    renderLibrary();
  });
  els.librarySort.addEventListener('change', () => {
    state.library.sort = els.librarySort.value;
    renderLibrary();
  });
  els.libraryGridView.addEventListener('click', () => {
    state.library.view = 'grid';
    renderLibrary();
  });
  els.libraryListView.addEventListener('click', () => {
    state.library.view = 'list';
    renderLibrary();
  });
  els.libraryContent.addEventListener('click', (event) => {
    const action = event.target.closest('[data-library-asset-action]');
    if (action) {
      void handleLibraryAction(action.dataset.libraryAssetAction, action.dataset.libraryAssetId, action);
      return;
    }
    const projectImport = event.target.closest('[data-library-project-import]');
    if (projectImport) {
      void handleLibraryProjectImport(projectImport.dataset.libraryProjectImport, projectImport);
      return;
    }
    const project = event.target.closest('[data-library-project]');
    if (project) return openLibraryDetail(project.dataset.libraryProject);
    if (event.target.closest('[data-library-browse]')) setSection('home');
  });
  els.libraryDetailBody.addEventListener('click', (event) => {
    const assetAction = event.target.closest('[data-library-asset-action]');
    if (assetAction) {
      void handleLibraryAction(assetAction.dataset.libraryAssetAction, assetAction.dataset.libraryAssetId, assetAction);
      return;
    }
    const projectAction = event.target.closest('[data-library-project-action]');
    if (projectAction) void handleLibraryProjectAction(projectAction.dataset.libraryProjectAction);
  });
  els.libraryDetailClose.addEventListener('click', closeLibraryDetail);
  els.libraryDetailScrim.addEventListener('click', closeLibraryDetail);
  els.libraryDetailOverlay.addEventListener('wheel', (event) => containOverlayWheel(event, '.library-detail-body'), { passive: false, capture: true });
  els.settingsNav.forEach((button) => button.addEventListener('click', () => setSettingsSection(button.dataset.settingsSection)));
  els.settingsEditor.addEventListener('change', () => void changeDefaultEditingApp());
  els.settingsEditorScan.addEventListener('click', () => void scanEditingApps());
  els.settingsEditorChoose.addEventListener('click', () => void chooseEditingApp());
  els.tabAdd.addEventListener('click', () => setSection('home'));
  els.tabStrip.addEventListener('wheel', (event) => {
    if (els.tabStrip.scrollWidth <= els.tabStrip.clientWidth || Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
    event.preventDefault();
    els.tabStrip.scrollLeft += event.deltaY;
  }, { passive: false });
  els.back.addEventListener('click', () => activeTab()?.webview.goBack());
  els.forward.addEventListener('click', () => activeTab()?.webview.goForward());
  els.reload.addEventListener('click', () => {
    const tab = activeTab();
    if (!tab?.webview) return;
    if (tab.loading) tab.webview.stop();
    else {
      resetTabMediaForNavigation(tab);
      tab.webview.reload();
    }
  });
  els.browserQuality.addEventListener('change', () => {
    state.selectedMinimumResolutionByTabId[state.activeTabId] = Number.parseInt(els.browserQuality.value, 10) || 0;
    renderCandidates();
  });
  els.downloadQuality.addEventListener('change', () => {
    state.settings.resolution = els.downloadQuality.value;
    syncSettingsControls();
    saveState();
  });
  els.playlistToggle.addEventListener('change', () => {
    state.settings.playlist = els.playlistToggle.checked;
    saveState();
  });
  els.audioToggle.addEventListener('change', () => {
    state.settings.audioOnly = els.audioToggle.checked;
    saveState();
  });
  els.chooseOutput.addEventListener('click', async () => {
    const dir = await window.mediaDeck.chooseDirectory();
    if (!dir) return;
    state.settings.outputDir = dir;
    syncSettingsControls();
    saveState();
    await syncRecordingConfiguration();
  });
  els.settingsChooseOutput.addEventListener('click', async () => {
    const dir = await window.mediaDeck.chooseDirectory();
    if (!dir) return;
    state.settings.outputDir = dir;
    syncSettingsControls();
    saveState();
    await syncRecordingConfiguration();
    toast(text('saved'));
  });
  els.settingsResetOutput.addEventListener('click', async () => {
    state.settings.outputDir = await window.mediaDeck.getDefaultDownloadDir();
    syncSettingsControls();
    saveState();
    await syncRecordingConfiguration();
    toast(text('saved'));
  });
  els.settingsConcurrency.addEventListener('change', () => {
    updateConcurrentDownloads(els.settingsConcurrency.value);
  });
  els.settingsConcurrencyDecrease.addEventListener('click', () => updateConcurrentDownloads(state.settings.maxConcurrentDownloads - 1));
  els.settingsConcurrencyIncrease.addEventListener('click', () => updateConcurrentDownloads(state.settings.maxConcurrentDownloads + 1));
  els.settingsConcurrencyPlans.addEventListener('click', () => setSection('plans'));
  els.settingsRecording.addEventListener('change', async () => {
    state.settings.recordingEnabled = els.settingsRecording.checked;
    saveState();
    await syncRecordingConfiguration();
    syncSettingsControls();
    toast(text('saved'));
  });
  els.settingsAdBlock.addEventListener('change', async () => {
    state.settings.adBlocker = els.settingsAdBlock.checked;
    await window.mediaDeck.setAdBlockerEnabled(state.settings.adBlocker);
    syncSettingsControls();
    saveState();
    toast(text('saved'));
  });
  els.importUrls.addEventListener('click', async () => {
    const textFile = await window.mediaDeck.chooseTextFile();
    if (!textFile) return;
    els.urlInput.value = textFile;
    toast(text('imported'));
  });
  els.startDownload.addEventListener('click', () => void startDownload());
  els.cancelDownload.addEventListener('click', async () => {
    await window.mediaDeck.cancelDownload();
    state.running = false;
    markActiveDownloads('cancelled');
    toast(text('stopped'));
  });
  els.pageFavorite.addEventListener('click', () => {
    setFavoritesPopoverOpen(!state.favoritesPopoverOpen);
  });
  els.favoriteCurrentButton.addEventListener('click', () => {
    const tab = activeTab();
    if (!tab?.url) return;
    const exists = state.favorites.some((item) => item.url === tab.url);
    setFavorite(tab.url, tab.title, !exists);
  });
  document.addEventListener('click', (event) => {
    if (!state.favoritesPopoverOpen || event.target.closest('.favorites-popover-anchor')) return;
    setFavoritesPopoverOpen(false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && state.favoritesPopoverOpen) setFavoritesPopoverOpen(false);
    if (event.key === 'Escape' && !els.libraryDetailOverlay.hidden) closeLibraryDetail();
    if (event.key === 'Escape' && !els.mediaPreviewOverlay.hidden) closeMediaPreview();
    if (event.key === 'Escape' && !els.externalLoginOverlay.hidden) hideExternalLoginDialog();
    if (event.key === 'Escape' && !els.platformManagerOverlay.hidden) {
      els.platformManagerOverlay.hidden = true;
      closePlatformEditors();
    }
  });
  els.mediaModeButtons.forEach((button) => button.addEventListener('click', () => {
    if (!state.activeTabId) return;
    state.mediaModeByTabId[state.activeTabId] = button.dataset.mediaMode === 'batch' ? 'batch' : 'current';
    renderCandidates();
  }));
  els.batchSelectAll.addEventListener('change', () => {
    if (!state.activeTabId) return;
    state.selectedBatchCandidateIdsByTabId[state.activeTabId] = els.batchSelectAll.checked
      ? (state.mediaCollectionsByTabId[state.activeTabId] || []).map((candidate) => candidate.id)
      : [];
    renderCandidates();
  });
  els.batchDownloadSelected.addEventListener('click', () => void startSelectedBatchDownloads());
  // Batch rows are replaced whenever media detection or selection changes.
  // Delegate from the stable list container so newly discovered TikTok/profile
  // items keep their individual checkbox behaviour after every re-render.
  els.candidateList.addEventListener('change', (event) => {
    const checkbox = event.target.closest?.('[data-batch-candidate]');
    const tabId = state.activeTabId;
    if (!checkbox || !tabId) return;
    const candidateId = checkbox.dataset.batchCandidate;
    const collection = state.mediaCollectionsByTabId[tabId] || [];
    if (!collection.some((candidate) => candidate.id === candidateId)) return;
    const selected = new Set(state.selectedBatchCandidateIdsByTabId[tabId] || []);
    if (checkbox.checked) selected.add(candidateId);
    else selected.delete(candidateId);
    state.selectedBatchCandidateIdsByTabId[tabId] = [...selected];
    renderCandidates();
  });
  els.pageMediaToggle.addEventListener('click', () => {
    state.mediaPanelVisible = !state.mediaPanelVisible;
    syncMediaPanelVisibility();
  });
  els.sideRefresh.addEventListener('click', () => {
    const tab = activeTab();
    if (!tab?.webview) return;
    resetTabMediaForNavigation(tab);
    tab.webview.reload();
  });
  els.sideClose.addEventListener('click', () => {
    state.mediaPanelVisible = false;
    syncMediaPanelVisibility();
  });
  els.sideTrash.addEventListener('click', async () => {
    const tab = activeTab();
    await window.mediaDeck.clearMediaCandidates(tab?.webContentsId || null);
    clearMediaCandidatesForTab(tab?.id);
    if (tab) {
      tab.mediaEnrichmentSequence += 1;
      tab.lastEnrichedUrl = null;
    }
    renderCandidates();
  });
  document.querySelectorAll('.side-pill').forEach((button) => {
    button.addEventListener('click', () => {
      state.browserSideTab = button.dataset.sideTab || 'recommend';
      renderCandidates();
    });
  });
  els.clearFinished.addEventListener('click', () => {
    state.queue = state.queue.filter((item) => !isTerminalDownloadState(item.status || item.state));
    state.downloadPage = 1;
    saveState();
    renderDownloads();
  });
  els.retryFailedDownloads.addEventListener('click', () => void retryAllFailedDownloads());
  els.downloadFilters.querySelectorAll('.downloads-tab').forEach((button) => {
    button.addEventListener('click', () => {
      state.activeDownloadStatus = button.dataset.status || 'all';
      state.downloadPage = 1;
      renderDownloads();
    });
  });
  els.downloadRange.addEventListener('change', () => {
    state.downloadRange = els.downloadRange.value;
    state.downloadPage = 1;
    renderDownloads();
  });
  els.historyRange.addEventListener('change', () => {
    state.historyRange = els.historyRange.value;
    renderHistory();
  });
  els.historyClear.addEventListener('click', () => {
    state.history = [];
    saveState();
    renderHistory();
  });
  els.purchaseButton.addEventListener('click', () => submitLocalPurchase());
  els.paymentChannels.forEach((button) => {
    button.addEventListener('click', () => {
      state.paymentChannel = button.dataset.paymentChannel || 'stripe';
      renderPlans();
    });
  });
  els.loginModeButton.addEventListener('click', () => setAccountMode('login'));
  els.registerModeButton.addEventListener('click', () => setAccountMode('register'));
  els.loginButton.addEventListener('click', () => void submitLocalLogin());
  els.registerButton.addEventListener('click', () => void submitLocalRegister());
  [els.loginEmail, els.loginPassword, els.confirmPassword].forEach((input) => input.addEventListener('input', clearAccountAuthError));
  els.passwordVisibilityToggles.forEach((button) => {
    button.addEventListener('click', () => {
      const input = document.getElementById(button.dataset.passwordTarget || '');
      if (!input) return;
      const visible = input.type === 'password';
      input.type = visible ? 'text' : 'password';
      button.classList.toggle('is-visible', visible);
      const label = text(visible ? 'hidePassword' : 'showPassword');
      button.setAttribute('aria-label', label);
      button.title = label;
      input.focus();
    });
  });
  els.accountRefresh.addEventListener('click', async () => {
    try {
      await refreshRemoteAccount();
      await syncRecordingConfiguration();
      toast(text('refreshSuccess'));
    } catch (error) {
      toast(error?.message || text('loginFailed'));
    }
  });
  els.logoutButton.addEventListener('click', async () => {
    await window.mediaDeck.logoutAccount().catch(() => null);
    state.account = {};
    state.orders = [];
    state.passwordPanelOpen = false;
    updateAccountCopy();
    renderPlans();
    await syncRecordingConfiguration();
    toast(text('logoutSuccess'));
  });
  els.accountViewPlans.addEventListener('click', () => setSection('plans'));
  els.accountChangePasswordToggle.addEventListener('click', () => {
    state.passwordPanelOpen = !state.passwordPanelOpen;
    renderAccount();
  });
  els.savePasswordButton.addEventListener('click', () => void submitPasswordChange());
  els.cancelPasswordButton.addEventListener('click', () => {
    state.passwordPanelOpen = false;
    els.oldPassword.value = '';
    els.newPassword.value = '';
    renderAccount();
  });
  els.settingsCheckUpdate.addEventListener('click', () => void handleUpdateCheck());
  els.settingsTheme.addEventListener('change', () => {
    state.theme = els.settingsTheme.value;
    applyTheme();
    saveState();
  });
  els.settingsLanguage.addEventListener('change', () => {
    state.locale = els.settingsLanguage.value;
    applyLocale();
    saveState();
  });
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (state.theme === 'system') applyTheme();
  });
  window.addEventListener('resize', scheduleActiveWebviewResize);
  window.mediaDeck.onOpenNewTab((url) => openUrl(url));
  window.mediaDeck.onBrowserNavigate((url) => openUrl(url));
  window.mediaDeck.onExternalLoginRequest((payload) => showExternalLoginDialog(payload));
  window.mediaDeck.onMediaCandidate((candidate) => addCandidate(candidate));
  window.mediaDeck.onNativeDownloadRequest((payload) => handleNativeDownloadRequest(payload));
  window.mediaDeck.onDownloadState((payload) => {
    state.running = Boolean(payload?.running);
    updateDownloadBadge();
  });
  els.settingsSearchEngine.addEventListener('change', () => {
    state.settings.searchEngine = SEARCH_ENGINES[els.settingsSearchEngine.value] ? els.settingsSearchEngine.value : 'google';
    saveState();
    toast(text('saved'));
  });
  window.mediaDeck.onMediaLibraryChanged(() => void loadMediaLibrary());
  window.mediaDeck.onDownloadEvent(async (payload) => {
    if (!payload) return;
    if (window.mediaDeckSmokeDownload?.real) {
      state.downloadDiagnostics.push({
        type: payload.type,
        jobId: payload.jobId || null,
        url: payload.url || null,
        message: payload.message || null,
        status: payload.data?.status || null,
        filename: payload.data?.filename || null,
        taskDir: payload.data?.task_dir || null,
        thumbnailFilename: payload.data?.thumbnail_filename || null,
      });
      state.downloadDiagnostics = state.downloadDiagnostics.slice(-40);
    }
    if (payload.type === 'log') {
      // yt-dlp status output belongs in the row progress fields, not in a stack
      // of transient notifications covering the media panel.
      const message = String(payload.message || '').trim();
      const row = downloadRowForEvent(payload);
      if (row && /\b(?:warning|error)\b/i.test(message) && !/^\[download\]/i.test(message)) {
        row.errorMessage = message;
        saveState();
        renderDownloads();
      }
      return;
    }
    if (payload.type === 'progress') {
      const data = payload.data || {};
      const row = downloadRowForEvent(payload, data);
      if (row) {
        if (normalizeDownloadState(row.status || row.state) === 'paused') return;
        row.jobId = payload.jobId || row.jobId;
        row.percent = Number(data.percent || 0);
        row.fileName = row.fileName || getFileName(data.filename || row.title || row.url);
        row.downloaded = formatBytes(data.downloaded_bytes) || row.downloaded || '0 B';
        row.size = formatBytes(data.total_bytes) || row.size || '-';
        row.speedBytesPerSecond = Number(data.speed) > 0 ? Number(data.speed) : 0;
        row.speed = row.speedBytesPerSecond ? `${formatBytes(row.speedBytesPerSecond)}/s` : '-';
        const progressState = normalizeDownloadState(data.status || 'downloading');
        row.status = progressState === 'completed'
          ? 'finalizing'
          : (['resolving', 'connecting'].includes(progressState) ? progressState : 'downloading');
        row.state = row.status;
        if (data.source_client) row.sourceClient = data.source_client;
        row.savePath = data.task_dir || row.savePath;
        if (data.status === 'completed') {
          row.path = data.filename || row.path;
          row.savePath = data.task_dir || row.savePath || row.path;
          row.thumbnailPath = data.thumbnail_filename || row.thumbnailPath || null;
          row.completedBytes = Number(data.downloaded_bytes || data.total_bytes || 0);
          row.completionCandidate = Boolean(data.filename && row.completedBytes > 0);
        }
        saveState();
        renderDownloads();
      }
    }
    if (payload.type === 'done') await queueDownloadCompletion(payload);
    if (payload.type === 'error') {
      const row = downloadRowForEvent(payload);
      if (row) {
        row.jobId = payload.jobId || row.jobId;
        row.status = 'error';
        row.state = 'error';
        row.errorMessage = String(payload.message || 'download failed');
        saveState();
        renderDownloads();
      } else {
        markActiveDownloads('error');
      }
      if (!row?.suppressCompletionToast) toast(userFacingDownloadError(payload.message || 'download failed'), 'error');
      if (row) {
        delete row.suppressCompletionToast;
        saveState();
      }
    }
    if (payload.type === 'cancelled') {
      const row = downloadRowForEvent(payload);
      if (row) {
        row.jobId = payload.jobId || row.jobId;
        row.status = 'cancelled';
        row.state = 'cancelled';
        saveState();
        renderDownloads();
      }
    }
    if (payload.type === 'paused') {
      const row = downloadRowForEvent(payload);
      if (row) {
        row.jobId = payload.jobId || row.jobId;
        row.status = 'paused';
        row.state = 'paused';
        row.speed = '-';
        saveState();
        renderDownloads();
      }
    }
  });
  window.mediaDeck.onEntitlementsChanged(applyEntitlementState);
  window.mediaDeck.onRecordingEvent(handleRecordingEvent);
}

async function bootstrap() {
  if (state.account?.plan === 'flagship') state.account.plan = 'ultimate';
  state.users = state.users.map((user) => user?.plan === 'flagship' ? { ...user, plan: 'ultimate' } : user);
  state.orders = state.orders.map((order) => order?.plan === 'flagship' ? { ...order, plan: 'ultimate' } : order);
  if (String(state.selectedPlan).startsWith('flagship_')) state.selectedPlan = String(state.selectedPlan).replace(/^flagship_/, 'ultimate_');
  state.settings = { ...state.settings, ...readObject(STORAGE_KEYS.settings) };
  if (!['light', 'dark'].includes(state.theme)) state.theme = resolveTheme();
  const [systemLocale, defaultDir, candidates, runtimeInfo, platformConfig, editorConfiguration] = await Promise.all([
    window.mediaDeck.getSystemLocale(),
    window.mediaDeck.getDefaultDownloadDir(),
    window.mediaDeck.getMediaCandidates(),
    window.mediaDeck.getRuntimeInfo(),
    window.mediaDeck.getPlatforms(),
    window.mediaDeck.getEditorConfig(),
  ]);
  if (!localStorage.getItem(STORAGE_KEYS.locale)) {
    state.locale = I18N.resolveSupportedLocale(systemLocale) || 'zh-CN';
  }
  state.settings.outputDir = state.settings.outputDir || defaultDir;
  state.runtimeInfo = runtimeInfo || null;
  state.platformConfig = platformConfig || state.platformConfig;
  state.editor.editors = Array.isArray(editorConfiguration?.editors) ? editorConfiguration.editors : [];
  state.editor.selected = editorConfiguration?.selected || null;
  state.activePlatformCategoryId = state.platformConfig.categories[0]?.id || null;
  try {
    await refreshRemoteAccount();
  } catch {
    state.account = {};
    state.orders = [];
  }
  await syncRecordingConfiguration();
  await window.mediaDeck.setAdBlockerEnabled(state.settings.adBlocker !== false);
  applyTheme();
  renderQuickSites();
  bindEvents();
  startSystemNetworkSpeedPolling();
  applyLocale();
  syncSettingsControls();
  updateTitlebarAccount();
  const initialCandidates = Array.isArray(candidates) ? candidates.reverse() : [];
  if (initialCandidates.length) {
    const initialTab = createTab(HOME_URL, text('newTab'));
    setMediaCandidatesForTab(initialTab.id, initialCandidates.filter((candidate) => !candidate.webContentsId));
  }
  setSection(state.tabs.length ? 'browser' : 'home');
  setVisibleWebviews();
  window.__VIDOGO_SET_SECTION = setSection;
  window.__VIDOGO_GET_BROWSER_LAYOUT = getBrowserLayoutSnapshot;
  window.__VIDOGO_RUN_SELF_TEST = runRendererSelfTest;
  window.__VIDOGO_RUN_RTL_LOCALE_TEST = runRtlLocaleTest;
  window.__VIDOGO_RUN_RECORDER_FLOW_TEST = runRecorderFlowTest;
  window.__VIDOGO_RUN_OWNER_FLOW_TEST = runOwnerFlowTest;
  window.__VIDOGO_RUN_BROWSER_YOUTUBE_FLOW_TEST = runBrowserYouTubeFlowTest;
  window.__VIDOGO_RUN_BROWSER_PLATFORM_FLOW_TEST = runBrowserPlatformFlowTest;
  window.__VIDOGO_RUN_ACCOUNT_UI_FLOW_TEST = runAccountUiFlowTest;
  window.__VIDOGO_RUN_MANIFEST_FLOW_TEST = runManifestFlowTest;
  window.__VIDOGO_RUN_DASH_FLOW_TEST = runDashManifestFlowTest;
  window.__VIDOGO_RUN_RESOLVER_FLOW_TEST = runResolverFlowTest;
  if (window.mediaDeckSmokeVisualAudit) {
    window.__VIDOGO_PREPARE_VISUAL_AUDIT = prepareSmokeVisualAudit;
  }
  window.__VIDOGO_BOOTSTRAPPED = true;
  void window.mediaDeck.rendererReady();
}

async function runRendererSelfTest() {
  const failures = [];
  const clicked = [];
  window.__VIDOGO_SELF_TEST_PROGRESS = 'started';
  const assert = (condition, message) => {
    if (!condition) failures.push(message);
  };
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const waitFor = async (condition, timeoutMs = 5000) => {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      if (await condition()) return true;
      await wait(40);
    }
    return Boolean(await condition());
  };
  const previousSettings = { ...state.settings };
  const previousTheme = state.theme;
  const previousLocale = state.locale;
  const previousHistory = [...state.history];
  const previousFavorites = [...state.favorites];
  const previousAccount = { ...state.account };
  const previousUsers = [...state.users];
  const previousOrders = [...state.orders];
  const previousSelectedPlan = state.selectedPlan;
  const previousPaymentChannel = state.paymentChannel;
  const previousUpdateInfo = state.updateInfo ? { ...state.updateInfo } : null;
  const previousLatestVersion = els.settingsLatestVersion.textContent;
  const previousLibrary = {
    ...state.library,
    items: [...state.library.items],
    projects: [...state.library.projects],
    previewUrls: new Map(state.library.previewUrls),
  };
  const clickControl = async (label, control) => {
    window.__VIDOGO_SELF_TEST_PROGRESS = label;
    if (!control) {
      failures.push(`Missing clickable control: ${label}`);
      return;
    }
    if (control.disabled) {
      failures.push(`Clickable control disabled: ${label}`);
      return;
    }
    control.click();
    clicked.push(label);
    await wait(20);
  };
  const changeControl = async (label, control, value) => {
    window.__VIDOGO_SELF_TEST_PROGRESS = label;
    if (!control) {
      failures.push(`Missing change control: ${label}`);
      return;
    }
    if (control.type === 'checkbox') control.checked = Boolean(value);
    else control.value = value;
    control.dispatchEvent(new Event('change', { bubbles: true }));
    clicked.push(label);
    await wait(20);
  };

  const requiredApiMethods = [
    'getSystemLocale',
    'getDefaultDownloadDir',
    'getRuntimeInfo',
    'getLegacyInfo',
    'getSystemNetworkSpeed',
    'chooseDirectory',
    'chooseTextFile',
    'openExternal',
    'openPath',
    'showItemInFolder',
    'openDownloadedFile',
    'previewDownloadedFile',
    'getEditorConfig',
    'scanEditors',
    'setDefaultEditor',
    'chooseEditorExecutable',
    'importIntoEditor',
    'importManyIntoEditor',
    'openDownloadedFolder',
    'minimizeWindow',
    'toggleMaximizeWindow',
    'closeWindow',
    'rendererReady',
    'resetBrowserSession',
    'startExternalYouTubeLogin',
    'syncExternalBrowserLogin',
    'repairDailymotionPlayback',
    'inspectBrowserFrames',
    'getBlockedRequestDiagnostics',
    'getDailymotionRequestDiagnostics',
    'setPreferredLanguage',
    'setTitleBarTheme',
    'setAdBlockerEnabled',
    'getPlatforms',
    'savePlatforms',
    'resetPlatforms',
    'choosePlatformIcon',
    'getEntitlements',
    'configureEntitlements',
    'configureRecording',
    'checkForUpdates',
    'getMediaCandidates',
    'extractPageMedia',
    'resolvePageMedia',
    'clearMediaCandidates',
    'startDownload',
    'cancelDownload',
    'controlDownload',
    'verifyDownloadedFile',
    'listMediaLibrary',
    'refreshMediaLibrary',
    'onOpenNewTab',
    'onBrowserNavigate',
    'onExternalLoginRequest',
    'onMediaCandidate',
    'onNativeDownloadRequest',
    'onDownloadState',
    'onDownloadEvent',
    'onMediaLibraryChanged',
    'onEntitlementsChanged',
    'onRecordingEvent',
  ];
  const missingApiMethods = requiredApiMethods.filter((name) => typeof window.mediaDeck?.[name] !== 'function');
  assert(missingApiMethods.length === 0, `Missing mediaDeck API methods: ${missingApiMethods.join(', ')}`);
  window.__VIDOGO_SELF_TEST_PROGRESS = 'external-login';
  const externalLoginOpenState = await window.mediaDeck.startExternalYouTubeLogin();
  await wait(30);
  assert(externalLoginOpenState?.opened === true, 'System-browser YouTube login did not open');
  assert(els.externalLoginOverlay.hidden === false, 'System-browser login instructions did not appear above the app');
  await syncExternalLogin();
  assert(els.externalLoginOverlay.hidden === true, 'System-browser login instructions did not close after synchronization');
  assert(state.externalLoginCanSync === false && els.externalLoginSync.disabled, 'Completed external login remained retryable after its browser closed');
  assert(getComputedStyle(document.querySelector('.address-input-shell')).cursor === 'not-allowed', 'Read-only address bar must use the prohibited cursor');
  const applicationSelects = Array.from(document.querySelectorAll('select:not([multiple])'));
  const selectStyleDiagnostics = applicationSelects.map((select) => {
    const style = getComputedStyle(select);
    return { id: select.id, appearance: style.appearance, backgroundImage: style.backgroundImage, paddingRight: style.paddingRight };
  });
  assert(applicationSelects.length > 0 && selectStyleDiagnostics.every((style) => (
    style.appearance === 'none' && style.backgroundImage !== 'none' && parseFloat(style.paddingRight) >= 30
  )), `All application dropdowns must use the spaced custom arrow: ${JSON.stringify(selectStyleDiagnostics)}`);
  const hasOpenSelectRule = Array.from(document.styleSheets).some((sheet) => {
    try {
      return Array.from(sheet.cssRules || []).some((rule) => String(rule.selectorText || '').includes('select:not([multiple]):open'));
    } catch {
      return false;
    }
  });
  assert(hasOpenSelectRule, 'Dropdown arrow does not define an open-state flip');
  assert(els.passwordVisibilityToggles.length === 4, 'Password visibility controls are incomplete');
  const originalPasswordType = els.loginPassword.type;
  els.passwordVisibilityToggles.find((button) => button.dataset.passwordTarget === 'login-password')?.click();
  assert(els.loginPassword.type !== originalPasswordType, 'Password visibility control did not toggle the field');
  els.passwordVisibilityToggles.find((button) => button.dataset.passwordTarget === 'login-password')?.click();
  showAccountAuthError(text('loginFailed'), [els.loginEmail, els.loginPassword]);
  assert(els.accountAuthError.hidden === false && els.loginPassword.getAttribute('aria-invalid') === 'true', 'Account error did not render inline');
  clearAccountAuthError();
  toast('Repeated smoke notice', 'error');
  toast('Repeated smoke notice', 'error');
  assert(Array.from(els.toastRegion.children).filter((item) => item.dataset.toastKey === 'error:Repeated smoke notice').length === 1, 'Repeated toasts were not deduplicated');
  els.toastRegion.replaceChildren();

  const runtimeInfo = await window.mediaDeck.getRuntimeInfo();
  assert(runtimeInfo?.appName === 'VidoGo Basic', 'Runtime info app name mismatch');
  assert(String(runtimeInfo?.browserPartition || '').startsWith('persist:'), 'Runtime browser partition missing');
  const smokeNetworkSpeed = await window.mediaDeck.getSystemNetworkSpeed();
  assert(smokeNetworkSpeed?.available === true && Number.isFinite(Number(smokeNetworkSpeed?.totalBytesPerSecond)), 'System network-speed IPC returned an invalid sample');
  const expectedBackendMode = String(window.mediaDeckSmokeExpectedBackend || '');
  if (expectedBackendMode) assert(runtimeInfo?.backendMode === expectedBackendMode, 'Runtime backend mode mismatch');

  const legacyInfo = await window.mediaDeck.getLegacyInfo();
  assert(Array.isArray(legacyInfo?.legacyDirs), 'Legacy info dirs missing');

  const acceptLanguage = await window.mediaDeck.setPreferredLanguage('en');
  assert(String(acceptLanguage).includes('en-US'), 'Preferred language IPC did not return English header');
  const arabicAcceptLanguage = await window.mediaDeck.setPreferredLanguage('ar');
  assert(String(arabicAcceptLanguage).startsWith('ar,'), 'Preferred language IPC did not return Arabic header');
  const adBlockerState = await window.mediaDeck.setAdBlockerEnabled(false);
  assert(adBlockerState === false, 'Ad blocker IPC did not disable blocking');
  await window.mediaDeck.setAdBlockerEnabled(true);
  const recordingConfiguration = await window.mediaDeck.configureRecording({
    outputDir: state.settings.outputDir,
    maxConcurrentDownloads: state.settings.maxConcurrentDownloads,
  });
  assert(recordingConfiguration?.outputDir === state.settings.outputDir, 'Recording output configuration mismatch');
  const updateState = await window.mediaDeck.checkForUpdates();
  assert(updateState?.available === true && updateState?.latestVersion === '0.2.0' && updateState?.source === 'github', 'Update check IPC did not return the simulated GitHub release state');

  const candidatesBeforeClear = await window.mediaDeck.clearMediaCandidates();
  assert(Array.isArray(candidatesBeforeClear), 'Clear media candidates did not return an array');
  const candidatesAfterClear = await window.mediaDeck.getMediaCandidates();
  assert(Array.isArray(candidatesAfterClear) && candidatesAfterClear.length === 0, 'Media candidates were not cleared');
  const unsupportedMetadata = await window.mediaDeck.extractPageMedia({ pageUrl: 'https://example.com/', webContentsId: 0 });
  assert(Array.isArray(unsupportedMetadata) && unsupportedMetadata.length === 0, 'Unsupported metadata page should return no candidates');
  const plannedYouTubeFormats = planYouTubeDomFormats([
    { format_id: '137', ext: 'mp4', width: 1920, height: 1080, fps: 30, tbr: 4500, vcodec: 'avc1.640028', acodec: 'none' },
    { format_id: '248', ext: 'webm', width: 1920, height: 1080, fps: 30, tbr: 3800, vcodec: 'vp9', acodec: 'none' },
    { format_id: '140', ext: 'm4a', abr: 128, vcodec: 'none', acodec: 'mp4a.40.2' },
    { format_id: '251', ext: 'webm', abr: 160, vcodec: 'none', acodec: 'opus' },
  ], 120);
  assert(plannedYouTubeFormats.length === 2, 'YouTube DOM format planner did not preserve codec variants');
  assert(plannedYouTubeFormats[0]?.videoCodec === 'VP9' && plannedYouTubeFormats[0]?.formatSelector.startsWith('248+251/'), 'YouTube DOM format planner did not select the preferred compatible variant');

  const cancelState = await window.mediaDeck.cancelDownload();
  assert(cancelState?.running === false, 'Cancel download should report not running');

  window.__VIDOGO_SELF_TEST_PROGRESS = 'download-validation';
  const smokeDownload = window.mediaDeckSmokeDownload || {};
  const concurrentUrls = smokeDownload.real && smokeDownload.urls?.length >= 3
    ? smokeDownload.urls.slice(0, 3)
    : [
      'https://example.com/concurrent-a.mp4',
      'https://example.com/concurrent-b.mp4',
      'https://example.com/concurrent-c.mp4',
    ];
  const queueBeforeConcurrencyTest = state.queue;
  state.queue = [];
  queueUrls(concurrentUrls);
  window.__VIDOGO_SELF_TEST_PROGRESS = 'download-concurrency';
  const concurrentQueue = await window.mediaDeck.startDownload({
    urls: concurrentUrls,
    outputDir: smokeDownload.outputDir || 'C:\\SmokeDownloads',
    thumbnailUrl: smokeDownload.thumbnailUrl || null,
    maxConcurrentDownloads: 2,
  });
  const expectedConcurrentActive = Math.min(concurrentUrls.length, 2, currentConcurrencyLimit());
  assert(concurrentQueue?.jobs?.length === 3, 'Concurrent download queue did not create one job per URL');
  assert(concurrentQueue?.activeCount === expectedConcurrentActive, 'Concurrent download queue did not honor the plan-clamped active limit');
  assert(concurrentQueue?.queuedCount === concurrentUrls.length - expectedConcurrentActive, 'Concurrent download queue did not retain plan-clamped overflow work');
  if (smokeDownload.real) {
    const deadline = Date.now() + 45000;
    while (Date.now() < deadline && state.queue.some((item) => !isTerminalDownloadState(item.state))) {
      await wait(250);
    }
    while (Date.now() < deadline && state.running) await wait(100);
  } else {
    await waitFor(() => state.queue.every((item) => isTerminalDownloadState(item.state)), 2000);
  }
  const concurrentSnapshot = state.queue.map((item) => ({ url: item.url, state: item.state, jobId: item.jobId }));
  const concurrentDiagnostic = JSON.stringify({ rows: concurrentSnapshot, events: state.downloadDiagnostics.slice(-20) });
  assert(state.queue.every((item) => normalizeDownloadState(item.state) === 'completed'), `Concurrent job events did not complete their matching rows: ${concurrentDiagnostic}`);
  assert(new Set(state.queue.map((item) => item.jobId)).size === 3, 'Concurrent job events did not retain unique job identities');
  assert(state.running === false, 'Concurrent queue did not report an idle final state');
  if (smokeDownload.real && concurrentUrls[0]) {
    const concurrentRows = state.queue;
    if (smokeDownload.slowUrl) {
      state.queue = [];
      await startDownload({
        url: smokeDownload.slowUrl,
        pageUrl: `${smokeDownload.slowUrl}?source=smoke-page`,
        title: 'Pause media smoke',
        fileName: 'Pause media smoke',
        kind: 'video',
        mimeType: 'video/mp4',
        sourceClient: 'smoke-direct',
        downloadStrategy: 'direct',
        suppressToast: true,
      });
      await waitFor(() => state.queue[0]?.state === 'downloading', 4_000);
      const pausedRow = state.queue[0];
      const paused = await controlDownloadRow(pausedRow, 'pause');
      assert(paused === true && pausedRow?.state === 'paused', 'Direct media pause did not stop the active task in place');
      const resumed = await controlDownloadRow(pausedRow, 'resume');
      assert(resumed === true && state.queue.length === 1, 'Direct media resume did not reuse the paused row');
      const resumeDeadline = Date.now() + 20_000;
      while (Date.now() < resumeDeadline && state.queue.some((item) => !isTerminalDownloadState(item.state))) await wait(100);
      assert(state.queue[0]?.state === 'completed' && state.queue[0]?.completionVerified === true,
        `Resumed direct media did not complete: ${JSON.stringify(state.queue[0] || null)}`);
    }
    state.queue = concurrentRows;
  }
  state.queue = queueBeforeConcurrencyTest;
  saveState();
  renderDownloads();
  window.__VIDOGO_SELF_TEST_PROGRESS = 'layout-controls';

  assert(document.querySelectorAll('.titlebar-actions, [data-window-action]').length === 0, 'Custom window buttons should not replace the VidBrowser native title bar overlay');
  assert(Math.round(document.querySelector('.titlebar')?.getBoundingClientRect().height || 0) === 32, 'Compact title bar must remain 32px high');
  assert(!document.querySelector('.titlebar-context, .titlebar-divider'), 'Title bar must not duplicate the active page');
  assert(!document.querySelector('#home-search-go'), 'Home page should submit from the VidBrowser-style search field, without a separate button');
  assert(!document.querySelector('#page-pin'), 'Browser toolbar should not expose the non-reference pin-download button');
  assert(!document.querySelector('#favorites-add-current'), 'Favorites page should not expose a non-reference add-current header button');

  await clickControl('sidebar:browser-empty-home', document.querySelector('.sidebar-btn[data-section="browser"]'));
  assert(els.pages.home?.classList.contains('active'), 'Browser sidebar should show home when no browser tab is loaded');
  assert(!els.tabbar.hidden, 'Browser home should show the VidBrowser tab strip');
  assert(Math.abs(els.tabbar.getBoundingClientRect().width - document.querySelector('.main').getBoundingClientRect().width) <= 1, 'Browser tab strip must span the full content width');
  assert(getVisibleWebviews().length === 0, 'Empty home state should not expose a browser webview');

  for (const section of ['downloads', 'library', 'history', 'favorites', 'plans', 'account', 'settings']) {
    await clickControl(`sidebar:${section}`, document.querySelector(`.sidebar-btn[data-section="${section}"]`));
    assert(els.pages[section]?.classList.contains('active'), `section not active: ${section}`);
    assert(document.querySelector(`.sidebar-btn[data-section="${section}"]`)?.classList.contains('active'), `sidebar item not active: ${section}`);
    assert(els.tabbar.hidden, `Browser tab strip should be hidden on ${section}`);
  }

  await waitFor(() => !state.library.loading, 1500);
  const smokeProject = {
    id: 'project-library-smoke', title: 'Glacier Express · Zermatt', provider: 'youtube', mediaId: 'Mpx3HPlyFZk',
    sourceGroupId: 'youtube:Mpx3HPlyFZk', sourceUrl: 'https://www.youtube.com/watch?v=Mpx3HPlyFZk',
    folderPath: 'C:\\SmokeDownloads\\YouTube\\Glacier Express [Mpx3HPlyFZk]', coverPath: 'C:\\SmokeDownloads\\YouTube\\Glacier Express [Mpx3HPlyFZk]\\images\\cover.jpg',
    updatedAt: new Date().toISOString(), downloadedAt: new Date().toISOString(), status: 'available', missingCount: 0,
    totalSize: 155 * 1024 * 1024, assetCount: 4, assetCounts: { video: 1, audio: 1, image: 1, subtitle: 1 },
    assets: [
      { id: 'library-video-smoke', title: 'Glacier Express', assetType: 'video', assetRole: 'primary', status: 'available', fileSize: 150 * 1024 * 1024, downloadedAt: new Date().toISOString(), filePath: 'C:\\SmokeDownloads\\video.mp4', folderPath: 'C:\\SmokeDownloads' },
      { id: 'library-audio-smoke', title: 'Glacier Express', assetType: 'audio', assetRole: 'derived', status: 'available', fileSize: 5 * 1024 * 1024, downloadedAt: new Date().toISOString(), filePath: 'C:\\SmokeDownloads\\audio.mp3', folderPath: 'C:\\SmokeDownloads' },
      { id: 'library-cover-smoke', title: 'Glacier Express', assetType: 'image', assetRole: 'cover', status: 'available', fileSize: 4096, downloadedAt: new Date().toISOString(), filePath: 'C:\\SmokeDownloads\\cover.jpg', folderPath: 'C:\\SmokeDownloads' },
      { id: 'library-subtitle-smoke', title: 'Glacier Express', assetType: 'subtitle', assetRole: 'caption', status: 'available', fileSize: 2048, downloadedAt: new Date().toISOString(), filePath: 'C:\\SmokeDownloads\\subtitle.zh-CN.srt', folderPath: 'C:\\SmokeDownloads' },
    ],
  };
  state.library = { ...state.library, loaded: true, loading: false, error: '', projects: [smokeProject], items: smokeProject.assets, tab: 'projects', query: '', provider: 'all', assetType: 'all', timeRange: 'all', sort: 'recent', view: 'grid' };
  setSection('library');
  renderLibraryFilters();
  renderLibrary();
  assert(els.libraryProviderFilter.options.length === libraryFilterPlatforms().length + 1, 'Library platform options must come from Platform Manager, not downloaded projects');
  assert(els.libraryProjectCount.textContent === '1' && els.libraryAssetCount.textContent === '4', 'Media library totals did not render one project with four logical assets');
  assert(els.libraryContent.querySelectorAll('[data-library-project]').length === 1, 'One source must render as exactly one media-project card');
  await clickControl('library:open-project', els.libraryContent.querySelector('[data-library-project]'));
  assert(!els.libraryDetailOverlay.hidden && els.libraryDetailBody.querySelectorAll('.library-detail-asset').length === 4, 'Media project detail did not group all assets');
  const detailAssets = Array.from(els.libraryDetailBody.querySelectorAll('.library-detail-asset'));
  const detailImportActions = Array.from(els.libraryDetailBody.querySelectorAll('[data-library-asset-action="import-editor"]'));
  assert(detailImportActions.length === 4 && detailAssets.every((row) => row.querySelector('[data-library-asset-action="import-editor"]')), 'Video, audio, image, and subtitle assets should all expose editor import');
  await clickControl('library:import-video-editor', detailImportActions[0]);
  await clickControl('library:import-image-editor', detailImportActions[2]);
  await clickControl('library:import-subtitle-editor', detailImportActions[3]);
  const drawerWheel = new WheelEvent('wheel', { deltaY: 240, bubbles: true, cancelable: true });
  els.libraryDetailScrim.dispatchEvent(drawerWheel);
  assert(drawerWheel.defaultPrevented, 'Library drawer wheel events must not reach the obscured asset grid');
  await clickControl('library:open-folder', els.libraryDetailBody.querySelector('[data-library-project-action="folder"]'));
  await clickControl('library:close-detail', els.libraryDetailClose);
  await clickControl('library:all-assets', els.libraryTabs.querySelector('[data-library-tab="assets"]'));
  assert(els.libraryContent.querySelectorAll('.library-asset-card').length === 4, 'All-assets view did not expose each logical asset');
  await changeControl('library:type-audio', els.libraryTypeFilter, 'audio');
  assert(els.libraryContent.querySelectorAll('.library-asset-card').length === 1, 'Asset-type filter did not isolate the MP3');
  await clickControl('library:preview-audio', els.libraryContent.querySelector('[data-library-asset-action="preview"]'));
  await wait(20);
  assert(!els.mediaPreviewOverlay.hidden && state.previewItem?.assetType === 'audio', 'Media library MP3 preview did not open');
  closeMediaPreview();
  await showMediaPreview(libraryAssetBridgeItem(smokeProject.assets[2]));
  await wait(20);
  const previewImage = els.mediaPreviewBody.querySelector('.media-preview-image');
  assert(previewImage && getComputedStyle(els.mediaPreviewBody).overflow === 'hidden' && getComputedStyle(previewImage).objectFit === 'contain', 'Portrait image previews must fit inside a scrollbar-free canvas');
  const previewWheel = new WheelEvent('wheel', { deltaY: 240, bubbles: true, cancelable: true });
  els.mediaPreviewBody.dispatchEvent(previewWheel);
  assert(previewWheel.defaultPrevented, 'Media preview wheel events must not reach the obscured page');
  closeMediaPreview();
  const audioActions = Array.from(els.libraryContent.querySelectorAll('[data-library-asset-action]'));
  assert(audioActions.filter((button) => button.dataset.libraryAssetAction === 'preview').length === 1 && audioActions.filter((button) => button.dataset.libraryAssetAction === 'import-editor').length === 1 && !audioActions.some((button) => button.dataset.libraryAssetAction === 'system'), 'Media library MP3 rows must expose preview and editor import without a duplicate system-open action');
  await clickControl('library:import-audio-editor', audioActions.find((button) => button.dataset.libraryAssetAction === 'import-editor'));
  await clickControl('library:reveal-file', audioActions.find((button) => button.dataset.libraryAssetAction === 'reveal'));
  state.library.assetType = 'all';
  els.libraryTypeFilter.value = 'all';
  await changeControl('library:provider-youtube', els.libraryProviderFilter, 'youtube');
  assert(els.libraryContent.querySelectorAll('.library-asset-card').length === 4, 'Media library platform filter hid matching YouTube assets');
  await changeControl('library:time-today', els.libraryTimeFilter, 'today');
  assert(els.libraryContent.querySelectorAll('.library-asset-card').length === 4, 'Media library download-time filter hid today\'s assets');
  state.library.provider = 'all';
  state.library.timeRange = 'all';
  els.libraryProviderFilter.value = 'all';
  els.libraryTimeFilter.value = 'all';
  els.librarySearch.value = 'not-a-match';
  els.librarySearch.dispatchEvent(new Event('input', { bubbles: true }));
  clicked.push('library:search-no-match');
  assert(Boolean(els.libraryContent.querySelector('.library-empty')), 'Media library search did not render a no-results state');
  els.librarySearch.value = '';
  state.library.query = '';
  await clickControl('library:list-view', els.libraryListView);
  assert(els.libraryContent.querySelectorAll('.library-asset-row').length === 4, 'Media library list view did not render all assets');
  await clickControl('library:media-projects', els.libraryTabs.querySelector('[data-library-tab="projects"]'));
  assert(els.libraryContent.querySelectorAll('.library-project-row-shell').length === 1, 'Media-project list view did not render its project row');
  await clickControl('library:import-project-editor', els.libraryContent.querySelector('[data-library-project-import]'));
  openLibraryDetail(smokeProject.id);
  await clickControl('library:open-source-embedded', els.libraryDetailBody.querySelector('[data-library-project-action="source"]'));
  assert(state.section === 'browser' && activeTab()?.url === smokeProject.sourceUrl, 'Media library source page must open in the embedded browser');

  setSection('home');
  await wait(250);
  const siteImages = Array.from(document.querySelectorAll('.popular-site-button img, .site-card img'));
  await Promise.race([Promise.allSettled(siteImages.map((image) => {
    if (image.complete && image.naturalWidth > 0) return Promise.resolve();
    return image.decode ? image.decode() : new Promise((resolve) => {
      image.addEventListener('load', resolve, { once: true });
      image.addEventListener('error', resolve, { once: true });
    });
  })), wait(1200)]);
  const platformButtons = document.querySelectorAll('.browser-home .popular-site-button');
  assert(platformButtons.length >= 25, `Expected the built-in platform catalog, got ${platformButtons.length}`);
  assert(!document.querySelector('#home-search-input'), 'Home should be a platform launcher, not another address/search field');
  const originalPlatformConfig = await window.mediaDeck.getPlatforms();
  try {
    const builtInPlatform = originalPlatformConfig.platforms.find((platform) => platform.builtIn === true);
    assert(Boolean(builtInPlatform), 'Built-in platform catalog has no removable test entry');
    await clickControl('home:platform-manager-open', els.platformManageButton);
    assert(!els.platformManagerOverlay.hidden, 'Platform manager did not open');
    const managerRect = els.platformManagerOverlay.querySelector('.platform-manager-dialog')?.getBoundingClientRect();
    assert(managerRect?.width >= 900 && managerRect?.height >= 600,
      `Platform manager layout is unexpectedly cramped: ${Math.round(managerRect?.width || 0)}x${Math.round(managerRect?.height || 0)}`);
    if (builtInPlatform) {
      state.activePlatformCategoryId = builtInPlatform.categoryId;
      renderPlatformManager();
      const toggle = els.platformSiteList.querySelector(`[data-platform-toggle="${CSS.escape(builtInPlatform.id)}"]`);
      const toggleRect = toggle?.getBoundingClientRect();
      assert(Math.round(toggleRect?.width || 0) === 36 && Math.round(toggleRect?.height || 0) === 20,
        `Platform switch must render as 36x20, got ${Math.round(toggleRect?.width || 0)}x${Math.round(toggleRect?.height || 0)}`);
      await clickControl('platform-manager:hide-built-in', toggle);
      const hiddenPersisted = await waitFor(async () => {
        const configuration = await window.mediaDeck.getPlatforms();
        return configuration.platforms.find((platform) => platform.id === builtInPlatform.id)?.enabled === false;
      });
      assert(hiddenPersisted, 'Built-in platform visibility change was not persisted');
      assert(!els.platformGroups.querySelector(`[data-platform-open="${CSS.escape(builtInPlatform.id)}"]`),
        'Hidden built-in platform remained visible on the home page');

      state.activePlatformCategoryId = builtInPlatform.categoryId;
      renderPlatformManager();
      await clickControl('platform-manager:delete-built-in',
        els.platformSiteList.querySelector(`[data-platform-delete="${CSS.escape(builtInPlatform.id)}"]`));
      const deletionPersisted = await waitFor(async () => {
        const configuration = await window.mediaDeck.getPlatforms();
        return !configuration.platforms.some((platform) => platform.id === builtInPlatform.id);
      });
      assert(deletionPersisted, 'Built-in platform could not be deleted from persisted configuration');
      assert(!els.platformGroups.querySelector(`[data-platform-open="${CSS.escape(builtInPlatform.id)}"]`),
        'Deleted built-in platform remained visible on the home page');
    }

    await clickControl('platform-manager:add-category', els.platformCategoryAdd);
    els.categoryEditName.value = 'Smoke Category';
    els.categoryEditor.requestSubmit();
    const customCategorySaved = await waitFor(async () => {
      const configuration = await window.mediaDeck.getPlatforms();
      return configuration.categories.some((category) => category.labels?.['zh-CN'] === 'Smoke Category');
    });
    assert(customCategorySaved, 'Custom platform category was not persisted');
    const customCategory = state.platformConfig.categories.find((category) => category.labels?.['zh-CN'] === 'Smoke Category');
    assert(Boolean(customCategory), 'Custom platform category was not reflected in renderer state');

    await clickControl('platform-manager:add-platform', els.platformSiteAdd);
    els.platformEditName.value = 'Smoke Platform';
    els.platformEditUrl.value = 'https://example.com/smoke-platform';
    els.platformEditUrl.dispatchEvent(new Event('input', { bubbles: true }));
    els.platformEditCategory.value = customCategory?.id || '';
    const editorActionsRect = els.platformEditor.querySelector('.platform-editor-actions')?.getBoundingClientRect();
    const editorIconRect = els.platformEditor.querySelector('.platform-icon-field')?.getBoundingClientRect();
    assert(editorActionsRect?.left > editorIconRect?.right,
      'Platform editor actions are still stuck to the icon/input region');
    els.platformEditor.requestSubmit();
    const customPlatformSaved = await waitFor(async () => {
      const configuration = await window.mediaDeck.getPlatforms();
      return configuration.platforms.some((platform) => platform.name === 'Smoke Platform');
    });
    assert(customPlatformSaved, 'Custom platform was not persisted');
    const customPlatform = state.platformConfig.platforms.find((platform) => platform.name === 'Smoke Platform');
    assert(customPlatform?.icon === 'https://example.com/favicon.ico', 'Custom platform did not auto-derive its favicon');
    assert(Boolean(els.platformGroups.querySelector(`[data-platform-open="${CSS.escape(customPlatform?.id || '')}"]`)),
      'Custom platform did not appear on the home page');
  } catch (error) {
    failures.push(`Platform manager CRUD flow failed: ${error?.message || String(error)}`);
  } finally {
    state.platformConfig = await window.mediaDeck.savePlatforms(originalPlatformConfig);
    state.activePlatformCategoryId = state.platformConfig.categories[0]?.id || null;
    closePlatformEditors();
    els.platformManagerOverlay.hidden = true;
    renderQuickSites();
    renderPlatformManager();
  }
  const homeTabButton = document.querySelector('.tab:first-child');
  assert(homeTabButton?.textContent.includes(text('home')), 'Home tab should be the first tab before opening a site');
  const tabsBeforeQuickSite = state.tabs.length;
  const quickYouTube = Array.from(document.querySelectorAll('.popular-site-button, .site-card')).find((button) => button.textContent.includes('YouTube'));
  setSection('home');
  await clickControl('home:quick-site:youtube', quickYouTube);
  assert(state.tabs.length === tabsBeforeQuickSite + 1, 'YouTube quick site did not create a new browser tab');
  assert(activeTab()?.title === 'YouTube', 'YouTube quick site did not label the opened tab');
  assert(activeTab()?.url === 'https://www.youtube.com/', 'YouTube quick site did not open the expected URL');
  assert(document.querySelector('.tab:first-child')?.textContent.includes(text('home')), 'Home tab should remain before browser tabs after opening YouTube');
  assert(document.querySelector('.tab.active')?.textContent.includes('YouTube'), 'Opened YouTube tab was not active in the top tab strip');
  const renderedBrowserTabs = Array.from(els.tabStrip.querySelectorAll('.browser-tab'));
  const browserTabWidths = renderedBrowserTabs.map((button) => Math.round(button.getBoundingClientRect().width));
  const homeTabWidth = Math.round(els.tabStrip.querySelector('.home-tab-button')?.getBoundingClientRect().width || 0);
  const tabStripRect = els.tabStrip.getBoundingClientRect();
  const tabAddRect = els.tabAdd.getBoundingClientRect();
  assert(homeTabWidth === 92, `Home tab width should be 92px, got ${homeTabWidth}px`);
  assert(browserTabWidths.length > 0 && browserTabWidths.every((width) => width === 176), `Browser tabs must stay at 176px: ${browserTabWidths.join(', ')}`);
  assert(getComputedStyle(els.tabStrip).flexGrow === '0', 'Tab strip must not stretch across the navigation bar');
  assert(Math.abs(tabStripRect.right - tabAddRect.left) <= 1, `New-tab button is detached from the tabs: ${Math.round(tabStripRect.right)} vs ${Math.round(tabAddRect.left)}`);
  const activeBrowserTitle = els.tabStrip.querySelector('.browser-tab.active .browser-tab-title');
  assert(getComputedStyle(activeBrowserTitle).textOverflow === 'ellipsis' && getComputedStyle(activeBrowserTitle).whiteSpace === 'nowrap', 'Long browser tab titles must be ellipsized on one line');
  const mediaPanelRect = els.browserSide.getBoundingClientRect();
  assert(mediaPanelRect.height > 500 && mediaPanelRect.width >= 260, `Media sniffing panel has invalid size: ${Math.round(mediaPanelRect.width)}x${Math.round(mediaPanelRect.height)}`);
  assert(els.browserSideTitle.textContent === text('mediaPanel'), 'Media sniffing panel title did not render');
  assert(els.recommendCount.textContent === '0' && els.allCount.textContent === '0', 'New YouTube tab should start with empty media candidates');
  const panelOpenLayout = getBrowserLayoutSnapshot();
  await clickControl('browser:media-panel-close', els.sideClose);
  const panelClosedLayout = getBrowserLayoutSnapshot();
  assert(panelClosedLayout.mediaPanelVisible === false && panelClosedLayout.sideWidth === 0, 'Media panel close button did not hide the sniffing panel');
  assert(panelClosedLayout.stageWidth > panelOpenLayout.stageWidth, 'Browser stage did not expand after closing the media panel');
  await clickControl('browser:media-panel-toggle-open', els.pageMediaToggle);
  const panelReopenedLayout = getBrowserLayoutSnapshot();
  assert(panelReopenedLayout.mediaPanelVisible === true && panelReopenedLayout.mediaPanelHeight > 500, 'Toolbar media panel toggle did not reopen the sniffing panel');

  for (const locale of I18N.localeOrder) {
    state.locale = locale;
    applyLocale();
    assert(document.documentElement.lang === locale, `Locale not applied: ${locale}`);
    assert(document.documentElement.dir === (locale === 'ar' ? 'rtl' : 'ltr'), `Locale direction mismatch: ${locale}`);
    assert(els.platformManageLabel.textContent === TEXT_TABLES[locale].platformManager, `Localized platform manager copy not applied: ${locale}`);
    assert(els.settingsLanguage.options.length === 8, `Language options are incomplete: ${locale}`);
  }

  state.locale = 'zh-CN';
  applyLocale();

  state.theme = 'light';
  applyTheme();
  assert(els.body.dataset.resolvedTheme === 'light', 'Light theme not applied');

  state.theme = 'dark';
  applyTheme();
  assert(els.body.dataset.resolvedTheme === 'dark', 'Dark theme not applied');
  await changeControl('theme:light', els.settingsTheme, 'light');
  await changeControl('theme:dark', els.settingsTheme, 'dark');
  await changeControl('language:en', els.settingsLanguage, 'en');
  await changeControl('language:ar', els.settingsLanguage, 'ar');
  assert(document.documentElement.dir === 'rtl', 'Arabic language control did not apply RTL direction');
  await changeControl('language:zh', els.settingsLanguage, 'zh-CN');

  setSection('browser');
  assert(els.pages.browser?.classList.contains('active'), 'section not active: browser');
  assert(document.querySelector('.sidebar-btn[data-section="browser"]')?.classList.contains('active'), 'Browser sidebar item should be active');
  const initialActiveTabId = state.activeTabId;
  const initialTabCount = state.tabs.length;
  assert(getVisibleWebviews().length === 1, 'Exactly one webview should be visible before tab switching');
  await clickControl('tab:add', els.tabAdd);
  assert(state.section === 'home', 'Tab add should open the home/new-tab page');
  assert(state.tabs.length === initialTabCount, 'Home/new-tab button should not create a browser webview until navigation');
  assert(getVisibleWebviews().length === 0, 'Home/new-tab page should hide all webviews');
  openUrl('https://example.com/added-tab', 'Example Domain');
  const addedTabId = state.activeTabId;
  assert(addedTabId && addedTabId !== initialActiveTabId, 'Opening a URL from the new-tab page did not select the new browser tab');
  assert(state.tabs.length === initialTabCount + 1, 'Opening a URL from the new-tab page did not create a browser tab');
  assert(getVisibleWebviews().length === 1, 'Exactly one webview should be visible after adding a tab');
  const firstBrowserTabButton = document.querySelector(`.tab[data-tab-id="${initialActiveTabId}"]`);
  await clickControl('tab:switch-first', firstBrowserTabButton);
  assert(state.activeTabId === initialActiveTabId, 'Switching to first browser tab did not update active tab');
  assert(getVisibleWebviews()[0]?.id === initialActiveTabId, 'First browser tab webview was not the only visible webview');
  const firstLayout = getBrowserLayoutSnapshot();
  assert(firstLayout.activePageIds.length === 1 && firstLayout.activePageIds[0] === 'page-browser', `Browser tab switch left invalid active pages: ${firstLayout.activePageIds.join(', ')}`);
  assert(firstLayout.stageWidth > 600, `Browser stage width too small after tab switch: ${firstLayout.stageWidth}`);
  assert(firstLayout.viewWidth === firstLayout.stageWidth && firstLayout.viewHeight === firstLayout.stageHeight, 'Active webview does not fill browser stage');
  assert(firstLayout.viewDisplay === 'flex' && firstLayout.viewVisibility === 'visible', 'Active webview should be visible in the browser frame flow');
  assert(firstLayout.viewInlineHeight === '' && firstLayout.viewInlineWidth === '', 'Active webview should use VidBrowser CSS flow instead of inline sizing');
  const addedTabButton = document.querySelector(`.tab[data-tab-id="${addedTabId}"]`);
  await clickControl('tab:switch-added', addedTabButton);
  assert(state.activeTabId === addedTabId, 'Switching back to added tab did not update active tab');
  const secondLayout = getBrowserLayoutSnapshot();
  assert(secondLayout.visibleWebviews === 1, 'Exactly one webview should be visible after switching back');
  assert(secondLayout.viewHeight === secondLayout.stageHeight && secondLayout.viewHeight > 500, `Later tab webview height is not full-height: view=${secondLayout.viewHeight}, stage=${secondLayout.stageHeight}`);
  assert(secondLayout.sideWidth >= 260 && secondLayout.splitWidth > secondLayout.sideWidth, 'Browser media panel should stay right-side, not stacked into half-screen layout');
  const activeClose = document.querySelector('.tab.active .tab-close');
  await clickControl('tab:close-active', activeClose);
  assert(!state.tabs.some((tab) => tab.id === addedTabId), 'Closing active tab did not remove it');
  assert(state.activeTabId === initialActiveTabId, 'Closing active tab did not select neighboring tab');

  const tab = activeTab();
  assert(Boolean(tab), 'No active browser tab');
  if (tab) {
    setSection('browser');
    await clickControl('browser:favorites-popover-open', els.pageFavorite);
    assert(state.favoritesPopoverOpen && !els.favoritesPopover.hidden, 'Favorites toolbar button did not open the VidBrowser-style popover');
    assert(Math.round(els.favoritesPopover.getBoundingClientRect().width) === 320, 'Favorites popover should match the VidBrowser 320px width');
    await clickControl('browser:favorite-current', els.favoriteCurrentButton);
    assert(state.favorites.some((item) => item.url === tab.url), 'Favorite current-page action did not add the active page');
    assert(Boolean(els.favoritesPopoverContent.querySelector('.favorite-row')), 'Favorites popover did not render the saved page row');
    await clickControl('browser:favorites-popover-close', els.pageFavorite);
    assert(!state.favoritesPopoverOpen && els.favoritesPopover.hidden, 'Favorites toolbar button did not close its popover');
    setSection('browser');
    await clickControl('browser:media-refresh', els.sideRefresh);
    await clickControl('browser:media-clear', els.sideTrash);
    renderFavorites();
    assert(Number(els.favoritesCount.textContent) >= 1, 'Favorite count did not update');
    setFavorite(tab.url, tab.title, false);
  }

  const previousQueue = [...state.queue];
  const previousInput = els.urlInput.value;
  const previousStatus = state.activeDownloadStatus;
  const previousRange = state.downloadRange;
  const previousPage = state.downloadPage;
  const previousOutputDir = state.settings.outputDir;
  const previousSystemNetworkSpeed = { ...state.systemNetworkSpeed };
  state.systemNetworkSpeed = {
    available: true,
    receivedBytesPerSecond: 1024 * 1024,
    sentBytesPerSecond: 512 * 1024,
    totalBytesPerSecond: 1536 * 1024,
  };
  updateBrowserStatusBar();
  assert(els.browserStatusNetworkSpeed.textContent.trim() === '1.5 MB/s',
    `Bottom system network speed is incorrect: ${els.browserStatusNetworkSpeed.textContent.trim()}`);
  assert(els.browserStatusNetworkLabel.textContent === (BROWSER_STATUS_TEXT[state.locale] || BROWSER_STATUS_TEXT.en).network,
    'Bottom status bar does not identify system network speed');
  assert(els.browserStatusNetwork.classList.contains('is-active'), 'Bottom system network speed did not enter its active state');
  state.systemNetworkSpeed = { available: true, receivedBytesPerSecond: 0, sentBytesPerSecond: 0, totalBytesPerSecond: 0 };
  updateBrowserStatusBar();
  assert(els.browserStatusNetworkSpeed.textContent.trim() === '0 B/s'
    && !els.browserStatusNetwork.classList.contains('is-active'), 'Bottom system network speed did not reset at zero traffic');
  state.systemNetworkSpeed = previousSystemNetworkSpeed;
  state.downloadPage = 1;
  if (smokeDownload.real && smokeDownload.outputDir) {
    state.settings.outputDir = smokeDownload.outputDir;
    syncSettingsControls();
  }
  setSection('downloads');
  renderDownloads();
  const emptyHistory = [...state.history];
  const emptyFavorites = [...state.favorites];
  const emptyStateRects = [];
  const recordEmptyState = (section) => {
    const rect = document.querySelector(`#page-${section} .menu-empty-state .app-empty-image`)?.getBoundingClientRect();
    if (rect) emptyStateRects.push({ section, top: Math.round(rect.top), left: Math.round(rect.left), width: Math.round(rect.width) });
  };
  recordEmptyState('downloads');
  state.history = [];
  renderHistory();
  setSection('history');
  recordEmptyState('history');
  state.favorites = [];
  renderFavorites();
  setSection('favorites');
  recordEmptyState('favorites');
  assert(emptyStateRects.length === 3, `Menu empty-state artwork is missing: ${JSON.stringify(emptyStateRects)}`);
  assert(new Set(emptyStateRects.map((rect) => rect.top)).size === 1
    && new Set(emptyStateRects.map((rect) => rect.left)).size === 1
    && new Set(emptyStateRects.map((rect) => rect.width)).size === 1,
  `Download, history, and favorites empty states are not aligned: ${JSON.stringify(emptyStateRects)}`);
  state.history = emptyHistory;
  state.favorites = emptyFavorites;
  renderHistory();
  renderFavorites();
  setSection('downloads');
  const downloadsToolbarRect = document.querySelector('.downloads-toolbar').getBoundingClientRect();
  const downloadsViewRect = document.querySelector('.downloads-view').getBoundingClientRect();
  assert(Math.abs(downloadsToolbarRect.width - downloadsViewRect.width) <= 1, 'Downloads toolbar must span the full page width without a right-edge step');
  assert(els.downloadHeader.hidden, 'Empty downloads should not render the table header');
  const urlPanel = document.querySelector('.downloads-url-panel');
  urlPanel.open = true;
  assert(urlPanel.open, 'Download URL panel did not open');
  els.urlInput.value = smokeDownload.real && smokeDownload.urls?.[3]
    ? smokeDownload.urls[3]
    : 'https://example.com/video.mp4';
  await clickControl('downloads:start', els.startDownload);
  if (smokeDownload.real) {
    const deadline = Date.now() + 30000;
    while (Date.now() < deadline && state.queue.some((item) => !isTerminalDownloadState(item.state))) {
      await wait(250);
    }
    while (Date.now() < deadline && state.running) await wait(100);
  } else {
    await wait(120);
  }
  assert(state.queue.length === 1, 'Download queue did not add URL');
  assert(els.downloadBody.querySelectorAll('.download-item-row').length >= 1, 'Download item row did not render');
  assert(!els.downloadHeader.hidden, 'Download table header should render when rows exist');
  assert(els.downloadBody.querySelector('.download-status-cell.is-completed'),
    `Completed download status did not render: ${JSON.stringify(state.queue[0] || null)}`);
  if (smokeDownload.real) {
    const completedItem = state.queue[0];
    assert(Boolean(completedItem?.path && completedItem.path !== state.settings.outputDir), 'Real download did not retain its final media path');
    assert(Boolean(completedItem?.savePath && completedItem.savePath !== state.settings.outputDir), 'Real download did not retain its task folder');
    assert(Boolean(completedItem?.thumbnailPath), 'Real download did not retain its downloaded cover path');
    const openFileResult = await window.mediaDeck.openDownloadedFile(completedItem);
    const openFolderResult = await window.mediaDeck.openDownloadedFolder(completedItem);
    assert(openFileResult?.ok === true, `Completed media file could not be resolved: ${JSON.stringify(openFileResult)}`);
    assert(openFolderResult?.ok === true, `Completed task folder could not be resolved: ${JSON.stringify(openFolderResult)}`);
    assert(openFileResult?.path === completedItem.path, 'Open-file resolution did not use the final media path');
    assert(openFolderResult?.path === completedItem.savePath, 'Open-folder resolution did not use the task folder');
    const legacyIntermediatePath = completedItem.path.replace(/\.[^.]+$/, '.f140.m4a');
    const legacyOpenResult = await window.mediaDeck.openDownloadedFile({
      ...completedItem,
      path: legacyIntermediatePath,
    });
    assert(legacyOpenResult?.ok === true && legacyOpenResult.path === completedItem.path, 'Legacy intermediate stream path did not resolve to the merged media file');
  }
  const downloadActionButtons = Array.from(els.downloadBody.querySelectorAll('.download-actions-cell .el-button'));
  assert(downloadActionButtons.length >= 2, 'Completed download row did not render its action buttons');
  assert(downloadActionButtons.every((button) => {
    const buttonRect = button.getBoundingClientRect();
    const iconRect = button.querySelector('.ui-icon')?.getBoundingClientRect();
    const style = getComputedStyle(button);
    return iconRect
      && ['flex', 'inline-flex'].includes(style.display)
      && Math.abs((buttonRect.left + buttonRect.right) / 2 - (iconRect.left + iconRect.right) / 2) <= 1
      && Math.abs((buttonRect.top + buttonRect.bottom) / 2 - (iconRect.top + iconRect.bottom) / 2) <= 1;
  }), 'Download row action icons are not centered inside their buttons');
  state.queue[0].status = 'downloading';
  state.queue[0].state = 'downloading';
  updateDownloadBadge();
  assert(els.downloadBadge.hidden === false, 'Download badge did not show for active download');
  state.queue[0].status = 'completed';
  state.queue[0].state = 'completed';
  state.running = false;
  updateDownloadBadge();
  assert(els.downloadBadge.hidden === true, 'Download badge did not hide after downloads finished');
  renderDownloads();
  for (const status of ['all', 'queued', 'downloading', 'completed', 'error']) {
    await clickControl(`downloads:filter:${status}`, els.downloadFilters.querySelector(`[data-status="${status}"]`));
  }
  for (const range of ['all', 'today', 'yesterday', 'last7', 'last30']) {
    els.downloadRange.value = range;
    els.downloadRange.dispatchEvent(new Event('change'));
    clicked.push(`downloads:range:${range}`);
  }
  state.activeDownloadStatus = 'all';
  state.downloadRange = 'all';
  renderDownloads();
  await clickControl('downloads:preview-file', els.downloadBody.querySelector('[data-preview]'));
  assert(els.mediaPreviewOverlay.hidden === false, 'Completed download did not open the built-in media preview');
  closeMediaPreview();
  await clickControl('downloads:open-folder', els.downloadBody.querySelector('[data-folder]'));
  await clickControl('downloads:remove', els.downloadBody.querySelector('[data-remove]'));
  state.queue = [{
    id: 'self-test-error-download',
    downloadId: 'self-test-error-download',
    url: 'https://example.com/retry.mp4',
    fileName: 'retry.mp4',
    title: 'retry.mp4',
    percent: 12,
    downloaded: '12 KB',
    size: '100 KB',
    speed: '-',
    time: new Date().toISOString(),
    createdAt: Date.now(),
    status: 'error',
    state: 'error',
    path: state.settings.outputDir,
    savePath: state.settings.outputDir,
  }];
  renderDownloads();
  assert(!els.retryFailedDownloads.hidden, 'Failed downloads did not expose the batch retry action');
  const retryRowIdBefore = state.queue[0].id;
  await clickControl('downloads:retry', els.downloadBody.querySelector('[data-retry]'));
  await wait(120);
  assert(state.queue.length === 1, `Retry must reuse the failed row instead of creating a duplicate: ${state.queue.length}`);
  assert(state.queue[0]?.id === retryRowIdBefore, 'Retry changed the original download task identity');
  state.queue = Array.from({ length: DOWNLOAD_PAGE_SIZE + 1 }, (_, index) => ({
    id: `self-test-page-download-${index}`,
    downloadId: `self-test-page-download-${index}`,
    url: `https://example.com/page-${index}.mp4`,
    fileName: `page-${index}.mp4`,
    title: `page-${index}.mp4`,
    percent: 100,
    downloaded: '1 MB',
    size: '1 MB',
    speed: '-',
    time: new Date().toISOString(),
    createdAt: Date.now() - index,
    status: 'completed',
    state: 'completed',
    path: `C:\\self-test\\page-${index}.mp4`,
    savePath: 'C:\\self-test',
  }));
  state.activeDownloadStatus = 'all';
  state.downloadRange = 'all';
  state.downloadPage = 1;
  renderDownloads();
  assert(Boolean(els.downloadBody.querySelector('.downloads-pagination')), 'Download pagination did not render');
  await clickControl('downloads:next-page', els.downloadBody.querySelector('[data-download-page="next"]'));
  assert(state.downloadPage === 2, 'Download next page did not advance');
  await clickControl('downloads:previous-page', els.downloadBody.querySelector('[data-download-page="prev"]'));
  assert(state.downloadPage === 1, 'Download previous page did not go back');
  await clickControl('downloads:clear-finished', els.clearFinished);
  await clickControl('downloads:import-list', els.importUrls);
  await clickControl('downloads:choose-output', els.chooseOutput);
  await clickControl('downloads:cancel', els.cancelDownload);
  state.queue = previousQueue;
  els.urlInput.value = previousInput;
  state.activeDownloadStatus = previousStatus;
  state.downloadRange = previousRange;
  state.downloadPage = previousPage;
  state.settings.outputDir = previousOutputDir;
  syncSettingsControls();

  const mediaTestTabId = state.activeTabId;
  setMediaCandidatesForTab(mediaTestTabId, [{
    id: 'self-test-candidate',
    url: 'https://example.com/video.mp4',
    host: 'example.com',
    title: 'video.mp4',
    mime: 'video/mp4',
    extension: 'mp4',
    size: 1024,
    resourceType: 'media',
    isRecommended: true,
    formatId: '137+140',
    variants: [
      { url: 'https://example.com/video', formatId: '137+140', extension: 'mp4', qualityLabel: '1080p · H.264', resolution: 1080, videoCodec: 'H.264', audioCodec: 'AAC', sizeBytes: 4096 },
      { url: 'https://example.com/video', formatId: '22', extension: 'mp4', qualityLabel: '720p · H.264', resolution: 720, videoCodec: 'H.264', audioCodec: 'AAC', sizeBytes: 2048 },
    ],
    assets: {
      subtitles: [
        { id: 'subtitle-zh-Hans', assetType: 'subtitle', language: 'zh-Hans', name: 'Chinese (China)', extension: 'vtt', automatic: false },
        { id: 'subtitle-en', assetType: 'subtitle', language: 'en', name: 'English', extension: 'vtt', automatic: false },
      ],
    },
    detectedAt: new Date().toISOString(),
  }]);
  state.selectedCandidateIdsByTabId[mediaTestTabId] = 'self-test-candidate';
  assert(candidateMergeOutputFormat({ extension: 'm3u8' }) === 'mp4', 'HLS manifests must use a supported merged output container');
  assert(candidateDownloadUrl({ url: 'https://cdn.example/master.m3u8', pageUrl: 'https://example.com/watch', sourceClient: 'hls' }) === 'https://cdn.example/master.m3u8', 'HLS primary downloads must retain the master manifest');
  assert(candidateDownloadUrl({ url: 'https://cdn.example/file.mp4', pageUrl: 'https://example.com/watch', sourceClient: 'yt-dlp' }) === 'https://example.com/watch', 'yt-dlp metadata downloads must retain the page URL');
  setSection('browser');
  renderCandidates();
  assert(JSON.stringify(mediaResolutionOptions()) === JSON.stringify([1080, 720]), 'Resolution filter options must come from detected variants');
  assert(els.browserQuality.options[0]?.textContent === text('allResolutions')
    && els.browserQuality.options[1]?.textContent === '≥1080p', 'Resolution filter does not match VidBrowser minimum-resolution choices');
  assert(els.candidateList.querySelectorAll('.sniffer-resource-row').length >= 1, 'VidBrowser media candidate row did not render');
  assert(Boolean(els.candidateList.querySelector('[data-download-candidate="self-test-candidate"]')), 'VidBrowser media candidate download action did not render');
  assert(!els.candidateList.querySelector('[data-copy-candidate], [data-copy-variant], .sniffer-resource-copy'), 'Media panel must not render the removed copy-link controls');
  const savedBatchCollection = state.mediaCollectionsByTabId[mediaTestTabId];
  const savedBatchMode = state.mediaModeByTabId[mediaTestTabId];
  const savedBatchSelection = state.selectedBatchCandidateIdsByTabId[mediaTestTabId];
  state.mediaCollectionsByTabId[mediaTestTabId] = [
    { id: 'self-test-batch-1', url: 'https://example.com/1', title: 'Batch item 1' },
    { id: 'self-test-batch-2', url: 'https://example.com/2', title: 'Batch item 2' },
    { id: 'self-test-batch-3', url: 'https://example.com/3', title: 'Batch item 3' },
  ];
  state.mediaModeByTabId[mediaTestTabId] = 'batch';
  state.selectedBatchCandidateIdsByTabId[mediaTestTabId] = [];
  renderCandidates();
  await clickControl('browser:batch-select-second', els.candidateList.querySelector('[data-batch-candidate="self-test-batch-2"]'));
  await clickControl('browser:batch-select-third', els.candidateList.querySelector('[data-batch-candidate="self-test-batch-3"]'));
  assert(JSON.stringify(state.selectedBatchCandidateIdsByTabId[mediaTestTabId]) === JSON.stringify(['self-test-batch-2', 'self-test-batch-3']),
    `Individual batch selection was not retained: ${JSON.stringify(state.selectedBatchCandidateIdsByTabId[mediaTestTabId])}`);
  assert(els.candidateList.querySelectorAll('[data-batch-candidate]:checked').length === 2,
    'Batch candidate re-render did not preserve the selected subset');
  assert(els.batchSelectAll.indeterminate && !els.batchSelectAll.checked,
    'Select-all control did not show the partial-selection state');
  assert(!els.batchDownloadSelected.disabled, 'Batch download action stayed disabled after individual selection');
  await clickControl('browser:batch-deselect-second', els.candidateList.querySelector('[data-batch-candidate="self-test-batch-2"]'));
  assert(JSON.stringify(state.selectedBatchCandidateIdsByTabId[mediaTestTabId]) === JSON.stringify(['self-test-batch-3']),
    'An individually deselected batch item remained selected');
  state.mediaCollectionsByTabId[mediaTestTabId] = savedBatchCollection;
  state.mediaModeByTabId[mediaTestTabId] = savedBatchMode;
  state.selectedBatchCandidateIdsByTabId[mediaTestTabId] = savedBatchSelection;
  renderCandidates();
  const staleCandidateCount = mediaCandidatesForTab(mediaTestTabId).length;
  assert(candidateMatchesTabPage({ pageUrl: 'https://example.com/old-video' }, { url: 'https://example.com/new-video' }) === false, 'Candidates from a previous page must be rejected');
  assert(mediaCandidatesForTab(mediaTestTabId).length === staleCandidateCount, 'Stale-candidate validation changed the active media list');
  const mediaTestTab = activeTab();
  const savedMediaTestTabState = {
    url: mediaTestTab.url,
    activeMediaContext: mediaTestTab.activeMediaContext,
    activeMediaExtractionKey: mediaTestTab.activeMediaExtractionKey,
    activeMediaNetworkCandidates: mediaTestTab.activeMediaNetworkCandidates,
    candidates: [...mediaCandidatesForTab(mediaTestTabId)],
  };
  mediaTestTab.url = 'https://www.douyin.com/jingxuan?modal_id=7662233163963387177';
  mediaTestTab.activeMediaContext = {
    provider: 'douyin',
    mediaId: '7662233163963387177',
    canonicalUrl: 'https://www.douyin.com/video/7662233163963387177',
    title: 'Douyin active media',
    thumbnailUrl: null,
    directUrl: null,
    width: null,
    height: null,
    resolution: null,
    qualityLabel: '',
    sizeBytes: null,
    variants: [],
  };
  mediaTestTab.activeMediaExtractionKey = 'douyin:7662233163963387177';
  mediaTestTab.activeMediaNetworkCandidates = [];
  setMediaCandidatesForTab(mediaTestTabId, [activeMediaPlaceholder(mediaTestTab, mediaTestTab.activeMediaContext)]);
  addCandidate({
    id: 'douyin-hidden-network-candidate',
    url: 'https://v3-dy.example.com/video/tos/sample.mp4',
    pageUrl: 'https://www.douyin.com/jingxuan?modal_id=7662233163963387177',
    provider: 'douyin',
    kind: 'video',
    mime: 'video/mp4',
    size: 8_000_000,
    webContentsId: mediaTestTab.webContentsId,
    hiddenForActiveMedia: true,
  });
  assert(mediaCandidatesForTab(mediaTestTabId).length === 1, 'Hidden Douyin network media leaked into multiple visible rows');
  assert(mediaCandidatesForTab(mediaTestTabId)[0]?.url === 'https://v3-dy.example.com/video/tos/sample.mp4', 'Douyin active row was not enriched with its real network media URL');
  mediaTestTab.url = 'https://www.xiaohongshu.com/explore/6a768d1600000003202326a';
  handleXiaohongshuMediaContext(mediaTestTab, {
    provider: 'xiaohongshu',
    mediaId: '6a768d1600000003202326a',
    canonicalUrl: mediaTestTab.url,
    title: 'Xiaohongshu image note',
    thumbnailUrl: 'https://sns-webpic-qc.xhscdn.com/smoke/image-1.jpg',
    images: [
      { id: 'image-1', assetType: 'image', assetRole: 'gallery', extension: 'jpg', url: 'https://sns-webpic-qc.xhscdn.com/smoke/image-1.jpg', name: '图片 1' },
      { id: 'image-2', assetType: 'image', assetRole: 'gallery', extension: 'jpg', url: 'https://sns-webpic-qc.xhscdn.com/smoke/image-2.jpg', name: '图片 2' },
    ],
  });
  const xiaohongshuCandidate = mediaCandidatesForTab(mediaTestTabId)[0];
  assert(xiaohongshuCandidate?.kind === 'image' && candidateAssetOptions(xiaohongshuCandidate).length === 2,
    'Xiaohongshu image-note assets were not preserved');
  renderCandidates();
  assert(Boolean(els.candidateList.querySelector('[data-download-all-images="xiaohongshu-6a768d1600000003202326a"]')),
    'Xiaohongshu image note did not expose its all-image action');
  mediaTestTab.url = savedMediaTestTabState.url;
  mediaTestTab.activeMediaContext = savedMediaTestTabState.activeMediaContext;
  mediaTestTab.activeMediaExtractionKey = savedMediaTestTabState.activeMediaExtractionKey;
  mediaTestTab.activeMediaNetworkCandidates = savedMediaTestTabState.activeMediaNetworkCandidates;
  setMediaCandidatesForTab(mediaTestTabId, savedMediaTestTabState.candidates);
  renderCandidates();
  const selfTestDownloadRect = els.candidateList.querySelector('.sniffer-resource-download.has-variants')?.getBoundingClientRect();
  const selfTestSplitRect = els.candidateList.querySelector('.sniffer-resource-split-toggle')?.getBoundingClientRect();
  const selfTestDownloadButton = els.candidateList.querySelector('.sniffer-resource-download.has-variants');
  const selfTestDownloadIconRect = selfTestDownloadButton?.querySelector('.ui-icon')?.getBoundingClientRect();
  const selfTestDownloadTextRect = selfTestDownloadButton?.querySelector('span')?.getBoundingClientRect();
  assert(Boolean(selfTestDownloadRect && selfTestSplitRect
    && Math.abs(selfTestDownloadRect.right - selfTestSplitRect.left) <= 1
    && Math.abs(selfTestDownloadRect.height - selfTestSplitRect.height) <= 1), 'VidBrowser split download controls are misaligned');
  assert(Boolean(selfTestDownloadButton && ['flex', 'inline-flex'].includes(getComputedStyle(selfTestDownloadButton).display)), 'Download button is missing the Element Plus flex layout');
  assert(Boolean(selfTestDownloadRect && selfTestDownloadIconRect && selfTestDownloadTextRect
    && Math.abs((selfTestDownloadIconRect.left + selfTestDownloadTextRect.right) / 2
      - (selfTestDownloadRect.left + selfTestDownloadRect.right) / 2) <= 1.5), 'Download icon and label are not centered as one group');
  await clickControl('browser:media-variants', els.candidateList.querySelector('[data-toggle-candidate-variants="self-test-candidate"]'));
  assert(els.candidateList.querySelectorAll('.sniffer-resource-variant').length === 2, 'VidBrowser media candidate variants did not expand');
  assert(Boolean(els.candidateList.querySelector('[data-download-variant="self-test-candidate"]')), 'VidBrowser variant download action did not render');
  const subtitleSelectBeforeClick = els.candidateList.querySelector('[data-candidate-subtitle-select="self-test-candidate"]');
  subtitleSelectBeforeClick?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  assert(els.candidateList.querySelector('[data-candidate-subtitle-select="self-test-candidate"]') === subtitleSelectBeforeClick,
    'Clicking the subtitle language selector re-rendered and closed it');
  subtitleSelectBeforeClick.value = 'subtitle-en';
  subtitleSelectBeforeClick.dispatchEvent(new Event('change', { bubbles: true }));
  subtitleSelectBeforeClick.blur();
  renderCandidates();
  const retainedSubtitleSelect = els.candidateList.querySelector('[data-candidate-subtitle-select="self-test-candidate"]');
  assert(retainedSubtitleSelect?.value === 'subtitle-en'
    && retainedSubtitleSelect.selectedOptions[0]?.dataset.assetIndex === '1', 'Selected subtitle language was not retained after media refresh');
  const selfTestVariant = els.candidateList.querySelector('.sniffer-resource-variant');
  const selfTestVariantDownloadRect = selfTestVariant?.querySelector('.sniffer-resource-variant-download')?.getBoundingClientRect();
  const selfTestVariantRect = selfTestVariant?.getBoundingClientRect();
  assert(Boolean(selfTestVariantDownloadRect && selfTestVariantRect
    && Math.abs(selfTestVariantDownloadRect.left - selfTestVariantRect.left - 1) <= 1
    && Math.abs(selfTestVariantRect.right - selfTestVariantDownloadRect.right - 1) <= 1), `Variant download row does not fill its inner content box: ${Math.round(selfTestVariantDownloadRect?.width || 0)}px`);
  els.browserQuality.value = '1080';
  els.browserQuality.dispatchEvent(new Event('change'));
  assert(selectedMinimumResolution() === 1080, 'Resolution filter selection was not retained for the active tab');
  assert(candidateVariants(filterCandidatesByResolution(mediaCandidatesForTab(), 1080)[0]).length === 1, 'Minimum-resolution filter did not remove lower-resolution variants');
  els.browserQuality.value = '0';
  els.browserQuality.dispatchEvent(new Event('change'));
  const queueBeforeVariantDownloads = [...state.queue];
  await window.mediaDeck.configureEntitlements({ accountId: 'multi-variant-smoke@example.com', planLevel: 'ultimate' });
  state.queue = [];
  renderCandidates();
  const independentVariantButtons = Array.from(els.candidateList.querySelectorAll('[data-download-variant="self-test-candidate"]'));
  await clickControl('browser:download-variant-1080', independentVariantButtons[0]);
  await clickControl('browser:download-variant-720', independentVariantButtons[1]);
  await wait(220);
  const variantDownloadRows = state.queue.filter((item) => item.url === 'https://example.com/video');
  assert(variantDownloadRows.length === 2, `Each resolution must create its own download row, got ${variantDownloadRows.length}`);
  assert(new Set(variantDownloadRows.map((item) => item.formatId)).size === 2, 'Resolution downloads were merged by URL instead of format');
  assert(new Set(variantDownloadRows.map((item) => item.jobId)).size === 2,
    `Resolution downloads did not receive independent jobs: ${JSON.stringify(variantDownloadRows.map((item) => ({ formatId: item.formatId, jobId: item.jobId, requestKey: item.requestKey, state: item.state, error: item.errorMessage })))}`);
  await window.mediaDeck.configureEntitlements({ accountId: state.account?.email || null, planLevel: currentPlanLevel() });
  state.queue = queueBeforeVariantDownloads;
  setSection('browser');
  renderCandidates();
  await clickControl('browser:media-tab-all', els.allMedia);
  assert(state.browserSideTab === 'all', 'All media tab did not activate');
  await clickControl('browser:media-tab-recommend', els.recommend);
  assert(state.browserSideTab === 'recommend', 'Recommend media tab did not activate');
  const previousMediaCandidates = [...mediaCandidatesForTab(mediaTestTabId)];
  setMediaCandidatesForTab(mediaTestTabId, [{
    id: 'self-test-live-candidate',
    url: 'https://example.com/live',
    pageUrl: 'https://example.com/live',
    title: 'Live stream',
    kind: 'video',
    isLive: true,
    isRecommended: true,
    downloadStrategy: 'record',
    variants: [],
  }]);
  renderCandidates();
  assert(Boolean(els.candidateList.querySelector('[data-record-candidate="self-test-live-candidate"]')), 'Live media did not render the recording-required action');
  assert(!els.candidateList.querySelector('[data-download-candidate="self-test-live-candidate"]'), 'Live media incorrectly rendered a direct download button');
  resetTabMediaForNavigation(activeTab());
  assert(mediaCandidatesForTab(mediaTestTabId).length === 0, 'Page refresh/navigation did not clear the previous media candidate immediately');
  assert(els.candidateList.querySelectorAll('.sniffer-resource-row').length === 0, 'Media panel kept stale rows after page refresh/navigation');
  setMediaCandidatesForTab(mediaTestTabId, previousMediaCandidates);
  renderCandidates();
  const isolatedTab = createTab('https://example.com/isolated', 'Isolated tab');
  setSection('browser');
  assert(mediaCandidatesForTab(isolatedTab.id).length === 0, 'New browser tab inherited another tab media candidates');
  addCandidate({
    id: 'isolated-candidate',
    url: 'https://example.com/isolated.mp4',
    host: 'example.com',
    title: 'isolated.mp4',
    extension: 'mp4',
    size: 2048,
    resourceType: 'media',
    webContentsId: isolatedTab.webContentsId,
    detectedAt: new Date().toISOString(),
  });
  assert(mediaCandidatesForTab(isolatedTab.id).length === 1, 'Candidate was not stored on the active browser tab');
  const mediaTestTabButton = document.querySelector(`.tab[data-tab-id="${mediaTestTabId}"]`);
  await clickControl('tab:switch-media-test', mediaTestTabButton);
  assert(selectedCandidate()?.id === 'self-test-candidate', 'Switching tabs did not restore that tab media candidate selection');
  clearMediaCandidatesForTab(mediaTestTabId);
  clearMediaCandidatesForTab(isolatedTab.id);
  closeTab(isolatedTab.id);

  addHistory('Self test history', 'https://example.com/history');
  setSection('history');
  await clickControl('history:item', els.historyList.querySelector('.history-open'));
  setSection('history');
  assert(!els.historyList.querySelector('[data-history-remove]'), 'History rows should match VidBrowser and omit per-row delete buttons');
  addHistory('Self test history', 'https://example.com/history');
  setSection('history');
  await clickControl('history:clear', els.historyClear);

  setFavorite('https://example.com/favorite', 'Self test favorite', true);
  setSection('favorites');
  await clickControl('favorites:item', document.querySelector('.favorite-list .history-open'));
  setSection('favorites');
  assert(!document.querySelector('#favorites-add-current'), 'Favorites page should only manage saved rows');
  await clickControl('favorites:remove', document.querySelector('.favorite-list [data-favorite-remove]'));

  setSection('plans');
  const renderedPlanLevels = Array.from(els.planCards.querySelectorAll('[data-plan-level]'), (card) => card.dataset.planLevel);
  const renderedPlanCodes = Array.from(els.planCards.querySelectorAll('[data-plan-code]'), (button) => button.dataset.planCode);
  assert(JSON.stringify(renderedPlanLevels) === JSON.stringify(PLAN_LEVELS), `Plan levels differ from VidBrowser: ${renderedPlanLevels.join(', ')}`);
  assert(JSON.stringify(renderedPlanCodes) === JSON.stringify(Object.keys(PLAN_PRODUCTS)), `Plan purchase choices differ from VidBrowser: ${renderedPlanCodes.join(', ')}`);
  assert(els.planTable.querySelectorAll('[data-plan-comparison]').length === 11, 'Plan comparison must contain all 11 VidBrowser rows');
  assert(els.planTable.querySelector('[data-plan-comparison="dailyDownloadsRecording"]')?.textContent.includes('5'), 'Free daily plan limit must be 5');
  assert(els.planTable.querySelector('[data-plan-comparison="concurrentDownloads"]')?.textContent.includes('10'), 'Ultimate plan concurrency must be 10');
  assert(els.paymentChannels.length === 1 && els.paymentChannels[0].disabled, 'Desktop checkout must use the management platform payment provider.');
  await clickControl('plans:select-pro-year', document.querySelector('[data-plan-code="pro_year"]'));
  await clickControl('plans:purchase-needs-login', els.purchaseButton);
  setSection('account');
  await clickControl('account:register-mode', els.registerModeButton);
  els.loginEmail.value = 'selftest@example.com';
  els.loginPassword.value = 'password123';
  els.confirmPassword.value = 'password123';
  await clickControl('account:register', els.registerButton);
  await waitFor(() => state.accountMode === 'login');
  assert(!state.account?.email && state.accountMode === 'login', 'Registration must return to sign-in instead of creating an authenticated session');
  els.loginPassword.value = 'password123';
  await clickControl('account:login-after-register', els.loginButton);
  await waitFor(() => state.account?.email === 'selftest@example.com');
  assert(state.account?.email === 'selftest@example.com', 'Management-platform login after registration did not sign in');
  assert(!els.accountRefresh.classList.contains('hidden') && !els.accountOrdersPanel.classList.contains('hidden'), 'Signed-in account controls did not become visible');
  await clickControl('account:refresh', els.accountRefresh);
  await clickControl('account:view-plans', els.accountViewPlans);
  assert(els.pages.plans?.classList.contains('active'), 'View plans did not switch to plans');
  setSection('account');
  await clickControl('account:change-password-toggle', els.accountChangePasswordToggle);
  els.oldPassword.value = 'password123';
  els.newPassword.value = 'password456';
  await clickControl('account:save-password', els.savePasswordButton);
  await waitFor(() => !els.newPassword.value && !state.passwordPanelOpen);
  await clickControl('account:logout', els.logoutButton);
  await waitFor(() => !state.account?.email);
  await clickControl('account:login-mode', els.loginModeButton);
  els.loginEmail.value = 'selftest@example.com';
  els.loginPassword.value = 'password456';
  await clickControl('account:login', els.loginButton);
  await waitFor(() => state.account?.email === 'selftest@example.com');
  assert(state.account?.email === 'selftest@example.com', 'Management-platform login did not sign in');
  setSection('plans');
  const planBeforePurchase = state.account.plan;
  await clickControl('plans:purchase', els.purchaseButton);
  await waitFor(() => state.orders.length > previousOrders.length);
  assert(state.orders.length > previousOrders.length, 'Management-platform purchase did not create an order');
  assert(state.account.plan === planBeforePurchase, 'Creating a payment order must not activate a plan before payment is confirmed');
  assert(state.orders[0]?.status === 'pending', 'New payment order should remain pending');
  setSection('account');
  assert(!els.ordersList.querySelector('[data-order-pay], [data-order-remove]'), 'Server-style account orders must not expose local payment or delete controls');

  state.account.plan = 'pro';
  const selfTestUser = findLocalUser('selftest@example.com');
  if (selfTestUser) upsertLocalUser({ ...selfTestUser, plan: 'pro' });
  await syncRecordingConfiguration();
  assert(state.entitlements?.planLevel === 'pro', 'Confirmed Pro plan did not reach main-process entitlements');
  assert(state.entitlements?.maxConcurrentDownloads === 5, 'Pro concurrency entitlement must be 5');
  assert(state.entitlements?.recordingDurationLimitMs === 30 * 60 * 1000, 'Pro recording limit must be 30 minutes');
  updateAccountCopy();
  renderPlans();

  setSection('settings');
  assert(els.settingsNav.length === 4 && els.settingsPanels.length === 4 && !document.querySelector('[data-settings-section="editors"]'), 'Editing-app settings should be merged into Preferences without a separate navigation item');
  await clickControl('settings:section-downloads', document.querySelector('[data-settings-section="downloads"]'));
  await clickControl('settings:choose-output', els.settingsChooseOutput);
  await clickControl('settings:reset-output', els.settingsResetOutput);
  updateConcurrentDownloads(1, false);
  await clickControl('settings:concurrency-increase', els.settingsConcurrencyIncrease);
  assert(state.settings.maxConcurrentDownloads === 2, 'Concurrency increase button did not increment');
  await clickControl('settings:concurrency-decrease', els.settingsConcurrencyDecrease);
  assert(state.settings.maxConcurrentDownloads === 1, 'Concurrency decrease button did not decrement');
  els.settingsConcurrency.value = '2';
  els.settingsConcurrency.dispatchEvent(new Event('change'));
  clicked.push('settings:concurrency');
  await clickControl('settings:section-preferences', document.querySelector('[data-settings-section="preferences"]'));
  await changeControl('settings:search-bing', els.settingsSearchEngine, 'bing');
  assert(state.settings.searchEngine === 'bing', 'Default search engine setting was not restored');
  assert(els.settingsEditor.options.length === 2 && state.editor.selected?.name, 'Detected editing apps did not render in settings');
  await changeControl('settings:editor-premiere', els.settingsEditor, 'premiere-pro');
  await waitFor(() => state.editor.selected?.id === 'premiere-pro', 1500);
  assert(state.editor.selected?.name === 'Adobe Premiere Pro' && els.settingsEditorPath.value.includes('Premiere'), 'Changing the default editing app did not update its dynamic name and path');
  renderLibrary();
  assert(els.libraryContent.querySelector('[data-library-project-import]')?.title.includes('Adobe Premiere Pro'), 'Editor import labels must follow the selected editing app');
  await clickControl('settings:editor-scan', els.settingsEditorScan);
  await waitFor(() => !state.editor.scanning, 1500);
  assert(state.editor.editors.length === 2, 'Editing-app rescan lost detected applications');
  await clickControl('settings:editor-manual', els.settingsEditorChoose);
  assert(els.address.readOnly, 'Browser address display must remain read-only');
  await clickControl('settings:section-interface', document.querySelector('[data-settings-section="interface"]'));
  await changeControl('settings:theme-light', els.settingsTheme, 'light');
  await changeControl('settings:language-en', els.settingsLanguage, 'en');
  await changeControl('settings:adblock-off', els.settingsAdBlock, false);
  assert(state.settings.adBlocker === false, 'Ad blocker setting did not disable');
  await changeControl('settings:adblock-on', els.settingsAdBlock, true);
  assert(state.settings.adBlocker === true, 'Ad blocker setting did not enable');
  await clickControl('settings:section-about', document.querySelector('[data-settings-section="about"]'));
  await clickControl('settings:check-update', els.settingsCheckUpdate);
  await wait(60);
  assert(els.settingsVersion.textContent.includes('VidoGo'), 'Settings version did not render');
  assert(els.settingsLatestVersion.textContent === '0.2.0', 'Latest GitHub release version did not render after update check');
  assert(state.updateInfo?.available === true && state.updateInfo?.source === 'github', 'Available GitHub update state was not retained');
  assert(els.settingsCheckUpdate.textContent === text('openRelease'), 'Available update did not expose its download page action');
  await clickControl('settings:open-update-release', els.settingsCheckUpdate);

  state.settings = previousSettings;
  state.history = previousHistory;
  state.favorites = previousFavorites;
  state.account = previousAccount;
  state.users = previousUsers;
  state.orders = previousOrders;
  state.selectedPlan = previousSelectedPlan;
  state.paymentChannel = previousPaymentChannel;
  state.updateInfo = previousUpdateInfo;
  state.library = previousLibrary;
  els.settingsLatestVersion.textContent = previousLatestVersion;
  els.loginEmail.value = '';
  els.loginPassword.value = '';
  els.confirmPassword.value = '';
  els.oldPassword.value = '';
  els.newPassword.value = '';
  state.passwordPanelOpen = false;
  state.theme = previousTheme;
  state.locale = previousLocale;
  state.activeDownloadStatus = 'all';
  applyTheme();
  applyLocale();
  syncSettingsControls();
  await syncRecordingConfiguration();
  await wait(220);
  document.querySelector('.downloads-url-panel')?.removeAttribute('open');
  // Exercise the original last-tab regression explicitly. Closing every
  // browser tab must return to the launcher without leaving the browser page,
  // an orphaned webview, or the media panel in a split/stacked layout.
  for (const tab of [...state.tabs].filter((item) => !item.internal)) closeTab(tab.id);
  await wait(120);
  assert(state.tabs.every((tab) => tab.internal), 'Closing all browser tabs left a visible browser tab behind');
  assert(state.activeTabId === null, 'Closing the final browser tab did not clear the active tab');
  assert(state.section === 'home' && els.pages.home?.classList.contains('active'),
    'Closing the final browser tab did not return to the platform launcher');
  assert(getVisibleWebviews().length === 0, 'Closing the final browser tab left an orphaned webview visible');
  assert(!els.pages.browser?.classList.contains('active'), 'Closing the final browser tab left the browser page active');
  openUrl('https://example.com/final-tab', 'Final tab');
  await wait(120);
  assert(state.section === 'browser' && state.tabs.filter((tab) => !tab.internal).length === 1,
    'Opening a site after closing the final tab did not recreate the browser workspace');
  assert(getVisibleWebviews().length === 1, 'Reopened browser workspace did not show exactly one webview');
  els.toastRegion.innerHTML = '';
  const finalLayout = getBrowserLayoutSnapshot();
  assert(finalLayout.activePageIds.length === 1 && finalLayout.activePageIds[0] === 'page-browser', `Final layout left invalid active pages: ${finalLayout.activePageIds.join(', ')}`);
  assert(finalLayout.visibleWebviews === 1, 'Final layout should leave exactly one visible webview');
  saveState();

  return {
    ok: failures.length === 0,
    failures,
    pages: Object.keys(els.pages).length,
    quickSites: document.querySelectorAll('.popular-site-button img, .site-card img').length,
    tabs: state.tabs.length,
    backendMode: runtimeInfo?.backendMode || null,
    clicked,
  };
}

async function runRecorderFlowTest() {
  const failures = [];
  const assert = (condition, message) => {
    if (!condition) failures.push(message);
  };
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  window.__VIDOGO_SELF_TEST_PROGRESS = 'recorder-flow:creating-video';
  state.queue = [];
  state.tabs.forEach((tab) => tab.webview.remove());
  state.tabs = [];
  state.activeTabId = null;
  state.mediaPanelVisible = false;
  state.settings.recordingEnabled = true;
  await syncRecordingConfiguration();

  const testPage = `<!doctype html>
    <html><head><meta charset="utf-8"><title>VidoGo Recorder Smoke</title>
    <style>
      html,body{width:100%;height:100%;margin:0;overflow:hidden;background:#070b11;color:#eef4fb;font-family:system-ui}
      body{display:grid;place-items:center}.stage{width:min(900px,88vw);display:grid;gap:16px}
      #movie_player{display:block}video{display:block;width:100%;aspect-ratio:16/9;border-radius:18px;background:#111827;box-shadow:0 24px 70px #0009}
      h1{margin:0;font-size:18px;font-weight:650;color:#dce7f3}.hint{color:#8291a6;font-size:13px}
      canvas{display:none}
    </style></head><body><div class="stage"><h1>VidoGo 网页视频录制测试</h1><div id="movie_player"><video id="video" muted autoplay playsinline></video></div><div class="hint">悬浮录制条 · 1× / 2× / 4× · 全程录制</div></div><canvas id="source" width="1280" height="720"></canvas>
    <script>
      const canvas=document.querySelector('#source'); const ctx=canvas.getContext('2d'); let frame=0;
      function draw(){frame+=1;const g=ctx.createLinearGradient(0,0,1280,720);g.addColorStop(0,'#ff6b16');g.addColorStop(1,'#1ab8d5');ctx.fillStyle=g;ctx.fillRect(0,0,1280,720);ctx.fillStyle='#07101d';ctx.fillRect(70,70,1140,580);ctx.fillStyle='#fff';ctx.font='700 72px system-ui';ctx.fillText('VidoGo Recorder',170,320);ctx.font='500 34px system-ui';ctx.fillText('frame '+frame,170,390);requestAnimationFrame(draw)}
      draw(); const video=document.querySelector('#video'); video.srcObject=canvas.captureStream(24);
      const player=document.querySelector('#movie_player'); window.__requestedQuality=null; window.__qualityRequests=[];
      player.getAvailableQualityLevels=()=>['hd720','medium']; player.getPlaybackQuality=()=>window.__requestedQuality||'medium';
      player.setPlaybackQualityRange=(quality)=>{window.__requestedQuality=quality;window.__qualityRequests.push(['range',quality])};
      player.setPlaybackQuality=(quality)=>{window.__requestedQuality=quality;window.__qualityRequests.push(['quality',quality])};
      window.__recorderVideoReady=false; video.addEventListener('playing',()=>{window.__recorderVideoReady=true},{once:true}); video.play();
    <\/script></body></html>`;
  const tab = createTab(`data:text/html;charset=utf-8,${encodeURIComponent(testPage)}`, 'Recorder Smoke');
  setSection('browser');
  setVisibleWebviews();

  const deadline = Date.now() + 10_000;
  let readiness = null;
  while (Date.now() < deadline) {
    try {
      readiness = await tab.webview.executeJavaScript(`({
        videoReady: Boolean(window.__recorderVideoReady),
        apiReady: Boolean(window.__vidogoRecorderSmoke),
        readyState: document.querySelector('video')?.readyState || 0,
        tracks: document.querySelector('video')?.srcObject?.getTracks?.().length || 0
      })`, true);
      if (readiness?.videoReady && readiness?.apiReady && readiness?.tracks > 0) break;
    } catch {
      // The guest preload and page are still attaching.
    }
    await wait(100);
  }
  assert(readiness?.videoReady, `Recorder smoke video did not start: ${JSON.stringify(readiness)}`);
  assert(readiness?.apiReady, 'Recorder smoke bridge was not exposed by the webview preload');
  assert(readiness?.tracks > 0, 'Recorder smoke source has no media tracks');

  window.__VIDOGO_SELF_TEST_PROGRESS = 'recorder-flow:recording';
  let startResult = null;
  let activeSnapshot = null;
  let stopResult = null;
  if (readiness?.apiReady) {
    startResult = await tab.webview.executeJavaScript('window.__vidogoRecorderSmoke.startFirstVideo(false)', true);
    await wait(2400);
    activeSnapshot = await tab.webview.executeJavaScript('window.__vidogoRecorderSmoke.snapshot()', true);
    stopResult = await tab.webview.executeJavaScript('window.__vidogoRecorderSmoke.stop()', true);
  }
  assert(startResult?.ok === true && startResult?.sessionId, `Recorder did not start: ${JSON.stringify(startResult)}`);
  assert(activeSnapshot?.installed && activeSnapshot?.active && activeSnapshot?.visible, `Recorder toolbar was not active and visible: ${JSON.stringify(activeSnapshot)}`);
  assert(activeSnapshot?.buttonCount === 5, `Recorder toolbar control count is incorrect: ${activeSnapshot?.buttonCount}`);
  assert(JSON.stringify(activeSnapshot?.speedButtons) === JSON.stringify([1, 2, 4]), 'Recorder playback-rate controls are incomplete');
  assert(String(activeSnapshot?.mimeType || '').startsWith('video/webm'), `Recorder MIME type is unexpected: ${activeSnapshot?.mimeType}`);
  assert(activeSnapshot?.quality?.width === 1280 && activeSnapshot?.quality?.height === 720, `Recorder did not preserve the source resolution: ${JSON.stringify(activeSnapshot?.quality)}`);
  assert(activeSnapshot?.qualitySelection?.requested === 'hd720' && activeSnapshot?.qualitySelection?.ready === true, `Recorder did not request the player's highest quality: ${JSON.stringify(activeSnapshot?.qualitySelection)}`);
  assert(Number(activeSnapshot?.actualVideoBitsPerSecond || 0) >= 12_000_000, `Recorder high-quality bitrate was not applied: ${activeSnapshot?.actualVideoBitsPerSecond}`);
  assert(activeSnapshot?.recordingDurationLimitMs === 5 * 60 * 1000, `Free recording duration limit did not reach the recorder: ${activeSnapshot?.recordingDurationLimitMs}`);
  assert(stopResult?.ok === true && stopResult?.bytes > 0, `Recorder did not save media bytes: ${JSON.stringify(stopResult)}`);
  assert(String(stopResult?.path || '').toLowerCase().endsWith('.webm'), `Recorder output extension is incorrect: ${stopResult?.path}`);

  const eventDeadline = Date.now() + 5000;
  let row = recordingRowForEvent({ sessionId: startResult?.sessionId });
  while (Date.now() < eventDeadline && normalizeDownloadState(row?.state) !== 'completed') {
    await wait(100);
    row = recordingRowForEvent({ sessionId: startResult?.sessionId });
  }
  assert(row?.source === 'recording', 'Recording task did not enter the unified download list');
  assert(normalizeDownloadState(row?.state) === 'completed', `Recording task did not complete: ${row?.state}`);
  assert(row?.path === stopResult?.path, 'Recording task path does not match the saved file');
  await tab.webview.executeJavaScript('window.__vidogoRecorderSmoke.showFirstVideo()', true).catch(() => false);
  await wait(250);
  renderDownloads();
  saveState();
  window.__VIDOGO_SELF_TEST_PROGRESS = 'recorder-flow:done';
  return {
    ok: failures.length === 0,
    failures,
    readiness,
    startResult,
    activeSnapshot,
    stopResult,
    row: row ? { source: row.source, state: row.state, path: row.path, size: row.size } : null,
    browserLayout: getBrowserLayoutSnapshot(),
  };
}

async function runResolverFlowTest(pageUrl) {
  const failures = [];
  const targetUrl = String(pageUrl || '').trim();
  let directDownloadResult = null;
  window.__VIDOGO_SELF_TEST_PROGRESS = 'resolver-flow:resolving';
  if (!/^https?:\/\//i.test(targetUrl)) failures.push('Resolver smoke URL is missing or invalid');
  const candidate = targetUrl ? await resolveCollectionDownloadCandidate({
    url: targetUrl,
    pageUrl: targetUrl,
    provider: 'agedm',
    sourceClient: 'collection-page',
    title: 'Resolver smoke episode',
    fileName: 'Resolver smoke episode',
  }).catch(() => null) : null;
  if (!candidate?.url) failures.push('Resolver did not return a media candidate after retry');
  if (candidate?.url === targetUrl) failures.push('Resolver returned the page URL instead of a media URL');
  if (candidate && candidate.downloadStrategy !== 'direct' && candidate.kind !== 'playlist') {
    failures.push('Resolver did not return a downloadable strategy');
  }
  if (candidate?.url && window.mediaDeckSmokeDownload?.real && window.mediaDeckSmokeDownload?.outputDir) {
    state.settings.outputDir = window.mediaDeckSmokeDownload.outputDir;
    const placeholder = {
      url: targetUrl,
      pageUrl: targetUrl,
      provider: 'agedm',
      title: 'Resolver smoke episode',
      fileName: 'Resolver smoke episode',
      sourceClient: 'collection-page',
    };
    const [mountedRow] = queueUrls([targetUrl], placeholder);
    const mountedRowId = String(mountedRow?.id || mountedRow?.downloadId || '');
    if (!mountedRow || normalizeDownloadState(mountedRow.state || mountedRow.status) !== 'queued' || mountedRow.jobId) {
      failures.push('Episode task was not mounted immediately as an idle queued row');
    }
    const result = await startDownload({
      ...candidate,
      title: placeholder.title,
      fileName: placeholder.fileName,
      pageUrl: targetUrl,
      retryRowId: mountedRowId,
      backgroundResolvePage: false,
      suppressToast: true,
    });
    let row = state.queue.find((item) => String(item.id || item.downloadId) === mountedRowId);
    const deadline = Date.now() + 35_000;
    while (Date.now() < deadline && row && !isTerminalDownloadState(row.status || row.state)) {
      if (normalizeDownloadState(row.status || row.state) === 'downloading' && row.downloaded !== '-') break;
      await waitForDelay(100);
      row = state.queue.find((item) => String(item.id || item.downloadId) === mountedRowId);
    }
    if (normalizeDownloadState(row?.status || row?.state) === 'downloading') {
      await controlDownloadRow(row, 'pause');
    }
    directDownloadResult = row ? {
      state: normalizeDownloadState(row.status || row.state),
      downloaded: row.downloaded,
      sourceClient: row.sourceClient,
      errorMessage: row.errorMessage || null,
    } : null;
    if (!result?.started) failures.push('Resolved AGE media did not create a download job');
    if (state.queue.filter((item) => String(item.id || item.downloadId) === mountedRowId).length !== 1) {
      failures.push('Resolved AGE media did not reuse the mounted task row');
    }
    if (directDownloadResult?.state !== 'paused') {
      failures.push('Resolved AGE media did not receive bytes and pause: '
        + (directDownloadResult?.errorMessage || directDownloadResult?.state || 'missing row'));
    }
  }
  window.__VIDOGO_SELF_TEST_PROGRESS = 'resolver-flow:done';
  return {
    ok: failures.length === 0,
    failures,
    candidate: candidate ? {
      url: candidate.url,
      pageUrl: candidate.pageUrl,
      referrer: candidate.referrer,
      kind: candidate.kind,
      mimeType: candidate.mimeType || candidate.mime,
      sizeBytes: candidate.sizeBytes || candidate.size || null,
      sourceClient: candidate.sourceClient,
      downloadStrategy: candidate.downloadStrategy,
    } : null,
    directDownloadResult,
  };
}

async function runOwnerFlowTest(password) {
  const failures = [];
  const assert = (condition, message) => { if (!condition) failures.push(message); };
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  window.__VIDOGO_SELF_TEST_PROGRESS = 'owner-flow:login';
  await window.mediaDeck.logoutAccount().catch(() => null);
  state.account = {};
  state.orders = [];
  state.settings.recordingEnabled = false;
  const login = await window.mediaDeck.loginAccount({ email: 'moote@gmail.com', password: String(password || '') });
  state.account = login?.user || {};
  await refreshRemoteAccount();
  const configuration = await syncRecordingConfiguration();
  assert(state.account.email === 'moote@gmail.com', 'Built-in owner login did not return the expected account.');
  assert(state.account.plan === 'owner' && state.account.builtin === true, 'Built-in owner identity is missing.');
  assert(state.entitlements?.dailyLimit === null && state.entitlements?.remainingToday === null, 'Owner daily downloads are not unlimited.');
  assert(state.entitlements?.maxConcurrentDownloads === null, 'Owner concurrent downloads are not unlimited.');
  assert(configuration?.recordingEnabled === false, 'Recording must remain disabled by default.');

  window.__VIDOGO_SELF_TEST_PROGRESS = 'owner-flow:unlimited-concurrency';
  const urls = Array.from({ length: 12 }, (_, index) => `https://example.com/owner-${index + 1}.mp4`);
  const queue = await window.mediaDeck.startDownload({
    urls,
    outputDir: state.settings.outputDir,
    resolution: 'best',
    maxConcurrentDownloads: 1,
  });
  assert(queue?.activeCount === urls.length, `Owner concurrency was capped: ${queue?.activeCount}/${urls.length}`);
  assert(queue?.queuedCount === 0, `Owner downloads were unexpectedly queued: ${queue?.queuedCount}`);

  window.__VIDOGO_SELF_TEST_PROGRESS = 'owner-flow:recording-switch';
  setSection('settings');
  setSettingsSection('preferences');
  syncSettingsControls();
  assert(els.settingsRecording.checked === false, 'Recording switch should be off by default.');
  assert(els.settingsConcurrency.disabled && els.settingsConcurrency.placeholder === '∞', 'Owner concurrency should be shown as unlimited.');
  els.settingsRecording.checked = true;
  els.settingsRecording.dispatchEvent(new Event('change', { bubbles: true }));
  await wait(100);
  const enabled = await window.mediaDeck.configureRecording({
    outputDir: state.settings.outputDir,
    maxConcurrentDownloads: 1,
    enabled: true,
    accountId: state.account.email,
    planLevel: 'owner',
  });
  assert(enabled?.recordingEnabled === true, 'Recording switch did not enable recording.');
  els.settingsRecording.checked = false;
  els.settingsRecording.dispatchEvent(new Event('change', { bubbles: true }));
  await wait(100);
  const disabled = await window.mediaDeck.configureRecording({
    outputDir: state.settings.outputDir,
    maxConcurrentDownloads: 1,
    enabled: false,
    accountId: state.account.email,
    planLevel: 'owner',
  });
  assert(disabled?.recordingEnabled === false, 'Recording switch did not disable recording.');
  els.toastRegion.innerHTML = '';
  await wait(120);
  saveState();
  window.__VIDOGO_SELF_TEST_PROGRESS = 'owner-flow:done';
  return {
    ok: failures.length === 0,
    failures,
    account: { email: state.account.email, plan: state.account.plan, builtin: state.account.builtin },
    entitlements: state.entitlements,
    queue: { activeCount: queue?.activeCount, queuedCount: queue?.queuedCount },
    recording: { defaultEnabled: configuration?.recordingEnabled, enabled: enabled?.recordingEnabled, disabled: disabled?.recordingEnabled },
  };
}

async function runRtlLocaleTest() {
  const failures = [];
  const assert = (condition, message) => {
    if (!condition) failures.push(message);
  };
  window.__VIDOGO_SELF_TEST_PROGRESS = 'locale-rtl:applying-arabic';
  state.locale = 'ar';
  setSection('settings');
  setSettingsSection('interface');
  applyLocale();
  syncSettingsControls();
  await new Promise((resolve) => setTimeout(resolve, 350));

  const appSidebar = document.querySelector('.sidebar')?.getBoundingClientRect();
  const main = document.querySelector('.main')?.getBoundingClientRect();
  const settingsSidebar = document.querySelector('.settings-sidebar')?.getBoundingClientRect();
  const settingsContent = document.querySelector('.settings-content')?.getBoundingClientRect();
  const addressDirection = getComputedStyle(els.address).direction;
  const languageValues = Array.from(els.settingsLanguage.options, (option) => option.value);

  assert(document.documentElement.lang === 'ar', 'Arabic language was not applied');
  assert(document.documentElement.dir === 'rtl', 'Arabic document direction is not RTL');
  assert(appSidebar && main && appSidebar.left > main.left, 'Main sidebar did not mirror to the right edge');
  assert(settingsSidebar && settingsContent && settingsSidebar.left > settingsContent.left, 'Settings sidebar did not mirror to the right edge');
  assert(addressDirection === 'ltr', 'URL address input must remain left-to-right in RTL mode');
  assert(languageValues.join(',') === I18N.localeOrder.join(','), 'Language selector does not contain the reference locale order');
  assert(document.getElementById('settings-title')?.textContent === TEXT_TABLES.ar.settingsTitle, 'Arabic settings title was not rendered');
  assert(document.getElementById('settings-nav-interface')?.textContent === TEXT_TABLES.ar.settingsInterface, 'Arabic settings navigation was not rendered');
  assert(document.querySelector('.sidebar-btn[data-section="settings"]')?.getAttribute('aria-label') === TEXT_TABLES.ar.settings, 'Arabic sidebar accessibility label was not rendered');

  window.__VIDOGO_SELF_TEST_PROGRESS = 'locale-rtl:done';
  return {
    ok: failures.length === 0,
    failures,
    locale: state.locale,
    direction: document.documentElement.dir,
    languageValues,
    addressDirection,
    geometry: {
      appSidebar: appSidebar ? { left: Math.round(appSidebar.left), right: Math.round(appSidebar.right), width: Math.round(appSidebar.width) } : null,
      main: main ? { left: Math.round(main.left), right: Math.round(main.right), width: Math.round(main.width) } : null,
      settingsSidebar: settingsSidebar ? { left: Math.round(settingsSidebar.left), right: Math.round(settingsSidebar.right), width: Math.round(settingsSidebar.width) } : null,
      settingsContent: settingsContent ? { left: Math.round(settingsContent.left), right: Math.round(settingsContent.right), width: Math.round(settingsContent.width) } : null,
    },
  };
}

async function runManifestFlowTest(pageUrl) {
  const failures = [];
  const assert = (condition, message) => {
    if (!condition) failures.push(message);
  };
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  window.__VIDOGO_SELF_TEST_PROGRESS = 'manifest-flow:opening-page';
  assert(/^https?:\/\//.test(String(pageUrl || '')), 'Manifest smoke page URL is missing');
  state.tabs.forEach((tab) => tab.webview.remove());
  state.tabs = [];
  state.activeTabId = null;
  state.candidatesByTabId = {};
  state.selectedCandidateIdsByTabId = {};
  state.selectedMinimumResolutionByTabId = {};
  state.mediaPanelVisible = true;
  const tab = createTab(pageUrl, 'HLS test');
  setSection('browser');
  let candidate = null;
  const deadline = Date.now() + 12_000;
  while (Date.now() < deadline) {
    await wait(100);
    candidate = mediaCandidatesForTab(tab.id).find((item) => item.metadataSource === 'hls-manifest');
    if (candidate && candidateVariants(candidate).length === 2) break;
  }
  renderCandidates();
  const variants = candidateVariants(candidate);
  assert(Boolean(candidate), 'HLS manifest was not enriched in the browser session');
  assert(candidate?.isRecommended === true && candidate?.sourceClient === 'hls', 'Valid HLS media was not recommended');
  assert(candidate?.url === new URL('/master.m3u8', pageUrl).href, 'HLS candidate did not retain the master playlist URL');
  assert(candidate?.extension === 'mp4' && candidateMergeOutputFormat(candidate) === 'mp4', 'HLS candidate did not use a valid merge container');
  assert(candidate?.title === 'HLS Test Video', `HLS page title was not retained: ${candidate?.title}`);
  assert(variants.length === 2, `Expected two HLS variants, got ${variants.length}`);
  assert(variants[0]?.qualityLabel === '2160p' && variants[0]?.videoCodec === 'AV1', 'HLS variants were not sorted or labeled correctly');
  assert(Number(variants[0]?.sizeBytes || 0) > Number(variants[1]?.sizeBytes || 0), 'HLS VOD size estimates are missing');
  const primaryButton = els.candidateList.querySelector('[data-download-candidate]');
  const splitButton = els.candidateList.querySelector('[data-toggle-candidate-variants]');
  assert(Boolean(primaryButton && splitButton), 'HLS split download controls were not rendered');
  splitButton?.click();
  await wait(100);
  assert(els.candidateList.querySelectorAll('.sniffer-resource-variant').length === 2, 'HLS variant rows did not expand');
  assert(candidateDownloadUrl(candidate) === candidate?.url, 'HLS primary action would download the page instead of the master manifest');
  assert(candidateDownloadUrl(candidate, variants[1]) === variants[1]?.url, 'HLS variant action did not retain its rendition URL');
  window.__VIDOGO_SELF_TEST_PROGRESS = 'manifest-flow:done';
  return {
    ok: failures.length === 0,
    failures,
    candidate: candidate ? {
      title: candidate.title,
      url: candidate.url,
      extension: candidate.extension,
      qualityLabel: candidate.qualityLabel,
      sizeBytes: candidate.sizeBytes,
      variants: variants.map((variant) => ({
        url: variant.url,
        qualityLabel: variant.qualityLabel,
        videoCodec: variant.videoCodec,
        sizeBytes: variant.sizeBytes,
      })),
    } : null,
  };
}

async function runDashManifestFlowTest(pageUrl) {
  const failures = [];
  const assert = (condition, message) => {
    if (!condition) failures.push(message);
  };
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  window.__VIDOGO_SELF_TEST_PROGRESS = 'dash-flow:opening-page';
  assert(/^https?:\/\//.test(String(pageUrl || '')), 'DASH smoke page URL is missing');
  state.tabs.forEach((tab) => tab.webview.remove());
  state.tabs = [];
  state.activeTabId = null;
  state.candidatesByTabId = {};
  state.selectedCandidateIdsByTabId = {};
  state.selectedMinimumResolutionByTabId = {};
  state.mediaPanelVisible = true;
  const tab = createTab(pageUrl, 'DASH test');
  setSection('browser');
  let candidate = null;
  const deadline = Date.now() + 12_000;
  while (Date.now() < deadline) {
    await wait(100);
    candidate = mediaCandidatesForTab(tab.id).find((item) => item.metadataSource === 'dash-manifest');
    if (candidate && candidateVariants(candidate).length === 2) break;
  }
  renderCandidates();
  const variants = candidateVariants(candidate);
  assert(Boolean(candidate), 'DASH manifest was not enriched in the browser session');
  assert(candidate?.isRecommended === true && candidate?.sourceClient === 'dash', 'Valid DASH media was not recommended');
  assert(candidate?.url === new URL('/manifest.mpd', pageUrl).href, 'DASH candidate did not retain the MPD URL');
  assert(candidate?.extension === 'mp4' && candidateMergeOutputFormat(candidate) === 'mp4', 'DASH candidate did not use a valid merge container');
  assert(candidate?.title === 'DASH Test Video', `DASH page title was not retained: ${candidate?.title}`);
  assert(variants.length === 2, `Expected two DASH variants, got ${variants.length}`);
  assert(variants[0]?.qualityLabel === '2160p' && variants[0]?.videoCodec === 'AV1', 'DASH variants were not sorted or labeled correctly');
  assert(variants[0]?.formatId === 'v2160+a128/v2160', `DASH video/audio selector is incorrect: ${variants[0]?.formatId}`);
  assert(Number(variants[0]?.sizeBytes || 0) > Number(variants[1]?.sizeBytes || 0), 'DASH VOD size estimates are missing');
  const primaryButton = els.candidateList.querySelector('[data-download-candidate]');
  const splitButton = els.candidateList.querySelector('[data-toggle-candidate-variants]');
  assert(Boolean(primaryButton && splitButton), 'DASH split download controls were not rendered');
  splitButton?.click();
  await wait(100);
  assert(els.candidateList.querySelectorAll('.sniffer-resource-variant').length === 2, 'DASH variant rows did not expand');
  assert(candidateDownloadUrl(candidate) === candidate?.url, 'DASH primary action would download the page instead of the MPD');
  assert(candidateDownloadUrl(candidate, variants[1]) === candidate?.url, 'DASH variant action did not retain the MPD URL');
  window.__VIDOGO_SELF_TEST_PROGRESS = 'dash-flow:done';
  return {
    ok: failures.length === 0,
    failures,
    candidate: candidate ? {
      title: candidate.title,
      url: candidate.url,
      extension: candidate.extension,
      qualityLabel: candidate.qualityLabel,
      sizeBytes: candidate.sizeBytes,
      variants: variants.map((variant) => ({
        qualityLabel: variant.qualityLabel,
        videoCodec: variant.videoCodec,
        audioCodec: variant.audioCodec,
        formatId: variant.formatId,
        sizeBytes: variant.sizeBytes,
      })),
    } : null,
  };
}

async function runBrowserPlatformFlowTest() {
  const failures = [];
  const assert = (condition, message) => {
    if (!condition) failures.push(message);
  };
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const targetUrl = String(window.mediaDeckSmokeBrowserUrl || '').trim();
  const provider = MEDIA_RULES?.providerSiteForUrl?.(targetUrl);
  let directDownloadResult = null;
  let directFetchProbe = null;
  let stockDownloadControls = [];
  const tiktokSwitches = [];
  window.__VIDOGO_SELF_TEST_PROGRESS = `browser-platform-flow:${provider || 'unknown'}:started`;
  assert(Boolean(targetUrl && provider), `Unsupported platform smoke URL: ${targetUrl}`);
  state.tabs.forEach((tab) => tab.webview.remove());
  state.tabs = [];
  state.activeTabId = null;
  state.candidatesByTabId = {};
  state.selectedCandidateIdsByTabId = {};
  state.selectedMinimumResolutionByTabId = {};
  state.mediaPanelVisible = true;
  if (provider === 'dailymotion') await window.mediaDeck.setAdBlockerEnabled(false);
  const tab = createTab(targetUrl, provider || 'Platform');
  setSection('browser');
  let guest = null;
  let pagePolicy = null;
  let finalFrameStatus = [];
  let dailymotionStableSince = 0;
  let dailymotionErrorSince = 0;
  const deadline = Date.now() + 38000;
  while (Date.now() < deadline) {
    await wait(750);
    await startActiveGuestPlaybackForSmoke();
    guest = await inspectActiveGuestPage();
    try {
      pagePolicy = await Promise.race([
        tab.webview.executeJavaScript(`({
          cosmeticStylePresent: Boolean(document.querySelector('style[id="__vidogo_cosmetic_ad_css"]')),
          hasAntiAdblockText: /(?:ad blocker|广告拦截)/i.test(document.body?.innerText || ''),
          hasPlaybackErrorText: /playback error|please check your internet connection/i.test(document.body?.innerText || ''),
          frameCount: document.querySelectorAll('iframe').length,
          href: location.href,
          title: document.title
        })`, true),
        new Promise((resolve) => setTimeout(() => resolve(null), 3000)),
      ]);
    } catch {
      pagePolicy = null;
    }
    const candidates = mediaCandidatesForTab(tab.id);
    const frameStatus = provider === 'dailymotion'
      ? await window.mediaDeck.inspectBrowserFrames(tab.webContentsId).catch(() => [])
      : [];
    if (provider === 'dailymotion') finalFrameStatus = frameStatus;
    const dailymotionReady = provider === 'dailymotion'
      && guest?.readyState === 'complete'
      && pagePolicy?.cosmeticStylePresent === false
      && pagePolicy?.hasPlaybackErrorText === false
      && frameStatus.every((frame) => frame.hasPlaybackError !== true)
      && mediaCandidatesForTab(tab.id).length > 0;
    const tiktokReady = provider === 'tiktok'
      && Boolean(tab.activeMediaContext?.mediaId)
      && Boolean(tab.activeMediaContext?.directUrl)
      && candidates.length === 1;
    const douyinReady = provider === 'douyin'
      && Boolean(tab.activeMediaContext?.mediaId)
      && Boolean(tab.activeMediaContext?.directUrl)
      && candidates.length === 1;
    const agedmReady = provider === 'agedm'
      && candidates.length > 0
      && Number(guest?.video?.readyState || 0) >= 2;
    const stockReady = ['mixkit', 'pixabay'].includes(provider)
      && candidates.some((candidate) => candidate?.thumbnailUrl && candidateVariants(candidate).length > 0)
      && Number(guest?.video?.readyState || 0) >= 2;
    if (dailymotionReady) {
      if (!dailymotionStableSince) dailymotionStableSince = Date.now();
      if (Date.now() - dailymotionStableSince >= 8_000) break;
    } else {
      dailymotionStableSince = 0;
    }
    const dailymotionHasPlaybackError = provider === 'dailymotion'
      && frameStatus.some((frame) => frame.hasPlaybackError === true);
    if (dailymotionHasPlaybackError) {
      if (!dailymotionErrorSince) dailymotionErrorSince = Date.now();
      if (Date.now() - dailymotionErrorSince >= 4_000) break;
    } else {
      dailymotionErrorSince = 0;
    }
    if (tiktokReady || douyinReady || agedmReady || stockReady) break;
  }
  const candidates = mediaCandidatesForTab(tab.id);
  const blockedRequestDiagnostics = await window.mediaDeck.getBlockedRequestDiagnostics().catch(() => []);
  const dailymotionRequestDiagnostics = provider === 'dailymotion'
    ? await window.mediaDeck.getDailymotionRequestDiagnostics().catch(() => [])
    : [];
  if (provider === 'dailymotion') {
    const frameStatus = await window.mediaDeck.inspectBrowserFrames(tab.webContentsId).catch(() => []);
    finalFrameStatus = frameStatus;
    assert(pagePolicy?.cosmeticStylePresent === false, 'Dailymotion still received cosmetic ad-blocking CSS');
    assert(els.browserStatusAdblockState.textContent === 'OFF', 'Dailymotion did not show the effective ad-blocking state as OFF');
    assert(pagePolicy?.hasAntiAdblockText === false, 'Dailymotion still reported an ad blocker');
    assert(pagePolicy?.hasPlaybackErrorText === false, 'Dailymotion still reported a playback/network error');
    assert(frameStatus.every((frame) => frame.hasPlaybackError !== true), 'Dailymotion player frame still reported a playback/network error');
    assert(frameStatus.some((frame) => frame.video && frame.video.readyState >= 2), 'Dailymotion player frame did not create playable video media');
    assert(candidates.length > 0, 'Dailymotion player did not request any downloadable media streams');
  }
  if (['mixkit', 'pixabay'].includes(provider)) {
    assert(pagePolicy?.cosmeticStylePresent === false,
      `${provider} should not receive page-level ad filtering during playback or verification`);
    assert(els.browserStatusAdblockState.textContent === 'OFF',
      `${provider} browser status did not reflect the effective ad-filtering state`);
    stockDownloadControls = await tab.webview.executeJavaScript(`Array.from(document.querySelectorAll('a[href], button, [role="button"]'))
      .map((control) => ({
        tag: control.tagName,
        text: String(control.textContent || control.getAttribute('aria-label') || control.getAttribute('title') || '').replace(/\\s+/g, ' ').trim().slice(0, 160),
        href: String(control.href || ''),
        className: String(control.className || '').slice(0, 200),
        visible: Boolean(control.getClientRects().length)
      }))
      .filter((control) => /download|下载/i.test(control.text + ' ' + control.className))
      .slice(0, 20)`, true).catch(() => []);
    assert(candidates.length === 1, `${provider} should expose one current stock-video item, got ${candidates.length}`);
    assert(Boolean(candidates[0]?.thumbnailUrl), `${provider} current video did not include a thumbnail`);
    assert(candidateVariants(candidates[0]).length > 0, `${provider} current video did not include quality variants`);
    assert(/^https:\/\//i.test(candidateDownloadUrl(candidates[0]) || '')
      && candidateDownloadUrl(candidates[0]) !== candidates[0]?.pageUrl,
    `${provider} current video did not resolve to a downloadable media URL`);
    const startedAt = Date.now();
    const clickedSiteDownload = await tab.webview.executeJavaScript(`(() => {
      const controls = Array.from(document.querySelectorAll('a[href], button, [role="button"]'));
      const control = controls.find((item) => item.getClientRects().length
        && /download|下载/i.test(String(item.textContent || item.getAttribute('aria-label') || item.getAttribute('title') || '') + ' ' + String(item.className || '')));
      if (!control) return false;
      control.click();
      return true;
    })()`, true).catch(() => false);
    assert(clickedSiteDownload, `${provider} page did not expose a clickable native download control`);
    let nativeQueueReady = await (async () => {
      const deadline = Date.now() + 10_000;
      while (Date.now() < deadline) {
        const row = state.queue.find((item) => Number(item.createdAt || 0) >= startedAt
          && item.provider === provider
          && ['site-download-intent', 'native-download'].includes(item.sourceClient));
        if (row) return row;
        await wait(100);
      }
      return null;
    })();
    if (nativeQueueReady && window.mediaDeckSmokeDownload?.real) {
      const rowId = String(nativeQueueReady.id || nativeQueueReady.downloadId);
      const transferDeadline = Date.now() + 35_000;
      while (Date.now() < transferDeadline && !isTerminalDownloadState(nativeQueueReady.state || nativeQueueReady.status)) {
        if (normalizeDownloadState(nativeQueueReady.state || nativeQueueReady.status) === 'downloading'
          && nativeQueueReady.downloaded !== '-') break;
        await wait(100);
        nativeQueueReady = state.queue.find((item) => String(item.id || item.downloadId) === rowId) || nativeQueueReady;
      }
      if (normalizeDownloadState(nativeQueueReady.state || nativeQueueReady.status) === 'downloading') {
        await controlDownloadRow(nativeQueueReady, 'pause');
      }
      assert(['paused', 'completed'].includes(normalizeDownloadState(nativeQueueReady.state || nativeQueueReady.status)),
        `${provider} native download did not receive media bytes: ${nativeQueueReady.errorMessage || nativeQueueReady.state}`);
      if (normalizeDownloadState(nativeQueueReady.state || nativeQueueReady.status) === 'completed') {
        assert(nativeQueueReady.completionVerified === true, `${provider} native download completed without a verified file`);
      }
    }
    directDownloadResult = nativeQueueReady ? {
      state: normalizeDownloadState(nativeQueueReady.state || nativeQueueReady.status),
      sourceClient: nativeQueueReady.sourceClient,
      title: nativeQueueReady.title,
      thumbnailUrl: nativeQueueReady.thumbnailUrl,
      qualityLabel: nativeQueueReady.qualityLabel,
      errorMessage: nativeQueueReady.errorMessage || null,
    } : null;
    assert(Boolean(nativeQueueReady), `${provider} native download button did not create a VidoGo queue task`);
    assert(Boolean(nativeQueueReady?.thumbnailUrl), `${provider} native download task lost its cover`);
    assert(Boolean(nativeQueueReady?.qualityLabel), `${provider} native download task lost its selected quality`);
  }
  if (provider === 'tiktok') {
    assert(Boolean(tab.activeMediaContext?.mediaId), 'TikTok did not report the current visible video');
    assert(candidates.length === 1, `TikTok media panel should contain one active item, got ${candidates.length}`);
    assert(Boolean(candidates[0]?.thumbnailUrl), 'TikTok active item did not include a thumbnail');
    assert(!/^(?:TikTok - Make Your Day|Sign up \| TikTok)$/i.test(candidates[0]?.title || ''), 'TikTok active item retained a generic page title');
    assert(candidates[0]?.sourceClient === 'tiktok-page', 'TikTok active item did not use the current player media');
    assert(/^https:\/\//i.test(candidates[0]?.url || '')
      && candidates[0]?.url !== candidates[0]?.pageUrl, 'TikTok active item did not include a direct video URL');
    assert(candidateVariants(candidates[0]).length > 0, 'TikTok active item did not include downloadable player variants');
    // Let the deeper React probe replace the preload's temporary network row
    // before measuring actual card-to-card changes.
    for (let baselineAttempt = 0; baselineAttempt < 8; baselineAttempt += 1) {
      await probeActiveMedia(tab);
      await wait(250);
      const baselineTitle = String(mediaCandidatesForTab(tab.id)[0]?.title || '');
      if (baselineTitle && baselineTitle !== 'TikTok video') break;
    }
    let lastVerifiedDirectUrl = mediaCandidatesForTab(tab.id)[0]?.url || '';
    try {
      if (!window.mediaDeckSmokeDownload.pauseResume) {
        for (let switchIndex = 0; switchIndex < 8 && tiktokSwitches.length < 2; switchIndex += 1) {
          const previousMediaId = tab.activeMediaContext?.mediaId;
          const previousCandidateTitle = String(mediaCandidatesForTab(tab.id)[0]?.title || '').toLowerCase();
          const switched = await tab.webview.executeJavaScript(`(async () => {
            const selectors = '[data-e2e="recommend-list-item-container"], [data-e2e="feed-video"], [data-e2e="browse-video"]';
            const visibleArea = (rect) => Math.max(0, Math.min(rect.right, innerWidth) - Math.max(rect.left, 0))
              * Math.max(0, Math.min(rect.bottom, innerHeight) - Math.max(rect.top, 0));
            const videos = Array.from(document.querySelectorAll('video'));
            const activeVideo = videos.map((video) => {
              const rect = video.getBoundingClientRect();
              const area = visibleArea(rect);
              return area ? { video, score: (!video.paused && !video.ended ? innerWidth * innerHeight * 2 : 0) + area } : null;
            }).filter(Boolean).sort((left, right) => right.score - left.score)[0]?.video;
            if (!activeVideo) return null;
            const activeCard = activeVideo.closest(selectors);
            const cards = Array.from(document.querySelectorAll(selectors)).filter((card, index, all) => all.indexOf(card) === index);
            let next = cards[cards.indexOf(activeCard) + 1];
            if (!next) {
              const activeTop = activeVideo.getBoundingClientRect().top;
              next = cards.map((card) => ({ card, top: card.getBoundingClientRect().top }))
                .filter((entry) => entry.top > activeTop + 80)
                .sort((left, right) => left.top - right.top)[0]?.card;
            }
            let nextVideo = next?.querySelector('video');
            if (!nextVideo) {
              const rect = activeVideo.getBoundingClientRect();
              const eventTarget = document.elementFromPoint(
                Math.max(0, Math.min(innerWidth - 1, rect.left + rect.width / 2)),
                Math.max(0, Math.min(innerHeight - 1, rect.top + rect.height / 2)),
              ) || activeVideo;
              eventTarget.dispatchEvent(new WheelEvent('wheel', { deltaY: 720, bubbles: true, cancelable: true, view: window }));
              const scroller = (() => {
                for (let node = activeVideo.parentElement; node; node = node.parentElement) {
                  const style = getComputedStyle(node);
                  if (node.scrollHeight > node.clientHeight + 80 && /auto|scroll/i.test(style.overflowY)) return node;
                }
                return document.scrollingElement;
              })();
              scroller?.scrollBy?.({ top: Math.max(520, scroller.clientHeight * .82), behavior: 'instant' });
              await new Promise((resolve) => setTimeout(resolve, 900));
              nextVideo = Array.from(document.querySelectorAll('video')).map((candidate) => {
                const candidateRect = candidate.getBoundingClientRect();
                const area = visibleArea(candidateRect);
                return candidate !== activeVideo && area ? { candidate, area } : null;
              }).filter(Boolean).sort((left, right) => right.area - left.area)[0]?.candidate;
              if (!nextVideo) {
                window.__vidogoActiveMediaReporter?.report?.();
                return true;
              }
            }
            videos.forEach((video) => { if (video !== nextVideo) video.pause(); });
            (next || nextVideo).scrollIntoView({ block: 'center' });
            await new Promise((resolve) => setTimeout(resolve, 450));
            nextVideo.muted = true;
            await nextVideo.play().catch(() => undefined);
            window.__vidogoActiveMediaReporter?.report?.();
            return true;
          })()`, true).catch(() => false);
          if (!switched) break;
          const switchDeadline = Date.now() + 12000;
          while (Date.now() < switchDeadline && tab.activeMediaContext?.mediaId === previousMediaId) await wait(250);
          const visibleTitle = await tab.webview.executeJavaScript(`(() => {
            const visibleArea = (rect) => Math.max(0, Math.min(rect.right, innerWidth) - Math.max(rect.left, 0))
              * Math.max(0, Math.min(rect.bottom, innerHeight) - Math.max(rect.top, 0));
            const video = Array.from(document.querySelectorAll('video')).map((item) => {
              const rect = item.getBoundingClientRect();
              const area = visibleArea(rect);
              return area ? { item, score: (!item.paused && !item.ended ? innerWidth * innerHeight * 2 : 0) + area } : null;
            }).filter(Boolean).sort((left, right) => right.score - left.score)[0]?.item;
            const scope = video?.closest?.('[data-e2e="recommend-list-item-container"], [data-e2e="browse-video"], [data-e2e="feed-video"], article');
            return ['[data-e2e="browse-video-desc"]', '[data-e2e="video-desc"]', '[data-e2e="search-card-desc"]', 'h1']
              .map((selector) => scope?.querySelector?.(selector)?.textContent?.replace(/\\s+/g, ' ').trim())
              .find(Boolean) || '';
          })()`, true).catch(() => '');
          let switchedCandidates = mediaCandidatesForTab(tab.id);
          let currentCandidate = switchedCandidates[0];
          const freshUrlDeadline = Date.now() + 4000;
          while (Date.now() < freshUrlDeadline && lastVerifiedDirectUrl && currentCandidate?.url === lastVerifiedDirectUrl) {
            await probeActiveMedia(tab);
            await wait(180);
            switchedCandidates = mediaCandidatesForTab(tab.id);
            currentCandidate = switchedCandidates[0];
          }
          const idChanged = tab.activeMediaContext?.mediaId !== previousMediaId;
          const normalizedVisibleTitle = String(visibleTitle || '').toLowerCase();
          const normalizedCandidateTitle = String(currentCandidate?.title || '').toLowerCase();
          if (!normalizedVisibleTitle || normalizedVisibleTitle === previousCandidateTitle) continue;
          tiktokSwitches.push({
            mediaId: tab.activeMediaContext?.mediaId,
            visibleTitle,
            candidateTitle: currentCandidate?.title,
            directUrl: currentCandidate?.url,
          });
          const verifiedSwitchNumber = tiktokSwitches.length;
          assert(idChanged, `TikTok current-video selection stopped updating after real wheel switch ${verifiedSwitchNumber}`);
          assert(switchedCandidates.length === 1, `TikTok kept stale items after real switch ${verifiedSwitchNumber}: ${switchedCandidates.length}`);
          assert(!normalizedVisibleTitle || normalizedCandidateTitle.includes(normalizedVisibleTitle)
            || normalizedVisibleTitle.includes(normalizedCandidateTitle), `TikTok row title did not follow visible video after real switch ${verifiedSwitchNumber}`);
          assert(currentCandidate?.pageUrl === tab.activeMediaContext?.canonicalUrl, `TikTok row page did not follow real switch ${verifiedSwitchNumber}`);
          assert(currentCandidate?.url === tab.activeMediaContext?.directUrl
            && currentCandidate?.url !== currentCandidate?.pageUrl, `TikTok row URL did not follow real switch ${verifiedSwitchNumber}`);
          assert(!lastVerifiedDirectUrl || currentCandidate?.url !== lastVerifiedDirectUrl,
            `TikTok row kept the previous video's download URL after real switch ${verifiedSwitchNumber}`);
          lastVerifiedDirectUrl = currentCandidate?.url || lastVerifiedDirectUrl;
        }
        assert(tiktokSwitches.length >= 2, `TikTok smoke could not exercise repeated wheel switches: ${tiktokSwitches.length}`);
      }
      if (window.mediaDeckSmokeDownload?.real && window.mediaDeckSmokeDownload?.outputDir) {
        const currentCandidate = mediaCandidatesForTab(tab.id)[0];
        const directUrl = candidateDownloadUrl(currentCandidate);
        directFetchProbe = await tab.webview.executeJavaScript(`fetch(${JSON.stringify(directUrl)}, {
          credentials: 'include',
          headers: { Range: 'bytes=0-1023' }
        }).then(async (response) => ({
          ok: response.ok,
          status: response.status,
          bytes: (await response.arrayBuffer()).byteLength
        })).catch((error) => ({ ok: false, message: error?.message || String(error) }))`, true).catch((error) => ({
          ok: false,
          message: error?.message || String(error),
        }));
        state.settings.outputDir = window.mediaDeckSmokeDownload.outputDir;
        await startCandidateDownload(currentCandidate);
        const downloadDeadline = Date.now() + 50000;
        let row = state.queue.find((item) => item.url === directUrl);
        if (window.mediaDeckSmokeDownload.pauseResume) {
          while (Date.now() < downloadDeadline && row && row.state !== 'downloading' && !isTerminalDownloadState(row.state)) {
            await wait(50);
            row = state.queue.find((item) => item.url === directUrl);
          }
          if (row?.state === 'downloading') {
            const rowId = String(row.id || row.downloadId);
            const paused = await controlDownloadRow(row, 'pause');
            assert(paused && row.state === 'paused', 'TikTok direct download did not pause in place');
            const resumed = await controlDownloadRow(row, 'resume');
            row = state.queue.find((item) => String(item.id || item.downloadId) === rowId);
            assert(resumed && row && state.queue.filter((item) => String(item.id || item.downloadId) === rowId).length === 1,
              'TikTok direct download did not resume in the same task row');
          } else {
            failures.push('TikTok direct download completed before the pause test could run');
          }
        }
        while (Date.now() < downloadDeadline && row && !isTerminalDownloadState(row.status || row.state)) {
          await wait(300);
          row = state.queue.find((item) => item.url === directUrl);
        }
        directDownloadResult = row ? {
          state: normalizeDownloadState(row.status || row.state),
        path: row.path || row.savePath || null,
        errorMessage: row.errorMessage || null,
        diagnostics: state.downloadDiagnostics.slice(-10),
      } : null;
        assert(directDownloadResult?.state === 'completed', 'TikTok direct download did not complete: '
          + (directDownloadResult?.errorMessage || directDownloadResult?.state || 'missing queue row'));
        setSection('browser');
      }
    } catch (error) {
      failures.push(`TikTok active-video switch check failed: ${error?.message || String(error)}`);
    }
  }
  if (provider === 'douyin') {
    assert(Boolean(tab.activeMediaContext?.mediaId), 'Douyin did not report the current visible video');
    assert(candidates.length === 1, `Douyin media panel should contain one active item, got ${candidates.length}`);
    assert(Boolean(candidates[0]?.thumbnailUrl), 'Douyin active item did not include a thumbnail');
    assert(candidates[0]?.sourceClient === 'douyin-page', 'Douyin active item did not use the current player media');
    assert(/^https:\/\//i.test(candidates[0]?.url || '')
      && candidates[0]?.url !== candidates[0]?.pageUrl, 'Douyin active item did not include a direct video URL');
    assert(candidateVariants(candidates[0]).length > 0, 'Douyin active item did not include downloadable player variants');
    if (window.mediaDeckSmokeDownload?.real
      && window.mediaDeckSmokeDownload?.pauseResume
      && window.mediaDeckSmokeDownload?.outputDir
      && candidates[0]) {
      state.settings.outputDir = window.mediaDeckSmokeDownload.outputDir;
      const directUrl = candidateDownloadUrl(candidates[0]);
      await startCandidateDownload(candidates[0]);
      const downloadDeadline = Date.now() + 45_000;
      let row = state.queue.find((item) => item.url === directUrl);
      while (Date.now() < downloadDeadline && row && !isTerminalDownloadState(row.state)) {
        if (row.state === 'downloading' && row.downloaded !== '-') break;
        await wait(100);
        row = state.queue.find((item) => item.url === directUrl);
      }
      if (row?.state === 'downloading' && row.downloaded !== '-') {
        const rowId = String(row.id || row.downloadId);
        const paused = await controlDownloadRow(row, 'pause');
        row = state.queue.find((item) => String(item.id || item.downloadId) === rowId);
        assert(paused && row?.state === 'paused', 'Douyin direct download did not pause in the same task row');
      }
      directDownloadResult = row ? {
        state: normalizeDownloadState(row.status || row.state),
        downloaded: row.downloaded,
        size: row.size,
        sourceClient: row.sourceClient,
        errorMessage: row.errorMessage || null,
      } : null;
      assert(directDownloadResult?.state === 'paused' && directDownloadResult.downloaded !== '-',
        'Douyin direct media did not deliver pausable bytes: '
          + (directDownloadResult?.errorMessage || directDownloadResult?.state || 'missing queue row'));
      setSection('browser');
    }
  }
  if (provider === 'agedm') {
    assert(candidates.length > 0, 'AGE player did not expose the currently playing video');
    if (candidates[0]) {
      if (window.mediaDeckSmokeDownload?.real && window.mediaDeckSmokeDownload?.outputDir) {
        state.settings.outputDir = window.mediaDeckSmokeDownload.outputDir;
      }
      const result = await startCandidateDownload(candidates[0]);
      const expectedPageUrl = agedmPlaybackUrl(candidates[0], tab);
      let row = state.queue.find((item) => item.provider === 'agedm'
        && MEDIA_RULES?.normalizePageUrl?.(item.pageUrl) === MEDIA_RULES?.normalizePageUrl?.(expectedPageUrl));
      if (window.mediaDeckSmokeDownload?.real) {
        const directDeadline = Date.now() + 35_000;
        while (Date.now() < directDeadline && row && !isTerminalDownloadState(row.status || row.state)) {
          if (normalizeDownloadState(row.status || row.state) === 'downloading' && row.downloaded !== '-') break;
          await wait(100);
          row = state.queue.find((item) => String(item.id || item.downloadId) === String(row?.id || row?.downloadId));
        }
        if (normalizeDownloadState(row?.status || row?.state) === 'downloading') {
          const paused = await controlDownloadRow(row, 'pause');
          assert(paused && row.state === 'paused', 'AGE direct download did not pause after receiving media bytes');
        }
      } else {
        await wait(120);
      }
      directDownloadResult = row ? {
        state: normalizeDownloadState(row.status || row.state),
        sourceClient: row.sourceClient,
        urlIsMedia: row.url !== expectedPageUrl,
        downloaded: row.downloaded,
        errorMessage: row.errorMessage || null,
      } : null;
      assert(Boolean(result?.started), 'AGE current-video action did not create a download job');
      if (window.mediaDeckSmokeDownload?.real) {
        assert(row?.sourceClient === 'background-resolver', 'AGE current-video action bypassed the background resolver');
      } else {
        assert(row?.backgroundResolvePage === true, 'AGE current-video action was not queued for background resolution');
      }
      assert(row?.url && (window.mediaDeckSmokeDownload?.real || row.url === expectedPageUrl), 'AGE current-video action lost its playback page');
      assert(!/广告拦截|ERR_BLOCKED_BY_CLIENT/i.test(row?.errorMessage || ''), 'AGE current-video action exposed an ad-blocker error');
      if (window.mediaDeckSmokeDownload?.real) {
        assert(row?.state === 'paused', 'AGE direct media connection did not become pausable');
      }
    }
  }
  window.__VIDOGO_SELF_TEST_PROGRESS = `browser-platform-flow:${provider || 'unknown'}:done`;
  return {
    ok: failures.length === 0,
    failures,
    provider,
    guest,
    pagePolicy,
    directDownloadResult,
    directFetchProbe,
    stockDownloadControls,
    tiktokSwitches,
    activeMediaContext: tab.activeMediaContext,
    blockedRequestDiagnostics,
    dailymotionRequestDiagnostics: dailymotionRequestDiagnostics.filter((item) => item.phase === 'error' || Number(item.statusCode) >= 400).slice(-30),
    frameStatus: finalFrameStatus,
    candidates: candidates.map((candidate) => ({
      id: candidate.id,
      title: candidate.title,
      pageUrl: candidate.pageUrl,
      url: candidate.url,
      provider: candidate.provider,
      thumbnailUrl: candidate.thumbnailUrl,
      metadataSource: candidate.metadataSource,
      sourceClient: candidate.sourceClient,
      variants: candidateVariants(candidate).length,
    })),
  };
}

async function runBrowserYouTubeFlowTest() {
  const failures = [];
  const clicked = [];
  window.__VIDOGO_SELF_TEST_PROGRESS = 'browser-youtube-flow:started';
  const assert = (condition, message) => {
    if (!condition) failures.push(message);
  };
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const clickControl = async (label, control) => {
    window.__VIDOGO_SELF_TEST_PROGRESS = label;
    if (!control) {
      failures.push(`Missing clickable control: ${label}`);
      return;
    }
    if (control.disabled) {
      failures.push(`Clickable control disabled: ${label}`);
      return;
    }
    control.click();
    clicked.push(label);
    await wait(60);
  };

  state.tabs.forEach((tab) => tab.webview.remove());
  state.tabs = [];
  state.activeTabId = null;
  state.candidatesByTabId = {};
  state.selectedCandidateIdsByTabId = {};
  state.selectedMinimumResolutionByTabId = {};
  state.mediaPanelVisible = true;
  setSection('home');
  await wait(250);
  assert(document.querySelector('.tab:first-child')?.textContent.includes(text('home')), 'Home tab should be first before opening YouTube');
  assert(getVisibleWebviews().length === 0, 'Home page should not show any webview before opening YouTube');

  const quickYouTube = Array.from(document.querySelectorAll('.popular-site-button, .site-card')).find((button) => button.textContent.includes('YouTube'));
  await clickControl('home:quick-site:youtube', quickYouTube);
  await wait(1200);
  const youtubeWatchUrl = String(window.mediaDeckSmokeBrowserUrl || '').trim()
    || 'https://www.youtube.com/watch?v=jNQXAC9IVRw';
  navigateActive(youtubeWatchUrl);
  clicked.push('browser:navigate-youtube-watch');
  let guest = null;
  const waitStartedAt = Date.now();
  while (Date.now() - waitStartedAt < 50000) {
    window.__VIDOGO_SELF_TEST_PROGRESS = 'browser-youtube-flow:waiting-for-youtube-content';
    await wait(750);
    await startActiveGuestPlaybackForSmoke();
    guest = await inspectActiveGuestPage();
    const hasYouTubeShell = Boolean(guest?.rects?.['ytd-app'] || guest?.rects?.['#page-manager'] || guest?.rects?.video);
    const hasLoadedDocument = guest?.readyState === 'complete' || guest?.readyState === 'interactive';
    const hasViewportHeight = Number(guest?.innerHeight || 0) > 500 && Number(guest?.clientHeight || 0) > 500;
    const hasPageContent = Number(guest?.visibleTextLength || 0) > 20 || hasYouTubeShell;
    const hasWatchPage = String(guest?.href || '').includes('/watch');
    const hasRecommendedCandidate = mediaCandidatesForTab().some((candidate) => candidate.isRecommended === true
      && (candidateRequiresRecording(candidate) || candidateVariants(candidate).length > 0)
      && normalizeYouTubeTitle(candidate.title));
    const hasDecodedVideo = Number(guest?.video?.readyState || 0) >= 2
      && Number(guest?.video?.width || 0) > 0
      && Number(guest?.video?.height || 0) > 0
      && (Number(guest?.video?.decodedFrames || 0) > 0 || Number(guest?.video?.currentTime || 0) > 0);
    if (hasLoadedDocument && hasViewportHeight && hasPageContent && hasWatchPage && hasRecommendedCandidate && hasDecodedVideo) break;
  }
  await wait(750);
  guest = await inspectActiveGuestPage();
  assert(state.tabs.length === 1, `YouTube flow should create one browser tab, got ${state.tabs.length}`);
  assert(String(activeTab()?.title || '').includes('YouTube'), 'YouTube tab title did not identify the active site');
  assert(activeTab()?.url === youtubeWatchUrl, 'YouTube watch page opened an unexpected URL');
  assert(document.querySelector('.tab:first-child')?.textContent.includes(text('home')), 'Home tab should remain before the YouTube browser tab');
  assert(document.querySelector('.tab.active')?.textContent.includes('YouTube'), 'YouTube browser tab should be active');
  const layout = getBrowserLayoutSnapshot();
  assert(layout.activePageIds.length === 1 && layout.activePageIds[0] === 'page-browser', 'YouTube flow did not switch to browser page');
  assert(layout.visibleWebviews === 1, 'YouTube flow should show exactly one webview');
  assert(layout.viewHeight === layout.stageHeight && layout.viewHeight > 500, `YouTube webview is not full-height: view=${layout.viewHeight}, stage=${layout.stageHeight}`);
  assert(layout.mediaPanelVisible === true && layout.mediaPanelHeight === layout.stageHeight, 'YouTube flow did not show the full-height media sniffing panel');
  assert(Number(guest?.innerHeight || 0) > 500 && Number(guest?.clientHeight || 0) > 500, `YouTube guest page viewport did not become full-height: ${JSON.stringify(guest)}`);
  assert(Number(guest?.video?.readyState || 0) >= 2
    && Number(guest?.video?.width || 0) > 0
    && Number(guest?.video?.height || 0) > 0
    && (Number(guest?.video?.decodedFrames || 0) > 0 || Number(guest?.video?.currentTime || 0) > 0), `YouTube video did not decode visible frames: ${JSON.stringify(guest?.video || null)}`);
  assert(Number(els.allCount.textContent) === layout.activeMediaCandidates, 'YouTube media candidate count did not match the active tab');
  assert(Number(els.recommendCount.textContent) <= Number(els.allCount.textContent), 'Recommended media count should not exceed all media count');
  const youtubeCandidate = mediaCandidatesForTab().find((candidate) => candidate.isRecommended === true);
  assert(Boolean(normalizeYouTubeTitle(youtubeCandidate?.title) && youtubeCandidate?.thumbnailUrl), 'YouTube recommended candidate did not include the specific video title and thumbnail metadata');
  const candidateImage = els.candidateList.querySelector('.sniffer-resource-thumbnail img');
  if (candidateImage && (!candidateImage.complete || candidateImage.naturalWidth <= 0)) {
    await Promise.race([
      candidateImage.decode?.().catch(() => undefined) || Promise.resolve(),
      wait(3000),
    ]);
  }
  assert(Boolean(candidateImage?.complete && candidateImage.naturalWidth > 0), 'YouTube candidate thumbnail did not finish rendering');
  assert(String(youtubeCandidate?.metadataSource || '').startsWith('youtube-dom'), 'YouTube recommended candidate did not come from the embedded player');
  const isRecordingCandidate = candidateRequiresRecording(youtubeCandidate);
  let primaryDownloadRect = null;
  let splitToggleRect = null;
  let renderedVariantRows = [];
  if (isRecordingCandidate) {
    assert(Boolean(els.candidateList.querySelector(`[data-record-candidate="${youtubeCandidate?.id}"]`)), 'YouTube live media did not render the recording-required action');
    assert(!els.candidateList.querySelector(`[data-download-candidate="${youtubeCandidate?.id}"]`), 'YouTube live media incorrectly rendered a direct download button');
  } else {
    assert(candidateVariants(youtubeCandidate).length > 0, 'YouTube recommended candidate did not include format variants');
    assert(candidateVariants(youtubeCandidate).every((variant) => Boolean(variant.formatId)), 'YouTube format variants did not include yt-dlp selectors');
    const primaryDownloadButton = els.candidateList.querySelector('.sniffer-resource-download.has-variants');
    const splitToggleButton = els.candidateList.querySelector('.sniffer-resource-split-toggle');
    primaryDownloadRect = primaryDownloadButton?.getBoundingClientRect() || null;
    splitToggleRect = splitToggleButton?.getBoundingClientRect() || null;
    assert(Boolean(primaryDownloadRect && splitToggleRect), 'YouTube candidate split download controls were not rendered');
    assert(Math.abs((primaryDownloadRect?.right || 0) - (splitToggleRect?.left || 0)) <= 1, 'Download and variant toggle controls are not joined');
    assert(Math.abs((primaryDownloadRect?.top || 0) - (splitToggleRect?.top || 0)) <= 1
      && Math.abs((primaryDownloadRect?.height || 0) - (splitToggleRect?.height || 0)) <= 1, 'Download split controls are vertically misaligned');
    splitToggleButton?.click();
    clicked.push('browser:expand-youtube-variants');
    await wait(180);
    renderedVariantRows = Array.from(els.candidateList.querySelectorAll('.sniffer-resource-variant'));
    assert(renderedVariantRows.length === candidateVariants(youtubeCandidate).length, 'Expanded YouTube variant rows do not match candidate variants');
    const firstVariantDownloadRect = renderedVariantRows[0]?.querySelector('.sniffer-resource-variant-download')?.getBoundingClientRect();
    const firstVariantRect = renderedVariantRows[0]?.getBoundingClientRect();
    assert(Boolean(firstVariantDownloadRect && firstVariantRect
      && Math.abs(firstVariantDownloadRect.left - firstVariantRect.left - 1) <= 1
      && Math.abs(firstVariantRect.right - firstVariantDownloadRect.right - 1) <= 1), 'Expanded variant download row does not fill its inner content box');
    const queueBeforeVariantDownloads = [...state.queue];
    await window.mediaDeck.configureEntitlements({ accountId: 'youtube-variant-smoke@example.com', planLevel: 'ultimate' });
    state.queue = [];
    const variantButtons = renderedVariantRows.slice(0, 2)
      .map((row) => row.querySelector('.sniffer-resource-variant-download'));
    await clickControl('browser:download-youtube-variant-1', variantButtons[0]);
    await clickControl('browser:download-youtube-variant-2', variantButtons[1]);
    await wait(220);
    const independentRows = state.queue.filter((item) => item.url === youtubeCandidate.url);
    assert(independentRows.length === 2, `Two YouTube resolutions must create two download rows, got ${independentRows.length}`);
    assert(new Set(independentRows.map((item) => item.formatId)).size === 2, 'YouTube resolution rows were merged by page URL');
    assert(new Set(independentRows.map((item) => item.jobId)).size === 2, 'YouTube resolution rows did not receive independent download jobs');
    await window.mediaDeck.configureEntitlements({ accountId: state.account?.email || null, planLevel: currentPlanLevel() });
    state.queue = queueBeforeVariantDownloads;
    setSection('browser');
    renderCandidates();
  }
  assert(!els.candidateList.querySelector('[data-copy-candidate], [data-copy-variant], .sniffer-resource-copy'), 'YouTube media panel rendered a non-reference copy-link control');
  window.__VIDOGO_SELF_TEST_PROGRESS = 'browser-youtube-flow:done';
  return {
    ok: failures.length === 0,
    failures,
    clicked,
    layout,
    guest,
    mediaDiagnostic: activeTab()?.mediaEnrichmentDiagnostic || null,
    mediaControls: {
      joinedGap: primaryDownloadRect && splitToggleRect ? Math.round(splitToggleRect.left - primaryDownloadRect.right) : null,
      primaryHeight: primaryDownloadRect ? Math.round(primaryDownloadRect.height) : null,
      splitHeight: splitToggleRect ? Math.round(splitToggleRect.height) : null,
      renderedVariants: renderedVariantRows.length,
    },
    mediaCandidates: mediaCandidatesForTab().map((candidate) => ({
      title: candidate.title || null,
      url: candidate.url,
      isRecommended: candidate.isRecommended === true,
      metadataSource: candidate.metadataSource || null,
      variants: candidateVariants(candidate).length,
    })),
  };
}

bootstrap().catch((error) => {
  const message = error?.stack || String(error);
  window.__VIDOGO_BOOT_ERROR = message;
  document.body.insertAdjacentHTML('beforeend', `<pre style="position:fixed;inset:0;padding:24px;color:#f99;background:#111;z-index:99;white-space:pre-wrap">${escapeHtml(message)}</pre>`);
});
