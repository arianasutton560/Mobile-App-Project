# PantryPal Reliability and Device Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a persistent pantry to PantryPal, let people scan a product barcode to add pantry items, and demonstrate reliable, accessible behavior when storage, hardware, and the network fail.

**Architecture:** Keep bundled recipes as the offline catalog. Add a small domain layer for pantry records and favorite IDs, a versioned AsyncStorage repository, and a barcode lookup client for Open Food Facts that requests only `product_name`. App-level state loads once and is passed to focused Pantry and scanner screens; the scanner owns the cancellable lookup state and returns a normalized draft item for the pantry editor to save.

**Tech Stack:** Expo 57, React Native 0.86, React Navigation 7, `@react-native-async-storage/async-storage`, `expo-camera`, fetch, Jest, and React Native Testing Library.

**Spec:** `plans/plans.md` (this plan implements the rubric supplied with the project).

## Global Constraints

- Preserve the existing offline `data/recipes.json` catalog and its category/search/favorite flows.
- Store only pantry item details and favorite recipe IDs locally; do not collect accounts, location, contacts, photos, or full camera images.
- Request camera permission only after the person selects **Scan barcode**, and give a typed-entry alternative when permission is denied or hardware is unavailable.
- Treat every storage value and network response as untrusted; validate before displaying or persisting it.
- The three `bugs.md` entries must describe genuine observed issues, include reproducible evidence and a verified fix, and their fix commits must span at least two calendar weeks. Do not backdate entries or fabricate evidence.
- Add only the two production dependencies above; pin versions compatible with Expo SDK 57 using `npx expo install`.
- Test the barcode scan on a physical phone and record its model, OS, Expo Go/development-build version, date, and result in `docs/verification.md`.

## Review Focus

- A malformed or old persisted JSON value must reset to an empty, usable state instead of crashing; test this in Task 2.
- A barcode response without a non-empty product name must enter the editable fallback state, never create an unnamed item; test this in Task 5.
- A request that resolves after Cancel must not change screens or add an item; test this in Task 5.
- Duplicate scanned or typed names must remain separate items because quantity and unit can differ; test this in Task 3.
- Large text, screen readers, and reduced-motion settings must leave every essential action reachable and announced; test this in Task 8.

---

## Planned File Structure

- `data/pantry.js` — pure normalization, validation, CRUD, and recipe-ingredient matching functions.
- `data/storage.js` — versioned AsyncStorage reads/writes behind an injectable storage interface.
- `services/product-lookup.js` — abortable Open Food Facts request and response normalization.
- `hooks/usePantry.js` — app-facing load/save state and pantry/favorite commands.
- `screens/Pantry.js` — empty, restored, add, edit, and remove pantry UI.
- `screens/BarcodeScanner.js` — permission, scanning, lookup, retry, cancel, and typed-entry UI.
- `components/PantryItemForm.js` and `components/AsyncState.js` — accessible reusable form and waiting/error states.
- `tests/*.test.js` — deterministic unit and component tests with mocked storage, camera, and fetch.
- `docs/verification.md`, `bugs.md`, `changelog.md`, and `package.json` — evidence, test commands, audit records, and dependency rationale.

## Spike Outcome: Open Food Facts Product Lookup

On 2026-09-21, a read-only request to `https://world.openfoodfacts.org/api/v2/product/737628064502.json` returned HTTP 200. Its JSON contained `status: 1`, a `product` object, and a string `product.product_name` (`Thai peanut noodle kit includes stir-fry rice noodles & thai peanut seasoning`). The unfiltered response was 36,607 bytes.

**Plan adjustment:** `lookupProduct` must validate both HTTP success and API `status === 1`, accept only a non-empty string `product.product_name`, and use `?fields=product_name` to avoid transferring the large unneeded product payload. HTTP 200 alone is not a successful lookup.

### Task 1: Establish the test harness and audit baseline

**Files:**

- Modify: `package.json`
- Modify: `tests/app-entry.test.js`
- Create: `tests/test-utils.js`
- Create: `docs/verification.md`
- Modify: `changelog.md`

**Interfaces:** Produces `npm test`, `npm run test:watch`, and a `renderWithNavigation(ui)` helper used by screen tests.

- [ ] **Step 1: Add the test and documentation dependencies.** Install `jest`, `jest-expo`, `@testing-library/react-native`, and `@testing-library/jest-native` as development dependencies. Replace the current file-existence-only test command with `jest --runInBand`, retain the existing two assertions in a Jest test file, and add `test:watch` as `jest --watch`.
- [ ] **Step 2: Prove the harness fails before configuration.** Run `npm test`; expect the new Jest-based command to fail until Jest configuration and setup are added.
- [ ] **Step 3: Add minimal Jest configuration and a deterministic navigation helper.** Configure `preset: 'jest-expo'`, a setup file importing `@testing-library/jest-native/extend-expect`, and mocks for native modules. `renderWithNavigation` must wrap input in `NavigationContainer`.
- [ ] **Step 4: Verify and document the baseline.** Run `npm test` and expect PASS. Create `docs/verification.md` with a dated “Baseline” row for this command and blank future *observed* device-result rows; add test tooling under `Unreleased / Added` in `changelog.md`.
- [ ] **Step 5: Commit.**

  ```bash
  git add package.json package-lock.json tests docs/verification.md changelog.md
  git commit -m "test: establish PantryPal test harness"
  ```

### Task 2: Model and persist favorites and pantry data

**Files:**

- Create: `data/pantry.js`
- Create: `data/storage.js`
- Create: `tests/pantry.test.js`
- Create: `tests/storage.test.js`
- Modify: `package.json`

**Interfaces:**

- Produces: `normalizePantryItem(input)`, `createPantryItem(input, now, id)`, `updatePantryItem(item, patch, now)`, `removePantryItem(items, id)`, `normalizePersistedState(value)`, `loadAppState(storage)`, and `saveAppState(storage, state)`.
- Persists: `{ version: 1, favoriteIds: string[], pantryItems: PantryItem[] }` at key `@pantrypal/app-state`.
- `PantryItem`: `{ id: string, name: string, quantity: number, unit: string, barcode?: string, createdAt: string, updatedAt: string }`.

- [ ] **Step 1: Write failing unit tests.** Cover trimmed valid input; rejected blank names and zero/negative/non-numeric quantities; update semantics; removal; valid restore; and missing key, invalid JSON, wrong version, or non-array data recovering to `{ favoriteIds: [], pantryItems: [] }`.
- [ ] **Step 2: Run `npm test -- pantry storage`.** Expect FAIL because the modules do not exist.
- [ ] **Step 3: Install and implement the boundary.** Run `npx expo install @react-native-async-storage/async-storage`. Implement pure validation in `data/pantry.js`; storage must parse in `try/catch`, discard invalid state, serialize only normalized data, and return `{ state, recoveredFromInvalidStorage }` from `loadAppState`.
- [ ] **Step 4: Run `npm test -- pantry storage`.** Expect PASS, including corruption and old-version recovery.
- [ ] **Step 5: Commit.**

  ```bash
  git add package.json package-lock.json data/pantry.js data/storage.js tests/pantry.test.js tests/storage.test.js
  git commit -m "feat: persist normalized pantry state"
  ```

### Task 3: Expose create, modify, remove, empty, and restored pantry states

**Files:**

- Create: `hooks/usePantry.js`
- Create: `components/PantryItemForm.js`
- Create: `screens/Pantry.js`
- Modify: `App.js`
- Modify: `screens/Home.js`
- Create: `tests/use-pantry.test.js`
- Create: `tests/pantry-screen.test.js`

**Interfaces:**

- Consumes: Task 2 repository functions.
- Produces: `usePantry()` state `{ status: 'loading'|'ready'|'storage-error', favoriteIds, pantryItems }` and commands `toggleFavorite(id)`, `addItem(draft)`, `editItem(id, patch)`, and `deleteItem(id)`.
- Navigation: a `Pantry` stack route and a Home header button labelled `Open pantry`.

- [ ] **Step 1: Write failing hook tests.** Mock storage and assert restore at launch; save after favorite/create/edit/delete; usable in-memory state after a rejected save; and separate items with duplicate names but differing quantities.
- [ ] **Step 2: Write failing screen tests.** Assert: “Your pantry is empty” plus `Add item`; newly created “Milk, 2 cups”; editing to “Milk, 3 cups”; confirmation and removal; and a restored row after remounting with saved state.
- [ ] **Step 3: Implement state and form.** Move favorite ownership from `App.js` into `usePantry`, add the route, and inject commands into Home/Favorites/Pantry. Use labelled inputs, numeric quantity keyboard, inline validation, and explicit accessibility labels for edit, delete, and submit.
- [ ] **Step 4: Run `npm test -- use-pantry pantry-screen`.** Expect PASS. In Expo, record empty, create, modify, remove-to-empty, force-close/relaunch, and restored-item outcomes in `docs/verification.md`.
- [ ] **Step 5: Commit.**

  ```bash
  git add App.js screens/Home.js screens/Favorites.js screens/Pantry.js hooks/usePantry.js components/PantryItemForm.js tests docs/verification.md
  git commit -m "feat: add persistent pantry management"
  ```

### Task 4: Make pantry ingredients useful in recipe discovery

**Files:**

- Modify: `data/pantry.js`
- Modify: `screens/WhatCanIMake.js`
- Modify: `App.js`
- Create: `tests/what-can-i-make.test.js`

**Interfaces:** Produces `findMakeableRecipes(recipes, pantryItems)`, returning recipes whose normalized ingredient names all occur in pantry item names; adds a `WhatCanIMake` route receiving `pantryItems`.

- [ ] **Step 1: Write failing tests.** Assert case/whitespace-insensitive matching, no results plus an explanatory empty state for an empty pantry, and exclusion when one ingredient is missing.
- [ ] **Step 2: Implement the smallest matching view.** Normalize strings using `trim().toLowerCase()`, render matching recipe cards, and offer `Open pantry` in the no-match state. Do not add fuzzy matching or remote recipe search.
- [ ] **Step 3: Run `npm test -- what-can-i-make` and commit.** Expect PASS.

  ```bash
  git add data/pantry.js screens/WhatCanIMake.js App.js tests/what-can-i-make.test.js
  git commit -m "feat: match recipes to pantry items"
  ```

### Task 5: Add physical barcode scanning and an abortable product lookup

**Files:**

- Create: `services/product-lookup.js`
- Create: `screens/BarcodeScanner.js`
- Modify: `screens/Pantry.js`
- Modify: `App.js`
- Modify: `app.json`
- Create: `tests/product-lookup.test.js`
- Create: `tests/barcode-scanner.test.js`

**Interfaces:**

- Produces: `lookupProduct(barcode, { fetchImpl, signal })` resolving to `{ name: string, barcode: string }` only when HTTP is successful, API `status === 1`, and `product.product_name` is non-empty; otherwise it rejects with `ProductLookupError` code `offline`, `not-found`, `malformed-response`, or `cancelled`.
- Navigation: `BarcodeScanner` returns `{ scannedDraft: { name, quantity: 1, unit: 'item', barcode } }` to Pantry, or returns nothing on abandonment.

- [ ] **Step 1: Write failing product-client tests.** Mock fetch for HTTP 200 with `status: 1` and a valid name; HTTP 404; HTTP 200 with `status: 0`; rejected request; invalid JSON; missing/blank product name; and `AbortError`. Assert the request uses `?fields=product_name` and no raw server body appears in errors.
- [ ] **Step 2: Write failing scanner-state tests.** Mock `expo-camera`; assert delayed permission request, denied-permission manual entry, `Looking up product…`, prefilled success confirmation, retry/manual fallback on failure, and Cancel preventing saves/navigation after resolution.
- [ ] **Step 3: Install and configure camera support.** Run `npx expo install expo-camera`. Add the iOS purpose string: “PantryPal uses the camera to scan a product barcode and fill in a pantry item.” Add an Android permission only if the installed Expo config plugin does not supply it; record the final behavior in the audit.
- [ ] **Step 4: Implement guarded scanning.** Use `CameraView` only while focused and permitted; ignore repeated detections while loading. Fetch `https://world.openfoodfacts.org/api/v2/product/{encodeURIComponent(barcode)}.json?fields=product_name` using `AbortController`, require `status === 1` plus non-empty `product_name`, map only that name and the scanned barcode, and expose retry, manual fallback, and Cancel calling `abort()`.
- [ ] **Step 5: Verify outcomes.** Run `npm test -- product-lookup barcode-scanner`; expect PASS for waiting, success, failure, retry, and cancellation. On a physical phone scan a packaged product, disable networking for error/retry, deny then re-enable permission, and record results in `docs/verification.md`.
- [ ] **Step 6: Commit.**

  ```bash
  git add package.json package-lock.json app.json App.js screens/Pantry.js screens/BarcodeScanner.js services/product-lookup.js tests docs/verification.md
  git commit -m "feat: scan pantry barcodes with safe lookup"
  ```

### Task 6: Instrument, investigate, and document three real bugs over two weeks

**Files:**

- Modify: `bugs.md`
- Create: `docs/debug-log.md`
- Modify: affected source and test files identified by investigation
- Modify: `changelog.md`

**Interfaces:** Produces three resolved bug entries with immutable commit hashes and evidence references.

- [ ] **Step 1: Add development-only structured diagnostics.** Create a `debugEvent(event, fields)` helper gated by `__DEV__`. Log event names and non-sensitive metadata such as transition/HTTP status, never pantry names, barcode values, or response bodies. In `docs/debug-log.md`, add columns for date, bug ID, reproduction, evidence, hypothesis, fix, test, and commit.
- [ ] **Step 2: Investigate and fix two observed defects in the first calendar week.** For each: reproduce, collect one artifact (failed test, Metro log, inspector state, or screenshot), write a regression test, implement the smallest fix, and add a Resolved Bugs entry with symptom, exact evidence, fix, command, and commit hash. Commit each fix separately.
- [ ] **Step 3: Investigate and fix the third observed defect in a later calendar week.** Repeat Step 2 in a different calendar week; record the real later commit hash and do not alter timestamps to simulate the requirement.
- [ ] **Step 4: Validate evidence.** Run `git log --format='%h %ad %s' --date=short -- <affected-files>` and `npm test`; expect three linked resolved records, commits in two weeks, and passing regressions.

### Task 7: Define essential behavior and prevent regressions

**Files:**

- Create: `README.md`
- Create: `tests/regression.test.js`
- Modify: `docs/verification.md`

**Interfaces:** Produces a documented Essential Behavior contract and repeatable release checklist.

- [ ] **Step 1: Document essential behavior.** Include: offline recipes load/filter; favorites and pantry survive relaunch; pantry CRUD works; barcode may be scanned or typed; lookup supports success/failure/retry/cancel; denied camera and offline use remain usable.
- [ ] **Step 2: Write the end-to-end regression test before a safe UI change.** Start with an empty mocked store, add `milk`, favorite a known recipe, remount with the same store, and assert both restore. Then make a small unrelated Home heading-copy change and rerun this unchanged test to prove no regression.
- [ ] **Step 3: Add the manual release checklist.** List launch offline, category/search, favorite/unfavorite, pantry CRUD, restore, scan success, lookup failure/retry/cancel, denied camera/manual entry, TalkBack/VoiceOver, large text, and keyboard-only web navigation where supported.
- [ ] **Step 4: Run `npm test` and `npx expo export --platform android`.** Expect both PASS; record date and result.
- [ ] **Step 5: Commit.**

  ```bash
  git add README.md tests/regression.test.js docs/verification.md screens/Home.js
  git commit -m "test: document and protect essential behavior"
  ```

### Task 8: Make the application accessible and adaptable

**Files:**

- Modify: `screens/Home.js`, `screens/Favorites.js`, `screens/Pantry.js`, `screens/BarcodeScanner.js`
- Modify: `components/RecipeCard.js`, `components/PantryItemForm.js`
- Create: `tests/accessibility.test.js`
- Modify: `docs/verification.md`

**Interfaces:** Produces labelled controls, announced async/error state, 44×44 pt targets, scalable layouts, and non-color-only cues.

- [ ] **Step 1: Record the accessibility baseline.** Test 200% text, screen reader, reduce motion, and dark mode if supported. Record screen, setting, observed failure, and screenshot/transcript.
- [ ] **Step 2: Write failing assertions.** Verify favorite labels communicate add/remove plus recipe title; icon-only controls have labels; loading/error/saved text uses `accessibilityLiveRegion="polite"`; and form labels are associated with inputs.
- [ ] **Step 3: Implement five consequential improvements.** (1) State-specific favorite labels plus visible status; (2) 44×44 targets, labels, and hints for icons/scanner actions; (3) flexible scrollable layouts and `maxFontSizeMultiplier` so 200% text keeps actions reachable; (4) live announcements for loading, recovery, lookup, and errors; (5) text/icons in addition to color for selection and failures.
- [ ] **Step 4: Run `npm test -- accessibility`; re-test settings and document before/after results.** Expect PASS and evidence of at least three material improvements.
- [ ] **Step 5: Commit.**

  ```bash
  git add screens components tests/accessibility.test.js docs/verification.md
  git commit -m "feat: improve accessible pantry interactions"
  ```

### Task 9: Complete the privacy, security, dependency, and failure audit

**Files:**

- Create: `docs/privacy-security-audit.md`
- Modify: `README.md`, `app.json`, `package.json`, `changelog.md`

**Interfaces:** Produces an auditable dependency/permission inventory and documented recovery policy.

- [ ] **Step 1: Inventory all data, dependencies, permissions, and endpoint use.** Create four audit tables: production dependencies/purpose/removal decision; camera permission/trigger/on-device use/fallback; persisted fields/retention; Open Food Facts URL/data sent (barcode only)/data accepted (product name only)/failure behavior. Record the spike's 36,607-byte unfiltered response as the reason for the `fields=product_name` query.
- [ ] **Step 2: Remove or repair discovered risks.** Confirm no API key, barcode, or pantry name is committed/logged; remove unused dependencies; make errors generic; use `encodeURIComponent(barcode)`; never store camera frames/images; and record each finding/resolution.
- [ ] **Step 3: Exercise failure paths and inspect configuration.** Run `npm test`, `npm audit --omit=dev`, and `npx expo config --type public`. Tests must pass; document every remaining audit finding with severity/mitigation; confirm config has only justified camera permission and no secrets.
- [ ] **Step 4: Perform final manual audit and commit.** Confirm deletion of every pantry record, manual entry with denied camera, no post-cancel update, and valid relaunch restoration; link those outcomes in the audit/changelog.

  ```bash
  git add docs/privacy-security-audit.md README.md app.json package.json package-lock.json changelog.md
  git commit -m "docs: audit PantryPal privacy and failures"
  ```

## Final Verification

- [ ] Run `npm test` with no focused filter.
- [ ] Run `npx expo export --platform android` and resolve configuration errors.
- [ ] Complete physical-hardware and accessibility checks in `docs/verification.md`.
- [ ] Confirm `bugs.md` has three genuine resolved entries whose commits span two calendar weeks.
- [ ] Review the audit against `package.json`, `app.json`, storage keys, and the Open Food Facts client.

## Self-Review

Tasks 2–4 cover modelling, persistence, and every required data state. Task 6 covers real evidence-backed bugs and the two-week constraint. Task 5 covers async waiting/success/failure/retry/abandonment, hardware, and unreliable external input. Tasks 7–9 cover regression, accessibility, and privacy/security/dependency/failure auditing. Each Review Focus item has an owning test or physical verification step, and the plan does not invent bug history.
