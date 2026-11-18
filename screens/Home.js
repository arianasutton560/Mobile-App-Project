import { useEffect, useState } from 'react';
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
import CategoryButton from '../components/CategoryButton';
import LanguageSettingsButton from '../components/LanguageSettingsButton';
import RecipeCard from '../components/RecipeCard';
import { useLanguage } from '../context/LanguageContext';
import { getLocalizedRecipeTitle, getRecipes } from '../data/recipes';

const categories = [
  {
    name: 'Breakfast',
    image: require('../images/categories/breakfast.png'),
  },
  {
    name: 'Lunch',
    image: require('../images/categories/lunch.png'),
  },
  {
    name: 'Dinner',
    image: require('../images/categories/dinner.png'),
  },
  {
    name: 'Dessert',
    image: require('../images/categories/dessert.png'),
  },
  {
    name: 'Vegan',
    image: require('../images/categories/vegan.png'),
  },
  {
    name: 'Drinks',
    image: require('../images/categories/drinks.png'),
  },
  {
    name: 'Spanish',
    category: 'latin-american',
    image: require('../images/categories/spanish.png'),
  },
  {
    name: 'Seafood',
    image: require('../images/categories/seafood.png'),
  },
  {
    name: 'Asian',
    image: require('../images/categories/asian.png'),
  },
  {
    name: 'Italian',
    image: require('../images/categories/italian.png'),
  },
  {
    name: 'Autumn',
    image: require('../images/categories/autumn.png'),
  },
  {
    name: 'Winter',
    image: require('../images/categories/winter.png'),
  },
   {
    name: 'Cooking Appliance',
    category: 'cooking-appliance',
    image: require('../images/categories/cook.png'),
  },
];

const drinkTypes = [
  { id: 'non-alcoholic', labelKey: 'home.nonAlcoholic' },
  { id: 'alcoholic', labelKey: 'home.alcoholic' },
  { id: 'smoothie', labelKey: 'home.smoothies' },
];

const cookTypes = [
  { id: 'oven', labelKey: 'home.oven' },
  { id: 'stove', labelKey: 'home.stove' },
  { id: 'microwave', labelKey: 'home.microwave' },
  { id: 'airfryer', labelKey: 'home.airfryer' },
  { id: 'slowcooker', labelKey: 'home.slowcooker' },
];

const applianceSearchTerms = {
  oven: /\b(oven|bake|bakes|baked|baking|broil|broils|broiled|broiling)\b/i,
  stove: /\b(stove|stovetop|skillet|saucepan)\b/i,
  microwave: /\bmicrowave\b/i,
  airfryer: /\bair[ -]?fryer\b/i,
  slowcooker: /\bslow[ -]?cooker|crock[ -]?pot\b/i,
};

function shuffleRecipes(recipes) {
  const shuffled = [...recipes];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled;
}

export default function Home({ navigation, favoriteIds, onToggleFavorite, }) {
  const { language, localizeCategory, t } = useLanguage();
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedDrinkType, setSelectedDrinkType] = useState(null);
  const [selectedCookType, setSelectedCookType] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadRecipes() {
      try {
        const importedRecipes = await getRecipes();
        setRecipes(shuffleRecipes(importedRecipes));
      } catch {
        setError(true);
      } finally {
        setIsLoading(false);
      }
    }

    loadRecipes();
  }, []);

  const selectedCategoryValue =
    categories.find((category) => category.name === selectedCategory)?.category ??
    selectedCategory?.toLowerCase();

  const normalizedSearch = searchText.trim().toLocaleLowerCase();
  const filteredRecipes = recipes.filter((recipe) => {
    const matchesCategory =
      !selectedCategoryValue ||
      selectedCategory === 'Cooking Appliance' ||
      recipe.categories.includes(selectedCategoryValue);
    const matchesDrinkType =
      selectedCategory !== 'Drinks' ||
      !selectedDrinkType ||
      recipe.drinkType === selectedDrinkType;
    const matchesCookType =
      selectedCategory !== 'Cooking Appliance' ||
      !selectedCookType ||
      applianceSearchTerms[selectedCookType]?.test(
        `${recipe.title} ${recipe.instructions}`
      );

    const localizedTitle = getLocalizedRecipeTitle(recipe, language);
    const matchesSearch = !normalizedSearch ||
      localizedTitle.toLocaleLowerCase().includes(normalizedSearch) ||
      recipe.title.toLocaleLowerCase().includes(normalizedSearch) ||
      recipe.ingredients.some((ingredient) =>
        ingredient.toLocaleLowerCase().includes(normalizedSearch)
      );

    return matchesCategory && matchesDrinkType && matchesCookType && matchesSearch;
  }).sort((firstRecipe, secondRecipe) => {
    if (!normalizedSearch) return 0;

    const matchesTitle = (recipe) =>
      getLocalizedRecipeTitle(recipe, language).toLocaleLowerCase().includes(normalizedSearch) ||
      recipe.title.toLocaleLowerCase().includes(normalizedSearch);

    return Number(matchesTitle(secondRecipe)) - Number(matchesTitle(firstRecipe));
  });

  function handleCategoryPress(category) {
    setSelectedCategory((currentCategory) =>
      currentCategory === category ? null : category
    );
    if (category !== 'Drinks' || selectedCategory === 'Drinks') {
      setSelectedDrinkType(null);
    }
    if (category !== 'Cooking Appliance' || selectedCategory === 'Cooking Appliance') {
      setSelectedCookType(null);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('home.favorites')}
          style={styles.favoritesLink}
          onPress={() => navigation.navigate('Favorites')}
        >
          <Text style={styles.favoritesHeart}>♥</Text>
        </Pressable>

        <Text style={styles.title}>PantryPal</Text>
        <View style={styles.settingsButton}>
          <LanguageSettingsButton />
        </View>
      </View>

        <View style={styles.mainContent}>
          <TextInput
            style={styles.searchInput}
            placeholder={t('home.searchPlaceholder')}
            value={searchText}
            onChangeText={setSearchText}
          />

          <Text style={styles.heading}>{t('home.categories')}</Text>

          <View style={styles.categorySection}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.categoryRow}>
                {categories.map((category) => (
                  <CategoryButton
                    key={category.name}
                    label={localizeCategory(category.category ?? category.name.toLowerCase())}
                    image={category.image}
                    isSelected={selectedCategory === category.name}
                    onPress={() => handleCategoryPress(category.name)}
                  />
                ))}
              </View>
            </ScrollView>
          </View>

          <Text style={[styles.heading, styles.recipesHeading]}>
            {selectedCategory
              ? t('home.categoryRecipes', {
                  category: localizeCategory(selectedCategoryValue),
                })
              : t('home.allRecipes')}
          </Text>

          {selectedCategory === 'Drinks' && (
            <View style={styles.drinkTypeRow}>
              {drinkTypes.map((drinkType) => {
                const isSelected = selectedDrinkType === drinkType.id;
                return (
                  <Pressable
                    key={drinkType.id}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                    onPress={() =>
                      setSelectedDrinkType((current) =>
                        current === drinkType.id ? null : drinkType.id
                      )
                    }
                    style={[
                      styles.drinkTypeButton,
                      isSelected && styles.selectedDrinkTypeButton,
                    ]}
                  >
                    <Text
                      style={[
                        styles.drinkTypeLabel,
                        isSelected && styles.selectedDrinkTypeLabel,
                      ]}
                    >
                      {t(drinkType.labelKey)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}

          {selectedCategory === 'Cooking Appliance' && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.cookTypeScroll}
              contentContainerStyle={styles.cookTypeRow}
            >
              {cookTypes.map((cookType) => {
                const isSelected = selectedCookType === cookType.id;
                return (
                  <Pressable
                    key={cookType.id}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                    onPress={() =>
                      setSelectedCookType((current) =>
                        current === cookType.id ? null : cookType.id
                      )
                    }
                    style={[
                      styles.drinkTypeButton,
                      isSelected && styles.selectedDrinkTypeButton,
                    ]}
                  >
                    <Text
                      style={[
                        styles.drinkTypeLabel,
                        isSelected && styles.selectedDrinkTypeLabel,
                      ]}
                    >
                      {t(cookType.labelKey)}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          )}

          {isLoading ? (
            <ActivityIndicator size="large" color="#d97745" />
          ) : error ? (
            <Text style={styles.emptyText}>{t('home.loadError')}</Text>
          ) : (
            <FlatList
              data={filteredRecipes}
              keyExtractor={(recipe) => recipe.id}
              numColumns={2}
              columnWrapperStyle={styles.recipeRow}
              contentContainerStyle={styles.recipeList}
              renderItem={({ item }) => (
                <RecipeCard
                  recipe={item}
                  isFavorite={favoriteIds.includes(item.id)}
                  onToggleFavorite={onToggleFavorite}
                  onPress={() =>
                    navigation.navigate('RecipeDetails', { recipe: item })
                  }
                />
              )}
              ListEmptyComponent={
                <Text style={styles.emptyText}>{t('home.noRecipes')}</Text>
              }
            />
          )}
        </View>

        <View style={styles.bottomTabBar}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('home.whatCanIMake')}
            style={styles.bottomTab}
            onPress={() => navigation.navigate('WhatCanIMake')}
          >
            <Text style={styles.bottomTabLabel}>{t('home.whatCanIMake')}</Text>
          </Pressable>
        </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 55,
    paddingRight: 20,
    paddingBottom: 20,
    paddingLeft: 8,
    backgroundColor: '#fff',
  },
  headerRow: {
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  mainContent: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  searchInput: {
    height: 36,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  bottomTabBar: {
    height: 54,
    marginLeft: -8,
    marginRight: -20,
    marginBottom: -20,
    justifyContent: 'center',
    backgroundColor: '#d97745',
  },
  bottomTab: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  bottomTabLabel: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  heading: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 12,
  },
  categorySection: {
    height: 100,
  },
  drinkTypeRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 2,
  },
  cookTypeScroll: {
    flexGrow: 0,
    minHeight: 52,
    marginTop: 2,
  },
  cookTypeRow: {
    alignItems: 'center',
    gap: 10,
    paddingRight: 12,
  },
  drinkTypeButton: {
    borderWidth: 1,
    borderColor: '#d97745',
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  selectedDrinkTypeButton: {
    backgroundColor: '#d97745',
  },
  drinkTypeLabel: {
    color: '#765c4d',
    fontSize: 13,
    fontWeight: '600',
  },
  selectedDrinkTypeLabel: {
    color: '#fff',
  },
  recipesHeading: {
    marginTop: 10,
  },
  categoryRow: {
    flexDirection: 'row',
  },
  recipeList: {
    paddingBottom: 20,
  },
  recipeRow: {
    justifyContent: 'space-between',
  },
  recipeTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  recipeCategory: {
    marginTop: 4,
    color: '#765c4d',
  },
  favoritesLink: {
    position: 'absolute',
    left: 0,
    padding: 6,
  },
  settingsButton: {
    position: 'absolute',
    right: 0,
  },
  favoritesHeart: {
    fontSize: 36,
  },
  favoriteLinkText: {
    color: '#d9534f',
    fontWeight: '700',
    fontSize: '30'
  },
  emptyText: {
    color: '#777',
    textAlign: 'center',
    marginTop: 20,
  },
});
