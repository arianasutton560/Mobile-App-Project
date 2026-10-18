import { Image, Pressable, StyleSheet, Text } from 'react-native';

export default function CategoryButton({
  label,
  image,
  isSelected,
  onPress,
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label} category`}
      accessibilityState={{ selected: isSelected }}
      onPress={onPress}
      style={[styles.button, isSelected && styles.selectedButton]}
    >
      <Image source={image} style={styles.image} />
      <Text style={[styles.label, isSelected && styles.selectedLabel]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 80,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: '#f1e8dc',
    marginRight: 10,
  },
  selectedButton: {
    backgroundColor: '#d97745',
  },
  image: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginBottom: 6,
  },
  label: {
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '600',
    color: '#4a3226',
  },
  selectedLabel: {
    color: '#fff',
  },
});
