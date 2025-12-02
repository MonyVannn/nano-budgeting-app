import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  DarkTheme,
  ThemeProvider as NavigationThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import * as NavigationBar from "expo-navigation-bar";
import { router, Stack, usePathname, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useRef, useState } from "react";
import { InteractionManager, Platform } from "react-native";
import "react-native-reanimated";

import { ThemeProvider, useTheme } from "@/constants/ThemeContext";
import { useAuthStore, useCategoryStore } from "@/store";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
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
  const { theme, themeMode } = useTheme();
  const pathname = usePathname();
  const segments = useSegments();
  const rootSegment = segments?.[0];
  const isAuthRoute = useMemo(() => {
    if (!pathname) return false;
    if (rootSegment === "(auth)") return true;
    return pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up");
  }, [pathname, rootSegment]);
  const isTabsRoute = useMemo(() => {
    if (!pathname) return false;
    return (
      rootSegment === "(tabs)" ||
      pathname.startsWith("/(tabs)") ||
      pathname === "/"
    );
  }, [pathname, rootSegment]);
  const isOnboardingRoute = useMemo(() => {
    if (!pathname) return false;
    if (rootSegment === "(onboarding)") return true;
    return (
      pathname.includes("onboarding") ||
      pathname.startsWith("/select-categories") ||
      pathname.startsWith("/allocate-budget")
    );
  }, [pathname, rootSegment]);
  const { user, session } = useAuthStore();
  const {
    categories,
    fetchCategories,
    isLoading: categoriesLoading,
    clearCategories,
  } = useCategoryStore();
  const expenseCategoryCount = useMemo(
    () => categories.filter((cat) => cat.type === "expense").length,
    [categories]
  );
  const [hasCheckedOnboarding, setHasCheckedOnboarding] = useState(false);
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(false);

  // Track previous user ID to detect user changes
  const [previousUserId, setPreviousUserId] = useState<string | undefined>(
    undefined
  );

  // Track navigation attempts to prevent multiple navigations
  const navigationAttemptRef = useRef<number>(0);
  const lastNavigationRef = useRef<string | null>(null);

  // Check if user needs onboarding (has no categories)
  useEffect(() => {
    // Reset onboarding check when user changes
    if (user?.id !== previousUserId) {
      setHasCheckedOnboarding(false);
      setIsCheckingOnboarding(false);
      setPreviousUserId(user?.id);
      // Clear categories when user changes to prevent stale data
      clearCategories();
      // Reset navigation tracking when user changes
      lastNavigationRef.current = null;
      navigationAttemptRef.current = 0;
    }

    // Only check onboarding if we have a user, aren't already checking, and categories aren't loading
    // Also ensure we haven't already checked for this user
    if (
      user?.id &&
      !isCheckingOnboarding &&
      !categoriesLoading &&
      !hasCheckedOnboarding
    ) {
      setIsCheckingOnboarding(true);
      fetchCategories(user.id)
        .then(() => {
          // Ensure categories are loaded before marking as checked
          // Categories are now in the store, navigation effect will pick them up
          setHasCheckedOnboarding(true);
        })
        .catch((error) => {
          console.error("Error checking onboarding:", error);
          // Set to true even on error to prevent infinite loop, but navigation will use empty categories
          setHasCheckedOnboarding(true);
        })
        .finally(() => {
          setIsCheckingOnboarding(false);
        });
    } else if (!user?.id) {
      // Reset when user logs out
      setHasCheckedOnboarding(false);
      setIsCheckingOnboarding(false);
      setPreviousUserId(undefined);
    }
  }, [
    user?.id,
    previousUserId,
    fetchCategories,
    categoriesLoading,
    isCheckingOnboarding,
    hasCheckedOnboarding,
    isAuthRoute,
    isTabsRoute,
    pathname,
  ]);

  // Handle navigation when auth state changes
  useEffect(() => {
    // Skip navigation checks if already in onboarding flow (let user complete it)
    // This includes both select-categories and allocate-budget screens
    if (isOnboardingRoute) {
      return; // Don't interfere with onboarding flow
    }

    if (!user || !session) {
      // User is signed out - navigate to sign-in screen
      // Always redirect if not in auth screens
      if (!isAuthRoute) {
        const timer = setTimeout(() => {
          router.replace("/(auth)/sign-in");
        }, 100);
        return () => clearTimeout(timer);
      }
      return;
    }

    // User is signed in - navigate based on categories
    // If we're already in tabs, don't navigate
    if (isTabsRoute) {
      return;
    }

    // Only navigate if we're on auth screen
    if (!isAuthRoute) {
      return;
    }

    // Wait for onboarding check to complete before navigating
    // This ensures categories are loaded before making navigation decisions
    if (!hasCheckedOnboarding || isCheckingOnboarding || categoriesLoading) {
      // Still set a timeout to prevent getting stuck if something goes wrong
      // Use longer timeout on Android
      const timeoutDuration = Platform.OS === "android" ? 4000 : 3000;
      const timeoutId = setTimeout(() => {
        // If we've been waiting too long, navigate based on current state
        const currentCategories = useCategoryStore.getState().categories;
        const currentExpenseCount = currentCategories.filter(
          (cat) => cat.type === "expense"
        ).length;

        const targetRoute =
          currentExpenseCount > 0
            ? "/(tabs)"
            : "/(onboarding)/select-categories";

        // Only navigate if we haven't already navigated to this route
        if (lastNavigationRef.current !== targetRoute) {
          lastNavigationRef.current = targetRoute;
          navigationAttemptRef.current += 1;

          // Use InteractionManager on Android for better timing
          if (Platform.OS === "android") {
            InteractionManager.runAfterInteractions(() => {
              router.replace(targetRoute as any);
            });
          } else {
            router.replace(targetRoute as any);
          }
        }
      }, timeoutDuration);
      return () => clearTimeout(timeoutId);
    }

    // Categories are loaded and onboarding check is complete - navigate based on result
    const targetRoute =
      expenseCategoryCount > 0 ? "/(tabs)" : "/(onboarding)/select-categories";

    // Only navigate if we haven't already navigated to this route
    if (lastNavigationRef.current === targetRoute) {
      return;
    }

    lastNavigationRef.current = targetRoute;
    navigationAttemptRef.current += 1;

    // Use longer delay on Android and InteractionManager for better reliability
    const delay = Platform.OS === "android" ? 300 : 100;

    let timeoutId: NodeJS.Timeout | null = null;
    let interactionHandle: any = null;

    const navigate = () => {
      router.replace(targetRoute as any);
    };

    if (Platform.OS === "android") {
      // On Android, use InteractionManager to ensure navigation happens after all interactions
      interactionHandle = InteractionManager.runAfterInteractions(() => {
        timeoutId = setTimeout(navigate, delay);
      });
    } else {
      // On iOS, simple timeout is sufficient
      timeoutId = setTimeout(navigate, delay);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      if (interactionHandle) {
        interactionHandle.cancel();
      }
    };
  }, [
    user?.id,
    session?.access_token,
    hasCheckedOnboarding,
    categoriesLoading,
    isCheckingOnboarding,
    expenseCategoryCount,
    categories.length, // Ensure effect runs when categories are loaded
    isAuthRoute,
    isTabsRoute,
    isOnboardingRoute,
  ]);

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

  // Configure Android navigation bar theme
  useEffect(() => {
    if (Platform.OS === "android") {
      NavigationBar.setBackgroundColorAsync(theme.background);
      NavigationBar.setButtonStyleAsync(
        themeMode === "light" ? "dark" : "light"
      );
    }
  }, [themeMode, theme.background]);

  return (
    <NavigationThemeProvider value={customTheme}>
      <StatusBar style={themeMode === "light" ? "dark" : "light"} />
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
        <Stack.Screen
          name="add-transaction"
          options={{
            presentation: "modal",
            headerShown: false,
            animation: "slide_from_bottom",
          }}
        />
        <Stack.Screen
          name="add-transaction-details"
          options={{
            presentation: "modal",
            headerShown: false,
            animation: "slide_from_bottom",
          }}
        />
        <Stack.Screen
          name="transaction-detail"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="edit-transaction"
          options={{
            presentation: "modal",
            headerShown: false,
            animation: "slide_from_bottom",
          }}
        />
        <Stack.Screen
          name="add-category"
          options={{
            presentation: "modal",
            headerShown: false,
            animation: "slide_from_bottom",
          }}
        />
        <Stack.Screen
          name="categories"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="category-detail"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="(onboarding)"
          options={{
            headerShown: false,
            presentation: "fullScreenModal",
          }}
        />
      </Stack>
    </NavigationThemeProvider>
  );
}
