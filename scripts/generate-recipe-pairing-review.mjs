import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { getRecipeRecommendations } from '../data/recipeRecommendations.js';

const recipesPath = fileURLToPath(new URL('../data/recipes.json', import.meta.url));
const outputPath = fileURLToPath(new URL('../data/recipePairingReview.csv', import.meta.url));
const forceOverwrite = process.argv.includes('--force');

const groupLabels = {
  dinners: 'Dinner ideas',
  lunches: 'Lunch ideas',
  breakfasts: 'Breakfast dishes',
  desserts: 'Desserts',
  sides: 'Sides to try',
  drinks: 'Drinks to pair',
};

const columns = [
  'source_id',
  'source_title',
  'source_categories',
  'recommendation_group',
  'candidate_1_id',
  'candidate_1_title',
  'candidate_1_categories',
  'candidate_2_id',
  'candidate_2_title',
  'candidate_2_categories',
  'candidate_3_id',
  'candidate_3_title',
  'candidate_3_categories',
  'review_status',
];

function escapeCsv(value) {
  const text = String(value ?? '');
  return `"${text.replaceAll('"', '""')}"`;
}

if (fs.existsSync(outputPath) && !forceOverwrite) {
  throw new Error('Review file already exists. Use --force only if you intend to replace it.');
}

const rawRecipes = JSON.parse(fs.readFileSync(recipesPath, 'utf8'));
const recipes = rawRecipes.map((recipe) => ({
  id: String(recipe.id),
  title: recipe.name,
  image: recipe.image,
  categories: recipe.categories ?? [],
  ingredients: recipe.ingredients ?? [],
}));
const recipeById = new Map(recipes.map((recipe) => [recipe.id, recipe]));

if (recipeById.size !== recipes.length) {
  throw new Error('Recipe IDs must be unique to build an ID-based review catalog.');
}

const rows = [columns];
const sourceIds = new Set();
let candidateCount = 0;

for (const recipe of recipes) {
  sourceIds.add(recipe.id);
  const recommendations = getRecipeRecommendations(recipes, recipe.id);

  for (const [groupKey, groupTitle] of Object.entries(groupLabels)) {
    const candidates = recommendations[groupKey] ?? [];
    if (candidates.length === 0) continue;

    const row = [
      recipe.id,
      recipe.title,
      recipe.categories.join('|'),
      groupTitle,
    ];

    for (let index = 0; index < 3; index += 1) {
      const candidate = candidates[index];
      if (candidate && !recipeById.has(String(candidate.id))) {
        throw new Error(`Unknown candidate ID ${candidate.id} for ${recipe.title}.`);
      }
      row.push(candidate?.id ?? '', candidate?.title ?? '', candidate?.categories?.join('|') ?? '');
    }

    row.push('PENDING');
    rows.push(row);
    candidateCount += candidates.length;
  }
}

const csv = `\uFEFF${rows.map((row) => row.map(escapeCsv).join(',')).join('\r\n')}\r\n`;
fs.writeFileSync(outputPath, csv, 'utf8');

console.log(`Review catalog created: ${recipes.length} source recipes, ${candidateCount} candidates, ${rows.length - 1} review rows.`);
