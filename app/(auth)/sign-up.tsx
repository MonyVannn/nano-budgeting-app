import { Text, View } from "@/components/Themed";
import { useTheme } from "@/constants/ThemeContext";
import { useAuthStore } from "@/store";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  View as RNView,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";

export default function SignUpScreen() {
  const { theme, themeMode } = useTheme();
  const { signUp, isLoading } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const isLightTheme = themeMode === "light";

  // Check if form is valid (all fields filled)
  const isFormValid =
    email.trim().length > 0 &&
    password.trim().length > 0 &&
    confirmPassword.trim().length > 0;

  const handleSignUp = async () => {
    if (!email || !password || !confirmPassword) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    if (password.length < 6) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await signUp(email, password);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        "Success!",
        "Account created successfully. Please check your email to verify your account.",
        [
          {
            text: "OK",
            onPress: () => router.replace("/(auth)/sign-in"),
          },
        ]
      );
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Sign Up Failed", error.message || "Please try again");
    }
  };

  const handleSignIn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    scrollView: {
      flex: 1,
    },
    content: {
      flex: 1,
      justifyContent: "center",
      padding: 24,
      paddingBottom: 48,
    },
    header: {
      marginBottom: 48,
      alignItems: "center",
      backgroundColor: theme.background,
    },
    title: {
      fontSize: 32,
      fontWeight: "700",
      color: theme.text,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: theme.textSecondary,
      textAlign: "center",
    },
    formCard: {
      marginBottom: 24,
      padding: 24,
      borderRadius: 16,
      overflow: "hidden",
      borderWidth: 0.5,
      borderColor: theme.divider,
      backgroundColor: isLightTheme
        ? theme.surface
        : "rgba(255, 255, 255, 0.04)",
      shadowColor: isLightTheme ? theme.shadow : "transparent",
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: isLightTheme ? 0.08 : 0,
      shadowRadius: isLightTheme ? 18 : 0,
      elevation: isLightTheme ? 4 : 0,
    },
    inputGroup: {
      marginBottom: 20,
      backgroundColor: theme.surface,
    },
    label: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.text,
      marginBottom: 8,
    },
    input: {
      backgroundColor: isLightTheme ? theme.backgroundDark : theme.surface,
      borderRadius: 12,
      padding: 16,
      fontSize: 16,
      color: theme.text,
      borderWidth: 1,
      borderColor: theme.divider,
    },
    button: {
      borderRadius: 12,
      overflow: "hidden",
      marginBottom: 12,
    },
    buttonTouchable: {
      padding: 16,
      alignItems: "center",
    },
    buttonText: {
      fontSize: 16,
      fontWeight: "600",
      color: "white",
    },
    buttonTextDisabled: {
      fontSize: 16,
      fontWeight: "600",
      color: "white",
      opacity: 0.5,
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    footer: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      marginTop: 24,
      backgroundColor: theme.background,
    },
    footerText: {
      fontSize: 14,
      color: theme.textSecondary,
      marginRight: 8,
    },
    linkText: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.primary,
    },
  });

  const cardBlurIntensity = isLightTheme ? 30 : 0;
  const buttonBlurIntensity = isLightTheme ? 0 : 80;
  const FormWrapper = isLightTheme ? RNView : BlurView;
  const ButtonWrapper = isLightTheme ? RNView : BlurView;

  const formWrapperProps = isLightTheme
    ? {}
    : { intensity: cardBlurIntensity, tint: theme.blurTint };
  const buttonWrapperProps = isLightTheme
    ? {}
    : { intensity: buttonBlurIntensity, tint: theme.blurTint };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Start tracking your budget today</Text>
        </View>

        <FormWrapper {...formWrapperProps} style={styles.formCard}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="your@email.com"
              placeholderTextColor={theme.textSecondary}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoCorrect={false}
              spellCheck={false}
              keyboardType="email-address"
              autoComplete="email"
              textContentType="emailAddress"
              editable={!isLoading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="At least 6 characters"
              placeholderTextColor={theme.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="password"
              editable={!isLoading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirm Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Re-enter password"
              placeholderTextColor={theme.textSecondary}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              autoComplete="password"
              editable={!isLoading}
            />
          </View>

          <View style={styles.button}>
            <ButtonWrapper
              {...buttonWrapperProps}
              style={[
                { backgroundColor: theme.primary },
                (!isFormValid || isLoading) && styles.buttonDisabled,
              ]}
            >
              <TouchableOpacity
                style={styles.buttonTouchable}
                onPress={handleSignUp}
                disabled={!isFormValid || isLoading}
                activeOpacity={1}
              >
                <Text
                  style={
                    !isFormValid || isLoading
                      ? styles.buttonTextDisabled
                      : styles.buttonText
                  }
                >
                  {isLoading ? "Creating Account..." : "Sign Up"}
                </Text>
              </TouchableOpacity>
            </ButtonWrapper>
          </View>
        </FormWrapper>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <TouchableOpacity onPress={handleSignIn} disabled={isLoading}>
            <Text style={styles.linkText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
