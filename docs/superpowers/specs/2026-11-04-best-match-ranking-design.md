# Best Match Recipe Ranking

## Intent
Make recipes that use more of the user's checked ingredients easier to find in “What can I make?”.

## Goals and constraints
- Continue showing recipes that contain at least one included ingredient and no excluded ingredients.
- Rank recipes by the number of distinct included checklist ingredients found in that recipe, highest first.
- Show a “Best match” label for recipes matching two or more distinct included ingredients.
- Preserve the existing recipe order when match counts tie.
- Keep match counting in `WhatCanIMake`; pass a simple flag to `RecipeCard` for presentation.

## Approaches
- Calculate counts in `WhatCanIMake` and pass a label flag to cards (chosen): uses selection state where it already lives and keeps card presentation simple.
- Put matching logic in `RecipeCard`: duplicates screen-specific ingredient matching in a reusable display component.

## Builder decisions
Use case-insensitive substring matching, consistent with current include/exclude recipe matching. Count each selected checklist ingredient once per recipe, even if its text appears in multiple ingredient lines.
