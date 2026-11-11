import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
} from 'react-native';
import { useLanguage } from '../context/LanguageContext';
import { localizeRecipe } from '../data/recipes';

export default function RecipeRecommendationsStrip({ recommendations, onSelectRecipe }) {
  const [isOpen, setIsOpen] = useState(false);
  const { width: viewportWidth } = useWindowDimensions();
  const { language, t } = useLanguage();
  const panelProgress = useRef(new Animated.Value(0)).current;
  const recipes = [...new Map(
    Object.values(recommendations)
      .flat()
      .map((recipe) => [String(recipe.id), recipe])
  ).values()];

  useEffect(() => {
    if (!isOpen) {
      panelProgress.setValue(0);
      return undefined;
    }

    const animation = Animated.timing(panelProgress, {
      toValue: 1,
      duration: 220,
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [isOpen, panelProgress]);

  return (
    <>
      {isOpen ? (
        <Animated.View
          style={[
            styles.panel,
            {
              width: viewportWidth,
              transform: [{
                translateX: panelProgress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [viewportWidth, 0],
                }),
              }],
            },
          ]}
        >
          {recipes.length > 0 ? (
            <ScrollView
              horizontal
              nestedScrollEnabled
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.cards}
            >
              {recipes.map((recipe) => {
                const displayRecipe = localizeRecipe(recipe, language);
                return (
                  <Pressable
                    key={recipe.id}
                    accessibilityRole="button"
                    accessibilityLabel={t('recipe.open', { title: displayRecipe.title })}
                    style={styles.card}
                    onPress={() => onSelectRecipe(recipe)}
                  >
                    <Image source={{ uri: displayRecipe.image }} style={styles.image} />
                    <Text numberOfLines={2} style={styles.title}>
                      {displayRecipe.title}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          ) : (
            <Text style={styles.emptyMessage}>{t('recommendations.empty')}</Text>
          )}
        </Animated.View>
      ) : null}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t(isOpen ? 'recommendations.close' : 'recommendations.open')}
        accessibilityState={{ expanded: isOpen }}
        style={[
          styles.sideTab,
          isOpen && styles.sideTabAttached,
        ]}
        onPress={() => setIsOpen((open) => !open)}
      >
        <Text accessible={false} style={styles.sideTabArrow}>
          {isOpen ? '\u203a' : '\u2039'}
        </Text>
        <Text style={styles.sideTabText}>{t('recommendations.title')}</Text>
      </Pressable>
    </>
  );
}

const styles = StyleSheet.create({
  panel: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    zIndex: 21,
    height: 190,
    paddingVertical: 8,
    borderRadius: 12,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    paddingRight: 44,
    backgroundColor: '#fff',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
  },
  cards: {
    paddingHorizontal: 10,
  },
  emptyMessage: {
    paddingHorizontal: 10,
    paddingBottom: 4,
    color: '#765c4d',
    fontSize: 12,
  },
  card: {
    width: 144,
    marginRight: 12,
  },
  image: {
    width: '100%',
    height: 142,
    borderRadius: 8,
    backgroundColor: '#e9dfd8',
  },
  title: {
    marginTop: 4,
    color: '#4f3b31',
    fontSize: 10,
    fontWeight: '600',
    lineHeight: 13,
  },
  sideTab: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    zIndex: 22,
    width: 40,
    height: 184,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    backgroundColor: '#4f2e1f',
    elevation: 22,
  },
  sideTabAttached: {
    width: 40,
    height: 190,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },
  sideTabText: {
    position: 'absolute',
    top: 94,
    left: -41,
    width: 136,
    height: 30,
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    textAlignVertical: 'center',
    transform: [{ rotate: '-90deg' }],
  },
  sideTabArrow: {
    position: 'absolute',
    left: 0,
    top: '50%',
    width: 14,
    marginTop: -12,
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
});
