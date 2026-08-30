(function exposeMediaRules(root, factory) {
  const rules = factory();
  if (typeof module === 'object' && module.exports) module.exports = rules;
  if (root) root.VidoGoMediaRules = rules;
}(typeof globalThis === 'object' ? globalThis : this, () => {
  const MIN_MEDIA_CANDIDATE_SIZE_BYTES = 100 * 1024;
  const PLAYLIST_EXTENSIONS = new Set(['m3u8', 'mpd']);
  const PLAYLIST_MIME_TYPES = new Set([
    'application/dash+xml',
    'application/mpegurl',
    'application/vnd.apple.mpegurl',
    'application/x-mpegurl',
  ]);
  const INTERNAL_MEDIA_FILE_STEM_PATTERN = /(?:^|[_.-])(?:item[_-]?list|playback\d*|playlist|manifest|init(?:ialization)?|chunk\d*|seg(?:ment)?\d*|fragment\d*|bootstrap|header)(?:$|[_.-])/i;
  const YOUTUBE_CONTROL_AUDIO_PATH_PATTERN = /^\/s\/(?:search\/)?audio\/(?:failure|no[_-]?input|open|success)(?:[-_.][^/]*)?\.(?:aac|m4a|mp3|ogg|wav)$/i;

  function normalizePageUrl(rawUrl) {
    try {
      const parsed = new URL(String(rawUrl || '').trim());
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null;
      parsed.hash = '';
      return parsed.href;
    } catch {
      return null;
    }
  }

  function isHostOrSubdomain(hostname, domain) {
    const host = String(hostname || '').toLowerCase().replace(/\.$/, '');
    const suffix = String(domain || '').toLowerCase();
    return host === suffix || host.endsWith(`.${suffix}`);
  }

  function pathParts(parsed) {
    return parsed.pathname.split('/').filter(Boolean);
  }

  function matchMediaPage(parsed) {
    const host = parsed.hostname.toLowerCase();
    const pathname = parsed.pathname.replace(/\/+$/, '') || '/';
    const parts = pathParts(parsed);

    if (host === 'youtu.be' && parts[0]) {
      return { provider: 'youtube', mediaId: parts[0], pageKind: 'video' };
    }
    if (isHostOrSubdomain(host, 'youtube.com') || isHostOrSubdomain(host, 'youtube-nocookie.com')) {
      const videoId = pathname === '/watch'
        ? parsed.searchParams.get('v')
        : pathname.match(/^\/(?:shorts|live|embed)\/([^/]+)/i)?.[1];
      if (videoId) return { provider: 'youtube', mediaId: videoId, pageKind: 'video' };
    }

    if (host === 'player.vimeo.com') {
      const videoId = pathname.match(/^\/video\/(\d+)/i)?.[1];
      if (videoId) return { provider: 'vimeo', mediaId: videoId, pageKind: 'video' };
    }
    if (isHostOrSubdomain(host, 'vimeo.com')) {
      const videoId = pathname.match(/^\/(?:\d+|(?:channels\/[^/]+|groups\/[^/]+\/videos|showcase\/\d+\/video)\/\d+)/i)?.[0]
        ?.match(/\d+$/)?.[0];
      if (videoId) return { provider: 'vimeo', mediaId: videoId, pageKind: 'video' };
    }

    if (isHostOrSubdomain(host, 'tiktok.com')) {
      const videoId = pathname.match(/^\/@[^/]+\/video\/(\d+)/i)?.[1];
      const shareId = pathname.match(/^\/(?:t\/)?([A-Za-z0-9_-]{5,})/i)?.[1];
      if (videoId) return { provider: 'tiktok', mediaId: videoId, pageKind: 'video' };
      if ((host === 'vm.tiktok.com' || host === 'vt.tiktok.com') && shareId) {
        return { provider: 'tiktok', mediaId: shareId, pageKind: 'share' };
      }
    }

    if (isHostOrSubdomain(host, 'instagram.com')) {
      const shortcode = pathname.match(/^\/(?:reels?|p|tv)\/([A-Za-z0-9_-]+)/i)?.[1];
      if (shortcode) return { provider: 'instagram', mediaId: shortcode, pageKind: 'post' };
    }

    if (host === 'fb.watch' && parts[0]) {
      return { provider: 'facebook', mediaId: parts[0], pageKind: 'share' };
    }
    if (isHostOrSubdomain(host, 'facebook.com')) {
      const videoId = parsed.searchParams.get('v')
        || parsed.searchParams.get('video_id')
        || pathname.match(/\/(?:videos|watch|reels?)\/(\d{5,})/i)?.[1];
      if (videoId) return { provider: 'facebook', mediaId: videoId, pageKind: 'video' };
    }

    if (isHostOrSubdomain(host, 'x.com') || isHostOrSubdomain(host, 'twitter.com')) {
      const statusId = pathname.match(/^\/[A-Za-z0-9_]{1,30}\/status\/(\d{5,})/i)?.[1];
      if (statusId) return { provider: 'twitter', mediaId: statusId, pageKind: 'post' };
    }

    if (host === 'dai.ly' && parts[0]) {
      return { provider: 'dailymotion', mediaId: parts[0], pageKind: 'share' };
    }
    if (isHostOrSubdomain(host, 'dailymotion.com')) {
      const videoId = pathname.match(/^\/(?:video|embed\/video)\/([A-Za-z0-9]+)/i)?.[1];
      if (videoId) return { provider: 'dailymotion', mediaId: videoId, pageKind: 'video' };
    }

    if (isHostOrSubdomain(host, 'reddit.com')) {
      const postId = pathname.match(/\/(?:comments)\/([A-Za-z0-9]+)/i)?.[1];
      if (postId) return { provider: 'reddit', mediaId: postId, pageKind: 'post' };
    }

    if (isHostOrSubdomain(host, 'rumble.com')) {
      const videoId = pathname.match(/^\/(?:embed\/)?(v[A-Za-z0-9]+)(?:-|\.|\/|$)/i)?.[1];
      if (videoId) return { provider: 'rumble', mediaId: videoId, pageKind: 'video' };
    }

    if (host === 'clips.twitch.tv' && parts[0]) {
      return { provider: 'twitch', mediaId: parts[0], pageKind: 'clip' };
    }
    if (isHostOrSubdomain(host, 'twitch.tv')) {
      const videoId = pathname.match(/^\/videos\/(\d+)/i)?.[1];
      const clipId = pathname.match(/^\/[^/]+\/clip\/([A-Za-z0-9_-]+)/i)?.[1];
      if (videoId) return { provider: 'twitch', mediaId: videoId, pageKind: 'video' };
      if (clipId) return { provider: 'twitch', mediaId: clipId, pageKind: 'clip' };
      const reserved = new Set(['', 'directory', 'downloads', 'jobs', 'p', 'search', 'settings', 'subscriptions', 'videos']);
      if (parts.length === 1 && !reserved.has(parts[0].toLowerCase())) {
        return { provider: 'twitch', mediaId: parts[0], pageKind: 'live' };
      }
    }

    return null;
  }

  function classifyMediaPage(rawUrl) {
    const normalizedUrl = normalizePageUrl(rawUrl);
    if (!normalizedUrl) return null;
    const parsed = new URL(normalizedUrl);
    const match = matchMediaPage(parsed);
    return match ? { ...match, normalizedUrl } : null;
  }

  function isSupportedMetadataPage(rawUrl) {
    return classifyMediaPage(rawUrl) !== null;
  }

  function extensionFromUrl(rawUrl) {
    try {
      const fileName = new URL(rawUrl).pathname.split('/').pop() || '';
      const match = fileName.match(/\.([A-Za-z0-9]{2,8})$/);
      return match ? match[1].toLowerCase() : '';
    } catch {
      return '';
    }
  }

  function isPlaylistResource({ url, mimeType, extension } = {}) {
    const mime = String(mimeType || '').split(';')[0].trim().toLowerCase();
    const ext = String(extension || extensionFromUrl(url)).replace(/^\./, '').toLowerCase();
    return PLAYLIST_EXTENSIONS.has(ext) || PLAYLIST_MIME_TYPES.has(mime);
  }

  function isInternalMediaControlUrl(parsed, mimeType, extension) {
    const host = parsed.hostname.toLowerCase();
    const mime = String(mimeType || '').split(';')[0].trim().toLowerCase();
    const ext = String(extension || extensionFromUrl(parsed.href)).replace(/^\./, '').toLowerCase();
    if ((isHostOrSubdomain(host, 'youtube.com') || isHostOrSubdomain(host, 'youtube-nocookie.com'))
      && (YOUTUBE_CONTROL_AUDIO_PATH_PATTERN.test(parsed.pathname) || mime.startsWith('audio/') || ['aac', 'm4a', 'mp3', 'ogg', 'wav'].includes(ext))) {
      return true;
    }
    const fileName = parsed.pathname.split('/').pop() || '';
    const stem = fileName.replace(/\.[^.]*$/, '');
    return Boolean(stem && INTERNAL_MEDIA_FILE_STEM_PATTERN.test(stem));
  }

  function shouldIgnoreRawMediaResource({ url, mimeType, extension, sizeBytes } = {}) {
    let parsed;
    try {
      parsed = new URL(String(url || ''));
    } catch {
      return true;
    }
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return true;
    if (isPlaylistResource({ url: parsed.href, mimeType, extension })) return false;
    if (isInternalMediaControlUrl(parsed, mimeType, extension)) return true;
    const size = Number(sizeBytes);
    return Number.isFinite(size) && size > 0 && size < MIN_MEDIA_CANDIDATE_SIZE_BYTES;
  }

  return Object.freeze({
    MIN_MEDIA_CANDIDATE_SIZE_BYTES,
    classifyMediaPage,
    isHostOrSubdomain,
    isPlaylistResource,
    isSupportedMetadataPage,
    normalizePageUrl,
    shouldIgnoreRawMediaResource,
  });
}));
