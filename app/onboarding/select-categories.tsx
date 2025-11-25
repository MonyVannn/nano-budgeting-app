import { Text } from "@/components/Themed";
import { useTheme } from "@/constants/ThemeContext";
import {
  getGroupTitle,
  predefinedCategories,
  PredefinedCategory,
} from "@/constants/predefinedCategories";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { ChevronRight } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function SelectCategoriesScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    new Set()
  );

  // Group categories by group type
  const groupedCategories = useMemo(() => {
    const groups: { [key: string]: PredefinedCategory[] } = {};
    predefinedCategories.forEach((cat) => {
      if (!groups[cat.group]) {
        groups[cat.group] = [];
      }
      groups[cat.group].push(cat);
    });
    return groups;
  }, []);

  const toggleCategory = (categoryName: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryName)) {
        newSet.delete(categoryName);
      } else {
        newSet.add(categoryName);
      }
      return newSet;
    });
  };

  const handleContinue = () => {
    if (selectedCategories.size === 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Pass selected categories to next screen
    const selected = Array.from(selectedCategories);
    router.push({
      pathname: "./allocate-budget",
      params: { categories: JSON.stringify(selected) },
    });
  };

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: theme.background,
        },
        content: {
          flex: 1,
          paddingHorizontal: 20,
        },
        header: {
          paddingTop: Platform.OS === "ios" ? insets.top + 20 : 40,
          paddingBottom: 24,
        },
        title: {
          fontSize: 28,
          fontWeight: "700",
          color: theme.text,
          marginBottom: 8,
        },
        subtitle: {
          fontSize: 16,
          color: theme.textSecondary,
          lineHeight: 22,
        },
        groupsContainer: {
          gap: 32,
          paddingBottom: 100,
        },
        groupSection: {
          gap: 12,
        },
        groupTitle: {
          fontSize: 18,
          fontWeight: "600",
          color: theme.text,
          marginBottom: 4,
        },
        categoriesGrid: {
          gap: 12,
        },
        categoryButton: {
          flexDirection: "row",
          alignItems: "center",
          padding: 16,
          borderRadius: 12,
          borderWidth: 1.5,
          backgroundColor: theme.surface,
          gap: 12,
        },
        categoryButtonSelected: {
          borderColor: theme.primary,
          backgroundColor: theme.surfaceHighlight,
        },
        categoryButtonUnselected: {
          borderColor: theme.divider,
        },
        categoryIconWrapper: {
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: theme.surfaceHighlight,
          justifyContent: "center",
          alignItems: "center",
        },
        categoryIconWrapperSelected: {
          backgroundColor: theme.primary + "20",
        },
        categoryName: {
          fontSize: 16,
          fontWeight: "500",
          color: theme.text,
          flex: 1,
        },
        continueButton: {
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          paddingHorizontal: 20,
          paddingBottom: Platform.OS === "ios" ? insets.bottom + 20 : 20,
          paddingTop: 20,
          backgroundColor: theme.background,
          borderTopWidth: 0.5,
          borderTopColor: theme.divider,
        },
        continueButtonContent: {
          backgroundColor: theme.primary,
          borderRadius: 12,
          padding: 16,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
        },
        continueButtonDisabled: {
          backgroundColor: theme.surface,
          opacity: 0.5,
        },
        continueButtonText: {
          fontSize: 16,
          fontWeight: "600",
          color: theme.background,
        },
      }),
    [theme, insets, selectedCategories.size]
  );

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.groupsContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Let's create some categories</Text>
          <Text style={styles.subtitle}>
            Here are some suggestions for you (you can always add/edit these
            later)
          </Text>
        </View>

        {Object.entries(groupedCategories).map(([groupKey, categories]) => (
          <View key={groupKey} style={styles.groupSection}>
            <Text style={styles.groupTitle}>{getGroupTitle(groupKey)}</Text>
            <View style={styles.categoriesGrid}>
              {categories.map((category) => {
                const Icon = category.icon;
                const isSelected = selectedCategories.has(category.name);
                return (
                  <Pressable
                    key={category.name}
                    style={[
                      styles.categoryButton,
                      isSelected
                        ? styles.categoryButtonSelected
                        : styles.categoryButtonUnselected,
                    ]}
                    onPress={() => toggleCategory(category.name)}
                  >
                    <View
                      style={[
                        styles.categoryIconWrapper,
                        isSelected && styles.categoryIconWrapperSelected,
                      ]}
                    >
                      <Icon
                        size={20}
                        color={isSelected ? theme.primary : theme.textSecondary}
                      />
                    </View>
                    <Text style={styles.categoryName}>{category.name}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Continue Button */}
      <View style={styles.continueButton}>
        <Pressable
          style={[
            styles.continueButtonContent,
            selectedCategories.size === 0 && styles.continueButtonDisabled,
          ]}
          onPress={handleContinue}
          disabled={selectedCategories.size === 0}
        >
          <Text
            style={[
              styles.continueButtonText,
              selectedCategories.size === 0 && { color: theme.textSecondary },
            ]}
          >
            Continue
          </Text>
          <ChevronRight
            size={20}
            color={
              selectedCategories.size === 0
                ? theme.textSecondary
                : theme.background
            }
          />
        </Pressable>
      </View>
    </View>
  );
}

