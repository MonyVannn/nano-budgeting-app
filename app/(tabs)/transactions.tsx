import { AnimatedTitle } from "@/components/AnimatedTitle";
import { FABButton } from "@/components/FABButton";
import { Text } from "@/components/Themed";
import { useTheme } from "@/constants/ThemeContext";
import { useAuthStore, useCategoryStore, useTransactionStore } from "@/store";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { BarChart } from "react-native-chart-kit";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type ViewType = "week" | "month";

export default function TransactionsScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const { transactions, isLoading, fetchTransactions, addTransaction } =
    useTransactionStore();
  const { categories, fetchCategories } = useCategoryStore();

  const [viewType, setViewType] = useState<ViewType>("month");
  const [periodOffset, setPeriodOffset] = useState(0); // 0 = current period, -1 = previous, 1 = next
  const [showViewDropdown, setShowViewDropdown] = useState(false);

  // Fetch transactions and categories on mount
  useEffect(() => {
    if (user?.id) {
      fetchTransactions(user.id);
      fetchCategories(user.id);
    }
  }, [user?.id, fetchTransactions, fetchCategories]);

  // Calculate current period (week or month) based on offset
  const currentPeriod = useMemo(() => {
    const now = new Date();
    const periodStart = new Date(now);

    if (viewType === "week") {
      // Get start of current week (Sunday)
      const day = periodStart.getDay();
      periodStart.setDate(periodStart.getDate() - day);
      periodStart.setHours(0, 0, 0, 0);

      // Apply offset
      periodStart.setDate(periodStart.getDate() + periodOffset * 7);

      const periodEnd = new Date(periodStart);
      periodEnd.setDate(periodEnd.getDate() + 6);
      periodEnd.setHours(23, 59, 59, 999);

      return { start: periodStart, end: periodEnd };
    } else {
      // Get start of current month
      periodStart.setDate(1);
      periodStart.setHours(0, 0, 0, 0);

      // Apply offset
      periodStart.setMonth(periodStart.getMonth() + periodOffset);

      const periodEnd = new Date(periodStart);
      periodEnd.setMonth(periodEnd.getMonth() + 1);
      periodEnd.setDate(0); // Last day of month
      periodEnd.setHours(23, 59, 59, 999);

      return { start: periodStart, end: periodEnd };
    }
  }, [viewType, periodOffset]);

  // Get category name by ID (define before useMemo)
  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId) return "Uncategorized";
    const category = categories.find((cat) => cat.id === categoryId);
    return category?.name || "Unknown";
  };

  // Filter transactions for current period
  const filteredTransactions = useMemo(() => {
    const { start, end } = currentPeriod;
    return transactions.filter((txn) => {
      const txnDate = new Date(txn.date);
      return txnDate >= start && txnDate <= end;
    });
  }, [transactions, currentPeriod]);

  // Prepare chart data
  const chartData = useMemo(() => {
    const { start, end } = currentPeriod;
    const days: { [key: string]: number } = {};

    // Initialize all days in period with 0
    const current = new Date(start);
    while (current <= end) {
      const dateKey = current.toISOString().split("T")[0];
      days[dateKey] = 0;
      current.setDate(current.getDate() + 1);
    }

    // Sum expenses for each day
    filteredTransactions.forEach((txn) => {
      if (txn.is_expense) {
        const dateKey = txn.date;
        if (days[dateKey] !== undefined) {
          days[dateKey] += txn.amount;
        }
      }
    });

    // Format for chart
    const dayEntries = Object.entries(days).sort((a, b) =>
      a[0].localeCompare(b[0])
    );

    // For week view, show all 7 days
    // For month view, show selected days (e.g., every 3-4 days)
    let labels: string[] = [];
    let data: number[] = [];

    if (viewType === "week") {
      labels = dayEntries.map(([date]) => {
        const d = new Date(date);
        return d.toLocaleDateString("en-US", { weekday: "short" });
      });
      data = dayEntries.map(([, amount]) => amount);
    } else {
      // For month, show dates spaced 7 days apart
      const selectedDays: typeof dayEntries = [];
      let lastSelectedIndex = -7; // Start at -7 so first day is always included

      dayEntries.forEach((entry, index) => {
        if (
          index === 0 ||
          index - lastSelectedIndex >= 7 ||
          index === dayEntries.length - 1
        ) {
          selectedDays.push(entry);
          lastSelectedIndex = index;
        }
      });

      labels = selectedDays.map(([date]) => {
        const d = new Date(date);
        return d.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
      });
      data = selectedDays.map(([, amount]) => amount);
    }

    return { labels, data };
  }, [filteredTransactions, viewType]);

  // Format period label
  const periodLabel = useMemo(() => {
    const { start, end } = currentPeriod;
    if (viewType === "week") {
      return `${start.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })} - ${end.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: start.getFullYear() !== end.getFullYear() ? "numeric" : undefined,
      })}`;
    } else {
      return start.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });
    }
  }, [currentPeriod, viewType]);

  // Group transactions by date for list display
  const groupedTransactions = useMemo(() => {
    const groups: { [key: string]: typeof filteredTransactions } = {};

    filteredTransactions.forEach((transaction) => {
      const dateKey = transaction.date;
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(transaction);
    });

    // Sort dates descending (newest first)
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
  }, [filteredTransactions]);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year:
          date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
      });
    }
  };

  // Dev function to add sample transactions
  const addSampleTransactions = async () => {
    if (!user?.id || categories.length === 0) {
      console.log("Need user and categories to add sample data");
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const twoDaysAgo = new Date(today);
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);

    // Get some category IDs
    const groceriesCategory =
      categories.find((cat) => cat.name === "Groceries")?.id ||
      categories[0]?.id;
    const eatingOutCategory =
      categories.find((cat) => cat.name === "Eating out")?.id ||
      categories[0]?.id;
    const entertainmentCategory =
      categories.find((cat) => cat.name === "Entertainment")?.id ||
      categories[0]?.id;
    const transportationCategory =
      categories.find((cat) => cat.name === "Transportation")?.id ||
      categories[0]?.id;

    const sampleTransactions = [
      // Today
      {
        user_id: user.id,
        amount: 45.5,
        date: today.toISOString().split("T")[0],
        category_id: eatingOutCategory,
        description: "Lunch at Cafe",
        account: "Chase Checking",
        is_expense: true,
      },
      {
        user_id: user.id,
        amount: 2500.0,
        date: today.toISOString().split("T")[0],
        category_id: groceriesCategory, // Use a category for income
        description: "Salary",
        account: "Chase Checking",
        is_expense: false,
      },
      // Yesterday
      {
        user_id: user.id,
        amount: 125.75,
        date: yesterday.toISOString().split("T")[0],
        category_id: groceriesCategory,
        description: "Whole Foods Shopping",
        account: "Chase Credit Card",
        is_expense: true,
      },
      {
        user_id: user.id,
        amount: 15.0,
        date: yesterday.toISOString().split("T")[0],
        category_id: transportationCategory,
        description: "Uber ride",
        account: "Chase Credit Card",
        is_expense: true,
      },
      {
        user_id: user.id,
        amount: 35.0,
        date: yesterday.toISOString().split("T")[0],
        category_id: entertainmentCategory,
        description: "Movie tickets",
        account: "Chase Credit Card",
        is_expense: true,
      },
      // Two days ago
      {
        user_id: user.id,
        amount: 89.99,
        date: twoDaysAgo.toISOString().split("T")[0],
        category_id: groceriesCategory,
        description: "Target shopping",
        account: "Chase Credit Card",
        is_expense: true,
      },
      {
        user_id: user.id,
        amount: 12.5,
        date: twoDaysAgo.toISOString().split("T")[0],
        category_id: eatingOutCategory,
        description: "Coffee",
        account: "Chase Checking",
        is_expense: true,
      },
      // Last week
      {
        user_id: user.id,
        amount: 200.0,
        date: lastWeek.toISOString().split("T")[0],
        category_id: transportationCategory,
        description: "Gas",
        account: "Chase Credit Card",
        is_expense: true,
      },
      {
        user_id: user.id,
        amount: 1500.0,
        date: lastWeek.toISOString().split("T")[0],
        category_id: groceriesCategory, // Use a category for income too
        description: "Freelance payment",
        account: "Chase Checking",
        is_expense: false,
      },
    ];

    try {
      for (const transaction of sampleTransactions) {
        await addTransaction(transaction);
      }
      // Refresh the list
      await fetchTransactions(user.id);
    } catch (error) {
      console.error("Error adding sample transactions:", error);
    }
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
          marginTop: 16,
          flex: 1,
          paddingHorizontal: 6,
          backgroundColor: theme.background,
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
        transactionGroup: {
          marginBottom: 24,
        },
        dateHeader: {
          fontSize: 14,
          fontWeight: "600",
          color: theme.textSecondary,
          marginBottom: 12,
          marginTop: 8,
        },
        transactionItemWrapper: {
          borderRadius: 12,
          marginBottom: 8,
          overflow: "hidden",
          borderWidth: 0.5,
          borderColor: theme.divider,
          backgroundColor: theme.surface,
        },
        transactionItem: {
          padding: 16,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        },
        transactionLeft: {
          flex: 1,
          marginRight: 12,
        },
        transactionDescription: {
          fontSize: 16,
          fontWeight: "600",
          color: theme.text,
          marginBottom: 4,
        },
        transactionMeta: {
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
        },
        transactionCategory: {
          fontSize: 13,
          color: theme.textSecondary,
        },
        transactionAccount: {
          fontSize: 13,
          color: theme.textTertiary,
        },
        transactionAmount: {
          fontSize: 18,
          fontWeight: "700",
        },
        loadingContainer: {
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingTop: 100,
        },
        chartContainer: {
          marginBottom: 24,
          marginTop: 8,
          borderRadius: 0,
          overflow: "hidden",
          backgroundColor: "transparent",
        },
        chartHeader: {
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: 0,
          paddingTop: 0,
          paddingBottom: 20,
          marginBottom: 8,
        },
        chartNav: {
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
        },
        chartNavButton: {
          padding: 4,
        },
        chartPeriod: {
          fontSize: 15,
          fontWeight: "500",
          color: theme.text,
        },
        chartViewToggle: {
          flexDirection: "row",
          backgroundColor: theme.surface,
          borderRadius: 6,
          padding: 2,
          borderWidth: 0.5,
          borderColor: theme.divider,
          minWidth: 100,
        },
        chartViewButton: {
          paddingHorizontal: 10,
          paddingVertical: 4,
          borderRadius: 4,
          flex: 1,
          alignItems: "center",
        },
        chartViewButtonActive: {
          backgroundColor: theme.primary,
        },
        chartViewButtonText: {
          fontSize: 12,
          fontWeight: "500",
          color: theme.textSecondary,
        },
        chartViewButtonTextActive: {
          color: theme.background,
        },
        chartWrapper: {
          paddingHorizontal: 0,
          paddingBottom: 0,
          backgroundColor: "transparent",
        },
        chartViewDropdown: {
          position: "relative",
        },
        chartViewDropdownButton: {
          flexDirection: "row",
          alignItems: "center",
          gap: 4,
          paddingVertical: 4,
          paddingHorizontal: 8,
        },
        chartViewDropdownText: {
          fontSize: 14,
          fontWeight: "500",
          color: theme.text,
        },
        chartViewDropdownMenuWrapper: {
          position: "absolute",
          top: 28,
          right: 0,
          borderRadius: 8,
          overflow: "hidden",
          minWidth: 100,
          zIndex: 1000,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 5,
          borderWidth: 0.5,
          borderColor: theme.divider,
        },
        chartViewDropdownMenu: {
          backgroundColor: theme.surface,
        },
        chartViewDropdownMenuItem: {
          paddingVertical: 12,
          paddingHorizontal: 16,
          borderBottomWidth: 0.5,
          borderBottomColor: theme.divider,
        },
        chartViewDropdownMenuItemLast: {
          borderBottomWidth: 0,
        },
        chartViewDropdownMenuItemText: {
          fontSize: 14,
          fontWeight: "500",
          color: theme.text,
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
      paddingBottom: Platform.OS === "ios" ? insets.bottom + 20 : 20,
      paddingHorizontal: 20,
    }),
    [headerHeight, insets.bottom]
  );

  return (
    <View style={styles.container}>
      {/* Sticky Header */}
      <View style={stickyHeaderStyle}>
        <View style={styles.header}>
          <AnimatedTitle pathMatch="transactions" style={styles.title}>
            Transactions
          </AnimatedTitle>
          {__DEV__ && (
            <Pressable
              onPress={addSampleTransactions}
              style={{ marginTop: 8, alignSelf: "flex-end" }}
            >
              <Text style={{ color: theme.primary, fontWeight: "600" }}>
                DEV: Add Sample Data
              </Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* Scrollable Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={contentContainerStyle}
        onScrollBeginDrag={() => {
          // Close dropdown when scrolling
          if (showViewDropdown) {
            setShowViewDropdown(false);
          }
        }}
      >
        {/* Chart Section */}
        {transactions.length > 0 && (
          <View style={styles.chartContainer}>
            <View style={styles.chartHeader}>
              {/* Date Selector - Left */}
              <View style={styles.chartNav}>
                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setPeriodOffset(periodOffset - 1);
                  }}
                  style={styles.chartNavButton}
                >
                  <ChevronLeft size={18} color={theme.text} />
                </Pressable>
                <Text style={styles.chartPeriod}>{periodLabel}</Text>
                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setPeriodOffset(periodOffset + 1);
                  }}
                  style={styles.chartNavButton}
                >
                  <ChevronRight size={18} color={theme.text} />
                </Pressable>
              </View>

              {/* View Selector - Right */}
              <View style={styles.chartViewDropdown}>
                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setShowViewDropdown(!showViewDropdown);
                  }}
                  style={styles.chartViewDropdownButton}
                >
                  <Text style={styles.chartViewDropdownText}>
                    {viewType === "week" ? "Week" : "Month"}
                  </Text>
                  <ChevronDown size={16} color={theme.textSecondary} />
                </Pressable>
                {showViewDropdown && (
                  <View style={styles.chartViewDropdownMenuWrapper}>
                    <View style={styles.chartViewDropdownMenu}>
                      <Pressable
                        onPress={() => {
                          Haptics.impactAsync(
                            Haptics.ImpactFeedbackStyle.Light
                          );
                          setViewType("week");
                          setPeriodOffset(0);
                          setShowViewDropdown(false);
                        }}
                        style={[
                          styles.chartViewDropdownMenuItem,
                          viewType === "week" && {
                            backgroundColor: theme.surfaceHighlight,
                          },
                        ]}
                      >
                        <Text style={styles.chartViewDropdownMenuItemText}>
                          Week
                        </Text>
                      </Pressable>
                      <Pressable
                        onPress={() => {
                          Haptics.impactAsync(
                            Haptics.ImpactFeedbackStyle.Light
                          );
                          setViewType("month");
                          setPeriodOffset(0);
                          setShowViewDropdown(false);
                        }}
                        style={[
                          styles.chartViewDropdownMenuItem,
                          styles.chartViewDropdownMenuItemLast,
                          viewType === "month" && {
                            backgroundColor: theme.surfaceHighlight,
                          },
                        ]}
                      >
                        <Text style={styles.chartViewDropdownMenuItemText}>
                          Month
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                )}
              </View>
            </View>
            <View style={styles.chartWrapper}>
              <BarChart
                data={{
                  labels: chartData.labels,
                  datasets: [{ data: chartData.data }],
                }}
                width={Dimensions.get("window").width - 40}
                height={200}
                yAxisLabel="$"
                yAxisSuffix=""
                chartConfig={{
                  backgroundColor: "transparent",
                  backgroundGradientFrom: "transparent",
                  backgroundGradientTo: "transparent",
                  decimalPlaces: 0,
                  color: (opacity = 1) => {
                    // Convert hex color to rgba
                    const hex = theme.expense.replace("#", "");
                    const r = parseInt(hex.substring(0, 2), 16);
                    const g = parseInt(hex.substring(2, 4), 16);
                    const b = parseInt(hex.substring(4, 6), 16);
                    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
                  },
                  labelColor: (opacity = 1) => {
                    // Convert hex color to rgba
                    const hex = theme.textSecondary.replace("#", "");
                    const r = parseInt(hex.substring(0, 2), 16);
                    const g = parseInt(hex.substring(2, 4), 16);
                    const b = parseInt(hex.substring(4, 6), 16);
                    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
                  },
                  style: {
                    borderRadius: 0,
                  },
                  propsForBackgroundLines: {
                    strokeDasharray: "",
                    stroke: theme.divider,
                    strokeWidth: 0.5,
                  },
                  propsForLabels: {
                    fontSize: 11,
                    fontWeight: "400",
                  },
                  barPercentage: 0.6,
                  fillShadowGradient: theme.expense,
                  fillShadowGradientOpacity: 1,
                }}
                verticalLabelRotation={0}
                fromZero
                showValuesOnTopOfBars={false}
                withInnerLines={true}
                withHorizontalLabels={true}
                withVerticalLabels={true}
                segments={4}
              />
            </View>
          </View>
        )}

        {isLoading && transactions.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.primary} />
          </View>
        ) : filteredTransactions.length === 0 ? (
          <View style={styles.emptyStateWrapper}>
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                {transactions.length === 0
                  ? "No transactions yet"
                  : "No transactions in this period"}
              </Text>
              <Text style={styles.emptySubtext}>
                {transactions.length === 0
                  ? "Import transactions from CSV or add them manually to get started"
                  : "Change the period or add new transactions"}
              </Text>
            </View>
          </View>
        ) : (
          groupedTransactions.map(([dateKey, dateTransactions]) => (
            <View key={dateKey} style={styles.transactionGroup}>
              <Text style={styles.dateHeader}>{formatDate(dateKey)}</Text>
              {dateTransactions.map((transaction) => (
                <Pressable
                  key={transaction.id}
                  style={styles.transactionItemWrapper}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.push({
                      pathname: "/transaction-detail",
                      params: { id: transaction.id },
                    });
                  }}
                >
                  <View style={styles.transactionItem}>
                    <View style={styles.transactionLeft}>
                      <Text style={styles.transactionDescription}>
                        {transaction.description || "No description"}
                      </Text>
                      <View style={styles.transactionMeta}>
                        <Text style={styles.transactionCategory}>
                          {getCategoryName(transaction.category_id)}
                        </Text>
                        {transaction.account && (
                          <>
                            <Text style={{ color: theme.textTertiary }}>•</Text>
                            <Text style={styles.transactionAccount}>
                              {transaction.account}
                            </Text>
                          </>
                        )}
                      </View>
                    </View>
                    <Text
                      style={[
                        styles.transactionAmount,
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
                  </View>
                </Pressable>
              ))}
            </View>
          ))
        )}
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
