# VidoGo Development Handoff

> This handoff applies only to the independent **VidoGo Basic 0.1.0** product line in `VidoGo-Basic/`. V2 work belongs in the sibling `VidoGo-V2/` project and must not reuse these instructions unless explicitly requested.

Read this file first when continuing Basic development. The public website and management service are separate sibling projects under `VidoGo-Platform/`; they must not share private runtime data or build output with this desktop project.

## Current Product Scope

- App name: VidoGo.
- Runtime: Electron desktop shell with a Python `yt-dlp` download worker.
- Reference product: parsed VidBrowser artifacts in the local `legacy_reference/` directory.
- Primary target: match VidBrowser behavior, layout, icons, and interactions page by page.
- Current priority from the user: browser home, tab behavior, webview full-height rendering, media sniffing panel, download page parity, and full interaction testing.
- Current explicit user constraint: do not guess at VidBrowser behavior. Inspect VidBrowser itself and/or the parsed reference before changing layout, icons, or interactions.
- Settings can remain as VidoGo-specific unless it blocks tests. All other visible desktop pages should converge toward VidBrowser.

## Latest Desktop Visual Refinements

- The compact 32px title bar uses the official 16px VidoGo artwork and presents only the product name while leaving room for native Windows controls. It has no bottom border because Windows' native caption overlay would clip that border before the right edge; the full-width `.workspace` owns the separator instead.
- Page identity remains in the sidebar and page content; the title bar deliberately avoids repeating it.
- The browser home adds a connected Browse → Detect → Choose → Save rail below the site shortcuts; labels are localized for all eight desktop locales.
- The signed-out account page uses a responsive two-column layout with product context, entitlement/order/security benefits, the existing login/register form, and a management-service credential notice.
- Settings explains that simultaneous download/recording limits are plan entitlements: Free 1, Pro 5, Ultimate/Lifetime 10. A Free account sees a visibly locked number input and a real “View plans” action; paid plans can modify the value up to their limit.
- Electron smoke screenshots were inspected for the browser shell, Home, and Account states after the change; `npm run smoke` and `npm run check` pass.

## Application Icon Source

- `assets/app-icons/` is the canonical source copied from the user-provided desktop icon set. It contains 16, 24, 32, 48, 64, 128, 256, 512 and 1024px PNGs plus the multi-size Windows ICO.
- `src/renderer/assets/vidogo-app-icon-16.png` is used by the title bar, the 32px asset is used on the account surface, and the 256px asset is loaded by `BrowserWindow` at runtime.
- `assets/app-icon.ico` is the electron-builder Windows executable/installer icon; `scripts/build_icon.ps1` copies the canonical ICO and 1024px PNG without redrawing or resampling them.
- `roundedCorners: true` explicitly requests Electron's native window corners. Windows 11 build 22000+ and macOS render native rounded corners; Windows 10 keeps its system shape. Do not force CSS clipping or transparent-window rounding because that degrades maximize/snap behavior and webview rendering.
- The packaged `VidoGo.exe` icon was extracted after a `win-unpacked` build and visually checked against the official source artwork.

## Important Local Reference Files

These files are intentionally ignored by git because they are extracted reference/build artifacts, but they are the authoritative local reference when available:

- `legacy_reference/out/renderer/assets/index-gYpwNu8G.js`
- `legacy_reference/out/renderer/assets/index-Cyk2skq-.css`
- `legacy_reference/out/preload/webview.js`
- `legacy_reference/out/main/index.js`

Key VidBrowser areas already inspected:

- Browser home component: `index-gYpwNu8G.js` around `70474`.
- Tab bar and empty home tab model: `index-gYpwNu8G.js` around `71920` and `72350`.
- Webview stack: `index-gYpwNu8G.js` around `71998`.
- Browser shell and media panel wiring: `index-gYpwNu8G.js` around `78321`.
- Browser/home CSS: `index-Cyk2skq-.css` around `432`.
- Webview and media panel CSS: `index-Cyk2skq-.css` around `1183`.

## Current Implementation Map

- Main process: `src/main.js`
- Preload bridge: `src/preload.js`
- Webview preload helpers: `src/webview-preload.js`
- Video recorder toolbar and capture logic: `src/recorder-toolbar.js`
- Renderer HTML: `src/renderer/index.html`
- Renderer logic: `src/renderer/app.js`
- Renderer styles: `src/renderer/style.css`
- Download worker: `backend/download_worker.py`
- Download core: `backend/downloader_core.py`
- Smoke runner: `tests/run_electron_smoke.js`
- Renderer static verifier: `tests/verify_renderer_assets.js`
- Backend verifier: `tests/verify_backend.py`

## Current Browser Decisions

- Empty browser state should show the home page first, like VidBrowser.
- Clicking a home shortcut such as YouTube should keep the Home tab at the front and open a browser tab after it.
- The app defaults to dark mode so webview-height regressions are easier to see in screenshots.
- Webview rendering must be full height. Do not rely only on outer DOM dimensions; visually inspect screenshots when changing layout.
- Media candidates are scoped per browser tab, not global.
- The media sniffing panel is visible by default on browser pages and can be closed/reopened.
- VidBrowser keeps YouTube's native page layout inside the webview. On a YouTube watch page, YouTube's own right-side recommendation column remains inside the webview; VidBrowser's media sniffer is an additional app-side panel outside that webview.
- Do not solve the YouTube video page by hiding or replacing YouTube's native recommendations. Match VidBrowser's outer shell and sniffer panel behavior instead.

## Known Issue History

The user reported that after clicking YouTube, the webview content rendered only in the upper part of the page while the bottom showed the app background. Earlier checks only proved the outer `webview` element had full height; that was insufficient. The current fix direction is:

- `.main` is a flex column.
- `.tabbar` is fixed height.
- `.page` must take the remaining flex space with `flex: 1 1 auto; min-height: 0`.
- Active webviews use a VidBrowser-like flow model, not an absolute overlay.
- Active webview resize is scheduled after tab changes, panel changes, load events, and window resize.

Always validate this with a screenshot, not only JSON layout values.

Latest verified evidence:

- `npm.cmd run smoke` passed with `viewHeight === stageHeight === 790`, `sideWidth === 300`, and media panel height `790`.
- Targeted YouTube flow passed with Home first, YouTube second, active webview `1176x790`, and media panel `300x790`.
- The YouTube guest page reported `innerHeight === 790`, `clientHeight === 790`, and `ytd-app.height === 790`.
- The targeted watch flow opened `https://www.youtube.com/watch?v=jNQXAC9IVRw`, produced the specific title `Me at the zoo`, a thumbnail URL, and five bounded quality variants with validated `yt-dlp` selectors.
- Latest targeted screenshot: `%TEMP%\vidogo-youtube-flow.png`.

## Current Browser Home Status

The home page now carries the VidBrowser reference structure/class names while keeping existing VidoGo IDs for logic:

- `browser-home`
- `browser-home-content`
- `browser-home-brand`
- `browser-home-logo`
- `logo-vid`
- `logo-browser`
- `home-address-input`
- `popular-sites`
- `popular-site-groups`
- `popular-site-group`
- `popular-site-list`
- `popular-site-button`

Tests now require these tokens and verify all 15 popular site icons render under `.browser-home .popular-site-button`.

## Current Browser Media Panel Status

The browser page now uses the VidBrowser media sniffer structure instead of the older VidoGo summary card:

- `media-panel generic-media-panel`
- `media-count`
- `media-resolution-filter`
- `media-resolution-select`
- `sniffer-resource-list`
- `sniffer-resource-row`
- `sniffer-resource-main`
- `sniffer-resource-thumbnail`
- `sniffer-resource-content`
- `sniffer-resource-title`
- `sniffer-resource-meta`
- `sniffer-resource-footer`
- `sniffer-resource-size`
- `sniffer-resource-download-actions`
- `sniffer-resource-download`

The implementation now combines filtered raw network sniffing with dedicated page candidates:

- The renderer first attempts the same player-response model found in VidBrowser.
- When YouTube hides private player response APIs, the fallback uses the stable page title/video id and bounded `≤1080p`, `≤720p`, and lower `yt-dlp` selectors instead of promoting random page audio files.
- `backend/metadata_worker.py` provides a cookie-aware `yt-dlp` metadata fallback with a five-minute main-process cache and stale-navigation protection.
- A logical video candidate can carry up to 20 variants. The panel supports expand/collapse and per-variant download. Copy-link buttons were removed after direct reference comparison.
- Explicit format selectors and merge containers are validated in both Electron and Python. WebM variants stay WebM instead of being forced into MP4.
- `src/media-rules.js` is loaded by both the main process and renderer. It recognizes explicit media pages for 10 providers while excluding home/search/feed pages.
- Vimeo, TikTok, Instagram, Facebook, X/Twitter, Dailymotion, Reddit, Rumble, and Twitch pages use the same cookie-aware metadata worker.
- Small non-playlist resources below 100 KB, internal fragments, and YouTube UI sounds are removed from the raw All-tab candidates. HLS and DASH manifests are inspected and promoted to normalized recommended candidates; DASH video rows include compatible audio Representation selectors.
- `requirements.txt` installs yt-dlp's default and `curl-cffi` extras because providers such as Dailymotion require browser impersonation.
- `npm.cmd run pack:win` now produces a self-contained `win-unpacked` build. `backend/worker.py` is frozen to `vidogo-worker.exe`, FFmpeg/FFprobe are copied into `resources/vendor/bin`, and packaged yt-dlp uses Electron itself as its Node-compatible JS runtime.
- The package uses a reproducible VidoGo-owned SVG/PNG/ICO icon pipeline and no VidBrowser brand assets.
- The settings value `maxConcurrentDownloads` now controls a real 1–10 worker queue. Main-process events carry stable `jobId` and URL identity, duplicate active URLs are coalesced, and Stop cancels both active and queued work.
- yt-dlp progress is registered with `add_progress_hook`; mutating `ydl.params` after construction no longer causes successful downloads to be counted as failures.
- `download-queue-real` smoke coverage downloads four loopback MP4 fixtures and verifies two active workers plus one queued worker before the fourth UI-driven download.

Remaining deeper parity work is provider-specific fallback parsing for sites that block generic extraction, richer visible live/DRM state, provider-specific manifest edge cases, and custom-Electron DRM capture. Clear ordinary/live HTML video recording is implemented with the stock Chromium capture APIs.

## 2026-08-23 Control, Icon, and Page-Parity Batch

This batch compared the rendered controls directly against the extracted VidBrowser renderer and main-process bundles. It replaces the improvised VidoGo controls with an Element Plus-compatible SVG icon set and aligns the visible behavior with the reference application.

Completed control-parity work:

- Browser tabs now use the Home, Plus, and Close icons. The artificial status dot was removed.
- The navigation bar now has Back, Forward, Reload/Stop, the address search prefix, and Visit suffix. The loading action changes from Reload to Stop while navigation is active.
- The favorites toolbar button opens the same 320 px popover used by the reference; it no longer toggles a page state directly.
- The unsupported pin/download toolbar shortcut was removed. The media-panel toggle remains the only adjacent action.
- Media-panel Refresh reloads the current page, Clear removes the current candidate state, and Close hides the panel.
- Downloads, history, favorites, account, plan, and settings actions now use the matching reference icon semantics. History no longer exposes a per-row delete action, favorites no longer exposes a fake Add Current header action, orders no longer expose a local delete action, and the plan table uses Circle Check/Circle Close instead of text glyphs.
- Browser tabs are only rendered on the Browser page. Downloads, history, favorites, plans, account, and settings no longer inherit the browser tab strip.
- Settings now has the four reference sections: Interface, Downloads, Preferences, and About. Its content width, section navigation, icon buttons, switches, selectors, and concurrency stepper follow the extracted renderer structure.
- Signed-out Account now follows the reference login/register flow: there is no permanent tab strip, Refresh and Orders are hidden, and the secondary action changes the form mode. Signed-in actions use Change Password and Log Out semantics.
- Native Windows title-bar overlay is used instead of nonfunctional HTML window buttons.

The static renderer verifier now asserts both the required icons and the absence of known incorrect controls. Standard smoke also clicks all page-level controls and asserts that the tab bar is browser-only, the favorites popover is 320 px, all four settings sections are reachable, and removed account/order actions are absent.

Latest verification passed:

- `npm.cmd run check`
- `npm.cmd run check:backend`
- `npm.cmd run smoke`
- `ELECTRON_SMOKE_SCENARIO=download-queue-real npm.cmd run smoke`
- targeted `browser-youtube-flow`, including full-height webview/panel, one recommended candidate, five variants, and a decoded real thumbnail
- packaged `dist\\win-unpacked\\VidoGo.exe` loopback download smoke with `ELECTRON_SMOKE_EXPECT_BACKEND=bundled`
- `git diff --check` (only PowerShell/Git CRLF conversion warnings)

Current distributables:

- Unpacked app: `dist\\win-unpacked\\VidoGo.exe` (`211,130,368` bytes)
- Installer: `dist\\VidoGo-1.5.0-x64-Setup.exe` (`235,911,659` bytes)
- Installer SHA-256: `0F9FE6F132817D6CF02619B08B64C92E45D0AB988D07157A522925F84B96E653`
- Installer block map: `dist\\VidoGo-1.5.0-x64-Setup.exe.blockmap`

The installer payload was successfully opened as a 7z/NSIS archive and matches `latest.yml`. It is currently **not Authenticode-signed** because no Windows code-signing certificate is configured; Windows SmartScreen may therefore warn on first launch.

This batch completes the immediate button/icon/page-semantics request, but it does not complete the broader product-parity goal. All eight reference locales and Arabic RTL coverage are now implemented. Remaining work includes custom-Electron DRM recording, provider-specific extraction fallbacks, real account/payment APIs, and production auto-update delivery.

## 2026-08-23 Plan Entitlement Enforcement

- Added a persisted main-process entitlement store with the extracted Free/Pro/Ultimate/Lifetime daily, concurrency, and recording-duration limits.
- Download batches consume only newly submitted URLs; recordings consume the same daily allowance. Free/Pro recording sessions automatically stop and save at 5/30 minutes.
- Account changes immediately reconfigure main-process limits. Repeated identity normalization was fixed so anonymous and signed-in counters remain separate.
- Registration now returns to sign-in, login no longer auto-creates unknown users, payment creation no longer grants a plan before confirmation, and the non-reference local “continue payment” control was removed.
- Verification passed with `npm run check`, `npm run check:backend`, standard Electron smoke, real loopback-download smoke, and recorder smoke. No installer/package was generated during this follow-up.

## 2026-08-23 Real Update Check

- Replaced the About page's unconditional “latest version” result with a real GitHub Releases check for `Imoot-TT/VidoGo`.
- Added semantic-version and prerelease comparison, preferred Windows Setup asset discovery, strict HTTPS URL validation, a 12-second timeout, and separate unpublished/rate-limited/invalid/offline states.
- When a newer release exists, the settings action changes to Open download page; external launches now reject non-HTTP(S) URLs.
- Static/unit checks and the full Electron interaction smoke pass. The repository currently exposes no public GitHub release, so production correctly reports the unpublished state until a release is published. No package was built.

## 2026-08-23 Media-Control and High-Quality Recorder Follow-up

- The right media row now matches the extracted CSS contract exactly: 38 px joined controls, a 40 px arrow segment, and a centered icon/label flex group. This fixes the earlier block-level SVG that appeared detached at the far left of the orange button.
- `browser-youtube-flow` passes with a zero-pixel joined gap, equal 38 px control heights, five aligned variants, and a decoded real thumbnail.
- Clear HTML video now exposes the VidBrowser-style hover recorder with Record/Stop, duration, 1x/2x/4x, and Record All controls.
- Recording data streams to a main-process `.part` file instead of accumulating the entire session in renderer memory. Completed recordings are remuxed losslessly with bundled FFmpeg and enter the normal Downloads list.
- High-quality bitrate scales from 12 Mbps to 160 Mbps using captured resolution and frame rate. Recording now requests the player's highest advertised quality and waits for the decoded video height before capture; a supported player that stays on a lower rendition fails explicitly. The current recorder smoke verifies an `hd720` switch, 1280x720/24 fps at 13.824 Mbps, VP9, nonzero output, FFmpeg remux, and a completed task row.
- The initial BrowserWindow now matches VidBrowser at 1360x860 with a 980x680 minimum. Download-row action icons are flex-centered, and the smoke test checks each icon's geometric center against its button.

## 2026-08-23 HLS Manifest and Download-Target Follow-up

- Added bounded browser-session HLS inspection with a 2 MB response limit and 12-second timeout. Master playlists resolve relative rendition URLs, normalize AV1/VP9/H.265/H.264 and audio codecs, sort qualities, estimate VOD sizes from duration/bandwidth, and distinguish AES-128 encryption from DRM systems.
- The primary media action retains the complete master playlist; expanded rows target the selected rendition. Only yt-dlp page-metadata candidates fall back to their page URL.
- Playlist/audio extensions are no longer passed as invalid merge containers; only MP4/WebM/MKV survive and all other media targets safely default to MP4.
- A validated HTTP(S) referrer is passed from the active page through Electron to yt-dlp, preserving CDN anti-hotlink compatibility without accepting file URLs, credentials, fragments, or header injection.
- The `manifest-flow` Electron smoke uses a real loopback page and manifests whose server returns 403 without the correct referrer. It currently verifies one recommended item, 2160p AV1 and 720p H.264 rendition rows, size estimates, split-control expansion, and master/variant download targets.
- DASH MPDs now receive the same bounded inspection. Static manifests expose sorted Representation rows with compatible audio paired as `video+audio/video`; dynamic manifests omit size estimates, and Widevine/PlayReady/ClearKey/CENC are classified. The `dash-flow` Electron smoke verifies the same UI geometry and referrer behavior with real MPD requests.
- No installer or package was generated in this follow-up.

## Current Worktree State

The YouTube candidate/variant and generic-provider batches are intentionally uncommitted for user review. Required checks currently pass:

- `npm.cmd run check`
- `npm.cmd run check:backend`
- `npm.cmd run smoke`
- targeted `browser-youtube-flow`
- targeted `manifest-flow`
- targeted `dash-flow`

`npm audit --omit=dev` reports the known `extract-zip` advisory through Electron. npm's proposed automatic change is an invalid downgrade to Electron `0.4.1`; do not apply it. Reassess when Electron publishes a compatible dependency fix.

## Git Notes

- GitHub repository: `https://github.com/Imoot-TT/VidoGo`.
- Local default branch: `main`.
- Remote: `origin https://github.com/Imoot-TT/VidoGo.git`.
- The user provided a GitHub profile URL, not a repository URL: `https://github.com/Imoot-TT`.
- Do not commit `node_modules/`, `dist/`, `build/`, or `legacy_reference/`.
- Do not commit unrelated untracked files such as temporary icon extractions or unrelated markdown drafts.
