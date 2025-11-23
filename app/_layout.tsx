import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  DarkTheme,
  ThemeProvider as NavigationThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { router, Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";

import { useColorScheme } from "@/components/useColorScheme";
import { ThemeProvider, useTheme } from "@/constants/ThemeContext";
import { useAuthStore } from "@/store";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary
} from "expo-router";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  // Don't set initialRouteName - let auth state determine the route
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  const { initialize, isInitialized } = useAuthStore();

  // Initialize auth on app start
  useEffect(() => {
    initialize();
  }, []);

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded && isInitialized) {
      SplashScreen.hideAsync();
    }
  }, [loaded, isInitialized]);

  if (!loaded || !isInitialized) {
    return null;
  }

  return (
    <ThemeProvider>
      <RootLayoutNav />
    </ThemeProvider>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { theme } = useTheme();
  const { user, session } = useAuthStore();


  // Handle navigation when auth state changes
  useEffect(() => {
    if (!user || !session) {
      // User is signed out - navigate to sign-in screen
      // Use setTimeout to ensure this runs after state updates
      const timer = setTimeout(() => {
        router.replace("/(auth)/sign-in");
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [user, session]);

  // Custom theme using current theme colors
  const customTheme = {
    ...DarkTheme,
    dark: theme === require("@/constants/Colors").DarkTheme,
    colors: {
      ...DarkTheme.colors,
      primary: theme.primary,
      background: theme.background,
      card: theme.backgroundDark,
      text: theme.text,
      border: theme.border,
      notification: theme.accent,
    },
  };

  return (
    <NavigationThemeProvider value={customTheme}>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.backgroundDark,
          },
          headerTintColor: theme.text,
          contentStyle: {
            backgroundColor: theme.background,
          },
        }}
      >
        {/* Always define all screens - Expo Router handles routing */}
        <Stack.Screen
          name="(auth)"
          options={{ headerShown: false, title: "" }}
        />
        <Stack.Screen
          name="(tabs)"
          options={{ headerShown: false, title: "" }}
        />
        <Stack.Screen name="modal" options={{ presentation: "modal" }} />
      </Stack>
    </NavigationThemeProvider>
  );
}
