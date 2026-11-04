const cheeseIngredientTerms = [
  'cheese',
  'cream cheese',
  'cheddar',
  'mozzarella',
  'parmesan',
  'feta',
  'ricotta',
  'pepper jack',
  'provolone',
  'goat cheese',
  'swiss cheese',
  'blue cheese',
  'gouda',
  'cottage cheese',
  'monterey jack',
  'mascarpone',
  'pecorino',
  'parmigiano-reggiano',
  'burrata',
  'queso',
  'boursin',
  'manchego',
  'halloumi',
  'muenster',
  'fontina',
  'colby jack',
  'american cheese',
];

function matchesWholePhrase(recipeIngredient, phrase) {
  const escapedPhrase = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pluralStem = escapedPhrase.endsWith('s')
    ? escapedPhrase.slice(0, -1)
    : escapedPhrase;
  const pattern = new RegExp(`\\b${pluralStem}s?\\b`, 'i');

  return pattern.test(recipeIngredient);
}

export function ingredientMatches(recipeIngredient, selectedIngredient) {
  const normalizedSelection = selectedIngredient.trim();

  if (!normalizedSelection) {
    return false;
  }

  if (normalizedSelection.toLowerCase() === 'any cheese') {
    return cheeseIngredientTerms.some((term) =>
      matchesWholePhrase(recipeIngredient, term)
    );
  }

  if (normalizedSelection.toLowerCase() === 'parmesan') {
    return (
      matchesWholePhrase(recipeIngredient, normalizedSelection) ||
      matchesWholePhrase(recipeIngredient, 'parmigiano-reggiano')
    );
  }

  return matchesWholePhrase(recipeIngredient, normalizedSelection);
}
