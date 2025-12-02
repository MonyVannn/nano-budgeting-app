import { Tabs, router } from "expo-router";
import React, { useEffect } from "react";
import { Platform, Pressable } from "react-native";

import { useTheme } from "@/constants/ThemeContext";
import { useAuthStore } from "@/store";
import { BarChart3, CreditCard, Home, UserCircle } from "lucide-react-native";

// Custom tab bar button with immediate feedback
const TabBarButton = ({ children, onPress, accessibilityState }: any) => {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        opacity: pressed ? 0.6 : 1,
        transform: [{ scale: pressed ? 0.95 : 1 }],
      })}
      android_ripple={{
        color: "rgba(0, 0, 0, 0.1)",
        borderless: true,
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
        lazy: false, // Keep all tabs mounted for instant switching
        tabBarStyle: {
          backgroundColor: theme.tabBar,
          borderTopWidth: 0.5,
          borderTopColor: theme.divider,
          height: 90,
          paddingBottom: Platform.OS === "android" ? 52 : 12,
          paddingTop: 12,
        },
        tabBarIconStyle: {
          marginTop: 0,
        },
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
