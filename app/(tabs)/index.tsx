import { FABButton } from "@/components/FABButton";
import { TabScreenWrapper } from "@/components/TabScreenWrapper";
import { Text } from "@/components/Themed";
import { useTheme } from "@/constants/ThemeContext";
import { useAuthStore, useCategoryStore, useTransactionStore } from "@/store";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react-native";
import React, { useEffect, useMemo, useState } from "react";
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
import { SvgXml } from "react-native-svg";

// Track which categories have been animated to prevent re-animation
const animatedCategories = new Set<string>();

const LOGO_WHITE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 190 43"><g opacity="1" transform="translate(0,1)"><path d="M45.8693 4.61295C46.667 3.72652 47.5535 2.99522 48.4621 2.41904C50.0576 1.42181 51.7418 0.889954 53.4704 0.889954V15.3609C52.2072 10.9731 49.4814 7.20574 45.8693 4.61295ZM67.3873 40.89H16.1296C7.7086 40.89 0.905273 34.0645 0.905273 25.6656C0.905273 17.6213 7.15458 11.0174 15.0659 10.4634V0.889954C16.8388 0.889954 18.5895 1.39965 20.2294 2.41904C21.138 2.97306 22.0244 3.70436 22.8222 4.54646C26.0798 2.26391 30.0244 0.934275 34.3014 0.934275C34.3014 10.1753 30.9773 20.9232 20.1629 20.9454H34.1906C33.7917 19.1503 32.1518 17.8207 30.2017 17.7985H38.3568C36.4067 17.7985 34.7668 19.1503 34.3679 20.9675H47.4427C50.0576 20.9675 52.6504 21.4772 55.0881 22.4966C57.5036 23.4938 59.7197 24.9786 61.559 26.8179C63.4205 28.6794 64.8831 30.8733 65.8803 33.2888C66.8776 35.6822 67.3873 38.275 67.3873 40.89ZM23.6864 10.7293C24.0188 11.5936 24.9053 12.5686 26.1463 13.2778C27.3873 13.9869 28.6726 14.275 29.5812 14.142C29.2488 13.2778 28.3623 12.3027 27.1213 11.5936C25.8803 10.8844 24.595 10.5963 23.6864 10.7293ZM42.3457 13.2778C41.1047 13.9869 39.8194 14.275 38.9108 14.142C39.2432 13.2778 40.1297 12.3027 41.3706 11.5936C42.6116 10.8844 43.897 10.5963 44.8055 10.7293C44.4953 11.5936 43.5867 12.5686 42.3457 13.2778Z" fill="#FFFFFF"/><g transform="translate(74,2)"><path fill="#ffffff" d="M15.44 29.69L15.44 29.69L15.44 39L7.92 39L7.92 0.92L16.72 0.92L19.57 11.16Q19.95 12.47 20.37 14.09Q20.78 15.70 21.17 17.32Q21.55 18.94 21.81 20.18L21.81 20.18Q22.38 22.84 22.83 25.11Q23.28 27.38 23.73 29.78L23.73 29.78Q23.92 30.94 24.08 32.02L24.08 32.02Q24.24 33.14 24.40 34.20L24.40 34.20L25.04 34.20Q24.78 32.50 24.56 31.14Q24.34 29.78 24.11 28.34Q23.89 26.90 23.63 24.92L23.63 24.92Q23.41 23.51 23.18 21.74Q22.96 19.96 22.77 18.22Q22.58 16.47 22.51 15.13L22.51 15.13Q22.42 13.94 22.37 12.81Q22.32 11.67 22.32 10.62L22.32 10.62L22.32 0.92L29.84 0.92L29.84 39L21.52 39L18.58 29.11Q18.26 28.09 17.84 26.55Q17.42 25.02 16.96 23.27Q16.50 21.53 16.11 19.83L16.11 19.83Q15.57 17.50 15.02 15.02Q14.48 12.54 14.06 10.14L14.06 10.14Q13.84 8.98 13.65 7.86Q13.46 6.74 13.30 5.72L13.30 5.72L12.66 5.72Q12.98 7.80 13.36 10.12Q13.74 12.44 14.13 15.03L14.13 15.03Q14.45 17.53 14.77 20.07Q15.09 22.62 15.28 25.05L15.28 25.05Q15.34 26.26 15.39 27.43Q15.44 28.60 15.44 29.69ZM39.60 39L32.08 39L38.03 0.92L48.78 0.92L54.74 39L47.22 39L46.10 30.26L40.72 30.26L39.60 39ZM42.90 11.29L41.62 23.22L45.20 23.22L43.92 11.29Q43.86 10.55 43.82 9.96Q43.79 9.37 43.76 8.68Q43.73 7.99 43.73 7L43.73 7L43.09 7L43.09 7.93Q43.09 8.15 43.09 8.38Q43.06 8.63 43.06 8.86L43.06 8.86Q43.06 9.18 43.02 9.51Q42.99 9.85 42.99 10.17L42.99 10.17Q42.99 10.81 42.90 11.29L42.90 11.29ZM64.50 29.69L64.50 29.69L64.50 39L56.98 39L56.98 0.92L65.78 0.92L68.62 11.16Q69.01 12.47 69.42 14.09Q69.84 15.70 70.22 17.32Q70.61 18.94 70.86 20.18L70.86 20.18Q71.44 22.84 71.89 25.11Q72.34 27.38 72.78 29.78L72.78 29.78Q72.98 30.94 73.14 32.02L73.14 32.02Q73.30 33.14 73.46 34.20L73.46 34.20L74.10 34.20Q73.84 32.50 73.62 31.14Q73.39 29.78 73.17 28.34Q72.94 26.90 72.69 24.92L72.69 24.92Q72.46 23.51 72.24 21.74Q72.02 19.96 71.82 18.22Q71.63 16.47 71.57 15.13L71.57 15.13Q71.47 13.94 71.42 12.81Q71.38 11.67 71.38 10.62L71.38 10.62L71.38 0.92L78.90 0.92L78.90 39L70.58 39L67.63 29.11Q67.31 28.09 66.90 26.55Q66.48 25.02 66.02 23.27Q65.55 21.53 65.17 19.83L65.17 19.83Q64.62 17.50 64.08 15.02Q63.54 12.54 63.12 10.14L63.12 10.14Q62.90 8.98 62.70 7.86Q62.51 6.74 62.35 5.72L62.35 5.72L61.71 5.72Q62.03 7.80 62.42 10.12Q62.80 12.44 63.18 15.03L63.18 15.03Q63.50 17.53 63.82 20.07Q64.14 22.62 64.34 25.05L64.34 25.05Q64.40 26.26 64.45 27.43Q64.50 28.60 64.50 29.69ZM81.78 19.74L81.78 19.74Q81.78 16.12 82.45 13.06Q83.12 10.01 84.50 7.67L84.50 7.67Q87.22 3 92.40 1.40L92.40 1.40Q95.02 0.60 98.16 0.60L98.16 0.60Q101.23 0.60 103.87 1.40Q106.51 2.20 108.50 3.77L108.50 3.77Q112.50 7 113.84 12.98L113.84 12.98Q114.16 14.52 114.34 16.20Q114.51 17.88 114.51 19.74L114.51 19.74Q114.51 23.42 113.84 26.55Q113.17 29.69 111.82 32.09L111.82 32.09Q109.10 36.92 103.95 38.49L103.95 38.49Q101.30 39.32 98.16 39.32L98.16 39.32Q91.79 39.32 87.79 36.09L87.79 36.09Q85.84 34.52 84.48 32.06Q83.12 29.59 82.48 26.62L82.48 26.62Q82.13 25.08 81.95 23.35Q81.78 21.62 81.78 19.74ZM89.30 19.80L89.30 19.80Q89.30 22.04 89.68 24.02Q90.06 26.01 90.80 27.45L90.80 27.45Q91.63 29.18 92.78 30.10Q93.94 31.03 95.06 31.45L95.06 31.45Q96.46 31.96 98.19 31.96L98.19 31.96Q99.79 31.96 101.20 31.46Q102.61 30.97 103.73 29.91L103.73 29.91Q104.78 28.92 105.50 27.43Q106.22 25.94 106.61 24.06L106.61 24.06Q106.99 22.14 106.99 19.80L106.99 19.80Q106.99 17.66 106.61 15.74Q106.22 13.82 105.52 12.38L105.52 12.38Q104.02 9.50 101.26 8.47L101.26 8.47Q99.89 7.96 98.19 7.96L98.19 7.96Q94.83 7.96 92.62 9.94L92.62 9.94Q91.50 11 90.78 12.42Q90.06 13.85 89.68 15.67L89.68 15.67Q89.30 17.53 89.30 19.80Z"/></g></g></svg>`;
const LOGO_BLACK = LOGO_WHITE.replace(/#FFFFFF/gi, "#000000");

export default function DashboardScreen() {
  const [incomeExpanded, setIncomeExpanded] = useState(false);
  const [summaryExpanded, setSummaryExpanded] = useState(false);
  const [monthOffset, setMonthOffset] = useState(0);
  const { theme, themeMode } = useTheme();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const {
    transactions,
    fetchTransactions,
    getTotalIncome,
    getTotalExpenses,
    getNetAmount,
  } = useTransactionStore();
  const { categories, fetchCategories, isLoading } = useCategoryStore();

  // Animated values for income expansion
  const heightAnimation = useSharedValue(0);
  const opacityAnimation = useSharedValue(0);
  const chevronRotation = useSharedValue(0);

  // Animated values for summary expansion
  const summaryHeightAnimation = useSharedValue(0);
  const summaryOpacityAnimation = useSharedValue(0);
  const summaryChevronRotation = useSharedValue(0);

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
  useEffect(() => {
    if (user?.id) {
      fetchCategories(user.id);
    }
  }, [user?.id, fetchCategories]);

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

  // Calculate selected month date range
  const currentMonth = useMemo(() => {
    const now = new Date();
    now.setMonth(now.getMonth() + monthOffset);
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return {
      start: start.toISOString().split("T")[0],
      end: end.toISOString().split("T")[0],
      label: start.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      }),
    };
  }, [monthOffset]);

  useEffect(() => {
    if (user?.id) {
      fetchTransactions(user.id, currentMonth.start, currentMonth.end);
    }
  }, [user?.id, currentMonth.start, currentMonth.end, fetchTransactions]);

  // Calculate monthly totals
  const monthlyIncome = useMemo(
    () => getTotalIncome(currentMonth.start, currentMonth.end),
    [getTotalIncome, currentMonth.start, currentMonth.end, transactions]
  );
  const monthlyExpenses = useMemo(
    () => getTotalExpenses(currentMonth.start, currentMonth.end),
    [getTotalExpenses, currentMonth.start, currentMonth.end, transactions]
  );
  const amountSaved = monthlyIncome - monthlyExpenses;

  const previousMonthEndDate = useMemo(() => {
    const startPrev = new Date(currentMonth.start);
    startPrev.setDate(startPrev.getDate() - 1);
    return startPrev.toISOString().split("T")[0];
  }, [currentMonth.start]);

  const startingBalance = useMemo(() => {
    if (!transactions.length) return 0;
    return getNetAmount(undefined, previousMonthEndDate);
  }, [getNetAmount, previousMonthEndDate, transactions]);

  const endingBalance = startingBalance + amountSaved;

  // Calculate days left in month
  const daysLeftInMonth = useMemo(() => {
    const monthEnd = new Date(currentMonth.end);
    const today = new Date();
    today.setMonth(today.getMonth() + monthOffset);
    return monthEnd.getDate() - today.getDate();
  }, [currentMonth.end, monthOffset]);

  const logoXml = themeMode === "dark" ? LOGO_WHITE : LOGO_BLACK;

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

  useEffect(() => {
    const config = {
      duration: 400,
      easing: Easing.bezier(0.4, 0.0, 0.2, 1),
    };

    if (summaryExpanded) {
      summaryHeightAnimation.value = withTiming(1, config);
      summaryOpacityAnimation.value = withTiming(1, {
        ...config,
        duration: 300,
      });
      summaryChevronRotation.value = withTiming(180, config);
    } else {
      summaryHeightAnimation.value = withTiming(0, config);
      summaryOpacityAnimation.value = withTiming(0, {
        ...config,
        duration: 200,
      });
      summaryChevronRotation.value = withTiming(0, config);
    }
  }, [summaryExpanded]);

  // Animated styles
  const animatedDetailsStyle = useAnimatedStyle(() => ({
    height: heightAnimation.value * 130, // Approximate height of details section
    opacity: opacityAnimation.value,
    overflow: "hidden",
  }));

  const animatedChevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${chevronRotation.value}deg` }],
  }));

  const summaryDetailsStyle = useAnimatedStyle(() => ({
    height: summaryHeightAnimation.value * 150,
    opacity: summaryOpacityAnimation.value,
    overflow: "hidden",
  }));

  const summaryChevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${summaryChevronRotation.value}deg` }],
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
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 8,
        },
        monthControls: {
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
        },
        monthButton: {
          backgroundColor: theme.background,
          borderRadius: 100,
          padding: 4,
        },
        monthLabelContainer: {
          minWidth: 140,
          alignItems: "center",
        },
        monthLabel: {
          fontSize: 16,
          fontWeight: "600",
          color: theme.textSecondary,
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
          fontSize: 16,
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
          marginTop: 10,
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
    <TabScreenWrapper screenIndex={0}>
      <View style={styles.container}>
        {/* Sticky Header */}
        <View style={stickyHeaderStyle}>
        <View style={styles.header}>
          <SvgXml xml={logoXml} width={110} height={30} />
          <View style={styles.monthControls}>
            <Pressable
              style={styles.monthButton}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setMonthOffset((prev) => prev - 1);
              }}
            >
              <ChevronLeft size={20} color={theme.text} />
            </Pressable>
            <View style={styles.monthLabelContainer}>
              <Text style={styles.monthLabel}>{currentMonth.label}</Text>
            </View>
            <Pressable
              style={styles.monthButton}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setMonthOffset((prev) => prev + 1);
              }}
            >
              <ChevronRight size={20} color={theme.text} />
            </Pressable>
          </View>
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
                  <Text style={styles.incomeLabel}>Ending Balance</Text>
                </View>
                <View style={styles.incomeLabelContainer}>
                  <Text
                    style={[
                      styles.incomeAmount,
                      {
                        color:
                          endingBalance >= 0 ? theme.income : theme.expense,
                      },
                    ]}
                    numberOfLines={1}
                  >
                    {endingBalance >= 0 ? "+" : "-"}$
                    {Math.abs(endingBalance).toFixed(2)}
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
                      <Text style={styles.detailLabel}>Starting Balance</Text>
                      <View
                        style={[
                          styles.indicator,
                          { backgroundColor: theme.divider },
                        ]}
                      />
                    </View>
                    <Text style={styles.detailAmount}>
                      {startingBalance >= 0 ? "+" : "-"}$
                      {Math.abs(startingBalance).toFixed(2)}
                    </Text>
                  </View>
                  <View style={[styles.detailRow, styles.detailRowLast]}>
                    <View style={styles.detailLeft}>
                      <Text style={styles.detailLabel}>Amount Saved</Text>
                      <View
                        style={[
                          styles.indicator,
                          {
                            backgroundColor:
                              amountSaved >= 0
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
                          color:
                            amountSaved >= 0 ? theme.income : theme.expense,
                        },
                      ]}
                      numberOfLines={1}
                    >
                      {amountSaved >= 0 ? "+" : "-"}$
                      {Math.abs(amountSaved).toFixed(2)}
                    </Text>
                  </View>
                </View>
              </Animated.View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Monthly Summary - Collapsible */}
        <View style={styles.summaryCardWrapper}>
          <View style={styles.summaryCard}>
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSummaryExpanded(!summaryExpanded);
              }}
              activeOpacity={1}
            >
              <View style={styles.incomeHeader}>
                <View style={styles.incomeLabelContainer}>
                  <Text style={styles.incomeLabel}>Monthly Summary</Text>
                </View>
                <Animated.View style={summaryChevronStyle}>
                  <ChevronDown size={20} color={theme.textSecondary} />
                </Animated.View>
              </View>

              <View style={styles.summaryBudgetColumn}>
                <View style={styles.summaryColumnRight}>
                  <Text style={styles.columnLabel}>Expected</Text>
                  <Text style={styles.columnValue} numberOfLines={1}>
                    ${totalBudgeted.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.summaryColumnRight}>
                  <Text style={styles.columnLabel}>Actual</Text>
                  <Text style={styles.columnValue} numberOfLines={1}>
                    ${totalActual.toFixed(2)}
                  </Text>
                </View>
              </View>

              <Animated.View style={summaryDetailsStyle}>
                <View style={styles.incomeDetails}>
                  <View style={styles.detailRow}>
                    <View style={styles.detailLeft}>
                      <Text style={styles.detailLabel}>Difference</Text>
                      <View
                        style={[
                          styles.indicator,
                          {
                            backgroundColor:
                              totalDifference >= 0
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
                  <View style={styles.detailRow}>
                    <View style={styles.detailLeft}>
                      <Text style={styles.detailLabel}>Month</Text>
                    </View>
                    <Text style={styles.detailAmount} numberOfLines={1}>
                      {currentMonth.label}
                    </Text>
                  </View>
                  <View style={[styles.detailRow, styles.detailRowLast]}>
                    <View style={styles.detailLeft}>
                      <Text style={styles.detailLabel}>Days Left</Text>
                    </View>
                    <Text style={styles.detailAmount} numberOfLines={1}>
                      {daysLeftInMonth > 0
                        ? `${daysLeftInMonth} day${
                            daysLeftInMonth === 1 ? "" : "s"
                          }`
                        : "Last day"}
                    </Text>
                  </View>
                </View>
              </Animated.View>
            </TouchableOpacity>
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
                    Expected
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
    </TabScreenWrapper>
  );
}
