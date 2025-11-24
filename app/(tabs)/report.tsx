import { AnimatedTitle } from "@/components/AnimatedTitle";
import { Text } from "@/components/Themed";
import { useTheme } from "@/constants/ThemeContext";
import { useMemo } from "react";
import { Platform, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ReportScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const styles = useMemo(
    () =>
      StyleSheet.create({
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
          backgroundColor: theme.background,
        },
        emptyStateWrapper: {
          borderRadius: 16,
          marginTop: 40,
          overflow: "hidden",
          borderWidth: 0.5,
          borderColor: theme.divider,
          backgroundColor: theme.surface,
        },
        emptyState: {
          padding: 48,
          alignItems: "center",
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
      }),
    [theme, insets]
  );

  const headerHeight = Platform.OS === "ios" ? insets.top + 80 : 100;
  const stickyHeaderStyle = [
    styles.stickyHeader,
    { paddingTop: Platform.OS === "ios" ? insets.top + 20 : 40 },
  ];

  const contentContainerStyle = useMemo(
    () => ({
      paddingTop: headerHeight,
    }),
    [headerHeight]
  );

  return (
    <View style={styles.container}>
      {/* Sticky Header */}
      <View style={stickyHeaderStyle}>
        <View style={styles.header}>
          <AnimatedTitle pathMatch="report" style={styles.title}>
            Report
          </AnimatedTitle>
        </View>
      </View>

      {/* Scrollable Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={contentContainerStyle}
      >
        <View style={styles.emptyStateWrapper}>
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Coming Soon</Text>
            <Text style={styles.emptySubtext}>
              Reports and analytics will be available here
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
