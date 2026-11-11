import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import RecipeCard from '../components/RecipeCard';
import { useLanguage } from '../context/LanguageContext';
import { ingredientMatches } from '../data/ingredientMatching';
import { getRecipes } from '../data/recipes';

const ingredientGroups = [
  {
    label: 'Meat',
    ingredients: [
      'Chicken', 'Beef', 'Bacon', 'Shrimp', 'Salmon', 'Eggs', 'Turkey',
      'Pork', 'Ham', 'Sausage', 'Chorizo', 'Pepperoni', 'Salami',
      'Prosciutto', 'Lamb', 'Duck', 'Hot dogs', 'Kielbasa', 'Steak',
      'Ground turkey', 'Ground pork', 'Ground beef', 'Pork chops',
      'Pork shoulder', 'Pork belly', 'Brisket',
    ],
  },
  {
    label: 'Vegetables',
    ingredients: [
      'Potatoes', 'Onions', 'Tomatoes', 'Garlic', 'Carrots', 'Broccoli',
      'Mushrooms', 'Lettuce', 'Scallions', 'Spinach', 'Bell peppers',
      'Shallots', 'Celery', 'Sweet potatoes', 'Poblano peppers',
      'Jalapeno peppers', 'Serrano peppers', 'Cucumbers', 'Zucchini',
      'Squash', 'Butternut squash', 'Pumpkin', 'Eggplant', 'Cauliflower',
      'Cabbage', 'Brussels sprouts', 'Kale', 'Arugula', 'Asparagus',
      'Artichokes', 'Corn', 'Peas', 'Green beans', 'Snap peas', 'Snow peas',
      'Radishes', 'Beets', 'Turnips', 'Parsnips', 'Fennel', 'Leeks',
      'Collard greens', 'Bok choy', 'Napa cabbage', 'Edamame', 'Green chiles',
      'Pepperoncini', 'Water chestnuts', 'Chard', 'Endive', 'Okra',
    ],
  },
  {
    label: 'Fruit',
    ingredients: [
      'Apples', 'Bananas', 'Blueberries', 'Blackberries', 'Raspberries',
      'Strawberries', 'Cranberries', 'Cherries', 'Peaches', 'Pears', 'Plums',
      'Apricots', 'Oranges', 'Grapefruit', 'Clementines', 'Mangoes',
      'Pineapple', 'Kiwi', 'Watermelon', 'Cantaloupe', 'Grapes', 'Avocado',
      'Coconut', 'Figs', 'Dates', 'Pomegranate', 'Passion fruit', 'Guava',
      'Lemon', 'Lime',
    ],
  },
  {
    label: 'Dairy',
    ingredients: [
      'Milk', 'Any cheese', 'Cream cheese', 'Cheddar', 'Mozzarella',
      'Parmesan', 'Feta', 'Ricotta', 'Pepper Jack', 'Provolone', 'Goat cheese',
      'Swiss cheese', 'Blue cheese', 'Gouda', 'Cottage cheese', 'Monterey Jack',
      'Mascarpone', 'Pecorino', 'Burrata', 'Queso', 'Boursin', 'Manchego',
      'Halloumi', 'Muenster', 'Fontina', 'Colby Jack', 'American cheese',
      'Butter', 'Heavy cream', 'Sour cream',
    ],
  },
  {
    label: 'Seasonings',
    ingredients: [
      'Salt', 'Kosher salt', 'Sea salt', 'Black pepper', 'White pepper',
      'Cayenne pepper', 'Red pepper flakes', 'Chili powder',
      'Ancho chili powder', 'Paprika', 'Smoked paprika', 'Cumin', 'Coriander',
      'Oregano', 'Italian seasoning', 'Basil', 'Thyme', 'Rosemary', 'Sage',
      'Parsley', 'Dill', 'Tarragon', 'Chives', 'Mint', 'Ginger', 'Cinnamon',
      'Nutmeg', 'Allspice', 'Cardamom', 'Turmeric', 'Curry powder',
      'Mustard powder', 'Garlic powder', 'Onion powder', 'Vanilla extract',
      'Almond extract', 'Fennel seed', 'Lemon zest', 'Orange zest',
    ],
  },
  {
    label: 'Grains & Baking',
    ingredients: [
      'Bread', 'Rice', 'Pasta', 'Flour', 'Sugar', 'Cornstarch',
      'Baking powder', 'Baking soda', 'Oats', 'Breadcrumbs', 'Panko',
      'Cornmeal', 'Quinoa', 'Couscous', 'Barley', 'Farro', 'Tortillas',
      'Flour tortillas', 'Corn tortillas', 'Pita', 'Naan', 'Crackers',
      'Graham crackers', 'Pie crust', 'Puff pastry', 'Phyllo', 'Pizza dough',
      'Yeast', 'Cocoa powder', 'Chocolate chips', 'Cake mix', 'Brownie mix',
      'Brown sugar', 'Granulated sugar', 'Powdered sugar', 'Bread flour',
      'Whole wheat flour', 'Almond flour', 'Coconut flour',
    ],
  },
  {
    label: 'Pantry & Sauces',
    ingredients: [
      'Oil', 'Olive oil', 'Extra-virgin olive oil', 'Vegetable oil',
      'Canola oil', 'Neutral oil', 'Sesame oil', 'Coconut oil', 'Avocado oil',
      'Cooking spray', 'Beans', 'Chicken broth', 'Chicken stock',
      'Vegetable broth', 'Beef broth', 'Soy sauce', 'Tamari',
      'Worcestershire sauce', 'Fish sauce', 'Oyster sauce', 'Hoisin sauce',
      'Teriyaki sauce', 'Hot sauce', 'Sriracha', 'BBQ sauce', 'Ketchup',
      'Mayonnaise', 'Dijon mustard', 'Yellow mustard', 'Whole-grain mustard',
      'Honey', 'Maple syrup', 'Agave', 'Molasses', 'Apple cider vinegar',
      'Red wine vinegar', 'White wine vinegar', 'Rice vinegar',
      'Balsamic vinegar', 'Sherry vinegar', 'Tomato paste', 'Crushed tomatoes',
      'Tomato sauce', 'Marinara sauce', 'Coconut milk', 'Chickpeas', 'Lentils',
      'Peanut butter', 'Tahini', 'Miso paste', 'Capers', 'Olives', 'Pickles',
      'Jam',
    ],
  },
];

const ingredientCategories = ['All', ...ingredientGroups.map(({ label }) => label)];

export default function WhatCanIMake({
  navigation,
  favoriteIds,
  onToggleFavorite,
}) {
  const { localizeIngredient, t } = useLanguage();
  const [recipes, setRecipes] = useState([]);
  const [ingredientChoices, setIngredientChoices] = useState({});
  const [ingredientSearch, setIngredientSearch] = useState('');
  const [selectedIngredientCategory, setSelectedIngredientCategory] =
    useState('All');
  const [showChecklist, setShowChecklist] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadRecipes() {
      const importedRecipes = await getRecipes();
      setRecipes(importedRecipes);
      setIsLoading(false);
    }

    loadRecipes();
  }, []);

  const includedIngredients = Object.keys(ingredientChoices).filter(
    (ingredient) => ingredientChoices[ingredient] === 'include'
  );
  const excludedIngredients = Object.keys(ingredientChoices).filter(
    (ingredient) => ingredientChoices[ingredient] === 'exclude'
  );
  const ingredientsInCategory =
    selectedIngredientCategory === 'All'
      ? ingredientGroups.flatMap(({ ingredients }) => ingredients)
      : ingredientGroups.find(
          ({ label }) => label === selectedIngredientCategory
        )?.ingredients ?? [];
  const normalizedIngredientSearch = ingredientSearch.trim().toLocaleLowerCase();
  const visibleIngredients = ingredientsInCategory.filter((ingredient) => {
    if (!normalizedIngredientSearch) return true;
    const translatedIngredient = localizeIngredient(ingredient).toLocaleLowerCase();
    return ingredient.toLocaleLowerCase().includes(normalizedIngredientSearch) ||
      translatedIngredient.includes(normalizedIngredientSearch);
  });

  const matchedRecipes = useMemo(() => {
    if (includedIngredients.length === 0) {
      return [];
    }

    return recipes
      .map((recipe, sourceIndex) => {
        const recipeIngredients = recipe.ingredients;
        const matchCount = includedIngredients.filter((selectedIngredient) =>
          recipeIngredients.some((recipeIngredient) =>
            ingredientMatches(recipeIngredient, selectedIngredient)
          )
        ).length;
        const containsExcludedIngredient = excludedIngredients.some(
          (excludedIngredient) =>
            recipeIngredients.some((recipeIngredient) =>
              ingredientMatches(recipeIngredient, excludedIngredient)
            )
        );

        return { recipe, sourceIndex, matchCount, containsExcludedIngredient };
      })
      .filter(({ matchCount, containsExcludedIngredient }) =>
        matchCount > 0 && !containsExcludedIngredient
      )
      .sort(
        (first, second) =>
          second.matchCount - first.matchCount ||
          first.sourceIndex - second.sourceIndex
      )
      .map(({ recipe, matchCount }) => ({ ...recipe, matchCount }));
  }, [recipes, includedIngredients, excludedIngredients]);

  function cycleIngredient(ingredient) {
    setIngredientChoices((currentChoices) => {
      const currentChoice = currentChoices[ingredient];

      if (currentChoice === 'include') {
        return { ...currentChoices, [ingredient]: 'exclude' };
      }

      if (currentChoice === 'exclude') {
        const updatedChoices = { ...currentChoices };
        delete updatedChoices[ingredient];
        return updatedChoices;
      }

      return { ...currentChoices, [ingredient]: 'include' };
    });
  }

  function selectIngredientCategory(category) {
    setSelectedIngredientCategory((currentCategory) =>
      category === 'All' || currentCategory === category ? 'All' : category
    );
  }

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#d97745" />
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      data={matchedRecipes}
      keyExtractor={(recipe) => recipe.id}
      numColumns={2}
      columnWrapperStyle={matchedRecipes.length ? styles.recipeRow : undefined}
      contentContainerStyle={styles.content}
      renderItem={({ item }) => (
        <RecipeCard
          recipe={item}
          isBestMatch={item.matchCount >= 2}
          isFavorite={favoriteIds.includes(item.id)}
          onToggleFavorite={onToggleFavorite}
          onPress={() =>
            navigation.navigate('RecipeDetails', {
              recipe: item,
              highlightedIngredients: includedIngredients,
            })
          }
        />
      )}
      ListHeaderComponent={
        <>
          <View style={styles.checklistHeader}>
            <View>
              <Text style={styles.checklistHeading}>{t('whatCanIMake.ingredients')}</Text>
              <Text style={styles.selectionCount}>
                {t('whatCanIMake.includedExcluded', {
                  included: `${includedIngredients.length} ${t('whatCanIMake.included')}`,
                  excluded: `${excludedIngredients.length} ${t('whatCanIMake.excluded')}`,
                })}
              </Text>
            </View>

            <Pressable onPress={() => setShowChecklist(!showChecklist)}>
              <Text style={styles.actionText}>
                {t(showChecklist
                  ? 'whatCanIMake.hideIngredients'
                  : 'whatCanIMake.showIngredients')}
              </Text>
            </Pressable>
          </View>

          {showChecklist && (
            <>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.categoryScroll}
                contentContainerStyle={styles.categoryPills}
              >
                {ingredientCategories.map((category) => {
                  const isSelected = selectedIngredientCategory === category;

                  return (
                    <Pressable
                      key={category}
                      accessibilityRole="button"
                      accessibilityState={{ selected: isSelected }}
                      onPress={() => selectIngredientCategory(category)}
                      style={[
                        styles.categoryPill,
                        isSelected && styles.categoryPillSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.categoryPillText,
                          isSelected && styles.categoryPillTextSelected,
                        ]}
                      >
                        {t(`ingredientGroup.${category}`)}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
              <TextInput
                value={ingredientSearch}
                onChangeText={setIngredientSearch}
                placeholder={t('whatCanIMake.searchPlaceholder')}
                placeholderTextColor="#9a7765"
                accessibilityLabel={t('whatCanIMake.searchAccessibility')}
                style={styles.searchInput}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <View style={styles.checklist}>
              {visibleIngredients.map((ingredient) => {
                const choice = ingredientChoices[ingredient];
                const isIncluded = choice === 'include';
                const isExcluded = choice === 'exclude';

                return (
                  <Pressable
                    key={ingredient}
                    style={styles.ingredientRow}
                    onPress={() => cycleIngredient(ingredient)}
                  >
                    <View
                      style={[
                        styles.checkbox,
                        isIncluded && styles.checkboxSelected,
                        isExcluded && styles.checkboxExcluded,
                      ]}
                    >
                      {isIncluded && <Text style={styles.checkmark}>✓</Text>}
                      {isExcluded && <Text style={styles.checkmark}>✕</Text>}
                    </View>

                    <Text style={styles.ingredientText}>{localizeIngredient(ingredient)}</Text>
                  </Pressable>
                );
              })}
              </View>
              {visibleIngredients.length === 0 && (
                <Text style={styles.emptyText}>{t('whatCanIMake.noIngredients')}</Text>
              )}
            </>
          )}

          {includedIngredients.length > 0 && (
            <Pressable
              style={styles.clearButton}
              onPress={() => setIngredientChoices({})}
            >
              <Text style={styles.clearText}>{t('whatCanIMake.clearSelection')}</Text>
            </Pressable>
          )}

          <Text style={styles.heading}>
            {includedIngredients.length
              ? t('whatCanIMake.recipeCount', { count: matchedRecipes.length })
              : t('whatCanIMake.selectIngredients')}
          </Text>
        </>
      }
      ListEmptyComponent={
        includedIngredients.length > 0 ? (
          <Text style={styles.emptyText}>
            {t('whatCanIMake.noMatches')}
          </Text>
        ) : null
      }
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 14,
    paddingBottom: 30,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  description: {
    color: '#765c4d',
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 12,
  },
  checklistHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: 16,
  marginBottom: 12,
  },
  checklistHeading: {
    fontSize: 18,
    fontWeight: '700',
  },
  selectionCount: {
    color: '#765c4d',
    marginTop: 3,
  },
  actionText: {
    color: '#d97745',
    fontWeight: '700',
    marginLeft: 12,
  },
  heading: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 12,
  },
  actionText: {
    color: '#d97745',
    fontWeight: '700',
  },
  checklist: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  categoryScroll: {
    marginBottom: 12,
  },
  categoryPills: {
    flexDirection: 'row',
    paddingRight: 4,
  },
  categoryPill: {
    marginRight: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: '#d97745',
    borderRadius: 18,
  },
  categoryPillSelected: {
    backgroundColor: '#d97745',
  },
  categoryPillText: {
    color: '#765c4d',
    fontSize: 13,
    fontWeight: '600',
  },
  categoryPillTextSelected: {
    color: '#fff',
  },
  searchInput: {
    minHeight: 44,
    marginBottom: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#d8c7bd',
    borderRadius: 10,
    color: '#4f3b31',
    backgroundColor: '#fff',
  },
  ingredientRow: {
    width: '33.33%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    paddingRight: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#a98774',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  checkboxSelected: {
    backgroundColor: '#d97745',
    borderColor: '#d97745',
  },
  checkboxExcluded: {
  backgroundColor: '#d9534f',
  borderColor: '#d9534f',
  },
  checkmark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  selectionCount: {
  color: '#765c4d',
  marginBottom: 12,
  },
  ingredientText: {
    flexShrink: 1,
    color: '#4f3b31',
    fontSize: 14,
  },
  clearButton: {
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  clearText: {
    color: '#d9534f',
    fontWeight: '700',
  },
  recipeRow: {
    justifyContent: 'space-between',
  },
  emptyText: {
    color: '#777',
    textAlign: 'center',
    marginTop: 8,
    fontSize: 16,
  },
});
