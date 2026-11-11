# Recipe Nutrition Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show per-serving calories and an optional detailed nutrition panel in Recipe Details, populated from Delish recipe data.

**Architecture:** Extend the current scraper to normalize `recipe.nutrition` fields and add a separate nutrition-refresh mode that merges those fields into the existing `recipes.json` records by normalized recipe name. Carry the optional nutrition object through `data/recipes.js`, then show calories and a dismissible React Native modal in `RecipeDetails`.

**Tech Stack:** React Native, Expo, Node.js scraper, JSON-LD Recipe data.

**Spec:** `docs/superpowers/specs/2026-11-11-recipe-nutrition-design.md`

## Global Constraints

- Nutrition is optional and only shown when supplied by the source.
- Do not estimate nutrition from ingredients.
- Nutrition refresh must preserve recipe IDs, other recipe content, and existing collection membership.
- Do not replace `data/recipes.json` with the scraper's newly discovered set during nutrition refresh.

## Review Focus

- Source nutrition fields may be strings with units (for example `213 calories`, `8 g`); parse values and preserve units without assuming all fields are numbers.
- Recipes may lack nutrition or have partial nutrition; hide unavailable values and avoid showing an empty panel.
- Matching by normalized title can be ambiguous; update only unambiguous matches and report unmatched/ambiguous source records.
- Source servings can differ from the stored serving text; present calories as source-reported per serving and preserve source yield with nutrition metadata if present.
- Scraper refresh errors must leave the original JSON file untouched.

## File Map

- Modify `scraper/scraper.js`: extract nutrition and add a non-destructive refresh mode.
- Create `scraper/README.md`: document full-scrape and nutrition-refresh commands.
- Modify `data/recipes.js`: expose optional nutrition through the formatter.
- Modify `screens/RecipeDetails.js`: add calorie summary and modal breakdown.
- Modify `docs/superpowers/specs/2026-11-11-recipe-nutrition-design.md` only if implementation reveals a necessary design adjustment.

## Tasks

### Task 1: Extract and safely merge nutrition data

**Files:**
- Modify: `scraper/scraper.js`
- Modify: `scraper/package.json` only if a dedicated documented script is needed.

- [x] Add a normalizer for schema.org nutrition values that returns optional `calories`, `fatContent`, `saturatedFatContent`, `transFatContent`, `cholesterolContent`, `sodiumContent`, `carbohydrateContent`, `fiberContent`, `sugarContent`, `proteinContent`, `vitaminDContent`, `calciumContent`, `ironContent`, and `potassiumContent`, preserving source units.
- [x] Include the normalized nutrition object and source serving text in each scraped recipe when available.
- [x] Add a dedicated nutrition-refresh path that reads existing `data/recipes.json`, scrapes candidate source recipes, merges only nutrition metadata into unique normalized-name matches, and writes atomically only after successful parsing. Report updated, unmatched, and ambiguous counts.
- [x] Create a timestamped backup automatically before replacing the JSON and document the command and its behavior in `scraper/README.md`.
- [x] Keep the existing full scraper mode unchanged apart from adding the optional nutrition object to newly scraped records.
- [x] Check scraper syntax with `node --check scraper/scraper.js`.

### Task 2: Carry nutrition into app recipe records

**Files:**
- Modify: `data/recipes.js`

- [x] Add `nutrition: recipe.nutrition ?? null` to `formatRecipe` so old recipes remain valid and enriched data is available to screens.
- [x] Check the module syntax using the repository's available tooling without changing runtime data.

### Task 3: Show calories and the breakdown panel

**Files:**
- Modify: `screens/RecipeDetails.js`

- [x] Add state for whether the nutrition modal is open.
- [x] When calories exist, show a “Calories per serving” summary and “Nutrition details” button in the recipe info area.
- [x] Open a dismissible modal listing only available nutrient values, labeled with readable nutrient names and source units; display source serving context when available.
- [x] Hide the summary and button when calories are missing; retain partial nutrient visibility only if calories are present, as required by the design.
- [x] Check JSX/module syntax using available project commands.

### Task 4: Review and report backfill readiness

**Files:**
- No additional files unless needed to safely run the dedicated refresh.

- [x] Inspect the existing recipe names and scraper source list for duplicate or unmatched candidates before running any data refresh.
- [x] Run the refresh with unique normalized-name matching and a pre-refresh backup; ambiguous matches were skipped.
- [x] Inspect representative updated JSON records for calories, units, serving context, and unchanged IDs/content.
- [x] Report coverage and any recipes that need a source URL or manual mapping.

## Backfill Result

The refresh retained all 1,550 recipe records and IDs. It added nutrition with calories to 1,261 recipes; 43 had no current source match, 79 were skipped as ambiguous, and 167 matched recipes had no nutrition object from Delish. Comparing against the pre-refresh backup confirmed no non-nutrition recipe content changed.
