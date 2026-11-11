# Recipe Pairing Recommendations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep recommendations collapsed behind a right-edge tab that opens a compact horizontal strip of mini recipe cards.

**Architecture:** Add a pure ranking helper that accepts the formatted recipe collection and current recipe ID, returning up to three candidates per allowed category. Recipe Details loads that list. A fixed tab toggles a short, bottom-anchored horizontal strip that merges eligible categories and removes duplicate IDs; selecting a card navigates to its details.

**Tech Stack:** React Native, Expo, existing recipe JSON and React Navigation.

**Spec:** `docs/superpowers/specs/2026-11-11-recipe-pairing-recommendations-design.md`

## Global Constraints

- Recommendations come only from the existing recipe collection.
- Candidate categories follow the selected recipe's rules: dessert or side-dish → dinner/drinks; lunch or dinner → dessert/side-dish/drinks; other recipes → side-dish/drinks.
- Exclude the current recipe, preserve source order for ties, and show at most three results per group.
- Do not add dependencies or alter recipe discovery/data records.

## Review Focus

- Recipes may have no categories or ingredients; ranking must still return category fallbacks without throwing.
- Common pantry words must not alone count as meaningful ingredient overlap.
- Empty side or drink candidate groups must be hidden cleanly.
- The drawer should stay attached to the right edge on small and large screens, scroll independently, and close through its close control or backdrop.
- Selecting a card must close the drawer and open the selected recipe's details without losing existing navigation behavior.

## File Map

- Create `data/recipeRecommendations.js`: category and ingredient scoring plus top candidate selection.
- Create `components/RecipeRecommendationsStrip.js`: fixed right-edge tab and compact horizontally scrolling mini recipe cards.
- Modify `screens/RecipeDetails.js`: position the tab and open strip over the details page without a full-screen modal.

## Tasks

### Task 1: Rank allowed recipe candidates

**Files:**
- Create: `data/recipeRecommendations.js`

- [x] Export `getRecipeRecommendations(recipes, currentRecipeId)` returning `{ dinners, desserts, sides, drinks }`.
- [x] Apply dessert, side-dish, and lunch/dinner hard category rules, retain side/drink defaults for other recipe types, and exclude the current ID.
- [x] Score shared cuisine categories at 4 points each, shared season categories at 2 points each, and up to five shared meaningful ingredient tokens at 1 point each.
- [x] Ignore generic meal/type categories and common pantry tokens such as salt, pepper, oil, butter, and water for matching.
- [x] Preserve original collection order on ties; when all candidates score zero, retain source order as category fallback; return up to three candidates per allowed group.

### Task 2: Build the right-side drawer

**Files:**
- Create: `components/RecipeRecommendationsDrawer.js`

- [x] Render a right-edge tab that opens and closes one compact horizontal recommendation strip.
- [x] Render all eligible recommendations in that strip with no category headings.
- [x] Deduplicate candidate recipes by ID and show miniature image-and-title cards.
- [x] Keep the opened strip short and separate from the full-screen drawer/modal flow.
- [x] Navigate to a selected recommendation's recipe details.

### Task 3: Connect recommendations to Recipe Details

**Files:**
- Modify: `screens/RecipeDetails.js`

- [x] Load `getRecipes()` when the current recipe changes and derive recommendations with `getRecipeRecommendations`.
- [x] Wrap the current scroll view in a flex container and render the drawer outside it so the tab remains fixed while content scrolls.
- [x] On card selection, push `RecipeDetails` with the selected formatted recipe and omit ingredient highlights from the previous recipe.
- [x] Check changed JavaScript/JSX syntax using available project tooling.

## Verification

Parsed all changed JavaScript/JSX modules with the repository's Babel parser and ran `git diff --check`. No automated tests were run.
