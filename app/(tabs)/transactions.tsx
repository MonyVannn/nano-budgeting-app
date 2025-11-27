import { FABButton } from "@/components/FABButton";
import { Text } from "@/components/Themed";
import { useTheme } from "@/constants/ThemeContext";
import { useAuthStore, useCategoryStore, useTransactionStore } from "@/store";
import * as Haptics from "expo-haptics";
import * as Print from "expo-print";
import { router, useFocusEffect } from "expo-router";
import * as Sharing from "expo-sharing";
import {
  ArrowDownRight,
  ArrowUpRight,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  UploadCloud,
} from "lucide-react-native";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { BarChart } from "react-native-gifted-charts";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const STATEMENT_LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 190 43"><g opacity="1" transform="translate(0,1)"><path d="M45.8693 4.61295C46.667 3.72652 47.5535 2.99522 48.4621 2.41904C50.0576 1.42181 51.7418 0.889954 53.4704 0.889954V15.3609C52.2072 10.9731 49.4814 7.20574 45.8693 4.61295ZM67.3873 40.89H16.1296C7.7086 40.89 0.905273 34.0645 0.905273 25.6656C0.905273 17.6213 7.15458 11.0174 15.0659 10.4634V0.889954C16.8388 0.889954 18.5895 1.39965 20.2294 2.41904C21.138 2.97306 22.0244 3.70436 22.8222 4.54646C26.0798 2.26391 30.0244 0.934275 34.3014 0.934275C34.3014 10.1753 30.9773 20.9232 20.1629 20.9454H34.1906C33.7917 19.1503 32.1518 17.8207 30.2017 17.7985H38.3568C36.4067 17.7985 34.7668 19.1503 34.3679 20.9675H47.4427C50.0576 20.9675 52.6504 21.4772 55.0881 22.4966C57.5036 23.4938 59.7197 24.9786 61.559 26.8179C63.4205 28.6794 64.8831 30.8733 65.8803 33.2888C66.8776 35.6822 67.3873 38.275 67.3873 40.89ZM23.6864 10.7293C24.0188 11.5936 24.9053 12.5686 26.1463 13.2778C27.3873 13.9869 28.6726 14.275 29.5812 14.142C29.2488 13.2778 28.3623 12.3027 27.1213 11.5936C25.8803 10.8844 24.595 10.5963 23.6864 10.7293ZM42.3457 13.2778C41.1047 13.9869 39.8194 14.275 38.9108 14.142C39.2432 13.2778 40.1297 12.3027 41.3706 11.5936C42.6116 10.8844 43.897 10.5963 44.8055 10.7293C44.4953 11.5936 43.5867 12.5686 42.3457 13.2778Z" fill="#FFFFFF"/><g transform="translate(74,2)"><path fill="#ffffff" d="M15.44 29.69L15.44 29.69L15.44 39L7.92 39L7.92 0.92L16.72 0.92L19.57 11.16Q19.95 12.47 20.37 14.09Q20.78 15.70 21.17 17.32Q21.55 18.94 21.81 20.18L21.81 20.18Q22.38 22.84 22.83 25.11Q23.28 27.38 23.73 29.78L23.73 29.78Q23.92 30.94 24.08 32.02L24.08 32.02Q24.24 33.14 24.40 34.20L24.40 34.20L25.04 34.20Q24.78 32.50 24.56 31.14Q24.34 29.78 24.11 28.34Q23.89 26.90 23.63 24.92L23.63 24.92Q23.41 23.51 23.18 21.74Q22.96 19.96 22.77 18.22Q22.58 16.47 22.51 15.13L22.51 15.13Q22.42 13.94 22.37 12.81Q22.32 11.67 22.32 10.62L22.32 10.62L22.32 0.92L29.84 0.92L29.84 39L21.52 39L18.58 29.11Q18.26 28.09 17.84 26.55Q17.42 25.02 16.96 23.27Q16.50 21.53 16.11 19.83L16.11 19.83Q15.57 17.50 15.02 15.02Q14.48 12.54 14.06 10.14L14.06 10.14Q13.84 8.98 13.65 7.86Q13.46 6.74 13.30 5.72L13.30 5.72L12.66 5.72Q12.98 7.80 13.36 10.12Q13.74 12.44 14.13 15.03L14.13 15.03Q14.45 17.53 14.77 20.07Q15.09 22.62 15.28 25.05L15.28 25.05Q15.34 26.26 15.39 27.43Q15.44 28.60 15.44 29.69ZM39.60 39L32.08 39L38.03 0.92L48.78 0.92L54.74 39L47.22 39L46.10 30.26L40.72 30.26L39.60 39ZM42.90 11.29L41.62 23.22L45.20 23.22L43.92 11.29Q43.86 10.55 43.82 9.96Q43.79 9.37 43.76 8.68Q43.73 7.99 43.73 7L43.73 7L43.09 7L43.09 7.93Q43.09 8.15 43.09 8.38Q43.06 8.63 43.06 8.86L43.06 8.86Q43.06 9.18 43.02 9.51Q42.99 9.85 42.99 10.17L42.99 10.17Q42.99 10.81 42.90 11.29L42.90 11.29ZM64.50 29.69L64.50 29.69L64.50 39L56.98 39L56.98 0.92L65.78 0.92L68.62 11.16Q69.01 12.47 69.42 14.09Q69.84 15.70 70.22 17.32Q70.61 18.94 70.86 20.18L70.86 20.18Q71.44 22.84 71.89 25.11Q72.34 27.38 72.78 29.78L72.78 29.78Q72.98 30.94 73.14 32.02L73.14 32.02Q73.30 33.14 73.46 34.20L73.46 34.20L74.10 34.20Q73.84 32.50 73.62 31.14Q73.39 29.78 73.17 28.34Q72.94 26.90 72.69 24.92L72.69 24.92Q72.46 23.51 72.24 21.74Q72.02 19.96 71.82 18.22Q71.63 16.47 71.57 15.13L71.57 15.13Q71.47 13.94 71.42 12.81Q71.38 11.67 71.38 10.62L71.38 10.62L71.38 0.92L78.90 0.92L78.90 39L70.58 39L67.63 29.11Q67.31 28.09 66.90 26.55Q66.48 25.02 66.02 23.27Q65.55 21.53 65.17 19.83L65.17 19.83Q64.62 17.50 64.08 15.02Q63.54 12.54 63.12 10.14L63.12 10.14Q62.90 8.98 62.70 7.86Q62.51 6.74 62.35 5.72L62.35 5.72L61.71 5.72Q62.03 7.80 62.42 10.12Q62.80 12.44 63.18 15.03L63.18 15.03Q63.50 17.53 63.82 20.07Q64.14 22.62 64.34 25.05L64.34 25.05Q64.40 26.26 64.45 27.43Q64.50 28.60 64.50 29.69ZM81.78 19.74L81.78 19.74Q81.78 16.12 82.45 13.06Q83.12 10.01 84.50 7.67L84.50 7.67Q87.22 3 92.40 1.40L92.40 1.40Q95.02 0.60 98.16 0.60L98.16 0.60Q101.23 0.60 103.87 1.40Q106.51 2.20 108.50 3.77L108.50 3.77Q112.50 7 113.84 12.98L113.84 12.98Q114.16 14.52 114.34 16.20Q114.51 17.88 114.51 19.74L114.51 19.74Q114.51 23.42 113.84 26.55Q113.17 29.69 111.82 32.09L111.82 32.09Q109.10 36.92 103.95 38.49L103.95 38.49Q101.30 39.32 98.16 39.32L98.16 39.32Q91.79 39.32 87.79 36.09L87.79 36.09Q85.84 34.52 84.48 32.06Q83.12 29.59 82.48 26.62L82.48 26.62Q82.13 25.08 81.95 23.35Q81.78 21.62 81.78 19.74ZM89.30 19.80L89.30 19.80Q89.30 22.04 89.68 24.02Q90.06 26.01 90.80 27.45L90.80 27.45Q91.63 29.18 92.78 30.10Q93.94 31.03 95.06 31.45L95.06 31.45Q96.46 31.96 98.19 31.96L98.19 31.96Q99.79 31.96 101.20 31.46Q102.61 30.97 103.73 29.91L103.73 29.91Q104.78 28.92 105.50 27.43Q106.22 25.94 106.61 24.06L106.61 24.06Q106.99 22.14 106.99 19.80L106.99 19.80Q106.99 17.66 106.61 15.74Q106.22 13.82 105.52 12.38L105.52 12.38Q104.02 9.50 101.26 8.47L101.26 8.47Q99.89 7.96 98.19 7.96L98.19 7.96Q94.83 7.96 92.62 9.94L92.62 9.94Q91.50 11 90.78 12.42Q90.06 13.85 89.68 15.67L89.68 15.67Q89.30 17.53 89.30 19.80Z"/></g></g></svg>`;
const STATEMENT_LOGO_DARK_SVG = STATEMENT_LOGO_SVG.replace(
  /#FFFFFF/gi,
  "#0B1930"
);

type ViewType = "week" | "month";

export default function TransactionsScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const {
    transactions,
    isLoading,
    fetchTransactions,
    addTransaction,
    deleteTransactions,
  } = useTransactionStore();
  const { categories, fetchCategories } = useCategoryStore();

  const [viewType, setViewType] = useState<ViewType>("month");
  const [periodOffset, setPeriodOffset] = useState(0); // 0 = current period, -1 = previous, 1 = next
  const [showViewDropdown, setShowViewDropdown] = useState(false);
  const [chartMode, setChartMode] = useState<"expense" | "income">("expense");
  const [activeTooltip, setActiveTooltip] = useState<
    "import" | "export" | null
  >(null);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isExporting, setIsExporting] = useState(false);

  // Fetch transactions and categories on mount and when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (user?.id) {
        fetchTransactions(user.id);
        fetchCategories(user.id);
      }
    }, [user?.id, fetchTransactions, fetchCategories])
  );

  // Helper function to format date as YYYY-MM-DD in local timezone
  const formatDateLocal = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Calculate current period (week or month) based on offset
  const currentPeriod = useMemo(() => {
    const now = new Date();
    const periodStart = new Date(now);

    if (viewType === "week") {
      // Get start of current week (Sunday)
      const day = periodStart.getDay();
      periodStart.setDate(periodStart.getDate() - day);
      periodStart.setHours(0, 0, 0, 0);

      // Apply offset
      periodStart.setDate(periodStart.getDate() + periodOffset * 7);

      const periodEnd = new Date(periodStart);
      periodEnd.setDate(periodEnd.getDate() + 6);
      periodEnd.setHours(23, 59, 59, 999);

      return { start: periodStart, end: periodEnd };
    } else {
      // Get start of current month
      periodStart.setDate(1);
      periodStart.setHours(0, 0, 0, 0);

      // Apply offset
      periodStart.setMonth(periodStart.getMonth() + periodOffset);

      const periodEnd = new Date(periodStart);
      periodEnd.setMonth(periodEnd.getMonth() + 1);
      periodEnd.setDate(0); // Last day of month
      periodEnd.setHours(23, 59, 59, 999);

      return { start: periodStart, end: periodEnd };
    }
  }, [viewType, periodOffset]);

  // Get category name by ID (define before useMemo)
  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId) return "Uncategorized";
    const category = categories.find((cat) => cat.id === categoryId);
    return category?.name || "Unknown";
  };

  // Filter transactions for current period
  const filteredTransactions = useMemo(() => {
    const { start, end } = currentPeriod;
    // Normalize dates to compare properly (ignore time component) - use local timezone
    const startDateStr = formatDateLocal(start);
    const endDateStr = formatDateLocal(end);

    return transactions.filter((txn) => {
      // Transaction date is already in YYYY-MM-DD format
      const txnDateStr = txn.date.split("T")[0]; // Handle potential timestamp
      return txnDateStr >= startDateStr && txnDateStr <= endDateStr;
    });
  }, [transactions, currentPeriod]);

  // Prepare chart data
  const chartData = useMemo(() => {
    const { start, end } = currentPeriod;
    const days: {
      [key: string]: { expense: number; income: number };
    } = {};

    // Initialize all days in period with 0 - use local timezone
    const startDateStr = formatDateLocal(start);
    const endDateStr = formatDateLocal(end);
    const current = new Date(start);
    const endDate = new Date(end);

    while (current <= endDate) {
      const dateKey = formatDateLocal(current);
      days[dateKey] = { expense: 0, income: 0 };
      current.setDate(current.getDate() + 1);
    }

    // Sum expenses for each day
    filteredTransactions.forEach((txn) => {
      const dateKey = txn.date.split("T")[0];
      if (days[dateKey] !== undefined) {
        if (txn.is_expense) {
          days[dateKey].expense += Number(txn.amount) || 0;
        } else {
          days[dateKey].income += Number(txn.amount) || 0;
        }
      }
    });

    // Format for chart - only include days with transactions or all days for week view
    let dayEntries: Array<[string, { expense: number; income: number }]> = [];

    if (viewType === "week") {
      // For week view, show all 7 days
      dayEntries = Object.entries(days).sort((a, b) =>
        a[0].localeCompare(b[0])
      );
    } else {
      // For month view, only show days that have transactions (non-zero amounts)
      dayEntries = Object.entries(days)
        .filter(([_, amount]) =>
          chartMode === "expense" ? amount.expense > 0 : amount.income > 0
        )
        .sort((a, b) => a[0].localeCompare(b[0]));
    }

    let chartDataPoints: Array<{ value: number; label: string }> = [];

    if (viewType === "week") {
      chartDataPoints = dayEntries.map(([date, amount]) => {
        const d = new Date(date + "T00:00:00"); // Add time to avoid timezone issues
        return {
          value: chartMode === "expense" ? amount.expense : amount.income,
          label: d.toLocaleDateString("en-US", { weekday: "short" }),
        };
      });
    } else {
      // For month view, show all days with transactions
      // If there are many days, we might need to limit labels to prevent crowding
      chartDataPoints = dayEntries.map(([date, amount]) => {
        const d = new Date(date + "T00:00:00"); // Add time to avoid timezone issues
        // Use M/D format (e.g., "11/5") for month view
        return {
          value: chartMode === "expense" ? amount.expense : amount.income,
          label: `${d.getMonth() + 1}/${d.getDate()}`,
        };
      });
    }

    return chartDataPoints;
  }, [filteredTransactions, viewType, currentPeriod, chartMode]);

  // Format period label
  const periodLabel = useMemo(() => {
    const { start, end } = currentPeriod;
    if (viewType === "week") {
      return `${start.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })} - ${end.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: start.getFullYear() !== end.getFullYear() ? "numeric" : undefined,
      })}`;
    } else {
      return start.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });
    }
  }, [currentPeriod, viewType]);

  // Group transactions by date for list display
  const groupedTransactions = useMemo(() => {
    const groups: { [key: string]: typeof filteredTransactions } = {};

    filteredTransactions.forEach((transaction) => {
      const dateKey = transaction.date;
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(transaction);
    });

    // Sort dates descending (newest first)
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
  }, [filteredTransactions]);

  const toggleSelectMode = () => {
    setActiveTooltip(null);
    setSelectMode((prev) => {
      if (prev) {
        setSelectedIds(new Set());
      }
      return !prev;
    });
  };

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectAllCurrent = () => {
    if (!selectMode) return;
    const ids = groupedTransactions.flatMap(([_, dateTxns]) =>
      dateTxns.map((txn) => txn.id)
    );
    setSelectedIds(new Set(ids));
  };

  const periodStartStr = useMemo(
    () => formatDateLocal(currentPeriod.start),
    [currentPeriod.start]
  );

  const totalIncomePeriod = useMemo(() => {
    return filteredTransactions
      .filter((txn) => !txn.is_expense)
      .reduce((sum, txn) => sum + Number(txn.amount || 0), 0);
  }, [filteredTransactions]);

  const totalExpensesPeriod = useMemo(() => {
    return filteredTransactions
      .filter((txn) => txn.is_expense)
      .reduce((sum, txn) => sum + Number(txn.amount || 0), 0);
  }, [filteredTransactions]);

  const netChangePeriod = totalIncomePeriod - totalExpensesPeriod;

  const openingBalance = useMemo(() => {
    return transactions
      .filter((txn) => txn.date.split("T")[0] < periodStartStr)
      .reduce(
        (sum, txn) =>
          sum +
          (txn.is_expense ? -Number(txn.amount || 0) : Number(txn.amount || 0)),
        0
      );
  }, [transactions, periodStartStr]);

  const closingBalance = openingBalance + netChangePeriod;

  const handleExportCurrentPeriod = async () => {
    if (isExporting) return;
    if (!filteredTransactions.length) {
      Alert.alert(
        "Nothing to export",
        "There are no transactions in this period."
      );
      return;
    }

    try {
      setIsExporting(true);
      setActiveTooltip(null);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      const buildPdfHtml = () => {
        const formatter = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          minimumFractionDigits: 2,
        });

        const formatCurrency = (value: number) => formatter.format(value);
        const statementLogoUri = `data:image/svg+xml;utf8,${encodeURIComponent(
          STATEMENT_LOGO_DARK_SVG
        )}`;

        const accountEmail = user?.email ?? "—";
        const rows = filteredTransactions
          .map((txn) => {
            const date = txn.date.split("T")[0];
            const description = txn.description || "—";
            const categoryName = getCategoryName(txn.category_id);
            const typeLabel = txn.is_expense ? "Expense" : "Income";
            const amountValue =
              Number(txn.amount || 0) * (txn.is_expense ? -1 : 1);
            const amount = formatCurrency(amountValue);

            return `<tr>
              <td>${date}</td>
              <td>${description}</td>
              <td>${categoryName}</td>
              <td>${typeLabel}</td>
              <td class="amount ${
                txn.is_expense ? "expense" : "income"
              }">${amount}</td>
            </tr>`;
          })
          .join("");

        return `
          <html>
            <head>
              <meta name="viewport" content="width=device-width, initial-scale=1.0" />
              <meta charset="utf-8" />
              <style>
                body {
                  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
                  margin: 24px;
                  color: #111;
                  background: #fff;
                }
                .letterhead {
                  display: flex;
                  gap: 200px;
                  align-items: flex-start;
                  margin-bottom: 24px;
                }
                .logo-column {
                  flex: 0 0 200px;
                  display: flex;
                  flex-direction: column;
                  gap: 8px;
                  align-items: flex-start;
                }
                .logo-column img {
                  width: 170px;
                  height: auto;
                }
                .details-column {
                  flex: 1;
                }
                .statement-header {
                  display: flex;
                  flex-direction: column;
                  border-bottom: 1px solid #111;
                  padding-bottom: 12px;
                  margin-bottom: 16px;
                  align-items: flex-end;
                  text-align: right;
                }
                h1 {
                  font-size: 24px;
                  margin: 0;
                  letter-spacing: 1px;
                }
                .meta {
                  color: #0d5f94;
                  font-weight: 600;
                  margin-top: 4px;
                }
                .date-range {
                  font-size: 12px;
                  color: #777;
                  margin-top: 2px;
                }
                .section-title {
                  text-transform: uppercase;
                  font-size: 12px;
                  letter-spacing: 0.8px;
                  font-weight: 700;
                  color: #3b3b3b;
                  border-bottom: 1px solid #c9ced6;
                  padding-bottom: 6px;
                  margin-top: 0;
                  margin-bottom: 4px;
                }
                .details-table,
                .summary-table {
                  width: 100%;
                  border-collapse: collapse;
                  font-size: 12px;
                  margin-bottom: 12px;
                }
                .details-table td,
                .summary-table td {
                  padding: 8px 0;
                  border-bottom: 1px solid #eceff3;
                }
                .details-table td:first-child {
                  color: #555;
                  font-weight: 500;
                  width: 45%;
                }
                .summary-table td:first-child {
                  color: #555;
                  font-weight: 500;
                }
                .details-table td:last-child {
                  text-align: right;
                  font-weight: 600;
                }
                .summary-table td:last-child {
                  text-align: right;
                  font-weight: 600;
                }
                .summary-table .closing td {
                  font-weight: 700;
                  border-bottom: none;
                }
                p {
                  color: #555;
                  margin-top: 0;
                }
                table {
                  width: 100%;
                  border-collapse: collapse;
                  margin-top: 16px;
                }
                th, td {
                  text-align: left;
                  padding: 10px;
                  border-bottom: 1px solid #ececec;
                  font-size: 12px;
                }
                th {
                  font-size: 12px;
                  text-transform: uppercase;
                  letter-spacing: 0.5px;
                  color: #777;
                  background: #fafafa;
                }
                .amount {
                  font-weight: 600;
                  text-align: right;
                  white-space: nowrap;
                }
                .income {
                  color: #0f9d58;
                }
                .expense {
                  color: #d93025;
                }
                .footer-note {
                  margin-top: 32px;
                  font-size: 12px;
                  color: #888;
                  text-align: right;
                }
              </style>
            </head>
            <body>
              <div class="letterhead">
                <div class="logo-column">
                  <img src="${statementLogoUri}" alt="Nano Budget logo" />
                  <strong style="font-size:32px; color:#000; margin-bottom:10px;">Budgeting</strong>
                </div>
                <div class="details-column">
                  <div class="statement-header">
                    <h1>ACCOUNT STATEMENT</h1>
                    <div class="meta">For period: ${periodLabel}</div>
                  </div>
                  <div>
                    <p class="section-title">Account Details</p>
                    <table class="details-table">
                      <tbody>
                        <tr>
                          <td>Account Email</td>
                          <td>${accountEmail}</td>
                        </tr>
                        <tr>
                          <td>Account Currency</td>
                          <td>USD</td>
                        </tr>
                        <tr>
                          <td>Account Type</td>
                          <td>Personal Budget</td>
                        </tr>
                      </tbody>
                    </table>
                    <p class="section-title">Account Summary</p>
                    <table class="summary-table">
                      <tbody>
                        <tr>
                          <td>Opening Balance</td>
                          <td>${formatCurrency(openingBalance)}</td>
                        </tr>
                        <tr>
                          <td>Total Money In</td>
                          <td>+ ${formatCurrency(totalIncomePeriod)}</td>
                        </tr>
                        <tr>
                          <td>Total Money Out</td>
                          <td>- ${formatCurrency(totalExpensesPeriod)}</td>
                        </tr>
                        <tr>
                          <td>Net Change</td>
                          <td>${formatCurrency(netChangePeriod)}</td>
                        </tr>
                        <tr class="closing">
                          <td>Ending Balance</td>
                          <td>${formatCurrency(closingBalance)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Category</th>
                    <th>Type</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  ${rows}
                </tbody>
              </table>
              <div class="footer-note">Nano Budget • Generated electronically • Confidential</div>
            </body>
          </html>
        `;
      };

      const { uri } = await Print.printToFileAsync({
        html: buildPdfHtml(),
      });

      const canShare = await Sharing.isAvailableAsync();

      if (!canShare) {
        Alert.alert(
          "PDF ready",
          "Sharing is not available on this device. Please open the PDF from your Files app."
        );
        return;
      }

      await Sharing.shareAsync(uri, {
        mimeType: "application/pdf",
        dialogTitle: "Share transactions PDF",
        UTI: "com.adobe.pdf",
      });
    } catch (error: any) {
      console.error("Export failed:", error);
      Alert.alert(
        "Export failed",
        error?.message || "Unable to generate the PDF."
      );
    } finally {
      setIsExporting(false);
      setActiveTooltip(null);
    }
  };

  const handleDeleteSelected = () => {
    if (selectedIds.size === 0) return;
    Alert.alert(
      "Delete transactions",
      `Delete ${selectedIds.size} transaction${
        selectedIds.size === 1 ? "" : "s"
      }?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              await deleteTransactions(Array.from(selectedIds));
              setSelectedIds(new Set());
              setSelectMode(false);
            } catch (error: any) {
              Alert.alert(
                "Delete failed",
                error?.message || "Unable to delete transactions."
              );
            }
          },
        },
      ]
    );
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    // Parse date string (YYYY-MM-DD) in local timezone
    const [year, month, day] = dateString.split("T")[0].split("-").map(Number);
    const date = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Compare dates without time
    const dateOnly = new Date(date);
    dateOnly.setHours(0, 0, 0, 0);

    if (dateOnly.getTime() === today.getTime()) {
      return "Today";
    } else if (dateOnly.getTime() === yesterday.getTime()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year:
          date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
      });
    }
  };

  const styles = useMemo(
    () =>
      StyleSheet.create({
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
          backgroundColor: theme.background,
        },
        header: {
          gap: 8,
        },
        headerActions: {
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
        },
        selectionBanner: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          padding: 12,
          borderRadius: 12,
          backgroundColor: theme.surfaceHighlight,
          borderWidth: 0.5,
          borderColor: theme.divider,
          marginBottom: 12,
        },
        selectionBannerText: {
          fontSize: 14,
          fontWeight: "600",
          color: theme.text,
        },
        selectionActions: {
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
        },
        selectionActionButton: {
          paddingVertical: 6,
          paddingHorizontal: 12,
          borderRadius: 999,
          borderWidth: 0.5,
          borderColor: theme.divider,
          backgroundColor: theme.surface,
        },
        selectionActionText: {
          fontSize: 13,
          fontWeight: "600",
          color: theme.text,
        },
        iconButton: {
          padding: 8,
          borderRadius: 999,
          borderWidth: 0.5,
          borderColor: theme.divider,
          backgroundColor: theme.surface,
        },
        tooltip: {
          position: "absolute",
          top: 40,
          right: 0,
          paddingVertical: 6,
          paddingHorizontal: 12,
          borderRadius: 8,
          backgroundColor: theme.surfaceHighlight,
          borderWidth: 0.5,
          borderColor: theme.divider,
          shadowColor: "#000",
          shadowOpacity: 0.1,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 4 },
          elevation: 2,
        },
        tooltipText: {
          fontSize: 12,
          color: theme.textSecondary,
        },
        title: {
          fontSize: 24,
          fontWeight: "700",
          color: theme.text,
        },
        content: {
          flex: 1,
          paddingHorizontal: 6,
          backgroundColor: theme.background,
        },
        emptyStateWrapper: {
          borderRadius: 16,
          marginTop: 40,
          overflow: "hidden",
          borderWidth: 0.5,
          borderColor: theme.divider,
          backgroundColor: theme.surface,
        },
        emptyState: {
          padding: 48,
          alignItems: "center",
        },
        emptyText: {
          fontSize: 16,
          fontWeight: "600",
          color: theme.textSecondary,
          marginBottom: 8,
        },
        emptySubtext: {
          fontSize: 14,
          color: theme.textTertiary,
          textAlign: "center",
          maxWidth: 250,
        },
        transactionGroup: {
          marginBottom: 24,
        },
        dateHeader: {
          fontSize: 14,
          fontWeight: "600",
          color: theme.textSecondary,
          marginBottom: 12,
          marginTop: 8,
        },
        transactionItemWrapper: {
          borderRadius: 12,
          marginBottom: 8,
          overflow: "hidden",
          borderWidth: 0.5,
          borderColor: theme.divider,
          backgroundColor: theme.surface,
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
        transactionDescription: {
          fontSize: 16,
          fontWeight: "600",
          color: theme.text,
          marginBottom: 4,
        },
        transactionMeta: {
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
        },
        transactionCategory: {
          fontSize: 13,
          color: theme.textSecondary,
        },
        transactionAccount: {
          fontSize: 13,
          color: theme.textTertiary,
        },
        transactionAmount: {
          fontSize: 18,
          fontWeight: "700",
        },
        loadingContainer: {
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingTop: 100,
        },
        chartContainer: {
          marginBottom: 24,
          borderRadius: 0,
          overflow: "hidden",
          backgroundColor: "transparent",
        },
        chartHeader: {
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: 0,
          paddingTop: 0,
          paddingBottom: 20,
          marginBottom: 8,
        },
        chartNav: {
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
        },
        chartNavButton: {
          padding: 4,
        },
        chartPeriod: {
          fontSize: 15,
          fontWeight: "500",
          color: theme.text,
        },
        chartViewToggle: {
          flexDirection: "row",
          backgroundColor: theme.surface,
          borderRadius: 6,
          padding: 2,
          borderWidth: 0.5,
          borderColor: theme.divider,
          minWidth: 100,
        },
        chartViewButton: {
          paddingHorizontal: 10,
          paddingVertical: 4,
          borderRadius: 4,
          flex: 1,
          alignItems: "center",
        },
        chartViewButtonActive: {
          backgroundColor: theme.primary,
        },
        chartViewButtonText: {
          fontSize: 12,
          fontWeight: "500",
          color: theme.textSecondary,
        },
        chartViewButtonTextActive: {
          color: theme.background,
        },
        chartWrapper: {
          paddingHorizontal: 0,
          paddingBottom: 0,
          backgroundColor: "transparent",
        },
        chartViewDropdown: {
          position: "relative",
        },
        chartViewDropdownButton: {
          flexDirection: "row",
          alignItems: "center",
          gap: 4,
          paddingVertical: 4,
          paddingHorizontal: 8,
        },
        chartViewDropdownText: {
          fontSize: 14,
          fontWeight: "500",
          color: theme.text,
        },
        chartViewDropdownMenuWrapper: {
          position: "absolute",
          top: 28,
          right: 0,
          borderRadius: 8,
          overflow: "hidden",
          minWidth: 100,
          zIndex: 1000,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 5,
          borderWidth: 0.5,
          borderColor: theme.divider,
        },
        chartViewDropdownMenu: {
          backgroundColor: theme.surface,
        },
        chartViewDropdownMenuItem: {
          paddingVertical: 12,
          paddingHorizontal: 16,
          borderBottomWidth: 0.5,
          borderBottomColor: theme.divider,
        },
        chartViewDropdownMenuItemLast: {
          borderBottomWidth: 0,
        },
        chartViewDropdownMenuItemText: {
          fontSize: 14,
          fontWeight: "500",
          color: theme.text,
        },
        emptyChartState: {
          height: 200,
          alignItems: "center",
          justifyContent: "center",
        },
        emptyChartText: {
          fontSize: 14,
          color: theme.textSecondary,
        },
        chartActions: {
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
        },
        chartModeIconButton: {
          width: 32,
          height: 32,
          borderRadius: 20,
          alignItems: "center",
          justifyContent: "center",
          borderWidth: 1,
          borderColor: theme.divider,
        },
        chartModeIconExpense: {
          backgroundColor: theme.expense,
          borderColor: theme.expense,
        },
        chartModeIconIncome: {
          backgroundColor: theme.income,
          borderColor: theme.income,
        },
      }),
    [theme, insets]
  );

  const headerHeight = Platform.OS === "ios" ? insets.top + 80 : 100;
  const stickyHeaderStyle = [
    styles.stickyHeader,
    { paddingTop: Platform.OS === "ios" ? insets.top + 20 : 40 },
  ];

  const contentContainerStyle = useMemo(
    () => ({
      paddingTop: headerHeight,
      paddingBottom: Platform.OS === "ios" ? insets.bottom + 20 : 20,
      paddingHorizontal: 20,
    }),
    [headerHeight, insets.bottom]
  );

  return (
    <View style={styles.container}>
      {/* Sticky Header */}
      <View style={stickyHeaderStyle}>
        <View style={styles.header}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Text style={styles.title}>
              {selectMode ? "Select transactions" : "Transactions"}
            </Text>
            <View style={styles.headerActions}>
              {selectMode ? (
                <Pressable
                  style={styles.iconButton}
                  onPress={toggleSelectMode}
                  hitSlop={10}
                >
                  <Text style={{ color: theme.text }}>Cancel</Text>
                </Pressable>
              ) : (
                <>
                  <Pressable
                    style={styles.iconButton}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      toggleSelectMode();
                    }}
                    hitSlop={10}
                  >
                    <Text style={{ color: theme.text }}>Select</Text>
                  </Pressable>
                  <Pressable
                    style={styles.iconButton}
                    onPress={handleExportCurrentPeriod}
                    disabled={isExporting || filteredTransactions.length === 0}
                    onLongPress={() => setActiveTooltip("export")}
                    onPressOut={() => setActiveTooltip(null)}
                    hitSlop={10}
                  >
                    {isExporting ? (
                      <ActivityIndicator size="small" color={theme.text} />
                    ) : (
                      <Download
                        size={20}
                        color={
                          filteredTransactions.length
                            ? theme.text
                            : theme.textSecondary
                        }
                      />
                    )}
                  </Pressable>
                  <Pressable
                    style={styles.iconButton}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setActiveTooltip(null);
                      router.push("/import-csv");
                    }}
                    onLongPress={() => setActiveTooltip("import")}
                    onPressOut={() => setActiveTooltip(null)}
                    hitSlop={10}
                  >
                    <UploadCloud size={20} color={theme.text} />
                  </Pressable>
                </>
              )}
            </View>
          </View>
          {activeTooltip && !selectMode && (
            <View style={styles.tooltip}>
              <Text style={styles.tooltipText}>
                {activeTooltip === "import" ? "Import from CSV" : "Share PDF"}
              </Text>
            </View>
          )}
          {selectMode && (
            <View style={styles.selectionBanner}>
              <Text style={styles.selectionBannerText}>
                {selectedIds.size} selected
              </Text>
              <View style={styles.selectionActions}>
                <Pressable
                  style={styles.selectionActionButton}
                  onPress={handleSelectAllCurrent}
                >
                  <Text style={styles.selectionActionText}>Select all</Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.selectionActionButton,
                    { backgroundColor: theme.expense + "15" },
                  ]}
                  onPress={handleDeleteSelected}
                >
                  <Text
                    style={[
                      styles.selectionActionText,
                      { color: theme.expense },
                    ]}
                  >
                    Delete
                  </Text>
                </Pressable>
              </View>
            </View>
          )}
        </View>
      </View>

      {/* Scrollable Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={contentContainerStyle}
        onScrollBeginDrag={() => {
          // Close dropdown when scrolling
          if (showViewDropdown) {
            setShowViewDropdown(false);
          }
        }}
      >
        {/* Chart Section */}
        {transactions.length > 0 && (
          <View style={styles.chartContainer}>
            <View style={styles.chartHeader}>
              {/* Date Selector - Left */}
              <View style={styles.chartNav}>
                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setPeriodOffset(periodOffset - 1);
                  }}
                  style={styles.chartNavButton}
                >
                  <ChevronLeft size={18} color={theme.text} />
                </Pressable>
                <Text style={styles.chartPeriod}>{periodLabel}</Text>
                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setPeriodOffset(periodOffset + 1);
                  }}
                  style={styles.chartNavButton}
                >
                  <ChevronRight size={18} color={theme.text} />
                </Pressable>
              </View>

              {/* Actions - mode toggle + view selector */}
              <View style={styles.chartActions}>
                <Pressable
                  style={[
                    styles.chartModeIconButton,
                    chartMode === "expense"
                      ? styles.chartModeIconExpense
                      : styles.chartModeIconIncome,
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setChartMode(
                      chartMode === "expense" ? "income" : "expense"
                    );
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`Show ${
                    chartMode === "expense" ? "income" : "expenses"
                  } in chart`}
                >
                  {chartMode === "expense" ? (
                    <ArrowDownRight size={18} color={theme.background} />
                  ) : (
                    <ArrowUpRight size={18} color={theme.background} />
                  )}
                </Pressable>
                <View style={styles.chartViewDropdown}>
                  <Pressable
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setShowViewDropdown(!showViewDropdown);
                    }}
                    style={styles.chartViewDropdownButton}
                  >
                    <Text style={styles.chartViewDropdownText}>
                      {viewType === "week" ? "Week" : "Month"}
                    </Text>
                    <ChevronDown size={16} color={theme.textSecondary} />
                  </Pressable>
                  {showViewDropdown && (
                    <View style={styles.chartViewDropdownMenuWrapper}>
                      <View style={styles.chartViewDropdownMenu}>
                        <Pressable
                          onPress={() => {
                            Haptics.impactAsync(
                              Haptics.ImpactFeedbackStyle.Light
                            );
                            setViewType("week");
                            setPeriodOffset(0);
                            setShowViewDropdown(false);
                          }}
                          style={[
                            styles.chartViewDropdownMenuItem,
                            viewType === "week" && {
                              backgroundColor: theme.surfaceHighlight,
                            },
                          ]}
                        >
                          <Text style={styles.chartViewDropdownMenuItemText}>
                            Week
                          </Text>
                        </Pressable>
                        <Pressable
                          onPress={() => {
                            Haptics.impactAsync(
                              Haptics.ImpactFeedbackStyle.Light
                            );
                            setViewType("month");
                            setPeriodOffset(0);
                            setShowViewDropdown(false);
                          }}
                          style={[
                            styles.chartViewDropdownMenuItem,
                            styles.chartViewDropdownMenuItemLast,
                            viewType === "month" && {
                              backgroundColor: theme.surfaceHighlight,
                            },
                          ]}
                        >
                          <Text style={styles.chartViewDropdownMenuItemText}>
                            Month
                          </Text>
                        </Pressable>
                      </View>
                    </View>
                  )}
                </View>
              </View>
            </View>
            <View style={styles.chartWrapper}>
              {chartData.length === 0 ? (
                <View style={styles.emptyChartState}>
                  <Text style={styles.emptyChartText}>
                    {chartMode === "expense"
                      ? "No expenses in this period"
                      : "No income in this period"}
                  </Text>
                </View>
              ) : (
                (() => {
                  const screenWidth = Dimensions.get("window").width;
                  const chartWidth = screenWidth - 40; // Account for padding
                  const dataPoints = chartData.length;

                  // Calculate dynamic bar width and spacing to use full width
                  let barWidth: number;
                  let spacing: number;

                  if (viewType === "week") {
                    // For week (7 days), use fixed spacing
                    spacing = 8;
                    barWidth = Math.max(
                      20,
                      (chartWidth - (dataPoints - 1) * spacing - 60) /
                        Math.max(dataPoints, 1)
                    );
                  } else {
                    // For month, calculate based on number of data points (should be ~4-5 for 7 days apart)
                    spacing = 12;
                    barWidth = Math.max(
                      25,
                      (chartWidth - (dataPoints - 1) * spacing - 60) /
                        Math.max(dataPoints, 1)
                    );
                  }

                  const chartMax =
                    chartData.length > 0
                      ? Math.max(...chartData.map((entry) => entry.value), 0) *
                          1.1 || 100
                      : 100;

                  const chartColor =
                    chartMode === "expense" ? theme.expense : theme.income;

                  return (
                    <BarChart
                      key={`chart-${chartMode}-${viewType}-${
                        chartData.length
                      }-${JSON.stringify(chartData.map((d) => d.value))}`}
                      data={chartData}
                      width={chartWidth}
                      height={200}
                      barWidth={barWidth}
                      spacing={spacing}
                      frontColor={chartColor}
                      gradientColor={chartColor}
                      showGradient
                      isAnimated
                      animationDuration={800}
                      noOfSections={4}
                      maxValue={chartMax}
                      yAxisThickness={0.5}
                      xAxisThickness={0.5}
                      yAxisTextStyle={{
                        color: theme.textSecondary,
                        fontSize: 11,
                        fontWeight: "400",
                      }}
                      xAxisLabelTextStyle={{
                        color: theme.textSecondary,
                        fontSize: 10,
                        fontWeight: "400",
                      }}
                      rulesColor={theme.divider}
                      rulesType="solid"
                      showYAxisIndices={false}
                      showXAxisIndices={false}
                      formatYLabel={(value) =>
                        `$${Math.round(parseFloat(value))}`
                      }
                      showValuesAsTopLabel={false}
                      barBorderTopLeftRadius={4}
                      barBorderTopRightRadius={4}
                      backgroundColor="transparent"
                    />
                  );
                })()
              )}
            </View>
          </View>
        )}

        {isLoading && transactions.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.primary} />
          </View>
        ) : filteredTransactions.length === 0 ? (
          <View style={styles.emptyStateWrapper}>
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                {transactions.length === 0
                  ? "No transactions yet"
                  : "No transactions in this period"}
              </Text>
              <Text style={styles.emptySubtext}>
                {transactions.length === 0
                  ? "Import transactions from CSV or add them manually to get started"
                  : "Change the period or add new transactions"}
              </Text>
            </View>
          </View>
        ) : (
          groupedTransactions.map(([dateKey, dateTransactions]) => (
            <View key={dateKey} style={styles.transactionGroup}>
              <Text style={styles.dateHeader}>{formatDate(dateKey)}</Text>
              {dateTransactions.map((transaction) => (
                <Pressable
                  key={transaction.id}
                  style={[
                    styles.transactionItemWrapper,
                    selectedIds.has(transaction.id) && {
                      borderColor: theme.primary,
                      borderWidth: 1,
                    },
                  ]}
                  onPress={() => {
                    if (selectMode) {
                      toggleSelection(transaction.id);
                      return;
                    }
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.push({
                      pathname: "/transaction-detail",
                      params: { id: transaction.id },
                    });
                  }}
                  onLongPress={() => {
                    if (!selectMode) {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      setSelectMode(true);
                      setSelectedIds(new Set([transaction.id]));
                    }
                  }}
                >
                  <View style={styles.transactionItem}>
                    <View style={styles.transactionLeft}>
                      <Text style={styles.transactionDescription}>
                        {transaction.description || "No description"}
                      </Text>
                      <View style={styles.transactionMeta}>
                        <Text style={styles.transactionCategory}>
                          {getCategoryName(transaction.category_id)}
                        </Text>
                        {transaction.account && (
                          <>
                            <Text style={{ color: theme.textTertiary }}>•</Text>
                            <Text style={styles.transactionAccount}>
                              {transaction.account}
                            </Text>
                          </>
                        )}
                      </View>
                    </View>
                    <Text
                      style={[
                        styles.transactionAmount,
                        {
                          color: transaction.is_expense
                            ? theme.expense
                            : theme.income,
                        },
                      ]}
                    >
                      {transaction.is_expense ? "-" : "+"}$
                      {transaction.amount.toFixed(2)}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>
          ))
        )}
      </ScrollView>

      {/* FAB Button */}
      <FABButton
        onPress={() => {
          router.push("/add-transaction");
        }}
      />
    </View>
  );
}
