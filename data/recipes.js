import recipes from './recipes.json';

const supportedCategories = new Set([
  'breakfast',
  'lunch',
  'dinner',
  'dessert',
]);

function formatCategory(category) {
  return `${category.charAt(0).toUpperCase()}${category.slice(1)}`;
}

function formatTime(prepTime, cookTime) {
  const prep = Number(prepTime) || 0;
  const cook = Number(cookTime) || 0;
  const total = prep + cook;

  return total ? `${total} min` : 'Time not available';
}

function formatRecipe(recipe) {
  return {
    id: String(recipe.id),
    title: recipe.name,
    image: recipe.image,
    category: formatCategory(recipe.category),
    time: formatTime(recipe.prepTime, recipe.cookTime),
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