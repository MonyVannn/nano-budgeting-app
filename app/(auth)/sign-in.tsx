import { Text, View } from "@/components/Themed";
import { useTheme } from "@/constants/ThemeContext";
import { useBiometricAuth } from "@/hooks/useBiometricAuth";
import { useAuthStore } from "@/store";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { BlurView } from "expo-blur";
import Constants from "expo-constants";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useEffect, useState } from "react";
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

export default function SignInScreen() {
  const { theme, themeMode } = useTheme();
  const { signIn, signInWithBiometric, isLoading, hasBiometricCredentials } =
    useAuthStore();
  const { isAvailable, authenticate, biometricType } = useBiometricAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [canUseBiometric, setCanUseBiometric] = useState(false);
  const isLightTheme = themeMode === "light";

  // Check immediately on mount if credentials exist (for fast UI update)
  useEffect(() => {
    const checkCredentials = async () => {
      const hasCredentials = await hasBiometricCredentials();
      if (hasCredentials && isAvailable) {
        setCanUseBiometric(true);
      }
    };
    checkCredentials();
  }, []);

  // Also check when biometric availability changes
  useEffect(() => {
    const checkBiometricAvailability = async () => {
      // Check for saved credentials
      const hasCredentials = await hasBiometricCredentials();

      // Only enable if both biometrics are available AND credentials exist
      setCanUseBiometric(isAvailable && hasCredentials);
    };

    checkBiometricAvailability();
  }, [isAvailable, hasBiometricCredentials]);

  // Check if form is valid (both fields filled)
  const isFormValid = email.trim().length > 0 && password.trim().length > 0;

  const handleSignIn = async () => {
    if (!email || !password) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await signIn(email, password);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Update biometric availability after successful sign in
      if (isAvailable) {
        const hasCredentials = await hasBiometricCredentials();
        setCanUseBiometric(hasCredentials);
      }

      // Don't navigate directly - let root layout handle routing based on onboarding status
      // router.replace("/(tabs)");
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Sign In Failed", error.message || "Please try again");
    }
  };

  const handleSignUp = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/(auth)/sign-up");
  };

  const handleBiometricSignIn = async () => {
    if (!canUseBiometric) {
      return;
    }

    // Check if running in Expo Go (Face ID not supported)
    const isExpoGo = Constants.executionEnvironment === "storeClient";
    if (isExpoGo && Platform.OS === "ios") {
      Alert.alert(
        "Face ID Not Available",
        "Face ID is not supported in Expo Go. Please create a development build to use Face ID authentication.\n\nRun: npx expo run:ios",
        [{ text: "OK" }]
      );
      return;
    }

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Authenticate with biometrics
      const result = await authenticate({
        promptMessage: `Sign in with ${
          biometricType === "face"
            ? "Face ID"
            : biometricType === "fingerprint"
            ? "Fingerprint"
            : "Biometrics"
        }`,
        cancelLabel: "Cancel",
        fallbackLabel: "Use Password",
      });

      if (!result.success) {
        // Check if user canceled - don't show error for cancellation
        const errorMessage = result.error
          ? typeof result.error === "string"
            ? result.error
            : String(result.error)
          : "Biometric authentication failed";
        const isUserCanceled =
          errorMessage.toLowerCase().includes("cancel") ||
          errorMessage.toLowerCase().includes("user canceled");

        if (!isUserCanceled) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

          // Provide helpful error messages
          let alertMessage = errorMessage;
          if (
            errorMessage.includes("not_available") ||
            errorMessage.includes("not_enrolled")
          ) {
            alertMessage =
              "Face ID is not set up on this device. Please set up Face ID in Settings > Face ID & Passcode.";
          } else if (errorMessage.includes("passcode_not_set")) {
            alertMessage =
              "Please set up a passcode on your device to use Face ID.";
          }

          Alert.alert("Authentication Failed", alertMessage);
        }
        return;
      }

      // If biometric authentication succeeded, sign in with saved credentials
      await signInWithBiometric();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        "Sign In Failed",
        error.message || "Failed to sign in with Face ID. Please try again."
      );
    }
  };

  const getBiometricButtonLabel = () => {
    switch (biometricType) {
      case "face":
        return "Sign in with Face ID";
      case "fingerprint":
        return "Sign in with Fingerprint";
      case "iris":
        return "Sign in with Iris";
      default:
        return "Sign in with Biometrics";
    }
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
      backgroundColor: theme.surface,
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
      opacity: 0.9,
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
    biometricButton: {
      borderRadius: 12,
      overflow: "hidden",
      marginBottom: 12,
      borderWidth: 1.5,
      borderColor: theme.primary,
      backgroundColor: "transparent",
    },
    biometricButtonTouchable: {
      padding: 16,
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "center",
      gap: 8,
    },
    biometricButtonText: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.primary,
    },
    divider: {
      flexDirection: "row",
      alignItems: "center",
      marginVertical: 20,
      backgroundColor: theme.background,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: theme.divider,
    },
    dividerText: {
      marginHorizontal: 12,
      fontSize: 14,
      color: theme.textSecondary,
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
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to manage your budget</Text>
        </View>

        {canUseBiometric && (
          <View style={styles.biometricButton}>
            <TouchableOpacity
              style={styles.biometricButtonTouchable}
              onPress={handleBiometricSignIn}
              disabled={isLoading}
              activeOpacity={0.7}
            >
              <FontAwesome name="lock" size={20} color={theme.primary} />
              <Text style={styles.biometricButtonText}>
                {getBiometricButtonLabel()}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {canUseBiometric && (
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>
        )}

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
              placeholder="••••••••"
              placeholderTextColor={theme.textSecondary}
              value={password}
              onChangeText={setPassword}
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
                onPress={handleSignIn}
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
                  {isLoading ? "Signing In..." : "Sign In"}
                </Text>
              </TouchableOpacity>
            </ButtonWrapper>
          </View>
        </FormWrapper>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account?</Text>
          <TouchableOpacity onPress={handleSignUp} disabled={isLoading}>
            <Text style={styles.linkText}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
