import { Text } from "@/components/Themed";
import { useTheme } from "@/constants/ThemeContext";
import { useAuthStore, useCategoryStore } from "@/store";
import { Database } from "@/types/database";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Film,
  Globe,
  Home,
  PartyPopper,
  Phone,
  Plus,
  Scissors,
  ShoppingCart,
  Trash2,
  UtensilsCrossed,
} from "lucide-react-native";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Category = Database["public"]["Tables"]["categories"]["Row"];
type CategoryType = Database["public"]["Enums"]["category_type"];

// Category icon mapping
const getCategoryIcon = (categoryName: string) => {
  const name = categoryName.toLowerCase();
  if (
    name.includes("eating") ||
    name.includes("food") ||
    name.includes("restaurant")
  ) {
    return UtensilsCrossed;
  }
  if (name.includes("shopping") || name.includes("store")) {
    return ShoppingCart;
  }
  if (name.includes("entertainment") || name.includes("movie")) {
    return Film;
  }
  if (name.includes("travel") || name.includes("trip")) {
    return Globe;
  }
  if (name.includes("party") || name.includes("celebration")) {
    return PartyPopper;
  }
  if (name.includes("home") || name.includes("house")) {
    return Home;
  }
  if (name.includes("hair") || name.includes("salon")) {
    return Scissors;
  }
  if (name.includes("grocery")) {
    return ShoppingCart;
  }
  if (name.includes("internet")) {
    return Globe;
  }
  if (name.includes("personal care")) {
    return Scissors;
  }
  if (name.includes("phone")) {
    return Phone;
  }
  if (name.includes("rent")) {
    return Home;
  }
  return ShoppingCart; // Default icon
};

// Memoized CategoryItem component to prevent re-renders that cause keyboard to dismiss
const CategoryItem = React.memo(
  ({
    category,
    isLast,
    editingName,
    editingAmount,
    isExpanded,
    showTypeDropdown,
    showFreqDropdown,
    styles,
    theme,
    currentType,
    onNameChange,
    onNameBlur,
    onAmountChange,
    onAmountBlur,
    onToggleExpanded,
    onFrequencyChange,
    onTypeChange,
    onDelete,
    onSetShowCategoryTypeDropdown,
    onSetShowFrequencyDropdown,
  }: {
    category: Category;
    isLast: boolean;
    editingName: string;
    editingAmount: string;
    isExpanded: boolean;
    showTypeDropdown: boolean;
    showFreqDropdown: boolean;
    styles: any;
    theme: any;
    currentType: CategoryType;
    onNameChange: (value: string) => void;
    onNameBlur: () => void;
    onAmountChange: (value: string) => void;
    onAmountBlur: () => void;
    onToggleExpanded: () => void;
    onFrequencyChange: (frequency: "weekly" | "monthly") => void;
    onTypeChange: (type: CategoryType) => void;
    onDelete: () => void;
    onSetShowCategoryTypeDropdown: (show: boolean) => void;
    onSetShowFrequencyDropdown: (show: boolean) => void;
  }) => {
    const nameInputRef = useRef<TextInput>(null);
    const amountInputRef = useRef<TextInput>(null);

    return (
      <View>
        {/* Main Row */}
        <View
          style={[
            styles.categoryItem,
            isLast && !isExpanded && styles.categoryItemLast,
          ]}
        >
          {/* Editable Name */}
          <TextInput
            ref={nameInputRef}
            style={styles.categoryNameInput}
            value={editingName}
            onChangeText={onNameChange}
            onBlur={onNameBlur}
            placeholder="Category name"
            placeholderTextColor={theme.textTertiary}
            blurOnSubmit={false}
            returnKeyType="next"
            onSubmitEditing={() => {
              nameInputRef.current?.focus();
            }}
            autoCorrect={false}
            spellCheck={false}
          />

          {/* Editable Amount */}
          <View style={styles.amountInputWrapper}>
            <Text style={styles.amountPrefix}>$</Text>
            <TextInput
              ref={amountInputRef}
              style={styles.amountInput}
              value={editingAmount}
              onChangeText={onAmountChange}
              onBlur={onAmountBlur}
              keyboardType="decimal-pad"
              returnKeyType="done"
              onSubmitEditing={() => {
                Keyboard.dismiss();
                onAmountBlur();
              }}
              blurOnSubmit={true}
            />
          </View>

          {/* Chevron */}
          <Pressable style={styles.chevronButton} onPress={onToggleExpanded}>
            {isExpanded ? (
              <ChevronUp size={28} color={theme.primary} />
            ) : (
              <ChevronDown size={28} color={theme.primary} />
            )}
          </Pressable>
        </View>

        {/* Expanded Section */}
        {isExpanded && (
          <View style={styles.expandedSection}>
            {/* Labels */}
            <View style={styles.expandedLabels}>
              <Text style={styles.expandedLabel}>Category type</Text>
              <Text style={styles.expandedLabel}>Frequency</Text>
            </View>

            {/* Dropdowns and Delete */}
            <View style={styles.expandedControls}>
              {/* Category Type Dropdown */}
              <View style={styles.dropdownWrapper}>
                <Pressable
                  style={styles.dropdownButton}
                  onPress={() => {
                    onSetShowCategoryTypeDropdown(!showTypeDropdown);
                    onSetShowFrequencyDropdown(false);
                  }}
                >
                  <Text style={styles.dropdownText}>
                    {currentType === "expense" ? "Expense" : "Income"}
                  </Text>
                  <ChevronDown size={16} color={theme.primary} />
                </Pressable>
                {showTypeDropdown && (
                  <View style={styles.dropdownMenu}>
                    <Pressable
                      style={styles.dropdownItem}
                      onPress={() => {
                        onTypeChange("expense");
                        onSetShowCategoryTypeDropdown(false);
                      }}
                    >
                      <Text style={styles.dropdownItemText}>Expense</Text>
                    </Pressable>
                    <Pressable
                      style={[styles.dropdownItem, styles.dropdownItemLast]}
                      onPress={() => {
                        onTypeChange("income");
                        onSetShowCategoryTypeDropdown(false);
                      }}
                    >
                      <Text style={styles.dropdownItemText}>Income</Text>
                    </Pressable>
                  </View>
                )}
              </View>

              {/* Frequency Dropdown */}
              <View style={styles.dropdownWrapper}>
                <Pressable
                  style={styles.dropdownButton}
                  onPress={() => {
                    onSetShowFrequencyDropdown(!showFreqDropdown);
                    onSetShowCategoryTypeDropdown(false);
                  }}
                >
                  <Text style={styles.dropdownText}>
                    {category.frequency === "weekly" ? "Weekly" : "Monthly"}
                  </Text>
                  <ChevronDown size={16} color={theme.primary} />
                </Pressable>
                {showFreqDropdown && (
                  <View style={styles.dropdownMenu}>
                    <Pressable
                      style={styles.dropdownItem}
                      onPress={() => onFrequencyChange("weekly")}
                    >
                      <Text style={styles.dropdownItemText}>Weekly</Text>
                    </Pressable>
                    <Pressable
                      style={[styles.dropdownItem, styles.dropdownItemLast]}
                      onPress={() => onFrequencyChange("monthly")}
                    >
                      <Text style={styles.dropdownItemText}>Monthly</Text>
                    </Pressable>
                  </View>
                )}
              </View>

              {/* Delete Button */}
              <Pressable style={styles.deleteButton} onPress={onDelete}>
                <Trash2 size={18} color={theme.expense} />
              </Pressable>
            </View>
          </View>
        )}
      </View>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison - only re-render if relevant props changed
    return (
      prevProps.category.id === nextProps.category.id &&
      prevProps.category.type === nextProps.category.type &&
      prevProps.editingName === nextProps.editingName &&
      prevProps.editingAmount === nextProps.editingAmount &&
      prevProps.isExpanded === nextProps.isExpanded &&
      prevProps.showTypeDropdown === nextProps.showTypeDropdown &&
      prevProps.showFreqDropdown === nextProps.showFreqDropdown &&
      prevProps.isLast === nextProps.isLast
    );
  }
);

CategoryItem.displayName = "CategoryItem";

export default function CategoriesScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const { categories, fetchCategories, updateCategory, deleteCategory } =
    useCategoryStore();

  // Track initial loading separately from update loading
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Local state for inline editing
  const [editingAmounts, setEditingAmounts] = useState<{
    [key: string]: string;
  }>({});
  const [editingNames, setEditingNames] = useState<{
    [key: string]: string;
  }>({});
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );
  const [showCategoryTypeDropdown, setShowCategoryTypeDropdown] = useState<{
    [key: string]: boolean;
  }>({});
  const [showFrequencyDropdown, setShowFrequencyDropdown] = useState<{
    [key: string]: boolean;
  }>({});
  const [hasChanges, setHasChanges] = useState(false);

  // Fetch data on mount
  useEffect(() => {
    if (user?.id) {
      setIsInitialLoading(true);
      fetchCategories(user.id).finally(() => {
        setIsInitialLoading(false);
      });
    }
  }, [user?.id, fetchCategories]);

  // Initialize editing amounts and names - only when new categories are added
  useEffect(() => {
    setEditingAmounts((prev) => {
      const updated = { ...prev };
      categories.forEach((cat) => {
        // Only initialize if not already in state (preserve user input)
        if (!(cat.id in updated)) {
          updated[cat.id] = cat.expected_amount.toString();
        }
      });
      return updated;
    });
    setEditingNames((prev) => {
      const updated = { ...prev };
      categories.forEach((cat) => {
        // Only initialize if not already in state (preserve user input)
        if (!(cat.id in updated)) {
          updated[cat.id] = cat.name;
        }
      });
      return updated;
    });
  }, [categories.length]); // Only depend on length to prevent re-initialization

  const expenseCategories = useMemo(
    () => categories.filter((cat) => cat.type === "expense"),
    [categories]
  );

  const incomeCategories = useMemo(
    () => categories.filter((cat) => cat.type === "income"),
    [categories]
  );

  // Group categories by frequency - use a stable reference to prevent unnecessary re-renders
  const { weeklyCategories, monthlyCategories } = useMemo(() => {
    const weekly = expenseCategories.filter(
      (cat) => cat.frequency === "weekly"
    );
    const monthly = expenseCategories.filter(
      (cat) => cat.frequency === "monthly"
    );
    return { weeklyCategories: weekly, monthlyCategories: monthly };
  }, [expenseCategories]);

  // Calculate totals
  const weeklyTotal = useMemo(
    () =>
      weeklyCategories.reduce(
        (sum, cat) => sum + (cat.expected_amount || 0),
        0
      ),
    [weeklyCategories]
  );
  const monthlyTotal = useMemo(
    () =>
      monthlyCategories.reduce(
        (sum, cat) => sum + (cat.expected_amount || 0),
        0
      ),
    [monthlyCategories]
  );

  const incomeTotal = useMemo(
    () =>
      incomeCategories.reduce(
        (sum, cat) => sum + (cat.expected_amount || 0),
        0
      ),
    [incomeCategories]
  );

  const handleAmountChange = useCallback(
    (categoryId: string, value: string) => {
      // Allow only numbers and decimal point
      const cleaned = value.replace(/[^0-9.]/g, "");
      // Allow only one decimal point
      const parts = cleaned.split(".");
      const finalValue =
        parts.length > 2 ? parts[0] + "." + parts.slice(1).join("") : cleaned;

      setEditingAmounts((prev) => {
        // Only update if value actually changed
        if (prev[categoryId] === finalValue) return prev;
        return { ...prev, [categoryId]: finalValue };
      });
      setHasChanges(true);
    },
    []
  );

  const handleNameChange = useCallback((categoryId: string, value: string) => {
    setEditingNames((prev) => {
      // Only update if value actually changed to prevent unnecessary re-renders
      if (prev[categoryId] === value) return prev;
      return { ...prev, [categoryId]: value };
    });
    setHasChanges(true);
  }, []);

  const handleNameBlur = useCallback(
    async (categoryId: string) => {
      const value = editingNames[categoryId]?.trim() || "";

      if (!value) {
        Alert.alert("Error", "Category name cannot be empty");
        // Reset to original value
        const category = categories.find((c) => c.id === categoryId);
        if (category) {
          setEditingNames((prev) => ({
            ...prev,
            [categoryId]: category.name,
          }));
        }
        return;
      }

      const category = categories.find((c) => c.id === categoryId);
      if (category && category.name !== value) {
        try {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          // Update in database - the store will update optimistically
          await updateCategory(categoryId, { name: value });
          // No need to refetch - store updates automatically
        } catch (error: any) {
          Alert.alert("Error", error.message || "Failed to update category");
          // Reset to original value on error
          if (category) {
            setEditingNames((prev) => ({
              ...prev,
              [categoryId]: category.name,
            }));
          }
          // Refetch on error to restore correct state
          if (user?.id) {
            await fetchCategories(user.id);
          }
        }
      }
    },
    [editingNames, categories, updateCategory, user?.id, fetchCategories]
  );

  const toggleCategoryExpanded = useCallback((categoryId: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const handleFrequencyChange = useCallback(
    async (categoryId: string, frequency: "weekly" | "monthly") => {
      // Optimistically update the category in local state
      const category = categories.find((c) => c.id === categoryId);
      if (category && category.frequency === frequency) {
        // Already the same frequency, just close dropdown
        setShowFrequencyDropdown((prev) => ({ ...prev, [categoryId]: false }));
        return;
      }

      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        // Update in database - the store will update optimistically
        await updateCategory(categoryId, { frequency });
        // Close dropdown immediately
        setShowFrequencyDropdown((prev) => ({ ...prev, [categoryId]: false }));
        // Close expanded section if needed
        setExpandedCategories((prev) => {
          const newSet = new Set(prev);
          newSet.delete(categoryId);
          return newSet;
        });
      } catch (error: any) {
        Alert.alert("Error", error.message || "Failed to update frequency");
        // On error, refetch to restore correct state
        if (user?.id) {
          await fetchCategories(user.id);
        }
      }
    },
    [categories, updateCategory, user?.id, fetchCategories]
  );

  const handleTypeChange = useCallback(
    async (categoryId: string, type: CategoryType) => {
      const category = categories.find((c) => c.id === categoryId);
      if (!category || category.type === type) {
        setShowCategoryTypeDropdown((prev) => ({
          ...prev,
          [categoryId]: false,
        }));
        return;
      }

      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        const payload: Database["public"]["Tables"]["categories"]["Update"] = {
          type,
        };
        if (type === "income") {
          payload.expected_amount = 0;
          setEditingAmounts((prev) => ({ ...prev, [categoryId]: "0" }));
        }
        await updateCategory(categoryId, payload);
        setShowCategoryTypeDropdown((prev) => ({
          ...prev,
          [categoryId]: false,
        }));
        setExpandedCategories((prev) => {
          const newSet = new Set(prev);
          newSet.delete(categoryId);
          return newSet;
        });
      } catch (error: any) {
        Alert.alert("Error", error.message || "Failed to update category type");
        if (user?.id) {
          await fetchCategories(user.id);
        }
      }
    },
    [categories, updateCategory, fetchCategories, user?.id]
  );

  const handleDelete = useCallback(
    (categoryId: string, categoryName: string) => {
      Alert.alert(
        "Delete Category",
        `Are you sure you want to delete "${categoryName}"? This will not delete transactions in this category, but they will become uncategorized.`,
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              try {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                await deleteCategory(categoryId);
                if (user?.id) {
                  await fetchCategories(user.id);
                }
                Haptics.notificationAsync(
                  Haptics.NotificationFeedbackType.Success
                );
              } catch (error: any) {
                Haptics.notificationAsync(
                  Haptics.NotificationFeedbackType.Error
                );
                Alert.alert(
                  "Error",
                  error.message || "Failed to delete category"
                );
              }
            },
          },
        ]
      );
    },
    [deleteCategory, user?.id, fetchCategories]
  );

  const handleAmountBlur = useCallback(
    async (categoryId: string) => {
      const category = categories.find((c) => c.id === categoryId);
      if (!category) {
        return;
      }
      const value = editingAmounts[categoryId] || "0";
      const amount = parseFloat(value) || 0;

      if (amount < 0) {
        Alert.alert("Error", "Amount cannot be negative");
        // Reset to original value
        setEditingAmounts((prev) => ({
          ...prev,
          [categoryId]: category.expected_amount.toString(),
        }));
        return;
      }

      if (category.expected_amount !== amount) {
        try {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          // Update in database - the store will update optimistically
          await updateCategory(categoryId, { expected_amount: amount });
          // No need to refetch - store updates automatically
        } catch (error: any) {
          Alert.alert("Error", error.message || "Failed to update category");
          // Reset to original value on error
          setEditingAmounts((prev) => ({
            ...prev,
            [categoryId]: category.expected_amount.toString(),
          }));
          // Refetch on error to restore correct state
          if (user?.id) {
            await fetchCategories(user.id);
          }
        }
      }
    },
    [editingAmounts, categories, updateCategory, user?.id, fetchCategories]
  );

  const handleDone = () => {
    Keyboard.dismiss();
    // Save any pending changes
    categories.forEach((category) => {
      handleAmountBlur(category.id);
    });
    setHasChanges(false);
    router.back();
  };

  const handleSuggestAmounts = () => {
    // TODO: Implement suggestion logic based on income
    Alert.alert(
      "Coming Soon",
      "This feature will suggest budget amounts based on your income."
    );
  };

  const handleAddCategory = (
    frequency: "weekly" | "monthly",
    type: CategoryType = "expense"
  ) => {
    router.push({
      pathname: "/add-category",
      params: { frequency, type },
    });
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
          justifyContent: "space-between",
          paddingTop: Platform.OS === "ios" ? insets.top + 10 : 20,
          paddingBottom: 16,
          paddingHorizontal: 20,
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
          fontSize: 24,
          fontWeight: "700",
          color: theme.text,
          flex: 1,
        },
        doneButton: {
          paddingHorizontal: 16,
          paddingVertical: 8,
        },
        doneButtonText: {
          fontSize: 16,
          fontWeight: "600",
          color: theme.primary,
        },
        content: {
          flex: 1,
          paddingHorizontal: 20,
          backgroundColor: theme.background,
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
        categoryListWrapper: {
          borderRadius: 12,
          overflow: "hidden",
          borderWidth: 0.5,
          borderColor: theme.divider,
          backgroundColor: theme.surface,
        },
        categoryItem: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          padding: 16,
          borderBottomWidth: 1,
          borderBottomColor: theme.divider,
        },
        categoryItemLast: {
          borderBottomWidth: 0,
        },
        iconWithBadge: {
          position: "relative",
          marginRight: 12,
        },
        categoryIconWrapper: {
          width: 40,
          height: 40,
          borderRadius: 20,
          justifyContent: "center",
          alignItems: "center",
        },
        editBadge: {
          position: "absolute",
          bottom: -2,
          right: -2,
          width: 16,
          height: 16,
          borderRadius: 8,
          backgroundColor: theme.primary,
          justifyContent: "center",
          alignItems: "center",
          borderWidth: 2,
          borderColor: theme.background,
        },
        categoryNameInput: {
          flex: 1,
          fontSize: 16,
          fontWeight: "500",
          color: theme.text,
          paddingVertical: 4,
          marginRight: 12,
        },
        amountInputWrapper: {
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: theme.surface,
          borderRadius: 8,
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderWidth: 0.5,
          borderColor: theme.divider,
          minWidth: 70,
          marginRight: 8,
        },
        amountPrefix: {
          fontSize: 14,
          color: theme.textSecondary,
          marginRight: 4,
        },
        amountInput: {
          fontSize: 14,
          color: theme.text,
          minWidth: 40,
          padding: 0,
        },
        chevronButton: {
          padding: 4,
        },
        expandedSection: {
          padding: 16,
          paddingTop: 12,
          borderBottomWidth: 1,
          borderBottomColor: theme.divider,
        },
        expandedLabels: {
          flexDirection: "row",
          justifyContent: "space-between",
          marginBottom: 12,
        },
        expandedLabel: {
          fontSize: 14,
          color: theme.text,
          fontWeight: "500",
        },
        expandedControls: {
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
        },
        dropdownWrapper: {
          flex: 1,
          position: "relative",
        },
        dropdownButton: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: theme.surface,
          borderRadius: 8,
          paddingHorizontal: 12,
          paddingVertical: 10,
          borderWidth: 0.5,
          borderColor: theme.divider,
        },
        dropdownText: {
          fontSize: 14,
          color: theme.primary,
          fontWeight: "500",
        },
        dropdownMenu: {
          position: "absolute",
          top: "100%",
          left: 0,
          right: 0,
          marginTop: 4,
          backgroundColor: theme.surface,
          borderRadius: 8,
          borderWidth: 0.5,
          borderColor: theme.divider,
          zIndex: 10,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 4,
          elevation: 5,
        },
        dropdownItem: {
          paddingHorizontal: 12,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: theme.divider,
        },
        dropdownItemLast: {
          borderBottomWidth: 0,
        },
        dropdownItemText: {
          fontSize: 14,
          color: theme.text,
        },
        deleteButton: {
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: theme.expense + "20",
          justifyContent: "center",
          alignItems: "center",
        },
        addCategoryButton: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          padding: 16,
          borderWidth: 1,
          borderStyle: "dashed",
          borderColor: theme.divider,
          borderRadius: 12,
          marginTop: 8,
        },
        addCategoryText: {
          fontSize: 14,
          color: theme.textSecondary,
          marginLeft: 8,
        },
        incomeItem: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          padding: 16,
          borderBottomWidth: 1,
          borderBottomColor: theme.divider,
        },
        incomeTextWrapper: {
          flex: 1,
          marginRight: 12,
        },
        incomeName: {
          fontSize: 16,
          fontWeight: "600",
          color: theme.text,
          marginBottom: 4,
        },
        incomeSubtext: {
          fontSize: 13,
          color: theme.textSecondary,
        },
        incomeBadge: {
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: 999,
          backgroundColor: theme.income + "20",
        },
        incomeBadgeText: {
          fontSize: 12,
          fontWeight: "600",
          color: theme.income,
          textTransform: "uppercase",
          letterSpacing: 0.5,
        },
        loadingContainer: {
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingTop: 100,
        },
      }),
    [theme, insets]
  );

  const headerHeight = Platform.OS === "ios" ? insets.top : 100;
  const contentContainerStyle = useMemo(
    () => ({
      paddingTop: headerHeight,
      paddingBottom: Platform.OS === "ios" ? insets.bottom + 20 : 20,
    }),
    [headerHeight, insets.bottom]
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={theme.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Categories</Text>
        </View>
      </View>

      {/* Scrollable Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={contentContainerStyle}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {isInitialLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.primary} />
          </View>
        ) : (
          <>
            {/* Weekly Categories */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Weekly Categories</Text>
                <Text style={styles.sectionTotal}>
                  Total US${weeklyTotal.toFixed(2)} / week
                </Text>
              </View>
              <View style={styles.categoryListWrapper}>
                {weeklyCategories.map((category, index) => (
                  <CategoryItem
                    key={category.id}
                    category={category}
                    isLast={index === weeklyCategories.length - 1}
                    editingName={editingNames[category.id] ?? category.name}
                    editingAmount={
                      editingAmounts[category.id] ??
                      category.expected_amount.toString()
                    }
                    isExpanded={expandedCategories.has(category.id)}
                    showTypeDropdown={
                      showCategoryTypeDropdown[category.id] || false
                    }
                    showFreqDropdown={
                      showFrequencyDropdown[category.id] || false
                    }
                    styles={styles}
                    theme={theme}
                    currentType={category.type}
                    onNameChange={(value: string) =>
                      handleNameChange(category.id, value)
                    }
                    onNameBlur={() => handleNameBlur(category.id)}
                    onAmountChange={(value: string) =>
                      handleAmountChange(category.id, value)
                    }
                    onAmountBlur={() => handleAmountBlur(category.id)}
                    onToggleExpanded={() => toggleCategoryExpanded(category.id)}
                    onFrequencyChange={(frequency: "weekly" | "monthly") =>
                      handleFrequencyChange(category.id, frequency)
                    }
                    onTypeChange={(type: CategoryType) =>
                      handleTypeChange(category.id, type)
                    }
                    onDelete={() => handleDelete(category.id, category.name)}
                    onSetShowCategoryTypeDropdown={(show: boolean) =>
                      setShowCategoryTypeDropdown((prev) => ({
                        ...prev,
                        [category.id]: show,
                      }))
                    }
                    onSetShowFrequencyDropdown={(show: boolean) =>
                      setShowFrequencyDropdown((prev) => ({
                        ...prev,
                        [category.id]: show,
                      }))
                    }
                  />
                ))}
                <Pressable
                  style={styles.addCategoryButton}
                  onPress={() => handleAddCategory("weekly", "expense")}
                >
                  <Plus size={18} color={theme.textSecondary} />
                  <Text style={styles.addCategoryText}>Add new category</Text>
                </Pressable>
              </View>
            </View>

            {/* Monthly Categories */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Monthly Categories</Text>
                <Text style={styles.sectionTotal}>
                  Total US${monthlyTotal.toFixed(2)} / month
                </Text>
              </View>
              <View style={styles.categoryListWrapper}>
                {monthlyCategories.map((category, index) => (
                  <CategoryItem
                    key={category.id}
                    category={category}
                    isLast={index === monthlyCategories.length - 1}
                    editingName={editingNames[category.id] ?? category.name}
                    editingAmount={
                      editingAmounts[category.id] ??
                      category.expected_amount.toString()
                    }
                    isExpanded={expandedCategories.has(category.id)}
                    showTypeDropdown={
                      showCategoryTypeDropdown[category.id] || false
                    }
                    showFreqDropdown={
                      showFrequencyDropdown[category.id] || false
                    }
                    styles={styles}
                    theme={theme}
                    currentType={category.type}
                    onNameChange={(value: string) =>
                      handleNameChange(category.id, value)
                    }
                    onNameBlur={() => handleNameBlur(category.id)}
                    onAmountChange={(value: string) =>
                      handleAmountChange(category.id, value)
                    }
                    onAmountBlur={() => handleAmountBlur(category.id)}
                    onToggleExpanded={() => toggleCategoryExpanded(category.id)}
                    onFrequencyChange={(frequency: "weekly" | "monthly") =>
                      handleFrequencyChange(category.id, frequency)
                    }
                    onTypeChange={(type: CategoryType) =>
                      handleTypeChange(category.id, type)
                    }
                    onDelete={() => handleDelete(category.id, category.name)}
                    onSetShowCategoryTypeDropdown={(show: boolean) =>
                      setShowCategoryTypeDropdown((prev) => ({
                        ...prev,
                        [category.id]: show,
                      }))
                    }
                    onSetShowFrequencyDropdown={(show: boolean) =>
                      setShowFrequencyDropdown((prev) => ({
                        ...prev,
                        [category.id]: show,
                      }))
                    }
                  />
                ))}
                <Pressable
                  style={styles.addCategoryButton}
                  onPress={() => handleAddCategory("monthly", "expense")}
                >
                  <Plus size={18} color={theme.textSecondary} />
                  <Text style={styles.addCategoryText}>Add new category</Text>
                </Pressable>
              </View>
            </View>

            {/* Income Categories */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Income Categories</Text>
                <Text style={styles.sectionTotal}>
                  Total expected US${incomeTotal.toFixed(2)}
                </Text>
              </View>
              <View style={styles.categoryListWrapper}>
                {incomeCategories.length > 0 ? (
                  incomeCategories.map((category, index) => (
                    <CategoryItem
                      key={category.id}
                      category={category}
                      isLast={index === incomeCategories.length - 1}
                      editingName={editingNames[category.id] ?? category.name}
                      editingAmount={
                        editingAmounts[category.id] ??
                        category.expected_amount.toString()
                      }
                      isExpanded={expandedCategories.has(category.id)}
                      showTypeDropdown={
                        showCategoryTypeDropdown[category.id] || false
                      }
                      showFreqDropdown={
                        showFrequencyDropdown[category.id] || false
                      }
                      styles={styles}
                      theme={theme}
                      currentType={category.type}
                      onNameChange={(value: string) =>
                        handleNameChange(category.id, value)
                      }
                      onNameBlur={() => handleNameBlur(category.id)}
                      onAmountChange={(value: string) =>
                        handleAmountChange(category.id, value)
                      }
                      onAmountBlur={() => handleAmountBlur(category.id)}
                      onToggleExpanded={() =>
                        toggleCategoryExpanded(category.id)
                      }
                      onFrequencyChange={(frequency: "weekly" | "monthly") =>
                        handleFrequencyChange(category.id, frequency)
                      }
                      onTypeChange={(type: CategoryType) =>
                        handleTypeChange(category.id, type)
                      }
                      onDelete={() => handleDelete(category.id, category.name)}
                      onSetShowCategoryTypeDropdown={(show: boolean) =>
                        setShowCategoryTypeDropdown((prev) => ({
                          ...prev,
                          [category.id]: show,
                        }))
                      }
                      onSetShowFrequencyDropdown={(show: boolean) =>
                        setShowFrequencyDropdown((prev) => ({
                          ...prev,
                          [category.id]: show,
                        }))
                      }
                    />
                  ))
                ) : (
                  <View style={styles.incomeItem}>
                    <Text style={styles.incomeSubtext}>
                      Add income categories to organize your paychecks or other
                      revenue streams.
                    </Text>
                  </View>
                )}
                <Pressable
                  style={styles.addCategoryButton}
                  onPress={() => handleAddCategory("monthly", "income")}
                >
                  <Plus size={18} color={theme.textSecondary} />
                  <Text style={styles.addCategoryText}>
                    Add income category
                  </Text>
                </Pressable>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}
