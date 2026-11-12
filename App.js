import { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LanguageSettingsButton from './components/LanguageSettingsButton';
import LanguageSettingsModal from './components/LanguageSettingsModal';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import Home from './screens/Home';
import Favorites from './screens/Favorites';
import RecipeDetails from './screens/RecipeDetails';
import WhatCanIMake from './screens/WhatCanIMake';
import CookMode from './screens/CookMode';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <LanguageProvider>
      <AppNavigation />
    </LanguageProvider>
  );
}

function AppNavigation() {
  const [favoriteIds, setFavoriteIds] = useState([]);
  const { language } = useLanguage();

  function toggleFavorite(recipeId) {
    setFavoriteIds((currentIds) => currentIds.includes(recipeId)
      ? currentIds.filter((id) => id !== recipeId)
      : [...currentIds, recipeId]);
  }

  return (
    <>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Home" options={{ headerShown: false }}>
            {(props) => (
              <Home
                {...props}
                favoriteIds={favoriteIds}
                onToggleFavorite={toggleFavorite}
              />
            )}
          </Stack.Screen>
          <Stack.Screen
            name="Favorites"
            options={{
              title: language === 'es' ? 'Favoritos' : 'Favorites',
              headerBackTitle: language === 'es' ? 'Inicio' : 'Home',
              headerRight: () => <LanguageSettingsButton />,
            }}
          >
            {(props) => (
              <Favorites
                {...props}
                favoriteIds={favoriteIds}
                onToggleFavorite={toggleFavorite}
              />
            )}
          </Stack.Screen>
          <Stack.Screen
            name="RecipeDetails"
            component={RecipeDetails}
            options={{
              title: language === 'es' ? 'Detalles de la receta' : 'Recipe Details',
              headerBackTitle: language === 'es' ? 'Inicio' : 'Home',
              headerRight: () => <LanguageSettingsButton />,
            }}
          />
          <Stack.Screen
            name="CookMode"
            component={CookMode}
            options={{
              title: language === 'es' ? 'Modo de cocina' : 'Cook Mode',
              headerBackTitle: language === 'es' ? 'Receta' : 'Recipe',
              headerRight: () => <LanguageSettingsButton />,
            }}
          />
          <Stack.Screen
            name="WhatCanIMake"
            options={{
              title: language === 'es' ? '¿Qué puedo preparar?' : 'What Can I Make?',
              headerBackTitle: language === 'es' ? 'Inicio' : 'Home',
              headerRight: () => <LanguageSettingsButton />,
            }}
          >
            {(props) => (
              <WhatCanIMake
                {...props}
                favoriteIds={favoriteIds}
                onToggleFavorite={toggleFavorite}
              />
            )}
          </Stack.Screen>
        </Stack.Navigator>
      </NavigationContainer>
      <LanguageSettingsModal />
    </>
  );
}
