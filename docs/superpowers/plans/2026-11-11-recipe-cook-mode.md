# Recipe Cook Mode Implementation Plan

> **For agentic workers:** Use this plan task by task. The approved design is in `docs/superpowers/specs/2026-11-11-recipe-cook-mode-design.md`.

**Goal:** Add a focused, localized, step-by-step Cook Mode with read aloud, explicit-duration timers, and optional recipe video.

**Architecture:** Add a `CookMode` native stack route that receives the current recipe and reads app language through `useLanguage`. Reuse the existing video playback and caption implementation by extracting it from `RecipeDetails`; add local device speech and timer behavior in focused components/utilities.

**Tech Stack:** Expo SDK 58, React Native, React Navigation native stack, `expo-video`, `expo-haptics`, `expo-speech`.

**Spec:** `docs/superpowers/specs/2026-11-11-recipe-cook-mode-design.md`

## Global Constraints

- Keep English and Spanish UI labels in `data/locales/en.js` and `data/locales/es.js`.
- Use only the localized recipe instructions available to the app; do not upload text for speech synthesis.
- Start timers only after an explicit user action and only for durations stated in the current step.
- Do not synchronize video to instruction steps or promise background timer notifications.
- Preserve existing Recipe Details video and caption behavior.
- Keep Cook Mode reachable above the fixed recommendations strip.
- Do not add or run automated tests unless requested; validate with appropriate static checks and code inspection.

## Review Focus

- A missing or blank instruction list should not expose a broken Cook action or produce an invalid step count.
- Spanish selection must change both the step text and speech language request.
- Timer text with multiple durations or ranges must not silently choose an unintended duration.
- Recipe video playback and captions must behave the same after player extraction.
- Navigation back from Cook Mode must return to the same recipe details context.

## Files and Responsibilities

- `App.js`: register the Cook Mode route with localized navigation title.
- `screens/RecipeDetails.js`: add the Cook action after instructions and pass the loaded recipe to Cook Mode.
- `screens/CookMode.js`: render current step, progress, navigation, speech controls, timer controls, and optional video disclosure.
- `components/RecipeVideoPlayer.js`: own the reusable existing Expo video/caption UI.
- `components/CookTimer.js`: present timer choices/countdown and pause/reset actions.
- `data/cookTimer.js`: parse explicit time quantities and format countdown values.
- `data/locales/en.js`, `data/locales/es.js`: provide all new visible labels and accessibility names.
- `package.json`, `package-lock.json`: add the SDK 58 compatible `expo-speech` dependency.

## Tasks

### Task 1: Share the existing recipe video player

Move `RecipeVideoPlayer` and its player-only styles from `screens/RecipeDetails.js` into `components/RecipeVideoPlayer.js`. Preserve the current props (`video`, `title`, `language`, `t`), native controls, subtitle track selection, generated caption overlay, and captions modal. Update Recipe Details to import the component and verify the rendered props remain unchanged.

### Task 2: Add Cook Mode language and speech support

Add English and Spanish labels for Cook, step progress, Previous, Next, Finish, Read Aloud, Stop Reading, Watch Video, timer controls, and accessibility labels. Add `expo-speech` at the Expo SDK 58 compatible version. In the Cook Mode screen, use `Speech.speak` with `en-US` or `es-ES`; stop the active utterance when the step changes, speech is stopped, or the screen unmounts.

### Task 3: Implement explicit-duration timer behavior

Create timer helpers that recognize integer hour, minute, and second units in the current instruction and return selectable duration options. Do not infer duration from phrases without a unit. If a step includes multiple durations or a range, require the cook to select a duration rather than choosing silently. Add countdown, pause, resume, reset, and wall-clock deadline recalculation when the app returns to foreground. Use haptics for completion only while Cook Mode is active; do not add notifications.

### Task 4: Build the Cook Mode screen and navigation

Create the step-by-step UI using the localized recipe title, primary image thumbnail, one current instruction, step counter, and progress bar. Previous is disabled on the first step; Next advances, and Finish exits to Recipe Details. Add a collapsible Watch Video section only when a playable URL exists; playback remains independent of step changes and uses the shared video player. Register the route in `App.js` and localize its navigation title.

### Task 5: Connect Cook Mode from Recipe Details

Add a full-width Cook button after the instruction text, hidden when there are no usable steps. Navigate with the loaded recipe data so the Cook Mode screen can localize the instructions consistently. Add enough bottom content spacing for the fixed recommendations strip not to cover the button. Preserve the normal back path to Recipe Details.

## Verification

- Inspect the English and Spanish locale dictionaries for matching Cook Mode keys.
- Run the project’s available static syntax/bundle check without changing dependencies beyond `expo-speech`.
- Review the changed screens at phone dimensions for step readability, timer controls, collapsed/expanded video, and the recommendations strip boundary.
- Manually verify navigation and speech/timer cleanup by code-path inspection; device-specific speech and haptic behavior may require Expo Go to confirm.
