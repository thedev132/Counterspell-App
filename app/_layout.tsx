import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { ClerkProvider, ClerkLoaded } from '@clerk/clerk-expo'
import { Slot } from 'expo-router'
import * as SecureStore from 'expo-secure-store'
import "../global.css";
import { PaperProvider } from 'react-native-paper';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });


  const tokenCache = {
    async getToken(key: string) {
      try {
        const item = await SecureStore.getItemAsync(key)
        if (item) {
          console.log(`${key} was used 🔐 \n`)
        } else {
          console.log('No values stored under key: ' + key)
        }
        return item
      } catch (error) {
        console.error('SecureStore get item error: ', error)
        await SecureStore.deleteItemAsync(key)
        return null
      }
    },
    async saveToken(key: string, value: string) {
      try {
        return SecureStore.setItemAsync(key, value)
      } catch (err) {
        return
      }
    },
  }

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <PaperProvider>
      <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
        <ClerkLoaded>
          <Slot />
        </ClerkLoaded>
      </ClerkProvider>
    </PaperProvider>
  );
}
