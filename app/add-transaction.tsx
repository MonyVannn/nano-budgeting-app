import { Text } from "@/components/Themed";
import { useTheme } from "@/constants/ThemeContext";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { X } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AddTransactionScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [amount, setAmount] = useState("0");
  const buttonTranslateY = useSharedValue(80); // Start behind keypad (below)
  const buttonOpacity = useSharedValue(0);

  const handleKeyPress = (key: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (key === "backspace") {
      setAmount((prev) => {
        if (prev.length <= 1) return "0";
        const newAmount = prev.slice(0, -1);
        return newAmount === "" ? "0" : newAmount;
      });
    } else if (key === ".") {
      setAmount((prev) => {
        if (prev.includes(".")) return prev;
        return prev + ".";
      });
    } else {
      setAmount((prev) => {
        if (prev === "0") return key;
        // Limit to 2 decimal places
        if (prev.includes(".")) {
          const parts = prev.split(".");
          if (parts[1] && parts[1].length >= 2) return prev;
        }
        return prev + key;
      });
    }
  };

  const formatAmount = (value: string) => {
    if (value === "0")
      return { whole: "$0", decimal: "", firstDigit: "", secondDigit: "" };
    const numValue = parseFloat(value);
    if (isNaN(numValue))
      return { whole: "$0", decimal: "", firstDigit: "", secondDigit: "" };

    const formatted = numValue.toLocaleString("en-US", {
      minimumFractionDigits: value.includes(".") ? 2 : 0,
      maximumFractionDigits: 2,
    });

    if (formatted.includes(".")) {
      const parts = formatted.split(".");
      const decimalPart = parts[1] || "00";
      return {
        whole: `$${parts[0]}`,
        decimal: ".",
        firstDigit: decimalPart[0] || "0",
        secondDigit: decimalPart[1] || "0",
      };
    }
    return {
      whole: `$${formatted}`,
      decimal: "",
      firstDigit: "",
      secondDigit: "",
    };
  };

  const isValidAmount = () => {
    const numValue = parseFloat(amount);
    return !isNaN(numValue) && numValue > 0;
  };

  // Animate button when validity changes
  useEffect(() => {
    if (isValidAmount()) {
      // Quick slide up from behind keypad and fade in
      buttonTranslateY.value = withTiming(0, {
        duration: 200,
        easing: Easing.out(Easing.ease),
      });
      buttonOpacity.value = withTiming(1, {
        duration: 200,
        easing: Easing.out(Easing.ease),
      });
    } else {
      // Quick slide down behind keypad and fade out
      buttonTranslateY.value = withTiming(80, {
        duration: 200,
        easing: Easing.in(Easing.ease),
      });
      buttonOpacity.value = withTiming(0, {
        duration: 200,
        easing: Easing.in(Easing.ease),
      });
    }
  }, [amount]);

  const handleContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({
      pathname: "/add-transaction-details",
      params: { amount: amount },
    });
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-end",
      paddingTop: 20,
      paddingHorizontal: 20,
      paddingBottom: 20,
    },
    headerLeft: {
      width: 40,
    },
    closeButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
    },
    content: {
      flex: 1,
      alignItems: "center",
      justifyContent: "space-between",
      paddingTop: 60,
      paddingBottom: 40,
    },
    amountSection: {
      alignItems: "center",
      width: "100%",
      marginTop: 20,
    },
    amountDisplay: {
      fontSize: 72,
      fontWeight: "600",
      letterSpacing: -1,
      flexDirection: "row",
      alignItems: "baseline",
    },
    amountWhole: {
      fontSize: 72,
      fontWeight: "600",
      letterSpacing: -1,
    },
    amountDecimal: {
      fontSize: 72,
      fontWeight: "600",
      color: theme.primary,
      letterSpacing: -1,
    },
    continueButton: {
      width: "90%",
      maxWidth: 400,
      backgroundColor: theme.primary,
      borderRadius: 100,
      paddingVertical: 16,
      alignItems: "center",
      marginTop: 100,
    },
    continueButtonAnimated: {
      width: "100%",
      alignItems: "center",
    },
    continueButtonText: {
      fontSize: 16,
      fontWeight: "600",
      color: "white",
    },
    keypad: {
      width: "100%",
      paddingHorizontal: 30,
      backgroundColor: theme.background,
    },
    keypadRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 16,
    },
    keypadButton: {
      flex: 1,
      aspectRatio: 1,
      maxWidth: "20%",
      alignItems: "center",
      justifyContent: "center",
      marginHorizontal: 6,
    },
    keypadButtonText: {
      fontSize: 36,
      fontWeight: "400",
      color: theme.text,
    },
    keypadButtonSpecial: {
      fontSize: 32,
      fontWeight: "400",
      color: theme.text,
    },
  });

  const keypadLayout = [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
    [".", "0", "backspace"],
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Pressable onPress={() => router.back()} style={styles.closeButton}>
            <X size={32} color={theme.text} />
          </Pressable>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Amount Display */}
        <View style={styles.amountSection}>
          <View style={styles.amountDisplay}>
            <Text
              style={[
                styles.amountWhole,
                {
                  color:
                    isValidAmount() && parseFloat(amount) > 0
                      ? theme.primary
                      : theme.text,
                },
              ]}
            >
              {formatAmount(amount).whole}
            </Text>
            {formatAmount(amount).decimal && (
              <>
                {/* Decimal point */}
                <Text
                  style={[
                    styles.amountDecimal,
                    {
                      color:
                        formatAmount(amount).firstDigit !== "0"
                          ? theme.primary
                          : theme.text,
                    },
                  ]}
                >
                  {formatAmount(amount).decimal}
                </Text>
                {/* First digit after decimal */}
                <Text
                  style={[
                    styles.amountDecimal,
                    {
                      color:
                        formatAmount(amount).firstDigit !== "0"
                          ? theme.primary
                          : theme.text,
                    },
                  ]}
                >
                  {formatAmount(amount).firstDigit}
                </Text>
                {/* Second digit after decimal */}
                <Text
                  style={[
                    styles.amountDecimal,
                    {
                      color:
                        formatAmount(amount).secondDigit !== "0"
                          ? theme.primary
                          : theme.text,
                    },
                  ]}
                >
                  {formatAmount(amount).secondDigit}
                </Text>
              </>
            )}
          </View>
        </View>

        {/* Continue Button - Animated slide up/down from behind keypad */}
        <Animated.View
          style={[
            styles.continueButtonAnimated,
            useAnimatedStyle(() => ({
              transform: [{ translateY: buttonTranslateY.value }],
              opacity: buttonOpacity.value,
            })),
          ]}
        >
          <Pressable onPress={handleContinue} style={styles.continueButton}>
            <Text style={styles.continueButtonText}>Continue</Text>
          </Pressable>
        </Animated.View>

        {/* Keypad */}
        <View style={styles.keypad}>
          {keypadLayout.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.keypadRow}>
              {row.map((key) => (
                <Pressable
                  key={key}
                  style={styles.keypadButton}
                  onPress={() => handleKeyPress(key)}
                >
                  {key === "backspace" ? (
                    <Text style={styles.keypadButtonSpecial}>⌫</Text>
                  ) : (
                    <Text style={styles.keypadButtonText}>{key}</Text>
                  )}
                </Pressable>
              ))}
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}
