import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import CategoryButton from '../components/CategoryButton';
import RecipeCard from '../components/RecipeCard';
import { getRecipes } from '../data/recipes';

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
];

export default function Home({ navigation }) {
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadRecipes() {
      try {
        const importedRecipes = await getRecipes();
        setRecipes(importedRecipes);
      } catch {
        setError('Unable to load recipes. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }

    loadRecipes();
  }, []);

  const filteredRecipes = recipes.filter((recipe) => {
    const matchesCategory =
      !selectedCategory || recipe.category === selectedCategory;

    const matchesSearch = recipe.title
      .toLowerCase()
      .includes(searchText.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  function handleCategoryPress(category) {
    setSelectedCategory((currentCategory) =>
      currentCategory === category ? null : category
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>PantryPal</Text>

      <TextInput
        style={styles.searchInput}
        placeholder="Search recipes..."
        value={searchText}
        onChangeText={setSearchText}
      />

      <Text style={styles.heading}>Categories</Text>

      <View style={styles.categorySection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.categoryRow}>
            {categories.map((category) => (
              <CategoryButton
                key={category.name}
                label={category.name}
                image={category.image}
                isSelected={selectedCategory === category.name}
                onPress={() => handleCategoryPress(category.name)}
              />
            ))}
          </View>
        </ScrollView>
      </View>

      <Text style={[styles.heading, styles.recipesHeading]}>
        {selectedCategory ? `${selectedCategory} recipes` : 'All recipes'}
      </Text>

      {isLoading ? (
        <ActivityIndicator size="large" color="#d97745" />
      ) : error ? (
        <Text style={styles.emptyText}>{error}</Text>
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
              onPress={() =>
                navigation.navigate('RecipeDetails', { recipe: item })
              }
            />
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No recipes found.</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 55,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  searchInput: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  heading: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 12,
  },
  categorySection: {
    height: 130,
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
  emptyText: {
    color: '#777',
    textAlign: 'center',
    marginTop: 20,
  },
});
