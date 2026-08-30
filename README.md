# VidoGo

VidoGo is a rebuilt Electron desktop shell with an embedded browser and a Python download worker.

## Version Baseline

- Independent product line: **VidoGo Basic**.
- Initial source release: **0.1.0**.
- GitHub release tag: **`basic-v0.1.0`**.
- Installer name: **`VidoGo-Basic-0.1.0-x64-Setup.exe`**.
- Basic, V2, and Platform have independent version sequences and release tags; see [`VERSION.md`](VERSION.md).

## What This Rebuild Changes

- Uses a dedicated `VidoGo Runtime\\rebuild-v1` profile instead of the old VidBrowser browser data.
- Uses its own persistent browser partition for login state reuse during downloads.
- Recreates the main VidBrowser-style workspace: home shortcuts, browser tabs, media side panel, downloads, history, favorites, plans, account, theme, and language controls.
- Adds local browser enhancements for popup routing, preferred language headers, basic ad/tracker blocking, cosmetic ad hiding, YouTube ad-skip assistance, and media resource sniffing.
- Inspects HLS and DASH manifests in the embedded browser session, resolves HLS renditions, pairs DASH video/audio representations, labels resolution/codecs, estimates VOD sizes, detects live/encrypted/DRM state, and passes the page referrer through to protected CDN downloads.
- Exposes a session reset action in the UI so browser login state can be cleared explicitly.
- Keeps download settings and records locally, including output directory, resolution, playlist mode, audio-only mode, progress, status, file/folder actions, and clear-finished controls.
- Adds a VidBrowser-style video hover recorder for clear, non-DRM HTML video. Before capture it selects the player's highest advertised quality and waits for the decoded resolution; recordings then stream to disk, appear in the unified Downloads list, use high-bitrate VP9/WebM, and are losslessly remuxed with the bundled FFmpeg for duration/seeking metadata.
- Enforces the extracted plan limits locally across downloads and recordings: Free is 5 uses/day, 1 concurrent task, and 5 minutes per recording; Pro is 30/day, 5 concurrent tasks, and 30 minutes; Ultimate/Lifetime are unlimited per day with up to 10 concurrent tasks and unlimited recording duration.
- The About page now checks the VidoGo GitHub Releases API, compares semantic versions, distinguishes unpublished/rate-limited/offline states, and exposes the verified HTTPS release page when a newer version exists.
- Does not connect to any legacy VidBrowser membership or billing endpoint.

## Run

Install dependencies:

```powershell
npm install
python -m pip install -r requirements.txt
```

Start the desktop app:

```powershell
npm start
```

## Build a Windows Release

Install the one-time build dependency, then create either an unpacked app or an NSIS installer:

```powershell
python -m pip install -r requirements-build.txt
npm.cmd run pack:win
npm.cmd run dist:win
```

The build freezes the Python download/metadata entrypoints into one `vidogo-worker.exe` and copies `ffmpeg.exe` plus `ffprobe.exe` into the packaged resources. The installed app therefore does not require a separate Python, yt-dlp, Node.js, or FFmpeg installation. The build machine must have `ffmpeg` and `ffprobe` on `PATH`.

## Download Worker

The Electron UI launches [`backend/download_worker.py`](backend/download_worker.py), which uses `yt-dlp` for downloads and can reuse cookies and a validated HTTP referrer from the embedded browser session. YouTube watch pages are normalized into one recommended video candidate with expandable quality/codec variants; exact metadata uses the embedded player when available and a cookie-aware [`backend/metadata_worker.py`](backend/metadata_worker.py) fallback otherwise. HLS master playlists and DASH MPDs are inspected directly and become expandable rendition rows; DASH selections carry an explicit video-plus-audio format selector. Explicit media pages from Vimeo, TikTok, Instagram, Facebook, X/Twitter, Dailymotion, Reddit, Rumble, and Twitch use the same cookie-aware metadata path. The `curl-cffi` extra in `requirements.txt` enables sites that require browser impersonation.

## Notes

- Development-mode 4K downloads require `ffmpeg` on `PATH`; Windows release builds bundle it so separate audio/video streams can be merged.
- Web recording requests the highest quality exposed by supported page players, waits for that decoded height, and preserves the resolution delivered to the video element. Its target bitrate scales from at least 12 Mbps to 160 Mbps by decoded resolution/frame rate. DRM-protected streams are intentionally rejected instead of producing a corrupt or misleading file.
- Browser login state is stored only in the new `VidoGo Runtime\\rebuild-v1` profile.
- Old unpacked VidBrowser artifacts in this workspace are reference material only and are not the current runtime entrypoint.

## Development Handoff

Before continuing feature work, read:

- [`docs/HANDOFF.md`](docs/HANDOFF.md)
- [`docs/VIDBROWSER_PARITY.md`](docs/VIDBROWSER_PARITY.md)
- [`docs/TESTING.md`](docs/TESTING.md)

## Workspace Boundary

This directory is a self-contained desktop project. It does not contain V2, the public website, or the management service. Those sibling projects are documented in [`../Workspace-Docs/目录结构与版本说明.md`](../Workspace-Docs/目录结构与版本说明.md).

Before building a public installer, set the production HTTPS management origin in [`config/account-service.json`](config/account-service.json). Packaged builds reject a non-HTTPS account origin; `VIDOGO_ACCOUNT_API_ORIGIN` remains available as a development/test override.
