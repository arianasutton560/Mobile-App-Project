# Recipe Video Subtitles Design

## Intent

Let people follow recipe videos with English or Spanish subtitles, including when the video source does not provide subtitle tracks. Keep playback and caption data available without a paid transcription or translation subscription.

## Current state

- Recipe Details plays direct MP4 URLs with `expo-video` native controls.
- The catalog has 1,169 video entries and no subtitle or caption-file fields.
- Expo Video supports selecting subtitle tracks embedded in a loaded video. The player cannot supply captions that are absent from that media source.
- The app already supports English and Spanish and has a local Argos Translate workflow for authoring translations.

## Goals

- Use an embedded English or Spanish subtitle track when the source video has one.
- Provide English and Spanish subtitles for catalog videos through generated, bundled caption data.
- Add an accessible caption control with Off, English, and Spanish choices.
- Follow the app language by default: English subtitles for English UI and Spanish subtitles for Spanish UI. Let users override the default for the current playback.
- Generate and translate caption files locally with open-source tools; do not send audio or transcripts to a paid service at runtime.
- Keep caption generation separate from app startup and video playback.

## Non-goals

- Translating or dubbing the video audio.
- Guaranteeing perfect automatic speech recognition without review.
- Capturing unrelated background speech or describing visual-only actions.
- Replacing the existing source videos or changing their URLs.

## Approaches

- **Embedded tracks only:** use `expo-video` track selection. This is small and works where the media includes captions, but does not meet catalog coverage when captions are absent.
- **External WebVTT overlay only:** generate separate English and Spanish caption cues and render them over the video. This covers sources without tracks but ignores useful embedded tracks.
- **Hybrid (selected):** prefer embedded tracks where available and provide generated external captions for catalog entries without them. This gives the broadest coverage while retaining source captions.

## Playback and controls

- Extend the video record with a stable caption key, or maintain a separate caption manifest keyed by the video URL's media ID. Avoid copying large cue arrays into every recipe record when videos are shared.
- On video load, inspect `availableSubtitleTracks`. Offer those tracks in the caption menu and select the one matching the chosen language when possible.
- For a language with no embedded track, load the corresponding generated caption cues from the local caption catalog and display the cue matching the player's current time.
- Provide Off, English, and Español choices. A selected track has priority over a generated track of the same language; choosing Off hides both.
- Default to the UI language when a matching caption source exists. If it does not, leave captions off and keep other available language choices accessible.
- Show the caption control only when at least one embedded or generated caption source is available. Give it an accessibility label and announce the selected language.
- Keep caption appearance readable over portrait and landscape video, with a subtle dark background and safe-area padding.

## Caption authoring workflow

- Add a local authoring script that reads video URLs and IDs from `recipes.json`, deduplicates media IDs, and writes a resumable manifest.
- Fetch each video only during explicit authoring, not in the app. Extract audio locally and transcribe speech with an open-source Whisper implementation. Preserve cue start and end times.
- Translate cue text to Spanish using the existing local Argos model. Do not alter cue timing during translation.
- Write English and Spanish WebVTT files (or a generated equivalent compact cue catalog), record source URL, model/tool version, and processing status, and support resuming failed items.
- Process in batches and retain a review status. Automatically generated captions must be reviewed for names, measurements, ingredient terms, and timing before being treated as final.
- Keep model files, temporary audio, and downloaded video files out of source control. Commit only reviewed caption data needed by the app.
- If a source video cannot be fetched or has no speech, record that state and continue with the remaining manifest.

## Data and language behavior

- Caption data is keyed by stable media ID rather than recipe ID so repeated video links share one transcript.
- Preserve punctuation and numbers in transcripts. Localize the caption menu through the existing English and Spanish locale files.
- The current language preference supplies the initial choice on each video. A user override lasts for the current playback and does not silently change the global app language.
- Missing Spanish captions never fall back to displaying English captions as though they were Spanish; available languages are labeled explicitly.

## Validation

- Confirm video sources with embedded tracks expose those tracks and allow selection on iOS and Android.
- Confirm generated captions appear and remain synchronized while playing, pausing, seeking, and replaying.
- Confirm English and Spanish selection, Off, default language behavior, and graceful handling when only one language exists.
- Check text wrapping and contrast on phone-size portrait and landscape layouts.
- Validate generated VTT syntax, cue timing order, media-ID deduplication, resumability, and absence of temporary audio/video/model files in the app bundle.
- Review a representative sample of automatic captions for transcription and translation quality before processing the full catalog.

## Risks and constraints

- Local speech recognition is compute-intensive; processing all 1,169 video entries may take substantial time and disk space. Batch processing and resume support are required.
- Automatic transcription and segment-by-segment translation need editorial review, especially for culinary vocabulary and quantities.
- Some direct video sources may block automated downloads or may change. Failed media IDs must remain visible in the authoring report.
- Bundled caption cue data increases app size. Measure the generated catalog before deciding whether all reviewed captions can ship in the application bundle or need another static delivery path.
- `expo-video` embedded track availability varies by source and platform; generated captions must remain a separate fallback path.

## Open implementation details

- Confirm the preferred caption storage format after measuring generated data size: bundled WebVTT assets or a compact ID-keyed cue JSON.
- Confirm the chosen local Whisper runtime and model based on available machine hardware, speed, and transcription quality.
- Establish a review batch and quality threshold before running the full catalog.
