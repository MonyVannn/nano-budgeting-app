import { AppColors } from "@/constants/Colors";
import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: AppColors.backgroundDark,
        },
        headerTintColor: AppColors.text,
        headerTitleStyle: {
          fontWeight: "600",
        },
        contentStyle: {
          backgroundColor: AppColors.background,
        },
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
          headerShown: false,
        }}
      />
    </Stack>
  );
}
