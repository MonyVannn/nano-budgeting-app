import { AnimatedTabScreen } from "@/components/AnimatedTabScreen";
import { AnimatedTitle } from "@/components/AnimatedTitle";
import { FABButton } from "@/components/FABButton";
import { Text } from "@/components/Themed";
import { useTheme } from "@/constants/ThemeContext";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Platform,
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

export default function DashboardScreen() {
  const [incomeExpanded, setIncomeExpanded] = useState(false);
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  // Animated values for income expansion
  const heightAnimation = useSharedValue(0);
  const opacityAnimation = useSharedValue(0);
  const rotationAnimation = useSharedValue(0);

  const categories = [
    { name: "Eating out", budgeted: 20, left: 20 },
    { name: "Going out", budgeted: 50, left: 50 },
    { name: "Entertainment", budgeted: 50, left: 50 },
    { name: "Groceries", budgeted: 200, left: 200 },
    { name: "Internet", budgeted: 0, left: 0 },
    { name: "Personal Care", budgeted: 50, left: 50 },
    { name: "Phone Bill", budgeted: 15, left: 15 },
    { name: "Rent", budgeted: 0, left: 0 },
    { name: "Utilities", budgeted: 0, left: 0 },
  ];

  // Animate when expansion state changes
  useEffect(() => {
    const config = {
      duration: 400,
      easing: Easing.bezier(0.4, 0.0, 0.2, 1), // Ease in-out curve
    };

    if (incomeExpanded) {
      heightAnimation.value = withTiming(1, config);
      opacityAnimation.value = withTiming(1, { ...config, duration: 300 });
      rotationAnimation.value = withTiming(180, config);
    } else {
      heightAnimation.value = withTiming(0, config);
      opacityAnimation.value = withTiming(0, { ...config, duration: 200 });
      rotationAnimation.value = withTiming(0, config);
    }
  }, [incomeExpanded]);

  // Animated styles
  const animatedDetailsStyle = useAnimatedStyle(() => ({
    height: heightAnimation.value * 180, // Approximate height of details section
    opacity: opacityAnimation.value,
    overflow: "hidden",
  }));

  const animatedChevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotationAnimation.value}deg` }],
  }));

  const handleCategoryPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const styles = StyleSheet.create({
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
      borderBottomWidth: 0.5,
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
      fontSize: 12,
      color: theme.textSecondary,
    },
    incomeAmount: {
      fontSize: 16,
      fontWeight: "600",
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
    },
    summaryCard: {
      padding: 20,
      justifyContent: "space-between",
    },
    summaryColumns: {
      flexDirection: "row",
    },
    summaryBudgetColumn: {
      flexDirection: "row",
      width: 150,
      gap: 10,
    },
    summaryColumnLeft: {
      alignItems: "flex-start",
      flex: 1,
      gap: 8,
    },
    summaryColumnRight: {
      alignItems: "flex-end",
      flex: 1,
      gap: 8,
    },
    columnLabel: {
      fontSize: 12,
      color: theme.textSecondary,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    columnValue: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.text,
    },
    categoryListWrapper: {
      marginHorizontal: 16,
      borderRadius: 12,
      overflow: "hidden",
      borderWidth: 0.5,
      borderColor: theme.divider,
    },
    categoryList: {},
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
    categoryAmounts: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      minWidth: 160,
      justifyContent: "flex-end",
    },
    budgetedAmount: {
      fontSize: 14,
      color: theme.textSecondary,
      width: 60,
      textAlign: "right",
    },
    leftBadge: {
      backgroundColor: theme.budgetRemaining,
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 12,
      width: 70,
      alignItems: "center",
    },
    leftAmount: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.background,
    },
  });

  const CategoryItem = ({ name, budgeted, left, isLast }: any) => (
    <TouchableOpacity
      style={[styles.categoryItem, isLast && styles.categoryItemLast]}
      onPress={handleCategoryPress}
      activeOpacity={1}
    >
      <Text style={styles.categoryName}>{name}</Text>
      <View style={styles.categoryAmounts}>
        <Text style={styles.budgetedAmount}>${budgeted.toFixed(2)}</Text>
        <View style={styles.leftBadge}>
          <Text
            style={styles.leftAmount}
            adjustsFontSizeToFit
            numberOfLines={1}
            minimumFontScale={0.6}
          >
            ${left.toFixed(2)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const headerHeight = Platform.OS === "ios" ? insets.top + 80 : 100;
  const stickyHeaderStyle = [
    styles.stickyHeader,
    { paddingTop: Platform.OS === "ios" ? insets.top + 20 : 40 },
  ];

  return (
    <AnimatedTabScreen screenIndex={0}>
      <View style={styles.container}>
        {/* Sticky Header */}
        <View style={stickyHeaderStyle}>
          <View style={styles.header}>
            <AnimatedTitle pathMatch="/(tabs)" style={styles.title}>
              Dashboard
            </AnimatedTitle>
          </View>
        </View>

        {/* Scrollable Content */}
        <ScrollView
          style={styles.container}
          contentContainerStyle={{ paddingTop: headerHeight }}
          showsVerticalScrollIndicator={false}
        >
          {/* Income Dropdown */}
          <View style={styles.incomeCardWrapper}>
            <BlurView
              intensity={50}
              tint={theme.blurTint}
              style={styles.incomeCard}
            >
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setIncomeExpanded(!incomeExpanded);
                }}
                activeOpacity={1}
              >
                <View style={styles.incomeHeader}>
                  <View style={styles.incomeLabelContainer}>
                    <Text style={styles.incomeLabel}>Income</Text>
                    <Animated.Text
                      style={[styles.chevron, animatedChevronStyle]}
                    >
                      ▼
                    </Animated.Text>
                  </View>
                  <Text style={styles.incomeAmount}>$200.00</Text>
                </View>

                <Animated.View style={animatedDetailsStyle}>
                  <View style={styles.incomeDetails}>
                    <View style={styles.detailRow}>
                      <View style={styles.detailLeft}>
                        <Text style={styles.detailLabel}>Income</Text>
                        <View
                          style={[
                            styles.indicator,
                            { backgroundColor: theme.indicatorGreen },
                          ]}
                        />
                      </View>
                      <Text style={styles.detailAmount}>$0.00</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <View style={styles.detailLeft}>
                        <Text style={styles.detailLabel}>Expenses</Text>
                        <View
                          style={[
                            styles.indicator,
                            { backgroundColor: theme.indicatorRed },
                          ]}
                        />
                      </View>
                      <Text style={styles.detailAmount}>-$0.00</Text>
                    </View>
                    <View style={[styles.detailRow, styles.detailRowLast]}>
                      <View style={styles.detailLeft}>
                        <Text style={styles.detailLabel}>Remaining</Text>
                        <View
                          style={[
                            styles.indicator,
                            { backgroundColor: theme.indicatorGreen },
                          ]}
                        />
                      </View>
                      <Text style={styles.detailAmount}>$0.00</Text>
                    </View>
                  </View>
                </Animated.View>
              </TouchableOpacity>
            </BlurView>
          </View>

          {/* Monthly Summary - Two Row Layout */}
          <View style={styles.summaryCardWrapper}>
            <BlurView
              intensity={50}
              tint={theme.blurTint}
              style={styles.summaryCard}
            >
              <View style={styles.summaryColumns}>
                <View style={styles.summaryColumnLeft}>
                  <Text style={styles.columnLabel}>Monthly</Text>
                  <Text style={styles.columnValue}>8 days left</Text>
                </View>
                <View style={styles.summaryBudgetColumn}>
                  <View style={styles.summaryColumnRight}>
                    <Text style={styles.columnLabel}>Budgeted</Text>
                    <Text style={styles.columnValue}>$315.00</Text>
                  </View>
                  <View style={styles.summaryColumnRight}>
                    <Text style={styles.columnLabel}>Left</Text>
                    <Text style={styles.columnValue}>$315.00</Text>
                  </View>
                </View>
              </View>
            </BlurView>
          </View>

          <View style={styles.categoryListWrapper}>
            <BlurView
              intensity={50}
              tint={theme.blurTint}
              style={styles.categoryList}
            >
              {categories.map((cat, index) => (
                <CategoryItem
                  key={index}
                  {...cat}
                  isLast={index === categories.length - 1}
                />
              ))}
            </BlurView>
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
    </AnimatedTabScreen>
  );
}
