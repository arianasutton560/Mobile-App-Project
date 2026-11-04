# Best Match Recipe Ranking Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rank matching recipes by the number of distinct checked ingredients and identify recipes matching at least two.

**Architecture:** Compute a match count for each recipe in `WhatCanIMake` using the existing include/exclude substring rules. Stable-sort matching recipes by count and pass `isBestMatch` to `RecipeCard` for a small visual badge.

**Tech Stack:** React Native; no new dependencies.

**Spec:** `docs/superpowers/specs/2026-11-04-best-match-ranking-design.md`

## Global Constraints

- Continue to require at least one included ingredient and exclude any recipe containing an excluded ingredient.
- Count distinct included checklist ingredients once per recipe using case-insensitive substring matching.
- Show the label at two or more included matches.
- Preserve source order for equal match counts.

## Review Focus

- Multiple occurrences of one selected ingredient count only once.
- Excluded ingredient recipes remain absent even with a high included match count.
- No included ingredients still yields no recipe results.
- Equal scores preserve original recipe order.

---

### Task 1: Compute and sort recipe matches

**Files:**
- Modify: `screens/WhatCanIMake.js`

**Interfaces:**
- Each derived matched recipe includes `matchCount`.
- Sort descending by `matchCount`, using source index as the tie-breaker.

- [ ] Derive match counts from distinct included checklist ingredients and retain the existing exclusion rule.
- [ ] Sort the filtered recipes by descending count while preserving source order for ties.

### Task 2: Show the best-match label

**Files:**
- Modify: `screens/WhatCanIMake.js`
- Modify: `components/RecipeCard.js`

**Interfaces:**
- `RecipeCard` accepts `isBestMatch: boolean`.
- Set it when `matchCount >= 2`.

- [ ] Pass `isBestMatch` to each card.
- [ ] Render a compact “Best match” badge when true, positioned without covering the favorite control or recipe title.
- [ ] Review layout and scoring logic for the four cases listed above.
