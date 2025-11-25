import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  DarkTheme,
  ThemeProvider as NavigationThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { router, Stack, usePathname, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useMemo, useState } from "react";
import "react-native-reanimated";

import { useColorScheme } from "@/components/useColorScheme";
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
  const colorScheme = useColorScheme();
  const { theme } = useTheme();
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
  const [hasCheckedOnboarding, setHasCheckedOnboarding] = useState(false);
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(false);

  // Track previous user ID to detect user changes
  const [previousUserId, setPreviousUserId] = useState<string | undefined>(
    undefined
  );

  // Check if user needs onboarding (has no categories)
  useEffect(() => {
    // Reset onboarding check when user changes
    if (user?.id !== previousUserId) {
      setHasCheckedOnboarding(false);
      setIsCheckingOnboarding(false);
      setPreviousUserId(user?.id);
      // Clear categories when user changes to prevent stale data
      clearCategories();
    }

    // Only check onboarding if we have a user, aren't already checking, and categories aren't loading
    if (user?.id && !isCheckingOnboarding && !categoriesLoading) {
      console.log("Starting onboarding check for user", user.id);
      setIsCheckingOnboarding(true);
      fetchCategories(user.id)
        .then(() => {
          console.log("Categories fetched successfully");
          // Ensure categories are loaded before marking as checked
          // Categories are now in the store, navigation effect will pick them up
          setHasCheckedOnboarding(true);

          // Trigger navigation immediately if we're on auth screen
          // Get fresh categories from store
          const currentCategories = useCategoryStore.getState().categories;
          console.log(
            "Categories in store after fetch:",
            currentCategories.length
          );

          console.log("Navigation check:", {
            isAuthRoute,
            isTabsRoute,
            pathname,
            categoriesCount: currentCategories.length,
          });

          if (isAuthRoute && !isTabsRoute) {
            if (currentCategories.length > 0) {
              console.log(
                "Direct navigation to tabs after categories loaded",
                currentCategories.length
              );
              setTimeout(() => {
                router.replace("/(tabs)");
              }, 100);
            } else {
              console.log("Direct navigation to onboarding after check");
              setTimeout(() => {
                router.replace("/(onboarding)/select-categories" as any);
              }, 100);
            }
          } else {
            console.log("Not navigating - conditions not met", {
              isAuthRoute,
              isTabsRoute,
              pathname,
            });
          }
        })
        .catch((error) => {
          console.error("Error checking onboarding:", error);
          // Set to true even on error to prevent infinite loop, but navigation will use empty categories
          setHasCheckedOnboarding(true);

          // Still try to navigate on error
          if (isAuthRoute && !isTabsRoute) {
            console.log("Error occurred, navigating to onboarding");
            setTimeout(() => {
              router.replace("/(onboarding)/select-categories" as any);
            }, 100);
          }
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

    // If categories are loaded and we're on auth screen, navigate immediately
    // This handles existing users - don't wait for onboarding check
    if (categories.length > 0 && isAuthRoute && !isTabsRoute) {
      console.log("Navigating to tabs - categories loaded", categories.length);
      const timer = setTimeout(() => {
        router.replace("/(tabs)");
      }, 100);
      return () => clearTimeout(timer);
    }

    // If no categories yet, wait for onboarding check but with timeout
    if (categories.length === 0 && isAuthRoute && !isTabsRoute) {
      if (isCheckingOnboarding || categoriesLoading || !hasCheckedOnboarding) {
        console.log("Waiting for categories to load", {
          isCheckingOnboarding,
          categoriesLoading,
          hasCheckedOnboarding,
        });
        // Set timeout to prevent getting stuck
        const timeoutId = setTimeout(() => {
          console.log("Timeout - navigating to onboarding");
          router.replace("/(onboarding)/select-categories" as any);
        }, 2000);
        return () => clearTimeout(timeoutId);
      }

      // Check complete and still no categories - go to onboarding
      console.log("No categories found - navigating to onboarding");
      const timer = setTimeout(() => {
        router.replace("/(onboarding)/select-categories" as any);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [
    user?.id,
    session?.access_token,
    hasCheckedOnboarding,
    categoriesLoading,
    isCheckingOnboarding,
    categories.length,
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
