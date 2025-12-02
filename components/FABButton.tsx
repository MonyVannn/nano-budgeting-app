import { useTheme } from "@/constants/ThemeContext";
import * as Haptics from "expo-haptics";
import { Plus } from "lucide-react-native";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface FABButtonProps {
  onPress: () => void;
  bottomOffset?: number; // Additional offset from bottom (default accounts for tab bar)
}

export function FABButton({ onPress, bottomOffset = 50 }: FABButtonProps) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const styles = StyleSheet.create({
    fabWrapper: {
      position: "absolute",
      bottom: bottomOffset + (insets.bottom > 0 ? 0 : 20), // Account for tab bar and safe area
      right: 20,
      width: 56,
      height: 56,
      borderRadius: 28,
      overflow: "hidden",
      borderWidth: 0.5,
      borderColor: theme.divider,
      backgroundColor: theme.surface,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.5,
      shadowRadius: 12,
      elevation: 8,
    },
    fabTouchable: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
  });

  return (
    <View style={styles.fabWrapper}>
      <TouchableOpacity
        style={styles.fabTouchable}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          onPress();
        }}
        activeOpacity={1}
      >
        <Plus size={28} color={theme.text} strokeWidth={2} />
      </TouchableOpacity>
    </View>
  );
}

