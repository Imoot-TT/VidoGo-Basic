const { contextBridge, ipcRenderer, webFrame } = require('electron');

const TOOLBAR_ID = '__vidogoRecorderToolbar';
const STYLE_ID = '__vidogoRecorderToolbarStyle';
const PLAYBACK_RATES = [1, 2, 4];
const POSITION_UPDATE_MS = 250;
const DURATION_UPDATE_MS = 250;
const QUALITY_SWITCH_TIMEOUT_MS = 8_000;
const QUALITY_HEIGHTS = Object.freeze({
  highres: 2160,
  hd2160: 2160,
  hd1440: 1440,
  hd1080: 1080,
  hd720: 720,
  large: 480,
  medium: 360,
  small: 240,
  tiny: 144,
});
const QUALITY_ORDER = Object.freeze(['highres', 'hd2160', 'hd1440', 'hd1080', 'hd720', 'large', 'medium', 'small', 'tiny', 'auto']);
const MAIN_FRAME = window.top === window;

const RECORDER_MESSAGES = {
  'zh-CN': {
    start: '开始录制', stop: '停止录制', recordAll: '从头录制完整视频', recordAllShort: '全',
    duration: '录制时长', speed: '{rate} 倍速', drm: '受 DRM 保护的视频无法使用网页录制。',
    unavailable: '当前视频无法录制，请先播放视频或改用右侧下载按钮。',
    failed: '录制失败：{message}', wait: '请先播放视频后再开始录制。', capacity: '同时进行的下载或录制任务已达到上限。',
    qualityUnavailable: '播放器未能切换到最高画质，已停止录制。请等待高清画面加载后重试，或使用右侧下载按钮。',
    dailyLimit: '今日下载/录制次数已达到当前套餐上限。', durationLimit: '已达到当前套餐的单次录制时长上限，录制已保存。',
  },
  'zh-TW': {
    start: '開始錄製', stop: '停止錄製', recordAll: '從頭錄製完整影片', recordAllShort: '全',
    duration: '錄製時長', speed: '{rate} 倍速', drm: '受 DRM 保護的影片無法使用網頁錄製。',
    unavailable: '目前影片無法錄製，請先播放影片或改用右側下載按鈕。',
    failed: '錄製失敗：{message}', wait: '請先播放影片後再開始錄製。', capacity: '同時進行的下載或錄製工作已達上限。',
    qualityUnavailable: '播放器未能切換到最高畫質，已停止錄製。請等待高清畫面載入後重試，或使用右側下載按鈕。',
    dailyLimit: '今日下載/錄製次數已達到目前方案上限。', durationLimit: '已達到目前方案的單次錄製時長上限，錄製已儲存。',
  },
  en: {
    start: 'Start recording', stop: 'Stop recording', recordAll: 'Record the full video from the beginning', recordAllShort: 'ALL',
    duration: 'Recording duration', speed: '{rate}x speed', drm: 'DRM-protected video cannot be recorded with the web recorder.',
    unavailable: 'This video cannot be recorded. Play it first or use the download panel.',
    failed: 'Recording failed: {message}', wait: 'Play the video before recording.', capacity: 'The concurrent download and recording limit has been reached.',
    qualityUnavailable: 'The player did not switch to its highest quality, so recording was stopped. Wait for HD playback or use the download panel.',
    dailyLimit: 'Today\'s download and recording limit has been reached for the current plan.', durationLimit: 'The recording reached this plan\'s duration limit and was saved.',
  },
  ru: {
    start: 'Начать запись', stop: 'Остановить запись', recordAll: 'Записать видео полностью с начала', recordAllShort: 'ВСЁ',
    duration: 'Длительность записи', speed: 'Скорость {rate}x', drm: 'Видео с DRM нельзя записать веб-рекордером.',
    unavailable: 'Это видео нельзя записать. Сначала запустите его или используйте панель загрузки.',
    failed: 'Ошибка записи: {message}', wait: 'Запустите видео перед записью.', capacity: 'Достигнут лимит одновременных загрузок и записей.',
    qualityUnavailable: 'Плеер не переключился на максимальное качество, поэтому запись остановлена. Дождитесь HD или используйте панель загрузки.',
    dailyLimit: 'Достигнут дневной лимит загрузок и записей для текущего тарифа.', durationLimit: 'Достигнут лимит длительности записи для текущего тарифа; запись сохранена.',
  },
  pt: {
    start: 'Iniciar gravação', stop: 'Parar gravação', recordAll: 'Gravar o vídeo inteiro desde o início', recordAllShort: 'TUDO',
    duration: 'Duração da gravação', speed: 'Velocidade {rate}x', drm: 'Vídeos protegidos por DRM não podem ser gravados pelo gravador da Web.',
    unavailable: 'Este vídeo não pode ser gravado. Reproduza-o primeiro ou use o painel de download.',
    failed: 'Falha na gravação: {message}', wait: 'Reproduza o vídeo antes de gravar.', capacity: 'O limite de downloads e gravações simultâneos foi atingido.',
    qualityUnavailable: 'O player não mudou para a qualidade máxima, então a gravação foi interrompida. Aguarde o HD ou use o painel de download.',
    dailyLimit: 'O limite diário de downloads e gravações do plano atual foi atingido.', durationLimit: 'A gravação atingiu o limite de duração deste plano e foi salva.',
  },
  vi: {
    start: 'Bắt đầu ghi', stop: 'Dừng ghi', recordAll: 'Ghi toàn bộ video từ đầu', recordAllShort: 'TẤT CẢ',
    duration: 'Thời lượng ghi', speed: 'Tốc độ {rate}x', drm: 'Không thể ghi video được bảo vệ DRM bằng trình ghi web.',
    unavailable: 'Không thể ghi video này. Hãy phát video trước hoặc dùng bảng tải xuống.',
    failed: 'Ghi thất bại: {message}', wait: 'Hãy phát video trước khi ghi.', capacity: 'Đã đạt giới hạn tải xuống và ghi đồng thời.',
    qualityUnavailable: 'Trình phát chưa chuyển sang chất lượng cao nhất nên đã dừng ghi. Hãy đợi hình HD hoặc dùng bảng tải xuống.',
    dailyLimit: 'Đã đạt giới hạn tải xuống và ghi hằng ngày của gói hiện tại.', durationLimit: 'Bản ghi đã đạt giới hạn thời lượng của gói hiện tại và đã được lưu.',
  },
  th: {
    start: 'เริ่มบันทึก', stop: 'หยุดบันทึก', recordAll: 'บันทึกวิดีโอทั้งหมดตั้งแต่ต้น', recordAllShort: 'ทั้งหมด',
    duration: 'ระยะเวลาบันทึก', speed: 'ความเร็ว {rate}x', drm: 'ไม่สามารถบันทึกวิดีโอที่ป้องกันด้วย DRM ผ่านตัวบันทึกเว็บได้',
    unavailable: 'ไม่สามารถบันทึกวิดีโอนี้ได้ โปรดเล่นวิดีโอก่อนหรือใช้แผงดาวน์โหลด',
    failed: 'บันทึกล้มเหลว: {message}', wait: 'โปรดเล่นวิดีโอก่อนเริ่มบันทึก', capacity: 'ถึงขีดจำกัดการดาวน์โหลดและบันทึกพร้อมกันแล้ว',
    qualityUnavailable: 'โปรแกรมเล่นไม่เปลี่ยนเป็นคุณภาพสูงสุด จึงหยุดการบันทึก โปรดรอภาพ HD หรือใช้แผงดาวน์โหลด',
    dailyLimit: 'ถึงขีดจำกัดการดาวน์โหลดและบันทึกรายวันของแพ็กเกจปัจจุบันแล้ว', durationLimit: 'การบันทึกถึงขีดจำกัดเวลาของแพ็กเกจนี้และถูกบันทึกไว้แล้ว',
  },
  ar: {
    start: 'بدء التسجيل', stop: 'إيقاف التسجيل', recordAll: 'تسجيل الفيديو كاملاً من البداية', recordAllShort: 'الكل',
    duration: 'مدة التسجيل', speed: 'سرعة {rate}x', drm: 'لا يمكن تسجيل فيديو محمي بنظام DRM باستخدام مسجل الويب.',
    unavailable: 'لا يمكن تسجيل هذا الفيديو. شغّله أولاً أو استخدم لوحة التنزيل.',
    failed: 'فشل التسجيل: {message}', wait: 'شغّل الفيديو قبل بدء التسجيل.', capacity: 'تم بلوغ حد التنزيلات والتسجيلات المتزامنة.',
    qualityUnavailable: 'لم ينتقل المشغل إلى أعلى جودة، لذلك تم إيقاف التسجيل. انتظر تشغيل HD أو استخدم لوحة التنزيل.',
    dailyLimit: 'تم بلوغ الحد اليومي للتنزيلات والتسجيلات في الباقة الحالية.', durationLimit: 'بلغ التسجيل حد المدة لهذه الباقة وتم حفظه.',
  },
};

let currentLocale = 'en';
let messages = RECORDER_MESSAGES.en;
let toolbar = null;
let recordButton = null;
let recordAllButton = null;
let durationElement = null;
let hoveredVideo = null;
let activeRecording = null;
let busy = false;
let recordingEnabled = false;
let lastPointer = null;
let hideTimer = 0;
let encryptedVideos = new WeakSet();
const speedButtons = new Map();

function resolveLocale(value) {
  const locale = String(value || '').trim().replace(/_/g, '-');
  const lower = locale.toLowerCase();
  if (lower === 'zh-tw' || lower === 'zh-hk' || lower === 'zh-mo' || /-(tw|hk|mo)(?:-|$)/.test(lower)) return 'zh-TW';
  if (lower === 'zh' || lower === 'zh-cn' || lower === 'zh-sg' || lower.startsWith('zh-')) return 'zh-CN';
  const family = lower.split('-')[0];
  return Object.prototype.hasOwnProperty.call(RECORDER_MESSAGES, family) ? family : 'en';
}

function setLocale(value) {
  currentLocale = resolveLocale(value);
  messages = RECORDER_MESSAGES[currentLocale] || RECORDER_MESSAGES.en;
  updateToolbarControls();
}

function formatMessage(template, values = {}) {
  return String(template || '').replace(/\{([a-zA-Z0-9_]+)\}/g, (match, key) => (
    Object.prototype.hasOwnProperty.call(values, key) ? String(values[key]) : match
  ));
}

function recorderErrorMessage(error) {
  const raw = String(error?.message || error || 'unknown error');
  if (raw.includes('daily-entitlement-limit-reached')) return messages.dailyLimit;
  if (raw.includes('recording-capacity-reached')) return messages.capacity;
  if (raw.includes('drm-protected')) return messages.drm;
  if (raw.includes('highest-quality-not-ready')) return messages.qualityUnavailable;
  if (raw.includes('capture-unavailable') || raw.includes('MediaRecorder')) return messages.unavailable;
  return formatMessage(messages.failed, { message: raw });
}

function notify(type, message) {
  ipcRenderer.send('recording:notice', {
    type,
    message: String(message || ''),
    pageUrl: location.href,
    pageTitle: document.title,
  });
}

function isDrmVideo(video) {
  return encryptedVideos.has(video)
    || Boolean(video?.mediaKeys)
    || Boolean(video?.webkitKeys)
    || video?.getAttribute('data-vidogo-drm') === '1';
}

function rememberEncryptedVideo(event) {
  if (event.target instanceof HTMLMediaElement) encryptedVideos.add(event.target);
}

function captureStreamForVideo(video) {
  if (isDrmVideo(video)) throw new Error('drm-protected');
  const capture = video.captureStream || video.mozCaptureStream;
  if (typeof capture !== 'function') throw new Error('capture-unavailable');
  const stream = capture.call(video);
  if (!(stream instanceof MediaStream) || stream.getTracks().length === 0) throw new Error('capture-unavailable');
  for (const track of stream.getVideoTracks()) {
    try { track.contentHint = 'detail'; } catch { /* optional media-track hint */ }
  }
  for (const track of stream.getAudioTracks()) {
    try { track.contentHint = 'music'; } catch { /* optional media-track hint */ }
  }
  return stream;
}

function selectMimeType(stream) {
  const hasVideo = stream.getVideoTracks().length > 0;
  const candidates = hasVideo
    ? ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm']
    : ['audio/webm;codecs=opus', 'audio/webm'];
  return candidates.find((mimeType) => MediaRecorder.isTypeSupported(mimeType)) || '';
}

function createMediaRecorder(stream, video) {
  if (typeof MediaRecorder !== 'function') throw new Error('capture-unavailable');
  const mimeType = selectMimeType(stream);
  const videoTrackSettings = stream.getVideoTracks()[0]?.getSettings?.() || {};
  const width = Math.max(1, Number(videoTrackSettings.width || video.videoWidth || video.clientWidth || 1280));
  const height = Math.max(1, Number(videoTrackSettings.height || video.videoHeight || video.clientHeight || 720));
  const frameRate = Math.max(1, Number(videoTrackSettings.frameRate || 30));
  const frameRateFactor = Math.max(1, Math.min(2, frameRate / 30));
  const videoBitsPerSecond = Math.max(
    12_000_000,
    Math.min(160_000_000, Math.round(width * height * 15 * frameRateFactor)),
  );
  const options = {
    ...(mimeType ? { mimeType } : {}),
    ...(stream.getVideoTracks().length ? { videoBitsPerSecond } : {}),
    ...(stream.getAudioTracks().length ? { audioBitsPerSecond: 320_000 } : {}),
  };
  const recorder = new MediaRecorder(stream, options);
  recorder.__vidogoQuality = { width, height, frameRate, videoBitsPerSecond };
  return recorder;
}

function safeTitle(value) {
  return String(value || 'recording').replace(/[<>:"/\\|?*\u0000-\u001f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 120) || 'recording';
}

function videoThumbnail(video) {
  try {
    if (!video.videoWidth || !video.videoHeight) return null;
    const width = Math.min(480, video.videoWidth);
    const height = Math.max(1, Math.round(width * video.videoHeight / video.videoWidth));
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    canvas.getContext('2d', { alpha: false })?.drawImage(video, 0, 0, width, height);
    const data = canvas.toDataURL('image/jpeg', 0.76);
    return data.length <= 300_000 ? data : null;
  } catch {
    return null;
  }
}

function recordingDurationMs(recording = activeRecording) {
  if (!recording) return 0;
  const active = recording.segmentStartedAt === null ? 0 : Math.max(0, Date.now() - recording.segmentStartedAt);
  return recording.accumulatedMs + active;
}

function commitRecordingDuration(recording) {
  if (!recording || recording.segmentStartedAt === null) return;
  recording.accumulatedMs += Math.max(0, Date.now() - recording.segmentStartedAt);
  recording.segmentStartedAt = null;
}

function formatDuration(milliseconds) {
  const totalSeconds = Math.floor(Math.max(0, Number(milliseconds) || 0) / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');
  return hours > 0 ? `${hours}:${mm}:${ss}` : `${mm}:${ss}`;
}

function updateButtonLabel(button, label) {
  if (!button) return;
  button.title = label;
  button.setAttribute('aria-label', label);
}

function updateToolbarControls() {
  if (!toolbar || !recordButton || !recordAllButton || !durationElement) return;
  const recording = activeRecording;
  recordButton.classList.toggle('is-recording', Boolean(recording));
  recordButton.disabled = busy;
  updateButtonLabel(recordButton, recording ? messages.stop : messages.start);
  recordAllButton.disabled = busy || Boolean(recording);
  recordAllButton.textContent = messages.recordAllShort;
  updateButtonLabel(recordAllButton, messages.recordAll);
  durationElement.hidden = !recording;
  durationElement.textContent = formatDuration(recordingDurationMs(recording));
  durationElement.title = messages.duration;
  durationElement.setAttribute('aria-label', messages.duration);
  const targetRate = Number((recording?.video || hoveredVideo)?.playbackRate || 1);
  for (const [rate, button] of speedButtons.entries()) {
    button.disabled = busy;
    button.classList.toggle('is-active', Math.abs(targetRate - rate) < 0.01);
    updateButtonLabel(button, formatMessage(messages.speed, { rate }));
  }
}

function enforceRecordingDurationLimit(recording = activeRecording) {
  if (!recording || recording.durationLimitMs === null || recording.durationLimitNotified) return false;
  if (recordingDurationMs(recording) < recording.durationLimitMs) return false;
  recording.durationLimitNotified = true;
  notify('info', messages.durationLimit);
  void stopActiveRecording('recording-duration-limit-reached');
  return true;
}

function setBusy(value) {
  busy = Boolean(value);
  updateToolbarControls();
}

function setPlaybackRate(rate) {
  const video = activeRecording?.video || hoveredVideo;
  if (!video?.isConnected) return;
  try {
    video.playbackRate = rate;
    if ('preservesPitch' in video) video.preservesPitch = rate === 1;
  } catch {
    // Some players own playback-rate control. Keep the toolbar usable.
  }
  updateToolbarControls();
}

function playbackProgress(video) {
  const duration = Number(video.duration);
  const currentTime = Number(video.currentTime);
  if (!Number.isFinite(duration) || duration <= 0 || !Number.isFinite(currentTime)) return 0;
  return Math.max(0, Math.min(100, currentTime / duration * 100));
}

function attachRecordingMonitors(recording) {
  const { video, recorder, stream } = recording;
  const pause = () => {
    if (activeRecording !== recording || recorder.state !== 'recording') return;
    commitRecordingDuration(recording);
    try { recorder.pause(); } catch { /* recorder already transitioning */ }
    updateToolbarControls();
  };
  const resume = () => {
    if (activeRecording !== recording || recorder.state !== 'paused') return;
    try {
      recorder.resume();
      recording.segmentStartedAt = Date.now();
    } catch {
      // A stop may already be in progress.
    }
    updateToolbarControls();
  };
  const ended = () => { void stopActiveRecording('playback-ended'); };
  const detached = window.setInterval(() => {
    if (!video.isConnected || stream.getTracks().every((track) => track.readyState === 'ended')) {
      void stopActiveRecording('source-ended');
    }
  }, 500);
  video.addEventListener('pause', pause);
  video.addEventListener('waiting', pause);
  video.addEventListener('stalled', pause);
  video.addEventListener('playing', resume);
  video.addEventListener('play', resume);
  video.addEventListener('ended', ended);
  return () => {
    window.clearInterval(detached);
    video.removeEventListener('pause', pause);
    video.removeEventListener('waiting', pause);
    video.removeEventListener('stalled', pause);
    video.removeEventListener('playing', resume);
    video.removeEventListener('play', resume);
    video.removeEventListener('ended', ended);
  };
}

async function ensureVideoPlaying(video, fromBeginning) {
  if (fromBeginning && Number.isFinite(video.duration) && video.duration > 0) {
    try {
      const start = video.seekable?.length ? video.seekable.start(0) : 0;
      video.currentTime = Math.max(0, Number(start) || 0);
      if (video.seeking) {
        await new Promise((resolve) => {
          const timer = window.setTimeout(resolve, 2500);
          video.addEventListener('seeked', () => { window.clearTimeout(timer); resolve(); }, { once: true });
        });
      }
    } catch {
      // Live streams and some players do not permit seeking.
    }
  }
  if (video.paused || video.ended || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
    try {
      await video.play();
    } catch {
      throw new Error(messages.wait);
    }
  }
}

function getPlaybackQualityController(video) {
  const candidates = [
    video?.closest?.('#movie_player, .html5-video-player'),
    document.getElementById('movie_player'),
  ].filter(Boolean);
  return candidates.find((candidate, index) => candidates.indexOf(candidate) === index
    && typeof candidate.getAvailableQualityLevels === 'function'
    && (typeof candidate.setPlaybackQualityRange === 'function' || typeof candidate.setPlaybackQuality === 'function')) || null;
}

function selectHighestPlaybackQuality(levels) {
  const available = new Set(Array.isArray(levels) ? levels.map((level) => String(level || '').toLowerCase()) : []);
  return QUALITY_ORDER.find((quality) => available.has(quality)) || null;
}

function requestPlaybackQuality(controller, quality) {
  try { controller.setPlaybackQualityRange?.(quality, quality); } catch { /* player API varies by release */ }
  try { controller.setPlaybackQuality?.(quality); } catch { /* player API varies by release */ }
}

async function requestPlaybackQualityInPage(forcedQuality = null) {
  const result = await webFrame.executeJavaScript(`(() => {
    const qualityOrder = ${JSON.stringify(QUALITY_ORDER)};
    const forcedQuality = ${JSON.stringify(forcedQuality)};
    const videos = Array.from(document.querySelectorAll('video'));
    const video = videos.find((item) => !item.paused && !item.ended)
      || videos.sort((left, right) => {
        const a = left.getBoundingClientRect();
        const b = right.getBoundingClientRect();
        return b.width * b.height - a.width * a.height;
      })[0]
      || null;
    const player = video?.closest?.('#movie_player, .html5-video-player') || document.getElementById('movie_player');
    if (!player || typeof player.getAvailableQualityLevels !== 'function'
      || (typeof player.setPlaybackQualityRange !== 'function' && typeof player.setPlaybackQuality !== 'function')) {
      return { supported: false, levels: [], requested: null, active: null };
    }
    let levels = [];
    try { levels = player.getAvailableQualityLevels() || []; } catch { levels = []; }
    const normalized = levels.map((level) => String(level || '').toLowerCase());
    const requested = forcedQuality || qualityOrder.find((quality) => normalized.includes(quality)) || null;
    if (requested && requested !== 'auto') {
      try { player.setPlaybackQualityRange?.(requested, requested); } catch {}
      try { player.setPlaybackQuality?.(requested); } catch {}
    }
    let active = null;
    try { active = String(player.getPlaybackQuality?.() || '') || null; } catch {}
    return { supported: true, levels: normalized, requested, active };
  })()`, true);
  return result && typeof result === 'object' ? result : { supported: false, levels: [], requested: null, active: null };
}

async function requestHighestPlaybackQuality(video) {
  const before = { width: Number(video.videoWidth) || 0, height: Number(video.videoHeight) || 0 };
  let pageSelection = null;
  try { pageSelection = await requestPlaybackQualityInPage(); } catch { pageSelection = null; }
  const controller = getPlaybackQualityController(video);
  let levels = pageSelection?.levels || [];
  if (!pageSelection?.supported && controller) {
    try { levels = controller.getAvailableQualityLevels() || []; } catch { levels = []; }
  }
  const requested = pageSelection?.requested || selectHighestPlaybackQuality(levels);
  const supported = Boolean(pageSelection?.supported || controller);
  if (!supported) return { supported: false, requested: null, ready: true, before, after: { ...before } };
  if (!requested || requested === 'auto') {
    return { supported: true, requested, ready: true, before, after: { ...before } };
  }
  const expectedHeight = QUALITY_HEIGHTS[requested] || 0;
  if (!pageSelection?.supported && controller) requestPlaybackQuality(controller, requested);
  const deadline = Date.now() + QUALITY_SWITCH_TIMEOUT_MS;
  let active = pageSelection?.active || null;
  while (Date.now() < deadline) {
    const decodedHeight = Number(video.videoHeight) || 0;
    if (!expectedHeight || decodedHeight >= expectedHeight) break;
    await new Promise((resolve) => window.setTimeout(resolve, 250));
    if ((deadline - Date.now()) % 1_000 < 300) {
      if (pageSelection?.supported) {
        try {
          pageSelection = await requestPlaybackQualityInPage(requested);
          active = pageSelection.active || active;
        } catch { /* continue waiting for the decoded-size change */ }
      } else if (controller) {
        requestPlaybackQuality(controller, requested);
        try { active = String(controller.getPlaybackQuality?.() || '') || null; } catch { active = null; }
      }
    }
  }
  const after = { width: Number(video.videoWidth) || 0, height: Number(video.videoHeight) || 0 };
  const ready = !expectedHeight || after.height >= expectedHeight;
  if (!ready) throw new Error(`highest-quality-not-ready:${requested}:${after.height}/${expectedHeight}`);
  return { supported: true, requested, active, ready, before, after };
}

async function startRecording(video, { fromBeginning = false } = {}) {
  if (!recordingEnabled) return { ok: false, error: 'recording-disabled' };
  if (busy || activeRecording || !video?.isConnected) return { ok: false };
  setBusy(true);
  let stream = null;
  let session = null;
  try {
    await ensureVideoPlaying(video, fromBeginning);
    const qualitySelection = await requestHighestPlaybackQuality(video);
    await ensureVideoPlaying(video, false);
    stream = captureStreamForVideo(video);
    const recorder = createMediaRecorder(stream, video);
    session = await ipcRenderer.invoke('recording:start', {
      pageUrl: location.href,
      pageTitle: document.title,
      suggestedFileName: `${safeTitle(document.title)} - recording`,
      mimeType: recorder.mimeType || selectMimeType(stream),
      quality: recorder.__vidogoQuality,
      thumbnailUrl: videoThumbnail(video),
      duration: Number.isFinite(video.duration) ? video.duration : null,
    });
    if (!session?.sessionId) throw new Error('recording-session-not-created');
    const recording = {
      sessionId: session.sessionId,
      recorder,
      stream,
      video,
      startedAt: Date.now(),
      accumulatedMs: 0,
      segmentStartedAt: Date.now(),
      chunkChain: Promise.resolve(),
      chunkError: null,
      cleanup: null,
      durationTimer: 0,
      stopPromise: null,
      mode: fromBeginning ? 'all' : 'manual',
      finalPath: session.path,
      qualitySelection,
      durationLimitMs: Number.isFinite(Number(session.recordingDurationLimitMs)) && Number(session.recordingDurationLimitMs) > 0
        ? Number(session.recordingDurationLimitMs)
        : null,
      durationLimitNotified: false,
    };
    recorder.addEventListener('dataavailable', (event) => {
      if (!event.data || event.data.size === 0) return;
      const dataPromise = event.data.arrayBuffer();
      recording.chunkChain = recording.chunkChain.then(async () => {
        const data = await dataPromise;
        return ipcRenderer.invoke('recording:append', {
          sessionId: recording.sessionId,
          data,
          durationMs: recordingDurationMs(recording),
          percent: playbackProgress(recording.video),
        });
      }).catch((error) => {
        recording.chunkError = error;
      });
    });
    recorder.addEventListener('error', (event) => {
      recording.chunkError = event.error || new Error('MediaRecorder error');
      void stopActiveRecording('recorder-error');
    });
    recording.cleanup = attachRecordingMonitors(recording);
    activeRecording = recording;
    hoveredVideo = video;
    recorder.start(1000);
    recording.durationTimer = window.setInterval(() => {
      updateToolbarControls();
      enforceRecordingDurationLimit(recording);
    }, DURATION_UPDATE_MS);
    showToolbarForVideo(video, true);
    updateToolbarControls();
    return { ok: true, sessionId: recording.sessionId, path: recording.finalPath, qualitySelection };
  } catch (error) {
    stream?.getTracks().forEach((track) => track.stop());
    if (session?.sessionId) {
      try { await ipcRenderer.invoke('recording:abort', { sessionId: session.sessionId, error: String(error?.message || error) }); } catch { /* best effort */ }
    }
    notify('error', recorderErrorMessage(error));
    return { ok: false, error: String(error?.message || error) };
  } finally {
    setBusy(false);
  }
}

async function stopActiveRecording(reason = 'manual-stop') {
  const recording = activeRecording;
  if (!recording) return { ok: false, error: 'no-active-recording' };
  if (recording.stopPromise) return recording.stopPromise;
  recording.stopPromise = (async () => {
    setBusy(true);
    commitRecordingDuration(recording);
    try {
      if (recording.recorder.state !== 'inactive') {
        await new Promise((resolve) => {
          recording.recorder.addEventListener('stop', resolve, { once: true });
          try {
            recording.recorder.requestData();
            recording.recorder.stop();
          } catch {
            resolve();
          }
        });
      }
      await recording.chunkChain;
      if (recording.chunkError) throw recording.chunkError;
      const result = await ipcRenderer.invoke('recording:finish', {
        sessionId: recording.sessionId,
        durationMs: recordingDurationMs(recording),
        reason,
      });
      return { ok: true, ...result };
    } catch (error) {
      try { await ipcRenderer.invoke('recording:abort', { sessionId: recording.sessionId, error: String(error?.message || error) }); } catch { /* best effort */ }
      notify('error', recorderErrorMessage(error));
      return { ok: false, error: String(error?.message || error) };
    } finally {
      recording.cleanup?.();
      window.clearInterval(recording.durationTimer);
      recording.stream.getTracks().forEach((track) => track.stop());
      if (activeRecording === recording) activeRecording = null;
      setBusy(false);
      updateToolbarControls();
      scheduleToolbarHide();
    }
  })();
  return recording.stopPromise;
}

async function toggleRecording() {
  if (activeRecording) return stopActiveRecording('manual-stop');
  if (!hoveredVideo?.isConnected) return { ok: false };
  return startRecording(hoveredVideo);
}

function injectToolbarStyle() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    #${TOOLBAR_ID} {
      position: fixed; inset: auto; right: auto; bottom: auto; z-index: 2147483647;
      display: flex; box-sizing: border-box; align-items: center; justify-content: center;
      gap: 6px; max-width: calc(100vw - 16px); height: 40px; margin: 0; padding: 4px 6px;
      border: 0; border-radius: 999px; background: rgba(12, 16, 24, 0.82);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.34); backdrop-filter: blur(12px);
      opacity: 0; pointer-events: none; transform: none; contain: layout style;
      direction: ltr; color-scheme: dark;
    }
    #${TOOLBAR_ID}.is-visible { opacity: 1; pointer-events: auto; }
    #${TOOLBAR_ID} button {
      flex: 0 0 auto; width: 32px; height: 32px; border: 0; border-radius: 999px;
      display: inline-flex; align-items: center; justify-content: center; color: #fff;
      background: #ef4444; cursor: pointer; box-shadow: inset 0 -1px 0 rgba(0,0,0,.18);
      font: 700 11px/1 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    #${TOOLBAR_ID} button[data-role="record"]::before {
      content: ""; display: block; width: 12px; height: 12px; border-radius: 999px; background: currentColor;
    }
    #${TOOLBAR_ID} button[data-role="record"].is-recording { background: #f8fafc; color: #b91c1c; }
    #${TOOLBAR_ID} button[data-role="record"].is-recording::before { border-radius: 3px; }
    #${TOOLBAR_ID} .duration {
      flex: 0 0 auto; min-width: 42px; color: #f8fafc;
      font: 700 12px/1 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      font-variant-numeric: tabular-nums; text-align: center;
    }
    #${TOOLBAR_ID} .speed-group {
      display: flex; flex: 0 0 auto; gap: 2px; padding: 2px; border-radius: 999px;
      background: rgba(255,255,255,.14);
    }
    #${TOOLBAR_ID} button[data-role="speed"] { width: 30px; height: 28px; background: transparent; color: #f8fafc; box-shadow: none; }
    #${TOOLBAR_ID} button[data-role="speed"].is-active { background: #f8fafc; color: #111827; }
    #${TOOLBAR_ID} button[data-role="record-all"] { width: 42px; padding: 0 4px; background: #60a5fa; color: #0f172a; }
    #${TOOLBAR_ID} button:hover { filter: brightness(1.08); }
    #${TOOLBAR_ID} button:disabled { cursor: progress; filter: grayscale(.25); opacity: .72; }
  `;
  document.documentElement.appendChild(style);
}

function createToolbarButton(role, label, action) {
  const button = document.createElement('button');
  button.type = 'button';
  button.dataset.role = role;
  updateButtonLabel(button, label);
  button.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopImmediatePropagation();
    if (!button.disabled) void action();
  }, true);
  for (const eventName of ['pointerdown', 'pointerup', 'mousedown', 'mouseup', 'dblclick']) {
    button.addEventListener(eventName, (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
    }, true);
  }
  return button;
}

function installToolbar() {
  if (!MAIN_FRAME || document.getElementById(TOOLBAR_ID)) return;
  injectToolbarStyle();
  toolbar = document.createElement('div');
  toolbar.id = TOOLBAR_ID;
  toolbar.setAttribute('role', 'toolbar');
  toolbar.setAttribute('popover', 'manual');
  toolbar.hidden = true;
  recordButton = createToolbarButton('record', messages.start, toggleRecording);
  durationElement = document.createElement('span');
  durationElement.className = 'duration';
  durationElement.textContent = '00:00';
  const speedGroup = document.createElement('div');
  speedGroup.className = 'speed-group';
  for (const rate of PLAYBACK_RATES) {
    const button = createToolbarButton('speed', formatMessage(messages.speed, { rate }), () => setPlaybackRate(rate));
    button.textContent = `${rate}x`;
    speedButtons.set(rate, button);
    speedGroup.appendChild(button);
  }
  recordAllButton = createToolbarButton('record-all', messages.recordAll, () => startRecording(hoveredVideo, { fromBeginning: true }));
  recordAllButton.textContent = messages.recordAllShort;
  toolbar.append(recordButton, durationElement, speedGroup, recordAllButton);
  document.documentElement.appendChild(toolbar);
  updateToolbarControls();
}

function getVideoAtPoint(clientX, clientY) {
  if (!Number.isFinite(clientX) || !Number.isFinite(clientY)) return null;
  for (const element of document.elementsFromPoint(clientX, clientY)) {
    if (element instanceof HTMLVideoElement) return element;
    const nested = element.querySelector?.('video');
    if (nested instanceof HTMLVideoElement) {
      const rect = nested.getBoundingClientRect();
      if (clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom) return nested;
    }
  }
  return null;
}

function pointInside(element, point = lastPointer) {
  if (!element || !point) return false;
  const rect = element.getBoundingClientRect();
  return point.x >= rect.left && point.x <= rect.right && point.y >= rect.top && point.y <= rect.bottom;
}

function toolbarHost() {
  return document.fullscreenElement || document.webkitFullscreenElement || document.documentElement;
}

function syncToolbarHost() {
  if (!toolbar) return;
  const host = toolbarHost();
  if (toolbar.parentElement === host) return;
  try { if (toolbar.matches(':popover-open')) toolbar.hidePopover(); } catch { /* optional API */ }
  host.appendChild(toolbar);
}

function positionToolbar(video) {
  if (!toolbar || !video?.isConnected) return;
  const rect = video.getBoundingClientRect();
  if (rect.width < 80 || rect.height < 60 || rect.bottom < 0 || rect.right < 0 || rect.top > innerHeight || rect.left > innerWidth) {
    hideToolbar();
    return;
  }
  const width = toolbar.offsetWidth || 210;
  const height = toolbar.offsetHeight || 40;
  const minLeft = Math.max(8, rect.left + 8);
  const maxLeft = Math.max(minLeft, Math.min(innerWidth - width - 8, rect.right - width - 8));
  const minTop = Math.max(8, rect.top + 8);
  const maxTop = Math.max(minTop, Math.min(innerHeight - height - 8, rect.bottom - height - 8));
  toolbar.style.left = `${Math.round(Math.max(minLeft, Math.min(maxLeft, rect.left + rect.width / 2 - width / 2)))}px`;
  toolbar.style.top = `${Math.round(Math.max(minTop, Math.min(maxTop, rect.top + 12)))}px`;
}

function showToolbarForVideo(video, force = false) {
  if (!recordingEnabled) return hideToolbar();
  if (!toolbar || !video?.isConnected) return;
  if (!force && !pointInside(video) && !pointInside(toolbar)) return;
  window.clearTimeout(hideTimer);
  hoveredVideo = video;
  syncToolbarHost();
  toolbar.hidden = false;
  try { if (typeof toolbar.showPopover === 'function' && !toolbar.matches(':popover-open')) toolbar.showPopover(); } catch { /* optional API */ }
  updateToolbarControls();
  positionToolbar(video);
  toolbar.classList.add('is-visible');
}

function hideToolbar() {
  if (!toolbar) return;
  toolbar.classList.remove('is-visible');
  try { if (toolbar.matches(':popover-open')) toolbar.hidePopover(); } catch { /* optional API */ }
  toolbar.hidden = true;
}

function scheduleToolbarHide() {
  window.clearTimeout(hideTimer);
  hideTimer = window.setTimeout(() => {
    if (pointInside(activeRecording?.video || hoveredVideo) || pointInside(toolbar)) return;
    hideToolbar();
  }, 120);
}

function handlePointerMove(event) {
  if (!recordingEnabled) return hideToolbar();
  if (!Number.isFinite(event.clientX) || !Number.isFinite(event.clientY)) return;
  lastPointer = { x: Number(event.clientX), y: Number(event.clientY) };
  if (toolbar?.contains(event.target)) {
    if (activeRecording?.video || hoveredVideo) showToolbarForVideo(activeRecording?.video || hoveredVideo, true);
    return;
  }
  const video = getVideoAtPoint(lastPointer.x, lastPointer.y);
  if (video) showToolbarForVideo(video);
  else scheduleToolbarHide();
}

function installRecorderToolbar() {
  if (!MAIN_FRAME) return;
  document.addEventListener('encrypted', rememberEncryptedVideo, true);
  const boot = () => {
    installToolbar();
    document.addEventListener('pointermove', handlePointerMove, true);
    document.addEventListener('pointerover', handlePointerMove, true);
    document.addEventListener('pointerout', (event) => {
      if (event.relatedTarget === null) {
        lastPointer = null;
        scheduleToolbarHide();
      }
    }, true);
    window.addEventListener('scroll', () => positionToolbar(activeRecording?.video || hoveredVideo), true);
    window.addEventListener('resize', () => positionToolbar(activeRecording?.video || hoveredVideo), true);
    document.addEventListener('fullscreenchange', () => showToolbarForVideo(activeRecording?.video || hoveredVideo, true), true);
    window.addEventListener('pagehide', () => { if (activeRecording) void stopActiveRecording('pagehide'); }, true);
    window.setInterval(() => {
      if (toolbar && !toolbar.hidden && (activeRecording?.video || hoveredVideo)) positionToolbar(activeRecording?.video || hoveredVideo);
    }, POSITION_UPDATE_MS);
  };
  if (document.readyState === 'loading') window.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();

  void ipcRenderer.invoke('browser:get-preferred-locale').then(setLocale).catch(() => {
    setLocale(navigator.language);
  });
  void ipcRenderer.invoke('recording:get-enabled').then((enabled) => {
    recordingEnabled = enabled === true;
    if (!recordingEnabled) hideToolbar();
  }).catch(() => { recordingEnabled = false; });
  ipcRenderer.on('browser:preferred-locale-changed', (_event, locale) => setLocale(locale));
  ipcRenderer.on('recording:enabled-changed', (_event, enabled) => {
    recordingEnabled = enabled === true;
    if (!recordingEnabled) {
      hideToolbar();
      if (activeRecording) void stopActiveRecording('recording-disabled');
    }
  });
  ipcRenderer.on('recording:stop-request', (_event, payload) => {
    if (!activeRecording || (payload?.sessionId && payload.sessionId !== activeRecording.sessionId)) return;
    if (payload?.reason === 'recording-duration-limit-reached' && !activeRecording.durationLimitNotified) {
      activeRecording.durationLimitNotified = true;
      notify('info', messages.durationLimit);
    }
    void stopActiveRecording(payload?.reason || 'external-stop');
  });

  if (process.env.ELECTRON_SMOKE_TEST === '1') {
    contextBridge.exposeInMainWorld('__vidogoRecorderSmoke', {
      startFirstVideo: async (fromBeginning = false) => {
        const video = document.querySelector('video');
        if (!(video instanceof HTMLVideoElement)) return { ok: false, error: 'video-not-found' };
        hoveredVideo = video;
        return startRecording(video, { fromBeginning: Boolean(fromBeginning) });
      },
      stop: () => stopActiveRecording('smoke-stop'),
      showFirstVideo: () => {
        const video = document.querySelector('video');
        if (!(video instanceof HTMLVideoElement)) return false;
        hoveredVideo = video;
        showToolbarForVideo(video, true);
        return true;
      },
      snapshot: () => ({
        installed: Boolean(document.getElementById(TOOLBAR_ID)),
        enabled: recordingEnabled,
        visible: Boolean(toolbar && !toolbar.hidden && toolbar.classList.contains('is-visible')),
        active: Boolean(activeRecording),
        buttonCount: toolbar?.querySelectorAll('button').length || 0,
        speedButtons: Array.from(speedButtons.keys()),
        locale: currentLocale,
        sessionId: activeRecording?.sessionId || null,
        mimeType: activeRecording?.recorder?.mimeType || null,
        quality: activeRecording?.recorder?.__vidogoQuality || null,
        qualitySelection: activeRecording?.qualitySelection || null,
        actualVideoBitsPerSecond: activeRecording?.recorder?.videoBitsPerSecond || null,
        recordingDurationLimitMs: activeRecording?.durationLimitMs ?? null,
      }),
    });
  }
}

module.exports = { installRecorderToolbar };
