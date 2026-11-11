const cuisineCategories = new Set([
  'italian',
  'european',
  'latin-american',
  'german',
  'asian',
]);

const seasonCategories = new Set(['autumn', 'winter']);

const ignoredCategories = new Set([
  'breakfast',
  'lunch',
  'dinner',
  'dessert',
  'drinks',
  'side-dish',
  'vegan',
  'seafood',
]);

const ignoredIngredientTokens = new Set([
  'and',
  'the',
  'with',
  'from',
  'into',
  'plus',
  'more',
  'fresh',
  'dried',
  'ground',
  'chopped',
  'minced',
  'divided',
  'optional',
  'large',
  'medium',
  'small',
  'thinly',
  'finely',
  'roughly',
  'tbsp',
  'tsp',
  'cups',
  'cup',
  'ounces',
  'ounce',
  'pounds',
  'pound',
  'grams',
  'gram',
  'salt',
  'pepper',
  'oil',
  'olive',
  'butter',
  'water',
]);

function getIngredientTokens(ingredients = []) {
  return new Set(
    ingredients.flatMap((ingredient) => {
      const normalized = String(ingredient)
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();
      return normalized.match(/[a-z]{3,}/g) ?? [];
    }).filter((token) => !ignoredIngredientTokens.has(token))
  );
}

function countSharedCategories(recipe, candidate, relevantCategories) {
  const candidateCategories = new Set(candidate.categories ?? []);
  return (recipe.categories ?? []).filter((category) =>
    relevantCategories.has(category) && candidateCategories.has(category)
  ).length;
}

function scorePairing(recipe, candidate, recipeTokens) {
  const candidateTokens = getIngredientTokens(candidate.ingredients);
  let sharedIngredients = 0;

  recipeTokens.forEach((token) => {
    if (candidateTokens.has(token)) sharedIngredients += 1;
  });

  return (
    countSharedCategories(recipe, candidate, cuisineCategories) * 4 +
    countSharedCategories(recipe, candidate, seasonCategories) * 2 +
    Math.min(sharedIngredients, 5)
  );
}

function getTopCandidates(recipes, recipe, category) {
  const recipeTokens = getIngredientTokens(recipe.ingredients);
  return recipes
    .map((candidate, index) => ({
      candidate,
      index,
      score: scorePairing(recipe, candidate, recipeTokens),
    }))
    .filter(({ candidate }) =>
      candidate.id !== recipe.id && (candidate.categories ?? []).includes(category)
    )
    .sort((left, right) => right.score - left.score || left.index - right.index)
    .slice(0, 3)
    .map(({ candidate }) => candidate);
}

export function getRecipeRecommendations(recipes, currentRecipeId) {
  const recipe = recipes.find((item) => String(item.id) === String(currentRecipeId));
  const recommendations = {
    dinners: [],
    lunches: [],
    breakfasts: [],
    desserts: [],
    sides: [],
    drinks: [],
  };
  if (!recipe) return recommendations;

  const recipeCategories = new Set(recipe.categories ?? []);
  let allowedCategories = ['side-dish', 'drinks'];
  const recipeTitle = recipe.title ?? recipe.name ?? '';
  const isSmoothie = recipeCategories.has('smoothie') || /\bsmoothies?\b/i.test(recipeTitle);
  const isBreakfast = recipeCategories.has('breakfast');
  if (isSmoothie) {
    allowedCategories = ['breakfast'];
  } else if (isBreakfast) {
    allowedCategories = ['side-dish', 'drinks'];
  } else if (recipeCategories.has('drinks')) {
    allowedCategories = ['dinner', 'lunch', 'side-dish'];
  } else if (recipeCategories.has('dessert') || recipeCategories.has('side-dish')) {
    allowedCategories = ['dinner', 'drinks'];
  } else if (recipeCategories.has('dinner') || recipeCategories.has('lunch')) {
    allowedCategories = ['dessert', 'side-dish', 'drinks'];
  }

  const recommendationKeyByCategory = {
    dinner: 'dinners',
    lunch: 'lunches',
    breakfast: 'breakfasts',
    dessert: 'desserts',
    'side-dish': 'sides',
    drinks: 'drinks',
  };

  // A category-only fallback keeps the drawer useful when metadata has no
  // meaningful overlap; stable sorting preserves the original recipe order.
  const recipeForScoring = {
    ...recipe,
    categories: (recipe.categories ?? []).filter((category) =>
      !ignoredCategories.has(category)
    ),
  };

  allowedCategories.forEach((category) => {
    const key = recommendationKeyByCategory[category];
    const candidates = recipes.filter((item) =>
      (item.categories ?? []).includes(category) &&
      (!isBreakfast || category !== 'side-dish' || item.categories.includes('breakfast'))
    );
    recommendations[key] = getTopCandidates(candidates, recipeForScoring, category);
  });

  return recommendations;
}
