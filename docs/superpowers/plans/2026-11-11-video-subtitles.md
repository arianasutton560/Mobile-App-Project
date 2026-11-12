# Recipe Video Subtitles Implementation Plan

> **For agentic workers:** Use `superpowers:executing-plans` to implement this plan task-by-task. Track completed steps with checkboxes.

**Goal:** Add English and Spanish subtitles to recipe videos using embedded tracks when present and locally generated caption cues otherwise.

**Architecture:** Add a deduplicated media-ID caption catalog with timed English and Spanish cues. A local authoring script downloads/extracts each source only when explicitly run, transcribes with faster-whisper, translates cue text with the existing Argos Translate model, and saves resumable review data. Recipe Details will select embedded Expo Video tracks or render the matching generated cue as an overlay, with a per-video Off/English/Español control.

**Tech Stack:** Expo SDK 58, `expo-video`, React Native, Python 3.13 authoring script, faster-whisper, Argos Translate, JSON caption catalogs.

**Spec:** `docs/superpowers/specs/2026-11-11-video-subtitles-design.md`

## Global Constraints

- English and Spanish captions are authored locally; no paid API or runtime transcription service.
- App language selects the initial caption language, but the video control can override it for that playback.
- Missing Spanish captions must not be presented as Spanish by falling back to English text.
- Media downloads, audio extracts, and model files stay outside source control and the app bundle.
- Keep original recipe and video records unchanged; key caption data by the video media ID.
- Do not add or run tests unless requested; validate syntax, catalog format, and an Expo export instead.

## Review Focus

- Media URLs without the expected ID pattern: keep them listed as unsupported or failed in the generation report.
- Repeated video IDs across recipes: generate one caption record and reuse it.
- A language with only one available source: expose only the available choices and never mislabel another language.
- Seeking, pausing, and replaying near cue boundaries: select the cue using the current playback time.
- Empty speech and failed downloads: record a resumable terminal status without breaking other media processing.

## File Map

- Create `data/videoCaptions.en.json` and `data/videoCaptions.es.json` as media-ID keyed cue catalogs.
- Create `data/videoCaptions.js` for media-ID extraction and cue lookup.
- Modify `screens/RecipeDetails.js` for source track discovery, caption selection, timed overlay, and accessible controls.
- Modify `data/locales/en.js` and `data/locales/es.js` for caption control labels.
- Create `scripts/generate-video-captions.py` and `scripts/video-caption-requirements.txt` for resumable local authoring.
- Keep generated work files under ignored `.subtitle-work/`; add this path to `.gitignore` if needed.

## Tasks

### Task 1: Add the caption catalog contract

**Files:** Create the two caption JSON catalogs and `data/videoCaptions.js`.

- [x] Define the catalog as `{ "<media-id>": [{ "start": number, "end": number, "text": string }] }` per language.
- [x] Export `getVideoMediaId(video)` that finds the Hearst media UUID from the video URL or thumbnail URL and returns `null` when absent.
- [x] Export `getCaptionAtTime(cues, currentTime)` that returns the cue covering the time or `null`.
- [x] Add empty valid catalogs until reviewed generated captions are checked in.
- [x] Run Babel parser validation and inspect the exported helper signatures.

### Task 2: Build a resumable local caption authoring tool

**Files:** Create `scripts/generate-video-captions.py`, `scripts/video-caption-requirements.txt`; modify `.gitignore` if required.

- [x] Read and deduplicate media IDs/URLs from `data/recipes.json`; emit a manifest for unsupported entries.
- [x] Download video audio into `.subtitle-work/` only when the script is invoked, using streamed writes and retryable per-media status.
- [x] Extract audio through PyAV, transcribe with faster-whisper `small` on CPU by default, and preserve segment timing.
- [x] Translate each recognized English segment to Spanish using local Argos Translate; keep English and Spanish timing arrays identical.
- [x] Save progress after each media ID, skip completed items on rerun, and record failed/empty-speech entries with a reason.
- [x] Add a batch limit and optional media-ID filter so the initial quality sample does not require processing the entire catalog.
- [x] Write generated catalogs to a staging directory and include model versions plus `needs_review` status in a report; never overwrite reviewed catalog files implicitly.
- [x] Run Python syntax validation and a no-network manifest-only invocation. Do not download or transcribe catalog media before the app integration is complete.

### Task 3: Add player subtitle controls and rendering

**Files:** Modify `screens/RecipeDetails.js`.

- [x] Track available embedded subtitle tracks using Expo Video source/track events and provide choices labeled Off, English, and Español when the relevant source exists.
- [x] Initialize selection from the app language when available; otherwise start Off and leave other available languages selectable.
- [x] Set `player.subtitleTrack` for embedded selections and clear it when using the generated overlay or Off.
- [x] Set `timeUpdateEventInterval` to 0.25 seconds and update the generated cue overlay from the current player time.
- [x] Render generated captions over the video with a high-contrast background, legible wrapping, and safe-area spacing.
- [x] Give the control an accessibility role/label/state and prevent subtitle UI from appearing when neither embedded nor generated choices exist.

### Task 4: Localize controls and wire generated data

**Files:** Modify `data/locales/en.js`, `data/locales/es.js`, and `screens/RecipeDetails.js` as needed.

- [x] Add translated labels for captions, Off, English, and Spanish.
- [x] Import the generated cue catalogs and the media-ID/time lookup helpers in the video player.
- [x] Keep the per-video language override local to that video instance; do not persist it as the global app language.
- [x] Confirm no subtitle choice labels English text as Spanish when a Spanish catalog entry is missing.

### Task 5: Validate playback and generate a review sample

**Files:** Generated sample staged under `.subtitle-work/`; reviewed catalogs only after review.

- [x] Run syntax checks for changed JavaScript and Python and validate the JSON catalogs.
- [x] Run `npx expo export --platform android` to confirm Metro can bundle both caption catalogs and the UI.
- [ ] Run the local authoring pipeline on a small batch of three videos, using an authorized network-enabled command only if sandbox networking blocks the download/model fetch.
- [ ] Inspect timing, English transcript, Spanish translation, and catalog size for the sample; keep it staged as `needs_review` until editorial review.
- [ ] Report sample quality and estimated full-catalog workload before processing all unique media IDs in the manifest.

> Sample attempt: the Whisper model download failed because the model host forcibly closed the connection. The run stopped before downloading any recipe videos, so the generated caption catalogs remain empty and sample review is pending.

## Execution Notes

- Complete Tasks 1–4 before fetching videos or downloading speech models.
- Task 5 intentionally stops at a staged review sample. The spec requires checking transcription and translation quality before generating the full catalog.
- Keep the user's existing working tree changes intact; do not reset or replace unrelated edits.
