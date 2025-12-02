import { useTheme } from "@/constants/ThemeContext";
import React, { useEffect } from "react";
import { Platform, ScrollView, StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Skeleton line component with shimmer effect
function SkeletonLine({
  width,
  height = 16,
  style,
}: {
  width: number | string;
  height?: number;
  style?: any;
}) {
  const { theme } = useTheme();
  const shimmer = useSharedValue(-1);

  useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1, {
        duration: 1500,
        easing: Easing.linear,
      }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: 0.3 + (shimmer.value + 1) * 0.2, // Oscillate between 0.3 and 0.7
    };
  });

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          backgroundColor: theme.divider,
          borderRadius: 4,
        },
        animatedStyle,
        style,
      ]}
    />
  );
}

export function TransactionsSkeleton() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const headerHeight = Platform.OS === "ios" ? insets.top + 80 : 100;
  const stickyHeaderStyle = [
    styles.stickyHeader,
    {
      paddingTop: Platform.OS === "ios" ? insets.top + 20 : 40,
      backgroundColor: theme.background,
    },
  ];

  const contentContainerStyle = {
    paddingTop: headerHeight,
    paddingBottom: Platform.OS === "ios" ? insets.bottom + 20 : 20,
    paddingHorizontal: 20,
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Sticky Header */}
      <View style={stickyHeaderStyle}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <SkeletonLine width={120} height={24} />
            <View style={styles.headerActions}>
              <SkeletonLine width={50} height={36} style={{ borderRadius: 18 }} />
              <SkeletonLine width={36} height={36} style={{ borderRadius: 18 }} />
              <SkeletonLine width={36} height={36} style={{ borderRadius: 18 }} />
            </View>
          </View>
        </View>
      </View>

      {/* Scrollable Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={contentContainerStyle}
        showsVerticalScrollIndicator={false}
      >
        {/* Chart Section Skeleton */}
        <View style={styles.chartContainer}>
          <View style={styles.chartHeader}>
            {/* Date Navigation */}
            <View style={styles.chartNav}>
              <SkeletonLine width={20} height={20} />
              <SkeletonLine width={140} height={15} />
              <SkeletonLine width={20} height={20} />
            </View>
            {/* Actions */}
            <View style={styles.chartActions}>
              <SkeletonLine width={32} height={32} style={{ borderRadius: 16 }} />
              <SkeletonLine width={80} height={28} style={{ borderRadius: 6 }} />
            </View>
          </View>
          {/* Chart Area */}
          <View style={styles.chartWrapper}>
            <View style={[styles.chartSkeleton, { backgroundColor: theme.surface }]}>
              {/* Bar chart skeleton - show 7 bars for week view */}
              <View style={styles.barsContainer}>
                {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                  <View key={i} style={styles.barWrapper}>
                    <SkeletonLine
                      width={30}
                      height={Math.max(40, 60 + (i % 3) * 20)}
                      style={{
                        borderRadius: 4,
                        backgroundColor: theme.divider,
                        alignSelf: "flex-end",
                      }}
                    />
                  </View>
                ))}
              </View>
              {/* X-axis labels */}
              <View style={styles.chartLabels}>
                {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                  <SkeletonLine key={i} width={20} height={10} />
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* Transaction Groups Skeleton */}
        {[1, 2, 3].map((groupIndex) => (
          <View key={groupIndex} style={styles.transactionGroup}>
            {/* Date Header */}
            <SkeletonLine width={100} height={14} style={{ marginBottom: 12 }} />
            {/* Transaction Items */}
            {[1, 2, 3].map((itemIndex) => (
              <View
                key={itemIndex}
                style={[
                  styles.transactionItemWrapper,
                  {
                    borderColor: theme.divider,
                    backgroundColor: theme.surface,
                  },
                ]}
              >
                <View style={styles.transactionItem}>
                  <View style={styles.transactionLeft}>
                    <SkeletonLine width={180} height={16} />
                    <View style={styles.transactionMeta}>
                      <SkeletonLine width={80} height={13} />
                      <SkeletonLine width={60} height={13} />
                    </View>
                  </View>
                  <SkeletonLine width={80} height={18} />
                </View>
              </View>
            ))}
          </View>
        ))}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  stickyHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  header: {
    gap: 8,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 6,
  },
  chartContainer: {
    marginBottom: 24,
  },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 20,
    marginBottom: 8,
  },
  chartNav: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  chartActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  chartWrapper: {
    paddingHorizontal: 0,
    paddingBottom: 0,
  },
  chartSkeleton: {
    height: 200,
    padding: 16,
    borderRadius: 12,
    justifyContent: "flex-end",
  },
  barsContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-around",
    height: 150,
    marginBottom: 8,
  },
  barWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  chartLabels: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 8,
  },
  transactionGroup: {
    marginBottom: 24,
  },
  transactionItemWrapper: {
    borderRadius: 12,
    marginBottom: 8,
    overflow: "hidden",
    borderWidth: 0.5,
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
  transactionMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
});

