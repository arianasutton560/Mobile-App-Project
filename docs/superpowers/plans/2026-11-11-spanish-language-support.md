# Spanish Language Support Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let users switch the complete app and all 1,550 recipes between English and neutral Spanish, offline, with the choice saved across restarts.

**Architecture:** Add a shared language context with persisted `en`/`es` preference and a locale dictionary for interface copy. Keep the existing English recipe source canonical and add a separate Spanish translation map keyed by recipe ID; display localized copies while keeping matching/filtering on stable English IDs and canonical recipe data where required.

**Tech Stack:** Expo SDK 58, React Native 0.88, React Navigation 7, AsyncStorage for local preference, bundled JSON locale and recipe data.

**Spec:** `docs/superpowers/specs/2026-11-11-spanish-language-support-design.md`

## Global Constraints

- English remains the default language and the fallback for any missing Spanish translation.
- Do not call a translation service at runtime or add a paid service requirement.
- Preserve recipe IDs, images, nutrition numbers, and canonical ingredient matching behavior.
- Persist the selected language across navigation and app restarts.
- Use neutral Spanish.

## Review Focus

- Missing/partial recipe translations: fall back field-by-field to the English source.
- Recipe list identity: translated titles must not replace stable IDs used for favorites and navigation.
- Ingredient matching: Spanish display labels must not break matching against canonical English ingredient data.
- Recipe search: Spanish searches should match Spanish-displayed titles; English should continue matching English titles.
- Preference loading: render safely while saved language is loading and fall back to English if storage has no valid value.

## File Map

- Create `context/LanguageContext.js` for language state, storage load/save, and `useLanguage()`.
- Create `data/locales/en.js` and `data/locales/es.js` for user-facing interface strings, category labels, ingredient-group labels, ingredient display names, and localized formatting labels.
- Create `data/recipeTranslations.es.json` keyed by recipe ID for translated recipe fields.
- Modify `App.js` to provide language state and expose the settings control on stack headers.
- Create `components/LanguageSettingsButton.js` and `components/LanguageSettingsModal.js` for language selection UI.
- Modify `screens/Home.js`, `screens/Favorites.js`, `screens/RecipeDetails.js`, and `screens/WhatCanIMake.js` to render localized labels/content.
- Modify `components/RecipeCard.js`, `components/CategoryButton.js`, and `components/RecipeRecommendationsStrip.js` where their displayed text needs localization.
- Modify `data/recipes.js` to export canonical and localized recipe helpers without mutating the original recipe objects.
- Create a local batch translation script under `scripts/` to generate the Spanish map from the existing recipe JSON using the selected offline open-source translator; retain the generated JSON as the shipped runtime data.

---

### Task 1: Shared language state and settings control

**Files:**
- Create: `context/LanguageContext.js`
- Create: `components/LanguageSettingsButton.js`
- Create: `components/LanguageSettingsModal.js`
- Modify: `App.js`
- Modify: `screens/Home.js`
- Dependency: `@react-native-async-storage/async-storage` compatible with Expo SDK 58

**Interfaces:**
- `LanguageProvider({ children })` supplies `language`, `setLanguage`, `isLanguageReady`, `isSettingsVisible`, `openLanguageSettings`, and `closeLanguageSettings`.
- `useLanguage()` returns the context value and throws a clear error if used outside the provider.
- `LanguageSettingsButton` opens a modal with English and Español options; choosing one updates context immediately and persists it.

- [ ] Add AsyncStorage using the Expo-compatible install command and confirm it appears in the package manifest.
- [ ] Implement saved-language loading with English fallback and save the chosen `en`/`es` value.
- [ ] Wrap `NavigationContainer` in `LanguageProvider`; add the shared settings button to visible native-stack headers and to the custom Home header.
- [ ] Add accessible selection state and labels for English and Español in the settings modal.
- [ ] Manually confirm the modal opens on Home and secondary screens and that language changes immediately.

### Task 2: Interface translations and localized components

**Files:**
- Create: `data/locales/en.js`
- Create: `data/locales/es.js`
- Modify: `App.js`
- Modify: `screens/Home.js`
- Modify: `screens/Favorites.js`
- Modify: `screens/RecipeDetails.js`
- Modify: `screens/WhatCanIMake.js`
- Modify: `components/RecipeCard.js`
- Modify: `components/CategoryButton.js`
- Modify: `components/RecipeRecommendationsStrip.js`

**Interfaces:**
- Locale files export the same nested string keys for all visible static copy and category/ingredient-group labels.
- `useLanguage()` exposes `t(key, params?)` and `localizeCategory(category)` helpers.

- [ ] Catalog every visible hard-coded label, placeholder, empty/error state, alert, nutrition row label, navigation title, and accessibility label in the app screens and shared components.
- [ ] Add matching English and neutral Spanish locale values and translate component rendering to use `t`.
- [ ] Translate category/group names and ingredient labels for display while retaining canonical category and ingredient keys for filtering/matching.
- [ ] Manually review English and Spanish UI copy across Home, Favorites, Recipe Details, What Can I Make?, recommendations, and nutrition details.

### Task 3: Full Spanish recipe catalog and locale-aware recipe access

**Files:**
- Create: `data/recipeTranslations.es.json`
- Create: `scripts/generate-spanish-translations.py` (or a focused Node script if the offline translator interface requires it)
- Modify: `data/recipes.js`
- Modify: `screens/Home.js`
- Modify: `screens/Favorites.js`
- Modify: `screens/RecipeDetails.js`
- Modify: `screens/WhatCanIMake.js`
- Modify: `components/RecipeCard.js`
- Modify: `components/RecipeRecommendationsStrip.js`

**Interfaces:**
- Export `localizeRecipe(recipe, language)` from `data/recipes.js`; it returns a copy with translated display fields and the same ID/image/nutrition/video metadata.
- Export `getRecipeTranslationCoverage()` for an offline completeness check used by the batch-generation workflow.
- Translation map entries use source recipe IDs and include all user-visible recipe text: `title`, `description`, `ingredients`, `instructions`, `prepTime`, `cookTime`, `servings`, video titles, and nutrition `servingSize`; unchanged fields fall back to English.

- [ ] Inspect current recipe field types and install/use an offline English-to-Spanish Argos model only as a local generation tool; it must not be imported by app runtime code.
- [ ] Generate translations for every recipe ID, preserving ingredient quantities, temperatures, punctuation that carries meaning, paragraph/order structure, and all non-text source data.
- [ ] Implement `localizeRecipe` with field-level English fallback and no mutation of canonical recipe data.
- [ ] Render localized titles/content and localized recommendation cards; keep favorites, navigation, categories, and recommendation relationships keyed by stable recipe IDs.
- [ ] Keep What Can I Make matching against canonical English ingredients and show Spanish display labels/results.
- [ ] Manually inspect representative recipes across drinks, desserts, sides, and meals, including long instructions and missing/empty descriptions.

### Task 4: Search, persistence, and end-to-end verification

**Files:**
- Modify: `screens/Home.js`
- Modify: `screens/WhatCanIMake.js`
- Modify: `data/recipes.js`

- [ ] Ensure Home search matches the active-language title and any English fallback title.
- [ ] Ensure language preference is available before localized screens render and survives an app restart.
- [ ] Run the translation coverage command and confirm exactly 1,550 IDs are covered with no duplicate/missing IDs.
- [ ] Compare source and translated catalog metadata to confirm IDs, images, nutrition values, and video URLs remain unchanged.
- [ ] Manually walk the app in English and Spanish on Expo Go, including opening a favorite, recipe detail, nutrition modal, recommendations, and ingredient matching.
- [ ] Review final diff for accidental recipe source changes and unexpected dependency additions.
