import {DarkTheme, DefaultTheme, Theme, ThemeProvider} from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { ClerkProvider, ClerkLoaded, useAuth } from '@clerk/clerk-expo'
import { Slot } from 'expo-router'
import * as SecureStore from 'expo-secure-store'
import "../global.css";
import { PaperProvider } from 'react-native-paper';
import {NAV_THEME} from "~/lib/constants";
import {useColorScheme} from "~/lib/useColorScheme";
import {Platform, TouchableOpacity, View} from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import * as React from 'react';
import {PortalHost} from "@rn-primitives/portal";
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const LIGHT_THEME: Theme = {
  dark: false,
  colors: NAV_THEME.light,
};
const DARK_THEME: Theme = {
  dark: true,
  colors: NAV_THEME.dark,
};



export default function RootLayout() {
  const { colorScheme, setColorScheme, isDarkColorScheme } = useColorScheme();
  const [isColorSchemeLoaded, setIsColorSchemeLoaded] = React.useState(false);

  useEffect(() => {
    (async () => {
      const theme = await AsyncStorage.getItem('theme');
      if (Platform.OS === 'web') {
        // Adds the background color to the html element to prevent white background on overscroll.
        document.documentElement.classList.add('bg-background');
      }
      if (!theme) {
        AsyncStorage.setItem('theme', colorScheme);
        setIsColorSchemeLoaded(true);
        return;
      }
      const colorTheme = theme === 'dark' ? 'dark' : 'light';
      if (colorTheme !== colorScheme) {
        setColorScheme(colorTheme);

        setIsColorSchemeLoaded(true);
        return;
      }
      setIsColorSchemeLoaded(true);
    })().finally(() => {
      SplashScreen.hideAsync();
    });
  }, []);

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

  if (!isColorSchemeLoaded) {
    return null;
  }

    // Wrap the useAuth hook inside ClerkProvider to ensure it's used correctly
    const AuthComponent = () => {
      const { signOut, sessionId, getToken, isSignedIn } = useAuth();
  
      const handleSignOut = async () => {
        try {
          await signOut();
        } catch (error) {
          console.error('Sign Out Error:', error);
        }
      };
  
      return (
        <PaperProvider>
          <ThemeProvider value={isDarkColorScheme ? DARK_THEME : LIGHT_THEME}>
            <StatusBar style={isDarkColorScheme ? 'light' : 'dark'} />
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen
                name="(home)"
                options={{
                  headerShown: true,
                  headerTitle: '',
                  headerTransparent: true,
                  headerLeft: () => ( isSignedIn ? (
                    <View className="ml-5">
                      <FontAwesome5
                        name="sign-out-alt"
                        size={24}
                        color="white"
                        onPress={handleSignOut}
                      />
                    </View>) : null)
                }}
              />
            </Stack>
            <PortalHost />
          </ThemeProvider>
        </PaperProvider>
      );
    };

  return (
      <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
        <ClerkLoaded>
          <AuthComponent />
        </ClerkLoaded>
      </ClerkProvider>
  );
}

