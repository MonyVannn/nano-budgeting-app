import { AppColors } from "@/constants/Colors";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { AnimatedCircularProgress } from "react-native-circular-progress";

interface CircularProgressProps {
  percentage: number;
  size?: number;
  width?: number;
  title?: string;
  subtitle?: string;
  amount?: string;
}

/**
 * Circular progress indicator inspired by modern budgeting apps
 * Shows percentage with clean green accent color
 */
export function CircularProgress({
  percentage,
  size = 120,
  width = 12,
  title,
  subtitle,
  amount,
}: CircularProgressProps) {
  const fillColor =
    percentage > 90
      ? AppColors.error
      : percentage > 70
      ? AppColors.warning
      : AppColors.chartGreen;

  return (
    <View style={styles.container}>
      <AnimatedCircularProgress
        size={size}
        width={width}
        fill={percentage}
        tintColor={fillColor}
        backgroundColor={AppColors.border}
        rotation={0}
        lineCap="round"
        duration={1200}
      >
        {() => (
          <View style={styles.innerContent}>
            <Text style={styles.percentage}>{Math.round(percentage)}%</Text>
            {amount && <Text style={styles.amount}>{amount}</Text>}
          </View>
        )}
      </AnimatedCircularProgress>
      {title && (
        <View style={styles.labels}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: 12,
  },
  innerContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  percentage: {
    fontSize: 24,
    fontWeight: "700",
    color: AppColors.text,
  },
  amount: {
    fontSize: 12,
    fontWeight: "600",
    color: AppColors.textSecondary,
    marginTop: 2,
  },
  labels: {
    alignItems: "center",
    gap: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    color: AppColors.text,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 12,
    color: AppColors.textSecondary,
    textAlign: "center",
  },
});
