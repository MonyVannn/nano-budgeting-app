import * as FileSystem from "expo-file-system/legacy";
import Papa from "papaparse";

export type CSVAppField =
  | "amount"
  | "date"
  | "description"
  | "account"
  | "category"
  | "type";

export interface ParsedCSVRow {
  raw: Record<string, string | number | null>;
}

export interface CSVPreview {
  headers: string[];
  sample: ParsedCSVRow[];
  rowCount: number;
}

export interface CSVMappingOption {
  appField: CSVAppField;
  label: string;
  required: boolean;
  helper?: string;
}

export const CSV_MAPPING_OPTIONS: CSVMappingOption[] = [
  {
    appField: "amount",
    label: "Amount",
    required: true,
    helper: "Positive for income, negative for expenses.",
  },
  {
    appField: "date",
    label: "Date",
    required: true,
    helper: "Supports YYYY-MM-DD, MM/DD/YYYY, DD/MM/YYYY.",
  },
  {
    appField: "description",
    label: "Description",
    required: false,
  },
  {
    appField: "account",
    label: "Account",
    required: false,
  },
  {
    appField: "category",
    label: "Category",
    required: false,
    helper: "Matches by name; fallback is uncategorized.",
  },
  {
    appField: "type",
    label: "Type (Income/Expense)",
    required: false,
    helper: "If omitted, amount sign determines income vs expense.",
  },
];

export type CSVParseResult =
  | { success: true; preview: CSVPreview; rows: ParsedCSVRow[] }
  | { success: false; error: string };

export async function parseCSVFile(uri: string): Promise<CSVParseResult> {
  try {
    const fileContent = await FileSystem.readAsStringAsync(uri);

    return await new Promise<CSVParseResult>((resolve) => {
      Papa.parse<Record<string, string>>(fileContent, {
        header: true,
        skipEmptyLines: "greedy",
        transformHeader: (header) => header.trim(),
        complete: (result) => {
          if (result.errors.length > 0) {
            const firstError = result.errors[0];
            resolve({
              success: false,
              error:
                firstError.message ||
                "Unable to parse CSV. Please verify the file format.",
            });
            return;
          }

          const rawHeaders = result.meta.fields ?? [];
          const headers = rawHeaders.filter(
            (header) => header && header.trim().length > 0
          );
          const rows = (result.data || []).map((row) => ({
            raw: sanitizeRow(row, headers),
          }));

          resolve({
            success: true,
            preview: {
              headers,
              sample: rows.slice(0, 10),
              rowCount: rows.length,
            },
            rows,
          });
        },
        error: (error) => {
          resolve({
            success: false,
            error: error.message || "Failed to parse CSV file.",
          });
        },
      });
    });
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || "Unable to read the selected file.",
    };
  }
}

function sanitizeRow(
  row: Record<string, string>,
  headers: string[]
): Record<string, string | number | null> {
  const sanitized: Record<string, string | number | null> = {};
  headers.forEach((header) => {
    sanitized[header] = row[header] ?? null;
  });
  return sanitized;
}

