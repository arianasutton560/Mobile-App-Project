# Recipe Pairing Recommendations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a right-edge vertical Recommendations tab that opens a right-sliding drawer with recipe suggestions allowed by the selected recipe's category.

**Architecture:** Add a pure ranking helper that accepts the formatted recipe collection and current recipe ID, returning up to three candidates per allowed group. Desserts and side dishes allow dinner and drink candidates; lunch or dinner recipes allow dessert, side, and drink candidates; other recipes retain side and drink candidates. Recipe Details loads that list and owns card navigation. A focused drawer component renders the fixed vertical tab, dimmed backdrop, animated panel, and tappable recipe cards.

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
- Create `components/RecipeRecommendationsDrawer.js`: fixed tab, animated right drawer, backdrop, and recommendation cards.
- Modify `screens/RecipeDetails.js`: load recommendation data, wrap screen content for the fixed tab, and navigate to selected recipe details.

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

- [x] Render a narrow vertical Recommendations tab fixed on the right edge.
- [x] Use React Native Modal plus Animated translateX for a panel that slides in from the right over a dim backdrop; size it to 88% of viewport width, capped at 420 px.
- [x] Add a close button and backdrop dismissal; make drawer contents independently scrollable.
- [x] Render only non-empty allowed recommendation groups, with up to three image-and-title cards each.
- [x] Show the selected recipe image and title above the recommendation groups.
- [x] Animate closed before invoking the selected-recipe callback.

### Task 3: Connect recommendations to Recipe Details

**Files:**
- Modify: `screens/RecipeDetails.js`

- [x] Load `getRecipes()` when the current recipe changes and derive recommendations with `getRecipeRecommendations`.
- [x] Wrap the current scroll view in a flex container and render the drawer outside it so the tab remains fixed while content scrolls.
- [x] On card selection, push `RecipeDetails` with the selected formatted recipe and omit ingredient highlights from the previous recipe.
- [x] Check changed JavaScript/JSX syntax using available project tooling.

## Verification

Parsed all changed JavaScript/JSX modules with the repository's Babel parser and ran `git diff --check`. No automated tests were run.
