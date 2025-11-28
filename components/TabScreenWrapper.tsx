import { usePathname } from "expo-router";
import React, { useEffect, useRef } from "react";
import { Dimensions } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

interface TabScreenWrapperProps {
  children: React.ReactNode;
  screenIndex: number; // 0: Dashboard, 1: Transactions, 2: Report, 3: Settings
}

// Map route names to tab indices
const getTabIndex = (pathname: string | null): number => {
  if (!pathname) return 0;
  if (pathname.includes("/transactions")) return 1;
  if (pathname.includes("/report")) return 2;
  if (pathname.includes("/settings")) return 3;
  return 0; // Dashboard (index or /(tabs))
};

export function TabScreenWrapper({
  children,
  screenIndex,
}: TabScreenWrapperProps) {
  const pathname = usePathname();
  const translateX = useSharedValue(0);
  const prevTabIndexRef = useRef<number | null>(null);
  const screenWidth = Dimensions.get("window").width;

  // Subtle slide distance - only 25% of screen width (Facebook-like)
  const slideDistance = screenWidth * 0.25;

  useEffect(() => {
    const currentTabIndex = getTabIndex(pathname);
    const prevTabIndex = prevTabIndexRef.current;

    // Only animate if we're switching between tabs (not initial mount or coming from detail screens)
    if (prevTabIndex !== null && prevTabIndex !== currentTabIndex) {
      const direction = currentTabIndex - prevTabIndex;

      if (currentTabIndex === screenIndex) {
        // This screen is becoming active - subtle slide in from the correct direction
        const slideFrom = direction > 0 ? slideDistance : -slideDistance;
        translateX.value = slideFrom;

        // Quick, smooth animation - Facebook-like timing
        translateX.value = withTiming(0, {
          duration: 80,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1), // Smooth ease-in-out
        });
      } else if (prevTabIndex === screenIndex) {
        // This screen is losing focus - subtle slide out
        const slideTo = direction > 0 ? -slideDistance : slideDistance;
        translateX.value = withTiming(slideTo, {
          duration: 80,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1), // Smooth ease-in-out
        });
      }
    } else {
      // Initial mount or no tab change
      if (currentTabIndex === screenIndex) {
        // This is the active screen
        translateX.value = 0;
      } else {
        // This is not the active screen - position off-screen slightly
        translateX.value =
          screenIndex < currentTabIndex ? slideDistance : -slideDistance;
      }
    }

    prevTabIndexRef.current = currentTabIndex;
  }, [pathname, screenIndex, slideDistance]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <Animated.View style={[{ flex: 1 }, animatedStyle]}>
      {children}
    </Animated.View>
  );
}
