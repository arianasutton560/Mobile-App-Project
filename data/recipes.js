import recipes from './recipes.json';

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
      videos: recipe.videos ?? [],
  };
}

export async function getRecipes() {
  return recipes
    .map(formatRecipe);
}

export async function getRecipeDetails(id) {
  const recipe = recipes.find((item) => String(item.id) === String(id));

  if (!recipe) {
    throw new Error('Recipe not found.');
  }

  return formatRecipe(recipe);
}
