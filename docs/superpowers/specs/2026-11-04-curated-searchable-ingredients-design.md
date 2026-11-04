# Curated Searchable Ingredients

## Intent
Give users more useful ingredient choices by expanding the “What can I make?” checklist from the recipe collection, while keeping the choices readable and searchable.

## Goals and constraints
- Maintain a curated list of canonical ingredient names; do not expose raw recipe lines with quantities or preparation notes.
- Preserve existing checklist choices and add common ingredients found across the 1,550 recipes.
- Add useful frequent items such as olive oil, lemon, lime, heavy cream, sour cream, chicken broth, soy sauce, mayonnaise, honey, scallions, spinach, bell peppers, bacon, shrimp, and common seasonings.
- Replace the ambiguous generic “Cheese” label with “Any cheese” and add distinct varieties found in the recipes, including cream cheese, cheddar, mozzarella, parmesan, feta, ricotta, pepper jack, provolone, goat cheese, Swiss, blue cheese, Gouda, Monterey Jack, mascarpone, pecorino, burrata, queso, Boursin, Manchego, halloumi, Muenster, Fontina, Colby Jack, and American cheese.
- Keep search case-insensitive and preserve include/exclude selection behavior.
- Match specific cheese choices by whole ingredient phrase, so pepper jack does not match cream cheese. “Any cheese” intentionally matches any cheese variety.

## Approaches
- Curate canonical names from the recipe corpus (chosen): readable, useful options with correct specific-cheese behavior; requires occasional maintenance as recipes change.
- Generate choices from all ingredient lines: automatically tracks the corpus but exposes noisy near-duplicates, quantities, and preparation wording.

## Builder decisions
Retain the existing checklist layout and search field. Add the curated options as checklist entries so they can be searched; do not add categories or a separate ingredient management screen. For the initial list, favor recurring pantry staples, produce, proteins, and cheese varieties present in the corpus.
