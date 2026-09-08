import { useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import CategoryButton from '../components/CategoryButton';
import { recipes } from '../data/recipes';

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

export default function Home() {
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);

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

      <Text style={styles.heading}>
        {selectedCategory ? `${selectedCategory} recipes` : 'All recipes'}
      </Text>

      <FlatList
        data={filteredRecipes}
        keyExtractor={(recipe) => recipe.id}
        renderItem={({ item }) => (
          <View style={styles.recipeCard}>
            <Text style={styles.recipeTitle}>{item.title}</Text>
            <Text style={styles.recipeCategory}>{item.category}</Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No recipes found.</Text>
        }
      />
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
    marginBottom: 20,
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
  categoryRow: {
    flexDirection: 'row',
  },
  recipeCard: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f8f5f2',
    marginBottom: 10,
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
  },
});
