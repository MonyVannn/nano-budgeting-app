import * as LocalAuthentication from "expo-local-authentication";
import { useEffect, useState } from "react";

export interface BiometricAuthState {
  isAvailable: boolean;
  isEnrolled: boolean;
  supportedTypes: LocalAuthentication.AuthenticationType[];
  biometricType: "face" | "fingerprint" | "iris" | "none";
}

export function useBiometricAuth() {
  const [state, setState] = useState<BiometricAuthState>({
    isAvailable: false,
    isEnrolled: false,
    supportedTypes: [],
    biometricType: "none",
  });

  useEffect(() => {
    checkBiometricAvailability();
  }, []);

  const checkBiometricAvailability = async () => {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      const supportedTypes =
        await LocalAuthentication.supportedAuthenticationTypesAsync();

      let biometricType: "face" | "fingerprint" | "iris" | "none" = "none";
      if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        biometricType = "face";
      } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        biometricType = "fingerprint";
      } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.IRIS)) {
        biometricType = "iris";
      }

      setState({
        isAvailable: compatible && enrolled,
        isEnrolled: enrolled,
        supportedTypes,
        biometricType,
      });
    } catch (error) {
      console.error("Error checking biometric availability:", error);
      setState({
        isAvailable: false,
        isEnrolled: false,
        supportedTypes: [],
        biometricType: "none",
      });
    }
  };

  const authenticate = async (
    options?: LocalAuthentication.LocalAuthenticationOptions
  ): Promise<LocalAuthentication.LocalAuthenticationResult> => {
    try {
      // First, verify biometrics are still available
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
      
      console.log("Biometric check:", { compatible, enrolled, supportedTypes });
      
      if (!compatible || !enrolled) {
        return {
          success: false,
          error: "Biometric authentication is not available on this device",
        };
      }

      // Check if Face ID is specifically supported
      const hasFaceID = supportedTypes.includes(
        LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION
      );
      
      if (!hasFaceID && supportedTypes.length === 0) {
        return {
          success: false,
          error: "No biometric authentication methods are available",
        };
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: options?.promptMessage || "Authenticate to sign in",
        cancelLabel: options?.cancelLabel || "Cancel",
        disableDeviceFallback: false, // Allow passcode as fallback (iOS requirement after failed attempts)
        fallbackLabel: options?.fallbackLabel || "Use Password",
        ...options,
      });
      
      console.log("Biometric auth result:", result);
      return result;
    } catch (error) {
      console.error("Biometric authentication error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Authentication failed",
      };
    }
  };

  return {
    ...state,
    authenticate,
    checkBiometricAvailability,
  };
}

