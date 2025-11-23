import React, { useEffect, useRef } from "react";
import { usePathname } from "expo-router";
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
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);
  const prevIndexRef = useRef<number | null>(null);

  useEffect(() => {
    // Determine current active tab index
    let currentIndex = 0;
    if (pathname?.includes("transactions")) currentIndex = 1;
    else if (pathname?.includes("categories")) currentIndex = 2;
    else if (pathname?.includes("settings")) currentIndex = 3;

    const prevIndex = prevIndexRef.current;
    prevIndexRef.current = currentIndex;

    // Calculate direction: positive = moving right (next tab), negative = moving left (prev tab)
    const direction = currentIndex - screenIndex;

    if (direction === 0) {
      // This is the active screen
      if (prevIndex !== null && prevIndex !== currentIndex) {
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
        // Already active or initial render
        translateX.value = withTiming(0, {
          duration: 300,
          easing: Easing.bezier(0.4, 0.0, 0.2, 1),
        });
        opacity.value = withTiming(1, {
          duration: 300,
          easing: Easing.bezier(0.4, 0.0, 0.2, 1),
        });
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
  }, [pathname, screenIndex]);

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

