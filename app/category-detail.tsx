import { Text } from "@/components/Themed";
import { useTheme } from "@/constants/ThemeContext";
import { useAuthStore, useCategoryStore, useTransactionStore } from "@/store";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import React, { useEffect, useMemo, useRef } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function CategoryDetailScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const { transactions, fetchTransactions } = useTransactionStore();
  const { categories, fetchCategories } = useCategoryStore();
  const params = useLocalSearchParams();
  const categoryId = params.id as string;

  const category = categories.find((cat) => cat.id === categoryId);

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

  // Calculate category spending for current month
  const categoryData = useMemo(() => {
    if (!category) return null;

    const categoryTransactions = transactions.filter(
      (txn) =>
        txn.category_id === category.id &&
        txn.is_expense &&
        txn.date >= currentMonth.start &&
        txn.date <= currentMonth.end
    );
    const actual = categoryTransactions.reduce(
      (sum, txn) => sum + txn.amount,
      0
    );
    const budgeted = category.expected_amount || 0;
    const difference = budgeted - actual;
    const percentage =
      budgeted > 0 ? Math.min((actual / budgeted) * 100, 100) : 0;

    return {
      budgeted,
      actual,
      difference,
      percentage,
      transactions: categoryTransactions,
    };
  }, [category, transactions, currentMonth]);

  useEffect(() => {
    if (user?.id) {
      fetchTransactions(user.id);
      fetchCategories(user.id);
    }
  }, [user?.id, fetchTransactions, fetchCategories]);

  const progressWidth = useSharedValue(0);
  const prevPercentageRef = useRef<number | null>(null);
  const hasAnimatedRef = useRef(false);

  useEffect(() => {
    if (categoryData) {
      const targetPercentage = Math.min(categoryData.percentage, 100);

      // Only animate if:
      // 1. This is the first render (hasAnimatedRef.current is false)
      // 2. The percentage value actually changed (not just a re-render)
      if (!hasAnimatedRef.current) {
        // First render - animate
        progressWidth.value = withTiming(targetPercentage, {
          duration: 800,
          easing: Easing.out(Easing.ease),
        });
        prevPercentageRef.current = targetPercentage;
        hasAnimatedRef.current = true;
      } else if (prevPercentageRef.current !== targetPercentage) {
        // Percentage actually changed - animate
        progressWidth.value = withTiming(targetPercentage, {
          duration: 800,
          easing: Easing.out(Easing.ease),
        });
        prevPercentageRef.current = targetPercentage;
      }
      // If percentage hasn't changed, do nothing (keep current value)
    }
  }, [categoryData?.percentage]);

  const animatedProgressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  if (!category || !categoryData) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.background }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: Platform.OS === "ios" ? insets.top + 10 : 20,
            paddingHorizontal: 20,
            paddingBottom: 20,
          }}
        >
          <Pressable onPress={() => router.back()} style={{ padding: 8 }}>
            <ArrowLeft size={24} color={theme.text} />
          </Pressable>
          <Text
            style={{
              fontSize: 18,
              fontWeight: "600",
              color: theme.text,
              flex: 1,
              marginLeft: 8,
            }}
          >
            Category Not Found
          </Text>
        </View>
      </View>
    );
  }

  const isOverBudget = categoryData.difference < 0;
  const progressColor = isOverBudget ? theme.expense : theme.income;

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
        content: {
          flex: 1,
          paddingHorizontal: 20,
        },
        card: {
          backgroundColor: theme.surface,
          borderRadius: 12,
          padding: 20,
          marginBottom: 16,
          borderWidth: 0.5,
          borderColor: theme.divider,
        },
        cardTitle: {
          fontSize: 14,
          fontWeight: "600",
          color: theme.textSecondary,
          textTransform: "uppercase",
          letterSpacing: 0.5,
          marginBottom: 16,
        },
        amountRow: {
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        },
        amountLabel: {
          fontSize: 14,
          color: theme.textSecondary,
        },
        amountValue: {
          fontSize: 16,
          fontWeight: "600",
          color: theme.text,
        },
        differenceRow: {
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 8,
          paddingTop: 16,
          borderTopWidth: 1,
          borderTopColor: theme.divider,
        },
        differenceLabel: {
          fontSize: 14,
          fontWeight: "600",
          color: theme.text,
        },
        differenceValue: {
          fontSize: 18,
          fontWeight: "700",
        },
        progressContainer: {
          marginTop: 16,
        },
        progressBarContainer: {
          height: 8,
          backgroundColor: theme.divider,
          borderRadius: 4,
          overflow: "hidden",
          marginTop: 8,
        },
        progressBarFill: {
          height: "100%",
          borderRadius: 4,
        },
        progressText: {
          fontSize: 12,
          color: theme.textSecondary,
          marginTop: 4,
        },
        transactionsSection: {
          marginTop: 8,
        },
        transactionItem: {
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: theme.divider,
        },
        transactionItemLast: {
          borderBottomWidth: 0,
        },
        transactionLeft: {
          flex: 1,
        },
        transactionDescription: {
          fontSize: 14,
          fontWeight: "500",
          color: theme.text,
          marginBottom: 4,
        },
        transactionDate: {
          fontSize: 12,
          color: theme.textSecondary,
        },
        transactionAmount: {
          fontSize: 16,
          fontWeight: "600",
          color: theme.expense,
        },
        emptyState: {
          paddingVertical: 40,
          alignItems: "center",
        },
        emptyText: {
          fontSize: 14,
          color: theme.textSecondary,
          textAlign: "center",
        },
      }),
    [theme, insets]
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={theme.text} />
          </Pressable>
          <Text style={styles.headerTitle}>{category.name}</Text>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Budget Summary Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Budget Summary</Text>

          <View style={styles.amountRow}>
            <Text style={styles.amountLabel}>Budgeted</Text>
            <Text style={styles.amountValue}>
              ${categoryData.budgeted.toFixed(2)}
            </Text>
          </View>

          <View style={styles.amountRow}>
            <Text style={styles.amountLabel}>Actual</Text>
            <Text style={styles.amountValue}>
              ${categoryData.actual.toFixed(2)}
            </Text>
          </View>

          <View style={styles.progressContainer}>
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
            <Text style={styles.progressText}>
              {categoryData.percentage.toFixed(1)}% of budget used
            </Text>
          </View>

          <View style={styles.differenceRow}>
            <Text style={styles.differenceLabel}>Difference</Text>
            <Text
              style={[
                styles.differenceValue,
                {
                  color: isOverBudget ? theme.expense : theme.income,
                },
              ]}
            >
              {categoryData.difference >= 0 ? "+" : "-"}$
              {Math.abs(categoryData.difference).toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Transactions List */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            Transactions ({categoryData.transactions.length})
          </Text>

          {categoryData.transactions.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                No transactions in this category for this month
              </Text>
            </View>
          ) : (
            categoryData.transactions.map((transaction, index) => (
              <Pressable
                key={transaction.id}
                style={[
                  styles.transactionItem,
                  index === categoryData.transactions.length - 1 &&
                    styles.transactionItemLast,
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push({
                    pathname: "/transaction-detail",
                    params: { id: transaction.id },
                  });
                }}
              >
                <View style={styles.transactionLeft}>
                  <Text style={styles.transactionDescription}>
                    {transaction.description || "No description"}
                  </Text>
                  <Text style={styles.transactionDate}>
                    {formatDate(transaction.date)}
                  </Text>
                </View>
                <Text style={styles.transactionAmount}>
                  -${transaction.amount.toFixed(2)}
                </Text>
              </Pressable>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}
