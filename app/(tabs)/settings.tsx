import { AnimatedTabScreen } from "@/components/AnimatedTabScreen";
import { AnimatedTitle } from "@/components/AnimatedTitle";
import { Text } from "@/components/Themed";
import { useTheme } from "@/constants/ThemeContext";
import { useAuthStore } from "@/store";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { Platform, Pressable, ScrollView, StyleSheet, Switch, View } from "react-native";
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
      // But we also navigate here as a backup
      router.replace("/(auth)/sign-in");
    } catch (error) {
      console.error("Sign out failed:", error);
      // Even if sign out fails, try to navigate
      router.replace("/(auth)/sign-in");
    }
  };

  // Dev helper: allow forcing sign out from Settings when running in dev mode
  const handleForceSignOut = async () => {
    try {
      const { supabase } = await import("@/lib/supabase");
      const AsyncStorage = (await import("@react-native-async-storage/async-storage")).default;
      
      // 1. Clear Zustand store (this sets explicitlySignedOut flag)
      await signOut();
      
      // 2. Clear Supabase storage directly
      await supabase.auth.signOut();
      
      // 3. Clear all AsyncStorage keys related to auth
      const allKeys = await AsyncStorage.getAllKeys();
      for (const key of allKeys) {
        if (
          key.includes("auth") ||
          key.includes("supabase") ||
          key.includes("sb-") ||
          key.startsWith("@supabase")
        ) {
          await AsyncStorage.removeItem(key);
          console.log("Cleared storage key:", key);
        }
      }
      
      // 4. Clear Zustand persisted storage
      await AsyncStorage.removeItem("auth-storage");
      await AsyncStorage.removeItem("auth-storage-v2");
      
      // 5. Force clear Supabase's internal storage (stored in AsyncStorage)
      try {
        const allKeys = await AsyncStorage.getAllKeys();
        for (const key of allKeys) {
          if (
            key.includes("supabase") ||
            key.includes("sb-") ||
            key.startsWith("@supabase")
          ) {
            await AsyncStorage.removeItem(key);
            console.log("Cleared Supabase storage key:", key);
          }
        }
      } catch (e) {
        console.warn("Could not clear Supabase storage:", e);
      }
      
      console.log("Force sign out completed - all auth data cleared");
      
      // Force navigation to auth screen
      router.replace("/(auth)/sign-in");
    } catch (e) {
      console.error("Force sign out failed:", e);
    }
  };

  const handleThemeToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    toggleTheme();
  };

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
    settingItem: {
      padding: 16,
      borderRadius: 12,
      overflow: "hidden",
      borderWidth: 0.5,
      borderColor: theme.divider,
    },
    settingRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
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
    dangerButton: {
      padding: 16,
      borderRadius: 12,
      overflow: "hidden",
      borderWidth: 0.5,
      borderColor: theme.divider,
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
    <AnimatedTabScreen screenIndex={3}>
      <View style={styles.container}>
        {/* Sticky Header */}
      <View style={stickyHeaderStyle}>
        <View style={styles.header}>
          <AnimatedTitle pathMatch="settings" style={styles.title}>
            Settings
          </AnimatedTitle>
          {__DEV__ && (
            <Pressable
              onPress={handleForceSignOut}
              style={{ marginTop: 8, alignSelf: "flex-end" }}
            >
              <Text style={{ color: theme.primary, fontWeight: "600" }}>
                DEV: Force Sign Out
              </Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* Scrollable Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingTop: headerHeight }}
      >
        {/* Appearance Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          <BlurView
            intensity={50}
            tint={theme.blurTint}
            style={styles.settingItem}
          >
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
          </BlurView>
        </View>

        {user ? (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Account</Text>
              <BlurView
                intensity={50}
                tint={theme.blurTint}
                style={styles.settingItem}
              >
                <Text style={styles.settingLabel}>Email</Text>
                <Text style={styles.settingValue}>{user.email}</Text>
              </BlurView>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Actions</Text>
              <BlurView
                intensity={50}
                tint={theme.blurTint}
                style={styles.dangerButton}
              >
                <Pressable style={styles.dangerButtonInner} onPress={handleSignOut}>
                  <FontAwesome name="sign-out" size={20} color={theme.error} />
                  <Text style={styles.dangerButtonText}>Sign Out</Text>
                </Pressable>
              </BlurView>
            </View>
          </>
        ) : (
          <BlurView
            intensity={50}
            tint={theme.blurTint}
            style={styles.emptyState}
          >
            <Text style={styles.emptyText}>Not signed in</Text>
            <Text style={styles.emptySubtext}>
              Sign in to access your budget settings
            </Text>
          </BlurView>
        )}
      </ScrollView>
    </View>
    </AnimatedTabScreen>
  );
}
