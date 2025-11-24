import React, { useEffect, useRef } from "react";
import { usePathname, useSegments } from "expo-router";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

interface AnimatedTabScreenProps {
  children: React.ReactNode;
  screenIndex: number; // 0: Dashboard, 1: Transactions, 2: Categories, 3: Settings
}

export function AnimatedTabScreen({
  children,
  screenIndex,
}: AnimatedTabScreenProps) {
  const pathname = usePathname();
  const segments = useSegments();
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);
  const prevIndexRef = useRef<number | null>(null);
  const prevPathnameRef = useRef<string | null>(null);

  useEffect(() => {
    // Check if we're on a tab route (not a detail/modal route)
    // Tab routes are: /(tabs), /(tabs)/index, /(tabs)/transactions, /(tabs)/categories, /(tabs)/settings
    // Detail routes like /transaction-detail, /add-transaction, etc. should NOT be considered tab routes
    const isTabRoute = 
      (segments.length === 2 && segments[0] === "(tabs)" && 
       ["index", "transactions", "categories", "settings"].includes(segments[1])) ||
      pathname === "/(tabs)" ||
      pathname === "/(tabs)/" ||
      pathname === "/(tabs)/index" ||
      pathname === "/(tabs)/transactions" ||
      pathname === "/(tabs)/categories" ||
      pathname === "/(tabs)/settings";

    const prevIndex = prevIndexRef.current;
    const prevPathname = prevPathnameRef.current;
    
    // Only update tab index if we're on a tab route
    // If we're on a detail screen (like /transaction-detail), keep the previous tab index
    let currentIndex = prevIndex ?? screenIndex;
    
    if (isTabRoute) {
      // Determine current active tab index only for tab routes
      if (segments[1] === "transactions" || pathname === "/(tabs)/transactions") {
        currentIndex = 1;
      } else if (segments[1] === "categories" || pathname === "/(tabs)/categories") {
        currentIndex = 2;
      } else if (segments[1] === "settings" || pathname === "/(tabs)/settings") {
        currentIndex = 3;
      } else {
        currentIndex = 0; // Dashboard (index or /(tabs))
      }
      
      // Update the previous index only when we're on a tab route
      prevIndexRef.current = currentIndex;
    }
    
    // Always update pathname ref
    prevPathnameRef.current = pathname ?? null;
    
    // Only animate if:
    // 1. We're on a tab route AND
    // 2. The tab index actually changed AND
    // 3. The previous pathname was also a tab route (to avoid animating when coming back from detail)
    const prevWasTabRoute = prevPathname === null || 
      prevPathname === "/(tabs)" ||
      prevPathname === "/(tabs)/" ||
      prevPathname === "/(tabs)/index" ||
      prevPathname === "/(tabs)/transactions" ||
      prevPathname === "/(tabs)/categories" ||
      prevPathname === "/(tabs)/settings";
    
    const shouldAnimate = 
      isTabRoute && 
      prevIndex !== null && 
      prevIndex !== currentIndex &&
      prevWasTabRoute;

    // Calculate direction: positive = moving right (next tab), negative = moving left (prev tab)
    const direction = currentIndex - screenIndex;

    if (direction === 0) {
      // This is the active screen
      if (shouldAnimate) {
        // Just became active - slide in from the correct direction (reversed)
        const slideDirection = prevIndex < currentIndex ? 1 : -1; // Coming from left or right (reversed)
        translateX.value = slideDirection * 300; // Start off-screen
        opacity.value = 0;
        
        // Animate to center
        translateX.value = withTiming(0, {
          duration: 300,
          easing: Easing.bezier(0.4, 0.0, 0.2, 1),
        });
        opacity.value = withTiming(1, {
          duration: 300,
          easing: Easing.bezier(0.4, 0.0, 0.2, 1),
        });
      } else {
        // Already active or initial render or coming back from detail - no animation
        translateX.value = 0;
        opacity.value = 1;
      }
    } else {
      // This is not the active screen
      if (direction > 0) {
        // Active tab is to the right - slide this screen right (positive, reversed)
        translateX.value = withTiming(300, {
          duration: 300,
          easing: Easing.bezier(0.4, 0.0, 0.2, 1),
        });
      } else {
        // Active tab is to the left - slide this screen left (negative, reversed)
        translateX.value = withTiming(-300, {
          duration: 300,
          easing: Easing.bezier(0.4, 0.0, 0.2, 1),
        });
      }
      opacity.value = withTiming(0, {
        duration: 250,
        easing: Easing.bezier(0.4, 0.0, 0.2, 1),
      });
    }
  }, [pathname, segments, screenIndex]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[{ flex: 1 }, animatedStyle]}>
      {children}
    </Animated.View>
  );
}

