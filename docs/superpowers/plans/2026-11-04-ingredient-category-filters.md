# Ingredient Category Filters Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add category pills that filter the searchable ingredient checklist without clearing ingredient selections.

**Architecture:** Group checklist names by category in `WhatCanIMake`, derive the visible ingredients from the active category and search query, and render horizontally scrollable single-select pills matching the Drinks filter styling.

**Tech Stack:** React Native and JavaScript; no new dependencies.

**Spec:** `docs/superpowers/specs/2026-11-04-ingredient-category-filters-design.md`

## Global Constraints

- Include an “All” choice and groups: Meat, Vegetables, Fruit, Dairy, Seasonings, Grains & Baking, and Pantry & Sauces.
- Apply category and search filters together.
- Changing category or search text must not clear include/exclude choices.
- Preserve recipe filtering, best-match scoring, and detail highlighting.
- Include specific fruit and vegetable types found in recipe ingredients; do not add a generic Fruit checklist choice.
- Expand Seasonings and Pantry & Sauces with specific canonical choices found in the recipe ingredient data.
- Match common singular/plural forms, including berry “y”/“ies” forms and “potato”/“potatoes”.

## Review Focus

- “All” shows every checklist item, subject to the search query.
- Each non-All category shows only its assigned checklist items.
- Fruit and Vegetables include the distinct produce types found in the recipe data.
- Seasonings and Pantry & Sauces include the recurring types found in the recipe data without exposing recipe wording or quantities.
- Searching within a category narrows that category; clearing search restores that category’s choices.
- Included and excluded choices remain selected when hidden and shown through category changes.
- Category pills stay usable on narrow screens through horizontal scrolling.

---

### Task 1: Group checklist ingredients

**Files:**
- Modify: `screens/WhatCanIMake.js`

**Interfaces:**
- Define `ingredientGroups` as an array of `{ label: string, ingredients: string[] }`.
- Use these ingredient assignments:
  - Meat: Chicken, Beef, Bacon, Shrimp, Salmon, Eggs.
  - Vegetables: Potatoes, Onions, Tomatoes, Garlic, Carrots, Broccoli, Mushrooms, Lettuce, Scallions, Spinach, Bell peppers, Shallots, Celery, Sweet potatoes, Poblano peppers, Jalapeno peppers, Serrano peppers, Cucumbers, Zucchini, Squash, Butternut squash, Pumpkin, Eggplant, Cauliflower, Cabbage, Brussels sprouts, Kale, Arugula, Asparagus, Artichokes, Corn, Peas, Green beans, Snap peas, Snow peas, Radishes, Beets, Turnips, Parsnips, Fennel, Leeks, Collard greens, Bok choy, Napa cabbage, Edamame, Green chiles, Pepperoncini, Water chestnuts, Chard, Endive, Okra.
  - Fruit: Apples, Bananas, Blueberries, Blackberries, Raspberries, Strawberries, Cranberries, Cherries, Peaches, Pears, Plums, Apricots, Oranges, Grapefruit, Clementines, Mangoes, Pineapple, Kiwi, Watermelon, Cantaloupe, Grapes, Avocado, Coconut, Figs, Dates, Pomegranate, Passion fruit, Guava, Lemon, Lime.
  - Dairy: Milk, Any cheese, Cream cheese, Cheddar, Mozzarella, Parmesan, Feta, Ricotta, Pepper Jack, Provolone, Goat cheese, Swiss cheese, Blue cheese, Gouda, Cottage cheese, Monterey Jack, Mascarpone, Pecorino, Burrata, Queso, Boursin, Manchego, Halloumi, Muenster, Fontina, Colby Jack, American cheese, Butter, Heavy cream, Sour cream.
  - Seasonings: Salt, Kosher salt, Sea salt, Black pepper, White pepper, Cayenne pepper, Red pepper flakes, Chili powder, Ancho chili powder, Paprika, Smoked paprika, Cumin, Coriander, Oregano, Italian seasoning, Basil, Thyme, Rosemary, Sage, Parsley, Dill, Tarragon, Chives, Mint, Ginger, Cinnamon, Nutmeg, Allspice, Cardamom, Turmeric, Curry powder, Mustard powder, Garlic powder, Onion powder, Vanilla extract, Almond extract, Fennel seed, Lemon zest, Orange zest.
  - Grains & Baking: Bread, Rice, Pasta, Flour, Sugar, Cornstarch, Baking powder, Baking soda.
  - Pantry & Sauces: Oil, Olive oil, Extra-virgin olive oil, Vegetable oil, Canola oil, Neutral oil, Sesame oil, Coconut oil, Avocado oil, Cooking spray, Beans, Chicken broth, Chicken stock, Vegetable broth, Beef broth, Soy sauce, Tamari, Worcestershire sauce, Fish sauce, Oyster sauce, Hoisin sauce, Teriyaki sauce, Hot sauce, Sriracha, BBQ sauce, Ketchup, Mayonnaise, Dijon mustard, Yellow mustard, Whole-grain mustard, Honey, Maple syrup, Agave, Molasses, Apple cider vinegar, Red wine vinegar, White wine vinegar, Rice vinegar, Balsamic vinegar, Sherry vinegar, Tomato paste, Crushed tomatoes, Tomato sauce, Marinara sauce, Coconut milk, Chickpeas, Lentils, Peanut butter, Tahini, Miso paste, Capers, Olives, Pickles, Jam.

- [ ] Replace the flat list with these groups and derive visible ingredients from the active group plus the search query.
- [ ] Populate Fruit and Vegetables with the specific produce choices listed above, and omit the generic “Fruit” ingredient choice.
- [ ] Expand Seasonings and Pantry & Sauces with the listed canonical choices, avoiding duplicate raw recipe wording.
- [ ] Confirm the All view and each category contain the expected checklist choices.

### Task 2: Add category pill filters

**Files:**
- Modify: `screens/WhatCanIMake.js`

**Interfaces:**
- Category state is the active group label or `All`.
- Tapping a category selects it; tapping the active category returns to `All`.

- [ ] Render horizontally scrollable pills above the search input, using the Drinks row’s selected/unselected colors and button behavior.
- [ ] Confirm category and search filters compose and changing either does not reset include/exclude selections.
- [ ] Review narrow-screen horizontal scrolling and ensure existing recipe results and best-match behavior remain intact.

### Task 3: Match produce name variants

**Files:**
- Modify: `data/ingredientMatching.js`

**Interfaces:**
- Keep `ingredientMatches(recipeIngredient, selectedIngredient) -> boolean`.

- [ ] Match regular singular/plural forms for checklist options, including berry “y”/“ies” forms and “potato”/“potatoes”.
- [ ] Ignore diacritics when matching Jalapeno against accented recipe text.
- [ ] Keep “Black pepper” distinct from vegetable “Bell pepper” options.
- [ ] Confirm existing whole-word behavior still prevents `salt` from matching `unsalted`.
