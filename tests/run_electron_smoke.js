const { spawn } = require('child_process');
const fs = require('fs');
const http = require('http');
const os = require('os');
const path = require('path');

const root = path.resolve(__dirname, '..');
const scenario = process.env.ELECTRON_SMOKE_SCENARIO || '';
const requestedExecutable = String(process.env.ELECTRON_SMOKE_EXECUTABLE || '').trim();
const electronPath = requestedExecutable || (process.platform === 'win32'
  ? path.join(root, 'node_modules', 'electron', 'dist', 'electron.exe')
  : path.join(root, 'node_modules', '.bin', 'electron'));
const launchArgs = requestedExecutable ? [] : ['.'];
const launchCwd = requestedExecutable ? path.dirname(path.resolve(requestedExecutable)) : root;
const resultPath = path.join(os.tmpdir(), 'vidogo-smoke-result.json');
const screenshotName = scenario === 'locale-rtl'
  ? 'vidogo-smoke-locale-rtl.png'
  : (scenario === 'account-ui-flow'
    ? 'vidogo-smoke-account-ui.png'
  : (scenario === 'owner-flow'
    ? 'vidogo-smoke-owner.png'
  : (scenario === 'recorder-flow'
    ? 'vidogo-smoke-recorder.png'
    : (scenario === 'manifest-flow'
      ? 'vidogo-smoke-manifest.png'
      : (scenario === 'dash-flow'
        ? 'vidogo-smoke-dash.png'
        : (scenario === 'browser-youtube-flow'
          ? 'vidogo-smoke-youtube.png'
          : (scenario === 'browser-platform-flow' ? 'vidogo-smoke-platform.png' : 'vidogo-smoke-home.png')))))));
const screenshotPath = path.join(os.tmpdir(), screenshotName);

for (const file of [resultPath, screenshotPath]) {
  try {
    fs.unlinkSync(file);
  } catch {
    // Ignore stale-file cleanup failures.
  }
}

const timeoutMs = ['browser-youtube-flow', 'browser-platform-flow', 'download-queue-real', 'resolver-flow'].includes(scenario)
  ? 90000
  : (scenario === 'recorder-flow' ? 50000 : 35000);
let child = null;
let startedAt = 0;
let childOutput = '';
let childExit = null;

function rememberChildOutput(chunk) {
  childOutput = `${childOutput}${String(chunk || '')}`.slice(-16000);
}

function launchSmoke(extraEnv = {}) {
  child = spawn(electronPath, launchArgs, {
    cwd: launchCwd,
    detached: false,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: {
      ...process.env,
      ELECTRON_SMOKE_TEST: '1',
      ELECTRON_SMOKE_RESULT: resultPath,
      ELECTRON_SMOKE_SCREENSHOT: screenshotPath,
      ELECTRON_SMOKE_EXPECT_BACKEND: process.env.ELECTRON_SMOKE_EXPECT_BACKEND || '',
      ...extraEnv,
    },
  });
  child.stdout?.on('data', rememberChildOutput);
  child.stderr?.on('data', rememberChildOutput);
  child.once('exit', (code, signal) => {
    childExit = { code, signal, at: Date.now() };
  });
  startedAt = Date.now();
  poll();
}

function launchRealDownloadSmoke() {
  const mediaBody = Buffer.concat([
    Buffer.from('00000018667479706d703432000000006d70343269736f6d', 'hex'),
    Buffer.alloc(256 * 1024, 0x5a),
  ]);
  const coverBody = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
    'base64',
  );
  const server = http.createServer((request, response) => {
    if (request.url === '/slow.mp4') {
      const chunk = Buffer.alloc(64 * 1024, 7);
      const totalBytes = chunk.length * 24;
      response.writeHead(200, {
        'Accept-Ranges': 'bytes',
        'Content-Length': totalBytes,
        'Content-Type': 'video/mp4',
      });
      let sent = 0;
      const timer = setInterval(() => {
        if (response.destroyed || sent >= totalBytes) {
          clearInterval(timer);
          if (!response.destroyed) response.end();
          return;
        }
        response.write(chunk);
        sent += chunk.length;
      }, 80);
      request.once('close', () => clearInterval(timer));
      return;
    }
    if (request.url === '/cover.png') {
      response.writeHead(200, {
        'Content-Length': coverBody.length,
        'Content-Type': 'image/png',
      });
      response.end(coverBody);
      return;
    }
    const range = String(request.headers.range || '').match(/^bytes=(\d+)-(\d*)$/);
    const start = range ? Number(range[1]) : 0;
    const requestedEnd = range?.[2] ? Number(range[2]) : mediaBody.length - 1;
    const end = Math.min(mediaBody.length - 1, Math.max(start, requestedEnd));
    const body = mediaBody.subarray(start, end + 1);
    response.writeHead(range ? 206 : 200, {
      'Accept-Ranges': 'bytes',
      'Content-Length': body.length,
      'Content-Type': 'video/mp4',
      ...(range ? { 'Content-Range': `bytes ${start}-${end}/${mediaBody.length}` } : {}),
    });
    if (request.method === 'HEAD') response.end();
    else response.end(body);
  });
  server.on('error', (error) => {
    console.error(error?.stack || error);
    process.exit(1);
  });
  server.listen(0, '127.0.0.1', () => {
    const address = server.address();
    const urls = ['a', 'b', 'c', 'd'].map((name) => `http://127.0.0.1:${address.port}/${name}.mp4`);
    const thumbnailUrl = `http://127.0.0.1:${address.port}/cover.png`;
    const slowUrl = `http://127.0.0.1:${address.port}/slow.mp4`;
    const outputDir = fs.mkdtempSync(path.join(os.tmpdir(), 'vidogo-download-queue-smoke-'));
    launchSmoke({
      ELECTRON_SMOKE_REAL_DOWNLOADS: '1',
      ELECTRON_SMOKE_DOWNLOAD_URLS: JSON.stringify(urls),
      ELECTRON_SMOKE_DOWNLOAD_OUTPUT_DIR: outputDir,
      ELECTRON_SMOKE_DOWNLOAD_THUMBNAIL_URL: thumbnailUrl,
      ELECTRON_SMOKE_DOWNLOAD_SLOW_URL: slowUrl,
    });
  });
}

function launchManifestSmoke() {
  let pageUrl = '';
  const server = http.createServer((request, response) => {
    const requestUrl = new URL(request.url, 'http://127.0.0.1');
    if (requestUrl.pathname === '/page.html') {
      const body = Buffer.from(`<!doctype html><html><head><title>HLS Test Video</title></head><body><h1>HLS Test Video</h1><script>fetch('/master.m3u8').then((response) => response.text()).then(() => document.body.dataset.loaded = 'true');</script></body></html>`);
      response.writeHead(200, { 'Content-Length': body.length, 'Content-Type': 'text/html; charset=utf-8' });
      response.end(body);
      return;
    }
    if (['/master.m3u8', '/2160/index.m3u8', '/720/index.m3u8'].includes(requestUrl.pathname)) {
      if (request.headers.referer !== pageUrl) {
        response.writeHead(403, { 'Content-Type': 'text/plain' });
        response.end('missing referrer');
        return;
      }
      const manifest = requestUrl.pathname === '/master.m3u8'
        ? `#EXTM3U\n#EXT-X-STREAM-INF:BANDWIDTH=6280000,RESOLUTION=3840x2160,CODECS="av01.0.08M.08,mp4a.40.2"\n2160/index.m3u8\n#EXT-X-STREAM-INF:AVERAGE-BANDWIDTH=1600000,RESOLUTION=1280x720,CODECS="avc1.64001f,mp4a.40.2"\n720/index.m3u8\n`
        : '#EXTM3U\n#EXTINF:4.5,\nsegment-1.ts\n#EXTINF:5.5,\nsegment-2.ts\n#EXT-X-ENDLIST\n';
      const body = Buffer.from(manifest);
      response.writeHead(200, { 'Content-Length': body.length, 'Content-Type': 'application/vnd.apple.mpegurl' });
      response.end(body);
      return;
    }
    response.writeHead(404, { 'Content-Type': 'text/plain' });
    response.end('not found');
  });
  server.on('error', (error) => {
    console.error(error?.stack || error);
    process.exit(1);
  });
  server.listen(0, '127.0.0.1', () => {
    pageUrl = `http://127.0.0.1:${server.address().port}/page.html`;
    launchSmoke({ ELECTRON_SMOKE_MANIFEST_PAGE_URL: pageUrl });
  });
}

function launchDashSmoke() {
  let pageUrl = '';
  const server = http.createServer((request, response) => {
    const requestUrl = new URL(request.url, 'http://127.0.0.1');
    if (requestUrl.pathname === '/page.html') {
      const body = Buffer.from(`<!doctype html><html><head><title>DASH Test Video</title></head><body><h1>DASH Test Video</h1><script>fetch('/manifest.mpd').then((response) => response.text()).then(() => document.body.dataset.loaded = 'true');</script></body></html>`);
      response.writeHead(200, { 'Content-Length': body.length, 'Content-Type': 'text/html; charset=utf-8' });
      response.end(body);
      return;
    }
    if (requestUrl.pathname === '/manifest.mpd') {
      if (request.headers.referer !== pageUrl) {
        response.writeHead(403, { 'Content-Type': 'text/plain' });
        response.end('missing referrer');
        return;
      }
      const body = Buffer.from(`<?xml version="1.0"?><MPD type="static" mediaPresentationDuration="PT1M30S"><Period><AdaptationSet contentType="video" mimeType="video/mp4"><Representation id="v720" bandwidth="1600000" width="1280" height="720" frameRate="30" codecs="avc1.64001f"/><Representation id="v2160" bandwidth="6280000" width="3840" height="2160" frameRate="60" codecs="av01.0.08M.08"/></AdaptationSet><AdaptationSet contentType="audio" mimeType="audio/mp4" codecs="mp4a.40.2"><Representation id="a128" bandwidth="128000"/></AdaptationSet></Period></MPD>`);
      response.writeHead(200, { 'Content-Length': body.length, 'Content-Type': 'application/dash+xml' });
      response.end(body);
      return;
    }
    response.writeHead(404, { 'Content-Type': 'text/plain' });
    response.end('not found');
  });
  server.on('error', (error) => {
    console.error(error?.stack || error);
    process.exit(1);
  });
  server.listen(0, '127.0.0.1', () => {
    pageUrl = `http://127.0.0.1:${server.address().port}/page.html`;
    launchSmoke({ ELECTRON_SMOKE_MANIFEST_PAGE_URL: pageUrl });
  });
}

function readResult() {
  if (!fs.existsSync(resultPath)) return null;
  return JSON.parse(fs.readFileSync(resultPath, 'utf8'));
}

function poll() {
  const result = readResult();
  if (result) {
    if (!result.ok) {
      console.error(JSON.stringify(result, null, 2));
      process.exit(1);
    }
    console.log(JSON.stringify({
      ...result,
      executablePath: electronPath,
      screenshotPath,
      screenshotBytes: fs.existsSync(screenshotPath) ? fs.statSync(screenshotPath).size : 0,
    }, null, 2));
    process.exit(0);
  }
  if (childExit && Date.now() - childExit.at > 750) {
    console.error(`Electron smoke process exited before writing a result (code=${childExit.code}, signal=${childExit.signal || 'none'})${childOutput ? `\n${childOutput}` : ''}`);
    process.exit(1);
  }
  if (Date.now() - startedAt > timeoutMs) {
    try {
      child?.kill();
    } catch {
      // Ignore cleanup failures on timeout.
    }
    console.error(`Electron smoke test timed out after ${timeoutMs}ms${childOutput ? `\n${childOutput}` : ''}`);
    process.exit(1);
  }
  setTimeout(poll, 250);
}

if (scenario === 'download-queue-real') launchRealDownloadSmoke();
else if (scenario === 'manifest-flow') launchManifestSmoke();
else if (scenario === 'dash-flow') launchDashSmoke();
else launchSmoke();
