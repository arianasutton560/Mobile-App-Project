import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useLanguage } from '../context/LanguageContext';
import { localizeRecipe } from '../data/recipes';

function playFavoriteHeartbeat() {
  try {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    setTimeout(() => {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
    }, 350);
  } catch {
    // Keep favoriting available if haptics are unavailable on the device.
  }
}

export default function RecipeCard({ 
  recipe,
  onPress,
  isBestMatch = false,
  isFavorite,
  onToggleFavorite,
}){
  const { language, localizeCategory, t } = useLanguage();
  const displayRecipe = localizeRecipe(recipe, language);
  const categoryLabels = recipe.categories.map(localizeCategory);
  const recipeTime = [displayRecipe.prepTime, displayRecipe.cookTime]
    .filter(Boolean)
    .join(' · ');

return (
    <View style={styles.card}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('recipe.open', { title: displayRecipe.title })}
        style={styles.recipeButton}
        onPress={onPress}
      >
        <Image source={{ uri: displayRecipe.image }} style={styles.image} />

        <View style={styles.content}>
          {isBestMatch && (
            <View style={styles.bestMatchBadge}>
            <Text style={styles.bestMatchText}>{t('match.best')}</Text>
            </View>
          )}
          <Text numberOfLines={2} style={styles.title}>
            {displayRecipe.title}
          </Text>
          <Text style={styles.meta}>{recipeTime}</Text>
          <Text style={styles.category}>{categoryLabels.join('/')}</Text>
        </View>
      </Pressable>

      <Pressable
        style={styles.favoriteButton}
        hitSlop={10}
        accessibilityRole="button"
        accessibilityLabel={t(isFavorite ? 'recipe.removeFavorite' : 'recipe.addFavorite', {
          title: displayRecipe.title,
        })}
        onPress={() => {
          void playFavoriteHeartbeat();
          onToggleFavorite(recipe.id);
        }}
      >
        <Text style={styles.heart}>{isFavorite ? '♥' : '♡'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: 6,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#f8f5f2',
  },
  image: {
    width: '100%',
    aspectRatio: 1,
  },
  favoriteButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heart: {
    color: '#d9534f',
    fontSize: 26,
  },
  content: {
    padding: 10,
  },
  bestMatchBadge: {
    alignSelf: 'flex-start',
    marginBottom: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: '#fff1e8',
  },
  bestMatchText: {
    color: '#b84f1c',
    fontSize: 11,
    fontWeight: '700',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
  },
  meta: {
    marginTop: 5,
    color: '#765c4d',
  },
  category: {
    marginTop: 3,
    fontSize: 12,
    color: '#9a7765',
  },
});
