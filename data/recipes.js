import recipes from './recipes.json';
import spanishTranslations from './recipeTranslations.es.json';
import spanishTitleOverrides from './recipeTitleOverrides.es.json';

const supportedCategories = new Set([
  'breakfast',
  'lunch',
  'dinner',
  'dessert',
  'autumn',
  'winter',
  'vegan',
  'asian',
  'italian',
  'side-dish',
  'seafood',
  'latin-american',
  'german',
  'european',
  'drinks',
]);

function formatRecipe(recipe) {
  return {
    id: String(recipe.id),
    title: recipe.name,
    image: recipe.image,
    categories: recipe.categories.filter((category) =>
      supportedCategories.has(category)
    ),
    drinkType: recipe.drinkType,
    prepTime: recipe.prepTime,
    cookTime: recipe.cookTime,
    ingredients: recipe.ingredients ?? [],
    instructions: (recipe.instructions ?? []).join('\n\n'),
    servings: recipe.servings,
    description: recipe.description,
    nutrition: recipe.nutrition ?? null,
    videos: recipe.videos ?? [],
  };
}

export function getLocalizedRecipeTitle(recipe, language = 'en') {
  if (language !== 'es') return recipe.title;
  const id = String(recipe.id);
  return spanishTitleOverrides[id] || spanishTranslations[id]?.title || recipe.title;
}

function localizeTime(value) {
  if (typeof value !== 'string') return value;
  return value
    .replace(/\b(\d+)\s*hrs?\b/gi, '$1 h')
    .replace(/\b(\d+)\s*mins?\b/gi, '$1 min')
    .replace(/(\d+\s*h)\s+0\s*min\b/gi, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

export function localizeRecipe(recipe, language = 'en') {
  if (language !== 'es') return recipe;

  const translation = spanishTranslations[String(recipe.id)];
  if (!translation) return recipe;

  const translatedInstructions = translation.instructions;
  const nutrition = translation.servingSize && recipe.nutrition
    ? { ...recipe.nutrition, servingSize: translation.servingSize }
    : recipe.nutrition;

  return {
    ...recipe,
    title: getLocalizedRecipeTitle(recipe, language),
    description: translation.description || recipe.description,
    prepTime: localizeTime(translation.prepTime || recipe.prepTime),
    cookTime: localizeTime(translation.cookTime || recipe.cookTime),
    servings: translation.servings || recipe.servings,
    ingredients: Array.isArray(translation.ingredients)
      ? recipe.ingredients.map((ingredient, index) => translation.ingredients[index] || ingredient)
      : recipe.ingredients,
    instructions: Array.isArray(translatedInstructions)
      ? translatedInstructions.join('\n\n')
      : translatedInstructions || recipe.instructions,
    videos: recipe.videos?.map((video, index) => ({
      ...video,
      title: translation.videoTitles?.[index] || video.title,
    })) ?? [],
    nutrition,
  };
}

export function getRecipeTranslationCoverage() {
  const translatedIds = new Set(Object.keys(spanishTranslations));
  const sourceIds = new Set(recipes.map((recipe) => String(recipe.id)));
  const missingIds = [];
  const incompleteIds = [];
  const unreviewedTitleIds = [];
  for (const recipe of recipes) {
    const id = String(recipe.id);
    const translation = spanishTranslations[id];
    if (!translation) {
      missingIds.push(id);
      continue;
    }
    if (
      translation.title === recipe.name &&
      !Object.prototype.hasOwnProperty.call(spanishTitleOverrides, id)
    ) {
      unreviewedTitleIds.push(id);
    }

    const hasText = (value) => typeof value === 'string' && value.trim().length > 0;
    const complete =
      hasText(translation.title) &&
      (!hasText(recipe.description) || hasText(translation.description)) &&
      (!hasText(recipe.prepTime) || hasText(translation.prepTime)) &&
      (!hasText(recipe.cookTime) || hasText(translation.cookTime)) &&
      (!hasText(recipe.servings) || hasText(translation.servings)) &&
      translation.ingredients?.length === (recipe.ingredients ?? []).length &&
      translation.instructions?.length === (recipe.instructions ?? []).length &&
      translation.videoTitles?.length === (recipe.videos ?? []).length &&
      (!(recipe.nutrition || {}).servingSize || hasText(translation.servingSize));
    if (!complete) incompleteIds.push(id);
  }
  const extraIds = [...translatedIds].filter(
    (id) => !sourceIds.has(id)
  );
  const extraTitleOverrideIds = Object.keys(spanishTitleOverrides).filter(
    (id) => !sourceIds.has(id)
  );
  return {
    total: recipes.length,
    translated: recipes.length - missingIds.length - incompleteIds.length,
    reviewedTitles: Object.keys(spanishTitleOverrides).length,
    complete: missingIds.length === 0 &&
      incompleteIds.length === 0 &&
      unreviewedTitleIds.length === 0 &&
      extraIds.length === 0 &&
      extraTitleOverrideIds.length === 0,
    missingIds,
    incompleteIds,
    unreviewedTitleIds,
    extraTitleOverrideIds,
    extraIds,
  };
}

export async function getRecipes() {
  return recipes.map(formatRecipe);
}

export async function getRecipeDetails(id) {
  const recipe = recipes.find((item) => String(item.id) === String(id));

  if (!recipe) {
    throw new Error('Recipe not found.');
  }

  return formatRecipe(recipe);
}
