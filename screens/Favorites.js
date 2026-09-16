import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import RecipeCard from '../components/RecipeCard';
import { getRecipes } from '../data/recipes';

export default function Favorites({
  navigation,
  favoriteIds,
  onToggleFavorite,
}) {
  const [recipes, setRecipes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadRecipes() {
      const importedRecipes = await getRecipes();
      setRecipes(importedRecipes);
      setIsLoading(false);
    }

    loadRecipes();
  }, []);

  const favoriteRecipes = recipes.filter((recipe) =>
    favoriteIds.includes(recipe.id)
  );

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#d97745" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={favoriteRecipes}
        keyExtractor={(recipe) => recipe.id}
        numColumns={2}
        columnWrapperStyle={styles.recipeRow}
        contentContainerStyle={styles.recipeList}
        renderItem={({ item }) => (
          <RecipeCard
            recipe={item}
            isFavorite={true}
            onToggleFavorite={onToggleFavorite}
            onPress={() =>
              navigation.navigate('RecipeDetails', { recipe: item })
            }
          />
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            No favorite recipes yet. Tap a heart on a recipe to save it.
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 14,
    backgroundColor: '#fff',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recipeList: {
    paddingBottom: 20,
  },
  recipeRow: {
    justifyContent: 'space-between',
  },
  emptyText: {
    color: '#777',
    textAlign: 'center',
    marginTop: 30,
    fontSize: 16,
  },
});