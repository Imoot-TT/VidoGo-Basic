# VidoGo Testing

Use PowerShell on Windows. Use `npm.cmd`, not bare `npm`, because PowerShell script policy can block `npm`.

## Required Checks

```powershell
npm.cmd run check
npm.cmd run check:backend
npm.cmd run smoke
```

`npm.cmd run check` includes `tests/verify_media_rules.js`, which verifies the shared main/renderer provider classifier and raw-resource noise filtering. The classifier must reject provider home/search/feed pages while accepting explicit video, post, clip, and supported live-channel URLs.

Use the loopback-only real download scenario to verify worker concurrency and progress events without external network dependencies:

```powershell
$env:ELECTRON_SMOKE_SCENARIO='download-queue-real'
npm.cmd run smoke
Remove-Item Env:\ELECTRON_SMOKE_SCENARIO
```

The scenario serves four small MP4 responses from `127.0.0.1`, verifies a 2-active/1-queued batch, then exercises a fourth download through the normal UI. It must finish all rows with distinct `jobId` values and return to an idle queue state.

Use the recorder scenario to exercise an actual 1280x720 canvas-backed video through the WebView preload, `captureStream()`, `MediaRecorder`, chunk IPC, disk writer, FFmpeg remux, and Downloads-list completion:

```powershell
$env:ELECTRON_SMOKE_SCENARIO='recorder-flow'
npm.cmd run smoke
Remove-Item Env:\ELECTRON_SMOKE_SCENARIO
```

The result must report five toolbar buttons, playback rates `[1, 2, 4]`, a successful highest-player-quality selection, VP9/WebM, preserved 1280x720 track settings, an actual encoder bitrate of at least 12 Mbps, `remuxed: true`, nonzero bytes, and a completed unified recording row. The screenshot is `%TEMP%\vidogo-smoke-recorder.png`.

Before distributing a Windows build, also run:

```powershell
python -m pip install -r requirements-build.txt
npm.cmd run pack:win
```

Verify `dist\win-unpacked\resources\vendor\vidogo-worker.exe`, `ffmpeg.exe`, and `ffprobe.exe` exist, then launch `dist\win-unpacked\VidoGo.exe` with the packaged smoke-test environment. A packaged app must report `backendMode: bundled`.

Do not commit browser/media-panel code changes unless these checks pass. If the user asks only to record documentation, stage and commit the documentation separately from unstable source WIP.

## Browser YouTube Flow

Use this targeted smoke scenario when validating the user-reported YouTube half-height problem:

```powershell
$env:ELECTRON_SMOKE_SCENARIO='browser-youtube-flow'
$env:ELECTRON_SMOKE_FINAL_SECTION='browser'
npm.cmd run smoke
Copy-Item "$env:TEMP\vidogo-smoke-home.png" "$env:TEMP\vidogo-youtube-flow.png" -Force
Remove-Item Env:\ELECTRON_SMOKE_SCENARIO
Remove-Item Env:\ELECTRON_SMOKE_FINAL_SECTION
```

Then visually inspect:

```text
C:\Users\admin\AppData\Local\Temp\vidogo-youtube-flow.png
```

For the dark-mode inspection used to verify the reported half-height issue, keep a named copy:

```powershell
Copy-Item "$env:TEMP\vidogo-smoke-home.png" "$env:TEMP\vidogo-youtube-flow-vidbrowser-structure-dark.png" -Force
```

The screenshot must show:

- Top tab bar with Home first and YouTube after it.
- Browser toolbar visible.
- YouTube content/webview occupying the full browser stage height.
- On a YouTube watch page, YouTube's native recommendation column should remain inside the webview.
- Right media sniffing panel full height.
- A recommended candidate for the actual watch-page video with a specific title, thumbnail URL, and one or more `formatId` variants.
- The targeted flow waits for YouTube guest content before taking the screenshot; do not accept an early blank-page screenshot as visual proof.
- The targeted flow forces both the VidoGo shell and YouTube guest page into dark rendering before screenshot capture.

The current passing target is not just visual: the smoke JSON must report `viewHeight === stageHeight`, no inline webview sizing, and `mediaPanelHeight === stageHeight`.

## Smoke Coverage

The renderer smoke test currently exercises:

- Native title-bar overlay contract (no custom renderer window glyphs).
- Sidebar navigation.
- Browser-only tab-strip visibility; non-browser pages must not retain the tab strip.
- Empty browser/home state.
- Home search.
- Home YouTube shortcut.
- Media panel close/reopen.
- Theme and language switches.
- Browser tab add/switch/close.
- Browser favorite/favorites popover and media panel toggle.
- Media refresh, clear, recommended/all tabs.
- YouTube player-response/fallback format planning and candidate variant expansion.
- Shared dedicated-page classification for 10 providers and filtering for tiny non-playlist resources, internal stream fragments, and YouTube UI sounds.
- Full-width per-variant download controls, absence of non-reference copy-link buttons, and validated merge-container handoff.
- Joined media download geometry: zero split gap, equal 38 px heights, and the download icon/label centered as one group.
- Real clear-video recording with the hover toolbar, highest-player-quality switching, decoded-size gating, high-quality bitrate, incremental file writes, FFmpeg remux, and unified task-row completion.
- Download start/cancel, filters, ranges, pagination, open file/folder, remove, retry, clear finished, import, output selection.
- Real 1–10 worker queue concurrency, per-job progress identity, overflow queue pumping, and loopback downloads.
- History item open/clear and absence of a non-reference per-row delete action.
- Favorites popover open/current-page toggle/close plus favorites-page open/remove.
- Plan selection and payment-channel interactions.
- Plan entitlement cells use circle-check/circle-close icons and purchase uses lock/shopping-cart semantics.
- Account register/login/logout/refresh/change-password/order interactions; registration returns to login, payment creation does not grant a plan, refresh and orders are hidden while signed out, and orders have no local payment-confirmation/delete action.
- `tests/verify_entitlements.js` checks daily rollover, account isolation, unlimited plans, idempotent identity normalization, and the 1/5/10 concurrency ceilings. Electron smoke verifies plan state reaches settings and the recorder, while recorder smoke verifies the Free 5-minute limit alongside source-resolution capture.
- `tests/verify_update_check.js` covers stable/prerelease semantic versions, newer/current/unpublished release states, setup-asset selection, and rejection of unsafe release URLs. Electron smoke verifies the About-page result and its release-page action using a deterministic GitHub response.
- `tests/verify_manifest_rules.js` covers quoted HLS attributes, relative URLs, DASH Representations, video/audio pairing, rendition ordering, codec normalization, VOD size estimates, AES-128 encryption, and DRM systems. Run `$env:ELECTRON_SMOKE_SCENARIO='manifest-flow'; npm.cmd run smoke; Remove-Item Env:ELECTRON_SMOKE_SCENARIO` and repeat with `dash-flow` for real browser-session requests. Both loopback servers reject missing referrers and the UI must render 2160p AV1 and 720p H.264 rows; DASH additionally verifies the `video+audio/video` selector.
- Settings four-section navigation, language/theme selects, output directory, number-stepper concurrency, search engine, ad-block switch, current/latest version and update check.

## Cleanup If Electron Hangs

```powershell
Get-Process electron -ErrorAction SilentlyContinue |
  Where-Object { $_.Path -eq 'C:\Users\admin\Documents\New project 4\node_modules\electron\dist\electron.exe' } |
  ForEach-Object { try { Stop-Process -Id $_.Id -Force -ErrorAction Stop } catch {} }
```
