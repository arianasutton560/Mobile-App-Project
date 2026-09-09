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
        const details = await getRecipeDetails(recipe.id, recipe.category);
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
      <Text style={styles.meta}>
        {recipeDetails.category} · {recipeDetails.time}
      </Text>

      <Text style={styles.heading}>Instructions</Text>

      {isLoading ? (
        <ActivityIndicator size="large" color="#d97745" />
      ) : (
        <Text style={styles.instructions}>
          {recipeDetails.instructions}
        </Text>
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
  meta: {
    marginTop: 8,
    color: '#765c4d',
  },
  heading: {
    marginTop: 24,
    marginBottom: 8,
    fontSize: 19,
    fontWeight: 'bold',
  },
  instructions: {
    fontSize: 16,
    lineHeight: 24,
  },
});