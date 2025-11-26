import { FABButton } from "@/components/FABButton";
import { Text } from "@/components/Themed";
import { useTheme } from "@/constants/ThemeContext";
import { useAuthStore, useCategoryStore, useTransactionStore } from "@/store";
import * as Haptics from "expo-haptics";
import { router, useFocusEffect } from "expo-router";
import { ChevronDown } from "lucide-react-native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Track which categories have been animated to prevent re-animation
const animatedCategories = new Set<string>();

export default function DashboardScreen() {
  const [incomeExpanded, setIncomeExpanded] = useState(false);
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const { transactions, fetchTransactions, getTotalIncome, getTotalExpenses } =
    useTransactionStore();
  const { categories, fetchCategories, isLoading } = useCategoryStore();

  // Animated values for income expansion
  const heightAnimation = useSharedValue(0);
  const opacityAnimation = useSharedValue(0);
  const chevronRotation = useSharedValue(0);

  // Guard: Redirect to sign-in if not authenticated
  useEffect(() => {
    if (!user) {
      const timer = setTimeout(() => {
        router.replace("/(auth)/sign-in");
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [user]);

  // Fetch data on mount and when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (user?.id) {
        fetchTransactions(user.id);
        fetchCategories(user.id);
      }
    }, [user?.id, fetchTransactions, fetchCategories])
  );

  // Redirect to onboarding if user has no categories
  useEffect(() => {
    if (user?.id && !isLoading && categories.length === 0) {
      const timer = setTimeout(() => {
        router.replace("/(onboarding)/select-categories" as any);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [user?.id, isLoading, categories.length]);

  // Don't render if not authenticated
  if (!user) {
    return null;
  }

  // Calculate current month date range
  const currentMonth = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return {
      start: start.toISOString().split("T")[0],
      end: end.toISOString().split("T")[0],
    };
  }, []);

  // Calculate monthly totals
  const monthlyIncome = useMemo(
    () => getTotalIncome(currentMonth.start, currentMonth.end),
    [getTotalIncome, currentMonth.start, currentMonth.end, transactions]
  );
  const monthlyExpenses = useMemo(
    () => getTotalExpenses(currentMonth.start, currentMonth.end),
    [getTotalExpenses, currentMonth.start, currentMonth.end, transactions]
  );
  const remaining = monthlyIncome - monthlyExpenses;

  // Calculate days left in month
  const daysLeftInMonth = useMemo(() => {
    const now = new Date();
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const today = now.getDate();
    return lastDay.getDate() - today;
  }, []);

  // Calculate total budgeted amount
  const expenseCategories = useMemo(
    () => categories.filter((cat) => cat.type === "expense"),
    [categories]
  );

  const totalBudgeted = useMemo(
    () =>
      expenseCategories.reduce(
        (sum, cat) => sum + (cat.expected_amount || 0),
        0
      ),
    [expenseCategories]
  );

  // Calculate total spent (from transactions this month) - this is the "Actual"
  const totalActual = monthlyExpenses;
  const totalDifference = totalBudgeted - totalActual;

  // Get category name helper
  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId) return "Uncategorized";
    const category = categories.find((cat) => cat.id === categoryId);
    return category?.name || "Unknown";
  };

  // Recent transactions (last 5)
  const recentTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [transactions]);

  // Calculate category spending - sorted by most actual (spent) first
  const categoriesWithSpending = useMemo(() => {
    const categoriesData = expenseCategories.map((category) => {
      const categoryTransactions = transactions.filter(
        (txn) =>
          txn.category_id === category.id &&
          txn.is_expense &&
          txn.date >= currentMonth.start &&
          txn.date <= currentMonth.end
      );
      const spent = categoryTransactions.reduce(
        (sum, txn) => sum + txn.amount,
        0
      );
      const budgeted = category.expected_amount || 0;
      const difference = budgeted - spent; // Positive = under budget, Negative = over budget
      const percentage =
        budgeted > 0 ? Math.min((spent / budgeted) * 100, 100) : 0;

      return {
        ...category,
        name: category.name,
        budgeted,
        actual: spent,
        difference,
        percentage,
      };
    });

    // Sort by actual (spent) amount descending - most spent first
    return categoriesData.sort((a, b) => b.actual - a.actual);
  }, [expenseCategories, transactions, currentMonth]);

  // Budget alerts - categories over budget
  const budgetAlerts = useMemo(() => {
    return categoriesWithSpending
      .filter((cat) => cat.difference < 0) // Over budget
      .sort((a, b) => a.difference - b.difference) // Most over budget first
      .slice(0, 3); // Top 3 alerts
  }, [categoriesWithSpending]);

  // Animate when expansion state changes
  useEffect(() => {
    const config = {
      duration: 400,
      easing: Easing.bezier(0.4, 0.0, 0.2, 1), // Ease in-out curve
    };

    if (incomeExpanded) {
      heightAnimation.value = withTiming(1, config);
      opacityAnimation.value = withTiming(1, { ...config, duration: 300 });
      chevronRotation.value = withTiming(180, config); // Rotate 180 degrees to point up
    } else {
      heightAnimation.value = withTiming(0, config);
      opacityAnimation.value = withTiming(0, { ...config, duration: 200 });
      chevronRotation.value = withTiming(0, config); // Rotate back to point down
    }
  }, [incomeExpanded]);

  // Animated styles
  const animatedDetailsStyle = useAnimatedStyle(() => ({
    height: heightAnimation.value * 130, // Approximate height of details section
    opacity: opacityAnimation.value,
    overflow: "hidden",
  }));

  const animatedChevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${chevronRotation.value}deg` }],
  }));

  const handleCategoryPress = (categoryId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({
      pathname: "/category-detail",
      params: { id: categoryId },
    });
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
        dateRange: {
          fontSize: 16,
          fontWeight: "500",
          color: theme.textSecondary,
        },
        incomeCardWrapper: {
          marginHorizontal: 16,
          marginBottom: 16,
          borderRadius: 12,
          overflow: "hidden",
          borderWidth: 0.5,
          borderColor: theme.divider,
          backgroundColor: theme.surface,
        },
        incomeCard: {
          padding: 20,
        },
        incomeHeader: {
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        },
        incomeLabelContainer: {
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
        },
        incomeLabel: {
          fontSize: 20,
          fontWeight: "600",
          color: theme.text,
        },
        chevron: {
          color: theme.textSecondary,
        },
        incomeAmount: {
          fontSize: 20,
          fontWeight: "800",
          color: theme.income,
        },
        incomeDetails: {
          marginTop: 16,
          gap: 12,
        },
        detailRow: {
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingBottom: 12,
          borderBottomWidth: 1,
          borderBottomColor: theme.divider,
        },
        detailRowLast: {
          borderBottomWidth: 0,
          paddingBottom: 0,
        },
        detailLeft: {
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
        },
        detailLabel: {
          fontSize: 14,
          color: theme.textSecondary,
        },
        indicator: {
          width: 8,
          height: 8,
          borderRadius: 4,
        },
        detailAmount: {
          fontSize: 14,
          fontWeight: "600",
          color: theme.text,
        },
        summaryCardWrapper: {
          marginHorizontal: 16,
          marginBottom: 16,
          borderRadius: 12,
          overflow: "hidden",
          borderWidth: 0.5,
          borderColor: theme.divider,
          backgroundColor: theme.surface,
        },
        summaryCard: {
          padding: 20,
          justifyContent: "space-between",
        },
        summaryBudgetColumn: {
          flexDirection: "row",
          justifyContent: "space-between",
          flex: 1,
          gap: 16,
        },
        summaryColumnLeft: {
          alignItems: "flex-start",
          flex: 1,
          gap: 8,
        },
        summaryColumnRight: {
          minWidth: 100,
          gap: 4,
        },
        columnLabel: {
          fontSize: 12,
          color: theme.textSecondary,
          textTransform: "uppercase",
          letterSpacing: 0.5,
        },
        columnValue: {
          fontSize: 20,
          fontWeight: "800",
          color: theme.text,
        },
        differenceBadge: {
          paddingHorizontal: 8,
          paddingVertical: 2,
          borderRadius: 8,
          marginLeft: 8,
        },
        actualRow: {
          flexDirection: "row",
          alignItems: "center",
          gap: 4,
        },
        differenceText: {
          fontSize: 12,
          fontWeight: "600",
        },
        progressBarContainer: {
          height: 6,
          backgroundColor: theme.divider,
          borderRadius: 3,
          overflow: "hidden",
          marginTop: 8,
        },
        progressBarFill: {
          height: "100%",
          borderRadius: 3,
        },
        categoryItemContent: {
          flex: 1,
          marginRight: 12,
          maxWidth: "60%",
        },
        categoryProgressContainer: {
          marginTop: 8,
        },
        categoryAmountsRow: {
          flexDirection: "row",
          alignItems: "center",
          gap: 16,
          minWidth: 200,
          justifyContent: "flex-end",
        },
        categoryAmount: {
          fontSize: 14,
          fontWeight: "500",
          color: theme.text,
          width: 90,
          textAlign: "right",
        },
        categoriesSection: {
          marginBottom: 16,
        },
        categoriesSectionTitle: {
          fontSize: 16,
          fontWeight: "600",
          color: theme.text,
          marginBottom: 12,
          marginHorizontal: 16,
        },
        sectionTitle: {
          fontSize: 16,
          fontWeight: "600",
          color: theme.text,
          marginBottom: 12,
        },
        recentTransactionItem: {
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: theme.divider,
        },
        recentTransactionItemLast: {
          borderBottomWidth: 0,
        },
        recentTransactionLeft: {
          flex: 1,
          marginRight: 12,
        },
        recentTransactionDescription: {
          fontSize: 14,
          fontWeight: "500",
          color: theme.text,
          marginBottom: 4,
        },
        recentTransactionMeta: {
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
        },
        recentTransactionCategory: {
          fontSize: 12,
          color: theme.textSecondary,
        },
        recentTransactionDate: {
          fontSize: 12,
          color: theme.textTertiary,
        },
        recentTransactionAmount: {
          fontSize: 14,
          fontWeight: "600",
          color: theme.expense,
        },
        alertItem: {
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingVertical: 10,
          borderBottomWidth: 1,
          borderBottomColor: theme.divider,
        },
        alertItemLast: {
          borderBottomWidth: 0,
        },
        alertLeft: {
          flex: 1,
        },
        alertCategoryName: {
          fontSize: 14,
          fontWeight: "600",
          color: theme.text,
          marginBottom: 4,
        },
        alertOverAmount: {
          fontSize: 12,
          color: theme.expense,
        },
        alertAmount: {
          fontSize: 14,
          fontWeight: "600",
          color: theme.expense,
        },
        categoryListWrapper: {
          marginHorizontal: 16,
          borderRadius: 12,
          overflow: "hidden",
          borderWidth: 0.5,
          borderColor: theme.divider,
          backgroundColor: theme.surface,
        },
        categoryList: {},
        categoryHeader: {
          padding: 16,
          paddingBottom: 12,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottomWidth: 1,
          borderBottomColor: theme.divider,
        },
        categoryHeaderLeft: {
          flex: 1,
          marginRight: 12,
        },
        categoryHeaderTitle: {
          fontSize: 14,
          fontWeight: "600",
          color: theme.text,
          textTransform: "uppercase",
          letterSpacing: 0.5,
        },
        categoryHeaderRight: {
          flexDirection: "row",
          alignItems: "center",
          gap: 16,
          minWidth: 200,
          justifyContent: "flex-end",
        },
        categoryHeaderLabel: {
          fontSize: 12,
          fontWeight: "600",
          color: theme.textSecondary,
          textTransform: "uppercase",
          letterSpacing: 0.5,
          width: 90,
          textAlign: "right",
        },
        categoryItem: {
          padding: 16,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottomWidth: 1,
          borderBottomColor: theme.divider,
        },
        categoryItemLast: {
          borderBottomWidth: 0,
        },
        categoryName: {
          fontSize: 14,
          fontWeight: "500",
          color: theme.text,
          flex: 1,
        },
      }),
    [theme]
  );

  const CategoryItem = React.memo(
    ({
      categoryId,
      name,
      budgeted,
      actual,
      difference,
      percentage,
      isLast,
    }: {
      categoryId: string;
      name: string;
      budgeted: number;
      actual: number;
      difference: number;
      percentage: number;
      isLast: boolean;
    }) => {
      const isOverBudget = difference < 0;
      const progressColor = isOverBudget ? theme.expense : theme.income;
      const targetPercentage = Math.min(percentage, 100);
      const shouldAnimate = !animatedCategories.has(categoryId);
      const progressWidth = useSharedValue(
        shouldAnimate ? 0 : targetPercentage
      );

      // Animate progress bar only once per category
      useEffect(() => {
        if (shouldAnimate) {
          // First time this category is rendered - animate
          progressWidth.value = withTiming(targetPercentage, {
            duration: 800,
            easing: Easing.out(Easing.ease),
          });
          animatedCategories.add(categoryId);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [categoryId]); // Only animate once per category

      // Update progress value when percentage changes (without animation)
      useEffect(() => {
        if (!shouldAnimate) {
          // Already animated - just update the value directly (no animation)
          progressWidth.value = targetPercentage;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [targetPercentage]); // Update when percentage changes

      const animatedProgressStyle = useAnimatedStyle(() => ({
        width: `${progressWidth.value}%`,
      }));

      return (
        <TouchableOpacity
          style={[styles.categoryItem, isLast && styles.categoryItemLast]}
          onPress={() => handleCategoryPress(categoryId)}
          activeOpacity={1}
        >
          <View style={styles.categoryItemContent}>
            <Text style={styles.categoryName} numberOfLines={1}>
              {name}
            </Text>
            <View style={styles.categoryProgressContainer}>
              <View style={styles.progressBarContainer}>
                <Animated.View
                  style={[
                    styles.progressBarFill,
                    animatedProgressStyle,
                    {
                      backgroundColor: progressColor,
                    },
                  ]}
                />
              </View>
            </View>
          </View>
          <View style={styles.categoryAmountsRow}>
            <Text style={styles.categoryAmount} numberOfLines={1}>
              ${budgeted.toFixed(2)}
            </Text>
            <Text style={styles.categoryAmount} numberOfLines={1}>
              ${actual.toFixed(2)}
            </Text>
          </View>
        </TouchableOpacity>
      );
    }
  );

  const headerHeight = Platform.OS === "ios" ? insets.top + 80 : 100;
  const stickyHeaderStyle = [
    styles.stickyHeader,
    { paddingTop: Platform.OS === "ios" ? insets.top + 20 : 40 },
  ];

  const contentContainerStyle = useMemo(
    () => ({
      paddingTop: headerHeight,
      backgroundColor: theme.background,
    }),
    [headerHeight, theme.background]
  );

  return (
    <View style={styles.container}>
      {/* Sticky Header */}
      <View style={stickyHeaderStyle}>
        <View style={styles.header}>
          <Text style={styles.title}>Dashboard</Text>
        </View>
      </View>

      {/* Scrollable Content */}
      <ScrollView
        style={styles.container}
        contentContainerStyle={contentContainerStyle}
        showsVerticalScrollIndicator={false}
      >
        {/* Income Dropdown */}
        <View style={styles.incomeCardWrapper}>
          <View style={styles.incomeCard}>
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setIncomeExpanded(!incomeExpanded);
              }}
              activeOpacity={1}
            >
              <View style={styles.incomeHeader}>
                <View style={styles.incomeLabelContainer}>
                  <Text style={styles.incomeLabel}>Income</Text>
                </View>
                <View style={styles.incomeLabelContainer}>
                  <Text style={styles.incomeAmount} numberOfLines={1}>
                    ${monthlyIncome.toFixed(2)}
                  </Text>
                  <Animated.View style={animatedChevronStyle}>
                    <ChevronDown size={20} color={theme.textSecondary} />
                  </Animated.View>
                </View>
              </View>

              <Animated.View style={animatedDetailsStyle}>
                <View style={styles.incomeDetails}>
                  <View style={styles.detailRow}>
                    <View style={styles.detailLeft}>
                      <Text style={styles.detailLabel}>Income</Text>
                      <View
                        style={[
                          styles.indicator,
                          { backgroundColor: theme.indicatorGreen },
                        ]}
                      />
                    </View>
                    <Text style={styles.detailAmount}>
                      ${monthlyIncome.toFixed(2)}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <View style={styles.detailLeft}>
                      <Text style={styles.detailLabel}>Expenses</Text>
                      <View
                        style={[
                          styles.indicator,
                          { backgroundColor: theme.indicatorRed },
                        ]}
                      />
                    </View>
                    <Text style={styles.detailAmount} numberOfLines={1}>
                      -${monthlyExpenses.toFixed(2)}
                    </Text>
                  </View>
                  <View style={[styles.detailRow, styles.detailRowLast]}>
                    <View style={styles.detailLeft}>
                      <Text style={styles.detailLabel}>Remaining</Text>
                      <View
                        style={[
                          styles.indicator,
                          {
                            backgroundColor:
                              remaining >= 0
                                ? theme.indicatorGreen
                                : theme.indicatorRed,
                          },
                        ]}
                      />
                    </View>
                    <Text
                      style={[
                        styles.detailAmount,
                        {
                          color: remaining >= 0 ? theme.income : theme.expense,
                        },
                      ]}
                      numberOfLines={1}
                    >
                      ${remaining.toFixed(2)}
                    </Text>
                  </View>
                </View>
              </Animated.View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Monthly Summary - Two Row Layout */}
        <View style={styles.summaryCardWrapper}>
          <View style={styles.summaryCard}>
            <View style={styles.summaryBudgetColumn}>
              <View style={styles.summaryColumnRight}>
                <Text style={styles.columnLabel}>Budgeted</Text>
                <Text style={styles.columnValue} numberOfLines={1}>
                  ${totalBudgeted.toFixed(2)}
                </Text>
              </View>
              <View style={styles.summaryColumnRight}>
                <Text style={styles.columnLabel}>Actual</Text>
                <View style={styles.actualRow}>
                  <Text style={styles.columnValue} numberOfLines={1}>
                    ${totalActual.toFixed(2)}
                  </Text>
                  <View
                    style={[
                      styles.differenceBadge,
                      {
                        backgroundColor:
                          totalDifference >= 0
                            ? theme.income + "20"
                            : theme.expense + "20",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.differenceText,
                        {
                          color:
                            totalDifference >= 0 ? theme.income : theme.expense,
                        },
                      ]}
                      numberOfLines={1}
                    >
                      {totalDifference >= 0 ? "+" : "-"}$
                      {Math.abs(totalDifference).toFixed(2)}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Budget Alerts */}
        {budgetAlerts.length > 0 && (
          <View style={styles.summaryCardWrapper}>
            <View style={styles.summaryCard}>
              <Text style={styles.sectionTitle}>Budget Alerts</Text>
              {budgetAlerts.map((alert, index) => (
                <Pressable
                  key={alert.id}
                  style={[
                    styles.alertItem,
                    index === budgetAlerts.length - 1 && styles.alertItemLast,
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    handleCategoryPress(alert.id);
                  }}
                >
                  <View style={styles.alertLeft}>
                    <Text style={styles.alertCategoryName}>{alert.name}</Text>
                    <Text style={styles.alertOverAmount}>
                      Over by ${Math.abs(alert.difference).toFixed(2)}
                    </Text>
                  </View>
                  <Text style={styles.alertAmount}>
                    ${alert.actual.toFixed(2)} / ${alert.budgeted.toFixed(2)}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* Recent Transactions */}
        {recentTransactions.length > 0 && (
          <View style={styles.summaryCardWrapper}>
            <View style={styles.summaryCard}>
              <Text style={styles.sectionTitle}>Recent Transactions</Text>
              {recentTransactions.map((transaction, index) => (
                <Pressable
                  key={transaction.id}
                  style={[
                    styles.recentTransactionItem,
                    index === recentTransactions.length - 1 &&
                      styles.recentTransactionItemLast,
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.push({
                      pathname: "/transaction-detail",
                      params: { id: transaction.id },
                    });
                  }}
                >
                  <View style={styles.recentTransactionLeft}>
                    <Text style={styles.recentTransactionDescription}>
                      {transaction.description || "No description"}
                    </Text>
                    <View style={styles.recentTransactionMeta}>
                      <Text style={styles.recentTransactionCategory}>
                        {getCategoryName(transaction.category_id)}
                      </Text>
                      <Text style={{ color: theme.textTertiary }}>•</Text>
                      <Text style={styles.recentTransactionDate}>
                        {new Date(transaction.date).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                          }
                        )}
                      </Text>
                    </View>
                  </View>
                  <Text
                    style={[
                      styles.recentTransactionAmount,
                      {
                        color: transaction.is_expense
                          ? theme.expense
                          : theme.income,
                      },
                    ]}
                  >
                    {transaction.is_expense ? "-" : "+"}$
                    {transaction.amount.toFixed(2)}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* Categories Section */}
        <View style={styles.categoriesSection}>
          <View style={styles.categoryListWrapper}>
            <View style={styles.categoryList}>
              {/* Header */}
              <View style={styles.categoryHeader}>
                <View style={styles.categoryHeaderLeft}>
                  <Text style={styles.categoryHeaderTitle} numberOfLines={1}>
                    Category
                  </Text>
                </View>
                <View style={styles.categoryHeaderRight}>
                  <Text style={styles.categoryHeaderLabel} numberOfLines={1}>
                    Budgeted
                  </Text>
                  <Text style={styles.categoryHeaderLabel} numberOfLines={1}>
                    Actual
                  </Text>
                </View>
              </View>
              {/* Category Items */}
              {categoriesWithSpending.length > 0 ? (
                categoriesWithSpending.map((cat, index) => (
                  <CategoryItem
                    key={cat.id}
                    categoryId={cat.id}
                    name={cat.name}
                    budgeted={cat.budgeted}
                    actual={cat.actual}
                    difference={cat.difference}
                    percentage={cat.percentage}
                    isLast={index === categoriesWithSpending.length - 1}
                  />
                ))
              ) : (
                <View style={styles.categoryItem}>
                  <Text
                    style={[
                      styles.categoryName,
                      {
                        color: theme.textSecondary,
                        textAlign: "center",
                        flex: 1,
                      },
                    ]}
                  >
                    No categories yet
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* FAB Button */}
      <FABButton
        onPress={() => {
          router.push("/add-transaction");
        }}
      />
    </View>
  );
}
