import { Stack } from "expo-router";
import { useTheme } from "@/constants/ThemeContext";

export default function OnboardingLayout() {
  const { theme } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: theme.background,
        },
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="select-categories" />
      <Stack.Screen name="allocate-budget" />
    </Stack>
  );
}

