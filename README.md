<div align="center">
  <img src="assets/vidogo-brand-icon.png" alt="VidoGo Basic" width="144">
  <h1>VidoGo Basic</h1>
  <p>A Windows desktop video browser, detector, downloader, and recorder.</p>
  <p><strong>English</strong> · <a href="README.zh-CN.md">中文</a></p>
  <p>
    <img alt="Version" src="https://img.shields.io/badge/version-0.1.0-1688f0">
    <img alt="Platform" src="https://img.shields.io/badge/platform-Windows%20x64-0078d4">
    <img alt="Electron" src="https://img.shields.io/badge/Electron-39.8.10-47848f">
    <img alt="License" src="https://img.shields.io/badge/license-MIT-22a06b">
  </p>
</div>

---

## Download

Download the Windows installer from the [VidoGo Basic 0.1.0 release](https://github.com/Imoot-TT/VidoGo-Basic/releases/tag/basic-v0.1.0):

- `VidoGo-Basic-0.1.0-x64-Setup.exe`

The installer is published as a GitHub Release asset, not committed to the Git repository.

## Highlights

- Embedded browser with reusable site login sessions.
- Media detection for regular video resources, HLS playlists, and DASH manifests.
- Expandable quality, resolution, and codec variants with recommended choices.
- Cookie-aware downloads through a Python and `yt-dlp` worker.
- Video recording for clear, non-DRM HTML video with bundled FFmpeg remuxing.
- Local download queue, history, favorites, plan limits, themes, and multiple UI languages.
- Basic-specific update checks that only accept `basic-v*` GitHub Releases.

DRM-protected media is intentionally rejected. Users are responsible for following applicable laws, site terms, and content rights.

## Versioning

The current source version is **0.1.0**.

| Item | Convention | Current value |
| --- | --- | --- |
| Product | `VidoGo Basic` | `VidoGo Basic` |
| Semantic version | `MAJOR.MINOR.PATCH` | `0.1.0` |
| Git tag / Release | `basic-vMAJOR.MINOR.PATCH` | `basic-v0.1.0` |
| Windows installer | `VidoGo-Basic-VERSION-x64-Setup.exe` | `VidoGo-Basic-0.1.0-x64-Setup.exe` |

Basic, V2, and Platform maintain independent version sequences. See [VERSION.md](VERSION.md) for the complete policy.

## Run from Source

Requirements:

- Windows 10 or 11 x64
- Node.js and npm
- Python 3
- FFmpeg and FFprobe on `PATH` for development-mode merging and recording

Install dependencies and start the app:

```powershell
npm install
python -m pip install -r requirements.txt
npm start
```

## Build the Windows Installer

Install the build dependency, then create the NSIS installer:

```powershell
python -m pip install -r requirements-build.txt
npm.cmd run dist:win
```

The release build freezes the Python download and metadata workers and bundles FFmpeg and FFprobe. End users do not need separate Python, Node.js, `yt-dlp`, or FFmpeg installations.

Before producing a public installer, set the production HTTPS management origin in [config/account-service.json](config/account-service.json). Packaged builds reject a non-HTTPS account origin; `VIDOGO_ACCOUNT_API_ORIGIN` remains available for development and testing.

## Binary Release Policy

GitHub blocks files larger than 100 MiB in normal repositories. The VidoGo Basic installer is approximately 237 MB, so:

- `dist/` remains ignored by Git.
- Do not use `git add -f` to commit installers, blockmaps, or generated update metadata.
- Commit source code normally.
- Upload installers and related generated artifacts to GitHub Releases.

This follows [GitHub's guidance for distributing large binaries](https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-large-files-on-github#distributing-large-binaries).

## Project Structure

```text
assets/      Application icons and brand assets
backend/     Download and metadata workers
config/      Runtime service configuration
docs/        Development, testing, and parity notes
scripts/     Build and audit scripts
src/         Electron main, preload, and renderer code
tests/       JavaScript, Python, and Electron verification
```

This repository contains only the independent VidoGo Basic desktop product. V2, Platform, the public website, and management services are maintained separately.

## Development Notes

- Development-mode 4K downloads require FFmpeg on `PATH`; release builds bundle it.
- Browser state is stored under the dedicated `VidoGo Runtime\rebuild-v1` profile.
- The account service endpoint is configured through `config/account-service.json` or a development environment override.
- Continue development with [docs/HANDOFF.md](docs/HANDOFF.md), [docs/VIDBROWSER_PARITY.md](docs/VIDBROWSER_PARITY.md), and [docs/TESTING.md](docs/TESTING.md).

## License

MIT
