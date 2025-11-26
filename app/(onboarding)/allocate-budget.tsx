import { Text } from "@/components/Themed";
import { useTheme } from "@/constants/ThemeContext";
import {
  predefinedCategories,
  PredefinedCategory,
} from "@/constants/predefinedCategories";
import { useAuthStore, useCategoryStore } from "@/store";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import { ArrowLeft, ChevronRight, Plus } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface CategoryWithBudget extends PredefinedCategory {
  budget: string;
  id?: string; // For custom categories
}

export default function AllocateBudgetScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const { addCategory, fetchCategories } = useCategoryStore();
  const params = useLocalSearchParams();
  const [isSaving, setIsSaving] = useState(false);
  const [focusedBudgetIndex, setFocusedBudgetIndex] = useState<number | null>(
    null
  );

  // Parse selected categories from params
  const selectedCategoryNames = useMemo(() => {
    try {
      return JSON.parse((params.categories as string) || "[]") as string[];
    } catch {
      return [];
    }
  }, [params.categories]);

  // Initialize categories with budgets
  const [categories, setCategories] = useState<CategoryWithBudget[]>(() => {
    return selectedCategoryNames
      .map((name) => {
        const predefined = predefinedCategories.find((c) => c.name === name);
        return predefined
          ? { ...predefined, budget: "" }
          : {
              name,
              icon: Plus,
              group: "lifestyle" as const,
              frequency: "monthly" as const,
              budget: "",
            };
      })
      .filter(Boolean) as CategoryWithBudget[];
  });

  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  // Calculate totals
  const weeklyTotal = useMemo(() => {
    return categories
      .filter((c) => c.frequency === "weekly")
      .reduce((sum, c) => sum + (parseFloat(c.budget) || 0), 0);
  }, [categories]);

  const monthlyTotal = useMemo(() => {
    return categories
      .filter((c) => c.frequency === "monthly")
      .reduce((sum, c) => sum + (parseFloat(c.budget) || 0), 0);
  }, [categories]);

  const updateCategoryBudget = (index: number, budget: string) => {
    setCategories((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], budget };
      return updated;
    });
  };

  const addCustomCategory = () => {
    if (!newCategoryName.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCategories((prev) => [
      ...prev,
      {
        name: newCategoryName.trim(),
        icon: Plus,
        group: "lifestyle",
        frequency: "monthly",
        budget: "",
      },
    ]);
    setNewCategoryName("");
    setShowAddCategory(false);
  };

  const handleContinue = async () => {
    if (!user?.id) {
      Alert.alert("Error", "Please sign in to continue");
      return;
    }

    // Validate that at least one category has a budget
    const hasBudgets = categories.some((c) => parseFloat(c.budget) > 0);
    if (!hasBudgets) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert(
        "Budget Required",
        "Please set at least one budget amount to continue"
      );
      return;
    }

    try {
      setIsSaving(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Create all categories with budgets
      for (const category of categories) {
        const budget = parseFloat(category.budget) || 0;
        if (budget > 0) {
          await addCategory({
            user_id: user.id,
            name: category.name,
            expected_amount: budget,
            frequency: category.frequency,
            type: "expense",
          });
        }
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Refetch categories to update the store
      await fetchCategories(user.id);

      // Navigate to main app
      router.replace("/(tabs)");
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Error", error.message || "Failed to save categories");
      setIsSaving(false);
    }
  };

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: theme.background,
        },
        header: {
          flexDirection: "row",
          alignItems: "center",
          paddingTop: Platform.OS === "ios" ? insets.top + 10 : 20,
          paddingHorizontal: 20,
          paddingBottom: 20,
        },
        backButton: {
          padding: 8,
        },
        headerTitle: {
          fontSize: 28,
          fontWeight: "700",
          color: theme.text,
          flex: 1,
          marginLeft: 8,
        },
        content: {
          flex: 1,
          paddingHorizontal: 20,
          marginTop: 20,
        },
        suggestionBox: {
          flexDirection: "row",
          alignItems: "center",
          padding: 16,
          borderRadius: 12,
          backgroundColor: theme.surface,
          borderWidth: 0.5,
          borderColor: theme.divider,
          marginBottom: 24,
          gap: 12,
        },
        suggestionIcon: {
          width: 32,
          height: 32,
          borderRadius: 16,
          backgroundColor: theme.primary + "20",
          justifyContent: "center",
          alignItems: "center",
        },
        suggestionText: {
          flex: 1,
          fontSize: 14,
          color: theme.textSecondary,
          lineHeight: 20,
        },
        suggestionLink: {
          fontSize: 14,
          fontWeight: "600",
          color: theme.primary,
        },
        section: {
          marginBottom: 32,
        },
        sectionHeader: {
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        },
        sectionTitle: {
          fontSize: 18,
          fontWeight: "600",
          color: theme.text,
        },
        sectionTotal: {
          fontSize: 14,
          color: theme.textSecondary,
        },
        categoryItem: {
          flexDirection: "row",
          alignItems: "center",
          padding: 16,
          borderRadius: 12,
          backgroundColor: theme.surface,
          borderWidth: 0.5,
          borderColor: theme.divider,
          marginBottom: 12,
          gap: 12,
        },
        categoryIconWrapper: {
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: theme.surfaceHighlight,
          justifyContent: "center",
          alignItems: "center",
        },
        categoryName: {
          fontSize: 16,
          fontWeight: "500",
          color: theme.text,
          flex: 1,
        },
        budgetInputWrapper: {
          flexDirection: "row",
          alignItems: "center",
          minWidth: 120,
          borderWidth: 1,
          borderColor: theme.divider,
          borderRadius: 12,
          paddingHorizontal: 12,
          paddingVertical: Platform.OS === "ios" ? 12 : 8,
          backgroundColor: theme.backgroundDark,
        },
        budgetInputWrapperFocused: {
          borderColor: theme.primary,
          backgroundColor: theme.surfaceHighlight,
        },
        budgetPrefix: {
          fontSize: 16,
          color: theme.textSecondary,
          marginRight: 6,
        },
        budgetInput: {
          fontSize: 16,
          fontWeight: "600",
          color: theme.text,
          flex: 1,
          textAlign: "right",
          paddingVertical: 0,
        },
        addCategoryButton: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          padding: 16,
          borderRadius: 12,
          borderWidth: 1.5,
          borderStyle: "dashed",
          borderColor: theme.divider,
          backgroundColor: theme.surface,
          marginBottom: 12,
          gap: 8,
        },
        addCategoryText: {
          fontSize: 16,
          fontWeight: "500",
          color: theme.textSecondary,
        },
        addCategoryInput: {
          padding: 16,
          borderRadius: 12,
          backgroundColor: theme.surface,
          borderWidth: 0.5,
          borderColor: theme.divider,
          fontSize: 16,
          color: theme.text,
          marginBottom: 12,
        },
        continueButton: {
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          paddingHorizontal: 20,
          paddingBottom: Platform.OS === "ios" ? insets.bottom + 20 : 20,
          paddingTop: 20,
          backgroundColor: theme.background,
          borderTopWidth: 0.5,
          borderTopColor: theme.divider,
        },
        continueButtonContent: {
          backgroundColor: theme.primary,
          borderRadius: 12,
          padding: 16,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
        },
        continueButtonText: {
          fontSize: 16,
          fontWeight: "600",
          color: theme.background,
        },
      }),
    [theme, insets]
  );

  // Group categories by frequency
  const weeklyCategories = categories.filter((c) => c.frequency === "weekly");
  const monthlyCategories = categories.filter((c) => c.frequency === "monthly");

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={theme.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Let's allocate some money</Text>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onScrollBeginDrag={() => Keyboard.dismiss()}
      >
        {/* Weekly Categories */}
        {weeklyCategories.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Weekly Categories</Text>
              <Text style={styles.sectionTotal}>
                Total ${weeklyTotal.toFixed(2)} / week
              </Text>
            </View>
            {weeklyCategories.map((category, index) => {
              const globalIndex = categories.findIndex(
                (c) => c.name === category.name
              );
              const Icon = category.icon;
              return (
                <View key={category.name} style={styles.categoryItem}>
                  <View style={styles.categoryIconWrapper}>
                    <Icon size={20} color={theme.primary} />
                  </View>
                  <Text style={styles.categoryName}>{category.name}</Text>
                  <View
                    style={[
                      styles.budgetInputWrapper,
                      focusedBudgetIndex === globalIndex &&
                        styles.budgetInputWrapperFocused,
                    ]}
                  >
                    <Text style={styles.budgetPrefix}>$</Text>
                    <TextInput
                      style={styles.budgetInput}
                      value={category.budget}
                      onChangeText={(text) =>
                        updateCategoryBudget(globalIndex, text)
                      }
                      placeholder="0"
                      placeholderTextColor={theme.textTertiary}
                      keyboardType="decimal-pad"
                      returnKeyType="done"
                      onSubmitEditing={() => Keyboard.dismiss()}
                      onFocus={() => setFocusedBudgetIndex(globalIndex)}
                      onBlur={() => setFocusedBudgetIndex(null)}
                    />
                  </View>
                  <ChevronRight size={20} color={theme.textSecondary} />
                </View>
              );
            })}
          </View>
        )}

        {/* Monthly Categories */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Monthly Categories</Text>
            <Text style={styles.sectionTotal}>
              Total ${monthlyTotal.toFixed(2)} / month
            </Text>
          </View>
          {monthlyCategories.map((category, index) => {
            const globalIndex = categories.findIndex(
              (c) => c.name === category.name
            );
            const Icon = category.icon;
            return (
              <View key={category.name} style={styles.categoryItem}>
                <View style={styles.categoryIconWrapper}>
                  <Icon size={20} color={theme.primary} />
                </View>
                <Text style={styles.categoryName}>{category.name}</Text>
                <View
                  style={[
                    styles.budgetInputWrapper,
                    focusedBudgetIndex === globalIndex &&
                      styles.budgetInputWrapperFocused,
                  ]}
                >
                  <Text style={styles.budgetPrefix}>$</Text>
                  <TextInput
                    style={styles.budgetInput}
                    value={category.budget}
                    onChangeText={(text) =>
                      updateCategoryBudget(globalIndex, text)
                    }
                    placeholder="0"
                    placeholderTextColor={theme.textTertiary}
                    keyboardType="decimal-pad"
                    returnKeyType="done"
                    onSubmitEditing={() => Keyboard.dismiss()}
                    onFocus={() => setFocusedBudgetIndex(globalIndex)}
                    onBlur={() => setFocusedBudgetIndex(null)}
                  />
                </View>
                <ChevronRight size={20} color={theme.textSecondary} />
              </View>
            );
          })}
          {showAddCategory ? (
            <>
              <TextInput
                style={styles.addCategoryInput}
                placeholder="Category name"
                placeholderTextColor={theme.textTertiary}
                value={newCategoryName}
                onChangeText={setNewCategoryName}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={addCustomCategory}
              />
              <Pressable
                style={styles.addCategoryButton}
                onPress={addCustomCategory}
              >
                <Text style={styles.addCategoryText}>Add Category</Text>
              </Pressable>
            </>
          ) : (
            <Pressable
              style={styles.addCategoryButton}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowAddCategory(true);
              }}
            >
              <Plus size={20} color={theme.textSecondary} />
              <Text style={styles.addCategoryText}>Add new category</Text>
            </Pressable>
          )}
        </View>
      </ScrollView>

      {/* Continue Button */}
      <View style={styles.continueButton}>
        <Pressable
          style={styles.continueButtonContent}
          onPress={handleContinue}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color={theme.background} />
          ) : (
            <>
              <Text style={styles.continueButtonText}>Next</Text>
              <ChevronRight size={20} color={theme.background} />
            </>
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
