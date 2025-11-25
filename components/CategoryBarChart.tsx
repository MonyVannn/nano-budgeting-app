import { AppColors } from "@/constants/Colors";
import React from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import { BarChart } from "react-native-gifted-charts";

interface CategoryBarChartProps {
  data: {
    labels: string[];
    datasets: [
      {
        data: number[];
        colors?: ((opacity: number) => string)[];
      }
    ];
  };
  height?: number;
}

/**
 * Bar chart component for category spending visualization
 * Styled with Catppuccin Latte colors for clean, professional look
 */
export function CategoryBarChart({
  data,
  height = 220,
}: CategoryBarChartProps) {
  const screenWidth = Dimensions.get("window").width;

  // Convert data format from react-native-chart-kit to react-native-gifted-charts
  const chartData = data.labels.map((label, index) => ({
    value: data.datasets[0].data[index] || 0,
    label: label,
    frontColor: data.datasets[0].colors?.[index]?.(1) || AppColors.primary,
  }));

  const maxValue = Math.max(...chartData.map((d) => d.value), 0) * 1.1 || 100;

  return (
    <View style={styles.container}>
      <BarChart
        data={chartData}
        width={screenWidth - 48} // Account for padding
        height={height}
        barWidth={30}
        spacing={8}
        showGradient
        isAnimated
        animationDuration={800}
        noOfSections={4}
        maxValue={maxValue}
        yAxisThickness={1}
        xAxisThickness={1}
        yAxisTextStyle={{
          color: AppColors.textSecondary,
          fontSize: 12,
          fontWeight: "500",
        }}
        xAxisLabelTextStyle={{
          color: AppColors.textSecondary,
          fontSize: 12,
          fontWeight: "500",
        }}
        rulesColor={AppColors.border}
        rulesType="solid"
        showYAxisIndices={false}
        showXAxisIndices={false}
        formatYLabel={(value) => `$${Math.round(parseFloat(value))}`}
        showValuesAsTopLabel
        topLabelTextStyle={{
          color: AppColors.textSecondary,
          fontSize: 11,
          fontWeight: "600",
        }}
        backgroundColor="transparent"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: AppColors.surface,
    borderRadius: 16,
    padding: 16,
    shadowColor: AppColors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  chart: {
    borderRadius: 16,
  },
});
