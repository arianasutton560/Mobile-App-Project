# Recipe Pairing Recommendations Design

## Intent

Help someone viewing a recipe find a side dish or drink that goes well with it, using recipes already in the collection.

## Goals

- Add a vertical Recommendations button fixed to the right edge of Recipe Details.
- Open a dismissible drawer that slides in from the right.
- Show relevant recommendation groups with up to three tappable recipe cards per group.
- For desserts, recommend Dinners and Drinks. For lunch or dinner recipes, recommend Desserts, Sides, and Drinks.
- For side-dish recipes, recommend Dinners and Drinks.
- For drink recipes, recommend Dinners, Lunches, and Sides.
- For smoothies, recommend Breakfast dishes only.
- For breakfast recipes, recommend breakfast-tagged Sides and Drinks.
- For other recipe types, recommend Sides and Drinks.
- Rank candidates with a hybrid score based on shared cuisine or season categories and meaningful ingredient overlap.
- Open a recommended recipe in Recipe Details when its card is selected.
- Exclude the currently viewed recipe and hide groups without candidates.
- Generate a review catalog keyed by local recipe IDs; candidate pairings stay pending and outside app rendering until they are reviewed and approved.

## Non-goals

- Adding new recipes or hand-authoring pairings for the full collection.
- Recommending recipes outside the categories allowed for the selected recipe type.
- Replacing the existing recipe detail page with a recommendation screen.

## Approaches

- **Category-only ranking:** easy to compute, but often produces generic matches.
- **Curated pairings:** precise for individual recipes, but requires ongoing manual maintenance.
- **Hybrid ranking (chosen):** use category overlap for cuisine and season plus meaningful ingredient overlap, then show the best matches. It uses current data while allowing more useful pairings than category overlap alone.

## Interaction and layout

- Keep a narrow vertical Recommendations tab anchored to the right edge while the recipe page scrolls.
- Pressing the tab opens a right-side drawer over a dimmed backdrop. The drawer has a close control and can also close by tapping the backdrop.
- The drawer content scrolls independently and shows groups allowed for the selected recipe type.
- The selected recipe's image and title appear above the recommendation groups for context.
- Each card shows the recipe image and name. Selecting one closes the drawer and navigates to that recipe's details.
- Use a responsive drawer width: most of the viewport on phones and a capped panel width on larger screens.

## Ranking behavior

- Build candidates from the current recipe collection. Smoothies allow `breakfast` only; other breakfast recipes allow `side-dish` candidates that also have the `breakfast` tag plus `drinks`; other drinks allow `dinner`, `lunch`, and `side-dish`; desserts and side dishes allow `dinner` and `drinks`; lunch or dinner recipes allow `dessert`, `side-dish`, and `drinks`; other recipes allow `side-dish` and `drinks`.
- Score cuisine and season matches above generic meal-category overlap. Add ingredient overlap after ignoring quantities and common pantry terms so salt, pepper, and oil alone do not make a strong pairing.
- Preserve source order to break score ties, and show up to three results for each group.
- If a candidate set has no meaningful category or ingredient match, use category candidates as a low-score fallback so the feature remains useful.
- Export proposed pairings as a CSV with source and candidate IDs, titles, category groups, and a pending review status. Do not have the app read pending proposals.

## Constraints and remaining choices

- Recipe cards and recipe navigation already exist; reuse their visual language and the current recipe formatter.
- The collection contains side-dish and drinks categories, but individual recipes may have incomplete metadata; fallback ranking must handle this.
- Use React Native animation and modal primitives already available in the project; do not add a dependency.
