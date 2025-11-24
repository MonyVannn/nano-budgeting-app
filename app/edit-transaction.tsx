import { Text } from "@/components/Themed";
import { useTheme } from "@/constants/ThemeContext";
import { useAuthStore, useCategoryStore, useTransactionStore } from "@/store";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import { ArrowLeft, Calendar, ChevronDown } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
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

export default function EditTransactionScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const { categories, fetchCategories } = useCategoryStore();
  const { updateTransaction, isLoading } = useTransactionStore();
  const params = useLocalSearchParams();
  const transactionId = params.id as string;
  const amount = parseFloat(params.amount as string) || 0;

  const [isExpense, setIsExpense] = useState(
    params.isExpense === "true" || params.isExpense === "true"
  );
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    (params.categoryId as string) || null
  );
  const [selectedDate, setSelectedDate] = useState(
    params.date ? new Date(params.date as string) : new Date()
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [description, setDescription] = useState(
    (params.description as string) || ""
  );
  const [account, setAccount] = useState((params.account as string) || "");
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchCategories(user.id);
    }
  }, [user?.id]);

  const handleSave = async () => {
    if (!selectedCategoryId) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Error", "Please select a category");
      return;
    }

    if (!user?.id) {
      Alert.alert("Error", "User not found");
      return;
    }

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await updateTransaction(transactionId, {
        amount: amount,
        is_expense: isExpense,
        category_id: selectedCategoryId,
        date: selectedDate.toISOString().split("T")[0],
        description: description || null,
        account: account || null,
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back(); // Close edit screen
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Error", error.message || "Failed to update transaction");
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const selectedCategory = categories.find(
    (cat) => cat.id === selectedCategoryId
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingTop: 10,
      paddingHorizontal: 20,
      paddingBottom: 20,
    },
    headerLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    backButton: {
      padding: 4,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: theme.text,
    },
    content: {
      flex: 1,
      paddingHorizontal: 20,
      paddingTop: 24,
    },
    amountDisplay: {
      fontSize: 48,
      fontWeight: "600",
      marginBottom: 32,
      textAlign: "center",
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.textSecondary,
      textTransform: "uppercase",
      letterSpacing: 1,
      marginBottom: 12,
    },
    expenseIncomeToggle: {
      flexDirection: "row",
      backgroundColor: theme.surface,
      borderRadius: 12,
      padding: 4,
      borderWidth: 0.5,
      borderColor: theme.divider,
    },
    toggleButton: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: "center",
    },
    toggleButtonActive: {
      backgroundColor: theme.primary,
    },
    toggleButtonText: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.textSecondary,
    },
    toggleButtonTextActive: {
      color: theme.background,
    },
    dropdownButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: theme.surface,
      borderRadius: 12,
      padding: 16,
      borderWidth: 0.5,
      borderColor: theme.divider,
    },
    dropdownButtonText: {
      fontSize: 16,
      color: theme.text,
    },
    dropdownButtonPlaceholder: {
      fontSize: 16,
      color: theme.textSecondary,
    },
    dropdownMenuWrapper: {
      position: "absolute",
      top: 60,
      left: 0,
      right: 0,
      borderRadius: 12,
      overflow: "hidden",
      borderWidth: 0.5,
      borderColor: theme.divider,
      maxHeight: 300,
      zIndex: 1000,
      backgroundColor: theme.surface,
    },
    dropdownMenu: {
      maxHeight: 300,
    },
    dropdownItem: {
      padding: 16,
      borderBottomWidth: 0.5,
      borderBottomColor: theme.divider,
    },
    dropdownItemLast: {
      borderBottomWidth: 0,
    },
    dropdownItemText: {
      fontSize: 16,
      color: theme.text,
    },
    dateButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: theme.surface,
      borderRadius: 12,
      padding: 16,
      borderWidth: 0.5,
      borderColor: theme.divider,
    },
    dateButtonText: {
      fontSize: 16,
      color: theme.text,
    },
    datePickerContainer: {
      marginTop: 12,
      backgroundColor: theme.surface,
      borderRadius: 12,
      borderWidth: 0.5,
      borderColor: theme.divider,
      overflow: "hidden",
    },
    datePickerHeader: {
      flexDirection: "row",
      justifyContent: "flex-end",
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 0.5,
      borderBottomColor: theme.divider,
    },
    datePickerDoneButton: {
      paddingVertical: 4,
      paddingHorizontal: 8,
    },
    datePickerDoneText: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.primary,
    },
    input: {
      backgroundColor: theme.surface,
      borderRadius: 12,
      padding: 16,
      fontSize: 16,
      color: theme.text,
      borderWidth: 0.5,
      borderColor: theme.divider,
    },
    saveButton: {
      backgroundColor: theme.primary,
      borderRadius: 100,
      paddingVertical: 16,
      alignItems: "center",
      marginTop: 32,
      marginBottom: insets.bottom + 20,
    },
    saveButtonText: {
      fontSize: 16,
      fontWeight: "600",
      color: "white",
    },
    saveButtonDisabled: {
      opacity: 0.5,
    },
  });

  const scrollViewRef = React.useRef<ScrollView>(null);
  const descriptionInputRef = React.useRef<TextInput>(null);
  const accountInputRef = React.useRef<TextInput>(null);

  const scrollToInput = (inputRef: React.RefObject<TextInput | null>) => {
    setTimeout(() => {
      if (inputRef.current && scrollViewRef.current) {
        inputRef.current.measureInWindow((x, y, width, height) => {
          const keyboardHeight = Platform.OS === "ios" ? 350 : 300;
          const screenHeight = Dimensions.get("window").height;
          const inputBottom = y + height;
          const visibleAreaBottom = screenHeight - keyboardHeight;

          if (inputBottom > visibleAreaBottom) {
            const scrollAmount = inputBottom - visibleAreaBottom + 50;
            scrollViewRef.current?.scrollTo({
              y: scrollAmount,
              animated: true,
            });
          }
        });
      }
    }, 300);
  };

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
          <Text style={styles.headerTitle}>Edit Transaction</Text>
        </View>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.content}
        contentContainerStyle={{ paddingBottom: 200 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onScrollBeginDrag={() => {
          if (showCategoryDropdown) {
            setShowCategoryDropdown(false);
          }
          Keyboard.dismiss();
        }}
      >
        {/* Amount Display */}
        <Text
          style={[
            styles.amountDisplay,
            { color: isExpense ? theme.expense : theme.income },
          ]}
        >
          {isExpense ? "-" : "+"}${amount.toFixed(2)}
        </Text>

        {/* Expense/Income Toggle */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Type</Text>
          <View style={styles.expenseIncomeToggle}>
            <Pressable
              style={[
                styles.toggleButton,
                isExpense && styles.toggleButtonActive,
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setIsExpense(true);
              }}
            >
              <Text
                style={[
                  styles.toggleButtonText,
                  isExpense && styles.toggleButtonTextActive,
                ]}
              >
                Expense
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.toggleButton,
                !isExpense && styles.toggleButtonActive,
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setIsExpense(false);
              }}
            >
              <Text
                style={[
                  styles.toggleButtonText,
                  !isExpense && styles.toggleButtonTextActive,
                ]}
              >
                Income
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Category Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Category</Text>
          <View style={{ position: "relative" }}>
            <Pressable
              style={styles.dropdownButton}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                Keyboard.dismiss();
                setShowCategoryDropdown(!showCategoryDropdown);
              }}
            >
              <Text
                style={
                  selectedCategory
                    ? styles.dropdownButtonText
                    : styles.dropdownButtonPlaceholder
                }
              >
                {selectedCategory?.name || "Select category"}
              </Text>
              <ChevronDown size={20} color={theme.textSecondary} />
            </Pressable>
            {showCategoryDropdown && (
              <View style={styles.dropdownMenuWrapper}>
                <View style={styles.dropdownMenu}>
                  <ScrollView
                    style={{ maxHeight: 300 }}
                    showsVerticalScrollIndicator={false}
                  >
                    {categories.map((category, index) => (
                      <Pressable
                        key={category.id}
                        style={[
                          styles.dropdownItem,
                          index === categories.length - 1 &&
                            styles.dropdownItemLast,
                          selectedCategoryId === category.id && {
                            backgroundColor: theme.surfaceHighlight,
                          },
                        ]}
                        onPress={() => {
                          Haptics.impactAsync(
                            Haptics.ImpactFeedbackStyle.Light
                          );
                          setSelectedCategoryId(category.id);
                          setShowCategoryDropdown(false);
                        }}
                      >
                        <Text style={styles.dropdownItemText}>
                          {category.name}
                        </Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Date Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Date</Text>
          <Pressable
            style={styles.dateButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              Keyboard.dismiss();
              setShowDatePicker(true);
            }}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              <Calendar size={20} color={theme.textSecondary} />
              <Text style={styles.dateButtonText}>
                {formatDate(selectedDate)}
              </Text>
            </View>
          </Pressable>
          {showDatePicker && (
            <>
              {Platform.OS === "ios" && (
                <View style={styles.datePickerContainer}>
                  <View style={styles.datePickerHeader}>
                    <Pressable
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setShowDatePicker(false);
                      }}
                      style={styles.datePickerDoneButton}
                    >
                      <Text style={styles.datePickerDoneText}>Done</Text>
                    </Pressable>
                  </View>
                  <DateTimePicker
                    value={selectedDate}
                    mode="date"
                    display="spinner"
                    onChange={(event, date) => {
                      if (date) {
                        setSelectedDate(date);
                      }
                    }}
                  />
                </View>
              )}
              {Platform.OS === "android" && (
                <DateTimePicker
                  value={selectedDate}
                  mode="date"
                  display="default"
                  onChange={(event, date) => {
                    setShowDatePicker(false);
                    if (date) {
                      setSelectedDate(date);
                    }
                  }}
                />
              )}
            </>
          )}
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description (Optional)</Text>
          <TextInput
            ref={descriptionInputRef}
            style={styles.input}
            placeholder="Add a note..."
            placeholderTextColor={theme.textSecondary}
            value={description}
            onChangeText={setDescription}
            onFocus={() => scrollToInput(descriptionInputRef)}
          />
        </View>

        {/* Account */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account (Optional)</Text>
          <TextInput
            ref={accountInputRef}
            style={styles.input}
            placeholder="e.g., Checking, Savings"
            placeholderTextColor={theme.textSecondary}
            value={account}
            onChangeText={setAccount}
            onFocus={() => scrollToInput(accountInputRef)}
          />
        </View>

        {/* Save Button */}
        <Pressable
          onPress={handleSave}
          disabled={isLoading || !selectedCategoryId}
          style={[
            styles.saveButton,
            (isLoading || !selectedCategoryId) && styles.saveButtonDisabled,
          ]}
        >
          <Text style={styles.saveButtonText}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
