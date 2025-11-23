import { usePathname } from "expo-router";
import React, { useEffect, useRef } from "react";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

interface AnimatedTitleProps {
  children: React.ReactNode;
  pathMatch: string;
  style?: any;
}

export function AnimatedTitle({
  children,
  pathMatch,
  style,
}: AnimatedTitleProps) {
  const pathname = usePathname();
  const scale = useSharedValue(1);
  const prevTabIndexRef = useRef<number | null>(null);
  const hasAnimatedRef = useRef<boolean>(false);

  useEffect(() => {
    // Determine current active tab index (same logic as AnimatedTabScreen)
    let currentTabIndex = 0;
    if (pathname?.includes("transactions")) currentTabIndex = 1;
    else if (pathname?.includes("categories")) currentTabIndex = 2;
    else if (pathname?.includes("settings")) currentTabIndex = 3;

    // Determine this screen's tab index
    let thisScreenIndex = 0;
    if (pathMatch === "transactions") thisScreenIndex = 1;
    else if (pathMatch === "categories") thisScreenIndex = 2;
    else if (pathMatch === "settings") thisScreenIndex = 3;
    else if (pathMatch === "/(tabs)") thisScreenIndex = 0;

    const prevIndex = prevTabIndexRef.current;
    const direction = currentTabIndex - thisScreenIndex;

    // Use EXACT same logic as AnimatedTabScreen to sync animations
    if (direction === 0) {
      // This is the active screen
      if (prevIndex !== null && prevIndex !== currentTabIndex) {
        // Just became active - animate title (matches slide animation timing)
        // Small delay to let slide animation start first
        setTimeout(() => {
          scale.value = 0.9;
          scale.value = withSpring(1, {
            duration: 1333,
            dampingRatio: 0.5,
            mass: 4,
            overshootClamping: undefined,
            energyThreshold: 6e-9,
            velocity: 0,
          });
        }, 150);
      } else if (prevIndex === null) {
        // Initial mount - animate immediately
        scale.value = 0.9;
        scale.value = withSpring(1, {
          duration: 1333,
          dampingRatio: 0.5,
          mass: 4,
          overshootClamping: undefined,
          energyThreshold: 6e-9,
          velocity: 0,
        });
      }
    }

    // Update previous tab index
    prevTabIndexRef.current = currentTabIndex;
  }, [pathname, pathMatch]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.Text style={[style, animatedStyle]}>{children}</Animated.Text>
  );
}
