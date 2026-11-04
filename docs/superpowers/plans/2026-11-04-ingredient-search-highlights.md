# Ingredient Search and Recipe Detail Highlights Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add searchable ingredient choices to “What can I make?” and highlight checked ingredients in recipe details.

**Architecture:** Keep query and ingredient choices local to `WhatCanIMake`. Filter the existing checklist case-insensitively, then pass included ingredient names through the RecipeDetails route and highlight matching rows after recipe details load.

**Tech Stack:** React Native, React Navigation; no new dependencies.

**Spec:** `docs/superpowers/specs/2026-11-04-ingredient-search-highlights-design.md`

## Global Constraints

- Keep changes local to the current What Can I Make → Recipe Details flow.
- Preserve current include/exclude behavior and recipe matching.
- Keep ingredient choices when the search query changes or clears.
- Highlight included ingredients with the app’s orange accent.

## Review Focus

- Search matching is case-insensitive and partial; an empty query shows all checklist options.
- Filtering or clearing the query does not reset ingredient choices.
- Highlight matching uses the full ingredient details even while recipe details are loading.
- Opening details from other screens without selected ingredients keeps the current unhighlighted appearance.

---

### Task 1: Search the ingredient checklist

**Files:**
- Modify: `screens/WhatCanIMake.js`
- Reuse: `components/SearchBar.js` if its intended interface can be kept simple; otherwise use React Native `TextInput` in the screen.

**Interfaces:**
- Query state is a string local to `WhatCanIMake`.
- Rendered checklist choices are `basicIngredients` filtered by case-insensitive substring match.

- [ ] Add a labeled/placeholder text input above the checklist and filter the visible choices from its query.
- [ ] Confirm manually that partial/case-insensitive search narrows the list, an empty query restores it, and selections survive filtering and clearing.

### Task 2: Carry checked ingredients into recipe details

**Files:**
- Modify: `screens/WhatCanIMake.js`
- Modify: `screens/RecipeDetails.js`

**Interfaces:**
- Navigate with params `{ recipe, highlightedIngredients: includedIngredients }`.
- `RecipeDetails` reads `route.params.highlightedIngredients ?? []`.

- [ ] Pass included ingredient names with the existing recipe route navigation.
- [ ] Compare each loaded detail ingredient case-insensitively using the same substring semantics as current recipe matching; style matching rows with an orange-tinted background and existing accent color.
- [ ] Confirm manually that included matches highlight, nonmatches do not, and recipe details opened elsewhere remain unchanged.
