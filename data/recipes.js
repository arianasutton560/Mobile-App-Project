import recipes from './recipes.json';

const supportedCategories = new Set([
  'breakfast',
  'lunch',
  'dinner',
  'dessert',
  'autumn',
  'winter',
  'vegan',
  'indian',
  'asian',
  'italian',
  'drinks',
]);

function formatCategory(category) {
  return `${category.charAt(0).toUpperCase()}${category.slice(1)}`;
}


function formatRecipe(recipe) {
  return {
      id: String(recipe.id),
      title: recipe.name,
      image: recipe.image,
      category: formatCategory(recipe.category),

      prepTime: recipe.prepTime,
      cookTime: recipe.cookTime,

      ingredients: recipe.ingredients ?? [],
      instructions: (recipe.instructions ?? []).join('\n\n'),
      servings: recipe.servings,
      description: recipe.description,
  };
}

export async function getRecipes() {
  return recipes
    .filter((recipe) => supportedCategories.has(recipe.category))
    .map(formatRecipe);
}

export async function getRecipeDetails(id) {
  const recipe = recipes.find((item) => String(item.id) === String(id));

  if (!recipe) {
    throw new Error('Recipe not found.');
  }

  return formatRecipe(recipe);
}