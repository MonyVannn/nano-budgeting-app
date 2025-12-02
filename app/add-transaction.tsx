import { Text } from "@/components/Themed";
import { useTheme } from "@/constants/ThemeContext";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { X } from "lucide-react-native";
import { useEffect, useMemo, useRef, useState } from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  runOnJS,
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

  const formattedAmount = useMemo(() => formatAmount(amount), [amount]);
  const numericAmount = useMemo(() => parseFloat(amount) || 0, [amount]);

  const isValidAmount = () => {
    return !isNaN(numericAmount) && numericAmount > 0;
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
      paddingTop: Platform.OS === "ios" ? 20 : 40,
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
          <AnimatedAmountDisplay
            formatted={formattedAmount}
            theme={theme}
            isPositive={isValidAmount()}
            amountValue={numericAmount}
          />
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

type FormattedAmount = {
  whole: string;
  decimal: string;
  firstDigit: string;
  secondDigit: string;
};

type AmountSegment = {
  char: string;
  color: string;
};

const formatAmount = (value: string): FormattedAmount => {
  if (!value || value === "0") {
    return { whole: "$0", decimal: "", firstDigit: "", secondDigit: "" };
  }

  const hasDecimal = value.includes(".");
  const [rawWhole = "0", rawDecimal = ""] = value.split(".");

  const numericWhole = parseInt(rawWhole.replace(/[^\d]/g, "") || "0", 10);
  const wholeFormatted = isNaN(numericWhole)
    ? "$0"
    : `$${numericWhole.toLocaleString("en-US")}`;

  const decimalPart = hasDecimal ? rawDecimal.slice(0, 2) : "";

  return {
    whole: wholeFormatted,
    decimal: hasDecimal ? "." : "",
    firstDigit: decimalPart[0] || "",
    secondDigit: decimalPart[1] || "",
  };
};

const buildSegments = (
  formatted: FormattedAmount,
  theme: ReturnType<typeof useTheme>["theme"],
  isPositive: boolean
): AmountSegment[] => {
  const chars: AmountSegment[] = [];
  const wholeColor = isPositive ? theme.primary : theme.text;

  for (const char of formatted.whole) {
    chars.push({ char, color: wholeColor });
  }

  if (formatted.decimal) {
    const decimalColor =
      formatted.firstDigit && formatted.firstDigit !== "0"
        ? theme.primary
        : theme.text;
    chars.push({ char: formatted.decimal, color: decimalColor });

    if (formatted.firstDigit) {
      chars.push({
        char: formatted.firstDigit,
        color: formatted.firstDigit !== "0" ? theme.primary : theme.text,
      });
    }

    if (formatted.secondDigit) {
      chars.push({
        char: formatted.secondDigit,
        color: formatted.secondDigit !== "0" ? theme.primary : theme.text,
      });
    }
  }

  return chars;
};

const amountDisplayStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  character: {
    fontSize: 72,
    fontWeight: "600",
    letterSpacing: -1,
  },
  lastDigitWrapper: {
    position: "relative",
  },
});

const AnimatedAmountDisplay = ({
  formatted,
  theme,
  amountValue,
  isPositive,
}: {
  formatted: FormattedAmount;
  theme: ReturnType<typeof useTheme>["theme"];
  amountValue: number;
  isPositive: boolean;
}) => {
  const previousValueRef = useRef(amountValue);
  const animatedValue = useSharedValue(0);
  const removalProgress = useSharedValue(0);
  const previousSegmentsRef = useRef<AmountSegment[]>(
    buildSegments(formatted, theme, isPositive)
  );

  const segments = useMemo(
    () => buildSegments(formatted, theme, isPositive),
    [formatted, isPositive, theme]
  );
  const [renderedSegments, setRenderedSegments] =
    useState<AmountSegment[]>(segments);
  const [isRemoving, setIsRemoving] = useState(false);

  useEffect(() => {
    if (amountValue === previousValueRef.current) {
      setRenderedSegments(segments);
      previousSegmentsRef.current = segments;
      return;
    }

    const direction = amountValue > previousValueRef.current ? 1 : -1;
    const prevSegments = previousSegmentsRef.current;

    if (direction < 0 && prevSegments.length > 0) {
      setIsRemoving(true);
      setRenderedSegments(prevSegments);
      removalProgress.value = 0;
      const finalizeRemoval = () => {
        setRenderedSegments(segments);
        setIsRemoving(false);
      };
      removalProgress.value = withTiming(
        -1,
        {
          duration: 120,
          easing: Easing.out(Easing.ease),
        },
        () => {
          runOnJS(finalizeRemoval)();
        }
      );
      animatedValue.value = 0;
    } else {
      setIsRemoving(false);
      animatedValue.value = direction;
      animatedValue.value = withTiming(0, {
        duration: 120,
        easing: Easing.out(Easing.ease),
      });
      setRenderedSegments(segments);
    }

    previousValueRef.current = amountValue;
    previousSegmentsRef.current = segments;
  }, [amountValue, segments]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: animatedValue.value * 28,
      },
    ],
    opacity: 1 - Math.min(Math.abs(animatedValue.value), 1),
  }));

  const removalAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: removalProgress.value * -28,
      },
    ],
    opacity: 1 - Math.min(Math.abs(removalProgress.value), 1),
  }));

  const lastIndex = renderedSegments.length - 1;

  return (
    <View style={amountDisplayStyles.container}>
      {renderedSegments.map((segment, index) => {
        if (index === lastIndex) {
          return (
            <View
              key={`${segment.char}-${index}`}
              style={amountDisplayStyles.lastDigitWrapper}
            >
              <Animated.Text
                style={[
                  amountDisplayStyles.character,
                  isRemoving ? removalAnimatedStyle : animatedStyle,
                  { color: segment.color },
                ]}
              >
                {segment.char}
              </Animated.Text>
            </View>
          );
        }
        return (
          <Text
            key={`${segment.char}-${index}`}
            style={[amountDisplayStyles.character, { color: segment.color }]}
          >
            {segment.char}
          </Text>
        );
      })}
    </View>
  );
};
