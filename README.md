# LiveArt — Image Editor

Browser-based non-destructive image editor for print preparation. The original image is never touched: edits are kept as a small set of typed operations, and every preview is derived from the original on the fly.

**[→ Live Demo](https://liveart-image-editor.vercel.app/)**

---

## Getting started

```bash
npm i && npm run dev
```

```bash
npm test
npm run build
```

---

## Stack

![Vue 3](https://img.shields.io/badge/Vue_3-35495E?style=for-the-badge&logo=vue.js&logoColor=4FC08D)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vuetify 3](https://img.shields.io/badge/Vuetify_3-1867C0?style=for-the-badge&logo=vuetify&logoColor=white)
![Pinia](https://img.shields.io/badge/Pinia-35495E?style=for-the-badge&logo=vue.js&logoColor=FFD859)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![SCSS](https://img.shields.io/badge/SCSS-CC6699?style=for-the-badge&logo=sass&logoColor=white)
![Canvas API](https://img.shields.io/badge/Canvas_2D_API-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![cropperjs](https://img.shields.io/badge/cropperjs-0D1117?style=for-the-badge&logo=npm&logoColor=white)
![jsPDF](https://img.shields.io/badge/jsPDF-CB0000?style=for-the-badge&logo=adobeacrobatreader&logoColor=white)
![vue-i18n](https://img.shields.io/badge/vue--i18n-35495E?style=for-the-badge&logo=vue.js&logoColor=4FC08D)
![Vitest](https://img.shields.io/badge/Vitest-6E9F18?style=for-the-badge&logo=vitest&logoColor=white)
![ESLint](https://img.shields.io/badge/ESLint-4B32C3?style=for-the-badge&logo=eslint&logoColor=white)

---

## Requirements

- [x] Load an image via file upload — file picker or drag-and-drop, with format/size validation (JPEG, PNG, WebP, GIF; up to 25 MB) and corrupt-file detection at decode time
- [x] Crop uploaded image — cropperjs with aspect presets (Free, 1:1, 4:3, 16:9, A4, A3), Escape to cancel
- [x] Adjust it with live sliders with a real-time preview
  - [x] brightness
  - [x] contrast
  - [x] saturation
- [x] Reset / view original — hold-to-compare button (mouse, touch, keyboard); reset with confirmation and an Undo in the toast. Non-destructive throughout: the original is kept intact and the preview is derived from state
- [x] Export the result by downloading it — PNG, JPEG, WebP or PDF

## ★ Bonus

- [x] Add at least one filter — greyscale, sepia, invert, warm and cool
- [x] Export the operations as JSON alongside the image — versioned operations file; replaying it on the original reproduces the result (the shape is described below)

## Beyond the task

- [x] Import of a saved operations JSON — a recorded edit can be replayed on another image
- [x] Undo history (up to 20 steps) for crop, adjustments and filters, including keyboard slider input
- [x] Print panel — effective DPI at A4/A3/A2 for the current crop, with print-ready / acceptable / low markers
- [x] Dark and light themes, both persisted and applied before first paint
- [x] English and Ukrainian locales
- [x] Resizable and collapsible sidebar
- [x] Accessibility pass — ARIA labels on sliders and icon buttons, focus handling in dialogs, keyboard support for compare/crop/upload, `inert` on panels while nothing is loaded

---

## Key decisions

### Operation model

All editing state lives in one Pinia store and is projected into a typed operation array — a versioned payload with an `operations` list where each entry is discriminated by `kind`: `crop`, `adjust` or `filter`.

Crop is stored as fractions of the original dimensions (0–1 range) rather than pixels, which makes the JSON resolution-independent: the same file replays correctly on any resolution of the same image — a realistic print-shop scenario where you edit a preview and apply to the high-res original. The crop op also carries the aspect preset id, so an imported file restores the panel selection (A3 stays A3, not a guess from the ratio — A4 and A3 share the same aspect). Adjustments use a −100…+100 scale with 0 as neutral; the CSS multiplier is simply `1 + value / 100`. Imported JSON goes through type-predicate validation, so a malformed file is rejected with a toast instead of half-applying.

### Single render path

Adjustments and filters don't rely on the browser's filter API. Brightness and contrast fold into a 256-entry tone curve, saturation and the active filter into a single colour matrix; preview and export run the same pixel pipeline with the same numbers, so the downloaded file matches the screen in every browser. Holding "compare" only affects the preview — an export at that moment still renders the full pipeline.

### Undo as snapshots

Undo is a bounded stack of state snapshots taken before each change, not a command pattern with inverse operations. The editing state here is flat and tiny, so a copy is cheaper and can't get out of sync. Consecutive duplicate snapshots are dropped so undo never turns into a "click that does nothing".

### Vuetify scope

Vuetify provides the app shell and the sliders; everything else is custom SCSS on top of a small token system (colors, spacing, typography) with the two themes. I use the library where it earns its place — sliders with proper keyboard and ARIA behavior out of the box — and keep full control over the rest of the visual layer.

---

## Architecture

The codebase is a single-page Vue 3 app with no router. Components are split into `common` (header, footer, toasts, confirm dialog) and `editor` (canvas, upload zone, and the sidebar panels for crop, adjustments and filters). Logic that isn't tied to a template lives in composables: canvas rendering, cropper lifecycle, export, toasts. Pure logic with no Vue dependency at all — file validation, DPI math, unit constants, the tone/colour-matrix engine — sits in `utils`. Locales and the i18n/theme plugins have their own folders, and all operation types are declared in one place, `types/editor.ts`.

The store is the single source of truth: the loaded file, crop, adjustments, active filter and undo history. Everything derived — the operation pipeline, the tone curve and colour matrix, the print DPI table — is a computed projection of that state, so no component ever recalculates or caches these on its own.

Rendering is one-directional: any state change invalidates the preview, and the canvas redraws from the original image. Slider input is coalesced through `requestAnimationFrame`, so however many events arrive per frame, there is exactly one draw. The canvas backs its bitmap at `devicePixelRatio` to stay sharp on HiDPI screens, and letterboxing keeps any aspect ratio centred in the viewport.

Crop mode is the only place with an imperative dependency: cropperjs is created when the mode opens and destroyed on exit. The sidebar panel doesn't know the library exists — it talks to a narrow `CropApi` (apply / cancel / set aspect) that the canvas component registers while the cropper is alive.

---

## Testing

Unit tests (Vitest + happy-dom) cover the store — pipeline composition, undo history including deduplication, import/reset, file lifecycle — the tone-curve and colour-matrix math against known pixel values, plus the print DPI math and upload validation.
