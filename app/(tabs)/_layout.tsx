import * as Haptics from "expo-haptics";
import { Tabs } from "expo-router";
import React from "react";
import { Pressable } from "react-native";

import { useTheme } from "@/constants/ThemeContext";
import { CreditCard, FolderOpen, Home, UserCircle } from "lucide-react-native";

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
        name="categories"
        options={{
          title: "Categories",
          tabBarIcon: ({ color, focused }) => (
            <FolderOpen size={28} color={color} strokeWidth={2} />
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
