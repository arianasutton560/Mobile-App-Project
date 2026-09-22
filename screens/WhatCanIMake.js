import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import RecipeCard from '../components/RecipeCard';
import { getRecipes } from '../data/recipes';

export default function WhatCanIMake({
  navigation,
  favoriteIds,
  onToggleFavorite,
}) {
  const [recipes, setRecipes] = useState([]);
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [ingredientSearch, setIngredientSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadRecipes() {
      const importedRecipes = await getRecipes();
      setRecipes(importedRecipes);
      setIsLoading(false);
    }

    loadRecipes();
  }, []);

  const ingredients = useMemo(() => {
    return [...new Set(
      recipes.flatMap((recipe) => recipe.ingredients.map((ingredient) =>
        ingredient.toLowerCase()
      ))
    )].sort();
  }, [recipes]);

  const filteredIngredients = ingredients.filter((ingredient) =>
    ingredient.includes(ingredientSearch.toLowerCase())
  );

  const matchedRecipes = recipes.filter((recipe) =>
    selectedIngredients.length > 0 &&
    recipe.ingredients.some((ingredient) =>
      selectedIngredients.includes(ingredient.toLowerCase())
    )
  );

  function toggleIngredient(ingredient) {
    setSelectedIngredients((currentIngredients) =>
      currentIngredients.includes(ingredient)
        ? currentIngredients.filter((item) => item !== ingredient)
        : [...currentIngredients, ingredient]
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
          isFavorite={favoriteIds.includes(item.id)}
          onToggleFavorite={onToggleFavorite}
          onPress={() =>
            navigation.navigate('RecipeDetails', { recipe: item })
          }
        />
      )}
      ListHeaderComponent={
        <>
          <Text style={styles.description}>
            Select ingredients you have. Recipes containing any selected
            ingredient will appear below.
          </Text>

          <TextInput
            style={styles.searchInput}
            placeholder="Search ingredients..."
            value={ingredientSearch}
            onChangeText={setIngredientSearch}
          />

          <View style={styles.selectionRow}>
            <Text style={styles.heading}>
              Ingredients ({selectedIngredients.length} selected)
            </Text>

            {selectedIngredients.length > 0 && (
              <Pressable onPress={() => setSelectedIngredients([])}>
                <Text style={styles.clearText}>Clear</Text>
              </Pressable>
            )}
          </View>

          <View style={styles.ingredients}>
            {filteredIngredients.map((ingredient) => {
              const isSelected = selectedIngredients.includes(ingredient);

              return (
                <Pressable
                  key={ingredient}
                  style={[
                    styles.ingredientButton,
                    isSelected && styles.ingredientButtonSelected,
                  ]}
                  onPress={() => toggleIngredient(ingredient)}
                >
                  <Text
                    style={[
                      styles.ingredientText,
                      isSelected && styles.ingredientTextSelected,
                    ]}
                  >
                    {isSelected ? '✓ ' : ''}{ingredient}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.heading}>
            {selectedIngredients.length
              ? `Recipes (${matchedRecipes.length})`
              : 'Choose an ingredient to see recipes'}
          </Text>
        </>
      }
      ListEmptyComponent={
        selectedIngredients.length > 0 ? (
          <Text style={styles.emptyText}>
            No recipes match those ingredients.
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
    marginBottom: 16,
  },
  searchInput: {
    height: 48,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 16,
  },
  selectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
  },
  heading: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 12,
  },
  clearText: {
    color: '#d9534f',
    fontWeight: '700',
  },
  ingredients: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  ingredientButton: {
    borderWidth: 1,
    borderColor: '#d7c7bd',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#fff',
  },
  ingredientButtonSelected: {
    borderColor: '#d97745',
    backgroundColor: '#fce8dc',
  },
  ingredientText: {
    color: '#765c4d',
    textTransform: 'capitalize',
  },
  ingredientTextSelected: {
    color: '#a94e22',
    fontWeight: '700',
  },
  recipeRow: {
    justifyContent: 'space-between',
  },
  emptyText: {
    color: '#777',
    textAlign: 'center',
    marginTop: 10,
    fontSize: 16,
  },
});