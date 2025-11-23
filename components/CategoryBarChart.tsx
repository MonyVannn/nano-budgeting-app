import { AppColors } from "@/constants/Colors";
import React from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import { BarChart } from "react-native-chart-kit";

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

  const chartConfig = {
    backgroundColor: "#ffffff",
    backgroundGradientFrom: "#ffffff",
    backgroundGradientTo: "#ffffff",
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(64, 160, 43, ${opacity})`, // Green
    labelColor: (opacity = 1) => `rgba(76, 79, 105, ${opacity})`, // Text color
    style: {
      borderRadius: 16,
    },
    propsForBackgroundLines: {
      strokeDasharray: "",
      stroke: AppColors.border,
      strokeWidth: 1,
    },
    propsForLabels: {
      fontSize: 12,
      fontWeight: "500",
    },
    barPercentage: 0.7,
  };

  return (
    <View style={styles.container}>
      <BarChart
        data={data}
        width={screenWidth - 48} // Account for padding
        height={height}
        chartConfig={chartConfig}
        verticalLabelRotation={0}
        fromZero
        showValuesOnTopOfBars
        withInnerLines
        style={styles.chart}
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
