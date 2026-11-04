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
  const normalizedPhrase = normalizeForMatching(phrase);
  const normalizedIngredient = normalizeForMatching(recipeIngredient);
  const escapedPhrase = normalizedPhrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const lastSpaceIndex = escapedPhrase.lastIndexOf(' ');
  const prefix = escapedPhrase.slice(0, lastSpaceIndex + 1);
  const finalWord = escapedPhrase.slice(lastSpaceIndex + 1);
  let finalWordPattern;

  if (/[^aeiou]ies$/i.test(finalWord)) {
    finalWordPattern = `${finalWord.slice(0, -3)}(?:y|ies)`;
  } else if (/(?:ches|shes|xes|zes)$/i.test(finalWord)) {
    finalWordPattern = `${finalWord.slice(0, -2)}(?:es)?`;
  } else if (/oes$/i.test(finalWord)) {
    finalWordPattern = `${finalWord.slice(0, -3)}(?:o|oes|os)`;
  } else if (/s$/i.test(finalWord)) {
    finalWordPattern = `${finalWord.slice(0, -1)}s?`;
  } else if (/[^aeiou]y$/i.test(finalWord)) {
    finalWordPattern = `${finalWord.slice(0, -1)}(?:y|ies)`;
  } else {
    finalWordPattern = `${finalWord}s?`;
  }

  const pattern = new RegExp(`\\b${prefix}${finalWordPattern}\\b`, 'i');

  return pattern.test(normalizedIngredient);
}

function normalizeForMatching(value) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\u0027\u2018\u2019]/g, '')
    .toLowerCase();
}

const ingredientAliases = {
  'bbq sauce': ['bbq sauce', 'barbecue sauce'],
  breadcrumbs: ['breadcrumbs', 'bread crumbs'],
  'powdered sugar': ['powdered sugar', 'confectioners sugar'],
  'poblano peppers': ['poblano peppers', 'poblano chile', 'poblano chiles'],
  'jalapeno peppers': ['jalapeno peppers', 'jalapeno', 'jalapenos'],
  'serrano peppers': ['serrano peppers', 'serrano chile', 'serrano chiles'],
};

function matchesSelectedIngredient(recipeIngredient, selectedIngredient) {
  const aliases = ingredientAliases[normalizeForMatching(selectedIngredient)];
  const phrases = aliases ?? [selectedIngredient];

  return phrases.some((phrase) => matchesWholePhrase(recipeIngredient, phrase));
}

export function ingredientMatches(recipeIngredient, selectedIngredient) {
  const normalizedSelection = selectedIngredient.trim();

  if (!normalizedSelection) {
    return false;
  }

  if (normalizeForMatching(normalizedSelection) === 'any cheese') {
    return cheeseIngredientTerms.some((term) =>
      matchesWholePhrase(recipeIngredient, term)
    );
  }

  if (normalizeForMatching(normalizedSelection) === 'parmesan') {
    return (
      matchesWholePhrase(recipeIngredient, normalizedSelection) ||
      matchesWholePhrase(recipeIngredient, 'parmigiano-reggiano')
    );
  }

  return matchesSelectedIngredient(recipeIngredient, normalizedSelection);
}
