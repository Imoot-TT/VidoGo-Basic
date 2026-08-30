const {
  buildDashCandidate,
  buildHlsCandidate,
  estimatedSizeBytes,
  parseAttributeList,
  parseHlsPlaylist,
  parseDashManifest,
  parseIsoDuration,
} = require('../src/manifest-rules');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const attributes = parseAttributeList('#EXT-X-STREAM-INF:BANDWIDTH=6280000,CODECS="av01.0.08M.08,mp4a.40.2",RESOLUTION=3840x2160');
assert(attributes.CODECS === 'av01.0.08M.08,mp4a.40.2', 'Quoted codec lists must retain commas');

const master = parseHlsPlaylist(`#EXTM3U
#EXT-X-VERSION:6
#EXT-X-STREAM-INF:BANDWIDTH=1800000,AVERAGE-BANDWIDTH=1600000,RESOLUTION=1280x720,CODECS="avc1.64001f,mp4a.40.2"
video/720/index.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=6280000,RESOLUTION=3840x2160,FRAME-RATE=60,CODECS="av01.0.08M.08,mp4a.40.2"
https://video.example/2160/index.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=6280000,RESOLUTION=3840x2160,CODECS="av01.0.08M.08,mp4a.40.2"
https://video.example/2160/index.m3u8
`, 'https://cdn.example/path/master.m3u8');

assert(master?.isMaster && master.variants.length === 2, 'Master variants must be parsed and deduplicated');
assert(master.variants[0].height === 2160 && master.variants[0].videoCodec === 'AV1', 'Variants must be sorted by quality and normalize codecs');
assert(master.variants[1].url === 'https://cdn.example/path/video/720/index.m3u8', 'Relative variant URLs must resolve against the manifest');
assert(master.variants[1].bandwidthBitsPerSecond === 1600000, 'Average bandwidth must be preferred');

const media = parseHlsPlaylist(`#EXTM3U
#EXT-X-KEY:METHOD=AES-128,URI="key.bin"
#EXTINF:4.5,
segment-1.ts
#EXTINF:5.5,
segment-2.ts
#EXT-X-ENDLIST
`, 'https://cdn.example/path/video.m3u8');
assert(media && !media.isMaster && media.isLive === false, 'VOD media playlists must be recognized');
assert(media.durationSeconds === 10 && media.isEncrypted && !media.isDrmProtected, 'AES-128 must be encrypted without being mislabeled as DRM');
assert(parseHlsPlaylist('<html>not a manifest</html>', 'https://cdn.example/test') === null, 'Non-HLS text must be rejected');

const candidate = buildHlsCandidate({
  id: 'hls-1',
  url: 'https://cdn.example/path/master.m3u8',
  title: 'Example video',
}, master, media);
assert(candidate.url.endsWith('/master.m3u8'), 'Primary download must retain the complete master playlist');
assert(candidate.extension === 'mp4' && candidate.variants.length === 2, 'HLS downloads must use a valid merged output extension');
assert(candidate.qualityLabel === '2160p' && candidate.videoCodec === 'AV1', 'Primary display metadata must use the best variant');
assert(candidate.variants[0].sizeBytes === estimatedSizeBytes(10, 6280000), 'VOD size must be estimated from duration and bandwidth');

const liveMedia = parseHlsPlaylist(`#EXTM3U
#EXTINF:4.5,
segment-1.ts
`, 'https://cdn.example/path/live.m3u8');
const liveCandidate = buildHlsCandidate({ id: 'hls-live', url: 'https://cdn.example/path/master.m3u8' }, master, liveMedia);
assert(liveCandidate.isLive && liveCandidate.downloadStrategy === 'record', 'Live HLS must require recording instead of direct download');

const drm = parseHlsPlaylist(`#EXTM3U
#EXT-X-SESSION-KEY:METHOD=SAMPLE-AES,KEYFORMAT="com.apple.streamingkeydelivery",URI="skd://asset"
#EXT-X-STREAM-INF:BANDWIDTH=800000,RESOLUTION=640x360,CODECS="avc1.4d401e,mp4a.40.2"
360.m3u8
`, 'https://cdn.example/master.m3u8');
const drmCandidate = buildHlsCandidate({ id: 'drm', url: 'https://cdn.example/master.m3u8' }, drm);
assert(drmCandidate.isDrmProtected && drmCandidate.drmSystem === 'FairPlay', 'HLS DRM systems must be detected');
assert(!drmCandidate.isRecommended && drmCandidate.downloadStrategy === 'unsupported', 'DRM manifests must not be recommended as direct downloads');

assert(parseIsoDuration('PT1H2M3.5S') === 3723.5, 'ISO media durations must be parsed');
const dash = parseDashManifest(`<?xml version="1.0"?>
<MPD type="static" mediaPresentationDuration="PT1M30S">
  <Period>
    <AdaptationSet contentType="video" mimeType="video/mp4">
      <Representation id="v720" bandwidth="1600000" width="1280" height="720" frameRate="30" codecs="avc1.64001f" />
      <Representation id="v2160" bandwidth="6280000" width="3840" height="2160" frameRate="60" codecs="av01.0.08M.08" />
    </AdaptationSet>
    <AdaptationSet contentType="audio" mimeType="audio/mp4" codecs="mp4a.40.2">
      <Representation id="a128" bandwidth="128000"><BaseURL>audio.m4a</BaseURL></Representation>
    </AdaptationSet>
  </Period>
</MPD>`, 'https://cdn.example/manifest.mpd');
assert(dash?.videos.length === 2 && dash.audios.length === 1, 'DASH video and audio representations must be parsed');
assert(dash.durationSeconds === 90 && !dash.isLive, 'Static DASH duration must be retained');
assert(dash.videos[0].height === 2160 && dash.videos[0].videoCodec === 'AV1', 'DASH video representations must be sorted and labeled');
const dashCandidate = buildDashCandidate({ id: 'dash', url: 'https://cdn.example/manifest.mpd', title: 'DASH video' }, dash);
assert(dashCandidate.variants.length === 2 && dashCandidate.qualityLabel === '2160p', 'DASH candidate must expose quality variants');
assert(dashCandidate.variants[0].formatId === 'v2160+a128/v2160', 'DASH video must pair with a compatible audio representation');
assert(dashCandidate.variants[0].sizeBytes === estimatedSizeBytes(90, 6408000), 'DASH size must include paired audio bandwidth');

const liveDash = parseDashManifest(`<MPD type="dynamic"><Period><AdaptationSet contentType="video"><Representation id="live" bandwidth="1000000" width="1280" height="720" codecs="avc1.4d401f"/></AdaptationSet></Period></MPD>`, 'https://cdn.example/live.mpd');
const liveDashCandidate = buildDashCandidate({ id: 'dash-live', url: 'https://cdn.example/live.mpd' }, liveDash);
assert(liveDashCandidate.isLive && liveDashCandidate.downloadStrategy === 'record', 'Live DASH must require recording instead of direct download');

const dashDrm = parseDashManifest(`<MPD type="dynamic"><Period><AdaptationSet contentType="video"><ContentProtection schemeIdUri="urn:uuid:edef8ba9-79d6-4ace-a3c8-27dcd51d21ed"/><Representation id="live" bandwidth="1000000" width="1280" height="720" codecs="avc1.4d401f"/></AdaptationSet></Period></MPD>`, 'https://cdn.example/live.mpd');
const dashDrmCandidate = buildDashCandidate({ id: 'dash-drm', url: 'https://cdn.example/live.mpd' }, dashDrm);
assert(dashDrmCandidate.isLive && dashDrmCandidate.drmSystem === 'Widevine', 'Dynamic DASH DRM state must be detected');
assert(dashDrmCandidate.variants[0].sizeBytes === null && !dashDrmCandidate.isRecommended, 'Live DRM DASH must not estimate size or become recommended');

console.log(JSON.stringify({ hlsVariants: candidate.variants.length, hlsBest: candidate.qualityLabel, hlsDrm: drmCandidate.drmSystem, dashVariants: dashCandidate.variants.length, dashBest: dashCandidate.qualityLabel, dashDrm: dashDrmCandidate.drmSystem }));
