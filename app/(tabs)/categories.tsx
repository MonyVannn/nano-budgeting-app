import { Text, View } from "@/components/Themed";
import { AppColors } from "@/constants/Colors";
import { ScrollView, StyleSheet } from "react-native";

export default function CategoriesScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Categories</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No categories yet</Text>
          <Text style={styles.emptySubtext}>
            Create budget categories to organize your spending
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  header: {
    padding: 20,
    paddingTop: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: AppColors.text,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyState: {
    backgroundColor: AppColors.surface,
    padding: 48,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: AppColors.textSecondary,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: AppColors.textTertiary,
    textAlign: "center",
    maxWidth: 250,
  },
});
