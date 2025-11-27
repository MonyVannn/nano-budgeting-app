import { Text } from "@/components/Themed";
import { useTheme } from "@/constants/ThemeContext";
import {
  CSV_MAPPING_OPTIONS,
  CSVAppField,
  CSVParseResult,
  parseCSVFile,
} from "@/lib/csvParser";
import { transformCSVRows, validateMappings } from "@/lib/csvTransform";
import { useAuthStore, useCategoryStore, useTransactionStore } from "@/store";
import * as DocumentPicker from "expo-document-picker";
import * as Haptics from "expo-haptics";
import { router, Stack } from "expo-router";
import {
  ArrowLeft,
  Check,
  FileSpreadsheet,
  UploadCloud,
} from "lucide-react-native";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type MappingState = Record<CSVAppField, string | null>;

const createEmptyMapping = (): MappingState =>
  CSV_MAPPING_OPTIONS.reduce((acc, option) => {
    acc[option.appField] = null;
    return acc;
  }, {} as MappingState);

const FIELD_KEYWORDS: Record<CSVAppField, RegExp[]> = {
  amount: [/amount|amt|value|total|paid|debit|credit/i],
  date: [/date|posted|transaction\s*date|time/i],
  description: [/description|memo|details|payee|name|note/i],
  account: [/account|card|source|wallet|institution|bank/i],
  category: [/category|type|bucket|tag/i],
  type: [/type|credit|debit|direction|txn\s*type/i],
};

export default function ImportCSVScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const { categories, fetchCategories } = useCategoryStore();
  const { importFromCSV } = useTransactionStore();

  const [fileName, setFileName] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [parseResult, setParseResult] = useState<CSVParseResult | null>(null);
  const [mappings, setMappings] = useState<MappingState>(createEmptyMapping());
  const [activeField, setActiveField] = useState<CSVAppField | null>(null);
  const [typeMode, setTypeMode] = useState<"auto" | "income" | "expense">(
    "auto"
  );

  useEffect(() => {
    if (!categories.length && user?.id) {
      fetchCategories(user.id);
    }
  }, [categories.length, user?.id, fetchCategories]);

  useEffect(() => {
    if (parseResult?.success) {
      setMappings(autoDetectMappings(parseResult.preview.headers));
    } else {
      setMappings(createEmptyMapping());
    }
  }, [parseResult?.success]);

  const headers = parseResult?.success ? parseResult.preview.headers : [];
  const sampleRows = parseResult?.success ? parseResult.preview.sample : [];

  const isReadyToImport =
    !!parseResult?.success &&
    validateMappings(mappings) &&
    !isImporting &&
    !!user?.id;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: theme.background,
          marginTop: 20,
        },
        header: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingTop: Platform.OS === "ios" ? insets.top + 10 : 20,
          paddingBottom: 16,
          paddingHorizontal: 20,
          gap: 12,
        },
        backButton: {
          padding: 8,
          borderRadius: 999,
          backgroundColor: theme.surface,
        },
        headerTitle: {
          fontSize: 24,
          fontWeight: "700",
          color: theme.text,
          flex: 1,
        },
        headerSubtitle: {
          fontSize: 13,
          color: theme.textSecondary,
          marginTop: 4,
        },
        content: {
          flex: 1,
          paddingHorizontal: 20,
        },
        card: {
          borderRadius: 16,
          borderWidth: 0.5,
          borderColor: theme.divider,
          backgroundColor: theme.surface,
          padding: 20,
          marginBottom: 20,
        },
        cardTitle: {
          fontSize: 18,
          fontWeight: "700",
          color: theme.text,
          marginBottom: 8,
        },
        cardSubtitle: {
          fontSize: 14,
          color: theme.textSecondary,
          marginBottom: 16,
        },
        uploadButton: {
          borderRadius: 12,
          borderWidth: 1,
          borderStyle: "dashed",
          borderColor: theme.divider,
          padding: 20,
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
          backgroundColor: theme.surface,
        },
        uploadIconWrapper: {
          width: 56,
          height: 56,
          borderRadius: 28,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: theme.surfaceHighlight,
        },
        uploadTitle: {
          fontSize: 16,
          fontWeight: "600",
          color: theme.text,
        },
        uploadSubtitle: {
          fontSize: 13,
          color: theme.textSecondary,
          textAlign: "center",
        },
        fileDetails: {
          marginTop: 16,
          padding: 16,
          borderRadius: 12,
          backgroundColor: theme.surfaceHighlight,
        },
        fileName: {
          fontSize: 14,
          fontWeight: "600",
          color: theme.text,
        },
        fileMeta: {
          fontSize: 12,
          color: theme.textSecondary,
          marginTop: 4,
        },
        typeToggleGroup: {
          flexDirection: "row",
          borderRadius: 10,
          borderWidth: 0.5,
          borderColor: theme.divider,
          overflow: "hidden",
          marginBottom: 12,
        },
        typeToggleButton: {
          flex: 1,
          paddingVertical: 10,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: theme.surface,
        },
        typeToggleButtonActive: {
          backgroundColor: theme.surfaceHighlight,
        },
        typeToggleText: {
          fontSize: 13,
          fontWeight: "600",
          color: theme.textSecondary,
        },
        typeToggleTextActive: {
          color: theme.text,
        },
        mappingRow: {
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: theme.divider,
          gap: 8,
        },
        mappingLabel: {
          fontSize: 14,
          fontWeight: "600",
          color: theme.text,
        },
        mappingHelper: {
          fontSize: 12,
          color: theme.textSecondary,
        },
        selectionBox: {
          padding: 12,
          borderRadius: 10,
          borderWidth: 0.5,
          borderColor: theme.divider,
          backgroundColor: theme.surfaceHighlight,
        },
        selectionText: {
          fontSize: 14,
          color: theme.text,
        },
        placeholderText: {
          fontSize: 13,
          color: theme.textSecondary,
        },
        helperText: {
          fontSize: 12,
          color: theme.textSecondary,
          marginTop: 4,
        },
        sampleWrapper: {
          marginTop: 16,
          borderRadius: 12,
          borderWidth: 0.5,
          borderColor: theme.divider,
          overflow: "hidden",
        },
        sampleHeader: {
          padding: 12,
          backgroundColor: theme.surfaceHighlight,
          borderBottomWidth: 0.5,
          borderBottomColor: theme.divider,
        },
        sampleHeaderText: {
          fontSize: 13,
          fontWeight: "600",
          color: theme.textSecondary,
        },
        sampleRow: {
          padding: 12,
          borderBottomWidth: 0.5,
          borderBottomColor: theme.divider,
          flexDirection: "row",
          justifyContent: "space-between",
          gap: 12,
        },
        sampleKey: {
          fontSize: 12,
          color: theme.textSecondary,
        },
        sampleValue: {
          fontSize: 13,
          color: theme.text,
          flex: 1,
        },
        footer: {
          paddingHorizontal: 20,
          paddingVertical: 16,
          paddingBottom: 32,
          borderTopWidth: 0.5,
          borderTopColor: theme.divider,
          backgroundColor: theme.surface,
        },
        primaryButton: {
          paddingVertical: 16,
          borderRadius: 12,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: theme.primary,
          opacity: isReadyToImport ? 1 : 0.4,
        },
        primaryButtonText: {
          fontSize: 16,
          fontWeight: "700",
          color: theme.text,
        },
        modalBackdrop: {
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.35)",
          justifyContent: "flex-end",
        },
        modalCard: {
          backgroundColor: theme.surface,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          padding: 20,
          maxHeight: "70%",
        },
        modalTitle: {
          fontSize: 16,
          fontWeight: "700",
          color: theme.text,
          marginBottom: 12,
        },
        modalOption: {
          paddingVertical: 12,
          borderBottomWidth: 0.5,
          borderBottomColor: theme.divider,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        },
        modalOptionText: {
          fontSize: 15,
          color: theme.text,
          flex: 1,
        },
        clearButton: {
          marginTop: 12,
          paddingVertical: 12,
          alignItems: "center",
        },
        clearButtonText: {
          fontSize: 14,
          fontWeight: "600",
          color: theme.expense,
        },
      }),
    [theme, insets, isReadyToImport]
  );

  const handlePickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["text/csv", "text/comma-separated-values", "application/csv"],
        multiple: false,
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets?.length) {
        return;
      }

      const asset = result.assets[0];
      setFileName(asset.name ?? "Selected CSV");
      setIsParsing(true);
      setParseResult(null);

      const parsed = await parseCSVFile(asset.uri);
      setParseResult(parsed);

      if (parsed.success) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } else {
        Alert.alert("Parsing Error", parsed.error);
      }
    } catch (error: any) {
      Alert.alert("File Error", error?.message || "Unable to open the file.");
    } finally {
      setIsParsing(false);
    }
  };

  const handleSelectHeader = (field: CSVAppField, header: string | null) => {
    setMappings((prev) => ({
      ...prev,
      [field]: header,
    }));
    setActiveField(null);
  };

  const handleImport = async () => {
    if (!parseResult?.success || !user?.id) {
      return;
    }

    if (!validateMappings(mappings)) {
      Alert.alert(
        "Missing fields",
        "Please map all required fields before continuing."
      );
      return;
    }

    try {
      setIsImporting(true);
      const { transactions, summary } = transformCSVRows({
        rows: parseResult.rows,
        mappings,
        userId: user.id,
        categories,
        typeOverride: typeMode === "auto" ? undefined : typeMode,
      });

      if (!transactions.length) {
        Alert.alert(
          "Nothing to import",
          summary.errors.length
            ? "All rows were skipped. Please review the CSV and try again."
            : "No valid transactions detected."
        );
        return;
      }

      await importFromCSV(transactions);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        "Import complete",
        `Imported ${summary.imported} of ${summary.totalRows} rows${
          summary.skipped ? ` (${summary.skipped} skipped)` : ""
        }.`
      );
      router.back();
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        "Import failed",
        error?.message || "Unable to import transactions."
      );
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <Pressable
          style={{ padding: 4 }}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.back();
          }}
        >
          <ArrowLeft size={24} color={theme.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Import CSV</Text>
      </View>
      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Upload a CSV file</Text>
          <Text style={styles.cardSubtitle}>
            Export from your bank or spreadsheet. We’ll help you map each column
            to the right field.
          </Text>

          <Pressable
            style={styles.uploadButton}
            onPress={handlePickFile}
            disabled={isParsing}
          >
            <View style={styles.uploadIconWrapper}>
              {isParsing ? (
                <ActivityIndicator color={theme.primary} />
              ) : (
                <UploadCloud size={28} color={theme.primary} />
              )}
            </View>
            <Text style={styles.uploadTitle}>
              {isParsing ? "Parsing file..." : "Select CSV"}
            </Text>
            <Text style={styles.uploadSubtitle}>
              Supports .csv files up to 5MB. Headers required for best results.
            </Text>
          </Pressable>

          {fileName && (
            <View style={styles.fileDetails}>
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
              >
                <FileSpreadsheet size={24} color={theme.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.fileName}>{fileName}</Text>
                  {parseResult?.success ? (
                    <Text style={styles.fileMeta}>
                      {parseResult.preview.rowCount} rows detected
                    </Text>
                  ) : parseResult?.success === false ? (
                    <Text style={[styles.fileMeta, { color: theme.expense }]}>
                      {parseResult.error}
                    </Text>
                  ) : (
                    <Text style={styles.fileMeta}>Processing…</Text>
                  )}
                </View>
              </View>
            </View>
          )}
        </View>

        <View style={[styles.card]}>
          <Text style={styles.cardTitle}>Map your columns</Text>
          <Text style={styles.cardSubtitle}>
            Choose which CSV header maps to each field. Required fields are
            marked with a dot.
          </Text>

          <View style={styles.typeToggleGroup}>
            {(["auto", "income", "expense"] as const).map((mode) => (
              <Pressable
                key={mode}
                disabled={!parseResult?.success}
                style={[
                  styles.typeToggleButton,
                  typeMode === mode && styles.typeToggleButtonActive,
                ]}
                onPress={() => setTypeMode(mode)}
              >
                <Text
                  style={[
                    styles.typeToggleText,
                    typeMode === mode && styles.typeToggleTextActive,
                  ]}
                >
                  {mode === "auto"
                    ? "Auto detect"
                    : mode === "income"
                    ? "All income"
                    : "All expense"}
                </Text>
              </Pressable>
            ))}
          </View>

          {CSV_MAPPING_OPTIONS.map((option) => {
            const selectedHeader = mappings[option.appField];
            const sampleValue =
              selectedHeader && sampleRows.length
                ? sampleRows[0].raw[selectedHeader]
                : null;

            return (
              <View key={option.appField} style={styles.mappingRow}>
                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
                >
                  <Text style={styles.mappingLabel}>{option.label}</Text>
                  {option.required && (
                    <Text style={{ fontSize: 14, color: theme.primary }}>
                      •
                    </Text>
                  )}
                </View>
                {option.helper ? (
                  <Text style={styles.mappingHelper}>{option.helper}</Text>
                ) : null}
                <Pressable
                  style={styles.selectionBox}
                  disabled={!parseResult?.success}
                  onPress={() => setActiveField(option.appField)}
                >
                  {selectedHeader ? (
                    <>
                      <Text style={styles.selectionText}>{selectedHeader}</Text>
                      {sampleValue ? (
                        <Text style={styles.helperText}>
                          Sample: {String(sampleValue)}
                        </Text>
                      ) : null}
                    </>
                  ) : (
                    <Text style={styles.placeholderText}>
                      {parseResult?.success
                        ? "Select a column"
                        : "Upload a CSV to configure"}
                    </Text>
                  )}
                </Pressable>
              </View>
            );
          })}

          {parseResult?.success && sampleRows.length > 0 && (
            <View style={styles.sampleWrapper}>
              <View style={styles.sampleHeader}>
                <Text style={styles.sampleHeaderText}>
                  Preview ({Math.min(sampleRows.length, 3)} of{" "}
                  {parseResult.preview.rowCount})
                </Text>
              </View>
              {sampleRows.slice(0, 3).map((row, index) => (
                <View
                  key={`sample-${index}`}
                  style={[
                    styles.sampleRow,
                    index === 2 && { borderBottomWidth: 0 },
                  ]}
                >
                  {headers.slice(0, 4).map((header) => (
                    <View key={`${index}-${header}`} style={{ flex: 1 }}>
                      <Text style={styles.sampleKey}>{header}</Text>
                      <Text
                        style={styles.sampleValue}
                        numberOfLines={2}
                        ellipsizeMode="tail"
                      >
                        {row.raw[header] ? String(row.raw[header]) : "—"}
                      </Text>
                    </View>
                  ))}
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          style={styles.primaryButton}
          disabled={!isReadyToImport}
          onPress={handleImport}
        >
          {isImporting ? (
            <ActivityIndicator color={theme.background} />
          ) : (
            <Text style={styles.primaryButtonText}>Import transactions</Text>
          )}
        </Pressable>
      </View>

      <Modal
        transparent
        animationType="slide"
        visible={!!activeField}
        onRequestClose={() => setActiveField(null)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setActiveField(null)}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              Map to {activeField && fieldLabel(activeField)}
            </Text>
            <ScrollView>
              {headers.map((header) => {
                const isSelected = activeField
                  ? mappings[activeField] === header
                  : false;
                return (
                  <Pressable
                    key={header}
                    style={styles.modalOption}
                    onPress={() =>
                      activeField && handleSelectHeader(activeField, header)
                    }
                  >
                    <Text style={styles.modalOptionText}>{header}</Text>
                    {isSelected ? (
                      <Check size={18} color={theme.primary} />
                    ) : null}
                  </Pressable>
                );
              })}
            </ScrollView>
            <Pressable
              style={styles.clearButton}
              onPress={() =>
                activeField && handleSelectHeader(activeField, null)
              }
            >
              <Text style={styles.clearButtonText}>Clear selection</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

function autoDetectMappings(headers: string[]): MappingState {
  const result = createEmptyMapping();
  const usedHeaders = new Set<string>();

  headers.forEach((header) => {
    const lower = header.toLowerCase();

    (Object.keys(FIELD_KEYWORDS) as CSVAppField[]).forEach((field) => {
      if (result[field]) return;
      const patterns = FIELD_KEYWORDS[field];
      if (
        patterns.some((regex) => regex.test(lower)) &&
        !usedHeaders.has(header)
      ) {
        result[field] = header;
        usedHeaders.add(header);
      }
    });
  });

  return result;
}

function fieldLabel(field: CSVAppField) {
  return (
    CSV_MAPPING_OPTIONS.find((option) => option.appField === field)?.label ||
    field
  );
}
