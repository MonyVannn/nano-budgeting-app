import { AppColors } from "@/constants/Colors";
import { StyleSheet, Text, View } from "react-native";

export default function SignInScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign In</Text>
      <Text style={styles.subtitle}>Welcome back to your budget tracker</Text>
      {/* Authentication UI will be implemented */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: AppColors.background,
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: AppColors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: AppColors.textSecondary,
    textAlign: "center",
  },
});
