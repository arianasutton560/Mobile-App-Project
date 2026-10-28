import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { getRecipeDetails } from '../data/recipes';

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
  const { recipe } = route.params;
  const [recipeDetails, setRecipeDetails] = useState(recipe);
  const [isLoading, setIsLoading] = useState(true);
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
