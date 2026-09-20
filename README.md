<div align="center">
  <img src="assets/vidogo-brand-icon.png" alt="VidoGo Basic" width="144">
  <h1>VidoGo Basic</h1>
  <p>A Windows desktop app for discovering, downloading, and recording online video.</p>
  <p><strong>English</strong> · <a href="README.zh-CN.md">中文</a></p>
  <p>
    <img alt="Version" src="https://img.shields.io/badge/version-0.2.0-1688f0">
    <img alt="Platform" src="https://img.shields.io/badge/platform-Windows%20x64-0078d4">
    <img alt="License" src="https://img.shields.io/badge/license-MIT-22a06b">
  </p>
</div>

---

## Download

[Download VidoGo Basic 0.2.0 for Windows x64](https://github.com/Imoot-TT/VidoGo-Basic/releases/tag/basic-v0.2.0)

## Features

- Paste one public or authorized source link to create a complete creator asset pack.
- Detect regular video, HLS, and DASH media.
- Discover and download video, MP3, images, and subtitles.
- Choose from available quality and codec options.
- Download with reusable browser login sessions.
- Record clear, non-DRM HTML video.
- Manage downloads, history, and favorites locally.

One source link counts as one Free project even when its video, MP3, subtitle, and cover are all saved. DRM-protected media is not supported.

## Plans

- Free: 5 source projects per day.
- Creator: US$39/year or a limited US$59 founder lifetime offer during validation.

Optional anonymous funnel analytics record only product steps such as media detected, verified save, editor import, second session, and purchase. URLs, titles, searches, filenames, paths, cookies, and downloaded content are excluded.

## Run from Source

```powershell
npm install
python -m pip install -r requirements.txt
npm start
```

### Account service

Sign-in, registration, plans, and orders are provided by the separate VidoGo Management Platform. The Basic desktop app is a client and does not start or embed the account server.

The default configuration points to the current production account service. Override it when local development uses a locally running account service:

```powershell
$env:VIDOGO_ACCOUNT_API_ORIGIN = 'http://127.0.0.1:8790'
npm start
Remove-Item Env:VIDOGO_ACCOUNT_API_ORIGIN
```

`192.168.31.17` is the LAN host running the server, not the public API origin that should ship to users. Production installers must use a public HTTPS account-service origin; the release build validates and injects `VIDOGO_ACCOUNT_API_ORIGIN` instead of packaging a LAN or loopback address.

## Media organization

All assets from one source share one media-project folder:

```text
VidoGo Basic/YouTube/Title [media ID]/
├─ video/       Video quality variants
├─ audio/       Extracted MP3 files
├─ images/      One shared cover.* plus gallery images
├─ subtitles/   Language-specific subtitles
└─ metadata.json
```

Downloading the same source again reuses its project folder and existing cover.

## License

MIT
