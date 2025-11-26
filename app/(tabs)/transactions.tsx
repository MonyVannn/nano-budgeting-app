import { FABButton } from "@/components/FABButton";
import { Text } from "@/components/Themed";
import { useTheme } from "@/constants/ThemeContext";
import { useAuthStore, useCategoryStore, useTransactionStore } from "@/store";
import * as Haptics from "expo-haptics";
import { router, useFocusEffect } from "expo-router";
import {
  ArrowDownRight,
  ArrowUpRight,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react-native";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { BarChart } from "react-native-gifted-charts";
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
  const [chartMode, setChartMode] = useState<"expense" | "income">("expense");

  // Fetch transactions and categories on mount and when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (user?.id) {
        fetchTransactions(user.id);
        fetchCategories(user.id);
      }
    }, [user?.id, fetchTransactions, fetchCategories])
  );

  // Helper function to format date as YYYY-MM-DD in local timezone
  const formatDateLocal = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

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
    // Normalize dates to compare properly (ignore time component) - use local timezone
    const startDateStr = formatDateLocal(start);
    const endDateStr = formatDateLocal(end);

    return transactions.filter((txn) => {
      // Transaction date is already in YYYY-MM-DD format
      const txnDateStr = txn.date.split("T")[0]; // Handle potential timestamp
      return txnDateStr >= startDateStr && txnDateStr <= endDateStr;
    });
  }, [transactions, currentPeriod]);

  // Prepare chart data
  const chartData = useMemo(() => {
    const { start, end } = currentPeriod;
    const days: {
      [key: string]: { expense: number; income: number };
    } = {};

    // Initialize all days in period with 0 - use local timezone
    const startDateStr = formatDateLocal(start);
    const endDateStr = formatDateLocal(end);
    const current = new Date(start);
    const endDate = new Date(end);

    while (current <= endDate) {
      const dateKey = formatDateLocal(current);
      days[dateKey] = { expense: 0, income: 0 };
      current.setDate(current.getDate() + 1);
    }

    // Sum expenses for each day
    filteredTransactions.forEach((txn) => {
      const dateKey = txn.date.split("T")[0];
      if (days[dateKey] !== undefined) {
        if (txn.is_expense) {
          days[dateKey].expense += Number(txn.amount) || 0;
        } else {
          days[dateKey].income += Number(txn.amount) || 0;
        }
      }
    });

    // Format for chart - only include days with transactions or all days for week view
    let dayEntries: Array<[string, { expense: number; income: number }]> = [];

    if (viewType === "week") {
      // For week view, show all 7 days
      dayEntries = Object.entries(days).sort((a, b) =>
        a[0].localeCompare(b[0])
      );
    } else {
      // For month view, only show days that have transactions (non-zero amounts)
      dayEntries = Object.entries(days)
        .filter(([_, amount]) =>
          chartMode === "expense" ? amount.expense > 0 : amount.income > 0
        )
        .sort((a, b) => a[0].localeCompare(b[0]));
    }

    let chartDataPoints: Array<{ value: number; label: string }> = [];

    if (viewType === "week") {
      chartDataPoints = dayEntries.map(([date, amount]) => {
        const d = new Date(date + "T00:00:00"); // Add time to avoid timezone issues
        return {
          value: chartMode === "expense" ? amount.expense : amount.income,
          label: d.toLocaleDateString("en-US", { weekday: "short" }),
        };
      });
    } else {
      // For month view, show all days with transactions
      // If there are many days, we might need to limit labels to prevent crowding
      chartDataPoints = dayEntries.map(([date, amount]) => {
        const d = new Date(date + "T00:00:00"); // Add time to avoid timezone issues
        // Use M/D format (e.g., "11/5") for month view
        return {
          value: chartMode === "expense" ? amount.expense : amount.income,
          label: `${d.getMonth() + 1}/${d.getDate()}`,
        };
      });
    }

    return chartDataPoints;
  }, [filteredTransactions, viewType, currentPeriod, chartMode]);

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
    // Parse date string (YYYY-MM-DD) in local timezone
    const [year, month, day] = dateString.split("T")[0].split("-").map(Number);
    const date = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Compare dates without time
    const dateOnly = new Date(date);
    dateOnly.setHours(0, 0, 0, 0);

    if (dateOnly.getTime() === today.getTime()) {
      return "Today";
    } else if (dateOnly.getTime() === yesterday.getTime()) {
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
        emptyChartState: {
          height: 200,
          alignItems: "center",
          justifyContent: "center",
        },
        emptyChartText: {
          fontSize: 14,
          color: theme.textSecondary,
        },
        chartActions: {
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
        },
        chartModeIconButton: {
          width: 32,
          height: 32,
          borderRadius: 20,
          alignItems: "center",
          justifyContent: "center",
          borderWidth: 1,
          borderColor: theme.divider,
        },
        chartModeIconExpense: {
          backgroundColor: theme.expense,
          borderColor: theme.expense,
        },
        chartModeIconIncome: {
          backgroundColor: theme.income,
          borderColor: theme.income,
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
          <Text style={styles.title}>Transactions</Text>
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

              {/* Actions - mode toggle + view selector */}
              <View style={styles.chartActions}>
                <Pressable
                  style={[
                    styles.chartModeIconButton,
                    chartMode === "expense"
                      ? styles.chartModeIconExpense
                      : styles.chartModeIconIncome,
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setChartMode(
                      chartMode === "expense" ? "income" : "expense"
                    );
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`Show ${
                    chartMode === "expense" ? "income" : "expenses"
                  } in chart`}
                >
                  {chartMode === "expense" ? (
                    <ArrowDownRight size={18} color={theme.background} />
                  ) : (
                    <ArrowUpRight size={18} color={theme.background} />
                  )}
                </Pressable>
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
            </View>
            <View style={styles.chartWrapper}>
              {chartData.length === 0 ? (
                <View style={styles.emptyChartState}>
                  <Text style={styles.emptyChartText}>
                    {chartMode === "expense"
                      ? "No expenses in this period"
                      : "No income in this period"}
                  </Text>
                </View>
              ) : (
                (() => {
                  const screenWidth = Dimensions.get("window").width;
                  const chartWidth = screenWidth - 40; // Account for padding
                  const dataPoints = chartData.length;

                  // Calculate dynamic bar width and spacing to use full width
                  let barWidth: number;
                  let spacing: number;

                  if (viewType === "week") {
                    // For week (7 days), use fixed spacing
                    spacing = 8;
                    barWidth = Math.max(
                      20,
                      (chartWidth - (dataPoints - 1) * spacing - 60) /
                        Math.max(dataPoints, 1)
                    );
                  } else {
                    // For month, calculate based on number of data points (should be ~4-5 for 7 days apart)
                    spacing = 12;
                    barWidth = Math.max(
                      25,
                      (chartWidth - (dataPoints - 1) * spacing - 60) /
                        Math.max(dataPoints, 1)
                    );
                  }

                  const chartMax =
                    chartData.length > 0
                      ? Math.max(...chartData.map((entry) => entry.value), 0) *
                          1.1 || 100
                      : 100;

                  const chartColor =
                    chartMode === "expense" ? theme.expense : theme.income;

                  return (
                    <BarChart
                      key={`chart-${chartMode}-${viewType}-${
                        chartData.length
                      }-${JSON.stringify(chartData.map((d) => d.value))}`}
                      data={chartData}
                      width={chartWidth}
                      height={200}
                      barWidth={barWidth}
                      spacing={spacing}
                      frontColor={chartColor}
                      gradientColor={chartColor}
                      showGradient
                      isAnimated
                      animationDuration={800}
                      noOfSections={4}
                      maxValue={chartMax}
                      yAxisThickness={0.5}
                      xAxisThickness={0.5}
                      yAxisTextStyle={{
                        color: theme.textSecondary,
                        fontSize: 11,
                        fontWeight: "400",
                      }}
                      xAxisLabelTextStyle={{
                        color: theme.textSecondary,
                        fontSize: 10,
                        fontWeight: "400",
                      }}
                      rulesColor={theme.divider}
                      rulesType="solid"
                      showYAxisIndices={false}
                      showXAxisIndices={false}
                      formatYLabel={(value) =>
                        `$${Math.round(parseFloat(value))}`
                      }
                      showValuesAsTopLabel={false}
                      barBorderTopLeftRadius={4}
                      barBorderTopRightRadius={4}
                      backgroundColor="transparent"
                    />
                  );
                })()
              )}
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
