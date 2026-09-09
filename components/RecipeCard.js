import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

export default function RecipeCard({ recipe, onPress }) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <Image source={{ uri: recipe.image }} style={styles.image} />

      <View style={styles.content}>
        <Text numberOfLines={2} style={styles.title}>
          {recipe.title}
        </Text>
        <Text style={styles.meta}>{recipe.time}</Text>
        <Text style={styles.category}>{recipe.category}</Text>
      </View>
    </Pressable>
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
  content: {
    padding: 10,
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