import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { en } from '../data/locales/en';
import { es } from '../data/locales/es';
import spanishIngredientNames from '../data/ingredientNames.es.json';

const LANGUAGE_STORAGE_KEY = 'pantrypal.language';
const supportedLanguages = new Set(['en', 'es']);
const dictionaries = { en, es };
const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguageValue] = useState('en');
  const [isLanguageReady, setIsLanguageReady] = useState(false);
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const hasUserSelectedLanguage = useRef(false);

  useEffect(() => {
    let isMounted = true;

    AsyncStorage.getItem(LANGUAGE_STORAGE_KEY)
      .then((savedLanguage) => {
        if (
          isMounted &&
          !hasUserSelectedLanguage.current &&
          supportedLanguages.has(savedLanguage)
        ) {
          setLanguageValue(savedLanguage);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setIsLanguageReady(true);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const setLanguage = useCallback(async (nextLanguage) => {
    if (!supportedLanguages.has(nextLanguage)) return;
    hasUserSelectedLanguage.current = true;
    setLanguageValue(nextLanguage);
    try {
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage);
    } catch {
      // Keep the in-memory selection active if local persistence is unavailable.
    }
  }, []);

  const t = useCallback((key, params = {}) => {
    const template = dictionaries[language]?.[key] ?? dictionaries.en[key] ?? key;
    return String(template).replace(/\{(\w+)\}/g, (match, name) =>
      params[name] === undefined ? match : String(params[name])
    );
  }, [language]);

  const localizeCategory = useCallback((category) => {
    const key = `category.${category}`;
    return dictionaries[language]?.[key] ?? dictionaries.en[key] ?? category;
  }, [language]);

  const localizeIngredient = useCallback((ingredient) => {
    if (language === 'es') {
      return spanishIngredientNames[ingredient] ?? ingredient;
    }
    const key = `ingredient.${ingredient}`;
    return dictionaries[language]?.[key] ?? dictionaries.en[key] ?? ingredient;
  }, [language]);

  const value = useMemo(() => ({
    language,
    setLanguage,
    isLanguageReady,
    isSettingsVisible,
    openLanguageSettings: () => setIsSettingsVisible(true),
    closeLanguageSettings: () => setIsSettingsVisible(false),
    t,
    localizeCategory,
    localizeIngredient,
  }), [language, setLanguage, isLanguageReady, isSettingsVisible, t, localizeCategory, localizeIngredient]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider.');
  return context;
}
