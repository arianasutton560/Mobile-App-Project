# Ingredient Category Filters

## Intent
Make the expanded ingredient checklist easier to browse by filtering it through category pills, following the existing Drinks filter interaction.

## Goals and constraints
- Add a horizontal row of selectable category pills above the ingredient checklist.
- Include an “All” choice and relevant ingredient groups: Meat, Vegetables, Fruit, Dairy, Seasonings, Grains & Baking, and Pantry & Sauces.
- Include specific fruit and vegetable types found in the recipe data as checklist choices; Fruit is a category filter, not a generic ingredient choice.
- Expand Seasonings and Pantry & Sauces with specific recurring herbs, spices, oils, broths, condiments, vinegars, and pantry staples found in the recipe data.
- Expand Meat and Grains & Baking with the different proteins, grains, starches, and baking ingredients found in the recipe data.
- Selecting a category filters the checklist choices; selecting “All” shows every choice.
- Keep the current text search, applying it together with the selected category.
- Changing categories or search text must not clear include/exclude choices.
- Preserve the existing recipe filtering, best-match scoring, and ingredient detail highlights.

## Approaches
- Horizontal single-selection pill filters modeled on the Drinks row (chosen): matches the existing app interaction and makes the long checklist easier to browse.
- Expandable grouped sections: groups the full list in place but differs from the Drinks interaction and requires more vertical space.

## Builder decisions
Use one active category at a time. Selecting the active category again returns to “All”. Keep the pills horizontally scrollable and reuse the selected/unselected colors and touch behavior from the Drinks subcategory buttons. Assign every checklist option to exactly one category. Meat includes seafood and eggs. Fruit contains specific fruit choices from the recipe data, with no generic “Fruit” ingredient choice. Dairy contains dairy and cheese choices. Seasonings, Pantry & Sauces, Meat, and Grains & Baking contain canonical names rather than raw recipe lines. Match common singular/plural forms so canonical choices find recipe ingredient lines using regular plural forms.
