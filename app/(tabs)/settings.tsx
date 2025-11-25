import { AnimatedTitle } from "@/components/AnimatedTitle";
import { Text } from "@/components/Themed";
import { useTheme } from "@/constants/ThemeContext";
import { useAuthStore } from "@/store";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { ChevronRight } from "lucide-react-native";
import { useMemo } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function SettingsScreen() {
  const { user, signOut } = useAuthStore();
  const { theme, themeMode, toggleTheme } = useTheme();
  const insets = useSafeAreaInsets();

  // Handle normal sign out
  const handleSignOut = async () => {
    try {
      await signOut();
      // Root layout will automatically navigate to sign-in when user becomes null
      // Don't navigate manually here to avoid double navigation
    } catch (error) {
      console.error("Sign out failed:", error);
      // Even if sign out fails, the root layout will handle navigation
    }
  };

  const handleThemeToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    toggleTheme();
  };

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
        section: {
          marginBottom: 32,
        },
        sectionTitle: {
          fontSize: 14,
          fontWeight: "600",
          color: theme.textSecondary,
          textTransform: "uppercase",
          letterSpacing: 1,
          marginBottom: 12,
        },
        settingItemWrapper: {
          borderRadius: 12,
          overflow: "hidden",
          borderWidth: 0.5,
          borderColor: theme.divider,
          backgroundColor: theme.surface,
        },
        settingItem: {
          padding: 16,
        },
        settingRow: {
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        },
        settingRowLeft: {
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
        },
        settingLabel: {
          fontSize: 16,
          color: theme.text,
          fontWeight: "500",
          marginBottom: 4,
        },
        settingDescription: {
          fontSize: 12,
          color: theme.textSecondary,
        },
        settingValue: {
          fontSize: 16,
          color: theme.text,
          fontWeight: "500",
        },
        dangerButtonWrapper: {
          borderRadius: 12,
          overflow: "hidden",
          borderWidth: 0.5,
          borderColor: theme.divider,
          backgroundColor: theme.surface,
        },
        dangerButton: {
          padding: 16,
        },
        dangerButtonInner: {
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
        },
        dangerButtonText: {
          fontSize: 16,
          color: theme.error,
          fontWeight: "600",
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
          <AnimatedTitle pathMatch="settings" style={styles.title}>
            Settings
          </AnimatedTitle>
        </View>
      </View>

      {/* Scrollable Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={contentContainerStyle}
      >
        {/* Appearance Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          <View style={styles.settingItemWrapper}>
            <View style={styles.settingItem}>
              <View style={styles.settingRow}>
                <View>
                  <Text style={styles.settingLabel}>Dark Mode</Text>
                  <Text style={styles.settingDescription}>
                    {themeMode === "dark" ? "On" : "Off"}
                  </Text>
                </View>
                <Switch
                  value={themeMode === "dark"}
                  onValueChange={handleThemeToggle}
                  trackColor={{ false: theme.divider, true: theme.income }}
                  thumbColor={theme.surface}
                  ios_backgroundColor={theme.divider}
                />
              </View>
            </View>
          </View>
        </View>

        {user ? (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Preferences</Text>
              <View style={styles.settingItemWrapper}>
                <Pressable
                  style={styles.settingItem}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.push("/categories");
                  }}
                >
                  <View style={styles.settingRow}>
                    <View style={styles.settingRowLeft}>
                      <Text style={styles.settingLabel}>Categories</Text>
                    </View>
                    <ChevronRight size={20} color={theme.textSecondary} />
                  </View>
                </Pressable>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Account</Text>
              <View style={styles.settingItemWrapper}>
                <View style={styles.settingItem}>
                  <Text style={styles.settingLabel}>Email</Text>
                  <Text style={styles.settingValue}>{user.email}</Text>
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Actions</Text>
              <View style={styles.dangerButtonWrapper}>
                <View style={styles.dangerButton}>
                  <Pressable
                    style={styles.dangerButtonInner}
                    onPress={handleSignOut}
                  >
                    <FontAwesome
                      name="sign-out"
                      size={20}
                      color={theme.error}
                    />
                    <Text style={styles.dangerButtonText}>Sign Out</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </>
        ) : (
          <View style={styles.emptyStateWrapper}>
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Not signed in</Text>
              <Text style={styles.emptySubtext}>
                Sign in to access your budget settings
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
