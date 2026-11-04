# Favorites Test Cases

## TC-FAV-01: Save a recipe
- **Type:** Ordinary
- **Starting conditions:** App is open on Home. The recipe is not favorited.
- **Action/input:** Tap the recipe's heart, then open Favorites.
- **Expected result:** The heart shows as saved, and the recipe appears in Favorites.
- **Method:** Manual

## TC-FAV-02: Remove the only favorite
- **Type:** Boundary
- **Starting conditions:** Exactly one recipe is favorited.
- **Action/input:** Tap that recipe's heart again.
- **Expected result:** The recipe disappears from Favorites, and the empty-state message appears.
- **Method:** Manual

## TC-FAV-03: Favorite when haptics fail
- **Type:** Failure
- **Starting conditions:** App is open on Home. The recipe is not favorited. Haptics are unavailable or fail.
- **Action/input:** Tap the recipe's heart.
- **Expected result:** The recipe is still favorited and appears in Favorites.
- **Method:** Manual; simulate unavailable haptics if your test setup supports it.