import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { getRecipeDetails } from '../data/recipes';

export default function RecipeDetails({ route }) {
  const { recipe } = route.params;
  const [recipeDetails, setRecipeDetails] = useState(recipe);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadRecipeDetails() {
      try {
        const details = await getRecipeDetails(recipe.id);
        setRecipeDetails(details);
      } finally {
        setIsLoading(false);
      }
    }

    loadRecipeDetails();
  }, [recipe]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={{ uri: recipeDetails.image }} style={styles.image} />

      <Text style={styles.title}>{recipeDetails.title}</Text>

      <Text style={styles.heading}>Ingredients</Text>
      {recipeDetails.ingredients?.map((ingredient, index) => (
        <View key={`${index}-${ingredient}`} style={styles.ingredientRow}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.ingredient}>{ingredient}</Text>
        </View>
      ))}

      <View style={styles.recipeInfo}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Servings</Text>
          <Text style={styles.infoValue}>{recipeDetails.servings || '—'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Prep time</Text>
          <Text style={styles.infoValue}>{recipeDetails.prepTime || '—'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Cook time</Text>
          <Text style={styles.infoValue}>{recipeDetails.cookTime || '—'}</Text>
        </View>
      </View>

      <Text style={styles.heading}>Instructions</Text>

      {isLoading ? (
        <ActivityIndicator size="large" color="#d97745" />
      ) : (
        <Text style={styles.instructions}>{recipeDetails.instructions}</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  image: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 16,
  },
  title: {
    marginTop: 18,
    fontSize: 26,
    fontWeight: 'bold',
  },
  heading: {
    marginTop: 24,
    marginBottom: 8,
    fontSize: 19,
    fontWeight: 'bold',
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bullet: {
    width: 20,
    color: '#d97745',
    fontSize: 16,
    lineHeight: 24,
  },
  ingredient: {
    flex: 1,
    color: '#4f3b31',
    fontSize: 16,
    lineHeight: 24,
  },
  recipeInfo: {
    marginTop: 12,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#f8f5f2',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  infoLabel: {
    color: '#765c4d',
    fontWeight: '600',
  },
  infoValue: {
    flexShrink: 1,
    marginLeft: 12,
    color: '#4f3b31',
    textAlign: 'right',
  },
  instructions: {
    fontSize: 16,
    lineHeight: 24,
  },
});
