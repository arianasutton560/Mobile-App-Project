# Favorites Test Cases

## TC-FAV-01: Save a recipe
- **Type:** Ordinary
- **Starting conditions:** App is open on Home. The recipe is not favorited.
- **Action/input:** Tap the recipe's heart, then open Favorites.
- **Expected result:** The heart shows as saved, and the recipe appears in Favorites.
- **Why this result is correct:** Saving a recipe should update its favorite status and make it available on the Favorites screen.
- **What this test establishes:** Tapping the heart adds the recipe to the shared favorites state, and Favorites displays it.
- **Method:** Manual

## TC-FAV-02: Remove the only favorite
- **Type:** Boundary
- **Starting conditions:** Exactly one recipe is favorited.
- **Action/input:** Tap that recipe's heart again.
- **Expected result:** The recipe disappears from Favorites, and the empty-state message appears.
- **Why this result is correct:** Removing the only saved recipe should leave no recipes in Favorites.
- **What this test establishes:** The app can remove a favorite and handles an empty favorites list correctly.
- **Method:** Manual

## TC-FAV-03: Favorite when haptics fail
- **Type:** Failure
- **Starting conditions:** App is open on Home. The recipe is not favorited. Haptics are unavailable or fail.
- **Action/input:** Tap the recipe's heart.
- **Expected result:** The recipe is still favorited and appears in Favorites.
- **Why this result is correct:** Haptics are optional feedback; their failure should not prevent the save action.
- **What this test establishes:** The favorite update is resilient to a haptics failure.
- **Method:** Manual; simulate unavailable haptics if your test setup supports it.