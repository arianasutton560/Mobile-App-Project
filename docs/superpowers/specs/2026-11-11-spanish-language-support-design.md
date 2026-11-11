# Spanish Language Support Design

## Intent

Let users read the entire app in English or neutral Spanish, including every screen and all 1,550 recipes. English remains the default. Spanish translations are bundled with the app so they work offline and do not require a paid translation subscription or runtime translation service.

## Scope

- Add a settings control in the top-right area for choosing English or Spanish.
- Apply the selected language across Home, Favorites, Recipe Details, What Can I Make?, navigation, dialogs, errors, empty states, categories, and reusable recipe components.
- Bundle Spanish translations for all user-visible recipe text, keyed by stable recipe ID. Translate names, descriptions, ingredients, instructions, prep/cook time wording, servings wording, video titles, serving-size text, and user-facing category/ingredient labels. Keep recipe IDs, images, nutrition numbers, and other structured values intact; localize displayed labels and units only where applicable.
- Persist the language choice across screens and app restarts.
- Use neutral Spanish and retain English source text as the fallback.

## Approaches

- **Bundle translations (selected):** Prepare Spanish translations ahead of time and ship them with the app. This guarantees full catalog coverage, offline use, and no translation-service charges. It increases app data size and machine-translated wording may need review.
- **Translate through a cloud service:** Smaller initial app bundle, but requires an account, protected credentials, network access, a backend, and a usage limit or charges. This does not meet the no-subscription preference as reliably.

## Design

- Add a global language preference/context so every screen and component renders from the same selected language.
- Store interface translations in a Spanish locale file and bundle recipe translations in a separate ID-keyed data file, leaving the current English recipe source intact.
- Provide a settings screen or dialog reachable from a top-right settings control. Changing language updates the current view immediately.
- Persist the preference locally. If a Spanish translation is missing for any field, show its English source text rather than blank content.
- Generate the recipe translation data with an offline, open-source translation tool; do not call a translation API at app runtime.

## Validation

- Confirm every recipe ID has Spanish values for all translatable fields and that original IDs, images, and numeric nutrition values remain unchanged.
- Check each screen’s English and Spanish labels, category names, recipe cards, details, nutrition modal, recommendations, and ingredient matching flows.
- Verify changing languages updates the app immediately and the selection survives an app restart.

## Open implementation details

- Choose a local persistence package compatible with this Expo app.
- Evaluate translation output for culinary terms and formatting, especially quantities, temperatures, and Spanish punctuation, without changing ingredient measurements or recipe meaning.
