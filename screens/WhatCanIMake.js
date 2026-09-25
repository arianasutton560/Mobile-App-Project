import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import RecipeCard from '../components/RecipeCard';
import { getRecipes } from '../data/recipes';

const basicIngredients = [
  'Chicken',
  'Beef',
  'Eggs',
  'Milk',
  'Cheese',
  'Butter',
  'Bread',
  'Rice',
  'Pasta',
  'Potatoes',
  'Onions',
  'Tomatoes',
  'Garlic',
  'Carrots',
  'Broccoli',
  'Mushrooms',
  'Lettuce',
  'Flour',
  'Sugar',
  'Oil',
  'Salt',
  'Pepper',
  'Fruit',
  'Beans',
];

export default function WhatCanIMake({
  navigation,
  favoriteIds,
  onToggleFavorite,
}) {
  const [recipes, setRecipes] = useState([]);
  const [ingredientChoices, setIngredientChoices] = useState({});
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

  const matchedRecipes = useMemo(() => {
  if (includedIngredients.length === 0) {
    return [];
  }

  return recipes.filter((recipe) => {
    const recipeIngredients = recipe.ingredients.map((ingredient) =>
      ingredient.toLowerCase()
    );

    const matchesIncludedIngredient = includedIngredients.some(
      (selectedIngredient) =>
        recipeIngredients.some((recipeIngredient) =>
          recipeIngredient.includes(selectedIngredient.toLowerCase())
        )
    );

    const containsExcludedIngredient = excludedIngredients.some(
      (excludedIngredient) =>
        recipeIngredients.some((recipeIngredient) =>
          recipeIngredient.includes(excludedIngredient.toLowerCase())
        )
    );

    return matchesIncludedIngredient && !containsExcludedIngredient;
  });
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
            Check the ingredients you have. Recipes with any checked
            ingredient will appear below.
          </Text>

          <View style={styles.checklistHeader}>
            <Text style={styles.heading}>
              Ingredients ({includedIngredients.length} included, {excludedIngredients.length} excluded)
            </Text>

            <Pressable onPress={() => setShowChecklist(!showChecklist)}>
              <Text style={styles.actionText}>
                {showChecklist ? 'Hide ingredients' : 'Show ingredients'}
              </Text>
            </Pressable>
          </View>

          {showChecklist && (
            <View style={styles.checklist}>
              {basicIngredients.map((ingredient) => {
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

                    <Text style={styles.ingredientText}>{ingredient}</Text>
                  </Pressable>
                );
              })}
            </View>
          )}

          {includedIngredients.length > 0 && (
            <Pressable
              style={styles.clearButton}
              onPress={() => setIngredientChoices({})}
            >
              <Text style={styles.clearText}>Clear selection</Text>
            </Pressable>
          )}

          <Text style={styles.heading}>
            {includedIngredients.length
              ? `Recipes (${matchedRecipes.length})`
              : 'Select ingredients to see recipes'}
          </Text>
        </>
      }
      ListEmptyComponent={
        includedIngredients.length > 0 ? (
          <Text style={styles.emptyText}>
            No recipes match the selected ingredients.
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