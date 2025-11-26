import { Database } from "@/lib/database.types";
import { CSVAppField, ParsedCSVRow } from "./csvParser";

export type TransactionInsert =
  Database["public"]["Tables"]["transactions"]["Insert"];

export interface CSVMappingSelections {
  [key: string]: string | null;
}

export interface TransformSummary {
  totalRows: number;
  imported: number;
  skipped: number;
  errors: Array<{ index: number; reason: string }>;
}

type TypeOverride = "income" | "expense";

interface TransformParams {
  rows: ParsedCSVRow[];
  mappings: Record<CSVAppField, string | null>;
  userId: string;
  categories: Array<{ id: string; name: string }>;
  typeOverride?: TypeOverride;
}

const REQUIRED_FIELDS: CSVAppField[] = ["amount", "date"];

export function validateMappings(
  mappings: Record<CSVAppField, string | null>
) {
  return REQUIRED_FIELDS.every((field) => mappings[field]);
}

export function transformCSVRows({
  rows,
  mappings,
  userId,
  categories,
  typeOverride,
}: TransformParams): { transactions: TransactionInsert[]; summary: TransformSummary } {
  const transactions: TransactionInsert[] = [];
  const errors: Array<{ index: number; reason: string }> = [];

  const categoryLookup = new Map(
    categories.map((cat) => [cat.name.toLowerCase(), cat.id])
  );

  rows.forEach((row, index) => {
    try {
      const amountRaw = getValue(row, mappings.amount);
      const dateRaw = getValue(row, mappings.date);

      if (!amountRaw || !dateRaw) {
        throw new Error("Missing amount or date");
      }

      const parsedAmount = parseAmount(amountRaw);
      if (parsedAmount === null) {
        throw new Error("Invalid amount format");
      }

      const normalizedDate = normalizeDate(dateRaw);
      if (!normalizedDate) {
        throw new Error("Invalid date format");
      }

      const typeValue = getValue(row, mappings.type);
      const { isExpense, amount } = determineTransactionType(
        parsedAmount,
        typeValue,
        typeOverride
      );

      const description =
        getValue(row, mappings.description)?.trim() || "Imported transaction";
      const account = getValue(row, mappings.account)?.trim() || null;

      const categoryName = getValue(row, mappings.category)?.trim() || null;
      const categoryId =
        categoryName && categoryLookup.get(categoryName.toLowerCase())
          ? categoryLookup.get(categoryName.toLowerCase())!
          : null;

      transactions.push({
        user_id: userId,
        amount,
        date: normalizedDate,
        description,
        account,
        category_id: categoryId,
        is_expense: isExpense,
      });
    } catch (error: any) {
      errors.push({
        index,
        reason: error?.message || "Unknown error",
      });
    }
  });

  return {
    transactions,
    summary: {
      totalRows: rows.length,
      imported: transactions.length,
      skipped: errors.length,
      errors,
    },
  };
}

function getValue(
  row: ParsedCSVRow,
  header: string | null | undefined
): string | null {
  if (!header) return null;
  const value = row.raw[header];
  if (typeof value === "number") {
    return value.toString();
  }
  if (typeof value === "string") {
    return value.trim();
  }
  return null;
}

function parseAmount(value: string): number | null {
  const cleaned = value
    .replace(/[,$]/g, "")
    .replace(/\s/g, "");

  if (!cleaned) return null;
  const parsed = Number.parseFloat(cleaned);
  return Number.isNaN(parsed) ? null : parsed;
}

function normalizeDate(value: string): string | null {
  const trimmed = value.trim();

  const timestamp = Date.parse(trimmed);
  if (!Number.isNaN(timestamp)) {
    return new Date(timestamp).toISOString().split("T")[0];
  }

  const match = trimmed.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
  if (match) {
    let [_, a, b, c] = match;
    let month = parseInt(a, 10);
    let day = parseInt(b, 10);
    let year = parseInt(c, 10);

    if (c.length === 2) {
      year += year > 50 ? 1900 : 2000;
    }

    if (month > 12 && day <= 12) {
      [month, day] = [day, month];
    }

    const date = new Date(year, month - 1, day);
    if (!Number.isNaN(date.getTime())) {
      return date.toISOString().split("T")[0];
    }
  }

  return null;
}

function determineTransactionType(
  parsedAmount: number,
  typeValue: string | null,
  typeOverride?: TypeOverride
) {
  let isExpense =
    typeof typeOverride !== "undefined"
      ? typeOverride === "expense"
      : parsedAmount < 0;
  if (typeValue) {
    const lowered = typeValue.toLowerCase();
    if (/(expense|debit|withdrawal|payment)/.test(lowered)) {
      isExpense = true;
    } else if (/(income|credit|deposit|paycheck|salary)/.test(lowered)) {
      isExpense = false;
    }
  }
  const amount = Math.abs(parsedAmount);
  return { isExpense, amount };
}

