import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { ingredientMatches } from '../data/ingredientMatching';
import { getRecipeDetails } from '../data/recipes';

const nutritionRows = [
  ['calories', 'Calories'],
  ['fatContent', 'Fat'],
  ['saturatedFatContent', 'Saturated fat'],
  ['transFatContent', 'Trans fat'],
  ['cholesterolContent', 'Cholesterol'],
  ['sodiumContent', 'Sodium'],
  ['carbohydrateContent', 'Carbohydrates'],
  ['fiberContent', 'Fiber'],
  ['sugarContent', 'Sugar'],
  ['proteinContent', 'Protein'],
  ['vitaminDContent', 'Vitamin D'],
  ['calciumContent', 'Calcium'],
  ['ironContent', 'Iron'],
  ['potassiumContent', 'Potassium'],
];

function formatNutritionValue(key, value) {
  if (key === 'calories') {
    return String(value).replace(/\s*calories?\s*$/i, '').trim();
  }
  return String(value);
}

function formatServings(servings) {
  return String(servings || '').replace(/\s*servings?\s*$/i, '').replace(/\s*serving\(s\)\s*$/i, '').trim();
}

function getPlayableVideo(video) {
  if (/\.(mp4|m4v|mov|webm|m3u8|mpd)(?:$|[?#])/i.test(video.url || '')) {
    return video.url;
  }

  // Older scraper output saved the recipe page URL. Delish's video poster URL
  // contains the media ID needed to rebuild its direct MP4 stream URL.
  if (/www\.delish\.com$/i.test(new URL(video.url).hostname)) {
    const videoId = video.thumbnailUrl?.match(/\/vidthumb\/([\da-f-]{36})\//i)?.[1];
    if (videoId) {
      return `https://mos-streaming.hearst.io/${videoId}/video_9x16_1080p_h264_hd.mp4`;
    }
  }

  return null;
}

function RecipeVideoPlayer({ video, title }) {
  const player = useVideoPlayer(video.url, (videoPlayer) => {
    videoPlayer.loop = false;
  });

  return (
    <View style={styles.videoCard}>
      <VideoView
        player={player}
        style={styles.videoPlayer}
        contentFit="contain"
        nativeControls
      />
      {title ? <Text style={styles.videoTitle}>{title}</Text> : null}
    </View>
  );
}

export default function RecipeDetails({ route }) {
  const { recipe, highlightedIngredients = [] } = route.params;
  const [recipeDetails, setRecipeDetails] = useState(recipe);
  const [isLoading, setIsLoading] = useState(true);
  const [isNutritionVisible, setIsNutritionVisible] = useState(false);
  const nutrition = recipeDetails.nutrition;
  const nutritionEntries = nutritionRows.filter(([key]) => nutrition?.[key]);
  const playableVideos = (recipeDetails.videos ?? []).flatMap((video) => {
    try {
      const url = getPlayableVideo(video);
      return url ? [{ ...video, url }] : [];
    } catch {
      return [];
    }
  });

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

      {playableVideos.length > 0 && (
        <View>
          <Text style={styles.heading}>Recipe video</Text>
          {playableVideos.map((video, index) => (
            <RecipeVideoPlayer
              key={`${video.url}-${index}`}
              video={video}
              title={video.title || (playableVideos.length > 1 ? `Recipe video ${index + 1}` : 'Watch recipe video')}
            />
          ))}
        </View>
      )}

      <Text style={styles.heading}>Ingredients</Text>
      {recipeDetails.ingredients?.map((ingredient, index) => {
        const isHighlighted = highlightedIngredients.some((selectedIngredient) =>
          ingredientMatches(ingredient, selectedIngredient)
        );

        return (
          <View
            key={`${index}-${ingredient}`}
            style={[
              styles.ingredientRow,
              isHighlighted && styles.highlightedIngredientRow,
            ]}
          >
            <Text style={styles.bullet}>•</Text>
            <Text
              style={[
                styles.ingredient,
                isHighlighted && styles.highlightedIngredient,
              ]}
            >
              {ingredient}
            </Text>
          </View>
        );
      })}

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
        {nutrition?.calories ? (
          <View style={styles.nutritionSummary}>
            <View style={styles.nutritionSummaryText}>
              <Text style={styles.infoLabel}>Calories per serving</Text>
              <Text style={styles.calorieValue}>{nutrition.calories}</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Show nutrition information"
              style={styles.nutritionButton}
              onPress={() => setIsNutritionVisible(true)}
            >
              <Text style={styles.nutritionButtonText}>Nutrition details</Text>
            </Pressable>
          </View>
        ) : null}
      </View>

      <Modal
        visible={isNutritionVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsNutritionVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.nutritionModal}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleBlock}>
                <Text style={styles.modalTitle}>Nutrition Information</Text>
                <Text style={styles.modalSubtitle}>
                  Per serving
                  {recipeDetails.servings ? ` (Serves ${formatServings(recipeDetails.servings)})` : ''}
                </Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close nutrition information"
                hitSlop={10}
                onPress={() => setIsNutritionVisible(false)}
              >
                <Text style={styles.closeButton}>×</Text>
              </Pressable>
            </View>
            <ScrollView>
              {nutritionEntries.map(([key, label]) => (
                <View style={styles.nutritionRow} key={key}>
                  <Text style={styles.nutritionLabel}>{label}</Text>
                  <Text style={styles.nutritionValue}>
                    {formatNutritionValue(key, nutrition[key])}
                    {key === 'calories' ? ' calories' : ''}
                  </Text>
                </View>
              ))}
              {nutrition?.servingSize ? (
                <Text style={styles.servingSize}>Serving size: {nutrition.servingSize}</Text>
              ) : null}
            </ScrollView>
          </View>
        </View>
      </Modal>

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
  videoCard: {
    marginBottom: 10,
    overflow: 'hidden',
    borderWidth: 4,
    borderColor: '#4f2e1f',
    borderRadius: 12,
    backgroundColor: '#f8f5f2',
  },
  videoPlayer: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#1f1f1f',
  },
  videoTitle: {
    padding: 14,
    color: '#4f3b31',
    fontSize: 16,
    fontWeight: '600',
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
  highlightedIngredientRow: {
    marginHorizontal: -8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#fff1e8',
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
  highlightedIngredient: {
    color: '#b84f1c',
    fontWeight: '700',
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
  nutritionSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#dccfc7',
  },
  nutritionSummaryText: {
    flex: 1,
  },
  calorieValue: {
    marginTop: 3,
    color: '#4f3b31',
    fontSize: 18,
    fontWeight: '700',
  },
  nutritionButton: {
    marginLeft: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 9,
    backgroundColor: '#4f2e1f',
  },
  nutritionButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: 'rgba(25, 18, 14, 0.45)',
  },
  nutritionModal: {
    width: '100%',
    maxHeight: '80%',
    alignSelf: 'center',
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  modalTitleBlock: {
    flex: 1,
  },
  modalTitle: {
    color: '#3d2b22',
    fontSize: 21,
    fontWeight: '700',
  },
  modalSubtitle: {
    marginTop: 4,
    color: '#765c4d',
  },
  closeButton: {
    marginLeft: 12,
    color: '#765c4d',
    fontSize: 28,
    lineHeight: 30,
  },
  nutritionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#d8d2ce',
  },
  nutritionLabel: {
    flex: 1,
    color: '#675f5b',
  },
  nutritionValue: {
    marginLeft: 12,
    color: '#4f4a47',
    textAlign: 'right',
  },
  servingSize: {
    marginTop: 10,
    color: '#765c4d',
    fontSize: 13,
  },
  instructions: {
    fontSize: 16,
    lineHeight: 24,
  },
});
