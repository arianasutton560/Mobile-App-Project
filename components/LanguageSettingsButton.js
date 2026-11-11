import { Pressable, StyleSheet, Text } from 'react-native';
import { useLanguage } from '../context/LanguageContext';

export default function LanguageSettingsButton() {
  const { openLanguageSettings, t } = useLanguage();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('settings.accessibility')}
      hitSlop={10}
      onPress={openLanguageSettings}
      style={styles.button}
    >
      <Text accessible={false} style={styles.icon}>⚙</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    color: '#4f2e1f',
    fontSize: 27,
  },
});
