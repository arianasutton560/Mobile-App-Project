import { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Home from './screens/Home';
import Favorites from './screens/Favorites';
import RecipeDetails from './screens/RecipeDetails';
import WhatCanIMake from './screens/WhatCanIMake';

const Stack = createNativeStackNavigator();

export default function App() {
  const [favoriteIds, setFavoriteIds] = useState([]);

  function toggleFavorite(recipeId) {
    setFavoriteIds((currentIds) => currentIds.includes(recipeId) ? 
    currentIds.filter((id) => id !== recipeId) : 
    [...currentIds, recipeId]
  );
}

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" options={{ headerShown: false}}>
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
        options={{ title: 'Favorites' }}>
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
          options={{ title: 'Recipe Details' }}
        />
        <Stack.Screen
          name="WhatCanIMake"
          options={{ title: 'What Can I Make?' }}
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
  );
}
