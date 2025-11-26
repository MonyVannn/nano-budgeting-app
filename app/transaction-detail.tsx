import { Text } from "@/components/Themed";
import { useTheme } from "@/constants/ThemeContext";
import { useAuthStore, useCategoryStore, useTransactionStore } from "@/store";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import React, { useEffect } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TransactionDetailScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const { transactions, deleteTransaction, fetchTransactions } =
    useTransactionStore();
  const { categories, fetchCategories } = useCategoryStore();
  const params = useLocalSearchParams();
  const transactionId = params.id as string;

  const transaction = transactions.find((txn) => txn.id === transactionId);

  useEffect(() => {
    if (user?.id) {
      fetchCategories(user.id);
    }
  }, [user?.id]);

  if (!transaction) {
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
            Transaction Not Found
          </Text>
        </View>
      </View>
    );
  }

  const category = categories.find((cat) => cat.id === transaction.category_id);

  const handleDelete = () => {
    Alert.alert(
      "Delete Transaction",
      "Are you sure you want to delete this transaction? This action cannot be undone.",
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
              await deleteTransaction(transaction.id);
              // Refresh transactions after delete
              if (user?.id) {
                await fetchTransactions(user.id);
              }
              Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Success
              );
              router.back();
            } catch (error: any) {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              Alert.alert(
                "Error",
                error.message || "Failed to delete transaction"
              );
            }
          },
        },
      ]
    );
  };

  const handleEdit = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({
      pathname: "/edit-transaction",
      params: {
        id: transaction.id,
        amount: transaction.amount.toString(),
        isExpense: transaction.is_expense.toString(),
        categoryId: transaction.category_id,
        date: transaction.date,
        description: transaction.description || "",
        account: transaction.account || "",
      },
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
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
    headerActions: {
      flexDirection: "row",
      gap: 12,
    },
    actionButton: {
      padding: 8,
    },
    content: {
      flex: 1,
      marginTop: 50,
      paddingHorizontal: 20,
    },
    amountSection: {
      alignItems: "center",
      marginBottom: 40,
    },
    amountDisplay: {
      fontSize: 56,
      fontWeight: "700",
      color: transaction.is_expense ? theme.expense : theme.income,
      marginBottom: 8,
    },
    amountLabel: {
      fontSize: 14,
      fontWeight: "500",
      color: theme.textSecondary,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    infoCardWrapper: {
      borderRadius: 16,
      marginBottom: 16,
      overflow: "hidden",
      borderWidth: 0.5,
      borderColor: theme.divider,
      backgroundColor: theme.surface,
    },
    infoCard: {
      padding: 20,
    },
    infoRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },
    infoRowLast: {
      marginBottom: 0,
    },
    infoLabel: {
      fontSize: 14,
      fontWeight: "500",
      color: theme.textSecondary,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    infoValue: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.text,
      textAlign: "right",
      flex: 1,
      marginLeft: 16,
    },
    dateValueContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      flex: 1,
      justifyContent: "flex-end",
    },
    actionsSection: {
      marginTop: 32,
      marginBottom: insets.bottom + 20,
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
      backgroundColor: theme.expense,
    },
    deleteButtonText: {
      color: "white",
    },
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={theme.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Transaction Details</Text>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Amount Display */}
        <View style={styles.amountSection}>
          <Text style={styles.amountDisplay}>
            {transaction.is_expense ? "-" : "+"}${transaction.amount.toFixed(2)}
          </Text>
          <Text style={styles.amountLabel}>
            {transaction.is_expense ? "Expense" : "Income"}
          </Text>
        </View>

        {/* Transaction Info */}
        <View style={styles.infoCardWrapper}>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Description</Text>
              <Text style={styles.infoValue}>
                {transaction.description || "No description"}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Category</Text>
              <Text style={styles.infoValue}>
                {category?.name || "Unknown"}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Date</Text>
              <View style={styles.dateValueContainer}>
                <Text style={styles.infoValue} numberOfLines={1}>
                  {formatDate(transaction.date)}
                </Text>
              </View>
            </View>
            {transaction.account && (
              <View style={[styles.infoRow, styles.infoRowLast]}>
                <Text style={styles.infoLabel}>Account</Text>
                <Text style={styles.infoValue}>{transaction.account}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsSection}>
          <View style={styles.actionButtonWrapper}>
            <Pressable onPress={handleEdit} style={styles.actionButtonContent}>
              <Text style={styles.actionButtonText}>Edit Transaction</Text>
            </Pressable>
          </View>

          <View style={styles.actionButtonWrapper}>
            <View style={styles.deleteButton}>
              <Pressable
                onPress={handleDelete}
                style={styles.actionButtonContent}
              >
                <Text
                  style={[styles.actionButtonText, styles.deleteButtonText]}
                >
                  Delete Transaction
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
