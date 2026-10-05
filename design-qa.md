# Design QA

## Download task states

- Reference: `C:\Users\one_pc\AppData\Local\Temp\codex-clipboard-2a39ce41-7ce7-454c-afd7-d23fe4073d7c.png`
- Verified build: `C:\Users\one_pc\AppData\Local\Temp\vidogo-smoke-home.png`
- Viewport: 1360 × 860
- Result: newly mounted batch rows use the neutral `正在解析` state; progress, downloaded bytes, and file size remain visually blank until values exist. Completed, downloading, resolving, and failed rows remain aligned to the same grid.

## Time filter

- Reference: `C:\Users\one_pc\AppData\Local\Temp\codex-clipboard-f4d729c4-368a-476e-aeec-8ab75d061a49.png`
- Verified build: `C:\Users\one_pc\AppData\Local\Temp\vidogo-smoke-home.png`
- Result: the select has one fixed right-side chevron, no repeated background pattern, and consistent spacing from the label.

## Interaction checks

- Direct-download files are verified on disk before a row becomes completed.
- Pause interrupts an active response stream; resume reuses the same row and completes through the direct-media channel.
- Raw downloader and network errors are converted to concise localized messages.
- AGE current-video and batch actions mount their rows before resolution, then resolve only when a queue slot is available.
- Real AGE playback-page verification (`/play/20260178/1/1`) received 992 KB through the retained player context and paused in place without `ERR_BLOCKED_BY_CLIENT`.
- Browser-owned download redirects are accepted for the retained player source, while transient `DownloadItem` interruptions retry up to three times and then terminate instead of hanging forever.

## Media project drawer — 2026-09-14

- Source visual truth: `C:\Users\one_pc\AppData\Local\Temp\codex-clipboard-b94bbec3-d155-49a6-80f4-9597dc818fca.png` plus the requested one-third width reduction, simplified metadata, hover marquee, and project tags; follow-up issue evidence: `C:\Users\one_pc\AppData\Local\Temp\codex-clipboard-1eb2ab0f-32cb-475e-9505-1a6c8e746dde.png`.
- Browser-rendered implementation: `C:\Users\one_pc\AppData\Local\Temp\vidogo-smoke-home.png`.
- Focused comparison: `C:\Users\one_pc\AppData\Local\Temp\vidogo-library-tags-comparison-20260914.png`.
- Viewport: 1360 × 860 CSS px, device scale factor 1. The implementation drawer is 468 × 860 px; the original drawer reference is 699 × 818 px; the focused feedback reference is 460 × 101 px and the post-fix header crop is 468 × 183 px. No density normalization was required.
- State: dark theme, Simplified Chinese, media-project drawer open, long title, nine project tags, four grouped assets.
- Full-view evidence: the drawer occupies 468 px (about two-thirds of the previous 700 px maximum), preserves the original right-edge anchoring and dark tokens, and leaves the underlying library visible.
- Focused evidence: tags wrap into two complete rows and the add field follows the final chip; no horizontal clipping or hidden overflow remains. Source/provider hierarchy, cover crop, close action, and title baseline remain aligned with the supplied header.
- Typography: existing family and weights are preserved; source copy is raised from 9 px to 11 px; the 14 px title retains a single line and moves immediately on hover when overflow exists.
- Spacing and layout: header gaps remain compact, tag wrapping increases header height only when necessary, metadata is one two-column row, and asset rows retain their original rhythm.
- Colors and tokens: all surfaces use the existing `--app-*` palette; tag color uses the established accent token with sufficient contrast in dark mode.
- Image quality: the existing project cover preview path and `object-fit: cover` behavior are unchanged; no placeholder or code-drawn replacement was introduced by this change.
- Copy and content: provider appears once in the header; the metadata table contains only download time and size; tag add/remove labels are localized in Simplified Chinese, Traditional Chinese, and English with English fallback for other locales.
- Primary interactions tested: drawer open/close, wheel containment, project actions, tag add, tag remove, deterministic before/after reorder calculation, rapid-save stale-response protection, and tag persistence normalization. The full automated smoke suite reported no console/self-test failures.

### Comparison history

- Iteration 1 — P1: the first tag treatment used a single horizontally clipped row, causing later tags and the add field to disappear. P2: the title marquee reserved roughly the first 12% of its loop as a pause.
- Fixes: tags now participate in one wrapping flex flow, the add field follows the last chip, the supported project tag count is raised to 50, drag targets show a precise insertion bar, RTL before/after math is corrected, and the marquee runs from `from` to `to` with no delay or held keyframe.
- Post-fix evidence: `C:\Users\one_pc\AppData\Local\Temp\vidogo-library-tags-comparison-20260914.png` shows nine complete tags over two rows with the add field visible; automated checks pass for add/remove/reorder/persistence and the immediate marquee rule.

### Findings

- No actionable P0/P1/P2 visual or interaction differences remain for the requested drawer scope.

### Follow-up polish

- P3: a future tag-management screen may add bulk rename, color groups, or keyboard-only reordering when the wider tagging workflow is designed.

final result: passed

## All-assets project tags and type badge — 2026-09-14

- Source visual truth: `C:\Users\one_pc\AppData\Local\Temp\codex-clipboard-2014bf77-30b8-4953-b268-24018622fd2b.png`; focused original type-badge evidence: `C:\Users\one_pc\AppData\Local\Temp\codex-clipboard-f38d02e3-43a8-4603-9af2-f1a341d16f3e.png`.
- Electron-rendered implementation: `C:\Users\one_pc\AppData\Local\Temp\vidogo-smoke-home.png`.
- Full-view comparison: `C:\Users\one_pc\AppData\Local\Temp\vidogo-library-assets-final-comparison-20260914.png`.
- Tagged/empty-state comparison: `C:\Users\one_pc\AppData\Local\Temp\vidogo-library-assets-tagged-empty-focused-20260914.png`.
- Type-badge comparison: `C:\Users\one_pc\AppData\Local\Temp\vidogo-library-asset-type-badge-comparison-20260914.png`.
- Viewport: 1360 × 860 CSS px, device scale factor 1, dark theme, Simplified Chinese, all-assets grid.
- Tag ownership and editing: tags are explicitly labeled `项目标签` on tagged assets and remain backed by the owning media project. Every asset card exposes `改标签`; it opens that project's drawer and immediately focuses the tag input, where the existing add, remove, and drag-reorder behavior remains available.
- Empty state and alignment: assets whose owning project has no tags render a visually empty 20 px tag slot—no dash, label, or placeholder—so their footer divider, size, and action buttons stay aligned with tagged cards.
- Asset type: video, MP3, image, subtitle, and shared-cover badges use a separate purple treatment at the cover's exact bottom-right origin. Their `5px 0 0 0` radius preserves only the exposed inner corner while the card clips the outer corner consistently; RTL mirrors the treatment.
- Distinction: green top-left badges identify the project's source platform in media-project cards; purple bottom-right badges identify an individual asset's file type in all-assets cards. Project tag chips retain the established blue accent, making the three concepts visually separable.
- Search: all-assets and media-project search index both plain project-tag text and hashtag-form queries, and the placeholder names `项目标签` explicitly.
- Automated verification: `npm run check` passed. The Electron smoke suite completed with `selfTest.ok: true`, zero failures, and exercised the asset-card tag-editor entry, input focus, tag searches, filters, previews, editor import, and reveal actions.

### Comparison history

- Iteration 1 — P2: untagged assets displayed `项目标签 —`, which read as missing data rather than a deliberately empty tag state. There was no direct path from an asset card to the project-level tag editor. The asset type appeared as a dark inset pill and competed with other card metadata.
- Fixes: the placeholder and its label are omitted for untagged cards while the row height remains reserved; a compact `改标签` action opens and focuses the owning project's editor; type badges move flush to the cover's bottom-right corner and use a distinct purple background.
- Post-fix evidence: the focused tagged/empty comparison shows equal footer alignment with a genuinely blank untagged row, and the badge comparison shows the former inset image badge beside the final corner-locked purple image badge.

### Findings

- No actionable P0/P1/P2 visual or interaction differences remain for this scope.

final result: passed

## Media project grid cards — 2026-09-14

- Source visual truth: `C:\Users\one_pc\AppData\Local\Temp\codex-clipboard-82173a26-d71e-45ce-aa35-ae95f884ce30.png` plus the requested smaller cover, single-line ellipsized title, and project tags; alignment correction evidence: `C:\Users\one_pc\AppData\Local\Temp\codex-clipboard-019d7b23-6d1f-4ca0-bc26-166a070e2c27.png`; latest full-bleed card and corner-badge references: `C:\Users\one_pc\AppData\Local\Temp\codex-clipboard-539561c9-1680-4eb5-b04a-edf31d105ad3.png`, `C:\Users\one_pc\AppData\Local\Temp\codex-clipboard-d0493c7b-cbe3-409b-909b-a06b8e746277.png`, and `C:\Users\one_pc\AppData\Local\Temp\codex-clipboard-dc34e918-6310-49e2-bcd0-d08aa75259a7.png`.
- Browser-rendered implementation: `C:\Users\one_pc\AppData\Local\Temp\vidogo-smoke-home.png`.
- Full-view comparison: `C:\Users\one_pc\AppData\Local\Temp\vidogo-library-project-fullbleed-comparison-20260914.png`.
- Focused card comparison: `C:\Users\one_pc\AppData\Local\Temp\vidogo-library-project-fullbleed-focused-20260914.png`.
- Focused provider-badge comparison: `C:\Users\one_pc\AppData\Local\Temp\vidogo-library-provider-badge-comparison-20260914.png`.
- Viewport and normalization: full source and implementation are both 1360 × 860 pixels at 1360 × 860 CSS px with device scale factor 1; no density normalization was needed. The focused comparison places one supplied all-assets card treatment beside one implementation project card.
- State: dark theme, Simplified Chinese, media-project tab, six-column grid; the first fixture project has eight deliberately long tags.
- Full-view evidence: the media-project grid now uses six approximately 200 px tracks while the all-assets grid remains on its existing 220 px minimum. Project covers meet the top and side borders, metadata places time after size, and the footer retains only asset-type counts.
- Focused evidence: the cover uses a natural `16 / 9` thumbnail ratio at 100% card width with zero button padding. Its explicit 5 px top corner radii and the card's overflow clipping reproduce the all-assets full-bleed treatment without square corners. The source badge now shares the cover's top-left origin and uses a distinct deep-green surface with a 5 px outer corner and 5 px lower-right corner.
- Fonts and typography: the established 12 px/750 title remains unchanged in family, size, weight, and line height; only wrapping changes from two lines to one. Card tags use the same application stack at 8 px.
- Spacing and layout rhythm: every card reserves the same 20 px tag slot. Projects without tags leave that slot visually empty, preventing the footer from moving upward relative to tagged cards. The narrower project-only tracks increase density without altering all-assets cards.
- Colors and tokens: tag chips reuse `--app-accent`, `--app-border`, and `--app-panel`; all existing card surfaces and semantic asset colors are preserved.
- Image quality: production cover paths, image sharpness, badges, and `object-fit: cover` behavior are unchanged. The 16:9 frame avoids the visibly flattened crop, now fills the project card edge to edge, and keeps the rounded top silhouette. The Electron visual fixture uses its existing generated preview image.
- Copy and content: titles, platform labels, asset summaries, sizes, dates, and tags remain data-driven. The download time now follows the asset count and total size on the metadata row; overflow is represented by `+N` after measuring real chip width. The search placeholder explicitly includes tags.
- Primary interactions tested: grid/list switching, card opening, tag add/remove persistence, adaptive tag layout, project import, filters, drawer interactions, and existing asset actions. Searches for `#旅行` in all assets and `#火车` in media projects both matched the tagged project; plain tag text uses the same index. `npm run check` and the Electron smoke run passed with zero self-test failures or console errors.

### Comparison history

- Iteration 1 — P2: tags were inserted only for tagged projects, so their footer moved downward while untagged-card icons stayed higher. The cover height was reduced but its width still filled nearly the entire card.
- Iteration 2 — P2: reducing the cover to `16 / 5.4` fixed card density but produced an unnaturally flat thumbnail. Project search included raw tag text, while all-assets search omitted the owning project's tags and hashtag-form queries were not explicitly indexed.
- Iteration 3 — P2: the natural 16:9 cover still used 20 px side margins, so it did not match the all-assets cards' full-bleed visual treatment. The project button's native padding also prevented a nominal 100% cover from actually touching the card edge, and its top-corner treatment was not explicit.
- Iteration 4 — P2: the source label still floated 9 px inward as a dark translucent pill, rather than owning the cover's top-left corner, and therefore did not read as part of the new full-bleed card silhouette.
- Fixes: all cards reserve one 20 px tag slot; project cards use their own narrower grid, zero button padding, and a 100%-width 16:9 cover with explicit rounded top corners. Time moved beside the asset count and size. The provider badge now uses `top: 0`, `left: 0`, a deep-green background, and corner-specific radii; RTL placement mirrors it. A shared tag-term helper indexes both `标签` and `#标签` in media-project and all-assets searches.
- Post-fix evidence: `C:\Users\one_pc\AppData\Local\Temp\vidogo-library-project-fullbleed-focused-20260914.png` shows the supplied all-assets full-bleed treatment beside the final project card, while `C:\Users\one_pc\AppData\Local\Temp\vidogo-library-provider-badge-comparison-20260914.png` shows the old inset badge beside the final corner-locked blue badge. The Electron self-test verifies badge/cover origin alignment, sub-220 px project cards, equal cover/client widths, metadata placement, successful tag searches, and zero failures.

### Findings

- No actionable P0/P1/P2 visual or interaction differences remain for the requested grid-card scope.

final result: passed

## Media project list title and tags — 2026-09-14

- Source visual truth: `C:\Users\one_pc\AppData\Local\Temp\codex-clipboard-ca4ab70b-001c-4c7e-9a02-6d081e884e2d.png`, the divider detail in `C:\Users\one_pc\AppData\Local\Temp\codex-clipboard-267daef6-f464-4bb4-b6f0-3e25e5b4e17b.png`, and the long-tag fit feedback in `C:\Users\one_pc\AppData\Local\Temp\codex-clipboard-015edf5a-4aa4-497a-88ff-79d18e409b27.png`.
- Browser-rendered implementation: `C:\Users\one_pc\AppData\Local\Temp\vidogo-smoke-home.png`.
- Full-view comparison: `C:\Users\one_pc\AppData\Local\Temp\vidogo-library-list-comparison-20260914.png`.
- Focused row comparison: `C:\Users\one_pc\AppData\Local\Temp\vidogo-library-list-focused-comparison-20260914.png`.
- Viewport and normalization: source and implementation are both 1360 × 860 pixels at 1360 × 860 CSS px with device scale factor 1; no density normalization was needed. The focused comparison uses matching 1100 × 64 px row crops.
- State: dark theme, Simplified Chinese, media-project tab, list view, first project containing eight deliberately long tags and four asset types.
- Full-view evidence: row height, cover size, outer card border, provider, aggregate size, and right-edge import action retain the existing list rhythm; the title no longer consumes the flexible majority of the row.
- Focused evidence: the title is constrained to 190 px, tag chips begin directly after it, five complete long tags plus an accurate `+3` overflow count fit before the provider column, and the old count-area divider is absent.
- Fonts and typography: the existing 11 px title hierarchy is preserved; compact tags use 9 px semibold text and the same application font stack.
- Spacing and layout rhythm: title and tags share one flexible row cell with an 8 px gap; tags use 5 px internal spacing and do not alter the 62 px project-row height.
- Colors and tokens: tag chips reuse `--app-accent`, `--app-border`, and `--app-panel`; existing provider, asset-type, size, and card tokens are unchanged.
- Image quality: production cover rendering and `object-fit: cover` are untouched; the smoke fixture continues to use its generated preview placeholder.
- Copy and content: project titles, provider labels, sizes, and tags come from the existing library model. The renderer measures every chip and the available row width, shows the maximum number of whole tags that fit, and represents the remainder with `+N`.
- Primary interactions tested: list/grid switching, project-row open, project import, project tag rendering after add/remove, filters, and all existing media-library smoke interactions. The Electron run reported `selfTest.ok: true`, zero failures, and no console errors.

### Comparison history

- Iteration 1 — P2: the 260 px title and fixed four-tag limit left visible unused space before the provider column.
- Iteration 2 — P2: shortening the title and raising the fixed limit displayed more short tags, but long labels could still be clipped and collide visually with the provider column.
- Fixes: the fixed tag-count rule was removed. The list now measures actual chip widths, gap, overflow-marker width, and container width; it recalculates on resize, on the next animation frame, and after fonts settle.
- Post-fix evidence: `C:\Users\one_pc\AppData\Local\Temp\vidogo-library-list-focused-comparison-20260914.png` shows only complete long-label chips, an accurate `+3` marker, and a clear gap before the YouTube column.

### Findings

- No actionable P0/P1/P2 visual or interaction differences remain for the requested list-row change.

final result: passed

## Media project drawer selected layout — 2026-09-14

- Source visual truth: `C:\Users\one_pc\.codex\generated_images\01a09dd9-e52e-7e72-9108-a55a9e675229\exec-cdb9c3f4-5b61-4c58-9cf0-4f908b45781f.png`, the user-approved second layout with the standalone tag heading removed and download metadata reduced to a quiet inline summary.
- Browser-rendered implementation: `C:\Users\one_pc\AppData\Local\Temp\vidogo-smoke-home.png`.
- Same-size comparison: `C:\Users\one_pc\AppData\Local\Temp\vidogo-library-redesign-comparison-20260914.png`; the reference was normalized to 468 × 830 CSS px and compared beside the 468 × 830 drawer crop.
- Viewport: 1360 × 860 CSS px, device scale factor 1; drawer width 468 px.
- Header hierarchy: the cover is 140 × 88 px, source and title remain adjacent to it, source/folder actions sit directly under the title, and the close action stays pinned to the top-right edge.
- Tags and metadata: no visible “标签” heading is rendered; chips wrap with the add field in the same flow, and download time plus aggregate size appear as one muted sentence below the chips.
- Asset hierarchy: all type sections share one bordered surface with dividers, while preview/import/reveal remain visually separate compact buttons as in the approved layout.
- Interaction state: the long title stays single-line and begins its leftward marquee immediately on hover; nine-tag wrapping, add/remove/reorder, source/folder actions, drawer containment, and all asset actions were exercised by the Electron smoke run.
- Automated verification: `npm run check` passed, and `npm run smoke` completed with `selfTest.ok: true`, zero failures, and no console errors.

### Comparison history

- Iteration 1: the implemented cover was visibly smaller than the approved visual and the asset actions had been merged into a segmented toolbar.
- Fixes: the cover was increased from 120 × 76 px to 140 × 88 px, and the three asset actions were restored to independent buttons with 7 px spacing.
- Post-fix evidence: the final same-size comparison shows matching cover prominence, compact header controls, wrapping tag behavior, understated metadata, continuous asset grouping, and separate action affordances.

### Findings

- No actionable P0/P1/P2 visual or interaction differences remain for the selected drawer layout. The smoke fixture uses a generated cover placeholder and additional tags/assets to stress the layout; production still renders the real downloaded cover through the existing preview path.

final result: passed

## All-assets type badge top-right placement — 2026-09-14

- Source visual truth: `C:\Users\one_pc\AppData\Local\Temp\codex-clipboard-461e0136-5202-4c5b-89f6-61ea8ed75dc0.png`, with the user-directed change from the shown bottom-right position to the top-right cover corner.
- Electron-rendered implementation: `C:\Users\one_pc\AppData\Local\Temp\vidogo-smoke-home.png`.
- Focused side-by-side comparison: `C:\Users\one_pc\AppData\Local\Temp\vidogo-library-type-badge-top-right-comparison-20260914.png`.
- Viewport and normalization: 1360 × 860 CSS px at device scale factor 1. The implementation card crop was normalized to the 207 × 231 px source-card capture for direct comparison.
- State: dark theme, Simplified Chinese, all-assets grid, video/MP3/image/subtitle type badges visible.
- Fonts and typography: type-badge font size, weight, padding, and white foreground remain unchanged.
- Spacing and layout rhythm: the badge now shares the cover's exact top and right origins. Its `0 5px 0 5px` radius follows the card's outer top-right corner and rounds the exposed lower-left corner; RTL mirrors it to top-left.
- Colors and tokens: the distinct purple asset-type color is preserved, so the positional change does not blur its meaning with green source badges or blue project-tag chips.
- Image quality: cover crop, aspect ratio, sharpness, and clipping remain unchanged; the badge no longer covers the lower edge of the thumbnail.
- Copy and content: asset-type labels and their localized values are unchanged.
- Primary interactions tested: all-assets rendering, grid/list switching, type filtering, tag editing, preview, editor import, and reveal. `npm run check` passed; Electron smoke completed with `selfTest.ok: true`, zero failures, and an explicit top/right origin assertion.

### Comparison history

- Iteration 1 — P2: the purple type badge was locked to the cover's bottom-right corner, matching the prior request but not the revised preferred placement.
- Fix: moved the badge to `top: 0; right: 0`, updated its corner-specific radius and RTL mirror, then added a rendered geometry assertion.
- Post-fix evidence: the focused comparison shows the supplied bottom-right state beside the final top-right placement at matching card size.

### Findings

- No actionable P0/P1/P2 visual or interaction differences remain for the requested badge placement.

final result: passed
