const {
  MIN_MEDIA_CANDIDATE_SIZE_BYTES,
  classifyMediaPage,
  isPlaylistResource,
  isSupportedMetadataPage,
  normalizePageUrl,
  shouldIgnoreRawMediaResource,
} = require('../src/media-rules');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const supportedPages = [
  ['https://www.youtube.com/watch?v=jNQXAC9IVRw#t=3', 'youtube'],
  ['https://youtu.be/jNQXAC9IVRw', 'youtube'],
  ['https://vimeo.com/76979871', 'vimeo'],
  ['https://player.vimeo.com/video/76979871', 'vimeo'],
  ['https://www.tiktok.com/@scout2015/video/6718335390845095173', 'tiktok'],
  ['https://www.instagram.com/reel/ABC_def-123/', 'instagram'],
  ['https://www.facebook.com/watch/?v=1234567890', 'facebook'],
  ['https://x.com/example/status/1234567890123456789', 'twitter'],
  ['https://www.dailymotion.com/video/x84sh87', 'dailymotion'],
  ['https://www.reddit.com/r/videos/comments/abc123/a_video/', 'reddit'],
  ['https://rumble.com/v4abcde-example.html', 'rumble'],
  ['https://www.twitch.tv/videos/123456789', 'twitch'],
  ['https://www.twitch.tv/example_channel', 'twitch'],
  ['https://www.snapchat.com/spotlight/W7_EDlXWTBiXAEEniNoMPwAAYYWtidGhudGZp', 'snapchat'],
  ['https://kick.com/xqc/videos/5c697a87-afce-4256-b01f-3c8fe71ef5cb', 'kick'],
  ['https://kick.com/xqc/clips/clip_01KWZBW60GAZC6ED96B6FSVX2F', 'kick'],
  ['https://vod.sooplive.com/player/192805325', 'soop'],
  ['https://vod.sooplive.com/PLAYER/STATION/20515605', 'soop'],
  ['https://chzzk.naver.com/video/1754', 'chzzk'],
  ['https://www.nicovideo.jp/watch/sm8628149', 'niconico'],
];

for (const [url, provider] of supportedPages) {
  const result = classifyMediaPage(url);
  assert(result?.provider === provider, `Expected ${provider} classification for ${url}`);
  assert(isSupportedMetadataPage(url), `Expected supported metadata page: ${url}`);
}

const unsupportedPages = [
  'file:///C:/video.mp4',
  'https://www.youtube.com/',
  'https://www.youtube.com/results?search_query=music',
  'https://vimeo.com/watch',
  'https://www.instagram.com/example/',
  'https://x.com/home',
  'https://www.reddit.com/r/videos/',
  'https://www.twitch.tv/directory',
];
for (const url of unsupportedPages) {
  assert(!isSupportedMetadataPage(url), `Expected unsupported collection page: ${url}`);
}

assert(
  normalizePageUrl(' https://example.com/video#chapter ') === 'https://example.com/video',
  'Page URL normalization should trim input and remove fragments',
);
assert(isPlaylistResource({ url: 'https://cdn.example/master.m3u8' }), 'M3U8 should be a playlist');
assert(isPlaylistResource({ url: 'https://cdn.example/stream', mimeType: 'application/dash+xml' }), 'DASH MIME should be a playlist');
assert(
  !shouldIgnoreRawMediaResource({
    url: 'https://cdn.example/master.m3u8',
    mimeType: 'application/vnd.apple.mpegurl',
    sizeBytes: 4_000,
  }),
  'Small manifests must remain visible',
);
assert(
  shouldIgnoreRawMediaResource({
    url: 'https://www.youtube.com/s/search/audio/no_input.mp3',
    mimeType: 'audio/mpeg',
    sizeBytes: null,
  }),
  'YouTube UI sounds must be ignored even without a known size',
);
assert(
  shouldIgnoreRawMediaResource({
    url: 'https://cdn.example/video.mp4',
    mimeType: 'video/mp4',
    sizeBytes: MIN_MEDIA_CANDIDATE_SIZE_BYTES - 1,
  }),
  'Tiny raw video resources should be ignored',
);
assert(
  shouldIgnoreRawMediaResource({
    url: 'https://cdn.example/init.mp4',
    mimeType: 'video/mp4',
    sizeBytes: 5_000_000,
  }),
  'Initialization resources should be ignored',
);
assert(
  !shouldIgnoreRawMediaResource({
    url: 'https://rr1---sn.example.googlevideo.com/videoplayback?id=abc',
    mimeType: 'video/mp4',
    sizeBytes: 5_000_000,
  }),
  'Substantial playback media should remain visible',
);

console.log(JSON.stringify({
  providers: new Set(supportedPages.map(([, provider]) => provider)).size,
  supportedPages: supportedPages.length,
  unsupportedPages: unsupportedPages.length,
  minimumRawMediaBytes: MIN_MEDIA_CANDIDATE_SIZE_BYTES,
}));
