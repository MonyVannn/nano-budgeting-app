import { TabScreenWrapper } from "@/components/TabScreenWrapper";
import { Text } from "@/components/Themed";
import { useTheme } from "@/constants/ThemeContext";
import { useAuthStore, useCategoryStore, useTransactionStore } from "@/store";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, {
  Circle,
  Path,
  Line as SvgLine,
  Text as SvgText,
} from "react-native-svg";

type RangeKey = "30d" | "90d" | "12m";
type ThemeShape = ReturnType<typeof useTheme>["theme"];
type ChartPoint = {
  label: string;
  value: number;
  date: Date;
  displayLabel?: boolean;
};
type DonutSegment = {
  label: string;
  value: number;
  percentage: number;
};
type BudgetPacingRow = {
  id: string;
  name: string;
  spent: number;
  budget: number;
  usage: number;
};

const RANGE_OPTIONS: Array<{
  key: RangeKey;
  label: string;
  helper: string;
  days?: number;
  months?: number;
}> = [
  { key: "30d", label: "30 Days", helper: "Current month-to-date", days: 30 },
  { key: "90d", label: "Quarter", helper: "Rolling 90-day view", days: 90 },
  {
    key: "12m",
    label: "12 Months",
    helper: "Year-over-year trend",
    months: 12,
  },
];

const DAY_MS = 1000 * 60 * 60 * 24;
const NICE_STEP_MULTIPLIERS = [1, 2, 5, 10] as const;

function getNiceStep(value: number) {
  if (!isFinite(value) || value <= 0) {
    return 1;
  }
  const exponent = Math.floor(Math.log10(value));
  const base = Math.pow(10, exponent);
  for (const multiplier of NICE_STEP_MULTIPLIERS) {
    const step = multiplier * base;
    if (value <= step) {
      return step;
    }
  }
  return 10 * base;
}
export default function ReportScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const { user } = useAuthStore();
  const {
    transactions,
    fetchTransactions,
    isLoading: isTransactionLoading,
  } = useTransactionStore();
  const {
    categories,
    fetchCategories,
    isLoading: isCategoryLoading,
  } = useCategoryStore();

  const [selectedRangeKey, setSelectedRangeKey] = useState<RangeKey>("30d");

  // Memoized handler for range selection
  const handleRangeChange = useCallback((key: RangeKey) => {
    setSelectedRangeKey(key);
  }, []);

  // Fetch only on initial mount, not on every focus
  useEffect(() => {
    if (!user?.id) return;
    // Only fetch if we don't have data yet to avoid unnecessary delays
    if (transactions.length === 0 && !isTransactionLoading) {
      fetchTransactions(user.id);
    }
    if (categories.length === 0 && !isCategoryLoading) {
      fetchCategories(user.id);
    }
  }, [user?.id]); // Only run when user changes, not on every focus

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
          gap: 4,
        },
        title: {
          fontSize: 24,
          fontWeight: "700",
          color: theme.text,
        },
        subtitle: {
          fontSize: 13,
          color: theme.textSecondary,
        },
        content: {
          flex: 1,
          paddingHorizontal: 20,
          backgroundColor: theme.background,
        },
        contentContainer: {
          paddingTop: Platform.OS === "ios" ? insets.top + 80 : 100,
          paddingBottom: 40,
          gap: 24,
        },
        section: {
          gap: 16,
        },
        sectionHeader: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        },
        sectionTitle: {
          fontSize: 16,
          fontWeight: "700",
          color: theme.text,
        },
        sectionHelper: {
          fontSize: 12,
          color: theme.textSecondary,
        },
        filterRow: {
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 12,
        },
        filterChip: {
          paddingVertical: 8,
          paddingHorizontal: 14,
          borderRadius: 999,
          borderWidth: 1,
          borderColor: theme.divider,
          backgroundColor: theme.surface,
        },
        filterChipActive: {
          backgroundColor: theme.primary,
          borderColor: theme.primary,
        },
        filterText: {
          fontSize: 13,
          fontWeight: "600",
          color: theme.textSecondary,
        },
        filterTextActive: {
          color: theme.background,
        },
        metricGrid: {
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 12,
        },
        metricCard: {
          flexGrow: 1,
          minWidth: "48%",
          borderRadius: 16,
          padding: 16,
          backgroundColor: theme.surface,
          borderWidth: 1,
          borderColor: theme.divider,
          gap: 6,
        },
        metricLabel: {
          fontSize: 12,
          color: theme.textSecondary,
          letterSpacing: 0.4,
          textTransform: "uppercase",
        },
        metricValue: {
          fontSize: 24,
          fontWeight: "700",
          color: theme.text,
        },
        metricDelta: {
          fontSize: 12,
          color: theme.textTertiary,
        },
        chartCard: {
          borderRadius: 20,
          padding: 16,
          backgroundColor: theme.surface,
          borderWidth: 1,
          borderColor: theme.divider,
          gap: 16,
          overflow: "hidden",
        },
        chartHeaderRow: {
          flexDirection: "row",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 12,
        },
        chartHeader: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        },
        chartTitle: {
          fontSize: 15,
          fontWeight: "700",
          color: theme.text,
        },
        chartSubtitle: {
          fontSize: 12,
          color: theme.textSecondary,
          marginTop: 4,
        },
        chartRange: {
          fontSize: 12,
          color: theme.textSecondary,
        },
        chartValueStack: {
          alignItems: "flex-end",
        },
        chartValueLabel: {
          fontSize: 12,
          color: theme.textSecondary,
          textTransform: "uppercase",
          letterSpacing: 0.6,
        },
        chartValueHighlight: {
          fontSize: 20,
          fontWeight: "700",
          color: theme.text,
        },
        chartValueSubtext: {
          fontSize: 12,
          color: theme.textSecondary,
        },
        legendRow: {
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 12,
        },
        chartFooter: {
          marginTop: 8,
        },
        chartFooterText: {
          fontSize: 12,
          color: theme.textSecondary,
          lineHeight: 16,
        },
        barGroup: {
          gap: 16,
        },
        barRow: {
          gap: 6,
        },
        barRowHeader: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        },
        barLabel: {
          fontSize: 13,
          fontWeight: "600",
          color: theme.text,
        },
        barValue: {
          fontSize: 14,
          fontWeight: "700",
          color: theme.text,
        },
        barHelper: {
          fontSize: 12,
          color: theme.textSecondary,
        },
        barTrack: {
          width: "100%",
          height: 8,
          borderRadius: 999,
          backgroundColor: theme.surfaceHighlight,
          overflow: "hidden",
        },
        barFill: {
          height: "100%",
          borderRadius: 999,
        },
        legendPill: {
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          paddingVertical: 4,
          paddingHorizontal: 10,
          borderRadius: 999,
          backgroundColor: "transparent",
        },
        legendDot: {
          width: 10,
          height: 10,
          borderRadius: 5,
        },
        legendLabel: {
          fontSize: 12,
          fontWeight: "600",
          color: theme.text,
        },
        legendLine: {
          width: 30,
          height: 2,
          borderRadius: 999,
        },
        legendLineDashed: {
          backgroundColor: "transparent",
          borderBottomWidth: 2,
          borderStyle: "dashed",
        },
        legendValue: {
          fontSize: 12,
          color: theme.textSecondary,
        },
        pieLegend: {
          gap: 8,
        },
        pieLegendRow: {
          flexDirection: "row",
          alignItems: "flex-start",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 6,
        },
        pieLegendLabel: {
          flex: 1,
          fontSize: 13,
          fontWeight: "600",
          color: theme.text,
        },
        pieLegendValue: {
          fontSize: 12,
          color: theme.textSecondary,
          textAlign: "right",
          flexShrink: 1,
        },
        insightGrid: {
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 12,
        },
        insightCard: {
          flexGrow: 1,
          minWidth: "48%",
          borderRadius: 16,
          padding: 16,
          backgroundColor: theme.surface,
          borderWidth: 1,
          borderColor: theme.divider,
          gap: 4,
        },
        insightLabel: {
          fontSize: 12,
          color: theme.textSecondary,
          textTransform: "uppercase",
          letterSpacing: 0.5,
        },
        insightValue: {
          fontSize: 16,
          fontWeight: "700",
          color: theme.text,
        },
        insightSubtext: {
          fontSize: 12,
          color: theme.textTertiary,
        },
        emptyStateWrapper: {
          borderRadius: 20,
          borderWidth: 1,
          borderColor: theme.divider,
          backgroundColor: theme.surface,
          padding: 32,
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
          marginTop: 12,
        },
        emptyTitle: {
          fontSize: 18,
          fontWeight: "700",
          color: theme.text,
        },
        emptySubtitle: {
          fontSize: 14,
          color: theme.textSecondary,
          textAlign: "center",
        },
        loadingWrapper: {
          marginTop: 32,
          alignItems: "center",
          gap: 12,
        },
        pieChartLabel: {
          flexDirection: "row",
          justifyContent: "space-between",
          width: "95%",
        },
      }),
    [theme, insets]
  );

  const selectedRange = RANGE_OPTIONS.find(
    (option) => option.key === selectedRangeKey
  )!;

  const rangeStart = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    if (selectedRange.months) {
      start.setDate(1);
      start.setMonth(start.getMonth() - (selectedRange.months - 1));
    } else if (selectedRange.days) {
      start.setDate(start.getDate() - (selectedRange.days - 1));
    }
    return start;
  }, [selectedRange]);

  const rangeEnd = useMemo(() => {
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    return end;
  }, [selectedRangeKey]);

  const rangeLabel = useMemo(() => {
    const startLabel = rangeStart.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    const endLabel = rangeEnd.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year:
        rangeStart.getFullYear() === rangeEnd.getFullYear()
          ? undefined
          : "numeric",
    });
    return `${startLabel} – ${endLabel}`;
  }, [rangeStart, rangeEnd]);

  const chartMonthLabel = useMemo(
    () =>
      rangeEnd.toLocaleDateString("en-US", {
        month: "long",
      }),
    [rangeEnd]
  );

  const parseTransactionDate = useCallback((value: string | null) => {
    if (!value) return null;
    const [datePart] = value.split("T");
    if (!datePart) return null;
    const [year, month, day] = datePart.split("-").map(Number);
    if (!year || !month || !day) return null;
    return new Date(year, month - 1, day);
  }, []);

  const filteredTransactions = useMemo(() => {
    const startTime = rangeStart.getTime();
    const endTime = rangeEnd.getTime();
    return transactions.filter((txn) => {
      const txnDate = parseTransactionDate(txn.date);
      if (!txnDate) return false;
      const time = txnDate.getTime();
      return time >= startTime && time <= endTime;
    });
  }, [transactions, rangeStart, rangeEnd, parseTransactionDate]);

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }),
    []
  );

  const preciseCurrencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    []
  );

  const formatCurrency = useCallback(
    (value: number, precise = false) =>
      (precise ? preciseCurrencyFormatter : currencyFormatter).format(value),
    [currencyFormatter, preciseCurrencyFormatter]
  );

  const daysInRange = Math.max(
    1,
    Math.round((rangeEnd.getTime() - rangeStart.getTime()) / DAY_MS) + 1
  );

  const totals = useMemo(() => {
    return filteredTransactions.reduce(
      (acc, txn) => {
        const amount = Number(txn.amount) || 0;
        if (txn.is_expense) {
          acc.expense += amount;
        } else {
          acc.income += amount;
        }
        return acc;
      },
      { income: 0, expense: 0 }
    );
  }, [filteredTransactions]);

  const netAmount = totals.income - totals.expense;
  const savingsRate =
    totals.income > 0 ? Math.round((netAmount / totals.income) * 100) : 0;
  const avgDailySpend = totals.expense / daysInRange || 0;

  const getCategoryName = useCallback(
    (categoryId: string | null) => {
      if (!categoryId) return "Uncategorized";
      const match = categories.find((category) => category.id === categoryId);
      return match?.name || "Unknown";
    },
    [categories]
  );

  const categoryBreakdown = useMemo(() => {
    const spendingMap = new Map<string, number>();
    filteredTransactions.forEach((txn) => {
      if (!txn.is_expense) return;
      const key = txn.category_id || "uncategorized";
      const amount = Number(txn.amount) || 0;
      spendingMap.set(key, (spendingMap.get(key) || 0) + amount);
    });
    return Array.from(spendingMap.entries()).sort((a, b) => b[1] - a[1]);
  }, [filteredTransactions]);

  const insights = useMemo(() => {
    const largestExpense = filteredTransactions
      .filter((txn) => txn.is_expense)
      .reduce(
        (acc, txn) => {
          const amount = Number(txn.amount) || 0;
          if (amount > acc.amount) {
            return {
              amount,
              name: txn.description || getCategoryName(txn.category_id),
            };
          }
          return acc;
        },
        { amount: 0, name: "—" }
      );

    const averageExpense = (() => {
      const expenses = filteredTransactions.filter((txn) => txn.is_expense);
      if (!expenses.length) return 0;
      const total = expenses.reduce(
        (sum, txn) => sum + (Number(txn.amount) || 0),
        0
      );
      return total / expenses.length;
    })();

    return [
      {
        label: "Top Category",
        value:
          categoryBreakdown.length > 0
            ? getCategoryName(
                categoryBreakdown[0][0] === "uncategorized"
                  ? null
                  : categoryBreakdown[0][0]
              )
            : "No spending",
        subtext:
          categoryBreakdown.length > 0
            ? formatCurrency(categoryBreakdown[0][1], true)
            : undefined,
      },
      {
        label: "Average Expense",
        value: formatCurrency(averageExpense, true),
        subtext: "Per transaction",
      },
      {
        label: "Largest Expense",
        value: formatCurrency(largestExpense.amount, true),
        subtext: largestExpense.name,
      },
      {
        label: "Expense Count",
        value: String(
          filteredTransactions.filter((txn) => txn.is_expense).length
        ),
        subtext: "Transactions in range",
      },
    ];
  }, [
    filteredTransactions,
    categoryBreakdown,
    formatCurrency,
    getCategoryName,
  ]);

  const categorySpendingMap = useMemo(
    () => new Map(categoryBreakdown),
    [categoryBreakdown]
  );

  const categoryDonutData = useMemo(() => {
    const totalSpent = totals.expense;
    if (totalSpent <= 0) {
      return { total: 0, segments: [] as DonutSegment[] };
    }

    const baseSegments = categoryBreakdown.slice(0, 4).map(([id, amount]) => {
      const label =
        id === "uncategorized" ? getCategoryName(null) : getCategoryName(id);
      return {
        label,
        value: amount,
        percentage: (amount / totalSpent) * 100,
      };
    });

    const accounted = baseSegments.reduce((sum, seg) => sum + seg.value, 0);
    const remainder = totalSpent - accounted;
    if (remainder > 0.01) {
      baseSegments.push({
        label: "Other",
        value: remainder,
        percentage: (remainder / totalSpent) * 100,
      });
    }

    return {
      total: totalSpent,
      segments: baseSegments,
    };
  }, [categoryBreakdown, totals.expense, getCategoryName]);

  const budgetPacingRows = useMemo((): BudgetPacingRow[] => {
    return categories
      .filter(
        (category) =>
          category.type === "expense" &&
          (Number(category.expected_amount) || 0) > 0
      )
      .map((category) => {
        const budget = Number(category.expected_amount) || 0;
        const spent = categorySpendingMap.get(category.id) || 0;
        const usage = budget > 0 ? spent / budget : 0;
        return {
          id: category.id,
          name: category.name,
          spent,
          budget,
          usage,
        };
      })
      .filter((row) => row.budget > 0)
      .sort((a, b) => b.usage - a.usage)
      .slice(0, 5);
  }, [categories, categorySpendingMap]);

  const totalBudgeted = useMemo(() => {
    return categories
      .filter((category) => category.type === "expense")
      .reduce(
        (sum, category) => sum + (Number(category.expected_amount) || 0),
        0
      );
  }, [categories]);

  const monthlyChart = useMemo(() => {
    const startDate = new Date(rangeStart.getTime());
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(rangeEnd.getTime());
    endDate.setHours(0, 0, 0, 0);

    if (startDate.getTime() > endDate.getTime()) {
      return { points: [] as ChartPoint[], ticks: [0], maxValue: 0 };
    }

    const expenseTransactions = filteredTransactions
      .filter((txn) => txn.is_expense)
      .map((txn) => {
        const txnDate = parseTransactionDate(txn.date);
        if (!txnDate) return null;
        txnDate.setHours(0, 0, 0, 0);
        return {
          date: txnDate,
          amount: Number(txn.amount) || 0,
        };
      })
      .filter(Boolean) as Array<{ date: Date; amount: number }>;

    const dailyTotals = new Map<string, number>();
    expenseTransactions.forEach(({ date, amount }) => {
      const key = date.toISOString().split("T")[0];
      dailyTotals.set(key, (dailyTotals.get(key) || 0) + amount);
    });

    const points: ChartPoint[] = [];
    const cursor = new Date(startDate.getTime());
    let runningTotal = 0;

    while (cursor.getTime() <= endDate.getTime()) {
      const key = cursor.toISOString().split("T")[0];
      runningTotal += dailyTotals.get(key) || 0;

      points.push({
        label: cursor.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        value: Number(runningTotal.toFixed(2)),
        date: new Date(cursor.getTime()),
      });

      cursor.setDate(cursor.getDate() + 1);
    }

    if (!points.length) {
      points.push({
        label: startDate.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        value: 0,
        date: startDate,
      });
    }

    const maxLabels = Math.min(4, points.length);
    if (maxLabels > 0) {
      const labelIndices = new Set<number>();
      if (maxLabels === points.length) {
        points.forEach((_, index) => labelIndices.add(index));
      } else {
        const interval = (points.length - 1) / (maxLabels - 1);
        for (let i = 0; i < maxLabels; i++) {
          labelIndices.add(Math.round(i * interval));
        }
      }

      points.forEach((point, index) => {
        point.displayLabel = labelIndices.has(index);
      });
    }

    const peakValue = points.reduce(
      (max, point) => Math.max(max, point.value),
      0
    );
    const targetMax = Math.max(peakValue, totalBudgeted, 1);
    const roughStep = targetMax / 4 || 1;
    const step = Math.max(10, getNiceStep(roughStep));
    let chartMax = Math.ceil(targetMax / step) * step;
    if (chartMax === 0) {
      chartMax = step;
    }

    const ticks: number[] = [];
    const tickCount = Math.max(1, Math.round(chartMax / step));
    for (let i = 0; i <= tickCount; i++) {
      const value = Number((i * step).toFixed(2));
      if (!ticks.includes(value)) {
        ticks.push(value);
      }
    }
    if (ticks[ticks.length - 1] !== chartMax) {
      ticks.push(chartMax);
    }

    return {
      points,
      ticks,
      maxValue: chartMax,
    };
  }, [
    filteredTransactions,
    parseTransactionDate,
    rangeStart,
    rangeEnd,
    totalBudgeted,
  ]);

  const monthlyComparisonChart = useMemo(() => {
    const currentPoints = monthlyChart.points;
    const pointCount = currentPoints.length;
    if (!pointCount) {
      return {
        currentPoints,
        previousPoints: [] as ChartPoint[],
        ticks: monthlyChart.ticks,
        maxValue: monthlyChart.maxValue,
      };
    }

    const previousRangeEnd = new Date(rangeStart.getTime());
    previousRangeEnd.setDate(previousRangeEnd.getDate() - 1);
    previousRangeEnd.setHours(0, 0, 0, 0);

    const previousRangeStart = new Date(previousRangeEnd.getTime());
    previousRangeStart.setDate(previousRangeStart.getDate() - (pointCount - 1));
    previousRangeStart.setHours(0, 0, 0, 0);

    const previousDailyTotals = new Map<string, number>();
    transactions.forEach((txn) => {
      if (!txn.is_expense) return;
      const txnDate = parseTransactionDate(txn.date);
      if (!txnDate) return;
      txnDate.setHours(0, 0, 0, 0);
      if (
        txnDate.getTime() >= previousRangeStart.getTime() &&
        txnDate.getTime() <= previousRangeEnd.getTime()
      ) {
        const key = txnDate.toISOString().split("T")[0];
        previousDailyTotals.set(
          key,
          (previousDailyTotals.get(key) || 0) + (Number(txn.amount) || 0)
        );
      }
    });

    const previousPoints: ChartPoint[] = [];
    const cursor = new Date(previousRangeStart.getTime());
    let runningTotal = 0;
    let index = 0;
    while (cursor.getTime() <= previousRangeEnd.getTime()) {
      const key = cursor.toISOString().split("T")[0];
      runningTotal += previousDailyTotals.get(key) || 0;
      previousPoints.push({
        label: currentPoints[index]?.label || "",
        value: Number(runningTotal.toFixed(2)),
        date: new Date(cursor.getTime()),
        displayLabel: currentPoints[index]?.displayLabel,
      });
      cursor.setDate(cursor.getDate() + 1);
      index += 1;
    }

    if (!previousPoints.length) {
      previousPoints.push({
        label: currentPoints[0]?.label || "",
        value: 0,
        date: previousRangeStart,
        displayLabel: currentPoints[0]?.displayLabel,
      });
    }

    const peakCurrent = currentPoints.reduce(
      (max, point) => Math.max(max, point.value),
      0
    );
    const peakPrevious = previousPoints.reduce(
      (max, point) => Math.max(max, point.value),
      0
    );
    const targetMax = Math.max(peakCurrent, peakPrevious, 1);
    const roughStep = targetMax / 4 || 1;
    const step = Math.max(10, getNiceStep(roughStep));
    let chartMax = Math.ceil(targetMax / step) * step;
    if (chartMax === 0) {
      chartMax = step;
    }

    const ticks: number[] = [];
    const tickCount = Math.max(1, Math.round(chartMax / step));
    for (let i = 0; i <= tickCount; i++) {
      const value = Number((i * step).toFixed(2));
      if (!ticks.includes(value)) {
        ticks.push(value);
      }
    }
    if (ticks[ticks.length - 1] !== chartMax) {
      ticks.push(chartMax);
    }

    return {
      currentPoints,
      previousPoints,
      ticks,
      maxValue: chartMax,
    };
  }, [
    monthlyChart.points,
    monthlyChart.ticks,
    monthlyChart.maxValue,
    parseTransactionDate,
    rangeStart,
    transactions,
  ]);

  const hasTransactions = filteredTransactions.length > 0;
  const isLoading = isTransactionLoading || isCategoryLoading;
  const chartWidth = Math.max(300, windowWidth - 40);
  const peakSpendValue =
    monthlyChart.points[monthlyChart.points.length - 1]?.value || 0;
  const peakSpendDateLabel =
    monthlyChart.points[monthlyChart.points.length - 1]?.label;
  const lastMonthTotal =
    monthlyComparisonChart.previousPoints[
      monthlyComparisonChart.previousPoints.length - 1
    ]?.value || 0;
  const monthDelta = peakSpendValue - lastMonthTotal;
  const donutPalette = [
    theme.chartGreen,
    theme.chartRed,
    theme.chartYellow,
    theme.chartNeon,
    theme.textSecondary,
  ];
  const coloredDonutSegments = categoryDonutData.segments.map(
    (segment, index) => ({
      ...segment,
      color: donutPalette[index % donutPalette.length],
    })
  );

  return (
    <TabScreenWrapper screenIndex={2}>
      <View style={styles.container}>
        <View
          style={[
            styles.stickyHeader,
            { paddingTop: Platform.OS === "ios" ? insets.top + 20 : 40 },
          ]}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Report</Text>
          </View>
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Reporting Window</Text>
              <Text style={styles.sectionHelper}>{rangeLabel}</Text>
            </View>
            <View style={styles.filterRow}>
              {RANGE_OPTIONS.map((option) => {
                const isActive = option.key === selectedRangeKey;
                return (
                  <Pressable
                    key={option.key}
                    style={[
                      styles.filterChip,
                      isActive && styles.filterChipActive,
                    ]}
                    onPress={() => handleRangeChange(option.key)}
                  >
                    <Text
                      style={[
                        styles.filterText,
                        isActive && styles.filterTextActive,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.metricGrid}>
              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>Total Income</Text>
                <Text style={[styles.metricValue, { color: theme.text }]}>
                  {formatCurrency(totals.income)}
                </Text>
                <Text style={styles.metricDelta}>In selected window</Text>
              </View>
              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>Total Expenses</Text>
                <Text style={[styles.metricValue, { color: theme.text }]}>
                  {formatCurrency(totals.expense)}
                </Text>
                <Text style={styles.metricDelta}>Cash outflows</Text>
              </View>
              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>Net</Text>
                <Text style={[styles.metricValue, { color: theme.text }]}>
                  {formatCurrency(netAmount)}
                </Text>
                <Text style={styles.metricDelta}>
                  Savings rate {savingsRate}%
                </Text>
              </View>
              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>Avg. Daily Spend</Text>
                <Text style={styles.metricValue}>
                  {formatCurrency(avgDailySpend, true)}
                </Text>
                <Text style={styles.metricDelta}>{daysInRange} day window</Text>
              </View>
            </View>
          </View>

          {isLoading && !hasTransactions ? (
            <View style={styles.loadingWrapper}>
              <ActivityIndicator color={theme.primary} />
              <Text style={styles.sectionHelper}>
                Crunching the latest numbers…
              </Text>
            </View>
          ) : null}

          {!hasTransactions && !isLoading ? (
            <View style={styles.emptyStateWrapper}>
              <Text style={styles.emptyTitle}>No transactions yet</Text>
              <Text style={styles.emptySubtitle}>
                Import or add transactions to unlock detailed reporting, trend
                lines, and category breakdowns.
              </Text>
            </View>
          ) : null}

          <View style={styles.section}>
            <View style={styles.chartCard}>
              <View style={styles.chartHeaderRow}>
                <View>
                  <Text style={styles.chartTitle}>Monthly Spend vs Budget</Text>
                  <Text style={styles.chartSubtitle}>
                    Tracking {chartMonthLabel}'s cash outflows
                  </Text>
                </View>
                <View style={styles.chartValueStack}>
                  <Text style={styles.chartValueLabel}>Spent</Text>
                  <Text style={styles.chartValueHighlight}>
                    {formatCurrency(peakSpendValue)}
                  </Text>
                  <Text style={styles.chartValueSubtext}>
                    {peakSpendDateLabel
                      ? `As of ${peakSpendDateLabel}`
                      : "As of latest day"}
                  </Text>
                </View>
              </View>

              <MonthlySpendVsBudgetChart
                theme={theme}
                width={chartWidth}
                formatCurrency={formatCurrency}
                data={monthlyChart.points}
                ticks={monthlyChart.ticks}
                budgetValue={totalBudgeted}
                maxValue={monthlyChart.maxValue}
              />

              <View style={styles.legendRow}>
                <View style={styles.legendPill}>
                  <View
                    style={[
                      styles.legendLine,
                      { backgroundColor: theme.chartGreen },
                    ]}
                  />
                  <Text style={styles.legendLabel}>Spent</Text>
                </View>
                <View style={styles.legendPill}>
                  <View
                    style={[
                      styles.legendLine,
                      styles.legendLineDashed,
                      { borderColor: theme.chartRed },
                    ]}
                  />
                  <Text style={styles.legendLabel}>
                    {`Budgeted (${formatCurrency(totalBudgeted)})`}
                  </Text>
                </View>
              </View>

              <View style={styles.chartFooter}>
                <Text style={styles.chartFooterText}>
                  {totalBudgeted > 0
                    ? `Cumulative spending is ${
                        peakSpendValue > totalBudgeted ? "above" : "below"
                      } the ${formatCurrency(
                        totalBudgeted
                      )} budget target for this window.`
                    : "Track daily spending progress over the selected window even without a set budget."}
                </Text>
              </View>
            </View>
          </View>

          {categoryDonutData.segments.length ? (
            <View style={styles.section}>
              <View style={styles.chartCard}>
                <View style={styles.chartHeaderRow}>
                  <View>
                    <Text style={styles.chartTitle}>Spending by Category</Text>
                    <Text style={styles.chartSubtitle}>
                      Month-to-date distribution
                    </Text>
                  </View>
                  <View style={styles.chartValueStack}>
                    <Text style={styles.chartValueLabel}>Total Spent</Text>
                    <Text style={styles.chartValueHighlight}>
                      {formatCurrency(categoryDonutData.total, true)}
                    </Text>
                    <Text style={styles.chartValueSubtext}>
                      Across tracked categories
                    </Text>
                  </View>
                </View>

                <CategoryDonutChart
                  theme={theme}
                  segments={coloredDonutSegments}
                  total={categoryDonutData.total}
                  formatCurrency={formatCurrency}
                />

                <View style={styles.pieLegend}>
                  {coloredDonutSegments.map((segment) => {
                    const color = segment.color;
                    return (
                      <View key={segment.label} style={styles.legendPill}>
                        <View
                          style={[styles.legendDot, { backgroundColor: color }]}
                        />
                        <View style={styles.pieChartLabel}>
                          <Text style={styles.legendLabel}>
                            {segment.label}
                          </Text>
                          <Text style={styles.legendValue}>
                            {segment.percentage.toFixed(1)}% (
                            {formatCurrency(segment.value, true)})
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>
            </View>
          ) : null}

          {budgetPacingRows.length ? (
            <View style={styles.section}>
              <View style={styles.chartCard}>
                <View style={styles.chartHeaderRow}>
                  <View>
                    <Text style={styles.chartTitle}>Budget Pacing Status</Text>
                    <Text style={styles.chartSubtitle}>
                      Track category limits at a glance
                    </Text>
                  </View>
                </View>

                <View style={styles.barGroup}>
                  {budgetPacingRows.map((row) => {
                    const progressWidth = `${Math.min(
                      row.usage * 100,
                      100
                    )}%` as `${number}%`;
                    const progressColor =
                      row.usage < 0.75
                        ? theme.chartGreen
                        : row.usage < 0.9
                        ? theme.chartYellow
                        : theme.chartRed;
                    return (
                      <View key={row.id} style={styles.barRow}>
                        <View style={styles.barRowHeader}>
                          <Text style={styles.barLabel}>{row.name}</Text>
                          <Text style={styles.barValue}>
                            {Math.min(row.usage * 100, 999).toFixed(0)}%
                          </Text>
                        </View>
                        <View style={styles.barTrack}>
                          <View
                            style={[
                              styles.barFill,
                              {
                                width: progressWidth,
                                backgroundColor: progressColor,
                              },
                            ]}
                          />
                        </View>
                        <Text style={styles.barHelper}>
                          {formatCurrency(row.spent, true)} of{" "}
                          {formatCurrency(row.budget, true)} spent
                        </Text>
                      </View>
                    );
                  })}
                </View>

                <View style={styles.chartFooter}>
                  <Text style={styles.chartFooterText}>
                    Green bars are on track, yellow signals attention, and red
                    indicates you&apos;re nearing or exceeding budget.
                  </Text>
                </View>
              </View>
            </View>
          ) : null}

          <View style={styles.section}>
            <View style={styles.chartCard}>
              <View style={styles.chartHeaderRow}>
                <View>
                  <Text style={styles.chartTitle}>
                    This Month vs Last Month
                  </Text>
                  <Text style={styles.chartSubtitle}>
                    Comparing {chartMonthLabel} to prior month
                  </Text>
                </View>
                <View style={styles.chartValueStack}>
                  <Text style={styles.chartValueLabel}>Delta</Text>
                  <Text
                    style={[
                      styles.chartValueHighlight,
                      {
                        color:
                          monthDelta >= 0 ? theme.chartGreen : theme.chartRed,
                      },
                    ]}
                  >
                    {formatCurrency(monthDelta)}
                  </Text>
                  <Text style={styles.chartValueSubtext}>
                    vs last month&apos;s {formatCurrency(lastMonthTotal)}
                  </Text>
                </View>
              </View>

              <ThisMonthVsLastMonthChart
                theme={theme}
                width={chartWidth}
                formatCurrency={formatCurrency}
                currentPoints={monthlyComparisonChart.currentPoints}
                previousPoints={monthlyComparisonChart.previousPoints}
                ticks={monthlyComparisonChart.ticks}
                maxValue={monthlyComparisonChart.maxValue}
              />

              <View style={styles.legendRow}>
                <View style={styles.legendPill}>
                  <View
                    style={[
                      styles.legendLine,
                      { backgroundColor: theme.chartGreen },
                    ]}
                  />
                  <Text style={styles.legendLabel}>This month</Text>
                </View>
                <View style={styles.legendPill}>
                  <View
                    style={[
                      styles.legendLine,
                      { backgroundColor: theme.textSecondary },
                    ]}
                  />
                  <Text style={styles.legendLabel}>Last month</Text>
                </View>
              </View>

              <View style={styles.chartFooter}>
                <Text style={styles.chartFooterText}>
                  {monthDelta >= 0
                    ? `${chartMonthLabel} spending is up ${formatCurrency(
                        monthDelta
                      )} versus last month.`
                    : `${chartMonthLabel} spending is down ${formatCurrency(
                        Math.abs(monthDelta)
                      )} versus last month.`}
                </Text>
              </View>
            </View>
          </View>

          {hasTransactions ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Highlights</Text>
              <View style={styles.insightGrid}>
                {insights.map((insight) => (
                  <View key={insight.label} style={styles.insightCard}>
                    <Text style={styles.insightLabel}>{insight.label}</Text>
                    <Text style={styles.insightValue}>{insight.value}</Text>
                    {insight.subtext ? (
                      <Text style={styles.insightSubtext}>
                        {insight.subtext}
                      </Text>
                    ) : null}
                  </View>
                ))}
              </View>
            </View>
          ) : null}
        </ScrollView>
      </View>
    </TabScreenWrapper>
  );
}

function MonthlySpendVsBudgetChart({
  theme,
  width,
  formatCurrency,
  data,
  ticks,
  budgetValue,
  maxValue,
}: {
  theme: ThemeShape;
  width: number;
  formatCurrency: (value: number, precise?: boolean) => string;
  data: ChartPoint[];
  ticks: number[];
  budgetValue: number;
  maxValue: number;
}) {
  if (!data.length) {
    return null;
  }

  const chartHeight = 220;
  const chartPadding = 0;
  const svgWidth = Math.max(width - chartPadding * 2, 100);
  const padding = { top: 16, right: 64, bottom: 32, left: 0 };
  const innerWidth = Math.max(svgWidth - padding.left - padding.right - 52, 1);
  const innerHeight = chartHeight - padding.top - padding.bottom;
  const dataLength = data.length;
  const xStep = dataLength > 1 ? innerWidth / (dataLength - 1) : 0;
  const budgetRatio =
    maxValue === 0 ? 0 : Math.min(budgetValue, maxValue) / maxValue;
  const budgetY = padding.top + innerHeight - budgetRatio * innerHeight;

  const points = data.map((point, index) => {
    const ratio =
      maxValue === 0 ? 0 : Math.min(point.value, maxValue) / maxValue;
    return {
      ...point,
      x: padding.left + index * xStep,
      y: padding.top + innerHeight - ratio * innerHeight,
    };
  });

  const spentPath =
    points.length === 1
      ? `M${points[0].x},${points[0].y}`
      : points
          .map(
            (point, index) => `${index === 0 ? "M" : "L"}${point.x},${point.y}`
          )
          .join(" ");
  const budgetPath =
    points.length === 1
      ? `M${points[0].x},${budgetY} L${points[0].x + 0.01},${budgetY}`
      : points
          .map(
            (point, index) => `${index === 0 ? "M" : "L"}${point.x},${budgetY}`
          )
          .join(" ");

  const peakPoint = points[points.length - 1];
  const peakLabel = formatCurrency(peakPoint.value, true);
  const axisColor = theme.divider;
  const axisX = svgWidth - padding.right;

  return (
    <View style={{ paddingHorizontal: chartPadding }}>
      <Svg width={svgWidth} height={chartHeight}>
        {ticks.map((tick) => {
          const ratio =
            maxValue === 0 ? 0 : Math.min(tick, maxValue) / maxValue;
          const y = padding.top + innerHeight - ratio * innerHeight;
          return (
            <SvgLine
              key={`tick-${tick}`}
              x1={padding.left}
              x2={axisX}
              y1={y}
              y2={y}
              stroke={axisColor}
              strokeDasharray="4 6"
              strokeOpacity={0.4}
            />
          );
        })}

        <SvgLine
          x1={axisX}
          x2={axisX}
          y1={padding.top}
          y2={padding.top + innerHeight}
          stroke={axisColor}
          strokeWidth={1}
        />

        {ticks.map((tick) => {
          const ratio =
            maxValue === 0 ? 0 : Math.min(tick, maxValue) / maxValue;
          const y = padding.top + innerHeight - ratio * innerHeight;
          return (
            <SvgText
              key={`label-${tick}`}
              x={axisX + 10}
              y={y + 4}
              fontSize={11}
              fill={theme.textSecondary}
              textAnchor="start"
            >
              {formatCurrency(tick)}
            </SvgText>
          );
        })}

        <Path
          d={budgetPath}
          stroke={theme.chartRed}
          strokeWidth={2}
          strokeDasharray="8 6"
          fill="none"
        />

        <Path
          d={spentPath}
          stroke={theme.chartGreen}
          strokeWidth={3}
          fill="none"
        />

        <Circle
          cx={peakPoint.x}
          cy={peakPoint.y}
          r={5}
          fill={theme.background}
          stroke={theme.chartGreen}
          strokeWidth={3}
        />

        <SvgText
          x={peakPoint.x - 12}
          y={Math.max(peakPoint.y - 12, padding.top + 12)}
          fontSize={12}
          fontWeight="600"
          fill={theme.chartGreen}
        >
          {peakLabel}
        </SvgText>

        {points.map((point, index) =>
          point.displayLabel ? (
            <SvgText
              key={`xaxis-${point.label}-${index}`}
              x={point.x}
              y={chartHeight - 8}
              fontSize={11}
              fill={theme.textSecondary}
              textAnchor="middle"
            >
              {point.label}
            </SvgText>
          ) : null
        )}
      </Svg>
    </View>
  );
}

function ThisMonthVsLastMonthChart({
  theme,
  width,
  formatCurrency,
  currentPoints,
  previousPoints,
  ticks,
  maxValue,
}: {
  theme: ThemeShape;
  width: number;
  formatCurrency: (value: number, precise?: boolean) => string;
  currentPoints: ChartPoint[];
  previousPoints: ChartPoint[];
  ticks: number[];
  maxValue: number;
}) {
  if (!currentPoints.length) {
    return null;
  }

  const chartHeight = 220;
  const chartPadding = 0;
  const svgWidth = Math.max(width - chartPadding * 2, 100);
  const padding = { top: 16, right: 64, bottom: 32, left: 0 };
  const innerWidth = Math.max(svgWidth - padding.left - padding.right - 52, 1);
  const innerHeight = chartHeight - padding.top - padding.bottom;
  const pointCount = currentPoints.length;
  const xStep = pointCount > 1 ? innerWidth / (pointCount - 1) : 0;

  const currentCoords = currentPoints.map((point, index) => {
    const ratio =
      maxValue === 0 ? 0 : Math.min(point.value, maxValue) / maxValue;
    return {
      ...point,
      x: padding.left + index * xStep,
      y: padding.top + innerHeight - ratio * innerHeight,
    };
  });

  const previousCoords = previousPoints.map((point, index) => {
    const ratio =
      maxValue === 0 ? 0 : Math.min(point.value, maxValue) / maxValue;
    return {
      ...point,
      x: padding.left + index * xStep,
      y: padding.top + innerHeight - ratio * innerHeight,
    };
  });

  const buildPath = (coords: typeof currentCoords) =>
    coords.length === 1
      ? `M${coords[0].x},${coords[0].y}`
      : coords
          .map(
            (point, index) => `${index === 0 ? "M" : "L"}${point.x},${point.y}`
          )
          .join(" ");

  const currentPath = buildPath(currentCoords);
  const previousPath = buildPath(previousCoords);

  const peakPoint = currentCoords[currentCoords.length - 1];
  const peakLabel = formatCurrency(peakPoint.value, true);
  const axisColor = theme.divider;
  const axisX = svgWidth - padding.right;

  return (
    <View style={{ paddingHorizontal: chartPadding }}>
      <Svg width={svgWidth} height={chartHeight}>
        {ticks.map((tick) => {
          const ratio =
            maxValue === 0 ? 0 : Math.min(tick, maxValue) / maxValue;
          const y = padding.top + innerHeight - ratio * innerHeight;
          return (
            <SvgLine
              key={`tick-${tick}`}
              x1={padding.left}
              x2={axisX}
              y1={y}
              y2={y}
              stroke={axisColor}
              strokeDasharray="4 6"
              strokeOpacity={0.4}
            />
          );
        })}

        <SvgLine
          x1={axisX}
          x2={axisX}
          y1={padding.top}
          y2={padding.top + innerHeight}
          stroke={axisColor}
          strokeWidth={1}
        />

        {ticks.map((tick) => {
          const ratio =
            maxValue === 0 ? 0 : Math.min(tick, maxValue) / maxValue;
          const y = padding.top + innerHeight - ratio * innerHeight;
          return (
            <SvgText
              key={`label-${tick}`}
              x={axisX + 10}
              y={y + 4}
              fontSize={11}
              fill={theme.textSecondary}
              textAnchor="start"
            >
              {formatCurrency(tick)}
            </SvgText>
          );
        })}

        <Path
          d={previousPath}
          stroke={theme.textSecondary}
          strokeWidth={3}
          fill="none"
        />

        <Path
          d={currentPath}
          stroke={theme.chartGreen}
          strokeWidth={3}
          fill="none"
        />

        <Circle
          cx={peakPoint.x}
          cy={peakPoint.y}
          r={5}
          fill={theme.background}
          stroke={theme.chartGreen}
          strokeWidth={3}
        />

        <SvgText
          x={peakPoint.x - 12}
          y={Math.max(peakPoint.y - 12, padding.top + 12)}
          fontSize={12}
          fontWeight="600"
          fill={theme.chartGreen}
        >
          {peakLabel}
        </SvgText>

        {currentCoords.map((point, index) =>
          point.displayLabel ? (
            <SvgText
              key={`comparison-xaxis-${point.label}-${index}`}
              x={point.x}
              y={chartHeight - 8}
              fontSize={11}
              fill={theme.textSecondary}
              textAnchor="middle"
            >
              {point.label}
            </SvgText>
          ) : null
        )}
      </Svg>
    </View>
  );
}

type ColoredDonutSegment = DonutSegment & { color: string };

function CategoryDonutChart({
  theme,
  segments,
  total,
  formatCurrency,
}: {
  theme: ThemeShape;
  segments: ColoredDonutSegment[];
  total: number;
  formatCurrency: (value: number, precise?: boolean) => string;
}) {
  const filteredSegments = segments.filter((segment) => segment.value > 0);
  if (!filteredSegments.length) return null;

  const strokeWidth = 26;
  const radius = 70;
  const normalizedRadius = radius - strokeWidth / 2;
  const diameter = radius * 2;
  let cumulativeAngle = 0;

  const arcs = filteredSegments.map((segment) => {
    const sweep = (segment.value / total) * 360;
    const startAngle = cumulativeAngle;
    const endAngle = cumulativeAngle + sweep;
    cumulativeAngle = endAngle;
    return {
      ...segment,
      path: describeArc(radius, radius, normalizedRadius, startAngle, endAngle),
    };
  });

  return (
    <View style={{ alignItems: "center" }}>
      <Svg width={diameter} height={diameter}>
        {arcs.map((arc) => (
          <Path
            key={arc.label}
            d={arc.path}
            stroke={arc.color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
          />
        ))}
        <SvgText
          x={radius}
          y={radius + 8}
          fontSize={18}
          fontWeight="700"
          fill={theme.text}
          textAnchor="middle"
        >
          {formatCurrency(total, true)}
        </SvgText>
      </Svg>
    </View>
  );
}

function polarToCartesian(
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number
) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;

  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

function describeArc(
  x: number,
  y: number,
  radius: number,
  startAngle: number,
  endAngle: number
) {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  return [
    "M",
    start.x,
    start.y,
    "A",
    radius,
    radius,
    0,
    largeArcFlag,
    0,
    end.x,
    end.y,
  ].join(" ");
}
