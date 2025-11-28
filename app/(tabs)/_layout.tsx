import * as Haptics from "expo-haptics";
import { Tabs, router } from "expo-router";
import React, { useEffect } from "react";
import { Pressable } from "react-native";

import { useTheme } from "@/constants/ThemeContext";
import { useAuthStore } from "@/store";
import { BarChart3, CreditCard, Home, UserCircle } from "lucide-react-native";

// Custom tab bar button with haptic feedback
const TabBarButton = ({ children, onPress, accessibilityState }: any) => {
  const handlePress = () => {
    // Light haptic feedback when switching tabs
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {children}
    </Pressable>
  );
};

export default function TabLayout() {
  const { theme } = useTheme();
  const { user, session } = useAuthStore();

  // Guard: Redirect to sign-in if not authenticated
  useEffect(() => {
    if (!user || !session) {
      const timer = setTimeout(() => {
        router.replace("/(auth)/sign-in");
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [user, session]);

  // Don't render tabs if not authenticated
  if (!user || !session) {
    return null;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.tabIconSelected,
        tabBarInactiveTintColor: theme.tabIconDefault,
        headerShown: false,
        tabBarShowLabel: false,
        tabBarButton: TabBarButton,
        tabBarStyle: {
          backgroundColor: theme.tabBar,
          borderTopWidth: 0.5,
          borderTopColor: theme.divider,
          height: 90,
          paddingBottom: 12,
          paddingTop: 12,
        },
        tabBarIconStyle: {
          marginTop: 0,
        },
        // Enable smooth animations
        animationEnabled: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <Home size={28} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: "Transactions",
          tabBarIcon: ({ color, focused }) => (
            <CreditCard size={28} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="report"
        options={{
          title: "Report",
          tabBarIcon: ({ color, focused }) => (
            <BarChart3 size={28} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, focused }) => (
            <UserCircle size={28} color={color} strokeWidth={2} />
          ),
        }}
      />
    </Tabs>
  );
}
