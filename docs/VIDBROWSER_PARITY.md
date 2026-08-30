# VidBrowser Parity Notes

This document records the expected VidoGo behavior derived from the parsed VidBrowser reference.

## Browser Home

VidBrowser home structure uses these concepts:

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

Home behavior:

- Start at a home/new-tab state with no active webview.
- Search input focuses on home load.
- Pressing Enter in the home search opens a new browser tab.
- Clicking a popular site opens a new browser tab.
- The Home tab remains before browser tabs in the top tab bar.

Current VidoGo home now exposes the VidBrowser class structure above while preserving VidoGo IDs for existing logic and tests. Do not invent a new visual direction; continue copying the parsed reference structure and CSS as closely as practical.

## Browser Tabs

VidBrowser model:

- A Home button/tab exists first.
- Browser tabs are created when a URL is opened.
- A new tab action creates/selects a home/new-tab state before navigation.
- Closing the last browser tab returns to the home state.

VidoGo target:

- Preserve this model.
- Avoid preloading YouTube at startup.
- Keep exactly one visible active webview when a browser tab is selected.

## Webview Height

Requirement:

- YouTube and later tabs must render full height, not only report full outer DOM height.
- The user-reported problem is height, not width. Screenshots must be checked for bottom-half blank/background areas after the page has actually loaded.

Evidence required:

- Smoke layout must show `viewHeight === stageHeight`.
- Screenshot must show the webview content area occupying the full browser stage.
- When debugging, inspect both host DOM and guest page dimensions.
- For YouTube specifically, wait until the guest page reports loaded content before screenshotting. The targeted smoke test records guest `innerHeight`, `clientHeight`, and `ytd-app` rect height.

Important: a pass from `getBoundingClientRect()` alone is not enough if the screenshot still shows half rendering.

## Media Sniffing Panel

VidBrowser model:

- Media panel visible by default on active browser pages.
- Toolbar button toggles the media panel.
- Panel close action hides it.
- Candidates are associated with the active browser tab.
- Recommended/all tabs and resolution filtering are part of the panel interaction.
- Header action icons are refresh, clear/delete, and close.
- Browser toolbar icons around the address bar should follow VidBrowser: back, forward, refresh, favorites popover, and media panel toggle. Do not add unrelated toolbar buttons.

VidoGo target:

- Do not make media candidates global.
- The panel refresh button reloads the active page, matching VidBrowser; clear/delete removes candidates for the active tab/webContents.
- Closing the panel should expand the browser webview area.
- Reopening the panel should restore the right-side panel without causing webview height regression.
- Use the VidBrowser panel/list structure: `media-panel generic-media-panel`, `media-count`, `media-resolution-filter`, `sniffer-resource-list`, and `sniffer-resource-row`.
- Resource rows should expose title, kind/format/resolution metadata, size, and the reference download/split actions. Do not add copy-link controls; the reference panel does not expose them.
- Split resource downloads must use the reference 38 px primary button plus 40 px variant toggle. The download SVG and label are centered as one flex group; the joined gap is zero.

Current non-YouTube baseline:

- A shared main/renderer rule module recognizes explicit Vimeo, TikTok, Instagram, Facebook, X/Twitter, Dailymotion, Reddit, Rumble, and Twitch media pages.
- Recognized pages use cookie-aware `yt-dlp` metadata extraction; provider home, search, and feed pages do not start extraction.
- Raw-resource sniffing removes known internal fragments, YouTube control sounds, and non-playlist resources below 100 KB. HLS and DASH manifests are fetched through the persistent browser session and expanded into sorted rendition rows with codec labels, VOD size estimates, live/encryption state, and DRM detection. DASH video rows are paired with compatible audio Representation IDs.

Remaining deeper parity work:

- Add provider-specific fallbacks where a site blocks generic `yt-dlp` extraction or requires special page-state parsing.
- Add richer visible DRM/live-state badges and provider-specific manifest edge cases; HLS master/rendition and DASH Representation inspection are implemented.

## YouTube Watch Page

Observed VidBrowser behavior:

- Clicking YouTube from the home page opens a browser tab after Home.
- Opening a specific YouTube video keeps YouTube's own watch-page layout inside the webview, including YouTube's native right-side recommendation column.
- VidBrowser adds its own media sniffer panel outside the webview on the far right. That panel does not replace YouTube's recommendation column.
- The panel's recommended resource is the actual video item, with thumbnail/title and selectable variants such as resolution/codec rows.
- Raw network resources can exist, but they should not dominate the recommended tab when a real video candidate is available.

VidoGo target:

- Preserve the webview's full-height YouTube page.
- Keep the app-side sniffer panel fixed to the right of the webview.
- Enrich YouTube watch pages with a normalized video candidate from the embedded player when possible, with cookie-aware `yt-dlp` metadata fallback.
- Render variant rows and split download controls in the same visual hierarchy as VidBrowser.
- Preserve each variant's validated `formatId` and merge container through the download worker.
- Cover download, split expansion, refresh, clear, close, tab switching, panel reopen, title/thumbnail metadata, and full-height layout in smoke tests. Assert that removed copy-link controls do not return.

Current status: implemented and verified against the public `Me at the zoo` watch page. When YouTube hides exact player formats, VidoGo exposes bounded `≤resolution` fallbacks rather than presenting guessed exact codecs.

## Button and Icon Contract

The parsed renderer uses Element Plus icon geometry. VidoGo mirrors those SVG paths in `src/renderer/icons.js`; page controls must not fall back to Unicode symbols or unrelated platform glyphs.

| Surface | VidBrowser control contract | VidoGo behavior |
| --- | --- | --- |
| Primary sidebar | monitor, download, clock, star, shopping cart, user, setting | Exact icons and section navigation |
| Tab strip | Home uses house; new tab uses plus; browser tabs use close | Exact icons; no fake circular tab favicon |
| Browser navigation | arrow-left, arrow-right, refresh; refresh becomes close/stop while loading | Exact icons and matching reload/stop behavior |
| Address bar | search prefix and Visit suffix | Enter and Visit navigate the active tab |
| Browser extras | star opens a 320 px favorites popover; scale-to-original toggles media panel | No unrelated pin/add-download toolbar button |
| Media header | refresh, delete, close | Reload page, clear active-tab candidates, close panel |
| Media rows | video-play/headset/document, download, arrow-up/down, lock | Resource kind, download and variants use the reference icons; no copy-link button |
| Downloads | timer filter, delete clear; view/folder-opened/delete/refresh row actions | Exact action meanings and icons; pagination uses arrow-left/right |
| History | timer filter, delete clear; each row opens the page | No non-reference per-row delete button |
| Favorites page | star header; each row opens or deletes | No non-reference “add current page” header action |
| Settings sidebar | brush, download, setting, info-filled | Four active panels: Interface, Downloads, Preferences, About |
| Plans | shopping-cart/lock purchase actions; circle-check/circle-close entitlement cells | No Unicode checkmarks or dash substitutes for boolean entitlements |
| Account | user-filled header, lock auth card, refresh only when signed in, lock/switch-button profile actions | Signed-out view has no order-management or refresh controls; orders have no non-reference delete action |

The Windows title bar uses Electron's native `titleBarOverlay`, as VidBrowser does. Custom HTML minimize/maximize/close glyphs are not part of the renderer contract.

## Settings

VidBrowser uses a 208 px secondary sidebar rather than one long settings page:

- Interface: language select, theme select, ad-block switch.
- Downloads: download directory with folder/reset icon actions, and concurrency input.
- Preferences: default search engine select.
- About: update check plus current/latest version rows.

Only the active subsection is visible. Secondary navigation and every control are exercised by the Electron renderer smoke test.

## Downloads

Current target:

- Match VidBrowser download list page behavior before adding new unrelated features.
- Keep URL import, output directory, quality, playlist, audio-only, start/cancel, status filters, date filters, pagination, retry, remove, open file/folder, and clear-finished interactions covered by tests.
- Empty downloads should show the VidBrowser-style empty state and should not render a table header.
- Table headers should render only when rows exist.
- Missing completed files should show a missing-file state and should not offer an open-file action.
- The 1–10 concurrent-download setting now drives an actual main-process job queue with per-job progress routing and cancel-all semantics. The renderer and main process both clamp it to the active plan: Free 1, Pro 5, Ultimate/Lifetime 10.
- Downloads and recordings share the extracted daily allowance and persistent UTC-day usage counter: Free 5, Pro 30, Ultimate/Lifetime unlimited. Recording sessions also enforce the matching 5-minute, 30-minute, or unlimited single-session duration.
- Registration returns to sign-in, unknown users are not silently created by login, and creating a payment order no longer activates a plan. The non-reference local “continue payment” action was removed; a paid plan must come from confirmed account state once a real VidoGo account/payment service is connected.
- Settings/About no longer reports “latest” unconditionally. It checks `Imoot-TT/VidoGo` GitHub Releases, performs semantic-version comparison, presents the newest version, and changes the action to the validated HTTPS release page only when an update exists. Missing public releases, API limits, malformed responses, timeouts, and offline failures have distinct states.

## Web Video Recording

- Hovering a clear HTML video shows the reference 40 px pill toolbar with Record/Stop, duration, 1x/2x/4x playback rates, and Record All.
- Recording uses `captureStream()` and `MediaRecorder`, writes chunks incrementally to a `.part` file, then atomically promotes the completed WebM into the configured output directory.
- The unified concurrency limit covers downloads and recordings. Recording rows share the Downloads list, progress badge, open-file, and open-folder behavior.
- Video tracks use the `detail` content hint and source-resolution bitrate scaling: at least 12 Mbps, approximately 55 Mbps for 1440p/30, and up to 160 Mbps for high-frame-rate 4K.
- Bundled FFmpeg performs a lossless WebM remux so completed files contain stable duration/seeking metadata.
- Before capture, VidoGo requests the highest quality exposed by the page player and waits for the video element to decode at that target height. If a supported player fails to reach the requested quality, recording stops with an explicit error instead of silently saving the lowest rendition.
- Confirmed DRM media is rejected explicitly. Full protected-media capture requires the custom Electron/WebFrame recorder used by VidBrowser and is not claimed by the stock-Electron implementation.

## Window Geometry

- The initial window matches the parsed VidBrowser main process: `1360 x 860`, with minimum size `980 x 680`.

## Future Separate Projects

Do not put these into the Electron desktop app:

- Web management platform for login users and recharge/payment data.
- Promotional website similar to `https://www.vidbrowser.net/`.

Those should be separate web apps that can later be deployed to a server.

When future work starts, create those as separate web projects/repositories or separate top-level app directories, not as Electron pages inside VidoGo.
