import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useLanguage } from '../context/LanguageContext';

export default function LanguageSettingsModal() {
  const {
    language,
    setLanguage,
    isSettingsVisible,
    closeLanguageSettings,
    t,
  } = useLanguage();

  function chooseLanguage(nextLanguage) {
    void setLanguage(nextLanguage);
    closeLanguageSettings();
  }

  return (
    <Modal
      visible={isSettingsVisible}
      transparent
      animationType="fade"
      onRequestClose={closeLanguageSettings}
    >
      <View style={styles.backdrop}>
        <View style={styles.dialog} accessibilityViewIsModal>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{t('settings.title')}</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('settings.close')}
              hitSlop={10}
              onPress={closeLanguageSettings}
            >
              <Text style={styles.close}>×</Text>
            </Pressable>
          </View>
          <Text style={styles.description}>{t('settings.description')}</Text>
          {[
            ['en', t('settings.english')],
            ['es', t('settings.spanish')],
          ].map(([value, label]) => {
            const selected = language === value;
            return (
              <Pressable
                key={value}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                onPress={() => chooseLanguage(value)}
                style={[styles.option, selected && styles.selectedOption]}
              >
                <Text style={[styles.optionText, selected && styles.selectedOptionText]}>
                  {label}
                </Text>
                <Text style={[styles.check, selected && styles.selectedOptionText]}>
                  {selected ? '✓' : ''}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.38)',
  },
  dialog: {
    width: '100%',
    maxWidth: 380,
    padding: 22,
    borderRadius: 18,
    backgroundColor: '#fff',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    color: '#3c281e',
    fontSize: 23,
    fontWeight: '700',
  },
  close: {
    color: '#765c4d',
    fontSize: 30,
    lineHeight: 32,
  },
  description: {
    marginTop: 6,
    marginBottom: 16,
    color: '#765c4d',
    fontSize: 14,
  },
  option: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e7ddd6',
    marginTop: 9,
  },
  selectedOption: {
    borderColor: '#4f2e1f',
    backgroundColor: '#f8f3ef',
  },
  optionText: {
    color: '#4f3b31',
    fontSize: 17,
    fontWeight: '600',
  },
  selectedOptionText: {
    color: '#4f2e1f',
  },
  check: {
    minWidth: 22,
    color: '#4f2e1f',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
});
