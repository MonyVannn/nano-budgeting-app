// Additional shared types for the application

export interface CSVMappingField {
  csvHeader: string;
  appField: "amount" | "date" | "description" | "account" | "category";
  sample?: string;
}

export interface BudgetSummary {
  totalBudget: number;
  totalSpent: number;
  remaining: number;
  percentageUsed: number;
}

export interface CategoryProgress {
  categoryId: string;
  categoryName: string;
  expected: number;
  spent: number;
  remaining: number;
  percentageUsed: number;
}

export interface MonthlyCarryOver {
  month: string;
  carryOverAmount: number;
}

export type FrequencyType = "weekly" | "monthly" | "yearly";

export interface PDFExportOptions {
  startDate: string;
  endDate: string;
  includeCategories: boolean;
  includeSummary: boolean;
}
