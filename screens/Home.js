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
];

const drinkTypes = [
  { id: 'non-alcoholic', labelKey: 'home.nonAlcoholic' },
  { id: 'alcoholic', labelKey: 'home.alcoholic' },
  { id: 'smoothie', labelKey: 'home.smoothies' },
];

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

  const filteredRecipes = recipes.filter((recipe) => {
    const matchesCategory =
      !selectedCategoryValue ||
      recipe.categories.includes(selectedCategoryValue);
    const matchesDrinkType =
      selectedCategory !== 'Drinks' ||
      !selectedDrinkType ||
      recipe.drinkType === selectedDrinkType;

    const localizedTitle = getLocalizedRecipeTitle(recipe, language);
    const normalizedSearch = searchText.trim().toLocaleLowerCase();
    const matchesSearch = !normalizedSearch ||
      localizedTitle.toLocaleLowerCase().includes(normalizedSearch) ||
      recipe.title.toLocaleLowerCase().includes(normalizedSearch);

    return matchesCategory && matchesDrinkType && matchesSearch;
  });

  function handleCategoryPress(category) {
    setSelectedCategory((currentCategory) =>
      currentCategory === category ? null : category
    );
    if (category !== 'Drinks' || selectedCategory === 'Drinks') {
      setSelectedDrinkType(null);
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
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 2,
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
