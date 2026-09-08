import { Pressable, StyleSheet, Text } from 'react-native';

export default function CategoryButton({ label, isSelected, onPress }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}
      onPress={onPress}
      style={[styles.button, isSelected && styles.selectedButton]}
    >
      <Text style={[styles.label, isSelected && styles.selectedLabel]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 82,
    height: 82,
    borderRadius: 41,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1e8dc',
    marginRight: 12,
  },
  selectedButton: {
    backgroundColor: '#d97745',
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