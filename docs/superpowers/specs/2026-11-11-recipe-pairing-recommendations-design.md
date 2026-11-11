# Recipe Pairing Recommendations Design

## Intent

Help someone viewing a recipe find a side dish or drink that goes well with it, using recipes already in the collection.

## Goals

- Show a right-edge Recommendations tab that opens a compact horizontal strip of tappable mini recipe cards.
- Keep all eligible recommendations in one general row without labels separating dinners, sides, drinks, or desserts.
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

- Keep a narrow vertical tab fixed to the right edge of Recipe Details. Tapping it opens or closes a compact recommendation strip near the bottom of the screen.
- Keep the open strip short so it does not cover the full screen; the cards scroll horizontally within it.
- Show each suggestion as a miniature image-and-title card in a horizontally scrolling row.
- Merge eligible categories into one list and remove duplicate recipe IDs; do not show category labels.
- Selecting a card opens that recipe's details.

## Ranking behavior

- Build candidates from the current recipe collection. Smoothies allow `breakfast` only; other breakfast recipes allow `side-dish` candidates that also have the `breakfast` tag plus `drinks`; other drinks allow `dinner`, `lunch`, and `side-dish`; desserts and side dishes allow `dinner` and `drinks`; lunch or dinner recipes allow `dessert`, `side-dish`, and `drinks`; other recipes allow `side-dish` and `drinks`.
- Score cuisine and season matches above generic meal-category overlap. Add ingredient overlap after ignoring quantities and common pantry terms so salt, pepper, and oil alone do not make a strong pairing.
- Preserve source order to break score ties, and show up to three results for each group.
- If a candidate set has no meaningful category or ingredient match, use category candidates as a low-score fallback so the feature remains useful.
- Export proposed pairings as a CSV with source and candidate IDs, titles, category groups, and a pending review status. Do not have the app read pending proposals.

## Constraints and remaining choices

- Recipe navigation and formatted recipe cards already exist; reuse the current recipe formatter.
- The collection contains side-dish and drinks categories, but individual recipes may have incomplete metadata; fallback ranking must handle this.
- Use existing React Native scrolling and pressable components; do not add a dependency.
