# Recipe Nutrition Design

## Intent

Show per-serving calories and a detailed nutrition breakdown in Recipe Details, using nutrition data published with Delish recipes.

## Goals

- Store calories and available nutrient values with each recipe.
- Display calories per serving when available.
- Provide a button that opens a mobile-friendly panel with the available nutrition breakdown.
- Handle recipes without nutrition data by hiding the calories and breakdown control.
- Enrich the existing recipe collection without replacing it with a newly scraped collection.

## Non-goals

- Estimating nutrition from ingredients when the source does not provide it.
- Changing recipe discovery, cards, or other recipe details.
- Claiming nutrition values are exact; the source may describe them as estimates.

## Approaches

- **Inline expandable section:** simple and accessible, but adds more content to the recipe page when opened.
- **Modal or bottom sheet:** keeps the recipe page compact and suits the requested side-button interaction; chosen approach.
- **Separate nutrition screen:** adds navigation and is more effort than this small feature needs.

## Implementation choices

- Extend scraper output with calories and the available nutrition breakdown from the recipe's structured data.
- Carry those fields through the existing recipe formatter.
- Add a button in Recipe Details that opens a dismissible nutrition panel. Show only nutrient values present in the source data.
- Enrich existing records by matching scraped recipes to the current collection and updating nutrition fields while preserving existing recipe content and IDs. Do not overwrite the full collection during nutrition refresh.
- Keep nutrition optional for recipes whose source provides none.

## Constraints and remaining choices

- The current scraper replaces `data/recipes.json`; the nutrition refresh path must avoid that behavior.
- Existing records do not currently expose a source URL in the app data, so matching and coverage need to be checked against the scraper's recipe output before backfill.
- The panel presentation (centered modal on web, native modal on mobile) can use React Native's existing `Modal` component.
