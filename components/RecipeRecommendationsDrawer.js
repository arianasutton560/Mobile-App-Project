import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function RecommendationGroup({ title, recipes, onSelectRecipe }) {
  if (recipes.length === 0) return null;

  return (
    <View style={styles.group}>
      <Text style={styles.groupTitle}>{title}</Text>
      {recipes.map((recipe) => (
        <Pressable
          key={recipe.id}
          accessibilityRole="button"
          accessibilityLabel={`Open ${recipe.title}`}
          style={styles.recipeCard}
          onPress={() => onSelectRecipe(recipe)}
        >
          <Image source={{ uri: recipe.image }} style={styles.recipeImage} />
          <Text numberOfLines={2} style={styles.recipeTitle}>
            {recipe.title}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const groupOptions = [
  { key: 'dinners', title: 'Dinner ideas' },
  { key: 'lunches', title: 'Lunch ideas' },
  { key: 'breakfasts', title: 'Breakfast dishes' },
  { key: 'desserts', title: 'Desserts' },
  { key: 'sides', title: 'Sides to try' },
  { key: 'drinks', title: 'Drinks to pair' },
];

export default function RecipeRecommendationsDrawer({
  selectedRecipe,
  recommendations,
  onSelectRecipe,
}) {
  const [isVisible, setIsVisible] = useState(false);
  const { width: viewportWidth } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const drawerWidth = Math.min(viewportWidth * 0.88, 420);
  const translateX = useRef(new Animated.Value(drawerWidth)).current;
  const isClosing = useRef(false);
  const recommendationGroups = groupOptions.filter(({ key }) =>
    recommendations[key].length > 0
  );
  const hasRecommendations = recommendationGroups.length > 0;

  useEffect(() => {
    if (!isVisible) {
      translateX.setValue(drawerWidth);
      return undefined;
    }

    translateX.setValue(drawerWidth);
    const animation = Animated.timing(translateX, {
      toValue: 0,
      duration: 240,
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [drawerWidth, isVisible, translateX]);

  function closeDrawer(afterClose) {
    if (isClosing.current) return;
    isClosing.current = true;
    Animated.timing(translateX, {
      toValue: drawerWidth,
      duration: 200,
      useNativeDriver: true,
    }).start(({ finished }) => {
      isClosing.current = false;
      if (!finished) return;
      setIsVisible(false);
      afterClose?.();
    });
  }

  if (!hasRecommendations) return null;

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Show recipe recommendations"
        style={styles.sideTab}
        onPress={() => setIsVisible(true)}
      >
        <Text accessible={false} style={styles.sideTabArrow}>
          ‹
        </Text>
        <Text style={styles.sideTabText}>Recommendations</Text>
      </Pressable>

      <Modal
        visible={isVisible}
        transparent
        animationType="none"
        statusBarTranslucent
        onRequestClose={() => closeDrawer()}
      >
        <View style={styles.modalRoot}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close recipe recommendations"
            style={styles.backdrop}
            onPress={() => closeDrawer()}
          />
          <Animated.View
            style={[
              styles.drawer,
              {
                width: drawerWidth,
                paddingTop: insets.top + 16,
                paddingBottom: insets.bottom + 16,
                transform: [{ translateX }],
              },
            ]}
          >
            <View style={styles.drawerHeader}>
              <View style={styles.drawerTitleBlock}>
                <Text style={styles.drawerTitle}>Pair it with</Text>
                <Text style={styles.drawerSubtitle}>
                  Recipes that go well with this one
                </Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close recipe recommendations"
                hitSlop={10}
                onPress={() => closeDrawer()}
              >
                <Text style={styles.closeButton}>×</Text>
              </Pressable>
            </View>
            <ScrollView
              style={styles.drawerScroll}
              contentContainerStyle={styles.drawerContent}
            >
              <View style={styles.selectedRecipe}>
                <Text style={styles.selectedRecipeLabel}>For this recipe</Text>
                <Image
                  source={{ uri: selectedRecipe.image }}
                  style={styles.selectedRecipeImage}
                />
                <Text numberOfLines={2} style={styles.selectedRecipeTitle}>
                  {selectedRecipe.title}
                </Text>
              </View>
              {recommendationGroups.map(({ key, title }) => (
                <RecommendationGroup
                  key={key}
                  title={title}
                  recipes={recommendations[key]}
                  onSelectRecipe={(recipe) =>
                    closeDrawer(() => onSelectRecipe(recipe))
                  }
                />
              ))}
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  sideTab: {
    position: 'absolute',
    top: '42%',
    right: 0,
    zIndex: 2,
    width: 44,
    height: 164,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    backgroundColor: '#4f2e1f',
    elevation: 6,
  },
  sideTabText: {
    position: 'absolute',
    top: 67,
    left: -39,
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
  modalRoot: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(25, 18, 14, 0.45)',
  },
  drawer: {
    height: '100%',
    paddingHorizontal: 18,
    backgroundColor: '#fff',
    elevation: 18,
    shadowColor: '#000',
    shadowOffset: { width: -4, height: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ded7d2',
  },
  drawerTitleBlock: {
    flex: 1,
  },
  drawerTitle: {
    color: '#3d2b22',
    fontSize: 22,
    fontWeight: '700',
  },
  drawerSubtitle: {
    marginTop: 4,
    color: '#765c4d',
    fontSize: 14,
  },
  closeButton: {
    marginLeft: 12,
    color: '#765c4d',
    fontSize: 28,
    lineHeight: 30,
  },
  drawerScroll: {
    flex: 1,
  },
  drawerContent: {
    paddingBottom: 20,
  },
  selectedRecipe: {
    marginTop: 16,
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#f8f5f2',
  },
  selectedRecipeLabel: {
    marginBottom: 8,
    color: '#765c4d',
    fontSize: 13,
    fontWeight: '600',
  },
  selectedRecipeImage: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 9,
    backgroundColor: '#e9dfd8',
  },
  selectedRecipeTitle: {
    marginTop: 8,
    color: '#4f3b31',
    fontSize: 16,
    fontWeight: '700',
  },
  group: {
    marginTop: 20,
  },
  groupTitle: {
    marginBottom: 10,
    color: '#4f2e1f',
    fontSize: 17,
    fontWeight: '700',
  },
  recipeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#f8f5f2',
  },
  recipeImage: {
    width: 64,
    height: 64,
    borderRadius: 9,
    backgroundColor: '#e9dfd8',
  },
  recipeTitle: {
    flex: 1,
    marginLeft: 12,
    color: '#4f3b31',
    fontSize: 15,
    fontWeight: '600',
  },
});
