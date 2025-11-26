import { Text } from "@/components/Themed";
import { useTheme } from "@/constants/ThemeContext";
import { useAuthStore, useCategoryStore } from "@/store";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import React, { useMemo, useRef, useState } from "react";
import {
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

export default function AddCategoryScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const { addCategory, isLoading } = useCategoryStore();
  const params = useLocalSearchParams();
  const scrollViewRef = useRef<ScrollView>(null);

  const [name, setName] = useState("");
  const [expectedAmount, setExpectedAmount] = useState("");
  const frequency = (params.frequency as "weekly" | "monthly") || "monthly";
  const initialType =
    (params.type as "expense" | "income" | undefined) || "expense";
  const [categoryType, setCategoryType] = useState<"expense" | "income">(
    initialType
  );

  const handleSave = async () => {
    if (!name.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Error", "Please enter a category name");
      return;
    }

    const amount = parseFloat(expectedAmount) || 0;
    if (amount < 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Error", "Amount cannot be negative");
      return;
    }

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await addCategory({
        user_id: user!.id,
        name: name.trim(),
        expected_amount: amount,
        frequency: frequency,
        type: categoryType,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Error", error.message || "Failed to create category");
    }
  };

  const isValid = name.trim().length > 0;

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
          justifyContent: "space-between",
          paddingTop: Platform.OS === "ios" ? insets.top + 10 : 20,
          paddingHorizontal: 20,
          paddingBottom: 20,
        },
        headerLeft: {
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
        },
        backButton: {
          padding: 8,
        },
        headerTitle: {
          fontSize: 18,
          fontWeight: "600",
          color: theme.text,
          flex: 1,
          marginLeft: 8,
        },
        saveButton: {
          paddingHorizontal: 16,
          paddingVertical: 8,
          borderRadius: 8,
          backgroundColor: isValid ? theme.primary : theme.surface,
        },
        saveButtonText: {
          fontSize: 16,
          fontWeight: "600",
          color: isValid ? theme.background : theme.textSecondary,
        },
        content: {
          flex: 1,
          paddingHorizontal: 20,
        },
        section: {
          marginBottom: 32,
        },
        typeToggle: {
          flexDirection: "row",
          backgroundColor: theme.surface,
          borderRadius: 12,
          padding: 4,
          borderWidth: 0.5,
          borderColor: theme.divider,
        },
        typeToggleButton: {
          flex: 1,
          paddingVertical: 12,
          borderRadius: 8,
          alignItems: "center",
        },
        typeToggleButtonActive: {
          backgroundColor: theme.primary,
        },
        typeToggleText: {
          fontSize: 16,
          fontWeight: "600",
          color: theme.textSecondary,
        },
        typeToggleTextActive: {
          color: theme.background,
        },
        label: {
          fontSize: 14,
          fontWeight: "600",
          color: theme.textSecondary,
          textTransform: "uppercase",
          letterSpacing: 0.5,
          marginBottom: 12,
        },
        inputWrapper: {
          borderRadius: 12,
          overflow: "hidden",
          borderWidth: 0.5,
          borderColor: theme.divider,
          backgroundColor: theme.surface,
        },
        input: {
          padding: 16,
          fontSize: 16,
          color: theme.text,
          backgroundColor: theme.surface,
        },
        amountInput: {
          padding: 16,
          fontSize: 16,
          color: theme.text,
          backgroundColor: theme.surface,
        },
        amountPrefix: {
          fontSize: 16,
          color: theme.textSecondary,
          marginRight: 4,
        },
        actionButtonWrapper: {
          borderRadius: 100,
          marginBottom: 12,
          overflow: "hidden",
          borderWidth: 0.5,
          borderColor: theme.divider,
          backgroundColor: theme.surface,
        },
        actionButtonContent: {
          padding: 16,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
        },
        actionButtonText: {
          fontSize: 16,
          fontWeight: "600",
          color: theme.text,
        },
        deleteButton: {
          backgroundColor: theme.income,
        },
        deleteButtonText: {
          color: theme.text,
        },
      }),
    [theme, insets, isValid]
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? insets.top + 60 : 20}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={theme.text} />
          </Pressable>
          <Text style={styles.headerTitle}>New Category</Text>
        </View>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.content}
        contentContainerStyle={{ paddingBottom: 200 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onScrollBeginDrag={() => Keyboard.dismiss()}
      >
        {/* Category Name */}
        <View style={styles.section}>
          <Text style={styles.label}>Category Name</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="e.g., Groceries, Rent, Entertainment"
              placeholderTextColor={theme.textTertiary}
              value={name}
              onChangeText={setName}
              autoFocus
              returnKeyType="next"
            />
          </View>
        </View>

        {/* Category Type */}
        <View style={styles.section}>
          <Text style={styles.label}>Category Type</Text>
          <View style={styles.typeToggle}>
            <Pressable
              style={[
                styles.typeToggleButton,
                categoryType === "expense" && styles.typeToggleButtonActive,
              ]}
              onPress={() => {
                if (categoryType !== "expense") {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setCategoryType("expense");
                }
              }}
            >
              <Text
                style={[
                  styles.typeToggleText,
                  categoryType === "expense" && styles.typeToggleTextActive,
                ]}
              >
                Expense
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.typeToggleButton,
                categoryType === "income" && styles.typeToggleButtonActive,
              ]}
              onPress={() => {
                if (categoryType !== "income") {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setCategoryType("income");
                }
              }}
            >
              <Text
                style={[
                  styles.typeToggleText,
                  categoryType === "income" && styles.typeToggleTextActive,
                ]}
              >
                Income
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Expected Amount */}
        <View style={styles.section}>
          <Text style={styles.label}>
            {categoryType === "expense" ? "Monthly Budget" : "Expected Income"}
          </Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.amountInput}
              placeholder="0.00"
              placeholderTextColor={theme.textTertiary}
              value={expectedAmount}
              onChangeText={setExpectedAmount}
              keyboardType="decimal-pad"
              returnKeyType="done"
              onSubmitEditing={() => Keyboard.dismiss()}
              editable
            />
          </View>
        </View>

        <View style={styles.actionButtonWrapper}>
          <View style={styles.deleteButton}>
            <Pressable onPress={handleSave} style={styles.actionButtonContent}>
              <Text style={[styles.actionButtonText, styles.deleteButtonText]}>
                Save
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
