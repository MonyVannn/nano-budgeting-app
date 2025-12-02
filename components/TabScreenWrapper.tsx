import React from "react";
import { View } from "react-native";

interface TabScreenWrapperProps {
  children: React.ReactNode;
  screenIndex: number; // 0: Dashboard, 1: Transactions, 2: Report, 3: Settings
}

// Memoize to prevent unnecessary re-renders
export const TabScreenWrapper = React.memo(function TabScreenWrapper({
  children,
  screenIndex,
}: TabScreenWrapperProps) {
  return <View style={{ flex: 1 }}>{children}</View>;
});
