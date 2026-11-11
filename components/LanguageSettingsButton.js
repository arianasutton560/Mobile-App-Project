import { Image, Pressable, StyleSheet } from 'react-native';
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
      <Image
        accessible={false}
        source={require('../images/categories/gear.png')}
        style={styles.icon}
        resizeMode="contain"
      />
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
    width: 28,
    height: 28,
  },
});
