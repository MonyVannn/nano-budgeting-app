import { AppColors } from "@/constants/Colors";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface SummaryCardProps {
  title: string;
  amount: string;
  subtitle?: string;
  variant?: "income" | "expense" | "neutral" | "success";
}

/**
 * Clean summary card for displaying financial metrics
 * Inspired by modern budgeting apps with subtle shadows and clear typography
 */
export function SummaryCard({
  title,
  amount,
  subtitle,
  variant = "neutral",
}: SummaryCardProps) {
  const amountColor = {
    income: AppColors.income,
    expense: AppColors.expense,
    success: AppColors.success,
    neutral: AppColors.text,
  }[variant];

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text style={[styles.amount, { color: amountColor }]}>{amount}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: AppColors.surface,
    borderRadius: 16,
    padding: 20,
    gap: 8,
    shadowColor: AppColors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    color: AppColors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  amount: {
    fontSize: 32,
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 12,
    color: AppColors.textTertiary,
    marginTop: 4,
  },
});
