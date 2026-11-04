# Ingredient Search and Recipe Detail Highlights

## Intent
Help users find ingredients in the existing “What can I make?” checklist, and make checked ingredients easy to spot in recipe details.

## Goals and constraints
- Add a search field that filters the existing checklist by ingredient name.
- Keep ingredient choices when the search query changes or is cleared.
- Preserve current include/exclude behavior and recipe matching.
- Pass included ingredient names when navigating to recipe details; highlight matching ingredient rows with the app’s orange accent.
- Keep changes local to the current What Can I Make → Recipe Details flow; do not move selection into shared app state.

## Approaches
- Filter checklist and pass selected names with navigation (chosen): minimal change, scoped to this flow.
- Move ingredient selections into shared app state: supports broader access but adds complexity without a current need.

## Builder decisions
Use a native React Native text input, case-insensitive substring filtering, and highlight included ingredients only. Existing ingredient matching semantics remain unchanged.
