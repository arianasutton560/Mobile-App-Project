# Recipe Cook Mode Design

## Intent

Let someone cook from a recipe in a focused, readable step-by-step screen. They can open it from a Cook button at the end of Recipe Details, listen to the current step, start a timer when the step includes a duration, and optionally watch the recipe video.

## Current state

- Recipe instructions are stored as ordered strings and are joined with blank lines for display. The same separation is preserved in the localized Spanish instructions.
- Recipe Details currently renders the full instruction text in one block.
- Some recipes have a playable video, already rendered with `expo-video`; recipe records do not include per-step video timestamps.
- Recipes have a primary image, but not separate images for instruction steps.
- The recommendations strip occupies a fixed position at the bottom of Recipe Details.
- `expo-haptics` is already installed. Text-to-speech is not yet installed.

## Goals

- Add a Cook button after the instructions in Recipe Details, with enough bottom spacing to remain visible above the recommendations strip.
- Open a dedicated Cook Mode screen with a step counter, progress bar, large current instruction, Previous and Next controls, and a finish action on the last step.
- Use the selected app language and the recipe's translated instructions when available.
- Include Read Aloud controls for the current step. Stop speech when the user changes steps, stops playback, or exits Cook Mode.
- Offer a manually started timer when the current instruction contains an explicit duration. Show the active countdown and allow pause/reset; keep an active countdown running while the cook moves between steps.
- Show an optional Watch Video section when a playable recipe video exists. Reuse the existing player and caption selection behavior. Do not claim the video is synchronized to a step.
- Return to the same Recipe Details screen when Cook Mode is closed.

## Non-goals

- Generating individual step images or changing the recipe collection to add image assets.
- Automatically starting timers or guessing a duration when the instruction has no explicit time.
- Syncing recipe video playback position to steps; video records have no step timestamps.
- Voice commands or automatic step advancement.
- Dubbing video audio or adding new caption tracks as part of this feature.

## Approaches

- **Inline expanded section:** reveal one step at a time inside Recipe Details. This avoids a new route but competes with ingredients, videos, and the existing bottom recommendations tab.
- **Dedicated Cook Mode screen (selected):** navigate to a focused screen and preserve Recipe Details underneath it. It supports larger text and clear controls, then returns to the same recipe when closed.

## Interaction and layout

- Put a full-width Cook button after the instruction list. Tapping it opens the dedicated Cook Mode route with the current recipe.
- Show the recipe title and a small recipe thumbnail at the top; use text for each step because no step-level photos exist.
- Show `Step N of M`, a progress bar, and one instruction at a time. Previous is disabled on step one; Next advances; the last step changes to Finish.
- If the recipe has a playable video, show a collapsed Watch Video control. Expanding it reveals the existing player with native playback controls and caption options when tracks/data are available. Playback remains independent of step navigation.
- Show Read Aloud / Stop controls. Read the current localized step using the device text-to-speech voice for English or Spanish. Changing steps stops the previous utterance; it does not start the next one automatically.
- Show timer actions only for explicit time expressions in the current step. Do not start automatically. A countdown can continue while the user navigates to another step; when it ends, show a completion state and use haptics while the screen is active.
- Closing Cook Mode returns to Recipe Details without clearing recipe data or favorite state.

## Data and implementation

- Add a `CookMode` stack route that receives the existing recipe object; use the shared language context to localize it.
- Split the localized instruction string on blank lines and ignore empty entries. Hide the Cook button if no instruction steps are present.
- Extract the existing local recipe video player into a reusable component so Recipe Details and Cook Mode share playback and subtitle behavior.
- Use Expo Speech for local device text-to-speech, with `en-US` and `es-ES` language requests; do not send text to an online service.
- Parse explicit hours/minutes/seconds from the current step for timer suggestions. If there are multiple durations, let the user choose which one to start; do not infer durations from phrases without a time unit.
- Track timer deadlines against wall-clock time so the display can recalculate after the app briefly leaves the foreground. Do not promise a background alarm or notification in this version.
- Localize Cook Mode labels and accessibility names in English and Spanish.

## Validation

- Confirm Cook opens for recipes with steps and is absent when no steps exist.
- Confirm progress, Previous/Next, Finish, and return-to-details behavior.
- Check English/Spanish instruction display and Read Aloud stop behavior on step changes and screen exit.
- Check timer extraction for minutes, hours, ranges, multiple durations, and no-duration steps; verify pause/reset and step navigation.
- Check recipes with and without videos, including that expanding the video does not advance or alter the current step.
- Check the Cook button does not overlap the recommendations strip and the Cook Mode screen remains readable on phone-size displays.

## Constraints and remaining choices

- The catalog contains no step-level images or video timestamps; the initial screen uses the recipe image as a small header image and keeps video playback independent.
- Device speech voice availability and pronunciation depend on the operating system. The app requests the current UI language but does not download paid voices.
- Timers update while the app is active; background completion alerts are outside this design.
