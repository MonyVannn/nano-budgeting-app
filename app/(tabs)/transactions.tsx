import { AnimatedTabScreen } from "@/components/AnimatedTabScreen";
import { AnimatedTitle } from "@/components/AnimatedTitle";
import { Text } from "@/components/Themed";
import { useTheme } from "@/constants/ThemeContext";
import { BlurView } from "expo-blur";
import { Platform, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TransactionsScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    stickyHeader: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 10,
      paddingBottom: 16,
      paddingHorizontal: 20,
      borderBottomWidth: 0.5,
      backgroundColor: theme.background,
    },
    header: {
      gap: 8,
    },
    title: {
      fontSize: 24,
      fontWeight: "700",
      color: theme.text,
    },
    content: {
      flex: 1,
      paddingHorizontal: 20,
    },
    emptyState: {
      padding: 48,
      borderRadius: 16,
      alignItems: "center",
      marginTop: 40,
      overflow: "hidden",
      borderWidth: 0.5,
      borderColor: theme.divider,
    },
    emptyText: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.textSecondary,
      marginBottom: 8,
    },
    emptySubtext: {
      fontSize: 14,
      color: theme.textTertiary,
      textAlign: "center",
      maxWidth: 250,
    },
  });

  const headerHeight = Platform.OS === "ios" ? insets.top + 80 : 100;
  const stickyHeaderStyle = [
    styles.stickyHeader,
    { paddingTop: Platform.OS === "ios" ? insets.top + 20 : 40 },
  ];

  return (
    <AnimatedTabScreen screenIndex={1}>
      <View style={styles.container}>
      {/* Sticky Header */}
      <View style={stickyHeaderStyle}>
        <View style={styles.header}>
          <AnimatedTitle pathMatch="transactions" style={styles.title}>
            Transactions
          </AnimatedTitle>
        </View>
      </View>

      {/* Scrollable Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingTop: headerHeight }}
      >
        <BlurView intensity={50} tint={theme.blurTint} style={styles.emptyState}>
          <Text style={styles.emptyText}>No transactions yet</Text>
          <Text style={styles.emptySubtext}>
            Add your first transaction to start tracking your budget
          </Text>
        </BlurView>
      </ScrollView>
    </View>
    </AnimatedTabScreen>
  );
}
