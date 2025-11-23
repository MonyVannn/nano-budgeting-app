import { Text, View } from "@/components/Themed";
import { useTheme } from "@/constants/ThemeContext";
import { useAuthStore } from "@/store";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { Pressable, ScrollView, StyleSheet, Switch } from "react-native";

export default function SettingsScreen() {
  const { user, signOut } = useAuthStore();
  const { theme, themeMode, toggleTheme } = useTheme();

  const handleThemeToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    toggleTheme();
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      padding: 20,
      paddingTop: 10,
    },
    title: {
      fontSize: 28,
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView style={styles.content}>
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
                <Pressable style={styles.dangerButtonInner} onPress={signOut}>
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
  );
}
