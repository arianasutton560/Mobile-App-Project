# Curated Searchable Ingredients Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expand the searchable checklist with useful canonical ingredients from the recipe collection and distinguish specific cheeses from the broad cheese choice.

**Architecture:** Keep a static curated checklist in `WhatCanIMake` and continue filtering it with the existing search field. Extend `ingredientMatches` so specific names use whole-phrase matching and “Any cheese” checks the known cheese varieties in recipe ingredient text.

**Tech Stack:** React Native and JavaScript; no new dependencies.

**Spec:** `docs/superpowers/specs/2026-11-04-curated-searchable-ingredients-design.md`

## Global Constraints

- Maintain a curated list of canonical ingredient names; do not expose raw recipe lines with quantities or preparation notes.
- Keep search case-insensitive and preserve include/exclude selection behavior.
- Match specific cheese choices by whole ingredient phrase, so pepper jack does not match cream cheese.
- “Any cheese” intentionally matches any cheese variety.

## Review Focus

- Search terms still find each newly added checklist choice regardless of capitalization.
- “Pepper Jack” does not match “cream cheese,” and “Cream cheese” does not match pepper jack.
- “Any cheese” matches specific cheese names that may not include the word “cheese,” such as Parmesan, Gouda, Monterey Jack, mascarpone, pecorino, and burrata.
- Excluded cheese varieties filter recipes only when that variety is present; “Any cheese” excludes all known cheese varieties.
- Existing non-cheese ingredient include/exclude matching remains intact.

---

### Task 1: Expand the curated checklist

**Files:**
- Modify: `screens/WhatCanIMake.js`

**Interfaces:**
- Keep checklist entries as strings so `ingredientChoices`, `visibleIngredients`, and existing rendering remain compatible.
- Replace `Cheese` with `Any cheese`.

- [ ] Add these specific cheese choices: Cream cheese, Cheddar, Mozzarella, Parmesan, Feta, Ricotta, Pepper Jack, Provolone, Goat cheese, Swiss cheese, Blue cheese, Gouda, Cottage cheese, Monterey Jack, Mascarpone, Pecorino, Burrata, Queso, Boursin, Manchego, Halloumi, Muenster, Fontina, Colby Jack, and American cheese.
- [ ] Add these frequent corpus ingredients: Olive oil, Lemon, Lime, Heavy cream, Sour cream, Chicken broth, Soy sauce, Mayonnaise, Honey, Scallions, Spinach, Bell peppers, Bacon, Shrimp, Salmon, Tomato paste, Cornstarch, Garlic powder, Cumin, Paprika, Oregano, Chili powder, Dijon mustard, Cinnamon, Baking powder, Baking soda, and Vanilla extract.
- [ ] Confirm each added option appears in the existing checklist search and can still be included/excluded.

### Task 2: Match specific and broad cheese choices

**Files:**
- Modify: `data/ingredientMatching.js`

**Interfaces:**
- Keep `ingredientMatches(recipeIngredient, selectedIngredient) -> boolean`.
- Add an explicit “Any cheese” case backed by the curated cheese variety list from Task 1.

- [ ] Make “Any cheese” match word-bounded cheese varieties, including names that lack “cheese,” while specific choices continue matching their own phrases only. Treat Parmigiano-Reggiano as a Parmesan alias.
- [ ] Confirm the cheese cases and existing ingredient matching behavior listed under Review Focus.
