import { useTheme } from "@/constants/ThemeContext";
import { Stack } from "expo-router";

export default function AuthLayout() {
  const { theme } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.background,
        },
        headerTintColor: theme.text,
        headerTitleStyle: {
          fontWeight: "600",
        },
        contentStyle: {
          backgroundColor: theme.background,
        },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="sign-in"
        options={{
          title: "Sign In",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="sign-up"
        options={{
          title: "Sign Up",
          presentation: "modal",
          headerShown: true,
          headerBackTitle: "Back",
        }}
      />
    </Stack>
  );
}
